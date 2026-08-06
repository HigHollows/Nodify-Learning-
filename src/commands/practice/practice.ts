import { SlashCommandBuilder } from "discord.js";
import { pickPracticeItem } from "../../practice/practiceService.js";
import { buildExercisePracticeReply } from "../../practice/exerciseView.js";
import { buildCtfChallengeReply } from "../../cybersecurity/ctfView.js";
import { baseContainer, containerPayload, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const COLOR_ORANGE = 0xe67e22;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("practice")
    .setDescription("Pioche un exercice ou un défi CTF adapté à ton niveau, prêt à résoudre."),

  async execute(interaction) {
    const pick = await pickPracticeItem(interaction.user.id);

    if (!pick) {
      await interaction.reply(
        containerPayload(
          baseContainer("🏋️ Rien à proposer", COLOR_ORANGE).addTextDisplayComponents(
            textDisplay("Aucun exercice ou défi CTF disponible pour l'instant."),
          ),
        ),
      );
      return;
    }

    await interaction.reply(
      pick.type === "exercise" ? buildExercisePracticeReply(pick.detail) : buildCtfChallengeReply(pick.detail),
    );
  },
};

export default command;
