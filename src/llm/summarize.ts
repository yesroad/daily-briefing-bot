import OpenAI from "openai";
import type { Article } from "../rss/index.js";
import { buildSummaryInput } from "./buildInput.js";
import { SUMMARY_JSON_SCHEMA, summarySchema } from "./schema.js";

const DEFAULT_MODEL = "gpt-4o-mini";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function extractJsonText(response: OpenAI.Responses.Response): string {
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

export async function summarizeArticles(articles: Article[]) {
  const apiKey = getRequiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const input = buildSummaryInput(articles);

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    input,
    response_format: {
      type: "json_schema",
      json_schema: SUMMARY_JSON_SCHEMA,
    },
  });

  const rawText = extractJsonText(response);
  const parsed = summarySchema.safeParse(JSON.parse(rawText));
  if (!parsed.success) {
    throw new Error(`LLM summary validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
}
