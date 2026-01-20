import "dotenv/config";
import {
  fetchRssArticlesWithOptions,
  selectRepresentativeArticles,
} from "../rss/index.js";
import {
  selectWeeklyEconomyItems,
  writeWeeklyEconomyContent,
} from "./summarize.js";
import {
  createDraftPost,
  findPostByTitle,
  updateDraftPost,
} from "../wp/client.js";
import { renderWeeklyEconomyPostHtml } from "../wp/template.js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRequiredNumberEnv(name: string): number {
  const value = Number(getRequiredEnv(name));
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number for environment variable: ${name}`);
  }
  return value;
}

function formatWeeklyTitle(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekOfMonth = Math.floor((day - 1) / 7) + 1;
  return `${year}년 ${month}월 ${weekOfMonth}주차 경제 이슈 요약`;
}

function buildLeadParagraph(summaries: string[]): string {
  if (summaries.length >= 2) {
    return `${summaries[0]} ${summaries[1]}`.trim();
  }
  if (summaries.length === 1) {
    return `${summaries[0]} 주요 흐름을 함께 점검했습니다.`.trim();
  }
  return "이번 주 시장 흐름을 정리했습니다. 주요 변화와 체크포인트를 아래에서 살펴봅니다.";
}

function buildImpactParagraph(summaries: string[]): string {
  if (summaries.length >= 3) {
    return summaries[2];
  }
  if (summaries.length >= 1) {
    return summaries[0];
  }
  return "이번 주 이슈가 시장 심리에 남긴 흔적을 정리했습니다.";
}

function ensureMinCount(
  items: string[],
  min: number,
  label: string
): string[] {
  if (items.length < min) {
    throw new Error(`Not enough items for ${label}: ${items.length}`);
  }
  return items;
}

function buildReferenceLinks(
  items: { title: string; sourceIndex: number }[],
  articles: {
    link?: string;
    canonicalUrl?: string;
  }[]
): Array<{ title: string; url: string }> {
  const refs: Array<{ title: string; url: string }> = [];
  const seen = new Set<string>();

  for (const item of items) {
    const article = articles[item.sourceIndex - 1];
    if (!article) {
      continue;
    }
    const url = article.canonicalUrl ?? article.link;
    if (!url || seen.has(url)) {
      continue;
    }
    seen.add(url);
    refs.push({ title: item.title.trim(), url });
    if (refs.length >= 5) {
      break;
    }
  }

  return refs;
}

console.log("주간 경제 브리핑 시작");

try {
  const now = new Date();
  const fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  console.log("주간 경제 RSS 수집 중...");
  const articles = await fetchRssArticlesWithOptions({
    categories: ["economy"],
    fromDate,
    toDate: now,
  });

  if (articles.length === 0) {
    throw new Error("No economy articles found in the last 7 days.");
  }

  const selected = selectRepresentativeArticles(articles, 12, 20);

  console.log(
    `대표 기사 ${selected.length}건 선별 (전체 ${articles.length}건)`
  );

  console.log("주간 요약 생성 (1/2)...");
  const selection = await selectWeeklyEconomyItems(selected);
  console.log(`1차 선별 항목 수: ${selection.items.length}`);

  console.log("주간 요약 생성 (2/2)...");
  const content = await writeWeeklyEconomyContent(selection);
  const trimmedContent = content.trim();
  console.log(`2차 콘텐츠 길이: ${trimmedContent.length}`);
  if (trimmedContent.length < 800) {
    throw new Error(
      `Weekly content too short: ${trimmedContent.length} characters`
    );
  }
  const references = buildReferenceLinks(selection.items, selected);
  const title = formatWeeklyTitle(now);
  const summaries = selection.items
    .map((item) => item.summary.trim())
    .filter((text) => text.length > 0);
  const oneLiner = summaries[0] ?? "";
  const coreBullets = ensureMinCount(summaries.slice(0, 6), 4, "key points");
  let impactBullets = summaries.slice(4, 8);
  impactBullets = ensureMinCount(impactBullets.slice(0, 4), 2, "impact points");
  const nextWeekPoints = ensureMinCount(
    summaries.slice(-3),
    3,
    "outlook points"
  );
  const leadParagraph = buildLeadParagraph(summaries);
  const impactParagraph = buildImpactParagraph(summaries);
  const html = renderWeeklyEconomyPostHtml({
    title,
    dateRange: { start: fromDate, end: now },
    leadParagraph,
    oneLiner,
    keyPoints: coreBullets,
    impactParagraph,
    impactPoints: impactBullets,
    outlookPoints: nextWeekPoints,
    referenceLinks: references,
  });
  const post = {
    title,
    content: html,
  };

  console.log("워드프레스 임시글 업로드 중...");
  const categoryId = getRequiredNumberEnv("WP_CATEGORY_ID");
  const existing = await findPostByTitle(post.title);
  const result = existing
    ? await updateDraftPost({
        id: existing.id,
        title: post.title,
        content: post.content,
        categoryId,
      })
    : await createDraftPost({
        title: post.title,
        content: post.content,
        categoryId,
      });

  if (existing) {
    console.log(
      `워드프레스 임시글 업데이트: id=${result.id}, link=${result.link}`
    );
  } else {
    console.log(
      `워드프레스 임시글 생성: id=${result.id}, link=${result.link}`
    );
  }
} catch (error) {
  console.error("주간 경제 브리핑 실패:", error);
  process.exit(1);
}
