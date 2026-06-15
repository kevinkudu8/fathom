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

// "Be curious for me" pool — ~40 genuinely rich, book-worthy subjects so a random
// pick always lands somewhere worth reading. (The essay's "follow whatever pulls
// hardest", as a button.) Each is deep enough to sustain a real five-book path.
export const CURIOUS_TOPICS = [
  "the french revolution",
  "quantum mechanics",
  "the cold war",
  "consciousness",
  "evolution",
  "money",
  "the roman empire",
  "jazz",
  "climate change",
  "artificial intelligence",
  "the brain",
  "capitalism",
  "game theory",
  "cryptography",
  "the silk road",
  "black holes",
  "propaganda",
  "stoicism",
  "the industrial revolution",
  "networks",
  "the english language",
  "pandemics",
  "anarchism",
  "the ocean",
  "memory",
  "cities",
  "mathematics",
  "photography",
  "debt",
  "empire",
  "attention",
  "chaos theory",
  "trees",
  "addiction",
  "justice",
  "the gut",
  "time",
  "color",
  "espionage",
  "the universe",
] as const;

// The status lines that cycle under the canvas while a path is being built.
export const STATUS_LINES = [
  "finding the foundational text…",
  "looking for the dissenting view…",
  "ordering the path…",
  "checking it argues with itself…",
  "settling the nodes…",
] as const;
