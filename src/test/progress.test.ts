import { describe, expect, it } from "vitest";
import { CASES, getCase } from "@/game/data/cases";
import {
  allCasesDone,
  canProceedToDecision,
  completeCase,
  currentObjective,
  debriefCase,
  defaultProgress,
  isCaseUnlocked,
  shuffled,
} from "@/game/progress";

const started = () => ({ ...defaultProgress(), prologueDone: true });

describe("DIGISAFE progress rules", () => {
  it("awards 100 EXP for solving a case", () => {
    expect(completeCase(started(), "phishing").exp).toBe(100);
  });

  it("totals 300 EXP after all three cases", () => {
    let p = started();
    for (const c of CASES) p = debriefCase(completeCase(p, c.id), c.id);
    expect(p.exp).toBe(300);
    expect(allCasesDone(p)).toBe(true);
    expect(currentObjective(p)).toEqual({ kind: "done" });
  });

  it("does not award extra EXP when replaying a solved case", () => {
    const p = completeCase(completeCase(started(), "phishing"), "phishing");
    expect(p.exp).toBe(100);
  });

  it("keeps case 2 locked until case 1 is solved and reported to Nara", () => {
    let p = started();
    expect(isCaseUnlocked(p, "takeover")).toBe(false);
    p = completeCase(p, "phishing");
    expect(isCaseUnlocked(p, "takeover")).toBe(false);
    p = debriefCase(p, "phishing");
    expect(isCaseUnlocked(p, "takeover")).toBe(true);
  });

  it("locks every case before the prologue with Nara", () => {
    expect(isCaseUnlocked(defaultProgress(), "phishing")).toBe(false);
  });

  it("blocks the decision until all evidence clues are examined", () => {
    const c = getCase("phishing");
    const partial = { email: ["sender", "pressure", "login"], url: ["domain", "look", "https"] };
    expect(canProceedToDecision(c, partial)).toBe(false);
    expect(canProceedToDecision(c, { ...partial, loginlog: ["unknown", "timing"] })).toBe(true);
  });

  it("every case has exactly three evidence items", () => {
    for (const c of CASES) expect(c.evidence).toHaveLength(3);
  });

  it("uses the specified best answers: Ardi B, Dito A, Sasa C", () => {
    const best = (id: "phishing" | "takeover" | "malware") =>
      getCase(id).decision.options.filter((o) => o.correct).map((o) => o.id);
    expect(best("phishing")).toEqual(["B"]);
    expect(best("takeover")).toEqual(["A"]);
    expect(best("malware")).toEqual(["C"]);
  });

  it("shuffling options keeps every option", () => {
    const opts = getCase("phishing").decision.options;
    expect(shuffled(opts, 42).map((o) => o.id).sort()).toEqual(["A", "B", "C"]);
  });
});
