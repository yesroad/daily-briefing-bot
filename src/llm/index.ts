import type { Article } from "../rss/index.js";
import type { DailySummary } from "../summary.js";
import { loadDailySummaryFromEnv } from "../summary.js";

const CATEGORY_RULES: Array<{ label: keyof DailySummary; keywords: string[] }> = [
  { label: "economy", keywords: ["경제", "물가", "금리", "경기", "소비", "수출"] },
  { label: "stockMarket", keywords: ["증시", "주가", "코스피", "코스닥", "나스닥"] },
  { label: "realEstate", keywords: ["부동산", "아파트", "주택", "분양", "전세"] },
  { label: "global", keywords: ["글로벌", "미국", "중국", "유럽", "연준", "Fed"] },
  { label: "sector", keywords: ["반도체", "자동차", "에너지", "바이오", "IT"] },
];

function getOptionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  return Number.isNaN(value) ? fallback : value;
}

function containsKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function buildSection(
  articles: Article[],
  keywords: string[],
  maxItems: number
): string[] {
  const matches = articles.filter((article) =>
    containsKeyword(article.title, keywords)
  );
  return matches.slice(0, maxItems).map((article) => article.title);
}

function fallbackSection(
  label: keyof DailySummary,
  articles: Article[],
  maxItems: number
): string[] {
  const titles = articles.slice(0, maxItems).map((article) => article.title);
  if (titles.length > 0) {
    return titles;
  }
  if (label === "tomorrow") {
    return ["주요 지표 발표 일정과 기업 실적 일정을 확인하세요."];
  }
  return ["관련 주요 뉴스 없음"];
}

export async function generateDailySummary(
  articles: Article[]
): Promise<DailySummary> {
  if (process.env.SUMMARY_JSON) {
    return loadDailySummaryFromEnv();
  }

  const maxItems = getOptionalNumber("RSS_MAX_ITEMS", 12);
  const headline = articles.slice(0, 3).map((article) => article.title).join(" / ");

  const summary: DailySummary = {
    oneLineSummary:
      headline.length > 0
        ? headline
        : "오늘의 시장 관련 주요 뉴스를 모아 전달합니다.",
    economy: [],
    stockMarket: [],
    realEstate: [],
    global: [],
    sector: [],
    tomorrow: [],
  };

  for (const rule of CATEGORY_RULES) {
    const items = buildSection(articles, rule.keywords, 3);
    summary[rule.label] =
      items.length > 0 ? items : fallbackSection(rule.label, articles, 2);
  }

  summary.tomorrow = fallbackSection("tomorrow", articles, 2);

  return summary;
}
