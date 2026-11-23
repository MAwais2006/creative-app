import * as THREE from 'three';
import { RobotPoseKind } from '../types/presentation';

export interface ScientistRobotRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  mouthBars: THREE.Mesh[];
  chestCore: THREE.Mesh;
  laserBeam: THREE.Mesh;
  gyroRing: THREE.Mesh;
  eyeMaterial: THREE.MeshStandardMaterial;
}

export function createScientistRobot3D(isSoftwareGl: boolean): ScientistRobotRig {
  const root = new THREE.Group();

  // Calibrated PBR Materials (roughness delta >= 0.25 between adjacent parts)
  const ceramicWhite = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.32,
    metalness: 0.12,
  });
  const labCoatMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.72,
    metalness: 0.04,
  });
  const titaniumDark = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.58,
    metalness: 0.82,
  });
  const brushedBrass = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.28,
    metalness: 0.9,
  });
  const visorGlass = new THREE.MeshPhysicalMaterial({
    color: 0x050a14,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.1,
  });
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.8,
    roughness: 0.25,
    metalness: 0.2,
  });

  // 1. Pedestal & Hover Gyro Base (sits flush at y = 0)
  const basePlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.65, 0.12, 32),
    titaniumDark
  );
  basePlate.position.y = 0.06;
  basePlate.receiveShadow = !isSoftwareGl;
  basePlate.castShadow = !isSoftwareGl;
  root.add(basePlate);

  const gyroRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.032, 16, 48),
    eyeMaterial
  );
  gyroRing.rotation.x = Math.PI / 2;
  gyroRing.position.y = 0.22;
  root.add(gyroRing);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.34;
  root.add(bodyGroup);

  // Lower stem & waist
  const waist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.12, 0.28, 24),
    titaniumDark
  );
  waist.position.y = 0.14;
  waist.castShadow = !isSoftwareGl;
  bodyGroup.add(waist);

  // 2. Torso + Lab Coat Silhouette
  const torsoInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.22, 0.62, 24),
    titaniumDark
  );
  torsoInner.position.y = 0.56;
  torsoInner.castShadow = !isSoftwareGl;
  bodyGroup.add(torsoInner);

  const labCoatTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.38, 0.58, 24, 1, false, 0.35, Math.PI * 1.78),
    labCoatMat
  );
  labCoatTorso.position.y = 0.52;
  labCoatTorso.rotation.y = Math.PI * 0.61;
  labCoatTorso.castShadow = !isSoftwareGl;
  bodyGroup.add(labCoatTorso);

  // Lab coat lapels
  [-1, 1].forEach((side) => {
    const lapel = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.36, 0.04),
      ceramicWhite
    );
    lapel.position.set(side * 0.13, 0.66, 0.28);
    lapel.rotation.z = side * -0.24;
    lapel.rotation.y = side * 0.2;
    bodyGroup.add(lapel);
  });

  // Glowing Photonic Core Emblem on chest
  const coreHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.05, 24),
    brushedBrass
  );
  coreHousing.rotation.x = Math.PI / 2;
  coreHousing.position.set(0, 0.6, 0.31);
  bodyGroup.add(coreHousing);

  const chestCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 20, 16),
    coreMaterial
  );
  chestCore.scale.set(1, 1, 0.55);
  chestCore.position.set(0, 0.6, 0.33);
  bodyGroup.add(chestCore);

  // Neck joint
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.16, 20),
    titaniumDark
  );
  neck.position.y = 0.92;
  bodyGroup.add(neck);

  // 3. Articulated Head & Expressive Face
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.04, 0);
  bodyGroup.add(headGroup);

  const headShell = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.4, 0.44),
    ceramicWhite
  );
  headShell.position.y = 0.2;
  headShell.castShadow = !isSoftwareGl;
  headGroup.add(headShell);

  // Rounded dome top
  const dome = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.27, 0.08, 24),
    ceramicWhite
  );
  dome.position.y = 0.42;
  headGroup.add(dome);

  // Lab Goggles / Visor Frame
  const goggleFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.26, 0.08),
    brushedBrass
  );
  goggleFrame.position.set(0, 0.22, 0.21);
  headGroup.add(goggleFrame);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.21, 0.06),
    visorGlass
  );
  visor.position.set(0, 0.22, 0.23);
  headGroup.add(visor);

  // Expressive Eyes
  const eyeGeo = new THREE.CapsuleGeometry(0.036, 0.035, 8, 12);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  leftEye.position.set(-0.11, 0.23, 0.265);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  rightEye.position.set(0.11, 0.23, 0.265);
  headGroup.add(rightEye);

  // Expressive Eyebrows
  const browGeo = new THREE.BoxGeometry(0.095, 0.018, 0.02);
  const leftBrow = new THREE.Mesh(browGeo, eyeMaterial);
  leftBrow.position.set(-0.11, 0.305, 0.268);
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, eyeMaterial);
  rightBrow.position.set(0.11, 0.305, 0.268);
  headGroup.add(rightBrow);

  // Animated Speech Waveform Mouth (5 equalizer bars)
  const mouthBars: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.028, 0.015),
      eyeMaterial
    );
    bar.position.set((i - 2) * 0.034, 0.145, 0.265);
    headGroup.add(bar);
    mouthBars.push(bar);
  }

  // Side Ear Comms & Lab Antennae
  [-1, 1].forEach((side) => {
    const earPod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16),
      titaniumDark
    );
    earPod.rotation.z = Math.PI / 2;
    earPod.position.set(side * 0.29, 0.21, 0);
    headGroup.add(earPod);

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.015, 0.18, 8),
      brushedBrass
    );
    antenna.position.set(side * 0.24, 0.36, -0.02);
    headGroup.add(antenna);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 12, 12),
      eyeMaterial
    );
    tip.position.set(side * 0.24, 0.46, -0.02);
    headGroup.add(tip);
  });

  // 4. Articulated Left & Right Arms + Hands
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.39, 0.82, 0);

    const shoulderBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 14),
      titaniumDark
    );
    shoulder.add(shoulderBall);

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.32, 16),
      labCoatMat
    );
    upperArm.position.y = -0.18;
    upperArm.castShadow = !isSoftwareGl;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.y = -0.36;
    shoulder.add(elbow);

    const elbowBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 14, 12),
      brushedBrass
    );
    elbow.add(elbowBall);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.048, 0.28, 16),
      ceramicWhite
    );
    forearm.position.y = -0.16;
    forearm.castShadow = !isSoftwareGl;
    elbow.add(forearm);

    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.1, 0.06),
      titaniumDark
    );
    hand.position.y = -0.33;
    elbow.add(hand);

    // Articulated fingers + thumb
    for (let f = -1; f <= 1; f++) {
      const finger = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.012, 0.045, 4, 8),
        ceramicWhite
      );
      finger.position.set(f * 0.024, -0.4, 0.01);
      elbow.add(finger);
    }

    bodyGroup.add(shoulder);
    return { shoulder, elbow };
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Add Laser Optical Pointer Wand to Robot's Left Hand (points across toward optical hardware on -X)
  const pointerWand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, 0.28, 12),
    brushedBrass
  );
  pointerWand.rotation.x = Math.PI / 2;
  pointerWand.position.set(0, -0.35, 0.16);
  leftArm.elbow.add(pointerWand);

  const laserBeamMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.65,
  });
  const laserBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 1.4, 8),
    laserBeamMat
  );
  laserBeam.rotation.x = Math.PI / 2;
  laserBeam.position.set(0, -0.35, 0.98);
  leftArm.elbow.add(laserBeam);

  return {
    root,
    bodyGroup,
    headGroup,
    leftShoulder: leftArm.shoulder,
    leftElbow: leftArm.elbow,
    rightShoulder: rightArm.shoulder,
    rightElbow: rightArm.elbow,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    mouthBars,
    chestCore,
    laserBeam,
    gyroRing,
    eyeMaterial,
  };
}

export function updateScientistRobot3D(
  rig: ScientistRobotRig,
  elapsed: number,
  delta: number,
  pose: RobotPoseKind,
  isSpeaking: boolean
): void {
  const dt = Math.min(delta, 0.05);
  const k = 7.5;

  // Hovering subtle idle motion
  rig.bodyGroup.position.y = 0.34 + Math.sin(elapsed * 2.1) * 0.028;
  rig.gyroRing.rotation.z = elapsed * 1.4;
  rig.gyroRing.position.y = 0.22 + Math.sin(elapsed * 2.1 + 0.6) * 0.015;

  // Determine target joint angles, facial expressions & eye tint per slide pose
  let headPitch = 0;
  let headYaw = -0.22; // Slightly angled toward viewer & optical hardware
  let headRoll = 0;

  let lShoulderX = -0.5;
  let lShoulderZ = -0.2;
  let lElbowX = -0.65;

  let rShoulderX = -0.2;
  let rShoulderZ = 0.22;
  let rElbowX = -0.45;

  let browOffsetY = 0;
  let browTilt = 0;
  let eyeScaleY = 1.0;
  let showLaser = true;
  let targetColorHex = 0x22d3ee;

  switch (pose) {
    case 'welcome':
      // Warm waving right hand + friendly arched brows
      headYaw = -0.1;
      headRoll = Math.sin(elapsed * 1.8) * 0.06;
      rShoulderX = -1.1;
      rShoulderZ = 0.85 + Math.sin(elapsed * 5.2) * 0.25;
      rElbowX = -0.75 + Math.cos(elapsed * 5.2) * 0.2;
      lShoulderX = -0.45;
      lShoulderZ = -0.2;
      lElbowX = -0.8;
      browOffsetY = 0.018;
      showLaser = false;
      targetColorHex = 0x22d3ee;
      break;

    case 'optics':
    case 'wdm':
    case 'mzi':
      // Pointing laser wand steadily at the optical apparatus while gesturing with right hand
      headYaw = -0.35 + Math.sin(elapsed * 1.2) * 0.08;
      headPitch = 0.08;
      lShoulderX = -1.05 + Math.sin(elapsed * 2.0) * 0.05;
      lShoulderZ = -0.38;
      lElbowX = -0.35;
      rShoulderX = -0.45 + Math.sin(elapsed * 3.1) * 0.14;
      rShoulderZ = 0.3 + Math.cos(elapsed * 2.6) * 0.08;
      rElbowX = -0.85 + Math.sin(elapsed * 3.1) * 0.15;
      browOffsetY = 0.008;
      showLaser = true;
      targetColorHex = pose === 'mzi' ? 0x38bdf8 : 0x22d3ee;
      break;

    case 'bottleneck':
    case 'caution':
      // Analytical / cautionary pose: slight head tilt, amber eyes, hand raised thoughtfully
      headYaw = -0.18;
      headRoll = 0.09;
      headPitch = 0.05;
      lShoulderX = -0.85;
      lShoulderZ = -0.25;
      lElbowX = -0.5;
      rShoulderX = -0.95;
      rShoulderZ = 0.12;
      rElbowX = -1.25 + Math.sin(elapsed * 2.4) * 0.08;
      browOffsetY = -0.012;
      browTilt = 0.22;
      eyeScaleY = 0.78;
      showLaser = pose === 'bottleneck';
      targetColorHex = 0xf59e0b;
      break;

    case 'crossbar':
    case 'diffractive':
    case 'metalens':
      // Lecturing / scanning motion sweeping laser pointer smoothly
      headYaw = -0.32 + Math.sin(elapsed * 1.6) * 0.14;
      lShoulderX = -0.98;
      lShoulderZ = -0.32 + Math.sin(elapsed * 1.6) * 0.18;
      lElbowX = -0.42;
      rShoulderX = -0.5 + Math.cos(elapsed * 2.8) * 0.18;
      rShoulderZ = 0.32;
      rElbowX = -0.75 + Math.sin(elapsed * 2.8) * 0.2;
      browOffsetY = 0.01;
      showLaser = true;
      targetColorHex = 0x22d3ee;
      break;

    case 'eureka':
      // Excited Eureka gesture! Both hands elevated expressively, bright cyan-gold eyes
      headYaw = -0.12 + Math.sin(elapsed * 2.4) * 0.12;
      headPitch = -0.08;
      lShoulderX = -1.35 + Math.sin(elapsed * 3.6) * 0.12;
      lShoulderZ = -0.55;
      lElbowX = -0.65;
      rShoulderX = -1.35 + Math.cos(elapsed * 3.6) * 0.12;
      rShoulderZ = 0.55;
      rElbowX = -0.65;
      browOffsetY = 0.026;
      browTilt = -0.14;
      eyeScaleY = 1.18;
      showLaser = true;
      targetColorHex = 0x34d399;
      break;
  }

  // Periodic natural eye blink every ~4 seconds
  const blinkCycle = elapsed % 4.2;
  const blinkFactor = blinkCycle > 4.05 ? 0.12 : 1.0;

  // Apply smooth exponential damping to joints
  rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, headPitch, k, dt);
  rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, headYaw, k, dt);
  rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, headRoll, k, dt);

  rig.leftShoulder.rotation.x = THREE.MathUtils.damp(rig.leftShoulder.rotation.x, lShoulderX, k, dt);
  rig.leftShoulder.rotation.z = THREE.MathUtils.damp(rig.leftShoulder.rotation.z, lShoulderZ, k, dt);
  rig.leftElbow.rotation.x = THREE.MathUtils.damp(rig.leftElbow.rotation.x, lElbowX, k, dt);

  rig.rightShoulder.rotation.x = THREE.MathUtils.damp(rig.rightShoulder.rotation.x, rShoulderX, k, dt);
  rig.rightShoulder.rotation.z = THREE.MathUtils.damp(rig.rightShoulder.rotation.z, rShoulderZ, k, dt);
  rig.rightElbow.rotation.x = THREE.MathUtils.damp(rig.rightElbow.rotation.x, rElbowX, k, dt);

  // Expressive Eyes & Brows
  const finalEyeScale = eyeScaleY * blinkFactor;
  rig.leftEye.scale.y = THREE.MathUtils.damp(rig.leftEye.scale.y, finalEyeScale, 16, dt);
  rig.rightEye.scale.y = THREE.MathUtils.damp(rig.rightEye.scale.y, finalEyeScale, 16, dt);

  rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, 0.305 + browOffsetY, 10, dt);
  rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, 0.305 + browOffsetY, 10, dt);
  rig.leftBrow.rotation.z = THREE.MathUtils.damp(rig.leftBrow.rotation.z, -browTilt, 10, dt);
  rig.rightBrow.rotation.z = THREE.MathUtils.damp(rig.rightBrow.rotation.z, browTilt, 10, dt);

  // Mouth equalizer animation (active during explanation / speech)
  const talkEnergy = isSpeaking ? 1.0 : 0.42;
  rig.mouthBars.forEach((bar, idx) => {
    const wave =
      0.35 +
      talkEnergy *
        (0.45 + 0.55 * Math.abs(Math.sin(elapsed * (isSpeaking ? 14 : 4.5) + idx * 1.1)));
    bar.scale.y = THREE.MathUtils.damp(bar.scale.y, wave, 18, dt);
  });

  // Laser beam visibility & pulse
  rig.laserBeam.visible = showLaser;
  if (showLaser) {
    const mat = rig.laserBeam.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.42 + 0.25 * Math.sin(elapsed * 8);
  }

  // Smoothly tint LED eyes & chest core
  const targetColor = new THREE.Color(targetColorHex);
  rig.eyeMaterial.color.lerp(targetColor, Math.min(1, dt * 6));
  rig.eyeMaterial.emissive.lerp(targetColor, Math.min(1, dt * 6));
}
