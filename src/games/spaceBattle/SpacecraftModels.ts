import * as THREE from 'three';

/**
 * 3D Spacecraft Model Factory for STUDYAI Space Battle.
 * Assembles high-fidelity procedural 3D spacecraft using Three.js geometries,
 * PBR materials, glowing cockpits, and ion engine exhaust trails.
 */

export interface PlayerCraftMeshResult {
  group: THREE.Group;
  hull: THREE.Mesh;
  shield: THREE.Mesh;
  thrusterLight: THREE.PointLight;
  thrusterFlames: THREE.Mesh[];
  muzzlePoints: THREE.Vector3[];
}

export interface EnemyCraftMeshResult {
  group: THREE.Group;
  hitRadius: number;
  coreLight: THREE.PointLight;
  labelSprite: THREE.Sprite;
  hullMeshes: THREE.Mesh[];
}

export class SpacecraftModels {
  /**
   * Builds the Player Starfighter Interceptor.
   * Recognizable sleek futuristic jet with swept wings, canopy cockpit,
   * dual wingtip blasters, twin glowing engines, and energy shield.
   */
  public static createPlayerStarfighter(): PlayerCraftMeshResult {
    const group = new THREE.Group();

    // Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp off-white armor
      metalness: 0.85,
      roughness: 0.25
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Deep electric blue trim
      metalness: 0.9,
      roughness: 0.2
    });

    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    });

    const gunMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.1
    });

    // 1. Central Aerodynamic Fuselage
    const fuselageGeo = new THREE.CylinderGeometry(0.2, 0.65, 2.8, 8);
    fuselageGeo.scale(1.2, 1, 0.6); // flattened aerodynamic shape
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.rotation.z = Math.PI; // point forward along +Y
    group.add(fuselage);

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
    noseGeo.scale(1.1, 1, 0.5);
    const nose = new THREE.Mesh(noseGeo, trimMat);
    nose.position.set(0, 1.6, 0);
    group.add(nose);

    // 2. Cockpit Bubble Canopy
    const canopyGeo = new THREE.SphereGeometry(0.36, 16, 16);
    canopyGeo.scale(0.85, 1.6, 0.65);
    const canopy = new THREE.Mesh(canopyGeo, cockpitMat);
    canopy.position.set(0, 0.35, 0.32);
    group.add(canopy);

    // 3. Swept Delta Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(2.2, -1.2);
    wingShape.lineTo(2.1, -1.8);
    wingShape.lineTo(0.5, -1.4);
    wingShape.lineTo(0, -1.2);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

    const rightWing = new THREE.Mesh(wingGeo, trimMat);
    rightWing.position.set(0.2, 0.2, -0.05);
    group.add(rightWing);

    const leftWing = new THREE.Mesh(wingGeo, trimMat);
    leftWing.position.set(-0.2, 0.2, 0.05);
    leftWing.scale.set(-1, 1, 1);
    group.add(leftWing);

    // 4. Vertical Stabilizers / Winglets
    const finGeo = new THREE.BoxGeometry(0.08, 0.8, 0.6);
    const rightFin = new THREE.Mesh(finGeo, hullMat);
    rightFin.position.set(1.9, -1.1, 0.35);
    rightFin.rotation.x = -Math.PI * 0.15;
    group.add(rightFin);

    const leftFin = new THREE.Mesh(finGeo, hullMat);
    leftFin.position.set(-1.9, -1.1, 0.35);
    leftFin.rotation.x = -Math.PI * 0.15;
    group.add(leftFin);

    // 5. Heavy Wingtip Blaster Cannons (Muzzles)
    const barrelGeo = new THREE.CylinderGeometry(0.07, 0.09, 1.4, 8);
    const rightGun = new THREE.Mesh(barrelGeo, gunMat);
    rightGun.position.set(1.8, -0.3, 0);
    group.add(rightGun);

    const leftGun = new THREE.Mesh(barrelGeo, gunMat);
    leftGun.position.set(-1.8, -0.3, 0);
    group.add(leftGun);

    // Muzzle positions for laser origin
    const muzzlePoints = [
      new THREE.Vector3(1.8, 0.5, 0),
      new THREE.Vector3(-1.8, 0.5, 0)
    ];

    // 6. Twin Ion Thruster Engines & Exhaust Flames
    const thrusterFlames: THREE.Mesh[] = [];
    const nozzleGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.5, 12);
    const flameGeo = new THREE.ConeGeometry(0.2, 0.9, 8);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9
    });

    [-0.45, 0.45].forEach((offsetX) => {
      const nozzle = new THREE.Mesh(nozzleGeo, gunMat);
      nozzle.position.set(offsetX, -1.4, 0);
      group.add(nozzle);

      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.rotation.z = Math.PI; // point downward
      flame.position.set(offsetX, -2.0, 0);
      group.add(flame);
      thrusterFlames.push(flame);
    });

    // Dynamic Thruster Point Light
    const thrusterLight = new THREE.PointLight(0x38bdf8, 2.5, 8);
    thrusterLight.position.set(0, -2.1, 0.5);
    group.add(thrusterLight);

    // 7. Energy Shield Bubble
    const shieldGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.0
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    group.add(shield);

    return {
      group,
      hull: fuselage,
      shield,
      thrusterLight,
      thrusterFlames,
      muzzlePoints
    };
  }

  /**
   * Builds an Alien Starfighter model based on type (Interceptor, Cruiser, Raider).
   * Replaces flat triangles with multi-segmented 3D metallic combat spacecraft!
   */
  public static createAlienStarfighter(
    variant: 'cruiser' | 'interceptor' | 'raider',
    colorHex: number,
    answerText: string
  ): EnemyCraftMeshResult {
    const group = new THREE.Group();
    const hullMeshes: THREE.Mesh[] = [];

    const hullMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.9,
      roughness: 0.25,
      emissive: colorHex,
      emissiveIntensity: 0.4
    });

    const darkArmorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.15
    });

    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    if (variant === 'cruiser') {
      // Dual-hull Heavy Catamaran Cruiser
      const hullSpireGeo = new THREE.CylinderGeometry(0.15, 0.45, 2.4, 8);
      const leftSpire = new THREE.Mesh(hullSpireGeo, hullMat);
      leftSpire.position.set(-0.75, 0, 0);
      const rightSpire = new THREE.Mesh(hullSpireGeo, hullMat);
      rightSpire.position.set(0.75, 0, 0);
      group.add(leftSpire, rightSpire);
      hullMeshes.push(leftSpire, rightSpire);

      // Center Bridge
      const bridgeGeo = new THREE.BoxGeometry(1.6, 0.5, 0.7);
      const bridge = new THREE.Mesh(bridgeGeo, darkArmorMat);
      bridge.position.set(0, 0.2, 0);
      group.add(bridge);
      hullMeshes.push(bridge);

      // Swept Alien Mandibles
      const wingGeo = new THREE.BoxGeometry(1.2, 0.15, 0.8);
      const leftWing = new THREE.Mesh(wingGeo, hullMat);
      leftWing.position.set(-1.4, -0.2, 0);
      leftWing.rotation.z = Math.PI * 0.15;
      const rightWing = new THREE.Mesh(wingGeo, hullMat);
      rightWing.position.set(1.4, -0.2, 0);
      rightWing.rotation.z = -Math.PI * 0.15;
      group.add(leftWing, rightWing);
      hullMeshes.push(leftWing, rightWing);
    } else if (variant === 'interceptor') {
      // Sleek Crescent Stealth Interceptor
      const mainGeo = new THREE.TorusGeometry(1.2, 0.25, 8, 24, Math.PI);
      const mainHull = new THREE.Mesh(mainGeo, hullMat);
      mainHull.rotation.z = Math.PI; // point crescent forward
      group.add(mainHull);
      hullMeshes.push(mainHull);

      const cockpitGeo = new THREE.SphereGeometry(0.45, 12, 12);
      cockpitGeo.scale(0.8, 1.4, 0.6);
      const cockpit = new THREE.Mesh(cockpitGeo, darkArmorMat);
      cockpit.position.set(0, 0.2, 0.1);
      group.add(cockpit);
      hullMeshes.push(cockpit);

      const finGeo = new THREE.BoxGeometry(0.08, 0.9, 0.6);
      const fin = new THREE.Mesh(finGeo, hullMat);
      fin.position.set(0, -0.2, 0.35);
      group.add(fin);
      hullMeshes.push(fin);
    } else {
      // Heavy Dread Raider
      const coreGeo = new THREE.DodecahedronGeometry(0.7, 1);
      const coreHull = new THREE.Mesh(coreGeo, darkArmorMat);
      group.add(coreHull);
      hullMeshes.push(coreHull);

      // 3 Radial Wing Blades
      for (let i = 0; i < 3; i++) {
        const bladeGeo = new THREE.BoxGeometry(0.2, 1.6, 0.5);
        const blade = new THREE.Mesh(bladeGeo, hullMat);
        const angle = (i * Math.PI * 2) / 3;
        blade.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0);
        blade.rotation.z = angle;
        group.add(blade);
        hullMeshes.push(blade);
      }
    }

    // Glowing Central Energy Reactor
    const coreSphereGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const coreGlow = new THREE.Mesh(coreSphereGeo, coreGlowMat);
    group.add(coreGlow);

    const coreLight = new THREE.PointLight(colorHex, 1.8, 4);
    group.add(coreLight);

    // Glowing Billboard Answer Badge
    const labelSprite = this.createAnswerBadgeSprite(answerText);
    labelSprite.position.set(0, -1.45, 0);
    group.add(labelSprite);

    return {
      group,
      hitRadius: 1.4,
      coreLight,
      labelSprite,
      hullMeshes
    };
  }

  /**
   * Generates a high-definition 3D billboard label displaying the answer text.
   * Uses high-DPI canvas texture with neon blue glow and transparent dark glass fill.
   */
  public static createAnswerBadgeSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Rounded pill container
      ctx.fillStyle = 'rgba(7, 18, 44, 0.94)';
      ctx.beginPath();
      ctx.roundRect(10, 10, 364, 90, 24);
      ctx.fill();

      // Glowing Neon Cyan Border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Bold Typography
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const displayText = text.length > 15 ? text.slice(0, 14) + '…' : text;
      ctx.fillText(displayText, 192, 55);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.0, 0.85, 1);
    return sprite;
  }
}
