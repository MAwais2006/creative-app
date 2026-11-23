import { useState } from 'react';
import { ResilientImage } from '../ResilientImage';

export function MziInterferometerSim() {
  const [x1, setX1] = useState<number>(0.85);
  const [x2, setX2] = useState<number>(0.52);
  const [thetaDeg, setThetaDeg] = useState<number>(90);
  const [phiDeg, setPhiDeg] = useState<number>(45);
  const [viewMode, setViewMode] = useState<'sim' | 'hardware'>('sim');

  const theta = (thetaDeg * Math.PI) / 180;
  const phi = (phiDeg * Math.PI) / 180;

  // Unitary 2x2 MZI matrix U(theta, phi)
  // Using standard Clements decomposition:
  // u00 = e^(i*phi) * sin(theta/2)
  // u01 = cos(theta/2)
  // u10 = e^(i*phi) * cos(theta/2)
  // u11 = -sin(theta/2)
  const sinH = Math.sin(theta / 2);
  const cosH = Math.cos(theta / 2);

  // Complex output field amplitudes for real input amplitudes (x1, x2)
  const y1Re = Math.cos(phi) * sinH * x1 + cosH * x2;
  const y1Im = Math.sin(phi) * sinH * x1;
  const y2Re = Math.cos(phi) * cosH * x1 - sinH * x2;
  const y2Im = Math.sin(phi) * cosH * x1;

  const y1Power = y1Re * y1Re + y1Im * y1Im;
  const y2Power = y2Re * y2Re + y2Im * y2Im;
  const totalInPower = x1 * x1 + x2 * x2;
  const totalOutPower = y1Power + y2Power;

  const normRatio = totalInPower > 0 ? y1Power / totalInPower : 0.5;

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            2×2 Mach-Zehnder Interferometer Gate
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tune phase shifters θ and φ to steer optical interference
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('sim')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'sim'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Simulator
          </button>
          <button
            type="button"
            onClick={() => setViewMode('hardware')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'hardware'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Silicon Die View
          </button>
        </div>
      </div>

      {viewMode === 'hardware' ? (
        <div className="flex flex-col gap-3 flex-1 justify-between">
          <div className="relative flex-1 min-h-[250px] rounded-lg overflow-hidden border border-slate-800 bg-[#070A11]">
            <ResilientImage
              src="/src/assets/images/mzi_optical_waveguide_die_1795410684850.jpg"
              alt="Isometric rendering of a silicon nitride Mach-Zehnder interferometer waveguide mesh with golden thermal phase-shifter electrodes"
              className="w-full h-full object-cover"
              fallbackTitle="Silicon Nitride MZI Mesh Die"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
              <p className="text-xs text-slate-200 leading-relaxed">
                Gold electrodes heat silicon nitride waveguide arms by fractions of a kelvin, changing refractive index (dn/dT) to program weights θ and φ across the Clements mesh.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Interactive SVG Optical Schematic */}
          <div className="bg-[#070A11] border border-slate-800 rounded-lg p-3">
            <svg
              viewBox="0 0 600 185"
              className="w-full h-44 select-none"
              role="img"
              aria-label="Interactive 2x2 Mach-Zehnder Interferometer optical waveguide diagram"
            >
              {/* Input labels */}
              <text x="16" y="48" fill="#94A3B8" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                x₁ = {x1.toFixed(2)}
              </text>
              <text x="16" y="142" fill="#94A3B8" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                x₂ = {x2.toFixed(2)}
              </text>

              {/* Input waveguides */}
              <line
                x1="86"
                y1="44"
                x2="175"
                y2="44"
                stroke="#06B6D4"
                strokeWidth={Math.max(1.5, x1 * 5)}
                strokeOpacity={0.35 + x1 * 0.65}
              />
              <line
                x1="86"
                y1="138"
                x2="175"
                y2="138"
                stroke="#F59E0B"
                strokeWidth={Math.max(1.5, x2 * 5)}
                strokeOpacity={0.35 + x2 * 0.65}
              />

              {/* External phase shifter phi on top input */}
              <rect
                x="114"
                y="32"
                width="38"
                height="24"
                rx="4"
                fill="#1E293B"
                stroke="#F59E0B"
                strokeWidth="1.5"
              />
              <text
                x="133"
                y="48"
                textAnchor="middle"
                fill="#FCD34D"
                fontSize="11"
                fontFamily="IBM Plex Mono, monospace"
              >
                φ
              </text>

              {/* First 50:50 Coupler */}
              <path
                d="M 175 44 C 195 44, 195 82, 215 82 L 235 82 C 255 82, 255 44, 275 44"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              <path
                d="M 175 138 C 195 138, 195 100, 215 100 L 235 100 C 255 100, 255 138, 275 138"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              <rect
                x="202"
                y="74"
                width="46"
                height="34"
                rx="4"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#475569"
                strokeWidth="1"
              />
              <text
                x="225"
                y="95"
                textAnchor="middle"
                fill="#CBD5E1"
                fontSize="10"
                fontFamily="IBM Plex Mono, monospace"
              >
                50:50
              </text>

              {/* Internal arms + theta phase shifter */}
              <line x1="275" y1="44" x2="385" y2="44" stroke="#22D3EE" strokeWidth="3" />
              <line x1="275" y1="138" x2="385" y2="138" stroke="#22D3EE" strokeWidth="3" />
              <rect
                x="306"
                y="32"
                width="48"
                height="24"
                rx="4"
                fill="#1E293B"
                stroke="#06B6D4"
                strokeWidth="1.5"
              />
              <text
                x="330"
                y="48"
                textAnchor="middle"
                fill="#67E8F9"
                fontSize="11"
                fontFamily="IBM Plex Mono, monospace"
              >
                θ
              </text>

              {/* Second 50:50 Coupler */}
              <path
                d="M 385 44 C 405 44, 405 82, 425 82 L 445 82 C 465 82, 465 44, 485 44"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              <path
                d="M 385 138 C 405 138, 405 100, 425 100 L 445 100 C 465 100, 465 138, 485 138"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              <rect
                x="412"
                y="74"
                width="46"
                height="34"
                rx="4"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#475569"
                strokeWidth="1"
              />
              <text
                x="435"
                y="95"
                textAnchor="middle"
                fill="#CBD5E1"
                fontSize="10"
                fontFamily="IBM Plex Mono, monospace"
              >
                50:50
              </text>

              {/* Output Waveguides */}
              <line
                x1="485"
                y1="44"
                x2="520"
                y2="44"
                stroke="#22D3EE"
                strokeWidth={Math.max(1.5, Math.min(6, Math.sqrt(y1Power) * 4.5))}
                strokeOpacity={Math.min(1, 0.25 + y1Power * 0.65)}
              />
              <line
                x1="485"
                y1="138"
                x2="520"
                y2="138"
                stroke="#F59E0B"
                strokeWidth={Math.max(1.5, Math.min(6, Math.sqrt(y2Power) * 4.5))}
                strokeOpacity={Math.min(1, 0.25 + y2Power * 0.65)}
              />

              {/* Output Photodiodes */}
              <rect x="520" y="34" width="12" height="20" rx="2" fill="#0E7490" stroke="#22D3EE" />
              <rect x="520" y="128" width="12" height="20" rx="2" fill="#B45309" stroke="#F59E0B" />

              <text x="540" y="48" fill="#67E8F9" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                |y₁|²={y1Power.toFixed(2)}
              </text>
              <text x="540" y="142" fill="#FCD34D" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                |y₂|²={y2Power.toFixed(2)}
              </text>

              {/* Conservation check */}
              <text
                x="300"
                y="174"
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="IBM Plex Mono, monospace"
              >
                Unitary Power Conservation: Σ|x|² = {totalInPower.toFixed(2)}  →  Σ|y|² = {totalOutPower.toFixed(2)}
              </text>
            </svg>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Input Amplitude x₁</span>
                  <span className="font-mono text-cyan-300 tabular-nums">{x1.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={x1}
                  onChange={(e) => setX1(Number(e.target.value))}
                  className="optical-slider w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Input Amplitude x₂</span>
                  <span className="font-mono text-amber-300 tabular-nums">{x2.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={x2}
                  onChange={(e) => setX2(Number(e.target.value))}
                  className="optical-slider w-full"
                />
              </div>
            </div>

            <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Internal Phase θ (Split Ratio)</span>
                  <span className="font-mono text-cyan-300 tabular-nums">{thetaDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  step={1}
                  value={thetaDeg}
                  onChange={(e) => setThetaDeg(Number(e.target.value))}
                  className="optical-slider w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">External Phase φ (Interference)</span>
                  <span className="font-mono text-amber-300 tabular-nums">{phiDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={phiDeg}
                  onChange={(e) => setPhiDeg(Number(e.target.value))}
                  className="optical-slider w-full"
                />
              </div>
            </div>
          </div>

          {/* Live Output Split Readout */}
          <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Photodetector Routing Balance</span>
              <span className="font-mono text-slate-300 tabular-nums">
                Port 1: {(normRatio * 100).toFixed(0)}% · Port 2: {((1 - normRatio) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${normRatio * 100}%` }}
                className="h-full bg-cyan-400 transition-all duration-150"
              />
              <div
                style={{ width: `${(1 - normRatio) * 100}%` }}
                className="h-full bg-amber-400 transition-all duration-150"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
