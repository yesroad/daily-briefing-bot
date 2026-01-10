export type RssSource = {
  name: string;
  category: string;
  url: string;
};

const googleNewsUrl = (query: string, lang = "ko", region = "KR"): string => {
  const encoded = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encoded}&hl=${lang}&gl=${region}&ceid=${region}:${lang}`;
};

export const RSS_SOURCES: RssSource[] = [
  {
    name: "Google News - Economy",
    category: "economy",
    url: googleNewsUrl("경제 OR 물가 OR 금리 OR 경기"),
  },
  {
    name: "Google News - Stock Market",
    category: "stock_market",
    url: googleNewsUrl("증시 OR 코스피 OR 코스닥 OR 주가"),
  },
  {
    name: "Google News - Real Estate",
    category: "real_estate_kr",
    url: googleNewsUrl("부동산 OR 아파트 OR 주택 OR 전세"),
  },
  {
    name: "Google News - Global",
    category: "social_global",
    url: googleNewsUrl("글로벌 OR 미국 OR 중국 OR 유럽 OR 연준"),
  },
  {
    name: "Google News - Sector",
    category: "sector_focus",
    url: googleNewsUrl("반도체 OR 자동차 OR 에너지 OR 바이오 OR IT"),
  },
  {
    name: "Yahoo Finance Top Stories",
    category: "social_global",
    url: "https://finance.yahoo.com/news/rssindex",
  },
];
