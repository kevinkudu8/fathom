// SERVER-ONLY. This module imports the Anthropic SDK and reads ANTHROPIC_API_KEY.
// Never import it into a client component (CLAUDE.md constraint #1). Only the
// route handler at app/api/books/route.ts touches this.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Book, BooksResult } from "./types";
import { slugify } from "./slug";

// Quality matters more than cost here. Cheaper/faster swap: "claude-haiku-4-5".
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a well-read librarian building a five-book reading path on a single subject for someone starting from zero.

Rules:
- Recommend exactly 5 REAL, verifiable books — established, well-known titles with the correct author and approximate publication year. Do NOT invent titles, authors, or years. If you are not confident a book genuinely exists, do not include it.
- If the topic is too vague, empty, or nonsensical to build a real path (e.g. random characters, not an actual subject), do NOT guess. Instead return the "error" field with a short friendly message and an empty "books" array.
- The five books are an ORDERED learning path. Book 1 (rank 1) is the best entry point: accessible, gripping, the one to start with — set "startHere": true on it and false on the rest. Later books go deeper.
- Do NOT pick five books that agree. Where the field genuinely argues with itself, include the strongest dissenting or contrasting view, so the reader ends up understanding where the subject contests itself — not just one camp's take.
- Each "oneLiner" is 12–18 words: what THIS book gives the reader / why it earns its place on the path. Sharp and specific. Never a back-cover blurb, never the phrase "a must-read".
- "angle" is an optional short tag (2–5 words) like "the foundation", "the dissent", "the modern synthesis".
- Prefer books that have stood the test of time over this season's releases, unless the topic is genuinely current.

Respond with STRICT JSON ONLY — no prose, no markdown, no code fences. Exactly this shape:
{
  "topic": "<the subject, nicely capitalized>",
  "intro": "<one sentence framing the path, under 20 words>",
  "error": null,
  "books": [
    { "rank": 1, "title": "...", "author": "...", "year": 1776, "startHere": true, "oneLiner": "...", "angle": "the foundation" }
  ]
}

If you cannot build a real path, respond instead with:
{ "topic": "<the input>", "intro": "", "error": "<short friendly message>", "books": [] }`;

// In-memory cache, keyed by slug. Same slug => same five books, instantly and for
// free. Lives for the lifetime of the server process (per serverless instance on
// Vercel). Upgrade path: swap this Map for Vercel KV if cross-instance/persistent
// caching is needed.
const cache = new Map<string, BooksResult>();

/** Strip ```json fences / stray prose and return the JSON substring. */
function extractJson(raw: string): string {
  let s = raw.trim();
  // Remove a leading ```json or ``` fence and a trailing ``` fence if present.
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  // Fall back to the outermost { ... } if the model added any wrapper text.
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return s.trim();
}

/** Coerce/validate one book; returns null if it's missing required fields. */
function normalizeBook(raw: unknown, index: number): Book | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const author = typeof b.author === "string" ? b.author.trim() : "";
  const oneLiner = typeof b.oneLiner === "string" ? b.oneLiner.trim() : "";
  if (!title || !author || !oneLiner) return null;
  const yearNum = Number(b.year);
  return {
    rank: typeof b.rank === "number" ? b.rank : index + 1,
    title,
    author,
    year: Number.isFinite(yearNum) ? yearNum : null,
    startHere: b.startHere === true || index === 0,
    oneLiner,
    angle: typeof b.angle === "string" && b.angle.trim() ? b.angle.trim() : undefined,
  };
}

function friendlyError(topic: string, message: string): BooksResult {
  return { topic, intro: "", error: message, books: [] };
}

/**
 * Build (or fetch from cache) the five-book reading path for a topic.
 * Always resolves to a BooksResult — never throws to the caller. On any failure
 * (bad key, network, malformed model output) it returns a clean error state.
 */
export async function generateBooks(topic: string): Promise<BooksResult> {
  const slug = slugify(topic);
  if (!slug) {
    return friendlyError(topic, "Type a real subject and I'll build you a path.");
  }

  const cached = cache.get(slug);
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Don't cache config errors — they should resolve once the key is set.
    return friendlyError(topic, "The server is missing its API key. Set ANTHROPIC_API_KEY.");
  }

  let result: BooksResult;
  try {
    const client = new Anthropic({ apiKey });
    // web_search tool intentionally NOT enabled — model knowledge + the
    // "real books only" rule keeps this fast and cheap. (Plan decision.)
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Subject: ${topic}` }],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    const parsed = JSON.parse(extractJson(text)) as Record<string, unknown>;

    // Model self-reported it couldn't build a real path.
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      result = friendlyError(
        typeof parsed.topic === "string" && parsed.topic.trim() ? parsed.topic.trim() : topic,
        parsed.error.trim(),
      );
    } else {
      const rawBooks = Array.isArray(parsed.books) ? parsed.books : [];
      const books = rawBooks
        .map((b, i) => normalizeBook(b, i))
        .filter((b): b is Book => b !== null)
        .slice(0, 5)
        .map((b, i) => ({ ...b, rank: i + 1, startHere: i === 0 }));

      if (books.length < 5) {
        // Defensive: if we couldn't get five solid books, show the error state
        // rather than a half-built path. Don't cache — a retry may do better.
        return friendlyError(
          topic,
          "I couldn't build a confident five-book path for that. Try a real subject.",
        );
      }

      result = {
        topic:
          typeof parsed.topic === "string" && parsed.topic.trim()
            ? parsed.topic.trim()
            : topic,
        intro: typeof parsed.intro === "string" ? parsed.intro.trim() : "",
        error: null,
        books,
      };
    }
  } catch (err) {
    console.error("[fathom] generateBooks failed:", err);
    // Never crash the client — fall back to a clean error state. Don't cache.
    return friendlyError(
      topic,
      "Something went wrong building that path. Give it another try.",
    );
  }

  cache.set(slug, result);
  return result;
}
