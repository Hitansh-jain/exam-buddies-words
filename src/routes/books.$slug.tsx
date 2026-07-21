import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  findBook,
  type Book,
  type Chapter,
  extractStoryFromCollection,
  getSiblingTitles,
} from "@/data/books";
import { EbookReader } from "@/components/EbookReader";

type ReaderSearch = { chapter?: string; page?: number; para?: number };

export const Route = createFileRoute("/books/$slug")({
  validateSearch: (raw: Record<string, unknown>): ReaderSearch => ({
    chapter: typeof raw.chapter === "string" ? raw.chapter : undefined,
    page: typeof raw.page === "number" ? raw.page : raw.page ? Number(raw.page) : undefined,
    para: typeof raw.para === "number" ? raw.para : raw.para ? Number(raw.para) : undefined,
  }),
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

const rawCache = new Map<number, string>();

function BookReaderPage() {
  const { book } = Route.useLoaderData() as { book: Book };
  const search = Route.useSearch();
  const initialChapterId =
    (search.chapter && book.chapters.find((c) => c.id === search.chapter)?.id) ??
    book.chapters[0]?.id ??
    "";
  const [chapterId, setChapterId] = useState<string>(initialChapterId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const chapter = book.chapters.find((c) => c.id === chapterId) ?? book.chapters[0];
  const initialPage = chapterId === initialChapterId ? (search.page ?? 0) : 0;

  const groups = useMemo(() => {
    const map = new Map<string, Chapter[]>();
    for (const c of book.chapters) {
      const g = c.group ?? "Chapters";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    }
    return Array.from(map.entries());
  }, [book]);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              {book.emoji} {book.author}
            </p>
            <h1 className="truncate font-display text-2xl font-extrabold sm:text-4xl">
              {book.title}
            </h1>
          </div>
          <Link
            to="/bookmarks"
            className="shrink-0 rounded-xl border-brutal bg-[var(--lemon)] px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            🔖
          </Link>
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
          <div className="mb-5">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border-brutal bg-card px-4 py-3 text-left shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {chapter.group ?? "Chapter"}
                </span>
                <span className="block truncate text-sm font-extrabold sm:text-base">
                  {chapter.title}
                </span>
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-brutal bg-[var(--lemon)] text-sm font-extrabold shadow-brutal-sm">
                {pickerOpen ? "▲" : "▼"}
              </span>
            </button>

            {pickerOpen && (
              <div className="mt-3 max-h-96 overflow-y-auto rounded-2xl border-brutal bg-card p-3 shadow-brutal-sm">
                {groups.map(([g, list]) => (
                  <div key={g} className="mb-3 last:mb-0">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {g} · {list.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {list.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setChapterId(c.id);
                            setPickerOpen(false);
                          }}
                          className={`rounded-full border-brutal px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-brutal-sm transition-transform hover:-translate-y-0.5 ${
                            c.id === chapterId
                              ? `bg-[var(--${book.color})] ${book.color === "cool" || book.color === "hot" ? "text-white" : ""}`
                              : "bg-background"
                          }`}
                        >
                          {c.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <ChapterView
          key={chapter.id}
          book={book}
          chapter={chapter}
          accent={book.color}
          initialPage={initialPage}
        />
      </div>
    </div>
  );
}

function ChapterView({
  book,
  chapter,
  accent,
  initialPage,
}: {
  book: Book;
  chapter: Chapter;
  accent: string;
  initialPage: number;
}) {
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

    const siblings = getSiblingTitles(book, chapter);
    const isCollection = siblings.length > 1;

    const process = (raw: string): string => {
      const body = extractBody(raw);
      if (isCollection) return extractStoryFromCollection(body, siblings, chapter.title);
      return body;
    };

    const cached = rawCache.get(src.gutenbergId);
    if (cached) {
      setText(process(cached));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/public/gutenberg?id=${src.gutenbergId}`);
        if (!res.ok) throw new Error("Fetch failed");
        const raw = await res.text();
        if (cancelled) return;
        rawCache.set(src.gutenbergId, raw);
        setText(process(raw));
      } catch {
        if (!cancelled) setError("Couldn't load this chapter. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chapter, book]);

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

  return (
    <EbookReader
      text={text}
      accent={accent}
      bookSlug={book.slug}
      bookTitle={book.title}
      chapterId={chapter.id}
      chapterTitle={chapter.title}
      initialPage={initialPage}
    />
  );
}

function extractBody(raw: string): string {
  const startMarker = /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i;
  const endMarker = /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i;
  const s = raw.search(startMarker);
  let body = raw;
  if (s !== -1) body = body.slice(s).replace(startMarker, "");
  const eIdx = body.search(endMarker);
  if (eIdx !== -1) body = body.slice(0, eIdx);
  return body.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
