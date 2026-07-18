export type Chapter = {
  id: string;
  title: string;
  // Either a Gutenberg source (fetched via /api/public/gutenberg) with
  // a chapter-splitting regex OR inline text (for our original summaries).
  source?: {
    gutenbergId: number;
    // regex that splits raw text into chapters; first match at each chapter start
    splitRegex: string; // stringified regex, flags "gm"
  };
  inlineText?: string;
};

export type Book = {
  slug: string;
  title: string;
  author: string;
  emoji: string;
  color: string; // css var name for accent
  blurb: string;
  copyrightNote?: string;
  chapters: Chapter[];
};

// -------------- SHERLOCK HOLMES (public domain, Project Gutenberg) --------------
// We fetch through /api/public/gutenberg?id=... and split by chapter markers.

const SHERLOCK: Book = {
  slug: "sherlock-holmes",
  title: "Sherlock Holmes — 4 Novels + 56 Stories",
  author: "Sir Arthur Conan Doyle",
  emoji: "🕵️",
  color: "cool",
  blurb:
    "The complete Sherlock canon — Baker Street, Watson, and the greatest detective in fiction. Public-domain texts served fresh from Project Gutenberg.",
  chapters: [
    {
      id: "study-in-scarlet",
      title: "A Study in Scarlet (Novel)",
      source: { gutenbergId: 244, splitRegex: "^\\s*CHAPTER [IVXL]+\\.?.*$" },
    },
    {
      id: "sign-of-the-four",
      title: "The Sign of the Four (Novel)",
      source: { gutenbergId: 2097, splitRegex: "^\\s*CHAPTER [IVXL]+\\.?.*$" },
    },
    {
      id: "hound-baskervilles",
      title: "The Hound of the Baskervilles (Novel)",
      source: { gutenbergId: 2852, splitRegex: "^\\s*Chapter [0-9]+\\.?.*$" },
    },
    {
      id: "valley-of-fear",
      title: "The Valley of Fear (Novel)",
      source: { gutenbergId: 3289, splitRegex: "^\\s*Chapter [0-9]+.*$" },
    },
    {
      id: "adventures",
      title: "The Adventures of Sherlock Holmes (12 stories)",
      source: { gutenbergId: 1661, splitRegex: "^\\s*(?:ADVENTURE [IVXL]+\\.?|[IVXL]+\\.\\s+.+)$" },
    },
    {
      id: "memoirs",
      title: "The Memoirs of Sherlock Holmes (11 stories)",
      source: { gutenbergId: 834, splitRegex: "^\\s*[IVXL]+\\.\\s+.+$" },
    },
    {
      id: "return",
      title: "The Return of Sherlock Holmes (13 stories)",
      source: { gutenbergId: 108, splitRegex: "^\\s*(?:THE ADVENTURE OF .+|CHAPTER [IVXL]+\\.?.*)$" },
    },
    {
      id: "his-last-bow",
      title: "His Last Bow (8 stories)",
      source: { gutenbergId: 2350, splitRegex: "^\\s*(?:THE ADVENTURE OF .+|HIS LAST BOW.*|PREFACE)$" },
    },
    {
      id: "case-book",
      title: "The Case-Book of Sherlock Holmes (12 stories)",
      source: { gutenbergId: 69700, splitRegex: "^\\s*(?:THE ADVENTURE OF .+|THE PROBLEM OF .+|THE .+ CLIENT|PREFACE)$" },
    },
  ],
};

// -------------- RICH DAD POOR DAD --------------
// The original book is copyrighted, so we cannot include the actual text.
// Instead we ship an original, plain-English "key lessons" reader so the
// vocab-click flow still works. All wording below is written from scratch.

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
    "The core financial mindset lessons that made this book famous — rewritten in plain English so you can practise reading, hover over tough words and learn vocab in context.",
  copyrightNote:
    "The original book is copyrighted, so we include an original plain-English summary written for study use only. Please buy the real book to support the author.",
  chapters: [
    { id: "key-lessons", title: "Key Lessons (Summary)", inlineText: RICH_DAD_NOTES },
  ],
};

export const BOOKS: Book[] = [RICH_DAD, SHERLOCK];

export function findBook(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}
