import OpenAI from "openai";
import type { Article } from "../rss/index.js";
import { buildWeeklyEconomySelectionInput } from "./prompts/step1.js";
import { buildWeeklyEconomyArticleInput } from "./prompts/step2.js";
import {
  WEEKLY_SELECTION_JSON_SCHEMA,
  weeklySelectionSchema,
} from "./schema.js";
import type { WeeklySelection, WeeklySelectionItem } from "./schema.js";

const DEFAULT_MODEL = "gpt-4o-mini";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function extractText(response: OpenAI.Responses.Response): string {
  if (response.output_text) {
    return response.output_text;
  }

  for (const output of response.output ?? []) {
    if (output.type === "message") {
      for (const content of output.content ?? []) {
        if (content.type === "output_text") {
          return content.text;
        }
      }
    }
  }

  throw new Error("LLM response does not contain output_text.");
}

function sanitizeItems(items: WeeklySelectionItem[], maxIndex: number) {
  const seen = new Set<number>();
  return items.filter((item) => {
    const title = item.title.trim();
    const summary = item.summary.trim();
    if (!title || !summary) {
      return false;
    }
    if (!Number.isInteger(item.sourceIndex)) {
      return false;
    }
    if (item.sourceIndex < 1 || item.sourceIndex > maxIndex) {
      return false;
    }
    if (seen.has(item.sourceIndex)) {
      return false;
    }
    seen.add(item.sourceIndex);
    return true;
  });
}

function sanitizeSelection(
  selection: WeeklySelection,
  maxIndex: number
): WeeklySelection {
  const items = sanitizeItems(selection.items, maxIndex);
  if (items.length < 6) {
    throw new Error(
      `Weekly selection too short after validation: ${items.length}`
    );
  }
  return {
    ...selection,
    title: selection.title.trim(),
    items: items.slice(0, 10),
  };
}

export async function selectWeeklyEconomyItems(
  articles: Article[]
): Promise<WeeklySelection> {
  const apiKey = getRequiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const input = buildWeeklyEconomySelectionInput(articles);

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    input,
    text: {
      format: {
        type: "json_schema",
        name: WEEKLY_SELECTION_JSON_SCHEMA.name,
        schema: WEEKLY_SELECTION_JSON_SCHEMA.schema,
        strict: WEEKLY_SELECTION_JSON_SCHEMA.strict,
      },
    },
  });

  const rawText = extractText(response);
  const parsed = weeklySelectionSchema.safeParse(JSON.parse(rawText));
  if (!parsed.success) {
    throw new Error(`LLM summary validation failed: ${parsed.error.message}`);
  }
  return sanitizeSelection(parsed.data, articles.length);
}

export async function writeWeeklyEconomyContent(
  selection: WeeklySelection
): Promise<string> {
  const apiKey = getRequiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const input = buildWeeklyEconomyArticleInput(selection);

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    input,
  });

  return extractText(response).trim();
}

export async function summarizeWeeklyEconomy(articles: Article[]): Promise<{
  title: string;
  content: string;
  items: WeeklySelectionItem[];
}> {
  const selection = await selectWeeklyEconomyItems(articles);
  const content = await writeWeeklyEconomyContent(selection);
  return {
    title: selection.title,
    content,
    items: selection.items,
  };
}
