import type { ProfileView } from "../../services/profileService.js";
import { baseContainer, containerPayload, fieldText, textDisplay, thinSeparator, type ContainerPayload } from "../../ui/container.js";

const COLOR_PURPLE = 0x9b59b6;

function compareLine(label: string, a: number, b: number, format: (n: number) => string = String): string {
  const arrow = a > b ? "◀" : a < b ? "▶" : "▪";
  return `${label} : **${format(a)}** ${arrow} **${format(b)}**`;
}

export function buildCompareReply(a: ProfileView, b: ProfileView): ContainerPayload {
  const levelArrow = a.level.index > b.level.index ? "◀" : a.level.index < b.level.index ? "▶" : "▪";

  const container = baseContainer(`⚔️ ${a.username} vs ${b.username}`, COLOR_PURPLE).addTextDisplayComponents(
    textDisplay(
      [
        `Niveau : **${a.level.name}** ${levelArrow} **${b.level.name}**`,
        compareLine("🔥 Streak actuel", a.currentStreak, b.currentStreak, (n) => `${n}j`),
        compareLine("🏆 Streak record", a.longestStreak, b.longestStreak, (n) => `${n}j`),
        compareLine("🎖️ Succès débloqués", a.achievementsUnlockedCount, b.achievementsUnlockedCount),
        compareLine("💡 Compétences actives", a.skills.length, b.skills.length),
      ].join("\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay(
      fieldText(
        "🏆 Succès exclusifs",
        (() => {
          const aNames = new Set(a.achievements.map((x) => x.name));
          const bNames = new Set(b.achievements.map((x) => x.name));
          const onlyA = a.achievements.filter((x) => !bNames.has(x.name)).map((x) => x.name);
          const onlyB = b.achievements.filter((x) => !aNames.has(x.name)).map((x) => x.name);
          return (
            `${a.username} seulement : ${onlyA.length > 0 ? onlyA.join(", ") : "_aucun_"}\n` +
            `${b.username} seulement : ${onlyB.length > 0 ? onlyB.join(", ") : "_aucun_"}`
          );
        })(),
      ),
    ),
  );

  return containerPayload(container);
}
