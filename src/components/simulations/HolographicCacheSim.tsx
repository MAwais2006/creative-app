import { useState } from 'react';
import { SLIDES } from '../../data/slides';

interface StoredToken {
  id: number;
  label: string;
  angleDeg: number;
}

const STORED_KEYS: StoredToken[] = [
  { id: 0, label: 'Token #14 ("optics")', angleDeg: 18 },
  { id: 1, label: 'Token #402 ("waveguide")', angleDeg: 34 },
  { id: 2, label: 'Token #1920 ("hologram")', angleDeg: 52 },
  { id: 3, label: 'Token #8400 ("attention")', angleDeg: 70 },
];

export function HolographicCacheSim() {
  const [queryAngleDeg, setQueryAngleDeg] = useState<number>(52);
  const [activeTab, setActiveTab] = useState<'sim' | 'blueprint'>('sim');

  const novelIdea = SLIDES[9].novelIdea!;

  // Bragg selectivity curve: sinc^2( (theta_Q - theta_k) / width )
  const scores = STORED_KEYS.map((k) => {
    const diff = (queryAngleDeg - k.angleDeg) * 0.24;
    const raw = Math.abs(diff) < 0.01 ? 1.0 : Math.pow(Math.sin(diff) / diff, 2);
    return Math.max(0.03, Math.min(1.0, raw));
  });
  const total = scores.reduce((a, b) => a + b, 0);
  const weights = scores.map((s) => (s / total) * 100);
  const topIdx = scores.indexOf(Math.max(...scores));

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Chromo-Synaptic Holographic Cache (CSHC)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            O(1) Bragg diffraction attention lookup vs. real-world implementation plan
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('sim')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sim'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bragg Query Sim
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-slate-800 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Benefit & Implementation
          </button>
        </div>
      </div>

      {activeTab === 'blueprint' ? (
        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="bg-[#070A11] border border-slate-800 rounded-lg p-3.5">
            <div className="text-xs font-semibold text-cyan-300 mb-2">
              Real-World Benefits
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              {novelIdea.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-cyan-400">0{i + 1}.</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#070A11] border border-slate-800 rounded-lg p-3.5">
            <div className="text-xs font-semibold text-emerald-300 mb-2">
              3-Step Real-Life Fabrication & System Implementation
            </div>
            <ol className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              {novelIdea.implementationSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-emerald-400">Step {i + 1}:</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <>
          {/* Bragg Crystal Schematic */}
          <div className="bg-[#070A11] border border-slate-800 rounded-lg p-3">
            <svg
              viewBox="0 0 560 175"
              className="w-full h-40 select-none"
              role="img"
              aria-label="Holographic Fe:LiNbO3 Bragg cache query diffraction diagram"
            >
              {/* Steered Query Laser Beam */}
              <line
                x1="36"
                y1={88 + (queryAngleDeg - 44) * 1.1}
                x2="235"
                y2="88"
                stroke="#22D3EE"
                strokeWidth="3"
              />
              <text x="16" y="24" fill="#67E8F9" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                Query Beam θ_Q = {queryAngleDeg}°
              </text>

              {/* Fe:LiNbO3 Crystal Block */}
              <rect
                x="235"
                y="34"
                width="92"
                height="108"
                rx="6"
                fill="rgba(14, 116, 144, 0.25)"
                stroke="#38BDF8"
                strokeWidth="1.8"
              />
              {/* Internal Bragg Hologram Grating Lines */}
              {[-24, -8, 8, 24].map((off, idx) => (
                <line
                  key={idx}
                  x1={250}
                  y1={88 + off - 18}
                  x2={312}
                  y2={88 + off + 18}
                  stroke="#F59E0B"
                  strokeOpacity="0.45"
                  strokeWidth="1.4"
                />
              ))}
              <text
                x="281"
                y="160"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
                fontFamily="IBM Plex Mono, monospace"
              >
                Fe:LiNbO₃ Crystal
              </text>

              {/* Diffracted Beams to Sparse Attention Detector Array */}
              {STORED_KEYS.map((k, idx) => {
                const dy = 26 + idx * 40;
                const intensity = scores[idx];
                const isWinner = idx === topIdx;
                return (
                  <g key={k.id}>
                    <line
                      x1="327"
                      y1="88"
                      x2="425"
                      y2={dy}
                      stroke={isWinner ? '#34D399' : '#F59E0B'}
                      strokeWidth={1 + intensity * 3.5}
                      strokeOpacity={0.18 + intensity * 0.82}
                    />
                    <rect
                      x="425"
                      y={dy - 9}
                      width="14"
                      height="18"
                      rx="2"
                      fill={isWinner ? '#10B981' : '#1E293B'}
                      stroke={isWinner ? '#6EE7B7' : '#475569'}
                    />
                    <text
                      x="448"
                      y={dy + 4}
                      fill={isWinner ? '#6EE7B7' : '#94A3B8'}
                      fontSize="10"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {weights[idx].toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Query Beam Angle Scrubber */}
          <div className="bg-[#070A11] border border-slate-800/80 rounded-lg px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Acousto-Optic Query Beam Angle (θ_Q)
              </span>
              <span className="font-mono text-emerald-300 tabular-nums">
                Matched: {STORED_KEYS[topIdx].label}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={1}
              value={queryAngleDeg}
              onChange={(e) => setQueryAngleDeg(Number(e.target.value))}
              className="optical-slider w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}
