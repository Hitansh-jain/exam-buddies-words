import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { lookupWord, lookupHindi, funnyHinglish } from "@/components/EbookReader";
import { findRootFor } from "@/data/rootLookup";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find your Word — Shabd Arena" },
      {
        name: "description",
        content:
          "Search any English word — get instant English, Hindi & Hinglish meaning with a funny example, synonyms hint and root origin.",
      },
      { property: "og:title", content: "Find your Word — Shabd Arena" },
      {
        property: "og:description",
        content: "Any English word — English + Hindi + Hinglish meaning in one tap.",
      },
    ],
  }),
  component: FindPage,
});

type Result = {
  word: string;
  pos?: string;
  definition?: string;
  example?: string;
  hindi?: string;
  hinglish?: string;
  root?: { rootLabel: string; meaning: string } | null;
  error?: string;
};

function FindPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    const word = q.trim();
    if (!word) return;
    setLoading(true);
    setResult({ word });
    const [dict, hi] = await Promise.all([
      lookupWord(word).catch(() => ({ error: "Network error." } as Partial<Result>)),
      lookupHindi(word),
    ]);
    const root = findRootFor(word);
    let error = dict.error;
    let definition = dict.definition;
    // If dictionary miss, try Wiktionary summary as fallback
    if (!definition && !dict.error) error = "No dictionary entry found.";
    if (!definition) {
      try {
        const wRes = await fetch(
          `https://en.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(word.toLowerCase())}`,
        );
        if (wRes.ok) {
          const wData = (await wRes.json()) as { extract?: string };
          if (wData.extract) {
            definition = wData.extract.split(/\n/)[0].slice(0, 260);
            error = undefined;
          }
        }
      } catch {
        /* ignore */
      }
    }
    setResult({
      word,
      pos: dict.pos,
      definition,
      example: dict.example,
      hindi: hi ?? undefined,
      hinglish: funnyHinglish(word, definition, hi ?? undefined),
      root,
      error: definition ? undefined : error,
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              🔎 Word lookup
            </p>
            <h1 className="truncate font-display text-3xl font-extrabold sm:text-5xl">
              Find your Word
            </h1>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            ← Home
          </Link>
        </div>

        <form
          onSubmit={search}
          className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-3xl border-brutal bg-card p-3 shadow-brutal-lg"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type any English word…"
            className="min-w-0 rounded-2xl border-brutal bg-background px-4 py-3 text-base font-semibold outline-none focus:bg-[var(--lemon)]"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !q.trim()}
            className="shrink-0 rounded-2xl border-brutal bg-[var(--hot)] px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm disabled:opacity-50"
          >
            {loading ? "…" : "Search"}
          </button>
        </form>

        {!result && (
          <div className="rounded-3xl border-brutal bg-card p-8 text-center shadow-brutal-lg">
            <div className="text-5xl">📖</div>
            <p className="mt-3 text-sm font-semibold">
              Koi bhi word likho — hum english, hindi, aur hinglish teeno me matlab denge.
            </p>
          </div>
        )}

        {result && (
          <div className="rounded-3xl border-brutal bg-card p-5 shadow-brutal-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Meaning
                </p>
                <h3 className="mt-1 break-words font-display text-3xl font-extrabold sm:text-4xl">
                  {result.word}
                </h3>
                {result.pos && (
                  <span className="mt-2 inline-block rounded-full border-brutal bg-[var(--lemon)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-brutal-sm">
                    {result.pos}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {loading && (
                <p className="text-sm text-muted-foreground">Looking up meaning…</p>
              )}
              {result.error && !result.definition && (
                <div className="rounded-2xl border-brutal bg-[var(--lemon)] p-3 text-sm font-semibold">
                  {result.error} Kuch aur try karo (spelling check karo).
                </div>
              )}
              {result.definition && (
                <div className="rounded-2xl border-brutal bg-[var(--mint)] p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
                    🇬🇧 English
                  </p>
                  <p className="mt-1 text-sm font-semibold">{result.definition}</p>
                  {result.example && (
                    <p className="mt-2 text-xs italic opacity-80">"{result.example}"</p>
                  )}
                </div>
              )}
              <div className="rounded-2xl border-brutal bg-[var(--lemon)] p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
                  🇮🇳 Hindi
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {loading
                    ? "Translate ho raha hai…"
                    : result.hindi ?? "Hindi meaning nahi mila."}
                </p>
              </div>
              {result.hinglish && (
                <div className="rounded-2xl border-brutal bg-[var(--hot)] p-3 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-90">
                    😄 Hinglish (funny)
                  </p>
                  <p className="mt-1 text-sm font-semibold">{result.hinglish}</p>
                </div>
              )}
              {result.root && (
                <div className="rounded-2xl border-brutal bg-[var(--cool)] p-3 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-90">
                    Root: {result.root.rootLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold">= {result.root.meaning}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
