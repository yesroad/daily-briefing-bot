type ReferenceLink = {
  title: string;
  url: string;
};

type WeeklyEconomyTemplateParams = {
  title: string;
  dateRange: { start: Date; end: Date };
  leadParagraph: string;
  oneLiner: string;
  keyPoints: string[];
  impactParagraph: string;
  impactPoints: string[];
  outlookPoints: string[];
  referenceLinks: ReferenceLink[];
};

const TEMPLATE_HTML = `<article style="max-width:760px;margin:0 auto;padding:0 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;color:#0f172a;line-height:1.7;">
  <div style="margin-top:18px;margin-bottom:10px;font-size:13px;color:#64748b;">
    <span>{{RANGE}}</span>
  </div>

  <p style="margin:0 0 14px;font-size:16px;color:#334155;">
    {{LEAD}}
  </p>

  <div style="margin:18px 0;padding:14px;border-left:4px solid #2563eb;background:#ffffff;border-radius:10px;border:1px solid #e2e8f0;">
    <div style="font-size:13px;color:#1e3a8a;font-weight:700;margin-bottom:6px;">이번 주 한 줄 요약</div>
    <div style="font-size:15px;color:#0f172a;">{{ONE_LINER}}</div>
  </div>

  <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0;" />

  <h2 style="margin:0 0 10px;font-size:20px;letter-spacing:-0.01em;">이번 주 핵심 흐름</h2>
  <ul style="margin:0 0 14px;padding-left:18px;color:#0f172a;">
    {{KEY_POINTS_LI}}
  </ul>

  <h2 style="margin:20px 0 10px;font-size:20px;letter-spacing:-0.01em;">시장에 미친 영향</h2>
  <p style="margin:0 0 10px;color:#334155;">{{IMPACT_P}}</p>
  <ul style="margin:0 0 14px;padding-left:18px;color:#0f172a;">
    {{IMPACT_LI}}
  </ul>

  <h2 style="margin:20px 0 10px;font-size:20px;letter-spacing:-0.01em;">다음 주 체크포인트</h2>
  <ol style="margin:0 0 16px;padding-left:18px;color:#0f172a;">
    {{OUTLOOK_LI}}
  </ol>

  {{REFERENCES_HTML}}
</article>`;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildListItems(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n");
}

function buildReferencesHtml(links: ReferenceLink[]): string {
  if (links.length === 0) {
    return "";
  }
  const items = links
    .slice(0, 5)
    .map(
      (link) =>
        `<li><a href="${escapeHtml(
          link.url
        )}" style="color:#2563eb;text-decoration:none;">${escapeHtml(
          link.title
        )}</a></li>`
    )
    .join("\n");

  return [
    '<h2 style="margin:20px 0 10px;font-size:16px;color:#334155;">참고 링크</h2>',
    '<ul style="margin:0 0 28px;padding-left:18px;">',
    items,
    "</ul>",
  ].join("\n");
}

export function renderWeeklyEconomyPostHtml(
  params: WeeklyEconomyTemplateParams
): string {
  const range = `${formatDate(params.dateRange.start)} ~ ${formatDate(
    params.dateRange.end
  )}`;
  const referencesHtml = buildReferencesHtml(params.referenceLinks);

  const html = TEMPLATE_HTML.replace("{{RANGE}}", escapeHtml(range))
    .replace("{{LEAD}}", escapeHtml(params.leadParagraph))
    .replace("{{ONE_LINER}}", escapeHtml(params.oneLiner))
    .replace("{{KEY_POINTS_LI}}", buildListItems(params.keyPoints))
    .replace("{{IMPACT_P}}", escapeHtml(params.impactParagraph))
    .replace("{{IMPACT_LI}}", buildListItems(params.impactPoints))
    .replace("{{OUTLOOK_LI}}", buildListItems(params.outlookPoints))
    .replace("{{REFERENCES_HTML}}", referencesHtml);

  if (html.includes("{{")) {
    throw new Error("Weekly HTML template has unresolved tokens.");
  }

  return html;
}
