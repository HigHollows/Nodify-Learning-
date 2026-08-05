import Groq from "groq-sdk";
import type { AIProvider, CompletionRequest } from "../types.js";

/**
 * Groq héberge des modèles ouverts (Llama, etc.) avec une inférence très
 * rapide. API compatible OpenAI (chat.completions.create), donc le SDK
 * officiel groq-sdk suffit — pas besoin de réimplémenter un client HTTP.
 */
export class GroqProvider implements AIProvider {
  readonly name = "groq";
  private readonly client: Groq;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async complete(request: CompletionRequest): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_completion_tokens: request.maxTokens ?? 600,
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.user },
      ],
    });

    return (
      response.choices[0]?.message?.content ??
      "Je n'ai pas réussi à générer de réponse cette fois-ci."
    );
  }
}
