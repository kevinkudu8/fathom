// Topic <-> slug helpers. The slug is the single source of identity for a reading
// path: it lives in the URL (/t/the-french-revolution), keys the cache, and is
// shared between client and server so the same topic always resolves the same way.

/** "The French Revolution" -> "the-french-revolution" */
export function slugify(topic: string): string {
  return topic
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphens
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 80);
}

/** "the-french-revolution" -> "the french revolution" (a readable topic label) */
export function deslugify(slug: string): string {
  return decodeURIComponent(slug).replace(/-+/g, " ").trim();
}
