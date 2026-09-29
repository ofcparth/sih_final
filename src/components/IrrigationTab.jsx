import React from 'react';
import {
  Droplets, Thermometer, Clock, Calendar,
  CheckCircle2, AlertTriangle, Info, Gauge,
  CloudRain, Sun, Radio,
} from 'lucide-react';
import { IRRIGATION_STATUS, SENSOR_READINGS, WEATHER_FORECAST } from '../data/mockData';
import { AI_RECOMMENDATIONS } from '../data/aiRecommendations';
import AIRecommendationPanel from './AIRecommendationPanel';

const StatusBadge = ({ type, children }) => (
  <span className={`status-badge ${type}`}>
    <span className="status-badge-dot" />
    {children}
  </span>
);

export default function IrrigationTab() {
  const ir = IRRIGATION_STATUS;
  const s = SENSOR_READINGS;

  const moisturePercent = ((s.soilMoisture - ir.wiltingPoint) / (ir.fieldCapacity - ir.wiltingPoint)) * 100;
  const moistureInRange = s.soilMoisture >= ir.optimalRange[0] && s.soilMoisture <= ir.optimalRange[1];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Droplets size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--blue-500)' }} />
          Irrigation Management
        </h1>
        <p className="page-subtitle">Sensor-based soil moisture monitoring and irrigation scheduling</p>
      </div>

      {/* Recommendation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blue-50), #eff8ff)',
        border: '1px solid var(--blue-200)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--radius-lg)',
          background: 'var(--blue-500)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Droplets size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
            Irrigation Recommendation
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
            Irrigate — {ir.urgency}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Estimated water deficit: <strong>{ir.estimatedDeficit} mm</strong> ·
            Crop ETc: <strong>{ir.cropWaterRequirement} mm/day</strong> ·
            Next irrigation: <strong>{ir.nextIrrigationDate}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <StatusBadge type="warning">Action Needed</StatusBadge>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <Calendar size={12} style={{ display: 'inline' }} /> {ir.nextIrrigationDate}
          </div>
        </div>
      </div>

      {/* Soil Moisture Panel */}
      <div className="grid-2 mb-5">
        <div className="module-panel">
          <div className="module-panel-header">
            <div className="module-panel-title">
              <Gauge size={16} style={{ color: 'var(--blue-500)' }} />
              Soil Moisture Status
            </div>
            <StatusBadge type={moistureInRange ? 'healthy' : 'warning'}>
              {moistureInRange ? 'In Range' : 'Near Threshold'}
            </StatusBadge>
          </div>
          <div className="module-panel-body">
            {/* Big moisture reading */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--blue-600)', letterSpacing: '-2px', lineHeight: 1 }}>
                {s.soilMoisture}<span style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-muted)' }}>%</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Volumetric Water Content</div>
            </div>

            {/* Moisture range bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 6 }}>
                <span>Wilting Point ({ir.wiltingPoint}%)</span>
                <span>Field Capacity ({ir.fieldCapacity}%)</span>
              </div>
              <div style={{ position: 'relative', height: 12, background: 'var(--gray-200)', borderRadius: 6, overflow: 'hidden' }}>
                {/* Optimal zone highlight */}
                <div style={{
                  position: 'absolute',
                  left: `${((ir.optimalRange[0] - ir.wiltingPoint) / (ir.fieldCapacity - ir.wiltingPoint)) * 100}%`,
                  right: `${100 - ((ir.optimalRange[1] - ir.wiltingPoint) / (ir.fieldCapacity - ir.wiltingPoint)) * 100}%`,
                  top: 0, bottom: 0,
                  background: 'rgba(34,197,94,0.2)',
                }} />
                {/* Current moisture marker */}
                <div style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: `${Math.min(100, Math.max(0, moisturePercent))}%`,
                  background: 'linear-gradient(90deg, var(--blue-400), var(--blue-600))',
                  borderRadius: 6,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                <span>Optimal: {ir.optimalRange[0]}–{ir.optimalRange[1]}%</span>
                <span style={{ color: 'var(--blue-600)', fontWeight: 700 }}>Current: {s.soilMoisture}%</span>
              </div>
            </div>

            {/* Sensor readings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Soil Temperature', value: `${s.soilTemperature}°C`, icon: <Thermometer size={14} /> },
                { label: 'Soil pH', value: s.soilPH, icon: <Radio size={14} /> },
                { label: 'Soil EC', value: `${s.soilEC} dS/m`, icon: <Radio size={14} /> },
                { label: 'Rainfall (7d)', value: `${s.rainfall7d} mm`, icon: <CloudRain size={14} /> },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--gray-50)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {item.icon}{item.label}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Irrigation Decision Panel */}
        <div className="module-panel">
          <div className="module-panel-header">
            <div className="module-panel-title">
              <CheckCircle2 size={16} style={{ color: 'var(--green-600)' }} />
              Decision Reasoning
            </div>
          </div>
          <div className="module-panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {ir.reasoning.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 'var(--radius-lg)' }}>
                  <Info size={15} style={{ color: 'var(--blue-500)', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>

            <div className="section-heading">Irrigation Plan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Method', value: 'Drip Irrigation' },
                { label: 'Duration', value: ir.irrigationDuration },
                { label: 'Target Date', value: ir.nextIrrigationDate },
                { label: 'Water Deficit', value: `${ir.estimatedDeficit} mm` },
                { label: 'Crop ETc', value: `${ir.cropWaterRequirement} mm/day` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--green-800)' }}>
              <strong>Tip:</strong> {ir.methodNote}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Impact */}
      <div className="module-panel">
        <div className="module-panel-header">
          <div className="module-panel-title">
            <CloudRain size={16} style={{ color: 'var(--blue-500)' }} />
            5-Day Rainfall Forecast (Irrigation Planning)
          </div>
        </div>
        <div className="module-panel-body">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {WEATHER_FORECAST.map(day => (
              <div key={day.day} style={{
                flex: '1', minWidth: '100px',
                background: parseFloat(day.rain) > 40 ? 'var(--blue-50)' : 'var(--gray-50)',
                border: `1px solid ${parseFloat(day.rain) > 40 ? 'var(--blue-200)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{day.day}</div>
                <div style={{ fontSize: 24 }}>{day.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-600)', marginTop: 6 }}>{day.rain} rain</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{day.high}° / {day.low}°</div>
                {parseFloat(day.rain) > 40 && (
                  <div style={{ fontSize: 10, color: 'var(--blue-700)', fontWeight: 700, marginTop: 4 }}>Skip irrigation</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--amber-50)', border: '1px solid var(--amber-200)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--amber-800)', display: 'flex', gap: 8 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Rain expected Saturday (70%). Consider irrigating Friday evening to build soil moisture reserve. Skip if rain exceeds 15 mm.</span>
          </div>
        </div>
      </div>
      {/* AI Recommendation Panel */}
      <AIRecommendationPanel recommendation={AI_RECOMMENDATIONS.irrigation} />
    </div>
  );
}
