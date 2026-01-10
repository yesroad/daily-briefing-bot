import nodemailer from "nodemailer";
import { renderBriefingHtml, renderBriefingText } from "./emailTemplate.js";
import type { DailySummary } from "./llm/schema.js";
import type { Article } from "./rss/index.js";

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

export async function sendSummaryEmail(
  summary: DailySummary,
  articles: Article[]
): Promise<MailResult> {
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

  const dateLabel = formatKstDate(new Date());
  const subject = `[데일리 브리핑] ${dateLabel} 시장 요약`;
  const text = renderBriefingText(summary, subject);
  const html = renderBriefingHtml(summary, subject);

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return { messageId: info.messageId ?? "" };
  } catch (error) {
    throw new Error(`Email send failed: ${(error as Error).message}`);
  }
}
