import { ArrowRight, BookOpen, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChapterStory } from '../data/story';
import { retroAudio } from '../utils/audio';

interface ComicCutsceneModalProps {
  chapter: ChapterStory;
  onFinish: () => void;
}

export function ComicCutsceneModal({ chapter, onFinish }: ComicCutsceneModalProps) {
  const [panelIdx, setPanelIdx] = useState(0);

  useEffect(() => {
    setPanelIdx(0);
  }, [chapter.levelId]);

  const panel = chapter.panels[panelIdx] ?? chapter.panels[0];
  const isLast = panelIdx >= chapter.panels.length - 1;

  const handleNext = () => {
    retroAudio.playUiClick();
    if (isLast) {
      onFinish();
    } else {
      setPanelIdx((i) => i + 1);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onFinish();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [panelIdx, isLast]);

  const accentBadge =
    panel.tone === 'crimson'
      ? 'bg-[#DC2626] text-white'
      : panel.tone === 'cyan'
      ? 'bg-[#0284C7] text-white'
      : panel.tone === 'emerald'
      ? 'bg-[#10B981] text-[#052E16]'
      : 'bg-[#F59E0B] text-[#0B0F17]';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-black/85 comic-halftone"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comic-chapter-title"
    >
      <div className="comic-panel w-full max-w-2xl bg-[#131A26] overflow-hidden flex flex-col">
        {/* Comic Issue Strip Header */}
        <div className="px-4 py-2.5 bg-[#F59E0B] text-[#0B0F17] border-b-3 border-[#05070B] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 shrink-0" />
            <h2
              id="comic-chapter-title"
              className="font-pixel text-[11px] md:text-xs font-bold truncate"
            >
              {chapter.chapterTitle}
            </h2>
          </div>

          <span className="font-mono-num text-xs font-bold shrink-0">
            {panelIdx + 1}/{chapter.panels.length}
          </span>
        </div>

        {/* Comic Panel Artwork Frame */}
        <div className="relative bg-[#0B0F17] border-b-3 border-[#05070B] overflow-hidden">
          <img
            src={panel.artwork}
            alt={panel.speakerTitle}
            referrerPolicy="no-referrer"
            className="pixel-canvas w-full h-48 sm:h-64 md:h-72 object-cover object-center"
          />

          {/* Yellow Comic Caption Box (top-left) */}
          <div className="absolute top-2.5 left-2.5 max-w-[78%] bg-[#FEF08A] text-[#0B0F17] border-2 border-[#05070B] px-2.5 py-1 text-[11px] md:text-xs font-bold shadow-[2px_2px_0_#05070B]">
            {panel.caption}
          </div>

          {/* Tilted Comic SFX Burst (bottom-right) */}
          <div
            className={`absolute bottom-2.5 right-3 font-pixel text-xs md:text-sm px-2.5 py-1 border-2 border-[#05070B] shadow-[3px_3px_0_#05070B] -rotate-3 ${accentBadge}`}
          >
            {panel.sfx}
          </div>
        </div>

        {/* Speech Bubble & Controls */}
        <div className="p-4 md:p-5 space-y-4 bg-[#131A26]">
          <div className="relative bg-[#FCFBF7] text-[#0F172A] border-2 border-[#05070B] p-3.5 md:p-4 shadow-[4px_4px_0_#05070B]">
            <div className="font-pixel text-[11px] text-[#DC2626] mb-1">
              {panel.speakerTitle}
            </div>
            <p className="text-sm md:text-[15px] font-semibold leading-relaxed">
              “{panel.dialogue}”
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                retroAudio.playUiClick();
                onFinish();
              }}
              className="metal-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1B2434] text-[#CBD5E1] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Saltar</span>
            </button>

            <div className="flex items-center gap-1.5">
              {chapter.panels.map((p, idx) => (
                <span
                  key={p.id}
                  className={`h-2 w-5 border border-[#05070B] ${
                    idx === panelIdx ? 'bg-[#F59E0B]' : 'bg-[#334155]'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="metal-btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] text-white font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
            >
              <span>{isLast ? '¡Al Escenario!' : 'Siguiente'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
