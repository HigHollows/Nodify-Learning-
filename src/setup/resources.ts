import { PermissionFlagsBits, type ColorResolvable } from "discord.js";

/**
 * Définition déclarative des ressources que Nodify crée et gère sur une guild.
 *
 * Pourquoi déclaratif : les phases futures (Academy, Cyber Academy...) ajouteront
 * leurs propres rôles/salons en étendant ces tableaux, sans jamais toucher à la
 * logique de création/réparation dans setupService.ts.
 *
 * `key` = identifiant stable interne (ne pas renommer une fois en prod : c'est
 * ce qui permet de retrouver quelle ressource Discord correspond à quelle
 * définition entre deux exécutions de /setup).
 */

export interface RoleDefinition {
  key: string;
  name: string;
  color: ColorResolvable;
  /** Position relative pour le tri des niveaux (plus haut = plus avancé). */
  order: number;
}

export interface ChannelDefinition {
  key: string;
  name: string;
  topic: string;
}

export interface CategoryDefinition {
  key: string;
  name: string;
  channels: ChannelDefinition[];
}

/** Rôles de progression globale, partagés par tous les domaines (dev, cyber...). */
export const LEVEL_ROLES: RoleDefinition[] = [
  { key: "level_beginner", name: "🌱 Beginner", color: "Green", order: 1 },
  { key: "level_novice", name: "🟢 Novice", color: "DarkGreen", order: 2 },
  { key: "level_intermediate", name: "🔵 Intermediate", color: "Blue", order: 3 },
  { key: "level_advanced", name: "🟣 Advanced", color: "Purple", order: 4 },
  { key: "level_expert", name: "🔴 Expert", color: "Red", order: 5 },
];

/** Catégorie/salon d'accueil Nodify, socle pour les futures features. */
export const HUB_CATEGORY: CategoryDefinition = {
  key: "hub_category",
  name: "🧠 NODIFY",
  channels: [
    {
      key: "hub_channel",
      name: "nodify",
      topic: "Espace Nodify — dictionnaire, cours, actus tech & cybersécurité.",
    },
  ],
};

/** Permissions requises par le bot pour exécuter /setup correctement. */
export const REQUIRED_BOT_PERMISSIONS = [
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageChannels,
];
