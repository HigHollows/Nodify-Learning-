import { SlashCommandBuilder } from "discord.js";
import { buildProfileView } from "../../services/profileService.js";
import { buildCompareReply } from "./compareView.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("compare")
    .setDescription("Compare ton profil à celui d'un autre membre.")
    .addUserOption((option) => option.setName("membre").setDescription("Qui comparer").setRequired(true)),

  async execute(interaction) {
    const opponent = interaction.options.getUser("membre", true);

    if (opponent.id === interaction.user.id) {
      throw new AppError("Choisis quelqu'un d'autre que toi-même à comparer.");
    }
    if (opponent.bot) {
      throw new AppError("Impossible de comparer avec un bot.");
    }

    const [me, them] = await Promise.all([buildProfileView(interaction.user.id), buildProfileView(opponent.id)]);

    if (!me) throw new AppError("Ton profil n'a pas encore été créé, réessaie dans un instant.");
    if (!them) throw new AppError("Ce membre n'a pas encore de profil Nodify (aucune interaction avec le bot pour l'instant).");

    await interaction.reply(buildCompareReply(me, them));
  },
};

export default command;
