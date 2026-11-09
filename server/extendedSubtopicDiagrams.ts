import type { SubtopicDiagramItem } from './subtopicDiagramCatalog.ts';

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

// ============================================================================
// 1. DNA STRUCTURE & MOLECULAR GENETICS — 4 DEDICATED SUBTOPIC DIAGRAMS
// ============================================================================

export function getDnaSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Double Helix Architecture
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">DNA Structure — Antiparallel Double Helix Architecture</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Right-Handed B-DNA: 2.0 nm Diameter • 3.4 nm Pitch (10 bp per Turn)</text>

    <!-- 5' and 3' Strand Identifiers -->
    <rect x="80" y="80" width="70" height="30" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="115" y="100" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">5' End</text>
    <rect x="80" y="400" width="70" height="30" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="115" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">3' End</text>

    <rect x="650" y="80" width="70" height="30" rx="6" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
    <text x="685" y="100" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">3' End</text>
    <rect x="650" y="400" width="70" height="30" rx="6" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
    <text x="685" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">5' End</text>

    <!-- Sugar-Phosphate Backbones -->
    <path d="M 220 100 Q 320 200 400 250 T 580 400" fill="none" stroke="#38BDF8" stroke-width="8"/>
    <path d="M 580 100 Q 480 200 400 250 T 220 400" fill="none" stroke="#F59E0B" stroke-width="8"/>

    <!-- Base Rungs -->
    <line x1="280" y1="140" x2="520" y2="140" stroke="#EC4899" stroke-width="6"/>
    <line x1="330" y1="190" x2="470" y2="190" stroke="#10B981" stroke-width="6"/>
    <circle cx="400" cy="250" r="14" fill="#6366F1"/>
    <line x1="330" y1="310" x2="470" y2="310" stroke="#10B981" stroke-width="6"/>
    <line x1="280" y1="360" x2="520" y2="360" stroke="#EC4899" stroke-width="6"/>

    <!-- Annotations -->
    <rect x="250" y="435" width="300" height="32" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="456" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Major Groove (2.2 nm) &amp; Minor Groove (1.2 nm)</text>
  </svg>`;

  // Diagram 2: Nucleotide Molecular Subunits
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">DNA Monomer — Single Deoxyribonucleotide Anatomy</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Three Tripartite Subunits: Phosphate Group + Pentose Sugar + Nitrogenous Base</text>

    <!-- Phosphate Group (5' Carbon) -->
    <circle cx="160" cy="220" r="50" fill="#EF4444" stroke="#F87171" stroke-width="3"/>
    <text x="160" y="215" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">PO₄³⁻</text>
    <text x="160" y="235" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FEE2E2" text-anchor="middle">Phosphate</text>
    <line x1="210" y1="220" x2="280" y2="240" stroke="#F87171" stroke-width="4"/>
    <text x="245" y="215" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#CBD5E1">5' Ester Link</text>

    <!-- Deoxyribose Pentose Ring -->
    <polygon points="340,180 420,200 450,280 370,310 290,250" fill="#3B82F6" stroke="#60A5FA" stroke-width="3"/>
    <text x="375" y="255" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">Deoxyribose</text>
    <text x="375" y="275" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#DBEAFE" text-anchor="middle">5-Carbon Ring (2'-H)</text>

    <line x1="450" y1="230" x2="520" y2="230" stroke="#F59E0B" stroke-width="4"/>
    <text x="485" y="215" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#CBD5E1">1' Glycosidic</text>

    <!-- Nitrogenous Base -->
    <rect x="520" y="170" width="190" height="120" rx="14" fill="#10B981" stroke="#34D399" stroke-width="3"/>
    <text x="615" y="215" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">Nitrogenous Base</text>
    <text x="615" y="245" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#ECFDF5" text-anchor="middle">Purine (A, G) / Pyrimidine (T, C)</text>

    <!-- Bottom Legend -->
    <rect x="100" y="380" width="600" height="50" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="400" y="410" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#F8FAFC" text-anchor="middle">Phosphodiester Bond forms between 3'-OH of preceding sugar and 5'-Phosphate of incoming nucleotide.</text>
  </svg>`;

  // Diagram 3: Complementary Base Pairing
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Watson-Crick Complementary Base Pairing</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Chargaff's Rule: Adenine = Thymine (2 H-Bonds) • Guanine ≡ Cytosine (3 H-Bonds)</text>

    <!-- Pair 1: A = T -->
    <g transform="translate(60, 100)">
      <rect width="320" height="150" rx="14" fill="#1E293B" stroke="#EC4899" stroke-width="2"/>
      <text x="160" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F472B6" text-anchor="middle">Adenine (Purine) = Thymine (Pyrimidine)</text>
      <!-- Base A -->
      <rect x="30" y="50" width="90" height="70" rx="8" fill="#BE185D"/>
      <text x="75" y="90" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">A</text>
      <!-- 2 Hydrogen bonds -->
      <line x1="130" y1="75" x2="190" y2="75" stroke="#FDE047" stroke-width="4" stroke-dasharray="6 4"/>
      <line x1="130" y1="95" x2="190" y2="95" stroke="#FDE047" stroke-width="4" stroke-dasharray="6 4"/>
      <text x="160" y="65" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">2 H-Bonds</text>
      <!-- Base T -->
      <rect x="200" y="50" width="90" height="70" rx="8" fill="#047857"/>
      <text x="245" y="90" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">T</text>
    </g>

    <!-- Pair 2: G ≡ C -->
    <g transform="translate(420, 100)">
      <rect width="320" height="150" rx="14" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
      <text x="160" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#34D399" text-anchor="middle">Guanine (Purine) ≡ Cytosine (Pyrimidine)</text>
      <!-- Base G -->
      <rect x="30" y="50" width="90" height="70" rx="8" fill="#1D4ED8"/>
      <text x="75" y="90" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">G</text>
      <!-- 3 Hydrogen bonds -->
      <line x1="130" y1="68" x2="190" y2="68" stroke="#FDE047" stroke-width="3.5" stroke-dasharray="5 3"/>
      <line x1="130" y1="85" x2="190" y2="85" stroke="#FDE047" stroke-width="3.5" stroke-dasharray="5 3"/>
      <line x1="130" y1="102" x2="190" y2="102" stroke="#FDE047" stroke-width="3.5" stroke-dasharray="5 3"/>
      <text x="160" y="58" font-family="Inter, sans-serif" font-size="10.5" font-weight="800" fill="#FDE047" text-anchor="middle">3 H-Bonds (Higher Tm)</text>
      <!-- Base C -->
      <rect x="200" y="50" width="90" height="70" rx="8" fill="#B45309"/>
      <text x="245" y="90" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">C</text>
    </g>

    <!-- Comparison Summary -->
    <rect x="60" y="290" width="680" height="140" rx="14" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="80" y="325" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">Key Biochemical Invariants:</text>
    <text x="80" y="355" font-family="Inter, sans-serif" font-size="12" fill="#E2E8F0">1. A purine (2-ring) always pairs with a pyrimidine (1-ring) keeping the 2.0 nm helix width constant.</text>
    <text x="80" y="385" font-family="Inter, sans-serif" font-size="12" fill="#E2E8F0">2. G-C pairs have 3 hydrogen bonds, making GC-rich DNA regions thermally more stable than AT-rich regions.</text>
    <text x="80" y="415" font-family="Inter, sans-serif" font-size="12" fill="#E2E8F0">3. Chargaff's rule: %A = %T and %G = %C; therefore, Purines (A+G) = Pyrimidines (T+C).</text>
  </svg>`;

  // Diagram 4: Semi-Conservative Replication Fork
  const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Semi-Conservative DNA Replication Fork</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Asymmetric Synthesis: Continuous Leading Strand vs Discontinuous Okazaki Lagging Strand</text>

    <!-- Parental DNA Unwound -->
    <path d="M 60 140 L 260 200 L 260 280 L 60 340" fill="none" stroke="#64748B" stroke-width="6"/>
    <text x="80" y="125" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#94A3B8">Parental 3'</text>
    <text x="80" y="365" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#94A3B8">Parental 5'</text>

    <!-- Helicase Enzyme at fork -->
    <polygon points="270,180 340,240 270,300" fill="#8B5CF6" stroke="#A78BFA" stroke-width="2"/>
    <text x="295" y="245" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">Helicase</text>

    <!-- Leading Strand (Upper - Continuous) -->
    <line x1="340" y1="180" x2="680" y2="180" stroke="#38BDF8" stroke-width="6"/>
    <polygon points="695,180 675,172 675,188" fill="#38BDF8"/>
    <text x="500" y="165" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8">Leading Strand (Continuous 5' → 3')</text>
    <rect x="420" y="145" width="110" height="26" rx="6" fill="#0284C7"/>
    <text x="475" y="162" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">DNA Pol III</text>

    <!-- Lagging Strand (Lower - Okazaki Fragments) -->
    <line x1="380" y1="300" x2="480" y2="300" stroke="#10B981" stroke-width="6"/>
    <polygon points="370,300 390,292 390,308" fill="#10B981"/>
    <line x1="520" y1="300" x2="620" y2="300" stroke="#10B981" stroke-width="6"/>
    <polygon points="510,300 530,292 530,308" fill="#10B981"/>
    <text x="500" y="335" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#34D399">Lagging Strand (Okazaki Fragments)</text>

    <!-- DNA Ligase -->
    <circle cx="500" cy="300" r="16" fill="#F59E0B"/>
    <text x="500" y="304" font-family="Inter, sans-serif" font-size="9" font-weight="900" fill="#FFFFFF" text-anchor="middle">Ligase</text>

    <!-- Summary Box -->
    <rect x="120" y="405" width="560" height="45" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="400" y="432" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">DNA Polymerase synthesizes ONLY in 5'→3' direction; lagging strand is joined by DNA Ligase.</text>
  </svg>`;

  return [
    {
      diagramId: 'dna-sub-01',
      subtopicKey: 'dna_double_helix',
      subtopicTitle: 'Double Helix Architecture & Antiparallel Strands',
      diagramTitle: 'Antiparallel B-DNA Double Helix',
      diagramType: 'Structural Molecular Schematic',
      caption: 'The antiparallel double-helix structure of B-DNA showing 5\' to 3\' polarity, major/minor grooves, and base pairing.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: 'Represents the three-dimensional helical conformation of genomic double-stranded DNA.',
      point2_labelledParts: [
        { label: '5\' End', description: 'Terminal phosphate group attached to the 5th carbon of deoxyribose' },
        { label: '3\' End', description: 'Terminal hydroxyl (-OH) group attached to the 3rd carbon of deoxyribose' },
        { label: 'Sugar-Phosphate Backbone', description: 'Covalent alternating chain of deoxyribose sugars and phosphate diesters' },
        { label: 'Major Groove', description: 'Wider spiral indentation (2.2 nm) providing sequence-specific protein access' },
        { label: 'Minor Groove', description: 'Narrower spiral groove (1.2 nm) between complementary phosphodiester strands' }
      ],
      point3_componentFunctions: 'Stores permanent genetic information in the sequence of internal nitrogenous bases protected by backbones.',
      point4_componentRelationships: 'The two strands run in opposite polar directions (antiparallel: 5\'→3\' opposite 3\'→5\').',
      point5_directionOfMovementOrProcess: 'Right-handed spiral winding with 10 base pairs per 3.4 nm helical repeat.',
      point6_stepByStepInterpretation: [
        '1. Two linear polynucleotide chains intertwine around a central imaginary axis.',
        '2. Hydrophilic sugar-phosphate backbones face outward to interact with aqueous nucleoplasm.',
        '3. Hydrophobic planar base pairs stack horizontally inside perpendicular to the axis.'
      ],
      point7_learningOutcome: 'Understand the antiparallel geometry and dimensions of the Watson-Crick double helix.',
      point8_whatToRemember: '5\' has a free phosphate; 3\' has a free hydroxyl. The strands are antiparallel and complementary.',
      isVerified: true
    },
    {
      diagramId: 'dna-sub-02',
      subtopicKey: 'dna_nucleotide_structure',
      subtopicTitle: 'Deoxyribonucleotide Monomeric Subunits',
      diagramTitle: 'Nucleotide Subunit: Phosphate, Deoxyribose, and Base',
      diagramType: 'Chemical Molecular Schematic',
      caption: 'Anatomy of a single deoxyribonucleotide building block with numbered carbon positions.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: 'The monomeric repeat unit of DNA comprising phosphate, pentose sugar, and nitrogenous base.',
      point2_labelledParts: [
        { label: 'Phosphate Group', description: 'Negatively charged PO₄³⁻ linked to the 5\'-carbon via phosphoester bond' },
        { label: 'Deoxyribose Sugar', description: '5-carbon cyclic furanose ring lacking an oxygen at 2\' position (-H only)' },
        { label: 'Nitrogenous Base', description: 'Heterocyclic aromatic ring linked to 1\'-carbon via N-glycosidic bond' },
        { label: 'Phosphodiester Bond', description: 'Covalent link between 3\'-OH of one nucleotide and 5\'-phosphate of next' }
      ],
      point3_componentFunctions: 'Polymerizes into nucleic acid strands; carries net negative electrical charge allowing gel electrophoresis.',
      point4_componentRelationships: 'Deoxyribose forms the structural anchor connecting base (at C1\') to phosphate (at C5\').',
      point5_directionOfMovementOrProcess: 'Polymerization occurs strictly from 5\' to 3\' through condensation elimination of pyrophosphate.',
      point6_stepByStepInterpretation: [
        '1. Nitrogenous base attaches to carbon 1\' of beta-D-2-deoxyribose.',
        '2. Phosphate attaches to carbon 5\' yielding a deoxyribonucleoside monophosphate.',
        '3. Nucleotides link via 3\'-5\' phosphodiester bridges to form an unbranched polymer.'
      ],
      point7_learningOutcome: 'Identify the three components of a nucleotide and distinguish deoxyribose from ribose.',
      point8_whatToRemember: 'Deoxyribose has -H at 2\', whereas RNA ribose has -OH at 2\'. Net DNA charge is negative.',
      isVerified: true
    },
    {
      diagramId: 'dna-sub-03',
      subtopicKey: 'dna_base_pairing',
      subtopicTitle: 'Complementary Base Pairing & Hydrogen Bonding',
      diagramTitle: 'Chargaff Base Pairing: A=T (2 H-Bonds) and G≡C (3 H-Bonds)',
      diagramType: 'Biochemical Interaction Diagram',
      caption: 'Specific hydrogen bonding between purine and pyrimidine bases governed by Chargaff\'s rules.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      point1_whatItRepresents: 'Specific non-covalent hydrogen bonding between Adenine-Thymine and Guanine-Cytosine.',
      point2_labelledParts: [
        { label: 'Adenine (A)', description: 'Double-ring purine forming 2 hydrogen bonds with Thymine' },
        { label: 'Thymine (T)', description: 'Single-ring pyrimidine forming 2 hydrogen bonds with Adenine' },
        { label: 'Guanine (G)', description: 'Double-ring purine forming 3 hydrogen bonds with Cytosine' },
        { label: 'Cytosine (C)', description: 'Single-ring pyrimidine forming 3 hydrogen bonds with Guanine' }
      ],
      point3_componentFunctions: 'Enables high-fidelity genetic replication, transcription, and thermodynamic stability of the helix.',
      point4_componentRelationships: 'A purine always pairs with a pyrimidine, ensuring a uniform 2.0 nm helical diameter.',
      point5_directionOfMovementOrProcess: 'Hydrogen bonds easily denature (melt) during replication and re-anneal accurately.',
      point6_stepByStepInterpretation: [
        '1. A and T align complementary hydrogen bond donor/acceptor pairs (2 bonds).',
        '2. G and C align three complementary hydrogen bonding positions (3 bonds).',
        '3. Higher G-C content increases the melting temperature (Tm) of double-stranded DNA.'
      ],
      point7_learningOutcome: 'Apply Chargaff\'s rules (%A = %T, %G = %C) and explain DNA thermal stability.',
      point8_whatToRemember: 'A pairs with T (2 bonds); G pairs with C (3 bonds). G≡C is stronger and harder to denature.',
      isVerified: true
    },
    {
      diagramId: 'dna-sub-04',
      subtopicKey: 'dna_replication_fork',
      subtopicTitle: 'Semi-Conservative DNA Replication Fork Dynamics',
      diagramTitle: 'Replication Fork: Leading and Lagging Strand Synthesis',
      diagramType: 'Enzymatic Process Flowchart',
      caption: 'Enzymatic replication fork showing continuous leading strand and discontinuous Okazaki fragments.',
      svgXml: svg4,
      dataUrl: svgToDataUrl(svg4),
      point1_whatItRepresents: 'Active molecular replication machinery separating parental strands and synthesizing daughter strands.',
      point2_labelledParts: [
        { label: 'DNA Helicase', description: 'ATP-driven enzyme unwinding the parental double helix at the fork' },
        { label: 'Leading Strand', description: 'Daughter strand synthesized continuously in the 5\' to 3\' direction toward the fork' },
        { label: 'Lagging Strand', description: 'Daughter strand synthesized discontinuously away from the fork' },
        { label: 'Okazaki Fragments', description: 'Short newly synthesized DNA segments on the lagging strand' },
        { label: 'DNA Ligase', description: 'Enzyme sealing nicked phosphodiester backbones between Okazaki fragments' }
      ],
      point3_componentFunctions: 'Duplicates chromosomes accurately prior to mitosis and cell division.',
      point4_componentRelationships: 'Helicase creates the fork; DNA Polymerase III extends; Ligase seals backbones.',
      point5_directionOfMovementOrProcess: 'Polymerization is strictly 5\'→3\'; fork moves progressively forward along parental DNA.',
      point6_stepByStepInterpretation: [
        '1. Helicase unwinds the double helix, stabilized by single-strand binding proteins.',
        '2. Primase synthesizes short RNA primers for DNA Polymerase initiation.',
        '3. Leading strand proceeds continuously; lagging strand creates Okazaki fragments.',
        '4. RNA primers are removed and replaced with DNA; Ligase seals final nicks.'
      ],
      point7_learningOutcome: 'Explain why DNA replication is asymmetric and semi-conservative.',
      point8_whatToRemember: 'Leading strand is continuous; lagging strand is discontinuous (Okazaki). Each daughter has 1 parent strand.',
      isVerified: true
    }
  ];
}

// ============================================================================
// 2. ELECTRICITY & CIRCUITS — 3 DEDICATED SUBTOPIC DIAGRAMS
// ============================================================================

export function getElectricitySubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Simple Electric Circuit
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Basic Electric Circuit — Closed Conducting Loop</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Potential Difference (V) Drives Conventional Current (Clockwise) Opposite to Electron Drift</text>

    <!-- Wire Loop -->
    <rect x="140" y="110" width="520" height="260" rx="14" fill="none" stroke="#64748B" stroke-width="4"/>

    <!-- Battery (Left Branch) -->
    <g transform="translate(140, 240)">
      <line x1="0" y1="-50" x2="0" y2="-15" stroke="#64748B" stroke-width="4"/>
      <!-- Long positive plate -->
      <line x1="-30" y1="-15" x2="30" y2="-15" stroke="#EF4444" stroke-width="5"/>
      <text x="-45" y="-10" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#EF4444">+</text>
      <!-- Short thick negative plate -->
      <line x1="-18" y1="15" x2="18" y2="15" stroke="#3B82F6" stroke-width="8"/>
      <text x="-45" y="20" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#3B82F6">-</text>
      <line x1="0" y1="15" x2="0" y2="50" stroke="#64748B" stroke-width="4"/>
      <text x="40" y="5" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">DC Cell (V)</text>
    </g>

    <!-- Switch (Top Branch) -->
    <g transform="translate(400, 110)">
      <circle cx="-30" cy="0" r="5" fill="#F8FAFC"/>
      <line x1="-30" y1="0" x2="25" y2="0" stroke="#22C55E" stroke-width="4"/>
      <circle cx="30" cy="0" r="5" fill="#F8FAFC"/>
      <text x="0" y="-18" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">Closed Switch (Key)</text>
    </g>

    <!-- Bulb / Resistor (Right Branch) -->
    <g transform="translate(660, 240)">
      <circle cx="0" cy="0" r="28" fill="#FEF08A" stroke="#F59E0B" stroke-width="3"/>
      <path d="M -12 -12 L 0 12 L 12 -12" fill="none" stroke="#D97706" stroke-width="3"/>
      <text x="45" y="5" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FBBF24">Lamp / Load</text>
    </g>

    <!-- Conventional Current Arrows (Clockwise) -->
    <polygon points="530,110 515,103 515,117" fill="#EF4444"/>
    <text x="520" y="95" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#F87171">Current I (+ to -)</text>

    <!-- Electron Drift Arrows (Counter-Clockwise) -->
    <polygon points="270,370 285,363 285,377" fill="#38BDF8"/>
    <text x="280" y="395" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#38BDF8">Electron Drift (e⁻)</text>

    <rect x="140" y="405" width="520" height="42" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="400" y="431" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">A closed circuit requires continuous conducting loop; opening the key creates an infinite resistance air gap.</text>
  </svg>`;

  // Diagram 2: Series vs Parallel Comparison
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Series vs. Parallel Circuit Topologies</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Current &amp; Voltage Distribution Invariance Comparison</text>

    <!-- Left Box: Series -->
    <g transform="translate(60, 90)">
      <rect width="320" height="280" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
      <text x="160" y="30" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="middle">Series Circuit (Single Loop)</text>
      <!-- Circuit schematic -->
      <rect x="40" y="60" width="240" height="130" rx="10" fill="none" stroke="#64748B" stroke-width="3"/>
      <!-- Two resistors inline -->
      <rect x="90" y="50" width="50" height="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
      <text x="115" y="65" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">R₁</text>
      <rect x="180" y="50" width="50" height="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
      <text x="205" y="65" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">R₂</text>
      <!-- Rules -->
      <text x="30" y="220" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC">• Same Current: I = I₁ = I₂</text>
      <text x="30" y="245" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC">• Split Voltage: V = V₁ + V₂</text>
      <text x="30" y="270" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#38BDF8">• Req = R₁ + R₂ (Increases)</text>
    </g>

    <!-- Right Box: Parallel -->
    <g transform="translate(420, 90)">
      <rect width="320" height="280" rx="14" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
      <text x="160" y="30" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#34D399" text-anchor="middle">Parallel Circuit (Multi-Branch)</text>
      <!-- Circuit schematic with 2 parallel branches -->
      <rect x="40" y="60" width="240" height="130" rx="10" fill="none" stroke="#64748B" stroke-width="3"/>
      <line x1="120" y1="60" x2="120" y2="190" stroke="#64748B" stroke-width="3"/>
      <line x1="200" y1="60" x2="200" y2="190" stroke="#64748B" stroke-width="3"/>
      <rect x="95" y="115" width="50" height="20" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
      <text x="120" y="130" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">R₁</text>
      <rect x="175" y="115" width="50" height="20" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
      <text x="200" y="130" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">R₂</text>
      <!-- Rules -->
      <text x="30" y="220" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC">• Same Voltage: V = V₁ = V₂</text>
      <text x="30" y="245" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC">• Split Current: I = I₁ + I₂</text>
      <text x="30" y="270" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#34D399">• 1/Req = 1/R₁ + 1/R₂ (Decreases)</text>
    </g>

    <!-- Bottom Domestic Advantage Note -->
    <rect x="60" y="390" width="680" height="55" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="415" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Domestic Wiring Rule: Houses are wired in parallel so each appliance receives full 230V,</text>
    <text x="400" y="435" font-family="Inter, sans-serif" font-size="11.5" fill="#E2E8F0" text-anchor="middle">can be operated with an independent switch, and if one appliance fails, others continue running.</text>
  </svg>`;

  // Diagram 3: Ohm's Law and V-I Graph
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Ohm's Law: V = I · R &amp; Linear V-I Characteristic</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Current is Directly Proportional to Potential Difference Across an Ohmic Conductor at Constant T</text>

    <!-- Left: Experimental Circuit -->
    <g transform="translate(60, 90)">
      <rect width="320" height="340" rx="14" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
      <text x="160" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F8FAFC" text-anchor="middle">Verification Circuit Schematic</text>
      <!-- Circuit Loop -->
      <rect x="40" y="60" width="240" height="150" rx="10" fill="none" stroke="#64748B" stroke-width="3"/>
      <!-- Ammeter in Series -->
      <circle cx="160" cy="60" r="18" fill="#0284C7"/>
      <text x="160" y="66" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">A</text>
      <text x="160" y="38" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#38BDF8" text-anchor="middle">Ammeter (Series)</text>
      <!-- Resistor R -->
      <rect x="250" y="115" width="20" height="45" fill="#0F172A" stroke="#FF6A00" stroke-width="2"/>
      <text x="290" y="142" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FF8533">R</text>
      <!-- Voltmeter in Parallel across R -->
      <path d="M 230 115 L 200 115 L 200 160 L 230 160" fill="none" stroke="#EC4899" stroke-width="2.5"/>
      <circle cx="200" cy="137" r="16" fill="#BE185D"/>
      <text x="200" y="143" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">V</text>
      <text x="140" y="142" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#F472B6" text-anchor="middle">Voltmeter</text>
      <!-- Rheostat -->
      <rect x="120" y="200" width="80" height="20" fill="#334155"/>
      <line x1="160" y1="200" x2="160" y2="185" stroke="#FBBF24" stroke-width="3"/>
      <polygon points="160,185 155,195 165,195" fill="#FBBF24"/>
      <text x="160" y="240" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FDE047" text-anchor="middle">Variable Rheostat (Rh)</text>
      <text x="160" y="295" font-family="Inter, sans-serif" font-size="11.5" fill="#CBD5E1" text-anchor="middle">• Ammeter measures Current (I)</text>
      <text x="160" y="318" font-family="Inter, sans-serif" font-size="11.5" fill="#CBD5E1" text-anchor="middle">• Voltmeter measures Voltage (V)</text>
    </g>

    <!-- Right: V-I Graph -->
    <g transform="translate(420, 90)">
      <rect width="320" height="340" rx="14" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
      <text x="160" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F8FAFC" text-anchor="middle">V-I Characteristic Graph</text>
      <!-- Coordinate Axes -->
      <line x1="50" y1="260" x2="280" y2="260" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="285" y="265" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">I (Amperes)</text>
      <line x1="50" y1="260" x2="50" y2="60" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="45" y="50" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#EF4444">V (Volts)</text>
      <!-- Origin -->
      <text x="35" y="275" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8">0</text>
      <!-- Linear Plot Line -->
      <line x1="50" y1="260" x2="250" y2="90" stroke="#FF6A00" stroke-width="4"/>
      <circle cx="150" cy="175" r="5" fill="#FF8533"/>
      <circle cx="200" cy="132" r="5" fill="#FF8533"/>
      <!-- Slope triangle -->
      <line x1="150" y1="175" x2="200" y2="175" stroke="#38BDF8" stroke-width="2" stroke-dasharray="4 3"/>
      <line x1="200" y1="175" x2="200" y2="132" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 3"/>
      <text x="175" y="195" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#38BDF8">ΔI</text>
      <text x="215" y="155" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#EF4444">ΔV</text>
      <!-- Formula Banner -->
      <rect x="50" y="280" width="220" height="42" rx="8" fill="#0F172A" stroke="#FF6A00" stroke-width="1.5"/>
      <text x="160" y="306" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FF8533" text-anchor="middle">Slope = ΔV / ΔI = Resistance R</text>
    </g>
  </svg>`;

  return [
    {
      diagramId: 'elec-sub-01',
      subtopicKey: 'electricity_simple_circuit',
      subtopicTitle: 'Closed Conducting Circuit & Current Flow',
      diagramTitle: 'Electric Circuit: Conventional Current vs. Electron Drift',
      diagramType: 'Electrical Schematic',
      caption: 'A simple closed circuit with battery, switch, and lamp showing opposite flow directions.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: 'A complete conducting loop converting chemical energy from a cell into light and heat energy.',
      point2_labelledParts: [
        { label: 'DC Cell / Battery', description: 'Creates potential difference between positive anode and negative cathode' },
        { label: 'Closed Switch (Key)', description: 'Conducting bridge allowing continuous electron movement' },
        { label: 'Lamp / Resistor', description: 'Consumes electrical energy through collisions with conductor lattice' },
        { label: 'Conventional Current', description: 'Standard historical direction of positive charge flow (clockwise: + to -)' },
        { label: 'Electron Drift', description: 'Physical motion of negative electrons (counter-clockwise: - to +)' }
      ],
      point3_componentFunctions: 'Directs organized electric current through resistive loads to perform work.',
      point4_componentRelationships: 'Battery provides potential difference V; circuit resistance R determines current I = V/R.',
      point5_directionOfMovementOrProcess: 'Electrons drift toward positive terminal; conventional current points from positive to negative.',
      point6_stepByStepInterpretation: [
        '1. Chemical reactions inside the battery maintain a potential difference between terminals.',
        '2. Closing the switch establishes an electric field through the wire at nearly the speed of light.',
        '3. Free electrons drift slowly (order of mm/s), colliding with atoms to produce heat/light.'
      ],
      point7_learningOutcome: 'Distinguish between conventional current and electron drift in a closed loop.',
      point8_whatToRemember: 'Current flows from + to -; electrons flow from - to +. Open circuits have zero current.',
      isVerified: true
    },
    {
      diagramId: 'elec-sub-02',
      subtopicKey: 'electricity_series_parallel',
      subtopicTitle: 'Series and Parallel Circuit Invariants',
      diagramTitle: 'Comparison: Current and Voltage Distribution in Series and Parallel',
      diagramType: 'Comparative Circuit Schematic',
      caption: 'Side-by-side comparison of current and voltage division in series versus parallel topologies.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: 'The fundamental mathematical rules governing voltage, current, and equivalent resistance in resistor networks.',
      point2_labelledParts: [
        { label: 'Series Topology', description: 'Single path for current; total resistance Req = R1 + R2' },
        { label: 'Parallel Topology', description: 'Multiple branches; total reciprocal resistance 1/Req = 1/R1 + 1/R2' },
        { label: 'Series Current Invariant', description: 'Current is identical through every component (I = I1 = I2)' },
        { label: 'Parallel Voltage Invariant', description: 'Potential difference is identical across every branch (V = V1 = V2)' }
      ],
      point3_componentFunctions: 'Enables engineering of electrical power grids, household appliances, and electronics.',
      point4_componentRelationships: 'In series, failure of one component breaks whole circuit; in parallel, branches operate independently.',
      point5_directionOfMovementOrProcess: 'Parallel current splits inversely proportional to branch resistance.',
      point6_stepByStepInterpretation: [
        '1. In series, voltages add up: V = V1 + V2 = I(R1 + R2).',
        '2. In parallel, currents add up: I = I1 + I2 = V(1/R1 + 1/R2).',
        '3. Parallel equivalent resistance is always smaller than the smallest branch resistance.'
      ],
      point7_learningOutcome: 'Calculate equivalent resistance for series and parallel networks and justify domestic parallel wiring.',
      point8_whatToRemember: 'Series: Same current, voltages divide. Parallel: Same voltage, currents divide.',
      isVerified: true
    },
    {
      diagramId: 'elec-sub-03',
      subtopicKey: 'electricity_ohms_law',
      subtopicTitle: 'Ohm\'s Law & Linear V-I Characteristic',
      diagramTitle: 'Ohm\'s Law: Experimental Setup and Linear V-I Plot',
      diagramType: 'Experimental Graph and Circuit',
      caption: 'Apparatus layout and straight-line V-I graph whose constant gradient represents resistance.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      point1_whatItRepresents: 'Ohm\'s empirical relationship stating that current through a metallic conductor is directly proportional to potential difference.',
      point2_labelledParts: [
        { label: 'Ammeter', description: 'Low-resistance instrument connected in series to measure current' },
        { label: 'Voltmeter', description: 'High-resistance instrument connected in parallel across resistor to measure voltage' },
        { label: 'Variable Rheostat', description: 'Adjustable resistor used to vary circuit current in steps' },
        { label: 'Linear V-I Curve', description: 'Straight line passing through the origin; slope equals electrical resistance R' }
      ],
      point3_componentFunctions: 'Defines the electrical resistance R = V / I in ohms (Ω).',
      point4_componentRelationships: 'Doubling voltage doubles current, maintaining constant ratio V/I = R under steady temperature.',
      point5_directionOfMovementOrProcess: 'Non-ohmic materials (diodes, bulbs) curve away from linearity as temperature rises.',
      point6_stepByStepInterpretation: [
        '1. Set rheostat to minimum, record ammeter reading (I) and voltmeter reading (V).',
        '2. Adjust rheostat to take 5 incremental pairs of V and I measurements.',
        '3. Plot V along y-axis and I along x-axis; verify straight line passing through origin.'
      ],
      point7_learningOutcome: 'Verify Ohm\'s law experimentally and extract resistance from the gradient of a V-I graph.',
      point8_whatToRemember: 'V = I · R. Voltmeter in parallel, ammeter in series. Slope of V-I graph gives resistance R.',
      isVerified: true
    }
  ];
}

// ============================================================================
// 3. GEOMETRY — 3 DEDICATED SUBTOPIC DIAGRAMS
// ============================================================================

export function getGeometrySubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Triangle Angle Sum Theorem
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Triangle Angle Sum Theorem &amp; Exterior Angle Proof</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Sum of Interior Angles = 180° • Exterior Angle Equals Sum of Opposite Interior Angles</text>

    <!-- Triangle ABC -->
    <polygon points="400,140 220,360 580,360" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>

    <!-- Auxiliary Line through A parallel to BC -->
    <line x1="160" y1="140" x2="640" y2="140" stroke="#FDE047" stroke-width="3" stroke-dasharray="6 4"/>
    <text x="140" y="145" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">D</text>
    <text x="655" y="145" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">E</text>
    <text x="400" y="115" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FDE047" text-anchor="middle">Auxiliary Line DE ∥ BC</text>

    <!-- Vertices -->
    <text x="400" y="165" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">A (∠1)</text>
    <text x="210" y="390" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF">B (∠2)</text>
    <text x="580" y="390" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF">C (∠3)</text>

    <!-- Extended base for exterior angle -->
    <line x1="580" y1="360" x2="720" y2="360" stroke="#EC4899" stroke-width="3" stroke-dasharray="6 4"/>
    <text x="730" y="365" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F472B6">X</text>
    <path d="M 610 360 A 30 30 0 0 0 565 335" fill="none" stroke="#EC4899" stroke-width="3"/>
    <text x="625" y="335" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F472B6">∠ACX = ∠A + ∠B</text>

    <!-- Proof Box -->
    <rect x="180" y="410" width="440" height="46" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Straight Line: ∠DAB + ∠BAC + ∠EAC = 180° ⇒ ∠B + ∠A + ∠C = 180°</text>
  </svg>`;

  // Diagram 2: Pythagorean Proof
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Geometric Visual Proof of Pythagorean Theorem</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Square of Side (a + b) Composed of 4 Congruent Triangles + Inner Square c²</text>

    <!-- Outer Square of side a+b (260x260) -->
    <g transform="translate(100, 100)">
      <rect width="260" height="260" rx="4" fill="#1E293B" stroke="#CBD5E1" stroke-width="3"/>
      <!-- Inner tilted square of side c (vertices: (80,0), (260,80), (180,260), (0,180)) -->
      <polygon points="80,0 260,80 180,260 0,180" fill="#3B82F6" stroke="#60A5FA" stroke-width="2.5"/>
      <text x="130" y="145" font-family="Inter, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">c²</text>
      <!-- Triangle 1 (Top Left) -->
      <text x="40" y="-10" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F87171">a</text>
      <text x="170" y="-10" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#34D399">b</text>
      <text x="45" y="80" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#93C5FD">c</text>
    </g>

    <!-- Algebraic Deduction Card on Right -->
    <g transform="translate(420, 100)">
      <rect width="320" height="260" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
      <text x="160" y="35" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="middle">Algebraic Proof Steps</text>
      <text x="30" y="75" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#F8FAFC">1. Total Area = (a + b)²</text>
      <text x="50" y="100" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8">= a² + 2ab + b²</text>
      <text x="30" y="135" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#F8FAFC">2. Sum of Sub-components:</text>
      <text x="50" y="160" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8">= 4 × [½ · a · b] + c²</text>
      <text x="50" y="180" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8">= 2ab + c²</text>
      <!-- Equality -->
      <line x1="30" y1="200" x2="290" y2="200" stroke="#334155" stroke-width="1.5"/>
      <rect x="30" y="210" width="260" height="38" rx="8" fill="#0F172A" stroke="#22C55E" stroke-width="2"/>
      <text x="160" y="235" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#4ADE80" text-anchor="middle">a² + b² = c²  ✓ (Q.E.D.)</text>
    </g>

    <!-- Summary footer -->
    <rect x="100" y="390" width="640" height="45" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="418" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Pythagorean Triples Invariant: In every Euclidean right-angled triangle, hypotenuse square equals sum of leg squares.</text>
  </svg>`;

  // Diagram 3: Circle Theorems
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Circle Geometry: Angle at Center is Double Circumference Angle</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Theorem: ∠AOB = 2 × ∠ACB for Arc AB Subtending Angles at Center O and Circumference C</text>

    <!-- Circle (Center 400, 250, Radius 150) -->
    <circle cx="400" cy="250" r="140" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>
    <circle cx="400" cy="250" r="6" fill="#F59E0B"/>
    <text x="415" y="255" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FBBF24">O</text>

    <!-- Point A, B on arc, Point C on circumference -->
    <!-- C at top (400, 110) -->
    <circle cx="400" cy="110" r="6" fill="#FFFFFF"/>
    <text x="400" y="95" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">C (θ)</text>

    <!-- A at bottom left (280, 320) -->
    <circle cx="280" cy="320" r="6" fill="#FFFFFF"/>
    <text x="255" y="335" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF">A</text>

    <!-- B at bottom right (520, 320) -->
    <circle cx="520" cy="320" r="6" fill="#FFFFFF"/>
    <text x="535" y="335" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF">B</text>

    <!-- Chords CA and CB -->
    <line x1="400" y1="110" x2="280" y2="320" stroke="#EC4899" stroke-width="3"/>
    <line x1="400" y1="110" x2="520" y2="320" stroke="#EC4899" stroke-width="3"/>

    <!-- Radii OA and OB -->
    <line x1="400" y1="250" x2="280" y2="320" stroke="#F59E0B" stroke-width="3.5"/>
    <line x1="400" y1="250" x2="520" y2="320" stroke="#F59E0B" stroke-width="3.5"/>

    <!-- Angle Arcs -->
    <path d="M 385 135 A 30 30 0 0 0 415 135" fill="none" stroke="#EC4899" stroke-width="3"/>
    <text x="400" y="155" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F472B6" text-anchor="middle">θ</text>

    <path d="M 360 270 A 50 50 0 0 0 440 270" fill="none" stroke="#F59E0B" stroke-width="3.5"/>
    <text x="400" y="295" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FBBF24" text-anchor="middle">2θ</text>

    <!-- Corollary Box -->
    <rect x="140" y="410" width="520" height="45" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Corollary: Angles subtended by the same arc in the same segment are equal; angle in a semicircle is 90°.</text>
  </svg>`;

  return [
    {
      diagramId: 'geom-sub-01',
      subtopicKey: 'geometry_triangle_angle_sum',
      subtopicTitle: 'Triangle Angle Sum & Exterior Angle Theorems',
      diagramTitle: 'Triangle Interior & Exterior Angle Proof',
      diagramType: 'Geometric Proof Diagram',
      caption: 'Auxiliary line parallel to base proves interior angle sum is 180° and exterior angle equals sum of opposite interiors.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: 'Geometric proof that the sum of the three interior angles of any planar triangle equals exactly 180 degrees.',
      point2_labelledParts: [
        { label: 'Triangle ABC', description: 'Planar three-sided polygon with interior vertices A, B, and C' },
        { label: 'Auxiliary Line DE', description: 'Line drawn through vertex A parallel to base BC' },
        { label: 'Alternate Interior Angles', description: 'Angles formed across transversal lines equal to base angles (∠DAB = ∠B, ∠EAC = ∠C)' },
        { label: 'Exterior Angle ∠ACX', description: 'Angle formed by extending side BC, equaling sum of opposite interior angles (∠A + ∠B)' }
      ],
      point3_componentFunctions: 'Forms the foundational postulate for all planar Euclidean trigonometry and polygon angle calculations.',
      point4_componentRelationships: 'Parallel lines guarantee alternate interior angles are congruent.',
      point5_directionOfMovementOrProcess: 'Extending any side creates an exterior angle supplementary to the adjacent interior angle.',
      point6_stepByStepInterpretation: [
        '1. Construct line DE parallel to base BC passing through vertex A.',
        '2. By alternate interior angle theorem, ∠DAB = ∠ABC and ∠EAC = ∠ACB.',
        '3. Since DE is a straight line, ∠DAB + ∠BAC + ∠EAC = 180°.',
        '4. Substituting base angles yields ∠B + ∠A + ∠C = 180°.'
      ],
      point7_learningOutcome: 'Apply the 180° interior sum and exterior angle properties to solve geometric configurations.',
      point8_whatToRemember: 'Interior angles always sum to 180°. Exterior angle equals sum of the two opposite interior angles.',
      isVerified: true
    },
    {
      diagramId: 'geom-sub-02',
      subtopicKey: 'geometry_pythagorean_proof',
      subtopicTitle: 'Pythagorean Theorem Geometric Proof',
      diagramTitle: 'Visual Dissection Proof: a² + b² = c²',
      diagramType: 'Area Equivalence Diagram',
      caption: 'Four right triangles inside a square of side (a+b) leave an inner square of area c², proving a² + b² = c².',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: 'Geometric area equivalence showing that the hypotenuse square equals the sum of the squares of the legs.',
      point2_labelledParts: [
        { label: 'Leg a (Base)', description: 'Shorter perpendicular side of the right-angled triangle' },
        { label: 'Leg b (Perpendicular)', description: 'Longer perpendicular side of the right-angled triangle' },
        { label: 'Hypotenuse c', description: 'Side opposite the 90-degree right angle' },
        { label: 'Inner Square c²', description: 'Tilted central square enclosed by the 4 right triangle hypotenuses' }
      ],
      point3_componentFunctions: 'Calculates distances, vectors, and norms in Euclidean coordinate spaces.',
      point4_componentRelationships: 'Area of outer square (a+b)² expands to 4 × (½ab) + c².',
      point5_directionOfMovementOrProcess: 'Cancelling 2ab from both sides proves a² + b² = c² without loss of generality.',
      point6_stepByStepInterpretation: [
        '1. Construct a large square of side (a + b) with total area = (a + b)² = a² + 2ab + b².',
        '2. Arrange 4 identical right-angled triangles in the corners (total triangle area = 2ab).',
        '3. The remaining unshaded central area forms a square of side c with area c².',
        '4. Equating areas: a² + 2ab + b² = 2ab + c² ⇒ a² + b² = c².'
      ],
      point7_learningOutcome: 'Deduce the Pythagorean theorem using geometric dissection and algebraic area equivalence.',
      point8_whatToRemember: 'In any right triangle with legs a, b and hypotenuse c: a² + b² = c².',
      isVerified: true
    },
    {
      diagramId: 'geom-sub-03',
      subtopicKey: 'geometry_circle_theorems',
      subtopicTitle: 'Circle Geometry: Inscribed and Central Angles',
      diagramTitle: 'Angle at Center is Double Angle at Circumference',
      diagramType: 'Geometric Circle Diagram',
      caption: 'Arc AB subtends central angle 2θ and circumference angle θ, proving ∠AOB = 2∠ACB.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      point1_whatItRepresents: 'The relationship between angles subtended by the same circular arc at the center versus the circumference.',
      point2_labelledParts: [
        { label: 'Circle Center O', description: 'Equidistant origin from all points on the circumference' },
        { label: 'Arc AB', description: 'Subtending boundary segment of the circle' },
        { label: 'Central Angle ∠AOB (2θ)', description: 'Angle subtended at the center by radii OA and OB' },
        { label: 'Inscribed Angle ∠ACB (θ)', description: 'Angle subtended at any point C on the major circumference' }
      ],
      point3_componentFunctions: 'Underpins cyclic quadrilaterals, tangents, and navigation geometry.',
      point4_componentRelationships: 'Angle at circumference is always exactly half the angle at the center.',
      point5_directionOfMovementOrProcess: 'Moving vertex C along the same circular segment leaves angle θ invariant.',
      point6_stepByStepInterpretation: [
        '1. Radii OA, OB, and OC are equal, forming two isosceles triangles (ΔAOC and ΔBOC).',
        '2. Base angles in each triangle are equal.',
        '3. Exterior angle of ΔAOC equals 2α, and of ΔBOC equals 2β.',
        '4. Summing central parts proves ∠AOB = 2(α + β) = 2 × ∠ACB.'
      ],
      point7_learningOutcome: 'Apply circle angle theorems to compute unknown angles in cyclic and chord configurations.',
      point8_whatToRemember: 'Central angle is twice the circumference angle. Angle in a semicircle is always 90°.',
      isVerified: true
    }
  ];
}

// ============================================================================
// 4. THE FRENCH REVOLUTION — 3 DEDICATED SUBTOPIC DIAGRAMS
// ============================================================================

export function getFrenchRevolutionSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: The Three Estates Social Pyramid
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Ancien Régime: The Three Estates Social Hierarchy (1789)</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Social Injustice: 2% Privileged Nobility &amp; Clergy Paid Zero Taxes; 98% Third Estate Bore Entire National Tax Burden</text>

    <!-- Pyramid Tier 1: Clergy (Top) -->
    <polygon points="400,90 320,170 480,170" fill="#9333EA" stroke="#C084FC" stroke-width="2"/>
    <text x="400" y="135" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">FIRST ESTATE</text>
    <text x="400" y="155" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F3E8FF" text-anchor="middle">Clergy (1% Pop • Tax Exempt • Tithe)</text>

    <!-- Pyramid Tier 2: Nobility (Middle) -->
    <polygon points="320,175 480,175 560,265 240,265" fill="#2563EB" stroke="#60A5FA" stroke-width="2"/>
    <text x="400" y="215" font-family="Inter, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">SECOND ESTATE</text>
    <text x="400" y="240" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#DBEAFE" text-anchor="middle">Nobility (2% Pop • Feudal Dues • 25% Land)</text>

    <!-- Pyramid Tier 3: Third Estate (Base) -->
    <polygon points="240,270 560,270 660,380 140,380" fill="#DC2626" stroke="#F87171" stroke-width="2"/>
    <text x="400" y="315" font-family="Inter, sans-serif" font-size="17" font-weight="900" fill="#FFFFFF" text-anchor="middle">THIRD ESTATE (97% - 98% OF POPULATION)</text>
    <text x="400" y="340" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#FEE2E2" text-anchor="middle">Bourgeoisie, Merchants, Artisans, Landless Peasants</text>
    <text x="400" y="362" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FEF08A" text-anchor="middle">Bore All Taxes: Taille (State), Tithe (Church), Corvée (Forced Labor)</text>

    <!-- Tax burden side-box -->
    <rect x="100" y="405" width="600" height="45" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="432" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Political Trigger: Voting in Estates-General was 1 vote per Estate (2 to 1 against the 98% majority).</text>
  </svg>`;

  // Diagram 2: Storming of the Bastille
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">July 14, 1789 — Storming of the Bastille</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">The Fall of the Medieval Royal Fortress and Birth of Popular Revolutionary Sovereignty</text>

    <!-- Bastille Fortress Towers on Right -->
    <g transform="translate(420, 100)">
      <rect x="0" y="20" width="300" height="260" rx="4" fill="#334155" stroke="#475569" stroke-width="3"/>
      <!-- Towers -->
      <rect x="-20" y="0" width="80" height="280" rx="10" fill="#1E293B" stroke="#475569" stroke-width="2"/>
      <rect x="240" y="0" width="80" height="280" rx="10" fill="#1E293B" stroke="#475569" stroke-width="2"/>
      <!-- Lowered Drawbridge -->
      <line x1="-30" y1="200" x2="-140" y2="260" stroke="#78350F" stroke-width="8"/>
      <!-- Smoke / Fire -->
      <ellipse cx="60" cy="80" rx="50" ry="30" fill="#F97316" opacity="0.6"/>
      <ellipse cx="140" cy="50" rx="70" ry="40" fill="#EF4444" opacity="0.5"/>
      <text x="150" y="150" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#F8FAFC" text-anchor="middle">Bastille Fortress</text>
      <text x="150" y="175" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#CBD5E1" text-anchor="middle">Symbol of Royal Despotism</text>
    </g>

    <!-- Revolutionary Crowds on Left -->
    <g transform="translate(60, 140)">
      <rect width="300" height="220" rx="14" fill="#1E293B" stroke="#EF4444" stroke-width="2"/>
      <text x="150" y="35" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#F87171" text-anchor="middle">Armed Citizens &amp; National Guard</text>
      <text x="30" y="75" font-family="Inter, sans-serif" font-size="12" fill="#E2E8F0">• Rumours of King's mercenary troop buildup</text>
      <text x="30" y="105" font-family="Inter, sans-serif" font-size="12" fill="#E2E8F0">• Raid on Hôtel des Invalides for muskets</text>
      <text x="30" y="135" font-family="Inter, sans-serif" font-size="12" fill="#E2E8F0">• Demand for Bastille's 250 barrels of gunpowder</text>
      <text x="30" y="165" font-family="Inter, sans-serif" font-size="12" fill="#E2E8F0">• Surrender of Governor de Launay</text>
      <!-- Tricolor Flag Icon -->
      <rect x="110" y="180" width="25" height="20" fill="#1D4ED8"/>
      <rect x="135" y="180" width="25" height="20" fill="#FFFFFF"/>
      <rect x="160" y="180" width="25" height="20" fill="#DC2626"/>
    </g>

    <rect x="100" y="390" width="600" height="45" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="400" y="418" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Historical Significance: Marked the collapse of absolute royal authority; commemorated as French National Day.</text>
  </svg>`;

  // Diagram 3: Declaration of the Rights of Man
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Declaration of the Rights of Man and of the Citizen (1789)</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Enlightenment Ideals: Men are born and remain free and equal in rights</text>

    <!-- Left & Right Stone Tablets -->
    <g transform="translate(180, 85)">
      <!-- Left Tablet -->
      <path d="M 0 50 Q 100 0 200 50 L 200 290 L 0 290 Z" fill="#1E293B" stroke="#FBBF24" stroke-width="3"/>
      <text x="100" y="90" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FDE047" text-anchor="middle">Natural Rights</text>
      <text x="25" y="125" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 1: Freedom &amp; Equality</text>
      <text x="25" y="155" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 2: Liberty, Property, Security</text>
      <text x="25" y="185" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 3: Popular Sovereignty</text>
      <text x="25" y="215" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 4: Liberty limited only by law</text>
      <text x="25" y="245" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 6: Law is expression of will</text>

      <!-- Right Tablet -->
      <path d="M 240 50 Q 340 0 440 50 L 440 290 L 240 290 Z" fill="#1E293B" stroke="#FBBF24" stroke-width="3"/>
      <text x="340" y="90" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FDE047" text-anchor="middle">Civil Liberties</text>
      <text x="265" y="125" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 7: Due Process of Law</text>
      <text x="265" y="155" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 9: Presumption of Innocence</text>
      <text x="265" y="185" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 10: Freedom of Speech/Religion</text>
      <text x="265" y="215" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 11: Free Press &amp; Opinions</text>
      <text x="265" y="245" font-family="Inter, sans-serif" font-size="11" fill="#F8FAFC">Article 17: Sacred Right to Property</text>

      <!-- All-Seeing Eye of Providence at top -->
      <polygon points="220,10 190,40 250,40" fill="#FBBF24"/>
      <circle cx="220" cy="28" r="5" fill="#0F172A"/>
    </g>

    <!-- Bottom Significance Banner -->
    <rect x="100" y="400" width="600" height="45" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="400" y="428" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Abolished Feudalism: Replaced aristocratic birthright privileges with universal legal equality under constitutional rule.</text>
  </svg>`;

  return [
    {
      diagramId: 'frev-sub-01',
      subtopicKey: 'french_rev_three_estates',
      subtopicTitle: 'The Three Estates Social Structure of 1789',
      diagramTitle: 'Ancien Régime Social Pyramid and Tax Inequality',
      diagramType: 'Historical Social Diagram',
      caption: 'The tripartite feudal social pyramid illustrating tax exemption of the Clergy and Nobility versus the burden of the Third Estate.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: 'The rigid social stratification of pre-revolutionary France dividing society into three legally distinct orders.',
      point2_labelledParts: [
        { label: 'First Estate (Clergy)', description: 'About 100,000 priests and bishops owning 10% of land and exempt from direct taxation' },
        { label: 'Second Estate (Nobility)', description: 'About 400,000 aristocrats holding high military and judicial posts, exempt from taxes' },
        { label: 'Third Estate (Peasants & Bourgeoisie)', description: '97-98% of the 28 million population bearing the entire fiscal burden' },
        { label: 'Feudal Taxes', description: 'Taille (land tax to the Crown), Tithe (10% crop tax to Church), and Corvée (forced road work)' }
      ],
      point3_componentFunctions: 'Concentrated political power and wealth in hereditary elites while denying representation to the working majority.',
      point4_componentRelationships: 'In the Estates-General, each estate voted as one bloc, allowing the top 2% to outvote the 98% majority 2-to-1.',
      point5_directionOfMovementOrProcess: 'Rising bread prices and state debt forced King Louis XVI to convene the Estates-General in May 1789.',
      point6_stepByStepInterpretation: [
        '1. France faced national bankruptcy following financial assistance to the American Revolution.',
        '2. The Third Estate broke away to form the National Assembly on June 17, 1789.',
        '3. Representatives swore the Tennis Court Oath, pledging not to disband until drafting a constitution.'
      ],
      point7_learningOutcome: 'Identify the structural social and economic causes that triggered the French Revolution.',
      point8_whatToRemember: '1st = Clergy, 2nd = Nobility, 3rd = Peasants/Bourgeoisie. 98% paid all taxes with zero political say.',
      isVerified: true
    },
    {
      diagramId: 'frev-sub-02',
      subtopicKey: 'french_rev_storming_bastille',
      subtopicTitle: 'Storming of the Bastille (July 14, 1789)',
      diagramTitle: 'Fall of the Bastille Fortress: Popular Insurrection',
      diagramType: 'Historical Event Schematic',
      caption: 'The assault on the medieval Bastille fortress by Parisian citizens seeking arms and defying absolute royal power.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: 'The decisive physical insurrection of the Parisian public against monarchical despotism.',
      point2_labelledParts: [
        { label: 'Bastille Towers', description: 'Eight-towered 14th-century fortress used as a royal state prison and arms depot' },
        { label: 'National Guard & Militia', description: 'Armed Parisian citizens and mutinous French Guards fighting royal mercenaries' },
        { label: 'Lowered Drawbridge', description: 'Breached by the crowd following hours of siege and cannon fire' },
        { label: 'Tricolor Cockade', description: 'Revolutionary badge combining white (monarchy) with blue and red (Paris)' }
      ],
      point3_componentFunctions: 'Provided the revolutionary movement with gunpowder and forced Louis XVI to recognize the National Assembly.',
      point4_componentRelationships: 'The popular uprising in Paris prevented the Crown from forcibly dissolving the National Assembly at Versailles.',
      point5_directionOfMovementOrProcess: 'Prompted the municipal revolution across French cities and the "Great Fear" peasant revolt in the countryside.',
      point6_stepByStepInterpretation: [
        '1. Rumors spread that royal foreign regiments were marching on Paris to crush the Assembly.',
        '2. Citizens seized 30,000 muskets from the Invalides and marched to the Bastille for gunpowder.',
        '3. After heavy fighting, the garrison surrendered; Governor de Launay was captured.',
        '4. The fortress was dismantled stone by stone as a symbol of liberation.'
      ],
      point7_learningOutcome: 'Explain the symbolic and military significance of the fall of the Bastille.',
      point8_whatToRemember: 'July 14, 1789: Storming of the Bastille marked the popular outbreak of the revolution (French National Day).',
      isVerified: true
    },
    {
      diagramId: 'frev-sub-03',
      subtopicKey: 'french_rev_declaration_rights',
      subtopicTitle: 'Declaration of the Rights of Man and of the Citizen',
      diagramTitle: 'Constitutional Charter: Universal Human Rights (1789)',
      diagramType: 'Historical Document Schematic',
      caption: 'The 17-article declaration asserting liberty, equality before the law, and national sovereignty.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      point1_whatItRepresents: 'The foundational human rights charter adopted by the National Constituent Assembly on August 26, 1789.',
      point2_labelledParts: [
        { label: 'Article 1 (Equality)', description: 'Men are born and remain free and equal in rights; social distinctions based only on common utility' },
        { label: 'Article 2 (Natural Rights)', description: 'Liberty, property, security, and resistance to oppression are inalienable rights' },
        { label: 'Article 3 (National Sovereignty)', description: 'The source of all sovereignty resides fundamentally in the nation, not the monarch' },
        { label: 'Eye of Providence', description: 'Enlightenment emblem representing divine reason shining upon natural human rights' }
      ],
      point3_componentFunctions: 'Dismantled Ancien Régime feudalism and laid the legal framework for modern democratic constitutions.',
      point4_componentRelationships: 'Influenced by the American Declaration of Independence and Enlightenment philosophers (Rousseau, Montesquieu, Voltaire).',
      point5_directionOfMovementOrProcess: 'Shifted sovereignty from divine-right monarchy to the citizen body.',
      point6_stepByStepInterpretation: [
        '1. The National Assembly abolished feudal privileges on the historic night of August 4, 1789.',
        '2. Drafted the 17-article Declaration as the preamble to the new Constitution.',
        '3. Established freedom of speech, religion, fair taxation, and presumption of innocence.'
      ],
      point7_learningOutcome: 'Analyze the core principles of the Declaration of the Rights of Man and its global legacy.',
      point8_whatToRemember: 'Liberty, Equality, Fraternity. Sovereignty resides in the Nation, not the King.',
      isVerified: true
    }
  ];
}

// ============================================================================
// 5. EARTH'S STRUCTURE — 3 DEDICATED SUBTOPIC DIAGRAMS
// ============================================================================

export function getEarthStructureSubtopicDiagrams(): SubtopicDiagramItem[] {
  // Diagram 1: Concentric Earth Layers Cross-Section
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Earth's Internal Structure — Concentric Planetary Layers</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Chemical &amp; Mechanical Layers: Crust (0-70 km) • Mantle (2,900 km) • Core (3,470 km)</text>

    <!-- Quarter Wedge Earth Cutout on Left -->
    <g transform="translate(100, 100)">
      <!-- Inner Core (Solid Fe-Ni, Radius 1,220 km) -->
      <path d="M 0 280 L 70 210 A 100 100 0 0 1 100 280 Z" fill="#FEF08A" stroke="#FBBF24" stroke-width="2"/>
      <text x="40" y="260" font-family="Inter, sans-serif" font-size="10" font-weight="900" fill="#78350F">Inner Core</text>

      <!-- Outer Core (Liquid Fe-Ni, Thickness 2,250 km) -->
      <path d="M 70 210 L 140 140 A 200 200 0 0 1 200 280 L 100 280 A 100 100 0 0 0 70 210 Z" fill="#F97316" stroke="#EA580C" stroke-width="2"/>
      <text x="110" y="210" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">Outer Core</text>

      <!-- Mantle (Silicate Rock, Depth 2,900 km) -->
      <path d="M 140 140 L 220 60 A 310 310 0 0 1 310 280 L 200 280 A 200 200 0 0 0 140 140 Z" fill="#B45309" stroke="#D97706" stroke-width="2"/>
      <text x="195" y="150" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF">Mantle</text>

      <!-- Thin Crust (0-70 km) & Atmosphere -->
      <path d="M 220 60 A 310 310 0 0 1 310 280" fill="none" stroke="#22C55E" stroke-width="6"/>
      <text x="245" y="55" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#4ADE80">Crust</text>
    </g>

    <!-- Right Data Table Card -->
    <g transform="translate(450, 95)">
      <rect width="300" height="280" rx="14" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
      <text x="150" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8" text-anchor="middle">Physical &amp; Chemical Properties</text>

      <rect x="15" y="50" width="270" height="48" rx="8" fill="#0F172A"/>
      <text x="25" y="70" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#4ADE80">1. Crust (Lithosphere)</text>
      <text x="25" y="88" font-family="Inter, sans-serif" font-size="10.5" fill="#CBD5E1">Continental (SiAl, 35 km) • Oceanic (SiMa, 7 km)</text>

      <rect x="15" y="105" width="270" height="48" rx="8" fill="#0F172A"/>
      <text x="25" y="125" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FBBF24">2. Mantle (Asthenosphere + Mesosphere)</text>
      <text x="25" y="143" font-family="Inter, sans-serif" font-size="10.5" fill="#CBD5E1">Silicate rock rich in Fe/Mg • Plastic convection flow</text>

      <rect x="15" y="160" width="270" height="48" rx="8" fill="#0F172A"/>
      <text x="25" y="180" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FB923C">3. Outer Core (Liquid)</text>
      <text x="25" y="198" font-family="Inter, sans-serif" font-size="10.5" fill="#CBD5E1">Molten Iron-Nickel • Generates Earth's Magnetic Field</text>

      <rect x="15" y="215" width="270" height="48" rx="8" fill="#0F172A"/>
      <text x="25" y="235" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FEF08A">4. Inner Core (Solid)</text>
      <text x="25" y="253" font-family="Inter, sans-serif" font-size="10.5" fill="#CBD5E1">Dense metallic Fe-Ni ball • 6,000°C under 3.6M atm</text>
    </g>

    <rect x="100" y="400" width="600" height="45" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <text x="400" y="428" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Discontinuity Invariants: Mohorovičić (Crust-Mantle) and Gutenberg (Mantle-Core) boundaries.</text>
  </svg>`;

  // Diagram 2: Plate Boundaries
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Tectonic Plate Boundaries: Three Dynamic Regimes</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Convergent (Destructive) • Divergent (Constructive) • Transform (Conservative)</text>

    <!-- Boundary 1: Convergent (Left) -->
    <g transform="translate(40, 90)">
      <rect width="220" height="280" rx="12" fill="#1E293B" stroke="#EF4444" stroke-width="2"/>
      <text x="110" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#F87171" text-anchor="middle">1. CONVERGENT</text>
      <text x="110" y="48" font-family="Inter, sans-serif" font-size="10.5" fill="#94A3B8" text-anchor="middle">(Plates Collide → Subduction)</text>
      <!-- Subduction graphics -->
      <path d="M 20 120 L 90 120 L 140 180" fill="none" stroke="#38BDF8" stroke-width="8"/>
      <polygon points="145,185 130,175 140,165" fill="#38BDF8"/>
      <path d="M 120 120 L 200 120" stroke="#78350F" stroke-width="12"/>
      <!-- Trench & Volcano -->
      <polygon points="160,114 175,85 190,114" fill="#B45309"/>
      <circle cx="175" cy="80" r="4" fill="#EF4444"/>
      <text x="110" y="215" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• Deep Ocean Trench</text>
      <text x="110" y="235" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• Volcanic Mountain Arcs</text>
      <text x="110" y="255" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• Powerful Earthquakes</text>
    </g>

    <!-- Boundary 2: Divergent (Center) -->
    <g transform="translate(290, 90)">
      <rect width="220" height="280" rx="12" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
      <text x="110" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#34D399" text-anchor="middle">2. DIVERGENT</text>
      <text x="110" y="48" font-family="Inter, sans-serif" font-size="10.5" fill="#94A3B8" text-anchor="middle">(Plates Separate → Spreading)</text>
      <!-- Rift & Seafloor spreading -->
      <line x1="20" y1="120" x2="85" y2="120" stroke="#38BDF8" stroke-width="8"/>
      <polygon points="15,120 28,112 28,128" fill="#38BDF8"/>
      <line x1="135" y1="120" x2="200" y2="120" stroke="#38BDF8" stroke-width="8"/>
      <polygon points="205,120 192,112 192,128" fill="#38BDF8"/>
      <!-- Magma upwelling -->
      <path d="M 110 180 L 110 125" stroke="#F97316" stroke-width="6"/>
      <polygon points="110,118 102,130 118,130" fill="#F97316"/>
      <text x="110" y="215" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• Mid-Ocean Ridges</text>
      <text x="110" y="235" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• Rift Valleys (East Africa)</text>
      <text x="110" y="255" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• New Oceanic Crust Created</text>
    </g>

    <!-- Boundary 3: Transform (Right) -->
    <g transform="translate(540, 90)">
      <rect width="220" height="280" rx="12" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
      <text x="110" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FBBF24" text-anchor="middle">3. TRANSFORM</text>
      <text x="110" y="48" font-family="Inter, sans-serif" font-size="10.5" fill="#94A3B8" text-anchor="middle">(Plates Slide Past Laterally)</text>
      <!-- Lateral strike-slip faults -->
      <rect x="40" y="90" width="60" height="80" rx="4" fill="#334155"/>
      <polygon points="70,80 62,90 78,90" fill="#FBBF24"/>
      <rect x="120" y="110" width="60" height="80" rx="4" fill="#334155"/>
      <polygon points="150,200 142,190 158,190" fill="#FBBF24"/>
      <line x1="110" y1="80" x2="110" y2="200" stroke="#F87171" stroke-width="3" stroke-dasharray="4 3"/>
      <text x="110" y="215" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• San Andreas Fault Zone</text>
      <text x="110" y="235" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• Shallow Earthquakes</text>
      <text x="110" y="255" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">• Crust Neither Created/Lost</text>
    </g>

    <rect x="40" y="390" width="720" height="50" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="420" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Global Mechanism: Plate motions are driven by mantle convection, slab pull at trenches, and ridge push at rifts.</text>
  </svg>`;

  // Diagram 3: Mantle Convection Currents
  const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="20" fill="#0F172A"/>
    <text x="400" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mantle Thermal Convection — The Engine of Plate Tectonics</text>
    <text x="400" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Radioactive Decay in Core Heats Lower Mantle → Buoyant Plumes Rise → Lateral Drag Moves Lithosphere</text>

    <!-- Core at Bottom -->
    <rect x="100" y="330" width="600" height="60" rx="10" fill="#F97316" stroke="#FB923C" stroke-width="2"/>
    <text x="400" y="365" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">Hot Core Thermal Boundary (Heat Source)</text>

    <!-- Mantle Convection Region -->
    <rect x="100" y="140" width="600" height="180" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="1.5"/>

    <!-- Left Convection Cell (Counter-Clockwise) -->
    <path d="M 220 280 C 160 280 160 180 220 180 C 280 180 280 280 220 280" fill="none" stroke="#EF4444" stroke-width="4"/>
    <polygon points="160,225 152,238 168,238" fill="#EF4444"/>
    <polygon points="280,235 272,222 288,222" fill="#38BDF8"/>
    <text x="220" y="235" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FCA5A5" text-anchor="middle">Cell 1</text>

    <!-- Right Convection Cell (Clockwise) -->
    <path d="M 580 280 C 520 280 520 180 580 180 C 640 180 640 280 580 280" fill="none" stroke="#EF4444" stroke-width="4"/>
    <polygon points="520,235 512,222 528,222" fill="#38BDF8"/>
    <polygon points="640,225 632,238 648,238" fill="#EF4444"/>
    <text x="580" y="235" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FCA5A5" text-anchor="middle">Cell 2</text>

    <!-- Top Lithosphere Plates Moving -->
    <rect x="80" y="110" width="300" height="24" rx="4" fill="#334155" stroke="#22C55E" stroke-width="2"/>
    <polygon points="120,95 105,88 105,102" fill="#22C55E"/>
    <text x="230" y="126" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#4ADE80" text-anchor="middle">Lithospheric Plate ← (Ridge Push)</text>

    <rect x="420" y="110" width="300" height="24" rx="4" fill="#334155" stroke="#22C55E" stroke-width="2"/>
    <polygon points="680,95 695,88 695,102" fill="#22C55E"/>
    <text x="570" y="126" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#4ADE80" text-anchor="middle">Lithospheric Plate → (Ridge Push)</text>

    <!-- Rising Plume Center -->
    <line x1="400" y1="330" x2="400" y2="140" stroke="#FBBF24" stroke-width="5" stroke-dasharray="6 4"/>
    <polygon points="400,132 390,146 410,146" fill="#FBBF24"/>
    <text x="400" y="170" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FDE047" text-anchor="middle">Rising Hot Plume</text>

    <rect x="100" y="410" width="600" height="45" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="400" y="438" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F8FAFC" text-anchor="middle">Thermal Equilibrium: Cold dense slabs sink into mantle at subduction zones; hot magma rises at mid-ocean rifts.</text>
  </svg>`;

  return [
    {
      diagramId: 'earth-sub-01',
      subtopicKey: 'earth_layers_cross_section',
      subtopicTitle: 'Concentric Layers of Earth: Crust, Mantle, Core',
      diagramTitle: 'Internal Earth Cross-Section: Chemical & Mechanical Layers',
      diagramType: 'Geological Cross-Section',
      caption: 'Three-dimensional wedge showing the crust, mantle, liquid outer core, and solid inner core.',
      svgXml: svg1,
      dataUrl: svgToDataUrl(svg1),
      point1_whatItRepresents: 'The layered compositional and mechanical structure of Earth established by seismic wave propagation (P-waves and S-waves).',
      point2_labelledParts: [
        { label: 'Crust', description: 'Thin outer solid skin; continental crust (granitic, ~35 km) and oceanic crust (basaltic, ~7 km)' },
        { label: 'Mantle', description: 'Dense silicate rock layer (2,900 km thick) comprising 84% of Earth\'s volume' },
        { label: 'Liquid Outer Core', description: 'Molten iron and nickel (2,250 km thick); convection creates geodynamo magnetic field' },
        { label: 'Solid Inner Core', description: 'Solid sphere of iron-nickel (1,220 km radius) held solid by immense pressure (~3.6 million atm)' }
      ],
      point3_componentFunctions: 'Outer core geodynamo produces Earth\'s magnetosphere, shielding the biosphere from solar wind radiation.',
      point4_componentRelationships: 'Density increases inward: Crust (2.7 g/cm³) → Mantle (4.5 g/cm³) → Core (13 g/cm³).',
      point5_directionOfMovementOrProcess: 'P-waves travel through all layers; S-waves cannot traverse the liquid outer core (creating S-wave shadow zones).',
      point6_stepByStepInterpretation: [
        '1. Denser iron and nickel sank to the center during planetary differentiation 4.5 billion years ago.',
        '2. Lighter silicate minerals floated outward to form the mantle and buoyant crust.',
        '3. Crust is separated from mantle by the Mohorovičić discontinuity (Moho).'
      ],
      point7_learningOutcome: 'Distinguish the chemical and physical layers of Earth and explain how seismic waves reveal core states.',
      point8_whatToRemember: 'Crust = thin solid; Mantle = plastic silicate; Outer Core = liquid metal; Inner Core = solid metal.',
      isVerified: true
    },
    {
      diagramId: 'earth-sub-02',
      subtopicKey: 'earth_plate_boundaries',
      subtopicTitle: 'Plate Tectonics: Convergent, Divergent, Transform',
      diagramTitle: 'Three Dynamic Tectonic Boundary Regimes',
      diagramType: 'Tectonic Process Diagram',
      caption: 'Comparative mechanics of convergent subduction, divergent seafloor spreading, and transform strike-slip faults.',
      svgXml: svg2,
      dataUrl: svgToDataUrl(svg2),
      point1_whatItRepresents: 'The mechanical interactions along margins where rigid lithospheric plates meet and move relative to each other.',
      point2_labelledParts: [
        { label: 'Convergent Boundary', description: 'Plates move toward each other; denser oceanic crust subducts under continental crust creating trenches and volcanoes' },
        { label: 'Divergent Boundary', description: 'Plates pull apart; upwelling magma creates new oceanic crust along mid-ocean ridges' },
        { label: 'Transform Boundary', description: 'Plates slide past horizontally along strike-slip faults with no crust created or destroyed' }
      ],
      point3_componentFunctions: 'Shapes continental landforms, ocean basins, volcanic belts (Ring of Fire), and earthquake zones.',
      point4_componentRelationships: 'New crust created at divergent ridges is balanced by crust consumed at convergent subduction trenches.',
      point5_directionOfMovementOrProcess: 'Plates move at rates of 1 to 10 cm per year (comparable to human fingernail growth).',
      point6_stepByStepInterpretation: [
        '1. Divergent boundaries open rift valleys and widen ocean basins.',
        '2. Convergent boundaries generate deep earthquakes and mountain ranges (Himalayas).',
        '3. Transform boundaries accumulate elastic strain until snapping in shallow earthquakes.'
      ],
      point7_learningOutcome: 'Identify the three tectonic boundary types, their characteristic landforms, and real-world geographical examples.',
      point8_whatToRemember: 'Convergent = destroy/subduct; Divergent = create/spread; Transform = slide/shear.',
      isVerified: true
    },
    {
      diagramId: 'earth-sub-03',
      subtopicKey: 'earth_mantle_convection',
      subtopicTitle: 'Mantle Thermal Convection Currents',
      diagramTitle: 'Mantle Convection Cells: The Engine Driving Plate Motion',
      diagramType: 'Geophysical Thermal Flow Diagram',
      caption: 'Thermal convection loops in the asthenosphere driven by primordial and radioactive core heat.',
      svgXml: svg3,
      dataUrl: svgToDataUrl(svg3),
      point1_whatItRepresents: 'The primary hydrodynamic mechanism driving plate tectonics: thermal convection within Earth\'s semi-plastic mantle.',
      point2_labelledParts: [
        { label: 'Radioactive Heat Source', description: 'Decay of uranium, thorium, and potassium in the core/mantle boundary providing thermal energy' },
        { label: 'Rising Mantle Plume', description: 'Hot buoyant lower mantle rock rising toward mid-ocean ridges' },
        { label: 'Lateral Asthenosphere Drag', description: 'Horizontal mantle flow exerting basal shear traction on the overlying lithospheric plate' },
        { label: 'Sinking Cold Slab', description: 'Cooled, dense oceanic plate sinking into subduction zones (slab pull force)' }
      ],
      point3_componentFunctions: 'Cools the planetary interior by transferring geothermal heat from core to surface.',
      point4_componentRelationships: 'Slab pull at subduction zones provides the dominant force driving tectonic motion.',
      point5_directionOfMovementOrProcess: 'Circular convection cells with hot rock ascending beneath ridges and cool rock descending at trenches.',
      point6_stepByStepInterpretation: [
        '1. Lower mantle heated by the core becomes less dense and slowly ascends.',
        '2. Near the lithosphere, it cools, turns horizontally, and drags plates apart.',
        '3. Cooled oceanic crust densifies and sinks back into the deep mantle at subduction zones.'
      ],
      point7_learningOutcome: 'Explain how heat transfer by convection in the mantle drives continental drift and seafloor spreading.',
      point8_whatToRemember: 'Heat from the core causes hot rock to rise and cold rock to sink, driving tectonic plate movement.',
      isVerified: true
    }
  ];
}
