import { useEffect, useMemo, useRef, useState } from "react";
import { isLikelyToughWord } from "@/data/stopwords";
import { findRootFor } from "@/data/rootLookup";

type Meaning = {
  word: string;
  loading: boolean;
  error?: string;
  pos?: string;
  definition?: string;
  example?: string;
  root?: { rootLabel: string; meaning: string } | null;
  usedInStory?: string; // sentence from the text where the word was clicked
};

// dictionaryapi.dev is a free, no-key public dictionary API.
async function lookupWord(word: string): Promise<Partial<Meaning>> {
  const clean = word.toLowerCase().replace(/[^a-z-]/g, "");
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`;
  const res = await fetch(url);
  if (!res.ok) return { error: "No dictionary entry found. Try another form of the word." };
  const data = (await res.json()) as Array<{
    meanings: Array<{
      partOfSpeech?: string;
      definitions: Array<{ definition: string; example?: string }>;
    }>;
  }>;
  const first = data?.[0]?.meanings?.[0];
  const def = first?.definitions?.[0];
  return {
    pos: first?.partOfSpeech,
    definition: def?.definition,
    example: def?.example,
  };
}

function findSentence(fullText: string, index: number): string {
  if (index < 0) return "";
  const start = Math.max(
    fullText.lastIndexOf(".", index - 1),
    fullText.lastIndexOf("!", index - 1),
    fullText.lastIndexOf("?", index - 1),
    fullText.lastIndexOf("\n", index - 1),
  );
  const endCandidates = [
    fullText.indexOf(".", index),
    fullText.indexOf("!", index),
    fullText.indexOf("?", index),
    fullText.indexOf("\n\n", index),
  ].filter((n) => n > -1);
  const end = endCandidates.length ? Math.min(...endCandidates) + 1 : fullText.length;
  return fullText.slice(start + 1, end).trim();
}

export function EbookReader({
  text,
  accent,
}: {
  text: string;
  accent: string; // e.g. "cool" | "mint" | "hot" | "lemon"
}) {
  const [meaning, setMeaning] = useState<Meaning | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

  // Build clickable tokens: split by whitespace, tag each token as clickable or not.
  const tokens = useMemo(() => {
    // Preserve paragraphs
    return text.split(/\n\n+/).map((para, pi) => {
      const parts = para.split(/(\s+)/).map((part, i) => {
        if (/^\s+$/.test(part)) return { key: `${pi}-${i}-s`, kind: "space" as const, text: part };
        // Strip punctuation around word for tough-check but keep display intact
        const stripped = part.replace(/^[^\w]+|[^\w]+$/g, "");
        const tough = isLikelyToughWord(stripped);
        return {
          key: `${pi}-${i}-w`,
          kind: (tough ? "tough" : "plain") as "tough" | "plain",
          text: part,
          wordOnly: stripped,
        };
      });
      return { key: `p-${pi}`, parts };
    });
  }, [text]);

  async function handleClick(wordOnly: string) {
    if (!wordOnly) return;
    // Find first occurrence in text (good enough context grab)
    const idx = textRef.current.toLowerCase().indexOf(wordOnly.toLowerCase());
    const sentence = idx >= 0 ? findSentence(textRef.current, idx) : "";
    const root = findRootFor(wordOnly);
    setMeaning({ word: wordOnly, loading: true, root, usedInStory: sentence });
    try {
      const res = await lookupWord(wordOnly);
      setMeaning((prev) =>
        prev && prev.word === wordOnly ? { ...prev, loading: false, ...res } : prev,
      );
    } catch {
      setMeaning((prev) =>
        prev && prev.word === wordOnly
          ? { ...prev, loading: false, error: "Network error. Try again." }
          : prev,
      );
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMeaning(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toughColor =
    accent === "mint"
      ? "decoration-[var(--mint)]"
      : accent === "hot"
        ? "decoration-[var(--hot)]"
        : accent === "lemon"
          ? "decoration-[var(--lemon)]"
          : "decoration-[var(--cool)]";

  return (
    <div className="relative">
      <div className="rounded-3xl border-brutal bg-card p-4 shadow-brutal-lg sm:p-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
          📖 Tap any highlighted word for meaning + root + usage
        </p>
        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed sm:text-base sm:leading-8">
          {tokens.map((para) => (
            <p key={para.key} className="mb-4">
              {para.parts.map((t) =>
                t.kind === "space" ? (
                  <span key={t.key}>{t.text}</span>
                ) : t.kind === "tough" ? (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleClick(t.wordOnly!)}
                    className={`cursor-pointer underline decoration-dotted decoration-2 underline-offset-4 hover:bg-[var(--lemon)] ${toughColor}`}
                  >
                    {t.text}
                  </button>
                ) : (
                  <span key={t.key}>{t.text}</span>
                ),
              )}
            </p>
          ))}
        </div>
      </div>

      {meaning && (
        <MeaningPopup meaning={meaning} onClose={() => setMeaning(null)} />
      )}
    </div>
  );
}

function MeaningPopup({ meaning, onClose }: { meaning: Meaning; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg animate-pop rounded-3xl border-brutal bg-card p-5 shadow-brutal-lg sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Meaning
            </p>
            <h3 className="mt-1 break-words font-display text-3xl font-extrabold sm:text-4xl">
              {meaning.word}
            </h3>
            {meaning.pos && (
              <span className="mt-2 inline-block rounded-full border-brutal bg-[var(--lemon)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-brutal-sm">
                {meaning.pos}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl border-brutal bg-[var(--hot)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-brutal-sm"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {meaning.loading && (
            <p className="text-sm text-muted-foreground">Looking up meaning…</p>
          )}
          {meaning.error && (
            <div className="rounded-2xl border-brutal bg-[var(--lemon)] p-3 text-sm font-semibold">
              {meaning.error}
            </div>
          )}
          {meaning.definition && (
            <div className="rounded-2xl border-brutal bg-[var(--mint)] p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
                Definition
              </p>
              <p className="mt-1 text-sm font-semibold">{meaning.definition}</p>
              {meaning.example && (
                <p className="mt-2 text-xs italic opacity-80">"{meaning.example}"</p>
              )}
            </div>
          )}
          {meaning.root && (
            <div className="rounded-2xl border-brutal bg-[var(--cool)] p-3 text-white">
              <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-90">
                Root: {meaning.root.rootLabel}
              </p>
              <p className="mt-1 text-sm font-semibold">= {meaning.root.meaning}</p>
            </div>
          )}
          {meaning.usedInStory && (
            <div className="rounded-2xl border-brutal bg-background p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                How it's used here
              </p>
              <p className="mt-1 text-sm italic">"{meaning.usedInStory}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
