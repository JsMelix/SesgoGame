import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Box,
  Flame,
  Heart,
  KeyRound,
  Map,
  MessageSquareQuote,
  Pause,
  Skull,
  Wind,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { Direction, LabLevelConfig, PlayerProgress } from '../types/game';
import { retroAudio } from '../utils/audio';
import { InventoryHudState } from './LabCanvas';
import { NearTargetInfo } from './pixelRenderer';

interface GameHudProps {
  level: LabLevelConfig;
  progress: PlayerProgress;
  hp: number;
  maxHp: number;
  enemiesRemaining: number;
  inventory: InventoryHudState;
  streak: number;
  nearTarget: {
    type: NearTargetInfo['type'];
    id: string;
    label: string;
    shielded?: boolean;
    lockedReason?: string;
  } | null;
  onToggleMute: () => void;
  onOpenComic: () => void;
  onOpenGuide: () => void;
  onOpenLevels: () => void;
  onPause: () => void;
  onTouchMove: (dir: Direction | null) => void;
  onTouchInteract: () => void;
  onTouchPulse: () => void;
  onTouchDash: () => void;
  onAdvanceLevel: () => void;
}

export function GameHud({
  level,
  progress,
  hp,
  maxHp,
  enemiesRemaining,
  inventory,
  streak,
  nearTarget,
  onToggleMute,
  onOpenComic,
  onOpenGuide,
  onOpenLevels,
  onPause,
  onTouchMove,
  onTouchInteract,
  onTouchPulse,
  onTouchDash,
  onAdvanceLevel,
}: GameHudProps) {
  const solvedCount = level.terminals.filter((t) => progress.scenarios[t.scenarioId]?.solved).length;
  const levelDone = solvedCount === 3 && enemiesRemaining === 0;
  const totalKeys = inventory.keys.gold + inventory.keys.crimson + inventory.keys.cyan;
  const canInteract = Boolean(nearTarget && !nearTarget.shielded && !nearTarget.lockedReason);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-2.5 md:p-4">
      {/* Compact Top Perimeter Bar */}
      <div className="flex items-start justify-between gap-2 pt-safe">
        <div className="pointer-events-auto metal-frame-sm px-3 py-1.5 flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="font-pixel text-[11px] md:text-xs text-[#F59E0B] truncate">
              {level.title}
            </div>
            <div className="text-[11px] md:text-xs text-[#CBD5E1] flex items-center gap-2.5 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-[#F87171]">
                <Heart className="w-3 h-3 fill-[#EF4444] text-[#EF4444]" />
                {hp}/{maxHp}
              </span>
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-[#FCA5A5]">
                <Skull className="w-3 h-3 text-[#EF4444]" />
                {enemiesRemaining}
              </span>
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-[#FBBF24]">
                <Box className="w-3 h-3 text-[#F59E0B]" />
                {inventory.chestsOpened}/{inventory.totalChests}
              </span>
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-[#E2E8F0]">
                {inventory.keys.gold > 0 && (
                  <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" aria-label="Llave Dorada" />
                )}
                {inventory.keys.crimson > 0 && (
                  <KeyRound className="w-3.5 h-3.5 text-[#EF4444]" aria-label="Llave Carmesí" />
                )}
                {inventory.keys.cyan > 0 && (
                  <KeyRound className="w-3.5 h-3.5 text-[#38BDF8]" aria-label="Llave Cian" />
                )}
                {totalKeys === 0 && (
                  <span className="text-[#64748B] inline-flex items-center gap-0.5">
                    <KeyRound className="w-3 h-3" />0
                  </span>
                )}
              </span>
              <span className="font-mono-num font-bold text-[#34D399]">
                Casos {solvedCount}/3
              </span>
              {inventory.overdriveSeconds > 0 && (
                <span className="inline-flex items-center gap-1 font-mono-num font-bold text-[#C084FC]">
                  <Zap className="w-3 h-3 text-[#A855F7]" />
                  2X {inventory.overdriveSeconds}s
                </span>
              )}
              <span className="hidden sm:inline-flex items-center gap-1 font-mono-num font-bold text-[#F59E0B]">
                <Flame className="w-3 h-3 text-[#F59E0B]" />
                x{streak}
              </span>
            </div>
          </div>
        </div>

        {/* Top-right Utility Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onOpenComic();
            }}
            aria-label="Ver historia del capítulo"
            className="metal-btn inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 md:px-3 bg-[#131A26] text-[#F8FAFC] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <MessageSquareQuote className="w-4 h-4 text-[#EF4444]" />
            <span className="hidden md:inline">Cómic</span>
          </button>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onOpenGuide();
            }}
            aria-label="Abrir Guía y Bestiario"
            className="metal-btn inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 md:px-3 bg-[#131A26] text-[#F8FAFC] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#F59E0B]" />
            <span className="hidden md:inline">Guía</span>
          </button>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onOpenLevels();
            }}
            aria-label="Selector de Niveles"
            className="metal-btn inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 md:px-3 bg-[#131A26] text-[#F8FAFC] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Map className="w-4 h-4 text-[#38BDF8]" />
            <span className="hidden md:inline">Niveles</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={progress.soundMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="metal-btn inline-flex items-center justify-center min-w-[44px] min-h-[44px] bg-[#131A26] text-[#F8FAFC] shrink-0 cursor-pointer"
          >
            {progress.soundMuted ? (
              <VolumeX className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#10B981]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onPause();
            }}
            aria-label="Pausar juego"
            className="metal-btn inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 md:px-3 bg-[#131A26] text-[#F8FAFC] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Pause className="w-4 h-4 text-[#EF4444]" />
            <span className="hidden md:inline">Pausa</span>
          </button>
        </div>
      </div>

      {/* Center-bottom objective banner (when all bots defeated & 3/3 solved) */}
      {levelDone && (
        <div className="pointer-events-auto self-center metal-frame-sm px-3.5 py-2 bg-[#064E3B] flex items-center gap-3 max-w-md">
          <span className="text-xs font-semibold text-[#ECFDF5]">
            Ya tienes las pruebas. Decide qué hacer con ellas.
          </span>
          <button
            type="button"
            onClick={() => {
              retroAudio.playInteract();
              onAdvanceLevel();
            }}
            className="metal-btn px-3 py-2 bg-[#10B981] text-[#052E16] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
          >
            Tomar decisión
          </button>
        </div>
      )}

      {/* Bottom Ergonomic Thumb Zone */}
      <div className="flex items-end justify-between gap-2 pb-safe">
        <div className="pointer-events-auto hidden md:block">
          {nearTarget ? (
            nearTarget.shielded ? (
              <div className="metal-frame-sm px-3.5 py-2 bg-[#7F1D1D] text-[#FECACA] text-xs font-pixel">
                Escudo activo · Derrota al guardia con [Q]
              </div>
            ) : nearTarget.lockedReason ? (
              <div className="metal-frame-sm px-3.5 py-2 bg-[#7F1D1D] text-[#FECACA] text-xs font-pixel">
                {nearTarget.label} cerrada · {nearTarget.lockedReason}
              </div>
            ) : (
              <button
                type="button"
                onClick={onTouchInteract}
                className="metal-btn px-4 py-2.5 bg-[#F59E0B] text-[#0B0F17] text-xs font-pixel flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>
                  [E] {nearTarget.type === 'switch' ? 'Activar' : 'Abrir'} {nearTarget.label}
                </span>
              </button>
            )
          ) : (
            <div className="metal-frame-sm px-3 py-1.5 text-xs text-[#CBD5E1]">
              WASD Mover · Q Atacar · E Abrir Cofre/Puerta/Terminal · Esc Pausa
            </div>
          )}
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-2">
          <button type="button" onClick={onTouchDash} disabled={!inventory.dashReady}
            className="metal-btn inline-flex items-center gap-2 px-3 py-2 bg-cyan-950 text-cyan-100 font-pixel text-xs">
            <Wind size={16} /> {inventory.dashReady ? '[Shift] Esquivar' : 'Recargando esquiva'}
          </button>
          <button
            type="button"
            onClick={onTouchPulse}
            className={`metal-btn inline-flex items-center gap-1.5 px-3.5 py-2 font-pixel text-xs cursor-pointer ${
              inventory.overdriveSeconds > 0
                ? 'bg-[#7E22CE] text-white'
                : 'bg-[#DC2626] text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{inventory.overdriveSeconds > 0 ? '[Q] Overdrive 2X' : '[Q] Atacar'}</span>
          </button>
        </div>

        {/* Mobile Ergonomic D-Pad (Bottom-Left) */}
        <div className="pointer-events-auto grid grid-cols-3 gap-1 md:hidden touch-none">
          <div />
          <button
            type="button"
            onPointerDown={() => onTouchMove('up')}
            onPointerUp={() => onTouchMove(null)}
            onPointerCancel={() => onTouchMove(null)}
            onPointerLeave={() => onTouchMove(null)}
            aria-label="Mover arriba"
            className="metal-btn w-12 h-12 bg-[#131A26]/90 text-[#F8FAFC] flex items-center justify-center active:bg-[#2563EB]"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            type="button"
            onPointerDown={() => onTouchMove('left')}
            onPointerUp={() => onTouchMove(null)}
            onPointerCancel={() => onTouchMove(null)}
            onPointerLeave={() => onTouchMove(null)}
            aria-label="Mover izquierda"
            className="metal-btn w-12 h-12 bg-[#131A26]/90 text-[#F8FAFC] flex items-center justify-center active:bg-[#2563EB]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => onTouchMove('down')}
            onPointerUp={() => onTouchMove(null)}
            onPointerCancel={() => onTouchMove(null)}
            onPointerLeave={() => onTouchMove(null)}
            aria-label="Mover abajo"
            className="metal-btn w-12 h-12 bg-[#131A26]/90 text-[#F8FAFC] flex items-center justify-center active:bg-[#2563EB]"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => onTouchMove('right')}
            onPointerUp={() => onTouchMove(null)}
            onPointerCancel={() => onTouchMove(null)}
            onPointerLeave={() => onTouchMove(null)}
            aria-label="Mover derecha"
            className="metal-btn w-12 h-12 bg-[#131A26]/90 text-[#F8FAFC] flex items-center justify-center active:bg-[#2563EB]"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Action Buttons (Bottom-Right Natural Thumb Zone) */}
        <div className="pointer-events-auto grid grid-cols-2 gap-2 md:hidden">
          <button type="button" onClick={onTouchDash} disabled={!inventory.dashReady}
            className="metal-btn col-span-2 justify-self-end inline-flex items-center gap-2 min-h-11 px-2.5 bg-cyan-950 text-cyan-100 font-pixel text-[10px]">
            <Wind size={16} /> {inventory.dashReady ? 'Esquivar' : 'Recargando'}
          </button>
          <button
            type="button"
            onClick={onTouchPulse}
            aria-label="Atacar con Guitarra Sónica"
            className={`metal-btn w-14 h-14 text-white flex flex-col items-center justify-center gap-0.5 ${
              inventory.overdriveSeconds > 0 ? 'bg-[#7E22CE]' : 'bg-[#DC2626]'
            }`}
          >
            <Zap className="w-5 h-5 text-[#F59E0B]" />
            <span className="font-pixel text-[9px]">
              {inventory.overdriveSeconds > 0 ? '2X' : 'ATACAR'}
            </span>
          </button>

          <button
            type="button"
            onClick={onTouchInteract}
            disabled={!canInteract}
            aria-label="Interactuar"
            className={`metal-btn w-16 h-14 flex flex-col items-center justify-center gap-0.5 font-pixel text-[10px] ${
              canInteract
                ? 'bg-[#F59E0B] text-[#0B0F17]'
                : nearTarget?.shielded || nearTarget?.lockedReason
                ? 'bg-[#7F1D1D] text-[#FECACA]'
                : 'bg-[#131A26]/85 text-[#94A3B8]'
            }`}
          >
            <span>
              {nearTarget?.shielded
                ? 'ESCUDO'
                : nearTarget?.lockedReason
                ? 'LLAVE'
                : nearTarget?.type === 'switch'
                ? 'ACTIVAR'
                : nearTarget
                ? 'ABRIR'
                : 'CERCA'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
