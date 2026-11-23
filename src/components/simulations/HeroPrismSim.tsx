import { useState } from 'react';
import { ResilientImage } from '../ResilientImage';

interface BandOption {
  id: string;
  label: string;
  wavelengthNm: number;
  photonEv: string;
  siliconAbsorption: string;
  aiRole: string;
}

const BANDS: BandOption[] = [
  {
    id: 'vis',
    label: 'Visible (532 nm)',
    wavelengthNm: 532,
    photonEv: '2.33 eV',
    siliconAbsorption: 'High (Absorbed by Si)',
    aiRole: 'Free-space D²NN masks, camera metalenses, & CMOS image sensors',
  },
  {
    id: 'o-band',
    label: 'O-Band (1310 nm)',
    wavelengthNm: 1310,
    photonEv: '0.95 eV',
    siliconAbsorption: 'Transparent (Low Loss)',
    aiRole: 'Co-packaged AI cluster interconnects with zero dispersion',
  },
  {
    id: 'c-band',
    label: 'C-Band (1550 nm)',
    wavelengthNm: 1550,
    photonEv: '0.80 eV',
    siliconAbsorption: 'Transparent (<0.1 dB/cm)',
    aiRole: 'Silicon photonic MZI meshes, WDM weight banks, & long-haul links',
  },
];

export function HeroPrismSim() {
  const [selectedBandId, setSelectedBandId] = useState<string>('c-band');
  const activeBand = BANDS.find((b) => b.id === selectedBandId) ?? BANDS[2];

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="relative w-full h-64 sm:h-72 rounded-lg overflow-hidden border border-slate-800 bg-[#070A11]">
        <ResilientImage
          src="/src/assets/images/photonic_ai_wafer_hero_1795410684726.jpg"
          alt="Silicon photonics AI accelerator chip coupling cyan and amber laser beams into microscopic optical waveguides"
          className="w-full h-full object-cover"
          fallbackTitle="Silicon Photonics AI Accelerator"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070A11] via-[#070A11]/70 to-transparent p-4">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
            <span>Silicon Photonic Accelerator Bench</span>
            <span className="font-mono text-cyan-300 tabular-nums">
              {activeBand.wavelengthNm} nm · {activeBand.photonEv}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Wavelength Regime Explorer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Inspect Operating Optical Wavelength</span>
          <span className="font-mono text-slate-500">Si Bandgap = 1.12 eV (1107 nm)</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
          {BANDS.map((band) => (
            <button
              key={band.id}
              type="button"
              onClick={() => setSelectedBandId(band.id)}
              className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedBandId === band.id
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {band.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#070A11] border border-slate-800/80 rounded-lg p-3.5">
          <div>
            <div className="text-[11px] text-slate-400">Silicon Interaction</div>
            <div className="text-sm font-medium text-slate-100 mt-0.5">
              {activeBand.siliconAbsorption}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Primary AI Application</div>
            <div className="text-xs text-slate-300 leading-relaxed mt-0.5">
              {activeBand.aiRole}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
