import type { Article } from "./index.js";

const EXCLUDE_KEYWORDS = [
  "스포츠",
  "연예",
  "감독",
  "경기",
  "승리",
  "선수",
  "사망",
  "화재",
  "추락",
  "간판",
  "MOU",
  "협약",
  "봉사",
  "기부",
  "행사",
  "축제",
  "홍보",
  "캠페인",
  "사회공헌",
  "후원",
];

const EXCLUDE_PATTERNS = [
  /연예|배우|가수|아이돌|유튜버|인플루언서/,
  /개인|자서전|북\s?콘서트|미담|선행|봉사/,
  /축제|행사|MOU|협약|지자체|구청|시청|군청|도청/,
  /사회공헌|기부|후원|캠페인|CSR|ESG\s?활동/,
  /사고|재해|사건|화재|붕괴|지진|태풍|홍수|폭설/,
  /스포츠|감독|경기|승리|선수/,
];

const RISK_KEYWORDS = [
  "지정학",
  "제재",
  "전쟁",
  "유가",
  "환율",
  "금리",
  "물가",
];

const INCLUDE_KEYWORDS = [
  "금리",
  "물가",
  "인플레이션",
  "환율",
  "정책",
  "규제",
  "세제",
  "수급",
  "리스크",
  "지표",
  "경기",
  "GDP",
  "고용",
  "실업",
  "채권",
  "주식",
  "증시",
  "코스피",
  "코스닥",
  "나스닥",
  "실적",
  "가이던스",
  "공급",
  "수요",
  "부동산",
  "집값",
  "주택",
  "대출",
  "금융",
  "유가",
  "제재",
  "전쟁",
  "지정학",
];

function hasRiskKeyword(text: string): boolean {
  return RISK_KEYWORDS.some((keyword) => text.includes(keyword));
}

function isExcluded(text: string): boolean {
  if (EXCLUDE_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return true;
  }
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(text));
}

function isRelevant(text: string): boolean {
  return INCLUDE_KEYWORDS.some((keyword) => text.includes(keyword));
}

function isMaterialImpact(text: string): boolean {
  return (
    /전국|전국적|전국민|전국구/.test(text) ||
    /수도권|서울|부산|대구|인천|광주|대전|울산/.test(text)
  );
}

export function isMarketRelevant(article: Article): boolean {
  const text = `${article.title} ${article.summary}`;

  if (hasRiskKeyword(text)) {
    return true;
  }

  if (isExcluded(text)) {
    return false;
  }

  if (!isRelevant(text)) {
    return false;
  }

  if (/지역|지방|시군구/.test(text) && !isMaterialImpact(text)) {
    return false;
  }

  return true;
}
