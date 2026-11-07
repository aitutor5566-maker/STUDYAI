import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw, ZoomIn, ZoomOut, Play, Pause, Bookmark, Box, ShieldCheck, X,
  Sparkles, Camera, Layers, Scissors, Move, Activity, FileText, CheckCircle2,
  HelpCircle, MessageSquare, Compass, Award, RefreshCw, Send, ChevronRight,
  Volume2, VolumeX, Search, ChevronLeft
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import {
  PROCEDURAL_3D_BUILDERS,
  Diagram3DModelResult,
  ModelPartInfo,
  Custom3DPrimitive,
  ModelSpec,
  VERIFIED_MODEL_SPECS
} from '../utils/diagram3dModels';

export type { ModelPartInfo, Custom3DPrimitive, ModelSpec };
export { VERIFIED_MODEL_SPECS };

// Anatomical Systems (Screenshot 2 bottom bar)
export const ANATOMICAL_SYSTEMS = [
  { id: 'Skeletal', label: 'Skeletal', icon: '🦴', modelKey: 'human_torso_anatomy' },
  { id: 'Connective', label: 'Connective T.', icon: '🕸️', modelKey: 'human_torso_anatomy' },
  { id: 'Muscular', label: 'Muscular', icon: '💪', modelKey: 'human_torso_anatomy' },
  { id: 'Arterial', label: 'Arterial', icon: '🩸', modelKey: 'human_heart' },
  { id: 'Venous', label: 'Venous', icon: '🔵', modelKey: 'human_heart' },
  { id: 'Lymphatic', label: 'Lymphatic', icon: '🛡️', modelKey: 'human_torso_anatomy' },
  { id: 'Nervous', label: 'Nervous', icon: '🧠', modelKey: 'human_ear' },
  { id: 'Respiratory', label: 'Respiratory', icon: '🫁', modelKey: 'human_lungs' },
  { id: 'Digestive', label: 'Digestive', icon: '🍎', modelKey: 'human_torso_anatomy' },
  { id: 'Endocrine', label: 'Endocrine', icon: '⚡', modelKey: 'human_torso_anatomy' },
  { id: 'Urogenital', label: 'Urogenital', icon: '💧', modelKey: 'human_torso_anatomy' },
  { id: 'Integumentary', label: 'Integumentary', icon: '🔬', modelKey: 'human_torso_anatomy' }
];

// Assemblr EDU Related Models (Screenshot 4 bottom tray)
export const ASSEMBLR_RELATED_MODELS = [
  { id: 'human_heart', title: 'Human Heart', subtitle: '4 Chambers & Valves', emoji: '❤️', bg: '#fee2e2' },
  { id: 'human_lungs', title: 'Human Lungs', subtitle: 'Lobes & Trachea', emoji: '🫁', bg: '#fce7f3' },
  { id: 'electric_circuit', title: 'Circuit Lab', subtitle: 'Battery & Bulb', emoji: '⚡', bg: '#ffedd5' },
  { id: 'human_torso_anatomy', title: 'Transparent Torso', subtitle: 'Anatomy Console', emoji: '🧬', bg: '#f3e8ff' },
  { id: 'human_ear', title: 'Human Ear', subtitle: 'Tympanic & Cochlea', emoji: '👂', bg: '#fef3c7' },
  { id: 'electric_motor', title: 'Electric Motor', subtitle: 'Magnetic Field', emoji: '⚙️', bg: '#e0e7ff' },
  { id: 'solar_system', title: 'Solar System', subtitle: 'Keplerian Orbits', emoji: '🪐', bg: '#dcfce7' },
  { id: 'dna_helix', title: 'DNA Double Helix', subtitle: 'Watson-Crick Model', emoji: '🧬', bg: '#e0f2fe' }
];

export type ViewingMode = 'full' | 'callouts' | 'cutaway' | 'exploded' | 'mechanism' | 'textbook2d';

export interface Interactive3DViewerProps {
  topic?: string;
  modelType?: string;
  compact?: boolean;
  onClose?: () => void;
  onSelectComponent?: (comp: ModelPartInfo) => void;
}

export const Interactive3DViewer: React.FC<Interactive3DViewerProps> = ({
  topic,
  modelType,
  compact = false,
  onClose,
  onSelectComponent
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelResultRef = useRef<Diagram3DModelResult | null>(null);

  // Active Model Spec
  const initialModelKey = useMemo(() => {
    if (modelType && VERIFIED_MODEL_SPECS[modelType]) return modelType;
    if (topic) {
      const lower = topic.toLowerCase();
      if (lower.includes('lung') || lower.includes('respirat')) return 'human_lungs';
      if (lower.includes('circuit') || lower.includes('electric') || lower.includes('ohm') || lower.includes('wire')) return 'electric_circuit';
      if (lower.includes('ear') || lower.includes('auditory') || lower.includes('sound')) return 'human_ear';
      if (lower.includes('torso') || lower.includes('organ') || lower.includes('skeleton')) return 'human_torso_anatomy';
      if (lower.includes('motor') || lower.includes('armature')) return 'electric_motor';
      if (lower.includes('heart') || lower.includes('blood') || lower.includes('cardiac')) return 'human_heart';
      if (lower.includes('solar') || lower.includes('orbit') || lower.includes('planet')) return 'solar_system';
      if (lower.includes('dna') || lower.includes('gene')) return 'dna_helix';
    }
    return 'human_heart';
  }, [topic, modelType]);

  const [selectedModelKey, setSelectedModelKey] = useState<string>(initialModelKey);
  const spec = VERIFIED_MODEL_SPECS[selectedModelKey] || VERIFIED_MODEL_SPECS.human_heart;

  // Viewing Modes
  const [activeMode, setActiveMode] = useState<ViewingMode>('full');
  const [explodedAmount, setExplodedAmount] = useState<number>(0.5); // 0 to 1

  // Component Selection
  const [selectedPartId, setSelectedPartId] = useState<string>(spec.parts[0]?.id || '');
  const activePart = useMemo(() => {
    return spec.parts.find((p) => p.id === selectedPartId) || spec.parts[0];
  }, [spec, selectedPartId]);

  // Mechanism Animation Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0); // 0.5, 1, 2
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  // Match the Labels Game Mode (Screenshot 5)
  const [gameModeActive, setGameModeActive] = useState<boolean>(false);
  const [matchedPartIds, setMatchedPartIds] = useState<Record<string, boolean>>({});
  const [activeQuizPartId, setActiveQuizPartId] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameTimer, setGameTimer] = useState<number>(0);
  const [objectsSearchQuery, setObjectsSearchQuery] = useState<string>('');

  // Active Anatomical System (Screenshot 2)
  const [selectedAnatomySystem, setSelectedAnatomySystem] = useState<string>('Respiratory');

  // Audio Voice Narration (Screenshot 3)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Projected 2D screen positions for leader line callout pins
  const [projectedPins, setProjectedPins] = useState<Array<{ id: string; label: string; x: number; y: number; visible: boolean }>>([]);

  // AI Tutor contextual questions
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Bookmark notice
  const [savedNotice, setSavedNotice] = useState<string>('');
  const { apiFetch, triggerRefresh } = useLearning();

  // Reset selected part when model changes
  useEffect(() => {
    if (spec.parts[0]) {
      setSelectedPartId(spec.parts[0].id);
    }
    setActiveStepIdx(0);
    setMatchedPartIds({});
    setGameModeActive(false);
  }, [selectedModelKey, spec]);

  // Game timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (gameModeActive) {
      interval = setInterval(() => {
        setGameTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameModeActive]);

  // Initialize Three.js Scene with OrbitControls and Raycasting
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 680;
    const height = compact ? 320 : 440;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Apply studio background color based on reference screenshots
    const studioColor = spec.studioBackground || '#fed7aa';
    scene.background = new THREE.Color(studioColor);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    const defaultCam = spec.defaultCamera || [0, 1.2, 6.0];
    camera.position.set(defaultCam[0], defaultCam[1], defaultCam[2]);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls for smooth 360-degree rotation, pinch/wheel zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 20;
    controls.minDistance = 1.5;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.2;

    // Lighting rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    keyLight.position.set(6, 9, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    // Build procedural 3D model
    const builder = PROCEDURAL_3D_BUILDERS[selectedModelKey];
    let modelResult: Diagram3DModelResult;
    if (builder) {
      modelResult = builder();
    } else {
      modelResult = PROCEDURAL_3D_BUILDERS.human_heart();
    }
    modelResultRef.current = modelResult;
    scene.add(modelResult.rootGroup);

    // Raycasting for direct 3D component clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(modelResult.rootGroup.children, true);

      if (intersects.length > 0) {
        // Find ancestor with userData.id
        let current: THREE.Object3D | null = intersects[0].object;
        let foundId = '';
        while (current && current !== modelResult.rootGroup) {
          if (current.userData?.id) {
            foundId = current.userData.id;
            break;
          }
          current = current.parent;
        }

        if (foundId) {
          setSelectedPartId(foundId);
          const foundPart = spec.parts.find((p) => p.id === foundId);
          if (foundPart && onSelectComponent) {
            onSelectComponent(foundPart);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation & Render Loop
    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      if (isPlaying) {
        clock += 0.02 * animSpeed;
        if (modelResult.onAnimate) {
          modelResult.onAnimate(clock, animSpeed);
        }
      }

      // Update projected 2D coordinates for leader line callout pins
      const pinCoords: Array<{ id: string; label: string; x: number; y: number; visible: boolean }> = [];
      spec.parts.forEach((part) => {
        if (!part.pinPosition) return;
        const v = new THREE.Vector3(part.pinPosition[0], part.pinPosition[1], part.pinPosition[2]);
        v.project(camera);

        const isBehind = v.z > 1;
        const screenX = ((v.x + 1) * width) / 2;
        const screenY = ((-v.y + 1) * height) / 2;

        pinCoords.push({
          id: part.id,
          label: part.label,
          x: screenX,
          y: screenY,
          visible: !isBehind && screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height
        });
      });
      setProjectedPins(pinCoords);

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth || 680;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      renderer.dispose();
    };
  }, [selectedModelKey, spec, compact, isPlaying, animSpeed, onSelectComponent]);

  // Handle Exploded View separation
  useEffect(() => {
    if (!modelResultRef.current) return;
    const comps = modelResultRef.current.components;

    spec.parts.forEach((part) => {
      const meshes = comps[part.id];
      if (!meshes) return;

      const factor = activeMode === 'exploded' ? explodedAmount * 1.5 : 0;
      const pos = part.pinPosition || [0.5, 0.5, 0.5];
      // Normalize vector
      const len = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]) || 1;
      const dx = (pos[0] / len) * factor;
      const dy = (pos[1] / len) * factor;
      const dz = (pos[2] / len) * factor;

      meshes.forEach((m) => {
        m.position.x = dx;
        m.position.y = dy;
        m.position.z = dz;
      });
    });
  }, [activeMode, explodedAmount, spec]);

  // Handle Cutaway / Cross-Section mode visibility
  useEffect(() => {
    if (!modelResultRef.current) return;
    const cutaways = modelResultRef.current.cutawayMeshes;
    cutaways.forEach((mesh) => {
      if (mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (activeMode === 'cutaway') {
          mat.wireframe = false;
          mat.opacity = 0.85;
          mat.transparent = true;
        } else {
          mat.opacity = 1.0;
          mat.transparent = false;
        }
      }
    });
  }, [activeMode]);

  // Camera preset buttons
  const setCameraPreset = (preset: 'front' | 'back' | 'left' | 'right' | 'top' | 'isometric' | 'reset') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    controls.target.set(0, 0, 0);

    const dist = 6.2;
    switch (preset) {
      case 'front':
        cam.position.set(0, 0.5, dist);
        break;
      case 'back':
        cam.position.set(0, 0.5, -dist);
        break;
      case 'left':
        cam.position.set(-dist, 0.5, 0);
        break;
      case 'right':
        cam.position.set(dist, 0.5, 0);
        break;
      case 'top':
        cam.position.set(0, dist + 1, 0.1);
        break;
      case 'isometric':
      case 'reset':
      default:
        cam.position.set(dist * 0.65, dist * 0.55, dist * 0.65);
        break;
    }
    controls.update();
  };

  // Toggle Auto-rotation
  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
    }
  };

  // Bookmark model to user library
  const handleSaveToLibrary = async () => {
    try {
      await apiFetch('/api/diagrams-3d/save', {
        method: 'POST',
        body: JSON.stringify({ diagramId: spec.id })
      });
      setSavedNotice('Saved to 3D Library!');
      triggerRefresh();
      setTimeout(() => setSavedNotice(''), 3000);
    } catch {
      setSavedNotice('Diagram bookmarked!');
      setTimeout(() => setSavedNotice(''), 3000);
    }
  };

  // Ask AI Tutor contextual question
  const handleAskAiTutor = async (promptText?: string) => {
    const q = promptText || aiQuestion;
    if (!q.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const res = await apiFetch('/api/diagrams-3d/ask', {
        method: 'POST',
        body: JSON.stringify({
          diagramId: spec.id,
          componentId: activePart.id,
          question: q
        })
      });
      if (res && res.answer) {
        setAiResponse(res.answer);
      } else {
        setAiResponse(`The ${activePart.label} serves a critical role: ${activePart.role} During clinical and exam evaluations, questions frequently focus on how this component maintains homeostatic function.`);
      }
    } catch {
      setAiResponse(`The ${activePart.label} is essential: ${activePart.role}`);
    } finally {
      setIsAiLoading(false);
      if (!promptText) setAiQuestion('');
    }
  };

  // Speech Narration of Selected Component (Screenshot 3 Voice Waveform)
  const handleSpeakPart = (label: string, text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${label}. ${text}`);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Match the Labels Game handlers (Screenshot 5)
  const handleSelectQuizLabel = (partId: string) => {
    if (!activeQuizPartId) {
      setActiveQuizPartId(partId);
      return;
    }
    // If user clicked the same target slot
    if (activeQuizPartId === partId) {
      setMatchedPartIds((prev) => ({ ...prev, [partId]: true }));
      setGameScore((s) => s + 10);
      setActiveQuizPartId(null);
    } else {
      // Wrong match
      setActiveQuizPartId(null);
    }
  };

  return (
    <div className="glass-card" style={{ padding: compact ? 14 : 20, position: 'relative', overflow: 'hidden' }}>
      {/* 1. Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#FFF3E8',
              color: '#FF6A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255,106,0,0.2)'
            }}
          >
            <Box size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: compact ? '0.95rem' : '1.1rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                {spec.title}
              </h3>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 999, background: '#FFF3E8', color: '#FF6A00', fontWeight: 700 }}>
                {spec.subject}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>
              <ShieldCheck size={14} color="#FF6A00" />
              <span>{spec.verificationBadge}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Model Selector */}
          <select
            aria-label="Select 3D Scientific Diagram"
            value={selectedModelKey}
            onChange={(e) => setSelectedModelKey(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 999,
              border: '1px solid rgba(255,106,0,0.3)',
              background: '#FFF3E8',
              color: '#202124',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <option value="human_heart">❤️ Human Heart Cutaway (Assemblr EDU)</option>
            <option value="human_lungs">🫁 Human Lungs &amp; Lobes (Atlas)</option>
            <option value="electric_circuit">⚡ Physics Circuit &amp; Electrons</option>
            <option value="human_torso_anatomy">🧬 Transparent Torso Model</option>
            <option value="human_ear">👂 Human Ear Cross-Section</option>
            <option value="electric_motor">⚙️ DC Electric Motor</option>
            <option value="solar_system">🪐 Solar System Keplerian Orbits</option>
            <option value="dna_helix">🧬 DNA Double Helix</option>
          </select>

          {/* Bookmark Button */}
          <button type="button" onClick={handleSaveToLibrary} className="btn-glass" style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
            <Bookmark size={14} />
            <span>{savedNotice || 'Bookmark'}</span>
          </button>

          {/* Match the Labels Quiz Mode Toggle (Screenshot 5) */}
          <button
            type="button"
            onClick={() => setGameModeActive(!gameModeActive)}
            className="btn-glass"
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              background: gameModeActive ? '#FF6A00' : 'rgba(255,255,255,0.85)',
              color: gameModeActive ? '#FFFFFF' : '#202124',
              borderColor: '#FF6A00'
            }}
          >
            <Award size={14} />
            <span>{gameModeActive ? 'Exit Label Game' : 'Match the Labels'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close 3D Lab"
              className="btn-glass"
              style={{ padding: '7px 10px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Six Viewing Mode Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 12,
          overflowX: 'auto',
          paddingBottom: 4
        }}
      >
        {[
          { id: 'full', label: '1. 3D Full Model', icon: Box },
          { id: 'callouts', label: '2. Labelled Callouts', icon: Layers },
          { id: 'cutaway', label: '3. Cross-Section Cutaway', icon: Scissors },
          { id: 'exploded', label: '4. Exploded View', icon: Move },
          { id: 'mechanism', label: '5. Working Mechanism', icon: Activity },
          { id: 'textbook2d', label: '6. 2D Textbook View', icon: FileText }
        ].map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveMode(mode.id as ViewingMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? '#FF6A00' : 'rgba(255,255,255,0.7)',
                color: isActive ? '#FFFFFF' : '#4B5563',
                border: isActive ? '1px solid #FF6A00' : '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 2px 6px rgba(255,106,0,0.25)' : 'none'
              }}
            >
              <Icon size={14} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. The Interactive 3D WebGL Canvas Viewport OR 2D Textbook Mode */}
      <div
        style={{
          position: 'relative',
          borderRadius: 18,
          overflow: 'hidden',
          background: spec.studioBackground || '#fed7aa',
          marginBottom: 14,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        {activeMode === 'textbook2d' ? (
          // Crisp 2D Textbook Technical View
          <div
            style={{
              height: compact ? 320 : 440,
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center'
            }}
          >
            <div style={{ maxWidth: 520, width: '100%' }}>
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: '#FFF3E8',
                  border: '1px solid rgba(255,106,0,0.2)',
                  marginBottom: 16
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FF6A00' }}>
                  2D Textbook Technical Schema: {spec.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 4 }}>
                  {spec.mechanismSummary}
                </div>
              </div>

              {/* Technical 2D Schematic Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 10,
                  maxHeight: 240,
                  overflowY: 'auto'
                }}
              >
                {spec.parts.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPartId(p.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: selectedPartId === p.id ? '2px solid #FF6A00' : '1px solid #E5E7EB',
                      background: selectedPartId === p.id ? '#FFF3E8' : '#F9FAFB',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: p.color
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#202124' }}>
                        {idx + 1}. {p.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 4, lineHeight: 1.35 }}>
                      {p.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Three.js 3D WebGL Canvas
          <div ref={containerRef} style={{ width: '100%', height: compact ? 320 : 440, position: 'relative' }} />
        )}

        {/* Floating 3D-to-2D Callout Leader Line Pins (Screenshot 2 & 4) */}
        {(activeMode === 'callouts' || activeMode === 'full') && !gameModeActive && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {projectedPins.map((pin) => {
                if (!pin.visible) return null;
                const isSelected = selectedPartId === pin.id;
                return (
                  <g key={`leader-${pin.id}`}>
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={isSelected ? 4 : 2.5}
                      fill={isSelected ? '#FF6A00' : '#FFFFFF'}
                      stroke={isSelected ? '#FFFFFF' : '#475569'}
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </svg>
            {projectedPins.map((pin) => {
              if (!pin.visible) return null;
              const isSelected = selectedPartId === pin.id;
              return (
                <div
                  key={pin.id}
                  style={{
                    position: 'absolute',
                    left: pin.x,
                    top: pin.y - 12,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedPartId(pin.id)}
                >
                  <div
                    style={{
                      padding: '3px 8px',
                      borderRadius: 8,
                      background: isSelected ? '#FF6A00' : 'rgba(255,255,255,0.94)',
                      color: isSelected ? '#FFFFFF' : '#202124',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      border: isSelected ? '1.5px solid #FFFFFF' : '1px solid rgba(0,0,0,0.14)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isSelected ? '#FFFFFF' : '#FF6A00'
                      }}
                    />
                    <span>{pin.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* "Match the Labels" Game Overlay (Screenshot 5) */}
        {gameModeActive && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 12,
              pointerEvents: 'none'
            }}
          >
            {/* Top Game Bar with "< Match the labels >" (Screenshot 5) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.96)',
                padding: '6px 14px',
                borderRadius: 999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                pointerEvents: 'auto'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF6A00' }}>
                  {spec.title.split(':')[0]}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                  Score: <strong style={{ color: '#16A34A' }}>{gameScore} pts</strong>
                </span>
              </div>

              {/* Center Match Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#FFF3E8',
                  padding: '3px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,106,0,0.3)'
                }}
              >
                <ChevronLeft size={14} color="#FF6A00" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF6A00' }}>
                  Match the labels
                </span>
                <ChevronRight size={14} color="#FF6A00" />
              </div>

              <div style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 700 }}>
                ⏱️ {Math.floor(gameTimer / 60).toString().padStart(2, '0')}:{(gameTimer % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Middle Container with Left "Objects" Drawer + 3D Target Slots */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', pointerEvents: 'none', margin: '8px 0' }}>
              {/* Left "Objects" list sidebar (Screenshot 5) */}
              <div
                style={{
                  width: 140,
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 12,
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  pointerEvents: 'auto',
                  maxHeight: '100%',
                  overflowY: 'auto',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#202124' }}>
                  Objects:
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={objectsSearchQuery}
                  onChange={(e) => setObjectsSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '3px 6px',
                    fontSize: '0.68rem',
                    borderRadius: 6,
                    border: '1px solid #E5E7EB',
                    outline: 'none',
                    marginBottom: 2
                  }}
                />
                {spec.parts
                  .filter((p) => !objectsSearchQuery || p.label.toLowerCase().includes(objectsSearchQuery.toLowerCase()))
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectQuizLabel(p.id)}
                      style={{
                        fontSize: '0.68rem',
                        padding: '3px 6px',
                        borderRadius: 6,
                        background: matchedPartIds[p.id] ? '#DCFCE7' : activeQuizPartId === p.id ? '#FFF3E8' : '#F3F4F6',
                        color: matchedPartIds[p.id] ? '#166534' : activeQuizPartId === p.id ? '#FF6A00' : '#374151',
                        border: activeQuizPartId === p.id ? '1px solid #FF6A00' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.label}
                      </span>
                      {matchedPartIds[p.id] && <span style={{ fontWeight: 800 }}>✓</span>}
                    </div>
                  ))}
              </div>

              {/* Target Slots overlaid on 3D Model */}
              <div style={{ position: 'absolute', top: 0, left: 148, right: 0, bottom: 0, pointerEvents: 'none' }}>
                {projectedPins.map((pin) => {
                  if (!pin.visible) return null;
                  const isMatched = matchedPartIds[pin.id];
                  const isTarget = activeQuizPartId === pin.id;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => handleSelectQuizLabel(pin.id)}
                      style={{
                        position: 'absolute',
                        left: pin.x - 148,
                        top: pin.y,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'auto',
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: isMatched ? '#16A34A' : isTarget ? '#FF6A00' : 'rgba(255,255,255,0.94)',
                        color: isMatched || isTarget ? '#FFFFFF' : '#202124',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: isTarget ? '2px solid #FFFFFF' : '1px solid rgba(0,0,0,0.15)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        cursor: 'pointer'
                      }}
                    >
                      {isMatched ? `✓ ${pin.label}` : isTarget ? 'Click match below!' : '❓ Pin Slot'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Term Bank (Screenshot 5 style dark cards) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.96)',
                padding: '8px 12px',
                borderRadius: 12,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                pointerEvents: 'auto',
                maxWidth: 720,
                margin: '0 auto'
              }}
            >
              {spec.parts.map((p) => {
                const isMatched = matchedPartIds[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleSelectQuizLabel(p.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      background: isMatched ? '#E2E8F0' : activeQuizPartId === p.id ? '#FF6A00' : '#0F172A',
                      color: isMatched ? '#94A3B8' : '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                      border: 'none',
                      cursor: isMatched ? 'default' : 'pointer',
                      textDecoration: isMatched ? 'line-through' : 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                    }}
                  >
                    {p.label.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Exploded View Slider Overlay (Mode 4) */}
        {activeMode === 'exploded' && (
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              right: 14,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#202124' }}>
              Exploded Separation:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedAmount}
              onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#FF6A00' }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF6A00', minWidth: 36 }}>
              {Math.round(explodedAmount * 100)}%
            </span>
          </div>
        )}

        {/* Working Mechanism Controls (Mode 5) */}
        {activeMode === 'mechanism' && (
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              right: 14,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-orange"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setAnimSpeed(spd)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: animSpeed === spd ? '#FF6A00' : '#F3F4F6',
                      color: animSpeed === spd ? '#FFFFFF' : '#4B5563',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600 }}>
              {spec.mechanismSummary}
            </div>
          </div>
        )}

        {/* Camera Preset Toolbar (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(6px)',
            padding: '4px 6px',
            borderRadius: 999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <button
            type="button"
            onClick={() => setCameraPreset('isometric')}
            title="Isometric View"
            style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, color: '#202124' }}
          >
            Iso
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('front')}
            title="Front View"
            style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, color: '#202124' }}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('top')}
            title="Top View"
            style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, color: '#202124' }}
          >
            Top
          </button>
          <button
            type="button"
            onClick={toggleAutoRotate}
            title="Toggle 360 Auto-Rotate"
            style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#FF6A00' }}
          >
            <RefreshCw size={12} />
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('reset')}
            title="Reset Camera"
            style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Screenshot 2: Anatomical Systems Selector Bar */}
      {(spec.subject.toLowerCase().includes('bio') || spec.id.includes('lung') || spec.id.includes('heart') || spec.id.includes('torso') || spec.id.includes('ear')) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            padding: '6px 4px 10px 4px',
            marginBottom: 12
          }}
        >
          {ANATOMICAL_SYSTEMS.map((sys) => {
            const isSelected = selectedAnatomySystem === sys.id;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => {
                  setSelectedAnatomySystem(sys.id);
                  if (sys.modelKey && VERIFIED_MODEL_SPECS[sys.modelKey]) {
                    setSelectedModelKey(sys.modelKey);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 800 : 600,
                  background: isSelected ? '#FF6A00' : 'rgba(255,255,255,0.85)',
                  color: isSelected ? '#FFFFFF' : '#4B5563',
                  border: isSelected ? '1px solid #FF6A00' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 8px rgba(255,106,0,0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{sys.icon}</span>
                <span>{sys.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Component Inspector & Interactive Detail Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : '1.4fr 1fr',
          gap: 14,
          marginBottom: 14
        }}
      >
        {/* Left: Selected Component Role & Clinical/Exam Context */}
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: activePart.color,
                  display: 'inline-block'
                }}
              />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                {activePart.label}
              </h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Voice Waveform Button (Screenshot 3) */}
              <button
                type="button"
                onClick={() => handleSpeakPart(activePart.label, activePart.role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: isSpeaking ? '#FF6A00' : '#FFF3E8',
                  color: isSpeaking ? '#FFFFFF' : '#FF6A00',
                  border: '1px solid rgba(255,106,0,0.3)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Listen to voice explanation"
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{isSpeaking ? 'Mute' : 'Voice Explainer'}</span>
              </button>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: '#FFF3E8', color: '#FF6A00', fontWeight: 700 }}>
                Selected Part
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.5, marginBottom: 10 }}>
            {activePart.role}
          </p>

          {activePart.clinicalNote && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: '#EFF6FF',
                borderLeft: '3px solid #3B82F6',
                fontSize: '0.78rem',
                color: '#1E40AF',
                marginBottom: 8
              }}
            >
              <strong>Clinical / Practical Note:</strong> {activePart.clinicalNote}
            </div>
          )}

          {activePart.examQuestion && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: '#FEF3C7',
                borderLeft: '3px solid #F59E0B',
                fontSize: '0.78rem',
                color: '#92400E'
              }}
            >
              <strong>High-Yield Exam Focus:</strong> {activePart.examQuestion}
            </div>
          )}
        </div>

        {/* Right: Contextual AI Tutor Panel */}
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: '#FFF3E8',
            border: '1px solid rgba(255,106,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={16} color="#FF6A00" />
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#202124' }}>
                Ask AI Tutor about {activePart.label}
              </span>
            </div>

            {/* Quick Question Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {[
                `How does ${activePart.label.split(' ')[0]} work?`,
                `Why is this part vital?`,
                `Common exam question`
              ].map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => handleAskAiTutor(qp)}
                  disabled={isAiLoading}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: '#FFFFFF',
                    border: '1px solid rgba(255,106,0,0.3)',
                    fontSize: '0.7rem',
                    color: '#FF6A00',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {qp}
                </button>
              ))}
            </div>

            {aiResponse && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  fontSize: '0.78rem',
                  color: '#202124',
                  lineHeight: 1.45,
                  maxHeight: 120,
                  overflowY: 'auto',
                  border: '1px solid rgba(0,0,0,0.06)',
                  marginBottom: 8
                }}
              >
                {aiResponse}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAiTutor();
            }}
            style={{ display: 'flex', gap: 6, marginTop: 6 }}
          >
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask anything about this component..."
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.12)',
                fontSize: '0.78rem',
                background: '#FFFFFF'
              }}
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiQuestion.trim()}
              className="btn-orange"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>

      {/* 5. Guided Mechanism Step-by-Step Progress */}
      {spec.guidedSteps && spec.guidedSteps.length > 0 && (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>
              🔬 Step-by-Step Mechanism Pathway
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {spec.guidedSteps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveStepIdx(i)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeStepIdx === i ? '#FF6A00' : '#E5E7EB',
                    color: activeStepIdx === i ? '#FFFFFF' : '#4B5563'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#202124', lineHeight: 1.45 }}>
            <span style={{ fontWeight: 700, color: '#FF6A00' }}>
              {spec.guidedSteps[activeStepIdx]?.step}:{' '}
            </span>
            <span>{spec.guidedSteps[activeStepIdx]?.detail}</span>
          </div>
        </div>
      )}

      {/* Screenshot 4: Assemblr EDU Related 3D Models Carousel */}
      <div
        style={{
          marginTop: 14,
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 14,
          border: '1px solid rgba(255, 106, 0, 0.18)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#202124' }}>
              Assemblr EDU 3D Diagram Topics
            </span>
            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 999, background: '#FFF3E8', color: '#FF6A00', fontWeight: 700 }}>
              Curriculum Verified
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
            Click any model to investigate in 360°
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {ASSEMBLR_RELATED_MODELS.map((item) => {
            const isCurrent = selectedModelKey === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedModelKey(item.id)}
                style={{
                  minWidth: 130,
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: isCurrent ? '#FFF3E8' : item.bg,
                  border: isCurrent ? '2px solid #FF6A00' : '1px solid rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>{item.emoji}</div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {item.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Modal Wrapper for global app usage
export const Interactive3DLabModal: React.FC = () => {
  const { modal3D, close3DLab } = useLearning();
  if (!modal3D.open) return null;
  return (
    <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Interactive 3D Learning Lab">
      <div className="glass-modal-content" style={{ maxWidth: 880, width: '95%' }}>
        <Interactive3DViewer topic={modal3D.topic} modelType={modal3D.modelType} onClose={close3DLab} />
      </div>
    </div>
  );
};

// Backwards-compatible Interactive3DLab export
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
