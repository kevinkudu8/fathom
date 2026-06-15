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
        className="w-full bg-transparent text-center font-serif text-2xl text-ink
          placeholder:text-muted/70 outline-none caret-accent
          sm:text-3xl"
      />
      <div className="mt-4 h-px w-full bg-faint" aria-hidden />
      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        press enter
      </p>
    </form>
  );
}
