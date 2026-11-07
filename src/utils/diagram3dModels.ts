import * as THREE from 'three';

export interface Diagram3DComponentMeta {
  id: string;
  name: string;
  role: string;
  color: string;
  pinPosition: [number, number, number];
  explodeVector: [number, number, number]; // Outward direction for Exploded View
  crossSectionVisible?: boolean; // Visible in cutaway mode
}

export interface Diagram3DModelResult {
  rootGroup: THREE.Group;
  components: Record<string, THREE.Object3D[]>;
  animatedNodes: THREE.Object3D[];
  cutawayMeshes: THREE.Mesh[];
  onAnimate: (clock: number, speed: number) => void;
  defaultCameraPosition: [number, number, number];
  studioBackground?: string; // e.g. warm Assemblr EDU peach or lab gray
}

// ==========================================
// 1. PHYSICS ELECTRIC CIRCUIT (Screenshot 1)
// ==========================================
export function buildElectricCircuit(): Diagram3DModelResult {
  const rootGroup = new THREE.Group();
  const components: Record<string, THREE.Object3D[]> = {
    baseboard: [],
    battery: [],
    light_bulb: [],
    switch: [],
    copper_wires: [],
    electrons: []
  };
  const animatedNodes: THREE.Object3D[] = [];
  const cutawayMeshes: THREE.Mesh[] = [];

  // Gray Lab Bench Baseboard with Chamfered Edges and Grid (Matching Screenshot 1)
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.8,
    metalness: 0.1
  });
  const baseboard = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.28, 4.2), boardMat);
  baseboard.position.set(0, -0.14, 0);
  baseboard.userData = { id: 'baseboard', name: 'Circuit Breadboard / Lab Bench' };
  rootGroup.add(baseboard);
  components.baseboard.push(baseboard);

  // Grid lines on the baseboard
  const gridHelper = new THREE.GridHelper(8.0, 16, 0x475569, 0x94a3b8);
  gridHelper.position.set(0, 0.01, 0);
  rootGroup.add(gridHelper);

  // Left side: Lightbulb in Socket (Screenshot 1)
  const socketMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.2 });
  const socketBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.45, 24), socketMat);
  socketBase.position.set(-2.8, 0.22, 0);
  const socketCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.4, 24), socketMat);
  socketCollar.position.set(-2.8, 0.58, 0);
  rootGroup.add(socketBase, socketCollar);

  // Glass Bulb (translucent)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    transmission: 0.85,
    ior: 1.5
  });
  const bulbEnvelope = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), glassMat);
  bulbEnvelope.position.set(-2.8, 1.25, 0);
  bulbEnvelope.userData = { id: 'light_bulb', name: 'Incandescent Light Bulb' };
  rootGroup.add(bulbEnvelope);
  components.light_bulb.push(bulbEnvelope, socketBase, socketCollar);

  // Tungsten Filament inside bulb
  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xfacc15,
    emissiveIntensity: 1.8
  });
  const filament = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 12, 24, Math.PI), filamentMat);
  filament.rotation.x = -Math.PI / 2;
  filament.position.set(-2.8, 1.25, 0);
  rootGroup.add(filament);
  components.light_bulb.push(filament);

  // Center: Blue Cylindrical Battery Cell (Screenshot 1)
  const cellCylMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant battery blue
    roughness: 0.3,
    metalness: 0.3
  });
  const cellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.2, 24), cellCylMat);
  cellBody.position.set(0, 0.6, 0);
  cellBody.userData = { id: 'battery', name: 'DC Chemical Battery Cell' };

  // Battery Top Cap & Terminal (+ Positive)
  const capMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const posTerminal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16), capMat);
  posTerminal.position.set(0, 1.25, 0);
  const cellHolderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const cellBracket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.9), cellHolderMat);
  cellBracket.position.set(0, 0.08, 0);

  rootGroup.add(cellBody, posTerminal, cellBracket);
  components.battery.push(cellBody, posTerminal, cellBracket);

  // Right side: Resistor / Knife Switch Component (Screenshot 1)
  const switchBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  const switchBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.6), switchBaseMat);
  switchBase.position.set(2.8, 0.1, 0);
  const switchCylMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.7, roughness: 0.3 });
  const switchCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16), switchCylMat);
  switchCyl.rotation.z = Math.PI / 2;
  switchCyl.position.set(2.8, 0.26, 0);
  switchCyl.userData = { id: 'switch', name: 'Circuit Switch / Load Resistor' };
  rootGroup.add(switchBase, switchCyl);
  components.switch.push(switchBase, switchCyl);

  // Insulated Orange Copper Wires with Silver Clips (Screenshot 1)
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xf97316, // rich insulated orange
    roughness: 0.35,
    metalness: 0.2
  });
  const clipMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 });

  // Rectangular wire loop paths
  const wireSegments = [
    // Top path from bulb to battery
    { p: [-1.4, 0.04, -1.3], size: [2.8, 0.07, 0.07], rot: [0, 0, 0] },
    // Top right path from battery to switch
    { p: [1.4, 0.04, -1.3], size: [2.8, 0.07, 0.07], rot: [0, 0, 0] },
    // Left turn from socket to top
    { p: [-2.8, 0.04, -0.65], size: [0.07, 0.07, 1.3], rot: [0, 0, 0] },
    // Left turn from socket to bottom
    { p: [-2.8, 0.04, 0.65], size: [0.07, 0.07, 1.3], rot: [0, 0, 0] },
    // Bottom path from bulb to battery
    { p: [-1.4, 0.04, 1.3], size: [2.8, 0.07, 0.07], rot: [0, 0, 0] },
    // Bottom right path from battery to switch
    { p: [1.4, 0.04, 1.3], size: [2.8, 0.07, 0.07], rot: [0, 0, 0] },
    // Right turn around switch
    { p: [2.8, 0.04, -0.65], size: [0.07, 0.07, 1.3], rot: [0, 0, 0] },
    { p: [2.8, 0.04, 0.65], size: [0.07, 0.07, 1.3], rot: [0, 0, 0] }
  ];

  wireSegments.forEach((seg, i) => {
    const wire = new THREE.Mesh(new THREE.BoxGeometry(seg.size[0], seg.size[1], seg.size[2]), wireMat);
    wire.position.set(seg.p[0], seg.p[1], seg.p[2]);
    wire.userData = { id: 'copper_wires', name: 'Insulated Copper Conductors' };
    rootGroup.add(wire);
    components.copper_wires.push(wire);

    // Terminal clips holding wire to base
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.14), clipMat);
    clip.position.set(seg.p[0], seg.p[1] + 0.02, seg.p[2]);
    rootGroup.add(clip);
  });

  // Animated Electron Particles (Cyan glowing spheres drifting along loop)
  const electronMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const electronCount = 20;
  const electronMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < electronCount; i++) {
    const el = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), electronMat);
    rootGroup.add(el);
    electronMeshes.push(el);
    animatedNodes.push(el);
  }
  components.electrons = electronMeshes;

  return {
    rootGroup,
    components,
    animatedNodes,
    cutawayMeshes,
    defaultCameraPosition: [0, 3.8, 6.2],
    studioBackground: '#0f172a',
    onAnimate: (clock: number, speed: number) => {
      // Loop electron particles around the circuit perimeter
      const loopLength = 16.0; // Perimeter
      electronMeshes.forEach((el, idx) => {
        const offset = ((clock * speed * 2.2 + (idx * loopLength) / electronCount) % loopLength);
        let x = 0;
        let z = 0;
        if (offset < 5.6) {
          // Bottom wire: -2.8 to +2.8 at z = 1.3
          x = -2.8 + offset;
          z = 1.3;
        } else if (offset < 8.2) {
          // Right edge: z = 1.3 down to -1.3 at x = 2.8
          x = 2.8;
          z = 1.3 - (offset - 5.6);
        } else if (offset < 13.8) {
          // Top wire: +2.8 to -2.8 at z = -1.3
          x = 2.8 - (offset - 8.2);
          z = -1.3;
        } else {
          // Left edge: z = -1.3 to +1.3 at x = -2.8
          x = -2.8;
          z = -1.3 + (offset - 13.8);
        }
        el.position.set(x, 0.12, z);
      });

      // Rhythmic filament glow pulsation
      const glow = 1.5 + Math.sin(clock * 4.0) * 0.3;
      filamentMat.emissiveIntensity = glow;
    }
  };
}

// ==========================================
// 2. HUMAN LUNGS & RESPIRATORY SYSTEM (Screenshot 2)
// ==========================================
export function buildHumanLungs(): Diagram3DModelResult {
  const rootGroup = new THREE.Group();
  const components: Record<string, THREE.Object3D[]> = {
    trachea: [],
    primary_bronchi: [],
    right_superior_lobe: [],
    right_middle_lobe: [],
    right_inferior_lobe: [],
    horizontal_fissure: [],
    left_superior_lobe: [],
    left_inferior_lobe: [],
    oblique_fissure: [],
    cardiac_notch: []
  };
  const animatedNodes: THREE.Object3D[] = [];
  const cutawayMeshes: THREE.Mesh[] = [];

  // Textured Pulmonary Tissue Material (Parenchyma red-pink with vascularity)
  const lungMat = new THREE.MeshStandardMaterial({
    color: 0xbe185d, // anatomical lung tissue pinkish-red
    roughness: 0.65,
    metalness: 0.15
  });

  const tracheaMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
    metalness: 0.1
  });
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // cartilaginous brown rings
    roughness: 0.3
  });

  // 1. Central Segmented Trachea with C-shaped Cartilaginous Rings (Screenshot 2)
  const tracheaGroup = new THREE.Group();
  const tracheaTube = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.0, 24), tracheaMat);
  tracheaTube.position.set(0, 1.8, 0);
  tracheaGroup.add(tracheaTube);

  // 9 Cartilage rings
  for (let r = 0; r < 9; r++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 12, 24, Math.PI * 1.7), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.95 + r * 0.2, 0);
    tracheaGroup.add(ring);
  }
  tracheaGroup.userData = { id: 'trachea', name: 'Trachea (Windpipe)' };
  rootGroup.add(tracheaGroup);
  components.trachea.push(tracheaGroup);

  // Primary Bronchi (Left and Right bifurcating at carina)
  const bronchiGroup = new THREE.Group();
  const rightBronchus = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.9, 16), tracheaMat);
  rightBronchus.rotation.z = Math.PI / 3.8;
  rightBronchus.position.set(-0.35, 0.55, 0);

  const leftBronchus = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 1.1, 16), tracheaMat);
  leftBronchus.rotation.z = -Math.PI / 3.2;
  leftBronchus.position.set(0.42, 0.5, 0);

  bronchiGroup.add(rightBronchus, leftBronchus);
  bronchiGroup.userData = { id: 'primary_bronchi', name: 'Carina & Primary Bronchi' };
  rootGroup.add(bronchiGroup);
  components.primary_bronchi.push(bronchiGroup);

  // 2. RIGHT LUNG: 3 Lobes (Superior, Middle, Inferior) + Horizontal & Oblique Fissures
  const rightLungGroup = new THREE.Group();

  // Right Superior Lobe
  const rSupGeom = new THREE.ConeGeometry(0.9, 1.5, 24);
  const rSupMesh = new THREE.Mesh(rSupGeom, lungMat);
  rSupMesh.position.set(-1.1, 0.65, 0);
  rSupMesh.rotation.z = -0.12;
  rSupMesh.scale.set(1.1, 1.0, 0.85);
  rSupMesh.userData = { id: 'right_superior_lobe', name: 'Superior Lobe of Right Lung' };
  rightLungGroup.add(rSupMesh);
  components.right_superior_lobe.push(rSupMesh);

  // Horizontal Fissure Groove Line (Divider)
  const fissureMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
  const rHorizFissure = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.04, 24), fissureMat);
  rHorizFissure.position.set(-1.1, 0.05, 0);
  rHorizFissure.scale.set(1.05, 1.0, 0.8);
  rHorizFissure.userData = { id: 'horizontal_fissure', name: 'Horizontal Fissure of Right Lung' };
  rightLungGroup.add(rHorizFissure);
  components.horizontal_fissure.push(rHorizFissure);

  // Right Middle Lobe
  const rMidGeom = new THREE.CylinderGeometry(0.85, 0.9, 0.75, 24);
  const rMidMesh = new THREE.Mesh(rMidGeom, lungMat);
  rMidMesh.position.set(-1.12, -0.35, 0);
  rMidMesh.scale.set(1.08, 1.0, 0.82);
  rMidMesh.userData = { id: 'right_middle_lobe', name: 'Middle Lobe of Right Lung' };
  rightLungGroup.add(rMidMesh);
  components.right_middle_lobe.push(rMidMesh);

  // Right Inferior Lobe (Base)
  const rInfGeom = new THREE.ConeGeometry(1.05, 1.3, 24);
  const rInfMesh = new THREE.Mesh(rInfGeom, lungMat);
  rInfMesh.position.set(-1.15, -1.05, 0);
  rInfMesh.rotation.z = Math.PI;
  rInfMesh.scale.set(1.05, 1.0, 0.85);
  rInfMesh.userData = { id: 'right_inferior_lobe', name: 'Inferior Lobe of Right Lung' };
  rightLungGroup.add(rInfMesh);
  components.right_inferior_lobe.push(rInfMesh);

  rootGroup.add(rightLungGroup);
  animatedNodes.push(rightLungGroup);

  // 3. LEFT LUNG: 2 Lobes (Superior, Inferior) with Cardiac Notch
  const leftLungGroup = new THREE.Group();

  // Left Superior Lobe
  const lSupGeom = new THREE.ConeGeometry(0.88, 1.6, 24);
  const lSupMesh = new THREE.Mesh(lSupGeom, lungMat);
  lSupMesh.position.set(1.15, 0.58, 0);
  lSupMesh.rotation.z = 0.12;
  lSupMesh.scale.set(1.05, 1.0, 0.82);
  lSupMesh.userData = { id: 'left_superior_lobe', name: 'Superior Lobe of Left Lung' };
  leftLungGroup.add(lSupMesh);
  components.left_superior_lobe.push(lSupMesh);

  // Oblique Fissure of Left Lung (Diagonal boundary)
  const lObliqueFissure = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.04, 24), fissureMat);
  lObliqueFissure.position.set(1.16, -0.15, 0);
  lObliqueFissure.rotation.z = 0.35;
  lObliqueFissure.userData = { id: 'oblique_fissure', name: 'Oblique Fissure of Left Lung' };
  leftLungGroup.add(lObliqueFissure);
  components.oblique_fissure.push(lObliqueFissure);

  // Left Inferior Lobe (Base with cardiac indentation)
  const lInfGeom = new THREE.ConeGeometry(1.0, 1.45, 24);
  const lInfMesh = new THREE.Mesh(lInfGeom, lungMat);
  lInfMesh.position.set(1.18, -1.0, 0);
  lInfMesh.rotation.z = Math.PI;
  lInfMesh.scale.set(1.02, 1.0, 0.82);
  lInfMesh.userData = { id: 'left_inferior_lobe', name: 'Inferior Lobe of Left Lung' };
  leftLungGroup.add(lInfMesh);
  components.left_inferior_lobe.push(lInfMesh);

  // Cardiac Notch (Medial concave clearance for apex of heart)
  const notchMat = new THREE.MeshBasicMaterial({ color: 0x9f1239, transparent: true, opacity: 0.35 });
  const cardiacNotch = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), notchMat);
  cardiacNotch.position.set(0.65, -0.4, 0.2);
  cardiacNotch.userData = { id: 'cardiac_notch', name: 'Cardiac Notch (Impression for Heart)' };
  leftLungGroup.add(cardiacNotch);
  components.cardiac_notch.push(cardiacNotch);

  rootGroup.add(leftLungGroup);
  animatedNodes.push(leftLungGroup);

  return {
    rootGroup,
    components,
    animatedNodes,
    cutawayMeshes,
    defaultCameraPosition: [0, 0.2, 5.5],
    studioBackground: '#f1f5f9', // Clean medical lab gray-white (Screenshot 2)
    onAnimate: (clock: number, speed: number) => {
      // Inhalation / Exhalation breathing cycle (expansion & contraction)
      const breathing = 1.0 + Math.sin(clock * speed * 1.8) * 0.075;
      rightLungGroup.scale.set(breathing, breathing, breathing);
      leftLungGroup.scale.set(breathing, breathing, breathing);
    }
  };
}

// ==========================================
// 3. TRANSPARENT TORSO LEARNING MODEL (Screenshot 3)
// ==========================================
export function buildHumanTorsoAnatomy(): Diagram3DModelResult {
  const rootGroup = new THREE.Group();
  const components: Record<string, THREE.Object3D[]> = {
    torso_shell: [],
    cranium: [],
    brain: [],
    lungs: [],
    heart: [],
    liver: [],
    stomach: [],
    large_intestine: [],
    small_intestine: [],
    muscular_arm: [],
    diagnostic_base: []
  };
  const animatedNodes: THREE.Object3D[] = [];
  const cutawayMeshes: THREE.Mesh[] = [];

  // Diagnostic Base Station (Science Can style white pedestal, Screenshot 3)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.4 });
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.6 });

  const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.2, 0.5, 32), baseMat);
  basePlinth.position.set(0, -2.4, 0);
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.08, 16, 48), accentMat);
  baseRing.position.set(0, -2.15, 0);
  baseRing.rotation.x = Math.PI / 2;
  const consoleFace = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.6), screenMat);
  consoleFace.position.set(0, -2.2, 1.4);
  consoleFace.rotation.x = 0.45;
  consoleFace.userData = { id: 'diagnostic_base', name: 'Interactive Diagnostic Base & Audio Speaker' };

  rootGroup.add(basePlinth, baseRing, consoleFace);
  components.diagnostic_base.push(basePlinth, baseRing, consoleFace);

  // Clear Transparent Acrylic Torso Shell (Screenshot 3)
  const acrylicMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    roughness: 0.08,
    transmission: 0.88,
    ior: 1.49,
    depthWrite: false
  });
  const torsoShell = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 3.2, 32), acrylicMat);
  torsoShell.position.set(0, -0.4, 0);
  torsoShell.userData = { id: 'torso_shell', name: 'Transparent Acrylic Torso Shell' };
  rootGroup.add(torsoShell);
  components.torso_shell.push(torsoShell);

  // Skull Cranium & Brain inside (Screenshot 3)
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
  const brainMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 });

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.68, 24, 24), boneMat);
  cranium.position.set(0, 1.85, 0);
  cranium.scale.set(0.9, 1.1, 0.95);
  cranium.userData = { id: 'cranium', name: 'Cranium / Skull (Craniu)' };

  const brain = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 20), brainMat);
  brain.position.set(0, 1.95, 0.05);
  brain.userData = { id: 'brain', name: 'Brain (Creier)' };
  rootGroup.add(cranium, brain);
  components.cranium.push(cranium);
  components.brain.push(brain);

  // Internal Organs: Lungs (Plămâni)
  const organLungMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });
  const lungL = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 16), organLungMat);
  lungL.position.set(-0.52, 0.35, 0);
  const lungR = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 16), organLungMat);
  lungR.position.set(0.52, 0.35, 0);
  lungL.userData = { id: 'lungs', name: 'Lungs (Plămâni)' };
  rootGroup.add(lungL, lungR);
  components.lungs.push(lungL, lungR);

  // Beating Heart in Mediastinum (Inimă)
  const organHeartMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, emissive: 0x991b1b, emissiveIntensity: 0.3 });
  const heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), organHeartMat);
  heartMesh.position.set(0.08, 0.3, 0.2);
  heartMesh.userData = { id: 'heart', name: 'Heart (Inimă)' };
  rootGroup.add(heartMesh);
  components.heart.push(heartMesh);
  animatedNodes.push(heartMesh);

  // Liver (Ficat)
  const liverMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
  const liverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.55), liverMat);
  liverMesh.position.set(-0.25, -0.28, 0.15);
  liverMesh.userData = { id: 'liver', name: 'Liver (Ficat)' };
  rootGroup.add(liverMesh);
  components.liver.push(liverMesh);

  // Stomach (Stomac)
  const stomachMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.4 });
  const stomachMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), stomachMat);
  stomachMesh.position.set(0.38, -0.32, 0.15);
  stomachMesh.scale.set(1.2, 0.8, 0.9);
  stomachMesh.userData = { id: 'stomach', name: 'Stomach (Stomac)' };
  rootGroup.add(stomachMesh);
  components.stomach.push(stomachMesh);

  // Small & Large Intestine (Intestin subțire & gros)
  const lgIntestineMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
  const lgIntestine = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 16, 24), lgIntestineMat);
  lgIntestine.position.set(0, -0.95, 0.2);
  lgIntestine.userData = { id: 'large_intestine', name: 'Large Intestine (Intestin Gros)' };

  const smIntestineMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
  const smIntestine = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), smIntestineMat);
  smIntestine.position.set(0, -0.95, 0.22);
  smIntestine.userData = { id: 'small_intestine', name: 'Small Intestine (Intestin Subțire)' };

  rootGroup.add(lgIntestine, smIntestine);
  components.large_intestine.push(lgIntestine);
  components.small_intestine.push(smIntestine);

  // Muscular Anatomical Right Arm (Mușchi, Screenshot 3)
  const muscleMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5, metalness: 0.15 });
  const armGroup = new THREE.Group();
  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), muscleMat);
  shoulder.position.set(-1.35, 0.85, 0);

  const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.1, 16), muscleMat);
  bicep.position.set(-1.42, 0.25, 0);
  bicep.rotation.z = -0.15;

  const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.2, 16), muscleMat);
  forearm.position.set(-1.5, -0.85, 0);
  forearm.rotation.z = -0.08;

  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.5, 0.14), muscleMat);
  hand.position.set(-1.52, -1.6, 0);

  armGroup.add(shoulder, bicep, forearm, hand);
  armGroup.userData = { id: 'muscular_arm', name: 'Superficial Skeletal Musculature (Mușchi)' };
  rootGroup.add(armGroup);
  components.muscular_arm.push(armGroup);

  return {
    rootGroup,
    components,
    animatedNodes,
    cutawayMeshes,
    defaultCameraPosition: [0, 0, 6.2],
    studioBackground: '#f3e8ff', // Warm lavender/violet studio backdrop (Screenshot 3)
    onAnimate: (clock: number, speed: number) => {
      // Rhythmic heart beat pulse
      const pulse = 1.0 + Math.sin(clock * speed * 4.5) * 0.12;
      heartMesh.scale.set(pulse, pulse, pulse);
    }
  };
}

// ==========================================
// 4. ASSEMBLR EDU HUMAN HEART (Screenshot 4)
// ==========================================
export function buildHumanHeart(): Diagram3DModelResult {
  const rootGroup = new THREE.Group();
  const components: Record<string, THREE.Object3D[]> = {
    aorta: [],
    pulmonary_artery: [],
    left_atrium: [],
    left_ventricle: [],
    right_atrium: [],
    right_ventricle: [],
    valves: [],
    vena_cava: []
  };
  const animatedNodes: THREE.Object3D[] = [];
  const cutawayMeshes: THREE.Mesh[] = [];

  // Deep Cutaway Anatomical Palette (Screenshot 4)
  const matLV = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35, metalness: 0.1 });
  const matRV = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.35, metalness: 0.1 });
  const matLA = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
  const matRA = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
  const matAorta = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
  const matPulm = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
  const matValve = new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, roughness: 0.2 });
  const matChordae = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

  // 1. Left Ventricle (Thick Myocardium Cutaway, Bilik Kiri)
  const lvGroup = new THREE.Group();
  const lvCone = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.3, 32), matLV);
  lvCone.rotation.z = Math.PI - 0.32;
  lvCone.position.set(0.68, -0.65, 0.05);
  lvCone.userData = { id: 'left_ventricle', name: 'Left Ventricle (Ventrikel / Bilik Kiri)' };
  lvGroup.add(lvCone);

  // Papillary Muscles & Chordae Tendineae
  const papM1 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 12), matLV);
  papM1.position.set(0.85, -0.7, 0.25);
  const chord1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8), matChordae);
  chord1.position.set(0.85, -0.28, 0.25);
  lvGroup.add(papM1, chord1);
  rootGroup.add(lvGroup);
  components.left_ventricle.push(lvGroup);
  cutawayMeshes.push(lvCone);

  // 2. Right Ventricle (Bilik Kanan)
  const rvGroup = new THREE.Group();
  const rvMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 1.15, 1.85, 24, 1, false, 0, Math.PI * 1.15), matRV);
  rvMesh.rotation.y = 0.55;
  rvMesh.position.set(-0.62, -0.45, 0.15);
  rvMesh.userData = { id: 'right_ventricle', name: 'Right Ventricle (Ventrikel / Bilik Kanan)' };
  rvGroup.add(rvMesh);
  rootGroup.add(rvGroup);
  components.right_ventricle.push(rvGroup);
  cutawayMeshes.push(rvMesh);

  // 3. Atria: Left (Serambi Kiri) & Right (Serambi Kanan)
  const la = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 1.1, 24), matLA);
  la.position.set(0.65, 0.85, -0.25);
  la.userData = { id: 'left_atrium', name: 'Left Atrium (Atrium / Serambi Kiri)' };

  const ra = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.85, 1.25, 24), matRA);
  ra.position.set(-0.85, 0.75, -0.15);
  ra.userData = { id: 'right_atrium', name: 'Right Atrium (Atrium / Serambi Kanan)' };

  rootGroup.add(la, ra);
  components.left_atrium.push(la);
  components.right_atrium.push(ra);

  // 4. Valves: Tricuspid, Mitral, Aortic (Katup, Screenshot 4)
  const valvesGroup = new THREE.Group();
  const mitralValve = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.38, 20), matValve);
  mitralValve.position.set(0.65, 0.28, 0.1);
  mitralValve.rotation.x = Math.PI / 2;

  const tricuspidValve = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.42, 20), matValve);
  tricuspidValve.position.set(-0.65, 0.22, 0.1);
  tricuspidValve.rotation.x = Math.PI / 2;

  valvesGroup.add(mitralValve, tricuspidValve);
  valvesGroup.userData = { id: 'valves', name: 'Heart Valves (Katup Jantung)' };
  rootGroup.add(valvesGroup);
  components.valves.push(valvesGroup);

  // 5. Aorta Arch with 3 Brachiocephalic Branches (Screenshot 4)
  const aortaGroup = new THREE.Group();
  const aortaArch = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.32, 20, 48, 3.5), matAorta);
  aortaArch.rotation.z = Math.PI * 0.92;
  aortaArch.position.set(0.2, 1.45, -0.1);
  aortaGroup.add(aortaArch);

  // 3 Brachiocephalic head/neck branches
  const branchAngles = [0.4, 0.9, 1.4];
  branchAngles.forEach((ang) => {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.85, 16), matAorta);
    const bx = 0.2 + Math.cos(ang) * 0.98;
    const by = 1.45 + Math.sin(ang) * 0.98;
    branch.position.set(bx, by + 0.35, -0.1);
    branch.rotation.z = -0.25;
    aortaGroup.add(branch);
  });
  aortaGroup.userData = { id: 'aorta', name: 'Aortic Arch & Systemic Branches (Aorta)' };
  rootGroup.add(aortaGroup);
  components.aorta.push(aortaGroup);

  // 6. Pulmonary Artery Trunk (Arteri Paru)
  const pulmGroup = new THREE.Group();
  const pulmTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 1.4, 24), matPulm);
  pulmTrunk.position.set(-0.15, 1.35, 0.35);
  pulmTrunk.rotation.z = -0.32;
  pulmGroup.add(pulmTrunk);
  pulmGroup.userData = { id: 'pulmonary_artery', name: 'Pulmonary Artery Trunk (Arteri Paru)' };
  rootGroup.add(pulmGroup);
  components.pulmonary_artery.push(pulmGroup);

  // 7. Vena Cava (Vena)
  const vcGroup = new THREE.Group();
  const svc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 24), matRV);
  svc.position.set(-1.3, 1.6, -0.3);
  vcGroup.add(svc);
  vcGroup.userData = { id: 'vena_cava', name: 'Vena Cava (Vena)' };
  rootGroup.add(vcGroup);
  components.vena_cava.push(vcGroup);

  // Directional Blood Flow Arrows (Screenshot 4)
  const arrowMatBlue = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const arrowMatRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const flowArrows: THREE.Mesh[] = [];

  for (let i = 0; i < 6; i++) {
    const arr = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 12), i < 3 ? arrowMatBlue : arrowMatRed);
    flowArrows.push(arr);
    rootGroup.add(arr);
  }

  // Soft Drop Shadow plane on Warm Studio Ground (Screenshot 4)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0xd97706,
    transparent: true,
    opacity: 0.18
  });
  const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(0.3, -2.4, 0);
  rootGroup.add(shadowMesh);

  animatedNodes.push(rootGroup);

  return {
    rootGroup,
    components,
    animatedNodes,
    cutawayMeshes,
    defaultCameraPosition: [0, 0.4, 6.0],
    studioBackground: '#fed7aa', // Warm Assemblr EDU peach background (Screenshot 4)
    onAnimate: (clock: number, speed: number) => {
      // Cardiac contraction cycle (Systole & Diastole)
      const heartbeat = 1.0 + Math.sin(clock * speed * 3.8) * 0.055;
      lvGroup.scale.set(heartbeat, heartbeat, heartbeat);
      rvGroup.scale.set(heartbeat, heartbeat, heartbeat);

      // Animate directional arrows through blood pathways
      flowArrows.forEach((arr, idx) => {
        const t = (clock * speed * 1.5 + idx * 0.6) % 3.0;
        if (idx < 3) {
          // Blue deoxygenated: SVC into RA and through Pulmonary trunk
          arr.position.set(-0.8 + idx * 0.25, 0.2 + t * 0.5, 0.1);
        } else {
          // Red oxygenated: LV up into Aorta arch
          arr.position.set(0.4 - (idx - 3) * 0.2, 0.4 + t * 0.6, 0.15);
        }
      });
    }
  };
}

// ==========================================
// 5. HUMAN EAR CROSS-SECTION (Screenshot 5)
// ==========================================
export function buildHumanEar(): Diagram3DModelResult {
  const rootGroup = new THREE.Group();
  const components: Record<string, THREE.Object3D[]> = {
    auricle: [],
    ear_canal: [],
    tympanic_membrane: [],
    malleus: [],
    incus: [],
    stapes: [],
    tensor_tympani: [],
    semicircular_canals: [],
    cochlea: [],
    auditory_nerves: [],
    temporal_bone: []
  };
  const animatedNodes: THREE.Object3D[] = [];
  const cutawayMeshes: THREE.Mesh[] = [];

  // 1. Auricle / Pinna Outer Ear Cartilage (Screenshot 5)
  const pinnaMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04, // warm flesh/cartilage tone
    roughness: 0.6,
    metalness: 0.1
  });
  const pinnaMesh = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.45, 16, 32, Math.PI * 1.4), pinnaMat);
  pinnaMesh.position.set(-2.2, 0.2, 0);
  pinnaMesh.rotation.z = Math.PI * 0.8;
  pinnaMesh.userData = { id: 'auricle', name: 'Auricle / Pinna (Outer Cartilage)' };
  rootGroup.add(pinnaMesh);
  components.auricle.push(pinnaMesh);

  // 2. Ear Canal (External Auditory Meatus)
  const canalMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, side: THREE.DoubleSide });
  const earCanal = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 1.8, 24, 1, true), canalMat);
  earCanal.position.set(-0.8, -0.05, 0);
  earCanal.rotation.z = Math.PI / 2;
  earCanal.userData = { id: 'ear_canal', name: 'External Auditory Canal' };
  rootGroup.add(earCanal);
  components.ear_canal.push(earCanal);

  // 3. Tympanic Membrane (Translucent Eardrum)
  const eardrumMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
    roughness: 0.2,
    transmission: 0.7,
    side: THREE.DoubleSide
  });
  const eardrum = new THREE.Mesh(new THREE.CircleGeometry(0.48, 24), eardrumMat);
  eardrum.position.set(0.12, -0.05, 0);
  eardrum.rotation.y = Math.PI / 2.3;
  eardrum.userData = { id: 'tympanic_membrane', name: 'Tympanic Membrane (Eardrum)' };
  rootGroup.add(eardrum);
  components.tympanic_membrane.push(eardrum);

  // 4. Auditory Ossicles: Malleus (Hammer), Incus (Anvil), Stapes (Stirrup)
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 });

  const malleus = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.7, 12), boneMat);
  malleus.position.set(0.3, 0.25, 0);
  malleus.rotation.z = -0.4;
  malleus.userData = { id: 'malleus', name: 'Malleus (Hammer)' };

  const incus = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 12), boneMat);
  incus.position.set(0.65, 0.38, 0);
  incus.rotation.z = 1.2;
  incus.userData = { id: 'incus', name: 'Incus (Anvil)' };

  const stapes = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 12, 16), boneMat);
  stapes.position.set(0.95, 0.28, 0);
  stapes.rotation.y = Math.PI / 2;
  stapes.userData = { id: 'stapes', name: 'Stapes (Stirrup Footplate)' };

  rootGroup.add(malleus, incus, stapes);
  components.malleus.push(malleus);
  components.incus.push(incus);
  components.stapes.push(stapes);

  // Tensor Tympani Muscle (Screenshot 5)
  const muscleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
  const tensorTympani = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.85, 12), muscleMat);
  tensorTympani.position.set(0.6, 0.65, -0.1);
  tensorTympani.rotation.z = -0.65;
  tensorTympani.userData = { id: 'tensor_tympani', name: 'Tensor Tympani Muscle' };
  rootGroup.add(tensorTympani);
  components.tensor_tympani.push(tensorTympani);

  // 5. Inner Ear: Semicircular Canals (3 Orthogonal Fluid Rings)
  const canalRingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
  const canalsGroup = new THREE.Group();

  const cSuperior = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 12, 24, Math.PI * 1.5), canalRingMat);
  cSuperior.position.set(1.3, 0.7, 0);

  const cPosterior = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 24, Math.PI * 1.5), canalRingMat);
  cPosterior.position.set(1.3, 0.6, 0.2);
  cPosterior.rotation.y = Math.PI / 2;

  const cHorizontal = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.06, 12, 24, Math.PI * 1.5), canalRingMat);
  cHorizontal.position.set(1.3, 0.35, 0);
  cHorizontal.rotation.x = Math.PI / 2;

  canalsGroup.add(cSuperior, cPosterior, cHorizontal);
  canalsGroup.userData = { id: 'semicircular_canals', name: 'Semicircular Canals (Vestibular Balance)' };
  rootGroup.add(canalsGroup);
  components.semicircular_canals.push(canalsGroup);

  // 6. Cochlea (Spiral Snail Shell Structure)
  const cochleaMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.35 });
  const cochleaGroup = new THREE.Group();
  for (let s = 0; s < 3; s++) {
    const spiralRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.35 - s * 0.08, 0.07, 12, 20),
      cochleaMat
    );
    spiralRing.position.set(1.4, -0.25 + s * 0.12, s * 0.1);
    cochleaGroup.add(spiralRing);
  }
  cochleaGroup.userData = { id: 'cochlea', name: 'Spiral Cochlea (Organ of Corti)' };
  rootGroup.add(cochleaGroup);
  components.cochlea.push(cochleaGroup);

  // 7. Auditory Vestibulocochlear Nerves (Colorful Tracts: Green/Blue/Red, Screenshot 5)
  const nerveMat1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
  const nerveMat2 = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
  const nerveMat3 = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

  const nGroup = new THREE.Group();
  const n1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 12), nerveMat1);
  n1.position.set(2.1, 0.05, 0.1);
  n1.rotation.z = Math.PI / 3;

  const n2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 12), nerveMat2);
  n2.position.set(2.0, -0.25, 0.15);
  n2.rotation.z = Math.PI / 3.2;

  const n3 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12), nerveMat3);
  n3.position.set(1.9, -0.5, 0.1);
  n3.rotation.z = Math.PI / 3.4;

  nGroup.add(n1, n2, n3);
  nGroup.userData = { id: 'auditory_nerves', name: 'Cranial Nerve VIII (Vestibulocochlear)' };
  rootGroup.add(nGroup);
  components.auditory_nerves.push(nGroup);

  // Temporal Bone Surrounding Cavity (Porous Bone cross section, Screenshot 5)
  const boneCaveMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 });
  const bonePlate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.8), boneCaveMat);
  bonePlate.position.set(0.6, 1.15, 0);
  bonePlate.userData = { id: 'temporal_bone', name: 'Temporal Bone Cavity' };
  rootGroup.add(bonePlate);
  components.temporal_bone.push(bonePlate);

  return {
    rootGroup,
    components,
    animatedNodes,
    cutawayMeshes,
    defaultCameraPosition: [0, 0.1, 5.8],
    studioBackground: '#ea580c', // Warm golden orange studio glow (Screenshot 5)
    onAnimate: (clock: number, speed: number) => {
      // Sound wave vibration propagation through eardrum and ossicles
      const wave = Math.sin(clock * speed * 12.0) * 0.04;
      eardrum.position.x = 0.12 + wave;
      malleus.rotation.z = -0.4 + wave * 0.5;
      incus.rotation.z = 1.2 + wave * 0.4;
      stapes.position.x = 0.95 + wave * 0.3;
    }
  };
}

// ==========================================
// 6. ELECTRIC MOTOR (Engineering & Technology)
// ==========================================
export function buildElectricMotor(): Diagram3DModelResult {
  const rootGroup = new THREE.Group();
  const components: Record<string, THREE.Object3D[]> = {
    stator_magnets: [],
    armature_coil: [],
    commutator: [],
    carbon_brushes: [],
    shaft: []
  };
  const animatedNodes: THREE.Object3D[] = [];
  const cutawayMeshes: THREE.Mesh[] = [];

  // Permanent Stator Magnets (North Red, South Blue)
  const matN = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 });
  const matS = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.3 });

  const magnetN = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 1.8), matN);
  magnetN.position.set(-1.8, 0, 0);
  magnetN.userData = { id: 'stator_magnets', name: 'Stator Permanent Magnet (North Pole)' };

  const magnetS = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 1.8), matS);
  magnetS.position.set(1.8, 0, 0);
  magnetS.userData = { id: 'stator_magnets', name: 'Stator Permanent Magnet (South Pole)' };

  rootGroup.add(magnetN, magnetS);
  components.stator_magnets.push(magnetN, magnetS);

  // Rotating Central Shaft
  const matShaft = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 16), matShaft);
  shaft.rotation.x = Math.PI / 2;
  shaft.userData = { id: 'shaft', name: 'Steel Output Drive Shaft' };
  rootGroup.add(shaft);
  components.shaft.push(shaft);

  // Rotating Armature Rotor Coil Group
  const rotorGroup = new THREE.Group();

  // Copper coil loops
  const matCopper = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.8, roughness: 0.2 });
  const coilRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.06, 12, 32), matCopper);
  coilRing.scale.set(1.2, 0.65, 1);
  rotorGroup.add(coilRing);

  // Iron armature core
  const matIron = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
  const ironCore = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 24), matIron);
  ironCore.rotation.x = Math.PI / 2;
  rotorGroup.add(ironCore);

  // Split-ring Commutator
  const matCommutator = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
  const comm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.4, 16, 1, false, 0, Math.PI * 0.85), matCommutator);
  comm1.position.set(0, 0, 1.2);
  comm1.rotation.x = Math.PI / 2;
  rotorGroup.add(comm1);

  rotorGroup.userData = { id: 'armature_coil', name: 'Rotating Copper Armature Coil' };
  rootGroup.add(rotorGroup);
  components.armature_coil.push(rotorGroup);
  animatedNodes.push(rotorGroup);

  // Fixed Carbon Brushes
  const matBrush = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const brush1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.2), matBrush);
  brush1.position.set(-0.32, 0, 1.2);
  const brush2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.2), matBrush);
  brush2.position.set(0.32, 0, 1.2);
  brush1.userData = { id: 'carbon_brushes', name: 'Carbon Contact Brushes' };
  rootGroup.add(brush1, brush2);
  components.carbon_brushes.push(brush1, brush2);

  return {
    rootGroup,
    components,
    animatedNodes,
    cutawayMeshes,
    defaultCameraPosition: [0, 1.2, 4.8],
    studioBackground: '#0f172a',
    onAnimate: (clock: number, speed: number) => {
      rotorGroup.rotation.z = clock * speed * 4.5;
    }
  };
}

// Model Registry Map
export const PROCEDURAL_3D_BUILDERS: Record<string, () => Diagram3DModelResult> = {
  electric_circuit: buildElectricCircuit,
  human_lungs: buildHumanLungs,
  human_torso_anatomy: buildHumanTorsoAnatomy,
  human_heart: buildHumanHeart,
  human_ear: buildHumanEar,
  electric_motor: buildElectricMotor
};

export interface ModelPartInfo {
  id: string;
  label: string;
  role: string;
  color: string;
  pinPosition?: [number, number, number];
  clinicalNote?: string;
  examQuestion?: string;
}

export interface Custom3DPrimitive {
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

export interface ModelSpec {
  id: string;
  title: string;
  subject: string;
  verificationBadge: string;
  parts: ModelPartInfo[];
  guidedSteps: Array<{ step: string; detail: string }>;
  primitives?: Custom3DPrimitive[];
  defaultCamera?: [number, number, number];
  studioBackground?: string;
  mechanismSummary?: string;
}

export const VERIFIED_MODEL_SPECS: Record<string, ModelSpec> = {
  human_heart: {
    id: 'human_heart',
    title: 'Human Heart: 4 Chambers, Valves & Double Circulation (Assemblr EDU Style)',
    subject: 'Biology • Circulatory Anatomy',
    verificationBadge: 'Verified Anatomical 3D Cutaway • 6 Viewing Modes',
    studioBackground: '#fed7aa', // Warm peach Assemblr EDU studio (Screenshot 4)
    mechanismSummary: 'Cardiac cycle: Deoxygenated blood flows into Right Atrium → Right Ventricle → Lungs; Oxygenated blood returns to Left Atrium → Left Ventricle → Aorta.',
    parts: [
      { id: 'left_ventricle', label: 'Left Ventricle (Bilik Kiri)', role: 'Thickest muscular chamber; pumps oxygenated blood at systemic high pressure into the Aorta.', color: '#991B1B', pinPosition: [0.8, -0.6, 0.4], clinicalNote: 'Hypertrophic cardiomyopathy often manifests as thickening here.', examQuestion: 'Why is the Left Ventricle wall 3x thicker than the Right Ventricle?' },
      { id: 'right_ventricle', label: 'Right Ventricle (Bilik Kanan)', role: 'Pumps deoxygenated blood through the pulmonary trunk into bilateral pulmonary arteries.', color: '#1E40AF', pinPosition: [-0.7, -0.4, 0.4], clinicalNote: 'Drives low-pressure pulmonary circulation (approx 25/10 mmHg).' },
      { id: 'left_atrium', label: 'Left Atrium (Serambi Kiri)', role: 'Receives oxygen-rich blood returning from the lungs via four pulmonary veins.', color: '#B91C1C', pinPosition: [0.75, 0.85, 0.2] },
      { id: 'right_atrium', label: 'Right Atrium (Serambi Kanan)', role: 'Receives systemic deoxygenated blood from Superior and Inferior Vena Cava.', color: '#2563EB', pinPosition: [-0.95, 0.75, 0.2] },
      { id: 'valves', label: 'Heart Valves (Katup)', role: 'Tricuspid, Mitral, Aortic and Pulmonary valves preventing retrograde backflow of blood.', color: '#F59E0B', pinPosition: [0.1, 0.3, 0.3] },
      { id: 'aorta', label: 'Aorta Arch (Aorta)', role: 'Largest systemic artery distributing oxygenated blood to the brain, coronaries and body.', color: '#DC2626', pinPosition: [0.3, 1.8, 0.2] },
      { id: 'pulmonary_artery', label: 'Pulmonary Artery (Arteri Paru)', role: 'Carries deoxygenated blood from right ventricle to bilateral lungs for gas exchange.', color: '#0284C7', pinPosition: [-0.2, 1.35, 0.45] },
      { id: 'vena_cava', label: 'Vena Cava (Vena)', role: 'Major systemic veins returning deoxygenated blood to the right side of the heart.', color: '#1E3A8A', pinPosition: [-1.4, 1.6, 0.1] }
    ],
    guidedSteps: [
      { step: '1. Systemic Return', detail: 'Deoxygenated blood returns from body tissues via Superior and Inferior Venae Cavae into Right Atrium.' },
      { step: '2. Tricuspid Inflow', detail: 'Atrial systole drives blood through the open Tricuspid valve into the Right Ventricle.' },
      { step: '3. Pulmonary Ejection', detail: 'RV contracts; pulmonary semilunar valve opens and blood surges through pulmonary trunk to lungs.' },
      { step: '4. Alveolar Gas Exchange', detail: 'In alveolar capillary networks, CO₂ is exchanged for fresh O₂.' },
      { step: '5. Mitral Filling & Aortic Systole', detail: 'Oxygenated blood returns to Left Atrium, enters Left Ventricle, and is ejected into the Aorta at 120 mmHg.' }
    ]
  },
  human_lungs: {
    id: 'human_lungs',
    title: 'Human Lungs & Respiratory Lobes (3D Anatomical Atlas)',
    subject: 'Biology • Respiratory Anatomy',
    verificationBadge: 'Verified Pulmonary Geometry • Lobes, Fissures & Trachea',
    studioBackground: '#f1f5f9', // Clean clinical lab backdrop (Screenshot 2)
    mechanismSummary: 'Ventilation cycle: Diaphragm contracts downwards while external intercostals expand chest cavity, drawing negative pressure air into lungs.',
    parts: [
      { id: 'trachea', label: 'Trachea (Windpipe)', role: 'Cartilaginous segmented tube conducting ambient air from larynx into primary bronchi.', color: '#D97706', pinPosition: [0, 1.8, 0.3], clinicalNote: 'C-shaped hyaline cartilage prevents collapse during negative pressure inspiration.' },
      { id: 'primary_bronchi', label: 'Primary Bronchi', role: 'Bifurcation at carina directing air independently to right and left pulmonary lobes.', color: '#E2E8F0', pinPosition: [0.2, 0.6, 0.3] },
      { id: 'right_superior_lobe', label: 'Superior Lobe of Right Lung', role: 'Upper right pulmonary lobe responsible for apical gas exchange.', color: '#BE185D', pinPosition: [-1.1, 0.8, 0.4] },
      { id: 'horizontal_fissure', label: 'Horizontal Fissure of Right Lung', role: 'Anatomical boundary groove separating right superior and middle lobes.', color: '#1F2937', pinPosition: [-1.2, 0.1, 0.4] },
      { id: 'right_middle_lobe', label: 'Middle Lobe of Right Lung', role: 'Medial wedge-shaped lobe unique to the 3-lobed right lung.', color: '#9D174D', pinPosition: [-1.2, -0.3, 0.4] },
      { id: 'right_inferior_lobe', label: 'Inferior Lobe of Right Lung', role: 'Largest right lobe resting on the right dome of the diaphragm.', color: '#831843', pinPosition: [-1.2, -1.0, 0.4] },
      { id: 'left_superior_lobe', label: 'Superior Lobe of Left Lung', role: 'Upper left pulmonary lobe containing apical and anterior bronchopulmonary segments.', color: '#BE185D', pinPosition: [1.2, 0.7, 0.4] },
      { id: 'oblique_fissure', label: 'Oblique Fissure of Left Lung', role: 'Deep diagonal fissure dividing left superior lobe from left inferior lobe.', color: '#1F2937', pinPosition: [1.2, -0.15, 0.4] },
      { id: 'left_inferior_lobe', label: 'Inferior Lobe of Left Lung', role: 'Postero-inferior left lobe expanding downward during diaphragmatic excursion.', color: '#831843', pinPosition: [1.2, -1.0, 0.4] },
      { id: 'cardiac_notch', label: 'Cardiac Notch (Impression for Heart)', role: 'Anterior concavity accommodating the leftward tilted apex of the human heart.', color: '#9F1239', pinPosition: [0.65, -0.4, 0.4] }
    ],
    guidedSteps: [
      { step: '1. Inhalation Initiation', detail: 'Diaphragm flattens downward; thoracic volume expands, decreasing intrapulmonary pressure below atmospheric.' },
      { step: '2. Airway Conduction', detail: 'Air rushes through nasal cavity, trachea with C-rings, and left/right primary bronchi.' },
      { step: '3. Alveolar Diffusion', detail: 'Oxygen crosses alveolar-capillary membrane into hemoglobin; carbon dioxide diffuses into alveoli.' },
      { step: '4. Passive Exhalation', detail: 'Diaphragm and thoracic cage relax elastically, pushing warm CO₂-rich air out of lungs.' }
    ]
  },
  electric_circuit: {
    id: 'electric_circuit',
    title: 'Physics Electric Circuit: Battery, Switch, Resistor & Filament Bulb',
    subject: 'Physics • Electromagnetism & Circuits',
    verificationBadge: 'Verified Electronic Simulation • Electron Particle Current',
    studioBackground: '#0f172a', // Dark laboratory bench with grid (Screenshot 1)
    mechanismSummary: 'DC Circuit: Chemical potential difference in battery creates an electric field, driving negative electron drift current through copper conductors.',
    parts: [
      { id: 'battery', label: 'DC Chemical Battery Cell', role: 'Provides electromotive force (EMF) via electrochemical redox reactions.', color: '#0284C7', pinPosition: [0, 0.8, 0.3], examQuestion: 'How does internal resistance of a battery affect terminal potential difference?' },
      { id: 'light_bulb', label: 'Tungsten Filament Bulb', role: 'Converts electrical energy to heat and visible photon radiation via resistive filament glow.', color: '#FACC15', pinPosition: [-2.8, 1.3, 0.4] },
      { id: 'switch', label: 'Knife Switch / Resistor', role: 'Opens or closes the conductive path, establishing or interrupting current flow.', color: '#0EA5E9', pinPosition: [2.8, 0.3, 0.4] },
      { id: 'copper_wires', label: 'Insulated Copper Wires & Clips', role: 'Low-resistivity conductors providing a continuous closed loop for mobile electrons.', color: '#F97316', pinPosition: [1.4, 0.15, 1.3] },
      { id: 'baseboard', label: 'Circuit Lab Breadboard', role: 'Rigid non-conductive mounting platform with coordinate grid lines for circuit prototyping.', color: '#64748B', pinPosition: [0, 0.05, 0] }
    ],
    guidedSteps: [
      { step: '1. Potential Difference', detail: 'Chemical redox in the battery establishes an EMF potential difference between anode and cathode.' },
      { step: '2. Switch Closure', detail: 'Closing the switch completes the circuit loop, establishing an electric field at nearly the speed of light.' },
      { step: '3. Electron Drift', detail: 'Mobile valence electrons drift towards the positive terminal with typical drift velocities of 1 mm/s.' },
      { step: '4. Joule Heating in Filament', detail: 'High resistivity tungsten collisions heat the filament to ~2500°C, emitting thermal radiation and light.' }
    ]
  },
  human_torso_anatomy: {
    id: 'human_torso_anatomy',
    title: 'Transparent Torso Learning Model (Science Can Diagnostic Station)',
    subject: 'Biology • Human Body Systems',
    verificationBadge: 'Verified Anatomical Multi-Organ Atlas • Interactive Diagnostic Base',
    studioBackground: '#f3e8ff', // Warm lavender studio (Screenshot 3)
    mechanismSummary: 'Integrated organ systems: Cranium protects brain, thoracic cage encloses heart/lungs, abdominal cavity houses liver, stomach, and digestive tract.',
    parts: [
      { id: 'cranium', label: 'Cranium / Skull (Craniu)', role: 'Bony skeletal vault protecting the delicate cerebral cortex and sensory organs.', color: '#F1F5F9', pinPosition: [0, 1.85, 0.4] },
      { id: 'brain', label: 'Brain (Creier)', role: 'Central nervous system organ processing sensory information and directing motor output.', color: '#F472B6', pinPosition: [0, 2.05, 0.3] },
      { id: 'lungs', label: 'Lungs (Plămâni)', role: 'Bilateral respiratory organs performing gas exchange across 300 million alveoli.', color: '#F43F5E', pinPosition: [-0.5, 0.4, 0.4] },
      { id: 'heart', label: 'Heart (Inimă)', role: 'Muscular pump generating pressure gradients to circulate blood through systemic and pulmonary loops.', color: '#DC2626', pinPosition: [0.1, 0.3, 0.4] },
      { id: 'liver', label: 'Liver (Ficat)', role: 'Largest metabolic organ; synthesizes bile, metabolizes lipids/proteins, and detoxifies blood.', color: '#78350F', pinPosition: [-0.3, -0.3, 0.4] },
      { id: 'stomach', label: 'Stomach (Stomac)', role: 'Digestive sac secreting hydrochloric acid and pepsinogen for chemical digestion of food.', color: '#FCA5A5', pinPosition: [0.4, -0.3, 0.4] },
      { id: 'large_intestine', label: 'Large Intestine (Intestin Gros)', role: 'Absorbs water and electrolytes while forming and storing feces.', color: '#F97316', pinPosition: [0, -0.7, 0.4] },
      { id: 'small_intestine', label: 'Small Intestine (Intestin Subțire)', role: 'Primary site of nutrient digestion and absorption across extensive villi and microvilli.', color: '#FDE047', pinPosition: [0, -1.0, 0.4] },
      { id: 'muscular_arm', label: 'Skeletal Musculature (Mușchi)', role: 'Striated voluntary muscle fibers contracting via actin-myosin cross-bridge cycles.', color: '#B91C1C', pinPosition: [-1.45, 0.3, 0.4] },
      { id: 'torso_shell', label: 'Transparent Acrylic Shell', role: 'Clear anatomical mannequin shell allowing 360-degree internal inspection.', color: '#38BDF8', pinPosition: [0.8, 0, 0.4] },
      { id: 'diagnostic_base', label: 'Interactive Diagnostic Base', role: 'Electronic learning console with diagnostic buttons, LED readouts, and audio speaker.', color: '#FF6A00', pinPosition: [0, -2.2, 1.4] }
    ],
    guidedSteps: [
      { step: '1. Neural Command', detail: 'Cerebral cortex generates action potentials traveling down the spinal cord to peripheral nerves.' },
      { step: '2. Cardiopulmonary Coordination', detail: 'Lungs oxygenate blood; the beating heart pumps it to cranial and visceral organs.' },
      { step: '3. Digestive Absorption', detail: 'Stomach and intestines break down macronutrients, which are transported to the liver via portal vein.' },
      { step: '4. Musculoskeletal Action', detail: 'Adenosine triphosphate (ATP) powers sliding filament contraction in skeletal muscle groups.' }
    ]
  },
  human_ear: {
    id: 'human_ear',
    title: 'Human Ear Cross-Section: Outer, Middle & Inner Auditory Apparatus',
    subject: 'Biology • Sensory Physiology',
    verificationBadge: 'Verified Auditory Mechanics • Match the Labels Quiz Mode',
    studioBackground: '#ea580c', // Warm golden orange studio glow (Screenshot 5)
    mechanismSummary: 'Auditory transduction: Sound waves channeled by pinna strike tympanic membrane → ossicle lever amplification → fluid waves in cochlea → hair cell nerve impulses.',
    parts: [
      { id: 'auricle', label: 'Auricle / Pinna', role: 'Elastic cartilage structure capturing and funneling ambient acoustic vibrations into the ear canal.', color: '#CA8A04', pinPosition: [-2.2, 0.3, 0.4] },
      { id: 'ear_canal', label: 'External Auditory Canal', role: 'Resonant tube conducting sound waves towards the tympanic membrane.', color: '#78350F', pinPosition: [-0.8, 0.05, 0.4] },
      { id: 'tympanic_membrane', label: 'Tympanic Membrane (Eardrum)', role: 'Acoustic diaphragm vibrating synchronously with incoming atmospheric sound waves.', color: '#38BDF8', pinPosition: [0.15, 0.05, 0.4] },
      { id: 'malleus', label: 'Malleus (Hammer)', role: 'First auditory ossicle attached firmly to the inner surface of the tympanic membrane.', color: '#FEF08A', pinPosition: [0.35, 0.35, 0.4] },
      { id: 'incus', label: 'Incus (Anvil)', role: 'Intermediate ossicle linking malleus to stapes, providing acoustic impedance matching.', color: '#FDE047', pinPosition: [0.65, 0.45, 0.4] },
      { id: 'stapes', label: 'Stapes (Stirrup Footplate)', role: 'Smallest bone in human body; pushes against the oval window to generate fluid waves in perilymph.', color: '#FACC15', pinPosition: [0.95, 0.35, 0.4] },
      { id: 'tensor_tympani', label: 'Tensor Tympani Muscle', role: 'Protective middle ear muscle dampening excessive acoustic vibrations from loud noises.', color: '#DC2626', pinPosition: [0.6, 0.75, 0.4] },
      { id: 'semicircular_canals', label: 'Semicircular Canals', role: 'Three fluid-filled orthogonal loops detecting rotational angular acceleration of the head.', color: '#0284C7', pinPosition: [1.3, 0.75, 0.4] },
      { id: 'cochlea', label: 'Spiral Cochlea (Organ of Corti)', role: 'Tonotopically tuned snail-shaped organ converting mechanical fluid waves into electrical action potentials.', color: '#A855F7', pinPosition: [1.4, -0.2, 0.4] },
      { id: 'auditory_nerves', label: 'Auditory Nerves (Cranial Nerve VIII)', role: 'Vestibulocochlear nerve tract transmitting acoustic and balance data to brainstem auditory nuclei.', color: '#22C55E', pinPosition: [2.1, 0.1, 0.4] },
      { id: 'temporal_bone', label: 'Temporal Bone Cavity', role: 'Dense petrous temporal bone enclosing and protecting middle and inner ear chambers.', color: '#D6D3D1', pinPosition: [0.6, 1.25, 0.4] }
    ],
    guidedSteps: [
      { step: '1. Acoustic Funneling', detail: 'The external pinna gathers sound waves and channels them down the auditory canal.' },
      { step: '2. Diaphragm Vibration', detail: 'Sound waves strike the tympanic membrane, vibrating at frequencies from 20 Hz to 20,000 Hz.' },
      { step: '3. Ossicular Lever Action', detail: 'Malleus, incus, and stapes amplify pressure by ~22-fold to overcome fluid impedance in inner ear.' },
      { step: '4. Tonotopic Transduction', detail: 'Basilar membrane vibration deflects hair cell stereocilia, opening potassium channels to fire auditory nerves.' }
    ]
  },
  electric_motor: {
    id: 'electric_motor',
    title: 'DC Electric Motor: Armature Coil, Stator Magnets & Commutator',
    subject: 'Engineering & Technology • Electromagnetism',
    verificationBadge: 'Verified Electromechanical Simulation • Lorentz Force Dynamics',
    studioBackground: '#0f172a',
    mechanismSummary: 'Motor Principle: Current flowing through armature coil in magnetic field experiences Fleming’s Left-Hand rule Lorentz torque (F = BIL sin θ).',
    parts: [
      { id: 'stator_magnets', label: 'Stator Field Magnets (N/S)', role: 'Produces uniform permanent magnetic flux density across the rotor air gap.', color: '#DC2626', pinPosition: [-1.8, 0.5, 0.3] },
      { id: 'armature_coil', label: 'Rotating Armature Coil', role: 'Copper winding carrying DC current that experiences perpendicular magnetic deflection force.', color: '#F97316', pinPosition: [0, 0.8, 0.3] },
      { id: 'commutator', label: 'Split-Ring Commutator', role: 'Reverses current direction every half-turn to maintain unidirectional continuous rotation torque.', color: '#F59E0B', pinPosition: [0, 0, 1.4] },
      { id: 'carbon_brushes', label: 'Carbon Contact Brushes', role: 'Stationary graphite contacts providing electrical power to the rotating commutator rings.', color: '#334155', pinPosition: [0.4, 0, 1.4] },
      { id: 'shaft', label: 'Steel Output Drive Shaft', role: 'Transmits generated mechanical shaft torque to external loads.', color: '#94A3B8', pinPosition: [0, 0, 1.8] }
    ],
    guidedSteps: [
      { step: '1. Magnetic Field Formation', detail: 'Stator permanent magnets produce uniform magnetic flux B directed from North to South pole.' },
      { step: '2. Current Energization', detail: 'DC power supply supplies current I through carbon brushes into the split-ring commutator and coil.' },
      { step: '3. Lorentz Force Couple', detail: 'Fleming’s Left Hand Rule: opposing vertical forces act on opposite sides of the coil (F = I L × B).' },
      { step: '4. Commutation Reversal', detail: 'At the neutral plane, the split rings reverse current direction, ensuring continuous rotational torque.' }
    ]
  },
  solar_system: {
    id: 'solar_system',
    title: 'Solar System & Keplerian Planetary Orbits',
    subject: 'Physics • Astronomy & Orbital Mechanics',
    verificationBadge: 'Verified Celestial Mechanics • Heliocentric Keplerian Orbits',
    studioBackground: '#090d16',
    mechanismSummary: 'Orbital mechanics: Sun’s gravitational force balanced by planetary tangential velocity according to Kepler’s Laws (T² ∝ a³).',
    parts: [
      { id: 'sun', label: 'The Sun (G2V Star)', role: 'Contains 99.86% of solar system mass; drives orbital balance and heliosphere.', color: '#FACC15', pinPosition: [0, 0.8, 0.3] },
      { id: 'earth', label: 'Earth & Moon (1.0 AU)', role: 'Rocky terrestrial planet supporting biosphere with water hydrosphere.', color: '#38BDF8', pinPosition: [2.6, 0.4, 0.2] },
      { id: 'mars', label: 'Mars (1.52 AU)', role: 'Iron-oxide rich terrestrial planet with Olympus Mons and thin atmosphere.', color: '#F97316', pinPosition: [3.2, 0.3, 0.2] },
      { id: 'jupiter', label: 'Jupiter (5.2 AU)', role: 'Largest gas giant; powerful magnetic field and 95+ satellites.', color: '#D97706', pinPosition: [4.1, 0.6, 0.2] },
      { id: 'saturn', label: 'Saturn & Ring System (9.5 AU)', role: 'Gas giant encircled by extensive icy ring system.', color: '#FDE047', pinPosition: [5.1, 0.5, 0.2] }
    ],
    guidedSteps: [
      { step: '1. Gravitational Deflection', detail: 'Inward gravitational acceleration F = G·M·m/r² deflects linear velocity into elliptical orbits.' },
      { step: '2. Kepler’s Second Law', detail: 'A radius vector joining planet and Sun sweeps out equal areas during equal intervals of time.' },
      { step: '3. Orbital Harmonic Law', detail: 'Square of orbital period T is directly proportional to cube of semi-major axis a (T² ∝ a³).' }
    ]
  },
  dna_helix: {
    id: 'dna_helix',
    title: 'DNA Double Helix & Complementary Base Pairing',
    subject: 'Biology • Molecular Genetics',
    verificationBadge: 'Verified Molecular Geometry • Antiparallel Strands & Base Pairs',
    studioBackground: '#0f172a',
    mechanismSummary: 'Molecular structure: Two antiparallel strands wound around central axis with complementary base pairs (A=T with 2 H-bonds, G≡C with 3 H-bonds).',
    parts: [
      { id: 'backbone', label: 'Sugar-Phosphate Backbone', role: 'Antiparallel deoxyribose sugar and phosphate ester rails forming the outer double helix.', color: '#FF6A00', pinPosition: [1.3, 1.2, 0.3] },
      { id: 'at_pair', label: 'Adenine – Thymine (A=T)', role: 'Complementary purine-pyrimidine base pair stabilized by 2 hydrogen bonds.', color: '#22C55E', pinPosition: [0, 0.5, 0.3] },
      { id: 'gc_pair', label: 'Guanine – Cytosine (G≡C)', role: 'Complementary base pair stabilized by 3 hydrogen bonds with higher thermal melting stability.', color: '#3B82F6', pinPosition: [0, -0.5, 0.3] }
    ],
    guidedSteps: [
      { step: '1. Antiparallel Rails', detail: 'One strand runs 5’ to 3’ while the complementary strand runs antiparallel 3’ to 5’.' },
      { step: '2. Complementary Pairing', detail: 'Chargaff’s rule: Adenine pairs exclusively with Thymine, and Guanine with Cytosine.' },
      { step: '3. Replication Unzipping', detail: 'DNA helicase unzips hydrogen bonds during S-phase to create replication forks.' }
    ]
  }
};

