import React from 'react';
import {
  ShieldAlert, Bug, Sparkles, Droplets, CloudSun,
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  TrendingUp, Activity, MapPin, Leaf, CalendarDays,
  AlertOctagon, Info, ChevronRight,
} from 'lucide-react';
import {
  FARM_INFO, SENSOR_READINGS, DISEASE_DETECTION,
  PEST_DETECTION, NUTRIENT_ANALYSIS, IRRIGATION_STATUS,
  WEATHER_CURRENT, ALERTS,
} from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

function HeroCard({ icon, label, value, meta, statusClass, iconClass, onClick }) {
  return (
    <div className={`hero-card status-${statusClass}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={`hero-card-icon ${iconClass}`}>
        {icon}
      </div>
      <div className="hero-card-content">
        <div className="hero-card-label">{label}</div>
        <div className="hero-card-value">{value}</div>
        <div className="hero-card-meta">{meta}</div>
      </div>
    </div>
  );
}

export default function OverviewTab({ setActiveTab }) {
  const { t } = useLanguage();
  const criticalAlerts = ALERTS.filter(a => a.type === 'critical');
  const warningAlerts = ALERTS.filter(a => a.type === 'warning');

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('nav.overview', 'Farm Overview')}</h1>
            <p className="page-subtitle">
              <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
              {FARM_INFO.location} · {FARM_INFO.cropShort} · {FARM_INFO.growthStage} · {t('brand.day', 'Day')} {FARM_INFO.daysAfterSowing}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusBadge type="warning">2 {t('nav.alerts', 'Alerts')}</StatusBadge>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
              Updated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="hero-grid mb-5">
        <HeroCard
          icon={<ShieldAlert size={22} />}
          label={t('nav.disease', 'Crop Disease')}
          value={DISEASE_DETECTION.disease.split('(')[0].trim()}
          meta={<><AlertOctagon size={12} style={{ color: 'var(--red-500)' }} /> {DISEASE_DETECTION.confidence}% confidence · Moderate severity</>}
          statusClass="critical"
          iconClass="icon-red"
          onClick={() => setActiveTab('disease')}
        />
        <HeroCard
          icon={<Bug size={22} />}
          label={t('nav.pest', 'Pest Detection')}
          value="Whitefly Detected"
          meta={<><AlertOctagon size={12} style={{ color: 'var(--red-500)' }} /> {PEST_DETECTION.confidence}% confidence · High pressure</>}
          statusClass="critical"
          iconClass="icon-red"
          onClick={() => setActiveTab('pest')}
        />
        <HeroCard
          icon={<Sparkles size={22} />}
          label={t('nav.nutrient', 'Nutrient Status')}
          value="N Deficiency"
          meta={<><AlertTriangle size={12} style={{ color: 'var(--amber-500)' }} /> Nitrogen index: {SENSOR_READINGS.nitrogenIndex}/100 · Top-dress needed</>}
          statusClass="warning"
          iconClass="icon-amber"
          onClick={() => setActiveTab('nutrient')}
        />
        <HeroCard
          icon={<Droplets size={22} />}
          label={t('nav.irrigation', 'Irrigation')}
          value="Irrigate Soon"
          meta={<><Clock size={12} /> Within 24h · Moisture {SENSOR_READINGS.soilMoisture}% · ETc {IRRIGATION_STATUS.cropWaterRequirement} mm/day</>}
          statusClass="warning"
          iconClass="icon-blue"
          onClick={() => setActiveTab('irrigation')}
        />
        <HeroCard
          icon={<CloudSun size={22} />}
          label={t('nav.weather', 'Weather Risk')}
          value={`${WEATHER_CURRENT.temp}°C · ${WEATHER_CURRENT.description}`}
          meta={<><Info size={12} /> Humidity {WEATHER_CURRENT.humidity}% · Rain Sat (70%)</>}
          statusClass="info"
          iconClass="icon-teal"
          onClick={() => setActiveTab('weather')}
        />
        <HeroCard
          icon={<Activity size={22} />}
          label="Overall Farm Health"
          value="Needs Attention"
          meta={<><AlertTriangle size={12} style={{ color: 'var(--amber-500)' }} /> {criticalAlerts.length} critical · {warningAlerts.length} warnings active</>}
          statusClass="warning"
          iconClass="icon-orange"
        />
      </div>

      {/* Main Grid */}
      <div className="grid-12 mb-5">
        {/* Alerts Panel */}
        <div className="col-7">
          <div className="module-panel">
            <div className="module-panel-header">
              <div className="module-panel-title">
                <AlertTriangle size={16} style={{ color: 'var(--red-500)' }} />
                Active Alerts &amp; Recommendations
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('alerts')}>
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="module-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALERTS.slice(0, 4).map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>

        {/* Sensor Readings Panel */}
        <div className="col-5">
          <div className="module-panel">
            <div className="module-panel-header">
              <div className="module-panel-title">
                <Activity size={16} style={{ color: 'var(--blue-500)' }} />
                Live Sensor Readings
              </div>
              <StatusBadge type="healthy">Live</StatusBadge>
            </div>
            <div className="module-panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <SensorChip label="Soil Moisture" value={SENSOR_READINGS.soilMoisture} unit="%" warn={SENSOR_READINGS.soilMoisture < 40} />
                <SensorChip label="Soil Temp" value={SENSOR_READINGS.soilTemperature} unit="°C" />
                <SensorChip label="Air Temp" value={SENSOR_READINGS.airTemp} unit="°C" />
                <SensorChip label="Humidity" value={SENSOR_READINGS.airHumidity} unit="%" />
                <SensorChip label="Soil pH" value={SENSOR_READINGS.soilPH} unit="" />
                <SensorChip label="Soil EC" value={SENSOR_READINGS.soilEC} unit="dS/m" />
                <SensorChip label="Rainfall (7d)" value={SENSOR_READINGS.rainfall7d} unit="mm" />
                <SensorChip label="Wind Speed" value={SENSOR_READINGS.windSpeed} unit="km/h" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Info + Quick Actions */}
      <div className="grid-2">
        {/* Crop Details */}
        <div className="module-panel">
          <div className="module-panel-header">
            <div className="module-panel-title">
              <Leaf size={16} style={{ color: 'var(--green-600)' }} />
              Crop Information
            </div>
          </div>
          <div className="module-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
              {[
                ['Crop', FARM_INFO.cropShort],
                ['Scientific Name', 'G. hirsutum (Bt)'],
                ['Season', FARM_INFO.season],
                ['Sowing Date', FARM_INFO.sowingDate],
                ['Growth Stage', FARM_INFO.growthStage],
                ['Days After Sowing', `${FARM_INFO.daysAfterSowing} days`],
                ['Plot Area', FARM_INFO.area],
                ['Location', FARM_INFO.location],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="module-panel">
          <div className="module-panel-header">
            <div className="module-panel-title">
              <TrendingUp size={16} style={{ color: 'var(--brand)' }} />
              Quick Actions
            </div>
          </div>
          <div className="module-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Analyze New Crop Image', desc: 'Upload a photo for instant AI diagnosis', tab: 'analysis', color: 'var(--green-600)', bg: 'var(--green-50)', icon: '📷' },
              { label: 'View Disease Management Plan', desc: 'Full CLCuD treatment protocol', tab: 'disease', color: 'var(--red-600)', bg: 'var(--red-50)', icon: '🛡️' },
              { label: 'Pest Control Schedule', desc: 'Whitefly control action steps', tab: 'pest', color: 'var(--orange-600)', bg: 'var(--orange-50)', icon: '🐛' },
              { label: 'Plan Irrigation', desc: 'Soil moisture & drip schedule', tab: 'irrigation', color: 'var(--blue-600)', bg: 'var(--blue-50)', icon: '💧' },
              { label: 'Apply Fertilizer (N fix)', desc: 'Urea top-dress protocol', tab: 'nutrient', color: 'var(--amber-700)', bg: 'var(--amber-50)', icon: '🌿' },
            ].map(item => (
              <button
                key={item.tab}
                className="btn btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid var(--border-light)`,
                  background: item.bg,
                  width: '100%',
                  gap: 12,
                }}
                onClick={() => setActiveTab(item.tab)}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const colorMap = {
    critical: { border: 'var(--red-200)', bg: 'var(--red-50)', iconColor: 'var(--red-600)' },
    warning: { border: 'var(--amber-200)', bg: 'var(--amber-50)', iconColor: 'var(--amber-600)' },
    info: { border: 'var(--blue-200)', bg: 'var(--blue-50)', iconColor: 'var(--blue-600)' },
  };
  const c = colorMap[alert.type] || colorMap.info;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ marginTop: 2, color: c.iconColor, flexShrink: 0 }}>
        {alert.type === 'critical' ? <AlertOctagon size={16} /> : alert.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{alert.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.desc}</div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>{alert.time}</span>
    </div>
  );
}

function SensorChip({ label, value, unit, warn }) {
  return (
    <div style={{
      background: warn ? 'var(--amber-50)' : 'var(--gray-50)',
      border: `1px solid ${warn ? 'var(--amber-200)' : 'var(--border-light)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: warn ? 'var(--amber-700)' : 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
        {value}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}
