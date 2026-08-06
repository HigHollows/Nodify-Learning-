import type { SkillCategory } from "../types/skill.js";

/**
 * Banc de questions du test de positionnement (`/placement`) — statique en
 * code, pas en base : contrairement au dictionnaire/CTF/exercices, ce n'est
 * pas du contenu à faire grandir au fil du temps mais un instrument de
 * mesure fixe, volontairement stable pour que le résultat reste comparable
 * dans le temps. 3 questions par catégorie, difficulté croissante (1, 3, 5)
 * — un utilisateur qui rate la difficulté 1 d'une catégorie n'a pas besoin
 * qu'on lui pose la 5 pour savoir qu'il débute dans ce domaine.
 */
export interface PlacementQuestion {
  id: number;
  category: SkillCategory;
  difficulty: number; // 1 à 5
  prompt: string;
  choices: string[];
  correctIndex: number;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // --- DEVELOPMENT ---
  {
    id: 1,
    category: "DEVELOPMENT",
    difficulty: 1,
    prompt: "En JavaScript, quelle instruction déclare une variable dont la valeur ne peut plus être réassignée ?",
    choices: ["var x = 1;", "const x = 1;", "let x = 1;", "static x = 1;"],
    correctIndex: 1,
  },
  {
    id: 2,
    category: "DEVELOPMENT",
    difficulty: 3,
    prompt: "Qu'est-ce qu'une closure en JavaScript ?",
    choices: [
      "Une méthode pour fermer une connexion réseau",
      "Une fonction qui garde accès aux variables de son scope englobant, même après que ce scope a fini de s'exécuter",
      "Un type de boucle infinie",
      "Une balise HTML",
    ],
    correctIndex: 1,
  },
  {
    id: 3,
    category: "DEVELOPMENT",
    difficulty: 5,
    prompt: "Pourquoi `Promise.allSettled()` est-il préférable à `Promise.all()` quand on veut connaître le résultat de CHAQUE promesse, succès ou échec ?",
    choices: [
      "allSettled est simplement plus rapide",
      "Promise.all() rejette globalement dès la première promesse rejetée ; allSettled attend toutes les promesses et rapporte le résultat individuel de chacune",
      "allSettled ne peut traiter qu'une seule promesse à la fois",
      "Il n'y a aucune différence réelle entre les deux",
    ],
    correctIndex: 1,
  },
  // --- CYBERSECURITY ---
  {
    id: 4,
    category: "CYBERSECURITY",
    difficulty: 1,
    prompt: "Que signifie l'acronyme 2FA ?",
    choices: ["Two-Factor Authentication", "Fast File Access", "Firewall Access Filter", "Two-Factor Application"],
    correctIndex: 0,
  },
  {
    id: 5,
    category: "CYBERSECURITY",
    difficulty: 3,
    prompt: "Qu'est-ce qu'une injection SQL ?",
    choices: [
      "Un virus qui infecte uniquement les bases de données",
      "Une entrée utilisateur concaténée directement dans une requête SQL, permettant à un attaquant de modifier la requête exécutée",
      "Une technique légitime d'optimisation de base de données",
      "Un protocole de chiffrement",
    ],
    correctIndex: 1,
  },
  {
    id: 6,
    category: "CYBERSECURITY",
    difficulty: 5,
    prompt: "Pourquoi bcrypt/Argon2 sont-ils préférés à un simple SHA-256 pour hasher des mots de passe ?",
    choices: [
      "Ils produisent des hashs plus courts",
      "Leur lenteur intentionnelle ralentit une attaque par force brute, contrairement à un hash rapide qui facilite les attaques massives",
      "SHA-256 ne peut pas hasher de texte",
      "Ils ne nécessitent pas de sel",
    ],
    correctIndex: 1,
  },
  // --- NETWORKING ---
  {
    id: 7,
    category: "NETWORKING",
    difficulty: 1,
    prompt: "Que fait le DNS ?",
    choices: [
      "Il chiffre le trafic web",
      "Il traduit un nom de domaine (ex: nodify.app) en adresse IP",
      "Il accélère le téléchargement de fichiers",
      "Il bloque les publicités",
    ],
    correctIndex: 1,
  },
  {
    id: 8,
    category: "NETWORKING",
    difficulty: 3,
    prompt: "Quelle est la différence principale entre TCP et UDP ?",
    choices: [
      "Ce sont des synonymes",
      "TCP garantit la livraison ordonnée et fiable des paquets ; UDP est plus rapide mais sans garantie de livraison ni d'ordre",
      "UDP ne fonctionne que sur les réseaux locaux",
      "TCP est toujours plus rapide qu'UDP",
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    category: "NETWORKING",
    difficulty: 5,
    prompt: "Pourquoi ARP est-il vulnérable au spoofing par nature ?",
    choices: [
      "Il est chiffré mais mal implémenté",
      "Il n'inclut aucun mécanisme d'authentification natif — n'importe quelle machine du réseau local peut annoncer une association IP-MAC sans vérification",
      "Il ne fonctionne que sur des réseaux sans fil",
      "ARP a été remplacé partout par un protocole plus récent",
    ],
    correctIndex: 1,
  },
  // --- AI ---
  {
    id: 10,
    category: "AI",
    difficulty: 1,
    prompt: "Que signifie l'acronyme LLM ?",
    choices: ["Large Language Model", "Local Learning Machine", "Linked List Method", "Long Loop Memory"],
    correctIndex: 0,
  },
  {
    id: 11,
    category: "AI",
    difficulty: 3,
    prompt: "Qu'est-ce qu'une hallucination dans le contexte des LLM ?",
    choices: [
      "Un bug qui fait planter le modèle",
      "Une réponse plausible mais factuellement fausse, générée avec la même confiance apparente qu'une réponse correcte",
      "Un mode spécial d'entraînement",
      "Une fonctionnalité créative activable volontairement",
    ],
    correctIndex: 1,
  },
  {
    id: 12,
    category: "AI",
    difficulty: 5,
    prompt: "Dans un système RAG, à quel moment les documents pertinents sont-ils récupérés ?",
    choices: [
      "Pendant l'entraînement initial du modèle, une fois pour toutes",
      "Au moment de chaque question utilisateur, avant de générer la réponse",
      "Après que le modèle ait déjà répondu, pour vérifier a posteriori",
      "Les documents ne sont jamais récupérés dans un flux RAG",
    ],
    correctIndex: 1,
  },
  // --- SYSTEMS ---
  {
    id: 13,
    category: "SYSTEMS",
    difficulty: 1,
    prompt: "Sur Linux, quelle commande liste le contenu d'un dossier ?",
    choices: ["ls", "dir /list", "show", "cat"],
    correctIndex: 0,
  },
  {
    id: 14,
    category: "SYSTEMS",
    difficulty: 3,
    prompt: "Que fait la commande `chmod +x script.sh` ?",
    choices: [
      "Elle supprime le fichier",
      "Elle rend le fichier exécutable",
      "Elle le chiffre",
      "Elle le renomme",
    ],
    correctIndex: 1,
  },
  {
    id: 15,
    category: "SYSTEMS",
    difficulty: 5,
    prompt: "Que fait précisément le bit SUID sur un exécutable Linux ?",
    choices: [
      "Il chiffre automatiquement le fichier",
      "Il fait exécuter le programme avec les privilèges de son PROPRIÉTAIRE, peu importe qui le lance",
      "Il empêche toute exécution du fichier",
      "Il rend le fichier invisible dans `ls`",
    ],
    correctIndex: 1,
  },
  // --- CLOUD ---
  {
    id: 16,
    category: "CLOUD",
    difficulty: 1,
    prompt: "Que fait la commande `docker run` ?",
    choices: [
      "Elle construit une image Docker",
      "Elle crée et démarre un conteneur à partir d'une image",
      "Elle supprime tous les conteneurs",
      "Elle liste les images disponibles",
    ],
    correctIndex: 1,
  },
  {
    id: 17,
    category: "CLOUD",
    difficulty: 3,
    prompt: "Quelle est la différence entre scaling horizontal et vertical ?",
    choices: [
      "Ce sont des synonymes",
      "Le vertical augmente la puissance d'une seule machine ; l'horizontal ajoute davantage de machines qui se partagent la charge",
      "L'horizontal ne fonctionne que pour les bases de données",
      "Le vertical est toujours moins cher",
    ],
    correctIndex: 1,
  },
  {
    id: 18,
    category: "CLOUD",
    difficulty: 5,
    prompt: "Pourquoi une rolling update Kubernetes remplace-t-elle les pods progressivement plutôt que tous en même temps ?",
    choices: [
      "Pour économiser de la bande passante réseau",
      "Pour éviter une interruption de service complète — le service reste disponible via les pods pas encore remplacés pendant la transition",
      "Parce que Kubernetes ne peut techniquement gérer qu'un pod à la fois",
      "Ça n'a aucun impact sur la disponibilité du service",
    ],
    correctIndex: 1,
  },
];
