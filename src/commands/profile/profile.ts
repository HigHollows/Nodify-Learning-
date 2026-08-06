import { SectionBuilder, SlashCommandBuilder, ThumbnailBuilder } from "discord.js";
import { buildProfileView } from "../../services/profileService.js";
import { baseContainer, containerPayload, fieldText, textDisplay, thinSeparator } from "../../ui/container.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

const COLOR_BLUE = 0x3498db;

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

    const container = baseContainer(`👤 Profil de ${view.username}`, COLOR_BLUE);

    // Section avec accessoire miniature — équivalent Components V2 de l'ancien `.setThumbnail()`.
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(textDisplay(fieldText(`Niveau : ${view.level.name}`, view.xpBar)))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL())),
    );

    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(
      textDisplay(fieldText("🔥 Streak", `${view.currentStreak} jour(s) — record : ${view.longestStreak} jour(s)`)),
    );

    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(
      textDisplay(
        fieldText(
          "Compétences",
          view.skills.length > 0
            ? view.skills.map((s) => `${s.categoryLabel} **${s.name}** — ${s.level.name}`).join("\n")
            : "_Aucune pour l'instant — reviens quand l'Academy sera là 👀_",
        ),
      ),
    );

    if (view.duelsPlayed > 0) {
      container.addSeparatorComponents(thinSeparator());
      container.addTextDisplayComponents(
        textDisplay(fieldText("⚔️ Duels", `${view.duelsWon} victoire(s) sur ${view.duelsPlayed} duel(s)`)),
      );
    }

    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(
      textDisplay(
        fieldText(
          `🏆 Succès (${view.achievementsUnlockedCount}/${view.achievementsTotalCount})`,
          view.achievements.length > 0 ? view.achievements.map((a) => `${a.icon} ${a.name}`).join("\n") : "_Aucun débloqué pour l'instant_",
        ),
      ),
    );

    await interaction.reply(containerPayload(container));
  },
};

export default command;
