import type { FetchedArticle } from "./newsService.js";
import { baseContainer, bannerContainer, containerPayload, EmbedColors, messageViewPayload, textDisplay, type ContainerPayload, type MessageViewPayload } from "../ui/container.js";

const COLOR_BLUE = 0x3498db;

/** Titre cliquable (`.setURL()` sur l'ancien embed) émulé en Markdown — Components V2 n'a pas d'équivalent natif "URL de titre". */
export function buildNewsPost(article: FetchedArticle): MessageViewPayload {
  const container = bannerContainer(`## [📰 ${article.title}](${article.url})`, COLOR_BLUE);
  container.addTextDisplayComponents(textDisplay(`-# Source : ${article.source}`));

  return messageViewPayload(container);
}

export function buildRecentNewsReply(articles: { source: string; title: string; url: string }[]): ContainerPayload {
  const container = baseContainer("📰 Hacktualités récentes", EmbedColors.neutral).addTextDisplayComponents(
    textDisplay(
      articles.length === 0
        ? "Aucune actu diffusée pour l'instant. Les sources sont vérifiées régulièrement (Node.js, GitHub, Cloudflare)."
        : articles.map((a) => `**[${a.title}](${a.url})** — ${a.source}`).join("\n\n"),
    ),
  );

  return containerPayload(container);
}
