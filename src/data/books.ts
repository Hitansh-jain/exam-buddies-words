export type Chapter = {
  id: string;
  title: string;
  group?: string; // grouping label for UI (e.g. "Novels", "Adventures")
  source?: {
    gutenbergId: number;
    splitRegex: string;
  };
  inlineText?: string;
};

export type Book = {
  slug: string;
  title: string;
  author: string;
  emoji: string;
  color: string;
  blurb: string;
  copyrightNote?: string;
  chapters: Chapter[];
};

// ─── SHERLOCK HOLMES ───────────────────────────────────────────────

function storyChapters(
  group: string,
  gutenbergId: number,
  titles: string[],
): Chapter[] {
  return titles.map((t) => ({
    id: `sh-${gutenbergId}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`,
    title: t,
    group,
    source: { gutenbergId, splitRegex: "" }, // splitRegex unused — we slice by title
  }));
}

const NOVELS: Chapter[] = [
  { id: "study-in-scarlet", title: "A Study in Scarlet", group: "Novels",
    source: { gutenbergId: 244, splitRegex: "" } },
  { id: "sign-of-the-four", title: "The Sign of the Four", group: "Novels",
    source: { gutenbergId: 2097, splitRegex: "" } },
  { id: "hound-baskervilles", title: "The Hound of the Baskervilles", group: "Novels",
    source: { gutenbergId: 2852, splitRegex: "" } },
  { id: "valley-of-fear", title: "The Valley of Fear", group: "Novels",
    source: { gutenbergId: 3289, splitRegex: "" } },
];

const ADVENTURES = storyChapters("Adventures of Sherlock Holmes", 1661, [
  "A Scandal in Bohemia",
  "The Red-Headed League",
  "A Case of Identity",
  "The Boscombe Valley Mystery",
  "The Five Orange Pips",
  "The Man with the Twisted Lip",
  "The Adventure of the Blue Carbuncle",
  "The Adventure of the Speckled Band",
  "The Adventure of the Engineer's Thumb",
  "The Adventure of the Noble Bachelor",
  "The Adventure of the Beryl Coronet",
  "The Adventure of the Copper Beeches",
]);

const MEMOIRS = storyChapters("Memoirs of Sherlock Holmes", 834, [
  "Silver Blaze",
  "The Yellow Face",
  "The Stock-Broker's Clerk",
  "The Gloria Scott",
  "The Musgrave Ritual",
  "The Reigate Squire",
  "The Crooked Man",
  "The Resident Patient",
  "The Greek Interpreter",
  "The Naval Treaty",
  "The Final Problem",
]);

const RETURN = storyChapters("Return of Sherlock Holmes", 108, [
  "The Adventure of the Empty House",
  "The Adventure of the Norwood Builder",
  "The Adventure of the Dancing Men",
  "The Adventure of the Solitary Cyclist",
  "The Adventure of the Priory School",
  "The Adventure of Black Peter",
  "The Adventure of Charles Augustus Milverton",
  "The Adventure of the Six Napoleons",
  "The Adventure of the Three Students",
  "The Adventure of the Golden Pince-Nez",
  "The Adventure of the Missing Three-Quarter",
  "The Adventure of the Abbey Grange",
  "The Adventure of the Second Stain",
]);

const LAST_BOW = storyChapters("His Last Bow", 2350, [
  "The Adventure of Wisteria Lodge",
  "The Adventure of the Cardboard Box",
  "The Adventure of the Red Circle",
  "The Adventure of the Bruce-Partington Plans",
  "The Adventure of the Dying Detective",
  "The Disappearance of Lady Frances Carfax",
  "The Adventure of the Devil's Foot",
  "His Last Bow",
]);

const CASEBOOK = storyChapters("Case-Book of Sherlock Holmes", 69700, [
  "The Adventure of the Illustrious Client",
  "The Adventure of the Blanched Soldier",
  "The Adventure of the Mazarin Stone",
  "The Adventure of the Three Gables",
  "The Adventure of the Sussex Vampire",
  "The Adventure of the Three Garridebs",
  "The Problem of Thor Bridge",
  "The Adventure of the Creeping Man",
  "The Adventure of the Lion's Mane",
  "The Adventure of the Veiled Lodger",
  "The Adventure of Shoscombe Old Place",
  "The Adventure of the Retired Colourman",
]);

const SHERLOCK: Book = {
  slug: "sherlock-holmes",
  title: "Sherlock Holmes — Complete",
  author: "Sir Arthur Conan Doyle",
  emoji: "🕵️",
  color: "cool",
  blurb:
    "4 novels + 56 short stories — the complete Sherlock canon from Project Gutenberg. Tap tough words for meaning + root.",
  chapters: [
    ...NOVELS,
    ...ADVENTURES,
    ...MEMOIRS,
    ...RETURN,
    ...LAST_BOW,
    ...CASEBOOK,
  ],
};

export const BOOKS: Book[] = [SHERLOCK];

export function findBook(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}

/**
 * Given raw Gutenberg text for a short-story collection and the story titles
 * in reading order, extract ONE story's text by title matching.
 */
export function extractStoryFromCollection(
  body: string,
  allTitles: string[],
  targetTitle: string,
): string {
  const upper = body.toUpperCase();
  // Find each title's position (second occurrence to skip TOC)
  const positions: { title: string; pos: number }[] = [];
  for (const t of allTitles) {
    const needle = t.toUpperCase();
    const first = upper.indexOf(needle);
    if (first === -1) continue;
    const second = upper.indexOf(needle, first + needle.length);
    positions.push({ title: t, pos: second !== -1 ? second : first });
  }
  positions.sort((a, b) => a.pos - b.pos);
  const idx = positions.findIndex((p) => p.title === targetTitle);
  if (idx === -1) return body; // fallback: whole text
  const start = positions[idx].pos;
  const end = idx + 1 < positions.length ? positions[idx + 1].pos : body.length;
  return body.slice(start, end).trim();
}

/** Get sibling titles from the same gutenberg collection. */
export function getSiblingTitles(book: Book, chapter: Chapter): string[] {
  if (!chapter.source) return [];
  return book.chapters
    .filter((c) => c.source?.gutenbergId === chapter.source!.gutenbergId)
    .map((c) => c.title);
}
