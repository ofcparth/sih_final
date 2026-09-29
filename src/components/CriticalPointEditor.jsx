import React, { useState, useEffect } from 'react';
import { useFieldMapStore, CRITICAL_POINT_TYPES } from '../store/fieldMapStore';
import { X, Save, Trash2, ShieldAlert } from 'lucide-react';

export default function CriticalPointEditor({ cpId, onClose }) {
  const { criticalPoints, updateCriticalPoint, removeCriticalPoint } = useFieldMapStore();
  const cp = criticalPoints.find(p => p.id === cpId);

  const [label, setLabel] = useState('');
  const [type, setType] = useState('OBSTACLE');
  const [radius, setRadius] = useState(5);
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    if (cp) {
      setLabel(cp.label || '');
      setType(cp.type || 'OBSTACLE');
      setRadius(cp.radius || 5);
      setPriority(cp.priority || 'MEDIUM');
    }
  }, [cp]);

  if (!cp) return null;

  const handleSave = () => {
    updateCriticalPoint(cpId, {
      label,
      type,
      radius: parseFloat(radius),
      priority,
      behavior: {
        avoid: type === 'OBSTACLE' || type === 'NO_GO_ZONE',
        speedMultiplier: type === 'SLOW_ZONE' ? 0.5 : type === 'SPEED_ZONE' ? 1.2 : 1.0,
        awareness: type === 'HIGH_AWARENESS' ? 'HIGH' : 'NORMAL'
      }
    });
    onClose();
  };

  const handleDelete = () => {
    removeCriticalPoint(cpId);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '420px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb', color: '#1f2937'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#eab308" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Edit Critical Point</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db',
                fontSize: '14px', background: '#f9fafb', color: '#111827'
              }}
            >
              {Object.keys(CRITICAL_POINT_TYPES).map(key => (
                <option key={key} value={key}>
                  {CRITICAL_POINT_TYPES[key].icon} {CRITICAL_POINT_TYPES[key].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Label / Description</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Tree, Borewell, High Tension Pole"
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db',
                fontSize: '14px', background: '#f9fafb', color: '#111827'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Radius (meters)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '14px', background: '#f9fafb', color: '#111827'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '14px', background: '#f9fafb', color: '#111827'
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={handleDelete}
            style={{
              padding: '10px 16px', borderRadius: '8px', border: '1px solid #fee2e2',
              background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <Trash2 size={16} /> Delete
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: '#ffffff', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 18px', borderRadius: '8px', border: 'none',
                background: '#eab308', color: '#000000', fontWeight: 700, fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
              }}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
