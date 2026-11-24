import { CASE_ORDER, EXP_PER_CASE, type CaseData, type CaseId } from "./data/cases";

export interface Settings {
  music: boolean;
  sfx: boolean;
}

export interface Progress {
  version: 1;
  playerName: string;
  started: boolean;
  prologueDone: boolean;
  exp: number;
  completed: CaseId[];
  debriefed: CaseId[];
  learned: CaseId[];
  settings: Settings;
}

export const STORAGE_KEY = "digisafe-progress-v1";

export const defaultProgress = (settings?: Settings): Progress => ({
  version: 1,
  playerName: "",
  started: false,
  prologueDone: false,
  exp: 0,
  completed: [],
  debriefed: [],
  learned: [],
  settings: settings ?? { music: true, sfx: true },
});

/** A case opens after the prologue and once every earlier case is solved and reported to Nara. */
export function isCaseUnlocked(p: Progress, id: CaseId): boolean {
  if (!p.prologueDone) return false;
  const idx = CASE_ORDER.indexOf(id);
  return CASE_ORDER.slice(0, idx).every((c) => p.completed.includes(c) && p.debriefed.includes(c));
}

export type Objective =
  | { kind: "prologue" }
  | { kind: "case"; caseId: CaseId }
  | { kind: "debrief"; caseId: CaseId }
  | { kind: "done" };

export function currentObjective(p: Progress): Objective {
  if (!p.prologueDone) return { kind: "prologue" };
  for (const id of CASE_ORDER) {
    if (!p.completed.includes(id)) return { kind: "case", caseId: id };
    if (!p.debriefed.includes(id)) return { kind: "debrief", caseId: id };
  }
  return { kind: "done" };
}

/** Solving a case awards EXP once; replaying a solved case awards nothing extra. */
export function completeCase(p: Progress, id: CaseId): Progress {
  if (p.completed.includes(id)) return p;
  return { ...p, completed: [...p.completed, id], exp: p.exp + EXP_PER_CASE };
}

export function debriefCase(p: Progress, id: CaseId): Progress {
  if (!p.completed.includes(id) || p.debriefed.includes(id)) return p;
  return { ...p, debriefed: [...p.debriefed, id] };
}

export function markLearned(p: Progress, id: CaseId): Progress {
  return p.learned.includes(id) ? p : { ...p, learned: [...p.learned, id] };
}

export const allCasesDone = (p: Progress) => CASE_ORDER.every((c) => p.completed.includes(c));

/** found: evidenceId -> clue ids the player has inspected. */
export type FoundClues = Record<string, string[]>;

export const isEvidenceExamined = (c: CaseData, evidenceId: string, found: FoundClues) => {
  const ev = c.evidence.find((e) => e.id === evidenceId);
  if (!ev) return false;
  const f = found[evidenceId] ?? [];
  return ev.clues.every((cl) => f.includes(cl.id));
};

/** The player may move on to the decision only after every evidence item is fully examined. */
export const canProceedToDecision = (c: CaseData, found: FoundClues) =>
  c.evidence.every((e) => isEvidenceExamined(c, e.id, found));

export function loadProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Progress;
    if (p?.version !== 1) return null;
    const valid = (arr: unknown) =>
      Array.isArray(arr) ? (arr.filter((x) => CASE_ORDER.includes(x as CaseId)) as CaseId[]) : [];
    return {
      ...defaultProgress(),
      ...p,
      completed: valid(p.completed),
      debriefed: valid(p.debriefed),
      learned: valid(p.learned),
      exp: valid(p.completed).length * EXP_PER_CASE,
    };
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

/** Deterministic shuffle so answer position cannot be memorised from the spec letters. */
export function shuffled<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
