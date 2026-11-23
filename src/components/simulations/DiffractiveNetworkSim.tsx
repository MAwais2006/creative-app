import { useEffect, useRef, useState } from 'react';

type PatternKey = 'vertical' | 'horizontal' | 'diagonal' | 'ring';

const PATTERNS: Record<
  PatternKey,
  { label: string; targetClass: number; description: string }
> = {
  vertical: {
    label: 'Vertical Slit',
    targetClass: 0,
    description: 'Diffracts horizontally into Detector Class A',
  },
  horizontal: {
    label: 'Horizontal Slit',
    targetClass: 1,
    description: 'Steered into central Detector Class B',
  },
  diagonal: {
    label: 'Diagonal Grating',
    targetClass: 2,
    description: 'Blazed diffraction routes energy to Detector Class C',
  },
  ring: {
    label: 'Annular Aperture',
    targetClass: 3,
    description: 'Bessel-like focusing targets Detector Class D',
  },
};

export function DiffractiveNetworkSim() {
  const [pattern, setPattern] = useState<PatternKey>('vertical');
  const [wavelengthNm, setWavelengthNm] = useState<number>(633);
  const [phaseGain, setPhaseGain] = useState<number>(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute detector energy scores from physical match to trained phase masks
  const baseScores = [0.1, 0.1, 0.1, 0.1];
  const targetIdx = PATTERNS[pattern].targetClass;
  const resonanceMatch = Math.max(
    0.25,
    1 - Math.abs(wavelengthNm - 633) / 380 - Math.abs(phaseGain - 1.0) * 0.45
  );
  const scores = baseScores.map((b, idx) =>
    idx === targetIdx ? 0.15 + 0.82 * resonanceMatch : b + (1 - resonanceMatch) * 0.22
  );
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const probs = scores.map((s) => (s / totalScore) * 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let time = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(220, rect.height);

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const inputX = 36;
      const layer1X = width * 0.34;
      const layer2X = width * 0.66;
      const detectorX = width - 42;

      // Beam color shifted gently by wavelength
      const beamColor =
        wavelengthNm < 560
          ? '#22D3EE'
          : wavelengthNm < 610
            ? '#FBBF24'
            : '#FB7185';

      // Draw optical propagation field between planes using Huygens wavelet lines
      const numSources = 9;
      const layer1Nodes = 11;
      const layer2Nodes = 11;
      const detectorYs = [
        height * 0.2,
        height * 0.4,
        height * 0.6,
        height * 0.8,
      ];

      // Active input source amplitudes based on pattern
      const inputAmps = Array.from({ length: numSources }, (_, i) => {
        if (pattern === 'vertical') return i >= 3 && i <= 5 ? 1 : 0.15;
        if (pattern === 'horizontal') return i % 2 === 0 ? 0.9 : 0.2;
        if (pattern === 'diagonal') return i < 4 ? 0.95 : 0.2;
        return i === 1 || i === 7 ? 1.0 : 0.15;
      });

      // Layer 0 -> Layer 1 diffraction fan
      for (let i = 0; i < numSources; i++) {
        if (inputAmps[i] < 0.3) continue;
        const y0 = 26 + ((height - 52) * i) / (numSources - 1);
        for (let j = 0; j < layer1Nodes; j += 2) {
          const y1 = 22 + ((height - 44) * j) / (layer1Nodes - 1);
          const wave = 0.5 + 0.5 * Math.sin(time * 3 - i * 0.4 - j * 0.3);
          ctx.strokeStyle = beamColor;
          ctx.globalAlpha = 0.06 + 0.08 * wave * inputAmps[i];
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(inputX, y0);
          ctx.lineTo(layer1X, y1);
          ctx.stroke();
        }
      }

      // Layer 1 -> Layer 2 diffraction fan
      for (let i = 0; i < layer1Nodes; i += 2) {
        const y1 = 22 + ((height - 44) * i) / (layer1Nodes - 1);
        for (let j = 0; j < layer2Nodes; j += 2) {
          const y2 = 22 + ((height - 44) * j) / (layer2Nodes - 1);
          const wave = 0.5 + 0.5 * Math.sin(time * 3.2 - i * 0.5 + j * 0.4);
          ctx.strokeStyle = beamColor;
          ctx.globalAlpha = 0.07 + 0.09 * wave;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(layer1X, y1);
          ctx.lineTo(layer2X, y2);
          ctx.stroke();
        }
      }

      // Layer 2 -> Detector plane focusing onto target detector
      const targetY = detectorYs[targetIdx];
      for (let j = 0; j < layer2Nodes; j++) {
        const y2 = 22 + ((height - 44) * j) / (layer2Nodes - 1);
        const focusStrength = 0.2 + 0.65 * resonanceMatch;
        ctx.strokeStyle = beamColor;
        ctx.globalAlpha = 0.14 * focusStrength + 0.08 * Math.sin(time * 3.5 + j);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(layer2X, y2);
        ctx.lineTo(detectorX, targetY);
        ctx.stroke();

        // Residual stray diffraction into other bins when detuned
        if (resonanceMatch < 0.85) {
          detectorYs.forEach((dy, dIdx) => {
            if (dIdx === targetIdx) return;
            ctx.globalAlpha = (1 - resonanceMatch) * 0.07;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(layer2X, y2);
            ctx.lineTo(detectorX, dy);
            ctx.stroke();
          });
        }
      }

      ctx.globalAlpha = 1;

      // Draw Input Aperture Plane
      for (let i = 0; i < numSources; i++) {
        const y0 = 26 + ((height - 52) * i) / (numSources - 1);
        ctx.fillStyle = inputAmps[i] > 0.3 ? beamColor : '#1E293B';
        ctx.fillRect(inputX - 4, y0 - 5, 8, 10);
      }

      // Draw Diffractive Phase Mask Layers 1 & 2 (segmented dielectric pixels)
      [layer1X, layer2X].forEach((lx, layerIdx) => {
        for (let k = 0; k < 14; k++) {
          const py = 18 + ((height - 36) * k) / 13;
          const phaseShade = Math.sin(k * 1.3 + layerIdx * 2.1 + phaseGain * 2) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(56, 189, 248, ${0.25 + phaseShade * 0.65})`;
          ctx.fillRect(lx - 4, py - 5, 8, 9);
        }
      });

      // Draw 4 Detector Bins
      const labels = ['A', 'B', 'C', 'D'];
      detectorYs.forEach((dy, idx) => {
        const isTarget = idx === targetIdx;
        ctx.fillStyle = isTarget ? beamColor : '#1E293B';
        ctx.strokeStyle = isTarget ? '#F8FAFC' : '#334155';
        ctx.lineWidth = 1.5;
        ctx.fillRect(detectorX, dy - 11, 14, 22);
        ctx.strokeRect(detectorX, dy - 11, 14, 22);

        ctx.fillStyle = isTarget ? '#F8FAFC' : '#64748B';
        ctx.font = '600 10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(labels[idx], detectorX + 20, dy + 4);
      });

      // Plane captions
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Input', inputX, height - 5);
      ctx.fillText('Phase Mask 1', layer1X, height - 5);
      ctx.fillText('Phase Mask 2', layer2X, height - 5);
      ctx.fillText('Detectors', detectorX + 7, height - 5);

      ctx.restore();
      time += 0.03;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [pattern, wavelengthNm, phaseGain, targetIdx, resonanceMatch]);

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Free-Space Diffractive Neural Network (D²NN)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {PATTERNS[pattern].description}
          </p>
        </div>
        <div className="font-mono text-xs text-cyan-300 tabular-nums">
          Match Confidence: {probs[targetIdx].toFixed(1)}%
        </div>
      </div>

      {/* Input Aperture Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
        {(Object.keys(PATTERNS) as PatternKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPattern(key)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              pattern === key
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {PATTERNS[key].label}
          </button>
        ))}
      </div>

      {/* Live Diffraction Wavefront Canvas */}
      <div className="relative w-full h-52 bg-[#070A11] border border-slate-800 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Physical Wavelength / Phase Calibration + Detector Readout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3 space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Laser Wavelength (Trained: 633 nm)</span>
              <span className="font-mono text-cyan-300 tabular-nums">{wavelengthNm} nm</span>
            </div>
            <input
              type="range"
              min={480}
              max={760}
              step={1}
              value={wavelengthNm}
              onChange={(e) => setWavelengthNm(Number(e.target.value))}
              className="optical-slider w-full"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Mask Phase Depth Scale</span>
              <span className="font-mono text-amber-300 tabular-nums">{phaseGain.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={phaseGain}
              onChange={(e) => setPhaseGain(Number(e.target.value))}
              className="optical-slider w-full"
            />
          </div>
        </div>

        <div className="bg-[#070A11] border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 mb-1.5">
            Output Photodetector Intensity Distribution
          </div>
          <div className="space-y-1.5">
            {['Class A', 'Class B', 'Class C', 'Class D'].map((label, idx) => (
              <div key={label} className="flex items-center gap-2 text-[11px]">
                <span className="font-mono text-slate-400 w-14">{label}</span>
                <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${probs[idx]}%` }}
                    className={`h-full transition-all duration-150 ${
                      idx === targetIdx ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                  />
                </div>
                <span className="font-mono text-slate-300 tabular-nums w-11 text-right">
                  {probs[idx].toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
