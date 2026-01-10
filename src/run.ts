import "dotenv/config";
import { sendSummaryEmail } from "./email.js";
import { generateDailySummary } from "./llm/index.js";
import { fetchRssArticles, selectRepresentativeArticles } from "./rss/index.js";

console.log("Daily Briefing Bot started");

try {
  let summary;

  if (process.env.SUMMARY_JSON) {
    console.log("Using SUMMARY_JSON from environment...");
    summary = await generateDailySummary([]);
  } else {
    console.log("Fetching RSS feeds...");
    const articles = await fetchRssArticles();

    const maxItems = Number(process.env.RSS_MAX_ITEMS ?? 12);
    const pickedCount = Number.isNaN(maxItems) ? 12 : maxItems;
    const selected = selectRepresentativeArticles(articles, pickedCount);

    console.log(
      `Selected ${selected.length} representative articles out of ${articles.length}`
    );
    summary = await generateDailySummary(selected);
  }

  console.log("Sending email...");
  const result = await sendSummaryEmail(summary);

  console.log(`Email sent successfully: ${result.messageId}`);
} catch (error) {
  console.error("Daily Briefing Bot failed:", error);
  process.exit(1);
}
