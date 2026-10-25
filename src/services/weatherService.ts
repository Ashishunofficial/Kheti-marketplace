/**
 * weatherService — Open-Meteo free API (no API key needed)
 * Fetches real weather data by lat/lon and maps to WeatherCondition type.
 * Also exports PRESET_DISTRICTS, detectUserLocation, fetchLiveWeather
 * for backwards compatibility with WeatherAdvisoryView.
 */
import type { WeatherCondition } from '../types';

// ─── WMO Weather Codes ────────────────────────────────────────────────────────
const WMO_CONDITIONS: Record<number, { en: string; hi: string }> = {
  0:  { en: 'Clear Sky',          hi: 'साफ़ आकाश' },
  1:  { en: 'Mostly Clear',       hi: 'अधिकतर साफ' },
  2:  { en: 'Partly Cloudy',      hi: 'आंशिक बादल' },
  3:  { en: 'Overcast',           hi: 'पूरे बादल' },
  45: { en: 'Foggy',              hi: 'कोहरा' },
  48: { en: 'Rime Fog',           hi: 'ओस कोहरा' },
  51: { en: 'Light Drizzle',      hi: 'हल्की फुहार' },
  61: { en: 'Light Rain',         hi: 'हल्की बारिश' },
  63: { en: 'Moderate Rain',      hi: 'मध्यम वर्षा' },
  65: { en: 'Heavy Rain',         hi: 'भारी वर्षा' },
  71: { en: 'Light Snow',         hi: 'हल्की बर्फ' },
  80: { en: 'Rain Showers',       hi: 'बौछारें' },
  95: { en: 'Thunderstorm',       hi: 'आंधी-तूफ़ान' },
  99: { en: 'Heavy Thunderstorm', hi: 'भारी तूफ़ान' },
};

function getConditionLabel(code: number): { en: string; hi: string } {
  return WMO_CONDITIONS[code] ?? { en: 'Partly Cloudy', hi: 'आंशिक बादल' };
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDay(dateStr: string, index: number): { day: string; date: string } {
  const d = new Date(dateStr);
  return {
    day: index === 0 ? 'Today' : DAYS[d.getDay()],
    date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
  };
}

function bearingToCardinal(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ─── Core fetch function ──────────────────────────────────────────────────────
export async function fetchWeather(lat: number, lon: number, locationLabel: string): Promise<WeatherCondition> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', [
    'temperature_2m','relative_humidity_2m','wind_speed_10m',
    'wind_direction_10m','precipitation_probability','weather_code',
  ].join(','));
  url.searchParams.set('daily', [
    'temperature_2m_max','temperature_2m_min',
    'weather_code','precipitation_probability_max',
  ].join(','));
  url.searchParams.set('timezone', 'Asia/Kolkata');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const data = await res.json();

  const cur = data.current;
  const daily = data.daily;

  const wCode: number = cur.weather_code ?? 0;
  const windSpeedKmh: number = Math.round(cur.wind_speed_10m ?? 0);
  const rainProb: number = cur.precipitation_probability ?? 0;
  const humidity: number = cur.relative_humidity_2m ?? 0;
  const temp: number = Math.round(cur.temperature_2m ?? 25);
  const windDir = bearingToCardinal(cur.wind_direction_10m ?? 0);
  const { en: condEn, hi: condHi } = getConditionLabel(wCode);

  const forecastDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  const sprayIsSafe = windSpeedKmh < 15 && rainProb < 40;

  let irrigationRec: WeatherCondition['irrigationAdvisory']['recommendation'] = 'optimal_moisture';
  let irrigationReason = 'Soil moisture appears adequate. Monitor crop closely.';
  if (humidity < 45 && rainProb < 20) {
    irrigationRec = 'irrigate_now';
    irrigationReason = `Low humidity (${humidity}%) with minimal rain expected. Irrigate today — early morning is best.`;
  } else if (rainProb >= 60) {
    irrigationRec = 'skip_rain_expected';
    irrigationReason = `Rain probability is high (${rainProb}%). Skip irrigation — natural rainfall expected soon.`;
  }

  const sevenDayForecast: WeatherCondition['sevenDayForecast'] = (daily.time as string[]).slice(0, 7).map((dateStr: string, i: number) => {
    const { day, date } = formatDay(dateStr, i);
    const { en } = getConditionLabel(daily.weather_code[i]);
    return {
      day, date,
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      condition: en,
      rainProb: daily.precipitation_probability_max[i] ?? 0,
    };
  });

  const alerts: string[] = [];
  if (rainProb > 50) alerts.push(`Rain expected today (${rainProb}% probability). Avoid pesticide spray — may wash off before absorption.`);
  if (windSpeedKmh > 20) alerts.push(`Wind speed ${windSpeedKmh} km/h — do not spray pesticides. Risk of drift damage.`);
  if (humidity > 80) alerts.push('High humidity may favour fungal diseases. Inspect leaves for early rust or blight symptoms.');
  if (temp < 12) alerts.push('Cold conditions — protect nurseries with mulching or polythene covers overnight.');
  if (alerts.length === 0) alerts.push('No weather alerts today. Good conditions for field operations.');

  return {
    currentTemp: temp,
    condition: `${condEn} · Wind ${windSpeedKmh} km/h ${windDir}`,
    conditionHindi: `${condHi} · हवा ${windSpeedKmh} कि.मी./घं. ${windDir}`,
    humidityPercent: humidity,
    rainfallProbabilityPercent: rainProb,
    windSpeedKmh,
    windDirection: windDir,
    forecastDate,
    location: `${locationLabel} (Lat: ${lat.toFixed(2)}° N, Long: ${lon.toFixed(2)}° E)`,
    sprayAdvisory: {
      isSafe: sprayIsSafe,
      reason: sprayIsSafe
        ? `Wind ${windSpeedKmh} km/h and rain ${rainProb}% — safe for foliar spray.`
        : windSpeedKmh >= 15
          ? `Wind speed ${windSpeedKmh} km/h is too high for spraying. Wait for calmer conditions.`
          : `Rain probability ${rainProb}% is high. Spray will not be effective.`,
      bestWindow: sprayIsSafe ? 'Early Morning (06:00 AM – 10:00 AM)' : 'Wait for better conditions',
    },
    irrigationAdvisory: { recommendation: irrigationRec, reason: irrigationReason },
    alerts,
    sevenDayForecast,
  };
}

// ─── Alias for WeatherAdvisoryView ────────────────────────────────────────────
export const fetchLiveWeather = fetchWeather;

// ─── Geolocation Result type ──────────────────────────────────────────────────
export interface GeoLocationResult {
  lat: number;
  lon: number;
  locationName: string;
  source: 'gps' | 'ip' | 'fallback';
  accuracy?: number;
  error?: string;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const district = addr.county || addr.state_district || addr.district || addr.city || addr.town || 'Unknown';
    const state = addr.state || 'India';
    return `${district}, ${state}`;
  } catch {
    return 'India';
  }
}

export async function detectUserLocation(): Promise<GeoLocationResult> {
  // Try GPS
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('not supported')); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false, timeout: 8000, maximumAge: 300000,
      });
    });
    const { latitude: lat, longitude: lon, accuracy } = pos.coords;
    const locationName = await reverseGeocode(lat, lon);
    return { lat, lon, locationName, source: 'gps', accuracy };
  } catch (gpsErr: any) {
    // Try IP fallback
    try {
      const res = await fetch('https://ipapi.co/json/');
      const d = await res.json();
      return {
        lat: d.latitude, lon: d.longitude,
        locationName: `${d.city || d.region}, ${d.country_name}`,
        source: 'ip',
        error: gpsErr?.message,
      };
    } catch {
      return {
        lat: 29.686, lon: 76.990,
        locationName: 'Karnal, Haryana',
        source: 'fallback',
        error: 'GPS and IP geolocation both failed. Using default Haryana coordinates.',
      };
    }
  }
}

// ─── Preset Districts for district dropdown ───────────────────────────────────
export interface PresetDistrict {
  district: string;
  state: string;
  lat: number;
  lon: number;
  zone: 'North' | 'West' | 'Central' | 'East' | 'South';
}

export const PRESET_DISTRICTS: PresetDistrict[] = [
  // North
  { district: 'Karnal', state: 'Haryana', lat: 29.686, lon: 76.990, zone: 'North' },
  { district: 'Kurukshetra', state: 'Haryana', lat: 29.970, lon: 76.878, zone: 'North' },
  { district: 'Hisar', state: 'Haryana', lat: 29.145, lon: 75.723, zone: 'North' },
  { district: 'Rohtak', state: 'Haryana', lat: 28.894, lon: 76.577, zone: 'North' },
  { district: 'Panipat', state: 'Haryana', lat: 29.391, lon: 76.970, zone: 'North' },
  { district: 'Ambala', state: 'Haryana', lat: 30.378, lon: 76.776, zone: 'North' },
  { district: 'Ludhiana', state: 'Punjab', lat: 30.901, lon: 75.857, zone: 'North' },
  { district: 'Amritsar', state: 'Punjab', lat: 31.634, lon: 74.873, zone: 'North' },
  { district: 'Patiala', state: 'Punjab', lat: 30.339, lon: 76.387, zone: 'North' },
  { district: 'Bathinda', state: 'Punjab', lat: 30.210, lon: 74.952, zone: 'North' },
  { district: 'Muzaffarnagar', state: 'Uttar Pradesh', lat: 29.473, lon: 77.704, zone: 'North' },
  { district: 'Meerut', state: 'Uttar Pradesh', lat: 28.984, lon: 77.706, zone: 'North' },
  { district: 'Agra', state: 'Uttar Pradesh', lat: 27.177, lon: 78.008, zone: 'North' },
  { district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.317, lon: 82.973, zone: 'North' },
  { district: 'Dehradun', state: 'Uttarakhand', lat: 30.316, lon: 78.032, zone: 'North' },
  // West
  { district: 'Alwar', state: 'Rajasthan', lat: 27.556, lon: 76.634, zone: 'West' },
  { district: 'Jaipur', state: 'Rajasthan', lat: 26.912, lon: 75.787, zone: 'West' },
  { district: 'Jodhpur', state: 'Rajasthan', lat: 26.292, lon: 73.014, zone: 'West' },
  { district: 'Kota', state: 'Rajasthan', lat: 25.180, lon: 75.840, zone: 'West' },
  { district: 'Surat', state: 'Gujarat', lat: 21.170, lon: 72.831, zone: 'West' },
  { district: 'Rajkot', state: 'Gujarat', lat: 22.303, lon: 70.802, zone: 'West' },
  { district: 'Ahmedabad', state: 'Gujarat', lat: 23.023, lon: 72.572, zone: 'West' },
  { district: 'Nashik', state: 'Maharashtra', lat: 19.997, lon: 73.790, zone: 'West' },
  { district: 'Pune', state: 'Maharashtra', lat: 18.521, lon: 73.855, zone: 'West' },
  { district: 'Solapur', state: 'Maharashtra', lat: 17.687, lon: 75.905, zone: 'West' },
  // Central
  { district: 'Neemuch', state: 'Madhya Pradesh', lat: 24.469, lon: 74.863, zone: 'Central' },
  { district: 'Indore', state: 'Madhya Pradesh', lat: 22.719, lon: 75.858, zone: 'Central' },
  { district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.259, lon: 77.413, zone: 'Central' },
  { district: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.181, lon: 79.987, zone: 'Central' },
  { district: 'Vidisha', state: 'Madhya Pradesh', lat: 23.525, lon: 77.814, zone: 'Central' },
  // East
  { district: 'Patna', state: 'Bihar', lat: 25.595, lon: 85.138, zone: 'East' },
  { district: 'Gaya', state: 'Bihar', lat: 24.796, lon: 85.012, zone: 'East' },
  { district: 'Purnia', state: 'Bihar', lat: 25.777, lon: 87.474, zone: 'East' },
  { district: 'Kolkata', state: 'West Bengal', lat: 22.573, lon: 88.364, zone: 'East' },
  { district: 'Burdwan', state: 'West Bengal', lat: 23.232, lon: 87.856, zone: 'East' },
  { district: 'Raipur', state: 'Chhattisgarh', lat: 21.250, lon: 81.630, zone: 'East' },
  // South
  { district: 'Guntur', state: 'Andhra Pradesh', lat: 16.307, lon: 80.437, zone: 'South' },
  { district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.828, lon: 78.037, zone: 'South' },
  { district: 'Hyderabad', state: 'Telangana', lat: 17.385, lon: 78.487, zone: 'South' },
  { district: 'Warangal', state: 'Telangana', lat: 17.977, lon: 79.598, zone: 'South' },
  { district: 'Bengaluru', state: 'Karnataka', lat: 12.972, lon: 77.594, zone: 'South' },
  { district: 'Hubli', state: 'Karnataka', lat: 15.350, lon: 75.135, zone: 'South' },
  { district: 'Chennai', state: 'Tamil Nadu', lat: 13.083, lon: 80.270, zone: 'South' },
  { district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.017, lon: 76.967, zone: 'South' },
  { district: 'Thiruvananthapuram', state: 'Kerala', lat: 8.524, lon: 76.936, zone: 'South' },
];
