import { useEffect, useState } from "react";
import { audio } from "../audio";
import { EXP_PER_CASE, getCase } from "../data/cases";
import { portraitSrc } from "../sprites";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";

export function ReportScreen() {
  const { session, progress, go } = useGame();
  const [exp, setExp] = useState(0);
  const c = session ? getCase(session.caseId) : null;
  const gained = session && !session.replay ? EXP_PER_CASE : 0;

  useEffect(() => {
    if (!gained) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - 600 - t0) / 900);
      if (k > 0) setExp(Math.round(gained * k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    const s = window.setTimeout(() => audio.play("exp"), 650);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(s); };
  }, [gained]);

  if (!session || !c) return null;
  const name = progress.playerName || "Raka";

  return (
    <div className="bg-night bg-grid-tech flex h-full w-full items-center justify-center px-[4%] py-[2.5%]">
      <div className="panel-paper relative grid h-full w-full max-w-[70rem] grid-cols-[1fr_17rem] gap-6 p-7">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b-[0.2rem] border-navy pb-3">
            <div>
              <div className="font-pixel text-sm text-navy-3">CYBER CENTER DIGICITY · DOKUMEN RESMI</div>
              <h2 className="font-pixel text-4xl text-navy">Laporan Investigasi — {c.code}</h2>
            </div>
            <div className="text-right text-sm text-navy-3">Penyelidik: <b className="text-navy">{name}</b><br />Kasus: {c.title}</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["Status investigasi", <span key="s" className="font-pixel text-success">✓ Berhasil</span>],
              ["Korban", c.victim],
              ["Ancaman", c.report.threat],
              ["Percobaan keputusan", `${session.attempts}×`],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-md border-[0.15rem] border-navy bg-card px-4 py-2">
                <div className="text-xs text-navy-3">{k}</div>
                <div className="font-pixel text-xl text-navy">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-md border-[0.15rem] border-danger bg-danger-soft px-4 py-3 text-navy">
            <div className="font-pixel text-sm text-danger">Penyebab</div>
            <div className="text-lg font-semibold">{c.report.cause}</div>
          </div>

          <div className="mt-3 rounded-md border-[0.15rem] border-success bg-success-soft px-4 py-3 text-navy">
            <div className="font-pixel text-sm text-success">Rekomendasi</div>
            <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
              {c.report.recommendations.map((r) => <li key={r} className="flex gap-2"><span>🛡</span>{r}</li>)}
            </ul>
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-md border-[0.15rem] border-navy bg-card px-4 py-3 text-navy">
            <div className="font-pixel text-sm text-navy-3">Bukti yang diperiksa</div>
            <ul className="mt-1 space-y-1 text-sm">
              {c.evidence.map((e) => <li key={e.id}><b>{e.icon} {e.title}:</b> {e.note}</li>)}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="font-pixel animate-stamp mt-4 rounded-lg border-[0.35rem] border-success px-5 py-2 text-4xl text-success">BERHASIL</div>
          <img src={portraitSrc(c.npc)} alt={c.victim} className="pixelated mt-4 h-48 w-auto animate-bob" />
          <p className="mt-1 text-center text-sm text-navy">"Terima kasih, {name}!"</p>
          <div className="panel-game mt-auto w-full p-4 text-center">
            <div className="font-pixel text-sm text-sky">EXP DIPEROLEH</div>
            {gained ? (
              <div className="font-pixel text-shadow-pixel text-5xl text-gold">+{exp}</div>
            ) : (
              <div className="text-sm text-sky">Kasus diulang — EXP sudah pernah didapat.</div>
            )}
            <div className="mt-1 text-sm">Total EXP: {progress.exp}</div>
          </div>
          <GameButton className="mt-4 w-full" size="lg" onClick={() => go("world")}>Kembali ke DigiCity ▶</GameButton>
        </div>
      </div>
    </div>
  );
}
