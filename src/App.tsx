import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { GLOSSARY_ENTRIES, SLIDES } from './data/slides';
import { SimulationStage } from './components/SimulationStage';
import { SlideOverviewGrid } from './components/SlideOverviewGrid';
import { GlossaryView } from './components/GlossaryView';

type ActiveView = 'deck' | 'grid' | 'glossary';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<ActiveView>('deck');
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);

  const currentSlide = SLIDES[currentIndex];
  const totalSlides = SLIDES.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const selectSlide = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setActiveView('deck');
  }, []);

  const togglePresentMode = useCallback(() => {
    setActiveView('deck');
    setIsPresenting((prev) => {
      const next = !prev;
      if (next && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Safe fallback inside sandboxed iframe where fullscreen may be disallowed
        });
      } else if (!next && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Keep presentation layout usable even if user exits native fullscreen
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (activeView === 'deck') goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (activeView === 'deck') goToPrev();
      } else if (e.key === 'Escape') {
        if (isPresenting) {
          setIsPresenting(false);
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } else if (activeView !== 'deck') {
          setActiveView('deck');
        }
      } else if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        setActiveView((prev) => (prev === 'grid' ? 'deck' : 'grid'));
      } else if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, goToNext, goToPrev, isPresenting]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070A11] text-slate-100">
      {/* Top Bar Contract: Zone 1 Brand Wordmark — Zone 2 4 Nav Links — Zone 3 1 Primary CTA */}
      {!isPresenting && (
        <header className="sticky top-0 z-30 bg-[#070A11]/95 backdrop-blur border-b border-slate-800/80">
          <div className="max-w-[1360px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
            {/* Zone 1: Single text element wordmark */}
            <button
              type="button"
              onClick={() => setActiveView('deck')}
              className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 cursor-pointer hover:text-cyan-300 transition-colors"
            >
              Optics in AI
            </button>

            {/* Zone 2: 4 clean single-line text navigation links */}
            <nav
              aria-label="Presentation navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium"
            >
              <button
                type="button"
                onClick={() => setActiveView('deck')}
                className={`whitespace-nowrap shrink-0 cursor-pointer pb-0.5 transition-colors border-b ${
                  activeView === 'deck'
                    ? 'text-cyan-300 border-cyan-400'
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:border-slate-600'
                }`}
              >
                Deck
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveView((prev) => (prev === 'grid' ? 'deck' : 'grid'))
                }
                className={`whitespace-nowrap shrink-0 cursor-pointer pb-0.5 transition-colors border-b ${
                  activeView === 'grid'
                    ? 'text-cyan-300 border-cyan-400'
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:border-slate-600'
                }`}
              >
                All Slides
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveView((prev) =>
                    prev === 'glossary' ? 'deck' : 'glossary'
                  )
                }
                className={`whitespace-nowrap shrink-0 cursor-pointer pb-0.5 transition-colors border-b ${
                  activeView === 'glossary'
                    ? 'text-cyan-300 border-cyan-400'
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:border-slate-600'
                }`}
              >
                Glossary
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('deck');
                  setShowNotes((prev) => !prev);
                }}
                className={`whitespace-nowrap shrink-0 cursor-pointer pb-0.5 transition-colors border-b ${
                  showNotes && activeView === 'deck'
                    ? 'text-amber-300 border-amber-400'
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:border-slate-600'
                }`}
              >
                Speaker Notes
              </button>
            </nav>

            {/* Zone 3: 1 Primary CTA button */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={togglePresentMode}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                Present
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col justify-center">
        {activeView === 'grid' && (
          <SlideOverviewGrid
            slides={SLIDES}
            currentIndex={currentIndex}
            onSelectSlide={selectSlide}
          />
        )}

        {activeView === 'glossary' && (
          <GlossaryView
            entries={GLOSSARY_ENTRIES}
            onReturnToDeck={() => setActiveView('deck')}
          />
        )}

        {activeView === 'deck' && (
          <div className="w-full max-w-[1360px] mx-auto px-6 py-6 sm:py-8 flex flex-col gap-6">
            {/* Compact Mobile View Switcher (visible below md) */}
            {!isPresenting && (
              <div className="flex md:hidden items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveView('grid')}
                  className="text-slate-300 hover:text-cyan-300 whitespace-nowrap"
                >
                  All Slides ({totalSlides})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('glossary')}
                  className="text-slate-300 hover:text-cyan-300 whitespace-nowrap"
                >
                  Glossary
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotes((prev) => !prev)}
                  className="text-amber-300 whitespace-nowrap"
                >
                  {showNotes ? 'Hide Notes' : 'Speaker Notes'}
                </button>
              </div>
            )}

            {/* Slide Frame */}
            <article
              key={currentSlide.id}
              aria-label={`Slide ${currentSlide.number}: ${currentSlide.title}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Narrative Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6 py-1">
                <div className="space-y-5">
                  {/* Unboxed Typographic Metadata (Zero-Pill Rule) */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-400">
                    <span className="font-mono font-semibold text-cyan-400 tabular-nums">
                      Slide {currentSlide.number} / {String(totalSlides).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{currentSlide.chapter}</span>
                  </div>

                  {/* Display Headline with text-wrap balance */}
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-50 tracking-tight leading-[1.12] [text-wrap:balance]">
                    {currentSlide.title}
                  </h1>

                  <p className="text-base text-slate-300 leading-relaxed max-w-[65ch]">
                    {currentSlide.subtitle}
                  </p>

                  {currentSlide.equation && (
                    <div className="bg-[#0B101B] border border-slate-800 rounded-lg px-4 py-2.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                      {currentSlide.equation}
                    </div>
                  )}

                  {/* Key Technical Points separated by hairline dividers */}
                  <div className="divide-y divide-slate-800/80 border-t border-slate-800/80 pt-1">
                    {currentSlide.keyPoints.map((point) => (
                      <div key={point.label} className="py-3.5">
                        <h2 className="text-sm font-semibold text-slate-100">
                          {point.label}
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed mt-1">
                          {point.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anchored Quantitative Metric Callout */}
                {currentSlide.metric && (
                  <div className="pt-4 border-t border-slate-800/80 flex items-baseline justify-between gap-4">
                    <div>
                      <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-50 tabular-nums">
                        {currentSlide.metric.value}
                      </span>
                      <span className="font-mono text-xs text-cyan-400 ml-2">
                        {currentSlide.metric.unit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 text-right max-w-[230px]">
                      {currentSlide.metric.caption}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Interactive Optical Bench Column (7 cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <SimulationStage kind={currentSlide.simulation} />
              </div>
            </article>

            {/* Collapsible Speaker Notes Drawer */}
            {showNotes && (
              <aside
                aria-label="Speaker notes"
                className="bg-[#0B101B] border border-slate-800 rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className="text-xs font-semibold text-amber-300">
                    Speaker Notes · Slide {currentSlide.number}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotes(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                  {currentSlide.speakerNotes}
                </p>
              </aside>
            )}
          </div>
        )}
      </main>

      {/* Bottom Presentation Transport Bar */}
      {activeView === 'deck' && (
        <footer className="border-t border-slate-800/80 bg-[#070A11]">
          <div className="max-w-[1360px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-800 bg-[#0B101B] text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap min-h-[40px]"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={currentIndex === totalSlides - 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-800 bg-[#0B101B] text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap min-h-[40px]"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Slide Step Selector */}
            <div
              className="hidden sm:flex items-center gap-1.5"
              role="navigation"
              aria-label="Slide selector"
            >
              {SLIDES.map((s, idx) => {
                const active = idx === currentIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${s.number}: ${s.title}`}
                    aria-current={active ? 'step' : undefined}
                    className={`px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-md transition-colors cursor-pointer min-h-[36px] ${
                      active
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-slate-500 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {s.number}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="hidden lg:inline font-mono">
                ← / → Navigate · G Grid · N Notes
              </span>
              {isPresenting && (
                <button
                  type="button"
                  onClick={togglePresentMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Exit Present
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
