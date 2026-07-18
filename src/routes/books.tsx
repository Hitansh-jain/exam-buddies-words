import { createFileRoute, Link } from "@tanstack/react-router";
import { BOOKS } from "@/data/books";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Books — Shabd Arena" },
      { name: "description", content: "Read Sherlock Holmes and Rich Dad Poor Dad key lessons — click any tough word for meaning, root and how it's used." },
    ],
  }),
  component: BooksIndex,
});

function BooksIndex() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              📚 Read + Learn
            </p>
            <h1 className="truncate font-display text-3xl font-extrabold sm:text-5xl">
              Books Library
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Choose a book. Tap tough words. Meaning + root + example — sab ek jagah.
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
          {BOOKS.map((b) => (
            <Link
              key={b.slug}
              to="/books/$slug"
              params={{ slug: b.slug }}
              className={`block rounded-3xl border-brutal p-6 shadow-brutal transition-transform hover:-translate-y-1 bg-[var(--${b.color})] ${
                b.color === "cool" || b.color === "hot" ? "text-white" : ""
              }`}
            >
              <div className="text-5xl">{b.emoji}</div>
              <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                {b.title}
              </h2>
              <p className="mt-1 text-sm font-semibold opacity-90">by {b.author}</p>
              <p className="mt-3 text-sm opacity-90">{b.blurb}</p>
              <span className="mt-4 inline-block rounded-full border-brutal bg-card px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-foreground shadow-brutal-sm">
                Open reader →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
