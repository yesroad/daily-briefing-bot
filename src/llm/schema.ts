import { z } from "zod";

export const summarySchema = z.object({
  one_liner: z.string(),
  economy: z.array(z.string()),
  stock_market: z.array(z.string()),
  real_estate_kr: z.array(z.string()),
  social_global: z.array(z.string()),
  sector_focus: z.array(z.string()),
  tomorrow_watchlist: z.array(z.string()),
});

export type DailySummary = z.infer<typeof summarySchema>;

export const SUMMARY_JSON_SCHEMA = {
  name: "daily_briefing_summary",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "one_liner",
      "economy",
      "stock_market",
      "real_estate_kr",
      "social_global",
      "sector_focus",
      "tomorrow_watchlist",
    ],
    properties: {
      one_liner: { type: "string" },
      economy: { type: "array", items: { type: "string" } },
      stock_market: { type: "array", items: { type: "string" } },
      real_estate_kr: { type: "array", items: { type: "string" } },
      social_global: { type: "array", items: { type: "string" } },
      sector_focus: { type: "array", items: { type: "string" } },
      tomorrow_watchlist: { type: "array", items: { type: "string" } },
    },
  },
  strict: true,
} as const;
