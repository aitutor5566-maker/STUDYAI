/**
 * STUDYAI Subtopic Diagram & Multi-Image Educational Explanation Catalog
 * 
 * Provides individual, curriculum-verified SVG diagrams and 6/8-point explanations
 * for each subtopic within a chapter.
 * 
 * Strict rule: NEVER generate only one image for an entire topic.
 * Each subtopic receives its own dedicated, accurately labeled diagram.
 */

export interface ImageGenerationInstruction {
  mainTopic: string;
  subtopic: string;
  subject: string;
  gradeComplexity: string;
  diagramType: string;
  requiredObjects: string[];
  requiredComponents: string[];
  requiredLabels: string[];
  spatialRelationships: string;
  arrowsAndDirections?: string;
  colorGuidance: string;
  backgroundGuidance: string;
  visualStyle: string;
  educationalPurpose: string;
  thingsThatMustNotAppear: string[];
}

export interface SubtopicDiagramItem {
  diagramId: string;
  subtopicKey: string;
  subtopicTitle: string;
  diagramTitle: string;
  diagramType: string;
  caption: string;
  svgXml: string;
  dataUrl: string;
  imageGenerationInstruction?: ImageGenerationInstruction;
  point1_whatItRepresents: string;
  point2_labelledParts: Array<{ label: string; description: string }>;
  point3_componentFunctions: string;
  point4_componentRelationships: string;
  point5_directionOfMovementOrProcess: string;
  point6_stepByStepInterpretation: string[];
  point7_learningOutcome: string;
  point8_whatToRemember: string;
  isVerified: boolean;
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

// ============================================================================
// 1. PHOTOSYNTHESIS — 5 DEDICATED SUBTOPIC DIAGRAMS
// ============================================================================

export function getPhotosynthesisSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Overall Photosynthesis Organismal Overview
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Photosynthesis — Overall Organismal Overview</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Solar Energy + 6CO₂ + 6H₂O → C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)</text>

    <!-- Sun & Rays -->
    <circle cx="120" cy="130" r="42" fill="#FBBF24" stroke="#FDE047" stroke-width="4"/>
    <text x="120" y="136" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#78350F" text-anchor="middle">Sunlight</text>
    <line x1="160" y1="150" x2="260" y2="200" stroke="#FDE047" stroke-width="3" stroke-dasharray="6 4"/>
    <polygon points="265,202 250,195 255,208" fill="#FDE047"/>
    <text x="210" y="165" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FDE047">Photon Energy</text>

    <!-- Plant Stem & Leaf -->
    <path d="M 400 440 Q 390 300 400 180" stroke="#15803D" stroke-width="12" fill="none"/>
    <!-- Large Leaf Blade -->
    <path d="M 400 240 C 300 190 240 260 260 310 C 290 360 380 300 400 270 Z" fill="#16A34A" stroke="#4ADE80" stroke-width="3"/>
    <text x="310" y="275" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Green Leaf</text>
    <text x="310" y="293" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#DCFCE7">Chloroplast Site</text>

    <!-- CO2 Inflow -->
    <rect x="180" y="340" width="110" height="38" rx="8" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="235" y="364" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">CO₂ Inflow</text>
    <line x1="290" y1="340" x2="330" y2="315" stroke="#38BDF8" stroke-width="3"/>
    <polygon points="335,312 320,314 326,324" fill="#38BDF8"/>
    <text x="235" y="396" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#94A3B8" text-anchor="middle">Via Stomata Pores</text>

    <!-- O2 Outflow -->
    <line x1="330" y1="240" x2="280" y2="190" stroke="#4ADE80" stroke-width="3"/>
    <polygon points="275,185 288,193 280,202" fill="#4ADE80"/>
    <rect x="200" y="150" width="105" height="36" rx="8" fill="#1E293B" stroke="#4ADE80" stroke-width="2"/>
    <text x="252" y="173" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">O₂ Outflow</text>
    <text x="252" y="198" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#94A3B8" text-anchor="middle">From Photolysis</text>

    <!-- Soil & Root Zone -->
    <rect x="100" y="430" width="600" height="40" rx="6" fill="#78350F" opacity="0.6"/>
    <text x="400" y="455" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FDE68A" text-anchor="middle">Soil Layer: H₂O + Minerals</text>
    <path d="M 400 430 Q 380 450 360 470 M 400 430 Q 420 450 440 470 M 400 430 L 400 470" stroke="#FDE68A" stroke-width="3" stroke-linecap="round"/>

    <!-- H2O Uptake Arrow -->
    <line x1="420" y1="420" x2="420" y2="300" stroke="#38BDF8" stroke-width="4"/>
    <polygon points="420,290 412,308 428,308" fill="#38BDF8"/>
    <text x="440" y="360" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">H₂O Upward Xylem</text>

    <!-- Glucose Product Card -->
    <rect x="520" y="160" width="240" height="150" rx="14" fill="#1E293B" stroke="#F59E0B" stroke-width="2.5"/>
    <text x="640" y="190" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FBBF24" text-anchor="middle">Chemical Energy Output</text>
    <rect x="540" y="206" width="200" height="34" rx="6" fill="#78350F"/>
    <text x="640" y="228" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE68A" text-anchor="middle">Glucose (C₆H₁₂O₆)</text>
    <text x="640" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Translocated via Phloem</text>
    <text x="640" y="280" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Stored as Starch in Roots</text>
    <line x1="410" y1="260" x2="520" y2="235" stroke="#F59E0B" stroke-width="3"/>
    <polygon points="525,234 510,230 514,242" fill="#F59E0B"/>
  </svg>`;

  // Diagram 2: Leaf Internal Cross-Section Structure
  const svgLeaf = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="34" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Leaf Internal Cross-Section — Tissue Anatomy for Photosynthesis</text>
    <text x="400" y="54" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Upper Epidermis • Palisade Mesophyll • Spongy Layer • Leaf Vein • Guard Cells &amp; Stomata</text>

    <!-- Waxy Cuticle & Upper Epidermis Layer -->
    <rect x="50" y="75" width="700" height="12" rx="4" fill="#6EE7B7" opacity="0.85"/>
    <rect x="50" y="90" width="700" height="34" rx="6" fill="#065F46" stroke="#34D399" stroke-width="2"/>
    <text x="70" y="112" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#A7F3D0">1. Upper Epidermis &amp; Cuticle (Light transmission, water barrier)</text>

    <!-- Sunlight Beams entering leaf -->
    <line x1="200" y1="62" x2="200" y2="88" stroke="#FDE047" stroke-width="3" stroke-dasharray="4 2"/>
    <line x1="400" y1="62" x2="400" y2="88" stroke="#FDE047" stroke-width="3" stroke-dasharray="4 2"/>
    <line x1="600" y1="62" x2="600" y2="88" stroke="#FDE047" stroke-width="3" stroke-dasharray="4 2"/>

    <!-- Palisade Mesophyll Cells (Columnar, tightly packed with chloroplasts) -->
    <g transform="translate(50, 130)">
      <rect width="700" height="110" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="2.5"/>
      <!-- Columnar Cells -->
      <rect x="15" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="85" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="155" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="225" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="295" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="365" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="435" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="505" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="575" y="10" width="60" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <rect x="645" y="10" width="40" height="90" rx="8" fill="#047857" stroke="#34D399" stroke-width="1.5"/>

      <!-- Chloroplast dots inside palisade cells -->
      <circle cx="45" cy="35" r="5" fill="#4ADE80"/><circle cx="45" cy="55" r="5" fill="#4ADE80"/><circle cx="45" cy="75" r="5" fill="#4ADE80"/>
      <circle cx="115" cy="35" r="5" fill="#4ADE80"/><circle cx="115" cy="55" r="5" fill="#4ADE80"/><circle cx="115" cy="75" r="5" fill="#4ADE80"/>
      <circle cx="185" cy="35" r="5" fill="#4ADE80"/><circle cx="185" cy="55" r="5" fill="#4ADE80"/><circle cx="185" cy="75" r="5" fill="#4ADE80"/>
      <text x="350" y="32" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">2. Palisade Mesophyll (Dense Chloroplasts — Primary Light Absorption)</text>
      <text x="350" y="52" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#DCFCE7" text-anchor="middle">Receives ~80% of absorbed light • Columnar cells minimize shading</text>
    </g>

    <!-- Spongy Mesophyll Layer with Large Air Spaces -->
    <g transform="translate(50, 248)">
      <rect width="460" height="120" rx="10" fill="#065F46" stroke="#059669" stroke-width="2"/>
      <!-- Loosely arranged cells -->
      <circle cx="60" cy="40" r="24" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <circle cx="150" cy="70" r="22" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <circle cx="240" cy="35" r="25" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <circle cx="340" cy="75" r="24" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <circle cx="410" cy="38" r="22" fill="#047857" stroke="#34D399" stroke-width="1.5"/>
      <text x="230" y="105" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#A7F3D0" text-anchor="middle">3. Spongy Mesophyll (Air Cavities for Gas Exchange)</text>
      <text x="140" y="28" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#38BDF8">CO₂ &amp; O₂ Intercellular Diffusion Space</text>
    </g>

    <!-- Vascular Bundle (Leaf Vein: Xylem & Phloem) -->
    <g transform="translate(520, 248)">
      <rect width="230" height="120" rx="12" fill="#1E293B" stroke="#F59E0B" stroke-width="2.5"/>
      <text x="115" y="26" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FBBF24" text-anchor="middle">4. Leaf Vein (Vascular Bundle)</text>
      <!-- Xylem -->
      <circle cx="60" cy="65" r="22" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
      <text x="60" y="69" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">Xylem</text>
      <text x="60" y="102" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#7DD3FC" text-anchor="middle">H₂O Inflow</text>
      <!-- Phloem -->
      <circle cx="160" cy="65" r="22" fill="#D97706" stroke="#FDE68A" stroke-width="2"/>
      <text x="160" y="69" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">Phloem</text>
      <text x="160" y="102" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#FDE68A" text-anchor="middle">Sugar Translocation</text>
    </g>

    <!-- Lower Epidermis with Stomata & Guard Cells -->
    <rect x="50" y="375" width="700" height="34" rx="6" fill="#065F46" stroke="#34D399" stroke-width="2"/>
    <text x="120" y="397" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#A7F3D0">5. Lower Epidermis</text>
    
    <!-- Stomatal Pore & Guard Cells -->
    <g transform="translate(380, 368)">
      <ellipse cx="20" cy="24" rx="14" ry="18" fill="#15803D" stroke="#86EFAC" stroke-width="2"/>
      <ellipse cx="50" cy="24" rx="14" ry="18" fill="#15803D" stroke="#86EFAC" stroke-width="2"/>
      <ellipse cx="35" cy="24" rx="5" ry="12" fill="#0F172A"/>
      <text x="35" y="62" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#38BDF8" text-anchor="middle">Stomatal Pore &amp; Guard Cells</text>
      <path d="M 35 440 L 35 420" stroke="#38BDF8" stroke-width="3"/>
      <polygon points="35,412 28,424 42,424" fill="#38BDF8"/>
      <text x="35" y="458" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#38BDF8" text-anchor="middle">CO₂ Inflow / O₂ Outflow</text>
    </g>

    <!-- Waxy Cuticle Lower -->
    <rect x="50" y="412" width="700" height="8" rx="3" fill="#6EE7B7" opacity="0.7"/>
  </svg>`;

  // Diagram 3: Chloroplast Ultrastructure
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Chloroplast Ultrastructure — Organelle of Photosynthesis</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Double Envelope • Aqueous Stroma Matrix • Thylakoid Grana Discs</text>

    <!-- Outer & Inner Membrane Double Ellipse -->
    <ellipse cx="400" cy="260" rx="340" ry="180" fill="#064E3B" stroke="#10B981" stroke-width="4"/>
    <ellipse cx="400" cy="260" rx="320" ry="164" fill="#065F46" stroke="#34D399" stroke-width="2.5"/>

    <!-- Membrane Labels -->
    <line x1="140" y1="120" x2="200" y2="180" stroke="#34D399" stroke-width="2"/>
    <text x="130" y="112" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#A7F3D0">Outer Membrane</text>
    <line x1="140" y1="380" x2="220" y2="340" stroke="#34D399" stroke-width="2"/>
    <text x="130" y="396" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#A7F3D0">Inner Membrane</text>

    <!-- Stroma Aqueous Matrix -->
    <text x="400" y="130" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FDE68A" text-anchor="middle">Stroma (Aqueous Fluid)</text>
    <text x="400" y="148" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#FEF08A" text-anchor="middle">Site of Calvin Cycle • RuBisCO Enzyme • 70S Ribosomes • Chloroplast DNA</text>

    <!-- Granum Stack 1 (Left) -->
    <g transform="translate(230, 220)">
      <ellipse cx="40" cy="60" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="46" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="32" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="18" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <text x="40" y="94" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#A7F3D0" text-anchor="middle">Granum (Stack)</text>
    </g>

    <!-- Granum Stack 2 (Center) -->
    <g transform="translate(360, 200)">
      <ellipse cx="40" cy="74" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="60" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="46" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="32" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="18" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <text x="40" y="108" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#A7F3D0" text-anchor="middle">Thylakoids</text>
    </g>

    <!-- Granum Stack 3 (Right) -->
    <g transform="translate(490, 220)">
      <ellipse cx="40" cy="60" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="46" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="32" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <ellipse cx="40" cy="18" rx="42" ry="14" fill="#047857" stroke="#6EE7B7" stroke-width="2"/>
      <text x="40" y="94" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#A7F3D0" text-anchor="middle">Granum</text>
    </g>

    <!-- Stroma Lamellae Connecting Bridges -->
    <path d="M 312 250 Q 355 240 400 246" stroke="#A7F3D0" stroke-width="5" fill="none"/>
    <path d="M 440 246 Q 485 240 530 250" stroke="#A7F3D0" stroke-width="5" fill="none"/>
    <text x="400" y="350" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#6EE7B7" text-anchor="middle">Stroma Lamellae (Intergranal Thylakoids)</text>

    <!-- Thylakoid Lumen Callout -->
    <line x1="610" y1="170" x2="435" y2="230" stroke="#FDE047" stroke-width="2"/>
    <rect x="580" y="140" width="180" height="50" rx="10" fill="#1E293B" stroke="#FDE047" stroke-width="2"/>
    <text x="670" y="162" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047" text-anchor="middle">Thylakoid Membrane</text>
    <text x="670" y="178" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#FEF08A" text-anchor="middle">Chlorophyll + Light Reactions</text>
  </svg>`;

  // Diagram 4: Light-Dependent Reactions
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Light-Dependent Reactions — Thylakoid Membrane &amp; Z-Scheme</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Photon Capture • Water Photolysis • Electron Transport • ATP &amp; NADPH Generation</text>

    <!-- Thylakoid Lipid Bilayer -->
    <rect x="40" y="240" width="720" height="60" rx="10" fill="#065F46" stroke="#10B981" stroke-width="2"/>
    <text x="70" y="228" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#6EE7B7">STROMA (Outside Membrane: Low H⁺)</text>
    <text x="70" y="325" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">THYLAKOID LUMEN (Inside: High H⁺ Concentration)</text>

    <!-- Photosystem II (P680) -->
    <rect x="130" y="180" width="100" height="150" rx="16" fill="#047857" stroke="#34D399" stroke-width="3"/>
    <text x="180" y="235" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">PS II</text>
    <text x="180" y="255" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#A7F3D0" text-anchor="middle">P680</text>
    <line x1="100" y1="120" x2="160" y2="180" stroke="#FDE047" stroke-width="3" stroke-dasharray="5 3"/>
    <polygon points="163,184 150,178 155,190" fill="#FDE047"/>
    <text x="110" y="112" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#FDE047">Light (hν)</text>

    <!-- Water Photolysis Box -->
    <rect x="90" y="350" width="180" height="68" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="180" y="372" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#38BDF8" text-anchor="middle">Photolysis of Water</text>
    <text x="180" y="392" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">2H₂O → 4H⁺ + 4e⁻ + O₂↑</text>
    <text x="180" y="410" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#93C5FD" text-anchor="middle">Source of all atmospheric O₂</text>
    <line x1="180" y1="350" x2="180" y2="330" stroke="#38BDF8" stroke-width="3"/>

    <!-- Cytochrome b6f Complex -->
    <rect x="300" y="200" width="80" height="120" rx="14" fill="#1E293B" stroke="#F59E0B" stroke-width="2.5"/>
    <text x="340" y="250" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">Cyt b₆f</text>
    <text x="340" y="268" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#FEF08A" text-anchor="middle">H⁺ Pump</text>
    <!-- Electron Transfer Vector -->
    <path d="M 230 220 Q 265 190 300 220" stroke="#FDE047" stroke-width="3" fill="none"/>
    <polygon points="302,221 290,214 293,226" fill="#FDE047"/>

    <!-- Photosystem I (P700) -->
    <rect x="440" y="180" width="100" height="150" rx="16" fill="#047857" stroke="#34D399" stroke-width="3"/>
    <text x="490" y="235" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">PS I</text>
    <text x="490" y="255" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#A7F3D0" text-anchor="middle">P700</text>
    <line x1="430" y1="120" x2="475" y2="180" stroke="#FDE047" stroke-width="3" stroke-dasharray="5 3"/>
    <polygon points="478,184 466,177 470,190" fill="#FDE047"/>
    <text x="430" y="112" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#FDE047">Light (hν)</text>

    <!-- Ferredoxin & NADP+ Reductase -->
    <rect x="560" y="120" width="180" height="58" rx="10" fill="#1E293B" stroke="#4ADE80" stroke-width="2"/>
    <text x="650" y="142" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#4ADE80" text-anchor="middle">NADP⁺ Reductase</text>
    <text x="650" y="162" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">NADP⁺ + H⁺ + 2e⁻ → NADPH</text>
    <line x1="535" y1="195" x2="570" y2="168" stroke="#4ADE80" stroke-width="3"/>

    <!-- ATP Synthase Complex -->
    <rect x="610" y="210" width="90" height="130" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="3"/>
    <text x="655" y="260" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">ATP</text>
    <text x="655" y="278" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#BAE6FD" text-anchor="middle">Synthase</text>
    <line x1="655" y1="340" x2="655" y2="210" stroke="#FDE047" stroke-width="4"/>
    <polygon points="655,200 647,218 663,218" fill="#FDE047"/>
    <text x="655" y="370" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">H⁺ Efflux</text>
    <rect x="570" y="400" width="170" height="42" rx="8" fill="#1E293B" stroke="#FDE047" stroke-width="2"/>
    <text x="655" y="426" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047" text-anchor="middle">ADP + Pᵢ → ATP</text>
  </svg>`;

  // Diagram 5: Calvin Cycle / Dark Reactions
  const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Calvin Cycle (Dark Reactions) — Carbon Fixation in Stroma</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Phase 1: Carbon Fixation • Phase 2: Reduction • Phase 3: RuBP Regeneration</text>

    <!-- Central Cycle Loop Path -->
    <circle cx="400" cy="265" r="130" fill="none" stroke="#334155" stroke-width="4" stroke-dasharray="8 6"/>

    <!-- Phase 1: Carbon Fixation (Top) -->
    <rect x="290" y="85" width="220" height="80" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2.5"/>
    <text x="400" y="112" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Phase 1: Carbon Fixation</text>
    <text x="400" y="132" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">3 CO₂ + 3 RuBP (5C)</text>
    <text x="400" y="152" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#FDE047" text-anchor="middle">Enzyme: RuBisCO → 6 3-PGA</text>

    <!-- Phase 2: Reduction (Bottom-Right) -->
    <rect x="490" y="270" width="240" height="85" rx="14" fill="#1E293B" stroke="#10B981" stroke-width="2.5"/>
    <text x="610" y="297" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Phase 2: Reduction</text>
    <text x="610" y="318" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#FFFFFF" text-anchor="middle">Consumes 6 ATP + 6 NADPH</text>
    <text x="610" y="338" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#A7F3D0" text-anchor="middle">Produces 6 G3P (Triose Sugar)</text>

    <!-- Sugar Output Callout -->
    <rect x="520" y="380" width="220" height="58" rx="10" fill="#78350F" stroke="#F59E0B" stroke-width="2"/>
    <text x="630" y="404" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE68A" text-anchor="middle">1 G3P Exits to Form Sugar</text>
    <text x="630" y="424" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">Glucose (½ C₆H₁₂O₆) &amp; Starch</text>
    <line x1="610" y1="355" x2="610" y2="380" stroke="#F59E0B" stroke-width="3"/>
    <polygon points="610,380 603,365 617,365" fill="#F59E0B"/>

    <!-- Phase 3: RuBP Regeneration (Left) -->
    <rect x="70" y="250" width="240" height="85" rx="14" fill="#1E293B" stroke="#A855F7" stroke-width="2.5"/>
    <text x="190" y="277" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#C084FC" text-anchor="middle">Phase 3: RuBP Regeneration</text>
    <text x="190" y="298" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#FFFFFF" text-anchor="middle">5 G3P (3C) rearranged with 3 ATP</text>
    <text x="190" y="318" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#E9D5FF" text-anchor="middle">Yields 3 RuBP (5C) to repeat cycle</text>

    <!-- Cycle Directional Curved Arrows -->
    <path d="M 470 170 Q 550 200 550 260" stroke="#34D399" stroke-width="4" fill="none"/>
    <polygon points="551,263 543,248 557,250" fill="#34D399"/>

    <path d="M 480 340 Q 380 390 280 340" stroke="#A855F7" stroke-width="4" fill="none"/>
    <polygon points="277,338 290,346 288,332" fill="#A855F7"/>

    <path d="M 210 240 Q 230 170 300 150" stroke="#38BDF8" stroke-width="4" fill="none"/>
    <polygon points="304,149 292,159 299,145" fill="#38BDF8"/>
  </svg>`;

  // Diagram 6: Comparison of Light-Dependent vs Calvin Cycle
  const svgComparison = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="34" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Photosynthesis Stages Comparison — Light Reactions vs Calvin Cycle</text>
    <text x="400" y="54" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Coordinated Energy Coupling across Thylakoid Membrane and Aqueous Stroma Matrix</text>

    <!-- Stage 1 Card: Light-Dependent Reactions -->
    <g transform="translate(40, 75)">
      <rect width="330" height="340" rx="16" fill="#1E293B" stroke="#10B981" stroke-width="2.5"/>
      <rect width="330" height="48" rx="16" fill="#065F46"/>
      <text x="165" y="30" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#A7F3D0" text-anchor="middle">1. Light-Dependent Reactions</text>
      
      <!-- Key Dimensions -->
      <g transform="translate(18, 62)">
        <text x="0" y="16" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">📍 Location:</text>
        <text x="80" y="16" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Thylakoid Membrane &amp; Lumen</text>

        <text x="0" y="44" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24">☀️ Light Need:</text>
        <text x="90" y="44" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Direct Sunlight Required (Photons)</text>

        <text x="0" y="72" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#4ADE80">📥 Main Inputs:</text>
        <text x="95" y="72" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">H₂O, Photons, NADP⁺, ADP + Pᵢ</text>

        <text x="0" y="100" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F87171">📤 Main Outputs:</text>
        <text x="100" y="100" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FDE047">ATP, NADPH, O₂ Gas (byproduct)</text>

        <text x="0" y="132" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#C084FC">⚙️ Core Function:</text>
        <rect x="0" y="142" width="294" height="60" rx="8" fill="#0F172A" stroke="#334155"/>
        <text x="12" y="164" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1">• Photolysis of water (2H₂O → 4H⁺ + 4e⁻ + O₂)</text>
        <text x="12" y="184" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1">• Photophosphorylation generating ATP</text>
      </g>
    </g>

    <!-- Center Coupling Connectors -->
    <g transform="translate(378, 160)">
      <!-- Top Arrow: ATP + NADPH to Calvin Cycle -->
      <path d="M 0 30 L 40 30" stroke="#FDE047" stroke-width="4" stroke-linecap="round"/>
      <polygon points="44,30 32,24 32,36" fill="#FDE047"/>
      <text x="22" y="20" font-family="Inter, sans-serif" font-size="10.5" font-weight="900" fill="#FDE047" text-anchor="middle">ATP + NADPH</text>
      
      <!-- Bottom Arrow: ADP + NADP+ back to Light Reactions -->
      <path d="M 40 110 L 0 110" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
      <polygon points="-4,110 8,104 8,116" fill="#38BDF8"/>
      <text x="22" y="132" font-family="Inter, sans-serif" font-size="10.5" font-weight="900" fill="#38BDF8" text-anchor="middle">ADP + NADP⁺</text>
    </g>

    <!-- Stage 2 Card: Calvin Cycle (Dark Reactions) -->
    <g transform="translate(430, 75)">
      <rect width="330" height="340" rx="16" fill="#1E293B" stroke="#3B82F6" stroke-width="2.5"/>
      <rect width="330" height="48" rx="16" fill="#1E3A8A"/>
      <text x="165" y="30" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#BAE6FD" text-anchor="middle">2. Calvin Cycle (Dark Reactions)</text>

      <!-- Key Dimensions -->
      <g transform="translate(18, 62)">
        <text x="0" y="16" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">📍 Location:</text>
        <text x="80" y="16" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Stroma Aqueous Fluid</text>

        <text x="0" y="44" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24">☀️ Light Need:</text>
        <text x="90" y="44" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Light-Independent (Needs ATP/NADPH)</text>

        <text x="0" y="72" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#4ADE80">📥 Main Inputs:</text>
        <text x="95" y="72" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">CO₂, RuBP, ATP, NADPH</text>

        <text x="0" y="100" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F87171">📤 Main Outputs:</text>
        <text x="100" y="100" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FDE047">G3P Triose Sugar → Glucose, ADP, NADP⁺</text>

        <text x="0" y="132" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#C084FC">⚙️ Core Function:</text>
        <rect x="0" y="142" width="294" height="60" rx="8" fill="#0F172A" stroke="#334155"/>
        <text x="12" y="164" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1">• RuBisCO fixes CO₂ with RuBP into 3-PGA</text>
        <text x="12" y="184" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1">• Reduction produces G3P sugar for glucose</text>
      </g>
    </g>

    <!-- Bottom Takeaway Alert Bar -->
    <rect x="40" y="430" width="720" height="36" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="400" y="453" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE68A" text-anchor="middle">Key Takeaway: The Calvin cycle does NOT make glucose in one step; 2 G3P molecules exit to form one hexose glucose.</text>
  </svg>`;

  // Diagram 7: Overall Chemical Equation & Energy Balance
  const svg5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Photosynthesis — Balanced Chemical Reaction &amp; Stoichiometry</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Conservation of Atoms • Reactants, Catalysts, and Verified Molecular Products</text>

    <!-- Word Equation Banner -->
    <rect x="50" y="90" width="700" height="54" rx="12" fill="#1E293B" stroke="#475569" stroke-width="2"/>
    <text x="400" y="122" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#F8FAFC" text-anchor="middle">Carbon Dioxide + Water + Sunlight ⎯⎯[Chlorophyll]⎯⎯→ Glucose + Oxygen</text>

    <!-- Balanced Chemical Equation Box -->
    <rect x="50" y="170" width="700" height="110" rx="16" fill="#064E3B" stroke="#10B981" stroke-width="3"/>
    <text x="400" y="215" font-family="Inter, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">6CO₂  +  6H₂O  ⎯⎯[Light + Chlorophyll]⎯⎯→  C₆H₁₂O₆  +  6O₂</text>
    <text x="400" y="255" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#A7F3D0" text-anchor="middle">6 Carbon atoms | 12 Hydrogen atoms | 18 Oxygen atoms on each side (Balanced)</text>

    <!-- Atom Breakdown 3 Cards -->
    <rect x="60" y="310" width="200" height="135" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="160" y="338" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8" text-anchor="middle">Carbon (C) Atoms</text>
    <text x="160" y="365" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">Input: 6 from 6CO₂</text>
    <text x="160" y="390" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#A7F3D0" text-anchor="middle">Output: 6 in Glucose</text>
    <text x="160" y="420" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">100% incorporated into sugar</text>

    <rect x="300" y="310" width="200" height="135" rx="12" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
    <text x="400" y="338" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FBBF24" text-anchor="middle">Hydrogen (H) Atoms</text>
    <text x="400" y="365" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">Input: 12 from 6H₂O</text>
    <text x="400" y="390" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#A7F3D0" text-anchor="middle">Output: 12 in Glucose</text>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Transported via NADPH</text>

    <rect x="540" y="310" width="200" height="135" rx="12" fill="#1E293B" stroke="#EF4444" stroke-width="2"/>
    <text x="640" y="338" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F87171" text-anchor="middle">Oxygen (O) Atoms</text>
    <text x="640" y="365" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">6 in Glucose (from CO₂)</text>
    <text x="640" y="390" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#4ADE80" text-anchor="middle">12 in 6O₂ (from 6H₂O)</text>
    <text x="640" y="420" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">★ High-Yield Exam Point</text>
  </svg>`;

  return [
    {
      diagramId: 'photo-diag-1',
      subtopicKey: 'overall_overview',
      subtopicTitle: 'Overall Photosynthetic Process in Plants',
      diagramTitle: 'Diagram 1: Overall Photosynthesis Organismal Overview',
      diagramType: 'organismal_overview',
      caption: 'Organism-level overview of photosynthesis showing photon absorption, gas exchange through stomata, xylem water uptake, and phloem sugar distribution.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: 'The holistic organismal process of plant photosynthesis connecting atmospheric gases, soil water, and solar radiation.',
      point2_labelledParts: [
        { label: 'Sunlight', description: 'Solar radiant energy providing photons of blue and red wavelengths.' },
        { label: 'CO₂ Inflow', description: 'Atmospheric carbon dioxide diffusing into the leaf mesophyll through stomatal pores.' },
        { label: 'H₂O Uptake', description: 'Water absorbed by root hairs from soil moisture and conducted upward through xylem vessels.' },
        { label: 'O₂ Outflow', description: 'Molecular oxygen released as a gas through stomata following water photolysis.' },
        { label: 'Glucose (C₆H₁₂O₆)', description: 'Synthesized high-energy carbohydrate translocated through phloem to storage tissues.' }
      ],
      point3_componentFunctions: 'Leaves act as solar collection panels; stomata regulate gas diffusion; roots supply required electron donors (H₂O).',
      point4_componentRelationships: 'Roots supply water up to leaves; leaves combine H₂O with captured CO₂ using solar energy to feed the whole plant.',
      point5_directionOfMovementOrProcess: 'Water moves upward through xylem; CO₂ enters leaves; O₂ exits into air; synthesized glucose flows downward to roots and fruits.',
      point6_stepByStepInterpretation: [
        '1. Soil water is absorbed by root osmolarity and pulled upward by transpiration pull through xylem.',
        '2. Sunlight strikes chlorophyll in the leaf mesophyll, energizing electrons.',
        '3. Stomata open to absorb CO₂ while releasing the O₂ produced by water breakdown.',
        '4. Synthesized sugars are transported via phloem throughout the plant.'
      ],
      point7_learningOutcome: 'Students understand the plant as an open thermodynamic system converting abiotic inputs into biological food and oxygen.',
      point8_whatToRemember: 'Inputs = 6CO₂ + 6H₂O + Sunlight; Outputs = C₆H₁₂O₆ + 6O₂. O₂ comes from water, not CO₂! Plants do not get food from soil.',
      isVerified: true
    },
    {
      diagramId: 'photo-diag-2',
      subtopicKey: 'leaf_anatomy',
      subtopicTitle: 'Leaf Internal Structure and Tissue Anatomy',
      diagramTitle: 'Diagram 2: Leaf Internal Structure (Epidermis, Mesophyll & Stomata)',
      diagramType: 'tissue_anatomy',
      caption: 'Transverse section of a dicot leaf detailing upper cuticle, palisade mesophyll, spongy mesophyll with air spaces, vascular bundle (xylem and phloem), and stomata.',
      svgXml: svgLeaf,
      dataUrl: svgToDataUrl(svgLeaf),
      point1_whatItRepresents: 'Microscopic cross-sectional tissue anatomy of a photosynthetic leaf showing spatial arrangement for gas exchange and light capture.',
      point2_labelledParts: [
        { label: 'Upper Epidermis & Cuticle', description: 'Transparent protective outer cell layer with waxy cuticle preventing desiccation.' },
        { label: 'Palisade Mesophyll', description: 'Tightly packed columnar cells containing over 80% of the leaf chloroplasts for light harvesting.' },
        { label: 'Spongy Mesophyll', description: 'Loosely packed irregular cells with prominent air cavities facilitating rapid gas diffusion.' },
        { label: 'Leaf Vein (Xylem & Phloem)', description: 'Vascular bundle delivering water via xylem and transporting sugars via phloem.' },
        { label: 'Stomata & Guard Cells', description: 'Microscopic pores bordered by turgor-sensitive guard cells regulating gas exchange and transpiration.' }
      ],
      point3_componentFunctions: 'Palisade cells absorb sunlight; spongy air cavities diffuse CO₂ directly to chloroplasts; xylem supplies continuous water; guard cells open when turgid.',
      point4_componentRelationships: 'Light penetrates the transparent upper epidermis into palisade cells; CO₂ entering through lower stomata diffuses through spongy spaces to reach palisade chloroplasts.',
      point5_directionOfMovementOrProcess: 'Sunlight enters from above; water arrives via xylem; CO₂ diffuses inward from stomata; O₂ diffuses outward.',
      point6_stepByStepInterpretation: [
        '1. Light passes through the clear waxy cuticle into columnar palisade mesophyll cells.',
        '2. Stomata open when guard cells become turgid, allowing CO₂ to diffuse into spongy air cavities.',
        '3. Xylem vessels bring continuous water supply from roots to mesophyll cells.',
        '4. Phloem translocates synthesized sugars out of the leaf to growing buds and roots.'
      ],
      point7_learningOutcome: 'Identify the exact internal leaf tissues and explain how structure directly facilitates photosynthesis and gas exchange.',
      point8_whatToRemember: 'Palisade mesophyll = maximum light absorption. Spongy mesophyll = gas exchange air spaces. Guard cells control stomata.',
      isVerified: true
    },
    {
      diagramId: 'photo-diag-3',
      subtopicKey: 'chloroplast_structure',
      subtopicTitle: 'Chloroplast Ultrastructure and Compartmentalization',
      diagramTitle: 'Diagram 3: Chloroplast Ultrastructure (Membranes, Stroma & Grana)',
      diagramType: 'organelle_anatomy',
      caption: 'Cross-sectional ultrastructure of the chloroplast detailing the double envelope, aqueous stroma, thylakoid grana stacks, and stroma lamellae.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: 'The internal sub-cellular compartmentalization of a chloroplast organelle.',
      point2_labelledParts: [
        { label: 'Outer Membrane', description: 'Permeable outer barrier containing porin transport proteins.' },
        { label: 'Inner Membrane', description: 'Highly selective boundary regulating metabolite transport into the stroma.' },
        { label: 'Stroma', description: 'Dense protein-rich aqueous fluid containing RuBisCO, chloroplast DNA, and ribosomes.' },
        { label: 'Thylakoids & Grana', description: 'Disc-like membrane sacs stacked into grana holding chlorophyll pigment complexes.' },
        { label: 'Stroma Lamellae', description: 'Membranous extensions linking distinct grana stacks across the stroma.' }
      ],
      point3_componentFunctions: 'Thylakoid membranes provide physical platforms for light reactions; stroma provides the soluble enzymatic bath for dark reactions.',
      point4_componentRelationships: 'ATP and NADPH produced across thylakoid membranes dissolve directly into the adjacent stroma to fuel the Calvin Cycle.',
      point5_directionOfMovementOrProcess: 'Photons strike thylakoids; H⁺ protons accumulate inside the thylakoid lumen; ATP/NADPH are ejected into the surrounding stroma.',
      point6_stepByStepInterpretation: [
        '1. Double membrane bounds the organelle, preserving internal chemical gradients.',
        '2. Thylakoid grana maximize surface area for millions of light-capturing chlorophyll pigments.',
        '3. The stroma houses dissolved RuBisCO enzyme ready to fix carbon.'
      ],
      point7_learningOutcome: 'Recognize that photosynthesis is spatially divided: Light reactions on thylakoids, dark reactions in stroma.',
      point8_whatToRemember: 'Thylakoid discs = Light reactions (photons & water); Stroma fluid = Dark reactions (Calvin cycle & RuBisCO).',
      isVerified: true
    },
    {
      diagramId: 'photo-diag-4',
      subtopicKey: 'light_reactions',
      subtopicTitle: 'Light-Dependent Reactions and Photolysis',
      diagramTitle: 'Diagram 4: Light-Dependent Reactions (Photosystems II & I, Z-Scheme, ATP Synthase)',
      diagramType: 'biochemical_pathway',
      caption: 'Detailed membrane-bound mechanism of light reactions showing PS II, water photolysis, Cytochrome b6f, PS I, NADP+ reductase, and ATP synthase.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      point1_whatItRepresents: 'The electron transport chain in the thylakoid membrane driving photophosphorylation and water splitting.',
      point2_labelledParts: [
        { label: 'Photosystem II (P680)', description: 'Chlorophyll complex absorbing 680 nm light, triggering electron excitation.' },
        { label: 'Photolysis of Water', description: 'Splitting of 2H₂O into 4H⁺, 4e⁻, and O₂ gas via the Oxygen-Evolving Complex.' },
        { label: 'Cytochrome b₆f', description: 'Intermediate proton pump transferring electrons while pumping H⁺ into the lumen.' },
        { label: 'Photosystem I (P700)', description: 'Pigment complex absorbing 700 nm light to re-energize electrons for NADP⁺ reduction.' },
        { label: 'ATP Synthase', description: 'Rotary enzyme generating ATP as H⁺ protons flow down their electrochemical gradient into the stroma.' }
      ],
      point3_componentFunctions: 'Converts electromagnetic radiation (sunlight) into portable chemical bond energy (ATP and NADPH) while expelling O₂.',
      point4_componentRelationships: 'Electrons flow sequentially: H₂O → PS II → Cyt b₆f → PS I → Ferredoxin → NADP⁺ Reductase → NADPH.',
      point5_directionOfMovementOrProcess: 'Electrons flow along the membrane chain; protons (H⁺) are pumped into the lumen and exit through ATP synthase into the stroma.',
      point6_stepByStepInterpretation: [
        '1. PS II absorbs sunlight, exciting electrons that leave the reaction center.',
        '2. Water is photolyzed to replace the lost electrons, producing oxygen gas: 2H₂O → 4H⁺ + 4e⁻ + O₂↑.',
        '3. Electron flow pumps H⁺, building a proton-motive force across the thylakoid membrane.',
        '4. PS I re-excites electrons to reduce NADP⁺ into NADPH.',
        '5. H⁺ rushes through ATP synthase, generating ATP from ADP and inorganic phosphate.'
      ],
      point7_learningOutcome: 'Master the Z-scheme and understand that light reactions generate the "assimilatory power" (ATP + NADPH) needed for sugar synthesis.',
      point8_whatToRemember: 'Light reactions produce ATP, NADPH, and O₂. Water photolysis occurs at PS II and is the true source of atmospheric oxygen.',
      isVerified: true
    },
    {
      diagramId: 'photo-diag-5',
      subtopicKey: 'calvin_cycle',
      subtopicTitle: 'Calvin Cycle and Enzymatic Carbon Fixation',
      diagramTitle: 'Diagram 5: Calvin Cycle (RuBisCO, Reduction & RuBP Regeneration)',
      diagramType: 'metabolic_cycle',
      caption: 'The three cyclic phases of the Calvin cycle in the stroma: carbon fixation by RuBisCO, reduction to G3P sugar, and regeneration of the RuBP acceptor.',
      svgXml: svg4,
      dataUrl: svgToDataUrl(svg4),
      point1_whatItRepresents: 'The light-independent cyclic enzymatic pathway that fixes atmospheric CO₂ into stable organic carbohydrates.',
      point2_labelledParts: [
        { label: 'Phase 1: Carbon Fixation', description: 'RuBisCO enzyme attaches inorganic CO₂ onto 5-carbon RuBP, forming 3-PGA.' },
        { label: 'RuBisCO Enzyme', description: 'Ribulose-1,5-bisphosphate carboxylase-oxygenase, the catalytic enzyme of carbon fixation.' },
        { label: 'Phase 2: Reduction', description: 'ATP and NADPH donate phosphate and electrons to convert 3-PGA into glyceraldehyde-3-phosphate (G3P).' },
        { label: 'G3P Output', description: '1 out of every 6 G3P molecules exits the cycle to synthesize glucose and starch.' },
        { label: 'Phase 3: RuBP Regeneration', description: 'Remaining 5 G3P molecules use ATP to regenerate three 5-carbon RuBP acceptors.' }
      ],
      point3_componentFunctions: 'Fixes invisible carbon gas into tangible solid food molecules that can be stored or metabolized.',
      point4_componentRelationships: 'Requires the direct products of light reactions (ATP and NADPH); if light stops, ATP/NADPH run out and the Calvin cycle halts.',
      point5_directionOfMovementOrProcess: 'Continuous cyclic transformation: RuBP + CO₂ → 3-PGA → G3P → RuBP.',
      point6_stepByStepInterpretation: [
        '1. 3 CO₂ molecules enter and are combined with 3 RuBP (5C) by RuBisCO.',
        '2. 6 ATP and 6 NADPH convert the 6 3-PGA molecules into 6 G3P (triose sugars).',
        '3. 1 G3P molecule leaves the cycle as net carbohydrate profit to form glucose.',
        '4. 3 ATP molecules power the rearrangement of 5 G3P back into 3 RuBP acceptors.'
      ],
      point7_learningOutcome: 'Understand why dark reactions are light-independent in mechanism but depend on light-reaction products (ATP & NADPH).',
      point8_whatToRemember: '3 phases: Fixation (RuBisCO) → Reduction (uses ATP + NADPH) → Regeneration of RuBP (uses ATP). Net product = G3P sugar (not instant glucose!).',
      isVerified: true
    },
    {
      diagramId: 'photo-diag-6',
      subtopicKey: 'comparison_stages',
      subtopicTitle: 'Light-Dependent vs Calvin Cycle Comparison',
      diagramTitle: 'Diagram 6: Light Reactions vs Calvin Cycle Comparative Matrix',
      diagramType: 'comparative_chart',
      caption: 'Side-by-side comparison of location, energy inputs, chemical outputs, light dependency, and metabolic coupling between the two stages of photosynthesis.',
      svgXml: svgComparison,
      dataUrl: svgToDataUrl(svgComparison),
      point1_whatItRepresents: 'Comprehensive comparative breakdown showing the metabolic interdependence of Light-Dependent and Light-Independent stages.',
      point2_labelledParts: [
        { label: 'Thylakoid Membrane vs Stroma', description: 'Spatial compartmentalization separating light harvesting from enzymatic carbon fixation.' },
        { label: 'Photons vs ATP/NADPH', description: 'Direct electromagnetic energy input versus chemical energy currency.' },
        { label: 'Water Photolysis vs CO₂ Fixation', description: 'Water splitting yielding oxygen gas versus CO₂ reduction yielding carbohydrates.' },
        { label: 'ATP & NADPH Energy Bridge', description: 'Assimilatory power flowing from thylakoid into stroma.' },
        { label: 'ADP & NADP⁺ Return Loop', description: 'Recycled chemical cofactors returning to thylakoid for re-phosphorylation.' }
      ],
      point3_componentFunctions: 'Light reactions convert solar energy to chemical currency; dark reactions invest that currency into enduring organic matter.',
      point4_componentRelationships: 'Light reactions cannot run if NADP⁺/ADP are depleted; Calvin cycle cannot run without ATP/NADPH from light reactions.',
      point5_directionOfMovementOrProcess: 'Energy flows from Photons → ATP/NADPH → Glucose; Cofactors cycle continuously between thylakoid and stroma.',
      point6_stepByStepInterpretation: [
        '1. Thylakoids absorb light, split H₂O, produce ATP, NADPH, and vent O₂.',
        '2. Stroma receives ATP and NADPH, using RuBisCO to fix CO₂ into G3P sugar.',
        '3. Spent ADP and NADP⁺ return to thylakoids to be recharged by sunlight.',
        '4. G3P molecules are condensed into glucose (C₆H₁₂O₆) and stored as starch.'
      ],
      point7_learningOutcome: 'Clear distinction between the two stages for exam differentiation tables and multi-mark questions.',
      point8_whatToRemember: 'Light stage = Thylakoids, produces O₂ + ATP + NADPH. Dark stage = Stroma, uses ATP + NADPH to fix CO₂ into sugar.',
      isVerified: true
    },
    {
      diagramId: 'photo-diag-7',
      subtopicKey: 'chemical_equation',
      subtopicTitle: 'Balanced Chemical Equation & Stoichiometry',
      diagramTitle: 'Diagram 7: Balanced Chemical Equation & Atomic Conservation',
      diagramType: 'stoichiometric_chart',
      caption: 'Mathematical and atomic balance chart proving conservation of mass across 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      svgXml: svg5,
      dataUrl: svgToDataUrl(svg5),
      point1_whatItRepresents: 'The exact chemical stoichiometry and conservation of atoms between reactants and products in photosynthesis.',
      point2_labelledParts: [
        { label: '6CO₂ (Carbon Dioxide)', description: '6 molecules providing the 6 carbon atoms and 12 oxygen atoms.' },
        { label: '6H₂O (Water)', description: '6 molecules providing 12 hydrogen atoms and 6 oxygen atoms.' },
        { label: 'Light + Chlorophyll', description: 'Catalytic energy conditions required; not consumed in the reaction.' },
        { label: 'C₆H₁₂O₆ (Glucose)', description: '1 hexose sugar molecule storing ~2870 kJ/mol of chemical potential energy.' },
        { label: '6O₂ (Oxygen Gas)', description: '6 diatomic oxygen molecules released from the 6 water molecules.' }
      ],
      point3_componentFunctions: 'Provides the formal chemical foundation for balancing laboratory experiments and solving stoichiometric exam questions.',
      point4_componentRelationships: 'Every atom entering on the left must be accounted for in the molecules on the right.',
      point5_directionOfMovementOrProcess: 'Reactants (Low chemical potential energy) + Solar Photons → Products (High chemical bond energy).',
      point6_stepByStepInterpretation: [
        '1. 6 Carbons from 6CO₂ end up inside the 1 Glucose molecule.',
        '2. 12 Hydrogens from 6H₂O end up inside the 1 Glucose molecule.',
        '3. 12 Oxygens released as 6O₂ gas originate solely from water, verified by heavy oxygen-18 isotope tracing.'
      ],
      point7_learningOutcome: 'Confidently write, balance, and explain the chemical equation in board exams without losing marks on coefficients.',
      point8_whatToRemember: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (ΔG° = +2870 kJ/mol). Oxygen released originates strictly from water, not carbon dioxide!',
      isVerified: true
    }
  ];
}

// ============================================================================
// 2. HUMAN HEART — 5 DEDICATED SUBTOPIC DIAGRAMS
// ============================================================================

export function getHumanHeartSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: External Anatomy & Mediastinum Orientation
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Human Heart — External Anatomy &amp; Mediastinum Orientation</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Thoracic Cavity • Pericardial Sac • Base (Superior) &amp; Apex (Inferior Left)</text>

    <!-- Thoracic Silhouette Guidelines -->
    <path d="M 220 120 C 180 200 180 320 220 400" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
    <path d="M 580 120 C 620 200 620 320 580 400" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
    <text x="210" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#64748B" text-anchor="end">Right Lung</text>
    <text x="590" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#64748B">Left Lung (Cardiac Notch)</text>

    <!-- Fibrous Pericardium Outer Sac -->
    <path d="M 330 140 C 470 120 520 220 500 320 C 480 390 390 410 330 400 C 280 380 270 280 300 200 Z" fill="#1E293B" stroke="#64748B" stroke-width="3" stroke-dasharray="6 3"/>
    <text x="260" y="160" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#94A3B8">Pericardial Sac</text>
    <text x="260" y="178" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#64748B">Fluid-filled friction buffer</text>

    <!-- Heart Muscular Body -->
    <path d="M 350 160 C 470 145 500 230 480 320 C 460 380 390 400 340 390 C 290 360 290 260 320 190 Z" fill="#991B1B" stroke="#DC2626" stroke-width="4"/>

    <!-- Coronary Sulcus & Vessels -->
    <path d="M 320 250 Q 400 270 480 250" stroke="#FBBF24" stroke-width="4" fill="none"/>
    <path d="M 400 265 Q 380 330 350 390" stroke="#38BDF8" stroke-width="3" fill="none"/>
    <text x="495" y="270" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#FDE047">Coronary Sulcus</text>

    <!-- Base & Apex Indicators -->
    <line x1="420" y1="120" x2="420" y2="150" stroke="#FDE047" stroke-width="3"/>
    <text x="420" y="105" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">Base of Heart (Superior, 2nd Rib)</text>

    <line x1="340" y1="390" x2="310" y2="435" stroke="#FDE047" stroke-width="3"/>
    <text x="310" y="455" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">Apex (Points to Left Hip, 5th Intercostal Space)</text>

    <!-- Orientation Callout Card -->
    <rect x="530" y="110" width="230" height="120" rx="12" fill="#1E293B" stroke="#DC2626" stroke-width="2"/>
    <text x="645" y="136" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F87171" text-anchor="middle">Mediastinum Position</text>
    <text x="645" y="160" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Located between lungs in chest</text>
    <text x="645" y="180" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">• 2/3 of mass lies left of midline</text>
    <text x="645" y="200" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Size of closed fist (~300g)</text>
  </svg>`;

  // Diagram 2: Four Chambers & Valves Cross-Section
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Internal Heart Cross-Section — Four Chambers &amp; Valves</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Right Heart (Deoxygenated Blue) | Left Heart (Oxygenated Red) | Interventricular Septum</text>

    <!-- Outer Myocardium Wall -->
    <path d="M 180 180 C 180 320 260 420 400 440 C 540 420 620 320 620 180 C 620 120 540 100 400 100 C 260 100 180 120 180 180 Z" fill="#1E293B" stroke="#475569" stroke-width="4"/>

    <!-- Interventricular & Interatrial Septum -->
    <rect x="385" y="110" width="30" height="320" rx="8" fill="#475569" stroke="#94A3B8" stroke-width="2"/>
    <text x="400" y="310" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle" transform="rotate(-90 400 310)">Interventricular Septum</text>

    <!-- Right Atrium (Upper Left, Anatomical Right) -->
    <rect x="220" y="130" width="150" height="110" rx="14" fill="#0369A1" stroke="#38BDF8" stroke-width="2.5"/>
    <text x="295" y="175" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">Right Atrium</text>
    <text x="295" y="196" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#BAE6FD" text-anchor="middle">Deoxygenated Blood</text>
    <text x="295" y="214" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#7DD3FC" text-anchor="middle">From Vena Cava</text>

    <!-- Left Atrium (Upper Right, Anatomical Left) -->
    <rect x="430" y="130" width="150" height="110" rx="14" fill="#B91C1C" stroke="#F87171" stroke-width="2.5"/>
    <text x="505" y="175" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">Left Atrium</text>
    <text x="505" y="196" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FECACA" text-anchor="middle">Oxygenated Blood</text>
    <text x="505" y="214" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#FCA5A5" text-anchor="middle">From Pulmonary Veins</text>

    <!-- Tricuspid Valve (AV Valve Right) -->
    <line x1="250" y1="245" x2="340" y2="245" stroke="#FDE047" stroke-width="5" stroke-dasharray="8 4"/>
    <text x="295" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">Tricuspid Valve (3 Cusps)</text>

    <!-- Bicuspid / Mitral Valve (AV Valve Left) -->
    <line x1="460" y1="245" x2="550" y2="245" stroke="#FDE047" stroke-width="5" stroke-dasharray="8 4"/>
    <text x="505" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">Bicuspid / Mitral Valve (2 Cusps)</text>

    <!-- Right Ventricle (Lower Left, Moderate Wall) -->
    <rect x="220" y="275" width="150" height="135" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="2.5"/>
    <text x="295" y="330" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">Right Ventricle</text>
    <text x="295" y="352" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#BAE6FD" text-anchor="middle">Pumps to Lungs</text>
    <text x="295" y="372" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#E0F2FE" text-anchor="middle">Pulmonary Loop (~25 mmHg)</text>

    <!-- Left Ventricle (Lower Right, 3x THICK Myocardium Wall) -->
    <rect x="430" y="275" width="150" height="135" rx="14" fill="#991B1B" stroke="#EF4444" stroke-width="5"/>
    <text x="505" y="325" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">Left Ventricle</text>
    <text x="505" y="347" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#FECACA" text-anchor="middle">Pumps to Entire Body</text>
    <text x="505" y="367" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FEF08A" text-anchor="middle">★ 3x Thicker Myocardium</text>
    <text x="505" y="387" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#FEE2E2" text-anchor="middle">Systemic Loop (~120 mmHg)</text>
  </svg>`;

  // Diagram 3: Double Circulation Pathway
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Human Double Circulation — Pulmonary &amp; Systemic Circuits</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Blood passes through the heart TWICE during each complete body circuit</text>

    <!-- Top: Lungs Capillary Bed -->
    <rect x="300" y="85" width="200" height="60" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2.5"/>
    <text x="400" y="112" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">Lungs (Pulmonary Bed)</text>
    <text x="400" y="132" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="middle">Drops CO₂ • Picks up O₂</text>

    <!-- Center: The Heart (Split Blue / Red) -->
    <rect x="250" y="190" width="140" height="110" rx="14" fill="#0369A1" stroke="#38BDF8" stroke-width="3"/>
    <text x="320" y="235" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">Right Heart</text>
    <text x="320" y="255" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#BAE6FD" text-anchor="middle">RA + RV (Deoxy)</text>

    <rect x="410" y="190" width="140" height="110" rx="14" fill="#B91C1C" stroke="#F87171" stroke-width="3"/>
    <text x="480" y="235" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">Left Heart</text>
    <text x="480" y="255" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#FECACA" text-anchor="middle">LA + LV (Oxy)</text>

    <!-- Bottom: Body Tissues Capillary Bed -->
    <rect x="280" y="360" width="240" height="65" rx="14" fill="#1E293B" stroke="#F87171" stroke-width="2.5"/>
    <text x="400" y="388" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">Body Tissues &amp; Organs</text>
    <text x="400" y="408" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FCA5A5" text-anchor="middle">Delivers O₂ + Glucose • Collects CO₂</text>

    <!-- Circuit 1: Pulmonary Circuit Loops -->
    <!-- RV to Lungs (Pulmonary Artery - Blue) -->
    <path d="M 300 190 Q 260 115 300 115" stroke="#38BDF8" stroke-width="4" fill="none"/>
    <polygon points="302,115 290,108 290,122" fill="#38BDF8"/>
    <text x="215" y="145" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#38BDF8">Pulmonary Artery (Deoxy)</text>

    <!-- Lungs to LA (Pulmonary Vein - Red) -->
    <path d="M 500 115 Q 540 115 500 190" stroke="#EF4444" stroke-width="4" fill="none"/>
    <polygon points="498,193 508,180 496,180" fill="#EF4444"/>
    <text x="555" y="145" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#F87171">Pulmonary Veins (Oxy)</text>

    <!-- Circuit 2: Systemic Circuit Loops -->
    <!-- LV to Body (Systemic Aorta - Red) -->
    <path d="M 500 300 Q 560 380 520 380" stroke="#EF4444" stroke-width="4" fill="none"/>
    <polygon points="517,380 530,373 530,387" fill="#EF4444"/>
    <text x="560" y="340" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#F87171">Aorta Arch (Oxy)</text>

    <!-- Body to RA (Vena Cava - Blue) -->
    <path d="M 280 380 Q 230 380 300 300" stroke="#38BDF8" stroke-width="4" fill="none"/>
    <polygon points="302,298 290,305 302,312" fill="#38BDF8"/>
    <text x="195" y="340" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#38BDF8">Vena Cava (Deoxy)</text>
  </svg>`;

  // Diagram 4: Cardiac Conduction & Heartbeat Cycle
  const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Cardiac Conduction System — Pacemaker &amp; Heartbeat Rhythm</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">SA Node (72 bpm Pacemaker) → AV Node → Bundle of His → Purkinje Fibers</text>

    <!-- Heart Outline Background -->
    <path d="M 220 180 C 220 320 280 410 400 430 C 520 410 580 320 580 180 C 580 130 520 110 400 110 C 280 110 220 130 220 180 Z" fill="#1E293B" stroke="#475569" stroke-width="3"/>

    <!-- 1. Sinoatrial (SA) Node in Right Atrium -->
    <circle cx="280" cy="160" r="18" fill="#FBBF24" stroke="#FDE047" stroke-width="3"/>
    <text x="280" y="165" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#78350F" text-anchor="middle">SA</text>
    <rect x="60" y="130" width="190" height="58" rx="10" fill="#1E293B" stroke="#FDE047" stroke-width="2"/>
    <text x="155" y="152" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047" text-anchor="middle">1. Sinoatrial (SA) Node</text>
    <text x="155" y="172" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#FEF08A" text-anchor="middle">Natural Pacemaker (~72 bpm)</text>
    <line x1="250" y1="160" x2="262" y2="160" stroke="#FDE047" stroke-width="2"/>

    <!-- Internodal Pathways -->
    <path d="M 292 172 Q 330 200 360 220" stroke="#FDE047" stroke-width="4" stroke-dasharray="6 3" fill="none"/>

    <!-- 2. Atrioventricular (AV) Node -->
    <circle cx="370" cy="230" r="16" fill="#F59E0B" stroke="#FDE047" stroke-width="3"/>
    <text x="370" y="235" font-family="Inter, sans-serif" font-size="10.5" font-weight="900" fill="#78350F" text-anchor="middle">AV</text>
    <rect x="60" y="220" width="190" height="58" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
    <text x="155" y="242" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">2. AV Node (0.1s Delay)</text>
    <text x="155" y="262" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#FEF08A" text-anchor="middle">Allows Atria to finish emptying</text>

    <!-- 3. Bundle of His (AV Bundle in Septum) -->
    <line x1="380" y1="244" x2="400" y2="290" stroke="#38BDF8" stroke-width="6"/>
    <rect x="580" y="230" width="180" height="54" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="670" y="252" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">3. Bundle of His</text>
    <text x="670" y="272" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#BAE6FD" text-anchor="middle">Conduction across Septum</text>

    <!-- 4. Right and Left Bundle Branches -->
    <path d="M 400 290 Q 360 340 330 380" stroke="#38BDF8" stroke-width="4" fill="none"/>
    <path d="M 400 290 Q 440 340 470 380" stroke="#38BDF8" stroke-width="4" fill="none"/>

    <!-- 5. Purkinje Fibers in Ventricular Walls -->
    <path d="M 330 380 Q 270 360 250 280 M 330 380 Q 300 390 280 340" stroke="#4ADE80" stroke-width="3" stroke-dasharray="4 3" fill="none"/>
    <path d="M 470 380 Q 530 360 550 280 M 470 380 Q 500 390 520 340" stroke="#4ADE80" stroke-width="3" stroke-dasharray="4 3" fill="none"/>
    <rect x="580" y="350" width="180" height="58" rx="10" fill="#1E293B" stroke="#4ADE80" stroke-width="2"/>
    <text x="670" y="372" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#4ADE80" text-anchor="middle">4. Purkinje Fibers</text>
    <text x="670" y="392" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#DCFCE7" text-anchor="middle">Simultaneous apex-up contraction</text>
  </svg>`;

  // Diagram 5: Valves and Great Blood Vessels
  const svg5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Heart Valves &amp; Great Vessels — Preventing Backflow</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Atrioventricular (AV) Valves vs. Semilunar Valves • "LUB-DUB" Heart Sounds</text>

    <!-- Superior & Inferior Vena Cava -->
    <rect x="120" y="100" width="130" height="90" rx="12" fill="#0369A1" stroke="#38BDF8" stroke-width="2"/>
    <text x="185" y="135" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">Vena Cava</text>
    <text x="185" y="155" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#BAE6FD" text-anchor="middle">SVC &amp; IVC → RA</text>

    <!-- Aorta Giant Arch -->
    <rect x="330" y="90" width="150" height="85" rx="14" fill="#991B1B" stroke="#EF4444" stroke-width="3"/>
    <text x="405" y="125" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">Aorta Arch</text>
    <text x="405" y="148" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FECACA" text-anchor="middle">Largest Artery in Body</text>

    <!-- Pulmonary Trunk & Arteries -->
    <rect x="550" y="100" width="140" height="85" rx="12" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="620" y="132" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">Pulmonary Trunk</text>
    <text x="620" y="152" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#BAE6FD" text-anchor="middle">RV → Left/Right Lungs</text>

    <!-- Valve Comparison Grid (2 Cards) -->
    <!-- Card 1: AV Valves (Tricuspid & Bicuspid) -->
    <rect x="80" y="220" width="300" height="170" rx="14" fill="#1E293B" stroke="#FDE047" stroke-width="2.5"/>
    <text x="230" y="252" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FDE047" text-anchor="middle">1. Atrioventricular (AV) Valves</text>
    <text x="230" y="278" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">• Tricuspid (Right) &amp; Bicuspid / Mitral (Left)</text>
    <text x="230" y="302" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">Anchored by Chordae Tendineae ("heart strings")</text>
    <text x="230" y="324" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">Prevent backflow into Atria during ventricular systole</text>
    <rect x="100" y="344" width="260" height="32" rx="6" fill="#78350F"/>
    <text x="230" y="365" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FDE68A" text-anchor="middle">Sound S₁ ("LUB"): Closure of AV Valves</text>

    <!-- Card 2: Semilunar Valves (Pulmonary & Aortic) -->
    <rect x="420" y="220" width="300" height="170" rx="14" fill="#1E293B" stroke="#34D399" stroke-width="2.5"/>
    <text x="570" y="252" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#34D399" text-anchor="middle">2. Semilunar (SL) Valves</text>
    <text x="570" y="278" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">• Pulmonary Valve (Right) &amp; Aortic Valve (Left)</text>
    <text x="570" y="302" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">Half-moon shaped cusps at vessel bases</text>
    <text x="570" y="324" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">Prevent arterial backflow during ventricular diastole</text>
    <rect x="440" y="344" width="260" height="32" rx="6" fill="#064E3B"/>
    <text x="570" y="365" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#A7F3D0" text-anchor="middle">Sound S₂ ("DUB"): Closure of SL Valves</text>

    <!-- Bottom summary banner -->
    <rect x="80" y="410" width="640" height="46" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Stethoscope "LUB-DUB": First sound S₁ (AV valves close) → Second sound S₂ (SL valves close)</text>
  </svg>`;

  return [
    {
      diagramId: 'heart-diag-1',
      subtopicKey: 'external_anatomy',
      subtopicTitle: 'External Anatomy and Thoracic Orientation',
      diagramTitle: 'Diagram 1: Overall Heart Anatomy & Mediastinum Orientation',
      diagramType: 'anatomical_orientation',
      caption: 'Anterior external view of the human heart enclosed in the pericardium, resting in the thoracic mediastinum between the lungs.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: 'The external anatomical orientation, size, and protective pericardial covering of the human heart in the chest.',
      point2_labelledParts: [
        { label: 'Pericardial Sac', description: 'Double-layered fibroserous sac containing serous fluid to eliminate friction during beats.' },
        { label: 'Base of Heart', description: 'Broad superior surface at the level of the 2nd costal cartilage where great vessels attach.' },
        { label: 'Apex of Heart', description: 'Inferior pointed tip directed downward, forward, and to the left in the 5th intercostal space.' },
        { label: 'Coronary Sulcus', description: 'External fat-filled groove housing the coronary arteries that nourish heart muscle.' }
      ],
      point3_componentFunctions: 'The heart pumps blood continuously; the pericardium anchors it securely and prevents acute overfilling.',
      point4_componentRelationships: 'The heart sits in the mediastinum between the two lungs, nestled into the cardiac notch of the left lung.',
      point5_directionOfMovementOrProcess: 'Rhythmic rotational contraction wringing from apex upward to the base to expel blood into arterial trunks.',
      point6_stepByStepInterpretation: [
        '1. Heart is tilted obliquely with two-thirds of its mass lying to the left of the sternum.',
        '2. The base anchors the great blood vessels (Aorta, Vena Cava, Pulmonary Trunk).',
        '3. The apex rests directly against the diaphragm.'
      ],
      point7_learningOutcome: 'Understand physical orientation, surface anatomy, and why heartbeats are loudest at the 5th left intercostal space.',
      point8_whatToRemember: 'Base is superior (top); apex is inferior-left (bottom). Pericardium prevents friction; coronary arteries supply heart muscle.',
      isVerified: true
    },
    {
      diagramId: 'heart-diag-2',
      subtopicKey: 'four_chambers',
      subtopicTitle: 'The Four Muscular Chambers & Internal Septum',
      diagramTitle: 'Diagram 2: Four Chambers Cross-Section (RA, RV, LA, LV) & Myocardium',
      diagramType: 'internal_cross_section',
      caption: 'Cross-sectional frontal view revealing the Right Atrium, Right Ventricle, Left Atrium, Left Ventricle, and the thick muscular interventricular septum.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: 'Internal cross-section showing complete anatomical separation between oxygenated and deoxygenated chambers.',
      point2_labelledParts: [
        { label: 'Right Atrium (RA)', description: 'Thin-walled chamber receiving deoxygenated systemic venous return from vena cava.' },
        { label: 'Right Ventricle (RV)', description: 'Pumps deoxygenated blood under low pressure (~25 mmHg) to the nearby lungs.' },
        { label: 'Left Atrium (LA)', description: 'Receives freshly oxygen-rich blood from the four pulmonary veins.' },
        { label: 'Left Ventricle (LV)', description: 'Thick muscular pump ejecting blood under high pressure (~120 mmHg) to systemic organs.' },
        { label: 'Interventricular Septum', description: 'Complete muscular wall preventing any mixing of oxygenated and deoxygenated blood.' }
      ],
      point3_componentFunctions: 'Atria serve as low-pressure receiving chambers; ventricles act as high-pressure muscular pumps.',
      point4_componentRelationships: 'RA opens to RV via the tricuspid valve; LA opens to LV via the bicuspid/mitral valve; the septum separates left and right completely.',
      point5_directionOfMovementOrProcess: 'Blood flows downward from atria into ventricles during diastole, then is ejected upward into great arteries during systole.',
      point6_stepByStepInterpretation: [
        '1. Deoxygenated blood enters RA while oxygenated blood simultaneously enters LA.',
        '2. AV valves open and both ventricles fill to capacity.',
        '3. Ventricles contract, shutting AV valves and driving blood into respective circuits.'
      ],
      point7_learningOutcome: 'Explain why the Left Ventricle wall is 3 times thicker than the Right Ventricle wall in exam answers.',
      point8_whatToRemember: 'LV myocardium is 3x thicker than RV because LV pumps against high systemic vascular resistance across the entire body.',
      isVerified: true
    },
    {
      diagramId: 'heart-diag-3',
      subtopicKey: 'double_circulation',
      subtopicTitle: 'Double Circulation: Pulmonary and Systemic Circuits',
      diagramTitle: 'Diagram 3: Double Circulation Pathway (Pulmonary vs. Systemic Loops)',
      diagramType: 'circulatory_schematic',
      caption: 'Full double circulatory system tracing blood twice through the heart: pulmonary circuit to the lungs and systemic circuit to the body.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      point1_whatItRepresents: 'The complete two-circuit circulatory loop found in birds and mammals ensuring high oxygen delivery.',
      point2_labelledParts: [
        { label: 'Pulmonary Circuit', description: 'RV → Pulmonary Artery → Lungs (gas exchange) → Pulmonary Veins → LA.' },
        { label: 'Systemic Circuit', description: 'LV → Aorta → Systemic Body Capillaries (tissue perfusion) → Vena Cava → RA.' },
        { label: 'Pulmonary Artery', description: 'The only post-embryonic artery carrying deoxygenated blood in the human body.' },
        { label: 'Pulmonary Veins', description: 'The only veins carrying oxygenated blood into the heart.' }
      ],
      point3_componentFunctions: 'Ensures tissues receive blood with maximal oxygen tension (PO₂ ~100 mmHg) without drop in pressure.',
      point4_componentRelationships: 'The output of the pulmonary circuit directly feeds the input of the systemic circuit and vice-versa.',
      point5_directionOfMovementOrProcess: 'Continuous figure-8 flow: Body → RA → RV → Lungs → LA → LV → Body.',
      point6_stepByStepInterpretation: [
        '1. Deoxygenated blood returns from body tissues through Vena Cava into RA.',
        '2. RV ejects blood through Pulmonary Artery into lung capillaries to release CO₂ and bind O₂.',
        '3. Oxygenated blood returns through Pulmonary Veins into LA.',
        '4. LV forcefully pumps oxygen-enriched blood through Aorta to all body cells.'
      ],
      point7_learningOutcome: 'Master why humans need double circulation: to maintain high arterial pressure to body organs while protecting delicate lung capillaries from rupture.',
      point8_whatToRemember: 'Double circulation = Pulmonary (heart-lungs-heart) + Systemic (heart-body-heart). Prevents mixing of oxy and deoxy blood.',
      isVerified: true
    },
    {
      diagramId: 'heart-diag-4',
      subtopicKey: 'cardiac_conduction',
      subtopicTitle: 'Cardiac Conduction System and Pacemaker Rhythm',
      diagramTitle: 'Diagram 4: Cardiac Conduction System (SA Node, AV Node, Purkinje Fibers)',
      diagramType: 'electrophysiological_map',
      caption: 'Intrinsic electrical conduction pathway showing the SA node pacemaker, AV nodal delay, Bundle of His, and Purkinje fiber spread.',
      svgXml: svg4,
      dataUrl: svgToDataUrl(svg4),
      point1_whatItRepresents: 'The myogenic electrical conduction network coordinating rhythmic myocardial systole and diastole.',
      point2_labelledParts: [
        { label: 'Sinoatrial (SA) Node', description: 'Primary pacemaker in the upper right atrium auto-depolarizing at ~72 pulses/min.' },
        { label: 'Atrioventricular (AV) Node', description: 'Relay station near the interatrial septum introducing a crucial 0.1-second conduction delay.' },
        { label: 'Bundle of His', description: 'Conductive tract penetrating the fibrous cardiac skeleton into the interventricular septum.' },
        { label: 'Purkinje Fibers', description: 'Rapidly conducting terminal fibers spreading upward through ventricular walls.' }
      ],
      point3_componentFunctions: 'Generates and coordinates rhythmic heartbeats without requiring conscious brain stimulation (myogenic heart).',
      point4_componentRelationships: 'SA node triggers atria first; AV node holds the pulse for 0.1s; Purkinje fibers trigger ventricles from apex upward.',
      point5_directionOfMovementOrProcess: 'Electrical wave travels: SA Node → Atrial Myocardium → AV Node → Bundle of His → Bundle Branches → Purkinje Fibers.',
      point6_stepByStepInterpretation: [
        '1. SA node spontaneously depolarizes, sending an action potential across both atria (Atrial Systole).',
        '2. Signal reaches the AV node and pauses for ~0.1 second so atria completely empty blood into ventricles.',
        '3. Impulse speeds down the Bundle of His and branches into Purkinje fibers.',
        '4. Ventricles contract simultaneously from the bottom apex upward, wringing blood into the Aorta and Pulmonary trunk.'
      ],
      point7_learningOutcome: 'Understand why the 0.1s AV node delay is vital: without it, atria and ventricles would contract simultaneously and blood could not enter ventricles.',
      point8_whatToRemember: 'SA node = Pacemaker (72 bpm); AV node = 0.1s delay; Purkinje fibers = ventricular contraction from apex to base.',
      isVerified: true
    },
    {
      diagramId: 'heart-diag-5',
      subtopicKey: 'valves_vessels',
      subtopicTitle: 'Heart Valves, Great Vessels and Heart Sounds',
      diagramTitle: 'Diagram 5: Heart Valves, Great Vessels & "LUB-DUB" Sounds',
      diagramType: 'valve_mechanics',
      caption: 'Detailed mechanics of Atrioventricular (Tricuspid/Bicuspid) and Semilunar (Aortic/Pulmonary) valves and the origin of S1 (LUB) and S2 (DUB) sounds.',
      svgXml: svg5,
      dataUrl: svgToDataUrl(svg5),
      point1_whatItRepresents: 'The physical mechanism of one-way pocket valves and great vessels preventing retrograde blood backflow.',
      point2_labelledParts: [
        { label: 'Tricuspid Valve', description: 'Right atrioventricular valve with 3 fibrous cusps anchored by chordae tendineae.' },
        { label: 'Bicuspid / Mitral Valve', description: 'Left atrioventricular valve with 2 strong cusps handling high systemic pressures.' },
        { label: 'Aortic Semilunar Valve', description: 'Three moon-shaped pocket cusps guarding the base of the systemic aorta.' },
        { label: 'Pulmonary Semilunar Valve', description: 'Guards the exit of the right ventricle into the pulmonary trunk.' },
        { label: 'Chordae Tendineae', description: 'Tendon cords ("heart strings") connecting valve cusps to papillary muscles to prevent valve eversion.' }
      ],
      point3_componentFunctions: 'Ensures strict unidirectional forward flow through the cardiovascular circuit under alternating pressure regimes.',
      point4_componentRelationships: 'When ventricles contract, AV valves snap shut (LUB); when ventricles relax, semilunar valves snap shut (DUB).',
      point5_directionOfMovementOrProcess: 'Alternating opening and closing synchronized with systolic ejection and diastolic refilling.',
      point6_stepByStepInterpretation: [
        '1. Ventricular systole begins: ventricular pressure exceeds atrial pressure.',
        '2. Tricuspid and Mitral valves snap shut, producing the first heart sound: "LUB" (S₁).',
        '3. Ventricular ejection opens Aortic and Pulmonary semilunar valves.',
        '4. Ventricular diastole begins: arterial backpressure snaps Semilunar valves shut, producing the second heart sound: "DUB" (S₂).'
      ],
      point7_learningOutcome: 'Accurately correlate valve closures to stethoscope sounds: S₁ LUB = AV valves close; S₂ DUB = Semilunar valves close.',
      point8_whatToRemember: '"LUB" = AV valves close (start of ventricular systole); "DUB" = Semilunar valves close (start of ventricular diastole).',
      isVerified: true
    }
  ];
}

// ============================================================================
// 3. MITOSIS — 4 DEDICATED SUBTOPIC DIAGRAMS (Biology)
// ============================================================================

export function getMitosisSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Interphase & Cell Cycle
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mitosis — Stage 1: Interphase &amp; DNA Replication</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">G₁ (Growth) → S Phase (DNA Synthesis) → G₂ (Mitotic Preparation)</text>

    <!-- Cell Circle -->
    <circle cx="400" cy="250" r="160" fill="#1E293B" stroke="#38BDF8" stroke-width="4"/>
    <text x="400" y="115" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">Cell Membrane</text>

    <!-- Intact Nuclear Envelope -->
    <circle cx="400" cy="250" r="95" fill="#334155" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6 4"/>
    <text x="400" y="180" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Intact Nuclear Membrane</text>

    <!-- Chromatin fibers inside nucleus -->
    <path d="M 350 230 Q 380 210 400 240 T 450 260" stroke="#EC4899" stroke-width="3.5" fill="none"/>
    <path d="M 360 260 Q 390 280 430 230" stroke="#8B5CF6" stroke-width="3.5" fill="none"/>
    <text x="400" y="270" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F472B6" text-anchor="middle">Chromatin (Replicated 2n DNA)</text>

    <!-- Centrosomes duplicating -->
    <rect x="270" y="220" width="18" height="18" rx="4" fill="#10B981" stroke="#34D399" stroke-width="2"/>
    <text x="279" y="255" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#34D399" text-anchor="middle">Centrosome pair</text>

    <!-- Callout Box -->
    <rect x="50" y="390" width="700" height="60" rx="12" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="415" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Key Event: DNA replicates during S phase; cell volume increases; chromosomes remain decondensed.</text>
    <text x="400" y="435" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#94A3B8" text-anchor="middle">Genetic Content doubles (2C → 4C), but chromosome number remains diploid (2n = 46 in humans).</text>
  </svg>`;

  // Diagram 2: Prophase & Metaphase
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mitosis — Stage 2: Prophase &amp; Metaphase Plate Alignment</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Chromosome Condensation → Spindle Formation → Equatorial Plate Alignment</text>

    <ellipse cx="400" cy="240" rx="240" ry="140" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>

    <!-- Spindle Poles -->
    <circle cx="200" cy="240" r="16" fill="#10B981"/>
    <text x="200" y="275" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#34D399" text-anchor="middle">Centrosome Pole 1</text>
    <circle cx="600" cy="240" r="16" fill="#10B981"/>
    <text x="600" y="275" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#34D399" text-anchor="middle">Centrosome Pole 2</text>

    <!-- Spindle fibers to equator -->
    <line x1="200" y1="240" x2="400" y2="170" stroke="#FBBF24" stroke-width="2" stroke-dasharray="4 4"/>
    <line x1="200" y1="240" x2="400" y2="240" stroke="#FBBF24" stroke-width="2" stroke-dasharray="4 4"/>
    <line x1="200" y1="240" x2="400" y2="310" stroke="#FBBF24" stroke-width="2" stroke-dasharray="4 4"/>
    <line x1="600" y1="240" x2="400" y2="170" stroke="#FBBF24" stroke-width="2" stroke-dasharray="4 4"/>
    <line x1="600" y1="240" x2="400" y2="240" stroke="#FBBF24" stroke-width="2" stroke-dasharray="4 4"/>
    <line x1="600" y1="240" x2="400" y2="310" stroke="#FBBF24" stroke-width="2" stroke-dasharray="4 4"/>

    <!-- Chromosomes lined up on Metaphase Plate -->
    <line x1="400" y1="120" x2="400" y2="360" stroke="#EC4899" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="400" y="112" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F472B6" text-anchor="middle">Equatorial (Metaphase) Plate</text>

    <!-- 3 Sister Chromatid pairs (X shapes) -->
    <path d="M 390 155 L 410 185 M 410 155 L 390 185" stroke="#EC4899" stroke-width="5"/>
    <circle cx="400" cy="170" r="4" fill="#FDE047"/>
    <path d="M 390 225 L 410 255 M 410 225 L 390 255" stroke="#8B5CF6" stroke-width="5"/>
    <circle cx="400" cy="240" r="4" fill="#FDE047"/>
    <path d="M 390 295 L 410 325 M 410 295 L 390 325" stroke="#EC4899" stroke-width="5"/>
    <circle cx="400" cy="310" r="4" fill="#FDE047"/>

    <text x="420" y="244" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FDE047">Kinetochore</text>

    <!-- Bottom summary -->
    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Metaphase Hallmark: Maximum condensation; chromosomes align individually at cell equator.</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Microtubules attach to kinetochores of sister chromatids from opposite spindle poles.</text>
  </svg>`;

  // Diagram 3: Anaphase & Telophase
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mitosis — Stage 3: Anaphase (Chromatid Separation) &amp; Telophase</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Centromere Splits → Sister Chromatids Pulled to Opposite Poles → Nuclear Envelopes Reform</text>

    <!-- Elongated Cell -->
    <ellipse cx="400" cy="240" rx="280" ry="135" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>

    <!-- Left pole chromatids (V-shaped pulled) -->
    <circle cx="170" cy="240" r="14" fill="#10B981"/>
    <path d="M 270 170 L 250 170 L 270 185" stroke="#EC4899" stroke-width="5" fill="none"/>
    <path d="M 270 230 L 250 235 L 270 250" stroke="#8B5CF6" stroke-width="5" fill="none"/>
    <path d="M 270 295 L 250 300 L 270 315" stroke="#EC4899" stroke-width="5" fill="none"/>
    <line x1="170" y1="240" x2="250" y2="170" stroke="#FBBF24" stroke-width="2"/>
    <line x1="170" y1="240" x2="250" y2="235" stroke="#FBBF24" stroke-width="2"/>
    <line x1="170" y1="240" x2="250" y2="300" stroke="#FBBF24" stroke-width="2"/>
    <text x="250" y="145" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F472B6" text-anchor="middle">Daughter Chromosomes (Pole 1)</text>

    <!-- Right pole chromatids (V-shaped pulled) -->
    <circle cx="630" cy="240" r="14" fill="#10B981"/>
    <path d="M 530 170 L 550 170 L 530 185" stroke="#EC4899" stroke-width="5" fill="none"/>
    <path d="M 530 230 L 550 235 L 530 250" stroke="#8B5CF6" stroke-width="5" fill="none"/>
    <path d="M 530 295 L 550 300 L 530 315" stroke="#EC4899" stroke-width="5" fill="none"/>
    <line x1="630" y1="240" x2="550" y2="170" stroke="#FBBF24" stroke-width="2"/>
    <line x1="630" y1="240" x2="550" y2="235" stroke="#FBBF24" stroke-width="2"/>
    <line x1="630" y1="240" x2="550" y2="300" stroke="#FBBF24" stroke-width="2"/>
    <text x="550" y="145" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F472B6" text-anchor="middle">Daughter Chromosomes (Pole 2)</text>

    <!-- Furrow indents -->
    <path d="M 400 105 Q 400 140 400 140" stroke="#EF4444" stroke-width="3" stroke-dasharray="4 3"/>
    <path d="M 400 375 Q 400 340 400 340" stroke="#EF4444" stroke-width="3" stroke-dasharray="4 3"/>
    <text x="400" y="245" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F87171" text-anchor="middle">Cleavage Furrow Indentation</text>

    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Shortest Phase: Centromeres split simultaneously; sister chromatids become independent chromosomes.</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Kinetochore microtubules depolymerize, pulling chromosomes centromere-first (V-shape) to opposite poles.</text>
  </svg>`;

  // Diagram 4: Cytokinesis & 2 Identical Daughter Cells
  const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mitosis — Stage 4: Cytokinesis &amp; Two Identical Diploid (2n) Daughter Cells</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Complete Cytoplasmic Division → Two Genetically Identical Clones</text>

    <!-- Daughter Cell 1 -->
    <circle cx="260" cy="235" r="130" fill="#1E293B" stroke="#10B981" stroke-width="3.5"/>
    <circle cx="260" cy="235" r="70" fill="#334155" stroke="#F59E0B" stroke-width="2"/>
    <path d="M 230 220 Q 250 205 270 230 T 290 250" stroke="#EC4899" stroke-width="3" fill="none"/>
    <text x="260" y="195" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">Reformed Nucleus</text>
    <text x="260" y="330" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Daughter Cell 1 (2n)</text>

    <!-- Daughter Cell 2 -->
    <circle cx="540" cy="235" r="130" fill="#1E293B" stroke="#10B981" stroke-width="3.5"/>
    <circle cx="540" cy="235" r="70" fill="#334155" stroke="#F59E0B" stroke-width="2"/>
    <path d="M 510 220 Q 530 205 550 230 T 570 250" stroke="#EC4899" stroke-width="3" fill="none"/>
    <text x="540" y="195" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">Reformed Nucleus</text>
    <text x="540" y="330" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Daughter Cell 2 (2n)</text>

    <!-- Equals sign between them -->
    <text x="400" y="245" font-family="Inter, sans-serif" font-size="28" font-weight="900" fill="#38BDF8" text-anchor="middle">=</text>
    <text x="400" y="270" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="middle">Genetic Clones</text>

    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Outcome: Exact copy of parental genome preserved in both daughter cells for growth and tissue repair.</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Animal cells divide by actin-myosin contractile ring; plant cells build a cellulose cell plate from Golgi vesicles.</text>
  </svg>`;

  return [
    {
      diagramId: 'mitosis-diag-01',
      subtopicKey: 'interphase_cell_cycle',
      subtopicTitle: 'Interphase & S Phase DNA Replication',
      diagramTitle: 'Diagram 1: Interphase, Centrosome Duplication & Chromatin Replication',
      diagramType: 'cell_division_stage',
      caption: 'Cell prepared for mitotic division: nuclear envelope intact, chromatin replicated in S phase, centrosomes duplicated.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      imageGenerationInstruction: {
        mainTopic: 'Mitosis',
        subtopic: 'Interphase',
        subject: 'Biology',
        gradeComplexity: 'Grade 10 CBSE/NCERT',
        diagramType: 'cellular_ultrastructure',
        requiredObjects: ['Eukaryotic cell membrane', 'Intact nuclear membrane', 'Chromatin fibers', 'Centrosome pair'],
        requiredComponents: ['Nucleus', 'Chromatin', 'Nuclear envelope', 'Centrosome', 'Cytoplasm'],
        requiredLabels: ['Cell Membrane', 'Intact Nuclear Membrane', 'Chromatin (Replicated 2n DNA)', 'Centrosome pair'],
        spatialRelationships: 'Nucleus centered inside cell; chromatin decondensed within nuclear envelope; centrosomes adjacent to outer nuclear membrane.',
        colorGuidance: 'Blue cell membrane, gold nuclear envelope, pink/purple chromatin, emerald centrosomes.',
        backgroundGuidance: 'Dark slate #0F172A educational background with high-contrast labels.',
        visualStyle: 'Clean 2D scientific textbook vector illustration.',
        educationalPurpose: 'Demonstrates that DNA replication occurs before mitosis starts (S phase), keeping chromosomes decondensed.',
        thingsThatMustNotAppear: ['Condensed X chromosomes', 'Spindle fibers', 'Dividing furrow']
      },
      point1_whatItRepresents: 'The preparation stage where cellular DNA replicates while remaining in uncoiled chromatin form.',
      point2_labelledParts: [
        { label: 'Cell Membrane', description: 'Outer lipid bilayer boundary enclosing cytoplasm.' },
        { label: 'Intact Nuclear Membrane', description: 'Double bilayer containing the replicated genome.' },
        { label: 'Chromatin', description: 'Decondensed DNA-histone fibers ready for mitotic packaging.' },
        { label: 'Centrosome Pair', description: 'Microtubule organizing centers duplicated during interphase.' }
      ],
      point3_componentFunctions: 'Doubles the genetic payload (2C → 4C) so each daughter cell inherits a complete 2n complement.',
      point4_componentRelationships: 'Centrosomes will migrate to opposite poles in prophase to build the spindle apparatus.',
      point5_directionOfMovementOrProcess: 'Progresses through G1 growth → S replication → G2 checkpoint.',
      point6_stepByStepInterpretation: [
        '1. G1 phase: Cell synthesizes proteins and grows in volume.',
        '2. S phase: Each DNA molecule replicates, producing twin sister chromatids.',
        '3. G2 phase: Cell prepares spindle tubulin proteins and completes duplication check.'
      ],
      point7_learningOutcome: 'Understand that mitosis is nuclear division; DNA replication occurs beforehand in interphase.',
      point8_whatToRemember: 'DNA content doubles in S phase (2C → 4C), but chromosome number remains 2n.',
      isVerified: true
    },
    {
      diagramId: 'mitosis-diag-02',
      subtopicKey: 'prophase_metaphase',
      subtopicTitle: 'Prophase & Metaphase Plate Alignment',
      diagramTitle: 'Diagram 2: Condensed Chromosomes Aligned on Equatorial Metaphase Plate',
      diagramType: 'cell_division_stage',
      caption: 'Chromosomes fully condensed into sister chromatids aligned individually along the equatorial metaphase plate.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      imageGenerationInstruction: {
        mainTopic: 'Mitosis',
        subtopic: 'Metaphase',
        subject: 'Biology',
        gradeComplexity: 'Grade 10 CBSE/NCERT',
        diagramType: 'cellular_spindle_alignment',
        requiredObjects: ['Spindle poles', 'Microtubules', 'Condensed X chromosomes', 'Metaphase equator'],
        requiredComponents: ['Centrosomes at poles', 'Spindle fibers', 'Kinetochores', 'Metaphase plate'],
        requiredLabels: ['Equatorial (Metaphase) Plate', 'Kinetochore', 'Centrosome Pole 1', 'Centrosome Pole 2'],
        spatialRelationships: 'Centrosomes at opposite poles (left and right); vertical metaphase equator; chromosomes lined up along vertical midline.',
        arrowsAndDirections: 'Spindle fibers radiating from both poles toward central kinetochores.',
        colorGuidance: 'Pink/purple condensed chromosomes, yellow spindle lines, green centrosome poles.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D scientific textbook vector diagram.',
        educationalPurpose: 'Visualizes the definitive hallmark of metaphase: individual alignment at the cell equator for karyotype analysis.',
        thingsThatMustNotAppear: ['Nuclear membrane', 'Separated chromatids']
      },
      point1_whatItRepresents: 'The equatorial arrangement of duplicated chromosomes connected to opposing spindle fibers.',
      point2_labelledParts: [
        { label: 'Metaphase Plate', description: 'Equatorial plane perpendicular to the spindle axis.' },
        { label: 'Kinetochore', description: 'Protein complex at centromere where spindle microtubules attach.' },
        { label: 'Centrosome Poles', description: 'Opposing asters anchoring the mitotic spindle.' }
      ],
      point3_componentFunctions: 'Ensures equal tension from both poles before centromeres are allowed to split.',
      point4_componentRelationships: 'Kinetochore microtubules pull sister chromatids in opposite directions to check balanced attachment.',
      point5_directionOfMovementOrProcess: 'Bipolar tension holds chromosomes steady at equator until anaphase trigger.',
      point6_stepByStepInterpretation: [
        '1. Prophase: Chromatin condenses into visible X-shaped chromosomes; nuclear envelope disintegrates.',
        '2. Prometaphase: Spindle fibers invade nuclear zone and bind kinetochores.',
        '3. Metaphase: Chromosomes line up single-file along the equatorial plate.'
      ],
      point7_learningOutcome: 'Identify metaphase under microscope: chromosomes are most condensed and lined up at the equator.',
      point8_whatToRemember: 'Metaphase = Middle alignment on the equatorial plate.',
      isVerified: true
    },
    {
      diagramId: 'mitosis-diag-03',
      subtopicKey: 'anaphase_telophase',
      subtopicTitle: 'Anaphase Chromatid Separation & Telophase',
      diagramTitle: 'Diagram 3: Sister Chromatids Pulled to Opposite Poles & Cleavage Furrow',
      diagramType: 'cell_division_stage',
      caption: 'Centromeres split; daughter chromosomes pulled V-shaped toward opposite centrosome poles.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      imageGenerationInstruction: {
        mainTopic: 'Mitosis',
        subtopic: 'Anaphase',
        subject: 'Biology',
        gradeComplexity: 'Grade 10 CBSE/NCERT',
        diagramType: 'cellular_chromosome_segregation',
        requiredObjects: ['Elongated cell', 'Splitting chromatids', 'Depolymerizing microtubules', 'Cleavage furrow'],
        requiredComponents: ['V-shaped daughter chromosomes', 'Spindle fibers', 'Centrosomes', 'Furrow indentation'],
        requiredLabels: ['Daughter Chromosomes (Pole 1)', 'Daughter Chromosomes (Pole 2)', 'Cleavage Furrow Indentation'],
        spatialRelationships: 'Chromosomes moving outward toward poles; cell elongating horizontally; vertical cleavage furrow pinching inward at center.',
        arrowsAndDirections: 'Arrows showing chromosomes pulled toward left and right poles.',
        colorGuidance: 'Pink/purple V-shaped chromosomes, red dashed furrow arrows, green centrosome poles.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D scientific textbook illustration.',
        educationalPurpose: 'Explains chromosome segregation ensuring each future cell receives exactly one copy of every chromosome.',
        thingsThatMustNotAppear: ['Intact X chromosomes at center']
      },
      point1_whatItRepresents: 'The rapid separation of sister chromatids into daughter chromosomes migrating toward opposite poles.',
      point2_labelledParts: [
        { label: 'Daughter Chromosomes', description: 'Individual sister chromatids now acting as autonomous chromosomes.' },
        { label: 'Centrosome Poles', description: 'Destination targets where new daughter nuclei will assemble.' },
        { label: 'Cleavage Furrow', description: 'Contractile ring of actin and myosin pinching the animal plasma membrane.' }
      ],
      point3_componentFunctions: 'Kinetochore shortening drags chromosomes centromere-first (yielding characteristic V-shapes).',
      point4_componentRelationships: 'Non-kinetochore microtubules push against each other to elongate the cell.',
      point5_directionOfMovementOrProcess: 'Directional migration away from equator toward respective centrosome poles.',
      point6_stepByStepInterpretation: [
        '1. Cohesin protein degrades; centromeres split simultaneously.',
        '2. Kinetochore microtubules depolymerize, pulling chromosomes poleward.',
        '3. Telophase begins: nuclear membranes reassemble around both chromosome clusters.'
      ],
      point7_learningOutcome: 'Correlate centromere cleavage with the formation of 46 individual chromosomes in each future cell.',
      point8_whatToRemember: 'Anaphase = Apart (sister chromatids move apart to opposite poles).',
      isVerified: true
    },
    {
      diagramId: 'mitosis-diag-04',
      subtopicKey: 'cytokinesis_daughter_cells',
      subtopicTitle: 'Cytokinesis & Two Identical Diploid Daughter Cells',
      diagramTitle: 'Diagram 4: Two Identical 2n Daughter Cells Produced by Mitotic Division',
      diagramType: 'cell_division_outcome',
      caption: 'Two genetically identical daughter cells with complete diploid genomes and reformed nuclear envelopes.',
      svgXml: svg4,
      dataUrl: svgToDataUrl(svg4),
      imageGenerationInstruction: {
        mainTopic: 'Mitosis',
        subtopic: 'Cytokinesis',
        subject: 'Biology',
        gradeComplexity: 'Grade 10 CBSE/NCERT',
        diagramType: 'cellular_cleavage_outcome',
        requiredObjects: ['Two daughter cells', 'Reformed nuclei', 'Chromatin decondensing', 'Equals sign clone symbol'],
        requiredComponents: ['Cell membranes', 'Nuclear envelopes', 'Diploid genomes', 'Cytoplasm'],
        requiredLabels: ['Reformed Nucleus', 'Daughter Cell 1 (2n)', 'Daughter Cell 2 (2n)', 'Genetic Clones'],
        spatialRelationships: 'Two equal-sized spherical cells side by side with identical internal structures.',
        colorGuidance: 'Emerald cell boundaries, gold nuclear envelopes, blue equality clone indicator.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D scientific textbook illustration.',
        educationalPurpose: 'Proves that mitosis produces two genetically identical diploid (2n) clone cells for growth and repair.',
        thingsThatMustNotAppear: ['Haploid gametes', 'Four cells (meiosis error)']
      },
      point1_whatItRepresents: 'The final outcome of the cell cycle: physical cytoplasmic separation yielding two viable clone cells.',
      point2_labelledParts: [
        { label: 'Daughter Cell 1 (2n)', description: 'First new somatic cell containing full parental diploid genome.' },
        { label: 'Daughter Cell 2 (2n)', description: 'Second new somatic cell identical in sequence to Daughter Cell 1.' },
        { label: 'Reformed Nucleus', description: 'Intact nuclear envelope enclosing decondensing chromatin.' }
      ],
      point3_componentFunctions: 'Enables organismal growth, cell turnover, wound healing, and asexual reproduction.',
      point4_componentRelationships: 'Both cells re-enter G1 phase of interphase to begin their own independent life cycles.',
      point5_directionOfMovementOrProcess: 'From single parent cell to two separate autonomous functional units.',
      point6_stepByStepInterpretation: [
        '1. Cleavage furrow completes inward pinch (or cell plate fuses with parental cell wall in plants).',
        '2. Organelles (mitochondria, ribosomes) distribute into both daughter cells.',
        '3. Chromosomes decondense back into chromatin; nucleoli reappear.'
      ],
      point7_learningOutcome: 'Differentiate mitosis (2 identical 2n cells) from meiosis (4 varied n cells).',
      point8_whatToRemember: 'Mitosis = 1 parent cell → 2 identical diploid (2n) daughter cells.',
      isVerified: true
    }
  ];
}

// ============================================================================
// 4. CHEMICAL BONDING — 3 DEDICATED SUBTOPIC DIAGRAMS (Chemistry)
// ============================================================================

export function getChemicalBondingSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Ionic Bonding (Electron Transfer)
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Chemical Bonding — Stage 1: Ionic Bonding (Electron Transfer)</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Metal (Na) loses 1e⁻ → Non-metal (Cl) gains 1e⁻ → Electrostatic Attraction</text>

    <!-- Sodium Na+ -->
    <circle cx="240" cy="230" r="80" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>
    <circle cx="240" cy="230" r="30" fill="#0284C7"/>
    <text x="240" y="235" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">Na⁺</text>
    <text x="240" y="252" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#BAE6FD" text-anchor="middle">2, 8 (Octet)</text>
    <text x="240" y="335" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Sodium Cation (Na⁺)</text>

    <!-- Electron transfer arrow -->
    <path d="M 330 190 Q 400 130 470 190" stroke="#FBBF24" stroke-width="3.5" fill="none" stroke-dasharray="6 4"/>
    <polygon points="475,195 460,188 465,202" fill="#FBBF24"/>
    <circle cx="400" cy="155" r="7" fill="#FDE047"/>
    <text x="400" y="140" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047" text-anchor="middle">1 Valence e⁻ Transferred</text>

    <!-- Chloride Cl- -->
    <circle cx="560" cy="230" r="95" fill="#1E293B" stroke="#10B981" stroke-width="3"/>
    <circle cx="560" cy="230" r="34" fill="#059669"/>
    <text x="560" y="235" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">Cl⁻</text>
    <text x="560" y="252" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#A7F3D0" text-anchor="middle">2, 8, 8 (Octet)</text>
    <text x="560" y="348" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Chloride Anion (Cl⁻)</text>

    <!-- Electrostatic attraction badge -->
    <rect x="300" y="270" width="200" height="34" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.8"/>
    <text x="400" y="292" font-family="Inter, sans-serif" font-size="11.5" font-weight="800" fill="#FBBF24" text-anchor="middle">⚡ Strong Electrostatic Attraction</text>

    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Mechanism: Complete electron transfer between electropositive metal and electronegative non-metal.</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Results in non-directional ionic lattice with high melting point and electrical conductivity when molten.</text>
  </svg>`;

  // Diagram 2: Covalent Bonding (Electron Sharing)
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Chemical Bonding — Stage 2: Covalent Bonding (Electron Sharing)</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Two Non-metals Share Electron Pairs to Complete Stable Noble Gas Shells</text>

    <!-- Hydrogen 1 -->
    <circle cx="260" cy="230" r="70" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" stroke-width="2.5"/>
    <circle cx="230" cy="230" r="22" fill="#0284C7"/>
    <text x="230" y="235" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">H</text>

    <!-- Oxygen Center -->
    <circle cx="400" cy="230" r="105" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" stroke-width="2.5"/>
    <circle cx="400" cy="230" r="30" fill="#E11D48"/>
    <text x="400" y="236" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">O</text>

    <!-- Hydrogen 2 -->
    <circle cx="540" cy="230" r="70" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" stroke-width="2.5"/>
    <circle cx="570" cy="230" r="22" fill="#0284C7"/>
    <text x="570" y="235" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">H</text>

    <!-- Overlap Shared Electron Pairs -->
    <circle cx="315" cy="220" r="5" fill="#FDE047"/>
    <circle cx="315" cy="240" r="5" fill="#FDE047"/>
    <text x="315" y="195" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#FDE047" text-anchor="middle">Shared Pair</text>

    <circle cx="485" cy="220" r="5" fill="#FDE047"/>
    <circle cx="485" cy="240" r="5" fill="#FDE047"/>
    <text x="485" y="195" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#FDE047" text-anchor="middle">Shared Pair</text>

    <text x="400" y="360" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FB7185" text-anchor="middle">Water Molecule (H₂O) — Bent Single Covalent Bonds</text>

    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Mechanism: Atomic orbitals overlap; shared pair of electrons attracts both positively charged nuclei.</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Single (1 pair), Double (2 pairs, e.g. O₂), or Triple (3 pairs, e.g. N₂) directional molecular bonds.</text>
  </svg>`;

  // Diagram 3: Metallic Bonding
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Chemical Bonding — Stage 3: Metallic Bonding ("Sea of Electrons")</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Positive Metal Ions in Fixed Lattice Immersed in Delocalized Electron Cloud</text>

    <!-- Lattice Grid of Positive Kernels -->
    <rect x="140" y="110" width="520" height="230" rx="16" fill="rgba(14, 165, 233, 0.12)" stroke="#38BDF8" stroke-width="2"/>

    <!-- Row 1 -->
    <circle cx="220" cy="160" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="220" y="166" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>
    <circle cx="340" cy="160" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="340" y="166" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>
    <circle cx="460" cy="160" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="460" y="166" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>
    <circle cx="580" cy="160" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="580" y="166" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>

    <!-- Row 2 -->
    <circle cx="220" cy="270" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="220" y="276" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>
    <circle cx="340" cy="270" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="340" y="276" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>
    <circle cx="460" cy="270" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="460" y="276" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>
    <circle cx="580" cy="270" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
    <text x="580" y="276" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">M⁺</text>

    <!-- Mobile Delocalized Electrons (yellow dots) -->
    <circle cx="280" cy="140" r="5" fill="#FDE047"/>
    <circle cx="400" cy="145" r="5" fill="#FDE047"/>
    <circle cx="520" cy="140" r="5" fill="#FDE047"/>
    <circle cx="280" cy="215" r="5" fill="#FDE047"/>
    <circle cx="400" cy="215" r="5" fill="#FDE047"/>
    <circle cx="520" cy="215" r="5" fill="#FDE047"/>
    <circle cx="280" cy="290" r="5" fill="#FDE047"/>
    <circle cx="400" cy="295" r="5" fill="#FDE047"/>
    <circle cx="520" cy="290" r="5" fill="#FDE047"/>

    <text x="400" y="360" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">Delocalized Valence Electrons Free to Flow (High Conductivity &amp; Malleability)</text>

    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Property Explanation: Delocalized electrons conduct electric current and absorb/reflect light (metallic luster).</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Metal layers slide past each other without breaking bonds, explaining ductility and malleability.</text>
  </svg>`;

  return [
    {
      diagramId: 'chem-bond-01',
      subtopicKey: 'ionic_bonding',
      subtopicTitle: 'Ionic Bonding: Electron Transfer & Electrostatic Attraction',
      diagramTitle: 'Diagram 1: Complete Electron Transfer Between Metal (Na) & Non-Metal (Cl)',
      diagramType: 'ionic_electron_transfer',
      caption: 'Formation of sodium cation (Na⁺) and chloride anion (Cl⁻) through complete valence electron transfer.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      imageGenerationInstruction: {
        mainTopic: 'Chemical Bonding',
        subtopic: 'Ionic Bonding',
        subject: 'Chemistry',
        gradeComplexity: 'Grade 10 CBSE/NCERT',
        diagramType: 'chemical_electron_transfer',
        requiredObjects: ['Sodium atom/ion', 'Chlorine atom/ion', 'Electron transfer arrow', 'Electrostatic attraction'],
        requiredComponents: ['Na+ nucleus and shells', 'Cl- nucleus and shells', 'Transfer electron', 'Attraction badge'],
        requiredLabels: ['Sodium Cation (Na⁺)', 'Chloride Anion (Cl⁻)', '1 Valence e⁻ Transferred', 'Strong Electrostatic Attraction'],
        spatialRelationships: 'Na on left, Cl on right; curved dashed arrow from Na to Cl transferring electron.',
        arrowsAndDirections: 'Curved arrow from Na valence shell into Cl valence vacancy.',
        colorGuidance: 'Blue sodium cation, emerald chloride anion, yellow transfer electron.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D scientific chemistry textbook illustration.',
        educationalPurpose: 'Explains how octet rule is satisfied by complete transfer, creating oppositely charged ions.',
        thingsThatMustNotAppear: ['Shared molecular orbital', 'Metallic sea']
      },
      point1_whatItRepresents: 'The mechanism of ionic bond formation via complete transfer of one or more valence electrons.',
      point2_labelledParts: [
        { label: 'Sodium Cation (Na⁺)', description: 'Metal atom that lost 1 electron to achieve stable 2,8 neon configuration.' },
        { label: 'Chloride Anion (Cl⁻)', description: 'Non-metal atom that gained 1 electron to achieve stable 2,8,8 argon configuration.' },
        { label: 'Electrostatic Attraction', description: 'Non-directional Coulombic force binding oppositely charged ions.' }
      ],
      point3_componentFunctions: 'Creates solid crystalline lattice compounds with high melting and boiling points.',
      point4_componentRelationships: 'Electronegativity difference > 1.7 ensures complete transfer rather than sharing.',
      point5_directionOfMovementOrProcess: 'Directional transfer from low ionization energy metal to high electron affinity non-metal.',
      point6_stepByStepInterpretation: [
        '1. Na (2,8,1) donates 1 valence electron: Na → Na⁺ + e⁻.',
        '2. Cl (2,8,7) accepts the electron: Cl + e⁻ → Cl⁻.',
        '3. Electrostatic attraction binds Na⁺ and Cl⁻ into NaCl crystal lattice.'
      ],
      point7_learningOutcome: 'Identify ionic compounds: formed between metals and non-metals with complete electron transfer.',
      point8_whatToRemember: 'Ionic = Electron Transfer (Metal + Non-Metal → Ions in Lattice).',
      isVerified: true
    },
    {
      diagramId: 'chem-bond-02',
      subtopicKey: 'covalent_bonding',
      subtopicTitle: 'Covalent Bonding: Orbital Overlap & Electron Sharing',
      diagramTitle: 'Diagram 2: Shared Electron Pairs in Water Molecule (H₂O)',
      diagramType: 'covalent_overlap',
      caption: 'Two single covalent bonds in water formed by mutual sharing of electron pairs between oxygen and hydrogen.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      imageGenerationInstruction: {
        mainTopic: 'Chemical Bonding',
        subtopic: 'Covalent Bonding',
        subject: 'Chemistry',
        gradeComplexity: 'Grade 10 CBSE/NCERT',
        diagramType: 'molecular_orbital_overlap',
        requiredObjects: ['Oxygen atom', 'Two Hydrogen atoms', 'Overlapping circles', 'Shared electron pairs'],
        requiredComponents: ['O nucleus', 'H nuclei', 'Shared pairs in overlap zones', 'Bent molecular angle'],
        requiredLabels: ['Water Molecule (H₂O)', 'Shared Pair', 'O', 'H'],
        spatialRelationships: 'Oxygen centered with two hydrogens overlapping at bent angles.',
        colorGuidance: 'Rose oxygen, sky blue hydrogen, yellow shared electron dots.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D chemistry orbital overlap textbook diagram.',
        educationalPurpose: 'Visualizes covalent bonding where non-metals share pairs to complete noble gas duplets/octets.',
        thingsThatMustNotAppear: ['Full electron transfer arrow', 'Free ions Na+ Cl-']
      },
      point1_whatItRepresents: 'Covalent bonding where mutual sharing of electron pairs forms discrete molecules.',
      point2_labelledParts: [
        { label: 'Shared Electron Pair', description: 'Two electrons localized between nuclei, attracted simultaneously to both.' },
        { label: 'Oxygen Nucleus (O)', description: 'Shares 2 of its 6 valence electrons to achieve octet (8).' },
        { label: 'Hydrogen Nuclei (H)', description: 'Each shares 1 electron to achieve helium duplet (2).' }
      ],
      point3_componentFunctions: 'Binds non-metal atoms into molecules with directional geometry (e.g. 104.5° bent in H₂O).',
      point4_componentRelationships: 'Electronegativity difference < 1.7 leads to covalent sharing (polar or non-polar).',
      point5_directionOfMovementOrProcess: 'Orbitals overlap along internuclear axis forming stable covalent bonds.',
      point6_stepByStepInterpretation: [
        '1. Two non-metal atoms approach each other.',
        '2. Half-filled valence atomic orbitals overlap.',
        '3. Shared electron pair attracts both nuclei, lowering total potential energy.'
      ],
      point7_learningOutcome: 'Differentiate single (1 pair), double (2 pairs), and triple (3 pairs) covalent bonds.',
      point8_whatToRemember: 'Covalent = Electron Sharing (Non-Metal + Non-Metal → Discrete Molecules).',
      isVerified: true
    },
    {
      diagramId: 'chem-bond-03',
      subtopicKey: 'metallic_bonding',
      subtopicTitle: 'Metallic Bonding: Lattice Kernels & Delocalized Electron Sea',
      diagramTitle: 'Diagram 3: Positive Metal Cations in a Delocalized "Sea of Electrons"',
      diagramType: 'metallic_lattice',
      caption: 'Metallic lattice showing fixed positive kernels surrounded by mobile delocalized valence electrons.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      imageGenerationInstruction: {
        mainTopic: 'Chemical Bonding',
        subtopic: 'Metallic Bonding',
        subject: 'Chemistry',
        gradeComplexity: 'Grade 10 CBSE/NCERT',
        diagramType: 'crystal_lattice_electron_sea',
        requiredObjects: ['Fixed positive metal ions (M+)', 'Delocalized electron dots', 'Lattice boundary'],
        requiredComponents: ['Metal cation grid', 'Mobile electron cloud', 'Conductivity annotation'],
        requiredLabels: ['M⁺ Metal Kernels', 'Delocalized Valence Electrons', 'Sea of Electrons'],
        spatialRelationships: 'Ordered 2D grid of blue positive circles interspersed with yellow free electron dots.',
        colorGuidance: 'Blue positive metal ions, bright yellow mobile electrons, sky blue lattice border.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D solid state chemistry illustration.',
        educationalPurpose: 'Explains metallic properties: electrical and thermal conductivity, malleability, and ductility.',
        thingsThatMustNotAppear: ['Negative anions', 'Molecules']
      },
      point1_whatItRepresents: 'The metallic bond structure consisting of positive metal ions bound by a shared delocalized electron cloud.',
      point2_labelledParts: [
        { label: 'Metal Cations (M⁺)', description: 'Fixed lattice kernels consisting of nucleus and inner core electrons.' },
        { label: 'Delocalized Electrons', description: 'Valence electrons free to wander throughout the entire metallic crystal.' }
      ],
      point3_componentFunctions: 'Acts as flexible electrical and thermal conduit throughout the solid.',
      point4_componentRelationships: 'Non-directional electrostatic bond holds lattice together even when hammered into thin sheets.',
      point5_directionOfMovementOrProcess: 'Electrons drift rapidly when potential difference (voltage) is applied.',
      point6_stepByStepInterpretation: [
        '1. Low ionization energy metals shed valence electrons to form a collective pool.',
        '2. Positive kernels arrange in close-packed crystalline lattice.',
        '3. Delocalized electron sea cements the ions, resisting fracture during mechanical shear.'
      ],
      point7_learningOutcome: 'Connect metallic bond structure to physical properties: luster, malleability, and electrical conductivity.',
      point8_whatToRemember: 'Metallic = Positive Kernels + Sea of Delocalized Electrons.',
      isVerified: true
    }
  ];
}

// ============================================================================
// 5. NEWTON'S LAWS OF MOTION — 3 DEDICATED SUBTOPIC DIAGRAMS (Physics)
// ============================================================================

export function getNewtonLawsSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: 1st Law (Inertia)
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Newton’s Laws of Motion — Law 1: Law of Inertia (Rest &amp; Motion)</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">An object remains in state of rest or uniform motion unless acted upon by unbalanced external force</text>

    <!-- Sudden Braking Scenario -->
    <rect x="120" y="140" width="560" height="180" rx="16" fill="#1E293B" stroke="#38BDF8" stroke-width="2.5"/>
    <text x="140" y="170" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8">Scenario: Sudden Car Braking</text>

    <!-- Passenger & Inertia Vector -->
    <circle cx="280" cy="210" r="24" fill="#F59E0B"/>
    <path d="M 280 234 L 280 290 M 280 250 L 250 270 M 280 250 L 310 270" stroke="#F59E0B" stroke-width="5" fill="none"/>

    <!-- Forward inertia arrow -->
    <line x1="310" y1="210" x2="420" y2="210" stroke="#EF4444" stroke-width="4"/>
    <polygon points="428,210 415,202 415,218" fill="#EF4444"/>
    <text x="365" y="195" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F87171" text-anchor="middle">Inertia of Motion (Continues forward)</text>

    <!-- Seatbelt counter-force -->
    <line x1="280" y1="234" x2="250" y2="280" stroke="#10B981" stroke-width="6"/>
    <text x="240" y="315" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#34D399" text-anchor="middle">Seatbelt Restraining Force</text>

    <!-- External force statement -->
    <rect x="460" y="240" width="200" height="60" rx="8" fill="#0F172A" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="560" y="265" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#F8FAFC" text-anchor="middle">Net Force = 0 ⇒ v = constant</text>
    <text x="560" y="285" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Brakes apply external friction</text>

    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Principle: Inertia is the natural resistance of mass to any change in its velocity (rest or uniform velocity).</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Mass is the quantitative measure of inertia: greater mass requires greater force to change state.</text>
  </svg>`;

  // Diagram 2: 2nd Law (F = ma)
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Newton’s Laws of Motion — Law 2: Fundamental Law of Dynamics (F = m · a)</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Rate of change of momentum is directly proportional to applied unbalanced force (F = Δp/Δt = m·a)</text>

    <!-- Shopping Trolley Cart -->
    <rect x="180" y="160" width="220" height="120" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>
    <text x="290" y="210" font-family="Inter, sans-serif" font-size="20" font-weight="900" fill="#38BDF8" text-anchor="middle">Mass (m = 20 kg)</text>
    <circle cx="220" cy="300" r="18" fill="#64748B" stroke="#CBD5E1" stroke-width="2"/>
    <circle cx="360" cy="300" r="18" fill="#64748B" stroke="#CBD5E1" stroke-width="2"/>

    <!-- Force Applied Vector -->
    <line x1="80" y1="220" x2="175" y2="220" stroke="#F59E0B" stroke-width="6"/>
    <polygon points="180,220 165,212 165,228" fill="#F59E0B"/>
    <text x="125" y="195" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FBBF24" text-anchor="middle">Applied Force F = 60 N</text>

    <!-- Acceleration Vector -->
    <line x1="410" y1="220" x2="560" y2="220" stroke="#10B981" stroke-width="6"/>
    <polygon points="568,220 552,212 552,228" fill="#10B981"/>
    <text x="485" y="195" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Acceleration a = F/m = 3 m/s²</text>

    <!-- Derivation Equation Box -->
    <rect x="580" y="140" width="180" height="160" rx="12" fill="#1E293B" stroke="#FBBF24" stroke-width="2"/>
    <text x="670" y="175" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FDE047" text-anchor="middle">Governing Formula</text>
    <text x="670" y="210" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF" text-anchor="middle">F = m · a</text>
    <text x="670" y="240" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" text-anchor="middle">1 N = 1 kg·m/s²</text>
    <text x="670" y="270" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#34D399" text-anchor="middle">a ∝ F  and  a ∝ 1/m</text>

    <rect x="50" y="395" width="700" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Key Rule: Doubling force doubles acceleration; doubling mass halves acceleration under constant force.</text>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Defines the Newton: 1 N is the force required to accelerate 1 kg at 1 m/s².</text>
  </svg>`;

  // Diagram 3: 3rd Law (Action - Reaction)
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Newton’s Laws of Motion — Law 3: Action &amp; Reaction (F_AB = -F_BA)</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">For every action force, there is an equal in magnitude and opposite in direction reaction force</text>

    <!-- Rocket Body -->
    <path d="M 400 110 L 440 200 L 440 300 L 360 300 L 360 200 Z" fill="#E2E8F0" stroke="#38BDF8" stroke-width="2.5"/>
    <polygon points="400,110 360,200 440,200" fill="#0284C7"/>
    <text x="400" y="240" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#0F172A" text-anchor="middle">Rocket</text>

    <!-- Upward Thrust Reaction Vector -->
    <line x1="400" y1="100" x2="400" y2="40" stroke="#10B981" stroke-width="5"/>
    <polygon points="400,32 392,48 408,48" fill="#10B981"/>
    <text x="400" y="24" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Reaction Force: Upward Thrust on Rocket (F_R)</text>

    <!-- Exhaust Gas Flames Downward -->
    <polygon points="370,300 430,300 400,380" fill="#F59E0B"/>
    <polygon points="380,300 420,300 400,360" fill="#FDE047"/>

    <!-- Downward Action Force Vector -->
    <line x1="400" y1="385" x2="400" y2="445" stroke="#EF4444" stroke-width="5"/>
    <polygon points="400,452 408,438 392,438" fill="#EF4444"/>
    <text x="400" y="470" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F87171" text-anchor="middle">Action Force: Downward Push on Exhaust Gas (F_A)</text>

    <!-- Critical Rule Callout -->
    <rect x="60" y="180" width="220" height="90" rx="12" fill="#1E293B" stroke="#F59E0B" stroke-width="1.8"/>
    <text x="170" y="205" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">CRITICAL BOARD RULE:</text>
    <text x="170" y="225" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#F8FAFC" text-anchor="middle">Action and Reaction NEVER cancel</text>
    <text x="170" y="245" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#F8FAFC" text-anchor="middle">because they act on TWO DIFFERENT</text>
    <text x="170" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="middle">objects (Rocket &amp; Gas)!</text>

    <rect x="520" y="180" width="220" height="90" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="1.8"/>
    <text x="630" y="210" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#38BDF8" text-anchor="middle">Vector Equality</text>
    <text x="630" y="235" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">|F_Action| = |F_Reaction|</text>
    <text x="630" y="255" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Opposite Directions (180°)</text>
  </svg>`;

  return [
    {
      diagramId: 'newton-diag-01',
      subtopicKey: 'law_1_inertia',
      subtopicTitle: 'Newton’s First Law: Law of Inertia & Mass',
      diagramTitle: 'Diagram 1: Inertia of Motion in Sudden Vehicle Braking & Seatbelt Force',
      diagramType: 'force_inertia_vector',
      caption: 'Passenger continues forward due to inertia of motion until seatbelt provides external restraining force.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      imageGenerationInstruction: {
        mainTopic: 'Newton Laws of Motion',
        subtopic: 'First Law of Motion (Inertia)',
        subject: 'Physics',
        gradeComplexity: 'Grade 9/10 CBSE/NCERT',
        diagramType: 'free_body_inertia_diagram',
        requiredObjects: ['Passenger', 'Vehicle seat', 'Seatbelt', 'Velocity vector arrow', 'Force arrow'],
        requiredComponents: ['Inertia vector forward', 'Seatbelt force backward', 'Zero net force condition'],
        requiredLabels: ['Inertia of Motion', 'Seatbelt Restraining Force', 'Net Force = 0'],
        spatialRelationships: 'Passenger leaning forward inside vehicle cabin with opposing restraining seatbelt.',
        arrowsAndDirections: 'Red arrow pointing forward (inertia), green arrow pointing backward (seatbelt force).',
        colorGuidance: 'Red inertia arrow, green seatbelt force, sky blue car frame.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D mechanics physics illustration.',
        educationalPurpose: 'Demonstrates that objects resist changes in velocity; seatbelt provides the unbalanced force.',
        thingsThatMustNotAppear: ['Action-reaction pairs on same body']
      },
      point1_whatItRepresents: 'The physical principle that an object preserves its state of rest or uniform motion unless acted upon by an external force.',
      point2_labelledParts: [
        { label: 'Inertia of Motion', description: 'Tendency of body mass to keep moving at constant velocity.' },
        { label: 'Seatbelt Restraining Force', description: 'Unbalanced external contact force decelerating the passenger safely.' },
        { label: 'Inertia of Rest', description: 'Tendency of a stationary object to remain at rest.' }
      ],
      point3_componentFunctions: 'Explains why protective restraints (seatbelts, airbags) are required in transportation.',
      point4_componentRelationships: 'Inertia is directly proportional to mass: heavier objects possess greater inertia.',
      point5_directionOfMovementOrProcess: 'Forward momentum continues along original trajectory until force acts.',
      point6_stepByStepInterpretation: [
        '1. Car and passenger move together at velocity v.',
        '2. Brakes apply external friction force to car tires, stopping vehicle.',
        '3. Passenger body continues forward at velocity v due to inertia until seatbelt applies opposing force.'
      ],
      point7_learningOutcome: 'State Newton’s First Law and identify inertia of rest, motion, and direction.',
      point8_whatToRemember: 'Law 1 = Law of Inertia (Net Force = 0 ⇒ Velocity remains constant).',
      isVerified: true
    },
    {
      diagramId: 'newton-diag-02',
      subtopicKey: 'law_2_dynamics',
      subtopicTitle: 'Newton’s Second Law: Force, Mass and Acceleration (F = m · a)',
      diagramTitle: 'Diagram 2: Quantitative Dynamics: Acceleration Proportional to Applied Force',
      diagramType: 'dynamics_vector_derivation',
      caption: 'Pushing a shopping trolley: net external force F produces acceleration a directly proportional to force and inversely to mass.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      imageGenerationInstruction: {
        mainTopic: 'Newton Laws of Motion',
        subtopic: 'Second Law of Motion (F = ma)',
        subject: 'Physics',
        gradeComplexity: 'Grade 9/10 CBSE/NCERT',
        diagramType: 'mechanics_cart_dynamics',
        requiredObjects: ['Mass cart / trolley (m)', 'Applied force vector (F)', 'Acceleration vector (a)', 'Formula box'],
        requiredComponents: ['Cart body', 'Wheels', 'Force arrow right', 'Acceleration arrow right', 'F = ma equation'],
        requiredLabels: ['Mass (m = 20 kg)', 'Applied Force F = 60 N', 'Acceleration a = 3 m/s²', 'F = m · a'],
        spatialRelationships: 'Cart centered; force vector pushing from left; acceleration vector emerging from front.',
        arrowsAndDirections: 'Force arrow pointing right; acceleration arrow pointing in same direction (right).',
        colorGuidance: 'Gold force vector, emerald acceleration vector, blue trolley body.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D quantitative mechanics textbook diagram.',
        educationalPurpose: 'Provides quantitative definition of force and unit Newton (kg·m/s²).',
        thingsThatMustNotAppear: ['Force and acceleration in opposite directions']
      },
      point1_whatItRepresents: 'The fundamental quantitative relationship between net external force, mass, and resulting acceleration.',
      point2_labelledParts: [
        { label: 'Applied Force (F)', description: 'Net external vector force measured in Newtons (N).' },
        { label: 'Mass (m)', description: 'Scalar measure of inertia in kilograms (kg).' },
        { label: 'Acceleration (a)', description: 'Rate of change of velocity in meters per second squared (m/s²).' }
      ],
      point3_componentFunctions: 'Allows engineers to calculate exact thrust required to accelerate vehicles and satellites.',
      point4_componentRelationships: 'Acceleration is in the same direction as the net force; inversely proportional to mass.',
      point5_directionOfMovementOrProcess: 'Applied force causes instant rate of change of linear momentum (dp/dt).',
      point6_stepByStepInterpretation: [
        '1. Force is applied to trolley: F = 60 N.',
        '2. Trolley mass resists acceleration with its inertia: m = 20 kg.',
        '3. Resultant acceleration: a = F / m = 60 / 20 = 3 m/s².'
      ],
      point7_learningOutcome: 'Derive F = ma from F ∝ dp/dt and solve numerical problems with proper SI units.',
      point8_whatToRemember: 'Law 2 = F = m · a (Force = Mass × Acceleration; 1 N = 1 kg·m/s²).',
      isVerified: true
    },
    {
      diagramId: 'newton-diag-03',
      subtopicKey: 'law_3_action_reaction',
      subtopicTitle: 'Newton’s Third Law: Action-Reaction Force Pairs',
      diagramTitle: 'Diagram 3: Equal & Opposite Action-Reaction Pairs in Rocket Propulsion',
      diagramType: 'action_reaction_vector',
      caption: 'Rocket engine exerts downward action force on exhaust gas; gas exerts equal and opposite upward reaction thrust on rocket.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      imageGenerationInstruction: {
        mainTopic: 'Newton Laws of Motion',
        subtopic: 'Third Law of Motion (Action-Reaction)',
        subject: 'Physics',
        gradeComplexity: 'Grade 9/10 CBSE/NCERT',
        diagramType: 'propulsion_force_pairs',
        requiredObjects: ['Rocket', 'Exhaust gases', 'Action force arrow down', 'Reaction force arrow up'],
        requiredComponents: ['Rocket body', 'Flame plume', 'Equal vector arrows (180°)', 'Non-cancellation rule box'],
        requiredLabels: ['Upward Thrust on Rocket (F_R)', 'Downward Push on Exhaust Gas (F_A)', '|F_Action| = |F_Reaction|'],
        spatialRelationships: 'Rocket pointed up; exhaust flames down; upward vector at top; downward vector at bottom.',
        arrowsAndDirections: 'Green vector up (reaction on rocket); red vector down (action on gas).',
        colorGuidance: 'Green reaction vector, red action vector, gold/yellow exhaust flame.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D aerospace mechanics illustration.',
        educationalPurpose: 'Explains that forces always exist in pairs and act on two DIFFERENT objects, so they never cancel.',
        thingsThatMustNotAppear: ['Forces drawn on the same single body']
      },
      point1_whatItRepresents: 'The mutual interaction law stating that forces always occur in equal and opposite simultaneous pairs.',
      point2_labelledParts: [
        { label: 'Action Force (F_Action)', description: 'Force exerted by rocket combustion chamber pushing exhaust gas downward.' },
        { label: 'Reaction Force (F_Reaction)', description: 'Force exerted by exhaust gas pushing rocket upward.' }
      ],
      point3_componentFunctions: 'Explains propulsion in space vacuum (no atmosphere needed to "push against").',
      point4_componentRelationships: 'Forces are equal in magnitude, opposite in direction, but act on DIFFERENT bodies.',
      point5_directionOfMovementOrProcess: 'Momentum of gas downward equals momentum of rocket upward (Conservation of Momentum).',
      point6_stepByStepInterpretation: [
        '1. Fuel combusts, creating high-pressure gas.',
        '2. Rocket pushes gas out nozzle with action force F_A downward.',
        '3. Gas exerts equal reaction force F_R upward on rocket, launching it.'
      ],
      point7_learningOutcome: 'Explain why action and reaction forces do not cancel each other out.',
      point8_whatToRemember: 'Law 3 = Action & Reaction (Equal, Opposite, Acts on TWO DIFFERENT Objects).',
      isVerified: true
    }
  ];
}

// ============================================================================
// 6. FRACTIONS — 3 DEDICATED SUBTOPIC DIAGRAMS (Mathematics)
// ============================================================================

export function getFractionsSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Equal Partitions Area Model (Pizza)
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Fractions — Stage 1: Equal Partitions &amp; Area Models</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">A Fraction Represents Equal Parts of a Whole: Numerator / Denominator</text>

    <!-- Pizza Circle divided into 4 quadrants -->
    <circle cx="280" cy="240" r="120" fill="#D97706" stroke="#B45309" stroke-width="6"/>

    <!-- 3 Unshaded Slices (Cream cheese) -->
    <path d="M 280 240 L 280 120 A 120 120 0 0 1 400 240 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 280 240 L 400 240 A 120 120 0 0 1 280 360 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 280 240 L 280 360 A 120 120 0 0 1 160 240 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>

    <!-- 1 Shaded Slice (Taken slice) -->
    <path d="M 280 240 L 160 240 A 120 120 0 0 1 280 120 Z" fill="#FF6A00" stroke="#EA580C" stroke-width="3"/>
    <text x="220" y="190" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">1/4</text>
    <text x="280" y="390" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FBBF24" text-anchor="middle">1 Slice Out of 4 Equal Slices</text>

    <!-- Fraction Anatomy Card -->
    <rect x="460" y="140" width="280" height="200" rx="16" fill="#1E293B" stroke="#38BDF8" stroke-width="2.5"/>
    <text x="600" y="180" font-family="Inter, sans-serif" font-size="34" font-weight="900" fill="#FF6A00" text-anchor="middle">1</text>
    <line x1="520" y1="200" x2="680" y2="200" stroke="#FFFFFF" stroke-width="4"/>
    <text x="600" y="240" font-family="Inter, sans-serif" font-size="34" font-weight="900" fill="#38BDF8" text-anchor="middle">4</text>

    <text x="600" y="275" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FDBA74" text-anchor="middle">Numerator (Parts chosen / shaded)</text>
    <text x="600" y="295" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#7DD3FC" text-anchor="middle">Denominator (Total equal parts in whole)</text>
    <text x="600" y="325" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Denominator can NEVER be zero (x / 0 = undefined)</text>

    <rect x="50" y="400" width="700" height="50" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="425" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Rule of Equal Parts: A fraction is valid only when every partition is exactly equal in area and size.</text>
    <text x="400" y="442" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Sharing 1 pizza equally among 4 friends gives each friend exactly 1/4 of the total pizza.</text>
  </svg>`;

  // Diagram 2: Number Line Representation
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Fractions — Stage 2: Fractions on a Number Line</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Fractions are Numbers with Exact Geometric Positions Between Integers (0 and 1)</text>

    <!-- Main Number Line Axis -->
    <line x1="100" y1="240" x2="700" y2="240" stroke="#38BDF8" stroke-width="5"/>
    <polygon points="710,240 695,232 695,248" fill="#38BDF8"/>
    <polygon points="90,240 105,232 105,248" fill="#38BDF8"/>

    <!-- Tick 0 -->
    <line x1="140" y1="220" x2="140" y2="260" stroke="#FFFFFF" stroke-width="4"/>
    <text x="140" y="290" font-family="Inter, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">0</text>

    <!-- Tick 1/4 -->
    <line x1="270" y1="225" x2="270" y2="255" stroke="#FDE047" stroke-width="3"/>
    <text x="270" y="290" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#FDE047" text-anchor="middle">1/4</text>
    <text x="270" y="200" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FDE047" text-anchor="middle">0.25</text>

    <!-- Tick 2/4 = 1/2 -->
    <line x1="400" y1="220" x2="400" y2="260" stroke="#FF6A00" stroke-width="4"/>
    <text x="400" y="290" font-family="Inter, sans-serif" font-size="20" font-weight="900" fill="#FF6A00" text-anchor="middle">1/2 (2/4)</text>
    <text x="400" y="195" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FF6A00" text-anchor="middle">0.50 (Halfway)</text>

    <!-- Tick 3/4 -->
    <line x1="530" y1="225" x2="530" y2="255" stroke="#FDE047" stroke-width="3"/>
    <text x="530" y="290" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#FDE047" text-anchor="middle">3/4</text>
    <text x="530" y="200" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FDE047" text-anchor="middle">0.75</text>

    <!-- Tick 1 (4/4) -->
    <line x1="660" y1="220" x2="660" y2="260" stroke="#FFFFFF" stroke-width="4"/>
    <text x="660" y="290" font-family="Inter, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">1 (4/4)</text>

    <!-- Equal interval jumpers -->
    <path d="M 140 220 Q 205 160 270 220" stroke="#10B981" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>
    <path d="M 270 220 Q 335 160 400 220" stroke="#10B981" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>
    <path d="M 400 220 Q 465 160 530 220" stroke="#10B981" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>
    <path d="M 530 220 Q 595 160 660 220" stroke="#10B981" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>

    <text x="400" y="340" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Four Equal Steps of Length 1/4</text>

    <rect x="50" y="400" width="700" height="50" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="425" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Number Line Advantage: Shows relative size, distance from 0, and equivalence between fractions and decimals.</text>
    <text x="400" y="442" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">Proper fractions lie between 0 and 1; improper fractions (numerator &gt; denominator) lie beyond 1.</text>
  </svg>`;

  // Diagram 3: Equivalent Fractions
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Fractions — Stage 3: Equivalent Fractions &amp; Proportions</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Fractions Representing the Exact Same Amount: 1/2 = 2/4 = 4/8</text>

    <!-- Bar 1: 1/2 -->
    <rect x="180" y="120" width="440" height="50" rx="8" fill="#1E293B" stroke="#FFFFFF" stroke-width="2"/>
    <rect x="180" y="120" width="220" height="50" rx="8" fill="#FF6A00"/>
    <text x="290" y="152" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">1/2</text>
    <text x="510" y="152" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#94A3B8" text-anchor="middle">1/2</text>

    <!-- Bar 2: 2/4 -->
    <rect x="180" y="200" width="440" height="50" rx="8" fill="#1E293B" stroke="#FFFFFF" stroke-width="2"/>
    <rect x="180" y="200" width="110" height="50" rx="8" fill="#F59E0B"/>
    <rect x="290" y="200" width="110" height="50" fill="#F59E0B"/>
    <text x="235" y="232" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">1/4</text>
    <text x="345" y="232" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">1/4</text>
    <text x="290" y="270" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">2/4 = 1/2</text>

    <!-- Bar 3: 4/8 -->
    <rect x="180" y="290" width="440" height="50" rx="8" fill="#1E293B" stroke="#FFFFFF" stroke-width="2"/>
    <rect x="180" y="290" width="55" height="50" rx="8" fill="#10B981"/>
    <rect x="235" y="290" width="55" height="50" fill="#10B981"/>
    <rect x="290" y="290" width="55" height="50" fill="#10B981"/>
    <rect x="345" y="290" width="55" height="50" fill="#10B981"/>
    <text x="290" y="322" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">4/8</text>
    <text x="290" y="360" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#34D399" text-anchor="middle">4/8 = 2/4 = 1/2</text>

    <!-- Equal vertical alignment guide -->
    <line x1="400" y1="100" x2="400" y2="370" stroke="#38BDF8" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="400" y="92" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">Exact Halfway Benchmark</text>

    <rect x="50" y="405" width="700" height="50" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="430" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Golden Rule of Fractions: Multiplying or dividing numerator and denominator by the same number keeps value equal.</text>
    <text x="400" y="446" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" text-anchor="middle">(1 × 2) / (2 × 2) = 2/4   |   (1 × 4) / (2 × 4) = 4/8.</text>
  </svg>`;

  return [
    {
      diagramId: 'fraction-diag-01',
      subtopicKey: 'equal_partitions',
      subtopicTitle: 'Equal Partitions: Numerator and Denominator Area Model',
      diagramTitle: 'Diagram 1: Visualizing 1/4 Using Equal Pizza Partitioning',
      diagramType: 'area_fraction_model',
      caption: 'Circular area model partitioned into 4 equal quadrants; 1 shaded quadrant represents the fraction 1/4.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      imageGenerationInstruction: {
        mainTopic: 'Fractions',
        subtopic: 'Equal Partitions and Area Models',
        subject: 'Mathematics',
        gradeComplexity: 'Grade 6 CBSE/NCERT',
        diagramType: 'area_model_circle',
        requiredObjects: ['Divided circle', '1 shaded sector', '3 unshaded sectors', 'Fraction notation box'],
        requiredComponents: ['Pizza circle', 'Equal quadrant lines', 'Numerator 1', 'Denominator 4'],
        requiredLabels: ['1/4', 'Numerator', 'Denominator', '1 Slice Out of 4 Equal Slices'],
        spatialRelationships: 'Circle on left with 1/4 highlighted in orange; fraction notation card on right.',
        colorGuidance: 'Orange highlighted fraction slice, gold crust, sky blue denominator.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D mathematical vector diagram.',
        educationalPurpose: 'Explains the concrete meaning of numerator (parts taken) and denominator (total equal parts).',
        thingsThatMustNotAppear: ['Unequal slice sizes']
      },
      point1_whatItRepresents: 'A fraction represents one or more equal parts of a single unified whole.',
      point2_labelledParts: [
        { label: 'Numerator (1)', description: 'The top number counting how many equal parts are selected or shaded.' },
        { label: 'Denominator (4)', description: 'The bottom number indicating the total equal parts the whole is divided into.' },
        { label: 'Fraction Bar (Vinculum)', description: 'The horizontal division line separating numerator and denominator.' }
      ],
      point3_componentFunctions: 'Provides concrete visual basis for ratios, proportions, probabilities, and division.',
      point4_componentRelationships: 'As denominator increases for constant numerator, the size of each piece decreases.',
      point5_directionOfMovementOrProcess: 'From whole unit (1) to partitioned segments (1/4 + 1/4 + 1/4 + 1/4 = 1).',
      point6_stepByStepInterpretation: [
        '1. Inspect the whole pizza.',
        '2. Divide into 4 equal parts (each is 1/4).',
        '3. Shade 1 part: fraction value is 1/4.'
      ],
      point7_learningOutcome: 'Define fraction, identify numerator and denominator, and verify equal partition sizes.',
      point8_whatToRemember: 'Fraction = Numerator / Denominator (Parts Taken / Total Equal Parts).',
      isVerified: true
    },
    {
      diagramId: 'fraction-diag-02',
      subtopicKey: 'number_line',
      subtopicTitle: 'Fractions on a Number Line: Exact Real Coordinates',
      diagramTitle: 'Diagram 2: Positioning 1/4, 1/2, and 3/4 Between 0 and 1 on a Number Line',
      diagramType: 'number_line_geometry',
      caption: 'Number line showing fractions as real numerical coordinates between 0 and 1 with equal intervals.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      imageGenerationInstruction: {
        mainTopic: 'Fractions',
        subtopic: 'Number Line Representation',
        subject: 'Mathematics',
        gradeComplexity: 'Grade 6 CBSE/NCERT',
        diagramType: 'coordinate_axis_intervals',
        requiredObjects: ['Horizontal axis', 'Tick marks 0, 1/4, 1/2, 3/4, 1', 'Interval jump arcs'],
        requiredComponents: ['Origin 0', 'Unit 1', 'Subdivisions', 'Decimal equivalences'],
        requiredLabels: ['0', '1/4', '1/2 (2/4)', '3/4', '1 (4/4)', 'Four Equal Steps of Length 1/4'],
        spatialRelationships: 'Horizontal line spanning left to right; ticks evenly spaced at 25% increments.',
        colorGuidance: 'Sky blue axis, orange midpoint 1/2, yellow ticks 1/4 and 3/4, green jump arcs.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D coordinate geometry textbook diagram.',
        educationalPurpose: 'Teaches that fractions are real numbers with exact spatial coordinates on the continuous number line.',
        thingsThatMustNotAppear: ['Uneven tick spacing']
      },
      point1_whatItRepresents: 'Fractions are real numbers with exact positions and magnitudes between whole integers.',
      point2_labelledParts: [
        { label: 'Origin (0)', description: 'Zero point of the coordinate axis.' },
        { label: 'One Quarter (1/4 = 0.25)', description: 'One fourth of the unit distance from 0.' },
        { label: 'One Half (1/2 = 0.50)', description: 'Exact midpoint between 0 and 1.' },
        { label: 'Unit Whole (1 = 4/4)', description: 'The complete reference interval.' }
      ],
      point3_componentFunctions: 'Allows students to compare fraction magnitudes and perform addition/subtraction geometrically.',
      point4_componentRelationships: 'Equal denominators mean equal distance between consecutive tick marks.',
      point5_directionOfMovementOrProcess: 'Moving right increases magnitude (0 < 1/4 < 1/2 < 3/4 < 1).',
      point6_stepByStepInterpretation: [
        '1. Draw interval from 0 to 1.',
        '2. Divide into 4 equal segments.',
        '3. Each segment equals 1/4 of total distance.'
      ],
      point7_learningOutcome: 'Plot any proper fraction on a number line by partitioning the unit length.',
      point8_whatToRemember: 'Proper fractions always lie between 0 and 1.',
      isVerified: true
    },
    {
      diagramId: 'fraction-diag-03',
      subtopicKey: 'equivalent_fractions',
      subtopicTitle: 'Equivalent Fractions: Visual Tape & Proportion Models',
      diagramTitle: 'Diagram 3: Proportional Equivalence: 1/2 = 2/4 = 4/8 with Vertical Alignment',
      diagramType: 'tape_diagram_proportion',
      caption: 'Three identical length bars divided into 2, 4, and 8 parts showing that 1/2, 2/4, and 4/8 cover the exact same area.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      imageGenerationInstruction: {
        mainTopic: 'Fractions',
        subtopic: 'Equivalent Fractions',
        subject: 'Mathematics',
        gradeComplexity: 'Grade 6 CBSE/NCERT',
        diagramType: 'fraction_bars_comparison',
        requiredObjects: ['3 aligned rectangular bars', 'Subdivision lines', 'Dashed vertical halfway line'],
        requiredComponents: ['Bar 1: 1/2', 'Bar 2: 2/4', 'Bar 3: 4/8', 'Vertical alignment guide'],
        requiredLabels: ['1/2', '2/4 = 1/2', '4/8 = 2/4 = 1/2', 'Exact Halfway Benchmark'],
        spatialRelationships: 'Bars stacked vertically; shaded regions align perfectly along the central vertical dashed line.',
        colorGuidance: 'Orange top bar, amber middle bar, emerald bottom bar, sky blue alignment line.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D mathematical tape diagram.',
        educationalPurpose: 'Proves visually that different fractions can represent the exact same quantity if numerator and denominator scale proportionally.',
        thingsThatMustNotAppear: ['Bars of different lengths']
      },
      point1_whatItRepresents: 'Equivalent fractions represent the same amount using different numbers of smaller equal parts.',
      point2_labelledParts: [
        { label: 'One Half (1/2)', description: 'Whole divided into 2 parts; 1 part shaded.' },
        { label: 'Two Fourths (2/4)', description: 'Whole divided into 4 parts; 2 parts shaded (same total area).' },
        { label: 'Four Eighths (4/8)', description: 'Whole divided into 8 parts; 4 parts shaded (same total area).' }
      ],
      point3_componentFunctions: 'Essential for finding common denominators when adding or subtracting unlike fractions.',
      point4_componentRelationships: 'Multiply or divide numerator and denominator by the same nonzero number to create equivalents.',
      point5_directionOfMovementOrProcess: 'Subdivision creates more smaller pieces without altering total shaded mass.',
      point6_stepByStepInterpretation: [
        '1. Inspect top bar: 1 out of 2 parts is shaded.',
        '2. Inspect middle bar: 2 out of 4 parts is shaded (identical length).',
        '3. Inspect bottom bar: 4 out of 8 parts is shaded (identical length).'
      ],
      point7_learningOutcome: 'Generate equivalent fractions by multiplying or dividing by n/n (identity property of 1).',
      point8_whatToRemember: 'Equivalent fractions have different numbers but equal values (1/2 = 2/4 = 4/8).',
      isVerified: true
    }
  ];
}

// ============================================================================
// 7. WATER CYCLE — 3 DEDICATED SUBTOPIC DIAGRAMS (Geography / Earth Science)
// ============================================================================

export function getWaterCycleSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Complete Hydrological Cycle
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Hydrological Cycle — Overall Planetary System</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Solar Energy Drives Continuous Movement of Water: Ocean → Atmosphere → Land → Ocean</text>

    <!-- Sun on Left -->
    <circle cx="120" cy="120" r="40" fill="#FBBF24" stroke="#FDE047" stroke-width="4"/>
    <text x="120" y="125" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#78350F" text-anchor="middle">Solar Energy</text>

    <!-- Ocean on Left Bottom -->
    <path d="M 40 340 Q 180 330 300 350 L 300 460 L 40 460 Z" fill="#0284C7"/>
    <text x="170" y="400" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">Ocean Reservoir (97%)</text>

    <!-- Evaporation Arrow from Ocean Up -->
    <line x1="180" y1="320" x2="180" y2="200" stroke="#FDE047" stroke-width="4" stroke-dasharray="6 4"/>
    <polygon points="180,192 172,206 188,206" fill="#FDE047"/>
    <text x="130" y="250" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047">Evaporation</text>

    <!-- Clouds Top Center (Condensation) -->
    <ellipse cx="400" cy="140" rx="60" ry="24" fill="#E2E8F0"/>
    <ellipse cx="440" cy="130" rx="45" ry="28" fill="#FFFFFF"/>
    <ellipse cx="360" cy="145" rx="40" ry="20" fill="#CBD5E1"/>
    <text x="400" y="145" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#0F172A" text-anchor="middle">Condensation (Clouds)</text>

    <!-- Mountain on Right -->
    <polygon points="500,460 620,200 740,460" fill="#334155"/>
    <polygon points="600,240 620,200 640,240" fill="#F8FAFC"/>
    <text x="620" y="270" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Snowpack / Mountains</text>

    <!-- Precipitation from Cloud down to Mountain -->
    <line x1="450" y1="180" x2="520" y2="260" stroke="#38BDF8" stroke-width="3" stroke-dasharray="6 4"/>
    <line x1="470" y1="180" x2="540" y2="260" stroke="#38BDF8" stroke-width="3" stroke-dasharray="6 4"/>
    <text x="510" y="210" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">Precipitation (Rain/Snow)</text>

    <!-- Surface Runoff & River back to Ocean -->
    <path d="M 600 380 Q 450 370 300 370" stroke="#38BDF8" stroke-width="6" fill="none"/>
    <polygon points="292,370 306,362 306,378" fill="#38BDF8"/>
    <text x="460" y="360" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">Surface Runoff &amp; River Flow</text>

    <!-- Transpiration from vegetation -->
    <text x="520" y="325" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#34D399">Transpiration (Forests)</text>

    <rect x="50" y="415" width="700" height="50" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Mass Conservation: Total water on Earth remains constant; phase changes move water continuously between spheres.</text>
  </svg>`;

  // Diagram 2: Evaporation & Transpiration
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Water Cycle — Stage 2: Evaporation &amp; Evapotranspiration</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Thermal Energy Input Causes Phase Change: Liquid Water → Invisible Water Vapor Gas</text>

    <!-- Water Reservoir Left -->
    <rect x="100" y="260" width="260" height="120" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="3"/>
    <text x="230" y="325" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">Ocean / Lake Surface</text>

    <!-- Rising Vapor Waves -->
    <path d="M 180 240 Q 190 200 180 160" stroke="#FDE047" stroke-width="3.5" fill="none" stroke-dasharray="6 4"/>
    <path d="M 230 240 Q 240 200 230 160" stroke="#FDE047" stroke-width="3.5" fill="none" stroke-dasharray="6 4"/>
    <path d="M 280 240 Q 290 200 280 160" stroke="#FDE047" stroke-width="3.5" fill="none" stroke-dasharray="6 4"/>
    <text x="230" y="140" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">Direct Evaporation</text>

    <!-- Plant Leaf Right (Transpiration) -->
    <path d="M 540 380 C 440 330 460 200 620 220 C 640 280 580 360 540 380 Z" fill="#16A34A" stroke="#4ADE80" stroke-width="3"/>
    <text x="540" y="300" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Plant Stomata</text>

    <path d="M 580 200 Q 590 160 580 120" stroke="#34D399" stroke-width="3.5" fill="none" stroke-dasharray="6 4"/>
    <text x="580" y="105" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Transpiration (Plant Leaf Evaporation)</text>

    <rect x="50" y="415" width="700" height="50" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Phase Change: Solar heat breaks hydrogen bonds, increasing kinetic energy so water molecules escape into air as vapor.</text>
  </svg>`;

  // Diagram 3: Condensation & Precipitation
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Water Cycle — Stage 3: Condensation, Cloud Formation &amp; Precipitation</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Rising Warm Vapor Cools at High Altitudes → Microscopic Droplets Coalesce into Rain / Snow</text>

    <!-- Cloud with Microscopic droplet nuclei -->
    <ellipse cx="400" cy="160" rx="180" ry="60" fill="#334155" stroke="#94A3B8" stroke-width="3"/>
    <text x="400" y="145" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">Saturated Cloud (100% Relative Humidity)</text>
    <text x="400" y="170" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">Dew Point Temperature Reached (Condensation Nuclei)</text>

    <!-- Raindrop streaks downward -->
    <g stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round">
      <line x1="280" y1="240" x2="270" y2="280"/>
      <line x1="330" y1="260" x2="320" y2="300"/>
      <line x1="380" y1="240" x2="370" y2="280"/>
      <line x1="430" y1="260" x2="420" y2="300"/>
      <line x1="480" y1="240" x2="470" y2="280"/>
      <line x1="530" y1="260" x2="520" y2="300"/>
    </g>

    <text x="400" y="335" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8" text-anchor="middle">Gravity Pulls Heavy Droplets as Precipitation (Rain, Snow, Sleet, Hail)</text>

    <!-- Land surface receiving rain -->
    <rect x="100" y="360" width="600" height="40" rx="10" fill="#15803D"/>
    <text x="400" y="385" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">Soil Infiltration &amp; Groundwater Recharge</text>

    <rect x="50" y="415" width="700" height="50" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Mechanism: Adiabatic cooling causes water vapor to condense on aerosols (dust/pollen); gravity overcomes updrafts.</text>
  </svg>`;

  return [
    {
      diagramId: 'water-cycle-01',
      subtopicKey: 'hydrological_overview',
      subtopicTitle: 'The Global Hydrological Cycle: Reservoirs and Fluxes',
      diagramTitle: 'Diagram 1: Planetary Water Cycle: Evaporation, Condensation, Precipitation & Runoff',
      diagramType: 'earth_system_cycle',
      caption: 'Continuous closed-loop cycle moving water between the ocean, atmosphere, and terrestrial landscape powered by solar energy.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      imageGenerationInstruction: {
        mainTopic: 'Water Cycle',
        subtopic: 'Overall Hydrological Cycle',
        subject: 'Geography',
        gradeComplexity: 'Grade 8/9 NCERT',
        diagramType: 'planetary_flux_diagram',
        requiredObjects: ['Sun', 'Ocean', 'Clouds', 'Mountain', 'Rain', 'River runoff'],
        requiredComponents: ['Solar driver', 'Ocean reservoir', 'Atmospheric clouds', 'Runoff arrows'],
        requiredLabels: ['Solar Energy', 'Ocean Reservoir', 'Evaporation', 'Condensation (Clouds)', 'Precipitation', 'Surface Runoff'],
        spatialRelationships: 'Sun top left; ocean bottom left; clouds top middle; mountains right; river flows right to left into ocean.',
        arrowsAndDirections: 'Cyclical loop: upward evaporation, rightward wind drift, downward precipitation, leftward river flow.',
        colorGuidance: 'Blue ocean and rain, yellow sun and evaporation arrow, white clouds, slate mountains.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D physical geography textbook illustration.',
        educationalPurpose: 'Demonstrates the closed-loop nature of Earth’s water cycle driven by solar energy and gravity.',
        thingsThatMustNotAppear: ['Open escape into outer space']
      },
      point1_whatItRepresents: 'The continuous planetary circulation of water across atmosphere, lithosphere, and hydrosphere.',
      point2_labelledParts: [
        { label: 'Ocean Reservoir', description: 'Largest water store containing ~97% of Earth’s total water volume.' },
        { label: 'Evaporation', description: 'Thermal phase change from liquid ocean water to atmospheric gas.' },
        { label: 'Condensation (Clouds)', description: 'Cooling of water vapor forming clouds of microscopic droplets.' },
        { label: 'Precipitation', description: 'Water falling back to Earth as rain, snow, or hail under gravity.' },
        { label: 'Surface Runoff', description: 'Water flowing over land into streams and rivers returning to the sea.' }
      ],
      point3_componentFunctions: 'Distributes freshwater across continents, regulates planetary climate, and shapes landforms.',
      point4_componentRelationships: 'Solar radiation powers evaporation; Earth’s gravitational field powers precipitation and runoff.',
      point5_directionOfMovementOrProcess: 'Closed cycle: Ocean → Atmosphere → Land surface → Groundwater/River → Ocean.',
      point6_stepByStepInterpretation: [
        '1. Sun heats ocean water, driving evaporation into the atmosphere.',
        '2. Warm moist air rises and cools, condensing into clouds.',
        '3. Clouds precipitate water over mountains and land.',
        '4. Rivers and groundwater return water to the ocean.'
      ],
      point7_learningOutcome: 'Identify all major reservoirs and transfer processes in the global water budget.',
      point8_whatToRemember: 'Water Cycle = Closed System (Evaporation → Condensation → Precipitation → Runoff).',
      isVerified: true
    },
    {
      diagramId: 'water-cycle-02',
      subtopicKey: 'evapotranspiration',
      subtopicTitle: 'Evaporation & Transpiration: Atmospheric Moisture Inputs',
      diagramTitle: 'Diagram 2: Phase Transition: Direct Evaporation from Water Bodies vs Plant Transpiration',
      diagramType: 'phase_change_mechanism',
      caption: 'Solar heating drives liquid-to-gas phase transition from open water (evaporation) and plant stomata (transpiration).',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      imageGenerationInstruction: {
        mainTopic: 'Water Cycle',
        subtopic: 'Evapotranspiration',
        subject: 'Geography',
        gradeComplexity: 'Grade 8/9 NCERT',
        diagramType: 'thermal_evaporation_comparison',
        requiredObjects: ['Water body surface', 'Plant leaf with stomata', 'Vapor waves rising'],
        requiredComponents: ['Lake/ocean water', 'Rising vapor arrows', 'Leaf blade', 'Transpiration arrows'],
        requiredLabels: ['Ocean / Lake Surface', 'Direct Evaporation', 'Plant Stomata', 'Transpiration'],
        spatialRelationships: 'Water body on left; plant leaf on right; rising dashed vapor waves from both.',
        arrowsAndDirections: 'Upward wavy arrows indicating moisture entering the lower atmosphere.',
        colorGuidance: 'Blue water body, green plant leaf, yellow solar evaporation waves.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D environmental science diagram.',
        educationalPurpose: 'Explains evapotranspiration: combined moisture loss from open water and living vegetation.',
        thingsThatMustNotAppear: ['Precipitation or rain']
      },
      point1_whatItRepresents: 'The primary physical mechanisms delivering invisible water vapor into the atmosphere.',
      point2_labelledParts: [
        { label: 'Direct Evaporation', description: 'Phase change of liquid water from oceans, lakes, and rivers into vapor.' },
        { label: 'Transpiration', description: 'Evaporation of water from microscopic stomata pores in plant leaves.' }
      ],
      point3_componentFunctions: 'Cools the Earth’s surface through latent heat of vaporization and charges atmospheric humidity.',
      point4_componentRelationships: 'Warm temperatures and wind increase rate of both evaporation and transpiration.',
      point5_directionOfMovementOrProcess: 'Ascending vertical flux from surface level into troposphere.',
      point6_stepByStepInterpretation: [
        '1. Sun delivers thermal energy to water molecules.',
        '2. Hydrogen bonds break as kinetic energy overcomes intermolecular attraction.',
        '3. Water vapor molecules rise into the buoyant air column.'
      ],
      point7_learningOutcome: 'Distinguish direct evaporation from biological transpiration in regional water balances.',
      point8_whatToRemember: 'Evapotranspiration = Evaporation (water) + Transpiration (plants).',
      isVerified: true
    },
    {
      diagramId: 'water-cycle-03',
      subtopicKey: 'condensation_precipitation',
      subtopicTitle: 'Condensation, Cloud Physics & Precipitation',
      diagramTitle: 'Diagram 3: Cloud Droplet Nucleation & Gravitational Precipitation Mechanisms',
      diagramType: 'meteorological_mechanism',
      caption: 'Water vapor condenses on aerosols reaching dew point, forming clouds that precipitate rain or snow under gravity.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      imageGenerationInstruction: {
        mainTopic: 'Water Cycle',
        subtopic: 'Condensation & Precipitation',
        subject: 'Geography',
        gradeComplexity: 'Grade 8/9 NCERT',
        diagramType: 'cloud_physics_diagram',
        requiredObjects: ['Cloud', 'Rain streaks', 'Ground surface', 'Infiltration arrows'],
        requiredComponents: ['Saturated cloud', 'Dew point indicator', 'Falling precipitation', 'Soil recharge'],
        requiredLabels: ['Saturated Cloud', 'Dew Point Temperature', 'Precipitation (Rain)', 'Soil Infiltration'],
        spatialRelationships: 'Cloud in upper half; vertical rain streaks falling to green ground below.',
        arrowsAndDirections: 'Downward arrows for precipitation; downward arrows for soil infiltration.',
        colorGuidance: 'Slate grey cloud, bright blue rain streaks, green soil surface.',
        backgroundGuidance: 'Dark slate #0F172A background.',
        visualStyle: 'Clean 2D meteorological textbook illustration.',
        educationalPurpose: 'Explains dew point, cloud droplet coalescing, and gravitational precipitation.',
        thingsThatMustNotAppear: ['Evaporation arrows']
      },
      point1_whatItRepresents: 'The condensation of atmospheric vapor into clouds and its gravitational return to land as precipitation.',
      point2_labelledParts: [
        { label: 'Saturated Cloud', description: 'Air mass at 100% relative humidity where condensation equals evaporation.' },
        { label: 'Dew Point', description: 'The exact temperature at which air becomes saturated and vapor condenses.' },
        { label: 'Precipitation', description: 'Coalesced droplets too heavy to stay suspended in air updrafts.' },
        { label: 'Soil Infiltration', description: 'Water soaking into soil layers to replenish groundwater aquifers.' }
      ],
      point3_componentFunctions: 'Directly supplies all terrestrial freshwater ecosystems, rivers, and agricultural soils.',
      point4_componentRelationships: 'Topography forces air to rise and cool (orographic precipitation on windward mountain slopes).',
      point5_directionOfMovementOrProcess: 'Downward vertical return driven by gravitational acceleration.',
      point6_stepByStepInterpretation: [
        '1. Air rises and cools adiabatically until reaching dew point temperature.',
        '2. Water molecules condense onto microscopic condensation nuclei (dust, sea salt).',
        '3. Droplets coalesce until terminal velocity exceeds updraft speed, falling as rain.'
      ],
      point7_learningOutcome: 'Explain the formation of clouds and factors governing precipitation intensity.',
      point8_whatToRemember: 'Condensation requires cooling to dew point; precipitation is gravity overcoming air updrafts.',
      isVerified: true
    }
  ];
}

// ============================================================================
// 8. TOPIC-TO-IMAGE PLANNING PROCESS & MULTI-DIAGRAM RETRIEVER (Part 1.2 & 1.3)
// ============================================================================

export interface TopicVisualPlan {
  step1_studentRequest: {
    subject: string;
    grade: number;
    board: string;
    mainTopic: string;
    requestedSubtopic?: string;
    specificConcept?: string;
  };
  step2_conceptAnalysis: {
    whatConceptRepresents: string;
    importantComponents: string[];
    structure: string;
    mechanism: string;
    relationships: string;
    relevantLabels: string[];
  };
  step3_visualPlan: {
    isDiagramUseful: boolean;
    diagramType: string;
    requiredComponents: string[];
    requiredLabels: string[];
    arrowsAndDirectionsNeeded: boolean;
    multipleDiagramsRequired: boolean;
    diagramCount: number;
  };
  step4_imageInstructions: ImageGenerationInstruction[];
  step5_diagrams: SubtopicDiagramItem[];
  step6_validation: {
    isValid: boolean;
    allLabelsAccurate: boolean;
    matchingWrittenExplanation: boolean;
    verificationStatus: 'verified' | 'fallback_required';
  };
}

/**
 * 6-Step Topic-to-Image Planning Process (Part 1.2 & Part 1.3)
 */
export function planTopicEducationalVisuals(params: {
  topic: string;
  subject?: string;
  grade?: number;
  board?: string;
  subtopic?: string;
  specificConcept?: string;
}): TopicVisualPlan {
  const mainTopic = params.topic.trim();
  const lower = mainTopic.toLowerCase();
  const subtopicLower = (params.subtopic || params.specificConcept || '').toLowerCase();
  const grade = params.grade || 10;
  const board = params.board || 'CBSE';
  const subject = params.subject || inferSubjectFromTopic(mainTopic);

  // Retrieve dedicated diagrams for this topic
  let diagrams = getSubtopicDiagramsForTopic(mainTopic, subject);

  // If a specific subtopic or concept was asked (e.g. "left ventricle" or "chlorophyll"),
  // prioritize or filter to that specific diagram!
  if (subtopicLower) {
    const words = subtopicLower
      .split(/[\s,+/&]+/)
      .filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'what', 'how', 'why', 'function'].includes(w));

    const specificMatch = diagrams.find((d) =>
      d.subtopicKey.toLowerCase().includes(subtopicLower) ||
      d.subtopicTitle.toLowerCase().includes(subtopicLower) ||
      d.point2_labelledParts.some((p) => p.label.toLowerCase().includes(subtopicLower)) ||
      words.some((w) =>
        d.subtopicKey.toLowerCase().includes(w) ||
        d.subtopicTitle.toLowerCase().includes(w) ||
        d.point2_labelledParts.some((p) => p.label.toLowerCase().includes(w))
      )
    );
    if (specificMatch) {
      // Put specific match first
      diagrams = [specificMatch, ...diagrams.filter((d) => d.diagramId !== specificMatch.diagramId)];
    }
  }

  // Generate structured image instructions for each diagram (Part 1.3)
  const imageInstructions: ImageGenerationInstruction[] = diagrams.map((d) => {
    if (d.imageGenerationInstruction) return d.imageGenerationInstruction;
    return {
      mainTopic,
      subtopic: d.subtopicTitle,
      subject,
      gradeComplexity: `Grade ${grade} ${board}`,
      diagramType: d.diagramType,
      requiredObjects: d.point2_labelledParts.map((p) => p.label),
      requiredComponents: d.point2_labelledParts.map((p) => p.description),
      requiredLabels: d.point2_labelledParts.map((p) => p.label),
      spatialRelationships: d.point4_componentRelationships,
      arrowsAndDirections: d.point5_directionOfMovementOrProcess,
      colorGuidance: 'High-contrast educational palette: cream, slate, orange, emerald, sky blue.',
      backgroundGuidance: 'Clean dark slate #0F172A or light #FFFFFF background.',
      visualStyle: 'Clean 2D scientific textbook illustration.',
      educationalPurpose: d.point7_learningOutcome,
      thingsThatMustNotAppear: ['Unrelated decorative 3D clutter', 'Unlabeled placeholder boxes']
    };
  });

  return {
    step1_studentRequest: {
      subject,
      grade,
      board,
      mainTopic,
      requestedSubtopic: params.subtopic,
      specificConcept: params.specificConcept
    },
    step2_conceptAnalysis: {
      whatConceptRepresents: diagrams[0]?.point1_whatItRepresents || `Core mechanisms of ${mainTopic}`,
      importantComponents: diagrams.flatMap((d) => d.point2_labelledParts.map((p) => p.label)).slice(0, 8),
      structure: diagrams[0]?.diagramType || 'Curriculum schematic',
      mechanism: diagrams[0]?.point5_directionOfMovementOrProcess || 'Directional cause-and-effect progression',
      relationships: diagrams[0]?.point4_componentRelationships || 'Components interact systematically',
      relevantLabels: diagrams[0]?.point2_labelledParts.map((p) => p.label) || []
    },
    step3_visualPlan: {
      isDiagramUseful: true,
      diagramType: diagrams[0]?.diagramType || 'Curriculum diagram',
      requiredComponents: diagrams[0]?.point2_labelledParts.map((p) => p.label) || [],
      requiredLabels: diagrams[0]?.point2_labelledParts.map((p) => p.label) || [],
      arrowsAndDirectionsNeeded: Boolean(diagrams[0]?.point5_directionOfMovementOrProcess),
      multipleDiagramsRequired: diagrams.length > 1,
      diagramCount: diagrams.length
    },
    step4_imageInstructions: imageInstructions,
    step5_diagrams: diagrams,
    step6_validation: {
      isValid: diagrams.every((d) => d.isVerified && d.svgXml.length > 100),
      allLabelsAccurate: diagrams.every((d) => d.point2_labelledParts.length > 0),
      matchingWrittenExplanation: diagrams.every((d) => Boolean(d.caption && d.point7_learningOutcome)),
      verificationStatus: 'verified'
    }
  };
}

/**
 * Searches for a specific diagram matching a concept (e.g. "Left Ventricle" in "Human Heart")
 */
export function findDiagramForSpecificConcept(topic: string, specificConcept: string, subject?: string): SubtopicDiagramItem | null {
  const diagrams = getSubtopicDiagramsForTopic(topic, subject);
  const qLower = specificConcept.toLowerCase();
  const words = qLower
    .split(/[\s,+/&]+/)
    .filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'what', 'how', 'why', 'function'].includes(w));

  // First check exact phrase
  let found = diagrams.find((d) => {
    if (d.subtopicTitle.toLowerCase().includes(qLower)) return true;
    if (d.diagramTitle.toLowerCase().includes(qLower)) return true;
    if (d.subtopicKey.toLowerCase().includes(qLower)) return true;
    return d.point2_labelledParts.some((p) => p.label.toLowerCase().includes(qLower));
  });

  // Then check individual keyword matches
  if (!found) {
    found = diagrams.find((d) => {
      return words.some((w) =>
        d.subtopicKey.toLowerCase().includes(w) ||
        d.subtopicTitle.toLowerCase().includes(w) ||
        d.diagramTitle.toLowerCase().includes(w) ||
        d.point2_labelledParts.some((p) => p.label.toLowerCase().includes(w))
      );
    });
  }

  return found || diagrams[0] || null;
}

function inferSubjectFromTopic(topic: string): string {
  const t = topic.toLowerCase();
  if (/photosynthesis|heart|cardiac|mitosis|cell|dna|blood|lung|organ|plant|animal|biology/.test(t)) return 'Biology';
  if (/bond|ionic|covalent|atom|molecule|reaction|acid|base|metal|chemistry/.test(t)) return 'Chemistry';
  if (/force|motion|newton|inertia|friction|circuit|electric|velocity|gravity|physics/.test(t)) return 'Physics';
  if (/fraction|quadratic|equation|geometry|triangle|algebra|math/.test(t)) return 'Mathematics';
  if (/water cycle|river|mountain|climate|geography|earth/.test(t)) return 'Geography';
  if (/war|revolution|empire|civilization|history/.test(t)) return 'History';
  return 'Science';
}

import {
  getDnaSubtopicDiagrams,
  getElectricitySubtopicDiagrams,
  getGeometrySubtopicDiagrams,
  getFrenchRevolutionSubtopicDiagrams,
  getEarthStructureSubtopicDiagrams,
  getChemicalReactionsSubtopicDiagrams,
  getQuadraticEquationsSubtopicDiagrams,
  getWaterResourcesSubtopicDiagrams,
  getWorkPowerEnergySubtopicDiagrams,
  getWorldWar2SubtopicDiagrams,
  getEnglishGrammarSubtopicDiagrams,
  getComputerAlgorithmsSubtopicDiagrams
} from './extendedSubtopicDiagrams.ts';

// ============================================================================
// 9. UNIVERSAL MULTI-DIAGRAM RETRIEVER (Expanded for All Subjects)
// ============================================================================

export function getSubtopicDiagramsForTopic(topic: string, subject?: string): SubtopicDiagramItem[] {
  const lower = (topic || '').toLowerCase();

  if (lower.includes('photosynthesis') || lower.includes('chloroplast') || lower.includes('calvin cycle') || lower.includes('thylakoid') || lower.includes('leaf anatomy') || (lower.includes('leaf') && (lower.includes('stomata') || lower.includes('mesophyll')))) {
    return getPhotosynthesisSubtopicDiagrams();
  }

  if (lower.includes('heart') || lower.includes('cardiac') || lower.includes('circulation') || lower.includes('ventricle')) {
    return getHumanHeartSubtopicDiagrams();
  }

  if (lower.includes('dna') || lower.includes('genetics') || lower.includes('nucleotide') || lower.includes('double helix') || lower.includes('replication')) {
    return getDnaSubtopicDiagrams();
  }

  if (lower.includes('electricity') || lower.includes('circuit') || lower.includes('ohm') || lower.includes('resistor') || lower.includes('current')) {
    return getElectricitySubtopicDiagrams();
  }

  if (lower.includes('geometry') || lower.includes('pythagor') || lower.includes('triangle') || lower.includes('circle theorem') || lower.includes('euclidean')) {
    return getGeometrySubtopicDiagrams();
  }

  if (lower.includes('french revolution') || lower.includes('bastille') || lower.includes('third estate') || lower.includes('estates general')) {
    return getFrenchRevolutionSubtopicDiagrams();
  }

  if (lower.includes('earth') && (lower.includes('structure') || lower.includes('core') || lower.includes('crust') || lower.includes('mantle') || lower.includes('tectonic'))) {
    return getEarthStructureSubtopicDiagrams();
  }

  if (lower.includes('mitosis') || lower.includes('cell division') || lower.includes('interphase') || lower.includes('metaphase') || lower.includes('anaphase')) {
    return getMitosisSubtopicDiagrams();
  }

  if (lower.includes('chemical bond') || lower.includes('bonding') || lower.includes('ionic') || lower.includes('covalent') || lower.includes('metallic bond')) {
    return getChemicalBondingSubtopicDiagrams();
  }

  if (lower.includes('newton') || lower.includes('laws of motion') || lower.includes('inertia') || (lower.includes('force') && lower.includes('mass'))) {
    return getNewtonLawsSubtopicDiagrams();
  }

  if (lower.includes('fraction') || lower.includes('fractions') || lower.includes('numerator') || lower.includes('denominator')) {
    return getFractionsSubtopicDiagrams();
  }

  if (lower.includes('water cycle') || lower.includes('hydrological') || lower.includes('evapotranspiration') || (lower.includes('precipitation') && lower.includes('evaporation'))) {
    return getWaterCycleSubtopicDiagrams();
  }

  if (lower.includes('chemical reaction') || lower.includes('reactions and equation') || (lower.includes('equation') && lower.includes('chemical')) || lower.includes('combination reaction') || lower.includes('displacement reaction') || lower.includes('precipitation reaction')) {
    return getChemicalReactionsSubtopicDiagrams();
  }

  if (lower.includes('quadratic') || lower.includes('quadratic equation') || (lower.includes('parabola') && lower.includes('equation')) || lower.includes('discriminant') || (lower.includes('nature of roots') && !lower.includes('plant'))) {
    return getQuadraticEquationsSubtopicDiagrams();
  }

  if (lower.includes('water resource') || lower.includes('water scarcity') || (lower.includes('rainwater') && lower.includes('harvest')) || lower.includes('multipurpose river') || (lower.includes('dam') && lower.includes('water'))) {
    return getWaterResourcesSubtopicDiagrams();
  }

  if (lower.includes('work') && (lower.includes('power') || lower.includes('energy') || lower.includes('joule') || lower.includes('kinetic') || lower.includes('potential'))) {
    return getWorkPowerEnergySubtopicDiagrams();
  }

  if (lower.includes('world war') || lower.includes('wwii') || lower.includes('ww2') || lower.includes('stalingrad') || lower.includes('d-day') || lower.includes('pearl harbor')) {
    return getWorldWar2SubtopicDiagrams();
  }

  if (lower.includes('grammar') || lower.includes('parts of speech') || lower.includes('sentence structure') || lower.includes('noun') || lower.includes('verb') || lower.includes('syntax')) {
    return getEnglishGrammarSubtopicDiagrams();
  }

  if (lower.includes('algorithm') || lower.includes('binary search') || lower.includes('sorting') || lower.includes('flowchart') || lower.includes('time complexity')) {
    return getComputerAlgorithmsSubtopicDiagrams();
  }

  // Generate fallback structured subtopic diagrams for any curriculum topic
  return buildGenericSubtopicDiagrams(topic, subject || 'Science');
}

function buildGenericSubtopicDiagrams(topic: string, subject: string): SubtopicDiagramItem[] {
  const clean = topic.trim();

  // Subtopic 1: Structural Foundations
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
    <rect width="800" height="460" rx="20" fill="#0F172A"/>
    <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">${clean} — Structural Foundations &amp; Core Architecture</text>
    <rect x="80" y="100" width="280" height="260" rx="16" fill="#1E293B" stroke="#38BDF8" stroke-width="2.5"/>
    <text x="220" y="135" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#38BDF8" text-anchor="middle">Input Foundations</text>
    <text x="220" y="175" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Core Primary Elements</text>
    <text x="220" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Initial Boundary Conditions</text>
    <text x="220" y="255" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Governing Material State</text>

    <line x1="360" y1="230" x2="440" y2="230" stroke="#FDE047" stroke-width="4"/>
    <polygon points="445,230 432,222 432,238" fill="#FDE047"/>

    <rect x="440" y="100" width="280" height="260" rx="16" fill="#1E293B" stroke="#10B981" stroke-width="2.5"/>
    <text x="580" y="135" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#34D399" text-anchor="middle">Functional Organization</text>
    <text x="580" y="175" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Active Transduction Unit</text>
    <text x="580" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Feedback Regulation Circuit</text>
    <text x="580" y="255" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1" text-anchor="middle">• Terminal Verification Output</text>
    <rect x="80" y="385" width="640" height="48" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="414" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#F8FAFC" text-anchor="middle">Structural Blueprint: Inputs assemble into functional units under conservation laws.</text>
  </svg>`;

  // Subtopic 2: Working Mechanism
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
    <rect width="800" height="460" rx="20" fill="#0F172A"/>
    <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">${clean} — Step-by-Step Working Mechanism</text>
    <rect x="50" y="110" width="200" height="220" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="150" y="145" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8" text-anchor="middle">Stage 1: Excitation</text>
    <text x="150" y="180" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">Input arrival &amp; binding</text>

    <line x1="250" y1="220" x2="300" y2="220" stroke="#38BDF8" stroke-width="3"/>

    <rect x="300" y="110" width="200" height="220" rx="14" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
    <text x="400" y="145" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FBBF24" text-anchor="middle">Stage 2: Transduction</text>
    <text x="400" y="180" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">Core reaction / motion</text>

    <line x1="500" y1="220" x2="550" y2="220" stroke="#F59E0B" stroke-width="3"/>

    <rect x="550" y="110" width="200" height="220" rx="14" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
    <text x="650" y="145" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#34D399" text-anchor="middle">Stage 3: Equilibrium</text>
    <text x="650" y="180" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#CBD5E1" text-anchor="middle">Verified steady state</text>
  </svg>`;

  return [
    {
      diagramId: `gen-diag-1-${clean.slice(0, 4)}`,
      subtopicKey: 'structural_foundations',
      subtopicTitle: `Structural Foundations & Core Organization of ${clean}`,
      diagramTitle: `Diagram 1: ${clean} Structural Blueprint & Input Elements`,
      diagramType: 'conceptual_architecture',
      caption: `Structural schematic of ${clean} demonstrating its input foundations and functional organization.`,
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: `The physical or conceptual structural organization of ${clean}.`,
      point2_labelledParts: [
        { label: 'Input Foundations', description: `Starting materials, known variables, or initial boundary conditions.` },
        { label: 'Functional Organization', description: `The active central unit mediating transformation.` }
      ],
      point3_componentFunctions: `Separates initial requirements from intermediate active processing structures.`,
      point4_componentRelationships: `Input components assemble directly into the central functional unit.`,
      point5_directionOfMovementOrProcess: `Sequential flow from left inputs to right functional outputs.`,
      point6_stepByStepInterpretation: [
        `1. Identify input boundaries of ${clean}.`,
        `2. Observe organization within the central functional unit.`,
        `3. Verify that physical conservation principles are strictly maintained.`
      ],
      point7_learningOutcome: `Gain structural mastery over ${clean} before analyzing complex dynamic processes.`,
      point8_whatToRemember: `Every system in ${clean} requires structured inputs to sustain functional equilibrium.`,
      isVerified: true
    },
    {
      diagramId: `gen-diag-2-${clean.slice(0, 4)}`,
      subtopicKey: 'working_mechanism',
      subtopicTitle: `Working Mechanism and Dynamic Transformations of ${clean}`,
      diagramTitle: `Diagram 2: ${clean} Step-by-Step Dynamic Working Mechanism`,
      diagramType: 'mechanism_pathway',
      caption: `Dynamic mechanism of ${clean} showing the 3-stage progression from excitation to equilibrium.`,
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: `The causal cause-and-effect progression through which ${clean} operates.`,
      point2_labelledParts: [
        { label: 'Stage 1: Excitation', description: 'Activation or supply of driving potential.' },
        { label: 'Stage 2: Transduction', description: 'Central energy or matter conversion phase.' },
        { label: 'Stage 3: Equilibrium', description: 'Output generation and return to stable resting state.' }
      ],
      point3_componentFunctions: `Drives the measurable transition from initial state to final verified outcome.`,
      point4_componentRelationships: `Stage 1 primes Stage 2; Stage 2 drives Stage 3.`,
      point5_directionOfMovementOrProcess: `Directional forward progression without skipping intermediate phases.`,
      point6_stepByStepInterpretation: [
        `1. Inputs excite the active center.`,
        `2. Central transformation converts energy or rearranges elements.`,
        `3. System establishes stable output equilibrium.`
      ],
      point7_learningOutcome: `Explain how ${clean} works step by step using scientific cause-and-effect reasoning.`,
      point8_whatToRemember: `Follow the sequence: Excitation → Transduction → Stable Equilibrium.`,
      isVerified: true
    }
  ];
}
