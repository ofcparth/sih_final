import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Camera, Clock, CheckCircle2,
  AlertTriangle, Info, ChevronDown, ChevronUp, Layers,
} from 'lucide-react';
import { DISEASE_DETECTION } from '../data/mockData';
import { AI_RECOMMENDATIONS } from '../data/aiRecommendations';
import AIRecommendationPanel from './AIRecommendationPanel';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

export default function DiseaseTab() {
  const d = DISEASE_DETECTION;
  const [showMgmt, setShowMgmt] = useState(true);

  const confClass = d.confidence >= 80 ? '' : d.confidence >= 60 ? 'warn' : 'crit';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <ShieldAlert size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--red-500)' }} />
          Crop Disease Detection
        </h1>
        <p className="page-subtitle">AI-powered analysis of foliar symptoms · Model: {d.modelId}</p>
      </div>

      {/* Detection Result Card */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <ShieldAlert size={16} style={{ color: 'var(--red-500)' }} />
            Latest Detection Result
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge type="critical">Disease Detected</StatusBadge>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {new Date(d.detectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="module-panel-body">
          <div className="detection-result-card">
            {/* Crop image placeholder with icon */}
            <div className="detection-image-placeholder">
              <Camera size={28} style={{ color: 'var(--gray-400)' }} />
              <span>Cotton Leaf<br />Sample Image</span>
              <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>CLCuD-affected leaf</span>
            </div>

            <div className="detection-info">
              <div className="detection-crop-label">Detected on: {d.crop}</div>
              <div className="detection-name">
                {d.disease}
                <br />
                <span>{d.scientificName}</span>
              </div>

              <div className="confidence-bar-wrap">
                <div className="confidence-label">
                  <span>Model Confidence</span>
                  <span className="confidence-pct">{d.confidence}%</span>
                </div>
                <div className="confidence-bar">
                  <div className={`confidence-fill ${confClass}`} style={{ width: `${d.confidence}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <StatusBadge type="critical">Severity: {d.severity}</StatusBadge>
                <StatusBadge type="warning">Affected: {d.affectedArea}</StatusBadge>
                <span className="status-badge neutral">
                  <Layers size={11} /> {d.modelId}
                </span>
              </div>
            </div>
          </div>

          {/* Top Predictions */}
          <div style={{ marginTop: 16 }}>
            <div className="section-heading">Top Model Predictions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d.topPredictions.map((p, i) => (
                <div key={i} className="meter-wrap">
                  <div className="meter-header">
                    <span className="meter-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: 'var(--red-500)', padding: '1px 5px', borderRadius: 3 }}>TOP</span>}
                      {p.name}
                    </span>
                    <span className="meter-value">{p.confidence}%</span>
                  </div>
                  <div className="meter-bar">
                    <div
                      className={`meter-fill ${i === 0 ? 'red' : 'blue'}`}
                      style={{ width: `${p.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What is CLCuD? */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <Info size={16} style={{ color: 'var(--blue-500)' }} />
            About: {d.disease.split('(')[0].trim()}
          </div>
        </div>
        <div className="module-panel-body">
          <div className="grid-2">
            <div>
              <div className="section-heading">Disease Overview</div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Cotton Leaf Curl Disease (CLCuD) is caused by a complex of whitefly-transmitted
                begomoviruses (<em>Begomovirus</em>, family <em>Geminiviridae</em>). It is one of the most
                economically damaging diseases of cotton in South Asia, capable of causing yield
                losses up to 70–100% in severe cases.
              </p>
            </div>
            <div>
              <div className="section-heading">Key Symptoms</div>
              <ul style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 18 }}>
                <li>Upward or downward leaf curling (rolling)</li>
                <li>Enations (vein-associated outgrowths) on underside</li>
                <li>Vein thickening and darkening</li>
                <li>Stunted plant growth and reduced boll setting</li>
                <li>Mosaic or mottling patterns in advanced stages</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--amber-50)', border: '1px solid var(--amber-200)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--amber-800)', display: 'flex', gap: 10 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span><strong>Important:</strong> CLCuD is vectored exclusively by <em>Bemisia tabaci</em> (Whitefly). The co-detection of whitefly (91% confidence) confirms active disease transmission pressure on this plot.</span>
          </div>
        </div>
      </div>

      {/* Management Plan */}
      <div className="module-panel">
        <div className="module-panel-header" style={{ cursor: 'pointer' }} onClick={() => setShowMgmt(!showMgmt)}>
          <div className="module-panel-title">
            <CheckCircle2 size={16} style={{ color: 'var(--green-600)' }} />
            Recommended Management Actions
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge type="critical">Immediate Action Required</StatusBadge>
            {showMgmt ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        {showMgmt && (
          <div className="module-panel-body">
            <div className="rec-block">
              <div className="rec-block-header">
                <CheckCircle2 size={14} />
                Agronomic Management Protocol
              </div>
              <div className="rec-list">
                {d.management.map((rec, i) => (
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
              <span>
                <strong>Note:</strong> All pesticide recommendations are indicative. Refer to local KSCA/ICAR guidelines or consult a certified agronomist before application. Always follow label instructions and safety precautions.
              </span>
            </div>
          </div>
        )}
      </div>
      {/* AI Recommendation Panel */}
      <AIRecommendationPanel recommendation={AI_RECOMMENDATIONS.disease} />
    </div>
  );
}
