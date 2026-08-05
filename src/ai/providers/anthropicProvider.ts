import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, CompletionRequest, CompletionResult } from "../types.js";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: request.maxTokens ?? 600,
        system: request.system,
        messages: [{ role: "user", content: request.user }],
      },
      request.signal ? { signal: request.signal } : undefined,
    );

    const textBlock = response.content.find((block) => block.type === "text");
    const text =
      textBlock && "text" in textBlock ? textBlock.text : "Je n'ai pas réussi à générer de réponse cette fois-ci.";

    return {
      text,
      usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
      model: this.model,
    };
  }
}
