import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  const [order, setOrder] = useState(() => ROOTS.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const root = useMemo(() => ROOTS[order[idx]], [order, idx]);

  const next = () => { setFlipped(false); setIdx((i) => (i + 1) % order.length); };
  const prev = () => { setFlipped(false); setIdx((i) => (i - 1 + order.length) % order.length); };
  const reshuffle = () => { setOrder(shuffle(ROOTS.map((_, i) => i))); setIdx(0); setFlipped(false); };

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link to="/" className="brutal-btn bg-white text-black">← Home</Link>
          <div className="font-black text-lg">🧬 Root DNA · {idx + 1} / {ROOTS.length}</div>
          <button onClick={reshuffle} className="brutal-btn bg-electric text-black">🔀 Shuffle</button>
        </div>

        <div
          onClick={() => setFlipped((f) => !f)}
          className="brutal-card bg-white p-6 sm:p-10 min-h-[420px] cursor-pointer select-none"
        >
          {!flipped ? (
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2">{root.origin} Root</div>
              <div className="text-5xl sm:text-7xl font-black break-words">{root.root}-</div>
              <div className="mt-4 text-2xl sm:text-3xl font-bold">= {root.meaning}</div>
              <div className="mt-8 inline-block brutal-badge bg-hotpink text-white">Tap to flip</div>
            </div>
          ) : (
            <div>
              <div className="brutal-badge bg-black text-cream inline-block mb-3">Hinglish hook</div>
              <p className="text-lg sm:text-xl font-semibold mb-6">{root.hinglish}</p>
              <div className="brutal-badge bg-electric text-black inline-block mb-3">Example words</div>
              <ul className="space-y-2">
                {root.examples.map((ex) => (
                  <li key={ex.word} className="flex flex-wrap gap-2 items-baseline">
                    <span className="font-black text-lg break-words">{ex.word}</span>
                    <span className="text-black/70">— {ex.meaning}</span>
                  </li>
                ))}
              </ul>
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
