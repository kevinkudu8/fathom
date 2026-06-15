# Fathom

A minimal web tool: type any subject, get a curated **five-book reading path** to start with.
Companion to a YouTube essay ("read five books on one subject and you'll understand it
better than ~99% of people"). The link lives in the video description, so most traffic is
mobile and arrives expecting one clean, shareable result.

It does **one thing** with taste. No accounts, no clutter, no feature creep.

> Full kickoff spec + build order: `docs/BUILD_PROMPT.md`. This file is the standing
> context — conventions and guardrails that hold across every session.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind for styling, Framer Motion for the signature motion, SVG for the node graph
- `@anthropic-ai/sdk` for book generation, called only from server routes
- Deployed to Vercel

## Commands

- `npm run dev` — local dev (http://localhost:3000)
- `npm run build` / `npm start` — production build
- `npm run lint` — lint before considering work done

## Architecture

- `app/page.tsx` — landing: mind-map canvas + topic input
- `app/t/[topic]/page.tsx` — results, keyed off a slugified topic in the URL (shareable)
- `app/api/books/route.ts` — server route that calls Anthropic and returns the five books
- Topic flows through the URL as a slug (`/t/the-french-revolution`); same slug = same result

## Critical constraints (do not violate)

1. **The Anthropic API key is server-side only.** Every Anthropic call goes through
   `app/api/*`. Never import the SDK into a client component, never expose
   `ANTHROPIC_API_KEY` to the browser, never give it a `NEXT_PUBLIC_` prefix.
2. **Real books only.** The model must recommend verifiable, well-known titles with correct
   author and year. Never ship invented titles. For vague/nonsense topics, return the
   `error` field instead of guessing. Render a Google Books verify-link per title.
3. **Parse model output defensively.** Strip code fences, `try/catch`, and fall back to a
   clean error state — never crash on malformed JSON.
4. **Keep dependencies minimal.** Don't add a library where a few lines do.
5. **Never commit secrets.** `.env.local` stays out of git. Copy `.env.local.example`.

## Book-generation contract

Model: **`claude-sonnet-4-6`** (quality matters more than cost here; `claude-haiku-4-5`
is the cheaper/faster swap — leave it as a one-line comment).

The system prompt must enforce:
- Exactly **5 real books**, ordered as a learning path. Book 1 = best *entry point*
  (accessible, gripping); later books go deeper.
- **Five that argue, not five that agree** — where a field contests itself, include the
  strongest dissenting view so the reader learns where the subject disagrees with itself.
- One-liner per book: ~12–18 words on what *this* book gives you / why it's on the path.
  Sharp and specific, never back-cover blurb, never "a must-read."
- Prefer books that have stood the test of time over this season's releases (unless the
  topic is genuinely current).

Response is **strict JSON only**, this shape:

```json
{
  "topic": "Economics",
  "intro": "One-sentence framing of the path.",
  "error": null,
  "books": [
    { "rank": 1, "title": "...", "author": "...", "year": 1776,
      "startHere": true, "oneLiner": "...", "angle": "the foundation (optional, short)" }
  ]
}
```

If `error` is non-null, the UI shows a friendly "couldn't build a path for that" state.
Cache results per slugified topic so repeats are instant, consistent, and cheap.

## Design principles

Cinematic, literary, minimal — Obsidian graph view crossed with a quiet film title card.

- Dark by default; near-black background, one restrained warm accent for nodes/lines/glow.
- Serif with character for book titles and the topic; clean mono/grotesque for UI labels,
  status text, and the "START HERE" tag. Big, confident type.
- Motion is slow, deliberate, weighty — lines *draw*, nodes settle with easing, nothing
  bounces or feels gamey. The search → results transition is the signature moment.
- Restraint over decoration. If in doubt, remove it.
- **Mobile-first** — most clicks come from a phone. The radial map may simplify to a clean
  stacked list on narrow screens while keeping the spawn animation.

## Deploy

Push to a Vercel project. Set `ANTHROPIC_API_KEY` in the Vercel dashboard
(Project → Settings → Environment Variables). No other env config required.
