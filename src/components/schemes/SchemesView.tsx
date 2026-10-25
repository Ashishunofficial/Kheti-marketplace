import React, { useState } from 'react';
import { 
  Building, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  Calculator, 
  FileCheck, 
  Search, 
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
  Loader2
} from 'lucide-react';
import { useSchemes } from '../../hooks/useSupabaseData';

interface SchemesViewProps {
  onAskAI?: (prompt: string) => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({ onAskAI }) => {
  const { schemes, loading } = useSchemes();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Eligibility Calculator
  const [calcLandAcres, setCalcLandAcres] = useState<number>(8);
  const [calcState, setCalcState] = useState<string>('Haryana');
  const [calcHasAadhaarKyc, setCalcHasAadhaarKyc] = useState<boolean>(true);
  const [calcIsLoanee, setCalcIsLoanee] = useState<boolean>(false);
  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Government Schemes' },
    { id: 'direct_benefit', label: 'Direct Cash Support (DBT)' },
    { id: 'insurance', label: 'Crop Insurance (Fasal Bima)' },
    { id: 'credit_subsidy', label: 'Credit & Loans (KCC)' },
    { id: 'machinery', label: 'Tractor / Machine Subsidy' },
    { id: 'infrastructure', label: 'Warehouse & Godown Funds' }
  ];

  const filteredSchemes = schemes.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = 
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameHi.includes(searchQuery) ||
      s.benefitSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const checkEligibility = () => {
    let list: string[] = [];
    if (calcHasAadhaarKyc) {
      list.push('PM-KISAN: 100% Eligible for ₹6,000/yr direct income transfer');
      list.push('Kisan Credit Card (KCC): Eligible for subsidized loan up to ₹3.00 Lakh @ 4% interest');
    }
    if (calcLandAcres > 0) {
      list.push('PM Fasal Bima (PMFBY): Eligible for comprehensive weather/calamity insurance @ 1.5% Rabi premium');
    }
    if (calcLandAcres <= 10) {
      list.push('SMAM Farm Machinery: Eligible for 40% to 50% capital subsidy on tractor implements & rotavators');
    }
    setEligibilityResult(list.join('\n• '));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-stone-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading government schemes...
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span>Official Government Notices & Welfare Schemes</span>
            <span aria-hidden="true">·</span>
            <span>Ministry of Agriculture & Farmers Welfare</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">Sarkari Yojanaen & Subsidies</h1>
          <p className="text-sm text-stone-700 mt-0.5">
            Verified official guidelines, documentation requirements, and direct application links for central & state farming schemes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Links verified against official .gov.in & .nic.in portals</span>
        </div>
      </div>

      {/* Interactive Scheme Eligibility Calculator Card */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Instant Subsidy & Scheme Eligibility Checker
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-1">Find out what government benefits your farm qualifies for</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Select your landholding size and KYC status to calculate your direct entitlement under PM-KISAN, KCC, and machinery subsidies.
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-stone-900">
              <div className="bg-white p-2.5 rounded-lg">
                <label className="text-[11px] font-semibold text-stone-700 block">Land Size (Acres)</label>
                <input
                  type="number"
                  value={calcLandAcres}
                  onChange={(e) => setCalcLandAcres(Number(e.target.value))}
                  min={0.5}
                  max={500}
                  className="w-full text-sm font-bold font-mono focus:outline-none"
                />
              </div>

              <div className="bg-white p-2.5 rounded-lg">
                <label className="text-[11px] font-semibold text-stone-700 block">State</label>
                <select
                  value={calcState}
                  onChange={(e) => setCalcState(e.target.value)}
                  className="w-full text-xs font-semibold focus:outline-none"
                >
                  <option value="Haryana">Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                </select>
              </div>

              <div className="bg-white p-2.5 rounded-lg col-span-2 sm:col-span-1 flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block">Aadhaar e-KYC</label>
                  <span className="text-xs font-bold text-emerald-800">{calcHasAadhaarKyc ? 'Verified' : 'Pending'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={calcHasAadhaarKyc}
                  onChange={(e) => setCalcHasAadhaarKyc(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={checkEligibility}
                className="px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-lg transition-colors shadow-xs"
              >
                Evaluate My Eligibility
              </button>
            </div>
          </div>

          {/* Results Box */}
          <div className="lg:w-80 bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-4 text-xs">
            <span className="font-bold text-emerald-200 block mb-2">Qualified Beneficiary Results:</span>
            {eligibilityResult ? (
              <div className="text-white space-y-1.5 leading-relaxed">
                <div>• {eligibilityResult}</div>
              </div>
            ) : (
              <div className="text-emerald-100 text-xs italic">
                Click 'Evaluate My Eligibility' to generate your personalized subsidy breakdown.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 bg-stone-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheme name or benefit..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 focus:bg-white"
          />
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {scheme.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-stone-700">{scheme.verifiedDate}</span>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-stone-900">{scheme.nameEn}</h3>
                <div className="text-xs text-stone-700 font-medium">{scheme.nameHi}</div>
                <div className="text-[11px] text-stone-700 mt-0.5">{scheme.ministry}</div>
              </div>

              <p className="mt-3 text-xs text-stone-700 leading-relaxed">
                {scheme.benefitSummary}
              </p>

              <div className="mt-3 p-3 bg-stone-50 border border-stone-150 rounded-lg text-xs space-y-2">
                <div>
                  <span className="text-stone-700 block font-medium">Financial Assistance / Subsidy:</span>
                  <span className="font-bold text-emerald-800 text-sm">{scheme.financialAssistance}</span>
                </div>
                <div>
                  <span className="text-stone-700 block font-medium">Target Beneficiaries:</span>
                  <span className="text-stone-900">{scheme.targetBeneficiaries}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-800 block">Required Documentation:</span>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.requiredDocuments.map((doc, i) => (
                    <span key={i} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px]">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-150 flex items-center justify-between">
              {onAskAI && (
                <button
                  onClick={() => onAskAI(`What is the step by step process to apply for ${scheme.nameEn}?`)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Application Guide
                </button>
              )}

              <a
                href={scheme.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
