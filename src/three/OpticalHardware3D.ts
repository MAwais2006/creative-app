import * as THREE from 'three';
import { Hardware3DKind } from '../types/presentation';

interface PulseParticle {
  mesh: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
  speed: number;
  offset: number;
}

interface ExplodablePart {
  obj: THREE.Object3D;
  basePos: THREE.Vector3;
  explodeOffset: THREE.Vector3;
}

export interface OpticalHardwareRig {
  root: THREE.Group;
  kind: Hardware3DKind;
  pulses: PulseParticle[];
  explodables: ExplodablePart[];
  rotators: { obj: THREE.Object3D; speedY: number; speedX?: number }[];
}

export function buildOpticalHardware3D(
  kind: Hardware3DKind,
  isSoftwareGl: boolean
): OpticalHardwareRig {
  const root = new THREE.Group();
  const pulses: PulseParticle[] = [];
  const explodables: ExplodablePart[] = [];
  const rotators: { obj: THREE.Object3D; speedY: number; speedX?: number }[] = [];

  const registerExplode = (obj: THREE.Object3D, offset: THREE.Vector3) => {
    explodables.push({
      obj,
      basePos: obj.position.clone(),
      explodeOffset: offset,
    });
  };

  const addPulse = (
    parent: THREE.Group,
    start: THREE.Vector3,
    end: THREE.Vector3,
    colorHex: number,
    speed = 0.85,
    offset = 0,
    radius = 0.04
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 12, 12),
      new THREE.MeshBasicMaterial({ color: colorHex })
    );
    mesh.position.copy(start);
    parent.add(mesh);
    pulses.push({ mesh, start, end, speed, offset });
  };

  const addBeam = (
    parent: THREE.Group,
    start: THREE.Vector3,
    end: THREE.Vector3,
    colorHex: number,
    radius = 0.018,
    opacity = 0.85
  ) => {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const geom = new THREE.CylinderGeometry(radius, radius, len, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: opacity < 1,
      opacity,
    });
    const beam = new THREE.Mesh(geom, mat);
    beam.position.copy(mid);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    parent.add(beam);
    return beam;
  };

  // Shared calibrated optical materials
  const anodizedBase = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.62,
    metalness: 0.78,
  });
  const sapphireSubstrate = new THREE.MeshStandardMaterial({
    color: 0x0b162c,
    roughness: 0.18,
    metalness: 0.35,
  });
  const goldElectrode = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.22,
    metalness: 0.94,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    emissive: 0x9a3412,
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.88,
  });
  const siliconMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.28,
    metalness: 0.85,
  });
  const opticalGlass = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.05,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.88,
    transparent: true,
    opacity: isSoftwareGl ? 0.42 : 0.95,
    ior: 1.55,
    thickness: 0.9,
    clearcoat: 1.0,
  });
  const crystalLiNbO3 = new THREE.MeshPhysicalMaterial({
    color: 0x67e8f9,
    roughness: 0.06,
    metalness: 0.05,
    transmission: isSoftwareGl ? 0 : 0.86,
    transparent: true,
    opacity: isSoftwareGl ? 0.48 : 0.92,
    ior: 2.2,
    thickness: 1.2,
    clearcoat: 1.0,
  });

  // Grounded lab plinth at y = 0
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.14, 1.8),
    anodizedBase
  );
  plinth.position.y = 0.07;
  plinth.receiveShadow = !isSoftwareGl;
  plinth.castShadow = !isSoftwareGl;
  root.add(plinth);

  const stage = new THREE.Group();
  stage.position.y = 0.14;
  root.add(stage);

  switch (kind) {
    case 'prism-bench': {
      // Laser Emitter Housing
      const emitter = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.26, 0.28),
        siliconMat
      );
      emitter.position.set(-0.95, 0.45, 0);
      emitter.castShadow = !isSoftwareGl;
      stage.add(emitter);

      // Triangular Glass Prism
      const prism = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.65, 3),
        opticalGlass
      );
      prism.position.set(-0.08, 0.48, 0);
      prism.rotation.y = Math.PI / 6;
      prism.castShadow = !isSoftwareGl;
      stage.add(prism);
      registerExplode(prism, new THREE.Vector3(0, 0.45, 0));
      rotators.push({ obj: prism, speedY: 0.25 });

      // Incoming white/cyan laser beam -> refracted rainbow spectrum
      const inStart = new THREE.Vector3(-0.72, 0.45, 0);
      const prismHit = new THREE.Vector3(-0.22, 0.45, 0);
      addBeam(stage, inStart, prismHit, 0xe0f2fe, 0.025, 0.95);
      addPulse(stage, inStart, prismHit, 0xffffff, 1.0, 0, 0.045);

      const spectralColors = [0x22d3ee, 0x38bdf8, 0x34d399, 0xfbbf24, 0xf87171];
      spectralColors.forEach((col, i) => {
        const yOff = 0.28 + i * 0.095;
        const zOff = (i - 2) * 0.18;
        const target = new THREE.Vector3(1.05, yOff, zOff);
        addBeam(stage, new THREE.Vector3(0.1, 0.45, 0), target, col, 0.015, 0.85);
        addPulse(stage, new THREE.Vector3(0.1, 0.45, 0), target, col, 0.9, i * 0.2, 0.036);

        // Detector diode pads
        const pad = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.12),
          goldElectrode
        );
        pad.position.copy(target);
        stage.add(pad);
        registerExplode(pad, new THREE.Vector3(0.3, 0, zOff * 0.4));
      });
      break;
    }

    case 'snell-waveguide': {
      // Lower silica cladding slab + upper silicon core waveguide
      const cladding = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.18, 0.9),
        opticalGlass
      );
      cladding.position.set(0, 0.16, 0);
      stage.add(cladding);

      const core = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.2, 0.26),
        new THREE.MeshPhysicalMaterial({
          color: 0x0ea5e9,
          roughness: 0.08,
          metalness: 0.1,
          transmission: isSoftwareGl ? 0 : 0.72,
          transparent: true,
          opacity: 0.78,
        })
      );
      core.position.set(0, 0.36, 0);
      stage.add(core);
      registerExplode(core, new THREE.Vector3(0, 0.38, 0));

      // Zig-zag Total Internal Reflection ray path inside core
      const pts = [
        new THREE.Vector3(-1.05, 0.36, 0),
        new THREE.Vector3(-0.55, 0.45, 0),
        new THREE.Vector3(0.0, 0.27, 0),
        new THREE.Vector3(0.55, 0.45, 0),
        new THREE.Vector3(1.05, 0.34, 0),
      ];
      for (let i = 0; i < pts.length - 1; i++) {
        addBeam(stage, pts[i], pts[i + 1], 0x22d3ee, 0.016, 0.95);
        addPulse(stage, pts[i], pts[i + 1], 0xfbbf24, 1.25, i * 0.25, 0.035);
      }

      // Snell's Law normal reference markers at bounce points
      [-0.55, 0.55].forEach((bx) => {
        const normalBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8),
          goldElectrode
        );
        normalBar.position.set(bx, 0.45, 0);
        stage.add(normalBar);
      });
      break;
    }

    case 'copper-vs-optics': {
      // Left side: Hot glowing copper PCB traces with resistive loss
      const pcb = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.12, 1.35),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.3 })
      );
      pcb.position.set(-0.62, 0.12, 0);
      stage.add(pcb);

      for (let i = 0; i < 4; i++) {
        const z = -0.42 + i * 0.28;
        const trace = new THREE.Mesh(
          new THREE.BoxGeometry(0.92, 0.05, 0.07),
          copperMat
        );
        trace.position.set(-0.62, 0.21, z);
        stage.add(trace);
        registerExplode(trace, new THREE.Vector3(-0.2, 0.3, 0));
        addPulse(
          stage,
          new THREE.Vector3(-1.05, 0.25, z),
          new THREE.Vector3(-0.18, 0.25, z),
          0xf97316,
          0.45,
          i * 0.2,
          0.032
        );
      }

      // Right side: Cool silicon nitride photonic waveguides
      const wafer = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.12, 1.35),
        sapphireSubstrate
      );
      wafer.position.set(0.62, 0.12, 0);
      stage.add(wafer);

      for (let i = 0; i < 4; i++) {
        const z = -0.42 + i * 0.28;
        const wg = new THREE.Mesh(
          new THREE.BoxGeometry(0.92, 0.03, 0.035),
          opticalGlass
        );
        wg.position.set(0.62, 0.21, z);
        stage.add(wg);
        registerExplode(wg, new THREE.Vector3(0.2, 0.3, 0));
        addBeam(
          stage,
          new THREE.Vector3(0.18, 0.23, z),
          new THREE.Vector3(1.05, 0.23, z),
          0x22d3ee,
          0.012,
          0.9
        );
        addPulse(
          stage,
          new THREE.Vector3(0.18, 0.23, z),
          new THREE.Vector3(1.05, 0.23, z),
          0x67e8f9,
          1.6,
          i * 0.18,
          0.03
        );
      }
      break;
    }

    case 'wdm-chip': {
      const chip = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.12, 1.35),
        sapphireSubstrate
      );
      chip.position.y = 0.1;
      stage.add(chip);

      // Shared central bus waveguide
      addBeam(
        stage,
        new THREE.Vector3(-1.05, 0.2, 0),
        new THREE.Vector3(1.05, 0.2, 0),
        0x38bdf8,
        0.024,
        0.9
      );

      const colors = [0x22d3ee, 0x818cf8, 0x34d399, 0xfbbf24];
      colors.forEach((col, idx) => {
        const x = -0.66 + idx * 0.44;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.14, 0.022, 14, 36),
          new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.7,
            roughness: 0.2,
            metalness: 0.4,
          })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, 0.21, 0.24);
        stage.add(ring);
        registerExplode(ring, new THREE.Vector3(0, 0.32 + idx * 0.08, 0.15));

        addPulse(
          stage,
          new THREE.Vector3(-1.05, 0.2, 0),
          new THREE.Vector3(1.05, 0.2, 0),
          col,
          1.1 + idx * 0.12,
          idx * 0.25,
          0.035
        );
      });
      break;
    }

    case 'mzi-chip': {
      const die = new THREE.Mesh(
        new THREE.BoxGeometry(2.25, 0.14, 1.45),
        sapphireSubstrate
      );
      die.position.y = 0.1;
      stage.add(die);

      // Dual MZI waveguide arms + 50:50 couplers + golden thermal phase-shifter heaters
      const zPorts = [-0.28, 0.28];
      zPorts.forEach((z, idx) => {
        addBeam(
          stage,
          new THREE.Vector3(-1.05, 0.2, z),
          new THREE.Vector3(1.05, 0.2, z),
          idx === 0 ? 0x22d3ee : 0xfbbf24,
          0.018,
          0.9
        );
        addPulse(
          stage,
          new THREE.Vector3(-1.05, 0.2, z),
          new THREE.Vector3(1.05, 0.2, z),
          idx === 0 ? 0x67e8f9 : 0xfcd34d,
          1.05,
          idx * 0.4,
          0.038
        );
      });

      // Directional coupler bridges
      [-0.42, 0.42].forEach((cx) => {
        const coupler = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.06, 0.64),
          opticalGlass
        );
        coupler.position.set(cx, 0.2, 0);
        stage.add(coupler);
        registerExplode(coupler, new THREE.Vector3(0, 0.32, 0));
      });

      // Golden thermal phase-shifter electrodes
      [-0.78, 0.0].forEach((hx, idx) => {
        const heater = new THREE.Mesh(
          new THREE.BoxGeometry(0.26, 0.07, 0.16),
          goldElectrode
        );
        heater.position.set(hx, 0.22, idx === 0 ? 0.28 : -0.28);
        stage.add(heater);
        registerExplode(heater, new THREE.Vector3(0, 0.52, 0));
      });
      break;
    }

    case 'crossbar-tower': {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.12, 1.5),
        sapphireSubstrate
      );
      base.position.y = 0.1;
      stage.add(base);

      // 3x3 WDM Crossbar waveguides & 9 microring resonators
      for (let r = 0; r < 3; r++) {
        const z = (r - 1) * 0.42;
        addBeam(
          stage,
          new THREE.Vector3(-0.95, 0.24, z),
          new THREE.Vector3(0.95, 0.24, z),
          0x22d3ee,
          0.014,
          0.75
        );
        // Balanced photodiode at end of row
        const pd = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.14, 0.18),
          goldElectrode
        );
        pd.position.set(0.96, 0.24, z);
        stage.add(pd);
      }

      for (let c = 0; c < 3; c++) {
        const x = (c - 1) * 0.48;
        addBeam(
          stage,
          new THREE.Vector3(x, 0.24, -0.66),
          new THREE.Vector3(x, 0.24, 0.66),
          0xfbbf24,
          0.014,
          0.75
        );
        addPulse(
          stage,
          new THREE.Vector3(x, 0.24, -0.66),
          new THREE.Vector3(x, 0.24, 0.66),
          0xfcd34d,
          1.1,
          c * 0.3,
          0.032
        );

        for (let r = 0; r < 3; r++) {
          const z = (r - 1) * 0.42;
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.11, 0.018, 12, 28),
            goldElectrode
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.set(x + 0.13, 0.26, z + 0.13);
          stage.add(ring);
          registerExplode(ring, new THREE.Vector3(0, 0.25 + (r + c) * 0.06, 0));
        }
      }
      break;
    }

    case 'd2nn-tower': {
      // Laser source on left, 3 diffractive phase plates, detector array on right
      const laser = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.36, 20),
        siliconMat
      );
      laser.rotation.z = Math.PI / 2;
      laser.position.set(-0.98, 0.52, 0);
      stage.add(laser);

      const plateXs = [-0.45, 0.0, 0.45];
      plateXs.forEach((px, idx) => {
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.88, 0.96),
          opticalGlass
        );
        frame.position.set(px, 0.56, 0);
        stage.add(frame);
        registerExplode(frame, new THREE.Vector3((idx - 1) * 0.28, 0.28, 0));

        // Etched phase-mask ribs
        for (let k = -2; k <= 2; k++) {
          const rib = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.1, 0.12),
            new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.45,
              roughness: 0.2,
            })
          );
          rib.position.set(px, 0.56 + k * 0.15, ((idx + k) % 3) * 0.22 - 0.15);
          stage.add(rib);
        }
      });

      // Focusing diffractive rays
      [-0.22, 0, 0.22].forEach((z0, idx) => {
        const start = new THREE.Vector3(-0.8, 0.52, z0 * 0.5);
        const focus = new THREE.Vector3(0.95, 0.56, 0.18);
        addBeam(stage, start, focus, 0x22d3ee, 0.014, 0.68);
        addPulse(stage, start, focus, 0x67e8f9, 1.0, idx * 0.25, 0.036);
      });

      // Detector array plate
      const det = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.82, 0.88),
        anodizedBase
      );
      det.position.set(0.98, 0.56, 0);
      stage.add(det);

      const activeBin = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.16, 0.16),
        goldElectrode
      );
      activeBin.position.set(0.97, 0.56, 0.18);
      stage.add(activeBin);
      break;
    }

    case 'metalens-stack': {
      // Planar Metalens glass disc + TiO2 nanopillars focusing light onto CMOS sensor die
      const lensWafer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 0.06, 36),
        opticalGlass
      );
      lensWafer.rotation.z = Math.PI / 2;
      lensWafer.position.set(-0.32, 0.62, 0);
      stage.add(lensWafer);
      registerExplode(lensWafer, new THREE.Vector3(-0.35, 0.25, 0));

      // Nanopillar ring array on front face of metalens
      for (let a = 0; a < 10; a++) {
        const ang = (a / 10) * Math.PI * 2;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 0.12, 10),
          goldElectrode
        );
        pillar.rotation.z = Math.PI / 2;
        pillar.position.set(-0.24, 0.62 + Math.sin(ang) * 0.36, Math.cos(ang) * 0.36);
        stage.add(pillar);
        registerExplode(pillar, new THREE.Vector3(-0.2, 0.25, 0));
      }

      // CMOS Sensor Die on right
      const cmos = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.72, 0.72),
        siliconMat
      );
      cmos.position.set(0.72, 0.62, 0);
      stage.add(cmos);
      registerExplode(cmos, new THREE.Vector3(0.35, 0.25, 0));

      const pixelGrid = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.52, 0.52),
        new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          emissive: 0x0369a1,
          emissiveIntensity: 0.4,
          roughness: 0.18,
          metalness: 0.85,
        })
      );
      pixelGrid.position.set(0.65, 0.62, 0);
      stage.add(pixelGrid);

      // Collimated rays converging onto CMOS focal spot
      const offsets = [
        [0.42, 0],
        [-0.42, 0],
        [0, 0.42],
        [0, -0.42],
      ];
      offsets.forEach(([dy, dz], idx) => {
        const pIn = new THREE.Vector3(-1.05, 0.62 + dy, dz);
        const pLens = new THREE.Vector3(-0.28, 0.62 + dy, dz);
        const pFocus = new THREE.Vector3(0.64, 0.62, 0);
        addBeam(stage, pIn, pLens, 0x38bdf8, 0.013, 0.8);
        addBeam(stage, pLens, pFocus, 0xfbbf24, 0.013, 0.85);
        addPulse(stage, pLens, pFocus, 0xfcd34d, 1.15, idx * 0.22, 0.032);
      });
      break;
    }

    case 'cpo-stack': {
      // 3D Co-Packaged Optics Stack: Substrate -> Photonic Interposer -> CMOS Compute + HBM
      const organicSub = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.14, 1.4),
        anodizedBase
      );
      organicSub.position.y = 0.12;
      stage.add(organicSub);

      const photonicInterposer = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.12, 1.15),
        new THREE.MeshStandardMaterial({
          color: 0x0891b2,
          emissive: 0x0e7490,
          emissiveIntensity: 0.35,
          roughness: 0.25,
          metalness: 0.7,
        })
      );
      photonicInterposer.position.y = 0.28;
      stage.add(photonicInterposer);
      registerExplode(photonicInterposer, new THREE.Vector3(0, 0.25, 0));

      // Top CMOS GPU Compute Die + Flanking HBM3e Stacks
      const cmosDie = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.16, 0.72),
        siliconMat
      );
      cmosDie.position.set(0, 0.46, 0);
      stage.add(cmosDie);
      registerExplode(cmosDie, new THREE.Vector3(0, 0.62, 0));

      [-0.62, 0.62].forEach((hx) => {
        const hbm = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.22, 0.56),
          goldElectrode
        );
        hbm.position.set(hx, 0.49, 0);
        stage.add(hbm);
        registerExplode(hbm, new THREE.Vector3(hx * 0.25, 0.62, 0));
      });

      // Fiber ribbons exiting photonic interposer edge
      [-0.3, 0, 0.3].forEach((fz, idx) => {
        addBeam(
          stage,
          new THREE.Vector3(-1.15, 0.28, fz),
          new THREE.Vector3(-0.82, 0.28, fz),
          0x22d3ee,
          0.02,
          0.95
        );
        addPulse(
          stage,
          new THREE.Vector3(-1.15, 0.28, fz),
          new THREE.Vector3(-0.82, 0.28, fz),
          0x67e8f9,
          1.3,
          idx * 0.25,
          0.032
        );
      });
      break;
    }

    case 'holographic-cache': {
      // Novel Invention: Fe:LiNbO3 Photorefractive Crystal Cube in Brass Gimbal + Angular Bragg Laser Array
      const gimbalRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.03, 14, 48),
        brushedBrass(goldElectrode)
      );
      gimbalRing.position.set(0, 0.64, 0);
      stage.add(gimbalRing);
      rotators.push({ obj: gimbalRing, speedY: 0.35 });

      const crystal = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.68, 0.68),
        crystalLiNbO3
      );
      crystal.position.set(0, 0.64, 0);
      stage.add(crystal);
      registerExplode(crystal, new THREE.Vector3(0, 0.38, 0));
      rotators.push({ obj: crystal, speedY: 0.18 });

      // Internal Bragg Hologram Interference Planes inside crystal
      for (let p = -1; p <= 1; p++) {
        const gratingPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(0.52, 0.52),
          new THREE.MeshBasicMaterial({
            color: p === 0 ? 0x22d3ee : 0xfbbf24,
            transparent: true,
            opacity: 0.32,
            side: THREE.DoubleSide,
          })
        );
        gratingPlane.position.set(0, 0.64, p * 0.14);
        gratingPlane.rotation.y = p * 0.25;
        stage.add(gratingPlane);
      }

      // Angularly steered Query Beam -> Diffracted Top-k Sparse Beams to Photodiode Array
      const qOrigin = new THREE.Vector3(-1.05, 0.64, 0.22);
      const crystalCenter = new THREE.Vector3(0, 0.64, 0);
      addBeam(stage, qOrigin, crystalCenter, 0x22d3ee, 0.022, 0.95);
      addPulse(stage, qOrigin, crystalCenter, 0xffffff, 1.2, 0, 0.042);

      // Top-k Bragg diffraction readout beams
      const targets = [
        new THREE.Vector3(0.98, 0.88, -0.35),
        new THREE.Vector3(0.98, 0.64, 0.0),
        new THREE.Vector3(0.98, 0.4, 0.35),
      ];
      targets.forEach((t, idx) => {
        const col = idx === 1 ? 0x34d399 : 0xfbbf24;
        addBeam(stage, crystalCenter, t, col, idx === 1 ? 0.022 : 0.012, 0.88);
        addPulse(stage, crystalCenter, t, col, 1.3, idx * 0.25, 0.034);

        const pd = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.14, 0.14),
          idx === 1 ? goldElectrode : siliconMat
        );
        pd.position.copy(t);
        stage.add(pd);
        registerExplode(pd, new THREE.Vector3(0.28, 0, 0));
      });
      break;
    }
  }

  return { root, kind, pulses, explodables, rotators };
}

function brushedBrass(base: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  return base;
}

const _tmpVec = new THREE.Vector3();

export function updateOpticalHardware3D(
  rig: OpticalHardwareRig,
  elapsed: number,
  delta: number,
  explodeFactor: number
): void {
  const dt = Math.min(delta, 0.05);

  // Smooth exploded-view separation
  for (const item of rig.explodables) {
    _tmpVec
      .copy(item.basePos)
      .addScaledVector(item.explodeOffset, explodeFactor);
    item.obj.position.lerp(_tmpVec, Math.min(1, dt * 8));
  }

  // Gentle rotations on prisms/crystals/gimbals
  for (const r of rig.rotators) {
    r.obj.rotation.y += r.speedY * dt;
  }

  // Propagate photon pulse spheres along optical waveguides & free-space rays
  for (const p of rig.pulses) {
    const t = (elapsed * p.speed + p.offset) % 1;
    p.mesh.position.lerpVectors(p.start, p.end, t);
  }
}
