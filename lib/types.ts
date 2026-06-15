// Client-safe shared types + helpers. This module must NEVER import the Anthropic
// SDK, so it's safe to use from client components (BookCard, MindMap, etc.).

export interface Book {
  rank: number;
  title: string;
  author: string;
  year: number | null;
  startHere: boolean;
  oneLiner: string;
  /** short framing tag, e.g. "the foundation" / "the dissent" (optional) */
  angle?: string;
}

export interface BooksResult {
  topic: string;
  intro: string;
  /** non-null = couldn't build a real path; UI shows a friendly error state */
  error: string | null;
  books: Book[];
}

/**
 * A subtle verify-link per title: opens a Google Books search so the reader can
 * confirm the book is real and find a copy. (CLAUDE.md constraint #2.)
 */
export function googleBooksUrl(title: string, author: string): string {
  const q = encodeURIComponent(`${title} ${author}`.trim());
  return `https://www.google.com/search?tbm=bks&q=${q}`;
}
