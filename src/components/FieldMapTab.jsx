import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeocodingControl } from '@maptiler/geocoding-control/maplibregl';
import * as turf from '@turf/turf';
import { useFieldMapStore, CRITICAL_POINT_TYPES } from '../store/fieldMapStore';
import CriticalPointEditor from './CriticalPointEditor';
import { useLanguage } from '../i18n/LanguageContext';
import {
  MapPin, Navigation, Plus, RotateCcw, RotateCw, Trash2, CheckCircle,
  Play, Flag, PlayCircle, Save, FolderOpen, AlertTriangle, Layers,
  Compass, ShieldAlert, Sparkles, HelpCircle
} from 'lucide-react';

const MAPTILER_KEY = 'NMMX1yByDfJ2KILMkfKx';

export default function FieldMapTab() {
  const { t } = useLanguage();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const locationMarkerRef = useRef(null);
  const boundaryMarkerRefs = useRef({});
  const cpMarkerRefs = useRef({});
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const store = useFieldMapStore();
  const [editorCpId, setEditorCpId] = useState(null);
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [saveMissionName, setSaveMissionName] = useState('');
  const [saveToast, setSaveToast] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
      center: [store.location.lng, store.location.lat],
      zoom: 15,
    });
    mapRef.current = map;

    // Add Geocoding Control
    const gc = new GeocodingControl({
      apiKey: MAPTILER_KEY,
      maplibregl,
      marker: false
    });

    map.addControl(gc, 'top-left');
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    gc.on('pick', (e) => {
      if (e.feature && e.feature.geometry) {
        const coords = e.feature.geometry.coordinates;
        store.setLocation({
          lat: coords[1],
          lng: coords[0],
          name: e.feature.place_name || 'Selected Search Location'
        });
        map.flyTo({ center: coords, zoom: 16 });
      }
    });

    map.on('load', () => {
      // Add Polygon Source & Layers
      map.addSource('field-polygon-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'field-polygon-fill',
        type: 'fill',
        source: 'field-polygon-source',
        paint: {
          'fill-color': '#fef08a',
          'fill-opacity': 0.35
        }
      });

      map.addLayer({
        id: 'field-polygon-line',
        type: 'line',
        source: 'field-polygon-source',
        paint: {
          'line-color': '#eab308',
          'line-width': 3,
          'line-dasharray': [2, 1]
        }
      });

      // Add Critical Circles Source & Layers
      map.addSource('cp-circles-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'cp-circles-fill',
        type: 'fill',
        source: 'cp-circles-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.25
        }
      });

      map.addLayer({
        id: 'cp-circles-line',
        type: 'line',
        source: 'cp-circles-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2
        }
      });

      // Add Rover Route Source & Layer
      map.addSource('rover-route-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'rover-route-casing',
        type: 'line',
        source: 'rover-route-source',
        paint: {
          'line-color': '#0369a1',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 16, 4, 19, 6]
        }
      });

      map.addLayer({
        id: 'rover-route-line',
        type: 'line',
        source: 'rover-route-source',
        paint: {
          'line-color': '#38bdf8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 2, 19, 3]
        }
      });
    });

    // Map Click Listener for placing points
    map.on('click', (e) => {
      const mode = useFieldMapStore.getState().activeMode;
      const cpType = useFieldMapStore.getState().pendingCpType;

      if (mode === 'BOUNDARY') {
        useFieldMapStore.getState().addBoundaryPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      } else if (mode === 'START') {
        useFieldMapStore.getState().setStartPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        useFieldMapStore.getState().setActiveMode('SELECT');
      } else if (mode === 'END') {
        useFieldMapStore.getState().setEndPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        useFieldMapStore.getState().setActiveMode('SELECT');
      } else if (mode === 'CP_PLACEMENT' && cpType) {
        useFieldMapStore.getState().addCriticalPoint({
          type: cpType,
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        });
        useFieldMapStore.getState().setActiveMode('SELECT');
      }
    });

    store.fetchSavedMissions();
  }, []);

  // Sync Location Marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (!locationMarkerRef.current) {
      locationMarkerRef.current = new maplibregl.Marker({ color: '#2563eb' })
        .setLngLat([store.location.lng, store.location.lat])
        .addTo(mapRef.current);
    } else {
      locationMarkerRef.current.setLngLat([store.location.lng, store.location.lat]);
    }
  }, [store.location]);

  // Sync Boundary Points & Polygon Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear removed markers
    Object.keys(boundaryMarkerRefs.current).forEach(id => {
      if (!store.boundaryPoints.find(p => p.id === id)) {
        boundaryMarkerRefs.current[id].remove();
        delete boundaryMarkerRefs.current[id];
      }
    });

    // Update / Create markers
    store.boundaryPoints.forEach((pt, index) => {
      if (!boundaryMarkerRefs.current[pt.id]) {
        const el = document.createElement('div');
        el.className = 'boundary-pin';
        el.innerText = `P${index + 1}`;
        el.style.cssText = `
          background: #eab308; color: #000; font-weight: 800; font-size: 11px;
          padding: 4px 8px; borderRadius: 12px; border: 2px solid #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); cursor: grab; text-align: center;
        `;

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([pt.lng, pt.lat])
          .addTo(map);

        marker.on('drag', () => {
          const lngLat = marker.getLngLat();
          updatePolygonSourceImperative();
        });

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          store.updateBoundaryPoint(pt.id, lngLat.lat, lngLat.lng);
        });

        boundaryMarkerRefs.current[pt.id] = marker;
      } else {
        const marker = boundaryMarkerRefs.current[pt.id];
        marker.setLngLat([pt.lng, pt.lat]);
        marker.getElement().innerText = `P${index + 1}`;
      }
    });

    updatePolygonSourceImperative();
  }, [store.boundaryPoints, store.boundaryClosed]);

  const updatePolygonSourceImperative = () => {
    if (!mapRef.current || !mapRef.current.getSource('field-polygon-source')) return;
    const pts = store.boundaryPoints;
    if (pts.length < 3) {
      mapRef.current.getSource('field-polygon-source').setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const ring = pts.map(p => [p.lng, p.lat]);
    ring.push([pts[0].lng, pts[0].lat]);

    mapRef.current.getSource('field-polygon-source').setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [ring] }
      }]
    });
  };

  // Sync Critical Points & Radius Circles
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear old CP markers
    Object.keys(cpMarkerRefs.current).forEach(id => {
      if (!store.criticalPoints.find(p => p.id === id)) {
        cpMarkerRefs.current[id].remove();
        delete cpMarkerRefs.current[id];
      }
    });

    const circleFeatures = [];

    store.criticalPoints.forEach((cp, idx) => {
      const typeInfo = CRITICAL_POINT_TYPES[cp.type] || CRITICAL_POINT_TYPES.OBSTACLE;

      if (!cpMarkerRefs.current[cp.id]) {
        const el = document.createElement('div');
        el.innerHTML = `<span style="font-size: 16px;">${typeInfo.icon}</span>`;
        el.style.cssText = `
          background: ${typeInfo.color}; color: #fff; font-size: 11px; font-weight: 700;
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          setEditorCpId(cp.id);
        });

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([cp.longitude, cp.latitude])
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          store.updateCriticalPoint(cp.id, { latitude: lngLat.lat, longitude: lngLat.lng });
        });

        cpMarkerRefs.current[cp.id] = marker;
      } else {
        cpMarkerRefs.current[cp.id].setLngLat([cp.longitude, cp.latitude]);
      }

      // Generate radius circle geometry using Turf
      try {
        const center = [cp.longitude, cp.latitude];
        const circle = turf.circle(center, cp.radius / 1000.0, { units: 'kilometers' });
        circle.properties = { color: typeInfo.color };
        circleFeatures.push(circle);
      } catch (e) {}
    });

    if (map.getSource('cp-circles-source')) {
      map.getSource('cp-circles-source').setData({
        type: 'FeatureCollection',
        features: circleFeatures
      });
    }
  }, [store.criticalPoints]);

  // Sync Start / End Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (store.startPoint) {
      if (!startMarkerRef.current) {
        const el = document.createElement('div');
        el.innerText = 'START';
        el.style.cssText = `
          background: #16a34a; color: #fff; font-weight: 800; font-size: 10px;
          padding: 4px 8px; border-radius: 12px; border: 2px solid #fff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); cursor: grab;
        `;
        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([store.startPoint.lng, store.startPoint.lat])
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          store.setStartPoint({ lat: lngLat.lat, lng: lngLat.lng });
        });
        startMarkerRef.current = marker;
      } else {
        startMarkerRef.current.setLngLat([store.startPoint.lng, store.startPoint.lat]);
      }
    } else if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }

    if (store.endPoint) {
      if (!endMarkerRef.current) {
        const el = document.createElement('div');
        el.innerText = 'END';
        el.style.cssText = `
          background: #dc2626; color: #fff; font-weight: 800; font-size: 10px;
          padding: 4px 8px; border-radius: 12px; border: 2px solid #fff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); cursor: grab;
        `;
        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([store.endPoint.lng, store.endPoint.lat])
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          store.setEndPoint({ lat: lngLat.lat, lng: lngLat.lng });
        });
        endMarkerRef.current = marker;
      } else {
        endMarkerRef.current.setLngLat([store.endPoint.lng, store.endPoint.lat]);
      }
    } else if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }
  }, [store.startPoint, store.endPoint]);

  const fitMapToField = () => {
    if (!mapRef.current || store.boundaryPoints.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    store.boundaryPoints.forEach(pt => bounds.extend([pt.lng, pt.lat]));
    mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 18 });
  };

  // Sync Rover Route Layer
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.getSource('rover-route-source')) return;
    if (store.route) {
      mapRef.current.getSource('rover-route-source').setData({
        type: 'FeatureCollection',
        features: [store.route]
      });
      fitMapToField();
    } else {
      mapRef.current.getSource('rover-route-source').setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [store.route]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        store.setLocation({ lat, lng, name: 'Current Location' });
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 16 });
        }
      },
      (err) => alert("Unable to retrieve location"),
      { enableHighAccuracy: true }
    );
  };

  const handleSaveMission = async () => {
    const res = await store.saveMission(saveMissionName || 'Wheat Field Mission');
    if (res.success) {
      setSaveToast(`Mission saved successfully! ID: ${res.mission_id}`);
      setTimeout(() => setSaveToast(null), 4000);
    } else {
      alert(`Save failed: ${res.error}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '16px', background: 'var(--bg-app, #f8fafc)', padding: '8px' }}>
      {/* ── LEFT: MAIN SATELLITE MAP AREA ── */}
      <div style={{ flex: 1, position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        {/* Map Top Status Bar */}
        <div style={{
          position: 'absolute', top: '16px', right: '60px', zIndex: 10,
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
          padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: 600, color: '#1e293b'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: store.boundaryClosed ? '#10b981' : '#f59e0b' }} />
            {store.boundaryClosed ? t('fieldmap.closed', 'Field Boundary Closed') : t('fieldmap.defining', 'Defining Field')}
          </span>
          {store.routeOutdated && store.route && (
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', padding: '2px 8px', borderRadius: '12px' }}>
              <AlertTriangle size={13} /> {t('common.filter', 'Route Outdated')}
            </span>
          )}
        </div>

        {/* Bottom Map Legend */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px', zIndex: 10,
          background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(8px)',
          padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)',
          display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600, color: '#334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#fef08a', border: '2px solid #eab308', borderRadius: '3px' }} />
            {t('fieldmap.fieldBoundary', 'Field Boundary')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '3px', background: '#0284c7' }} />
            {t('fieldmap.roverRoute', 'Rover Route')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', background: '#16a34a', borderRadius: '50%' }} />
            {t('fieldmap.startPoint', 'Start')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', background: '#dc2626', borderRadius: '50%' }} />
            {t('fieldmap.endPoint', 'End')}
          </div>
        </div>

        {/* Save Toast Notification */}
        {saveToast && (
          <div style={{
            position: 'absolute', bottom: '20px', right: '20px', zIndex: 20,
            background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: '12px',
            fontWeight: 600, fontSize: '14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
          }}>
            {saveToast}
          </div>
        )}
      </div>

      {/* ── RIGHT: MISSION PLANNER CONTROL SIDEBAR ── */}
      <div style={{
        width: '380px', display: 'flex', flexDirection: 'column', gap: '14px',
        overflowY: 'auto', paddingRight: '4px'
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '14px',
          border: '1px solid var(--border-light, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#fef08a', padding: '8px', borderRadius: '10px', color: '#854d0e' }}>
              <Compass size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{t('fieldmap.missionPlanner', 'FIELD MISSION PLANNER')}</h2>
              <p style={{ fontSize: '11px', color: '#64748b' }}>{t('fieldmap.subtitle', 'Interactive Wheat Field Rover Route Planner')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMissionsModal(true)}
            title="Saved Missions"
            style={{
              padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
              background: '#f8fafc', color: '#334155', fontWeight: 600, fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
            }}
          >
            <FolderOpen size={14} /> {t('common.save', 'Saved')}
          </button>
        </div>

        {/* 1. Location Panel */}
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="#eab308" /> 1. {t('fieldmap.fieldLocation', 'Field Location')}
          </h3>
          <button
            onClick={handleCurrentLocation}
            style={{
              width: '100%', padding: '9px', background: '#fef9c3', color: '#854d0e',
              border: '1px solid #fde047', borderRadius: '8px', fontWeight: 700, fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <Navigation size={14} /> {t('fieldmap.useCurrentLocation', 'Use Current Location')}
          </button>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
            <strong>Current:</strong> {store.location.name} <br />
            Lat: {store.location.lat.toFixed(5)}, Lng: {store.location.lng.toFixed(5)}
          </div>
        </div>

        {/* 2. Field Boundary Panel */}
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="#eab308" /> 2. Field Boundary
            </h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={store.undoBoundary} title="Undo" style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>
                <RotateCcw size={12} />
              </button>
              <button onClick={store.redoBoundary} title="Redo" style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>
                <RotateCw size={12} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <button
              onClick={() => store.setActiveMode(store.activeMode === 'BOUNDARY' ? 'SELECT' : 'BOUNDARY')}
              style={{
                padding: '9px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                background: store.activeMode === 'BOUNDARY' ? '#eab308' : '#f8fafc',
                color: store.activeMode === 'BOUNDARY' ? '#000' : '#334155',
                border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <Plus size={14} /> {store.activeMode === 'BOUNDARY' ? 'Click Map...' : 'Add Pins'}
            </button>

            <button
              onClick={async () => {
                const res = await store.closeBoundary();
                if (!res.valid) alert(res.error);
                else fitMapToField();
              }}
              disabled={store.boundaryPoints.length < 3}
              style={{
                padding: '9px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                background: store.boundaryClosed ? '#10b981' : '#fef08a',
                color: store.boundaryClosed ? '#ffffff' : '#854d0e',
                border: '1px solid #fde047', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                opacity: store.boundaryPoints.length < 3 ? 0.5 : 1
              }}
            >
              <CheckCircle size={14} /> {store.boundaryClosed ? 'Boundary Set' : 'Close Polygon'}
            </button>
          </div>

          {store.boundaryPoints.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#334155' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: '4px' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>AREA</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{store.fieldMetrics.area_ha} ha</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>PERIMETER</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{store.fieldMetrics.perimeter_m} m</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>POINTS</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{store.boundaryPoints.length}</div>
                </div>
              </div>
              <button
                onClick={store.clearBoundary}
                style={{ width: '100%', marginTop: '8px', padding: '4px', background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear All Boundary Points
              </button>
            </div>
          )}
        </div>

        {/* 3. Critical Points Palette */}
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="#eab308" /> 3. Critical Points ({store.criticalPoints.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            {Object.keys(CRITICAL_POINT_TYPES).map(key => {
              const item = CRITICAL_POINT_TYPES[key];
              const isSelected = store.activeMode === 'CP_PLACEMENT' && store.pendingCpType === key;
              return (
                <button
                  key={key}
                  onClick={() => store.setActiveMode(isSelected ? 'SELECT' : 'CP_PLACEMENT', key)}
                  style={{
                    padding: '8px', borderRadius: '8px', border: `1px solid ${isSelected ? item.color : '#e2e8f0'}`,
                    background: isSelected ? `${item.color}15` : '#f8fafc', color: '#1e293b',
                    fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{item.icon}</span>
                  <span style={{ truncate: true }}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {store.criticalPoints.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {store.criticalPoints.map((cp) => {
                const info = CRITICAL_POINT_TYPES[cp.type] || CRITICAL_POINT_TYPES.OBSTACLE;
                return (
                  <div
                    key={cp.id}
                    onClick={() => setEditorCpId(cp.id)}
                    style={{
                      padding: '8px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{info.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{cp.label}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Radius: {cp.radius}m</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); store.removeCriticalPoint(cp.id); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Start & End Markers */}
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>4. Rover Waypoints</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => store.setActiveMode(store.activeMode === 'START' ? 'SELECT' : 'START')}
              style={{
                padding: '9px', borderRadius: '8px', border: '1px solid #bbf7d0',
                background: store.startPoint ? '#dcfce7' : '#f8fafc', color: '#15803d',
                fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer'
              }}
            >
              <Play size={14} /> {store.startPoint ? 'Start Set' : 'Set Start'}
            </button>

            <button
              onClick={() => store.setActiveMode(store.activeMode === 'END' ? 'SELECT' : 'END')}
              style={{
                padding: '9px', borderRadius: '8px', border: '1px solid #fecaca',
                background: store.endPoint ? '#fee2e2' : '#f8fafc', color: '#b91c1c',
                fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer'
              }}
            >
              <Flag size={14} /> {store.endPoint ? 'End Set' : 'Set End'}
            </button>
          </div>
        </div>

        {/* 5. Route Settings & Generation */}
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#eab308" /> 5. Route Planner
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>PATH SPACING (m)</label>
              <input
                type="number" step="0.1" min="0.2" max="5.0"
                value={store.routeSettings.pathSpacing || 0.5}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0.5;
                  store.updateRouteSettings({ pathSpacing: val });
                }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>SAFETY BUFFER (m)</label>
              <input
                type="number" step="0.1" min="0.0" max="5.0"
                value={store.routeSettings.safetyBuffer || 0.5}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0.0;
                  store.updateRouteSettings({ safetyBuffer: val });
                }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>TURNING RADIUS (m)</label>
              <input
                type="number" step="0.1" min="0.3" max="5.0"
                value={store.routeSettings.turningRadius || 0.8}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0.8;
                  store.updateRouteSettings({ turningRadius: val });
                }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>CRUISING SPEED (m/s)</label>
              <input
                type="number" step="0.1" min="0.1" max="3.0"
                value={store.routeSettings.cruisingSpeed || 0.6}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0.6;
                  store.updateRouteSettings({ cruisingSpeed: val });
                }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>COVERAGE STRATEGY</label>
            <select
              value={store.routeSettings.strategy || 'boustrophedon'}
              onChange={(e) => store.updateRouteSettings({ strategy: e.target.value })}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#f8fafc' }}
            >
              <option value="boustrophedon">Boustrophedon / Lawn-mower</option>
              <option value="snake">Snake Pattern</option>
              <option value="contour">Contour Parallel</option>
            </select>
          </div>

          <button
            onClick={store.generateRoute}
            disabled={store.isGeneratingRoute || store.boundaryPoints.length < 3}
            style={{
              width: '100%', padding: '12px', background: store.routeOutdated ? '#eab308' : '#0284c7',
              color: store.routeOutdated ? '#000000' : '#ffffff',
              border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer',
              opacity: store.boundaryPoints.length < 3 ? 0.5 : 1
            }}
          >
            <PlayCircle size={18} />
            {store.isGeneratingRoute ? 'Calculating Coverage Route...' : store.routeOutdated ? 'Regenerate Route (Outdated)' : 'Generate Rover Route'}
          </button>

          {/* Route Stats */}
          {store.routeStats && (
            <div style={{ marginTop: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '9px', color: '#0369a1', fontWeight: 700 }}>DISTANCE</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0c4a6e' }}>{(store.routeStats.distance_m / 1000.0).toFixed(2)} km</div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: '#0369a1', fontWeight: 700 }}>EST. TIME</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0c4a6e' }}>{Math.round(store.routeStats.estimated_time_s / 60.0)} min</div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: '#0369a1', fontWeight: 700 }}>COVERAGE</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0c4a6e' }}>{store.routeStats.coverage_percent}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Save Mission Action */}
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <input
            type="text"
            placeholder="Mission Name (e.g. Wheat Field North)"
            value={saveMissionName}
            onChange={(e) => setSaveMissionName(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '8px' }}
          />
          <button
            onClick={handleSaveMission}
            disabled={store.isSavingMission || store.boundaryPoints.length < 3}
            style={{
              width: '100%', padding: '12px', background: '#eab308', color: '#000000',
              border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <Save size={16} /> Save & Sync Mission to Cloud
          </button>
        </div>
      </div>

      {/* Critical Point Editor Modal */}
      {editorCpId && (
        <CriticalPointEditor cpId={editorCpId} onClose={() => setEditorCpId(null)} />
      )}

      {/* Saved Missions Modal */}
      {showMissionsModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Saved Field Missions</h3>
              <button onClick={() => setShowMissionsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {store.savedMissions.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No saved missions found</div>
              ) : (
                store.savedMissions.map((m) => (
                  <div key={m.mission_id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>{m.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {m.mission_id} · {m.area_m2} m²</div>
                    </div>
                    <button
                      onClick={() => { store.loadMission(m.mission_id); setShowMissionsModal(false); }}
                      style={{ padding: '6px 12px', background: '#eab308', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      Open
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
