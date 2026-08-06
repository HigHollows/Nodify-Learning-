import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { env } from "../../config/env.js";
import { computeAiStatus, getSystemConfig, setAiMode } from "../../credits/aiControlService.js";
import { getAdminControlCenterData, getAiUsagePage } from "../../credits/aiAdminService.js";
import { creditsEnabled } from "../../credits/creditService.js";
import { getActiveProviderName } from "../../ai/aiService.js";
import { getAiBudgetOverrides, setAiBudgetOverrides } from "../../database/repositories/guildRepository.js";
import { baseContainer, containerPayload, EmbedColors, fieldText, textDisplay, thinSeparator } from "../../ui/container.js";
import { buildAdminControlCenterEmbed, buildAiUsageReply, type AiUsageFilters } from "../../credits/aiStatusView.js";
import { AUDIT_LOG_PAGE_SIZE, buildAuditLogReply } from "../../credits/auditView.js";
import { createOrMovePanel } from "../../credits/statusPanelService.js";
import { getAuditLogPage, logAdminAction } from "../../credits/auditService.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

/**
 * AI Control Center — commande admin unique regroupant toutes les actions
 * sur le mode IA. Séparée de `/credit-admin` (crédits utilisateur) : deux
 * domaines distincts, deux commandes distinctes.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ai")
    .setDescription("AI Control Center — gestion des services IA de Nodify (admin).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((sub) => sub.setName("status").setDescription("Statut actuel des services IA."))
    .addSubcommand((sub) => sub.setName("open").setDescription("Réactive les services IA (mode normal)."))
    .addSubcommand((sub) =>
      sub
        .setName("close")
        .setDescription("Désactive les services IA (le reste de Nodify continue de fonctionner).")
        .addStringOption((o) => o.setName("raison").setDescription("Raison affichée aux utilisateurs")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("maintenance")
        .setDescription("Passe les services IA en maintenance.")
        .addStringOption((o) => o.setName("raison").setDescription("Raison affichée aux utilisateurs")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("limited")
        .setDescription("Passe les services IA en mode limité (fonctionnalités coûteuses suspendues).")
        .addStringOption((o) => o.setName("raison").setDescription("Raison affichée aux utilisateurs")),
    )
    .addSubcommand((sub) => sub.setName("stats").setDescription("Statistiques d'usage IA (jour/semaine/mois)."))
    .addSubcommand((sub) =>
      sub
        .setName("usage")
        .setDescription("Historique détaillé des appels IA, filtrable et paginé.")
        .addStringOption((o) =>
          o
            .setName("periode")
            .setDescription("Période")
            .addChoices(
              { name: "Aujourd'hui", value: "today" },
              { name: "Cette semaine", value: "week" },
              { name: "Ce mois-ci", value: "month" },
            ),
        )
        .addUserOption((o) => o.setName("utilisateur").setDescription("Filtrer par utilisateur"))
        .addStringOption((o) =>
          o.setName("feature").setDescription("Filtrer par fonctionnalité").setAutocomplete(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("panel")
        .setDescription("Désigne (ou déplace) le salon du panneau de statut IA persistant.")
        .addChannelOption((o) =>
          o
            .setName("salon")
            .setDescription("Salon texte où poster le panneau")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("budget")
        .setDescription("Budget IA (crédits) propre à ce serveur — remplace le plafond global par défaut.")
        .addIntegerOption((o) =>
          o.setName("quotidien").setDescription("Plafond quotidien pour ce serveur (0 = illimité)").setMinValue(0),
        )
        .addIntegerOption((o) =>
          o.setName("mensuel").setDescription("Plafond mensuel pour ce serveur (0 = illimité)").setMinValue(0),
        )
        .addBooleanOption((o) =>
          o.setName("reset").setDescription("Retire l'override et retombe sur le plafond global par défaut"),
        ),
    )
    .addSubcommand((sub) => sub.setName("audit-log").setDescription("Historique des actions admin sensibles (mode IA, crédits, bonus...).")),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "status") {
      const [status, provider, config] = await Promise.all([
        computeAiStatus(),
        Promise.resolve(getActiveProviderName()),
        getSystemConfig(),
      ]);
      const description = config.aiMode === "OPEN"
        ? "Mode : normal."
        : `Mode : ${config.aiMode}${config.maintenanceReason ? ` — ${config.maintenanceReason}` : ""}.`;

      await interaction.reply(
        containerPayload(
          baseContainer("🤖 NODIFY — AI STATUS", EmbedColors.info).addTextDisplayComponents(
            textDisplay(description),
            textDisplay(
              [
                fieldText("Statut calculé", status),
                fieldText("Provider", provider),
                fieldText("Crédits", creditsEnabled() ? "Activés" : "Désactivés"),
              ].join("\n"),
            ),
          ),
        ),
      );
      return;
    }

    if (subcommand === "open" || subcommand === "close" || subcommand === "maintenance" || subcommand === "limited") {
      const modeMap = { open: "OPEN", close: "CLOSED", maintenance: "MAINTENANCE", limited: "LIMITED" } as const;
      const mode = modeMap[subcommand];
      const reason = interaction.options.getString("raison") ?? undefined;

      await setAiMode(mode, interaction.user.id, reason);

      const modeContainer = baseContainer(`🤖 NODIFY — AI MODE: ${mode}`, EmbedColors.operational);
      if (reason) modeContainer.addTextDisplayComponents(textDisplay(fieldText("Raison", reason)));
      modeContainer.addSeparatorComponents(thinSeparator());
      modeContainer.addTextDisplayComponents(
        textDisplay("Seuls les services IA sont concernés — le reste de Nodify continue de fonctionner normalement."),
      );
      await interaction.reply(containerPayload(modeContainer));
      return;
    }

    if (subcommand === "stats") {
      await interaction.reply(buildAdminControlCenterEmbed(await getAdminControlCenterData()));
      return;
    }

    if (subcommand === "usage") {
      const filters: AiUsageFilters = {
        period: interaction.options.getString("periode") ?? "",
        userId: interaction.options.getUser("utilisateur")?.id ?? "",
        feature: interaction.options.getString("feature") ?? "",
      };

      await interaction.reply(buildAiUsageReply(await getAiUsagePage(0, filters)));
      return;
    }

    if (subcommand === "panel") {
      const channel = interaction.options.getChannel("salon", true);
      if (!interaction.guild) throw new AppError("Cette commande ne fonctionne que sur un serveur.");

      await createOrMovePanel(interaction.client, channel.id);

      await interaction.reply(
        containerPayload(
          baseContainer("🤖 NODIFY — AI STATUS PANEL", EmbedColors.operational).addTextDisplayComponents(
            textDisplay(`Le panneau de statut IA a été posté dans <#${channel.id}>.`),
          ),
        ),
      );
      return;
    }

    if (subcommand === "budget") {
      if (!interaction.guildId) throw new AppError("Cette commande ne fonctionne que sur un serveur.");

      const reset = interaction.options.getBoolean("reset") ?? false;
      const daily = interaction.options.getInteger("quotidien");
      const monthly = interaction.options.getInteger("mensuel");

      if (reset) {
        await setAiBudgetOverrides(interaction.guildId, { maxDailyAiSpend: null, maxMonthlyAiSpend: null });
        await logAdminAction(interaction.user.id, "AI_BUDGET_RESET", { metadata: { guildId: interaction.guildId } });
      } else {
        await setAiBudgetOverrides(interaction.guildId, {
          ...(daily !== null ? { maxDailyAiSpend: daily } : {}),
          ...(monthly !== null ? { maxMonthlyAiSpend: monthly } : {}),
        });
        await logAdminAction(interaction.user.id, "AI_BUDGET_SET", { metadata: { guildId: interaction.guildId, daily, monthly } });
      }

      const current = await getAiBudgetOverrides(interaction.guildId);
      const describe = (override: number | null, globalDefault: number) =>
        override === null
          ? `${globalDefault > 0 ? globalDefault : "illimité"} (défaut global)`
          : override > 0
            ? `${override} (override serveur)`
            : "illimité (override serveur)";

      await interaction.reply(
        containerPayload(
          baseContainer("💰 NODIFY — AI BUDGET", EmbedColors.operational).addTextDisplayComponents(
            textDisplay(
              [
                fieldText("Plafond quotidien", describe(current.maxDailyAiSpend, env.MAX_DAILY_AI_SPEND)),
                fieldText("Plafond mensuel", describe(current.maxMonthlyAiSpend, env.MAX_MONTHLY_AI_SPEND)),
              ].join("\n"),
            ),
          ),
        ),
      );
      return;
    }

    if (subcommand === "audit-log") {
      const page = await getAuditLogPage(AUDIT_LOG_PAGE_SIZE, 0);
      await interaction.reply(buildAuditLogReply(page, 0));
    }
  },
};

export default command;
