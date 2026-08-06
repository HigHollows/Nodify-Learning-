import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { AuditLogPage } from "./auditService.js";
import { baseContainer, EmbedColors, messageViewPayload, textDisplay, thinSeparator, type MessageViewPayload } from "../ui/container.js";

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
  const container = baseContainer("🗂️ NODIFY — AUDIT LOG", EmbedColors.neutral).addTextDisplayComponents(
    textDisplay("Actions administratives sensibles (mode IA, crédits, bonus, statut supporter...)."),
  );

  container.addSeparatorComponents(thinSeparator());

  if (page.entries.length === 0) {
    container.addTextDisplayComponents(textDisplay("Aucune action journalisée pour l'instant."));
  } else {
    container.addTextDisplayComponents(
      textDisplay(
        page.entries
          .map((entry) => {
            const target = entry.targetUserId ? ` → <@${entry.targetUserId}>` : "";
            const reason = entry.reason ? ` — ${entry.reason}` : "";
            return `**${entry.action}${target}**\nPar <@${entry.adminId}>${reason} · <t:${Math.floor(entry.createdAt.getTime() / 1000)}:R>`;
          })
          .join("\n\n"),
      ),
    );
  }

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(textDisplay(`-# Page ${pageIndex + 1}/${totalPages} — ${page.total} action(s) au total`));

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
  container.addActionRowComponents(row);

  return messageViewPayload(container);
}
