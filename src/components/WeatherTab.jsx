import React from 'react';
import {
  CloudSun, Thermometer, Wind, Droplets,
  Eye, Sun, AlertTriangle, Info, CloudRain,
} from 'lucide-react';
import { WEATHER_CURRENT, WEATHER_FORECAST, SENSOR_READINGS } from '../data/mockData';
import { useFieldMapStore } from '../store/fieldMapStore';
import { AI_RECOMMENDATIONS } from '../data/aiRecommendations';
import AIRecommendationPanel from './AIRecommendationPanel';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

export default function WeatherTab() {
  const location = useFieldMapStore(state => state.location);
  const w = WEATHER_CURRENT;
  const s = SENSOR_READINGS;

  const risks = [
    {
      type: w.temp > 35 ? 'critical' : w.temp > 30 ? 'warning' : 'healthy',
      title: 'Heat Stress Risk',
      value: w.temp > 35 ? 'High' : w.temp > 30 ? 'Moderate' : 'Low',
      desc: `Current temp ${w.temp}°C. Cotton boll development sensitive above 35°C.`,
    },
    {
      type: w.humidity > 80 ? 'warning' : 'healthy',
      title: 'Fungal Disease Risk',
      value: w.humidity > 80 ? 'Elevated' : 'Low',
      desc: `Humidity ${w.humidity}%. Leaf wetness ${s.leafWetness}h. Monitor for secondary fungal infections.`,
    },
    {
      type: s.rainfall7d < 10 ? 'warning' : 'healthy',
      title: 'Drought Stress',
      value: s.rainfall7d < 10 ? 'Moderate' : 'Low',
      desc: `7-day rainfall: ${s.rainfall7d} mm. Soil moisture at ${s.soilMoisture}%.`,
    },
    {
      type: w.windSpeed > 30 ? 'warning' : 'healthy',
      title: 'Spray Conditions',
      value: w.windSpeed < 15 ? 'Favorable' : 'Marginal',
      desc: `Wind ${w.windSpeed} km/h. ${w.windDir} direction. Optimal spraying: <15 km/h.`,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <CloudSun size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
          Weather &amp; Environmental Risk
        </h1>
        <p className="page-subtitle">Real-time weather data and crop risk assessment for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Current Weather */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <CloudSun size={16} style={{ color: 'var(--teal-500)' }} />
            Current Conditions — {location.name || 'Selected Field Location'}
          </div>
          <StatusBadge type="info">Live</StatusBadge>
        </div>
        <div className="module-panel-body">
          <div className="weather-row">
            {/* Current temp */}
            <div className="weather-current">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 64 }}>{w.icon}</div>
                <div>
                  <div className="weather-temp-big">{w.temp}°</div>
                  <div className="weather-desc">{w.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>Feels like {w.feelsLike}°C</div>
                </div>
              </div>
              <div className="weather-stats">
                {[
                  { icon: <Droplets size={14} />, label: 'Humidity', value: `${w.humidity}%` },
                  { icon: <Wind size={14} />, label: 'Wind', value: `${w.windSpeed} km/h ${w.windDir}` },
                  { icon: <Eye size={14} />, label: 'Visibility', value: `${w.visibility} km` },
                  { icon: <Sun size={14} />, label: 'UV Index', value: `${w.uvIndex} (High)` },
                  { icon: <Thermometer size={14} />, label: 'Dew Point', value: `${w.dewPoint}°C` },
                  { icon: <CloudRain size={14} />, label: 'Rain (24h)', value: `${w.rainfall24h} mm` },
                ].map(item => (
                  <div key={item.label} className="weather-stat">
                    <span style={{ color: 'var(--text-faint)' }}>{item.icon}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: 1, background: 'var(--border-light)', margin: '0 8px', flexShrink: 0 }} />

            {/* 5-day forecast */}
            <div className="weather-forecast" style={{ flex: 1 }}>
              <div className="section-heading">5-Day Forecast</div>
              {WEATHER_FORECAST.map(day => (
                <div key={day.day} className="forecast-day">
                  <span className="forecast-day-name">{day.day}</span>
                  <span className="forecast-icon">{day.icon}</span>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>{day.condition}</span>
                  <span className="forecast-range">{day.high}° / {day.low}°</span>
                  <span className="forecast-rain">{day.rain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <AlertTriangle size={16} style={{ color: 'var(--amber-500)' }} />
            Crop Risk Assessment
          </div>
        </div>
        <div className="module-panel-body">
          <div className="grid-2">
            {risks.map(risk => (
              <div key={risk.title} style={{
                padding: '14px 16px',
                background: risk.type === 'critical' ? 'var(--red-50)' : risk.type === 'warning' ? 'var(--amber-50)' : 'var(--green-50)',
                border: `1px solid ${risk.type === 'critical' ? 'var(--red-200)' : risk.type === 'warning' ? 'var(--amber-200)' : 'var(--green-200)'}`,
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{risk.title}</div>
                  <StatusBadge type={risk.type === 'healthy' ? 'healthy' : risk.type === 'warning' ? 'warning' : 'critical'}>
                    {risk.value}
                  </StatusBadge>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{risk.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory */}
      <div className="module-panel">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <Info size={16} style={{ color: 'var(--blue-500)' }} />
            Weather-Based Farm Advisory
          </div>
        </div>
        <div className="module-panel-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🌧', title: 'Delay pesticide spraying until Sunday', desc: '70% rain probability on Saturday. Spraying before rain reduces efficacy significantly. Wait for dry conditions.' },
              { icon: '💧', title: 'Irrigate Friday evening', desc: 'No significant rain until Saturday. Current soil moisture approaching lower threshold. Evening irrigation (less evaporation) recommended.' },
              { icon: '🌡️', title: 'Monitor for heat stress', desc: 'Temperature forecast 30–31°C over next 5 days. Currently within safe range for Bt cotton boll development.' },
              { icon: '🌿', title: 'Favorable spray window: Tuesday–Wednesday', desc: 'Clear skies, wind <15 km/h, humidity stable. Optimal for pesticide and fertilizer foliar application.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--gray-50)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* AI Recommendation Panel */}
      <AIRecommendationPanel recommendation={AI_RECOMMENDATIONS.weather} />
    </div>
  );
}
