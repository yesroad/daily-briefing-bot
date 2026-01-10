export type DailySummary = {
  date?: string;
  oneLineSummary: string;
  economy: string[] | string;
  stockMarket: string[] | string;
  realEstate: string[] | string;
  global: string[] | string;
  sector: string[] | string;
  tomorrow: string[] | string;
};

export function loadDailySummaryFromEnv(): DailySummary {
  const raw = process.env.SUMMARY_JSON;
  if (!raw) {
    throw new Error(
      "SUMMARY_JSON is not set. Provide LLM summary JSON or wire the pipeline."
    );
  }

  const parsed = JSON.parse(raw) as DailySummary;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("SUMMARY_JSON is not a valid JSON object.");
  }

  if (!parsed.oneLineSummary) {
    throw new Error("SUMMARY_JSON is missing oneLineSummary.");
  }

  return parsed;
}
