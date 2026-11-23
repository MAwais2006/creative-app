import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import * as THREE from 'three';
import { SLIDES } from '../data/slides';
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
  updateScientistRobot3D,
} from '../three/ScientistRobot3D';
import {
  buildOpticalHardware3D,
  updateOpticalHardware3D,
} from '../three/OpticalHardware3D';

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function captureFallback2DSnapshots(
  width: number,
  height: number,
  onProgress?: (pct: number, label: string) => void
): Record<string, string> {
  const snapshots: Record<string, string> = {};
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return snapshots;

  SLIDES.forEach((slide, idx) => {
    onProgress?.(
      Math.round(((idx + 1) / (SLIDES.length + 2)) * 75),
      `Rendering Apparatus & Scientist Robot (Slide ${slide.number})...`
    );
    drawFallbackOpticalScene2D(
      ctx,
      width,
      height,
      slide.hardware3D,
      slide.robotPose,
      1.3 + idx * 0.45,
      0.12
    );
    snapshots[slide.id] = canvas.toDataURL('image/png');
  });

  return snapshots;
}

function captureAllSlide3DRenders(
  onProgress?: (pct: number, label: string) => void
): Record<string, string> {
  const snapshots: Record<string, string> = {};
  const width = 840;
  const height = 560;

  const probeCanvas = document.createElement('canvas');
  const gl =
    probeCanvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    }) ||
    probeCanvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });

  if (!gl) {
    return captureFallback2DSnapshots(width, height, onProgress);
  }

  const isSoftwareGl = isContextSoftwareGl(gl);
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: probeCanvas,
      context: gl,
      antialias: !isSoftwareGl,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return captureFallback2DSnapshots(width, height, onProgress);
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090d16);
  scene.fog = new THREE.FogExp2(0x090d16, 0.055);

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 40);
  camera.position.set(0.35, 2.25, 4.45);
  camera.lookAt(0.15, 0.65, 0);

  const envTex = createStudioEnvironment(renderer, scene);
  createStudioLights(scene, isSoftwareGl);

  const benchTex = createOpticalBenchTexture();
  const benchMat = new THREE.MeshStandardMaterial({
    map: benchTex,
    roughness: 0.72,
    metalness: 0.35,
  });
  const bench = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), benchMat);
  bench.rotation.x = -Math.PI / 2;
  bench.position.y = -0.005;
  scene.add(bench);

  const robotRig = createScientistRobot3D(isSoftwareGl);
  robotRig.root.position.set(1.38, 0, 0.16);
  robotRig.root.rotation.y = -0.44;
  scene.add(robotRig.root);

  SLIDES.forEach((slide, idx) => {
    onProgress?.(
      Math.round(((idx + 1) / (SLIDES.length + 2)) * 75),
      `Rendering 3D Apparatus & Scientist Robot (Slide ${slide.number})...`
    );

    const hw = buildOpticalHardware3D(slide.hardware3D, isSoftwareGl);
    hw.root.position.set(-0.66, 0, 0);
    scene.add(hw.root);

    updateOpticalHardware3D(hw, 1.35 + idx * 0.4, 0.04, 0.12);
    for (let step = 0; step < 18; step++) {
      updateScientistRobot3D(robotRig, 1.2 + step * 0.05, 0.05, slide.robotPose, true);
    }

    renderer.render(scene, camera);
    snapshots[slide.id] = renderer.domElement.toDataURL('image/png');

    scene.remove(hw.root);
    disposeObject3D(hw.root);
  });

  disposeObject3D(robotRig.root);
  bench.geometry.dispose();
  benchMat.dispose();
  benchTex.dispose();
  envTex.dispose();
  renderer.dispose();

  return snapshots;
}

function collectShapeIds(slideXml: string): number[] {
  const ids: number[] = [];
  const regex = /<p:cNvPr\s+id="(\d+)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(slideXml)) !== null) {
    const id = Number(match[1]);
    // Skip root group id="1"
    if (id > 1) {
      ids.push(id);
    }
  }
  return Array.from(new Set(ids));
}

function buildSmoothTimingXml(shapeIds: number[]): string {
  if (shapeIds.length === 0) return '';
  // Skip first few persistent morph background shapes so they morph smoothly across slides,
  // and stagger smooth entrance animations on the slide's content & 3D gadget blocks
  const animatedIds = shapeIds.slice(0, 14);
  const childNodes = animatedIds
    .map((spid, index) => {
      const delayMs = index * 140;
      const nodeIdBase = 10 + index * 4;
      return `
        <p:par>
          <p:cTn id="${nodeIdBase}" fill="hold">
            <p:stCondLst><p:cond delay="${delayMs}"/></p:stCondLst>
            <p:childTnLst>
              <p:par>
                <p:cTn id="${nodeIdBase + 1}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold">
                  <p:stCondLst><p:cond delay="0"/></p:stCondLst>
                  <p:childTnLst>
                    <p:set>
                      <p:cBhvr>
                        <p:cTn id="${nodeIdBase + 2}" dur="1" fill="hold">
                          <p:stCondLst><p:cond delay="0"/></p:stCondLst>
                        </p:cTn>
                        <p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>
                        <p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst>
                      </p:cBhvr>
                      <p:to><p:strVal val="visible"/></p:to>
                    </p:set>
                    <p:animEffect transition="in" filter="fade">
                      <p:cBhvr>
                        <p:cTn id="${nodeIdBase + 3}" dur="480" fill="hold"/>
                        <p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>
                      </p:cBhvr>
                    </p:animEffect>
                  </p:childTnLst>
                </p:cTn>
              </p:par>
            </p:childTnLst>
          </p:cTn>
        </p:par>`;
    })
    .join('');

  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${childNodes}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
}

async function injectMorphAndAnimations(pptxBuffer: ArrayBuffer): Promise<Blob> {
  const zip = await JSZip.loadAsync(pptxBuffer);

  const morphBlock =
    `<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">` +
    `<mc:Choice Requires="p159"><p:transition spd="med" advClick="1"><p159:morph option="byObject"/></p:transition></mc:Choice>` +
    `<mc:Fallback><p:transition spd="med" advClick="1"><p:fade/></p:transition></mc:Fallback>` +
    `</mc:AlternateContent>`;

  const slideFiles = Object.keys(zip.files).filter((name) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(name)
  );

  for (const filename of slideFiles) {
    let xml = await zip.file(filename)!.async('string');

    // Add p159 + mc namespaces on <p:sld> if absent
    if (!xml.includes('xmlns:p159=')) {
      xml = xml.replace(
        '<p:sld ',
        '<p:sld xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="p159" '
      );
    }

    // Remove any existing transition/timing blocks before injecting Morph + Smooth Timing
    xml = xml.replace(/<p:transition[\s\S]*?<\/p:transition>/g, '');
    xml = xml.replace(/<p:timing[\s\S]*?<\/p:timing>/g, '');

    const shapeIds = collectShapeIds(xml);
    const timingXml = buildSmoothTimingXml(shapeIds);

    xml = xml.replace('</p:sld>', `${morphBlock}${timingXml}</p:sld>`);
    zip.file(filename, xml);
  }

  return await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
}

export async function exportPresentationPptx(
  onProgress?: (pct: number, label: string) => void
): Promise<void> {
  onProgress?.(5, 'Initializing 3D WebGL renderer for slide assets...');
  const snapshots3D = captureAllSlide3DRenders(onProgress);

  onProgress?.(80, 'Fetching high-resolution photonic hardware photography...');
  const heroPhotos: Record<string, string | null> = {
    '01': await fetchImageAsDataUrl('/src/assets/images/photonic_ai_wafer_hero_1795410684726.jpg'),
    '05': await fetchImageAsDataUrl('/src/assets/images/mzi_optical_waveguide_die_1795410684850.jpg'),
    '08': await fetchImageAsDataUrl('/src/assets/images/nanophotonic_metalens_sensor_1795410684828.jpg'),
  };

  onProgress?.(86, 'Assembling PowerPoint slides, 3D gadgets, and Morph anchors...');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333" x 7.5"
  pptx.author = 'Physics Lab · Optics in AI';
  pptx.title = 'How Optics Work in AI — Physics Lab Presentation';
  pptx.subject = 'Optics, Silicon Photonics, Optical Computing & Holographic AI Cache';

  const total = SLIDES.length;

  SLIDES.forEach((slideData, idx) => {
    const s = pptx.addSlide();
    s.background = { color: '070A11' };

    const isNovel = idx === total - 1;
    const accentHex = isNovel ? '34D399' : idx % 2 === 0 ? '06B6D4' : 'F59E0B';
    const progressW = ((idx + 1) / total) * 12.13;

    // 1. Shared Morph Anchors (named with !! so PowerPoint Morph smoothly transforms them across slides!)
    s.addShape(pptx.ShapeType.rect, {
      objectName: '!!morph-top-rail',
      x: 0.6,
      y: 0.34,
      w: 12.13,
      h: 0.04,
      fill: { color: '1E293B' },
    });

    s.addShape(pptx.ShapeType.rect, {
      objectName: '!!morph-progress-bar',
      x: 0.6,
      y: 0.34,
      w: progressW,
      h: 0.05,
      fill: { color: accentHex },
    });

    // Morphing 3D-styled geometric gadget (hexagon prism badge that shifts position/color smoothly)
    s.addShape(pptx.ShapeType.hexagon, {
      objectName: '!!morph-gadget-prism',
      x: 0.6 + (idx * 0.14),
      y: 0.52,
      w: 0.42,
      h: 0.38,
      fill: { color: '0E1726' },
      line: { color: accentHex, width: 1.5 },
      shadow: { type: 'outer', blur: 6, offset: 2, color: accentHex, opacity: 0.35 },
    });

    // Slide chapter & number header
    s.addText(`SLIDE ${slideData.number} / ${total}   ·   ${slideData.chapter.toUpperCase()}`, {
      x: 1.15 + (idx * 0.14),
      y: 0.53,
      w: 5.5,
      h: 0.35,
      fontFace: 'IBM Plex Mono',
      fontSize: 10,
      bold: true,
      color: accentHex,
    });

    // Main Slide Title
    s.addText(slideData.title, {
      x: 0.6,
      y: 1.02,
      w: 6.0,
      h: 0.9,
      fontFace: 'Arial',
      fontSize: 24,
      bold: true,
      color: 'F8FAFC',
      valign: 'top',
    });

    // Subtitle
    s.addText(slideData.subtitle, {
      x: 0.6,
      y: 1.92,
      w: 5.9,
      h: 0.72,
      fontFace: 'Arial',
      fontSize: 12,
      color: 'CBD5E1',
      valign: 'top',
    });

    // Physics Equation Strip (2D optical gadget box)
    if (slideData.equation) {
      s.addShape(pptx.ShapeType.roundRect, {
        objectName: '!!morph-equation-box',
        x: 0.6,
        y: 2.72,
        w: 5.85,
        h: 0.46,
        rectRadius: 0.08,
        fill: { color: '0D1524' },
        line: { color: '1E293B', width: 1 },
      });
      s.addText(slideData.equation, {
        x: 0.75,
        y: 2.76,
        w: 5.55,
        h: 0.38,
        fontFace: 'Courier New',
        fontSize: 10.5,
        bold: true,
        color: '67E8F9',
        valign: 'middle',
      });
    }

    // Key Points Cards with 2D Geometric Optical Icons
    slideData.keyPoints.forEach((kp, kIdx) => {
      const cardY = 3.34 + kIdx * 0.98;
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: cardY,
        w: 5.85,
        h: 0.86,
        rectRadius: 0.06,
        fill: { color: '0B101B' },
        line: { color: '1E293B', width: 1 },
      });

      // Small geometric 2D icon marker per point
      const iconShape =
        kIdx === 0
          ? pptx.ShapeType.diamond
          : kIdx === 1
            ? pptx.ShapeType.ellipse
            : pptx.ShapeType.triangle;
      s.addShape(iconShape, {
        x: 0.78,
        y: cardY + 0.16,
        w: 0.18,
        h: 0.18,
        fill: { color: accentHex },
      });

      s.addText(kp.label, {
        x: 1.08,
        y: cardY + 0.08,
        w: 5.2,
        h: 0.28,
        fontFace: 'Arial',
        fontSize: 11.5,
        bold: true,
        color: 'F1F5F9',
      });

      s.addText(kp.detail, {
        x: 1.08,
        y: cardY + 0.34,
        w: 5.2,
        h: 0.46,
        fontFace: 'Arial',
        fontSize: 9.8,
        color: '94A3B8',
        valign: 'top',
      });
    });

    // Bottom Quantitative Metric Callout (Morphing Tile)
    if (slideData.metric) {
      s.addShape(pptx.ShapeType.roundRect, {
        objectName: '!!morph-metric-tile',
        x: 0.6,
        y: 6.38,
        w: 5.85,
        h: 0.74,
        rectRadius: 0.08,
        fill: { color: '0D1524' },
        line: { color: accentHex, width: 1.2 },
      });
      s.addText(`${slideData.metric.value} ${slideData.metric.unit}`, {
        x: 0.8,
        y: 6.45,
        w: 2.3,
        h: 0.56,
        fontFace: 'Courier New',
        fontSize: 16,
        bold: true,
        color: accentHex,
        valign: 'middle',
      });
      s.addText(slideData.metric.caption, {
        x: 3.15,
        y: 6.45,
        w: 3.15,
        h: 0.56,
        fontFace: 'Arial',
        fontSize: 9.5,
        color: 'CBD5E1',
        valign: 'middle',
      });
    }

    // Right Panel: 3D Hardware + 3D Scientist Robot Stage Frame (Morphing)
    s.addShape(pptx.ShapeType.roundRect, {
      objectName: '!!morph-3d-stage',
      x: 6.72,
      y: 0.62,
      w: 6.02,
      h: 4.18,
      rectRadius: 0.1,
      fill: { color: '090D16' },
      line: { color: '1E293B', width: 1.2 },
      shadow: { type: 'outer', blur: 10, offset: 3, color: '000000', opacity: 0.45 },
    });

    const snap3D = snapshots3D[slideData.id];
    if (snap3D) {
      s.addImage({
        data: snap3D,
        x: 6.82,
        y: 0.72,
        w: 5.82,
        h: 3.88,
      });
    }

    // 3D Stage Caption Bar
    s.addText(`3D Apparatus + Scientist Robot  ·  ${slideData.robotExpressionLabel}`, {
      x: 6.84,
      y: 4.5,
      w: 5.78,
      h: 0.25,
      fontFace: 'Courier New',
      fontSize: 8.8,
      color: accentHex,
    });

    // Lower-Right Zone: Robot Explanation Box OR Novel Implementation / Hardware Photo
    const photoData = heroPhotos[slideData.number];
    if (slideData.novelIdea) {
      // Slide 10: Real-Life Benefits & Implementation Steps
      s.addShape(pptx.ShapeType.roundRect, {
        x: 6.72,
        y: 4.95,
        w: 6.02,
        h: 2.17,
        rectRadius: 0.08,
        fill: { color: '0D1724' },
        line: { color: '34D399', width: 1.2 },
      });
      s.addText('REAL-LIFE IMPLEMENTATION BLUEPRINT (Fe:LiNbO₃ + CMOS)', {
        x: 6.9,
        y: 5.04,
        w: 5.65,
        h: 0.28,
        fontFace: 'Arial',
        fontSize: 10.5,
        bold: true,
        color: '34D399',
      });
      const implText = slideData.novelIdea.implementationSteps
        .map((st, i) => `${i + 1}. ${st}`)
        .join('\n');
      s.addText(implText, {
        x: 6.9,
        y: 5.34,
        w: 5.65,
        h: 1.7,
        fontFace: 'Arial',
        fontSize: 9.2,
        color: 'E2E8F0',
        valign: 'top',
      });
    } else if (photoData) {
      // Combine Robot Speech Bubble + Real Hardware Photo
      s.addShape(pptx.ShapeType.roundRect, {
        objectName: '!!morph-robot-bubble',
        x: 6.72,
        y: 4.95,
        w: 3.4,
        h: 2.17,
        rectRadius: 0.08,
        fill: { color: '0B101B' },
        line: { color: '1E293B', width: 1 },
      });
      s.addText('Dr. Photon Explains:', {
        x: 6.88,
        y: 5.06,
        w: 3.1,
        h: 0.25,
        fontFace: 'Arial',
        fontSize: 10,
        bold: true,
        color: accentHex,
      });
      s.addText(`“${slideData.robotSpeech}”`, {
        x: 6.88,
        y: 5.36,
        w: 3.1,
        h: 1.65,
        fontFace: 'Arial',
        fontSize: 9.8,
        color: 'CBD5E1',
        valign: 'top',
      });

      s.addImage({
        data: photoData,
        x: 10.26,
        y: 4.95,
        w: 2.48,
        h: 2.17,
        sizing: { type: 'cover', w: 2.48, h: 2.17 },
      });
    } else {
      // Full-width Robot Explanation + 2D Vector Optical Signal Diagram Gadgets
      s.addShape(pptx.ShapeType.roundRect, {
        objectName: '!!morph-robot-bubble',
        x: 6.72,
        y: 4.95,
        w: 6.02,
        h: 1.38,
        rectRadius: 0.08,
        fill: { color: '0B101B' },
        line: { color: '1E293B', width: 1 },
      });
      s.addText(`Dr. Photon (3D Scientist Robot):`, {
        x: 6.9,
        y: 5.05,
        w: 5.65,
        h: 0.25,
        fontFace: 'Arial',
        fontSize: 10.5,
        bold: true,
        color: accentHex,
      });
      s.addText(`“${slideData.robotSpeech}”`, {
        x: 6.9,
        y: 5.34,
        w: 5.65,
        h: 0.9,
        fontFace: 'Arial',
        fontSize: 10,
        color: 'E2E8F0',
        valign: 'top',
      });

      // 2D Optical Pipeline Chevron Flow Diagram (Laser -> Optics -> AI Tensor)
      const stages = ['Coherent Laser', 'Photonic Transform', 'AI Readout'];
      stages.forEach((label, sIdx) => {
        s.addShape(pptx.ShapeType.chevron, {
          x: 6.72 + sIdx * 2.04,
          y: 6.46,
          w: 1.94,
          h: 0.64,
          fill: { color: sIdx === 1 ? '112236' : '0D1524' },
          line: { color: accentHex, width: 1 },
        });
        s.addText(label, {
          x: 6.82 + sIdx * 2.04,
          y: 6.52,
          w: 1.74,
          h: 0.52,
          fontFace: 'Arial',
          fontSize: 9.5,
          bold: true,
          color: 'F1F5F9',
          align: 'center',
          valign: 'middle',
        });
      });
    }

    // Speaker Notes
    s.addNotes(`${slideData.speakerNotes}\n\nRobot Narration: ${slideData.robotSpeech}`);
  });

  onProgress?.(93, 'Injecting PowerPoint Morph transitions and smooth animations...');
  const rawBuffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
  const finalBlob = await injectMorphAndAnimations(rawBuffer);

  onProgress?.(100, 'Download ready!');
  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Optics_in_AI_Physics_Lab_Presentation.pptx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
