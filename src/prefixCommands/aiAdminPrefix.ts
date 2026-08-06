import { ChannelType } from "discord.js";
import { env } from "../config/env.js";
import { computeAiStatus, getSystemConfig, setAiMode } from "../credits/aiControlService.js";
import { getAdminControlCenterData, getAiUsagePage } from "../credits/aiAdminService.js";
import { creditsEnabled } from "../credits/creditService.js";
import { getActiveProviderName } from "../ai/aiService.js";
import { getAiBudgetOverrides, setAiBudgetOverrides } from "../database/repositories/guildRepository.js";
import { baseContainer, containerPayload, EmbedColors, fieldText, textDisplay, thinSeparator } from "../ui/container.js";
import { buildAdminControlCenterEmbed, buildAiUsageReply, type AiUsageFilters } from "../credits/aiStatusView.js";
import { AUDIT_LOG_PAGE_SIZE, buildAuditLogReply } from "../credits/auditView.js";
import { createOrMovePanel } from "../credits/statusPanelService.js";
import { getAuditLogPage, logAdminAction } from "../credits/auditService.js";
import type { PrefixCommand } from "../types/prefixCommand.js";
import { AppError, ValidationError } from "../utils/errors.js";
import { extractUserId, getChoiceOption, getIntOption, getRequiredChannelId, getStringOption, getBooleanOption } from "./parseArgs.js";

const MODE_SUBCOMMANDS = ["open", "close", "maintenance", "limited"] as const;
const MODE_MAP = { open: "OPEN", close: "CLOSED", maintenance: "MAINTENANCE", limited: "LIMITED" } as const;

const command: PrefixCommand = {
  name: "ai",
  description: "AI Control Center — gestion des services IA de Nodify.",
  usage:
    "+ai <status|open|stats|audit-log> | +ai <close|maintenance|limited> [raison:\"...\"] | " +
    "+ai usage [periode:today|week|month] [utilisateur:@user] [feature:...] | " +
    "+ai panel salon:#salon | +ai budget [quotidien:100] [mensuel:2000] [reset:true]",

  async execute(message, args) {
    const subcommand = args.subcommand;

    if (subcommand === "status") {
      const [status, provider, config] = await Promise.all([
        computeAiStatus(),
        Promise.resolve(getActiveProviderName()),
        getSystemConfig(),
      ]);
      const description =
        config.aiMode === "OPEN"
          ? "Mode : normal."
          : `Mode : ${config.aiMode}${config.maintenanceReason ? ` — ${config.maintenanceReason}` : ""}.`;

      await message.reply(
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

    if (subcommand && (MODE_SUBCOMMANDS as readonly string[]).includes(subcommand)) {
      const mode = MODE_MAP[subcommand as (typeof MODE_SUBCOMMANDS)[number]];
      const reason = getStringOption(args, "raison") ?? undefined;

      await setAiMode(mode, message.author.id, reason);

      const modeContainer = baseContainer(`🤖 NODIFY — AI MODE: ${mode}`, EmbedColors.operational);
      if (reason) modeContainer.addTextDisplayComponents(textDisplay(fieldText("Raison", reason)));
      modeContainer.addSeparatorComponents(thinSeparator());
      modeContainer.addTextDisplayComponents(
        textDisplay("Seuls les services IA sont concernés — le reste de Nodify continue de fonctionner normalement."),
      );
      await message.reply(containerPayload(modeContainer));
      return;
    }

    if (subcommand === "stats") {
      await message.reply(buildAdminControlCenterEmbed(await getAdminControlCenterData()));
      return;
    }

    if (subcommand === "usage") {
      const rawUser = getStringOption(args, "utilisateur");
      const userId = rawUser ? extractUserId(rawUser) : null;
      if (rawUser && !userId) {
        throw new ValidationError("`utilisateur` doit être une mention (@utilisateur) ou un id Discord valide.");
      }

      const filters: AiUsageFilters = {
        period: getChoiceOption(args, "periode", ["today", "week", "month"] as const) ?? "",
        userId: userId ?? "",
        feature: getStringOption(args, "feature") ?? "",
      };

      await message.reply(buildAiUsageReply(await getAiUsagePage(0, filters)));
      return;
    }

    if (subcommand === "panel") {
      if (!message.inGuild() || !message.guild) throw new AppError("Cette commande ne fonctionne que sur un serveur.");

      const channelId = getRequiredChannelId(args, "salon");
      const channel = await message.guild.channels.fetch(channelId).catch(() => null);
      if (!channel || channel.type !== ChannelType.GuildText) {
        throw new ValidationError("`salon` doit être une mention d'un salon texte valide sur ce serveur.");
      }

      await createOrMovePanel(message.client, channel.id);

      await message.reply(
        containerPayload(
          baseContainer("🤖 NODIFY — AI STATUS PANEL", EmbedColors.operational).addTextDisplayComponents(
            textDisplay(`Le panneau de statut IA a été posté dans <#${channel.id}>.`),
          ),
        ),
      );
      return;
    }

    if (subcommand === "budget") {
      if (!message.guildId) throw new AppError("Cette commande ne fonctionne que sur un serveur.");

      const reset = getBooleanOption(args, "reset") ?? false;
      const daily = getIntOption(args, "quotidien", { min: 0 });
      const monthly = getIntOption(args, "mensuel", { min: 0 });

      if (reset) {
        await setAiBudgetOverrides(message.guildId, { maxDailyAiSpend: null, maxMonthlyAiSpend: null });
        await logAdminAction(message.author.id, "AI_BUDGET_RESET", { metadata: { guildId: message.guildId } });
      } else {
        await setAiBudgetOverrides(message.guildId, {
          ...(daily !== null ? { maxDailyAiSpend: daily } : {}),
          ...(monthly !== null ? { maxMonthlyAiSpend: monthly } : {}),
        });
        await logAdminAction(message.author.id, "AI_BUDGET_SET", { metadata: { guildId: message.guildId, daily, monthly } });
      }

      const current = await getAiBudgetOverrides(message.guildId);
      const describe = (override: number | null, globalDefault: number) =>
        override === null
          ? `${globalDefault > 0 ? globalDefault : "illimité"} (défaut global)`
          : override > 0
            ? `${override} (override serveur)`
            : "illimité (override serveur)";

      await message.reply(
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
      await message.reply(buildAuditLogReply(page, 0));
      return;
    }

    throw new ValidationError(
      "Sous-commande inconnue — utilise `status`, `open`, `close`, `maintenance`, `limited`, `stats`, `usage`, `panel`, `budget` ou `audit-log` (voir `+help ai`).",
    );
  },
};

export default command;
