import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadBookmarks, removeBookmark, type Bookmark } from "@/components/EbookReader";
import { findBook } from "@/data/books";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "My Bookmarks — Shabd Arena" },
      { name: "description", content: "Jump back to exactly where you left off in any story or novel." },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const [items, setItems] = useState<Bookmark[]>([]);
  useEffect(() => setItems(loadBookmarks()), []);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              🔖 Saved positions
            </p>
            <h1 className="truncate font-display text-3xl font-extrabold sm:text-5xl">
              My Bookmarks
            </h1>
          </div>
          <Link
            to="/books"
            className="shrink-0 rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            ← Library
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border-brutal bg-card p-8 text-center shadow-brutal-lg">
            <div className="text-6xl">📭</div>
            <h3 className="mt-4 font-display text-2xl font-extrabold">Koi bookmark abhi tak nahi</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Kisi bhi story ya novel me "➕ Add bookmark" pe tap karo — yahaan dikh jayega.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((b) => {
              const book = findBook(b.bookSlug);
              const isLine = b.paragraphIndex !== undefined && b.paragraphIndex >= 0;
              return (
                <div
                  key={`${b.bookSlug}-${b.chapterId}-${b.page}-${b.paragraphIndex ?? -1}-${b.savedAt}`}
                  className="rounded-2xl border-brutal bg-card p-4 shadow-brutal-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {book?.emoji ?? "📖"} {b.bookTitle}
                      </p>
                      <p className="mt-1 truncate font-display text-lg font-extrabold">
                        {b.chapterTitle}
                      </p>
                      {isLine && b.snippet && (
                        <p className="mt-2 rounded-lg border-brutal bg-[var(--lemon)] p-2 text-xs italic shadow-brutal-sm line-clamp-2">
                          "{b.snippet}"
                        </p>
                      )}
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {isLine ? "📍 Line bookmark · " : "📄 Page bookmark · "}
                        Page {b.page + 1} / {b.totalPages} · {new Date(b.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Link
                        to="/books/$slug"
                        params={{ slug: b.bookSlug }}
                        search={
                          isLine
                            ? { chapter: b.chapterId, page: b.page, para: b.paragraphIndex }
                            : { chapter: b.chapterId, page: b.page }
                        }
                        className="rounded-xl border-brutal bg-[var(--hot)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-brutal-sm"
                      >
                        Resume →
                      </Link>
                      <button
                        onClick={() => {
                          removeBookmark(b.bookSlug, b.chapterId, b.page, b.paragraphIndex);
                          setItems(loadBookmarks());
                        }}
                        className="rounded-xl border-brutal bg-card px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
