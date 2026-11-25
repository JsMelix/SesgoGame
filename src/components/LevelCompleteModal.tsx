import HERO_PORTRAIT_SRC from '../assets/images/portrait_rocker_hero_1794619960238.jpg';
import VICTORY_SPLASH_SRC from '../assets/images/comic_victory_splash_1794855574438.jpg';
import { ArrowRight, Award, RotateCcw } from 'lucide-react';
import { getLabLevel } from '../data/levels';
import { getChapterStory } from '../data/story';
import { PlayerProgress } from '../types/game';
import { retroAudio } from '../utils/audio';

interface LevelCompleteModalProps {
  levelId: number;
  isFinalVictory: boolean;
  progress: PlayerProgress;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onBackToTitle: () => void;
}

export function LevelCompleteModal({
  levelId,
  isFinalVictory,
  progress,
  onNextLevel,
  onReplayLevel,
  onBackToTitle,
}: LevelCompleteModalProps) {
  const level = getLabLevel(levelId);
  const story = getChapterStory(levelId);
  const totalSolved = Object.values(progress.scenarios).filter((s) => s.solved).length;
  const independentSolved = Object.values(progress.scenarios).filter(
    (s) => s.solved && s.usedHints === 0
  ).length;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 md:p-4 bg-black/85 comic-halftone"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-complete-title"
    >
      <div className="comic-panel w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[#131A26]">
        {isFinalVictory && (
          <div className="relative border-b-3 border-[#05070B]">
            <img
              src={VICTORY_SPLASH_SRC}
              alt="Kael y LUMEN celebrando su triunfo contra el algoritmo sesgado"
              referrerPolicy="no-referrer"
              className="pixel-canvas w-full h-44 sm:h-52 object-cover"
            />
            <span className="absolute bottom-2.5 right-3 font-pixel text-xs px-2.5 py-1 bg-[#F59E0B] text-[#0B0F17] border-2 border-[#05070B] shadow-[3px_3px_0_#05070B] -rotate-2">
              ¡BIS FINAL!
            </span>
          </div>
        )}

        <div className="p-5 md:p-6 space-y-4 text-center">
          {!isFinalVictory && (
            <div className="flex items-center justify-center gap-4">
              <img
                src={HERO_PORTRAIT_SRC}
                alt="Retrato de Kael"
                referrerPolicy="no-referrer"
                className="pixel-canvas w-16 h-16 border-2 border-[#10B981] object-cover bg-[#0B0F17]"
              />
              <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-[#10B981] bg-[#064E3B] text-[#34D399]">
                <Award className="w-8 h-8" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs font-mono-num font-bold text-[#34D399]">
              {isFinalVictory ? 'AUDITORÍA FINAL CERRADA' : `${level.title.toUpperCase()} SUPERADO`}
            </div>
            <h2 id="level-complete-title" className="font-pixel text-lg md:text-2xl text-[#F8FAFC]">
              {isFinalVictory ? 'El campus recupera el control' : 'Capítulo Completado'}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-[#0F172A] bg-[#FEF08A] border-2 border-[#05070B] p-3 text-left shadow-[3px_3px_0_#05070B]">
              {story.outroLine}
            </p>
            <p className="text-xs md:text-sm text-[#CBD5E1] leading-relaxed">
              {isFinalVictory
                ? 'Antes de usar IA para decidir, comprueba la evidencia, pregunta quién puede salir perjudicado y acuerda quién responderá si hay un error.'
                : `Mitigaste los sesgos clave de este nivel (${level.biasesCovered.join(', ')}). El Nivel ${levelId + 1} ya está desbloqueado.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-2 border-[#334155] bg-[#0B0F17] p-3.5 text-left">
            <div>
              <div className="text-xs text-[#94A3B8]">Escenarios resueltos</div>
              <div className="font-mono-num font-bold text-lg text-[#F59E0B]">
                {totalSolved} / 15
              </div>
            </div>
            <div>
              <div className="text-xs text-[#94A3B8]">Sin pedir pistas</div>
              <div className="font-mono-num font-bold text-lg text-[#34D399]">
                {independentSolved} / {totalSolved}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {!isFinalVictory && levelId < 5 ? (
              <button
                type="button"
                onClick={() => {
                  retroAudio.playUiClick();
                  onNextLevel();
                }}
                className="metal-btn inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#10B981] text-[#052E16] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[48px]"
              >
                <span>Capítulo {levelId + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                retroAudio.playUiClick();
                onReplayLevel();
              }}
              className="metal-btn inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2434] text-[#F8FAFC] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[48px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Repasar Nivel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                retroAudio.playUiClick();
                onBackToTitle();
              }}
              className="metal-btn inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#DC2626] text-white font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[48px]"
            >
              <span>Inicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
