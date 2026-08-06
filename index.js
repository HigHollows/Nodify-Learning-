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

// Le seed (prisma/seed.ts) est entièrement idempotent (upsert partout, voir
// le commentaire en tête du fichier) — le relancer à chaque démarrage ne
// duplique jamais rien et coûte quelques centaines de requêtes rapides.
// Sans ça, un déploiement sur un panel d'hébergement qui ne lance que
// `node index.js` (jamais `npm run prisma:seed` manuellement) démarre avec
// des tables de catalogue vides : achievements introuvables, aucune
// question du jour disponible, dictionnaire/Academy/CTF vides — le bot
// tourne mais tout son contenu manque silencieusement. Un échec ici est
// loggé mais ne doit jamais empêcher le bot de démarrer : il continuera de
// fonctionner avec le catalogue déjà en base (le cas normal après le tout
// premier seed réussi).
try {
  execSync("npx prisma db seed", { stdio: "inherit" });
} catch (error) {
  console.error("⚠️ Échec du seed du catalogue (contenu potentiellement incomplet) :", error.message);
}

await import("./dist/index.js");
