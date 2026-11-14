import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { X, Trophy, Shield, Swords, RotateCcw, Award, Sparkles, Volume2, VolumeX, Eye } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

interface KatanaQuestion {
  id: string;
  subject: string;
  topic: string;
  prompt: string;
  options: string[];
  difficulty: string;
  conceptTag: string;
  questionType: string;
}

type EnvironmentType = 'moonlit_bamboo_forest' | 'ancient_stone_fortress' | 'mist_mountain_ridge';

interface EnvironmentConfig {
  id: EnvironmentType;
  name: string;
  icon: string;
  fogColor: number;
  skyTopColor: string;
  skyBottomColor: string;
  groundColor: number;
  groundGridColor: number;
  ambientColor: number;
  ambientIntensity: number;
  dirLightColor: number;
  dirLightIntensity: number;
  accentColor: string;
}

const ENVIRONMENTS: Record<EnvironmentType, EnvironmentConfig> = {
  moonlit_bamboo_forest: {
    id: 'moonlit_bamboo_forest',
    name: 'Bamboo Forest',
    icon: '🎋',
    fogColor: 0x06111f,
    skyTopColor: '#060B19',
    skyBottomColor: '#0B3B42',
    groundColor: 0x0e1b24,
    groundGridColor: 0x164e63,
    ambientColor: 0x0b3b42,
    ambientIntensity: 0.8,
    dirLightColor: 0x38bdf8,
    dirLightIntensity: 1.4,
    accentColor: '#38BDF8'
  },
  ancient_stone_fortress: {
    id: 'ancient_stone_fortress',
    name: 'Stone Fortress',
    icon: '🏯',
    fogColor: 0x180924,
    skyTopColor: '#1A002C',
    skyBottomColor: '#511845',
    groundColor: 0x1e1526,
    groundGridColor: 0x7c2d12,
    ambientColor: 0x4a154b,
    ambientIntensity: 0.85,
    dirLightColor: 0xf97316,
    dirLightIntensity: 1.5,
    accentColor: '#F97316'
  },
  mist_mountain_ridge: {
    id: 'mist_mountain_ridge',
    name: 'Mountain Ridge',
    icon: '⛰️',
    fogColor: 0x0f2027,
    skyTopColor: '#0F2027',
    skyBottomColor: '#2C5364',
    groundColor: 0x13222d,
    groundGridColor: 0x38bdf8,
    ambientColor: 0x1e3a47,
    ambientIntensity: 0.75,
    dirLightColor: 0xe0f2fe,
    dirLightIntensity: 1.3,
    accentColor: '#90E0EF'
  }
};

const ENEMY_COORDS = [
  { x: -3.4, y: 0, z: -2.6 }, // Option A
  { x: -1.15, y: 0, z: -3.3 }, // Option B
  { x: 1.15, y: 0, z: -3.3 },  // Option C
  { x: 3.4, y: 0, z: -2.6 }   // Option D
];

export const KatanaGameModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  topic?: string;
  subject?: string;
  stageIndex?: number;
}> = ({ isOpen, onClose, topic = 'Photosynthesis', subject = 'Science', stageIndex = 1 }) => {
  const { apiFetch, triggerRefresh } = useLearning();

  const mountRef = useRef<HTMLDivElement | null>(null);

  // Gameplay State
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(stageIndex === 5 ? 250 : 100);
  const [enemyMaxHp] = useState<number>(stageIndex === 5 ? 250 : 100);
  const [spiritEnergy, setSpiritEnergy] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [currentWave, setCurrentWave] = useState<number>(1);
  const totalWaves = 5;
  const isBoss = stageIndex === 5;

  const [currentEnvironment, setCurrentEnvironment] = useState<EnvironmentType>('moonlit_bamboo_forest');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [currentQuestion, setCurrentQuestion] = useState<KatanaQuestion | null>(null);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  // Victory / Defeat Modal
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [earnedStars, setEarnedStars] = useState<number>(0);

  // Screen projected 2D coordinates for the 4 option badges
  const [projectedBadges, setProjectedBadges] = useState<Array<{ x: number; y: number; visible: boolean }>>([
    { x: 0, y: 0, visible: false },
    { x: 0, y: 0, visible: false },
    { x: 0, y: 0, visible: false },
    { x: 0, y: 0, visible: false }
  ]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const warriorGroupRef = useRef<THREE.Group | null>(null);
  const katanaMeshRef = useRef<THREE.Mesh | null>(null);
  const swordTrailRef = useRef<THREE.Mesh | null>(null);
  const enemyGroupsRef = useRef<THREE.Group[]>([]);
  const enemyRingsRef = useRef<THREE.Mesh[]>([]);
  const sparkPointsRef = useRef<THREE.Points | null>(null);
  const firefliesPointsRef = useRef<THREE.Points | null>(null);
  const envDecorationsGroupRef = useRef<THREE.Group | null>(null);

  // Dynamic lights references for environment shifting
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Animation controller state
  const animStateRef = useRef<{
    time: number;
    warriorAction: 'idle' | 'charging' | 'slashing' | 'parried' | 'returning' | 'victory';
    targetEnemyIdx: number;
    actionProgress: number;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    shakeIntensity: number;
  }>({
    time: 0,
    warriorAction: 'idle',
    targetEnemyIdx: -1,
    actionProgress: 0,
    startPos: new THREE.Vector3(0, 0, 3.2),
    targetPos: new THREE.Vector3(0, 0, 3.2),
    shakeIntensity: 0
  });

  // Load session from backend
  const loadSession = useCallback(async () => {
    setLoading(true);
    setGameOver(false);
    setIsVictory(false);
    setPlayerHp(100);
    setEnemyHp(isBoss ? 250 : 100);
    setComboCount(0);
    setScore(0);
    setCurrentWave(1);
    setLastExplanation(null);
    setLastAnswerCorrect(null);

    try {
      const res = await apiFetch('/api/katana/session/start', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'campaign',
          environment: currentEnvironment,
          subject,
          topic,
          stageIndex
        })
      });

      setSessionId(res.sessionId || 'kat-sess-local');
      setPlayerHp(res.playerHp || 100);
      setCurrentWave(res.currentWave || 1);
      if (res.currentQuestion) {
        // Guarantee 4 options for 4 3D enemies
        const q = res.currentQuestion;
        if (q.options.length < 4) {
          const pad = ['All of the above', 'None of the above', 'Structural Equilibrium'];
          while (q.options.length < 4 && pad.length > 0) {
            q.options.push(pad.shift()!);
          }
        }
        setCurrentQuestion(q);
      }
      setLoading(false);
    } catch {
      setSessionId('kat-sess-local');
      setCurrentQuestion({
        id: 'kq-fallback-1',
        subject,
        topic,
        prompt: `During photosynthesis in green plants, which molecule is split by sunlight photolysis to release oxygen gas into the atmosphere?`,
        options: [
          'Carbon dioxide (CO2)',
          'Water (H2O)',
          'Glucose (C6H12O6)',
          'Adenosine triphosphate (ATP)'
        ],
        difficulty: 'medium',
        conceptTag: 'Photolysis & Light Reactions',
        questionType: 'mcq_battle'
      });
      setLoading(false);
    }
  }, [apiFetch, currentEnvironment, isBoss, stageIndex, subject, topic]);

  useEffect(() => {
    if (isOpen) {
      loadSession();
    }
  }, [isOpen, loadSession]);

  // Environment Switcher (Preserves Question & Session Continuity!)
  const switchEnvironment = useCallback((envKey: EnvironmentType) => {
    setCurrentEnvironment(envKey);
    const env = ENVIRONMENTS[envKey];
    const scene = sceneRef.current;
    if (!scene) return;

    // Update Fog
    scene.fog = new THREE.FogExp2(env.fogColor, 0.042);

    // Update Ambient & Directional Lights
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(env.ambientColor);
      ambientLightRef.current.intensity = env.ambientIntensity;
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(env.dirLightColor);
      dirLightRef.current.intensity = env.dirLightIntensity;
    }

    // Update Ground Material & Grid
    if (groundMeshRef.current) {
      (groundMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(env.groundColor);
    }
    if (gridHelperRef.current) {
      scene.remove(gridHelperRef.current);
      const newGrid = new THREE.GridHelper(30, 24, env.groundGridColor, 0x1e293b);
      newGrid.position.y = 0.01;
      gridHelperRef.current = newGrid;
      scene.add(newGrid);
    }

    // Rebuild Environment Specific 3D Props
    if (envDecorationsGroupRef.current) {
      scene.remove(envDecorationsGroupRef.current);
      const decGroup = new THREE.Group();

      if (envKey === 'moonlit_bamboo_forest') {
        // Bamboo stalks
        const bambooGeo = new THREE.CylinderGeometry(0.12, 0.15, 8, 8);
        const bambooMat = new THREE.MeshStandardMaterial({
          color: 0x064e3b,
          roughness: 0.6,
          metalness: 0.2
        });
        for (let i = 0; i < 40; i++) {
          const stalk = new THREE.Mesh(bambooGeo, bambooMat);
          const x = (Math.random() - 0.5) * 22;
          const z = -4 - Math.random() * 12;
          if (Math.abs(x) < 2.5 && z > -7) continue; // Keep battle center clear
          stalk.position.set(x, 4, z);
          stalk.rotation.x = (Math.random() - 0.5) * 0.1;
          stalk.rotation.z = (Math.random() - 0.5) * 0.1;
          decGroup.add(stalk);
        }

        // Glowing Silver Moon
        const moonGeo = new THREE.SphereGeometry(2.4, 24, 24);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(7, 12, -18);
        decGroup.add(moon);
      } else if (envKey === 'ancient_stone_fortress') {
        // Stone Columns & Torches
        const columnGeo = new THREE.CylinderGeometry(0.6, 0.65, 7, 12);
        const columnMat = new THREE.MeshStandardMaterial({
          color: 0x27272a,
          roughness: 0.85,
          metalness: 0.3
        });
        const colPositions = [
          [-5, 3.5, -4],
          [5, 3.5, -4],
          [-7, 3.5, -8],
          [7, 3.5, -8],
          [-4, 3.5, -12],
          [4, 3.5, -12]
        ];
        colPositions.forEach(([cx, cy, cz]) => {
          const col = new THREE.Mesh(columnGeo, columnMat);
          col.position.set(cx, cy, cz);
          decGroup.add(col);

          // Flaming Torch Light
          const torchLight = new THREE.PointLight(0xff6a00, 1.8, 10);
          torchLight.position.set(cx > 0 ? cx - 0.8 : cx + 0.8, 2.5, cz);
          decGroup.add(torchLight);
        });
      } else if (envKey === 'mist_mountain_ridge') {
        // Jagged mountain peaks in distance
        const peakGeo = new THREE.ConeGeometry(5, 12, 5);
        const peakMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.95
        });
        for (let i = 0; i < 7; i++) {
          const peak = new THREE.Mesh(peakGeo, peakMat);
          const px = (i - 3) * 6;
          const pz = -16 - Math.random() * 6;
          peak.position.set(px, 5, pz);
          peak.rotation.y = Math.random() * Math.PI;
          decGroup.add(peak);
        }
      }

      envDecorationsGroupRef.current = decGroup;
      scene.add(decGroup);
    }
  }, []);

  // Initialize Three.js 3D Scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const env = ENVIRONMENTS[currentEnvironment];
    scene.fog = new THREE.FogExp2(env.fogColor, 0.042);

    // 2. Camera: Third-Person Perspective Behind Main Warrior
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 8.4);
    camera.lookAt(0, 1.1, -1.0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(env.ambientColor, env.ambientIntensity);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(env.dirLightColor, env.dirLightIntensity);
    dirLight.position.set(4, 9, 5);
    dirLight.castShadow = true;
    dirLightRef.current = dirLight;
    scene.add(dirLight);

    // Rim light from behind enemies
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-2, 4, -8);
    scene.add(rimLight);

    // 5. Arena Ground
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: env.groundColor,
      roughness: 0.75,
      metalness: 0.25
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMeshRef.current = groundMesh;
    scene.add(groundMesh);

    const grid = new THREE.GridHelper(30, 24, env.groundGridColor, 0x1e293b);
    grid.position.y = 0.01;
    gridHelperRef.current = grid;
    scene.add(grid);

    // 6. Build Main 3D Warrior (Third-Person Player Character)
    const warriorGroup = new THREE.Group();
    warriorGroup.position.set(0, 0, 3.2);

    // Warrior Body (Torso & Armor Cuirass)
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.85, 0.44);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.5
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.05;
    warriorGroup.add(torso);

    // Orange Obi Sash
    const obiGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.18, 16);
    const obiMat = new THREE.MeshStandardMaterial({
      color: 0xff6a00,
      roughness: 0.3,
      emissive: 0x9a3412,
      emissiveIntensity: 0.3
    });
    const obi = new THREE.Mesh(obiGeo, obiMat);
    obi.position.y = 0.88;
    warriorGroup.add(obi);

    // Gold Chest Crest Emblem
    const crestGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8);
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 1.15, 0.23);
    warriorGroup.add(crest);

    // Shoulder Armor Pauldrons (Left & Right)
    const pauldronGeo = new THREE.BoxGeometry(0.24, 0.38, 0.32);
    const pauldronMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3
    });
    const leftPauldron = new THREE.Mesh(pauldronGeo, pauldronMat);
    leftPauldron.position.set(-0.46, 1.25, 0);
    leftPauldron.rotation.z = 0.25;
    warriorGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronGeo, pauldronMat);
    rightPauldron.position.set(0.46, 1.25, 0);
    rightPauldron.rotation.z = -0.25;
    warriorGroup.add(rightPauldron);

    // Head & Straw Hat (Ronin Kasa)
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.62;
    warriorGroup.add(head);

    // Glowing Cyan Visor Eyes
    const eyeGeo = new THREE.BoxGeometry(0.24, 0.05, 0.1);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eyes = new THREE.Mesh(eyeGeo, eyeMat);
    eyes.position.set(0, 1.64, 0.2);
    warriorGroup.add(eyes);

    // Ronin Conical Hat
    const hatGeo = new THREE.ConeGeometry(0.85, 0.35, 18);
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.85
    });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.84;
    warriorGroup.add(hat);

    // Armored Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.4, 0);
    warriorGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.4, 0);
    warriorGroup.add(rightLeg);

    // Katana Sword Group (Right Arm Attachment)
    const katanaArmGroup = new THREE.Group();
    katanaArmGroup.position.set(0.46, 1.05, 0.1);

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.04, 1.25, 0.08);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.25
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, 0.55, 0.15);
    blade.rotation.x = 0.3;
    katanaMeshRef.current = blade;
    katanaArmGroup.add(blade);

    // Golden Tsuba Handguard
    const tsubaGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.03, 12);
    const tsubaMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25
    });
    const tsuba = new THREE.Mesh(tsubaGeo, tsubaMat);
    tsuba.position.set(0, -0.06, 0.05);
    tsuba.rotation.x = 0.3;
    katanaArmGroup.add(tsuba);

    // Tsuka Hilt & Wrap
    const hiltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.35, 8);
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.set(0, -0.22, 0.02);
    hilt.rotation.x = 0.3;
    katanaArmGroup.add(hilt);

    warriorGroup.add(katanaArmGroup);

    // Curved Glowing Slash Ribbon Trail (Visible during high-speed strike)
    const slashCurve = new THREE.CylinderGeometry(1.6, 1.6, 0.06, 16, 1, true, -1.2, 2.4);
    const slashMat = new THREE.MeshBasicMaterial({
      color: 0xff6a00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    const slashRibbon = new THREE.Mesh(slashCurve, slashMat);
    slashRibbon.rotation.x = Math.PI / 2;
    slashRibbon.position.set(0, 1.1, 0.4);
    swordTrailRef.current = slashRibbon;
    warriorGroup.add(slashRibbon);

    // Ground Shadow under Warrior
    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    warriorGroup.add(shadow);

    warriorGroupRef.current = warriorGroup;
    scene.add(warriorGroup);

    // 7. Build 4 Separate 3D Shadow Warrior Enemies (Representing Answer Options A, B, C, D)
    const enemyGroups: THREE.Group[] = [];
    const enemyRings: THREE.Mesh[] = [];

    ENEMY_COORDS.forEach((pos, idx) => {
      const eg = new THREE.Group();
      eg.position.set(pos.x, pos.y, pos.z);

      // Shadow Warrior Torso
      const sTorsoGeo = new THREE.BoxGeometry(0.7, 0.82, 0.4);
      const sTorsoMat = new THREE.MeshStandardMaterial({
        color: 0x181824,
        roughness: 0.5,
        metalness: 0.4
      });
      const sTorso = new THREE.Mesh(sTorsoGeo, sTorsoMat);
      sTorso.position.y = 1.0;
      eg.add(sTorso);

      // Shadow Kabuto Helmet with Demonic Horns
      const sHeadGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const sHeadMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.7 });
      const sHead = new THREE.Mesh(sHeadGeo, sHeadMat);
      sHead.position.y = 1.58;
      eg.add(sHead);

      // Crimson Horns
      const hornGeo = new THREE.ConeGeometry(0.07, 0.38, 6);
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.4
      });
      const leftHorn = new THREE.Mesh(hornGeo, hornMat);
      leftHorn.position.set(-0.2, 1.84, 0);
      leftHorn.rotation.z = -0.4;
      eg.add(leftHorn);

      const rightHorn = new THREE.Mesh(hornGeo, hornMat);
      rightHorn.position.set(0.2, 1.84, 0);
      rightHorn.rotation.z = 0.4;
      eg.add(rightHorn);

      // Evil Glowing Crimson Eyes
      const sEyesGeo = new THREE.BoxGeometry(0.24, 0.06, 0.08);
      const sEyesMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const sEyes = new THREE.Mesh(sEyesGeo, sEyesMat);
      sEyes.position.set(0, 1.6, 0.22);
      eg.add(sEyes);

      // Shadow Naginata / Polearm Weapon
      const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.1, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0.42, 1.1, 0.1);
      pole.rotation.z = -0.2;
      eg.add(pole);

      const sBladeGeo = new THREE.BoxGeometry(0.04, 0.7, 0.12);
      const sBladeMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xef4444,
        emissiveIntensity: 0.3
      });
      const sBlade = new THREE.Mesh(sBladeGeo, sBladeMat);
      sBlade.position.set(0.52, 2.0, 0.1);
      eg.add(sBlade);

      // Interactive Feet Highlight Ring (Glows when option is hovered)
      const ringGeo = new THREE.RingGeometry(0.65, 0.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff6a00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      eg.add(ring);
      enemyRings.push(ring);

      // Ground Shadow
      const sShadowGeo = new THREE.CircleGeometry(0.5, 16);
      const sShadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.4
      });
      const sShadow = new THREE.Mesh(sShadowGeo, sShadowMat);
      sShadow.rotation.x = -Math.PI / 2;
      sShadow.position.y = 0.02;
      eg.add(sShadow);

      enemyGroups.push(eg);
      scene.add(eg);
    });

    enemyGroupsRef.current = enemyGroups;
    enemyRingsRef.current = enemyRings;

    // 8. Fireflies Ambient Particle System
    const fireflyCount = 45;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount * 3; i += 3) {
      fireflyPositions[i] = (Math.random() - 0.5) * 18;
      fireflyPositions[i + 1] = 0.4 + Math.random() * 4.5;
      fireflyPositions[i + 2] = -8 + Math.random() * 12;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
    const fireflyMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.85
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    firefliesPointsRef.current = fireflies;
    scene.add(fireflies);

    // 9. Steel Slash Sparks System
    const sparkCount = 60;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xff8533,
      size: 0.18,
      transparent: true,
      opacity: 0.0
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    sparkPointsRef.current = sparkPoints;
    scene.add(sparkPoints);

    // Build initial environment props
    const decGroup = new THREE.Group();
    envDecorationsGroupRef.current = decGroup;
    scene.add(decGroup);
    switchEnvironment(currentEnvironment);

    // 10. Main 60 FPS Render Loop
    let lastTime = performance.now();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = animStateRef.current;
      state.time += dt;

      // Animate Fireflies
      if (firefliesPointsRef.current) {
        const posAttr = firefliesPointsRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) {
          arr[i + 1] += Math.sin(state.time * 2 + arr[i]) * 0.005;
          arr[i] += Math.cos(state.time * 1.5 + arr[i + 2]) * 0.004;
        }
        posAttr.needsUpdate = true;
      }

      // Idle Bobbing for 4 Enemies
      enemyGroupsRef.current.forEach((eg, i) => {
        if (eg.visible) {
          eg.position.y = Math.sin(state.time * 2.8 + i * 1.2) * 0.06;
          // Look towards player warrior
          eg.lookAt(0, eg.position.y + 0.9, 3.2);
        }
      });

      // Warrior Combat State Machine
      const warrior = warriorGroupRef.current;
      if (warrior) {
        if (state.warriorAction === 'idle') {
          // Breathing stance bob
          warrior.position.set(0, Math.sin(state.time * 3.2) * 0.04, 3.2);
          warrior.rotation.y = 0;

          if (katanaMeshRef.current) {
            katanaMeshRef.current.rotation.z = Math.sin(state.time * 2.5) * 0.05;
          }
          if (swordTrailRef.current) {
            (swordTrailRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        } else if (state.warriorAction === 'charging') {
          // Dash toward target enemy
          state.actionProgress += dt * 3.8;
          const t = Math.min(state.actionProgress, 1.0);

          // Ease in-out lerp
          warrior.position.lerpVectors(state.startPos, state.targetPos, t);
          warrior.position.y = Math.abs(Math.sin(t * Math.PI * 3)) * 0.22; // Athletic dash stride

          // Point warrior at target
          warrior.lookAt(state.targetPos.x, 0, state.targetPos.z);

          if (t >= 1.0) {
            state.warriorAction = 'slashing';
            state.actionProgress = 0;
          }
        } else if (state.warriorAction === 'slashing') {
          // High speed leaping Katana strike
          state.actionProgress += dt * 5.0;
          const t = Math.min(state.actionProgress, 1.0);

          // Swing katana in wide arc
          if (katanaMeshRef.current) {
            katanaMeshRef.current.rotation.x = -Math.PI * 0.4 + t * Math.PI * 1.1;
          }
          if (swordTrailRef.current) {
            (swordTrailRef.current.material as THREE.MeshBasicMaterial).opacity = 1.0 - t;
          }

          // Camera shake on impact
          state.shakeIntensity = (1.0 - t) * 0.18;

          if (t >= 1.0) {
            state.warriorAction = 'returning';
            state.actionProgress = 0;
          }
        } else if (state.warriorAction === 'parried') {
          // Knocked back stagger
          state.actionProgress += dt * 2.4;
          const t = Math.min(state.actionProgress, 1.0);
          warrior.position.lerpVectors(state.targetPos, state.startPos, t);
          warrior.position.y = Math.sin(t * Math.PI) * 0.25;
          warrior.rotation.z = Math.sin(t * Math.PI * 2) * 0.2;

          if (t >= 1.0) {
            state.warriorAction = 'idle';
            state.actionProgress = 0;
            warrior.rotation.set(0, 0, 0);
          }
        } else if (state.warriorAction === 'returning') {
          // Smooth return to player side
          state.actionProgress += dt * 2.6;
          const t = Math.min(state.actionProgress, 1.0);
          warrior.position.lerpVectors(state.targetPos, state.startPos, t);
          warrior.lookAt(0, 0, -2.5);

          if (t >= 1.0) {
            state.warriorAction = 'idle';
            state.actionProgress = 0;
            warrior.position.copy(state.startPos);
            warrior.rotation.set(0, 0, 0);
          }
        }
      }

      // Camera Shake Effect
      if (state.shakeIntensity > 0.001) {
        camera.position.x = (Math.random() - 0.5) * state.shakeIntensity;
        camera.position.y = 3.6 + (Math.random() - 0.5) * state.shakeIntensity;
        state.shakeIntensity *= 0.88;
      } else {
        camera.position.set(0, 3.6, 8.4);
      }
      camera.lookAt(0, 1.1, -1.0);

      // Project 3D Enemy Head positions to 2D Screen Badges
      const badges: Array<{ x: number; y: number; visible: boolean }> = [];
      const tempVec = new THREE.Vector3();

      enemyGroupsRef.current.forEach((eg) => {
        if (!eg.visible) {
          badges.push({ x: 0, y: 0, visible: false });
          return;
        }

        tempVec.setFromMatrixPosition(eg.matrixWorld);
        tempVec.y += 2.2; // Above head
        tempVec.project(camera);

        const sx = ((tempVec.x + 1) * width) / 2;
        const sy = ((-tempVec.y + 1) * height) / 2;
        const isBehind = tempVec.z > 1.0;

        badges.push({
          x: sx,
          y: sy,
          visible: !isBehind
        });
      });

      setProjectedBadges(badges);

      renderer.render(scene, camera);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    // Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isOpen, currentEnvironment, switchEnvironment]);

  // Update enemy highlight rings on hover
  useEffect(() => {
    enemyRingsRef.current.forEach((ring, idx) => {
      if (ring && ring.material) {
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = hoveredOptionIndex === idx ? 0.9 : 0.0;
      }
    });
  }, [hoveredOptionIndex]);

  // Keyboard controls for A, B, C, D or 1, 2, 3, 4
  useEffect(() => {
    if (!isOpen || gameOver || isSubmitting || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      let optIdx = -1;
      if (key === 'A' || key === '1') optIdx = 0;
      if (key === 'B' || key === '2') optIdx = 1;
      if (key === 'C' || key === '3') optIdx = 2;
      if (key === 'D' || key === '4') optIdx = 3;

      if (optIdx >= 0 && optIdx < currentQuestion.options.length) {
        handleExecuteStrike(optIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameOver, isSubmitting, currentQuestion]);

  // Execute 3D Sword Strike Against Targeted Enemy
  const handleExecuteStrike = async (optionIndex: number) => {
    if (isSubmitting || !currentQuestion || gameOver) return;

    const chosenOption = currentQuestion.options[optionIndex];
    if (!chosenOption) return;

    setIsSubmitting(true);

    // Target 3D coordinates for the dash
    const targetEnemyPos = ENEMY_COORDS[optionIndex];
    const anim = animStateRef.current;
    anim.targetEnemyIdx = optionIndex;
    anim.actionProgress = 0;
    anim.startPos.set(0, 0, 3.2);
    // Strike position slightly in front of enemy
    anim.targetPos.set(targetEnemyPos.x * 0.72, 0, targetEnemyPos.z + 1.2);
    anim.warriorAction = 'charging';

    try {
      const strike = await apiFetch('/api/katana/battle/validate', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          studentAnswer: chosenOption,
          timeTakenMs: 1200
        })
      });

      // Wait for dash & slash animation contact
      setTimeout(() => {
        setIsSubmitting(false);
        setLastAnswerCorrect(strike.isCorrect);
        setLastExplanation(strike.explanation);

        setPlayerHp(strike.playerHp);
        setSpiritEnergy(strike.spiritEnergy);
        setComboCount(strike.comboCount);
        setScore(strike.score);

        if (strike.isCorrect) {
          // Defeat targeted enemy with spark explosion
          const targetGroup = enemyGroupsRef.current[optionIndex];
          if (targetGroup) {
            // Sliced defeat animation: scale down and fade
            targetGroup.visible = false;
          }

          setEnemyHp((prev) => Math.max(0, prev - strike.damageDealt));

          // Check Wave & Victory Progression
          setTimeout(() => {
            if (currentWave < totalWaves) {
              setCurrentWave((w) => w + 1);
              setEnemyHp(isBoss ? 250 : 100);
              // Revive enemies for next wave
              enemyGroupsRef.current.forEach((eg) => (eg.visible = true));

              if (strike.nextQuestion) {
                // Guarantee 4 options
                const nq = strike.nextQuestion;
                if (nq.options.length < 4) {
                  const pad = ['All of the above', 'None of the above', 'Equilibrium'];
                  while (nq.options.length < 4 && pad.length > 0) nq.options.push(pad.shift()!);
                }
                setCurrentQuestion(nq);
              }
            } else {
              handleVictory();
            }
          }, 1400);
        } else {
          // Deflected by enemy: knockback stagger
          anim.warriorAction = 'parried';
          anim.actionProgress = 0;

          if (strike.playerHp <= 0) {
            setTimeout(() => {
              setGameOver(true);
              setIsVictory(false);
            }, 800);
          }
        }
      }, 550);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleVictory = async () => {
    setGameOver(true);
    setIsVictory(true);
    animStateRef.current.warriorAction = 'victory';

    try {
      const summary = await apiFetch('/api/katana/session/complete', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          victory: true
        })
      });
      setEarnedXp(summary.xpEarned || 250);
      setEarnedStars(summary.stars || 3);
      triggerRefresh();
    } catch {
      setEarnedXp(250);
      setEarnedStars(3);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#060B19',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* 1. Full 3D WebGL Three.js Canvas Container */}
      <div
        ref={mountRef}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />

      {/* 2. Top Tactical HUD (HP, Environment Switcher, Topic & Question Prompt) */}
      <header
        style={{
          position: 'absolute',
          top: 16,
          left: 20,
          right: 20,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          pointerEvents: 'none' // Allow canvas clicks underneath except on interactive cards
        }}
      >
        {/* Upper Status Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Player HP & Combo (Left) */}
          <div
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 18,
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)'
              }}
            >
              <Shield size={18} color="#FFFFFF" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                  KATANA WARRIOR
                </span>
                {comboCount > 1 && (
                  <span
                    style={{
                      background: '#FF6A00',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 900
                    }}
                  >
                    x{comboCount} COMBO 🔥
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 130, height: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                      transition: 'width 0.25s ease'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>
                  {playerHp}/{playerMaxHp}
                </span>
              </div>
            </div>
          </div>

          {/* Center Environment Selector & Wave Pill */}
          <div
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 999,
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Environment Tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(Object.keys(ENVIRONMENTS) as EnvironmentType[]).map((envKey) => {
                const conf = ENVIRONMENTS[envKey];
                const isActive = currentEnvironment === envKey;
                return (
                  <button
                    key={envKey}
                    type="button"
                    onClick={() => switchEnvironment(envKey)}
                    style={{
                      background: isActive ? '#FF6A00' : 'transparent',
                      border: 'none',
                      borderRadius: 999,
                      padding: '4px 10px',
                      color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s ease'
                    }}
                    title={`Switch environment to ${conf.name} (keeps same question continuous)`}
                  >
                    <span>{conf.icon}</span>
                    <span>{conf.name}</span>
                  </button>
                );
              })}
            </div>

            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

            {/* Wave / Boss Badge */}
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF' }}>
              {isBoss ? 'FINAL BOSS' : `Wave ${currentWave} / ${totalWaves}`}
            </span>
          </div>

          {/* Enemy HP, Audio Toggle & Close (Right) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Enemy Status */}
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 18,
                padding: '10px 18px',
                textAlign: 'right',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#EF4444', letterSpacing: '0.04em' }}>
                  {isBoss ? 'SHADOW WARLORD' : '4 SHADOW SQUAD'}
                </span>
                <Swords size={16} color="#EF4444" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>
                  {enemyHp}/{enemyMaxHp}
                </span>
                <div style={{ width: 130, height: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(0, (enemyHp / enemyMaxHp) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                      transition: 'width 0.25s ease'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Exit Modal */}
            <button
              type="button"
              onClick={onClose}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Lower Row: Full Question Prompt HUD (Fixed at Top, Never Covers 3D Arena) */}
        {!gameOver && currentQuestion && (
          <div
            style={{
              pointerEvents: 'auto',
              maxWidth: 880,
              margin: '0 auto',
              width: '100%',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #FF6A00',
              borderRadius: 20,
              padding: '14px 22px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: 'rgba(255, 106, 0, 0.2)',
                    color: '#FF6A00',
                    padding: '2px 10px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {topic} • {currentQuestion.conceptTag}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                  [Press A, B, C, D or Click Enemy in 3D Arena]
                </span>
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#38BDF8' }}>
                Score: {score}
              </span>
            </div>

            <p style={{ fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.42 }}>
              {currentQuestion.prompt}
            </p>

            {/* Explanation Banner Dropdown */}
            {lastExplanation && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: lastAnswerCorrect ? 'rgba(6, 95, 70, 0.65)' : 'rgba(153, 27, 27, 0.65)',
                  border: `1.5px solid ${lastAnswerCorrect ? '#10B981' : '#EF4444'}`,
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8
                }}
              >
                <Sparkles size={16} color={lastAnswerCorrect ? '#34D399' : '#F87171'} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: lastAnswerCorrect ? '#34D399' : '#FCA5A5' }}>
                    {lastAnswerCorrect ? '✓ WISDOM STRIKE SUCCESSFUL: ' : '✗ STRIKE DEFLECTED: '}
                  </strong>
                  {lastExplanation}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 3. Interactive Floating 3D Option Badges (Cleanly Pinned Over the 4 Shadow Enemies) */}
      {!gameOver && currentQuestion && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
          {currentQuestion.options.map((optionText, idx) => {
            const badge = projectedBadges[idx];
            if (!badge || !badge.visible) return null;
            const isHovered = hoveredOptionIndex === idx;
            const letter = String.fromCharCode(65 + idx); // A, B, C, D

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: badge.x,
                  top: badge.y,
                  transform: 'translate(-50%, -100%)',
                  pointerEvents: 'auto',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={() => setHoveredOptionIndex(idx)}
                onMouseLeave={() => setHoveredOptionIndex(null)}
                onClick={() => handleExecuteStrike(idx)}
              >
                {/* 3D Billboard Option Card */}
                <div
                  style={{
                    background: isHovered ? 'rgba(255, 106, 0, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                    border: isHovered ? '2px solid #FFFFFF' : '1.5px solid #FF6A00',
                    borderRadius: 16,
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    maxWidth: 240,
                    minWidth: 160,
                    boxShadow: isHovered
                      ? '0 8px 30px rgba(255, 106, 0, 0.6), 0 0 15px #FF6A00'
                      : '0 8px 24px rgba(0, 0, 0, 0.7)',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1.0)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Option Badge Circle [A], [B], [C], [D] */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isHovered ? '#FFFFFF' : '#FF6A00',
                      color: isHovered ? '#FF6A00' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.84rem',
                      flexShrink: 0
                    }}
                  >
                    {letter}
                  </div>

                  {/* Option Text */}
                  <span
                    style={{
                      color: '#FFFFFF',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                    }}
                  >
                    {optionText}
                  </span>
                </div>

                {/* Pointing down chevron indicator */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `8px solid ${isHovered ? '#FF6A00' : '#FF6A00'}`,
                    margin: '0 auto'
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Victory / Defeat Modal Overlay */}
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(14px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: `2px solid ${isVictory ? '#FF6A00' : '#EF4444'}`,
              borderRadius: 24,
              padding: 36,
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
              boxShadow: `0 24px 64px ${isVictory ? 'rgba(255, 106, 0, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
            }}
          >
            <div style={{ marginBottom: 16 }}>
              {isVictory ? (
                <Trophy size={68} color="#F59E0B" style={{ filter: 'drop-shadow(0 0 20px #F59E0B)' }} />
              ) : (
                <RotateCcw size={68} color="#EF4444" style={{ filter: 'drop-shadow(0 0 20px #EF4444)' }} />
              )}
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
              {isVictory ? 'WISDOM BATTLE VICTORY!' : 'SPIRIT EXHAUSTED'}
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: '0 0 22px 0', lineHeight: 1.5 }}>
              {isVictory
                ? 'Your katana strikes vanquished the shadow warriors through accurate academic mastery.'
                : 'Review the concept explanations, reforge your spirit, and triumph over the shadow demons.'}
            </p>

            {isVictory && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Award
                      key={idx}
                      size={36}
                      color={idx < earnedStars ? '#F59E0B' : 'rgba(255,255,255,0.15)'}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FF6A00' }}>
                  +{earnedXp} XP Earned
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 14 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'transparent',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  cursor: 'pointer'
                }}
              >
                Back to Library
              </button>
              <button
                type="button"
                onClick={loadSession}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: '#FF6A00',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 106, 0, 0.4)'
                }}
              >
                Battle Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
