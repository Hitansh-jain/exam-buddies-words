import { ROOTS } from "./roots";

// Map any root variant → its Root entry (for quick lookup in the reader).
const ROOT_LOOKUP: { pattern: string; rootId: number; rootLabel: string; meaning: string }[] = [];
for (const r of ROOTS) {
  for (const p of r.root.split("/").map((s) => s.trim().toLowerCase())) {
    ROOT_LOOKUP.push({ pattern: p, rootId: r.id, rootLabel: r.root, meaning: r.meaning });
  }
}

export function findRootFor(word: string): { rootLabel: string; meaning: string } | null {
  const w = word.toLowerCase();
  // longest match wins
  const matches = ROOT_LOOKUP
    .filter((r) => w.includes(r.pattern))
    .sort((a, b) => b.pattern.length - a.pattern.length);
  return matches[0] ? { rootLabel: matches[0].rootLabel, meaning: matches[0].meaning } : null;
}
