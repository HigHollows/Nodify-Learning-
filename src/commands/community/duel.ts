import { SlashCommandBuilder } from "discord.js";
import { createDuel } from "../../social/duelService.js";
import { buildDuelChallengeReply } from "../../social/duelView.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

/**
 * /duel — défie un autre membre en duel de trivia 1v1, live (boutons),
 * premier à trouver la bonne réponse gagne. État en mémoire, volontairement
 * non persisté — voir social/duelService.ts.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Défie quelqu'un en duel de trivia (premier à répondre correctement gagne).")
    .setDMPermission(false)
    .addUserOption((option) => option.setName("adversaire").setDescription("Qui tu défies").setRequired(true)),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      throw new AppError("Cette commande ne fonctionne que sur un serveur.");
    }

    const opponent = interaction.options.getUser("adversaire", true);

    if (opponent.id === interaction.user.id) {
      throw new AppError("Tu ne peux pas te défier toi-même.");
    }
    if (opponent.bot) {
      throw new AppError("Tu ne peux pas défier un bot.");
    }

    const duel = createDuel(interaction.user.id, opponent.id, interaction.guildId);
    await interaction.reply(buildDuelChallengeReply(interaction.user.id, opponent.id, duel.id));
  },
};

export default command;
