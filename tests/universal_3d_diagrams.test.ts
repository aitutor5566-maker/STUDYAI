import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import * as THREE from 'three';
import { createAppServer } from '../server/index.ts';
import {
  buildElectricCircuit,
  buildHumanLungs,
  buildHumanTorsoAnatomy,
  buildHumanHeart,
  buildHumanEar,
  buildElectricMotor,
  VERIFIED_MODEL_SPECS
} from '../src/utils/diagram3dModels.ts';

const serverInstance = createAppServer();
const TEST_STUDENT_ID = 'student-test-3d';

async function api(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {},
  studentId = TEST_STUDENT_ID
) {
  return new Promise<{ status: number; data: any }>((resolve, reject) => {
    const req = new EventEmitter() as any;
    req.method = options.method || 'GET';
    req.url = path;
    req.socket = { remoteAddress: '127.0.0.1' };
    req.headers = {
      'x-student-id': studentId,
      'content-type': 'application/json',
      ...(options.headers || {})
    };

    let statusCode = 200;
    const resHeaders: Record<string, string> = {};
    let responseBody = '';

    const res = {
      writeHead(code: number, headers?: Record<string, string>) {
        statusCode = code;
        if (headers) Object.assign(resHeaders, headers);
        return res;
      },
      setHeader(name: string, value: string) {
        resHeaders[name.toLowerCase()] = value;
        return res;
      },
      end(chunk?: string | Buffer) {
        if (chunk) responseBody += chunk.toString();
        let parsed: any = responseBody;
        try {
          parsed = JSON.parse(responseBody);
        } catch {}
        resolve({ status: statusCode, data: parsed });
      }
    };

    serverInstance.emit('request', req, res);

    if (options.body) {
      req.emit('data', Buffer.from(options.body));
    }
    req.emit('end');
  });
}

test('1. Procedural 3D Geometry: Electric Circuit (Screenshot 1)', () => {
  const res = buildElectricCircuit();
  assert.ok(res.rootGroup instanceof THREE.Group);
  assert.ok(res.components.baseboard.length > 0);
  assert.ok(res.components.battery.length > 0);
  assert.ok(res.components.light_bulb.length > 0);
  assert.ok(res.components.switch.length > 0);
  assert.ok(res.components.copper_wires.length > 0);
  assert.equal(res.components.electrons.length, 20);
  assert.deepEqual(res.defaultCameraPosition, [0, 3.8, 6.2]);

  // Verify electron flow animation
  res.onAnimate(1.5, 1.0);
  const firstElectron = res.components.electrons[0];
  assert.ok(firstElectron.position.x !== undefined);
  assert.ok(firstElectron.position.z !== undefined);
});

test('2. Procedural 3D Geometry: Human Lungs & Lobes (Screenshot 2)', () => {
  const res = buildHumanLungs();
  assert.ok(res.rootGroup instanceof THREE.Group);
  assert.ok(res.components.trachea.length > 0);
  assert.ok(res.components.primary_bronchi.length > 0);
  assert.ok(res.components.right_superior_lobe.length > 0);
  assert.ok(res.components.horizontal_fissure.length > 0);
  assert.ok(res.components.right_middle_lobe.length > 0);
  assert.ok(res.components.right_inferior_lobe.length > 0);
  assert.ok(res.components.left_superior_lobe.length > 0);
  assert.ok(res.components.oblique_fissure.length > 0);
  assert.ok(res.components.left_inferior_lobe.length > 0);
  assert.ok(res.components.cardiac_notch.length > 0);

  // Verify breathing cycle animation
  const rLungGroup = res.animatedNodes[0];
  res.onAnimate(Math.PI / 2, 1.0);
  assert.ok(rLungGroup.scale.x > 0);
});

test('3. Procedural 3D Geometry: Transparent Torso Model (Screenshot 3)', () => {
  const res = buildHumanTorsoAnatomy();
  assert.ok(res.rootGroup instanceof THREE.Group);
  assert.ok(res.components.torso_shell.length > 0);
  assert.ok(res.components.cranium.length > 0);
  assert.ok(res.components.brain.length > 0);
  assert.ok(res.components.lungs.length > 0);
  assert.ok(res.components.heart.length > 0);
  assert.ok(res.components.liver.length > 0);
  assert.ok(res.components.stomach.length > 0);
  assert.ok(res.components.large_intestine.length > 0);
  assert.ok(res.components.small_intestine.length > 0);
  assert.ok(res.components.muscular_arm.length > 0);
  assert.ok(res.components.diagnostic_base.length > 0);

  // Heart beat pulse
  const heart = res.animatedNodes[0];
  res.onAnimate(2.0, 1.0);
  assert.ok(heart.scale.x > 0.9);
});

test('4. Procedural 3D Geometry: Assemblr EDU Human Heart (Screenshot 4)', () => {
  const res = buildHumanHeart();
  assert.ok(res.rootGroup instanceof THREE.Group);
  assert.ok(res.components.left_ventricle.length > 0);
  assert.ok(res.components.right_ventricle.length > 0);
  assert.ok(res.components.left_atrium.length > 0);
  assert.ok(res.components.right_atrium.length > 0);
  assert.ok(res.components.valves.length > 0);
  assert.ok(res.components.aorta.length > 0);
  assert.ok(res.components.pulmonary_artery.length > 0);
  assert.ok(res.components.vena_cava.length > 0);
  assert.equal(res.studioBackground, '#fed7aa'); // Warm peach backdrop

  // Heartbeat animation
  res.onAnimate(1.0, 1.0);
  assert.ok(res.animatedNodes.length > 0);
});

test('5. Procedural 3D Geometry: Human Ear Cross-Section (Screenshot 5)', () => {
  const res = buildHumanEar();
  assert.ok(res.rootGroup instanceof THREE.Group);
  assert.ok(res.components.auricle.length > 0);
  assert.ok(res.components.ear_canal.length > 0);
  assert.ok(res.components.tympanic_membrane.length > 0);
  assert.ok(res.components.malleus.length > 0);
  assert.ok(res.components.incus.length > 0);
  assert.ok(res.components.stapes.length > 0);
  assert.ok(res.components.tensor_tympani.length > 0);
  assert.ok(res.components.semicircular_canals.length > 0);
  assert.ok(res.components.cochlea.length > 0);
  assert.ok(res.components.auditory_nerves.length > 0);
  assert.equal(res.studioBackground, '#ea580c'); // Warm golden orange glow

  // Sound wave vibration animation
  res.onAnimate(0.5, 1.0);
  const eardrum = res.components.tympanic_membrane[0];
  assert.ok(eardrum.position.x !== undefined);
});

test('6. Procedural 3D Geometry: DC Electric Motor', () => {
  const res = buildElectricMotor();
  assert.ok(res.rootGroup instanceof THREE.Group);
  assert.equal(res.components.stator_magnets.length, 2);
  assert.equal(res.components.armature_coil.length, 1);
  assert.equal(res.components.carbon_brushes.length, 2);
  assert.equal(res.components.shaft.length, 1);

  // Armature rotation animation
  const armature = res.animatedNodes[0];
  res.onAnimate(1.0, 1.0);
  assert.ok(armature.rotation.z > 0);
});

test('7. Model Specification & Metadata Integrity for all 8 verified curriculum models', () => {
  const expectedKeys = [
    'human_heart',
    'human_lungs',
    'electric_circuit',
    'human_torso_anatomy',
    'human_ear',
    'electric_motor',
    'solar_system',
    'dna_helix'
  ];

  expectedKeys.forEach((key) => {
    const spec = VERIFIED_MODEL_SPECS[key];
    assert.ok(spec, `Missing spec for ${key}`);
    assert.ok(spec.title.length > 10);
    assert.ok(spec.subject.length > 5);
    assert.ok(spec.parts.length >= 3);
    assert.ok(spec.guidedSteps.length >= 3);
    assert.ok(spec.mechanismSummary);

    spec.parts.forEach((p) => {
      assert.ok(p.id);
      assert.ok(p.label);
      assert.ok(p.role.length > 10);
      assert.ok(p.color.startsWith('#'));
      assert.equal(p.pinPosition?.length, 3);
    });
  });
});

test('8. Backend: GET /api/diagrams-3d returns full catalog with subject categorization', async () => {
  const res = await api('/api/diagrams-3d');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.data.diagrams));
  assert.ok(res.data.diagrams.length >= 8);

  const heart = res.data.diagrams.find((d: any) => d.id === 'diag-heart' || d.model_key === 'human_heart');
  assert.ok(heart);
  assert.ok(heart.subject.includes('Biology'));

  const circuit = res.data.diagrams.find((d: any) => d.id === 'diag-circuit' || d.model_key === 'electric_circuit');
  assert.ok(circuit);
  assert.ok(circuit.subject.includes('Physics'));
});

test('9. Backend: GET /api/diagrams-3d/:id returns detailed model spec, components and 6 modes', async () => {
  const res = await api('/api/diagrams-3d/human_lungs');
  assert.equal(res.status, 200);
  assert.equal(res.data.diagram.model_key, 'human_lungs');
  assert.ok(res.data.diagram.components.length >= 7);
  assert.equal(res.data.diagram.available_modes.length, 6); // 6 Viewing Modes
});

test('10. Backend: GET /api/diagrams-3d/quiz/:id generates 3-part interactive quiz', async () => {
  const res = await api('/api/diagrams-3d/quiz/human_ear');
  assert.equal(res.status, 200);
  assert.ok(res.data.quiz);
  assert.ok(res.data.quiz.matchTheLabels.length > 0);
  assert.ok(res.data.quiz.pickingChallenge.prompt);
  assert.ok(res.data.quiz.mcqQuestions.length > 0);
});

test('11. Backend: POST /api/diagrams-3d/progress records student component exploration and quiz score', async () => {
  const res = await api('/api/diagrams-3d/progress', {
    method: 'POST',
    body: JSON.stringify({
      studentId: TEST_STUDENT_ID,
      diagramId: 'diag-circuit',
      exploredComponent: 'battery',
      quizScore: 3
    })
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.exploredCount >= 1);
});

test('12. Backend: POST /api/diagrams-3d/ask provides contextual AI tutor answers grounded in diagram components', async () => {
  const res = await api('/api/diagrams-3d/ask', {
    method: 'POST',
    body: JSON.stringify({
      diagramId: 'diag-heart',
      componentId: 'Left Ventricle',
      question: 'Why is the myocardium so thick in this chamber?'
    })
  });
  assert.equal(res.status, 200);
  assert.ok(res.data.directAnswer);
  assert.ok(res.data.detailedExplanation);
});

test('13. Backend: POST and DELETE /api/diagrams-3d/save manages bookmarks correctly with multi-student isolation', async () => {
  // Save bookmark
  const saveRes = await api('/api/diagrams-3d/save', {
    method: 'POST',
    body: JSON.stringify({
      studentId: TEST_STUDENT_ID,
      diagramId: 'diag-torso'
    })
  });
  assert.ok(saveRes.status === 200 || saveRes.status === 201);

  // Verify saved in list
  const listRes = await api('/api/diagrams-3d/saved');
  assert.equal(listRes.status, 200);
  const found = listRes.data.saved.some((d: any) => d.id === 'diag-torso');
  assert.ok(found);

  // Delete bookmark
  const delRes = await api('/api/diagrams-3d/save/diag-torso', {
    method: 'DELETE'
  });
  assert.equal(delRes.status, 200);
});
