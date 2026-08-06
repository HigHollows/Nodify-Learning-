import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type {
  CtfChallengeDetail,
  CtfChallengeSummary,
} from "./ctfService.js";
import type { CtfLeaderboardRow } from "../database/repositories/ctfRepository.js";
import { labelForLevelOrder } from "../utils/leveling.js";
import { baseContainer, containerPayload, fieldText, textDisplay, thinSeparator, type ContainerPayload } from "../ui/container.js";

export const CTF_SUBMIT_MODAL_ID = "ctf:submit_modal";
export const CTF_FLAG_INPUT_ID = "flag";

const COLOR_PURPLE = 0x9b59b6;
const COLOR_GREEN = 0x57f287;

function submitButtonCustomId(key: string): string {
  return `ctf:submit:${key}`;
}

/** Parse "ctf:submit:<key>" → key, pour le bouton qui ouvre le Modal de soumission. */
export function parseCtfSubmitButtonId(customId: string): string | null {
  if (!customId.startsWith("ctf:submit:")) return null;
  return customId.slice("ctf:submit:".length);
}

export function buildCtfListReply(challenges: CtfChallengeSummary[]): ContainerPayload {
  const container = baseContainer("🚩 Défis CTF Nodify", COLOR_PURPLE).addTextDisplayComponents(
    textDisplay(
      challenges.length > 0
        ? "Défis autonomes (pas besoin de cible en direct) — utilise `/cyber ctf challenge` pour voir le détail d'un défi."
        : "Aucun défi disponible pour l'instant.",
    ),
  );

  if (challenges.length > 0) {
    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(
      textDisplay(
        challenges
          .map((c) =>
            fieldText(
              `${c.solved ? "✅" : "🔒"} ${c.title} — ${c.points} pts`,
              `Catégorie : ${c.category} · Difficulté : ${labelForLevelOrder(c.difficulty)} · Clé : \`${c.key}\``,
            ),
          )
          .join("\n\n"),
      ),
    );
  }

  return containerPayload(container);
}

export function buildCtfChallengeReply(challenge: CtfChallengeDetail): ContainerPayload {
  const container = baseContainer(`🚩 ${challenge.title}`, challenge.solved ? COLOR_GREEN : COLOR_PURPLE).addTextDisplayComponents(
    textDisplay(challenge.description),
    textDisplay(
      [
        fieldText("Catégorie", challenge.category),
        fieldText("Difficulté", labelForLevelOrder(challenge.difficulty)),
        fieldText("Points", `${challenge.points}`),
      ].join("\n"),
    ),
  );

  if (challenge.hint) {
    container.addTextDisplayComponents(textDisplay(fieldText("💡 Indice", challenge.hint)));
  }

  if (challenge.solved) {
    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(textDisplay("-# Déjà résolu — bravo !"));
    return containerPayload(container);
  }

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(submitButtonCustomId(challenge.key)).setLabel("🚩 Soumettre un flag").setStyle(ButtonStyle.Primary),
    ),
  );

  return containerPayload(container);
}

export function buildCtfSubmitModal(challengeKey: string): ModalBuilder {
  const input = new TextInputBuilder()
    .setCustomId(CTF_FLAG_INPUT_ID)
    .setLabel("Ta réponse")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200);

  return new ModalBuilder()
    .setCustomId(`${CTF_SUBMIT_MODAL_ID}:${challengeKey}`)
    .setTitle("Soumettre un flag")
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
}

export function buildCtfSubmitResultReply(
  correct: boolean,
  alreadySolved: boolean,
  points: number,
  achievementUnlocked: boolean,
) {
  if (alreadySolved) {
    return {
      content: "✅ Bonne réponse — mais tu avais déjà résolu ce défi, pas de points supplémentaires.",
    };
  }

  if (!correct) {
    return { content: "❌ Pas la bonne réponse, réessaie (relance la commande avec le même défi)." };
  }

  const lines = [`✅ **Flag validé !** +${points} points.`];
  if (achievementUnlocked) lines.push("🏆 Succès débloqué : **Premier flag capturé**");

  return { content: lines.join("\n") };
}

export function buildCtfLeaderboardReply(entries: CtfLeaderboardRow[]): ContainerPayload {
  const RANK_ICON: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  const description =
    entries.length === 0
      ? "Personne n'a encore résolu de défi CTF — sois le premier !"
      : entries
          .map((e, i) => `${RANK_ICON[i + 1] ?? `**#${i + 1}**`} **${e.username}** — ${e.totalPoints} pts (${e.solvedCount} défi(s))`)
          .join("\n");

  const container = baseContainer("🚩 Classement CTF", COLOR_PURPLE).addTextDisplayComponents(textDisplay(description));

  return containerPayload(container);
}
