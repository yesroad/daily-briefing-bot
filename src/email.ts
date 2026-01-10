import nodemailer from "nodemailer";
import type { DailySummary } from "./llm/schema.js";

type MailResult = {
  messageId: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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

function normalizeSection(items: string[] | string | undefined): string[] {
  if (!items) {
    return [];
  }
  if (Array.isArray(items)) {
    return items.map((item) => item.trim()).filter(Boolean);
  }
  return items
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSection(title: string, items: string[] | string | undefined): string {
  const lines = normalizeSection(items);
  if (lines.length === 0) {
    return `${title}\n- (내용 없음)\n`;
  }
  return `${title}\n${lines.map((line) => `- ${line}`).join("\n")}\n`;
}

export function formatSummaryEmail(summary: DailySummary): { subject: string; text: string } {
  const dateLabel = formatKstDate(new Date());
  const subject = `[데일리 브리핑] ${dateLabel} 시장 요약`;

  const sections = [
    `오늘 한 줄 요약\n- ${summary.one_liner}\n`,
    formatSection("[경제]", summary.economy),
    formatSection("[증시]", summary.stock_market),
    formatSection("[부동산]", summary.real_estate_kr),
    formatSection("[글로벌]", summary.social_global),
    formatSection("[섹터]", summary.sector_focus),
    formatSection("[내일 체크 포인트]", summary.tomorrow_watchlist),
  ];

  return {
    subject,
    text: sections.join("\n").trimEnd(),
  };
}

export async function sendSummaryEmail(summary: DailySummary): Promise<MailResult> {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(getRequiredEnv("SMTP_PORT"));
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");
  const from = getRequiredEnv("SMTP_FROM");
  const to = getRequiredEnv("SMTP_TO");

  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT must be a valid number.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const { subject, text } = formatSummaryEmail(summary);

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
    return { messageId: info.messageId ?? "" };
  } catch (error) {
    throw new Error(`Email send failed: ${(error as Error).message}`);
  }
}
