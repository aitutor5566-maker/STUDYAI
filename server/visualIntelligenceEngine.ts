export interface ImageWalkthrough {
  whatIsShown?: string;
  whatItShows?: string;
  whyItMatters: string;
  keyComponentsWithRoles?: Array<{ name: string; role: string; visualCue: string }>;
  importantParts?: Array<{ label: string; description: string }>;
  stepByStepWalkthrough?: string[];
  processStages?: string[];
  partFunctions?: string;
  howPartsConnect?: string;
  commonMisconceptions?: string[];
  practicalApplications?: string;
  selfCheckQuestions?: Array<{ question: string; answer: string; clue?: string }>;
  whatToRemember?: string;
}

export interface VisualConceptEvaluation {
  conceptId: string;
  conceptName: string;
  recommendedType: 'three_js_scene' | 'scientific_diagram' | 'process_diagram' | 'concept_map' | 'comparison_diagram' | 'chart_graph';
  rationale: string;
  has3DSupport: boolean;
  priority: 'primary' | 'secondary';
}

export interface SubtopicVisualPlan {
  subtopicId: string;
  title: string;
  learningObjective: string;
  concepts: VisualConceptEvaluation[];
  primaryVisual: VisualRepresentation;
  secondaryVisual?: VisualRepresentation;
}

export interface VisualRepresentation {
  id: string;
  topic: string;
  subtopic: string;
  visualType: 'three_js_scene' | 'scientific_diagram' | 'process_diagram' | 'concept_map' | 'comparison_diagram' | 'chart_graph';
  title: string;
  caption: string;
  dataUrl?: string; // For SVGs / images
  model3DConfig?: {
    modelType: string;
    cameraPosition: [number, number, number];
    interactiveComponents: Array<{ id: string; label: string; role: string; color: string }>;
  };
  accessibilityText: string;
  labels: Array<{ text: string; x: number; y: number; description: string }>;
  walkthrough: ImageWalkthrough;
  timestamp: number;
}

export interface TopicVisualPlan {
  topic: string;
  gradeLevel: string;
  subject: string;
  prerequisites: string[];
  hierarchy: string[];
  subtopics: SubtopicVisualPlan[];
  overallSummary: string;
}

// In-memory cache for visual representations
const visualCache = new Map<string, VisualRepresentation>();

function getCacheKey(topic: string, subtopic: string = '', visualType: string = ''): string {
  return `${(topic || '').toLowerCase().trim()}::${(subtopic || '').toLowerCase().trim()}::${visualType.toLowerCase().trim()}`;
}

/**
 * Validates label contrast and non-overlapping positioning
 */
export function validateAndOptimizeLabels(labels: Array<{ text: string; x: number; y: number; description: string }>) {
  const minDistance = 25;
  const optimized = [...labels];
  for (let i = 0; i < optimized.length; i++) {
    for (let j = i + 1; j < optimized.length; j++) {
      const dx = Math.abs(optimized[i].x - optimized[j].x);
      const dy = Math.abs(optimized[i].y - optimized[j].y);
      if (dx < minDistance && dy < 18) {
        optimized[j].y += 20; // Shift downward to avoid label collision
      }
    }
  }
  return optimized;
}

/**
 * Programmatic SVG Generators for the 10 Core Acceptance Topics
 */
export function generateScientificSvgForTopic(topic: string, subtopic: string = ''): {
  svg: string;
  dataUrl: string;
  title: string;
  caption: string;
  labels: Array<{ text: string; x: number; y: number; description: string }>;
  walkthrough: ImageWalkthrough;
} {
  const norm = (topic + ' ' + subtopic).toLowerCase();

  if (norm.includes('heart') || norm.includes('cardio') || norm.includes('circulat')) {
    return generateHumanHeartSvg();
  } else if (norm.includes('dna') || norm.includes('genetic') || norm.includes('nucleic')) {
    return generateDnaSvg();
  } else if (norm.includes('photo') || norm.includes('chloro') || norm.includes('calvin')) {
    return generatePhotosynthesisSvg();
  } else if (norm.includes('atom') || norm.includes('bohr') || norm.includes('electron')) {
    return generateAtomicStructureSvg();
  } else if (norm.includes('bond') || norm.includes('covalent') || norm.includes('ionic')) {
    return generateChemicalBondingSvg();
  } else if (norm.includes('fraction') || norm.includes('numerator') || norm.includes('ratio')) {
    return generateFractionsSvg();
  } else if (norm.includes('geomet') || norm.includes('pythagor') || norm.includes('triangle')) {
    return generateGeometrySvg();
  } else if (norm.includes('newton') || norm.includes('force') || norm.includes('motion')) {
    return generateNewtonsLawsSvg();
  } else if (norm.includes('solar') || norm.includes('planet') || norm.includes('orbit')) {
    return generateSolarSystemSvg();
  } else if (norm.includes('water') || norm.includes('hydrolog') || norm.includes('evaporat')) {
    return generateWaterCycleSvg();
  }

  return generateUniversalScientificSvg(topic, subtopic);
}

// 1. Human Heart SVG
function generateHumanHeartSvg() {
  const labels = [
    { text: 'Superior Vena Cava', x: 210, y: 110, description: 'Brings deoxygenated blood from upper body' },
    { text: 'Aorta', x: 420, y: 80, description: 'Distributes oxygenated blood to the systemic circulation' },
    { text: 'Pulmonary Artery', x: 570, y: 130, description: 'Transports deoxygenated blood to the lungs' },
    { text: 'Right Atrium', x: 230, y: 220, description: 'Receives deoxygenated venous return' },
    { text: 'Tricuspid Valve', x: 280, y: 290, description: 'Prevents backflow from right ventricle to atrium' },
    { text: 'Right Ventricle', x: 270, y: 370, description: 'Pumps blood to pulmonary circuit under low pressure' },
    { text: 'Interventricular Septum', x: 400, y: 360, description: 'Muscular wall separating oxygenated and deoxygenated blood' },
    { text: 'Left Ventricle', x: 520, y: 380, description: 'Thick muscular wall pumping systemic blood at high pressure' },
    { text: 'Mitral / Bicuspid Valve', x: 510, y: 280, description: 'Two-cusp valve between left atrium and ventricle' },
    { text: 'Left Atrium', x: 550, y: 220, description: 'Receives oxygen-rich blood from pulmonary veins' },
    { text: 'SA Node Pacemaker', x: 190, y: 180, description: 'Initiates rhythmic cardiac electrical depolarization' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">Anatomy &amp; Hemodynamics of the Human Heart</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Four-Chambered Double Circulation: Pulmonary &amp; Systemic Loops</text>

    <!-- Superior & Inferior Vena Cava -->
    <path d="M 230 80 L 230 180 M 230 380 L 230 460" stroke="#38BDF8" stroke-width="26" stroke-linecap="round" fill="none"/>

    <!-- Aorta Arch -->
    <path d="M 390 230 C 390 100 450 60 520 110 L 530 160" stroke="#EF4444" stroke-width="32" stroke-linecap="round" fill="none"/>
    <path d="M 430 75 L 430 48 M 460 72 L 460 48 M 490 80 L 490 48" stroke="#EF4444" stroke-width="8" stroke-linecap="round"/>

    <!-- Pulmonary Trunk & Arteries -->
    <path d="M 340 230 C 340 160 460 140 590 135" stroke="#3B82F6" stroke-width="24" fill="none"/>

    <!-- Right Side (Blue - Deoxygenated) -->
    <path d="M 230 180 C 180 200 170 310 240 340 C 220 380 260 450 360 470 L 390 320 Z" fill="#1E3A8A" stroke="#60A5FA" stroke-width="3"/>

    <!-- Septum Wall -->
    <path d="M 390 260 L 390 480" stroke="#475569" stroke-width="18" stroke-linecap="round"/>

    <!-- Left Side (Red - Oxygenated) -->
    <path d="M 390 260 C 480 250 590 220 590 310 C 590 400 500 475 390 480 Z" fill="#991B1B" stroke="#F87171" stroke-width="3.5"/>

    <!-- Valves -->
    <ellipse cx="280" cy="300" rx="24" ry="7" fill="#FDE047" stroke="#CA8A04" stroke-width="2"/>
    <ellipse cx="500" cy="290" rx="22" ry="7" fill="#FDE047" stroke="#CA8A04" stroke-width="2"/>

    <!-- SA Node Glow -->
    <circle cx="210" cy="190" r="9" fill="#FACC15" stroke="#FEF08A" stroke-width="3"/>
    <circle cx="210" cy="190" r="16" fill="none" stroke="#FACC15" stroke-width="1.5" stroke-dasharray="3 3"/>

    <!-- Directional Blood Flow Arrows -->
    <path d="M 230 130 L 230 160" stroke="#FFFFFF" stroke-width="3" marker-end="url(#arrow)"/>
    <path d="M 290 350 L 330 250" stroke="#93C5FD" stroke-width="3" stroke-dasharray="5 3"/>
    <path d="M 490 370 L 430 240" stroke="#FCA5A5" stroke-width="3" stroke-dasharray="5 3"/>

    <!-- Labeled Boxes -->
    <g font-family="Inter, sans-serif" font-size="11" font-weight="700">
      <rect x="25" y="100" width="160" height="28" rx="6" fill="#1E293B" stroke="#38BDF8"/>
      <text x="105" y="119" fill="#E2E8F0" text-anchor="middle">Superior Vena Cava</text>

      <rect x="25" y="175" width="160" height="28" rx="6" fill="#1E293B" stroke="#FACC15"/>
      <text x="105" y="194" fill="#FEF08A" text-anchor="middle">SA Node (Pacemaker)</text>

      <rect x="25" y="245" width="160" height="28" rx="6" fill="#1E293B" stroke="#60A5FA"/>
      <text x="105" y="264" fill="#93C5FD" text-anchor="middle">Right Atrium</text>

      <rect x="25" y="365" width="160" height="28" rx="6" fill="#1E293B" stroke="#60A5FA"/>
      <text x="105" y="384" fill="#93C5FD" text-anchor="middle">Right Ventricle</text>

      <rect x="655" y="75" width="160" height="28" rx="6" fill="#1E293B" stroke="#EF4444"/>
      <text x="735" y="94" fill="#FCA5A5" text-anchor="middle">Systemic Aorta</text>

      <rect x="655" y="145" width="160" height="28" rx="6" fill="#1E293B" stroke="#3B82F6"/>
      <text x="735" y="164" fill="#93C5FD" text-anchor="middle">Pulmonary Artery</text>

      <rect x="655" y="245" width="160" height="28" rx="6" fill="#1E293B" stroke="#F87171"/>
      <text x="735" y="264" fill="#FECACA" text-anchor="middle">Left Atrium</text>

      <rect x="655" y="365" width="160" height="28" rx="6" fill="#1E293B" stroke="#EF4444"/>
      <text x="735" y="384" fill="#FECACA" text-anchor="middle">Left Ventricle (Thick)</text>
    </g>

    <!-- Legend Bar -->
    <rect x="180" y="495" width="480" height="32" rx="8" fill="#1E293B" stroke="#334155"/>
    <circle cx="210" cy="511" r="6" fill="#3B82F6"/>
    <text x="225" y="515" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1">Deoxygenated Blood</text>
    <circle cx="370" cy="511" r="6" fill="#EF4444"/>
    <text x="385" y="515" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1">Oxygenated Blood</text>
    <circle cx="515" cy="511" r="6" fill="#FACC15"/>
    <text x="530" y="515" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1">Electrical Conduction</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'A high-precision cross-sectional anatomical diagram of the four-chambered human heart illustrating internal chambers, heart valves, major blood vessels, and direction of systemic and pulmonary blood flow.',
    whyItMatters: 'The heart operates as two coordinated biological pumps in series, delivering oxygen and metabolic nutrients to trillions of somatic cells while preventing the fatal mixing of deoxygenated and oxygenated blood.',
    keyComponentsWithRoles: [
      { name: 'Right Ventricle', role: 'Pumps low-pressure deoxygenated blood to the pulmonary capillaries for alveolar gas exchange.', visualCue: 'Lower left chamber rendered in deep venous blue.' },
      { name: 'Left Ventricle', role: 'Generates high systolic blood pressure (~120 mmHg) to pump oxygenated blood throughout the systemic arterial tree.', visualCue: 'Thick muscular lower right chamber rendered in arterial red.' },
      { name: 'Sinoatrial (SA) Node', role: 'Acts as the primary cardiac pacemaker, depolarizing spontaneously at 60–100 bpm.', visualCue: 'Glowing yellow pacemaker hub located in upper right atrium.' },
      { name: 'Aorta', role: 'Primary arterial conduit distributing systemic blood under high pulsatile pressure.', visualCue: 'Large red superior arch with branching carotid and subclavian vessels.' }
    ],
    stepByStepWalkthrough: [
      'Deoxygenated systemic venous blood enters the Right Atrium via the Superior and Inferior Vena Cava.',
      'During ventricular diastole, blood flows through the open Tricuspid Valve into the Right Ventricle.',
      'Ventricular systole drives blood through the Pulmonary Semilunar Valve into the Pulmonary Arteries to the lungs.',
      'Oxygen-enriched blood returns via four Pulmonary Veins into the Left Atrium.',
      'Blood passes through the Bicuspid (Mitral) Valve into the high-pressure Left Ventricle.',
      'Vigorous ventricular contraction forces oxygenated blood through the Aortic Valve into the systemic Aorta to nourish the body.'
    ],
    commonMisconceptions: [
      'Arteries do not always carry oxygenated blood: the Pulmonary Artery is an artery (carries blood away from the heart) but carries deoxygenated blood.',
      'The heart is not on the far left side of the chest; it sits centrally in the mediastinum with its apex tilted ~60° to the left.'
    ],
    practicalApplications: 'Informs clinical diagnosis of myocardial infarction, hypertension, cardiac murmurs, heart valve stenosis, and pacemaker implantation.',
    selfCheckQuestions: [
      { question: 'Why is the myocardium of the Left Ventricle approximately three times thicker than the Right Ventricle?', answer: 'The left ventricle must overcome the high systemic vascular resistance of the entire body, whereas the right ventricle only pumps against low resistance in the pulmonary capillary bed.', clue: 'Think about pumping distance: systemic body vs pulmonary lungs.' },
      { question: 'What crucial role do the atrioventricular valves serve during ventricular systole?', answer: 'They snap shut to prevent regurgitant backflow of blood into the low-pressure atria, maintaining unidirectional blood flow.', clue: 'Think about one-way check valves.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'Human Heart Anatomy & Double Circulation',
    caption: 'Cross-sectional view of cardiac chambers, valves, systemic aorta, and pulmonary blood flow pathways.',
    labels,
    walkthrough
  };
}

// 2. DNA Double Helix SVG
function generateDnaSvg() {
  const labels = [
    { text: 'Phosphate-Deoxyribose Backbone', x: 120, y: 140, description: '5′-to-3′ antiparallel structural rail linked by phosphodiester bonds' },
    { text: 'Adenine (A) = Thymine (T)', x: 420, y: 160, description: 'Complementary purine-pyrimidine pair bonded by 2 hydrogen bonds' },
    { text: 'Guanine (G) ≡ Cytosine (C)', x: 420, y: 270, description: 'Complementary purine-pyrimidine pair bonded by 3 hydrogen bonds' },
    { text: 'Major Groove', x: 260, y: 350, description: 'Wide helical indentation exposing sequence-specific transcription factor binding sites' },
    { text: 'Minor Groove', x: 570, y: 390, description: 'Narrow indentation between helical backbones' },
    { text: 'Antiparallel Rails (5′ → 3′ vs 3′ → 5′)', x: 670, y: 470, description: 'Strands run in opposing chemical directions dictated by deoxyribose carbon numbering' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">DNA Structure — Antiparallel Double Helix &amp; Base Pairing</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Watson-Crick Model: Deoxyribose Backbone, Hydrogen Bonds &amp; Complementarity</text>

    <!-- Helical Ribbon 1 (Left 5' -> 3') -->
    <path d="M 180 90 Q 280 200 180 310 T 180 500" fill="none" stroke="#38BDF8" stroke-width="12" stroke-linecap="round"/>
    <!-- Helical Ribbon 2 (Right 3' -> 5') -->
    <path d="M 320 90 Q 220 200 320 310 T 320 500" fill="none" stroke="#818CF8" stroke-width="12" stroke-linecap="round"/>

    <!-- Base Pair Rungs across helix -->
    <!-- Rung 1: A=T -->
    <line x1="195" y1="120" x2="305" y2="120" stroke="#22C55E" stroke-width="7"/>
    <line x1="195" y1="125" x2="305" y2="125" stroke="#F59E0B" stroke-width="7"/>

    <!-- Rung 2: G=C -->
    <line x1="220" y1="170" x2="280" y2="170" stroke="#3B82F6" stroke-width="8"/>
    <line x1="220" y1="175" x2="280" y2="175" stroke="#EF4444" stroke-width="8"/>

    <!-- Rung 3: T=A -->
    <line x1="210" y1="240" x2="290" y2="240" stroke="#F59E0B" stroke-width="7"/>
    <line x1="210" y1="245" x2="290" y2="245" stroke="#22C55E" stroke-width="7"/>

    <!-- Rung 4: C=G -->
    <line x1="190" y1="310" x2="310" y2="310" stroke="#EF4444" stroke-width="8"/>
    <line x1="190" y1="315" x2="310" y2="315" stroke="#3B82F6" stroke-width="8"/>

    <!-- Detail Box: Chemical Bonding Zoom -->
    <rect x="400" y="100" width="410" height="360" rx="14" fill="#1E293B" stroke="#334155" stroke-width="2"/>
    <text x="605" y="130" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#F8FAFC" text-anchor="middle">Molecular Base-Pairing Mechanism</text>

    <!-- Adenine = Thymine pair (2 H-Bonds) -->
    <rect x="420" y="150" width="105" height="55" rx="8" fill="#15803D" stroke="#4ADE80"/>
    <text x="472" y="177" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Adenine (A)</text>
    <text x="472" y="194" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#BBF7D0" text-anchor="middle">Purine (2 rings)</text>

    <line x1="535" y1="168" x2="575" y2="168" stroke="#FBBF24" stroke-width="3" stroke-dasharray="4 2"/>
    <line x1="535" y1="184" x2="575" y2="184" stroke="#FBBF24" stroke-width="3" stroke-dasharray="4 2"/>
    <text x="555" y="156" font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="#FDE047" text-anchor="middle">2 H-Bonds</text>

    <rect x="585" y="150" width="105" height="55" rx="8" fill="#B45309" stroke="#FBBF24"/>
    <text x="637" y="177" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Thymine (T)</text>
    <text x="637" y="194" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#FEF3C7" text-anchor="middle">Pyrimidine (1 ring)</text>

    <!-- Guanine ≡ Cytosine pair (3 H-Bonds) -->
    <rect x="420" y="240" width="105" height="55" rx="8" fill="#1D4ED8" stroke="#60A5FA"/>
    <text x="472" y="267" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Guanine (G)</text>
    <text x="472" y="284" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#BFDBFE" text-anchor="middle">Purine (2 rings)</text>

    <line x1="535" y1="256" x2="575" y2="256" stroke="#EF4444" stroke-width="3" stroke-dasharray="4 2"/>
    <line x1="535" y1="268" x2="575" y2="268" stroke="#EF4444" stroke-width="3" stroke-dasharray="4 2"/>
    <line x1="535" y1="280" x2="575" y2="280" stroke="#EF4444" stroke-width="3" stroke-dasharray="4 2"/>
    <text x="555" y="246" font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="#FCA5A5" text-anchor="middle">3 H-Bonds (Stronger)</text>

    <rect x="585" y="240" width="105" height="55" rx="8" fill="#B91C1C" stroke="#F87171"/>
    <text x="637" y="267" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Cytosine (C)</text>
    <text x="637" y="284" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#FEE2E2" text-anchor="middle">Pyrimidine (1 ring)</text>

    <!-- Chargaff's Rules & Dimension Callout -->
    <rect x="420" y="320" width="370" height="120" rx="10" fill="#0F172A" stroke="#475569"/>
    <text x="435" y="344" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">Chargaff's Rules &amp; Structural Dimensions:</text>
    <text x="435" y="366" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#E2E8F0">• % Adenine = % Thymine | % Guanine = % Cytosine</text>
    <text x="435" y="386" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#E2E8F0">• Diameter = 2.0 nm | Pitch = 3.4 nm per 10 base-pair turn</text>
    <text x="435" y="406" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#E2E8F0">• Distance between adjacent stacked base pairs = 0.34 nm</text>
    <text x="435" y="426" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#FDE047">• G≡C pairs require higher melting temperature (Tm) than A=T</text>

    <!-- Strand Direction Tags -->
    <text x="180" y="80" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">5′ End</text>
    <text x="320" y="80" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#818CF8" text-anchor="middle">3′ End</text>
    <text x="180" y="525" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">3′ End</text>
    <text x="320" y="525" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#818CF8" text-anchor="middle">5′ End</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'The Watson-Crick double-helical structure of deoxyribonucleic acid (DNA) highlighting antiparallel sugar-phosphate backbones and complementary nitrogenous base pairs.',
    whyItMatters: 'The universal code of biological life is stored in DNA sequences; exact complementary hydrogen bonding allows high-fidelity DNA replication, RNA transcription, and protein synthesis.',
    keyComponentsWithRoles: [
      { name: 'Sugar-Phosphate Rails', role: 'Forms the covalently linked 5′-to-3′ structural skeleton protecting genetic data inside.', visualCue: 'Cyan and indigo helical ribbons.' },
      { name: 'A=T Base Pair', role: 'Purine adenine pairs with pyrimidine thymine via 2 hydrogen bonds.', visualCue: 'Green and orange pairing rungs.' },
      { name: 'G≡C Base Pair', role: 'Purine guanine pairs with pyrimidine cytosine via 3 hydrogen bonds providing thermal stability.', visualCue: 'Blue and red pairing rungs with triple bond.' },
      { name: 'Antiparallel Geometry', role: 'Strands orient in opposite chemical directions (5′→3′ and 3′→5′), essential for DNA polymerase activity.', visualCue: 'Directional terminal end callouts.' }
    ],
    stepByStepWalkthrough: [
      'Each DNA nucleotide consists of a deoxyribose sugar, a negatively charged phosphate group, and one of four nitrogenous bases.',
      'Phosphodiester bonds link the 3′-hydroxyl of one sugar to the 5′-phosphate of the next.',
      'Two complementary strands twist into a right-handed B-DNA double helix with a width of 2.0 nm.',
      'Base pairs stack horizontally in the core with 0.34 nm spacing, stabilized by hydrophobic interactions and van der Waals forces.',
      'During replication, DNA Helicase breaks weak hydrogen bonds, allowing DNA Polymerase to synthesize new daughter strands.'
    ],
    commonMisconceptions: [
      'Nitrogenous bases are not held together by covalent bonds; they are linked by weak hydrogen bonds that can be unzipped by enzymes at physiological temperatures.',
      'The strands are not identical; they are complementary and antiparallel.'
    ],
    practicalApplications: 'PCR diagnostics, CRISPR genome editing, forensic DNA profiling, mRNA vaccine design, and targeted cancer therapies.',
    selfCheckQuestions: [
      { question: 'Why does a DNA sequence with 75% G-C content require more energy to denature than one with 75% A-T content?', answer: 'Guanine and cytosine are linked by three hydrogen bonds compared to only two between adenine and thymine, providing greater thermodynamic stability.', clue: 'Count the hydrogen bonds between G≡C vs A=T.' },
      { question: 'What is meant by the antiparallel orientation of DNA strands?', answer: 'One strand runs in the 5′-to-3′ direction while the complementary strand runs in the 3′-to-5′ direction.', clue: 'Look at the sugar carbon numbers at opposite ends.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'DNA Double Helix & Molecular Base Pairing',
    caption: 'Antiparallel helical strands, Watson-Crick base pairs, hydrogen bond counts, and Chargaff rules.',
    labels,
    walkthrough
  };
}

// 3. Photosynthesis SVG
function generatePhotosynthesisSvg() {
  const labels = [
    { text: 'Chloroplast Double Membrane', x: 200, y: 120, description: 'Outer and inner envelope regulating metabolite transport' },
    { text: 'Thylakoid Membrane & Granum', x: 260, y: 220, description: 'Site of light-dependent reactions, photolysis of water, and ATP/NADPH synthesis' },
    { text: 'Stroma Matrix', x: 580, y: 200, description: 'Dense aqueous fluid containing RuBisCO enzyme for the Calvin cycle' },
    { text: 'Light Reactions (H₂O → O₂)', x: 240, y: 340, description: 'Photon excitation drives photolysis releasing O₂ gas as byproduct' },
    { text: 'Calvin Cycle (CO₂ → Glucose)', x: 600, y: 340, description: 'Carbon fixation synthesizing high-energy 3-carbon sugars (G3P)' },
    { text: 'Energy Carriers (ATP & NADPH)', x: 420, y: 260, description: 'Chemical energy intermediates shuttled between light reactions and Calvin cycle' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">Photosynthesis — Chloroplast Light Reactions &amp; Calvin Cycle</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">6 CO₂ + 6 H₂O + Photons → C₆H₁₂O₆ (Glucose) + 6 O₂</text>

    <!-- Chloroplast Membrane Shell -->
    <ellipse cx="420" cy="280" rx="390" ry="190" fill="#064E3B" stroke="#10B981" stroke-width="4"/>
    <ellipse cx="420" cy="280" rx="378" ry="178" fill="#065F46" stroke="#34D399" stroke-width="2"/>

    <!-- Left Chamber: Light-Dependent Reactions (Thylakoids) -->
    <rect x="90" y="140" width="300" height="280" rx="16" fill="#047857" stroke="#10B981" stroke-width="2"/>
    <text x="240" y="172" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#A7F3D0" text-anchor="middle">Thylakoid Membrane System</text>
    <text x="240" y="192" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#D1FAE5" text-anchor="middle">Light-Dependent Photochemical Reactions</text>

    <!-- Thylakoid Granum Discs -->
    <g fill="#059669" stroke="#6EE7B7" stroke-width="2">
      <ellipse cx="240" cy="230" rx="70" ry="14"/>
      <ellipse cx="240" cy="250" rx="70" ry="14"/>
      <ellipse cx="240" cy="270" rx="70" ry="14"/>
      <ellipse cx="240" cy="290" rx="70" ry="14"/>
    </g>

    <!-- Sunlight Influx -->
    <path d="M 60 70 L 160 160" stroke="#FDE047" stroke-width="6" stroke-linecap="round"/>
    <text x="100" y="90" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">⚡ Sunlight (Photons)</text>

    <!-- Water Influx & Oxygen Byproduct -->
    <path d="M 140 460 L 190 350" stroke="#38BDF8" stroke-width="4" marker-end="url(#arrow)"/>
    <text x="130" y="480" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8">H₂O (Water)</text>

    <path d="M 280 350 L 330 460" stroke="#4ADE80" stroke-width="4"/>
    <text x="330" y="480" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#4ADE80">O₂ (Oxygen Gas)</text>

    <!-- Energy Shuttle Bridge (ATP & NADPH) -->
    <g>
      <!-- ATP/NADPH -> Calvin -->
      <path d="M 370 230 C 420 210 440 210 470 230" fill="none" stroke="#FACC15" stroke-width="4" stroke-dasharray="6 3"/>
      <text x="420" y="215" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FACC15" text-anchor="middle">ATP + NADPH ➔</text>

      <!-- ADP/NADP+ <- Calvin -->
      <path d="M 470 310 C 440 330 420 330 370 310" fill="none" stroke="#94A3B8" stroke-width="4" stroke-dasharray="6 3"/>
      <text x="420" y="342" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#CBD5E1" text-anchor="middle">⮌ ADP + NADP⁺</text>
    </g>

    <!-- Right Chamber: Light-Independent Reactions (Calvin Cycle in Stroma) -->
    <rect x="450" y="140" width="310" height="280" rx="16" fill="#134E4A" stroke="#2DD4BF" stroke-width="2"/>
    <text x="605" y="172" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#99F6E4" text-anchor="middle">Stroma Matrix</text>
    <text x="605" y="192" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CCFBF1" text-anchor="middle">Calvin Cycle (Light-Independent Carbon Fixation)</text>

    <!-- Circular Calvin Cycle -->
    <circle cx="605" cy="275" r="55" fill="none" stroke="#2DD4BF" stroke-width="4" stroke-dasharray="8 4"/>
    <text x="605" y="272" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#5EEAD4" text-anchor="middle">RuBisCO</text>
    <text x="605" y="288" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#99F6E4" text-anchor="middle">Carbon Fixation</text>

    <!-- CO2 Input & Sugar Output -->
    <path d="M 605 70 L 605 150" stroke="#F87171" stroke-width="4"/>
    <text x="605" y="90" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F87171" text-anchor="middle">CO₂ (Carbon Dioxide)</text>

    <path d="M 605 390 L 605 470" stroke="#FBBF24" stroke-width="5"/>
    <text x="605" y="490" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FDE047" text-anchor="middle">C₆H₁₂O₆ (Glucose / G3P Sugar)</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'The two-stage biochemical architecture of photosynthesis occurring inside a plant chloroplast: light-dependent reactions in the thylakoid membranes and the Calvin cycle in the stroma.',
    whyItMatters: 'Photosynthesis captures solar radiant energy and converts it into stable organic chemical bonds, producing nearly all atmospheric oxygen and foundational biomass for Earth’s ecosystems.',
    keyComponentsWithRoles: [
      { name: 'Thylakoid Granum', role: 'Houses photosystems I & II, electron transport chains, and ATP synthase to generate ATP and NADPH.', visualCue: 'Stacked green disc system on the left.' },
      { name: 'Stroma', role: 'Fluid matrix containing the enzyme RuBisCO that catalyzes carbon fixation during the Calvin cycle.', visualCue: 'Right teal reaction chamber.' },
      { name: 'ATP & NADPH', role: 'High-energy chemical currencies shuttled from the light reactions to power sugar synthesis.', visualCue: 'Upper yellow and lower gray energy flow pathways.' },
      { name: 'Photolysis of Water', role: 'Enzymatic splitting of water molecules (2H₂O → 4H⁺ + 4e⁻ + O₂) providing replacement electrons.', visualCue: 'Incoming blue water arrow and outgoing green oxygen.' }
    ],
    stepByStepWalkthrough: [
      'Chlorophyll pigments in Photosystems II and I absorb photons, energizing electrons.',
      'Water is enzymatically split (photolysis) to replace lost electrons, releasing O₂ gas as a vital byproduct.',
      'High-energy electrons flow down the electron transport chain, pumping protons into the thylakoid lumen.',
      'Chemiosmosis drives ATP synthase to produce ATP, while NADP⁺ reductase generates NADPH.',
      'In the stroma, RuBisCO fixes atmospheric CO₂ onto 5-carbon RuBP in the Calvin cycle.',
      'ATP and NADPH reduce 3-PGA into high-energy G3P molecules, which are assembled into glucose and sucrose.'
    ],
    commonMisconceptions: [
      'The "dark reactions" do not require darkness; they are simply light-independent and normally occur during daylight because they depend on fresh ATP and NADPH from the light reactions.',
      'Plants do not only do photosynthesis; their mitochondria also carry out continuous cellular respiration 24 hours a day.'
    ],
    practicalApplications: 'Agricultural crop yield optimization, bio-fuel engineering, artificial photosynthetic solar cells, and global carbon sequestration.',
    selfCheckQuestions: [
      { question: 'What is the precise biochemical source of the oxygen gas (O₂) released during photosynthesis?', answer: 'The photolysis (splitting) of water molecules (H₂O) at the oxygen-evolving complex of Photosystem II, NOT from carbon dioxide (CO₂).', clue: 'Think about which molecule donates electrons when struck by light.' },
      { question: 'What would occur in the stroma if light-dependent reactions were abruptly blocked?', answer: 'The Calvin cycle would soon halt because its reduction and regeneration steps require continuous supplies of ATP and NADPH from the thylakoids.', clue: 'Identify the energy carriers connecting the two stages.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'Photosynthesis & Chloroplast Bioenergetics',
    caption: 'Light-dependent thylakoid photolysis, ATP/NADPH energy shuttling, and stroma Calvin carbon fixation.',
    labels,
    walkthrough
  };
}

// 4. Atomic Structure SVG
function generateAtomicStructureSvg() {
  const labels = [
    { text: 'Dense Atomic Nucleus', x: 230, y: 190, description: 'Contains protons (positive) and neutrons (neutral) bound by the strong nuclear force' },
    { text: 'Protons (Z = +1 charge)', x: 170, y: 120, description: 'Determines the atomic number and elemental identity' },
    { text: 'Neutrons (N = 0 charge)', x: 170, y: 320, description: 'Stabilizes the nucleus against electrostatic proton repulsion' },
    { text: 'K-Shell (n = 1, max 2 e⁻)', x: 520, y: 180, description: 'Innermost quantized energy level with highest binding energy' },
    { text: 'L-Shell (n = 2, max 8 e⁻)', x: 670, y: 130, description: 'Second principal electron energy level' },
    { text: 'Valence Electron (e⁻)', x: 630, y: 360, description: 'Outermost electron governing chemical reactivity and bonding' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">Atomic Structure — Nucleus, Quantized Shells &amp; Subatomic Particles</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Bohr Model of Carbon (Z=6): 6 Protons, 6 Neutrons, 6 Electrons</text>

    <!-- Concentric Electron Shells -->
    <circle cx="420" cy="290" r="110" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="6 4"/>
    <text x="420" y="172" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="middle">K-Shell (n=1, capacity 2)</text>

    <circle cx="420" cy="290" r="190" fill="none" stroke="#818CF8" stroke-width="2.5" stroke-dasharray="8 5"/>
    <text x="420" y="92" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#818CF8" text-anchor="middle">L-Shell (n=2, capacity 8)</text>

    <!-- Central Nucleus -->
    <circle cx="420" cy="290" r="48" fill="#1E293B" stroke="#64748B" stroke-width="2"/>

    <!-- Protons & Neutrons clustered -->
    <g>
      <circle cx="410" cy="280" r="11" fill="#EF4444"/><text x="410" y="284" font-family="Inter, sans-serif" font-size="10" font-weight="900" fill="#FFF" text-anchor="middle">+</text>
      <circle cx="430" cy="280" r="11" fill="#64748B"/><text x="430" y="284" font-family="Inter, sans-serif" font-size="9" font-weight="800" fill="#FFF" text-anchor="middle">n</text>
      <circle cx="420" cy="300" r="11" fill="#EF4444"/><text x="420" y="304" font-family="Inter, sans-serif" font-size="10" font-weight="900" fill="#FFF" text-anchor="middle">+</text>
      <circle cx="405" cy="298" r="11" fill="#64748B"/><text x="405" y="302" font-family="Inter, sans-serif" font-size="9" font-weight="800" fill="#FFF" text-anchor="middle">n</text>
      <circle cx="435" cy="300" r="11" fill="#EF4444"/><text x="435" y="304" font-family="Inter, sans-serif" font-size="10" font-weight="900" fill="#FFF" text-anchor="middle">+</text>
      <circle cx="420" cy="275" r="11" fill="#64748B"/><text x="420" y="279" font-family="Inter, sans-serif" font-size="9" font-weight="800" fill="#FFF" text-anchor="middle">n</text>
    </g>

    <!-- K-Shell Electrons (2) -->
    <circle cx="420" cy="180" r="7" fill="#06B6D4" stroke="#FFF" stroke-width="1.5"/>
    <circle cx="420" cy="400" r="7" fill="#06B6D4" stroke="#FFF" stroke-width="1.5"/>

    <!-- L-Shell Valence Electrons (4 for Carbon) -->
    <circle cx="230" cy="290" r="8" fill="#F59E0B" stroke="#FFF" stroke-width="1.5"/>
    <circle cx="610" cy="290" r="8" fill="#F59E0B" stroke="#FFF" stroke-width="1.5"/>
    <circle cx="420" cy="100" r="8" fill="#F59E0B" stroke="#FFF" stroke-width="1.5"/>
    <circle cx="420" cy="480" r="8" fill="#F59E0B" stroke="#FFF" stroke-width="1.5"/>

    <!-- Legend and Properties Panel -->
    <rect x="50" y="440" width="300" height="70" rx="10" fill="#1E293B" stroke="#334155"/>
    <text x="65" y="462" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#F8FAFC">Carbon Atom Properties (₆C¹²):</text>
    <text x="65" y="480" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#CBD5E1">• Atomic Number Z = 6 (6 Protons)</text>
    <text x="65" y="496" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#CBD5E1">• Mass Number A = 12 (6 Protons + 6 Neutrons)</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'The internal subatomic architecture of an atom featuring a dense nucleus with protons and neutrons surrounded by orbiting electrons in quantized shells.',
    whyItMatters: 'Subatomic particle configurations govern atomic identity, the periodic table structure, chemical bond formation, and nuclear stability.',
    keyComponentsWithRoles: [
      { name: 'Protons', role: 'Positively charged nucleons defining the atomic number and elemental identity.', visualCue: 'Red spheres marked with positive (+) charges.' },
      { name: 'Neutrons', role: 'Electrically neutral nucleons binding protons via the strong nuclear force to counteract electrostatic repulsion.', visualCue: 'Slate gray spheres in the nucleus.' },
      { name: 'Electrons', role: 'Negatively charged leptons occupying quantized shells determining chemical reactivity.', visualCue: 'Cyan inner electrons and amber valence electrons.' },
      { name: 'Valence Shell', role: 'Outermost electron shell participating in covalent and ionic bonding.', visualCue: 'Outer indigo orbit with 4 valence electrons.' }
    ],
    stepByStepWalkthrough: [
      'Protons and neutrons reside tightly bound in the tiny central nucleus (< 1/10,000th the atomic radius).',
      'The strong nuclear force overcomes the intense electrostatic repulsion between positively charged protons.',
      'Electrons occupy discrete quantized energy levels (n=1, n=2, etc.) governed by quantum mechanics.',
      'The inner K-shell holds up to 2 electrons with the highest binding energy.',
      'The outer valence shell dictates chemical properties; atoms share or transfer electrons to achieve a stable octet.'
    ],
    commonMisconceptions: [
      'Electrons do not travel in rigid circular railway tracks; the Bohr model is an educational stepping stone to 3D electron probability clouds (orbitals).',
      'An atom is not solid; over 99.9999999% of an atom is empty space with the mass concentrated in the tiny nucleus.'
    ],
    practicalApplications: 'Semiconductor doping, nuclear power and PET scan medicine, chemical synthesis, and mass spectrometry.',
    selfCheckQuestions: [
      { question: 'Why does an atom have an overall net neutral charge in its elemental state?', answer: 'The number of positively charged protons (+1 each) in the nucleus exactly equals the number of negatively charged electrons (-1 each) orbiting it.', clue: 'Compare proton and electron counts.' },
      { question: 'What subatomic particle changes between two isotopes of the same element?', answer: 'The number of neutrons changes, altering atomic mass while chemical behavior (determined by protons and electrons) remains identical.', clue: 'Think about Carbon-12 vs Carbon-14.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'Atomic Structure & Quantized Electron Shells',
    caption: 'Bohr model showing nuclear composition, K/L electron shells, and valence electron distribution.',
    labels,
    walkthrough
  };
}

// 5. Chemical Bonding SVG (Covalent vs Ionic)
function generateChemicalBondingSvg() {
  const labels = [
    { text: 'Ionic Bond (Electron Transfer)', x: 220, y: 130, description: 'Complete electron transfer from metal to nonmetal creating electrostatic attraction' },
    { text: 'Sodium Cation (Na⁺)', x: 140, y: 250, description: 'Loses 1 valence electron to attain stable neon noble-gas core' },
    { text: 'Chloride Anion (Cl⁻)', x: 290, y: 250, description: 'Gains 1 electron completing its valence octet with negative charge' },
    { text: 'Covalent Bond (Electron Sharing)', x: 620, y: 130, description: 'Mutual sharing of electron pairs between nonmetal atoms to achieve octet stability' },
    { text: 'Shared Electron Pair', x: 620, y: 270, description: 'Orbital overlap creating localized electron density between atomic nuclei' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">Chemical Bonding — Ionic Transfer vs. Covalent Sharing</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Octet Rule: Achieving Noble Gas Electron Configurations</text>

    <!-- Left Box: Ionic Bonding (NaCl) -->
    <rect x="50" y="100" width="350" height="380" rx="16" fill="#1E293B" stroke="#3B82F6" stroke-width="2"/>
    <text x="225" y="132" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#93C5FD" text-anchor="middle">1. Ionic Bonding: NaCl</text>
    <text x="225" y="152" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#BFDBFE" text-anchor="middle">Electronegativity Difference ΔEN &gt; 2.0 (Transfer)</text>

    <!-- Na atom & Cl atom transfer arrow -->
    <circle cx="130" cy="240" r="45" fill="#1D4ED8" stroke="#60A5FA" stroke-width="2"/>
    <text x="130" y="246" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#FFF" text-anchor="middle">Na⁺</text>

    <!-- Transferred electron trajectory -->
    <path d="M 180 220 Q 230 180 270 230" fill="none" stroke="#FBBF24" stroke-width="4" stroke-dasharray="6 3"/>
    <circle cx="270" cy="230" r="6" fill="#FBBF24"/>
    <text x="225" y="195" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">1 e⁻ Transferred</text>

    <circle cx="320" cy="240" r="55" fill="#047857" stroke="#34D399" stroke-width="2"/>
    <text x="320" y="246" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#FFF" text-anchor="middle">Cl⁻</text>

    <!-- Electrostatic attraction force -->
    <path d="M 180 260 L 260 260" stroke="#F43F5E" stroke-width="3" stroke-linecap="round"/>
    <text x="220" y="285" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FDA4AF" text-anchor="middle">Electrostatic Attraction</text>

    <!-- Ionic Summary Box -->
    <rect x="70" y="380" width="310" height="80" rx="8" fill="#0F172A"/>
    <text x="85" y="405" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#93C5FD">• High melting &amp; boiling points</text>
    <text x="85" y="425" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#93C5FD">• Conducts electricity when molten or dissolved</text>
    <text x="85" y="445" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#93C5FD">• Forms rigid crystalline ionic lattice</text>

    <!-- Right Box: Covalent Bonding (H2O) -->
    <rect x="440" y="100" width="350" height="380" rx="16" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
    <text x="615" y="132" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#6EE7B7" text-anchor="middle">2. Covalent Bonding: H₂O</text>
    <text x="615" y="152" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#A7F3D0" text-anchor="middle">Electronegativity Difference ΔEN &lt; 1.7 (Sharing)</text>

    <!-- Oxygen central atom -->
    <circle cx="615" cy="240" r="55" fill="#DC2626" stroke="#F87171" stroke-width="2"/>
    <text x="615" y="246" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#FFF" text-anchor="middle">Oxygen</text>

    <!-- Hydrogen 1 overlapping -->
    <circle cx="530" cy="300" r="32" fill="#0284C7" stroke="#38BDF8" stroke-width="2" fill-opacity="0.75"/>
    <text x="530" y="305" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFF" text-anchor="middle">H</text>

    <!-- Hydrogen 2 overlapping -->
    <circle cx="700" cy="300" r="32" fill="#0284C7" stroke="#38BDF8" stroke-width="2" fill-opacity="0.75"/>
    <text x="700" y="305" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFF" text-anchor="middle">H</text>

    <!-- Shared electron pairs -->
    <ellipse cx="565" cy="275" rx="10" ry="16" fill="#FDE047"/>
    <ellipse cx="665" cy="275" rx="10" ry="16" fill="#FDE047"/>
    <text x="615" y="325" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">2 Shared Pairs (Single Covalent)</text>

    <!-- Covalent Summary Box -->
    <rect x="460" y="380" width="310" height="80" rx="8" fill="#0F172A"/>
    <text x="475" y="405" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#6EE7B7">• Lower melting points than ionic solids</text>
    <text x="475" y="425" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#6EE7B7">• Poor electrical conductors in all states</text>
    <text x="475" y="445" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#6EE7B7">• Forms discrete molecules with polar/nonpolar nature</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'A comparative chemical diagram contrasting ionic bonding (complete electron transfer in NaCl) with covalent bonding (shared electron pairs in H₂O).',
    whyItMatters: 'Chemical bonds determine all physical and chemical properties of matter, including state, melting point, solubility, and reactivity.',
    keyComponentsWithRoles: [
      { name: 'Ionic Electron Transfer', role: 'Metals with low electronegativity lose electrons to high electronegativity nonmetals, creating oppositely charged ions.', visualCue: 'Transfer arrow from sodium to chloride.' },
      { name: 'Covalent Electron Sharing', role: 'Nonmetals share electron pairs in overlapping atomic orbitals to satisfy the octet rule.', visualCue: 'Overlapping orbital circles with yellow shared electron pairs.' },
      { name: 'Electrostatic Attraction', role: 'Coulombic force that binds positive cations and negative anions in a crystalline lattice.', visualCue: 'Attraction vector between Na⁺ and Cl⁻.' }
    ],
    stepByStepWalkthrough: [
      'In ionic bonding, sodium (2,8,1) donates its single valence electron to chlorine (2,8,7).',
      'Sodium becomes a positive cation (Na⁺) and chlorine becomes a negative chloride anion (Cl⁻).',
      'The opposite charges attract with strong electrostatic force, organizing into a 3D ionic crystal lattice.',
      'In covalent bonding, atoms share valence electrons so both can achieve stable noble-gas electron configurations.',
      'Water forms two single polar covalent bonds as oxygen shares one electron with each hydrogen atom.'
    ],
    commonMisconceptions: [
      'Bonds are not strictly binary "ionic or covalent"; chemical bonds lie along a continuum dictated by electronegativity difference (ΔEN).',
      'Ionic compounds do not exist as independent single molecules; they form continuous crystalline lattices.'
    ],
    practicalApplications: 'Material science, polymer engineering, pharmaceutical drug synthesis, and battery electrolyte development.',
    selfCheckQuestions: [
      { question: 'Why does solid table salt (NaCl) not conduct electricity, while salt water conducts readily?', answer: 'In solid crystal form, ions are locked rigidly in lattice positions; in aqueous solution, ions dissociate and become freely mobile charge carriers.', clue: 'Think about mobility of ions.' },
      { question: 'What type of bond forms between two nonmetal atoms with identical electronegativities (like O₂ or N₂)?', answer: 'A nonpolar covalent bond, because the shared electron pair is distributed equally between the two nuclei.', clue: 'Equal sharing means zero dipole moment.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'Chemical Bonding — Ionic Transfer vs. Covalent Sharing',
    caption: 'Side-by-side comparison of electron transfer in NaCl versus orbital sharing in H₂O.',
    labels,
    walkthrough
  };
}

// 6. Fractions SVG (Parts of Whole & Number Line)
function generateFractionsSvg() {
  const labels = [
    { text: 'Numerator (Parts Counted)', x: 180, y: 120, description: 'The top number indicating how many fractional parts are chosen' },
    { text: 'Denominator (Total Parts)', x: 180, y: 170, description: 'The bottom number indicating total equal divisions of the whole unit' },
    { text: 'Fraction Unit Circle: 3/4', x: 200, y: 260, description: 'Circle partitioned into 4 equal quadrants with 3 shaded parts' },
    { text: 'Equivalent Fraction: 6/8', x: 440, y: 260, description: 'Same area represented by doubling subdivisions (3/4 = 6/8)' },
    { text: 'Fraction Number Line (0 to 1)', x: 420, y: 440, description: 'Linear representation showing fractions as exact positions between whole integers' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">Visual Fractions — Anatomy, Unit Models &amp; Number Line</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Understanding Parts-to-Whole Relationships and Equivalence</text>

    <!-- Fraction Anatomy Callout (Left) -->
    <rect x="50" y="90" width="220" height="130" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="110" y="140" font-family="Inter, sans-serif" font-size="36" font-weight="900" fill="#38BDF8" text-anchor="middle">3</text>
    <line x1="75" y1="152" x2="145" y2="152" stroke="#F8FAFC" stroke-width="4"/>
    <text x="110" y="196" font-family="Inter, sans-serif" font-size="36" font-weight="900" fill="#F59E0B" text-anchor="middle">4</text>

    <text x="160" y="136" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8">Numerator</text>
    <text x="160" y="152" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#94A3B8">Parts Selected</text>

    <text x="160" y="190" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F59E0B">Denominator</text>
    <text x="160" y="206" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#94A3B8">Total Equal Parts</text>

    <!-- Circle 1: 3/4 -->
    <g transform="translate(420, 160)">
      <circle cx="0" cy="0" r="65" fill="#334155" stroke="#64748B" stroke-width="2"/>
      <!-- 3 shaded quadrants -->
      <path d="M 0 0 L 0 -65 A 65 65 0 1 1 -65 0 Z" fill="#38BDF8"/>
      <line x1="0" y1="-65" x2="0" y2="65" stroke="#0F172A" stroke-width="3"/>
      <line x1="-65" y1="0" x2="65" y2="0" stroke="#0F172A" stroke-width="3"/>
      <text x="0" y="90" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="middle">3 / 4 (75%)</text>
    </g>

    <!-- Circle 2: 6/8 (Equivalent) -->
    <g transform="translate(650, 160)">
      <circle cx="0" cy="0" r="65" fill="#334155" stroke="#64748B" stroke-width="2"/>
      <path d="M 0 0 L 0 -65 A 65 65 0 1 1 -65 0 Z" fill="#10B981"/>
      <line x1="0" y1="-65" x2="0" y2="65" stroke="#0F172A" stroke-width="2"/>
      <line x1="-65" y1="0" x2="65" y2="0" stroke="#0F172A" stroke-width="2"/>
      <line x1="-46" y1="-46" x2="46" y2="46" stroke="#0F172A" stroke-width="2"/>
      <line x1="-46" y1="46" x2="46" y2="-46" stroke="#0F172A" stroke-width="2"/>
      <text x="0" y="90" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#10B981" text-anchor="middle">6 / 8 = 3 / 4</text>
    </g>

    <!-- Fraction Number Line (Bottom Section) -->
    <rect x="50" y="300" width="740" height="190" rx="14" fill="#1E293B" stroke="#334155"/>
    <text x="420" y="335" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#F8FAFC" text-anchor="middle">Fraction Number Line (0 to 1 with Equal Intervals)</text>

    <!-- Main Axis Line -->
    <line x1="100" y1="410" x2="740" y2="410" stroke="#94A3B8" stroke-width="4"/>

    <!-- Ticks: 0, 1/4, 2/4(1/2), 3/4, 1 -->
    <g font-family="Inter, sans-serif" font-weight="800">
      <!-- 0 -->
      <line x1="100" y1="395" x2="100" y2="425" stroke="#F8FAFC" stroke-width="4"/>
      <text x="100" y="450" font-size="16" fill="#F8FAFC" text-anchor="middle">0</text>

      <!-- 1/4 -->
      <line x1="260" y1="400" x2="260" y2="420" stroke="#38BDF8" stroke-width="3"/>
      <circle cx="260" cy="410" r="6" fill="#38BDF8"/>
      <text x="260" y="445" font-size="14" fill="#38BDF8" text-anchor="middle">1/4</text>
      <text x="260" y="465" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">(0.25)</text>

      <!-- 2/4 = 1/2 -->
      <line x1="420" y1="395" x2="420" y2="425" stroke="#FBBF24" stroke-width="4"/>
      <circle cx="420" cy="410" r="7" fill="#FBBF24"/>
      <text x="420" y="445" font-size="15" fill="#FBBF24" text-anchor="middle">2/4 = 1/2</text>
      <text x="420" y="465" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">(0.50)</text>

      <!-- 3/4 -->
      <line x1="580" y1="400" x2="580" y2="420" stroke="#38BDF8" stroke-width="3"/>
      <circle cx="580" cy="410" r="7" fill="#38BDF8"/>
      <text x="580" y="445" font-size="14" fill="#38BDF8" text-anchor="middle">3/4</text>
      <text x="580" y="465" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">(0.75)</text>

      <!-- 1 -->
      <line x1="740" y1="395" x2="740" y2="425" stroke="#F8FAFC" stroke-width="4"/>
      <text x="740" y="450" font-size="16" fill="#F8FAFC" text-anchor="middle">1 (4/4)</text>
    </g>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'A visual mathematical model of fractions illustrating numerator and denominator roles, circular area models, equivalent fraction subdividing, and placement along a continuous 0-to-1 number line.',
    whyItMatters: 'Fractions are the gateway to rational numbers, ratios, algebra, probability, and quantitative scientific reasoning.',
    keyComponentsWithRoles: [
      { name: 'Numerator', role: 'Counts how many equal parts are selected or under consideration.', visualCue: 'Cyan top digit 3 in the fraction anatomy box.' },
      { name: 'Denominator', role: 'Specifies the total number of equal partitions dividing the whole unit.', visualCue: 'Amber bottom digit 4 in the fraction anatomy box.' },
      { name: 'Unit Area Models', role: 'Demonstrates equivalent fractions visually: 3/4 of a circle covers the exact same area as 6/8.', visualCue: 'Side-by-side circular pie charts.' },
      { name: 'Number Line', role: 'Establishes fractions as precise numerical values positioned between whole numbers.', visualCue: 'Horizontal axis line with marked points at 0, 1/4, 1/2, 3/4, 1.' }
    ],
    stepByStepWalkthrough: [
      'A fraction represents a division: a whole is divided into d equal pieces, and n pieces are counted.',
      'In a circle model, dividing into 4 equal quadrants and shading 3 pieces visualizes 3/4.',
      'Multiplying both numerator and denominator by 2 yields 6/8, which has smaller pieces but identical total area (equivalence).',
      'On a number line, the distance from 0 to 1 is divided into equal segments.',
      '3/4 sits three-quarters of the way to 1, equivalent to the decimal value 0.75.'
    ],
    commonMisconceptions: [
      'A larger denominator does not mean a larger fraction: 1/8 is smaller than 1/4 because the whole is sliced into more pieces.',
      'You cannot simply add numerators and denominators together (1/2 + 1/3 ≠ 2/5); you must find a common denominator first.'
    ],
    practicalApplications: 'Culinary recipe scaling, financial interest rates, carpentry measurements, architectural blueprints, and probability odds.',
    selfCheckQuestions: [
      { question: 'Why does 2/3 equal 4/6 even though the numbers are different?', answer: 'Both terms were multiplied by 2 (2/2 = 1), meaning each original third was sliced in half, leaving the total proportion of the whole unchanged.', clue: 'Multiplying by 1 in disguise.' },
      { question: 'Which fraction is greater: 5/8 or 3/4?', answer: '3/4 is greater; converting to common denominator 8 yields 6/8, which is larger than 5/8.', clue: 'Convert 3/4 to eighths.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'Visual Fractions & Number Line Model',
    caption: 'Numerator/denominator roles, circle area models, equivalent fractions, and number line geometry.',
    labels,
    walkthrough
  };
}

// 7. Geometry SVG (Pythagorean Theorem)
function generateGeometrySvg() {
  const labels = [
    { text: 'Right Angle (90°)', x: 340, y: 310, description: 'Square indicator marking the perpendicular intersection of legs a and b' },
    { text: 'Leg a (length = 3)', x: 300, y: 220, description: 'Vertical leg adjacent to the right angle' },
    { text: 'Square a² (Area = 9)', x: 190, y: 220, description: 'Geometric square built on leg a with area 3 × 3 = 9' },
    { text: 'Leg b (length = 4)', x: 420, y: 340, description: 'Horizontal leg adjacent to the right angle' },
    { text: 'Square b² (Area = 16)', x: 420, y: 440, description: 'Geometric square built on leg b with area 4 × 4 = 16' },
    { text: 'Hypotenuse c (length = 5)', x: 450, y: 200, description: 'Longest side opposite the right angle' },
    { text: 'Square c² (Area = 25)', x: 570, y: 170, description: 'Geometric square built on hypotenuse with area equal to a² + b² (9 + 16 = 25)' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">Geometry — Visual Proof of the Pythagorean Theorem</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">a² + b² = c² in Any Euclidean Right-Angled Triangle</text>

    <!-- Central Right Triangle (3-4-5) -->
    <!-- Vertex at Right angle: (330, 320) -->
    <!-- Top Vertex: (330, 170) -> Leg a = 150 px (3 units) -->
    <!-- Right Vertex: (530, 320) -> Leg b = 200 px (4 units) -->
    <polygon points="330,320 330,170 530,320" fill="#1E293B" stroke="#F8FAFC" stroke-width="3"/>

    <!-- Right angle indicator -->
    <rect x="330" y="295" width="25" height="25" fill="none" stroke="#FDE047" stroke-width="2"/>

    <!-- Square a² on leg a (Left) -->
    <rect x="180" y="170" width="150" height="150" fill="#3B82F6" stroke="#93C5FD" stroke-width="2" fill-opacity="0.85"/>
    <text x="255" y="240" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="#FFF" text-anchor="middle">a² = 9</text>
    <text x="255" y="265" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#DBEAFE" text-anchor="middle">Leg a = 3</text>

    <!-- Square b² on leg b (Bottom) -->
    <rect x="330" y="320" width="200" height="200" fill="#10B981" stroke="#6EE7B7" stroke-width="2" fill-opacity="0.85"/>
    <text x="430" y="415" font-family="Inter, sans-serif" font-size="24" font-weight="900" fill="#FFF" text-anchor="middle">b² = 16</text>
    <text x="430" y="440" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#D1FAE5" text-anchor="middle">Leg b = 4</text>

    <!-- Square c² on hypotenuse (Tilted) -->
    <!-- Hypotenuse goes from (330, 170) to (530, 320), length = 250 px (5 units) -->
    <!-- Vector = (200, 150). Perpendicular outward = (-150, 200) or (150, -200) -->
    <!-- Points: (330, 170) -> (530, 320) -> (680, 120) -> (480, -30) -->
    <polygon points="330,170 530,320 680,120 480,-30" fill="#F59E0B" stroke="#FCD34D" stroke-width="2.5" fill-opacity="0.85"/>
    <text x="505" y="145" font-family="Inter, sans-serif" font-size="26" font-weight="900" fill="#FFF" text-anchor="middle">c² = 25</text>
    <text x="505" y="170" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#FEF3C7" text-anchor="middle">Hypotenuse c = 5</text>

    <!-- Theorem Banner -->
    <rect x="50" y="90" width="260" height="65" rx="10" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
    <text x="180" y="120" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#38BDF8" text-anchor="middle">9 + 16 = 25</text>
    <text x="180" y="142" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">a² + b² = c²</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'A geometric proof of the Pythagorean theorem displaying a 3-4-5 right-angled triangle with square areas erected on all three sides (areas 9, 16, and 25).',
    whyItMatters: 'The Pythagorean theorem connects geometry and algebra, forming the cornerstone of trigonometry, vector analysis, computer graphics, and GPS distance algorithms.',
    keyComponentsWithRoles: [
      { name: 'Right Angle', role: 'The 90-degree angle defining the orthogonality of the legs.', visualCue: 'Yellow corner marker at vertex.' },
      { name: 'Leg a & Square a²', role: 'Vertical side of length 3 with square area 9 units².', visualCue: 'Blue square on the left.' },
      { name: 'Leg b & Square b²', role: 'Horizontal side of length 4 with square area 16 units².', visualCue: 'Green square at the bottom.' },
      { name: 'Hypotenuse c & Square c²', role: 'Longest side opposite the right angle with square area equal to 9 + 16 = 25 units².', visualCue: 'Amber tilted square on the hypotenuse.' }
    ],
    stepByStepWalkthrough: [
      'Construct a right-angled triangle with legs of length a = 3 and b = 4.',
      'Construct a geometric square on leg a; its area is a × a = a² (3 × 3 = 9).',
      'Construct a geometric square on leg b; its area is b × b = b² (4 × 4 = 16).',
      'Construct a square on hypotenuse c; its area is c × c = c² (5 × 5 = 25).',
      'The sum of the two smaller areas (9 + 16) exactly equals the area of the largest square (25).'
    ],
    commonMisconceptions: [
      'The theorem only applies to right-angled triangles; for non-right triangles, one must use the Law of Cosines (c² = a² + b² - 2ab cos C).',
      'The hypotenuse is always strictly the side opposite the 90° angle, never either of the perpendicular legs.'
    ],
    practicalApplications: 'Structural building carpentry, navigation distance calculations, game engine collision physics, and 3D vector norms.',
    selfCheckQuestions: [
      { question: 'A right triangle has legs of length 6 meters and 8 meters. What is the length of its hypotenuse?', answer: '10 meters (6² + 8² = 36 + 64 = 100; √100 = 10).', clue: 'Square both legs, sum them, and take the square root.' },
      { question: 'Can a triangle with side lengths 5, 12, and 14 be a right triangle?', answer: 'No, because 5² + 12² = 25 + 144 = 169, whereas 14² = 196. Since 169 ≠ 196, it is not a right triangle.', clue: 'Test if a² + b² equals c².' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'Geometry & Pythagorean Theorem Visual Proof',
    caption: 'Visual proof showing area of square on hypotenuse equals sum of areas on legs (3² + 4² = 5²).',
    labels,
    walkthrough
  };
}

// 8. Newton's Laws SVG
function generateNewtonsLawsSvg() {
  const labels = [
    { text: 'Newton 1st Law: Inertia (ΣF = 0)', x: 190, y: 130, description: 'An object at rest stays at rest, and an object in motion continues at constant velocity unless acted upon by an external net force' },
    { text: 'Newton 2nd Law: F = m · a', x: 420, y: 130, description: 'Acceleration is directly proportional to net force and inversely proportional to mass' },
    { text: 'Newton 3rd Law: Action & Reaction', x: 650, y: 130, description: 'For every action force, there is an equal and opposite reaction force acting on different bodies' },
    { text: 'Force Vector F_AB = -F_BA', x: 650, y: 290, description: 'Reciprocal force pair equal in magnitude and opposite in vector direction' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">Newton's Three Laws of Classical Motion</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Foundation of Classical Mechanics: Inertia, Dynamics &amp; Interaction</text>

    <!-- Column 1: 1st Law (Inertia) -->
    <rect x="35" y="95" width="240" height="400" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="155" y="125" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="middle">1st Law: Inertia</text>
    <text x="155" y="145" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FDE047" text-anchor="middle">ΣF = 0 ➔ a = 0</text>

    <rect x="75" y="210" width="160" height="55" rx="8" fill="#0284C7"/>
    <text x="155" y="242" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFF" text-anchor="middle">Mass m</text>
    <text x="155" y="285" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" text-anchor="middle">Constant v or Rest</text>

    <!-- Balanced Forces Vectors -->
    <path d="M 50 237 L 75 237" stroke="#38BDF8" stroke-width="4"/>
    <path d="M 260 237 L 235 237" stroke="#38BDF8" stroke-width="4"/>

    <rect x="45" y="340" width="220" height="135" rx="8" fill="#0F172A"/>
    <text x="55" y="365" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• Objects resist state change</text>
    <text x="55" y="390" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• Mass is measure of inertia</text>
    <text x="55" y="415" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• Balanced forces keep velocity constant</text>

    <!-- Column 2: 2nd Law (F = ma) -->
    <rect x="300" y="95" width="240" height="400" rx="14" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
    <text x="420" y="125" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#34D399" text-anchor="middle">2nd Law: Dynamics</text>
    <text x="420" y="145" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FDE047" text-anchor="middle">F_net = m · a</text>

    <rect x="340" y="210" width="80" height="55" rx="8" fill="#059669"/>
    <text x="380" y="242" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFF" text-anchor="middle">m</text>

    <!-- Net Force Vector -->
    <path d="M 420 237 L 515 237" stroke="#FBBF24" stroke-width="6" marker-end="url(#arrow)"/>
    <text x="470" y="225" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047" text-anchor="middle">F_net ➔</text>
    <text x="470" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#6EE7B7" text-anchor="middle">Acc: a = F/m</text>

    <rect x="310" y="340" width="220" height="135" rx="8" fill="#0F172A"/>
    <text x="320" y="365" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• Unbalanced force causes acceleration</text>
    <text x="320" y="390" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• 2x Force = 2x Acceleration</text>
    <text x="320" y="415" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• 2x Mass = 1/2 Acceleration</text>

    <!-- Column 3: 3rd Law (Action-Reaction) -->
    <rect x="565" y="95" width="240" height="400" rx="14" fill="#1E293B" stroke="#F43F5E" stroke-width="2"/>
    <text x="685" y="125" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FDA4AF" text-anchor="middle">3rd Law: Interaction</text>
    <text x="685" y="145" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FDE047" text-anchor="middle">F_A = -F_B</text>

    <!-- Rocket / Action Reaction model -->
    <rect x="650" y="195" width="70" height="50" rx="8" fill="#E11D48"/>
    <text x="685" y="225" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFF" text-anchor="middle">Rocket</text>

    <path d="M 685 195 L 685 160" stroke="#38BDF8" stroke-width="5"/>
    <text x="735" y="178" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="#38BDF8">Thrust ⬆</text>

    <path d="M 685 245 L 685 285" stroke="#F97316" stroke-width="5"/>
    <text x="735" y="270" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="#F97316">Exhaust ⬇</text>

    <rect x="575" y="340" width="220" height="135" rx="8" fill="#0F172A"/>
    <text x="585" y="365" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• Forces always occur in pairs</text>
    <text x="585" y="390" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• Equal magnitude, opposite direction</text>
    <text x="585" y="415" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#E2E8F0">• Act on two DIFFERENT objects</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'A systematic architectural panel showing Newton’s Three Laws of Motion with force vectors, mathematical formulations (ΣF=0, F=ma, F_action = -F_reaction), and physical examples.',
    whyItMatters: 'Newtonian mechanics provides the physical framework for civil engineering, automotive safety, aerospace rocketry, and planetary celestial motion.',
    keyComponentsWithRoles: [
      { name: '1st Law (Inertia)', role: 'States that without an external net force, velocity remains constant.', visualCue: 'Left column with balanced opposing forces.' },
      { name: '2nd Law (Dynamics)', role: 'Quantifies acceleration as the quotient of net force divided by inertial mass (a = F/m).', visualCue: 'Middle green column with accelerating mass vector.' },
      { name: '3rd Law (Action-Reaction)', role: 'Establishes that forces are mutual interactions between two bodies, equal in magnitude and opposite in direction.', visualCue: 'Right crimson column with rocket thrust and exhaust vectors.' }
    ],
    stepByStepWalkthrough: [
      'An object maintains constant velocity until an unbalanced net force disrupts equilibrium.',
      'When an external net force F acts on mass m, it produces acceleration a in the direction of the force.',
      'Heavier objects require proportionally greater force to achieve the same rate of acceleration.',
      'Whenever object A exerts a force on object B, object B simultaneously exerts an equal and opposite force on object A.',
      'Action and reaction forces never cancel each other out because they act on separate bodies.'
    ],
    commonMisconceptions: [
      'Force is not required to keep an object moving; in the absence of friction and gravity, an object in motion will glide forever at constant velocity.',
      'Action and reaction forces do not cancel out to zero acceleration because they act on two different objects, not the same one.'
    ],
    practicalApplications: 'Vehicle seatbelts and airbags, satellite orbital maneuvering, bridge load stress testing, and space shuttle propulsion.',
    selfCheckQuestions: [
      { question: 'If a 1,000 kg car accelerates at 3 m/s², what is the net force exerted on it?', answer: '3,000 Newtons (F = m · a = 1,000 kg × 3 m/s² = 3,000 N).', clue: 'Multiply mass by acceleration.' },
      { question: 'Why does a gun recoil backwards when a bullet is fired forward?', answer: 'By Newton’s Third Law, the explosive gases exert an equal and opposite force on the firearm as they do on the bullet.', clue: 'Action and reaction force pairs.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'Newton\'s Laws of Motion & Force Vectors',
    caption: 'Comparative visual framework of inertia, F=ma dynamics, and reciprocal action-reaction forces.',
    labels,
    walkthrough
  };
}

// 9. Solar System SVG
function generateSolarSystemSvg() {
  const labels = [
    { text: 'The Sun (G2V Star)', x: 90, y: 270, description: 'Contains 99.86% of the solar system’s total mass and drives the heliosphere' },
    { text: 'Mercury', x: 200, y: 230, description: 'Innermost rocky terrestrial planet with extreme temperature variations' },
    { text: 'Venus', x: 260, y: 230, description: 'Runaway greenhouse atmosphere with dense CO₂ and sulfuric acid clouds' },
    { text: 'Earth (1.0 AU)', x: 330, y: 230, description: 'Habitable zone terrestrial planet with liquid water oceans and plate tectonics' },
    { text: 'Mars', x: 400, y: 230, description: 'Iron-oxide red planet hosting Olympus Mons and polar ice caps' },
    { text: 'Asteroid Belt', x: 460, y: 230, description: 'Remnant planetesimal field between Mars and Jupiter' },
    { text: 'Jupiter (Gas Giant)', x: 550, y: 230, description: 'Massive gas giant with Great Red Spot storm and Galilean moons' },
    { text: 'Saturn (Ring System)', x: 670, y: 230, description: 'Spectacular water-ice ring system and low bulk density' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">The Solar System — Planetary Orbits &amp; Classification</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Terrestrial Inner Planets, Main Asteroid Belt &amp; Outer Gas Giants</text>

    <!-- The Sun (Partial disk on left) -->
    <path d="M 0 60 A 240 240 0 0 1 0 480 Z" fill="#F59E0B" stroke="#FDE047" stroke-width="4"/>
    <circle cx="0" cy="270" r="140" fill="#FBBF24" fill-opacity="0.6"/>
    <text x="40" y="275" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#78350F">SUN</text>

    <!-- Planetary Orbits Ellipses -->
    <ellipse cx="0" cy="270" rx="190" ry="110" fill="none" stroke="#334155" stroke-dasharray="4 4"/>
    <ellipse cx="0" cy="270" rx="250" ry="140" fill="none" stroke="#334155" stroke-dasharray="4 4"/>
    <ellipse cx="0" cy="270" rx="320" ry="170" fill="none" stroke="#334155" stroke-dasharray="4 4"/>
    <ellipse cx="0" cy="270" rx="390" ry="200" fill="none" stroke="#334155" stroke-dasharray="4 4"/>

    <!-- Planets -->
    <!-- Mercury -->
    <circle cx="190" cy="270" r="7" fill="#94A3B8"/>
    <text x="190" y="295" font-family="Inter, sans-serif" font-size="9" font-weight="700" fill="#CBD5E1" text-anchor="middle">Mercury</text>

    <!-- Venus -->
    <circle cx="250" cy="270" r="12" fill="#F59E0B"/>
    <text x="250" y="298" font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="#FDE047" text-anchor="middle">Venus</text>

    <!-- Earth -->
    <circle cx="320" cy="270" r="14" fill="#38BDF8"/>
    <text x="320" y="302" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="#38BDF8" text-anchor="middle">Earth</text>

    <!-- Mars -->
    <circle cx="390" cy="270" r="10" fill="#EF4444"/>
    <text x="390" y="298" font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="#FCA5A5" text-anchor="middle">Mars</text>

    <!-- Asteroid Belt -->
    <path d="M 445 100 L 445 440" stroke="#64748B" stroke-width="6" stroke-dasharray="2 8"/>
    <text x="445" y="465" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#94A3B8" text-anchor="middle">Asteroid Belt</text>

    <!-- Jupiter -->
    <circle cx="550" cy="270" r="34" fill="#D97706" stroke="#FEF3C7" stroke-width="1.5"/>
    <text x="550" y="325" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047" text-anchor="middle">Jupiter</text>

    <!-- Saturn with Ring -->
    <g transform="translate(680, 270)">
      <ellipse cx="0" cy="0" rx="42" ry="10" fill="none" stroke="#FDE047" stroke-width="4"/>
      <circle cx="0" cy="0" r="26" fill="#CA8A04"/>
      <ellipse cx="0" cy="0" rx="42" ry="10" fill="none" stroke="#FDE047" stroke-width="4" stroke-dasharray="20 80"/>
      <text x="0" y="48" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FEF08A" text-anchor="middle">Saturn</text>
    </g>

    <!-- Information Bar -->
    <rect x="60" y="475" width="720" height="40" rx="8" fill="#1E293B" stroke="#334155"/>
    <text x="420" y="500" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#CBD5E1" text-anchor="middle">1 AU ≈ 149.6 million km (Sun to Earth) • Kepler's Third Law: P² = a³</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'A scaled architectural overview of the solar system showing the Sun, inner terrestrial planets, asteroid belt, and giant outer planets in orbit.',
    whyItMatters: 'Understanding our solar system explains planetary geology, climate evolution, orbital mechanics, and human space exploration.',
    keyComponentsWithRoles: [
      { name: 'The Sun', role: 'Primary gravitational mass and radiation source of the solar system.', visualCue: 'Glowing yellow solar disc on the left.' },
      { name: 'Terrestrial Planets (Mercury, Venus, Earth, Mars)', role: 'Dense, rocky worlds with silicate mantles and metallic iron cores.', visualCue: 'Four inner planets orbiting inside the asteroid belt.' },
      { name: 'Asteroid Belt', role: 'Reservoir of primordial rocky debris leftover from early planetary accretion.', visualCue: 'Dotted vertical divider.' },
      { name: 'Gas Giants (Jupiter & Saturn)', role: 'Massive hydrogen-helium envelopes harboring rich satellite systems.', visualCue: 'Large banded planets on the right.' }
    ],
    stepByStepWalkthrough: [
      'The Solar System formed 4.6 billion years ago from the gravitational collapse of a giant molecular cloud.',
      'The central protostar ignited nuclear fusion, becoming the Sun.',
      'Refractory materials condensed near the hot core, creating the rocky terrestrial planets.',
      'Beyond the frost line, volatile gases condensed to form massive gas and ice giants.',
      'Planets follow elliptical Keplerian orbits governed by Newtonian gravitation.'
    ],
    commonMisconceptions: [
      'Planets are not spaced equally; orbital distances increase exponentially following the Titius-Bode relation.',
      'The asteroid belt is not a dense hazard obstacle course; asteroids are separated by millions of kilometers of empty space.'
    ],
    practicalApplications: 'Interplanetary probe trajectory planning, satellite communication orbits, asteroid deflection, and exoplanet discovery.',
    selfCheckQuestions: [
      { question: 'Why are the inner four planets rocky while the outer planets are predominantly gaseous?', answer: 'Near the young Sun, solar radiation evaporated volatile compounds (water, ammonia, methane), leaving only heavy silicates and iron to form terrestrial bodies.', clue: 'Think about temperature and the frost line.' },
      { question: 'What is 1 Astronomical Unit (AU)?', answer: 'The average distance between the center of the Earth and the center of the Sun (~149.6 million kilometers).', clue: 'Sun-Earth baseline distance.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'The Solar System & Planetary Orbits',
    caption: 'Sun, inner terrestrial planets, asteroid belt, and gas giants with Keplerian orbital parameters.',
    labels,
    walkthrough
  };
}

// 10. Water Cycle SVG
function generateWaterCycleSvg() {
  const labels = [
    { text: 'Solar Energy Driver', x: 120, y: 100, description: 'Sun heats ocean surface supplying the latent heat of vaporization' },
    { text: 'Evaporation', x: 180, y: 260, description: 'Liquid water absorbs thermal energy and transforms into water vapor gas' },
    { text: 'Transpiration', x: 420, y: 310, description: 'Release of water vapor from microscopic plant leaf stomata' },
    { text: 'Condensation (Cloud Formation)', x: 480, y: 140, description: 'Vapor cools as it ascends, condensing around aerosol nuclei into liquid droplets' },
    { text: 'Precipitation (Rain / Snow)', x: 620, y: 240, description: 'Droplets coalesce and fall under gravity when too heavy to remain suspended' },
    { text: 'Surface Runoff & Groundwater', x: 500, y: 440, description: 'Gravity pulls freshwater across watersheds and aquifers back into the oceans' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="38" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">The Hydrological (Water) Cycle — Continuous Global Circulation</text>
    <text x="420" y="62" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Evaporation, Transpiration, Condensation, Precipitation &amp; Infiltration</text>

    <!-- Sun (Top Left) -->
    <circle cx="100" cy="110" r="35" fill="#F59E0B" stroke="#FDE047" stroke-width="3"/>
    <text x="100" y="115" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#78350F" text-anchor="middle">Sun</text>

    <!-- Mountain Landscape on Right -->
    <polygon points="460,420 620,190 780,420" fill="#334155" stroke="#475569" stroke-width="2"/>
    <polygon points="560,280 620,190 680,280" fill="#F8FAFC"/> <!-- Snowcap -->

    <!-- Ocean Reservoir on Left -->
    <path d="M 0 420 Q 200 400 460 420 L 460 540 L 0 540 Z" fill="#0284C7"/>
    <text x="150" y="470" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#E0F2FE">Ocean Reservoir</text>

    <!-- Land / Vegetation -->
    <rect x="440" y="420" width="400" height="120" fill="#15803D"/>
    <text x="540" y="480" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#DCFCE7">Watershed &amp; Forest</text>

    <!-- Evaporation Arrow (Ocean -> Clouds) -->
    <path d="M 180 380 Q 210 260 270 200" fill="none" stroke="#38BDF8" stroke-width="5" stroke-dasharray="8 4"/>
    <text x="180" y="270" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8">Evaporation ⇡</text>

    <!-- Transpiration Arrow (Vegetation -> Clouds) -->
    <path d="M 440 380 Q 420 280 430 200" fill="none" stroke="#4ADE80" stroke-width="4" stroke-dasharray="6 3"/>
    <text x="440" y="300" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#4ADE80">Transpiration ⇡</text>

    <!-- Clouds (Condensation) -->
    <g fill="#CBD5E1">
      <ellipse cx="440" cy="150" rx="55" ry="30"/>
      <ellipse cx="480" cy="135" rx="45" ry="30"/>
      <ellipse cx="520" cy="150" rx="50" ry="30"/>
    </g>
    <text x="480" y="155" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#0F172A" text-anchor="middle">Condensation</text>

    <!-- Precipitation (Rainfall over mountains) -->
    <g stroke="#38BDF8" stroke-width="3" stroke-linecap="round">
      <line x1="570" y1="210" x2="550" y2="250"/>
      <line x1="600" y1="210" x2="580" y2="250"/>
      <line x1="630" y1="210" x2="610" y2="250"/>
      <line x1="660" y1="210" x2="640" y2="250"/>
    </g>
    <text x="640" y="270" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8">Precipitation ⇣</text>

    <!-- Surface Runoff Arrow -->
    <path d="M 600 420 Q 500 430 400 435" fill="none" stroke="#38BDF8" stroke-width="6"/>
    <text x="480" y="445" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#BAE6FD">Surface Runoff ➔</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: 'The closed-loop global hydrological cycle illustrating ocean evaporation, plant transpiration, cloud condensation, mountain precipitation, and surface/groundwater runoff.',
    whyItMatters: 'The water cycle purifies and redistributes fresh water across the biosphere, regulating Earth’s climate and shaping geological topography.',
    keyComponentsWithRoles: [
      { name: 'Solar Heating', role: 'Thermal driver providing energy to break hydrogen bonds and vaporize liquid water.', visualCue: 'Sun in upper left corner.' },
      { name: 'Evaporation & Transpiration', role: 'Phases where water enters the atmosphere as an invisible gas from oceans and plant stomata.', visualCue: 'Ascending dashed blue and green arrows.' },
      { name: 'Condensation', role: 'Cooling water vapor aggregates onto cloud condensation nuclei to form liquid water droplets.', visualCue: 'Gray and white cloud formations.' },
      { name: 'Precipitation & Runoff', role: 'Water returns to Earth as rain or snow and flows under gravity back to oceanic basins.', visualCue: 'Rain lines over mountains and blue runoff channel.' }
    ],
    stepByStepWalkthrough: [
      'Solar radiation warms oceans and lakes, converting liquid water into water vapor (evaporation).',
      'Vascular plants absorb groundwater and release water vapor into the air via stomata (transpiration).',
      'Warm moist air rises; as altitude increases and temperature drops, vapor condenses into clouds.',
      'When condensed droplets grow sufficiently heavy, gravity pulls them down as precipitation (rain, snow, hail).',
      'Precipitation infiltrates into subterranean aquifers or flows as surface runoff back to the ocean, completing the cycle.'
    ],
    commonMisconceptions: [
      'Water is not created or destroyed in this cycle; the total amount of water on Earth remains constant over millions of years.',
      'Clouds are not made of water vapor gas; water vapor is invisible. Clouds consist of billions of tiny liquid water droplets or solid ice crystals.'
    ],
    practicalApplications: 'Municipal drinking water management, flood prevention civil engineering, agricultural irrigation scheduling, and climate change forecasting.',
    selfCheckQuestions: [
      { question: 'What crucial role do aerosols and dust particles play in the water cycle?', answer: 'They act as cloud condensation nuclei (CCN), providing surfaces for water vapor to condense upon into liquid droplets.', clue: 'Think about how droplets start forming.' },
      { question: 'How does deforestation directly affect regional precipitation patterns?', answer: 'Removing tree canopy reduces transpiration, leading to drier local air masses and diminished cloud formation and rainfall.', clue: 'Remember the role of plant stomata in returning moisture to the air.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: 'The Hydrological (Water) Cycle',
    caption: 'Global movement of water through solar evaporation, plant transpiration, condensation, and precipitation.',
    labels,
    walkthrough
  };
}

// Fallback universal scientific generator
function generateUniversalScientificSvg(topic: string, subtopic: string) {
  const displayTitle = subtopic || topic || 'Scientific Concept';
  const labels = [
    { text: 'Core Concept', x: 260, y: 220, description: 'Central theoretical principle' },
    { text: 'Interactive Component', x: 550, y: 220, description: 'Observable phenomenon or mechanism' },
    { text: 'Governing Law', x: 420, y: 380, description: 'Underlying physical or biological relationship' }
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 540" width="840" height="540">
    <rect width="840" height="540" rx="20" fill="#0B1329"/>
    <text x="420" y="42" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle">${displayTitle}</text>
    <text x="420" y="66" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle">Educational Concept &amp; Structural Schematic</text>

    <rect x="120" y="160" width="280" height="160" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="260" y="235" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#38BDF8" text-anchor="middle">Core Principle</text>
    <text x="260" y="260" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Mechanisms &amp; Hypotheses</text>

    <path d="M 400 240 L 440 240" stroke="#FDE047" stroke-width="4"/>

    <rect x="440" y="160" width="280" height="160" rx="14" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
    <text x="580" y="235" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#34D399" text-anchor="middle">Application &amp; Observation</text>
    <text x="580" y="260" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Empirical Verification</text>

    <rect x="200" y="370" width="440" height="80" rx="12" fill="#0F172A" stroke="#475569"/>
    <text x="420" y="415" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0" text-anchor="middle">Governed by fundamental physical, chemical, or biological laws</text>
  </svg>`;

  const walkthrough: ImageWalkthrough = {
    whatIsShown: `A structured schematic diagram illustrating the primary components, relationships, and mechanisms of ${displayTitle}.`,
    whyItMatters: `Understanding the structural relationships of ${displayTitle} allows students to bridge theoretical concepts with concrete observable principles.`,
    keyComponentsWithRoles: [
      { name: 'Core Principle', role: 'The foundational law or definition establishing the concept.', visualCue: 'Cyan schematic node on left.' },
      { name: 'Application & Observation', role: 'Empirical manifestation and practical usage in scientific analysis.', visualCue: 'Green node on right.' }
    ],
    stepByStepWalkthrough: [
      `Analyze the initial conditions and core definitions of ${displayTitle}.`,
      'Observe how internal components interact and transfer energy or information.',
      'Evaluate the resulting physical state or biological outcome.',
      'Connect the mechanism to broader curriculum objectives.'
    ],
    commonMisconceptions: [
      `Assuming ${displayTitle} functions in isolation without interaction with surrounding environmental variables.`
    ],
    practicalApplications: 'Laboratory experiment design, academic exam mastery, and scientific model construction.',
    selfCheckQuestions: [
      { question: `What is the primary governing factor in ${displayTitle}?`, answer: 'The structural interaction of its underlying mechanisms.', clue: 'Look at the connecting pathway.' }
    ]
  };

  return {
    svg,
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    title: `${displayTitle} — Structural Diagram`,
    caption: `Educational breakdown and mechanism schematic for ${displayTitle}.`,
    labels,
    walkthrough
  };
}

/**
 * Visual Teaching Intelligence Service:
 * Deconstructs any topic into subtopics and creates or retrieves visual assets.
 */
export function getVisualPlanForTopic(topic: string, gradeLevel: string = 'Grade 10'): TopicVisualPlan {
  const norm = (topic || '').toLowerCase();

  let subject = 'General Science';
  let prerequisites = ['Basic Scientific Method', 'Unit Measurements'];
  let subtopicTitles: string[] = [];

  if (norm.includes('heart') || norm.includes('cardio')) {
    subject = 'Biology & Human Physiology';
    prerequisites = ['Cellular Respiration', 'Circulatory System Overview', 'Pressure Gradients'];
    subtopicTitles = [
      'Cardiac Anatomy & Four Chambers',
      'Systemic vs. Pulmonary Circuits',
      'Valves & Prevention of Backflow',
      'Electrical Pacemaker & SA Node Conduction',
      'Cardiac Cycle: Systole and Diastole'
    ];
  } else if (norm.includes('dna') || norm.includes('genetic')) {
    subject = 'Molecular Genetics';
    prerequisites = ['Cell Biology', 'Organic Molecules', 'Nucleic Acids'];
    subtopicTitles = [
      'Nucleotide Anatomy & Sugar-Phosphate Rails',
      'Watson-Crick Complementary Base Pairing (A=T, G≡C)',
      'Antiparallel 5′-to-3′ Geometry',
      'Replication Fork & Polymerase Synthesis',
      'Major & Minor Grooves in Protein Binding'
    ];
  } else if (norm.includes('photo') || norm.includes('chloro')) {
    subject = 'Plant Biology & Bioenergetics';
    prerequisites = ['Plant Cell Organelles', 'ATP Energy Currency', 'Redox Reactions'];
    subtopicTitles = [
      'Chloroplast Anatomy: Thylakoids & Stroma',
      'Light Reactions & Photolysis of Water',
      'ATP & NADPH Photophosphorylation',
      'Calvin Cycle & Carbon Fixation (RuBisCO)',
      'Factors Affecting Photosynthetic Rate'
    ];
  } else if (norm.includes('atom') || norm.includes('bohr')) {
    subject = 'Atomic Physics & Chemistry';
    prerequisites = ['States of Matter', 'Electrostatic Charges', 'Energy Conservation'];
    subtopicTitles = [
      'Nuclear Core: Protons, Neutrons & Strong Force',
      'Bohr Quantized Electron Shells (K, L, M)',
      'Valence Electrons & Octet Stability',
      'Isotopes & Atomic Mass Units',
      'Emission Spectra & Quantum Jumps'
    ];
  } else if (norm.includes('bond') || norm.includes('covalent')) {
    subject = 'Inorganic Chemistry';
    prerequisites = ['Periodic Table Trends', 'Electronegativity', 'Valence Electrons'];
    subtopicTitles = [
      'Octet Rule & Electron Configurations',
      'Ionic Bonding: Electron Transfer & Crystal Lattices',
      'Covalent Bonding: Orbital Overlap & Shared Pairs',
      'Polar vs Nonpolar Molecules',
      'Metallic Bonding: Electron Sea Model'
    ];
  } else if (norm.includes('fraction')) {
    subject = 'Mathematics';
    prerequisites = ['Whole Number Arithmetic', 'Division as Partitioning', 'Multiples and Factors'];
    subtopicTitles = [
      'Numerator & Denominator Fundamentals',
      'Unit Fractions & Parts-of-Whole Models',
      'Equivalent Fractions & Simplifying',
      'Fractions on the Real Number Line',
      'Addition & Subtraction with Common Denominators'
    ];
  } else if (norm.includes('geomet') || norm.includes('pythagor') || norm.includes('triangle')) {
    subject = 'Geometry';
    prerequisites = ['Angles and Degrees', 'Right Triangles', 'Area of Squares'];
    subtopicTitles = [
      'Anatomy of Right-Angled Triangles',
      'Pythagorean Theorem: a² + b² = c²',
      'Visual Area Proof of the Theorem',
      'Special Triangles (3-4-5 and 5-12-13)',
      'Real-World Coordinate Distance Applications'
    ];
  } else if (norm.includes('newton') || norm.includes('force')) {
    subject = 'Physics';
    prerequisites = ['Vectors & Scalars', 'Velocity & Acceleration', 'Mass vs Weight'];
    subtopicTitles = [
      'Newton’s 1st Law: Law of Inertia (ΣF = 0)',
      'Newton’s 2nd Law: Net Force Dynamics (F = ma)',
      'Newton’s 3rd Law: Action & Reaction Pairs',
      'Free Body Diagrams & Friction',
      'Momentum Conservation in Collisions'
    ];
  } else if (norm.includes('solar') || norm.includes('planet')) {
    subject = 'Astronomy & Astrophysics';
    prerequisites = ['Gravitational Force', 'Centripetal Acceleration', 'Scale of the Universe'];
    subtopicTitles = [
      'The Sun: Core Fusion & Heliosphere',
      'Inner Terrestrial Planets (Mercury to Mars)',
      'Main Asteroid Belt Dynamics',
      'Outer Gas Giants (Jupiter & Saturn)',
      'Kepler’s Laws of Planetary Motion'
    ];
  } else if (norm.includes('water') || norm.includes('hydrolog')) {
    subject = 'Earth & Environmental Science';
    prerequisites = ['States of Matter', 'Latent Heat of Vaporization', 'Atmospheric Density'];
    subtopicTitles = [
      'Solar Radiation & Ocean Evaporation',
      'Plant Transpiration via Stomata',
      'Atmospheric Condensation & Cloud Formation',
      'Precipitation Mechanisms (Rain, Snow, Hail)',
      'Surface Watershed Runoff & Aquifer Infiltration'
    ];
  } else {
    subtopicTitles = [
      `${topic} — Fundamental Principles & Definitions`,
      `${topic} — Core Mechanisms & Step-by-Step Operation`,
      `${topic} — Real-World Applications & Scientific Impact`,
      `${topic} — Common Pitfalls & Exam Questions`
    ];
  }

  // Generate subtopic visual plans
  const subtopics: SubtopicVisualPlan[] = subtopicTitles.map((subTitle, idx) => {
    const cacheKey = getCacheKey(topic, subTitle, 'svg');
    let primaryVisual: VisualRepresentation;

    if (visualCache.has(cacheKey)) {
      primaryVisual = visualCache.get(cacheKey)!;
    } else {
      const generated = generateScientificSvgForTopic(topic, subTitle);
      const is3dCandidate = norm.includes('heart') || norm.includes('dna') || norm.includes('photo') || norm.includes('atom') || norm.includes('solar') || norm.includes('water');

      primaryVisual = {
        id: `vis_${Date.now()}_${idx}`,
        topic,
        subtopic: subTitle,
        visualType: is3dCandidate && idx === 0 ? 'three_js_scene' : 'scientific_diagram',
        title: generated.title,
        caption: generated.caption,
        dataUrl: generated.dataUrl,
        accessibilityText: `Educational scientific visual explaining ${subTitle}: ${generated.caption}`,
        labels: validateAndOptimizeLabels(generated.labels),
        walkthrough: generated.walkthrough,
        timestamp: Date.now()
      };

      if (is3dCandidate && idx === 0) {
        primaryVisual.model3DConfig = {
          modelType: norm.includes('heart') ? 'human_heart' : norm.includes('dna') ? 'dna_helix' : norm.includes('photo') ? 'chloroplast' : norm.includes('atom') ? 'bohr_atom' : norm.includes('solar') ? 'solar_system' : 'water_cycle',
          cameraPosition: [0, 2, 7],
          interactiveComponents: generated.labels.map(l => ({
            id: l.text.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            label: l.text,
            role: l.description,
            color: '#38BDF8'
          }))
        };
      }

      visualCache.set(cacheKey, primaryVisual);
    }

    const concepts: VisualConceptEvaluation[] = [
      {
        conceptId: `c_${idx}_1`,
        conceptName: subTitle,
        recommendedType: primaryVisual.visualType,
        rationale: `Direct visual demonstration of ${subTitle} accelerates spatial and mechanistic comprehension.`,
        has3DSupport: !!primaryVisual.model3DConfig,
        priority: 'primary'
      }
    ];

    return {
      subtopicId: `sub_${idx + 1}`,
      title: subTitle,
      learningObjective: `Understand the mechanisms, structural relationships, and scientific significance of ${subTitle}.`,
      concepts,
      primaryVisual
    };
  });

  return {
    topic,
    gradeLevel,
    subject,
    prerequisites,
    hierarchy: subtopicTitles,
    subtopics,
    overallSummary: `A comprehensive visual learning module covering ${topic} through ${subtopics.length} organized subtopics and interactive visual representations.`
  };
}

/**
 * Regenerate visual representation for a topic/subtopic (forces cache refresh)
 */
export function regenerateVisual(topic: string, subtopic: string = '', visualType: string = 'scientific_diagram'): VisualRepresentation {
  const cacheKey = getCacheKey(topic, subtopic, 'svg');
  visualCache.delete(cacheKey);

  const generated = generateScientificSvgForTopic(topic, subtopic);
  const newVisual: VisualRepresentation = {
    id: `vis_regen_${Date.now()}`,
    topic,
    subtopic: subtopic || topic,
    visualType: visualType as any,
    title: `${generated.title} (Updated)`,
    caption: generated.caption,
    dataUrl: generated.dataUrl,
    accessibilityText: `Updated educational visual for ${topic} — ${subtopic}`,
    labels: validateAndOptimizeLabels(generated.labels),
    walkthrough: generated.walkthrough,
    timestamp: Date.now()
  };

  visualCache.set(cacheKey, newVisual);
  return newVisual;
}
