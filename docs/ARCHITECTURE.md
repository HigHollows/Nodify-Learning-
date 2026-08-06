# Détails techniques par feature

Ce document rassemble les décisions de conception et le fonctionnement
précis de chaque commande — utile pour comprendre le *pourquoi*, pas
seulement le *quoi*. Le [README](../README.md) donne la vue d'ensemble.

## Design System — Components V2 (`src/ui/container.ts`)

Tous les messages du bot utilisent désormais l'API **Components V2** de
Discord (`ContainerBuilder`, pas `EmbedBuilder`) — migration complète,
plus aucun `EmbedBuilder` nulle part dans le code. Un seul module central
(`src/ui/container.ts`, anciennement `credits/embedTheme.ts` qui ne
couvrait que crédits/IA) fournit les helpers réutilisés par les ~24 fichiers
de vue du bot :

- **`baseContainer(title, color)`** — Container avec bannière GIF Nodify
  (`assets/nodify-banner.gif`, MediaGallery) + titre en `TextDisplay`
  (`## Titre`) + couleur d'accent. Équivalent direct de l'ancien
  `baseEmbed()`.
- **`bannerContainer(color)`** — même chose sans le titre auto-formaté, pour
  les cas où le titre doit être un lien Markdown (`## [Titre](url)`, ex:
  Hacktualités — l'ancien `.setURL()` d'embed n'a pas d'équivalent Container
  natif, émulé en Markdown).
- **`fieldText(name, value)`** — émule un embed field (`**Name**\nValue`) :
  Components V2 n'a **pas de grille "inline" native** comme les fields
  d'embed côte à côte — c'est la limitation la plus visible de la migration,
  rendue le plus proche possible visuellement via ce format Markdown.
- **`thinSeparator()`** — vrai `SeparatorBuilder` (ligne de séparation
  native), remplace l'ancien hack texte `SEPARATOR = "─────"`.
- **`textDisplay("-# ...")`** — préfixe Markdown `-#` = petit texte, utilisé
  pour émuler l'ancien footer d'embed (pas d'équivalent natif non plus).
- Section + `ThumbnailBuilder` (`setThumbnailAccessory`) émule l'ancien
  `.setThumbnail()` (ex: avatar sur `/profile`).

**Trois types de payload**, pour que le typage empêche une vraie erreur
Discord plutôt que de la découvrir à l'exécution :
- **`MessageViewPayload`** (`messageViewPayload()`) — `flags` strictement
  `[IsComponentsV2]`, compatible `.reply()`/`.update()`/`.editReply()`/
  `channel.send()`/`Message.edit()`. Le défaut pour tout ce qui n'a jamais
  besoin d'être éphémère.
- **`ContainerPayload`** (`containerPayload()`) — alias du précédent, nommé
  différemment pour la lisibilité aux call sites qui n'utilisent jamais
  `.update()`.
- **`EphemeralContainerPayload`** (`ephemeralContainerPayload()`) — `flags`
  inclut `Ephemeral`, ce qui le rend **volontairement incompatible** avec
  `.update()`/`.editReply()`/`channel.send()` au niveau des types (ces
  contextes n'acceptent pas ce flag) — une tentative de l'y passer est une
  erreur de compilation, jamais un bug Discord découvert en production.

**Bannière** : `assets/nodify-banner.gif` est lu une seule fois en mémoire
au démarrage (`readFileSync`), un `AttachmentBuilder` frais est reconstruit
à partir de ce buffer à chaque envoi (Discord exige le fichier sur chaque
`reply`/`update`/`send` qui le référence via `attachment://`). Chemin résolu
via `import.meta.url` (pas `process.cwd()`) pour rester correct peu importe
le répertoire de lancement — vérifié en conditions réelles (dev via `tsx`
ET depuis `dist/` compilé).

**Vérification** : les ~54 fonctions de vue du bot ont été testées par
script réel (`.toJSON()` sur chaque Container construit avec des données
factices plausibles) — Discord.js valide la structure à la sérialisation
(champs requis, longueurs), c'est la vérification la plus proche d'un vrai
envoi Discord possible sans bot connecté. Toutes passent.

## `+setup` (préfixe, pas slash — voir la section "Commandes admin en préfixe")

Crée (ou répare) :
- Rôles de progression 🌱 Beginner → 🔴 Expert
- Catégorie **🧠 NODIFY** avec un salon `#nodify`

Idempotente : relancer `+setup` ne duplique rien. Si un rôle/salon créé par
Nodify est supprimé, le relancer le recrée automatiquement (♻️ dans le
rapport). Repli par NOM en plus de l'id connu en base (`reconcileLevelRoles`/
`reconcileHub` dans `setupService.ts`) : si l'id suivi est perdu (ligne DB
réinitialisée...) alors que le rôle/salon existe toujours réellement, il est
retrouvé par son nom plutôt que dupliqué — un vrai bug corrigé en cours de
route, pas une précaution théorique. Nodify ne touche jamais aux ressources
qu'il n'a pas créées lui-même — seuls les IDs qu'il a stockés en base sont
vérifiés/réparés. Nécessite la permission Discord **Gérer le serveur**
(vérifiée manuellement, voir plus bas), et que le bot ait lui-même **Gérer
les rôles** + **Gérer les salons**.

Poste aussi, une seule fois à la toute première création réelle du salon hub
(jamais en cas de récupération par id/nom), le message de guide public
(`community/guideView.ts`) avec un bouton pour le recevoir en DM.

## `+settings` (préfixe)

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
- **53 concepts** rédigés à la main (JWT, Promise, API, DNS, XSS, Docker,
  RAG, HTTP, Git, SQL Injection, Event Loop, REST, Closure, async/await,
  GraphQL, ORM, npm, CI/CD, WebSocket, JSON, Regex, MFA, CSRF, Zero Trust,
  Ransomware, DDoS, VPN, CDN, TLS/SSL, LLM, Prompt Engineering, Fine-tuning,
  Hallucination, Kubernetes, Serverless, Rust, WebAssembly, gRPC, Terraform/
  IaC, OAuth 2.0, Content Security Policy, et bien d'autres), liés entre eux
  (concepts liés / prérequis)

## `/learn` — Nodify Academy

- Liste les cours disponibles avec le statut de progression de l'utilisateur
- **11 cours**, un par domaine minimum : Introduction à JavaScript, Python,
  TypeScript pour devs JS (DEVELOPMENT) ; Cybersecurity Fundamentals, Red
  Team Fundamentals (CYBERSECURITY) ; Networking Fundamentals (NETWORKING) ;
  Linux Fundamentals (SYSTEMS) ; AI Fundamentals, Prompt Engineering (AI) ;
  Docker Basics, DevOps & CI/CD Fundamentals (CLOUD)
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
  indicateur suspect ; **web** : analyse statique d'un artefact donné — en-
  têtes HTTP, cookie, JWT décodé, extrait de `robots.txt` — jamais une vraie
  requête réseau ni une vraie application à attaquer), réponses comparées
  après normalisation (accents/casse/espaces). Points crédités une seule
  fois par défi, classement séparé de l'XP Academy (sémantiques différentes)
- **Red Team Fundamentals** (cours Academy) — méthodologie
  recon/énumération/exploitation/privesc/reporting, uniquement théorique,
  avec rappel systématique du cadre légal (autorisation écrite requise)

**Volontairement pas construit** : CTF Pwn/Network/Reverse et Labs avec
cibles en direct — nécessitent une vraie infrastructure de sandbox/VM
isolée qui n'existe pas. Les simuler sans vraie infra serait fabriquer une
fausse capacité (le CTF Web reste volontairement de l'analyse statique,
sans jamais prétendre attaquer une vraie cible en direct).

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

## `+stats` (préfixe)

Statistiques globales (admin) : utilisateurs, XP totale distribuée, streak
moyen, leçons validées, défis CTF résolus, cours le plus démarré.

## AIService (`src/ai/`)

- **ModelRouter** : instancie tous les providers configurés, priorité par
  défaut `GroqProvider` (si `GROQ_API_KEY`, provider principal de Nodify —
  modèles ouverts type Llama, inférence très rapide) > `GeminiProvider` (si
  `GEMINI_API_KEY`) > `AnthropicProvider` (si `ANTHROPIC_API_KEY`) >
  `StubProvider` (par défaut, aucun appel réseau, réponses clairement
  labellées "mode démonstration") — une feature peut forcer un autre
  provider via `AI_FEATURE_PROVIDER_OVERRIDES`
- **Contrat unique** : `AIProvider.complete({system, user})` — chaque
  feature construit son propre prompt dans `aiService.ts` ; ajouter une
  feature n'oblige jamais à retoucher les providers
- **Rate limiting** centralisé (`src/utils/rateLimiter.ts`) : 8 requêtes /
  2 min par utilisateur, appliqué une seule fois au point de passage commun
- Aucun appel LLM dispersé dans les commandes
- Chaque appel passe par le Credit Engine et l'AI Control Center avant
  d'atteindre le provider — voir section suivante. Flux complet :
  `Commande → AIService.complete() → assertAiAvailable() → rate limit →
  reserveForFeature() → provider.complete() → confirmReservation()/
  refundReservation() → recordAiSuccess()/recordAiFailure() → logAiCall()`

## Credit System & AI Control Center (`src/credits/`)

Système de crédits **non-monétaire** (pas de paiement, pas d'achat pour
l'instant — architecture volontairement prête pour ça plus tard) qui
contrôle l'usage des fonctionnalités IA : coût fixe par feature, remboursé
automatiquement si l'appel IA échoue, jamais de solde négatif.

- **Interrupteur maître** `CREDITS_ENABLED` (`.env`) : à `false`, tout le
  Credit Engine devient un no-op qui accepte toujours — aucune commande IA
  ne bloque, aucune transaction n'est écrite en base. Seule
  `creditsEnabled()` (`creditService.ts`) lit ce flag ; le reste du code ne
  s'en préoccupe pas.
- **Atomicité** : `spendCredits` (`creditRepository.ts`) utilise
  `updateMany` avec `where: { balance: { gte: amount } }` — sous concurrence
  réelle (`Promise.all`), exactement une des requêtes en compétition réussit
  jamais un solde négatif. Vérifié par script réel avec deux réservations
  simultanées sur un solde insuffisant pour les deux.
- **Flux de réservation** (jamais de crédits perdus sur une erreur IA) :
  `reserveForFeature` (statut `RESERVED`) → appel provider → succès
  → `confirmReservation` (`COMPLETED`) ; échec → `refundReservation`
  (`REFUNDED`, idempotent — un double remboursement ou une confirmation
  tardive d'une réservation déjà remboursée sont des no-op sûrs, jamais un
  double crédit).
- **Coûts** centralisés dans `creditCosts.ts` (`AI_FEATURE_COSTS`) — jamais
  `if (feature === "x") cost = 1` dispersé dans les commandes.
- **Reward Engine** générique (`rewardService.ts`) : un seul moteur pour
  DAILY/WEEKLY/MONTHLY (cooldown vérifié **côté serveur**, pas seulement
  Discord, via `tryClaimReward` transactionnel) et pour les récompenses
  d'apprentissage (`awardCourseCompleted`, `awardLessonPassed`,
  `awardChallengeCompleted`, `awardStreakMilestone`,
  `awardAchievementUnlocked` — branchées sur de vrais événements Academy/CTF/
  streak/achievements, jamais un déclencheur fabriqué). Tout gated par
  `LEARNING_REWARDS_ENABLED`.
- **AI Control Center** (`aiControlService.ts`) : mode admin
  (`OPEN`/`LIMITED`/`MAINTENANCE`/`CLOSED`) persisté en base
  (`SystemConfig`, pas en `.env` — doit changer sans redémarrage), commande
  `/ai`. `/ai close` ne coupe que les features IA, jamais le reste de
  Nodify. Le **statut public affiché** (🟢 OPERATIONAL → 🔴 OFFLINE, 🟡
  DEGRADED, 🟠 LIMITED, 🔧 MAINTENANCE, ⚠️ QUOTA, ❌ ERROR) est **calculé**
  (`computeAiStatus`) à partir du mode admin + de la télémétrie réelle des
  derniers appels — jamais stocké tel quel.
- **Panneau de statut persistant** (`statusPanelService.ts`) : un seul
  panneau par déploiement, son salon/message sont sauvegardés
  (`SystemConfig.statusChannelId/statusMessageId`). Au démarrage et
  périodiquement (`AI_STATUS_AUTO_UPDATE`, toutes les 10 min), le panneau
  existant est retrouvé et mis à jour ; s'il a été supprimé, il est recréé
  automatiquement au même endroit (jamais deux panneaux actifs, jamais
  recréé sans raison).
- **Anti-abus** configurable/désactivable individuellement (mettre à `0`) :
  `MAX_AI_REQUESTS_PER_MINUTE`, `MAX_DAILY_AI_SPEND`, `MAX_MONTHLY_AI_SPEND`.
- **Audit** (`auditService.ts`) : toute action admin sensible (changement de
  mode IA, grant/remove/set de crédits) est journalisée avec l'admin, la
  raison et un horodatage (`AdminAuditLog`).
- **Design System** (`embedTheme.ts`) : palette de couleurs limitée et
  cohérente (`EmbedColors`), embeds sobres — pas de spam d'emojis, un emoji
  identifie une catégorie, il ne décore pas.
- **3 cas critiques vérifiés par script réel contre la vraie base** (pas
  seulement en théorie) : `CREDITS_ENABLED=false` → `/explainme` fonctionne
  sans jamais vérifier de solde ; mode IA `CLOSED` → erreur propre, zéro
  crédit consommé ; échec provider → remboursement exact, pas de double
  remboursement, pas de perte permanente.

### Évolutions v2 (multi-provider, budgets par serveur, incidents, bonus)

- **Multi-provider** (`aiService.ts`) : tous les providers dont la clé est
  configurée sont instanciés simultanément (pas un seul choisi une fois pour
  toutes) dans un `providerRegistry`. `AI_FEATURE_PROVIDER_OVERRIDES` (JSON
  `.env`, ex: `{"threatmodel":"anthropic"}`) force un provider précis pour
  une feature donnée ; sans override, priorité par défaut Gemini > Anthropic
  > Groq > stub. `AI_PROVIDER_COST_MULTIPLIERS` (JSON `.env`) fait coûter
  plus cher les features qui tournent sur un provider premium
  (`getCreditCost(feature, providerName)`, arrondi au-dessus, jamais < 1).
- **Classification structurée des erreurs IA** (`aiErrorClassifier.ts`) :
  duck-typée sur `status`/`name`/message (pas d'import des classes d'erreur
  spécifiques à chaque SDK) → `QUOTA`/`TIMEOUT`/`NETWORK`/`INVALID_KEY`/
  `PROVIDER_ERROR`. `SystemConfig.lastErrorCode` remplace la détection
  approximative par mot-clé ("quota" dans le message) qui existait avant.
- **Timeout centralisé** (`AI_REQUEST_TIMEOUT_MS`, défaut 30s) : appliqué au
  point de passage unique (`aiService.complete`), pas par provider — un
  appel qui traîne est remboursé et classifié `TIMEOUT` plutôt que de
  bloquer indéfiniment l'utilisateur.
- **Tokens IA** (`AICall.tokensInput/tokensOutput`) : remontés par Gemini,
  Anthropic et Groq quand le SDK les expose (`CompletionResult.usage`),
  jamais fabriqués si absents.
- **Budgets IA par serveur** (`GuildConfig.maxDailyAiSpend/maxMonthlyAiSpend`,
  commande `/ai budget`) : `null` = pas d'override, retombe sur
  `MAX_DAILY_AI_SPEND`/`MAX_MONTHLY_AI_SPEND` (`.env`, global) ; un serveur
  peut être plus restrictif (ou plus généreux) sans toucher à la config du
  bot entier. `getSpendBudgetStatus` expose la consommation vs. plafond
  effectif dans `/balance`.
- **AI Incidents** (`buildAiIncidentEmbed`, `statusPanelService.ts`) : un
  nouveau message (jamais une édition du panneau) est posté dans le salon de
  statut uniquement quand le statut public change réellement
  (`SystemConfig.lastNotifiedStatus` évite le spam à chaque refresh), à la
  fois pour une dégradation et pour un retour à `OPERATIONAL`.
- **Bonus & statut supporter** (`rewardService.awardEventBonus`,
  `User.isSupporter`) : `/credit-admin bonus` accorde un bonus ponctuel
  (type `BONUS`, traçable séparément dans l'historique) ; `/credit-admin
  subscriber` attribue un statut non-monétaire (jamais acheté) qui ajoute
  `SUPPORTER_MONTHLY_BONUS_AMOUNT` à la récompense MONTHLY suivante.
- **Historique filtrable** (`/credit-history type:`) et **wallet enrichi**
  (`/balance` affiche désormais les 3 statuts de récompense DAILY/WEEKLY/
  MONTHLY et la consommation vs. plafond anti-abus, plus qu'un simple Daily).
- **Bug corrigé pendant ces évolutions** (trouvé par test réel, pas par
  relecture) : `getStatsSince` comptait une réservation **remboursée**
  (`status: REFUNDED`, `type` reste `SPEND`) comme une dépense réelle,
  grugeant à tort le plafond anti-abus quotidien/mensuel d'un utilisateur
  dont un appel IA avait simplement échoué puis été remboursé. Un
  utilisateur malchanceux pouvait ainsi se retrouver bloqué par sa propre
  limite sans avoir réellement consommé les crédits.

### Évolutions v3 (annulation réelle, audit log consultable, polish)

- **Annulation réelle des appels IA au timeout** (`aiService.complete`) : un
  `AbortController` est créé par requête, transmis via `CompletionRequest.
  signal` à chaque provider (Gemini/Anthropic/Groq acceptent tous un
  `signal` natif par appel), et déclenché après `AI_REQUEST_TIMEOUT_MS`.
  Avant : le timeout était une simple course entre un timer et la promesse
  du provider — l'appel HTTP continuait de tourner côté provider après le
  remboursement de l'utilisateur. Maintenant la requête est effectivement
  annulée.
- **Audit log enfin consultable depuis Discord** (`/ai audit-log`, paginé) :
  `AdminAuditLog` n'existait qu'en écriture jusqu'ici (`createAuditLog`
  appelé partout, mais aucune commande ne le lisait) — un admin ne pouvait
  vérifier "qui a fait quoi" qu'en ouvrant Prisma Studio directement sur le
  serveur.
- **`/ai usage` paginé** (`buildAiUsagePageCustomId`, boutons ◀️/▶️) au lieu
  d'être plafonné à 10 résultats sans suite — les filtres (période/
  utilisateur/feature) sont préservés à travers les pages via le customId.
  La logique de fetch (`getAdminControlCenterData`, `getAiUsagePage`) est
  centralisée dans `aiAdminService.ts`, séparé de `aiControlService.ts`
  volontairement : il dépend à la fois de `aiControlService.ts` et de
  `aiService.ts` (pour `getActiveProviderName`), qui dépend lui-même de
  `aiControlService.ts` — le mettre directement dans `aiControlService.ts`
  aurait créé un cycle d'imports.
- **Alerte AI Incident avec ping optionnel** (`AI_INCIDENT_PING_ROLE_ID`) :
  un rôle admin peut être mentionné en plus du message, avec
  `allowedMentions` explicitement restreint à ce rôle (jamais un
  `@everyone`/`@here` accidentel si la variable est mal renseignée).
- **Coût affiché sur les boutons de suivi** (`🔧 Voir une correction
  suggérée (3 crédits)`, `💡 Encore un indice (2 crédits)`, `💬 Question de
  suivi (1 crédit)`) : ces boutons relancent un appel IA et reconsommaient
  donc des crédits sans que l'utilisateur le sache avant de cliquer.
- **Statut supporter visible** dans `/balance` (bonus ⭐ affiché sur la ligne
  Monthly) — auparavant seul un admin pouvait savoir qui était supporter.
- **Cache de la config JSON des providers** (`AI_FEATURE_PROVIDER_OVERRIDES`,
  `AI_PROVIDER_COST_MULTIPLIERS`) : parsée une seule fois au lieu de
  `JSON.parse` à chaque appel IA — ces variables viennent de `.env` et ne
  changent jamais en cours de process.
- **`/help` mis à jour** avec `bonus`/`subscriber`/`budget`/`audit-log`,
  qui manquaient depuis leur ajout en v2.

## Sync des rôles Discord (`src/setup/roleSyncService.ts`)

Après chaque leçon Academy validée dans un serveur, le rôle de niveau global
de l'utilisateur est mis à jour sur ce serveur (ajouté/retiré selon son XP
totale), et un rôle de compétence est créé dynamiquement à la première XP
gagnée sur cette compétence. Résilient par conception : toute erreur
(permissions manquantes, membre introuvable...) est loggée et avalée,
jamais remontée à l'utilisateur — la progression ne doit jamais être
bloquée par un souci de synchronisation de rôle Discord.

## Sync automatique des slash commands (`src/deploy-commands.ts`)

`deployCommands()` (exporté, pas juste un script) est appelée à deux
endroits : manuellement (`npm run deploy:commands`, exécution directe du
fichier — détectée via `import.meta.url` comparé à `process.argv[1]`) ET
automatiquement à chaque démarrage du bot (`src/index.ts`, juste après
`loadCommands`/`loadEvents`, avant `client.login`). Objectif : ne plus
jamais dépendre de se souvenir de relancer le déploiement après avoir
ajouté/modifié une commande — un redémarrage suffit.

Avec `DISCORD_GUILD_ID` renseigné (déploiement sur une seule guild), Discord
synchronise en quelques secondes ; sans cette variable (déploiement global),
la propagation peut prendre jusqu'à ~1h côté Discord — rien côté Nodify ne
peut aller plus vite que l'API elle-même. La sync au démarrage est résiliente
: un échec est loggé mais n'empêche jamais le bot de démarrer (les commandes
déjà enregistrées restent utilisables même si la resync automatique échoue).

## `/exercise` — exercices pratiques (`src/practice/`)

Complémentaires aux cours Academy (progression linéaire longue) et au CTF
(défis thématiques autonomes) : courts, rejouables librement. Modèle
`Exercise` + `UserExerciseCompletion` (Prisma). Deux formats seulement :

- **MCQ** : QCM classique (`choices` + `correctIndex`), répondu via boutons.
- **TEXT** : Debug/Trouve le bug/Complète le code — réponse courte comparée
  à `acceptedAnswers`, même normalisation que le CTF (`ctfService.ts`).

"Explique ce code"/"Analyse sécurité"/"Architecture review" ne sont
délibérément PAS des exercices à réponse unique ici — ce sont des formats
libres évalués par IA, déjà servis par `/explainme`, `/securityreview`,
`/codereview`.

Rejouable à volonté (upsert sur `recordExerciseSolve`, pas de contrainte
"une fois"), mais XP/crédits/badges uniquement à la toute première réussite
(`alreadySolvedBefore` dans `exerciseService.submitMcqAnswer`/
`submitTextAnswer`) — sinon rejouer en boucle un exercice déjà résolu
permettrait de refarmer indéfiniment.

`/practice` (sans clé) pioche automatiquement un exercice OU un défi CTF non
résolu, de difficulté proche du niveau réel de l'utilisateur (`± 1`,
élargi progressivement si rien trouvé) — affiche directement la vue
interactive existante (mêmes boutons/modal que `/exercise practice` ou
`/cyber ctf challenge`), pas juste une suggestion textuelle
(`practice/practiceService.ts`).

## Badges de progression (`prisma/seed.ts` ACHIEVEMENTS + `services/achievementService.ts`)

Badges dev/cyber/IA débloqués sur de vrais jalons (cours terminés, défis CTF
résolus, exercices résolus), en plus des achievements historiques
(bienvenue, premier cours, premier flag...). `unlockAchievementWithInfo`
(à côté de l'ancien `unlockAchievement` booléen, conservé pour les
appelants qui n'ont pas besoin de l'info d'affichage) retourne
`{name, icon}` pour permettre un affichage dynamique d'une LISTE de badges
débloqués d'un coup (`unlockedAchievements` dans `LessonFinishResult`/
`FlagSubmissionResult`/`ExerciseSubmissionResult`), plutôt qu'un texte codé
en dur par vue pour un seul achievement à la fois.

`/achievements` affiche la galerie complète (verrouillés + débloqués) — pour
un badge verrouillé, le nom et la condition (`description`, écrite comme un
objectif) sont révélés, seule l'icône reste cachée : un mystère total sans
aucun indice était moins motivant qu'un objectif clair à viser.

## Objectifs quotidiens (`/objectives`, `src/progression/dailyObjectivesService.ts`)

Récapitulatif de l'engagement du jour (leçon Academy, exercice, CTF,
question du jour), calculé à la volée depuis les tables déjà existantes
(`UserLessonCompletion`/`CtfSolve`/`UserExerciseCompletion`/
`DailyQuestionAnswer`) — aucune nouvelle table de suivi. Purement informatif
: chaque action compte déjà pour sa propre récompense, ceci n'est qu'une vue
d'ensemble. La question du jour (scopée à une guild) est omise en DM
(`guildId === null`), plutôt que de renvoyer un faux "non complété".

## Rétention (`src/progression/`)

- **Rappel de streak** (`streakReminderService.ts`) : DM en fin de journée
  UTC (`>= 20h`) si un streak actif n'a pas été prolongé aujourd'hui.
- **Récap hebdo** (`weeklyRecapService.ts`) : DM le lundi (`>= 9h UTC`),
  agrégeant l'activité des 7 derniers jours — rien envoyé si aucune activité
  (pas de spam d'inactivité).
- **Révision espacée** (`spacedRepetitionService.ts`, `/review`) : reproposition des
  concepts du dictionnaire consultés il y a 3+ jours (`UserConceptView`,
  vue enregistrée par `dictionaryView.replyWithConceptSearch`), remis à
  "vu maintenant" à chaque affichage pour ne pas reproposer sans cesse les
  mêmes.
- **Points faibles** (`weakSpotsService.ts`, `/weakspots`) : combine les
  réponses à la question du jour (champ `DailyQuestionAnswer.category`,
  dénormalisé à la réponse) et les scores de quiz Academy (regroupés par
  catégorie de cours) pour repérer la catégorie la moins solide, avec un
  seuil d'échantillon minimum pour éviter le bruit statistique.
- **`/notifications`** : opt-out du rappel de streak et/ou du récap hebdo
  (`User.notifStreakReminders`/`notifWeeklyRecap`, `true` par défaut) —
  n'affecte que l'envoi du DM, jamais le calcul du streak/XP lui-même.

Toutes ces vérifications tournent sur le même intervalle périodique que la
question du jour (15min, `index.ts`) — chaque service gère lui-même son
horaire/jour ET son idempotence en interne (`lastStreakReminderDate`,
`lastWeeklyRecapDate`), un simple `setInterval` suffit côté `index.ts`.

## `/roadmap` (`src/progression/roadmapService.ts`)

Vue d'ensemble de tous les cours groupés par catégorie, avec prérequis et
statut (`not_started`/`in_progress`/`completed`/verrouillé) — pour
visualiser l'ordre logique plutôt que de le deviner en enchaînant
`/learn` à l'aveugle.

## `/search` (`src/search/searchService.ts`)

Recherche floue unifiée à travers dictionnaire, cours, CTF et exercices —
un point d'entrée unique devenu nécessaire une fois le catalogue de
contenu assez large (100+ concepts, 30+ cours). Score de pertinence en 3
paliers : substring exact dans le titre > titre proche par similarité de
Levenshtein (tolère les fautes de frappe) > substring dans le corps
(description/prompt/définition). Pas de recherche sémantique par
embeddings — même limite documentée que le dictionnaire (`conceptService.ts`)
et la doc RAG (`docsService.ts`) : pas d'API d'embeddings publique exposée
par le provider actuellement utilisé.

## `/duel` (`src/social/`)

Duel de trivia 1v1 live : `/duel @adversaire` poste un message avec boutons
Accepter/Refuser, l'acceptation pioche une question aléatoire (mélange
déterministe seedé par l'id du duel, `quizShuffle.ts`) et affiche 4 boutons
de réponse — premier à cliquer la bonne réponse gagne, une mauvaise réponse
élimine ce joueur de CETTE question (mais pas du duel si l'autre se trompe
aussi : match nul).

État de la partie **volontairement non persisté** (`Map` en mémoire,
`social/duelService.ts`) — un duel est une partie live de quelques dizaines
de secondes, pas une donnée qui doit survivre à un redémarrage ; si le bot
redémarre pendant un duel en cours, il est simplement perdu. Seule
l'ISSUE finale est persistée : `User.duelsWon`/`duelsPlayed`, incrémentés
via `recordDuelWin`/`recordDuelDraw` après la mise à jour du message
(un échec de l'écriture DB ne doit jamais empêcher le duel de se conclure
visiblement), affichés dans `/profile` et `/compare`.

## `/feedback` (`src/services/feedbackService.ts`)

Persiste TOUJOURS en base (`FeedbackReport`, jamais perdu) — le DM au
propriétaire du bot (`OWNER_DISCORD_ID`, optionnel) est un bonus
best-effort par-dessus, pas la seule trace. Consultable via `+feedback`
(préfixe admin).

## Alerte budget IA (`src/credits/aiBudgetAlertService.ts`)

DM automatique au **propriétaire du serveur** (`guild.ownerId` — seul
contact admin toujours bien défini, contrairement à "qui a la permission
ManageGuild" qui peut être plusieurs personnes) quand la dépense IA agrégée
de TOUS les utilisateurs d'un serveur atteint 80% du plafond configuré pour
ce serveur (override ou défaut global `.env`). C'est un signal d'ensemble,
**pas** le plafond réellement appliqué (qui reste par-utilisateur, inchangé
dans `creditService.reserveForFeature`) — le mismatch entre "budget serveur"
perçu et l'enforcement per-user existant est assumé et documenté ici plutôt
que fabriqué comme une vraie limite agrégée qui n'existe pas.

## Commandes admin en préfixe `+` (`src/prefixCommands/`)

`/setup`, `/settings`, `/stats`, `/credit-admin`, `/ai` ont été retirées du
menu `/` (slash commands, visibles dans le picker Discord même si
permission-gated) et remplacées par des commandes texte en préfixe `+` —
objectif : désencombrer le menu `/` pour les membres normaux. `+feedback`
(liste les retours `/feedback`) et `+help` (liste ces 6 commandes) les
rejoignent.

- **`parseArgs.ts`** : tokenizer maison (gère `cle:"valeur avec espaces"`
  comme un seul token, guillemets retirés) + getters typés
  (string/int avec bornes/boolean/choix/mention utilisateur ou salon), avec
  des `ValidationError` explicites plutôt que de planter sur une entrée mal
  formée. Testé unitairement (`parseArgs.test.ts`).
- **`registry.ts`** : table statique des 6 commandes (pas de scan de dossier
  dynamique comme `commandLoader.ts` — seulement 6 commandes, pas besoin de
  cette complexité).
- **`events/messageCreate.ts`** : route les messages `+...`, vérifie
  **manuellement** la permission Discord `ManageGuild` à chaque message
  (aucune protection native contrairement aux slash commands — c'est le
  seul vrai verrou de sécurité de tout le système), ignore silencieusement
  tout message qui ne matche aucune commande `+` connue.

Nécessite le privileged intent **Message Content** activé dans le Discord
Developer Portal (`src/client.ts`) — sans lui, le bot démarre mais reçoit un
contenu de message vide pour tous les messages, donc aucune commande `+` ne
se déclenche jamais.

## Auto-DM du guide aux nouveaux membres (`src/events/guildMemberAdd.ts`)

Réutilise le même contenu que `/guide` (`community/guideView.ts`) —
best-effort, silencieux si DM fermés (le post public du salon hub et
`/guide` restent disponibles en secours). Nécessite le privileged intent
**Server Members** (`GuildMembers`) en plus de Message Content — sans lui,
l'event `guildMemberAdd` n'est jamais reçu.
