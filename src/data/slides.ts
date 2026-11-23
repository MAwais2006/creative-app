import { GlossaryEntry, SlideData } from '../types/presentation';

export const SLIDES: SlideData[] = [
  {
    id: 'light-compute-medium',
    number: '01',
    chapter: 'Introduction',
    title: 'Computation at the Speed of Light',
    subtitle:
      'Why modern artificial intelligence is shifting from copper interconnects and resistive transistors to waveguides, interference, and diffraction.',
    equation: 'E_photon = hν  ·  λ = 1550 nm (Silicon Transparency Window)',
    keyPoints: [
      {
        label: 'Zero Resistive Heating',
        detail:
          'Photons carry no electric charge, eliminating RC wire capacitance and Joule heating during signal transport across silicon dies.',
      },
      {
        label: 'Native Linear Algebra',
        detail:
          'Optical interference, diffraction, and superposition compute matrix-vector multiplications passively in a single physical pass.',
      },
      {
        label: 'Massive Spectral Parallelism',
        detail:
          'Dozens of laser wavelengths travel through the exact same waveguide simultaneously without interfering with one another.',
      },
    ],
    metric: {
      value: '< 10',
      unit: 'ps latency',
      caption: 'Passive optical pass time across a millimeter-scale photonic core',
    },
    simulation: 'hero-prism',
    speakerNotes:
      'Welcome to this presentation on how optics work in AI. For seventy years, computing relied on moving electrons across metal wires. Today, frontier AI models spend far more energy shuffling weights between memory and compute cores than performing actual arithmetic. Optics solves both transport and linear algebra using the wave physics of light inside silicon nitride and silicon waveguides.',
  },
  {
    id: 'copper-wall',
    number: '02',
    chapter: 'The Bottleneck',
    title: 'The Copper Wall: Why Electrons Hit a Ceiling',
    subtitle:
      'In modern AI accelerators, charging copper traces consumes orders of magnitude more energy than performing floating-point arithmetic.',
    equation: 'E_wire = ½ · C · V² · L   vs.   E_optical ≈ 10 fJ/bit',
    keyPoints: [
      {
        label: 'Data Movement Dominates',
        detail:
          'Fetching a single 16-bit weight from HBM memory costs roughly 20 pJ—200× more energy than multiplying it inside a tensor core.',
      },
      {
        label: 'Skin Effect & Attenuation',
        detail:
          'At 100+ Gbps per lane, high-frequency electrical signals attenuate sharply in copper, limiting reach to centimeters without retimers.',
      },
      {
        label: 'Shoreline Bandwidth Density',
        detail:
          'Optical fibers pack terabits per second into micron-scale waveguide facets, breaking the electrical pin-count wall of GPU packages.',
      },
    ],
    metric: {
      value: '200×',
      unit: 'energy gap',
      caption: 'HBM memory fetch (~20 pJ) vs. INT8/FP16 multiply-accumulate (~0.1 pJ)',
    },
    simulation: 'copper-wall',
    speakerNotes:
      'Use the controls on the right to scale model size and interconnect reach. Notice how on-die arithmetic stays tiny compared to copper wire capacitance as distance grows past a few millimeters. Optical waveguides lose less than 0.1 dB per centimeter and require nearly the same energy at 10 meters as at 10 centimeters.',
  },
  {
    id: 'wdm-interconnects',
    number: '03',
    chapter: 'Optical Transport',
    title: 'Wavelength-Division Multiplexing (WDM)',
    subtitle:
      'A single silicon photonic waveguide carries multiple independent AI data streams simultaneously by assigning each to its own laser wavelength.',
    equation: 'Total Bandwidth = N_λ × f_mod   (e.g., 16 λ × 64 Gbps = 1.024 Tbps)',
    keyPoints: [
      {
        label: 'Superposition Without Crosstalk',
        detail:
          'Linear optical media allow distinct wavelengths (1530–1565 nm C-band) to co-propagate down one 500 nm waveguide cleanly.',
      },
      {
        label: 'Microring Modulators',
        detail:
          'Microscopic silicon rings (5–10 µm radius) resonate at exact wavelengths to imprint electrical tensor data onto light at 50+ GHz.',
      },
      {
        label: 'All-to-All Cluster Fabrics',
        detail:
          'Co-packaged optics (CPO) bring fiber directly to the GPU substrate, turning rack-scale tensor parallelism into low-latency optical switching.',
      },
    ],
    metric: {
      value: '1.6+',
      unit: 'Tbps / fiber',
      caption: 'Aggregate bidirectional optical bandwidth per single-mode fiber strand',
    },
    simulation: 'wdm-bus',
    speakerNotes:
      'Toggle individual C-band laser wavelengths in the interactive bench to observe how multiple data streams merge onto one physical bus. At the receiver end, wavelength-selective microring drop filters peel off each color onto its dedicated germanium photodiode.',
  },
  {
    id: 'mzi-matrix-multiplication',
    number: '04',
    chapter: 'Coherent Computing',
    title: 'Mach-Zehnder Interferometers for Matrix Math',
    subtitle:
      'Neural networks are 90% matrix-vector products. Meshes of Mach-Zehnder Interferometers (MZIs) encode weights as optical phase shifts.',
    equation: 'U(θ, φ) = [ e^(iφ) sin(θ/2), cos(θ/2) ; e^(iφ) cos(θ/2), -sin(θ/2) ]',
    keyPoints: [
      {
        label: '50:50 Directional Couplers',
        detail:
          'Two waveguides brought within nanometers split incoming light evenly, creating two coherent paths whose relative phases can be tuned.',
      },
      {
        label: 'Phase Shifters as Weights',
        detail:
          'Thermo-optic or electro-optic phase shifters delay one arm by θ radians, steering constructive interference between output ports.',
      },
      {
        label: 'Clements & Reck Meshes',
        detail:
          'By tiling N(N−1)/2 MZIs in a triangular or rectangular lattice, light physically executes any arbitrary N×N unitary matrix via SVD.',
      },
    ],
    metric: {
      value: 'O(1)',
      unit: 'pass time',
      caption: 'Matrix multiplication completes as fast as light crosses the waveguide mesh',
    },
    simulation: 'mzi-mesh',
    speakerNotes:
      'Adjust the input amplitudes x₁ and x₂ alongside the internal phase shift θ and external phase φ. You are looking at the fundamental building block of coherent photonic AI accelerators (such as Lightmatter or MIT photonic chips): interference at the second coupler directly computes a 2×2 unitary transformation.',
  },
  {
    id: 'microring-crossbar',
    number: '05',
    chapter: 'Incoherent Computing',
    title: 'Microring Weight Banks & Optical Crossbars',
    subtitle:
      'Incoherent photonic tensor cores combine WDM wavelengths with tunable microring resonators to compute dot products via optical power summation.',
    equation: 'y_i = Σ_j  w_ij · x_j   (Weighted via ring drop transmission T(λ_j))',
    keyPoints: [
      {
        label: 'Analog Weight Tuning',
        detail:
          'Shifting a ring’s refractive index slightly detunes its resonance peak, continuously controlling how much laser power passes to the drop port.',
      },
      {
        label: 'Balanced Photodetection',
        detail:
          'Differential pairs of photodiodes subtract Through-port and Drop-port currents, naturally representing signed positive and negative weights.',
      },
      {
        label: 'Compact Footprint',
        detail:
          'Microring arrays pack far denser than MZI meshes and operate without needing global phase coherence across the entire chip.',
      },
    ],
    metric: {
      value: '10–50',
      unit: 'fJ / MAC',
      caption: 'Effective energy per analog multiply-accumulate operation at high clock rates',
    },
    simulation: 'microring-crossbar',
    speakerNotes:
      'Click any weight ring in the 3×3 matrix or adjust the input laser intensities. Notice how each column carries three wavelengths together, and each ring selectively couples only its matched wavelength into the horizontal summation bus feeding the balanced detector.',
  },
  {
    id: 'diffractive-neural-networks',
    number: '06',
    chapter: 'Free-Space Optics',
    title: 'Diffractive Deep Neural Networks (D²NN)',
    subtitle:
      'Instead of etched waveguides, stacked transmissive phase masks compute inference in free space through Huygens-Fresnel wave diffraction.',
    equation: 'U_m(x, y) = Σ_n  U_{m-1}(x_n, y_n) · h(r) · exp(i · Δφ_m(x_n, y_n))',
    keyPoints: [
      {
        label: 'Every Pixel Is a Neuron',
        detail:
          'Each micron-scale feature on a phase mask modulates the phase of passing light and radiates a secondary spherical wavelet to the next layer.',
      },
      {
        label: 'Trained via Backpropagation',
        detail:
          'Digital simulators use complex-valued gradient descent to optimize layer phase profiles before etching them onto silica wafers.',
      },
      {
        label: 'Zero Runtime Compute Power',
        detail:
          'Once fabricated, the optical network classifies images or wavefronts passively using only the illuminating coherent beam.',
      },
    ],
    metric: {
      value: '10⁶+',
      unit: 'neurons / cm²',
      caption: 'Parallel diffractive connections propagating simultaneously in free space',
    },
    simulation: 'diffractive-nn',
    speakerNotes:
      'Select different input light patterns in the simulator to watch coherent wavefronts diffract across two trained phase-modulation planes. Constructive interference concentrates optical energy onto the matching class photodetector bin at the output plane.',
  },
  {
    id: 'smart-optics-metalens',
    number: '07',
    chapter: 'Optical Vision',
    title: 'Optical Pre-Processing & Metalens AI Vision',
    subtitle:
      'Co-designing optics with neural networks moves early convolutional layers out of power-hungry GPUs and directly into the camera lens.',
    equation: 'E_sensor(u, v) = ℱ⁻¹ { M(f_x, f_y) · ℱ{ E_scene(x, y) } }',
    keyPoints: [
      {
        label: '4f Fourier Filtering',
        detail:
          'A lens naturally computes a 2D spatial Fourier transform at its focal plane, enabling instant analog edge detection and kernel convolution.',
      },
      {
        label: 'Sub-Wavelength Metalenses',
        detail:
          'Arrays of TiO₂ nanopillars sculpt wavefront phase and polarization in a flat film thinner than a human hair, replacing bulky curved glass.',
      },
      {
        label: 'Privacy & Edge Bandwidth',
        detail:
          'Extracting sparse semantic features or depth cues optically reduces sensor readout bandwidth and latency for autonomous robotics.',
      },
    ],
    metric: {
      value: '1000×',
      unit: 'thinner optics',
      caption: 'Planar nanophotonic metalens (~500 nm) compared to millimeter glass doublets',
    },
    simulation: 'fourier-metalens',
    speakerNotes:
      'Switch between optical Fourier pupil masks—such as High-Pass Edge Detection or Directional Sobel—to see how a passive optical element performs first-layer CNN feature extraction before photons even reach the silicon pixel array.',
  },
  {
    id: 'hybrid-roadmap',
    number: '08',
    chapter: 'Architecture & Future',
    title: 'The Hybrid Photonic-CMOS Roadmap',
    subtitle:
      'Photons do not easily interact with photons—so the future of AI hardware pairs optical linear engines with electronic memory and nonlinearities.',
    equation: 'y = σ_CMOS(  W_photonic · x  )   [O-E-O Hybrid Loop]',
    keyPoints: [
      {
        label: 'Hard Limits of Pure Optics',
        detail:
          'Photons lack resting mass and strong self-interaction, making compact optical SRAM memory and low-power ReLU/Softmax gates challenging.',
      },
      {
        label: 'Precision & DAC/ADC Overhead',
        detail:
          'Analog optical compute excels at 4-to-8-bit inference, but converting signals back and forth via high-speed DACs/ADCs sets the efficiency floor.',
      },
      {
        label: 'Co-Packaged Synergy',
        detail:
          'Industry architectures embed silicon photonic interposers beneath CMOS chiplets—uniting photonic scale-out fabrics with electronic control.',
      },
    ],
    metric: {
      value: '2026–30',
      unit: 'CPO era',
      caption: 'Transition from pluggable optical transceivers to co-packaged photonic substrates',
    },
    simulation: 'hybrid-roadmap',
    speakerNotes:
      'To close: optics is not replacing transistors wholesale. Instead, AI systems are converging on a division of labor—photons move terabits and execute dense linear projections, while CMOS transistors store state, apply nonlinear activations, and orchestrate control flow.',
  },
];

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: 'Waveguide',
    symbol: 'Si₃N₄ / Si',
    category: 'Integrated Photonics',
    definition:
      'A microscopic dielectric channel (typically 400–800 nm wide) that confines and steers laser light via total internal reflection on a silicon chip.',
  },
  {
    term: 'Wavelength-Division Multiplexing (WDM)',
    symbol: 'λ₁…λₙ',
    category: 'Optical Transport',
    definition:
      'Transmitting multiple independent data streams simultaneously through a single optical fiber or waveguide by assigning each stream a distinct laser wavelength.',
  },
  {
    term: 'Mach-Zehnder Interferometer (MZI)',
    symbol: 'U(θ, φ)',
    category: 'Coherent Compute',
    definition:
      'An optical circuit that splits light into two arms, shifts their relative phase, and recombines them to perform programmable 2×2 unitary matrix multiplication.',
  },
  {
    term: 'Microring Resonator (MRR)',
    symbol: 'T(λ)',
    category: 'Incoherent Compute',
    definition:
      'A circular waveguide loop coupled to a straight bus that traps and modulates or weights a specific resonant wavelength while letting other wavelengths pass.',
  },
  {
    term: 'Co-Packaged Optics (CPO)',
    symbol: 'Tbps/mm',
    category: 'System Packaging',
    definition:
      'Integrating photonic transceivers directly alongside compute silicon on the same substrate or interposer to eliminate long copper PCB traces.',
  },
  {
    term: 'Diffractive Deep Neural Network (D²NN)',
    symbol: 'Δφ(x,y)',
    category: 'Free-Space Optics',
    definition:
      'Stacked physical phase-mask layers that compute neural network inference through free-space wave diffraction and constructive interference.',
  },
  {
    term: 'Metalens',
    symbol: 'TiO₂',
    category: 'Optical Vision',
    definition:
      'A flat nanostructured surface composed of sub-wavelength pillars engineered to focus light or execute optical Fourier convolutions directly before a camera sensor.',
  },
  {
    term: 'O-E-O Conversion',
    symbol: 'DAC / ADC',
    category: 'Hybrid Architecture',
    definition:
      'Optical-Electrical-Optical conversion—translating digital bits into modulated laser light and back via photodiodes, often the primary power bottleneck in analog optical compute.',
  },
];
