import { useMemo, useState } from "react";
import { audio } from "../audio";
import { getCase, type DecisionOption } from "../data/cases";
import { completeCase, shuffled } from "../progress";
import { portraitSrc } from "../sprites";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";
import { InvestigationNotes } from "./EvidenceScreen";

export function DecisionScreen() {
  const { session, setSession, update, go } = useGame();
  const [picked, setPicked] = useState<DecisionOption | null>(null);
  const c = session ? getCase(session.caseId) : null;
  const options = useMemo(() => (c && session ? shuffled(c.decision.options, session.seed) : []), [c, session?.seed]);
  if (!session || !c) return null;

  const choose = (o: DecisionOption) => {
    setPicked(o);
    setSession((s) => s && { ...s, attempts: s.attempts + 1, wrong: o.correct ? s.wrong : [...s.wrong, o.id] });
    if (o.correct) {
      audio.play("correct");
      update((p) => completeCase(p, c.id));
    } else audio.play("wrong");
  };

  return (
    <div className="bg-night bg-grid-tech flex h-full w-full flex-col px-[3%] py-[2.5%]">
      <div className="font-pixel text-base text-cyan">DECISION MAKING · {c.code}</div>
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-[1fr_18rem] gap-5">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-end gap-4">
            <img src={portraitSrc("nara")} alt="Nara" className="pixelated h-40 w-auto" />
            <div className="panel-card relative mb-4 flex-1 p-5">
              <div className="tag-name font-pixel absolute -top-4 left-4 px-3 py-0.5 text-sm">Nara</div>
              <p className="font-pixel text-2xl leading-snug">{c.decision.question}</p>
            </div>
            <img src={portraitSrc(c.npc)} alt={c.victim} className="pixelated h-36 w-auto" />
          </div>

          <div className="mt-2 grid gap-3">
            {options.map((o, i) => {
              const tried = session.wrong.includes(o.id);
              const isPicked = picked?.id === o.id;
              const locked = !!picked?.correct || tried;
              return (
                <button
                  key={o.id}
                  disabled={locked && !isPicked}
                  onClick={() => !locked && choose(o)}
                  className={`flex items-center gap-4 rounded-lg border-[0.2rem] border-ink p-4 text-left text-lg shadow-[0_0.3rem_0_0_var(--ink)] transition-transform ${
                    isPicked && o.correct ? "bg-success-soft text-navy" : tried ? "bg-danger-soft text-navy opacity-70" : "bg-card text-navy hover:-translate-y-0.5 hover:bg-sky disabled:hover:translate-y-0"
                  } ${isPicked && !o.correct ? "animate-shake" : ""}`}
                >
                  <span className="font-pixel flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-[0.15rem] border-navy bg-navy text-xl text-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 font-semibold">{o.text}</span>
                  {tried && <span className="text-2xl">✗</span>}
                  {isPicked && o.correct && <span className="text-2xl">✓</span>}
                </button>
              );
            })}
          </div>

          {picked && (
            <div
              key={picked.id + session.attempts}
              className={`animate-pop-in mt-4 flex items-center gap-4 rounded-lg border-[0.2rem] border-ink p-4 shadow-[0_0.3rem_0_0_var(--ink)] ${picked.correct ? "bg-success text-foreground" : "bg-danger text-foreground"}`}
            >
              <div className="text-4xl">{picked.correct ? "🎉" : "⚠️"}</div>
              <p className="flex-1 text-base font-semibold">{picked.feedback}</p>
              {picked.correct ? (
                <GameButton onClick={() => go("report")}>📄 Lihat Laporan ▶</GameButton>
              ) : (
                <GameButton variant="white" onClick={() => setPicked(null)}>↻ Coba Lagi</GameButton>
              )}
            </div>
          )}
        </div>
        <InvestigationNotes compact />
      </div>
      <div className="mt-3">
        <GameButton variant="navy" size="sm" onClick={() => go("evidence")}>◀ Periksa Bukti Lagi</GameButton>
      </div>
    </div>
  );
}
