import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
  baseContainer,
  containerPayload,
  EmbedColors,
  ephemeralContainerPayload,
  textDisplay,
  type ContainerPayload,
  type EphemeralContainerPayload,
} from "../ui/container.js";

const COLOR_CELEBRATION = 0xf1c40f;

function shareCourseButtonId(courseKey: string): string {
  return `share:course:${courseKey}`;
}
function shareCtfButtonId(challengeKey: string): string {
  return `share:ctf:${challengeKey}`;
}

export function parseShareCourseButtonId(customId: string): string | null {
  return customId.startsWith("share:course:") ? customId.slice("share:course:".length) : null;
}
export function parseShareCtfButtonId(customId: string): string | null {
  return customId.startsWith("share:ctf:") ? customId.slice("share:ctf:".length) : null;
}

/** Bouton opt-in ajouté à la réponse existante — jamais de partage automatique/non sollicité. */
export function buildShareCourseButton(courseKey: string): ButtonBuilder {
  return new ButtonBuilder().setCustomId(shareCourseButtonId(courseKey)).setLabel("📢 Partager").setStyle(ButtonStyle.Secondary);
}
export function buildShareCtfButton(challengeKey: string): ButtonBuilder {
  return new ButtonBuilder().setCustomId(shareCtfButtonId(challengeKey)).setLabel("📢 Partager").setStyle(ButtonStyle.Secondary);
}

export function buildShareCourseRow(courseKey: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buildShareCourseButton(courseKey));
}
export function buildShareCtfRow(challengeKey: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buildShareCtfButton(challengeKey));
}

export function buildCourseShareMessage(username: string, courseTitle: string): ContainerPayload {
  const container = baseContainer("🎉 Nouveau diplômé Nodify !", COLOR_CELEBRATION).addTextDisplayComponents(
    textDisplay(`**${username}** vient de terminer le cours **${courseTitle}** sur Nodify Academy !`),
  );
  return containerPayload(container);
}

export function buildCtfShareMessage(username: string, challengeTitle: string, points: number): ContainerPayload {
  const container = baseContainer("🚩 Flag capturé !", COLOR_CELEBRATION).addTextDisplayComponents(
    textDisplay(`**${username}** vient de résoudre le défi CTF **${challengeTitle}** (+${points} points) !`),
  );
  return containerPayload(container);
}

export function buildShareAckReply(): EphemeralContainerPayload {
  return ephemeralContainerPayload(
    baseContainer("✅ Partagé", EmbedColors.operational).addTextDisplayComponents(textDisplay("Ta réussite a été partagée dans le salon.")),
  );
}

export function buildShareFailedReply(): EphemeralContainerPayload {
  return ephemeralContainerPayload(
    baseContainer("❌ Partage impossible", EmbedColors.critical).addTextDisplayComponents(
      textDisplay("Impossible de poster dans ce salon (permissions manquantes ou salon non textuel)."),
    ),
  );
}
