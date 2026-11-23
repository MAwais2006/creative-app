import { SlideData } from '../types/presentation';

interface SlideOverviewGridProps {
  slides: SlideData[];
  currentIndex: number;
  onSelectSlide: (index: number) => void;
}

export function SlideOverviewGrid({
  slides,
  currentIndex,
  onSelectSlide,
}: SlideOverviewGridProps) {
  return (
    <section
      aria-label="All presentation slides"
      className="max-w-[1360px] mx-auto px-6 py-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-50 tracking-tight">
            Presentation Index
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Select any slide to jump directly to its interactive optical bench.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 tabular-nums">
          {slides.length} Slides · Interactive Physics & Architectures
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => onSelectSlide(idx)}
              className={`group text-left flex flex-col justify-between p-5 rounded-xl border transition-colors cursor-pointer min-h-[210px] ${
                isCurrent
                  ? 'bg-[#0F1727] border-cyan-500/70'
                  : 'bg-[#0B101B] border-slate-800 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-mono tabular-nums text-cyan-400">
                    {slide.number}
                  </span>
                  <span>{slide.chapter}</span>
                </div>
                <h2 className="font-display text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                  {slide.title}
                </h2>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>

              {slide.metric && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-slate-200 tabular-nums">
                    {slide.metric.value} {slide.metric.unit}
                  </span>
                  <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">
                    Open slide →
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
