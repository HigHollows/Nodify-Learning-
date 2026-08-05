import { SlashCommandBuilder } from "discord.js";
import { listCourseSummaries } from "../../education/academyService.js";
import type { Command } from "../../types/command.js";
import { buildCourseListReply } from "../education/learnView.js";
import { buildTrustSimulationStart } from "../../cybersecurity/trustSimulationView.js";

/**
 * /cyber regroupe l'entrée Cyber Academy. `learn` réutilise entièrement le
 * moteur Academy (Phase 5) filtré sur la catégorie CYBERSECURITY — pas de
 * système parallèle. `simulation` lance la Trust Nothing Simulation.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("cyber")
    .setDescription("Cyber Academy Nodify.")
    .addSubcommand((sub) =>
      sub.setName("learn").setDescription("Liste les cours de cybersécurité disponibles."),
    )
    .addSubcommand((sub) =>
      sub
        .setName("simulation")
        .setDescription(
          "Trust Nothing Simulation — un jeu pédagogique 100% sûr sur l'ingénierie sociale.",
        ),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "learn") {
      const courses = await listCourseSummaries(interaction.user.id, "CYBERSECURITY");
      await interaction.reply(buildCourseListReply(courses));
      return;
    }

    if (subcommand === "simulation") {
      await interaction.reply(buildTrustSimulationStart());
    }
  },
};

export default command;
