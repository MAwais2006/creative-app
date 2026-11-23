import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { GLOSSARY_ENTRIES, SLIDES } from './data/slides';
import { SimulationStage } from './components/SimulationStage';
import { SlideOverviewGrid } from './components/SlideOverviewGrid';
import { GlossaryView } from './components/GlossaryView';
import { PhotonicLab3DViewport } from './components/PhotonicLab3DViewport';
import { exportPresentationPptx } from './utils/exportPresentationPptx';

type ActiveView = 'deck' | 'grid' | 'glossary';
type StageTab = '3d-lab' | 'physics-sim';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<ActiveView>('deck');
  const [stageTab, setStageTab] = useState<StageTab>('3d-lab');
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<{
    active: boolean;
    pct: number;
    label: string;
  }>({ active: false, pct: 0, label: '' });

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

  const handleDownloadPptx = useCallback(async () => {
    if (exportStatus.active) return;
    setExportStatus({ active: true, pct: 5, label: 'Preparing 3D assets...' });
    try {
      await exportPresentationPptx((pct, label) => {
        setExportStatus({ active: true, pct, label });
      });
    } finally {
      setTimeout(() => {
        setExportStatus({ active: false, pct: 0, label: '' });
      }, 900);
    }
  }, [exportStatus.active]);

  const togglePresentMode = useCallback(() => {
    setActiveView('deck');
    setIsPresenting((prev) => {
      const next = !prev;
      if (next && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!next && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      return next;
    });
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

  const progressRatio = ((currentIndex + 1) / totalSlides) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#070A11] text-slate-100">
      {/* Top Bar Contract: Zone 1 Brand Wordmark — Zone 2 4 Nav Links — Zone 3 1 Primary CTA */}
      {!isPresenting && (
        <header className="sticky top-0 z-30 bg-[#070A11]/95 border-b border-slate-800/80">
          <div className="max-w-[1380px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
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

            {/* Zone 3: 1 Primary Action CTA */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={handleDownloadPptx}
                disabled={exportStatus.active}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                {exportStatus.active
                  ? `Exporting ${exportStatus.pct}%`
                  : 'Download PPTX'}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Export Progress Banner (only visible while building the .pptx archive) */}
      {exportStatus.active && (
        <div className="bg-[#0B101B] border-b border-cyan-500/30 px-6 py-2">
          <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-4 text-xs">
            <span className="text-cyan-300 font-medium">{exportStatus.label}</span>
            <span className="font-mono text-slate-300 tabular-nums">
              {exportStatus.pct}%
            </span>
          </div>
        </div>
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
          <div className="w-full max-w-[1380px] mx-auto px-6 py-5 sm:py-6 flex flex-col gap-5">
            {/* Compact Mobile View Switcher */}
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

            {/* Morphing Progress Rail */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div
                style={{ width: `${progressRatio}%` }}
                className="h-full bg-cyan-400 transition-all duration-300 ease-out"
              />
            </div>

            {/* Slide Frame */}
            <article
              aria-label={`Slide ${currentSlide.number}: ${currentSlide.title}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Narrative Column (5 cols) with smooth Morph cross-transition */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5 py-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* Unboxed Typographic Metadata */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-400">
                      <span className="font-mono font-semibold text-cyan-400 tabular-nums">
                        Slide {currentSlide.number} /{' '}
                        {String(totalSlides).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{currentSlide.chapter}</span>
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-50 tracking-tight leading-[1.12] [text-wrap:balance]">
                      {currentSlide.title}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-[65ch]">
                      {currentSlide.subtitle}
                    </p>

                    {currentSlide.equation && (
                      <motion.div
                        layoutId="morph-equation-strip"
                        className="bg-[#0B101B] border border-slate-800 rounded-lg px-4 py-2.5 font-mono text-xs text-cyan-300 overflow-x-auto"
                      >
                        {currentSlide.equation}
                      </motion.div>
                    )}

                    {/* Key Technical Points separated by hairline dividers */}
                    <div className="divide-y divide-slate-800/80 border-t border-slate-800/80 pt-1">
                      {currentSlide.keyPoints.map((point) => (
                        <div key={point.label} className="py-3">
                          <h2 className="text-sm font-semibold text-slate-100">
                            {point.label}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-1">
                            {point.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Anchored Quantitative Metric Callout */}
                {currentSlide.metric && (
                  <motion.div
                    layoutId="morph-metric-strip"
                    className="pt-3.5 border-t border-slate-800/80 flex items-baseline justify-between gap-4"
                  >
                    <div>
                      <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-50 tabular-nums">
                        {currentSlide.metric.value}
                      </span>
                      <span className="font-mono text-xs text-cyan-400 ml-2">
                        {currentSlide.metric.unit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 text-right max-w-[235px]">
                      {currentSlide.metric.caption}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Right Interactive Optical Lab Column (7 cols): 3D Hardware + Scientist Robot OR 2D Physics Sim */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 p-1 bg-[#0B101B] border border-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setStageTab('3d-lab')}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        stageTab === '3d-lab'
                          ? 'bg-slate-800 text-cyan-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      3D Hardware & Robot Presenter
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageTab('physics-sim')}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        stageTab === 'physics-sim'
                          ? 'bg-slate-800 text-cyan-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Interactive Physics Sim
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {stageTab === '3d-lab'
                      ? 'Drag to orbit · Scroll to zoom'
                      : 'Tune optical parameters live'}
                  </span>
                </div>

                {stageTab === '3d-lab' ? (
                  <PhotonicLab3DViewport
                    hardwareKind={currentSlide.hardware3D}
                    robotPose={currentSlide.robotPose}
                    robotExpressionLabel={currentSlide.robotExpressionLabel}
                    robotSpeech={currentSlide.robotSpeech}
                  />
                ) : (
                  <div className="flex-1 flex flex-col">
                    <SimulationStage kind={currentSlide.simulation} />
                  </div>
                )}
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
                    Lab Speaker Notes · Slide {currentSlide.number}
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
          <div className="max-w-[1380px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
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
              className="hidden sm:flex items-center gap-1"
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

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden xl:inline text-xs font-mono text-slate-400">
                ← / → Navigate · G Grid · N Notes
              </span>
              <button
                type="button"
                onClick={togglePresentMode}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#0B101B] border border-slate-700 hover:border-slate-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[40px]"
              >
                {isPresenting ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Exit Present
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Present
                  </>
                )}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
