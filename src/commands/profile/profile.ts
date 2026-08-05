import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { buildProfileView } from "../../services/profileService.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Affiche ton profil Nodify : progression, compétences, succès."),

  async execute(interaction) {
    const view = await buildProfileView(interaction.user.id);

    if (!view) {
      // Ne devrait pas arriver : recordActivity crée le profil avant chaque commande.
      throw new AppError("Ton profil n'a pas encore été créé, réessaie dans un instant.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`👤 Profil de ${view.username}`)
      .setColor("Blue")
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        {
          name: `Niveau : ${view.level.name}`,
          value: view.xpBar,
        },
        {
          name: "🔥 Streak",
          value: `${view.currentStreak} jour(s) — record : ${view.longestStreak} jour(s)`,
        },
        {
          name: "Compétences",
          value:
            view.skills.length > 0
              ? view.skills
                  .map((s) => `${s.categoryLabel} **${s.name}** — ${s.level.name}`)
                  .join("\n")
              : "_Aucune pour l'instant — reviens quand l'Academy sera là 👀_",
        },
        {
          name: `🏆 Succès (${view.achievementsUnlockedCount}/${view.achievementsTotalCount})`,
          value:
            view.achievements.length > 0
              ? view.achievements.map((a) => `${a.icon} ${a.name}`).join("\n")
              : "_Aucun débloqué pour l'instant_",
        },
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
