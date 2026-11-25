import { useEffect, useRef, useState } from 'react';
import { ChapterStory } from '../data/story';
import { retroAudio } from '../utils/audio';

interface ChapterDecisionModalProps {
  chapter: ChapterStory;
  onComplete: () => void;
}

export function ChapterDecisionModal({ chapter, onComplete }: ChapterDecisionModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const { prompt, options } = chapter.decision;
  const choice = selected === null ? null : options[selected];

  useEffect(() => {
    if (choice) feedbackRef.current?.scrollIntoView({ block: 'nearest' });
  }, [choice]);

  return (
    <div className="field-overlay" role="dialog" aria-modal="true" aria-labelledby="decision-title">
      <article className="field-book field-decision">
        <header className="field-header">
          <div>
            <p className="field-kicker">Capítulo {chapter.levelId} / {chapter.subtitle}</p>
            <h2 id="decision-title">La decisión es tuya</h2>
          </div>
        </header>
        <div className="field-decision-body">
          <p>{prompt}</p>
          <div className="field-choices" aria-label="Acciones posibles">
            {options.map((option, index) => (
              <button key={option.action} type="button" className="field-button field-choice"
                aria-pressed={selected === index} disabled={Boolean(choice?.protectsPeople)}
                autoFocus={index === 0} onClick={() => {
                  setSelected(index);
                  if (option.protectsPeople) retroAudio.playSuccess();
                  else retroAudio.playError();
                }}>
                {option.action}
              </button>
            ))}
          </div>
          <div ref={feedbackRef} aria-live="polite">
            {choice && (
              <div className="field-mission">
                <p className="field-kicker">{choice.protectsPeople ? 'Consecuencia' : 'Vuelve a considerar el impacto'}</p>
                <p>{choice.feedback}</p>
              </div>
            )}
          </div>
          {choice?.protectsPeople && (
            <button type="button" className="field-button field-primary" autoFocus onClick={onComplete}>
              Cerrar la auditoría
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
