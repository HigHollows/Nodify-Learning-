import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
  baseContainer,
  containerPayload,
  EmbedColors,
  messageViewPayload,
  textDisplay,
  thinSeparator,
  type ContainerPayload,
  type MessageViewPayload,
} from "../ui/container.js";

export const GUIDE_DM_BUTTON_ID = "guide:dm";

const COLOR_BLUE = 0x5865f2;

/**
 * Posté une seule fois dans le salon hub, à la toute première création du
 * salon par /setup (voir setupService.ts) — pas à chaque relance de /setup
 * (qui est idempotente et ne doit pas re-spammer le salon d'un message déjà
 * présent). Volontairement court : le détail complet est dans /guide (DM).
 */
export function buildGuidePublicPost(): MessageViewPayload {
  const container = baseContainer("🧠 Bienvenue sur Nodify", COLOR_BLUE).addTextDisplayComponents(
    textDisplay(
      "Nodify est un bot d'apprentissage pour le développement, la cybersécurité et l'IA — cours interactifs, " +
        "exercices pratiques, défis CTF, dictionnaire technique et outils IA, directement dans Discord.\n\n" +
        "Utilise **`/guide`** (ou clique sur le bouton ci-dessous) pour recevoir en message privé un guide complet " +
        "expliquant comment tout fonctionne — pas besoin d'encombrer ce salon.",
    ),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(GUIDE_DM_BUTTON_ID).setLabel("📬 Recevoir le guide en DM").setStyle(ButtonStyle.Primary),
    ),
  );

  return messageViewPayload(container);
}

/**
 * Guide complet envoyé en DM — un container par grande section plutôt qu'un
 * seul bloc de texte géant, pour rester lisible (et sous la limite de
 * longueur d'un TextDisplay Components V2).
 */
export function buildGuideDmContent(): MessageViewPayload {
  const container = baseContainer("🧠 Guide Nodify", COLOR_BLUE).addTextDisplayComponents(
    textDisplay(
      "Nodify t'aide à progresser en **développement**, **cybersécurité** et **IA** à travers des cours, des " +
        "exercices, des défis, un dictionnaire technique et des outils IA — tout gratuitement, directement dans Discord.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**🎓 Academy**\n" +
        "`/learn` — cours interactifs (JS, TS, Python, Backend, DevOps, SQL, Git...) avec quiz de validation à chaque leçon.\n" +
        "`/plan` — génère un parcours d'apprentissage personnalisé avec l'IA.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**🛡️ Cyber Academy**\n" +
        "`/cyber learn` — cours de cybersécurité (fondamentaux, Red Team, Blue Team, OWASP...).\n" +
        "`/cyber ctf list|challenge|leaderboard` — défis CTF autonomes (crypto, OSINT, forensics, web, reverse, linux, network).\n" +
        "`/cyber simulation` / `/cyber blueteam` — mini-jeux pédagogiques (ingénierie sociale, analyse de logs).",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**🏋️ Exercices pratiques**\n" +
        "`/exercise list|practice` — QCM et défis courts (debug, trouve le bug, complète le code), rejouables librement.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**📖 Dictionnaire technique**\n" +
        "`/dictionary` (ou `/dict`, `/term`, `/define`) — des centaines de concepts (dev, réseau, cyber, IA, cloud, systèmes), " +
        "avec explications débutant/avancé et concepts liés.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**🤖 Outils IA**\n" +
        "`/explainme` — pose n'importe quelle question technique.\n" +
        "`/codereview`, `/securityreview`, `/debugme` — colle du code, reçois une analyse détaillée en DM.\n" +
        "`/docs` — recherche dans la documentation technique intégrée.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**📈 Progression**\n" +
        "Chaque leçon/exercice/défi terminé donne de l'XP — ton niveau (Beginner → Expert) et tes compétences " +
        "débloquent automatiquement des rôles Discord. Des badges récompensent des jalons précis (dev, cyber, IA). " +
        "`/objectives` récapitule ton engagement du jour. `/profile` et `/leaderboard` montrent ta progression.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**💳 Crédits**\n" +
        "Les outils IA consomment des crédits (pas une monnaie réelle, non achetables) — `/daily`, `/weekly`, `/monthly` " +
        "en offrent régulièrement, et apprendre en rapporte aussi. `/balance` et `/credits` pour suivre ton solde.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      "**🌐 Communauté**\n" +
        "`/trivia` — question technique du jour (aussi postée automatiquement chaque jour).\n" +
        "`/news` — dernières actualités tech vérifiées.\n\n" +
        "-# Liste complète de toutes les commandes : `/help`",
    ),
  );

  return messageViewPayload(container);
}

export function buildGuideDmSentReply(): ContainerPayload {
  return containerPayload(
    baseContainer("✅ Vérifie tes messages privés", EmbedColors.operational).addTextDisplayComponents(
      textDisplay("Je t'ai envoyé le guide complet de Nodify en message privé."),
    ),
  );
}

export function buildGuideDmFailedReply(): ContainerPayload {
  return containerPayload(
    baseContainer("❌ Impossible de t'envoyer un message privé", EmbedColors.critical).addTextDisplayComponents(
      textDisplay(
        "Active tes messages privés pour ce serveur (Paramètres de confidentialité du serveur → " +
          "Autoriser les messages privés des membres du serveur), puis relance `/guide`.",
      ),
    ),
  );
}
