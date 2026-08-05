import {
  getOrCreateGuildConfig,
  updateModuleFlags,
  type ModuleFlags,
} from "../database/repositories/guildRepository.js";
import { AppError } from "../utils/errors.js";

export type ModuleName = "academy" | "cyber" | "news" | "dailyQuestion";

const MODULE_FIELD: Record<ModuleName, keyof ModuleFlags> = {
  academy: "academyEnabled",
  cyber: "cyberEnabled",
  news: "newsEnabled",
  dailyQuestion: "dailyQuestionEnabled",
};

export async function getModuleFlags(guildId: string): Promise<ModuleFlags> {
  const config = await getOrCreateGuildConfig(guildId);
  return {
    academyEnabled: config.academyEnabled,
    cyberEnabled: config.cyberEnabled,
    newsEnabled: config.newsEnabled,
    dailyQuestionEnabled: config.dailyQuestionEnabled,
  };
}

export async function setModuleFlags(guildId: string, updates: Partial<ModuleFlags>): Promise<void> {
  await updateModuleFlags(guildId, updates);
}

/**
 * À appeler en tête de commande pour les modules désactivables (/learn,
 * /cyber, /daily). Hors guild (DM) : pas de restriction, les réglages de
 * modules sont un concept par-serveur, une DM n'a pas de guild à consulter.
 */
export async function assertModuleEnabled(
  guildId: string | null,
  module: ModuleName,
): Promise<void> {
  if (!guildId) return;

  const flags = await getModuleFlags(guildId);
  const enabled = flags[MODULE_FIELD[module]];

  if (!enabled) {
    throw new AppError(
      "Ce module est désactivé sur ce serveur — un admin peut le réactiver avec `/settings`.",
    );
  }
}
