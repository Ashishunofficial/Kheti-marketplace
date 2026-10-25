/**
 * useGeolocation — Browser GPS + reverse geocode to district/state
 * Fallback chain: GPS → IP geolocation → null
 */
import { useState, useEffect } from 'react';

export interface GeoLocation {
  lat: number;
  lon: number;
  district: string;
  state: string;
  displayName: string;
  source: 'gps' | 'ip' | 'manual';
}

interface UseGeolocationReturn {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

async function reverseGeocode(lat: number, lon: number): Promise<{ district: string; state: string; displayName: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const district =
      addr.county || addr.state_district || addr.district || addr.city || addr.town || addr.village || 'Unknown';
    const state = addr.state || 'India';
    const displayName = `${district}, ${state}`;
    return { district, state, displayName };
  } catch {
    return { district: 'Unknown', state: 'India', displayName: 'India' };
  }
}

async function ipGeolocate(): Promise<GeoLocation> {
  const res = await fetch('https://ipapi.co/json/');
  const data = await res.json();
  return {
    lat: data.latitude,
    lon: data.longitude,
    district: data.city || data.region || 'Unknown',
    state: data.region || 'India',
    displayName: `${data.city || data.region}, ${data.country_name}`,
    source: 'ip',
  };
}

function getBrowserGPS(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 5 * 60 * 1000, // cache 5 mins
    });
  });
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function detect() {
      // Try GPS first
      try {
        const pos = await getBrowserGPS();
        if (cancelled) return;
        const { lat, lon } = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const { district, state, displayName } = await reverseGeocode(lat, lon);
        if (!cancelled) setLocation({ lat, lon, district, state, displayName, source: 'gps' });
      } catch (_gpsErr) {
        // GPS denied or unavailable — try IP fallback
        try {
          const ipLoc = await ipGeolocate();
          if (!cancelled) setLocation(ipLoc);
        } catch (ipErr) {
          if (!cancelled) {
            setError('Could not detect location. Please allow location access.');
            // Haryana default so the app still works
            setLocation({
              lat: 29.686, lon: 76.990,
              district: 'Karnal', state: 'Haryana',
              displayName: 'Karnal, Haryana (default)',
              source: 'manual',
            });
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    detect();
    return () => { cancelled = true; };
  }, [retryCount]);

  return { location, loading, error, retry: () => setRetryCount(c => c + 1) };
}
