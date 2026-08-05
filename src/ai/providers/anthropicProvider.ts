import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ExplainRequest } from "../types.js";

const SYSTEM_PROMPT =
  "Tu es Nodify, un mentor technique pédagogue pour développeurs sur Discord. " +
  "Explique le concept demandé de façon claire et concise (150 mots maximum), " +
  "en français. Adapte le vocabulaire au niveau indiqué : pour un débutant, " +
  "utilise des analogies simples et évite le jargon non expliqué ; pour un " +
  "niveau avancé, va droit aux détails techniques précis. Ne fabrique jamais " +
  "d'information — si tu n'es pas sûr, dis-le.";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async explainConcept(request: ExplainRequest): Promise<string> {
    const userPrompt = [
      `Explique le concept suivant : "${request.term}".`,
      `Niveau de l'utilisateur : ${request.levelHint}.`,
      request.context ? `Contexte connu du dictionnaire Nodify : ${request.context}` : null,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock && "text" in textBlock
      ? textBlock.text
      : "Je n'ai pas réussi à générer d'explication cette fois-ci.";
  }
}
