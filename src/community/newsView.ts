import { EmbedBuilder } from "discord.js";
import type { FetchedArticle } from "./newsService.js";

export function buildNewsPost(article: FetchedArticle) {
  const embed = new EmbedBuilder()
    .setTitle(`📰 ${article.title}`)
    .setColor("Blue")
    .setURL(article.url)
    .setFooter({ text: `Source : ${article.source}` });

  return { embeds: [embed] };
}

export function buildRecentNewsReply(
  articles: { source: string; title: string; url: string }[],
) {
  const embed = new EmbedBuilder().setTitle("📰 Hacktualités récentes").setColor("Blue");

  if (articles.length === 0) {
    embed.setDescription(
      "Aucune actu diffusée pour l'instant. Les sources sont vérifiées régulièrement (Node.js, GitHub, Cloudflare).",
    );
  } else {
    embed.setDescription(
      articles.map((a) => `**[${a.title}](${a.url})** — ${a.source}`).join("\n\n"),
    );
  }

  return { embeds: [embed] };
}
