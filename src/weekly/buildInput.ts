import type { Article } from "../rss/index.js";

function trimToMax(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildWeeklyEconomyInput(articles: Article[]): string {
  const lines = articles.map((article, index) => {
    const title = trimToMax(article.title, 140);
    const summary = trimToMax(article.summary, 220);
    return `${index + 1}. ${title} — ${summary}`;
  });

  return [
    "다음은 최근 7일 경제 뉴스 요약 목록입니다.",
    "각 항목은 제목(최대 140자)과 1줄 요약(최대 220자)만 포함합니다.",
    "",
    "지침 (매우 중요):",
    "- 반드시 지정된 JSON 스키마로만 응답하세요. 설명이나 부연 텍스트는 금지합니다.",
    "- URL, 매체명, 출처, 링크는 절대 포함하지 마세요.",
    "- 각 문장은 입력 기사 목록 중 하나와 1:1로 연결되어야 하며 sourceIndex를 반드시 포함해야 합니다.",
    "- sourceIndex는 입력 번호(1~N) 정수이며, 문장당 하나만 허용합니다.",
    "- 여러 기사를 종합한 문장, sourceIndex 누락, 범위 밖 숫자는 금지합니다.",
    "",
    "작성 원칙:",
    "- title은 '주간 경제 요약'을 포함하고, 40자 이내로 작성하세요.",
    "- intro는 2문장 이내로 주간 흐름을 요약합니다.",
    "- key_points는 4~6문장, risks는 2~4문장, outlook은 1~3문장으로 작성하세요.",
    "- 모든 문장은 경제·금리·물가·환율·정책·경기 흐름 중 하나와 직접 연결하세요.",
    "- 과도한 해석, 일반론, 2단계 이상의 추론은 금지합니다.",
    "- 각 문장은 90자 내외의 문장형 불릿으로 작성하세요.",
    "",
    "절대 포함하지 말 것:",
    "- 개인·연예인·단일 사례",
    "- 사고·재해·사건 (자산 가격에 직접적 영향이 없는 경우)",
    "- 지자체 행사, MOU, 홍보성·사회공헌 뉴스",
    "- 지역 이슈 (전국 또는 주요 시장에 영향이 없는 경우)",
    "",
    "출력 형식:",
    "- key_points/risks/outlook 배열 요소는 {\"text\":\"문장\",\"sourceIndex\":1} 형태로만 작성하세요.",
    "",
    lines.join("\n"),
  ].join("\n");
}
