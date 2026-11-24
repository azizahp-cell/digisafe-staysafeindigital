import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { audio } from "./audio";
import type { CaseId } from "./data/cases";
import { defaultProgress, loadProgress, saveProgress, type Progress } from "./progress";
import { GameContext, type GameApi, type LearningState, type Screen, type Session } from "./state";
import { PLAYER_START } from "./world/map";
import type { Dir } from "./world/engine";
import { SettingsModal } from "./ui/SettingsModal";
import { SplashScreen } from "./screens/SplashScreen";
import { MainMenu } from "./screens/MainMenu";
import { IntroScreen } from "./screens/IntroScreen";
import { WorldScreen } from "./screens/WorldScreen";
import { LearningScreen } from "./screens/LearningScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EvidenceScreen } from "./screens/EvidenceScreen";
import { DecisionScreen } from "./screens/DecisionScreen";
import { ReportScreen } from "./screens/ReportScreen";
import { FinalScreen } from "./screens/FinalScreen";

const SCREENS: Record<Screen, () => React.JSX.Element | null> = {
  splash: SplashScreen,
  menu: MainMenu,
  intro: IntroScreen,
  world: WorldScreen,
  learning: LearningScreen,
  dashboard: DashboardScreen,
  evidence: EvidenceScreen,
  decision: DecisionScreen,
  report: ReportScreen,
  final: FinalScreen,
};

export function Game() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("splash");
  const [fading, setFading] = useState(false);
  const [session, setSessionState] = useState<Session | null>(null);
  const [learning, setLearning] = useState<LearningState>({ mode: "browse", materialId: "phishing", returnTo: "menu" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const worldPos = useRef<{ x: number; y: number; dir: Dir }>({ ...PLAYER_START, dir: "up" });
  const pending = useRef<number | null>(null);

  useEffect(() => {
    const p = loadProgress();
    if (p) setProgress(p);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveProgress(progress);
    audio.setMusic(progress.settings.music);
    audio.setSfx(progress.settings.sfx);
  }, [progress, loaded]);

  const go = useCallback((s: Screen) => {
    if (pending.current) window.clearTimeout(pending.current);
    setFading(true);
    pending.current = window.setTimeout(() => {
      setScreen(s);
      setFading(false);
      pending.current = null;
    }, 260);
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  const setSession = useCallback((fn: (s: Session | null) => Session | null) => setSessionState(fn), []);

  const startCase = useCallback(
    (id: CaseId) => {
      setSessionState({
        caseId: id,
        found: {},
        log: [],
        attempts: 0,
        wrong: [],
        replay: progress.completed.includes(id),
        seed: Math.floor(Math.random() * 1e9),
      });
      setLearning({ mode: "module", materialId: id, returnTo: "world" });
      go("learning");
    },
    [go, progress.completed],
  );

  const openCyberpedia = useCallback(
    (returnTo: Screen, materialId?: CaseId) => {
      setLearning({ mode: "browse", materialId: materialId ?? "phishing", returnTo });
      go("learning");
    },
    [go],
  );

  const newGame = useCallback(() => {
    worldPos.current = { ...PLAYER_START, dir: "up" };
    setProgress((p) => ({ ...defaultProgress(p.settings), playerName: p.playerName, started: !!p.playerName }));
    setSessionState(null);
  }, []);

  const api: GameApi = useMemo(
    () => ({ progress, update, go, screen, session, setSession, learning, startCase, openCyberpedia, newGame, worldPos, settingsOpen, setSettingsOpen }),
    [progress, update, go, screen, session, setSession, learning, startCase, openCyberpedia, newGame, settingsOpen],
  );

  const Current = SCREENS[screen];

  return (
    <GameContext.Provider value={api}>
      <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-ink">
        <div className="relative aspect-video w-[min(100vw,177.78vh)] overflow-hidden bg-navy text-foreground select-none">
          <div key={screen} className="animate-screen-in absolute inset-0">
            <Current />
          </div>
          {settingsOpen && <SettingsModal />}
          <div
            className={`pointer-events-none absolute inset-0 z-50 bg-ink transition-opacity duration-[260ms] ${fading ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      </div>
    </GameContext.Provider>
  );
}
