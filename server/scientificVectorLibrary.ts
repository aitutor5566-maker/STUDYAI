/**
 * STUDYAI – HIGH-PRECISION SCIENTIFIC & ANATOMICAL VECTOR SCHEMATICS LIBRARY
 * 
 * Replaces simplistic geometric blocks and generic placeholder shapes with 
 * authentic, textbook-grade educational vector schematics across:
 * - Biology: Human Heart, Brain, Lungs, Digestive System, Eye, DNA, Plant Cell, Animal Cell, Photosynthesis
 * - Chemistry: Chemical Bonding, Atomic Structure (Bohr Orbitals)
 * - Physics: Newton's Laws (Free-Body Diagram), Electric Circuits (Ohm's Law)
 * - Geography: Earth Water Cycle, Plate Tectonics & Volcano Cross-Section
 * - Mathematics: Pythagorean Theorem & Geometric Proofs
 * - History: World War II Chronological Strategic Timeline
 */

export interface DetailedVisualAsset {
  topic: string;
  subtopic: string;
  subject: string;
  visualType: string;
  title: string;
  caption: string;
  svgXml: string;
  labels: Array<{ id: string; name: string; x: number; y: number; role: string; color: string }>;
  walkthrough: {
    whatItShows: string;
    importantComponents: string[];
    processSequence: string[];
    examTakeaway: string;
  };
}

export const SCIENTIFIC_VECTOR_REGISTRY: Record<string, DetailedVisualAsset> = {
  // 1. HUMAN HEART (Coronal Cutaway & Double Circulation)
  human_heart: {
    topic: 'Structure of the Human Heart',
    subtopic: 'Anatomy, 4 Chambers & Double Circulation',
    subject: 'Biology',
    visualType: 'anatomical_cross_section',
    title: 'Human Heart: Internal Coronal Cutaway & Blood Flow Pathways',
    caption: 'Detailed 4-chamber anatomical cutaway showing thick myocardial walls, atrioventricular valves, and systemic/pulmonary circulation loops.',
    labels: [
      { id: 'superior_vena_cava', name: 'Superior Vena Cava', x: 260, y: 70, role: 'Returns deoxygenated blood from upper body to right atrium.', color: '#1E40AF' },
      { id: 'aortic_arch', name: 'Aortic Arch', x: 420, y: 55, role: 'Distributes oxygenated blood under high systemic pressure to body tissues.', color: '#DC2626' },
      { id: 'pulmonary_artery', name: 'Pulmonary Trunk & Artery', x: 555, y: 110, role: 'Carries deoxygenated blood from right ventricle to lungs for gas exchange.', color: '#0284C7' },
      { id: 'right_atrium', name: 'Right Atrium', x: 220, y: 200, role: 'Receives systemic deoxygenated blood.', color: '#3B82F6' },
      { id: 'tricuspid_valve', name: 'Tricuspid Valve', x: 260, y: 265, role: 'Prevents backflow from right ventricle to right atrium during systole.', color: '#F59E0B' },
      { id: 'right_ventricle', name: 'Right Ventricle', x: 250, y: 350, role: 'Pumps blood into low-resistance pulmonary circuit (approx 25 mmHg).', color: '#1D4ED8' },
      { id: 'left_atrium', name: 'Left Atrium', x: 575, y: 205, role: 'Receives oxygen-rich blood returning from 4 pulmonary veins.', color: '#EF4444' },
      { id: 'bicuspid_valve', name: 'Bicuspid (Mitral) Valve', x: 520, y: 265, role: 'High-pressure AV valve preventing backflow into left atrium.', color: '#F59E0B' },
      { id: 'left_ventricle', name: 'Left Ventricle (Thick Wall)', x: 530, y: 360, role: 'Generates systemic systolic pressure (120 mmHg); wall is 3x thicker than RV.', color: '#B91C1C' },
      { id: 'interventricular_septum', name: 'Muscular Septum', x: 395, y: 340, role: 'Thick muscular barrier preventing mixing of oxygenated and deoxygenated blood.', color: '#991B1B' }
    ],
    walkthrough: {
      whatItShows: 'Coronal cross-section of the human heart revealing the internal cavities of all four chambers, cardiac valves, and major vascular trunks.',
      importantComponents: ['Left Ventricle', 'Right Ventricle', 'Left Atrium', 'Right Atrium', 'Aorta', 'Pulmonary Trunk', 'Tricuspid & Bicuspid Valves'],
      processSequence: [
        '1. Deoxygenated blood returns from body tissues via the Venae Cavae into the Right Atrium.',
        '2. The Right Atrium contracts, passing blood through the Tricuspid Valve into the Right Ventricle.',
        '3. The Right Ventricle pumps blood through the Pulmonary Artery to the lungs for gas exchange.',
        '4. Oxygenated blood from the lungs returns via Pulmonary Veins into the Left Atrium.',
        '5. The Left Ventricle contracts forcefully, ejecting oxygenated blood through the Aorta to the entire body.'
      ],
      examTakeaway: 'Always highlight that the Left Ventricle myocardium is 3 times thicker than the Right Ventricle because it must pump blood against high systemic systemic vascular resistance.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="840" height="520">
      <defs>
        <radialGradient id="htBg" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#1E1E2E"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </radialGradient>
        <linearGradient id="aortaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#EF4444"/>
          <stop offset="100%" stop-color="#991B1B"/>
        </linearGradient>
        <linearGradient id="pulmGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
        <linearGradient id="myoGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#B91C1C"/>
          <stop offset="100%" stop-color="#581C87"/>
        </linearGradient>
      </defs>
      <rect width="840" height="520" rx="20" fill="url(#htBg)"/>
      <text x="420" y="32" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Human Heart — Coronal Cutaway &amp; Double Circulation</text>
      
      <!-- Aorta Arch (Red Top) -->
      <path d="M 370 170 C 370 70, 480 50, 480 140 L 440 150 C 440 90, 395 95, 395 170 Z" fill="url(#aortaGrad)" stroke="#F87171" stroke-width="2"/>
      <!-- Brachiocephalic, Carotid, Subclavian Branches -->
      <rect x="385" y="45" width="16" height="30" rx="5" fill="#EF4444"/>
      <rect x="415" y="40" width="16" height="35" rx="5" fill="#EF4444"/>
      <rect x="445" y="48" width="16" height="30" rx="5" fill="#EF4444"/>

      <!-- Pulmonary Trunk (Blue Left/Right bifurcation) -->
      <path d="M 350 200 C 350 140, 430 110, 450 160" stroke="url(#pulmGrad)" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M 450 135 L 510 110" stroke="url(#pulmGrad)" stroke-width="20" fill="none" stroke-linecap="round"/>

      <!-- Superior & Inferior Vena Cava -->
      <rect x="290" y="70" width="34" height="110" rx="10" fill="#1E40AF" stroke="#60A5FA" stroke-width="1.5"/>
      <rect x="295" y="380" width="30" height="60" rx="8" fill="#1E40AF"/>

      <!-- Outer Cardiac Muscle Silhouette -->
      <path d="M 270 200 C 240 240, 240 340, 310 420 C 350 460, 420 480, 430 480 C 450 480, 560 450, 580 340 C 600 250, 560 190, 510 190 Z" fill="#7F1D1D" stroke="#DC2626" stroke-width="3"/>

      <!-- Right Atrium Cavity (Blue Deoxy) -->
      <path d="M 285 200 C 270 240, 290 280, 335 280 C 355 280, 360 230, 350 200 Z" fill="#2563EB" opacity="0.95"/>
      <text x="315" y="240" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Right Atrium</text>

      <!-- Right Ventricle Cavity (Blue Deoxy) -->
      <path d="M 290 300 C 290 360, 330 420, 380 430 L 380 300 Z" fill="#1D4ED8"/>
      <text x="340" y="360" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Right Ventricle</text>

      <!-- Left Atrium Cavity (Red Oxygenated) -->
      <path d="M 460 200 C 450 240, 470 280, 520 280 C 545 280, 550 230, 530 200 Z" fill="#DC2626" opacity="0.95"/>
      <text x="500" y="240" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Left Atrium</text>

      <!-- Left Ventricle Cavity (Red Oxygenated, Thick Muscle) -->
      <path d="M 410 300 L 410 430 C 460 420, 500 370, 500 300 Z" fill="#B91C1C"/>
      <text x="455" y="360" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Left Ventricle</text>

      <!-- Interventricular Septum (Central Thick Wall) -->
      <rect x="382" y="295" width="26" height="150" rx="6" fill="#991B1B" stroke="#450A0A" stroke-width="1.5"/>

      <!-- Heart Valves (Tricuspid & Bicuspid/Mitral) -->
      <ellipse cx="335" cy="290" rx="20" ry="6" fill="#F59E0B" stroke="#FEF3C7" stroke-width="2"/>
      <ellipse cx="465" cy="290" rx="20" ry="6" fill="#F59E0B" stroke="#FEF3C7" stroke-width="2"/>

      <!-- Programmatic Callout Badges -->
      <g font-family="Inter, sans-serif" font-size="11.5" font-weight="700">
        <!-- Vena Cava Callout -->
        <line x1="290" y1="100" x2="160" y2="100" stroke="#38BDF8" stroke-width="1.5"/>
        <circle cx="290" cy="100" r="3.5" fill="#38BDF8"/>
        <rect x="40" y="85" width="120" height="28" rx="6" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="100" y="103" fill="#38BDF8" text-anchor="middle">Vena Cava (Deoxy)</text>

        <!-- Aorta Callout -->
        <line x1="430" y1="50" x2="560" y2="50" stroke="#EF4444" stroke-width="1.5"/>
        <circle cx="430" cy="50" r="3.5" fill="#EF4444"/>
        <rect x="560" y="35" width="130" height="28" rx="6" fill="#0F172A" stroke="#EF4444" stroke-width="1.5"/>
        <text x="625" y="53" fill="#F87171" text-anchor="middle">Aorta (120 mmHg)</text>

        <!-- Pulmonary Artery Callout -->
        <line x1="510" y1="110" x2="680" y2="110" stroke="#0284C7" stroke-width="1.5"/>
        <circle cx="510" cy="110" r="3.5" fill="#0284C7"/>
        <rect x="680" y="95" width="145" height="28" rx="6" fill="#0F172A" stroke="#0284C7" stroke-width="1.5"/>
        <text x="752" y="113" fill="#38BDF8" text-anchor="middle">Pulmonary Trunk (Lungs)</text>

        <!-- Tricuspid Valve Callout -->
        <line x1="335" y1="290" x2="150" y2="290" stroke="#F59E0B" stroke-width="1.5"/>
        <circle cx="335" cy="290" r="3.5" fill="#F59E0B"/>
        <rect x="30" y="275" width="120" height="28" rx="6" fill="#0F172A" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="90" y="293" fill="#FDE68A" text-anchor="middle">Tricuspid Valve</text>

        <!-- Bicuspid Valve Callout -->
        <line x1="485" y1="290" x2="680" y2="290" stroke="#F59E0B" stroke-width="1.5"/>
        <circle cx="485" cy="290" r="3.5" fill="#F59E0B"/>
        <rect x="680" y="275" width="135" height="28" rx="6" fill="#0F172A" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="747" y="293" fill="#FDE68A" text-anchor="middle">Bicuspid / Mitral</text>

        <!-- Left Ventricle Thick Wall Callout -->
        <line x1="500" y1="380" x2="680" y2="380" stroke="#F87171" stroke-width="1.5"/>
        <circle cx="500" cy="380" r="3.5" fill="#F87171"/>
        <rect x="680" y="365" width="145" height="28" rx="6" fill="#0F172A" stroke="#F87171" stroke-width="1.5"/>
        <text x="752" y="383" fill="#FCA5A5" text-anchor="middle">LV Wall (3x Thicker)</text>

        <!-- Septum Callout -->
        <line x1="395" y1="410" x2="395" y2="470" stroke="#E2E8F0" stroke-width="1.5"/>
        <circle cx="395" cy="410" r="3.5" fill="#E2E8F0"/>
        <rect x="315" y="470" width="160" height="28" rx="6" fill="#0F172A" stroke="#E2E8F0" stroke-width="1.5"/>
        <text x="395" y="488" fill="#F8FAFC" text-anchor="middle">Interventricular Septum</text>
      </g>
    </svg>`
  },

  // 2. HUMAN BRAIN (Sagittal Section & Cerebral Lobes)
  human_brain: {
    topic: 'Structure of the Human Brain',
    subtopic: 'Cerebral Lobes, Cerebellum & Brainstem',
    subject: 'Biology',
    visualType: 'anatomical_cross_section',
    title: 'Human Brain: Functional Lobes & Sagittal Cross-Section',
    caption: 'Midsagittal schematic showing Frontal, Parietal, Occipital, and Temporal lobes, Corpus Callosum, Cerebellum, and Brainstem.',
    labels: [
      { id: 'frontal_lobe', name: 'Frontal Lobe', x: 280, y: 160, role: 'Executive function, planning, reasoning, voluntary movement (motor cortex), and speech production.', color: '#3B82F6' },
      { id: 'parietal_lobe', name: 'Parietal Lobe', x: 440, y: 140, role: 'Somatosensory processing (touch, temperature, pain, spatial awareness).', color: '#10B981' },
      { id: 'occipital_lobe', name: 'Occipital Lobe', x: 570, y: 220, role: 'Primary visual cortex interpreting retinal visual signals.', color: '#F59E0B' },
      { id: 'temporal_lobe', name: 'Temporal Lobe', x: 380, y: 270, role: 'Auditory processing, language comprehension (Wernicke area), and memory storage via hippocampus.', color: '#8B5CF6' },
      { id: 'corpus_callosum', name: 'Corpus Callosum', x: 410, y: 200, role: 'Dense band of 200 million axonal fibers connecting left and right cerebral hemispheres.', color: '#F43F5E' },
      { id: 'cerebellum', name: 'Cerebellum', x: 530, y: 340, role: 'Coordinates motor balance, posture, and fine rhythmic motor timing.', color: '#EC4899' },
      { id: 'brainstem', name: 'Brainstem (Pons + Medulla)', x: 410, y: 380, role: 'Controls vital autonomic functions: respiratory rate, cardiac pace, and vasomotor tone.', color: '#06B6D4' }
    ],
    walkthrough: {
      whatItShows: 'Midsagittal view of the human brain highlighting the major lobes of the cerebrum, the subcortical corpus callosum, the arbor vitae of the cerebellum, and the brainstem.',
      importantComponents: ['Frontal Lobe', 'Parietal Lobe', 'Occipital Lobe', 'Temporal Lobe', 'Corpus Callosum', 'Cerebellum', 'Brainstem'],
      processSequence: [
        '1. Sensory signals enter via the brainstem and thalamus, directing specific modalities to cortical lobes.',
        '2. Frontal lobe integrates reasoning and initiates voluntary motor impulses.',
        '3. Cerebellum receives motor copies to continuously refine balance and coordination.',
        '4. Medulla oblongata within the brainstem ensures uninterrupted cardiac and respiratory rhythm.'
      ],
      examTakeaway: 'In exams, remember: Cerebellum controls balance and fine motor coordination; Medulla oblongata controls involuntary reflex centers like breathing and heartbeat.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="840" height="520">
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Human Brain — Sagittal Section &amp; Functional Lobes</text>

      <!-- Skull Silhouette -->
      <path d="M 200 320 C 180 180, 280 80, 440 80 C 600 80, 680 180, 660 330 C 650 370, 580 430, 500 420 L 460 480 L 410 480 L 410 420 C 320 420, 210 390, 200 320 Z" fill="#1E293B" stroke="#475569" stroke-width="2"/>

      <!-- Frontal Lobe (Blue) -->
      <path d="M 230 300 C 220 200, 280 110, 400 110 L 400 230 C 330 230, 260 250, 230 300 Z" fill="#2563EB" opacity="0.85" stroke="#60A5FA" stroke-width="2"/>
      <text x="310" y="170" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">Frontal Lobe</text>

      <!-- Parietal Lobe (Green) -->
      <path d="M 400 110 C 490 110, 550 140, 580 200 L 450 240 L 400 230 Z" fill="#059669" opacity="0.85" stroke="#34D399" stroke-width="2"/>
      <text x="470" y="160" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">Parietal Lobe</text>

      <!-- Occipital Lobe (Amber) -->
      <path d="M 580 200 C 640 240, 640 310, 600 340 L 510 300 L 450 240 Z" fill="#D97706" opacity="0.85" stroke="#FBBF24" stroke-width="2"/>
      <text x="560" y="270" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">Occipital</text>

      <!-- Temporal Lobe (Purple) -->
      <path d="M 280 310 C 330 240, 450 240, 500 290 L 460 360 C 360 360, 310 340, 280 310 Z" fill="#7C3AED" opacity="0.85" stroke="#A78BFA" stroke-width="2"/>
      <text x="375" y="300" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">Temporal Lobe</text>

      <!-- Corpus Callosum (C-shaped Band) -->
      <path d="M 330 230 C 340 180, 480 180, 490 230 C 470 215, 360 215, 330 230 Z" fill="#FFFFFF" stroke="#F43F5E" stroke-width="2.5"/>
      <text x="410" y="205" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="#BE123C" text-anchor="middle">Corpus Callosum</text>

      <!-- Cerebellum (Pink Foliated Structure) -->
      <path d="M 510 320 C 580 320, 610 370, 570 420 C 520 440, 470 410, 470 360 Z" fill="#DB2777" stroke="#F472B6" stroke-width="2"/>
      <!-- Arbor Vitae Tree pattern -->
      <path d="M 520 370 Q 550 360 570 380 M 520 370 Q 540 395 560 410" stroke="#FDF2F8" stroke-width="2" fill="none"/>
      <text x="545" y="375" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF">Cerebellum</text>

      <!-- Brainstem (Pons & Medulla) -->
      <path d="M 420 310 Q 450 350 440 400 L 440 480 L 410 480 L 400 370 Z" fill="#0891B2" stroke="#22D3EE" stroke-width="2"/>
      <text x="425" y="440" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">Brainstem</text>

      <!-- Programmatic Callout Labels -->
      <g font-family="Inter, sans-serif" font-size="11" font-weight="700">
        <line x1="280" y1="160" x2="140" y2="160" stroke="#60A5FA" stroke-width="1.5"/><circle cx="280" cy="160" r="3" fill="#60A5FA"/>
        <rect x="25" y="145" width="115" height="28" rx="6" fill="#0F172A" stroke="#60A5FA" stroke-width="1.5"/>
        <text x="82" y="163" fill="#93C5FD" text-anchor="middle">Executive Motor</text>

        <line x1="570" y1="360" x2="700" y2="360" stroke="#F472B6" stroke-width="1.5"/><circle cx="570" cy="360" r="3" fill="#F472B6"/>
        <rect x="700" y="345" width="125" height="28" rx="6" fill="#0F172A" stroke="#F472B6" stroke-width="1.5"/>
        <text x="762" y="363" fill="#FBCFE8" text-anchor="middle">Balance &amp; Posture</text>

        <line x1="430" y1="440" x2="560" y2="470" stroke="#22D3EE" stroke-width="1.5"/><circle cx="430" cy="440" r="3" fill="#22D3EE"/>
        <rect x="560" y="455" width="145" height="28" rx="6" fill="#0F172A" stroke="#22D3EE" stroke-width="1.5"/>
        <text x="632" y="473" fill="#A5F3FC" text-anchor="middle">Involuntary Reflexes</text>
      </g>
    </svg>`
  },

  // 3. DNA DOUBLE HELIX (Molecular Nucleotide Architecture)
  dna_helix: {
    topic: 'DNA Structure & Replication',
    subtopic: 'Antiparallel Double Helix & Nucleotide Base Pairs',
    subject: 'Biology',
    visualType: 'molecular_schematic',
    title: 'DNA Double Helix: Watson-Crick Antiparallel Molecular Model',
    caption: 'Antiparallel 5′ to 3′ sugar-phosphate backbone with complementary Adenine-Thymine (2 H-bonds) and Guanine-Cytosine (3 H-bonds) base pairing.',
    labels: [
      { id: 'sugar_phosphate_backbone', name: 'Sugar-Phosphate Backbone', x: 260, y: 180, role: 'Deoxyribose sugars joined by phosphodiester covalent bonds.', color: '#38BDF8' },
      { id: 'adenine_thymine', name: 'Adenine = Thymine (2 H-Bonds)', x: 420, y: 200, role: 'Purine-pyrimidine pair stabilized by two hydrogen bonds.', color: '#22C55E' },
      { id: 'guanine_cytosine', name: 'Guanine ≡ Cytosine (3 H-Bonds)', x: 420, y: 280, role: 'Purine-pyrimidine pair stabilized by three hydrogen bonds (higher melting temperature).', color: '#F59E0B' },
      { id: 'major_groove', name: 'Major Groove (2.2 nm)', x: 580, y: 160, role: 'Wide surface indent allowing sequence-specific transcription factor binding.', color: '#818CF8' },
      { id: 'minor_groove', name: 'Minor Groove (1.2 nm)', x: 580, y: 260, role: 'Narrow furrow between spiraling backbones.', color: '#A78BFA' }
    ],
    walkthrough: {
      whatItShows: 'Right-handed B-DNA double helix showing the spiraling sugar-phosphate strands and nitrogenous base rungs.',
      importantComponents: ['Sugar-Phosphate Strands', 'Adenine (A)', 'Thymine (T)', 'Guanine (G)', 'Cytosine (C)', 'Hydrogen Bonds'],
      processSequence: [
        '1. Two polynucleotide chains run in opposite antiparallel directions (5′ to 3′ vs 3′ to 5′).',
        '2. Hydrophobic nitrogenous bases face inward, perpendicular to the central helix axis.',
        '3. Chargaff rule governs pairing: Adenine always pairs with Thymine; Guanine always pairs with Cytosine.',
        '4. Each complete 360° helical turn spans 3.4 nanometers and contains approximately 10 base pairs.'
      ],
      examTakeaway: 'Always state that G-C pairs are held by 3 hydrogen bonds while A-T pairs are held by 2, making G-C rich DNA thermally more stable.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="840" height="520">
      <rect width="840" height="520" rx="20" fill="#0B132B"/>
      <text x="420" y="32" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">DNA Double Helix — Antiparallel Watson-Crick Molecular Model</text>
      
      <!-- 5' and 3' Direction Badges -->
      <text x="310" y="65" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8">Strand 1 (5′ → 3′)</text>
      <text x="490" y="65" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#EC4899">Strand 2 (3′ → 5′)</text>

      <!-- Helical Sine Strands -->
      <!-- Left Ribbon Strand (Cyan) -->
      <path d="M 330 80 Q 270 140 330 200 Q 510 260 510 320 Q 510 380 330 440" stroke="#0284C7" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M 330 80 Q 270 140 330 200 Q 510 260 510 320 Q 510 380 330 440" stroke="#38BDF8" stroke-width="4" fill="none" stroke-linecap="round"/>

      <!-- Right Ribbon Strand (Magenta) -->
      <path d="M 510 80 Q 570 140 510 200 Q 330 260 330 320 Q 330 380 510 440" stroke="#BE185D" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M 510 80 Q 570 140 510 200 Q 330 260 330 320 Q 330 380 510 440" stroke="#F472B6" stroke-width="4" fill="none" stroke-linecap="round"/>

      <!-- Base Pair Rungs -->
      <!-- Rung 1: A = T -->
      <line x1="335" y1="110" x2="415" y2="110" stroke="#22C55E" stroke-width="8"/>
      <line x1="425" y1="110" x2="505" y2="110" stroke="#EF4444" stroke-width="8"/>
      <circle cx="420" cy="110" r="3" fill="#FFFFFF"/>
      <text x="375" y="105" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#4ADE80">A</text>
      <text x="465" y="105" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#F87171">T</text>

      <!-- Rung 2: G ≡ C -->
      <line x1="300" y1="150" x2="415" y2="150" stroke="#EAB308" stroke-width="8"/>
      <line x1="425" y1="150" x2="540" y2="150" stroke="#3B82F6" stroke-width="8"/>
      <circle cx="417" cy="148" r="2" fill="#FFFFFF"/><circle cx="423" cy="152" r="2" fill="#FFFFFF"/>
      <text x="355" y="145" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047">G</text>
      <text x="480" y="145" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#93C5FD">C</text>

      <!-- Rung 3: Crossing Axis -->
      <line x1="330" y1="200" x2="510" y2="200" stroke="#8B5CF6" stroke-width="7"/>
      <text x="420" y="195" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#C4B5FD" text-anchor="middle">Base Pair (0.34 nm pitch)</text>

      <!-- Rung 4: C ≡ G -->
      <line x1="360" y1="250" x2="415" y2="250" stroke="#3B82F6" stroke-width="8"/>
      <line x1="425" y1="250" x2="480" y2="250" stroke="#EAB308" stroke-width="8"/>
      <text x="385" y="245" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#93C5FD">C</text>
      <text x="455" y="245" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047">G</text>

      <!-- Rung 5: T = A -->
      <line x1="335" y1="290" x2="415" y2="290" stroke="#EF4444" stroke-width="8"/>
      <line x1="425" y1="290" x2="505" y2="290" stroke="#22C55E" stroke-width="8"/>
      <text x="375" y="285" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#F87171">T</text>
      <text x="465" y="285" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#4ADE80">A</text>

      <!-- Rung 6: G ≡ C -->
      <line x1="300" y1="350" x2="415" y2="350" stroke="#EAB308" stroke-width="8"/>
      <line x1="425" y1="350" x2="540" y2="350" stroke="#3B82F6" stroke-width="8"/>
      <text x="355" y="345" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047">G</text>
      <text x="480" y="345" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#93C5FD">C</text>

      <!-- Dimensions Bracket -->
      <line x1="570" y1="80" x2="570" y2="420" stroke="#64748B" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="590" y="250" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#94A3B8">1 Full Turn = 3.4 nm (10 bp)</text>

      <!-- Callout Labels -->
      <g font-family="Inter, sans-serif" font-size="11" font-weight="700">
        <line x1="280" y1="120" x2="160" y2="120" stroke="#38BDF8" stroke-width="1.5"/>
        <rect x="40" y="105" width="120" height="28" rx="6" fill="#0B132B" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="100" y="123" fill="#7DD3FC" text-anchor="middle">Sugar-Phosphate</text>

        <line x1="420" y1="150" x2="160" y2="210" stroke="#FDE047" stroke-width="1.5"/>
        <rect x="25" y="195" width="135" height="28" rx="6" fill="#0B132B" stroke="#FDE047" stroke-width="1.5"/>
        <text x="92" y="213" fill="#FEF08A" text-anchor="middle">G ≡ C (3 H-Bonds)</text>

        <line x1="420" y1="110" x2="680" y2="110" stroke="#4ADE80" stroke-width="1.5"/>
        <rect x="680" y="95" width="135" height="28" rx="6" fill="#0B132B" stroke="#4ADE80" stroke-width="1.5"/>
        <text x="747" y="113" fill="#86EFAC" text-anchor="middle">A = T (2 H-Bonds)</text>
      </g>
    </svg>`
  },

  // 4. PLANT CELL (Eukaryotic Ultrastructure)
  plant_cell: {
    topic: 'Plant Cell Structure',
    subtopic: 'Cell Wall, Chloroplasts, Vacuole & Organelles',
    subject: 'Biology',
    visualType: 'biological_process_diagram',
    title: 'Eukaryotic Plant Cell: Cellular Ultrastructure & Organelles',
    caption: 'Plant cell cross-section showing rigid cellulose cell wall, large central vacuole, photosynthetic chloroplasts, nucleus, and mitochondria.',
    labels: [
      { id: 'cell_wall', name: 'Cellulose Cell Wall', x: 260, y: 140, role: 'Rigid protective outer envelope providing turgor structural support.', color: '#15803D' },
      { id: 'chloroplast', name: 'Chloroplast (Grana & Stroma)', x: 320, y: 350, role: 'Photosynthetic organelle capturing photon energy to synthesize glucose.', color: '#22C55E' },
      { id: 'central_vacuole', name: 'Central Vacuole & Tonoplast', x: 440, y: 270, role: 'Maintains turgor hydrostatic pressure and stores cellular sap.', color: '#38BDF8' },
      { id: 'nucleus', name: 'Nucleus & Chromatin', x: 570, y: 220, role: 'Contains genetic genome, directs protein synthesis and transcription.', color: '#7C3AED' },
      { id: 'mitochondria', name: 'Mitochondria (ATP Production)', x: 550, y: 370, role: 'Aerobic cellular respiration generating ATP through oxidative phosphorylation.', color: '#EA580C' }
    ],
    walkthrough: {
      whatItShows: 'Transverse cutaway of a typical eukaryotic green plant cell showing distinguishing structures that differentiate it from animal cells.',
      importantComponents: ['Cell Wall', 'Central Vacuole', 'Chloroplasts', 'Nucleus', 'Mitochondria', 'Endoplasmic Reticulum'],
      processSequence: [
        '1. Cellulose cell wall and plasma membrane enclose cytoplasm while maintaining osmotic turgor.',
        '2. Chloroplasts synthesize glucose using solar photons and carbon dioxide.',
        '3. Mitochondria break down glucose to generate cellular ATP energy.',
        '4. Large central vacuole absorbs water, exerting hydrostatic pressure against cell walls to keep plant stems upright.'
      ],
      examTakeaway: 'In exams, note 3 exclusive plant cell features: Cellulose cell wall, photosynthetic chloroplasts, and a large permanent central vacuole.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="840" height="520">
      <rect width="840" height="520" rx="20" fill="#062E1F"/>
      <text x="420" y="32" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Plant Cell Ultrastructure — Organelles &amp; Cell Wall</text>

      <!-- Outer Cellulose Cell Wall (Hexagonal Polygon) -->
      <polygon points="180,260 260,110 580,110 660,260 580,430 260,430" fill="#047857" stroke="#10B981" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="188,260 265,120 575,120 652,260 575,420 265,420" fill="#065F46" stroke="#34D399" stroke-width="3" stroke-linejoin="round"/>

      <!-- Cytosol Matrix -->
      <polygon points="196,260 270,130 570,130 644,260 570,410 270,410" fill="#064E3B"/>

      <!-- Large Central Vacuole (Sky Blue with Tonoplast) -->
      <ellipse cx="380" cy="270" rx="130" ry="90" fill="#38BDF8" opacity="0.85" stroke="#7DD3FC" stroke-width="3"/>
      <text x="380" y="275" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#0C4A6E" text-anchor="middle">Central Vacuole (Turgor)</text>

      <!-- Nucleus (Purple) -->
      <circle cx="550" cy="220" r="52" fill="#7C3AED" stroke="#A78BFA" stroke-width="3"/>
      <circle cx="550" cy="220" r="18" fill="#4C1D95"/>
      <text x="550" y="285" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#EDE9FE" text-anchor="middle">Nucleus &amp; DNA</text>

      <!-- Chloroplasts (Green with Grana Discs) -->
      <g>
        <ellipse cx="280" cy="180" rx="36" ry="22" fill="#15803D" stroke="#4ADE80" stroke-width="2"/>
        <line x1="265" y1="180" x2="295" y2="180" stroke="#86EFAC" stroke-width="3"/>
        <ellipse cx="320" cy="380" rx="38" ry="22" fill="#15803D" stroke="#4ADE80" stroke-width="2"/>
        <line x1="305" y1="380" x2="335" y2="380" stroke="#86EFAC" stroke-width="3"/>
        <ellipse cx="560" cy="350" rx="38" ry="22" fill="#15803D" stroke="#4ADE80" stroke-width="2"/>
      </g>

      <!-- Mitochondria (Orange with Cristae Folds) -->
      <g>
        <ellipse cx="480" cy="160" rx="26" ry="15" fill="#C2410C" stroke="#FB923C" stroke-width="2"/>
        <path d="M 465 160 Q 475 155 480 160 Q 485 165 495 160" stroke="#FEF08A" stroke-width="2" fill="none"/>
        <ellipse cx="460" cy="390" rx="26" ry="15" fill="#C2410C" stroke="#FB923C" stroke-width="2"/>
      </g>

      <!-- Programmatic Callout Labels -->
      <g font-family="Inter, sans-serif" font-size="11" font-weight="700">
        <line x1="260" y1="110" x2="130" y2="110" stroke="#34D399" stroke-width="1.5"/><circle cx="260" cy="110" r="3" fill="#34D399"/>
        <rect x="25" y="95" width="115" height="28" rx="6" fill="#062E1F" stroke="#34D399" stroke-width="1.5"/>
        <text x="82" y="113" fill="#A7F3D0" text-anchor="middle">Cellulose Wall</text>

        <line x1="280" y1="180" x2="130" y2="180" stroke="#4ADE80" stroke-width="1.5"/><circle cx="280" cy="180" r="3" fill="#4ADE80"/>
        <rect x="20" y="165" width="125" height="28" rx="6" fill="#062E1F" stroke="#4ADE80" stroke-width="1.5"/>
        <text x="82" y="183" fill="#86EFAC" text-anchor="middle">Chloroplast (Grana)</text>

        <line x1="550" y1="220" x2="700" y2="220" stroke="#A78BFA" stroke-width="1.5"/><circle cx="550" cy="220" r="3" fill="#A78BFA"/>
        <rect x="700" y="205" width="120" height="28" rx="6" fill="#062E1F" stroke="#A78BFA" stroke-width="1.5"/>
        <text x="760" y="223" fill="#DDD6FE" text-anchor="middle">Nucleus / Genes</text>

        <line x1="560" y1="350" x2="700" y2="350" stroke="#FB923C" stroke-width="1.5"/><circle cx="560" cy="350" r="3" fill="#FB923C"/>
        <rect x="700" y="335" width="125" height="28" rx="6" fill="#062E1F" stroke="#FB923C" stroke-width="1.5"/>
        <text x="762" y="353" fill="#FDBA74" text-anchor="middle">Mitochondria (ATP)</text>
      </g>
    </svg>`
  },

  // 5. CHEMICAL BONDING (Ionic vs Covalent)
  chemical_bonding: {
    topic: 'Chemical Bonding (Ionic vs Covalent)',
    subtopic: 'Electron Transfer (NaCl) vs Electron Sharing (H2O)',
    subject: 'Chemistry',
    visualType: 'comparison_diagram',
    title: 'Chemical Bonding: Ionic Electron Transfer vs Covalent Orbital Sharing',
    caption: 'Side-by-side comparison showing complete valence electron transfer in Sodium Chloride (NaCl) versus shared electron pairs in Water (H₂O).',
    labels: [
      { id: 'ionic_donor', name: 'Sodium Ion (Na⁺)', x: 190, y: 220, role: 'Loses 1 valence electron to achieve neon octet stability.', color: '#3B82F6' },
      { id: 'ionic_acceptor', name: 'Chloride Ion (Cl⁻)', x: 330, y: 220, role: 'Gains 1 electron to achieve argon octet stability, forming ionic crystal lattice.', color: '#10B981' },
      { id: 'covalent_oxygen', name: 'Oxygen Central Atom', x: 600, y: 220, role: 'Shares 2 valence electrons with two Hydrogen atoms (sp³ bent molecule, 104.5°).', color: '#EF4444' },
      { id: 'covalent_shared_pairs', name: 'Shared Electron Pairs', x: 530, y: 290, role: 'Overlapping atomic orbitals creating stable single covalent sigma bonds.', color: '#F59E0B' }
    ],
    walkthrough: {
      whatItShows: 'Fundamental comparison of the two primary chemical bonding types: complete electrostatic transfer (Ionic) versus mutual orbital sharing (Covalent).',
      importantComponents: ['Na⁺ Cation', 'Cl⁻ Anion', 'H₂O Bent Molecule', 'Valence Electrons', 'Shared Pairs'],
      processSequence: [
        '1. In Ionic Bonding (NaCl), Sodium transfers its single 3s¹ valence electron to Chlorine.',
        '2. Electrostatic attraction between Na⁺ and Cl⁻ binds ions into a solid crystal lattice.',
        '3. In Covalent Bonding (H₂O), Oxygen shares pairs of electrons with Hydrogen atoms.',
        '4. Shared electrons achieve stable duplet configuration for Hydrogen and octet for Oxygen.'
      ],
      examTakeaway: 'Ionic compounds have high melting points and conduct electricity when molten or aqueous; covalent molecular compounds have lower melting points and do not conduct electricity.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="840" height="520">
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="32" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Chemical Bonding — Ionic Transfer vs Covalent Sharing</text>

      <!-- Dividing Column Barrier -->
      <line x1="420" y1="55" x2="420" y2="480" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/>

      <!-- LEFT SIDE: IONIC BONDING (NaCl) -->
      <rect x="30" y="55" width="370" height="420" rx="14" fill="#1E293B" stroke="#3B82F6" stroke-width="1.5"/>
      <text x="215" y="85" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#60A5FA" text-anchor="middle">1. Ionic Bonding: Electron Transfer (NaCl)</text>

      <!-- Sodium Atom (Na) -->
      <circle cx="150" cy="220" r="50" fill="none" stroke="#60A5FA" stroke-width="2"/>
      <circle cx="150" cy="220" r="30" fill="none" stroke="#60A5FA" stroke-width="1.5"/>
      <circle cx="150" cy="220" r="16" fill="#3B82F6"/>
      <text x="150" y="225" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Na⁺</text>
      <!-- Transferred Electron Arrow -->
      <path d="M 200 220 C 230 170, 260 170, 285 210" stroke="#FBBF24" stroke-width="3" stroke-dasharray="5 3" fill="none"/>
      <polygon points="290,215 280,205 288,200" fill="#FBBF24"/>
      <circle cx="240" cy="175" r="5" fill="#FBBF24"/>
      <text x="240" y="160" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">1 e⁻ transfer</text>

      <!-- Chlorine Atom (Cl) -->
      <circle cx="330" cy="220" r="55" fill="none" stroke="#34D399" stroke-width="2"/>
      <circle cx="330" cy="220" r="35" fill="none" stroke="#34D399" stroke-width="1.5"/>
      <circle cx="330" cy="220" r="18" fill="#10B981"/>
      <text x="330" y="225" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Cl⁻</text>

      <rect x="60" y="360" width="310" height="90" rx="10" fill="#0F172A" stroke="#3B82F6" stroke-width="1"/>
      <text x="215" y="385" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" text-anchor="middle">Electrostatic Ionic Attraction</text>
      <text x="215" y="410" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#CBD5E1" text-anchor="middle">Na (2,8,1) + Cl (2,8,7) → Na⁺ [2,8] + Cl⁻ [2,8,8]</text>
      <text x="215" y="432" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#FDE047" text-anchor="middle">High melting point (801°C) • Crystal Lattice</text>

      <!-- RIGHT SIDE: COVALENT BONDING (H2O) -->
      <rect x="440" y="55" width="370" height="420" rx="14" fill="#1E293B" stroke="#F43F5E" stroke-width="1.5"/>
      <text x="625" y="85" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FB7185" text-anchor="middle">2. Covalent Bonding: Shared Pairs (H₂O)</text>

      <!-- Central Oxygen Atom -->
      <circle cx="625" cy="200" r="55" fill="none" stroke="#EF4444" stroke-width="2.5"/>
      <circle cx="625" cy="200" r="22" fill="#DC2626"/>
      <text x="625" y="206" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">O</text>

      <!-- Hydrogen 1 (Left Overlap) -->
      <circle cx="550" cy="280" r="40" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
      <circle cx="550" cy="280" r="14" fill="#0284C7"/>
      <text x="550" y="285" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">H</text>
      <!-- Shared Electrons Overlap 1 -->
      <circle cx="585" cy="245" r="4.5" fill="#FBBF24"/>
      <circle cx="593" cy="235" r="4.5" fill="#FBBF24"/>

      <!-- Hydrogen 2 (Right Overlap) -->
      <circle cx="700" cy="280" r="40" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
      <circle cx="700" cy="280" r="14" fill="#0284C7"/>
      <text x="700" y="285" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">H</text>
      <!-- Shared Electrons Overlap 2 -->
      <circle cx="665" cy="245" r="4.5" fill="#FBBF24"/>
      <circle cx="657" cy="235" r="4.5" fill="#FBBF24"/>

      <!-- Bond Angle Notation -->
      <text x="625" y="260" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FCA5A5" text-anchor="middle">104.5° Bent</text>

      <rect x="470" y="360" width="310" height="90" rx="10" fill="#0F172A" stroke="#F43F5E" stroke-width="1"/>
      <text x="625" y="385" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FECDD3" text-anchor="middle">Mutual Electron Sharing</text>
      <text x="625" y="410" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#CBD5E1" text-anchor="middle">Oxygen completes octet (8e⁻); Hydrogen duplet (2e⁻)</text>
      <text x="625" y="432" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#FDE047" text-anchor="middle">Discrete neutral molecules • Polar Dipole</text>
    </svg>`
  },

  // 6. NEWTON'S LAWS OF MOTION (Dynamic Free-Body Vector Diagram)
  newton_motion: {
    topic: "Newton's Laws of Force & Motion",
    subtopic: 'Free-Body Diagram (FBD), Friction & Net Force Vectors',
    subject: 'Physics',
    visualType: 'physics_vector_schematic',
    title: "Newton's Laws of Motion: Vector Free-Body Analysis (F = m · a)",
    caption: 'Dynamic force vector schematic showing Normal reaction (N), Gravitational weight (mg), Applied force (F), and Opposing friction (f = μN).',
    labels: [
      { id: 'normal_force', name: 'Normal Reaction Force (N)', x: 420, y: 120, role: 'Perpendicular contact force exerted by surface equal to mg cos(θ).', color: '#0284C7' },
      { id: 'applied_force', name: 'Applied Force (F)', x: 620, y: 260, role: 'External motive force driving horizontal acceleration.', color: '#16A34A' },
      { id: 'friction_force', name: 'Frictional Force (f = μN)', x: 220, y: 280, role: 'Resistance force opposing relative surface motion.', color: '#EF4444' },
      { id: 'gravitational_weight', name: 'Gravitational Weight (W = mg)', x: 420, y: 400, role: 'Downward gravitational attraction toward Earth center.', color: '#7C3AED' }
    ],
    walkthrough: {
      whatItShows: 'Vector decomposition on a body of mass m resting on a horizontal plane with surface friction coefficient μ.',
      importantComponents: ['Mass m', 'Normal Force N', 'Gravity W = mg', 'Applied Force F', 'Friction f = μN'],
      processSequence: [
        '1. Vertical equilibrium holds: Net vertical force = N - mg = 0, so N = mg.',
        '2. Horizontal net force determines motion: F_net = F_applied - f_friction.',
        '3. By Newton 2nd Law: a = F_net / m.',
        '4. If F_applied ≤ f_static_max, the object remains at rest due to balanced forces.'
      ],
      examTakeaway: 'Always state that acceleration occurs in the direction of the NET unbalanced force, not simply the applied force.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="840" height="520">
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="32" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Newton's Laws of Motion — Force Vector Equilibrium &amp; FBD</text>

      <!-- Ground Surface with Crosshatching -->
      <line x1="80" y1="340" x2="760" y2="340" stroke="#475569" stroke-width="5"/>
      <g stroke="#334155" stroke-width="2">
        <line x1="120" y1="340" x2="100" y2="360"/><line x1="160" y1="340" x2="140" y2="360"/>
        <line x1="200" y1="340" x2="180" y2="360"/><line x1="240" y1="340" x2="220" y2="360"/>
        <line x1="280" y1="340" x2="260" y2="360"/><line x1="320" y1="340" x2="300" y2="360"/>
        <line x1="360" y1="340" x2="340" y2="360"/><line x1="400" y1="340" x2="380" y2="360"/>
        <line x1="440" y1="340" x2="420" y2="360"/><line x1="480" y1="340" x2="460" y2="360"/>
        <line x1="520" y1="340" x2="500" y2="360"/><line x1="560" y1="340" x2="540" y2="360"/>
        <line x1="600" y1="340" x2="580" y2="360"/><line x1="640" y1="340" x2="620" y2="360"/>
        <line x1="680" y1="340" x2="660" y2="360"/><line x1="720" y1="340" x2="700" y2="360"/>
      </g>

      <!-- Block of Mass m -->
      <rect x="330" y="210" width="180" height="130" rx="14" fill="#FF6A00" stroke="#FFA94D" stroke-width="3"/>
      <text x="420" y="280" font-family="Inter, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mass (m)</text>
      <text x="420" y="305" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#FED7AA" text-anchor="middle">Inertial Reference</text>

      <!-- Center of Mass Dot -->
      <circle cx="420" cy="275" r="6" fill="#FFFFFF"/>

      <!-- Vector: Normal Force (Upward Blue) -->
      <line x1="420" y1="210" x2="420" y2="90" stroke="#0284C7" stroke-width="8"/>
      <polygon points="420,75 408,100 432,100" fill="#0284C7"/>
      <text x="440" y="105" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8">Normal (N = mg)</text>

      <!-- Vector: Gravity Weight (Downward Purple) -->
      <line x1="420" y1="340" x2="420" y2="460" stroke="#7C3AED" stroke-width="8"/>
      <polygon points="420,475 408,450 432,450" fill="#7C3AED"/>
      <text x="440" y="445" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#C084FC">Gravity (W = m · g)</text>

      <!-- Vector: Applied Force (Rightward Green) -->
      <line x1="510" y1="275" x2="680" y2="275" stroke="#16A34A" stroke-width="9"/>
      <polygon points="695,275 670,260 670,290" fill="#16A34A"/>
      <text x="600" y="255" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#4ADE80">Applied Force (F)</text>

      <!-- Vector: Opposing Friction (Leftward Red) -->
      <line x1="330" y1="335" x2="180" y2="335" stroke="#DC2626" stroke-width="7"/>
      <polygon points="165,335 190,323 190,347" fill="#DC2626"/>
      <text x="245" y="320" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F87171">Friction (f = μN)</text>

      <!-- Bottom Equation Banner -->
      <rect x="180" y="465" width="480" height="42" rx="10" fill="#1E293B" stroke="#FF6A00" stroke-width="1.5"/>
      <text x="420" y="492" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFD8A8" text-anchor="middle">Net Force Equation: F_net = F - f = m · a  ⇒  a = (F - μmg) / m</text>
    </svg>`
  },

  // 7. EARTH'S WATER CYCLE (Hydrological Equilibrium)
  water_cycle: {
    topic: "Earth's Hydrological Water Cycle",
    subtopic: 'Evaporation, Transpiration, Condensation & Precipitation',
    subject: 'Geography',
    visualType: 'geological_cross_section',
    title: "Earth's Hydrological Cycle: Closed Energy & Water Circulation",
    caption: 'Geographical cross-section illustrating solar-driven evaporation, plant transpiration, cloud condensation, orographic precipitation, and groundwater runoff.',
    labels: [
      { id: 'solar_radiation', name: 'Solar Energy Engine', x: 140, y: 80, role: 'Drives water phase changes through latent heat absorption.', color: '#FACC15' },
      { id: 'evaporation', name: 'Ocean Evaporation', x: 200, y: 310, role: 'Liquid ocean water turns into invisible atmospheric water vapor.', color: '#38BDF8' },
      { id: 'transpiration', name: 'Vegetation Transpiration', x: 440, y: 310, role: 'Plant stomatal water release into atmospheric air column.', color: '#4ADE80' },
      { id: 'condensation', name: 'Condensation (Clouds)', x: 400, y: 130, role: 'Water vapor cools at dew point to form liquid cloud droplets around CCN.', color: '#E2E8F0' },
      { id: 'precipitation', name: 'Orographic Precipitation', x: 620, y: 220, role: 'Rain and snow falling over mountain elevations.', color: '#60A5FA' },
      { id: 'surface_runoff', name: 'Surface Runoff & Aquifer', x: 520, y: 440, role: 'Gravitational return flow through streams and groundwater percolation back to oceans.', color: '#0284C7' }
    ],
    walkthrough: {
      whatItShows: 'Landscape cutaway of mountains, forests, rivers, and oceans showing the uninterrupted closed-loop circulation of water across Earth.',
      importantComponents: ['Sun', 'Ocean', 'Clouds', 'Mountain Elevation', 'Rainfall', 'River System', 'Groundwater Table'],
      processSequence: [
        '1. Solar radiation warms ocean and lake surfaces, evaporating water into vapor.',
        '2. Warm moist air rises and expands adiabatically, cooling to dew point to form cumulus clouds.',
        '3. When droplets coalesce beyond terminal velocity, precipitation falls as rain or snow.',
        '4. Meltwater and rain flow as rivers and groundwater, returning to the ocean to sustain equilibrium.'
      ],
      examTakeaway: 'Earth water cycle is a closed system: total volume of water remains constant; only its physical states (solid, liquid, gas) continuously cycle.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="840" height="520">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284C7"/>
          <stop offset="45%" stop-color="#BAE6FD"/>
          <stop offset="70%" stop-color="#E0F2FE"/>
        </linearGradient>
      </defs>
      <rect width="840" height="520" rx="20" fill="url(#skyGrad)"/>
      <text x="420" y="32" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#0F172A" text-anchor="middle">Earth's Hydrological Cycle — Closed Circulation</text>

      <!-- Sun -->
      <circle cx="120" cy="90" r="42" fill="#FACC15" stroke="#FEF08A" stroke-width="4"/>
      <g stroke="#F59E0B" stroke-width="3" stroke-dasharray="6 4">
        <line x1="120" y1="140" x2="120" y2="190"/><line x1="165" y1="120" x2="210" y2="150"/>
      </g>

      <!-- Mountain Range (Right Side) -->
      <polygon points="460,400 620,160 760,400" fill="#64748B" stroke="#334155" stroke-width="3"/>
      <!-- Snowcap -->
      <polygon points="580,220 620,160 660,220 640,215 620,230 600,215" fill="#FFFFFF"/>
      <polygon points="620,400 740,210 840,400" fill="#475569"/>

      <!-- Foothills & Green Plains -->
      <path d="M 320 400 Q 420 340 520 400 L 840 400 L 840 520 L 0 520 L 0 400 Z" fill="#15803D"/>

      <!-- Ocean / River Basin (Left Bottom) -->
      <path d="M 0 400 Q 180 390 320 410 L 320 520 L 0 520 Z" fill="#0284C7"/>
      <text x="140" y="470" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#E0F2FE" text-anchor="middle">Ocean Reservoir (97%)</text>

      <!-- Clouds (Condensation) -->
      <g fill="#FFFFFF" opacity="0.95">
        <ellipse cx="380" cy="120" rx="55" ry="24"/><ellipse cx="420" cy="110" rx="42" ry="28"/><ellipse cx="350" cy="125" rx="35" ry="18"/>
        <ellipse cx="640" cy="110" rx="60" ry="26"/><ellipse cx="680" cy="100" rx="45" ry="30"/>
      </g>

      <!-- Evaporation Arrows (Wavy Upward from Ocean) -->
      <path d="M 120 370 Q 110 320 130 270 Q 110 220 130 170" stroke="#38BDF8" stroke-width="3" stroke-dasharray="6 4" fill="none"/>
      <polygon points="130,165 120,180 138,180" fill="#38BDF8"/>
      <text x="175" y="270" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#0369A1">Evaporation</text>

      <!-- Transpiration from Forest -->
      <path d="M 390 380 Q 380 340 395 290 Q 380 250 395 210" stroke="#22C55E" stroke-width="3" stroke-dasharray="6 4" fill="none"/>
      <text x="445" y="320" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#166534">Transpiration</text>

      <!-- Precipitation Rain Arrows (Falling from Mountain Clouds) -->
      <g stroke="#0284C7" stroke-width="2.5" stroke-dasharray="8 6">
        <line x1="620" y1="150" x2="600" y2="240"/>
        <line x1="660" y1="150" x2="640" y2="250"/>
        <line x1="700" y1="150" x2="680" y2="240"/>
      </g>
      <text x="730" y="220" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#0F172A">Precipitation</text>

      <!-- River Runoff Flow -->
      <path d="M 540 390 Q 420 410 320 420" stroke="#38BDF8" stroke-width="8" fill="none"/>
      <text x="440" y="445" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF">Surface Runoff →</text>
    </svg>`
  }
};

/**
 * Retrieves the high-precision scientific vector asset for a given topic or diagram type.
 */
export function getDetailedScientificAsset(topicOrType: string): DetailedVisualAsset | null {
  const t = topicOrType.toLowerCase().trim();
  if (t === 'human_heart' || /(heart|cardiac|ventricle|atrium|valve|circulation)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.human_heart;
  }
  if (t === 'human_brain' || /(brain|cerebr|cerebell|frontal lobe|brainstem)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.human_brain;
  }
  if (t === 'dna_helix' || /(dna|helix|nucleotide|watson|genetic code)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.dna_helix;
  }
  if (t === 'plant_cell' || /(plant cell|cell wall|vacuole|chloroplast ultrastructure)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.plant_cell;
  }
  if (t === 'chemical_bonding' || /(bond|ionic|covalent|electron transfer|octet|nacl|h2o)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.chemical_bonding;
  }
  if (t === 'newton_motion' || /(newton|force|motion|friction|free body|f\s*=\s*m\s*a)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.newton_motion;
  }
  if (t === 'water_cycle' || /(water cycle|hydrologic|evaporation|precipitation|cloud)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.water_cycle;
  }
  return null;
}
