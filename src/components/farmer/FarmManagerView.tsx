import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Droplet,
  Edit2,
  Trash2,
  X,
  Check,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CURRENT_USER } from '../../data/mockData';

interface FarmManagerViewProps {
  onNavigateTab: (tab: string, filter?: string) => void;
}

export interface FarmExpenseRecord {
  id: string;
  item: string;
  category: 'Seeds' | 'Nutrients' | 'Pesticides' | 'Machinery' | 'Labor' | 'Irrigation' | 'Other';
  amount: number;
  date: string;
  notes?: string;
}

export interface FarmPlotRecord {
  id: string;
  name: string;
  areaAcres: number;
  currentCrop: string;
  variety: string;
  sownDate: string;
  harvestExpected: string;
  growthStage: string;
  soilMoisture: number;
  healthStatus: string;
  lastIrrigated: string;
}

const INITIAL_PLOTS: FarmPlotRecord[] = [
  {
    id: 'plt_1',
    name: 'North Canal Parcel (Plot #1)',
    areaAcres: 6.5,
    currentCrop: 'Wheat (गेहूं)',
    variety: 'PBW-550 / Sharbati',
    sownDate: '10 Nov 2025',
    harvestExpected: 'April 2026',
    growthStage: 'Tillering & Crown Root (45 Days)',
    soilMoisture: 42,
    healthStatus: 'Healthy',
    lastIrrigated: '4 days ago'
  },
  {
    id: 'plt_2',
    name: 'Tubewell East Parcel (Plot #2)',
    areaAcres: 5.0,
    currentCrop: 'Basmati Paddy (धान)',
    variety: 'Pusa 1121 Golden Sella',
    sownDate: '15 June 2025',
    harvestExpected: 'Harvest Complete',
    growthStage: 'Harvested (140 Quintals in Godown)',
    soilMoisture: 35,
    healthStatus: 'Harvested',
    lastIrrigated: 'Completed'
  },
  {
    id: 'plt_3',
    name: 'South Roadside Field (Plot #3)',
    areaAcres: 3.0,
    currentCrop: 'Mustard (सरसों)',
    variety: 'Black Mustard 42% Oil',
    sownDate: '28 Oct 2025',
    harvestExpected: 'Feb 2026',
    growthStage: 'Vegetative Flowering (32 Days)',
    soilMoisture: 48,
    healthStatus: 'Healthy',
    lastIrrigated: 'Yesterday'
  }
];

const INITIAL_EXPENSES: FarmExpenseRecord[] = [
  { id: 'exp_1', item: 'Certified Wheat Seed (PBW-550)', category: 'Seeds', amount: 14500, date: '05 Nov 2026', notes: '250 kg bagged seed from PAU seed store' },
  { id: 'exp_2', item: 'DAP & Urea Fertilizer (IFFCO)', category: 'Nutrients', amount: 28400, date: '12 Nov 2026', notes: '4 DAP bags + 6 Urea bags' },
  { id: 'exp_3', item: 'Tractor Rotavator & Sowing Diesel', category: 'Machinery', amount: 18200, date: '15 Nov 2026', notes: 'Diesel fuel & tractor operator wages' },
  { id: 'exp_4', item: 'Weeding & Irrigation Labor', category: 'Labor', amount: 12000, date: '02 Dec 2026', notes: '4 days labor for canal channel cleaning' }
];

const STORAGE_KEYS = {
  PLOTS: 'kheti_farm_plots_v2',
  EXPENSES: 'kheti_farm_expenses_v2',
  REVENUE: 'kheti_farm_revenue_v2'
};

export const FarmManagerView: React.FC<FarmManagerViewProps> = ({ onNavigateTab }) => {
  const { user, profile } = useAuth();
  const isGuest = !Boolean(user);
  const userKey = user ? user.id : 'guest';

  const userPlotKey = `kheti_farm_plots_${userKey}`;
  const userExpKey = `kheti_farm_expenses_${userKey}`;
  const userRevKey = `kheti_farm_revenue_${userKey}`;

  const userName = profile?.name || user?.user_metadata?.full_name || (isGuest ? CURRENT_USER.name : 'Kisan Farmer');
  const userVillage = profile?.village || (isGuest ? CURRENT_USER.village : 'Field Parcel');
  const userDistrict = profile?.district || (isGuest ? CURRENT_USER.district : 'Patiala');
  const userState = profile?.state || (isGuest ? CURRENT_USER.state : 'Punjab / Haryana');

  // 1. Plots state
  const [plots, setPlots] = useState<FarmPlotRecord[]>(() => {
    try {
      const saved = localStorage.getItem(userPlotKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return isGuest ? INITIAL_PLOTS : [];
  });

  // 2. Expenses state
  const [expenses, setExpenses] = useState<FarmExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(userExpKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return isGuest ? INITIAL_EXPENSES : [];
  });

  // 3. Harvest Sales Revenue state
  const [totalSalesRevenue, setTotalSalesRevenue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(userRevKey);
      if (saved) return Number(saved);
    } catch {}
    return isGuest ? 555600 : 0;
  });

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expItem, setExpItem] = useState('');
  const [expCategory, setExpCategory] = useState<FarmExpenseRecord['category']>('Seeds');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const [showPlotModal, setShowPlotModal] = useState(false);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [plotName, setPlotName] = useState('');
  const [plotArea, setPlotArea] = useState<number>(1);
  const [plotCrop, setPlotCrop] = useState('');
  const [plotVariety, setPlotVariety] = useState('');
  const [plotStage, setPlotStage] = useState('');
  const [plotMoisture, setPlotMoisture] = useState<number>(40);
  const [plotWatered, setPlotWatered] = useState('');

  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueInput, setRevenueInput] = useState<number>(totalSalesRevenue);

  // Sync state to user-specific localStorage
  useEffect(() => {
    try {
      localStorage.setItem(userPlotKey, JSON.stringify(plots));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [plots, userPlotKey]);

  useEffect(() => {
    try {
      localStorage.setItem(userExpKey, JSON.stringify(expenses));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [expenses, userExpKey]);

  useEffect(() => {
    try {
      localStorage.setItem(userRevKey, String(totalSalesRevenue));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [totalSalesRevenue, userRevKey]);

  // Derived financials
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCultivatedAcres = plots.reduce((sum, p) => sum + Number(p.areaAcres || 0), 0);
  const netFarmProfit = totalSalesRevenue - totalExpense;

  // ─── Expense Handlers ───────────────────────────────────────────────────────

  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setExpItem('');
    setExpCategory('Seeds');
    setExpAmount(5000);
    setExpDate(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    setExpNotes('');
    setShowExpenseModal(true);
  };

  const handleOpenEditExpense = (exp: FarmExpenseRecord) => {
    setEditingExpenseId(exp.id);
    setExpItem(exp.item);
    setExpCategory(exp.category);
    setExpAmount(exp.amount);
    setExpDate(exp.date);
    setExpNotes(exp.notes || '');
    setShowExpenseModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expItem.trim() || expAmount <= 0) return;

    if (editingExpenseId) {
      setExpenses(prev => prev.map(item => item.id === editingExpenseId ? {
        ...item,
        item: expItem.trim(),
        category: expCategory,
        amount: Number(expAmount),
        date: expDate.trim() || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        notes: expNotes.trim()
      } : item));
    } else {
      const newExp: FarmExpenseRecord = {
        id: `exp_${Date.now()}`,
        item: expItem.trim(),
        category: expCategory,
        amount: Number(expAmount),
        date: expDate.trim() || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        notes: expNotes.trim()
      };
      setExpenses(prev => [newExp, ...prev]);
    }
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expenditure record?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  // ─── Plot Handlers ──────────────────────────────────────────────────────────

  const handleOpenAddPlot = () => {
    setEditingPlotId(null);
    setPlotName(`Parcel #${plots.length + 1}`);
    setPlotArea(4.0);
    setPlotCrop('Wheat (गेहूं)');
    setPlotVariety('PBW-550');
    setPlotStage('Early Vegetative');
    setPlotMoisture(45);
    setPlotWatered('2 days ago');
    setShowPlotModal(true);
  };

  const handleOpenEditPlot = (plot: FarmPlotRecord) => {
    setEditingPlotId(plot.id);
    setPlotName(plot.name);
    setPlotArea(plot.areaAcres);
    setPlotCrop(plot.currentCrop);
    setPlotVariety(plot.variety);
    setPlotStage(plot.growthStage);
    setPlotMoisture(plot.soilMoisture);
    setPlotWatered(plot.lastIrrigated);
    setShowPlotModal(true);
  };

  const handleSavePlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName.trim()) return;

    if (editingPlotId) {
      setPlots(prev => prev.map(p => p.id === editingPlotId ? {
        ...p,
        name: plotName.trim(),
        areaAcres: Number(plotArea),
        currentCrop: plotCrop.trim(),
        variety: plotVariety.trim(),
        growthStage: plotStage.trim(),
        soilMoisture: Number(plotMoisture),
        lastIrrigated: plotWatered.trim()
      } : p));
    } else {
      const newPlot: FarmPlotRecord = {
        id: `plt_${Date.now()}`,
        name: plotName.trim(),
        areaAcres: Number(plotArea),
        currentCrop: plotCrop.trim(),
        variety: plotVariety.trim(),
        sownDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        harvestExpected: 'Next Harvest',
        growthStage: plotStage.trim() || 'Active Cultivation',
        soilMoisture: Number(plotMoisture),
        healthStatus: 'Healthy',
        lastIrrigated: plotWatered.trim() || 'Recently'
      };
      setPlots(prev => [...prev, newPlot]);
    }
    setShowPlotModal(false);
  };

  const handleDeletePlot = (id: string) => {
    if (window.confirm('Are you sure you want to remove this field parcel?')) {
      setPlots(prev => prev.filter(p => p.id !== id));
    }
  };

  // ─── Revenue Handlers ────────────────────────────────────────────────────────

  const handleSaveRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    setTotalSalesRevenue(Number(revenueInput));
    setShowRevenueModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Mode Banner */}
      {isGuest ? (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>🎭 Guest Preview (Demo Farm Ledger):</strong> Showing sample farm plots and seasonal expense ledger. Log in to create and track your own private farm records.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span>
              <strong>🟢 Live Private Ledger:</strong> Logged in as <strong>{userName}</strong>. All field parcels, input expenditures, and crop yields are saved strictly to your private account.
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span>Kisan Farm Operations & Crop Records</span>
            <span aria-hidden="true">·</span>
            <span>Real Registered Farmer Holding</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            {userName}'s Farm Dashboard
          </h1>
          <p className="text-sm text-stone-700 mt-0.5">
            {totalCultivatedAcres} Acres cultivable holding in {userVillage || 'Field Parcel'}, {userDistrict || 'Patiala'}, {userState || 'Punjab / Haryana'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Farm AI Diagnostics</span>
          </button>
          <button
            onClick={() => onNavigateTab('marketplace')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sell Stored Harvest</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Farm Financial Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block">Total Cultivated Holding</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
            {totalCultivatedAcres} <span className="text-sm font-normal text-stone-700">Acres</span>
          </div>
          <div className="text-xs text-emerald-800 font-medium mt-1">{plots.length} Active Field Parcels</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block">Harvest Stock in Farm Godown</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">140 <span className="text-sm font-normal text-stone-700">Quintals</span></div>
          <div className="text-xs text-stone-700 mt-1">Basmati 1121 ready to sell</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs relative">
          <span className="text-xs text-stone-700 block">Rabi Crop Input Expenses</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">₹{totalExpense.toLocaleString('en-IN')}</div>
          <div className="text-xs text-stone-700 mt-1">{expenses.length} Records in Ledger</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs relative">
          <div className="flex justify-between items-start">
            <span className="text-xs text-stone-700 block">Net Farm Realized Margin</span>
            <button
              onClick={() => {
                setRevenueInput(totalSalesRevenue);
                setShowRevenueModal(true);
              }}
              className="text-[10px] text-emerald-800 font-bold hover:underline flex items-center gap-0.5"
              title="Edit Sales Revenue"
            >
              <Edit2 className="w-3 h-3" /> Edit Revenue
            </button>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">₹{netFarmProfit.toLocaleString('en-IN')}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Gross Revenue: ₹{totalSalesRevenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Field Plot Manager */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-150">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Field Parcels</span>
            <h3 className="text-base font-bold text-stone-900 mt-0.5">Crop Sowing & Parcel Health Tracker</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddPlot}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field Plot</span>
            </button>
            <span className="text-xs text-stone-700 font-mono font-medium">{plots.length} Cultivated Plots</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plots.map((plot) => (
            <div key={plot.id} className="p-4 bg-stone-50 border border-stone-150 rounded-xl text-xs space-y-2.5 relative group">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">{plot.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-emerald-100 text-emerald-900">
                    {plot.areaAcres} Acres
                  </span>
                  <button
                    onClick={() => handleOpenEditPlot(plot)}
                    className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                    title="Edit Field Plot"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePlot(plot.id)}
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Field Plot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-700">Sown Crop:</span>
                  <strong className="text-stone-900">{plot.currentCrop}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Variety:</span>
                  <span className="text-stone-800">{plot.variety}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Growth Stage:</span>
                  <span className="text-emerald-800 font-semibold">{plot.growthStage}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-700 pt-1">
                <div>
                  <span className="text-stone-700 block">Root-Zone Moisture:</span>
                  <span className="font-bold font-mono text-stone-900">{plot.soilMoisture}%</span>
                </div>
                <div>
                  <span className="text-stone-700 block">Last Watered:</span>
                  <span className="font-medium text-stone-900">{plot.lastIrrigated}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <button
                  onClick={() => onNavigateTab('ai-advisor')}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Check Crop Advisory
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farm Expense Ledger */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-150">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Financial Ledger</span>
            <h3 className="text-base font-bold text-stone-900 mt-0.5">Farm Expenditure & Input Invoices</h3>
            <p className="text-xs text-stone-600">Track and edit costs for seeds, fertilizers, pesticides, diesel, and labor.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddExpense}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Expenditure</span>
            </button>
            <span className="text-xs font-mono font-bold text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
              Total Expenses: ₹{totalExpense.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
            <p className="font-semibold text-stone-800">No expenditure records added yet.</p>
            <p>Click "Record New Expenditure" above to add your seed, fertilizer, fuel, and labor costs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-700 font-semibold bg-stone-50">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Expenditure Item</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Invoice Notes</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">{exp.date}</td>
                    <td className="py-2.5 px-3 font-bold text-stone-900">{exp.item}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 text-[11px] max-w-xs truncate">
                      {exp.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditExpense(exp)}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                          title="Edit Expenditure"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Expenditure"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <h3 className="text-base font-bold text-stone-900">
                {editingExpenseId ? 'Edit Farm Expenditure' : 'Record New Farm Expenditure'}
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Expenditure Item Name *</label>
                <input
                  type="text"
                  value={expItem}
                  onChange={(e) => setExpItem(e.target.value)}
                  placeholder="e.g. Certified Wheat Seed (PBW-550)"
                  className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Category *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as FarmExpenseRecord['category'])}
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Nutrients">Fertilizers & Nutrients</option>
                    <option value="Pesticides">Pesticides & Sprays</option>
                    <option value="Machinery">Machinery & Diesel</option>
                    <option value="Labor">Labor & Wages</option>
                    <option value="Irrigation">Irrigation & Water</option>
                    <option value="Other">Other Farm Expense</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    placeholder="e.g. 14500"
                    min="1"
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Date Purchased / Incurred</label>
                <input
                  type="text"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  placeholder="e.g. 12 Nov 2026"
                  className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Invoice Details / Receipt Notes</label>
                <textarea
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="e.g. Purchased 4 bags DAP from Karnal IFFCO Kendra"
                  rows={2}
                  className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-stone-700 hover:bg-stone-100 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Save Expenditure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Field Plot Modal */}
      {showPlotModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <h3 className="text-base font-bold text-stone-900">
                {editingPlotId ? 'Edit Field Plot' : 'Add New Field Plot'}
              </h3>
              <button
                onClick={() => setShowPlotModal(false)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlot} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Parcel Name *</label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder="e.g. North Canal Parcel (Plot #1)"
                  className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Area (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={plotArea}
                    onChange={(e) => setPlotArea(Number(e.target.value))}
                    min="0.1"
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Sown Crop *</label>
                  <input
                    type="text"
                    value={plotCrop}
                    onChange={(e) => setPlotCrop(e.target.value)}
                    placeholder="e.g. Wheat (गेहूं)"
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Variety</label>
                  <input
                    type="text"
                    value={plotVariety}
                    onChange={(e) => setPlotVariety(e.target.value)}
                    placeholder="e.g. PBW-550"
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Growth Stage</label>
                  <input
                    type="text"
                    value={plotStage}
                    onChange={(e) => setPlotStage(e.target.value)}
                    placeholder="e.g. Tillering Stage (45 Days)"
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Soil Moisture (%)</label>
                  <input
                    type="number"
                    value={plotMoisture}
                    onChange={(e) => setPlotMoisture(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Last Watered</label>
                  <input
                    type="text"
                    value={plotWatered}
                    onChange={(e) => setPlotWatered(e.target.value)}
                    placeholder="e.g. 3 days ago"
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setShowPlotModal(false)}
                  className="px-4 py-2 text-stone-700 hover:bg-stone-100 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Save Field Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Revenue Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <h3 className="text-base font-bold text-stone-900">
                Edit Realized Harvest Revenue
              </h3>
              <button
                onClick={() => setShowRevenueModal(false)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRevenue} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Total Realized Harvest Sales (₹)</label>
                <input
                  type="number"
                  value={revenueInput}
                  onChange={(e) => setRevenueInput(Number(e.target.value))}
                  placeholder="e.g. 555600"
                  min="0"
                  className="w-full py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700 font-mono font-bold text-sm text-emerald-800"
                  required
                />
                <span className="text-[11px] text-stone-500 block mt-1">
                  Net Realized Margin = Revenue (₹{revenueInput.toLocaleString('en-IN')}) - Expenses (₹{totalExpense.toLocaleString('en-IN')})
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setShowRevenueModal(false)}
                  className="px-4 py-2 text-stone-700 hover:bg-stone-100 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Update Revenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
