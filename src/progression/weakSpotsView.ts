import type { WeakSpot } from "./weakSpotsService.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../types/skill.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../ui/container.js";

const COLOR_ORANGE = 0xe67e22;

export function buildWeakSpotsReply(weakSpot: WeakSpot | null): ContainerPayload {
  if (!weakSpot) {
    return containerPayload(
      baseContainer("🎯 Points faibles", COLOR_ORANGE).addTextDisplayComponents(
        textDisplay(
          "Pas encore assez de données pour repérer un point faible fiable — réponds à quelques questions du jour " +
            "ou termine des leçons Academy, puis reviens voir ici.",
        ),
      ),
    );
  }

  const categoryLabel = SKILL_CATEGORY_LABELS[weakSpot.category as SkillCategory] ?? weakSpot.category;

  const lines = [
    `Ta catégorie la moins solide en ce moment : **${categoryLabel}** — ${weakSpot.accuracyPercent}% de bonnes réponses ` +
      `sur ${weakSpot.sampleSize} question${weakSpot.sampleSize > 1 ? "s" : ""} (question du jour + quiz Academy combinés).`,
  ];

  if (weakSpot.suggestedCourseKey) {
    lines.push(`\n📚 Cours suggéré : \`/learn cours:${weakSpot.suggestedCourseKey}\``);
  }
  if (weakSpot.suggestedConceptKey) {
    lines.push(`📖 Concept à revoir : \`/dictionary terme:${weakSpot.suggestedConceptKey}\``);
  }

  const container = baseContainer("🎯 Points faibles", COLOR_ORANGE).addTextDisplayComponents(textDisplay(lines.join("\n")));

  return containerPayload(container);
}
