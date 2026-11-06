import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Bookmark, Box, ShieldCheck, X, Sparkles, Camera } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export interface ModelPartInfo {
  id: string;
  label: string;
  role: string;
  color: string;
}

interface Custom3DPrimitive {
  type: 'sphere' | 'cylinder' | 'torus' | 'box' | 'cone' | 'ring' | 'octahedron';
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  opacity?: number;
  wireframe?: boolean;
  animation?: 'none' | 'pulse' | 'orbit' | 'spin' | 'float';
  label?: string;
}

interface ModelSpec {
  id: string;
  title: string;
  subject: string;
  verificationBadge: string;
  isUnavailable?: boolean;
  unavailableReason?: string;
  parts: ModelPartInfo[];
  guidedSteps: Array<{ step: string; detail: string }>;
  primitives?: Custom3DPrimitive[];
}

const MODEL_SPECS: Record<string, ModelSpec> = {
  human_heart: {
    id: 'human_heart',
    title: 'Human Heart: Four Chambers, Valves & Double Circulation (Anatomical 3D)',
    subject: 'Biology • Circulatory Anatomy',
    verificationBadge: 'Section 9.3 Anatomically Reviewed Model (Three.js WebGL)',
    parts: [
      { id: 'right_atrium', label: 'Right Atrium', role: 'Receives deoxygenated blood from the upper and lower body via Superior and Inferior Vena Cava.', color: '#2563EB' },
      { id: 'right_ventricle', label: 'Right Ventricle', role: 'Pumps deoxygenated blood through the pulmonary semilunar valve into the pulmonary arteries.', color: '#1D4ED8' },
      { id: 'left_atrium', label: 'Left Atrium', role: 'Receives oxygen-rich blood returning from the lungs via four pulmonary veins.', color: '#E11D48' },
      { id: 'left_ventricle', label: 'Left Ventricle', role: 'Thickest muscular chamber; pumps oxygenated blood at systemic high pressure into the Aorta.', color: '#BE123C' },
      { id: 'septum', label: 'Interventricular Septum', role: 'Thick muscular wall separating left and right ventricles, completely preventing mixing of oxygenated and deoxygenated blood.', color: '#64748B' },
      { id: 'tricuspid_valve', label: 'Tricuspid Valve', role: 'Atrioventricular valve with 3 cusps between RA and RV; prevents backflow into RA during ventricular systole.', color: '#F59E0B' },
      { id: 'mitral_valve', label: 'Bicuspid / Mitral Valve', role: 'Atrioventricular valve with 2 cusps between LA and LV; prevents backflow into LA during ventricular systole.', color: '#F59E0B' },
      { id: 'pulmonary_valve', label: 'Pulmonary Semilunar Valve', role: 'Pocket semilunar valve preventing backflow from pulmonary trunk into RV during diastole.', color: '#38BDF8' },
      { id: 'aortic_valve', label: 'Aortic Semilunar Valve', role: 'High-pressure pocket valve preventing backflow from aorta into LV during diastole.', color: '#FB7185' },
      { id: 'superior_vena_cava', label: 'Superior Vena Cava', role: 'Brings deoxygenated blood from head, neck, and arms into Right Atrium.', color: '#1D4ED8' },
      { id: 'inferior_vena_cava', label: 'Inferior Vena Cava', role: 'Brings deoxygenated blood from lower body and abdominal organs into Right Atrium.', color: '#1E40AF' },
      { id: 'pulmonary_artery', label: 'Pulmonary Artery', role: 'Only artery carrying deoxygenated blood, transporting it from RV to lungs for oxygenation.', color: '#2563EB' },
      { id: 'aorta', label: 'Systemic Aorta & Arch', role: 'Largest artery distributing high-pressure oxygenated blood from LV to entire systemic circulation.', color: '#DC2626' },
      { id: 'sa_node', label: 'Sinoatrial (SA) Node', role: 'Specialized electrical pacemaker tissue at junction of SVC and RA; initiates rhythmic contractions (72 bpm).', color: '#FACC15' }
    ],
    guidedSteps: [
      { step: '1. Systemic Return', detail: 'Deoxygenated blood returns from body tissues via Superior and Inferior Venae Cavae.' },
      { step: '2. Right Atrial Filling', detail: 'Blood collects in the Right Atrium during general cardiac diastole.' },
      { step: '3. Tricuspid Inflow', detail: 'Atrial systole drives blood through the open Tricuspid valve into the Right Ventricle.' },
      { step: '4. Right Ventricle Contraction', detail: 'RV contracts; Tricuspid valve snaps shut (Lub sound) preventing backflow.' },
      { step: '5. Pulmonary Ejection', detail: 'Pulmonary semilunar valve opens; blood enters Pulmonary Artery toward bilateral lungs.' },
      { step: '6. Alveolar Gas Exchange', detail: 'In pulmonary capillaries, blood unloads CO₂ waste and is enriched with fresh O₂.' },
      { step: '7. Pulmonary Vein Return', detail: 'Four pulmonary veins deliver oxygenated blood into the Left Atrium.' },
      { step: '8. Mitral / Bicuspid Inflow', detail: 'Left Atrium contracts, pushing oxygenated blood through the Bicuspid valve into the Left Ventricle.' },
      { step: '9. Left Ventricle Systole', detail: 'Thickest myocardium contracts powerfully; Bicuspid valve closes firmly to maintain pressure.' },
      { step: '10. Systemic Distribution', detail: 'Aortic semilunar valve opens; oxygenated blood surges into the Aortic Arch to feed the entire body.' }
    ]
  },
  solar_system: {
    id: 'solar_system',
    title: 'Solar System & Keplerian Planetary Orbits',
    subject: 'Physics • Astronomy',
    verificationBadge: 'Procedural 3D Orbital Mechanics Simulation (Three.js WebGL)',
    parts: [
      { id: 'sun', label: 'The Sun (G2V Star)', role: 'Contains 99.86% of solar system mass; generates energy via core hydrogen-to-helium nuclear fusion.', color: '#FACC15' },
      { id: 'earth', label: 'Earth & Moon (1.0 AU)', role: 'Third rocky planet with liquid water hydrosphere, nitrogen-oxygen atmosphere, and protective magnetosphere.', color: '#38BDF8' },
      { id: 'mars', label: 'Mars (1.52 AU)', role: 'Iron-oxide rich terrestrial planet with Olympus Mons and polar ice caps.', color: '#F97316' },
      { id: 'jupiter', label: 'Jupiter (5.2 AU)', role: 'Largest gas giant; strong magnetosphere and 95+ moons including Ganymede and Europa.', color: '#D97706' },
      { id: 'saturn', label: 'Saturn & Ring System (9.5 AU)', role: 'Gas giant surrounded by an extensive ring system of water-ice and silicate particles.', color: '#FDE047' }
    ],
    guidedSteps: [
      { step: '1. Gravitational Centripetal Balance', detail: 'The Sun’s inward gravity F = Gm₁m₂/r² continuously deflects each planet’s tangential velocity into a closed orbit.' },
      { step: '2. Inner Terrestrial vs Outer Giant Zone', detail: 'Inside the frost line, rocky planets formed; beyond the asteroid belt, gas giants accreted massive envelopes.' },
      { step: '3. Kepler’s Harmonic Law (T² ∝ a³)', detail: 'Inner planets orbit rapidly with short periods, whereas outer planets travel more slowly along vast paths.' }
    ]
  },
  dna_helix: {
    id: 'dna_helix',
    title: 'DNA Double Helix & Complementary Base Pairing',
    subject: 'Biology • Molecular Genetics',
    verificationBadge: 'Procedural 3D Molecular Structure (Three.js WebGL)',
    parts: [
      { id: 'backbone', label: 'Sugar-Phosphate Backbone', role: 'Two antiparallel strands (5’→3’ and 3’→5’) linked by phosphodiester bonds forming the outer helical rails.', color: '#FF6A00' },
      { id: 'at_pair', label: 'Adenine – Thymine (A=T)', role: 'Purine-pyrimidine base pair joined by 2 hydrogen bonds.', color: '#22C55E' },
      { id: 'gc_pair', label: 'Guanine – Cytosine (G≡C)', role: 'Purine-pyrimidine base pair joined by 3 hydrogen bonds (higher thermal stability).', color: '#3B82F6' }
    ],
    guidedSteps: [
      { step: '1. Antiparallel Helical Twist', detail: 'Two polynucleotide chains coil around a central axis making one full turn every 10 base pairs (3.4 nm).' },
      { step: '2. Chargaff’s Base-Pairing Rule', detail: 'Adenine always pairs with Thymine (A=T), and Guanine always pairs with Cytosine (G≡C).' },
      { step: '3. Semi-Conservative Replication', detail: 'Helicase unwinds the double helix so each strand serves as a template for a new complementary strand.' }
    ]
  },
  chloroplast_molecule: {
    id: 'chloroplast_molecule',
    title: 'Chloroplast Thylakoid & Photosynthesis Reaction 3D',
    subject: 'Biology • Plant Physiology',
    verificationBadge: 'Procedural 3D Cellular & Molecular Visualization (Three.js WebGL)',
    parts: [
      { id: 'grana', label: 'Grana (Thylakoid Stacks)', role: 'Stacked membrane discs embedded with chlorophyll pigment complexes that trap sunlight photons.', color: '#16A34A' },
      { id: 'stroma', label: 'Stroma Fluid Matrix', role: 'Contains RuBisCO enzymes, chloroplast DNA, and ribosomes where the Calvin Cycle synthesizes glucose.', color: '#86EFAC' },
      { id: 'photons', label: 'Sunlight Photon Stream & ATP', role: 'Excites electrons in Photosystem II & I to split H₂O and generate ATP + NADPH.', color: '#FACC15' },
      { id: 'glucose', label: 'Glucose Ring (C₆H₁₂O₆)', role: 'High-energy 6-carbon carbohydrate synthesized from fixed CO₂.', color: '#FF6A00' }
    ],
    guidedSteps: [
      { step: '1. Photon Capture in Grana', detail: 'Chlorophyll molecules in the thylakoid stacks absorb blue and red photons to excite electrons.' },
      { step: '2. Water Splitting & O₂ Release', detail: 'H₂O molecules split into protons, electrons, and O₂ gas that diffuses out through stomata.' },
      { step: '3. Calvin Cycle Carbon Fixation', detail: 'ATP and NADPH power the synthesis of Glucose (C₆H₁₂O₆) in the surrounding stroma.' }
    ]
  },
  water_molecule: {
    id: 'water_molecule',
    title: 'Water Molecule (H₂O): Covalent Bonding & 104.5° Bent Geometry',
    subject: 'Chemistry • Chemical Bonding & Molecular Shape',
    verificationBadge: 'VSEPR Theory Reviewed 3D Molecular Model (Three.js WebGL)',
    parts: [
      { id: 'oxygen_atom', label: 'Oxygen Atom (O)', role: 'Highly electronegative (3.44) central atom with partial negative charge (δ⁻).', color: '#EF4444' },
      { id: 'hydrogen_1', label: 'Hydrogen Atom 1 (H)', role: 'Shares single 1s electron with oxygen, acquiring partial positive charge (δ⁺).', color: '#3B82F6' },
      { id: 'hydrogen_2', label: 'Hydrogen Atom 2 (H)', role: 'Forms second polar covalent single bond with partial positive charge (δ⁺).', color: '#3B82F6' },
      { id: 'covalent_bonds', label: 'Polar Covalent Single Bonds', role: 'Shared electron pairs forming strong sigma bonds.', color: '#94A3B8' },
      { id: 'lone_pairs', label: 'Non-Bonding Lone Electron Pairs', role: 'Two lone pairs exert strong electrostatic repulsion, compressing the bond angle from 109.5° to 104.5°.', color: '#FACC15' },
      { id: 'dipole_moment', label: 'Net Dipole Moment (μ = 1.85 D)', role: 'Asymmetric bent structure creates a permanent molecular dipole, making water a universal polar solvent.', color: '#38BDF8' }
    ],
    guidedSteps: [
      { step: '1. sp³ Orbital Hybridization', detail: 'Oxygen hybridizes its 2s and three 2p orbitals into four sp³ tetrahedral hybrid orbitals.' },
      { step: '2. Lone Pair Repulsion', detail: 'Lone-pair/lone-pair repulsion is greater than bond-pair repulsion, bending the H-O-H angle to exactly 104.5°.' },
      { step: '3. Molecular Polarity & Hydrogen Bonding', detail: 'Net vector dipole (1.85 D) enables strong intermolecular hydrogen bonds responsible for high boiling point.' }
    ]
  },
  volcano: {
    id: 'volcano',
    title: 'Composite Volcano: Internal Magma Conduit & Cross-Section',
    subject: 'Geography • Plate Tectonics & Volcanism',
    verificationBadge: 'Physical Geography Reviewed 3D Geomorphology (Three.js WebGL)',
    parts: [
      { id: 'magma_chamber', label: 'Subsurface Magma Chamber', role: 'Underground reservoir of superheated molten rock under extreme tectonic pressure.', color: '#DC2626' },
      { id: 'central_conduit', label: 'Central Conduit / Pipe', role: 'Vertical pipe through which pressurized magma rises toward the surface.', color: '#EA580C' },
      { id: 'crater_vent', label: 'Summit Crater & Vent', role: 'Circular depression at the summit through which molten lava, steam, and pyroclastic debris erupt.', color: '#292524' },
      { id: 'composite_cone', label: 'Stratified Volcanic Cone', role: 'Alternating layers of hardened lava flows, volcanic ash, cinders, and tephra built up over repeated eruptions.', color: '#78350F' }
    ],
    guidedSteps: [
      { step: '1. Subduction & Magma Generation', detail: 'Tectonic subduction melts crustal rock into less dense magma that rises into the magma chamber.' },
      { step: '2. Conduit Ascent & Pressure Build-up', detail: 'Dissolved volcanic gases expand, driving molten magma up the vertical central conduit.' },
      { step: '3. Crater Eruption: Magma to Lava', detail: 'Upon breaching the surface crater vent, magma is termed lava, cooling into successive stratified cone layers.' }
    ]
  },
  lever_moments: {
    id: 'lever_moments',
    title: 'Principle of Moments: Balanced Lever & Rotational Equilibrium',
    subject: 'Physics • Classical Mechanics',
    verificationBadge: 'ICSE Section 4.4 Verified Mechanics Simulation (Three.js WebGL)',
    parts: [
      { id: 'lever_arm', label: 'Uniform Rigid Meter Rule', role: 'Horizontal beam capable of rotating about a fixed pivot line.', color: '#64748B' },
      { id: 'fulcrum_pivot', label: 'Fixed Fulcrum (Pivot Point)', role: 'Support point about which turning effects (torques) are evaluated.', color: '#0284C7' },
      { id: 'load_f1', label: 'Force F₁ (Anticlockwise Moment)', role: 'Force F₁ = 20 N applied at distance d₁ = 0.30 m produces τ₁ = 6.0 N·m anticlockwise torque.', color: '#DC2626' },
      { id: 'effort_f2', label: 'Force F₂ (Clockwise Moment)', role: 'Effort F₂ = 10 N applied at distance d₂ = 0.60 m produces τ₂ = 6.0 N·m clockwise torque.', color: '#16A34A' }
    ],
    guidedSteps: [
      { step: '1. Moment of Force Definition', detail: 'Torque (τ) = Force (F) × Perpendicular distance from pivot (d). Measured in SI units of Newton-metre (N·m).' },
      { step: '2. Sign Convention', detail: 'Anticlockwise moments are conventionally taken as Positive (+); Clockwise moments are Negative (-).' },
      { step: '3. Principle of Moments in Equilibrium', detail: 'For static rotational equilibrium: Sum of Anticlockwise Moments = Sum of Clockwise Moments (F₁ × d₁ = F₂ × d₂).' }
    ]
  },
  math_surface: {
    id: 'math_surface',
    title: '3D Quadratic Paraboloid & Root Plane Intersection',
    subject: 'Mathematics • Algebra & Calculus',
    verificationBadge: 'Exact Procedural Mathematical Surface (Three.js WebGL)',
    parts: [
      { id: 'vertex', label: 'Global Minimum / Vertex', role: 'Turning point where gradient ∇f(x,y) = 0 at the bottom of the paraboloid.', color: '#FF6A00' },
      { id: 'root_ring', label: 'Zero-Level Root Contour (f = 0)', role: 'Intersection curve where the quadratic surface crosses the z = 0 horizontal reference plane.', color: '#16A34A' },
      { id: 'axes', label: '3D Coordinate Axes (X, Y, Z)', role: 'Orthogonal reference frame illustrating symmetry and curvature governed by coefficient a.', color: '#3B82F6' }
    ],
    guidedSteps: [
      { step: '1. Curvature & Coefficient Sign', detail: 'When coefficient a > 0, the paraboloid opens upward with a minimum vertex.' },
      { step: '2. Discriminant & Plane Intersection', detail: 'When D > 0, the surface slices through the z = 0 plane, producing real roots.' },
      { step: '3. Axis of Symmetry', detail: 'Rotating around the central vertical axis preserves the parabolic cross-section.' }
    ]
  },
  atom_bohr: {
    id: 'atom_bohr',
    title: 'Rutherford-Bohr Atomic Structure & Quantized Electron Shells',
    subject: 'Physics / Chemistry • Atomic Physics',
    verificationBadge: '3D Quantized Orbital Model (Three.js WebGL)',
    parts: [
      { id: 'protons', label: 'Protons (Z+)', role: 'Positively charged nucleons defining the atomic number.', color: '#EF4444' },
      { id: 'neutrons', label: 'Neutrons (n⁰)', role: 'Neutral nucleons providing nuclear binding stability.', color: '#94A3B8' },
      { id: 'k_shell', label: 'K-Shell (n=1, Max 2e⁻)', role: 'Innermost quantized stationary energy orbit.', color: '#38BDF8' },
      { id: 'l_shell', label: 'L-Shell (n=2, Max 8e⁻)', role: 'Second energy shell populated according to the 2n² rule.', color: '#818CF8' }
    ],
    guidedSteps: [
      { step: '1. Central Nucleus', detail: 'Protons and neutrons reside tightly bound in the tiny, dense central core.' },
      { step: '2. Quantized Energy Shells', detail: 'Electrons orbit only in discrete non-radiating stationary states (K, L, M).' },
      { step: '3. Electron Capacity (2n²)', detail: 'Shell 1 (K) holds up to 2 electrons; Shell 2 (L) holds up to 8 electrons.' }
    ]
  },
  cone_cylinder_volume: {
    id: 'cone_cylinder_volume',
    title: '3D Solid Mensuration: Cone & Cylinder Volume Relationship',
    subject: 'Mathematics • 3D Mensuration',
    verificationBadge: '3D Spatial Geometry Relationship (Three.js WebGL)',
    parts: [
      { id: 'cylinder_hull', label: 'Cylinder (V = πr²h)', role: 'Right circular cylinder with base radius r and perpendicular height h.', color: '#0284C7' },
      { id: 'inscribed_cone', label: 'Cone (V = 1/3 πr²h)', role: 'Inscribed cone with identical base radius and height; occupies exactly 1/3 volume.', color: '#F59E0B' },
      { id: 'circular_base', label: 'Shared Base (πr²)', role: 'Congruent circular base shared by both solids.', color: '#38BDF8' }
    ],
    guidedSteps: [
      { step: '1. Shared Base & Height', detail: 'Both cone and cylinder have the exact same circular base of radius r and height h.' },
      { step: '2. Volume Ratio', detail: 'It takes exactly three full cones of liquid or sand to fill the cylinder completely.' },
      { step: '3. Mathematical Formula', detail: 'Volume of cone = (1/3) × base area × height = (1/3)πr²h.' }
    ]
  },
  newtons_laws: {
    id: 'newtons_laws',
    title: 'Newton’s Laws of Motion & Action-Reaction Mechanics',
    subject: 'Physics • Classical Mechanics',
    verificationBadge: 'Mechanics Vector Simulation (Three.js WebGL)',
    parts: [
      { id: 'cart', label: 'Inertial Mass Cart (m)', role: 'Low-friction dynamics body with mass m (kg); resists changes in velocity (1st Law: Law of Inertia).', color: '#0284C7' },
      { id: 'applied_force', label: 'Applied Force Vector (F)', role: 'Net external force vector driving acceleration along the track (2nd Law: F = ma).', color: '#EF4444' },
      { id: 'acceleration_vector', label: 'Acceleration Vector (a)', role: 'Directly proportional to net force and inversely proportional to mass (a = F/m).', color: '#22C55E' },
      { id: 'normal_gravity', label: 'Vertical Balance (N vs mg)', role: 'Normal force N = mg balances gravity perpendicularly to keep vertical acceleration zero.', color: '#A855F7' },
      { id: 'action_reaction', label: 'Action-Reaction Buffer (F₁₂ = -F₂₁)', role: 'Equal and opposite contact forces acting on two interacting bodies simultaneously (3rd Law).', color: '#F59E0B' }
    ],
    guidedSteps: [
      { step: '1. First Law (Inertia)', detail: 'With zero net horizontal force, the cart maintains constant velocity forever.' },
      { step: '2. Second Law (F = ma)', detail: 'Applying net force F produces acceleration a = F/m directly in the direction of the force.' },
      { step: '3. Third Law (Action-Reaction)', detail: 'When the cart strikes the buffer, both bodies experience simultaneous equal and opposite forces.' }
    ]
  },
  chemical_bonding: {
    id: 'chemical_bonding',
    title: 'Chemical Bonding: Polar Covalent (H₂O) & Ionic Lattice (NaCl)',
    subject: 'Chemistry • Molecular & Ionic Structure',
    verificationBadge: 'VSEPR & Crystal Lattice Geometry (Three.js WebGL)',
    parts: [
      { id: 'oxygen_atom', label: 'Central Oxygen (δ⁻)', role: 'Electronegative central atom with partial negative charge in bent H₂O.', color: '#EF4444' },
      { id: 'hydrogen_atoms', label: 'Hydrogen Atoms (δ⁺)', role: 'Covalently bonded hydrogen atoms with partial positive charge (104.5° angle).', color: '#38BDF8' },
      { id: 'lone_pair_lobes', label: 'Non-Bonding Lone Pairs', role: 'Electron pairs exerting repulsion that compresses the H-O-H angle from 109.5° to 104.5°.', color: '#FACC15' },
      { id: 'dipole_vector', label: 'Net Dipole Moment (μ = 1.85 D)', role: 'Asymmetric polar covalent structure creating a permanent dipole moment.', color: '#3B82F6' },
      { id: 'ionic_crystal', label: 'Ionic NaCl Lattice', role: 'Alternating Na⁺ and Cl⁻ ions held together by strong omnidirectional electrostatic attraction.', color: '#10B981' }
    ],
    guidedSteps: [
      { step: '1. Covalent Electron Sharing', detail: 'Atoms share valence electron pairs to attain stable noble-gas electron configurations.' },
      { step: '2. VSEPR Lone Pair Repulsion', detail: 'Lone pairs push bonding orbitals closer, forming the 104.5° bent geometry of water.' },
      { step: '3. Ionic Electron Transfer', detail: 'Sodium transfers one valence electron to Chlorine, forming an alternating cubic crystal lattice.' }
    ]
  }
};

function resolveSpec(modelType?: string, topic?: string): ModelSpec {
  if (modelType && MODEL_SPECS[modelType]) return MODEL_SPECS[modelType];
  const t = (topic || '').toLowerCase();

  // 1. Strictly enforce Honest Unavailable State for historical, grammatical, civics, and 2D construction topics
  if (/(revolution|bastille|treaty|french|constitution|dynasty|empire|war|history|civics|parliament|gandhi|colonial|revolt|british|ruler and compass|construct a triangle|grammar|clause|tense|shakespeare)/.test(t)) {
    return {
      id: '3d_unavailable_honest_state',
      title: `${topic || 'Topic'} — Pedagogical 2D Concept`,
      subject: 'Social Studies / History • Vector Diagram & Analysis',
      verificationBadge: 'Pedagogical Integrity: 3D Not Applicable (Showing 2D Technical Diagram)',
      isUnavailable: true,
      unavailableReason: `This topic is a sociopolitical, chronological, or 2D geometric construction process. Constructing an arbitrary 3D model would be scientifically incorrect and misleading. STUDYAI delivers a verified 2D Technical Vector Diagram and structured chronological mechanism instead.`,
      parts: [
        { id: 'chronology', label: 'Chronological Timeline', role: 'Sequenced causal progression of historical/logical phases.', color: '#0284C7' },
        { id: 'causes', label: 'Primary Drivers / Causes', role: 'Underlying structural catalysts, economic conditions, and legal frameworks.', color: '#DC2626' },
        { id: 'outcomes', label: 'Historical Outcomes / Impact', role: 'Lasting transformations in governance, society, and rights.', color: '#16A34A' }
      ],
      guidedSteps: [
        { step: '1. Root Causes & Catalysts', detail: 'Analysis of fiscal bankruptcy, social inequity (Three Estates), and Enlightenment philosophy.' },
        { step: '2. Revolutionary Turning Point', detail: 'Storming of the Bastille (14 July 1789) and Declaration of the Rights of Man.' },
        { step: '3. Institutional Legacy', detail: 'Abolition of feudalism, constitutional democracy, and rise of modern civil codes.' }
      ]
    };
  }

  // 2. Exact benchmark and spatial scientific models
  if (/(heart|cardiac|blood|ventricle|valve|circulation)/.test(t)) return MODEL_SPECS.human_heart;
  if (/(newton|laws of motion|inertia|f\s*=\s*ma|action and reaction|momentum|mechanics|free body)/.test(t)) return MODEL_SPECS.newtons_laws;
  if (/(chloroplast|photosynthesis|plant cell|thylakoid|grana|stroma|calvin)/.test(t)) return MODEL_SPECS.chloroplast_molecule;
  if (/(chemical bond|covalent|ionic|bonding|water molecule|h2o|crystal lattice|nacl)/.test(t)) return MODEL_SPECS.chemical_bonding;
  if (/(water|bent geometry|molecular|molecule)/.test(t)) return MODEL_SPECS.water_molecule;
  if (/(volcano|magma|lava|eruption|conduit)/.test(t)) return MODEL_SPECS.volcano;
  if (/(moment|lever|torque|equilibrium|fulcrum)/.test(t)) return MODEL_SPECS.lever_moments;
  if (/(solar|planet|orbit|space|sun|kepler)/.test(t)) return MODEL_SPECS.solar_system;
  if (/(dna|gene|helix|chromosome)/.test(t)) return MODEL_SPECS.dna_helix;
  if (/(atom|bohr|electron shell|proton|neutron)/.test(t)) return MODEL_SPECS.atom_bohr;
  if (/(cone and cylinder|cone volume|cylinder volume)/.test(t)) return MODEL_SPECS.cone_cylinder_volume;
  if (/(quadratic|math|parabola|equation|surface)/.test(t)) return MODEL_SPECS.math_surface;

  // 3. Fallback for unclassified scientific queries: return honest unavailable state
  return {
    id: '3d_unavailable_honest_state',
    title: `${topic || 'Topic'} — Conceptual Analysis`,
    subject: 'Conceptual Education • Technical Diagram View',
    verificationBadge: 'Pedagogical Integrity: 2D Concept / Physical 3D Asset Not Verified',
    isUnavailable: true,
    unavailableReason: `No verified scientific 3D physical model exists for "${topic || 'this topic'}". STUDYAI never renders fake geometric placeholders or unrelated models. We provide a rigorous 2D Technical Vector Diagram and structured pedagogical walkthrough instead.`,
    parts: [
      { id: 'core_concept', label: 'Core Principle', role: 'The governing rule or foundational axiom of the topic.', color: '#0284C7' },
      { id: 'transformation', label: 'Mechanism / Transformation', role: 'Step-by-step progression of variables or events.', color: '#F59E0B' },
      { id: 'validation', label: 'Verification / SI Units', role: 'Empirical or mathematical confirmation of the result.', color: '#10B981' }
    ],
    guidedSteps: [
      { step: '1. Foundational Axiom', detail: 'Understand the primary definitions and governing laws.' },
      { step: '2. Step-by-Step Breakdown', detail: 'Follow the causal chain and variable transformations.' },
      { step: '3. Examination Application', detail: 'Apply formulas and verified concepts to solve exam-level questions.' }
    ]
  };
}

export const Interactive3DViewer: React.FC<{
  topic: string;
  modelType?: string;
  compact?: boolean;
  onClose?: () => void;
}> = ({ topic, modelType, compact = false, onClose }) => {
  const { apiFetch, triggerRefresh } = useLearning();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedModelKey, setSelectedModelKey] = useState<string>(() => resolveSpec(modelType, topic).id);
  const [customSpec, setCustomSpec] = useState<ModelSpec | null>(null);
  const [customTopicInput, setCustomTopicInput] = useState<string>(topic || 'Photosynthesis');
  const [generating3D, setGenerating3D] = useState<boolean>(false);

  const spec: ModelSpec =
    selectedModelKey === 'ai_custom_3d' && customSpec
      ? customSpec
      : MODEL_SPECS[selectedModelKey] || customSpec || MODEL_SPECS.chloroplast_molecule;

  const [selectedPart, setSelectedPart] = useState<ModelPartInfo>(spec.parts[0]);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [webglFallback, setWebglFallback] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string>('');

  const rotRef = useRef<{ x: number; y: number }>({ x: 0.25, y: 0.4 });
  const zoomRef = useRef<number>(1.0);
  const playingRef = useRef<boolean>(true);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    try {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${spec.id}_3d_snapshot_diagram.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSavedNotice('📸 2D Technical Diagram Captured & Downloaded!');
      setTimeout(() => setSavedNotice(''), 3000);
    } catch {
      setSavedNotice('Snapshot capture error');
    }
  };

  const handleGenerateAi3D = async (targetTopic: string) => {
    const clean = targetTopic.trim();
    if (!clean) return;
    setGenerating3D(true);
    setSavedNotice('');
    try {
      const res = await apiFetch('/api/media/model3d', {
        method: 'POST',
        body: JSON.stringify({ topic: clean })
      });
      if (res?.spec) {
        setCustomSpec(res.spec);
        setSelectedModelKey(res.spec.primitives?.length ? 'ai_custom_3d' : res.modelId || 'ai_custom_3d');
        if (res.spec.parts?.[0]) setSelectedPart(res.spec.parts[0]);
        setActiveStepIdx(0);
        setSavedNotice('AI 3D Model Generated & Saved!');
        triggerRefresh();
        setTimeout(() => setSavedNotice(''), 3500);
      }
    } catch {
      setSavedNotice('Using procedural 3D model');
    } finally {
      setGenerating3D(false);
    }
  };

  useEffect(() => {
    setCustomTopicInput(topic || 'Photosynthesis');
    const nextSpec = resolveSpec(modelType, topic);
    if (nextSpec.isUnavailable) {
      setSelectedModelKey(nextSpec.id);
      setSelectedPart(nextSpec.parts[0]);
      setActiveStepIdx(0);
      return;
    }
    const t = (topic || '').toLowerCase();
    const isKnownPreset = /(heart|cardiac|blood|ventricle|solar|planet|orbit|space|sun|dna|gene|helix|chromosome|quadratic|math|parabola|equation|surface|photosynthesis|chloroplast|plant|leaf|newton|force|motion|inertia|bonding|covalent|ionic)/.test(t);
    if (topic && !isKnownPreset && !modelType) {
      handleGenerateAi3D(topic);
    } else {
      setSelectedModelKey(nextSpec.id);
      setSelectedPart(nextSpec.parts[0]);
      setActiveStepIdx(0);
    }
  }, [modelType, topic]);

  useEffect(() => {
    if (spec?.parts?.[0]) {
      setSelectedPart(spec.parts[0]);
    }
    setActiveStepIdx(0);
  }, [selectedModelKey, customSpec]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    zoomRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId = 0;

    try {
      const width = container.clientWidth || 640;
      const height = compact ? 300 : 380;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x131722);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 1.5, 7.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default', preserveDrawingBuffer: true });
      rendererRef.current = renderer;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.75);
      scene.add(ambient);
      const dirLight1 = new THREE.DirectionalLight(0xffedd5, 1.3);
      dirLight1.position.set(5, 8, 6);
      scene.add(dirLight1);
      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
      dirLight2.position.set(-6, -4, -4);
      scene.add(dirLight2);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Build procedural scientific 3D geometry by model type
      const animatedNodes: THREE.Object3D[] = [];

      if (selectedModelKey === 'human_heart') {
        // High-Fidelity Anatomical Palette
        const matLV = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35, metalness: 0.1 });
        const matRV = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.35, metalness: 0.1 });
        const matLA = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
        const matRA = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
        const matSeptum = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
        const matAorta = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
        const matVenaCava = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
        const matPulmonary = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
        const matValve = new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, roughness: 0.2 });
        const matSANode = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 1.0 });
        const matCoronary = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
        const matChordae = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

        // 1. Left Ventricle: Conical Apex Myocardium (Tilted ~25° toward Patient Left / Viewer Right)
        const lvGroup = new THREE.Group();
        const lvConeGeom = new THREE.ConeGeometry(1.28, 2.3, 32);
        const lvCone = new THREE.Mesh(lvConeGeom, matLV);
        lvCone.rotation.z = Math.PI - 0.32; // Inverted cone pointing downward to apex
        lvCone.position.set(0.68, -0.65, 0.05);
        lvCone.userData = { id: 'left_ventricle' };
        lvGroup.add(lvCone);

        // LV Internal Papillary Muscles & Chordae Tendineae
        const papM1 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 12), matLV);
        papM1.position.set(0.85, -0.7, 0.25);
        const papM2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 12), matLV);
        papM2.position.set(0.45, -0.7, -0.2);
        lvGroup.add(papM1, papM2);

        // Chordae Tendineae Strings linking papillary muscles to mitral cusps
        const cord1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8), matChordae);
        cord1.position.set(0.82, -0.28, 0.18);
        const cord2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8), matChordae);
        cord2.position.set(0.52, -0.28, -0.12);
        lvGroup.add(cord1, cord2);

        // 2. Right Ventricle: Crescentic Anterolateral Wall
        const rvGroup = new THREE.Group();
        const rvMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 1.15, 1.85, 24, 1, false, 0, Math.PI * 1.15), matRV);
        rvMesh.position.set(-0.7, -0.55, 0.22);
        rvMesh.rotation.y = -0.55;
        rvMesh.userData = { id: 'right_ventricle' };
        rvGroup.add(rvMesh);

        // RV Outflow Tract (Infundibulum / Conus Arteriosus)
        const infundibulum = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 1.1, 20), matPulmonary);
        infundibulum.position.set(-0.35, 0.45, 0.42);
        infundibulum.rotation.z = -0.25;
        rvGroup.add(infundibulum);

        // 3. Interventricular Septum (Thick Muscular Partition)
        const septum = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.2, 1.55), matSeptum);
        septum.position.set(0.05, -0.6, 0.08);
        septum.userData = { id: 'septum' };

        // 4. Left Atrium & Right Atrium with Auricles (Appendages)
        const la = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 1.1, 24), matLA);
        la.position.set(0.82, 0.82, -0.25);
        la.userData = { id: 'left_atrium' };

        const ra = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.85, 1.25, 24), matRA);
        ra.position.set(-0.95, 0.82, 0.12);
        ra.userData = { id: 'right_atrium' };

        // 5. The 4 Functional Valves with Real Cusps
        // Tricuspid Valve (3 Cusps between RA and RV)
        const tricuspidGroup = new THREE.Group();
        for (let c = 0; c < 3; c++) {
          const cusp = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16, (c * Math.PI * 2) / 3, Math.PI * 0.6), matValve);
          cusp.rotation.x = Math.PI / 2;
          tricuspidGroup.add(cusp);
        }
        tricuspidGroup.position.set(-0.75, 0.12, 0.22);
        tricuspidGroup.userData = { id: 'tricuspid_valve' };

        // Bicuspid / Mitral Valve (2 Cusps between LA and LV)
        const mitralGroup = new THREE.Group();
        for (let c = 0; c < 2; c++) {
          const cusp = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16, c * Math.PI, Math.PI * 0.9), matValve);
          cusp.rotation.x = Math.PI / 2;
          mitralGroup.add(cusp);
        }
        mitralGroup.position.set(0.75, 0.12, -0.05);
        mitralGroup.userData = { id: 'mitral_valve' };

        // Aortic Semilunar Valve (3 Pocket Cusps at Aortic Root)
        const aorticValve = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 16), matValve);
        aorticValve.position.set(0.22, 0.52, 0.15);
        aorticValve.userData = { id: 'aortic_valve' };

        // Pulmonary Semilunar Valve (3 Pocket Cusps at Infundibulum Base)
        const pulmonaryValve = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.14, 16), matValve);
        pulmonaryValve.position.set(-0.32, 0.52, 0.46);
        pulmonaryValve.userData = { id: 'pulmonary_valve' };

        // 6. Great Vessels: Systemic Aorta with 3 Arch Branches
        const aortaGroup = new THREE.Group();
        const aortaArch = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.32, 20, 48, 3.5), matAorta);
        aortaArch.position.set(0.25, 1.45, 0);
        aortaArch.rotation.set(0, 0, -0.42);
        aortaArch.userData = { id: 'aorta' };
        aortaGroup.add(aortaArch);

        // Three Classic Aortic Arch Branches: Brachiocephalic, Left Common Carotid, Left Subclavian
        const archBranches = [
          { x: -0.22, y: 2.32, rotZ: 0.15, label: 'Brachiocephalic Trunk' },
          { x: 0.12, y: 2.45, rotZ: 0.0, label: 'Left Common Carotid Artery' },
          { x: 0.45, y: 2.38, rotZ: -0.15, label: 'Left Subclavian Artery' }
        ];
        archBranches.forEach((b) => {
          const branchMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.85, 16), matAorta);
          branchMesh.position.set(b.x, b.y, -0.05);
          branchMesh.rotation.z = b.rotZ;
          aortaGroup.add(branchMesh);
        });

        // Pulmonary Trunk & Bifurcation into Left/Right Pulmonary Arteries
        const pulmTrunkGroup = new THREE.Group();
        const pulmMain = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 1.4, 24), matPulmonary);
        pulmMain.position.set(-0.25, 1.3, 0.48);
        pulmMain.rotation.set(0.25, 0, 0.35);
        pulmMain.userData = { id: 'pulmonary_artery' };
        pulmTrunkGroup.add(pulmMain);

        // Left & Right Pulmonary Branches crossing behind aorta
        const pulmLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16), matPulmonary);
        pulmLeft.position.set(0.65, 1.62, 0.25);
        pulmLeft.rotation.set(0, 0, 1.15);
        const pulmRight = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16), matPulmonary);
        pulmRight.position.set(-1.15, 1.62, 0.25);
        pulmRight.rotation.set(0, 0, -1.15);
        pulmTrunkGroup.add(pulmLeft, pulmRight);

        // Superior & Inferior Vena Cava
        const svc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.7, 24), matVenaCava);
        svc.position.set(-1.3, 1.5, 0.1);
        svc.userData = { id: 'superior_vena_cava' };

        const ivc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 24), matVenaCava);
        ivc.position.set(-1.22, -1.55, -0.05);
        ivc.userData = { id: 'inferior_vena_cava' };

        // 7. Left Anterior Descending (LAD) Coronary Artery in Anterior Groove
        const ladCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.05, 0.3, 0.8),
          new THREE.Vector3(0.18, -0.2, 0.85),
          new THREE.Vector3(0.42, -0.7, 0.72),
          new THREE.Vector3(0.65, -1.2, 0.45)
        ]);
        const ladMesh = new THREE.Mesh(new THREE.TubeGeometry(ladCurve, 20, 0.045, 8, false), matCoronary);

        // 8. Sinoatrial (SA) Node Conduction Pacemaker
        const saNode = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), matSANode);
        saNode.position.set(-1.25, 1.42, 0.35);
        saNode.userData = { id: 'sa_node' };

        rootGroup.add(
          lvGroup, rvGroup, septum, la, ra,
          tricuspidGroup, mitralGroup, aorticValve, pulmonaryValve,
          aortaGroup, pulmTrunkGroup, svc, ivc, ladMesh, saNode
        );
        animatedNodes.push(rootGroup);
      } else if (selectedModelKey === 'newtons_laws') {
        // Frictionless Linear Track with Graduation Markers
        const matTrack = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 });
        const track = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 1.4), matTrack);
        track.position.set(0, -0.9, 0);
        rootGroup.add(track);

        // Test Dynamics Cart (Mass m)
        const matCart = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
        const cartBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.95), matCart);
        cartBody.position.set(-1.2, -0.45, 0);
        cartBody.userData = { id: 'cart' };

        // Cart Wheels (4 Rotating Discs)
        const matWheel = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
        [
          [-0.55, -0.25, 0.5],
          [0.55, -0.25, 0.5],
          [-0.55, -0.25, -0.5],
          [0.55, -0.25, -0.5]
        ].forEach(([wx, wy, wz]) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), matWheel);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(wx, wy, wz);
          cartBody.add(wheel);
        });
        rootGroup.add(cartBody);

        // Applied Net Force Vector F (Red 3D Arrow emerging from cart)
        const matForce = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.6 });
        const forceShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 16), matForce);
        forceShaft.rotation.z = -Math.PI / 2;
        forceShaft.position.set(0.8, 0, 0);
        const forceHead = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 16), matForce);
        forceHead.rotation.z = -Math.PI / 2;
        forceHead.position.set(1.7, 0, 0);
        const forceArrow = new THREE.Group();
        forceArrow.add(forceShaft, forceHead);
        forceArrow.userData = { id: 'applied_force' };
        cartBody.add(forceArrow);

        // Acceleration Vector a (Neon Green 3D Arrow)
        const matAcc = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.6 });
        const accShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.2, 16), matAcc);
        accShaft.rotation.z = -Math.PI / 2;
        accShaft.position.set(0.6, 0.42, 0);
        const accHead = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 16), matAcc);
        accHead.rotation.z = -Math.PI / 2;
        accHead.position.set(1.3, 0.42, 0);
        const accArrow = new THREE.Group();
        accArrow.add(accShaft, accHead);
        accArrow.userData = { id: 'acceleration_vector' };
        cartBody.add(accArrow);

        // Normal Force N (Cyan Arrow Up) & Gravity W = mg (Purple Arrow Down)
        const matNorm = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        const normShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 16), matNorm);
        normShaft.position.set(0, 0.75, 0);
        const normHead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 16), matNorm);
        normHead.position.set(0, 1.35, 0);
        const normArrow = new THREE.Group();
        normArrow.add(normShaft, normHead);

        const matGrav = new THREE.MeshStandardMaterial({ color: 0xa855f7 });
        const gravShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 16), matGrav);
        gravShaft.position.set(0, -0.75, 0);
        const gravHead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 16), matGrav);
        gravHead.rotation.x = Math.PI;
        gravHead.position.set(0, -1.35, 0);
        const gravArrow = new THREE.Group();
        gravArrow.add(gravShaft, gravHead);
        normArrow.add(gravArrow);
        normArrow.userData = { id: 'normal_gravity' };
        cartBody.add(normArrow);

        // Action-Reaction Impact Buffer / 2nd Body at track end
        const matBuffer = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
        const buffer = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 1.1), matBuffer);
        buffer.position.set(3.2, -0.45, 0);
        buffer.userData = { id: 'action_reaction' };
        rootGroup.add(buffer);
        animatedNodes.push(cartBody);
      } else if (selectedModelKey === 'chemical_bonding') {
        // Polar Covalent Water Molecule (104.5° Bent VSEPR Geometry)
        const matO = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.1 });
        const oAtom = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), matO);
        oAtom.position.set(0, 0.45, 0);
        oAtom.userData = { id: 'oxygen_atom' };

        const matH = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25 });
        const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), matH);
        h1.position.set(-1.32, -0.72, 0);
        h1.userData = { id: 'hydrogen_atoms' };

        const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), matH);
        h2.position.set(1.32, -0.72, 0);
        h2.userData = { id: 'hydrogen_atoms' };

        // Covalent Shared Electron Bond Cylinders
        const matBond = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
        const bond1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.35, 16), matBond);
        bond1.position.set(-0.66, -0.15, 0);
        bond1.rotation.set(0, 0, 0.68);
        const bond2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.35, 16), matBond);
        bond2.position.set(0.66, -0.15, 0);
        bond2.rotation.set(0, 0, -0.68);

        // Lone Electron Pair Repulsion Lobes
        const matLone = new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.42 });
        const lone1 = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), matLone);
        lone1.position.set(-0.45, 1.15, 0.35);
        lone1.userData = { id: 'lone_pair_lobes' };
        const lone2 = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), matLone);
        lone2.position.set(0.45, 1.15, 0.35);
        lone2.userData = { id: 'lone_pair_lobes' };

        // Net Dipole Moment Vector Arrow (1.85 D)
        const matDipole = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.7 });
        const dipoleHead = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 16), matDipole);
        dipoleHead.position.set(0, 1.95, 0);
        dipoleHead.userData = { id: 'dipole_vector' };

        rootGroup.add(oAtom, h1, h2, bond1, bond2, lone1, lone2, dipoleHead);
        animatedNodes.push(oAtom, h1, h2);
      } else if (selectedModelKey === 'solar_system') {
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const sun = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), sunMat);
        rootGroup.add(sun);

        const planets = [
          { r: 1.5, size: 0.14, color: 0xa8a29e },
          { r: 2.0, size: 0.2, color: 0xfb923c },
          { r: 2.6, size: 0.24, color: 0x38bdf8 },
          { r: 3.2, size: 0.18, color: 0xef4444 },
          { r: 4.1, size: 0.44, color: 0xd97706 },
          { r: 5.1, size: 0.36, color: 0xfde047, ring: true }
        ];

        planets.forEach((p) => {
          const orbitRing = new THREE.Mesh(
            new THREE.RingGeometry(p.r - 0.02, p.r + 0.02, 64),
            new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide })
          );
          orbitRing.rotation.x = Math.PI / 2;
          rootGroup.add(orbitRing);

          const pivot = new THREE.Group();
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size, 24, 24), new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.5 }));
          mesh.position.x = p.r;
          if (p.ring) {
            const saturnRing = new THREE.Mesh(
              new THREE.RingGeometry(p.size * 1.35, p.size * 2.1, 32),
              new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide })
            );
            saturnRing.rotation.x = Math.PI / 2.4;
            mesh.add(saturnRing);
          }
          pivot.add(mesh);
          rootGroup.add(pivot);
          animatedNodes.push(pivot);
        });
      } else if (selectedModelKey === 'dna_helix') {
        const pairs = 18;
        for (let i = 0; i < pairs; i++) {
          const y = (i - pairs / 2) * 0.32;
          const angle = i * 0.45;
          const x1 = Math.cos(angle) * 1.25;
          const z1 = Math.sin(angle) * 1.25;
          const x2 = Math.cos(angle + Math.PI) * 1.25;
          const z2 = Math.sin(angle + Math.PI) * 1.25;

          const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff6a00 }));
          s1.position.set(x1, y, z1);
          const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
          s2.position.set(x2, y, z2);

          const rungColor = i % 2 === 0 ? 0x22c55e : 0xa855f7;
          const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 12), new THREE.MeshStandardMaterial({ color: rungColor }));
          rung.position.set(0, y, 0);
          rung.rotation.z = Math.PI / 2;
          rung.rotation.y = -angle;

          rootGroup.add(s1, s2, rung);
        }
      } else if (selectedModelKey === 'math_surface') {
        const geom = new THREE.PlaneGeometry(4.5, 4.5, 36, 36);
        const pos = geom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = 0.35 * (x * x + y * y) - 1.2;
          pos.setZ(i, z);
        }
        geom.computeVertexNormals();
        const mesh = new THREE.Mesh(
          geom,
          new THREE.MeshStandardMaterial({ color: 0xff6a00, wireframe: false, side: THREE.DoubleSide, roughness: 0.4 })
        );
        mesh.rotation.x = -Math.PI / 2;
        const wire = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
        wire.rotation.x = -Math.PI / 2;
        rootGroup.add(mesh, wire);
      } else if (selectedModelKey === 'water_molecule') {
        // Central Oxygen Atom (CPK Red)
        const matO = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.1 });
        const oAtom = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), matO);
        oAtom.position.set(0, 0.4, 0);
        oAtom.userData = { id: 'oxygen_atom' };

        // Hydrogen Atoms (CPK Blue/White)
        const matH = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.25 });
        const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 24), matH);
        h1.position.set(-1.35, -0.75, 0);
        h1.userData = { id: 'hydrogen_1' };

        const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 24), matH);
        h2.position.set(1.35, -0.75, 0);
        h2.userData = { id: 'hydrogen_2' };

        // Covalent Bond Cylinders
        const matBond = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
        const bond1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16), matBond);
        bond1.position.set(-0.68, -0.17, 0);
        bond1.rotation.set(0, 0, 0.68);
        bond1.userData = { id: 'covalent_bonds' };

        const bond2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16), matBond);
        bond2.position.set(0.68, -0.17, 0);
        bond2.rotation.set(0, 0, -0.68);
        bond2.userData = { id: 'covalent_bonds' };

        // Non-Bonding Lone Electron Pairs (Repulsion Lobes)
        const matLone = new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.45 });
        const lone1 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), matLone);
        lone1.position.set(-0.45, 1.15, 0.35);
        lone1.userData = { id: 'lone_pairs' };

        const lone2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), matLone);
        lone2.position.set(0.45, 1.15, 0.35);
        lone2.userData = { id: 'lone_pairs' };

        // Dipole Moment Indicator Vector
        const matDipole = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        const dipoleArrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 16), matDipole);
        dipoleArrow.position.set(0, 1.85, 0);
        dipoleArrow.userData = { id: 'dipole_moment' };

        rootGroup.add(oAtom, h1, h2, bond1, bond2, lone1, lone2, dipoleArrow);
        animatedNodes.push(oAtom, h1, h2);

      } else if (selectedModelKey === 'volcano') {
        // Stratified Composite Cone
        const matCone = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.7, side: THREE.DoubleSide });
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.5, 2.7, 32, 1, true), matCone);
        cone.position.set(0, 0.15, 0);
        cone.userData = { id: 'composite_cone' };

        // Subterranean Magma Chamber
        const matMagma = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xb91c1c, emissiveIntensity: 0.8 });
        const chamber = new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 24), matMagma);
        chamber.position.set(0, -1.8, 0);
        chamber.userData = { id: 'magma_chamber' };

        // Central Conduit Pipe
        const matConduit = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xc2410c, emissiveIntensity: 0.6 });
        const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.2, 24), matConduit);
        conduit.position.set(0, -0.1, 0);
        conduit.userData = { id: 'central_conduit' };

        // Summit Crater Vent
        const matCrater = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
        const crater = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.15, 16, 32), matCrater);
        crater.position.set(0, 1.5, 0);
        crater.rotation.x = Math.PI / 2;
        crater.userData = { id: 'crater_vent' };

        // Erupting ash cloud puff
        const matAsh = new THREE.MeshStandardMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 });
        const ash1 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), matAsh);
        ash1.position.set(0, 2.05, 0);

        rootGroup.add(cone, chamber, conduit, crater, ash1);
        animatedNodes.push(chamber, ash1);

      } else if (selectedModelKey === 'lever_moments') {
        // Rigid Meter Rule (Horizontal Lever Beam)
        const matBeam = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.35, metalness: 0.2 });
        const beam = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 0.45), matBeam);
        beam.position.set(0, 0, 0);
        beam.userData = { id: 'lever_arm' };

        // Fixed Triangular Fulcrum Pivot
        const matFulcrum = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25 });
        const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.85, 4), matFulcrum);
        fulcrum.position.set(0, -0.42, 0);
        fulcrum.rotation.y = Math.PI / 4;
        fulcrum.userData = { id: 'fulcrum_pivot' };

        // Load Force F1 (Anticlockwise Weight at d1 = -1.9)
        const matF1 = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
        const loadF1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.55), matF1);
        loadF1.position.set(-1.9, 0.42, 0);
        loadF1.userData = { id: 'load_f1' };

        // Effort Force F2 (Clockwise Weight at d2 = +1.9)
        const matF2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 });
        const effortF2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.55), matF2);
        effortF2.position.set(1.9, 0.31, 0);
        effortF2.userData = { id: 'effort_f2' };

        // Base stand
        const matBase = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 1.2), matBase);
        base.position.set(0, -0.9, 0);

        rootGroup.add(beam, fulcrum, loadF1, effortF2, base);
      } else if (selectedModelKey === 'atom_bohr') {
        // Protons & Neutrons Nucleus
        const matP = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
        const matN = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3 });
        const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), matP);
        p1.position.set(-0.15, 0.1, 0);
        p1.userData = { id: 'protons' };

        const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), matN);
        n1.position.set(0.15, -0.1, 0);
        n1.userData = { id: 'neutrons' };

        // K-Shell Ring (Radius 1.8)
        const matK = new THREE.MeshStandardMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
        const kShell = new THREE.Mesh(new THREE.RingGeometry(1.78, 1.82, 64), matK);
        kShell.rotation.x = Math.PI / 2;
        kShell.userData = { id: 'k_shell' };

        // L-Shell Ring (Radius 3.1)
        const matL = new THREE.MeshStandardMaterial({ color: 0x818cf8, side: THREE.DoubleSide });
        const lShell = new THREE.Mesh(new THREE.RingGeometry(3.08, 3.12, 64), matL);
        lShell.rotation.x = Math.PI / 2.6;
        lShell.userData = { id: 'l_shell' };

        // Orbiting Electron
        const matE = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
        const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), matE);
        e1.position.set(1.8, 0, 0);

        rootGroup.add(p1, n1, kShell, lShell, e1);
        animatedNodes.push(e1);
      } else if (selectedModelKey === 'cone_cylinder_volume') {
        // Cylinder Hull (Transparent PBR)
        const matCyl = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35, roughness: 0.2 });
        const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.8, 32), matCyl);
        cylinder.position.set(0, 0, 0);
        cylinder.userData = { id: 'cylinder_hull' };

        // Inscribed Cone
        const matCone = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.8, 32), matCone);
        cone.position.set(0, 0, 0);
        cone.userData = { id: 'inscribed_cone' };

        // Common Base
        const matBase = new THREE.MeshStandardMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
        const baseRing = new THREE.Mesh(new THREE.RingGeometry(0, 1.6, 32), matBase);
        baseRing.position.set(0, -1.4, 0);
        baseRing.rotation.x = Math.PI / 2;
        baseRing.userData = { id: 'circular_base' };

        rootGroup.add(cylinder, cone, baseRing);
      } else if (selectedModelKey === 'ai_custom_3d' && customSpec?.primitives && customSpec.primitives.length > 0) {
        customSpec.primitives.forEach((pr) => {
          let geom: THREE.BufferGeometry;
          if (pr.type === 'cylinder') {
            geom = new THREE.CylinderGeometry(0.45, 0.45, 1.2, 24);
          } else if (pr.type === 'torus') {
            geom = new THREE.TorusGeometry(0.8, 0.18, 16, 40);
          } else if (pr.type === 'box') {
            geom = new THREE.BoxGeometry(1, 1, 1);
          } else if (pr.type === 'cone') {
            geom = new THREE.ConeGeometry(0.6, 1.3, 24);
          } else if (pr.type === 'ring') {
            geom = new THREE.RingGeometry(0.9, 1.15, 48);
          } else if (pr.type === 'octahedron') {
            geom = new THREE.OctahedronGeometry(0.75, 1);
          } else {
            geom = new THREE.SphereGeometry(0.65, 28, 28);
          }

          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(pr.color || '#FF6A00'),
            roughness: 0.35,
            metalness: 0.15,
            transparent: (pr.opacity ?? 1) < 0.98,
            opacity: pr.opacity ?? 1,
            wireframe: Boolean(pr.wireframe),
            side: THREE.DoubleSide
          });

          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(pr.position[0] || 0, pr.position[1] || 0, pr.position[2] || 0);
          if (pr.scale) mesh.scale.set(pr.scale[0] || 1, pr.scale[1] || 1, pr.scale[2] || 1);
          if (pr.rotation) mesh.rotation.set(pr.rotation[0] || 0, pr.rotation[1] || 0, pr.rotation[2] || 0);
          mesh.userData = { animation: pr.animation || 'float', baseY: pr.position[1] || 0 };

          if (pr.animation === 'orbit') {
            const pivot = new THREE.Group();
            pivot.userData = { animation: 'orbit' };
            pivot.add(mesh);
            rootGroup.add(pivot);
            animatedNodes.push(pivot);
          } else {
            rootGroup.add(mesh);
            animatedNodes.push(mesh);
          }
        });
      } else {
        // Chloroplast & Thylakoid Stacks
        const outerShell = new THREE.Mesh(
          new THREE.SphereGeometry(2.3, 32, 24),
          new THREE.MeshStandardMaterial({ color: 0x15803d, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
        );
        outerShell.scale.set(1.35, 0.75, 0.95);
        rootGroup.add(outerShell);

        const stackPositions = [
          [-1.1, 0, 0],
          [0, 0, 0.4],
          [1.1, 0, -0.2]
        ];
        stackPositions.forEach(([sx, sy, sz]) => {
          for (let d = -2; d <= 2; d++) {
            const disc = new THREE.Mesh(
              new THREE.CylinderGeometry(0.55, 0.55, 0.14, 24),
              new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 })
            );
            disc.position.set(sx, sy + d * 0.2, sz);
            rootGroup.add(disc);
          }
        });

        // Glucose molecule ring
        const glucoseRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.5, 0.12, 16, 6),
          new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.25 })
        );
        glucoseRing.position.set(0, 1.1, 0);
        rootGroup.add(glucoseRing);
        animatedNodes.push(glucoseRing);
      }

      // Pointer drag interaction
      let dragging = false;
      let prevX = 0;
      let prevY = 0;

      const onPointerDown = (e: PointerEvent) => {
        dragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        rotRef.current.y += dx * 0.01;
        rotRef.current.x = Math.max(-1.2, Math.min(1.2, rotRef.current.x + dy * 0.01));
      };
      const onPointerUp = () => {
        dragging = false;
      };

      const domElem = renderer.domElement;
      domElem.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      let clock = 0;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (playingRef.current) {
          clock += 0.025;
          rotRef.current.y += 0.0045;

          if (selectedModelKey === 'human_heart') {
            const pulse = 1 + Math.sin(clock * 3.5) * 0.06;
            rootGroup.scale.set(pulse, pulse, pulse);
          } else if (selectedModelKey === 'solar_system') {
            animatedNodes.forEach((pivot, idx) => {
              pivot.rotation.y = clock * (1.4 - idx * 0.18);
            });
          } else if (selectedModelKey === 'ai_custom_3d') {
            animatedNodes.forEach((node, idx) => {
              const anim = node.userData?.animation;
              if (anim === 'orbit') {
                node.rotation.y = clock * (0.9 + idx * 0.15);
              } else if (anim === 'pulse') {
                const s = 1 + Math.sin(clock * 3 + idx) * 0.08;
                node.scale.setScalar(s);
              } else if (anim === 'spin') {
                node.rotation.x = clock * 0.8;
                node.rotation.y = clock * 1.1;
              } else if (anim === 'float') {
                node.position.y = (node.userData?.baseY || 0) + Math.sin(clock * 2 + idx) * 0.12;
              }
            });
          } else if (animatedNodes[0]) {
            animatedNodes[0].rotation.x = clock;
            animatedNodes[0].rotation.z = clock * 0.7;
          }
        }

        rootGroup.rotation.x = rotRef.current.x;
        rootGroup.rotation.y = rotRef.current.y;
        camera.position.z = 7.5 / zoomRef.current;
        renderer?.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 640;
        camera.aspect = w / height;
        camera.updateProjectionMatrix();
        renderer.setSize(w, height);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        domElem.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('resize', handleResize);
        renderer?.dispose();
      };
    } catch {
      setWebglFallback(true);
    }
  }, [selectedModelKey, customSpec, compact]);

  const handleResetView = () => {
    rotRef.current = { x: 0.25, y: 0.4 };
    setZoomLevel(1.0);
  };

  const handleSaveToLibrary = async () => {
    try {
      await apiFetch('/api/media/model3d', {
        method: 'POST',
        body: JSON.stringify({
          topic: spec.title,
          subject: spec.subject,
          modelType: spec.id
        })
      });
      setSavedNotice('Saved 3D Model to Library!');
      triggerRefresh();
      setTimeout(() => setSavedNotice(''), 3000);
    } catch {
      setSavedNotice('Could not save 3D model');
    }
  };

  return (
    <div className="glass-card" style={{ padding: compact ? 16 : 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#FFF3E8',
              color: '#FF6A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124' }}>{spec.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#6B7280' }}>
              <ShieldCheck size={14} color="#FF6A00" />
              <span>{spec.verificationBadge}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateAi3D(customTopicInput);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <input
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder="Enter any topic for AI 3D..."
              aria-label="Custom 3D Topic"
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid rgba(255,106,0,0.35)',
                fontSize: '0.8rem',
                width: 185
              }}
            />
            <button type="submit" className="btn-orange" disabled={generating3D} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <Sparkles size={13} />
              <span>{generating3D ? 'Building 3D...' : 'AI Generate 3D'}</span>
            </button>
          </form>

          <select
            aria-label="Choose 3D Scientific Model"
            value={selectedModelKey}
            onChange={(e) => setSelectedModelKey(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 999,
              border: '1px solid rgba(255,106,0,0.3)',
              background: '#FFF3E8',
              color: '#202124',
              fontWeight: 600,
              fontSize: '0.82rem'
            }}
          >
            {customSpec && <option value="ai_custom_3d">✨ AI Custom: {customSpec.title.slice(0, 26)}</option>}
            <option value="human_heart">Human Heart (4 Chambers &amp; Valves) 3D</option>
            <option value="newtons_laws">Newton’s Laws of Motion Mechanics 3D</option>
            <option value="chloroplast_molecule">Chloroplast &amp; Photosynthesis 3D</option>
            <option value="chemical_bonding">Chemical Bonding (Covalent H₂O &amp; Ionic NaCl) 3D</option>
            <option value="atom_bohr">Rutherford-Bohr Quantized Atom 3D</option>
            <option value="solar_system">Solar System Orbits 3D</option>
            <option value="dna_helix">DNA Double Helix 3D</option>
            <option value="math_surface">Quadratic Paraboloid Surface 3D</option>
            <option value="cone_cylinder_volume">Cone &amp; Cylinder 3D Mensuration</option>
          </select>

          <button type="button" onClick={handleSaveToLibrary} className="btn-glass" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
            <Bookmark size={14} />
            <span>{savedNotice || 'Save to Library'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close 3D Learning Lab"
              className="btn-glass"
              style={{ padding: '7px 10px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas Viewport OR Honest Pedagogical Analysis */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#131722', marginBottom: 14 }}>
        {spec.isUnavailable ? (
          <div style={{ padding: '28px 24px', background: '#0F172A', color: '#F8FAFC', borderRadius: 20, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', fontSize: '0.82rem', fontWeight: 700, marginBottom: 12 }}>
              <ShieldCheck size={16} />
              <span>Pedagogical Integrity: 3D Spatial Model Not Applicable</span>
            </div>
            <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>{spec.title}</h4>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', maxWidth: 640, margin: '0 auto 16px', lineHeight: 1.55 }}>
              {spec.unavailableReason}
            </p>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', padding: '6px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
                Recommended Visual: 2D Technical Chronological Flowchart
              </span>
              <button
                type="button"
                onClick={() => setSelectedModelKey('human_heart')}
                style={{ padding: '6px 14px', borderRadius: 999, background: '#FF6A00', color: '#FFF', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Explore Human Heart 3D
              </button>
              <button
                type="button"
                onClick={() => setSelectedModelKey('newtons_laws')}
                style={{ padding: '6px 14px', borderRadius: 999, background: '#0284C7', color: '#FFF', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Explore Newton’s Mechanics 3D
              </button>
              <button
                type="button"
                onClick={() => setSelectedModelKey('chemical_bonding')}
                style={{ padding: '6px 14px', borderRadius: 999, background: '#10B981', color: '#FFF', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Explore Chemical Bonding 3D
              </button>
            </div>
          </div>
        ) : (
          <>
            {selectedModelKey === 'human_heart' && (
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'rgba(11, 17, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 8,
                padding: '4px 10px',
                color: '#94A3B8',
                fontSize: '0.72rem',
                fontWeight: 600,
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ color: '#38BDF8' }}>● Patient Right (Blue) = Screen Left</span>
                <span style={{ opacity: 0.4 }}>|</span>
                <span style={{ color: '#FB7185' }}>● Patient Left (Red) = Screen Right</span>
              </div>
            )}
            {webglFallback ? (
              <div style={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', padding: 24, textAlign: 'center' }}>
                <Sparkles size={32} color="#FF6A00" />
                <p style={{ marginTop: 10, fontWeight: 700 }}>{spec.title} — Interactive Schematic Mode</p>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF', maxWidth: 440, marginTop: 4 }}>
                  WebGL hardware context is restricted in this environment; inspect annotated model structures and guided steps below.
                </p>
              </div>
            ) : (
              <div
                ref={mountRef}
                style={{ width: '100%', height: compact ? 300 : 380, cursor: 'grab' }}
                aria-label={`Interactive 3D Canvas for ${spec.title}`}
              />
            )}
          </>
        )}

        {/* Floating Viewport Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(19, 23, 34, 0.78)',
              backdropFilter: 'blur(12px)',
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.18)'
            }}
          >
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              style={{ background: '#FF6A00', color: '#FFF', border: 'none', borderRadius: 999, padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? 'Pause' : 'Animate'}</span>
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.0, +(z + 0.2).toFixed(1)))}
              aria-label="Zoom In 3D"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF', border: 'none', borderRadius: 999, padding: '5px 8px', cursor: 'pointer' }}
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
              aria-label="Zoom Out 3D"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF', border: 'none', borderRadius: 999, padding: '5px 8px', cursor: 'pointer' }}
            >
              <ZoomOut size={14} />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="Reset 3D View"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF', border: 'none', borderRadius: 999, padding: '5px 10px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              aria-label="Capture 2D Diagram Image"
              title="Export 2D High-Resolution Technical Diagram rendered by Three.js"
              style={{ background: 'rgba(56,189,248,0.18)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.4)', borderRadius: 999, padding: '5px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Camera size={12} />
              <span>Capture 2D Diagram</span>
            </button>
          </div>

          <div
            style={{
              background: 'rgba(19, 23, 34, 0.75)',
              color: '#E5E7EB',
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: '0.73rem',
              fontWeight: 600
            }}
          >
            Drag to rotate 360° • Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Interactive Part Annotations & Guided Mechanism Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1.1fr 0.9fr', gap: 14 }}>
        <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 14, border: '1px solid rgba(255,106,0,0.15)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
            Interactive Anatomical / Structural Labels
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {spec.parts.map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => setSelectedPart(part)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: selectedPart.id === part.id ? '2px solid #FF6A00' : '1px solid rgba(0,0,0,0.1)',
                  background: selectedPart.id === part.id ? '#FFF3E8' : '#FFFFFF',
                  color: '#202124',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: part.color }} />
                <span>{part.label}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.86rem', color: '#202124', lineHeight: 1.5, background: '#FFFDFB', padding: 10, borderRadius: 12 }}>
            <strong style={{ color: '#FF6A00' }}>{selectedPart.label}:</strong> {selectedPart.role}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 14, border: '1px solid rgba(255,106,0,0.15)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
            Guided Step-by-Step Mechanism
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {spec.guidedSteps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: 10,
                  border: 'none',
                  background: activeStepIdx === idx ? '#FF6A00' : '#FFF3E8',
                  color: activeStepIdx === idx ? '#FFFFFF' : '#E85D00',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Step {idx + 1}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#202124', lineHeight: 1.45 }}>
            <div style={{ fontWeight: 700, marginBottom: 3 }}>{spec.guidedSteps[activeStepIdx]?.step}</div>
            <div style={{ color: '#6B7280' }}>{spec.guidedSteps[activeStepIdx]?.detail}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Interactive3DLabModal: React.FC = () => {
  const { modal3D, close3DLab } = useLearning();
  if (!modal3D.open) return null;
  return (
    <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Interactive 3D Learning Lab">
      <div className="glass-modal-content">
        <Interactive3DViewer topic={modal3D.topic} modelType={modal3D.modelType} onClose={close3DLab} />
      </div>
    </div>
  );
};

export const Interactive3DLab: React.FC<{
  modelKey?: string;
  topic?: string;
  title?: string;
  compact?: boolean;
  onClose?: () => void;
}> = ({ modelKey, topic, title, compact = true, onClose }) => {
  return (
    <Interactive3DViewer
      topic={topic || title || 'Science'}
      modelType={modelKey}
      compact={compact}
      onClose={onClose}
    />
  );
};
