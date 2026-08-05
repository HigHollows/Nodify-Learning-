/**
 * Catégories de compétences, alignées sur les domaines Nodify Academy.
 * Stocké en String côté Prisma (SQLite ne supporte pas les enums natifs) —
 * ce type est la seule source de vérité sur les valeurs valides.
 */
export const SKILL_CATEGORIES = [
  "DEVELOPMENT",
  "CYBERSECURITY",
  "NETWORKING",
  "AI",
  "SYSTEMS",
  "CLOUD",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  DEVELOPMENT: "💻 Development",
  CYBERSECURITY: "🛡️ Cybersecurity",
  NETWORKING: "🌐 Networking",
  AI: "🤖 AI",
  SYSTEMS: "🖥️ Systems",
  CLOUD: "☁️ Cloud",
};
