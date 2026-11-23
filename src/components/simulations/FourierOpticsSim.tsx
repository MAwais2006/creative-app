import { useEffect, useRef, useState } from 'react';
import { ResilientImage } from '../ResilientImage';

type FilterKind = 'all-pass' | 'high-pass' | 'low-pass' | 'directional';

const FILTERS: Record<
  FilterKind,
  { label: string; cnnEquivalent: string; note: string }
> = {
  'all-pass': {
    label: 'All-Pass Lens',
    cnnEquivalent: 'Identity Kernel (Raw Image)',
    note: 'Full spatial frequency spectrum reaches CMOS pixels without optical filtering.',
  },
  'high-pass': {
    label: 'High-Pass Edge',
    cnnEquivalent: 'Laplacian Edge Kernel (3×3)',
    note: 'Opaque central stop blocks DC background light, leaving only sharp object boundaries.',
  },
  'low-pass': {
    label: 'Low-Pass Blur',
    cnnEquivalent: 'Gaussian Smoothing Kernel',
    note: 'Small central pinhole passes coarse shapes while rejecting fine high-frequency texture.',
  },
  directional: {
    label: 'Vertical Gradient',
    cnnEquivalent: 'Oriented Gabor / Sobel Kernel',
    note: 'Slit pupil in the Fourier plane isolates horizontal edges before sensor readout.',
  },
};

export function FourierOpticsSim() {
  const [filterKind, setFilterKind] = useState<FilterKind>('high-pass');
  const [cutoff, setCutoff] = useState<number>(28);
  const [viewMode, setViewMode] = useState<'bench' | 'metalens'>('bench');

  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pupilCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (viewMode !== 'bench') return;
    const inCanvas = inputCanvasRef.current;
    const pupilCanvas = pupilCanvasRef.current;
    const outCanvas = outputCanvasRef.current;
    if (!inCanvas || !pupilCanvas || !outCanvas) return;

    const N = 96;
    inCanvas.width = N;
    inCanvas.height = N;
    pupilCanvas.width = N;
    pupilCanvas.height = N;
    outCanvas.width = N;
    outCanvas.height = N;

    const inCtx = inCanvas.getContext('2d');
    const pupilCtx = pupilCanvas.getContext('2d');
    const outCtx = outCanvas.getContext('2d');
    if (!inCtx || !pupilCtx || !outCtx) return;

    // 1. Construct crisp synthetic optical scene (geometric circuit + circle + stripes)
    const scene = new Float32Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let val = 0.08;
        // Square frame
        if (x > 16 && x < 46 && y > 18 && y < 48) val = 0.92;
        if (x > 22 && x < 40 && y > 24 && y < 42) val = 0.15;
        // Circle target
        const dx = x - 66;
        const dy = y - 34;
        if (dx * dx + dy * dy < 15 * 15) val = 0.88;
        // Resolution grating bars
        if (y > 58 && y < 82 && x > 16 && x < 80) {
          val = Math.floor((x - 16) / 6) % 2 === 0 ? 0.95 : 0.1;
        }
        scene[y * N + x] = val;
      }
    }

    // Render input scene
    const inImg = inCtx.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      const c = Math.round(scene[i] * 240);
      inImg.data[i * 4] = c;
      inImg.data[i * 4 + 1] = c;
      inImg.data[i * 4 + 2] = Math.min(255, c + 12);
      inImg.data[i * 4 + 3] = 255;
    }
    inCtx.putImageData(inImg, 0, 0);

    // 2. Render Fourier Pupil Mask M(fx, fy)
    const pupilImg = pupilCtx.createImageData(N, N);
    const radiusNorm = cutoff / 100;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const fx = (x - N / 2) / (N / 2);
        const fy = (y - N / 2) / (N / 2);
        const r = Math.sqrt(fx * fx + fy * fy);

        let mask = 1;
        if (filterKind === 'high-pass') {
          mask = r >= radiusNorm * 0.75 ? 1 : 0;
        } else if (filterKind === 'low-pass') {
          mask = r <= Math.max(0.12, 0.75 - radiusNorm * 0.55) ? 1 : 0;
        } else if (filterKind === 'directional') {
          mask = Math.abs(fx) < 0.22 && Math.abs(fy) > radiusNorm * 0.35 ? 1 : 0;
        }

        const idx = (y * N + x) * 4;
        if (mask > 0.5) {
          pupilImg.data[idx] = 6;
          pupilImg.data[idx + 1] = 182;
          pupilImg.data[idx + 2] = 212;
          pupilImg.data[idx + 3] = 235;
        } else {
          pupilImg.data[idx] = 15;
          pupilImg.data[idx + 1] = 23;
          pupilImg.data[idx + 2] = 42;
          pupilImg.data[idx + 3] = 255;
        }
      }
    }
    pupilCtx.putImageData(pupilImg, 0, 0);

    // 3. Compute real spatial convolution approximation matching the optical Fourier pupil
    const outImg = outCtx.createImageData(N, N);
    const blurRadius = Math.max(1, Math.round((cutoff / 100) * 4));

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const center = scene[y * N + x];
        let outVal = center;

        if (filterKind === 'high-pass') {
          let avg = 0;
          let count = 0;
          for (let ky = -blurRadius; ky <= blurRadius; ky++) {
            for (let kx = -blurRadius; kx <= blurRadius; kx++) {
              const sy = Math.min(N - 1, Math.max(0, y + ky));
              const sx = Math.min(N - 1, Math.max(0, x + kx));
              avg += scene[sy * N + sx];
              count++;
            }
          }
          outVal = Math.min(1, Math.abs(center - avg / count) * 3.4);
        } else if (filterKind === 'low-pass') {
          const rBlur = Math.max(1, Math.round((cutoff / 100) * 5));
          let avg = 0;
          let count = 0;
          for (let ky = -rBlur; ky <= rBlur; ky++) {
            for (let kx = -rBlur; kx <= rBlur; kx++) {
              const sy = Math.min(N - 1, Math.max(0, y + ky));
              const sx = Math.min(N - 1, Math.max(0, x + kx));
              avg += scene[sy * N + sx];
              count++;
            }
          }
          outVal = avg / count;
        } else if (filterKind === 'directional') {
          const up = scene[Math.max(0, y - 1) * N + x];
          const down = scene[Math.min(N - 1, y + 1) * N + x];
          outVal = Math.min(1, Math.abs(down - up) * (1.8 + cutoff / 40));
        }

        const idx = (y * N + x) * 4;
        if (filterKind === 'all-pass' || filterKind === 'low-pass') {
          const c = Math.round(outVal * 240);
          outImg.data[idx] = c;
          outImg.data[idx + 1] = c;
          outImg.data[idx + 2] = Math.min(255, c + 15);
          outImg.data[idx + 3] = 255;
        } else {
          outImg.data[idx] = Math.round(outVal * 34);
          outImg.data[idx + 1] = Math.round(outVal * 211);
          outImg.data[idx + 2] = Math.round(outVal * 238);
          outImg.data[idx + 3] = 255;
        }
      }
    }
    outCtx.putImageData(outImg, 0, 0);
  }, [filterKind, cutoff, viewMode]);

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Optical 4f Fourier Pre-Processing Bench
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {FILTERS[filterKind].cnnEquivalent}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('bench')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'bench'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4f Filter Bench
          </button>
          <button
            type="button"
            onClick={() => setViewMode('metalens')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'metalens'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Metalens Hardware
          </button>
        </div>
      </div>

      {viewMode === 'metalens' ? (
        <div className="relative flex-1 min-h-[260px] rounded-lg overflow-hidden border border-slate-800 bg-[#070A11]">
          <ResilientImage
            src="/src/assets/images/nanophotonic_metalens_sensor_1795410684828.jpg"
            alt="Cross-section of a nanophotonic titanium dioxide metalens focusing rays directly onto a CMOS sensor die"
            className="w-full h-full object-cover"
            fallbackTitle="Nanophotonic Metalens Vision Sensor"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
            <p className="text-xs text-slate-200 leading-relaxed">
              Sub-wavelength TiO₂ nanopillars sculpt incoming wavefronts directly onto CMOS pixels—executing convolutional feature extraction before analog-to-digital readout.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Mask Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#070A11] border border-slate-800 rounded-lg">
            {(Object.keys(FILTERS) as FilterKind[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterKind(key)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterKind === key
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {FILTERS[key].label}
              </button>
            ))}
          </div>

          {/* 3-Stage Optical Pipeline Canvases */}
          <div className="grid grid-cols-3 gap-3 bg-[#070A11] border border-slate-800 rounded-lg p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-mono text-slate-400">1. Scene Light</div>
              <canvas
                ref={inputCanvasRef}
                className="w-full aspect-square max-w-[136px] rounded border border-slate-800 bg-black"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-mono text-cyan-300">2. Fourier Pupil</div>
              <canvas
                ref={pupilCanvasRef}
                className="w-full aspect-square max-w-[136px] rounded border border-slate-800 bg-black"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-mono text-amber-300">3. CMOS Sensor</div>
              <canvas
                ref={outputCanvasRef}
                className="w-full aspect-square max-w-[136px] rounded border border-slate-800 bg-black"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Spatial Frequency Cutoff Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4 bg-[#070A11] border border-slate-800/80 rounded-lg px-4 py-2.5">
              <label
                htmlFor="fourier-cutoff"
                className="text-xs font-medium text-slate-300 whitespace-nowrap"
              >
                Pupil Aperture Cutoff
              </label>
              <input
                id="fourier-cutoff"
                type="range"
                min={10}
                max={80}
                step={2}
                value={cutoff}
                onChange={(e) => setCutoff(Number(e.target.value))}
                className="optical-slider flex-1"
              />
              <span className="font-mono text-xs text-cyan-300 tabular-nums w-14 text-right">
                {cutoff} lp/mm
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {FILTERS[filterKind].note}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
