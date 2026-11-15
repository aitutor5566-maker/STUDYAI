import * as THREE from 'three';
import { AircraftSkin } from './types';

export interface FighterJetRig {
  root: THREE.Group;
  leftAileron: THREE.Mesh;
  rightAileron: THREE.Mesh;
  leftExhaust: THREE.Mesh;
  rightExhaust: THREE.Mesh;
  exhaustLight: THREE.PointLight;
}

export function buildFighterJet(skin: AircraftSkin): FighterJetRig {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: skin.fuselageHex,
    metalness: 0.72,
    roughness: 0.28
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: skin.wingAccentHex,
    metalness: 0.55,
    roughness: 0.3,
    emissive: new THREE.Color(skin.wingAccentHex),
    emissiveIntensity: 0.16
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.65,
    roughness: 0.4
  });

  const canopyMat = new THREE.MeshStandardMaterial({
    color: skin.canopyHex,
    metalness: 0.25,
    roughness: 0.08,
    transparent: true,
    opacity: 0.78,
    emissive: new THREE.Color(skin.canopyHex),
    emissiveIntensity: 0.18
  });

  const exhaustMat = new THREE.MeshBasicMaterial({
    color: skin.engineGlowHex,
    transparent: true,
    opacity: 0.92
  });

  // Main Fuselage (nose faces -Z)
  const fuselageGeo = new THREE.BoxGeometry(0.95, 0.58, 4.5);
  const fuselage = new THREE.Mesh(fuselageGeo, bodyMat);
  fuselage.castShadow = true;
  root.add(fuselage);

  // Nose Cone
  const noseGeo = new THREE.ConeGeometry(0.46, 2.0, 8);
  noseGeo.rotateX(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.position.set(0, -0.02, -3.2);
  nose.castShadow = true;
  root.add(nose);

  // Dorsal Spine
  const spineGeo = new THREE.BoxGeometry(0.45, 0.32, 2.8);
  const spine = new THREE.Mesh(spineGeo, accentMat);
  spine.position.set(0, 0.34, 0.35);
  root.add(spine);

  // Cockpit Canopy
  const canopyGeo = new THREE.SphereGeometry(0.42, 16, 12);
  canopyGeo.scale(0.85, 0.7, 2.1);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.42, -1.25);
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

  return {
    root,
    leftAileron,
    rightAileron,
    leftExhaust,
    rightExhaust,
    exhaustLight
  };
}
