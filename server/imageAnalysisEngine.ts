import { unifiedKnowledgeRetrieval, type EducationalBoard } from './unifiedKnowledgeRetrieval.ts';

export interface ImageAnalysisRequest {
  imageBase64: string;
  mimeType: string;
  fileName?: string;
  question?: string;
  subject?: string;
  grade?: number;
  board?: string;
}

export interface AnalyzedComponent {
  name: string;
  whatItIs: string;
  function: string;
  relationship: string;
  takeaway: string;
}

export interface EducationalImageAnalysisResult {
  analysisId: string;
  providerUsed: string;
  modelUsed: string;
  imageQuality: {
    status: 'clear' | 'moderate' | 'unclear_or_low_res';
    byteSize: number;
    mimeType: string;
    notes: string;
  };
  imageType: 'scientific_diagram' | 'textbook_page' | 'graph_or_chart' | 'math_solution' | 'table' | 'educational_photo' | 'unknown';
  subject: string;
  topic: string;
  title: string;
  visibleTextOcr: string[];
  visibleLabels: string[];
  components: AnalyzedComponent[];
  relationshipsAndArrows: string[];
  processStages: string[];
  equationsAndFormulas: string[];
  graphOrTableSummary?: string;
  unclearOrMissingInformation: string[];
  distinction: {
    directlyVisibleInImage: string[];
    inferredFromContext: string[];
    retrievedVerifiedKnowledge: string[];
  };
  teachingExplanation: string;
  followUpSuggestions: string[];
  confidenceScore: number;
}

const ANALYSIS_PROMPT = `You are an expert Indian Curriculum Educational Image Analyst.
Carefully inspect the uploaded educational image and return STRICT JSON ONLY (no markdown fences).

CRITICAL HONESTY RULES:
1. Only list labels, text, symbols, and arrows in "visibleLabels" and "visibleTextOcr" that are ACTUALLY VISIBLE in the image. Never invent invisible labels.
2. If any part of the image is blurry, cropped, low-resolution, or unreadable, explicitly list it in "unclearOrMissingInformation".
3. Clearly separate what is directly visible in the image vs what is inferred from academic context.

Return JSON with this exact schema:
{
  "imageQualityStatus": "clear" | "moderate" | "unclear_or_low_res",
  "imageQualityNotes": "string",
  "imageType": "scientific_diagram" | "textbook_page" | "graph_or_chart" | "math_solution" | "table" | "educational_photo" | "unknown",
  "subject": "Biology | Physics | Chemistry | Mathematics | History | Geography | General Science",
  "topic": "Exact educational topic",
  "title": "Descriptive title of what the image shows",
  "visibleTextOcr": ["exact visible text lines"],
  "visibleLabels": ["exact visible labels/annotations"],
  "components": [
    {
      "name": "Component name",
      "whatItIs": "What it is in the image",
      "function": "Its scientific/academic function",
      "relationship": "How it connects to other parts/arrows",
      "takeaway": "What the student should learn from it"
    }
  ],
  "relationshipsAndArrows": ["Arrow/connection descriptions"],
  "processStages": ["Ordered stages if it depicts a process"],
  "equationsAndFormulas": ["Visible equations or formulas"],
  "graphOrTableSummary": "Axes/trends/table summary if applicable, else empty string",
  "unclearOrMissingInformation": ["Any blurry, cropped, or unreadable parts"],
  "directlyVisibleInImage": ["Facts directly observed in the pixels"],
  "inferredFromContext": ["Academic inferences connecting the visual"],
  "teachingExplanation": "Detailed teacher-style explanation grounded in the image and answering the student's question if provided",
  "followUpSuggestions": ["Explain the second stage", "What does this label mean?", "Why does this arrow point in this direction?"],
  "confidenceScore": 0.0
}`;

function stripBase64Prefix(input: string): { base64: string; detectedMime?: string } {
  const match = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (match) {
    return { detectedMime: match[1], base64: match[2].replace(/\s+/g, '') };
  }
  return { base64: input.replace(/\s+/g, '') };
}

function parseJsonSafe(raw: string): any | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function analyzeEducationalImage(req: ImageAnalysisRequest): Promise<EducationalImageAnalysisResult> {
  const { base64, detectedMime } = stripBase64Prefix(req.imageBase64 || '');
  const mimeType = detectedMime || req.mimeType || 'image/png';
  const byteSize = Math.floor((base64.length * 3) / 4);
  const analysisId = `img-analysis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (!base64 || byteSize < 64) {
    throw new Error('Uploaded image is empty or corrupted.');
  }

  const studentContextPrompt = [
    ANALYSIS_PROMPT,
    req.subject ? `Hinted Subject: ${req.subject}` : '',
    req.grade ? `Student Grade: ${req.grade}` : '',
    req.board ? `Curriculum Board: ${req.board}` : '',
    req.question ? `Student Question about this image: ${req.question}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  let parsed: any = null;
  let providerUsed = '';
  let modelUsed = '';
  const errors: string[] = [];

  // 1. Primary Multimodal Provider: Google Gemini Vision
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    const geminiModels = [process.env.GEMINI_MODEL || 'gemini-2.5-flash', 'gemini-2.0-flash'];
    for (const model of geminiModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: studentContextPrompt },
                  { inlineData: { mimeType, data: base64 } }
                ]
              }
            ],
            generationConfig: { temperature: 0.2 }
          }),
          signal: AbortSignal.timeout(25000)
        });

        if (!res.ok) {
          const errTxt = await res.text();
          errors.push(`Gemini (${model}) HTTP ${res.status}: ${errTxt.slice(0, 120)}`);
          continue;
        }
        const data = (await res.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const maybe = parseJsonSafe(text);
        if (maybe) {
          parsed = maybe;
          providerUsed = 'gemini';
          modelUsed = model;
          break;
        }
      } catch (err: any) {
        errors.push(`Gemini (${model}): ${err?.message || err}`);
      }
    }
  }

  // 2. Fallback Multimodal Provider: OpenAI Vision (gpt-4o-mini)
  if (!parsed) {
    const openAiKey = process.env.OPENAI_API_KEY?.trim();
    if (openAiKey) {
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model,
            temperature: 0.2,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: studentContextPrompt },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
                ]
              }
            ]
          }),
          signal: AbortSignal.timeout(25000)
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          const text = data?.choices?.[0]?.message?.content || '';
          const maybe = parseJsonSafe(text);
          if (maybe) {
            parsed = maybe;
            providerUsed = 'openai';
            modelUsed = model;
          }
        } else {
          const errTxt = await res.text();
          errors.push(`OpenAI (${model}) HTTP ${res.status}: ${errTxt.slice(0, 120)}`);
        }
      } catch (err: any) {
        errors.push(`OpenAI (${model}): ${err?.message || err}`);
      }
    }
  }

  // 3. Honest Fallback if both multimodal providers failed/unavailable
  if (!parsed) {
    return {
      analysisId,
      providerUsed: 'unavailable',
      modelUsed: 'none',
      imageQuality: {
        status: byteSize < 4000 ? 'unclear_or_low_res' : 'moderate',
        byteSize,
        mimeType,
        notes: 'Image received, but multimodal vision providers could not complete pixel inspection.'
      },
      imageType: 'unknown',
      subject: req.subject || 'General Science',
      topic: req.fileName ? req.fileName.replace(/\.[^.]+$/, '') : 'Uploaded Educational Image',
      title: req.fileName || 'Uploaded Image (Vision Analysis Unavailable)',
      visibleTextOcr: [],
      visibleLabels: [],
      components: [],
      relationshipsAndArrows: [],
      processStages: [],
      equationsAndFormulas: [],
      unclearOrMissingInformation: [
        'Multimodal vision analysis could not inspect the image pixels right now.',
        ...errors.slice(0, 2)
      ],
      distinction: {
        directlyVisibleInImage: [],
        inferredFromContext: [],
        retrievedVerifiedKnowledge: []
      },
      teachingExplanation:
        'I received your image, but the multimodal vision service is currently unavailable or rate-limited, so I cannot honestly read the labels or diagram details inside the image. Please describe the topic or paste the visible text so I can teach it accurately.',
      followUpSuggestions: [
        'Retry image analysis',
        'Type the topic shown in the textbook page'
      ],
      confidenceScore: 0
    };
  }

  // 4. Retrieve Verified Academic Context from STUDYAI Knowledge Bank
  const resolvedTopic = String(parsed.topic || req.fileName || 'Curriculum Concept');
  const resolvedSubject = String(parsed.subject || req.subject || 'Science');
  let retrievedKnowledgeFacts: string[] = [];
  try {
    const kb = await unifiedKnowledgeRetrieval.retrieveCurriculumKnowledge({
      topic: resolvedTopic,
      subject: resolvedSubject,
      grade: req.grade || 10,
      board: (req.board as EducationalBoard) || 'CBSE',
      language: 'English'
    });
    if (kb?.dualExplanation?.academicFormalDefinition) {
      retrievedKnowledgeFacts.push(kb.dualExplanation.academicFormalDefinition);
    }
    if (Array.isArray(kb?.dualExplanation?.stepByStepMechanism)) {
      retrievedKnowledgeFacts.push(...kb.dualExplanation.stepByStepMechanism.slice(0, 3));
    }
  } catch {
    // non-blocking
  }

  return {
    analysisId,
    providerUsed,
    modelUsed,
    imageQuality: {
      status: parsed.imageQualityStatus || (byteSize < 4000 ? 'unclear_or_low_res' : 'clear'),
      byteSize,
      mimeType,
      notes: parsed.imageQualityNotes || 'Image inspected for clarity and readable labels.'
    },
    imageType: parsed.imageType || 'scientific_diagram',
    subject: resolvedSubject,
    topic: resolvedTopic,
    title: parsed.title || resolvedTopic,
    visibleTextOcr: Array.isArray(parsed.visibleTextOcr) ? parsed.visibleTextOcr : [],
    visibleLabels: Array.isArray(parsed.visibleLabels) ? parsed.visibleLabels : [],
    components: Array.isArray(parsed.components) ? parsed.components : [],
    relationshipsAndArrows: Array.isArray(parsed.relationshipsAndArrows) ? parsed.relationshipsAndArrows : [],
    processStages: Array.isArray(parsed.processStages) ? parsed.processStages : [],
    equationsAndFormulas: Array.isArray(parsed.equationsAndFormulas) ? parsed.equationsAndFormulas : [],
    graphOrTableSummary: parsed.graphOrTableSummary || undefined,
    unclearOrMissingInformation: Array.isArray(parsed.unclearOrMissingInformation) ? parsed.unclearOrMissingInformation : [],
    distinction: {
      directlyVisibleInImage: Array.isArray(parsed.directlyVisibleInImage) ? parsed.directlyVisibleInImage : [],
      inferredFromContext: Array.isArray(parsed.inferredFromContext) ? parsed.inferredFromContext : [],
      retrievedVerifiedKnowledge: retrievedKnowledgeFacts
    },
    teachingExplanation: parsed.teachingExplanation || `Analysis of ${resolvedTopic} completed.`,
    followUpSuggestions: Array.isArray(parsed.followUpSuggestions) && parsed.followUpSuggestions.length > 0
      ? parsed.followUpSuggestions
      : [
          'Explain the second stage in detail',
          'What does each label mean?',
          'Give me examination notes from this image'
        ],
    confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.85
  };
}
