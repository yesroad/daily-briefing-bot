import type { WeeklySelection } from "../schema.js";

function trimToMax(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildWeeklyEconomyArticleInput(
  selection: WeeklySelection
): string {
  const lines = selection.items.map((item, index) => {
    const title = trimToMax(item.title, 60);
    const summary = trimToMax(item.summary, 140);
    return `${index + 1}. ${title} — ${summary}`;
  });

  return [
    "역할: 경제 전문 블로그 편집자",
    "목표: 이번 주 흐름을 자연스럽게 정리한 주간 경제 편집본 작성",
    "",
    "작성 지침:",
    "- 아래 요약 목록만 근거로 사용하세요. 외부 지식이나 추가 추정은 금지합니다.",
    "- 보고서처럼 딱딱하지 않게, 읽기 쉬운 칼럼 톤으로 작성하세요.",
    "- 과장된 단정 대신 완화 표현을 사용하세요.",
    "- 뉴스 나열이 아니라 흐름과 연결성 중심으로 정리하세요.",
    "- 3~5개의 소제목(<h2>)과 단락(<p>)을 섞어 구성하세요.",
    "- 필요한 경우 짧은 불릿(<ul><li>)을 포함해도 됩니다.",
    "- 출력은 HTML 본문만 허용합니다. <html>, <body>, Markdown 금지.",
    "- 참고 링크 섹션은 작성하지 마세요.",
    "",
    `제목(참고): ${selection.title}`,
    "",
    "기사 요약 목록:",
    lines.join("\n"),
  ].join("\n");
}
