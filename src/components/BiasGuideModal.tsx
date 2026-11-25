import { CheckCircle2, Eye, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';
import { BIAS_DEFINITIONS, SCENARIOS } from '../data/curriculum';
import { ENEMY_LORE } from '../data/levels';
import { PlayerProgress } from '../types/game';
import { retroAudio } from '../utils/audio';

interface BiasGuideModalProps {
  progress: PlayerProgress;
  onClose: () => void;
}

export function BiasGuideModal({ progress, onClose }: BiasGuideModalProps) {
  const [tab, setTab] = useState<'biases' | 'bestiary'>('biases');
  const [filterLevel, setFilterLevel] = useState<number>(0);

  const solvedBiasIds = new Set(
    SCENARIOS.filter((s) => progress.scenarios[s.id]?.solved).map((s) => s.biasId)
  );

  const visibleBiases =
    filterLevel === 0
      ? BIAS_DEFINITIONS
      : BIAS_DEFINITIONS.filter((b) => b.levelId === filterLevel);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 md:p-4 bg-black/80 comic-halftone"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bias-guide-title"
    >
      <div className="comic-panel w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden bg-[#131A26]">
        <div className="flex items-center justify-between gap-4 px-4 md:px-5 py-3.5 border-b-2 border-[#334155] bg-[#1B2434]">
          <div>
            <h2 id="bias-guide-title" className="font-pixel text-sm md:text-lg text-[#F8FAFC]">
              Guía de Sesgos y Bestiario VOX-ZERO
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Conceptos dominados:{' '}
              <span className="font-mono-num font-bold text-[#F59E0B]">{solvedBiasIds.size}/12</span>
              {' · '}Aprende cada sesgo y cómo derrotar a los drones del cómic.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onClose();
            }}
            aria-label="Cerrar guía"
            className="metal-btn p-2.5 bg-[#0B0F17] text-[#F8FAFC] shrink-0 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section switcher + Level filter */}
        <div className="px-4 md:px-5 py-3 border-b border-[#334155] bg-[#0B0F17] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                retroAudio.playUiClick();
                setTab('biases');
              }}
              className={`px-3.5 py-2 text-xs font-pixel border cursor-pointer min-h-[40px] ${
                tab === 'biases'
                  ? 'border-[#F59E0B] bg-[#F59E0B] text-[#0B0F17]'
                  : 'border-[#334155] bg-[#1B2434] text-[#CBD5E1]'
              }`}
            >
              Sesgos (12)
            </button>
            <button
              type="button"
              onClick={() => {
                retroAudio.playUiClick();
                setTab('bestiary');
              }}
              className={`px-3.5 py-2 text-xs font-pixel border cursor-pointer min-h-[40px] ${
                tab === 'bestiary'
                  ? 'border-[#EF4444] bg-[#DC2626] text-white'
                  : 'border-[#334155] bg-[#1B2434] text-[#CBD5E1]'
              }`}
            >
              Bestiario (3)
            </button>
          </div>

          {tab === 'biases' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    retroAudio.playUiClick();
                    setFilterLevel(lvl);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] transition-colors ${
                    filterLevel === lvl
                      ? 'border-[#38BDF8] bg-[#38BDF8] text-[#0B0F17]'
                      : 'border-[#334155] bg-[#1B2434] text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {lvl === 0 ? 'Todos' : `N${lvl}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {tab === 'biases' ? (
          <div className="overflow-y-auto p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleBiases.map((bias) => {
              const mastered = solvedBiasIds.has(bias.id);
              return (
                <article
                  key={bias.id}
                  className="border-2 border-[#334155] bg-[#1B2434] p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-[#94A3B8] font-mono-num">
                        Nivel {bias.levelId}
                      </div>
                      <h3 className="font-pixel text-sm text-[#F8FAFC] mt-0.5">
                        {bias.name}
                      </h3>
                    </div>
                    {mastered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#34D399] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dominado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                        Por investigar
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#E2E8F0] leading-relaxed">{bias.summary}</p>

                  <div className="pt-2 border-t border-[#334155] space-y-1.5 text-xs">
                    <div>
                      <span className="font-bold text-[#F59E0B]">Señal de alerta: </span>
                      <span className="text-[#CBD5E1]">{bias.warningSignal}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#34D399]">Mitigación: </span>
                      <span className="text-[#CBD5E1]">{bias.mitigation}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="overflow-y-auto p-4 md:p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ENEMY_LORE.map((enemy) => (
                <article
                  key={enemy.kind}
                  className="border-2 border-[#EF4444]/60 bg-[#1B2434] p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#EF4444] shrink-0" />
                    <h3 className="font-pixel text-sm text-[#F8FAFC]">{enemy.name}</h3>
                  </div>
                  <p className="text-xs text-[#FEF08A] font-medium leading-relaxed bg-[#0B0F17] p-2.5 border border-[#334155]">
                    {enemy.threatMetaphor}
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="font-bold text-[#F59E0B]">Patrón en el tablero: </span>
                      <span className="text-[#CBD5E1]">{enemy.behavior}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#34D399]">Cómo vencerlo: </span>
                      <span className="text-[#CBD5E1]">{enemy.counterTip}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-[#334155] pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-[#334155] bg-[#1B2434] p-3.5 space-y-1.5">
                <h4 className="font-pixel text-xs text-[#F59E0B]">Cofres y Llaves</h4>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Abre cofres con [E] o tocándolos: los bordes dorados, carmesí o cian guardan Llaves de Acceso para abrir las compuertas del mismo color. Algunos jefes también sueltan llaves al caer.
                </p>
              </div>
              <div className="border border-[#334155] bg-[#1B2434] p-3.5 space-y-1.5">
                <h4 className="font-pixel text-xs text-[#A855F7]">Amplificador Overdrive</h4>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Los cofres morados activan 14 segundos de Overdrive: tu Guitarra-Hacha dispara triple rayo sónico con daño doble (2X). Los cofres verdes recargan +2 de energía.
                </p>
              </div>
              <div className="border border-[#334155] bg-[#1B2434] p-3.5 space-y-1.5">
                <h4 className="font-pixel text-xs text-[#38BDF8]">Interruptores Sónicos</h4>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Pisa los paneles brillantes en el suelo o dispárales un acorde con [Q] para desactivar barreras láser y abrir atajos secretos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
