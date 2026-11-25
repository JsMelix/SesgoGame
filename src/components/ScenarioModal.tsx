import LUMEN_PORTRAIT_SRC from '../assets/images/portrait_lumen_metal_1794619960152.jpg';
import { AlertCircle, CheckCircle2, RotateCcw, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Scenario, ScenarioOption } from '../types/game';
import { retroAudio } from '../utils/audio';

interface ScenarioModalProps {
  scenario: Scenario;
  alreadySolved: boolean;
  attemptsSoFar: number;
  onAttempt: (scenarioId: string, isCorrect: boolean, hintsUsed: number) => void;
  onClose: () => void;
}

export function ScenarioModal({
  scenario,
  alreadySolved,
  attemptsSoFar,
  onAttempt,
  onClose,
}: ScenarioModalProps) {
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<ScenarioOption | null>(() =>
    alreadySolved ? scenario.options.find((option) => option.isCorrect) ?? null : null
  );
  const options = useMemo(() => {
    const offset = (scenario.levelId + scenario.terminalNumber - 1) % scenario.options.length;
    return [...scenario.options.slice(offset), ...scenario.options.slice(0, offset)];
  }, [scenario]);
  const reviewing = useRef(alreadySolved);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const isResolvedNow = alreadySolved || Boolean(selectedOption?.isCorrect);

  const handleRevealHint = () => {
    if (hintsRevealed >= 2) return;
    retroAudio.playHint();
    setHintsRevealed((prev) => Math.min(2, prev + 1));
  };

  const handleChooseOption = useCallback((option: ScenarioOption) => {
    setSelectedOption(option);
    if (option.isCorrect) {
      retroAudio.playSuccess();
      onAttempt(scenario.id, true, hintsRevealed);
    } else {
      retroAudio.playError();
      onAttempt(scenario.id, false, hintsRevealed);
    }
  }, [hintsRevealed, onAttempt, scenario.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (!selectedOption && /^[1-4]$/.test(event.key)) {
        event.preventDefault();
        handleChooseOption(options[Number(event.key) - 1]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleChooseOption, onClose, options, selectedOption]);

  useEffect(() => {
    if (selectedOption && !reviewing.current) feedbackRef.current?.focus();
  }, [selectedOption]);

  const handleRetry = () => {
    retroAudio.playUiClick();
    setSelectedOption(null);
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scenario-title"
    >
      <div className="metal-frame w-full max-w-3xl max-h-[92vh] md:max-h-[90vh] flex flex-col overflow-hidden bg-[#131A26]">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-b-2 border-[#334155] bg-[#1B2434]">
          <div className="min-w-0">
            <div className="text-xs text-[#94A3B8] font-medium flex items-center gap-2 flex-wrap">
              <span className="font-mono-num font-bold text-[#F59E0B]">
                Nivel {scenario.levelId} · Terminal 0{scenario.terminalNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span className={isResolvedNow ? 'text-[#34D399]' : 'text-[#CBD5E1]'}>
                {isResolvedNow ? `Resuelto: ${scenario.biasName}` : 'Auditoría abierta'}
              </span>
              {attemptsSoFar > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">Intentos: {attemptsSoFar}</span>
                </>
              )}
            </div>
            <h2 id="scenario-title" className="font-pixel text-sm md:text-lg text-[#F8FAFC] mt-1">
              {scenario.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              retroAudio.playUiClick();
              onClose();
            }}
            aria-label="Cerrar terminal"
            className="metal-btn p-2.5 bg-[#0B0F17] text-[#F8FAFC] shrink-0 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-4 md:px-5 py-4 md:py-5 space-y-4 comic-halftone">
          {/* Paso 1: Viñeta de diálogo estilo cómic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#F59E0B]">
                {scenario.npcName} · {scenario.npcRole}
              </span>
              <span className="font-pixel text-[10px] px-2 py-0.5 bg-[#DC2626] text-white border border-[#05070B] -rotate-2">
                {isResolvedNow ? '¡RESUELTO!' : '¡CASO ACTIVO!'}
              </span>
            </div>

            <div className="bg-[#FCFBF7] text-[#0F172A] border-2 border-[#05070B] p-3 shadow-[3px_3px_0_#05070B]">
              <div className="font-pixel text-[10px] text-[#DC2626] mb-0.5">
                {scenario.npcName} dice:
              </div>
              <p className="text-xs md:text-sm font-semibold leading-snug">
                “{scenario.npcGreeting}”
              </p>
            </div>

            <p className="text-sm md:text-[15px] leading-relaxed text-[#F8FAFC] bg-[#0B0F17]/80 border border-[#334155] p-3">
              {scenario.scenarioText}
            </p>
          </div>

          {/* Evidence Breakdown */}
          <div className="border-2 border-[#334155] bg-[#0B0F17] p-3.5">
            <div className="font-pixel text-xs text-[#38BDF8] mb-2.5">
              {scenario.evidenceTitle}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenario.evidenceItems.map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <dt className="text-xs text-[#94A3B8]">{item.label}</dt>
                  <dd className="text-xs md:text-sm font-semibold text-[#F8FAFC]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Paso 2: Copiloto IA Socrático LUMEN con retrato pixel-art */}
          <div className="border-2 border-[#D97706] bg-[#1B2434] p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={LUMEN_PORTRAIT_SRC}
                  alt="Retrato pixel-art de LUMEN"
                  referrerPolicy="no-referrer"
                  className="pixel-canvas w-12 h-12 border-2 border-[#F59E0B] object-cover shrink-0 bg-[#0B0F17]"
                />
                <div className="min-w-0">
                  <div className="font-pixel text-xs text-[#F59E0B]">
                    Copiloto Socrático LUMEN
                  </div>
                  <p className="text-xs text-[#CBD5E1]">
                    Te ayuda a pensar con preguntas guía sin dar la respuesta.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRevealHint}
                disabled={hintsRevealed >= 2}
                className="metal-btn inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F59E0B] text-[#0B0F17] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {hintsRevealed === 0
                    ? 'Pregunta guía (1/2)'
                    : hintsRevealed === 1
                    ? 'Segunda guía (2/2)'
                    : 'Guías listas (2/2)'}
                </span>
              </button>
            </div>

            {hintsRevealed > 0 && (
              <ol className="space-y-2 pt-1 text-xs md:text-sm text-[#F8FAFC]">
                {scenario.socraticHints.slice(0, hintsRevealed).map((hint, idx) => (
                  <li key={idx} className="bg-[#0B0F17] border border-[#F59E0B]/60 px-3.5 py-2.5 leading-relaxed">
                    <span className="font-mono-num font-bold text-[#F59E0B] mr-2">P{idx + 1}.</span>
                    {hint}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Paso 3 & 4: Opciones y Retroalimentación */}
          {!selectedOption ? (
            <div className="space-y-2.5 pb-2">
              <div className="text-xs font-semibold text-[#94A3B8]">
                ¿Qué explicación respalda mejor la evidencia?
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChooseOption(opt)}
                    className="metal-btn text-left px-3.5 py-3 bg-[#1B2434] hover:bg-[#263247] text-[#F8FAFC] text-xs md:text-sm leading-snug flex items-start gap-3 cursor-pointer min-h-[48px]"
                  >
                    <span className="font-mono-num font-bold text-xs px-2 py-0.5 bg-[#0B0F17] text-[#F59E0B] border border-[#475569] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              ref={feedbackRef}
              tabIndex={-1}
              aria-label="Consecuencia de tu respuesta"
              className={`border-2 p-4 space-y-4 ${
                selectedOption.isCorrect
                  ? 'border-[#10B981] bg-[#064E3B]/45'
                  : 'border-[#EF4444] bg-[#7F1D1D]/45'
              }`}
            >
              <div className="flex items-start gap-3">
                {selectedOption.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5">
                  <div className="font-pixel text-xs md:text-sm text-[#F8FAFC]">
                    {selectedOption.isCorrect
                      ? `Correcto: ${scenario.biasName}`
                      : 'Revisa este argumento e inténtalo de nuevo'}
                  </div>
                  <p className="text-xs md:text-sm text-[#E2E8F0] leading-relaxed">
                    {selectedOption.feedback}
                  </p>
                </div>
              </div>

              {selectedOption.isCorrect ? (
                <div className="space-y-3 pt-2 border-t border-[#10B981]/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                    <div className="bg-[#0B0F17] border border-[#334155] p-3">
                      <div className="font-semibold text-xs text-[#34D399] mb-1">
                        Cómo mitigar este sesgo
                      </div>
                      <p className="text-[#E2E8F0] leading-relaxed">{scenario.mitigationPrinciple}</p>
                    </div>
                    <div className="bg-[#0B0F17] border border-[#334155] p-3">
                      <div className="font-semibold text-xs text-[#38BDF8] mb-1">
                        Aplicación en la vida real
                      </div>
                      <p className="text-[#E2E8F0] leading-relaxed">{scenario.realWorldConnection}</p>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-[#FDE68A]">
                    LUMEN: {scenario.lumenReflection}
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playUiClick();
                        onClose();
                      }}
                      className="metal-btn px-5 py-3 bg-[#10B981] text-[#052E16] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] w-full sm:w-auto"
                    >
                      Volver al Escenario
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EF4444]/40">
                  <p className="text-xs text-[#FECACA]">
                    Sin límite de intentos. Cuestiona los datos o pide ayuda a LUMEN.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="metal-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B0F17] text-[#F8FAFC] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] w-full sm:w-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Intentar de nuevo</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
