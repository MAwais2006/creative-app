import { useState } from 'react';

const ROW_COLORS = ['#22D3EE', '#38BDF8', '#FBBF24'];
const WAVELENGTHS = ['λ₁ 1546 nm', 'λ₂ 1550 nm', 'λ₃ 1554 nm'];

export function MicroringCrossbarSim() {
  const [inputs, setInputs] = useState<number[]>([0.8, 0.5, 0.9]);
  const [weights, setWeights] = useState<number[][]>([
    [0.9, -0.4, 0.6],
    [0.3, 0.8, -0.5],
    [-0.6, 0.5, 0.7],
  ]);

  const cycleWeight = (row: number, col: number) => {
    const steps = [-0.9, -0.5, 0.0, 0.5, 0.9];
    setWeights((prev) =>
      prev.map((r, ri) =>
        ri === row
          ? r.map((val, ci) => {
              if (ci !== col) return val;
              const closestIdx = steps.reduce(
                (best, curr, idx) =>
                  Math.abs(curr - val) < Math.abs(steps[best] - val) ? idx : best,
                0
              );
              return steps[(closestIdx + 1) % steps.length];
            })
          : r
      )
    );
  };

  const outputs = weights.map((row) =>
    row.reduce((sum, w, j) => sum + w * inputs[j], 0)
  );

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            3×3 WDM Microring Weight Bank
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any microring resonator to tune weight wᵢⱼ (−0.9 to +0.9)
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setWeights([
              [0.9, -0.4, 0.6],
              [0.3, 0.8, -0.5],
              [-0.6, 0.5, 0.7],
            ])
          }
          className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#070A11] border border-slate-800 rounded-lg hover:border-slate-600 transition-colors cursor-pointer whitespace-nowrap"
        >
          Reset Weights
        </button>
      </div>

      {/* Input Vector Laser Sliders */}
      <div className="grid grid-cols-3 gap-2.5">
        {inputs.map((val, idx) => (
          <div
            key={WAVELENGTHS[idx]}
            className="bg-[#070A11] border border-slate-800/80 rounded-lg p-2.5"
          >
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-mono text-slate-300">{WAVELENGTHS[idx]}</span>
              <span
                className="font-mono font-semibold tabular-nums"
                style={{ color: ROW_COLORS[idx] }}
              >
                x{idx + 1}={val.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={val}
              onChange={(e) => {
                const next = Number(e.target.value);
                setInputs((prev) => prev.map((v, i) => (i === idx ? next : v)));
              }}
              className="optical-slider w-full"
            />
          </div>
        ))}
      </div>

      {/* Crossbar Grid */}
      <div className="bg-[#070A11] border border-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 items-center">
          {/* Column headers */}
          <div />
          <div className="grid grid-cols-3 gap-3 text-center text-[11px] font-mono text-slate-400">
            <span>λ₁ Bus</span>
            <span>λ₂ Bus</span>
            <span>λ₃ Bus</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 text-right">
            Balanced PD
          </div>

          {weights.map((row, rIdx) => (
            <div key={rIdx} className="contents">
              <div className="text-xs font-mono text-slate-400">Row {rIdx + 1}</div>
              <div className="grid grid-cols-3 gap-3">
                {row.map((w, cIdx) => {
                  const isPos = w >= 0;
                  const strength = Math.abs(w);
                  const activeBorder =
                    strength === 0
                      ? 'border-slate-700 text-slate-500'
                      : isPos
                        ? 'border-cyan-400 text-cyan-200 bg-cyan-500/10'
                        : 'border-amber-400 text-amber-200 bg-amber-500/10';

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      onClick={() => cycleWeight(rIdx, cIdx)}
                      title={`Click to tune weight w[${rIdx + 1},${cIdx + 1}]`}
                      className={`relative flex items-center justify-center h-12 rounded-lg border border-slate-800 bg-[#0B101B] hover:border-slate-600 transition-colors cursor-pointer`}
                    >
                      {/* Ring resonator circle */}
                      <span
                        className={`flex items-center justify-center w-9 h-9 rounded-full border-2 font-mono text-[11px] font-semibold tabular-nums transition-all ${activeBorder}`}
                      >
                        {w > 0 ? `+${w.toFixed(1)}` : w.toFixed(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="text-right font-mono text-sm font-semibold tabular-nums">
                <span className={outputs[rIdx] >= 0 ? 'text-cyan-300' : 'text-amber-300'}>
                  y{rIdx + 1} = {outputs[rIdx] >= 0 ? '+' : ''}
                  {outputs[rIdx].toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Cyan ring: +Drop Port dominance</span>
          <span>Amber ring: −Through Port dominance</span>
          <span className="font-mono text-slate-300">9 MACs / optical pass</span>
        </div>
      </div>
    </div>
  );
}
