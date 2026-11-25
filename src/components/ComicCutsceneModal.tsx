import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ChapterStory } from '../data/story';
import { retroAudio } from '../utils/audio';

interface ComicCutsceneModalProps {
  chapter: ChapterStory;
  onFinish: () => void;
}

export function ComicCutsceneModal({ chapter, onFinish }: ComicCutsceneModalProps) {
  const [panelIndex, setPanelIndex] = useState(0);
  const panel = chapter.panels[panelIndex];
  const isLast = panelIndex === chapter.panels.length - 1;

  return (
    <div className="field-overlay" role="dialog" aria-modal="true" aria-labelledby="comic-title">
      <article className="field-book">
        <header className="field-header">
          <div>
            <p className="field-kicker">Capítulo {chapter.levelId} / {chapter.subtitle}</p>
            <h2 id="comic-title">{chapter.chapterTitle}</h2>
          </div>
          <span className="field-counter" aria-label="Viñeta">
            {panelIndex + 1}/{chapter.panels.length}
          </span>
        </header>

        <div className="field-story" key={panelIndex} aria-live="polite">
          <figure className="field-art" style={{ borderColor: panel.color }}>
            <img src={panel.artwork} alt="" />
            <figcaption>{panel.caption}</figcaption>
          </figure>
          <div className="field-dialogue">
            <p className="field-kicker">{panel.name}</p>
            <p>{panel.dialogue}</p>
            {isLast && (
              <aside className="field-mission">
                <p className="field-kicker">Tu misión</p>
                <p>{chapter.mission}</p>
              </aside>
            )}
          </div>
        </div>

        <footer className="field-actions">
          <button className="field-button" type="button" disabled={panelIndex === 0} onClick={() => {
            retroAudio.playUiClick();
            setPanelIndex(panelIndex - 1);
          }}>
            <ArrowLeft size={16} /> Atrás
          </button>
          <button className="field-button field-primary" type="button" autoFocus onClick={() => {
            retroAudio.playUiClick();
            if (isLast) onFinish();
            else setPanelIndex(panelIndex + 1);
          }}>
            {isLast ? 'Entrar al nivel' : 'Siguiente viñeta'} <ArrowRight size={16} />
          </button>
        </footer>
      </article>
    </div>
  );
}
