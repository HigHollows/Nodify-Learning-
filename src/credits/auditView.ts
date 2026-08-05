import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { AuditLogPage } from "./auditService.js";
import { baseEmbed, EmbedColors, type MessageViewPayload } from "./embedTheme.js";

export const AUDIT_LOG_PAGE_SIZE = 8;

/** `credits:audit:<page>` — pagination du journal d'audit admin. */
export function buildAuditLogPageCustomId(page: number): string {
  return `credits:audit:${page}`;
}

/**
 * Seule vue Discord sur `AdminAuditLog` (`/ai audit-log`) — jusqu'ici ce
 * journal n'existait qu'en écriture. Ne montre jamais de secret : uniquement
 * admin/action/cible/raison/horodatage, ce que l'audit log stocke déjà.
 */
export function buildAuditLogReply(page: AuditLogPage, pageIndex: number): MessageViewPayload {
  const totalPages = Math.max(Math.ceil(page.total / AUDIT_LOG_PAGE_SIZE), 1);
  const embed = baseEmbed("🗂️ NODIFY — AUDIT LOG", EmbedColors.neutral).setDescription(
    "Actions administratives sensibles (mode IA, crédits, bonus, statut supporter...).",
  );

  if (page.entries.length === 0) {
    embed.addFields({ name: "​", value: "Aucune action journalisée pour l'instant." });
  } else {
    for (const entry of page.entries) {
      const target = entry.targetUserId ? ` → <@${entry.targetUserId}>` : "";
      const reason = entry.reason ? ` — ${entry.reason}` : "";
      embed.addFields({
        name: `${entry.action}${target}`,
        value: `Par <@${entry.adminId}>${reason} · <t:${Math.floor(entry.createdAt.getTime() / 1000)}:R>`,
      });
    }
  }

  embed.setFooter({ text: `Page ${pageIndex + 1}/${totalPages} — ${page.total} action(s) au total` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildAuditLogPageCustomId(pageIndex - 1))
      .setLabel("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex <= 0),
    new ButtonBuilder()
      .setCustomId(buildAuditLogPageCustomId(pageIndex + 1))
      .setLabel("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex + 1 >= totalPages),
  );

  return { embeds: [embed], components: [row] };
}
