import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EducationalQuestion, GameFeedback, OptionId } from '../../games/types';
import { LevelInfo } from '../../games/ProgressionController';

interface AnswerRunner3DProps {
  question: EducationalQuestion | null;
  onAnswerChosen: (optionId: OptionId) => void;
  levelInfo: LevelInfo;
  feedback: GameFeedback | null;
  lives: number;
  score: number;
  combo: number;
  isPaused: boolean;
}

export const AnswerRunner3D: React.FC<AnswerRunner3DProps> = ({
  question,
  onAnswerChosen,
  levelInfo,
  feedback,
  lives,
  score,
  combo,
  isPaused
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentLane, setCurrentLane] = useState<number>(1); // 0: Left, 1: Center, 2: Right

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const runnerGroupRef = useRef<THREE.Group | null>(null);
  const gateGroupRef = useRef<THREE.Group | null>(null);
  const roadSegmentsRef = useRef<THREE.Mesh[]>([]);
  const gateZRef = useRef<number>(-60); // Gate approaches from -60 to +6
  const reqIdRef = useRef<number | null>(null);
  const isEvaluatingRef = useRef<boolean>(false);

  // Lane X coordinates
  const LANE_X = [-3.8, 0, 3.8];

  // Initialize Three.js 3-Lane Track
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 120);
    camera.position.set(0, 5.5, 9);
    camera.lookAt(0, 1.8, -12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.0);
    dirLight.position.set(0, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3. 3-Lane Highway
    const roadWidth = 12;
    const roadLength = 120;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 30);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2
    });

    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -35);
    road.receiveShadow = true;
    scene.add(road);
    roadSegmentsRef.current.push(road);

    // Lane Dividers
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xff6a00 });
    [-1.9, 1.9].forEach((xPos) => {
      const lineGeo = new THREE.PlaneGeometry(0.12, roadLength);
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(xPos, 0.02, -35);
      scene.add(lineMesh);
    });

    // 4. Runner Avatar Mesh
    const runner = new THREE.Group();
    runner.position.set(LANE_X[1], 0, 0);

    // Runner Body
    const torsoGeo = new THREE.BoxGeometry(0.7, 1.1, 0.5);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.3, metalness: 0.7 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    runner.add(torso);

    const visorGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.7, -0.1);
    runner.add(visor);

    // Jetpack trail
    const jetGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
    const jetMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    const jet = new THREE.Mesh(jetGeo, jetMat);
    jet.position.set(0, 0.9, 0.35);
    runner.add(jet);

    scene.add(runner);
    runnerGroupRef.current = runner;

    // 5. Checkpoint Gate Arch Group
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, -60);
    gateZRef.current = -60;

    // Arch structure
    const archMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6, 16), archMat);
    leftPillar.position.set(-6, 3, 0);
    gateGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6, 16), archMat);
    rightPillar.position.set(6, 3, 0);
    gateGroup.add(rightPillar);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.7, 0.8), archMat);
    topBeam.position.set(0, 6, 0);
    gateGroup.add(topBeam);

    scene.add(gateGroup);
    gateGroupRef.current = gateGroup;

    // Resize listener
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 6. Continuous Runner Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth lane switching interpolation
      if (runnerGroupRef.current) {
        const targetX = LANE_X[currentLane];
        runnerGroupRef.current.position.x += (targetX - runnerGroupRef.current.position.x) * 0.18;
        // Running vertical stride bobbing
        runnerGroupRef.current.position.y = Math.abs(Math.sin(elapsed * 12)) * 0.18;
      }

      // Move Gate towards runner
      if (gateGroupRef.current && !isPaused && !feedback) {
        const speed = 14 * levelInfo.speedMultiplier;
        gateZRef.current += speed * delta;
        gateGroupRef.current.position.z = gateZRef.current;

        // Collision Check: Gate reaches runner (Z >= -0.5)
        if (gateZRef.current >= -0.5 && !isEvaluatingRef.current) {
          isEvaluatingRef.current = true;
          // Evaluate choice based on lane runner is ACTUALLY in!
          if (question && question.options[currentLane]) {
            const chosen = question.options[currentLane];
            onAnswerChosen(chosen.id);
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Update Lane Gate Options whenever question changes
  useEffect(() => {
    const gateGroup = gateGroupRef.current;
    if (!gateGroup || !question) return;

    // Reset gate position to -60 for next question
    gateZRef.current = -60;
    gateGroup.position.z = -60;
    isEvaluatingRef.current = false;

    // Clear old gate option placards (keep first 3 arch parts)
    while (gateGroup.children.length > 3) {
      gateGroup.remove(gateGroup.children[gateGroup.children.length - 1]);
    }

    // 3 Answer Options for the 3 lanes
    question.options.slice(0, 3).forEach((opt, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = idx === currentLane ? 'rgba(255, 106, 0, 0.95)' : 'rgba(15, 23, 42, 0.88)';
        ctx.roundRect(8, 8, 240, 124, 18);
        ctx.fill();

        ctx.strokeStyle = idx === currentLane ? '#FFFFFF' : '#FF6A00';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 34px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Lane ${idx + 1} [${opt.id}]`, 128, 50);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 22px Inter, sans-serif';
        const displayTxt = opt.text.length > 18 ? opt.text.slice(0, 16) + '...' : opt.text;
        ctx.fillText(displayTxt, 128, 98);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(LANE_X[idx], 3.2, 0);
      sprite.scale.set(3.4, 1.8, 1);
      gateGroup.add(sprite);
    });
  }, [question, currentLane]);

  // Keyboard Lane Controls (ArrowLeft / ArrowRight / A / D / 1, 2, 3)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused || feedback) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCurrentLane((l) => Math.max(0, l - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCurrentLane((l) => Math.min(2, l + 1));
      } else if (['1'].includes(e.key)) {
        setCurrentLane(0);
      } else if (['2'].includes(e.key)) {
        setCurrentLane(1);
      } else if (['3'].includes(e.key)) {
        setCurrentLane(2);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPaused, feedback]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 520, borderRadius: 20, overflow: 'hidden' }}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Question HUD */}
      {question && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '92%',
            maxWidth: 720,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(255, 106, 0, 0.45)',
            borderRadius: 18,
            padding: '14px 20px',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🏃 Answer Runner • {levelInfo.title}
            </span>
            <div style={{ display: 'flex', gap: 10, fontSize: '0.78rem', fontWeight: 800 }}>
              <span style={{ color: '#FACC15' }}>★ Score: {score}</span>
              <span style={{ color: '#EF4444' }}>❤️ Lives: {lives}</span>
              {combo > 1 && <span style={{ color: '#38BDF8' }}>⚡ {combo}x Combo</span>}
            </div>
          </div>
          <h2 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#F8FAFC', lineHeight: 1.45 }}>
            {question.question}
          </h2>
        </div>
      )}

      {/* Bottom 3-Lane Switcher Buttons */}
      {question && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '92%',
            maxWidth: 720,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10
          }}
        >
          {question.options.slice(0, 3).map((opt, idx) => (
            <button
              key={opt.id}
              type="button"
              disabled={!!feedback}
              onClick={() => setCurrentLane(idx)}
              style={{
                padding: '12px 10px',
                borderRadius: 14,
                border: idx === currentLane ? '2px solid #FF6A00' : '1.5px solid rgba(255,255,255,0.2)',
                background: idx === currentLane ? 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)' : 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: idx === currentLane ? '0 0 16px rgba(255, 106, 0, 0.5)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>Lane {idx + 1} [{opt.id}]</div>
              <div style={{ marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {opt.text}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
