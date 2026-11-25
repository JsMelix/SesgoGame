import { RotateCcw, Skull } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BiasGuideModal } from './components/BiasGuideModal';
import { ChapterDecisionModal } from './components/ChapterDecisionModal';
import { ComicCutsceneModal } from './components/ComicCutsceneModal';
import { GameHud } from './components/GameHud';
import { InventoryHudState, LabCanvas } from './components/LabCanvas';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PauseModal } from './components/PauseModal';
import { NearTargetInfo } from './components/pixelRenderer';
import { ScenarioModal } from './components/ScenarioModal';
import { TitleScreen } from './components/TitleScreen';
import { getScenarioById } from './data/curriculum';
import { getLabLevel } from './data/levels';
import { getChapterStory } from './data/story';
import { Direction, GameScreen, PlayerProgress } from './types/game';
import { retroAudio } from './utils/audio';
import { clearProgress, loadProgress, saveProgress } from './utils/storage';

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    const loaded = loadProgress();
    retroAudio.setMuted(loaded.soundMuted);
    return loaded;
  });

  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => progress.unlockedLevel);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [showComicChapter, setShowComicChapter] = useState<boolean>(false);
  const [seenChapters, setSeenChapters] = useState<Record<number, boolean>>({});
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showBiasGuide, setShowBiasGuide] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [playerHp, setPlayerHp] = useState<number>(5);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(5);
  const [enemiesRemaining, setEnemiesRemaining] = useState<number>(3);
  const [inventory, setInventory] = useState<InventoryHudState>({
    keys: { gold: 0, crimson: 0, cyan: 0 },
    chestsOpened: 0,
    totalChests: 4,
    overdriveSeconds: 0,
    dashReady: true,
  });
  const [nearTarget, setNearTarget] = useState<{
    type: NearTargetInfo['type'];
    id: string;
    label: string;
    shielded?: boolean;
    lockedReason?: string;
  } | null>(null);
  const [touchMoveDir, setTouchMoveDir] = useState<Direction | null>(null);
  const [interactSignal, setInteractSignal] = useState<number>(0);
  const [pulseSignal, setPulseSignal] = useState<number>(0);
  const [dashSignal, setDashSignal] = useState(0);
  const [labResetCounter, setLabResetCounter] = useState<number>(0);

  const currentLevel = getLabLevel(currentLevelId);
  const currentChapter = getChapterStory(currentLevelId);
  const activeScenario = activeScenarioId ? getScenarioById(activeScenarioId) : undefined;
  const hasAnyProgress = Object.keys(progress.scenarios).length > 0;
  const isPlayerDefeated = screen === 'PLAYING' && playerHp <= 0;

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const enterLevel = useCallback(
    (lvlId: number) => {
      setCurrentLevelId(lvlId);
      setActiveScenarioId(null);
      setShowLevelSelect(false);
      setShowBiasGuide(false);
      setPlayerHp(5);
      setLabResetCounter((count) => count + 1);
      setTouchMoveDir(null);
      setNearTarget(null);
      setScreen('PLAYING');
      setShowComicChapter(!seenChapters[lvlId]);
    },
    [seenChapters]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeScenarioId || showComicChapter || isPlayerDefeated) return;
      if (showBiasGuide) {
        setShowBiasGuide(false);
        return;
      }
      if (showLevelSelect) {
        setShowLevelSelect(false);
        return;
      }
      if (screen === 'PLAYING') {
        retroAudio.playUiClick();
        setScreen('PAUSED');
      } else if (screen === 'PAUSED') {
        retroAudio.playUiClick();
        setScreen('PLAYING');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, activeScenarioId, showComicChapter, isPlayerDefeated, showBiasGuide, showLevelSelect]);

  const handleToggleMute = useCallback(() => {
    setProgress((prev) => {
      const nextMuted = !prev.soundMuted;
      retroAudio.setMuted(nextMuted);
      if (!nextMuted) retroAudio.playUiClick();
      return { ...prev, soundMuted: nextMuted };
    });
  }, []);

  const handleScenarioAttempt = useCallback(
    (scenarioId: string, isCorrect: boolean, hintsUsed: number) => {
      if (isCorrect) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }

      setProgress((prev) => {
        const existing = prev.scenarios[scenarioId] ?? {
          solved: false,
          attempts: 0,
          usedHints: 0,
        };
        const updatedScenarios = {
          ...prev.scenarios,
          [scenarioId]: {
            solved: existing.solved || isCorrect,
            attempts: existing.attempts + 1,
            usedHints: Math.max(existing.usedHints, hintsUsed),
          },
        };

        return { ...prev, scenarios: updatedScenarios };
      });
    },
    []
  );

  const handleReachExit = useCallback(() => {
    setActiveScenarioId(null);
    setScreen('CHAPTER_DECISION');
  }, []);

  const handleChapterComplete = () => {
    retroAudio.playLevelUnlock();
    setProgress((prev) => ({
      ...prev,
      completedChapters: prev.completedChapters.includes(currentLevelId)
        ? prev.completedChapters
        : [...prev.completedChapters, currentLevelId],
      unlockedLevel: Math.max(prev.unlockedLevel, Math.min(5, currentLevelId + 1)),
    }));
    setScreen(currentLevelId === 5 ? 'VICTORY' : 'LEVEL_COMPLETE');
  };

  const handleRetryRoom = useCallback(() => {
    retroAudio.playUiClick();
    setPlayerHp(5);
    setLabResetCounter((c) => c + 1);
  }, []);

  const handleResetAll = useCallback(() => {
    const fresh = clearProgress();
    retroAudio.setMuted(fresh.soundMuted);
    setProgress(fresh);
    setStreak(0);
    setPlayerHp(5);
    setSeenChapters({});
    setCurrentLevelId(1);
    setActiveScenarioId(null);
    setShowComicChapter(false);
    setShowLevelSelect(false);
    setShowBiasGuide(false);
    setLabResetCounter((c) => c + 1);
    setScreen('TITLE_MENU');
  }, []);

  const isActivePlay =
    screen === 'PLAYING' &&
    !isPlayerDefeated &&
    !activeScenarioId &&
    !showComicChapter &&
    !showLevelSelect &&
    !showBiasGuide;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0B0F17]">
      <LabCanvas
        key={`${currentLevel.id}-${labResetCounter}`}
        level={currentLevel}
        progress={progress}
        isActivePlay={isActivePlay}
        onOpenTerminal={(id) => setActiveScenarioId(id)}
        onReachExit={handleReachExit}
        onPlayerHpChange={(hp, max) => {
          setPlayerHp(hp);
          setPlayerMaxHp(max);
        }}
        onEnemiesRemainingChange={setEnemiesRemaining}
        onInventoryChange={setInventory}
        onBotHit={() => setStreak(0)}
        onNearTargetChange={setNearTarget}
        externalMoveDir={touchMoveDir}
        triggerInteractSignal={interactSignal}
        triggerPulseSignal={pulseSignal}
        triggerDashSignal={dashSignal}
      />

      {screen === 'TITLE_MENU' && (
        <TitleScreen
          hasProgress={hasAnyProgress}
          onStartPlay={() => enterLevel(progress.unlockedLevel)}
          onOpenLevels={() => setShowLevelSelect(true)}
        />
      )}

      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <div inert={!isActivePlay}>
          <GameHud
            level={currentLevel}
            progress={progress}
            hp={playerHp}
            maxHp={playerMaxHp}
            enemiesRemaining={enemiesRemaining}
            inventory={inventory}
            streak={streak}
            nearTarget={nearTarget}
            onToggleMute={handleToggleMute}
            onOpenComic={() => setShowComicChapter(true)}
            onOpenGuide={() => setShowBiasGuide(true)}
            onOpenLevels={() => setShowLevelSelect(true)}
            onPause={() => setScreen('PAUSED')}
            onTouchMove={setTouchMoveDir}
            onTouchInteract={() => setInteractSignal((s) => s + 1)}
            onTouchPulse={() => setPulseSignal((s) => s + 1)}
            onTouchDash={() => setDashSignal((signal) => signal + 1)}
            onAdvanceLevel={handleReachExit}
          />
        </div>
      )}

      {showComicChapter && (
        <ComicCutsceneModal
          chapter={currentChapter}
          onFinish={() => {
            setSeenChapters((prev) => ({ ...prev, [currentLevelId]: true }));
            setShowComicChapter(false);
          }}
        />
      )}

      {activeScenario && (
        <ScenarioModal
          key={activeScenario.id}
          scenario={activeScenario}
          alreadySolved={Boolean(progress.scenarios[activeScenario.id]?.solved)}
          attemptsSoFar={progress.scenarios[activeScenario.id]?.attempts ?? 0}
          onAttempt={handleScenarioAttempt}
          onClose={() => setActiveScenarioId(null)}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          currentLevelId={currentLevelId}
          progress={progress}
          onSelectLevel={enterLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showBiasGuide && (
        <BiasGuideModal progress={progress} onClose={() => setShowBiasGuide(false)} />
      )}

      {isPlayerDefeated && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/80 comic-halftone"
          role="dialog"
          aria-modal="true"
        >
          <div className="comic-panel w-full max-w-md p-6 space-y-4 text-center bg-[#131A26]">
            <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-[#EF4444] bg-[#7F1D1D] text-[#FCA5A5] mx-auto">
              <Skull className="w-8 h-8" />
            </div>
            <h2 className="font-pixel text-lg text-[#F8FAFC]">¡Sobrecarga de Ruido!</h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              Los drones de VOX-ZERO agotaron la energía de Kael. Tus casos ya resueltos siguen a salvo: vuelve a la sala y acaba con ellos.
            </p>
            <button
              type="button"
              onClick={handleRetryRoom}
              className="metal-btn w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#DC2626] text-white font-pixel text-xs cursor-pointer min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar Sala</span>
            </button>
          </div>
        </div>
      )}

      {screen === 'PAUSED' && !showLevelSelect && !showBiasGuide && (
        <PauseModal
          levelTitle={currentLevel.title}
          onResume={() => setScreen('PLAYING')}
          onOpenLevels={() => setShowLevelSelect(true)}
          onRestartLevel={() => {
            setPlayerHp(5);
            setLabResetCounter((c) => c + 1);
            setScreen('PLAYING');
          }}
          onReturnToTitle={() => setScreen('TITLE_MENU')}
          onResetAllProgress={handleResetAll}
        />
      )}

      {screen === 'CHAPTER_DECISION' && (
        <ChapterDecisionModal chapter={currentChapter} onComplete={handleChapterComplete} />
      )}

      {(screen === 'LEVEL_COMPLETE' || screen === 'VICTORY') && (
        <LevelCompleteModal
          levelId={currentLevelId}
          isFinalVictory={screen === 'VICTORY'}
          progress={progress}
          onNextLevel={() => enterLevel(Math.min(5, currentLevelId + 1))}
          onReplayLevel={() => {
            setPlayerHp(5);
            setLabResetCounter((c) => c + 1);
            setScreen('PLAYING');
          }}
          onBackToTitle={() => setScreen('TITLE_MENU')}
        />
      )}

      <OfflineIndicator />
    </main>
  );
}
