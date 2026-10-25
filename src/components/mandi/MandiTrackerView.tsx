import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  Sparkles,
  MapPin,
  AlertCircle,
  Database,
  Key,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Bell,
  Menu,
  Sprout
} from 'lucide-react';
import { CommodityType, MandiPriceRecord } from '../../types';
import { fetchLiveMandiPrices, DATA_GOV_API_KEY, ALL_STATES, ALL_COMMODITIES } from '../../services/mandiService';

interface MandiTrackerViewProps {
  initialCommodity?: string;
  onSelectCommodityForAI?: (commodity: string) => void;
}

export const MandiTrackerView: React.FC<MandiTrackerViewProps> = ({ initialCommodity, onSelectCommodityForAI }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCommodity, setSelectedCommodity] = useState<string>(initialCommodity || 'All');
  const [prices, setPrices] = useState<MandiPriceRecord[]>([]);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<MandiPriceRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<string>('DATA.GOV.IN AGMARKNET APMC FEED');
  const [lastUpdated, setLastUpdated] = useState<string>('03:36 am');

  const states = ALL_STATES;
  const commodities = ALL_COMMODITIES;

  const loadDataGovMandiRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetchLiveMandiPrices({
        state: selectedState,
        commodity: selectedCommodity,
        searchTerm: searchTerm
      });
      setPrices(response.records);
      setDataSource('DATA.GOV.IN AGMARKNET APMC FEED');
      if (response.lastUpdated) {
        setLastUpdated(response.lastUpdated);
      }
      if (response.records.length > 0 && (!selectedRecordForDetail || !response.records.some(r => r.id === selectedRecordForDetail.id))) {
        setSelectedRecordForDetail(response.records[0]);
      }
    } catch (err) {
      console.error('Failed to load mandi rates from data.gov.in:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedState, selectedCommodity, searchTerm, selectedRecordForDetail]);

  useEffect(() => {
    loadDataGovMandiRates();
  }, [selectedState, selectedCommodity, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    loadDataGovMandiRates();
  };

  const filteredPrices = prices.filter((record) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      record.mandiName.toLowerCase().includes(term) ||
      record.district.toLowerCase().includes(term) ||
      record.variety.toLowerCase().includes(term) ||
      record.commodity.toLowerCase().includes(term) ||
      record.state.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ─── LIVE PORTAL BADGE & TITLE BLOCK ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 sm:pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              DATA.GOV.IN LIVE PORTAL
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-stone-900 mt-1">
            Live Mandi Rates & Price Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5 font-medium">
            Directly connected to <strong className="text-stone-900">data.gov.in</strong> OGD Platform API
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-full transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live Feed'}</span>
          </button>
        </div>
      </div>

      {/* ─── DARK AGMARKNET STATUS BANNER (Screen 3) ─── */}
      <div className="bg-stone-900 text-stone-100 p-3 sm:p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <div className="font-black text-white uppercase tracking-wider text-[10px] sm:text-[11px] leading-tight">
              SOURCE: {dataSource}
            </div>
            <div className="text-stone-400 text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5">
              Showing {filteredPrices.length} verified mandi records · Synced at {lastUpdated || '03:36 am'}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SEARCH & DROPDOWN FILTERS (Screen 3) ─── */}
      <div className="space-y-2 bg-white p-3 border border-stone-200 rounded-2xl shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="मंडी, जिला, फसल या किस्म खोजें..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700 focus:bg-white text-stone-900 font-medium placeholder:text-stone-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700 text-stone-800 font-bold appearance-none cursor-pointer"
            >
              <option value="All">राज्य: सभी</option>
              {states.filter(s => s !== 'All').map((s) => (
                <option key={s} value={s}>राज्य: {s}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700 text-stone-800 font-bold appearance-none cursor-pointer"
            >
              <option value="All">फसल: सभी</option>
              {commodities.filter(c => c !== 'All').map((c) => (
                <option key={c} value={c}>फसल: {c}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── SUMMARY LINE ─── */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-extrabold text-stone-900">
          {filteredPrices.length} सत्यापित APMC मंडी यार्ड
        </span>
        <span className="text-[10px] text-stone-500 font-semibold">
          इकाई: ₹ प्रति क्विंटल (100 किग्रा)
        </span>
      </div>

      {/* ─── MANDI CARDS LIST (Screen 3 Layout) ─── */}
      {filteredPrices.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-stone-600 text-xs space-y-2 border border-stone-200 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="font-bold text-stone-800">कोई मंडी भाव उपलब्ध नहीं है।</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedState('All'); setSelectedCommodity('All'); }}
            className="text-xs text-emerald-800 font-bold underline hover:text-emerald-900"
          >
            फिल्टर रिसेट करें
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          
          {/* 📱 MOBILE VIEW CARDS LIST (< md) — Strictly matching Screen 3 */}
          <div className="md:hidden space-y-2">
            {filteredPrices.map((item) => {
              const isSelected = selectedRecordForDetail?.id === item.id;
              const mspDelta = item.mspPrice > 0 ? item.modalPrice - item.mspPrice : null;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecordForDetail(item)}
                  className={`bg-white border rounded-2xl p-3 shadow-2xs transition-all cursor-pointer hover:border-emerald-500 ${
                    isSelected ? 'border-emerald-600 bg-amber-50/40 ring-1 ring-emerald-500' : 'border-stone-200/90'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    
                    {/* Col 1: Mandi & Location (Span 5) */}
                    <div className="col-span-5 border-r border-stone-150 pr-2">
                      <div className="text-xs font-extrabold text-stone-900 leading-tight">
                        {item.mandiName}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium flex items-center gap-0.5 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span className="truncate">{item.district}, {item.state}</span>
                      </div>
                    </div>

                    {/* Col 2: Commodity & Variety (Span 3) */}
                    <div className="col-span-3 border-r border-stone-150 pr-1">
                      <div className="text-xs font-extrabold text-stone-900 leading-tight">
                        {item.commodity}
                      </div>
                      <div className="text-[9.5px] text-stone-500 font-medium truncate mt-0.5">
                        {item.variety}
                      </div>
                    </div>

                    {/* Col 3: Price & MSP Badges (Span 4) */}
                    <div className="col-span-4 text-right pl-1">
                      <div className="text-sm font-black text-stone-900 font-mono leading-none">
                        ₹{item.modalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] text-stone-500 font-mono font-medium mt-0.5">
                        ₹{item.minPrice} - ₹{item.maxPrice}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-1 mt-1">
                        {/* Daily Change Badge */}
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded font-mono ${
                          item.change >= 0 ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
                        }`}>
                          {item.change >= 0 ? `▲ +${item.change}` : `▼ -${Math.abs(item.change)}`}
                        </span>

                        {/* MSP Delta Badge */}
                        {mspDelta !== null && (
                          <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded font-mono ${
                            mspDelta >= 0 ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
                          }`}>
                            {mspDelta >= 0 ? `+₹${mspDelta} vs MSP` : `-₹${Math.abs(mspDelta)} vs MSP`}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* 💻 DESKTOP VIEW DETAILED TABLE (>= md) */}
          <div className="hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-bold text-stone-700 bg-stone-50/80">
                  <th className="py-3 px-4">Mandi & Location</th>
                  <th className="py-3 px-3">Commodity / Variety</th>
                  <th className="py-3 px-3 text-right">Modal Rate</th>
                  <th className="py-3 px-3 text-right">Min / Max Range</th>
                  <th className="py-3 px-3 text-right">Daily Change</th>
                  <th className="py-3 px-4 text-center">MSP Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredPrices.map((item) => {
                  const isSelected = selectedRecordForDetail?.id === item.id;
                  const mspDelta = item.mspPrice > 0 ? item.modalPrice - item.mspPrice : null;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRecordForDetail(item)}
                      className={`hover:bg-amber-50/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50/80 border-l-4 border-l-amber-600' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{item.mandiName}</div>
                        <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{item.district}, {item.state}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">{item.commodity}</div>
                        <div className="text-xs text-stone-500">{item.variety}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-stone-900 text-base">
                        ₹{item.modalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-stone-600">
                        ₹{item.minPrice} - ₹{item.maxPrice}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs">
                        {item.change >= 0 ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            ▲ +₹{item.change}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                            ▼ -₹{Math.abs(item.change)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {mspDelta !== null ? (
                          <span
                            className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                              mspDelta >= 0
                                ? 'bg-emerald-100 text-emerald-950'
                                : 'bg-rose-100 text-rose-950'
                            }`}
                          >
                            {mspDelta >= 0 ? `+₹${mspDelta} vs MSP` : `-₹${Math.abs(mspDelta)} vs MSP`}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-500">Non-MSP</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Selected Mandi Profile Detail (Desktop & Modal) */}
      {selectedRecordForDetail && (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Mandi Price Intelligence Detail
            </span>
            <span className="text-[10px] text-stone-700 font-bold bg-stone-100 px-2 py-0.5 rounded-full">
              {selectedRecordForDetail.freshnessStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 font-semibold block">Mandi Yard</span>
              <span className="font-extrabold text-stone-900 text-sm block mt-0.5">{selectedRecordForDetail.mandiName}</span>
              <span className="text-stone-500">{selectedRecordForDetail.district}, {selectedRecordForDetail.state}</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 font-semibold block">Commodity & Variety</span>
              <span className="font-extrabold text-stone-900 text-sm block mt-0.5">{selectedRecordForDetail.commodity}</span>
              <span className="text-stone-500">{selectedRecordForDetail.variety}</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-amber-900 font-semibold block">Today's Modal Rate</span>
              <span className="font-black text-amber-950 text-xl font-mono block mt-0.5">
                ₹{selectedRecordForDetail.modalPrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-stone-600">/ qtl</span>
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
