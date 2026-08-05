import { AI_ERROR_CODES, type AiErrorCode } from "./types.js";

/**
 * Classifie une erreur de provider IA en un code structuré, plutôt que de
 * laisser l'AI Control Center deviner en cherchant des mots-clés dans un
 * message brut. Duck-typé volontairement (pas d'import des classes d'erreur
 * spécifiques à chaque SDK Gemini/Anthropic/Groq) : chaque SDK expose un
 * `.status` HTTP et/ou un `.name` suffisamment proches (429/401/403,
 * "...Abort...Error"/"...Timeout...Error") pour être reconnus sans coupler
 * ce fichier à une implémentation de provider précise — un nouveau provider
 * n'oblige pas à toucher ce classifieur.
 */
export interface ClassifiedAiError {
  code: AiErrorCode;
  message: string;
}

function safeMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function classifyProviderError(error: unknown): ClassifiedAiError {
  const message = safeMessage(error).slice(0, 500); // jamais de log/API key dans un message trop long
  const name = error instanceof Error ? error.name : "";
  const status = (error as { status?: number } | undefined)?.status;

  if (/abort|timeout|timed out/i.test(name) || /timed out|timeout/i.test(message)) {
    return { code: "TIMEOUT", message };
  }

  if (status === 429 || /quota|rate.?limit|too many requests/i.test(message)) {
    return { code: "QUOTA", message };
  }

  if (status === 401 || status === 403 || /api key|unauthorized|invalid.*key|permission denied/i.test(message)) {
    return { code: "INVALID_KEY", message };
  }

  if (
    /connection|network/i.test(name) ||
    /network|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|fetch failed/i.test(message)
  ) {
    return { code: "NETWORK", message };
  }

  return { code: "PROVIDER_ERROR", message };
}

/** Garde-fou dev : s'assure qu'un code retourné est bien un des codes déclarés. */
export function isKnownAiErrorCode(code: string): code is AiErrorCode {
  return (AI_ERROR_CODES as readonly string[]).includes(code);
}
