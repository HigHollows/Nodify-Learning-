import { SlashCommandBuilder } from "discord.js";
import { baseContainer, containerPayload, fieldText, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const COLOR_BLUE = 0x3498db;

/**
 * Regroupement statique plutôt que déduit dynamiquement des dossiers de
 * commandes : avec ~20 commandes, une liste explicite est plus simple à
 * maintenir et à relire qu'une inférence depuis les chemins de fichiers.
 */
const CATEGORIES: { title: string; commands: string[] }[] = [
  {
    title: "👤 Profil & Progression",
    commands: ["/profile", "/compare", "/achievements", "/leaderboard", "/objectives", "/weakspots", "/notifications"],
  },
  {
    title: "📖 Knowledge Engine",
    commands: ["/dictionary (+ /dict /term /define)", "/review", "/search"],
  },
  {
    title: "🎓 Academy",
    commands: ["/learn", "/plan", "/roadmap"],
  },
  {
    title: "🏋️ Exercices pratiques",
    commands: ["/exercise list", "/exercise practice", "/practice"],
  },
  {
    title: "🤖 IA",
    commands: ["/explainme", "/docs"],
  },
  {
    title: "🛠️ Dev Tools",
    commands: ["/securityreview", "/codereview", "/debugme", "/threatmodel"],
  },
  {
    title: "🛡️ Cyber Academy",
    commands: [
      "/cyber learn",
      "/cyber simulation",
      "/cyber blueteam",
      "/cyber ctf list|challenge|leaderboard",
    ],
  },
  {
    title: "🌐 Communauté",
    commands: ["/trivia", "/news", "/guide", "/duel", "/feedback"],
  },
  {
    title: "💳 Crédits & Récompenses",
    commands: [
      "/credits",
      "/balance",
      "/credit-stats",
      "/credit-history",
      "/ai-costs",
      "/daily",
      "/weekly",
      "/monthly",
    ],
  },
  {
    title: "🔧 Divers",
    commands: ["/ping", "/help"],
  },
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Liste toutes les commandes Nodify, groupées par domaine."),

  async execute(interaction) {
    const container = baseContainer("🧠 Commandes Nodify", COLOR_BLUE).addTextDisplayComponents(
      textDisplay("Tape `/` puis le nom d'une commande pour voir ses options détaillées."),
      textDisplay(
        CATEGORIES.map((cat) => fieldText(cat.title, cat.commands.map((c) => `\`${c}\``).join(" · "))).join("\n\n"),
      ),
      textDisplay("-# Commandes d'administration du serveur (Gérer le serveur requis) : `+help`"),
    );

    await interaction.reply(containerPayload(container));
  },
};

export default command;
