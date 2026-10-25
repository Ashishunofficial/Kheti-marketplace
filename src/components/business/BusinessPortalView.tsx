import React, { useState } from 'react';
import { 
  Building2, 
  Warehouse, 
  Package, 
  TrendingUp, 
  FileText, 
  Plus, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight,
  Truck,
  RotateCcw
} from 'lucide-react';
import { CURRENT_USER } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';

interface BusinessPortalViewProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onSwitchRole: (role: 'farmer' | 'business' | 'admin') => void;
}

export const BusinessPortalView: React.FC<BusinessPortalViewProps> = ({ onNavigateTab, onSwitchRole }) => {
  const { user, profile } = useAuth();
  const isGuest = !Boolean(user);

  const businessTitle = profile?.businessName || (user ? `${profile?.name || 'Agri'} Commercial Operations` : CURRENT_USER.businessName);
  const gst = profile?.gstNumber || (isGuest ? CURRENT_USER.gstNumber : '06AAECK2948P1Z5');
  const apmc = profile?.apmcLicense || (isGuest ? CURRENT_USER.apmcLicense : 'HR-KRN-APMC-8821');

  const [inventory, setInventory] = useState([
    { id: 'inv_1', item: 'Milling Wheat (PBW-550 / FAQ)', location: 'Silo #2 (Nilokheri)', stockQuintal: 1420, capacityQuintal: 2500, qualityTest: '11.4% Moisture · 78 Test Weight', status: 'Optimal' },
    { id: 'inv_2', item: 'Basmati Paddy (Pusa 1121 Sella)', location: 'Covered Godown #1', stockQuintal: 850, capacityQuintal: 1500, qualityTest: '8.3mm Length · Zero Chalky', status: 'Optimal' },
    { id: 'inv_3', item: 'Black Mustard Seed (Oil Stock)', location: 'Dry Storage Shed #4', stockQuintal: 310, capacityQuintal: 800, qualityTest: '42.2% Oil Content Tested', status: 'Optimal' }
  ]);

  const [tenders, setTenders] = useState([
    { id: 'tnd_101', crop: 'Wheat (गेहूं)', targetQty: 1000, fulfilledQty: 420, maxPrice: 2510, deadline: '30 Oct 2026', status: 'Active Procurement' },
    { id: 'tnd_102', crop: 'Mustard (सरसों)', targetQty: 500, fulfilledQty: 180, maxPrice: 5650, deadline: '05 Nov 2026', status: 'Active Procurement' }
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Dual-Role Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800">
            <span>Agri-Business Operations & Processing Console</span>
            <span aria-hidden="true">·</span>
            <span>APMC Reg: {apmc}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            {businessTitle}
          </h1>
          <p className="text-sm text-stone-700 mt-0.5">
            GSTIN: <span className="font-mono font-medium text-stone-900">{gst}</span> · Verified Roller Flour Mill & Commercial Godown Operator.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSwitchRole('farmer')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Switch to Farmer View</span>
          </button>

          <button
            onClick={() => onNavigateTab('marketplace')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Buy Tender</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block">Total Grains in Storage</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">2,580 <span className="text-sm font-normal text-stone-700">Quintals</span></div>
          <div className="text-xs text-emerald-800 font-medium mt-1">53.7% Warehouse Capacity Utilized</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block">Active Procurement Target</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">1,500 <span className="text-sm font-normal text-stone-700">Quintals</span></div>
          <div className="text-xs text-sky-800 font-medium mt-1">600 Quintals contracted with 8 farmers</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block">Available Storage for Third-Party Rent</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">4,200 <span className="text-sm font-normal text-stone-700">MT</span></div>
          <div className="text-xs text-stone-700 mt-1">WDRA e-NWR compliant space</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block">Trade Settlement Escrow</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">₹14.8 <span className="text-sm font-normal text-stone-700">Lakh</span></div>
          <div className="text-xs text-emerald-700 font-medium mt-1">RTGS auto-released on weighment verification</div>
        </div>
      </div>

      {/* Inventory & Godown Stock Table */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-150">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Physical Stock Records</span>
            <h3 className="text-base font-bold text-stone-900 mt-0.5">Godown & Silo Inventory Tracking</h3>
          </div>
          <span className="text-xs text-stone-700">3 Storage Facilities</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-700 font-semibold">
                <th className="py-2.5 px-3">Item / Commodity</th>
                <th className="py-2.5 px-3">Facility Location</th>
                <th className="py-2.5 px-3 text-right">Current Stock</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3">Quality Lab Testing</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150">
              {inventory.map((inv) => (
                <tr key={inv.id} className="hover:bg-stone-50">
                  <td className="py-3 px-3 font-bold text-stone-900">{inv.item}</td>
                  <td className="py-3 px-3 text-stone-700">{inv.location}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                    {inv.stockQuintal.toLocaleString('en-IN')} qtl
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-stone-700">
                    {inv.capacityQuintal.toLocaleString('en-IN')} qtl
                  </td>
                  <td className="py-3 px-3 text-stone-700 font-mono text-[11px]">{inv.qualityTest}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Procurement Tenders */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-150">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Commercial Buying Tenders</span>
            <h3 className="text-base font-bold text-stone-900 mt-0.5">Direct Procurement from Farmers & FPOs</h3>
          </div>
          <span className="text-xs text-stone-700">Guaranteed payment within 24h</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenders.map((t) => (
            <div key={t.id} className="p-4 bg-stone-50 border border-stone-150 rounded-xl text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-stone-900">{t.crop} Procurement Request</span>
                <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                  {t.status}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-700">Target Volume:</span>
                  <strong className="font-mono text-stone-900">{t.targetQty} Quintals</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Procured so far:</span>
                  <span className="font-mono text-emerald-800 font-bold">{t.fulfilledQty} Quintals ({Math.round((t.fulfilledQty / t.targetQty) * 100)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Max Purchase Price:</span>
                  <strong className="font-mono text-stone-900">₹{t.maxPrice}/qtl</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Deadline:</span>
                  <span className="font-mono text-stone-700">{t.deadline}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => onNavigateTab('marketplace')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg transition-colors shadow-xs"
                >
                  Manage Inbound Farmer Offers
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
