export type SimulationKind =
  | 'hero-prism'
  | 'copper-wall'
  | 'wdm-bus'
  | 'mzi-mesh'
  | 'microring-crossbar'
  | 'diffractive-nn'
  | 'fourier-metalens'
  | 'hybrid-roadmap';

export interface KeyPoint {
  label: string;
  detail: string;
}

export interface MetricCallout {
  value: string;
  unit: string;
  caption: string;
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
  speakerNotes: string;
}

export interface GlossaryEntry {
  term: string;
  symbol?: string;
  category: string;
  definition: string;
}
