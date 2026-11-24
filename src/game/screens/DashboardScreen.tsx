import { getCase } from "../data/cases";
import { portraitSrc } from "../sprites";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";

export function DashboardScreen() {
  const { session, go } = useGame();
  if (!session) return null;
  const c = getCase(session.caseId);
  return (
    <div className="bg-night bg-grid-tech relative flex h-full w-full flex-col px-[4%] py-[3%]">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-pixel text-lg text-cyan">INVESTIGATION DASHBOARD · CYBER CENTER</div>
          <h2 className="font-pixel text-shadow-pixel text-5xl text-foreground">{c.code} — {c.title}</h2>
        </div>
        <div className="font-pixel rounded-md border-[0.15rem] border-ink bg-danger px-4 py-1.5 text-lg">● Belum diselesaikan</div>
      </div>

      <div className="mt-6 grid flex-1 grid-cols-[22rem_1fr] gap-6">
        {/* Victim file */}
        <div className="panel-game flex flex-col items-center p-5">
          <div className="relative flex h-60 w-full items-end justify-center overflow-hidden rounded-md border-[0.2rem] border-ink bg-[image:var(--gradient-sky)]">
            <div className="absolute inset-0 bg-grid-tech opacity-60" />
            <img src={portraitSrc(c.npc)} alt={c.victim} className="pixelated relative h-56 w-auto" />
          </div>
          <div className="mt-4 w-full space-y-2">
            {[
              ["Nama korban", c.victim],
              ["Jenis kasus", c.threat],
              ["Kategori", c.category],
              ["Tingkat kesulitan", c.difficulty],
              ["Lokasi", c.location],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b-[0.12rem] border-dashed border-navy-3 pb-1.5">
                <span className="text-sky">{k}</span>
                <span className="font-pixel text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chronology */}
        <div className="flex flex-col gap-5">
          <div className="panel-info p-6">
            <div className="font-pixel mb-4 text-2xl">🕒 Kronologi Kejadian</div>
            <ol className="relative space-y-4 border-l-[0.25rem] border-navy pl-6">
              {c.chronology.map((t, i) => (
                <li key={i} className="animate-pop-in relative text-lg" style={{ animationDelay: `${i * 0.12}s` }}>
                  <span className="font-pixel absolute top-0 -left-[2.45rem] flex h-8 w-8 items-center justify-center rounded-full border-[0.15rem] border-navy bg-gold text-sm text-ink">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <div className="panel-game p-5">
            <div className="font-pixel mb-3 text-xl text-gold">🗂 Bukti yang perlu diperiksa</div>
            <div className="grid grid-cols-3 gap-3">
              {c.evidence.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-md border-[0.15rem] border-ink bg-navy px-3 py-3">
                  <span className="text-3xl">{e.icon}</span>
                  <div>
                    <div className="font-pixel">{e.title}</div>
                    <div className="text-xs text-sky">{e.clues.length} petunjuk tersembunyi</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <GameButton variant="navy" onClick={() => go("world")}>◀ Kembali ke DigiCity</GameButton>
        <span className="text-sm text-sky">Semua nama, akun, domain, dan data dalam kasus ini fiktif.</span>
        <GameButton size="lg" className="animate-pulse-ring" onClick={() => go("evidence")}>🔍 MULAI INVESTIGASI</GameButton>
      </div>
    </div>
  );
}
