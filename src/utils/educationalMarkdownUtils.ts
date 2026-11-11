/**
 * Educational Markdown and Scientific Formula Parsing Utilities
 * Provides block parsing, equation formatting, and sanitized HTML generation.
 */

export interface ParsedBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'hr' | 'p' | 'blockquote' | 'callout' | 'table' | 'image' | 'svg-diagram' | 'math-block' | 'ul' | 'ol';
  text?: string;
  subtype?: string;
  title?: string;
  headers?: string[];
  rows?: string[][];
  alt?: string;
  url?: string;
  caption?: string;
  svgXml?: string;
  items?: string[];
  explanation?: {
    visualTitle?: string;
    stepByStepProcess?: string[];
    keyComponents?: Array<{ label: string; description?: string }>;
    whyItHappens?: string;
    importantTakeaway?: string;
    examTip?: string;
    realWorldApplication?: string;
    coreFormula?: string;
  };
}

export function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseMarkdownBlocks(md: string): ParsedBlock[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Display Math block $$...$$
    if (line.startsWith('$$')) {
      let mathContent = line.slice(2);
      if (mathContent.endsWith('$$') && mathContent.length > 2) {
        mathContent = mathContent.slice(0, -2);
        blocks.push({ type: 'math-block', text: mathContent.trim() });
        i++;
        continue;
      }
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        mathContent += '\n' + lines[i];
        i++;
      }
      if (i < lines.length) {
        mathContent += '\n' + lines[i].trim().replace(/\$\$$/, '');
        i++;
      }
      blocks.push({ type: 'math-block', text: mathContent.trim() });
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: line.slice(5).trim() });
      i++;
      continue;
    }

    // Callout / Blockquote
    if (line.startsWith('>')) {
      let quoteText = '';
      let isCallout = false;
      let calloutSubtype = 'note';
      let calloutTitle = '';

      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const cleaned = lines[i].trim().replace(/^>\s?/, '');
        if (!quoteText) {
          const matchNote = cleaned.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
          if (matchNote) {
            isCallout = true;
            calloutSubtype = matchNote[1].toLowerCase() === 'warning' ? 'warning' : 'note';
            calloutTitle = matchNote[1].toUpperCase();
          } else if (cleaned.includes('**Definition:') || cleaned.includes('**Academic Textbook Definition:')) {
            isCallout = true;
            calloutSubtype = 'definition';
            calloutTitle = 'Academic Definition';
          }
        }
        quoteText += (quoteText ? ' ' : '') + cleaned.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim();
        i++;
      }

      if (isCallout) {
        blocks.push({ type: 'callout', text: quoteText, subtype: calloutSubtype, title: calloutTitle });
      } else {
        blocks.push({ type: 'blockquote', text: quoteText });
      }
      continue;
    }

    // Markdown Table
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0].slice(1, -1).split('|').map((s) => s.trim());
        const rowLines = tableLines.slice(1).filter((l) => !/^\|[\s\-:|]+\|$/.test(l));
        const rows = rowLines.map((r) => r.slice(1, -1).split('|').map((c) => c.trim()));
        blocks.push({ type: 'table', headers: rawHeaders, rows });
        continue;
      }
    }

    // Embedded SVG Diagram (<svg ... </svg>)
    if (line.startsWith('<svg') || line.includes('<svg xmlns')) {
      const svgLines: string[] = [];
      while (i < lines.length) {
        svgLines.push(lines[i]);
        if (lines[i].includes('</svg>')) {
          i++;
          break;
        }
        i++;
      }
      blocks.push({
        type: 'svg-diagram',
        svgXml: svgLines.join('\n'),
        title: 'Verified Scientific Diagram'
      });
      continue;
    }

    // Standalone Markdown Image ![alt](url)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      let caption = '';
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('*') && lines[i + 1].trim().endsWith('*')) {
        caption = lines[i + 1].trim().slice(1, -1);
        i++;
      }

      // Lookahead: pair subsequent explanation or breakdown directly into side-by-side layout
      let explanation: any = undefined;
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;

      if (
        j < lines.length &&
        (lines[j].includes('Breakdown') ||
          lines[j].includes('SEE IT') ||
          lines[j].includes('What it Represents') ||
          lines[j].startsWith('#### 🔍') ||
          lines[j].startsWith('#### 1.') ||
          lines[j].startsWith('1. **What it Represents'))
      ) {
        const stepByStepProcess: string[] = [];
        const keyComponents: Array<{ label: string; description?: string }> = [];
        let whyItHappens = '';
        let importantTakeaway = '';
        let examTip = '';
        let realWorldApplication = '';
        let coreFormula = '';

        while (j < lines.length) {
          const l = lines[j].trim();
          if (!l) {
            j++;
            continue;
          }
          if (l === '---' || l.startsWith('## ') || l.startsWith('# ') || l.startsWith('### Figure') || (l.startsWith('### Concept') && !l.includes(imgMatch[1]))) {
            break;
          }

          if (l.includes('What it Represents:') || l.includes('SEE IT')) {
            const val = l.replace(/^.*(What it Represents:|SEE IT.*?\))\s*/i, '').trim();
            if (val) stepByStepProcess.push(`Orientation: ${val}`);
          } else if (l.startsWith('- **') || l.startsWith('* **') || l.includes('Component Functions:')) {
            const compMatch = l.match(/[-*]\s*\*\*([^*:]+):?\*\*[:]?\s*(.*)/);
            if (compMatch) {
              keyComponents.push({ label: compMatch[1].trim(), description: compMatch[2].trim() });
            }
          } else if (l.includes('Why This Happens:') || l.includes('Why It Happens:')) {
            whyItHappens = l.replace(/^.*(Why This Happens:|Why It Happens:)\s*/i, '').trim();
          } else if (l.includes('Crucial Fact to Remember:') || l.includes('What to Remember for Exams:')) {
            importantTakeaway = l.replace(/^.*(Crucial Fact to Remember:|What to Remember for Exams:)\s*/i, '').replace(/\*\*/g, '').trim();
          } else if (l.includes('Exam Marking Tip:') || l.includes('Board Exam Marking Tip:')) {
            examTip = l.replace(/^.*(Exam Marking Tip:|Board Exam Marking Tip:)\s*/i, '').trim();
          } else if (l.includes('Real-World Application:')) {
            realWorldApplication = l.replace(/^.*Real-World Application:\s*/i, '').trim();
          } else if (l.includes('Governing Formula') || l.includes('Governing Equation')) {
            const fMatch = l.match(/`([^`]+)`/);
            if (fMatch) coreFormula = fMatch[1];
          } else if (/^\d+\.\s+/.test(l)) {
            stepByStepProcess.push(l.replace(/^\d+\.\s+/, '').trim());
          } else if (!l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*') && l.length > 5) {
            stepByStepProcess.push(l);
          }
          j++;
        }

        explanation = {
          visualTitle: imgMatch[1],
          stepByStepProcess,
          keyComponents,
          whyItHappens,
          importantTakeaway,
          examTip,
          realWorldApplication,
          coreFormula
        };
        i = j - 1;
      }

      blocks.push({
        type: 'image',
        alt: imgMatch[1],
        url: imgMatch[2],
        caption,
        explanation
      });
      i++;
      continue;
    }

    // Bullet List
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Numbered List
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Standard Paragraph
    let paragraphText = line;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('$$') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(\*{3,}|-{3,}|_{3,})$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('![')
    ) {
      paragraphText += ' ' + lines[i].trim();
      i++;
    }

    blocks.push({ type: 'p', text: paragraphText });
  }

  return blocks;
}

export function formatChemicalText(text: string): string {
  // Replace arrows
  let res = text.replace(/->|-->|\\rightarrow/g, ' → ');
  // Replace chemical numbers with subscripts
  res = res.replace(/\b([A-Z][a-z]?|\))(\d+)/g, '$1<sub>$2</sub>');
  return res;
}

export function formatMathString(math: string): string {
  let cleaned = math
    .replace(/\\cdot/g, ' · ')
    .replace(/\\times/g, ' × ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\leq/g, ' ≤ ')
    .replace(/\\geq/g, ' ≥ ')
    .replace(/\\infty/g, ' ∞ ')
    .replace(/\\rightarrow/g, ' → ')
    .replace(/\\Delta/g, ' Δ ')
    .replace(/\\theta/g, ' θ ')
    .replace(/\\pi/g, ' π ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\^2\b/g, '²')
    .replace(/\^3\b/g, '³')
    .replace(/\^([0-9]+)/g, '^$1');

  return formatChemicalText(cleaned);
}

/**
 * Headless HTML converter for testing, indexing, and SSR
 */
export function renderEducationalMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Clean loose raw SVG and scripts from prose so raw code strings never pollute document
  const sanitized = markdown
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  const blocks = parseMarkdownBlocks(sanitized);
  const htmlParts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'h1':
        htmlParts.push(`<h1>${formatChemicalText(block.text || '')}</h1>`);
        break;
      case 'h2':
        htmlParts.push(`<h2>${formatChemicalText(block.text || '')}</h2>`);
        break;
      case 'h3':
        htmlParts.push(`<h3>${formatChemicalText(block.text || '')}</h3>`);
        break;
      case 'h4':
        htmlParts.push(`<h4>${formatChemicalText(block.text || '')}</h4>`);
        break;
      case 'hr':
        htmlParts.push('<hr />');
        break;
      case 'callout':
        htmlParts.push(`<div class="callout callout-${block.subtype}"><strong>${block.title}</strong>: ${formatChemicalText(block.text || '')}</div>`);
        break;
      case 'blockquote':
        htmlParts.push(`<blockquote>${formatChemicalText(block.text || '')}</blockquote>`);
        break;
      case 'table': {
        const ths = (block.headers || []).map((h) => `<th>${formatChemicalText(h)}</th>`).join('');
        const trs = (block.rows || [])
          .map((row) => `<tr>${row.map((c) => `<td>${formatChemicalText(c)}</td>`).join('')}</tr>`)
          .join('');
        htmlParts.push(`<div class="table-responsive-wrapper"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`);
        break;
      }
      case 'image':
        htmlParts.push(
          `<figure class="educational-diagram-card"><img src="${block.url}" alt="${block.alt || 'Educational diagram'}" /><figcaption><strong>${block.alt}</strong>: ${block.caption || ''} <span class="badge">Verified Curriculum Asset</span></figcaption></figure>`
        );
        break;
      case 'math-block':
        htmlParts.push(`<div class="math-equation-block">${formatMathString(block.text || '')}</div>`);
        break;
      case 'ul':
        htmlParts.push(`<ul>${(block.items || []).map((i) => `<li>${formatChemicalText(i)}</li>`).join('')}</ul>`);
        break;
      case 'ol':
        htmlParts.push(`<ol>${(block.items || []).map((i) => `<li>${formatChemicalText(i)}</li>`).join('')}</ol>`);
        break;
      default:
        htmlParts.push(`<p>${formatChemicalText(block.text || '')}</p>`);
        break;
    }
  }

  return htmlParts.join('\n');
}
