import { prisma } from "../client.js";

/**
 * Repository : seule couche qui parle Prisma directement.
 * Les services ne doivent jamais importer `prisma` eux-mêmes — ça garde
 * les requêtes DB centralisées et remplaçables sans toucher au setupService.
 */

/** { [resourceKey]: discordSnowflakeId } — clé stable définie dans setup/resources.ts. */
export type ManagedResourceMap = Record<string, string>;

export interface ManagedResources {
  channels: ManagedResourceMap;
  roles: ManagedResourceMap;
}

function parseMap(json: string): ManagedResourceMap {
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      );
    }
    return {};
  } catch {
    return {};
  }
}

/** Crée ou met à jour l'enregistrement Guild (nom à jour à chaque /setup). */
export async function upsertGuild(guildId: string, name: string) {
  return prisma.guild.upsert({
    where: { id: guildId },
    create: { id: guildId, name },
    update: { name },
  });
}

/** Récupère la config d'une guild, en la créant si elle n'existe pas encore. */
export async function getOrCreateGuildConfig(guildId: string) {
  return prisma.guildConfig.upsert({
    where: { guildId },
    create: { guildId },
    update: {},
  });
}

export async function getManagedResources(guildId: string): Promise<ManagedResources> {
  const config = await getOrCreateGuildConfig(guildId);
  return {
    channels: parseMap(config.managedChannelIds),
    roles: parseMap(config.managedRoleIds),
  };
}

/** Remplace la carte des ressources gérées par Nodify pour cette guild. */
export async function setManagedResources(
  guildId: string,
  resources: ManagedResources,
): Promise<void> {
  await prisma.guildConfig.update({
    where: { guildId },
    data: {
      managedChannelIds: JSON.stringify(resources.channels),
      managedRoleIds: JSON.stringify(resources.roles),
    },
  });
}
