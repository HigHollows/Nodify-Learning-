import { SlashCommandBuilder } from "discord.js";
import { getExerciseDetail, listExercisesForUser } from "../../practice/exerciseService.js";
import { buildExerciseListReply, buildExercisePracticeReply } from "../../practice/exerciseView.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

/**
 * /exercise — exercices pratiques courts (QCM + Debug/Trouve le bug/Complète
 * le code), rejouables librement, complémentaires aux cours Academy et aux
 * défis CTF. Pas de gate de module : ce sont des exercices transverses
 * (dev/cyber/ia), pas un domaine unique désactivable par serveur.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("exercise")
    .setDescription("Exercices pratiques Nodify (QCM, debug, complète le code).")
    .addSubcommand((sub) => sub.setName("list").setDescription("Liste les exercices disponibles."))
    .addSubcommand((sub) =>
      sub
        .setName("practice")
        .setDescription("S'entraîner sur un exercice précis.")
        .addStringOption((option) =>
          option
            .setName("cle")
            .setDescription("Clé de l'exercice (voir /exercise list)")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
      const exercises = await listExercisesForUser(interaction.user.id);
      await interaction.reply(buildExerciseListReply(exercises));
      return;
    }

    if (subcommand === "practice") {
      const key = interaction.options.getString("cle", true);
      const exercise = await getExerciseDetail(key, interaction.user.id);
      if (!exercise) {
        throw new AppError(
          "Cet exercice n'existe pas — utilise `/exercise list` pour voir les clés disponibles.",
        );
      }
      await interaction.reply(buildExercisePracticeReply(exercise));
    }
  },
};

export default command;
