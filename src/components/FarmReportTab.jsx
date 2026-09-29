import React, { useState, useRef } from 'react';
import {
  FileText, Download, Printer, AlertOctagon, AlertTriangle,
  Info, CheckCircle2, IndianRupee, Sparkles, ShieldAlert,
  Bug, Droplets, CloudSun, Activity, TrendingDown,
  Calendar, MapPin, Leaf, ChevronDown, ChevronUp,
  Package, Clock, Target, BarChart3, Zap,
} from 'lucide-react';
import { FARM_INFO, SENSOR_READINGS, DISEASE_DETECTION, PEST_DETECTION, NUTRIENT_ANALYSIS, IRRIGATION_STATUS, WEATHER_CURRENT } from '../data/mockData';
import { AI_RECOMMENDATIONS, FARM_HEALTH_SCORE } from '../data/aiRecommendations';
import AIRecommendationPanel from './AIRecommendationPanel';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

const severityConfig = {
  critical: { bg: 'var(--red-50)', border: 'var(--red-200)', iconColor: 'var(--red-600)', badgeType: 'critical', Icon: AlertOctagon },
  warning: { bg: 'var(--amber-50)', border: 'var(--amber-200)', iconColor: 'var(--amber-600)', badgeType: 'warning', Icon: AlertTriangle },
  info: { bg: 'var(--blue-50)', border: 'var(--blue-200)', iconColor: 'var(--blue-500)', badgeType: 'info', Icon: Info },
};

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score < 40 ? 'var(--red-500)' : score < 65 ? 'var(--amber-500)' : 'var(--green-500)';

  return (
    <svg width={130} height={130} viewBox="0 0 130 130">
      <circle cx={65} cy={65} r={radius} fill="none" stroke="var(--gray-200)" strokeWidth={10} />
      <circle
        cx={65} cy={65} r={radius} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
      />
      <text x={65} y={60} textAnchor="middle" fill="var(--text-primary)" fontSize={26} fontWeight={800} fontFamily="Plus Jakarta Sans, sans-serif">{score}</text>
      <text x={65} y={78} textAnchor="middle" fill="var(--text-muted)" fontSize={11} fontFamily="Plus Jakarta Sans, sans-serif">/100</text>
    </svg>
  );
}

const MODULE_ICONS = {
  disease: { Icon: ShieldAlert, color: 'var(--red-500)', key: 'disease', label: 'Disease Management' },
  pest: { Icon: Bug, color: 'var(--orange-500)', key: 'pest', label: 'Pest Management' },
  nutrient: { Icon: Sparkles, color: 'var(--amber-500)', key: 'nutrient', label: 'Nutrient Management' },
  irrigation: { Icon: Droplets, color: 'var(--blue-500)', key: 'irrigation', label: 'Irrigation' },
  weather: { Icon: CloudSun, color: 'var(--teal-500)', key: 'weather', label: 'Weather Advisory' },
};

export default function FarmReportTab() {
  const [expandedModule, setExpandedModule] = useState('disease');
  const reportRef = useRef(null);
  const hs = FARM_HEALTH_SCORE;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const reportTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Farm Analysis Report — ${FARM_INFO.name}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; max-width: 900px; margin: 0 auto; padding: 32px; background: #fff; }
  h1 { font-size: 26px; color: #166534; letter-spacing: -0.5px; margin: 0 0 4px; }
  h2 { font-size: 16px; color: #1f2937; border-bottom: 2px solid #dcfce7; padding-bottom: 6px; margin: 28px 0 12px; }
  h3 { font-size: 14px; color: #374151; margin: 16px 0 8px; }
  .header-band { background: linear-gradient(135deg, #166534, #059669); color: white; padding: 24px 28px; border-radius: 12px; margin-bottom: 28px; }
  .header-band h1 { color: white; }
  .header-meta { font-size: 13px; opacity: 0.85; margin-top: 8px; }
  .score-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
  .score-big { font-size: 48px; font-weight: 900; color: #dc2626; line-height: 1; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .badge-crit { background: #fee2e2; color: #b91c1c; }
  .badge-warn { background: #fef3c7; color: #b45309; }
  .badge-info { background: #dbeafe; color: #1d4ed8; }
  .badge-ok { background: #dcfce7; color: #15803d; }
  .drawback { padding: 12px 16px; margin: 8px 0; border-radius: 8px; border-left: 4px solid; }
  .drawback-crit { background: #fef2f2; border-color: #ef4444; }
  .drawback-warn { background: #fffbeb; border-color: #f59e0b; }
  .drawback-info { background: #eff6ff; border-color: #3b82f6; }
  .drawback-title { font-weight: 700; font-size: 13.5px; margin-bottom: 3px; }
  .drawback-impact { font-size: 12.5px; color: #374151; margin-bottom: 3px; }
  .drawback-action { font-size: 12px; color: #059669; font-weight: 600; }
  .module-section { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin: 12px 0; }
  .action-item { padding: 8px 12px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; margin: 4px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin: 8px 0; }
  th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  tr:last-child td { border-bottom: none; }
  .cost-total { background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 16px; font-weight: 800; color: #166534; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11.5px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<div class="header-band">
  <h1>🌾 Smart Farm Analysis Report</h1>
  <div class="header-meta">
    ${FARM_INFO.name} · ${FARM_INFO.location} · ${FARM_INFO.cropShort} · ${FARM_INFO.growthStage}
    <br/>Generated: ${reportDate} at ${reportTime} · Season: ${FARM_INFO.season} · Day ${FARM_INFO.daysAfterSowing} after sowing
  </div>
</div>

<h2>1. Farm Health Score</h2>
<div class="score-box">
  <div class="score-big">${hs.overall}/100</div>
  <div style="font-weight:700; font-size:15px; color:#dc2626; margin-top:4px">${hs.label}</div>
  <div style="font-size:13px; color:#374151; margin-top:8px">
    Disease: ${hs.modules[0].score}/100 &nbsp;|&nbsp; Pest: ${hs.modules[1].score}/100 &nbsp;|&nbsp; 
    Nutrients: ${hs.modules[2].score}/100 &nbsp;|&nbsp; Irrigation: ${hs.modules[3].score}/100 &nbsp;|&nbsp; Weather: ${hs.modules[4].score}/100
  </div>
</div>

<h2>2. Critical Drawbacks &amp; Issues</h2>
${hs.drawbacks.map(d => `
<div class="drawback drawback-${d.severity}">
  <div class="drawback-title">${d.title}</div>
  <div class="drawback-impact">Impact: ${d.impact}</div>
  <div class="drawback-action">→ ${d.action}</div>
</div>`).join('')}

<h2>3. AI Recommendations by Module</h2>

${Object.entries(AI_RECOMMENDATIONS).map(([key, rec]) => `
<div class="module-section">
  <h3>${rec.module} — ${rec.problem}</h3>
  <p style="font-size:13px; color:#374151; margin:0 0 10px">${rec.aiSummary}</p>
  
  <strong style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280">Action Steps</strong>
  ${rec.actions.map(a => `<div class="action-item"><strong>Step ${a.step}:</strong> ${a.action} — ${a.detail} <em style="color:#6b7280">[${a.timing}]</em></div>`).join('')}

  <br/><strong style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280">Recommended Products</strong>
  <table>
    <thead><tr><th>Product</th><th>Brand</th><th>Dosage</th><th>Est. Cost</th></tr></thead>
    <tbody>
      ${rec.products.map(p => `<tr><td>${p.name}</td><td>${p.brand}</td><td>${p.dose}</td><td>${p.costPer}</td></tr>`).join('')}
    </tbody>
  </table>

  <div style="font-size:13px; color:#166534; font-weight:600; margin-top:8px">
    Estimated Cost (per acre): ₹${rec.costEstimate.perAcre.toLocaleString('en-IN')} one-time + ₹${rec.costEstimate.monthly.toLocaleString('en-IN')}/month recurring
  </div>
</div>`).join('')}

<h2>4. Total Cost Summary</h2>
<table>
  <thead><tr><th>Module</th><th>One-Time Cost (per acre)</th></tr></thead>
  <tbody>
    <tr><td>Disease Management (CLCuD)</td><td>₹${hs.costBreakdown.disease.toLocaleString('en-IN')}</td></tr>
    <tr><td>Pest Management (Whitefly)</td><td>₹${hs.costBreakdown.pest.toLocaleString('en-IN')}</td></tr>
    <tr><td>Nutrient Correction (N + Zn)</td><td>₹${hs.costBreakdown.nutrient.toLocaleString('en-IN')}</td></tr>
    <tr><td>Irrigation (this cycle)</td><td>₹${hs.costBreakdown.irrigation.toLocaleString('en-IN')}</td></tr>
    <tr><td>Weather Advisory (preventive)</td><td>₹${hs.costBreakdown.weather.toLocaleString('en-IN')}</td></tr>
  </tbody>
</table>
<div class="cost-total">Total Estimated Investment: ₹${hs.totalEstimatedCost.toLocaleString('en-IN')} / acre &nbsp;·&nbsp; 4.2 Acres Total: ₹${(hs.totalEstimatedCost * 4.2).toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>

<h2>5. Sensor Readings at Report Time</h2>
<table>
  <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>Soil Moisture</td><td>${SENSOR_READINGS.soilMoisture}%</td></tr>
    <tr><td>Soil Temperature</td><td>${SENSOR_READINGS.soilTemperature}°C</td></tr>
    <tr><td>Soil pH</td><td>${SENSOR_READINGS.soilPH}</td></tr>
    <tr><td>Soil EC</td><td>${SENSOR_READINGS.soilEC} dS/m</td></tr>
    <tr><td>Air Temperature</td><td>${SENSOR_READINGS.airTemp}°C</td></tr>
    <tr><td>Air Humidity</td><td>${SENSOR_READINGS.airHumidity}%</td></tr>
    <tr><td>Rainfall (7 days)</td><td>${SENSOR_READINGS.rainfall7d} mm</td></tr>
    <tr><td>Wind Speed</td><td>${SENSOR_READINGS.windSpeed} km/h</td></tr>
    <tr><td>Nitrogen Index</td><td>${SENSOR_READINGS.nitrogenIndex}/100</td></tr>
  </tbody>
</table>

<div class="footer">
  Report generated by Kisan AI · Smart Farming Assistant · SIH 2024<br/>
  ${FARM_INFO.name} · ${FARM_INFO.location} · Generated on ${reportDate}
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FarmReport_${FARM_INFO.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={reportRef}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <FileText size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--brand)' }} />
              Complete Farm Analysis Report
            </h1>
            <p className="page-subtitle">
              <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
              {FARM_INFO.name} · {FARM_INFO.cropShort} · Generated {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={handlePrint} id="print-report-btn">
              <Printer size={15} /> Print
            </button>
            <button className="btn btn-primary" onClick={handleDownload} id="download-report-btn">
              <Download size={15} /> Download Report
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Health Score + Drawbacks ── */}
      <div className="grid-12 mb-5">
        {/* Score Ring */}
        <div className="col-4">
          <div className="module-panel" style={{ height: '100%' }}>
            <div className="module-panel-header">
              <div className="module-panel-title">
                <Target size={16} style={{ color: 'var(--brand)' }} />
                Overall Farm Health Score
              </div>
            </div>
            <div className="module-panel-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px' }}>
              <ScoreRing score={hs.overall} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--red-600)', marginBottom: 4 }}>{hs.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Composite score across all modules</div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {hs.modules.map(m => (
                  <div key={m.name} className="meter-wrap">
                    <div className="meter-header">
                      <span className="meter-label" style={{ fontSize: 12 }}>{m.name}</span>
                      <span className="meter-value" style={{ fontSize: 12 }}>{m.score}/100</span>
                    </div>
                    <div className="meter-bar" style={{ height: 6 }}>
                      <div
                        className={`meter-fill ${m.status === 'critical' ? 'red' : m.status === 'warning' ? 'amber' : 'green'}`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drawbacks */}
        <div className="col-8">
          <div className="module-panel" style={{ height: '100%' }}>
            <div className="module-panel-header">
              <div className="module-panel-title">
                <TrendingDown size={16} style={{ color: 'var(--red-500)' }} />
                Issues &amp; Drawbacks — Summary
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="status-badge critical"><span className="status-badge-dot" />{hs.drawbacks.filter(d => d.severity === 'critical').length} Critical</span>
                <span className="status-badge warning"><span className="status-badge-dot" />{hs.drawbacks.filter(d => d.severity === 'warning').length} Warnings</span>
              </div>
            </div>
            <div className="module-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hs.drawbacks.map((d, i) => {
                const c = severityConfig[d.severity];
                const { Icon } = c;
                return (
                  <div key={i} style={{
                    background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: 'var(--radius-lg)', padding: '12px 14px',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <Icon size={16} style={{ color: c.iconColor, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{d.title}</span>
                        <StatusBadge type={c.badgeType}>{d.severity.charAt(0).toUpperCase() + d.severity.slice(1)}</StatusBadge>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '3px 0' }}>{d.impact}</p>
                      <div style={{ fontSize: 12, color: 'var(--brand-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle2 size={12} /> {d.action}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Cost Summary ── */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <IndianRupee size={16} style={{ color: 'var(--green-600)' }} />
            Total Investment Required — All Modules
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-text)' }}>
            ₹{hs.totalEstimatedCost.toLocaleString('en-IN')} / acre
          </div>
        </div>
        <div className="module-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Disease Control', cost: hs.costBreakdown.disease, color: 'var(--red-600)', bg: 'var(--red-50)', border: 'var(--red-200)', icon: '🛡️' },
              { label: 'Pest Management', cost: hs.costBreakdown.pest, color: 'var(--orange-700)', bg: 'var(--orange-50)', border: 'var(--orange-200)', icon: '🐛' },
              { label: 'Nutrient Correction', cost: hs.costBreakdown.nutrient, color: 'var(--amber-700)', bg: 'var(--amber-50)', border: 'var(--amber-200)', icon: '🌿' },
              { label: 'Irrigation', cost: hs.costBreakdown.irrigation, color: 'var(--blue-700)', bg: 'var(--blue-50)', border: 'var(--blue-200)', icon: '💧' },
              { label: 'Weather Advisory', cost: hs.costBreakdown.weather, color: 'var(--teal-700)', bg: 'var(--teal-50)', border: 'var(--teal-200)', icon: '⛅' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color, letterSpacing: '-0.5px' }}>₹{item.cost.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 2 }}>per acre</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', background: 'linear-gradient(135deg, var(--green-50), #f0fdf9)',
            border: '1.5px solid var(--green-300)', borderRadius: 'var(--radius-lg)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Farm Investment (4.2 acres)</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>One-time treatment cycle · Excludes recurring monthly costs</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-text)', letterSpacing: '-1px' }}>
                ₹{(hs.totalEstimatedCost * 4.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{hs.totalEstimatedCost.toLocaleString('en-IN')}/acre</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Per-Module AI Recommendations (expandable) ── */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <Sparkles size={16} style={{ color: 'var(--brand)' }} />
            AI Recommendations — All Modules
          </div>
          <StatusBadge type="info">
            {Object.keys(AI_RECOMMENDATIONS).length} modules analyzed
          </StatusBadge>
        </div>
        <div className="module-panel-body" style={{ padding: '16px 20px' }}>
          {Object.entries(MODULE_ICONS).map(([key, cfg]) => {
            const rec = AI_RECOMMENDATIONS[key];
            const isOpen = expandedModule === key;
            const sc = severityConfig[rec.severity] || severityConfig.info;
            const { Icon } = cfg;

            return (
              <div key={key} style={{ marginBottom: 10 }}>
                {/* Module Accordion Header */}
                <div
                  onClick={() => setExpandedModule(isOpen ? null : key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    background: isOpen ? 'var(--green-50)' : 'var(--gray-50)',
                    border: `1.5px solid ${isOpen ? 'var(--green-300)' : 'var(--border-light)'}`,
                    borderRadius: isOpen ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: isOpen ? 'var(--green-100)' : 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} style={{ color: isOpen ? cfg.color : 'var(--text-muted)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{cfg.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{rec.problem}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge type={sc.badgeType}>{rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)}</StatusBadge>
                    <span style={{ fontSize: 12, color: 'var(--brand-text)', fontWeight: 700 }}>₹{rec.costEstimate.perAcre.toLocaleString('en-IN')}/ac</span>
                    {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div style={{
                    border: '1.5px solid var(--green-300)', borderTop: 'none',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    background: 'white', overflow: 'hidden',
                  }}>
                    <AIRecommendationPanel recommendation={rec} defaultOpen={true} compact={false} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 4: Sensor Snapshot ── */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <Activity size={16} style={{ color: 'var(--blue-500)' }} />
            Sensor &amp; Model Snapshot at Report Time
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} /> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="module-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { label: 'Disease Detected', value: DISEASE_DETECTION.disease.split('(')[0].trim(), conf: `${DISEASE_DETECTION.confidence}%`, status: 'critical' },
              { label: 'Pest Identified', value: PEST_DETECTION.pest.split('(')[0].trim(), conf: `${PEST_DETECTION.confidence}%`, status: 'critical' },
              { label: 'Primary Nutrient', value: NUTRIENT_ANALYSIS.primaryDeficiency, conf: `${NUTRIENT_ANALYSIS.confidence}%`, status: 'warning' },
              { label: 'Irrigation Status', value: 'Irrigate Within 24h', conf: 'Sensor', status: 'warning' },
              { label: 'Weather', value: `${WEATHER_CURRENT.temp}°C · ${WEATHER_CURRENT.description}`, conf: 'Live', status: 'info' },
              { label: 'Soil Moisture', value: `${SENSOR_READINGS.soilMoisture}%`, conf: 'Sensor', status: 'warning' },
              { label: 'Air Temperature', value: `${SENSOR_READINGS.airTemp}°C`, conf: 'Sensor', status: 'info' },
              { label: 'N Index', value: `${SENSOR_READINGS.nitrogenIndex}/100`, conf: 'Estimated', status: 'warning' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '12px 14px',
                background: item.status === 'critical' ? 'var(--red-50)' : item.status === 'warning' ? 'var(--amber-50)' : 'var(--blue-50)',
                border: `1px solid ${item.status === 'critical' ? 'var(--red-200)' : item.status === 'warning' ? 'var(--amber-200)' : 'var(--blue-200)'}`,
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence / Source: {item.conf}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download CTA */}
      <div style={{
        textAlign: 'center', padding: '28px 20px',
        background: 'linear-gradient(135deg, var(--green-50), #f0fdf9)',
        border: '1.5px solid var(--green-200)', borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-text)', marginBottom: 6 }}>
          📄 Download Complete Farm Report
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 480, margin: '0 auto 16px' }}>
          Save a full HTML report with all AI recommendations, product lists, cost estimates, and sensor data. Share with your agronomist or extension officer.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={15} /> Print / Save as PDF
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleDownload}>
            <Download size={16} /> Download HTML Report
          </button>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 10 }}>
          Report includes: Health score · All AI recommendations · Products with pricing · Cost summary · Sensor data
        </div>
      </div>
    </div>
  );
}
