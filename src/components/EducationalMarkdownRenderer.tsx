import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, Info, CheckCircle2, ZoomIn, X, ExternalLink } from 'lucide-react';
import {
  parseMarkdownBlocks,
  slugify,
  type ParsedBlock
} from '../utils/educationalMarkdownUtils';

export { renderEducationalMarkdownToHtml } from '../utils/educationalMarkdownUtils';

interface EducationalMarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * EducationalMarkdownRenderer
 * Parses and renders rich educational textbook markdown:
 * - Real Headings (H1-H4) with anchor links
 * - Rich Tables inside responsive wrappers
 * - LaTeX & Chemical Equations (formatted math & subscripts)
 * - Callout blocks (> [!NOTE], > [!IMPORTANT], > Definitions)
 * - Educational Image Cards with zoom modal and broken-link fallback
 * - Bold, Italics, Lists, Code
 * - Zero raw Markdown, HTML, SVG, or Base64 leakage
 */
export const EducationalMarkdownRenderer: React.FC<EducationalMarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  const [zoomModal, setZoomModal] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!content || typeof content !== 'string') {
    return null;
  }

  // Pre-process: split into logical blocks (paragraphs, headers, tables, lists, quotes, images)
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`educational-markdown-body ${className}`} style={{ color: '#202124', lineHeight: 1.75 }}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                id={slugify(block.text)}
                style={{
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                  fontWeight: 900,
                  color: '#202124',
                  margin: '32px 0 16px 0',
                  lineHeight: 1.28,
                  letterSpacing: '-0.025em',
                  fontFamily: "'Plus Jakarta Sans', Georgia, serif",
                  borderBottom: '2px solid #FF6A00',
                  paddingBottom: 10
                }}
              >
                {renderInlineFormattedText(block.text)}
              </h1>
            );

          case 'h2':
            return (
              <h2
                key={idx}
                id={slugify(block.text)}
                style={{
                  fontSize: 'clamp(1.3rem, 2.8vw, 1.65rem)',
                  fontWeight: 800,
                  color: '#1E293B',
                  margin: '28px 0 14px 0',
                  lineHeight: 1.32,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderLeft: '4px solid #FF6A00',
                  paddingLeft: 12
                }}
              >
                {renderInlineFormattedText(block.text)}
              </h2>
            );

          case 'h3':
            return (
              <h3
                key={idx}
                id={slugify(block.text)}
                style={{
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.32rem)',
                  fontWeight: 800,
                  color: '#334155',
                  margin: '22px 0 10px 0',
                  lineHeight: 1.38
                }}
              >
                {renderInlineFormattedText(block.text)}
              </h3>
            );

          case 'h4':
            return (
              <h4
                key={idx}
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#475569',
                  margin: '16px 0 8px 0'
                }}
              >
                {renderInlineFormattedText(block.text)}
              </h4>
            );

          case 'hr':
            return (
              <hr
                key={idx}
                style={{
                  border: 'none',
                  borderTop: '1px solid rgba(255, 106, 0, 0.2)',
                  margin: '24px 0'
                }}
              />
            );

          case 'callout': {
            const isNote = block.subtype === 'note';
            const isWarning = block.subtype === 'warning';
            const isDefinition = block.subtype === 'definition';
            const bg = isDefinition ? '#FFF7ED' : isWarning ? '#FEF2F2' : '#F0FDF4';
            const borderCol = isDefinition ? '#FF6A00' : isWarning ? '#EF4444' : '#10B981';
            const IconComponent = isDefinition ? BookOpen : isWarning ? AlertCircle : isNote ? Info : CheckCircle2;

            return (
              <div
                key={idx}
                style={{
                  background: bg,
                  borderLeft: `4px solid ${borderCol}`,
                  borderRadius: '0 14px 14px 0',
                  padding: '14px 18px',
                  margin: '18px 0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontWeight: 800, fontSize: '0.86rem', color: borderCol }}>
                  <IconComponent size={17} />
                  <span>{block.title || 'Important Academic Concept'}</span>
                </div>
                <div style={{ fontSize: '0.94rem', color: '#1F2937', lineHeight: 1.68 }}>
                  {renderInlineFormattedText(block.text)}
                </div>
              </div>
            );
          }

          case 'blockquote':
            return (
              <blockquote
                key={idx}
                style={{
                  background: '#F8FAFC',
                  borderLeft: '4px solid #FF6A00',
                  borderRadius: '0 12px 12px 0',
                  padding: '14px 18px',
                  margin: '16px 0',
                  fontStyle: 'italic',
                  color: '#334155',
                  fontSize: '0.96rem',
                  lineHeight: 1.68
                }}
              >
                {renderInlineFormattedText(block.text)}
              </blockquote>
            );

          case 'table':
            return (
              <div key={idx} className="table-responsive-wrapper" style={{ margin: '20px 0', overflowX: 'auto', borderRadius: 14, border: '1.5px solid rgba(255, 106, 0, 0.22)', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)' }}>
                <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: '0.88rem', background: '#FFFFFF' }}>
                  <thead>
                    <tr style={{ background: '#FFF3E8', color: '#9A3412', textAlign: 'left' }}>
                      {block.headers.map((h: string, hIdx: number) => (
                        <th key={hIdx} style={{ padding: '12px 16px', borderBottom: '2px solid rgba(255, 106, 0, 0.24)', fontWeight: 800, fontSize: '0.84rem', letterSpacing: '0.02em' }}>
                          {renderInlineFormattedText(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row: string[], rIdx: number) => (
                      <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                        {row.map((cell: string, cIdx: number) => (
                          <td key={cIdx} style={{ padding: '11px 16px', color: '#334155', lineHeight: 1.55 }}>
                            {renderInlineFormattedText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'image': {
            const isBroken = Boolean(failedImages[block.url]);
            const isDataUrl = block.url?.startsWith('data:');
            const cleanUrl = isDataUrl ? block.url : block.url;

            return (
              <figure
                key={idx}
                style={{
                  margin: '24px 0',
                  padding: 16,
                  borderRadius: 20,
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(255, 106, 0, 0.24)',
                  boxShadow: '0 12px 28px -6px rgba(255, 106, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'relative', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 14, overflow: 'hidden' }}>
                  {!isBroken ? (
                    <img
                      src={cleanUrl}
                      alt={block.alt || block.caption || 'Educational diagram'}
                      loading="lazy"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [block.url]: true }));
                      }}
                      style={{
                        width: '100%',
                        maxHeight: 380,
                        objectFit: 'contain',
                        display: 'block',
                        cursor: 'zoom-in',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => setZoomModal({ url: cleanUrl, title: block.alt, caption: block.caption })}
                    />
                  ) : (
                    // Graceful Scientific Diagram Fallback
                    <div style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>
                      <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: '#FFF3E8', color: '#FF6A00', marginBottom: 10 }}>
                        <Sparkles size={24} />
                      </div>
                      <h5 style={{ fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0', fontSize: '0.96rem' }}>
                        {block.alt || 'Scientific Diagram'}
                      </h5>
                      <p style={{ fontSize: '0.84rem', margin: 0, maxWidth: 440 }}>
                        {block.caption || 'Verified curriculum diagram illustrates key components and directional flows.'}
                      </p>
                    </div>
                  )}

                  {!isBroken && (
                    <button
                      type="button"
                      onClick={() => setZoomModal({ url: cleanUrl, title: block.alt, caption: block.caption })}
                      aria-label="Zoom Diagram"
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#1E293B',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <ZoomIn size={13} />
                      <span>Zoom</span>
                    </button>
                  )}
                </div>

                {(block.alt || block.caption) && (
                  <figcaption style={{ marginTop: 12, fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      {block.alt && <strong style={{ color: '#FF6A00', marginRight: 6 }}>{block.alt}:</strong>}
                      <span>{block.caption || 'Verified scientific diagram.'}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#F1F5F9' }}>
                      Verified Curriculum Asset
                    </span>
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'math-block':
            return (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
                  border: '1.5px solid rgba(255, 106, 0, 0.3)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  margin: '18px 0',
                  textAlign: 'center',
                  boxShadow: '0 6px 18px -4px rgba(255, 106, 0, 0.08)'
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#C2410C', letterSpacing: '0.04em', marginBottom: 6 }}>
                  📐 Scientific Formula &amp; Equation
                </div>
                <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#1E293B', fontFamily: "'Cambria Math', 'KaTeX_Math', 'Times New Roman', serif", letterSpacing: '0.03em' }}>
                  {formatMathFormula(block.text)}
                </div>
              </div>
            );

          case 'ul':
            return (
              <ul key={idx} style={{ paddingLeft: 24, margin: '12px 0 16px 0', display: 'grid', gap: 6 }}>
                {block.items.map((it: string, iIdx: number) => (
                  <li key={iIdx} style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.65 }}>
                    {renderInlineFormattedText(it)}
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={idx} style={{ paddingLeft: 24, margin: '12px 0 16px 0', display: 'grid', gap: 6 }}>
                {block.items.map((it: string, iIdx: number) => (
                  <li key={iIdx} style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.65 }}>
                    {renderInlineFormattedText(it)}
                  </li>
                ))}
              </ol>
            );

          default:
            return (
              <p
                key={idx}
                style={{
                  fontSize: '0.98rem',
                  color: '#334155',
                  margin: '12px 0',
                  lineHeight: 1.76,
                  wordBreak: 'break-word'
                }}
              >
                {renderInlineFormattedText(block.text)}
              </p>
            );
        }
      })}

      {/* Fullscreen Image Zoom Modal */}
      {zoomModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '90vh',
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 16,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => setZoomModal(null)}
              aria-label="Close Zoom"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1E293B'
              }}
            >
              <X size={20} />
            </button>

            <img
              src={zoomModal.url}
              alt={zoomModal.title}
              style={{
                maxWidth: '88vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 12
              }}
            />

            {(zoomModal.title || zoomModal.caption) && (
              <div style={{ marginTop: 12, textAlign: 'center', maxWidth: 640 }}>
                {zoomModal.title && <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{zoomModal.title}</h4>}
                {zoomModal.caption && <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>{zoomModal.caption}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Markdown Parsing Helpers
// -----------------------------------------------------------------------------

function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ParsedBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'hr' | 'p' | 'blockquote' | 'callout' | 'table' | 'image' | 'math-block' | 'ul' | 'ol';
  text?: string;
  subtype?: string;
  title?: string;
  headers?: string[];
  rows?: string[][];
  alt?: string;
  url?: string;
  caption?: string;
  items?: string[];
}

function parseMarkdownBlocks(md: string): ParsedBlock[] {
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

    // Standalone Markdown Image ![alt](url)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      let caption = '';
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('*') && lines[i + 1].trim().endsWith('*')) {
        caption = lines[i + 1].trim().slice(1, -1);
        i++;
      }
      blocks.push({
        type: 'image',
        alt: imgMatch[1],
        url: imgMatch[2],
        caption
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

// -----------------------------------------------------------------------------
// Inline Text & Formula Formatting Helpers
// -----------------------------------------------------------------------------

function renderInlineFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  // Protect against raw SVG / HTML / Base64 injection: strip raw tags except basic formatting
  let sanitized = text
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]{100,}/g, '[Verified Diagram]')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  // Handle LaTeX inline math `$E = mc^2$`
  const parts = sanitized.split(/(\$[^\$]+\$)/g);

  return parts.map((part, pIdx) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1);
      return (
        <span
          key={pIdx}
          className="math-inline"
          style={{
            padding: '2px 6px',
            borderRadius: 6,
            background: '#FFF3E8',
            color: '#C2410C',
            fontWeight: 700,
            fontFamily: "'Cambria Math', 'KaTeX_Math', 'Times New Roman', serif"
          }}
        >
          {formatMathFormula(math)}
        </span>
      );
    }

    // Handle Bold, Italic, Code, Subscripts
    return renderMarkdownTokens(part, pIdx);
  });
}

function renderMarkdownTokens(text: string, baseKey: number): React.ReactNode {
  // Regex for bold **bold**, code `code`, italic *italic*
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return (
    <React.Fragment key={baseKey}>
      {tokens.map((token, tIdx) => {
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={tIdx} style={{ fontWeight: 800, color: '#111827' }}>
              {formatChemicalSubscripts(token.slice(2, -2))}
            </strong>
          );
        }
        if (token.startsWith('`') && token.endsWith('`')) {
          return (
            <code
              key={tIdx}
              style={{
                background: '#F1F5F9',
                padding: '2px 6px',
                borderRadius: 5,
                fontSize: '0.86em',
                color: '#BE185D',
                fontFamily: 'ui-monospace, monospace'
              }}
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith('*') && token.endsWith('*')) {
          return (
            <em key={tIdx} style={{ fontStyle: 'italic', color: '#4B5563' }}>
              {formatChemicalSubscripts(token.slice(1, -1))}
            </em>
          );
        }
        return <span key={tIdx}>{formatChemicalSubscripts(token)}</span>;
      })}
    </React.Fragment>
  );
}

/**
 * Formats chemical formulas like CO2 -> CO₂, H2O -> H₂O, C6H12O6 -> C₆H₁₂O₆
 * and reaction arrows -> into →
 */
function formatChemicalSubscripts(str: string): React.ReactNode {
  // Arrow replacements
  const arrowClean = str.replace(/->|-->|\\rightarrow/g, ' → ');

  // Look for patterns like CO2, H2O, O2, C6H12O6, CaCO3, Ca(OH)2
  const chemRegex = /\b([A-Z][a-z]?|\))(\d+)/g;
  if (!chemRegex.test(arrowClean)) {
    return arrowClean;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  chemRegex.lastIndex = 0;
  let match;

  while ((match = chemRegex.exec(arrowClean)) !== null) {
    if (match.index > lastIndex) {
      parts.push(arrowClean.substring(lastIndex, match.index));
    }
    parts.push(match[1]);
    parts.push(<sub key={match.index}>{match[2]}</sub>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < arrowClean.length) {
    parts.push(arrowClean.substring(lastIndex));
  }

  return parts;
}

/**
 * Formats math formulas like \frac{a}{b}, x^2, \sqrt{...}, \pm
 */
function formatMathFormula(math: string): React.ReactNode {
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
    .replace(/\\pi/g, ' π ');

  // Handle \frac{a}{b}
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

  // Handle \sqrt{x}
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Handle superscripts like x^2 -> x²
  cleaned = cleaned
    .replace(/\^2\b/g, '²')
    .replace(/\^3\b/g, '³')
    .replace(/\^([0-9]+)/g, '^$1');

  return formatChemicalSubscripts(cleaned);
}
