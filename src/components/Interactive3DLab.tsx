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
  }
};

function resolveSpec(modelType?: string, topic?: string): ModelSpec {
  if (modelType && MODEL_SPECS[modelType]) return MODEL_SPECS[modelType];
  const t = (topic || '').toLowerCase();
  if (/(heart|cardiac|blood|ventricle)/.test(t)) return MODEL_SPECS.human_heart;
  if (/(water|h2o|covalent|bent|molecular|molecule)/.test(t)) return MODEL_SPECS.water_molecule;
  if (/(volcano|magma|lava|eruption|conduit)/.test(t)) return MODEL_SPECS.volcano;
  if (/(moment|lever|torque|equilibrium|fulcrum)/.test(t)) return MODEL_SPECS.lever_moments;
  if (/(solar|planet|orbit|space|sun)/.test(t)) return MODEL_SPECS.solar_system;
  if (/(dna|gene|helix|chromosome)/.test(t)) return MODEL_SPECS.dna_helix;
  if (/(quadratic|math|parabola|equation|surface)/.test(t)) return MODEL_SPECS.math_surface;
  return MODEL_SPECS.chloroplast_molecule;
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
    const t = (topic || '').toLowerCase();
    const isKnownPreset = /(heart|cardiac|blood|ventricle|solar|planet|orbit|space|sun|dna|gene|helix|chromosome|quadratic|math|parabola|equation|surface|photosynthesis|chloroplast|plant|leaf)/.test(t);
    if (topic && !isKnownPreset && !modelType) {
      handleGenerateAi3D(topic);
    } else {
      const nextSpec = resolveSpec(modelType, topic);
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
        // Anatomical Palette: Blue (Deoxygenated / Patient Right), Red (Oxygenated / Patient Left), Gold (Valves & SA Node), Slate (Septum)
        const matLV = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.35, metalness: 0.1 });
        const matRV = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35, metalness: 0.1 });
        const matLA = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });
        const matRA = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
        const matSeptum = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
        const matAorta = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
        const matVenaCava = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.3 });
        const matPulmonary = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });
        const matValve = new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
        const matSANode = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.8 });

        // Left Ventricle (Thick Muscular Systemic Apex - Patient Left / Viewer Right)
        const lv = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 32), matLV);
        lv.scale.set(1.0, 1.45, 0.95);
        lv.position.set(0.75, -0.65, 0.1);
        lv.userData = { id: 'left_ventricle' };

        // Right Ventricle (Patient Right / Viewer Left)
        const rv = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 32), matRV);
        rv.scale.set(0.95, 1.3, 0.85);
        rv.position.set(-0.75, -0.55, 0.25);
        rv.userData = { id: 'right_ventricle' };

        // Left Atrium (Patient Left / Viewer Right)
        const la = new THREE.Mesh(new THREE.SphereGeometry(0.82, 28, 28), matLA);
        la.position.set(0.85, 0.85, -0.2);
        la.userData = { id: 'left_atrium' };

        // Right Atrium (Patient Right / Viewer Left)
        const ra = new THREE.Mesh(new THREE.SphereGeometry(0.88, 28, 28), matRA);
        ra.position.set(-0.85, 0.85, 0.15);
        ra.userData = { id: 'right_atrium' };

        // Interventricular Septum (Partition preventing blood mixing)
        const septum = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.2, 1.6), matSeptum);
        septum.position.set(0.0, -0.6, 0.1);
        septum.userData = { id: 'septum' };

        // Tricuspid Valve (Between RA and RV)
        const tricuspid = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.38, 24), matValve);
        tricuspid.rotation.x = Math.PI / 2;
        tricuspid.position.set(-0.78, 0.1, 0.2);
        tricuspid.userData = { id: 'tricuspid_valve' };

        // Bicuspid / Mitral Valve (Between LA and LV)
        const mitral = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.38, 24), matValve);
        mitral.rotation.x = Math.PI / 2;
        mitral.position.set(0.78, 0.1, -0.05);
        mitral.userData = { id: 'mitral_valve' };

        // Pulmonary Semilunar Valve (Base of Pulmonary Trunk)
        const pulmonaryValve = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16), matValve);
        pulmonaryValve.position.set(-0.35, 0.45, 0.55);
        pulmonaryValve.userData = { id: 'pulmonary_valve' };

        // Aortic Semilunar Valve (Base of Aortic Root)
        const aorticValve = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 16), matValve);
        aorticValve.position.set(0.25, 0.45, 0.25);
        aorticValve.userData = { id: 'aortic_valve' };

        // Systemic Aorta & Arch
        const aorta = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.32, 20, 40, 3.4), matAorta);
        aorta.position.set(0.22, 1.4, 0);
        aorta.rotation.set(0, 0, -0.4);
        aorta.userData = { id: 'aorta' };

        // Superior Vena Cava
        const svc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.6, 24), matVenaCava);
        svc.position.set(-1.2, 1.45, 0.1);
        svc.userData = { id: 'superior_vena_cava' };

        // Inferior Vena Cava
        const ivc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.4, 24), matVenaCava);
        ivc.position.set(-1.15, -1.5, -0.1);
        ivc.userData = { id: 'inferior_vena_cava' };

        // Pulmonary Artery (Carrying deoxygenated blood to lungs)
        const pulmonaryArtery = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 24), matPulmonary);
        pulmonaryArtery.position.set(-0.25, 1.25, 0.55);
        pulmonaryArtery.rotation.set(0.2, 0, 0.3);
        pulmonaryArtery.userData = { id: 'pulmonary_artery' };

        // Separate Sinoatrial (SA) Node - Natural Pacemaker Conduction Layer
        const saNode = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), matSANode);
        saNode.position.set(-1.1, 1.35, 0.35);
        saNode.userData = { id: 'sa_node' };

        rootGroup.add(
          lv, rv, la, ra, septum,
          tricuspid, mitral, pulmonaryValve, aorticValve,
          aorta, svc, ivc, pulmonaryArtery, saNode
        );
        animatedNodes.push(rootGroup);
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
            <option value="chloroplast_molecule">Chloroplast & Photosynthesis 3D</option>
            <option value="human_heart">Human Heart (4 Chambers) 3D</option>
            <option value="solar_system">Solar System Orbits 3D</option>
            <option value="dna_helix">DNA Double Helix 3D</option>
            <option value="math_surface">Quadratic Paraboloid Surface 3D</option>
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

      {/* 3D Canvas Viewport */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#131722', marginBottom: 14 }}>
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
