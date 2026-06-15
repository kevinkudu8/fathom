import { ImageResponse } from "next/og";

// Shared renderer for the social share image. Used by both the landing and the
// /t/[topic] pages so a pasted link previews as a clean branded card instead of a
// bare URL. Satori (next/og) only supports inline styles + fl:flex layouts.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const CANVAS = "#0a0908";
const INK = "#ece7df";
const MUTED = "#8a8175";
const ACCENT = "#e0a458";
const FAINT = "#4a463f";

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function renderOgImage(topic?: string) {
  const heading = topic ? titleCase(topic) : "five books on any subject";
  const kicker = topic ? "FIVE BOOKS ON" : "FATHOM";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CANVAS,
          padding: "72px 80px",
        }}
      >
        {/* top: wordmark / kicker */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            color: ACCENT,
            fontWeight: 600,
          }}
        >
          {kicker}
        </div>

        {/* middle: the subject */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div
            style={{
              display: "flex",
              fontSize: topic ? 104 : 88,
              lineHeight: 1.05,
              color: INK,
              fontWeight: 600,
              letterSpacing: -2,
            }}
          >
            {heading}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              color: MUTED,
            }}
          >
            {topic
              ? "A curated five-book reading path to start with."
              : "Type a subject. Get a five-book path to understand it."}
          </div>
        </div>

        {/* bottom: five-node motif */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: i === 0 ? 22 : 16,
                  height: i === 0 ? 22 : 16,
                  borderRadius: 999,
                  background: i === 0 ? ACCENT : "transparent",
                  border: `2px solid ${i === 0 ? ACCENT : FAINT}`,
                }}
              />
              {i < 4 && (
                <div style={{ width: 64, height: 2, background: FAINT }} />
              )}
            </div>
          ))}
          <div style={{ display: "flex", marginLeft: 24, fontSize: 22, color: MUTED }}>
            fathom
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
