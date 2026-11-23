import { GlossaryEntry, SlideData } from '../types/presentation';

export const SLIDES: SlideData[] = [
  {
    id: 'light-compute-medium',
    number: '01',
    chapter: 'Physics Lab Intro',
    title: 'Optics in AI: Light as Compute & Transport',
    subtitle:
      'What optics is as a branch of physics—and how photons, waveguides, and interference now accelerate modern artificial intelligence.',
    equation: 'E_photon = hν = hc / λ   ·   c ≈ 3 × 10⁸ m/s',
    keyPoints: [
      {
        label: 'What Is Optics?',
        detail:
          'Optics studies the behavior of electromagnetic radiation—reflection, refraction, diffraction, and interference—from ultraviolet to infrared.',
      },
      {
        label: 'Why AI Needs Optics',
        detail:
          'Frontier neural networks hit thermal and bandwidth ceilings in copper wires; photons move terabits with zero resistive Joule heating.',
      },
      {
        label: 'Passive Linear Algebra',
        detail:
          'Wave interference and optical diffraction execute matrix multiplications naturally as light propagates through structured silicon.',
      },
    ],
    metric: {
      value: '< 10',
      unit: 'ps pass',
      caption: 'Optical propagation time across a millimeter-scale photonic core',
    },
    simulation: 'hero-prism',
    hardware3D: 'prism-bench',
    robotPose: 'welcome',
    robotExpressionLabel: 'Welcoming · Optical Pointer Ready',
    robotSpeech:
      'Welcome to our Physics Lab! Optics turns wave physics into ultra-fast, low-heat AI hardware—watch how a simple prism splits coherent light into parallel compute channels.',
    speakerNotes:
      'Open by defining optics in classical and modern physics: controlling light waves using refractive index gradients, mirrors, gratings, and cavities. Then connect directly to AI: modern GPUs spend far more energy moving tensors over copper than computing math. Photonics solves both transport and linear algebra.',
    heroImage: '/src/assets/images/photonic_ai_wafer_hero_1795410684726.jpg',
  },
  {
    id: 'fundamental-optics-physics',
    number: '02',
    chapter: 'Core Physics',
    title: 'Refraction, Total Internal Reflection & Interference',
    subtitle:
      'Four foundational laws of optics govern every AI photonic chip—guiding light inside nanometer silicon channels and combining waves to compute.',
    equation: 'n₁ sin(θ₁) = n₂ sin(θ₂)   ·   θ_c = arcsin(n₂ / n₁)',
    keyPoints: [
      {
        label: "Snell's Law & Waveguides",
        detail:
          'High-index silicon (n ≈ 3.48) surrounded by silica cladding (n ≈ 1.44) traps laser light via Total Internal Reflection around tight bends.',
      },
      {
        label: 'Constructive & Destructive Interference',
        detail:
          'Coherent light waves add or cancel based on relative phase Δφ—turning optical phase shifts into programmable arithmetic weights.',
      },
      {
        label: 'Huygens-Fresnel Diffraction',
        detail:
          'Every point on a wavefront emits secondary wavelets, allowing free-space phase plates to route signals onto target detector arrays.',
      },
    ],
    metric: {
      value: '24.4°',
      unit: 'critical angle',
      caption: 'Total internal reflection threshold inside a Si/SiO₂ photonic waveguide',
    },
    simulation: 'snell-waveguide',
    hardware3D: 'snell-waveguide',
    robotPose: 'optics',
    robotExpressionLabel: 'Explaining · Tracing Ray Angle',
    robotSpeech:
      'Notice Snell’s Law in action! Because silicon has a refractive index of 3.48 against silica’s 1.44, any ray steeper than 24.4° bounces cleanly inside the waveguide without leaking.',
    speakerNotes:
      'Explain the four pillars of optical physics used in AI hardware: refraction (Snell’s Law), Total Internal Reflection (how waveguides act as optical wires), wave superposition/interference (how MZI chips multiply matrices), and diffraction (how free-space optical networks classify images).',
  },
  {
    id: 'copper-wall',
    number: '03',
    chapter: 'The Bottleneck',
    title: 'The Copper Wall: Why Electronic AI Bottlenecks',
    subtitle:
      'In CMOS AI clusters, charging capacitive copper traces consumes orders of magnitude more energy than performing floating-point multiplication.',
    equation: 'E_wire = ½ · C · V² · L   vs.   E_optical ≈ 10 fJ/bit',
    keyPoints: [
      {
        label: 'Memory Transport Dominates',
        detail:
          'Fetching one 16-bit weight from HBM costs ~20 pJ—roughly 200× more energy than multiplying it inside a digital tensor core.',
      },
      {
        label: 'Skin Effect & Attenuation',
        detail:
          'At 100+ Gbps per lane, electrical pulses attenuate severely in copper PCB traces, requiring power-hungry retimers past centimeters.',
      },
      {
        label: 'Shoreline Bandwidth Density',
        detail:
          'Micron-scale optical waveguides pack terabits per second per millimeter of die edge, breaking the electrical pin-count ceiling.',
      },
    ],
    metric: {
      value: '200×',
      unit: 'energy gap',
      caption: 'HBM weight fetch (~20 pJ) vs. INT8/FP16 multiply-accumulate (~0.1 pJ)',
    },
    simulation: 'copper-wall',
    hardware3D: 'copper-vs-optics',
    robotPose: 'bottleneck',
    robotExpressionLabel: 'Analytical · Highlighting Thermal Loss',
    robotSpeech:
      'Look at the red-hot copper bus compared to the cool photonic ribbon! Copper loses energy quadratically with voltage and length, while waveguides carry terabits coolly across meters.',
    speakerNotes:
      'Contrast the physical scaling of electrons in copper versus photons in dielectric waveguides. Emphasize that AI scaling is increasingly memory- and interconnect-bound rather than arithmetic-bound.',
  },
  {
    id: 'wdm-interconnects',
    number: '04',
    chapter: 'Optical Transport',
    title: 'Wavelength-Division Multiplexing (WDM)',
    subtitle:
      'A single silicon nitride waveguide carries dozens of independent AI tensor streams simultaneously by assigning each to a distinct laser color.',
    equation: 'Total Bandwidth = N_λ × f_mod   (16 λ × 64 Gbps = 1.024 Tbps)',
    keyPoints: [
      {
        label: 'Linear Superposition Without Crosstalk',
        detail:
          'Distinct C-band laser wavelengths (1530–1565 nm) co-propagate down one 500 nm waveguide without interacting.',
      },
      {
        label: 'Microring Modulators',
        detail:
          'Resonant silicon rings (5–10 µm radius) trap one exact wavelength each to imprint digital tensor bits at 50+ GHz.',
      },
      {
        label: 'Co-Packaged Cluster Fabrics',
        detail:
          'Optical fibers terminate directly on GPU substrates, turning rack-scale tensor parallelism into low-latency optical switching.',
      },
    ],
    metric: {
      value: '1.6+',
      unit: 'Tbps / fiber',
      caption: 'Bidirectional optical throughput per hair-thin single-mode fiber',
    },
    simulation: 'wdm-bus',
    hardware3D: 'wdm-chip',
    robotPose: 'wdm',
    robotExpressionLabel: 'Demonstrating · Multi-λ Alignment',
    robotSpeech:
      'Each glowing microring on this chip locks onto one specific laser wavelength. Four or sixteen different data streams share the exact same physical waveguide at once!',
    speakerNotes:
      'Highlight how WDM gives optics an extra physical dimension—frequency/wavelength—that copper wires simply do not have. Explain how microring resonators act as precision spectral filters.',
  },
  {
    id: 'mzi-matrix-multiplication',
    number: '05',
    chapter: 'Coherent Hardware',
    title: 'Mach-Zehnder Interferometers (MZI) for Matrix Math',
    subtitle:
      'Neural networks are 90% matrix-vector multiplications. 3D meshes of Mach-Zehnder Interferometers encode weights as optical phase shifts.',
    equation: 'U(θ, φ) = [ e^(iφ) sin(θ/2), cos(θ/2) ; e^(iφ) cos(θ/2), -sin(θ/2) ]',
    keyPoints: [
      {
        label: '50:50 Directional Couplers',
        detail:
          'Waveguides brought within ~200 nm split coherent light evenly into two arms via evanescent field coupling.',
      },
      {
        label: 'Thermo-Optic Phase Shifters',
        detail:
          'Gold micro-heaters tune refractive index (dn/dT) by fractions of a kelvin, shifting phase by θ radians to steer output power.',
      },
      {
        label: 'Clements Unitary Mesh',
        detail:
          'Tiling N(N−1)/2 MZIs implements any arbitrary N×N matrix via Singular Value Decomposition in one speed-of-light pass.',
      },
    ],
    metric: {
      value: 'O(1)',
      unit: 'pass latency',
      caption: 'Matrix multiplication completes as fast as photons traverse the mesh',
    },
    simulation: 'mzi-mesh',
    hardware3D: 'mzi-chip',
    robotPose: 'mzi',
    robotExpressionLabel: 'Precision Mode · Tuning Phase θ',
    robotSpeech:
      'Here is the heart of coherent photonic AI! Gold electrodes apply a tiny phase delay θ in one waveguide arm, steering constructive interference straight into the desired output port.',
    speakerNotes:
      'Walk through the 3D MZI chip: light enters two ports, splits at the first directional coupler, receives phase shifts θ and φ from the golden heaters, and recombines at the second coupler. Interference physically performs a 2×2 unitary matrix multiply.',
    heroImage: '/src/assets/images/mzi_optical_waveguide_die_1795410684850.jpg',
  },
  {
    id: 'microring-crossbar',
    number: '06',
    chapter: 'Incoherent Hardware',
    title: 'Microring Weight Banks & Photonic Crossbars',
    subtitle:
      'Incoherent optical tensor cores combine WDM wavelengths with tunable microring resonators to compute dot products by optical power summation.',
    equation: 'y_i = Σ_j  w_ij · x_j   (Drop-port vs. Through-port subtraction)',
    keyPoints: [
      {
        label: 'Continuous Analog Weighting',
        detail:
          'Detuning a microring’s resonance peak smoothly controls how much laser power drops from the column bus into the row sum bus.',
      },
      {
        label: 'Balanced Photodetection',
        detail:
          'Differential photodiode pairs subtract Drop and Through photocurrents, naturally encoding both positive and negative weights.',
      },
      {
        label: 'Compact Wafer Footprint',
        detail:
          'Microring crossbars pack far denser than MZI lattices and require no chip-wide phase-coherence stabilization.',
      },
    ],
    metric: {
      value: '10–50',
      unit: 'fJ / MAC',
      caption: 'Effective analog energy per multiply-accumulate at multi-GHz clock rates',
    },
    simulation: 'microring-crossbar',
    hardware3D: 'crossbar-tower',
    robotPose: 'crossbar',
    robotExpressionLabel: 'Scanning · 3×3 Crossbar Matrix',
    robotSpeech:
      'In this 3D crossbar tower, each ring resonator acts like an analog synaptic weight! Photodiodes at the end sum every wavelength’s power simultaneously via Kirchhoff’s law.',
    speakerNotes:
      'Compare MZI meshes (coherent, phase-sensitive) against microring weight banks (incoherent, intensity-based). Point out how balanced photodetection unlocks signed weights.',
  },
  {
    id: 'diffractive-neural-networks',
    number: '07',
    chapter: 'Free-Space Optics',
    title: 'Diffractive Deep Neural Networks (D²NN)',
    subtitle:
      'Stacked 3D-printed or etched phase-modulation plates compute neural inference in free space purely through Huygens-Fresnel diffraction.',
    equation: 'U_m(x, y) = Σ_n  U_{m-1}(x_n, y_n) · h(r) · exp(i · Δφ_m)',
    keyPoints: [
      {
        label: 'Every Micron Pixel Is a Neuron',
        detail:
          'Each transparent feature delays the passing wavefront’s phase and radiates a secondary spherical wavelet to every neuron on the next plate.',
      },
      {
        label: 'Backpropagation Before Fabrication',
        detail:
          'Complex-valued gradient descent optimizes layer phase profiles on a GPU before lithographic etching onto silica wafers.',
      },
      {
        label: 'Zero Runtime Compute Power',
        detail:
          'Once fabricated, the optical tower classifies scenes passively using only the illuminating laser beam.',
      },
    ],
    metric: {
      value: '10⁶+',
      unit: 'neurons / cm²',
      caption: 'Massively parallel diffractive connections propagating at the speed of light',
    },
    simulation: 'diffractive-nn',
    hardware3D: 'd2nn-tower',
    robotPose: 'diffractive',
    robotExpressionLabel: 'Observing · Wavefront Diffraction',
    robotSpeech:
      'No wires at all! Light passes through stacked phase-sculpted glass plates, diffracting and focusing all classification energy onto one winning detector bin.',
    speakerNotes:
      'Explain how D²NNs eliminate waveguides entirely. Show how each plate acts like a physical fully-connected linear layer in Fourier/Fresnel space, trained offline and frozen into glass.',
  },
  {
    id: 'smart-optics-metalens',
    number: '08',
    chapter: 'Optical Vision',
    title: 'Nanophotonic Metalenses & 4f Optical Vision',
    subtitle:
      'Co-designing optics with neural networks moves early convolutional layers out of power-hungry GPUs and directly into flat camera optics.',
    equation: 'E_sensor(u, v) = ℱ⁻¹ { M(f_x, f_y) · ℱ{ E_scene(x, y) } }',
    keyPoints: [
      {
        label: '4f Spatial Fourier Filtering',
        detail:
          'A lens naturally computes a 2D Fourier transform at its focal plane, enabling instant analog edge detection and kernel convolution.',
      },
      {
        label: 'TiO₂ Nanopillar Metalenses',
        detail:
          'Sub-wavelength dielectric pillars sculpt wavefront phase in a flat film thinner than a human hair, replacing bulky curved glass.',
      },
      {
        label: 'Edge Latency & Bandwidth Savings',
        detail:
          'Extracting edges or depth cues optically cuts sensor readout power and latency for autonomous drones and robotics.',
      },
    ],
    metric: {
      value: '1000×',
      unit: 'thinner optics',
      caption: 'Planar 500 nm nanophotonic metalens vs. millimeter curved glass doublets',
    },
    simulation: 'fourier-metalens',
    hardware3D: 'metalens-stack',
    robotPose: 'metalens',
    robotExpressionLabel: 'Inspecting · Nanopillar Array',
    robotSpeech:
      'Look closely at those sub-wavelength titanium dioxide pillars! They bend incoming scene light to compute edge-detection convolutions before photons even touch the CMOS sensor.',
    speakerNotes:
      'Bridge computer vision and nanophotonics: why capture millions of raw redundant pixels when a flat metalens can pre-compute spatial convolutions at zero compute energy?',
    heroImage: '/src/assets/images/nanophotonic_metalens_sensor_1795410684828.jpg',
  },
  {
    id: 'hybrid-roadmap',
    number: '09',
    chapter: 'System Limits',
    title: 'Hybrid Photonic-CMOS Architecture & Limits',
    subtitle:
      'Photons do not easily interact with photons—so the winning AI architecture pairs optical linear engines with CMOS memory and nonlinearities.',
    equation: 'y = σ_CMOS(  W_photonic · x  )   [O-E-O Hybrid Loop]',
    keyPoints: [
      {
        label: 'Why Pure Optics Is Hard',
        detail:
          'Photons lack resting mass and strong self-interaction, making dense optical SRAM memory and low-power ReLU/Softmax difficult.',
      },
      {
        label: 'DAC / ADC Conversion Floor',
        detail:
          'Analog optical cores shine at 4–8 bit inference, but high-speed O-E-O conversion sets the energy floor unless tiles are large.',
      },
      {
        label: '3D Co-Packaged Synergy',
        detail:
          'Silicon photonic interposers bonded beneath CMOS chiplets let light handle linear projections and cluster fabrics while CMOS handles logic.',
      },
    ],
    metric: {
      value: '2026–30',
      unit: 'CPO era',
      caption: 'Industry shift from pluggable transceivers to co-packaged photonic substrates',
    },
    simulation: 'hybrid-roadmap',
    hardware3D: 'cpo-stack',
    robotPose: 'caution',
    robotExpressionLabel: 'Evaluating · Trade-offs & Limits',
    robotSpeech:
      'Be honest like a good physicist: photons are terrible at sitting still in SRAM or doing nonlinear ReLU! That is why 3D co-packaged photonic-CMOS stacks unite the best of both worlds.',
    speakerNotes:
      'Present a rigorous, balanced engineering view. Use the exploded 3D CPO stack to show how HBM, CMOS compute chiplets, and silicon photonic interposers stack vertically.',
  },
  {
    id: 'novel-holographic-cache',
    number: '10',
    chapter: 'Novel Invention',
    title: 'New Idea: Chromo-Synaptic Holographic Cache (CSHC)',
    subtitle:
      'An unexplored optical AI memory architecture: storing LLM Key-Value caches as 3D Bragg holograms inside photorefractive crystals for O(1) optical attention.',
    equation: 'Attn_Scores(Q) = ℐ_Bragg( θ_Q, λ ) ∝ | Q · Kᵀ |²   [Zero HBM Fetch]',
    keyPoints: [
      {
        label: 'The Unsolved Problem',
        detail:
          'Long-context LLMs (100k–1M tokens) stall on streaming huge KV-caches from HBM every single generated token.',
      },
      {
        label: 'The Novel Mechanism',
        detail:
          'Encode Attention Keys as 3D refractive-index gratings inside an Fe:LiNbO₃ crystal via crossed write beams; read millions of dot products in one flash.',
      },
      {
        label: 'Real-World Benefit & Impact',
        detail:
          'Replaces O(N) memory bandwidth sweeps with a single O(1) Bragg diffraction lookup—slashing KV-cache energy by up to 100×.',
      },
    ],
    metric: {
      value: 'O(1)',
      unit: 'KV lookup',
      caption: 'Simultaneous holographic inner product across 100k+ angularly multiplexed keys',
    },
    simulation: 'holographic-cache',
    hardware3D: 'holographic-cache',
    robotPose: 'eureka',
    robotExpressionLabel: 'Eureka Mode · Novel Architecture',
    robotSpeech:
      'Here is our original idea! A Chromo-Synaptic Holographic Cache stores LLM Attention Keys as 3D light-interference gratings inside a Lithium Niobate crystal—computing Q·Kᵀ across 100k tokens in a single optical flash!',
    speakerNotes:
      'Present this final slide as an original physics-meets-AI proposal: photorefractive volume holography applied to Transformer KV-cache attention lookup. Walk through the exact 3-step hardware implementation using Thin-Film Lithium Niobate, acousto-optic angular steering, and sparse Top-k CMOS Value readout.',
    novelIdea: {
      name: 'Chromo-Synaptic Holographic Cache (CSHC)',
      coreMechanism:
        'Use angle- and wavelength-multiplexed Bragg volume holography inside iron-doped Lithium Niobate (Fe:LiNbO₃) bonded to a silicon photonic interposer to store Transformer Key vectors as 3D refractive-index gratings.',
      benefits: [
        'Eliminates O(N) HBM bandwidth bottleneck during autoregressive LLM decoding across 100k–1M token contexts.',
        'Computes inner products Q·Kᵀ physically across all stored holograms in parallel (~15 ps) via Bragg diffraction intensity.',
        'Non-volatile photorefractive retention during inference sessions with zero static refresh power.',
      ],
      implementationSteps: [
        'Fabricate a Thin-Film Lithium Niobate (TFLN) waveguide slab co-packaged beside a CMOS attention chiplet with an integrated 2D acousto-optic beam deflector.',
        'Write Phase (488 nm blue beam): During prompt prefill, interfere each token Key vector wavefront with an angle-indexed reference beam (θ_t) to record its Bragg grating.',
        'Read Phase (1550 nm non-destructive C-band beam): Steer the current Query wavefront into the crystal; diffracted beam intensities on a photodiode array directly identify the Top-k relevant tokens for CMOS Value retrieval.',
      ],
    },
  },
];

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: 'Waveguide',
    symbol: 'Si₃N₄ / Si',
    category: 'Integrated Photonics',
    definition:
      'A microscopic dielectric channel (400–800 nm wide) confining laser light via total internal reflection on a silicon chip.',
  },
  {
    term: 'Wavelength-Division Multiplexing (WDM)',
    symbol: 'λ₁…λₙ',
    category: 'Optical Transport',
    definition:
      'Transmitting multiple independent data streams simultaneously down one fiber or waveguide using distinct laser wavelengths.',
  },
  {
    term: 'Mach-Zehnder Interferometer (MZI)',
    symbol: 'U(θ, φ)',
    category: 'Coherent Compute',
    definition:
      'An optical circuit that splits light into two arms, shifts relative phase, and recombines beams to perform programmable 2×2 unitary matrix math.',
  },
  {
    term: 'Microring Resonator (MRR)',
    symbol: 'T(λ)',
    category: 'Incoherent Compute',
    definition:
      'A circular waveguide loop coupled to a bus that traps and modulates or weights a specific resonant wavelength.',
  },
  {
    term: 'Diffractive Deep Neural Network (D²NN)',
    symbol: 'Δφ(x,y)',
    category: 'Free-Space Optics',
    definition:
      'Stacked physical phase-mask layers computing neural inference through free-space wave diffraction and constructive interference.',
  },
  {
    term: 'Nanophotonic Metalens',
    symbol: 'TiO₂',
    category: 'Optical Vision',
    definition:
      'A flat nanostructured surface of sub-wavelength pillars that focuses light or executes optical Fourier convolutions before a camera sensor.',
  },
  {
    term: 'Co-Packaged Optics (CPO)',
    symbol: 'Tbps/mm',
    category: 'System Packaging',
    definition:
      'Integrating photonic engines directly alongside compute silicon on the same interposer substrate to eliminate long copper traces.',
  },
  {
    term: 'Bragg Volume Holography',
    symbol: 'Fe:LiNbO₃',
    category: 'Novel Holographic AI',
    definition:
      'Storing 3D interference patterns inside a photorefractive crystal so angularly steered query beams recall associative inner products in parallel.',
  },
];
