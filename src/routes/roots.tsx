import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ROOTS } from "@/data/roots";

export const Route = createFileRoute("/roots")({
  head: () => ({
    meta: [
      { title: "Root Words Flashcards — Shabd Arena" },
      { name: "description", content: "Learn 400+ Latin & Greek root words with funny Hinglish hooks and example words — flashcard style." },
    ],
  }),
  component: RootsPage,
});

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function RootsPage() {
  const [order, setOrder] = useState<number[]>(() => ROOTS.map((_, i) => i));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const root = useMemo(() => ROOTS[order[i] ?? 0], [order, i]);
  const progress = ((i + 1) / order.length) * 100;

  useEffect(() => setFlipped(false), [i]);

  const next = () => setI((n) => (n + 1) % order.length);
  const prev = () => setI((n) => (n - 1 + order.length) % order.length);
  const reshuffle = () => { setOrder(shuffle(ROOTS.map((_, i) => i))); setI(0); };

  if (!root) return null;

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Link
            to="/"
            className="rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            ← Home
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              🧬 Root DNA
            </p>
            <p className="truncate text-sm font-extrabold sm:text-base">
              {i + 1} / {order.length}
            </p>
          </div>
          <button
            onClick={reshuffle}
            className="rounded-xl border-brutal bg-[var(--lemon)] px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            🔀
          </button>
        </div>

        <div className="mb-5 h-2 w-full overflow-hidden rounded-full border-brutal bg-card">
          <div className="h-full bg-[var(--cool)] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div key={root.id + (flipped ? "-b" : "-f")} className="animate-pop">
          {!flipped ? (
            <button
              onClick={() => setFlipped(true)}
              className="block w-full rounded-3xl border-brutal bg-card p-6 text-left shadow-brutal-lg sm:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border-brutal bg-[var(--lemon)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
                  {root.origin} Root
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                  Tap to flip
                </span>
              </div>
              <h2 className="mt-6 break-words font-display text-4xl font-extrabold leading-none sm:text-6xl">
                {root.root}-
              </h2>
              <p className="mt-3 text-lg font-semibold text-muted-foreground sm:text-xl">
                = {root.meaning}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[var(--cool)]">
                <span className="grid h-8 w-8 place-items-center rounded-full border-brutal bg-[var(--cool)] text-white">
                  ↻
                </span>
                Flip for examples
              </div>
            </button>
          ) : (
            <div className="rounded-3xl border-brutal bg-card p-5 shadow-brutal-lg sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Root
                  </p>
                  <h2 className="mt-1 break-words font-display text-3xl font-extrabold sm:text-4xl">
                    {root.root}- <span className="text-muted-foreground">= {root.meaning}</span>
                  </h2>
                </div>
                <button
                  onClick={() => setFlipped(false)}
                  className="shrink-0 rounded-xl border-brutal bg-[var(--lemon)] px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
                >
                  ↺ Flip
                </button>
              </div>

              <div className="mt-4 rounded-2xl border-brutal bg-[var(--hot)] p-3 text-white">
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-90">
                  😄 Hinglish hook
                </p>
                <p className="mt-1 text-base font-semibold">{root.hinglish}</p>
              </div>

              <div className="mt-4 rounded-2xl border-brutal bg-[var(--mint)] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                  Example words
                </p>
                <ul className="mt-2 space-y-1.5">
                  {root.examples.map((ex) => (
                    <li key={ex.word} className="flex flex-wrap items-baseline gap-2">
                      <span className="font-display text-base font-extrabold sm:text-lg">{ex.word}</span>
                      <span className="text-sm opacity-80">— {ex.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={prev}
            className="rounded-2xl border-brutal bg-card px-4 py-3 text-sm font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm sm:text-base"
          >
            ← Prev
          </button>
          <button
            onClick={next}
            className="rounded-2xl border-brutal bg-[var(--hot)] px-4 py-3 text-sm font-extrabold text-white shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm sm:text-base"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
