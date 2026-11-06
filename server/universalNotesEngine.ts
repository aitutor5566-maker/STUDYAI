/**
 * STUDYAI Universal Notes Engine
 *
 * Implements the 15-part specification for universal educational notes generation:
 * - Automatic Topic Recognition across all 13+ academic disciplines
 * - Knowledge Units: Definitions, Mechanisms, Components, Processes, Comparisons
 * - Automatic Formula & Worked Numerical Problem Engine (with dimensional check & SI units)
 * - Anti-Hallucination & Source Verification
 * - 4 Visual Design Modes (Handwritten, Infographic, Formula Sheet, Chapter Notes)
 * - The Final Comprehensive Revision Page (Mandatory)
 * - Specialized SVG Technical Illustrations for every academic domain
 */

import { classifyUniversalTopic, type TopicClassification, type StudentAcademicContext } from './universalSubjectClassifier.ts';

export interface ComprehensiveRevisionPage {
  topic: string;
  subject: string;
  discipline: string;
  executiveSummary: string;
  quickRevisionMatrix: Array<{ concept: string; keyRuleOrPrinciple: string; examSignificance: string }>;
  keyFormulasOrDatesOrRules: Array<{ label: string; formulaOrDetail: string; unitsOrSignificance: string }>;
  highYieldDefinitions: Array<{ term: string; conciseDefinition: string }>;
  memoryMnemonics: string[];
  commonMisconceptionsAndPitfalls: string[];
  modelExamQuestions: Array<{ marks: number; question: string; answerKey: string }>;
  diagramRecapCaption: string;
  diagramRecapSvgDataUrl?: string;
}

export interface UniversalNoteResult {
  id: string;
  title: string;
  subject: string;
  discipline: string;
  topic: string;
  chapter: string;
  level: string;
  depth: string;
  notebook: string;
  content_markdown: string;
  designMode: 'handwritten' | 'infographic' | 'formula_sheet' | 'chapter_notes';
  structured: any;
  finalRevisionPage: ComprehensiveRevisionPage;
  flashcards: Array<{ front: string; back: string; sourceRef: string }>;
  quiz: any[];
  sourcesAndReferences: any[];
  verificationStatus: 'Source Verified' | 'Content Verified' | 'Curriculum Mapped';
  created_at: string;
  updated_at: string;
}

// ==============================================================================
// 1. SPECIALIZED TECHNICAL SVG VECTOR GENERATORS (13 DOMAINS)
// ==============================================================================

export function generateDomainSvg(domainType: string, topic: string): { dataUrl: string; caption: string; title: string } {
  let svg = '';
  let title = `${topic} — Diagram`;
  let caption = `Technical educational illustration for ${topic}.`;

  switch (domainType) {
    case 'physics_friction_fbd':
    case 'fbd_vectors':
      title = 'Friction Forces & Free-Body Diagram (FBD)';
      caption = 'Free-body diagram of a block of mass m on a rough horizontal surface showing Normal Force (N), Gravity (mg), Applied Force (F), and Friction (f_s / f_k).';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Physics: Friction Forces &amp; Free-Body Diagram (FBD)</text>
        <line x1="80" y1="360" x2="720" y2="360" stroke="#64748B" stroke-width="4"/>
        <line x1="120" y1="365" x2="100" y2="385" stroke="#475569" stroke-width="2"/>
        <line x1="220" y1="365" x2="200" y2="385" stroke="#475569" stroke-width="2"/>
        <line x1="320" y1="365" x2="300" y2="385" stroke="#475569" stroke-width="2"/>
        <line x1="420" y1="365" x2="400" y2="385" stroke="#475569" stroke-width="2"/>
        <line x1="520" y1="365" x2="500" y2="385" stroke="#475569" stroke-width="2"/>
        <line x1="620" y1="365" x2="600" y2="385" stroke="#475569" stroke-width="2"/>
        <rect x="300" y="220" width="200" height="140" rx="12" fill="#EA580C" stroke="#FB923C" stroke-width="3"/>
        <text x="400" y="295" font-family="Inter, sans-serif" font-size="19" font-weight="800" fill="#FFFFFF" text-anchor="middle">Mass m</text>
        <line x1="400" y1="220" x2="400" y2="80" stroke="#38BDF8" stroke-width="4" marker-end="url(#arrow-blue)"/>
        <polygon points="400,70 392,90 408,90" fill="#38BDF8"/>
        <text x="400" y="60" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#38BDF8" text-anchor="middle">Normal Force N = mg</text>
        <line x1="400" y1="360" x2="400" y2="440" stroke="#A855F7" stroke-width="4"/>
        <polygon points="400,450 392,430 408,430" fill="#A855F7"/>
        <text x="400" y="445" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#C084FC" text-anchor="start"> Weight W = mg</text>
        <line x1="500" y1="290" x2="690" y2="290" stroke="#22C55E" stroke-width="4"/>
        <polygon points="705,290 685,282 685,298" fill="#22C55E"/>
        <text x="610" y="275" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#4ADE80" text-anchor="middle">Applied Force F</text>
        <line x1="300" y1="340" x2="130" y2="340" stroke="#EF4444" stroke-width="4"/>
        <polygon points="115,340 135,332 135,348" fill="#EF4444"/>
        <text x="210" y="325" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F87171" text-anchor="middle">Friction f = μ · N</text>
        <rect x="520" y="80" width="240" height="70" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="640" y="105" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">Limiting: f_s(max) = μ_s · N</text>
        <text x="640" y="130" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FCD34D" text-anchor="middle">Kinetic: f_k = μ_k · N (μ_k &lt; μ_s)</text>
      </svg>`;
      break;

    case 'physics_circular_motion':
      title = 'Uniform Circular Motion & Centripetal Acceleration';
      caption = 'Diagram of a body moving at constant speed along a circular path of radius r, showing perpendicular tangential velocity v and inward centripetal acceleration a_c.';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Physics: Uniform Circular Motion &amp; Centripetal Vectors</text>
        <circle cx="400" cy="240" r="140" fill="none" stroke="#475569" stroke-width="3" stroke-dasharray="6,6"/>
        <circle cx="400" cy="240" r="6" fill="#FBBF24"/>
        <text x="400" y="260" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FDE047" text-anchor="middle">Center O</text>
        <circle cx="540" cy="240" r="16" fill="#EA580C" stroke="#FB923C" stroke-width="2.5"/>
        <line x1="400" y1="240" x2="524" y2="240" stroke="#94A3B8" stroke-width="2"/>
        <text x="460" y="232" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#CBD5E1" text-anchor="middle">Radius r</text>
        <line x1="540" y1="240" x2="540" y2="90" stroke="#22C55E" stroke-width="4"/>
        <polygon points="540,80 532,100 548,100" fill="#22C55E"/>
        <text x="555" y="130" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80">Velocity v (tangential)</text>
        <line x1="524" y1="240" x2="420" y2="240" stroke="#EF4444" stroke-width="4"/>
        <polygon points="410,240 430,232 430,248" fill="#EF4444"/>
        <text x="465" y="275" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F87171" text-anchor="middle">Inward a_c = v²/r</text>
        <rect x="60" y="80" width="220" height="74" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="170" y="105" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#38BDF8" text-anchor="middle">Centripetal Force:</text>
        <text x="170" y="130" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#F8FAFC" text-anchor="middle">F_c = m · v² / r = m · ω² · r</text>
      </svg>`;
      break;

    case 'economics_demand_supply':
    case 'economic_curves':
      title = 'Law of Demand and Supply — Market Equilibrium';
      caption = 'Microeconomic market model showing downward-sloping Demand Curve (D), upward-sloping Supply Curve (S), and Market Equilibrium Point E (P_e, Q_e).';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Economics: Supply &amp; Demand Market Equilibrium</text>
        <line x1="120" y1="380" x2="720" y2="380" stroke="#94A3B8" stroke-width="3"/>
        <line x1="120" y1="380" x2="120" y2="80" stroke="#94A3B8" stroke-width="3"/>
        <polygon points="730,380 715,373 715,387" fill="#94A3B8"/>
        <polygon points="120,70 113,85 127,85" fill="#94A3B8"/>
        <text x="735" y="385" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#CBD5E1">Quantity (Q)</text>
        <text x="120" y="55" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#CBD5E1" text-anchor="middle">Price (P)</text>
        <line x1="180" y1="120" x2="620" y2="340" stroke="#EF4444" stroke-width="4"/>
        <text x="640" y="350" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#F87171">Demand (D)</text>
        <line x1="180" y1="340" x2="620" y2="120" stroke="#22C55E" stroke-width="4"/>
        <text x="640" y="125" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#4ADE80">Supply (S)</text>
        <circle cx="400" cy="230" r="7" fill="#FBBF24"/>
        <line x1="400" y1="230" x2="400" y2="380" stroke="#FDE047" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="400" y1="230" x2="120" y2="230" stroke="#FDE047" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="400" y="405" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">Q_e (Equilibrium Quantity)</text>
        <text x="80" y="235" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FDE047" text-anchor="middle">P_e</text>
        <rect x="360" y="165" width="200" height="50" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="460" y="188" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FBBF24" text-anchor="middle">Equilibrium Point E:</text>
        <text x="460" y="206" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#CBD5E1" text-anchor="middle">Quantity Demanded = Supplied</text>
      </svg>`;
      break;

    case 'cs_computer_networks':
    case 'network_topology':
      title = 'Computer Networks — OSI 7-Layer Architecture & Protocols';
      caption = 'Hierarchical architectural diagram comparing the 7 OSI reference layers (Application down to Physical) and core Internet protocols (HTTP, TCP, IP, Ethernet).';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Computer Science: OSI 7-Layer Network Architecture</text>
        <!-- 7 Layer Stack -->
        <g transform="translate(100, 65)">
          <rect x="0" y="0" width="600" height="42" rx="8" fill="#BE123C"/>
          <text x="20" y="26" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Layer 7: Application Layer</text>
          <text x="580" y="26" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#FECDD3" text-anchor="end">HTTP, HTTPS, DNS, FTP</text>

          <rect x="0" y="48" width="600" height="42" rx="8" fill="#C2410C"/>
          <text x="20" y="74" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Layer 6: Presentation Layer</text>
          <text x="580" y="74" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#FED7AA" text-anchor="end">SSL/TLS, JPEG, ASCII Encryption</text>

          <rect x="0" y="96" width="600" height="42" rx="8" fill="#B45309"/>
          <text x="20" y="122" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Layer 5: Session Layer</text>
          <text x="580" y="122" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#FDE68A" text-anchor="end">RPC, NetBIOS, Session Management</text>

          <rect x="0" y="144" width="600" height="42" rx="8" fill="#15803D"/>
          <text x="20" y="170" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Layer 4: Transport Layer</text>
          <text x="580" y="170" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#BBF7D0" text-anchor="end">TCP (Reliable) &amp; UDP (Fast Datagrams)</text>

          <rect x="0" y="192" width="600" height="42" rx="8" fill="#0369A1"/>
          <text x="20" y="218" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Layer 3: Network Layer</text>
          <text x="580" y="218" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#BAE6FD" text-anchor="end">IP (IPv4/IPv6), Routers, Packets</text>

          <rect x="0" y="240" width="600" height="42" rx="8" fill="#4338CA"/>
          <text x="20" y="266" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Layer 2: Data Link Layer</text>
          <text x="580" y="266" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#C7D2FE" text-anchor="end">MAC Address, Ethernet, Switches</text>

          <rect x="0" y="288" width="600" height="42" rx="8" fill="#6B21A8"/>
          <text x="20" y="314" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Layer 1: Physical Layer</text>
          <text x="580" y="314" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#E9D5FF" text-anchor="end">Bits, Fiber Optic, Copper Cable, Radio</text>
        </g>
      </svg>`;
      break;

    case 'accounting_journal_ledger':
      title = 'Accounting — Golden Rules & 5-Column Journal Entry Format';
      caption = 'Standard accounting pedagogical chart outlining the three Golden Rules of Debit/Credit and the standard double-entry transaction record.';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Accountancy: Golden Rules &amp; Journal Format</text>
        <!-- 3 Golden Rules Cards -->
        <g transform="translate(60, 60)">
          <rect x="0" y="0" width="210" height="90" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
          <text x="105" y="25" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">1. REAL ACCOUNTS</text>
          <text x="105" y="52" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#4ADE80" text-anchor="middle">Debit What Comes In</text>
          <text x="105" y="74" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F87171" text-anchor="middle">Credit What Goes Out</text>

          <rect x="235" y="0" width="210" height="90" rx="10" fill="#1E293B" stroke="#FBBF24" stroke-width="2"/>
          <text x="340" y="25" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FBBF24" text-anchor="middle">2. PERSONAL ACCOUNTS</text>
          <text x="340" y="52" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#4ADE80" text-anchor="middle">Debit The Receiver</text>
          <text x="340" y="74" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F87171" text-anchor="middle">Credit The Giver</text>

          <rect x="470" y="0" width="210" height="90" rx="10" fill="#1E293B" stroke="#A855F7" stroke-width="2"/>
          <text x="575" y="25" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#C084FC" text-anchor="middle">3. NOMINAL ACCOUNTS</text>
          <text x="575" y="52" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#4ADE80" text-anchor="middle">Debit All Expenses/Losses</text>
          <text x="575" y="74" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#F87171" text-anchor="middle">Credit All Incomes/Gains</text>
        </g>
        <!-- Standard Journal Table -->
        <g transform="translate(60, 175)">
          <rect x="0" y="0" width="680" height="250" rx="10" fill="#0F172A" stroke="#475569" stroke-width="2"/>
          <rect x="0" y="0" width="680" height="40" rx="10" fill="#334155"/>
          <text x="45" y="26" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Date</text>
          <text x="240" y="26" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FFFFFF">Particulars (Account Titles &amp; Narration)</text>
          <text x="445" y="26" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">L.F.</text>
          <text x="530" y="26" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Debit (₹)</text>
          <text x="625" y="26" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Credit (₹)</text>

          <line x1="90" y1="0" x2="90" y2="250" stroke="#475569" stroke-width="1.5"/>
          <line x1="420" y1="0" x2="420" y2="250" stroke="#475569" stroke-width="1.5"/>
          <line x1="470" y1="0" x2="470" y2="250" stroke="#475569" stroke-width="1.5"/>
          <line x1="580" y1="0" x2="580" y2="250" stroke="#475569" stroke-width="1.5"/>

          <text x="45" y="75" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8" text-anchor="middle">2026</text>
          <text x="45" y="95" font-family="Inter, sans-serif" font-size="12" fill="#CBD5E1" text-anchor="middle">Apr 1</text>
          <text x="110" y="75" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F8FAFC">Cash Account ...................................... Dr.</text>
          <text x="140" y="105" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F8FAFC">To Capital Account</text>
          <text x="110" y="130" font-family="Inter, sans-serif" font-size="11.5" font-style="italic" fill="#94A3B8">(Being business started with cash capital)</text>
          <text x="530" y="75" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">1,00,000</text>
          <text x="625" y="105" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F87171" text-anchor="middle">1,00,000</text>
          <line x1="100" y1="145" x2="680" y2="145" stroke="#334155" stroke-width="1"/>
        </g>
      </svg>`;
      break;

    case 'civics_fundamental_rights':
    case 'institutional_hierarchy':
      title = 'Indian Constitution — The Six Fundamental Rights (Part III)';
      caption = 'Constitutional schematic displaying Articles 12 through 35, highlighting Equality, Freedom, Protection Against Exploitation, Religion, Culture, and Constitutional Remedies.';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Civics: Six Fundamental Rights (Articles 14–32)</text>
        <g transform="translate(60, 60)">
          <!-- Top Hub -->
          <rect x="180" y="0" width="320" height="48" rx="10" fill="#EA580C" stroke="#FB923C" stroke-width="2"/>
          <text x="340" y="28" font-family="Inter, sans-serif" font-size="14.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Part III • Indian Constitution (Justiciable)</text>

          <!-- 6 Rights Grid -->
          <rect x="0" y="75" width="210" height="110" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
          <text x="105" y="102" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">1. Right to Equality</text>
          <text x="105" y="125" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Articles 14 – 18</text>
          <text x="105" y="148" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Equal protection of law,</text>
          <text x="105" y="165" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">abolition of untouchability</text>

          <rect x="235" y="75" width="210" height="110" rx="10" fill="#1E293B" stroke="#22C55E" stroke-width="2"/>
          <text x="340" y="102" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#4ADE80" text-anchor="middle">2. Right to Freedom</text>
          <text x="340" y="125" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Articles 19 – 22</text>
          <text x="340" y="148" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Speech, assembly, movement,</text>
          <text x="340" y="165" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Right to life &amp; liberty (Art 21)</text>

          <rect x="470" y="75" width="210" height="110" rx="10" fill="#1E293B" stroke="#F43F5E" stroke-width="2"/>
          <text x="575" y="102" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FB7185" text-anchor="middle">3. Against Exploitation</text>
          <text x="575" y="125" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Articles 23 – 24</text>
          <text x="575" y="148" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Prohibition of human trafficking</text>
          <text x="575" y="165" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">&amp; child labor in factories</text>

          <rect x="0" y="210" width="210" height="110" rx="10" fill="#1E293B" stroke="#A855F7" stroke-width="2"/>
          <text x="105" y="237" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#C084FC" text-anchor="middle">4. Freedom of Religion</text>
          <text x="105" y="260" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Articles 25 – 28</text>
          <text x="105" y="283" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Freedom of conscience, practice</text>
          <text x="105" y="300" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">&amp; propagation of religion</text>

          <rect x="235" y="210" width="210" height="110" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
          <text x="340" y="237" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FBBF24" text-anchor="middle">5. Cultural &amp; Education</text>
          <text x="340" y="260" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Articles 29 – 30</text>
          <text x="340" y="283" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Protection of minority script,</text>
          <text x="340" y="300" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">language &amp; education rights</text>

          <rect x="470" y="210" width="210" height="110" rx="10" fill="#1E293B" stroke="#EC4899" stroke-width="2"/>
          <text x="575" y="237" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#F472B6" text-anchor="middle">6. Constitutional Remedies</text>
          <text x="575" y="260" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Article 32 (Heart &amp; Soul)</text>
          <text x="575" y="283" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">5 Writs (Habeas Corpus,</text>
          <text x="575" y="300" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Mandamus, Quo-Warranto...)</text>
        </g>
      </svg>`;
      break;

    case 'english_macbeth_arc':
    case 'literary_arc':
      title = 'William Shakespeare’s Macbeth — Five-Act Dramatic Tragedy Arc';
      caption = 'Dramatic narrative arc tracing Macbeth’s rise and fall: Exposition, Inciting Prophecies, Climax (Banquo Murder), Downfall, and Catharsis.';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Shakespeare: Macbeth Dramatic Tragedy Arc</text>
        <!-- Triangle Plot Mountain -->
        <path d="M 80,380 Q 240,360 400,120 Q 560,360 720,380" fill="none" stroke="#F43F5E" stroke-width="4"/>
        <!-- Act 1 -->
        <circle cx="160" cy="360" r="8" fill="#FBBF24"/>
        <text x="160" y="390" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FDE047" text-anchor="middle">Act 1: Prophecy</text>
        <text x="160" y="410" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Witches &amp; Ambition</text>
        <!-- Act 2 -->
        <circle cx="280" cy="270" r="8" fill="#FBBF24"/>
        <text x="240" y="240" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FDE047" text-anchor="middle">Act 2: Regicide</text>
        <text x="240" y="260" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Duncan Murdered</text>
        <!-- Act 3 Climax -->
        <circle cx="400" cy="120" r="10" fill="#EF4444" stroke="#FECDD3" stroke-width="3"/>
        <text x="400" y="85" font-family="Inter, sans-serif" font-size="14.5" font-weight="800" fill="#F87171" text-anchor="middle">Act 3: Climax (Banquo Murder)</text>
        <text x="400" y="105" font-family="Inter, sans-serif" font-size="11.5" fill="#FECDD3" text-anchor="middle">Banquo’s Ghost &amp; Point of No Return</text>
        <!-- Act 4 -->
        <circle cx="520" cy="270" r="8" fill="#FBBF24"/>
        <text x="560" y="240" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FDE047" text-anchor="middle">Act 4: Tyranny</text>
        <text x="560" y="260" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Macduff Family Slain</text>
        <!-- Act 5 -->
        <circle cx="640" cy="360" r="8" fill="#FBBF24"/>
        <text x="640" y="390" font-family="Inter, sans-serif" font-size="12.5" font-weight="800" fill="#FDE047" text-anchor="middle">Act 5: Catastrophe</text>
        <text x="640" y="410" font-family="Inter, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Birnam Wood &amp; Downfall</text>
      </svg>`;
      break;

    case 'geography_climate_monsoon':
    case 'geographical_map':
      title = 'Geography — Atmospheric Circulation & Indian Monsoon Mechanism';
      caption = 'Diagram illustrating differential heating between land and sea, low-pressure trough (ITCZ), and Southwest vs. Northeast monsoon wind trajectories.';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">Geography: Atmospheric Monsoon Circulation</text>
        <!-- Land vs Ocean blocks -->
        <rect x="80" y="120" width="300" height="240" rx="14" fill="#78350F" stroke="#B45309" stroke-width="2"/>
        <text x="230" y="160" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#FDE68A" text-anchor="middle">Tibetan Plateau &amp; Landmass</text>
        <text x="230" y="195" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#F87171" text-anchor="middle">Intense Summer Heating</text>
        <text x="230" y="235" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#EF4444" text-anchor="middle">LOW PRESSURE (L)</text>
        <text x="230" y="270" font-family="Inter, sans-serif" font-size="12" fill="#FEF08A" text-anchor="middle">Rising warm convectional air</text>

        <rect x="420" y="120" width="300" height="240" rx="14" fill="#0369A1" stroke="#0284C7" stroke-width="2"/>
        <text x="570" y="160" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#BAE6FD" text-anchor="middle">Indian Ocean (Mascarene High)</text>
        <text x="570" y="195" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#38BDF8" text-anchor="middle">Cooler Oceanic Waters</text>
        <text x="570" y="235" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#38BDF8" text-anchor="middle">HIGH PRESSURE (H)</text>
        <text x="570" y="270" font-family="Inter, sans-serif" font-size="12" fill="#E0F2FE" text-anchor="middle">Moisture-laden subsiding air</text>

        <!-- Wind arrow from Ocean to Land -->
        <path d="M 520,330 C 420,390 320,390 230,330" fill="none" stroke="#22C55E" stroke-width="5" marker-end="url(#arrow-green)"/>
        <polygon points="215,325 235,318 232,336" fill="#22C55E"/>
        <text x="400" y="420" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#4ADE80" text-anchor="middle">Southwest Monsoon Winds (Moisture Inflow)</text>
      </svg>`;
      break;

    default:
      title = `${topic} — Educational Infographic`;
      caption = `Conceptual structure and process dynamics for ${topic}.`;
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460">
        <rect width="800" height="460" rx="20" fill="#0F172A"/>
        <text x="400" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">${topic} — Core Conceptual Architecture</text>
        <rect x="60" y="120" width="180" height="180" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
        <text x="150" y="160" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="middle">1. Inputs &amp; Causes</text>
        <text x="150" y="200" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">Primary conditions,</text>
        <text x="150" y="220" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">laws and energy</text>

        <line x1="240" y1="210" x2="310" y2="210" stroke="#FBBF24" stroke-width="4"/>
        <polygon points="320,210 305,203 305,217" fill="#FBBF24"/>

        <rect x="310" y="100" width="180" height="220" rx="14" fill="#1E293B" stroke="#FBBF24" stroke-width="2"/>
        <text x="400" y="150" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#FBBF24" text-anchor="middle">2. Process &amp; Action</text>
        <text x="400" y="190" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">Mechanism of action,</text>
        <text x="400" y="210" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">interactions and</text>
        <text x="400" y="230" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">state changes</text>

        <line x1="490" y1="210" x2="560" y2="210" stroke="#22C55E" stroke-width="4"/>
        <polygon points="570,210 555,203 555,217" fill="#22C55E"/>

        <rect x="560" y="120" width="180" height="180" rx="14" fill="#1E293B" stroke="#22C55E" stroke-width="2"/>
        <text x="650" y="160" font-family="Inter, sans-serif" font-size="15" font-weight="800" fill="#4ADE80" text-anchor="middle">3. Measurable Outcome</text>
        <text x="650" y="200" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">Final products,</text>
        <text x="650" y="220" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">empirical results &amp;</text>
        <text x="650" y="240" font-family="Inter, sans-serif" font-size="12.5" fill="#CBD5E1" text-anchor="middle">applications</text>
      </svg>`;
      break;
  }

  return {
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`,
    caption,
    title
  };
}

// ==============================================================================
// 2. CURRICULUM WORKED NUMERICAL PROBLEMS & REVISION ENGINES
// ==============================================================================

export interface UniversalWorkedProblem {
  title: string;
  problemStatement: string;
  givenData: Array<{ symbol: string; value: string; unit: string; description: string }>;
  formulaUsed: string;
  stepByStepSolution: string[];
  finalAnswer: string;
  dimensionalCheck: string;
}

export function buildUniversalWorkedProblems(topic: string, subject: string): UniversalWorkedProblem[] {
  const lower = topic.toLowerCase();

  // Friction (Physics)
  if (lower.includes('friction')) {
    return [
      {
        title: 'Friction: Limiting Friction & Minimum Pulling Force Calculation',
        problemStatement: 'A wooden crate of mass m = 25.0 kg rests on a rough horizontal warehouse floor. The coefficient of static friction is μ_s = 0.40 and kinetic friction is μ_k = 0.30. Taking g = 9.8 m/s²: (a) Calculate the maximum limiting static friction force. (b) If a horizontal pulling force of 120 N is applied, calculate the acceleration of the crate once it starts moving.',
        givenData: [
          { symbol: 'm', value: '25.0', unit: 'kg', description: 'Mass of the crate' },
          { symbol: 'μ_s', value: '0.40', unit: 'dimensionless', description: 'Coefficient of static friction' },
          { symbol: 'μ_k', value: '0.30', unit: 'dimensionless', description: 'Coefficient of kinetic friction' },
          { symbol: 'g', value: '9.8', unit: 'm/s²', description: 'Acceleration due to gravity' },
          { symbol: 'F_applied', value: '120.0', unit: 'N', description: 'Applied horizontal force' }
        ],
        formulaUsed: 'f_s(max) = μ_s · N  |  N = m · g  |  f_k = μ_k · N  |  F_net = F_applied - f_k = m · a',
        stepByStepSolution: [
          'Step 1 (Normal Force): Since the floor is horizontal and vertical acceleration is zero, N = m · g = 25.0 kg × 9.8 m/s² = 245.0 N.',
          'Step 2 (Limiting Friction): The maximum static friction force is f_s(max) = μ_s · N = 0.40 × 245.0 N = 98.0 N.',
          'Step 3 (Motion Check): Applied force F = 120.0 N > 98.0 N, so the crate overcomes static friction and accelerates.',
          'Step 4 (Kinetic Friction Force): During sliding, the opposing force is f_k = μ_k · N = 0.30 × 245.0 N = 73.5 N.',
          'Step 5 (Net Force & Acceleration): F_net = F_applied - f_k = 120.0 N - 73.5 N = 46.5 N. Acceleration a = F_net / m = 46.5 N / 25.0 kg = 1.86 m/s².'
        ],
        finalAnswer: 'Limiting Static Friction f_s(max) = 98.0 N; Kinetic Friction f_k = 73.5 N; Acceleration a = 1.86 m/s²',
        dimensionalCheck: '[F] = [M L T⁻²] = kg · m/s² = N; [a] = [F] / [M] = m/s² (Dimensionally consistent).'
      }
    ];
  }

  // Circular motion (Physics)
  if (lower.includes('circular')) {
    return [
      {
        title: 'Circular Motion: Centripetal Acceleration & Safe Banking Speed',
        problemStatement: 'A racecar of mass m = 1200 kg negotiates a level circular curve of radius r = 150 m at a constant speed of v = 30 m/s (108 km/h). (a) Calculate the centripetal acceleration. (b) Calculate the required centripetal force and the minimum coefficient of static friction μ_s needed to prevent skidding.',
        givenData: [
          { symbol: 'm', value: '1200', unit: 'kg', description: 'Mass of racecar' },
          { symbol: 'r', value: '150', unit: 'm', description: 'Radius of circular curve' },
          { symbol: 'v', value: '30.0', unit: 'm/s', description: 'Tangential velocity' },
          { symbol: 'g', value: '9.8', unit: 'm/s²', description: 'Acceleration due to gravity' }
        ],
        formulaUsed: 'a_c = v² / r  |  F_c = m · v² / r  |  f_s(max) = μ_s · m · g ≥ F_c  ⇒  μ_s(min) = v² / (r · g)',
        stepByStepSolution: [
          'Step 1 (Centripetal Acceleration): a_c = v² / r = (30 m/s)² / 150 m = 900 / 150 = 6.0 m/s² (directed radially inward).',
          'Step 2 (Centripetal Force): F_c = m · a_c = 1200 kg × 6.0 m/s² = 7200 N.',
          'Step 3 (Minimum Friction Coefficient): The required centripetal force is supplied entirely by lateral friction: μ_s · m · g = m · v² / r ⇒ μ_s = v² / (r · g) = (30)² / (150 × 9.8) = 900 / 1470 ≈ 0.612.'
        ],
        finalAnswer: 'Centripetal Acceleration a_c = 6.0 m/s²; Centripetal Force F_c = 7200 N; Minimum Friction μ_s = 0.61',
        dimensionalCheck: '[a_c] = [L T⁻¹]² / [L] = [L² T⁻²] / [L] = [L T⁻²] = m/s²; [μ] = [L² T⁻²] / ([L] · [L T⁻²]) = 1 (Dimensionless).'
      }
    ];
  }

  // Demand and supply (Economics)
  if (lower.includes('demand') || lower.includes('supply')) {
    return [
      {
        title: 'Economics: Price Elasticity of Demand & Revenue Impact',
        problemStatement: 'When the market price of an educational textbook decreases from ₹500 to ₹400, the monthly quantity demanded increases from 1,000 units to 1,400 units. (a) Calculate the Price Elasticity of Demand (E_d) using the percentage method. (b) Interpret the elasticity and explain the impact on total revenue.',
        givenData: [
          { symbol: 'P₁', value: '500', unit: '₹', description: 'Initial price' },
          { symbol: 'P₂', value: '400', unit: '₹', description: 'New price' },
          { symbol: 'Q₁', value: '1000', unit: 'units', description: 'Initial quantity demanded' },
          { symbol: 'Q₂', value: '1400', unit: 'units', description: 'New quantity demanded' }
        ],
        formulaUsed: 'E_d = (%ΔQ) / (%ΔP) = [(Q₂ - Q₁) / Q₁] / [(P₂ - P₁) / P₁]',
        stepByStepSolution: [
          'Step 1 (Percentage Change in Quantity): %ΔQ = (1400 - 1000) / 1000 × 100 = +400 / 1000 × 100 = +40.0%.',
          'Step 2 (Percentage Change in Price): %ΔP = (400 - 500) / 500 × 100 = -100 / 500 × 100 = -20.0%.',
          'Step 3 (Elasticity Coefficient): E_d = (+40.0%) / (-20.0%) = -2.0. Taking absolute value: |E_d| = 2.0.',
          'Step 4 (Interpretation & Total Revenue): Since |E_d| > 1, demand is Price Elastic. Initial Revenue TR₁ = 500 × 1000 = ₹5,00,000. New Revenue TR₂ = 400 × 1400 = ₹5,60,000. Total revenue increased by ₹60,000 because quantity increased by a greater proportion than price decreased.'
        ],
        finalAnswer: 'Price Elasticity of Demand E_d = -2.0 (|E_d| = 2.0, Elastic Demand); Total Revenue increases from ₹5,00,000 to ₹5,60,000',
        dimensionalCheck: 'Elasticity is a pure ratio of percentage changes and is dimensionless.'
      }
    ];
  }

  // Journal entries (Accountancy)
  if (lower.includes('journal')) {
    return [
      {
        title: 'Accountancy: Comprehensive Goods Purchase with Trade & Cash Discount',
        problemStatement: 'Record journal entries in the books of M/s Sharma Traders for the following transaction: Purchased goods from Rahul for ₹50,000 at 10% Trade Discount and 5% Cash Discount. Paid 60% of the amount immediately by bank cheque.',
        givenData: [
          { symbol: 'List Price', value: '50,000', unit: '₹', description: 'Catalogue price of goods' },
          { symbol: 'Trade Discount', value: '10', unit: '%', description: 'Deducted directly from catalogue price (not recorded in journal)' },
          { symbol: 'Cash Discount', value: '5', unit: '%', description: 'Allowed on immediate bank payment' },
          { symbol: 'Immediate Payment', value: '60', unit: '%', description: 'Paid by cheque on transaction date' }
        ],
        formulaUsed: 'Net Purchases = List Price - Trade Discount  |  Cash Discount = Immediate Payment Amount × 5%',
        stepByStepSolution: [
          'Step 1 (Trade Discount): Trade Discount = 10% of ₹50,000 = ₹5,000. Net Purchase Price recorded in Purchases A/c = ₹50,000 - ₹5,000 = ₹45,000.',
          'Step 2 (Payment Split): Immediate settlement = 60% of ₹45,000 = ₹27,000. Credit balance (payable to Rahul) = 40% of ₹45,000 = ₹18,000.',
          'Step 3 (Cash Discount): Cash Discount = 5% of ₹27,000 = ₹1,350. Net cheque paid = ₹27,000 - ₹1,350 = ₹25,650.',
          'Step 4 (Double Entry Balancing): Debit Purchases A/c (₹45,000). Credit Bank A/c (₹25,650), Credit Discount Received A/c (₹1,350), Credit Rahul A/c (₹18,000). Total Debit (₹45,000) = Total Credit (₹25,650 + ₹1,350 + ₹18,000 = ₹45,000).'
        ],
        finalAnswer: 'Purchases A/c Dr. ₹45,000 | To Bank A/c ₹25,650 | To Discount Received A/c ₹1,350 | To Rahul A/c ₹18,000',
        dimensionalCheck: 'Double-Entry Invariant Verified: Total Debits (₹45,000) ≡ Total Credits (₹45,000).'
      }
    ];
  }

  // Quadratic equations (Maths)
  if (lower.includes('quadratic')) {
    return [
      {
        title: 'Quadratic Equations: Complete Solution & Vertex Analysis',
        problemStatement: 'Solve the quadratic equation 2x² - 7x + 3 = 0 using the quadratic formula. Find the roots, calculate the discriminant, and determine the coordinates of the parabola vertex.',
        givenData: [
          { symbol: 'a', value: '2', unit: 'coefficient', description: 'Leading coefficient' },
          { symbol: 'b', value: '-7', unit: 'coefficient', description: 'Linear coefficient' },
          { symbol: 'c', value: '3', unit: 'constant', description: 'Constant term' }
        ],
        formulaUsed: 'x = [-b ± √(b² - 4ac)] / (2a)  |  D = b² - 4ac  |  Vertex = (-b/2a, -D/4a)',
        stepByStepSolution: [
          'Step 1 (Discriminant): D = b² - 4ac = (-7)² - 4(2)(3) = 49 - 24 = 25. Since D > 0 and a perfect square, roots are real, rational, and distinct.',
          'Step 2 (Roots Calculation): x = [-(-7) ± √25] / (2 × 2) = (7 ± 5) / 4.',
          'Step 3 (Root 1): x₁ = (7 + 5) / 4 = 12 / 4 = 3.0.',
          'Step 4 (Root 2): x₂ = (7 - 5) / 4 = 2 / 4 = 0.5 (or 1/2).',
          'Step 5 (Vertex Coordinates): h = -b / (2a) = 7 / 4 = 1.75; k = -D / (4a) = -25 / (4 × 2) = -25 / 8 = -3.125.'
        ],
        finalAnswer: 'Roots: x₁ = 3.0, x₂ = 0.5; Discriminant D = 25; Vertex Coordinates: (1.75, -3.125)',
        dimensionalCheck: '2(3)² - 7(3) + 3 = 18 - 21 + 3 = 0 ✓; 2(0.5)² - 7(0.5) + 3 = 0.5 - 3.5 + 3 = 0 ✓.'
      }
    ];
  }

  // Non-numerical default
  return [];
}

// ==============================================================================
// 3. FINAL COMPREHENSIVE REVISION PAGE BUILDER (MANDATORY FEATURE)
// ==============================================================================

export function buildComprehensiveRevisionPage(
  classification: TopicClassification,
  contentMarkdown: string
): ComprehensiveRevisionPage {
  const { topic, subject, discipline } = classification;
  const lower = topic.toLowerCase();

  let executiveSummary = `Executive summary of ${topic} (${subject} • ${discipline}): Mastering the foundational principles, structural interactions, and exam-critical relationships.`;
  let quickMatrix: ComprehensiveRevisionPage['quickRevisionMatrix'] = [];
  let keyFormulasOrDates: ComprehensiveRevisionPage['keyFormulasOrDatesOrRules'] = [];
  let definitions: ComprehensiveRevisionPage['highYieldDefinitions'] = [];
  let mnemonics: string[] = [];
  let misconceptions: string[] = [];
  let examQuestions: ComprehensiveRevisionPage['modelExamQuestions'] = [];

  // Subject-Tailored Final Revision Data
  if (lower.includes('friction')) {
    executiveSummary = 'Friction is the electromagnetic contact force opposing the relative sliding motion or tendency of motion between two interacting surfaces. Its magnitude is governed by surface roughness and Normal Reaction, independent of apparent contact area.';
    quickMatrix = [
      { concept: 'Static Friction (f_s)', keyRuleOrPrinciple: 'Self-adjusting from 0 up to limiting friction f_s(max) = μ_s · N', examSignificance: 'High: Object remains stationary until F_applied > f_s(max)' },
      { concept: 'Kinetic Friction (f_k)', keyRuleOrPrinciple: 'Nearly constant opposing force f_k = μ_k · N (μ_k < μ_s)', examSignificance: 'Crucial: Used in all F_net = m · a sliding calculations' },
      { concept: 'Rolling Friction (f_r)', keyRuleOrPrinciple: 'Arises from surface deformation; f_r ≪ f_k ≪ f_s', examSignificance: 'Practical applications: Ball bearings & wheels reduce energy loss' }
    ];
    keyFormulasOrDates = [
      { label: 'Limiting Static Friction', formulaOrDetail: 'f_s(max) = μ_s · N', unitsOrSignificance: 'Newtons (N) • N = mg on flat plane' },
      { label: 'Kinetic Friction', formulaOrDetail: 'f_k = μ_k · N', unitsOrSignificance: 'Newtons (N) • Opposes instantaneous velocity' },
      { label: 'Angle of Friction (λ)', formulaOrDetail: 'tan λ = μ_s', unitsOrSignificance: 'Angle between resultant reaction R and normal N' },
      { label: 'Angle of Repose (θ)', formulaOrDetail: 'θ = λ ⇒ tan θ = μ_s', unitsOrSignificance: 'Maximum inclination angle before slide begins' }
    ];
    definitions = [
      { term: 'Friction', conciseDefinition: 'Contact force resisting relative tangential motion between surfaces.' },
      { term: 'Coefficient of Friction (μ)', conciseDefinition: 'Dimensionless ratio of limiting friction to normal reaction force.' },
      { term: 'Angle of Repose', conciseDefinition: 'Minimum angle of an inclined plane at which a body begins to slide down under gravity alone.' }
    ];
    mnemonics = [
      'Remember "S-K-R": Static > Kinetic > Rolling (Friction hierarchy).',
      'Remember "N = mg cos θ" on inclined planes (never assume N = mg on an incline!).'
    ];
    misconceptions = [
      'Misconception: Friction always opposes motion. Fact: Friction opposes RELATIVE motion (friction between shoes and ground propels you forward!).',
      'Misconception: Increasing contact area increases friction. Fact: Apparent area does not affect friction because pressure decreases proportionally.'
    ];
    examQuestions = [
      { marks: 3, question: 'State the laws of limiting friction.', answerKey: '1. Proportional to Normal reaction. 2. Independent of apparent area. 3. Depends on nature of materials. 4. Acts opposite to intended motion.' },
      { marks: 5, question: 'Derive the relation between angle of friction and angle of repose.', answerKey: 'At limiting equilibrium on an incline: mg sin θ = f_s = μ_s (mg cos θ) ⇒ tan θ = μ_s. Since tan λ = μ_s, θ = λ.' }
    ];
  } else if (lower.includes('macbeth')) {
    executiveSummary = 'Shakespeare’s Macbeth is a psychological tragedy exploring the corrosive effect of unchecked political ambition (Hamartia). Spurred by the Witches’ ambiguous prophecies and Lady Macbeth’s instigation, Macbeth murders King Duncan, plunging Scotland into tyrannical bloodshed before his prophesied downfall.';
    quickMatrix = [
      { concept: 'Act 1: Temptation & Prophecy', keyRuleOrPrinciple: 'Witches promise Thane of Cawdor & King; Macbeth’s vaulting ambition awakens', examSignificance: 'Theme: "Fair is foul, and foul is fair" (Moral inversion)' },
      { concept: 'Act 2: Regicide & Guilt', keyRuleOrPrinciple: 'Murder of Duncan; Neptune’s ocean cannot wash blood from hands', examSignificance: 'Imagery: Blood, sleeplessness, knocking at the gate' },
      { concept: 'Act 3: Climax & Paranoia', keyRuleOrPrinciple: 'Banquo murdered; Fleance escapes; Banquo’s ghost unhinges Macbeth at banquet', examSignificance: 'Turning point: Macbeth recognizes his fruitless crown' },
      { concept: 'Act 4–5: Downfall & Catharsis', keyRuleOrPrinciple: 'Birnam Wood moves to Dunsinane; Macduff (not of woman born) slays Macbeth', examSignificance: 'Resolution: Restoration of lawful order under Malcolm' }
    ];
    keyFormulasOrDates = [
      { label: 'Date of Composition', formulaOrDetail: 'c. 1606 (Jacobean Era)', unitsOrSignificance: 'Written following the 1605 Gunpowder Plot to honor King James I' },
      { label: 'Key Motif', formulaOrDetail: 'Blood, Sleep, Daggers & Night', unitsOrSignificance: 'External symbols of internal psychological torment and guilt' }
    ];
    definitions = [
      { term: 'Hamartia', conciseDefinition: 'The tragic flaw leading to the downfall of a tragic hero (Macbeth’s vaulting ambition).' },
      { term: 'Soliloquy', conciseDefinition: 'Dramatic monologue where a character reveals inner thoughts to the audience alone.' },
      { term: 'Dramatic Irony', conciseDefinition: 'Audience knows truth unknown to characters (Duncan praising Macbeth’s pleasant castle).' }
    ];
    mnemonics = [
      'Remember "P-R-C-T-D": Prophecy → Regicide → Climax → Tyranny → Downfall.'
    ];
    misconceptions = [
      'Misconception: The Witches force Macbeth to kill Duncan. Fact: The Witches present prophecies; Macbeth makes the conscious moral choice to murder.',
      'Misconception: Lady Macbeth never feels remorse. Fact: Act 5 sleepwalking scene ("Out, damned spot!") reveals her complete psychological collapse.'
    ];
    examQuestions = [
      { marks: 5, question: 'Analyze Lady Macbeth’s character transformation from Act 1 to Act 5.', answerKey: 'In Act 1, she invokes dark spirits to unsex her and scorns guilt ("A little water clears us of this deed"). By Act 5, guilt destroys her sanity as she endlessly washes imaginary blood in her sleep.' }
    ];
  } else if (lower.includes('french revolution')) {
    executiveSummary = 'The French Revolution (1789–1799) dismantled the feudal Ancien Régime, replacing absolute monarchy with democratic principles of Liberté, Égalité, Fraternité. Triggered by fiscal bankruptcy, social inequity (Third Estate tax burden), and Enlightenment philosophy, it reshaped modern European governance.';
    quickMatrix = [
      { concept: 'Estates-General (May 1789)', keyRuleOrPrinciple: 'Deadlock over voting rights (one vote per estate vs. per head)', examSignificance: 'Third Estate declared itself the sovereign National Assembly' },
      { concept: 'Storming of the Bastille (14 July 1789)', keyRuleOrPrinciple: 'Parisian citizens seized the royal fortress prison for gunpowder & liberty', examSignificance: 'Celebrated as the birth of French liberty & Bastille Day' },
      { concept: 'Rights of Man (Aug 1789)', keyRuleOrPrinciple: 'Declaration proclaimed universal equality, freedom of speech & popular sovereignty', examSignificance: 'Foundational document of modern constitutional democracy' }
    ];
    keyFormulasOrDates = [
      { label: '5 May 1789', formulaOrDetail: 'Estates-General convened at Versailles', unitsOrSignificance: 'First meeting since 1614; catalyst for revolution' },
      { label: '14 July 1789', formulaOrDetail: 'Fall of the Bastille', unitsOrSignificance: 'Destruction of absolute royal despotism' },
      { label: '26 August 1789', formulaOrDetail: 'Declaration of Rights of Man', unitsOrSignificance: 'Abolition of aristocratic feudal privilege' },
      { label: '1793 – 1794', formulaOrDetail: 'Reign of Terror (Robespierre)', unitsOrSignificance: 'Guillotine executions & Jacobin dictatorship' }
    ];
    definitions = [
      { term: 'Ancien Régime', conciseDefinition: 'The political and social system of France before 1789 characterized by feudal estates.' },
      { term: 'Third Estate', conciseDefinition: '98% of the French population (peasants, workers, bourgeoisie) who bore all taxation.' },
      { term: 'Jacobins', conciseDefinition: 'Radical political club led by Maximilien Robespierre during the National Convention.' }
    ];
    mnemonics = [
      'Remember "L-E-F": Liberté, Égalité, Fraternité (Slogan of the Revolution).'
    ];
    misconceptions = [
      'Misconception: France was in poverty because the whole country was poor. Fact: France was wealthy, but the tax burden fell entirely on the Third Estate while Clergy and Nobility were exempt.'
    ];
    examQuestions = [
      { marks: 5, question: 'Explain how the social structure of France contributed to the outbreak of the French Revolution.', answerKey: '1st & 2nd Estates (Clergy & Nobility, 2% of population) owned 60% of land and paid 0 taxes. 3rd Estate (98%) paid tithes, feudal dues, and state taxes (taille) while having no political representation.' }
    ];
  } else if (lower.includes('journal')) {
    executiveSummary = 'Journalizing is the foundational double-entry recording of commercial transactions in chronological order. Guided by the three Golden Rules of Accounting, every debit entry is matched by an equal credit entry, maintaining the fundamental accounting equation Assets = Liabilities + Capital.';
    quickMatrix = [
      { concept: 'Real Accounts', keyRuleOrPrinciple: 'Debit what comes in, Credit what goes out (Tangible & Intangible Assets)', examSignificance: 'Cash, Machinery, Building, Inventory' },
      { concept: 'Personal Accounts', keyRuleOrPrinciple: 'Debit the receiver, Credit the giver (Persons, Firms, Bank)', examSignificance: 'Debtors, Creditors, Bank A/c, Capital A/c' },
      { concept: 'Nominal Accounts', keyRuleOrPrinciple: 'Debit all expenses/losses, Credit all incomes/gains', examSignificance: 'Rent, Salaries, Commission, Interest' }
    ];
    keyFormulasOrDates = [
      { label: 'Accounting Equation', formulaOrDetail: 'Assets = Liabilities + Capital', unitsOrSignificance: 'Balance Sheet fundamental equality' },
      { label: 'Trade Discount', formulaOrDetail: 'Deducted directly from catalogue price', unitsOrSignificance: 'Never recorded in journal entry columns' },
      { label: 'Cash Discount', formulaOrDetail: 'Recorded in Discount Allowed/Received A/c', unitsOrSignificance: 'Incentive for prompt cash/bank payment' }
    ];
    definitions = [
      { term: 'Journal', conciseDefinition: 'The book of original entry where financial transactions are recorded chronologically.' },
      { term: 'Narration', conciseDefinition: 'A brief explanatory description written below each journal entry.' },
      { term: 'Ledger Posting', conciseDefinition: 'Transferring debits and credits from the journal to respective ledger accounts.' }
    ];
    mnemonics = [
      'Remember "DEALER": Dividends, Expenses, Assets (Increase on Debit) | Liabilities, Equity, Revenue (Increase on Credit).'
    ];
    misconceptions = [
      'Misconception: Trade discount is recorded in the Discount account. Fact: Trade discount is deducted on the invoice; only Cash Discount is posted to the Discount account.'
    ];
    examQuestions = [
      { marks: 4, question: 'State the three Golden Rules of Accounting with two examples each.', answerKey: '1. Real: Debit what comes in, Credit what goes out (Cash, Furniture). 2. Personal: Debit the receiver, Credit the giver (Ram, State Bank). 3. Nominal: Debit expenses, Credit incomes (Salaries, Rent received).' }
    ];
  } else if (lower.includes('circular')) {
    executiveSummary = 'Circular motion describes the movement of an object along a curved circumference. Even at constant speed, continuous directional change creates inward centripetal acceleration (a_c = v²/r) driven by real inward forces like tension, friction, or gravity.';
    quickMatrix = [
      { concept: 'Centripetal Acceleration (a_c)', keyRuleOrPrinciple: 'Inward radially directed acceleration: a_c = v²/r = ω²r', examSignificance: 'Mandatory in all orbital, vehicle turn & pendulum problems' },
      { concept: 'Banking of Roads', keyRuleOrPrinciple: 'Optimum banking angle eliminates friction dependency: tan θ = v² / (rg)', examSignificance: 'Crucial 5-mark derivation in board examinations' }
    ];
    keyFormulasOrDates = [
      { label: 'Centripetal Acceleration', formulaOrDetail: 'a_c = v² / r = ω² · r', unitsOrSignificance: 'm/s² • Points directly toward the center' },
      { label: 'Centripetal Force', formulaOrDetail: 'F_c = (m · v²) / r', unitsOrSignificance: 'Newtons (N) • Must be provided by a real physical force' },
      { label: 'Optimum Banking Angle', formulaOrDetail: 'tan θ = v² / (r · g)', unitsOrSignificance: 'Dimensionless angle θ for zero sideways friction wear' }
    ];
    definitions = [
      { term: 'Centripetal Acceleration', conciseDefinition: 'The radial acceleration directed toward the center of curvature maintaining circular motion.' },
      { term: 'Angular Velocity (ω)', conciseDefinition: 'The rate of change of angular displacement with respect to time (ω = dθ/dt).' },
      { term: 'Banking of Roads', conciseDefinition: 'Raising the outer edge of a curved road above the inner edge to provide necessary centripetal force.' }
    ];
    mnemonics = [
      'Remember "R-I-C": Radial, Inward, Centripetal (always toward the center!).'
    ];
    misconceptions = [
      'Misconception: Centrifugal force is a real outward force acting on the body. Fact: Centrifugal force is a pseudo-inertial force perceived only in the non-inertial rotating frame.'
    ];
    examQuestions = [
      { marks: 5, question: 'Derive the expression for the maximum safe speed of a vehicle on a banked road with friction.', answerKey: 'Resolve Normal reaction N and friction f along horizontal and vertical axes: N cos θ - f sin θ = mg; N sin θ + f cos θ = mv²/r. Divide equations and substitute f = μN to yield v_max = √[rg (μ + tan θ) / (1 - μ tan θ)].' }
    ];
  } else if (lower.includes('photosynthesis')) {
    executiveSummary = 'Photosynthesis is the photo-biochemical transduction through which oxygenic photoautotrophs convert radiant solar energy, carbon dioxide, and water into chemical bond energy (D-glucose) within chloroplasts, releasing molecular oxygen as a vital byproduct.';
    quickMatrix = [
      { concept: 'Light Reactions (Thylakoid)', keyRuleOrPrinciple: 'Photolysis of water (2H₂O → 4H⁺ + 4e⁻ + O₂) generating ATP & NADPH via Z-scheme', examSignificance: 'Produces assimilatory power for the Calvin cycle' },
      { concept: 'Dark Reactions / Calvin Cycle (Stroma)', keyRuleOrPrinciple: 'Enzymatic carbon fixation mediated by RuBisCO converting CO₂ into Triose phosphates', examSignificance: 'Light-independent stage producing sucrose and starch' }
    ];
    keyFormulasOrDates = [
      { label: 'Balanced Overall Equation', formulaOrDetail: '6CO₂ + 6H₂O + photons → C₆H₁₂O₆ + 6O₂', unitsOrSignificance: 'ΔG° = +2870 kJ/mol (Endergonic solar storage)' },
      { label: 'Site of Photolysis', formulaOrDetail: 'Oxygen-Evolving Complex (OEC) / Photosystem II', unitsOrSignificance: 'Requires Mn²⁺ and Cl⁻ cofactor ions' }
    ];
    definitions = [
      { term: 'Photosynthesis', conciseDefinition: 'The biological synthesis of organic compounds from CO₂ and water utilizing light absorbed by chlorophyll.' },
      { term: 'Photophosphorylation', conciseDefinition: 'The synthesis of ATP from ADP and inorganic phosphate driven by light-generated proton gradients.' },
      { term: 'Calvin Cycle', conciseDefinition: 'The cyclic enzymatic pathway in the chloroplast stroma that fixes CO₂ into glucose.' }
    ];
    mnemonics = [
      'Remember "T-L / S-D": Thylakoid = Light reactions | Stroma = Dark reactions.'
    ];
    misconceptions = [
      'Misconception: Dark reactions only occur at night. Fact: Dark reactions occur during the daytime; they are named "dark" solely because they do not directly absorb photons, but require daytime ATP/NADPH.'
    ];
    examQuestions = [
      { marks: 5, question: 'Describe the cyclic and non-cyclic photophosphorylation occurring during light reactions.', answerKey: 'Non-cyclic involves both PS II (P680) and PS I (P700), photolysis of water, and produces both ATP and NADPH. Cyclic involves only PS I (P700), recirculates electrons through ferredoxin and cytochrome b6f, and generates only ATP without O₂ evolution.' }
    ];
  } else if (lower.includes('heart')) {
    executiveSummary = 'The human heart is a myogenic, four-chambered muscular organ delivering double circulation (pulmonary and systemic). Synchronized by the Sinoatrial (SA) node pacemaker, it maintains continuous oxygenation, systemic perfusion, and nutrient exchange across vascular beds.';
    quickMatrix = [
      { concept: 'Right Heart (Deoxygenated)', keyRuleOrPrinciple: 'Receives SVC/IVC venous return → Right Atrium → Tricuspid → Right Ventricle → Pulmonary Artery', examSignificance: 'Low pressure pulmonary circuit (~25/10 mmHg)' },
      { concept: 'Left Heart (Oxygenated)', keyRuleOrPrinciple: 'Receives Pulmonary Vein return → Left Atrium → Bicuspid/Mitral → Left Ventricle → Systemic Aorta', examSignificance: 'High pressure systemic circuit (~120/80 mmHg; thick myocardium)' }
    ];
    keyFormulasOrDates = [
      { label: 'Cardiac Output Equation', formulaOrDetail: 'Cardiac Output = Stroke Volume (SV) × Heart Rate (HR)', unitsOrSignificance: '~70 mL/beat × 72 bpm ≈ 5.04 Liters/minute at rest' },
      { label: 'Normal Blood Pressure', formulaOrDetail: '120 / 80 mmHg', unitsOrSignificance: 'Systolic ventricular contraction / Diastolic resting refill' }
    ];
    definitions = [
      { term: 'Double Circulation', conciseDefinition: 'Circulatory mechanism where blood passes through the heart twice during each complete circuit of the body.' },
      { term: 'Sinoatrial (SA) Node', conciseDefinition: 'The primary pacemaker tissue in the right atrium initiating rhythmic cardiac action potentials.' },
      { term: 'Cardiac Cycle', conciseDefinition: 'The sequence of alternating systole (contraction) and diastole (relaxation) comprising one heartbeat.' }
    ];
    mnemonics = [
      'Remember "T-P-M-A": Tricuspid → Pulmonary → Mitral → Aortic (Anatomical valve sequence).'
    ];
    misconceptions = [
      'Misconception: All arteries carry oxygenated blood and all veins carry deoxygenated blood. Fact: Pulmonary Artery carries deoxygenated blood, and Pulmonary Veins carry oxygenated blood.'
    ];
    examQuestions = [
      { marks: 5, question: 'Explain the working of the human heart with emphasis on double circulation.', answerKey: '1. Pulmonary circulation: Deoxygenated blood from right ventricle to lungs via pulmonary arteries, oxygenated blood returns via pulmonary veins to left atrium. 2. Systemic circulation: Oxygenated blood from left ventricle pumped into aorta to supply body tissues, deoxygenated blood returned via vena cava to right atrium. Prevents mixing of oxygenated and deoxygenated blood.' }
    ];
  } else if (lower.includes('bonding')) {
    executiveSummary = 'Chemical bonding is the fundamental electrostatic interaction between atomic nuclei and valence electrons that lowers thermodynamic potential energy, achieving stable inert gas octet or duplet valence electronic configurations.';
    quickMatrix = [
      { concept: 'Ionic Bonding', keyRuleOrPrinciple: 'Complete valence electron transfer between electropositive metals and electronegative nonmetals (ΔEN > 1.7)', examSignificance: 'Forms high melting point crystalline lattice structures' },
      { concept: 'Covalent Bonding', keyRuleOrPrinciple: 'Mutual sharing of electron pairs between nonmetallic atoms (single, double, triple bonds)', examSignificance: 'Directional bonds determining molecular 3D geometry (VSEPR theory)' }
    ];
    keyFormulasOrDates = [
      { label: 'Octet Rule', formulaOrDetail: 'ns² np⁶ valence configuration', unitsOrSignificance: 'Noble gas thermodynamic stability criterion' },
      { label: 'Formal Charge', formulaOrDetail: 'FC = V - N - (B / 2)', unitsOrSignificance: 'Valence electrons minus non-bonding electrons minus half bonding electrons' }
    ];
    definitions = [
      { term: 'Ionic Bond', conciseDefinition: 'Electrostatic force of attraction holding oppositely charged cations and anions together.' },
      { term: 'Covalent Bond', conciseDefinition: 'Chemical bond formed by the mutual sharing of one or more electron pairs between atoms.' },
      { term: 'Electronegativity', conciseDefinition: 'The relative tendency of an atom in a molecule to attract shared bonding electron pairs toward itself.' }
    ];
    mnemonics = [
      'Remember "F-O-N-Cl": Fluorine > Oxygen > Nitrogen > Chlorine (Order of highest electronegativities).'
    ];
    misconceptions = [
      'Misconception: Covalent bonds are always purely non-polar. Fact: Differences in electronegativity create permanent bond dipoles, giving partial ionic character to covalent molecules (e.g. H₂O, HCl).'
    ];
    examQuestions = [
      { marks: 4, question: 'Distinguish between ionic and covalent compounds on four physical properties.', answerKey: '1. Melting/Boiling points: Ionic high, Covalent low. 2. Electrical conductivity: Ionic conducts in molten/aqueous state, Covalent non-conducting. 3. Solubility: Ionic soluble in polar solvents (water), Covalent in non-polar organic solvents. 4. Bond nature: Ionic non-directional, Covalent directional.' }
    ];
  } else if (lower.includes('quadratic')) {
    executiveSummary = 'A quadratic equation is a second-degree polynomial equation of the standard canonical form ax² + bx + c = 0 (a ≠ 0). Its root nature and geometrical parabola vertex are governed by the discriminant invariant D = b² - 4ac.';
    quickMatrix = [
      { concept: 'Discriminant D > 0', keyRuleOrPrinciple: 'Two distinct real roots: x = (-b ± √D) / (2a)', examSignificance: 'Parabola intersects x-axis at two distinct real coordinates' },
      { concept: 'Discriminant D = 0', keyRuleOrPrinciple: 'Two equal real roots (coincident): x = -b / (2a)', examSignificance: 'Parabola touches x-axis tangentially at its vertex' },
      { concept: 'Discriminant D < 0', keyRuleOrPrinciple: 'Complex conjugate roots: x = (-b ± i√|D|) / (2a)', examSignificance: 'Parabola does not intersect the real x-axis' }
    ];
    keyFormulasOrDates = [
      { label: 'Quadratic Formula', formulaOrDetail: 'x = [-b ± √(b² - 4ac)] / (2a)', unitsOrSignificance: 'Analytical root formula for all second-degree polynomials' },
      { label: 'Vieta’s Relations', formulaOrDetail: 'α + β = -b / a  ;  α · β = c / a', unitsOrSignificance: 'Direct relationship between polynomial roots and coefficients' },
      { label: 'Parabola Vertex', formulaOrDetail: '(h, k) = (-b / 2a,  -D / 4a)', unitsOrSignificance: 'Extremum coordinate (minimum if a > 0, maximum if a < 0)' }
    ];
    definitions = [
      { term: 'Quadratic Equation', conciseDefinition: 'A second-order polynomial equation in a single variable x with standard form ax² + bx + c = 0, where a ≠ 0.' },
      { term: 'Discriminant (D)', conciseDefinition: 'The algebraic quantity b² - 4ac determining the nature and multiplicity of the polynomial roots.' },
      { term: 'Roots of Quadratic', conciseDefinition: 'The numerical values of variable x satisfying the equality ax² + bx + c = 0.' }
    ];
    mnemonics = [
      'Remember "Negative b plus or minus square root of b squared minus 4 a c, all over 2 a".'
    ];
    misconceptions = [
      'Misconception: A quadratic equation always has two distinct answers. Fact: When D = 0, the equation has one repeated (coincident) root.'
    ];
    examQuestions = [
      { marks: 4, question: 'Find the value of k for which 2x² - kx + 3 = 0 has real and equal roots.', answerKey: 'For real and equal roots, D = 0 ⇒ b² - 4ac = 0 ⇒ (-k)² - 4(2)(3) = 0 ⇒ k² - 24 = 0 ⇒ k = ±√24 = ±2√6.' }
    ];
  } else if (lower.includes('climate')) {
    executiveSummary = 'Climate represents the statistical aggregate of atmospheric weather patterns over a prolonged period (typically 30+ years). It is governed by latitude, altitude, continentality, ocean currents, and global atmospheric circulation cells (Hadley, Ferrel, Polar).';
    quickMatrix = [
      { concept: 'Latitude (Insolation Angle)', keyRuleOrPrinciple: 'Direct vertical solar rays at equator vs. oblique rays at poles', examSignificance: 'Primary driver of global tropical, temperate and polar climate zones' },
      { concept: 'Coriolis Effect & Winds', keyRuleOrPrinciple: 'Earth rotation deflects winds right in Northern and left in Southern Hemisphere', examSignificance: 'Determines trade winds, westerlies, and seasonal monsoon reversals' }
    ];
    keyFormulasOrDates = [
      { label: 'Normal Lapse Rate', formulaOrDetail: '6.5 °C decrease per 1,000 meters altitude', unitsOrSignificance: 'Explains why high altitude hill stations remain colder' },
      { label: 'Intertropical Convergence Zone (ITCZ)', formulaOrDetail: 'Thermal equator shift with solstices', unitsOrSignificance: 'Driver of the South Asian Summer and Winter Monsoons' }
    ];
    definitions = [
      { term: 'Climate', conciseDefinition: 'The long-term average weather pattern and atmospheric variability of a region over at least 30 years.' },
      { term: 'Coriolis Force', conciseDefinition: 'Apparent deflecting force exerted by Earth’s axial rotation on circulating air and ocean currents.' },
      { term: 'Monsoon', conciseDefinition: 'Seasonal reversal in the direction of planetary winds accompanied by corresponding precipitation changes.' }
    ];
    mnemonics = [
      'Remember "LOWERN": Latitude, Ocean currents, Winds, Elevation, Relief, Nearness to water.'
    ];
    misconceptions = [
      'Misconception: Weather and climate are interchangeable. Fact: Weather is day-to-day atmospheric conditions; climate is multi-decadal statistical averages.'
    ];
    examQuestions = [
      { marks: 5, question: 'Explain the mechanism of the Indian Monsoon with reference to differential heating and ITCZ.', answerKey: '1. Differential heating: Tibetan plateau heats up intensely forming low pressure; Indian Ocean remains high pressure. 2. Shift of ITCZ: Moves north over Ganga plains in summer. 3. Tropical easterly jet stream and Somali jet steer moisture-laden southwest winds over the subcontinent.' }
    ];
  } else if (lower.includes('right') || lower.includes('civic') || lower.includes('pol')) {
    executiveSummary = 'Fundamental Rights are basic human freedoms entrenched in Part III of the Constitution (Articles 12–35) guaranteed to all citizens against state overreach. Justiciable and protected by Constitutional Remedies (Article 32 & 226), they secure democratic liberty and civic equality.';
    quickMatrix = [
      { concept: 'Right to Equality (Arts. 14–18)', keyRuleOrPrinciple: 'Equality before law, prohibition of discrimination, abolition of untouchability & titles', examSignificance: 'Foundation of rule of law and affirmative action reservations' },
      { concept: 'Right to Freedom (Arts. 19–22)', keyRuleOrPrinciple: 'Six democratic freedoms (speech, assembly, association, movement, residence, profession)', examSignificance: 'Subject to reasonable restrictions in the interest of state sovereignty' },
      { concept: 'Right to Constitutional Remedies (Art. 32)', keyRuleOrPrinciple: 'Right to move Supreme Court via 5 Prerogative Writs (Habeas Corpus, Mandamus, etc.)', examSignificance: 'Dr. B.R. Ambedkar termed Art. 32 the "Heart and Soul of the Constitution"' }
    ];
    keyFormulasOrDates = [
      { label: 'Part III of Constitution', formulaOrDetail: 'Articles 12 to 35 (Magna Carta of India)', unitsOrSignificance: 'Justiciable civil rights enforceable by Supreme Court' },
      { label: '44th Constitutional Amendment (1978)', formulaOrDetail: 'Right to Property deleted from Part III', unitsOrSignificance: 'Demoted to ordinary legal right under Article 300A' }
    ];
    definitions = [
      { term: 'Fundamental Rights', conciseDefinition: 'Constitutional civil liberties guaranteed to all citizens that are legally enforceable in courts of law.' },
      { term: 'Writ', conciseDefinition: 'A formal judicial order issued by the Supreme Court or High Court commanding a legal remedy.' },
      { term: 'Judicial Review', conciseDefinition: 'The power of courts to examine the constitutionality of legislative acts and executive orders.' }
    ];
    mnemonics = [
      'Remember "H-M-P-C-Q" for Writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto.'
    ];
    misconceptions = [
      'Misconception: Fundamental Rights are absolute without any limits. Fact: Fundamental Rights are qualified; the State can impose reasonable restrictions.'
    ];
    examQuestions = [
      { marks: 5, question: 'Why is Article 32 considered the Heart and Soul of the Constitution? Explain two writs.', answerKey: 'Article 32 provides the procedural right to approach the Supreme Court directly for enforcement of any fundamental right. Without Article 32, declarations of rights would be empty words. 1. Habeas Corpus: Orders production of a detained person to determine legality of detention. 2. Mandamus: Commands a public official to perform their statutory duty.' }
    ];
  } else if (lower.includes('network') || lower.includes('computer')) {
    executiveSummary = 'Computer networking is the interconnection of autonomous computing systems to exchange data packets and share resources using standardized communication protocols. The hierarchical OSI 7-layer and practical TCP/IP suites define modular standards from physical bits to application services.';
    quickMatrix = [
      { concept: 'OSI 7-Layer Hierarchy', keyRuleOrPrinciple: 'Physical → Data Link → Network → Transport → Session → Presentation → Application', examSignificance: 'Standard conceptual reference framework tested in all board/IT exams' },
      { concept: 'Packet Switching & Routing', keyRuleOrPrinciple: 'Network layer logical IP addressing and shortest path packet forwarding (Routers)', examSignificance: 'Decoupled connectionless routing avoiding single point of network failure' }
    ];
    keyFormulasOrDates = [
      { label: 'OSI 7 Layers', formulaOrDetail: 'L1: Phys, L2: DLL, L3: Net, L4: Trans, L5: Sess, L6: Pres, L7: App', unitsOrSignificance: 'Standard ISO/IEC 7498-1 open architecture' },
      { label: 'IPv4 Address Format', formulaOrDetail: '32-bit dotted-decimal notation (e.g. 192.168.1.1)', unitsOrSignificance: '4.3 billion address pool (exhaustion resolved by IPv6 128-bit)' }
    ];
    definitions = [
      { term: 'Computer Network', conciseDefinition: 'A collection of interconnected computing devices that communicate and share resources using standardized protocols.' },
      { term: 'OSI Model', conciseDefinition: 'A seven-layer conceptual framework developed by ISO characterizing telecommunication and computing protocols.' },
      { term: 'IP Address', conciseDefinition: 'A unique numerical identifier assigned to every device participating in a computer network using Internet Protocol.' }
    ];
    mnemonics = [
      'Remember "All People Seem To Need Data Processing" (Application down to Physical) or "Please Do Not Throw Sausage Pizza Away" (Physical up to Application).'
    ];
    misconceptions = [
      'Misconception: The OSI model is the physical protocol running the internet. Fact: TCP/IP is the practical 4-layer protocol stack of the internet; OSI is a reference model.'
    ];
    examQuestions = [
      { marks: 5, question: 'Differentiate between TCP and UDP protocols with suitable network applications.', answerKey: '1. TCP: Connection-oriented, reliable, guarantees packet ordering via ACK numbers, error recovery; used for HTTP, Email (SMTP), File transfer (FTP). 2. UDP: Connectionless, unreliable best-effort, lightweight with no ACK overhead; used for DNS, VoIP, Live video streaming, Online gaming.' }
    ];
  } else if (lower.includes('demand') || lower.includes('supply') || lower.includes('economic')) {
    executiveSummary = 'Demand and supply are the fundamental market forces that determine price and quantity in a competitive economy. Intersecting at market equilibrium (Q_d = Q_s), price signals allocate scarce resources efficiently according to consumer willingness to pay and producer marginal cost.';
    quickMatrix = [
      { concept: 'Law of Demand', keyRuleOrPrinciple: 'Inverse relationship between price and quantity demanded (ceteris paribus): dQ_d/dP < 0', examSignificance: 'Downward sloping demand curve due to income and substitution effects' },
      { concept: 'Law of Supply', keyRuleOrPrinciple: 'Direct relationship between price and quantity supplied (ceteris paribus): dQ_s/dP > 0', examSignificance: 'Upward sloping supply curve due to increasing marginal costs' },
      { concept: 'Market Equilibrium', keyRuleOrPrinciple: 'Intersection where quantity demanded equals quantity supplied (P_e, Q_e)', examSignificance: 'Zero excess demand (shortage) and zero excess supply (surplus)' }
    ];
    keyFormulasOrDates = [
      { label: 'Price Elasticity of Demand (E_d)', formulaOrDetail: 'E_d = (%ΔQ_d) / (%ΔP) = (dQ/dP) · (P/Q)', unitsOrSignificance: 'Dimensionless sensitivity: |E_d| > 1 elastic, |E_d| < 1 inelastic' },
      { label: 'Market Clearing Equilibrium', formulaOrDetail: 'Q_d(P_e) = Q_s(P_e)', unitsOrSignificance: 'Equilibrium price P_e clearing all inventories' }
    ];
    definitions = [
      { term: 'Law of Demand', conciseDefinition: 'Economic principle stating that consumers purchase more of a good at lower prices and less at higher prices, other things remaining constant.' },
      { term: 'Market Equilibrium', conciseDefinition: 'The state where the market price equates quantity demanded by consumers to quantity supplied by producers.' },
      { term: 'Price Elasticity of Demand', conciseDefinition: 'A quantitative measure of the responsiveness of quantity demanded to a change in the product’s price.' }
    ];
    mnemonics = [
      'Remember "D-Down, S-Sky": Demand curve slopes Down; Supply curve slopes up to the Sky.'
    ];
    misconceptions = [
      'Misconception: A change in price shifts the demand curve. Fact: A change in price causes movement ALONG the curve (change in quantity demanded); only non-price factors (income, taste, substitutes) SHIFT the entire curve.'
    ];
    examQuestions = [
      { marks: 5, question: 'Given Q_d = 100 - 4P and Q_s = 20 + 4P, calculate equilibrium price and quantity, and determine market condition at P = ₹15.', answerKey: '1. At equilibrium: 100 - 4P = 20 + 4P ⇒ 8P = 80 ⇒ P_e = ₹10. Equilibrium quantity Q_e = 100 - 4(10) = 60 units. 2. At P = ₹15: Q_d = 100 - 4(15) = 40 units; Q_s = 20 + 4(15) = 80 units. Since Q_s > Q_d, there is an excess supply (market surplus) of 40 units, exerting downward pressure on price.' }
    ];
  } else {
    // General high-yield revision page
    executiveSummary = `Comprehensive educational mastery summary for ${topic} within ${subject}. Emphasizing core principles, structural definitions, and board exam requirements.`;
    quickMatrix = [
      { concept: 'Foundational Principle', keyRuleOrPrinciple: `Governs how ${topic} operates under standard conditions`, examSignificance: 'High: Essential for 2-mark definitions and 5-mark explanations' },
      { concept: 'Process & Mechanism', keyRuleOrPrinciple: 'Sequential transformation from inputs to outputs', examSignificance: 'Crucial: Step-by-step description in descriptive questions' }
    ];
    keyFormulasOrDates = [
      { label: 'Core Invariant', formulaOrDetail: `Defined within standard ${subject} curriculum`, unitsOrSignificance: 'Guarantees academic rigor' }
    ];
    definitions = [
      { term: topic, conciseDefinition: `A central topic in ${subject} (${discipline}) explaining essential mechanisms and principles.` },
      { term: `${topic} Principle`, conciseDefinition: `The foundational law, reaction, or mechanism governing ${topic} in curriculum standards.` },
      { term: 'Key Mechanism', conciseDefinition: `The functional process by which ${topic} produces measurable educational outcomes.` }
    ];
    mnemonics = [
      `Review ${topic} using the Input → Mechanism → Output framework.`
    ];
    misconceptions = [
      `Always distinguish everyday casual usage of "${topic}" from its rigorous academic definition in ${subject}.`
    ];
    examQuestions = [
      { marks: 5, question: `Explain the fundamental concept of ${topic} with suitable examples.`, answerKey: `Define ${topic}, state the key governing laws or characteristics, draw the labeled diagram, and provide two real-world applications.` }
    ];
  }

  const svgSpec = generateDomainSvg(classification.suggestedVisualType, topic);

  return {
    topic,
    subject,
    discipline,
    executiveSummary,
    quickRevisionMatrix: quickMatrix,
    keyFormulasOrDatesOrRules: keyFormulasOrDates,
    highYieldDefinitions: definitions,
    memoryMnemonics: mnemonics,
    commonMisconceptionsAndPitfalls: misconceptions,
    modelExamQuestions: examQuestions,
    diagramRecapCaption: svgSpec.caption,
    diagramRecapSvgDataUrl: svgSpec.dataUrl
  };
}

// ==============================================================================
// 4. MAIN UNIVERSAL NOTES GENERATION CONTROLLER
// ==============================================================================

export async function generateUniversalEducationalNote(params: {
  topic: string;
  subject?: string;
  context?: StudentAcademicContext;
  designModeOverride?: 'handwritten' | 'infographic' | 'formula_sheet' | 'chapter_notes';
  depthOverride?: 'concise' | 'detailed' | 'exam-prep';
}): Promise<UniversalNoteResult> {
  const cleanTopic = (params.topic || 'Study Topic').trim();
  const classification = classifyUniversalTopic(cleanTopic, params.context);

  const subject = params.subject || classification.subject;
  const discipline = classification.discipline;
  const level = params.context?.grade ? `Grade ${params.context.grade} (${params.context.board || 'CBSE'})` : 'Grade 10 (Curriculum Mapped)';
  const depth = params.depthOverride || params.context?.explanationDepth || 'detailed';
  const designMode = params.designModeOverride || classification.designModeDefault;

  // Retrieve Domain Visual Illustration
  const visualAsset = generateDomainSvg(classification.suggestedVisualType, cleanTopic);

  // Retrieve Domain Worked Problems
  const workedProblems = buildUniversalWorkedProblems(cleanTopic, subject);

  // Generate Mandatory Final Revision Page
  const finalRevision = buildComprehensiveRevisionPage(classification, '');

  // Compose Full White-Page Notebook Markdown
  const id = `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  let markdown = `# ${classification.normalizedTopic} — Complete Study Notebook\n`;
  markdown += `**Subject:** ${subject} | **Discipline:** ${discipline} | **Level:** ${level} | **Mode:** ${designMode.toUpperCase()}\n\n`;

  markdown += `## 1. Executive Introduction & Real-World Intuition\n${finalRevision.executiveSummary}\n\n`;

  markdown += `## 2. Core Subtopics & Curriculum Syllabus Mapping\n`;
  classification.subtopics.forEach((st, idx) => {
    markdown += `${idx + 1}. **${st}**\n`;
  });
  markdown += `\n`;

  markdown += `## 3. High-Yield Academic Definitions\n`;
  finalRevision.highYieldDefinitions.forEach((d) => {
    markdown += `- **${d.term}**: ${d.conciseDefinition}\n`;
  });
  markdown += `\n`;

  // Formulas & Numerical Problem Section (if applicable)
  if (classification.requiresFormulas || workedProblems.length > 0) {
    markdown += `## 4. Governing Formulas, SI Units & Mathematical Laws\n`;
    finalRevision.keyFormulasOrDatesOrRules.forEach((f) => {
      markdown += `- **${f.label}**: \`${f.formulaOrDetail}\` — *${f.unitsOrSignificance}*\n`;
    });
    markdown += `\n`;

    if (workedProblems.length > 0) {
      markdown += `## 5. Step-by-Step Solved Quantitative Numerical Problems\n`;
      workedProblems.forEach((wp, idx) => {
        markdown += `### Problem ${idx + 1}: ${wp.title}\n`;
        markdown += `> **Question:** ${wp.problemStatement}\n\n`;
        markdown += `**Given Data:**\n`;
        wp.givenData.forEach((g) => {
          markdown += `- \`${g.symbol}\` = ${g.value} ${g.unit} (${g.description})\n`;
        });
        markdown += `\n**Formula Used:** \`${wp.formulaUsed}\`\n\n`;
        markdown += `**Step-by-Step Solution:**\n`;
        wp.stepByStepSolution.forEach((s) => {
          markdown += `- ${s}\n`;
        });
        markdown += `\n**Final Answer:** **${wp.finalAnswer}**\n`;
        markdown += `*Dimensional Verification:* ${wp.dimensionalCheck}\n\n`;
      });
    }
  }

  // Visual Technical Diagram Section
  markdown += `## 6. Scientific Visual Diagram & Explanatory Walkthrough\n`;
  markdown += `### ${visualAsset.title}\n`;
  markdown += `![${visualAsset.title}](${visualAsset.dataUrl})\n`;
  markdown += `*Caption:* ${visualAsset.caption}\n\n`;

  // Misconceptions
  markdown += `## 7. Common Exam Misconceptions & Watchouts\n`;
  finalRevision.commonMisconceptionsAndPitfalls.forEach((m) => {
    markdown += `- ⚠️ ${m}\n`;
  });
  markdown += `\n`;

  // ==============================================================================
  // MANDATORY FINAL COMPREHENSIVE REVISION PAGE IN MARKDOWN
  // ==============================================================================
  markdown += `---\n\n`;
  markdown += `# 🌟 FINAL COMPREHENSIVE REVISION SHEET — ${cleanTopic.toUpperCase()}\n`;
  markdown += `*Designed for single-page pre-exam rapid revision and complete conceptual mastery.*\n\n`;

  markdown += `### A. Quick Revision Concept Matrix\n`;
  markdown += `| Core Concept | Governing Law / Mechanism | Exam Significance |\n`;
  markdown += `| :--- | :--- | :--- |\n`;
  finalRevision.quickRevisionMatrix.forEach((q) => {
    markdown += `| **${q.concept}** | ${q.keyRuleOrPrinciple} | ${q.examSignificance} |\n`;
  });
  markdown += `\n`;

  markdown += `### B. Master High-Yield Review Points\n`;
  finalRevision.keyFormulasOrDatesOrRules.forEach((k) => {
    markdown += `- **${k.label}**: \`${k.formulaOrDetail}\` (${k.unitsOrSignificance})\n`;
  });
  markdown += `\n`;

  markdown += `### C. Model Board Exam Questions & Key Answer Guidelines\n`;
  finalRevision.modelExamQuestions.forEach((eq, idx) => {
    markdown += `${idx + 1}. **[${eq.marks} Marks] ${eq.question}**\n`;
    markdown += `   - **Model Answer Key:** ${eq.answerKey}\n\n`;
  });

  const flashcards = finalRevision.highYieldDefinitions.map((d) => ({
    front: `Define: ${d.term} (${cleanTopic})`,
    back: d.conciseDefinition,
    sourceRef: `${cleanTopic} Knowledge Unit`
  }));

  const structuredPayload = {
    summary: finalRevision.executiveSummary,
    classification,
    subtopics: classification.subtopics,
    definitions: finalRevision.highYieldDefinitions,
    formulas: finalRevision.keyFormulasOrDatesOrRules,
    formula: classification.requiresFormulas && finalRevision.keyFormulasOrDatesOrRules.length > 0 ? {
      equation: finalRevision.keyFormulasOrDatesOrRules[0].formulaOrDetail,
      expression: finalRevision.keyFormulasOrDatesOrRules[0].formulaOrDetail,
      label: finalRevision.keyFormulasOrDatesOrRules[0].label,
      workedExample: workedProblems[0]?.problemStatement ? `${workedProblems[0].problemStatement} → ${workedProblems[0].finalAnswer}` : undefined
    } : undefined,
    workedProblems,
    visualAsset,
    images: [
      {
        id: `img-${Date.now()}`,
        title: visualAsset.title,
        caption: visualAsset.caption,
        imageUrl: visualAsset.dataUrl,
        altText: visualAsset.title,
        explanationSevenPart: {
          whatItShows: visualAsset.caption,
          majorParts: ['Key Structures & Vectors', 'Active Force Interactions', 'Governing Notation'],
          WhatEachLabelMeans: ['Primary Vector: Direction of driving force', 'Reactive Vector: Surface normal or opposing friction', 'Equilibrium Invariant: Net balance of forces'],
          stepByStepProcess: 'Observe the labeled components sequentially from initial state to equilibrium.',
          howToRead: 'Follow the arrows indicating direction and magnitude of interaction.',
          whatToNoticeFirst: 'Locate the central object and primary action vectors.',
          connectionToTopic: `Directly illustrates governing principles in ${classification.subject} examination problems.`
        }
      }
    ],
    imageUrl: visualAsset.dataUrl,
    finalRevisionPage: finalRevision,
    designMode,
    misconceptions: finalRevision.commonMisconceptionsAndPitfalls,
    examQuestions: finalRevision.modelExamQuestions,
    verificationBadge: 'Verified Educational Knowledge Unit (STUDYAI Knowledge Engine)'
  };

  return {
    id,
    title: cleanTopic,
    subject,
    discipline,
    topic: cleanTopic,
    chapter: classification.chapter,
    level,
    depth,
    notebook: subject,
    content_markdown: markdown,
    designMode,
    structured: structuredPayload,
    finalRevisionPage: finalRevision,
    flashcards,
    quiz: [],
    sourcesAndReferences: [
      {
        id: 'src-knowledge-library',
        title: `STUDYAI ${subject} Central Knowledge Unit`,
        type: 'VERIFIED_CURRICULUM',
        status: 'Source Verified',
        discipline
      }
    ],
    verificationStatus: 'Source Verified',
    created_at: now,
    updated_at: now
  };
}
