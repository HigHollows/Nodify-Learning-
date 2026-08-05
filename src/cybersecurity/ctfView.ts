import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type {
  CtfChallengeDetail,
  CtfChallengeSummary,
} from "./ctfService.js";
import type { CtfLeaderboardRow } from "../database/repositories/ctfRepository.js";
import { labelForLevelOrder } from "../utils/leveling.js";

export const CTF_SUBMIT_MODAL_ID = "ctf:submit_modal";
export const CTF_FLAG_INPUT_ID = "flag";

function submitButtonCustomId(key: string): string {
  return `ctf:submit:${key}`;
}

/** Parse "ctf:submit:<key>" → key, pour le bouton qui ouvre le Modal de soumission. */
export function parseCtfSubmitButtonId(customId: string): string | null {
  if (!customId.startsWith("ctf:submit:")) return null;
  return customId.slice("ctf:submit:".length);
}

export function buildCtfListReply(challenges: CtfChallengeSummary[]) {
  const embed = new EmbedBuilder()
    .setTitle("🚩 Défis CTF Nodify")
    .setColor("Purple")
    .setDescription(
      challenges.length > 0
        ? "Défis autonomes (pas besoin de cible en direct) — utilise `/cyber ctf challenge` pour voir le détail d'un défi."
        : "Aucun défi disponible pour l'instant.",
    )
    .addFields(
      challenges.map((c) => ({
        name: `${c.solved ? "✅" : "🔒"} ${c.title} — ${c.points} pts`,
        value: `Catégorie : ${c.category} · Difficulté : ${labelForLevelOrder(c.difficulty)} · Clé : \`${c.key}\``,
      })),
    );

  return { embeds: [embed], components: [] };
}

export function buildCtfChallengeReply(challenge: CtfChallengeDetail) {
  const embed = new EmbedBuilder()
    .setTitle(`🚩 ${challenge.title}`)
    .setColor(challenge.solved ? "Green" : "Purple")
    .setDescription(challenge.description)
    .addFields(
      { name: "Catégorie", value: challenge.category, inline: true },
      { name: "Difficulté", value: labelForLevelOrder(challenge.difficulty), inline: true },
      { name: "Points", value: `${challenge.points}`, inline: true },
    );

  if (challenge.hint) {
    embed.addFields({ name: "💡 Indice", value: challenge.hint });
  }

  if (challenge.solved) {
    embed.setFooter({ text: "Déjà résolu — bravo !" });
    return { embeds: [embed], components: [] };
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(submitButtonCustomId(challenge.key))
      .setLabel("🚩 Soumettre un flag")
      .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
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

export function buildCtfLeaderboardReply(entries: CtfLeaderboardRow[]) {
  const RANK_ICON: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  const embed = new EmbedBuilder().setTitle("🚩 Classement CTF").setColor("Purple");

  if (entries.length === 0) {
    embed.setDescription("Personne n'a encore résolu de défi CTF — sois le premier !");
  } else {
    embed.setDescription(
      entries
        .map(
          (e, i) =>
            `${RANK_ICON[i + 1] ?? `**#${i + 1}**`} **${e.username}** — ${e.totalPoints} pts (${e.solvedCount} défi(s))`,
        )
        .join("\n"),
    );
  }

  return { embeds: [embed], components: [] };
}
