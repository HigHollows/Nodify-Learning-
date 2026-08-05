import { SlashCommandBuilder } from "discord.js";
import { listCourseSummaries, startOrResumeCourse } from "../../education/academyService.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";
import {
  buildCourseListReply,
  buildLessonContentReply,
  buildPrerequisitesBlockedReply,
} from "./learnView.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("learn")
    .setDescription("Nodify Academy : découvre ou continue un cours.")
    .addStringOption((option) =>
      option
        .setName("cours")
        .setDescription("Clé du cours à démarrer/continuer directement (optionnel)")
        .setRequired(false)
        .setAutocomplete(true),
    ),

  async execute(interaction) {
    const courseKey = interaction.options.getString("cours");

    if (!courseKey) {
      const courses = await listCourseSummaries(interaction.user.id);
      await interaction.reply(buildCourseListReply(courses));
      return;
    }

    const result = await startOrResumeCourse(interaction.user.id, courseKey);

    if (result.type === "not_found") {
      throw new AppError(
        "Ce cours est introuvable ou déjà entièrement terminé — tape `/learn` sans argument pour voir la liste.",
      );
    }

    if (result.type === "blocked") {
      await interaction.reply(buildPrerequisitesBlockedReply(result.missingPrerequisites));
      return;
    }

    await interaction.reply(buildLessonContentReply(result.lesson));
  },
};

export default command;
