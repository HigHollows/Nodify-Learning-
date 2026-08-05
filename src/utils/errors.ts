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
