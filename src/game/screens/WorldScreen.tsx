import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, Music, VolumeX } from "lucide-react";
import { audio } from "../audio";
import { CASES, PROLOGUE, getCase, getCaseByNpc, type NpcId } from "../data/cases";
import { allCasesDone, currentObjective, debriefCase, isCaseUnlocked, type Objective } from "../progress";
import { portraitSrc } from "../sprites";
import { useGame } from "../state";
import { Dialogue, type DialogueChoice, type DialogueLine } from "../ui/Dialogue";
import { GameButton } from "../ui/GameButton";
import { Modal } from "../ui/Modal";
import { SIGNS, VIEW_H, VIEW_W } from "../world/map";
import { WorldEngine, type Interactable, type Marker } from "../world/engine";

const TIPS = [
  "Tips Kiosk: Password yang kuat itu panjang. Coba gabungkan 3–4 kata acak, misalnya \"kopi-pelangi-sepeda-awan\".",
  "Tips Kiosk: Aktifkan 2FA di akun pentingmu. Satu lapis pengaman tambahan sangat berarti!",
  "Tips Kiosk: Perbarui aplikasi dan sistem operasi secara berkala untuk menutup celah keamanan.",
  "Tips Kiosk: Ragu pada sebuah tautan? Jangan diklik. Buka aplikasi atau ketik alamat resminya sendiri.",
];

interface ActiveDialog { lines: DialogueLine[]; choices?: DialogueChoice[]; onDone?: () => void }

function objectiveText(o: Objective) {
  if (o.kind === "prologue") return "Bicara dengan Nara di depan Cyber Center";
  if (o.kind === "case") { const c = getCase(o.caseId); return `Temui ${c.victim} di ${c.location}`; }
  if (o.kind === "debrief") return "Kembali ke Nara di Cyber Center untuk melapor";
  return "Semua kasus selesai! Temui Nara";
}

export function WorldScreen() {
  const game = useGame();
  const { progress, update, go, startCase, openCyberpedia, worldPos, setSettingsOpen, settingsOpen } = game;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WorldEngine | null>(null);
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);
  const [zone, setZone] = useState<string | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const objective = currentObjective(progress);
  const name = progress.playerName || "Raka";

  // Markers above NPCs
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    const m: Partial<Record<NpcId, Marker>> = {};
    if (objective.kind === "prologue" || objective.kind === "debrief" || objective.kind === "done") m.nara = "mission";
    if (objective.kind === "case") m[getCase(objective.caseId).npc] = "mission";
    for (const c of CASES) if (progress.completed.includes(c.id) && !m[c.npc]) m[c.npc] = "done";
    e.markers = m;
  }, [objective.kind, objective.kind === "case" || objective.kind === "debrief" ? objective.caseId : null, progress.completed]);

  const frozen = !!dialog || menuOpen || casesOpen || settingsOpen;
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.frozen = frozen;
      if (frozen) engineRef.current.keys.clear();
    }
  }, [frozen]);

  const say = useCallback((d: ActiveDialog) => { audio.play("talk"); setDialog(d); }, []);

  const interact = useCallback(
    (it: Interactable) => {
      const p = progressRef.current;
      const obj = currentObjective(p);
      const nara = (text: string): DialogueLine => ({ speaker: "nara", text });
      if (it.id === "nara") {
        if (obj.kind === "prologue") {
          return say({
            lines: PROLOGUE.map(nara),
            onDone: () => { update((q) => ({ ...q, prologueDone: true })); audio.play("unlock"); },
          });
        }
        if (obj.kind === "debrief") {
          const c = getCase(obj.caseId);
          return say({
            lines: c.debrief.map(nara),
            onDone: () => {
              update((q) => debriefCase(q, c.id));
              audio.play("unlock");
              if (c.number === CASES.length) go("final");
            },
          });
        }
        if (obj.kind === "case") {
          const c = getCase(obj.caseId);
          return say({
            lines: [nara(`${c.victim} sedang menunggumu di ${c.location}. Ikuti tanda seru kuning di peta, ya!`), nara("Butuh mengulang materi? Masuk ke pintu Cyber Center untuk membuka Cyberpedia.")],
          });
        }
        return say({
          lines: [nara(`${name}, kamu sudah resmi menjadi Digital Guardian DigiCity! Terima kasih atas kerja kerasmu.`)],
          choices: [
            { label: "Lihat Hasil Akhir", onSelect: () => { setDialog(null); go("final"); } },
            { label: "Tutup", variant: "navy", onSelect: () => setDialog(null) },
          ],
        });
      }
      const c = getCaseByNpc(it.id as NpcId);
      if (c) {
        const npc = c.npc;
        const line = (text: string): DialogueLine => ({ speaker: npc, text });
        if (p.completed.includes(c.id)) {
          return say({
            lines: [line(`Terima kasih banyak, ${name}! Berkat kamu, aku sekarang lebih paham soal ${c.threat.toLowerCase()}.`)],
            choices: [
              { label: "Ulangi Kasus", variant: "sky", onSelect: () => { setDialog(null); startCase(c.id); } },
              { label: "Tutup", variant: "navy", onSelect: () => setDialog(null) },
            ],
          });
        }
        if (!p.prologueDone) return say({ lines: [line("Hmm? Sepertinya kamu orang baru. Temui Nara di Cyber Center dulu, ya.")] });
        if (!isCaseUnlocked(p, c.id)) {
          return say({ lines: [line("Aku butuh bantuan... tapi sepertinya kamu sedang menangani kasus lain. Selesaikan dulu, lalu lapor ke Nara, ya.")] });
        }
        return say({
          lines: c.intro.map(line),
          choices: [
            { label: `Bantu ${c.victim} ▶`, onSelect: () => { setDialog(null); startCase(c.id); } },
            { label: "Nanti dulu", variant: "navy", onSelect: () => setDialog(null) },
          ],
        });
      }
      if (it.id === "door:cyber") {
        return say({
          lines: [{ speaker: "system", name: "Cyber Center", text: "Pintu Cyber Center. Di dalam ada Learning Center berisi Cyberpedia — kumpulan materi keamanan siber." }],
          choices: [
            { label: "📘 Buka Cyberpedia", onSelect: () => { setDialog(null); openCyberpedia("world"); } },
            { label: "Tutup", variant: "navy", onSelect: () => setDialog(null) },
          ],
        });
      }
      const sign = SIGNS.find((s) => s.id === it.id);
      if (sign) return say({ lines: [{ speaker: "system", name: "Papan Petunjuk", text: sign.text }] });
      if (it.id === "kiosk") return say({ lines: [{ speaker: "system", name: "Info Kiosk", text: TIPS[Math.floor(Math.random() * TIPS.length)] ?? "" }] });
      if (it.id === "tower") return say({ lines: [{ speaker: "system", name: "Menara Wi-Fi Publik", text: "Wi-Fi publik DigiCity. Saat memakai Wi-Fi publik, pastikan situs memakai alamat resmi dan hindari memasukkan data penting di jaringan yang tidak kamu kenal." }] });
      if (it.id === "fountain") return say({ lines: [{ speaker: "system", name: "Air Mancur Kota", text: "Airnya jernih dan berkilau. Seperti password yang baik: unik, tidak ada yang sama!" }] });
    },
    [say, update, go, startCase, openCyberpedia, name],
  );
  const interactRef = useRef(interact);
  interactRef.current = interact;

  // Engine lifecycle
  useEffect(() => {
    const cv = canvasRef.current!;
    const engine = new WorldEngine(cv, worldPos.current);
    engineRef.current = engine;
    engine.onStep = () => audio.play("step");
    let zt: number | undefined;
    engine.onZone = (z) => { setZone(z); window.clearTimeout(zt); zt = window.setTimeout(() => setZone(null), 2200); };
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      engine.update(dt);
      engine.render();
      worldPos.current = { x: engine.player.x, y: engine.player.y, dir: engine.player.dir };
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    audio.startMusic("town");
    // Prologue triggers automatically on the very first visit.
    if (!progressRef.current.prologueDone) window.setTimeout(() => interactRef.current({ id: "nara", x: 0, y: 0, label: "" }), 700);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(zt); engineRef.current = null; };
  }, [worldPos]);

  // Keyboard
  useEffect(() => {
    const norm = (k: string) => (k.length === 1 ? k.toLowerCase() : k);
    const down = (e: KeyboardEvent) => {
      const e2 = engineRef.current;
      if (!e2) return;
      const k = norm(e.key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if ((k === "Escape" || k === "m") && !dialog) { setMenuOpen((v) => !v); setCasesOpen(false); return; }
      if (e2.frozen) return;
      if (k === "e" && !e.repeat) { if (e2.near) interactRef.current(e2.near); return; }
      e2.keys.add(k === "Shift" ? "Shift" : k);
    };
    const up = (e: KeyboardEvent) => engineRef.current?.keys.delete(norm(e.key));
    const blur = () => engineRef.current?.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [dialog]);

  const touch = (k: string, on: boolean) => { const e = engineRef.current; if (!e || e.frozen) return; if (on) e.keys.add(k); else e.keys.delete(k); };
  const touchE = () => { const e = engineRef.current; if (e && !e.frozen && e.near) interactRef.current(e.near); };

  const expPct = Math.min(100, (progress.exp / (CASES.length * 100)) * 100);

  return (
    <div className="relative h-full w-full bg-ink">
      <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="pixelated absolute inset-0 h-full w-full" />

      {/* HUD: player card */}
      <div className="panel-game absolute top-[2.5%] left-[1.8%] flex items-center gap-3 p-3 pr-5">
        <div className="h-16 w-16 overflow-hidden rounded-md border-[0.15rem] border-ink bg-sky">
          <img src={portraitSrc("player")} alt="" className="pixelated h-[11rem] w-auto max-w-none -translate-x-[1.3rem] -translate-y-[0.4rem]" />
        </div>
        <div>
          <div className="font-pixel text-xl leading-none">{name}</div>
          <div className="text-xs text-sky">Asisten Cyber Center</div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-pixel text-sm text-gold">EXP</span>
            <div className="h-3.5 w-36 rounded-sm border-[0.15rem] border-ink bg-navy">
              <div className="h-full bg-[image:var(--gradient-gold)] transition-[width] duration-700" style={{ width: `${expPct}%` }} />
            </div>
            <span className="font-pixel text-sm">{progress.exp}</span>
          </div>
        </div>
        <div className="ml-2 border-l-[0.15rem] border-navy-3 pl-4">
          <div className="font-pixel mb-1 text-xs text-sky">MISI {progress.completed.length}/3</div>
          <div className="flex gap-1.5">
            {CASES.map((c) => {
              const done = progress.completed.includes(c.id);
              const active = objective.kind === "case" && objective.caseId === c.id;
              return (
                <div
                  key={c.id}
                  title={c.title}
                  className={`font-pixel flex h-8 w-8 items-center justify-center rounded-md border-[0.15rem] border-ink text-sm ${done ? "bg-success" : active ? "animate-pulse-ring bg-gold text-ink" : "bg-navy-3 text-sky"}`}
                >
                  {done ? "✓" : active ? c.number : "🔒"}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HUD: menu */}
      <div className="absolute top-[2.5%] right-[1.8%] flex gap-2">
        <GameButton
          variant="navy"
          size="icon"
          aria-label="Musik"
          onClick={() => update((p) => ({ ...p, settings: { ...p.settings, music: !p.settings.music } }))}
        >
          {progress.settings.music ? <Music className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </GameButton>
        <GameButton variant="primary" onClick={() => setMenuOpen(true)}>
          <Menu className="h-5 w-5" /> Menu
        </GameButton>
      </div>

      {/* Zone banner */}
      {zone && (
        <div key={zone} className="tag-name font-pixel animate-pop-in absolute top-[3%] left-1/2 -translate-x-1/2 px-6 py-2 text-xl">
          📍 {zone}
        </div>
      )}

      {/* Objective + controls */}
      {!dialog && (
        <>
          <div className="absolute bottom-[3%] left-[1.8%] flex items-center gap-3 rounded-lg border-[0.2rem] border-ink bg-[image:var(--gradient-gold)] px-4 py-2 text-ink shadow-[0_0.3rem_0_0_var(--ink)]">
            <span className="font-pixel text-sm">★ MISI</span>
            <span className="font-bold">{objectiveText(objective)}</span>
          </div>
          <div className="font-pixel absolute right-[1.8%] bottom-[3%] rounded-lg border-[0.15rem] border-ink bg-navy/85 px-4 py-2 text-sm text-sky pointer-coarse:hidden">
            WASD/Panah: Jalan · Shift: Lari · <span className="text-gold">E</span>: Interaksi · Esc: Menu
          </div>
        </>
      )}

      {/* Touch controls */}
      {!dialog && (
        <div className="pointer-fine:hidden">
          <div className="absolute bottom-[14%] left-[3%] grid grid-cols-3 gap-1">
            {[["", ""], ["ArrowUp", "▲"], ["", ""], ["ArrowLeft", "◀"], ["", ""], ["ArrowRight", "▶"], ["", ""], ["ArrowDown", "▼"], ["", ""]].map(([k, l], i) =>
              k ? (
                <button
                  key={i}
                  className="font-pixel h-14 w-14 rounded-lg border-[0.2rem] border-ink bg-navy/80 text-xl text-foreground active:bg-cyan"
                  onPointerDown={() => touch(k, true)}
                  onPointerUp={() => touch(k, false)}
                  onPointerLeave={() => touch(k, false)}
                >
                  {l}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
          <button onClick={touchE} className="font-pixel absolute right-[4%] bottom-[16%] h-20 w-20 rounded-full border-[0.2rem] border-ink bg-[image:var(--gradient-gold)] text-3xl text-ink shadow-[0_0.3rem_0_0_var(--ink)]">
            E
          </button>
        </div>
      )}

      {dialog && (
        <Dialogue
          key={dialog.lines[0]?.text}
          lines={dialog.lines}
          {...(dialog.choices ? { choices: dialog.choices } : {})}
          onDone={() => { const d = dialog; setDialog(null); d.onDone?.(); }}
        />
      )}

      {menuOpen && !casesOpen && (
        <Modal className="w-[26rem]" onClose={() => setMenuOpen(false)}>
          <h2 className="font-pixel text-shadow-pixel mb-4 text-center text-3xl text-gold">Menu</h2>
          <div className="flex flex-col gap-3">
            <GameButton onClick={() => setMenuOpen(false)}>▶ Lanjutkan</GameButton>
            <GameButton variant="sky" onClick={() => { setMenuOpen(false); openCyberpedia("world"); }}>📘 Cyberpedia</GameButton>
            <GameButton variant="cyan" onClick={() => setCasesOpen(true)}>🗂 Daftar Kasus</GameButton>
            <GameButton variant="navy" onClick={() => setSettingsOpen(true)}>⚙ Pengaturan</GameButton>
            {allCasesDone(progress) && <GameButton variant="success" onClick={() => go("final")}>🏆 Hasil Akhir</GameButton>}
            <GameButton variant="navy" onClick={() => go("menu")}>⌂ Simpan &amp; Main Menu</GameButton>
          </div>
          <p className="mt-4 text-center text-xs text-sky">Progres tersimpan otomatis di perangkat ini.</p>
        </Modal>
      )}

      {casesOpen && (
        <Modal className="w-[44rem]" onClose={() => setCasesOpen(false)}>
          <h2 className="font-pixel mb-4 text-3xl text-gold">Daftar Kasus</h2>
          <div className="space-y-3">
            {CASES.map((c) => {
              const done = progress.completed.includes(c.id);
              const open = isCaseUnlocked(progress, c.id);
              return (
                <div key={c.id} className="flex items-center gap-4 rounded-lg border-[0.15rem] border-ink bg-navy p-3">
                  <img src={portraitSrc(c.npc)} alt={c.victim} className="pixelated h-16 w-auto" />
                  <div className="flex-1">
                    <div className="font-pixel text-sm text-cyan">{c.code} · {c.difficulty}</div>
                    <div className="font-pixel text-xl">{c.title}</div>
                    <div className="text-sm text-sky">Korban: {c.victim} · {c.location}</div>
                  </div>
                  {done ? (
                    <GameButton size="sm" variant="sky" onClick={() => { setCasesOpen(false); setMenuOpen(false); startCase(c.id); }}>↻ Ulangi</GameButton>
                  ) : open ? (
                    <span className="font-pixel rounded-md bg-gold px-3 py-1 text-sm text-ink">Aktif</span>
                  ) : (
                    <span className="font-pixel rounded-md bg-navy-3 px-3 py-1 text-sm text-sky">🔒 Terkunci</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex justify-end"><GameButton variant="navy" onClick={() => setCasesOpen(false)}>◀ Kembali</GameButton></div>
        </Modal>
      )}
    </div>
  );
}
