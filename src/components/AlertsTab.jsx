import React, { useState } from 'react';
import {
  AlertTriangle, AlertOctagon, Info, Bell,
  CheckCircle2, Filter, Clock,
} from 'lucide-react';
import { ALERTS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

export default function AlertsTab() {
  const { t, currentLanguage } = useLanguage();
  const [filter, setFilter] = useState('All');

  const types = [
    { id: 'All', label: t('alerts.allAlerts', 'All') },
    { id: 'Critical', label: t('alerts.critical', 'Critical') },
    { id: 'Warning', label: t('alerts.warning', 'Warning') },
    { id: 'Info', label: t('alerts.info', 'Info') },
  ];

  const filtered = filter === 'All'
    ? ALERTS
    : ALERTS.filter(a => a.type === filter.toLowerCase());

  const colorMap = {
    critical: { border: 'var(--red-200)', bg: 'var(--red-50)', badgeType: 'critical', Icon: AlertOctagon, color: 'var(--red-600)' },
    warning: { border: 'var(--amber-200)', bg: 'var(--amber-50)', badgeType: 'warning', Icon: AlertTriangle, color: 'var(--amber-600)' },
    info: { border: 'var(--blue-200)', bg: 'var(--blue-50)', badgeType: 'info', Icon: Info, color: 'var(--blue-600)' },
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <Bell size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--red-500)' }} />
              {t('alerts.title', 'Alerts & Recommendations')}
            </h1>
            <p className="page-subtitle">{t('alerts.subtitle', 'All active alerts from AI modules and sensor monitoring')}</p>
          </div>
          <div className="pill-group">
            {types.map(tOption => (
              <button
                key={tOption.id}
                className={`pill-option ${filter === tOption.id ? 'active' : ''}`}
                onClick={() => setFilter(tOption.id)}
              >
                {tOption.label}
                {tOption.id !== 'All' && (
                  <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 800 }}>
                    ({ALERTS.filter(a => a.type === tOption.id.toLowerCase()).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Critical', count: ALERTS.filter(a => a.type === 'critical').length, color: 'var(--red-500)', bg: 'var(--red-50)', border: 'var(--red-200)' },
          { label: 'Warnings', count: ALERTS.filter(a => a.type === 'warning').length, color: 'var(--amber-600)', bg: 'var(--amber-50)', border: 'var(--amber-200)' },
          { label: 'Information', count: ALERTS.filter(a => a.type === 'info').length, color: 'var(--blue-600)', bg: 'var(--blue-50)', border: 'var(--blue-200)' },
          { label: 'Total Active', count: ALERTS.length, color: 'var(--text-primary)', bg: 'var(--gray-50)', border: 'var(--border-medium)' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, minWidth: 120,
            background: item.bg, border: `1px solid ${item.border}`,
            borderRadius: 'var(--radius-lg)', padding: '14px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: item.color, letterSpacing: '-1px' }}>{item.count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Alert Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(alert => {
          const c = colorMap[alert.type];
          const { Icon } = c;
          return (
            <div key={alert.id} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 'var(--radius-xl)', padding: '16px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${c.border}` }}>
                <Icon size={18} style={{ color: c.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{alert.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <StatusBadge type={c.badgeType}>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</StatusBadge>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> {alert.time}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{alert.desc}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Module: {alert.module}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--green-400)', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>No {filter} alerts</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>All clear in this category</div>
          </div>
        )}
      </div>
    </div>
  );
}
