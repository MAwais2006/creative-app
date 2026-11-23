import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ChevronDown, ChevronUp, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Hardware3DKind, RobotPoseKind } from '../types/presentation';
import {
  createOpticalBenchTexture,
  createStudioEnvironment,
  createStudioLights,
  disposeObject3D,
  drawFallbackOpticalScene2D,
  isContextSoftwareGl,
} from '../three/webglUtils';
import {
  createScientistRobot3D,
  ScientistRobotRig,
  updateScientistRobot3D,
} from '../three/ScientistRobot3D';
import {
  buildOpticalHardware3D,
  OpticalHardwareRig,
  updateOpticalHardware3D,
} from '../three/OpticalHardware3D';

interface PhotonicLab3DViewportProps {
  hardwareKind: Hardware3DKind;
  robotPose: RobotPoseKind;
  robotExpressionLabel: string;
  robotSpeech: string;
}

export function PhotonicLab3DViewport({
  hardwareKind,
  robotPose,
  robotExpressionLabel,
  robotSpeech,
}: PhotonicLab3DViewportProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [useFallback2D, setUseFallback2D] = useState<boolean>(false);

  const hardwareKindRef = useRef<Hardware3DKind>(hardwareKind);
  const robotPoseRef = useRef<RobotPoseKind>(robotPose);
  const explodeRef = useRef<number>(explodeFactor);
  const speakingRef = useRef<boolean>(isSpeaking);
  const resetCamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    hardwareKindRef.current = hardwareKind;
  }, [hardwareKind]);

  useEffect(() => {
    robotPoseRef.current = robotPose;
  }, [robotPose]);

  useEffect(() => {
    explodeRef.current = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    speakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [hardwareKind]);

  const toggleVoiceNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking((prev) => !prev);
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(robotSpeech);
    utterance.rate = 1.02;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Primary Three.js WebGL stage (creates at most ONE context, never calls loseContext())
  useEffect(() => {
    const container = mountRef.current;
    if (!container || useFallback2D) return;

    // Pre-check WebGL availability safely on a canvas we hand directly to THREE.WebGLRenderer
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', {
        antialias: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }) ||
      canvas.getContext('webgl', {
        antialias: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });

    if (!gl) {
      setUseFallback2D(true);
      return;
    }

    const isSoftwareGl = isContextSoftwareGl(gl);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setUseFallback2D(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = Math.max(320, container.clientWidth);
    const initH = Math.max(280, container.clientHeight);
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a11);
    scene.fog = new THREE.FogExp2(0x070a11, 0.065);

    const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 40);
    const DEFAULT_CAM_POS = new THREE.Vector3(0.45, 2.35, 4.75);
    const DEFAULT_TARGET = new THREE.Vector3(0.15, 0.65, 0);
    camera.position.copy(DEFAULT_CAM_POS);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(DEFAULT_TARGET);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.6;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.update();

    resetCamRef.current = () => {
      camera.position.copy(DEFAULT_CAM_POS);
      controls.target.copy(DEFAULT_TARGET);
      controls.update();
    };

    const envTex = createStudioEnvironment(renderer, scene);
    createStudioLights(scene, isSoftwareGl);

    const benchTexture = createOpticalBenchTexture();
    benchTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const benchMat = new THREE.MeshStandardMaterial({
      map: benchTexture,
      roughness: 0.72,
      metalness: 0.35,
    });
    const benchFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), benchMat);
    benchFloor.rotation.x = -Math.PI / 2;
    benchFloor.position.y = -0.005;
    benchFloor.receiveShadow = !isSoftwareGl;
    scene.add(benchFloor);

    const makeContactShadow = (x: number, z: number, r: number) => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
        g.addColorStop(0, 'rgba(0,0,0,0.62)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
      }
      const tex = new THREE.CanvasTexture(c);
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(r * 2, r * 2),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
        })
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(x, 0.002, z);
      scene.add(plane);
      return tex;
    };
    const shadowTex1 = makeContactShadow(-0.68, 0, 1.55);
    const shadowTex2 = makeContactShadow(1.42, 0.15, 0.9);

    const robotRig: ScientistRobotRig = createScientistRobot3D(isSoftwareGl);
    robotRig.root.position.set(1.42, 0, 0.15);
    robotRig.root.rotation.y = -0.45;
    scene.add(robotRig.root);

    let currentKind: Hardware3DKind = hardwareKindRef.current;
    let hardwareRig: OpticalHardwareRig = buildOpticalHardware3D(
      currentKind,
      isSoftwareGl
    );
    hardwareRig.root.position.set(-0.68, 0, 0);
    scene.add(hardwareRig.root);

    let hardwareMorphScale = 0.86;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setUseFallback2D(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(320, container.clientWidth);
      const h = Math.max(280, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const glCtx = renderer.getContext() as WebGL2RenderingContext;
      if (!glCtx || typeof glCtx.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = glCtx.fenceSync(glCtx.SYNC_GPU_COMMANDS_COMPLETE, 0);
      glCtx.flush();
      const poll = () => {
        if (disposed) {
          if (sync) glCtx.deleteSync(sync);
          return;
        }
        const state = sync && glCtx.getSyncParameter(sync, glCtx.SYNC_STATUS);
        if (state === glCtx.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) glCtx.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;

      if (hardwareKindRef.current !== currentKind) {
        scene.remove(hardwareRig.root);
        disposeObject3D(hardwareRig.root);
        currentKind = hardwareKindRef.current;
        hardwareRig = buildOpticalHardware3D(currentKind, isSoftwareGl);
        hardwareRig.root.position.set(-0.68, 0, 0);
        hardwareMorphScale = 0.72;
        hardwareRig.root.scale.setScalar(hardwareMorphScale);
        scene.add(hardwareRig.root);
      }

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (hardwareMorphScale < 0.999) {
        hardwareMorphScale = THREE.MathUtils.damp(hardwareMorphScale, 1.0, 9, delta);
        hardwareRig.root.scale.setScalar(hardwareMorphScale);
      }

      updateOpticalHardware3D(hardwareRig, elapsed, delta, explodeRef.current);
      updateScientistRobot3D(
        robotRig,
        elapsed,
        delta,
        robotPoseRef.current,
        speakingRef.current
      );

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      controls.dispose();
      disposeObject3D(hardwareRig.root);
      disposeObject3D(robotRig.root);
      benchFloor.geometry.dispose();
      benchMat.dispose();
      benchTexture.dispose();
      shadowTex1.dispose();
      shadowTex2.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [useFallback2D]);

  // Animated 2D Canvas fallback when WebGL is blocked/disabled in host browser
  useEffect(() => {
    if (!useFallback2D) return;
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const start = performance.now();

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = Math.max(260, rect.height);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      const elapsed = (performance.now() - start) / 1000;
      drawFallbackOpticalScene2D(
        ctx,
        w,
        h,
        hardwareKindRef.current,
        robotPoseRef.current,
        elapsed,
        explodeRef.current
      );
      ctx.restore();
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [useFallback2D]);

  return (
    <div className="relative w-full h-[470px] sm:h-[510px] rounded-xl overflow-hidden border border-slate-800 bg-[#070A11]">
      {useFallback2D ? (
        <canvas
          ref={fallbackCanvasRef}
          className="w-full h-full block"
          aria-label="Animated optical hardware and scientist robot presenter stage"
        />
      ) : (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D optical hardware and scientist robot presenter stage"
        />
      )}

      {/* Minimal Top-Left Spec Label */}
      <div className="pointer-events-none absolute top-3 left-3 bg-[#0B101B]/90 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-2">
        <span className="font-mono text-cyan-300">
          {useFallback2D ? 'Optical Lab Stage' : '3D Optical Lab'}
        </span>
        <span aria-hidden="true">·</span>
        <span>{robotExpressionLabel}</span>
      </div>

      {/* Collapsible Bottom Control Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[min(640px,94%)] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-slate-300 bg-[#0B101B]/95 border border-slate-800 rounded-md hover:border-slate-600 transition-colors cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              Show Controls & Robot Speech
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              Hide Controls
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full bg-[#0B101B]/95 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <p className="text-xs text-slate-200 leading-relaxed">
              <span className="font-semibold text-cyan-300">Dr. Photon (Robot): </span>
              “{robotSpeech}”
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5 flex-1 min-w-[180px]">
                <label
                  htmlFor="explode-3d-slider"
                  className="text-[11px] font-medium text-slate-400 whitespace-nowrap"
                >
                  Explode Hardware
                </label>
                <input
                  id="explode-3d-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={explodeFactor}
                  onChange={(e) => setExplodeFactor(Number(e.target.value))}
                  className="optical-slider flex-1"
                />
                <span className="font-mono text-[11px] text-cyan-300 tabular-nums w-9 text-right">
                  {Math.round(explodeFactor * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleVoiceNarration}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    isSpeaking
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                      : 'bg-[#070A11] border-slate-700 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                      Stop Voice
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Explain Aloud
                    </>
                  )}
                </button>

                {!useFallback2D && (
                  <button
                    type="button"
                    onClick={() => resetCamRef.current?.()}
                    title="Reset 3D camera"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 bg-[#070A11] border border-slate-700 rounded-md hover:border-slate-500 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Reset View
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
