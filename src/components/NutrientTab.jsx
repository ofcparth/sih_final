import React from 'react';
import {
  Sparkles, FlaskConical, Camera, Clock, Info,
  CheckCircle2, AlertTriangle, Layers,
} from 'lucide-react';
import { NUTRIENT_ANALYSIS } from '../data/mockData';
import { AI_RECOMMENDATIONS } from '../data/aiRecommendations';
import AIRecommendationPanel from './AIRecommendationPanel';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

const statusMap = {
  optimal: { type: 'healthy', label: 'Optimal' },
  deficient: { type: 'critical', label: 'Deficient' },
  marginal: { type: 'warning', label: 'Marginal' },
  excess: { type: 'orange', label: 'Excess' },
};

const meterColor = {
  optimal: 'green',
  deficient: 'red',
  marginal: 'amber',
  excess: 'amber',
};

export default function NutrientTab() {
  const n = NUTRIENT_ANALYSIS;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Sparkles size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--amber-500)' }} />
          Nutrient Deficiency Analysis
        </h1>
        <p className="page-subtitle">Visual leaf analysis for macronutrient and micronutrient status · Model: {n.modelId}</p>
      </div>

      {/* Summary Card */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <FlaskConical size={16} style={{ color: 'var(--amber-500)' }} />
            Nutrient Status Summary
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge type="critical">Deficiency Detected</StatusBadge>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {new Date(n.detectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="module-panel-body">
          <div className="detection-result-card">
            <div className="detection-image-placeholder">
              <Sparkles size={28} style={{ color: 'var(--amber-400)' }} />
              <span>Cotton Leaf<br />Nutrient Scan</span>
              <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>N-deficient leaf</span>
            </div>
            <div className="detection-info">
              <div className="detection-crop-label">Crop: {n.crop}</div>
              <div className="detection-name">
                {n.primaryDeficiency}
                <br />
                <span>Primary detected deficiency</span>
              </div>

              <div className="confidence-bar-wrap">
                <div className="confidence-label">
                  <span>Analysis Confidence</span>
                  <span className="confidence-pct">{n.confidence}%</span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill warn" style={{ width: `${n.confidence}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StatusBadge type="critical">N: Deficient</StatusBadge>
                <StatusBadge type="warning">P: Marginal</StatusBadge>
                <StatusBadge type="warning">Zn: Marginal</StatusBadge>
                <StatusBadge type="healthy">K: Optimal</StatusBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Nutrient Cards */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <Layers size={16} style={{ color: 'var(--blue-500)' }} />
            Individual Nutrient Status
          </div>
        </div>
        <div className="module-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {n.nutrients.map(nut => {
              const sm = statusMap[nut.status] || statusMap.optimal;
              const mc = meterColor[nut.status] || 'green';
              return (
                <div key={nut.symbol} style={{
                  background: nut.status === 'deficient' ? 'var(--red-50)' : nut.status === 'marginal' ? 'var(--amber-50)' : 'var(--green-50)',
                  border: `1px solid ${nut.status === 'deficient' ? 'var(--red-200)' : nut.status === 'marginal' ? 'var(--amber-200)' : 'var(--green-200)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: nut.status === 'deficient' ? 'var(--red-100)' : nut.status === 'marginal' ? 'var(--amber-100)' : 'var(--green-100)',
                        color: nut.status === 'deficient' ? 'var(--red-700)' : nut.status === 'marginal' ? 'var(--amber-700)' : 'var(--green-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 14, fontFamily: 'monospace',
                        marginBottom: 6,
                      }}>
                        {nut.symbol}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{nut.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{nut.unit}</div>
                    </div>
                    <StatusBadge type={sm.type}>{sm.label}</StatusBadge>
                  </div>
                  <div className="meter-wrap">
                    <div className="meter-header">
                      <span className="meter-label">Level Index</span>
                      <span className="meter-value">{nut.index}/100</span>
                    </div>
                    <div className="meter-bar">
                      <div className={`meter-fill ${mc}`} style={{ width: `${nut.index}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="module-panel">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <CheckCircle2 size={16} style={{ color: 'var(--green-600)' }} />
            Fertilizer &amp; Correction Recommendations
          </div>
          <StatusBadge type="warning">Action Required</StatusBadge>
        </div>
        <div className="module-panel-body">
          <div className="rec-block">
            <div className="rec-block-header">
              <CheckCircle2 size={14} />
              Agronomic Correction Protocol
            </div>
            <div className="rec-list">
              {n.management.map((rec, i) => (
                <div key={i} className="rec-item">
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--green-600)', color: 'white',
                    fontSize: 11, fontWeight: 700, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>{i + 1}</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 'var(--radius-lg)', fontSize: 12.5, color: 'var(--blue-800)', display: 'flex', gap: 10 }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--blue-600)' }} />
            <span>Fertilizer dose recommendations are indicative. Apply based on soil test results (STP/NTP). Confirm with local KVK extension officer before application.</span>
          </div>
        </div>
      </div>
      {/* AI Recommendation Panel */}
      <AIRecommendationPanel recommendation={AI_RECOMMENDATIONS.nutrient} />
    </div>
  );
}
