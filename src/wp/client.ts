type WordPressPostResult = {
  id: number;
  link: string;
};

type WordPressPostSummary = {
  id: number;
  link: string;
  title: { rendered: string };
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildAuthHeader(user: string, appPassword: string): string {
  const token = Buffer.from(`${user}:${appPassword}`).toString("base64");
  return `Basic ${token}`;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function normalizeTitle(title: string): string {
  return decodeHtmlEntities(title).trim();
}

function getWordPressConfig() {
  const baseUrl = getRequiredEnv("WP_BASE_URL").replace(/\/+$/, "");
  const user = getRequiredEnv("WP_USER");
  const appPassword = getRequiredEnv("WP_APP_PASSWORD");
  return { baseUrl, user, appPassword };
}

function parseTagIds(raw?: string): number[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

export async function findPostByTitle(
  title: string
): Promise<WordPressPostSummary | null> {
  const { baseUrl, user, appPassword } = getWordPressConfig();
  const search = encodeURIComponent(title);
  const response = await fetch(
    `${baseUrl}/wp-json/wp/v2/posts?search=${search}&per_page=100`,
    {
      method: "GET",
      headers: {
        Authorization: buildAuthHeader(user, appPassword),
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `WordPress search failed (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as WordPressPostSummary[];
  const targetTitle = normalizeTitle(title);
  return (
    data.find((post) => normalizeTitle(post.title?.rendered ?? "") === targetTitle) ??
    null
  );
}

export async function createDraftPost(params: {
  title: string;
  content: string;
  categoryId: number;
  tagIds?: number[];
}): Promise<WordPressPostResult> {
  const { baseUrl, user, appPassword } = getWordPressConfig();
  const tagIds = params.tagIds?.length
    ? params.tagIds
    : parseTagIds(process.env.WP_TAG_IDS);

  const payload: {
    title: string;
    content: string;
    status: "draft";
    categories: number[];
    tags?: number[];
  } = {
    title: params.title,
    content: params.content,
    status: "draft",
    categories: [params.categoryId],
  };
  if (tagIds.length > 0) {
    payload.tags = tagIds;
  }

  const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(user, appPassword),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `WordPress upload failed (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as {
    id?: number;
    link?: string;
  };

  if (!data.id || !data.link) {
    throw new Error("WordPress response missing id or link.");
  }

  return { id: data.id, link: data.link };
}

export async function updateDraftPost(params: {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  tagIds?: number[];
}): Promise<WordPressPostResult> {
  const { baseUrl, user, appPassword } = getWordPressConfig();
  const tagIds = params.tagIds?.length
    ? params.tagIds
    : parseTagIds(process.env.WP_TAG_IDS);

  const payload: {
    title: string;
    content: string;
    status: "draft";
    categories: number[];
    tags?: number[];
  } = {
    title: params.title,
    content: params.content,
    status: "draft",
    categories: [params.categoryId],
  };
  if (tagIds.length > 0) {
    payload.tags = tagIds;
  }

  const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts/${params.id}`, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(user, appPassword),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `WordPress update failed (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as {
    id?: number;
    link?: string;
  };

  if (!data.id || !data.link) {
    throw new Error("WordPress response missing id or link.");
  }

  return { id: data.id, link: data.link };
}
