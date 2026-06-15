# Claude Code prompt — `Fathom`

> Paste everything below the line into Claude Code. Edit the bracketed bits first
> (name, domain, model choice). It's written to be built in one session and deployed to Vercel.

---

Build me a minimal, beautiful web app called **Fathom**.

## What it is and why

Fathom is a companion tool to a YouTube essay about a simple idea: read **five good books on any one subject** and you'll understand it better than ~99% of people you'll ever meet. The video ends by telling viewers to pick a subject and start reading. Fathom is the link in the description — you type any topic, and it hands you a curated five-book reading path to begin with.

It does exactly **one thing**, and does it with taste. No accounts, no clutter, no feature creep.

## The core experience (three states, one continuous motion)

The whole thing should feel like a single mind map that grows. Treat these as one animated surface, not three separate pages.

1. **Landing** — a near-empty, dark canvas with a single pulsing central node and a text input *inside or beside* that node reading something like "What do you want to understand?". A handful of faint, drifting example topic-nodes float in the background (economics, film, money, the brain, war, climate, jazz) connected by thin lines — they're clickable shortcuts and they make the canvas feel alive. Gentle parallax / drift, never busy.

2. **Searching** (the transition — make this genuinely cool) — on submit/Enter, the input collapses into the central node and the typed topic becomes its label. Then **five empty nodes spawn one by one around it**, with thin connecting lines drawing outward (animate SVG `stroke-dashoffset`). While the API call runs, cycle short status lines under the canvas, e.g.: "finding the foundational text…", "looking for the dissenting view…", "ordering the path…", "checking it argues with itself…". When results return, each empty node resolves into a book.

3. **Results** — the five nodes settle into a clean reading list (a vertical column on mobile, the radial map can stay on desktop — your call, prioritize legibility). For each book: **title**, **author + year**, and a single punchy one-liner. Book #1 is visually marked **START HERE**. A short line at the top names the topic and frames the path (1 line max). Quiet "← new topic" link returns to the landing.

## Routing & sharing (important for a video CTA)

- The topic lives in the URL: `/t/economics`, `/t/the-french-revolution`, etc. (slugified). This makes every result page shareable — people will screenshot and share these from the video.
- Hitting a `/t/[topic]` URL directly should run the search and show the loading animation, then results.
- Landing is `/`.

## Tech stack

- **Next.js (App Router) + TypeScript**, deployed to **Vercel**.
- **The Anthropic API key must NEVER touch the client.** Put the call in a server route (`app/api/books/route.ts`) that reads `ANTHROPIC_API_KEY` from an env var. The frontend fetches that route; the key stays server-side.
- Use the official `@anthropic-ai/sdk`.
- Styling: Tailwind. Motion: Framer Motion (or CSS where lighter). SVG for the node/line graph.
- Add a `.env.local.example` and a short README with deploy steps.

## The AI generation (the heart of it)

In the server route, call the Anthropic API (model: **`claude-sonnet-4-6`** for quality — leave a comment that `claude-haiku-4-5` is the cheaper/faster swap). The user's topic is the input. Return **strict JSON only** and parse it safely (strip any code fences, try/catch, return a clean error state on failure).

Use a system prompt along these lines (refine the wording, keep the rules):

> You are a well-read librarian building a five-book reading path on a single subject for someone starting from zero. Rules:
> - Recommend exactly **5 real, verifiable books** — established, well-known titles with the correct author and approximate year. Do NOT invent titles. If the topic is too vague or nonsensical to build a real path, say so via the `error` field instead of guessing.
> - The five are a **learning path**, ordered. Book 1 is the best *entry point*: accessible, gripping, the one to start with. Later books go deeper.
> - **Do not pick five books that agree.** Where the field genuinely argues with itself, include the strongest dissenting or contrasting view, so the reader ends up understanding where the subject contests itself — not just one camp's take.
> - Each one-liner is ~12–18 words: what *this* book gives you / why it's on the path. Sharp and specific, not a back-cover blurb. No "a must-read."
> - Prefer books that have stood the test of time over this season's releases, unless the topic is genuinely current.

Return this exact shape:

```json
{
  "topic": "Economics",
  "intro": "One sentence framing the path.",
  "error": null,
  "books": [
    {
      "rank": 1,
      "title": "...",
      "author": "...",
      "year": 1776,
      "startHere": true,
      "oneLiner": "...",
      "angle": "the foundation / the dissent / the modern synthesis (optional, short)"
    }
  ]
}
```

(If `error` is non-null, the UI shows a friendly "couldn't build a path for that — try a real subject" state instead of books.)

**Optional reliability upgrade:** to reduce any chance of a fabricated title, you may enable the `web_search` tool on the API call so the model can verify books exist. Default to model knowledge + the "real books only" rule if web search adds too much latency. Either way, render each book's title+author as a subtle link that opens a Google Books / bookstore search (`https://www.google.com/search?tbm=bks&q=<title author>`) so the reader can find and verify it.

**Caching:** cache results per slugified topic (even a simple in-memory or edge cache, or Vercel KV if easy) so repeat lookups are instant, consistent, and cheap. Same topic should return the same five books.

## Design direction

Cinematic, literary, minimal — think Obsidian graph view crossed with a quiet film title card. Lots of negative space; the canvas does the work.

- **Mood:** dark by default. Near-black background, one restrained accent color for nodes/lines/the active glow (pick something with a slight warmth, not neon). Generous whitespace.
- **Type:** an elegant serif for book titles and the topic (something with character), a clean mono or grotesque for UI labels, status text, and the "START HERE" tag. Big, confident type sizes.
- **Motion:** slow, deliberate, weighty — nodes drift and settle with easing, lines draw rather than snap, nothing bounces or feels gamey. The transition from search → results is the signature moment; make it smooth.
- **Restraint:** no gradients-for-the-sake-of-it, no stock icons, no shadows everywhere. If in doubt, remove it.
- Fully responsive; must feel right on a phone since most clicks come from a YouTube description on mobile. On narrow screens the radial map can simplify to a clean stacked list while keeping the spawn animation.

## Build order

1. Scaffold Next.js + Tailwind + the env setup and a working `/api/books` route returning mock JSON. Verify the key is server-only.
2. Wire the real Anthropic call with the system prompt and strict JSON parsing + error handling.
3. Build the landing canvas (central node + input + drifting example nodes).
4. Build the search → spawn → results animation as one continuous flow.
5. Results rendering, `/t/[topic]` routing, shareable URLs, verify links.
6. Caching, error/empty states, mobile polish, README + deploy notes.

Keep dependencies minimal. Comment the model choice and the env var clearly. When it's done, give me the exact commands to run it locally and deploy to Vercel, and tell me which env var to set in the Vercel dashboard.
