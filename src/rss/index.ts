import Parser from "rss-parser";

export type Article = {
  title: string;
  link?: string;
  pubDate?: string;
  source?: string;
};

const parser = new Parser();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getFeedUrls(): string[] {
  const raw = getRequiredEnv("RSS_FEEDS");
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

function toTimestamp(dateValue?: string): number {
  if (!dateValue) {
    return 0;
  }
  const ts = Date.parse(dateValue);
  return Number.isNaN(ts) ? 0 : ts;
}

export async function fetchRssArticles(): Promise<Article[]> {
  const feedUrls = getFeedUrls();
  const feeds = await Promise.all(
    feedUrls.map(async (url) => {
      const feed = await parser.parseURL(url);
      return {
        title: feed.title ?? url,
        items: feed.items ?? [],
      };
    })
  );

  return feeds.flatMap((feed) =>
    feed.items
      .map((item) => ({
        title: item.title?.trim() ?? "",
        link: item.link,
        pubDate: item.isoDate ?? item.pubDate,
        source: feed.title,
      }))
      .filter((item) => item.title.length > 0)
  );
}

export function selectRepresentativeArticles(
  articles: Article[],
  count: number
): Article[] {
  const sorted = [...articles].sort(
    (a, b) => toTimestamp(b.pubDate) - toTimestamp(a.pubDate)
  );
  return sorted.slice(0, count);
}
