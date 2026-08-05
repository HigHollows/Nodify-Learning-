// Point d'entrée racine pour les panels d'hébergement (ex: Pterodactyl/Bot-Hosting)
// qui lancent `node index.js` par défaut, sans étape de build/migration
// configurable dans leur commande de démarrage. Le vrai code compilé vit
// dans dist/ (généré automatiquement par le script "postinstall" à chaque
// `npm install` — voir package.json).
//
// On applique aussi les migrations Prisma ici, juste avant de démarrer :
// c'est le seul point garanti de s'exécuter avec les vraies variables
// d'environnement du conteneur (DATABASE_URL...) à chaque redémarrage.
import { execSync } from "node:child_process";

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Échec de l'application des migrations Prisma :", error.message);
  process.exit(1);
}

await import("./dist/index.js");
