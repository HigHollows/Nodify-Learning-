import type { SearchResult, SearchResultType } from "./searchService.js";
import { baseContainer, containerPayload, fieldText, textDisplay, type ContainerPayload } from "../ui/container.js";

const COLOR_TEAL = 0x1abc9c;

const TYPE_ICONS: Record<SearchResultType, string> = {
  concept: "📖",
  course: "🎓",
  ctf: "🚩",
  exercise: "🏋️",
};

export function buildSearchReply(query: string, results: SearchResult[]): ContainerPayload {
  if (results.length === 0) {
    return containerPayload(
      baseContainer("🔍 Recherche", COLOR_TEAL).addTextDisplayComponents(
        textDisplay(`Aucun résultat pour « ${query} » — essaie un autre terme, ou une orthographe différente.`),
      ),
    );
  }

  const container = baseContainer("🔍 Résultats pour « " + query + " »", COLOR_TEAL).addTextDisplayComponents(
    textDisplay(
      results
        .map((r) => fieldText(`${TYPE_ICONS[r.type]} ${r.title}`, `${r.subtitle}\n-# \`${r.hint}\``))
        .join("\n\n"),
    ),
  );

  return containerPayload(container);
}
