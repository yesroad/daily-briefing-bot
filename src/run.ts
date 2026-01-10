import "dotenv/config";
import { sendSummaryEmail } from "./email.js";
import { summarizeArticles } from "./llm/summarize.js";
import { fetchRssArticles, selectRepresentativeArticles } from "./rss/index.js";

console.log("Daily Briefing Bot started");

try {
  console.log("Fetching RSS feeds...");
  const articles = await fetchRssArticles();
  const selected = selectRepresentativeArticles(articles, 10, 15);

  console.log(
    `Selected ${selected.length} representative articles out of ${articles.length}`
  );

  console.log("Generating LLM summary...");
  const summary = await summarizeArticles(selected);

  console.log("Sending email...");
  const result = await sendSummaryEmail(summary);

  console.log(`Email sent successfully: ${result.messageId}`);
} catch (error) {
  console.error("Daily Briefing Bot failed:", error);
  process.exit(1);
}
