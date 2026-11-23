import { useState } from 'react';

type ModelScale = '7B' | '70B' | '1T';
type ReachPreset = '1mm' | '25mm' | '2m' | '10m';

const SCALE_CONFIG: Record<
  ModelScale,
  { label: string; macsPerToken: string; memoryBytes: string; computeEnergyPj: number }
> = {
  '7B': {
    label: '7B Edge LLM',
    macsPerToken: '14 GMACs',
    memoryBytes: '14 GB',
    computeEnergyPj: 0.12,
  },
  '70B': {
    label: '70B Cluster Model',
    macsPerToken: '140 GMACs',
    memoryBytes: '140 GB',
    computeEnergyPj: 0.12,
  },
  '1T': {
    label: '1T+ MoE Frontier',
    macsPerToken: '600 GMACs',
    memoryBytes: '2 TB',
    computeEnergyPj: 0.12,
  },
};

const REACH_CONFIG: Record<
  ReachPreset,
  {
    label: string;
    context: string;
    copperPjPerBit: number;
    opticalPjPerBit: number;
    copperDensity: number;
    opticalDensity: number;
  }
> = {
  '1mm': {
    label: '1 mm (On-Die)',
    context: 'SRAM / Tensor Core bus',
    copperPjPerBit: 0.35,
    opticalPjPerBit: 0.45,
    copperDensity: 1.2,
    opticalDensity: 4.5,
  },
  '25mm': {
    label: '25 mm (Package)',
    context: 'Chiplet-to-HBM interposer',
    copperPjPerBit: 2.8,
    opticalPjPerBit: 0.55,
    copperDensity: 0.6,
    opticalDensity: 6.4,
  },
  '2m': {
    label: '2 m (Rack Copper)',
    context: 'NVLink / Twinax backplane',
    copperPjPerBit: 14.5,
    opticalPjPerBit: 0.72,
    copperDensity: 0.18,
    opticalDensity: 8.0,
  },
  '10m': {
    label: '10 m (Cluster Fabric)',
    context: 'Pod-to-pod optical vs. retimed copper',
    copperPjPerBit: 38.0,
    opticalPjPerBit: 0.85,
    copperDensity: 0.05,
    opticalDensity: 8.0,
  },
};

export function EnergyBottleneckSim() {
  const [scale, setScale] = useState<ModelScale>('70B');
  const [reach, setReach] = useState<ReachPreset>('25mm');

  const scaleData = SCALE_CONFIG[scale];
  const reachData = REACH_CONFIG[reach];

  // Assume 16-bit weight movement amortized across reuse factor
  const copperMovePerMac = reachData.copperPjPerBit * 2.0;
  const opticalMovePerMac = reachData.opticalPjPerBit * 2.0;
  const compute = scaleData.computeEnergyPj;

  const totalCopper = compute + copperMovePerMac;
  const totalOptical = compute + opticalMovePerMac;
  const savingsRatio = (totalCopper / totalOptical).toFixed(1);

  const maxEnergy = 78;
  const copperMovePct = Math.min(100, (copperMovePerMac / maxEnergy) * 100);
  const opticalMovePct = Math.min(100, (opticalMovePerMac / maxEnergy) * 100);
  const computePct = Math.max(1.5, (compute / maxEnergy) * 100);

  return (
    <div className="flex flex-col gap-5 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Energy & Bandwidth Scaling Bench
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare arithmetic energy against copper and optical transport across reach
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Transport Advantage</div>
          <div className="font-mono text-lg font-semibold text-cyan-400 tabular-nums">
            {savingsRatio}× lower total pJ
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2">
            AI Workload Scale
          </div>
          <div className="flex items-center gap-1 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
            {(['7B', '70B', '1T'] as ModelScale[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setScale(item)}
                className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  scale === item
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item} Params
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
            <span>{scaleData.macsPerToken}/tok</span>
            <span aria-hidden="true">·</span>
            <span>{scaleData.memoryBytes} weights</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-400 mb-2">
            Interconnect Distance
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
            {(['1mm', '25mm', '2m', '10m'] as ReachPreset[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReach(r)}
                className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  reach === r
                    ? 'bg-slate-800 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="mt-1.5 text-xs text-slate-400">
            {reachData.context}
          </div>
        </div>
      </div>

      {/* Energy Comparison Bars */}
      <div className="space-y-4 bg-[#070A11] border border-slate-800/80 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">
              Conventional Copper Interconnect
            </span>
            <span className="font-mono text-amber-400 tabular-nums font-semibold">
              {totalCopper.toFixed(2)} pJ / op
            </span>
          </div>
          <div className="h-5 w-full bg-slate-900 rounded overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${computePct}%` }}
              className="h-full bg-slate-400 transition-all duration-200"
              title={`CMOS MAC Compute: ${compute} pJ`}
            />
            <div
              style={{ width: `${copperMovePct}%` }}
              className="h-full bg-amber-500 transition-all duration-200"
              title={`Copper Transport: ${copperMovePerMac.toFixed(2)} pJ`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
            <span>Compute: {compute.toFixed(2)} pJ</span>
            <span>
              Wire Loss: {copperMovePerMac.toFixed(2)} pJ (
              {((copperMovePerMac / totalCopper) * 100).toFixed(1)}% of total)
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/70">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">
              Silicon Photonic Waveguide Link
            </span>
            <span className="font-mono text-cyan-400 tabular-nums font-semibold">
              {totalOptical.toFixed(2)} pJ / op
            </span>
          </div>
          <div className="h-5 w-full bg-slate-900 rounded overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${computePct}%` }}
              className="h-full bg-slate-400 transition-all duration-200"
            />
            <div
              style={{ width: `${opticalMovePct}%` }}
              className="h-full bg-cyan-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
            <span>Compute: {compute.toFixed(2)} pJ</span>
            <span>Laser + Modulator: {opticalMovePerMac.toFixed(2)} pJ</span>
          </div>
        </div>
      </div>

      {/* Bandwidth Density Readout */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Copper Shoreline Density</div>
          <div className="mt-1 font-mono text-xl font-semibold text-amber-300 tabular-nums">
            {reachData.copperDensity.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">Tbps/mm</span>
          </div>
        </div>
        <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Photonic Shoreline Density</div>
          <div className="mt-1 font-mono text-xl font-semibold text-cyan-300 tabular-nums">
            {reachData.opticalDensity.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">Tbps/mm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
