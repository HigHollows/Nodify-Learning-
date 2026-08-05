/**
 * Erreurs applicatives typées.
 *
 * But : distinguer une erreur "attendue" (l'utilisateur a mal utilisé une
 * commande, permission manquante, ressource introuvable...) d'un vrai bug.
 * Les AppError sont affichées proprement à l'utilisateur ; tout le reste
 * est loggé comme un bug et remonte un message générique.
 */
export class AppError extends Error {
  /** Message sûr à afficher directement à l'utilisateur Discord. */
  public readonly userMessage: string;
  public readonly isOperational = true;

  constructor(userMessage: string, internalMessage?: string) {
    super(internalMessage ?? userMessage);
    this.name = this.constructor.name;
    this.userMessage = userMessage;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** L'utilisateur n'a pas la permission d'exécuter cette action. */
export class PermissionError extends AppError {
  constructor(userMessage = "Tu n'as pas la permission d'utiliser cette commande.") {
    super(userMessage);
  }
}

/** Entrée utilisateur invalide (mauvais format, valeur hors limites...). */
export class ValidationError extends AppError {
  constructor(userMessage: string) {
    super(userMessage);
  }
}

/** Ressource attendue introuvable (concept, cours, profil...). */
export class NotFoundError extends AppError {
  constructor(userMessage: string) {
    super(userMessage);
  }
}

/**
 * L'IA est temporairement indisponible (fermée par un admin, en maintenance,
 * ou en panne réelle). Portée par une classe dédiée (pas juste un AppError
 * générique) pour que le handler d'interactions puisse afficher un embed de
 * statut IA stylé plutôt qu'un simple message d'erreur — voir interactionCreate.ts.
 */
export class AIUnavailableError extends AppError {
  constructor(
    public readonly mode: string,
    reason?: string,
  ) {
    super(
      reason
        ? `L'IA de Nodify est indisponible pour l'instant : ${reason}`
        : "L'IA de Nodify est indisponible pour l'instant — réessaie plus tard.",
    );
  }
}

/**
 * Solde de crédits insuffisant pour une fonctionnalité IA. Porte les
 * montants (requis/actuel) pour construire un embed qui guide l'utilisateur
 * (récompenses disponibles) plutôt qu'un simple texte d'erreur.
 */
export class InsufficientCreditsError extends AppError {
  constructor(
    public readonly required: number,
    public readonly current: number,
  ) {
    super(`Il te faut ${required} crédits pour ça, tu en as ${current}.`);
  }
}
