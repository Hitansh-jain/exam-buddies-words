import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { IDIOMS } from "@/data/idioms";

export const Route = createFileRoute("/idioms")({
  head: () => ({
    meta: [
      { title: "Idioms Flashcards — Shabd Arena" },
      { name: "description", content: "500+ English idioms explained in Hindi & Hinglish with funny examples — flashcard style." },
    ],
  }),
  component: IdiomsPage,
});

const CATEGORIES = ["All", "Exam Favourite", "Everyday", "Business", "Emotion"] as const;

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function IdiomsPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const filtered = useMemo(
    () => (cat === "All" ? IDIOMS : IDIOMS.filter((x) => x.category === cat)),
    [cat],
  );
  const [order, setOrder] = useState<number[]>(() => filtered.map((_, i) => i));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setOrder(filtered.map((_, i) => i));
    setI(0);
    setFlipped(false);
  }, [filtered]);

  useEffect(() => setFlipped(false), [i]);

  const idiom = filtered[order[i] ?? 0];
  const progress = order.length ? ((i + 1) / order.length) * 100 : 0;

  const next = () => setI((n) => (n + 1) % order.length);
  const prev = () => setI((n) => (n - 1 + order.length) % order.length);
  const reshuffle = () => { setOrder(shuffle(filtered.map((_, i) => i))); setI(0); };

  if (!idiom) return null;

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
              🎭 Idioms
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

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border-brutal px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-brutal-sm transition-transform hover:-translate-y-0.5 ${
                cat === c ? "bg-[var(--hot)] text-white" : "bg-card"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mb-5 h-2 w-full overflow-hidden rounded-full border-brutal bg-card">
          <div className="h-full bg-[var(--hot)] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div key={i + (flipped ? "-b" : "-f")} className="animate-pop">
          {!flipped ? (
            <button
              onClick={() => setFlipped(true)}
              className="block w-full rounded-3xl border-brutal bg-card p-6 text-left shadow-brutal-lg sm:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border-brutal bg-[var(--lemon)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
                  {idiom.category}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                  Tap to flip
                </span>
              </div>
              <h2 className="mt-6 break-words font-display text-3xl font-extrabold leading-tight sm:text-5xl">
                {idiom.idiom}
              </h2>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[var(--cool)]">
                <span className="grid h-8 w-8 place-items-center rounded-full border-brutal bg-[var(--cool)] text-white">
                  ↻
                </span>
                Flip for meaning
              </div>
            </button>
          ) : (
            <div className="rounded-3xl border-brutal bg-card p-5 shadow-brutal-lg sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Idiom
                  </p>
                  <h2 className="mt-1 break-words font-display text-2xl font-extrabold sm:text-3xl">
                    {idiom.idiom}
                  </h2>
                </div>
                <button
                  onClick={() => setFlipped(false)}
                  className="shrink-0 rounded-xl border-brutal bg-[var(--lemon)] px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
                >
                  ↺ Flip
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <Row bg="bg-[var(--mint)]" label="🇬🇧 English" text={idiom.meaning} />
                <Row bg="bg-[var(--lemon)]" label="🇮🇳 Hindi" text={idiom.hindi} />
                <Row bg="bg-[var(--hot)] text-white" label="😄 Hinglish" text={idiom.hinglish} />
              </div>

              <div className="mt-4 rounded-2xl border-brutal bg-background p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Example
                </p>
                <p className="mt-1 text-sm italic">"{idiom.example}"</p>
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

function Row({ bg, label, text }: { bg: string; label: string; text: string }) {
  return (
    <div className={`rounded-2xl border-brutal p-3 ${bg}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-snug">{text}</p>
    </div>
  );
}
