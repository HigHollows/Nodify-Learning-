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
}

main()
  .catch((error) => {
    console.error("❌ Échec du seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
