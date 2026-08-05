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

  // Cybersecurity (suite)
  { key: "red-team-fundamentals", name: "Red Team Fundamentals", category: "CYBERSECURITY" },
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
];

/**
 * Défis CTF (Phase 8) — rédigés à la main, résolubles sans cible en direct
 * (crypto/forensics/OSINT uniquement). Pas de Web/Pwn/Network/Reverse : ces
 * catégories nécessiteraient une vraie infrastructure de sandbox qu'on n'a
 * pas — les simuler serait fabriquer une fausse capacité.
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
