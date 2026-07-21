import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WORDS, type Word } from "@/data/words";
import { ROOTS } from "@/data/roots";
import { IDIOMS } from "@/data/idioms";
import { ACTIVE_PASSIVE, ONE_WORD } from "@/data/grammar";

export const Route = createFileRoute("/mock/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Mock #${params.id} — Shabd Arena` },
      { name: "description", content: "25-question mixed mock test — SSC / Bank exam pattern." },
    ],
  }),
  component: MockPlayer,
});

/* ---------- deterministic RNG so a given Mock # is stable ---------- */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleSeed<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

/* ------------------------------ Types ------------------------------ */
type Q = {
  kind: "meaning" | "synonym" | "antonym" | "root" | "idiom" | "voice" | "oneword";
  prompt: string;
  subject?: string; // the word / idiom / sentence
  tag?: string; // small chip above prompt (e.g. PYQ / source)
  options: string[];
  answer: string;
  note?: string; // explanation shown after answering
};

/* ------------------------- Question builders ----------------------- */
function qMeaning(w: Word, rnd: () => number): Q {
  const distract = shuffleSeed(WORDS.filter((x) => x.id !== w.id), rnd)
    .slice(0, 3)
    .map((x) => x.english);
  return {
    kind: "meaning",
    prompt: "Iska sahi meaning choose karo:",
    subject: w.word,
    tag: w.pyq ? `PYQ • ${w.pyq}` : w.source,
    options: shuffleSeed([w.english, ...distract], rnd),
    answer: w.english,
    note: `${w.word} = ${w.hindi}. ${w.hinglish}`,
  };
}
function qSyn(w: Word, rnd: () => number): Q | null {
  if (!w.synonyms.length) return null;
  const ans = pick(w.synonyms, rnd);
  const pool = WORDS.filter((x) => x.id !== w.id).flatMap((x) => x.antonyms);
  const distract = shuffleSeed(pool.filter((v) => v && v !== ans), rnd).slice(0, 3);
  return {
    kind: "synonym",
    prompt: "Synonym choose karo:",
    subject: w.word,
    tag: w.pyq ? `PYQ • ${w.pyq}` : undefined,
    options: shuffleSeed([ans, ...distract], rnd),
    answer: ans,
    note: `${w.word} ke synonyms: ${w.synonyms.join(", ")}.`,
  };
}
function qAnt(w: Word, rnd: () => number): Q | null {
  if (!w.antonyms.length) return null;
  const ans = pick(w.antonyms, rnd);
  const pool = WORDS.filter((x) => x.id !== w.id).flatMap((x) => x.synonyms);
  const distract = shuffleSeed(pool.filter((v) => v && v !== ans), rnd).slice(0, 3);
  return {
    kind: "antonym",
    prompt: "Antonym choose karo:",
    subject: w.word,
    tag: w.pyq ? `PYQ • ${w.pyq}` : undefined,
    options: shuffleSeed([ans, ...distract], rnd),
    answer: ans,
    note: `${w.word} ke antonyms: ${w.antonyms.join(", ")}.`,
  };
}
function qRoot(rnd: () => number): Q {
  const r = pick(ROOTS, rnd);
  const distract = shuffleSeed(ROOTS.filter((x) => x.id !== r.id), rnd)
    .slice(0, 3)
    .map((x) => x.meaning);
  return {
    kind: "root",
    prompt: "Is root ka meaning kya hai?",
    subject: `${r.root}-`,
    tag: `${r.origin} root`,
    options: shuffleSeed([r.meaning, ...distract], rnd),
    answer: r.meaning,
    note: `Examples: ${r.examples.slice(0, 3).map((e) => e.word).join(", ")}. Hinglish: ${r.hinglish}`,
  };
}
function qIdiom(rnd: () => number): Q {
  const i = pick(IDIOMS, rnd);
  const distract = shuffleSeed(IDIOMS.filter((x) => x.idiom !== i.idiom), rnd)
    .slice(0, 3)
    .map((x) => x.meaning);
  return {
    kind: "idiom",
    prompt: "Is idiom ka meaning kya hai?",
    subject: i.idiom,
    tag: i.category,
    options: shuffleSeed([i.meaning, ...distract], rnd),
    answer: i.meaning,
    note: `Hindi: ${i.hindi} · Hinglish: ${i.hinglish}`,
  };
}
function qVoice(rnd: () => number): Q {
  const p = pick(ACTIVE_PASSIVE, rnd);
  const distract = shuffleSeed(ACTIVE_PASSIVE.filter((x) => x.passive !== p.passive), rnd)
    .slice(0, 3)
    .map((x) => x.passive);
  return {
    kind: "voice",
    prompt: "Passive voice me convert karo:",
    subject: `"${p.active}"`,
    tag: "Voice",
    options: shuffleSeed([p.passive, ...distract], rnd),
    answer: p.passive,
    note: `Active: "${p.active}" → Passive: "${p.passive}"`,
  };
}
function qOneWord(rnd: () => number): Q {
  const o = pick(ONE_WORD, rnd);
  const distract = shuffleSeed(ONE_WORD.filter((x) => x.answer !== o.answer), rnd)
    .slice(0, 3)
    .map((x) => x.answer);
  return {
    kind: "oneword",
    prompt: "One-word substitution:",
    subject: o.clue,
    tag: "Vocabulary",
    options: shuffleSeed([o.answer, ...distract], rnd),
    answer: o.answer,
    note: `Answer: ${o.answer}`,
  };
}

function buildMock(id: number): Q[] {
  const rnd = mulberry32(id * 9973 + 17);
  const words = shuffleSeed(WORDS, rnd);
  const out: Q[] = [];
  // 8 meaning
  for (let i = 0; i < 8; i++) out.push(qMeaning(words[i], rnd));
  // 4 synonym
  let taken = 8;
  for (let n = 0; n < 4 && taken < words.length; taken++) {
    const q = qSyn(words[taken], rnd);
    if (q) { out.push(q); n++; }
  }
  // 4 antonym
  for (let n = 0; n < 4 && taken < words.length; taken++) {
    const q = qAnt(words[taken], rnd);
    if (q) { out.push(q); n++; }
  }
  // 3 root, 3 idiom, 3 voice
  for (let i = 0; i < 3; i++) out.push(qRoot(rnd));
  for (let i = 0; i < 3; i++) out.push(qIdiom(rnd));
  for (let i = 0; i < 3; i++) out.push(qVoice(rnd));
  // 0 one-word... total = 25. Actually 8+4+4+3+3+3 = 25 ✓
  // Sprinkle one-word into first 10 by replacing 2 for variety:
  out[6] = qOneWord(rnd);
  out[13] = qOneWord(rnd);
  return out;
}

/* ------------------------------ UI --------------------------------- */
function MockPlayer() {
  const { id } = Route.useParams();
  const mockId = Number(id) || 1;
  const questions = useMemo(() => buildMock(mockId), [mockId]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const done = i >= questions.length;
  const q = questions[i];

  function pickOpt(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) {
      setCorrect((c) => c + 1);
      setScore((s) => s + 4);
    } else {
      setScore((s) => s - 1);
    }
  }
  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background bg-grid">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-3xl border-brutal bg-card p-8 text-center shadow-brutal-lg">
            <div className="text-6xl">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
              Mock #{mockId} complete!
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ResultStat label="Correct" value={`${correct}/${questions.length}`} bg="bg-[var(--mint)]" />
              <ResultStat label="Score (+4/-1)" value={score} bg="bg-[var(--lemon)]" />
              <ResultStat label="Accuracy" value={`${pct}%`} bg="bg-[var(--hot)] text-white" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to="/mock/$id"
                params={{ id: String(mockId % 50 + 1) }}
                className="rounded-2xl border-brutal bg-[var(--cool)] px-6 py-3 text-base font-extrabold text-white shadow-brutal"
                reloadDocument
              >
                Next Mock →
              </Link>
              <Link
                to="/mock"
                className="rounded-2xl border-brutal bg-card px-6 py-3 text-base font-extrabold shadow-brutal"
              >
                🏠 All Mocks
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Link
            to="/mock"
            className="rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
          >
            ✕
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              Mock #{mockId}
            </p>
            <p className="truncate text-sm font-extrabold sm:text-base">
              Q {i + 1} / {questions.length} · Score {score}
            </p>
          </div>
          <span className="rounded-full border-brutal bg-[var(--mint)] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
            ✓ {correct}
          </span>
        </div>

        <div className="mb-5 h-2 w-full overflow-hidden rounded-full border-brutal bg-card">
          <div
            className="h-full bg-[var(--hot)] transition-all"
            style={{ width: `${((i + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="rounded-3xl border-brutal bg-card p-5 shadow-brutal-lg sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border-brutal bg-[var(--lemon)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
              {q.kind}
            </span>
            {q.tag && (
              <span className="rounded-full border-brutal bg-[var(--cool)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-brutal-sm">
                {q.tag}
              </span>
            )}
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {q.prompt}
          </p>
          {q.subject && (
            <h2 className="mt-2 break-words font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              {q.subject}
            </h2>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          {q.options.map((opt) => {
            const isAns = opt === q.answer;
            const isPicked = picked === opt;
            const state = !picked ? "idle" : isAns ? "correct" : isPicked ? "wrong" : "muted";
            const cls =
              state === "correct"
                ? "bg-[var(--mint)]"
                : state === "wrong"
                  ? "bg-[var(--hot)] text-white animate-shake"
                  : state === "muted"
                    ? "bg-card opacity-60"
                    : "bg-card hover:-translate-y-0.5";
            return (
              <button
                key={opt}
                onClick={() => pickOpt(opt)}
                disabled={!!picked}
                className={`rounded-2xl border-brutal p-3 text-left text-sm font-bold shadow-brutal-sm transition-transform sm:text-base ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="mt-4 rounded-2xl border-brutal bg-[var(--lemon)] p-4 shadow-brutal-sm animate-pop">
            <p className="text-xs font-extrabold uppercase tracking-widest">
              {picked === q.answer ? "✅ Sahi jawab!" : "❌ Galat"}
            </p>
            {q.note && <p className="mt-1 text-sm font-semibold">{q.note}</p>}
            <button
              onClick={next}
              className="mt-3 rounded-xl border-brutal bg-foreground px-4 py-2 text-sm font-extrabold text-background shadow-brutal-sm"
            >
              {i + 1 === questions.length ? "See result →" : "Next question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultStat({ label, value, bg }: { label: string; value: string | number; bg: string }) {
  return (
    <div className={`rounded-2xl border-brutal p-4 shadow-brutal-sm ${bg}`}>
      <p className="text-xs font-extrabold uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}
