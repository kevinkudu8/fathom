"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STATUS_LINES } from "@/lib/examples";

/** Cycles the short status lines under the canvas while a path is being built. */
export function StatusCycler() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setI((n) => (n + 1) % STATUS_LINES.length),
      1900,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-5 items-center justify-center" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4 }}
          className="font-mono text-xs lowercase tracking-wide text-muted"
        >
          {STATUS_LINES[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
