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
  hindi?: string;
  hindiLoading?: boolean;
  hinglishFun?: string;
  root?: { rootLabel: string; meaning: string } | null;
  usedInStory?: string;
};

export async function lookupWord(word: string): Promise<Partial<Meaning>> {
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
  return { pos: first?.partOfSpeech, definition: def?.definition, example: def?.example };
}

// Fast Hindi translation via Google translate public endpoint + localStorage cache.
const HI_CACHE_KEY = "shabd-arena-hi-cache-v1";
function readHiCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(HI_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeHiCache(word: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    const c = readHiCache();
    c[word] = value;
    window.localStorage.setItem(HI_CACHE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export async function lookupHindi(word: string): Promise<string | null> {
  const clean = word.toLowerCase().replace(/[^a-z-]/g, "");
  if (!clean) return null;
  const cache = readHiCache();
  if (cache[clean]) return cache[clean];

  // Try Google translate first (fast + accurate)
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(clean)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as unknown[];
      const arr = (data?.[0] as unknown[]) ?? [];
      const parts = arr
        .map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : ""))
        .join("")
        .trim();
      if (parts && parts.toLowerCase() !== clean) {
        writeHiCache(clean, parts);
        return parts;
      }
    }
  } catch {
    /* fall through */
  }

  // Fallback: MyMemory
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|hi`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const t = data?.responseData?.translatedText?.trim();
    if (t && t.toLowerCase() !== clean) {
      writeHiCache(clean, t);
      return t;
    }
  } catch {
    /* ignore */
  }
  return null;
}

const HING_EMOS = ["😅", "🔥", "💯", "😎", "💥", "🎯", "✨", "😤"];
export function funnyHinglish(word: string, def?: string, hindi?: string): string {
  const w = word.toLowerCase();
  const emo = HING_EMOS[w.length % HING_EMOS.length];
  const shortDef = def ? def.split(/[.,;:]/)[0].trim().toLowerCase() : "";
  const hi = hindi?.split(/[,;/]/)[0]?.trim();
  const meaningPart = shortDef
    ? `matlab "${shortDef}"`
    : hi
      ? `matlab "${hi}"`
      : "matlab kuch khaas vibe";
  const templates = [
    `"${w}" ${meaningPart} — jaise: "Bhai tu toh pura ${w} nikla!" ${emo}`,
    `Samjho aise: agar koi ${meaningPart}, toh bol sakte ho "wo ekdum ${w} hai" ${emo}`,
    `Exam me "${w}" dikha? Yaad rakh — ${meaningPart}. Example: "Uska attitude bilkul ${w} tha." ${emo}`,
    `Dost bola "${w}" — ${meaningPart}. Reply: "haan yaar, full ${w} mood." ${emo}`,
  ];
  return templates[w.length % templates.length];
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

const PAGE_CHAR_TARGET = 6000;
function paginate(text: string): string[] {
  const paras = text.split(/\n\n+/);
  const pages: string[] = [];
  let buf: string[] = [];
  let size = 0;
  for (const p of paras) {
    buf.push(p);
    size += p.length + 2;
    if (size >= PAGE_CHAR_TARGET) {
      pages.push(buf.join("\n\n"));
      buf = [];
      size = 0;
    }
  }
  if (buf.length) pages.push(buf.join("\n\n"));
  return pages.length ? pages : [text];
}

/* ─── Bookmarks (localStorage) ─── */
const BM_KEY = "shabd-arena-bookmarks-v1";
export type Bookmark = {
  bookSlug: string;
  chapterId: string;
  chapterTitle: string;
  bookTitle: string;
  page: number;
  totalPages: number;
  paragraphIndex?: number;
  snippet?: string;
  savedAt: number;
};
export function loadBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BM_KEY);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}
function bmKey(b: { bookSlug: string; chapterId: string; page: number; paragraphIndex?: number }) {
  return `${b.bookSlug}::${b.chapterId}::${b.page}::${b.paragraphIndex ?? -1}`;
}
export function saveBookmark(bm: Bookmark) {
  if (typeof window === "undefined") return;
  const k = bmKey(bm);
  const all = loadBookmarks().filter((b) => bmKey(b) !== k);
  all.unshift(bm);
  window.localStorage.setItem(BM_KEY, JSON.stringify(all.slice(0, 200)));
}
export function removeBookmark(
  bookSlug: string,
  chapterId: string,
  page?: number,
  paragraphIndex?: number,
) {
  if (typeof window === "undefined") return;
  const all = loadBookmarks().filter((b) => {
    if (b.bookSlug !== bookSlug || b.chapterId !== chapterId) return true;
    if (page !== undefined && b.page !== page) return true;
    if (paragraphIndex !== undefined && (b.paragraphIndex ?? -1) !== paragraphIndex) return true;
    return false;
  });
  window.localStorage.setItem(BM_KEY, JSON.stringify(all));
}

export function EbookReader({
  text,
  accent,
  bookSlug,
  bookTitle,
  chapterId,
  chapterTitle,
  initialPage = 0,
  initialParagraph,
}: {
  text: string;
  accent: string;
  bookSlug: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  initialPage?: number;
  initialParagraph?: number;
}) {
  const [meaning, setMeaning] = useState<Meaning | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageBookmarked, setPageBookmarked] = useState(false);
  const [paraBookmarks, setParaBookmarks] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

  const pages = useMemo(() => paginate(text), [text]);
  useEffect(() => setPage(Math.min(initialPage, Math.max(0, paginate(text).length - 1))), [text, initialPage]);

  useEffect(() => {
    const list = loadBookmarks().filter(
      (b) => b.bookSlug === bookSlug && b.chapterId === chapterId && b.page === page,
    );
    setPageBookmarked(list.some((b) => b.paragraphIndex === undefined || b.paragraphIndex === -1));
    setParaBookmarks(new Set(list.map((b) => b.paragraphIndex ?? -1).filter((n) => n >= 0)));
  }, [bookSlug, chapterId, page]);


  const currentPage = pages[Math.min(page, pages.length - 1)] ?? "";

  const tokens = useMemo(() => {
    return currentPage.split(/\n\n+/).map((para, pi) => {
      const parts = para.split(/(\s+)/).map((part, i) => {
        if (/^\s+$/.test(part)) return { key: `${pi}-${i}-s`, kind: "space" as const, text: part };
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
  }, [currentPage]);

  async function handleClick(wordOnly: string) {
    if (!wordOnly) return;
    const idx = textRef.current.toLowerCase().indexOf(wordOnly.toLowerCase());
    const sentence = idx >= 0 ? findSentence(textRef.current, idx) : "";
    const root = findRootFor(wordOnly);
    setMeaning({ word: wordOnly, loading: true, hindiLoading: true, root, usedInStory: sentence });
    try {
      const res = await lookupWord(wordOnly);
      setMeaning((prev) =>
        prev && prev.word === wordOnly
          ? { ...prev, loading: false, ...res, hinglishFun: funnyHinglish(wordOnly, res.definition) }
          : prev,
      );
    } catch {
      setMeaning((prev) =>
        prev && prev.word === wordOnly
          ? { ...prev, loading: false, error: "Network error. Try again." }
          : prev,
      );
    }
    const hi = await lookupHindi(wordOnly);
    setMeaning((prev) =>
      prev && prev.word === wordOnly ? { ...prev, hindi: hi ?? undefined, hindiLoading: false } : prev,
    );
  }

  function togglePageBookmark() {
    if (pageBookmarked) {
      removeBookmark(bookSlug, chapterId, page, -1);
      setPageBookmarked(false);
      setToast("Bookmark hataya");
    } else {
      saveBookmark({
        bookSlug,
        chapterId,
        chapterTitle,
        bookTitle,
        page,
        totalPages: pages.length,
        savedAt: Date.now(),
      });
      setPageBookmarked(true);
      setToast("Page bookmark saved ✅");
    }
    setTimeout(() => setToast(null), 1600);
  }

  function toggleParaBookmark(paraIdx: number, snippet: string) {
    if (paraBookmarks.has(paraIdx)) {
      removeBookmark(bookSlug, chapterId, page, paraIdx);
      const next = new Set(paraBookmarks);
      next.delete(paraIdx);
      setParaBookmarks(next);
      setToast("Line bookmark hataya");
    } else {
      saveBookmark({
        bookSlug,
        chapterId,
        chapterTitle,
        bookTitle,
        page,
        totalPages: pages.length,
        paragraphIndex: paraIdx,
        snippet: snippet.slice(0, 140),
        savedAt: Date.now(),
      });
      const next = new Set(paraBookmarks);
      next.add(paraIdx);
      setParaBookmarks(next);
      setToast("Line bookmark saved ✅");
    }
    setTimeout(() => setToast(null), 1600);
  }

  // Scroll to requested paragraph after render
  useEffect(() => {
    if (initialParagraph === undefined || initialParagraph < 0) return;
    const id = `para-${initialParagraph}`;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-[var(--hot)]", "rounded-xl");
        setTimeout(() => el.classList.remove("ring-4", "ring-[var(--hot)]", "rounded-xl"), 2400);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [initialParagraph, page, tokens.length]);

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
            📖 Tap highlighted words
          </p>
          <div className="flex items-center gap-2">
            {pages.length > 1 && (
              <span className="rounded-full border-brutal bg-[var(--lemon)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
                Page {page + 1} / {pages.length}
              </span>
            )}
            <button
              onClick={togglePageBookmark}
              className={`rounded-full border-brutal px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm ${
                pageBookmarked ? "bg-[var(--hot)] text-white" : "bg-card"
              }`}
              title="Save this page"
            >
              {pageBookmarked ? "🔖 Page saved" : "➕ Bookmark page"}
            </button>
          </div>
        </div>
        <p className="mb-3 text-[11px] font-semibold text-muted-foreground">
          💡 Tip: Kisi bhi line ke saamne 🔖 dabaao — waha se resume ho jayega.
        </p>
        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed sm:text-base sm:leading-8">
          {tokens.map((para, paraIdx) => {
            const paraText = para.parts.map((p) => p.text).join("");
            const isBm = paraBookmarks.has(paraIdx);
            return (
              <div
                key={para.key}
                id={`para-${paraIdx}`}
                className="group relative mb-4 -mx-2 rounded-lg px-2 py-1 transition-colors hover:bg-[var(--lemon)]/40"
              >
                <button
                  type="button"
                  onClick={() => toggleParaBookmark(paraIdx, paraText.trim())}
                  className={`absolute -left-1 top-1 hidden shrink-0 rounded-md border-brutal px-1.5 py-0.5 text-[10px] font-extrabold shadow-brutal-sm group-hover:block sm:-left-8 sm:block sm:opacity-40 sm:hover:opacity-100 ${
                    isBm ? "bg-[var(--hot)] text-white sm:opacity-100" : "bg-card"
                  }`}
                  title={isBm ? "Remove line bookmark" : "Bookmark this line"}
                >
                  🔖
                </button>
                <p>
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
              </div>
            );
          })}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setPage((p) => Math.max(0, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === 0}
            className="rounded-2xl border-brutal bg-card px-4 py-3 text-sm font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm disabled:opacity-40 sm:text-base"
          >
            ← Prev page
          </button>
          <button
            onClick={() => {
              setPage((p) => Math.min(pages.length - 1, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page >= pages.length - 1}
            className="rounded-2xl border-brutal bg-[var(--hot)] px-4 py-3 text-sm font-extrabold text-white shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm disabled:opacity-40 sm:text-base"
          >
            Next page →
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border-brutal bg-foreground px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-background shadow-brutal-sm">
          {toast}
        </div>
      )}

      {meaning && <MeaningPopup meaning={meaning} onClose={() => setMeaning(null)} />}
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
        className="max-h-[85vh] w-full max-w-lg animate-pop overflow-y-auto rounded-3xl border-brutal bg-card p-5 shadow-brutal-lg sm:p-6"
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
                🇬🇧 English
              </p>
              <p className="mt-1 text-sm font-semibold">{meaning.definition}</p>
              {meaning.example && (
                <p className="mt-2 text-xs italic opacity-80">"{meaning.example}"</p>
              )}
            </div>
          )}
          <div className="rounded-2xl border-brutal bg-[var(--lemon)] p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
              🇮🇳 Hindi
            </p>
            <p className="mt-1 text-sm font-semibold">
              {meaning.hindiLoading
                ? "Translate ho raha hai…"
                : meaning.hindi ?? "Hindi meaning available nahi (network/API)."}
            </p>
          </div>
          {meaning.hinglishFun && (
            <div className="rounded-2xl border-brutal bg-[var(--hot)] p-3 text-white">
              <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-90">
                😄 Hinglish (funny)
              </p>
              <p className="mt-1 text-sm font-semibold">{meaning.hinglishFun}</p>
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
