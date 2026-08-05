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
 * résumée par IA sans lien vers l'article original. Toutes vérifiées
 * réellement (vraie requête HTTP, vrais articles retournés) avant ajout.
 */
const FEEDS: { source: string; url: string }[] = [
  { source: "Node.js", url: "https://nodejs.org/en/feed/blog.xml" },
  { source: "GitHub", url: "https://github.blog/feed/" },
  { source: "Cloudflare", url: "https://blog.cloudflare.com/rss/" },
  { source: "Python Insider", url: "https://blog.python.org/feeds/posts/default" },
  { source: "Rust Blog", url: "https://blog.rust-lang.org/feed.xml" },
  { source: "TypeScript", url: "https://devblogs.microsoft.com/typescript/feed/" },
  { source: "Docker", url: "https://www.docker.com/blog/feed/" },
  { source: "Kubernetes", url: "https://kubernetes.io/feed.xml" },
  { source: "GitHub Security Lab", url: "https://github.blog/tag/github-security-lab/feed/" },
  { source: "PostgreSQL", url: "https://www.postgresql.org/news.rss" },
];

/** Nombre max d'articles neufs postés par vérification, pour ne jamais spammer un salon d'un coup. */
const MAX_NEW_ARTICLES_PER_CHECK = 6;
/** Nombre max d'items récupérés par flux à chaque vérification. */
const MAX_ITEMS_PER_FEED = 5;

const parser = new Parser({ timeout: 8000 });

export interface FetchedArticle {
  guid: string;
  source: string;
  title: string;
  url: string;
}

/**
 * Récupère chaque flux, groupé par source (pas une liste plate) : c'est ce
 * qui permet ensuite une sélection équitable (round-robin) plutôt que de
 * favoriser la source qui publie le plus souvent. En parallèle (Promise.allSettled)
 * pour qu'un flux lent ou en panne ne bloque pas les autres.
 */
async function fetchAllFeedsBySource(): Promise<Map<string, FetchedArticle[]>> {
  const bySource = new Map<string, FetchedArticle[]>();

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items ?? []).slice(0, MAX_ITEMS_PER_FEED);
      const articles: FetchedArticle[] = [];

      for (const item of items) {
        const url = item.link;
        const guid = item.guid ?? url;
        if (!url || !guid || !item.title) continue;
        articles.push({ guid, source: feed.source, title: item.title, url });
      }

      return { source: feed.source, articles };
    }),
  );

  for (const [i, result] of results.entries()) {
    if (result.status === "fulfilled") {
      bySource.set(result.value.source, result.value.articles);
    } else {
      log.warn(
        { err: result.reason, source: FEEDS[i]!.source },
        "Échec de récupération d'un flux RSS",
      );
    }
  }

  return bySource;
}

/**
 * Sélectionne au plus `limit` articles en alternant entre sources (round-robin)
 * plutôt que de prendre les premiers dans l'ordre de concaténation — sinon
 * une source qui publie plus souvent que les autres (ex: un blog très actif)
 * monopolise toutes les places à chaque vérification.
 */
export function pickRoundRobin(
  bySource: Map<string, FetchedArticle[]>,
  limit: number,
): FetchedArticle[] {
  const queues = [...bySource.values()].map((articles) => [...articles]);
  const picked: FetchedArticle[] = [];
  let i = 0;

  while (picked.length < limit && queues.some((q) => q.length > 0)) {
    const queue = queues[i % queues.length]!;
    const next = queue.shift();
    if (next) picked.push(next);
    i++;
  }

  return picked;
}

/**
 * À appeler périodiquement (voir index.ts). Idempotent : ne reposte jamais
 * un article déjà diffusé. Au tout premier appel (aucun article jamais
 * enregistré), marque tout l'existant comme "déjà vu" SANS poster — sinon
 * le premier démarrage inonderait les salons avec tout le backlog des flux.
 */
export async function checkAndPostNews(client: Client): Promise<void> {
  const bySource = await fetchAllFeedsBySource();
  const allArticles = [...bySource.values()].flat();
  if (allArticles.length === 0) return;

  const isFirstRun = (await countPostedArticles()) === 0;
  if (isFirstRun) {
    await markArticlesPosted(allArticles);
    log.info(
      { count: allArticles.length },
      "Premier démarrage Hacktualités : backlog marqué comme vu sans être posté",
    );
    return;
  }

  const unseenGuids = new Set(await filterUnseenGuids(allArticles.map((a) => a.guid)));
  if (unseenGuids.size === 0) return;

  const unseenBySource = new Map(
    [...bySource.entries()].map(([source, articles]) => [
      source,
      articles.filter((a) => unseenGuids.has(a.guid)),
    ]),
  );

  const newArticles = pickRoundRobin(unseenBySource, MAX_NEW_ARTICLES_PER_CHECK);
  if (newArticles.length === 0) return;

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
