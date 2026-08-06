import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { adminGrant, adminRemove, adminSet } from "../credits/creditService.js";
import { awardEventBonus } from "../credits/rewardService.js";
import { logAdminAction } from "../credits/auditService.js";
import { setSupporterStatus } from "../database/repositories/userRepository.js";
import { baseContainer, containerPayload, EmbedColors, fieldText, textDisplay } from "../ui/container.js";
import type { PrefixCommand } from "../types/prefixCommand.js";
import { AppError, ValidationError } from "../utils/errors.js";
import { getRequiredBooleanOption, getRequiredIntOption, getRequiredStringOption, getRequiredUserId } from "./parseArgs.js";

export const CREDIT_ADMIN_SET_ZERO_PREFIX = "credit-admin:setzero:";

const command: PrefixCommand = {
  name: "credit-admin",
  description: "Gère les crédits d'un utilisateur.",
  usage:
    "+credit-admin <give|remove|set|bonus> utilisateur:@user montant:100 raison:\"...\" | " +
    "+credit-admin subscriber utilisateur:@user statut:true|false",

  async execute(message, args) {
    if (!message.inGuild()) {
      throw new AppError("Cette commande ne fonctionne que sur un serveur.");
    }

    const targetId = getRequiredUserId(args, "utilisateur");
    const target = await message.client.users.fetch(targetId).catch(() => null);
    if (!target) throw new ValidationError("Utilisateur introuvable — vérifie la mention ou l'id.");

    if (args.subcommand === "subscriber") {
      const status = getRequiredBooleanOption(args, "statut");

      await setSupporterStatus(target.id, status);
      await logAdminAction(message.author.id, status ? "SUPPORTER_GRANTED" : "SUPPORTER_REMOVED", {
        targetUserId: target.id,
      });

      await message.reply(
        containerPayload(
          baseContainer(
            status ? "⭐ Statut supporter attribué" : "Statut supporter retiré",
            EmbedColors.operational,
          ).addTextDisplayComponents(
            textDisplay(
              [fieldText("Utilisateur", `<@${target.id}>`), fieldText("Statut", status ? "Supporter" : "Standard")].join("\n"),
            ),
          ),
        ),
      );
      return;
    }

    const amount = getRequiredIntOption(args, "montant", { min: args.subcommand === "set" ? 0 : 1 });
    const reason = getRequiredStringOption(args, "raison");

    if (args.subcommand === "give") {
      await adminGrant(message.author.id, target.id, amount, reason);
      await message.reply(
        containerPayload(
          baseContainer("💳 Crédits attribués", EmbedColors.operational).addTextDisplayComponents(
            textDisplay(
              [fieldText("Utilisateur", `<@${target.id}>`), fieldText("Montant", `+${amount}`), fieldText("Raison", reason)].join("\n"),
            ),
          ),
        ),
      );
      return;
    }

    if (args.subcommand === "bonus") {
      await awardEventBonus(target.id, amount, reason, message.guildId);
      await logAdminAction(message.author.id, "CREDITS_BONUS", { targetUserId: target.id, reason, metadata: { amount } });
      await message.reply(
        containerPayload(
          baseContainer("🎉 Bonus événementiel attribué", EmbedColors.operational).addTextDisplayComponents(
            textDisplay(
              [fieldText("Utilisateur", `<@${target.id}>`), fieldText("Montant", `+${amount}`), fieldText("Raison", reason)].join("\n"),
            ),
          ),
        ),
      );
      return;
    }

    if (args.subcommand === "remove") {
      const succeeded = await adminRemove(message.author.id, target.id, amount, reason);
      const container = succeeded
        ? baseContainer("💳 Crédits retirés", EmbedColors.operational).addTextDisplayComponents(
            textDisplay(
              [fieldText("Utilisateur", `<@${target.id}>`), fieldText("Montant", `-${amount}`), fieldText("Raison", reason)].join("\n"),
            ),
          )
        : baseContainer("⚠️ Solde insuffisant", EmbedColors.warning).addTextDisplayComponents(
            textDisplay(`<@${target.id}> n'a pas assez de crédits pour retirer ${amount}. Tu peux fixer son solde à 0 à la place.`),
          );

      if (!succeeded) {
        container.addActionRowComponents(
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`${CREDIT_ADMIN_SET_ZERO_PREFIX}${target.id}`)
              .setLabel("Mettre le solde à 0")
              .setStyle(ButtonStyle.Danger),
          ),
        );
      }

      await message.reply(containerPayload(container));
      return;
    }

    if (args.subcommand === "set") {
      await adminSet(message.author.id, target.id, amount, reason);
      await message.reply(
        containerPayload(
          baseContainer("💳 Solde fixé", EmbedColors.operational).addTextDisplayComponents(
            textDisplay(
              [fieldText("Utilisateur", `<@${target.id}>`), fieldText("Nouveau solde", `${amount}`), fieldText("Raison", reason)].join("\n"),
            ),
          ),
        ),
      );
      return;
    }

    throw new ValidationError(
      "Sous-commande inconnue — utilise `give`, `remove`, `set`, `bonus` ou `subscriber` (voir `+help credit-admin`).",
    );
  },
};

export default command;
