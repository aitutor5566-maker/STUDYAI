import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EducationalQuestion, GameFeedback, OptionId } from '../../games/types';
import { LevelInfo } from '../../games/ProgressionController';

interface AnswerShooter3DProps {
  question: EducationalQuestion | null;
  onAnswerChosen: (optionId: OptionId) => void;
  levelInfo: LevelInfo;
  feedback: GameFeedback | null;
  lives: number;
  score: number;
  combo: number;
  isPaused: boolean;
}

export const AnswerShooter3D: React.FC<AnswerShooter3DProps> = ({
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
  const [selectedTargetIdx, setSelectedTargetIdx] = useState<number>(0);
  const [isFiring, setIsFiring] = useState<boolean>(false);

  // References to preserve Three.js state across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const enemyMeshesRef = useRef<THREE.Group[]>([]);
  const projectilesRef = useRef<Array<{ mesh: THREE.Mesh; targetPos: THREE.Vector3; progress: number; onHit: () => void }>>([]);
  const particlesRef = useRef<Array<{ mesh: THREE.Points; life: number }>>([]);
  const reqIdRef = useRef<number | null>(null);

  // Initialize Three.js 3D Arena
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 13, 16);
    camera.lookAt(0, 0, -1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    dirLight.position.set(5, 15, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const arenaPointLight = new THREE.PointLight(0xff6a00, 2, 25);
    arenaPointLight.position.set(0, 4, 0);
    scene.add(arenaPointLight);

    // 3. Circular Arena Floor with Neon Grid
    const floorGeo = new THREE.CylinderGeometry(10, 10, 0.4, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ringGeo = new THREE.RingGeometry(9.6, 10, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff6a00, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    const grid = new THREE.GridHelper(18, 18, 0xff6a00, 0x334155);
    grid.position.y = 0.01;
    scene.add(grid);

    // 4. Player Avatar Mesh at (0, 0, 4.5)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 4.5);

    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.4, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    playerGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xff6a00, emissiveIntensity: 0.3 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    playerGroup.add(head);

    // Blaster cannon on player
    const cannonGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.8, 12);
    const cannonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const cannon = new THREE.Mesh(cannonGeo, cannonMat);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(0, 1.0, -0.6);
    playerGroup.add(cannon);

    scene.add(playerGroup);

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Continuous Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Bobbing & hovering enemies
      enemyMeshesRef.current.forEach((enemy, idx) => {
        enemy.position.y = 1.0 + Math.sin(elapsed * 2.5 + idx * 1.2) * 0.25;
        enemy.rotation.y += 0.015;
      });

      // Update projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i];
        p.progress += delta * 4.5;
        p.mesh.position.lerpVectors(playerGroup.position, p.targetPos, p.progress);

        if (p.progress >= 1.0) {
          scene.remove(p.mesh);
          p.onHit();
          projectilesRef.current.splice(i, 1);
        }
      }

      // Update particle explosions
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const part = particlesRef.current[i];
        part.life -= delta * 1.5;
        part.mesh.scale.multiplyScalar(1.03);
        if (part.life <= 0) {
          scene.remove(part.mesh);
          particlesRef.current.splice(i, 1);
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

  // Spawn and update 4 3D Enemies whenever Question or Options change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !question) return;

    // Clear previous enemy meshes
    enemyMeshesRef.current.forEach((mesh) => scene.remove(mesh));
    enemyMeshesRef.current = [];

    // 4 Target Positions in 3D Arena arc
    const enemyPositions = [
      new THREE.Vector3(-6.5, 1.2, -2.5),
      new THREE.Vector3(-2.2, 1.2, -5.5),
      new THREE.Vector3(2.2, 1.2, -5.5),
      new THREE.Vector3(6.5, 1.2, -2.5)
    ];

    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6];

    question.options.slice(0, 4).forEach((opt, idx) => {
      const enemyGroup = new THREE.Group();
      enemyGroup.position.copy(enemyPositions[idx]);

      // 3D Robot / Drone Body
      const coreGeo = new THREE.DodecahedronGeometry(0.85, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: colors[idx % 4],
        roughness: 0.3,
        metalness: 0.7,
        emissive: colors[idx % 4],
        emissiveIntensity: 0.25
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.castShadow = true;
      enemyGroup.add(coreMesh);

      // Rotating protective ring around drone
      const ringGeo = new THREE.TorusGeometry(1.1, 0.08, 12, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      enemyGroup.add(ringMesh);

      // 2D Billboard Canvas Sprite for Option ID & Text
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.roundRect(8, 8, 240, 112, 16);
        ctx.fill();

        ctx.strokeStyle = idx === selectedTargetIdx ? '#FF6A00' : '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#FF6A00';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Target [${opt.id}]`, 128, 48);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Inter, sans-serif';
        const displayTxt = opt.text.length > 18 ? opt.text.slice(0, 16) + '...' : opt.text;
        ctx.fillText(displayTxt, 128, 88);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 1.8, 0);
      sprite.scale.set(3.2, 1.6, 1);
      enemyGroup.add(sprite);

      scene.add(enemyGroup);
      enemyMeshesRef.current.push(enemyGroup);
    });
  }, [question, selectedTargetIdx]);

  // Create particle burst on hit
  const spawnExplosion = (pos: THREE.Vector3, color: number) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const count = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = pos.x + (Math.random() - 0.5) * 1.5;
      positions[i + 1] = pos.y + (Math.random() - 0.5) * 1.5;
      positions[i + 2] = pos.z + (Math.random() - 0.5) * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color, size: 0.25, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    particlesRef.current.push({ mesh: points, life: 1.0 });
  };

  // Shoot plasma projectile towards target index
  const triggerShoot = (targetIdx: number) => {
    if (isFiring || isPaused || feedback || !question) return;
    const targetEnemy = enemyMeshesRef.current[targetIdx];
    const targetOpt = question.options[targetIdx];
    if (!targetEnemy || !targetOpt) return;

    setIsFiring(true);
    setSelectedTargetIdx(targetIdx);

    const scene = sceneRef.current;
    if (!scene) return;

    // Create glowing plasma bolt
    const boltGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xff6a00 });
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.set(0, 1.0, 4.0);
    scene.add(bolt);

    projectilesRef.current.push({
      mesh: bolt,
      targetPos: targetEnemy.position.clone(),
      progress: 0,
      onHit: () => {
        setIsFiring(false);
        const isCorrect = targetOpt.id === question.correct_option_id;
        spawnExplosion(targetEnemy.position, isCorrect ? 0x22c55e : 0xef4444);
        onAnswerChosen(targetOpt.id);
      }
    });
  };

  // Keyboard navigation & shooting (1, 2, 3, 4, A, B, C, D, Space)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused || feedback) return;

      if (['1', 'a', 'A'].includes(e.key)) triggerShoot(0);
      else if (['2', 'b', 'B'].includes(e.key)) triggerShoot(1);
      else if (['3', 'c', 'C'].includes(e.key)) triggerShoot(2);
      else if (['4', 'd', 'D'].includes(e.key)) triggerShoot(3);
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerShoot(selectedTargetIdx);
      } else if (e.key === 'ArrowLeft') {
        setSelectedTargetIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedTargetIdx((prev) => Math.min(3, prev + 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTargetIdx, isPaused, feedback, question, isFiring]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 520, borderRadius: 20, overflow: 'hidden' }}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Question HUD Card */}
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
              🎯 Answer Shooter • {levelInfo.title}
            </span>
            <div style={{ display: 'flex', gap: 10, fontSize: '0.78rem', fontWeight: 800 }}>
              <span style={{ color: '#FACC15' }}>★ Score: {score}</span>
              <span style={{ color: '#EF4444' }}>❤️ Shields: {lives}</span>
              {combo > 1 && <span style={{ color: '#38BDF8' }}>⚡ {combo}x Combo</span>}
            </div>
          </div>
          <h2 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#F8FAFC', lineHeight: 1.45 }}>
            {question.question}
          </h2>
        </div>
      )}

      {/* Interactive Bottom Target Buttons */}
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
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8
          }}
        >
          {question.options.slice(0, 4).map((opt, idx) => (
            <button
              key={opt.id}
              type="button"
              disabled={isFiring || !!feedback}
              onClick={() => triggerShoot(idx)}
              style={{
                padding: '10px 8px',
                borderRadius: 14,
                border: idx === selectedTargetIdx ? '2px solid #FF6A00' : '1.5px solid rgba(255,255,255,0.2)',
                background: idx === selectedTargetIdx ? 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)' : 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: idx === selectedTargetIdx ? '0 0 16px rgba(255, 106, 0, 0.5)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Key [{opt.id}]</div>
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
