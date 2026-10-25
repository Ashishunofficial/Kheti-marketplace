import React, { useState } from 'react';
import { 
  Building2, 
  Tractor, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Plus, 
  Phone, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  AlertCircle,
  ChevronRight,
  Boxes,
  Trash2,
  Edit2
} from 'lucide-react';
import { WarehouseFacility, EquipmentRental, ServiceBooking } from '../../types';

interface ProviderDashboardProps {
  currentUserId: string;
  currentUserName: string;
  myWarehouses: WarehouseFacility[];
  myEquipment: EquipmentRental[];
  bookingsReceived: ServiceBooking[];
  onOpenAddModal: () => void;
  onUpdateBookingStatus: (bookingId: string, status: ServiceBooking['status']) => void;
  onOpenChatWithCustomer: (booking: ServiceBooking) => void;
  isDemoMode?: boolean;
  onDeleteListing?: (id: string, type: 'warehouse' | 'equipment') => void;
  onUpdateWarehouse?: (id: string, data: Partial<WarehouseFacility>) => void;
  onUpdateEquipment?: (id: string, data: Partial<EquipmentRental>) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  currentUserId,
  currentUserName,
  myWarehouses,
  myEquipment,
  bookingsReceived,
  onOpenAddModal,
  onUpdateBookingStatus,
  onOpenChatWithCustomer,
  isDemoMode = false,
  onDeleteListing,
  onUpdateWarehouse,
  onUpdateEquipment
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const totalListings = myWarehouses.length + myEquipment.length;
  const totalBookingsCount = bookingsReceived.length;
  const pendingCount = bookingsReceived.filter(b => b.status === 'pending').length;
  const confirmedCount = bookingsReceived.filter(b => b.status === 'confirmed').length;
  const totalRevenue = bookingsReceived
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalEstimatedAmount || 0), 0);

  const filteredBookings = bookingsReceived.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200">
            <Boxes className="w-4 h-4" />
            <span>Owner & Provider Dashboard (गोदाम व यंत्र व्यवस्थापक)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
            {currentUserName}'s Post-Harvest Facility Console
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Real-time tracking of space reservations, machinery bookings, and farmer inquiries. 
            Direct farmer connections with zero intermediary fees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-800" />
            <span>+ List New Space / Machinery</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>My Active Listings</span>
            <Building2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{totalListings}</span>
            <span className="text-[11px] text-stone-500">
              ({myWarehouses.length} godowns, {myEquipment.length} machines)
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Total People Booked</span>
            <Users className="w-4 h-4 text-sky-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{totalBookingsCount}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {confirmedCount} confirmed
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${pendingCount > 0 ? 'text-amber-600' : 'text-stone-900'}`}>
              {pendingCount}
            </span>
            <span className="text-[11px] text-stone-500">Action needed</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Confirmed Booking Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-800">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: My Listed Spaces & Machinery */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900">My Registered Facilities & Machinery</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              These listings are registered under your ID ({currentUserId.slice(0, 10)}...). Only you can manage them.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </button>
        </div>

        {totalListings === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 space-y-3">
            <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-stone-800">You haven't listed any space or machinery yet</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Got extra warehouse storage, cold rooms, a tractor, harvester, or transport vehicle? 
                List it now and receive bookings directly from local farmers!
              </p>
            </div>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs hover:bg-emerald-900 transition-colors"
            >
              + List My Godown or Machinery Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myWarehouses.map((wh) => {
              const whBookings = bookingsReceived.filter(b => b.serviceId === wh.id);
              const reservedBags = whBookings
                .filter(b => b.status === 'confirmed')
                .reduce((sum, b) => sum + (b.quantityRequested || 0), 0);

              return (
                <div key={wh.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {wh.type}
                      </span>
                      {wh.isWdrcRegistered && (
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> WDRA Certified
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 mt-2">{wh.name}</h4>
                    <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{wh.district}, {wh.state}</span>
                    </div>

                    <div className="mt-3 p-2.5 bg-white border border-stone-200 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Storage Rate:</span>
                        <strong className="font-mono text-stone-900">₹{wh.ratePerBagPerMonth}/bag/mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Available Space:</span>
                        <span className="font-mono text-emerald-700 font-semibold">{wh.availableCapacityMT.toLocaleString('en-IN')} MT</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-stone-100 text-[11px]">
                        <span className="text-stone-500">Bookings Received:</span>
                        <strong className="text-stone-800">{whBookings.length} bookings ({reservedBags} bags locked)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-stone-500">{wh.contactPhone}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const newName = prompt('Update Warehouse Name:', wh.name);
                          if (newName === null) return;
                          const newRate = prompt('Update Rate per Bag (₹):', String(wh.ratePerBagPerMonth));
                          if (newRate === null) return;
                          const newCap = prompt('Update Available Capacity (MT):', String(wh.availableCapacityMT));
                          if (newCap === null) return;
                          onUpdateWarehouse?.(wh.id, {
                            name: newName.trim() || wh.name,
                            ratePerBagPerMonth: Number(newRate) || wh.ratePerBagPerMonth,
                            availableCapacityMT: Number(newCap) || wh.availableCapacityMT,
                          });
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded flex items-center gap-1"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-3 h-3 text-stone-600" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete warehouse "${wh.name}"?`)) {
                            onDeleteListing?.(wh.id, 'warehouse');
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded flex items-center gap-1"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {myEquipment.map((eq) => {
              const eqBookings = bookingsReceived.filter(b => b.serviceId === eq.id);

              return (
                <div key={eq.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        {eq.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        eq.isAvailableNow ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {eq.isAvailableNow ? 'Ready for Work' : 'Busy in Field'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 mt-2">{eq.title}</h4>
                    <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{eq.district}, {eq.state}</span>
                    </div>

                    <div className="mt-3 p-2.5 bg-white border border-stone-200 rounded-lg text-xs space-y-1">
                      {eq.ratePerAcre && (
                        <div className="flex justify-between">
                          <span className="text-stone-500">Per Acre Rate:</span>
                          <strong className="font-mono text-stone-900">₹{eq.ratePerAcre}/acre</strong>
                        </div>
                      )}
                      {eq.ratePerHour && (
                        <div className="flex justify-between">
                          <span className="text-stone-500">Hourly Rate:</span>
                          <span className="font-mono text-stone-900">₹{eq.ratePerHour}/hr</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-stone-100 text-[11px]">
                        <span className="text-stone-500">Bookings Received:</span>
                        <strong className="text-stone-800">{eqBookings.length} requests</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-stone-500">{eq.contactPhone || 'Available'}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const newTitle = prompt('Update Equipment/Vehicle Title:', eq.title);
                          if (newTitle === null) return;
                          const newRateAcre = prompt('Update Rate per Acre (₹):', String(eq.ratePerAcre || ''));
                          if (newRateAcre === null) return;
                          const newRateHour = prompt('Update Hourly Rate (₹):', String(eq.ratePerHour || ''));
                          if (newRateHour === null) return;
                          onUpdateEquipment?.(eq.id, {
                            title: newTitle.trim() || eq.title,
                            ratePerAcre: newRateAcre ? Number(newRateAcre) : eq.ratePerAcre,
                            ratePerHour: newRateHour ? Number(newRateHour) : eq.ratePerHour,
                          });
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded flex items-center gap-1"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-3 h-3 text-stone-600" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete equipment "${eq.title}"?`)) {
                            onDeleteListing?.(eq.id, 'equipment');
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded flex items-center gap-1"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: People Who Have Booked My Space / Machinery */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              People Who Have Booked Your Space / Machinery ({bookingsReceived.length})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Review customer dates, quantities, accept reservations, or open direct message threads.
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({bookingsReceived.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'pending' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'confirmed' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Confirmed ({confirmedCount})
            </button>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No booking requests matching this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-xl transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Booking Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">
                      {b.renterName}
                    </span>
                    <span className="font-mono text-xs text-stone-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {b.renterPhone}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : b.status === 'completed'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs text-stone-700">
                    Booked Service: <strong className="text-stone-900">{b.serviceTitle}</strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{b.startDate} {b.endDate ? `to ${b.endDate}` : ''}</span>
                    </span>
                    <span>
                      Quantity: <strong className="font-mono text-stone-800">{b.quantityRequested} {b.unit}</strong>
                    </span>
                    <span>
                      Est. Payout: <strong className="font-mono text-emerald-800">₹{b.totalEstimatedAmount.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>

                  {b.notes && (
                    <div className="text-xs text-stone-500 bg-white p-2 rounded border border-stone-200 max-w-xl">
                      "{b.notes}"
                    </div>
                  )}
                </div>

                {/* Booking Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200">
                  <button
                    onClick={() => onOpenChatWithCustomer(b)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Customer</span>
                  </button>

                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, 'confirmed')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Booking</span>
                      </button>
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
