import { useState } from "react";
import { useGame } from "../state";
import { GameButton } from "./GameButton";
import { Modal, Toggle } from "./Modal";

export function SettingsModal() {
  const { progress, update, setSettingsOpen, screen, go, newGame } = useGame();
  const [confirm, setConfirm] = useState(false);
  const set = (k: "music" | "sfx", v: boolean) => update((p) => ({ ...p, settings: { ...p.settings, [k]: v } }));
  return (
    <Modal className="w-[30rem]" onClose={() => setSettingsOpen(false)}>
      <h2 className="font-pixel text-shadow-pixel mb-5 text-3xl text-gold">Pengaturan</h2>
      <div className="space-y-3">
        <Toggle label="🎵  Musik" on={progress.settings.music} onChange={(v) => set("music", v)} />
        <Toggle label="🔊  Efek Suara" on={progress.settings.sfx} onChange={(v) => set("sfx", v)} />
      </div>
      {screen === "menu" && progress.started && (
        <div className="mt-5 rounded-lg border-[0.15rem] border-ink bg-navy p-4">
          {!confirm ? (
            <GameButton variant="danger" size="sm" onClick={() => setConfirm(true)}>
              Hapus Progres
            </GameButton>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">Semua EXP dan kasus yang selesai akan dihapus. Yakin?</p>
              <div className="flex gap-2">
                <GameButton variant="danger" size="sm" onClick={() => { newGame(); update((p) => ({ ...p, playerName: "" })); setConfirm(false); setSettingsOpen(false); go("menu"); }}>
                  Ya, hapus
                </GameButton>
                <GameButton variant="navy" size="sm" onClick={() => setConfirm(false)}>
                  Batal
                </GameButton>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <GameButton onClick={() => setSettingsOpen(false)}>Tutup</GameButton>
      </div>
    </Modal>
  );
}
