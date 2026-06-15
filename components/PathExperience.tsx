"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BooksResult } from "@/lib/types";
import { MindMapGraph } from "./MindMapGraph";
import { BookCard } from "./BookCard";
import { StatusCycler } from "./StatusCycler";
import { ErrorState } from "./ErrorState";

type Status = "loading" | "done" | "error";

export function PathExperience({ topic }: { topic: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [result, setResult] = useState<BooksResult | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    // This component is keyed by topic at the route, so it mounts fresh per topic
    // and starts from the "loading" initial state — no reset needed here.
    const controller = new AbortController();

    fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
      signal: controller.signal,
    })
      .then((res) => res.json() as Promise<BooksResult>)
      .then((data) => {
        setResult(data);
        setStatus(data.error ? "error" : "done");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setResult({
          topic,
          intro: "",
          error: "Couldn't reach the path-builder. Check your connection and retry.",
          books: [],
        });
        setStatus("error");
      });

    return () => controller.abort();
  }, [topic]);

  const phase = status === "loading" ? "searching" : "results";
  const topicLabel = result?.topic?.trim() || topic;
  const books = status === "done" ? result?.books : undefined;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-6 py-8 sm:px-10 lg:flex lg:items-stretch lg:gap-10 lg:py-12">
      {/* graph pane — radial map (sticky on desktop, compact on mobile) */}
      <section
        className="h-[36vh] w-full shrink-0 lg:sticky lg:top-12 lg:h-[calc(100dvh-6rem)] lg:w-1/2"
        aria-hidden={status === "error"}
      >
        {status !== "error" && (
          <MindMapGraph
            phase={phase}
            topicLabel={topicLabel}
            books={books}
            activeIndex={active}
            onHover={setActive}
          />
        )}
      </section>

      {/* list pane — framing line, then status / books / error */}
      <section className="flex w-full flex-col py-6 lg:w-1/2 lg:py-2">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h1 className="font-serif text-3xl capitalize leading-tight text-ink sm:text-4xl">
            {topicLabel}
          </h1>
          <Link
            href="/"
            className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted
              transition-colors hover:text-accent"
          >
            ← new topic
          </Link>
        </div>

        {status === "loading" && (
          <div className="flex flex-1 flex-col justify-center gap-4 py-10">
            <StatusCycler />
          </div>
        )}

        {status === "done" && result && (
          <>
            {result.intro && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-8 max-w-prose font-serif text-base italic leading-relaxed text-muted"
              >
                {result.intro}
              </motion.p>
            )}
            <ol className="flex flex-col">
              {result.books.map((book, i) => (
                <BookCard
                  key={book.rank}
                  book={book}
                  index={i}
                  active={active === i}
                  onHover={setActive}
                />
              ))}
            </ol>
          </>
        )}

        {status === "error" && result && (
          <div className="flex flex-1 items-center py-10">
            <ErrorState message={result.error ?? "Try a real subject."} />
          </div>
        )}
      </section>
    </main>
  );
}
