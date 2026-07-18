import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { IDIOMS, type Idiom } from "@/data/idioms";

export const Route = createFileRoute("/idioms")({
  head: () => ({
    meta: [
      { title: "Idioms — Shabd Arena" },
      { name: "description", content: "40+ high-frequency English idioms in Hindi & Hinglish — the black-book classics examiners love." },
    ],
  }),
  component: IdiomsPage,
});

const CATS: Idiom["category"][] = ["Everyday", "Exam Favourite", "Business", "Emotion"];

function IdiomsPage() {
  const [cat, setCat] = useState<Idiom["category"] | "All">("All");
  const filtered = useMemo(
    () => (cat === "All" ? IDIOMS : IDIOMS.filter((i) => i.category === cat)),
    [cat],
  );

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              🎭 Muhavare in English
            </p>
            <h1 className="truncate font-display text-3xl font-extrabold sm:text-5xl">
              Idioms Black Book
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Har exam ka favourite section — meaning + Hindi + Hinglish twist.
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            ← Home
          </Link>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(["All", ...CATS] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border-brutal px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm ${
                cat === c ? "bg-[var(--hot)] text-white" : "bg-card"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((i) => (
            <article
              key={i.id}
              className="rounded-2xl border-brutal bg-card p-4 shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-extrabold sm:text-xl">
                  {i.idiom}
                </h2>
                <span className="shrink-0 rounded-full bg-[var(--lemon)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {i.category}
                </span>
              </div>
              <p className="mt-2 text-sm">{i.meaning}</p>
              <p className="mt-1 text-sm font-semibold">🇮🇳 {i.hindi}</p>
              <p className="mt-2 rounded-xl border-brutal bg-[var(--mint)] px-3 py-2 text-xs font-semibold">
                😄 {i.hinglish}
              </p>
              <p className="mt-2 text-xs italic text-muted-foreground">"{i.example}"</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
