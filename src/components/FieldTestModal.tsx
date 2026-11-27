import { useState } from 'react';
import { ArrowRight, BookOpenCheck, X } from 'lucide-react';
import { FIELD_TESTS } from '../data/fieldTests';
import { PlayerProgress } from '../types/game';
import { retroAudio } from '../utils/audio';

export type FieldSiteId = 'A' | 'B' | 'console';

interface Props {
  levelId: number;
  siteId: FieldSiteId;
  record: PlayerProgress['fieldwork'][number];
  onCollect: (id: 'A' | 'B') => void;
  onApply: () => void;
  onClose: () => void;
}

export function FieldTestModal({ levelId, siteId, record, onCollect, onApply, onClose }: Props) {
  const test = FIELD_TESTS[levelId];
  const source = test.sources.find((item) => item.id === siteId);
  const [selected, setSelected] = useState<number | null>(null);
  const [run, setRun] = useState<number | null>(null);
  const evaluated = run === null ? null : test.policies[run];
  const result = record.applied ? test.policies.find((policy) => policy.passes) : evaluated;
  const ready = record.sources.length === 2;

  return (
    <div className="field-overlay" role="dialog" aria-modal="true" aria-labelledby="experiment-title"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}>
      <article className="field-book experiment">
        <header className="field-header">
          <div>
            <p className="field-kicker">{source ? `Fuente ${source.id}` : 'Prueba de campo'} · {test.title}</p>
            <h2 id="experiment-title">{source?.title ?? test.console.title}</h2>
          </div>
          <button className="field-button" type="button" onClick={onClose} autoFocus={!source} aria-label="Cerrar prueba"><X size={18} /></button>
        </header>
        <div className="experiment-body">
          {source ? (
            <>
              <blockquote className="experiment-claim"><strong>VOX-ZERO</strong> {test.claim}</blockquote>
              <p>{source.observation}</p>
              <button type="button" className="field-button field-primary" autoFocus onClick={() => {
                retroAudio.playInteract();
                onCollect(source.id);
              }}><BookOpenCheck size={18} /> {record.sources.includes(source.id) ? 'Volver al tablero' : 'Guardar evidencia'}</button>
            </>
          ) : (
            <>
              <blockquote className="experiment-claim"><strong>VOX-ZERO</strong> {test.claim}</blockquote>
              <p><strong>Objetivo de la prueba.</strong> {test.successCriterion}</p>
              <div className="experiment-sources">
                {test.sources.map((item) => (
                  <details key={item.id}>
                    <summary>{item.id} · {item.title} {record.sources.includes(item.id) ? '✓' : '— pendiente'}</summary>
                    <p>{record.sources.includes(item.id) ? item.observation : 'Busca esta estación en el tablero.'}</p>
                  </details>
                ))}
              </div>
              {ready && !record.applied && (
                <>
                  <fieldset className="experiment-options">
                    <legend>¿Qué regla quieres poner a prueba?</legend>
                    {test.policies.map((policy, index) => (
                      <label key={policy.label}>
                        <input type="radio" name="test-policy" checked={selected === index}
                          onChange={() => { setSelected(index); setRun(null); }} />
                        {policy.label}
                      </label>
                    ))}
                  </fieldset>
                  <button className="field-button" type="button" disabled={selected === null} onClick={() => {
                    setRun(selected);
                    retroAudio.playInteract();
                  }}>Simular regla <ArrowRight size={18} /></button>
                </>
              )}
              {result && (
                <div className="experiment-results" aria-live="polite">
                  <p className="field-kicker">{record.applied ? 'Corrección aplicada' : 'Resultado en esta muestra simulada'}</p>
                  <table>
                    <thead><tr><th scope="col">Indicador</th><th scope="col">VOX</th><th scope="col">Nueva regla</th></tr></thead>
                    <tbody>
                      {test.metrics.map((metric, index) => <tr key={metric}><th scope="row">{metric}</th><td>{test.baseline[index]}</td><td>{result.values[index]}</td></tr>)}
                    </tbody>
                  </table>
                  <p>{result.consequence}</p>
                </div>
              )}
              {record.applied && <>
                <p>{test.takeaway}</p>
                <button className="field-button field-primary" type="button" onClick={onClose}>Volver al tablero</button>
              </>}
              {!ready && <p>Recupera las dos fuentes antes de simular una regla nueva.</p>}
              {evaluated?.passes && !record.applied && <button className="field-button field-primary" type="button" onClick={onApply}>Aplicar corrección y abrir el paso</button>}
            </>
          )}
        </div>
      </article>
    </div>
  );
}
