import { useEffect, useRef, useState } from 'react';

interface LaserChannel {
  id: number;
  wavelengthNm: number;
  color: string;
  label: string;
}

const CHANNELS: LaserChannel[] = [
  { id: 0, wavelengthNm: 1530, color: '#22D3EE', label: 'λ₁ 1530 nm' },
  { id: 1, wavelengthNm: 1535, color: '#38BDF8', label: 'λ₂ 1535 nm' },
  { id: 2, wavelengthNm: 1540, color: '#818CF8', label: 'λ₃ 1540 nm' },
  { id: 3, wavelengthNm: 1545, color: '#34D399', label: 'λ₄ 1545 nm' },
  { id: 4, wavelengthNm: 1550, color: '#FBBF24', label: 'λ₅ 1550 nm' },
  { id: 5, wavelengthNm: 1555, color: '#F87171', label: 'λ₆ 1555 nm' },
];

export function WdmMultiplexerSim() {
  const [activeChannels, setActiveChannels] = useState<boolean[]>([
    true,
    true,
    false,
    true,
    true,
    false,
  ]);
  const [baudRateGbps, setBaudRateGbps] = useState<number>(64);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeCount = activeChannels.filter(Boolean).length;
  const totalTbps = ((activeCount * baudRateGbps) / 1000).toFixed(3);

  const toggleChannel = (index: number) => {
    setActiveChannels((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let phase = 0;

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

      // Background grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < width; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }

      const muxX = width * 0.25;
      const demuxX = width * 0.75;
      const busY = height * 0.5;
      const rowSpacing = (height - 44) / (CHANNELS.length - 1);

      // Draw central shared silicon nitride waveguide bus
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(muxX, busY);
      ctx.lineTo(demuxX, busY);
      ctx.stroke();

      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(muxX, busY);
      ctx.lineTo(demuxX, busY);
      ctx.stroke();

      // Draw MUX & DEMUX couplers
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.fillRect(muxX - 14, 14, 28, height - 28);
      ctx.strokeRect(muxX - 14, 14, 28, height - 28);
      ctx.fillRect(demuxX - 14, 14, 28, height - 28);
      ctx.strokeRect(demuxX - 14, 14, 28, height - 28);

      // Draw individual input and output channels + microrings
      CHANNELS.forEach((ch, idx) => {
        const y = 22 + idx * rowSpacing;
        const isActive = activeChannels[idx];

        // Input & output waveguide tracks
        ctx.strokeStyle = isActive ? ch.color : '#1E293B';
        ctx.globalAlpha = isActive ? 0.55 : 0.4;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(16, y);
        ctx.lineTo(muxX - 14, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(demuxX + 14, y);
        ctx.lineTo(width - 16, y);
        ctx.stroke();

        // Modulator ring on left & Drop ring on right
        ctx.beginPath();
        ctx.arc(muxX * 0.52, y - 8, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(demuxX + (width - demuxX) * 0.48, y - 8, 6, 0, Math.PI * 2);
        ctx.stroke();

        if (isActive) {
          ctx.globalAlpha = 0.95;
          // Propagating modulated optical wave on input
          ctx.strokeStyle = ch.color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          const freq = 0.11 + idx * 0.018;
          for (let x = 18; x <= muxX - 14; x += 2) {
            const amp = 4.2 * (0.55 + 0.45 * Math.sin(x * 0.08 - phase * 1.4 + idx));
            const wy = y + Math.sin(x * freq - phase * 2.4) * amp;
            if (x === 18) ctx.moveTo(x, wy);
            else ctx.lineTo(x, wy);
          }
          ctx.stroke();

          // Propagating wave inside shared waveguide bus (stacked subtly in frequency)
          ctx.globalAlpha = 0.72;
          ctx.beginPath();
          for (let x = muxX + 14; x <= demuxX - 14; x += 2) {
            const offset = (idx - 2.5) * 1.4;
            const wy = busY + offset + Math.sin(x * (0.09 + idx * 0.022) - phase * 3.0) * 3.5;
            if (x === muxX + 14) ctx.moveTo(x, wy);
            else ctx.lineTo(x, wy);
          }
          ctx.stroke();

          // Demux output wave
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          for (let x = demuxX + 14; x <= width - 18; x += 2) {
            const amp = 4.2 * (0.55 + 0.45 * Math.sin(x * 0.08 - phase * 1.4 + idx));
            const wy = y + Math.sin(x * freq - phase * 2.4) * amp;
            if (x === demuxX + 14) ctx.moveTo(x, wy);
            else ctx.lineTo(x, wy);
          }
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      });

      // Labels on canvas
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MUX', muxX, height - 4);
      ctx.fillText('DEMUX', demuxX, height - 4);
      ctx.fillText('1× Silicon Nitride Waveguide', width * 0.5, busY - 16);

      ctx.restore();
      phase += 0.03 * (baudRateGbps / 50);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeChannels, baudRateGbps]);

  return (
    <div className="flex flex-col gap-4 h-full justify-between bg-[#0B101B] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            C-Band WDM Optical Waveguide Simulator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Toggle laser channels to multiplex independent tensors onto a single waveguide
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Aggregate Link Throughput</div>
          <div className="font-mono text-lg font-semibold text-cyan-400 tabular-nums">
            {totalTbps} Tbps{' '}
            <span className="text-xs font-normal text-slate-400">
              ({activeCount} λ active)
            </span>
          </div>
        </div>
      </div>

      {/* Live Canvas Stage */}
      <div className="relative w-full h-56 bg-[#070A11] border border-slate-800 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Channel Toggles & Modulation Rate */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CHANNELS.map((ch, idx) => {
            const active = activeChannels[idx];
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => toggleChannel(idx)}
                className={`px-2 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 border-slate-600 text-slate-100'
                    : 'bg-[#070A11] border-slate-800/80 text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{
                    backgroundColor: active ? ch.color : '#334155',
                  }}
                  aria-hidden="true"
                />
                {ch.wavelengthNm} nm
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 bg-[#070A11] border border-slate-800/80 rounded-lg px-4 py-3">
          <label
            htmlFor="wdm-baud-slider"
            className="text-xs font-medium text-slate-300 whitespace-nowrap"
          >
            Modulation Speed per λ
          </label>
          <input
            id="wdm-baud-slider"
            type="range"
            min={25}
            max={128}
            step={1}
            value={baudRateGbps}
            onChange={(e) => setBaudRateGbps(Number(e.target.value))}
            className="optical-slider flex-1"
          />
          <span className="font-mono text-xs font-semibold text-cyan-300 tabular-nums w-20 text-right">
            {baudRateGbps} Gbps
          </span>
        </div>
      </div>
    </div>
  );
}
