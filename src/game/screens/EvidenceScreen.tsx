import { useMemo, useState } from "react";
import { audio } from "../audio";
import { getCase } from "../data/cases";
import { canProceedToDecision, isEvidenceExamined } from "../progress";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";
import { ClueContext, EVIDENCE_VIEWS } from "./evidenceViews";

export function InvestigationNotes({ compact }: { compact?: boolean }) {
  const { session } = useGame();
  if (!session) return null;
  const c = getCase(session.caseId);
  const entries = session.log.map(({ evidenceId, clueId }) => {
    const ev = c.evidence.find((e) => e.id === evidenceId)!;
    const cl = ev.clues.find((x) => x.id === clueId)!;
    return { key: `${evidenceId}:${clueId}`, ev, cl };
  });
  return (
    <div className="panel-paper flex h-full min-h-0 flex-col p-4">
      <div className="font-pixel mb-2 text-xl text-navy">📒 Investigation Notes</div>
      <div className="flex-1 space-y-2 overflow-auto pr-1">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">Belum ada catatan. Klik bagian bukti yang mencurigakan untuk mencatat temuan.</p>}
        {entries.map(({ key, ev, cl }) => (
          <div key={key} className="animate-pop-in rounded-md border-l-[0.3rem] border-cyan bg-card px-3 py-2 text-sm shadow-[0_0.12rem_0_0_var(--paper-2)]">
            <div className="font-pixel text-xs text-navy-3">{ev.icon} {ev.title} · {cl.label}</div>
            {!compact && <div>{cl.finding}</div>}
          </div>
        ))}
        {c.evidence.filter((e) => isEvidenceExamined(c, e.id, session.found)).map((e) => (
          <div key={e.id} className="rounded-md border-[0.15rem] border-success bg-success-soft px-3 py-2 text-sm">
            <b>✓ Kesimpulan {e.title}:</b> {e.note}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EvidenceScreen() {
  const { session, setSession, go } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const c = session ? getCase(session.caseId) : null;
  const ev = c?.evidence.find((e) => e.id === selected) ?? null;

  const ctx = useMemo(
    () => ({
      found: (session && selected && session.found[selected]) || [],
      hint,
      onFind: (clueId: string) => {
        if (!session || !selected || !c) return;
        const prev = session.found[selected] ?? [];
        if (prev.includes(clueId)) return;
        const nextFound = { ...session.found, [selected]: [...prev, clueId] };
        setSession((s) => s && { ...s, found: nextFound, log: [...s.log, { evidenceId: selected, clueId }] });
        const evd = c.evidence.find((e) => e.id === selected)!;
        const cl = evd.clues.find((x) => x.id === clueId)!;
        if (isEvidenceExamined(c, selected, nextFound)) {
          audio.play("evidence");
          setToast(`Bukti "${evd.title}" selesai diperiksa dan masuk ke Investigation Notes!`);
          setHint(false);
        } else {
          audio.play("clue");
          setToast(`Petunjuk ditemukan: ${cl.label}`);
        }
        window.setTimeout(() => setToast(null), 2200);
      },
    }),
    [session, selected, hint, c, setSession],
  );

  if (!session || !c) return null;
  const examined = c.evidence.filter((e) => isEvidenceExamined(c, e.id, session.found)).length;
  const ready = canProceedToDecision(c, session.found);
  const View = ev ? EVIDENCE_VIEWS[`${c.id}:${ev.id}`] : null;
  const foundHere = ev ? (session.found[ev.id] ?? []) : [];

  return (
    <div className="bg-night bg-grid-tech flex h-full w-full flex-col px-[2.5%] py-[2%]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-pixel text-base text-cyan">EVIDENCE EXAMINATION · {c.code}</div>
          <h2 className="font-pixel text-shadow-pixel text-3xl">Periksa Bukti Digital {c.victim}</h2>
        </div>
        <div className="font-pixel flex items-center gap-3 text-lg">
          Bukti diperiksa
          <div className="flex gap-1">
            {c.evidence.map((e) => (
              <span key={e.id} className={`h-5 w-8 rounded-sm border-[0.15rem] border-ink ${isEvidenceExamined(c, e.id, session.found) ? "bg-success" : "bg-navy-3"}`} />
            ))}
          </div>
          <span className="text-gold">{examined}/3</span>
        </div>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[15rem_1fr_19rem] gap-4">
        {/* Evidence list */}
        <div className="flex flex-col gap-3">
          {c.evidence.map((e, i) => {
            const done = isEvidenceExamined(c, e.id, session.found);
            const n = (session.found[e.id] ?? []).length;
            const active = e.id === selected;
            return (
              <button
                key={e.id}
                onClick={() => { audio.play("page"); setSelected(e.id); setHint(false); }}
                className={`relative rounded-lg border-[0.2rem] border-ink p-3 text-left shadow-[0_0.3rem_0_0_var(--ink)] transition-transform hover:-translate-y-0.5 ${active ? "bg-gold text-ink" : done ? "bg-success-soft text-navy" : "bg-sky text-navy"}`}
              >
                <div className="font-pixel text-xs opacity-70">BUKTI {i + 1}</div>
                <div className="flex items-center gap-2"><span className="text-2xl">{e.icon}</span><span className="font-pixel text-lg leading-tight">{e.title}</span></div>
                <div className="mt-1 text-xs">{done ? "✓ Sudah diperiksa" : n > 0 ? `${n}/${e.clues.length} petunjuk` : "Belum diperiksa"}</div>
                {done && <span className="font-pixel absolute top-2 right-2 rounded-sm bg-success px-1.5 text-xs text-foreground">✓</span>}
              </button>
            );
          })}
          <div className="mt-auto panel-game p-3 text-sm">
            <div className="font-pixel mb-1 text-gold">Cara memeriksa</div>
            Klik bagian bukti yang terlihat janggal. Setiap bukti punya beberapa petunjuk tersembunyi.
          </div>
        </div>

        {/* Viewer */}
        <div className="panel-game relative flex min-h-0 flex-col p-4">
          {!ev || !View ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="animate-bob text-7xl">🔍</div>
              <div className="font-pixel mt-3 text-2xl">Pilih bukti untuk diperiksa</div>
              <p className="mt-1 text-sky">Bukti akan ditampilkan dalam ukuran besar di sini.</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-pixel text-2xl">{ev.icon} {ev.title}</div>
                  <div className="text-sm text-sky">{ev.subtitle}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel rounded-md bg-navy px-3 py-1 text-sm">Petunjuk {foundHere.length}/{ev.clues.length}</span>
                  {!isEvidenceExamined(c, ev.id, session.found) && (
                    <GameButton size="sm" variant="sky" onClick={() => setHint(true)}>💡 Petunjuk Nara</GameButton>
                  )}
                </div>
              </div>
              <div key={ev.id} className="animate-pop-in min-h-0 flex-1 overflow-auto rounded-md bg-[image:var(--gradient-sky)] p-5">
                <ClueContext.Provider value={ctx}>
                  <View />
                </ClueContext.Provider>
              </div>
              {hint && <div className="mt-2 text-sm text-gold">Nara: "Perhatikan bagian yang berkedip kuning. Apa yang aneh di sana?"</div>}
            </>
          )}
          {toast && (
            <div className="font-pixel animate-pop-in absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-lg border-[0.2rem] border-ink bg-success px-5 py-2 text-base whitespace-nowrap shadow-[0_0.3rem_0_0_var(--ink)]">
              ✓ {toast}
            </div>
          )}
        </div>

        <InvestigationNotes />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <GameButton variant="navy" size="sm" onClick={() => go("dashboard")}>◀ Dashboard</GameButton>
        <span className="text-sm text-sky">{ready ? "Semua bukti sudah diperiksa. Saatnya mengambil keputusan!" : `Periksa semua bukti dulu (${examined}/3) sebelum mengambil keputusan.`}</span>
        <GameButton disabled={!ready} className={ready ? "animate-pulse-ring" : ""} onClick={() => go("decision")}>
          ⚖ Ambil Keputusan ▶
        </GameButton>
      </div>
    </div>
  );
}
