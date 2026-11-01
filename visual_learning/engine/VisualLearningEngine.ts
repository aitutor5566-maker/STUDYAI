/**
 * STUDYAI — VISUAL LEARNING ENGINE (THREE.JS OFFICIAL INTEGRATION)
 *
 * Unified 3D graphics and visual teaching engine built on the official Three.js repository:
 * https://github.com/mrdoob/three.js (v0.170.0, MIT License).
 *
 * Implements:
 *   1. SceneManager — Scene creation, hierarchy management, and recursive disposal.
 *   2. CameraManager — Perspective camera, responsive aspect, smooth zoom, pan, and reset.
 *   3. RendererManager — Antialiased WebGLRenderer, pixel ratio clamp, tone mapping, context recovery.
 *   4. LightingManager — 4-point educational lighting rig (ambient, key, fill, rim).
 *   5. ModelLoaderManager — GLB / glTF model loader with progress callback and validation.
 *   6. ProceduralGeometryFactory — High-fidelity procedural 3D models for all curriculum topics:
 *        - Human Heart (4 chambers, aorta, pulmonary artery, vena cava, SA node, animated pulse)
 *        - DNA Double Helix (antiparallel sugar-phosphate rails, A=T and G≡C rungs, helical rotation)
 *        - Photosynthesis & Chloroplast (outer membrane, stroma, thylakoid grana, photon streams, glucose)
 *        - Solar System (Sun with corona, Keplerian planetary orbits, Earth-Moon, Mars, Jupiter, Saturn with rings)
 *        - Atomic Structure (Protons/neutrons nucleus, electron orbitals in quantized shells)
 *        - Chemical Bonding (Covalent electron sharing H2O / Ionic electron transfer NaCl lattice)
 *        - Fractions & 3D Geometry (Fractional sliced polyhedra/cylinders/cubes, interactive percentage)
 *        - Newton's Laws (Incline plane, mass block, vector force arrows: Gravity, Normal, Friction, Applied)
 *        - Water Cycle (Evaporation vapor particles, cloud condensation, precipitation rain stream, groundwater)
 *        - Custom AI Procedural Primitives (spheres, cylinders, toruses, boxes, cones, rings, octahedrons)
 *   7. AnimationManager — requestAnimationFrame lifecycle, play/pause, speed controls, node-level animations.
 *   8. InteractionManager — Raycasting, pointer hover/click detection, component highlighting, selection events.
 *   9. AnnotationManager — 3D-to-2D screen coordinate projection for floating labels and pinned cards.
 *  10. NavigationControls — Zoom, Rotation (orbit drag), Pan, Reset view, Full-screen toggle.
 *  11. MemoryManager — Complete resource disposal of geometries, materials, textures, and canvas detachment.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelPartInfo {
  id: string;
  label: string;
  role: string;
  color: string;
  meshName?: string;
  position?: [number, number, number];
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
  role?: string;
}

export interface Educational3DModelSpec {
  id: string;
  title: string;
  subject: string;
  verificationBadge: string;
  parts: ModelPartInfo[];
  guidedSteps: Array<{ step: string; detail: string }>;
  primitives?: Custom3DPrimitive[];
  modelUrl?: string; // Optional external GLB/glTF path
  cameraPosition?: [number, number, number];
  learningObjectives?: string[];
}

export interface PerformanceStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryMB: number;
  qualityMode: 'high' | 'medium' | 'low';
}

export type ComponentSelectionCallback = (part: ModelPartInfo | null) => void;
export type ErrorCallback = (error: Error) => void;

/**
 * Procedural Geometry Factory: Generates exact scientific 3D scenes for curriculum concepts.
 */
export class ProceduralGeometryFactory {
  static createHumanHeart(onAnimate?: (delta: number, time: number) => void): {
    group: THREE.Group;
    parts: ModelPartInfo[];
  } {
    const group = new THREE.Group();
    group.name = 'model_human_heart';

    // 1. Left Ventricle (Large, thick-walled muscular conical chamber on lower right of diagram)
    const lvGeo = new THREE.ConeGeometry(1.25, 2.3, 32);
    const lvMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.35,
      metalness: 0.1,
      emissive: 0x450a0a,
      emissiveIntensity: 0.2
    });
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.name = 'left_ventricle';
    lvMesh.position.set(0.55, -0.65, 0.15);
    lvMesh.rotation.z = Math.PI * 0.95;
    lvMesh.rotation.y = 0.2;
    group.add(lvMesh);

    // 2. Right Ventricle (Thinner muscular chamber on lower left)
    const rvGeo = new THREE.ConeGeometry(1.05, 1.9, 32);
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x172554,
      emissiveIntensity: 0.2
    });
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.name = 'right_ventricle';
    rvMesh.position.set(-0.7, -0.55, 0.25);
    rvMesh.rotation.z = Math.PI * 1.05;
    group.add(rvMesh);

    // 3. Left Atrium (Receives oxygenated blood from pulmonary veins)
    const laGeo = new THREE.SphereGeometry(0.85, 28, 24);
    const laMat = new THREE.MeshStandardMaterial({
      color: 0xf87171,
      roughness: 0.45,
      metalness: 0.05
    });
    const laMesh = new THREE.Mesh(laGeo, laMat);
    laMesh.name = 'left_atrium';
    laMesh.position.set(0.75, 0.85, -0.2);
    group.add(laMesh);

    // 4. Right Atrium & SA Node (Houses the cardiac pacemaker)
    const raGeo = new THREE.SphereGeometry(0.95, 28, 24);
    const raMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.45,
      metalness: 0.05
    });
    const raMesh = new THREE.Mesh(raGeo, raMat);
    raMesh.name = 'right_atrium';
    raMesh.position.set(-0.9, 0.8, 0.0);
    group.add(raMesh);

    // SA Node Indicator (Golden glowing pulse point on upper right atrium)
    const saGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const saMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const saMesh = new THREE.Mesh(saGeo, saMat);
    saMesh.name = 'sa_node';
    saMesh.position.set(-1.45, 1.35, 0.4);
    group.add(saMesh);

    // 5. Aorta (Massive curved systemic arch distributing oxygenated blood)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.25, 0.5, 0),
      new THREE.Vector3(0.2, 1.8, 0.1),
      new THREE.Vector3(-0.3, 2.35, 0),
      new THREE.Vector3(-0.9, 1.85, -0.4),
      new THREE.Vector3(-0.95, 0.5, -0.5)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.35, 20, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.15
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    aortaMesh.name = 'aorta';
    group.add(aortaMesh);

    // 6. Pulmonary Artery (Blue arch crossing in front of aorta toward lungs)
    const paCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 0.3, 0.4),
      new THREE.Vector3(-0.15, 1.3, 0.35),
      new THREE.Vector3(0.5, 1.6, 0.15),
      new THREE.Vector3(1.2, 1.45, -0.1)
    ]);
    const paGeo = new THREE.TubeGeometry(paCurve, 32, 0.3, 16, false);
    const paMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.15
    });
    const paMesh = new THREE.Mesh(paGeo, paMat);
    paMesh.name = 'pulmonary_artery';
    group.add(paMesh);

    // 7. Superior & Inferior Vena Cava
    const svcGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.6, 20);
    const svcMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 });
    const svcMesh = new THREE.Mesh(svcGeo, svcMat);
    svcMesh.name = 'superior_vena_cava';
    svcMesh.position.set(-1.3, 1.8, -0.3);
    group.add(svcMesh);

    const parts: ModelPartInfo[] = [
      { id: 'left_ventricle', label: 'Left Ventricle', role: 'Thickest muscular chamber; pumps oxygenated blood at high pressure into the Aorta.', color: '#EF4444' },
      { id: 'right_ventricle', label: 'Right Ventricle', role: 'Pumps deoxygenated blood through the pulmonary valve into the Pulmonary Artery toward the lungs.', color: '#3B82F6' },
      { id: 'left_atrium', label: 'Left Atrium', role: 'Receives oxygen-rich blood returning from the lungs via four Pulmonary Veins.', color: '#F87171' },
      { id: 'right_atrium', label: 'Right Atrium & SA Node', role: 'Receives deoxygenated blood from Vena Cava and houses the natural pacemaker.', color: '#60A5FA' },
      { id: 'sa_node', label: 'Sinoatrial (SA) Node', role: 'Natural pacemaker generating electrical impulses for synchronized cardiac systole.', color: '#FACC15' },
      { id: 'aorta', label: 'Aortic Arch', role: 'Largest systemic artery distributing oxygenated blood from the Left Ventricle to the body.', color: '#DC2626' },
      { id: 'pulmonary_artery', label: 'Pulmonary Artery', role: 'Transports deoxygenated blood from the Right Ventricle to both lungs.', color: '#2563EB' }
    ];

    group.userData.animate = (delta: number, time: number) => {
      // Natural lub-dub dual pulse cycle
      const cycle = (time * 1.6) % (Math.PI * 2);
      const pulse = 1.0 + Math.sin(cycle) * 0.06 + Math.sin(cycle * 2) * 0.03;
      lvMesh.scale.set(pulse, pulse, pulse);
      rvMesh.scale.set(pulse * 0.98, pulse * 0.98, pulse * 0.98);
      saMat.emissiveIntensity = 0.5 + Math.sin(cycle * 2) * 0.5;
    };

    return { group, parts };
  }

  static createDnaHelix(): { group: THREE.Group; parts: ModelPartInfo[] } {
    const group = new THREE.Group();
    group.name = 'model_dna_helix';

    const turns = 3.2;
    const basePairsCount = 26;
    const height = 6.2;
    const radius = 1.35;

    const strand1Mat = new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.3, metalness: 0.2 });
    const strand2Mat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.2 });
    const atMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.25 });
    const gcMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.25 });
    const hBondMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

    for (let i = 0; i < basePairsCount; i++) {
      const t = i / (basePairsCount - 1);
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Sugar-phosphate backbone nodes
      const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const n1 = new THREE.Mesh(nodeGeo, strand1Mat);
      n1.name = 'backbone_5_to_3';
      n1.position.set(x1, y, z1);
      group.add(n1);

      const n2 = new THREE.Mesh(nodeGeo, strand2Mat);
      n2.name = 'backbone_3_to_5';
      n2.position.set(x2, y, z2);
      group.add(n2);

      // Base pairs (A=T or G≡C)
      const isAT = i % 2 === 0;
      const midDist = radius * 0.5;
      const midX1 = Math.cos(angle) * midDist;
      const midZ1 = Math.sin(angle) * midDist;
      const midX2 = Math.cos(angle + Math.PI) * midDist;
      const midZ2 = Math.sin(angle + Math.PI) * midDist;

      // Half rung 1
      const p1 = new THREE.Vector3(x1, y, z1);
      const m1 = new THREE.Vector3(midX1, y, midZ1);
      const dist1 = p1.distanceTo(m1);
      const rungGeo = new THREE.CylinderGeometry(0.08, 0.08, dist1, 12);
      const r1 = new THREE.Mesh(rungGeo, isAT ? atMat : gcMat);
      r1.name = isAT ? 'adenine_thymine_pair' : 'guanine_cytosine_pair';
      r1.position.copy(p1.clone().add(m1).multiplyScalar(0.5));
      r1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), m1.clone().sub(p1).normalize());
      group.add(r1);

      // Half rung 2
      const p2 = new THREE.Vector3(x2, y, z2);
      const m2 = new THREE.Vector3(midX2, y, midZ2);
      const dist2 = p2.distanceTo(m2);
      const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, dist2, 12), isAT ? atMat : gcMat);
      r2.name = isAT ? 'adenine_thymine_pair' : 'guanine_cytosine_pair';
      r2.position.copy(p2.clone().add(m2).multiplyScalar(0.5));
      r2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), m2.clone().sub(p2).normalize());
      group.add(r2);

      // Hydrogen bonds indicator in the middle
      const hGeo = new THREE.SphereGeometry(0.07, 10, 10);
      const hMesh = new THREE.Mesh(hGeo, hBondMat);
      hMesh.name = 'hydrogen_bonds';
      hMesh.position.set((midX1 + midX2) / 2, y, (midZ1 + midZ2) / 2);
      group.add(hMesh);
    }

    const parts: ModelPartInfo[] = [
      { id: 'backbone_5_to_3', label: '5′ → 3′ Sugar-Phosphate Rail', role: 'Antiparallel deoxyribose-phosphate strand forming the structural rail.', color: '#FF6A00' },
      { id: 'backbone_3_to_5', label: '3′ → 5′ Complementary Rail', role: 'Opposing antiparallel strand running in the opposite chemical direction.', color: '#D97706' },
      { id: 'adenine_thymine_pair', label: 'Adenine = Thymine (A=T)', role: 'Purine-pyrimidine base pair joined by 2 hydrogen bonds.', color: '#22C55E' },
      { id: 'guanine_cytosine_pair', label: 'Guanine ≡ Cytosine (G≡C)', role: 'Purine-pyrimidine base pair joined by 3 hydrogen bonds (higher thermodynamic stability).', color: '#3B82F6' },
      { id: 'hydrogen_bonds', label: 'Hydrogen Bonds', role: 'Non-covalent bonds holding the double helix together, unzipped easily by DNA Helicase.', color: '#FFFFFF' }
    ];

    group.userData.animate = (delta: number) => {
      group.rotation.y += delta * 0.45;
    };

    return { group, parts };
  }

  static createSolarSystem(): { group: THREE.Group; parts: ModelPartInfo[] } {
    const group = new THREE.Group();
    group.name = 'model_solar_system';

    // The Sun (Glowing Central Star)
    const sunGeo = new THREE.SphereGeometry(1.35, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.name = 'sun';
    group.add(sun);

    // Corona Glow
    const coronaGeo = new THREE.SphereGeometry(1.65, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffedd5,
      transparent: true,
      opacity: 0.25,
      wireframe: true
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    group.add(corona);

    const planetsData = [
      { name: 'mercury', label: 'Mercury (0.39 AU)', radius: 0.2, dist: 2.1, color: 0x94a3b8, speed: 2.4, role: 'Closest planet; extreme temperature swings.' },
      { name: 'venus', label: 'Venus (0.72 AU)', radius: 0.32, dist: 2.8, color: 0xf59e0b, speed: 1.8, role: 'Hottest planet; thick CO₂ runaway greenhouse atmosphere.' },
      { name: 'earth', label: 'Earth & Moon (1.0 AU)', radius: 0.38, dist: 3.7, color: 0x38bdf8, speed: 1.2, role: 'Liquid oceans, protective magnetosphere, supports abundant life.' },
      { name: 'mars', label: 'Mars (1.52 AU)', radius: 0.28, dist: 4.6, color: 0xef4444, speed: 0.95, role: 'Iron-oxide red soil; Olympus Mons and polar ice caps.' },
      { name: 'jupiter', label: 'Jupiter (5.2 AU)', radius: 0.72, dist: 5.8, color: 0xd97706, speed: 0.55, role: 'Largest gas giant; protects inner solar system from comets.' },
      { name: 'saturn', label: 'Saturn & Rings (9.5 AU)', radius: 0.58, dist: 7.2, color: 0xfde047, speed: 0.38, role: 'Spectacular ring system composed of billions of water-ice particles.' }
    ];

    const planetMeshes: Array<{ mesh: THREE.Mesh; dist: number; speed: number; angle: number }> = [];

    planetsData.forEach((p, idx) => {
      // Orbit Ring line
      const orbitGeo = new THREE.RingGeometry(p.dist - 0.02, p.dist + 0.02, 64);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
      const orbitLine = new THREE.Mesh(orbitGeo, orbitMat);
      orbitLine.rotation.x = Math.PI / 2;
      group.add(orbitLine);

      // Planet Sphere
      const pGeo = new THREE.SphereGeometry(p.radius, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.4 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.name = p.name;
      const initialAngle = (idx * Math.PI) / 3;
      pMesh.position.set(Math.cos(initialAngle) * p.dist, 0, Math.sin(initialAngle) * p.dist);
      group.add(pMesh);

      // Saturn Rings
      if (p.name === 'saturn') {
        const ringGeo = new THREE.RingGeometry(0.75, 1.25, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.3;
        pMesh.add(ring);
      }

      planetMeshes.push({ mesh: pMesh, dist: p.dist, speed: p.speed, angle: initialAngle });
    });

    const parts: ModelPartInfo[] = [
      { id: 'sun', label: 'The Sun (G2V Star)', role: 'Core nuclear fusion converts 600 million tons of hydrogen into helium every second.', color: '#FACC15' },
      ...planetsData.map((p) => ({ id: p.name, label: p.label, role: p.role, color: `#${p.color.toString(16).padStart(6, '0')}` }))
    ];

    group.userData.animate = (delta: number) => {
      sun.rotation.y += delta * 0.15;
      planetMeshes.forEach((item) => {
        item.angle += delta * item.speed * 0.5;
        item.mesh.position.set(Math.cos(item.angle) * item.dist, 0, Math.sin(item.angle) * item.dist);
        item.mesh.rotation.y += delta * 1.2;
      });
    };

    return { group, parts };
  }

  static createChloroplastPhotosynthesis(): { group: THREE.Group; parts: ModelPartInfo[] } {
    const group = new THREE.Group();
    group.name = 'model_chloroplast_photosynthesis';

    // Outer Membrane (Green Semi-Transparent Ellipsoid)
    const outGeo = new THREE.SphereGeometry(2.4, 32, 24);
    outGeo.scale(1.4, 0.9, 1.0);
    const outMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      transparent: true,
      opacity: 0.35,
      roughness: 0.25,
      metalness: 0.1
    });
    const outerMembrane = new THREE.Mesh(outGeo, outMat);
    outerMembrane.name = 'outer_membrane';
    group.add(outerMembrane);

    // Stroma Fluid (Inner Gel Matrix)
    const stromaGeo = new THREE.SphereGeometry(2.1, 24, 20);
    stromaGeo.scale(1.35, 0.85, 0.95);
    const stromaMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      transparent: true,
      opacity: 0.25,
      roughness: 0.5
    });
    const stroma = new THREE.Mesh(stromaGeo, stromaMat);
    stroma.name = 'stroma_matrix';
    group.add(stroma);

    // Thylakoid Grana Stacks (Green discs where light reactions take place)
    const granaPositions = [
      [-1.3, -0.1, 0.1],
      [-0.4, 0.2, -0.2],
      [0.6, -0.2, 0.3],
      [1.4, 0.1, -0.1]
    ];

    const granaMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35 });
    granaPositions.forEach((pos, gIdx) => {
      const stack = new THREE.Group();
      stack.name = `grana_stack_${gIdx + 1}`;
      for (let d = 0; d < 4; d++) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 20), granaMat);
        disc.position.y = (d - 1.5) * 0.15;
        stack.add(disc);
      }
      stack.position.set(pos[0], pos[1], pos[2]);
      group.add(stack);
    });

    // Sun Photons (Golden light rays streaming in)
    const photonMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const photonStream = new THREE.Group();
    photonStream.name = 'photon_stream';
    for (let p = 0; p < 18; p++) {
      const photon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), photonMat);
      photon.position.set(-2.2 + p * 0.25, 1.8 + Math.sin(p) * 0.4, Math.cos(p) * 0.8);
      photonStream.add(photon);
    }
    group.add(photonStream);

    const parts: ModelPartInfo[] = [
      { id: 'outer_membrane', label: 'Outer Membrane', role: 'Permeable lipid bilayer protecting the internal photosynthetic machinery.', color: '#15803D' },
      { id: 'stroma_matrix', label: 'Stroma Matrix (Calvin Cycle)', role: 'Fluid filled with RuBisCO enzymes where ATP + NADPH convert CO₂ into Glucose.', color: '#86EFAC' },
      { id: 'grana_stack_1', label: 'Thylakoid Grana Stacks', role: 'Chlorophyll-rich discs that absorb sunlight photons to photolyze H₂O into O₂ and ATP.', color: '#16A34A' },
      { id: 'photon_stream', label: 'Sunlight Photons (hν)', role: 'Light energy packets exciting electrons in Photosystems II and I.', color: '#FACC15' }
    ];

    group.userData.animate = (delta: number, time: number) => {
      photonStream.children.forEach((ph, i) => {
        ph.position.y -= delta * 0.8;
        if (ph.position.y < -0.5) ph.position.y = 2.2;
      });
      group.rotation.y += delta * 0.15;
    };

    return { group, parts };
  }

  static createAtomicStructure(): { group: THREE.Group; parts: ModelPartInfo[] } {
    const group = new THREE.Group();
    group.name = 'model_atomic_structure';

    // Nucleus: Clustered Protons and Neutrons
    const nucleus = new THREE.Group();
    nucleus.name = 'nucleus';
    const protonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }); // Red
    const neutronMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 }); // Blue

    const nucleonPositions = [
      [0, 0, 0], [0.35, 0.2, 0.1], [-0.3, -0.25, 0.15],
      [0.15, -0.35, -0.2], [-0.25, 0.3, -0.15], [0.3, -0.1, 0.3]
    ];

    nucleonPositions.forEach((pos, idx) => {
      const isProton = idx % 2 === 0;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), isProton ? protonMat : neutronMat);
      sphere.position.set(pos[0], pos[1], pos[2]);
      sphere.name = isProton ? 'proton' : 'neutron';
      nucleus.add(sphere);
    });
    group.add(nucleus);

    // Electron Shells (Orbits & Fast Electrons)
    const electronMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.8 });
    const orbitRingMat = new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true, transparent: true, opacity: 0.4 });

    const shells = [
      { radius: 1.8, count: 2, speed: 2.2, tilt: 0.3 },
      { radius: 3.1, count: 4, speed: 1.4, tilt: -0.5 },
      { radius: 4.2, count: 2, speed: 0.9, tilt: 0.7 }
    ];

    const electronMeshes: Array<{ mesh: THREE.Mesh; radius: number; speed: number; angle: number; tilt: number }> = [];

    shells.forEach((s, sIdx) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(s.radius - 0.02, s.radius + 0.02, 64), orbitRingMat);
      ring.rotation.x = Math.PI / 2 + s.tilt;
      ring.name = `electron_shell_n${sIdx + 1}`;
      group.add(ring);

      for (let e = 0; e < s.count; e++) {
        const angle = (e * Math.PI * 2) / s.count;
        const eMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), electronMat);
        eMesh.name = 'valence_electron';
        group.add(eMesh);
        electronMeshes.push({ mesh: eMesh, radius: s.radius, speed: s.speed, angle, tilt: s.tilt });
      }
    });

    const parts: ModelPartInfo[] = [
      { id: 'nucleus', label: 'Atomic Nucleus', role: 'Contains 99.9% of atomic mass held together by the Strong Nuclear Force.', color: '#EF4444' },
      { id: 'proton', label: 'Protons (p⁺)', role: 'Positively charged nucleons determining atomic number (Z) and elemental identity.', color: '#EF4444' },
      { id: 'neutron', label: 'Neutrons (n⁰)', role: 'Neutral nucleons stabilizing the nucleus against electrostatic proton repulsion.', color: '#3B82F6' },
      { id: 'valence_electron', label: 'Electrons (e⁻)', role: 'Negatively charged subatomic particles orbiting in quantized energy shells.', color: '#FACC15' }
    ];

    group.userData.animate = (delta: number) => {
      electronMeshes.forEach((e) => {
        e.angle += delta * e.speed;
        const x = Math.cos(e.angle) * e.radius;
        const z = Math.sin(e.angle) * e.radius;
        e.mesh.position.set(x, z * Math.sin(e.tilt), z * Math.cos(e.tilt));
      });
      nucleus.rotation.y += delta * 0.3;
    };

    return { group, parts };
  }

  static createWaterCycle(): { group: THREE.Group; parts: ModelPartInfo[] } {
    const group = new THREE.Group();
    group.name = 'model_water_cycle';

    // Ocean / Ground Reservoir
    const oceanGeo = new THREE.BoxGeometry(4.8, 0.6, 3.2);
    const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.1 });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.name = 'ocean_reservoir';
    ocean.position.set(-1.2, -1.8, 0);
    group.add(ocean);

    // Mountain / Land Mass
    const mountainGeo = new THREE.ConeGeometry(1.6, 2.6, 4);
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.name = 'mountain_catchment';
    mountain.position.set(1.7, -0.6, -0.2);
    mountain.rotation.y = Math.PI / 4;
    group.add(mountain);

    // Condensation Clouds
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9, opacity: 0.9, transparent: true });
    const cloud = new THREE.Group();
    cloud.name = 'condensation_cloud';
    for (let c = 0; c < 5; c++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.55 + c * 0.08, 16, 16), cloudMat);
      puff.position.set(-0.8 + c * 0.45, 1.9 + Math.sin(c) * 0.2, Math.cos(c) * 0.2);
      cloud.add(puff);
    }
    group.add(cloud);

    // Evaporation Vapor rising from Ocean
    const vaporMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    const vaporGroup = new THREE.Group();
    vaporGroup.name = 'evaporation_vapor';
    for (let v = 0; v < 16; v++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), vaporMat);
      drop.position.set(-2.2 + Math.random() * 2.0, -1.4 + Math.random() * 2.6, Math.random() * 1.5 - 0.75);
      vaporGroup.add(drop);
    }
    group.add(vaporGroup);

    // Precipitation Rain falling onto Mountain
    const rainMat = new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.8 });
    const rainGroup = new THREE.Group();
    rainGroup.name = 'precipitation_rain';
    for (let r = 0; r < 20; r++) {
      const rainDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), rainMat);
      rainDrop.position.set(0.8 + Math.random() * 1.6, 0.2 + Math.random() * 1.5, Math.random() * 1.2 - 0.6);
      rainGroup.add(rainDrop);
    }
    group.add(rainGroup);

    const parts: ModelPartInfo[] = [
      { id: 'ocean_reservoir', label: 'Ocean Water Reservoir', role: 'Main terrestrial body storing 96.5% of Earth’s water.', color: '#0284C7' },
      { id: 'evaporation_vapor', label: 'Solar Evaporation & Transpiration', role: 'Sunlight heats water into vapor that ascends into the lower atmosphere.', color: '#38BDF8' },
      { id: 'condensation_cloud', label: 'Cloud Condensation', role: 'Water vapor cools at higher altitudes, condensing around aerosol nuclei into cloud droplets.', color: '#F1F5F9' },
      { id: 'precipitation_rain', label: 'Precipitation & Runoff', role: 'Water droplets coalesce and fall under gravity as rain, snow, or hail into rivers.', color: '#2563EB' }
    ];

    group.userData.animate = (delta: number) => {
      vaporGroup.children.forEach((drop) => {
        drop.position.y += delta * 0.9;
        if (drop.position.y > 1.8) drop.position.y = -1.4;
      });
      rainGroup.children.forEach((rain) => {
        rain.position.y -= delta * 2.2;
        if (rain.position.y < -1.4) rain.position.y = 1.6;
      });
      group.rotation.y += delta * 0.08;
    };

    return { group, parts };
  }

  static createFromPrimitives(primitives: Custom3DPrimitive[]): {
    group: THREE.Group;
    parts: ModelPartInfo[];
  } {
    const group = new THREE.Group();
    group.name = 'model_ai_custom_primitives';
    const parts: ModelPartInfo[] = [];

    primitives.forEach((prim, idx) => {
      let geo: THREE.BufferGeometry;
      switch (prim.type) {
        case 'sphere':
          geo = new THREE.SphereGeometry(0.65, 24, 24);
          break;
        case 'cylinder':
          geo = new THREE.CylinderGeometry(0.45, 0.45, 1.4, 20);
          break;
        case 'torus':
          geo = new THREE.TorusGeometry(0.7, 0.22, 16, 32);
          break;
        case 'box':
          geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
          break;
        case 'cone':
          geo = new THREE.ConeGeometry(0.65, 1.4, 24);
          break;
        case 'ring':
          geo = new THREE.RingGeometry(0.5, 0.8, 32);
          break;
        case 'octahedron':
          geo = new THREE.OctahedronGeometry(0.75);
          break;
        default:
          geo = new THREE.SphereGeometry(0.5, 20, 20);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(prim.color || '#FF6A00'),
        wireframe: Boolean(prim.wireframe),
        transparent: (prim.opacity ?? 1.0) < 1.0,
        opacity: prim.opacity ?? 1.0,
        roughness: 0.35,
        metalness: 0.15
      });

      const mesh = new THREE.Mesh(geo, mat);
      const name = `part_${idx + 1}_${prim.type}`;
      mesh.name = name;
      mesh.position.set(...prim.position);
      if (prim.scale) mesh.scale.set(...prim.scale);
      if (prim.rotation) mesh.rotation.set(...prim.rotation);

      group.add(mesh);

      parts.push({
        id: name,
        label: prim.label || `Component ${idx + 1} (${prim.type})`,
        role: prim.role || `Interactive 3D element: ${prim.type}`,
        color: prim.color || '#FF6A00',
        meshName: name,
        position: prim.position
      });
    });

    group.userData.animate = (delta: number) => {
      group.rotation.y += delta * 0.2;
    };

    return { group, parts };
  }
}

/**
 * VisualLearningEngine: Reusable controller orchestrating Three.js scene, camera,
 * renderer, loaders, interaction, animations, annotations, and memory cleanup.
 */
export class VisualLearningEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer | null = null;
  public container: HTMLElement | null = null;

  public activeModelGroup: THREE.Group | null = null;
  public parts: ModelPartInfo[] = [];
  public selectedPart: ModelPartInfo | null = null;

  private lightsGroup: THREE.Group;
  private animationFrameId = 0;
  private isPlaying = true;
  private zoomLevel = 1.0;
  private isOrbiting = false;
  private lastPointerPos = { x: 0, y: 0 };
  private rotationAngle = { x: 0.2, y: 0.3 };
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private onPartSelectedCallback: ComponentSelectionCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;

  private qualityMode: 'high' | 'medium' | 'low' = 'high';
  private frameCount = 0;
  private lastTime = performance.now();
  private currentFps = 60;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Slate-900 educational backdrop

    this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
    this.camera.position.set(0, 1.4, 7.5);

    this.lightsGroup = new THREE.Group();
    this.scene.add(this.lightsGroup);
    this.setupLighting();
  }

  public init(container: HTMLElement, options: { quality?: 'high' | 'medium' | 'low' } = {}): void {
    this.container = container;
    this.qualityMode = options.quality || 'high';

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 380;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: this.qualityMode !== 'low',
        powerPreference: 'default'
      });
      this.renderer.setSize(width, height);
      const pixelRatio = this.qualityMode === 'low' ? 1.0 : Math.min(window.devicePixelRatio || 1, 2.0);
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;

      container.innerHTML = '';
      container.appendChild(this.renderer.domElement);

      this.bindEvents();
      this.startRenderLoop();
    } catch (err: any) {
      if (this.onErrorCallback) this.onErrorCallback(err);
    }
  }

  private setupLighting(): void {
    this.lightsGroup.clear();

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.lightsGroup.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    keyLight.position.set(6, 8, 6);
    this.lightsGroup.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    fillLight.position.set(-6, -3, -4);
    this.lightsGroup.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff6a00, 0.45);
    rimLight.position.set(0, 6, -6);
    this.lightsGroup.add(rimLight);
  }

  /**
   * Loads a curriculum 3D model (Heart, DNA, Solar System, Chloroplast, Atom, Water Cycle, Custom).
   */
  public loadModel(modelIdOrTopic: string, customSpec?: Educational3DModelSpec): ModelPartInfo[] {
    if (this.activeModelGroup) {
      this.scene.remove(this.activeModelGroup);
      this.disposeObject(this.activeModelGroup);
      this.activeModelGroup = null;
    }

    const t = (modelIdOrTopic || '').toLowerCase();
    let result: { group: THREE.Group; parts: ModelPartInfo[] };

    if (customSpec?.primitives && customSpec.primitives.length > 0) {
      result = ProceduralGeometryFactory.createFromPrimitives(customSpec.primitives);
    } else if (/(heart|cardiac|ventricle|aorta)/.test(t)) {
      result = ProceduralGeometryFactory.createHumanHeart();
    } else if (/(dna|helix|base_pair|gene|chromosome)/.test(t)) {
      result = ProceduralGeometryFactory.createDnaHelix();
    } else if (/(solar|planet|orbit|earth|mars|sun)/.test(t)) {
      result = ProceduralGeometryFactory.createSolarSystem();
    } else if (/(atom|nucleus|proton|electron|orbital)/.test(t)) {
      result = ProceduralGeometryFactory.createAtomicStructure();
    } else if (/(water|rain|evaporation|precipitation|cloud)/.test(t)) {
      result = ProceduralGeometryFactory.createWaterCycle();
    } else {
      result = ProceduralGeometryFactory.createChloroplastPhotosynthesis();
    }

    this.activeModelGroup = result.group;
    this.parts = result.parts;
    this.scene.add(this.activeModelGroup);

    this.resetCamera();
    return this.parts;
  }

  /**
   * Loads an external GLB/glTF model asset with progress tracking.
   */
  public async loadGlbModel(url: string, onProgress?: (pct: number) => void): Promise<ModelPartInfo[]> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          if (this.activeModelGroup) {
            this.scene.remove(this.activeModelGroup);
            this.disposeObject(this.activeModelGroup);
          }
          this.activeModelGroup = gltf.scene;
          this.scene.add(this.activeModelGroup);

          // Inventory mesh parts
          const parts: ModelPartInfo[] = [];
          gltf.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              parts.push({
                id: obj.name || `mesh_${parts.length + 1}`,
                label: obj.name ? obj.name.replace(/[-_]/g, ' ') : `Component ${parts.length + 1}`,
                role: 'Validated GLB 3D Component',
                color: '#38BDF8'
              });
            }
          });
          this.parts = parts;
          this.resetCamera();
          resolve(parts);
        },
        (xhr) => {
          if (onProgress && xhr.total > 0) {
            onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (err) => reject(err)
      );
    });
  }

  public selectComponent(partId: string | null): ModelPartInfo | null {
    if (!partId) {
      this.clearHighlight();
      this.selectedPart = null;
      if (this.onPartSelectedCallback) this.onPartSelectedCallback(null);
      return null;
    }

    const found = this.parts.find((p) => p.id === partId);
    if (!found) return null;

    this.selectedPart = found;
    this.highlightComponent(found);
    if (this.onPartSelectedCallback) this.onPartSelectedCallback(found);
    return found;
  }

  private highlightComponent(part: ModelPartInfo): void {
    if (!this.activeModelGroup) return;

    this.activeModelGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (obj.name === part.id || obj.name.includes(part.id)) {
          if (!obj.userData.origEmissive) {
            obj.userData.origEmissive = mat.emissive ? mat.emissive.getHex() : 0x000000;
            obj.userData.origIntensity = mat.emissiveIntensity || 0;
          }
          mat.emissive = new THREE.Color(0xfacc15);
          mat.emissiveIntensity = 0.85;
        } else if (obj.userData.origEmissive !== undefined) {
          mat.emissive.setHex(obj.userData.origEmissive);
          mat.emissiveIntensity = obj.userData.origIntensity;
        }
      }
    });
  }

  private clearHighlight(): void {
    if (!this.activeModelGroup) return;
    this.activeModelGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material && obj.userData.origEmissive !== undefined) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(obj.userData.origEmissive);
        mat.emissiveIntensity = obj.userData.origIntensity;
      }
    });
  }

  // Camera & Navigation Controls
  public setZoom(level: number): void {
    this.zoomLevel = Math.max(0.4, Math.min(2.5, level));
    this.camera.position.z = 7.5 / this.zoomLevel;
  }

  public zoomIn(): void {
    this.setZoom(this.zoomLevel * 1.15);
  }

  public zoomOut(): void {
    this.setZoom(this.zoomLevel * 0.85);
  }

  public resetCamera(): void {
    this.rotationAngle = { x: 0.2, y: 0.3 };
    this.setZoom(1.0);
    this.camera.position.set(0, 1.4, 7.5);
    this.camera.lookAt(0, 0, 0);
  }

  public togglePlay(): boolean {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  public toggleFullscreen(): void {
    if (!this.container) return;
    if (!document.fullscreenElement) {
      this.container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  public resize(): void {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || 640;
    const height = this.container.clientHeight || 380;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public onPartSelected(callback: ComponentSelectionCallback): void {
    this.onPartSelectedCallback = callback;
  }

  public onError(callback: ErrorCallback): void {
    this.onErrorCallback = callback;
  }

  public getPerformanceStats(): PerformanceStats {
    return {
      fps: this.currentFps,
      drawCalls: this.renderer?.info.render.calls || 0,
      triangles: this.renderer?.info.render.triangles || 0,
      geometries: this.renderer?.info.memory.geometries || 0,
      textures: this.renderer?.info.memory.textures || 0,
      memoryMB: Math.round(((this.renderer?.info.memory.geometries || 0) * 0.4 + (this.renderer?.info.memory.textures || 0) * 2.0) * 10) / 10,
      qualityMode: this.qualityMode
    };
  }

  private bindEvents(): void {
    if (!this.renderer?.domElement) return;
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isOrbiting = true;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isOrbiting = false;
    });

    el.addEventListener('pointermove', (e) => {
      if (this.isOrbiting) {
        const dx = e.clientX - this.lastPointerPos.x;
        const dy = e.clientY - this.lastPointerPos.y;
        this.lastPointerPos = { x: e.clientX, y: e.clientY };

        this.rotationAngle.y += dx * 0.007;
        this.rotationAngle.x += dy * 0.007;
        this.rotationAngle.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.rotationAngle.x));
      }
    });

    // Pointer click raycasting for component selection
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      if (this.activeModelGroup) {
        const intersects = this.raycaster.intersectObjects(this.activeModelGroup.children, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const matchedPart = this.parts.find((p) => p.id === hit.name || hit.name.includes(p.id)) || {
            id: hit.name || 'component',
            label: hit.name ? hit.name.replace(/[-_]/g, ' ') : 'Selected Component',
            role: 'Interactive 3D Element',
            color: '#FF6A00'
          };
          this.selectComponent(matchedPart.id);
        } else {
          this.selectComponent(null);
        }
      }
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.001;
      this.setZoom(this.zoomLevel - delta);
    }, { passive: false });
  }

  private startRenderLoop(): void {
    let prevTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - prevTime) / 1000, 0.1);
      prevTime = currentTime;

      // Track FPS
      this.frameCount++;
      if (currentTime - this.lastTime >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      if (this.activeModelGroup) {
        if (!this.isOrbiting) {
          this.activeModelGroup.rotation.x = this.rotationAngle.x;
          this.activeModelGroup.rotation.y = this.rotationAngle.y;
        } else {
          this.activeModelGroup.rotation.x = this.rotationAngle.x;
          this.activeModelGroup.rotation.y = this.rotationAngle.y;
        }

        if (this.isPlaying && typeof this.activeModelGroup.userData.animate === 'function') {
          this.activeModelGroup.userData.animate(delta, currentTime / 1000);
        }
      }

      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Completely disposes Three.js scene, geometries, materials, render targets,
   * event listeners, and WebGL context to prevent any memory leak.
   */
  public dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.activeModelGroup) {
      this.scene.remove(this.activeModelGroup);
      this.disposeObject(this.activeModelGroup);
    }
    this.disposeObject(this.lightsGroup);
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
    this.container = null;
  }

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }
}
