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
├── ai/               AIService centralisé (Phase 6)
├── knowledge/        Knowledge Engine : concepts, dictionnaire (Phase 4)
├── education/        Academy : cours, quiz, progression (Phase 5)
├── cybersecurity/     Cyber Academy, CTF, Blue/Red Team, Trust Sim (Phase 8)
├── documentation/     RAG sur docs techniques (Phase 6)
├── community/         Question du jour, Hacktualités (Phase 9)
└── setup/             /setup, rôles/salons auto (Phase 2)
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
   npm run prisma:seed
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
- ✅ **Phase 3** — User Profile global, Skills, Streak, Achievements
- ✅ **Phase 4** — Knowledge Engine : `/dictionary` (+ alias `/dict` `/term` `/define`)
- ✅ **Phase 5** — Academy : `/learn`, cours/leçons/quiz, XP réelle, progression adaptative
- ✅ **Phase 6** — AIService/ModelRouter + `/explainme` + RAG documentation (`/docs`)
- ✅ **Phase 7** — `/securityreview`, `/codereview`, `/debugme` (Debug Coach)
- ✅ **Phase 8** — Cyber Academy (`/cyber learn`), Trust Nothing Simulation,
  `/threatmodel`, Red Team Fundamentals (cours), Blue Team (simulation de
  logs), CTF (`/cyber ctf list|challenge|leaderboard`)
- ✅ **Phase 9** — Question du jour (auto-postée + `/daily`), `/leaderboard`,
  Hacktualités (`/news` + post automatique, vrais flux RSS)

**Volontairement non construit** : CTF Web/Pwn/Network/Reverse et Labs avec
cibles en direct — nécessiteraient une vraie infrastructure de sandbox/VM
isolée qui n'existe pas. Les simuler sans vraie infra serait fabriquer une
fausse capacité. Le Red Team et le Blue Team livrés sont volontairement
**conceptuels/simulés** (méthodologie, analyse de logs fictifs) plutôt que
des mises en situation avec de vraies machines.

### `/leaderboard`

Classement global par XP (profil Nodify global, pas par guild — voir Phase 3).

### Question du jour (`/daily` + post automatique)

- Catalogue de 10 questions rédigées à la main, sélection **déterministe**
  par jour UTC (même question pour tout le monde, pas de tirage aléatoire
  qui désynchroniserait `/daily` et le post automatique)
- Postée automatiquement dans le salon hub (`/setup`) de chaque guild qui
  l'a activée, vérifié toutes les 15 minutes (`src/index.ts`) — idempotent,
  ne reposte jamais deux fois le même jour
- Une seule réponse comptée par utilisateur par jour et par guild (contrainte
  DB unique, testée), même en mélangeant `/daily` et le post automatique
- **Pas de nouvelle dépendance** : aucun scheduler externe, juste un
  `setInterval` côté process — suffisant à cette échelle

### `/threatmodel`

Même schéma que Phase 7 (Modal → IA → embed) : décris une architecture ou
un flux, l'IA identifie actifs à protéger, menaces plausibles et
protections recommandées.

### Hacktualités (`/news` + post automatique)

- Vrais flux RSS de sources officielles uniquement (Node.js, GitHub,
  Cloudflare — liste dans `src/community/newsService.ts`, facile à étendre).
  **Jamais** d'actu inventée ou résumée par IA sans lien vers l'article original
- Vérifié toutes les 30 minutes. Au tout premier démarrage, le backlog
  existant des flux est marqué comme "déjà vu" **sans être posté** — sinon le
  premier lancement inonderait le salon hub avec des dizaines d'articles
  déjà anciens (testé : confirmé qu'aucun article n'est posté au bootstrap,
  seulement enregistré)
- Anti-doublon global par `guid` d'article (contrainte unique DB), pas
  d'embeddings ni de résumé — le dédoublonnage RSS est un problème résolu,
  pas la peine de le complexifier

### Red Team Fundamentals (cours Academy)

Cours conceptuel de plus sur le moteur Academy existant (méthodologie
recon/énumération/exploitation/privesc/reporting) — **pas** de vraies
techniques offensives applicables, uniquement de la théorie avec rappel
systématique du cadre légal (autorisation écrite requise).

### Blue Team (`/cyber blueteam`)

Simulation d'analyse de logs 100% fictive et statique : identifie
l'indicateur de compromission (IOC) parmi 5 lignes de log plausibles.
Explique la réponse dans tous les cas (bonne ou mauvaise), débloque
l'achievement **Analyste Blue Team** en cas de bon diagnostic.

### CTF (`/cyber ctf list|challenge|leaderboard`)

4 défis autonomes rédigés à la main — **crypto** (César, Base64) et
**OSINT/Forensics** (repérer une fuite d'info, un indicateur suspect) —
volontairement pas de Web/Pwn/Network/Reverse qui nécessiteraient une
vraie cible en direct. Soumission par Modal, réponses comparées après
normalisation (accents/casse/espaces — testé avec des variantes réelles).
Points crédités une seule fois par défi (contrainte DB unique), classement
séparé de l'XP Academy (sémantiques différentes : apprentissage vs défi).

### AIService (`src/ai/`)

- **ModelRouter** minimal : un seul provider actif, choisi au démarrage selon
  la config. Priorité : `AnthropicProvider` (si `ANTHROPIC_API_KEY`) >
  `GroqProvider` (si `GROQ_API_KEY`, modèles ouverts type Llama, inférence
  très rapide) > `StubProvider` (par défaut, aucun appel réseau, réponses
  clairement labellées "mode démonstration")
- **Actuellement actif : Groq** (`llama-3.3-70b-versatile`) — testé en
  conditions réelles sur `/explainme` et `/securityreview` (vraie détection
  d'injection SQL confirmée)
- **Contrat unique** : `AIProvider.complete({system, user})` — chaque feature
  (ExplainMe, Security/Code Review, Debug Coach, Docs RAG) construit son
  propre prompt dans `aiService.ts` ; ajouter une feature n'oblige jamais à
  retoucher les providers
- Aucun appel LLM dispersé dans les commandes : tout passe par
  `src/ai/aiService.ts`

### `/docs` — Documentation RAG

- Corpus de 10 extraits rédigés à la main (Node.js, Discord.js, PostgreSQL,
  OWASP), retrieval par **mots-clés tolérants aux fautes** (Levenshtein) —
  pas d'embeddings/recherche vectorielle : Anthropic n'expose pas d'API
  d'embeddings publique. Si un provider d'embeddings est ajouté un jour, seul
  `findRelevantChunks` (src/documentation/docsService.ts) change
- Avec IA active : synthétise une réponse à partir des extraits trouvés,
  sans jamais inventer si l'info n'y est pas. En mode stub : affiche
  directement les extraits bruts (pas d'appel IA inutile)

### `/securityreview`, `/codereview`, `/debugme` (Phase 7)

Même schéma UX : la commande ouvre directement un **Modal** Discord (paste
de code, pas d'option slash — un extrait de code ne tient pas dans 100
caractères) :

- **`/securityreview`** — analyse de sécurité groupée par sévérité
  (🔴 Critique → 🔵 Faible), avec un bouton **🔧 Voir une correction
  suggérée** qui redemande à l'IA une version corrigée
- **`/codereview`** — relecture qualité (lisibilité, nommage, duplication) —
  volontairement **pas** de sécurité, c'est le rôle de `/securityreview`
- **`/debugme`** — Debug Coach façon tuteur socratique : l'IA pose des
  questions et donne des indices, **jamais** la solution directe. Un bouton
  **💡 Encore un indice** permet une seule escalade vers un indice plus
  précis (toujours pas la solution)

Le code/contexte à réutiliser sur les boutons de suivi est trop long pour
tenir dans un customId Discord (contrairement au quiz Academy) — il est
gardé en mémoire process avec une expiration de 10 minutes, pas en base :
le perdre à un redémarrage n'a aucune conséquence.

### `/explainme`

Contrairement à `/dictionary`, fonctionne sur **n'importe quel terme**, pas
seulement ceux catalogués. Si le terme existe dans le dictionnaire, sa
définition est injectée en contexte à l'IA (évite les réponses à côté) ;
sinon l'IA répond de ses connaissances générales. Le niveau (débutant/avancé)
est déduit du profil réel de l'utilisateur (`/profile`).

### `/cyber` — Cyber Academy

- **`/cyber learn`** — réutilise entièrement le moteur Academy (Phase 5),
  filtré sur la catégorie `CYBERSECURITY` : aucun système parallèle. Premier
  cours : *Cybersecurity Fundamentals* (menaces/phishing, mots de passe &
  hashing, réseaux/pare-feu — 3 leçons, XP réelle sur la compétence
  `cyber-fundamentals`)
- **`/cyber simulation`** — Trust Nothing Simulation : un scénario de
  phishing 100% fictif et sûr (`Nodify_Update.exe` envoyé en DM par un faux
  compte de support). Aucun vrai fichier, aucune collecte de données, aucune
  modification système — uniquement des embeds/boutons Discord. Bonne
  décision → débloque l'achievement **Esprit critique** ; mauvaise décision
  → explique précisément les signaux d'alerte manqués et propose de
  recommencer
- **Volontairement pas construit** : CTF, Labs, Red Team/Blue Team,
  Threat Modeling — nécessitent une vraie infrastructure de sandbox/VM
  isolée qui n'existe pas encore. Les simuler sans vraie infra serait
  fabriquer une fausse capacité.

### `/dictionary` (alias `/dict` `/term` `/define`)

- `/dictionary terme:JWT` cherche directement ; sans argument, affiche l'accueil
  avec un bouton **🔎 Rechercher** qui ouvre un Modal Discord
- Résolution : clé exacte → alias exact → nom exact → recherche floue
  (tolère les fautes de frappe via distance de Levenshtein, sans IA)
- Bouton **💡 Expliquer** sur une fiche concept : bascule explication
  débutant ⇄ avancée — seul bouton implémenté pour l'instant, les autres
  (`Mini-cours`, `Exercice`, `Documentation`) attendront d'avoir du vrai
  contenu derrière (Phases 5/6/7) plutôt que d'être des boutons morts
- 12 concepts rédigés à la main pour démarrer (JWT, Promise, API, DNS, XSS,
  Docker, RAG, HTTP, Git, SQL Injection, Event Loop, REST), liés entre eux
  (concepts liés / prérequis) et seedés via `npm run prisma:seed`

### `/learn` — Nodify Academy

- `/learn` liste les cours disponibles (un seul pour l'instant : *Introduction
  à JavaScript*, 3 leçons) avec le statut de progression de l'utilisateur
- Chaque leçon : contenu pédagogique → quiz (boutons Discord, une question à
  la fois) → validation si ≥ 50% de bonnes réponses
- **Échec** → la progression n'avance pas, bouton "Recommencer la leçon"
  (vraie boucle adaptative, pas de contenu IA généré)
- **Réussite** → +XP sur la vraie compétence liée (`javascript`), passage à
  la leçon suivante, et achievement "Premier cours terminé" au dernier
  cours complété
- Anti-farming : rejouer une leçon déjà validée n'accorde plus d'XP (testé)
- L'état du quiz en cours (question actuelle, score accumulé) est encodé
  dans les customId des boutons Discord — pas de table de session éphémère

### `/profile`

Profil **global** par utilisateur Discord (partagé entre tous les serveurs
où Nodify est installé — la progression d'une personne ne dépend pas du
serveur qu'elle a rejoint).

- Créé automatiquement à la première interaction avec Nodify (`recordActivity`,
  branché dans `interactionCreate` pour toutes les commandes)
- **Streak** : jours consécutifs d'activité, mesure réelle d'engagement
- **XP / niveau** : reste à 0 tant que l'Academy (Phase 5) n'existe pas —
  volontairement aucune XP fabriquée artificiellement
- **Compétences** : catalogue statique seedé (`npm run prisma:seed`), vide
  pour chaque utilisateur tant qu'aucun cours n'en attribue
- **Succès** : un seul pour l'instant ("Bienvenue"), débloqué à la 1ère
  interaction — prouve le pipeline, les autres arriveront avec du vrai contenu

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
