import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from '../context/NotificationContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WarehouseFacility, EquipmentRental, ServiceBooking, ServiceMessage } from '../types';
import { 
  MOCK_WAREHOUSES, 
  MOCK_EQUIPMENTS, 
  MOCK_SERVICE_BOOKINGS, 
  MOCK_SERVICE_MESSAGES 
} from '../data/mockData';

const STORAGE_KEYS = {
  WAREHOUSES: 'kheti_warehouses_store_v3',
  EQUIPMENT: 'kheti_equipment_store_v3',
  BOOKINGS: 'kheti_bookings_store_v3',
  MESSAGES: 'kheti_messages_store_v3'
};

const MOCK_WAREHOUSE_IDS = new Set(['wh_my_01', 'wh_krn_01', 'wh_krn_02', 'wh_ldh_03']);
const MOCK_EQUIPMENT_IDS = new Set(['eq_my_01', 'eq_501', 'eq_502', 'eq_503', 'eq_504']);
const MOCK_BOOKING_IDS = new Set(['bk_wh_101', 'bk_wh_102', 'bk_eq_201']);
const MOCK_MESSAGE_IDS = new Set(['msg_01', 'msg_02', 'msg_03']);

export function useServicesManager() {
  const { user, profile, isAuthenticated, isDemo } = useAuth();
  let addNotification: any = null;
  try {
    const notifs = useNotifications();
    addNotification = notifs.addNotification;
  } catch {}

  // Resolved user identity
  const currentUserId = user?.id || profile?.id || (isDemo ? 'usr_rameshwar_99' : 'usr_guest');
  const currentUserName = profile?.name || user?.user_metadata?.full_name || (isDemo ? 'Rameshwar Singh' : 'Kisan Provider');
  const currentUserPhone = profile?.phone || user?.phone || '+91 98124 55432';

  const getInitialWarehouses = (): WarehouseFacility[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
      const local = saved ? JSON.parse(saved) : [];
      const combined = [...local];
      MOCK_WAREHOUSES.forEach(m => {
        if (!combined.some(c => c.id === m.id)) combined.push(m);
      });
      return combined;
    } catch {
      return MOCK_WAREHOUSES;
    }
  };

  const getInitialEquipment = (): EquipmentRental[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      const local = saved ? JSON.parse(saved) : [];
      const combined = [...local];
      MOCK_EQUIPMENTS.forEach(m => {
        if (!combined.some(c => c.id === m.id)) combined.push(m);
      });
      return combined;
    } catch {
      return MOCK_EQUIPMENTS;
    }
  };

  // State
  const [warehouses, setWarehouses] = useState<WarehouseFacility[]>(getInitialWarehouses);
  const [equipment, setEquipment] = useState<EquipmentRental[]>(getInitialEquipment);
  const [bookings, setBookings] = useState<ServiceBooking[]>(MOCK_SERVICE_BOOKINGS);
  const [messages, setMessages] = useState<ServiceMessage[]>(MOCK_SERVICE_MESSAGES);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);

  // Helper to read local cache
  const getLocalData = <T>(key: string): T[] => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function fetchAllServices() {
      setIsSyncing(true);

      let serverWh: WarehouseFacility[] = [];
      let serverEq: EquipmentRental[] = [];
      let serverBk: ServiceBooking[] = [];
      let serverMsg: ServiceMessage[] = [];

      // 1. Fetch directly from Supabase (storage_facilities / warehouse_facilities)
      if (isSupabaseConfigured) {
        try {
          // Query storage_facilities or fallback to warehouse_facilities
          let { data: whDb, error: whErr } = await supabase.from('storage_facilities').select('*');
          if (whErr || !whDb || whDb.length === 0) {
            const fallback = await supabase.from('warehouse_facilities').select('*');
            if (fallback.data && fallback.data.length > 0) whDb = fallback.data;
          }

          if (whDb && Array.isArray(whDb)) {
            whDb.forEach((row: any) => {
              serverWh.push({
                id: row.id,
                ownerId: row.owner_id || undefined,
                name: row.name,
                ownerName: row.owner_name,
                type: row.type,
                district: row.district,
                state: row.state,
                totalCapacityMT: Number(row.total_capacity_mt || 1000),
                availableCapacityMT: Number(row.available_capacity_mt || 500),
                ratePerBagPerMonth: Number(row.rate_per_bag_per_month || 8),
                isWdrcRegistered: row.is_wdrc_registered ?? true,
                contactPhone: row.contact_phone || '',
                address: row.address || undefined,
                createdAt: row.created_at
              });
            });
          }

          // Query machinery_equipment or fallback to equipment_rentals
          let { data: eqDb, error: eqErr } = await supabase.from('machinery_equipment').select('*');
          if (eqErr || !eqDb || eqDb.length === 0) {
            const fallback = await supabase.from('equipment_rentals').select('*');
            if (fallback.data && fallback.data.length > 0) eqDb = fallback.data;
          }

          if (eqDb && Array.isArray(eqDb)) {
            eqDb.forEach((row: any) => {
              serverEq.push({
                id: row.id,
                ownerId: row.owner_id || undefined,
                title: row.title,
                category: row.category,
                ownerName: row.owner_name,
                district: row.district,
                state: row.state,
                ratePerHour: row.rate_per_hour ? Number(row.rate_per_hour) : undefined,
                ratePerAcre: row.rate_per_acre ? Number(row.rate_per_acre) : undefined,
                operatorIncluded: row.operator_included ?? true,
                isAvailableNow: row.is_available_now ?? true,
                contactPhone: row.contact_phone || undefined,
                modelYear: row.model_year || undefined,
                createdAt: row.created_at
              });
            });
          }

          // Service bookings from Supabase
          const { data: bkDb } = await supabase.from('service_bookings').select('*');
          if (bkDb && Array.isArray(bkDb)) {
            bkDb.forEach((row: any) => {
              serverBk.push({
                id: row.id,
                serviceId: row.service_id,
                serviceType: row.service_type,
                serviceTitle: row.service_title,
                ownerId: row.owner_id,
                ownerName: row.owner_name,
                ownerPhone: row.owner_phone,
                renterId: row.renter_id,
                renterName: row.renter_name,
                renterPhone: row.renter_phone,
                startDate: row.start_date,
                endDate: row.end_date,
                quantityRequested: Number(row.quantity_requested),
                unit: row.unit,
                totalEstimatedAmount: Number(row.total_estimated_amount),
                notes: row.notes,
                status: row.status,
                createdAt: row.created_at
              });
            });
          }

          // Service messages from Supabase
          const { data: msgDb } = await supabase.from('service_messages').select('*');
          if (msgDb && Array.isArray(msgDb)) {
            msgDb.forEach((row: any) => {
              serverMsg.push({
                id: row.id,
                bookingId: row.booking_id,
                serviceId: row.service_id,
                serviceTitle: row.service_title,
                senderId: row.sender_id,
                senderName: row.sender_name,
                recipientId: row.recipient_id,
                recipientName: row.recipient_name,
                text: row.text,
                timestamp: row.timestamp || row.created_at || new Date().toISOString(),
                isRead: row.is_read ?? false
              });
            });
          }
        } catch (supabaseErr) {
          console.warn('[Kheti Services] Supabase tables check notice:', supabaseErr);
        }
      }

      // 2. Fetch from Express persistent shared server API
      try {
        const [wRes, eRes, bRes, mRes] = await Promise.all([
          fetch('/api/services/warehouses'),
          fetch('/api/services/equipment'),
          fetch('/api/services/bookings'),
          fetch('/api/services/messages')
        ]);

        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.warehouses && Array.isArray(wData.warehouses)) {
            wData.warehouses.forEach((item: WarehouseFacility) => {
              if (!serverWh.some(s => s.id === item.id)) serverWh.push(item);
            });
          }
        }
        if (eRes.ok) {
          const eData = await eRes.json();
          if (eData.equipment && Array.isArray(eData.equipment)) {
            eData.equipment.forEach((item: EquipmentRental) => {
              if (!serverEq.some(s => s.id === item.id)) serverEq.push(item);
            });
          }
        }
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.bookings && Array.isArray(bData.bookings)) {
            bData.bookings.forEach((item: ServiceBooking) => {
              const existing = serverBk.find(s => s.id === item.id);
              if (existing) {
                if (item.status === 'confirmed') existing.status = 'confirmed';
              } else {
                serverBk.push(item);
              }
            });
          }
        }
        if (mRes.ok) {
          const mData = await mRes.json();
          if (mData.messages && Array.isArray(mData.messages)) {
            mData.messages.forEach((item: ServiceMessage) => {
              if (!serverMsg.some(s => s.id === item.id)) serverMsg.push(item);
            });
          }
        }
      } catch (err) {
        console.warn('Notice: Server API services fetch notice:', err);
      }

      // Check for confirmed offers across messages (deals confirmed via bilateral negotiation)
      const confirmedBookingIds = new Set(
        serverMsg
          .filter(m => m.bookingId && (m.text.includes('[BOOKING_ACCEPTED]') || m.text.includes('[OFFER_ACCEPTED]')))
          .map(m => m.bookingId!)
      );

      serverBk.forEach(b => {
        if (confirmedBookingIds.has(b.id)) {
          b.status = 'confirmed';
        }
      });

      // 3. Merge local items created in this browser
      const localWh = getLocalData<WarehouseFacility>(STORAGE_KEYS.WAREHOUSES);
      const localEq = getLocalData<EquipmentRental>(STORAGE_KEYS.EQUIPMENT);
      const localBk = getLocalData<ServiceBooking>(STORAGE_KEYS.BOOKINGS);
      const localMsg = getLocalData<ServiceMessage>(STORAGE_KEYS.MESSAGES);

      localWh.forEach(item => {
        if (!serverWh.some(s => s.id === item.id)) serverWh.unshift(item);
      });
      localEq.forEach(item => {
        if (!serverEq.some(s => s.id === item.id)) serverEq.unshift(item);
      });
      localBk.forEach(item => {
        const existing = serverBk.find(s => s.id === item.id);
        if (existing) {
          if (item.status === 'confirmed') existing.status = 'confirmed';
        } else {
          serverBk.unshift(item);
        }
      });
      localMsg.forEach(item => {
        if (!serverMsg.some(s => s.id === item.id)) serverMsg.unshift(item);
      });

      if (isCancelled) return;

      // PRE-LOGIN vs POST-LOGIN SEPARATION
      if (isDemo || !isAuthenticated) {
        // Pre-login: Show demo data so visitors can explore all facilities
        const combinedWh = [...serverWh];
        MOCK_WAREHOUSES.forEach(m => {
          if (!combinedWh.some(c => c.id === m.id)) combinedWh.push(m);
        });

        const combinedEq = [...serverEq];
        MOCK_EQUIPMENTS.forEach(m => {
          if (!combinedEq.some(c => c.id === m.id)) combinedEq.push(m);
        });

        setWarehouses(combinedWh);
        setEquipment(combinedEq);
        setBookings(serverBk.length > 0 ? serverBk : MOCK_SERVICE_BOOKINGS);
        setMessages(serverMsg.length > 0 ? serverMsg : MOCK_SERVICE_MESSAGES);
      } else {
        // Post-login: STRICTLY NO DEMO DATA. Only real facilities and equipment created by real users!
        const realWh = serverWh.filter(w => !MOCK_WAREHOUSE_IDS.has(w.id) && w.ownerId !== 'usr_rameshwar_99');
        const realEq = serverEq.filter(e => !MOCK_EQUIPMENT_IDS.has(e.id) && e.ownerId !== 'usr_rameshwar_99');
        const realBk = serverBk.filter(b => !MOCK_BOOKING_IDS.has(b.id));
        const realMsg = serverMsg.filter(m => !MOCK_MESSAGE_IDS.has(m.id));

        setWarehouses(realWh);
        setEquipment(realEq);
        setBookings(realBk);
        setMessages(realMsg);
      }

      setLoading(false);
      setIsSyncing(false);
    }

    fetchAllServices();

    // Fast multi-device polling interval (3.5s) for instant cross-device updates
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 3500);

    // Supabase Realtime channel subscription for instant booking & message sync
    let rtChannel: any = null;
    if (isSupabaseConfigured) {
      try {
        rtChannel = supabase
          .channel('kheti_services_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, () => {
            setTick(t => t + 1);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'service_messages' }, () => {
            setTick(t => t + 1);
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel error:', err);
      }
    }

    return () => {
      isCancelled = true;
      clearInterval(interval);
      if (rtChannel) {
        try { supabase.removeChannel(rtChannel); } catch (_) {}
      }
    };
  }, [tick, isAuthenticated, isDemo]);

  // Derived user-isolated sets
  // 1. Public browse collections (All active facilities and machinery visible to everyone)
  const publicWarehouses = warehouses;
  const publicEquipment = equipment;

  // 2. My Listings (Warehouses & Machinery owned strictly by this user)
  const myWarehouses = warehouses.filter(wh => wh.ownerId === currentUserId);
  const myEquipment = equipment.filter(eq => eq.ownerId === currentUserId);
  const totalMyListings = myWarehouses.length + myEquipment.length;

  // 3. Bookings Received (Customers who booked spaces/machinery listed by this user)
  const bookingsReceived = bookings.filter(b => b.ownerId === currentUserId);

  // 4. Bookings Made (Spaces/machinery this user booked from other owners)
  const bookingsMade = bookings.filter(b => b.renterId === currentUserId);

  // 5. Messages involving current user
  const userMessages = messages.filter(m => m.senderId === currentUserId || m.recipientId === currentUserId);
  const unreadMessagesCount = userMessages.filter(m => m.recipientId === currentUserId && !m.isRead).length;

  // ─── Actions ─────────────────────────────────────────────────────────────

  // Add Warehouse Space Listing
  const addWarehouseListing = useCallback(async (data: Omit<WarehouseFacility, 'id' | 'ownerId' | 'ownerName'>) => {
    const newFacility: WarehouseFacility = {
      ...data,
      id: `wh_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ownerId: currentUserId,
      ownerName: currentUserName,
      contactPhone: data.contactPhone || currentUserPhone,
      createdAt: new Date().toISOString()
    };

    setWarehouses(prev => [newFacility, ...prev]);

    // Local cache
    try {
      const local = getLocalData<WarehouseFacility>(STORAGE_KEYS.WAREHOUSES);
      localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify([newFacility, ...local]));
    } catch {}

    // Server API persistence so it is shared across all users
    try {
      await fetch('/api/services/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFacility)
      });
    } catch (e) {
      console.warn('Warehouse server save notice:', e);
    }

    // Direct Supabase storage persistence
    if (isSupabaseConfigured) {
      try {
        const dbRow = {
          id: newFacility.id,
          owner_id: currentUserId,
          name: newFacility.name,
          owner_name: newFacility.ownerName,
          type: newFacility.type,
          district: newFacility.district,
          state: newFacility.state,
          total_capacity_mt: newFacility.totalCapacityMT,
          available_capacity_mt: newFacility.availableCapacityMT,
          rate_per_bag_per_month: newFacility.ratePerBagPerMonth,
          is_wdrc_registered: newFacility.isWdrcRegistered,
          contact_phone: newFacility.contactPhone,
          address: newFacility.address || null,
          is_real: true
        };
        await supabase.from('storage_facilities').insert([dbRow]);
        await supabase.from('warehouse_facilities').insert([dbRow]);
      } catch (e) {
        console.warn('Supabase storage save notice:', e);
      }
    }

    return newFacility;
  }, [currentUserId, currentUserName, currentUserPhone]);

  // Add Equipment / Vehicle Rental Listing
  const addEquipmentListing = useCallback(async (data: Omit<EquipmentRental, 'id' | 'ownerId' | 'ownerName'>) => {
    const newEquipment: EquipmentRental = {
      ...data,
      id: `eq_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ownerId: currentUserId,
      ownerName: currentUserName,
      contactPhone: data.contactPhone || currentUserPhone,
      createdAt: new Date().toISOString()
    };

    setEquipment(prev => [newEquipment, ...prev]);

    // Local cache
    try {
      const local = getLocalData<EquipmentRental>(STORAGE_KEYS.EQUIPMENT);
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify([newEquipment, ...local]));
    } catch {}

    // Server API persistence so it is shared across all users
    try {
      await fetch('/api/services/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEquipment)
      });
    } catch (e) {
      console.warn('Equipment server save notice:', e);
    }

    // Direct Supabase machinery persistence
    if (isSupabaseConfigured) {
      try {
        const dbRow = {
          id: newEquipment.id,
          owner_id: currentUserId,
          title: newEquipment.title,
          category: newEquipment.category,
          owner_name: newEquipment.ownerName,
          district: newEquipment.district,
          state: newEquipment.state,
          rate_per_hour: newEquipment.ratePerHour || null,
          rate_per_acre: newEquipment.ratePerAcre || null,
          operator_included: newEquipment.operatorIncluded,
          is_available_now: newEquipment.isAvailableNow,
          contact_phone: newEquipment.contactPhone || null,
          model_year: newEquipment.modelYear || null,
          is_real: true
        };
        await supabase.from('machinery_equipment').insert([dbRow]);
        await supabase.from('equipment_rentals').insert([dbRow]);
      } catch (e) {
        console.warn('Supabase machinery save notice:', e);
      }
    }

    return newEquipment;
  }, [currentUserId, currentUserName, currentUserPhone]);

  // Delete Listing
  const deleteListing = useCallback(async (id: string, type: 'warehouse' | 'equipment') => {
    if (type === 'warehouse') {
      setWarehouses(prev => prev.filter(w => w.id !== id));
      try {
        const local = getLocalData<WarehouseFacility>(STORAGE_KEYS.WAREHOUSES);
        localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(local.filter(w => w.id !== id)));
        await fetch(`/api/services/warehouses/${id}`, { method: 'DELETE' });
        if (isSupabaseConfigured) {
          await supabase.from('storage_facilities').delete().eq('id', id);
          await supabase.from('warehouse_facilities').delete().eq('id', id);
        }
      } catch {}
    } else {
      setEquipment(prev => prev.filter(e => e.id !== id));
      try {
        const local = getLocalData<EquipmentRental>(STORAGE_KEYS.EQUIPMENT);
        localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(local.filter(e => e.id !== id)));
        await fetch(`/api/services/equipment/${id}`, { method: 'DELETE' });
        if (isSupabaseConfigured) {
          await supabase.from('machinery_equipment').delete().eq('id', id);
          await supabase.from('equipment_rentals').delete().eq('id', id);
        }
      } catch {}
    }
  }, []);

  // Update Warehouse
  const updateWarehouseListing = useCallback(async (id: string, updates: Partial<WarehouseFacility>) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    try {
      const local = getLocalData<WarehouseFacility>(STORAGE_KEYS.WAREHOUSES);
      localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(local.map(w => w.id === id ? { ...w, ...updates } : w)));
      await fetch(`/api/services/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (isSupabaseConfigured) {
        await supabase.from('storage_facilities').update(updates).eq('id', id);
        await supabase.from('warehouse_facilities').update(updates).eq('id', id);
      }
    } catch {}
  }, []);

  // Update Equipment
  const updateEquipmentListing = useCallback(async (id: string, updates: Partial<EquipmentRental>) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    try {
      const local = getLocalData<EquipmentRental>(STORAGE_KEYS.EQUIPMENT);
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(local.map(e => e.id === id ? { ...e, ...updates } : e)));
      await fetch(`/api/services/equipment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (isSupabaseConfigured) {
        await supabase.from('machinery_equipment').update(updates).eq('id', id);
        await supabase.from('equipment_rentals').update(updates).eq('id', id);
      }
    } catch {}
  }, []);

  // Create Booking Request
  const createBooking = useCallback(async (
    data: Omit<ServiceBooking, 'id' | 'status' | 'createdAt' | 'renterId' | 'renterName' | 'renterPhone'>,
    initialMessage?: string
  ) => {
    const bookingId = `bk_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newBooking: ServiceBooking = {
      ...data,
      id: bookingId,
      renterId: currentUserId,
      renterName: currentUserName,
      renterPhone: currentUserPhone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    try {
      const local = getLocalData<ServiceBooking>(STORAGE_KEYS.BOOKINGS);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([newBooking, ...local]));
      await fetch('/api/services/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
    } catch {}

    // Direct Supabase bookings persistence
    if (isSupabaseConfigured) {
      try {
        await supabase.from('service_bookings').insert([{
          id: bookingId,
          service_id: data.serviceId,
          service_type: data.serviceType,
          service_title: data.serviceTitle,
          owner_id: data.ownerId,
          owner_name: data.ownerName,
          owner_phone: data.ownerPhone || null,
          renter_id: currentUserId,
          renter_name: currentUserName,
          renter_phone: currentUserPhone,
          start_date: data.startDate,
          end_date: data.endDate || null,
          quantity_requested: data.quantityRequested,
          unit: data.unit,
          total_estimated_amount: data.totalEstimatedAmount,
          notes: data.notes || null,
          status: 'pending'
        }]);
      } catch (e) {
        console.warn('Supabase booking save notice:', e);
      }
    }

    if (initialMessage && initialMessage.trim()) {
      const msgId = `msg_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const nowIso = new Date().toISOString();
      const newMsg: ServiceMessage = {
        id: msgId,
        bookingId: bookingId,
        serviceId: data.serviceId,
        serviceTitle: data.serviceTitle,
        senderId: currentUserId,
        senderName: currentUserName,
        recipientId: data.ownerId,
        recipientName: data.ownerName,
        text: initialMessage.trim(),
        timestamp: nowIso,
        isRead: false
      };
      setMessages(prev => [newMsg, ...prev]);
      try {
        const localM = getLocalData<ServiceMessage>(STORAGE_KEYS.MESSAGES);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([newMsg, ...localM]));
        await fetch('/api/services/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMsg)
        });
      } catch {}

      if (isSupabaseConfigured) {
        try {
          await supabase.from('service_messages').insert([{
            id: msgId,
            booking_id: bookingId,
            service_id: data.serviceId,
            service_title: data.serviceTitle,
            sender_id: currentUserId,
            sender_name: currentUserName,
            recipient_id: data.ownerId,
            recipient_name: data.ownerName,
            text: initialMessage.trim(),
            timestamp: nowIso,
            is_read: false
          }]);
        } catch {}
      }
    }

    if (addNotification && data.ownerId) {
      addNotification({
        type: 'offer_received',
        title: `📦 Booking Request Sent: ${data.serviceTitle}`,
        titleHi: `📦 बुकिंग अनुरोध भेजा गया: ${data.serviceTitle}`,
        message: `Your booking request of ₹${data.totalEstimatedAmount.toLocaleString('en-IN')} for ${data.quantityRequested} ${data.unit} was sent to ${data.ownerName}.`,
        messageHi: `आपका ₹${data.totalEstimatedAmount.toLocaleString('en-IN')} का बुकिंग अनुरोध (${data.quantityRequested} ${data.unit}) ${data.ownerName} को भेज दिया गया है।`,
        commodity: data.serviceTitle,
        price: data.totalEstimatedAmount,
        quantity: data.quantityRequested,
        unit: data.unit,
        counterPartyName: data.ownerName,
        offerId: bookingId,
        listingId: data.serviceId,
        timestamp: 'Just now',
        linkTab: 'services'
      });
    }

    return newBooking;
  }, [currentUserId, currentUserName, currentUserPhone, addNotification]);

  // Update Booking Status
  const updateBookingStatus = useCallback(async (
    bookingId: string, 
    status: ServiceBooking['status']
  ) => {
    // 1. Immediately update local state
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status, updatedAt: new Date().toISOString() } : b));

    const targetBooking = bookings.find(b => b.id === bookingId);

    // 2. Local storage
    try {
      const local = getLocalData<ServiceBooking>(STORAGE_KEYS.BOOKINGS);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(local.map(b => b.id === bookingId ? { ...b, status } : b)));
    } catch {}

    // 3. Update server API (this broadcasts server notification to renter and owner)
    try {
      await fetch(`/api/services/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          bookingData: targetBooking 
        })
      });
    } catch (err) {
      console.warn('Booking server update error:', err);
    }

    // 4. Update Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('service_bookings')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', bookingId);
      } catch (sbErr) {
        console.warn('Notice: Supabase booking update notice:', sbErr);
      }

      // If status is confirmed, write a confirmed bilateral record into service_messages
      // This guarantees that any client reading from Supabase will detect the confirmed status
      if (status === 'confirmed' && targetBooking) {
        const confirmMsgId = `msg_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const confirmText = `✅ [BOOKING_ACCEPTED] Offer of ₹${Number(targetBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} for ${targetBooking.quantityRequested} ${targetBooking.unit} has been accepted and confirmed by ${targetBooking.ownerName || currentUserName}. Deal confirmed!`;
        const nowIso = new Date().toISOString();

        const counterPartyId = targetBooking.renterId === currentUserId ? targetBooking.ownerId : targetBooking.renterId;
        const counterPartyName = targetBooking.renterId === currentUserId ? targetBooking.ownerName : targetBooking.renterName;

        const newMsg: ServiceMessage = {
          id: confirmMsgId,
          bookingId: bookingId,
          serviceId: targetBooking.serviceId,
          serviceTitle: targetBooking.serviceTitle,
          senderId: currentUserId,
          senderName: currentUserName,
          recipientId: counterPartyId,
          recipientName: counterPartyName,
          text: confirmText,
          timestamp: nowIso,
          isRead: false
        };

        setMessages(prev => [newMsg, ...prev]);

        try {
          const localM = getLocalData<ServiceMessage>(STORAGE_KEYS.MESSAGES);
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([newMsg, ...localM]));
          await fetch('/api/services/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMsg)
          });
          await supabase.from('service_messages').insert([{
            id: confirmMsgId,
            booking_id: bookingId,
            service_id: targetBooking.serviceId,
            service_title: targetBooking.serviceTitle,
            sender_id: currentUserId,
            sender_name: currentUserName,
            recipient_id: counterPartyId,
            recipient_name: counterPartyName,
            text: confirmText,
            timestamp: nowIso,
            is_read: false
          }]);
        } catch (msgErr) {
          console.warn('Notice: Confirmation message save notice:', msgErr);
        }

        // Bell Drawer Notification for local user
        if (addNotification) {
          addNotification({
            type: 'offer_accepted',
            title: `✅ Offer Accepted! Deal Confirmed: ${targetBooking.serviceTitle}`,
            titleHi: `✅ ऑफर स्वीकार हुआ! सौदा पक्का: ${targetBooking.serviceTitle}`,
            message: `Booking deal confirmed for ${targetBooking.quantityRequested} ${targetBooking.unit} of "${targetBooking.serviceTitle}" at ₹${Number(targetBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')}.`,
            messageHi: `${targetBooking.serviceTitle} के लिए ₹${Number(targetBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} पर ${targetBooking.quantityRequested} ${targetBooking.unit} का सौदा पक्का हुआ।`,
            commodity: targetBooking.serviceTitle,
            price: Number(targetBooking.totalEstimatedAmount || 0),
            quantity: Number(targetBooking.quantityRequested || 1),
            unit: targetBooking.unit,
            counterPartyName: counterPartyName,
            offerId: bookingId,
            listingId: targetBooking.serviceId,
            timestamp: 'Just now',
            linkTab: 'services'
          });
        }
      }
    }
  }, [bookings, currentUserId, currentUserName, addNotification]);

  // Send Direct Message
  const sendMessage = useCallback(async (
    recipientId: string,
    recipientName: string,
    serviceId: string,
    serviceTitle: string,
    text: string,
    bookingId?: string
  ) => {
    const msgId = `msg_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const nowIso = new Date().toISOString();
    const newMsg: ServiceMessage = {
      id: msgId,
      bookingId,
      serviceId,
      serviceTitle,
      senderId: currentUserId,
      senderName: currentUserName,
      recipientId,
      recipientName,
      text: text.trim(),
      timestamp: nowIso,
      isRead: false
    };

    setMessages(prev => [newMsg, ...prev]);

    try {
      const local = getLocalData<ServiceMessage>(STORAGE_KEYS.MESSAGES);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([newMsg, ...local]));
      await fetch('/api/services/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('service_messages').insert([{
          id: msgId,
          booking_id: bookingId || null,
          service_id: serviceId,
          service_title: serviceTitle,
          sender_id: currentUserId,
          sender_name: currentUserName,
          recipient_id: recipientId,
          recipient_name: recipientName,
          text: text.trim(),
          timestamp: nowIso,
          is_read: false
        }]);
      } catch (err) {
        console.warn('Notice: Supabase message send notice:', err);
      }
    }

    return newMsg;
  }, [currentUserId, currentUserName]);

  // Mark Conversation As Read
  const markConversationAsRead = useCallback((otherUserId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.senderId === otherUserId && m.recipientId === currentUserId && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    }));
  }, [currentUserId]);

  return {
    currentUserId,
    currentUserName,
    currentUserPhone,
    isDemo,
    loading,
    isSyncing,
    warehouses,
    equipment,
    allRawWarehouses: warehouses,
    allRawEquipment: equipment,
    publicWarehouses,
    publicEquipment,
    myWarehouses,
    myEquipment,
    totalMyListings,
    bookings,
    bookingsReceived,
    bookingsMade,
    messages: userMessages,
    unreadMessagesCount,
    addWarehouseListing,
    addEquipmentListing,
    deleteListing,
    updateWarehouseListing,
    updateEquipmentListing,
    createBooking,
    updateBookingStatus,
    sendMessage,
    markConversationAsRead,
    refresh: () => setTick(t => t + 1)
  };
}
