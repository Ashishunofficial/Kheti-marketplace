/**
 * ServicesMap — Leaflet OpenStreetMap for warehouse/godown locations
 * Uses dynamic import to avoid SSR issues
 */
import React, { useEffect, useRef } from 'react';
import type { WarehouseFacility } from '../../types';

// Fallback coordinates for common districts
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Karnal': [29.686, 76.990],
  'Kurukshetra': [29.970, 76.878],
  'Hisar': [29.145, 75.723],
  'Rohtak': [28.894, 76.577],
  'Panipat': [29.391, 76.970],
  'Ambala': [30.378, 76.776],
  'Sirsa': [29.531, 75.021],
  'Bhiwani': [28.789, 76.139],
  'Ludhiana': [30.901, 75.857],
  'Amritsar': [31.634, 74.873],
  'Patiala': [30.339, 76.387],
  'Bathinda': [30.210, 74.952],
  'Fatehabad': [29.515, 75.456],
  'Jind': [29.316, 76.316],
  'Kaithal': [29.801, 76.399],
  'Sonipat': [28.994, 77.021],
  'Palwal': [28.148, 77.328],
};

function getCoords(district: string): [number, number] | null {
  if (DISTRICT_COORDS[district]) return DISTRICT_COORDS[district];
  const key = Object.keys(DISTRICT_COORDS).find(k => district.includes(k) || k.includes(district));
  return key ? DISTRICT_COORDS[key] : null;
}

interface ServicesMapProps {
  warehouses: WarehouseFacility[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export const ServicesMap: React.FC<ServicesMapProps> = ({ warehouses, selectedId, onSelect, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((L) => {
      if (mapInstanceRef.current) return;

      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.default.map(mapRef.current!, {
        center: [29.5, 76.5],
        zoom: 7,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      L.default.control.attribution({ prefix: false }).addTo(map);

      warehouses.forEach((wh) => {
        const coords = getCoords(wh.district);
        if (!coords) return;

        const lat = coords[0] + (Math.random() - 0.5) * 0.1;
        const lng = coords[1] + (Math.random() - 0.5) * 0.1;

        const isWdra = wh.isWdrcRegistered;
        const color = isWdra ? '#059669' : '#d97706';

        const icon = L.default.divIcon({
          className: '',
          html: `<div style="position:relative;width:32px;height:32px;background:${color};border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(45deg);font-size:13px;">${isWdra ? '🏪' : '🏭'}</div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        });

        const occupancy = Math.round(((wh.totalCapacityMT - wh.availableCapacityMT) / wh.totalCapacityMT) * 100);

        L.default.marker([lat, lng], { icon }).addTo(map).bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;font-size:12px;">
            <div style="font-weight:700;color:#1c1917;margin-bottom:2px;">${wh.name}</div>
            <div style="color:#78716c;font-size:10px;margin-bottom:6px;">${wh.type} · ${wh.district}, ${wh.state}</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:#78716c;">Available:</span>
              <strong style="color:#059669;">${wh.availableCapacityMT.toLocaleString('en-IN')} MT</strong>
            </div>
            <div style="background:#f5f5f4;border-radius:4px;height:6px;margin-bottom:4px;">
              <div style="background:${color};height:100%;border-radius:4px;width:${occupancy}%;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;">
              <span style="color:#78716c;">Rs.${wh.ratePerBagPerMonth}/bag/mo</span>
              ${isWdra ? '<span style="color:#059669;font-weight:700;">WDRA Certified</span>' : ''}
            </div>
          </div>
        `, { maxWidth: 220 });
      });

      mapInstanceRef.current = map;

      const validCoords = warehouses.map(wh => getCoords(wh.district)).filter(Boolean) as [number, number][];
      if (validCoords.length > 1) {
        map.fitBounds(validCoords, { padding: [40, 40], maxZoom: 9 });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`relative z-0 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs ${className}`}
      style={{ isolation: 'isolate' }}
    >
      <div ref={mapRef} style={{ width: '100%' }} className="h-44 sm:h-64 bg-stone-100" />
      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-stone-200 z-10 text-[10px] space-y-0.5">
        <div className="font-extrabold text-stone-700 text-[9px] uppercase tracking-wide">Storage Facilities</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600" /><span className="text-stone-700">WDRA Certified</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-600" /><span className="text-stone-700">Private Godown</span></div>
      </div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xs rounded-full px-2.5 py-0.5 shadow-2xs border border-stone-200 z-10 text-[10px] font-bold text-stone-800 whitespace-nowrap">
        Storage Facility Map
      </div>
    </div>
  );
};
