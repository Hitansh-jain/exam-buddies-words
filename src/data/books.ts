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

// ─── RICH DAD POOR DAD ────────────────────────────────────────────

const RICH_DAD_NOTES = `Introduction: Two Dads, Two Mindsets

The author grew up watching two men handle money in totally opposite ways. One was highly educated, held a stable government job, and yet complained about bills his entire life. The other never finished school in the traditional sense, but built businesses, took calculated risks, and eventually became wealthy. Same city, same era, two completely different outcomes — and the difference came down to how each man thought about money.

Lesson One: The Rich Do Not Work for Money

Most people trade their hours for a paycheck. They chase raises, promotions, and job security. The wealthy, by contrast, learn to make money work for them. They study cash flow, investments, and ownership. A salary keeps the lights on; assets create real freedom.

Lesson Two: Learn Basic Financial Literacy

Schools rarely teach the difference between an asset and a liability. An asset puts money into your pocket. A liability takes money out. A house you live in, financed with a huge loan, drains cash every month — it is a liability wearing a nice suit. A rental property that pays you every month is a genuine asset. The single most important skill is being able to read this difference on paper.

Lesson Three: Mind Your Own Business

Your profession is what pays the bills. Your business is what you build on the side — the assets you accumulate over the years. Focus on quietly buying real assets: dividend-paying stocks, small rental units, intellectual property. Do not confuse a bigger salary with genuine wealth.

Lesson Four: The History and Power of Taxes

Governments favour those who understand the rules. Corporations legally pay expenses first and get taxed on what remains. Employees are taxed first, then get to spend what remains. Learning the basics of legal structures, deductions, and depreciation is not exotic knowledge — it is practical protection for the money you earn.

Lesson Five: The Rich Invent Money

Opportunities are everywhere, but most people miss them because they were trained to look for a stable job, not for problems worth solving. The wealthy train their minds to spot deals, negotiate creatively, and take intelligent risks. Financial intelligence is a muscle. It grows with practice.

Lesson Six: Work to Learn, Do Not Work Only to Earn

Take jobs for the skills they teach you, not just the salary. Sales, communication, leadership, negotiation, marketing, accounting — these skills compound over a lifetime. A single new skill can multiply your earning power far more than a small annual raise ever will.

Overcoming the Common Obstacles

Five fears keep most people stuck: fear of losing money, cynicism, laziness disguised as busy-ness, bad habits, and arrogance. The remedy is small consistent action. Start tiny, expect to make mistakes, and treat every mistake as tuition paid to your financial education.

Getting Started: A Simple Path

Find a stronger reason than the reason to stay comfortable. Choose to invest in your own financial education daily — books, courses, mentors. Surround yourself with people who are further along than you. Pay yourself first, before bills, even a small amount. Study one asset class deeply. Take action, review, adjust, and keep going.

This chapter is an original summary written for study purposes. For the full book, please purchase Rich Dad Poor Dad by Robert T. Kiyosaki.`;

const RICH_DAD: Book = {
  slug: "rich-dad-poor-dad",
  title: "Rich Dad Poor Dad — Key Lessons",
  author: "Summary (original) inspired by Robert T. Kiyosaki",
  emoji: "💰",
  color: "mint",
  blurb:
    "The core financial mindset lessons — rewritten in plain English. Tap tough words and learn vocab in context.",
  copyrightNote:
    "The original book is copyrighted — this is an original plain-English summary for study use only.",
  chapters: [
    { id: "key-lessons", title: "Key Lessons (Summary)", inlineText: RICH_DAD_NOTES },
  ],
};

export const BOOKS: Book[] = [RICH_DAD, SHERLOCK];

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
