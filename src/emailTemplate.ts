import type { DailySummary, SummaryItem } from "./llm/schema.js";
import type { Article } from "./rss/index.js";

type SectionConfig = {
  key: keyof DailySummary;
  title: string;
};

const SECTION_CONFIGS: SectionConfig[] = [
  { key: "economy", title: "경제" },
  { key: "stock_market", title: "증시" },
  { key: "real_estate_kr", title: "부동산(한국)" },
  { key: "social_global", title: "글로벌" },
  { key: "sector_focus", title: "섹터" },
  { key: "tomorrow_watchlist", title: "내일 체크 포인트" },
];

function normalizeSection(items: SummaryItem[] | undefined): SummaryItem[] {
  if (!items) {
    return [];
  }
  return items
    .map((item) => ({ ...item, text: item.text.trim() }))
    .filter((item) => item.text.length > 0);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatKstDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function buildHighlights(briefing: DailySummary): SummaryItem[] {
  const highlights: SummaryItem[] = [];
  const economy = normalizeSection(briefing.economy);
  const stocks = normalizeSection(briefing.stock_market);
  const realEstate = normalizeSection(briefing.real_estate_kr);
  const sector = normalizeSection(briefing.sector_focus);

  if (economy.length > 0) {
    highlights.push(economy[0]);
  }
  if (stocks.length > 0) {
    highlights.push(stocks[0]);
  }
  if (highlights.length < 3) {
    if (realEstate.length > 0) {
      highlights.push(realEstate[0]);
    } else if (sector.length > 0) {
      highlights.push(sector[0]);
    }
  }

  return highlights;
}

function buildLinkedText(item: SummaryItem, articles: Article[]): string {
  const article = articles[item.sourceIndex - 1];
  const link = article?.link;
  const text = escapeHtml(item.text);

  if (!link) {
    return `<span style="color:#0f172a;">${text}</span>`;
  }

  return `<a href="${escapeHtml(
    link
  )}" target="_blank" rel="noopener noreferrer" style="color:#2563eb; text-decoration:none;">${text}</a>`;
}

function renderSectionCard(
  title: string,
  items: SummaryItem[],
  articles: Article[]
): string {
  const listItems = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px 0; padding:0; color:#0f172a; font-size:15px; line-height:1.55;">${buildLinkedText(
          item,
          articles
        )}</li>`
    )
    .join("");

  return `
    <tr>
      <td style="padding:0 0 16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px;">
          <tr>
            <td style="padding:16px 18px 6px 18px; font-family:Arial, Helvetica, sans-serif; color:#0f172a; font-size:16px; font-weight:700;">
              ${escapeHtml(title)}
            </td>
          </tr>
          <tr>
            <td style="padding:0 18px 16px 18px; font-family:Arial, Helvetica, sans-serif;">
              <ul style="margin:0; padding:0 0 0 18px;">
                ${listItems}
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export function renderBriefingHtml(
  briefing: DailySummary,
  subject: string,
  articles: Article[]
): string {
  const dateLabel = formatKstDate(new Date());
  const highlights = buildHighlights(briefing);
  const sectionCards = SECTION_CONFIGS.map((section) => {
    const items = normalizeSection(briefing[section.key]);
    if (section.key === "tomorrow_watchlist") {
      const safeItems =
        items.length > 0
          ? items
          : [{ text: "내일 체크 포인트 없음", sourceIndex: 0 }];
      return renderSectionCard(section.title, safeItems, articles);
    }
    if (section.key === "social_global") {
      const safeItems =
        items.length > 0
          ? items
          : [{ text: "오늘 영향 큰 이슈 없음", sourceIndex: 0 }];
      return renderSectionCard(section.title, safeItems, articles);
    }
    if (items.length === 0) {
      return "";
    }
    return renderSectionCard(section.title, items, articles);
  }).join("");

  const highlightBlock =
    highlights.length > 0
      ? `
                      <tr>
                        <td style="padding:0 18px 16px 18px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
                            <tr>
                              <td style="padding:10px 12px 4px 12px; font-family:Arial, Helvetica, sans-serif; color:#0f172a; font-size:13px; font-weight:700;">
                                오늘 핵심 3개
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 12px 12px 12px; font-family:Arial, Helvetica, sans-serif;">
                                <ol style="margin:0; padding:0 0 0 18px;">
                                  ${highlights
                                    .map(
                                      (item) =>
                                        `<li style="margin:0 0 6px 0; color:#334155; font-size:14px; line-height:1.5;">${escapeHtml(
                                          item.text
                                        )}</li>`
                                    )
                                    .join("")}
                                </ol>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                `
      : "";

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%; max-width:640px;">
            <tr>
              <td style="padding:0 0 20px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px 6px 18px; font-family:Arial, Helvetica, sans-serif; color:#6b7280; font-size:12px; letter-spacing:0.2px;">
                      ${escapeHtml(dateLabel)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 12px 18px; font-family:Arial, Helvetica, sans-serif; color:#111827; font-size:18px; font-weight:700;">
                      ${escapeHtml(subject)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 16px 18px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827; border-radius:10px;">
                        <tr>
                          <td style="padding:12px 14px; font-family:Arial, Helvetica, sans-serif; color:#ffffff; font-size:15px; line-height:1.55; font-weight:600;">
                            ${escapeHtml(briefing.one_liner)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${highlightBlock}
                </table>
              </td>
            </tr>
            ${sectionCards}
            <tr>
              <td style="padding:4px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:#6b7280; font-size:12px; line-height:1.5; text-align:center;">
                이 메일은 자동 발송된 데일리 브리핑입니다.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function renderBriefingText(
  briefing: DailySummary,
  subject: string
): string {
  const lines: string[] = [];
  const highlights = buildHighlights(briefing);
  lines.push(subject);
  lines.push("");
  lines.push(`오늘 한 줄 요약`);
  lines.push(`- ${briefing.one_liner.trim()}`);
  lines.push("");

  if (highlights.length > 0) {
    lines.push("오늘 핵심 3개");
    highlights.forEach((item) => {
      lines.push(`- ${item.text}`);
    });
    lines.push("");
  }

  SECTION_CONFIGS.forEach((section) => {
    const items = normalizeSection(briefing[section.key]);
    if (section.key === "tomorrow_watchlist") {
      lines.push(section.title);
      if (items.length === 0) {
        lines.push("- 내일 체크 포인트 없음");
      } else {
        items.forEach((item) => {
          lines.push(`- ${item.text}`);
        });
      }
      lines.push("");
      return;
    }
    if (section.key === "social_global") {
      lines.push(section.title);
      if (items.length === 0) {
        lines.push("- 오늘 영향 큰 이슈 없음");
      } else {
        items.forEach((item) => {
          lines.push(`- ${item.text}`);
        });
      }
      lines.push("");
      return;
    }
    if (items.length === 0) {
      return;
    }
    lines.push(section.title);
    items.forEach((item) => {
      lines.push(`- ${item.text}`);
    });
    lines.push("");
  });

  return lines.join("\n").trimEnd();
}
