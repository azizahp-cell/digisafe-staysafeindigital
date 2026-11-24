import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "../audio";
import { portraitSrc, type CharId } from "../sprites";
import { GameButton } from "./GameButton";

export interface DialogueLine {
  speaker: CharId | "system";
  name?: string;
  text: string;
}
export interface DialogueChoice {
  label: string;
  variant?: "primary" | "navy" | "sky";
  onSelect: () => void;
}

export function Dialogue({
  lines,
  choices,
  onDone,
}: {
  lines: DialogueLine[];
  choices?: DialogueChoice[];
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const line = lines[idx] ?? lines[0] ?? { speaker: "system" as const, text: "" };
  const full = shown >= line.text.length;
  const isLast = idx === lines.length - 1;
  const doneRef = useRef(false);

  useEffect(() => {
    setShown(0);
  }, [idx]);

  useEffect(() => {
    if (full) return;
    const t = window.setTimeout(() => {
      setShown((s) => Math.min(line.text.length, s + 2));
      if (shown % 6 === 0) audio.play("talk");
    }, 22);
    return () => window.clearTimeout(t);
  }, [shown, full, line.text.length]);

  const advance = useCallback(() => {
    if (!full) return setShown(line.text.length);
    if (!isLast) return setIdx((i) => i + 1);
    if (choices?.length) return;
    if (!doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [full, isLast, choices, line.text.length, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (["e", "E", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const name = line.speaker === "system" ? line.name ?? "Info" : line.name ?? speakerName(line.speaker);

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-[4%] pb-[2.5%]" onClick={advance}>
      <div className="panel-game animate-pop-in relative flex w-full max-w-[64rem] gap-5 p-5 pr-7">
        {line.speaker !== "system" && (
          <div className="relative -mt-24 flex w-36 shrink-0 items-end justify-center">
            <img src={portraitSrc(line.speaker)} alt={name} className="pixelated h-44 w-auto drop-shadow-[0_0.3rem_0_var(--ink)]" />
          </div>
        )}
        <div className="min-h-[7.5rem] flex-1">
          <div className="tag-name font-pixel mb-2 inline-block px-4 py-1 text-lg">{name}</div>
          <p className="text-lg leading-relaxed font-semibold">{line.text.slice(0, shown)}</p>
          {full && isLast && choices?.length ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {choices.map((c) => (
                <GameButton key={c.label} variant={c.variant ?? "primary"} onClick={(e) => { e.stopPropagation(); c.onSelect(); }}>
                  {c.label}
                </GameButton>
              ))}
            </div>
          ) : null}
        </div>
        {full && !(isLast && choices?.length) && (
          <div className="font-pixel absolute right-4 bottom-3 animate-bob text-sm text-gold">
            {isLast ? "[E] Tutup" : "[E] Lanjut ▼"}
          </div>
        )}
      </div>
    </div>
  );
}

function speakerName(s: CharId) {
  return { player: "Kamu", nara: "Nara", ardi: "Ardi", dito: "Dito", sasa: "Sasa" }[s];
}
