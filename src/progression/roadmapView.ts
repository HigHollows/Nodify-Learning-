import type { RoadmapCourse } from "./roadmapService.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../types/skill.js";
import { baseContainer, containerPayload, textDisplay, thinSeparator, type ContainerPayload } from "../ui/container.js";

const COLOR_BLUE = 0x3498db;

const STATUS_ICON: Record<RoadmapCourse["status"], string> = {
  completed: "✅",
  in_progress: "▶️",
  not_started: "⬜",
};

function courseLine(course: RoadmapCourse): string {
  const icon = course.locked ? "🔒" : STATUS_ICON[course.status];
  const prereqNote = course.locked ? ` — nécessite : ${course.prerequisiteTitles.join(", ")}` : "";
  return `${icon} **${course.title}** (Niveau ${course.level})${prereqNote}`;
}

export function buildRoadmapReply(courses: RoadmapCourse[]): ContainerPayload {
  const container = baseContainer("🗺️ Roadmap Nodify Academy", COLOR_BLUE).addTextDisplayComponents(
    textDisplay("-# ✅ terminé · ▶️ en cours · ⬜ disponible · 🔒 prérequis manquants"),
  );

  const byCategory = new Map<string, RoadmapCourse[]>();
  for (const course of courses) {
    const list = byCategory.get(course.category) ?? [];
    list.push(course);
    byCategory.set(course.category, list);
  }

  for (const [category, list] of byCategory) {
    container.addSeparatorComponents(thinSeparator());
    const label = SKILL_CATEGORY_LABELS[category as SkillCategory] ?? category;
    container.addTextDisplayComponents(textDisplay(`**${label}**\n` + list.map(courseLine).join("\n")));
  }

  return containerPayload(container);
}
