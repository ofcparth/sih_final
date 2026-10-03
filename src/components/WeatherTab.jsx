import React from 'react';
import {
  CloudSun, Thermometer, Wind, Droplets,
  Eye, Sun, AlertTriangle, Info, CloudRain,
} from 'lucide-react';
import { WEATHER_CURRENT, WEATHER_FORECAST, SENSOR_READINGS } from '../data/mockData';
import { useFieldMapStore } from '../store/fieldMapStore';
import { AI_RECOMMENDATIONS } from '../data/aiRecommendations';
import AIRecommendationPanel from './AIRecommendationPanel';
import { useLanguage } from '../i18n/LanguageContext';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

export default function WeatherTab() {
  const { t, currentLanguage } = useLanguage();
  const location = useFieldMapStore(state => state.location);
  const w = WEATHER_CURRENT;
  const s = SENSOR_READINGS;

  const localeMap = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    pa: 'pa-IN',
    bn: 'bn-IN',
    en: 'en-IN'
  };
  const activeLocale = localeMap[currentLanguage] || 'en-IN';
  const formattedDate = new Date().toLocaleDateString(activeLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const risks = [
    {
      type: w.temp > 35 ? 'critical' : w.temp > 30 ? 'warning' : 'healthy',
      title: t('weather.heatStressRisk', 'Heat Stress Risk'),
      value: w.temp > 35 ? t('common.high', 'High') : w.temp > 30 ? t('common.moderate', 'Moderate') : t('common.low', 'Low'),
      desc: `${t('weather.heatStressDesc', 'Development sensitive above 35°C.')} (${w.temp}°C)`,
    },
    {
      type: w.humidity > 80 ? 'warning' : 'healthy',
      title: t('weather.fungalDiseaseRisk', 'Fungal Disease Risk'),
      value: w.humidity > 80 ? t('common.elevated', 'Elevated') : t('common.low', 'Low'),
      desc: `${t('weather.fungalDiseaseDesc', 'High relative humidity favors spore germination and secondary fungal pathogens.')} (${w.humidity}%)`,
    },
    {
      type: s.rainfall7d < 10 ? 'warning' : 'healthy',
      title: t('weather.droughtStress', 'Drought Stress'),
      value: s.rainfall7d < 10 ? t('common.moderate', 'Moderate') : t('common.low', 'Low'),
      desc: `${t('weather.droughtStressDesc', 'Soil moisture is approaching lower threshold. Monitor roots.')} (7d: ${s.rainfall7d} mm)`,
    },
    {
      type: w.windSpeed > 30 ? 'warning' : 'healthy',
      title: t('weather.sprayConditions', 'Spray Conditions'),
      value: w.windSpeed < 15 ? t('common.favorable', 'Favorable') : t('common.marginal', 'Marginal'),
      desc: `${t('weather.sprayConditionsDesc', 'Optimal foliar spraying requires wind speed below 15 km/h.')} (${w.windSpeed} km/h)`,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <CloudSun size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--teal-500)' }} />
          {t('weather.title', 'Weather & Environmental Risk')}
        </h1>
        <p className="page-subtitle">
          {t('weather.subtitle', 'Real-time weather data and crop risk assessment')} · {formattedDate}
        </p>
      </div>

      {/* Current Weather */}
      <div className="module-panel mb-5">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <CloudSun size={16} style={{ color: 'var(--teal-500)' }} />
            {t('weather.currentConditions', 'Current Conditions')} — {location.name || 'Selected Field Location'}
          </div>
          <StatusBadge type="info">{t('brand.live', 'Live')}</StatusBadge>
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
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                    {t('weather.feelsLike', 'Feels like')} {w.feelsLike}°C
                  </div>
                </div>
              </div>
              <div className="weather-stats">
                {[
                  { icon: <Droplets size={14} />, label: t('weather.humidity', 'Humidity'), value: `${w.humidity}%` },
                  { icon: <Wind size={14} />, label: t('weather.wind', 'Wind'), value: `${w.windSpeed} km/h ${w.windDir}` },
                  { icon: <Eye size={14} />, label: t('weather.visibility', 'Visibility'), value: `${w.visibility} km` },
                  { icon: <Sun size={14} />, label: t('weather.uvIndex', 'UV Index'), value: `${w.uvIndex} (${t('common.high', 'High')})` },
                  { icon: <Thermometer size={14} />, label: t('weather.dewPoint', 'Dew Point'), value: `${w.dewPoint}°C` },
                  { icon: <CloudRain size={14} />, label: t('weather.rain24h', 'Rain (24h)'), value: `${w.rainfall24h} mm` },
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
              <div className="section-heading">{t('weather.forecast5Day', '5-Day Forecast')}</div>
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
            {t('weather.cropRiskTitle', 'Crop Risk Assessment')}
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
            {t('weather.farmAdvisoryTitle', 'Weather-Based Farm Advisory')}
          </div>
        </div>
        <div className="module-panel-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🌧', title: t('weather.advisoryRain', 'Delay pesticide spraying until dry conditions return'), desc: '70% rain probability forecast. Spraying before rain reduces efficacy significantly.' },
              { icon: '💧', title: t('weather.advisoryIrrigate', 'Irrigate during evening hours to minimize evapotranspiration'), desc: 'Current soil moisture approaching lower threshold. Evening irrigation minimizes loss.' },
              { icon: '🌡️', title: t('weather.advisoryHeat', 'Monitor crop foliage for heat stress and canopy wilting'), desc: 'Optimal temperatures for canopy growth. Maintain adequate soil moisture.' },
              { icon: '🌿', title: t('weather.advisoryFavorable', 'Favorable spray window available in upcoming clear days'), desc: 'Optimal conditions for pesticide and foliar nutrition application.' },
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
