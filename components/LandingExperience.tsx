"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { SearchInput } from "./SearchInput";
import { useElementSize } from "@/lib/useElementSize";
import { EXAMPLE_TOPICS, CURIOUS_TOPICS } from "@/lib/examples";
import { slugify } from "@/lib/slug";

// Where the faint example nodes float — fractions of the canvas, kept well clear
// of the center where the input lives. Same order as EXAMPLE_TOPICS.
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
  // Elliptical breathing room around the input — wider than tall, matching the
  // text block (wordmark → input → subtitle). Lines start at the ellipse edge so
  // none ever crosses the text, and a matching radial occluder softens the seam.
  const clearRX = Math.max(170, Math.min(size.width * 0.34, 360));
  const clearRY = Math.max(150, Math.min(size.height * 0.3, 230));

  // --- mouse parallax (slow, weighty; off for reduced-motion / touch) ---
  const pointerX = useMotionValue(0); // normalized -1..1
  const pointerY = useMotionValue(0);
  const springCfg = { stiffness: 45, damping: 22, mass: 1.1 };
  const sx = useSpring(pointerX, springCfg);
  const sy = useSpring(pointerY, springCfg);
  // background field drifts with the cursor; heading drifts gently the other way.
  const fieldX = useTransform(sx, (v) => v * 26);
  const fieldY = useTransform(sy, (v) => v * 26);
  const headX = useTransform(sx, (v) => v * -9);
  const headY = useTransform(sy, (v) => v * -9);

  const parallaxOn = useRef(false);
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    parallaxOn.current = fine && !reduced;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!parallaxOn.current || leaving) return;
      const rect = e.currentTarget.getBoundingClientRect();
      pointerX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
      pointerY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    },
    [leaving, pointerX, pointerY],
  );

  function go(topic: string) {
    if (leaving) return;
    setLeaving(true);
    // Let the collapse animation play, then navigate to the shareable path URL.
    setTimeout(() => router.push(`/t/${slugify(topic)}`), 460);
  }

  function beCurious() {
    const topic = CURIOUS_TOPICS[Math.floor(Math.random() * CURIOUS_TOPICS.length)];
    go(topic);
  }

  return (
    <main
      ref={containerRef}
      onPointerMove={onPointerMove}
      className="relative h-dvh w-full overflow-hidden no-scrollbar"
    >
      {/* parallax field: lines + drifting example nodes move together */}
      <motion.div className="absolute inset-0" style={{ x: fieldX, y: fieldY }}>
        {/* connecting lines — start at the edge of the clear zone, never through the input */}
        {size.width > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {EXAMPLE_TOPICS.map((topic, i) => {
              const p = POSITIONS[i];
              const nx = p.x * size.width;
              const ny = p.y * size.height;
              const dx = nx - cx;
              const dy = ny - cy;
              const len = Math.hypot(dx, dy) || 1;
              const ux = dx / len;
              const uy = dy / len;
              // distance from center to the ellipse boundary along this direction
              const t =
                1 / Math.hypot(ux / clearRX, uy / clearRY);
              const startX = cx + ux * t;
              const startY = cy + uy * t;
              return (
                <motion.line
                  key={topic}
                  x1={startX}
                  y1={startY}
                  x2={nx}
                  y2={ny}
                  stroke="var(--color-faint)"
                  strokeWidth={1}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={leaving ? { opacity: 0 } : { pathLength: 1, opacity: 0.5 }}
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
      </motion.div>

      {/* elliptical clear-space behind the input — anchored to the true center so
          the input always has room, regardless of parallax */}
      {size.width > 0 && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: cx,
            top: cy,
            width: clearRX * 2.1,
            height: clearRY * 2.1,
            background:
              "radial-gradient(ellipse, var(--color-canvas) 0%, var(--color-canvas) 46%, transparent 78%)",
          }}
          aria-hidden
        />
      )}

      {/* center node + input */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.div
          className="relative flex w-full max-w-lg flex-col items-center"
          style={{ x: headX, y: headY }}
          animate={leaving ? { scale: 0.6, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* soft amber glow behind the center */}
          <div
            className="pointer-events-none absolute -z-10 h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--color-accent) var(--glow), transparent) 0%, transparent 70%)",
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

      {/* hidden "be curious for me" — faint in the corner, brightens on hover.
          Picks a curated subject and runs the normal search. */}
      <AnimatePresence>
        {!leaving && (
          <motion.button
            type="button"
            onClick={beCurious}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            whileHover={{ opacity: 1 }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[11px]
              lowercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            be curious for me →
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
