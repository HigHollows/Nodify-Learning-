import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AttachmentBuilder,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";

/**
 * Design System Nodify — Components V2 (Container/TextDisplay/Section/
 * MediaGallery/Separator), remplace l'ancien système EmbedBuilder partout
 * dans le bot. Anciennement `credits/embedTheme.ts`, désormais partagé par
 * tous les domaines (plus seulement crédits/IA) depuis la migration complète.
 *
 * Composants V2 n'a pas d'équivalent natif pour un "field" inline
 * (name/value côte à côte) ni pour un footer/timestamp dédié — ces éléments
 * sont émulés en Markdown dans des TextDisplay (`**Label**\nValeur`), le
 * rendu le plus proche possible de l'ancien embed sans réplique pixel-perfect.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANNER_FILENAME = "nodify-banner.gif";
const BANNER_PATH = path.join(__dirname, "..", "..", "assets", BANNER_FILENAME);

// Lu une seule fois au démarrage — un AttachmentBuilder frais est construit à
// partir de ce buffer en mémoire à chaque envoi (pas de re-lecture disque).
const bannerBuffer = readFileSync(BANNER_PATH);

export const EmbedColors = {
  neutral: 0x2b2d31, // Discord dark surface — informatif neutre
  operational: 0x3ba55c, // vert sobre — tout va bien
  warning: 0xf0b232, // ambre — dégradé/limité, attention sans urgence
  critical: 0xed4245, // rouge — hors service/erreur
  info: 0x5865f2, // bleu Discord — information neutre (wallet, stats)
} as const;

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

/** Nouvel AttachmentBuilder pour la bannière — un par envoi (Discord exige le fichier sur chaque reply/update/send qui la référence). */
export function bannerAttachment(): AttachmentBuilder {
  return new AttachmentBuilder(bannerBuffer, { name: BANNER_FILENAME });
}

function bannerGallery(): MediaGalleryBuilder {
  return new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder().setURL(`attachment://${BANNER_FILENAME}`).setDescription("Nodify"),
  );
}

/**
 * Container avec bannière + couleur d'accent, SANS titre auto-formaté — pour
 * les cas où le titre doit être un lien Markdown (`.setURL()` sur l'ancien
 * embed, ex: Hacktualités) plutôt qu'un texte brut. `baseContainer()` couvre
 * le cas standard (titre texte).
 */
export function bannerContainer(color: number): ContainerBuilder {
  return new ContainerBuilder().setAccentColor(color).addMediaGalleryComponents(bannerGallery());
}

/** Container de base : bannière + titre + couleur d'accent — équivalent Components V2 de l'ancien `baseEmbed()`. */
export function baseContainer(title: string, color: number): ContainerBuilder {
  return bannerContainer(color).addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}`));
}

/** Bloc de texte libre (équivalent `.setDescription()` ou un paragraphe de contenu). */
export function textDisplay(content: string): TextDisplayBuilder {
  return new TextDisplayBuilder().setContent(content);
}

/** Émule un embed field (name/value) en Markdown — Components V2 n'a pas de grille "inline" native. */
export function fieldText(name: string, value: string): string {
  return `**${name}**\n${value}`;
}

/** Ligne de séparation visuelle — remplace l'ancien hack `SEPARATOR` (texte "─────"). */
export function thinSeparator(divider = true): SeparatorBuilder {
  return new SeparatorBuilder().setDivider(divider).setSpacing(SeparatorSpacingSize.Small);
}

/**
 * Shape minimale réutilisée par les vues consommées par `.reply()`,
 * `.update()`, `.editReply()`, `channel.send()` ET `Message.edit()` —
 * `flags` reste strictement `[IsComponentsV2]` (jamais Ephemeral, qui
 * n'existe pas sur les types d'édition/update) pour rester valide dans
 * TOUS ces contextes sans jamais avoir besoin de caster.
 */
export interface MessageViewPayload {
  components: ContainerBuilder[];
  files: AttachmentBuilder[];
  flags: MessageFlags.IsComponentsV2[];
}

export function messageViewPayload(container: ContainerBuilder): MessageViewPayload {
  return { components: [container], files: [bannerAttachment()], flags: [MessageFlags.IsComponentsV2] };
}

/** Alias : `containerPayload` est l'usage le plus courant (interaction.reply), identique à `messageViewPayload`. */
export const containerPayload = messageViewPayload;
export type ContainerPayload = MessageViewPayload;

/**
 * Variante réservée à `interaction.reply()`/`.followUp()` UNIQUEMENT — le
 * type `flags` inclut `Ephemeral`, ce qui la rend volontairement
 * incompatible avec `.update()`/`.editReply()`/`channel.send()` (qui
 * n'acceptent pas ce flag) : une tentative de l'y passer est une erreur de
 * compilation plutôt qu'un bug Discord silencieux à l'exécution.
 */
export interface EphemeralContainerPayload {
  components: ContainerBuilder[];
  files: AttachmentBuilder[];
  flags: (MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral)[];
}

export function ephemeralContainerPayload(container: ContainerBuilder): EphemeralContainerPayload {
  return { components: [container], files: [bannerAttachment()], flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] };
}
