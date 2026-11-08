/**
 * STUDYAI Digital Notebook Pagination & Audio Narration Engine
 * 
 * Provides:
 * 1. Automatic partitioning of Universal Teaching Workflow content into professionally formatted textbook pages
 * 2. Strict educational text cleaning for natural audio speech (no markdown, no HTML, no LaTeX, no punctuation names, no repetition)
 * 3. Structured page-by-page audio playlists with synchronized reading indicators
 */

import {
  type UniversalTeachingWorkflow,
  type DiagramVisualExplanation8Point,
  type SubtopicConceptItem
} from './universalTeachingWorkflowEngine.ts';
import {
  prepareTeacherNarrationScript
} from './tutorRebuildEngine.ts';

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

  // 7. Expand abbreviations using the teacher narration preprocessor
  const prepped = prepareTeacherNarrationScript(text, topic);
  let cleanSpeech = prepped.spokenScript;

  // 8. CRITICAL: Guarantee punctuation names are NEVER spoken as words
  // If text had "full stop", "comma", "period", "colon", "semicolon" as literal words, normalize them into natural punctuation marks
  cleanSpeech = cleanSpeech
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
      continue; // Skip duplicate sentence
    }
    if (key.length > 8) seen.add(key);
    deduplicatedSentences.push(s);
  }

  return deduplicatedSentences.join(' ');
}

/**
 * Automatically partitions a UniversalTeachingWorkflow into a structured sequence of readable,
 * beautifully formatted textbook pages.
 */
export function partitionWorkflowIntoPages(workflow: UniversalTeachingWorkflow): NotebookPageItem[] {
  const w = workflow;
  const pages: NotebookPageItem[] = [];
  const topic = w.topic;
  let pageCounter = 1;

  // =========================================================================
  // PAGE 1: Topic Introduction, Teacher Welcome & Core Definition
  // =========================================================================
  const p1Markdown = `
> **Personal Teacher Introduction:**  
> ${w.stage1_topicIntroduction.teacherGreeting || w.stage1_topicIntroduction.overview}

${w.stage1_topicIntroduction.overview}

### What You Will Learn in This Chapter:
${w.stage1_topicIntroduction.whatStudentWillLearn.map((pt) => `• ${pt}`).join('\n')}

**Why This Topic Matters:**  
${w.stage1_topicIntroduction.whyItIsImportant}

**Where It Is Applied in Real Life & Science:**  
${w.stage1_topicIntroduction.whereItIsUsed}

---

### Academic Textbook Definition:
> ${w.stage2_definitionAndMeaning.academicDefinition}

#### Everyday Language Explanation:
${w.stage2_definitionAndMeaning.simpleLanguageExplanation}

#### Meaning of Important Words:
${w.stage2_definitionAndMeaning.keyWordMeanings.map((k) => `• **${k.word}:** ${k.meaning}`).join('\n')}

**Concrete Anchor Example:** ${w.stage2_definitionAndMeaning.coreExample}

**Practical Interpretation:** ${w.stage2_definitionAndMeaning.practicalInterpretation}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-intro-definition',
    title: 'Topic Introduction & Core Definition',
    headerCategory: `${w.subject} • Chapter Overview`,
    subheading: 'Stages 1 & 2: Introduction, Academic Definition & Practical Interpretation',
    contentMarkdown: p1Markdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `${w.stage1_topicIntroduction.teacherGreeting || w.stage1_topicIntroduction.overview}. ` +
      `In this chapter, you will learn the precise definition, core mechanisms, real-world applications, and high-yield exam points for ${topic}. ` +
      `Scientifically, ${w.stage2_definitionAndMeaning.academicDefinition}. ` +
      `In simple everyday language, ${w.stage2_definitionAndMeaning.simpleLanguageExplanation}. ` +
      `For example, ${w.stage2_definitionAndMeaning.coreExample}.`,
      topic
    ),
    diagrams: []
  });

  // =========================================================================
  // PAGE 2: Terminology, Full Forms, Prerequisites & Key Definitions
  // =========================================================================
  const p2Markdown = `
### Important Terminology & Full Scientific Forms
Never use abbreviations without understanding their formal scientific meaning:

| Abbreviation / Term | Full Scientific Form | Simple Definition | Role in ${topic} |
| :--- | :--- | :--- | :--- |
${w.stage4_importantTerminology.map((t) => `| **${t.term}** | ${t.fullForm || t.term} | ${t.definition} | ${t.importance} |`).join('\n')}

---

### Important Definitions Within the Topic:
${w.stage3_importantDefinitions.map((d, i) => `#### 2.${i + 1} ${d.term}
- **Academic Definition:** ${d.academicDefinition}
- **Simple Explanation:** ${d.simpleExplanation}
- **Example:** ${d.example}
- **Curriculum Role:** ${d.importance}
`).join('\n')}

---

### Foundational Prerequisites & Background Knowledge:
${w.stage3_fundamentalsAndPrerequisites.backgroundKnowledge.map((b) => `1. ${b}`).join('\n')}

**Basic Governing Principles:**  
${w.stage3_fundamentalsAndPrerequisites.basicPrinciples.map((p) => `• ${p}`).join('\n')}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-terminology-prereqs',
    title: 'Terminology, Full Forms & Prerequisites',
    headerCategory: `${w.subject} • Scientific Foundations`,
    subheading: 'Stages 3 & 4: Scientific Abbreviations, Terminology Glossary & Prerequisites',
    contentMarkdown: p2Markdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Before exploring the subtopics of ${topic}, let us review the essential scientific terms and full forms. ` +
      w.stage4_importantTerminology.map((t) => `${t.term} stands for ${t.fullForm || t.term}, which means ${t.definition}.`).join(' ') +
      ` Additionally, keep in mind these key definitions: ` +
      w.stage3_importantDefinitions.map((d) => `${d.term} is defined as ${d.academicDefinition}.`).join(' '),
      topic
    ),
    diagrams: []
  });

  // =========================================================================
  // PAGES 3 to N: Systematic Subtopics (EACH with its own Dedicated Diagram!)
  // =========================================================================
  const subtopics = w.stage5_mainConceptsAndSubtopics || w.stage5_mainConceptsAndComponents || [];

  subtopics.forEach((sub: SubtopicConceptItem, sIdx: number) => {
    const diag = sub.diagram;
    const subMarkdown = `
### ${sub.name}

- **What It Is:** ${sub.whatItIs}
- **Structure & Components:** ${sub.structureOrComponents}
- **How It Works:** ${sub.howItWorks}
- **Why It Is Important:** ${sub.whyItIsImportant}
- **Key Characteristics:** ${sub.characteristics.join(', ')}
- **Connection to Chapter:** ${sub.connectionToMainTopic}

---

#### ${diag.title}
![${diag.title}](${diag.imageUrl})
*${diag.caption}*

##### 8-Point Scientific Diagram Breakdown:
1. **What the Diagram Represents:** ${diag.point1_whatItRepresents}
2. **Labelled Components & Roles:**
${diag.point2_labelledParts.map((p) => `   - **${p.label}:** ${p.description}`).join('\n')}
3. **Component Functions:** ${diag.point3_componentFunctions}
4. **Inter-Component Connections:** ${diag.point4_componentRelationships}
5. **Direction of Movement / Process Flow:** ${diag.point5_directionOfMovementOrProcess}
6. **Step-by-Step Interpretation:**
${diag.point6_stepByStepInterpretation.map((st) => `   ${st}`).join('\n')}
7. **Pedagogical Learning Outcome:** ${diag.point7_learningOutcome}
8. **What to Remember for Exams:** **${diag.point8_whatToRemember}**
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: `page-subtopic-${sIdx + 1}`,
      title: sub.name,
      headerCategory: `${w.subject} • Subtopic 5.${sIdx + 1}`,
      subheading: `Stage 5: ${sub.name} & Dedicated Scientific Diagram`,
      contentMarkdown: subMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `Now let us examine ${sub.name}. ${sub.whatItIs} ${sub.howItWorks} ` +
        `Referring to the diagram: ${diag.point1_whatItRepresents} ` +
        diag.point2_labelledParts.map((p) => `${p.label} serves as ${p.description}`).join('. ') + '. ' +
        `Notice the flow: ${diag.point5_directionOfMovementOrProcess} ` +
        `The primary point to remember for exams is that ${diag.point8_whatToRemember}.`,
        topic
      ),
      diagrams: [diag]
    });
  });

  // =========================================================================
  // SUBSEQUENT PAGE: Detailed Working Mechanism & Process Flow
  // =========================================================================
  const processDiag = w.stage7_detailedMechanismsAndProcesses?.processDiagram || w.stage8_diagramsAndVisualExplanations[w.stage8_diagramsAndVisualExplanations.length - 1];
  const pMechanismMarkdown = `
### ${w.stage7_detailedMechanismsAndProcesses?.processTitle || `${topic} Step-by-Step Process Flow`}

- **Starting Conditions:** ${w.stage7_detailedMechanismsAndProcesses?.startingConditions || 'Initial state and boundary conditions.'}
- **Participating Components:** ${w.stage7_detailedMechanismsAndProcesses?.componentsInvolved?.join(', ') || w.stage6_detailedWorkingMechanism.participatingComponents.join(', ')}
- **Component Interactions:** ${w.stage6_detailedWorkingMechanism.componentInteractions}
- **Final Result:** ${w.stage7_detailedMechanismsAndProcesses?.finalResult || w.stage6_detailedWorkingMechanism.finalResult}

---

### Ordered Sequence of Events:
${(w.stage7_detailedMechanismsAndProcesses?.sequenceOfEvents || w.stage7_stepByStepProcesses).map((s) => `#### Stage ${s.stepNumber}: ${s.title}
- **What Happens:** ${s.whatHappens}
- **Where It Happens:** ${s.whereItHappens}
- **Why It Happens:** ${s.whyItHappens}
- **Next Transition:** ${s.whatHappensNext}
`).join('\n')}

${processDiag ? `
---

#### ${processDiag.title}
![${processDiag.title}](${processDiag.imageUrl})
*${processDiag.caption}*

**Process Interpretation:**  
${processDiag.point1_whatItRepresents}
` : ''}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-mechanisms-processes',
    title: 'Detailed Working Mechanism & Process Flow',
    headerCategory: `${w.subject} • Step-by-Step Mechanism`,
    subheading: 'Stages 6 & 7: Dynamic Working Mechanism, Sequential Events & Process Diagram',
    contentMarkdown: pMechanismMarkdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Let us now trace the step-by-step working mechanism of ${topic}. ` +
      `Under standard conditions, ${w.stage6_detailedWorkingMechanism.whatHappens}. ` +
      (w.stage7_detailedMechanismsAndProcesses?.sequenceOfEvents || w.stage7_stepByStepProcesses).map((s) => `In stage ${s.stepNumber}, ${s.title}: ${s.whatHappens} because ${s.whyItHappens}.`).join(' ') +
      ` Finally, this produces ${w.stage6_detailedWorkingMechanism.finalResult}.`,
      topic
    ),
    diagrams: processDiag ? [processDiag] : []
  });

  // =========================================================================
  // SUBSEQUENT PAGE: Differences & Comparisons Matrix
  // =========================================================================
  const pCompMarkdown = `
### ${w.stage6_differencesAndComparisons.title}

| Aspect of Comparison | ${w.stage6_differencesAndComparisons.conceptA} | ${w.stage6_differencesAndComparisons.conceptB} |
| :--- | :--- | :--- |
${w.stage6_differencesAndComparisons.rows.map((r) => `| **${r.aspect}** | ${r.itemA} | ${r.itemB} |`).join('\n')}

---

### Cause and Effect Insights:
${w.stage6_differencesAndComparisons.causeAndEffectNotes.map((ce) => `• ${ce}`).join('\n')}

${w.stage6_differencesAndComparisons.summaryTakeaway ? `> **Summary Takeaway:** ${w.stage6_differencesAndComparisons.summaryTakeaway}` : ''}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-comparisons',
    title: 'Differences & Comparative Analysis',
    headerCategory: `${w.subject} • Concept Distinctions`,
    subheading: 'Stage 6: Comparative Matrix & Cause-and-Effect Relationships',
    contentMarkdown: pCompMarkdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Students frequently confuse related concepts in ${topic}. Let us examine the key differences between ${w.stage6_differencesAndComparisons.conceptA} and ${w.stage6_differencesAndComparisons.conceptB}. ` +
      w.stage6_differencesAndComparisons.rows.map((r) => `Regarding ${r.aspect}: ${w.stage6_differencesAndComparisons.conceptA} is characterized by ${r.itemA}, whereas ${w.stage6_differencesAndComparisons.conceptB} features ${r.itemB}.`).join(' ') +
      ` As a summary takeaway: ${w.stage6_differencesAndComparisons.summaryTakeaway || 'Remember these distinctions carefully for exam comparisons.'}`,
      topic
    ),
    diagrams: []
  });

  // =========================================================================
  // SUBSEQUENT PAGE: Real-World Examples & Applications
  // =========================================================================
  const pExMarkdown = `
### 1. Simple Everyday Household Example:
- **Scenario:** ${w.stage9_examplesAndApplications.simpleExample.scenario}
- **Scientific Explanation:** ${w.stage9_examplesAndApplications.simpleExample.explanation}

---

### 2. Standard Textbook Laboratory Example:
- **Scenario:** ${w.stage9_examplesAndApplications.textbookExample.scenario}
- **Scientific Explanation:** ${w.stage9_examplesAndApplications.textbookExample.explanation}

---

### 3. Advanced Engineering & Medical Applications:
${w.stage9_examplesAndApplications.practicalApplications.map((app) => `• ${app}`).join('\n')}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-examples-applications',
    title: 'Examples & Real-World Applications',
    headerCategory: `${w.subject} • Practical Applications`,
    subheading: 'Stage 8: Everyday Observations, Laboratory Verifications & Real-World Science',
    contentMarkdown: pExMarkdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Connecting ${topic} to reality makes it much easier to remember. ` +
      `First, in everyday life: ${w.stage9_examplesAndApplications.simpleExample.scenario}. ${w.stage9_examplesAndApplications.simpleExample.explanation}. ` +
      `Second, in the laboratory: ${w.stage9_examplesAndApplications.textbookExample.scenario}. ${w.stage9_examplesAndApplications.textbookExample.explanation}. ` +
      `Finally, in modern engineering and healthcare: ` + w.stage9_examplesAndApplications.practicalApplications.join('. ') + '.',
      topic
    ),
    diagrams: []
  });

  // =========================================================================
  // SUBSEQUENT PAGE: Formulas, Derivations & Solved Numericals (STEM)
  // =========================================================================
  if (w.stage10_formulasAndProblemSolving.hasFormulas) {
    const num = w.stage10_formulasAndProblemSolving.workedNumericals[0];
    const pFormulasMarkdown = `
### Primary Governing Equation
$$\\mathbf{${w.stage10_formulasAndProblemSolving.primaryEquation}}^*$$

#### Meaning of Symbols & SI Metric Units:
| Symbol | Quantity Name | SI Metric Unit | Physical Role |
| :--- | :--- | :--- | :--- |
${w.stage10_formulasAndProblemSolving.variableExploded.map((v) => `| \`${v.symbol}\` | ${v.name} | ${v.siUnit} | ${v.role} |`).join('\n')}

---

### Mathematical Derivation:
${w.stage10_formulasAndProblemSolving.derivation?.map((d) => `${d}`).join('\n')}

---

### Standard Solved Numerical (9-Step Board Examination Template):
**Problem Statement:** ${num.statement}

1. **Given Information:**  
${num.step1_givenInformation.map((g) => `   - ${g.description} (\`${g.symbol}\`): **${g.value} ${g.unit}**`).join('\n')}
2. **Required Quantity:** ${num.step2_requiredQuantity.target} (\`${num.step2_requiredQuantity.symbol}\` in \`${num.step2_requiredQuantity.expectedUnit}\`)
3. **Relevant Formula:** \`${num.step3_relevantFormula}\`
4. **Formula Selection Reason:** ${num.step4_formulaSelectionReason}
5. **Substitution:** \`${num.step5_substitution}\`
6. **Step-by-Step Calculations:**  
${num.step6_stepByStepCalculations.map((c) => `   ${c}`).join('\n')}
7. **Units Verification:** ${num.step7_siUnits}
8. **Final Answer:** **\`${num.step8_finalAnswer}\`**
9. **Verification Check:** ${num.step9_verificationOrInterpretation}
`.trim();

    pages.push({
      pageNumber: pageCounter++,
      pageId: 'page-formulas-numericals',
      title: 'Governing Formulas & Solved Numericals',
      headerCategory: `${w.subject} • Quantitative Problem Solving`,
      subheading: 'Stage 9: Mathematical Derivations & 9-Step Solved Examination Numerical',
      contentMarkdown: pFormulasMarkdown,
      spokenAudioText: cleanNotebookTextForAudioSpeech(
        `For quantitative mastery in ${topic}, the primary governing relationship is ${w.stage10_formulasAndProblemSolving.primaryEquation}. ` +
        `Let us solve a standard board problem: ${num.statement}. ` +
        `First, identify the given data: ` + num.step1_givenInformation.map((g) => `${g.description} equals ${g.value} ${g.unit}`).join(', ') + '. ' +
        `We need to calculate ${num.step2_requiredQuantity.target}. Using the formula ${num.step3_relevantFormula}, we substitute the values to find ${num.step8_finalAnswer}.`,
        topic
      ),
      diagrams: [],
      hasFormulas: true
    });
  }

  // =========================================================================
  // SUBSEQUENT PAGE: Important Facts, Exceptions & Misconceptions Busted
  // =========================================================================
  const pFactsMarkdown = `
### Critical Facts to Remember:
${w.stage12_importantFactsAndMisconceptions.importantFacts.map((f) => `• ${f}`).join('\n')}

---

### Common Student Misconceptions Busted:
${w.stage12_importantFactsAndMisconceptions.frequentlyMisunderstood.map((m, i) => `#### Misconception ${i + 1}: "${m.misconception}"
- **Scientific Truth:** ${m.scientificFact}
- **Why This Mistake Occurs:** ${m.whyMistakeOccurs}
`).join('\n')}

---

### High-Yield Board Examination Traps:
${w.stage12_importantFactsAndMisconceptions.boardTraps.map((bt) => `⚠️ **Trap:** ${bt}`).join('\n')}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-facts-misconceptions',
    title: 'Facts, Traps & Misconceptions',
    headerCategory: `${w.subject} • Board Exam Preparation`,
    subheading: 'Stage 10: Crucial Exceptions, High-Yield Traps & Misconceptions Busted',
    contentMarkdown: pFactsMarkdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Be on guard against common examination pitfalls in ${topic}. ` +
      `Remember: ` + w.stage12_importantFactsAndMisconceptions.importantFacts.join('. ') + '. ' +
      `A frequent student misconception is: ` + w.stage12_importantFactsAndMisconceptions.frequentlyMisunderstood.map((m) => `${m.misconception}. In scientific fact, ${m.scientificFact}.`).join(' ') +
      ` Watch out for this board trap: ` + w.stage12_importantFactsAndMisconceptions.boardTraps[0],
      topic
    ),
    diagrams: []
  });

  // =========================================================================
  // FINAL PAGE: Complete Topic Recap & Self-Test Knowledge Check
  // =========================================================================
  const pRecapMarkdown = `
### Comprehensive Revision Takeaways:
${w.stage13_completeTopicRecap.comprehensiveSummary.map((s) => `${s}`).join('\n\n')}

> **Core Chapter Takeaway:**  
> ${w.stage13_completeTopicRecap.coreTakeaway}

---

### Rapid Mastery Checklist:
${w.stage13_completeTopicRecap.quickRevisionChecklist.map((c) => `- [ ] ${c}`).join('\n')}

---

### Self-Test Knowledge Assessment:
${w.stage14_knowledgeAssessment.map((q, i) => `#### Question ${i + 1} (${q.type} • ${q.marks} Mark${q.marks > 1 ? 's' : ''})
**${q.question}**

${q.options ? q.options.map((opt, oIdx) => `${String.fromCharCode(65 + oIdx)}. ${opt}`).join('\n') : ''}

<details>
<summary><strong>View Model Answer & Detailed Explanation</strong></summary>

**Correct Answer:** ${q.correctAnswer}  
**Examiner Model Answer:**  
\`\`\`
${q.modelAnswer}
\`\`\`
**Pedagogical Explanation:** ${q.explanation}
</details>
`).join('\n')}
`.trim();

  pages.push({
    pageNumber: pageCounter++,
    pageId: 'page-recap-assessment',
    title: 'Master Revision Recap & Self-Test Assessment',
    headerCategory: `${w.subject} • Chapter Mastery`,
    subheading: 'Stages 11 & 12: Comprehensive Summary, Checklist & Self-Test Assessment',
    contentMarkdown: pRecapMarkdown,
    spokenAudioText: cleanNotebookTextForAudioSpeech(
      `Congratulations on completing this study session on ${topic}! Here is your complete recap: ` +
      w.stage13_completeTopicRecap.comprehensiveSummary.join('. ') + '. ' +
      `The core takeaway to remember is: ${w.stage13_completeTopicRecap.coreTakeaway}. ` +
      `Test your mastery with the practice questions provided on this page.`,
      topic
    ),
    diagrams: []
  });

  return pages;
}

/**
 * Builds an ordered audio track playlist from partitioned notebook pages,
 * ensuring each page has clean, non-repeating spoken audio text.
 */
export function buildAudioPlaylistForNotebook(workflow: UniversalTeachingWorkflow): NotebookAudioTrack[] {
  const pages = partitionWorkflowIntoPages(workflow);
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
