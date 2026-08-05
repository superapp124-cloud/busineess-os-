/**
 * Resume Intelligence OS v3.0 — Interactive Explainability Panel
 *
 * Recruiter-facing UI component. Shown when any parsed field is clicked.
 * Displays: confirmed value, confidence bar, evidence snippet, parser engine,
 * ontology source, confidence reasons (with Consensus signal), and rejected candidates.
 *
 * Enterprise differentiator: full audit trail in one click.
 */

import React, { useState } from 'react';
import type { ExplainabilityResult } from '../intelligence/services/explainabilityService';
import type { StageConfidence } from '../intelligence/core/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExplainabilityPanelProps {
  result: ExplainabilityResult;
  onClose: () => void;
  onCorrect?: (fieldKey: string, correctedValue: string) => void;
}

// ─── Confidence Stage Labels ──────────────────────────────────────────────────

const STAGE_LABELS: Record<keyof Omit<StageConfidence, 'overall' | 'reasons'>, string> = {
  lexical:      'Pattern Match',
  layout:       'Layout Context',
  section:      'Section Context',
  ontology:     'Ontology Match',
  relationship: 'Graph Relationship',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ConfidenceBar: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2, color: '#94a3b8' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ background: '#1e293b', borderRadius: 4, height: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};

const StalenessChip: React.FC<{ staleness: string }> = ({ staleness }) => {
  const map: Record<string, { color: string; label: string }> = {
    fresh:   { color: '#10b981', label: '● Fresh' },
    aging:   { color: '#f59e0b', label: '◐ Aging' },
    stale:   { color: '#ef4444', label: '○ Stale' },
    unknown: { color: '#64748b', label: '? Unknown' },
  };
  const cfg = map[staleness] ?? map.unknown;
  return (
    <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600, marginLeft: 8 }}>{cfg.label}</span>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────

const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ result, onClose, onCorrect }) => {
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState('');

  const overall = Math.round(result.confidence.overall * 100);
  const overallColor = overall >= 85 ? '#10b981' : overall >= 60 ? '#f59e0b' : '#ef4444';
  const stages = result.confidence as StageConfidence;

  const handleCorrect = () => {
    if (correction.trim() && onCorrect) {
      onCorrect(result.fieldKey, correction.trim());
      setCorrecting(false);
    }
  };

  // Check for Consensus signal (value found in multiple sections)
  const consensusReasons = (result.confidence as any).reasons?.filter((r: any) => r.stage !== undefined) ?? [];
  const consensusSections = [...new Set(consensusReasons.map((r: any) => r.signal?.split(' in ')?.[1]).filter(Boolean))];
  const hasConsensus = consensusSections.length >= 2;

  return (
    <div
      id={`explain-panel-${result.fieldKey}`}
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 340,
        maxHeight: '85vh',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)',
        zIndex: 9999,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#e2e8f0',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            Intelligence Audit
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{result.displayName}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Close explainability panel"
        >×</button>
      </div>

      {/* Confirmed Value */}
      <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>
          {result.isVerified ? '✓ ACCEPTED' : '✗ UNVERIFIED'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', wordBreak: 'break-word' }}>
          {result.displayValue || <span style={{ color: '#475569', fontStyle: 'italic' }}>Not Extracted</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Entity Type: <span style={{ color: '#a5b4fc' }}>{(result as any).lineage?.entityType ?? 'Unknown'}</span></span>
          <StalenessChip staleness={result.staleness} />
        </div>
      </div>

      {/* Overall Confidence */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Overall Confidence</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: overallColor }}>{overall}%</span>
        </div>
        {/* Stage breakdown */}
        {Object.entries(STAGE_LABELS).map(([key, label]) => (
          <ConfidenceBar key={key} value={(stages as any)[key] ?? 0} label={label} />
        ))}
        {/* Consensus signal */}
        {hasConsensus && (
          <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>⊕ Consensus Signal</span>
            <div style={{ fontSize: 10, color: '#6ee7b7', marginTop: 2 }}>
              Found in: {consensusSections.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Evidence */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>EVIDENCE</div>
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '8px 12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              <span style={{ color: '#6366f1', fontWeight: 600 }}>Page {result.page}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Section: <span style={{ color: '#a5b4fc' }}>{result.section}</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', lineHeight: 1.5, borderLeft: '2px solid #334155', paddingLeft: 8 }}>
            "{result.evidenceSnippet}"
          </div>
        </div>
      </div>

      {/* Parser & Ontology */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '8px 10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: 9, color: '#475569', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>PARSER ENGINE</div>
          <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600 }}>{result.parserVersions?.extractor ?? 'v3.0'}</div>
          <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{result.parserVersions?.processedAt?.slice(0,10) ?? ''}</div>
        </div>
        {(result as any).ontologyVersion && (result as any).ontologyVersion !== 'none' && (
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '8px 10px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: 9, color: '#475569', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>ONTOLOGY</div>
            <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 600 }}>{(result as any).ontologyVersion}</div>
          </div>
        )}
      </div>

      {/* Rejected Candidates */}
      {result.rejectedCandidates && result.rejectedCandidates.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>REJECTED CANDIDATES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {result.rejectedCandidates.map((rc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px', background: '#0f172a', borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{rc.value}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{rc.type} — {rc.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Row */}
      {result.isVerified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(16,185,129,0.06)', borderRadius: 6, border: '1px solid rgba(16,185,129,0.15)', marginBottom: 14 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 600 }}>{result.displayValue}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>Employer entity — Accepted</div>
          </div>
        </div>
      )}

      {/* Correct This Field */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 12 }}>
        {!correcting ? (
          <button
            id={`correct-btn-${result.fieldKey}`}
            onClick={() => { setCorrecting(true); setCorrection(result.displayValue); }}
            style={{ width: '100%', padding: '8px 0', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}
          >
            ✏ Correct This Field
          </button>
        ) : (
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>Enter correct value:</div>
            <input
              id={`correct-input-${result.fieldKey}`}
              type="text"
              value={correction}
              onChange={e => setCorrection(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCorrect()}
              style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid rgba(99,102,241,0.4)', color: '#f1f5f9', borderRadius: 8, fontSize: 12, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }}
              placeholder="Correct employer name..."
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                id={`correct-confirm-${result.fieldKey}`}
                onClick={handleCorrect}
                style={{ flex: 1, padding: '7px 0', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
              >Save Correction</button>
              <button
                onClick={() => setCorrecting(false)}
                style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #334155', color: '#64748b', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
              >Cancel</button>
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 6, textAlign: 'center' }}>Correction saved to Feedback Registry → benchmark candidate</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplainabilityPanel;

// ─── Hook: useExplainability ───────────────────────────────────────────────────

export function useExplainability() {
  const [activeField, setActiveField] = useState<string | null>(null);

  const open = (fieldKey: string) => setActiveField(fieldKey);
  const close = () => setActiveField(null);

  return { activeField, open, close };
}
