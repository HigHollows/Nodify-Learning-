import { Prisma } from "@prisma/client";
import { prisma } from "../client.js";

export async function countPostedArticles(): Promise<number> {
  return prisma.postedNewsArticle.count();
}

export async function filterUnseenGuids(guids: string[]): Promise<string[]> {
  if (guids.length === 0) return [];
  const seen = await prisma.postedNewsArticle.findMany({
    where: { guid: { in: guids } },
    select: { guid: true },
  });
  const seenSet = new Set(seen.map((s) => s.guid));
  return guids.filter((g) => !seenSet.has(g));
}

/** Idempotent : ignore silencieusement si l'article a déjà été marqué (race entre deux checks). */
export async function markArticlesPosted(
  articles: { guid: string; source: string; title: string; url: string }[],
): Promise<void> {
  for (const article of articles) {
    try {
      await prisma.postedNewsArticle.create({ data: article });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        continue; // déjà marqué, rien à faire
      }
      throw error;
    }
  }
}

export async function listRecentPostedArticles(limit: number) {
  return prisma.postedNewsArticle.findMany({ orderBy: { postedAt: "desc" }, take: limit });
}

export async function listGuildsWithNewsEnabled() {
  return prisma.guildConfig.findMany({ where: { newsEnabled: true } });
}
