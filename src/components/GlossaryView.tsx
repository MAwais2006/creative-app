import { useState } from 'react';
import { GlossaryEntry } from '../types/presentation';

interface GlossaryViewProps {
  entries: GlossaryEntry[];
  onReturnToDeck: () => void;
}

export function GlossaryView({ entries, onReturnToDeck }: GlossaryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(entries.map((e) => e.category)))];

  const filtered =
    selectedCategory === 'All'
      ? entries
      : entries.filter((e) => e.category === selectedCategory);

  return (
    <section
      aria-label="Optical computing glossary"
      className="max-w-[1360px] mx-auto px-6 py-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-50 tracking-tight">
            Photonic & Optical AI Glossary
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Core physical components and architectures referenced throughout the deck.
          </p>
        </div>

        <button
          type="button"
          onClick={onReturnToDeck}
          className="px-4 py-2 text-xs font-medium text-slate-200 bg-[#0B101B] border border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer whitespace-nowrap"
        >
          Back to Current Slide
        </button>
      </div>

      {/* Category Filter Segmented Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0B101B] border border-slate-800 rounded-lg mb-6 w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <article
            key={item.term}
            className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span>{item.category}</span>
                {item.symbol && (
                  <span className="font-mono text-cyan-400">{item.symbol}</span>
                )}
              </div>
              <h2 className="font-display text-lg font-semibold text-slate-100">
                {item.term}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                {item.definition}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
