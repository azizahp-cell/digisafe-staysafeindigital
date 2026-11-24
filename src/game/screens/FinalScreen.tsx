import { useEffect } from "react";
import { Award } from "lucide-react";
import { audio } from "../audio";
import { CASES } from "../data/cases";
import { portraitSrc, type CharId } from "../sprites";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";

const CONFETTI = ["bg-gold", "bg-cyan", "bg-success", "bg-danger", "bg-turquoise", "bg-sky"];
const CAST: CharId[] = ["ardi", "nara", "player", "dito", "sasa"];

export function FinalScreen() {
  const { progress, go, newGame, openCyberpedia } = useGame();
  useEffect(() => {
    audio.startMusic("victory");
    return () => audio.stopMusic();
  }, []);

  return (
    <div className="bg-night bg-grid-tech relative flex h-full w-full flex-col items-center overflow-hidden px-[4%] py-[2.5%]">
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className={`absolute top-0 h-3 w-2 ${CONFETTI[i % CONFETTI.length]}`}
          style={{ left: `${(i * 17.3) % 100}%`, animation: `confetti-fall ${3 + (i % 5) * 0.7}s linear ${(i % 12) * 0.35}s infinite` }}
        />
      ))}
      <div className="font-pixel text-lg text-cyan">DIGISAFE · FINAL RESULT</div>
      <h2 className="font-pixel text-shadow-pixel animate-pop-in text-6xl text-gold">INVESTIGATION COMPLETED</h2>
      <p className="mt-2 max-w-[52rem] text-center text-lg">Selamat! Kamu berhasil menyelesaikan seluruh investigasi di DigiCity.</p>
      <p className="max-w-[52rem] text-center text-sky">Melalui tiga kasus ini, kamu telah mempelajari cara mengenali phishing, melindungi akun dari pengambilalihan, dan mencegah infeksi malware.</p>

      <div className="mt-3 flex items-end gap-2">
        {CAST.map((c, i) => (
          <img
            key={c}
            src={portraitSrc(c)}
            alt={c}
            className={`pixelated w-auto ${c === "player" ? "h-48" : "h-36"}`}
            style={{ animation: `bob 1.4s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>

      <div className="mt-3 grid w-full max-w-[60rem] grid-cols-[1fr_18rem] gap-5">
        <div className="panel-game p-4">
          {CASES.map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b-[0.12rem] border-dashed border-navy-3 py-1.5 last:border-0">
              <span className="font-pixel text-lg">{c.title}</span>
              <span className={`font-pixel rounded-md px-3 text-sm ${progress.completed.includes(c.id) ? "bg-success" : "bg-navy-3"}`}>
                {progress.completed.includes(c.id) ? "✓ Completed" : "Belum"}
              </span>
            </div>
          ))}
          <div className="mt-2 flex justify-between">
            <span className="font-pixel text-lg text-sky">Total EXP</span>
            <span className="font-pixel text-2xl text-gold">{progress.exp}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border-[0.25rem] border-ink bg-[image:var(--gradient-gold)] p-3 text-ink shadow-[0_0.4rem_0_0_var(--ink)]">
          <Award className="animate-glow h-12 w-12" />
          <div className="font-pixel text-sm">GELAR</div>
          <div className="font-pixel text-3xl">DIGITAL GUARDIAN</div>
          <div className="text-sm font-semibold">{progress.playerName || "Raka"}</div>
        </div>
      </div>

      <div className="mt-auto flex gap-4 pt-3">
        <GameButton variant="navy" size="lg" onClick={() => go("menu")}>⌂ MAIN MENU</GameButton>
        <GameButton size="lg" onClick={() => { newGame(); go("world"); }}>↻ PLAY AGAIN</GameButton>
        <GameButton variant="cyan" size="lg" onClick={() => openCyberpedia("final")}>📘 VIEW LEARNING MATERIAL</GameButton>
      </div>
    </div>
  );
}
