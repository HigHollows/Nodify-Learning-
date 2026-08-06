import type { AutocompleteInteraction } from "discord.js";
import { listCourses } from "../database/repositories/academyRepository.js";
import { listCtfChallenges } from "../database/repositories/ctfRepository.js";
import { listExercises } from "../database/repositories/exerciseRepository.js";
import { listAiCosts } from "../credits/creditCosts.js";

const MAX_CHOICES = 25; // limite Discord

function matches(fragment: string, ...fields: string[]): boolean {
  const needle = fragment.toLowerCase();
  return fields.some((field) => field.toLowerCase().includes(needle));
}

async function autocompleteLearnCourse(interaction: AutocompleteInteraction): Promise<void> {
  const focused = interaction.options.getFocused().toString();
  const courses = await listCourses();

  const choices = courses
    .filter((c) => matches(focused, c.key, c.title))
    .slice(0, MAX_CHOICES)
    .map((c) => ({ name: `${c.title} (${c.key})`, value: c.key }));

  await interaction.respond(choices);
}

async function autocompleteCtfChallenge(interaction: AutocompleteInteraction): Promise<void> {
  const focused = interaction.options.getFocused().toString();
  const challenges = await listCtfChallenges();

  const choices = challenges
    .filter((c) => matches(focused, c.key, c.title))
    .slice(0, MAX_CHOICES)
    .map((c) => ({ name: `${c.title} (${c.points} pts) — ${c.key}`, value: c.key }));

  await interaction.respond(choices);
}

async function autocompleteExercise(interaction: AutocompleteInteraction): Promise<void> {
  const focused = interaction.options.getFocused().toString();
  const exercises = await listExercises();

  const choices = exercises
    .filter((e) => matches(focused, e.key, e.title))
    .slice(0, MAX_CHOICES)
    .map((e) => ({ name: `${e.title} (${e.type}) — ${e.key}`, value: e.key }));

  await interaction.respond(choices);
}

function autocompleteAiFeature(interaction: AutocompleteInteraction): Promise<void> {
  const focused = interaction.options.getFocused().toString();
  const choices = listAiCosts()
    .filter((c) => matches(focused, c.feature, c.label))
    .slice(0, MAX_CHOICES)
    .map((c) => ({ name: `${c.label} (${c.feature})`, value: c.feature }));

  return interaction.respond(choices);
}

/**
 * Routage par (commande, option focus) plutôt que par customId — les
 * interactions autocomplete n'ont pas de customId, juste un nom de
 * commande/sous-commande et l'option en cours de saisie.
 */
export async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const focusedOption = interaction.options.getFocused(true);

  if (interaction.commandName === "learn" && focusedOption.name === "cours") {
    await autocompleteLearnCourse(interaction);
    return;
  }

  if (
    interaction.commandName === "cyber" &&
    interaction.options.getSubcommandGroup(false) === "ctf" &&
    interaction.options.getSubcommand() === "challenge" &&
    focusedOption.name === "cle"
  ) {
    await autocompleteCtfChallenge(interaction);
    return;
  }

  if (interaction.commandName === "ai" && focusedOption.name === "feature") {
    await autocompleteAiFeature(interaction);
    return;
  }

  if (interaction.commandName === "exercise" && focusedOption.name === "cle") {
    await autocompleteExercise(interaction);
    return;
  }

  await interaction.respond([]);
}
