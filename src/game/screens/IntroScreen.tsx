import { useState } from "react";
import { NPCS, type NpcId } from "../data/cases";
import { portraitSrc } from "../sprites";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";

const ORDER: NpcId[] = ["nara", "ardi", "dito", "sasa"];

export function IntroScreen() {
  const { progress, update, go } = useGame();
  const [name, setName] = useState(progress.playerName || "");
  const clean = name.trim().slice(0, 14);

  const start = () => {
    update((p) => ({ ...p, playerName: clean || "Raka", started: true }));
    go("world");
  };

  return (
    <div className="bg-night bg-grid-tech flex h-full w-full flex-col px-[5%] py-[3%]">
      <div className="text-center">
        <h2 className="font-pixel text-shadow-pixel text-4xl text-gold">Kenalan Dulu, Yuk!</h2>
        <p className="mt-1 text-lg text-sky">Inilah orang-orang yang akan kamu temui di DigiCity.</p>
      </div>

      <div className="mt-6 grid flex-1 grid-cols-[1.25fr_repeat(4,1fr)] gap-4">
        <div className="panel-game flex flex-col items-center p-4">
          <div className="tag-name font-pixel px-4 py-1 text-lg">Kamu · Mahasiswa</div>
          <img src={portraitSrc("player")} alt="Karakter pemain" className="pixelated mt-3 h-52 w-auto animate-bob" />
          <p className="mt-2 text-center text-sm text-sky">Asisten paruh waktu di Cyber Center. Tugasmu: membantu warga menghadapi masalah keamanan digital.</p>
          <label className="font-pixel mt-auto w-full pt-3 text-sm text-gold" htmlFor="pname">Nama pemain</label>
          <input
            id="pname"
            value={name}
            maxLength={14}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && start()}
            placeholder="Ketik namamu"
            className="font-pixel mt-1 w-full rounded-md border-[0.2rem] border-ink bg-card px-3 py-2 text-lg text-navy outline-none focus:ring-[0.2rem] focus:ring-cyan"
          />
        </div>
        {ORDER.map((id, i) => (
          <div key={id} className="panel-info animate-pop-in flex flex-col items-center p-4" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <div className="tag-name font-pixel px-3 py-1 text-base">{NPCS[id].name}</div>
            <img src={portraitSrc(id)} alt={NPCS[id].name} className="pixelated mt-3 h-44 w-auto" />
            <div className="font-pixel mt-2 text-center text-base text-navy-3">{NPCS[id].role}</div>
            <p className="mt-1 text-center text-sm">{NPCS[id].desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <GameButton variant="navy" onClick={() => go("menu")}>◀ Kembali</GameButton>
        <p className="text-sky">Gunakan <b className="font-pixel text-gold">WASD / Panah</b> untuk berjalan dan <b className="font-pixel text-gold">E</b> untuk berinteraksi.</p>
        <GameButton size="lg" onClick={start}>Mulai Petualangan ▶</GameButton>
      </div>
    </div>
  );
}
