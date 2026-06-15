"use client";
import { motion } from "framer-motion";
import type { Book } from "@/lib/types";
import { useElementSize } from "@/lib/useElementSize";

type Phase = "searching" | "results";

// 5 nodes evenly around the center, starting at the top (12 o'clock).
const ANGLES = [0, 1, 2, 3, 4].map((i) => -90 + i * 72);

export function MindMapGraph({
  phase,
  topicLabel,
  books,
  activeIndex,
  onHover,
}: {
  phase: Phase;
  topicLabel: string;
  books?: Book[];
  activeIndex?: number | null;
  onHover?: (index: number | null) => void;
}) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const { width: w, height: h } = size;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.max(60, Math.min(w, h) * 0.36);

  const nodes = ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  });

  return (
    <div ref={ref} className="relative h-full w-full">
      {w > 0 && (
        <>
          {/* connecting lines — drawn outward via animated pathLength */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {nodes.map((n, i) => {
              const on = activeIndex === i;
              return (
                <motion.line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={n.x}
                  y2={n.y}
                  stroke={on ? "var(--color-accent)" : "var(--color-accent-dim)"}
                  strokeWidth={1}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: on ? 0.9 : 0.45 }}
                  transition={{
                    pathLength: { duration: 0.7, delay: 0.25 + i * 0.18, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                  }}
                />
              );
            })}
          </svg>

          {/* center node — the topic */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: cx, top: cy }}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-40
                -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 20%, transparent) 0%, transparent 70%)",
              }}
              aria-hidden
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="flex max-w-[9rem] items-center justify-center rounded-full
                border border-accent/40 bg-canvas px-4 py-3 text-center"
            >
              <span className="font-serif text-sm capitalize leading-tight text-ink">
                {topicLabel}
              </span>
            </motion.div>
          </div>

          {/* the five book nodes — spawn one by one, then resolve to rank numbers */}
          {nodes.map((n, i) => {
            const book = books?.[i];
            const on = activeIndex === i;
            return (
              <motion.button
                key={i}
                type="button"
                disabled={!book}
                onMouseEnter={() => onHover?.(i)}
                onMouseLeave={() => onHover?.(null)}
                className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2
                  items-center justify-center rounded-full border bg-canvas
                  font-mono text-xs tabular-nums transition-colors duration-300"
                style={{
                  left: n.x,
                  top: n.y,
                  borderColor: on ? "var(--color-accent)" : "var(--color-faint)",
                  color: on || book ? "var(--color-accent)" : "var(--color-faint)",
                  boxShadow: on ? "0 0 22px -6px var(--color-accent)" : "none",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  phase === "searching"
                    ? { scale: [0, 1.1, 1], opacity: [0, 1, 0.6] }
                    : { scale: 1, opacity: 1 }
                }
                transition={
                  phase === "searching"
                    ? {
                        scale: { duration: 0.5, delay: 0.3 + i * 0.18 },
                        opacity: {
                          duration: 1.6,
                          delay: 0.3 + i * 0.18,
                          repeat: Infinity,
                          repeatType: "reverse",
                        },
                      }
                    : { duration: 0.5, delay: i * 0.06 }
                }
              >
                {book ? String(book.rank).padStart(2, "0") : ""}
              </motion.button>
            );
          })}
        </>
      )}
    </div>
  );
}
