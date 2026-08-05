import { PrismaClient } from "@prisma/client";
import type { SkillCategory } from "../src/types/skill.js";

const prisma = new PrismaClient();

/**
 * Catalogue initial de compétences (Phase 3). Volontairement non-exhaustif :
 * assez pour couvrir les domaines listés dans la vision Nodify, sans lister
 * les dizaines de technologies qui n'auront de sens qu'une fois l'Academy
 * (Phase 5) et la Cyber Academy (Phase 8) réellement construites.
 */
const SKILLS: { key: string; name: string; category: SkillCategory }[] = [
  // Development
  { key: "javascript", name: "JavaScript", category: "DEVELOPMENT" },
  { key: "typescript", name: "TypeScript", category: "DEVELOPMENT" },
  { key: "nodejs", name: "Node.js", category: "DEVELOPMENT" },
  { key: "python", name: "Python", category: "DEVELOPMENT" },
  { key: "sql", name: "SQL", category: "DEVELOPMENT" },
  { key: "html-css", name: "HTML/CSS", category: "DEVELOPMENT" },
  { key: "git", name: "Git", category: "DEVELOPMENT" },
  { key: "apis", name: "APIs & REST", category: "DEVELOPMENT" },

  // Cybersecurity
  { key: "cyber-fundamentals", name: "Cybersecurity Fundamentals", category: "CYBERSECURITY" },
  { key: "web-security", name: "Web Security", category: "CYBERSECURITY" },
  { key: "cryptography", name: "Cryptography", category: "CYBERSECURITY" },
  { key: "secure-coding", name: "Secure Coding", category: "CYBERSECURITY" },

  // Networking
  { key: "networking-fundamentals", name: "Networking Fundamentals", category: "NETWORKING" },
  { key: "tcp-ip", name: "TCP/IP & DNS", category: "NETWORKING" },

  // AI
  { key: "ai-fundamentals", name: "AI Fundamentals", category: "AI" },

  // Systems
  { key: "linux", name: "Linux", category: "SYSTEMS" },
  { key: "windows", name: "Windows", category: "SYSTEMS" },

  // Cloud
  { key: "docker", name: "Docker", category: "CLOUD" },
  { key: "cloud-fundamentals", name: "Cloud Fundamentals", category: "CLOUD" },
];

const ACHIEVEMENTS = [
  {
    key: "welcome",
    name: "Bienvenue sur Nodify",
    description: "Ta toute première interaction avec Nodify.",
    icon: "👋",
  },
];

async function main() {
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { key: skill.key },
      create: skill,
      update: { name: skill.name, category: skill.category },
    });
  }
  console.log(`✅ ${SKILLS.length} compétence(s) synchronisée(s)`);

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      create: achievement,
      update: achievement,
    });
  }
  console.log(`✅ ${ACHIEVEMENTS.length} succès synchronisé(s)`);
}

main()
  .catch((error) => {
    console.error("❌ Échec du seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
