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
  { key: "cicd", name: "CI/CD & DevOps", category: "CLOUD" },

  // Cybersecurity (suite)
  { key: "red-team-fundamentals", name: "Red Team Fundamentals", category: "CYBERSECURITY" },

  // AI (suite)
  { key: "prompt-engineering", name: "Prompt Engineering", category: "AI" },
];

const ACHIEVEMENTS = [
  {
    key: "welcome",
    name: "Bienvenue sur Nodify",
    description: "Ta toute première interaction avec Nodify.",
    icon: "👋",
  },
  {
    key: "first-course-complete",
    name: "Premier cours terminé",
    description: "Tu as terminé ton premier cours sur Nodify Academy.",
    icon: "🎓",
  },
  {
    key: "critical-thinker",
    name: "Esprit critique",
    description: "Tu as déjoué une tentative d'ingénierie sociale dans la Trust Nothing Simulation.",
    icon: "🕵️",
  },
  {
    key: "first-flag",
    name: "Premier flag capturé",
    description: "Tu as résolu ton premier défi CTF sur Nodify.",
    icon: "🚩",
  },
  {
    key: "blue-team-analyst",
    name: "Analyste Blue Team",
    description: "Tu as correctement identifié un indicateur de compromission dans une simulation d'incident.",
    icon: "🔵",
  },
];

/**
 * Premier lot de concepts du Knowledge Engine (Phase 4), rédigés à la main —
 * pas de génération IA (le provider n'est choisi qu'en Phase 6). Le RAG
 * viendra enrichir/étendre ce catalogue plus tard, pas le remplacer.
 */
interface ConceptSeed {
  key: string;
  name: string;
  category: SkillCategory;
  level: number; // 1 (Beginner) à 5 (Expert)
  definition: string;
  explanationBeginner: string;
  explanationAdvanced: string;
  docUrl: string;
  relatedKeys: string[];
  prerequisiteKeys: string[];
  aliases: string[];
}

const CONCEPTS: ConceptSeed[] = [
  {
    key: "http",
    name: "HTTP",
    category: "NETWORKING",
    level: 1,
    definition:
      "HyperText Transfer Protocol — le protocole de communication qui permet à un client (navigateur, app) d'échanger des requêtes et réponses avec un serveur web.",
    explanationBeginner:
      "Chaque fois que tu visites un site, ton navigateur envoie une requête HTTP (« donne-moi cette page ») et le serveur répond avec une réponse HTTP (le contenu, ou une erreur). C'est le langage commun que parlent tous les navigateurs et serveurs web.",
    explanationAdvanced:
      "HTTP est un protocole sans état (stateless) : chaque requête est indépendante, d'où le besoin de cookies/tokens pour maintenir une session. Les codes de statut sont normalisés par plage (2xx succès, 3xx redirection, 4xx erreur client, 5xx erreur serveur). HTTPS ajoute une couche TLS par-dessus pour chiffrer le trafic. HTTP/2 et HTTP/3 apportent le multiplexage pour éviter le head-of-line blocking des versions précédentes.",
    docUrl: "https://developer.mozilla.org/docs/Web/HTTP/Overview",
    relatedKeys: ["dns", "rest"],
    prerequisiteKeys: [],
    aliases: ["hypertext transfer protocol"],
  },
  {
    key: "git",
    name: "Git",
    category: "DEVELOPMENT",
    level: 1,
    definition:
      "Un système de contrôle de version distribué qui permet de suivre l'historique des modifications d'un projet et de collaborer sans écraser le travail des autres.",
    explanationBeginner:
      "Git garde une photo de ton projet à chaque « commit ». Tu peux revenir en arrière si tu casses quelque chose, voir qui a changé quoi et quand, et travailler à plusieurs sur le même projet sans se marcher dessus grâce aux branches.",
    explanationAdvanced:
      "Git stocke l'historique comme un graphe orienté acyclique (DAG) de commits, chacun référençant son (ou ses) commit(s) parent(s) et un snapshot complet de l'arbre de fichiers — pas juste un diff, contrairement à des VCS plus anciens comme SVN. Les branches ne sont que des pointeurs mobiles vers un commit. Comprendre la différence entre merge (préserve l'historique) et rebase (le réécrit) est essentiel pour collaborer proprement.",
    docUrl: "https://git-scm.com/doc",
    relatedKeys: [],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "dns",
    name: "DNS",
    category: "NETWORKING",
    level: 2,
    definition:
      "Domain Name System — le service qui traduit un nom de domaine lisible (ex: nodify.app) en adresse IP compréhensible par les machines.",
    explanationBeginner:
      "Le DNS, c'est l'annuaire téléphonique d'internet : tu connais le nom d'un site, mais ton ordinateur a besoin de son « numéro » (l'adresse IP) pour s'y connecter. Le DNS fait cette traduction automatiquement, en une fraction de seconde.",
    explanationAdvanced:
      "La résolution suit une hiérarchie : resolver récursif → serveurs racine → TLD (.com, .app...) → serveur autoritaire du domaine. Enregistrements courants : A/AAAA (IP), CNAME (alias), MX (mail), TXT (vérifications SPF/DKIM). Le DNS est mis en cache à plusieurs niveaux via le TTL de chaque enregistrement, ce qui explique la propagation parfois lente d'un changement.",
    docUrl: "https://developer.mozilla.org/docs/Glossary/DNS",
    relatedKeys: ["http"],
    prerequisiteKeys: [],
    aliases: ["domain name system"],
  },
  {
    key: "api",
    name: "API",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Application Programming Interface — un ensemble de règles qui permet à deux programmes de communiquer entre eux, sans que l'un ait besoin de connaître les détails internes de l'autre.",
    explanationBeginner:
      "Pense à une API comme au menu d'un restaurant : tu ne vas pas en cuisine préparer toi-même ton plat, tu commandes depuis le menu (l'API) et la cuisine (le serveur) te ramène ce que tu as demandé.",
    explanationAdvanced:
      "Une API peut prendre plusieurs formes (REST, GraphQL, gRPC, WebSocket...) mais le principe reste le même : un contrat explicite (endpoints, formats de données, codes d'erreur) découplant le consommateur de l'implémentation. Une bonne API reste stable même si l'implémentation change en interne — l'encapsulation appliquée à l'échelle réseau.",
    docUrl: "https://developer.mozilla.org/docs/Glossary/API",
    relatedKeys: ["rest", "jwt"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "rest",
    name: "REST",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Representational State Transfer — un style d'architecture pour concevoir des APIs web autour de ressources identifiées par des URLs et manipulées via les verbes HTTP standards.",
    explanationBeginner:
      "Dans une API REST, chaque « chose » (un utilisateur, un article...) a sa propre adresse (ex: /users/42), et tu utilises des verbes HTTP pour dire ce que tu veux faire dessus : GET pour lire, POST pour créer, PUT/PATCH pour modifier, DELETE pour supprimer.",
    explanationAdvanced:
      "REST n'est pas un protocole mais un ensemble de contraintes architecturales : absence d'état côté serveur entre les requêtes, interface uniforme, ressources auto-descriptives, et idéalement HATEOAS (rarement implémenté en pratique). Une API « RESTful » au sens strict et une simple API HTTP/JSON (souvent appelée REST par abus de langage) ne sont pas toujours la même chose.",
    docUrl: "https://restfulapi.net/",
    relatedKeys: ["api", "http"],
    prerequisiteKeys: [],
    aliases: ["representational state transfer"],
  },
  {
    key: "promise",
    name: "Promise",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Un objet JavaScript représentant le résultat éventuel (succès ou échec) d'une opération asynchrone, comme un appel réseau.",
    explanationBeginner:
      "Une Promise, c'est comme un ticket de retrait au pressing : tu déposes ton linge (tu lances une opération longue), on te donne un ticket tout de suite, et plus tard tu viens récupérer soit ton linge prêt (résolu), soit une explication si ça a raté (rejeté).",
    explanationAdvanced:
      "Une Promise a 3 états : pending, fulfilled, rejected — une fois settled (fulfilled/rejected), elle ne change plus jamais d'état. `.then()`/`.catch()`/`.finally()` chaînent des callbacks ; `async/await` est du sucre syntaxique construit par-dessus, exécuté sur la microtask queue (donc prioritaire sur les macrotasks comme setTimeout dans l'event loop).",
    docUrl:
      "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise",
    relatedKeys: ["event-loop"],
    prerequisiteKeys: [],
    aliases: ["promesse"],
  },
  {
    key: "event-loop",
    name: "Event Loop",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Le mécanisme qui permet à JavaScript (mono-thread) de gérer des opérations asynchrones (réseau, timers...) sans jamais bloquer l'exécution du programme.",
    explanationBeginner:
      "JavaScript ne fait qu'une chose à la fois, mais il sait « mettre de côté » les tâches longues (comme attendre une réponse réseau) pour continuer le reste du code, puis revenir traiter le résultat quand il est prêt.",
    explanationAdvanced:
      "Le moteur exécute d'abord toute la call stack, puis vide entièrement la microtask queue (Promises, queueMicrotask) avant de traiter UNE macrotask (setTimeout, I/O) de la macrotask queue, puis revide les microtasks, etc. Cet ordre explique pourquoi `Promise.resolve().then()` s'exécute toujours avant `setTimeout(fn, 0)`, même si les deux sont « asynchrones ».",
    docUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Event_loop",
    relatedKeys: ["promise"],
    prerequisiteKeys: [],
    aliases: ["boucle d'événements", "boucle evenementielle"],
  },
  {
    key: "jwt",
    name: "JWT",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "JSON Web Token — un format compact et signé pour transmettre des informations vérifiables entre deux parties, le plus souvent pour authentifier un utilisateur auprès d'une API sans session côté serveur.",
    explanationBeginner:
      "Imagine un badge d'accès temporaire : quand tu te connectes, le serveur te donne un jeton (le JWT) qui prouve qui tu es. À chaque requête suivante, tu montres ce badge au lieu de retaper ton mot de passe, et le serveur vérifie qu'il n'a pas été trafiqué grâce à une signature cryptographique.",
    explanationAdvanced:
      "Un JWT a 3 parties encodées en Base64URL séparées par des points : header (algorithme), payload (les claims, ex: userId, exp) et signature (HMAC ou RSA/ECDSA). Le payload n'est PAS chiffré, seulement signé — n'y stocke jamais de données sensibles. Pièges classiques : valider l'algorithme côté serveur (attaque « alg: none »), expiration courte, et prévoir une stratégie de révocation puisqu'un JWT signé reste valide jusqu'à expiration même si le compte est compromis.",
    docUrl: "https://jwt.io/introduction",
    relatedKeys: ["api"],
    prerequisiteKeys: ["http"],
    aliases: ["json web token"],
  },
  {
    key: "docker",
    name: "Docker",
    category: "CLOUD",
    level: 3,
    definition:
      "Une plateforme qui permet d'empaqueter une application avec toutes ses dépendances dans un conteneur, garantissant qu'elle tourne de façon identique sur n'importe quelle machine.",
    explanationBeginner:
      "Un conteneur Docker, c'est comme une boîte de déménagement scellée qui contient tout ce dont ton application a besoin pour fonctionner. Peu importe la machine sur laquelle tu ouvres la boîte, le contenu est exactement le même — fini le « ça marche sur ma machine ».",
    explanationAdvanced:
      "Contrairement à une VM, un conteneur ne virtualise pas un OS complet : il partage le noyau de l'hôte et isole les processus via les namespaces et cgroups Linux, ce qui le rend plus léger et rapide à démarrer. Une image Docker est construite en couches empilées, ce qui permet un cache de build efficace. En production, on l'associe généralement à un orchestrateur (Kubernetes, Docker Swarm) pour gérer scaling, réseau et résilience.",
    docUrl: "https://docs.docker.com/get-started/overview/",
    relatedKeys: [],
    prerequisiteKeys: [],
    aliases: ["conteneur", "container"],
  },
  {
    key: "xss",
    name: "XSS",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Cross-Site Scripting — une faille de sécurité web qui permet à un attaquant d'injecter du code JavaScript malveillant dans une page consultée par d'autres utilisateurs.",
    explanationBeginner:
      "Imagine un site où les commentaires s'affichent tels quels, sans filtrage. Un attaquant poste un commentaire contenant du code au lieu de texte normal : quand un autre visiteur lit la page, son navigateur exécute ce code sans le savoir — par exemple pour voler ses cookies de session.",
    explanationAdvanced:
      "Trois types : XSS stocké (payload sauvegardé côté serveur), XSS réfléchi (le payload transite par la requête et est renvoyé tel quel) et XSS DOM-based (vulnérabilité uniquement côté client). Défenses principales : encodage systématique des sorties selon le contexte HTML/JS/URL, Content-Security-Policy, et l'attribut HttpOnly sur les cookies sensibles pour les rendre inaccessibles en JavaScript.",
    docUrl: "https://owasp.org/www-community/attacks/xss/",
    relatedKeys: ["sql-injection"],
    prerequisiteKeys: ["http"],
    aliases: ["cross-site scripting", "cross site scripting"],
  },
  {
    key: "sql-injection",
    name: "SQL Injection",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Une faille qui permet à un attaquant d'injecter des commandes SQL non prévues dans une requête, en exploitant une entrée utilisateur mal filtrée.",
    explanationBeginner:
      "Si un site construit ses requêtes en base de données en collant directement ce que tu tapes dans un formulaire, un attaquant peut taper des instructions SQL au lieu de texte normal et manipuler la requête — par exemple pour se connecter sans mot de passe, ou récupérer toute la base.",
    explanationAdvanced:
      "Exemple classique : une requête construite par concaténation permet d'injecter `' OR '1'='1` pour contourner l'authentification. La défense fiable n'est PAS l'échappement manuel des caractères, mais l'usage systématique de requêtes préparées (paramétrées), qui séparent structurellement le code SQL des données. Un ORM correctement utilisé (comme Prisma) protège par défaut contre l'injection SQL.",
    docUrl: "https://owasp.org/www-community/attacks/SQL_Injection",
    relatedKeys: ["xss"],
    prerequisiteKeys: [],
    aliases: ["injection sql", "sqli"],
  },
  {
    key: "rag",
    name: "RAG",
    category: "AI",
    level: 4,
    definition:
      "Retrieval-Augmented Generation — une technique qui combine un moteur de recherche documentaire avec un modèle de langage, pour que l'IA réponde en s'appuyant sur des documents réels plutôt que sur sa seule mémoire.",
    explanationBeginner:
      "Plutôt que de demander à une IA de répondre uniquement « de mémoire » (avec le risque qu'elle invente des choses), le RAG lui donne d'abord accès aux bons documents — comme lui laisser ouvrir le livre pendant l'examen. L'IA lit les passages pertinents puis rédige sa réponse en s'appuyant dessus.",
    explanationAdvanced:
      "Les documents sont découpés en chunks, transformés en vecteurs (embeddings) et stockés dans une base vectorielle. À la requête, on calcule l'embedding de la question, on récupère les chunks les plus proches par similarité cosinus, puis on les injecte dans le contexte du prompt envoyé au LLM. La qualité du RAG dépend autant du chunking et du modèle d'embedding que du LLM lui-même — c'est ce que Nodify utilisera en Phase 6 pour interroger de grosses documentations techniques.",
    docUrl: "https://aws.amazon.com/what-is/retrieval-augmented-generation/",
    relatedKeys: ["api"],
    prerequisiteKeys: [],
    aliases: ["retrieval augmented generation", "retrieval-augmented generation"],
  },

  // --- Lot 2 : expansion du dictionnaire ---------------------------------

  {
    key: "closure",
    name: "Closure",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "En JavaScript, une fonction qui « se souvient » des variables de son environnement de création, même après que cet environnement a fini de s'exécuter.",
    explanationBeginner:
      "Imagine une fonction qui crée un compteur et le garde en mémoire même après être terminée : chaque fois que tu rappelles la fonction qu'elle a retournée, elle se souvient de la dernière valeur. C'est une closure — la fonction interne garde accès aux variables de la fonction externe.",
    explanationAdvanced:
      "Une closure se forme dès qu'une fonction interne référence une variable de sa fonction englobante ; le moteur JS garde cette variable vivante en mémoire tant que la closure existe (au lieu de la garbage-collector normalement). Utilisé pour l'encapsulation (variables privées), les factory functions, et les callbacks qui doivent garder un état entre appels.",
    docUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Closures",
    relatedKeys: ["event-loop"],
    prerequisiteKeys: [],
    aliases: ["fermeture"],
  },
  {
    key: "async-await",
    name: "async/await",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Une syntaxe JavaScript qui permet d'écrire du code asynchrone (basé sur des Promises) comme s'il était séquentiel, sans chaîner des `.then()`.",
    explanationBeginner:
      "`await` met en pause l'exécution de la fonction (pas du programme entier) jusqu'à ce que la Promise soit résolue, puis continue avec le résultat — comme si tu attendais patiemment une réponse avant de passer à la ligne suivante, au lieu d'imbriquer des callbacks.",
    explanationAdvanced:
      "`async/await` est du sucre syntaxique par-dessus les Promises : une fonction `async` retourne toujours une Promise, et `await` ne peut être utilisé qu'à l'intérieur. Une erreur rejetée par une Promise attendue devient une exception classique, capturable avec `try/catch` — ce qui unifie la gestion d'erreurs synchrone et asynchrone.",
    docUrl:
      "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function",
    relatedKeys: ["promise"],
    prerequisiteKeys: ["promise"],
    aliases: ["async await", "await"],
  },
  {
    key: "graphql",
    name: "GraphQL",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Un langage de requête pour APIs où le client précise exactement les champs qu'il veut recevoir, au lieu de recevoir une réponse fixe définie par le serveur.",
    explanationBeginner:
      "Avec une API REST classique, tu reçois souvent plus (ou moins) de données que ce dont tu as besoin. Avec GraphQL, tu écris une requête qui liste précisément les champs voulus, et le serveur ne renvoie que ça — un seul appel peut remplacer plusieurs requêtes REST.",
    explanationAdvanced:
      "GraphQL expose un seul endpoint (généralement `/graphql`) et un schéma fortement typé décrivant les types, requêtes et mutations disponibles. Avantage : élimine l'over-fetching/under-fetching typique de REST. Inconvénient : plus complexe à mettre en cache côté HTTP, et nécessite une attention particulière aux coûts de requêtes profondément imbriquées (protection contre les requêtes abusives).",
    docUrl: "https://graphql.org/learn/",
    relatedKeys: ["api", "rest"],
    prerequisiteKeys: ["api"],
    aliases: [],
  },
  {
    key: "orm",
    name: "ORM",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Object-Relational Mapping — une bibliothèque qui permet de manipuler une base de données relationnelle avec des objets/fonctions du langage de programmation plutôt qu'en écrivant du SQL brut.",
    explanationBeginner:
      "Au lieu d'écrire `SELECT * FROM users WHERE id = 1`, tu écris quelque chose comme `User.findById(1)` dans ton langage habituel. L'ORM traduit ça en SQL pour toi — et te protège au passage des injections SQL en paramétrant les requêtes automatiquement.",
    explanationAdvanced:
      "Un ORM (Prisma, TypeORM, Sequelize...) mappe des tables à des modèles/classes et des lignes à des instances. Le compromis classique : plus rapide à écrire et plus sûr par défaut, mais peut générer des requêtes SQL sous-optimales sur des cas complexes — d'où l'intérêt de savoir lire le SQL généré (voir `EXPLAIN ANALYZE`) quand les performances deviennent critiques.",
    docUrl: "https://www.prisma.io/dataguide/types/relational/what-is-an-orm",
    relatedKeys: ["sql-injection"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "npm",
    name: "npm",
    category: "DEVELOPMENT",
    level: 1,
    definition:
      "Node Package Manager — le gestionnaire de paquets par défaut de Node.js, utilisé pour installer et partager des bibliothèques JavaScript/TypeScript.",
    explanationBeginner:
      "`npm install express` télécharge la bibliothèque « express » et ses dépendances dans un dossier `node_modules`. Le fichier `package.json` liste les dépendances du projet ; `package-lock.json` fige les versions exactes installées, pour que tout le monde ait le même environnement.",
    explanationAdvanced:
      "npm résout un arbre de dépendances (souvent avec des versions différentes de la même bibliothèque selon qui la demande) et le fige dans le lockfile pour des installations reproductibles. Alternatives : Yarn, pnpm — ce dernier économise de l'espace disque en partageant les paquets entre projets via des liens durs plutôt qu'en les dupliquant.",
    docUrl: "https://docs.npmjs.com/about-npm",
    relatedKeys: ["semver"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "semver",
    name: "Semantic Versioning",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Une convention de numérotation de version en trois nombres (MAJOR.MINOR.PATCH) qui communique le type de changement apporté par une nouvelle version.",
    explanationBeginner:
      "Version `2.4.1` : le premier nombre (MAJOR) change si la mise à jour casse la compatibilité, le deuxième (MINOR) si de nouvelles fonctionnalités sont ajoutées sans rien casser, le troisième (PATCH) pour des corrections de bugs uniquement.",
    explanationAdvanced:
      "Dans `package.json`, `^1.2.3` autorise les mises à jour MINOR et PATCH (jusqu'à `<2.0.0`), `~1.2.3` autorise seulement les PATCH. Le respect du semver n'est qu'une convention — rien n'empêche techniquement un mainteneur de casser la compatibilité dans un PATCH, d'où l'intérêt d'un lockfile pour des builds reproductibles.",
    docUrl: "https://semver.org/",
    relatedKeys: ["npm"],
    prerequisiteKeys: [],
    aliases: ["versionnage sémantique"],
  },
  {
    key: "ci-cd",
    name: "CI/CD",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Continuous Integration / Continuous Deployment — l'automatisation des tests et du déploiement à chaque changement de code, plutôt que de le faire manuellement.",
    explanationBeginner:
      "À chaque fois que tu pousses du code, un robot lance automatiquement les tests (CI) et, si tout passe, peut aussi déployer la nouvelle version en production (CD) — sans qu'un humain n'ait à cliquer sur des boutons à chaque fois.",
    explanationAdvanced:
      "L'Intégration Continue vérifie qu'un changement s'intègre proprement (build + tests) avant même la revue de code. Le Déploiement Continu va plus loin en publiant automatiquement chaque changement qui passe les vérifications — nécessite une suite de tests suffisamment fiable pour faire confiance au pipeline plutôt qu'à une vérification manuelle.",
    docUrl: "https://docs.github.com/en/actions/about-github-actions/about-continuous-integration",
    relatedKeys: ["unit-testing"],
    prerequisiteKeys: ["git"],
    aliases: ["integration continue", "deploiement continu"],
  },
  {
    key: "unit-testing",
    name: "Test Unitaire",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Un test automatisé qui vérifie le comportement d'une seule unité de code (souvent une fonction) de façon isolée, indépendamment du reste du système.",
    explanationBeginner:
      "Si tu as une fonction `addition(a, b)`, un test unitaire vérifie par exemple que `addition(2, 3)` retourne bien `5` — automatiquement, sans avoir à relancer toute l'application et tester à la main à chaque fois.",
    explanationAdvanced:
      "Un bon test unitaire est rapide, déterministe et isolé (pas de vraie base de données ni de vrai appel réseau — on utilise des mocks/stubs pour simuler les dépendances). Il se distingue du test d'intégration (qui vérifie que plusieurs composants fonctionnent bien ensemble) et du test end-to-end (qui simule un vrai parcours utilisateur).",
    docUrl: "https://martinfowler.com/bliki/UnitTest.html",
    relatedKeys: ["ci-cd"],
    prerequisiteKeys: [],
    aliases: ["unit test", "test unitaire"],
  },
  {
    key: "websocket",
    name: "WebSocket",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Un protocole qui maintient une connexion bidirectionnelle et persistante entre client et serveur, contrairement à HTTP où le client doit toujours initier chaque échange.",
    explanationBeginner:
      "Avec HTTP classique, le serveur ne peut « parler » que quand le client lui pose une question. Avec un WebSocket, une fois la connexion établie, le serveur peut envoyer des messages au client à tout moment — utile pour un chat en temps réel ou des notifications live.",
    explanationAdvanced:
      "La connexion démarre par un handshake HTTP (upgrade vers le protocole `ws://` ou `wss://` chiffré), puis reste ouverte tant qu'aucune des deux parties ne la ferme. Contrairement au polling (interroger le serveur en boucle), le WebSocket évite de gaspiller des requêtes inutiles, mais impose de gérer soi-même la reconnexion en cas de coupure réseau.",
    docUrl: "https://developer.mozilla.org/docs/Web/API/WebSockets_API",
    relatedKeys: ["http"],
    prerequisiteKeys: ["http"],
    aliases: ["websockets"],
  },
  {
    key: "json",
    name: "JSON",
    category: "DEVELOPMENT",
    level: 1,
    definition:
      "JavaScript Object Notation — un format texte léger pour représenter des données structurées (objets, tableaux, nombres, chaînes...), utilisé massivement pour échanger des données entre systèmes.",
    explanationBeginner:
      "`{ \"nom\": \"Alice\", \"age\": 25 }` est un exemple de JSON : des paires clé-valeur lisibles par un humain ET facilement analysables par une machine. La plupart des APIs web envoient et reçoivent leurs données dans ce format.",
    explanationAdvanced:
      "JSON ne supporte que quelques types (string, number, boolean, null, object, array) — pas de dates natives, pas de commentaires, pas de `undefined`. `JSON.stringify()`/`JSON.parse()` convertissent entre objets JavaScript et texte JSON ; attention aux références circulaires qui font planter `stringify()`.",
    docUrl: "https://www.json.org/json-en.html",
    relatedKeys: ["api"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "regex",
    name: "Expression régulière",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Une séquence de caractères qui définit un motif de recherche dans du texte, utilisée pour valider, rechercher ou remplacer des chaînes selon un format précis.",
    explanationBeginner:
      "Par exemple, `/^\\d{5}$/` vérifie qu'une chaîne contient exactement 5 chiffres, comme un code postal français. Plutôt que d'écrire du code compliqué pour vérifier ça caractère par caractère, une regex l'exprime en une seule ligne.",
    explanationAdvanced:
      "Les regex sont puissantes mais peuvent devenir illisibles rapidement, et certains motifs mal écrits provoquent du « catastrophic backtracking » — un temps d'exécution qui explose exponentiellement sur certaines entrées (source de vraies vulnérabilités ReDoS en production). Toujours tester une regex complexe avec des entrées limites avant de la déployer.",
    docUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_Expressions",
    relatedKeys: [],
    prerequisiteKeys: [],
    aliases: ["regexp", "expression reguliere"],
  },
  {
    key: "idempotency",
    name: "Idempotence",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Une opération est idempotente si l'exécuter plusieurs fois produit le même résultat que l'exécuter une seule fois — sans effet de bord supplémentaire à chaque répétition.",
    explanationBeginner:
      "Éteindre une lampe qui est déjà éteinte ne change rien : c'est idempotent. À l'inverse, ajouter un article au panier à chaque clic sur « Ajouter » ne l'est pas — cliquer deux fois ajoute deux articles.",
    explanationAdvanced:
      "En HTTP, GET/PUT/DELETE sont censés être idempotents (répéter la requête ne change rien de plus après la première fois), contrairement à POST. C'est crucial pour la fiabilité réseau : si un client ne reçoit pas de réponse et retente automatiquement une requête PUT, ce n'est pas grave si c'est réellement idempotent côté serveur — pas pour un POST de paiement, par exemple, d'où l'usage de clés d'idempotence pour sécuriser les retries sur des opérations sensibles.",
    docUrl: "https://developer.mozilla.org/docs/Glossary/Idempotent",
    relatedKeys: ["http", "rest"],
    prerequisiteKeys: ["http"],
    aliases: ["idempotent"],
  },
  {
    key: "cors",
    name: "CORS",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Cross-Origin Resource Sharing — un mécanisme de sécurité du navigateur qui bloque par défaut les requêtes JavaScript vers un domaine différent de celui de la page, sauf autorisation explicite du serveur cible.",
    explanationBeginner:
      "Si ton site `monsite.com` essaie d'appeler une API sur `api-externe.com` depuis le navigateur, celui-ci bloque la réponse par défaut (protection contre certaines attaques). L'API doit explicitement dire « j'autorise monsite.com » via un en-tête HTTP pour que ça fonctionne.",
    explanationAdvanced:
      "CORS fonctionne via des en-têtes HTTP (`Access-Control-Allow-Origin` et consorts) renvoyés par le serveur ; pour les requêtes « non simples » (avec certains headers/méthodes), le navigateur envoie d'abord une requête `OPTIONS` de pré-vérification (preflight). CORS protège le navigateur qui fait la requête, pas le serveur — un attaquant qui appelle ton API directement (pas depuis un navigateur) n'est pas concerné par CORS, il faut une vraie authentification côté serveur pour se protéger réellement.",
    docUrl: "https://developer.mozilla.org/docs/Web/HTTP/CORS",
    relatedKeys: ["http"],
    prerequisiteKeys: ["http"],
    aliases: [],
  },
  {
    key: "mfa",
    name: "MFA / 2FA",
    category: "CYBERSECURITY",
    level: 2,
    definition:
      "Multi-Factor Authentication — exiger au moins deux preuves d'identité différentes (ex: mot de passe + code temporaire) pour se connecter, plutôt qu'un seul facteur.",
    explanationBeginner:
      "Même si quelqu'un vole ton mot de passe, il ne peut pas se connecter sans le deuxième facteur (ton téléphone, une clé physique...). C'est pour ça qu'activer le 2FA partout où c'est possible protège énormément, même avec un mot de passe imparfait.",
    explanationAdvanced:
      "Les trois catégories de facteurs : ce que tu sais (mot de passe), ce que tu possèdes (téléphone, clé FIDO2/U2F), ce que tu es (biométrie). Les codes SMS sont le facteur le plus faible (vulnérables au SIM swapping) ; les applications TOTP (Google Authenticator...) et les clés physiques FIDO2 sont nettement plus robustes.",
    docUrl: "https://owasp.org/www-community/controls/Multi_Factor_Authentication",
    relatedKeys: [],
    prerequisiteKeys: [],
    aliases: ["2fa", "authentification a deux facteurs", "authentification multifacteur"],
  },
  {
    key: "csrf",
    name: "CSRF",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Cross-Site Request Forgery — une attaque qui pousse le navigateur d'une victime déjà connectée à envoyer une requête non désirée vers un site, à son insu.",
    explanationBeginner:
      "Si tu es connecté à ta banque et que tu visites un site malveillant, celui-ci peut essayer de faire envoyer une requête à ta banque (ex: un virement) en utilisant ta session déjà ouverte, sans que tu t'en rendes compte — c'est du CSRF.",
    explanationAdvanced:
      "Le navigateur envoie automatiquement les cookies de session sur toute requête vers le domaine correspondant, même initiée par une page tierce — c'est ce que le CSRF exploite. Défenses : tokens anti-CSRF (valeur imprévisible vérifiée à chaque requête sensible), cookies `SameSite=Strict/Lax` qui empêchent leur envoi cross-site, et vérification de l'en-tête `Origin`/`Referer`.",
    docUrl: "https://owasp.org/www-community/attacks/csrf",
    relatedKeys: ["xss"],
    prerequisiteKeys: ["http"],
    aliases: ["cross-site request forgery"],
  },
  {
    key: "zero-trust",
    name: "Zero Trust",
    category: "CYBERSECURITY",
    level: 4,
    definition:
      "Un modèle de sécurité où aucun utilisateur ni appareil n'est automatiquement fait confiance, même à l'intérieur du réseau de l'entreprise — chaque accès est vérifié explicitement.",
    explanationBeginner:
      "Avant, une fois « dans » le réseau de l'entreprise (via le bureau ou un VPN), on faisait souvent confiance par défaut. Le Zero Trust part du principe inverse : « ne fais confiance à rien, vérifie tout », que la demande vienne de l'extérieur ou de l'intérieur.",
    explanationAdvanced:
      "Concrètement : authentification forte systématique, accès accordés selon le principe du moindre privilège et réévalués en continu (pas juste à la connexion), micro-segmentation du réseau pour limiter les mouvements latéraux en cas de compromission. Un changement culturel autant que technique — s'oppose au modèle traditionnel de « périmètre de confiance ».",
    docUrl: "https://www.cisa.gov/zero-trust-maturity-model",
    relatedKeys: ["mfa"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "ransomware",
    name: "Ransomware",
    category: "CYBERSECURITY",
    level: 2,
    definition:
      "Un logiciel malveillant qui chiffre les fichiers d'une victime et exige une rançon (souvent en cryptomonnaie) en échange de la clé de déchiffrement.",
    explanationBeginner:
      "Un ransomware verrouille tes fichiers (photos, documents...) en les chiffrant, puis affiche un message demandant de l'argent pour les débloquer. Payer ne garantit jamais de récupérer ses fichiers — la meilleure protection reste d'avoir des sauvegardes régulières, hors ligne ou isolées.",
    explanationAdvanced:
      "Se propage souvent via phishing, RDP mal sécurisé, ou l'exploitation de vulnérabilités non corrigées. Les variantes modernes pratiquent la « double extorsion » : exfiltrer les données avant de les chiffrer, pour menacer de les publier même si la victime restaure ses sauvegardes sans payer. La défense combine sauvegardes testées (règle 3-2-1), segmentation réseau, et patch management rigoureux.",
    docUrl: "https://www.cisa.gov/stopransomware",
    relatedKeys: [],
    prerequisiteKeys: [],
    aliases: ["rancongiciel"],
  },
  {
    key: "ddos",
    name: "DDoS",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Distributed Denial of Service — une attaque qui submerge un service de trafic depuis de nombreuses sources simultanément, pour le rendre indisponible aux utilisateurs légitimes.",
    explanationBeginner:
      "Imagine des milliers de personnes qui appellent en même temps la même ligne téléphonique : elle devient saturée et plus personne ne peut passer un appel légitime. Un DDoS fait ça à un site web, avec du trafic provenant souvent d'appareils compromis (un botnet) répartis partout dans le monde.",
    explanationAdvanced:
      "On distingue les attaques volumétriques (saturer la bande passante), les attaques applicatives (épuiser les ressources serveur avec des requêtes coûteuses mais peu nombreuses), et les attaques protocolaires (exploiter des faiblesses de TCP/IP). Les défenses passent par des CDN/services anti-DDoS qui absorbent et filtrent le trafic en amont avant qu'il n'atteigne l'infrastructure réelle.",
    docUrl: "https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/",
    relatedKeys: ["cdn"],
    prerequisiteKeys: [],
    aliases: ["deni de service distribue"],
  },
  {
    key: "penetration-testing",
    name: "Test d'intrusion",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Une simulation autorisée d'attaque contre un système, pour identifier ses vulnérabilités réelles avant qu'un vrai attaquant ne les exploite.",
    explanationBeginner:
      "Une entreprise engage des experts en sécurité pour essayer de « pirater » ses propres systèmes, avec autorisation écrite et un périmètre défini à l'avance, afin de trouver les failles et les corriger avant qu'un vrai attaquant ne les découvre.",
    explanationAdvanced:
      "Un pentest suit généralement une méthodologie structurée (reconnaissance, énumération, exploitation, post-exploitation, reporting — voir le cours Red Team Fundamentals de Nodify). Se distingue d'un audit de vulnérabilités automatisé (scan) par l'exploitation active des failles trouvées pour évaluer leur impact réel, et d'un Red Team engagement par un périmètre généralement plus large et une durée plus longue.",
    docUrl: "https://owasp.org/www-project-web-security-testing-guide/",
    relatedKeys: [],
    prerequisiteKeys: [],
    aliases: ["pentest", "test intrusion"],
  },
  {
    key: "ids-ips",
    name: "IDS/IPS",
    category: "CYBERSECURITY",
    level: 4,
    definition:
      "Intrusion Detection/Prevention System — un système qui surveille le trafic réseau pour détecter (IDS) et éventuellement bloquer automatiquement (IPS) une activité suspecte.",
    explanationBeginner:
      "Un IDS agit comme une alarme qui prévient quand quelque chose de suspect se passe sur le réseau, sans agir lui-même. Un IPS va plus loin : il peut bloquer automatiquement le trafic suspect en temps réel, comme un vigile qui referme la porte au lieu de juste sonner l'alarme.",
    explanationAdvanced:
      "Deux approches de détection : par signatures (motifs d'attaques connues, rapide mais aveugle aux nouvelles menaces) et par anomalies (écart par rapport à un comportement de référence, détecte du nouveau mais génère plus de faux positifs). Un IPS mal configuré peut lui-même devenir un vecteur de déni de service s'il bloque à tort du trafic légitime.",
    docUrl: "https://www.cloudflare.com/learning/security/what-is-intrusion-prevention-system-ips/",
    relatedKeys: ["ddos"],
    prerequisiteKeys: [],
    aliases: ["ids", "ips"],
  },
  {
    key: "vpn",
    name: "VPN",
    category: "NETWORKING",
    level: 2,
    definition:
      "Virtual Private Network — un tunnel chiffré entre un appareil et un serveur intermédiaire, qui cache le trafic réseau aux intermédiaires (ex: le Wi-Fi public) et masque l'adresse IP d'origine.",
    explanationBeginner:
      "Sur un Wi-Fi public, n'importe qui sur le même réseau pourrait techniquement espionner ton trafic non chiffré. Un VPN crée un tunnel sécurisé entre toi et un serveur de confiance, rendant ton trafic illisible pour quiconque se trouve entre les deux.",
    explanationAdvanced:
      "Un VPN protège le trafic entre toi et le serveur VPN, mais le fournisseur du VPN voit lui-même tout ce trafic — un VPN ne remplace donc pas HTTPS de bout en bout, ni un antivirus, ni la vigilance face au phishing. En entreprise, un VPN sert aussi à donner un accès distant sécurisé au réseau interne, de plus en plus remplacé par des architectures Zero Trust plus granulaires.",
    docUrl: "https://www.cloudflare.com/learning/access-management/what-is-a-vpn/",
    relatedKeys: ["tls-ssl"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "tcp-vs-udp",
    name: "TCP vs UDP",
    category: "NETWORKING",
    level: 2,
    definition:
      "Deux protocoles de transport fondamentaux d'internet : TCP garantit la livraison fiable et ordonnée des données, UDP privilégie la vitesse sans garantie de livraison.",
    explanationBeginner:
      "TCP, c'est comme une lettre recommandée : tu as la confirmation que chaque morceau est bien arrivé, dans l'ordre — mais c'est plus lent à cause de ces vérifications. UDP, c'est comme crier une info dans une pièce : plus rapide, mais rien ne garantit que tout le monde l'a entendue.",
    explanationAdvanced:
      "TCP établit une connexion (handshake en 3 étapes), retransmet les paquets perdus et les réordonne — idéal pour le chargement d'une page web ou un transfert de fichier où rien ne doit manquer. UDP n'a ni connexion ni retransmission, ce qui le rend adapté au streaming vidéo ou aux jeux en ligne, où une donnée légèrement en retard ne vaut plus la peine d'être renvoyée.",
    docUrl: "https://developer.mozilla.org/docs/Glossary/TCP",
    relatedKeys: ["http"],
    prerequisiteKeys: [],
    aliases: ["tcp", "udp"],
  },
  {
    key: "load-balancer",
    name: "Load Balancer",
    category: "NETWORKING",
    level: 3,
    definition:
      "Un système qui répartit le trafic entrant entre plusieurs serveurs, pour éviter qu'un seul serveur ne soit surchargé et améliorer la disponibilité globale.",
    explanationBeginner:
      "Au lieu d'envoyer toutes les requêtes à un seul serveur (qui pourrait tomber en panne ou ralentir sous la charge), un load balancer les répartit intelligemment entre plusieurs serveurs identiques — comme plusieurs caisses ouvertes dans un magasin plutôt qu'une seule.",
    explanationAdvanced:
      "Stratégies de répartition courantes : round-robin (à tour de rôle), least connections (vers le serveur le moins chargé), ou par hash (toujours le même serveur pour un même client, utile pour les sessions). Un load balancer fait aussi souvent office de point de terminaison TLS et de vérification de santé (health checks) pour retirer automatiquement un serveur défaillant de la rotation.",
    docUrl: "https://www.cloudflare.com/learning/performance/what-is-load-balancing/",
    relatedKeys: ["cdn"],
    prerequisiteKeys: [],
    aliases: ["repartiteur de charge"],
  },
  {
    key: "cdn",
    name: "CDN",
    category: "NETWORKING",
    level: 2,
    definition:
      "Content Delivery Network — un réseau de serveurs répartis géographiquement qui servent le contenu d'un site depuis le point le plus proche de l'utilisateur, pour réduire la latence.",
    explanationBeginner:
      "Si ton site est hébergé en France mais qu'un visiteur se connecte depuis le Japon, un CDN sert une copie du contenu depuis un serveur proche du Japon plutôt que de faire l'aller-retour jusqu'en France — la page charge beaucoup plus vite.",
    explanationAdvanced:
      "Un CDN met en cache les ressources statiques (images, CSS, JS) au plus près des utilisateurs via des points de présence (PoP) répartis mondialement, et sert aussi de première ligne de défense contre les attaques DDoS volumétriques en absorbant le trafic avant qu'il n'atteigne l'origine. La gestion du cache invalidation (savoir quand une ressource mise en cache est obsolète) est le principal défi opérationnel.",
    docUrl: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/",
    relatedKeys: ["load-balancer", "ddos"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "tls-ssl",
    name: "TLS/SSL",
    category: "NETWORKING",
    level: 2,
    definition:
      "Les protocoles qui chiffrent les communications sur internet (HTTPS = HTTP + TLS), garantissant confidentialité et intégrité entre un client et un serveur.",
    explanationBeginner:
      "Le petit cadenas dans la barre d'adresse de ton navigateur signifie que la connexion utilise TLS : personne entre toi et le site ne peut lire ou modifier les données échangées. SSL est l'ancien nom du protocole ; TLS est sa version moderne et sécurisée.",
    explanationAdvanced:
      "TLS établit une connexion via un handshake qui négocie l'algorithme de chiffrement et échange les clés (souvent via Diffie-Hellman éphémère pour garantir le forward secrecy), puis authentifie le serveur via un certificat signé par une autorité de certification de confiance. SSL (versions 1 à 3) est obsolète et vulnérable — seul TLS 1.2+ est considéré sûr aujourd'hui.",
    docUrl: "https://www.cloudflare.com/learning/ssl/what-is-ssl/",
    relatedKeys: ["vpn", "http"],
    prerequisiteKeys: [],
    aliases: ["ssl", "tls", "https"],
  },
  {
    key: "llm",
    name: "LLM",
    category: "AI",
    level: 2,
    definition:
      "Large Language Model — un modèle d'intelligence artificielle entraîné sur d'énormes volumes de texte, capable de générer et comprendre du langage naturel.",
    explanationBeginner:
      "Un LLM a « lu » une quantité astronomique de texte pendant son entraînement, ce qui lui permet de prédire quel mot (ou fragment de mot) devrait venir ensuite dans une phrase — de façon si sophistiquée qu'il peut répondre à des questions, résumer des textes ou écrire du code.",
    explanationAdvanced:
      "Architecturalement, la plupart des LLM modernes reposent sur les Transformers (mécanisme d'attention permettant de pondérer l'importance de chaque mot par rapport aux autres dans son contexte). Un LLM ne « comprend » pas au sens humain : il génère la suite la plus probable statistiquement, ce qui explique à la fois ses capacités impressionnantes et ses hallucinations (affirmer quelque chose de faux avec assurance).",
    docUrl: "https://aws.amazon.com/what-is/large-language-model/",
    relatedKeys: ["rag", "hallucination"],
    prerequisiteKeys: [],
    aliases: ["large language model", "modele de langage"],
  },
  {
    key: "prompt-engineering",
    name: "Prompt Engineering",
    category: "AI",
    level: 2,
    definition:
      "La pratique de concevoir soigneusement les instructions données à un modèle de langage pour obtenir des réponses plus précises, utiles ou fiables.",
    explanationBeginner:
      "La façon dont tu poses une question à une IA change beaucoup la qualité de sa réponse. Donner des exemples, préciser le format attendu, ou décomposer une tâche complexe en étapes améliore souvent énormément le résultat — sans changer le modèle lui-même.",
    explanationAdvanced:
      "Techniques courantes : le few-shot prompting (donner des exemples du résultat attendu dans le prompt), le chain-of-thought (demander au modèle de raisonner étape par étape avant de conclure), et la séparation claire entre instructions système et contenu utilisateur pour réduire les risques d'injection de prompt (où un contenu externe tente de détourner les instructions originales).",
    docUrl: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
    relatedKeys: ["llm"],
    prerequisiteKeys: ["llm"],
    aliases: ["ingenierie de prompt"],
  },
  {
    key: "fine-tuning",
    name: "Fine-tuning",
    category: "AI",
    level: 4,
    definition:
      "Poursuivre l'entraînement d'un modèle déjà pré-entraîné sur un jeu de données plus restreint et spécifique, pour spécialiser son comportement sur une tâche précise.",
    explanationBeginner:
      "Plutôt que d'entraîner un modèle d'IA depuis zéro (extrêmement coûteux), on part d'un modèle déjà entraîné sur des connaissances générales, et on l'entraîne un peu plus sur des exemples spécifiques à ton besoin — comme un professionnel généraliste qui suit une formation spécialisée.",
    explanationAdvanced:
      "Le fine-tuning ajuste les poids du modèle lui-même, contrairement au RAG ou au prompt engineering qui ne changent pas le modèle mais son contexte d'entrée. Plus coûteux et plus long à mettre en place, mais utile quand un comportement très spécifique et cohérent est requis (ton, format strict, domaine très spécialisé) au-delà de ce qu'un bon prompt peut garantir de façon fiable.",
    docUrl: "https://platform.openai.com/docs/guides/fine-tuning",
    relatedKeys: ["llm"],
    prerequisiteKeys: ["llm"],
    aliases: [],
  },
  {
    key: "hallucination",
    name: "Hallucination (IA)",
    category: "AI",
    level: 3,
    definition:
      "Quand un modèle de langage génère une information fausse ou inventée avec la même assurance qu'une information vraie, sans signaler son incertitude.",
    explanationBeginner:
      "Une IA peut inventer une citation, une date ou un fait qui n'existe pas, tout en le présentant comme certain — parce qu'elle génère le texte le plus probable statistiquement, pas en vérifiant des faits dans une base de connaissances fiable. D'où l'importance de toujours vérifier les informations critiques données par une IA.",
    explanationAdvanced:
      "Le RAG réduit les hallucinations en ancrant les réponses dans des documents réels fournis en contexte, mais ne les élimine pas complètement. D'autres approches : demander au modèle de citer ses sources, lui demander explicitement d'admettre son incertitude plutôt que d'inventer, ou faire vérifier la réponse par un second modèle/processus avant de la considérer fiable.",
    docUrl: "https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)",
    relatedKeys: ["llm", "rag"],
    prerequisiteKeys: ["llm"],
    aliases: ["hallucination ia"],
  },
  {
    key: "tokenization",
    name: "Tokenisation",
    category: "AI",
    level: 3,
    definition:
      "Le découpage d'un texte en unités plus petites (tokens — mots, sous-mots ou caractères) que le modèle de langage traite réellement, au lieu de traiter le texte brut.",
    explanationBeginner:
      "Un LLM ne « lit » pas directement des mots : il découpe le texte en petits morceaux appelés tokens (parfois un mot entier, parfois juste un fragment). C'est aussi l'unité utilisée pour facturer l'usage d'une API IA — plus ton texte a de tokens, plus ça coûte cher et prend de temps à traiter.",
    explanationAdvanced:
      "Les tokenizers modernes (comme BPE — Byte Pair Encoding) découpent le texte en sous-mots fréquents plutôt qu'en mots entiers, ce qui permet de gérer des mots inconnus en les décomposant en fragments déjà vus à l'entraînement. La taille du contexte maximal d'un modèle (« context window ») se mesure en tokens, pas en caractères ou en mots.",
    docUrl: "https://platform.openai.com/tokenizer",
    relatedKeys: ["llm"],
    prerequisiteKeys: ["llm"],
    aliases: ["tokenisation", "token llm"],
  },
  {
    key: "process-vs-thread",
    name: "Process vs Thread",
    category: "SYSTEMS",
    level: 3,
    definition:
      "Un process (processus) est une instance isolée d'un programme en exécution avec sa propre mémoire ; un thread (fil d'exécution) est une unité d'exécution qui partage la mémoire de son processus avec d'autres threads.",
    explanationBeginner:
      "Chaque processus est comme une maison séparée avec ses propres pièces (mémoire) : ce qui se passe dans l'un n'affecte pas directement l'autre. Les threads sont comme plusieurs personnes qui vivent dans la même maison (processus) et partagent les mêmes pièces — plus rapide à faire communiquer, mais plus risqué si deux threads modifient la même chose en même temps.",
    explanationAdvanced:
      "Créer un processus est plus coûteux (nouvelle mémoire, nouveau contexte) que créer un thread, mais les processus s'isolent mieux (un crash n'affecte pas les autres). Node.js est mono-thread pour l'exécution JavaScript (voir Event Loop) mais délègue certaines opérations (I/O disque, crypto) à un pool de threads en arrière-plan (libuv) — d'où l'intérêt de `worker_threads` ou de processus enfants pour du vrai calcul parallèle en Node.js.",
    docUrl: "https://en.wikipedia.org/wiki/Thread_(computing)",
    relatedKeys: ["event-loop"],
    prerequisiteKeys: [],
    aliases: ["processus vs thread", "thread"],
  },
  {
    key: "shell",
    name: "Shell",
    category: "SYSTEMS",
    level: 1,
    definition:
      "Un programme qui interprète les commandes tapées par l'utilisateur (ou un script) et les transmet au système d'exploitation — l'interface en ligne de commande d'un système.",
    explanationBeginner:
      "Quand tu ouvres un « terminal » et tapes `ls` ou `cd Documents`, c'est le shell (souvent Bash sous Linux/Mac, PowerShell sous Windows) qui comprend ta commande et l'exécute. C'est une alternative textuelle à cliquer sur des icônes.",
    explanationAdvanced:
      "Un shell peut aussi exécuter des scripts (suites de commandes automatisées), gérer des variables d'environnement, et enchaîner des commandes via des pipes (`|`, qui envoie la sortie d'une commande en entrée de la suivante). Bash reste le shell le plus répandu sous Linux/macOS ; PowerShell (orienté objets plutôt que texte brut) est le standard moderne sous Windows.",
    docUrl: "https://www.gnu.org/software/bash/manual/bash.html",
    relatedKeys: ["linux"],
    prerequisiteKeys: [],
    aliases: ["terminal", "ligne de commande"],
  },
  {
    key: "environment-variable",
    name: "Variable d'environnement",
    category: "SYSTEMS",
    level: 1,
    definition:
      "Une valeur configurée en dehors du code source, accessible par un programme au moment de son exécution — utilisée pour stocker de la config qui varie selon l'environnement (dev, prod...).",
    explanationBeginner:
      "Plutôt que d'écrire ton mot de passe de base de données directement dans le code (visible par quiconque lit le fichier), tu le mets dans une variable d'environnement (`DATABASE_URL=...`) que le programme lit au démarrage. Ça permet aussi d'avoir une config différente en développement et en production sans toucher au code.",
    explanationAdvanced:
      "Les fichiers `.env` (chargés par des bibliothèques comme `dotenv`) sont une convention pratique en développement, mais ne doivent jamais être commités dans un dépôt Git (secrets exposés définitivement dans l'historique). En production, la plupart des plateformes d'hébergement injectent directement les variables d'environnement sans passer par un fichier `.env`.",
    docUrl: "https://12factor.net/config",
    relatedKeys: ["git"],
    prerequisiteKeys: [],
    aliases: ["env var", "variable environnement"],
  },
  {
    key: "kubernetes",
    name: "Kubernetes",
    category: "CLOUD",
    level: 4,
    definition:
      "Un système d'orchestration open-source qui automatise le déploiement, la mise à l'échelle et la gestion d'applications conteneurisées (Docker) à grande échelle.",
    explanationBeginner:
      "Si Docker permet de faire tourner un conteneur, Kubernetes gère des centaines ou des milliers de conteneurs à travers plusieurs machines : il les redémarre automatiquement s'ils plantent, en ajoute davantage si le trafic augmente, et répartit la charge entre eux.",
    explanationAdvanced:
      "Les concepts clés : Pod (plus petite unité déployable, un ou plusieurs conteneurs), Deployment (gère un ensemble de Pods identiques et leurs mises à jour), Service (point d'accès réseau stable vers un ensemble de Pods), et le control plane qui maintient en continu l'état réel du cluster aligné sur l'état désiré (déclaré en YAML). Sur-dimensionné pour un petit projet — sa complexité opérationnelle ne se justifie qu'à partir d'une certaine échelle.",
    docUrl: "https://kubernetes.io/docs/concepts/overview/",
    relatedKeys: ["docker"],
    prerequisiteKeys: ["docker"],
    aliases: ["k8s"],
  },
  {
    key: "serverless",
    name: "Serverless",
    category: "CLOUD",
    level: 3,
    definition:
      "Un modèle d'exécution cloud où le code s'exécute à la demande (déclenché par un événement) sans que le développeur ait à gérer ou provisionner de serveur lui-même.",
    explanationBeginner:
      "« Serverless » ne veut pas dire qu'il n'y a pas de serveur — juste que tu n'as pas à t'en occuper : tu déploies une fonction, le fournisseur cloud la fait tourner uniquement quand elle est appelée, et tu ne payes que pour ce temps d'exécution réel, pas pour un serveur qui tourne en permanence.",
    explanationAdvanced:
      "Les fonctions serverless (AWS Lambda, Cloudflare Workers...) souffrent du « cold start » : un délai supplémentaire au premier appel après une période d'inactivité, le temps que l'environnement d'exécution démarre. Adapté aux charges de travail intermittentes ou imprévisibles ; moins pertinent pour un service à trafic constant et élevé où un serveur dédié devient plus prévisible en coût et en latence.",
    docUrl: "https://aws.amazon.com/serverless/",
    relatedKeys: ["kubernetes", "docker"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "rust",
    name: "Rust",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Un langage de programmation système compilé, conçu pour offrir les performances du C/C++ sans les bugs mémoire classiques (use-after-free, data races) grâce à son système d'ownership vérifié à la compilation.",
    explanationBeginner:
      "Rust t'oblige à être précis sur qui « possède » chaque donnée à un instant donné (l'ownership). Ça semble contraignant au début, mais ça élimine à la compilation toute une catégorie de bugs (accéder à une mémoire déjà libérée, deux threads qui modifient la même donnée en même temps) que d'autres langages ne détectent qu'à l'exécution, si jamais ils les détectent.",
    explanationAdvanced:
      "Le borrow checker vérifie à la compilation que chaque valeur a un seul propriétaire à la fois (ou plusieurs emprunts en lecture seule, jamais un emprunt mutable en parallèle d'un autre emprunt) — pas de garbage collector, pas de pause GC imprévisible, mais une courbe d'apprentissage réelle. Très utilisé pour des composants critiques en performance/sécurité (moteurs WebAssembly, CLI, systèmes embarqués, composants de navigateurs).",
    docUrl: "https://doc.rust-lang.org/book/",
    relatedKeys: ["webassembly"],
    prerequisiteKeys: [],
    aliases: [],
  },
  {
    key: "webassembly",
    name: "WebAssembly",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Un format binaire portable et performant (Wasm) qui s'exécute dans le navigateur (et de plus en plus hors navigateur) à une vitesse proche du natif, en complément du JavaScript plutôt qu'à sa place.",
    explanationBeginner:
      "WebAssembly permet de faire tourner dans un navigateur du code écrit dans un autre langage (Rust, C++, Go...) compilé vers un format binaire très rapide à exécuter. Ce n'est pas un remplaçant de JavaScript : les deux collaborent, JS orchestre et Wasm prend en charge les calculs lourds (traitement d'image, jeux vidéo, chiffrement...).",
    explanationAdvanced:
      "Wasm s'exécute dans une sandbox mémoire-safe isolée du reste de la page, avec un accès au DOM uniquement via des appels JavaScript (pas d'accès direct). De plus en plus utilisé hors navigateur (WASI) pour du edge computing ou des plugins sandboxés portables indépendants de l'OS hôte.",
    docUrl: "https://webassembly.org/",
    relatedKeys: ["rust"],
    prerequisiteKeys: [],
    aliases: ["wasm"],
  },
  {
    key: "grpc",
    name: "gRPC",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Un framework RPC (Remote Procedure Call) développé par Google, basé sur HTTP/2 et Protocol Buffers, conçu pour la communication rapide et fortement typée entre microservices.",
    explanationBeginner:
      "Plutôt que d'échanger du JSON en texte libre comme une API REST classique, gRPC définit un contrat strict (quelles fonctions existent, quels types de données elles attendent) dans un fichier `.proto`, puis génère automatiquement le code client/serveur dans plusieurs langages — moins d'erreurs de format, des échanges plus compacts et plus rapides.",
    explanationAdvanced:
      "Protocol Buffers sérialise les données en binaire compact (plus petit et plus rapide à parser que du JSON), et HTTP/2 apporte le multiplexage et le streaming bidirectionnel natif. Très répandu pour la communication interne entre microservices dans une même infrastructure ; moins adapté qu'une API REST/GraphQL pour un usage public côté navigateur (support HTTP/2 natif limité côté client web).",
    docUrl: "https://grpc.io/docs/what-is-grpc/introduction/",
    relatedKeys: ["rest", "api"],
    prerequisiteKeys: ["api"],
    aliases: [],
  },
  {
    key: "terraform",
    name: "Terraform / Infrastructure as Code",
    category: "CLOUD",
    level: 3,
    definition:
      "Une approche (et un outil phare, Terraform) qui décrit l'infrastructure cloud (serveurs, réseaux, bases de données) dans des fichiers de configuration versionnés plutôt qu'en cliquant manuellement dans une console — l'Infrastructure as Code (IaC).",
    explanationBeginner:
      "Au lieu de créer un serveur à la main dans l'interface web d'un fournisseur cloud (et d'oublier comment tu l'as configuré six mois plus tard), tu décris l'infrastructure voulue dans un fichier texte. L'outil compare cet état voulu à l'état réel et applique automatiquement les changements nécessaires — le fichier devient la documentation vivante et versionnée de ton infrastructure.",
    explanationAdvanced:
      "Terraform maintient un fichier d'état (state) représentant l'infrastructure réellement provisionnée, et calcule un plan (diff entre l'état désiré dans le code et l'état réel) avant d'appliquer quoi que ce soit — permettant une revue avant modification, contrairement à un clic direct dans une console. Reproductible entre environnements (dev/staging/prod) et multi-fournisseurs via des providers (AWS, Azure, GCP, Cloudflare...).",
    docUrl: "https://developer.hashicorp.com/terraform/intro",
    relatedKeys: ["docker", "kubernetes", "cloud-fundamentals"],
    prerequisiteKeys: [],
    aliases: ["iac", "infrastructure as code"],
  },
  {
    key: "oauth2",
    name: "OAuth 2.0",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Un protocole d'autorisation déléguée qui permet à une application d'accéder à des ressources au nom d'un utilisateur (ex: se connecter avec Google) sans jamais recevoir son mot de passe.",
    explanationBeginner:
      "Quand tu cliques sur « Se connecter avec Google » sur un site, tu n'entres jamais ton mot de passe Google sur ce site tiers : Google t'authentifie sur sa propre page, puis transmet au site un jeton d'accès limité. OAuth 2.0 est le protocole qui organise cet échange — c'est de l'autorisation déléguée, pas directement de l'authentification.",
    explanationAdvanced:
      "OAuth 2.0 définit plusieurs « flows » selon le contexte (Authorization Code pour une app serveur, PKCE pour une app mobile/SPA sans secret client stockable en sécurité, Client Credentials pour une communication machine-à-machine). OAuth 2.0 en lui-même ne standardise pas l'identité de l'utilisateur — c'est le rôle d'OpenID Connect (OIDC), une couche d'authentification construite par-dessus OAuth 2.0, souvent confondue avec lui.",
    docUrl: "https://oauth.net/2/",
    relatedKeys: ["jwt", "mfa"],
    prerequisiteKeys: [],
    aliases: ["oauth"],
  },
  {
    key: "csp",
    name: "Content Security Policy (CSP)",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Un en-tête HTTP de sécurité qui indique au navigateur quelles sources de contenu (scripts, styles, images...) une page a le droit de charger — une défense en profondeur majeure contre les attaques XSS.",
    explanationBeginner:
      "Même si une faille XSS permet d'injecter du code malveillant dans une page, une CSP bien configurée peut empêcher ce code de s'exécuter en refusant de charger des scripts venant d'une source non autorisée dans la liste blanche du site.",
    explanationAdvanced:
      "Une directive typique : `Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.example`. Éviter `unsafe-inline`/`unsafe-eval` qui affaiblissent fortement la protection en autorisant le JavaScript inline ou dynamique. La directive `frame-ancestors` remplace aujourd'hui l'ancien en-tête `X-Frame-Options` pour se protéger du clickjacking (chargement de la page dans une iframe malveillante).",
    docUrl: "https://developer.mozilla.org/docs/Web/HTTP/CSP",
    relatedKeys: ["xss", "cors"],
    prerequisiteKeys: ["xss"],
    aliases: ["content security policy"],
  },
];

/**
 * Premier cours complet de l'Academy (Phase 5), rédigé à la main — pas de
 * contenu généré par IA. Un seul cours pour valider le moteur (Course →
 * Lesson → Question → progression) contre du vrai contenu avant d'en
 * écrire d'autres.
 */
interface QuestionSeed {
  order: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface LessonSeed {
  order: number;
  title: string;
  content: string;
  xpReward: number;
  questions: QuestionSeed[];
}

interface CourseSeed {
  key: string;
  title: string;
  description: string;
  category: SkillCategory;
  skillKey: string; // doit correspondre à un Skill.key existant (voir SKILLS)
  level: number;
  prerequisiteCourseKeys?: string[]; // clés d'autres CourseSeed.key
  lessons: LessonSeed[];
}

const COURSES: CourseSeed[] = [
  {
    key: "js-intro",
    title: "Introduction à JavaScript",
    description:
      "Les bases du langage le plus utilisé du web : variables, fonctions, boucles et conditions.",
    category: "DEVELOPMENT",
    skillKey: "javascript",
    level: 1,
    lessons: [
      {
        order: 1,
        title: "Qu'est-ce que JavaScript ?",
        content:
          "JavaScript est un langage de programmation créé en 1995, exécuté à l'origine dans les navigateurs pour rendre les pages web interactives. Depuis Node.js (2009), il tourne aussi côté serveur.\n\n" +
          "On déclare une variable avec `let` (valeur qui peut changer) ou `const` (valeur qui ne peut plus être réassignée après sa déclaration) — `var` existe encore mais est déconseillé en code moderne à cause de son comportement de portée moins prévisible.\n\n" +
          "Les types primitifs de base sont : `string` (texte), `number` (nombres, entiers et décimaux confondus), `boolean` (`true`/`false`), `undefined` (valeur absente) et `null` (absence volontaire de valeur).",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Quelle instruction déclare une variable qui ne peut plus être réassignée ?",
            choices: ["var", "let", "const", "static"],
            correctIndex: 2,
            explanation:
              "`const` empêche la réassignation de la variable (attention : si c'est un objet/tableau, son *contenu* reste modifiable, seule la référence est verrouillée).",
          },
          {
            order: 2,
            prompt: "Quel est le type de la valeur `true` en JavaScript ?",
            choices: ["string", "boolean", "number", "object"],
            correctIndex: 1,
            explanation: "`true` et `false` sont des valeurs du type primitif `boolean`.",
          },
        ],
      },
      {
        order: 2,
        title: "Fonctions et portée",
        content:
          "Une fonction regroupe du code réutilisable. Syntaxe classique : `function add(a, b) { return a + b; }`. Les fonctions fléchées (arrow functions) offrent une syntaxe plus courte : `(a, b) => a + b`.\n\n" +
          "La portée (scope) détermine où une variable est accessible. `let` et `const` ont une portée de bloc : une variable déclarée dans un `{ }` (y compris dans un `if` ou une boucle) n'existe qu'à l'intérieur de ce bloc. `var`, elle, a une portée de fonction entière — une source classique de bugs, une raison de plus de préférer `let`/`const`.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quelle syntaxe déclare une fonction fléchée qui additionne deux nombres ?",
            choices: [
              "function add(a,b) { return a+b }",
              "(a, b) => a + b",
              "def add(a,b): return a+b",
              "add(a,b) => { a+b }",
            ],
            correctIndex: 1,
            explanation:
              "`(a, b) => a + b` est une fonction fléchée avec retour implicite (pas besoin de `return` ni d'accolades pour une expression unique).",
          },
          {
            order: 2,
            prompt: "Une variable déclarée avec `let` à l'intérieur d'un bloc `{ }` est visible :",
            choices: [
              "Dans tout le fichier",
              "Uniquement dans ce bloc",
              "Uniquement dans les fonctions fléchées",
              "Jamais",
            ],
            correctIndex: 1,
            explanation:
              "C'est la portée de bloc : en dehors des accolades où elle a été déclarée, la variable n'existe plus.",
          },
        ],
      },
      {
        order: 3,
        title: "Boucles et conditions",
        content:
          "`if`/`else` exécute du code selon une condition. Pour répéter du code : `for` quand on connaît à l'avance le nombre d'itérations (souvent en parcourant un tableau), `while` quand on répète tant qu'une condition reste vraie, sans savoir combien de fois à l'avance.\n\n" +
          "Sur les tableaux, `array.map(fn)` est très utilisé : il retourne un **nouveau** tableau où chaque élément est le résultat de `fn` appliqué à l'élément original — le tableau de départ n'est jamais modifié.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt:
              "Quelle boucle est la plus adaptée pour répéter du code tant qu'une condition reste vraie, sans savoir à l'avance combien de fois ?",
            choices: ["for", "while", "switch", "const"],
            correctIndex: 1,
            explanation:
              "`while (condition) { ... }` répète tant que la condition est vraie — idéal quand le nombre d'itérations n'est pas connu à l'avance.",
          },
          {
            order: 2,
            prompt: "Que fait `array.map(fn)` ?",
            choices: [
              "Modifie le tableau original en place et ne retourne rien",
              "Retourne un nouveau tableau avec le résultat de fn appliqué à chaque élément",
              "Supprime les éléments qui ne satisfont pas fn",
              "Trie le tableau",
            ],
            correctIndex: 1,
            explanation:
              "`map` transforme chaque élément et retourne un nouveau tableau — le tableau original n'est jamais modifié (contrairement à des méthodes comme `sort` ou `splice`).",
          },
        ],
      },
    ],
  },
  {
    key: "cyber-fundamentals",
    title: "Cybersecurity Fundamentals",
    description:
      "Les bases pour ne plus faire confiance aveuglément : menaces courantes, mots de passe, réseaux.",
    category: "CYBERSECURITY",
    skillKey: "cyber-fundamentals",
    level: 1,
    lessons: [
      {
        order: 1,
        title: "Comprendre les menaces",
        content:
          "La règle d'or de la cybersécurité : **ne fais jamais confiance aveuglément, vérifie**. La majorité des attaques ne visent pas une faille technique, mais la confiance humaine.\n\n" +
          "Le **phishing** consiste à se faire passer pour une entité de confiance (banque, support technique, collègue) pour pousser la victime à révéler des informations sensibles ou exécuter une action dangereuse. L'**ingénierie sociale** (social engineering) est le terme plus large : manipuler une personne plutôt qu'une machine.\n\n" +
          "Le signal d'alerte le plus fiable n'est presque jamais le design du message (les faux messages sont souvent très soignés), mais un **sentiment d'urgence artificiel** : « fais-le maintenant, sinon... ». Une vraie urgence légitime laisse presque toujours le temps de vérifier.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Qu'est-ce que le phishing ?",
            choices: [
              "Un outil de chiffrement de données",
              "Une technique visant à tromper une personne pour lui voler des informations sensibles en se faisant passer pour une entité de confiance",
              "Un type de pare-feu",
              "Un protocole réseau",
            ],
            correctIndex: 1,
            explanation:
              "Le phishing exploite la confiance, pas une faille technique — d'où l'importance de vérifier l'expéditeur avant d'agir.",
          },
          {
            order: 2,
            prompt: "Quel est le signal d'alerte le plus courant d'une tentative de phishing ?",
            choices: [
              "Un design de message très soigné",
              "Un sentiment d'urgence artificiel poussant à agir vite sans réfléchir",
              "Une adresse email très longue",
              "Un message envoyé le matin",
            ],
            correctIndex: 1,
            explanation:
              "L'urgence artificielle (« sinon ton compte sera supprimé ») est conçue pour court-circuiter ta réflexion — c'est le signal le plus fiable, bien plus que l'apparence du message.",
          },
        ],
      },
      {
        order: 2,
        title: "Mots de passe et hashing",
        content:
          "Un service sérieux ne stocke JAMAIS ton mot de passe en clair. Il stocke un **hash** : le résultat d'une fonction à sens unique (impossible à inverser mathématiquement) appliquée à ton mot de passe. Même si la base de données fuite, l'attaquant récupère des hashs, pas les mots de passe.\n\n" +
          "Un **sel** (salt) est une valeur aléatoire ajoutée avant le hashing, unique par utilisateur : elle empêche les attaques par table arc-en-ciel (rainbow tables — des hashs précalculés pour des mots de passe courants), puisque deux utilisateurs avec le même mot de passe auront des hashs différents.\n\n" +
          "Bonnes pratiques : un mot de passe unique par service (un gestionnaire de mots de passe aide énormément), et l'activation de l'authentification à deux facteurs (2FA/MFA) partout où c'est possible — un mot de passe volé ne suffit alors plus à se connecter.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt:
              "Pourquoi les mots de passe sont-ils stockés sous forme de hash plutôt qu'en clair ?",
            choices: [
              "Pour économiser de l'espace disque",
              "Parce que le hash est une fonction à sens unique : même en cas de fuite de la base, l'attaquant ne peut pas retrouver facilement le mot de passe original",
              "Parce que c'est plus rapide à vérifier qu'un mot de passe en clair",
              "Ce n'est pas vrai, ils sont toujours stockés en clair",
            ],
            correctIndex: 1,
            explanation:
              "Le hashing est mathématiquement à sens unique : on ne peut pas « dé-hasher » pour retrouver le mot de passe d'origine, seulement vérifier qu'un mot de passe donné produit le même hash.",
          },
          {
            order: 2,
            prompt: "À quoi sert un sel (salt) dans le hashing de mots de passe ?",
            choices: [
              "À accélérer la connexion",
              "À empêcher les attaques par table arc-en-ciel en rendant chaque hash unique même pour deux mots de passe identiques",
              "À chiffrer la base de données entière",
              "À compresser le mot de passe",
            ],
            correctIndex: 1,
            explanation:
              "Sans sel, deux comptes avec le même mot de passe auraient le même hash — un attaquant pourrait utiliser des tables précalculées. Le sel rend chaque hash unique.",
          },
        ],
      },
      {
        order: 3,
        title: "Réseaux et défenses de base",
        content:
          "Un **pare-feu (firewall)** filtre le trafic réseau entrant et sortant selon des règles définies (ex: bloquer tout sauf le port 443). C'est une barrière, pas une garantie absolue — il ne protège pas contre une attaque qui passe par un canal autorisé (ex: un site web légitime compromis).\n\n" +
          "Un **VPN** crée un tunnel chiffré entre ton appareil et un serveur intermédiaire : utile pour cacher ton trafic aux intermédiaires du réseau (ex: sur un Wi-Fi public non fiable), mais ce n'est ni un antivirus, ni une protection contre le phishing.\n\n" +
          "Le principe du **moindre privilège** (least privilege) s'applique aussi bien aux réseaux qu'aux comptes utilisateurs : n'accorder que les accès strictement nécessaires, jamais plus « au cas où ».",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Que fait un pare-feu (firewall) ?",
            choices: [
              "Il chiffre automatiquement tout le trafic",
              "Il filtre le trafic réseau entrant/sortant selon des règles définies, pour bloquer ce qui n'est pas autorisé",
              "Il accélère la connexion internet",
              "Il stocke les mots de passe",
            ],
            correctIndex: 1,
            explanation:
              "Un pare-feu applique des règles de filtrage — ce n'est pas un outil de chiffrement, et il ne protège pas contre tout (ex: phishing via un canal autorisé).",
          },
          {
            order: 2,
            prompt: "Quel est le principal avantage d'un VPN ?",
            choices: [
              "Il rend ton ordinateur plus rapide",
              "Il crée un tunnel chiffré entre ton appareil et un serveur, cachant ton trafic aux intermédiaires du réseau (ex: Wi-Fi public)",
              "Il empêche tous les virus",
              "Il remplace un antivirus",
            ],
            correctIndex: 1,
            explanation:
              "Un VPN protège la confidentialité de ton trafic réseau vis-à-vis des intermédiaires — il ne remplace ni un antivirus, ni la vigilance face au phishing.",
          },
        ],
      },
    ],
  },
  {
    key: "redteam-fundamentals",
    title: "Red Team Fundamentals",
    description:
      "La méthodologie offensive expliquée conceptuellement : reconnaissance, exploitation, reporting — uniquement en environnements autorisés.",
    category: "CYBERSECURITY",
    skillKey: "red-team-fundamentals",
    level: 2,
    prerequisiteCourseKeys: ["cyber-fundamentals"],
    lessons: [
      {
        order: 1,
        title: "La méthodologie Red Team",
        content:
          "⚠️ Tout ce qui suit ne s'applique **que** dans le cadre d'un test d'intrusion autorisé par écrit (pentest, bug bounty avec périmètre défini, CTF). Attaquer un système sans autorisation est illégal, point final.\n\n" +
          "La méthodologie Red Team suit généralement ces phases : **Reconnaissance** (collecter de l'information sur la cible), **Enumeration** (identifier précisément services/versions exposés), **Exploitation** (exploiter une vulnérabilité identifiée pour obtenir un accès), **Privilege Escalation** (passer d'un accès limité à des droits plus élevés), **Post-Exploitation** (maintenir l'accès, explorer le réseau interne), et enfin **Reporting** — l'étape la plus négligée mais souvent la plus utile pour le client : sans un rapport clair et actionnable, l'intrusion la plus réussie ne sert à rien.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Dans quel cadre les techniques Red Team peuvent-elles être utilisées légalement ?",
            choices: [
              "Sur n'importe quel système accessible depuis internet",
              "Uniquement avec une autorisation écrite explicite du propriétaire du système (pentest, bug bounty avec périmètre défini)",
              "Sur les systèmes de la concurrence",
              "Sans restriction si l'intention est bonne",
            ],
            correctIndex: 1,
            explanation:
              "Sans autorisation écrite et un périmètre clairement défini, ces techniques constituent une intrusion illégale — peu importe l'intention.",
          },
          {
            order: 2,
            prompt: "Quelle est souvent l'étape la plus négligée mais la plus utile pour le client ?",
            choices: ["La reconnaissance", "L'exploitation", "Le reporting", "La post-exploitation"],
            correctIndex: 2,
            explanation:
              "Un rapport clair et actionnable est ce qui permet au client de corriger réellement les failles trouvées — sans lui, le test n'a pas de valeur pratique.",
          },
        ],
      },
      {
        order: 2,
        title: "Reconnaissance et énumération",
        content:
          "La **reconnaissance passive** collecte de l'information sans interagir directement avec la cible (OSINT : recherches publiques, réseaux sociaux, enregistrements DNS publics, offres d'emploi qui révèlent la stack technique...). La **reconnaissance active** interagit avec la cible (scan de ports, requêtes DNS directes) et laisse des traces détectables.\n\n" +
          "L'**énumération** va plus loin que la reconnaissance : une fois qu'un service est identifié (ex: un serveur web), on cherche sa version précise, ses configurations, ses éventuelles pages ou endpoints non protégés. Plus l'énumération est précise, plus il devient facile de cibler une vulnérabilité connue pour cette version exacte plutôt que d'essayer au hasard.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Qu'est-ce qui distingue la reconnaissance passive de la reconnaissance active ?",
            choices: [
              "La passive est illégale, l'active est légale",
              "La passive ne laisse aucune trace détectable par la cible (recherches publiques), l'active interagit directement avec elle",
              "Il n'y a aucune différence",
              "La passive est toujours plus rapide",
            ],
            correctIndex: 1,
            explanation:
              "La reconnaissance passive (OSINT, recherches publiques) ne touche jamais directement la cible, contrairement à un scan de ports par exemple, qui est actif et détectable.",
          },
          {
            order: 2,
            prompt: "Pourquoi l'énumération précise (version exacte d'un service) est-elle utile à un attaquant ?",
            choices: [
              "Elle ne sert à rien de particulier",
              "Elle permet de cibler des vulnérabilités connues spécifiques à cette version plutôt que d'essayer au hasard",
              "Elle rend le scan plus lent",
              "Elle est uniquement utile pour la défense, jamais l'attaque",
            ],
            correctIndex: 1,
            explanation:
              "Connaître la version exacte permet de chercher des CVE (vulnérabilités connues) documentées pour cette version précise, bien plus efficace qu'une approche à l'aveugle.",
          },
        ],
      },
      {
        order: 3,
        title: "De l'exploitation au reporting",
        content:
          "L'**exploitation** consiste à utiliser une vulnérabilité identifiée pour obtenir un accès initial. La **privilege escalation** cherche ensuite à passer d'un accès limité (ex: utilisateur standard) à des droits plus élevés (ex: administrateur) — souvent via une mauvaise configuration plutôt qu'une faille sophistiquée (permissions trop larges, mot de passe administrateur réutilisé...).\n\n" +
          "La **post-exploitation** explore ce qui est accessible depuis l'accès obtenu (mouvement latéral vers d'autres machines, données sensibles accessibles), toujours dans le périmètre autorisé. Enfin, le **rapport** doit lister chaque vulnérabilité trouvée avec sa sévérité, la preuve de concept, et une recommandation de correction concrète — c'est ce livrable, pas l'exploit lui-même, qui a de la valeur pour le client.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "La privilege escalation exploite le plus souvent :",
            choices: [
              "Toujours une faille 0-day sophistiquée",
              "Souvent une mauvaise configuration (permissions trop larges, mot de passe réutilisé) plutôt qu'une faille complexe",
              "Une attaque physique sur le serveur",
              "Un problème matériel",
            ],
            correctIndex: 1,
            explanation:
              "Dans la pratique, la privilege escalation vient très souvent d'erreurs de configuration simples, pas d'exploits sophistiqués — d'où l'importance du principe du moindre privilège.",
          },
          {
            order: 2,
            prompt: "Qu'est-ce qui a le plus de valeur pour le client à l'issue d'un test d'intrusion ?",
            choices: [
              "L'exploit technique en lui-même",
              "Un rapport clair listant les failles, leur sévérité, et des recommandations de correction concrètes",
              "Le temps passé sur le test",
              "Le nombre de systèmes compromis",
            ],
            correctIndex: 1,
            explanation:
              "Un rapport actionnable est ce qui permet au client de corriger réellement les failles — c'est le vrai livrable d'un test d'intrusion, pas l'exploit.",
          },
        ],
      },
    ],
  },
  {
    key: "python-intro",
    title: "Introduction à Python",
    description: "Les bases de Python : variables, structures de contrôle et fonctions.",
    category: "DEVELOPMENT",
    skillKey: "python",
    level: 1,
    lessons: [
      {
        order: 1,
        title: "Variables et types",
        content:
          "Python n'exige pas de déclarer le type d'une variable : `age = 25` suffit (typage dynamique). Les types de base sont `int` (entiers), `float` (décimaux), `str` (texte), `bool` (`True`/`False`).\n\n" +
          "Contrairement à JavaScript ou C, Python utilise l'**indentation** (espaces en début de ligne) pour délimiter les blocs de code, pas des accolades `{ }`. Une indentation incohérente provoque une erreur (`IndentationError`), pas juste un problème de style.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Comment Python délimite-t-il un bloc de code (dans un `if`, une fonction...) ?",
            choices: [
              "Avec des accolades { }",
              "Avec des mots-clés begin/end",
              "Avec l'indentation (espaces en début de ligne)",
              "Avec des points-virgules",
            ],
            correctIndex: 2,
            explanation:
              "L'indentation n'est pas qu'une convention de style en Python : elle fait partie de la syntaxe et délimite réellement les blocs.",
          },
          {
            order: 2,
            prompt: "Que faut-il écrire pour déclarer une variable `age` valant 25 en Python ?",
            choices: ["int age = 25", "var age = 25", "age = 25", "let age: int = 25"],
            correctIndex: 2,
            explanation:
              "Pas de mot-clé de déclaration ni de type explicite requis : `age = 25` suffit, Python déduit le type dynamiquement.",
          },
        ],
      },
      {
        order: 2,
        title: "Structures de contrôle et fonctions",
        content:
          "Une condition : `if age >= 18:` suivi d'un bloc indenté (pas de parenthèses obligatoires autour de la condition). Une boucle sur une collection : `for item in liste:`. Une fonction se déclare avec `def` : `def addition(a, b):` suivi d'un bloc indenté contenant `return a + b`.\n\n" +
          "Pas de point-virgule en fin de ligne, et les commentaires commencent par `#` (pas `//`).",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Quel mot-clé déclare une fonction en Python ?",
            choices: ["function", "def", "func", "fn"],
            correctIndex: 1,
            explanation: "`def nom_fonction(paramètres):` suivi d'un bloc indenté.",
          },
          {
            order: 2,
            prompt: "Quelle syntaxe parcourt chaque élément d'une liste `liste` en Python ?",
            choices: [
              "for (item in liste)",
              "foreach item in liste",
              "for item in liste:",
              "for (let item of liste)",
            ],
            correctIndex: 2,
            explanation: "`for item in liste:` — pas de parenthèses, et un `:` avant le bloc indenté.",
          },
        ],
      },
    ],
  },
  {
    key: "typescript-for-js-devs",
    title: "TypeScript pour devs JavaScript",
    description: "Pourquoi et comment adopter TypeScript quand on connaît déjà JavaScript.",
    category: "DEVELOPMENT",
    skillKey: "typescript",
    level: 2,
    lessons: [
      {
        order: 1,
        title: "Pourquoi TypeScript ?",
        content:
          "TypeScript ajoute un système de types statiques par-dessus JavaScript : les erreurs de type (ex: appeler une méthode qui n'existe pas sur une variable) sont détectées **à la compilation**, avant même d'exécuter le code — pas seulement au runtime comme en JS pur.\n\n" +
          "Le code TypeScript (`.ts`) est **transpilé** vers du JavaScript classique (`.js`) avant d'être exécuté — les navigateurs et Node.js n'exécutent jamais directement du TypeScript. Le fichier `tsconfig.json` configure cette compilation (version JS cible, niveau de strictness, etc.).",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quand une erreur de type est-elle détectée avec TypeScript ?",
            choices: [
              "Uniquement au runtime, comme en JavaScript",
              "À la compilation, avant même d'exécuter le code",
              "Jamais, TypeScript ne vérifie pas les types",
              "Seulement si on active un plugin spécial",
            ],
            correctIndex: 1,
            explanation:
              "C'est tout l'intérêt du typage statique : une classe entière de bugs est détectée avant l'exécution, pas seulement quand le code passe par ce chemin précis.",
          },
          {
            order: 2,
            prompt: "Qu'exécutent réellement les navigateurs et Node.js ?",
            choices: [
              "Le code TypeScript directement",
              "Le code JavaScript obtenu après transpilation du TypeScript",
              "Un bytecode spécial",
              "Rien, TypeScript est juste de la documentation",
            ],
            correctIndex: 1,
            explanation:
              "TypeScript doit toujours être transpilé (compilé) vers du JavaScript classique avant exécution — le typage n'existe qu'au moment du développement.",
          },
        ],
      },
      {
        order: 2,
        title: "Types de base et interfaces",
        content:
          "On annote une variable avec `:` suivi du type : `let age: number = 25;`, `let nom: string = \"Alice\";`. Une **interface** décrit la forme d'un objet : `interface User { id: number; nom: string; email?: string; }` — le `?` rend une propriété optionnelle.\n\n" +
          "`type` et `interface` se ressemblent beaucoup pour décrire un objet ; `interface` est généralement préféré pour les objets/classes (extensible via `extends`), `type` est plus flexible pour des unions (`type Status = \"actif\" | \"inactif\"`).",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que signifie le `?` après une propriété dans une interface (ex: `email?: string`) ?",
            choices: [
              "La propriété est obligatoire",
              "La propriété est optionnelle",
              "La propriété est en lecture seule",
              "Ça n'a aucun effet",
            ],
            correctIndex: 1,
            explanation:
              "`email?: string` signifie que la propriété `email` peut être omise sur un objet respectant cette interface.",
          },
          {
            order: 2,
            prompt: "Quelle syntaxe annote correctement une variable `age` de type `number` ?",
            choices: ["let age<number> = 25;", "let age: number = 25;", "let number age = 25;", "let age = number(25);"],
            correctIndex: 1,
            explanation: "L'annotation de type se place après `:` : `let age: number = 25;`.",
          },
        ],
      },
    ],
  },
  {
    key: "docker-basics",
    title: "Docker Basics",
    description: "Construire une image et lancer un conteneur : les bases pratiques de Docker.",
    category: "CLOUD",
    skillKey: "docker",
    level: 2,
    lessons: [
      {
        order: 1,
        title: "Dockerfile et images",
        content:
          "Un `Dockerfile` décrit comment construire une image : `FROM node:20` (image de base), `COPY . .` (copier les fichiers du projet), `RUN npm install` (exécuter une commande pendant le build), `CMD [\"node\", \"index.js\"]` (commande lancée au démarrage du conteneur).\n\n" +
          "Chaque instruction du Dockerfile crée une **couche** (layer) mise en cache : si seule la dernière instruction change, Docker réutilise les couches précédentes sans les refaire — d'où l'intérêt de placer `COPY package.json` et `RUN npm install` **avant** de copier tout le reste du code, pour ne pas invalider ce cache à chaque changement de code source.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Quelle instruction Dockerfile exécute une commande PENDANT la construction de l'image ?",
            choices: ["CMD", "RUN", "FROM", "ENTRYPOINT"],
            correctIndex: 1,
            explanation:
              "`RUN` s'exécute au moment du build (ex: `npm install`). `CMD` définit la commande lancée au démarrage du conteneur, pas pendant le build.",
          },
          {
            order: 2,
            prompt:
              "Pourquoi copier `package.json` et faire `npm install` AVANT de copier tout le reste du code dans le Dockerfile ?",
            choices: [
              "Ça n'a aucune importance, l'ordre est arbitraire",
              "Pour profiter du cache de build : si seul le code change (pas les dépendances), npm install n'est pas refait",
              "C'est obligatoire, Docker refuse sinon",
              "Pour réduire la taille de l'image finale",
            ],
            correctIndex: 1,
            explanation:
              "Docker met en cache chaque couche : tant que package.json ne change pas, la couche npm install est réutilisée telle quelle, même si le code source change constamment.",
          },
        ],
      },
      {
        order: 2,
        title: "Conteneurs et volumes",
        content:
          "`docker run -p 3000:3000 mon-image` lance un conteneur et mappe le port 3000 du conteneur vers le port 3000 de la machine hôte. `docker ps` liste les conteneurs en cours d'exécution.\n\n" +
          "Un conteneur est **éphémère** par défaut : ses données disparaissent quand il est supprimé. Un **volume** (`docker run -v mes-donnees:/data ...`) persiste les données en dehors du cycle de vie du conteneur — indispensable pour une base de données par exemple, qui ne doit pas perdre son contenu à chaque redéploiement.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Que fait l'option `-p 3000:3000` sur `docker run` ?",
            choices: [
              "Elle limite le conteneur à 3000 Mo de RAM",
              "Elle mappe le port 3000 du conteneur vers le port 3000 de la machine hôte",
              "Elle lance 3000 conteneurs",
              "Elle définit un délai d'expiration de 3000 secondes",
            ],
            correctIndex: 1,
            explanation:
              "Le format est `-p <port-hôte>:<port-conteneur>` — sans ça, le service à l'intérieur du conteneur n'est pas accessible depuis l'extérieur.",
          },
          {
            order: 2,
            prompt: "À quoi sert un volume Docker ?",
            choices: [
              "À accélérer le démarrage du conteneur",
              "À persister des données en dehors du cycle de vie éphémère du conteneur",
              "À compresser l'image",
              "À isoler le réseau du conteneur",
            ],
            correctIndex: 1,
            explanation:
              "Sans volume, toutes les données écrites dans un conteneur disparaissent quand il est supprimé — un volume les fait survivre, essentiel pour une base de données par exemple.",
          },
        ],
      },
    ],
  },
  {
    key: "networking-fundamentals",
    title: "Networking Fundamentals",
    description:
      "Comment les appareils communiquent sur un réseau : adresses IP, DNS, ports et protocoles.",
    category: "NETWORKING",
    skillKey: "networking-fundamentals",
    level: 1,
    lessons: [
      {
        order: 1,
        title: "Comment les appareils communiquent",
        content:
          "Chaque appareil sur un réseau a une **adresse IP** (ex: 192.168.1.42) qui l'identifie, un peu comme une adresse postale. Les données ne voyagent pas en un seul bloc : elles sont découpées en **paquets**, chacun contenant un morceau de données plus l'adresse de destination, envoyés indépendamment et réassemblés à l'arrivée.\n\n" +
          "Un **switch** relie plusieurs appareils au sein d'un même réseau local. Un **routeur** relie des réseaux différents entre eux (par exemple ton réseau domestique à internet) — c'est lui qui décide par quel chemin envoyer chaque paquet vers sa destination.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Comment les données voyagent-elles sur un réseau IP ?",
            choices: [
              "En un seul bloc envoyé d'un coup",
              "Découpées en paquets indépendants, envoyés séparément puis réassemblés à l'arrivée",
              "Uniquement via des câbles physiques dédiés à chaque appareil",
              "Elles ne voyagent jamais, seuls les noms de domaine circulent",
            ],
            correctIndex: 1,
            explanation:
              "Le découpage en paquets permet à plusieurs communications de partager le même réseau efficacement, et de reprendre uniquement les morceaux perdus plutôt que tout renvoyer.",
          },
          {
            order: 2,
            prompt: "Quelle est la différence entre un switch et un routeur ?",
            choices: [
              "Aucune différence",
              "Un switch relie des appareils au sein d'un même réseau local, un routeur relie des réseaux différents entre eux",
              "Un routeur ne fonctionne qu'en Wi-Fi",
              "Un switch est toujours plus rapide qu'un routeur",
            ],
            correctIndex: 1,
            explanation:
              "Ton routeur domestique fait le pont entre ton réseau local (géré en partie par un switch intégré) et internet.",
          },
        ],
      },
      {
        order: 2,
        title: "DNS, ports et protocoles",
        content:
          "Le **DNS** traduit un nom de domaine (nodify.app) en adresse IP, parce que les humains retiennent mieux des noms que des suites de chiffres. Un **port** identifie un service précis sur une machine : le port 443 pour HTTPS, le port 22 pour SSH — une même adresse IP peut faire tourner plusieurs services simultanément, chacun sur son port.\n\n" +
          "**TCP** garantit une livraison fiable et ordonnée (utilisé pour charger une page web, où rien ne doit manquer) ; **UDP** privilégie la vitesse sans garantie de livraison (utilisé pour le streaming vidéo ou les jeux en ligne, où une donnée en retard ne vaut plus la peine d'être renvoyée).",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "À quoi sert le DNS ?",
            choices: [
              "Chiffrer le trafic réseau",
              "Traduire un nom de domaine lisible en adresse IP compréhensible par les machines",
              "Accélérer la connexion internet",
              "Attribuer des adresses IP automatiquement aux appareils",
            ],
            correctIndex: 1,
            explanation:
              "Sans DNS, il faudrait retenir l'adresse IP exacte de chaque site — le DNS fait cette traduction automatiquement et invisiblement.",
          },
          {
            order: 2,
            prompt: "Pourquoi UDP est-il préféré à TCP pour du streaming vidéo en direct ?",
            choices: [
              "UDP est plus sécurisé que TCP",
              "UDP privilégie la vitesse sans attendre la retransmission des paquets perdus, ce qui convient au temps réel",
              "TCP ne fonctionne pas du tout pour la vidéo",
              "UDP garantit une livraison à 100% des paquets",
            ],
            correctIndex: 1,
            explanation:
              "En streaming, une image légèrement perdue n'a plus d'intérêt à être renvoyée une fois le direct passé à l'image suivante — TCP ralentirait inutilement en insistant pour tout retransmettre.",
          },
        ],
      },
    ],
  },
  {
    key: "linux-fundamentals",
    title: "Linux Fundamentals",
    description:
      "Les bases pour naviguer, gérer des fichiers et comprendre les permissions sous Linux.",
    category: "SYSTEMS",
    skillKey: "linux",
    level: 1,
    lessons: [
      {
        order: 1,
        title: "Naviguer et gérer des fichiers",
        content:
          "`pwd` affiche le répertoire courant, `ls` liste son contenu, `cd dossier` y entre. Pour créer/copier/déplacer/supprimer : `mkdir nom` (créer un dossier), `cp source destination` (copier), `mv source destination` (déplacer ou renommer), `rm fichier` (supprimer — irréversible, pas de corbeille par défaut en ligne de commande).\n\n" +
          "`cat fichier` affiche le contenu d'un fichier texte directement dans le terminal. La plupart de ces commandes acceptent des chemins relatifs (`./dossier`, par rapport à où tu es) ou absolus (`/home/user/dossier`, depuis la racine du système).",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Quelle commande affiche le répertoire dans lequel tu te trouves actuellement ?",
            choices: ["ls", "cd", "pwd", "cat"],
            correctIndex: 2,
            explanation: "`pwd` (print working directory) affiche le chemin complet du répertoire courant.",
          },
          {
            order: 2,
            prompt: "Que fait la commande `rm fichier.txt` ?",
            choices: [
              "Renomme le fichier",
              "Supprime le fichier — sans corbeille par défaut, donc irréversible",
              "Le déplace dans un dossier de sauvegarde",
              "Affiche son contenu",
            ],
            correctIndex: 1,
            explanation:
              "Contrairement à une suppression dans une interface graphique, `rm` en ligne de commande ne passe généralement pas par une corbeille — vérifie bien avant de valider.",
          },
        ],
      },
      {
        order: 2,
        title: "Permissions et processus",
        content:
          "Chaque fichier a des permissions pour trois catégories : le propriétaire, le groupe, les autres — chacune pouvant lire (r), écrire (w), exécuter (x). `chmod` modifie ces permissions, `chown` change le propriétaire.\n\n" +
          "`ps` liste les processus en cours (souvent combiné à `aux` pour tout voir), `top` affiche un tableau de bord en temps réel (CPU, mémoire par processus). Ajouter `&` à la fin d'une commande la lance en arrière-plan, libérant immédiatement le terminal pour autre chose.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Quelle commande change les permissions d'un fichier sous Linux ?",
            choices: ["chown", "chmod", "ps", "top"],
            correctIndex: 1,
            explanation: "`chmod 755 script.sh` par exemple rend le fichier exécutable pour son propriétaire et lisible/exécutable pour les autres.",
          },
          {
            order: 2,
            prompt: "Quelle commande affiche un tableau de bord des processus en temps réel ?",
            choices: ["ls", "top", "cd", "mv"],
            correctIndex: 1,
            explanation: "`top` se met à jour en continu et montre l'utilisation CPU/mémoire de chaque processus — utile pour repérer ce qui ralentit une machine.",
          },
        ],
      },
    ],
  },
  {
    key: "ai-fundamentals",
    title: "AI Fundamentals",
    description:
      "Les bases pour comprendre comment fonctionnent les IA modernes, leurs capacités et leurs limites réelles.",
    category: "AI",
    skillKey: "ai-fundamentals",
    level: 1,
    lessons: [
      {
        order: 1,
        title: "Qu'est-ce que l'intelligence artificielle ?",
        content:
          "L'IA est le domaine large qui vise à faire réaliser à des machines des tâches associées à l'intelligence humaine. Le **Machine Learning** (apprentissage automatique) en est une approche : plutôt que de programmer explicitement chaque règle, on entraîne un modèle à partir d'exemples (données).\n\n" +
          "En **apprentissage supervisé**, le modèle apprend à partir de données déjà étiquetées avec la bonne réponse (ex: des milliers de photos déjà marquées \"chat\" ou \"pas chat\"). Le **deep learning** utilise des réseaux de neurones à de nombreuses couches, particulièrement efficaces sur des données complexes (images, texte, son).",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Quelle est la relation entre IA, Machine Learning et Deep Learning ?",
            choices: [
              "Ce sont trois synonymes stricts",
              "Le Machine Learning est une approche de l'IA ; le Deep Learning est une famille de techniques de Machine Learning basée sur des réseaux de neurones profonds",
              "Le Deep Learning englobe l'IA et le Machine Learning",
              "Aucun rapport entre les trois",
            ],
            correctIndex: 1,
            explanation:
              "IA (le domaine large) ⊃ Machine Learning (apprentissage à partir de données) ⊃ Deep Learning (réseaux de neurones profonds) — des cercles concentriques, pas des synonymes.",
          },
          {
            order: 2,
            prompt: "Qu'est-ce que l'apprentissage supervisé ?",
            choices: [
              "Le modèle apprend sans aucune donnée",
              "Le modèle apprend à partir de données déjà étiquetées avec la bonne réponse connue",
              "Un synonyme strict de deep learning",
              "Le modèle apprend en jouant contre lui-même uniquement",
            ],
            correctIndex: 1,
            explanation:
              "C'est l'approche la plus courante pour des tâches comme la classification d'images ou la détection de spam, où l'on dispose d'exemples déjà correctement étiquetés.",
          },
        ],
      },
      {
        order: 2,
        title: "Comprendre les LLM et leurs limites",
        content:
          "Un **LLM** (Large Language Model) est entraîné sur d'énormes volumes de texte pour prédire la suite la plus probable d'une phrase — ce qui lui permet de générer des réponses cohérentes, résumer, traduire ou écrire du code. Il ne \"comprend\" pas au sens humain : il génère statistiquement, ce qui explique aussi ses **hallucinations** (affirmer un fait faux avec assurance).\n\n" +
          "Le **RAG** (Retrieval-Augmented Generation) réduit ce risque en donnant au modèle accès à de vrais documents avant qu'il ne réponde, plutôt que de compter uniquement sur sa mémoire d'entraînement. La façon de formuler une question (**prompt engineering**) influence aussi beaucoup la qualité de la réponse obtenue.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi un LLM peut-il 'halluciner' (inventer un fait faux avec assurance) ?",
            choices: [
              "C'est un bug qui n'arrive jamais en pratique",
              "Il génère le texte statistiquement le plus probable, sans vérifier les faits contre une base de connaissances fiable",
              "Uniquement quand on lui pose des questions en anglais",
              "Parce qu'il est volontairement programmé pour mentir"
            ],
            correctIndex: 1,
            explanation:
              "D'où l'importance de toujours vérifier une information critique donnée par une IA, surtout si elle n'est pas ancrée dans des sources vérifiables (voir RAG).",
          },
          {
            order: 2,
            prompt: "Comment le RAG réduit-il le risque d'hallucination ?",
            choices: [
              "En rendant le modèle plus lent, ce qui le rend plus prudent",
              "En donnant au modèle accès à de vrais documents pertinents avant qu'il ne rédige sa réponse",
              "En supprimant totalement la mémoire du modèle",
              "Le RAG n'a aucun effet sur les hallucinations",
            ],
            correctIndex: 1,
            explanation:
              "En s'appuyant sur des extraits de documents réels fournis en contexte, le modèle a moins besoin d'inventer — c'est ce que Nodify utilise pour `/docs`.",
          },
        ],
      },
    ],
  },
  {
    key: "devops-cicd",
    title: "DevOps & CI/CD Fundamentals",
    description:
      "Comprendre pourquoi et comment automatiser la construction, les tests et le déploiement d'une application — les bases du DevOps et de l'Infrastructure as Code.",
    category: "CLOUD",
    skillKey: "cicd",
    level: 2,
    lessons: [
      {
        order: 1,
        title: "Qu'est-ce que le CI/CD ?",
        content:
          "Le CI/CD (Continuous Integration / Continuous Deployment) est une pratique qui automatise ce qu'un développeur ferait manuellement avant de livrer du code : compiler, lancer les tests, et déployer.\n\n" +
          "**Intégration continue (CI)** : à chaque changement de code poussé sur le dépôt, une machine (pas un humain) reconstruit le projet et lance automatiquement les tests. Ça détecte immédiatement une régression, au lieu de la découvrir des jours plus tard mélangée avec dix autres changements.\n\n" +
          "**Déploiement continu (CD)** : une fois les tests passés, le code est automatiquement déployé (parfois avec une validation manuelle avant la mise en production — on parle alors de « delivery » continue plutôt que de « deployment » continu au sens strict).\n\n" +
          "L'objectif n'est pas la vitesse pour la vitesse : c'est de réduire le risque humain (oublier une étape, déployer la mauvaise version) en rendant le processus répétable et vérifiable.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Que vérifie principalement l'intégration continue (CI) ?",
            choices: [
              "Que le design visuel est cohérent",
              "Que le code se construit et passe les tests automatiquement à chaque changement",
              "Que le serveur de production a assez de mémoire disponible",
              "Que les commits ont un message bien formulé",
            ],
            correctIndex: 1,
            explanation:
              "La CI reconstruit le projet et lance les tests automatiquement à chaque changement poussé — elle détecte les régressions immédiatement plutôt qu'après coup.",
          },
          {
            order: 2,
            prompt: "Quelle est la différence entre « continuous delivery » et « continuous deployment » ?",
            choices: [
              "Ce sont des synonymes stricts, aucune différence",
              "Delivery déploie automatiquement en prod ; deployment nécessite toujours une validation manuelle",
              "Deployment déploie automatiquement en prod après les tests ; delivery garde une validation manuelle avant la mise en production",
              "Delivery ne concerne que les tests, deployment que la compilation",
            ],
            correctIndex: 2,
            explanation:
              "Le « continuous deployment » va jusqu'en production sans intervention humaine après les tests ; le « continuous delivery » prépare tout automatiquement mais garde une validation manuelle avant la mise en prod.",
          },
        ],
      },
      {
        order: 2,
        title: "Anatomie d'un pipeline",
        content:
          "Un pipeline CI/CD s'organise en étapes (stages) successives, chacune devant réussir pour que la suivante se lance :\n\n" +
          "1. **Build** : compiler/assembler le code (installer les dépendances, transpiler du TypeScript, construire une image Docker...).\n" +
          "2. **Test** : lancer les tests automatisés (unitaires, puis souvent d'intégration). Si un test échoue, le pipeline s'arrête — le code cassé n'avance pas plus loin.\n" +
          "3. **Deploy** : publier le résultat vers un environnement (staging d'abord, souvent, avant la production).\n\n" +
          "Chaque étape produit ou consomme des **artefacts** (le paquet compilé, l'image Docker construite) qui passent d'une étape à l'autre sans être reconstruits inutilement. Un même artefact validé en staging est idéalement celui déployé en production — pas une reconstruction séparée qui pourrait introduire une différence.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que se passe-t-il typiquement si l'étape « test » d'un pipeline échoue ?",
            choices: [
              "Le pipeline continue quand même vers le déploiement",
              "Le pipeline s'arrête, le code n'est pas déployé",
              "Seuls les tests échoués sont ignorés silencieusement",
              "Le pipeline redémarre automatiquement en boucle",
            ],
            correctIndex: 1,
            explanation:
              "Un échec de test arrête le pipeline — c'est tout l'intérêt : empêcher qu'un code cassé n'avance jusqu'au déploiement.",
          },
          {
            order: 2,
            prompt: "Pourquoi préfère-t-on déployer le MÊME artefact validé en staging plutôt que d'en reconstruire un nouveau pour la production ?",
            choices: [
              "Pour économiser de l'espace disque uniquement",
              "Parce que reconstruire pourrait produire un résultat légèrement différent de ce qui a été réellement testé",
              "Ça n'a aucune importance en pratique",
              "Parce que Docker l'exige techniquement",
            ],
            correctIndex: 1,
            explanation:
              "Reconstruire séparément risquerait d'introduire une différence (version de dépendance, horodatage...) entre ce qui a été testé et ce qui est réellement déployé — on veut déployer exactement ce qui a été validé.",
          },
        ],
      },
      {
        order: 3,
        title: "Infrastructure as Code et bonnes pratiques",
        content:
          "Automatiser le code (CI/CD) ne suffit pas si l'infrastructure qui l'héberge (serveurs, réseaux) est encore configurée à la main, cliquée dans une console — c'est là qu'intervient l'**Infrastructure as Code (IaC)**, avec des outils comme Terraform : décrire l'infrastructure voulue dans des fichiers versionnés, pas dans la mémoire de la personne qui l'a configurée.\n\n" +
          "Quelques principes qui reviennent partout en DevOps :\n" +
          "- **Idempotence** : relancer la même opération plusieurs fois doit produire le même résultat, sans effet de bord cumulé.\n" +
          "- **Rollback** : pouvoir revenir rapidement à la version précédente si un déploiement pose problème, plutôt que de corriger en urgence en production.\n" +
          "- **Environnements identiques** : staging doit ressembler le plus possible à la production, sinon « ça marchait en staging » ne veut plus dire grand-chose.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que signifie « idempotence » appliquée à un déploiement ?",
            choices: [
              "Le déploiement ne peut être lancé qu'une seule fois dans toute l'histoire du projet",
              "Relancer plusieurs fois la même opération produit le même résultat final, sans effet cumulé",
              "Le déploiement doit toujours prendre exactement le même temps",
              "Chaque déploiement doit changer le nom du serveur",
            ],
            correctIndex: 1,
            explanation:
              "Une opération idempotente donne le même résultat qu'on l'exécute une fois ou dix fois — essentiel pour pouvoir relancer un déploiement sans crainte après un échec partiel.",
          },
          {
            order: 2,
            prompt: "Pourquoi une stratégie de rollback est-elle importante en DevOps ?",
            choices: [
              "Elle n'a aucune utilité si les tests sont bons",
              "Elle permet de revenir rapidement à une version stable si un déploiement pose problème, plutôt que de corriger en urgence en production",
              "Elle remplace complètement le besoin de tests",
              "Elle ne concerne que les bases de données",
            ],
            correctIndex: 1,
            explanation:
              "Même avec des tests solides, un problème peut apparaître seulement en production — un rollback rapide limite les dégâts le temps de diagnostiquer, plutôt que de tenter une correction en urgence sur le système en cours d'utilisation.",
          },
        ],
      },
    ],
  },
  {
    key: "prompt-engineering",
    title: "Prompt Engineering",
    description:
      "Écrire des prompts efficaces pour obtenir de meilleures réponses d'un modèle de langage — et comprendre les limites à connaître avant de s'y fier.",
    category: "AI",
    skillKey: "prompt-engineering",
    level: 2,
    prerequisiteCourseKeys: ["ai-fundamentals"],
    lessons: [
      {
        order: 1,
        title: "Anatomie d'un bon prompt",
        content:
          "Un prompt efficace précise généralement quatre choses, explicitement plutôt que de les laisser deviner au modèle :\n\n" +
          "1. **Le rôle** : qui le modèle doit incarner (« Tu es un relecteur de code senior... »).\n" +
          "2. **Le contexte** : les informations nécessaires pour répondre correctement (le code concerné, la contrainte, le public visé).\n" +
          "3. **L'instruction** : ce qu'on attend précisément, pas une question vague.\n" +
          "4. **Le format** : comment la réponse doit être structurée (liste à puces, JSON, longueur maximale...).\n\n" +
          "« Explique-moi Docker » est vague et laisse le modèle deviner le niveau attendu et la longueur voulue. « Explique Docker en 3 phrases à un développeur qui connaît déjà les machines virtuelles » est précis — la réponse sera plus utile du premier coup, sans aller-retour.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi préciser explicitement le format attendu dans un prompt ?",
            choices: [
              "Ça n'a aucun effet sur la réponse générée",
              "Ça évite au modèle de deviner une structure et augmente les chances d'obtenir une réponse directement utilisable",
              "C'est obligatoire techniquement, sinon le modèle refuse de répondre",
              "Ça ralentit toujours la génération de la réponse",
            ],
            correctIndex: 1,
            explanation:
              "Sans format précisé, le modèle choisit une structure par défaut qui peut ne pas correspondre à l'usage prévu — l'expliciter réduit les allers-retours.",
          },
          {
            order: 2,
            prompt: "Quel est le problème principal d'un prompt comme « explique-moi Docker » sans autre précision ?",
            choices: [
              "Le modèle ne connaît pas Docker",
              "Il ne précise ni le niveau attendu, ni la longueur, ni le format — la réponse risque de ne pas correspondre au besoin réel",
              "Docker est un sujet trop récent pour être expliqué",
              "Il n'y a aucun problème, ce prompt est déjà optimal",
            ],
            correctIndex: 1,
            explanation:
              "Un prompt vague laisse le modèle deviner le contexte réel — plus on précise le niveau, le format et l'objectif, plus la première réponse a de chances d'être directement utile.",
          },
        ],
      },
      {
        order: 2,
        title: "Techniques avancées",
        content:
          "Quelques techniques qui améliorent nettement la qualité des réponses sur des tâches complexes :\n\n" +
          "- **Few-shot prompting** : donner 1 à quelques exemples du résultat attendu avant de poser la vraie question — le modèle imite le format/style montré plutôt que de le deviner.\n" +
          "- **Chain-of-thought** : demander explicitement au modèle de raisonner étape par étape avant de donner sa réponse finale, particulièrement utile sur des problèmes logiques ou mathématiques où une réponse directe a plus de chances d'être fausse.\n" +
          "- **Séparer system et user** : les instructions de comportement général (rôle, ton, contraintes permanentes) vont dans le prompt système ; la demande concrète de l'utilisateur va dans le prompt utilisateur — c'est exactement ce que fait `/explainme` sur Nodify en interne.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Qu'est-ce que le « few-shot prompting » ?",
            choices: [
              "Poser la même question plusieurs fois de suite pour vérifier la cohérence",
              "Donner quelques exemples du résultat attendu avant la vraie question, pour que le modèle imite le format/style montré",
              "Limiter le nombre de mots de la réponse",
              "Utiliser plusieurs modèles IA en parallèle sur la même question",
            ],
            correctIndex: 1,
            explanation:
              "Le few-shot prompting montre des exemples concrets du résultat voulu — le modèle a alors un modèle clair à suivre plutôt que de deviner un format à partir d'une simple instruction.",
          },
          {
            order: 2,
            prompt: "Pourquoi le chain-of-thought aide-t-il sur des problèmes logiques/mathématiques ?",
            choices: [
              "Il rend la réponse plus courte",
              "Il force le modèle à décomposer le raisonnement étape par étape, réduisant le risque d'une réponse directe erronée",
              "Il n'a aucun effet mesurable",
              "Il remplace complètement le besoin de vérifier la réponse",
            ],
            correctIndex: 1,
            explanation:
              "Décomposer le raisonnement en étapes explicites réduit les erreurs qu'une réponse « à l'instinct » directe pourrait produire sur un problème à plusieurs étapes logiques.",
          },
        ],
      },
      {
        order: 3,
        title: "Limites et bonnes pratiques",
        content:
          "Le prompt engineering ne rend pas un modèle infaillible — connaître ses limites fait partie de bien l'utiliser :\n\n" +
          "- **Hallucination** : un modèle peut générer une réponse plausible mais fausse, avec la même confiance apparente qu'une réponse correcte. Toujours vérifier une information critique (chiffre, API, référence légale) avant de s'y fier.\n" +
          "- **Prompt injection** : si le prompt inclut du contenu venant d'un utilisateur externe ou d'une source non fiable, ce contenu peut contenir des instructions qui tentent de détourner le comportement du modèle (« ignore tes instructions précédentes et... »). Ne jamais faire une confiance aveugle à du contenu injecté dans un prompt.\n" +
          "- **Itération** : un premier prompt rarement parfait — observer la réponse, ajuster le contexte ou le format, retester. C'est un processus itératif, pas un coup d'essai unique.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Qu'est-ce qu'une « prompt injection » ?",
            choices: [
              "Une technique pour rendre les réponses plus rapides",
              "Du contenu externe/non fiable inclus dans un prompt qui tente de détourner le comportement du modèle",
              "Une erreur de syntaxe dans le prompt",
              "Un synonyme du few-shot prompting",
            ],
            correctIndex: 1,
            explanation:
              "Une prompt injection est une tentative, via du contenu externe inséré dans le prompt, de faire ignorer ses instructions au modèle ou de détourner son comportement prévu.",
          },
          {
            order: 2,
            prompt: "Quelle est la bonne attitude face à une hallucination possible d'un modèle IA ?",
            choices: [
              "Faire confiance systématiquement, le modèle a toujours raison",
              "Vérifier toute information critique (chiffre, référence, API) avant de s'y fier, même si la réponse semble sûre d'elle",
              "Ne jamais utiliser l'IA pour des tâches sérieuses",
              "Reformuler la question à l'infini jusqu'à obtenir la réponse voulue",
            ],
            correctIndex: 1,
            explanation:
              "Un modèle peut halluciner avec une confiance apparente identique à une réponse correcte — la seule protection fiable est de vérifier soi-même les informations critiques avant de s'y fier.",
          },
        ],
      },
    ],
  },
];

/**
 * Corpus documentaire (Phase 6) — extraits rédigés à la main, pas copiés
 * depuis les sites sources. Retrieval par mots-clés (voir docsService.ts),
 * pas d'embeddings (Anthropic n'expose pas d'API d'embeddings publique).
 */
interface DocChunkSeed {
  source: string;
  title: string;
  url: string;
  content: string;
}

const DOC_CHUNKS: DocChunkSeed[] = [
  {
    source: "Node.js",
    title: "require vs import",
    url: "https://nodejs.org/api/esm.html",
    content:
      "require() (CommonJS) est synchrone et historique ; import (ESM, ECMAScript Modules) est la syntaxe standard moderne, asynchrone au chargement. Pour utiliser import/export dans un projet Node, ajoute `\"type\": \"module\"` dans package.json (ou utilise l'extension .mjs). Mélanger les deux dans le même fichier ne fonctionne pas : un module ESM ne peut pas utiliser require() directement (il existe des contournements comme createRequire, mais mieux vaut rester cohérent sur un seul système par projet).",
  },
  {
    source: "Node.js",
    title: "Gérer les erreurs asynchrones non catchées",
    url: "https://nodejs.org/api/process.html#event-unhandledrejection",
    content:
      "Une Promise rejetée sans .catch() ni try/catch autour d'un await déclenche l'event 'unhandledRejection' sur process, plutôt qu'un try/catch classique qui ne l'attrape pas. En production, il faut écouter cet event pour logger l'erreur (voir src/index.ts de Nodify) — sans ça, l'erreur est silencieuse ou fait planter le process selon la version de Node.",
  },
  {
    source: "Node.js",
    title: "Streams pour les gros fichiers",
    url: "https://nodejs.org/api/stream.html",
    content:
      "fs.readFileSync() charge un fichier entier en mémoire avant de continuer — problématique sur un gros fichier (RAM, latence). Un stream (fs.createReadStream) traite les données par petits morceaux (chunks) au fur et à mesure qu'ils arrivent, avec un mécanisme de backpressure qui ralentit automatiquement la lecture si le consommateur est plus lent que la source. À privilégier pour tout fichier dont la taille n'est pas garantie petite.",
  },
  {
    source: "Discord.js",
    title: "Quels Gateway Intents activer",
    url: "https://discordjs.guide/popular-topics/intents.html",
    content:
      "Les Gateway Intents déterminent quels events Discord envoie à ton bot. N'active que ceux dont tu as réellement besoin (ex: Nodify n'active que GatewayIntentBits.Guilds en Phase 1) : moins d'intents = moins de trafic réseau et de charge mémoire côté client. Certains intents sont \"privilégiés\" (ex: MessageContent, GuildMembers) et doivent être activés manuellement dans le Discord Developer Portal en plus d'être déclarés dans le code, sinon la connexion échoue.",
  },
  {
    source: "Discord.js",
    title: "Différer une réponse longue (deferReply)",
    url: "https://discordjs.guide/slash-commands/response-methods.html",
    content:
      "Discord invalide une interaction si elle ne reçoit pas de réponse dans les 3 secondes. Si une commande doit faire un traitement plus long (appel IA, requête DB lourde...), il faut appeler interaction.deferReply() immédiatement (ça affiche \"Nodify réfléchit...\" et donne 15 minutes de plus), puis interaction.editReply() une fois le résultat prêt — c'est ce que font /explainme et /securityreview dans Nodify.",
  },
  {
    source: "Discord.js",
    title: "Limites des Embeds Discord",
    url: "https://discordjs.guide/popular-topics/embeds.html",
    content:
      "Un embed Discord a des limites strictes : 256 caractères pour le titre, 4096 pour la description, 25 fields maximum, 1024 caractères par valeur de field, et 6000 caractères au total pour tout l'embed cumulé. Dépasser une limite fait échouer l'envoi avec une erreur — il faut tronquer ou paginer le contenu généré dynamiquement (ex: une réponse IA très longue) avant de construire l'embed.",
  },
  {
    source: "PostgreSQL",
    title: "Quand ajouter un index",
    url: "https://www.postgresql.org/docs/current/indexes.html",
    content:
      "Un index (B-tree par défaut) accélère les recherches sur une colonne utilisée dans une clause WHERE, JOIN ou ORDER BY, en évitant un scan complet de la table. Mais un index n'est pas gratuit : chaque écriture (INSERT/UPDATE/DELETE) doit aussi mettre à jour tous les index de la table, donc indexer une colonne rarement filtrée ralentit les écritures pour un gain de lecture qui n'arrivera jamais. Prisma crée automatiquement un index sur les clés uniques et les clés étrangères.",
  },
  {
    source: "PostgreSQL",
    title: "Lire un plan avec EXPLAIN ANALYZE",
    url: "https://www.postgresql.org/docs/current/using-explain.html",
    content:
      "EXPLAIN ANALYZE <requête> exécute réellement la requête et affiche le plan choisi par l'optimiseur ainsi que le temps réel de chaque étape. Un \"Seq Scan\" (scan séquentiel) sur une grosse table dans les lignes coûteuses du plan indique souvent qu'un index manquant permettrait un \"Index Scan\" bien plus rapide. C'est l'outil de diagnostic de référence avant d'ajouter un index au hasard.",
  },
  {
    source: "OWASP",
    title: "Qu'est-ce que le Top 10",
    url: "https://owasp.org/www-project-top-ten/",
    content:
      "L'OWASP Top 10 liste les 10 catégories de risques de sécurité web jugées les plus critiques par la communauté, mise à jour tous les quelques années (dernière édition stable : 2021). Ce n'est ni une checklist exhaustive ni une certification — c'est un point de départ pour prioriser les risques les plus courants et les plus impactants en premier, pas une garantie de sécurité totale si tous les points sont cochés.",
  },
  {
    source: "OWASP",
    title: "Broken Access Control (A01:2021)",
    url: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
    content:
      "Broken Access Control est la catégorie n°1 du Top 10 2021 : un utilisateur peut accéder à des ressources ou actions au-delà de ses permissions prévues. Exemple classique : IDOR (Insecure Direct Object Reference) — changer l'ID dans /api/orders/1234 en /api/orders/1235 et accéder à la commande de quelqu'un d'autre parce que le serveur ne revérifie pas que la ressource appartient bien à l'utilisateur authentifié. La défense fiable est de toujours revérifier les permissions côté serveur à chaque requête, jamais seulement côté client.",
  },
];

/**
 * Question du jour — catalogue statique rédigé à la main (pas de génération
 * IA à la volée, pour éviter une question factuellement fausse). Postée
 * automatiquement dans le salon hub (voir src/community/dailyQuestionService.ts).
 */
interface DailyQuestionSeed {
  key: string;
  category: SkillCategory;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

const DAILY_QUESTIONS: DailyQuestionSeed[] = [
  {
    key: "typeof-null",
    category: "DEVELOPMENT",
    prompt: "En JavaScript, que retourne `typeof null` ?",
    choices: ["\"null\"", "\"undefined\"", "\"object\"", "\"number\""],
    correctIndex: 2,
    explanation:
      "C'est un bug historique du langage conservé pour la compatibilité : `typeof null` retourne `\"object\"`, alors que `null` n'est pas un objet.",
  },
  {
    key: "git-reset-soft",
    category: "DEVELOPMENT",
    prompt:
      "Quelle commande Git annule le dernier commit tout en gardant les modifications indexées (prêtes à recommit) ?",
    choices: [
      "git reset --hard HEAD~1",
      "git reset --soft HEAD~1",
      "git revert HEAD",
      "git checkout HEAD~1",
    ],
    correctIndex: 1,
    explanation:
      "`--soft` déplace juste le pointeur de branche, en gardant les changements dans la zone d'index (stagés). `--hard` les supprimerait complètement, `--mixed` (par défaut) les garderait mais désindexés.",
  },
  {
    key: "https-port",
    category: "NETWORKING",
    prompt: "Quel port HTTPS utilise-t-il par défaut ?",
    choices: ["21", "80", "443", "8080"],
    correctIndex: 2,
    explanation: "HTTPS utilise le port 443 par défaut ; HTTP (non chiffré) utilise le port 80.",
  },
  {
    key: "dns-acronym",
    category: "NETWORKING",
    prompt: "Que signifie l'acronyme DNS ?",
    choices: [
      "Dynamic Network Service",
      "Domain Name System",
      "Data Node Server",
      "Digital Naming Standard",
    ],
    correctIndex: 1,
    explanation: "DNS = Domain Name System, le service qui traduit les noms de domaine en IP.",
  },
  {
    key: "llm-acronym",
    category: "AI",
    prompt: "Que signifie l'acronyme LLM ?",
    choices: [
      "Large Language Model",
      "Long Learning Machine",
      "Linear Logic Model",
      "Local Language Module",
    ],
    correctIndex: 0,
    explanation: "LLM = Large Language Model, un modèle de langage entraîné sur d'énormes volumes de texte.",
  },
  {
    key: "linux-top",
    category: "SYSTEMS",
    prompt:
      "Sous Linux, quelle commande affiche les processus en cours d'exécution en temps réel ?",
    choices: ["ls", "top", "cat", "chmod"],
    correctIndex: 1,
    explanation:
      "`top` affiche un tableau de bord des processus en temps réel (CPU, mémoire...). `ls` liste des fichiers, `chmod` change des permissions.",
  },
  {
    key: "sql-having",
    category: "DEVELOPMENT",
    prompt: "En SQL, quelle clause filtre les résultats APRÈS un GROUP BY ?",
    choices: ["WHERE", "HAVING", "FILTER", "ORDER BY"],
    correctIndex: 1,
    explanation:
      "WHERE filtre les lignes AVANT le regroupement ; HAVING filtre les groupes APRÈS le GROUP BY (ex: HAVING COUNT(*) > 5).",
  },
  {
    key: "mitm-attack",
    category: "CYBERSECURITY",
    prompt:
      "Quel type d'attaque consiste à intercepter les communications entre deux parties sans qu'elles le sachent ?",
    choices: ["DDoS", "Man-in-the-Middle", "Brute force", "Cross-Site Scripting"],
    correctIndex: 1,
    explanation:
      "Le Man-in-the-Middle (MITM) place l'attaquant entre les deux parties, capable de lire voire modifier les échanges à leur insu.",
  },
  {
    key: "docker-ps",
    category: "CLOUD",
    prompt: "Quelle commande Docker liste les conteneurs en cours d'exécution ?",
    choices: ["docker images", "docker ps", "docker run", "docker build"],
    correctIndex: 1,
    explanation:
      "`docker ps` liste les conteneurs actifs. `docker images` liste les images, `docker run` en lance un nouveau, `docker build` en construit une.",
  },
  {
    key: "array-map-immutable",
    category: "DEVELOPMENT",
    prompt: "Quelle méthode de tableau JavaScript ne modifie PAS le tableau original ?",
    choices: ["push", "splice", "map", "sort"],
    correctIndex: 2,
    explanation:
      "`map` retourne un nouveau tableau sans toucher à l'original. `push`, `splice` et `sort` modifient tous le tableau en place.",
  },

  // --- Lot 2 : 140 questions supplémentaires (25 par catégorie) ----------

  // DEVELOPMENT
  {
    key: "js-strict-equality",
    category: "DEVELOPMENT",
    prompt: "Quel opérateur JavaScript compare valeur ET type, sans conversion implicite ?",
    choices: ["==", "===", "=", "!="],
    correctIndex: 1,
    explanation: "`===` compare valeur et type sans conversion. `==` convertit les types avant de comparer, ce qui cause des surprises (`'1' == 1` est vrai).",
  },
  {
    key: "python-indentation",
    category: "DEVELOPMENT",
    prompt: "En Python, comment délimite-t-on un bloc de code (dans un if, une fonction...) ?",
    choices: ["Avec des accolades { }", "Avec l'indentation", "Avec des mots-clés begin/end", "Avec des points-virgules"],
    correctIndex: 1,
    explanation: "L'indentation fait partie de la syntaxe Python — pas juste une convention de style comme dans d'autres langages.",
  },
  {
    key: "git-clone-vs-fork",
    category: "DEVELOPMENT",
    prompt: "Quelle est la différence entre `git clone` et un fork (sur GitHub) ?",
    choices: ["Aucune différence", "clone copie un dépôt en local, fork crée une copie du dépôt sur son propre compte GitHub", "fork est juste plus rapide", "clone ne fonctionne que sur les dépôts privés"],
    correctIndex: 1,
    explanation: "clone télécharge le dépôt sur ta machine ; fork est une fonctionnalité GitHub qui crée une copie indépendante du dépôt sur ton compte, souvent pour ensuite proposer des changements via Pull Request.",
  },
  {
    key: "css-specificity",
    category: "DEVELOPMENT",
    prompt: "En CSS, lequel de ces sélecteurs a la priorité (spécificité) la plus élevée ?",
    choices: ["Un sélecteur de balise (div)", "Une classe (.ma-classe)", "Un ID (#mon-id)", "Un style inline (style=\"...\")"],
    correctIndex: 3,
    explanation: "Ordre de spécificité croissante : balise < classe < ID < style inline (en ignorant `!important`, qui prime sur tout).",
  },
  {
    key: "html-semantic-nav",
    category: "DEVELOPMENT",
    prompt: "Quelle balise HTML est sémantiquement correcte pour une barre de navigation ?",
    choices: ["<div class=\"nav\">", "<nav>", "<navigation>", "<menu>"],
    correctIndex: 1,
    explanation: "`<nav>` est une balise sémantique HTML5 dédiée à la navigation, utile pour l'accessibilité et le référencement.",
  },
  {
    key: "js-var-let-scope",
    category: "DEVELOPMENT",
    prompt: "Quelle est la principale différence entre `let` et `var` en JavaScript ?",
    choices: ["Aucune, ce sont des synonymes", "`let` a une portée de bloc, `var` a une portée de fonction", "`var` est plus récent que `let`", "`let` ne peut jamais être réassigné"],
    correctIndex: 1,
    explanation: "`var` \"fuit\" hors des blocs `{ }` (portée de fonction), une source classique de bugs — `let`/`const` restent bien confinés au bloc.",
  },
  {
    key: "rest-http-post",
    category: "DEVELOPMENT",
    prompt: "Quel verbe HTTP est conventionnellement utilisé pour CRÉER une ressource dans une API REST ?",
    choices: ["GET", "POST", "DELETE", "HEAD"],
    correctIndex: 1,
    explanation: "POST crée une nouvelle ressource. GET lit, PUT/PATCH modifient, DELETE supprime.",
  },
  {
    key: "python-list-comprehension",
    category: "DEVELOPMENT",
    prompt: "Que retourne `[x*2 for x in range(5)]` en Python ?",
    choices: ["[0, 2, 4, 6, 8]", "[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4]", "Une erreur de syntaxe"],
    correctIndex: 0,
    explanation: "`range(5)` donne 0,1,2,3,4 ; chaque valeur est multipliée par 2, donnant [0,2,4,6,8].",
  },
  {
    key: "sql-join-inner",
    category: "DEVELOPMENT",
    prompt: "Quel type de JOIN SQL retourne uniquement les lignes ayant une correspondance dans les DEUX tables ?",
    choices: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"],
    correctIndex: 2,
    explanation: "INNER JOIN ne garde que les lignes où la condition de jointure trouve une correspondance des deux côtés.",
  },
  {
    key: "js-arrow-this",
    category: "DEVELOPMENT",
    prompt: "Dans une fonction fléchée JavaScript (`=>`), à quoi correspond `this` ?",
    choices: ["À l'objet qui appelle la fonction", "Au `this` du contexte lexical englobant (hérité)", "Toujours à `undefined`", "À l'objet global uniquement"],
    correctIndex: 1,
    explanation: "Contrairement à une fonction classique, une fonction fléchée n'a pas son propre `this` : elle hérite de celui de son environnement de définition.",
  },
  {
    key: "npm-vs-npx",
    category: "DEVELOPMENT",
    prompt: "Quelle est la différence entre `npm` et `npx` ?",
    choices: ["Aucune", "npm installe des paquets, npx exécute un paquet sans forcément l'installer globalement", "npx est un synonyme de npm install", "npm est plus récent que npx"],
    correctIndex: 1,
    explanation: "`npx create-react-app` télécharge et exécute l'outil à la volée sans polluer ton système avec une installation globale permanente.",
  },
  {
    key: "python-none",
    category: "DEVELOPMENT",
    prompt: "Quel mot-clé représente l'absence de valeur en Python (équivalent de `null`) ?",
    choices: ["null", "None", "nil", "undefined"],
    correctIndex: 1,
    explanation: "`None` est l'objet Python représentant l'absence de valeur — avec un N majuscule.",
  },
  {
    key: "css-box-model-order",
    category: "DEVELOPMENT",
    prompt: "Dans le modèle de boîte CSS, quel est l'ordre correct de l'intérieur vers l'extérieur ?",
    choices: ["Border, Padding, Content, Margin", "Content, Padding, Border, Margin", "Margin, Border, Padding, Content", "Content, Margin, Border, Padding"],
    correctIndex: 1,
    explanation: "Content (le contenu) → Padding (l'espacement interne) → Border (la bordure) → Margin (l'espacement externe).",
  },
  {
    key: "js-array-destructuring",
    category: "DEVELOPMENT",
    prompt: "Que fait `const [a, b] = [1, 2, 3];` en JavaScript ?",
    choices: ["Erreur car les tailles ne correspondent pas", "a vaut 1, b vaut 2, le 3 est simplement ignoré", "a et b valent tous les deux [1,2,3]", "a vaut [1,2,3], b vaut undefined"],
    correctIndex: 1,
    explanation: "La déstructuration de tableau prend les éléments dans l'ordre ; les éléments en trop sont simplement ignorés, pas d'erreur.",
  },
  {
    key: "git-gitignore",
    category: "DEVELOPMENT",
    prompt: "À quoi sert le fichier `.gitignore` ?",
    choices: ["Lister les fichiers à toujours committer en priorité", "Indiquer à Git quels fichiers/dossiers ne pas suivre (ex: node_modules, .env)", "Chiffrer le contenu du dépôt", "Définir les branches autorisées"],
    correctIndex: 1,
    explanation: "Utile pour exclure des fichiers générés, des secrets (.env) ou de grosses dépendances (node_modules) de l'historique Git.",
  },
  {
    key: "python-pip",
    category: "DEVELOPMENT",
    prompt: "Quel outil installe des paquets Python ?",
    choices: ["npm", "pip", "composer", "gem"],
    correctIndex: 1,
    explanation: "`pip install requests` installe la bibliothèque `requests`. npm est pour Node.js, composer pour PHP, gem pour Ruby.",
  },
  {
    key: "js-null-vs-undefined",
    category: "DEVELOPMENT",
    prompt: "En JavaScript, quelle est la différence entre `null` et `undefined` ?",
    choices: ["Aucune, ce sont des synonymes", "`undefined` signifie qu'une variable n'a jamais été assignée ; `null` est une absence de valeur assignée intentionnellement", "`null` est un type primitif, pas `undefined`", "`undefined` n'existe qu'en TypeScript"],
    correctIndex: 1,
    explanation: "Une variable déclarée sans valeur vaut `undefined` automatiquement ; `null` doit être assigné explicitement par le développeur pour signifier \"vide, volontairement\".",
  },
  {
    key: "sql-primary-key",
    category: "DEVELOPMENT",
    prompt: "À quoi sert une clé primaire (PRIMARY KEY) dans une table SQL ?",
    choices: ["Elle identifie de façon unique chaque ligne de la table", "Elle chiffre automatiquement les données sensibles", "Elle trie automatiquement la table", "Elle limite le nombre de colonnes autorisées"],
    correctIndex: 0,
    explanation: "Une clé primaire garantit l'unicité de chaque ligne et sert de référence pour les clés étrangères d'autres tables.",
  },
  {
    key: "css-flexbox-justify",
    category: "DEVELOPMENT",
    prompt: "En CSS Flexbox, quelle propriété centre les éléments sur l'axe PRINCIPAL du conteneur ?",
    choices: ["align-items", "justify-content", "flex-direction", "display"],
    correctIndex: 1,
    explanation: "`justify-content` agit sur l'axe principal (horizontal par défaut) ; `align-items` agit sur l'axe transversal (perpendiculaire).",
  },
  {
    key: "js-spread-operator",
    category: "DEVELOPMENT",
    prompt: "Que fait l'opérateur spread `...` sur un tableau, ex: `[...arr]` ?",
    choices: ["Supprime le tableau", "Crée une copie superficielle (shallow copy) du tableau", "Trie le tableau", "Convertit le tableau en chaîne de caractères"],
    correctIndex: 1,
    explanation: "`[...arr]` étale les éléments d'`arr` dans un nouveau tableau — pratique pour copier ou fusionner des tableaux sans muter l'original.",
  },
  {
    key: "python-fstring",
    category: "DEVELOPMENT",
    prompt: "Quelle syntaxe Python insère une variable directement dans une chaîne, ex: `f\"Bonjour {nom}\"` ?",
    choices: ["Une concaténation classique", "Une f-string", "Un template literal", "printf"],
    correctIndex: 1,
    explanation: "Le préfixe `f` avant les guillemets active l'interpolation de variables entre accolades — introduit en Python 3.6.",
  },
  {
    key: "js-typeof-function",
    category: "DEVELOPMENT",
    prompt: "Que retourne `typeof function(){}` en JavaScript ?",
    choices: ["\"object\"", "\"function\"", "\"undefined\"", "\"method\""],
    correctIndex: 1,
    explanation: "Contrairement à la plupart des objets (`typeof {} === \"object\"`), les fonctions ont leur propre valeur `typeof` distincte : `\"function\"`.",
  },
  {
    key: "sql-group-by",
    category: "DEVELOPMENT",
    prompt: "À quoi sert la clause `GROUP BY` en SQL ?",
    choices: ["Trier les résultats", "Regrouper des lignes partageant une même valeur pour appliquer des agrégations (COUNT, SUM...)", "Filtrer les lignes avant tout traitement", "Supprimer les doublons uniquement"],
    correctIndex: 1,
    explanation: "`SELECT pays, COUNT(*) FROM users GROUP BY pays` compte les utilisateurs par pays — un groupe par valeur distincte de `pays`.",
  },
  {
    key: "js-template-literal",
    category: "DEVELOPMENT",
    prompt: "En JavaScript moderne, quelle syntaxe permet d'insérer une variable dans une chaîne avec des backticks ?",
    choices: ["`Bonjour ${nom}`", "\"Bonjour \" + nom", "'Bonjour %s' % nom", "Bonjour {nom}"],
    correctIndex: 0,
    explanation: "Les template literals (backticks) avec `${...}` permettent l'interpolation directe, sans concaténation manuelle avec `+`.",
  },

  // NETWORKING
  {
    key: "osi-layers-count",
    category: "NETWORKING",
    prompt: "Combien de couches compte le modèle OSI ?",
    choices: ["5", "6", "7", "8"],
    correctIndex: 2,
    explanation: "Physique, Liaison, Réseau, Transport, Session, Présentation, Application — 7 couches au total.",
  },
  {
    key: "ip-private-range",
    category: "NETWORKING",
    prompt: "Laquelle de ces adresses IP est une adresse privée (réseau local) ?",
    choices: ["8.8.8.8", "192.168.1.1", "1.1.1.1", "172.217.10.5"],
    correctIndex: 1,
    explanation: "192.168.0.0/16 fait partie des plages privées (RFC 1918), avec 10.0.0.0/8 et 172.16.0.0/12. Les autres sont des IP publiques réelles (DNS Google/Cloudflare).",
  },
  {
    key: "http-status-404",
    category: "NETWORKING",
    prompt: "Que signifie le code de statut HTTP 404 ?",
    choices: ["Erreur serveur interne", "Ressource non trouvée", "Accès interdit", "Requête réussie"],
    correctIndex: 1,
    explanation: "404 Not Found : le serveur n'a pas trouvé de ressource correspondant à l'URL demandée.",
  },
  {
    key: "http-status-500",
    category: "NETWORKING",
    prompt: "Que signifie le code de statut HTTP 500 ?",
    choices: ["Ressource non trouvée", "Non autorisé", "Erreur interne du serveur", "Redirection"],
    correctIndex: 2,
    explanation: "500 Internal Server Error : quelque chose a mal tourné côté serveur, indépendamment de la requête du client.",
  },
  {
    key: "dhcp-role",
    category: "NETWORKING",
    prompt: "À quoi sert le protocole DHCP ?",
    choices: ["Chiffrer le trafic réseau", "Attribuer automatiquement une adresse IP à un appareil qui rejoint le réseau", "Traduire les noms de domaine en IP", "Router les emails"],
    correctIndex: 1,
    explanation: "Sans DHCP, il faudrait configurer manuellement l'adresse IP de chaque appareil qui se connecte à un réseau.",
  },
  {
    key: "subnet-mask-role",
    category: "NETWORKING",
    prompt: "À quoi sert un masque de sous-réseau (subnet mask) ?",
    choices: ["Chiffrer les paquets IP", "Délimiter quelle partie d'une adresse IP désigne le réseau et quelle partie désigne l'hôte", "Accélérer la connexion", "Bloquer des ports spécifiques"],
    correctIndex: 1,
    explanation: "Ex: 255.255.255.0 signifie que les 3 premiers octets identifient le réseau, le dernier identifie l'hôte au sein de ce réseau.",
  },
  {
    key: "mac-address-def",
    category: "NETWORKING",
    prompt: "Qu'est-ce qu'une adresse MAC ?",
    choices: ["Une adresse IP statique", "Un identifiant physique unique attribué à une carte réseau", "Un protocole de chiffrement", "Un nom de domaine"],
    correctIndex: 1,
    explanation: "Contrairement à une IP (qui peut changer), l'adresse MAC est généralement gravée dans le matériel de la carte réseau.",
  },
  {
    key: "port-ssh-default",
    category: "NETWORKING",
    prompt: "Quel port utilise SSH par défaut ?",
    choices: ["21", "22", "23", "25"],
    correctIndex: 1,
    explanation: "Port 22 pour SSH. 21 est FTP, 23 est Telnet (obsolète, non chiffré), 25 est SMTP (email).",
  },
  {
    key: "port-ftp-default",
    category: "NETWORKING",
    prompt: "Quel port utilise FTP par défaut pour le contrôle de la connexion ?",
    choices: ["20", "21", "22", "23"],
    correctIndex: 1,
    explanation: "Le port 21 gère le contrôle de la session FTP ; le port 20 est traditionnellement utilisé pour le transfert de données.",
  },
  {
    key: "dns-record-a",
    category: "NETWORKING",
    prompt: "Quel type d'enregistrement DNS associe un nom de domaine à une adresse IPv4 ?",
    choices: ["MX", "CNAME", "A", "TXT"],
    correctIndex: 2,
    explanation: "L'enregistrement A pointe vers une adresse IPv4. AAAA fait l'équivalent pour IPv6.",
  },
  {
    key: "dns-record-mx",
    category: "NETWORKING",
    prompt: "Quel type d'enregistrement DNS indique le serveur de messagerie d'un domaine ?",
    choices: ["A", "MX", "NS", "AAAA"],
    correctIndex: 1,
    explanation: "MX (Mail Exchange) indique à quel(s) serveur(s) envoyer les emails destinés à ce domaine.",
  },
  {
    key: "nat-role",
    category: "NETWORKING",
    prompt: "À quoi sert le NAT (Network Address Translation) ?",
    choices: ["Chiffrer le trafic", "Permettre à plusieurs appareils d'un réseau privé de partager une seule adresse IP publique", "Accélérer le DNS", "Bloquer les intrusions"],
    correctIndex: 1,
    explanation: "Ton routeur domestique fait du NAT : tous tes appareils partagent l'unique IP publique fournie par ton FAI.",
  },
  {
    key: "http-vs-https",
    category: "NETWORKING",
    prompt: "Quelle est la différence fondamentale entre HTTP et HTTPS ?",
    choices: ["HTTPS est juste plus rapide", "HTTPS chiffre la communication via TLS, pas HTTP", "Ce sont deux protocoles totalement indépendants", "HTTP ne fonctionne que sur mobile"],
    correctIndex: 1,
    explanation: "HTTPS = HTTP + une couche de chiffrement TLS, protégeant confidentialité et intégrité des données échangées.",
  },
  {
    key: "router-vs-switch",
    category: "NETWORKING",
    prompt: "Quelle est la différence principale entre un routeur et un switch ?",
    choices: ["Aucune différence", "Un routeur relie des réseaux différents, un switch relie des appareils au sein d'un même réseau", "Un switch est toujours sans fil", "Un routeur ne fonctionne qu'en entreprise"],
    correctIndex: 1,
    explanation: "Le switch travaille au sein d'un même réseau local (couche 2), le routeur fait transiter le trafic entre réseaux différents (couche 3).",
  },
  {
    key: "ping-tool-purpose",
    category: "NETWORKING",
    prompt: "À quoi sert la commande `ping` ?",
    choices: ["Installer un paquet", "Vérifier qu'un hôte est joignable sur le réseau et mesurer la latence", "Chiffrer une connexion", "Lister les ports ouverts"],
    correctIndex: 1,
    explanation: "`ping` envoie des paquets ICMP et mesure le temps de réponse — un outil de diagnostic réseau de base.",
  },
  {
    key: "traceroute-purpose",
    category: "NETWORKING",
    prompt: "À quoi sert la commande `traceroute` (ou `tracert` sous Windows) ?",
    choices: ["Afficher le chemin (les sauts réseau) emprunté par les paquets jusqu'à une destination", "Réparer une connexion cassée", "Chiffrer le trafic", "Scanner les ports ouverts"],
    correctIndex: 0,
    explanation: "Utile pour diagnostiquer où exactement le trafic ralentit ou se perd entre toi et une destination donnée.",
  },
  {
    key: "ipv4-vs-ipv6",
    category: "NETWORKING",
    prompt: "Pourquoi IPv6 a-t-il été créé en complément d'IPv4 ?",
    choices: ["Pour être plus lent mais plus sûr", "Pour offrir un espace d'adressage bien plus grand, IPv4 étant en pénurie d'adresses", "Pour remplacer complètement HTTP", "Pour supprimer le besoin de DNS"],
    correctIndex: 1,
    explanation: "IPv4 (32 bits, ~4 milliards d'adresses) est épuisé face à la croissance d'internet ; IPv6 (128 bits) offre un espace d'adressage colossal.",
  },
  {
    key: "proxy-server-role",
    category: "NETWORKING",
    prompt: "À quoi sert un serveur proxy ?",
    choices: ["Il sert d'intermédiaire entre un client et un serveur, pouvant filtrer, cacher ou anonymiser les requêtes", "Il stocke uniquement des sauvegardes", "Il chiffre les mots de passe en base", "Il n'existe qu'en cybersécurité offensive"],
    correctIndex: 0,
    explanation: "Un proxy peut mettre en cache des ressources, filtrer du contenu, ou masquer l'IP d'origine du client selon sa configuration.",
  },
  {
    key: "bandwidth-vs-latency",
    category: "NETWORKING",
    prompt: "Quelle est la différence entre bande passante et latence ?",
    choices: ["Ce sont des synonymes", "La bande passante mesure le volume de données transmissibles par seconde, la latence mesure le délai avant qu'une donnée arrive", "La latence ne concerne que le Wi-Fi", "La bande passante ne concerne que la fibre"],
    correctIndex: 1,
    explanation: "Une connexion peut avoir une bande passante énorme mais une latence élevée (satellite), ou l'inverse — deux mesures indépendantes.",
  },
  {
    key: "firewall-network-role",
    category: "NETWORKING",
    prompt: "Quel est le rôle principal d'un pare-feu (firewall) réseau ?",
    choices: ["Accélérer le trafic", "Filtrer le trafic entrant/sortant selon des règles définies", "Stocker des fichiers", "Traduire les noms de domaine"],
    correctIndex: 1,
    explanation: "Un pare-feu bloque ou autorise le trafic selon des règles (ports, adresses IP, protocoles...) définies à l'avance.",
  },
  {
    key: "http-methods-idempotent",
    category: "NETWORKING",
    prompt: "Parmi ces verbes HTTP, lequel n'est PAS censé être idempotent ?",
    choices: ["GET", "PUT", "DELETE", "POST"],
    correctIndex: 3,
    explanation: "GET, PUT et DELETE sont censés produire le même résultat si répétés ; POST, lui, peut créer une nouvelle ressource à chaque appel.",
  },
  {
    key: "websocket-vs-polling",
    category: "NETWORKING",
    prompt: "Pourquoi préférer un WebSocket au polling HTTP répété pour du temps réel ?",
    choices: ["Le WebSocket est toujours plus sécurisé par nature", "Le WebSocket maintient une connexion ouverte, évitant de multiplier les requêtes HTTP inutiles", "Le polling ne fonctionne pas sur mobile", "Il n'y a aucune différence pratique"],
    correctIndex: 1,
    explanation: "Le polling force le client à interroger le serveur en boucle même si rien de neuf ; le WebSocket laisse le serveur pousser l'info dès qu'elle existe.",
  },
  {
    key: "vlan-purpose",
    category: "NETWORKING",
    prompt: "À quoi sert un VLAN (Virtual LAN) ?",
    choices: ["Segmenter logiquement un réseau physique en plusieurs réseaux séparés", "Augmenter la vitesse du Wi-Fi", "Remplacer le DNS", "Chiffrer automatiquement tout le trafic"],
    correctIndex: 0,
    explanation: "Un VLAN isole logiquement des groupes d'appareils sur un même switch physique, sans câblage séparé pour chaque réseau.",
  },
  {
    key: "http-header-purpose",
    category: "NETWORKING",
    prompt: "À quoi servent les en-têtes HTTP (headers) ?",
    choices: ["Ils ne servent à rien, c'est de la métadonnée facultative ignorée par les serveurs", "Transmettre des métadonnées sur la requête/réponse (type de contenu, authentification, cache...)", "Contenir uniquement le corps de la réponse", "Chiffrer automatiquement la requête"],
    correctIndex: 1,
    explanation: "Ex: `Content-Type`, `Authorization`, `Cache-Control` — des informations sur la requête/réponse, séparées du corps du message.",
  },
  {
    key: "icmp-protocol",
    category: "NETWORKING",
    prompt: "Quel protocole est utilisé par la commande `ping` pour vérifier la joignabilité d'un hôte ?",
    choices: ["TCP", "UDP", "ICMP", "HTTP"],
    correctIndex: 2,
    explanation: "ICMP (Internet Control Message Protocol) est dédié aux messages de diagnostic réseau, comme les requêtes/réponses ping.",
  },

  // AI
  {
    key: "ai-vs-ml-relation",
    category: "AI",
    prompt: "Quelle est la relation entre Intelligence Artificielle (IA) et Machine Learning (ML) ?",
    choices: ["Ce sont des synonymes", "Le Machine Learning est un sous-domaine de l'IA", "L'IA est un sous-domaine du Machine Learning", "Aucun rapport entre les deux"],
    correctIndex: 1,
    explanation: "L'IA est le domaine large (imiter des capacités \"intelligentes\") ; le ML en est une approche spécifique, où le système apprend à partir de données plutôt que d'être programmé explicitement.",
  },
  {
    key: "supervised-learning-def",
    category: "AI",
    prompt: "Qu'est-ce que l'apprentissage supervisé en Machine Learning ?",
    choices: ["Le modèle apprend à partir de données étiquetées (la bonne réponse est connue à l'avance)", "Le modèle n'utilise aucune donnée", "Le modèle apprend totalement sans données ni supervision", "Un synonyme strict de deep learning"],
    correctIndex: 0,
    explanation: "Ex: entraîner un modèle à reconnaître des chats en lui montrant des milliers d'images déjà étiquetées \"chat\"/\"pas chat\".",
  },
  {
    key: "neural-network-basic",
    category: "AI",
    prompt: "Qu'est-ce qu'un réseau de neurones artificiel, en très résumé ?",
    choices: ["Un simple tableau de données", "Un modèle inspiré du cerveau, composé de couches de nœuds interconnectés qui ajustent des poids pendant l'entraînement", "Un langage de programmation dédié à l'IA", "Une base de données spécialisée"],
    correctIndex: 1,
    explanation: "Chaque connexion a un \"poids\" ajusté pendant l'entraînement pour que le réseau produise de meilleures prédictions au fil du temps.",
  },
  {
    key: "overfitting-def",
    category: "AI",
    prompt: "Qu'est-ce que l'overfitting (surapprentissage) en Machine Learning ?",
    choices: ["Le modèle est trop simple pour capturer les tendances des données", "Le modèle apprend trop bien les données d'entraînement (y compris leur bruit) et généralise mal sur de nouvelles données", "Le modèle s'entraîne anormalement vite", "Un synonyme de fine-tuning"],
    correctIndex: 1,
    explanation: "Un modèle en overfitting excelle sur les données déjà vues mais échoue sur des données nouvelles — il a \"appris par cœur\" plutôt que compris les tendances générales.",
  },
  {
    key: "training-data-def",
    category: "AI",
    prompt: "Que sont les 'données d'entraînement' (training data) d'un modèle ?",
    choices: ["Les données utilisées uniquement pour tester le modèle après coup", "Les données utilisées pour ajuster les paramètres du modèle pendant son apprentissage", "Les données générées par le modèle une fois déployé", "Un synonyme de prompt utilisateur"],
    correctIndex: 1,
    explanation: "On distingue souvent training set (entraînement), validation set (ajustement) et test set (évaluation finale, jamais vu pendant l'entraînement).",
  },
  {
    key: "chatbot-hallucination",
    category: "AI",
    prompt: "Un chatbot basé sur un LLM répond-il toujours avec des informations vérifiées ?",
    choices: ["Oui, toujours, un LLM ne peut techniquement pas se tromper", "Non, il peut halluciner (inventer des faits avec assurance) — il faut vérifier les infos critiques", "Seulement si un mode spécial est activé", "Seulement en anglais"],
    correctIndex: 1,
    explanation: "Un LLM génère le texte statistiquement probable, pas une réponse vérifiée contre une base de faits — d'où l'importance de vérifier toute information critique.",
  },
  {
    key: "context-window-def",
    category: "AI",
    prompt: "Qu'est-ce que la 'fenêtre de contexte' (context window) d'un LLM ?",
    choices: ["Une fenêtre d'interface graphique", "La quantité maximale de texte (en tokens) que le modèle peut prendre en compte à la fois", "Le temps de réponse du modèle", "Un synonyme de fine-tuning"],
    correctIndex: 1,
    explanation: "Au-delà de cette limite, le début de la conversation \"sort\" du contexte que le modèle peut effectivement prendre en compte.",
  },
  {
    key: "embedding-def",
    category: "AI",
    prompt: "Qu'est-ce qu'un embedding en IA ?",
    choices: ["Un mot de passe chiffré", "Une représentation numérique (vecteur) d'un texte/image capturant son sens, utilisée pour mesurer la similarité entre contenus", "Un type de réseau social", "Un format d'image compressée"],
    correctIndex: 1,
    explanation: "Deux textes au sens proche auront des embeddings mathématiquement proches — la base technique du RAG et de la recherche sémantique.",
  },
  {
    key: "computer-vision-def",
    category: "AI",
    prompt: "Que désigne le terme 'Computer Vision' en IA ?",
    choices: ["La capacité d'une IA à générer du texte", "Le domaine de l'IA qui permet à une machine d'analyser et comprendre des images/vidéos", "Un langage de programmation dédié à l'IA", "Un synonyme exact de NLP"],
    correctIndex: 1,
    explanation: "Reconnaissance faciale, détection d'objets, lecture de plaques d'immatriculation... sont des applications de Computer Vision.",
  },
  {
    key: "nlp-acronym-def",
    category: "AI",
    prompt: "Que signifie l'acronyme NLP en IA ?",
    choices: ["Network Language Protocol", "Natural Language Processing", "New Learning Pattern", "Neural Logic Programming"],
    correctIndex: 1,
    explanation: "Le Traitement du Langage Naturel (NLP) regroupe les techniques permettant à une machine de comprendre/générer du langage humain.",
  },
  {
    key: "reinforcement-learning-def",
    category: "AI",
    prompt: "En quoi consiste l'apprentissage par renforcement (reinforcement learning) ?",
    choices: ["Le modèle apprend en recevant des récompenses/pénalités selon ses actions dans un environnement", "Le modèle copie exactement des exemples fournis", "Un synonyme d'apprentissage supervisé", "Une technique de compression d'image"],
    correctIndex: 0,
    explanation: "Utilisé par exemple pour entraîner des IA à jouer à des jeux : elles reçoivent une récompense en cas de succès, une pénalité sinon, et ajustent leur stratégie.",
  },
  {
    key: "generative-ai-def",
    category: "AI",
    prompt: "Que signifie 'IA générative' ?",
    choices: ["Une IA qui ne fait que classer des données existantes", "Une IA capable de créer du contenu nouveau (texte, image, code...) plutôt que seulement l'analyser", "Un synonyme de base de données", "Une IA qui fonctionne sans électricité"],
    correctIndex: 1,
    explanation: "Les LLM (génération de texte), les modèles de diffusion (génération d'images) sont des exemples d'IA générative.",
  },
  {
    key: "bias-in-ai-source",
    category: "AI",
    prompt: "D'où vient principalement le biais d'un modèle d'IA ?",
    choices: ["D'un bug dans le code du modèle uniquement", "Souvent des données d'entraînement elles-mêmes, qui reflètent des biais existants dans le monde réel", "Toujours d'une malveillance délibérée du créateur", "Il n'existe pas réellement de biais en IA"],
    correctIndex: 1,
    explanation: "Un modèle entraîné sur des données historiquement biaisées (ex: recrutement) reproduira et peut même amplifier ces biais dans ses prédictions.",
  },
  {
    key: "gpu-for-ai-reason",
    category: "AI",
    prompt: "Pourquoi les GPU sont-ils privilégiés pour entraîner des modèles d'IA plutôt que les CPU ?",
    choices: ["Ils sont moins chers à l'achat", "Ils excellent dans les calculs parallèles massifs (multiplications de matrices utilisées en deep learning)", "Ils consomment moins d'électricité", "Ils sont plus simples à programmer"],
    correctIndex: 1,
    explanation: "L'entraînement d'un réseau de neurones repose massivement sur des opérations matricielles parallélisables, exactement ce pour quoi les GPU ont été conçus (à l'origine pour le rendu graphique).",
  },
  {
    key: "ai-api-key-purpose",
    category: "AI",
    prompt: "Pourquoi une clé API est-elle nécessaire pour utiliser un service d'IA comme Claude ou GPT via une application ?",
    choices: ["Ce n'est jamais réellement nécessaire", "Pour authentifier les requêtes et permettre au fournisseur de facturer l'usage", "Pour ralentir volontairement les requêtes", "Pour chiffrer uniquement le message envoyé"],
    correctIndex: 1,
    explanation: "La clé identifie qui fait la requête, permettant la facturation à l'usage et l'application de limites/quotas par compte.",
  },
  {
    key: "temperature-param-def",
    category: "AI",
    prompt: "En IA générative, à quoi sert le paramètre 'température' d'un modèle ?",
    choices: ["Mesurer la charge du serveur qui héberge le modèle", "Contrôler le degré d'aléatoire/créativité des réponses générées", "Chiffrer la réponse générée", "Limiter le nombre de tokens en sortie"],
    correctIndex: 1,
    explanation: "Une température basse rend les réponses plus déterministes/prévisibles ; une température élevée les rend plus variées/créatives (au risque d'être moins cohérentes).",
  },
  {
    key: "system-prompt-def",
    category: "AI",
    prompt: "Qu'est-ce qu'un 'system prompt' pour un assistant IA ?",
    choices: ["Le message tapé directement par l'utilisateur", "Des instructions de comportement données au modèle en amont, généralement invisibles pour l'utilisateur final", "Un message d'erreur technique", "Un synonyme de fine-tuning"],
    correctIndex: 1,
    explanation: "Le system prompt cadre le comportement général de l'assistant (ton, règles, rôle) avant même que l'utilisateur ne pose sa question.",
  },
  {
    key: "ai-agent-def",
    category: "AI",
    prompt: "Que désigne un 'agent IA' par rapport à un simple chatbot ?",
    choices: ["Un synonyme exact de chatbot", "Un système qui peut utiliser des outils/actions de façon autonome pour accomplir une tâche, pas juste répondre à des messages", "Un modèle systématiquement plus petit", "Un modèle qui ne fonctionne que hors ligne"],
    correctIndex: 1,
    explanation: "Un agent peut par exemple chercher sur le web, exécuter du code, ou appeler des APIs de façon autonome pour accomplir une tâche complexe en plusieurs étapes.",
  },
  {
    key: "deep-learning-def",
    category: "AI",
    prompt: "Qu'est-ce que le deep learning (apprentissage profond) ?",
    choices: ["Un synonyme strict d'apprentissage supervisé", "Une famille de Machine Learning utilisant des réseaux de neurones à de nombreuses couches", "Un algorithme de tri de données", "Un type de base de données spécialisée"],
    correctIndex: 1,
    explanation: "\"Profond\" fait référence au nombre de couches du réseau de neurones — plus il y en a, plus le modèle peut apprendre des représentations complexes.",
  },
  {
    key: "dataset-quality-importance",
    category: "AI",
    prompt: "Pourquoi la qualité des données d'entraînement est-elle si critique en Machine Learning ?",
    choices: ["Elle ne l'est pas vraiment, seule la quantité compte", "Un modèle entraîné sur des données biaisées ou erronées reproduira ces défauts dans ses prédictions", "Les données ne sont utilisées qu'au moment du déploiement", "La qualité n'affecte que la vitesse d'entraînement"],
    correctIndex: 1,
    explanation: "\"Garbage in, garbage out\" : un modèle ne peut pas être meilleur que les données sur lesquelles il a appris.",
  },
  {
    key: "multimodal-ai-def",
    category: "AI",
    prompt: "Que signifie un modèle d'IA 'multimodal' ?",
    choices: ["Il ne fonctionne que sur mobile", "Il peut traiter plusieurs types de données (texte, image, audio...) plutôt qu'un seul", "Il tourne simultanément sur plusieurs serveurs", "Il possède plusieurs noms commerciaux"],
    correctIndex: 1,
    explanation: "Un modèle multimodal peut par exemple analyser une image ET répondre en texte à son sujet, dans une même conversation.",
  },
  {
    key: "ai-benchmark-def",
    category: "AI",
    prompt: "À quoi sert un benchmark en IA (jeu de test standardisé) ?",
    choices: ["À entraîner le modèle directement dessus en production", "À comparer objectivement les performances de différents modèles sur les mêmes tâches", "À chiffrer les résultats obtenus", "À remplacer complètement les tests unitaires classiques"],
    correctIndex: 1,
    explanation: "Un benchmark fournit une base de comparaison commune — attention cependant à ne pas entraîner un modèle directement sur les données du benchmark, ce qui fausserait la comparaison.",
  },
  {
    key: "ai-inference-def",
    category: "AI",
    prompt: "Que désigne l''inférence' pour un modèle d'IA déjà entraîné ?",
    choices: ["La phase où on entraîne encore le modèle sur de nouvelles données", "La phase où le modèle déjà entraîné génère une prédiction/réponse à partir d'une nouvelle entrée", "Un synonyme strict de fine-tuning", "Un type de biais spécifique"],
    correctIndex: 1,
    explanation: "Quand tu poses une question à un chatbot, c'est de l'inférence : le modèle n'apprend rien de nouveau, il applique ce qu'il a déjà appris.",
  },
  {
    key: "open-vs-closed-model",
    category: "AI",
    prompt: "Quelle est la différence entre un modèle d'IA 'open-weight' et un modèle propriétaire fermé ?",
    choices: ["Aucune différence réelle", "Les poids d'un modèle open-weight sont publiquement téléchargeables et exécutables localement, contrairement à un modèle fermé accessible seulement via une API", "Un modèle open-weight est toujours moins performant", "Un modèle fermé ne peut jamais être payant"],
    correctIndex: 1,
    explanation: "Un modèle open-weight (ex: certains modèles Llama) peut être téléchargé et exécuté sur ses propres serveurs, offrant plus de contrôle mais demandant sa propre infrastructure.",
  },
  {
    key: "ai-token-cost",
    category: "AI",
    prompt: "Comment la plupart des APIs de LLM facturent-elles l'usage ?",
    choices: ["Un forfait fixe mensuel unique, quel que soit l'usage", "Au nombre de tokens traités (en entrée et/ou en sortie)", "Au nombre de comptes utilisateurs uniquement", "L'usage des APIs de LLM est toujours entièrement gratuit"],
    correctIndex: 1,
    explanation: "Plus le prompt et la réponse générée sont longs (en tokens), plus la requête coûte cher — d'où l'intérêt de prompts concis et bien ciblés.",
  },

  // SYSTEMS
  {
    key: "linux-chmod",
    category: "SYSTEMS",
    prompt: "Sous Linux, quelle commande change les permissions d'un fichier ?",
    choices: ["chown", "chmod", "ls -l", "sudo"],
    correctIndex: 1,
    explanation: "`chmod 755 fichier` par exemple change qui peut lire/écrire/exécuter ce fichier. `chown` change le propriétaire, pas les permissions.",
  },
  {
    key: "linux-chown",
    category: "SYSTEMS",
    prompt: "À quoi sert la commande `chown` sous Linux ?",
    choices: ["Changer les permissions d'un fichier", "Changer le propriétaire (et/ou le groupe) d'un fichier", "Compresser un fichier", "Afficher le contenu d'un fichier"],
    correctIndex: 1,
    explanation: "`chown alice fichier.txt` transfère la propriété du fichier à l'utilisateur `alice`.",
  },
  {
    key: "linux-grep-purpose",
    category: "SYSTEMS",
    prompt: "À quoi sert la commande `grep` sous Linux ?",
    choices: ["Copier des fichiers", "Rechercher du texte correspondant à un motif dans un fichier ou un flux", "Supprimer des fichiers", "Changer de répertoire courant"],
    correctIndex: 1,
    explanation: "`grep \"erreur\" logs.txt` affiche toutes les lignes du fichier contenant le mot \"erreur\" — souvent combiné avec des expressions régulières.",
  },
  {
    key: "linux-root-user",
    category: "SYSTEMS",
    prompt: "Qui est l'utilisateur `root` sous Linux ?",
    choices: ["Un utilisateur normal comme les autres", "Le super-utilisateur ayant tous les droits sur le système", "Un compte toujours désactivé par défaut", "Un synonyme d'\"admin\" existant uniquement sous Windows"],
    correctIndex: 1,
    explanation: "`root` peut lire, écrire et exécuter absolument tout sur le système — d'où la prudence à observer avant de l'utiliser directement (préférer `sudo` ponctuellement).",
  },
  {
    key: "os-kernel-def",
    category: "SYSTEMS",
    prompt: "Qu'est-ce que le noyau (kernel) d'un système d'exploitation ?",
    choices: ["L'interface graphique du système", "Le cœur du système qui gère directement le matériel (CPU, mémoire, périphériques) pour les autres programmes", "Un antivirus intégré au système", "Un navigateur web installé par défaut"],
    correctIndex: 1,
    explanation: "Linux, le noyau Windows NT, le noyau XNU (macOS) sont des exemples de noyaux — la couche la plus basse entre le matériel et les applications.",
  },
  {
    key: "windows-task-manager-shortcut",
    category: "SYSTEMS",
    prompt: "Sous Windows, quel raccourci ouvre le Gestionnaire des tâches ?",
    choices: ["Ctrl+Shift+Échap", "Alt+F4", "Ctrl+C", "Windows+L"],
    correctIndex: 0,
    explanation: "Ctrl+Shift+Échap ouvre directement le Gestionnaire des tâches, sans passer par l'écran de verrouillage (contrairement à Ctrl+Alt+Suppr).",
  },
  {
    key: "linux-apt-install",
    category: "SYSTEMS",
    prompt: "Sous Ubuntu/Debian, quelle commande installe un paquet système ?",
    choices: ["yum install", "apt install", "brew install", "pacman -S"],
    correctIndex: 1,
    explanation: "`apt` est le gestionnaire de paquets des distributions basées sur Debian (Ubuntu inclus). `yum`/`dnf` pour Red Hat/Fedora, `brew` pour macOS, `pacman` pour Arch Linux.",
  },
  {
    key: "cron-job-purpose",
    category: "SYSTEMS",
    prompt: "À quoi sert une tâche cron (crontab) sous Linux ?",
    choices: ["Chiffrer des fichiers automatiquement", "Exécuter automatiquement une commande selon un planning récurrent (ex: tous les jours à minuit)", "Gérer les permissions utilisateurs", "Compresser des fichiers de logs"],
    correctIndex: 1,
    explanation: "Utile pour des sauvegardes automatiques, des nettoyages périodiques, ou tout script à lancer régulièrement sans intervention manuelle.",
  },
  {
    key: "filesystem-permission-r",
    category: "SYSTEMS",
    prompt: "Sous Linux, que signifie la permission `r` sur un fichier ?",
    choices: ["Exécution (run)", "Lecture (read)", "Écriture (write)", "Suppression (remove)"],
    correctIndex: 1,
    explanation: "`rwx` = read (lecture), write (écriture), execute (exécution) — les trois permissions de base, définies séparément pour le propriétaire, le groupe et les autres.",
  },
  {
    key: "ram-vs-disk-storage",
    category: "SYSTEMS",
    prompt: "Quelle est la différence fondamentale entre la RAM et le stockage disque (SSD/HDD) ?",
    choices: ["Aucune différence notable", "La RAM est volatile (perd son contenu à l'extinction) et rapide, le disque est persistant et plus lent", "Le disque est toujours plus rapide que la RAM", "La RAM stocke les fichiers de façon permanente comme le disque"],
    correctIndex: 1,
    explanation: "C'est pour ça qu'un logiciel ouvert (en RAM) disparaît si tu coupes le courant sans sauvegarder sur le disque, qui lui conserve les données même hors tension.",
  },
  {
    key: "process-pid-def",
    category: "SYSTEMS",
    prompt: "Qu'est-ce qu'un PID sous Linux/Unix ?",
    choices: ["Un mot de passe système", "L'identifiant unique attribué à chaque processus en cours d'exécution", "Un type de fichier spécial", "Un protocole réseau"],
    correctIndex: 1,
    explanation: "`kill 1234` par exemple arrête le processus dont le PID est 1234 — utile pour cibler précisément un programme qui ne répond plus.",
  },
  {
    key: "linux-sudo-purpose",
    category: "SYSTEMS",
    prompt: "À quoi sert la commande `sudo` sous Linux ?",
    choices: ["Supprimer un utilisateur du système", "Exécuter une commande avec les privilèges d'un autre utilisateur (souvent root)", "Redémarrer le système immédiatement", "Afficher l'espace disque disponible"],
    correctIndex: 1,
    explanation: "\"superuser do\" — permet d'élever temporairement ses privilèges pour UNE commande précise, plutôt que de rester connecté en root en permanence.",
  },
  {
    key: "bios-uefi-role",
    category: "SYSTEMS",
    prompt: "Quel est le rôle du BIOS/UEFI au démarrage d'un ordinateur ?",
    choices: ["Afficher directement le bureau Windows", "Initialiser le matériel et démarrer le système d'exploitation", "Se connecter automatiquement à internet", "Scanner les virus présents"],
    correctIndex: 1,
    explanation: "Le BIOS/UEFI est le tout premier logiciel exécuté au démarrage, avant même que le système d'exploitation ne prenne le relais.",
  },
  {
    key: "filesystem-ntfs",
    category: "SYSTEMS",
    prompt: "Lequel de ces éléments est un système de fichiers (filesystem) ?",
    choices: ["HTTP", "NTFS", "TCP", "DNS"],
    correctIndex: 1,
    explanation: "NTFS est le système de fichiers par défaut de Windows. HTTP, TCP et DNS sont des protocoles réseau, pas des systèmes de fichiers.",
  },
  {
    key: "ssh-remote-purpose",
    category: "SYSTEMS",
    prompt: "À quoi sert SSH principalement ?",
    choices: ["Transférer uniquement de gros fichiers", "Se connecter et administrer une machine distante de façon sécurisée et chiffrée", "Naviguer sur le web", "Envoyer des emails"],
    correctIndex: 1,
    explanation: "SSH (Secure Shell) chiffre toute la session, contrairement à Telnet (obsolète) qui transmettait tout en clair.",
  },
  {
    key: "windows-vs-linux-licensing",
    category: "SYSTEMS",
    prompt: "Quelle est une différence notable entre Windows et la plupart des distributions Linux ?",
    choices: ["Windows est gratuit, Linux est payant", "Beaucoup de distributions Linux sont open-source et gratuites, Windows est un logiciel propriétaire payant", "Linux ne fonctionne que sur serveur", "Windows n'a pas d'interface graphique"],
    correctIndex: 1,
    explanation: "Le code source de Linux est public et librement modifiable ; Windows est développé et licencié par Microsoft de façon fermée.",
  },
  {
    key: "env-path-variable",
    category: "SYSTEMS",
    prompt: "À quoi sert la variable d'environnement `PATH` ?",
    choices: ["Stocker le mot de passe administrateur", "Lister les répertoires où le système cherche les exécutables quand on tape une commande", "Définir la langue du système", "Stocker l'adresse IP de la machine"],
    correctIndex: 1,
    explanation: "Si `node` n'est pas trouvé alors qu'il est installé, c'est souvent que son dossier n'est pas dans le `PATH`.",
  },
  {
    key: "swap-memory-purpose",
    category: "SYSTEMS",
    prompt: "À quoi sert la mémoire swap (fichier d'échange) ?",
    choices: ["Accélérer le CPU", "Servir d'extension de la RAM sur le disque quand la mémoire physique est saturée (bien plus lent que la RAM)", "Stocker les mots de passe", "Chiffrer les fichiers du système"],
    correctIndex: 1,
    explanation: "Le swap évite un crash immédiat par manque de mémoire, au prix d'un ralentissement important dès qu'il est sollicité massivement.",
  },
  {
    key: "linux-ls-command",
    category: "SYSTEMS",
    prompt: "Sous Linux, quelle commande liste le contenu d'un répertoire ?",
    choices: ["dir", "ls", "list", "show"],
    correctIndex: 1,
    explanation: "`ls -la` par exemple liste tous les fichiers (y compris cachés) avec leurs détails. `dir` est la commande équivalente sous Windows.",
  },
  {
    key: "background-process-def",
    category: "SYSTEMS",
    prompt: "Que signifie exécuter un processus 'en arrière-plan' (background) sous Linux ?",
    choices: ["Le processus s'exécute sans bloquer le terminal, qui reste utilisable pour d'autres commandes", "Le processus est mis en pause indéfiniment", "Le processus est automatiquement supprimé", "Le processus tourne plus vite qu'en avant-plan"],
    correctIndex: 0,
    explanation: "Ajouter `&` à la fin d'une commande (`mon_script.sh &`) la lance en arrière-plan, libérant immédiatement le terminal.",
  },
  {
    key: "linux-man-pages",
    category: "SYSTEMS",
    prompt: "À quoi servent les 'man pages' sous Linux (ex: `man ls`) ?",
    choices: ["Afficher la version du noyau installé", "Afficher le manuel/documentation officielle d'une commande", "Lister les utilisateurs connectés", "Redémarrer un service système"],
    correctIndex: 1,
    explanation: "Chaque commande standard possède sa page de manuel intégrée, consultable directement depuis le terminal sans accès internet.",
  },
  {
    key: "system-uptime-command",
    category: "SYSTEMS",
    prompt: "Que mesure la commande `uptime` sous Linux ?",
    choices: ["L'espace disque libre restant", "Depuis combien de temps le système tourne sans redémarrage, et sa charge moyenne", "La vitesse du processeur en temps réel", "Le nombre d'utilisateurs connectés uniquement"],
    correctIndex: 1,
    explanation: "Utile pour vérifier la stabilité d'un serveur (un uptime très court après un plantage inattendu est un signal d'alerte).",
  },
  {
    key: "windows-registry-def",
    category: "SYSTEMS",
    prompt: "Qu'est-ce que le Registre Windows (Registry) ?",
    choices: ["Un logiciel antivirus", "Une base de données hiérarchique stockant la configuration du système et des applications", "Un gestionnaire de fichiers", "Un pare-feu intégré"],
    correctIndex: 1,
    explanation: "Modifier le Registre à la main est risqué : une erreur peut rendre Windows instable, d'où la prudence recommandée avant toute modification manuelle.",
  },
  {
    key: "linux-symlink-def",
    category: "SYSTEMS",
    prompt: "Qu'est-ce qu'un lien symbolique (symlink) sous Linux ?",
    choices: ["Une copie complète et indépendante d'un fichier", "Un raccourci pointant vers un autre fichier ou dossier, sans dupliquer son contenu", "Un fichier automatiquement chiffré", "Un type particulier de permission"],
    correctIndex: 1,
    explanation: "Créé avec `ln -s cible lien` — si le fichier cible est supprimé ou déplacé, le lien symbolique devient \"cassé\" (pointe vers rien).",
  },
  {
    key: "linux-df-command",
    category: "SYSTEMS",
    prompt: "Sous Linux, quelle commande affiche l'espace disque utilisé/disponible ?",
    choices: ["df -h", "ls -la", "top", "ping"],
    correctIndex: 0,
    explanation: "`df -h` (disk free, human-readable) affiche l'espace disque par système de fichiers monté, dans un format lisible (Go, Mo...).",
  },

  // CYBERSECURITY
  {
    key: "social-engineering-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce que l'ingénierie sociale (social engineering) en cybersécurité ?",
    choices: ["Exploiter une faille technique dans un logiciel", "Manipuler psychologiquement une personne pour lui faire réaliser une action ou révéler une information", "Un type de pare-feu spécifique", "Un algorithme de chiffrement"],
    correctIndex: 1,
    explanation: "Le phishing est une forme d'ingénierie sociale — la faille exploitée est humaine, pas technique.",
  },
  {
    key: "password-hash-irreversible",
    category: "CYBERSECURITY",
    prompt: "Pourquoi ne peut-on pas 'déchiffrer' un mot de passe correctement haché pour le retrouver en clair ?",
    choices: ["C'est possible mais interdit par la loi", "Le hashing est une fonction à sens unique, mathématiquement impossible à inverser directement", "Les mots de passe ne sont en réalité jamais hachés en pratique", "Le hachage double simplement la taille du mot de passe"],
    correctIndex: 1,
    explanation: "On peut seulement vérifier qu'un mot de passe donné produit le même hash — jamais retrouver l'original à partir du hash seul (hors attaque par force brute/dictionnaire).",
  },
  {
    key: "least-privilege-principle",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce que le principe du moindre privilège (least privilege) ?",
    choices: ["Donner tous les droits par défaut à chaque utilisateur", "N'accorder à chaque utilisateur/service que les accès strictement nécessaires à sa tâche", "Interdire absolument tout accès, sans aucune exception", "Un synonyme strict de zero trust"],
    correctIndex: 1,
    explanation: "Limite l'impact d'un compte compromis : un attaquant qui prend le contrôle d'un compte à faibles privilèges ne peut pas tout faire sur le système.",
  },
  {
    key: "patch-management-importance",
    category: "CYBERSECURITY",
    prompt: "Pourquoi appliquer rapidement les mises à jour de sécurité (patch management) est-il crucial ?",
    choices: ["Ça n'a pas vraiment d'impact réel sur la sécurité", "Beaucoup d'attaques exploitent des vulnérabilités déjà connues et corrigées, mais non appliquées par la victime", "Les mises à jour ralentissent toujours le système", "Seuls les serveurs ont besoin d'être mis à jour, jamais les postes utilisateurs"],
    correctIndex: 1,
    explanation: "Une fois une faille publiquement documentée (CVE), le temps entre la publication du correctif et son application réelle est une fenêtre d'opportunité pour les attaquants.",
  },
  {
    key: "brute-force-attack-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'une attaque par force brute ?",
    choices: ["Intercepter le trafic réseau d'une victime", "Essayer systématiquement toutes les combinaisons possibles d'un mot de passe jusqu'à trouver la bonne", "Injecter du code SQL malveillant", "Envoyer un email frauduleux"],
    correctIndex: 1,
    explanation: "Un mot de passe long et complexe rend une attaque par force brute exponentiellement plus longue à réussir.",
  },
  {
    key: "dictionary-attack-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'une attaque par dictionnaire ?",
    choices: ["Tester une liste de mots de passe courants ou déjà fuités, plutôt que toutes les combinaisons possibles", "Traduire un mot de passe dans une autre langue", "Chiffrer un fichier avec un dictionnaire de mots", "Un synonyme exact de phishing"],
    correctIndex: 0,
    explanation: "Bien plus rapide qu'une force brute exhaustive, car elle cible en priorité les mots de passe réellement utilisés en pratique (\"123456\", \"password\"...).",
  },
  {
    key: "salting-purpose",
    category: "CYBERSECURITY",
    prompt: "Pourquoi ajoute-t-on un sel (salt) avant de hacher un mot de passe ?",
    choices: ["Pour accélérer le calcul du hachage", "Pour empêcher les attaques par table précalculée (rainbow table) en rendant chaque hash unique", "Pour compresser le mot de passe", "Pour le rendre visuellement plus court"],
    correctIndex: 1,
    explanation: "Sans sel, deux utilisateurs avec le même mot de passe auraient exactement le même hash — un sel unique par utilisateur élimine cette faiblesse.",
  },
  {
    key: "vulnerability-vs-exploit",
    category: "CYBERSECURITY",
    prompt: "Quelle est la différence entre une vulnérabilité et un exploit ?",
    choices: ["Ce sont des synonymes stricts", "Une vulnérabilité est une faiblesse ; un exploit est le code/technique qui l'exploite réellement", "Un exploit existe toujours avant la vulnérabilité qu'il cible", "Une vulnérabilité ne concerne que les mots de passe"],
    correctIndex: 1,
    explanation: "Une vulnérabilité peut exister sans qu'aucun exploit public ne circule pour l'exploiter — mais ce n'est qu'une question de temps une fois publiquement documentée.",
  },
  {
    key: "cve-acronym-def",
    category: "CYBERSECURITY",
    prompt: "Que signifie l'acronyme CVE en cybersécurité ?",
    choices: ["Common Vulnerabilities and Exposures — un identifiant standardisé pour une vulnérabilité connue", "Certified Vulnerability Expert", "Cyber Virus Elimination", "Un type spécifique de pare-feu"],
    correctIndex: 0,
    explanation: "Un identifiant CVE (ex: CVE-2024-12345) permet de référencer et suivre une vulnérabilité spécifique de façon universelle entre outils et équipes.",
  },
  {
    key: "defense-in-depth-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce que la défense en profondeur (defense in depth) ?",
    choices: ["Se reposer sur un seul mécanisme de sécurité très robuste", "Superposer plusieurs couches de sécurité indépendantes, pour qu'une seule faille ne compromette pas tout", "Un synonyme exact de pare-feu", "Ignorer volontairement les mises à jour de sécurité mineures"],
    correctIndex: 1,
    explanation: "Si une couche est contournée (ex: un mot de passe volé), d'autres couches (MFA, permissions limitées, monitoring...) limitent quand même les dégâts.",
  },
  {
    key: "sandbox-security-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'un sandbox (bac à sable) en sécurité informatique ?",
    choices: ["Un type de virus informatique", "Un environnement isolé où exécuter du code non fiable sans risque pour le système réel", "Un pare-feu physique dédié", "Un protocole de chiffrement spécifique"],
    correctIndex: 1,
    explanation: "Utilisé par exemple pour analyser un fichier suspect en toute sécurité, ou tester du code non vérifié sans risquer le système hôte.",
  },
  {
    key: "spoofing-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce que le spoofing en cybersécurité ?",
    choices: ["Chiffrer une communication de bout en bout", "Falsifier une identité (adresse IP, email, site web...) pour tromper la victime", "Scanner les ports ouverts d'un réseau", "Sauvegarder automatiquement des données"],
    correctIndex: 1,
    explanation: "Un email de \"spoofing\" fait croire qu'il vient d'un expéditeur légitime alors que son origine réelle est totalement différente.",
  },
  {
    key: "keylogger-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'un keylogger ?",
    choices: ["Un logiciel antivirus", "Un logiciel malveillant qui enregistre les frappes clavier de la victime, souvent pour voler des identifiants", "Un gestionnaire de mots de passe légitime", "Un pare-feu réseau"],
    correctIndex: 1,
    explanation: "Un keylogger peut capturer directement les mots de passe tapés, contournant même un mot de passe très fort — d'où l'intérêt du MFA en complément.",
  },
  {
    key: "security-through-obscurity",
    category: "CYBERSECURITY",
    prompt: "Pourquoi la 'sécurité par l'obscurité' (cacher le fonctionnement plutôt que le sécuriser réellement) est-elle risquée si utilisée SEULE ?",
    choices: ["Parce que cacher le code source est toujours illégal", "Parce qu'elle ne résiste pas si le secret est découvert — elle ne doit jamais être l'unique ligne de défense", "Parce qu'elle ralentit systématiquement le système", "Ce n'est pas du tout un problème reconnu en sécurité"],
    correctIndex: 1,
    explanation: "Un bon système de sécurité doit rester sûr même si son fonctionnement interne est publiquement connu (principe de Kerckhoffs) — la vraie protection vient des clés/secrets, pas du secret de l'algorithme.",
  },
  {
    key: "supply-chain-attack-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'une attaque de la chaîne d'approvisionnement (supply chain attack) ?",
    choices: ["Attaquer directement le site web principal de la victime", "Compromettre un composant tiers (dépendance, fournisseur) utilisé par la cible pour l'atteindre indirectement", "Un synonyme exact de DDoS", "Une attaque physique visant un data center"],
    correctIndex: 1,
    explanation: "Compromettre un paquet npm largement utilisé, par exemple, peut affecter des milliers de projets qui en dépendent, sans attaquer chacun directement.",
  },
  {
    key: "incident-response-def",
    category: "CYBERSECURITY",
    prompt: "Que désigne la réponse à incident (incident response) en cybersécurité ?",
    choices: ["Le processus structuré de détection, confinement, éradication et récupération après une compromission de sécurité", "Un logiciel antivirus spécifique", "Un type particulier de pare-feu", "Un synonyme de test d'intrusion"],
    correctIndex: 0,
    explanation: "Avoir un plan de réponse à incident préparé À L'AVANCE réduit énormément les dégâts et le temps de récupération en cas de vraie compromission.",
  },
  {
    key: "clickjacking-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce que le clickjacking ?",
    choices: ["Voler un mot de passe par force brute", "Superposer une page invisible pour piéger l'utilisateur à cliquer sur autre chose que ce qu'il croit cliquer", "Un type spécifique de ransomware", "Un protocole VPN"],
    correctIndex: 1,
    explanation: "La victime croit cliquer sur un bouton inoffensif, alors qu'un élément invisible superposé déclenche une action différente (ex: valider un achat, activer une permission).",
  },
  {
    key: "security-audit-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'un audit de sécurité ?",
    choices: ["Une simulation d'attaque non autorisée", "Une évaluation méthodique et autorisée des mesures de sécurité d'un système", "Un logiciel espion", "Un type de malware spécifique"],
    correctIndex: 1,
    explanation: "Contrairement à un pentest qui exploite activement des failles, un audit vérifie souvent la conformité aux bonnes pratiques et politiques de sécurité.",
  },
  {
    key: "honeypot-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'un honeypot en cybersécurité ?",
    choices: ["Un antivirus gratuit", "Un système leurre délibérément vulnérable, déployé pour attirer et étudier les attaquants", "Un type de VPN spécifique", "Un pare-feu physique"],
    correctIndex: 1,
    explanation: "Un honeypot permet d'observer les techniques d'attaquants réels dans un environnement contrôlé, sans risque pour les vrais systèmes de production.",
  },
  {
    key: "data-breach-def",
    category: "CYBERSECURITY",
    prompt: "Que désigne une 'fuite de données' (data breach) ?",
    choices: ["Une mise à jour de sécurité classique", "L'accès, la divulgation ou le vol non autorisé de données sensibles", "Un simple ralentissement réseau", "Un type de sauvegarde automatique"],
    correctIndex: 1,
    explanation: "Une fuite de données peut résulter d'un piratage, mais aussi d'une simple erreur de configuration exposant des données publiquement par accident.",
  },
  {
    key: "cyber-hygiene-def",
    category: "CYBERSECURITY",
    prompt: "Que recouvre l' 'hygiène cyber' (cyber hygiene) au quotidien ?",
    choices: ["Uniquement l'installation d'un antivirus", "Les bonnes pratiques régulières : mots de passe uniques, mises à jour, sauvegardes, vigilance face au phishing...", "Un type de chiffrement spécifique", "Un logiciel propriétaire particulier"],
    correctIndex: 1,
    explanation: "Comme l'hygiène corporelle, ce sont des habitudes simples répétées régulièrement qui préviennent la majorité des problèmes courants.",
  },
  {
    key: "threat-actor-def",
    category: "CYBERSECURITY",
    prompt: "Que désigne un 'threat actor' (acteur de la menace) ?",
    choices: ["Un logiciel antivirus", "Une personne ou un groupe à l'origine d'une menace ou d'une attaque informatique", "Un type de pare-feu", "Un protocole réseau spécifique"],
    correctIndex: 1,
    explanation: "Peut désigner un individu isolé, un groupe organisé de cybercriminels, ou même un acteur étatique selon le contexte de la menace.",
  },
  {
    key: "air-gap-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'un système 'air-gapped' ?",
    choices: ["Un système connecté à plusieurs réseaux Wi-Fi simultanément", "Un système physiquement isolé de tout réseau (y compris internet) pour le protéger des attaques à distance", "Un type de VPN spécifique", "Un pare-feu purement logiciel"],
    correctIndex: 1,
    explanation: "Utilisé pour des systèmes extrêmement sensibles (contrôle industriel critique...) où aucune connexion réseau n'est jugée acceptable, même indirecte.",
  },
  {
    key: "patch-tuesday-def",
    category: "CYBERSECURITY",
    prompt: "Que désigne le terme 'Patch Tuesday' ?",
    choices: ["Un jour férié dédié à la cybersécurité", "Le jour mensuel régulier où Microsoft publie ses correctifs de sécurité pour Windows", "Un type d'attaque informatique", "Un logiciel antivirus spécifique"],
    correctIndex: 1,
    explanation: "Généralement le deuxième mardi de chaque mois — une cadence prévisible qui aide les équipes IT à planifier le déploiement des correctifs.",
  },
  {
    key: "owasp-purpose",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce que l'OWASP ?",
    choices: ["Une entreprise qui vend des pare-feu", "Une fondation à but non lucratif qui publie des ressources et référentiels de sécurité applicative (dont le fameux Top 10)", "Un protocole de chiffrement", "Un type de malware"],
    correctIndex: 1,
    explanation: "L'OWASP (Open Worldwide Application Security Project) est une référence largement reconnue en sécurité des applications web, avec des ressources gratuites et ouvertes.",
  },

  // CLOUD
  {
    key: "saas-def",
    category: "CLOUD",
    prompt: "Que signifie SaaS dans le contexte du cloud ?",
    choices: ["Security as a Service", "Software as a Service — un logiciel prêt à l'emploi accessible via internet, sans rien installer", "Storage as a Service", "System as a Service"],
    correctIndex: 1,
    explanation: "Gmail, Notion, Slack sont des exemples de SaaS : tu utilises le service directement dans le navigateur, sans gérer aucune infrastructure sous-jacente.",
  },
  {
    key: "paas-def",
    category: "CLOUD",
    prompt: "Que signifie PaaS (Platform as a Service) ?",
    choices: ["Un service qui fournit une plateforme complète pour développer/déployer des applications sans gérer l'infrastructure sous-jacente", "Un logiciel complet prêt à l'emploi", "Un synonyme exact de SaaS", "Une plateforme de développement uniquement, sans hébergement"],
    correctIndex: 0,
    explanation: "Le fournisseur PaaS gère les serveurs, l'OS et le runtime ; le développeur se concentre sur le code de son application.",
  },
  {
    key: "iaas-def",
    category: "CLOUD",
    prompt: "Que signifie IaaS (Infrastructure as a Service) ?",
    choices: ["Louer une infrastructure informatique brute (serveurs virtuels, stockage, réseau) sans logiciel préinstallé", "Un logiciel complet prêt à l'emploi", "Un synonyme exact de PaaS", "Une plateforme de développement uniquement"],
    correctIndex: 0,
    explanation: "Avec l'IaaS, le client gère lui-même l'OS et tout ce qui tourne dessus ; le fournisseur ne gère que le matériel physique et la virtualisation.",
  },
  {
    key: "auto-scaling-def",
    category: "CLOUD",
    prompt: "Qu'est-ce que l'auto-scaling dans le cloud ?",
    choices: ["Ajuster automatiquement le nombre de ressources (serveurs) selon la charge réelle observée", "Une sauvegarde automatique quotidienne", "Un chiffrement automatique des données stockées", "Un type de load balancer uniquement"],
    correctIndex: 0,
    explanation: "Si le trafic explose, l'auto-scaling ajoute des instances automatiquement ; il les retire quand la charge redescend, optimisant les coûts.",
  },
  {
    key: "availability-zone-def",
    category: "CLOUD",
    prompt: "Qu'est-ce qu'une 'zone de disponibilité' (Availability Zone) chez un fournisseur cloud ?",
    choices: ["Un centre de données isolé au sein d'une région, pour répartir les risques de panne", "Un pays entier dans son intégralité", "Un type de VPN spécifique", "Un synonyme exact de CDN"],
    correctIndex: 0,
    explanation: "Répartir une application sur plusieurs zones de disponibilité protège contre la panne d'un seul data center.",
  },
  {
    key: "object-storage-def",
    category: "CLOUD",
    prompt: "Qu'est-ce que le stockage objet (ex: Amazon S3) ?",
    choices: ["Un système de fichiers classique avec des dossiers imbriqués obligatoires", "Un stockage de fichiers/données sous forme d'objets identifiés par une clé, accessible via API, hautement scalable", "Une base de données relationnelle", "Un type de VPN"],
    correctIndex: 1,
    explanation: "Idéal pour stocker des images, vidéos ou sauvegardes à très grande échelle, sans les contraintes d'une arborescence de dossiers classique.",
  },
  {
    key: "managed-database-def",
    category: "CLOUD",
    prompt: "Qu'apporte une base de données 'managée' (managed database) par un fournisseur cloud ?",
    choices: ["Rien de plus qu'une base auto-hébergée classique", "Le fournisseur gère les sauvegardes, mises à jour et la haute disponibilité à ta place", "Elle est toujours entièrement gratuite", "Elle ne supporte que le SQL, jamais d'autres modèles de données"],
    correctIndex: 1,
    explanation: "Tu te concentres sur ton schéma et tes requêtes, pendant que le fournisseur s'occupe de la maintenance opérationnelle de la base elle-même.",
  },
  {
    key: "pay-as-you-go-def",
    category: "CLOUD",
    prompt: "Qu'est-ce que le modèle 'pay-as-you-go' dans le cloud ?",
    choices: ["Payer un abonnement fixe annuel obligatoire", "Payer uniquement pour les ressources réellement consommées, sans engagement long terme", "Un service entièrement gratuit à vie", "Un synonyme exact d'IaaS"],
    correctIndex: 1,
    explanation: "Contrairement à l'achat d'un serveur physique, tu ne payes que ce que tu utilises réellement, et tu peux ajuster à tout moment.",
  },
  {
    key: "multi-cloud-def",
    category: "CLOUD",
    prompt: "Qu'est-ce qu'une stratégie 'multi-cloud' ?",
    choices: ["Utiliser plusieurs fournisseurs cloud différents (ex: AWS + Google Cloud) plutôt qu'un seul", "Avoir plusieurs comptes chez le même fournisseur unique", "Un synonyme exact de serverless", "Utiliser uniquement des serveurs physiques on-premise"],
    correctIndex: 0,
    explanation: "Réduit la dépendance à un seul fournisseur (vendor lock-in), au prix d'une complexité opérationnelle plus élevée.",
  },
  {
    key: "vpc-def",
    category: "CLOUD",
    prompt: "Qu'est-ce qu'un VPC (Virtual Private Cloud) ?",
    choices: ["Un antivirus cloud", "Un réseau virtuel isolé et privé au sein de l'infrastructure d'un fournisseur cloud", "Un type de base de données spécifique", "Un synonyme exact de CDN"],
    correctIndex: 1,
    explanation: "Permet de définir ses propres sous-réseaux, règles de routage et de sécurité, comme si on avait son propre datacenter privé virtuel.",
  },
  {
    key: "docker-vs-vm",
    category: "CLOUD",
    prompt: "Quelle est la différence principale entre un conteneur Docker et une machine virtuelle (VM) ?",
    choices: ["Aucune différence réelle", "Un conteneur partage le noyau de l'hôte (plus léger), une VM virtualise un OS complet (plus lourd mais plus isolé)", "Une VM démarre toujours plus vite qu'un conteneur", "Docker ne fonctionne que sous Windows"],
    correctIndex: 1,
    explanation: "C'est pourquoi les conteneurs démarrent en quelques secondes (voire moins) alors qu'une VM peut prendre plusieurs dizaines de secondes à booter un OS entier.",
  },
  {
    key: "docker-compose-def",
    category: "CLOUD",
    prompt: "À quoi sert `docker compose` ?",
    choices: ["Compresser une image Docker", "Définir et lancer plusieurs conteneurs liés (ex: app + base de données) via un seul fichier de configuration", "Scanner les vulnérabilités d'une image", "Créer un compte sur Docker Hub"],
    correctIndex: 1,
    explanation: "Un fichier `docker-compose.yml` décrit tous les services d'une application et leurs liens réseau — un seul `docker compose up` les lance tous ensemble.",
  },
  {
    key: "cdn-edge-def",
    category: "CLOUD",
    prompt: "Pourquoi dit-on qu'un CDN sert du contenu 'en périphérie' (edge) ?",
    choices: ["Parce qu'il ne fonctionne qu'en bordure de ville", "Parce qu'il sert le contenu depuis des serveurs proches géographiquement de l'utilisateur, plutôt que depuis un serveur central unique", "Parce qu'il est toujours payant au-delà d'un certain usage", "Parce qu'il remplace complètement le DNS"],
    correctIndex: 1,
    explanation: "\"Edge\" (périphérie) s'oppose au \"core\" (centre) — le contenu est rapproché physiquement des utilisateurs finaux pour réduire la latence.",
  },
  {
    key: "iac-terraform-def",
    category: "CLOUD",
    prompt: "Qu'est-ce que l'Infrastructure as Code (IaC, ex: Terraform) ?",
    choices: ["Écrire l'infrastructure cloud (serveurs, réseaux...) sous forme de fichiers de configuration versionnables, plutôt que de tout configurer manuellement via une interface", "Un langage de programmation pour applications web", "Un synonyme exact de serverless", "Un outil de test unitaire"],
    correctIndex: 0,
    explanation: "Permet de recréer une infrastructure identique de façon reproductible, et de suivre son historique de changements comme n'importe quel code source.",
  },
  {
    key: "object-vs-file-storage",
    category: "CLOUD",
    prompt: "Quelle est la différence entre le stockage objet (type S3) et un système de fichiers classique ?",
    choices: ["Aucune différence réelle", "Le stockage objet n'a pas de hiérarchie de dossiers imposée et s'accède via API, contrairement à un système de fichiers avec une arborescence classique", "Le système de fichiers classique est toujours plus rapide dans le cloud", "Le stockage objet ne peut stocker que du texte brut"],
    correctIndex: 1,
    explanation: "Le stockage objet identifie chaque élément par une clé unique plutôt que par un chemin de dossiers, ce qui simplifie énormément la scalabilité horizontale.",
  },
  {
    key: "shared-responsibility-model",
    category: "CLOUD",
    prompt: "Qu'est-ce que le 'modèle de responsabilité partagée' dans le cloud ?",
    choices: ["Le fournisseur cloud est responsable de tout, y compris de la configuration faite par le client", "Le fournisseur sécurise l'infrastructure sous-jacente, mais le client reste responsable de la sécurité de sa configuration et de ses données", "Le client est responsable de tout, y compris du matériel physique", "Un concept qui ne s'applique qu'à un seul fournisseur cloud en particulier"],
    correctIndex: 1,
    explanation: "Une mauvaise configuration d'accès par le client (ex: un bucket de stockage laissé public par erreur) reste de sa responsabilité, même si l'infrastructure elle-même est sécurisée par le fournisseur.",
  },
  {
    key: "docker-image-vs-container",
    category: "CLOUD",
    prompt: "Quelle est la différence entre une image Docker et un conteneur ?",
    choices: ["Ce sont des synonymes stricts", "Une image est un modèle figé (comme une classe), un conteneur est une instance en cours d'exécution de cette image (comme un objet)", "Un conteneur ne peut jamais exister sans connexion internet", "Une image ne peut être utilisée qu'une seule fois avant suppression"],
    correctIndex: 1,
    explanation: "On peut lancer plusieurs conteneurs différents à partir de la MÊME image, exactement comme on peut créer plusieurs objets à partir d'une même classe.",
  },
  {
    key: "spot-instance-def",
    category: "CLOUD",
    prompt: "Que sont les instances 'spot' dans le cloud (par opposition aux instances à la demande) ?",
    choices: ["Des instances plus chères mais garanties en permanence", "De la capacité de calcul inutilisée vendue moins cher, mais pouvant être récupérée par le fournisseur à tout moment", "Un type de stockage uniquement", "Un synonyme exact de serverless"],
    correctIndex: 1,
    explanation: "Adapté aux tâches tolérantes aux interruptions (calcul par lot, traitement asynchrone) grâce à leur coût nettement réduit.",
  },
  {
    key: "serverless-cold-start",
    category: "CLOUD",
    prompt: "Qu'est-ce que le 'cold start' en informatique serverless ?",
    choices: ["Un redémarrage manuel effectué par un administrateur", "Le délai supplémentaire au premier appel d'une fonction après une période d'inactivité, le temps que l'environnement démarre", "Un type de panne réseau", "Un synonyme exact de load balancing"],
    correctIndex: 1,
    explanation: "Une fonction fréquemment appelée reste \"chaude\" (pas de délai) ; après une période d'inactivité, le premier appel suivant subit ce délai de démarrage.",
  },
  {
    key: "container-registry-def",
    category: "CLOUD",
    prompt: "À quoi sert un registre de conteneurs (container registry, ex: Docker Hub) ?",
    choices: ["Stocker et distribuer des images de conteneurs", "Exécuter directement des conteneurs sans jamais les télécharger", "Chiffrer les mots de passe des utilisateurs", "Un synonyme exact de Kubernetes"],
    correctIndex: 0,
    explanation: "`docker pull nginx` télécharge l'image \"nginx\" depuis un registre public — Docker Hub en est l'exemple le plus connu.",
  },
  {
    key: "disaster-recovery-def",
    category: "CLOUD",
    prompt: "Que désigne un plan de reprise après sinistre (disaster recovery) dans le cloud ?",
    choices: ["Une stratégie pour restaurer rapidement services et données après une panne majeure", "Un antivirus cloud spécifique", "Un type de VPN", "Un synonyme exact d'auto-scaling"],
    correctIndex: 0,
    explanation: "Inclut typiquement des sauvegardes régulières testées, et une infrastructure de secours (parfois dans une autre région) prête à prendre le relais.",
  },
  {
    key: "dockerfile-cmd-entrypoint",
    category: "CLOUD",
    prompt: "Quelle est une différence clé entre `CMD` et `ENTRYPOINT` dans un Dockerfile ?",
    choices: ["Ce sont des synonymes stricts", "`ENTRYPOINT` définit la commande principale, difficile à surcharger ; `CMD` fournit des arguments par défaut plus facilement remplaçables au lancement", "`CMD` ne fonctionne qu'en environnement de développement", "`ENTRYPOINT` supprime automatiquement le conteneur après usage"],
    correctIndex: 1,
    explanation: "On combine souvent les deux : `ENTRYPOINT` fixe le programme à exécuter, `CMD` fournit ses arguments par défaut, que l'utilisateur peut remplacer facilement au lancement.",
  },
  {
    key: "edge-computing-def",
    category: "CLOUD",
    prompt: "Qu'est-ce que l''edge computing' ?",
    choices: ["Traiter les données au plus près de leur source (capteur, utilisateur) plutôt que de tout envoyer à un data center central", "Un synonyme exact de cloud computing classique", "Un type de base de données spécifique", "Un protocole de chiffrement particulier"],
    correctIndex: 0,
    explanation: "Réduit la latence et la bande passante nécessaire en traitant une partie des données localement, avant (ou sans) remontée vers un serveur central.",
  },
  {
    key: "vendor-lock-in-def",
    category: "CLOUD",
    prompt: "Qu'est-ce que le 'vendor lock-in' dans le cloud ?",
    choices: ["Un type de pare-feu spécifique", "La difficulté (technique ou financière) à changer de fournisseur cloud une fois fortement dépendant de ses services propriétaires", "Un synonyme exact de multi-cloud", "Une fonctionnalité de sécurité standard"],
    correctIndex: 1,
    explanation: "Utiliser massivement des services propriétaires spécifiques à un fournisseur facilite le développement à court terme, mais complique une éventuelle migration future.",
  },
];

/**
 * Défis CTF (Phase 8) — rédigés à la main, résolubles sans cible en direct.
 * Catégorie WEB : analyse statique d'un artefact donné (en-têtes HTTP, cookie,
 * JWT décodé, extrait de robots.txt) — jamais une vraie requête réseau ni une
 * vraie application vulnérable à attaquer, ce qui nécessiterait une
 * infrastructure de sandbox qu'on n'a pas. Toujours pas de Pwn/Network/
 * Reverse : ces catégories nécessitent une vraie cible en direct — les
 * simuler sans elle serait fabriquer une fausse capacité.
 *
 * `acceptedAnswers` : plusieurs formulations valides acceptées (comparaison
 * normalisée — minuscules, accents retirés, espaces superflus supprimés —
 * voir src/cybersecurity/ctfService.ts).
 */
interface CtfChallengeSeed {
  key: string;
  category: string;
  difficulty: number;
  title: string;
  description: string;
  hint?: string;
  points: number;
  acceptedAnswers: string[];
}

const CTF_CHALLENGES: CtfChallengeSeed[] = [
  {
    key: "caesar-basics",
    category: "CRYPTO",
    difficulty: 1,
    title: "Décalage suspect",
    description:
      "Un message intercepté semble chiffré avec un simple décalage de César (shift +3) :\n\n`qrglib`\n\nDéchiffre-le (un seul mot, en minuscules).",
    hint: "Chaque lettre a été décalée de 3 positions vers l'avant dans l'alphabet (a→d, b→e...). Pour déchiffrer, décale de 3 vers l'arrière.",
    points: 50,
    acceptedAnswers: ["nodify"],
  },
  {
    key: "base64-basics",
    category: "CRYPTO",
    difficulty: 1,
    title: "Encodage familier",
    description:
      "Ce message a été encodé, pas chiffré — la nuance compte. Décode-le :\n\n`Tm9kaWZ5IEFjYWRlbXk=`",
    hint: "Le suffixe `=` et l'alphabet utilisé (lettres, chiffres, +, /) sont typiques d'un encodage très répandu sur le web.",
    points: 50,
    acceptedAnswers: ["nodify academy"],
  },
  {
    key: "osint-oversharing",
    category: "OSINT",
    difficulty: 2,
    title: "Trop d'informations",
    description:
      "Un profil public sur un forum indique : « Je travaille chez Nodify, bureau de Lyon, badge d'accès #482, en poste depuis janvier 2024. »\n\n" +
      "Quel élément précis de ce message pourrait permettre à un attaquant de tenter une usurpation d'identité physique sur le lieu de travail (un seul mot) ?",
    hint: "Pense à ce qui donne un accès physique à un bâtiment.",
    points: 75,
    acceptedAnswers: ["badge", "le badge", "numero de badge", "numéro de badge"],
  },
  {
    key: "forensics-ioc",
    category: "FORENSICS",
    difficulty: 3,
    title: "Signal dans le bruit",
    description:
      "Un log serveur montre une connexion réussie à 03h14 un dimanche, depuis un pays où l'entreprise n'a aucun employé, immédiatement suivie d'un export massif de données.\n\n" +
      "Quel terme générique (acronyme à 3 lettres, en anglais) désigne ce type de signal qui suggère une compromission ?",
    hint: "C'est l'acronyme de « Indicator Of Compromise ».",
    points: 100,
    acceptedAnswers: ["ioc"],
  },
  {
    key: "web-missing-header",
    category: "WEB",
    difficulty: 1,
    title: "En-tête manquant",
    description:
      "Voici les en-têtes de réponse HTTP d'un site qui affiche du contenu généré par les utilisateurs dans des iframes ailleurs sur le web :\n\n" +
      "```\nHTTP/1.1 200 OK\nContent-Type: text/html\nSet-Cookie: session=abc123\n```\n\n" +
      "Un en-tête de sécurité manque, qui permettrait d'empêcher ce site d'être chargé dans une iframe malveillante sur un autre domaine (attaque de clickjacking). Quel est le nom de cet en-tête (en anglais, avec les tirets) ?",
    hint: "Il existe aussi une directive CSP plus moderne (`frame-ancestors`) qui fait la même chose, mais l'en-tête historique dédié à ça a un nom en 3 mots.",
    points: 50,
    acceptedAnswers: ["x-frame-options", "xframeoptions"],
  },
  {
    key: "web-cookie-flag",
    category: "WEB",
    difficulty: 2,
    title: "Cookie mal configuré",
    description:
      "Un site définit son cookie de session ainsi :\n\n" +
      "`Set-Cookie: session=abc123; Path=/; Secure`\n\n" +
      "Un attribut de sécurité important manque : sans lui, un script JavaScript malveillant injecté sur la page (via une faille XSS) pourrait lire ce cookie de session directement. Quel est cet attribut (un seul mot, en anglais) ?",
    hint: "Cet attribut interdit précisément l'accès au cookie depuis JavaScript (`document.cookie`).",
    points: 75,
    acceptedAnswers: ["httponly", "http only", "http-only"],
  },
  {
    key: "web-robots-disclosure",
    category: "WEB",
    difficulty: 1,
    title: "Indiscrétion involontaire",
    description:
      "Le fichier `robots.txt` public d'un site contient :\n\n" +
      "```\nUser-agent: *\nDisallow: /admin-backup-2024/\nDisallow: /images/\n```\n\n" +
      "`robots.txt` est censé décourager les moteurs de recherche d'indexer certains chemins — mais il est public et lisible par n'importe qui, y compris un attaquant. Quel chemin de la liste ci-dessus révèle involontairement l'existence probable d'une sauvegarde sensible (réponds juste par ce chemin, sans le slash de fin) ?",
    hint: "Un des deux chemins a un nom bien plus intéressant pour un attaquant que l'autre.",
    points: 50,
    acceptedAnswers: ["admin-backup-2024", "/admin-backup-2024", "/admin-backup-2024/", "admin-backup-2024/"],
  },
  {
    key: "web-jwt-none-alg",
    category: "WEB",
    difficulty: 3,
    title: "Signature qui n'en est pas une",
    description:
      "L'en-tête décodé d'un JWT intercepté est :\n\n" +
      "`{\"alg\": \"none\", \"typ\": \"JWT\"}`\n\n" +
      "Cette valeur de l'algorithme de signature est historiquement dangereuse : un serveur mal implémenté peut accepter un token avec cette valeur sans jamais vérifier de signature, permettant à quiconque de forger un token arbitraire. Quelle est cette valeur d'algorithme dangereuse (un seul mot, en anglais) ?",
    hint: "C'est littéralement le nom anglais de l'absence de quelque chose.",
    points: 100,
    acceptedAnswers: ["none"],
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

  for (const concept of CONCEPTS) {
    const { aliases, ...data } = concept;
    const saved = await prisma.concept.upsert({
      where: { key: concept.key },
      create: {
        ...data,
        relatedKeys: JSON.stringify(concept.relatedKeys),
        prerequisiteKeys: JSON.stringify(concept.prerequisiteKeys),
      },
      update: {
        ...data,
        relatedKeys: JSON.stringify(concept.relatedKeys),
        prerequisiteKeys: JSON.stringify(concept.prerequisiteKeys),
      },
    });

    for (const alias of aliases) {
      await prisma.conceptAlias.upsert({
        where: { term: alias },
        create: { term: alias, conceptId: saved.id },
        update: { conceptId: saved.id },
      });
    }
  }
  console.log(`✅ ${CONCEPTS.length} concept(s) synchronisé(s)`);

  for (const course of COURSES) {
    const { lessons, prerequisiteCourseKeys, ...courseData } = course;
    const prereqJson = JSON.stringify(prerequisiteCourseKeys ?? []);
    const savedCourse = await prisma.course.upsert({
      where: { key: course.key },
      create: { ...courseData, prerequisiteCourseKeys: prereqJson },
      update: { ...courseData, prerequisiteCourseKeys: prereqJson },
    });

    for (const lesson of lessons) {
      const { questions, ...lessonData } = lesson;
      const savedLesson = await prisma.lesson.upsert({
        where: { courseId_order: { courseId: savedCourse.id, order: lesson.order } },
        create: { ...lessonData, courseId: savedCourse.id },
        update: { ...lessonData },
      });

      for (const question of questions) {
        const { choices, ...questionData } = question;
        await prisma.question.upsert({
          where: { lessonId_order: { lessonId: savedLesson.id, order: question.order } },
          create: { ...questionData, choices: JSON.stringify(choices), lessonId: savedLesson.id },
          update: { ...questionData, choices: JSON.stringify(choices) },
        });
      }
    }
  }
  console.log(`✅ ${COURSES.length} cours synchronisé(s)`);

  for (const chunk of DOC_CHUNKS) {
    await prisma.docChunk.upsert({
      where: { source_title: { source: chunk.source, title: chunk.title } },
      create: chunk,
      update: chunk,
    });
  }
  console.log(`✅ ${DOC_CHUNKS.length} extrait(s) de documentation synchronisé(s)`);

  for (const q of DAILY_QUESTIONS) {
    const { choices, ...data } = q;
    await prisma.dailyQuestion.upsert({
      where: { key: q.key },
      create: { ...data, choices: JSON.stringify(choices) },
      update: { ...data, choices: JSON.stringify(choices) },
    });
  }
  console.log(`✅ ${DAILY_QUESTIONS.length} question(s) du jour synchronisée(s)`);

  for (const challenge of CTF_CHALLENGES) {
    const { acceptedAnswers, ...data } = challenge;
    await prisma.ctfChallenge.upsert({
      where: { key: challenge.key },
      create: { ...data, acceptedAnswers: JSON.stringify(acceptedAnswers) },
      update: { ...data, acceptedAnswers: JSON.stringify(acceptedAnswers) },
    });
  }
  console.log(`✅ ${CTF_CHALLENGES.length} défi(s) CTF synchronisé(s)`);
}

main()
  .catch((error) => {
    console.error("❌ Échec du seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
