import React, { useState, useEffect, useCallback } from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  Compass,
  Thermometer,
  ShieldAlert,
  Navigation,
  RotateCw,
  Zap,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { WeatherCondition } from '../../types';
import { MOCK_WEATHER } from '../../data/mockData';
import { 
  PRESET_DISTRICTS, 
  PresetDistrict, 
  detectUserLocation, 
  fetchLiveWeather, 
  GeoLocationResult 
} from '../../services/weatherService';

interface WeatherAdvisoryViewProps {
  onAskAI?: (prompt: string) => void;
}

export const WeatherAdvisoryView: React.FC<WeatherAdvisoryViewProps> = ({ onAskAI }) => {
  // Current active location coordinates & label
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number; label: string }>({
    lat: 29.6857,
    lon: 76.9907,
    label: 'Karnal, Haryana'
  });

  const [weatherData, setWeatherData] = useState<WeatherCondition>(MOCK_WEATHER);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'ip' | 'preset' | 'manual' | 'fallback'>('preset');
  const [locationAccuracy, setLocationAccuracy] = useState<number | undefined>(undefined);
  const [geoNotice, setGeoNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Load weather for a given coordinate set
  const loadWeatherForCoords = useCallback(async (lat: number, lon: number, label: string) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchLiveWeather(lat, lon, label);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Handle Geolocation detection
  const handleDetectLocation = async () => {
    setIsLocating(true);
    setGeoNotice(null);

    try {
      const res: GeoLocationResult = await detectUserLocation();

      setCurrentCoords({
        lat: res.lat,
        lon: res.lon,
        label: res.locationName
      });
      setLocationSource(res.source);
      setLocationAccuracy(res.accuracy);

      if (res.source === 'gps') {
        const accText = res.accuracy ? `(Accuracy: ±${Math.round(res.accuracy)}m)` : '';
        setGeoNotice({
          type: 'success',
          message: `GPS Coordinates acquired for ${res.locationName} ${accText}. Weather synced with micro-grid.`
        });
      } else if (res.source === 'ip') {
        setGeoNotice({
          type: 'info',
          message: `Browser GPS was unavailable (${res.error || 'permission denied'}). Auto-detected location via network IP: ${res.locationName}.`
        });
      } else {
        setGeoNotice({
          type: 'warning',
          message: res.error || 'Could not access geolocation. Showing default district.'
        });
      }

      await loadWeatherForCoords(res.lat, res.lon, res.locationName);
    } catch (err) {
      console.error('Geolocation detection failed:', err);
      setGeoNotice({
        type: 'warning',
        message: 'Unable to detect location. Please pick your district from the dropdown.'
      });
    } finally {
      setIsLocating(false);
    }
  };

  // Handle selecting a preset district
  const handleSelectDistrict = async (districtNameWithState: string) => {
    const found = PRESET_DISTRICTS.find(
      (d) => `${d.district}, ${d.state}` === districtNameWithState
    );

    if (found) {
      const label = `${found.district}, ${found.state}`;
      setCurrentCoords({
        lat: found.lat,
        lon: found.lon,
        label
      });
      setLocationSource('preset');
      setLocationAccuracy(undefined);
      setGeoNotice(null);
      await loadWeatherForCoords(found.lat, found.lon, label);
    }
  };

  // Load weather on initial render — auto-detect location first
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const w = weatherData;

  // Weather Icon helper
  const renderWeatherIcon = (condition: string, rainProb: number) => {
    const lower = condition.toLowerCase();
    if (lower.includes('thunder') || lower.includes('storm')) {
      return <Zap className="w-12 h-12 text-amber-500 animate-pulse" />;
    }
    if (lower.includes('rain') || rainProb > 45) {
      return <CloudRain className="w-12 h-12 text-sky-500" />;
    }
    if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('drizzle')) {
      return <CloudSun className="w-12 h-12 text-amber-500" />;
    }
    return <Sun className="w-12 h-12 text-amber-500" />;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Banner / Geolocation Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                IMD & Agrometeorological Micro-Station
              </span>
              <span aria-hidden="true">·</span>
              <span>Live Satellite Grid</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
              Weather & Agricultural Advisories
            </h1>
            <p className="text-sm text-stone-600 mt-0.5">
              Hyperlocal farm weather paired with real-time pesticide spray windows and irrigation scheduling.
            </p>
          </div>

          {/* Location Controls: GPS Detect + District Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* GPS Detect Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-all border ${
                locationSource === 'gps'
                  ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
              title="Detect current device location via GPS"
            >
              {isLocating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>सटीक स्थान खोज रहे हैं...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {locationSource === 'gps' ? 'GPS Active (जीपीएस सक्रिय)' : 'Detect My Location (जीपीएस)'}
                  </span>
                </>
              )}
            </button>

            {/* District Dropdown */}
            <div className="relative inline-flex items-center">
              <MapPin className="w-4 h-4 text-stone-500 absolute left-3 pointer-events-none" />
              <select
                value={currentCoords.label}
                onChange={(e) => handleSelectDistrict(e.target.value)}
                className="py-2 pl-9 pr-8 text-xs font-medium bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 text-stone-900 shadow-xs appearance-none cursor-pointer"
                title="Select agricultural district"
              >
                <optgroup label="Frequently Used">
                  <option value="Karnal, Haryana">Karnal, Haryana</option>
                  <option value="Ludhiana, Punjab">Ludhiana, Punjab</option>
                  <option value="Neemuch, Madhya Pradesh">Neemuch, Madhya Pradesh</option>
                  <option value="Nashik, Maharashtra">Nashik, Maharashtra</option>
                  <option value="Alwar, Rajasthan">Alwar, Rajasthan</option>
                </optgroup>
                <optgroup label="North Zone (Haryana, Punjab, UP, Delhi)">
                  {PRESET_DISTRICTS.filter(d => d.zone === 'North').map((d) => (
                    <option key={`${d.district}-${d.state}`} value={`${d.district}, ${d.state}`}>
                      {d.district}, {d.state}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="West & Central Zone (Rajasthan, MP, Maharashtra, Gujarat)">
                  {PRESET_DISTRICTS.filter(d => d.zone === 'West' || d.zone === 'Central').map((d) => (
                    <option key={`${d.district}-${d.state}`} value={`${d.district}, ${d.state}`}>
                      {d.district}, {d.state}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="East Zone (Bihar, West Bengal)">
                  {PRESET_DISTRICTS.filter(d => d.zone === 'East').map((d) => (
                    <option key={`${d.district}-${d.state}`} value={`${d.district}, ${d.state}`}>
                      {d.district}, {d.state}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="South Zone (AP, Telangana, Karnataka, Tamil Nadu)">
                  {PRESET_DISTRICTS.filter(d => d.zone === 'South').map((d) => (
                    <option key={`${d.district}-${d.state}`} value={`${d.district}, ${d.state}`}>
                      {d.district}, {d.state}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute right-2.5 pointer-events-none text-stone-400 text-[10px]">▼</div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadWeatherForCoords(currentCoords.lat, currentCoords.lon, currentCoords.label)}
              disabled={isLoadingWeather}
              className="p-2 text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              title="Refresh weather data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Location Notice / Status Banner */}
        {geoNotice && (
          <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2.5 border transition-all ${
            geoNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : geoNotice.type === 'info'
              ? 'bg-sky-50 text-sky-900 border-sky-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            {geoNotice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : geoNotice.type === 'info' ? (
              <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-medium">{geoNotice.message}</span>
              {geoNotice.type === 'warning' && (
                <span className="block text-[11px] text-amber-800 mt-0.5">
                  Tip: Browser iframes sometimes restrict GPS prompt permissions. You can also pick any of 50+ major agricultural districts from the dropdown above.
                </span>
              )}
            </div>
            <button 
              onClick={() => setGeoNotice(null)}
              className="text-stone-400 hover:text-stone-700 font-bold ml-2 text-sm leading-none"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Main Hero Weather Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Current Conditions Card */}
        <div className="md:col-span-7 bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between text-xs font-medium text-stone-600 pb-2 border-b border-stone-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  {w.location}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                  locationSource === 'gps'
                    ? 'bg-emerald-100 text-emerald-800'
                    : locationSource === 'ip'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-stone-100 text-stone-700'
                }`}>
                  {locationSource === 'gps' ? 'GPS Verified' : locationSource === 'ip' ? 'Network IP' : 'District Grid'}
                </span>
              </div>
              <span className="font-mono text-stone-500">{w.forecastDate}</span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <div className="text-5xl font-extrabold font-mono text-stone-900 tracking-tight flex items-baseline">
                  {w.currentTemp}°<span className="text-2xl font-normal text-stone-500">C</span>
                  {isLoadingWeather && (
                    <span className="ml-3 text-xs font-normal text-emerald-700 flex items-center gap-1">
                      <RotateCw className="w-3 h-3 animate-spin" /> Updating...
                    </span>
                  )}
                </div>
                <div className="text-base font-semibold text-stone-800 mt-1">{w.condition}</div>
                <div className="text-xs text-stone-600 mt-0.5 font-medium">हिंदी: {w.conditionHindi}</div>
              </div>

              <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-inner">
                {renderWeatherIcon(w.condition, w.rainfallProbabilityPercent)}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-4 pt-3 border-t border-stone-150 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-150/80 flex items-center justify-between sm:block">
              <span className="text-xs text-stone-600 flex items-center gap-1 font-medium">
                <Droplets className="w-3.5 h-3.5 text-sky-600" /> Relative Humidity
              </span>
              <div className="text-right sm:text-left">
                <div className="text-base sm:text-lg font-bold font-mono text-stone-900 mt-0.5">{w.humidityPercent}%</div>
                <span className="text-[10px] sm:text-[11px] text-stone-500">Rain Prob: {w.rainfallProbabilityPercent}%</span>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-150/80 flex items-center justify-between sm:block">
              <span className="text-xs text-stone-600 flex items-center gap-1 font-medium">
                <Wind className="w-3.5 h-3.5 text-emerald-600" /> Wind Velocity
              </span>
              <div className="text-right sm:text-left">
                <div className="text-base sm:text-lg font-bold font-mono text-stone-900 mt-0.5">
                  {w.windSpeedKmh} <span className="text-xs font-normal text-stone-500">km/h</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-stone-500 flex items-center justify-end sm:justify-start gap-1">
                  <Compass className="w-3 h-3 text-stone-400" /> {w.windDirection}
                </span>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-150/80 flex items-center justify-between sm:block">
              <span className="text-xs text-stone-600 flex items-center gap-1 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-rose-600" /> Diurnal Variation
              </span>
              <div className="text-right sm:text-left">
                <div className="text-base sm:text-lg font-bold font-mono text-stone-900 mt-0.5">
                  {w.sevenDayForecast[0] ? (w.sevenDayForecast[0].tempMax - w.sevenDayForecast[0].tempMin) : 13}°C
                </div>
                <span className="text-[10px] sm:text-[11px] text-stone-500">
                  High: {w.sevenDayForecast[0]?.tempMax ?? 31}° · Low: {w.sevenDayForecast[0]?.tempMin ?? 18}°
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Farm Advisories */}
        <div className="md:col-span-5 space-y-4">
          {/* Spray Advisory Card */}
          <div className={`p-4 rounded-xl border shadow-xs transition-colors ${
            w.sprayAdvisory.isSafe 
              ? 'bg-emerald-50/80 border-emerald-300' 
              : 'bg-amber-50/90 border-amber-300'
          }`}>
            <div className="flex items-start gap-2.5">
              {w.sprayAdvisory.isSafe ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  {w.sprayAdvisory.isSafe 
                    ? 'Foliar Spraying: Optimal & Safe (स्प्रे अनुकूल)' 
                    : 'Foliar Spraying: Hold Off (स्प्रे स्थगित रखें)'}
                </h4>
                <div className="text-xs font-semibold text-emerald-950 mt-1">
                  Optimal Window: {w.sprayAdvisory.bestWindow}
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-700 mt-2.5 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-black/5">
              {w.sprayAdvisory.reason}
            </p>
          </div>

          {/* Irrigation Advisory Card */}
          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <div className="flex items-start gap-2.5">
              <Droplets className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900">Irrigation Management</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    w.irrigationAdvisory.recommendation === 'skip_irrigation' || w.irrigationAdvisory.recommendation === 'skip_rain_expected'
                      ? 'bg-rose-100 text-rose-800'
                      : w.irrigationAdvisory.recommendation === 'irrigate_now'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {w.irrigationAdvisory.recommendation.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-sky-950 font-semibold mt-1">
                  {w.irrigationAdvisory.recommendation === 'skip_irrigation' || w.irrigationAdvisory.recommendation === 'skip_rain_expected'
                    ? 'Recommendation: Postpone irrigation due to high rain prospect'
                    : w.irrigationAdvisory.recommendation === 'irrigate_now'
                    ? 'Recommendation: Light irrigation to prevent water deficit stress'
                    : 'Recommendation: Maintain regular soil moisture for current rabi stage'}
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-150">
              {w.irrigationAdvisory.reason}
            </p>
          </div>

          {/* Ask AI Weather Integration */}
          {onAskAI && (
            <button
              onClick={() => onAskAI(`What is the 3-day weather, pest vulnerability, and pesticide spray forecast for ${currentCoords.label}?`)}
              className="w-full flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-300 shadow-2xs group"
            >
              <Sparkles className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>Ask Kheti AI: When should I harvest or irrigate in {currentCoords.label.split(',')[0]}?</span>
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Agricultural Forecast Strip */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-150 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
              7-Day Micro-Agri Forecast Outlook (7-दिवसीय मौसम पूर्वानुमान)
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              Calibrated for {currentCoords.label} · Daily temperature swings & precipitation probabilities
            </p>
          </div>
          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block"></span> PoP (Rain Prob)
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {w.sevenDayForecast.map((day, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-center transition-all ${
                idx === 0
                  ? 'bg-emerald-50/70 border-emerald-400 font-semibold shadow-2xs'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="text-xs font-bold text-stone-800">{day.day}</div>
              <div className="text-[11px] text-stone-500 font-mono mt-0.5">{day.date}</div>

              <div className="my-2.5 flex justify-center text-stone-700">
                {day.rainProb > 40 ? (
                  <CloudRain className="w-6 h-6 text-sky-600" />
                ) : day.rainProb > 20 ? (
                  <CloudSun className="w-6 h-6 text-amber-500" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
              </div>

              <div className="text-sm font-bold font-mono text-stone-900">
                {day.tempMax}° / <span className="text-xs font-normal text-stone-600">{day.tempMin}°</span>
              </div>
              <div className="text-[11px] text-stone-600 truncate mt-1" title={day.condition}>
                {day.condition}
              </div>

              <div className="mt-2 pt-1.5 border-t border-stone-200/80 text-[11px] text-sky-800 font-semibold flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-sky-600" />
                {day.rainProb}% Rain
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Weather Warnings */}
      <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-950 mb-2">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Agricultural Weather Alerts for {currentCoords.label} (कृषि मौसम चेतावनी)</span>
        </div>
        <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside">
          {w.alerts.map((alert, i) => (
            <li key={i} className="leading-relaxed">{alert}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
