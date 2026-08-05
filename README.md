# Nodify

Plateforme éducative technique intelligente (développement, cybersécurité, IA,
documentation) intégrée à Discord. Nodify n'est **pas** un bot de modération.

## Stack (Phase 1)

- **Runtime** : Node.js 20+, TypeScript (ESM), [discord.js](https://discord.js.org) v14
- **Database** : SQLite via [Prisma](https://prisma.io) (migration vers PostgreSQL possible plus tard sans changer le code applicatif — seul le schéma et l'URL changent)
- **Logging** : [pino](https://getpino.io) (JSON en prod, coloré en dev)
- **Config** : validée au démarrage avec [zod](https://zod.dev) — le bot refuse de démarrer si `.env` est incomplet

## Architecture

```
src/
├── commands/        Slash commands (Command Discord ↓ Service ↓ Repository ↓ DB)
├── events/          Handlers d'events Discord.js (ready, interactionCreate...)
├── loaders/         Chargement dynamique des commandes/events au démarrage
├── database/        Client Prisma partagé
├── config/          Validation des variables d'environnement
├── utils/           Logger, erreurs applicatives typées
├── types/           Contrats partagés (Command, Event)
├── ai/               (Phase 6 — AIService centralisé)
├── knowledge/        (Phase 4 — Knowledge Engine : concepts, dictionnaire)
├── education/        (Phase 5 — Academy : cours, quiz, progression)
├── cybersecurity/     (Phase 8 — Cyber Academy, CTF, labs)
├── documentation/     (Phase 6 — RAG sur docs techniques)
├── news/              (Phase 9 — Hacktualités, question du jour)
└── setup/             (Phase 2 — /setup, rôles/salons auto)
```

Les dossiers de phases futures existent déjà (vides, avec `.gitkeep`) pour que
l'arborescence reflète l'architecture cible dès maintenant, sans qu'on y mette
de code avant d'avoir réellement conçu ces systèmes.

## Setup

1. Copier `.env.example` en `.env` et renseigner :
   - `DISCORD_TOKEN` et `DISCORD_CLIENT_ID` (Discord Developer Portal)
   - `DISCORD_GUILD_ID` (optionnel en dev — déploiement instantané des commandes sur un seul serveur au lieu d'attendre la propagation globale ~1h)

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Générer le client Prisma et créer la base SQLite :
   ```bash
   npm run prisma:migrate -- --name init
   ```

4. Déployer les slash commands sur Discord :
   ```bash
   npm run deploy:commands
   ```

5. Lancer le bot en dev (rechargement auto) :
   ```bash
   npm run dev
   ```

## Vérifier que ça marche

Une fois le bot en ligne, taper `/ping` sur le serveur Discord configuré →
doit répondre avec la latence. Si ça répond, le command loader, l'event
loader, la connexion Discord et la gestion d'erreurs fonctionnent bout en
bout — les fondations de la Phase 1 sont posées.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le bot en mode watch (tsx) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Lance la version compilée |
| `npm run deploy:commands` | (Re)déploie les slash commands sur Discord |
| `npm run prisma:migrate` | Applique une migration DB |
| `npm run prisma:studio` | Interface graphique pour inspecter la DB |
| `npm run typecheck` | Vérifie les types sans compiler |

## Roadmap

Voir les phases dans le prompt fondateur du projet. Statut actuel :
- ✅ **Phase 1** — Architecture, Database, Discord.js, Config, Logging, Command/Event loader
- ✅ **Phase 2** — `/setup` (rôles de niveau + salon hub), auto-recovery idempotente

Prochaine étape : Phase 3 (User Profile, Skills, Progression, Achievements).

### `/setup`

Crée (ou répare) :
- Rôles de progression 🌱 Beginner → 🔴 Expert
- Catégorie **🧠 NODIFY** avec un salon `#nodify`

Idempotente : relancer `/setup` ne duplique rien. Si un rôle/salon créé par
Nodify est supprimé, le relancer le recrée automatiquement (♻️ dans le
rapport). Nodify ne touche jamais aux ressources qu'il n'a pas créées
lui-même — seuls les IDs qu'il a stockés en base sont vérifiés/réparés.
Nécessite la permission Discord **Gérer le serveur** pour être exécutée, et
que le bot ait lui-même **Gérer les rôles** + **Gérer les salons**.
