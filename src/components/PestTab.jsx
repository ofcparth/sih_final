import React from 'react';
import {
  Bug, ShieldCheck, Camera, Clock, Info,
  CheckCircle2, AlertTriangle, Layers,
} from 'lucide-react';
import { PEST_DETECTION } from '../data/mockData';
import { AI_RECOMMENDATIONS } from '../data/aiRecommendations';
import AIRecommendationPanel from './AIRecommendationPanel';
import { useLanguage } from '../i18n/LanguageContext';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

export default function PestTab() {
  const { t, currentLanguage } = useLanguage();
  const p = PEST_DETECTION;
  const confClass = p.confidence >= 80 ? '' : p.confidence >= 60 ? 'warn' : 'crit';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Bug size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--orange-500)' }} />
          {t('pest.title', 'Crop Pest Detection')}
        </h1>
        <p className="page-subtitle">{t('pest.subtitle', 'Visual pest identification using AI image analysis')} · Model: {p.modelId}</p>
      </div>

      {/* Detection Result */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <Bug size={16} style={{ color: 'var(--orange-500)' }} />
            {t('pest.latestResult', 'Latest Pest Identification')}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge type="critical">{t('pest.pestDetected', 'Pest Detected')}</StatusBadge>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {new Date(p.detectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="module-panel-body">
          <div className="detection-result-card">
            <div className="detection-image-placeholder">
              <Bug size={28} style={{ color: 'var(--orange-400)' }} />
              <span>Whitefly<br />Colony Image</span>
              <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Bemisia tabaci</span>
            </div>

            <div className="detection-info">
              <div className="detection-crop-label">Detected on: {p.crop}</div>
              <div className="detection-name">
                {p.pest}
                <br />
                <span>{p.scientificName}</span>
              </div>

              <div className="confidence-bar-wrap">
                <div className="confidence-label">
                  <span>Identification Confidence</span>
                  <span className="confidence-pct">{p.confidence}%</span>
                </div>
                <div className="confidence-bar">
                  <div className={`confidence-fill ${confClass}`} style={{ width: `${p.confidence}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <StatusBadge type="critical">Severity: {p.severity}</StatusBadge>
                <span className="status-badge neutral">
                  <Layers size={11} /> {p.modelId}
                </span>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--red-50)', border: '1px solid var(--red-200)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--red-800)', display: 'flex', gap: 8 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span><strong>Vector Alert:</strong> Bemisia tabaci is the primary vector of Cotton Leaf Curl Disease (CLCuD). Urgently control vector population to halt disease spread.</span>
              </div>
            </div>
          </div>

          {/* Top Predictions */}
          <div style={{ marginTop: 16 }}>
            <div className="section-heading">Top Model Predictions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {p.topPredictions.map((pred, i) => (
                <div key={i} className="meter-wrap">
                  <div className="meter-header">
                    <span className="meter-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: 'var(--orange-500)', padding: '1px 5px', borderRadius: 3 }}>TOP</span>}
                      {pred.name}
                    </span>
                    <span className="meter-value">{pred.confidence}%</span>
                  </div>
                  <div className="meter-bar">
                    <div className={`meter-fill ${i === 0 ? 'amber' : 'blue'}`} style={{ width: `${pred.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pest Biology */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <Info size={16} style={{ color: 'var(--blue-500)' }} />
            About: Bemisia tabaci (Whitefly)
          </div>
        </div>
        <div className="module-panel-body">
          <div className="grid-2">
            <div>
              <div className="section-heading">Pest Biology</div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <em>Bemisia tabaci</em> (Gennadius) is a polyphagous, phloem-feeding whitefly with
                over 900 host plant species. It reproduces rapidly in warm, dry conditions (optimal
                28–32°C). Adults lay 150–300 eggs per female on leaf undersides. Complete life
                cycle: 15–30 days under field conditions.
              </p>
            </div>
            <div>
              <div className="section-heading">Crop Damage Mechanisms</div>
              <ul style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 18 }}>
                <li>Direct: Phloem sap feeding → leaf yellowing, necrosis</li>
                <li>Indirect: CLCuD virus transmission (primary vector)</li>
                <li>Honeydew secretion → sooty mold growth</li>
                <li>Interference with photosynthesis and boll development</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Management */}
      <div className="module-panel">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <CheckCircle2 size={16} style={{ color: 'var(--green-600)' }} />
            Integrated Pest Management (IPM) Protocol
          </div>
          <StatusBadge type="critical">Immediate Action</StatusBadge>
        </div>
        <div className="module-panel-body">
          <div className="rec-block">
            <div className="rec-block-header">
              <CheckCircle2 size={14} />
              Recommended Actions — High Severity
            </div>
            <div className="rec-list">
              {p.management.map((rec, i) => (
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
            <span><strong>Note:</strong> All pesticide recommendations are indicative. Follow IRAC insecticide resistance management principles. Consult KVK or local agronomist before first application.</span>
          </div>
        </div>
      </div>
      {/* AI Recommendation Panel */}
      <AIRecommendationPanel recommendation={AI_RECOMMENDATIONS.pest} />
    </div>
  );
}
