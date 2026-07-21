import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/mock/")({
  head: () => ({
    meta: [
      { title: "50 Mock Tests — Shabd Arena" },
      { name: "description", content: "50 SSC CGL / Bank exam-pattern mock tests." },
    ],
  }),
  component: MockList,
});

const MOCKS = Array.from({ length: 50 }, (_, i) => i + 1);

function MockList() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Link to="/" className="rounded-xl border-brutal bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wider shadow-brutal-sm">← Home</Link>
          <div className="min-w-0 text-center">
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">⚔️ Battle Ground</p>
            <h1 className="truncate font-display text-2xl font-extrabold sm:text-4xl">50 Mock Tests</h1>
          </div>
          <span className="hidden shrink-0 rounded-full border-brutal bg-[var(--lemon)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm sm:inline-block">25 Qs each</span>
        </div>
        <div className="mb-5 rounded-2xl border-brutal bg-[var(--mint)] p-4 shadow-brutal-sm">
          <p className="text-sm font-semibold">Har mock me <b>25 mixed questions</b>: vocab meaning, synonym, antonym, root word, idiom aur active/passive — bilkul SSC CGL / SBI PO / IBPS pattern pe.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {MOCKS.map((n) => (
            <Link key={n} to="/mock/$id" params={{ id: String(n) }} className={`rounded-2xl border-brutal p-4 text-center shadow-brutal-sm transition-transform hover:-translate-y-0.5 ${n%5===0?"bg-[var(--hot)] text-white":n%3===0?"bg-[var(--cool)] text-white":n%2===0?"bg-[var(--lemon)]":"bg-card"}`}>
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">Mock</div>
              <div className="font-display text-3xl font-extrabold">#{n}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
