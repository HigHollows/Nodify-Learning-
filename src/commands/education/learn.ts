import { SlashCommandBuilder } from "discord.js";
import { listCourseSummaries, startOrResumeCourse } from "../../education/academyService.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";
import { buildCourseListReply, buildLessonContentReply } from "./learnView.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("learn")
    .setDescription("Nodify Academy : découvre ou continue un cours.")
    .addStringOption((option) =>
      option
        .setName("cours")
        .setDescription("Clé du cours à démarrer/continuer directement (optionnel)")
        .setRequired(false),
    ),

  async execute(interaction) {
    const courseKey = interaction.options.getString("cours");

    if (!courseKey) {
      const courses = await listCourseSummaries(interaction.user.id);
      await interaction.reply(buildCourseListReply(courses));
      return;
    }

    const lesson = await startOrResumeCourse(interaction.user.id, courseKey);
    if (!lesson) {
      throw new AppError(
        "Ce cours est introuvable ou déjà entièrement terminé — tape `/learn` sans argument pour voir la liste.",
      );
    }

    await interaction.reply(buildLessonContentReply(lesson));
  },
};

export default command;
