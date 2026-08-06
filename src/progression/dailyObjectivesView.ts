import type { DailyObjective } from "./dailyObjectivesService.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../ui/container.js";

const COLOR_TEAL = 0x1abc9c;

export function buildDailyObjectivesReply(objectives: DailyObjective[]): ContainerPayload {
  const completedCount = objectives.filter((o) => o.completed).length;

  const container = baseContainer("🎯 Objectifs du jour", COLOR_TEAL).addTextDisplayComponents(
    textDisplay(
      objectives.map((o) => `${o.completed ? "✅" : "⬜"} ${o.label}`).join("\n") +
        `\n\n-# ${completedCount}/${objectives.length} accomplis aujourd'hui (minuit UTC) — chaque action compte déjà pour sa propre récompense (XP, crédits, badges), ceci n'est qu'un récapitulatif.`,
    ),
  );

  return containerPayload(container);
}
