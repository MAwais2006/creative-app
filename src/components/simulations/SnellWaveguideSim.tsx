import { useState } from 'react';

export function SnellWaveguideSim() {
  const [n1, setN1] = useState<number>(3.48); // Silicon core
  const [n2, setN2] = useState<number>(1.44); // Silica cladding
  const [theta1Deg, setTheta1Deg] = useState<number>(38);

  const criticalRad = n2 < n1 ? Math.asin(n2 / n1) : Math.PI / 2;
  const criticalDeg = (criticalRad * 180) / Math.PI;
  const isTIR = n1 > n2 && theta1Deg >= criticalDeg;

  const theta1Rad = (theta1Deg * Math.PI) / 180;
  const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
  const theta2Deg =
    !isTIR && sinTheta2 <= 1 ? (Math.asin(sinTheta2) * 180) / Math.PI : null;

  // Ray geometry centered on interface point (240, 110)
  const cx = 240;
  const cy = 110;
  const rayLen = 105;

  const inX = cx - Math.sin(theta1Rad) * rayLen;
  const inY = cy + Math.cos(theta1Rad) * rayLen;

  const reflX = cx + Math.sin(theta1Rad) * rayLen;
  const reflY = cy + Math.cos(theta1Rad) * rayLen;

  const refrRad = theta2Deg !== null ? (theta2Deg * Math.PI) / 180 : 0;
  const refrX = cx + Math.sin(refrRad) * rayLen;
  const refrY = cy - Math.cos(refrRad) * rayLen;

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Snell’s Law & Waveguide Total Internal Reflection Lab
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust incidence angle θ₁ to trap light inside a silicon photonic waveguide
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Optical Regime</div>
          <div
            className={`font-mono text-sm font-semibold tabular-nums ${
              isTIR ? 'text-cyan-300' : 'text-amber-300'
            }`}
          >
            {isTIR
              ? `● Total Internal Reflection (θc = ${criticalDeg.toFixed(1)}°)`
              : `▲ Refracting / Leaking (θ₂ = ${theta2Deg?.toFixed(1) ?? '—'}°)`}
          </div>
        </div>
      </div>

      {/* SVG Optical Interface Diagram */}
      <div className="bg-[#070A11] border border-slate-800 rounded-lg p-3">
        <svg
          viewBox="0 0 480 220"
          className="w-full h-52 select-none"
          role="img"
          aria-label="Snell's Law refraction and total internal reflection ray diagram"
        >
          {/* Upper Medium: Cladding n2 */}
          <rect x="0" y="0" width="480" height="110" fill="#0B1220" />
          {/* Lower Medium: Silicon Core n1 */}
          <rect x="0" y="110" width="480" height="110" fill="#0F1D32" />
          <line x1="0" y1="110" x2="480" y2="110" stroke="#38BDF8" strokeWidth="1.5" />

          {/* Surface Normal Dashed */}
          <line
            x1={cx}
            y1="14"
            x2={cx}
            y2="206"
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {/* Incident Ray */}
          <line
            x1={inX}
            y1={inY}
            x2={cx}
            y2={cy}
            stroke="#22D3EE"
            strokeWidth="3"
          />

          {/* Reflected Ray (strong when TIR, faint Fresnel reflection otherwise) */}
          <line
            x1={cx}
            y1={cy}
            x2={reflX}
            y2={reflY}
            stroke={isTIR ? '#22D3EE' : '#38BDF8'}
            strokeWidth={isTIR ? 3 : 1.5}
            strokeOpacity={isTIR ? 1 : 0.35}
          />

          {/* Refracted Escaping Ray (only when not TIR) */}
          {!isTIR && theta2Deg !== null && (
            <line
              x1={cx}
              y1={cy}
              x2={refrX}
              y2={refrY}
              stroke="#F59E0B"
              strokeWidth="2.6"
            />
          )}

          {/* Labels */}
          <text x="16" y="24" fill="#94A3B8" fontSize="11" fontFamily="IBM Plex Mono, monospace">
            Cladding n₂ = {n2.toFixed(2)} (SiO₂)
          </text>
          <text x="16" y="204" fill="#7DD3FC" fontSize="11" fontFamily="IBM Plex Mono, monospace">
            Core n₁ = {n1.toFixed(2)} (Silicon)
          </text>
          <text x={cx + 8} y="28" fill="#64748B" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            Normal
          </text>
          <text x={inX - 10} y={inY - 8} fill="#67E8F9" fontSize="11" fontFamily="IBM Plex Mono, monospace">
            θ₁={theta1Deg}°
          </text>
          {!isTIR && theta2Deg !== null && (
            <text x={refrX + 6} y={refrY + 4} fill="#FCD34D" fontSize="11" fontFamily="IBM Plex Mono, monospace">
              θ₂={theta2Deg.toFixed(1)}°
            </text>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Incidence Angle θ₁</span>
            <span className="font-mono text-cyan-300 tabular-nums">{theta1Deg}°</span>
          </div>
          <input
            type="range"
            min={5}
            max={80}
            step={1}
            value={theta1Deg}
            onChange={(e) => setTheta1Deg(Number(e.target.value))}
            className="optical-slider w-full"
          />
        </div>

        <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Core Index n₁</span>
            <span className="font-mono text-cyan-300 tabular-nums">{n1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={1.5}
            max={3.8}
            step={0.02}
            value={n1}
            onChange={(e) => setN1(Number(e.target.value))}
            className="optical-slider w-full"
          />
        </div>

        <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Cladding Index n₂</span>
            <span className="font-mono text-amber-300 tabular-nums">{n2.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={2.4}
            step={0.02}
            value={n2}
            onChange={(e) => setN2(Number(e.target.value))}
            className="optical-slider w-full"
          />
        </div>
      </div>
    </div>
  );
}
