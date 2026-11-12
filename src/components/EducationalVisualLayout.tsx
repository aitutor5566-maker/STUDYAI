import React, { useState } from 'react';
import {
  ZoomIn,
  Edit3,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  X,
  Box
} from 'lucide-react';
import { Interactive3DViewer } from './Interactive3DLab';

export interface VisualLabelItem {
  key?: string;
  label: string;
  description?: string;
  order?: number;
}

export interface EducationalVisualProps {
  visual: {
    id: string;
    title: string;
    caption?: string;
    svgXml?: string;
    dataUrl?: string;
    imageUrl?: string;
    labels?: VisualLabelItem[];
    diagramType?: string;
    provider?: string;
    limitationNote?: string;
    interactive3dSupported?: boolean;
    recommendedModel3d?: string;
  };
  explanation?: {
    visualTitle?: string;
    stepByStepProcess?: string[];
    keyComponents?: VisualLabelItem[];
    whyItHappens?: string;
    importantTakeaway?: string;
    examTip?: string;
    realWorldApplication?: string;
    coreFormula?: string;
    pedagogicalSteps?: {
      seeIt?: string;
      understandIt?: string;
      connectIt?: string;
      rememberIt?: string;
      applyIt?: string;
    };
  };
  // ChatGPT-style Chart & Diagram Controls
  onEditDiagram?: (updatedVisual: any) => void;
  onDeleteDiagram?: (visualId: string) => void;
  onRegenerateDiagram?: (promptModification: string) => void;
  readOnly?: boolean;
}

export const EducationalVisualLayout: React.FC<EducationalVisualProps> = ({
  visual,
  explanation,
  onEditDiagram,
  onDeleteDiagram,
  onRegenerateDiagram,
  readOnly = false
}) => {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [show3dModal, setShow3dModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(visual.title || '');
  const [editLabels, setEditLabels] = useState<string>(
    (visual.labels || explanation?.keyComponents || []).map((l) => `${l.label}: ${l.description || ''}`).join('\n')
  );
  const [activeComponent, setActiveComponent] = useState<VisualLabelItem | null>(null);

  const has3D =
    visual.interactive3dSupported ||
    Boolean(visual.recommendedModel3d) ||
    /heart|cardiac|lungs|circuit|electric|dna|plant cell|solar system|torso|ear|motor/i.test(
      visual.title || visual.diagramType || ''
    );
  const modelKey = visual.recommendedModel3d || visual.diagramType;

  const displayTitle = explanation?.visualTitle || visual.title || 'Verified Scientific Diagram';
  const displayCaption = visual.caption || 'Curriculum-aligned scientific diagram with validated anatomical and schematic labels.';
  const componentsList = explanation?.keyComponents || visual.labels || [];
  const stepsList = explanation?.stepByStepProcess || [];
  const whyItHappens = explanation?.whyItHappens;
  const takeaway = explanation?.importantTakeaway || explanation?.examTip;

  const handleCopySvgOrUrl = () => {
    const textToCopy = visual.svgXml || visual.dataUrl || visual.imageUrl || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (visual.dataUrl || visual.svgXml) {
      const link = document.createElement('a');
      link.href = visual.dataUrl || `data:image/svg+xml;utf8,${encodeURIComponent(visual.svgXml || '')}`;
      link.download = `${visual.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`;
      link.click();
    }
  };

  const handleSaveEdit = () => {
    if (onEditDiagram) {
      const parsedLabels: VisualLabelItem[] = editLabels
        .split('\n')
        .filter((line) => line.trim())
        .map((line, idx) => {
          const [lbl, ...rest] = line.split(':');
          return {
            key: `lbl_${idx + 1}`,
            label: lbl.trim(),
            description: rest.join(':').trim(),
            order: idx + 1
          };
        });

      onEditDiagram({
        ...visual,
        title: editTitle,
        labels: parsedLabels
      });
    }
    setShowEditModal(false);
  };

  return (
    <div
      className="educational-visual-container"
      style={{
        margin: '20px 0',
        borderRadius: 20,
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFDFB 100%)',
        border: '1.5px solid rgba(255, 106, 0, 0.28)',
        boxShadow: '0 12px 32px -8px rgba(255, 106, 0, 0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Top Action Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: 'linear-gradient(90deg, #FFF7ED 0%, #FFE4CC 100%)',
          borderBottom: '1px solid rgba(255, 106, 0, 0.2)',
          flexWrap: 'wrap',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem' }}>📐</span>
          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#C2410C' }}>
            {displayTitle}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 999,
              background: '#FFFFFF',
              color: '#EA580C',
              border: '1px solid rgba(255,106,0,0.3)'
            }}
          >
            Verified Vector Schematic
          </span>
        </div>

        {/* ChatGPT-style diagram action controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {has3D && (
            <button
              type="button"
              onClick={() => setShow3dModal(true)}
              title="Launch Interactive 3D Model Lab"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                borderRadius: 8,
                border: '1px solid #FF6A00',
                background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 106, 0, 0.25)'
              }}
            >
              <Box size={13} />
              <span>3D Lab</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            title="Enlarge Diagram Fullscreen"
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <ZoomIn size={13} />
            <span>Enlarge</span>
          </button>

          {!readOnly && onEditDiagram && (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              title="Edit Diagram Annotations"
              style={{
                padding: '5px 10px',
                borderRadius: 8,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              <Edit3 size={13} color="#2563EB" />
              <span>Edit</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopySvgOrUrl}
            title="Copy SVG Code"
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download SVG Diagram"
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          {!readOnly && onDeleteDiagram && (
            <button
              type="button"
              onClick={() => onDeleteDiagram(visual.id)}
              title="Remove Diagram"
              style={{
                padding: '5px 8px',
                borderRadius: 8,
                background: '#FFFFFF',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Responsive Layout: Side-by-Side on Desktop/Tablet, Stacked on Mobile */}
      <div
        className="educational-visual-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          padding: 18
        }}
      >
        {/* LEFT COLUMN: Visual Area (Image or Programmatic SVG) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#0F172A',
              border: '1px solid #334155',
              boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 280
            }}
          >
            {visual.svgXml ? (
              <div
                dangerouslySetInnerHTML={{ __html: visual.svgXml }}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <img
                src={visual.dataUrl || visual.imageUrl}
                alt={displayTitle}
                style={{
                  width: '100%',
                  maxHeight: 420,
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            )}

            {/* Click to Zoom Hint Overlay */}
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}
            >
              <ZoomIn size={12} color="#FBBF24" />
              <span>Full View</span>
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', padding: '0 4px' }}>
            {displayCaption}
          </div>

          {/* Quick AI Modification Chips (Requirement 13) */}
          {!readOnly && onRegenerateDiagram && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', alignSelf: 'center' }}>
                Adjust Visual:
              </span>
              {[
                '🔍 Make labels bigger',
                '🪜 Show step-by-step',
                '🏹 Highlight directional arrows',
                '🌱 Simpler for Class 8',
                '🎯 Exam revision schematic'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onRegenerateDiagram(chip)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: '#FFF7ED',
                    border: '1px solid rgba(255,106,0,0.25)',
                    color: '#C2410C',
                    fontSize: '0.71rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Mandatory 5-Part Explanation Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 1. Title & High-Level Role */}
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 900, color: '#1E293B' }}>
              {displayTitle}
            </h4>
            <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
              {displayCaption}
            </div>
          </div>

          {/* 2. Step-by-Step Process (What happens and in which order) */}
          {stepsList.length > 0 && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🪜</span>
                <span>Step-by-Step Process &amp; Order of Events:</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stepsList.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#334155', lineHeight: 1.55 }}>
                    <span
                      style={{
                        minWidth: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#FF6A00',
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Key Components (Numbered and ordered labels) */}
          {componentsList.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🏷️</span>
                <span>Key Labelled Components (In Diagram Order):</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {componentsList.map((comp, idx) => {
                  const isSelected = activeComponent?.label === comp.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveComponent(isSelected ? null : comp)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: isSelected ? '#FF6A00' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1E293B',
                        border: isSelected ? '1px solid #EA580C' : '1px solid #CBD5E1',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ opacity: isSelected ? 1 : 0.6 }}>#{idx + 1}</span>
                      <span>{comp.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Component Detail Inspector Box */}
              {activeComponent && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#FFF7ED',
                    border: '1px solid rgba(255, 106, 0, 0.3)',
                    fontSize: '0.8rem',
                    color: '#C2410C'
                  }}
                >
                  <strong>{activeComponent.label}:</strong> {activeComponent.description || 'Core anatomical or process component.'}
                </div>
              )}
            </div>
          )}

          {/* 4. Why It Happens (Scientific / Academic reason) */}
          {whyItHappens && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                fontSize: '0.82rem',
                color: '#166534',
                lineHeight: 1.55
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🔬</span>
                <span>Why It Happens (Scientific Principle):</span>
              </div>
              <div>{whyItHappens}</div>
            </div>
          )}

          {/* 4b. Real-World & Curriculum Connection (CONNECT IT) */}
          {(explanation?.realWorldApplication || explanation?.pedagogicalSteps?.connectIt) && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                fontSize: '0.82rem',
                color: '#1E40AF',
                lineHeight: 1.55
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🔗</span>
                <span>Real-Life &amp; Curriculum Connection:</span>
              </div>
              <div>{explanation.realWorldApplication || explanation.pedagogicalSteps?.connectIt}</div>
            </div>
          )}

          {/* 4c. Governing Formula or Rule (REMEMBER IT) */}
          {explanation?.coreFormula && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#FAF5FF',
                border: '1px solid #E9D5FF',
                fontSize: '0.82rem',
                color: '#6B21A8',
                lineHeight: 1.55
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📐</span>
                <span>Governing Mathematical / Scientific Formula:</span>
              </div>
              <code style={{ background: '#FFFFFF', padding: '2px 8px', borderRadius: 6, fontWeight: 800, fontSize: '0.84rem' }}>
                {explanation.coreFormula}
              </code>
            </div>
          )}

          {/* 5. Important Takeaway & Exam Memory Hook (APPLY IT) */}
          {takeaway && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                fontSize: '0.82rem',
                color: '#92400E',
                lineHeight: 1.55
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎯</span>
                <span>Important Exam Takeaway &amp; Application:</span>
              </div>
              <div>{takeaway}</div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            padding: 24
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem' }}>
              {displayTitle}
            </div>
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                background: '#FF6A00',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
            {visual.svgXml ? (
              <div
                dangerouslySetInnerHTML={{ __html: visual.svgXml }}
                style={{ maxWidth: '90vw', maxHeight: '82vh' }}
              />
            ) : (
              <img
                src={visual.dataUrl || visual.imageUrl}
                alt={displayTitle}
                style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Edit Diagram Modal */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: '#1E293B' }}>
                ✏️ Edit Diagram Annotations
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', color: '#475569', marginBottom: 6 }}>
                  Diagram Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', color: '#475569', marginBottom: 6 }}>
                  Labels &amp; Definitions (One per line: &quot;Label: Explanation&quot;)
                </label>
                <textarea
                  rows={6}
                  value={editLabels}
                  onChange={(e) => setEditLabels(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: '#F1F5F9',
                    border: 'none',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    background: '#FF6A00',
                    border: 'none',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive 3D Model Modal */}
      {show3dModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 960,
              height: '82vh',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              background: '#0F172A',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Interactive3DViewer
              topic={visual.title}
              modelType={modelKey}
              onClose={() => setShow3dModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
