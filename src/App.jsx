import React, { useState, useEffect } from 'react';
import {
  Sprout, Bell, RefreshCw, Settings, ChevronDown,
  LayoutDashboard, ShieldAlert, Bug, Sparkles,
  Droplets, CloudSun, AlertTriangle, History,
  Camera, MapPin, CalendarDays, FileText,
} from 'lucide-react';
import OverviewTab from './components/OverviewTab';
import DiseaseTab from './components/DiseaseTab';
import PestTab from './components/PestTab';
import NutrientTab from './components/NutrientTab';
import IrrigationTab from './components/IrrigationTab';
import WeatherTab from './components/WeatherTab';
import AlertsTab from './components/AlertsTab';
import AnalysisTab from './components/AnalysisTab';
import FarmReportTab from './components/FarmReportTab';
import LiveDashboardTab from './components/LiveDashboardTab';
import FieldMapTab from './components/FieldMapTab';
import { FARM_INFO, ALERTS, SENSOR_READINGS, WEATHER_CURRENT, DETECTION_HISTORY } from './data/mockData';
import { useFieldMapStore } from './store/fieldMapStore';
import { getLocalDetections, fetchAllDetections, isFirebaseConfigured } from './services/storageService';
import LanguageSelector from './components/LanguageSelector';
import { useLanguage } from './i18n/LanguageContext';

const TABS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fieldmap', label: 'Field Map', icon: MapPin },
  { id: 'disease', label: 'Disease', icon: ShieldAlert, badge: '1', badgeType: 'critical' },
  { id: 'pest', label: 'Pests', icon: Bug, badge: '1', badgeType: 'critical' },
  { id: 'nutrient', label: 'Nutrients', icon: Sparkles, badge: '1', badgeType: 'warn' },
  { id: 'irrigation', label: 'Irrigation', icon: Droplets },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: String(ALERTS.filter(a => a.type === 'critical').length), badgeType: 'critical' },
  { id: 'analysis', label: 'Image Analysis', icon: Camera },
  { id: 'live', label: 'Live Stream', icon: Sparkles, badge: 'Live', badgeType: 'warn' },
  { id: 'history', label: 'History', icon: History },
  { id: 'report', label: 'Farm Report', icon: FileText },
];

export default function App() {
  const { t, currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
    }
    return 'overview';
  });
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  const [dataTick, setDataTick] = useState(0); // Forces re-render
  const fieldLocation = useFieldMapStore(state => state.location);

  // Sync activeTab with URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url);
    }
  }, [activeTab]);

  useEffect(() => {
    // Global fetch for sensor data to populate across all tabs
    const fetchSensors = async () => {
      try {
        const configuredApi = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const API_BASE = configuredApi || (isLocalhost ? 'http://localhost:8001' : '');
        if (!API_BASE) return;

        const res = await fetch(`${API_BASE}/gsheet/latest`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          let changed = false;
          if (data && data.data) {
            if (data.data.Temperature) {
              SENSOR_READINGS.airTemp = data.data.Temperature;
              WEATHER_CURRENT.temp = data.data.Temperature;
              changed = true;
            }
            if (data.data.Humidity) {
              SENSOR_READINGS.airHumidity = data.data.Humidity;
              WEATHER_CURRENT.humidity = data.data.Humidity;
              changed = true;
            }
            if (data.data.Average) {
              SENSOR_READINGS.soilMoisture = data.data.Average;
              changed = true;
            }
          }
          if (changed) {
             setLastRefresh(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
             setDataTick(t => t + 1); // Trigger React re-render
          }
        }
      } catch (e) {
        console.warn("Global sensor sync unavailable:", e.message);
      }
    };
    fetchSensors();
    const interval = setInterval(fetchSensors, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab setActiveTab={setActiveTab} />;
      case 'fieldmap': return <FieldMapTab />;
      case 'disease': return <DiseaseTab />;
      case 'pest': return <PestTab />;
      case 'nutrient': return <NutrientTab />;
      case 'irrigation': return <IrrigationTab />;
      case 'weather': return <WeatherTab />;
      case 'alerts': return <AlertsTab />;
      case 'analysis': return <AnalysisTab />;
      case 'live': return <LiveDashboardTab />;
      case 'history': return <HistoryTab />;
      case 'report': return <FarmReportTab />;
      default: return <OverviewTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-wrapper">
      {/* ── HEADER ── */}
      <header className="site-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">
              <Sprout size={20} />
            </div>
            <div>
              <div className="brand-name">{t('brand.name', 'Kisan AI')}</div>
              <div className="brand-tagline">{t('brand.tagline', 'Smart Farming Assistant')}</div>
            </div>
          </div>

          <div className="header-divider" />

          <button className="header-farm-selector">
            <span className="farm-dot" />
            <MapPin size={13} />
            <span className="truncate">{fieldLocation?.name || FARM_INFO.name}</span>
            <ChevronDown size={13} />
          </button>

          <div className="header-spacer" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-faint)' }}>
            <CalendarDays size={13} />
            <span style={{ display: 'none', whiteSpace: 'nowrap' }} className="hide-mobile">
              {FARM_INFO.growthStage} · {t('brand.day', 'Day')} {FARM_INFO.daysAfterSowing}
            </span>
          </div>

          <div className="header-actions">
            <LanguageSelector />

            <div className="connection-chip demo">
              <span className="status-dot demo" />
              {t('brand.demoMode', 'Demo Mode')}
            </div>

            <button className="icon-btn" title="Refresh data">
              <RefreshCw size={15} />
            </button>

            <button className="icon-btn" title={`${ALERTS.length} alerts`} style={{ position: 'relative' }}>
              <Bell size={15} />
              <span className="notif-badge">{ALERTS.filter(a => a.type === 'critical').length}</span>
            </button>

            <button className="icon-btn" title="Settings">
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── NAV TABS ── */}
      <nav className="nav-tabs-bar" role="navigation" aria-label="Dashboard sections">
        <div className="nav-tabs-inner">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const tabLabel = t(`nav.${tab.id}`, tab.label);
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={activeTab === tab.id}
                role="tab"
                id={`tab-${tab.id}`}
              >
                <Icon size={15} className="nav-tab-icon" />
                {tabLabel}
                {tab.badge && (
                  <span className={`nav-tab-badge ${tab.badgeType === 'warn' ? 'warn' : ''}`}>
                    {tab.badge === 'Live' ? t('brand.live', 'Live') : tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content" role="main" aria-labelledby={`tab-${activeTab}`}>
        <div className="anim-fade-up" key={activeTab}>
          {renderTab()}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--text-faint)',
      }}>
        <span>Kisan AI · Smart Farming Assistant · SIH 2024</span>
        <span>Last refreshed: {lastRefresh} · {FARM_INFO.location}</span>
      </footer>
    </div>
  );
}

/* ── Inline History Tab (simple, no separate file needed) ── */

function HistoryTab() {
  const [filter, setFilter] = useState('All');
  const [records, setRecords] = useState(() => getLocalDetections());
  const types = ['All', 'Disease', 'Pest', 'Nutrient'];

  useEffect(() => {
    fetchAllDetections().then(data => {
      if (data && data.length > 0) setRecords(data);
    });

    const onDetectionsUpdated = (e) => {
      if (e.detail) setRecords(e.detail);
    };
    window.addEventListener('kisan_detections_updated', onDetectionsUpdated);
    return () => window.removeEventListener('kisan_detections_updated', onDetectionsUpdated);
  }, []);

  const filtered = filter === 'All'
    ? records
    : records.filter(r => r.module === filter);

  const statusColor = {
    'Action Required': 'critical',
    'In Progress': 'warning',
    'Resolved': 'healthy',
  };

  const moduleColor = {
    'Disease': 'critical',
    'Pest': 'orange',
    'Nutrient': 'info',
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title">Detection History</h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '12px',
                background: isFirebaseConfigured() ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                color: isFirebaseConfigured() ? '#10b981' : '#3b82f6',
                border: isFirebaseConfigured() ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                {isFirebaseConfigured() ? '☁️ Cloud Firestore Active' : '💾 Persistent Storage Active'}
              </span>
            </div>
            <p className="page-subtitle">Real-time synchronized plant pathology and field detection records ({records.length} stored)</p>
          </div>
          <div className="pill-group">
            {types.map(t => (
              <button
                key={t}
                className={`pill-option ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="module-panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Module</th>
                <th>Detection Result</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{row.id}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td>
                    <span className={`status-badge ${moduleColor[row.module] || 'neutral'}`}>
                      <span className="status-badge-dot" />
                      {row.module}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.result}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="confidence-bar" style={{ width: '60px' }}>
                        <div
                          className={`confidence-fill ${row.confidence > 80 ? 'green' : row.confidence > 60 ? 'amber' : 'crit'}`}
                          style={{ width: `${row.confidence}%` }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-text)' }}>{row.confidence}%</span>
                    </div>
                  </td>
                  <td>
                    {row.severity ? (
                      <span className={`status-badge ${row.severity === 'High' ? 'critical' : 'warning'}`}>
                        {row.severity}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${statusColor[row.status] || 'neutral'}`}>
                      <span className="status-badge-dot" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
