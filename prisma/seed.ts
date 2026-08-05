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
    const { lessons, ...courseData } = course;
    const savedCourse = await prisma.course.upsert({
      where: { key: course.key },
      create: { ...courseData, prerequisiteCourseKeys: "[]" },
      update: { ...courseData },
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
}

main()
  .catch((error) => {
    console.error("❌ Échec du seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
