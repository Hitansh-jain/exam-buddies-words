import { createFileRoute, Link } from "@tanstack/react-router";
import { ROOTS } from "@/data/roots";

export const Route = createFileRoute("/roots")({
  head: () => ({
    meta: [
      { title: "Root Words — Shabd Arena" },
      { name: "description", content: "Learn Latin & Greek root words in a funny Hinglish way — unlock 100s of English words with 30 core roots." },
    ],
  }),
  component: RootsPage,
});

function RootsPage() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              🧬 Word DNA
            </p>
            <h1 className="truncate font-display text-3xl font-extrabold sm:text-5xl">
              Root Words
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Ek root — 10 words free. Latin aur Greek se aaye legends.
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            ← Home
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROOTS.map((r) => (
            <article
              key={r.id}
              className="rounded-3xl border-brutal bg-card p-5 shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {r.root}
                </h2>
                <span className="shrink-0 rounded-full border-brutal bg-[var(--cool)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {r.origin}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold">= {r.meaning}</p>
              <p className="mt-2 rounded-2xl border-brutal bg-[var(--lemon)] px-3 py-2 text-sm font-semibold">
                💡 {r.hinglish}
              </p>
              <div className="mt-3 grid gap-2">
                {r.examples.map((ex) => (
                  <div
                    key={ex.word}
                    className="rounded-xl border-brutal bg-background p-2"
                  >
                    <p className="font-display text-base font-extrabold">{ex.word}</p>
                    <p className="text-xs text-muted-foreground">{ex.meaning}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
