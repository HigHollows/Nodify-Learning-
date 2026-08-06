import type { ReviewConcept } from "./spacedRepetitionService.js";
import { baseContainer, containerPayload, fieldText, textDisplay, type ContainerPayload } from "../ui/container.js";

const COLOR_PURPLE = 0x9b59b6;

export function buildReviewReply(concepts: ReviewConcept[]): ContainerPayload {
  if (concepts.length === 0) {
    return containerPayload(
      baseContainer("🔁 Révision", COLOR_PURPLE).addTextDisplayComponents(
        textDisplay(
          "Rien à réviser pour l'instant — soit tu n'as pas encore consulté de concept via `/dictionary`, " +
            "soit tout ce que tu as vu est encore trop récent (moins de 3 jours). Reviens plus tard !",
        ),
      ),
    );
  }

  const container = baseContainer("🔁 Révision espacée", COLOR_PURPLE).addTextDisplayComponents(
    textDisplay("Quelques concepts que tu avais déjà consultés — un rappel rapide pour les ancrer durablement."),
  );

  container.addTextDisplayComponents(
    textDisplay(concepts.map((c) => fieldText(c.name, `${c.definition}\n-# \`/dictionary terme:${c.key}\` pour le détail complet`)).join("\n\n")),
  );

  return containerPayload(container);
}
