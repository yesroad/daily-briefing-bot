import type { Article } from "../rss/index.js";

function trimToMax(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildSummaryInput(articles: Article[]): string {
  const lines = articles.map((article, index) => {
    const title = trimToMax(article.title, 140);
    const summary = trimToMax(article.summary, 220);
    return `${index + 1}. ${title} — ${summary}`;
  });

  return [
    "다음은 RSS 뉴스 요약 목록입니다.",
    "각 항목은 제목(최대 140자)과 1줄 요약(최대 220자)만 포함합니다.",
    "지침:",
    "- 반드시 지정된 JSON 스키마로만 응답하세요.",
    "- 각 카테고리는 간결한 불릿 스타일 문장(문장형 문자열) 배열로 작성하세요.",
    "- URL은 포함하지 마세요.",
    "",
    lines.join("\n"),
  ].join("\n");
}
