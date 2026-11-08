/**
 * STUDYAI Digital Notebook Pagination & Clean Audio Narration Utility
 * 
 * Safe for both browser (Vite React) and Node.js backend.
 * Provides:
 * 1. Automatic partitioning of Universal Teaching Workflow content into professionally formatted textbook pages
 * 2. Strict educational text cleaning for natural audio speech (no markdown, no HTML, no LaTeX, no punctuation names, no repetition)
 * 3. Structured page-by-page audio playlists with synchronized reading indicators
 */

export interface DiagramVisualExplanation8Point {
  diagramId: string;
  title: string;
  imageUrl: string;
  diagramType: string;
  caption: string;
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

export interface NotebookPageItem {
  pageNumber: number;
  pageId: string;
  title: string;
  headerCategory: string;
  subheading?: string;
  contentMarkdown: string;
  spokenAudioText: string;
  diagrams: DiagramVisualExplanation8Point[];
  hasFormulas?: boolean;
}

export interface NotebookAudioTrack {
  pageNumber: number;
  pageTitle: string;
  spokenText: string;
  estimatedDurationSeconds: number;
}

/**
 * Cleans notebook markdown into pure, natural educational speech:
 * - Strips all markdown noise (#, **, *, _, `, >)
 * - Strips all HTML tags (<details>, <summary>, <br>, etc.)
 * - Strips image syntax and raw URLs
 * - Converts mathematical formulas and chemical equations into intelligible spoken English
 * - CRITICAL: Never speaks punctuation names (no "comma", "full stop", "period", "colon", "semicolon")
 * - Strips table formatting characters (| and ---)
 * - Removes repeated phrases and ensures non-repetitive reading sequence
 */
export function cleanNotebookTextForAudioSpeech(rawText: string, topic = ''): string {
  if (!rawText || !rawText.trim()) {
    return topic ? `Let us review the core principles of ${topic}.` : 'Let us review this concept clearly.';
  }

  let text = String(rawText).trim();

  // 1. Remove Table of Contents and navigation anchors
  text = text.replace(/##\s*Table of Contents[\s\S]*?(?=##\s*Stage|\Z)/i, '');
  text = text.replace(/\[Stage \d+[^\]]*\]\([^)]+\)/g, '');

  // 2. Remove markdown images and links
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_m, caption) => {
    const cleanCap = caption.replace(/^Figure\s*[\d.]+:?\s*/i, '').trim();
    return cleanCap ? `Referring to the diagram: ${cleanCap}.` : '';
  });
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/https?:\/\/\S+/g, '');

  // 3. Remove HTML tags completely
  text = text.replace(/<details>[\s\S]*?<summary>([^<]+)<\/summary>/gi, 'Practice Question: $1.');
  text = text.replace(/<\/?[a-z][^>]*>/gi, ' ');

  // 4. Convert LaTeX / Math / Chemistry to spoken English
  text = text
    .replace(/\$\$\\mathbf\{([^}]+)\}\^\*\$\$/g, '$1')
    .replace(/\$\$([^$]+)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
    .replace(/\\cdot/g, ' times ')
    .replace(/\\times/g, ' times ')
    .replace(/\\Delta/g, ' change in ')
    .replace(/\\Sigma/g, ' net sum of ')
    .replace(/\\mu/g, ' coefficient of friction ')
    .replace(/\\propto/g, ' is proportional to ')
    .replace(/6\s*CO[_2₂]*\s*\+\s*6\s*H[_2₂]*O\s*(?:→|->|\\rightarrow|⎯⎯[^⎯]+⎯⎯→)+\s*C[_6₆]*H[_{}12₁₂]*O[_6₆]*\s*\+\s*6\s*O[_2₂]*/gi, 'six molecules of Carbon Dioxide plus six molecules of Water produce Glucose plus six molecules of Oxygen')
    .replace(/\\rightarrow/g, ' produces ')
    .replace(/C[_{}6₆]*H[_{}12₁₂]*O[_{}6₆]*/g, 'Glucose')
    .replace(/CO[_2₂]+/g, 'Carbon Dioxide')
    .replace(/H[_2₂]+O/g, 'Water')
    .replace(/O[_2₂]+/g, 'Oxygen gas')
    .replace(/F\s*=\s*m\s*(?:[·*×]|times)?\s*a\b/gi, 'Force equals mass times acceleration')
    .replace(/p\s*=\s*m\s*(?:[·*×]|times)?\s*v\b/gi, 'Momentum equals mass times velocity')
    .replace(/a\s*=\s*F\s*\/\s*m\b/g, 'acceleration equals Force divided by mass')
    .replace(/A\s*=\s*T\b/g, 'Adenine pairs with Thymine')
    .replace(/G\s*[≡=]\s*C\b/g, 'Guanine pairs with Cytosine')
    .replace(/→|->/g, ' leads to ')
    .replace(/±/g, ' plus or minus ')
    .replace(/²/g, ' squared ')
    .replace(/³/g, ' cubed ');

  // 5. Clean Markdown formatting syntax
  text = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s*(.*)$/gm, '$1.')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '')
    .replace(/^[ \t]*\d+\.[ \t]+/gm, '')
    .replace(/^[ \t]*>\s*/gm, '')
    .replace(/\|[ \t]*:?---+:?[ \t]*\|/g, '')
    .replace(/\|/g, ', ');

  // 6. Remove UI artifacts, emojis, and decorative labels
  text = text.replace(/[📖🏷️⚡📘⚖️🖼️💡✦🔹⚠️★✓📑🏆🎯]/g, '');
  text = text.replace(/\b(TOC|Table of Contents|Figure \d+\.\d+|Click to view|Button)\b/gi, '');

  // 7. Expand common scientific abbreviations on first mention
  const expansions: Array<{ abbr: string; regex: RegExp; spoken: string }> = [
    { abbr: 'DNA', regex: /\bDNA\b/, spoken: 'D-N-A (Deoxyribonucleic Acid)' },
    { abbr: 'RNA', regex: /\bRNA\b/, spoken: 'R-N-A (Ribonucleic Acid)' },
    { abbr: 'mRNA', regex: /\bmRNA\b/, spoken: 'messenger R-N-A' },
    { abbr: 'ATP', regex: /\bATP\b/, spoken: 'A-T-P (Adenosine Triphosphate)' },
    { abbr: 'ADP', regex: /\bADP\b/, spoken: 'A-D-P (Adenosine Diphosphate)' },
    { abbr: 'NADPH', regex: /\bNADPH\b/, spoken: 'N-A-D-P-H' },
    { abbr: 'SA Node', regex: /\bSA Node\b/i, spoken: 'S-A Node (Sinoatrial Node)' },
    { abbr: 'AV Node', regex: /\bAV Node\b/i, spoken: 'A-V Node (Atrioventricular Node)' }
  ];

  for (const exp of expansions) {
    if (exp.regex.test(text) && !new RegExp(`${exp.abbr}\\s*\\(`, 'i').test(text)) {
      text = text.replace(exp.regex, exp.spoken);
    }
  }

  // 8. CRITICAL: Guarantee punctuation names are NEVER spoken as words
  let cleanSpeech = text
    .replace(/\b(?:comma)\b/gi, ', ')
    .replace(/\b(?:full\s*stop|period)\b/gi, '. ')
    .replace(/\b(?:semicolon)\b/gi, '; ')
    .replace(/\s+colon\s*:\s*/gi, ': ')
    .replace(/\s+colon\s+/gi, ': ')
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/\s*\.\s*\.+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  // 9. Deduplicate repeated consecutive sentences or phrases
  const sentences = cleanSpeech
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  const seen = new Set<string>();
  const deduplicatedSentences: string[] = [];

  for (const s of sentences) {
    const key = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key.length > 8 && seen.has(key)) {
      continue;
    }
    if (key.length > 8) seen.add(key);
    deduplicatedSentences.push(s);
  }

  return deduplicatedSentences.join(' ');
}

/**
 * Automatically partitions any workflow or structured note object into
 * readable, beautiful textbook pages.
 */
export function partitionWorkflowIntoPages(workflow: any, structured?: any): NotebookPageItem[] {
  const w = workflow || structured?.universalTeachingWorkflow || {};
  const topic = w.topic || structured?.topic || 'Chapter Study';
  const subject = w.subject || structured?.subject || 'Science';
  const pages: NotebookPageItem[] = [];
  let pageCounter = 1;

  // 1. Topic Intro & Definition (Page 1)
  const introGreeting = w.stage1_topicIntroduction?.teacherGreeting || structured?.simpleIntroduction || '';
  const introOverview = w.stage1_topicIntroduction?.overview || structured?.summary || `Comprehensive study of ${topic}.`;
  const learnPoints: string[] = w.stage1_topicIntroduction?.whatStudentWillLearn || [
    `Foundational concepts and formal definitions of ${topic}`,
    `Working mechanisms, component interactions, and visual diagrams`,
    `Real-world applications, exam traps, and practice revision`
  ];
  const academicDef = w.stage2_definitionAndMeaning?.academicDefinition || structured?.clearDefinition?.academic || `${topic} is a cornerstone principle in ${subject}.`;
  const plainDef = w.stage2_definitionAndMeaning?.simpleLanguageExplanation || structured?.clearDefinition?.everyday || `${topic} explains how key components work together predictably.`;
  const anchorExample = w.stage2_definitionAndMeaning?.coreExample || structured?.clearDefinition?.example || `Observed in everyday ${subject} phenomena.`;

  const p1Markdown = `
> **Personal Teacher Introduction:**  
> ${introGreeting || introOverview}

${introOverview}

### What You Will Learn in This Chapter:
${learnPoints.map((pt: string) => `• ${pt}`).join('\n')}

**Why This Topic Matters:**  
${w.stage1_topicIntroduction?.whyItIsImportant || `Mastering ${topic} provides the essential conceptual foundation for your curriculum.`}

**Where It Is Applied:**  
${w.stage1_topicIntroduction?.whereItIsUsed || `Directly applied in modern science, industrial technology, and nature.`}

---

### Academic Textbook Definition:
> ${academicDef}

#### Everyday Language Explanation:
${plainDef}

**Concrete Anchor Example:** ${anchorExample}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-1-intro',
    title: 'Topic Introduction & Core Definition',
    headerCategory: `${subject} • Chapter Overview`,
    subheading: 'Stages 1 & 2: Introduction, Academic Definition & Practical Interpretation',
    contentMarkdown: p1Markdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `${introGreeting || introOverview}. In this chapter, you will learn the precise definition, core mechanisms, and real-world applications of ${topic}. ` +
      `Scientifically, ${academicDef}. In everyday language, ${plainDef}. For example, ${anchorExample}.`,
      topic
    ),
    diagrams: []
  });

  // 2. Terminology & Full Forms (Page 2)
  const terminology: any[] = w.stage4_importantTerminology || structured?.abbreviations || [];
  const importantDefs: any[] = w.stage3_importantDefinitions || structured?.definitions || [];
  const prereqs: string[] = w.stage3_fundamentalsAndPrerequisites?.backgroundKnowledge || structured?.prerequisites || [];

  const p2Markdown = `
### Important Terminology & Full Scientific Forms
Never use abbreviations without understanding their formal scientific meaning:

| Abbreviation / Term | Full Scientific Form | Simple Definition | Role in ${topic} |
| :--- | :--- | :--- | :--- |
${terminology.map((t) => `| **${t.term || t.abbr}** | ${t.fullForm || t.term || t.abbr} | ${t.definition || t.simpleDefinition} | ${t.importance || t.roleInTopic || 'Core Term'} |`).join('\n')}

---

${importantDefs.length > 0 ? `
### Important Definitions Within the Topic:
${importantDefs.map((d: any, i: number) => `#### 2.${i + 1} ${d.term}
- **Academic Definition:** ${d.academicDefinition || d.definition}
- **Simple Explanation:** ${d.simpleExplanation || d.definition}
- **Curriculum Role:** ${d.importance || 'Key Concept'}
`).join('\n')}
---
` : ''}

${prereqs.length > 0 ? `
### Foundational Prerequisites & Background Knowledge:
${prereqs.map((b: string) => `• ${b}`).join('\n')}
` : ''}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-2-terminology',
    title: 'Terminology, Full Forms & Prerequisites',
    headerCategory: `${subject} • Scientific Foundations`,
    subheading: 'Stages 3 & 4: Scientific Abbreviations, Terminology Glossary & Prerequisites',
    contentMarkdown: p2Markdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Before diving into the subtopics of ${topic}, let us review the essential scientific terms and full forms. ` +
      terminology.map((t: any) => `${t.term || t.abbr} stands for ${t.fullForm || t.term || t.abbr}, meaning ${t.definition || t.simpleDefinition}.`).join(' ') +
      (importantDefs.length > 0 ? ` In addition, keep in mind: ` + importantDefs.map((d: any) => `${d.term} is ${d.academicDefinition || d.definition}.`).join(' ') : ''),
      topic
    ),
    diagrams: []
  });

  // 3. Subtopics with Individual Dedicated Diagrams (Pages 3 to N)
  const subtopics: any[] = w.stage5_mainConceptsAndSubtopics || w.stage5_mainConceptsAndComponents || [];

  subtopics.forEach((sub: any, sIdx: number) => {
    const diag = sub.diagram;
    const subMarkdown = `
### ${sub.name}

- **What It Is:** ${sub.whatItIs}
- **Structure & Components:** ${sub.structureOrComponents}
- **How It Works:** ${sub.howItWorks}
- **Why It Is Important:** ${sub.whyItIsImportant}
- **Key Characteristics:** ${Array.isArray(sub.characteristics) ? sub.characteristics.join(', ') : sub.characteristics}

---

${diag ? `
#### ${diag.title}
![${diag.title}](${diag.imageUrl})
*${diag.caption}*

##### 8-Point Scientific Diagram Breakdown:
1. **What the Diagram Represents:** ${diag.point1_whatItRepresents}
2. **Labelled Components & Roles:**
${Array.isArray(diag.point2_labelledParts) ? diag.point2_labelledParts.map((p: any) => `   - **${p.label}:** ${p.description}`).join('\n') : ''}
3. **Component Functions:** ${diag.point3_componentFunctions}
4. **Inter-Component Connections:** ${diag.point4_componentRelationships}
5. **Direction of Movement / Process Flow:** ${diag.point5_directionOfMovementOrProcess}
6. **Pedagogical Learning Outcome:** ${diag.point7_learningOutcome}
7. **What to Remember for Exams:** **${diag.point8_whatToRemember}**
` : ''}
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: `page-subtopic-${sIdx + 1}`,
      title: sub.name,
      headerCategory: `${subject} • Subtopic 5.${sIdx + 1}`,
      subheading: `Stage 5: ${sub.name} & Dedicated Scientific Diagram`,
      contentMarkdown: subMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `Now let us examine ${sub.name}. ${sub.whatItIs}. ${sub.howItWorks}. ` +
        (diag ? `Referring to the diagram: ${diag.point1_whatItRepresents}. ` +
        (Array.isArray(diag.point2_labelledParts) ? diag.point2_labelledParts.map((p: any) => `${p.label} serves as ${p.description}`).join('. ') + '. ' : '') +
        `The main point to remember for exams is: ${diag.point8_whatToRemember}.` : ''),
        topic
      ),
      diagrams: diag ? [diag] : []
    });
  });

  // 4. Working Mechanism & Process Flow
  const processDiag = w.stage7_detailedMechanismsAndProcesses?.processDiagram;
  const events: any[] = w.stage7_detailedMechanismsAndProcesses?.sequenceOfEvents || w.stage7_stepByStepProcesses || [];

  if (events.length > 0 || w.stage6_detailedWorkingMechanism) {
    const pMechMarkdown = `
### ${w.stage7_detailedMechanismsAndProcesses?.processTitle || `${topic} Dynamic Process Sequence`}

- **Starting Conditions:** ${w.stage7_detailedMechanismsAndProcesses?.startingConditions || 'Initial state and boundary conditions.'}
- **Component Interactions:** ${w.stage6_detailedWorkingMechanism?.componentInteractions || 'Components interact systematically.'}
- **Final Result:** ${w.stage7_detailedMechanismsAndProcesses?.finalResult || w.stage6_detailedWorkingMechanism?.finalResult || 'Verified terminal outcome.'}

---

### Sequential Stage-by-Stage Flow:
${events.map((s: any) => `#### Stage ${s.stepNumber || 1}: ${s.title}
- **What Happens:** ${s.whatHappens}
- **Why It Happens:** ${s.whyItHappens}
- **Next Transition:** ${s.whatHappensNext}
`).join('\n')}

${processDiag ? `
---
#### ${processDiag.title}
![${processDiag.title}](${processDiag.imageUrl})
*${processDiag.caption}*

**Process Interpretation:** ${processDiag.point1_whatItRepresents}
` : ''}
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: 'page-mechanisms',
      title: 'Detailed Working Mechanism & Process Flow',
      headerCategory: `${subject} • Step-by-Step Mechanism`,
      subheading: 'Stages 6 & 7: Dynamic Working Mechanism, Sequential Events & Process Diagram',
      contentMarkdown: pMechMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `Let us trace the step-by-step working mechanism of ${topic}. ` +
        (w.stage6_detailedWorkingMechanism?.whatHappens || '') + '. ' +
        events.map((s: any) => `In stage ${s.stepNumber || 1}, ${s.title}: ${s.whatHappens} because ${s.whyItHappens}.`).join(' ') +
        ` This produces ${w.stage6_detailedWorkingMechanism?.finalResult || 'the final outcome'}.`,
        topic
      ),
      diagrams: processDiag ? [processDiag] : []
    });
  }

  // 5. Comparisons & Differences
  const comp = w.stage6_differencesAndComparisons;
  if (comp && Array.isArray(comp.rows) && comp.rows.length > 0) {
    const pCompMarkdown = `
### ${comp.title}

| Aspect of Comparison | ${comp.conceptA} | ${comp.conceptB} |
| :--- | :--- | :--- |
${comp.rows.map((r: any) => `| **${r.aspect}** | ${r.itemA} | ${r.itemB} |`).join('\n')}

---

### Cause and Effect Insights:
${Array.isArray(comp.causeAndEffectNotes) ? comp.causeAndEffectNotes.map((ce: string) => `• ${ce}`).join('\n') : ''}

${comp.summaryTakeaway ? `> **Summary Takeaway:** ${comp.summaryTakeaway}` : ''}
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: 'page-comparisons',
      title: 'Differences & Comparative Analysis',
      headerCategory: `${subject} • Concept Distinctions`,
      subheading: 'Stage 6: Comparative Matrix & Cause-and-Effect Relationships',
      contentMarkdown: pCompMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `Let us examine the key differences between ${comp.conceptA} and ${comp.conceptB}. ` +
        comp.rows.map((r: any) => `Regarding ${r.aspect}: ${comp.conceptA} features ${r.itemA}, whereas ${comp.conceptB} features ${r.itemB}.`).join(' ') +
        (comp.summaryTakeaway ? ` In summary: ${comp.summaryTakeaway}` : ''),
        topic
      ),
      diagrams: []
    });
  }

  // 6. Real-World Examples & Applications
  const apps = w.stage9_examplesAndApplications;
  if (apps) {
    const pAppsMarkdown = `
### 1. Simple Everyday Household Example:
- **Scenario:** ${apps.simpleExample?.scenario}
- **Scientific Explanation:** ${apps.simpleExample?.explanation}

---

### 2. Standard Textbook Laboratory Example:
- **Scenario:** ${apps.textbookExample?.scenario}
- **Scientific Explanation:** ${apps.textbookExample?.explanation}

---

### 3. Advanced Engineering & Medical Applications:
${Array.isArray(apps.practicalApplications) ? apps.practicalApplications.map((a: string) => `• ${a}`).join('\n') : ''}
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: 'page-applications',
      title: 'Examples & Real-World Applications',
      headerCategory: `${subject} • Practical Applications`,
      subheading: 'Stage 8: Everyday Observations, Laboratory Verifications & Real-World Science',
      contentMarkdown: pAppsMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `Connecting ${topic} to real life helps you remember it for the long term. ` +
        `In everyday life: ${apps.simpleExample?.scenario}. ${apps.simpleExample?.explanation}. ` +
        `In the laboratory: ${apps.textbookExample?.scenario}. ${apps.textbookExample?.explanation}. ` +
        (Array.isArray(apps.practicalApplications) ? `Practical applications include: ` + apps.practicalApplications.join('. ') : ''),
        topic
      ),
      diagrams: []
    });
  }

  // 7. Formulas & Solved Numericals (STEM)
  const formulas = w.stage10_formulasAndProblemSolving;
  if (formulas && formulas.hasFormulas) {
    const num = Array.isArray(formulas.workedNumericals) ? formulas.workedNumericals[0] : null;
    const pFormulaMarkdown = `
### Primary Governing Equation
$$\\mathbf{${formulas.primaryEquation}}^*$$

#### Meaning of Symbols & SI Units:
| Symbol | Quantity Name | SI Metric Unit | Physical Role |
| :--- | :--- | :--- | :--- |
${Array.isArray(formulas.variableExploded) ? formulas.variableExploded.map((v: any) => `| \`${v.symbol}\` | ${v.name} | ${v.siUnit} | ${v.role} |`).join('\n') : ''}

${num ? `
---

### Standard Solved Numerical (9-Step Board Examination Template):
**Problem Statement:** ${num.statement}

1. **Given Information:**  
${num.step1_givenInformation.map((g: any) => `   - ${g.description} (\`${g.symbol}\`): **${g.value} ${g.unit}**`).join('\n')}
2. **Required Quantity:** ${num.step2_requiredQuantity.target} (\`${num.step2_requiredQuantity.symbol}\` in \`${num.step2_requiredQuantity.expectedUnit}\`)
3. **Relevant Formula:** \`${num.step3_relevantFormula}\`
4. **Formula Selection Reason:** ${num.step4_formulaSelectionReason}
5. **Substitution:** \`${num.step5_substitution}\`
6. **Step-by-Step Calculations:**  
${num.step6_stepByStepCalculations.map((c: string) => `   ${c}`).join('\n')}
7. **Units Verification:** ${num.step7_siUnits}
8. **Final Answer:** **\`${num.step8_finalAnswer}\`**
9. **Verification Check:** ${num.step9_verificationOrInterpretation}
` : ''}
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: 'page-formulas',
      title: 'Governing Formulas & Solved Numericals',
      headerCategory: `${subject} • Quantitative Problem Solving`,
      subheading: 'Stage 9: Mathematical Derivations & 9-Step Solved Examination Numerical',
      contentMarkdown: pFormulaMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `For quantitative problem solving in ${topic}, the governing formula is ${formulas.primaryEquation}. ` +
        (num ? `Let us solve a standard problem: ${num.statement}. First, given values: ` +
        num.step1_givenInformation.map((g: any) => `${g.description} equals ${g.value} ${g.unit}`).join(', ') + '. ' +
        `Using formula ${num.step3_relevantFormula}, we calculate the final answer: ${num.step8_finalAnswer}.` : ''),
        topic
      ),
      diagrams: [],
      hasFormulas: true
    });
  }

  // 8. Facts & Misconceptions Busted
  const facts = w.stage12_importantFactsAndMisconceptions;
  if (facts) {
    const pFactsMarkdown = `
### Critical Facts to Remember:
${Array.isArray(facts.importantFacts) ? facts.importantFacts.map((f: string) => `• ${f}`).join('\n') : ''}

---

### Common Student Misconceptions Busted:
${Array.isArray(facts.frequentlyMisunderstood) ? facts.frequentlyMisunderstood.map((m: any, i: number) => `#### Misconception ${i + 1}: "${m.misconception}"
- **Scientific Truth:** ${m.scientificFact}
- **Why This Mistake Occurs:** ${m.whyMistakeOccurs}
`).join('\n') : ''}

---

### High-Yield Board Examination Traps:
${Array.isArray(facts.boardTraps) ? facts.boardTraps.map((bt: string) => `⚠️ **Trap:** ${bt}`).join('\n') : ''}
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: 'page-facts',
      title: 'Facts, Traps & Misconceptions',
      headerCategory: `${subject} • Board Exam Preparation`,
      subheading: 'Stage 10: Crucial Exceptions, High-Yield Traps & Misconceptions Busted',
      contentMarkdown: pFactsMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `Be careful of common misconceptions in ${topic}. ` +
        (Array.isArray(facts.importantFacts) ? facts.importantFacts.join('. ') + '. ' : '') +
        (Array.isArray(facts.frequentlyMisunderstood) ? facts.frequentlyMisunderstood.map((m: any) => `Many students mistakenly think that ${m.misconception}. In fact, ${m.scientificFact}.`).join(' ') : '') +
        (Array.isArray(facts.boardTraps) && facts.boardTraps[0] ? ` Remember this board trap: ${facts.boardTraps[0]}` : ''),
        topic
      ),
      diagrams: []
    });
  }

  // 9. Complete Topic Recap & Self-Test Assessment
  const recap = w.stage13_completeTopicRecap;
  const assess: any[] = w.stage14_knowledgeAssessment || structured?.quiz || [];

  const pRecapMarkdown = `
### Comprehensive Revision Takeaways:
${Array.isArray(recap?.comprehensiveSummary) ? recap.comprehensiveSummary.map((s: string) => `• ${s}`).join('\n\n') : `• Complete understanding of ${topic} across all key dimensions.`}

> **Core Chapter Takeaway:**  
> ${recap?.coreTakeaway || `Mastering ${topic} requires connecting its visual structure, mathematical laws, and real-world mechanisms.`}

---

### Rapid Mastery Checklist:
${Array.isArray(recap?.quickRevisionChecklist) ? recap.quickRevisionChecklist.map((c: string) => `- [ ] ${c}`).join('\n') : '- [ ] Can explain core principles from memory'}

---

### Self-Test Knowledge Assessment:
${assess.map((q: any, i: number) => `#### Question ${i + 1} (${q.type || 'MCQ'} • ${q.marks || 1} Mark${(q.marks || 1) > 1 ? 's' : ''})
**${q.question}**

${Array.isArray(q.options) ? q.options.map((opt: string, oIdx: number) => `${String.fromCharCode(65 + oIdx)}. ${opt}`).join('\n') : ''}

<details>
<summary><strong>View Model Answer & Detailed Explanation</strong></summary>

**Correct Answer:** ${q.correctAnswer}  
**Examiner Model Answer:**  
\`\`\`
${q.modelAnswer || q.correctAnswer}
\`\`\`
**Pedagogical Explanation:** ${q.explanation || 'Directly reflects verified curriculum mechanisms.'}
</details>
`).join('\n')}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-recap-test',
    title: 'Master Revision Recap & Self-Test Assessment',
    headerCategory: `${subject} • Chapter Mastery`,
    subheading: 'Stages 11 & 12: Comprehensive Summary, Checklist & Self-Test Assessment',
    contentMarkdown: pRecapMarkdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Congratulations on finishing this study session on ${topic}! Here is your revision summary: ` +
      (Array.isArray(recap?.comprehensiveSummary) ? recap.comprehensiveSummary.join('. ') + '. ' : '') +
      `The core takeaway is: ${recap?.coreTakeaway || `Connect the visual structure and cause-and-effect mechanism of ${topic}`}. ` +
      `Test your knowledge using the assessment questions on this page.`,
      topic
    ),
    diagrams: []
  });

  return pages;
}

/**
 * Builds an ordered audio track playlist from partitioned notebook pages.
 */
export function buildAudioPlaylistForNotebook(workflow: any, structured?: any): NotebookAudioTrack[] {
  const pages = partitionWorkflowIntoPages(workflow, structured);
  return pages.map((p) => {
    const estSec = Math.max(10, Math.min(60, Math.ceil(p.spokenAudioText.length / 16)));
    return {
      pageNumber: p.pageNumber,
      pageTitle: p.title,
      spokenText: p.spokenAudioText,
      estimatedDurationSeconds: estSec
    };
  });
}
