import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { WORDS, type Word } from "@/data/words";

const LEARNED_KEY = "shabd-arena-learned-v1";

function loadLearned(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEARNED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveLearned(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEARNED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}




export const Route = createFileRoute("/")({
  component: Arena,
});

type Mode = "home" | "flash" | "quiz" | "revise";
type QuizKind = "synonym" | "antonym" | "meaning";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Arena() {
  const [mode, setMode] = useState<Mode>("home");
  const [learned, setLearned] = useState<number[]>([]);

  useEffect(() => {
    setLearned(loadLearned());
  }, []);

  function markLearned(id: number) {
    setLearned((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveLearned(next);
      return next;
    });
  }

  function removeLearned(id: number) {
    setLearned((prev) => {
      const next = prev.filter((x) => x !== id);
      saveLearned(next);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {mode === "home" && (
          <Home onStart={setMode} learnedCount={learned.length} />
        )}
        {mode === "flash" && (
          <Flashcards onExit={() => setMode("home")} onLearn={markLearned} />
        )}
        {mode === "quiz" && <Quiz onExit={() => setMode("home")} />}
        {mode === "revise" && (
          <Revise
            onExit={() => setMode("home")}
            learnedIds={learned}
            onRemove={removeLearned}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-brutal border-b-[3px] bg-[var(--lemon)]">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-brutal bg-[var(--hot)] text-[var(--lemon)] shadow-brutal-sm font-display text-xl font-extrabold">
            श
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold leading-none sm:text-2xl">
              Shabd Arena
            </h1>
            <p className="truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[11px]">
              Vocab game • SSC CGL • Bank
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full border-brutal bg-[var(--mint)] px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-brutal-sm sm:inline-block">
          Level up your English 🎯
        </span>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-brutal border-t-[3px] bg-[var(--cool)] py-6 text-center text-sm font-medium text-white">
      Padho, khelo, top karo. Made by Hitansh jain 💥
    </footer>
  );
}

/* ============================== HOME ============================== */

function Home({
  onStart,
  learnedCount,
}: {
  onStart: (m: Mode) => void;
  learnedCount: number;
}) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border-brutal bg-card p-5 shadow-brutal-lg sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--hot)] opacity-90 sm:h-40 sm:w-40" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rotate-12 rounded-2xl bg-[var(--mint)] sm:h-32 sm:w-32" />
        <div className="relative">
          <span className="inline-block rounded-full border-brutal bg-[var(--lemon)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-brutal-sm sm:text-xs">
            🕹️ New Game
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-[0.95] sm:text-6xl">
            Vocab seekho <br />
            <span className="bg-[var(--hot)] px-2 text-white">masti</span> ke saath.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-lg">
            English + Hindi + Hinglish meanings, funny examples, synonyms,
            antonyms and{" "}
            <span className="font-bold text-foreground">PYQ tags</span> from SSC
            CGL, SBI &amp; IBPS. Ek shabd bhi bore nahi hoga.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => onStart("flash")}
              className="w-full rounded-2xl border-brutal bg-[var(--hot)] px-6 py-3 text-base font-extrabold text-white shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm sm:w-auto"
            >
              🎴 Flashcard Mode
            </button>
            <button
              onClick={() => onStart("quiz")}
              className="w-full rounded-2xl border-brutal bg-[var(--cool)] px-6 py-3 text-base font-extrabold text-white shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm sm:w-auto"
            >
              ⚔️ Quiz Battle
            </button>
            <button
              onClick={() => onStart("revise")}
              className="w-full rounded-2xl border-brutal bg-[var(--mint)] px-6 py-3 text-base font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm sm:w-auto"
            >
              📚 Revise ({learnedCount})
            </button>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          bg="bg-[var(--mint)]"
          emoji="🇮🇳"
          title="Trilingual"
          text="English, Hindi aur Hinglish — jaise dost samjhaata hai."
        />
        <FeatureCard
          bg="bg-[var(--lemon)]"
          emoji="🎯"
          title="PYQ Tagged"
          text="Har word pe uska exam year — SSC CGL, SBI PO, IBPS."
        />
        <FeatureCard
          bg="bg-[var(--hot)] text-white"
          emoji="🧠"
          title="Syn / Ant"
          text="Synonyms aur antonyms saath mein — do ke bhaav mein 4."
        />
      </section>

      {/* New: Explore more — Roots, Idioms, Books */}
      <section>
        <div className="mb-4">
          <h3 className="text-2xl font-extrabold sm:text-3xl">
            Aur bhi seekho 🚀
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Roots • Idioms • Full books with click-to-meaning
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ExploreCard
            to="/roots"
            bg="bg-[var(--cool)] text-white"
            emoji="🧬"
            title="Root Words"
            text="Ek root, 10 words free — Latin & Greek DNA of English."
          />
          <ExploreCard
            to="/idioms"
            bg="bg-[var(--lemon)]"
            emoji="🎭"
            title="Idioms Black Book"
            text="40+ exam-favourite idioms in Hindi + Hinglish."
          />
          <ExploreCard
            to="/books"
            bg="bg-[var(--mint)]"
            emoji="📚"
            title="Books Reader"
            text="Sherlock Holmes + Rich Dad summary. Tap tough words."
          />
        </div>
      </section>
    </div>
  );
}

function ExploreCard({
  to,
  bg,
  emoji,
  title,
  text,
}: {
  to: string;
  bg: string;
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className={`block rounded-2xl border-brutal p-5 shadow-brutal transition-transform hover:-translate-y-0.5 ${bg}`}
    >
      <div className="text-3xl">{emoji}</div>
      <h4 className="mt-2 text-lg font-extrabold">{title}</h4>
      <p className="mt-1 text-sm opacity-90">{text}</p>
      <span className="mt-3 inline-block text-xs font-extrabold uppercase tracking-wider">
        Open →
      </span>
    </Link>
  );
}


}

function FeatureCard({
  bg,
  emoji,
  title,
  text,
}: {
  bg: string;
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div
      className={`rounded-2xl border-brutal p-5 shadow-brutal-sm ${bg}`}
    >
      <div className="text-3xl">{emoji}</div>
      <h4 className="mt-2 text-lg font-extrabold">{title}</h4>
      <p className="mt-1 text-sm opacity-90">{text}</p>
    </div>
  );
}

/* ============================ FLASHCARDS ============================ */

function Flashcards({
  onExit,
  onLearn,
}: {
  onExit: () => void;
  onLearn: (id: number) => void;
}) {
  const [deck] = useState<Word[]>(() => shuffle(WORDS));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const w = deck[i];
  const progress = ((i + 1) / deck.length) * 100;

  function next(mark: "know" | "revise") {
    if (mark === "know") {
      setKnown((s) => new Set(s).add(w.id));
      onLearn(w.id);
    }
    setFlipped(false);
    setI((n) => (n + 1) % deck.length);
  }

  return (
    <div className="space-y-6">
      <TopBar
        title="Flashcards"
        subtitle={`${i + 1} / ${deck.length} • Known: ${known.size}`}
        onExit={onExit}
      />
      <div className="h-2 w-full overflow-hidden rounded-full border-brutal bg-card">
        <div
          className="h-full bg-[var(--hot)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        key={w.id + (flipped ? "-b" : "-f")}
        className="animate-pop"
      >
        {!flipped ? (
          <FrontCard word={w} onFlip={() => setFlipped(true)} />
        ) : (
          <BackCard word={w} onFlip={() => setFlipped(false)} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => next("revise")}
          className="rounded-2xl border-brutal bg-[var(--lemon)] px-4 py-4 text-base font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm"
        >
          🔁 Revise later
        </button>
        <button
          onClick={() => next("know")}
          className="rounded-2xl border-brutal bg-[var(--mint)] px-4 py-4 text-base font-extrabold shadow-brutal transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm"
        >
          ✅ Aata hai
        </button>
      </div>
    </div>
  );
}

function FrontCard({ word, onFlip }: { word: Word; onFlip: () => void }) {
  return (
    <button
      onClick={onFlip}
      className="group relative block w-full overflow-hidden rounded-3xl border-brutal bg-card p-8 text-left shadow-brutal-lg sm:p-12"
    >
      <div className="absolute right-4 top-4 flex flex-wrap gap-2">
        {word.pyq && (
          <span className="rounded-full border-brutal bg-[var(--hot)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-brutal-sm">
            PYQ • {word.pyq}
          </span>
        )}
        {word.source && (
          <span className="rounded-full border-brutal bg-[var(--cool)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-brutal-sm">
            📖 {word.source}
          </span>
        )}
        <span className="rounded-full border-brutal bg-[var(--lemon)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
          {word.pos}
        </span>
      </div>

      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Tap to flip
      </p>
      <h2 className="mt-2 break-words font-display text-4xl font-extrabold leading-none sm:text-7xl">
        {word.word}
      </h2>
      <p className="mt-3 font-mono text-sm text-muted-foreground">
        /{word.pronounce}/
      </p>

      <div className="mt-10 flex items-center gap-2 text-sm font-bold text-[var(--cool)]">
        <span className="grid h-8 w-8 place-items-center rounded-full border-brutal bg-[var(--cool)] text-white">
          ↻
        </span>
        Flip for meaning
      </div>
    </button>
  );
}

function BackCard({ word, onFlip }: { word: Word; onFlip: () => void }) {
  return (
    <div className="rounded-3xl border-brutal bg-card p-6 shadow-brutal-lg sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Meaning
          </p>
          <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
            {word.word}
          </h2>
        </div>
        <button
          onClick={onFlip}
          className="rounded-xl border-brutal bg-[var(--lemon)] px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
        >
          ↺ Flip
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <MeaningRow flag="🇬🇧" label="English" text={word.english} bg="bg-[var(--mint)]" />
        <MeaningRow flag="🇮🇳" label="Hindi" text={word.hindi} bg="bg-[var(--lemon)]" />
        <MeaningRow
          flag="😄"
          label="Hinglish"
          text={word.hinglish}
          bg="bg-[var(--hot)] text-white"
        />
      </div>

      <div className="mt-5 rounded-2xl border-brutal bg-background p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Example
        </p>
        <p className="mt-1 text-base italic">"{word.example}"</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ChipList label="Synonyms" chips={word.synonyms} tone="mint" />
        <ChipList label="Antonyms" chips={word.antonyms} tone="hot" />
      </div>
    </div>
  );
}

function MeaningRow({
  flag,
  label,
  text,
  bg,
}: {
  flag: string;
  label: string;
  text: string;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl border-brutal p-3 ${bg}`}>
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest opacity-80">
        <span>{flag}</span>
        <span>{label}</span>
      </div>
      <p className="mt-1 text-base font-semibold leading-snug">{text}</p>
    </div>
  );
}

function ChipList({
  label,
  chips,
  tone,
}: {
  label: string;
  chips: string[];
  tone: "mint" | "hot";
}) {
  const bg = tone === "mint" ? "bg-[var(--mint)]" : "bg-[var(--hot)] text-white";
  return (
    <div className="rounded-2xl border-brutal bg-background p-3">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c}
            className={`rounded-full border-brutal px-3 py-1 text-xs font-bold shadow-brutal-sm ${bg}`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/* =============================== QUIZ =============================== */

type Question = {
  word: Word;
  kind: QuizKind;
  options: string[];
  answer: string;
};

function makeQuestion(word: Word, allWords: Word[]): Question {
  const kinds: QuizKind[] = [
    "meaning",
    "synonym",
    "antonym",
    ...(word.synonyms.length ? (["synonym"] as QuizKind[]) : []),
  ];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];

  let answer = "";
  let pool: string[] = [];

  if (kind === "meaning") {
    answer = word.english;
    pool = allWords.filter((x) => x.id !== word.id).map((x) => x.english);
  } else if (kind === "synonym") {
    answer = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
    pool = allWords
      .filter((x) => x.id !== word.id)
      .flatMap((x) => x.antonyms.concat(x.synonyms.slice(0, 1)));
  } else {
    answer = word.antonyms[Math.floor(Math.random() * word.antonyms.length)];
    pool = allWords
      .filter((x) => x.id !== word.id)
      .flatMap((x) => x.synonyms.concat(x.antonyms.slice(0, 1)));
  }

  const distractors = shuffle(pool.filter((v) => v && v !== answer)).slice(0, 3);
  const options = shuffle([answer, ...distractors]);
  return { word, kind, options, answer };
}

function Quiz({ onExit }: { onExit: () => void }) {
  const questions = useMemo<Question[]>(() => {
    const deck = shuffle(WORDS).slice(0, 10);
    return deck.map((w) => makeQuestion(w, WORDS));
  }, []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const q = questions[i];
  const done = i >= questions.length;

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) {
      setScore((s) => s + 10 + streak * 2);
      const s = streak + 1;
      setStreak(s);
      setBest((b) => Math.max(b, s));
    } else {
      setStreak(0);
    }
  }

  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  if (done) {
    return (
      <div className="space-y-6">
        <TopBar title="Quiz Battle" subtitle="Round complete!" onExit={onExit} />
        <div className="rounded-3xl border-brutal bg-card p-8 text-center shadow-brutal-lg">
          <div className="text-6xl">🏆</div>
          <h2 className="mt-4 font-display text-4xl font-extrabold">
            {score >= 80 ? "Bawaal!" : score >= 50 ? "Solid try!" : "Keep going!"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Aapka score aur streak neeche hai. Ek aur round?
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Stat label="Score" value={score} bg="bg-[var(--hot)] text-white" />
            <Stat label="Best streak" value={best} bg="bg-[var(--mint)]" />
          </div>
          <button
            onClick={onExit}
            className="mt-6 rounded-2xl border-brutal bg-[var(--cool)] px-6 py-3 text-base font-extrabold text-white shadow-brutal"
          >
            🏠 Back to Arena
          </button>
        </div>
      </div>
    );
  }

  const promptText =
    q.kind === "meaning"
      ? "Iska meaning kya hai?"
      : q.kind === "synonym"
      ? "Isska synonym choose karo:"
      : "Isska antonym choose karo:";

  return (
    <div className="space-y-6">
      <TopBar
        title="Quiz Battle"
        subtitle={`Q ${i + 1}/${questions.length} • Score ${score} • 🔥 ${streak}`}
        onExit={onExit}
      />

      <div className="rounded-3xl border-brutal bg-card p-6 shadow-brutal-lg sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border-brutal bg-[var(--lemon)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
            {q.kind}
          </span>
          {q.word.pyq && (
            <span className="rounded-full border-brutal bg-[var(--hot)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-brutal-sm">
              PYQ • {q.word.pyq}
            </span>
          )}
          {q.word.source && (
            <span className="rounded-full border-brutal bg-[var(--cool)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-brutal-sm">
              📖 {q.word.source}
            </span>
          )}
        </div>
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {promptText}
        </p>
        <h2 className="mt-2 break-words font-display text-3xl font-extrabold sm:text-5xl">
          {q.word.word}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">/{q.word.pronounce}/</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {q.options.map((opt) => {
          const isAns = opt === q.answer;
          const isPicked = picked === opt;
          const state = !picked
            ? "idle"
            : isAns
            ? "correct"
            : isPicked
            ? "wrong"
            : "muted";
          const cls =
            state === "correct"
              ? "bg-[var(--mint)]"
              : state === "wrong"
              ? "bg-[var(--hot)] text-white animate-shake"
              : state === "muted"
              ? "bg-card opacity-70"
              : "bg-card hover:-translate-y-0.5";
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={!!picked}
              className={`rounded-2xl border-brutal p-4 text-left text-base font-bold shadow-brutal-sm transition-transform ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="rounded-2xl border-brutal bg-[var(--lemon)] p-4 shadow-brutal-sm animate-pop">
          <p className="text-xs font-extrabold uppercase tracking-widest">
            Quick note
          </p>
          <p className="mt-1 text-sm font-semibold">
            {q.word.word} — {q.word.hindi}. {q.word.hinglish}
          </p>
          <p className="mt-1 text-sm italic">"{q.word.example}"</p>
          <button
            onClick={next}
            className="mt-3 rounded-xl border-brutal bg-foreground px-4 py-2 text-sm font-extrabold text-background shadow-brutal-sm"
          >
            {i + 1 === questions.length ? "See result →" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  bg,
}: {
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl border-brutal p-4 shadow-brutal-sm ${bg}`}>
      <p className="text-xs font-extrabold uppercase tracking-widest opacity-80">
        {label}
      </p>
      <p className="mt-1 font-display text-4xl font-extrabold">{value}</p>
    </div>
  );
}

/* =========================== SHARED BITS =========================== */

function TopBar({
  title,
  subtitle,
  onExit,
}: {
  title: string;
  subtitle: string;
  onExit: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="min-w-0">
        <h2 className="truncate font-display text-xl font-extrabold sm:text-3xl">
          {title}
        </h2>
        <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
      </div>
      <button
        onClick={onExit}
        className="shrink-0 rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm"
      >
        ✕ Exit
      </button>
    </div>
  );
}

/* ============================== REVISE ============================== */

function Revise({
  onExit,
  learnedIds,
  onRemove,
}: {
  onExit: () => void;
  learnedIds: number[];
  onRemove: (id: number) => void;
}) {
  const learnedWords = useMemo(
    () =>
      learnedIds
        .map((id) => WORDS.find((w) => w.id === id))
        .filter((w): w is Word => Boolean(w)),
    [learnedIds],
  );

  return (
    <div className="space-y-6">
      <TopBar
        title="Revise Zone"
        subtitle={`${learnedWords.length} learned word${learnedWords.length === 1 ? "" : "s"} • Dohrao aur pakka karo`}
        onExit={onExit}
      />

      {learnedWords.length === 0 ? (
        <div className="rounded-3xl border-brutal bg-card p-8 text-center shadow-brutal-lg">
          <div className="text-6xl">📭</div>
          <h3 className="mt-4 font-display text-2xl font-extrabold">
            Abhi tak koi word learn nahi kiya
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Flashcards mein "✅ Aata hai" dabao, wo words yahan revise ke liye
            aa jayenge.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {learnedWords.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border-brutal bg-card p-4 shadow-brutal-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-xl font-extrabold">
                    {w.word}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    /{w.pronounce}/
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--lemon)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {w.pos}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{w.english}</p>
              <p className="mt-1 text-sm font-semibold">{w.hindi}</p>
              <p className="mt-1 text-sm italic opacity-80">{w.hinglish}</p>
              <p className="mt-2 text-xs italic">"{w.example}"</p>
              <button
                onClick={() => onRemove(w.id)}
                className="mt-3 rounded-xl border-brutal bg-[var(--hot)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-brutal-sm"
              >
                ↺ Learn again
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

