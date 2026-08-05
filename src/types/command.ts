import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/**
 * Contrat que toute commande slash de Nodify doit respecter.
 *
 * Volontairement minimal pour la Phase 1 : uniquement des commandes
 * chat input (`/commande`). Les Modals/Boutons/Menus arriveront comme
 * "interactions" séparées (src/interactions/) quand on en aura besoin,
 * pour ne pas surcharger ce contrat avant d'en avoir l'usage réel.
 */
export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  /** Si true, la commande n'est enregistrée que sur DISCORD_GUILD_ID (dev/tests). */
  guildOnly?: boolean;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
