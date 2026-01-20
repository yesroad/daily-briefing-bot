import Parser from "rss-parser";
import { isMarketRelevant } from "./filter.js";
import { RSS_SOURCES } from "./sources.js";

export type Article = {
  title: string;
  summary: string;
  link?: string;
  canonicalUrl?: string;
  pubDate?: string;
  source?: string;
  category?: string;
};

export type FetchRssOptions = {
  categories?: string[];
  fromDate?: Date;
  toDate?: Date;
};

const parser = new Parser();

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ref",
  "mc_cid",
  "mc_eid",
];

function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[:"'`~!@#$%^&*()_+\-=[\]{}|\\;,.<>/?]+/g, "")
    .replace(/\s+/g, " ");
}

function canonicalizeUrl(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    const url = new URL(raw);
    url.hash = "";
    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param);
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function trimToMax(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildOneLineSummary(item: Parser.Item): string {
  const raw =
    item.contentSnippet ||
    item.content ||
    item.summary ||
    item.summarySnippet ||
    "";
  const cleaned = stripHtml(raw);
  if (!cleaned) {
    return "요약 정보 없음";
  }
  return trimToMax(cleaned, 220);
}

function toTimestamp(dateValue?: string): number {
  if (!dateValue) {
    return 0;
  }
  const ts = Date.parse(dateValue);
  return Number.isNaN(ts) ? 0 : ts;
}

function dedupeArticles(articles: Article[]): Article[] {
  const map = new Map<string, Article>();

  for (const article of articles) {
    const normalizedTitle = normalizeTitle(article.title);
    const canonicalUrl = article.canonicalUrl ?? "";
    const key = canonicalUrl ? `${normalizedTitle}|${canonicalUrl}` : normalizedTitle;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, article);
      continue;
    }

    const currentTs = toTimestamp(article.pubDate);
    const existingTs = toTimestamp(existing.pubDate);
    if (currentTs > existingTs) {
      map.set(key, article);
    }
  }

  return [...map.values()];
}

export async function fetchRssArticles(): Promise<Article[]> {
  const feeds = await Promise.all(
    RSS_SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return {
        source,
        items: feed.items ?? [],
      };
    })
  );

  const articles = feeds.flatMap(({ source, items }) =>
    items
      .map((item) => ({
        title: item.title?.trim() ?? "",
        summary: buildOneLineSummary(item),
        link: item.link,
        canonicalUrl: canonicalizeUrl(item.link),
        pubDate: item.isoDate ?? item.pubDate,
        source: source.name,
        category: source.category,
      }))
      .filter((item) => item.title.length > 0)
  );

  const filtered = articles.filter((article) => isMarketRelevant(article));

  return dedupeArticles(filtered);
}

function isWithinRange(
  article: Article,
  fromTimestamp?: number,
  toTimestampMs?: number
): boolean {
  if (!fromTimestamp && !toTimestampMs) {
    return true;
  }
  const articleTimestamp = toTimestamp(article.pubDate);
  if (!articleTimestamp) {
    return false;
  }
  if (fromTimestamp && articleTimestamp < fromTimestamp) {
    return false;
  }
  if (toTimestampMs && articleTimestamp > toTimestampMs) {
    return false;
  }
  return true;
}

export async function fetchRssArticlesWithOptions(
  options: FetchRssOptions = {}
): Promise<Article[]> {
  const categories = options.categories;
  const sources = categories?.length
    ? RSS_SOURCES.filter((source) => categories.includes(source.category))
    : RSS_SOURCES;
  const feeds = await Promise.all(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return {
        source,
        items: feed.items ?? [],
      };
    })
  );

  const articles = feeds.flatMap(({ source, items }) =>
    items
      .map((item) => ({
        title: item.title?.trim() ?? "",
        summary: buildOneLineSummary(item),
        link: item.link,
        canonicalUrl: canonicalizeUrl(item.link),
        pubDate: item.isoDate ?? item.pubDate,
        source: source.name,
        category: source.category,
      }))
      .filter((item) => item.title.length > 0)
  );

  const fromTimestamp = options.fromDate?.getTime();
  const toTimestampMs = options.toDate?.getTime();
  const filtered = articles
    .filter((article) => isMarketRelevant(article))
    .filter((article) => isWithinRange(article, fromTimestamp, toTimestampMs));

  return dedupeArticles(filtered);
}

export function selectRepresentativeArticles(
  articles: Article[],
  minCount = 10,
  maxCount = 15
): Article[] {
  const sorted = [...articles].sort(
    (a, b) => toTimestamp(b.pubDate) - toTimestamp(a.pubDate)
  );

  const target = Math.min(maxCount, Math.max(minCount, sorted.length));
  return sorted.slice(0, target);
}
