import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../ui/container.js";

/**
 * Trust Nothing Simulation — expérience pédagogique 100% sûre :
 * AUCUN vrai fichier, AUCUNE collecte de données, AUCUNE modification
 * système. Uniquement des Containers et boutons Discord ; toute la "menace"
 * est fictive et sert uniquement à illustrer les signaux d'alerte d'une
 * tentative d'ingénierie sociale.
 */

export const TRUST_START_CUSTOM_ID = {
  execute: "trust:start:execute",
  verify: "trust:start:verify",
  ignore: "trust:start:ignore",
};

export const TRUST_VERIFY_CUSTOM_ID = {
  refuse: "trust:verify:refuse",
  executeAnyway: "trust:verify:execute",
};

export const TRUST_RESTART_CUSTOM_ID = "trust:restart";

const COLOR_ORANGE = 0xe67e22;
const COLOR_RED = 0xed4245;
const COLOR_GREEN = 0x57f287;

export function buildTrustSimulationStart(): ContainerPayload {
  const container = baseContainer("📩 Nouveau message reçu", COLOR_ORANGE).addTextDisplayComponents(
    textDisplay(
      "**SupportNodify#0001** t'envoie un message privé :\n\n" +
        "> Salut ! Ici le support technique de Nodify 🛠️. On a détecté une " +
        "**faille de sécurité critique** sur ton compte. Télécharge et lance " +
        "**Nodify_Update.exe** immédiatement, sinon ton compte sera **suspendu " +
        "sous 24h**.\n\n📎 `Nodify_Update.exe` (2.4 MB)",
    ),
    textDisplay("-# Trust Nothing Simulation — que fais-tu ?"),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(TRUST_START_CUSTOM_ID.execute).setLabel("▶️ Exécuter le fichier").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(TRUST_START_CUSTOM_ID.verify).setLabel("🔍 Vérifier l'expéditeur").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(TRUST_START_CUSTOM_ID.ignore).setLabel("🚫 Ignorer et signaler").setStyle(ButtonStyle.Secondary),
    ),
  );

  return containerPayload(container);
}

export function buildTrustSimulationVerifyStep(): ContainerPayload {
  const container = baseContainer("🔍 Vérification de SupportNodify#0001", COLOR_ORANGE).addTextDisplayComponents(
    textDisplay(
      "Tu regardes le profil de l'expéditeur :\n\n" +
        "• Compte créé il y a **2 jours**\n" +
        "• Aucun rôle **Staff** ou **Support officiel** sur le serveur\n" +
        "• Le vrai support Nodify ne contacte **jamais** en message privé avec un fichier exécutable\n\n" +
        "Que décides-tu ?",
    ),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(TRUST_VERIFY_CUSTOM_ID.refuse).setLabel("🚫 Refuser et signaler").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(TRUST_VERIFY_CUSTOM_ID.executeAnyway).setLabel("▶️ Exécuter quand même").setStyle(ButtonStyle.Danger),
    ),
  );

  return containerPayload(container);
}

function buildRestartRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(TRUST_RESTART_CUSTOM_ID).setLabel("🔁 Recommencer").setStyle(ButtonStyle.Secondary),
  );
}

export function buildTrustSimulationLoss(afterVerification: boolean): ContainerPayload {
  const container = baseContainer("💀 PERDU", COLOR_RED).addTextDisplayComponents(
    textDisplay(
      "Je t'avais pourtant dit : **ne fais pas confiance à tout.**\n\n" +
        "**Signaux d'alerte que tu as manqués :**\n" +
        "• Sentiment d'urgence artificiel (« suspendu sous 24h »)\n" +
        "• Fichier exécutable envoyé en message privé, non sollicité\n" +
        "• Le vrai support ne demande jamais de lancer un `.exe` par DM" +
        (afterVerification
          ? "\n• Tu avais pourtant vu les signaux à la vérification (compte récent, aucun rôle officiel) — et tu as quand même exécuté"
          : "") +
        "\n\n**La bonne réaction** aurait été de vérifier l'expéditeur (aucun rôle officiel, compte récent) " +
        "et de signaler le message, sans jamais exécuter le fichier.",
    ),
  );

  container.addActionRowComponents(buildRestartRow());

  return containerPayload(container);
}

export function buildTrustSimulationWin(verifiedFirst: boolean): ContainerPayload {
  const container = baseContainer("✅ Bon réflexe !", COLOR_GREEN).addTextDisplayComponents(
    textDisplay(
      (verifiedFirst
        ? "Tu as pris le temps de vérifier avant d'agir, et tu as vu les signaux : compte récent, aucun rôle officiel. "
        : "Tu n'as même pas eu besoin de vérifier : un fichier exécutable non sollicité avec un ton urgent, ça ne s'exécute jamais. ") +
        "C'est exactement le réflexe attendu.\n\n" +
        "**Ce qui rendait ce message suspect :**\n" +
        "• Urgence artificielle (« suspendu sous 24h »)\n" +
        "• Fichier exécutable non sollicité en message privé\n" +
        "• Aucune entité légitime ne demande de lancer un `.exe` reçu par DM\n\n" +
        "🏆 Succès débloqué : **Esprit critique**",
    ),
  );

  return containerPayload(container);
}
