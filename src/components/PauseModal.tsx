import { Home, Map, Play, RotateCcw, Trash2 } from 'lucide-react';
import { retroAudio } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface PauseModalProps {
  levelTitle: string;
  onResume: () => void;
  onOpenLevels: () => void;
  onRestartLevel: () => void;
  onReturnToTitle: () => void;
  onResetAllProgress: () => void;
}

export function PauseModal({
  levelTitle,
  onResume,
  onOpenLevels,
  onRestartLevel,
  onReturnToTitle,
  onResetAllProgress,
}: PauseModalProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="metal-frame w-full max-w-md p-6 space-y-5 bg-[#131A26]">
        <div className="text-center space-y-1">
          <div className="text-xs font-medium text-[#F59E0B]">{levelTitle}</div>
          <h2 id="pause-title" className="font-pixel text-xl text-[#F8FAFC]">
            Juego en Pausa
          </h2>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onResume();
            }}
            className="metal-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#DC2626] text-white font-pixel text-xs cursor-pointer min-h-[48px]"
          >
            <Play className="w-4 h-4" />
            <span>Reanudar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onOpenLevels();
            }}
            className="metal-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2434] text-[#F8FAFC] font-pixel text-xs cursor-pointer min-h-[48px]"
          >
            <Map className="w-4 h-4 text-[#38BDF8]" />
            <span>Cambiar de Nivel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onRestartLevel();
            }}
            className="metal-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2434] text-[#F8FAFC] font-pixel text-xs cursor-pointer min-h-[48px]"
          >
            <RotateCcw className="w-4 h-4 text-[#F59E0B]" />
            <span>Reiniciar Posición</span>
          </button>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onReturnToTitle();
            }}
            className="metal-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2434] text-[#F8FAFC] font-pixel text-xs cursor-pointer min-h-[48px]"
          >
            <Home className="w-4 h-4" />
            <span>Pantalla de Título</span>
          </button>

          <div className="flex justify-center pt-1">
            <PWAInstallButton />
          </div>
        </div>

        <div className="pt-3 border-t border-[#334155] flex justify-center">
          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onResetAllProgress();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F87171] hover:underline cursor-pointer min-h-[40px] px-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar progreso guardado</span>
          </button>
        </div>
      </div>
    </div>
  );
}
