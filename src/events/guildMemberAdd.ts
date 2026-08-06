import type { Event } from "../types/event.js";
import { buildGuideDmContent } from "../community/guideView.js";
import { trySendDirectMessage } from "../utils/dm.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("guildMemberAdd");

/**
 * Envoie le guide Nodify en DM dès qu'un membre rejoint un serveur où le
 * bot est installé — best-effort (DM fermés = simplement ignoré, le post
 * public du salon hub + `/guide` restent disponibles en secours).
 */
const event: Event<"guildMemberAdd"> = {
  name: "guildMemberAdd",
  async execute(member) {
    if (member.user.bot) return;

    const sent = await trySendDirectMessage(member.user, buildGuideDmContent());
    if (!sent) {
      log.debug({ userId: member.id, guildId: member.guild.id }, "Guide de bienvenue non envoyé (DM fermés)");
    }
  },
};

export default event;
