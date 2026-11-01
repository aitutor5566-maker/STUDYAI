import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EducationalQuestion, GameFeedback, OptionId } from '../../games/types';
import { LevelInfo } from '../../games/ProgressionController';

interface SpaceAnswerShooter3DProps {
  question: EducationalQuestion | null;
  onAnswerChosen: (optionId: OptionId) => void;
  levelInfo: LevelInfo;
  feedback: GameFeedback | null;
  lives: number;
  score: number;
  combo: number;
  isPaused: boolean;
}

export const SpaceAnswerShooter3D: React.FC<SpaceAnswerShooter3DProps> = ({
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
  const [selectedShipSector, setSelectedShipSector] = useState<number>(1); // 0, 1, 2, 3
  const [isBlasting, setIsBlasting] = useState<boolean>(false);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerShipRef = useRef<THREE.Group | null>(null);
  const enemyShipsRef = useRef<THREE.Group[]>([]);
  const lasersRef = useRef<Array<{ mesh: THREE.Mesh; targetPos: THREE.Vector3; progress: number; onHit: () => void }>>([]);
  const starParticlesRef = useRef<THREE.Points | null>(null);
  const explosionParticlesRef = useRef<Array<{ mesh: THREE.Points; life: number }>>([]);
  const reqIdRef = useRef<number | null>(null);

  // Sector X positions across space screen
  const SECTOR_X = [-6.2, -2.1, 2.1, 6.2];

  // Initialize Three.js Deep Space Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 150);
    camera.position.set(0, 4.0, 14);
    camera.lookAt(0, 3.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Space Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const cosmicLight = new THREE.PointLight(0x38bdf8, 2, 40);
    cosmicLight.position.set(0, 10, 5);
    scene.add(cosmicLight);

    // 3. Starfield Particle System
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 60;
      starPositions[i + 2] = -Math.random() * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, transparent: true, opacity: 0.8 });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);
    starParticlesRef.current = starfield;

    // 4. Player Starfighter Mesh at (0, -1.5, 5)
    const playerShip = new THREE.Group();
    playerShip.position.set(SECTOR_X[1], -1.8, 5);

    // Main fuselage
    const bodyGeo = new THREE.ConeGeometry(0.8, 2.2, 5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    playerShip.add(body);

    // Wings
    const wingGeo = new THREE.BoxGeometry(3.2, 0.1, 0.9);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0.2);
    playerShip.add(wings);

    // Glowing Thruster
    const thrusterGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.4, 12);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff6a00 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.rotation.x = Math.PI / 2;
    thruster.position.set(0, 0, 1.2);
    playerShip.add(thruster);

    scene.add(playerShip);
    playerShipRef.current = playerShip;

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

    // 5. Continuous Space Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth ship banking interpolation
      if (playerShipRef.current) {
        const targetX = SECTOR_X[selectedShipSector];
        const diffX = targetX - playerShipRef.current.position.x;
        playerShipRef.current.position.x += diffX * 0.2;
        playerShipRef.current.rotation.z = -diffX * 0.15; // banking tilt
      }

      // Starfield forward drift
      if (starParticlesRef.current) {
        const posAttr = starParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 2; i < array.length; i += 3) {
          array[i] += delta * 12 * levelInfo.speedMultiplier;
          if (array[i] > 15) {
            array[i] = -80;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Alien formation hover & sway
      enemyShipsRef.current.forEach((ship, idx) => {
        ship.position.y = 5.2 + Math.sin(elapsed * 2.0 + idx * 0.8) * 0.35;
        ship.rotation.y = Math.sin(elapsed * 1.5 + idx) * 0.2;
      });

      // Update lasers
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.progress += delta * 5.2;
        laser.mesh.position.lerpVectors(playerShip.position, laser.targetPos, laser.progress);

        if (laser.progress >= 1.0) {
          scene.remove(laser.mesh);
          laser.onHit();
          lasersRef.current.splice(i, 1);
        }
      }

      // Update explosion particles
      for (let i = explosionParticlesRef.current.length - 1; i >= 0; i--) {
        const exp = explosionParticlesRef.current[i];
        exp.life -= delta * 1.8;
        exp.mesh.scale.multiplyScalar(1.04);
        if (exp.life <= 0) {
          scene.remove(exp.mesh);
          explosionParticlesRef.current.splice(i, 1);
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

  // Update Alien Spacecraft Formation when Question changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !question) return;

    // Clear previous enemy ships
    enemyShipsRef.current.forEach((s) => scene.remove(s));
    enemyShipsRef.current = [];

    const shipColors = [0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6];

    question.options.slice(0, 4).forEach((opt, idx) => {
      const shipGroup = new THREE.Group();
      shipGroup.position.set(SECTOR_X[idx], 5.2, 0);

      // Alien Saucer / Cruiser Mesh
      const saucerGeo = new THREE.CylinderGeometry(1.2, 0.4, 0.5, 16);
      const saucerMat = new THREE.MeshStandardMaterial({
        color: shipColors[idx % 4],
        metalness: 0.8,
        roughness: 0.25,
        emissive: shipColors[idx % 4],
        emissiveIntensity: 0.3
      });
      const saucer = new THREE.Mesh(saucerGeo, saucerMat);
      shipGroup.add(saucer);

      const domeGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 0.35;
      shipGroup.add(dome);

      // Canvas Placard Sprite for Option ID & Text
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 130;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.roundRect(8, 8, 240, 114, 16);
        ctx.fill();

        ctx.strokeStyle = idx === selectedShipSector ? '#FF6A00' : '#38BDF8';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Alien [${opt.id}]`, 128, 48);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Inter, sans-serif';
        const displayTxt = opt.text.length > 18 ? opt.text.slice(0, 16) + '...' : opt.text;
        ctx.fillText(displayTxt, 128, 90);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 1.8, 0);
      sprite.scale.set(3.4, 1.7, 1);
      shipGroup.add(sprite);

      scene.add(shipGroup);
      enemyShipsRef.current.push(shipGroup);
    });
  }, [question, selectedShipSector]);

  // Particle explosion on laser impact
  const spawnSupernovaExplosion = (pos: THREE.Vector3, color: number) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const count = 48;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = pos.x + (Math.random() - 0.5) * 1.8;
      positions[i + 1] = pos.y + (Math.random() - 0.5) * 1.8;
      positions[i + 2] = pos.z + (Math.random() - 0.5) * 1.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color, size: 0.32, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    explosionParticlesRef.current.push({ mesh: points, life: 1.0 });
  };

  // Fire laser beam toward chosen alien ship sector
  const triggerFireLaser = (sectorIdx: number) => {
    if (isBlasting || isPaused || feedback || !question) return;
    const targetShip = enemyShipsRef.current[sectorIdx];
    const targetOpt = question.options[sectorIdx];
    if (!targetShip || !targetOpt) return;

    setIsBlasting(true);
    setSelectedShipSector(sectorIdx);

    const scene = sceneRef.current;
    if (!scene) return;

    // Create twin laser beams
    const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 2;
    laser.position.set(SECTOR_X[sectorIdx], -1.0, 4.0);
    scene.add(laser);

    lasersRef.current.push({
      mesh: laser,
      targetPos: targetShip.position.clone(),
      progress: 0,
      onHit: () => {
        setIsBlasting(false);
        const isCorrect = targetOpt.id === question.correct_option_id;
        spawnSupernovaExplosion(targetShip.position, isCorrect ? 0x22c55e : 0xef4444);
        onAnswerChosen(targetOpt.id);
      }
    });
  };

  // Keyboard Navigation (ArrowLeft / ArrowRight / Space / 1, 2, 3, 4)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused || feedback) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setSelectedShipSector((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSelectedShipSector((prev) => Math.min(3, prev + 1));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerFireLaser(selectedShipSector);
      } else if (['1'].includes(e.key)) triggerFireLaser(0);
      else if (['2'].includes(e.key)) triggerFireLaser(1);
      else if (['3'].includes(e.key)) triggerFireLaser(2);
      else if (['4'].includes(e.key)) triggerFireLaser(3);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedShipSector, isPaused, feedback, question, isBlasting]);

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
            background: 'rgba(3, 7, 18, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(56, 189, 248, 0.45)',
            borderRadius: 18,
            padding: '14px 20px',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🚀 Space Answer Shooter • {levelInfo.title}
            </span>
            <div style={{ display: 'flex', gap: 10, fontSize: '0.78rem', fontWeight: 800 }}>
              <span style={{ color: '#FACC15' }}>★ Score: {score}</span>
              <span style={{ color: '#38BDF8' }}>🛡️ Shields: {lives}</span>
              {combo > 1 && <span style={{ color: '#FF6A00' }}>⚡ {combo}x Combo</span>}
            </div>
          </div>
          <h2 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#F8FAFC', lineHeight: 1.45 }}>
            {question.question}
          </h2>
        </div>
      )}

      {/* Bottom Target Buttons */}
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
              disabled={isBlasting || !!feedback}
              onClick={() => triggerFireLaser(idx)}
              style={{
                padding: '10px 8px',
                borderRadius: 14,
                border: idx === selectedShipSector ? '2px solid #38BDF8' : '1.5px solid rgba(255,255,255,0.2)',
                background: idx === selectedShipSector ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: idx === selectedShipSector ? '0 0 16px rgba(56, 189, 248, 0.5)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Blaster [{opt.id}]</div>
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
