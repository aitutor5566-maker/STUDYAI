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
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
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
      <path id="aortic_arch" d="M 370 170 C 370 70, 480 50, 480 140 L 440 150 C 440 90, 395 95, 395 170 Z" fill="url(#aortaGrad)" stroke="#F87171" stroke-width="2"/>
      <!-- Brachiocephalic, Carotid, Subclavian Branches -->
      <rect x="385" y="45" width="16" height="30" rx="5" fill="#EF4444"/>
      <rect x="415" y="40" width="16" height="35" rx="5" fill="#EF4444"/>
      <rect x="445" y="48" width="16" height="30" rx="5" fill="#EF4444"/>

      <!-- Pulmonary Trunk (Blue Left/Right bifurcation) -->
      <path id="pulmonary_trunk" d="M 350 200 C 350 140, 430 110, 450 160" stroke="url(#pulmGrad)" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M 450 135 L 510 110" stroke="url(#pulmGrad)" stroke-width="20" fill="none" stroke-linecap="round"/>

      <!-- Superior & Inferior Vena Cava -->
      <rect id="superior_vena_cava" x="290" y="70" width="34" height="110" rx="10" fill="#1E40AF" stroke="#60A5FA" stroke-width="1.5"/>
      <rect x="295" y="380" width="30" height="60" rx="8" fill="#1E40AF"/>

      <!-- Outer Cardiac Muscle Silhouette -->
      <path d="M 270 200 C 240 240, 240 340, 310 420 C 350 460, 420 480, 430 480 C 450 480, 560 450, 580 340 C 600 250, 560 190, 510 190 Z" fill="#7F1D1D" stroke="#DC2626" stroke-width="3"/>

      <!-- Right Atrium Cavity (Blue Deoxy) -->
      <path id="right_atrium" d="M 285 200 C 270 240, 290 280, 335 280 C 355 280, 360 230, 350 200 Z" fill="#2563EB" opacity="0.95"/>
      <text x="315" y="240" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Right Atrium</text>

      <!-- Right Ventricle Cavity (Blue Deoxy) -->
      <path id="right_ventricle" d="M 290 300 C 290 360, 330 420, 380 430 L 380 300 Z" fill="#1D4ED8"/>
      <text x="340" y="360" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Right Ventricle</text>

      <!-- Left Atrium Cavity (Red Oxygenated) -->
      <path id="left_atrium" d="M 460 200 C 450 240, 470 280, 520 280 C 545 280, 550 230, 530 200 Z" fill="#DC2626" opacity="0.95"/>
      <text x="500" y="240" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Left Atrium</text>

      <!-- Left Ventricle Cavity (Red Oxygenated, Thick Muscle) -->
      <path id="left_ventricle" d="M 410 300 L 410 430 C 460 420, 500 370, 500 300 Z" fill="#B91C1C"/>
      <text x="455" y="360" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Left Ventricle</text>

      <!-- Interventricular Septum (Central Thick Wall) -->
      <rect id="interventricular_septum" x="382" y="295" width="26" height="150" rx="6" fill="#991B1B" stroke="#450A0A" stroke-width="1.5"/>

      <!-- Heart Valves (Tricuspid & Bicuspid/Mitral) -->
      <ellipse id="tricuspid_valve" cx="335" cy="290" rx="20" ry="6" fill="#F59E0B" stroke="#FEF3C7" stroke-width="2"/>
      <ellipse id="bicuspid_valve" cx="465" cy="290" rx="20" ry="6" fill="#F59E0B" stroke="#FEF3C7" stroke-width="2"/>

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
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
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
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
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
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
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
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
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
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
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
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
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
  },

  // 8. PHOTOSYNTHESIS (Chloroplast Light Reactions & Calvin Cycle)
  photosynthesis: {
    topic: 'Photosynthesis',
    subtopic: 'Light-Dependent Reactions (Thylakoid) & Calvin Cycle (Stroma)',
    subject: 'Biology',
    visualType: 'biological_process_diagram',
    title: 'Photosynthesis: Chloroplast Photophosphorylation & Carbon Fixation',
    caption: 'Dual-stage biochemical pathway inside the chloroplast showing photolysis of H₂O at Thylakoid Grana producing ATP/NADPH, and CO₂ fixation via RuBisCO in the Stroma to synthesize Glucose (C₆H₁₂O₆).',
    labels: [
      { id: 'sunlight_photons', name: 'Solar Photons (hν)', x: 140, y: 80, role: 'Excites chlorophyll-a electrons in Photosystems II and I.', color: '#F59E0B' },
      { id: 'thylakoid_grana', name: 'Thylakoid Grana Stack', x: 250, y: 240, role: 'Site of light-dependent reactions, water photolysis (2H₂O → 4H⁺ + 4e⁻ + O₂), and ATP/NADPH synthesis.', color: '#16A34A' },
      { id: 'oxygen_release', name: 'O₂ Evolution', x: 250, y: 420, role: 'Byproduct of water splitting released through leaf stomata.', color: '#0284C7' },
      { id: 'atp_nadph_shuttle', name: 'ATP & NADPH Energy Carriers', x: 420, y: 200, role: 'Transfers chemical energy and reducing power from thylakoids to stroma.', color: '#EA580C' },
      { id: 'calvin_cycle_stroma', name: 'Calvin Cycle (Stroma)', x: 600, y: 250, role: 'Light-independent carbon fixation catalyzed by RuBisCO converting 6CO₂ into C₆H₁₂O₆.', color: '#15803D' },
      { id: 'glucose_output', name: 'Glucose (C₆H₁₂O₆)', x: 600, y: 430, role: 'Six-carbon carbohydrate synthesized for cellular respiration and starch storage.', color: '#B45309' }
    ],
    walkthrough: {
      whatItShows: 'Complete chloroplast biochemical machinery linking Light-Dependent Reactions in the Thylakoid Grana to the Calvin Cycle in the Stroma.',
      importantComponents: [
        'Thylakoid Grana: Captures photons via Chlorophyll-a and splits water (Photolysis) to evolve O₂.',
        'ATP & NADPH Shuttle: High-energy molecules powering carbon reduction.',
        'Stroma (Calvin Cycle): Fixes atmospheric CO₂ using RuBisCO enzyme into G3P and Glucose (C₆H₁₂O₆).'
      ],
      processSequence: [
        '1. Photoexcitation: Chlorophyll absorbs red/blue photons; Photolysis splits 2H₂O into O₂, protons, and electrons.',
        '2. Photophosphorylation: Electron transport chain generates ATP and reduces NADP⁺ to NADPH.',
        '3. Carbon Fixation (Calvin Cycle): CO₂ combines with RuBP via RuBisCO in the stroma, using ATP and NADPH to yield Glucose (C₆H₁₂O₆).'
      ],
      examTakeaway: 'Balanced Equation: 6CO₂ + 12H₂O --(Sunlight / Chlorophyll)--> C₆H₁₂O₆ + 6O₂ + 6H₂O. Remember: O₂ comes strictly from H₂O, not CO₂!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#062E1F"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Photosynthesis — Light Reactions (Thylakoid) &amp; Calvin Cycle (Stroma)</text>
      <ellipse cx="420" cy="265" rx="370" ry="185" fill="#064E3B" stroke="#34D399" stroke-width="4"/>
      <ellipse cx="420" cy="265" rx="352" ry="168" fill="#047857" stroke="#A7F3D0" stroke-width="1.5" stroke-dasharray="6 4"/>
      <circle cx="115" cy="95" r="34" fill="#FACC15" stroke="#FEF08A" stroke-width="4"/>
      <text x="115" y="100" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#713F12" text-anchor="middle">Sunlight</text>
      <path d="M 145 120 L 220 185" stroke="#FDE047" stroke-width="4" stroke-dasharray="6 4"/>
      <g fill="#22C55E" stroke="#BBF7D0" stroke-width="2">
        <rect x="200" y="190" width="110" height="24" rx="12"/>
        <rect x="200" y="220" width="110" height="24" rx="12"/>
        <rect x="200" y="250" width="110" height="24" rx="12"/>
        <rect x="200" y="280" width="110" height="24" rx="12"/>
      </g>
      <text x="255" y="175" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#A7F3D0" text-anchor="middle">Thylakoid Grana</text>
      <text x="255" y="330" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="middle">2H₂O → 4H⁺ + 4e⁻ + O₂↑</text>
      <path d="M 320 215 Q 420 175 510 215" stroke="#FBBF24" stroke-width="4" fill="none"/>
      <rect x="370" y="168" width="105" height="28" rx="8" fill="#78350F" stroke="#FBBF24" stroke-width="1.5"/>
      <text x="422" y="186" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE68A" text-anchor="middle">ATP + NADPH</text>
      <path d="M 510 285 Q 420 325 320 285" stroke="#93C5FD" stroke-width="3" stroke-dasharray="5 4" fill="none"/>
      <text x="422" y="322" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#BFDBFE" text-anchor="middle">ADP + Pi + NADP⁺</text>
      <circle cx="595" cy="250" r="68" fill="#065F46" stroke="#6EE7B7" stroke-width="4"/>
      <text x="595" y="242" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Calvin Cycle</text>
      <text x="595" y="262" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#A7F3D0" text-anchor="middle">(RuBisCO in Stroma)</text>
      <text x="595" y="150" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">6 CO₂ Input ↓</text>
      <rect x="520" y="345" width="150" height="32" rx="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
      <text x="595" y="366" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#92400E" text-anchor="middle">Glucose (C₆H₁₂O₆)</text>
      <rect x="140" y="468" width="560" height="34" rx="10" fill="#022C22" stroke="#10B981" stroke-width="1.5"/>
      <text x="420" y="490" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#6EE7B7" text-anchor="middle">6CO₂ + 12H₂O + Light Energy → C₆H₁₂O₆ + 6O₂ + 6H₂O</text>
    </svg>`
  },

  // 9. HUMAN DIGESTIVE SYSTEM (Alimentary Canal & Enzymatic Digestion)
  digestive_system: {
    topic: 'Human Digestive System',
    subtopic: 'Alimentary Canal, Accessory Glands & Peristaltic Absorption',
    subject: 'Biology',
    visualType: 'anatomical_cross_section',
    title: 'Human Digestive System: Alimentary Canal & Enzymatic Pathways',
    caption: 'Complete anatomical schematic of the human gastrointestinal tract from buccal cavity and esophagus to stomach, liver, pancreas, small intestine (villi absorption), and large intestine.',
    labels: [
      { id: 'buccal_cavity', name: 'Buccal Cavity & Salivary Glands', x: 380, y: 75, role: 'Secretes salivary amylase (ptyalin) to hydrolyze starch into maltose at pH 6.8.', color: '#F59E0B' },
      { id: 'esophagus', name: 'Esophagus (Peristalsis)', x: 420, y: 145, role: 'Muscular tube transporting bolus to stomach via rhythmic peristaltic waves.', color: '#EC4899' },
      { id: 'liver_gallbladder', name: 'Liver & Gallbladder', x: 280, y: 230, role: 'Synthesizes and stores alkaline bile salts to emulsify large fat globules.', color: '#991B1B' },
      { id: 'stomach', name: 'Stomach (Gastric Glands)', x: 490, y: 235, role: 'Secretes HCl (pH 1.8), Pepsinogen, and Mucus for protein digestion.', color: '#EF4444' },
      { id: 'pancreas', name: 'Pancreas (Trypsin, Amylase, Lipase)', x: 510, y: 295, role: 'Releases pancreatic juice into duodenum to digest proteins, carbohydrates, and fats.', color: '#FBBF24' },
      { id: 'small_intestine', name: 'Small Intestine (Duodenum, Jejunum, Ileum)', x: 420, y: 375, role: 'Completes chemical digestion and absorbs nutrients via finger-like Villi.', color: '#FB923C' },
      { id: 'large_intestine', name: 'Large Intestine (Colon)', x: 290, y: 365, role: 'Reabsorbs water and electrolytes before egestion.', color: '#10B981' }
    ],
    walkthrough: {
      whatItShows: 'Sequential organization of the 9-meter human alimentary canal and its associated digestive glands (salivary glands, liver, pancreas).',
      importantComponents: [
        'Stomach: Secretes HCl (activates Pepsin and kills pathogens) and mucus (protects gastric mucosa).',
        'Liver & Pancreas: Deliver bile (emulsification of fats) and pancreatic enzymes into the Duodenum.',
        'Small Intestine (Ileum Villi): Microvilli provide massive surface area with blood capillaries and lacteals for nutrient absorption.'
      ],
      processSequence: [
        '1. Ingestion & Buccal Digestion: Mastication mixes food with salivary amylase (Starch → Maltose).',
        '2. Gastric Phase: Pepsin cleaves proteins into peptones and proteoses in acidic HCl medium.',
        '3. Intestinal Phase & Absorption: Bile emulsifies lipids; Lipase, Trypsin, and Maltase complete digestion for villi absorption.'
      ],
      examTakeaway: 'Bile contains NO enzymes—yet it is essential for fat digestion because bile salts emulsify large lipid droplets into micelles for pancreatic lipase!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Human Digestive System — Alimentary Canal &amp; Enzymatic Digestion</text>
      <path d="M 410 65 L 410 185" stroke="#F472B6" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M 410 185 C 485 175, 515 235, 455 270 C 420 285, 395 265, 405 285" fill="#EF4444" stroke="#FCA5A5" stroke-width="3"/>
      <path d="M 305 185 C 365 180, 395 210, 385 245 L 300 245 Z" fill="#991B1B" stroke="#F87171" stroke-width="2.5"/>
      <ellipse cx="355" cy="248" rx="16" ry="9" fill="#22C55E"/>
      <path d="M 425 278 L 505 272 L 495 292 L 425 290 Z" fill="#FACC15" stroke="#FEF08A" stroke-width="2"/>
      <rect x="330" y="305" width="180" height="125" rx="35" fill="none" stroke="#10B981" stroke-width="22"/>
      <path d="M 365 335 Q 420 315 470 340 Q 370 365 465 385 Q 375 405 420 415" stroke="#FB923C" stroke-width="14" fill="none" stroke-linecap="round"/>
      <text x="235" y="115" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F9A8D4">Esophagus (Peristalsis)</text>
      <text x="210" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FCA5A5">Liver &amp; Bile</text>
      <text x="610" y="220" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FCA5A5">Stomach (HCl + Pepsin)</text>
      <text x="615" y="285" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">Pancreas (Enzymes)</text>
      <text x="625" y="365" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDBA74">Small Intestine (Villi)</text>
      <text x="195" y="365" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#6EE7B7">Large Intestine (Colon)</text>
    </svg>`
  },

  // 10. WORK, POWER & ENERGY (Conservation of Mechanical Energy)
  work_power_energy: {
    topic: 'Work, Power and Energy',
    subtopic: 'Work Done W = F·s·cosθ, Kinetic/Potential Energy & Conservation Law',
    subject: 'Physics',
    visualType: 'physics_vector_schematic',
    title: 'Work, Power & Mechanical Energy Transformation Schematic',
    caption: 'Physics vector diagram showing force displacement work W = F·d·cosθ and conservation of mechanical energy (PE = mgh transforming into KE = ½mv²).',
    labels: [
      { id: 'work_vector', name: 'Work Done (W = F·s·cosθ)', x: 200, y: 180, role: 'Scalar dot product of Force vector F and displacement vector s.', color: '#38BDF8' },
      { id: 'potential_energy', name: 'Gravitational PE (mgh)', x: 480, y: 130, role: 'Maximum stored potential energy at height h; KE = 0 at rest.', color: '#F59E0B' },
      { id: 'kinetic_energy', name: 'Kinetic Energy (½mv²)', x: 700, y: 360, role: 'Maximum kinetic energy at base where h = 0; Total Energy E = PE + KE = constant.', color: '#22C55E' },
      { id: 'power_rate', name: 'Power (P = W/t = F·v)', x: 420, y: 450, role: 'Rate of energy transfer measured in Watts (1 W = 1 J/s; 1 HP = 746 W).', color: '#A855F7' }
    ],
    walkthrough: {
      whatItShows: 'Resolution of force vector F at angle θ across displacement s, alongside a frictionless roller-coaster incline demonstrating PE ↔ KE conservation.',
      importantComponents: [
        'Horizontal Force Component (F cosθ): Only the component parallel to displacement performs mechanical work.',
        'Top of Incline (Height h): Potential Energy PE = mgh is maximum while velocity v = 0.',
        'Bottom of Incline (Ground): Kinetic Energy KE = ½mv² equals initial mgh (v = √(2gh)).'
      ],
      processSequence: [
        '1. Force Application: Force F applied at angle θ moves mass m through distance s, doing work W = F·s·cosθ.',
        '2. Energy Transformation: As mass descends from height h, gravitational potential energy converts into kinetic energy.',
        '3. Power Output: Rate of work execution gives Power P = W / t.'
      ],
      examTakeaway: 'When force is perpendicular to displacement (θ = 90°, e.g., centripetal force or porter carrying load on level ground), cos 90° = 0, so Work Done W = 0 J!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Work (W = F·s·cosθ), Power (P = W/t) &amp; Energy Conservation</text>
      <line x1="60" y1="340" x2="380" y2="340" stroke="#94A3B8" stroke-width="4"/>
      <rect x="100" y="270" width="90" height="70" rx="10" fill="#1E40AF" stroke="#60A5FA" stroke-width="3"/>
      <text x="145" y="310" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mass m</text>
      <line x1="190" y1="305" x2="310" y2="225" stroke="#EF4444" stroke-width="5"/>
      <text x="295" y="215" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F87171">Force F</text>
      <line x1="190" y1="305" x2="330" y2="305" stroke="#38BDF8" stroke-width="4" stroke-dasharray="6 4"/>
      <text x="275" y="295" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8">F cosθ → s</text>
      <path d="M 460 130 Q 560 360 760 360" stroke="#FBBF24" stroke-width="5" fill="none"/>
      <circle cx="465" cy="120" r="18" fill="#F59E0B"/>
      <text x="535" y="115" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">Top: PE = mgh, KE = 0</text>
      <circle cx="735" cy="345" r="18" fill="#22C55E"/>
      <text x="665" y="395" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80">Base: KE = ½mv², PE = 0</text>
      <rect x="150" y="445" width="540" height="40" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="420" y="470" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#E0F2FE" text-anchor="middle">W = F·s·cosθ (Joules)  |  E_total = mgh + ½mv² = Constant  |  P = W/t (Watts)</text>
    </svg>`
  },

  // 11. SIMPLE MACHINES (Levers, Pulleys & Mechanical Advantage)
  simple_machines: {
    topic: 'Simple Machines',
    subtopic: 'Levers (Classes I, II, III), Pulleys, Mechanical Advantage & Efficiency',
    subject: 'Physics',
    visualType: 'physics_vector_schematic',
    title: 'Simple Machines: Principle of Moments, Mechanical Advantage & Velocity Ratio',
    caption: 'Comparative physics schematic of First, Second, and Third Class Levers and Pulley systems showing Fulcrum (F), Load (L), Effort (E), Mechanical Advantage (MA = L/E), and Efficiency (η = MA/VR × 100%).',
    labels: [
      { id: 'fulcrum_pivot', name: 'Fulcrum (F) & Effort/Load Arms', x: 260, y: 210, role: 'Fixed pivot point around which moments balance: Load × Load Arm = Effort × Effort Arm.', color: '#F59E0B' },
      { id: 'mechanical_advantage', name: 'Mechanical Advantage (MA = L / E)', x: 420, y: 120, role: 'Ratio of Load overcome to Effort applied; MA > 1 acts as a force multiplier.', color: '#38BDF8' },
      { id: 'velocity_ratio', name: 'Velocity Ratio (VR = d_E / d_L)', x: 620, y: 220, role: 'Ratio of displacement of Effort to displacement of Load.', color: '#22C55E' },
      { id: 'efficiency_law', name: 'Machine Efficiency (η = MA / VR)', x: 420, y: 450, role: 'Work Output / Work Input; always < 100% in real machines due to friction.', color: '#EC4899' }
    ],
    walkthrough: {
      whatItShows: 'Equilibrium of levers under the Principle of Moments alongside a block-and-tackle pulley system demonstrating force multiplication.',
      importantComponents: [
        'Class I Lever (Fulcrum in middle): Scissors, seesaw, crowbar (MA can be >1, =1, or <1).',
        'Class II Lever (Load in middle): Wheelbarrow, nutcracker (Effort arm > Load arm, so MA is always > 1 — Force Multiplier).',
        'Class III Lever (Effort in middle): Human forearm, tweezers, fishing rod (MA < 1 — Speed/Distance Multiplier).'
      ],
      processSequence: [
        '1. Moment Balance: Clockwise Moment (Load × d_L) equals Anticlockwise Moment (Effort × d_E).',
        '2. Force Multiplication: Making the Effort Arm longer than the Load Arm yields MA = d_E / d_L > 1.',
        '3. Efficiency Relation: Work Output = η × Work Input, hence η = (MA / VR) × 100%.'
      ],
      examTakeaway: 'Mnemonic "FLE 1-2-3": Middle component is Fulcrum in Class 1, Load in Class 2 (always MA > 1), and Effort in Class 3 (always MA < 1)!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Simple Machines — Principle of Moments, Levers (FLE) &amp; Pulleys</text>
      <line x1="100" y1="240" x2="540" y2="240" stroke="#E2E8F0" stroke-width="8" stroke-linecap="round"/>
      <polygon points="280,244 250,305 310,305" fill="#F59E0B" stroke="#FEF08A" stroke-width="2"/>
      <text x="280" y="330" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">Fulcrum (F)</text>
      <rect x="115" y="175" width="75" height="60" rx="8" fill="#EF4444"/>
      <text x="152" y="210" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">Load (L)</text>
      <line x1="510" y1="150" x2="510" y2="232" stroke="#38BDF8" stroke-width="5"/>
      <polygon points="510,235 500,215 520,215" fill="#38BDF8"/>
      <text x="510" y="138" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Effort (E) ↓</text>
      <circle cx="690" cy="150" r="38" fill="#1E293B" stroke="#60A5FA" stroke-width="4"/>
      <circle cx="690" cy="150" r="8" fill="#F59E0B"/>
      <line x1="652" y1="150" x2="652" y2="290" stroke="#94A3B8" stroke-width="4"/>
      <rect x="625" y="290" width="54" height="48" rx="6" fill="#EF4444"/>
      <text x="652" y="319" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Load</text>
      <line x1="728" y1="150" x2="755" y2="275" stroke="#38BDF8" stroke-width="4"/>
      <text x="765" y="295" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">Effort E</text>
      <rect x="110" y="435" width="620" height="44" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="420" y="462" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FEF08A" text-anchor="middle">Load × Load Arm = Effort × Effort Arm  |  MA = L / E  |  VR = d_E / d_L  |  η = (MA / VR) × 100%</text>
    </svg>`
  },

  // 12. ELECTRICITY (Ohm's Law, Series/Parallel Circuits & Joule Heating)
  electric_circuit: {
    topic: 'Electricity and Electric Circuits',
    subtopic: "Ohm's Law (V = IR), Series vs Parallel Resistance & Electric Power",
    subject: 'Physics',
    visualType: 'physics_vector_schematic',
    title: "Electric Circuit Schematic: Ohm's Law (V = IR), Ammeter & Voltmeter",
    caption: 'Closed DC circuit schematic showing EMF battery source, series Ammeter (A), load resistor (R) with parallel Voltmeter (V), conventional current (I) vs electron drift, and governing equations.',
    labels: [
      { id: 'dc_battery_source', name: 'DC Battery Source (EMF V)', x: 160, y: 250, role: 'Maintains potential difference V driving charge carriers around the circuit.', color: '#EF4444' },
      { id: 'series_ammeter', name: 'Ammeter in Series (A)', x: 420, y: 115, role: 'Low-resistance instrument measuring current I = Q/t in Amperes (A).', color: '#38BDF8' },
      { id: 'load_resistor', name: 'Load Resistor (R)', x: 640, y: 250, role: 'Ohmic conductor obeying V = I × R (measured in Ohms Ω).', color: '#F59E0B' },
      { id: 'parallel_voltmeter', name: 'Voltmeter in Parallel (V)', x: 750, y: 250, role: 'High-resistance instrument measuring potential drop across resistor R.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: "Standard textbook circuit diagram demonstrating Ohm's Law (V = IR) with proper series Ammeter and parallel Voltmeter connections.",
      importantComponents: [
        'Battery Cell (+ / -): Provides electromotive force (Volts).',
        'Ammeter (A): Always connected in SERIES because it has negligible internal resistance.',
        'Voltmeter (V): Always connected in PARALLEL across the resistor because it has very high resistance.'
      ],
      processSequence: [
        '1. Potential Difference: Battery establishes electric field across the conductor.',
        '2. Current Flow: Conventional current I flows from + to - terminal (electrons drift opposite, from - to +).',
        '3. Ohmic Drop & Power: Voltage drop across R is V = IR; thermal energy dissipated is H = I²Rt.'
      ],
      examTakeaway: 'Series Resistance: R_eq = R₁ + R₂. Parallel Resistance: 1/R_eq = 1/R₁ + 1/R₂. Household appliances are connected in PARALLEL so each receives full 220V independently!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Electricity &amp; Ohm's Law Circuit — V = I × R, Series Ammeter &amp; Parallel Voltmeter</text>
      <rect x="180" y="115" width="460" height="270" fill="none" stroke="#94A3B8" stroke-width="5"/>
      <rect x="150" y="215" width="60" height="70" fill="#0F172A"/>
      <line x1="155" y1="235" x2="205" y2="235" stroke="#EF4444" stroke-width="6"/>
      <line x1="168" y1="260" x2="192" y2="260" stroke="#38BDF8" stroke-width="6"/>
      <text x="115" y="252" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F87171">Battery (V)</text>
      <circle cx="410" cy="115" r="28" fill="#0284C7" stroke="#BAE6FD" stroke-width="3"/>
      <text x="410" y="121" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">A</text>
      <text x="410" y="75" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">Series Ammeter (I)</text>
      <rect x="615" y="195" width="50" height="110" rx="8" fill="#78350F" stroke="#F59E0B" stroke-width="3"/>
      <text x="640" y="255" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FDE68A" text-anchor="middle">R (Ω)</text>
      <path d="M 640 175 L 745 175 L 745 325 L 640 325" fill="none" stroke="#22C55E" stroke-width="3"/>
      <circle cx="745" cy="250" r="26" fill="#15803D" stroke="#BBF7D0" stroke-width="3"/>
      <text x="745" y="256" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">V</text>
      <rect x="130" y="440" width="580" height="42" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="420" y="466" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#E0F2FE" text-anchor="middle">V = I × R  |  P = V × I = I²R = V²/R  |  R_series = R₁ + R₂  |  1/R_parallel = 1/R₁ + 1/R₂</text>
    </svg>`
  },

  // 13. LIGHT & OPTICS (Refraction, Snell's Law & Convex Lens Ray Diagram)
  optics_light: {
    topic: 'Light: Reflection and Refraction',
    subtopic: "Snell's Law of Refraction (n₁ sinθ₁ = n₂ sinθ₂) & Convex Lens Ray Tracing",
    subject: 'Physics',
    visualType: 'physics_vector_schematic',
    title: "Geometrical Optics: Convex Lens Ray Diagram & Snell's Law",
    caption: 'Precision optical ray diagram showing parallel paraxial rays converging through a biconvex lens to Principal Focus (F₂) to form a real inverted image, governed by 1/f = 1/v - 1/u.',
    labels: [
      { id: 'object_2f', name: 'Object AB (Beyond 2F₁)', x: 160, y: 185, role: 'Extended luminous object placed beyond 2F₁ in front of converging lens.', color: '#38BDF8' },
      { id: 'biconvex_lens', name: 'Convex Lens & Optical Center (O)', x: 420, y: 250, role: 'Refracts parallel rays through F₂; ray through Optical Center O passes undeviated.', color: '#60A5FA' },
      { id: 'principal_focus', name: 'Principal Focus (F₂)', x: 540, y: 255, role: 'Point on principal axis where parallel rays converge after refraction.', color: '#F59E0B' },
      { id: 'real_image', name: "Real Inverted Image (A'B')", x: 620, y: 310, role: 'Formed between F₂ and 2F₂; magnification m = v / u = hᵢ / hₒ.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Ray tracing through a thin biconvex converging lens using the two fundamental Cartesian rules of geometrical optics.',
      importantComponents: [
        'Ray 1 (Parallel to Principal Axis): Refracts through the lens and passes directly through Principal Focus F₂.',
        'Ray 2 (Through Optical Center O): Passes straight through without angular deviation.',
        'Image Intersection (A\'B\'): Where the two refracted rays intersect, forming a real, inverted image.'
      ],
      processSequence: [
        '1. Incident Rays: Draw one ray parallel to principal axis and one ray through Optical Center O.',
        '2. Refraction: Apply Snell\'s Law (n₁ sin i = n₂ sin r) at lens surfaces so parallel ray bends through F₂.',
        '3. Image Location: Apply Thin Lens Formula 1/f = 1/v - 1/u with New Cartesian Sign Convention.'
      ],
      examTakeaway: 'Convex lens focal length f is ALWAYS positive (+f), whereas Concave lens focal length is ALWAYS negative (-f). Power of lens P = 1 / f(in meters) measured in Dioptres (D)!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Optics &amp; Light — Convex Lens Ray Tracing &amp; Thin Lens Equation (1/f = 1/v - 1/u)</text>
      <line x1="60" y1="255" x2="780" y2="255" stroke="#94A3B8" stroke-width="2.5" stroke-dasharray="6 4"/>
      <path d="M 420 105 Q 458 255 420 405 Q 382 255 420 105 Z" fill="#1E3A8A" fill-opacity="0.7" stroke="#60A5FA" stroke-width="3"/>
      <circle cx="420" cy="255" r="5" fill="#FFFFFF"/>
      <text x="432" y="275" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">O</text>
      <circle cx="300" cy="255" r="5" fill="#F59E0B"/><text x="295" y="280" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">F₁</text>
      <circle cx="180" cy="255" r="5" fill="#F59E0B"/><text x="170" y="280" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">2F₁</text>
      <circle cx="540" cy="255" r="5" fill="#F59E0B"/><text x="535" y="280" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">F₂</text>
      <circle cx="660" cy="255" r="5" fill="#F59E0B"/><text x="650" y="280" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">2F₂</text>
      <line x1="150" y1="255" x2="150" y2="155" stroke="#38BDF8" stroke-width="5"/>
      <text x="150" y="142" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Object AB</text>
      <polyline points="150,155 420,155 615,328" fill="none" stroke="#FBBF24" stroke-width="3"/>
      <line x1="150" y1="155" x2="615" y2="328" stroke="#F472B6" stroke-width="3"/>
      <line x1="615" y1="255" x2="615" y2="328" stroke="#22C55E" stroke-width="5"/>
      <text x="615" y="352" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">Real Image A'B'</text>
      <rect x="130" y="440" width="580" height="42" rx="10" fill="#1E293B" stroke="#60A5FA" stroke-width="1.5"/>
      <text x="420" y="466" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#E0F2FE" text-anchor="middle">Snell's Law: n₁ sin i = n₂ sin r  |  Lens Formula: 1/f = 1/v - 1/u  |  Power: P = 1/f (Dioptres)</text>
    </svg>`
  },

  // 14. ATOMIC STRUCTURE (Bohr Shells, Protons, Neutrons & Quantized Orbitals)
  atomic_structure: {
    topic: 'Atomic Structure',
    subtopic: 'Nucleus (Protons + Neutrons), Bohr Quantized Shells (K, L, M) & 2n² Rule',
    subject: 'Chemistry',
    visualType: 'molecular_schematic',
    title: 'Atomic Structure: Bohr Quantized Energy Shells & Subatomic Nucleus',
    caption: 'Bohr atomic model of Sodium (₁₁Na²³) showing central dense nucleus (11 protons + 12 neutrons) surrounded by K (n=1, 2e⁻), L (n=2, 8e⁻), and M (n=3, 1 valence e⁻) shells.',
    labels: [
      { id: 'dense_nucleus', name: 'Nucleus (Z=11 Protons, N=12 Neutrons)', x: 420, y: 250, role: 'Contains 99.9% of atomic mass; Atomic Number Z = Protons, Mass Number A = Z + N.', color: '#EF4444' },
      { id: 'k_shell', name: 'K Shell (n = 1, max 2e⁻)', x: 495, y: 250, role: 'Lowest energy inner orbital holding 2 core electrons.', color: '#38BDF8' },
      { id: 'l_shell', name: 'L Shell (n = 2, max 8e⁻)', x: 545, y: 250, role: 'Second quantized energy shell filled with 8 electrons (Octet).', color: '#22C55E' },
      { id: 'm_valence_shell', name: 'M Valence Shell (n = 3, 1e⁻)', x: 600, y: 250, role: 'Outermost valence shell determining chemical reactivity and valency.', color: '#F59E0B' }
    ],
    walkthrough: {
      whatItShows: 'Rutherford-Bohr quantized atomic structure for Sodium-23 (Z=11, A=23, Electronic Configuration 2, 8, 1).',
      importantComponents: [
        'Protons (p⁺, charge +1, mass 1 u) & Neutrons (n⁰, charge 0, mass 1 u) bound inside the femtometer nucleus.',
        'Quantized Shells K, L, M, N (n = 1, 2, 3, 4) with maximum capacity governed by Bohr-Bury 2n² rule.',
        'Valence Electron: Outermost electron participating in chemical bond formation.'
      ],
      processSequence: [
        '1. Nuclear Identity: Count protons to fix Atomic Number Z (Z = 11 for Sodium).',
        '2. Shell Filling (2n²): Fill K-shell with 2e⁻, L-shell with 8e⁻, and place the 11th electron in M-shell (2, 8, 1).',
        '3. Quantum Transitions: Electrons absorb or emit photons ΔE = hν only when jumping between discrete orbits.'
      ],
      examTakeaway: 'Isotopes have the SAME Atomic Number Z (same protons and chemical properties) but DIFFERENT Mass Number A (different neutrons, e.g., ¹²C and ¹⁴C)!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Atomic Structure — Bohr Energy Shells (K, L, M), 2n² Rule &amp; Subatomic Nucleus</text>
      <circle cx="420" cy="245" r="175" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6 4"/>
      <circle cx="420" cy="245" r="122" fill="none" stroke="#22C55E" stroke-width="2"/>
      <circle cx="420" cy="245" r="72" fill="none" stroke="#38BDF8" stroke-width="2"/>
      <circle cx="420" cy="245" r="34" fill="#DC2626" stroke="#FCA5A5" stroke-width="3"/>
      <text x="420" y="242" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">11 p⁺</text>
      <text x="420" y="256" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">12 n⁰</text>
      <circle cx="420" cy="173" r="7" fill="#38BDF8"/><circle cx="420" cy="317" r="7" fill="#38BDF8"/>
      <circle cx="420" cy="123" r="7" fill="#22C55E"/><circle cx="420" cy="367" r="7" fill="#22C55E"/>
      <circle cx="298" cy="245" r="7" fill="#22C55E"/><circle cx="542" cy="245" r="7" fill="#22C55E"/>
      <circle cx="334" cy="159" r="7" fill="#22C55E"/><circle cx="506" cy="159" r="7" fill="#22C55E"/>
      <circle cx="334" cy="331" r="7" fill="#22C55E"/><circle cx="506" cy="331" r="7" fill="#22C55E"/>
      <circle cx="595" cy="245" r="9" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="685" y="248" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047">Valence e⁻ (M Shell)</text>
      <rect x="130" y="445" width="580" height="40" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="420" y="470" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#E0F2FE" text-anchor="middle">Atomic Number Z = p⁺  |  Mass Number A = p⁺ + n⁰  |  Max Electrons per Shell = 2n²</text>
    </svg>`
  },

  // 15. CHEMICAL REACTIONS (Reaction Coordinate, Activation Energy & Stoichiometry)
  chemical_reactions: {
    topic: 'Chemical Reactions and Equations',
    subtopic: 'Law of Conservation of Mass, Reaction Types & Exothermic/Endothermic Profile',
    subject: 'Chemistry',
    visualType: 'molecular_schematic',
    title: 'Chemical Reactions: Activation Energy Profile & Stoichiometric Balance',
    caption: 'Reaction coordinate energy diagram showing Reactants climbing Activation Energy barrier (Eₐ) to Transition State and releasing Enthalpy (ΔH < 0) to form Products.',
    labels: [
      { id: 'reactants_level', name: 'Reactants (CH₄ + 2O₂)', x: 165, y: 240, role: 'Initial chemical species before bond cleavage.', color: '#38BDF8' },
      { id: 'activation_energy', name: 'Activation Energy (Eₐ)', x: 375, y: 125, role: 'Minimum threshold energy required to reach transition state; lowered by a Catalyst.', color: '#F59E0B' },
      { id: 'enthalpy_change', name: 'Enthalpy Change (ΔH = H_p - H_r)', x: 510, y: 310, role: 'Net heat released (Exothermic, ΔH < 0) or absorbed (Endothermic, ΔH > 0).', color: '#EF4444' },
      { id: 'products_level', name: 'Products (CO₂ + 2H₂O)', x: 675, y: 375, role: 'Stable new compounds formed with identical total atomic count (Conservation of Mass).', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Potential energy profile along a chemical reaction coordinate alongside the 4 major reaction classifications (Combination, Decomposition, Displacement, Redox).',
      importantComponents: [
        'Activation Energy Peak (Eₐ): Energy barrier broken during collision; a catalyst provides an alternative lower-Eₐ pathway.',
        'Exothermic Drop (ΔH < 0): Products sit at lower potential energy than reactants, releasing thermal energy.',
        'Stoichiometric Coefficients: Ensure exact conservation of atoms on both sides of the arrow.'
      ],
      processSequence: [
        '1. Bond Breaking (Endothermic): Reactant bonds absorb energy Eₐ to reach the activated complex.',
        '2. Bond Formation (Exothermic): New stronger bonds form in products, releasing energy.',
        '3. Stoichiometric Balancing: Equalize atoms of each element on LHS and RHS.'
      ],
      examTakeaway: 'OIL RIG Mnemonic for Redox: Oxidation Is Loss of electrons (gain of oxygen); Reduction Is Gain of electrons (loss of oxygen)!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Chemical Reactions — Activation Energy (Eₐ), Catalysis &amp; Enthalpy (ΔH)</text>
      <line x1="100" y1="80" x2="100" y2="415" stroke="#94A3B8" stroke-width="3"/>
      <line x1="100" y1="415" x2="760" y2="415" stroke="#94A3B8" stroke-width="3"/>
      <line x1="110" y1="245" x2="250" y2="245" stroke="#38BDF8" stroke-width="5"/>
      <text x="180" y="232" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Reactants (CH₄ + 2O₂)</text>
      <path d="M 250 245 Q 375 55 500 365" fill="none" stroke="#EF4444" stroke-width="4"/>
      <path d="M 250 245 Q 375 145 500 365" fill="none" stroke="#FBBF24" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="380" y="102" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F87171" text-anchor="middle">Uncatalyzed Eₐ</text>
      <text x="380" y="185" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FDE047" text-anchor="middle">Catalyzed Path (Lower Eₐ)</text>
      <line x1="500" y1="365" x2="720" y2="365" stroke="#22C55E" stroke-width="5"/>
      <text x="615" y="352" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">Products (CO₂ + 2H₂O)</text>
      <rect x="130" y="445" width="580" height="40" rx="10" fill="#1E293B" stroke="#22C55E" stroke-width="1.5"/>
      <text x="420" y="470" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#DCFCE7" text-anchor="middle">Conservation of Mass: ∑ m_reactants = ∑ m_products  |  ΔH = H_products - H_reactants</text>
    </svg>`
  },

  // 16. FRACTIONS, ALGEBRA, GEOMETRY & GRAPHS (Mathematics Visual Schematics)
  fractions_visual: {
    topic: 'Fractions and Rational Numbers',
    subtopic: 'Numerator, Denominator, Equivalent Fractions & Number Line',
    subject: 'Mathematics',
    visualType: 'mathematical_vector_geometry',
    title: 'Fractions: Equal Area Partitions, Equivalence (1/2 = 2/4 = 4/8) & Number Line',
    caption: 'Visual comparison of equivalent fractions using congruent area bars and precise rational coordinates along the 0-to-1 number line.',
    labels: [
      { id: 'numerator_denominator', name: 'Fraction a / b (Numerator / Denominator)', x: 240, y: 120, role: 'b equal parts in whole; a parts selected (b ≠ 0).', color: '#38BDF8' },
      { id: 'equivalent_bars', name: 'Equivalent Fractions (1/2 = 2/4 = 4/8)', x: 420, y: 240, role: 'Multiplying numerator and denominator by k preserves exact rational value.', color: '#F59E0B' },
      { id: 'number_line_loc', name: 'Rational Number Line Coordinate', x: 420, y: 390, role: 'Maps proper fractions between 0 and 1 and improper fractions beyond 1.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Congruent fraction bars proving why 1/2, 2/4, and 4/8 occupy the exact same geometric area and number-line coordinate.',
      importantComponents: [
        'Denominator (b): Total equal subdivisions of the unit whole.',
        'Numerator (a): Count of shaded subdivisions.',
        'Least Common Denominator (LCD): Required before adding or subtracting unlike fractions.'
      ],
      processSequence: [
        '1. Equal Partitioning: Divide the unit interval [0, 1] into b equal segments.',
        '2. Equivalence Scaling: Multiply top and bottom by k: (a × k) / (b × k).',
        '3. Arithmetic Rule: a/b + c/d = (ad + bc) / bd.'
      ],
      examTakeaway: 'Never add denominators directly! Always convert to the Least Common Multiple (LCM) of the denominators first, and for division multiply by the reciprocal: (a/b) ÷ (c/d) = (a/b) × (d/c).'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Fractions — Equivalent Area Partitions (1/2 = 2/4 = 4/8) &amp; Number Line</text>
      <rect x="140" y="90" width="280" height="48" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="420" y="90" width="280" height="48" fill="#1E293B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="280" y="120" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">1 / 2</text>
      <rect x="140" y="165" width="140" height="48" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="280" y="165" width="140" height="48" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="420" y="165" width="140" height="48" fill="#1E293B" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="560" y="165" width="140" height="48" fill="#1E293B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="280" y="195" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">2 / 4</text>
      <rect x="140" y="240" width="280" height="48" fill="#22C55E" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="420" y="240" width="280" height="48" fill="#1E293B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="280" y="270" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">4 / 8</text>
      <line x1="140" y1="365" x2="700" y2="365" stroke="#E2E8F0" stroke-width="4"/>
      <circle cx="140" cy="365" r="7" fill="#FFFFFF"/><text x="140" y="395" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">0</text>
      <circle cx="420" cy="365" r="9" fill="#FBBF24"/><text x="420" y="395" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FDE047" text-anchor="middle">0.5 (1/2 = 2/4 = 4/8)</text>
      <circle cx="700" cy="365" r="7" fill="#FFFFFF"/><text x="700" y="395" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">1</text>
      <rect x="130" y="440" width="580" height="42" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="420" y="466" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#E0F2FE" text-anchor="middle">Addition: a/b + c/d = (ad + bc)/bd  |  Multiplication: (a/b)×(c/d) = ac/bd  |  Division: (a/b)÷(c/d) = ad/bc</text>
    </svg>`
  },

  // 17. GEOMETRY (Pythagorean Theorem & Right Triangle Proof)
  geometry_pythagoras: {
    topic: 'Geometry and Pythagorean Theorem',
    subtopic: 'Right-Angled Triangle Hypotenuse Proof (a² + b² = c²) & Trigonometric Ratios',
    subject: 'Mathematics',
    visualType: 'mathematical_vector_geometry',
    title: 'Euclidean Geometry: Pythagorean Area Proof (a² + b² = c²)',
    caption: 'Visual geometric proof showing squares constructed on legs a=3 (area 9) and b=4 (area 16) equaling the area of the square on hypotenuse c=5 (area 25).',
    labels: [
      { id: 'altitude_leg_a', name: 'Perpendicular Leg a = 3 (a² = 9)', x: 240, y: 260, role: 'Vertical side adjacent to the 90° right angle.', color: '#38BDF8' },
      { id: 'base_leg_b', name: 'Base Leg b = 4 (b² = 16)', x: 380, y: 390, role: 'Horizontal base adjacent to the 90° right angle.', color: '#22C55E' },
      { id: 'hypotenuse_c', name: 'Hypotenuse c = 5 (c² = 25)', x: 470, y: 195, role: 'Longest side opposite the 90° angle: c = √(a² + b²).', color: '#F59E0B' }
    ],
    walkthrough: {
      whatItShows: 'Classical Euclidean area proof for a 3-4-5 Pythagorean triple right triangle where 3² + 4² = 9 + 16 = 25 = 5².',
      importantComponents: [
        'Right Angle (90°): Vertex between perpendicular legs a and b.',
        'Square on Leg a (Area = a² = 9) + Square on Leg b (Area = b² = 16).',
        'Square on Hypotenuse c (Area = c² = 25).'
      ],
      processSequence: [
        '1. Identify Right Angle: Locate the 90° corner and the opposite side (Hypotenuse c).',
        '2. Sum of Squares: Compute a² + b².',
        '3. Extract Root: c = √(a² + b²).'
      ],
      examTakeaway: 'Memorize common Pythagorean Triples for fast exam calculation: (3, 4, 5), (5, 12, 13), (8, 15, 17), and (7, 24, 25)!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Euclidean Geometry — Pythagorean Theorem Visual Proof (a² + b² = c²)</text>
      <polygon points="300,310 300,190 460,310" fill="#1E293B" stroke="#FFFFFF" stroke-width="3"/>
      <rect x="300" y="292" width="18" height="18" fill="none" stroke="#FBBF24" stroke-width="2"/>
      <rect x="180" y="190" width="120" height="120" fill="#0284C7" fill-opacity="0.45" stroke="#38BDF8" stroke-width="3"/>
      <text x="240" y="255" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#E0F2FE" text-anchor="middle">a² = 3² = 9</text>
      <rect x="300" y="310" width="160" height="115" fill="#15803D" fill-opacity="0.45" stroke="#4ADE80" stroke-width="3"/>
      <text x="380" y="372" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#DCFCE7" text-anchor="middle">b² = 4² = 16</text>
      <polygon points="300,190 460,310 555,190 395,70" fill="#B45309" fill-opacity="0.45" stroke="#FBBF24" stroke-width="3"/>
      <text x="430" y="195" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FEF08A" text-anchor="middle">c² = 5² = 25</text>
      <rect x="130" y="450" width="580" height="40" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="420" y="475" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FEF08A" text-anchor="middle">a² + b² = c²  |  9 + 16 = 25  |  sinθ = Opp/Hyp, cosθ = Adj/Hyp, tanθ = Opp/Adj</text>
    </svg>`
  },

  // 18. ALGEBRA & COORDINATE GRAPHS (Linear & Quadratic Functions)
  coordinate_graphs: {
    topic: 'Algebra and Coordinate Graphs',
    subtopic: 'Cartesian Plane (x, y), Linear Slope-Intercept (y = mx + c) & Quadratic Parabola',
    subject: 'Mathematics',
    visualType: 'mathematical_vector_geometry',
    title: 'Coordinate Geometry & Algebra: Linear (y = mx + c) & Quadratic Parabola Roots',
    caption: 'Four-quadrant Cartesian coordinate plane plotting linear function y = 2x + 1 (slope m, y-intercept c) and quadratic parabola y = x² - 4 showing vertex and x-intercept roots.',
    labels: [
      { id: 'y_intercept', name: 'Y-Intercept (0, c) & Slope m = Δy/Δx', x: 420, y: 210, role: 'Where line crosses vertical y-axis; slope m measures steepness (rise over run).', color: '#38BDF8' },
      { id: 'quadratic_roots', name: 'Quadratic Roots / Zeros (-2, 0) & (2, 0)', x: 520, y: 255, role: 'Points where parabola y = ax² + bx + c intersects the x-axis (y = 0).', color: '#F59E0B' },
      { id: 'parabola_vertex', name: 'Vertex Minimum (0, -4)', x: 420, y: 370, role: 'Turning point at x = -b / (2a).', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Simultaneous geometric representation of a first-degree linear equation (straight line) and a second-degree quadratic polynomial (U-shaped parabola) on the Cartesian plane.',
      importantComponents: [
        'Horizontal X-Axis (Abscissa) & Vertical Y-Axis (Ordinate) intersecting at Origin (0,0).',
        'Linear Equation y = mx + c: Constant rate of change m = (y₂ - y₁)/(x₂ - x₁).',
        'Quadratic Equation ax² + bx + c = 0: Discriminant D = b² - 4ac determines real vs complex roots.'
      ],
      processSequence: [
        '1. Plot Intercepts: Set x = 0 to find y-intercept; set y = 0 to solve for x-intercepts (roots).',
        '2. Evaluate Slope / Vertex: For line, compute m = rise/run; for parabola, locate vertex at x = -b/(2a).',
        '3. Connect Locus: Draw the continuous line or symmetric parabolic curve.'
      ],
      examTakeaway: 'Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a). When Discriminant D > 0, there are 2 distinct real roots; when D = 0, 1 repeated root (tangent to x-axis); when D < 0, no real roots!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Algebra &amp; Coordinate Graphs — Linear (y = mx + c) &amp; Quadratic (y = ax² + bx + c)</text>
      <line x1="120" y1="255" x2="720" y2="255" stroke="#94A3B8" stroke-width="3"/>
      <line x1="420" y1="65" x2="420" y2="425" stroke="#94A3B8" stroke-width="3"/>
      <line x1="260" y1="385" x2="580" y2="95" stroke="#38BDF8" stroke-width="4"/>
      <text x="615" y="105" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8">Line: y = mx + c</text>
      <path d="M 270 105 Q 420 465 570 105" fill="none" stroke="#F59E0B" stroke-width="4"/>
      <circle cx="332" cy="255" r="7" fill="#EF4444"/><circle cx="508" cy="255" r="7" fill="#EF4444"/>
      <circle cx="420" cy="365" r="7" fill="#22C55E"/>
      <text x="420" y="395" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">Vertex (-b/2a, -D/4a)</text>
      <rect x="130" y="445" width="580" height="40" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="420" y="470" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#E0F2FE" text-anchor="middle">Slope m = (y₂ - y₁)/(x₂ - x₁)  |  Quadratic Roots: x = [-b ± √(b² - 4ac)] / 2a</text>
    </svg>`
  },

  // 19. WORLD WAR II & INDIAN INDEPENDENCE MOVEMENT (Historical Timelines)
  world_war_2: {
    topic: 'World War II (1939–1945)',
    subtopic: 'Causes, Axis vs Allies, Key Turning Points (Stalingrad, Midway, D-Day) & UN Formation',
    subject: 'History',
    visualType: 'historical_timeline_infographic',
    title: 'World War II (1939–1945): Chronological Strategic Timeline & Turning Points',
    caption: 'Chronological historical timeline tracing major theaters and decisive turning points from the 1939 Invasion of Poland to Stalingrad, D-Day (Normandy), and 1945 Allied Victory & UN Charter.',
    labels: [
      { id: 'invasion_poland_1939', name: 'Sept 1, 1939: Invasion of Poland', x: 140, y: 220, role: 'Germany invades Poland using Blitzkrieg tactics; Britain and France declare war.', color: '#EF4444' },
      { id: 'pearl_harbor_1941', name: '1941: Operation Barbarossa & Pearl Harbor', x: 320, y: 220, role: 'Axis expansion peaks; USSR and USA enter the Allied coalition.', color: '#F59E0B' },
      { id: 'stalingrad_midway_1942', name: '1942–43: Midway & Stalingrad Turning Points', x: 500, y: 220, role: 'Red Army encircles German 6th Army at Stalingrad; US Navy halts Japan at Midway.', color: '#38BDF8' },
      { id: 'dday_victory_1945', name: '1944–45: D-Day, VE/VJ Day & United Nations', x: 690, y: 220, role: 'Operation Overlord liberates Western Europe; Axis surrender leads to founding of the UN.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Six-year strategic progression of World War II showing how Axis momentum (1939–1941) was reversed by Allied industrial and military mobilization (1942–1945).',
      importantComponents: [
        'Allied Powers: Britain, USSR, USA, France, China.',
        'Axis Powers: Nazi Germany, Imperial Japan, Fascist Italy (Tripartite Pact).',
        'Decisive Turning Points: Battle of Stalingrad (Eastern Front), Battle of Midway (Pacific), D-Day Normandy Landings (Western Front).'
      ],
      processSequence: [
        '1. Outbreak (1939–1940): Failure of Appeasement and League of Nations culminates in Blitzkrieg across Europe.',
        '2. Global Escalation (1941–1942): German invasion of USSR (June 1941) and Japanese attack on Pearl Harbor (Dec 7, 1941).',
        '3. Allied Counter-Offensive & Peace (1943–1945): Stalingrad, D-Day (June 6, 1944), Berlin capture (May 1945), and UN establishment (Oct 24, 1945).'
      ],
      examTakeaway: 'Distinguish immediate cause (German invasion of Poland on Sept 1, 1939) from structural causes (Treaty of Versailles harsh terms, Great Depression, Failure of League of Nations, Rise of Fascism)!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">World War II (1939–1945) — Chronological Strategic Timeline &amp; Turning Points</text>
      <line x1="90" y1="255" x2="750" y2="255" stroke="#60A5FA" stroke-width="5"/>
      <circle cx="145" cy="255" r="14" fill="#EF4444"/><text x="145" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FCA5A5" text-anchor="middle">1939: Poland</text>
      <circle cx="325" cy="255" r="14" fill="#F59E0B"/><text x="325" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">1941: Barbarossa &amp; Pearl Harbor</text>
      <circle cx="515" cy="255" r="14" fill="#38BDF8"/><text x="515" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#BAE6FD" text-anchor="middle">1942-43: Stalingrad &amp; Midway</text>
      <circle cx="700" cy="255" r="14" fill="#22C55E"/><text x="700" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#86EFAC" text-anchor="middle">1944-45: D-Day &amp; UN</text>
      <rect x="120" y="435" width="600" height="44" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="420" y="462" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FEF08A" text-anchor="middle">Allies (UK, USSR, USA, France) vs Axis (Germany, Japan, Italy) → Oct 24, 1945 United Nations</text>
    </svg>`
  },

  // 20. INDIAN INDEPENDENCE MOVEMENT (1857 to 1947 Freedom Struggle)
  indian_independence: {
    topic: 'Indian Independence Movement (1857–1947)',
    subtopic: 'Revolt of 1857, INC (1885), Non-Cooperation (1920), Civil Disobedience / Dandi March (1930) & Quit India (1942)',
    subject: 'History',
    visualType: 'historical_timeline_infographic',
    title: 'Indian National Movement (1857–1947): Key Mass Movements & Milestones',
    caption: 'Chronological progression of the Indian freedom struggle from the 1857 First War of Independence and 1885 INC formation to Gandhian Satyagraha movements (1920, 1930, 1942) and 1947 Independence.',
    labels: [
      { id: 'revolt_1857_inc', name: '1857 Revolt & 1885 INC Foundation', x: 145, y: 220, role: 'First War of Independence followed by institutional political awakening (INC, Swadeshi 1905).', color: '#F59E0B' },
      { id: 'non_cooperation_1920', name: '1920: Non-Cooperation Movement', x: 330, y: 220, role: 'Mass Satyagraha led by Mahatma Gandhi promoting Khadi, boycott of British institutions.', color: '#38BDF8' },
      { id: 'dandi_march_1930', name: '1930: Purna Swaraj & Dandi Salt March', x: 515, y: 220, role: '240-mile march from Sabarmati to Dandi breaking the British salt monopoly (Civil Disobedience).', color: '#EC4899' },
      { id: 'quit_india_1942_1947', name: '1942 Quit India & Aug 15, 1947 Independence', x: 700, y: 220, role: 'Do or Die call (1942), INA struggle, and Sovereign Independence on August 15, 1947.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Phased transformation of the Indian freedom struggle from early resistance and moderate petitions to nationwide Gandhian mass movements and Subhas Chandra Bose\'s INA.',
      importantComponents: [
        'Moderate & Assertive Nationalism (1885–1918): Dadabhai Naoroji (Drain of Wealth theory) and Lal-Bal-Pal (Swadeshi & Boycott 1905).',
        'Three Gandhian Mass Movements: Non-Cooperation (1920–22), Civil Disobedience / Dandi Salt Satyagraha (1930), Quit India ("Do or Die", Aug 8, 1942).',
        'Revolutionary & INA Contributions: Bhagat Singh (HSRA) and Netaji Subhas Chandra Bose (Azad Hind Fauj).'
      ],
      processSequence: [
        '1. Early Awakening (1857–1915): Revolt of 1857 ends East India Company rule; INC formed in 1885; Partition of Bengal (1905) sparks Swadeshi.',
        '2. Mass Mobilization (1919–1934): Jallianwala Bagh (1919) leads to Non-Cooperation (1920); Lahore Congress (1929) declares Purna Swaraj followed by Dandi March (March 12, 1930).',
        '3. Final Push (1942–1947): Quit India Movement (1942) and Royal Indian Navy Mutiny culminate in the Indian Independence Act (Aug 15, 1947).'
      ],
      examTakeaway: 'Remember the chronological triad of Gandhian mass movements: 1920 (Non-Cooperation, halted after Chauri Chaura 1922) → 1930 (Civil Disobedience / Dandi Salt March) → 1942 (Quit India "Do or Die")!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Indian Independence Movement (1857–1947) — Chronological Freedom Struggle</text>
      <line x1="90" y1="255" x2="750" y2="255" stroke="#F97316" stroke-width="5"/>
      <circle cx="145" cy="255" r="14" fill="#F59E0B"/><text x="145" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">1857 &amp; 1885 INC</text>
      <circle cx="330" cy="255" r="14" fill="#38BDF8"/><text x="330" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#BAE6FD" text-anchor="middle">1920: Non-Cooperation</text>
      <circle cx="515" cy="255" r="14" fill="#EC4899"/><text x="515" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FBCFE8" text-anchor="middle">1930: Dandi Salt March</text>
      <circle cx="700" cy="255" r="14" fill="#22C55E"/><text x="700" y="215" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#86EFAC" text-anchor="middle">1942 Quit India → 1947</text>
      <rect x="120" y="435" width="600" height="44" rx="10" fill="#1E293B" stroke="#22C55E" stroke-width="1.5"/>
      <text x="420" y="462" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#DCFCE7" text-anchor="middle">Swadeshi (1905) → Non-Cooperation (1920) → Purna Swaraj &amp; Dandi (1930) → Quit India (1942) → Aug 15, 1947</text>
    </svg>`
  },

  // 21. PLATE TECTONICS (Convergent Subduction, Divergent Ridge & Mantle Convection)
  plate_tectonics: {
    topic: 'Plate Tectonics and Earth Interior',
    subtopic: 'Lithospheric Plates, Asthenosphere Convection, Subduction Zones & Mid-Ocean Ridges',
    subject: 'Geography',
    visualType: 'geological_cross_section',
    title: 'Plate Tectonics: Mantle Convection, Divergent Ridge & Convergent Subduction',
    caption: 'Geological cross-section illustrating thermal convection currents in the Asthenosphere driving seafloor spreading at Divergent Mid-Ocean Ridges and trench subduction beneath Continental Crust.',
    labels: [
      { id: 'divergent_ridge', name: 'Divergent Boundary (Mid-Ocean Ridge)', x: 240, y: 220, role: 'Upwelling magma creates new basaltic oceanic lithosphere (Seafloor Spreading).', color: '#F59E0B' },
      { id: 'subduction_trench', name: 'Convergent Subduction Zone & Trench', x: 540, y: 260, role: 'Dense oceanic plate (3.0 g/cm³) subducts beneath buoyant continental crust (2.7 g/cm³).', color: '#EF4444' },
      { id: 'volcanic_arc', name: 'Continental Volcanic Arc / Fold Mountains', x: 680, y: 175, role: 'Partial melting of subducting slab forms explosive composite volcanoes and fold mountains.', color: '#22C55E' },
      { id: 'mantle_convection', name: 'Asthenosphere Convection Cells', x: 380, y: 390, role: 'Thermal buoyancy loops in upper mantle driving plate motion (2–10 cm/year).', color: '#FB923C' }
    ],
    walkthrough: {
      whatItShows: 'Complete tectonic cycle showing lithosphere creation at a mid-ocean ridge and lithosphere destruction at a convergent subduction trench.',
      importantComponents: [
        'Divergent Boundary: Plates pull apart; magma rises to form Mid-Atlantic Ridge.',
        'Convergent Boundary: Dense oceanic crust subducts into the mantle, forming deep ocean trenches (Mariana Trench) and volcanic arcs (Andes) or fold mountains (Himalayas: Indo-Australian + Eurasian collision).',
        'Transform Boundary: Plates slide horizontally past each other along strike-slip faults (San Andreas Fault).'
      ],
      processSequence: [
        '1. Mantle Upwelling: Radioactive decay heats the lower mantle, driving rising convection plumes.',
        '2. Seafloor Spreading & Ridge Push: New oceanic crust spreads laterally from the mid-ocean ridge.',
        '3. Slab Pull & Subduction: Cold, dense oceanic lithosphere sinks into the asthenosphere at trenches, triggering flux melting and volcanism.'
      ],
      examTakeaway: 'Why were the Himalayas formed? Collision of two CONTINENTAL plates (Indo-Australian Plate and Eurasian Plate) folded the Tethys Sea sediments upward because neither continental plate was dense enough to subduct deeply!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Plate Tectonics — Mid-Ocean Divergent Ridge, Subduction Trench &amp; Mantle Convection</text>
      <rect x="60" y="280" width="720" height="150" rx="12" fill="#7C2D12" stroke="#F97316" stroke-width="2"/>
      <text x="360" y="385" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FFEDD5" text-anchor="middle">Asthenosphere Mantle Convection Loops (Slab Pull &amp; Ridge Push)</text>
      <path d="M 60 225 L 220 205 L 250 235 L 280 205 L 520 235 L 610 345" fill="none" stroke="#64748B" stroke-width="24"/>
      <polygon points="520,230 580,155 650,230 780,230 780,280 520,280" fill="#15803D" stroke="#86EFAC" stroke-width="2"/>
      <circle cx="580" cy="155" r="8" fill="#EF4444"/>
      <text x="250" y="175" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">Divergent Ridge ↑</text>
      <text x="515" y="195" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Subduction Trench ↘</text>
      <text x="670" y="145" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FCA5A5" text-anchor="middle">Volcanic Arc / Fold Mtns</text>
      <rect x="120" y="445" width="600" height="40" rx="10" fill="#1E293B" stroke="#F97316" stroke-width="1.5"/>
      <text x="420" y="470" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFEDD5" text-anchor="middle">3 Boundary Types: Divergent (Constructive)  |  Convergent (Destructive/Collision)  |  Transform (Conservative)</text>
    </svg>`
  },

  // 22. ENGLISH GRAMMAR (Syntax Tree, Clauses, Tenses & Active/Passive Transformation)
  english_grammar: {
    topic: 'English Grammar and Sentence Structure',
    subtopic: 'Parts of Speech, Subject-Verb-Object Syntax, Tense Matrix & Active-Passive Voice',
    subject: 'English',
    visualType: 'historical_timeline_infographic',
    title: 'English Grammar: Syntactic Parse Tree, Parts of Speech & Voice Transformation',
    caption: 'Hierarchical syntactic structure splitting a clause into Subject (Noun Phrase) and Predicate (Verb Phrase + Object) alongside Active-to-Passive Voice transformation rules.',
    labels: [
      { id: 'subject_np', name: 'Subject Noun Phrase (NP)', x: 240, y: 210, role: 'Performer of the action (Determiner + Adjective + Head Noun); governs Verb agreement.', color: '#38BDF8' },
      { id: 'predicate_vp', name: 'Predicate Verb Phrase (VP)', x: 580, y: 210, role: 'Contains finite transitive/intransitive verb, direct object, and adverbial modifiers.', color: '#F59E0B' },
      { id: 'voice_transform', name: 'Active ↔ Passive Transformation', x: 420, y: 370, role: 'S + V + O transforms to O + Auxiliary(be) + V₃ (Past Participle) + by + S.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Structural syntax tree of an English declarative sentence alongside the structural cross-mapping that converts Active Voice to Passive Voice.',
      importantComponents: [
        'Subject-Verb Agreement (Concord): Singular subjects require singular verbs; collective nouns and "neither...nor" follow proximity concord.',
        'Tense Aspect Grid: 3 Times (Past, Present, Future) × 4 Aspects (Simple, Continuous, Perfect, Perfect Continuous) = 12 Tenses.',
        'Passive Voice Rule: Object becomes grammatical Subject, main verb shifts to Past Participle (V₃) preceded by tense-matched form of "to be".'
      ],
      processSequence: [
        '1. Parse Clause: Identify the finite verb first, ask "Who/What?" to locate Subject, and "Whom/What?" to locate Direct Object.',
        '2. Verify Concord & Tense: Match singular/plural verb inflection and sequence of tenses.',
        '3. Transform Voice/Speech: Apply O + be + V₃ + by + S for Passive, or backshift tense for Indirect Speech.'
      ],
      examTakeaway: 'In "Neither the teacher nor the students WERE present", the verb agrees with the CLOSER subject ("students")! In "Each of the players IS ready", "Each" is always singular!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">English Grammar — Syntactic Clause Tree, Concord &amp; Active-to-Passive Voice</text>
      <rect x="310" y="75" width="220" height="44" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
      <text x="420" y="102" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FEF08A" text-anchor="middle">Sentence (Clause = NP + VP)</text>
      <line x1="370" y1="119" x2="240" y2="180" stroke="#94A3B8" stroke-width="3"/>
      <line x1="470" y1="119" x2="600" y2="180" stroke="#94A3B8" stroke-width="3"/>
      <rect x="130" y="180" width="220" height="52" rx="10" fill="#1E3A8A" stroke="#38BDF8" stroke-width="2"/>
      <text x="240" y="211" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#E0F2FE" text-anchor="middle">Subject (NP): The diligent student</text>
      <rect x="490" y="180" width="220" height="52" rx="10" fill="#064E3B" stroke="#34D399" stroke-width="2"/>
      <text x="600" y="211" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#D1FAE5" text-anchor="middle">Predicate (VP): solved the theorem</text>
      <rect x="130" y="310" width="580" height="85" rx="12" fill="#1E293B" stroke="#A855F7" stroke-width="2"/>
      <text x="420" y="340" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#E9D5FF" text-anchor="middle">Active Voice: Subject (S) + Finite Verb (V) + Direct Object (O)</text>
      <text x="420" y="372" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#86EFAC" text-anchor="middle">Passive Voice: Object (O) + Auxiliary [be] + Past Participle (V₃) + by + Subject (S)</text>
      <rect x="130" y="435" width="580" height="42" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="420" y="461" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#E0F2FE" text-anchor="middle">8 Parts of Speech: Noun • Pronoun • Verb • Adjective • Adverb • Preposition • Conjunction • Interjection</text>
    </svg>`
  },

  // 23. COMPUTER SCIENCE (Binary Search O(log n) & Von Neumann Architecture)
  computer_science: {
    topic: 'Computer Science and Algorithms',
    subtopic: 'Binary Search Divide-and-Conquer O(log₂ n), Data Structures & CPU Execution',
    subject: 'Computer Science',
    visualType: 'physics_vector_schematic',
    title: 'Computer Science: Binary Search Divide-and-Conquer O(log₂ n) Trace',
    caption: 'Step-by-step execution trace of Binary Search locating target=23 in a sorted 9-element array by halving the search space via mid = ⌊(low + high) / 2⌋.',
    labels: [
      { id: 'sorted_array', name: 'Sorted Array Precondition', x: 420, y: 135, role: 'Monotonically sorted elements enabling O(log₂ n) logarithmic halving.', color: '#38BDF8' },
      { id: 'midpoint_pivot', name: 'Midpoint Comparison (mid = ⌊(low+high)/2⌋)', x: 420, y: 245, role: 'Compares arr[mid] against target; eliminates 50% of remaining elements per step.', color: '#F59E0B' },
      { id: 'target_found', name: 'Target Found at Index 5 (Value = 23)', x: 510, y: 355, role: 'Achieves search in ≤ ⌈log₂ N⌉ comparisons vs O(N) linear scan.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Iterative pointer narrowing (low, mid, high) in Binary Search finding target 23 in just 2 comparisons instead of scanning every index.',
      importantComponents: [
        'Precondition: Array MUST be sorted in ascending/descending order before Binary Search can be applied.',
        'Safe Midpoint Formula: mid = low + Math.floor((high - low) / 2) prevents 32-bit integer overflow.',
        'Asymptotic Complexity: Time O(log₂ n) worst/average case, O(1) best case; Iterative Space O(1).'
      ],
      processSequence: [
        '1. Iteration 1: low=0, high=7 → mid=3 (arr[3]=16 < 23), discard left half by setting low = mid + 1 = 4.',
        '2. Iteration 2: low=4, high=7 → mid=5 (arr[5]=23 == 23), target found at index 5!',
        '3. Termination: Returns index 5 (or -1 if low > high).'
      ],
      examTakeaway: 'For N = 1,000,000 sorted elements, Linear Search takes up to 1,000,000 comparisons, whereas Binary Search takes at most ⌈log₂(1,000,000)⌉ = 20 comparisons!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="24" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">Computer Science — Binary Search Divide-and-Conquer O(log₂ n) Execution Trace</text>
      <text x="420" y="82" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">Step 1: Search Target = 23  |  low = 0, high = 7 → mid = 3 (arr[3] = 16 &lt; 23 → Discard Left Half)</text>
      <g font-family="Inter, sans-serif" font-size="14" font-weight="800" text-anchor="middle">
        <rect x="120" y="100" width="70" height="50" rx="6" fill="#1E293B" stroke="#475569"/><text x="155" y="130" fill="#64748B">2</text>
        <rect x="195" y="100" width="70" height="50" rx="6" fill="#1E293B" stroke="#475569"/><text x="230" y="130" fill="#64748B">5</text>
        <rect x="270" y="100" width="70" height="50" rx="6" fill="#1E293B" stroke="#475569"/><text x="305" y="130" fill="#64748B">8</text>
        <rect x="345" y="100" width="70" height="50" rx="6" fill="#78350F" stroke="#F59E0B" stroke-width="3"/><text x="380" y="130" fill="#FDE047">16 (mid)</text>
        <rect x="420" y="100" width="70" height="50" rx="6" fill="#1E3A8A" stroke="#60A5FA"/><text x="455" y="130" fill="#FFFFFF">19</text>
        <rect x="495" y="100" width="70" height="50" rx="6" fill="#1E3A8A" stroke="#60A5FA"/><text x="530" y="130" fill="#FFFFFF">23</text>
        <rect x="570" y="100" width="70" height="50" rx="6" fill="#1E3A8A" stroke="#60A5FA"/><text x="605" y="130" fill="#FFFFFF">38</text>
        <rect x="645" y="100" width="70" height="50" rx="6" fill="#1E3A8A" stroke="#60A5FA"/><text x="680" y="130" fill="#FFFFFF">56</text>
      </g>
      <text x="420" y="225" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">Step 2: low = 4, high = 7 → mid = 5 (arr[5] = 23 == Target → FOUND at Index 5!)</text>
      <g font-family="Inter, sans-serif" font-size="14" font-weight="800" text-anchor="middle">
        <rect x="420" y="245" width="70" height="55" rx="6" fill="#1E3A8A" stroke="#60A5FA"/><text x="455" y="278" fill="#FFFFFF">19</text>
        <rect x="495" y="245" width="70" height="55" rx="6" fill="#14532D" stroke="#22C55E" stroke-width="3"/><text x="530" y="278" fill="#86EFAC">23 ✓</text>
        <rect x="570" y="245" width="70" height="55" rx="6" fill="#1E3A8A" stroke="#60A5FA"/><text x="605" y="278" fill="#FFFFFF">38</text>
        <rect x="645" y="245" width="70" height="55" rx="6" fill="#1E3A8A" stroke="#60A5FA"/><text x="680" y="278" fill="#FFFFFF">56</text>
      </g>
      <rect x="130" y="435" width="580" height="44" rx="10" fill="#1E293B" stroke="#22C55E" stroke-width="1.5"/>
      <text x="420" y="462" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#DCFCE7" text-anchor="middle">mid = low + ⌊(high - low)/2⌋  |  Time Complexity: O(log₂ n)  |  Auxiliary Space: O(1) Iterative</text>
    </svg>`
  },
// 24. DOUBLE CIRCULATION (Pulmonary & Systemic Circuits with Blood Pressure Values)
  double_circulation: {
    topic: 'Human Double Circulation System',
    subtopic: 'Pulmonary and Systemic Loops, Pressure Gradients and Oxygenation Cycle',
    subject: 'Biology',
    visualType: 'biological_process_diagram',
    title: 'Double Circulation: Pulmonary and Systemic Closed Circuits',
    caption: 'Schematic of human double circulation showing the low-pressure pulmonary circuit (~25/10 mmHg) and high-pressure systemic circuit (~120/80 mmHg) with directional blood flow.',
    labels: [
      { id: 'pulmonary_circuit', name: 'Pulmonary Circuit', x: 260, y: 110, role: 'Deoxygenated blood pumped from RV to lungs; returns oxygenated to LA.', color: '#38BDF8' },
      { id: 'systemic_circuit', name: 'Systemic Circuit', x: 580, y: 360, role: 'Oxygenated blood pumped from LV via Aorta to body tissues; returns deoxygenated via Vena Cava to RA.', color: '#EF4444' },
      { id: 'lungs_capillaries', name: 'Alveolar Capillary Bed (Lungs)', x: 420, y: 80, role: 'Site of pulmonary gas exchange: CO₂ leaves blood, O₂ binds hemoglobin.', color: '#0284C7' },
      { id: 'body_capillaries', name: 'Systemic Capillary Bed (Organs & Muscles)', x: 420, y: 410, role: 'Site of internal respiration: cells extract O₂ for ATP production and release CO₂.', color: '#B91C1C' },
      { id: 'four_chamber_pump', name: 'Cardiac Central Dual Pump', x: 420, y: 240, role: 'Right side drives low-pressure pulmonary loop; left side drives high-pressure systemic loop.', color: '#F59E0B' }
    ],
    walkthrough: {
      whatItShows: 'Complete double circulation loop showing why blood passes through the human heart twice in every single systemic journey.',
      importantComponents: [
        'Pulmonary Circuit: Right Ventricle → Pulmonary Trunk & Arteries → Lungs Capillaries → Pulmonary Veins → Left Atrium. Operates at low pressure (~25/10 mmHg) to protect delicate alveolar membranes.',
        'Systemic Circuit: Left Ventricle → Ascending Aorta → Systemic Arteries → Capillary Beds in Brain & Viscera → Venae Cavae → Right Atrium. Operates at high pressure (~120/80 mmHg) to overcome systemic vascular resistance.',
        'Complete Physical Separation: The muscular septum prevents mixing of oxygenated (arterial) and deoxygenated (venous) blood, maximizing aerobic metabolic efficiency for endothermic homeotherms.'
      ],
      processSequence: [
        '1. Systemic deoxygenated blood from tissues enters the Right Atrium through the Superior & Inferior Vena Cava.',
        '2. The Right Atrium empties through the Tricuspid Valve into the Right Ventricle.',
        '3. The Right Ventricle ejects blood into the Pulmonary Trunk toward the lungs (Pulmonary Circulation).',
        '4. Carbon dioxide is eliminated and oxygen is absorbed in the pulmonary capillaries.',
        '5. Four Pulmonary Veins return oxygenated blood to the Left Atrium.',
        '6. The Left Ventricle contracts forcefully, pumping oxygenated blood into the Aorta to nourish the entire body (Systemic Circulation).'
      ],
      examTakeaway: 'In single circulation (fish), blood passes through the heart once per circuit under low pressure. In human double circulation, blood is repressurized by the left ventricle before systemic delivery, sustaining high mammalian metabolic rates.'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Human Double Circulation — Pulmonary &amp; Systemic Closed Circuits</text>
      <text x="420" y="56" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Body → Right Heart → Lungs → Left Heart → Body (Figure-8 Circuit)</text>

      <!-- TOP: LUNGS (Anatomical Bilobed Silhouette & Capillary Network) -->
      <g id="lungs_capillaries" transform="translate(320, 70)">
        <path d="M 40 10 C 10 20, 5 60, 20 85 C 35 105, 80 105, 90 75 C 95 60, 90 25, 60 10 Z" fill="#0369A1" stroke="#38BDF8" stroke-width="2" opacity="0.85"/>
        <path d="M 160 10 C 190 20, 195 60, 180 85 C 165 105, 120 105, 110 75 C 105 60, 110 25, 140 10 Z" fill="#991B1B" stroke="#F87171" stroke-width="2" opacity="0.85"/>
        <path d="M 85 45 Q 100 35 115 45 Q 100 55 85 45" stroke="#F59E0B" stroke-width="3" fill="none"/>
        <text x="100" y="48" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">LUNGS</text>
        <text x="100" y="66" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#BAE6FD" text-anchor="middle">Alveolar Gas Exchange</text>
        <text x="100" y="80" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#FEF08A" text-anchor="middle">O₂ in • CO₂ out</text>
      </g>

      <!-- CENTER: THE HEART (Anatomical Dual-Pump 4-Chamber Structure) -->
      <g id="four_chamber_pump" transform="translate(310, 190)">
        <path d="M 20 30 C 0 70, 30 130, 110 155 C 190 130, 220 70, 200 30 C 180 0, 130 5, 110 20 C 90 5, 40 0, 20 30 Z" fill="#1E293B" stroke="#475569" stroke-width="3"/>
        <!-- Right Heart (Blue) -->
        <path d="M 35 35 C 25 70, 50 120, 105 140 L 105 35 Z" fill="#1D4ED8" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="70" y="70" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">RA</text>
        <text x="70" y="110" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">RV</text>
        <line x1="45" y1="85" x2="95" y2="85" stroke="#FDE047" stroke-width="2" stroke-dasharray="4 2"/>

        <!-- Left Heart (Red) -->
        <path d="M 185 35 C 195 70, 170 120, 115 140 L 115 35 Z" fill="#DC2626" stroke="#F87171" stroke-width="1.5"/>
        <text x="150" y="70" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">LA</text>
        <text x="150" y="110" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">LV</text>
        <line x1="125" y1="85" x2="175" y2="85" stroke="#FDE047" stroke-width="2" stroke-dasharray="4 2"/>

        <!-- Central Septum -->
        <line x1="110" y1="25" x2="110" y2="150" stroke="#FDE047" stroke-width="3"/>
      </g>

      <!-- BOTTOM: BODY TISSUES & ORGANS (Systemic Microcirculation) -->
      <g id="body_capillaries" transform="translate(300, 375)">
        <rect x="0" y="0" width="240" height="75" rx="14" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
        <text x="120" y="24" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">BODY TISSUES &amp; ORGANS</text>
        <text x="120" y="44" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#F87171" text-anchor="middle">Cellular Respiration (ATP)</text>
        <text x="120" y="60" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#BAE6FD" text-anchor="middle">O₂ delivered • CO₂ collected</text>
      </g>

      <!-- PULMONARY CIRCUIT PATHWAYS (Top Loop) -->
      <!-- 1. RV to Lungs via Pulmonary Artery -->
      <path id="pulmonary_circuit" d="M 350 230 C 250 190, 250 120, 340 98" stroke="#0284C7" stroke-width="7" fill="none" stroke-linecap="round"/>
      <polygon points="345,95 330,90 338,105" fill="#38BDF8"/>
      <text x="210" y="150" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle">Pulmonary Artery</text>
      <text x="210" y="168" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#BAE6FD" text-anchor="middle">(~25 mmHg Deoxy)</text>

      <!-- 2. Lungs to LA via Pulmonary Veins -->
      <path d="M 500 98 C 590 120, 590 190, 490 230" stroke="#EF4444" stroke-width="7" fill="none" stroke-linecap="round"/>
      <polygon points="485,232 500,227 495,240" fill="#EF4444"/>
      <text x="630" y="150" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#F87171" text-anchor="middle">Pulmonary Veins</text>
      <text x="630" y="168" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#FECACA" text-anchor="middle">(Oxygen-Rich Blood)</text>

      <!-- SYSTEMIC CIRCUIT PATHWAYS (Bottom Loop) -->
      <!-- 3. LV to Body via Aorta Arch -->
      <path id="systemic_circuit" d="M 470 310 C 620 340, 620 405, 545 415" stroke="#DC2626" stroke-width="8" fill="none" stroke-linecap="round"/>
      <polygon points="540,416 553,407 553,423" fill="#DC2626"/>
      <text x="655" y="360" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#F87171" text-anchor="middle">Systemic Aorta</text>
      <text x="655" y="380" font-family="Inter, sans-serif" font-size="10.5" font-weight="800" fill="#FEF08A" text-anchor="middle">120 mmHg Systolic</text>

      <!-- 4. Body to RA via Vena Cava -->
      <path d="M 295 415 C 220 405, 220 340, 370 310" stroke="#1D4ED8" stroke-width="8" fill="none" stroke-linecap="round"/>
      <polygon points="375,308 362,302 362,318" fill="#38BDF8"/>
      <text x="185" y="360" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#38BDF8" text-anchor="middle">Vena Cava</text>
      <text x="185" y="380" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#BAE6FD" text-anchor="middle">Systemic Venous Return</text>

      <!-- Bottom Summary Banner -->
      <rect x="80" y="470" width="680" height="34" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
      <text x="420" y="492" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#F8FAFC" text-anchor="middle">Pulmonary Circuit (Low Resistance ~25 mmHg)  |  Systemic Circuit (High Resistance ~120 mmHg)</text>
    </svg>`
  },

  // 25. CARDIAC CONDUCTION (SA Node, AV Node, Bundle of His, Purkinje & Synchronized ECG)
  cardiac_conduction: {
    topic: 'Cardiac Conduction System and ECG Correlation',
    subtopic: 'SA Node Pacemaker, AV Delay, Bundle of His, Purkinje Fibers and P-QRS-T Waveforms',
    subject: 'Biology',
    visualType: 'anatomical_cross_section',
    title: 'Cardiac Conduction System: Intrinsic Pacemaker and Electrocardiogram (ECG) Synchronization',
    caption: 'Anatomical mapping of myocardial electrical excitation from the SA node through the AV node, Bundle of His, and Purkinje fibers with correlated P-QRS-T ECG deflection waves.',
    labels: [
      { id: 'sa_node', name: 'Sinoatrial (SA) Node', x: 250, y: 155, role: 'Primary pacemaker located in posterior wall of RA near SVC; spontaneously generates 70–80 action potentials/min.', color: '#FBBF24' },
      { id: 'av_node', name: 'Atrioventricular (AV) Node', x: 345, y: 220, role: 'Introduces a vital 0.1-second delay, allowing the atria to fully empty into ventricles before ventricular systole.', color: '#F59E0B' },
      { id: 'bundle_of_his', name: 'Bundle of His & Bundle Branches', x: 380, y: 290, role: 'Conducts electrical impulses down the interventricular septum to the left and right ventricles.', color: '#38BDF8' },
      { id: 'purkinje_fibers', name: 'Subendocardial Purkinje Network', x: 280, y: 390, role: 'Rapid conduction fibers (2–4 m/s) triggering simultaneous upward ventricular contraction from apex to base.', color: '#22C55E' },
      { id: 'ecg_correlation', name: 'Synchronized Surface ECG (Lead II)', x: 670, y: 220, role: 'P wave (atrial depolarization), PR segment (AV delay), QRS complex (ventricular depolarization), T wave (ventricular repolarization).', color: '#A855F7' }
    ],
    walkthrough: {
      whatItShows: 'The intrinsic neuromuscular conduction system regulating automatic rhythmic cardiac contractions and its direct correlation to clinical ECG waveforms.',
      importantComponents: [
        'Sinoatrial (SA) Node: Inherent automaticity driven by funny sodium current (If) and transient Ca²⁺ influx; sets normal sinus rhythm (72 bpm).',
        'AV Nodal Delay: 0.10s pause caused by small-diameter myocytes and fewer gap junctions, ensuring complete ventricular end-diastolic filling.',
        'Bundle of His & Purkinje System: Fast conducting pathways insulated by fibrous rings, ensuring contraction begins at the apex to wring blood upward into the aorta and pulmonary trunk.'
      ],
      processSequence: [
        '1. SA node spontaneously fires: action potential sweeps across atria producing the ECG P Wave.',
        '2. Impulse arrives at AV node: held for 0.1s represented by the isoelectric PR Segment.',
        '3. Impulse enters Bundle of His and descends Left and Right Bundle Branches in the septum.',
        '4. Purkinje fibers deliver impulse to ventricular myocardium: generates the prominent sharp QRS Complex.',
        '5. Ventricles contract (Systole) ejecting stroke volume (~70 mL).',
        '6. Ventricular repolarization occurs, producing the smooth upward deflection of the T Wave.'
      ],
      examTakeaway: 'If the SA node fails, the AV node assumes pacing at 40–60 bpm (nodal rhythm). If AV conduction is blocked (complete heart block), atria and ventricles beat independently (AV dissociation).'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Cardiac Conduction System &amp; Correlated Electrocardiogram (ECG)</text>
      <text x="420" y="56" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">SA Node (72 bpm) → Internodal Tracts → AV Node (0.1s delay) → Bundle of His → Purkinje Network</text>

      <!-- LEFT: ANATOMICAL HEART WITH ELECTRICAL SYSTEM -->
      <g transform="translate(40, 80)">
        <!-- Heart Myocardium Outline -->
        <path d="M 120 70 C 80 130, 100 240, 200 320 C 230 340, 260 340, 290 320 C 390 240, 410 130, 370 70 C 350 30, 290 20, 245 40 C 200 20, 140 30, 120 70 Z" fill="#1E293B" stroke="#475569" stroke-width="3"/>

        <!-- 1. Sinoatrial (SA) Node in RA posterior wall -->
        <circle id="sa_node" cx="170" cy="85" r="14" fill="#FBBF24" stroke="#FDE047" stroke-width="3"/>
        <text x="170" y="90" font-family="Inter, sans-serif" font-size="10" font-weight="900" fill="#78350F" text-anchor="middle">SA</text>

        <!-- Internodal Pathways -->
        <path d="M 180 95 Q 220 120, 235 145" stroke="#FDE047" stroke-width="4" stroke-dasharray="6 3" fill="none"/>

        <!-- 2. Atrioventricular (AV) Node in interatrial septum -->
        <circle id="av_node" cx="240" cy="155" r="12" fill="#F59E0B" stroke="#FDE047" stroke-width="3"/>
        <text x="240" y="159" font-family="Inter, sans-serif" font-size="9.5" font-weight="900" fill="#78350F" text-anchor="middle">AV</text>

        <!-- 3. Bundle of His -->
        <line id="bundle_of_his" x1="245" y1="167" x2="250" y2="210" stroke="#38BDF8" stroke-width="6"/>

        <!-- 4. Left and Right Bundle Branches -->
        <path d="M 250 210 Q 210 250, 185 285" stroke="#38BDF8" stroke-width="4" fill="none"/>
        <path d="M 250 210 Q 285 250, 310 285" stroke="#38BDF8" stroke-width="4" fill="none"/>

        <!-- 5. Purkinje Fibers Network -->
        <g id="purkinje_fibers" stroke="#4ADE80" stroke-width="2.5" stroke-dasharray="4 2" fill="none">
          <path d="M 185 285 Q 140 260, 135 190"/>
          <path d="M 185 285 Q 160 295, 150 250"/>
          <path d="M 310 285 Q 355 260, 360 190"/>
          <path d="M 310 285 Q 335 295, 345 250"/>
        </g>

        <!-- SA Node Callout -->
        <rect x="0" y="55" width="130" height="42" rx="8" fill="#1E293B" stroke="#FDE047" stroke-width="1.5"/>
        <text x="65" y="73" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FDE047" text-anchor="middle">1. SA Node</text>
        <text x="65" y="88" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#FEF08A" text-anchor="middle">70–80 bpm Pacemaker</text>
        <line x1="130" y1="75" x2="156" y2="82" stroke="#FDE047" stroke-width="1.5"/>

        <!-- AV Node Callout -->
        <rect x="0" y="140" width="135" height="42" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="67" y="158" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#FBBF24" text-anchor="middle">2. AV Node</text>
        <text x="67" y="173" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#FEF08A" text-anchor="middle">0.1s AV Delay</text>
        <line x1="135" y1="160" x2="228" y2="156" stroke="#F59E0B" stroke-width="1.5"/>

        <!-- Purkinje Callout -->
        <rect x="0" y="270" width="135" height="42" rx="8" fill="#1E293B" stroke="#4ADE80" stroke-width="1.5"/>
        <text x="67" y="288" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#4ADE80" text-anchor="middle">3. Purkinje Fibers</text>
        <text x="67" y="303" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#DCFCE7" text-anchor="middle">Apex-Up Contraction</text>
      </g>

      <!-- RIGHT: SYNCHRONIZED ECG LEAD II WAVEFORM -->
      <g id="ecg_correlation" transform="translate(510, 80)">
        <rect x="0" y="0" width="290" height="350" rx="14" fill="#1E293B" stroke="#A855F7" stroke-width="2"/>
        <text x="145" y="28" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#E9D5FF" text-anchor="middle">Surface ECG Waveform (Lead II)</text>

        <!-- Grid Lines for ECG background -->
        <g stroke="#334155" stroke-width="0.75" stroke-dasharray="3 3">
          <line x1="20" y1="70" x2="270" y2="70"/>
          <line x1="20" y1="120" x2="270" y2="120"/>
          <line x1="20" y1="170" x2="270" y2="170"/>
          <line x1="20" y1="220" x2="270" y2="220"/>
          <line x1="70" y1="40" x2="70" y2="250"/>
          <line x1="120" y1="40" x2="120" y2="250"/>
          <line x1="170" y1="40" x2="170" y2="250"/>
          <line x1="220" y1="40" x2="220" y2="250"/>
        </g>

        <!-- Actual ECG Trace Line (P - Q - R - S - T) -->
        <path d="M 20 170 L 50 170 C 60 150, 75 150, 85 170 L 105 170 L 115 180 L 130 80 L 145 200 L 155 170 L 180 170 C 195 135, 220 135, 235 170 L 270 170" fill="none" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round"/>

        <!-- Annotations: P Wave -->
        <circle cx="67" cy="155" r="4" fill="#FBBF24"/>
        <text x="67" y="142" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FDE047" text-anchor="middle">P</text>

        <!-- Annotations: Q, R, S -->
        <circle cx="115" cy="180" r="3" fill="#38BDF8"/>
        <text x="110" y="196" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#38BDF8">Q</text>
        <circle cx="130" cy="80" r="4" fill="#EF4444"/>
        <text x="130" y="68" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#F87171" text-anchor="middle">R</text>
        <circle cx="145" cy="200" r="3" fill="#38BDF8"/>
        <text x="150" y="214" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#38BDF8">S</text>

        <!-- Annotations: T Wave -->
        <circle cx="207" cy="145" r="4" fill="#A855F7"/>
        <text x="207" y="132" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#E9D5FF" text-anchor="middle">T</text>

        <!-- ECG Legend description -->
        <rect x="15" y="240" width="260" height="95" rx="8" fill="#0F172A" stroke="#475569" stroke-width="1"/>
        <text x="25" y="260" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#FDE047">• P Wave: Atrial Depolarization (SA firing)</text>
        <text x="25" y="278" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#BAE6FD">• PR Interval: AV Conduction Delay (0.12–0.20s)</text>
        <text x="25" y="296" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#86EFAC">• QRS: Ventricular Depolarization &amp; Systole</text>
        <text x="25" y="314" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#E9D5FF">• T Wave: Ventricular Repolarization (Diastole)</text>
      </g>

      <!-- Bottom Diagnostic Note -->
      <rect x="80" y="460" width="680" height="40" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="420" y="484" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FEF3C7" text-anchor="middle">Clinical Correlation: Arrhythmias &amp; Heart Blocks occur when conduction fails at SA node or AV bundle</text>
    </svg>`
  },

  // 26. CHLOROPLAST STRUCTURE (Ultrastructure: Envelope, Stroma, Thylakoid Grana, Lamellae, cpDNA)
  chloroplast_structure: {
    topic: 'Chloroplast Ultrastructure and Photosynthetic Thylakoids',
    subtopic: 'Double Envelope, Stroma Matrix, Thylakoid Grana Discs, Stroma Lamellae and cpDNA',
    subject: 'Biology',
    visualType: 'biological_process_diagram',
    title: 'Chloroplast Ultrastructure: Organelle of Photosynthesis',
    caption: 'High-resolution cutaway diagram of the chloroplast showing double membrane envelope, aqueous stroma, stacked thylakoid grana, unstacked stroma lamellae, and endosymbiotic circular DNA.',
    labels: [
      { id: 'outer_inner_membrane', name: 'Double Membrane Envelope', x: 190, y: 130, role: 'Outer membrane has porins; inner membrane contains selective transport proteins; encloses intermembrane space.', color: '#10B981' },
      { id: 'stroma_matrix', name: 'Aqueous Stroma Matrix', x: 260, y: 360, role: 'Alkaline fluid containing RuBisCO, 70S ribosomes, circular cpDNA; site of light-independent Calvin Cycle.', color: '#047857' },
      { id: 'grana_thylakoids', name: 'Stacked Thylakoid Grana', x: 440, y: 220, role: 'Membrane stacks housing Photosystems I & II, cytochrome b₆f, and ATP Synthase; site of light photolysis.', color: '#22C55E' },
      { id: 'stroma_lamellae', name: 'Stroma Lamellae (Frets)', x: 550, y: 310, role: 'Unstacked interconnecting tubular membranes linking grana; predominantly contain Photosystem I.', color: '#34D399' },
      { id: 'chloroplast_dna', name: 'Circular cpDNA & Ribosomes', x: 670, y: 170, role: 'Semi-autonomous prokaryotic-like circular chromosome and 70S ribosomes supporting Endosymbiotic Theory.', color: '#F59E0B' }
    ],
    walkthrough: {
      whatItShows: 'Detailed sub-cellular ultrastructure of the green plant chloroplast, illustrating spatial compartmentalization between light-harvesting grana and carbon-fixing stroma.',
      importantComponents: [
        'Thylakoid Grana: Discs packed with chlorophyll a, chlorophyll b, carotenoids, and electron carriers. Thylakoid lumen accumulates H⁺ ions creating proton motive force (pH ~4.5 vs stroma pH ~8.0).',
        'Stroma Matrix: Dense colloidal fluid containing RuBisCO (most abundant enzyme on Earth), responsible for carboxylation of Ribulose-1,5-bisphosphate (RuBP).',
        'Semi-Autonomous Organelle: Chloroplasts reproduce via binary fission and synthesize several of their own polypeptides using circular cpDNA and 70S ribosomes.'
      ],
      processSequence: [
        '1. Solar photons excite pigment molecules in Photosystem II located within thylakoid membranes.',
        '2. Water photolysis (2H₂O → O₂ + 4H⁺ + 4e⁻) replenishes electrons and releases molecular oxygen.',
        '3. Protons pumped across thylakoid membrane drive Chemiosmotic ATP Synthase into stroma.',
        '4. High-energy ATP and NADPH diffuse into the aqueous stroma to power the Calvin Cycle (CO₂ fixation into glucose).'
      ],
      examTakeaway: 'Light reaction occurs in THYLAKOID MEMBRANE (produces ATP, NADPH, O₂). Dark reaction / Calvin cycle occurs in the STROMA (consumes ATP, NADPH, fixes CO₂ into glucose).'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="chlorStromaGrad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#065F46"/>
          <stop offset="100%" stop-color="#022C22"/>
        </radialGradient>
      </defs>
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Chloroplast Ultrastructure — Organelle of Photosynthesis</text>
      <text x="420" y="56" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Double Envelope • Aqueous Stroma Matrix • Stacked Thylakoid Grana • Interconnecting Lamellae</text>

      <!-- OUTER & INNER DOUBLE MEMBRANE ENVELOPE -->
      <g id="outer_inner_membrane">
        <ellipse cx="420" cy="270" rx="360" ry="190" fill="#064E3B" stroke="#10B981" stroke-width="4"/>
        <ellipse cx="420" cy="270" rx="340" ry="172" fill="url(#chlorStromaGrad)" stroke="#34D399" stroke-width="2.5"/>
      </g>

      <!-- STROMA LAMELLAE -->
      <g id="stroma_lamellae" stroke="#34D399" stroke-width="5" stroke-linecap="round">
        <line x1="250" y1="260" x2="350" y2="240"/>
        <line x1="390" y1="240" x2="490" y2="270"/>
        <line x1="530" y1="270" x2="620" y2="250"/>
        <line x1="370" y1="310" x2="490" y2="330"/>
      </g>

      <!-- THYLAKOID GRANA STACKS -->
      <!-- Stack 1 -->
      <g id="grana_thylakoids" transform="translate(190, 190)">
        <ellipse cx="40" cy="90" rx="36" ry="10" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="80" rx="36" ry="10" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="70" rx="36" ry="10" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="60" rx="36" ry="10" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="50" rx="36" ry="10" fill="#22C55E" stroke="#BBF7D0" stroke-width="1.5"/>
        <text x="40" y="30" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#86EFAC" text-anchor="middle">Granum 1</text>
      </g>

      <!-- Stack 2 -->
      <g transform="translate(330, 160)">
        <ellipse cx="40" cy="110" rx="40" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="98" rx="40" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="86" rx="40" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="74" rx="40" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="62" rx="40" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="50" rx="40" ry="11" fill="#22C55E" stroke="#BBF7D0" stroke-width="1.5"/>
        <text x="40" y="30" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#86EFAC" text-anchor="middle">Granum 2</text>
      </g>

      <!-- Stack 3 -->
      <g transform="translate(470, 180)">
        <ellipse cx="40" cy="100" rx="38" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="88" rx="38" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="76" rx="38" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="64" rx="38" ry="11" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="40" cy="52" rx="40" ry="11" fill="#22C55E" stroke="#BBF7D0" stroke-width="1.5"/>
        <text x="40" y="32" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#86EFAC" text-anchor="middle">Granum 3</text>
      </g>

      <!-- Stack 4 -->
      <g transform="translate(600, 200)">
        <ellipse cx="36" cy="85" rx="34" ry="10" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="36" cy="74" rx="34" ry="10" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="36" cy="63" rx="34" ry="10" fill="#15803D" stroke="#86EFAC" stroke-width="1.5"/>
        <ellipse cx="36" cy="52" rx="36" ry="10" fill="#22C55E" stroke="#BBF7D0" stroke-width="1.5"/>
        <text x="36" y="32" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#86EFAC" text-anchor="middle">Granum 4</text>
      </g>

      <!-- STROMA INCLUSIONS -->
      <g id="chloroplast_dna">
        <path d="M 280 370 C 310 350, 340 370, 330 395 C 315 410, 270 410, 260 390 C 255 375, 270 365, 280 370 Z" fill="none" stroke="#FBBF24" stroke-width="2.5" stroke-dasharray="4 2"/>
        <text x="300" y="390" font-family="Inter, sans-serif" font-size="10" font-weight="900" fill="#FEF08A">cpDNA</text>
        <circle cx="360" cy="380" r="3.5" fill="#38BDF8"/>
        <circle cx="375" cy="390" r="3.5" fill="#38BDF8"/>
        <circle cx="430" cy="360" r="3.5" fill="#38BDF8"/>
        <ellipse cx="580" cy="365" rx="28" ry="15" fill="#FEF3C7" opacity="0.8" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="580" y="370" font-family="Inter, sans-serif" font-size="9.5" font-weight="800" fill="#78350F" text-anchor="middle">Starch Granule</text>
      </g>

      <!-- CALLOUT SITES -->
      <rect x="50" y="90" width="220" height="60" rx="10" fill="#1E293B" stroke="#22C55E" stroke-width="1.5"/>
      <text x="160" y="112" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#86EFAC" text-anchor="middle">Light Reaction (Grana)</text>
      <text x="160" y="128" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">• Water Photolysis (H₂O → O₂)</text>
      <text x="160" y="142" font-family="Inter, sans-serif" font-size="9.5" font-weight="600" fill="#BBF7D0" text-anchor="middle">• ATP &amp; NADPH Photophosphorylation</text>

      <rect x="570" y="90" width="220" height="60" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="680" y="112" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FDE047" text-anchor="middle">Dark Reaction (Stroma Matrix)</text>
      <text x="680" y="128" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">• Calvin Cycle (RuBisCO enzyme)</text>
      <text x="680" y="142" font-family="Inter, sans-serif" font-size="9.5" font-weight="600" fill="#FEF08A" text-anchor="middle">• CO₂ Fixation into Glucose (C₆H₁₂O₆)</text>

      <!-- Bottom Diagnostic Bar -->
      <rect x="80" y="470" width="680" height="34" rx="8" fill="#1E293B" stroke="#10B981" stroke-width="1.5"/>
      <text x="420" y="492" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#ECFDF5" text-anchor="middle">Endosymbiotic Evidence: Double membrane, autonomous circular cpDNA, and 70S prokaryotic-type ribosomes</text>
    </svg>`
  },

  // 27. MAGNETIC FIELDS (Bar Magnet Dipole Flux Loops & Solenoid B-Field)
  magnetic_fields: {
    topic: 'Magnetic Fields and Solenoid Electromagnetism',
    subtopic: 'Bar Magnet Dipole, Field Lines Direction, Solenoid Induction and Right-Hand Grip Rule',
    subject: 'Physics',
    visualType: 'physics_vector_schematic',
    title: 'Magnetic Fields: Bar Magnet Flux Loops, Neutral Points and Solenoid B-Field',
    caption: 'Vector depiction of closed continuous magnetic flux lines looping North to South outside and South to North inside a bar magnet, alongside a current-carrying solenoid coil.',
    labels: [
      { id: 'magnetic_dipole', name: 'Bar Magnet Dipole (N & S Poles)', x: 240, y: 220, role: 'North (red) and South (blue) poles; magnetic monopoles do not exist in nature (∇·B = 0).', color: '#EF4444' },
      { id: 'flux_lines', name: 'Continuous Magnetic Flux Lines', x: 240, y: 110, role: 'Closed continuous curves; tangent gives field direction; density indicates field strength B in Teslas.', color: '#38BDF8' },
      { id: 'solenoid_coil', name: 'Current-Carrying Solenoid Coil', x: 590, y: 220, role: 'Helical wire winding producing strong, uniform magnetic field B = μ₀·n·I along central interior axis.', color: '#F59E0B' },
      { id: 'right_hand_grip', name: 'Right-Hand Grip Rule', x: 590, y: 370, role: 'Fingers curl in direction of electric current I; thumb points toward the Magnetic North pole.', color: '#22C55E' }
    ],
    walkthrough: {
      whatItShows: 'Vector geometry of magnetic field lines around permanent dipoles and electromagnets, illustrating continuous closed flux loops and the right-hand grip rule.',
      importantComponents: [
        'External vs Internal Field: Magnetic field lines emerge from North pole and enter South pole externally, but continue from South to North internally, forming unbroken closed loops.',
        'No Magnetic Monopoles: Gauss\'s Law for Magnetism (Gauss: ∮ B · dA = 0) confirms cutting a magnet creates two smaller dipoles, never isolated poles.',
        'Uniform Solenoid Field: Inside a long tightly-wound solenoid, the magnetic field is uniform, parallel to axis, and calculated by B = μ₀ n I (where n = turns/length).'
      ],
      processSequence: [
        '1. Electric charge in motion creates a circulating magnetic field (Oersted\'s experiment).',
        '2. In ferromagnetic materials, unaligned electron spin domains align in parallel to form permanent poles.',
        '3. When electric current I passes through a helical solenoid, individual loop fields reinforce along the axis.',
        '4. Placing a soft iron core inside dramatically multiplies magnetic field strength (electromagnet).'
      ],
      examTakeaway: 'Magnetic field lines NEVER cross or intersect! If they did, a magnetic compass placed at the intersection would have to point in two different directions at once, which is physically impossible!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Magnetic Fields — Bar Magnet Dipole Loops &amp; Solenoid Electromagnet</text>
      <text x="420" y="56" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">External: North → South  |  Internal: South → North (Closed Continuous Flux Lines)</text>

      <!-- LEFT: BAR MAGNET DIPOLE WITH FIELD LINES -->
      <g id="magnetic_dipole" transform="translate(60, 90)">
        <path d="M 120 180 C 120 40, 260 40, 260 180" fill="none" stroke="#38BDF8" stroke-width="2"/>
        <path d="M 120 180 C 120 320, 260 320, 260 180" fill="none" stroke="#38BDF8" stroke-width="2"/>
        <path d="M 140 180 C 140 80, 240 80, 240 180" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
        <path d="M 140 180 C 140 280, 240 280, 240 180" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
        <polygon points="190,52 182,47 182,57" fill="#38BDF8"/>
        <polygon points="190,308 198,303 198,313" fill="#38BDF8"/>
        <polygon points="190,92 182,87 182,97" fill="#38BDF8"/>
        <polygon points="190,268 198,263 198,273" fill="#38BDF8"/>

        <!-- The Bar Magnet -->
        <rect x="130" y="160" width="60" height="40" fill="#DC2626" stroke="#EF4444" stroke-width="2"/>
        <text x="160" y="186" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF" text-anchor="middle">N</text>
        <rect x="190" y="160" width="60" height="40" fill="#1D4ED8" stroke="#38BDF8" stroke-width="2"/>
        <text x="220" y="186" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF" text-anchor="middle">S</text>

        <!-- Compass Needle -->
        <polygon points="190,44 196,52 184,52" fill="#EF4444"/>
        <polygon points="190,60 196,52 184,52" fill="#1D4ED8"/>
        <circle cx="190" cy="52" r="2" fill="#FFFFFF"/>

        <text x="190" y="340" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FEF08A" text-anchor="middle">Permanent Dipole (No Monopoles)</text>
      </g>

      <!-- RIGHT: HELICAL SOLENOID COIL & B-FIELD -->
      <g id="solenoid_coil" transform="translate(470, 90)">
        <rect x="0" y="15" width="310" height="340" rx="14" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
        <text x="155" y="44" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#FEF08A" text-anchor="middle">Helical Solenoid Electromagnet</text>

        <!-- Interior Uniform Field Lines -->
        <line x1="40" y1="170" x2="270" y2="170" stroke="#FBBF24" stroke-width="3"/>
        <line x1="40" y1="180" x2="270" y2="180" stroke="#FBBF24" stroke-width="3"/>
        <line x1="40" y1="190" x2="270" y2="190" stroke="#FBBF24" stroke-width="3"/>
        <polygon points="50,170 60,165 60,175" fill="#FBBF24"/>
        <polygon points="50,180 60,175 60,185" fill="#FBBF24"/>
        <polygon points="50,190 60,185 60,195" fill="#FBBF24"/>

        <!-- Helical Copper Wire Windings -->
        <g stroke="#F97316" stroke-width="5" fill="none" stroke-linecap="round">
          <ellipse cx="70" cy="180" rx="14" ry="40"/>
          <ellipse cx="110" cy="180" rx="14" ry="40"/>
          <ellipse cx="150" cy="180" rx="14" ry="40"/>
          <ellipse cx="190" cy="180" rx="14" ry="40"/>
          <ellipse cx="230" cy="180" rx="14" ry="40"/>
        </g>

        <!-- Current Arrows -->
        <text x="50" y="125" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#EF4444">North (Out)</text>
        <text x="220" y="125" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#38BDF8">South (In)</text>

        <!-- Formula Banner -->
        <rect x="25" y="245" width="260" height="50" rx="8" fill="#0F172A" stroke="#475569" stroke-width="1.5"/>
        <text x="155" y="268" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#4ADE80" text-anchor="middle">B = μ₀ · n · I</text>
        <text x="155" y="286" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#CBD5E1" text-anchor="middle">μ₀ = 4π×10⁻⁷ T·m/A  |  n = turns/meter</text>

        <text x="155" y="325" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#BAE6FD" text-anchor="middle">Right-Hand Grip Rule: Fingers = I, Thumb = N</text>
      </g>

      <!-- Bottom Principle Note -->
      <rect x="80" y="465" width="680" height="34" rx="8" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="420" y="487" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#F8FAFC" text-anchor="middle">Key Rule: Field lines NEVER intersect (a compass cannot point in two directions at once)</text>
    </svg>`
  },

  // 28. EARTH INTERNAL STRUCTURE (Radial Wedge: Crust, Lithosphere, Mantle, Outer Core, Inner Core)
  earth_layers: {
    topic: "Earth's Internal Structure and Geosphere Layers",
    subtopic: 'Crust, Lithosphere, Asthenosphere, Mantle, Liquid Outer Core and Solid Inner Core',
    subject: 'Geography',
    visualType: 'geological_cross_section',
    title: "Earth's Internal Structure: Radial Wedge, Convection Zones & Discontinuities",
    caption: 'Radial wedge cross-section from surface continental crust (0 km) down through mantle convection, Gutenberg boundary, liquid iron-nickel outer core, and solid inner core (6371 km).',
    labels: [
      { id: 'crust_lithosphere', name: 'Crust & Rigid Lithosphere (0–100 km)', x: 440, y: 80, role: 'Continental SiAl (30–50 km, granite) and Oceanic SiMa (5–10 km, basalt); broken into tectonic plates.', color: '#10B981' },
      { id: 'asthenosphere_mantle', name: 'Asthenosphere & Mantle (100–2900 km)', x: 440, y: 190, role: 'Semi-fluid ductile zone driving convection currents (slab pull/ridge push); silicates of Fe and Mg.', color: '#F97316' },
      { id: 'outer_core_liquid', name: 'Outer Core: Liquid Fe-Ni (2900–5150 km)', x: 440, y: 310, role: 'Molten iron-nickel generating Earth\'s geomagnetic field via geodynamo; blocks seismic S-waves.', color: '#EF4444' },
      { id: 'inner_core_solid', name: 'Inner Core: Solid Fe-Ni (5150–6371 km)', x: 440, y: 420, role: 'Solid crystalline sphere under 3.6 million atm and 5700 K; density ~13 g/cm³; unyielding pressure.', color: '#FBBF24' }
    ],
    walkthrough: {
      whatItShows: 'Concentric spherical layering of planet Earth discovered through earthquake seismology (P-wave refraction and S-wave shadow zones).',
      importantComponents: [
        'Crust: Oceanic crust is thin (5–10 km), dense (3.0 g/cm³), and basaltic (SiMa); continental crust is thick (30–50 km), buoyant (2.7 g/cm³), and granitic (SiAl).',
        'Mantle: Comprises 84% of Earth\'s volume; peridotite rock; asthenosphere convection drives plate tectonics.',
        'Outer Core vs Inner Core: Gutenberg Discontinuity (2900 km) separates solid mantle from molten liquid Outer Core (creates S-wave shadow 105°–142°). Inner Core is solid due to immense pressure.'
      ],
      processSequence: [
        '1. Planetary Differentiation: 4.5 billion years ago, dense molten iron and nickel sank to form the core while buoyant silicate slag floated to form the crust.',
        '2. Geodynamo Effect: Thermal and compositional convection in liquid outer core generates Earth\'s protective magnetic shield against solar wind.',
        '3. Mantle Convection: Hot plumes rise from core-mantle boundary (D\'\' layer), cool beneath lithosphere, and descend in subduction zones.'
      ],
      examTakeaway: 'Seismic S-waves cannot travel through liquids! The global S-wave shadow zone beyond 105° angular distance is the definitive empirical proof that the Earth\'s Outer Core is molten liquid!'
    },
    svgXml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 520" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="innerCoreGrad" cx="50%" cy="100%" r="90%">
          <stop offset="0%" stop-color="#FEF08A"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </radialGradient>
      </defs>
      <rect width="840" height="520" rx="20" fill="#0F172A"/>
      <text x="420" y="34" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Earth's Internal Structure — Radial Planetary Wedge &amp; Discontinuities</text>
      <text x="420" y="56" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94A3B8" text-anchor="middle">Crust (0–35 km) • Mantle (2900 km) • Liquid Outer Core (5150 km) • Solid Inner Core (6371 km)</text>

      <!-- RADIAL EARTH WEDGE -->
      <g transform="translate(0, 10)">
        <!-- Layer 1: Solid Inner Core -->
        <path id="inner_core_solid" d="M 420 450 L 390 380 A 80 80 0 0 1 450 380 Z" fill="url(#innerCoreGrad)" stroke="#FBBF24" stroke-width="2"/>
        <text x="420" y="420" font-family="Inter, sans-serif" font-size="10.5" font-weight="900" fill="#78350F" text-anchor="middle">Solid Inner Core</text>

        <!-- Layer 2: Liquid Outer Core -->
        <path id="outer_core_liquid" d="M 390 380 L 340 270 A 200 200 0 0 1 500 270 L 450 380 A 80 80 0 0 0 390 380 Z" fill="#DC2626" stroke="#EF4444" stroke-width="2"/>
        <text x="420" y="330" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">Liquid Outer Core (Fe-Ni)</text>
        <text x="420" y="348" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#FEF08A" text-anchor="middle">Geodynamo Magnetic Field Generator</text>

        <!-- Layer 3: Lower & Upper Mantle / Asthenosphere -->
        <path id="asthenosphere_mantle" d="M 340 270 L 270 120 A 360 360 0 0 1 570 120 L 500 270 A 200 200 0 0 0 340 270 Z" fill="#EA580C" stroke="#F97316" stroke-width="2"/>
        <text x="420" y="190" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">Mantle / Asthenosphere (2900 km)</text>
        <text x="420" y="210" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="#FFEDD5" text-anchor="middle">Semi-Fluid Plastic Rock Convection Loops</text>

        <!-- Layer 4: Rigid Lithosphere & Crust -->
        <path id="crust_lithosphere" d="M 270 120 L 260 95 A 385 385 0 0 1 580 95 L 570 120 A 360 360 0 0 0 270 120 Z" fill="#047857" stroke="#34D399" stroke-width="2"/>
        <text x="420" y="112" font-family="Inter, sans-serif" font-size="11" font-weight="900" fill="#D1FAE5" text-anchor="middle">Crust (SiAl Continental / SiMa Oceanic) &amp; Lithosphere</text>
      </g>

      <!-- DEPTH LABELS & DISCONTINUITIES -->
      <g font-family="Inter, sans-serif" font-size="11" font-weight="800">
        <text x="210" y="105" fill="#34D399" text-anchor="end">0 km (Surface)</text>
        <line x1="220" y1="105" x2="260" y2="105" stroke="#34D399" stroke-width="1.5"/>

        <text x="210" y="130" fill="#FDE047" text-anchor="end">Moho Discontinuity (~35 km)</text>
        <line x1="220" y1="130" x2="270" y2="130" stroke="#FDE047" stroke-width="1.5" stroke-dasharray="3 2"/>

        <text x="210" y="280" fill="#EF4444" text-anchor="end">Gutenberg Discontinuity (2900 km)</text>
        <line x1="220" y1="280" x2="340" y2="280" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 2"/>

        <text x="210" y="390" fill="#FBBF24" text-anchor="end">Lehmann Discontinuity (5150 km)</text>
        <line x1="220" y1="390" x2="390" y2="390" stroke="#FBBF24" stroke-width="1.5" stroke-dasharray="3 2"/>

        <text x="210" y="460" fill="#FDE047" text-anchor="end">Earth Center (6371 km)</text>
        <line x1="220" y1="460" x2="420" y2="460" stroke="#FDE047" stroke-width="1.5"/>
      </g>

      <!-- Right Properties Callout Box -->
      <rect x="610" y="130" width="205" height="280" rx="12" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
      <text x="712" y="155" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">Physical Properties</text>

      <text x="625" y="185" font-family="Inter, sans-serif" font-size="10.5" font-weight="800" fill="#34D399">• Continental Crust:</text>
      <text x="635" y="202" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#CBD5E1">Granite (SiAl), ~2.7 g/cm³</text>

      <text x="625" y="225" font-family="Inter, sans-serif" font-size="10.5" font-weight="800" fill="#F97316">• Mantle Convection:</text>
      <text x="635" y="242" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#CBD5E1">Peridotite, drives plates</text>

      <text x="625" y="265" font-family="Inter, sans-serif" font-size="10.5" font-weight="800" fill="#EF4444">• Outer Core (Liquid):</text>
      <text x="635" y="282" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#CBD5E1">Blocks S-waves, creates field</text>

      <text x="625" y="305" font-family="Inter, sans-serif" font-size="10.5" font-weight="800" fill="#FDE047">• Inner Core (Solid):</text>
      <text x="635" y="322" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#CBD5E1">Solid Fe-Ni, 3.6M atm, 5700K</text>

      <!-- Bottom Seismic Proof Note -->
      <rect x="80" y="475" width="680" height="34" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
      <text x="420" y="497" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#F8FAFC" text-anchor="middle">Seismic Proof: S-wave shadow zone (&gt;105°) proves the Outer Core is molten liquid!</text>
    </svg>`
  }
};

/**
 * Retrieves the high-precision scientific vector asset for a given topic or diagram type.
 */
export function getDetailedScientificAsset(topicOrType: string): DetailedVisualAsset | null {
  const t = topicOrType.toLowerCase().trim();
  if (t === 'cardiac_conduction' || /(conduction system|cardiac conduction|sa node|av node|pacemaker|purkinje|ecg|bundle of his)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.cardiac_conduction;
  }
  if (t === 'double_circulation' || /(double circulation|systemic circulation|pulmonary circulation|pulmonary circuit|systemic circuit)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.double_circulation;
  }
  if (t === 'chloroplast_structure' || /(chloroplast structure|chloroplast ultrastructure|thylakoid|grana|stroma lamellae)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.chloroplast_structure;
  }
  if (t === 'magnetic_fields' || /(magnetic field|magnetic flux|bar magnet|solenoid|electromagnet|right.hand grip)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.magnetic_fields;
  }
  if (t === 'earth_layers' || /(earth.*layer|earth.*internal structure|crust mantle core|lithosphere asthenosphere|inner core|outer core|moho discontinuity)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.earth_layers;
  }
  if (t === 'human_heart' || /(heart|cardiac|ventricle|atrium|valve|circulation)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.human_heart;
  }
  if (t === 'human_brain' || /(brain|cerebr|cerebell|frontal lobe|brainstem|nervous|neuron|synapse|reflex)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.human_brain;
  }
  if (t === 'dna_helix' || /(dna|helix|nucleotide|watson|genetic code|chromosome|gene)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.dna_helix;
  }
  if (t === 'photosynthesis' || /(photosynthesis|chloroplast|thylakoid|calvin cycle|stomata|chlorophyll)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.photosynthesis;
  }
  if (t === 'digestive_system' || /(digest|alimentary|stomach|intestine|peristalsis|villi|pepsin|bile)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.digestive_system;
  }
  if (t === 'plant_cell' || /(plant cell|cell wall|vacuole|chloroplast ultrastructure)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.plant_cell;
  }
  if (t === 'atomic_structure' || /(atomic structure|bohr|proton|neutron|subatomic|isotope|electron shell)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.atomic_structure;
  }
  if (t === 'chemical_bonding' || /(bond|ionic|covalent|electron transfer|octet|nacl|h2o)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.chemical_bonding;
  }
  if (t === 'chemical_reactions' || /(chemical reaction|exothermic|endothermic|activation energy|stoichiometr|redox|displacement)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.chemical_reactions;
  }
  if (t === 'work_power_energy' || /(work.*power|kinetic energy|potential energy|mechanical energy|joule|watt)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.work_power_energy;
  }
  if (t === 'simple_machines' || /(machine|lever|pulley|fulcrum|mechanical advantage|velocity ratio)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.simple_machines;
  }
  if (t === 'electric_circuit' || /(electric|circuit|ohm|resistor|ammeter|voltmeter|voltage|current)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.electric_circuit;
  }
  if (t === 'optics_light' || /(light|optics|refraction|reflection|lens|mirror|snell|focal)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.optics_light;
  }
  if (t === 'newton_motion' || /(newton|force|motion|friction|free body|f\s*=\s*m\s*a|inertia|momentum)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.newton_motion;
  }
  if (t === 'fractions_visual' || /(fraction|numerator|denominator|rational number)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.fractions_visual;
  }
  if (t === 'geometry_pythagoras' || /(geometry|pythagor|triangle|hypotenuse|euclidean|angle)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.geometry_pythagoras;
  }
  if (t === 'coordinate_graphs' || /(algebra|quadratic|parabola|linear equation|graph|slope|cartesian|polynomial)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.coordinate_graphs;
  }
  if (t === 'world_war_2' || /(world war|wwii|ww2|stalingrad|normandy|axis|allies|hitler)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.world_war_2;
  }
  if (t === 'indian_independence' || /(indian independence|freedom struggle|dandi|quit india|non-cooperation|1857|mahatma gandhi|satyagraha)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.indian_independence;
  }
  if (t === 'plate_tectonics' || /(plate tectonic|subduction|continental drift|lithosphere|asthenosphere|divergent|convergent)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.plate_tectonics;
  }
  if (t === 'water_cycle' || /(water cycle|hydrologic|evaporation|precipitation|cloud)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.water_cycle;
  }
  if (t === 'english_grammar' || /(english grammar|parts of speech|tense|active.*passive|syntax|subject.*verb|clause)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.english_grammar;
  }
  if (t === 'computer_science' || /(computer|algorithm|binary search|data structure|sorting|complexity|cpu|programming)/.test(t)) {
    return SCIENTIFIC_VECTOR_REGISTRY.computer_science;
  }
  return null;
}
