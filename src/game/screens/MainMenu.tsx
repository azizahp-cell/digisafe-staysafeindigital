import { useEffect, useState } from "react";
import { audio } from "../audio";
import titleBg from "@/assets/title-bg.jpg";
import { CASES } from "../data/cases";
import { spriteSrc, type CharId } from "../sprites";
import { useGame } from "../state";
import { GameButton } from "../ui/GameButton";
import { Logo } from "../ui/Logo";
import { Modal } from "../ui/Modal";

const CAST: CharId[] = ["ardi", "nara", "player", "dito", "sasa"];

export function MainMenu() {
  const { progress, go, newGame, openCyberpedia, setSettingsOpen } = useGame();
  const [about, setAbout] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const hasSave = progress.started;
  useEffect(() => audio.startMusic("town"), []);

  const startNew = () => {
    newGame();
    go("intro");
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img src={titleBg} alt="Kota DigiCity" className="pixelated animate-drift absolute inset-0 h-full w-[110%] max-w-none object-cover" />
      <div className="absolute inset-0 bg-[image:linear-gradient(90deg,oklch(0.18_0.05_268/0.85)_0%,oklch(0.18_0.05_268/0.35)_55%,transparent_100%)]" />

      <div className="absolute top-[8%] left-[5%] flex flex-col items-start">
        <Logo size="md" className="items-start" />
        <p className="font-pixel text-shadow-pixel mt-2 text-lg text-sky">Think Before You Click. Stay Safe in Digital World.</p>

        <div className="panel-game mt-8 flex w-[22rem] flex-col gap-3 p-5">
          {hasSave && (
            <GameButton size="lg" onClick={() => go(progress.playerName ? "world" : "intro")}>
              ▶ Lanjutkan
            </GameButton>
          )}
          <GameButton size="lg" variant={hasSave ? "cyan" : "primary"} onClick={() => (hasSave ? setConfirmNew(true) : startNew())}>
            ✦ Permainan Baru
          </GameButton>
          <GameButton variant="sky" onClick={() => openCyberpedia("menu")}>📘 Cyberpedia</GameButton>
          <GameButton variant="navy" onClick={() => setSettingsOpen(true)}>⚙ Pengaturan</GameButton>
          <GameButton variant="navy" onClick={() => setAbout(true)}>ℹ Tentang Game</GameButton>
        </div>
        {hasSave && (
          <div className="font-pixel text-shadow-pixel mt-4 text-base text-foreground">
            Save: {progress.playerName || "—"} · EXP {progress.exp} · Kasus {progress.completed.length}/{CASES.length}
          </div>
        )}
      </div>

      <div className="absolute right-[5%] bottom-[6%] flex items-end gap-4">
        {CAST.map((c, i) => (
          <div key={c} className="flex flex-col items-center" style={{ animation: `bob 1.8s ease-in-out ${i * 0.2}s infinite` }}>
            <img src={spriteSrc(c, "down")} alt={c} className="pixelated h-[7.5rem] w-auto drop-shadow-[0_0.3rem_0_oklch(0.18_0.05_268/0.5)]" />
          </div>
        ))}
      </div>

      {about && (
        <Modal className="w-[40rem]" onClose={() => setAbout(false)}>
          <h2 className="font-pixel mb-3 text-3xl text-gold">Tentang DIGISAFE</h2>
          <p className="leading-relaxed">
            DIGISAFE adalah game edukasi keamanan siber untuk siswa SMP dan SMA. Kamu berperan sebagai mahasiswa yang bekerja paruh waktu di Cyber Center DigiCity: belajar materi, memeriksa bukti digital, mengambil keputusan, dan menulis laporan investigasi.
          </p>
          <ul className="mt-4 space-y-1 text-sky">
            <li>⌨ WASD / Panah — berjalan · Shift — lari</li>
            <li>⌨ E — bicara / interaksi · Esc / M — menu</li>
          </ul>
          <p className="mt-4 text-sm text-sky/80">Semua nama, akun, alamat email, domain, dan bukti dalam game ini fiktif. Game tidak pernah meminta password atau OTP asli.</p>
          <div className="mt-5 flex justify-end"><GameButton onClick={() => setAbout(false)}>Tutup</GameButton></div>
        </Modal>
      )}
      {confirmNew && (
        <Modal className="w-[30rem]" onClose={() => setConfirmNew(false)}>
          <h2 className="font-pixel mb-3 text-2xl text-gold">Mulai dari awal?</h2>
          <p>Progres yang tersimpan (EXP dan kasus selesai) akan diganti dengan permainan baru.</p>
          <div className="mt-5 flex justify-end gap-3">
            <GameButton variant="navy" onClick={() => setConfirmNew(false)}>Batal</GameButton>
            <GameButton onClick={startNew}>Mulai Baru</GameButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
