import { ChannelType, type Client, type TextChannel } from "discord.js";
import {
  findDailyQuestionByKey,
  getDailyAnswer,
  listAllDailyQuestions,
  listGuildsWithDailyQuestionEnabled,
  markGuildDailyQuestionPosted,
  recordDailyAnswer,
} from "../database/repositories/dailyQuestionRepository.js";
import { getManagedResources } from "../database/repositories/guildRepository.js";
import { HUB_CATEGORY } from "../setup/resources.js";
import { AppError } from "../utils/errors.js";
import { todayUtc } from "../utils/date.js";
import { childLogger } from "../utils/logger.js";
import { shuffleChoices } from "../utils/quizShuffle.js";
import { buildDailyQuestionPost } from "./dailyQuestionView.js";

const log = childLogger("dailyQuestionService");

const HUB_CHANNEL_KEY = HUB_CATEGORY.channels[0]!.key;

interface DailyQuestionRow {
  key: string;
  category: string;
  prompt: string;
  choices: string; // JSON
  correctIndex: number;
  explanation: string;
}

function parseChoices(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Sélectionne la question du jour de façon déterministe (même question pour
 * tout le monde, toute la journée UTC, sans état à persister pour savoir
 * "laquelle a été tirée") : rotation par jour de l'année dans le catalogue.
 */
function dayOfYearUtc(date: Date): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const startOfDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((startOfDay - startOfYear) / 86_400_000);
}

export async function getTodaysQuestion(): Promise<DailyQuestionRow> {
  const questions = await listAllDailyQuestions();
  if (questions.length === 0) {
    throw new AppError("Aucune question du jour n'est disponible pour l'instant.");
  }
  const index = dayOfYearUtc(new Date()) % questions.length;
  return questions[index]!;
}

export function toDisplay(question: DailyQuestionRow) {
  const { choices } = shuffleChoices(question.key, parseChoices(question.choices), question.correctIndex);
  return {
    key: question.key,
    category: question.category,
    prompt: question.prompt,
    choices,
  };
}

export interface DailyAnswerResult {
  alreadyAnswered: boolean;
  correct: boolean;
  explanation: string;
}

export async function submitDailyAnswer(
  userId: string,
  guildId: string,
  questionKey: string,
  choiceIndex: number,
): Promise<DailyAnswerResult | null> {
  const question = await findDailyQuestionByKey(questionKey);
  if (!question) return null;

  const today = todayUtc();
  // La question est re-fetch ici, séparément de l'affichage — on doit
  // recalculer le même mélange (même clé) pour comparer au bon index.
  const { correctIndex } = shuffleChoices(question.key, parseChoices(question.choices), question.correctIndex);
  const correct = choiceIndex === correctIndex;
  const recorded = await recordDailyAnswer(userId, guildId, today, correct);

  if (!recorded) {
    const existing = await getDailyAnswer(userId, guildId, today);
    return { alreadyAnswered: true, correct: existing?.correct ?? false, explanation: question.explanation };
  }

  return { alreadyAnswered: false, correct, explanation: question.explanation };
}

/**
 * À appeler périodiquement (voir index.ts) : poste la question du jour dans
 * le salon hub de chaque guild qui l'a activée et ne l'a pas encore reçue
 * aujourd'hui. Idempotent — sûr à appeler toutes les X minutes.
 */
export async function checkAndPostDailyQuestions(client: Client): Promise<void> {
  const today = todayUtc();
  const configs = await listGuildsWithDailyQuestionEnabled();
  const pending = configs.filter((c) => c.lastDailyQuestionDate !== today);
  if (pending.length === 0) return;

  const question = await getTodaysQuestion();
  const post = buildDailyQuestionPost(toDisplay(question));

  for (const config of pending) {
    try {
      const guild = client.guilds.cache.get(config.guildId);
      if (!guild) continue; // bot n'est plus sur cette guild

      const managed = await getManagedResources(config.guildId);
      const hubChannelId = managed.channels[HUB_CHANNEL_KEY];
      if (!hubChannelId) continue; // /setup jamais lancé sur cette guild

      const channel = guild.channels.cache.get(hubChannelId);
      if (!channel || channel.type !== ChannelType.GuildText) continue;

      await (channel as TextChannel).send(post);
      await markGuildDailyQuestionPosted(config.guildId, today, question.key);
      log.info({ guildId: config.guildId }, "Question du jour postée");
    } catch (error) {
      log.warn({ err: error, guildId: config.guildId }, "Échec de la publication de la question du jour");
    }
  }
}
