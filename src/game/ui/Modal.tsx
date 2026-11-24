import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({ children, className, onClose }: { children: ReactNode; className?: string; onClose?: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/60 p-6 backdrop-blur-[2px]" onClick={onClose}>
      <div className={cn("panel-game animate-pop-in max-h-full overflow-auto p-6", className)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between rounded-lg border-[0.15rem] border-ink bg-navy px-4 py-3 text-left"
    >
      <span className="font-pixel text-lg">{label}</span>
      <span className={cn("font-pixel flex h-8 w-20 items-center rounded-md border-[0.15rem] border-ink px-1 text-sm transition-colors", on ? "justify-end bg-success" : "justify-start bg-navy-3")}>
        <span className="flex h-5 w-9 items-center justify-center rounded-sm bg-card text-navy">{on ? "ON" : "OFF"}</span>
      </span>
    </button>
  );
}
