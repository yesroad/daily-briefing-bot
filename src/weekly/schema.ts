import { z } from "zod";

export const WEEKLY_SELECTION_JSON_SCHEMA = {
  name: "weekly_economy_selection",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "items"],
    properties: {
      title: { type: "string" },
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "summary", "sourceIndex"],
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            sourceIndex: { type: "integer" },
          },
        },
      },
    },
  },
};

const selectionItemSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  sourceIndex: z.number().int(),
});

export const weeklySelectionSchema = z.object({
  title: z.string().min(1),
  items: z.array(selectionItemSchema).min(6).max(10),
});

export type WeeklySelection = z.infer<typeof weeklySelectionSchema>;
export type WeeklySelectionItem = z.infer<typeof selectionItemSchema>;
