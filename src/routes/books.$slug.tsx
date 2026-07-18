import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { findBook, type Chapter } from "@/data/books";
import { EbookReader } from "@/components/EbookReader";

export const Route = createFileRoute("/books/$slug")({
  head: ({ params }) => {
    const book = findBook(params.slug);
    return {
      meta: [
        { title: `${book?.title ?? "Book"} — Shabd Arena` },
        { name: "description", content: book?.blurb ?? "Read and learn vocab in context." },
      ],
    };
  },
  loader: ({ params }) => {
    const book = findBook(params.slug);
    if (!book) throw notFound();
    return { book };
  },
  component: BookReaderPage,
});

function BookReaderPage() {
  const { book } = Route.useLoaderData();
  const [chapterId, setChapterId] = useState<string>(book.chapters[0]?.id ?? "");
  const chapter = book.chapters.find((c) => c.id === chapterId) ?? book.chapters[0];

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              {book.emoji} {book.author}
            </p>
            <h1 className="truncate font-display text-2xl font-extrabold sm:text-4xl">
              {book.title}
            </h1>
          </div>
          <Link
            to="/books"
            className="shrink-0 rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            ← Library
          </Link>
        </div>

        {book.copyrightNote && (
          <div className="mb-4 rounded-2xl border-brutal bg-[var(--lemon)] p-3 text-xs font-semibold shadow-brutal-sm">
            ⚠️ {book.copyrightNote}
          </div>
        )}

        {book.chapters.length > 1 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {book.chapters.map((c) => (
              <button
                key={c.id}
                onClick={() => setChapterId(c.id)}
                className={`rounded-full border-brutal px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm ${
                  c.id === chapterId ? `bg-[var(--${book.color})] ${book.color === "cool" || book.color === "hot" ? "text-white" : ""}` : "bg-card"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        <ChapterView key={chapter.id} chapter={chapter} accent={book.color} />
      </div>
    </div>
  );
}

function ChapterView({ chapter, accent }: { chapter: Chapter; accent: string }) {
  const [text, setText] = useState<string>(chapter.inlineText ?? "");
  const [loading, setLoading] = useState<boolean>(!chapter.inlineText);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chapter.inlineText) {
      setText(chapter.inlineText);
      setLoading(false);
      return;
    }
    if (!chapter.source) return;
    const src = chapter.source;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/public/gutenberg?id=${src.gutenbergId}`);
        if (!res.ok) throw new Error("Fetch failed");
        const raw = await res.text();
        if (cancelled) return;
        const cleaned = extractBody(raw);
        setText(cleaned);
      } catch {
        if (!cancelled) setError("Couldn't load this chapter. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chapter]);

  if (loading) {
    return (
      <div className="rounded-3xl border-brutal bg-card p-10 text-center shadow-brutal-lg">
        <div className="animate-pop text-4xl">📖</div>
        <p className="mt-3 text-sm font-semibold">Loading the text…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-3xl border-brutal bg-[var(--hot)] p-6 text-white shadow-brutal-lg">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }
  if (!text.trim()) {
    return (
      <div className="rounded-3xl border-brutal bg-card p-6 shadow-brutal-lg">
        <p>No content available.</p>
      </div>
    );
  }

  return <EbookReader text={text} accent={accent} />;
}

// Strip the Project Gutenberg legal header/footer and normalize whitespace.
function extractBody(raw: string): string {
  const startMarker = /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i;
  const endMarker = /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i;
  const s = raw.search(startMarker);
  const e = raw.search(endMarker);
  let body = raw;
  if (s !== -1) body = body.slice(s).replace(startMarker, "");
  if (e !== -1) {
    const eIdx = body.search(endMarker);
    if (eIdx !== -1) body = body.slice(0, eIdx);
  }
  // Collapse 3+ newlines to 2
  body = body.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return body;
}
