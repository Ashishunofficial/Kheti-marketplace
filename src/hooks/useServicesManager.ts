import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { WarehouseFacility, EquipmentRental, ServiceBooking, ServiceMessage } from '../types';
import { 
  MOCK_WAREHOUSES, 
  MOCK_EQUIPMENTS, 
  MOCK_SERVICE_BOOKINGS, 
  MOCK_SERVICE_MESSAGES 
} from '../data/mockData';

const STORAGE_KEYS = {
  WAREHOUSES: 'kheti_warehouses_store_v1',
  EQUIPMENT: 'kheti_equipment_store_v1',
  BOOKINGS: 'kheti_bookings_store_v1',
  MESSAGES: 'kheti_messages_store_v1'
};

const MOCK_WAREHOUSE_IDS = new Set(['wh_my_01', 'wh_krn_01', 'wh_krn_02', 'wh_ldh_03']);
const MOCK_EQUIPMENT_IDS = new Set(['eq_my_01', 'eq_501', 'eq_502', 'eq_503', 'eq_504']);
const MOCK_BOOKING_IDS = new Set(['bk_wh_101', 'bk_wh_102', 'bk_eq_201']);
const MOCK_MESSAGE_IDS = new Set(['msg_01', 'msg_02', 'msg_03']);
const MOCK_PROVIDER_IDS = new Set([
  'usr_rameshwar_99',
  'usr_hwc_corp',
  'usr_balaji_cold',
  'usr_pungrain',
  'usr_kuldeep_singh',
  'usr_jatinder_agro',
  'usr_kisan_drone',
  'usr_surjit_ram'
]);

export function useServicesManager() {
  const { user, profile, isAuthenticated, isDemo } = useAuth();

  // Resolved user identity
  const currentUserId = user?.id || profile?.id || (isDemo ? 'usr_rameshwar_99' : '');
  const currentUserName = profile?.name || user?.user_metadata?.full_name || (isDemo ? 'Rameshwar Singh' : 'Kisan Provider');
  const currentUserPhone = profile?.phone || user?.phone || '+91 98124 55432';

  // State
  const [warehouses, setWarehouses] = useState<WarehouseFacility[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading warehouses from localStorage', e);
    }
    return MOCK_WAREHOUSES;
  });

  const [equipment, setEquipment] = useState<EquipmentRental[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading equipment from localStorage', e);
    }
    return MOCK_EQUIPMENTS;
  });

  const [bookings, setBookings] = useState<ServiceBooking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading bookings from localStorage', e);
    }
    return MOCK_SERVICE_BOOKINGS;
  });

  const [messages, setMessages] = useState<ServiceMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading messages from localStorage', e);
    }
    return MOCK_SERVICE_MESSAGES;
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
    } catch (e) {
      console.error('Error saving warehouses', e);
    }
  }, [warehouses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
    } catch (e) {
      console.error('Error saving equipment', e);
    }
  }, [equipment]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.error('Error saving bookings', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving messages', e);
    }
  }, [messages]);

  // Derived user-isolated sets
  // 1. Public browse collections
  const publicWarehouses = warehouses.filter(wh => {
    if (isDemo) return true;
    const isMock = MOCK_WAREHOUSE_IDS.has(wh.id) || (wh.ownerId ? MOCK_PROVIDER_IDS.has(wh.ownerId) : false) || wh.ownerId === 'usr_rameshwar_99';
    const isMine = wh.ownerId === currentUserId;
    return !isMock && !isMine;
  });

  const publicEquipment = equipment.filter(eq => {
    if (isDemo) return true;
    const isMock = MOCK_EQUIPMENT_IDS.has(eq.id) || (eq.ownerId ? MOCK_PROVIDER_IDS.has(eq.ownerId) : false) || eq.ownerId === 'usr_rameshwar_99';
    const isMine = eq.ownerId === currentUserId;
    return !isMock && !isMine;
  });

  // 2. My Listings (Warehouses & Machinery owned strictly by this user)
  const myWarehouses = warehouses.filter(wh => {
    if (isDemo) {
      return wh.ownerId === 'usr_rameshwar_99' || wh.ownerId === currentUserId;
    }
    const isMock = MOCK_WAREHOUSE_IDS.has(wh.id) || wh.ownerId === 'usr_rameshwar_99';
    return !isMock && wh.ownerId === currentUserId;
  });

  const myEquipment = equipment.filter(eq => {
    if (isDemo) {
      return eq.ownerId === 'usr_rameshwar_99' || eq.ownerId === currentUserId;
    }
    const isMock = MOCK_EQUIPMENT_IDS.has(eq.id) || eq.ownerId === 'usr_rameshwar_99';
    return !isMock && eq.ownerId === currentUserId;
  });

  const totalMyListings = myWarehouses.length + myEquipment.length;

  // 3. Bookings Received (Customers who booked spaces/machinery listed by this user)
  const bookingsReceived = bookings.filter(b => {
    if (isDemo) {
      return b.ownerId === 'usr_rameshwar_99' || b.ownerId === currentUserId;
    }
    const isMock = MOCK_BOOKING_IDS.has(b.id) || b.ownerId === 'usr_rameshwar_99';
    return !isMock && b.ownerId === currentUserId;
  });

  // 4. Bookings Made (Spaces/machinery this user booked from other owners)
  const bookingsMade = bookings.filter(b => {
    if (isDemo) {
      return b.renterId === 'usr_rameshwar_99' || b.renterId === currentUserId;
    }
    const isMock = MOCK_BOOKING_IDS.has(b.id) || b.renterId === 'usr_rameshwar_99';
    return !isMock && b.renterId === currentUserId;
  });

  // 5. Messages involving current user
  const userMessages = messages.filter(m => {
    if (isDemo) {
      return m.senderId === 'usr_rameshwar_99' || m.recipientId === 'usr_rameshwar_99' || m.senderId === currentUserId || m.recipientId === currentUserId;
    }
    const isMock = MOCK_MESSAGE_IDS.has(m.id) || m.senderId === 'usr_rameshwar_99' || m.recipientId === 'usr_rameshwar_99';
    return !isMock && (m.senderId === currentUserId || m.recipientId === currentUserId);
  });

  const unreadMessagesCount = userMessages.filter(
    m => m.recipientId === currentUserId && !m.isRead
  ).length;

  // ─── Actions ─────────────────────────────────────────────────────────────

  // Add Warehouse Space Listing
  const addWarehouseListing = useCallback((data: Omit<WarehouseFacility, 'id' | 'ownerId' | 'ownerName'>) => {
    const newFacility: WarehouseFacility = {
      ...data,
      id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ownerId: currentUserId,
      ownerName: currentUserName,
      createdAt: new Date().toISOString()
    };
    setWarehouses(prev => [newFacility, ...prev]);
    return newFacility;
  }, [currentUserId, currentUserName]);

  // Add Equipment / Vehicle Rental Listing
  const addEquipmentListing = useCallback((data: Omit<EquipmentRental, 'id' | 'ownerId' | 'ownerName'>) => {
    const newEquipment: EquipmentRental = {
      ...data,
      id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ownerId: currentUserId,
      ownerName: currentUserName,
      createdAt: new Date().toISOString()
    };
    setEquipment(prev => [newEquipment, ...prev]);
    return newEquipment;
  }, [currentUserId, currentUserName]);

  // Delete Listing
  const deleteListing = useCallback((id: string, type: 'warehouse' | 'equipment') => {
    if (type === 'warehouse') {
      setWarehouses(prev => prev.filter(w => w.id !== id));
    } else {
      setEquipment(prev => prev.filter(e => e.id !== id));
    }
  }, []);

  const updateWarehouseListing = useCallback((id: string, data: Partial<WarehouseFacility>) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
  }, []);

  const updateEquipmentListing = useCallback((id: string, data: Partial<EquipmentRental>) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);

  // Create a Booking (Renter booking a godown or machine from an Owner)
  const createBooking = useCallback((
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
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newBooking: ServiceBooking = {
      ...bookingData,
      id: bookingId,
      renterId: currentUserId,
      renterName: currentUserName,
      renterPhone: currentUserPhone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    // Send automatic initial inquiry message to owner
    const messageText = initialMessageText?.trim() || 
      `नमस्ते! मैंने आपके "${bookingData.serviceTitle}" के लिए ${bookingData.quantityRequested} ${bookingData.unit} की बुकिंग अनुरोध भेजा है (${bookingData.startDate} से)। कृपया पुष्टि करें।`;

    const initialMsg: ServiceMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      bookingId,
      serviceId: bookingData.serviceId,
      serviceTitle: bookingData.serviceTitle,
      senderId: currentUserId,
      senderName: currentUserName,
      recipientId: bookingData.ownerId,
      recipientName: bookingData.ownerName,
      text: messageText,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, initialMsg]);

    return { booking: newBooking, message: initialMsg };
  }, [currentUserId, currentUserName, currentUserPhone]);

  // Update Booking Status (Owner accepts / rejects / completes booking)
  const updateBookingStatus = useCallback((
    bookingId: string, 
    status: ServiceBooking['status'],
    reasonNote?: string
  ) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;

      const updated = { ...b, status, updatedAt: new Date().toISOString() };

      // Dispatch automated notification message
      const statusLabel = status === 'confirmed' 
        ? 'स्वीकृत (Confirmed)' 
        : status === 'rejected' 
        ? 'अस्वीकृत (Declined)' 
        : status === 'completed'
        ? 'पूर्ण (Completed)'
        : status;

      const notifyMsg: ServiceMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        bookingId: b.id,
        serviceId: b.serviceId,
        serviceTitle: b.serviceTitle,
        senderId: currentUserId,
        senderName: currentUserName,
        recipientId: b.renterId === currentUserId ? b.ownerId : b.renterId,
        recipientName: b.renterId === currentUserId ? b.ownerName : b.renterName,
        text: `[अपडेट] बुकिंग #${b.id.slice(-6).toUpperCase()} की स्थिति: ${statusLabel}. ${reasonNote ? `टिप्पणी: ${reasonNote}` : ''}`,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      setMessages(mPrev => [...mPrev, notifyMsg]);

      return updated;
    }));
  }, [currentUserId, currentUserName]);

  // Send Direct Message
  const sendMessage = useCallback((
    recipientId: string,
    recipientName: string,
    serviceId: string,
    serviceTitle: string,
    text: string,
    bookingId?: string
  ) => {
    const newMsg: ServiceMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      bookingId,
      serviceId,
      serviceTitle,
      senderId: currentUserId,
      senderName: currentUserName,
      recipientId,
      recipientName,
      text,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  }, [currentUserId, currentUserName]);

  // Mark all messages in a conversation as read
  const markConversationAsRead = useCallback((otherUserId: string, serviceId?: string) => {
    setMessages(prev => prev.map(m => {
      const matchesUser = m.senderId === otherUserId && m.recipientId === currentUserId;
      const matchesService = serviceId ? m.serviceId === serviceId : true;
      if (matchesUser && matchesService && !m.isRead) {
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
    // Datasets
    warehouses: publicWarehouses,
    equipment: publicEquipment,
    allRawWarehouses: warehouses,
    allRawEquipment: equipment,
    myWarehouses,
    myEquipment,
    totalMyListings,
    bookingsReceived,
    bookingsMade,
    messages: userMessages,
    unreadMessagesCount,
    // Operations
    addWarehouseListing,
    addEquipmentListing,
    updateWarehouseListing,
    updateEquipmentListing,
    deleteListing,
    createBooking,
    updateBookingStatus,
    sendMessage,
    markConversationAsRead,
  };
}
