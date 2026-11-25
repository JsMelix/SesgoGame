import { CheckCircle2, Lock, Play, X } from 'lucide-react';
import { getChapterStory } from '../data/story';
import { LAB_LEVELS } from '../data/levels';
import { PlayerProgress } from '../types/game';
import { retroAudio } from '../utils/audio';

interface LevelSelectModalProps {
  currentLevelId: number;
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export function LevelSelectModal({
  currentLevelId,
  progress,
  onSelectLevel,
  onClose,
}: LevelSelectModalProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 md:p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-select-title"
    >
      <div className="metal-frame w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden bg-[#131A26]">
        <div className="flex items-center justify-between gap-4 px-4 md:px-5 py-3.5 border-b-2 border-[#334155] bg-[#1B2434]">
          <div>
            <h2 id="level-select-title" className="font-pixel text-sm md:text-lg text-[#F8FAFC]">
              Mapa de campaña
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Resuelve los tres casos y cierra la decisión del capítulo para avanzar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onClose();
            }}
            aria-label="Cerrar selector de niveles"
            className="metal-btn p-2.5 bg-[#0B0F17] text-[#F8FAFC] shrink-0 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-5 space-y-3">
          {LAB_LEVELS.map((lvl) => {
            const isUnlocked = lvl.id <= progress.unlockedLevel;
            const solvedCount = lvl.terminals.filter(
              (t) => progress.scenarios[t.scenarioId]?.solved
            ).length;
            const isCompleted = progress.completedChapters.includes(lvl.id);
            const chapter = getChapterStory(lvl.id);
            const isCurrent = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                style={{ borderLeft: `4px solid ${lvl.accentColor}` }}
                className={`border-2 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUnlocked
                    ? 'border-[#475569] bg-[#1B2434]'
                    : 'border-[#1E293B] bg-[#0B0F17]/80 opacity-75'
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-pixel text-xs md:text-sm text-[#F8FAFC]">Cap. {lvl.id} · {chapter.chapterTitle}</span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#34D399]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Decisión cerrada
                      </span>
                    ) : !isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#94A3B8]">
                        <Lock className="w-3.5 h-3.5" />
                        Se desbloquea al completar el Nivel {lvl.id - 1}
                      </span>
                    ) : solvedCount === 3 ? (
                      <span className="text-xs font-semibold text-amber-300">Decisión pendiente</span>
                    ) : isCurrent ? (
                      <span className="text-xs font-semibold text-[#F59E0B]">
                        En curso
                      </span>
                    ) : null}
                  </div>

                  <div className="text-xs text-[#CBD5E1] flex flex-wrap items-center gap-2">
                    <span>Dificultad: {lvl.difficultyLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lvl.biasesCovered.join(' · ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num font-bold text-[#F59E0B]">
                      {solvedCount}/3 casos
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    retroAudio.playUiClick();
                    onSelectLevel(lvl.id);
                  }}
                  className={`metal-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] ${
                    isUnlocked
                      ? isCurrent
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#10B981] text-[#052E16]'
                      : 'bg-[#1E293B] text-[#64748B]'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Repasar' : 'Entrar'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloqueado</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
