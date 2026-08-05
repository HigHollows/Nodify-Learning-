import { SlashCommandBuilder } from "discord.js";
import { listCourseSummaries } from "../../education/academyService.js";
import { getChallengeDetail, getLeaderboard, listChallengesForUser } from "../../cybersecurity/ctfService.js";
import {
  buildCtfChallengeReply,
  buildCtfLeaderboardReply,
  buildCtfListReply,
} from "../../cybersecurity/ctfView.js";
import { buildBlueTeamStart } from "../../cybersecurity/blueTeamView.js";
import { buildTrustSimulationStart } from "../../cybersecurity/trustSimulationView.js";
import { assertModuleEnabled } from "../../setup/guildSettingsService.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";
import { buildCourseListReply } from "../education/learnView.js";

/**
 * /cyber regroupe toute la Cyber Academy. `learn`/`simulation`/`blueteam`
 * réutilisent des moteurs déjà existants (Academy, patterns de simulation) ;
 * `ctf` a son propre groupe de sous-commandes (list/challenge/submit via
 * bouton+modal/leaderboard).
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
    )
    .addSubcommand((sub) =>
      sub
        .setName("blueteam")
        .setDescription("Simulation Blue Team — identifie l'indicateur de compromission dans un log."),
    )
    .addSubcommandGroup((group) =>
      group
        .setName("ctf")
        .setDescription("Défis CTF Nodify (crypto, forensics, OSINT, web).")
        .addSubcommand((sub) => sub.setName("list").setDescription("Liste les défis CTF disponibles."))
        .addSubcommand((sub) =>
          sub
            .setName("challenge")
            .setDescription("Affiche le détail d'un défi CTF.")
            .addStringOption((option) =>
              option
                .setName("cle")
                .setDescription("Clé du défi (voir /cyber ctf list)")
                .setRequired(true)
                .setAutocomplete(true),
            ),
        )
        .addSubcommand((sub) =>
          sub.setName("leaderboard").setDescription("Classement CTF par points."),
        ),
    ),

  async execute(interaction) {
    await assertModuleEnabled(interaction.guildId, "cyber");

    const subcommand = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);

    if (group === "ctf") {
      if (subcommand === "list") {
        const challenges = await listChallengesForUser(interaction.user.id);
        await interaction.reply(buildCtfListReply(challenges));
        return;
      }

      if (subcommand === "challenge") {
        const key = interaction.options.getString("cle", true);
        const challenge = await getChallengeDetail(key, interaction.user.id);
        if (!challenge) {
          throw new AppError(
            "Ce défi n'existe pas — utilise `/cyber ctf list` pour voir les clés disponibles.",
          );
        }
        await interaction.reply(buildCtfChallengeReply(challenge));
        return;
      }

      if (subcommand === "leaderboard") {
        const entries = await getLeaderboard(10);
        await interaction.reply(buildCtfLeaderboardReply(entries));
        return;
      }

      return;
    }

    if (subcommand === "learn") {
      const courses = await listCourseSummaries(interaction.user.id, "CYBERSECURITY");
      await interaction.reply(buildCourseListReply(courses));
      return;
    }

    if (subcommand === "simulation") {
      await interaction.reply(buildTrustSimulationStart());
      return;
    }

    if (subcommand === "blueteam") {
      await interaction.reply(buildBlueTeamStart());
    }
  },
};

export default command;
