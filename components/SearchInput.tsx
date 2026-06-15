"use client";
import { useState } from "react";

export function SearchInput({
  onSubmit,
  autoFocus = true,
}: {
  onSubmit: (topic: string) => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const topic = value.trim();
    if (topic) onSubmit(topic);
  }

  return (
    <form onSubmit={submit} className="w-full">
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What do you want to understand?"
        aria-label="Subject to build a reading path for"
        autoComplete="off"
        spellCheck={false}
        // Fluid size so the long placeholder always fits — never clips at the
        // edges on narrow phones. Horizontal padding keeps serif side-bearings
        // (e.g. the leading glyph) from being cut off.
        className="block w-full min-w-0 bg-transparent px-3 text-center font-serif
          leading-normal text-ink placeholder:text-muted/70 outline-none caret-accent
          text-[clamp(1.15rem,5.2vw,1.9rem)]"
      />
      <div className="mt-4 h-px w-full bg-faint" aria-hidden />
      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        press enter
      </p>
    </form>
  );
}
