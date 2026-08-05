import type { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";

/**
 * Shape compatible aussi bien avec `interaction.reply()`/`.update()` qu'avec
 * `TextChannel.send()`/`Message.edit()` — contrairement à
 * `InteractionReplyOptions`, ne permet pas `flags`/`Ephemeral` (qui n'a pas
 * de sens hors d'une réponse à interaction). À utiliser pour toute vue
 * réutilisée par un bouton `.update()` ou par le panneau de statut persistant.
 */
export interface MessageViewPayload {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
}

/**
 * Design System des embeds du Credit Engine / AI Control Center.
 *
 * Principes (demandés explicitement) : sobre, sombre, minimal, professionnel,
 * aéré. Les emojis identifient une catégorie (🤖 IA, 💳 Crédits, 🎁
 * Récompenses...), ils ne décorent pas. Pas de gros blocs de texte, pas de
 * couleurs aléatoires — un nombre limité de couleurs, chacune avec un sens
 * précis et constant dans tout le système.
 */
export const EmbedColors = {
  neutral: 0x2b2d31, // Discord dark surface — embeds informatifs neutres
  operational: 0x3ba55c, // vert sobre — tout va bien
  warning: 0xf0b232, // ambre — dégradé/limité, attention sans urgence
  critical: 0xed4245, // rouge — hors service/erreur
  info: 0x5865f2, // bleu Discord — information neutre (wallet, stats)
} as const;

export const SEPARATOR = "─────────────────────";

/** Embed de base : couleur + séparateur cohérent, pas de surcharge d'emojis dans le titre. */
export function baseEmbed(title: string, color: number): EmbedBuilder {
  return new EmbedBuilder().setTitle(title).setColor(color);
}

export function formatCredits(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} crédit${Math.abs(amount) > 1 ? "s" : ""}`;
}

/** Formate une durée en "Xh Ymin" pour les cooldowns de récompense. */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "maintenant";
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}
