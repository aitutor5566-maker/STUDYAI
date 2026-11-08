import test from 'node:test';
import assert from 'node:assert/strict';
import {
  educationalImageResearchEngine,
  decomposeTopicIntoSectionVisuals,
  VERIFIED_SCIENTIFIC_ASSETS
} from '../server/educationalImageResearchEngine.ts';
import { db } from '../server/db.ts';

test('1. Decompose Topic: Multi-Concept Section Visual Planning', () => {
  const heartVisuals = decomposeTopicIntoSectionVisuals('Structure of the Human Heart');
  assert.ok(heartVisuals.length >= 4, 'Heart should have at least 4 concept visual plans');
  
  const chamberPlan = heartVisuals.find((v) => v.conceptName.toLowerCase().includes('chamber'));
  assert.ok(chamberPlan, 'Should plan visual for internal 4 chambers');
  assert.equal(chamberPlan.domain, 'biology');

  const photosynthesisVisuals = decomposeTopicIntoSectionVisuals('Photosynthesis');
  assert.ok(photosynthesisVisuals.length >= 3, 'Photosynthesis should have at least 3 concept visual plans');
  const chloroplastPlan = photosynthesisVisuals.find((v) => v.conceptName.toLowerCase().includes('chloroplast') || v.conceptName.toLowerCase().includes('light'));
  assert.ok(chloroplastPlan, 'Should plan visual for chloroplast or light reactions');

  const dnaVisuals = decomposeTopicIntoSectionVisuals('DNA Structure');
  assert.ok(dnaVisuals.length >= 3, 'DNA Structure should have at least 3 concept visual plans');

  const motionVisuals = decomposeTopicIntoSectionVisuals('Laws of Motion');
  assert.ok(motionVisuals.length >= 3, 'Laws of Motion should have at least 3 concept visual plans');

  const bondingVisuals = decomposeTopicIntoSectionVisuals('Chemical Bonding');
  assert.ok(bondingVisuals.length >= 3, 'Chemical Bonding should have at least 3 concept visual plans');

  const wwiiVisuals = decomposeTopicIntoSectionVisuals('World War II');
  assert.ok(wwiiVisuals.length >= 3, 'World War II should have at least 3 concept visual plans');

  const solarVisuals = decomposeTopicIntoSectionVisuals('Solar System');
  assert.ok(solarVisuals.length >= 3, 'Solar System should have at least 3 concept visual plans');
});

test('2. Verified Educational Asset Registry: Core Curriculum Coverage', () => {
  // Check required 7 topics in curated registry
  const requiredKeys = [
    'human_heart_anatomy',
    'photosynthesis_chloroplast',
    'dna_double_helix',
    'newtons_laws_mechanics',
    'chemical_bonding_types',
    'world_war_two_history',
    'solar_system_planets'
  ];

  requiredKeys.forEach((key) => {
    const asset = VERIFIED_SCIENTIFIC_ASSETS[key];
    assert.ok(asset, `Asset registry must contain ${key}`);
    assert.ok(asset.title, `Asset ${key} must have title`);
    assert.ok(asset.creator, `Asset ${key} must have creator`);
    assert.ok(asset.licenseType, `Asset ${key} must have licenseType`);
    assert.ok(asset.attributionRequirements, `Asset ${key} must have attributionRequirements`);
    assert.ok(asset.originalSourceUrl, `Asset ${key} must have originalSourceUrl`);
    assert.ok(asset.directImageUrl, `Asset ${key} must have directImageUrl`);
    assert.ok(asset.walkthrough, `Asset ${key} must have walkthrough breakdown`);
    assert.ok(asset.labels && asset.labels.length > 0, `Asset ${key} must have labeled pins`);
  });
});

test('3. Topic 1: Structure of the Human Heart Visual Retrieval & Metadata', async () => {
  const asset = await educationalImageResearchEngine.researchAndRetrieveEducationalVisual({
    sectionTitle: 'Internal Anatomy: 4 Chambers and One-Way Valves',
    conceptName: 'Structure of the Human Heart',
    visualType: 'labelled_diagram',
    searchQuery: 'human heart structure chambers valves',
    pedagogicalPurpose: 'Demonstrate pulmonary and systemic blood pathway through 4 cardiac chambers',
    domain: 'biology'
  });

  assert.ok(asset, 'Asset returned for Human Heart');
  assert.ok(asset.title.toLowerCase().includes('heart'), 'Title reflects heart');
  assert.ok(asset.licenseType, 'License type preserved');
  assert.ok(asset.attributionRequirements, 'Attribution requirements provided');
  assert.ok((asset.walkthrough?.keyComponents?.length || 0) >= 3, 'Walkthrough lists key components');
});

test('4. Topic 2: Photosynthesis Visual Retrieval & Metadata', async () => {
  const asset = await educationalImageResearchEngine.researchAndRetrieveEducationalVisual({
    sectionTitle: 'Thylakoids and Chloroplast Anatomy',
    conceptName: 'Photosynthesis',
    visualType: 'process_diagram',
    searchQuery: 'photosynthesis chloroplast light reaction',
    pedagogicalPurpose: 'Illustrate photon absorption in granum and light-independent Calvin cycle',
    domain: 'biology'
  });

  assert.ok(asset, 'Asset returned for Photosynthesis');
  assert.ok(asset.title.toLowerCase().includes('photosynthesis'), 'Title reflects photosynthesis');
  assert.ok(asset.licenseType, 'License type preserved');
  assert.ok(asset.attributionRequirements, 'Attribution requirements provided');
  assert.ok((asset.walkthrough?.keyComponents?.length || 0) >= 3, 'Walkthrough lists key components');
});

test('5. Topic 3: DNA Structure Visual Retrieval & Metadata', async () => {
  const asset = await educationalImageResearchEngine.researchAndRetrieveEducationalVisual({
    sectionTitle: 'Watson-Crick Double Helix and Complementary Base Pairing',
    conceptName: 'DNA Structure',
    visualType: 'labelled_diagram',
    searchQuery: 'DNA double helix base pairing adenine thymine',
    pedagogicalPurpose: 'Demonstrate antiparallel sugar-phosphate backbone and hydrogen bonding',
    domain: 'biology'
  });

  assert.ok(asset, 'Asset returned for DNA Structure');
  assert.ok(asset.title.toLowerCase().includes('dna'), 'Title reflects DNA');
  assert.ok(asset.licenseType, 'License type preserved');
  assert.ok(asset.attributionRequirements, 'Attribution requirements provided');
});

test('6. Topic 4: Laws of Motion Visual Retrieval & Metadata', async () => {
  const asset = await educationalImageResearchEngine.researchAndRetrieveEducationalVisual({
    sectionTitle: "Newton's Three Laws of Motion",
    conceptName: 'Laws of Motion',
    visualType: 'labelled_diagram',
    searchQuery: "Newton laws of motion inertia F=ma action reaction",
    pedagogicalPurpose: 'Demonstrate inertia, force-mass relationship, and equal and opposite reactions',
    domain: 'physics'
  });

  assert.ok(asset, 'Asset returned for Laws of Motion');
  assert.ok(asset.title.toLowerCase().includes('motion') || asset.title.toLowerCase().includes('newton'), 'Title reflects Laws of Motion');
  assert.ok(asset.attributionRequirements, 'Attribution requirements provided');
});

test('7. Topic 5: Chemical Bonding Visual Retrieval & Metadata', async () => {
  const asset = await educationalImageResearchEngine.researchAndRetrieveEducationalVisual({
    sectionTitle: 'Ionic vs Covalent Electron Transfer and Sharing',
    conceptName: 'Chemical Bonding',
    visualType: 'process_diagram',
    searchQuery: 'chemical bonding ionic covalent electron transfer',
    pedagogicalPurpose: 'Demonstrate valence electron transfer in NaCl and covalent electron sharing in H2O',
    domain: 'chemistry'
  });

  assert.ok(asset, 'Asset returned for Chemical Bonding');
  assert.ok(asset.title.toLowerCase().includes('bonding') || asset.title.toLowerCase().includes('chemical'), 'Title reflects Chemical Bonding');
  assert.ok(asset.attributionRequirements, 'Attribution requirements provided');
});

test('8. Topic 6: World War II Visual Retrieval & Metadata', async () => {
  const asset = await educationalImageResearchEngine.researchAndRetrieveEducationalVisual({
    sectionTitle: 'European and Pacific Theatres: Allied and Axis Coalitions',
    conceptName: 'World War II',
    visualType: 'map',
    searchQuery: 'World War II military map Allied Axis powers Europe',
    pedagogicalPurpose: 'Geographic map of European and Pacific theatres of war (1939-1945)',
    domain: 'history'
  });

  assert.ok(asset, 'Asset returned for World War II');
  assert.ok(asset.title.toLowerCase().includes('war') || asset.title.toLowerCase().includes('wwii'), 'Title reflects World War II');
  assert.ok(asset.attributionRequirements, 'Attribution requirements provided');
});

test('9. Topic 7: Solar System Visual Retrieval & Metadata', async () => {
  const asset = await educationalImageResearchEngine.researchAndRetrieveEducationalVisual({
    sectionTitle: 'Helicentric Orbits: Terrestrial and Gas Giant Planets',
    conceptName: 'Solar System',
    visualType: '3d_asset',
    searchQuery: 'Solar System planetary orbits Sun terrestrial gas giants',
    pedagogicalPurpose: 'Copernican heliocentric model displaying 8 planetary orbits and Kuiper belt',
    domain: 'physics'
  });

  assert.ok(asset, 'Asset returned for Solar System');
  assert.ok(asset.title.toLowerCase().includes('solar') || asset.title.toLowerCase().includes('planet'), 'Title reflects Solar System');
  assert.ok(asset.attributionRequirements, 'Attribution requirements provided');
});

test('10. SQLite Persistent Image Cache Verification', () => {
  const cachedRows = db.prepare('SELECT * FROM cached_educational_images LIMIT 10').all() as any[];
  assert.ok(Array.isArray(cachedRows), 'cached_educational_images table exists and returns array');
  assert.ok(cachedRows.length > 0, 'Cached images are saved into SQLite database');

  const first = cachedRows[0];
  assert.ok(first.query, 'Cache entry has query');
  assert.ok(first.title, 'Cache entry has title');
  assert.ok(first.provider, 'Cache entry has provider');
  assert.ok(first.license_type, 'Cache entry has license_type');
  assert.ok(first.attribution_requirements, 'Cache entry has attribution_requirements');
});
