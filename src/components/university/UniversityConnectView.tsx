import React, { useState } from 'react';
import {
  GraduationCap, Sprout, Users, FlaskConical, Award,
  Plus, CheckCircle, Building2, BookOpen, X, Sparkles, MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { CURRENT_USER } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';
import { useUniversityManager } from '../../hooks/useUniversityManager';
import type { LanguageCode } from '../layout/Navbar';
import { ExchangeCards } from './ExchangeCards';
import { PathologyDesk } from './PathologyDesk';
import { CoordinateModal, NewExchangeModal } from './ExchangeModals';
import { MasterclassesSection } from './MasterclassesSection';
import { FarmInternshipsSection } from './FarmInternshipsSection';
import { UniversityConsole } from './UniversityConsole';
import { OfferMasterclassModal } from './OfferMasterclassModal';
import { ApplyInternshipModal } from './ApplyInternshipModal';
import { ListFarmModal } from './ListFarmModal';
import { ConsultScientistModal } from './ConsultScientistModal';
import { FarmInternship } from '../../types';

// ─── Exported types for compatibility with sub-components ───────────────────────
export type ExchangeType = 'uni_needs_farmer' | 'farmer_needs_uni' | 'lab_innovation' | 'confirmed';

export interface BilateralExchange {
  id: string;
  type: ExchangeType;
  title: string;
  category: string;
  proposerName: string;
  proposerInstitutionOrVillage: string;
  isVerified: boolean;
  postedDate: string;
  summary: string;
  practicalTopics: string[];
  statA: { label: string; value: string };
  statB: { label: string; value: string };
  statC: { label: string; value: string };
  statD: { label: string; value: string };
  honorariumOrStipend: string;
  statusText: string;
  actionPrimaryText: string;
  status: 'open' | 'active' | 'confirmed';
}

const INITIAL_EXCHANGES: BilateralExchange[] = [
  {
    id: 'exc_01', type: 'uni_needs_farmer',
    title: 'Practical Zero-Tillage & Heavy Paddy Stubble Management (RAWE Practicum)',
    category: 'Stubble & Happy Seeder',
    proposerName: 'Dr. Virender Kumar (Dept of Agronomy)',
    proposerInstitutionOrVillage: 'Punjab Agricultural University (PAU), Ludhiana',
    isVerified: true, postedDate: 'Today',
    summary: 'Agriculture faculty seeking an experienced farmer in Karnal/Kurukshetra to host 24 B.Sc final-year students on active wheat-sown fields to teach live machine calibration without burning residue.',
    practicalTopics: ['How farmers adjust tractor speed and furrow openers in high-moisture paddy straw', 'Traditional judgment of soil root-zone firmness before running heavy seeders', 'Economic comparison of in-situ mulching vs chemical weed control'],
    statA: { label: 'Student Batch', value: '24 B.Sc (Hons) Students' },
    statB: { label: 'Duration', value: '3 Days On-Farm' },
    statC: { label: 'Target District', value: 'Karnal / Kurukshetra' },
    statD: { label: 'Host Honorarium', value: '₹18,000 + Logistics' },
    honorariumOrStipend: '₹18,000 Paid to Host Farmer',
    statusText: 'Seeking 1 Host Farm', actionPrimaryText: 'Apply to Host This Student Batch', status: 'open'
  },
  {
    id: 'exc_02', type: 'farmer_needs_uni',
    title: '22 Years of Organic Carbon Building & Zero-Chemical Basmati Export Production',
    category: 'Soil Organic Carbon',
    proposerName: 'Rameshwar Singh (Master Farmer)',
    proposerInstitutionOrVillage: 'Nilokheri, Karnal (Haryana)',
    isVerified: true, postedDate: 'Yesterday',
    summary: 'Practicing farmer offering interactive on-farm masterclass explaining how continuous Dhaincha green manuring reduced DAP requirement by 40% while holding 24 qtl/acre yields.',
    practicalTopics: ['Formulating high-potency cow dung Jeevamrit in 200L drums', 'Managing yellow stem borer in Pusa 1121 without banned chemicals', 'Real-world economics of export grade quality inspection at the farm gate'],
    statA: { label: 'Farmer Experience', value: '22 Years Practical' },
    statB: { label: 'Format', value: 'On-Farm Field Classroom' },
    statC: { label: 'Crops Covered', value: 'Basmati 1121, Wheat' },
    statD: { label: 'Availability', value: 'Weekends / Batches' },
    honorariumOrStipend: 'Institutional Student Lecture',
    statusText: 'Open for University Invitations', actionPrimaryText: 'Invite Farmer for Campus Lecture / Field Visit', status: 'open'
  },
  {
    id: 'exc_03', type: 'uni_needs_farmer',
    title: 'Underground Pipeline Pressure Adaptation & Micro-Drip Fertigation in Sandy Loam',
    category: 'Micro-Drip & Canal Irrigation',
    proposerName: 'Dr. Sunita Deshmukh (Water Management)',
    proposerInstitutionOrVillage: 'CCS Haryana Agricultural University (HAU), Hisar',
    isVerified: true, postedDate: '2 Days Ago',
    summary: 'College of Agricultural Engineering wants 16 M.Sc engineering scholars to observe practical farmer solutions for tube-well voltage drop and gravity-assisted venturi injection.',
    practicalTopics: ['Farmer-fabricated sand-media filters from recycled steel tanks', 'Managing tube-well motor start surges during 3-phase rural power rosters', 'Real-life drip lateral flushing techniques that prevent calcium clogging'],
    statA: { label: 'Student Batch', value: '16 M.Sc Scholars' },
    statB: { label: 'Duration', value: '2 Days Field Practicum' },
    statC: { label: 'Target District', value: 'Hisar / Panipat / Karnal' },
    statD: { label: 'Host Honorarium', value: '₹14,000 + Daily Meals' },
    honorariumOrStipend: '₹14,000 Paid to Host Farmer',
    statusText: 'Seeking 1 Host Farm', actionPrimaryText: 'Apply to Host This Student Batch', status: 'open'
  },
  {
    id: 'exc_04', type: 'lab_innovation',
    title: 'Fermented Sour Buttermilk & Copper Wire Extract for Mustard Aphid Control',
    category: 'Zero-Cost Pest Concoctions',
    proposerName: 'Suresh Kumar Sharma (Farmer Innovator)',
    proposerInstitutionOrVillage: 'Alwar, Rajasthan',
    isVerified: true, postedDate: '3 Days Ago',
    summary: 'Farmer-developed organic spray claiming 85% aphid mortality within 48 hours. Currently under formal university biochemical assay to identify active copper-lactic chelate compounds.',
    practicalTopics: ['Standardized 8-day anaerobic fermentation protocol using desi Gir cow buttermilk', 'Field trial report across 12 farmer holdings in Alwar mustard belt', 'Lab spectroscopy test results by MPKV Rahuri Entomology division'],
    statA: { label: 'Category', value: 'Zero-Cost Organic Spray' },
    statB: { label: 'Lab Status', value: 'Under Biochemical Assay' },
    statC: { label: 'Assay Lead', value: 'Dr. Arvind Patil (MPKV)' },
    statD: { label: 'Field Efficacy Claim', value: '85% Aphid Mortality' },
    honorariumOrStipend: 'Fully Funded Lab Trial',
    statusText: 'Lab Testing in Progress', actionPrimaryText: 'View Biochemical Assay Status & Dossier', status: 'active'
  }
];

interface UniversityConnectViewProps {
  onAskAI?: (prompt: string) => void;
  lang?: LanguageCode;
}

export const UniversityConnectView: React.FC<UniversityConnectViewProps> = ({ onAskAI, lang = 'hi' }) => {
  const { profile } = useAuth();
  const currentUser = profile ?? CURRENT_USER;

  const {
    masterclasses,
    internships,
    allMasterclasses,
    allInternships,
    myMasterclasses,
    myInternships,
    applications,
    consultations,
    isDemo,
    currentUserId,
    partnerUniversitiesCount,
    createMasterclass,
    enrollInMasterclass,
    createFarmInternship,
    applyForInternship,
    updateApplicationStatus,
    submitConsultation
  } = useUniversityManager();

  // Primary Views
  const [activeView, setActiveView] = useState<'masterclasses' | 'internships' | 'scientists' | 'console'>('masterclasses');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals
  const [showOfferMasterclassModal, setShowOfferMasterclassModal] = useState(false);
  const [showListFarmModal, setShowListFarmModal] = useState(false);
  const [showApplyInternshipModal, setShowApplyInternshipModal] = useState(false);
  const [selectedInternshipForApply, setSelectedInternshipForApply] = useState<FarmInternship | null>(null);
  const [showConsultModal, setShowConsultModal] = useState(false);

  // Bilateral exchanges state
  const [exchanges, setExchanges] = useState<BilateralExchange[]>(INITIAL_EXCHANGES);
  const [showCoordinateModal, setShowCoordinateModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<BilateralExchange | null>(null);
  const [coordDates, setCoordDates] = useState('12–14 Nov 2026');
  const [coordMessage, setCoordMessage] = useState('');
  const [coordHeadcount, setCoordHeadcount] = useState('20 Students');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newExchangeType, setNewExchangeType] = useState<ExchangeType>('farmer_needs_uni');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Stubble & Happy Seeder');
  const [newSummary, setNewSummary] = useState('');
  const [newHighlights, setNewHighlights] = useState('');
  const [newStatA, setNewStatA] = useState('');
  const [newStatB, setNewStatB] = useState('');
  const [newHonorarium, setNewHonorarium] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleEnrollMasterclass = async (mcId: string) => {
    await enrollInMasterclass(mcId, currentUser.id);
    showToast('Successfully enrolled in university masterclass! Direct live video link sent to your academic dashboard.');
  };

  const handleOpenApplyModal = (internship: FarmInternship) => {
    setSelectedInternshipForApply(internship);
    setShowApplyInternshipModal(true);
  };

  const handleOpenCoordinate = (exc: BilateralExchange) => {
    setSelectedExchange(exc);
    setCoordMessage(`Hello ${exc.proposerName}, we would like to coordinate on "${exc.title}". Please review our proposed dates.`);
    setShowCoordinateModal(true);
  };

  const handleConfirmCoordination = () => {
    if (!selectedExchange) return;
    setExchanges(prev => prev.map(e =>
      e.id === selectedExchange.id
        ? { ...e, status: 'confirmed' as const, statusText: 'Bilateral Coordination Confirmed', actionPrimaryText: 'Manage Confirmed Practicum / Session' }
        : e
    ));
    setShowCoordinateModal(false);
    showToast(`Exchange confirmed with ${selectedExchange.proposerName}! Notification sent.`);
  };

  const handleCreateExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newEntry: BilateralExchange = {
      id: `exc_${Date.now()}`, type: newExchangeType, title: newTitle, category: newCategory,
      proposerName: newExchangeType === 'uni_needs_farmer' ? 'University Faculty Lead' : `${currentUser.name} (Field Expert)`,
      proposerInstitutionOrVillage: newExchangeType === 'uni_needs_farmer' ? 'State Agricultural University Extension' : `${currentUser.village}, ${currentUser.district}`,
      isVerified: true, postedDate: 'Just now',
      summary: newSummary || 'Practical agricultural knowledge exchange proposal submitted.',
      practicalTopics: newHighlights ? newHighlights.split('\n').filter(Boolean) : ['Direct field observation on live soil', 'Hands-on practical feedback'],
      statA: { label: newExchangeType === 'uni_needs_farmer' ? 'Student Batch' : 'Experience', value: newStatA || '20 Students' },
      statB: { label: newExchangeType === 'uni_needs_farmer' ? 'Duration' : 'Format', value: newStatB || '2 Days' },
      statC: { label: 'Location', value: `${currentUser.district}, ${currentUser.state}` },
      statD: { label: 'Honorarium', value: newHonorarium || 'Host Honorarium Provided' },
      honorariumOrStipend: newHonorarium || 'Institutional Host Stipend',
      statusText: newExchangeType === 'uni_needs_farmer' ? 'Seeking Farmer Hosts' : 'Open for Invitations',
      actionPrimaryText: newExchangeType === 'uni_needs_farmer' ? 'Apply to Host This Batch' : 'Invite Farmer',
      status: 'open'
    };
    setExchanges(prev => [newEntry, ...prev]);
    setShowNewModal(false);
    showToast('New bilateral exchange published!');
  };

  const STATS = [
    { label: 'Partner Universities', value: `${partnerUniversitiesCount}+`, sub: 'PAU, CCS HAU, IARI, MPKV & KVKs', icon: <Building2 className="w-4 h-4" />, iconBg: 'bg-amber-50 text-amber-700', valueColor: 'text-stone-900' },
    { label: 'Active Masterclasses', value: `${masterclasses.length}`, sub: 'Offered by senior faculty', icon: <GraduationCap className="w-4 h-4" />, iconBg: 'bg-amber-50 text-amber-800', valueColor: 'text-amber-900' },
    { label: 'Working Farm Internships', value: `${internships.length}`, sub: 'Field practicums on live farms', icon: <Sprout className="w-4 h-4" />, iconBg: 'bg-emerald-50 text-emerald-800', valueColor: 'text-emerald-800' },
    { label: 'Scientist Consultations', value: `${consultations.length}`, sub: 'Direct laboratory diagnoses', icon: <FlaskConical className="w-4 h-4" />, iconBg: 'bg-sky-50 text-sky-700', valueColor: 'text-sky-800' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="p-3 bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </motion.div>
      )}

      {/* Mode Banner */}
      {isDemo ? (
        <div className="p-2 px-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-[11px] text-amber-950">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>Pitch Demo Mode:</strong> Sample PAU/HAU masterclasses &amp; internships
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2 px-3 bg-emerald-50/90 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-2 text-[11px] text-emerald-950">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span className="truncate">
              <strong>Academic Network:</strong> Verified courses &amp; farm practicums
            </span>
          </div>
          <button
            onClick={() => setActiveView('console')}
            className="text-[10px] font-bold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 transition-colors whitespace-nowrap"
          >
            Academic Console →
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <span>50-50 Bilateral Agricultural Intelligence & Field Immersion</span>
            <span aria-hidden="true">·</span>
            <span>विश्वविद्यालय एवं वैज्ञानिक संवाद मंच</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            {lang === 'hi' ? 'विश्वविद्यालय वैज्ञानिक मास्टरक्लास एवं किसान इंटर्नशिप मंच' : 'University Scientists & Farm Practicum Portal'}
          </h1>
          <p className="text-sm text-stone-700 mt-0.5">
            Verified professors offer masterclasses, experienced farmers host student internships on their working fields, and farmers directly consult scientific laboratories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowOfferMasterclassModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-xs"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मास्टरक्लास प्रस्तावित करें' : 'Offer Masterclass'}</span>
          </button>
          <button
            onClick={() => setShowListFarmModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            <Sprout className="w-4 h-4" />
            <span>{lang === 'hi' ? 'खेत इंटर्नशिप हेतु सूचीबद्ध करें' : 'List Farm for Interns'}</span>
          </button>
          <button
            onClick={() => setShowConsultModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-lg transition-colors shadow-xs"
          >
            <FlaskConical className="w-4 h-4 text-sky-800" />
            <span>{lang === 'hi' ? 'वैज्ञानिक से सीधा सवाल' : 'Ask Pathologist'}</span>
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {STATS.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>{stat.icon}</div>
            </div>
            <div className={`text-2xl font-extrabold font-mono ${stat.valueColor} mt-2`}>{stat.value}</div>
            <div className="text-[11px] text-stone-600 mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Module Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 border border-stone-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-lg">
          <button
            onClick={() => setActiveView('masterclasses')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'masterclasses' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>1. University Masterclasses ({masterclasses.length})</span>
          </button>

          <button
            onClick={() => setActiveView('internships')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'internships' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>2. Farm Internships on Live Fields ({internships.length})</span>
          </button>

          <button
            onClick={() => setActiveView('scientists')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'scientists' ? 'bg-sky-800 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>3. Scientist Desk & Pathologist Network</span>
          </button>

          <button
            onClick={() => setActiveView('console')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 relative ${
              activeView === 'console' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-800 hover:bg-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>My Academic Console (मेरा डैशबोर्ड)</span>
            {applications.filter(a => a.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Masterclasses */}
      {activeView === 'masterclasses' && (
        <MasterclassesSection
          masterclasses={masterclasses}
          currentUserId={currentUser.id}
          onEnroll={handleEnrollMasterclass}
          onOpenOffer={() => setShowOfferMasterclassModal(true)}
        />
      )}

      {/* Tab 2: Farm Internships */}
      {activeView === 'internships' && (
        <FarmInternshipsSection
          internships={internships}
          onOpenApply={handleOpenApplyModal}
          onOpenListFarm={() => setShowListFarmModal(true)}
        />
      )}

      {/* Tab 3: Scientist Desk */}
      {activeView === 'scientists' && (
        <div className="space-y-6">
          <PathologyDesk lang={lang} onAskAI={onAskAI} />

          {/* Equalizer Bilateral Card */}
          <div className="bg-white border border-amber-300 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">⚖️</div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">50-50 Bilateral Knowledge Bridge (दो-तरफ़ा संवाद)</h3>
                  <p className="text-xs text-stone-600">Both universities and veteran farmers actively teach, validate, and collaborate</p>
                </div>
              </div>
              <button
                onClick={() => setShowConsultModal(true)}
                className="px-3 py-1.5 bg-emerald-800 text-white font-bold rounded-lg text-xs hover:bg-emerald-900 transition-colors"
              >
                Submit Crop Symptom Query
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs"><GraduationCap className="w-4 h-4 text-amber-700" /><span>What Universities Gain From Farmers</span></span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">Ground Reality</span>
                </div>
                <ul className="text-stone-700 space-y-1.5 text-[11px] list-disc list-inside">
                  <li>Real-world machine calibration in heavy crop stubble under damp mornings</li>
                  <li>Traditional root-zone moisture judgment without expensive sensors</li>
                  <li>Veteran farmer guest lectures in university auditoriums</li>
                </ul>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs"><Sprout className="w-4 h-4 text-emerald-700" /><span>What Farmers Gain From Universities</span></span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">Lab Validation</span>
                </div>
                <ul className="text-stone-700 space-y-1.5 text-[11px] list-disc list-inside">
                  <li>Biochemical lab testing & validation of homemade pest concoctions</li>
                  <li>Scientific microscopic fungal & bacterial disease diagnosis</li>
                  <li>Certified university honorarium for farmer time & knowledge transfer</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bilateral Exchange Cards */}
          <div className="mt-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3">Field Exchange & Practicum Boards</h3>
            <ExchangeCards exchanges={exchanges} onCoordinate={handleOpenCoordinate} />
          </div>
        </div>
      )}

      {/* Tab 4: Console */}
      {activeView === 'console' && (
        <UniversityConsole
          currentUser={currentUser}
          currentUserId={currentUserId}
          isDemoMode={isDemo}
          masterclasses={allMasterclasses}
          internships={allInternships}
          applications={applications}
          consultations={consultations}
          onAcceptApplication={(appId) => {
            updateApplicationStatus(appId, 'accepted');
            showToast('Student application accepted! Placement confirmation dispatched.');
          }}
          onRejectApplication={(appId) => {
            updateApplicationStatus(appId, 'rejected');
            showToast('Application updated.');
          }}
          onOpenOfferMasterclass={() => setShowOfferMasterclassModal(true)}
          onOpenListFarm={() => setShowListFarmModal(true)}
          onOpenConsultation={() => setShowConsultModal(true)}
        />
      )}

      {/* Modals */}
      <OfferMasterclassModal
        isOpen={showOfferMasterclassModal}
        onClose={() => setShowOfferMasterclassModal(false)}
        onSubmit={async (data) => {
          await createMasterclass(data);
          showToast('University Masterclass scheduled and published to the academic portal!');
        }}
      />

      <ApplyInternshipModal
        isOpen={showApplyInternshipModal}
        internship={selectedInternshipForApply}
        onClose={() => setShowApplyInternshipModal(false)}
        onSubmit={async (data) => {
          await applyForInternship(data);
          showToast('Internship application submitted to the host farmer! Track status in your console.');
        }}
      />

      <ListFarmModal
        isOpen={showListFarmModal}
        currentUser={currentUser}
        onClose={() => setShowListFarmModal(false)}
        onSubmit={async (data) => {
          await createFarmInternship(data);
          showToast('Your farm has been listed for student internships! Students will be able to apply.');
        }}
      />

      <ConsultScientistModal
        isOpen={showConsultModal}
        currentUser={currentUser}
        onClose={() => setShowConsultModal(false)}
        onSubmit={async (data) => {
          await submitConsultation(data);
          showToast('Field query submitted to university pathologist desk! Review diagnosis in your console.');
        }}
      />

      <CoordinateModal
        isOpen={showCoordinateModal}
        exchange={selectedExchange}
        coordDates={coordDates}
        coordHeadcount={coordHeadcount}
        coordMessage={coordMessage}
        onChangeDates={setCoordDates}
        onChangeHeadcount={setCoordHeadcount}
        onChangeMessage={setCoordMessage}
        onClose={() => setShowCoordinateModal(false)}
        onConfirm={handleConfirmCoordination}
      />

      <NewExchangeModal
        isOpen={showNewModal}
        exchangeType={newExchangeType}
        title={newTitle}
        category={newCategory}
        summary={newSummary}
        highlights={newHighlights}
        statA={newStatA}
        statB={newStatB}
        honorarium={newHonorarium}
        onChangeType={setNewExchangeType}
        onChangeTitle={setNewTitle}
        onChangeCategory={setNewCategory}
        onChangeSummary={setNewSummary}
        onChangeHighlights={setNewHighlights}
        onChangeStatA={setNewStatA}
        onChangeStatB={setNewStatB}
        onChangeHonorarium={setNewHonorarium}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleCreateExchange}
      />
    </div>
  );
};
