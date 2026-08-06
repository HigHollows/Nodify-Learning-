import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../ui/container.js";

/**
 * Blue Team — simulation d'analyse de logs, 100% fictive et statique (pas
 * de vrais logs, pas de vraie infrastructure). Un seul scénario pour
 * l'instant : identifier l'indicateur de compromission (IOC) parmi des
 * lignes de log plausibles.
 */

const LOG_LINES = [
  "[03:12:44] INFO  Backup job completed successfully (server: backup-01)",
  "[03:14:02] WARN  Login success — user: admin, ip: 185.220.101.7 (RO), heure inhabituelle",
  "[07:45:10] INFO  Scheduled report generated (server: reports-02)",
  "[09:02:33] INFO  User jdupont logged in from office IP 10.0.4.22",
  "[14:20:01] WARN  Failed login attempt — user: admin, ip: 10.0.4.22",
] as const;

/** Index (0-based) de la ligne contenant le vrai IOC dans LOG_LINES. */
const IOC_LINE_INDEX = 1;

export const BLUE_TEAM_CUSTOM_ID_PREFIX = "blueteam:line:";

const COLOR_BLUE = 0x3498db;
const COLOR_GREEN = 0x57f287;
const COLOR_RED = 0xed4245;

export function isCorrectBlueTeamLine(index: number): boolean {
  return index === IOC_LINE_INDEX;
}

export function buildBlueTeamStart(): ContainerPayload {
  const container = baseContainer("🔵 Blue Team — Analyse de logs", COLOR_BLUE).addTextDisplayComponents(
    textDisplay(
      "Voici un extrait des logs d'authentification de l'entreprise (aucune activité " +
        "en dehors de la France dans cette organisation). Une seule ligne indique un " +
        "**indicateur de compromission (IOC)**. Laquelle ?\n\n" +
        LOG_LINES.map((line, i) => `**${i + 1}.** \`${line}\``).join("\n"),
    ),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      LOG_LINES.map((_, i) =>
        new ButtonBuilder().setCustomId(`${BLUE_TEAM_CUSTOM_ID_PREFIX}${i}`).setLabel(`Ligne ${i + 1}`).setStyle(ButtonStyle.Secondary),
      ),
    ),
  );

  return containerPayload(container);
}

export function buildBlueTeamResult(chosenIndex: number): ContainerPayload {
  const correct = chosenIndex === IOC_LINE_INDEX;

  const container = baseContainer(correct ? "✅ Bon diagnostic !" : "❌ Ce n'est pas ça", correct ? COLOR_GREEN : COLOR_RED).addTextDisplayComponents(
    textDisplay(
      `La ligne **${IOC_LINE_INDEX + 1}** était le signal à repérer :\n` +
        `\`${LOG_LINES[IOC_LINE_INDEX]}\`\n\n` +
        "**Pourquoi c'est un IOC :** connexion réussie avec le compte `admin`, à une heure " +
        "inhabituelle (3h14 du matin), depuis une adresse IP située dans un pays où " +
        "l'entreprise n'a aucun employé. Trois signaux qui, cumulés, dépassent largement " +
        "le seuil du hasard.\n\n" +
        (correct
          ? "🏆 Succès débloqué : **Analyste Blue Team**"
          : "Les autres lignes sont des événements normaux (sauvegarde planifiée, connexion bureau habituelle, échec de connexion isolé)."),
    ),
  );

  return containerPayload(container);
}
