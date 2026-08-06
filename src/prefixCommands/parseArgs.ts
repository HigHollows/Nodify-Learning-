import { ValidationError } from "../utils/errors.js";

/**
 * Format des commandes + : `+<commande> [<sous-commande>] [cle:valeur ...]`,
 * ex: `+credit-admin give utilisateur:@Tristan montant:100 raison:"Participation au CTF"`.
 * Choix délibéré de coller au vocabulaire des slash commands existantes
 * (mêmes noms d'option en français) plutôt que d'inventer une syntaxe
 * positionnelle — familier pour quelqu'un qui connaît déjà `/credit-admin`.
 */
export interface ParsedPrefixArgs {
  subcommand: string | null;
  options: Record<string, string>;
}

/**
 * Découpe une chaîne en tokens, en traitant `cle:"valeur avec espaces"`
 * comme un seul token (les guillemets sont retirés, le contenu entre eux
 * n'est jamais coupé sur un espace).
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    while (i < n && /\s/.test(input[i]!)) i++;
    if (i >= n) break;

    let token = "";
    while (i < n && !/\s/.test(input[i]!)) {
      if (input[i] === '"') {
        i++; // saute le guillemet ouvrant
        while (i < n && input[i] !== '"') {
          token += input[i];
          i++;
        }
        i++; // saute le guillemet fermant (ou fin de chaîne si jamais refermé)
      } else {
        token += input[i];
        i++;
      }
    }
    tokens.push(token);
  }

  return tokens;
}

/** `tokens` = tout ce qui suit le nom de la commande (déjà retiré par l'appelant). */
export function parsePrefixArgs(tokens: string[]): ParsedPrefixArgs {
  let subcommand: string | null = null;
  let startIndex = 0;

  if (tokens.length > 0 && !tokens[0]!.includes(":")) {
    subcommand = tokens[0]!.toLowerCase();
    startIndex = 1;
  }

  const options: Record<string, string> = {};
  for (let i = startIndex; i < tokens.length; i++) {
    const token = tokens[i]!;
    const colonIndex = token.indexOf(":");
    if (colonIndex === -1) continue; // token mal formé, ignoré plutôt que de planter toute la commande
    const key = token.slice(0, colonIndex).toLowerCase();
    const value = token.slice(colonIndex + 1);
    if (key) options[key] = value;
  }

  return { subcommand, options };
}

export function getStringOption(args: ParsedPrefixArgs, key: string): string | null {
  return args.options[key] ?? null;
}

export function getRequiredStringOption(args: ParsedPrefixArgs, key: string): string {
  const value = args.options[key];
  if (!value) throw new ValidationError(`Option manquante : \`${key}:...\``);
  return value;
}

export function getIntOption(
  args: ParsedPrefixArgs,
  key: string,
  bounds?: { min?: number; max?: number },
): number | null {
  const raw = args.options[key];
  if (raw === undefined) return null;

  const value = Number(raw);
  if (!Number.isInteger(value)) throw new ValidationError(`\`${key}\` doit être un nombre entier (reçu "${raw}").`);
  if (bounds?.min !== undefined && value < bounds.min) {
    throw new ValidationError(`\`${key}\` doit être supérieur ou égal à ${bounds.min}.`);
  }
  if (bounds?.max !== undefined && value > bounds.max) {
    throw new ValidationError(`\`${key}\` doit être inférieur ou égal à ${bounds.max}.`);
  }
  return value;
}

export function getRequiredIntOption(
  args: ParsedPrefixArgs,
  key: string,
  bounds?: { min?: number; max?: number },
): number {
  const value = getIntOption(args, key, bounds);
  if (value === null) throw new ValidationError(`Option manquante : \`${key}:...\``);
  return value;
}

const TRUE_VALUES = new Set(["true", "vrai", "oui", "yes", "1"]);
const FALSE_VALUES = new Set(["false", "faux", "non", "no", "0"]);

export function getBooleanOption(args: ParsedPrefixArgs, key: string): boolean | null {
  const raw = args.options[key]?.toLowerCase();
  if (raw === undefined) return null;
  if (TRUE_VALUES.has(raw)) return true;
  if (FALSE_VALUES.has(raw)) return false;
  throw new ValidationError(`\`${key}\` doit être true/false (ou oui/non), reçu "${raw}".`);
}

export function getRequiredBooleanOption(args: ParsedPrefixArgs, key: string): boolean {
  const value = getBooleanOption(args, key);
  if (value === null) throw new ValidationError(`Option manquante : \`${key}:true\` ou \`${key}:false\``);
  return value;
}

export function getChoiceOption<T extends string>(
  args: ParsedPrefixArgs,
  key: string,
  allowed: readonly T[],
): T | null {
  const raw = args.options[key];
  if (raw === undefined) return null;
  if (!allowed.includes(raw as T)) {
    throw new ValidationError(`\`${key}\` doit être l'un de : ${allowed.join(", ")} (reçu "${raw}").`);
  }
  return raw as T;
}

const USER_MENTION_PATTERN = /^<@!?(\d+)>$/;
const CHANNEL_MENTION_PATTERN = /^<#(\d+)>$/;
const RAW_SNOWFLAKE_PATTERN = /^\d{15,25}$/;

/** Accepte une mention Discord (`<@id>`/`<@!id>`) ou un id brut copié-collé. */
export function extractUserId(value: string): string | null {
  const mentionMatch = value.match(USER_MENTION_PATTERN);
  if (mentionMatch) return mentionMatch[1]!;
  return RAW_SNOWFLAKE_PATTERN.test(value) ? value : null;
}

/** Accepte une mention de salon (`<#id>`) ou un id brut copié-collé. */
export function extractChannelId(value: string): string | null {
  const mentionMatch = value.match(CHANNEL_MENTION_PATTERN);
  if (mentionMatch) return mentionMatch[1]!;
  return RAW_SNOWFLAKE_PATTERN.test(value) ? value : null;
}

export function getRequiredUserId(args: ParsedPrefixArgs, key: string): string {
  const raw = getRequiredStringOption(args, key);
  const id = extractUserId(raw);
  if (!id) throw new ValidationError(`\`${key}\` doit être une mention (@utilisateur) ou un id Discord valide.`);
  return id;
}

export function getRequiredChannelId(args: ParsedPrefixArgs, key: string): string {
  const raw = getRequiredStringOption(args, key);
  const id = extractChannelId(raw);
  if (!id) throw new ValidationError(`\`${key}\` doit être une mention de salon (#salon) ou un id Discord valide.`);
  return id;
}
