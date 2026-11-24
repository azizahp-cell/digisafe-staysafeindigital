import { useEffect, useState } from "react";
import { audio } from "../audio";
import { useGame } from "../state";
import { Logo } from "../ui/Logo";

export function SplashScreen() {
  const { go } = useGame();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2300);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const start = () => {
      audio.unlock();
      audio.startMusic("town");
      audio.play("unlock");
      go("menu");
    };
    window.addEventListener("keydown", start, { once: true });
    window.addEventListener("pointerdown", start, { once: true });
    return () => {
      window.removeEventListener("keydown", start);
      window.removeEventListener("pointerdown", start);
    };
  }, [ready, go]);

  return (
    <div className="bg-night bg-grid-tech flex h-full w-full flex-col items-center justify-center">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="animate-twinkle absolute h-2 w-2 bg-cyan"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.3}s` }}
        />
      ))}
      <Logo />
      <p className="font-pixel mt-8 text-lg text-sky">Think Before You Click. Stay Safe in Digital World.</p>
      <div className="mt-12 h-6 w-[26rem] rounded-md border-[0.2rem] border-ink bg-navy p-[0.2rem] shadow-[0_0.25rem_0_0_var(--ink)]">
        <div className="animate-load-bar h-full rounded-sm bg-[image:linear-gradient(90deg,var(--cyan),var(--turquoise))]" />
      </div>
      <p className={`font-pixel mt-6 text-xl text-foreground ${ready ? "animate-blink" : "opacity-60"}`}>
        {ready ? "▶ Klik atau tekan tombol apa saja untuk mulai" : "Memuat DigiCity..."}
      </p>
      <p className="absolute bottom-5 text-sm text-sky/70">Media Pembelajaran Keamanan Siber · Untuk Siswa SMP Kelas IX</p>
    </div>
  );
}
