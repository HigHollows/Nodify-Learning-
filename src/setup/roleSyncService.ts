import { PermissionFlagsBits, type Guild } from "discord.js";
import {
  getManagedResources,
  setManagedResources,
} from "../database/repositories/guildRepository.js";
import { getUserProfile } from "../database/repositories/userRepository.js";
import { LEVEL_ROLES } from "./resources.js";
import { childLogger } from "../utils/logger.js";
import { levelForXp } from "../utils/leveling.js";

const log = childLogger("roleSyncService");

/** Préfixe des clés de ressources gérées pour les rôles de compétence dynamiques. */
function skillRoleKey(skillKey: string): string {
  return `skill_${skillKey}`;
}

/**
 * Synchronise sur UNE guild les rôles Nodify d'un utilisateur (niveau global
 * + compétences) avec son profil réel. Appelé après qu'une leçon Academy ait
 * été validée (seule vraie source d'XP), dans le contexte de la guild où
 * l'interaction a eu lieu — pas besoin d'itérer sur toutes les guildes du
 * bot à chaque XP gagnée.
 *
 * Résilient par conception : toute erreur (permissions manquantes, membre
 * introuvable, /setup jamais lancé...) est loggée et avalée, jamais
 * remontée à l'utilisateur — la progression IRL ne doit jamais être
 * bloquée par un souci de synchronisation de rôle Discord.
 */
export async function syncUserRolesForGuild(guild: Guild, userId: string): Promise<void> {
  try {
    const me = guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return; // pas les permissions (ou /setup jamais lancé) — rien à faire silencieusement
    }

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return; // utilisateur pas (ou plus) membre de cette guild

    const profile = await getUserProfile(userId);
    if (!profile) return;

    const managed = await getManagedResources(guild.id);
    let rolesMap = managed.roles;
    let rolesMapChanged = false;

    // --- Rôles de niveau : un seul actif à la fois, les autres retirés ---
    const level = levelForXp(profile.totalXp);
    const desiredLevelDef = LEVEL_ROLES.find((r) => r.order === level.index + 1);
    const desiredLevelRoleId = desiredLevelDef ? rolesMap[desiredLevelDef.key] : undefined;

    for (const levelDef of LEVEL_ROLES) {
      const roleId = rolesMap[levelDef.key];
      if (!roleId) continue; // rôle jamais créé (/setup jamais lancé) — on ne le crée pas ici

      const has = member.roles.cache.has(roleId);
      if (roleId === desiredLevelRoleId && !has) {
        await member.roles.add(roleId, "Nodify — progression de niveau").catch((err: unknown) => {
          log.warn({ err, guildId: guild.id, userId }, "Échec d'ajout du rôle de niveau");
        });
      } else if (roleId !== desiredLevelRoleId && has) {
        await member.roles.remove(roleId, "Nodify — progression de niveau").catch((err: unknown) => {
          log.warn({ err, guildId: guild.id, userId }, "Échec de retrait du rôle de niveau");
        });
      }
    }

    // --- Rôles de compétence : créés dynamiquement à la première XP gagnée ---
    for (const userSkill of profile.skills) {
      if (userSkill.xp <= 0) continue;

      const resourceKey = skillRoleKey(userSkill.skill.key);
      let roleId = rolesMap[resourceKey];

      if (!roleId || !guild.roles.cache.has(roleId)) {
        const role = await guild.roles
          .create({
            name: `💡 ${userSkill.skill.name}`,
            color: "Blurple",
            mentionable: false,
            reason: "Nodify — rôle de compétence dynamique",
          })
          .catch((err: unknown) => {
            log.warn({ err, guildId: guild.id, skill: userSkill.skill.key }, "Échec de création du rôle de compétence");
            return null;
          });

        if (!role) continue;
        roleId = role.id;
        rolesMap = { ...rolesMap, [resourceKey]: roleId };
        rolesMapChanged = true;
      }

      if (!member.roles.cache.has(roleId)) {
        await member.roles.add(roleId, "Nodify — compétence acquise").catch((err: unknown) => {
          log.warn({ err, guildId: guild.id, userId }, "Échec d'ajout du rôle de compétence");
        });
      }
    }

    if (rolesMapChanged) {
      await setManagedResources(guild.id, { channels: managed.channels, roles: rolesMap });
    }
  } catch (error) {
    log.warn({ err: error, guildId: guild.id, userId }, "Échec de la synchronisation des rôles");
  }
}
