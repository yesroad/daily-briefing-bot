function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildWeeklyEconomyPost(params: {
  title: string;
  contentHtml: string;
  references: Array<{ title: string; url: string }>;
}): { title: string; content: string } {
  const parts: string[] = [params.contentHtml.trim()];

  if (params.references.length > 0) {
    const items = params.references
      .map(
        (ref) =>
          `  <li><a href="${escapeHtml(ref.url)}">${escapeHtml(ref.title)}</a></li>`
      )
      .join("\n");
    parts.push(
      ["<h2>참고 링크</h2>", "<ul>", items, "</ul>"].join("\n")
    );
  }

  return {
    title: params.title.trim(),
    content: parts.join("\n\n"),
  };
}
