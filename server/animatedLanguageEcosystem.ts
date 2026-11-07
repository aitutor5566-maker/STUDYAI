/**
 * STUDYAI — Complete Animated, Picture-Based Language Learning & Speaking Skills Ecosystem
 *
 * Powers:
 * 1. Picture-Based Vocabulary Studio (15 Categories, Custom Animated SVG Artwork, 7 Languages)
 * 2. Language-Specific Script & Phonetics Mastery Decks (Hiragana/Katakana/Kanji, Telugu Achulu/Hallulu, Hindi Varnamala, etc.)
 * 3. Dedicated Speaking & Pronunciation Assessment Engine (Word Recognition, Pronunciation Rhythm, Sentence Accuracy)
 * 4. 7 Interactive Language Games (Games A to G: Picture to Word, Listen & Select, Speak the Word, Missing Letters, Word Matching, Sentence Builder, Conversation Challenge)
 * 5. Listening & Understanding Studio (5 Activity Modes with Normal & Slow 0.55x Audio)
 * 6. 8 Real-Life AI Conversation Scenarios with Constructive Support-Language Coaching
 */

export interface PictureVocabularyCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface LanguageTranslationEntry {
  word: string;
  romanization: string;
  meaning: string;
  sentence: string;
  sentenceRomanization?: string;
  sentenceMeaning: string;
  pronunciationTip: string;
}

export interface PictureVocabularyItem {
  id: string;
  category: string;
  englishWord: string;
  svgScene: string;
  accentColor: string;
  secondaryColor: string;
  illustrationSvgDataUrl: string;
  languages: Record<string, LanguageTranslationEntry>;
}

export const PICTURE_VOCABULARY_CATEGORIES: PictureVocabularyCategory[] = [
  { id: 'water_drinks', name: 'Water & Drinks', icon: '💧', color: '#0EA5E9', description: 'Water, tea, milk, and refreshing daily beverages' },
  { id: 'food', name: 'Food & Meals', icon: '🍱', color: '#F97316', description: 'Rice, bread, meals, and culinary essentials' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#EF4444', description: 'Apples, mangoes, bananas, and fresh orchard fruits' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥕', color: '#10B981', description: 'Carrots, tomatoes, leafy greens, and garden produce' },
  { id: 'animals', name: 'Animals', icon: '🐕', color: '#8B5CF6', description: 'Dogs, cats, elephants, and wildlife' },
  { id: 'birds', name: 'Birds', icon: '🦚', color: '#06B6D4', description: 'Peacocks, eagles, sparrows, and songbirds' },
  { id: 'colours', name: 'Colours', icon: '🎨', color: '#EC4899', description: 'Vibrant primary and nature colours' },
  { id: 'numbers', name: 'Numbers', icon: '🔢', color: '#6366F1', description: 'Counting, quantities, and everyday numerals' },
  { id: 'family', name: 'Family Members', icon: '👨‍👩‍👧‍👦', color: '#F59E0B', description: 'Mother, father, siblings, and relatives' },
  { id: 'school', name: 'School Objects', icon: '📚', color: '#3B82F6', description: 'Books, pencils, classroom tools, and study items' },
  { id: 'household', name: 'Household Objects', icon: '🏠', color: '#14B8A6', description: 'Chairs, clocks, tables, and home furnishings' },
  { id: 'body_parts', name: 'Body Parts', icon: '🖐️', color: '#F43F5E', description: 'Hands, eyes, heart, and human anatomy' },
  { id: 'places', name: 'Places & Nature', icon: '⛰️', color: '#059669', description: 'Mountains, rivers, schools, and landmarks' },
  { id: 'transport', name: 'Transport', icon: '🚅', color: '#4F46E5', description: 'Trains, bicycles, airplanes, and travel vehicles' },
  { id: 'everyday', name: 'Everyday Objects', icon: '☂️', color: '#D97706', description: 'Umbrellas, keys, phones, and daily essentials' }
];

/**
 * Generates an accurate, animated SVG educational illustration for each vocabulary concept.
 * Uses CSS keyframe animations embedded inside the SVG so every picture is lively and relevant.
 */
export function generateVocabularySvgDataUrl(scene: string, englishWord: string, primaryColor: string, secondaryColor: string): string {
  let artwork = '';

  switch (scene) {
    case 'water':
      artwork = `
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
        </defs>
        <!-- Glass body -->
        <path d="M95 55 L105 185 A15 15 0 0 0 120 198 L180 198 A15 15 0 0 0 195 185 L205 55 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="5" opacity="0.9"/>
        <!-- Animated Water Level -->
        <path d="M100 95 Q125 85 150 95 T200 95 L193 183 A12 12 0 0 1 180 194 L120 194 A12 12 0 0 1 107 183 Z" fill="url(#waterGrad)">
          <animate attributeName="d" dur="3s" repeatCount="indefinite"
            values="M100 95 Q125 85 150 95 T200 95 L193 183 A12 12 0 0 1 180 194 L120 194 A12 12 0 0 1 107 183 Z;
                    M100 95 Q125 105 150 95 T200 95 L193 183 A12 12 0 0 1 180 194 L120 194 A12 12 0 0 1 107 183 Z;
                    M100 95 Q125 85 150 95 T200 95 L193 183 A12 12 0 0 1 180 194 L120 194 A12 12 0 0 1 107 183 Z" />
        </path>
        <!-- Rising bubbles -->
        <circle cx="135" cy="165" r="5" fill="#FFFFFF" opacity="0.75">
          <animate attributeName="cy" values="175;105;175" dur="2.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="165" cy="145" r="4" fill="#FFFFFF" opacity="0.65">
          <animate attributeName="cy" values="170;110;170" dur="2.1s" repeatCount="indefinite"/>
        </circle>
        <!-- Falling droplet -->
        <path d="M150 22 C150 22 138 38 138 45 A12 12 0 1 0 162 45 C162 38 150 22 150 22 Z" fill="#0EA5E9">
          <animateTransform attributeName="transform" type="translate" values="0,-6; 0,8; 0,-6" dur="2s" repeatCount="indefinite"/>
        </path>
      `;
      break;

    case 'tea':
      artwork = `
        <!-- Saucer -->
        <ellipse cx="150" cy="188" rx="68" ry="14" fill="#FDE68A" stroke="#D97706" stroke-width="3"/>
        <!-- Cup -->
        <path d="M100 105 L110 170 A25 20 0 0 0 135 185 L165 185 A25 20 0 0 0 190 170 L200 105 Z" fill="#10B981" stroke="#047857" stroke-width="4"/>
        <ellipse cx="150" cy="105" rx="50" ry="12" fill="#A7F3D0" stroke="#047857" stroke-width="3"/>
        <ellipse cx="150" cy="107" rx="42" ry="8" fill="#059669"/>
        <!-- Steam waves -->
        <path d="M132 85 Q125 68 135 55 Q145 42 135 28" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" opacity="0.75">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.2s" repeatCount="indefinite"/>
        </path>
        <path d="M165 82 Q158 65 168 52 Q178 39 168 25" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" opacity="0.75">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.2s" repeatCount="indefinite"/>
        </path>
      `;
      break;

    case 'rice':
      artwork = `
        <!-- Fluffy Rice Mound -->
        <path d="M92 125 Q95 70 150 68 Q205 70 208 125 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4"/>
        <circle cx="130" cy="95" r="4" fill="#94A3B8"/>
        <circle cx="160" cy="88" r="4" fill="#94A3B8"/>
        <circle cx="148" cy="106" r="4" fill="#94A3B8"/>
        <!-- Ceramic Bowl -->
        <path d="M85 122 L215 122 Q210 185 150 188 Q90 185 85 122 Z" fill="#EA580C" stroke="#9A3412" stroke-width="4"/>
        <rect x="122" y="185" width="56" height="10" rx="5" fill="#9A3412"/>
        <!-- Chopsticks -->
        <line x1="175" y1="55" x2="225" y2="95" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
        <line x1="165" y1="65" x2="220" y2="105" stroke="#92400E" stroke-width="5" stroke-linecap="round"/>
      `;
      break;

    case 'bread':
      artwork = `
        <path d="M85 110 C75 75 115 60 150 65 C185 60 225 75 215 110 L210 180 A12 12 0 0 1 198 190 L102 190 A12 12 0 0 1 90 180 Z" fill="#F59E0B" stroke="#B45309" stroke-width="5"/>
        <path d="M100 115 C95 88 122 76 150 80 C178 76 205 88 200 115 L196 175 L104 175 Z" fill="#FEF3C7"/>
        <line x1="125" y1="74" x2="135" y2="90" stroke="#B45309" stroke-width="4" stroke-linecap="round"/>
        <line x1="150" y1="72" x2="160" y2="88" stroke="#B45309" stroke-width="4" stroke-linecap="round"/>
        <line x1="175" y1="74" x2="185" y2="90" stroke="#B45309" stroke-width="4" stroke-linecap="round"/>
      `;
      break;

    case 'apple':
      artwork = `
        <g>
          <animateTransform attributeName="transform" type="scale" values="1;1.04;1" dur="2.5s" repeatCount="indefinite" additive="sum"/>
          <!-- Stem & Leaf -->
          <path d="M150 68 Q155 42 168 38" fill="none" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
          <path d="M153 54 Q175 35 192 52 Q175 68 153 54 Z" fill="#22C55E" stroke="#15803D" stroke-width="3"/>
          <!-- Apple Body -->
          <path d="M150 72 C125 58 85 78 88 125 C90 168 122 195 145 190 C150 188 150 188 155 190 C178 195 210 168 212 125 C215 78 175 58 150 72 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="4"/>
          <!-- Shine -->
          <path d="M108 98 Q102 120 110 140" fill="none" stroke="#FCA5A5" stroke-width="6" stroke-linecap="round"/>
        </g>
      `;
      break;

    case 'mango':
      artwork = `
        <path d="M145 45 Q150 28 162 25" fill="none" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
        <path d="M148 38 Q175 25 188 42 Q168 55 148 38 Z" fill="#16A34A"/>
        <path d="M140 50 C100 55 85 105 98 148 C110 185 155 198 182 182 C205 168 195 135 202 115 C208 90 180 45 140 50 Z" fill="#F59E0B" stroke="#D97706" stroke-width="4"/>
        <path d="M115 80 Q105 115 118 145" fill="none" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/>
      `;
      break;

    case 'carrot':
      artwork = `
        <!-- Leafy green top -->
        <path d="M150 65 Q130 30 115 40 Q135 55 145 68" fill="#22C55E" stroke="#15803D" stroke-width="3"/>
        <path d="M150 65 Q150 22 150 22 Q160 45 152 68" fill="#16A34A" stroke="#15803D" stroke-width="3"/>
        <path d="M150 65 Q172 30 185 40 Q165 55 155 68" fill="#22C55E" stroke="#15803D" stroke-width="3"/>
        <!-- Carrot root -->
        <path d="M118 70 Q150 62 182 70 L156 192 A6 6 0 0 1 144 192 Z" fill="#F97316" stroke="#C2410C" stroke-width="4"/>
        <line x1="130" y1="95" x2="152" y2="95" stroke="#C2410C" stroke-width="3" stroke-linecap="round"/>
        <line x1="145" y1="122" x2="168" y2="122" stroke="#C2410C" stroke-width="3" stroke-linecap="round"/>
        <line x1="138" y1="150" x2="155" y2="150" stroke="#C2410C" stroke-width="3" stroke-linecap="round"/>
      `;
      break;

    case 'dog':
      artwork = `
        <!-- Friendly Dog Illustration -->
        <ellipse cx="105" cy="95" rx="18" ry="32" transform="rotate(20 105 95)" fill="#B45309"/>
        <ellipse cx="195" cy="95" rx="18" ry="32" transform="rotate(-20 195 95)" fill="#B45309"/>
        <circle cx="150" cy="115" r="48" fill="#F59E0B" stroke="#B45309" stroke-width="4"/>
        <ellipse cx="150" cy="132" rx="24" ry="18" fill="#FEF3C7"/>
        <!-- Eyes -->
        <circle cx="132" cy="102" r="6" fill="#1F2937"/>
        <circle cx="168" cy="102" r="6" fill="#1F2937"/>
        <circle cx="130" cy="100" r="2" fill="#FFFFFF"/>
        <circle cx="166" cy="100" r="2" fill="#FFFFFF"/>
        <!-- Nose & Happy Tongue -->
        <ellipse cx="150" cy="124" rx="9" ry="6" fill="#1F2937"/>
        <path d="M142 142 Q150 158 158 142" fill="#F43F5E" stroke="#BE123C" stroke-width="2"/>
        <!-- Collar -->
        <rect x="115" y="158" width="70" height="12" rx="6" fill="#EF4444"/>
        <circle cx="150" cy="172" r="7" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>
      `;
      break;

    case 'cat':
      artwork = `
        <!-- Cat Ears -->
        <polygon points="105,85 112,42 140,72" fill="#FB923C" stroke="#C2410C" stroke-width="4"/>
        <polygon points="195,85 188,42 160,72" fill="#FB923C" stroke="#C2410C" stroke-width="4"/>
        <!-- Head -->
        <circle cx="150" cy="118" r="46" fill="#FDBA74" stroke="#C2410C" stroke-width="4"/>
        <!-- Eyes -->
        <ellipse cx="132" cy="110" rx="6" ry="8" fill="#065F46"/>
        <ellipse cx="168" cy="110" rx="6" ry="8" fill="#065F46"/>
        <!-- Pink Nose & Whiskers -->
        <polygon points="145,124 155,124 150,131" fill="#F43F5E"/>
        <line x1="92" y1="122" x2="122" y2="126" stroke="#7C2D12" stroke-width="3" stroke-linecap="round"/>
        <line x1="92" y1="134" x2="122" y2="132" stroke="#7C2D12" stroke-width="3" stroke-linecap="round"/>
        <line x1="208" y1="122" x2="178" y2="126" stroke="#7C2D12" stroke-width="3" stroke-linecap="round"/>
        <line x1="208" y1="134" x2="178" y2="132" stroke="#7C2D12" stroke-width="3" stroke-linecap="round"/>
      `;
      break;

    case 'bird':
      artwork = `
        <!-- Peacock / Colourful Bird -->
        <circle cx="150" cy="110" r="62" fill="#0D9488" opacity="0.2"/>
        <path d="M90 135 Q150 35 210 135 Z" fill="#10B981" stroke="#047857" stroke-width="3"/>
        <circle cx="120" cy="95" r="8" fill="#3B82F6" stroke="#FBBF24" stroke-width="3"/>
        <circle cx="150" cy="78" r="8" fill="#3B82F6" stroke="#FBBF24" stroke-width="3"/>
        <circle cx="180" cy="95" r="8" fill="#3B82F6" stroke="#FBBF24" stroke-width="3"/>
        <!-- Bird Body -->
        <ellipse cx="150" cy="145" rx="22" ry="32" fill="#1D4ED8"/>
        <circle cx="150" cy="108" r="16" fill="#2563EB"/>
        <polygon points="146,108 154,108 150,118" fill="#F59E0B"/>
        <circle cx="144" cy="104" r="2.5" fill="#FFFFFF"/>
        <circle cx="156" cy="104" r="2.5" fill="#FFFFFF"/>
      `;
      break;

    case 'colour_red':
      artwork = `
        <!-- Artist Palette & Red Swatch -->
        <circle cx="150" cy="115" r="58" fill="#EF4444" stroke="#991B1B" stroke-width="5">
          <animate attributeName="r" values="55;60;55" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="130" cy="95" r="14" fill="#FCA5A5" opacity="0.6"/>
        <text x="150" y="124" text-anchor="middle" fill="#FFFFFF" font-family="Inter, sans-serif" font-weight="900" font-size="22">RED</text>
      `;
      break;

    case 'number_one':
      artwork = `
        <circle cx="150" cy="115" r="60" fill="#EEF2FF" stroke="#4F46E5" stroke-width="5"/>
        <text x="150" y="142" text-anchor="middle" fill="#4F46E5" font-family="Inter, sans-serif" font-weight="900" font-size="82">1</text>
        <circle cx="195" cy="70" r="14" fill="#F59E0B"/>
        <text x="195" y="75" text-anchor="middle" fill="#FFFFFF" font-family="Inter, sans-serif" font-weight="900" font-size="14">★</text>
      `;
      break;

    case 'family':
      artwork = `
        <!-- Warm Family Illustration -->
        <circle cx="115" cy="95" r="22" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
        <path d="M85 175 Q85 125 115 125 Q145 125 145 175 Z" fill="#3B82F6"/>
        <circle cx="185" cy="95" r="22" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
        <path d="M155 175 Q155 125 185 125 Q215 125 215 175 Z" fill="#EC4899"/>
        <circle cx="150" cy="122" r="16" fill="#FDE68A" stroke="#D97706" stroke-width="3"/>
        <path d="M128 182 Q128 145 150 145 Q172 145 172 182 Z" fill="#10B981"/>
        <!-- Heart above -->
        <path d="M150 65 C142 52 125 58 132 72 C138 82 150 90 150 90 C150 90 162 82 168 72 C175 58 158 52 150 65 Z" fill="#EF4444">
          <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.8s" repeatCount="indefinite" additive="sum"/>
        </path>
      `;
      break;

    case 'book':
      artwork = `
        <!-- Open Educational Book -->
        <path d="M75 75 Q112 65 150 80 L150 180 Q112 165 75 175 Z" fill="#FFFFFF" stroke="#2563EB" stroke-width="4"/>
        <path d="M225 75 Q188 65 150 80 L150 180 Q188 165 225 175 Z" fill="#F8FAFC" stroke="#2563EB" stroke-width="4"/>
        <line x1="90" y1="100" x2="135" y2="105" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>
        <line x1="90" y1="120" x2="135" y2="125" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>
        <line x1="90" y1="140" x2="125" y2="145" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>
        <line x1="165" y1="105" x2="210" y2="100" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>
        <line x1="165" y1="125" x2="210" y2="120" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>
        <line x1="165" y1="145" x2="200" y2="140" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>
      `;
      break;

    case 'house':
      artwork = `
        <!-- Cozy Home / Chair & Clock -->
        <polygon points="150,45 75,105 225,105" fill="#EF4444" stroke="#991B1B" stroke-width="4"/>
        <rect x="92" y="105" width="116" height="82" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="4"/>
        <rect x="135" y="135" width="30" height="52" rx="4" fill="#92400E"/>
        <rect x="105" y="120" width="22" height="22" rx="3" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
        <rect x="173" y="120" width="22" height="22" rx="3" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
      `;
      break;

    case 'hand':
      artwork = `
        <circle cx="150" cy="118" r="64" fill="#FFE4E6" stroke="#F43F5E" stroke-width="3"/>
        <!-- Stylized Open Hand -->
        <rect x="122" y="110" width="56" height="55" rx="18" fill="#FDBA74" stroke="#C2410C" stroke-width="3"/>
        <rect x="122" y="65" width="11" height="52" rx="5.5" fill="#FDBA74" stroke="#C2410C" stroke-width="3"/>
        <rect x="136" y="55" width="11" height="60" rx="5.5" fill="#FDBA74" stroke="#C2410C" stroke-width="3"/>
        <rect x="150" y="60" width="11" height="56" rx="5.5" fill="#FDBA74" stroke="#C2410C" stroke-width="3"/>
        <rect x="164" y="72" width="11" height="45" rx="5.5" fill="#FDBA74" stroke="#C2410C" stroke-width="3"/>
        <rect x="106" y="105" width="22" height="12" rx="6" transform="rotate(-25 106 105)" fill="#FDBA74" stroke="#C2410C" stroke-width="3"/>
      `;
      break;

    case 'mountain':
      artwork = `
        <!-- Sun -->
        <circle cx="205" cy="65" r="20" fill="#FBBF24">
          <animate attributeName="r" values="19;22;19" dur="3s" repeatCount="indefinite"/>
        </circle>
        <!-- Mountain Peaks -->
        <polygon points="60,185 135,62 210,185" fill="#059669" stroke="#065F46" stroke-width="4"/>
        <polygon points="135,62 114,96 126,92 135,102 145,90 156,96" fill="#FFFFFF"/>
        <polygon points="125,185 185,88 245,185" fill="#10B981" stroke="#047857" stroke-width="4"/>
        <polygon points="185,88 168,115 178,110 185,118 193,110 202,115" fill="#FFFFFF"/>
      `;
      break;

    case 'train':
      artwork = `
        <!-- High-Speed Bullet Train -->
        <line x1="40" y1="172" x2="260" y2="172" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
        <path d="M65 165 L235 165 L235 105 L135 105 Q80 105 65 152 Z" fill="#FFFFFF" stroke="#1E40AF" stroke-width="4"/>
        <path d="M72 148 L235 148 L235 156 L68 156 Z" fill="#2563EB"/>
        <path d="M95 128 Q110 114 130 114 L138 114 L138 134 L95 134 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
        <rect x="152" y="114" width="28" height="20" rx="4" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
        <rect x="192" y="114" width="28" height="20" rx="4" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
        <circle cx="105" cy="168" r="7" fill="#1E293B"/>
        <circle cx="155" cy="168" r="7" fill="#1E293B"/>
        <circle cx="205" cy="168" r="7" fill="#1E293B"/>
      `;
      break;

    default:
      // Umbrella / Everyday object
      artwork = `
        <path d="M75 125 C75 68 225 68 225 125 Q200 115 175 125 Q150 115 125 125 Q100 115 75 125 Z" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="4"/>
        <line x1="150" y1="62" x2="150" y2="175" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
        <path d="M150 175 A12 12 0 0 1 126 175" fill="none" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
    <defs>
      <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="${primaryColor}18"/>
      </radialGradient>
    </defs>
    <rect width="300" height="220" rx="22" fill="url(#bgGlow)"/>
    <circle cx="32" cy="32" r="18" fill="${primaryColor}15"/>
    <circle cx="268" cy="188" r="24" fill="${secondaryColor}15"/>
    ${artwork}
    <rect x="85" y="196" width="130" height="20" rx="10" fill="#0F172A" opacity="0.06"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 2. COMPLETE PICTURE VOCABULARY BANK ACROSS ALL 15 CATEGORIES & 7 LANGUAGES
const RAW_PICTURE_VOCABULARY: Array<Omit<PictureVocabularyItem, 'illustrationSvgDataUrl'>> = [
  {
    id: 'vocab-water',
    category: 'water_drinks',
    englishWord: 'Water',
    svgScene: 'water',
    accentColor: '#0EA5E9',
    secondaryColor: '#0284C7',
    languages: {
      ja: {
        word: '水 (みず)',
        romanization: 'Mizu',
        meaning: 'Water / త్రాగే నీరు / पानी',
        sentence: '毎日水を飲みます。',
        sentenceRomanization: 'Mainichi mizu o nomimasu.',
        sentenceMeaning: 'I drink water every day. (నేను ప్రతిరోజూ నీరు త్రాగుతాను.)',
        pronunciationTip: 'Two short crisp moras: Mi-zu (keep the "zu" soft).'
      },
      te: {
        word: 'నీరు',
        romanization: 'Neeru',
        meaning: 'Water (জল / पानी)',
        sentence: 'నేను ప్రతిరోజూ స్వచ్ఛమైన నీరు త్రాగుతాను.',
        sentenceRomanization: 'Nenu prathiroju swachamaina neeru thraguthanu.',
        sentenceMeaning: 'I drink pure water every day.',
        pronunciationTip: 'Long vowel "Nee" followed by soft "ru".'
      },
      hi: {
        word: 'पानी',
        romanization: 'Paani',
        meaning: 'Water (నీరు)',
        sentence: 'हमें रोज़ साफ पानी पीना चाहिए।',
        sentenceRomanization: 'Humein roz saaf paani peena chahiye.',
        sentenceMeaning: 'We should drink clean water daily. (మనం రోజూ స్వచ్ఛమైన నీరు తాగాలి.)',
        pronunciationTip: 'Long "Paa" and long "nee".'
      },
      fr: {
        word: 'Eau',
        romanization: 'O',
        meaning: 'Water (నీరు / पानी)',
        sentence: "Je bois un verre d'eau fraîche.",
        sentenceRomanization: 'Zhuh bwah uhn vair doh fresh.',
        sentenceMeaning: 'I drink a glass of fresh water.',
        pronunciationTip: 'The trigraph "eau" is pronounced as a single pure "O" vowel.'
      },
      de: {
        word: 'Wasser',
        romanization: 'Vah-ser',
        meaning: 'Water (నీరు / पानी)',
        sentence: 'Ich trinke gerne kaltes Wasser.',
        sentenceRomanization: 'Ikh trinke gerne kaltes Vah-ser.',
        sentenceMeaning: 'I like drinking cold water.',
        pronunciationTip: 'German "W" is pronounced like English "V": Vah-ser.'
      },
      es: {
        word: 'Agua',
        romanization: 'Ah-gwah',
        meaning: 'Water (నీరు / पानी)',
        sentence: 'El agua está muy fresca.',
        sentenceRomanization: 'El ah-gwah es-tah moo-ee fres-kah.',
        sentenceMeaning: 'The water is very fresh.',
        pronunciationTip: 'Stress the first syllable: AH-gwah.'
      },
      en: {
        word: 'Water',
        romanization: 'Waw-ter',
        meaning: 'నీరు / पानी (Clear life-giving liquid)',
        sentence: 'Clean water is essential for all living beings.',
        sentenceRomanization: 'Clean water is essential for all living beings.',
        sentenceMeaning: 'అన్ని జీవులకు స్వచ్ఛమైన నీరు అత్యవసరం.',
        pronunciationTip: 'Round your lips for "Wa" and soften the "ter".'
      }
    }
  },
  {
    id: 'vocab-tea',
    category: 'water_drinks',
    englishWord: 'Green Tea',
    svgScene: 'tea',
    accentColor: '#10B981',
    secondaryColor: '#047857',
    languages: {
      ja: {
        word: 'お茶 (おちゃ)',
        romanization: 'Ocha',
        meaning: 'Green Tea / గ్రీన్ టీ / चाय',
        sentence: '温かいお茶をどうぞ。',
        sentenceRomanization: 'Atatakai ocha o douzo.',
        sentenceMeaning: 'Please have some warm tea. (దయచేసి వేడి టీ తీసుకోండి.)',
        pronunciationTip: 'Short "O" + crisp "cha".'
      },
      te: {
        word: 'తేనీరు (టీ)',
        romanization: 'Theneeru (Tea)',
        meaning: 'Tea (Warm beverage)',
        sentence: 'ఉదయాన్నే వేడి తేనీరు తాగడం బాగుంటుంది.',
        sentenceRomanization: 'Udayanne vedi theneeru thagadam baguntundi.',
        sentenceMeaning: 'Drinking warm tea in the morning feels nice.',
        pronunciationTip: 'Pronounce "The-nee-ru" smoothly.'
      },
      hi: {
        word: 'चाय',
        romanization: 'Chaay',
        meaning: 'Tea (తేనీరు)',
        sentence: 'मुझे गर्म चाय बहुत पसंद है।',
        sentenceRomanization: 'Mujhe garam chaay bahut pasand hai.',
        sentenceMeaning: 'I really like warm tea.',
        pronunciationTip: 'Long "Chaa-y" with a soft ending.'
      },
      fr: {
        word: 'Thé',
        romanization: 'Tay',
        meaning: 'Tea (తేనీరు / चाय)',
        sentence: 'Je prends une tasse de thé vert.',
        sentenceMeaning: 'I am having a cup of green tea.',
        pronunciationTip: 'Silent "h", crisp "T" + closed "é" (Tay).'
      },
      de: {
        word: 'Tee',
        romanization: 'Tay',
        meaning: 'Tea (తేనీరు / चाय)',
        sentence: 'Möchtest du eine Tasse Tee?',
        sentenceMeaning: 'Would you like a cup of tea?',
        pronunciationTip: 'Long "ee" vowel sound.'
      },
      es: {
        word: 'Té',
        romanization: 'Teh',
        meaning: 'Tea (తేనీరు / चाय)',
        sentence: 'Me gusta el té verde caliente.',
        sentenceMeaning: 'I like hot green tea.',
        pronunciationTip: 'Crisp dental "T" + short "eh".'
      },
      en: {
        word: 'Tea',
        romanization: 'Tee',
        meaning: 'తేనీరు / चाय',
        sentence: 'She prepared a warm cup of herbal tea.',
        sentenceMeaning: 'ఆమె ఒక కప్పు వేడి హెర్బల్ టీ తయారు చేసింది.',
        pronunciationTip: 'Clear long "ee" sound.'
      }
    }
  },
  {
    id: 'vocab-rice',
    category: 'food',
    englishWord: 'Cooked Rice / Meal',
    svgScene: 'rice',
    accentColor: '#F97316',
    secondaryColor: '#C2410C',
    languages: {
      ja: {
        word: 'ご飯 (ごはん)',
        romanization: 'Gohan',
        meaning: 'Cooked Rice or Meal / అన్నం / चावल',
        sentence: '朝ご飯を食べましたか？',
        sentenceRomanization: 'Asagohan o tabemashita ka?',
        sentenceMeaning: 'Did you eat breakfast? (మీరు ఉదయం అల్పాహారం తిన్నారా?)',
        pronunciationTip: 'Go-ha-n (three even moras).'
      },
      te: {
        word: 'అన్నం',
        romanization: 'Annam',
        meaning: 'Cooked Rice / Meal',
        sentence: 'వేడి అన్నం ఆరోగ్యానికి మంచిది.',
        sentenceRomanization: 'Vedi annam arogyaniki manchidi.',
        sentenceMeaning: 'Warm cooked rice is good for health.',
        pronunciationTip: 'Double "nn" hold: An-nam.'
      },
      hi: {
        word: 'चावल (भात)',
        romanization: 'Chaawal (Bhaat)',
        meaning: 'Rice (అన్నం)',
        sentence: 'दोपहर के भोजन में दाल और चावल हैं।',
        sentenceRomanization: 'Dopahar ke bhojan mein daal aur chaawal hain.',
        sentenceMeaning: 'Lunch has lentils and rice.',
        pronunciationTip: 'Chaa-wal with a soft "w".'
      },
      fr: {
        word: 'Riz',
        romanization: 'Ree',
        meaning: 'Rice (అన్నం)',
        sentence: 'Nous mangeons du riz chaud.',
        sentenceMeaning: 'We are eating warm rice.',
        pronunciationTip: 'The final "z" is silent: pronounce "Ree".'
      },
      de: {
        word: 'Reis',
        romanization: 'Rais',
        meaning: 'Rice (అన్నం)',
        sentence: 'Reis mit Gemüse schmeckt sehr gut.',
        sentenceMeaning: 'Rice with vegetables tastes very good.',
        pronunciationTip: '"ei" in German rhymes with English "ice": Rais.'
      },
      es: {
        word: 'Arroz',
        romanization: 'Ah-rros',
        meaning: 'Rice (అన్నం)',
        sentence: 'El arroz con verduras está delicioso.',
        sentenceMeaning: 'The rice with vegetables is delicious.',
        pronunciationTip: 'Roll the double "rr": Ah-rros.'
      },
      en: {
        word: 'Rice',
        romanization: 'Rais',
        meaning: 'అన్నం / బియ్యం / चावल',
        sentence: 'Steamed rice is a staple food across Asia.',
        sentenceMeaning: 'ఆసియా అంతటా అన్నం ప్రధాన ఆహారం.',
        pronunciationTip: 'Long diphthong "ai" + soft "s".'
      }
    }
  },
  {
    id: 'vocab-bread',
    category: 'food',
    englishWord: 'Bread',
    svgScene: 'bread',
    accentColor: '#F59E0B',
    secondaryColor: '#B45309',
    languages: {
      ja: {
        word: 'パン',
        romanization: 'Pan',
        meaning: 'Bread / రొట్టె / रोटी',
        sentence: '朝はパンと牛乳を食べます。',
        sentenceRomanization: 'Asa wa pan to gyuunyuu o tabemasu.',
        sentenceMeaning: 'In the morning I eat bread and milk.',
        pronunciationTip: 'Written in Katakana because it came from Portuguese "pão".'
      },
      te: {
        word: 'రొట్టె',
        romanization: 'Rotte',
        meaning: 'Bread / Flatbread',
        sentence: 'వేడి రొట్టె చాలా రుచిగా ఉంది.',
        sentenceMeaning: 'The warm bread is very tasty.',
        pronunciationTip: 'Emphasize the double retroflex "tt": Rot-te.'
      },
      hi: {
        word: 'रोटी / डबलरोटी',
        romanization: 'Roti / Bread',
        meaning: 'Bread (రొట్టె)',
        sentence: 'माँ ने गरम रोटी बनाई है।',
        sentenceMeaning: 'Mother has made warm bread.',
        pronunciationTip: 'Ro-tee with retroflex "t".'
      },
      fr: {
        word: 'Pain',
        romanization: 'Pahn',
        meaning: 'Bread (రొట్టె)',
        sentence: "J'achète du pain frais à la boulangerie.",
        sentenceMeaning: 'I buy fresh bread at the bakery.',
        pronunciationTip: 'Nasal vowel "ain" — do not pronounce the final "n" fully.'
      },
      de: {
        word: 'Brot',
        romanization: 'Broht',
        meaning: 'Bread (రొట్టె)',
        sentence: 'Frisches Brot duftet wunderbar.',
        sentenceMeaning: 'Fresh bread smells wonderful.',
        pronunciationTip: 'Long "oh" vowel: Broht.'
      },
      es: {
        word: 'Pan',
        romanization: 'Pahn',
        meaning: 'Bread (రొట్టె)',
        sentence: 'Comemos pan recién horneado.',
        sentenceMeaning: 'We eat freshly baked bread.',
        pronunciationTip: 'Open vowel "a": Pahn.'
      },
      en: {
        word: 'Bread',
        romanization: 'Bred',
        meaning: 'రొట్టె / रोटी',
        sentence: 'The baker pulled a golden loaf of bread from the oven.',
        sentenceMeaning: 'బేకర్ ఓవెన్ నుండి బంగారు రంగు రొట్టెను తీశాడు.',
        pronunciationTip: 'Short vowel "eh": Bred.'
      }
    }
  },
  {
    id: 'vocab-apple',
    category: 'fruits',
    englishWord: 'Apple',
    svgScene: 'apple',
    accentColor: '#EF4444',
    secondaryColor: '#B91C1C',
    languages: {
      ja: {
        word: 'りんご (林檎)',
        romanization: 'Ringo',
        meaning: 'Apple / ఆపిల్ పండు / सेब',
        sentence: 'この赤いりんごは甘いです。',
        sentenceRomanization: 'Kono akai ringo wa amai desu.',
        sentenceMeaning: 'This red apple is sweet. (ఈ ఎర్రని ఆపిల్ తియ్యగా ఉంది.)',
        pronunciationTip: 'Ri-n-go (light tap on the Japanese "r").'
      },
      te: {
        word: 'ఆపిల్ పండు',
        romanization: 'Aapil Pandu',
        meaning: 'Apple Fruit',
        sentence: 'రోజుకొక ఆపిల్ పండు తింటే ఆరోగ్యానికి మంచిది.',
        sentenceMeaning: 'Eating an apple a day is good for health.',
        pronunciationTip: 'Aa-pil Pan-du.'
      },
      hi: {
        word: 'सेब',
        romanization: 'Seb',
        meaning: 'Apple (ఆపిల్ పండు)',
        sentence: 'यह लाल सेब बहुत मीठा है।',
        sentenceMeaning: 'This red apple is very sweet.',
        pronunciationTip: 'Long "ay" vowel: Say-b.'
      },
      fr: {
        word: 'Pomme',
        romanization: 'Pom',
        meaning: 'Apple (ఆపిల్ పండు)',
        sentence: 'Je mange une pomme rouge.',
        sentenceMeaning: 'I am eating a red apple.',
        pronunciationTip: 'Short open "o": Pom.'
      },
      de: {
        word: 'Apfel',
        romanization: 'Ahp-fel',
        meaning: 'Apple (ఆపిల్ పండు)',
        sentence: 'Der rote Apfel ist sehr saftig.',
        sentenceMeaning: 'The red apple is very juicy.',
        pronunciationTip: 'Pronounce both "p" and "f" together: Ahp-fel.'
      },
      es: {
        word: 'Manzana',
        romanization: 'Mahn-sah-nah',
        meaning: 'Apple (ఆపిల్ పండు)',
        sentence: 'La manzana roja es dulce.',
        sentenceMeaning: 'The red apple is sweet.',
        pronunciationTip: 'Stress the middle syllable: mahn-SAH-nah.'
      },
      en: {
        word: 'Apple',
        romanization: 'Ap-uhl',
        meaning: 'ఆపిల్ పండు / सेब',
        sentence: 'A crisp red apple is a healthy afternoon snack.',
        sentenceMeaning: 'తాజా ఎర్రని ఆపిల్ ఆరోగ్యకరమైన చిరుతిండి.',
        pronunciationTip: 'Short front vowel "æ" in Ap-pul.'
      }
    }
  },
  {
    id: 'vocab-mango',
    category: 'fruits',
    englishWord: 'Mango',
    svgScene: 'mango',
    accentColor: '#F59E0B',
    secondaryColor: '#D97706',
    languages: {
      ja: {
        word: 'マンゴー',
        romanization: 'Mangoo',
        meaning: 'Mango / మామిడి పండు / आम',
        sentence: 'マンゴーはとても甘い果物です。',
        sentenceRomanization: 'Mangoo wa totemo amai kudamono desu.',
        sentenceMeaning: 'Mango is a very sweet fruit.',
        pronunciationTip: 'Elongate the final vowel: Man-go-o.'
      },
      te: {
        word: 'మామిడి పండు',
        romanization: 'Maamidi Pandu',
        meaning: 'Mango (King of Fruits)',
        sentence: 'వేసవిలో తియ్యని మామిడి పండ్లు దొరుకుతాయి.',
        sentenceMeaning: 'Sweet mangoes are found in summer.',
        pronunciationTip: 'Maa-mi-di Pan-du.'
      },
      hi: {
        word: 'आम',
        romanization: 'Aam',
        meaning: 'Mango (మామిడి పండు)',
        sentence: 'आम फलों का राजा है।',
        sentenceMeaning: 'Mango is the king of fruits.',
        pronunciationTip: 'Long open "Aaa-m".'
      },
      fr: {
        word: 'Mangue',
        romanization: 'Mahng',
        meaning: 'Mango (మామిడి పండు)',
        sentence: 'Cette mangue mûre est délicieuse.',
        sentenceMeaning: 'This ripe mango is delicious.',
        pronunciationTip: 'Nasal "an" followed by hard "g".'
      },
      de: {
        word: 'Mango',
        romanization: 'Mahn-go',
        meaning: 'Mango (మామిడి పండు)',
        sentence: 'Ich esse gerne frische Mango.',
        sentenceMeaning: 'I enjoy eating fresh mango.',
        pronunciationTip: 'Mahn-go with short "a".'
      },
      es: {
        word: 'Mango',
        romanization: 'Mahn-go',
        meaning: 'Mango (మామిడి పండు)',
        sentence: 'El jugo de mango es refrescante.',
        sentenceMeaning: 'Mango juice is refreshing.',
        pronunciationTip: 'Clear "Mahn-go".'
      },
      en: {
        word: 'Mango',
        romanization: 'Mang-goh',
        meaning: 'మామిడి పండు / आम',
        sentence: 'Ripe golden mangoes are fragrant and sweet.',
        sentenceMeaning: 'పండిన మామిడి పండ్లు మంచి సువాసన మరియు తీపిని కలిగి ఉంటాయి.',
        pronunciationTip: 'Mang-goh.'
      }
    }
  },
  {
    id: 'vocab-carrot',
    category: 'vegetables',
    englishWord: 'Carrot',
    svgScene: 'carrot',
    accentColor: '#F97316',
    secondaryColor: '#15803D',
    languages: {
      ja: {
        word: 'にんじん (人参)',
        romanization: 'Ninjin',
        meaning: 'Carrot / క్యారెట్ / गाजर',
        sentence: 'うさぎはにんじんが好きです。',
        sentenceRomanization: 'Usagi wa ninjin ga suki desu.',
        sentenceMeaning: 'Rabbits like carrots.',
        pronunciationTip: 'Ni-n-ji-n (four rhythmic beats).'
      },
      te: {
        word: 'క్యారెట్ (గాజర గడ్డ)',
        romanization: 'Gaajara Gadda',
        meaning: 'Carrot (Root Vegetable)',
        sentence: 'క్యారెట్ కంటి చూపుకు చాలా మంచిది.',
        sentenceMeaning: 'Carrots are very good for eyesight.',
        pronunciationTip: 'Gaa-ja-ra Gad-da.'
      },
      hi: {
        word: 'गाजर',
        romanization: 'Gaajar',
        meaning: 'Carrot (క్యారెట్)',
        sentence: 'सर्दियों में गाजर का हलवा बनता है।',
        sentenceMeaning: 'Carrot halwa is made in winter.',
        pronunciationTip: 'Long first syllable: Gaa-jar.'
      },
      fr: {
        word: 'Carotte',
        romanization: 'Kah-rot',
        meaning: 'Carrot (క్యారెట్)',
        sentence: 'Les carottes sont riches en vitamines.',
        sentenceMeaning: 'Carrots are rich in vitamins.',
        pronunciationTip: 'Kah-rot.'
      },
      de: {
        word: 'Karotte',
        romanization: 'Kah-rot-uh',
        meaning: 'Carrot (క్యారెట్)',
        sentence: 'Die Karotte ist frisch und knackig.',
        sentenceMeaning: 'The carrot is fresh and crunchy.',
        pronunciationTip: 'Sound the final "e" softly: Kah-rot-uh.'
      },
      es: {
        word: 'Zanahoria',
        romanization: 'Sah-nah-oh-ryah',
        meaning: 'Carrot (క్యారెట్)',
        sentence: 'La zanahoria es buena para la vista.',
        sentenceMeaning: 'The carrot is good for eyesight.',
        pronunciationTip: 'The "h" in the middle is silent.'
      },
      en: {
        word: 'Carrot',
        romanization: 'Kair-uht',
        meaning: 'క్యారెట్ / गाजर',
        sentence: 'Crunchy orange carrots are packed with Vitamin A.',
        sentenceMeaning: 'నారింజ రంగు క్యారెట్లలో విటమిన్ ఎ పుష్కలంగా ఉంటుంది.',
        pronunciationTip: 'Kair-uht.'
      }
    }
  },
  {
    id: 'vocab-dog',
    category: 'animals',
    englishWord: 'Dog',
    svgScene: 'dog',
    accentColor: '#F59E0B',
    secondaryColor: '#B45309',
    languages: {
      ja: {
        word: '犬 (いぬ)',
        romanization: 'Inu',
        meaning: 'Dog / కుక్క / कुत्ता',
        sentence: '公園でかわいい犬を見ました。',
        sentenceRomanization: 'Kouen de kawaii inu o mimashita.',
        sentenceMeaning: 'I saw a cute dog in the park. (నేను పార్కులో ఒక అందమైన కుక్కను చూశాను.)',
        pronunciationTip: 'Short "I" + "nu": I-nu.'
      },
      te: {
        word: 'కుక్క',
        romanization: 'Kukka',
        meaning: 'Dog (Faithful pet)',
        sentence: 'కుక్క చాలా విశ్వాసమైన జంతువు.',
        sentenceMeaning: 'The dog is a very loyal animal.',
        pronunciationTip: 'Double "kk": Kuk-ka.'
      },
      hi: {
        word: 'कुत्ता',
        romanization: 'Kutta',
        meaning: 'Dog (కుక్క)',
        sentence: 'कुत्ता एक वफादार जानवर है।',
        sentenceMeaning: 'The dog is a loyal animal.',
        pronunciationTip: 'Double dental "tt": Kut-taa.'
      },
      fr: {
        word: 'Chien',
        romanization: 'Shyahn',
        meaning: 'Dog (కుక్క)',
        sentence: 'Le chien joue dans le jardin.',
        sentenceMeaning: 'The dog is playing in the garden.',
        pronunciationTip: 'Soft "ch" (sh) + nasal "ien".'
      },
      de: {
        word: 'Hund',
        romanization: 'Hoont',
        meaning: 'Dog (కుక్క)',
        sentence: 'Der Hund läuft schnell im Park.',
        sentenceMeaning: 'The dog runs fast in the park.',
        pronunciationTip: 'Final "d" sounds like a crisp "t": Hoont.'
      },
      es: {
        word: 'Perro',
        romanization: 'Peh-rro',
        meaning: 'Dog (కుక్క)',
        sentence: 'Mi perro es muy amigable.',
        sentenceMeaning: 'My dog is very friendly.',
        pronunciationTip: 'Trill the double "rr" strongly.'
      },
      en: {
        word: 'Dog',
        romanization: 'Dawg',
        meaning: 'కుక్క / कुत्ता',
        sentence: 'The friendly dog wagged its tail happily.',
        sentenceMeaning: 'ఆ స్నేహపూర్వక కుక్క సంతోషంగా తోక ఊపింది.',
        pronunciationTip: 'Clear "d" and voiced "g".'
      }
    }
  },
  {
    id: 'vocab-cat',
    category: 'animals',
    englishWord: 'Cat',
    svgScene: 'cat',
    accentColor: '#FB923C',
    secondaryColor: '#C2410C',
    languages: {
      ja: {
        word: '猫 (ねこ)',
        romanization: 'Neko',
        meaning: 'Cat / పిల్లి / बिल्ली',
        sentence: '猫が日なたで眠っています。',
        sentenceRomanization: 'Neko ga hinata de nemutte imasu.',
        sentenceMeaning: 'The cat is sleeping in the sunshine.',
        pronunciationTip: 'Ne-ko (two crisp beats).'
      },
      te: {
        word: 'పిల్లి',
        romanization: 'Pilli',
        meaning: 'Cat',
        sentence: 'చిన్న పిల్లి పాలు తాగుతోంది.',
        sentenceMeaning: 'The little kitten is drinking milk.',
        pronunciationTip: 'Double "ll": Pil-li.'
      },
      hi: {
        word: 'बिल्ली',
        romanization: 'Billi',
        meaning: 'Cat (పిల్లి)',
        sentence: 'सफ़ेद बिल्ली बहुत प्यारी है।',
        sentenceMeaning: 'The white cat is very cute.',
        pronunciationTip: 'Bil-lee.'
      },
      fr: {
        word: 'Chat',
        romanization: 'Shah',
        meaning: 'Cat (పిల్లి)',
        sentence: 'Le chat dort sur le canapé.',
        sentenceMeaning: 'The cat sleeps on the sofa.',
        pronunciationTip: 'Silent final "t": pronounce "Shah".'
      },
      de: {
        word: 'Katze',
        romanization: 'Kaht-suh',
        meaning: 'Cat (పిల్లి)',
        sentence: 'Die Katze trinkt warme Milch.',
        sentenceMeaning: 'The cat drinks warm milk.',
        pronunciationTip: '"tz" sounds like "ts": Kaht-suh.'
      },
      es: {
        word: 'Gato',
        romanization: 'Gah-toh',
        meaning: 'Cat (పిల్లి)',
        sentence: 'El gato salta muy alto.',
        sentenceMeaning: 'The cat jumps very high.',
        pronunciationTip: 'Gah-toh.'
      },
      en: {
        word: 'Cat',
        romanization: 'Kat',
        meaning: 'పిల్లి / बिल्ली',
        sentence: 'The curious cat purred softly by the window.',
        sentenceMeaning: 'ఆ పిల్లి కిటికీ దగ్గర మెల్లగా కూర్చుంది.',
        pronunciationTip: 'Short "a" vowel: Kat.'
      }
    }
  },
  {
    id: 'vocab-bird',
    category: 'birds',
    englishWord: 'Bird / Peacock',
    svgScene: 'bird',
    accentColor: '#06B6D4',
    secondaryColor: '#0E7490',
    languages: {
      ja: {
        word: '鳥 (とり)',
        romanization: 'Tori',
        meaning: 'Bird / పక్షి / पक्षी',
        sentence: '空を鳥が飛んでいます。',
        sentenceRomanization: 'Sora o tori ga tonde imasu.',
        sentenceMeaning: 'A bird is flying in the sky.',
        pronunciationTip: 'To-ri (short and light).'
      },
      te: {
        word: 'పక్షి (నెమలి)',
        romanization: 'Pakshi (Nemali)',
        meaning: 'Bird / Peacock',
        sentence: 'ఆకాశంలో పక్షులు ఎగురుతున్నాయి.',
        sentenceMeaning: 'Birds are flying in the sky.',
        pronunciationTip: 'Pak-shi.'
      },
      hi: {
        word: 'पक्षी (मोर)',
        romanization: 'Pakshi (Mor)',
        meaning: 'Bird / Peacock (పక్షి)',
        sentence: 'पेड़ पर सुंदर पक्षी चहचहा रहे हैं।',
        sentenceMeaning: 'Beautiful birds are chirping on the tree.',
        pronunciationTip: 'Pak-shee.'
      },
      fr: {
        word: 'Oiseau',
        romanization: 'Wah-zoh',
        meaning: 'Bird (పక్షి)',
        sentence: "L'oiseau chante dans l'arbre.",
        sentenceMeaning: 'The bird sings in the tree.',
        pronunciationTip: '"oi" is "wah" + "s" between vowels is "z": Wah-zoh.'
      },
      de: {
        word: 'Vogel',
        romanization: 'Foh-gel',
        meaning: 'Bird (పక్షి)',
        sentence: 'Der Vogel singt am Morgen.',
        sentenceMeaning: 'The bird sings in the morning.',
        pronunciationTip: 'German "V" sounds like "F": Foh-gel.'
      },
      es: {
        word: 'Pájaro',
        romanization: 'Pah-hah-roh',
        meaning: 'Bird (పక్షి)',
        sentence: 'El pájaro canta por la mañana.',
        sentenceMeaning: 'The bird sings in the morning.',
        pronunciationTip: 'Spanish "j" sounds like an English "h".'
      },
      en: {
        word: 'Bird',
        romanization: 'Burd',
        meaning: 'పక్షి / पक्षी',
        sentence: 'The colourful bird spread its feathers in the garden.',
        sentenceMeaning: 'రంగురంగుల పక్షి తోటలో తన రెక్కలను విప్పింది.',
        pronunciationTip: 'R-colored vowel: Burd.'
      }
    }
  },
  {
    id: 'vocab-red',
    category: 'colours',
    englishWord: 'Red',
    svgScene: 'colour_red',
    accentColor: '#EF4444',
    secondaryColor: '#991B1B',
    languages: {
      ja: {
        word: '赤 (あか)',
        romanization: 'Aka',
        meaning: 'Red Colour / ఎరుపు రంగు / लाल रंग',
        sentence: '夕焼けの空が赤いです。',
        sentenceRomanization: 'Yuuyake no sora ga akai desu.',
        sentenceMeaning: 'The sunset sky is red.',
        pronunciationTip: 'A-ka (open "a" vowels).'
      },
      te: {
        word: 'ఎరుపు',
        romanization: 'Erupu',
        meaning: 'Red Colour',
        sentence: 'గులాబీ పువ్వు ఎరుపు రంగులో ఉంది.',
        sentenceMeaning: 'The rose flower is red in colour.',
        pronunciationTip: 'E-ru-pu.'
      },
      hi: {
        word: 'लाल',
        romanization: 'Laal',
        meaning: 'Red (ఎరుపు)',
        sentence: 'यह गुलाब लाल रंग का है।',
        sentenceMeaning: 'This rose is red in colour.',
        pronunciationTip: 'Long "aa": Laal.'
      },
      fr: {
        word: 'Rouge',
        romanization: 'Roozh',
        meaning: 'Red (ఎరుపు)',
        sentence: 'La fleur est rouge.',
        sentenceMeaning: 'The flower is red.',
        pronunciationTip: 'Soft French "j" sound at the end: Roozh.'
      },
      de: {
        word: 'Rot',
        romanization: 'Roht',
        meaning: 'Red (ఎరుపు)',
        sentence: 'Die Rose ist dunkelrot.',
        sentenceMeaning: 'The rose is dark red.',
        pronunciationTip: 'Long "oh": Roht.'
      },
      es: {
        word: 'Rojo',
        romanization: 'Rroh-ho',
        meaning: 'Red (ఎరుపు)',
        sentence: 'El coche nuevo es rojo.',
        sentenceMeaning: 'The new car is red.',
        pronunciationTip: 'Roll the initial "R" and breathe the "j": Rroh-ho.'
      },
      en: {
        word: 'Red',
        romanization: 'Red',
        meaning: 'ఎరుపు రంగు / लाल',
        sentence: 'Red is a warm and energetic primary colour.',
        sentenceMeaning: 'ఎరుపు ఒక ఉత్సాహభరితమైన ప్రాథమిక రంగు.',
        pronunciationTip: 'Short "e": Red.'
      }
    }
  },
  {
    id: 'vocab-one',
    category: 'numbers',
    englishWord: 'One (1)',
    svgScene: 'number_one',
    accentColor: '#6366F1',
    secondaryColor: '#4338CA',
    languages: {
      ja: {
        word: '一 (いち)',
        romanization: 'Ichi',
        meaning: 'Number One (1) / ఒకటి / एक',
        sentence: '一歩ずつ前に進みましょう。',
        sentenceRomanization: 'Ippo zutsu mae ni susumimashou.',
        sentenceMeaning: 'Let us move forward one step at a time.',
        pronunciationTip: 'I-chi (single horizontal stroke Kanji 一).'
      },
      te: {
        word: 'ఒకటి (1)',
        romanization: 'Okati',
        meaning: 'Number One (1)',
        sentence: 'ఆకాశంలో ఒక చంద్రుడు ఉన్నాడు.',
        sentenceMeaning: 'There is one moon in the sky.',
        pronunciationTip: 'O-ka-ti.'
      },
      hi: {
        word: 'एक (१)',
        romanization: 'Ek',
        meaning: 'Number One (ఒకటి)',
        sentence: 'एकता में बड़ी शक्ति होती है।',
        sentenceMeaning: 'There is great strength in unity.',
        pronunciationTip: 'Long "ay" + "k": Ayk.'
      },
      fr: {
        word: 'Un',
        romanization: 'Uhn',
        meaning: 'One (ఒకటి)',
        sentence: "J'ai un livre intéressant.",
        sentenceMeaning: 'I have one interesting book.',
        pronunciationTip: 'Nasal vowel "un".'
      },
      de: {
        word: 'Eins',
        romanization: 'Ains',
        meaning: 'One (ఒకటి)',
        sentence: 'Nummer eins ist bereit.',
        sentenceMeaning: 'Number one is ready.',
        pronunciationTip: 'Rhymes with "fines": Ains.'
      },
      es: {
        word: 'Uno',
        romanization: 'Oo-noh',
        meaning: 'One (ఒకటి)',
        sentence: 'Solo necesito un minuto.',
        sentenceMeaning: 'I only need one minute.',
        pronunciationTip: 'Oo-noh.'
      },
      en: {
        word: 'One',
        romanization: 'Wuhn',
        meaning: 'ఒకటి / एक (1)',
        sentence: 'Every great journey begins with one step.',
        sentenceMeaning: 'ప్రతి గొప్ప ప్రయాణం ఒక్క అడుగుతోనే మొదలవుతుంది.',
        pronunciationTip: 'Pronounced with a leading "w": Wuhn.'
      }
    }
  },
  {
    id: 'vocab-family',
    category: 'family',
    englishWord: 'Mother / Family',
    svgScene: 'family',
    accentColor: '#F59E0B',
    secondaryColor: '#D97706',
    languages: {
      ja: {
        word: 'お母さん (おかあさん)',
        romanization: 'Okaasan',
        meaning: 'Mother / అమ్మ / माताजी',
        sentence: 'お母さんの料理はとてもおいしいです。',
        sentenceRomanization: 'Okaasan no ryouri wa totemo oishii desu.',
        sentenceMeaning: "Mother's cooking is very delicious. (అమ్మ వంట చాలా రుచిగా ఉంటుంది.)",
        pronunciationTip: 'Hold the long "kaa" vowel for two beats: O-kaa-san.'
      },
      te: {
        word: 'అమ్మ (తల్లి)',
        romanization: 'Amma (Thalli)',
        meaning: 'Mother',
        sentence: 'అమ్మ ప్రేమ వెలకట్టలేనిది.',
        sentenceMeaning: "A mother's love is priceless.",
        pronunciationTip: 'Warm double "mm": Am-ma.'
      },
      hi: {
        word: 'माँ (माता)',
        romanization: 'Maa (Maata)',
        meaning: 'Mother (అమ్మ)',
        sentence: 'माँ का स्नेह सबसे अनमोल है।',
        sentenceMeaning: "A mother's affection is the most precious.",
        pronunciationTip: 'Nasalized long "Maan".'
      },
      fr: {
        word: 'Mère (Maman)',
        romanization: 'Mair (Mah-mahn)',
        meaning: 'Mother (అమ్మ)',
        sentence: 'Ma mère est très gentille.',
        sentenceMeaning: 'My mother is very kind.',
        pronunciationTip: 'Open "è" sound: Mair.'
      },
      de: {
        word: 'Mutter',
        romanization: 'Moo-ter',
        meaning: 'Mother (అమ్మ)',
        sentence: 'Meine Mutter liest ein Buch.',
        sentenceMeaning: 'My mother is reading a book.',
        pronunciationTip: 'Short "u" as in "put": Moo-ter.'
      },
      es: {
        word: 'Madre (Mamá)',
        romanization: 'Mah-dreh',
        meaning: 'Mother (అమ్మ)',
        sentence: 'Mi madre trabaja en el hospital.',
        sentenceMeaning: 'My mother works at the hospital.',
        pronunciationTip: 'Soft dental "d": Mah-dreh.'
      },
      en: {
        word: 'Mother',
        romanization: 'Muh-ther',
        meaning: 'అమ్మ / తల్లి / माँ',
        sentence: 'My mother always encourages me to learn new skills.',
        sentenceMeaning: 'కొత్త నైపుణ్యాలు నేర్చుకోవాలని మా అమ్మ నన్ను ఎప్పుడూ ప్రోత్సహిస్తుంది.',
        pronunciationTip: 'Voiced "th" in the middle: Muh-ther.'
      }
    }
  },
  {
    id: 'vocab-book',
    category: 'school',
    englishWord: 'Book',
    svgScene: 'book',
    accentColor: '#3B82F6',
    secondaryColor: '#1D4ED8',
    languages: {
      ja: {
        word: '本 (ほん)',
        romanization: 'Hon',
        meaning: 'Book / పుస్తకం / किताब',
        sentence: '図書館で科学の本を読みます。',
        sentenceRomanization: 'Toshokan de kagaku no hon o yomimasu.',
        sentenceMeaning: 'I read a science book at the library.',
        pronunciationTip: 'Ho-n (two moras).'
      },
      te: {
        word: 'పుస్తకం',
        romanization: 'Pusthakam',
        meaning: 'Book',
        sentence: 'మంచి పుస్తకం మంచి స్నేహితుడి లాంటిది.',
        sentenceMeaning: 'A good book is like a good friend.',
        pronunciationTip: 'Pus-tha-kam.'
      },
      hi: {
        word: 'किताब (पुस्तक)',
        romanization: 'Kitaab (Pustak)',
        meaning: 'Book (పుస్తకం)',
        sentence: 'मैं विज्ञान की किताब पढ़ रहा हूँ।',
        sentenceMeaning: 'I am reading a science book.',
        pronunciationTip: 'Ki-taab.'
      },
      fr: {
        word: 'Livre',
        romanization: 'Leevr',
        meaning: 'Book (పుస్తకం)',
        sentence: 'Ce livre explique l’histoire du monde.',
        sentenceMeaning: 'This book explains the history of the world.',
        pronunciationTip: 'Lee-vr.'
      },
      de: {
        word: 'Buch',
        romanization: 'Bookh',
        meaning: 'Book (పుస్తకం)',
        sentence: 'Das Buch liegt auf dem Tisch.',
        sentenceMeaning: 'The book is lying on the table.',
        pronunciationTip: 'Long "oo" + guttural "ch": Bookh.'
      },
      es: {
        word: 'Libro',
        romanization: 'Lee-broh',
        meaning: 'Book (పుస్తకం)',
        sentence: 'Leo un libro interesante cada semana.',
        sentenceMeaning: 'I read an interesting book every week.',
        pronunciationTip: 'Lee-broh.'
      },
      en: {
        word: 'Book',
        romanization: 'Buk',
        meaning: 'పుస్తకం / किताब',
        sentence: 'Reading a good book expands your imagination.',
        sentenceMeaning: 'మంచి పుస్తకం చదవడం వల్ల మీ ఊహాశక్తి పెరుగుతుంది.',
        pronunciationTip: 'Short "oo" vowel as in "look": Buk.'
      }
    }
  },
  {
    id: 'vocab-house',
    category: 'household',
    englishWord: 'House / Home',
    svgScene: 'house',
    accentColor: '#14B8A6',
    secondaryColor: '#0F766E',
    languages: {
      ja: {
        word: '家 (いえ / うち)',
        romanization: 'Ie / Uchi',
        meaning: 'House / Home / ఇల్లు / घर',
        sentence: '私の家は駅の近くにあります。',
        sentenceRomanization: 'Watashi no ie wa eki no chikaku ni arimasu.',
        sentenceMeaning: 'My house is near the station.',
        pronunciationTip: 'I-e refers to the building; U-chi refers to your warm home.'
      },
      te: {
        word: 'ఇల్లు (గృహం)',
        romanization: 'Illu (Gruham)',
        meaning: 'House / Home',
        sentence: 'మా ఇల్లు చాలా ప్రశాంతంగా ఉంటుంది.',
        sentenceMeaning: 'Our home is very peaceful.',
        pronunciationTip: 'Il-lu.'
      },
      hi: {
        word: 'घर (मकान)',
        romanization: 'Ghar',
        meaning: 'House / Home (ఇల్లు)',
        sentence: 'मेरा घर स्कूल के पास है।',
        sentenceMeaning: 'My house is near the school.',
        pronunciationTip: 'Aspirated voiced "Gh": Ghar.'
      },
      fr: {
        word: 'Maison',
        romanization: 'May-zohn',
        meaning: 'House (ఇల్లు)',
        sentence: 'Notre maison a un grand jardin.',
        sentenceMeaning: 'Our house has a big garden.',
        pronunciationTip: 'May-zohn (nasal "on").'
      },
      de: {
        word: 'Haus',
        romanization: 'Hous',
        meaning: 'House (ఇల్లు)',
        sentence: 'Wir wohnen in einem gemütlichen Haus.',
        sentenceMeaning: 'We live in a cozy house.',
        pronunciationTip: 'Rhymes with English "house".'
      },
      es: {
        word: 'Casa',
        romanization: 'Kah-sah',
        meaning: 'House (ఇల్లు)',
        sentence: 'Mi casa es tu casa.',
        sentenceMeaning: 'My house is your house.',
        pronunciationTip: 'Kah-sah.'
      },
      en: {
        word: 'House',
        romanization: 'Hous',
        meaning: 'ఇల్లు / घर',
        sentence: 'Sunlight streamed through the windows of the house.',
        sentenceMeaning: 'ఇంటి కిటికీల గుండా సూర్యకాంతి ప్రసరించింది.',
        pronunciationTip: 'Diphthong "aʊ": Hous.'
      }
    }
  },
  {
    id: 'vocab-hand',
    category: 'body_parts',
    englishWord: 'Hand',
    svgScene: 'hand',
    accentColor: '#F43F5E',
    secondaryColor: '#BE123C',
    languages: {
      ja: {
        word: '手 (て)',
        romanization: 'Te',
        meaning: 'Hand / చెయ్యి / हाथ',
        sentence: '食事の前に手を洗いましょう。',
        sentenceRomanization: 'Shokuji no mae ni te o araimashou.',
        sentenceMeaning: 'Let us wash our hands before meals.',
        pronunciationTip: 'Short crisp "Te".'
      },
      te: {
        word: 'చెయ్యి (హస్తం)',
        romanization: 'Cheyyi',
        meaning: 'Hand',
        sentence: 'భోజనానికి ముందు చేతులు శుభ్రంగా కడుక్కోవాలి.',
        sentenceMeaning: 'Wash your hands cleanly before meals.',
        pronunciationTip: 'Chey-yi.'
      },
      hi: {
        word: 'हाथ',
        romanization: 'Haath',
        meaning: 'Hand (చెయ్యి)',
        sentence: 'खाना खाने से पहले हाथ धोएं।',
        sentenceMeaning: 'Wash hands before eating food.',
        pronunciationTip: 'Long "Haa" + aspirated dental "th".'
      },
      fr: {
        word: 'Main',
        romanization: 'Mahn',
        meaning: 'Hand (చెయ్యి)',
        sentence: 'Lève la main pour poser une question.',
        sentenceMeaning: 'Raise your hand to ask a question.',
        pronunciationTip: 'Nasal vowel "ain".'
      },
      de: {
        word: 'Hand',
        romanization: 'Hahnt',
        meaning: 'Hand (చెయ్యి)',
        sentence: 'Bitte wasche deine Hände.',
        sentenceMeaning: 'Please wash your hands.',
        pronunciationTip: 'Short "a" and final "t" sound: Hahnt.'
      },
      es: {
        word: 'Mano',
        romanization: 'Mah-noh',
        meaning: 'Hand (చెయ్యి)',
        sentence: 'Lávate las manos con agua y jabón.',
        sentenceMeaning: 'Wash your hands with water and soap.',
        pronunciationTip: 'Mah-noh.'
      },
      en: {
        word: 'Hand',
        romanization: 'Hand',
        meaning: 'చెయ్యి / हाथ',
        sentence: 'He raised his hand to answer the teacher’s question.',
        sentenceMeaning: 'ఉపాధ్యాయుడి ప్రశ్నకు సమాధానం చెప్పడానికి అతను చెయ్యి పైకెత్తాడు.',
        pronunciationTip: 'Clear "h" and voiced "nd".'
      }
    }
  },
  {
    id: 'vocab-mountain',
    category: 'places',
    englishWord: 'Mountain',
    svgScene: 'mountain',
    accentColor: '#059669',
    secondaryColor: '#065F46',
    languages: {
      ja: {
        word: '山 (やま)',
        romanization: 'Yama',
        meaning: 'Mountain / పర్వతం (కొండ) / पहाड़',
        sentence: '富士山は日本で一番高い山です。',
        sentenceRomanization: 'Fujisan wa Nihon de ichiban takai yama desu.',
        sentenceMeaning: 'Mount Fuji is the highest mountain in Japan.',
        pronunciationTip: 'Ya-ma (the Kanji 山 looks like three mountain peaks!).'
      },
      te: {
        word: 'పర్వతం (కొండ)',
        romanization: 'Parvatham (Konda)',
        meaning: 'Mountain / Hill',
        sentence: 'హిమాలయ పర్వతాలు మంచుతో కప్పబడి ఉంటాయి.',
        sentenceMeaning: 'The Himalayan mountains are covered with snow.',
        pronunciationTip: 'Par-va-tham.'
      },
      hi: {
        word: 'पहाड़ (पर्वत)',
        romanization: 'Pahaad (Parvat)',
        meaning: 'Mountain (పర్వతం)',
        sentence: 'हिमालय के पहाड़ बहुत ऊँचे हैं।',
        sentenceMeaning: 'The Himalayan mountains are very high.',
        pronunciationTip: 'Pa-haad.'
      },
      fr: {
        word: 'Montagne',
        romanization: 'Mohn-tahn-yuh',
        meaning: 'Mountain (పర్వతం)',
        sentence: 'La montagne est couverte de neige.',
        sentenceMeaning: 'The mountain is covered with snow.',
        pronunciationTip: '"gn" sounds like "ny" in canyon.'
      },
      de: {
        word: 'Berg',
        romanization: 'Bairk',
        meaning: 'Mountain (పర్వతం)',
        sentence: 'Wir wandern auf den hohen Berg.',
        sentenceMeaning: 'We hike up the high mountain.',
        pronunciationTip: 'Bairk.'
      },
      es: {
        word: 'Montaña',
        romanization: 'Mohn-tah-nyah',
        meaning: 'Mountain (పర్వతం)',
        sentence: 'Subimos a la cima de la montaña.',
        sentenceMeaning: 'We climb to the top of the mountain.',
        pronunciationTip: '"ñ" is pronounced "ny": Mohn-tah-nyah.'
      },
      en: {
        word: 'Mountain',
        romanization: 'Moun-tin',
        meaning: 'పర్వతం / కొండ / पहाड़',
        sentence: 'Snow glistened on the peak of the tall mountain.',
        sentenceMeaning: 'ఎత్తైన పర్వత శిఖరంపై మంచు మెరిసింది.',
        pronunciationTip: 'Moun-tin.'
      }
    }
  },
  {
    id: 'vocab-train',
    category: 'transport',
    englishWord: 'Train',
    svgScene: 'train',
    accentColor: '#4F46E5',
    secondaryColor: '#3730A3',
    languages: {
      ja: {
        word: '電車 (でんしゃ)',
        romanization: 'Densha',
        meaning: 'Electric Train / రైలు / रेलगाड़ी',
        sentence: '毎朝電車で学校へ行きます。',
        sentenceRomanization: 'Maiasa densha de gakkou e ikimasu.',
        sentenceMeaning: 'I go to school by train every morning.',
        pronunciationTip: 'De-n-sha (three rhythmic moras).'
      },
      te: {
        word: 'రైలు బండి',
        romanization: 'Railu Bandi',
        meaning: 'Train',
        sentence: 'వేగవంతమైన రైలు సమయానికి చేరుకుంది.',
        sentenceMeaning: 'The express train arrived on time.',
        pronunciationTip: 'Rai-lu Ban-di.'
      },
      hi: {
        word: 'रेलगाड़ी (ट्रेन)',
        romanization: 'Relgaadi (Train)',
        meaning: 'Train (రైలు)',
        sentence: 'रेलगाड़ी समय पर स्टेशन पहुँची।',
        sentenceMeaning: 'The train reached the station on time.',
        pronunciationTip: 'Rel-gaa-dee.'
      },
      fr: {
        word: 'Train',
        romanization: 'Trahn',
        meaning: 'Train (రైలు)',
        sentence: 'Le train à grande vitesse part à huit heures.',
        sentenceMeaning: 'The high-speed train departs at eight o’clock.',
        pronunciationTip: 'Uvular "r" + nasal "ain": Trahn.'
      },
      de: {
        word: 'Zug',
        romanization: 'Tsook',
        meaning: 'Train (రైలు)',
        sentence: 'Der Zug kommt pünktlich an.',
        sentenceMeaning: 'The train arrives on time.',
        pronunciationTip: 'German "Z" is pronounced "Ts": Tsook.'
      },
      es: {
        word: 'Tren',
        romanization: 'Trehn',
        meaning: 'Train (రైలు)',
        sentence: 'Viajamos en tren rápido.',
        sentenceMeaning: 'We travel by fast train.',
        pronunciationTip: 'Crisp "Tr-ehn".'
      },
      en: {
        word: 'Train',
        romanization: 'Trayn',
        meaning: 'రైలు / रेलगाड़ी',
        sentence: 'The high-speed train glided smoothly along the tracks.',
        sentenceMeaning: 'హై-స్పీడ్ రైలు పట్టాలపై సాఫీగా దూసుకుపోయింది.',
        pronunciationTip: 'Long "ay" diphthong: Trayn.'
      }
    }
  },
  {
    id: 'vocab-umbrella',
    category: 'everyday',
    englishWord: 'Umbrella',
    svgScene: 'umbrella',
    accentColor: '#D97706',
    secondaryColor: '#92400E',
    languages: {
      ja: {
        word: '傘 (かさ)',
        romanization: 'Kasa',
        meaning: 'Umbrella / గొడుగు / छाता',
        sentence: '雨が降っているので傘を持っていきます。',
        sentenceRomanization: 'Ame ga futte iru node kasa o motte ikimasu.',
        sentenceMeaning: 'Since it is raining, I will bring an umbrella.',
        pronunciationTip: 'Ka-sa (light and even).'
      },
      te: {
        word: 'గొడుగు',
        romanization: 'Godugu',
        meaning: 'Umbrella',
        sentence: 'వర్షం పడుతున్నప్పుడు గొడుగు తీసుకెళ్లండి.',
        sentenceMeaning: 'Take an umbrella when it is raining.',
        pronunciationTip: 'Go-du-gu.'
      },
      hi: {
        word: 'छाता (छतरी)',
        romanization: 'Chhaata',
        meaning: 'Umbrella (గొడుగు)',
        sentence: 'बारिश में छाता बहुत काम आता है।',
        sentenceMeaning: 'An umbrella is very useful in the rain.',
        pronunciationTip: 'Aspirated "Chhaa-taa".'
      },
      fr: {
        word: 'Parapluie',
        romanization: 'Pah-rah-plwee',
        meaning: 'Umbrella (గొడుగు)',
        sentence: "Prends ton parapluie, il pleut dehors.",
        sentenceMeaning: 'Take your umbrella, it is raining outside.',
        pronunciationTip: 'Literally "against-rain": Pah-rah-plwee.'
      },
      de: {
        word: 'Regenschirm',
        romanization: 'Ray-gen-sheerm',
        meaning: 'Umbrella (గొడుగు)',
        sentence: 'Vergiss deinen Regenschirm nicht!',
        sentenceMeaning: 'Do not forget your umbrella!',
        pronunciationTip: 'Literally "Rain-shield": Ray-gen-sheerm.'
      },
      es: {
        word: 'Paraguas',
        romanization: 'Pah-rah-gwahs',
        meaning: 'Umbrella (గొడుగు)',
        sentence: 'Abro el paraguas cuando llueve.',
        sentenceMeaning: 'I open the umbrella when it rains.',
        pronunciationTip: 'Literally "stops-water": Pah-rah-gwahs.'
      },
      en: {
        word: 'Umbrella',
        romanization: 'Uhm-brel-uh',
        meaning: 'గొడుగు / छाता',
        sentence: 'She opened her colourful umbrella as the rain began.',
        sentenceMeaning: 'వర్షం మొదలవగానే ఆమె తన రంగురంగుల గొడుగును తెరిచింది.',
        pronunciationTip: 'Stress the middle syllable: uhm-BREL-uh.'
      }
    }
  }
];

export const PICTURE_VOCABULARY_BANK: PictureVocabularyItem[] = RAW_PICTURE_VOCABULARY.map((item) => ({
  ...item,
  illustrationSvgDataUrl: generateVocabularySvgDataUrl(item.svgScene, item.englishWord, item.accentColor, item.secondaryColor)
}));

/**
 * Retrieves picture vocabulary items formatted for the requested target language and support language.
 */
export function getPictureVocabularyForLanguage(targetLang: string, supportLang: string, category?: string) {
  const lang = targetLang.toLowerCase();
  const filtered = category && category !== 'all'
    ? PICTURE_VOCABULARY_BANK.filter((v) => v.category === category)
    : PICTURE_VOCABULARY_BANK;

  return filtered.map((item) => {
    const targetData = item.languages[lang] || item.languages['ja'] || item.languages['en'];
    const supportData = item.languages[supportLang.toLowerCase()] || item.languages['en'];

    // Generate 4 multiple-choice options in the target language for interactive Picture Quiz
    const distractorItems = PICTURE_VOCABULARY_BANK.filter((other) => other.id !== item.id).slice(0, 3);
    const options = [
      targetData.word,
      ...distractorItems.map((d) => (d.languages[lang] || d.languages['en']).word)
    ].sort((a, b) => a.localeCompare(b));

    return {
      id: item.id,
      category: item.category,
      englishWord: item.englishWord,
      accentColor: item.accentColor,
      secondaryColor: item.secondaryColor,
      illustrationSvgDataUrl: item.illustrationSvgDataUrl,
      targetWord: targetData.word,
      romanization: targetData.romanization,
      supportMeaning: supportLang === 'en' ? item.englishWord : `${supportData.word} (${item.englishWord})`,
      targetSentence: targetData.sentence,
      sentenceRomanization: targetData.sentenceRomanization || '',
      sentenceMeaning: targetData.sentenceMeaning,
      pronunciationTip: targetData.pronunciationTip,
      quizOptions: options
    };
  });
}

// ============================================================================
// 3. LANGUAGE-SPECIFIC SCRIPT & PHONETIC MASTERY DECKS
// ============================================================================

export interface ScriptDeckGroup {
  groupTitle: string;
  subtitle: string;
  characters: Array<{
    char: string;
    romanization: string;
    exampleWord: string;
    meaning: string;
  }>;
}

export const LANGUAGE_SCRIPT_DECKS: Record<string, ScriptDeckGroup[]> = {
  ja: [
    {
      groupTitle: 'ひらがな (Hiragana Core Vowels & K-Row)',
      subtitle: 'Phonetic syllabary used for native Japanese words and grammar particles',
      characters: [
        { char: 'あ', romanization: 'a', exampleWord: 'あさ (Asa)', meaning: 'Morning / ఉదయం' },
        { char: 'い', romanization: 'i', exampleWord: 'いぬ (Inu)', meaning: 'Dog / కుక్క' },
        { char: 'う', romanization: 'u', exampleWord: 'うみ (Umi)', meaning: 'Sea / సముద్రం' },
        { char: 'え', romanization: 'e', exampleWord: 'えき (Eki)', meaning: 'Station / స్టేషన్' },
        { char: 'お', romanization: 'o', exampleWord: 'おちゃ (Ocha)', meaning: 'Green Tea / టీ' },
        { char: 'か', romanization: 'ka', exampleWord: 'かさ (Kasa)', meaning: 'Umbrella / గొడుగు' },
        { char: 'き', romanization: 'ki', exampleWord: 'き (Ki)', meaning: 'Tree / చెట్టు' },
        { char: 'く', romanization: 'ku', exampleWord: 'くも (Kumo)', meaning: 'Cloud / మేఘం' },
        { char: 'け', romanization: 'ke', exampleWord: 'けさ (Kesa)', meaning: 'This morning' },
        { char: 'こ', romanization: 'ko', exampleWord: 'こころ (Kokoro)', meaning: 'Heart / మనసు' }
      ]
    },
    {
      groupTitle: 'カタカナ (Katakana Core)',
      subtitle: 'Angular syllabary used for international loanwords, science terms, and emphasis',
      characters: [
        { char: 'ア', romanization: 'a', exampleWord: 'アジア (Ajia)', meaning: 'Asia' },
        { char: 'イ', romanization: 'i', exampleWord: 'インド (Indo)', meaning: 'India / భారతదేశం' },
        { char: 'ウ', romanization: 'u', exampleWord: 'ウイルス (Uirusu)', meaning: 'Virus' },
        { char: 'エ', romanization: 'e', exampleWord: 'エネルギー (Enerugii)', meaning: 'Energy / శక్తి' },
        { char: 'オ', romanization: 'o', exampleWord: 'オレンジ (Orenji)', meaning: 'Orange' },
        { char: 'パン', romanization: 'pan', exampleWord: 'パン (Pan)', meaning: 'Bread / రొట్టె' }
      ]
    },
    {
      groupTitle: '漢字 (Essential Pictographic Kanji)',
      subtitle: 'Meaning-bearing characters derived from nature and daily life',
      characters: [
        { char: '水', romanization: 'Mizu / Sui', exampleWord: '水曜日 (Suiyoubi)', meaning: 'Water / నీరు' },
        { char: '火', romanization: 'Hi / Ka', exampleWord: '火山 (Kazan)', meaning: 'Fire / అగ్ని' },
        { char: '木', romanization: 'Ki / Moku', exampleWord: '木曜日 (Mokuyoubi)', meaning: 'Tree & Wood / చెట్టు' },
        { char: '山', romanization: 'Yama / San', exampleWord: '富士山 (Fujisan)', meaning: 'Mountain / పర్వతం' },
        { char: '川', romanization: 'Kawa', exampleWord: '川 (Kawa)', meaning: 'River / నది' },
        { char: '日', romanization: 'Hi / Nichi', exampleWord: '日本 (Nihon)', meaning: 'Sun & Day / సూర్యుడు' },
        { char: '学', romanization: 'Manabu / Gaku', exampleWord: '学校 (Gakkou)', meaning: 'Study & Learning / విద్య' },
        { char: '生', romanization: 'Ikiru / Sei', exampleWord: '先生 (Sensei)', meaning: 'Life & Teacher / జీవితం' }
      ]
    }
  ],
  te: [
    {
      groupTitle: 'అచ్చులు (Achulu — Primary Vowels)',
      subtitle: 'Melodic vowel foundations of Telugu script',
      characters: [
        { char: 'అ', romanization: 'a', exampleWord: 'అమ్మ (Amma)', meaning: 'Mother' },
        { char: 'ఆ', romanization: 'aa', exampleWord: 'ఆవు (Aavu)', meaning: 'Cow' },
        { char: 'ఇ', romanization: 'i', exampleWord: 'ఇల్లు (Illu)', meaning: 'House' },
        { char: 'ఈ', romanization: 'ee', exampleWord: 'ఈగ (Eega)', meaning: 'Fly' },
        { char: 'ఉ', romanization: 'u', exampleWord: 'ఉడుత (Udutha)', meaning: 'Squirrel' },
        { char: 'ఊ', romanization: 'oo', exampleWord: 'ఊయల (Ooyala)', meaning: 'Cradle / Swing' },
        { char: 'ఎ', romanization: 'e', exampleWord: 'ఎలుక (Eluka)', meaning: 'Mouse' },
        { char: 'ఏ', romanization: 'ae', exampleWord: 'ఏనుగు (Aenugu)', meaning: 'Elephant' }
      ]
    },
    {
      groupTitle: 'హల్లులు & గుణింతాలు (Hallulu & Guninthalu)',
      subtitle: 'Consonants and vowel-consonant syllable combinations',
      characters: [
        { char: 'క', romanization: 'ka', exampleWord: 'కమలం (Kamalam)', meaning: 'Lotus' },
        { char: 'గ', romanization: 'ga', exampleWord: 'గంట (Ganta)', meaning: 'Bell' },
        { char: 'చ', romanization: 'cha', exampleWord: 'చంద్రుడు (Chandrudu)', meaning: 'Moon' },
        { char: 'త', romanization: 'tha', exampleWord: 'తెలుగు (Telugu)', meaning: 'Telugu Language' },
        { char: 'న', romanization: 'na', exampleWord: 'నమస్కారం (Namaskaram)', meaning: 'Respectful Greeting' },
        { char: 'ప', romanization: 'pa', exampleWord: 'పుస్తకం (Pusthakam)', meaning: 'Book' }
      ]
    }
  ],
  hi: [
    {
      groupTitle: 'स्वर (Swar — Devanagari Vowels)',
      subtitle: 'Pure vowel sounds and matra foundations in Hindi',
      characters: [
        { char: 'अ', romanization: 'a', exampleWord: 'अनार (Anaar)', meaning: 'Pomegranate / దానిమ్మ' },
        { char: 'आ', romanization: 'aa', exampleWord: 'आम (Aam)', meaning: 'Mango / మామిడి' },
        { char: 'इ', romanization: 'i', exampleWord: 'इमली (Imli)', meaning: 'Tamarind / చింతపండు' },
        { char: 'ई', romanization: 'ee', exampleWord: 'ईख (Eekh)', meaning: 'Sugarcane / చెరుకు' },
        { char: 'उ', romanization: 'u', exampleWord: 'उल्लू (Ullu)', meaning: 'Owl / గుడ్లగూబ' },
        { char: 'ऊ', romanization: 'oo', exampleWord: 'ऊन (Oon)', meaning: 'Wool / ఉన్ని' }
      ]
    },
    {
      groupTitle: 'व्यंजन (Vyanjan — Core Consonants)',
      subtitle: 'Structured phonetic consonants from velar to labial',
      characters: [
        { char: 'क', romanization: 'ka', exampleWord: 'कमल (Kamal)', meaning: 'Lotus / తామర' },
        { char: 'ग', romanization: 'ga', exampleWord: 'गमला (Gamla)', meaning: 'Flowerpot / పూలకుండీ' },
        { char: 'च', romanization: 'cha', exampleWord: 'चाय (Chaay)', meaning: 'Tea / తేనీరు' },
        { char: 'त', romanization: 'ta', exampleWord: 'तारा (Taara)', meaning: 'Star / నక్షత్రం' },
        { char: 'न', romanization: 'na', exampleWord: 'नमस्ते (Namaste)', meaning: 'Hello / నమస్కారం' },
        { char: 'प', romanization: 'pa', exampleWord: 'पानी (Paani)', meaning: 'Water / నీరు' }
      ]
    }
  ],
  fr: [
    {
      groupTitle: 'Accents Français & Voyelles Nasales',
      subtitle: 'Essential French pronunciation markers and nasal combinations',
      characters: [
        { char: 'é', romanization: 'ay (Closed E)', exampleWord: 'Été / École', meaning: 'Summer / School' },
        { char: 'è / ê', romanization: 'eh (Open E)', exampleWord: 'Mère / Forêt', meaning: 'Mother / Forest' },
        { char: 'ç', romanization: 's (Soft C)', exampleWord: 'Français / Garçon', meaning: 'French / Boy' },
        { char: 'eau', romanization: 'oh', exampleWord: 'Eau / Oiseau', meaning: 'Water / Bird' },
        { char: 'oi', romanization: 'wah', exampleWord: 'Bonsoir / Trois', meaning: 'Good evening / Three' },
        { char: 'ou', romanization: 'oo', exampleWord: 'Bonjour / Tout', meaning: 'Hello / All' }
      ]
    }
  ],
  de: [
    {
      groupTitle: 'Umlaute (Ä, Ö, Ü) & Eszett (ß)',
      subtitle: 'Distinctive German vowels and consonant clusters',
      characters: [
        { char: 'ä', romanization: 'eh', exampleWord: 'Mädchen / Äpfel', meaning: 'Girl / Apples' },
        { char: 'ö', romanization: 'oer (Rounded E)', exampleWord: 'Schön / Löffel', meaning: 'Beautiful / Spoon' },
        { char: 'ü', romanization: 'uer (Rounded I)', exampleWord: 'Bücher / Grün', meaning: 'Books / Green' },
        { char: 'ß', romanization: 'ss (Sharp S)', exampleWord: 'Straße / Groß', meaning: 'Street / Big' },
        { char: 'sch', romanization: 'sh', exampleWord: 'Schule / Tisch', meaning: 'School / Table' },
        { char: 'ei / ie', romanization: 'ai vs. ee', exampleWord: 'Eins / Liebe', meaning: 'One / Love' }
      ]
    }
  ],
  es: [
    {
      groupTitle: 'Alfabeto Español & Sonidos Especiales',
      subtitle: 'Unique Spanish letters and phonetic combinations',
      characters: [
        { char: 'ñ', romanization: 'ny', exampleWord: 'Mañana / Español', meaning: 'Morning / Spanish' },
        { char: 'll', romanization: 'y / ly', exampleWord: 'Lluvia / Calle', meaning: 'Rain / Street' },
        { char: 'rr', romanization: 'Rolled R', exampleWord: 'Perro / Arroz', meaning: 'Dog / Rice' },
        { char: 'j', romanization: 'h (Breathy)', exampleWord: 'Jardín / Rojo', meaning: 'Garden / Red' },
        { char: 'ch', romanization: 'ch', exampleWord: 'Leche / Ocho', meaning: 'Milk / Eight' },
        { char: 'h', romanization: 'Silent H', exampleWord: 'Hola / Hermano', meaning: 'Hello / Brother' }
      ]
    }
  ],
  en: [
    {
      groupTitle: 'English Vowel Phonemes & Consonant Digraphs',
      subtitle: 'Key sounds for clear, confident global English pronunciation',
      characters: [
        { char: 'th (θ)', romanization: 'Unvoiced TH', exampleWord: 'Think / Thank', meaning: 'ఆలోచించు / ధన్యవాదాలు' },
        { char: 'th (ð)', romanization: 'Voiced TH', exampleWord: 'Mother / This', meaning: 'అమ్మ / ఇది' },
        { char: 'sh (ʃ)', romanization: 'Soft SH', exampleWord: 'Ship / Shine', meaning: 'ఓడ / ప్రకాశించు' },
        { char: 'ch (tʃ)', romanization: 'Crisp CH', exampleWord: 'Chair / Teacher', meaning: 'కుర్చీ / ఉపాధ్యాయుడు' },
        { char: 'ee (iː)', romanization: 'Long EE', exampleWord: 'Tree / Water', meaning: 'చెట్టు / నీరు' },
        { char: 'ai (eɪ)', romanization: 'Long AY', exampleWord: 'Train / Rain', meaning: 'రైలు / వర్షం' }
      ]
    }
  ]
};

// ============================================================================
// 4. SEVEN INTERACTIVE LANGUAGE GAMES ENGINE (Games A to G)
// ============================================================================

export function generateInteractiveLanguageGamesSuite(targetLang: string, supportLang: string) {
  const vocab = getPictureVocabularyForLanguage(targetLang, supportLang);

  // Game A: Picture to Word
  const pictureToWord = vocab.slice(0, 6).map((v) => ({
    id: `ptw-${v.id}`,
    englishWord: v.englishWord,
    illustrationSvgDataUrl: v.illustrationSvgDataUrl,
    question: `What is this called in ${targetLang.toUpperCase()}?`,
    correctWord: v.targetWord,
    romanization: v.romanization,
    supportMeaning: v.supportMeaning,
    options: v.quizOptions,
    explanation: `"${v.targetWord}" (${v.romanization}) means ${v.englishWord} (${v.supportMeaning}). ${v.pronunciationTip}`
  }));

  // Game B: Listen and Select
  const listenAndSelect = vocab.slice(2, 8).map((v) => ({
    id: `las-${v.id}`,
    audioText: v.targetWord.split(' ')[0],
    romanization: v.romanization,
    correctWord: v.targetWord,
    englishWord: v.englishWord,
    supportMeaning: v.supportMeaning,
    illustrationSvgDataUrl: v.illustrationSvgDataUrl,
    options: [
      { word: v.targetWord, english: v.englishWord, meaning: v.supportMeaning, svg: v.illustrationSvgDataUrl, isCorrect: true },
      ...vocab
        .filter((o) => o.id !== v.id)
        .slice(0, 3)
        .map((o) => ({ word: o.targetWord, english: o.englishWord, meaning: o.supportMeaning, svg: o.illustrationSvgDataUrl, isCorrect: false }))
    ].sort((a, b) => a.english.localeCompare(b.english)),
    explanation: `You heard "${v.targetWord}" (${v.romanization}), which means ${v.englishWord}.`
  }));

  // Game C: Speak the Word
  const speakTheWord = vocab.slice(0, 6).map((v) => ({
    id: `stw-${v.id}`,
    englishWord: v.englishWord,
    targetWord: v.targetWord.split(' ')[0],
    fullDisplay: v.targetWord,
    romanization: v.romanization,
    supportMeaning: v.supportMeaning,
    illustrationSvgDataUrl: v.illustrationSvgDataUrl,
    pronunciationTip: v.pronunciationTip
  }));

  // Game D: Missing Letters
  const missingLetters = vocab.slice(0, 6).map((v) => {
    const cleanRoman = (v.romanization || v.englishWord).replace(/[^a-zA-Z]/g, '').toUpperCase();
    const wordToMask = cleanRoman.length >= 3 ? cleanRoman : 'MIZU';
    const midIndex = Math.floor(wordToMask.length / 2);
    const missingChar = wordToMask[midIndex];
    const maskedDisplay = wordToMask
      .split('')
      .map((ch, idx) => (idx === midIndex ? '_' : ch))
      .join(' ');
    const letterChoices = Array.from(new Set([missingChar, 'A', 'O', 'E', 'K', 'N'])).slice(0, 4);

    return {
      id: `ml-${v.id}`,
      targetScriptWord: v.targetWord,
      fullWord: wordToMask,
      maskedDisplay,
      missingChar,
      letterChoices,
      englishWord: v.englishWord,
      supportMeaning: v.supportMeaning,
      illustrationSvgDataUrl: v.illustrationSvgDataUrl,
      explanation: `Complete spelling: ${wordToMask} (${v.targetWord} — ${v.englishWord}).`
    };
  });

  // Game E: Word Matching
  const wordMatching = vocab.slice(0, 6).map((v) => ({
    id: `wm-${v.id}`,
    word: v.targetWord,
    romanization: v.romanization,
    meaning: `${v.englishWord} • ${v.supportMeaning}`,
    illustrationSvgDataUrl: v.illustrationSvgDataUrl
  }));

  // Game F: Sentence Builder
  const sentenceBuilder = vocab.slice(0, 5).map((v) => {
    const rawSentence = v.sentenceRomanization || v.targetSentence;
    const cleanTokens = rawSentence.replace(/[.!?。]/g, '').trim().split(/\s+/);
    const tokens = cleanTokens.length >= 3 ? cleanTokens : [v.targetWord.split(' ')[0], 'wa', 'ii', 'desu'];
    const scrambled = [...tokens].sort((a, b) => a.localeCompare(b));

    return {
      id: `sb-${v.id}`,
      targetNativeSentence: v.targetSentence,
      correctSentence: tokens.join(' '),
      tokens,
      scrambled_tokens: scrambled,
      meaning: v.sentenceMeaning,
      grammarTip: v.pronunciationTip
    };
  });

  // Game G: Conversation Challenge
  const conversationChallenge = getConversationChallengesForLang(targetLang);

  return {
    pictureToWord,
    listenAndSelect,
    speakTheWord,
    missingLetters,
    wordMatching,
    sentenceBuilder,
    conversationChallenge,
    // Legacy compatibility keys for existing tests
    wordMatch: wordMatching,
    sentenceScramble: sentenceBuilder[0]
  };
}

function getConversationChallengesForLang(lang: string) {
  if (lang === 'ja') {
    return [
      {
        id: 'cc-ja-1',
        scenario: 'Ordering at a Restaurant in Tokyo 🍱',
        speakerPrompt: 'いらっしゃいませ！ご注文はお決まりですか？ (Welcome! Have you decided on your order?)',
        options: [
          { text: '水とお茶をお願いします。 (Mizu to ocha o onegaishimasu.)', isCorrect: true, meaning: 'Water and green tea, please.' },
          { text: 'さようなら、また明日。 (Sayounara, mata ashita.)', isCorrect: false, meaning: 'Goodbye, see you tomorrow.' },
          { text: '私の名前は田中です。 (Watashi no namae wa Tanaka desu.)', isCorrect: false, meaning: 'My name is Tanaka.' }
        ],
        explanation: '「〜をお願いします (... o onegaishimasu)」 is the natural, polite expression used when ordering food or drinks in Japanese.'
      },
      {
        id: 'cc-ja-2',
        scenario: 'Meeting a Teacher in the Morning 🏫',
        speakerPrompt: 'おはようございます！今日も元気ですか？ (Good morning! Are you doing well today?)',
        options: [
          { text: 'はい、元気です！ありがとうございます。 (Hai, genki desu! Arigatou gozaimasu.)', isCorrect: true, meaning: 'Yes, I am fine! Thank you very much.' },
          { text: 'おやすみなさい。 (Oyasuminasai.)', isCorrect: false, meaning: 'Good night.' },
          { text: 'ごちそうさまでした。 (Gochisousama deshita.)', isCorrect: false, meaning: 'Thank you for the meal.' }
        ],
        explanation: 'Respond to 「元気ですか？」 with 「はい、元気です！」 (Yes, I am well!).'
      }
    ];
  }

  if (lang === 'te') {
    return [
      {
        id: 'cc-te-1',
        scenario: 'Greeting an Elder Respectfully 🙏',
        speakerPrompt: 'నమస్కారం బాబూ! ఎలా ఉన్నావు? చదువు ఎలా సాగుతోంది? (Hello! How are you? How are your studies going?)',
        options: [
          { text: 'నమస్కారం అండీ! నేను బాగున్నాను, చదువు చాలా బాగా సాగుతోంది.', isCorrect: true, meaning: 'Hello! I am doing well, and my studies are going very well.' },
          { text: 'నాకు ఆకలిగా ఉంది.', isCorrect: false, meaning: 'I am hungry.' },
          { text: 'రైలు స్టేషన్ ఎక్కడ ఉంది?', isCorrect: false, meaning: 'Where is the train station?' }
        ],
        explanation: 'Adding "అండీ (Andi)" shows polite respect when speaking with elders or teachers in Telugu.'
      }
    ];
  }

  if (lang === 'hi') {
    return [
      {
        id: 'cc-hi-1',
        scenario: 'Asking for Directions to the Train Station 🚅',
        speakerPrompt: 'नमस्ते! क्या मैं आपकी कुछ मदद कर सकता हूँ? (Hello! Can I help you with something?)',
        options: [
          { text: 'जी हाँ, कृपया बताइए रेलवे स्टेशन किस तरफ है?', isCorrect: true, meaning: 'Yes please, could you tell me which way the railway station is?' },
          { text: 'आज मौसम बहुत ठंडा है।', isCorrect: false, meaning: 'The weather is very cold today.' },
          { text: 'मुझे सेब पसंद है।', isCorrect: false, meaning: 'I like apples.' }
        ],
        explanation: 'Starting with "जी हाँ, कृपया बताइए..." (Yes, please tell me...) is polite and clear when asking for directions.'
      }
    ];
  }

  return [
    {
      id: `cc-${lang}-1`,
      scenario: 'Polite Daily Greeting & Introduction 👋',
      speakerPrompt: lang === 'fr'
        ? 'Bonjour ! Comment vous appelez-vous ?'
        : lang === 'de'
        ? 'Guten Tag! Wie heißen Sie?'
        : lang === 'es'
        ? '¡Hola! ¿Cómo te llamas?'
        : 'Hello! Welcome to our class. How are you doing today?',
      options: [
        {
          text: lang === 'fr'
            ? "Bonjour ! Je m'appelle Vishwak, enchanté."
            : lang === 'de'
            ? 'Guten Tag! Ich heiße Vishwak, freut mich.'
            : lang === 'es'
            ? '¡Hola! Me llamo Vishwak, mucho gusto.'
            : 'I am doing great, thank you! Excited to learn today.',
          isCorrect: true,
          meaning: 'Polite introduction and greeting response.'
        },
        {
          text: lang === 'fr' ? 'Où est la gare ?' : lang === 'de' ? 'Wo ist der Bahnhof?' : 'Where is the train station?',
          isCorrect: false,
          meaning: 'Asking for the train station.'
        },
        {
          text: lang === 'fr' ? 'Au revoir !' : lang === 'de' ? 'Auf Wiedersehen!' : 'Goodbye, see you later!',
          isCorrect: false,
          meaning: 'Saying goodbye.'
        }
      ],
      explanation: 'Always match a greeting and name inquiry with a polite self-introduction.'
    }
  ];
}

// ============================================================================
// 5. LISTENING & UNDERSTANDING STUDIO ENGINE (5 Activity Modes)
// ============================================================================

export function generateListeningActivitiesForLanguage(targetLang: string, supportLang: string) {
  const vocab = getPictureVocabularyForLanguage(targetLang, supportLang);

  return {
    wordIdentification: vocab.slice(0, 4).map((v) => ({
      id: `listen-word-${v.id}`,
      type: 'word_picture',
      audioText: v.targetWord.split(' ')[0],
      romanization: v.romanization,
      prompt: 'Listen carefully to the word and choose the matching picture:',
      correctWord: v.targetWord,
      englishWord: v.englishWord,
      supportMeaning: v.supportMeaning,
      illustrationSvgDataUrl: v.illustrationSvgDataUrl,
      options: v.quizOptions
    })),

    sentenceComprehension: vocab.slice(0, 4).map((v) => ({
      id: `listen-sent-${v.id}`,
      type: 'sentence_meaning',
      audioText: v.targetSentence,
      romanization: v.sentenceRomanization,
      targetSentence: v.targetSentence,
      correctMeaning: v.sentenceMeaning,
      options: [
        v.sentenceMeaning,
        'The train departs at nine o’clock in the evening.',
        'Please open your textbook to chapter four.',
        'Where is the nearest public library?'
      ].sort((a, b) => a.localeCompare(b)),
      explanation: `Spoken sentence: "${v.targetSentence}" (${v.sentenceRomanization}) → ${v.sentenceMeaning}`
    })),

    minimalPairs: getMinimalPairsForLanguage(targetLang),

    shortDialogue: getShortDialogueForLanguage(targetLang)
  };
}

function getMinimalPairsForLanguage(lang: string) {
  if (lang === 'ja') {
    return [
      {
        id: 'mp-ja-1',
        title: 'Japanese Vowel Length Distinction (Short vs. Long Vowel)',
        audioText: 'おばあさん',
        wordA: { text: 'おばさん (Obasan)', meaning: 'Aunt (చిన్నమ్మ / పిన్ని)' },
        wordB: { text: 'おばあさん (Obaasan)', meaning: 'Grandmother (అమ్మమ్మ / నానమ్మ)' },
        correctChoice: 'B',
        explanation: 'In Japanese, holding the vowel "aa" for two moras changes the meaning from Aunt (Obasan) to Grandmother (Obaasan).'
      },
      {
        id: 'mp-ja-2',
        title: 'Pitch & Double Consonant Distinction',
        audioText: 'きって',
        wordA: { text: 'きて (Kite)', meaning: 'Please come (రండి)' },
        wordB: { text: 'きって (Kitte)', meaning: 'Postage Stamp (స్టాంపు)' },
        correctChoice: 'B',
        explanation: 'The small っ (tsu) creates a brief pause before "te", distinguishing Kitte (Stamp) from Kite (Come).'
      }
    ];
  }
  if (lang === 'hi') {
    return [
      {
        id: 'mp-hi-1',
        title: 'Unaspirated vs. Aspirated Consonant (प vs. फ)',
        audioText: 'फल',
        wordA: { text: 'पल (Pal)', meaning: 'Moment of time (క్షణం)' },
        wordB: { text: 'फल (Phal)', meaning: 'Fruit (పండు)' },
        correctChoice: 'B',
        explanation: 'फल (Phal) uses an aspirated labial consonant with a burst of breath, meaning Fruit.'
      }
    ];
  }
  if (lang === 'te') {
    return [
      {
        id: 'mp-te-1',
        title: 'Hrasva (Short) vs. Deergha (Long) Vowel',
        audioText: 'కాలం',
        wordA: { text: 'కలం (Kalam)', meaning: 'Pen (పెన్ను)' },
        wordB: { text: 'కాలం (Kaalam)', meaning: 'Time / Season (సమయం)' },
        correctChoice: 'B',
        explanation: 'Extending "క (ka)" to "కా (kaa)" transforms కలం (Pen) into కాలం (Time).'
      }
    ];
  }
  return [
    {
      id: `mp-${lang}-1`,
      title: 'Short vs. Long Vowel Discrimination',
      audioText: 'Sheep',
      wordA: { text: 'Ship (/ʃɪp/)', meaning: 'Ocean vessel (ఓడ)' },
      wordB: { text: 'Sheep (/ʃiːp/)', meaning: 'Woolly farm animal (గొర్రె)' },
      correctChoice: 'B',
      explanation: 'Notice the long tense vowel /iː/ in "Sheep" compared to the short lax vowel /ɪ/ in "Ship".'
    }
  ];
}

function getShortDialogueForLanguage(lang: string) {
  if (lang === 'ja') {
    return {
      title: 'At the Bookstore in Kyoto 📚',
      lines: [
        { speaker: 'Clerk', text: 'いらっしゃいませ。何をお探しですか？', romaji: 'Irasshaimase. Nani o osagashi desu ka?', meaning: 'Welcome. What are you looking for?' },
        { speaker: 'Student', text: '日本語の辞書を探しています。', romaji: 'Nihongo no jisho o sagashite imasu.', meaning: 'I am looking for a Japanese dictionary.' },
        { speaker: 'Clerk', text: '辞書は二階にありますよ。', romaji: 'Jisho wa nikai ni arimasu yo.', meaning: 'Dictionaries are on the second floor.' }
      ],
      question: 'Where are the Japanese dictionaries located?',
      options: ['On the second floor (二階)', 'Next to the train station', 'In the cafeteria', 'Sold out today'],
      correctOption: 'On the second floor (二階)'
    };
  }
  return {
    title: 'Planning a Study Session Together 🎓',
    lines: [
      { speaker: 'Maya', text: 'Are you going to the science library after lunch?', romaji: '', meaning: 'మధ్యాహ్న భోజనం తర్వాత సైన్స్ లైబ్రరీకి వెళ్తున్నావా?' },
      { speaker: 'Arjun', text: 'Yes! I need to borrow a book on photosynthesis and practice speaking.', romaji: '', meaning: 'అవును! నేను కిరణజన్య సంయోగక్రియపై పుస్తకం తీసుకోవాలి.' }
    ],
    question: 'Why is Arjun visiting the science library?',
    options: [
      'To borrow a book on photosynthesis and practice speaking',
      'To buy lunch at the café',
      'To catch the evening train',
      'To return an umbrella'
    ],
    correctOption: 'To borrow a book on photosynthesis and practice speaking'
  };
}

// ============================================================================
// 6. AI CONVERSATION SCENARIOS ENGINE (8 Real-Life Situations)
// ============================================================================

export interface ConversationScenarioMeta {
  id: string;
  title: string;
  icon: string;
  setting: string;
  starterByLang: Record<string, { aiText: string; romaji?: string; translation: string; suggestedReplies: string[] }>;
}

export const AI_CONVERSATION_SCENARIOS: ConversationScenarioMeta[] = [
  {
    id: 'self_intro',
    title: 'Introducing Yourself',
    icon: '🙋‍♂️',
    setting: 'First day at an international exchange classroom',
    starterByLang: {
      ja: {
        aiText: 'はじめまして！私はAI先生のさくらです。あなたのお名前は何ですか？',
        romaji: 'Hajimemashite! Watashi wa AI-sensei no Sakura desu. Anata no onamae wa nan desu ka?',
        translation: 'Nice to meet you! I am AI Teacher Sakura. What is your name? (మిమ్మల్ని కలవడం సంతోషం! మీ పేరు ఏమిటి?)',
        suggestedReplies: ['はじめまして、私の名前はヴィシュワクです。', 'こんにちは！よろしくお願いします。', '私はインドから来ました。']
      },
      te: {
        aiText: 'నమస్కారం! మిమ్మల్ని కలవడం చాలా సంతోషం. మీ పేరు ఏమిటి మరియు మీరు ఏ తరగతి చదువుతున్నారు?',
        translation: 'Hello! Very happy to meet you. What is your name and which grade are you studying in?',
        suggestedReplies: ['నమస్కారం! నా పేరు విశ్వక్, నేను పదవ తరగతి చదువుతున్నాను.', 'నేను కొత్త భాషలు నేర్చుకోవడానికి ఇష్టపడతాను.']
      },
      hi: {
        aiText: 'नमस्ते! आपसे मिलकर बहुत खुशी हुई। आपका शुभ नाम क्या है?',
        translation: 'Hello! Very pleased to meet you. What is your good name? (నమస్కారం! మీ పేరు ఏమిటి?)',
        suggestedReplies: ['नमस्ते! मेरा नाम विश्वक है।', 'मैं दसवीं कक्षा का छात्र हूँ।']
      },
      en: {
        aiText: 'Hello and welcome! I am your AI communication coach. Could you introduce yourself and tell me one hobby you enjoy?',
        translation: 'నమస్కారం! మిమ్మల్ని మీరు పరిచయం చేసుకుని, మీకు ఇష్టమైన ఒక అలవాటు గురించి చెబుతారా?',
        suggestedReplies: ['Hello! My name is Vishwak and I enjoy learning science and languages.', 'Nice to meet you! I love reading books and playing educational games.']
      }
    }
  },
  {
    id: 'ordering_food',
    title: 'Ordering Food & Drinks',
    icon: '🍱',
    setting: 'A welcoming café & restaurant',
    starterByLang: {
      ja: {
        aiText: 'いらっしゃいませ！テーブルへどうぞ。お飲み物と食事は何になさいますか？',
        romaji: 'Irasshaimase! Teeburu e douzo. Onomimono to shokuji wa nani ni nasaimasu ka?',
        translation: 'Welcome! Please have a seat at the table. What would you like for drinks and food?',
        suggestedReplies: ['水と温かいお茶をお願いします。', 'ご飯と野菜カレーをください。', 'メニューを見せてください。']
      },
      en: {
        aiText: 'Welcome to the Study Café! What would you like to order to drink or eat today?',
        translation: 'స్టడీ కేఫ్‌కు స్వాగతం! ఈరోజు మీరు ఏమి ఆర్డర్ చేయాలనుకుంటున్నారు?',
        suggestedReplies: ['Could I please have a glass of fresh water and a warm sandwich?', 'I would like a cup of green tea and a bowl of fruit, please.']
      }
    }
  },
  {
    id: 'directions',
    title: 'Asking for Directions',
    icon: '🗺️',
    setting: 'Navigating near the central train station',
    starterByLang: {
      ja: {
        aiText: 'こんにちは！何かお困りですか？どこへ行きたいですか？',
        romaji: 'Konnichiwa! Nanika okomari desu ka? Doko e ikitai desu ka?',
        translation: 'Hello! Do you need any help? Where would you like to go?',
        suggestedReplies: ['すみません、一番近い電車駅はどこですか？', '科学図書館への道を教えてください。']
      },
      en: {
        aiText: 'Excuse me, you look like you are looking for a building. How can I help direct you?',
        translation: 'మీరు ఏదో భవనం కోసం వెతుకుతున్నట్లున్నారు. నేను మీకు ఎలా దారి చూపగలను?',
        suggestedReplies: ['Excuse me, could you tell me how to get to the central train station?', 'How far is the science museum from this street?']
      }
    }
  },
  {
    id: 'school',
    title: 'Talking About School',
    icon: '🏫',
    setting: 'Discussing favourite subjects with a classmate',
    starterByLang: {
      ja: {
        aiText: '学校ではどんな科目が一番好きですか？',
        romaji: 'Gakkou de wa donna kamoku ga ichiban suki desu ka?',
        translation: 'Which subject do you like the most at school?',
        suggestedReplies: ['私は科学と数学が一番好きです。', '日本語の授業がとても楽しいです。']
      },
      en: {
        aiText: 'What is your favourite subject at school, and what topic are you studying this week?',
        translation: 'పాఠశాలలో మీకు ఇష్టమైన సబ్జెక్టు ఏది? ఈ వారం మీరు ఏ అంశం చదువుతున్నారు?',
        suggestedReplies: ['My favourite subject is Biology, and we are learning about photosynthesis.', 'I really enjoy Physics and Mathematics!']
      }
    }
  },
  {
    id: 'greetings',
    title: 'Greeting People Politely',
    icon: '🤝',
    setting: 'Morning, afternoon, and evening greetings',
    starterByLang: {
      ja: {
        aiText: 'おはようございます！今日もいい天気ですね。',
        romaji: 'Ohayou gozaimasu! Kyou mo ii tenki desu ne.',
        translation: 'Good morning! It is lovely weather today too, isn’t it?',
        suggestedReplies: ['おはようございます！はい、とてもいい天気ですね。', 'こんにちは！今日も元気に勉強しましょう。']
      },
      en: {
        aiText: 'Good morning! It is wonderful to see you today. How has your morning been?',
        translation: 'శుభోదయం! ఈరోజు మిమ్మల్ని చూడటం చాలా సంతోషంగా ఉంది. మీ ఉదయం ఎలా గడిచింది?',
        suggestedReplies: ['Good morning! My morning has been great, thank you for asking.', 'Hello! I had a nutritious breakfast and I am ready to study.']
      }
    }
  },
  {
    id: 'shopping',
    title: 'Shopping at a Market',
    icon: '🛍️',
    setting: 'Buying fresh fruits and stationery',
    starterByLang: {
      ja: {
        aiText: 'いらっしゃいませ！新鮮なりんごとマンゴーがありますよ。いくつ入りますか？',
        romaji: 'Irasshaimase! Shinsen na ringo to mangoo ga arimasu yo. Ikutsu irimasu ka?',
        translation: 'Welcome! We have fresh apples and mangoes. How many would you like?',
        suggestedReplies: ['りんごを二つとマンゴーを一つください。', 'これはいくらですか？']
      },
      en: {
        aiText: 'Welcome to the fresh market! We have crisp red apples and sweet mangoes today. What can I get for you?',
        translation: 'మార్కెట్‌కు స్వాగతం! ఈరోజు మా వద్ద తాజా ఆపిల్స్ మరియు మామిడి పండ్లు ఉన్నాయి. మీకు ఏమి కావాలి?',
        suggestedReplies: ['I would like three apples and two mangoes, please. How much is the total?', 'Are these carrots fresh from the farm today?']
      }
    }
  },
  {
    id: 'family',
    title: 'Talking About Family',
    icon: '👨‍👩‍👧‍👦',
    setting: 'Sharing warm stories about family members',
    starterByLang: {
      ja: {
        aiText: 'あなたのご家族は何人ですか？どんなことを一緒にしますか？',
        romaji: 'Anata no gokazoku wa nan-nin desu ka? Donna koto o issho ni shimasu ka?',
        translation: 'How many people are in your family? What do you do together?',
        suggestedReplies: ['私の家族は四人です。週末に一緒にお茶を飲みます。', 'お母さんとお父さんはとても優しいです。']
      },
      en: {
        aiText: 'Tell me a little about your family! What do you enjoy doing together on weekends?',
        translation: 'మీ కుటుంబం గురించి చెప్పండి! వారాంతాల్లో మీరు కలిసి ఏమి చేయడానికి ఇష్టపడతారు?',
        suggestedReplies: ['There are four people in my family, and we love having dinner together.', 'My parents and I enjoy visiting parks and reading stories.']
      }
    }
  },
  {
    id: 'daily_life',
    title: 'Everyday Conversations',
    icon: '☀️',
    setting: 'Daily routines, hobbies, and plans',
    starterByLang: {
      ja: {
        aiText: '週末は何をする予定ですか？',
        romaji: 'Shuumatsu wa nani o suru yotei desu ka?',
        translation: 'What are you planning to do this weekend?',
        suggestedReplies: ['図書館で本を読んで、公園を散歩します。', '家族と一緒に映画を見ます。']
      },
      en: {
        aiText: 'What does your daily routine look like after school?',
        translation: 'పాఠశాల తర్వాత మీ దినచర్య ఎలా ఉంటుంది?',
        suggestedReplies: ['After school, I drink some water, review my notes, and play outside.', 'I practice speaking a new language for twenty minutes every evening.']
      }
    }
  }
];
