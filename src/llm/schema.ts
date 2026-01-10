import { z } from "zod";

export const summaryItemSchema = z.object({
  text: z.string(),
  sourceIndex: z.number().int(),
});

export type SummaryItem = z.infer<typeof summaryItemSchema>;

export const summarySchema = z.object({
  one_liner: z.string(),
  economy: z.array(summaryItemSchema),
  stock_market: z.array(summaryItemSchema),
  real_estate_kr: z.array(summaryItemSchema),
  social_global: z.array(summaryItemSchema),
  sector_focus: z.array(summaryItemSchema),
  tomorrow_watchlist: z.array(summaryItemSchema),
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
      economy: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "sourceIndex"],
          properties: {
            text: { type: "string" },
            sourceIndex: { type: "integer", minimum: 1 },
          },
        },
      },
      stock_market: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "sourceIndex"],
          properties: {
            text: { type: "string" },
            sourceIndex: { type: "integer", minimum: 1 },
          },
        },
      },
      real_estate_kr: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "sourceIndex"],
          properties: {
            text: { type: "string" },
            sourceIndex: { type: "integer", minimum: 1 },
          },
        },
      },
      social_global: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "sourceIndex"],
          properties: {
            text: { type: "string" },
            sourceIndex: { type: "integer", minimum: 1 },
          },
        },
      },
      sector_focus: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "sourceIndex"],
          properties: {
            text: { type: "string" },
            sourceIndex: { type: "integer", minimum: 1 },
          },
        },
      },
      tomorrow_watchlist: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "sourceIndex"],
          properties: {
            text: { type: "string" },
            sourceIndex: { type: "integer", minimum: 1 },
          },
        },
      },
    },
  },
  strict: true,
} as const;
