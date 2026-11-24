import { createContext, useContext } from "react";
import type { CaseId } from "./data/cases";
import type { FoundClues, Progress } from "./progress";
import type { Dir } from "./world/engine";

export type Screen = "splash" | "menu" | "intro" | "world" | "learning" | "dashboard" | "evidence" | "decision" | "report" | "final";

export interface Session {
  caseId: CaseId;
  found: FoundClues;
  log: { evidenceId: string; clueId: string }[];
  attempts: number;
  wrong: string[];
  replay: boolean;
  seed: number;
}

export interface LearningState {
  mode: "module" | "browse";
  materialId: CaseId;
  returnTo: Screen;
}

export interface GameApi {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  go: (s: Screen) => void;
  screen: Screen;
  session: Session | null;
  setSession: (fn: (s: Session | null) => Session | null) => void;
  learning: LearningState;
  startCase: (id: CaseId) => void;
  openCyberpedia: (returnTo: Screen, materialId?: CaseId) => void;
  newGame: () => void;
  worldPos: { current: { x: number; y: number; dir: Dir } };
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
}

export const GameContext = createContext<GameApi | null>(null);
export const useGame = () => {
  const g = useContext(GameContext);
  if (!g) throw new Error("useGame outside GameContext");
  return g;
};
