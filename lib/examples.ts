// Faint, drifting shortcut topics on the landing canvas — they make the map feel
// alive and give first-time visitors a one-tap way in. Client-safe (no SDK).
export const EXAMPLE_TOPICS = [
  "economics",
  "film",
  "money",
  "the brain",
  "war",
  "climate",
  "jazz",
] as const;

// The status lines that cycle under the canvas while a path is being built.
export const STATUS_LINES = [
  "finding the foundational text…",
  "looking for the dissenting view…",
  "ordering the path…",
  "checking it argues with itself…",
  "settling the nodes…",
] as const;
