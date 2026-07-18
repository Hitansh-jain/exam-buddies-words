import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
    () => (cat === "All" ? IDIOMS : IDIOMS.filter((i) => i.category === cat)),
    [cat]
  );
  const [order, setOrder] = useState(() => filtered.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // reset order when filter changes
  useMemo(() => {
    setOrder(filtered.map((_, i) => i));
    setIdx(0);
    setFlipped(false);
  }, [filtered]);

  const idiom = filtered[order[idx] ?? 0];

  const next = () => { setFlipped(false); setIdx((i) => (i + 1) % order.length); };
  const prev = () => { setFlipped(false); setIdx((i) => (i - 1 + order.length) % order.length); };
  const reshuffle = () => { setOrder(shuffle(filtered.map((_, i) => i))); setIdx(0); setFlipped(false); };

  if (!idiom) return null;

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Link to="/" className="brutal-btn bg-white text-black">← Home</Link>
          <div className="font-black text-lg">💬 Idioms · {idx + 1} / {filtered.length}</div>
          <button onClick={reshuffle} className="brutal-btn bg-electric text-black">🔀 Shuffle</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`brutal-btn text-sm ${cat === c ? "bg-hotpink text-white" : "bg-white text-black"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div
          onClick={() => setFlipped((f) => !f)}
          className="brutal-card bg-white p-6 sm:p-10 min-h-[420px] cursor-pointer select-none"
        >
          {!flipped ? (
            <div className="text-center">
              <div className="brutal-badge bg-black text-cream inline-block mb-4">{idiom.category}</div>
              <div className="text-3xl sm:text-5xl font-black break-words leading-tight">{idiom.idiom}</div>
              <div className="mt-8 inline-block brutal-badge bg-hotpink text-white">Tap to flip</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="brutal-badge bg-electric text-black inline-block mb-2">Meaning</div>
                <p className="text-lg font-semibold">{idiom.meaning}</p>
              </div>
              <div>
                <div className="brutal-badge bg-hotpink text-white inline-block mb-2">हिन्दी</div>
                <p className="text-lg font-semibold">{idiom.hindi}</p>
              </div>
              <div>
                <div className="brutal-badge bg-black text-cream inline-block mb-2">Hinglish</div>
                <p className="text-lg">{idiom.hinglish}</p>
              </div>
              <div>
                <div className="brutal-badge bg-white text-black border-2 border-black inline-block mb-2">Example</div>
                <p className="text-base italic">"{idiom.example}"</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <button onClick={prev} className="brutal-btn bg-white text-black flex-1">← Prev</button>
          <button onClick={next} className="brutal-btn bg-hotpink text-white flex-1">Next →</button>
        </div>
      </div>
    </div>
  );
}
