import { useEffect, useState } from "react";
import { audio } from "../audio";
import { getCase } from "../data/cases";
import { MATERIALS, getMaterial, type MaterialId, type Section } from "../data/materials";
import { markLearned } from "../progress";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";

function SectionBody({ s }: { s: Section }) {
  if (s.kind === "text") return <p className="text-xl leading-relaxed">{s.text}</p>;
  if (s.kind === "steps")
    return (
      <ol className="space-y-3">
        {s.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="font-pixel flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-[0.15rem] border-navy bg-cyan text-lg text-ink">{i + 1}</span>
            <span className="pt-1 text-lg">{it}</span>
          </li>
        ))}
      </ol>
    );
  if (s.kind === "list")
    return (
      <ul className="space-y-2.5">
        {s.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 text-lg">
            <span className="mt-1.5 h-3 w-3 shrink-0 rotate-45 bg-gold ring-[0.12rem] ring-navy" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  if (s.kind === "terms")
    return (
      <div className="grid gap-2.5">
        {s.items.map((t) => (
          <div key={t.term} className="rounded-md border-[0.15rem] border-navy bg-sky px-3 py-2">
            <div className="font-pixel text-lg text-navy">{t.term}</div>
            <div className="text-base">{t.desc}</div>
          </div>
        ))}
      </div>
    );
  return (
    <div>
      <p className="text-lg leading-relaxed italic">“{s.text}”</p>
      <div className="mt-4 rounded-md border-[0.15rem] border-navy bg-gold/40 px-4 py-3">
        <span className="font-pixel text-navy">💡 Pelajaran: </span>
        <span className="font-semibold">{s.lesson}</span>
      </div>
    </div>
  );
}

export function LearningScreen() {
  const { learning, go, update, session } = useGame();
  const [matId, setMatId] = useState<MaterialId>(learning.materialId);
  const [page, setPage] = useState(0);
  const m = getMaterial(matId);
  const isModule = learning.mode === "module";
  const last = page === m.sections.length - 1;
  const s = m.sections[page] ?? m.sections[0]!;

  useEffect(() => setPage(0), [matId]);

  const turn = (d: number) => {
    const n = Math.max(0, Math.min(m.sections.length - 1, page + d));
    if (n !== page) { audio.play("page"); setPage(n); }
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") turn(1);
      if (e.key === "ArrowLeft" || e.key === "a") turn(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const startInvestigation = () => {
    update((p) => markLearned(p, matId));
    go("dashboard");
  };

  const caseData = isModule && session ? getCase(session.caseId) : null;

  return (
    <div className="bg-night bg-grid-tech flex h-full w-full flex-col px-[3.5%] py-[2.5%]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-pixel text-shadow-pixel text-3xl text-cyan">📘 CYBERPEDIA <span className="text-foreground">· Learning Center</span></div>
          <div className="text-sky">{isModule ? `Pelajari materi ini sebelum memulai ${caseData?.code} — ${caseData?.title}.` : "Buku digital keamanan siber DigiCity."}</div>
        </div>
        {!isModule && (
          <div className="flex gap-2">
            {MATERIALS.map((mm) => (
              <GameButton key={mm.id} size="sm" variant={mm.id === matId ? "primary" : "navy"} onClick={() => setMatId(mm.id)}>
                {mm.code.replace("MATERI ", "")} · {mm.short}
              </GameButton>
            ))}
          </div>
        )}
      </div>

      {/* Book */}
      <div className="mt-4 grid flex-1 grid-cols-2 gap-0 overflow-hidden">
        <div className="panel-paper flex flex-col rounded-r-none border-r-0 p-6">
          <div className="font-pixel text-base text-navy-3">{m.code}</div>
          <h2 className="font-pixel text-3xl leading-tight text-navy">{m.title}</h2>
          <div className="mt-3 overflow-hidden rounded-md border-[0.2rem] border-navy">
            <img src={m.image} alt={`Ilustrasi ${m.short}`} className="pixelated aspect-[4/3] max-h-[17rem] w-full object-cover" />
          </div>
          <div className="mt-3 rounded-md bg-sky px-4 py-2 text-base">
            <span className="font-pixel text-navy">🎯 Tujuan: </span>{m.goal}
          </div>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {m.sections.map((sec, i) => (
              <button
                key={sec.title}
                onClick={() => { audio.play("page"); setPage(i); }}
                className={`font-pixel rounded-md border-[0.15rem] border-navy px-2.5 py-1 text-sm transition-colors ${i === page ? "bg-navy text-foreground" : i < page ? "bg-success-soft text-navy" : "bg-card text-navy"}`}
              >
                {sec.icon} {sec.title}
              </button>
            ))}
          </div>
        </div>
        <div className="panel-paper relative flex flex-col rounded-l-none border-l-[0.35rem] border-l-wood p-7">
          <div key={`${matId}-${page}`} className="animate-pop-in flex-1 overflow-auto">
            <div className="font-pixel mb-1 text-sm text-navy-3">Halaman {page + 1} / {m.sections.length}</div>
            <h3 className="font-pixel mb-4 text-3xl text-navy">{s.icon} {s.title}</h3>
            <SectionBody s={s} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <GameButton variant="sky" size="sm" disabled={page === 0} onClick={() => turn(-1)}>◀ Sebelumnya</GameButton>
            {!last ? (
              <GameButton variant="cyan" size="sm" onClick={() => turn(1)}>Berikutnya ▶</GameButton>
            ) : isModule ? (
              <GameButton size="md" className="animate-pulse-ring" onClick={startInvestigation}>🔍 MULAI INVESTIGASI</GameButton>
            ) : (
              <span className="font-pixel text-sm text-success">✓ Materi selesai dibaca</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <GameButton variant="navy" size="sm" onClick={() => go(learning.returnTo)}>
          ◀ {isModule ? "Kembali ke DigiCity" : "Tutup Cyberpedia"}
        </GameButton>
        <span className="font-pixel text-sm text-sky">← → untuk membalik halaman</span>
        {isModule && session && !last && (
          <GameButton variant="navy" size="sm" onClick={startInvestigation}>Lewati ke Investigasi ▶▶</GameButton>
        )}
        {(!isModule || !session || last) && <span />}
      </div>
    </div>
  );
}
