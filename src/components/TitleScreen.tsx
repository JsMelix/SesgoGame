import { Map, Play, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { retroAudio } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  hasProgress: boolean;
  onStartPlay: () => void;
  onOpenLevels: () => void;
}

const KEY_ART_SRC = '/src/assets/images/metal_lab_keyart_1794619958773.jpg';
const HERO_PORTRAIT_SRC = '/src/assets/images/portrait_rocker_hero_1794619960238.jpg';

export function TitleScreen({ hasProgress, onStartPlay, onOpenLevels }: TitleScreenProps) {
  const [keyArtFailed, setKeyArtFailed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        retroAudio.playUiClick();
        onStartPlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStartPlay]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 md:p-8 overflow-y-auto bg-[#0B0F17]">
      {/* Pixel-Art Heavy Metal Stage Key Art Backdrop with Measured Scrim */}
      {!keyArtFailed && (
        <img
          src={KEY_ART_SRC}
          alt="Escenario pixel-art heavy metal de laboratorio de Inteligencia Artificial"
          referrerPolicy="no-referrer"
          onError={() => setKeyArtFailed(true)}
          className="pixel-canvas absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,15,23,0.72) 0%, rgba(11,15,23,0.45) 45%, rgba(11,15,23,0.88) 100%)',
        }}
      />

      {/* Top quiet metadata */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between gap-3 pt-safe">
        <p className="text-xs md:text-sm font-medium text-[#CBD5E1]">
          5 Niveles · 15 Casos Reales · 12 Sesgos de IA
        </p>
        <PWAInstallButton />
      </div>

      {/* Center Lockup Card */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center my-auto py-4">
        <div className="metal-frame px-5 py-6 md:px-8 md:py-7 flex flex-col items-center gap-4 w-full bg-[#131A26]/95">
          {/* Bespoke Pixel Heavy-Metal SVG Lockup + Hero Portrait */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <img
              src={HERO_PORTRAIT_SRC}
              alt="Retrato del investigador heavy metal"
              referrerPolicy="no-referrer"
              className="pixel-canvas w-20 h-20 md:w-24 md:h-24 border-2 border-[#F59E0B] object-cover shrink-0 bg-[#0B0F17]"
            />

            <svg
              viewBox="0 0 280 78"
              className="w-full max-w-[280px] h-auto"
              role="img"
              aria-label="CRITERIO 16-BIT Heavy Metal Edition"
            >
              <polygon points="8,42 22,12 18,34 32,34 14,68 18,42" fill="#F59E0B" />
              <text
                x="42"
                y="38"
                fill="#F8FAFC"
                fontFamily="Silkscreen, monospace"
                fontWeight="700"
                fontSize="28"
                letterSpacing="1"
              >
                CRITERIO
              </text>
              <rect x="42" y="48" width="84" height="20" fill="#DC2626" />
              <text
                x="49"
                y="63"
                fill="#FFFFFF"
                fontFamily="Silkscreen, monospace"
                fontWeight="700"
                fontSize="12"
              >
                16-BIT
              </text>
              <text
                x="134"
                y="62"
                fill="#F59E0B"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="700"
                fontSize="12"
              >
                Metal &amp; IA Crítica
              </text>
            </svg>
          </div>

          <p className="text-sm text-[#E2E8F0] leading-relaxed max-w-lg">
            Derrota a los drones de <span className="text-[#EF4444] font-semibold">VOX-ZERO</span> con tu{' '}
            <span className="text-[#F59E0B] font-semibold">Guitarra Sónica</span> para romper los escudos de cada terminal y demuestra junto a LUMEN que la IA fortalece el aprendizaje sin reemplazar tu criterio.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-1">
            <button
              type="button"
              onClick={() => {
                retroAudio.playUiClick();
                onStartPlay();
              }}
              className="metal-btn inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-pixel text-sm whitespace-nowrap shrink-0 cursor-pointer min-h-[48px] flex-1 sm:flex-initial"
            >
              <Play className="w-4 h-4" />
              <span>{hasProgress ? 'Continuar' : 'Jugar'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                retroAudio.playUiClick();
                onOpenLevels();
              }}
              className="metal-btn inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1B2434] text-[#F8FAFC] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[48px]"
            >
              <Map className="w-4 h-4 text-[#F59E0B]" />
              <span>Niveles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Single flat control-hint line */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-center pb-safe">
        <p className="font-mono-num text-[11px] md:text-xs text-[#CBD5E1] bg-[#131A26]/90 border border-[#475569] px-3.5 py-1.5 text-center flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 hidden sm:inline" />
          <span>Táctil o WASD Mover · Q / Atacar · E Abrir Terminal · Esc Pausa</span>
        </p>
      </div>
    </div>
  );
}
