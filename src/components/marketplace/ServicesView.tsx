import React, { useState } from 'react';
import { 
  RefreshCw,
  Building2, 
  Tractor, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  MessageSquare,
  Boxes,
  ClipboardList,
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Phone,
  Truck,
  ArrowRight,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { WarehouseFacility, EquipmentRental, ServiceBooking } from '../../types';
import { ServicesMap } from '../maps/ServicesMap';
import { useServicesManager } from '../../hooks/useServicesManager';
import { BookServiceModal } from './BookServiceModal';
import { AddServiceModal } from './AddServiceModal';
import { ProviderDashboard } from './ProviderDashboard';
import { ServiceMessagePortal } from './ServiceMessagePortal';

interface ServicesViewProps {
  onAskAI?: (prompt: string) => void;
}

type TabType = 'warehouse' | 'machinery' | 'provider-dashboard' | 'messages' | 'my-bookings';

export const ServicesView: React.FC<ServicesViewProps> = ({ onAskAI }) => {
  const {
    currentUserId,
    currentUserName,
    currentUserPhone,
    isDemo,
    isSyncing,
    refresh,
    warehouses,
    equipment,
    myWarehouses,
    myEquipment,
    bookings,
    bookingsReceived,
    bookingsMade,
    messages,
    unreadMessagesCount,
    addWarehouseListing,
    addEquipmentListing,
    createBooking,
    updateBookingStatus,
    sendMessage,
    markConversationAsRead,
    deleteListing,
    updateWarehouseListing,
    updateEquipmentListing
  } = useServicesManager();

  const [activeTab, setActiveTab] = useState<TabType>('warehouse');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<{
    service: WarehouseFacility | EquipmentRental;
    type: 'warehouse' | 'equipment';
  } | null>(null);

  // Direct Chat Jump Target
  const [chatTarget, setChatTarget] = useState<{
    userId?: string;
    serviceId?: string;
  }>({});

  // Search / Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [whTypeFilter, setWhTypeFilter] = useState<string>('all');
  const [machineryCatFilter, setMachineryCatFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [wdraOnlyToggle, setWdraOnlyToggle] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleBookingSubmit = (
    bookingData: {
      serviceId: string;
      serviceType: 'warehouse' | 'equipment' | 'logistics';
      serviceTitle: string;
      ownerId: string;
      ownerName: string;
      ownerPhone?: string;
      startDate: string;
      endDate?: string;
      quantityRequested: number;
      unit: string;
      totalEstimatedAmount: number;
      notes?: string;
    },
    initialMessageText?: string
  ) => {
    createBooking(bookingData, initialMessageText);
    showToast(`Booking request for "${bookingData.serviceTitle}" registered & sent to owner!`);
  };

  const handleOpenChatFromDashboard = (booking: ServiceBooking) => {
    setChatTarget({
      userId: booking.renterId,
      serviceId: booking.serviceId
    });
    setActiveTab('messages');
  };

  const handleOpenChatFromMyBookings = (booking: ServiceBooking) => {
    setChatTarget({
      userId: booking.ownerId,
      serviceId: booking.serviceId
    });
    setActiveTab('messages');
  };

  // Filtered Warehouses
  const filteredWarehouses = warehouses.filter(wh => {
    const matchesSearch = 
      wh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = whTypeFilter === 'all' || wh.type.toLowerCase().includes(whTypeFilter.toLowerCase());
    const matchesState = stateFilter === 'all' || wh.state.toLowerCase().includes(stateFilter.toLowerCase());
    const matchesDistrict = districtFilter === 'all' || wh.district.toLowerCase().includes(districtFilter.toLowerCase());
    const matchesWdra = !wdraOnlyToggle || wh.isWdrcRegistered;
    return matchesSearch && matchesType && matchesState && matchesDistrict && matchesWdra;
  });

  // Filtered Equipment
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = machineryCatFilter === 'all' || eq.category.toLowerCase().includes(machineryCatFilter.toLowerCase());
    const matchesState = stateFilter === 'all' || eq.state.toLowerCase().includes(stateFilter.toLowerCase());
    return matchesSearch && matchesCat && matchesState;
  });

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-4 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-900 text-white text-xs font-semibold rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white px-2 py-0.5 rounded text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── 1. HERO HEADER BANNER (EXACTLY MATCHING SCREENSHOT) ─── */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 border border-stone-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-2xl">
          {/* Header Badges Row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <span>POST-HARVEST INFRASTRUCTURE &amp; LOGISTICS</span>
            <span className="text-stone-300 font-normal">|</span>
            <span>KHETI AI STORAGE &amp; MACHINERY MARKETPLACE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
            Kheti AI Storage &amp; Machinery
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            Book verified WDRA godowns, cold storages, harvesters, or list your space &amp; machinery on Kheti AI's marketplace to receive direct bookings.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-900 hover:bg-emerald-950 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ List Space or Machinery on Kheti AI</span>
            </button>

            <button
              onClick={() => {
                refresh();
                showToast('Syncing active storage & machinery listings...');
              }}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-800 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Refreshing...' : 'Refresh Listings'}</span>
            </button>
          </div>
        </div>

        {/* Hero Illustration Graphic (Right side matching screenshot) */}
        <div className="relative shrink-0 w-44 h-44 sm:w-52 sm:h-52 hidden md:flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-200/40 rounded-full blur-2xl transform scale-90" />
          <div className="relative w-full h-full rounded-full border-4 border-white shadow-md bg-gradient-to-tr from-emerald-100 via-teal-50 to-amber-100 flex items-center justify-center p-3 text-center overflow-hidden">
            <img
              src="/assets/aistudio/Kheti_AI_Storage_Marketplace_UI_1992b236.png"
              alt="Agri Infrastructure & Machinery"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="absolute bottom-2 bg-emerald-900/90 text-white font-mono font-bold text-[10px] px-3 py-1 rounded-full backdrop-blur-xs shadow-xs">
              🏛 WDRA Certified
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. CATEGORY & PORTAL NAVIGATION CARDS STACK (EXACTLY MATCHING SCREENSHOT) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <button
          onClick={() => setActiveTab('warehouse')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
            activeTab === 'warehouse'
              ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-2xs'
              : 'bg-white border-stone-200/90 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 font-bold">
              <Building2 className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                Storage &amp; Godowns <br className="hidden sm:inline" />
                <span className="text-[11px] font-semibold text-stone-600">(गोदाम व साइलो)</span>
              </h3>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        </button>

        <button
          onClick={() => setActiveTab('machinery')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
            activeTab === 'machinery'
              ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-2xs'
              : 'bg-white border-stone-200/90 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200 font-bold">
              <Tractor className="w-5 h-5 text-teal-800" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                Farm Machinery &amp; Transport <br className="hidden sm:inline" />
                <span className="text-[11px] font-semibold text-stone-600">(कृषि यंत्र व वाहन)</span>
              </h3>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        </button>

        <button
          onClick={() => setActiveTab('provider-dashboard')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
            activeTab === 'provider-dashboard'
              ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-2xs'
              : 'bg-white border-stone-200/90 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 font-bold">
              <Boxes className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                My Space Dashboard <br className="hidden sm:inline" />
                <span className="text-[11px] font-semibold text-stone-600">(मेरा डैशबोर्ड)</span>
              </h3>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-2xs'
              : 'bg-white border-stone-200/90 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 border border-sky-200 font-bold">
              <MessageSquare className="w-5 h-5 text-sky-800" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                Message Portal <br className="hidden sm:inline" />
                <span className="text-[11px] font-semibold text-stone-600">(संदेश व पूछताछ)</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-mono font-bold">
                {unreadMessagesCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
            activeTab === 'my-bookings'
              ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-2xs'
              : 'bg-white border-stone-200/90 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 border border-purple-200 font-bold">
              <ClipboardList className="w-5 h-5 text-purple-800" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                My Bookings <br className="hidden sm:inline" />
                <span className="text-[11px] font-semibold text-stone-600">({bookingsMade.length})</span>
              </h3>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        </button>
      </div>

      {/* ─── TAB 1: WAREHOUSE & GODOWNS ─────────────────────────────────────────── */}
      {activeTab === 'warehouse' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar (Matching Screenshot) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search godowns by name, district, or state..."
                  className="w-full pl-10 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-stone-600">Type:</span>
                <div className="relative">
                  <select
                    value={whTypeFilter}
                    onChange={(e) => setWhTypeFilter(e.target.value)}
                    className="py-2 px-3 pr-8 text-xs bg-white border border-stone-250 rounded-2xl focus:outline-none focus:border-emerald-700 text-stone-900 font-bold shadow-2xs appearance-none cursor-pointer"
                  >
                    <option value="all">All Storage Types</option>
                    <option value="Dry Godown">Dry Godowns (अनाज)</option>
                    <option value="Cold Storage">Cold Storage (आलू/सब्जी)</option>
                    <option value="Silo">Steel Silos</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="py-2 px-3 pr-8 text-xs bg-white border border-stone-250 rounded-2xl focus:outline-none focus:border-emerald-700 text-stone-900 font-bold shadow-2xs appearance-none cursor-pointer"
                  >
                    <option value="all">📍 All States</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="py-2 px-3 pr-8 text-xs bg-white border border-stone-250 rounded-2xl focus:outline-none focus:border-emerald-700 text-stone-900 font-bold shadow-2xs appearance-none cursor-pointer"
                  >
                    <option value="all">🏢 All Districts</option>
                    <option value="Karnal">Karnal</option>
                    <option value="Indore">Indore</option>
                    <option value="Ludhiana">Ludhiana</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="flex items-center gap-1 border border-stone-200 rounded-2xl p-1 bg-stone-50 shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-emerald-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Grid View (2 columns)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'list' ? 'bg-emerald-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="List View (1 column)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Banner with e-NWR Toggle */}
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <MapPin className="w-4 h-4 text-emerald-800" />
                <span>Showing {filteredWarehouses.length} verified facilities on live map</span>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>WDRA e-NWR eligible only</span>
                <button
                  type="button"
                  onClick={() => setWdraOnlyToggle(!wdraOnlyToggle)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    wdraOnlyToggle ? 'bg-emerald-800' : 'bg-stone-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    wdraOnlyToggle ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <ServicesMap warehouses={filteredWarehouses} />
          </div>

          {/* Warehouses Listing Cards Feed (GRID / LIST VIEW) */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-5" : "grid grid-cols-1 gap-5"}>
            {filteredWarehouses.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-3xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🏬
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  No verified storage facilities match your filter selection
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Try clearing your state or district filter to view all available godowns.
                </p>
              </div>
            ) : (
              filteredWarehouses.map((wh) => {
                const isCold = wh.type.toLowerCase().includes('cold');

                return (
                  <div
                    key={wh.id}
                    className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3 hover:border-emerald-400 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border truncate shrink-0 ${
                            isCold
                              ? 'bg-sky-100/90 text-sky-900 border-sky-300'
                              : 'bg-amber-100/90 text-amber-900 border-amber-300'
                          }`}>
                            {wh.type.toUpperCase()}
                          </span>

                          {wh.isWdrcRegistered && (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-250 font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>WDRA</span>
                            </span>
                          )}
                        </div>

                        <button className="text-stone-400 hover:text-stone-700 p-1 shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Main Content Flex Row */}
                      <div className="flex flex-row items-start gap-3 sm:gap-4">
                        {/* Warehouse Photo Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-100 relative">
                          <img
                            src={wh.imageUrl || (isCold ? 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80')}
                            alt={wh.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Details Area */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug truncate">
                            {wh.name}
                          </h3>
                          <p className="text-xs font-bold text-stone-600 truncate">
                            Operator: <span className="text-stone-800">{wh.ownerName}</span>
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium truncate pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{wh.address || `${wh.district}, ${wh.state}`}</span>
                          </div>
                        </div>
                      </div>

                      {/* Full-width Metric Boxes Row - Clean vertical stack, zero overflow */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase tracking-wider truncate">
                            <span>📦</span>
                            <span className="truncate">Available Space</span>
                          </div>
                          <div className="mt-0.5 font-black text-emerald-900 text-sm sm:text-base font-mono truncate">
                            {wh.availableCapacityMT.toLocaleString('en-IN')} <span className="text-xs font-semibold text-stone-600 font-sans">MT</span>
                          </div>
                        </div>

                        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[10px] uppercase tracking-wider truncate">
                            <span>💰</span>
                            <span className="truncate">Storage Tariff</span>
                          </div>
                          <div className="mt-0.5 font-black text-stone-950 text-sm sm:text-base font-mono truncate">
                            ₹{wh.ratePerBagPerMonth} <span className="text-xs font-medium text-amber-900 font-sans">/ bag / mo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-150">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 truncate">
                        <Phone className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        <span className="truncate">{wh.contactPhone || '+91 98960 55441'}</span>
                      </div>

                      <button
                        onClick={() => setSelectedServiceForBooking({ service: wh, type: 'warehouse' })}
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      >
                        <span>Reserve Space</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: FARM MACHINERY & TRANSPORT ─────────────────────────────────── */}
      {activeTab === 'machinery' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search harvesters, tractors, or sprayers..."
                  className="w-full pl-10 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700 font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600">Category:</span>
                <div className="relative">
                  <select
                    value={machineryCatFilter}
                    onChange={(e) => setMachineryCatFilter(e.target.value)}
                    className="py-2 px-3 pr-8 text-xs bg-white border border-stone-250 rounded-2xl focus:outline-none focus:border-emerald-700 text-stone-900 font-bold shadow-2xs appearance-none cursor-pointer"
                  >
                    <option value="all">All Farm Machinery</option>
                    <option value="Combine Harvester">Combine Harvester (कटाई)</option>
                    <option value="Tractor & Implements">Tractor &amp; Implements (ट्रैक्टर)</option>
                    <option value="Drone Sprayer">Drone Sprayers (ड्रोन स्प्रेियर)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="flex items-center gap-1 border border-stone-200 rounded-2xl p-1 bg-stone-50 shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-emerald-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Grid View (2 columns)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'list' ? 'bg-emerald-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="List View (1 column)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Machinery Cards List (GRID / LIST VIEW) */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-5" : "grid grid-cols-1 gap-5"}>
            {filteredEquipment.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-3xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-teal-50 text-teal-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🚜
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  No machinery available for this filter
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Try selecting "All Farm Machinery" or publish your own equipment offer.
                </p>
              </div>
            ) : (
              filteredEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3 hover:border-emerald-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-teal-100/90 text-teal-900 border border-teal-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider truncate shrink-0">
                        {eq.category.toUpperCase()}
                      </span>

                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-250 font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Operator Included</span>
                      </span>
                    </div>

                    <div className="flex flex-row items-start gap-3 sm:gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-100 relative">
                        <img
                          src={eq.imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'}
                          alt={eq.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug truncate">
                          {eq.title}
                        </h3>
                        <p className="text-xs font-bold text-stone-600 truncate">
                          Provider: <span className="text-stone-800">{eq.ownerName}</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium truncate pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{eq.district}, {eq.state}</span>
                        </div>
                      </div>
                    </div>

                    {/* Full-width Metric Boxes Row - Clean vertical stack, zero overflow */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[10px] uppercase tracking-wider truncate">
                          <span>💰</span>
                          <span className="truncate">Rental Rate</span>
                        </div>
                        <div className="mt-0.5 font-black text-emerald-950 text-sm sm:text-base font-mono truncate">
                          ₹{eq.ratePerAcre || eq.ratePerHour} <span className="text-xs font-medium text-emerald-800 font-sans">/ {eq.ratePerAcre ? 'acre' : 'hr'}</span>
                        </div>
                      </div>

                      <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase tracking-wider truncate">
                          <span>📍</span>
                          <span className="truncate">Location</span>
                        </div>
                        <div className="mt-0.5 font-extrabold text-stone-900 text-xs sm:text-sm truncate">
                          {eq.district}, {eq.state}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-150">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span className="truncate">{eq.contactPhone || '+91 98124 55432'}</span>
                    </div>

                    <button
                      onClick={() => setSelectedServiceForBooking({ service: eq, type: 'equipment' })}
                      className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                    >
                      <span>Book Machine</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: PROVIDER DASHBOARD ─── */}
      {activeTab === 'provider-dashboard' && (
        <ProviderDashboard
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          myWarehouses={myWarehouses}
          myEquipment={myEquipment}
          bookingsReceived={bookingsReceived}
          onOpenAddModal={() => setShowAddModal(true)}
          onUpdateBookingStatus={(id, status) => {
            updateBookingStatus(id, status);
            showToast(`Booking updated to ${status.toUpperCase()}`);
          }}
          onOpenChatWithCustomer={handleOpenChatFromDashboard}
          onDeleteListing={deleteListing}
          onUpdateWarehouse={updateWarehouseListing}
          onUpdateEquipment={updateEquipmentListing}
          isDemoMode={isDemo}
        />
      )}

      {/* ─── TAB 4: MESSAGES ─── */}
      {activeTab === 'messages' && (
        <ServiceMessagePortal
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          messages={messages}
          bookings={bookings}
          onSendMessage={(recipientId, recipientName, serviceId, serviceTitle, text, bookingId) => {
            sendMessage(recipientId, recipientName, serviceId, serviceTitle, text, bookingId);
            showToast('Message dispatched!');
          }}
          onUpdateBookingStatus={updateBookingStatus}
          onMarkAsRead={markConversationAsRead}
          initialSelectedUserId={chatTarget.userId}
          initialSelectedServiceId={chatTarget.serviceId}
        />
      )}

      {/* ─── TAB 5: MY BOOKINGS ─── */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="pb-3 border-b border-stone-200">
            <h2 className="text-lg font-black text-stone-900">
              My Service Bookings ({bookingsMade.length})
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Track warehouse spaces and farm equipment booked by you.
            </p>
          </div>

          {bookingsMade.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <ClipboardList className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs font-bold text-stone-600">You have no active or historical bookings.</p>
              <button
                onClick={() => setActiveTab('warehouse')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-900 rounded-xl"
              >
                Browse Warehouses &amp; Machinery
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsMade.map((bk) => (
                <div key={bk.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-900 text-sm">{bk.serviceTitle}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      bk.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      bk.status === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                      'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {bk.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-stone-700">
                    <div>Owner: <strong>{bk.ownerName}</strong></div>
                    <div>Quantity: <strong>{bk.quantityRequested} {bk.unit}</strong></div>
                    <div>Start Date: <strong>{bk.startDate}</strong></div>
                    <div>Estimated Cost: <strong className="text-emerald-900 font-mono text-sm">₹{bk.totalEstimatedAmount.toLocaleString('en-IN')}</strong></div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex justify-end">
                    <button
                      onClick={() => handleOpenChatFromMyBookings(bk)}
                      className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with Owner</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book Service Modal */}
      {selectedServiceForBooking && (
        <BookServiceModal
          service={selectedServiceForBooking.service}
          serviceType={selectedServiceForBooking.type}
          onClose={() => setSelectedServiceForBooking(null)}
          onSubmitBooking={handleBookingSubmit}
          currentUserName={currentUserName}
          currentUserPhone={currentUserPhone}
        />
      )}

      {/* Add New Listing Modal */}
      {showAddModal && (
        <AddServiceModal
          onClose={() => setShowAddModal(false)}
          currentUserName={currentUserName}
          currentUserPhone={currentUserPhone}
          onAddWarehouse={(whData) => {
            addWarehouseListing(whData);
            showToast('Warehouse facility successfully listed on Kheti AI!');
          }}
          onAddEquipment={(eqData) => {
            addEquipmentListing(eqData);
            showToast('Farm machinery successfully listed on Kheti AI!');
          }}
        />
      )}
    </div>
  );
};
