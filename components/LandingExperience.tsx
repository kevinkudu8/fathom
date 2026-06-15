"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchInput } from "./SearchInput";
import { useElementSize } from "@/lib/useElementSize";
import { EXAMPLE_TOPICS } from "@/lib/examples";
import { slugify } from "@/lib/slug";

// Where the faint example nodes float — fractions of the canvas, kept clear of the
// center where the input lives. Same order as EXAMPLE_TOPICS.
const POSITIONS = [
  { x: 0.16, y: 0.26 },
  { x: 0.83, y: 0.2 },
  { x: 0.09, y: 0.64 },
  { x: 0.9, y: 0.6 },
  { x: 0.28, y: 0.85 },
  { x: 0.72, y: 0.86 },
  { x: 0.52, y: 0.11 },
];

export function LandingExperience() {
  const router = useRouter();
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [leaving, setLeaving] = useState(false);

  const cx = size.width / 2;
  const cy = size.height / 2;

  function go(topic: string) {
    if (leaving) return;
    setLeaving(true);
    // Let the collapse animation play, then navigate to the shareable path URL.
    setTimeout(() => router.push(`/t/${slugify(topic)}`), 460);
  }

  return (
    <main
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden no-scrollbar"
    >
      {/* faint connecting lines from center to each example node */}
      {size.width > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {EXAMPLE_TOPICS.map((topic, i) => {
            const p = POSITIONS[i];
            return (
              <motion.line
                key={topic}
                x1={cx}
                y1={cy}
                x2={p.x * size.width}
                y2={p.y * size.height}
                stroke="var(--color-faint)"
                strokeWidth={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  leaving
                    ? { opacity: 0 }
                    : { pathLength: 1, opacity: 0.5 }
                }
                transition={{ duration: 1.4, delay: 0.2 + i * 0.08, ease: "easeInOut" }}
              />
            );
          })}
        </svg>
      )}

      {/* drifting example topic nodes (clickable shortcuts) */}
      <AnimatePresence>
        {!leaving &&
          EXAMPLE_TOPICS.map((topic, i) => {
            const p = POSITIONS[i];
            return (
              <motion.button
                key={topic}
                type="button"
                onClick={() => go(topic)}
                className="group absolute -translate-x-1/2 -translate-y-1/2
                  font-mono text-xs lowercase tracking-wide text-muted
                  transition-colors hover:text-accent"
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 0.7,
                  scale: 1,
                  // gentle, per-node drift
                  x: [0, i % 2 ? 6 : -6, 0],
                  y: [0, i % 2 ? -8 : 6, 0],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  opacity: { duration: 0.9, delay: 0.4 + i * 0.08 },
                  scale: { duration: 0.9, delay: 0.4 + i * 0.08 },
                  x: { duration: 9 + i, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 11 + i, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <span
                  className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-faint
                    align-middle transition-colors group-hover:bg-accent"
                />
                {topic}
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* center node + input */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.div
          className="relative flex w-full max-w-md flex-col items-center"
          animate={leaving ? { scale: 0.6, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* soft amber glow behind the center */}
          <div
            className="pointer-events-none absolute -z-10 h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 16%, transparent) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.4em] text-accent-dim">
            Fathom
          </p>
          <SearchInput onSubmit={go} />
          <p className="mt-10 max-w-xs text-center font-serif text-sm italic leading-relaxed text-muted">
            Five books on one subject, and you&rsquo;ll understand it better than
            almost anyone you&rsquo;ll meet.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
