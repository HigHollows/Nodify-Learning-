import { ChannelType, type Client, type TextChannel } from "discord.js";
import Parser from "rss-parser";
import {
  countPostedArticles,
  filterUnseenGuids,
  listGuildsWithNewsEnabled,
  listRecentPostedArticles,
  markArticlesPosted,
} from "../database/repositories/newsRepository.js";
import { getManagedResources } from "../database/repositories/guildRepository.js";
import { HUB_CATEGORY } from "../setup/resources.js";
import { childLogger } from "../utils/logger.js";
import { buildNewsPost } from "./newsView.js";

const log = childLogger("newsService");
const HUB_CHANNEL_KEY = HUB_CATEGORY.channels[0]!.key;

/**
 * Sources RSS officielles uniquement — jamais d'actualité inventée ou
 * résumée par IA sans lien vers l'article original. Liste volontairement
 * courte au démarrage ; facile à étendre (juste ajouter une entrée ici).
 */
const FEEDS: { source: string; url: string }[] = [
  { source: "Node.js", url: "https://nodejs.org/en/feed/blog.xml" },
  { source: "GitHub", url: "https://github.blog/feed/" },
  { source: "Cloudflare", url: "https://blog.cloudflare.com/rss/" },
];

/** Nombre max d'articles neufs postés par vérification, pour ne jamais spammer un salon d'un coup. */
const MAX_NEW_ARTICLES_PER_CHECK = 3;
/** Nombre max d'items récupérés par flux à chaque vérification. */
const MAX_ITEMS_PER_FEED = 5;

const parser = new Parser();

export interface FetchedArticle {
  guid: string;
  source: string;
  title: string;
  url: string;
}

async function fetchAllFeeds(): Promise<FetchedArticle[]> {
  const results: FetchedArticle[] = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items ?? []).slice(0, MAX_ITEMS_PER_FEED);

      for (const item of items) {
        const url = item.link;
        const guid = item.guid ?? url;
        if (!url || !guid || !item.title) continue;

        results.push({ guid, source: feed.source, title: item.title, url });
      }
    } catch (error) {
      log.warn({ err: error, source: feed.source }, "Échec de récupération d'un flux RSS");
    }
  }

  return results;
}

/**
 * À appeler périodiquement (voir index.ts). Idempotent : ne reposte jamais
 * un article déjà diffusé. Au tout premier appel (aucun article jamais
 * enregistré), marque tout l'existant comme "déjà vu" SANS poster — sinon
 * le premier démarrage inonderait les salons avec tout le backlog des flux.
 */
export async function checkAndPostNews(client: Client): Promise<void> {
  const articles = await fetchAllFeeds();
  if (articles.length === 0) return;

  const isFirstRun = (await countPostedArticles()) === 0;
  if (isFirstRun) {
    await markArticlesPosted(articles);
    log.info(
      { count: articles.length },
      "Premier démarrage Hacktualités : backlog marqué comme vu sans être posté",
    );
    return;
  }

  const unseenGuids = await filterUnseenGuids(articles.map((a) => a.guid));
  if (unseenGuids.length === 0) return;

  const newArticles = articles
    .filter((a) => unseenGuids.includes(a.guid))
    .slice(0, MAX_NEW_ARTICLES_PER_CHECK);

  const configs = await listGuildsWithNewsEnabled();

  for (const config of configs) {
    try {
      const guild = client.guilds.cache.get(config.guildId);
      if (!guild) continue;

      const managed = await getManagedResources(config.guildId);
      const hubChannelId = managed.channels[HUB_CHANNEL_KEY];
      if (!hubChannelId) continue;

      const channel = guild.channels.cache.get(hubChannelId);
      if (!channel || channel.type !== ChannelType.GuildText) continue;

      for (const article of newArticles) {
        await (channel as TextChannel).send(buildNewsPost(article));
      }
    } catch (error) {
      log.warn({ err: error, guildId: config.guildId }, "Échec de publication des actus");
    }
  }

  await markArticlesPosted(newArticles);
  log.info({ count: newArticles.length }, "Actus postées");
}

export async function getRecentNews(limit: number) {
  return listRecentPostedArticles(limit);
}
