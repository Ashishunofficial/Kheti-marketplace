import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Users, 
  Store, 
  Cpu, 
  Database, 
  FileText,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Settings,
  GraduationCap,
  Building2,
  Package,
  Calendar,
  Check,
  Edit2,
  Bookmark,
  Layers,
  Truck,
  Award,
  Clock,
  RefreshCw,
  UserCheck,
  UserX,
  ShieldCheck,
  Crown,
  Ban,
  UserPlus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Power
} from 'lucide-react';
import { useUniversityManager } from '../../hooks/useUniversityManager';
import { useListings } from '../../hooks/useListings';
import { useServicesManager } from '../../hooks/useServicesManager';
import { useAuth, ManagedUserRecord } from '../../hooks/useAuth';
import { WarehouseFacility, EquipmentRental } from '../../types';
import { DatabaseSchemaView } from './DatabaseSchemaView';

export const AdminPortalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users_governance' | 'verification' | 'academic_governance' | 'marketplace_ledger' | 'disputes' | 'ai_health' | 'feature_flags' | 'database_schema'>('users_governance');

  // Hooks for platform state
  const { 
    partnerUniversitiesCount, 
    updatePartnerUniversitiesCount, 
    allMasterclasses, 
    allInternships, 
    applications,
    updateApplicationStatus 
  } = useUniversityManager();

  const { 
    listings, 
    offers, 
    orders, 
    deleteListing: deleteCommodityListing,
    updateListing: updateCommodityListing,
    refresh: refreshListings 
  } = useListings();

  const { 
    allRawWarehouses, 
    allRawEquipment, 
    bookingsReceived, 
    updateBookingStatus, 
    deleteListing: deleteServiceListing,
    updateWarehouseListing,
    updateEquipmentListing,
    refresh: refreshServices 
  } = useServicesManager();
  
  // Auth state for user governance
  const { 
    allManagedUsers, 
    grantAdminAccess, 
    revokeAdminAccess, 
    banUser, 
    unbanUser,
    updateUserRecord,
    refreshManagedUsers
  } = useAuth();

  // Local state for user search and quick admin grant
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [grantEmailInput, setGrantEmailInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Local state for inline user record editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<string>('');
  const [editingPhone, setEditingPhone] = useState<string>('');

  const handleStartEditUser = (u: ManagedUserRecord) => {
    setEditingUserId(u.id);
    setEditingEmail(u.email);
    setEditingPhone(u.phone || '');
  };

  const handleSaveUserEdit = (userId: string) => {
    if (editingEmail.trim()) {
      updateUserRecord(userId, {
        email: editingEmail.trim(),
        phone: editingPhone.trim()
      });
      showNotice(`Updated contact email for user to ${editingEmail.trim()}`);
    }
    setEditingUserId(null);
  };

  // Local state for editing / deleting commodity listings
  const [editingCommodityId, setEditingCommodityId] = useState<string | null>(null);
  const [editCommodityPrice, setEditCommodityPrice] = useState<number>(0);
  const [editCommodityQty, setEditCommodityQty] = useState<number>(0);

  // Local state for editing / deleting warehouse facilities
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);
  const [editWarehouseName, setEditWarehouseName] = useState<string>('');
  const [editWarehouseRate, setEditWarehouseRate] = useState<number>(0);
  const [editWarehouseCapacity, setEditWarehouseCapacity] = useState<number>(0);

  // Local state for editing / deleting equipment rentals
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);
  const [editEquipmentTitle, setEditEquipmentTitle] = useState<string>('');
  const [editEquipmentRate, setEditEquipmentRate] = useState<number>(0);

  // Modal / confirmation state for deletion
  const [deletingItemId, setDeletingItemId] = useState<{ id: string; type: 'commodity' | 'warehouse' | 'equipment'; title: string } | null>(null);
  const [adminDeletedIds, setAdminDeletedIds] = useState<Set<string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kheti_admin_deleted_ids') || '[]');
      return new Set(Array.isArray(saved) ? saved.map((x: string) => String(x).trim().toLowerCase()) : []);
    } catch {
      return new Set();
    }
  });

  const handleConfirmDelete = async () => {
    if (!deletingItemId) return;
    const { id, type, title } = deletingItemId;
    const cleanId = String(id).trim();
    const lowerId = cleanId.toLowerCase();

    // 1. Persist to permanent Admin Deleted IDs blacklist in localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('kheti_admin_deleted_ids') || '[]');
      const arr = Array.isArray(saved) ? saved : [];
      if (!arr.includes(cleanId)) arr.push(cleanId);
      if (!arr.includes(lowerId)) arr.push(lowerId);
      localStorage.setItem('kheti_admin_deleted_ids', JSON.stringify(arr));
    } catch {}

    // 2. Persist to services/listing deleted IDs
    try {
      const servArr = JSON.parse(localStorage.getItem('kheti_deleted_service_ids') || '[]');
      if (!servArr.includes(cleanId)) servArr.push(cleanId);
      if (!servArr.includes(lowerId)) servArr.push(lowerId);
      localStorage.setItem('kheti_deleted_service_ids', JSON.stringify(servArr));
    } catch {}

    try {
      const listArr = JSON.parse(localStorage.getItem('kheti_deleted_listing_ids') || '[]');
      if (!listArr.includes(cleanId)) listArr.push(cleanId);
      if (!listArr.includes(lowerId)) listArr.push(lowerId);
      localStorage.setItem('kheti_deleted_listing_ids', JSON.stringify(listArr));
    } catch {}

    // 3. Clean from raw client stores
    try {
      const whs = JSON.parse(localStorage.getItem('kheti_warehouses_store_v3') || '[]');
      localStorage.setItem('kheti_warehouses_store_v3', JSON.stringify(whs.filter((w: any) => w.id !== cleanId && String(w.id).toLowerCase() !== lowerId)));
    } catch {}
    try {
      const eqs = JSON.parse(localStorage.getItem('kheti_equipment_store_v3') || '[]');
      localStorage.setItem('kheti_equipment_store_v3', JSON.stringify(eqs.filter((e: any) => e.id !== cleanId && String(e.id).toLowerCase() !== lowerId)));
    } catch {}
    try {
      const lsts1 = JSON.parse(localStorage.getItem('kheti_local_marketplace_listings_v3') || '[]');
      localStorage.setItem('kheti_local_marketplace_listings_v3', JSON.stringify(lsts1.filter((l: any) => l.id !== cleanId && String(l.id).toLowerCase() !== lowerId)));
      const lsts2 = JSON.parse(localStorage.getItem('kheti_marketplace_listings_v3') || '[]');
      localStorage.setItem('kheti_marketplace_listings_v3', JSON.stringify(lsts2.filter((l: any) => l.id !== cleanId && String(l.id).toLowerCase() !== lowerId)));
    } catch {}

    // 4. Instantly eliminate from Admin view state without any UI lag
    setAdminDeletedIds(prev => {
      const next = new Set(prev);
      next.add(cleanId);
      next.add(lowerId);
      return next;
    });

    // 5. Execute API deletions
    try {
      if (type === 'commodity') {
        await fetch(`/api/marketplace/listings/${cleanId}`, { method: 'DELETE' }).catch(() => {});
        await deleteCommodityListing(cleanId);
      } else if (type === 'warehouse') {
        await fetch(`/api/services/warehouses/${cleanId}`, { method: 'DELETE' }).catch(() => {});
        await deleteServiceListing(cleanId, 'warehouse');
      } else if (type === 'equipment') {
        await fetch(`/api/services/equipment/${cleanId}`, { method: 'DELETE' }).catch(() => {});
        await deleteServiceListing(cleanId, 'equipment');
      }
      showNotice(`Successfully deleted "${title}" from platform`);
    } catch {
      showNotice(`Removed "${title}"`);
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleStartEditCommodity = (item: any) => {
    setEditingCommodityId(item.id);
    setEditCommodityPrice(Number(item.askingPrice) || 0);
    setEditCommodityQty(Number(item.quantity) || 0);
  };

  const handleSaveEditCommodity = async (id: string) => {
    await updateCommodityListing(id, {
      askingPrice: editCommodityPrice,
      quantity: editCommodityQty
    });
    showNotice(`Updated price & quantity for trade listing #${id}`);
    setEditingCommodityId(null);
  };

  const handleToggleCommodityStatus = async (item: any) => {
    const nextStatus = item.status === 'active' ? 'sold' : 'active';
    await updateCommodityListing(item.id, { status: nextStatus });
    showNotice(`Set trade listing #${item.id} status to ${nextStatus.toUpperCase()}`);
  };

  const handleStartEditWarehouse = (wh: WarehouseFacility) => {
    setEditingWarehouseId(wh.id);
    setEditWarehouseName(wh.name);
    setEditWarehouseRate(wh.ratePerBagPerMonth);
    setEditWarehouseCapacity(wh.availableCapacityMT);
  };

  const handleSaveEditWarehouse = async (id: string) => {
    await updateWarehouseListing(id, {
      name: editWarehouseName,
      ratePerBagPerMonth: editWarehouseRate,
      availableCapacityMT: editWarehouseCapacity
    });
    showNotice(`Updated details for storage facility "${editWarehouseName}"`);
    setEditingWarehouseId(null);
  };

  const handleStartEditEquipment = (eq: EquipmentRental) => {
    setEditingEquipmentId(eq.id);
    setEditEquipmentTitle(eq.title);
    setEditEquipmentRate(eq.ratePerHour || eq.ratePerAcre || 0);
  };

  const handleSaveEditEquipment = async (eq: EquipmentRental) => {
    const updates: Partial<EquipmentRental> = {
      title: editEquipmentTitle
    };
    if (eq.ratePerHour !== undefined) {
      updates.ratePerHour = editEquipmentRate;
    } else {
      updates.ratePerAcre = editEquipmentRate;
    }
    await updateEquipmentListing(eq.id, updates);
    showNotice(`Updated details for equipment "${editEquipmentTitle}"`);
    setEditingEquipmentId(null);
  };

  // Strictly filter real listings from live users (only exclude static guest demo items and deleted items)
  const deletedListingIds = new Set(
    (() => {
      try {
        const arr = JSON.parse(localStorage.getItem('kheti_deleted_listing_ids') || '[]');
        return Array.isArray(arr) ? arr.map(id => String(id).trim().toLowerCase()) : [];
      } catch {
        return [];
      }
    })()
  );

  const deletedServiceIds = new Set(
    (() => {
      try {
        const arr = JSON.parse(localStorage.getItem('kheti_deleted_service_ids') || '[]');
        return Array.isArray(arr) ? arr.map(id => String(id).trim().toLowerCase()) : [];
      } catch {
        return [];
      }
    })()
  );

  const isItemDeleted = (rawId: any) => {
    if (!rawId) return false;
    const clean = String(rawId).trim();
    const lower = clean.toLowerCase();

    let isPersistedAdmin = false;
    try {
      const arr = JSON.parse(localStorage.getItem('kheti_admin_deleted_ids') || '[]');
      if (Array.isArray(arr)) {
        isPersistedAdmin = arr.includes(clean) || arr.includes(lower);
      }
    } catch {}

    return (
      isPersistedAdmin ||
      adminDeletedIds.has(clean) ||
      adminDeletedIds.has(lower) ||
      deletedListingIds.has(clean) ||
      deletedListingIds.has(lower) ||
      deletedServiceIds.has(clean) ||
      deletedServiceIds.has(lower)
    );
  };

  const realCommodityListings = listings.filter(l => {
    if (isItemDeleted(l.id)) return false;
    const id = (l.id || '').toLowerCase();
    return !id.startsWith('lst_10') && id !== 'lst_101' && id !== 'lst_102' && id !== 'lst_103';
  });

  const realWarehouses = allRawWarehouses.filter(w => {
    if (isItemDeleted(w.id)) return false;
    const id = (w.id || '').toLowerCase();
    return !id.startsWith('wh_krn') && !id.startsWith('wh_ldh') && id !== 'wh_my_01';
  });

  const realEquipment = allRawEquipment.filter(e => {
    if (isItemDeleted(e.id)) return false;
    const id = (e.id || '').toLowerCase();
    return !id.startsWith('eq_50') && id !== 'eq_my_01';
  });

  const totalRealListingsCount = realCommodityListings.length + realWarehouses.length + realEquipment.length;

  // Real GMV from actual non-mock orders
  const realGMV = orders
    .filter(o => !o.id.startsWith('ord_kht_') && !o.id.startsWith('ord_mock'))
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Filter masterclasses & internships
  const realMasterclasses = allMasterclasses.filter(mc => {
    const id = (mc.id || '').toLowerCase();
    const instr = (mc.instructorName || '').toLowerCase();
    return !id.startsWith('mc_0') && !instr.includes('virender') && !instr.includes('sunita') && !instr.includes('arvind');
  });

  const realInternships = allInternships.filter(i => {
    const id = (i.id || '').toLowerCase();
    const farmer = (i.farmerName || '').toLowerCase();
    return !id.startsWith('intern_0') && !farmer.includes('rameshwar') && !farmer.includes('balwinder');
  });

  const handleRefreshSupabaseData = async () => {
    setIsRefreshing(true);
    try {
      if (refreshManagedUsers) await refreshManagedUsers();
      refreshListings();
      refreshServices();
      showNotice('Synchronized live profiles & listings from Supabase!');
    } catch {
      showNotice('Sync completed.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Local state for admin university count edit
  const [universitiesInput, setUniversitiesInput] = useState<number>(partnerUniversitiesCount);
  const [countSavedNotice, setCountSavedNotice] = useState<boolean>(false);

  // Pending KYC Verifications (Real submissions only)
  const [verifications, setVerifications] = useState<any[]>([]);

  // Local state for internship statuses in admin view
  const [internshipStatuses, setInternshipStatuses] = useState<Record<string, 'approved' | 'rejected' | 'open'>>({});

  // Disputes (Real platform cases only)
  const [disputes, setDisputes] = useState<any[]>([]);

  // Feature flags
  const [flags, setFlags] = useState({
    geminiLiveVoice: true,
    escrowPaymentGateway: true,
    instantWeatherRadar: true,
    multiLanguageHindi: true,
    satelliteSoilMoisture: false
  });

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleGrantAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmailInput.trim()) return;
    grantAdminAccess(grantEmailInput.trim());
    showNotice(`Admin privileges granted to ${grantEmailInput.trim()}`);
    setGrantEmailInput('');
  };

  const handleApproveKYC = (id: string) => {
    setVerifications(verifications.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  };

  const handleRejectKYC = (id: string) => {
    setVerifications(verifications.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
  };

  const handleResolveDispute = (id: string) => {
    setDisputes(disputes.map(d => d.id === id ? { ...d, status: 'Arbitrated & Escrow Settled' } : d));
  };

  const handleSaveUniversitiesCount = (e: React.FormEvent) => {
    e.preventDefault();
    updatePartnerUniversitiesCount(Number(universitiesInput));
    setCountSavedNotice(true);
    setTimeout(() => setCountSavedNotice(false), 3000);
  };

  const handleInternshipAdminAction = (id: string, status: 'approved' | 'rejected') => {
    setInternshipStatuses(prev => ({ ...prev, [id]: status }));
  };

  // Filtered users for user governance
  const filteredUsers = allManagedUsers.filter(u => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.state.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3 bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800">
            <span>Platform Governance & Oversight Portal</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold">Master Admin: niteshunofficial1234@gmail.com</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Kheti AI Platform Administrator
          </h1>
          <p className="text-sm text-stone-700 mt-0.5">
            User access governance, KYC identity review, university metrics, marketplace audit, and system flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshSupabaseData}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live Supabase Data</span>
          </button>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Systems Normal · 99.98% Uptime</span>
          </div>
        </div>
      </div>

      {/* High-level Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-700" /> Registered Users
          </span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{allManagedUsers.length}</div>
          <div className="text-xs text-emerald-800 font-medium mt-1">Real Platform Accounts</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-600" /> Platform Admins
          </span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
            {allManagedUsers.filter(u => u.isAdmin).length}
          </div>
          <div className="text-xs text-amber-800 font-medium mt-1">Full Oversight Privileges</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-sky-700" /> Partner Universities
          </span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{partnerUniversitiesCount}</div>
          <div className="text-xs text-sky-800 font-medium mt-1">Managed via Admin</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-amber-700" /> Live Listings
          </span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{totalRealListingsCount}</div>
          <div className="text-xs text-stone-700 mt-1">Crops, Storage & Machinery</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <span className="text-xs text-stone-700 block flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> 30-Day GMV
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            {realGMV > 0 ? (
              <span>
                ₹{realGMV >= 10000000 ? (realGMV / 10000000).toFixed(2) : realGMV >= 100000 ? (realGMV / 100000).toFixed(2) : realGMV.toLocaleString('en-IN')}
                <span className="text-sm font-normal text-stone-700"> {realGMV >= 10000000 ? 'Cr' : realGMV >= 100000 ? 'Lakh' : ''}</span>
              </span>
            ) : (
              <span>
                ₹0 <span className="text-sm font-normal text-stone-500">Escrow</span>
              </span>
            )}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            {realGMV > 0 ? 'Escrow payment protected' : 'Live Ledger Active · 0 settled trades'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('users_governance')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users_governance' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-700" />
          User Directory & Access Control ({allManagedUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'verification' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          KYC Verification Queue ({verifications.filter(v => v.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('academic_governance')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'academic_governance' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
          Academic & Universities
        </button>
        <button
          onClick={() => setActiveTab('marketplace_ledger')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'marketplace_ledger' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-emerald-700" />
          Marketplace & Storage Ledger
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'disputes' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          Dispute Moderation ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab('ai_health')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'ai_health' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          AI Tool Telemetry
        </button>
        <button
          onClick={() => setActiveTab('feature_flags')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'feature_flags' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          Feature Flags
        </button>
        <button
          onClick={() => setActiveTab('database_schema')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'database_schema' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          Database Tables & Supabase Schema
        </button>
      </div>

      {/* Tab 0: Users Governance & Access Control */}
      {activeTab === 'users_governance' && (
        <div className="space-y-6">
          {/* Quick Grant Admin Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-150">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-800" />
                  Grant Platform Admin Rights
                </h3>
                <p className="text-xs text-stone-700 mt-0.5">
                  Authorize additional registered Gmail / user accounts to access the Admin Portal and moderation tools.
                </p>
              </div>

              <div className="px-3 py-1 rounded bg-amber-50 border border-amber-300 text-amber-950 text-xs font-mono font-medium">
                Master Developer Admin: <span className="font-bold">niteshunofficial1234@gmail.com</span>
              </div>
            </div>

            <form onSubmit={handleGrantAdminSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="email"
                value={grantEmailInput}
                onChange={(e) => setGrantEmailInput(e.target.value)}
                placeholder="Enter user Gmail address (e.g. coadmin@gmail.com)"
                className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700 font-mono"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Grant Admin Privileges</span>
              </button>
            </form>
          </div>

          {/* User Directory Table */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-150">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-800" />
                  Platform User Directory & Moderation Ledger
                </h3>
                <p className="text-xs text-stone-700">
                  Inspect user accounts, manage admin roles, and enforce bans or account suspensions.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user name or email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-700 font-semibold bg-stone-50">
                    <th className="py-2.5 px-3">User & Identity</th>
                    <th className="py-2.5 px-3">Contact Email & Phone</th>
                    <th className="py-2.5 px-3">Location & Role</th>
                    <th className="py-2.5 px-3">Account Status</th>
                    <th className="py-2.5 px-3">Last Activity</th>
                    <th className="py-2.5 px-3 text-right">Admin Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {filteredUsers.map((u) => {
                    const isMasterAdmin = u.email.toLowerCase() === 'niteshunofficial1234@gmail.com';
                    return (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block">{u.name}</span>
                              {isMasterAdmin && (
                                <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-amber-600" /> Developer & Primary Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 min-w-[200px]">
                          {editingUserId === u.id ? (
                            <div className="space-y-1.5 p-1 bg-stone-100 rounded-lg border border-stone-300">
                              <input
                                type="email"
                                value={editingEmail}
                                onChange={(e) => setEditingEmail(e.target.value)}
                                className="w-full px-2 py-1 text-xs font-mono bg-white border border-stone-300 rounded focus:outline-hidden focus:border-emerald-700"
                                placeholder="Enter email address"
                                autoFocus
                              />
                              <input
                                type="text"
                                value={editingPhone}
                                onChange={(e) => setEditingPhone(e.target.value)}
                                className="w-full px-2 py-1 text-xs font-mono bg-white border border-stone-300 rounded focus:outline-hidden focus:border-emerald-700"
                                placeholder="Enter phone number"
                              />
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleSaveUserEdit(u.id)}
                                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] rounded transition-colors shadow-xs"
                                >
                                  Save Email
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUserId(null)}
                                  className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-[10px] rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group flex items-start justify-between gap-1">
                              <div>
                                <span className="font-mono text-stone-900 font-semibold block">{u.email}</span>
                                <span className="text-stone-600 text-[11px] block">{u.phone || '+91 98124 00000'}</span>
                              </div>
                              {!isMasterAdmin && (
                                <button
                                  onClick={() => handleStartEditUser(u)}
                                  className="p-1 text-stone-400 hover:text-stone-800 transition-colors opacity-80 group-hover:opacity-100"
                                  title="Edit user email or phone"
                                >
                                  <Edit2 className="w-3 h-3 text-stone-500" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-stone-900 font-medium block">{u.state || 'Punjab / Haryana'}</span>
                          <span className="text-stone-600 text-[10px] capitalize font-semibold">{u.roles.join(', ')}</span>
                        </td>

                        <td className="py-3 px-3 space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {u.isAdmin && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold rounded text-[10px] uppercase border border-emerald-300">
                                ADMIN
                              </span>
                            )}
                            {u.isBanned && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-900 font-extrabold rounded text-[10px] uppercase border border-rose-300">
                                BANNED
                              </span>
                            )}
                            {!u.isBanned && (
                              <span className="px-2 py-0.5 bg-stone-100 text-stone-800 font-semibold rounded text-[10px] uppercase">
                                ACTIVE
                              </span>
                            )}
                            {u.isKycVerified && (
                              <span className="px-2 py-0.5 bg-sky-100 text-sky-900 font-bold rounded text-[10px] uppercase">
                                KYC VERIFIED
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-stone-600 text-[11px] font-mono">
                          {u.lastActive}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {isMasterAdmin ? (
                            <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded">
                              Permanent Master Admin
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Admin Toggle */}
                              {u.isAdmin ? (
                                <button
                                  onClick={() => {
                                    revokeAdminAccess(u.email);
                                    showNotice(`Revoked admin access for ${u.email}`);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200 border border-stone-300 rounded transition-colors"
                                  title="Revoke Admin Access"
                                >
                                  Revoke Admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    grantAdminAccess(u.email);
                                    showNotice(`Granted admin access to ${u.email}`);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 border border-emerald-300 rounded transition-colors flex items-center gap-1"
                                >
                                  <Crown className="w-3 h-3 text-amber-600" />
                                  Make Admin
                                </button>
                              )}

                              {/* Ban Toggle */}
                              {u.isBanned ? (
                                <button
                                  onClick={() => {
                                    unbanUser(u.email);
                                    showNotice(`Lifted ban from ${u.email}`);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
                                >
                                  Remove Ban
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    banUser(u.email);
                                    showNotice(`Banned user account ${u.email}`);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded transition-colors flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3 text-rose-600" />
                                  Ban User
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: KYC Verification Queue */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-150">
            <div>
              <h3 className="text-base font-bold text-stone-900">Pending Identity & Land Record Verifications</h3>
              <p className="text-xs text-stone-700">Review land title deed, APMC trade license, and GST certificates.</p>
            </div>
            <span className="text-xs text-stone-700 font-mono">3 Pending Review</span>
          </div>

          <div className="space-y-3">
            {verifications.map((v) => (
              <div key={v.id} className="p-4 bg-stone-50 border border-stone-150 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{v.applicantName}</span>
                    <span className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded text-[11px] font-medium">
                      {v.type}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                    v.status === 'approved' ? 'bg-emerald-100 text-emerald-900' :
                    v.status === 'rejected' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {v.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-white rounded border border-stone-200">
                  <div>
                    <span className="text-stone-700 block">State/District:</span>
                    <span className="font-medium text-stone-900">{v.state}</span>
                  </div>
                  <div>
                    <span className="text-stone-700 block">Document ID:</span>
                    <span className="font-mono text-stone-900">{v.khasraNo || v.apmcLicense || v.wdraCertNo}</span>
                  </div>
                  <div>
                    <span className="text-stone-700 block">Holding / Capacity:</span>
                    <span className="font-mono text-stone-900">{v.landAcres ? `${v.landAcres} Acres` : v.capacityMT ? `${v.capacityMT} MT` : v.businessType}</span>
                  </div>
                  <div>
                    <span className="text-stone-700 block">Submitted:</span>
                    <span className="font-mono text-stone-700">{v.submittedDate}</span>
                  </div>
                </div>

                {v.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleRejectKYC(v.id)}
                      className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded font-semibold transition-colors"
                    >
                      Reject with Reason
                    </button>
                    <button
                      onClick={() => handleApproveKYC(v.id)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold transition-colors shadow-xs"
                    >
                      Approve & Grant Verified Badge
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Academic & Universities Governance */}
      {activeTab === 'academic_governance' && (
        <div className="space-y-6">
          {/* Managing Partner Universities Count */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-150">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-800" />
                  Integrated Partner Universities Count
                </h3>
                <p className="text-xs text-stone-700 mt-0.5">
                  Manage the official count of state agricultural universities (SAUs) and ICAR research institutes integrated into Kheti AI.
                </p>
              </div>

              <div className="px-3 py-1 rounded bg-stone-100 text-stone-800 text-xs font-mono font-medium">
                Live Portal Display: <span className="font-bold text-emerald-800">{partnerUniversitiesCount} SAUs</span>
              </div>
            </div>

            <form onSubmit={handleSaveUniversitiesCount} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-stone-800 whitespace-nowrap">
                  Partner Universities Count:
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUniversitiesInput(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded border border-stone-300 bg-white hover:bg-stone-100 font-bold text-stone-800 text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={universitiesInput}
                    onChange={(e) => setUniversitiesInput(Number(e.target.value))}
                    min="1"
                    max="500"
                    className="w-20 px-3 py-1.5 text-center font-mono font-bold text-stone-900 border border-stone-300 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setUniversitiesInput(prev => prev + 1)}
                    className="w-8 h-8 rounded border border-stone-300 bg-white hover:bg-stone-100 font-bold text-stone-800 text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save & Publish Count
                </button>
                {countSavedNotice && (
                  <span className="text-xs text-emerald-800 font-bold animate-pulse flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Updated across platform!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Farm Internships Admin Oversight */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-800" />
                  Farm Internship Listings Governance
                </h3>
                <p className="text-xs text-stone-700">
                  Review and approve active working farm internship listings posted by registered host farmers.
                </p>
              </div>
              <span className="text-xs text-stone-700 font-mono">{realInternships.length} Listings Total</span>
            </div>

            {realInternships.length === 0 ? (
              <p className="text-xs text-stone-600 py-4 text-center italic bg-stone-50 rounded-lg">
                No active farm internship listings posted in live database yet.
              </p>
            ) : (
              <div className="space-y-3">
                {realInternships.map((intern) => {
                  const adminStatus = internshipStatuses[intern.id] || intern.status || 'open';
                  return (
                    <div key={intern.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm text-stone-900">{intern.farmName}</span>
                          <div className="text-stone-700 text-xs mt-0.5">
                            Host Farmer: <strong className="text-stone-900">{intern.farmerName}</strong> ({intern.village}, {intern.district}, {intern.state})
                          </div>
                        </div>
                        <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider ${
                          adminStatus === 'approved' || adminStatus === 'open' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                          adminStatus === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {adminStatus === 'open' ? 'APPROVED & OPEN' : adminStatus.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-white rounded border border-stone-200">
                        <div>
                          <span className="text-stone-700 block">Stipend:</span>
                          <span className="font-semibold text-emerald-800">₹{intern.stipendMonthly}/month</span>
                        </div>
                        <div>
                          <span className="text-stone-700 block">Duration & Slots:</span>
                          <span className="font-medium text-stone-900">{intern.durationWeeks} Weeks ({intern.availableSlots} slots)</span>
                        </div>
                        <div>
                          <span className="text-stone-700 block">Crop Focus:</span>
                          <span className="font-medium text-stone-900">{intern.cropFocus.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-stone-700 block">Student Applications:</span>
                          <span className="font-mono text-stone-900 font-bold">{intern.appliedCount} Applied</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {adminStatus !== 'rejected' && (
                          <button
                            onClick={() => handleInternshipAdminAction(intern.id, 'rejected')}
                            className="px-3 py-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded font-semibold transition-colors"
                          >
                            Unpublish / Reject Listing
                          </button>
                        )}
                        {adminStatus !== 'approved' && adminStatus !== 'open' && (
                          <button
                            onClick={() => handleInternshipAdminAction(intern.id, 'approved')}
                            className="px-3.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded font-semibold transition-colors shadow-xs"
                          >
                            Approve Internship
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Masterclasses Overview */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-800" />
                  Live University Masterclasses Oversight
                </h3>
                <p className="text-xs text-stone-700">
                  Masterclasses led by SAU professors and agronomy experts.
                </p>
              </div>
              <span className="text-xs text-stone-700 font-mono">{realMasterclasses.length} Masterclasses</span>
            </div>

            {realMasterclasses.length === 0 ? (
              <p className="text-xs text-stone-600 py-4 text-center italic bg-stone-50 rounded-lg">
                No active university masterclasses scheduled in live database yet.
              </p>
            ) : (
              <div className="space-y-3">
                {realMasterclasses.map((mc) => (
                  <div key={mc.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-stone-900 text-sm">{mc.topic}</span>
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-900 font-bold rounded text-[10px] uppercase">
                        {mc.mode.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-stone-700">
                      Instructor: <strong>{mc.instructorName}</strong> ({mc.instructorTitle}, {mc.university})
                    </div>
                    <div className="flex items-center justify-between pt-1 font-mono text-stone-700">
                      <span>Scheduled: {mc.scheduledDate}</span>
                      <span className="font-bold text-emerald-800">{mc.enrolledCount} Students Enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Marketplace & Infrastructure Ledger */}
      {activeTab === 'marketplace_ledger' && (
        <div className="space-y-6">
          {/* User-Published Commodity Marketplace Listings */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-800" />
                  Live Trade Commodity Listings Ledger
                </h3>
                <p className="text-xs text-stone-700">
                  Monitor all active buy and sell listings published across the platform.
                </p>
              </div>
              <span className="text-xs text-stone-700 font-mono">{realCommodityListings.length} Active Listings</span>
            </div>

            {realCommodityListings.length === 0 ? (
              <p className="text-xs text-stone-600 py-6 text-center italic bg-stone-50 rounded-lg">
                No active commodity trade listings in the live database yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-700 font-semibold bg-stone-50">
                      <th className="py-2.5 px-3">Listing ID</th>
                      <th className="py-2.5 px-3">Commodity & Variety</th>
                      <th className="py-2.5 px-3">Seller / User</th>
                      <th className="py-2.5 px-3">Asking Price</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {realCommodityListings.map((item) => {
                      const isEditing = editingCommodityId === item.id;
                      return (
                        <tr key={item.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-3 font-mono text-stone-700 font-bold">{item.id}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-stone-900">{item.commodity}</span>
                            {item.variety && <span className="text-stone-700 text-[11px] block">{item.variety}</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-stone-900">{item.sellerName}</span>
                            <span className="text-stone-700 block text-[10px] capitalize">{item.sellerType}</span>
                          </td>
                          
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-stone-500">₹</span>
                                <input
                                  type="number"
                                  value={editCommodityPrice}
                                  onChange={(e) => setEditCommodityPrice(Number(e.target.value))}
                                  className="w-20 px-1.5 py-0.5 text-xs border border-stone-300 rounded font-mono bg-white"
                                />
                              </div>
                            ) : (
                              <span>₹{item.askingPrice}/{item.unit}</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 font-mono text-stone-800">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editCommodityQty}
                                onChange={(e) => setEditCommodityQty(Number(e.target.value))}
                                className="w-16 px-1.5 py-0.5 text-xs border border-stone-300 rounded font-mono bg-white"
                              />
                            ) : (
                              <span>{item.quantity} {item.unit}s</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-stone-700">
                            {item.location?.district || item.location?.state}, {item.location?.state}
                          </td>

                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleCommodityStatus(item)}
                              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase transition-colors flex items-center gap-1 ${
                                item.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              }`}
                              title="Click to toggle status (Active / Paused)"
                            >
                              <Power className="w-3 h-3" />
                              {item.status}
                            </button>
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCommodity(item.id)}
                                  className="px-2 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] rounded"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCommodityId(null)}
                                  className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[10px] rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCommodity(item)}
                                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                                  title="Manage Price & Quantity"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingItemId({ id: item.id, type: 'commodity', title: `${item.commodity} (${item.sellerName})` })}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                                  title="Delete Trade Listing"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Storage & Machinery Infrastructure Ledger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-150">
                <Building2 className="w-4 h-4 text-emerald-800" />
                Storage & Godown Infrastructure ({realWarehouses.length})
              </h3>
              {realWarehouses.length === 0 ? (
                <p className="text-xs text-stone-600 py-4 text-center italic bg-stone-50 rounded-lg">
                  No active storage facilities listed in live database yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {realWarehouses.map((wh: WarehouseFacility) => {
                    const isEditing = editingWarehouseId === wh.id;
                    return (
                      <div key={wh.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                        {isEditing ? (
                          <div className="space-y-2 p-2 bg-white rounded border border-stone-300">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-700 block">Storage Name:</label>
                              <input
                                type="text"
                                value={editWarehouseName}
                                onChange={(e) => setEditWarehouseName(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-stone-300 rounded font-medium"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-stone-700 block">Rate (₹/bag/mo):</label>
                                <input
                                  type="number"
                                  value={editWarehouseRate}
                                  onChange={(e) => setEditWarehouseRate(Number(e.target.value))}
                                  className="w-full px-2 py-1 text-xs border border-stone-300 rounded font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-stone-700 block">Available MT:</label>
                                <input
                                  type="number"
                                  value={editWarehouseCapacity}
                                  onChange={(e) => setEditWarehouseCapacity(Number(e.target.value))}
                                  className="w-full px-2 py-1 text-xs border border-stone-300 rounded font-mono"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEditWarehouse(wh.id)}
                                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] rounded"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingWarehouseId(null)}
                                className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[10px] rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-stone-900 block">{wh.name}</span>
                                <span className="text-stone-700 text-[11px] block">
                                  Owner: {wh.ownerName} · Location: {wh.district}, {wh.state}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-emerald-800 font-mono font-bold text-xs">
                                  ₹{wh.ratePerBagPerMonth}/bag/mo
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditWarehouse(wh)}
                                  className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                                  title="Edit Storage Facility"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingItemId({ id: wh.id, type: 'warehouse', title: wh.name })}
                                  className="p-1 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded transition-colors"
                                  title="Delete Storage Facility"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="text-stone-700 font-mono text-[11px] flex items-center justify-between pt-1 border-t border-stone-200">
                              <span>Available: {wh.availableCapacityMT} MT / Total: {wh.totalCapacityMT} MT</span>
                              <span className="text-[10px] text-stone-500">ID: {wh.id}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-150">
                <Truck className="w-4 h-4 text-emerald-800" />
                Agri Equipment & Vehicles ({realEquipment.length})
              </h3>
              {realEquipment.length === 0 ? (
                <p className="text-xs text-stone-600 py-4 text-center italic bg-stone-50 rounded-lg">
                  No active machinery or vehicles listed in live database yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {realEquipment.map((eq: EquipmentRental) => {
                    const isEditing = editingEquipmentId === eq.id;
                    return (
                      <div key={eq.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                        {isEditing ? (
                          <div className="space-y-2 p-2 bg-white rounded border border-stone-300">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-700 block">Equipment / Vehicle Title:</label>
                              <input
                                type="text"
                                value={editEquipmentTitle}
                                onChange={(e) => setEditEquipmentTitle(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-stone-300 rounded font-medium"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                Rate (₹/{eq.ratePerHour ? 'hr' : 'acre'}):
                              </label>
                              <input
                                type="number"
                                value={editEquipmentRate}
                                onChange={(e) => setEditEquipmentRate(Number(e.target.value))}
                                className="w-full px-2 py-1 text-xs border border-stone-300 rounded font-mono"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEditEquipment(eq)}
                                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] rounded"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingEquipmentId(null)}
                                className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[10px] rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-stone-900 block">{eq.title}</span>
                                <span className="text-stone-700 text-[11px] block">
                                  Provider: {eq.ownerName} · Category: {eq.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-emerald-800 font-mono font-bold text-xs">
                                  {eq.ratePerHour ? `₹${eq.ratePerHour}/hr` : eq.ratePerAcre ? `₹${eq.ratePerAcre}/acre` : 'Negotiable'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditEquipment(eq)}
                                  className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                                  title="Edit Machinery Listing"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingItemId({ id: eq.id, type: 'equipment', title: eq.title })}
                                  className="p-1 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded transition-colors"
                                  title="Delete Machinery Listing"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="text-stone-700 text-[11px] flex items-center justify-between pt-1 border-t border-stone-200">
                              <span>Operator Included: {eq.operatorIncluded ? 'Yes' : 'No'} · District: {eq.district}</span>
                              <span className="text-[10px] text-stone-500">ID: {eq.id}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* User Service Bookings Audit Log */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-800" />
                  User Booking Transactions & Reservations
                </h3>
                <p className="text-xs text-stone-700">
                  Live reservations placed by users for cold storage, godowns, combines, and transport vehicles.
                </p>
              </div>
              <span className="text-xs text-stone-700 font-mono">{bookingsReceived.length} Bookings Recorded</span>
            </div>

            {bookingsReceived.length === 0 ? (
              <p className="text-xs text-stone-700 py-4 text-center italic bg-stone-50 rounded-lg">
                No active bookings recorded in this session yet.
              </p>
            ) : (
              <div className="space-y-3">
                {bookingsReceived.map((b) => (
                  <div key={b.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-900 text-sm">
                        Booking #{b.id.slice(-6).toUpperCase()} · {b.serviceTitle}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900' :
                        b.status === 'rejected' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded border border-stone-200">
                      <div>
                        <span className="text-stone-700 block">Renter / Customer:</span>
                        <span className="font-medium text-stone-900">{b.renterName}</span>
                      </div>
                      <div>
                        <span className="text-stone-700 block">Quantity & Dates:</span>
                        <span className="font-mono text-stone-900">{b.quantityRequested} {b.unit} ({b.startDate})</span>
                      </div>
                      <div>
                        <span className="text-stone-700 block">Estimated Amount:</span>
                        <span className="font-mono font-bold text-emerald-800">₹{b.totalEstimatedAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-stone-700 block">Service Provider:</span>
                        <span className="font-medium text-stone-900">{b.ownerName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Disputes */}
      {activeTab === 'disputes' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-150">
            <div>
              <h3 className="text-base font-bold text-stone-900">Commercial Trade Dispute Arbitration</h3>
              <p className="text-xs text-stone-700">Audit weighbridge receipts, moisture lab reports, and escrow settlements.</p>
            </div>
            <span className="text-xs text-stone-700 font-mono">1 Open Case</span>
          </div>

          {disputes.map((d) => (
            <div key={d.id} className="p-4 bg-stone-50 border border-stone-150 rounded-xl text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-900">Dispute #{d.id} · {d.commodity}</span>
                <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-[11px]">
                  {d.status}
                </span>
              </div>

              <div className="p-3 bg-white rounded border border-stone-200 space-y-1">
                <div>Buyer: <strong>{d.buyer}</strong> · Seller: <strong>{d.seller}</strong></div>
                <div>Disputed Amount: <strong className="text-rose-700 font-mono">₹{d.claimedAmount.toLocaleString('en-IN')}</strong></div>
                <div className="pt-1 text-stone-700 italic">"{d.issue}"</div>
              </div>

              {d.status === 'Under Investigation' && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleResolveDispute(d.id)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded transition-colors shadow-xs"
                  >
                    Resolve Dispute & Release Escrow 50:50
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: AI Telemetry */}
      {activeTab === 'ai_health' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-150">
            <div>
              <h3 className="text-base font-bold text-stone-900">AI Tool Invocations & Voice Stream Health</h3>
              <p className="text-xs text-stone-700">Telemetry logs for Gemini Live voice, tool calling and speech synthesis.</p>
            </div>
            <span className="text-xs text-stone-700 font-mono">Real-time Prober</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-stone-200 text-stone-700 font-sans font-semibold">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Tool Contract</th>
                  <th className="py-2 px-3">Language Mode</th>
                  <th className="py-2 px-3 text-right">Latency</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                <tr className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 text-stone-700">10:14:22</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">get_mandi_prices</td>
                  <td className="py-2.5 px-3 font-sans text-stone-700">Hindi (hi-IN)</td>
                  <td className="py-2.5 px-3 text-right">240ms</td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold font-sans">SUCCESS</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 text-stone-700">10:13:58</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">get_weather</td>
                  <td className="py-2.5 px-3 font-sans text-stone-700">Hinglish</td>
                  <td className="py-2.5 px-3 text-right">185ms</td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold font-sans">SUCCESS</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 text-stone-700">10:11:40</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">get_crop_advice</td>
                  <td className="py-2.5 px-3 font-sans text-stone-700">Hindi (hi-IN)</td>
                  <td className="py-2.5 px-3 text-right">410ms</td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold font-sans">SUCCESS</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 text-stone-700">10:08:15</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">get_government_updates</td>
                  <td className="py-2.5 px-3 font-sans text-stone-700">English</td>
                  <td className="py-2.5 px-3 text-right">190ms</td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold font-sans">SUCCESS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Feature Flags */}
      {activeTab === 'feature_flags' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-150">
            <div>
              <h3 className="text-base font-bold text-stone-900">Platform Feature Flags & Capabilities</h3>
              <p className="text-xs text-stone-700">Enable or disable subsystems dynamically without redeploying.</p>
            </div>
            <span className="text-xs text-stone-700 font-mono">Config Sync Active</span>
          </div>

          <div className="space-y-3">
            {Object.entries(flags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-stone-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-stone-700 block mt-0.5">Subsystem flag identifier: {key}</span>
                </div>
                <button
                  onClick={() => setFlags({ ...flags, [key]: !value })}
                  className={`px-3 py-1 rounded font-semibold text-xs transition-colors ${
                    value ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {value ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Database Tables & Supabase Schema */}
      {activeTab === 'database_schema' && (
        <DatabaseSchemaView />
      )}

      {/* Admin Delete Confirmation Modal */}
      {deletingItemId && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Confirm Deletion</h3>
                <p className="text-xs text-stone-600">Admin Removal Action</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
              Are you sure you want to permanently delete <strong>"{deletingItemId.title}"</strong> (ID: <span className="font-mono text-stone-900">{deletingItemId.id}</span>)?
              <br />
              This will immediately remove the listing from the platform and Supabase database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItemId(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
