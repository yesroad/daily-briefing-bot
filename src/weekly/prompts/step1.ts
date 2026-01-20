import type { Article } from "../../rss/index.js";

function trimToMax(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildWeeklyEconomySelectionInput(articles: Article[]): string {
  const lines = articles.map((article, index) => {
    const title = trimToMax(article.title, 140);
    const summary = trimToMax(article.summary, 220);
    return `${index + 1}. ${title} — ${summary}`;
  });

  return [
    "다음은 최근 7일 경제 뉴스 요약 목록입니다.",
    "각 항목은 제목(최대 140자)과 1줄 요약(최대 220자)만 포함합니다.",
    "",
    "역할: 주간 대표 기사 선별/요약 (근거 보존)",
    "",
    "지침 (매우 중요):",
    "- 반드시 지정된 JSON 스키마로만 응답하세요. 설명이나 부연 텍스트는 금지합니다.",
    "- URL, 매체명, 출처, 링크는 절대 포함하지 마세요.",
    "- items는 6~10개로 제한합니다.",
    "- 각 item은 입력 기사 목록 중 하나와 1:1로 연결되어야 하며 sourceIndex를 반드시 포함해야 합니다.",
    "- sourceIndex는 입력 번호(1~N) 정수이며, item당 하나만 허용합니다.",
    "- 여러 기사를 종합한 문장, sourceIndex 누락, 범위 밖 숫자는 금지합니다.",
    "- 입력 요약에서 벗어난 사실 추가/재해석은 금지합니다.",
    "",
    "작성 원칙:",
    "- title은 반드시 다음 형식으로만 작성: \"YYYY년 M월 N주차 경제 이슈 요약\"",
    "- 콜론(:), '요약:', '주간 경제 요약' 같은 접두어는 금지합니다.",
    "- title은 20자 내외로 유지하고 불필요한 수식어는 쓰지 마세요.",
    "- 각 item의 title은 50자 이내, summary는 1문장 120자 내외로 작성하세요.",
    "- 요약은 '근거 보존'이 목적이며, 해석보다는 사실과 직접적 의미만 유지하세요.",
    "",
    "출력 형식:",
    "- items 배열 요소는 {\"title\":\"...\",\"summary\":\"...\",\"sourceIndex\":1} 형태로만 작성하세요.",
    "",
    lines.join("\n"),
  ].join("\n");
}
