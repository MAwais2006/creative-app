import { SimulationKind } from '../types/presentation';
import { DiffractiveNetworkSim } from './simulations/DiffractiveNetworkSim';
import { EnergyBottleneckSim } from './simulations/EnergyBottleneckSim';
import { FourierOpticsSim } from './simulations/FourierOpticsSim';
import { HeroPrismSim } from './simulations/HeroPrismSim';
import { HybridRoadmapSim } from './simulations/HybridRoadmapSim';
import { MicroringCrossbarSim } from './simulations/MicroringCrossbarSim';
import { MziInterferometerSim } from './simulations/MziInterferometerSim';
import { WdmMultiplexerSim } from './simulations/WdmMultiplexerSim';

interface SimulationStageProps {
  kind: SimulationKind;
}

export function SimulationStage({ kind }: SimulationStageProps) {
  switch (kind) {
    case 'hero-prism':
      return <HeroPrismSim />;
    case 'copper-wall':
      return <EnergyBottleneckSim />;
    case 'wdm-bus':
      return <WdmMultiplexerSim />;
    case 'mzi-mesh':
      return <MziInterferometerSim />;
    case 'microring-crossbar':
      return <MicroringCrossbarSim />;
    case 'diffractive-nn':
      return <DiffractiveNetworkSim />;
    case 'fourier-metalens':
      return <FourierOpticsSim />;
    case 'hybrid-roadmap':
      return <HybridRoadmapSim />;
  }
}
