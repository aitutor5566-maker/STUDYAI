import * as THREE from 'three';
import { getPbrTextureSet } from '../engine/PbrTextureFactory';
import { AircraftSkin } from './types';

export interface FighterJetRig {
  root: THREE.Group;
  leftAileron: THREE.Mesh;
  rightAileron: THREE.Mesh;
  leftExhaust: THREE.Mesh;
  rightExhaust: THREE.Mesh;
  exhaustLight: THREE.PointLight;
  landingGearGroup: THREE.Group;
  portStrobe: THREE.Mesh;
  starboardStrobe: THREE.Mesh;
}

export function buildFighterJet(skin: AircraftSkin): FighterJetRig {
  const root = new THREE.Group();
  const metalPbr = typeof document !== 'undefined' ? getPbrTextureSet('metal', 2, 2) : null;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: skin.fuselageHex,
    metalness: 0.82,
    roughness: 0.22,
    normalMap: metalPbr?.normalMap ?? null,
    roughnessMap: metalPbr?.roughnessMap ?? null,
    aoMap: metalPbr?.aoMap ?? null,
    metalnessMap: metalPbr?.metalnessMap ?? null,
    normalScale: new THREE.Vector2(0.55, 0.55)
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: skin.wingAccentHex,
    metalness: 0.62,
    roughness: 0.28,
    emissive: new THREE.Color(skin.wingAccentHex),
    emissiveIntensity: 0.22
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.7,
    roughness: 0.35
  });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: skin.canopyHex,
    metalness: 0.15,
    roughness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    ior: 1.48,
    transparent: true,
    opacity: 0.82,
    emissive: new THREE.Color(skin.canopyHex),
    emissiveIntensity: 0.2
  });

  const exhaustMat = new THREE.MeshBasicMaterial({
    color: skin.engineGlowHex,
    transparent: true,
    opacity: 0.92
  });

  // Sculpted Supersonic Lathe Fuselage (nose faces -Z)
  const fuselageProfile = [
    new THREE.Vector2(0.01, -4.45),
    new THREE.Vector2(0.18, -3.7),
    new THREE.Vector2(0.36, -2.55),
    new THREE.Vector2(0.54, -1.1),
    new THREE.Vector2(0.58, 0.4),
    new THREE.Vector2(0.50, 1.85),
    new THREE.Vector2(0.38, 2.35),
    new THREE.Vector2(0.01, 2.4)
  ];
  const fuselageGeo = new THREE.LatheGeometry(fuselageProfile, 18);
  fuselageGeo.rotateX(Math.PI / 2);
  fuselageGeo.scale(1.12, 0.68, 1.0);
  const fuselage = new THREE.Mesh(fuselageGeo, bodyMat);
  fuselage.castShadow = true;
  root.add(fuselage);

  // Twin Side Air-Intake Cowlings
  const intakeGeo = new THREE.BoxGeometry(0.34, 0.34, 1.75);
  const leftIntake = new THREE.Mesh(intakeGeo, darkTrimMat);
  leftIntake.position.set(-0.56, -0.06, -0.55);
  leftIntake.castShadow = true;
  root.add(leftIntake);
  const rightIntake = new THREE.Mesh(intakeGeo, darkTrimMat);
  rightIntake.position.set(0.56, -0.06, -0.55);
  rightIntake.castShadow = true;
  root.add(rightIntake);

  // Dorsal Spine & Panel Striping
  const spineGeo = new THREE.BoxGeometry(0.36, 0.26, 2.8);
  const spine = new THREE.Mesh(spineGeo, accentMat);
  spine.position.set(0, 0.34, 0.45);
  root.add(spine);

  // Cockpit Frame + Tinted Glass Canopy
  const canopyFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.035, 8, 18),
    darkTrimMat
  );
  canopyFrame.rotation.x = Math.PI / 2;
  canopyFrame.scale.set(0.95, 2.15, 1);
  canopyFrame.position.set(0, 0.36, -1.3);
  root.add(canopyFrame);

  const canopyGeo = new THREE.SphereGeometry(0.42, 18, 14);
  canopyGeo.scale(0.85, 0.68, 2.2);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.42, -1.32);
  root.add(canopy);

  // Swept Main Wings (extruded shape)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.42, -0.9);
  wingShape.lineTo(3.55, 1.35);
  wingShape.lineTo(3.55, 1.95);
  wingShape.lineTo(0.48, 1.45);
  wingShape.closePath();

  const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
  const rightWingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
  rightWingGeo.rotateX(Math.PI / 2);

  const rightWing = new THREE.Mesh(rightWingGeo, bodyMat);
  rightWing.position.set(0, 0.02, 0.0);
  rightWing.castShadow = true;
  root.add(rightWing);

  const leftWing = rightWing.clone();
  leftWing.scale.x = -1;
  leftWing.castShadow = true;
  root.add(leftWing);

  // Wingtip Energy Rails
  const railGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
  railGeo.rotateX(Math.PI / 2);
  const leftRail = new THREE.Mesh(railGeo, accentMat);
  leftRail.position.set(-3.55, 0.02, 1.55);
  root.add(leftRail);
  const rightRail = new THREE.Mesh(railGeo, accentMat);
  rightRail.position.set(3.55, 0.02, 1.55);
  root.add(rightRail);

  // Animated Ailerons
  const aileronGeo = new THREE.BoxGeometry(1.15, 0.06, 0.32);
  const leftAileron = new THREE.Mesh(aileronGeo, accentMat);
  leftAileron.position.set(-2.15, -0.02, 1.68);
  root.add(leftAileron);

  const rightAileron = new THREE.Mesh(aileronGeo, accentMat);
  rightAileron.position.set(2.15, -0.02, 1.68);
  root.add(rightAileron);

  // Twin Angled Vertical Tail Stabilizers
  const vTailGeo = new THREE.BoxGeometry(0.09, 1.05, 1.15);
  const leftVTail = new THREE.Mesh(vTailGeo, accentMat);
  leftVTail.position.set(-0.62, 0.65, 1.75);
  leftVTail.rotation.z = 0.28;
  leftVTail.rotation.x = 0.22;
  leftVTail.castShadow = true;
  root.add(leftVTail);

  const rightVTail = new THREE.Mesh(vTailGeo, accentMat);
  rightVTail.position.set(0.62, 0.65, 1.75);
  rightVTail.rotation.z = -0.28;
  rightVTail.rotation.x = 0.22;
  rightVTail.castShadow = true;
  root.add(rightVTail);

  // Horizontal Tailplanes
  const hTailGeo = new THREE.BoxGeometry(1.25, 0.07, 0.72);
  const leftHTail = new THREE.Mesh(hTailGeo, bodyMat);
  leftHTail.position.set(-0.98, 0.05, 2.0);
  leftHTail.rotation.y = -0.22;
  root.add(leftHTail);

  const rightHTail = new THREE.Mesh(hTailGeo, bodyMat);
  rightHTail.position.set(0.98, 0.05, 2.0);
  rightHTail.rotation.y = 0.22;
  root.add(rightHTail);

  // Twin Engine Nacelles & Nozzles
  const nacelleGeo = new THREE.CylinderGeometry(0.28, 0.24, 1.8, 12);
  nacelleGeo.rotateX(Math.PI / 2);

  const leftNacelle = new THREE.Mesh(nacelleGeo, darkTrimMat);
  leftNacelle.position.set(-0.34, -0.04, 1.65);
  root.add(leftNacelle);

  const rightNacelle = new THREE.Mesh(nacelleGeo, darkTrimMat);
  rightNacelle.position.set(0.34, -0.04, 1.65);
  root.add(rightNacelle);

  // Glowing Twin Afterburner Exhaust Cones
  const exhaustGeo = new THREE.ConeGeometry(0.2, 1.25, 12);
  exhaustGeo.rotateX(Math.PI / 2);

  const leftExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
  leftExhaust.position.set(-0.34, -0.04, 2.95);
  root.add(leftExhaust);

  const rightExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
  rightExhaust.position.set(0.34, -0.04, 2.95);
  root.add(rightExhaust);

  const exhaustLight = new THREE.PointLight(skin.engineGlowHex, 2.2, 16);
  exhaustLight.position.set(0, 0, 3.2);
  root.add(exhaustLight);

  // Wingtip Navigation Beacons (Port = Red, Starboard = Green)
  const portStrobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  portStrobe.position.set(-3.55, 0.06, 1.55);
  root.add(portStrobe);

  const starboardStrobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x22c55e })
  );
  starboardStrobe.position.set(3.55, 0.06, 1.55);
  root.add(starboardStrobe);

  // Retractable Tricycle Landing Gear
  const landingGearGroup = new THREE.Group();
  const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.68, 8);
  const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 12);
  wheelGeo.rotateZ(Math.PI / 2);

  for (const [gx, gz] of [
    [0, -2.0],
    [-0.95, 0.65],
    [0.95, 0.65]
  ] as const) {
    const strut = new THREE.Mesh(strutGeo, darkTrimMat);
    strut.position.set(gx, -0.52, gz);
    const wheel = new THREE.Mesh(wheelGeo, darkTrimMat);
    wheel.position.set(gx, -0.84, gz);
    landingGearGroup.add(strut, wheel);
  }
  root.add(landingGearGroup);

  return {
    root,
    leftAileron,
    rightAileron,
    leftExhaust,
    rightExhaust,
    exhaustLight,
    landingGearGroup,
    portStrobe,
    starboardStrobe
  };
}

export function buildEnemyInterceptorJet(variantIdx = 0): FighterJetRig {
  const palettes: AircraftSkin[] = [
    {
      id: 'cyan_viper',
      name: 'Crimson Interceptor',
      fuselageHex: 0x1e293b,
      wingAccentHex: 0xef4444,
      canopyHex: 0xf97316,
      engineGlowHex: 0xfb7185,
      previewGradient: 'linear-gradient(135deg, #1e293b, #ef4444)'
    },
    {
      id: 'solar_phoenix',
      name: 'Obsidian Striker',
      fuselageHex: 0x312e81,
      wingAccentHex: 0xa855f7,
      canopyHex: 0x38bdf8,
      engineGlowHex: 0xc084fc,
      previewGradient: 'linear-gradient(135deg, #312e81, #a855f7)'
    },
    {
      id: 'emerald_falcon',
      name: 'Solar Raptor',
      fuselageHex: 0x1e293b,
      wingAccentHex: 0xf59e0b,
      canopyHex: 0x38bdf8,
      engineGlowHex: 0xfbbf24,
      previewGradient: 'linear-gradient(135deg, #1e293b, #f59e0b)'
    }
  ];
  const rig = buildFighterJet(palettes[variantIdx % palettes.length]);
  rig.landingGearGroup.visible = false;
  return rig;
}
