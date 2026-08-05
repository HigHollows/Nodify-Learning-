# Détails techniques par feature

Ce document rassemble les décisions de conception et le fonctionnement
précis de chaque commande — utile pour comprendre le *pourquoi*, pas
seulement le *quoi*. Le [README](../README.md) donne la vue d'ensemble.

## `/setup`

Crée (ou répare) :
- Rôles de progression 🌱 Beginner → 🔴 Expert
- Catégorie **🧠 NODIFY** avec un salon `#nodify`

Idempotente : relancer `/setup` ne duplique rien. Si un rôle/salon créé par
Nodify est supprimé, le relancer le recrée automatiquement (♻️ dans le
rapport). Nodify ne touche jamais aux ressources qu'il n'a pas créées
lui-même — seuls les IDs qu'il a stockés en base sont vérifiés/réparés.
Nécessite la permission Discord **Gérer le serveur** pour être exécutée, et
que le bot ait lui-même **Gérer les rôles** + **Gérer les salons**.

## `/settings`

Active/désactive par serveur : Academy, Cyber Academy, Hacktualités, Question
du jour. Réservé aux membres avec **Gérer le serveur**. Ces réglages sont
vérifiés en tête de chaque commande concernée (`assertModuleEnabled`), pas
seulement pour bloquer le post automatique.

## `/profile`

Profil **global** par utilisateur Discord (partagé entre tous les serveurs
où Nodify est installé — la progression d'une personne ne dépend pas du
serveur qu'elle a rejoint).

- Créé automatiquement à la première interaction avec Nodify (`recordActivity`,
  branché dans `interactionCreate` pour toutes les commandes)
- **Streak** : jours consécutifs d'activité, mesure réelle d'engagement
- **XP / niveau** : ne progresse que via de vraies leçons Academy validées —
  jamais d'XP fabriquée artificiellement
- **Compétences** : catalogue statique seedé (`npm run prisma:seed`)
- **Rôles Discord synchronisés** : après chaque leçon validée, le rôle de
  niveau global est mis à jour sur la guild courante, et un rôle de
  compétence (ex: `💡 JavaScript`) est créé dynamiquement à la première XP
  gagnée dessus (`src/setup/roleSyncService.ts`)

## `/leaderboard`

Classement global par XP (profil Nodify global, pas par guild).

## `/dictionary` (alias `/dict` `/term` `/define`)

- `/dictionary terme:JWT` cherche directement ; sans argument, affiche l'accueil
  avec un bouton **🔎 Rechercher** qui ouvre un Modal Discord
- Résolution : clé exacte → alias exact → nom exact → recherche floue
  (tolère les fautes de frappe via distance de Levenshtein, sans IA)
- Bouton **💡 Expliquer** sur une fiche concept : bascule explication
  débutant ⇄ avancée
- **47 concepts** rédigés à la main (JWT, Promise, API, DNS, XSS, Docker,
  RAG, HTTP, Git, SQL Injection, Event Loop, REST, Closure, async/await,
  GraphQL, ORM, npm, CI/CD, WebSocket, JSON, Regex, MFA, CSRF, Zero Trust,
  Ransomware, DDoS, VPN, CDN, TLS/SSL, LLM, Prompt Engineering, Fine-tuning,
  Hallucination, Kubernetes, Serverless, et bien d'autres), liés entre eux
  (concepts liés / prérequis)

## `/learn` — Nodify Academy

- Liste les cours disponibles avec le statut de progression de l'utilisateur
- **9 cours**, un par domaine minimum : Introduction à JavaScript, Python,
  TypeScript pour devs JS (DEVELOPMENT) ; Cybersecurity Fundamentals, Red
  Team Fundamentals (CYBERSECURITY) ; Networking Fundamentals (NETWORKING) ;
  Linux Fundamentals (SYSTEMS) ; AI Fundamentals (AI) ; Docker Basics (CLOUD)
- Chaque leçon : contenu pédagogique → quiz (boutons Discord, une question à
  la fois) → validation si ≥ 50% de bonnes réponses
- **Échec** → la progression n'avance pas, bouton "Recommencer la leçon"
- **Réussite** → +XP sur la vraie compétence liée, passage à la leçon
  suivante, achievement au dernier cours complété
- **Prérequis** (`Course.prerequisiteCourseKeys`) bloquent un cours tant
  qu'un autre n'est pas terminé (ex: Red Team Fundamentals nécessite
  Cybersecurity Fundamentals)
- Anti-farming : rejouer une leçon déjà validée n'accorde plus d'XP
- L'état du quiz en cours (question actuelle, score accumulé) est encodé
  dans les customId des boutons Discord — pas de table de session éphémère

## `/plan` — Learning Planner

Recommande un parcours **uniquement** parmi les cours réellement présents
sur Nodify (liste passée explicitement à l'IA) — jamais un cours inventé.

## `/explainme`

Contrairement à `/dictionary`, fonctionne sur **n'importe quel terme**, pas
seulement ceux catalogués. Si le terme existe dans le dictionnaire, sa
définition est injectée en contexte à l'IA (évite les réponses à côté) ;
sinon l'IA répond de ses connaissances générales. Le niveau (débutant/avancé)
est déduit du profil réel de l'utilisateur. Un bouton "Question de suivi"
permet de continuer la conversation sans tout réexpliquer (contexte à un
tour, en mémoire courte — pas un historique persisté).

## `/docs` — Documentation RAG

- Corpus d'extraits rédigés à la main (Node.js, Discord.js, PostgreSQL,
  OWASP), retrieval par **mots-clés tolérants aux fautes** (Levenshtein) —
  pas d'embeddings/recherche vectorielle : Anthropic n'expose pas d'API
  d'embeddings publique. Si un provider d'embeddings est ajouté un jour, seul
  `findRelevantChunks` (`src/documentation/docsService.ts`) change
- Avec IA active : synthétise une réponse à partir des extraits trouvés,
  sans jamais inventer si l'info n'y est pas. En mode stub : affiche
  directement les extraits bruts (pas d'appel IA inutile)

## `/securityreview`, `/codereview`, `/debugme`, `/threatmodel`

Même schéma UX : la commande ouvre directement un **Modal** Discord (paste
de code/description, pas d'option slash — un extrait ne tient pas dans 100
caractères) :

- **`/securityreview`** — analyse groupée par sévérité (🔴 Critique →
  🔵 Faible), avec un bouton **🔧 Voir une correction suggérée**
- **`/codereview`** — relecture qualité (lisibilité, nommage, duplication) —
  volontairement **pas** de sécurité, c'est le rôle de `/securityreview`
- **`/debugme`** — Debug Coach façon tuteur socratique : questions et
  indices, **jamais** la solution directe. Un bouton **💡 Encore un indice**
  permet une seule escalade vers un indice plus précis
- **`/threatmodel`** — identifie actifs à protéger, menaces plausibles et
  protections recommandées à partir d'une description d'architecture

Le contexte à réutiliser sur les boutons de suivi est trop long pour tenir
dans un customId Discord — il est gardé en mémoire process avec une
expiration de 10 minutes, pas en base : le perdre à un redémarrage n'a
aucune conséquence.

## `/cyber` — Cyber Academy

- **`learn`** — réutilise entièrement le moteur Academy, filtré sur la
  catégorie `CYBERSECURITY` : aucun système parallèle
- **`simulation`** — Trust Nothing Simulation : un scénario de phishing
  100% fictif et sûr (`Nodify_Update.exe` envoyé en DM par un faux compte de
  support). Aucun vrai fichier, aucune collecte de données, aucune
  modification système
- **`blueteam`** — simulation d'analyse de logs 100% fictive et statique :
  identifie l'indicateur de compromission (IOC) parmi 5 lignes plausibles
- **`ctf list|challenge|leaderboard`** — défis autonomes rédigés à la main
  (crypto : César/Base64 ; OSINT/Forensics : repérer une fuite d'info, un
  indicateur suspect), réponses comparées après normalisation
  (accents/casse/espaces). Points crédités une seule fois par défi,
  classement séparé de l'XP Academy (sémantiques différentes)
- **Red Team Fundamentals** (cours Academy) — méthodologie
  recon/énumération/exploitation/privesc/reporting, uniquement théorique,
  avec rappel systématique du cadre légal (autorisation écrite requise)

**Volontairement pas construit** : CTF Web/Pwn/Network/Reverse et Labs avec
cibles en direct — nécessitent une vraie infrastructure de sandbox/VM
isolée qui n'existe pas. Les simuler sans vraie infra serait fabriquer une
fausse capacité.

## Question du jour (`/daily` + post automatique)

- **158 questions** rédigées à la main, réparties sur les 6 domaines
  (~25-28 par catégorie), sélection **déterministe** par jour UTC (même
  question pour tout le monde, pas de tirage aléatoire qui désynchroniserait
  `/daily` et le post automatique — rotation par jour de l'année dans le
  catalogue)
- Postée automatiquement dans le salon hub de chaque guild qui l'a activée,
  vérifié toutes les 15 minutes — idempotent, ne reposte jamais deux fois
  le même jour
- Une seule réponse comptée par utilisateur par jour et par guild
- Aucun scheduler externe : un simple `setInterval` côté process suffit à
  cette échelle

## Hacktualités (`/news` + post automatique)

- **10 flux RSS** de sources officielles uniquement (Node.js, GitHub,
  Cloudflare, Python Insider, Rust Blog, TypeScript/Microsoft, Docker,
  Kubernetes, GitHub Security Lab, PostgreSQL — liste dans
  `src/community/newsService.ts`, toutes vérifiées réellement avant ajout).
  **Jamais** d'actu inventée ou résumée par IA sans lien vers l'article original
- **Sélection équitable (round-robin) entre sources** : un flux qui publie
  plus souvent que les autres (typiquement un blog très actif) ne
  monopolise plus toutes les places à chaque vérification — la sélection
  alterne entre sources plutôt que de prendre les N premiers articles
  trouvés dans l'ordre. Testé (`newsService.test.ts`) et vérifié en
  conditions réelles (6 sources différentes représentées sur 6 articles postés)
- Récupération des flux en parallèle (`Promise.allSettled`), avec timeout
  par flux (8s) : un flux lent ou en panne ne bloque plus les autres
- Vérifié toutes les 30 minutes. Au tout premier démarrage, le backlog
  existant des flux est marqué comme "déjà vu" **sans être posté** — sinon
  le premier lancement inonderait le salon hub avec des dizaines d'articles
  déjà anciens
- Anti-doublon global par `guid` d'article (contrainte unique DB)

## `/stats`

Statistiques globales (admin) : utilisateurs, XP totale distribuée, streak
moyen, leçons validées, défis CTF résolus, cours le plus démarré.

## AIService (`src/ai/`)

- **ModelRouter** minimal : un seul provider actif, choisi au démarrage
  selon la config. Priorité : `AnthropicProvider` (si `ANTHROPIC_API_KEY`)
  > `GroqProvider` (si `GROQ_API_KEY`, modèles ouverts type Llama, inférence
  très rapide) > `StubProvider` (par défaut, aucun appel réseau, réponses
  clairement labellées "mode démonstration")
- **Contrat unique** : `AIProvider.complete({system, user})` — chaque
  feature construit son propre prompt dans `aiService.ts` ; ajouter une
  feature n'oblige jamais à retoucher les providers
- **Rate limiting** centralisé (`src/utils/rateLimiter.ts`) : 8 requêtes /
  2 min par utilisateur, appliqué une seule fois au point de passage commun
- Aucun appel LLM dispersé dans les commandes

## Sync des rôles Discord (`src/setup/roleSyncService.ts`)

Après chaque leçon Academy validée dans un serveur, le rôle de niveau global
de l'utilisateur est mis à jour sur ce serveur (ajouté/retiré selon son XP
totale), et un rôle de compétence est créé dynamiquement à la première XP
gagnée sur cette compétence. Résilient par conception : toute erreur
(permissions manquantes, membre introuvable...) est loggée et avalée,
jamais remontée à l'utilisateur — la progression ne doit jamais être
bloquée par un souci de synchronisation de rôle Discord.
