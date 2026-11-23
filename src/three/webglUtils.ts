import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Hardware3DKind, RobotPoseKind } from '../types/presentation';

export function isContextSoftwareGl(
  gl: WebGLRenderingContext | WebGL2RenderingContext | null
): boolean {
  if (!gl) return true;
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export function createStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmremGenerator.dispose();
  return envTex;
}

export function createStudioLights(
  scene: THREE.Scene,
  isSoftwareGl: boolean
): void {
  const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
  keyLight.position.set(5, 7, 5);
  keyLight.castShadow = !isSoftwareGl;
  if (!isSoftwareGl) {
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    const d = 5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.9);
  hemiLight.position.set(0, 10, 0);
  scene.add(hemiLight);

  const cyanRim = new THREE.PointLight(0x06b6d4, 4.5, 16, 1.5);
  cyanRim.position.set(-4.2, 2.8, -3.5);
  scene.add(cyanRim);

  const amberRim = new THREE.PointLight(0xf59e0b, 3.2, 16, 1.5);
  amberRim.position.set(4.5, 2.4, -2.5);
  scene.add(amberRim);
}

export function createOpticalBenchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0B111C';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    for (let y = 16; y < 512; y += 32) {
      for (let x = 16; x < 512; x += 32) {
        ctx.fillStyle = '#05080F';
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

/**
 * Clean 2D Isometric Optical Lab + Animated Scientist Robot fallback renderer
 * used only when WebGL is disabled or unavailable in the host browser.
 */
export function drawFallbackOpticalScene2D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hardwareKind: Hardware3DKind,
  robotPose: RobotPoseKind,
  elapsed: number,
  explodeFactor = 0
): void {
  ctx.clearRect(0, 0, width, height);

  // Obsidian background & milled bench grid
  ctx.fillStyle = '#070A11';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < width; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }
  for (let gy = 0; gy < height; gy += 40) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }

  // Optical bench floor plane
  const floorY = height * 0.72;
  ctx.fillStyle = '#0D1422';
  ctx.fillRect(width * 0.06, floorY, width * 0.88, 14);
  ctx.strokeStyle = '#1E293B';
  ctx.strokeRect(width * 0.06, floorY, width * 0.88, 14);

  // Left Apparatus Stage
  const appX = width * 0.34;
  const appY = floorY - 88 - explodeFactor * 18;
  ctx.save();
  ctx.translate(appX, appY);

  // Plinth
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.fillRect(-130, 56 + explodeFactor * 18, 260, 26);
  ctx.strokeRect(-130, 56 + explodeFactor * 18, 260, 26);

  // Draw schematic apparatus silhouette per slide kind
  if (hardwareKind === 'prism-bench' || hardwareKind === 'snell-waveguide') {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.strokeStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(-55, 45);
    ctx.lineTo(55, 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#E0F2FE';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-125, 0);
    ctx.lineTo(-22, 0);
    ctx.stroke();

    const cols = ['#22D3EE', '#34D399', '#FBBF24', '#F87171'];
    cols.forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(125, -24 + i * 16);
      ctx.stroke();

      const t = (elapsed * 0.9 + i * 0.22) % 1;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(22 + t * 103, (-24 + i * 16) * t, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (hardwareKind === 'holographic-cache') {
    ctx.fillStyle = 'rgba(34, 211, 238, 0.18)';
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2;
    ctx.fillRect(-48, -42, 96, 84);
    ctx.strokeRect(-48, -42, 96, 84);

    for (let g = -24; g <= 24; g += 16) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.beginPath();
      ctx.moveTo(-34, g - 14);
      ctx.lineTo(34, g + 14);
      ctx.stroke();
    }

    ctx.strokeStyle = '#22D3EE';
    ctx.beginPath();
    ctx.moveTo(-125, 0);
    ctx.lineTo(-48, 0);
    ctx.stroke();

    [-28, 0, 28].forEach((dy, i) => {
      ctx.strokeStyle = i === 1 ? '#34D399' : '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(125, dy);
      ctx.stroke();
    });
  } else {
    // Chip / Waveguide / Metalens stacked plates
    for (let layer = 0; layer < 3; layer++) {
      const ly = 26 - layer * (28 + explodeFactor * 16);
      ctx.fillStyle = layer === 1 ? 'rgba(6, 182, 212, 0.22)' : '#1E293B';
      ctx.strokeStyle = layer === 1 ? '#22D3EE' : '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-95, ly, 190, 16);
      ctx.strokeRect(-95, ly, 190, 16);
    }

    for (let p = 0; p < 3; p++) {
      const t = (elapsed * 0.8 + p * 0.33) % 1;
      ctx.fillStyle = p % 2 === 0 ? '#22D3EE' : '#FBBF24';
      ctx.beginPath();
      ctx.arc(-95 + t * 190, 6 + (p - 1) * 14, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Right Side: Animated Scientist Robot Dr. Photon
  const robX = width * 0.76;
  const bob = Math.sin(elapsed * 2.2) * 5;
  const robY = floorY - 125 + bob;
  ctx.save();
  ctx.translate(robX, robY);

  // Pedestal
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-34, 112 - bob, 68, 12);

  // Body / Lab coat
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-28, 22, 56, 68, 10);
  ctx.fill();
  ctx.stroke();

  // Chest photonic core
  ctx.fillStyle = robotPose === 'eureka' ? '#34D399' : '#06B6D4';
  ctx.beginPath();
  ctx.arc(0, 50, 9, 0, Math.PI * 2);
  ctx.fill();

  // Head + Visor
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.roundRect(-26, -30, 52, 42, 8);
  ctx.fill();

  ctx.fillStyle = '#050A14';
  ctx.beginPath();
  ctx.roundRect(-21, -22, 42, 26, 5);
  ctx.fill();

  // Expressive Eyes
  const eyeColor =
    robotPose === 'bottleneck' || robotPose === 'caution'
      ? '#F59E0B'
      : robotPose === 'eureka'
        ? '#34D399'
        : '#22D3EE';
  ctx.fillStyle = eyeColor;
  const blink = elapsed % 4 > 3.88 ? 2 : 7;
  ctx.fillRect(-13, -15, 7, blink);
  ctx.fillRect(6, -15, 7, blink);

  // Animated Left Arm + Laser Pointer toward apparatus
  const armWave = Math.sin(elapsed * 3.2) * 10;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-28, 34);
  ctx.lineTo(-68, 24 + armWave * 0.4);
  ctx.stroke();

  // Laser beam pointing to apparatus
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-72, 24 + armWave * 0.4);
  ctx.lineTo(appX - robX + 85, 22);
  ctx.stroke();

  // Right Arm Gesture
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(28, 34);
  ctx.lineTo(54, robotPose === 'welcome' || robotPose === 'eureka' ? 6 + armWave : 48 + armWave * 0.5);
  ctx.stroke();

  ctx.restore();
}
