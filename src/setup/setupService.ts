import type { Guild } from "discord.js";
import { ChannelType, PermissionsBitField } from "discord.js";
import {
  getManagedResources,
  setManagedResources,
  upsertGuild,
  type ManagedResourceMap,
} from "../database/repositories/guildRepository.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";
import { buildGuidePublicPost } from "../community/guideView.js";
import {
  HUB_CATEGORY,
  LEVEL_ROLES,
  REQUIRED_BOT_PERMISSIONS,
} from "./resources.js";

const log = childLogger("setupService");

export type ResourceStatus = "created" | "recovered" | "already_ok";

export interface SetupResourceResult {
  label: string;
  status: ResourceStatus;
}

export interface SetupReport {
  roles: SetupResourceResult[];
  channels: SetupResourceResult[];
}

function assertBotHasPermissions(guild: Guild): void {
  const me = guild.members.me;
  if (!me) {
    throw new AppError("Je n'arrive pas à vérifier mes propres permissions sur ce serveur.");
  }

  const missing = REQUIRED_BOT_PERMISSIONS.filter((perm) => !me.permissions.has(perm));
  if (missing.length > 0) {
    const names = new PermissionsBitField(missing).toArray().join(", ");
    throw new AppError(
      `Il me manque des permissions pour configurer le serveur : **${names}**. ` +
        "Donne-moi ces permissions puis relance /setup.",
    );
  }
}

/**
 * Fait converger les rôles de niveau vers leur définition attendue.
 * Idempotent : un rôle déjà présent (id connu ET toujours existant) n'est pas retouché.
 *
 * Avant de créer quoi que ce soit, on cherche aussi par NOM parmi les rôles
 * déjà présents sur le serveur — pas seulement par l'id connu en base. Sans
 * ce repli, un id perdu (ligne DB réinitialisée, ancienne installation...)
 * faisait créer un doublon du rôle alors qu'un rôle au même nom existait
 * déjà sur le serveur, jamais reconnu comme tel.
 */
async function reconcileLevelRoles(
  guild: Guild,
  knownRoleIds: ManagedResourceMap,
): Promise<{ results: SetupResourceResult[]; updated: ManagedResourceMap }> {
  const results: SetupResourceResult[] = [];
  const updated: ManagedResourceMap = { ...knownRoleIds };

  for (const def of LEVEL_ROLES) {
    const knownId = knownRoleIds[def.key];
    const existing = knownId ? guild.roles.cache.get(knownId) : undefined;

    if (existing) {
      results.push({ label: def.name, status: "already_ok" });
      continue;
    }

    const foundByName = guild.roles.cache.find((r) => r.name === def.name);
    if (foundByName) {
      updated[def.key] = foundByName.id;
      results.push({ label: def.name, status: "recovered" });
      log.info({ guildId: guild.id, role: def.name }, "Rôle de niveau retrouvé par nom (id non suivi/perdu) — pas de doublon créé");
      continue;
    }

    const role = await guild.roles.create({
      name: def.name,
      color: def.color,
      mentionable: false,
      reason: "Nodify /setup — rôle de progression",
    });

    updated[def.key] = role.id;
    results.push({ label: def.name, status: knownId ? "recovered" : "created" });
    log.info({ guildId: guild.id, role: def.name }, "Rôle de niveau créé/réparé");
  }

  return { results, updated };
}

/**
 * Fait converger la catégorie + les salons du hub Nodify.
 *
 * Même repli par nom que `reconcileLevelRoles` (voir son commentaire) :
 * avant de créer, on cherche aussi une catégorie/un salon déjà présent avec
 * le nom attendu, pas seulement l'id connu en base — évite de dupliquer la
 * catégorie/le salon quand l'id suivi a été perdu alors que la ressource
 * existe toujours sur le serveur.
 */
async function reconcileHub(
  guild: Guild,
  knownChannelIds: ManagedResourceMap,
): Promise<{ results: SetupResourceResult[]; updated: ManagedResourceMap }> {
  const results: SetupResourceResult[] = [];
  const updated: ManagedResourceMap = { ...knownChannelIds };

  const knownCategoryId = knownChannelIds[HUB_CATEGORY.key];
  let category = knownCategoryId ? guild.channels.cache.get(knownCategoryId) : undefined;

  if (!category) {
    category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === HUB_CATEGORY.name,
    );

    if (category) {
      updated[HUB_CATEGORY.key] = category.id;
      log.info({ guildId: guild.id }, "Catégorie hub retrouvée par nom (id non suivi/perdu) — pas de doublon créé");
    }
  }

  let categoryJustCreated = false;
  if (!category) {
    category = await guild.channels.create({
      name: HUB_CATEGORY.name,
      type: ChannelType.GuildCategory,
      reason: "Nodify /setup — catégorie hub",
    });
    updated[HUB_CATEGORY.key] = category.id;
    categoryJustCreated = true;
    log.info({ guildId: guild.id }, "Catégorie hub créée/réparée");
  }

  for (const chanDef of HUB_CATEGORY.channels) {
    const knownId = knownChannelIds[chanDef.key];
    const existing = knownId ? guild.channels.cache.get(knownId) : undefined;

    if (existing) {
      results.push({ label: `#${chanDef.name}`, status: "already_ok" });
      continue;
    }

    // Cherche uniquement dans la catégorie hub (pas n'importe où sur le
    // serveur) — un salon au même nom ailleurs n'est pas "le" salon Nodify.
    const foundByName = categoryJustCreated
      ? undefined
      : guild.channels.cache.find(
          (c) => c.type === ChannelType.GuildText && c.parentId === category!.id && c.name === chanDef.name,
        );

    if (foundByName) {
      updated[chanDef.key] = foundByName.id;
      results.push({ label: `#${chanDef.name}`, status: "recovered" });
      log.info({ guildId: guild.id, channel: chanDef.name }, "Salon hub retrouvé par nom (id non suivi/perdu) — pas de doublon créé");
      continue;
    }

    const channel = await guild.channels.create({
      name: chanDef.name,
      type: ChannelType.GuildText,
      topic: chanDef.topic,
      parent: category.id,
      reason: "Nodify /setup — salon hub",
    });

    updated[chanDef.key] = channel.id;
    results.push({ label: `#${chanDef.name}`, status: knownId ? "recovered" : "created" });
    log.info({ guildId: guild.id, channel: chanDef.name }, "Salon hub créé/réparé");

    if (chanDef.key === HUB_CATEGORY.channels[0]!.key) {
      // Salon vraiment neuf (jamais existé, ni par id ni par nom) : jamais
      // de message de guide dedans encore — on le poste une fois, ici. Ne
      // s'exécute ni aux relances normales de /setup (`existing` plus haut),
      // ni en cas de récupération par id/nom (channel déjà là, contenu
      // potentiellement déjà présent — on ne le re-spamme pas).
      await channel.send(buildGuidePublicPost()).catch((err: unknown) => {
        log.warn({ err, guildId: guild.id }, "Échec de l'envoi du message de guide dans le salon hub");
      });
    }
  }

  return { results, updated };
}

/**
 * Point d'entrée unique du setup. Idempotent : peut être relancée à tout
 * moment pour réparer ce que Nodify a créé et qui aurait été supprimé.
 */
export async function runSetup(guild: Guild): Promise<SetupReport> {
  assertBotHasPermissions(guild);
  await upsertGuild(guild.id, guild.name);

  const managed = await getManagedResources(guild.id);

  const rolesResult = await reconcileLevelRoles(guild, managed.roles);
  const channelsResult = await reconcileHub(guild, managed.channels);

  await setManagedResources(guild.id, {
    roles: rolesResult.updated,
    channels: channelsResult.updated,
  });

  return { roles: rolesResult.results, channels: channelsResult.results };
}
