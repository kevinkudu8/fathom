"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-start gap-4"
    >
      <p className="font-serif text-2xl leading-snug text-ink">
        Couldn&rsquo;t build a path for that.
      </p>
      <p className="max-w-sm font-mono text-sm leading-relaxed text-muted">
        {message}
      </p>
      <Link
        href="/"
        className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-accent
          transition-opacity hover:opacity-70"
      >
        ← try a real subject
      </Link>
    </motion.div>
  );
}
