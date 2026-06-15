// Server route: the ONLY place the Anthropic call happens. The frontend POSTs a
// topic here; ANTHROPIC_API_KEY is read server-side via lib/books and never sent
// to the browser. (CLAUDE.md constraint #1.)
import { NextResponse } from "next/server";
import { generateBooks } from "@/lib/books";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let topic = "";
  try {
    const body = (await request.json()) as { topic?: unknown };
    if (typeof body.topic === "string") topic = body.topic.trim();
  } catch {
    // malformed body — fall through to the empty-topic error below
  }

  if (!topic) {
    return NextResponse.json(
      { topic: "", intro: "", error: "Type a subject to build a path.", books: [] },
      { status: 400 },
    );
  }

  // generateBooks never throws — it always resolves to a clean BooksResult,
  // returning its own friendly error state on any failure.
  const result = await generateBooks(topic);
  return NextResponse.json(result);
}
