import { describe, expect, it } from "vitest";
import { pickRoundRobin, type FetchedArticle } from "./newsService.js";

function article(source: string, id: string): FetchedArticle {
  return { guid: `${source}-${id}`, source, title: `Article ${id}`, url: `https://x/${id}` };
}

describe("pickRoundRobin", () => {
  it("alterne entre sources plutôt que de vider la première avant de passer à la suivante", () => {
    const bySource = new Map<string, FetchedArticle[]>([
      ["A", [article("A", "1"), article("A", "2"), article("A", "3")]],
      ["B", [article("B", "1")]],
      ["C", [article("C", "1")]],
    ]);

    const picked = pickRoundRobin(bySource, 3);

    // Round-robin : A, B, C dans cet ordre (pas A, A, A malgré que A ait plus d'articles).
    expect(picked.map((a) => a.source)).toEqual(["A", "B", "C"]);
  });

  it("ne dépasse jamais la limite demandée", () => {
    const bySource = new Map<string, FetchedArticle[]>([
      ["A", [article("A", "1"), article("A", "2")]],
      ["B", [article("B", "1"), article("B", "2")]],
    ]);

    expect(pickRoundRobin(bySource, 2)).toHaveLength(2);
  });

  it("continue avec les sources restantes une fois une source épuisée", () => {
    const bySource = new Map<string, FetchedArticle[]>([
      ["A", [article("A", "1")]],
      ["B", [article("B", "1"), article("B", "2"), article("B", "3")]],
    ]);

    const picked = pickRoundRobin(bySource, 4);

    expect(picked).toHaveLength(4);
    expect(picked.map((a) => a.source)).toEqual(["A", "B", "B", "B"]);
  });

  it("retourne un tableau vide si aucune source n'a d'article", () => {
    expect(pickRoundRobin(new Map(), 5)).toEqual([]);
  });
});
