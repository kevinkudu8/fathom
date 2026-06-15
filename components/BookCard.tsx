"use client";
import { motion } from "framer-motion";
import type { Book } from "@/lib/types";
import { googleBooksUrl } from "@/lib/types";

export function BookCard({
  book,
  index,
  onHover,
  active,
}: {
  book: Book;
  index: number;
  onHover?: (index: number | null) => void;
  active?: boolean;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative border-l py-5 pl-5 transition-colors duration-300 ${
        active ? "border-accent" : "border-faint"
      }`}
    >
      {/* rank + START HERE row */}
      <div className="mb-2 flex items-center gap-3">
        <span
          className={`font-mono text-xs tabular-nums transition-colors ${
            active ? "text-accent" : "text-muted"
          }`}
        >
          {String(book.rank).padStart(2, "0")}
        </span>
        {book.startHere && (
          <span className="rounded-sm bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Start here
          </span>
        )}
        {book.angle && (
          <span className="font-mono text-[10px] lowercase tracking-wide text-muted">
            {book.angle}
          </span>
        )}
      </div>

      {/* title — also the verify-link to Google Books */}
      <a
        href={googleBooksUrl(book.title, book.author)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-serif text-xl leading-snug text-ink decoration-faint
          underline-offset-4 transition-colors hover:text-accent hover:decoration-accent
          hover:underline sm:text-2xl"
      >
        {book.title}
      </a>

      <p className="mt-1 font-mono text-xs text-muted">
        {book.author}
        {book.year != null && <span> · {book.year}</span>}
      </p>

      <p className="mt-3 max-w-prose font-serif text-[15px] italic leading-relaxed text-ink/85">
        {book.oneLiner}
      </p>
    </motion.li>
  );
}
