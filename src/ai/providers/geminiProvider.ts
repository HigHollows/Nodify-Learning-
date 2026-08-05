import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, CompletionRequest, CompletionResult } from "../types.js";

/**
 * Provider principal de Nodify. Comme les autres providers, il n'implémente
 * que le contrat générique `complete()` — aucune commande ne connaît
 * l'existence de Gemini spécifiquement.
 */
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey: string, model: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = model;
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: request.system,
    });

    const result = await model.generateContent(
      {
        contents: [{ role: "user", parts: [{ text: request.user }] }],
        generationConfig: { maxOutputTokens: request.maxTokens ?? 600 },
      },
      request.signal ? { signal: request.signal } : undefined,
    );

    const text = result.response.text() || "Je n'ai pas réussi à générer de réponse cette fois-ci.";
    const usageMetadata = result.response.usageMetadata;

    return {
      text,
      ...(usageMetadata
        ? { usage: { inputTokens: usageMetadata.promptTokenCount, outputTokens: usageMetadata.candidatesTokenCount } }
        : {}),
      model: this.modelName,
    };
  }
}
