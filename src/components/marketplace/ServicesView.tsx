import React, { useState } from 'react';
import { 
  Building2, 
  Tractor, 
  Truck, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Calendar,
  Sparkles,
  MessageSquare,
  Boxes,
  ClipboardList,
  Search,
  Filter
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
    warehouses,
    equipment,
    myWarehouses,
    myEquipment,
    bookingsReceived,
    bookingsMade,
    messages,
    unreadMessagesCount,
    addWarehouseListing,
    addEquipmentListing,
    createBooking,
    updateBookingStatus,
    sendMessage,
    markConversationAsRead
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
    const result = createBooking(bookingData, initialMessageText);
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
      wh.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = whTypeFilter === 'all' || wh.type === whTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filtered Equipment
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = machineryCatFilter === 'all' || eq.category === machineryCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
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

      {/* Mode Banner */}
      {isDemo ? (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-950">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>🎭 Prototype Pitch Demo Active:</strong> Showing sample post-harvest godowns and machinery for pitching. Switch to Live Account to manage your private facility.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span>
              <strong>🟢 Live Isolated Infrastructure Network:</strong> Showing facilities from other providers. Your listed space/machinery is inside <strong>"My Space Dashboard"</strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('provider-dashboard')}
            className="text-[11px] font-bold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-100 px-2.5 py-1 rounded-md shrink-0 transition-colors"
          >
            Open My Space Dashboard →
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span>Post-Harvest Agricultural Infrastructure</span>
            <span aria-hidden="true">·</span>
            <span>WDRA Godowns, Machinery & Direct Storage Bookings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Storage, Machinery & Logistics Services
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Book verified cold storages, dry godowns, harvesters, or list your own space to earn and receive bookings from local farmers.
          </p>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ List Your Space or Machinery</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
        <button
          onClick={() => setActiveTab('warehouse')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'warehouse' 
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60' 
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span>Storage & Godowns (गोदाम व साइलो)</span>
        </button>

        <button
          onClick={() => setActiveTab('machinery')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'machinery' 
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60' 
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Tractor className="w-4 h-4 text-emerald-700" />
          <span>Farm Machinery & Transport (कृषि यंत्र व वाहन)</span>
        </button>

        <button
          onClick={() => setActiveTab('provider-dashboard')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 relative ${
            activeTab === 'provider-dashboard' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Boxes className={`w-4 h-4 ${activeTab === 'provider-dashboard' ? 'text-emerald-200' : 'text-emerald-700'}`} />
          <span>My Space Dashboard (मेरा डैशबोर्ड)</span>
          {bookingsReceived.filter(b => b.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'messages' 
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60' 
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          <span>Message Portal (संदेश व पूछताछ)</span>
          {unreadMessagesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px] font-mono">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'my-bookings' 
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60' 
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-stone-500" />
          <span>My Bookings ({bookingsMade.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: WAREHOUSE & GODOWNS ─────────────────────────────────────────── */}
      {activeTab === 'warehouse' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search godowns by name, district, or state..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Type:</span>
              <select
                value={whTypeFilter}
                onChange={(e) => setWhTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 font-medium"
              >
                <option value="all">All Storage Types</option>
                <option value="Dry Godown">Dry Godowns (अनाज)</option>
                <option value="Cold Storage">Cold Storage (आलू/सब्जी)</option>
                <option value="Silo">Steel Silos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Showing {filteredWarehouses.length} verified post-harvest storage facilities</span>
            <span className="font-semibold text-emerald-800">
              WDRA Electronic Negotiable Warehouse Receipt (e-NWR) eligible
            </span>
          </div>

          {/* Warehouse Locations Map */}
          <ServicesMap warehouses={filteredWarehouses} />

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredWarehouses.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🏬
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {isDemo
                    ? 'No sample storage facilities match this filter.'
                    : 'अन्य प्रदाताओं का कोई सक्रिय गोदाम अभी उपलब्ध नहीं है (No other storage facilities found)'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {isDemo
                    ? 'Change your filter selection to browse sample godowns.'
                    : 'लाइव मोड में केवल अन्य प्रदाताओं द्वारा लिस्टेड गोदाम यहां दिखते हैं। आपके द्वारा जोड़े गए गोदाम "My Space Dashboard (मेरा डैशबोर्ड)" में प्रबंधित होते हैं।'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('provider-dashboard')}
                    className="px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors shadow-xs"
                  >
                    मेरा स्पेस डैशबोर्ड (My Space Dashboard)
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                  >
                    + अपना गोदाम जोड़ें (+ List Godown)
                  </button>
                </div>
              </div>
            ) : (
              filteredWarehouses.map((wh) => {
              const isMine = wh.ownerId === currentUserId;

              return (
                <div 
                  key={wh.id} 
                  className={`bg-white border rounded-2xl p-3.5 sm:p-5 shadow-2xs flex flex-col justify-between transition-all ${
                    isMine ? 'border-emerald-500 ring-1 ring-emerald-200 bg-emerald-50/10' : 'border-stone-200/90 hover:border-emerald-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-[10px] font-extrabold text-stone-600 uppercase tracking-wider">{wh.type}</span>
                      <div className="flex items-center gap-1.5">
                        {isMine && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Your Facility
                          </span>
                        )}
                        {wh.isWdrcRegistered && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> WDRA
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900 mt-2 leading-snug">{wh.name}</h3>
                    <div className="text-[11px] text-stone-500 font-medium mt-0.5">Operator: <strong>{wh.ownerName}</strong></div>

                    {/* Inner Specs Box (Borderless Subtle Background) */}
                    <div className="mt-2.5 p-2.5 bg-stone-50/80 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-stone-500 text-[11px]">Available Space:</span>
                        <strong className="font-mono text-emerald-800 font-bold">
                          {wh.availableCapacityMT.toLocaleString('en-IN')} MT
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 text-[11px]">Total Capacity:</span>
                        <span className="font-mono text-stone-900 font-bold">{wh.totalCapacityMT.toLocaleString('en-IN')} MT</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-stone-200/60">
                        <span className="text-stone-500 text-[11px]">Storage Tariff:</span>
                        <strong className="font-mono text-stone-900">₹{wh.ratePerBagPerMonth} / bag / month</strong>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{wh.address || `${wh.district}, ${wh.state}`}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-150 flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-600">{wh.contactPhone}</span>
                    <button
                      onClick={() => setSelectedServiceForBooking({ service: wh, type: 'warehouse' })}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                    >
                      Reserve Space
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: MACHINERY & VEHICLES ───────────────────────────────────────── */}
      {activeTab === 'machinery' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tractors, harvesters, sprayers by title or district..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Category:</span>
              <select
                value={machineryCatFilter}
                onChange={(e) => setMachineryCatFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 font-medium"
              >
                <option value="all">All Machinery & Fleets</option>
                <option value="Tractor">Tractors (ट्रैक्टर)</option>
                <option value="Combine Harvester">Combine Harvesters (हार्वेस्टर)</option>
                <option value="Drone Sprayer">Drone Sprayers (कृषि ड्रोन)</option>
                <option value="Laser Leveler">Laser Levelers</option>
                <option value="Vehicle / Transport">Transport Mini-Trucks</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Custom Hiring Centers (CHC) & Local Machine Operators</span>
            <span>All rates include operator and equipment calibration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEquipment.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-teal-50 text-teal-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🚜
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {isDemo
                    ? 'No sample machinery matches this filter.'
                    : 'अन्य ऑपरेटरों की कोई मशीन अभी उपलब्ध नहीं है (No other machinery found)'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {isDemo
                    ? 'Change your category filter to browse available sample equipment.'
                    : 'लाइव मोड में केवल अन्य ऑपरेटरों के कृषि यंत्र यहां दिखाई देते हैं। आपके द्वारा जोड़े गए यंत्र "My Space Dashboard (मेरा डैशबोर्ड)" में प्रबंधित होते हैं।'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('provider-dashboard')}
                    className="px-4 py-2 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors shadow-xs"
                  >
                    मेरा यंत्र डैशबोर्ड (My Machinery Dashboard)
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                  >
                    + अपना यंत्र किराए पर दें (+ List Machinery)
                  </button>
                </div>
              </div>
            ) : (
              filteredEquipment.map((eq) => {
              const isMine = eq.ownerId === currentUserId;

              return (
                <div 
                  key={eq.id} 
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isMine ? 'border-teal-300 ring-1 ring-teal-200 bg-teal-50/10' : 'border-stone-200 hover:border-emerald-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">{eq.category}</span>
                      <div className="flex items-center gap-1">
                        {isMine && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                            Your Machine
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          eq.isAvailableNow ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {eq.isAvailableNow ? 'Available Today' : 'In Field Work'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 mt-2.5 leading-snug">{eq.title}</h3>
                    <div className="text-xs text-stone-600 mt-1">Owner: <strong>{eq.ownerName}</strong></div>

                    <div className="mt-3 p-3 bg-stone-50 border border-stone-150 rounded-xl text-xs space-y-1">
                      {eq.ratePerAcre && (
                        <div className="flex justify-between">
                          <span className="text-stone-600">Per Acre Rate:</span>
                          <strong className="font-mono text-stone-900 font-bold">₹{eq.ratePerAcre}/acre</strong>
                        </div>
                      )}
                      {eq.ratePerHour && (
                        <div className="flex justify-between">
                          <span className="text-stone-600">Hourly Rate:</span>
                          <span className="font-mono text-stone-900">₹{eq.ratePerHour}/hour</span>
                        </div>
                      )}
                      <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-200">
                        {eq.operatorIncluded ? '✓ Operator & Fuel included' : 'Dry hire (Driver extra)'}
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{eq.district}, {eq.state}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-150 flex items-center justify-end">
                    <button
                      disabled={!eq.isAvailableNow}
                      onClick={() => setSelectedServiceForBooking({ service: eq, type: 'equipment' })}
                      className="w-full py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 rounded-lg transition-colors shadow-xs"
                    >
                      {eq.isAvailableNow ? 'Book Machinery' : 'Join Waiting List'}
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: PROVIDER DASHBOARD (OWNER VIEW) ─────────────────────────────── */}
      {activeTab === 'provider-dashboard' && (
        <ProviderDashboard
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          myWarehouses={myWarehouses}
          myEquipment={myEquipment}
          bookingsReceived={bookingsReceived}
          onOpenAddModal={() => setShowAddModal(true)}
          onUpdateBookingStatus={updateBookingStatus}
          onOpenChatWithCustomer={handleOpenChatFromDashboard}
          isDemoMode={isDemo}
        />
      )}

      {/* ─── TAB 4: MESSAGE & INQUIRY PORTAL ─────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <ServiceMessagePortal
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          messages={messages}
          bookings={[...bookingsReceived, ...bookingsMade]}
          onSendMessage={sendMessage}
          onUpdateBookingStatus={updateBookingStatus}
          onMarkAsRead={markConversationAsRead}
          initialSelectedUserId={chatTarget.userId}
          initialSelectedServiceId={chatTarget.serviceId}
        />
      )}

      {/* ─── TAB 5: MY BOOKINGS (CUSTOMER VIEW) ─────────────────────────────────── */}
      {activeTab === 'my-bookings' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                My Bookings & Reserved Spaces ({bookingsMade.length})
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Storage units and farm equipment you have booked from other owners.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('warehouse')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Browse More Facilities →
            </button>
          </div>

          {bookingsMade.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500 space-y-3">
              <ClipboardList className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="font-semibold text-stone-700">You haven't made any bookings yet.</p>
              <p>Explore verified godowns or machinery in the first two tabs to reserve space.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsMade.map((b) => (
                <div
                  key={b.id}
                  className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{b.serviceTitle}</h4>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600">
                      Owner: <strong>{b.ownerName}</strong> · Phone: {b.ownerPhone || 'Provided upon confirmation'}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-600">
                      <span>Dates: <strong>{b.startDate} {b.endDate ? `to ${b.endDate}` : ''}</strong></span>
                      <span>Reserved: <strong>{b.quantityRequested} {b.unit}</strong></span>
                      <span>Est. Tariff: <strong className="font-mono text-emerald-800">₹{b.totalEstimatedAmount.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenChatFromMyBookings(b)}
                    className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors self-start md:self-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat with Owner</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS ────────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddServiceModal
          onClose={() => {
            setShowAddModal(false);
            setActiveTab('provider-dashboard');
          }}
          onAddWarehouse={addWarehouseListing}
          onAddEquipment={addEquipmentListing}
          currentUserName={currentUserName}
          currentUserPhone={currentUserPhone}
        />
      )}

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
    </div>
  );
};
