import { useState } from 'react';

interface DomainRow {
  operation: string;
  photonicsWinner: 'Optics' | 'CMOS' | 'Hybrid';
  opticalStrength: string;
  cmosStrength: string;
  verdict: string;
}

const MATRIX_ROWS: DomainRow[] = [
  {
    operation: 'Matrix-Vector Multiply (GEMV)',
    photonicsWinner: 'Optics',
    opticalStrength: '< 10 ps passive pass, WDM parallel',
    cmosStrength: 'High 16-bit/FP8 flexibility',
    verdict: 'Optics excels at large, static-weight linear projections.',
  },
  {
    operation: 'Data Transport (Die-to-Die)',
    photonicsWinner: 'Optics',
    opticalStrength: '1.6+ Tbps/fiber across meters',
    cmosStrength: 'Severe RC loss past 10 cm',
    verdict: 'Co-packaged optics dominates cluster-scale interconnects.',
  },
  {
    operation: 'Nonlinear Activations (ReLU / Softmax)',
    photonicsWinner: 'CMOS',
    opticalStrength: 'Requires high optical power thresholds',
    cmosStrength: 'Sub-fJ transistor switching',
    verdict: 'CMOS remains vastly superior for element-wise nonlinearities.',
  },
  {
    operation: 'SRAM / KV-Cache Memory',
    photonicsWinner: 'CMOS',
    opticalStrength: 'Photons cannot sit still compactly',
    cmosStrength: 'Ultra-dense 6T SRAM & HBM3e',
    verdict: 'Electronic memory stores weights & KV-caches; optics streams them.',
  },
  {
    operation: 'Data Conversion (DAC / ADC)',
    photonicsWinner: 'Hybrid',
    opticalStrength: 'Limited to ~6–8 ENOB at 50+ GHz',
    cmosStrength: 'Mixed-signal SerDes & TI-ADC overhead',
    verdict: 'Amortizing O-E-O conversion across large matrix tiles is critical.',
  },
];

interface Milestone {
  year: string;
  phase: string;
  technology: string;
  detail: string;
}

const ROADMAP: Milestone[] = [
  {
    year: '2024',
    phase: 'Pluggable Optical Transceivers',
    technology: '800G OSFP / Retimed DSP',
    detail:
      'Optical modules sit at the rack edge; copper PCB traces carry signals from GPU packages to front-panel ports.',
  },
  {
    year: '2026',
    phase: 'Co-Packaged Optics (CPO)',
    technology: '1.6–3.2 Tbps Optical Engines on Substrate',
    detail:
      'Silicon photonic chiplets sit millimeters from GPU dies, slashing transceiver power by ~50% across scale-out fabrics.',
  },
  {
    year: '2028',
    phase: 'Optical Memory Disaggregation',
    technology: 'All-to-All Photonic Circuit Switches',
    detail:
      'Pools of HBM and SRAM connect directly via fast optical switching, letting trillion-parameter models share memory transparently.',
  },
  {
    year: '2030+',
    phase: '3D Photonic-CMOS Compute Stacks',
    technology: 'Monolithic Photonic Tensor Interposers',
    detail:
      'Hybrid wafers execute dense attention projections optically beneath stacked CMOS SRAM and activation logic.',
  },
];

export function HybridRoadmapSim() {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [activeYear, setActiveYear] = useState<string>('2026');

  const currentMilestone =
    ROADMAP.find((m) => m.year === activeYear) ?? ROADMAP[1];

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="border-b border-slate-800/80 pb-3">
        <h3 className="text-sm font-semibold text-slate-100">
          Division of Labor: Photonics vs. CMOS
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Select an AI workload primitive to inspect physical strengths and limits
        </p>
      </div>

      {/* Interactive Comparison Matrix */}
      <div className="bg-[#070A11] border border-slate-800 rounded-lg overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {MATRIX_ROWS.map((row, idx) => {
            const isSelected = selectedRow === idx;
            const winnerColor =
              row.photonicsWinner === 'Optics'
                ? 'text-cyan-300'
                : row.photonicsWinner === 'CMOS'
                  ? 'text-amber-300'
                  : 'text-slate-200';
            return (
              <button
                key={row.operation}
                type="button"
                onClick={() => setSelectedRow(idx)}
                className={`w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-slate-900/90' : 'hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-100">
                    {row.operation}
                  </span>
                  <span className={`font-mono text-[11px] font-semibold ${winnerColor}`}>
                    Advantage: {row.photonicsWinner}
                  </span>
                </div>
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-cyan-400 font-medium">Optics: </span>
                      <span className="text-slate-300">{row.opticalStrength}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 font-medium">CMOS: </span>
                      <span className="text-slate-300">{row.cmosStrength}</span>
                    </div>
                    <div className="sm:col-span-2 text-slate-400">
                      {row.verdict}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2024-2030 Co-Packaged Optics Roadmap */}
      <div className="bg-[#070A11] border border-slate-800 rounded-lg p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">
            Photonic AI Hardware Trajectory
          </span>
          <span className="font-mono text-cyan-300">{currentMilestone.year}</span>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-[#0B101B] border border-slate-800 rounded-lg">
          {ROADMAP.map((m) => (
            <button
              key={m.year}
              type="button"
              onClick={() => setActiveYear(m.year)}
              className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                activeYear === m.year
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.year}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-100">
              {currentMilestone.phase}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-amber-300">
              {currentMilestone.technology}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {currentMilestone.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
