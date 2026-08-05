import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { adminGrant, adminRemove, adminSet } from "../../credits/creditService.js";
import { awardEventBonus } from "../../credits/rewardService.js";
import { logAdminAction } from "../../credits/auditService.js";
import { setSupporterStatus } from "../../database/repositories/userRepository.js";
import { baseEmbed, EmbedColors } from "../../credits/embedTheme.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

export const CREDIT_ADMIN_SET_ZERO_PREFIX = "credit-admin:setzero:";

/**
 * Séparée de `/credits` (pas fusionnée) : Discord interdit de mélanger une
 * commande "nue" (comme /credits, qui affiche directement un embed) avec
 * des sous-commandes (/credits give|remove|set) sur la même définition.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("credit-admin")
    .setDescription("Gère les crédits d'un utilisateur (admin).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub
        .setName("give")
        .setDescription("Attribue des crédits à un utilisateur.")
        .addUserOption((o) => o.setName("utilisateur").setDescription("Cible").setRequired(true))
        .addIntegerOption((o) => o.setName("montant").setDescription("Montant").setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName("raison").setDescription("Raison (ex: 'Participation au CTF')").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Retire des crédits à un utilisateur.")
        .addUserOption((o) => o.setName("utilisateur").setDescription("Cible").setRequired(true))
        .addIntegerOption((o) => o.setName("montant").setDescription("Montant").setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName("raison").setDescription("Raison").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Fixe le solde exact d'un utilisateur.")
        .addUserOption((o) => o.setName("utilisateur").setDescription("Cible").setRequired(true))
        .addIntegerOption((o) => o.setName("montant").setDescription("Nouveau solde").setRequired(true).setMinValue(0))
        .addStringOption((o) => o.setName("raison").setDescription("Raison").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("bonus")
        .setDescription("Bonus événementiel ponctuel (annonce, event communautaire...).")
        .addUserOption((o) => o.setName("utilisateur").setDescription("Cible").setRequired(true))
        .addIntegerOption((o) => o.setName("montant").setDescription("Montant du bonus").setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName("raison").setDescription("Raison (ex: 'Event Halloween 2026')").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("subscriber")
        .setDescription("Attribue/retire le statut supporter (non-monétaire) — bonus sur la récompense mensuelle.")
        .addUserOption((o) => o.setName("utilisateur").setDescription("Cible").setRequired(true))
        .addBooleanOption((o) => o.setName("statut").setDescription("true = supporter, false = retirer").setRequired(true)),
    ),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      throw new AppError("Cette commande ne fonctionne que sur un serveur.");
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "subscriber") {
      const target = interaction.options.getUser("utilisateur", true);
      const status = interaction.options.getBoolean("statut", true);

      await setSupporterStatus(target.id, status);
      await logAdminAction(interaction.user.id, status ? "SUPPORTER_GRANTED" : "SUPPORTER_REMOVED", {
        targetUserId: target.id,
      });

      await interaction.reply({
        embeds: [
          baseEmbed(status ? "⭐ Statut supporter attribué" : "Statut supporter retiré", EmbedColors.operational).addFields(
            { name: "Utilisateur", value: `<@${target.id}>`, inline: true },
            { name: "Statut", value: status ? "Supporter" : "Standard", inline: true },
          ),
        ],
      });
      return;
    }

    const target = interaction.options.getUser("utilisateur", true);
    const amount = interaction.options.getInteger("montant", true);
    const reason = interaction.options.getString("raison", true);

    if (subcommand === "give") {
      await adminGrant(interaction.user.id, target.id, amount, reason);
      await interaction.reply({
        embeds: [
          baseEmbed("💳 Crédits attribués", EmbedColors.operational).addFields(
            { name: "Utilisateur", value: `<@${target.id}>`, inline: true },
            { name: "Montant", value: `+${amount}`, inline: true },
            { name: "Raison", value: reason },
          ),
        ],
      });
      return;
    }

    if (subcommand === "bonus") {
      await awardEventBonus(target.id, amount, reason, interaction.guildId);
      await logAdminAction(interaction.user.id, "CREDITS_BONUS", { targetUserId: target.id, reason, metadata: { amount } });
      await interaction.reply({
        embeds: [
          baseEmbed("🎉 Bonus événementiel attribué", EmbedColors.operational).addFields(
            { name: "Utilisateur", value: `<@${target.id}>`, inline: true },
            { name: "Montant", value: `+${amount}`, inline: true },
            { name: "Raison", value: reason },
          ),
        ],
      });
      return;
    }

    if (subcommand === "remove") {
      const succeeded = await adminRemove(interaction.user.id, target.id, amount, reason);
      const embed = succeeded
        ? baseEmbed("💳 Crédits retirés", EmbedColors.operational).addFields(
            { name: "Utilisateur", value: `<@${target.id}>`, inline: true },
            { name: "Montant", value: `-${amount}`, inline: true },
            { name: "Raison", value: reason },
          )
        : baseEmbed("⚠️ Solde insuffisant", EmbedColors.warning).setDescription(
            `<@${target.id}> n'a pas assez de crédits pour retirer ${amount}. Tu peux fixer son solde à 0 à la place.`,
          );

      const components = succeeded
        ? []
        : [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(`${CREDIT_ADMIN_SET_ZERO_PREFIX}${target.id}`)
                .setLabel("Mettre le solde à 0")
                .setStyle(ButtonStyle.Danger),
            ),
          ];

      await interaction.reply({ embeds: [embed], components });
      return;
    }

    if (subcommand === "set") {
      await adminSet(interaction.user.id, target.id, amount, reason);
      await interaction.reply({
        embeds: [
          baseEmbed("💳 Solde fixé", EmbedColors.operational).addFields(
            { name: "Utilisateur", value: `<@${target.id}>`, inline: true },
            { name: "Nouveau solde", value: `${amount}`, inline: true },
            { name: "Raison", value: reason },
          ),
        ],
      });
    }
  },
};

export default command;
