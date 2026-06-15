# Fathom

Type any subject → get a curated **five-book reading path** to start with. Companion tool to
the essay on reading five books to understand a topic better than ~99% of people.

It does one thing: you type a subject, and a well-read-librarian prompt returns five real,
ordered books — book 1 is the entry point, and the set is chosen to *argue with itself* so
you learn where the field disagrees. The whole UI is a single mind-map that grows: a pulsing
central node → five nodes spawn with lines drawing outward → they resolve into the reading
list.

## Stack

- Next.js (App Router) + TypeScript, Tailwind v4
- Framer Motion for the node/line animation, SVG for the graph
- `@anthropic-ai/sdk` (`claude-sonnet-4-6`), called **only** from `app/api/books`
- Deployed to Vercel

## Run locally

```bash
cp .env.local.example .env.local   # then paste your real key into .env.local
npm install
npm run dev                        # http://localhost:3000
```

Set one env var in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

The key is **server-side only** — it's read in `lib/books.ts` (guarded by `server-only`) and
used exclusively by the `app/api/books` route. It is never sent to the browser, never given a
`NEXT_PUBLIC_` prefix.

Other commands:

```bash
npm run build && npm start   # production build
npm run lint                 # lint
```

## How it works

- `/` — landing canvas (`components/LandingExperience.tsx`): central input + drifting,
  clickable example topics.
- `/t/[topic]` — results, keyed off a slugified topic so every path is shareable
  (`/t/the-french-revolution`). Hitting the URL directly runs the spawn animation, then
  resolves. Same slug = same five books.
- `app/api/books/route.ts` → `lib/books.ts` — calls Anthropic, parses the model's JSON
  defensively (strips code fences, validates shape, falls back to a clean error state), and
  caches results in-memory per slug. Each title links to a Google Books search to verify it's
  real.

To swap to the cheaper/faster model, change `MODEL` in `lib/books.ts` to `claude-haiku-4-5`.

## Deploy to Vercel

1. Push this repo to a Vercel project (it auto-detects Next.js).
2. **Project → Settings → Environment Variables** → add `ANTHROPIC_API_KEY` with your key.
3. Deploy. No other env config is required.

> Note: the result cache is in-memory per serverless instance. For persistent, cross-instance
> caching, swap the `Map` in `lib/books.ts` for Vercel KV.

See `CLAUDE.md` for conventions, guardrails, and the full book-generation contract.
