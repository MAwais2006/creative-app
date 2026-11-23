export type SimulationKind =
  | 'hero-prism'
  | 'snell-waveguide'
  | 'copper-wall'
  | 'wdm-bus'
  | 'mzi-mesh'
  | 'microring-crossbar'
  | 'diffractive-nn'
  | 'fourier-metalens'
  | 'hybrid-roadmap'
  | 'holographic-cache';

export type Hardware3DKind =
  | 'prism-bench'
  | 'snell-waveguide'
  | 'copper-vs-optics'
  | 'wdm-chip'
  | 'mzi-chip'
  | 'crossbar-tower'
  | 'd2nn-tower'
  | 'metalens-stack'
  | 'cpo-stack'
  | 'holographic-cache';

export type RobotPoseKind =
  | 'welcome'
  | 'optics'
  | 'bottleneck'
  | 'wdm'
  | 'mzi'
  | 'crossbar'
  | 'diffractive'
  | 'metalens'
  | 'caution'
  | 'eureka';

export interface KeyPoint {
  label: string;
  detail: string;
}

export interface MetricCallout {
  value: string;
  unit: string;
  caption: string;
}

export interface NovelIdeaSection {
  name: string;
  coreMechanism: string;
  benefits: string[];
  implementationSteps: string[];
}

export interface SlideData {
  id: string;
  number: string;
  chapter: string;
  title: string;
  subtitle: string;
  equation?: string;
  keyPoints: KeyPoint[];
  metric?: MetricCallout;
  simulation: SimulationKind;
  hardware3D: Hardware3DKind;
  robotPose: RobotPoseKind;
  robotExpressionLabel: string;
  robotSpeech: string;
  speakerNotes: string;
  heroImage?: string;
  novelIdea?: NovelIdeaSection;
}

export interface GlossaryEntry {
  term: string;
  symbol?: string;
  category: string;
  definition: string;
}
