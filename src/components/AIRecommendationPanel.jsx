import React, { useState } from 'react';
import {
  Sparkles, ChevronDown, ChevronUp, CheckCircle2,
  AlertTriangle, AlertOctagon, Info, Package,
  IndianRupee, Clock, Zap, ExternalLink,
} from 'lucide-react';

const priorityStyle = {
  critical: { bg: 'var(--red-50)', border: 'var(--red-200)', color: 'var(--red-700)', icon: <AlertOctagon size={14} /> },
  warning: { bg: 'var(--amber-50)', border: 'var(--amber-200)', color: 'var(--amber-700)', icon: <AlertTriangle size={14} /> },
  info: { bg: 'var(--blue-50)', border: 'var(--blue-200)', color: 'var(--blue-600)', icon: <Info size={14} /> },
};

/**
 * AIRecommendationPanel — reusable panel for per-module AI recommendations
 * Props:
 *   recommendation — object from AI_RECOMMENDATIONS[moduleKey]
 *   defaultOpen    — boolean, whether expanded by default
 *   compact        — boolean, show compact version without full product table
 */
export default function AIRecommendationPanel({ recommendation, defaultOpen = true, compact = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeSection, setActiveSection] = useState('actions');
  const rec = recommendation;

  if (!rec) return null;

  const totalCost = rec.costEstimate?.breakdown?.reduce((a, b) => a + b.cost, 0) || 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf9 0%, #f5f9ff 100%)',
      border: '1.5px solid var(--green-300)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      marginTop: 20,
    }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer',
          background: 'linear-gradient(90deg, var(--green-600), var(--emerald-600))',
          userSelect: 'none',
        }}
        onClick={() => setOpen(!open)}
      >
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={18} style={{ color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.2px' }}>
            AI Recommendations · {rec.module}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
            {rec.actions.length} actions · {rec.products.length} products · Est. ₹{totalCost.toLocaleString('en-IN')}/acre
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {open && (
        <div style={{ padding: '20px' }}>
          {/* AI Summary */}
          <div style={{
            padding: '12px 16px', marginBottom: 16,
            background: 'white', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', gap: 10,
          }}>
            <Sparkles size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              {rec.aiSummary}
            </p>
          </div>

          {/* Section Tabs */}
          {!compact && (
            <div className="pill-group" style={{ marginBottom: 16 }}>
              {[
                { id: 'actions', label: `Actions (${rec.actions.length})` },
                { id: 'products', label: `Products (${rec.products.length})` },
                { id: 'cost', label: 'Cost Estimate' },
              ].map(s => (
                <button
                  key={s.id}
                  className={`pill-option ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {(activeSection === 'actions' || compact) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: compact ? 0 : 4 }}>
              {(compact ? rec.actions.slice(0, 3) : rec.actions).map(action => {
                const ps = priorityStyle[action.priority] || priorityStyle.info;
                return (
                  <div key={action.step} style={{
                    background: ps.bg, border: `1px solid ${ps.border}`,
                    borderRadius: 'var(--radius-lg)', padding: '12px 14px',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: ps.border, color: ps.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 11, flexShrink: 0,
                    }}>
                      {action.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{action.action}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: ps.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {ps.icon} {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} /> {action.timing}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>{action.detail}</p>
                    </div>
                  </div>
                );
              })}
              {compact && rec.actions.length > 3 && (
                <div style={{ fontSize: 12, color: 'var(--brand-text)', textAlign: 'center', padding: '6px', fontWeight: 600 }}>
                  +{rec.actions.length - 3} more actions in Farm Report →
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {activeSection === 'products' && !compact && (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Dosage</th>
                    <th>Cost</th>
                    <th>Usage / Acre</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.products.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        <Package size={13} style={{ display: 'inline', marginRight: 6, color: 'var(--brand)' }} />
                        {p.name}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{p.brand}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.dose}</td>
                      <td style={{ color: 'var(--green-700)', fontWeight: 700 }}>{p.costPer}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.usagePerAcre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cost Estimate */}
          {activeSection === 'cost' && !compact && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'One-time Cost', value: `₹${rec.costEstimate.oneTime.toLocaleString('en-IN')}`, sub: 'per acre', color: 'var(--red-600)', bg: 'var(--red-50)', border: 'var(--red-200)' },
                  { label: 'Monthly Recurring', value: `₹${rec.costEstimate.monthly.toLocaleString('en-IN')}`, sub: 'per acre/month', color: 'var(--amber-700)', bg: 'var(--amber-50)', border: 'var(--amber-200)' },
                  { label: 'Total (4.2 acres)', value: `₹${(rec.costEstimate.perAcre * 4.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'this treatment cycle', color: 'var(--brand-text)', bg: 'var(--green-50)', border: 'var(--green-200)' },
                ].map(item => (
                  <div key={item.label} style={{
                    flex: 1, minWidth: 140,
                    background: item.bg, border: `1px solid ${item.border}`,
                    borderRadius: 'var(--radius-lg)', padding: '14px 16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: item.color, letterSpacing: '-0.5px' }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="section-heading">Cost Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rec.costEstimate.breakdown.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'white', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.item}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      <IndianRupee size={12} style={{ display: 'inline' }} />{item.cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--green-50)', border: '1px solid var(--green-300)', borderRadius: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--brand-text)' }}>Total Estimated</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--brand-text)' }}>
                    <IndianRupee size={13} style={{ display: 'inline' }} />{totalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
