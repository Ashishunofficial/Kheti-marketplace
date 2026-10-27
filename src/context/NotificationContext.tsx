import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'kheti_notifications_v3';

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_seed_1',
    type: 'offer_received',
    title: 'New Produce Offer Received',
    titleHi: 'नया खरीद ऑफर प्राप्त हुआ',
    message: 'Mahavir Roller Flour Mills has offered ₹2,490/qtl for 80 Quintals of Wheat (गेहूं). Total deal: ₹1,99,200.',
    messageHi: 'महावीर रोलर फ्लोर मिल्स ने आपके 80 क्विंटल गेहूं के लिए ₹2,490/क्विंटल का ऑफर दिया है। कुल सौदा: ₹1,99,200।',
    commodity: 'Wheat (गेहूं)',
    price: 2490,
    quantity: 80,
    unit: 'Quintal',
    counterPartyName: 'Mahavir Roller Flour Mills',
    offerId: 'ofr_801',
    listingId: 'lst_101',
    timestamp: '10 mins ago',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
    linkTab: 'marketplace',
  },
  {
    id: 'notif_seed_2',
    type: 'offer_accepted',
    title: 'Offer Accepted! Deal Confirmed',
    titleHi: 'ऑफर स्वीकार हुआ! सौदा पक्का',
    message: 'Gurpreet Agro Farms accepted your offer for 150 Quintals of Basmati Paddy (धान) at ₹4,120/qtl. Escrow locked.',
    messageHi: 'गुरप्रीत एग्रो फार्म्स ने आपके 150 क्विंटल बासमती धान का ₹4,120/क्विंटल पर ऑफर स्वीकार कर लिया। एस्क्रो भुगतान सुरक्षित।',
    commodity: 'Basmati Paddy (धान)',
    price: 4120,
    quantity: 150,
    unit: 'Quintal',
    counterPartyName: 'Gurpreet Agro Farms',
    offerId: 'ofr_802',
    listingId: 'lst_102',
    timestamp: '45 mins ago',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isRead: false,
    linkTab: 'marketplace',
  },
  {
    id: 'notif_seed_3',
    type: 'system_alert',
    title: 'Cabinet Announced Wheat MSP Hike',
    titleHi: 'गेहूं न्यूनतम समर्थन मूल्य (MSP) में वृद्धि',
    message: '2026-27 Wheat MSP announced at ₹2,425/quintal (+₹150). Check nearby mandi modal rates.',
    messageHi: '2026-27 गेहूं MSP ₹2,425/क्विंटल घोषित। निकटतम मंडी भाव देखें।',
    commodity: 'Wheat (गेहूं)',
    price: 2425,
    timestamp: 'Today, 08:30 AM',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    linkTab: 'mandi',
  },
];

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  simulateOfferNotification: (type: 'offer_received' | 'offer_accepted') => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const currentUserId = user?.id || profile?.id || '';

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${currentUserId || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return SEED_NOTIFICATIONS;
  });

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Sync to user-specific localStorage key
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${currentUserId || 'guest'}`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications, currentUserId]);

  // Fetch notifications from server & Supabase for the active user ID
  const fetchServerNotifications = useCallback(async () => {
    let combinedNotifs: AppNotification[] = [];

    // 1. Fetch from server API if reachable
    try {
      const url = currentUserId ? `/api/notifications?userId=${encodeURIComponent(currentUserId)}` : '/api/notifications';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          combinedNotifs.push(...data.notifications);
        }
      }
    } catch (err) {
      // Offline fallback
    }

    // 2. Fetch directly from Supabase (Guarantees multi-user cross-device notifications on Vercel & live hosts)
    if (isSupabaseConfigured && currentUserId) {
      try {
        // A. Service Bookings (Storage & Machinery)
        const { data: bookingsDb } = await supabase
          .from('service_bookings')
          .select('*')
          .or(`renter_id.eq.${currentUserId},owner_id.eq.${currentUserId}`);

        if (bookingsDb && Array.isArray(bookingsDb)) {
          bookingsDb.forEach((b: any) => {
            const isRenter = b.renter_id === currentUserId;
            const isOwner = b.owner_id === currentUserId;

            if (b.status === 'confirmed' && isRenter) {
              combinedNotifs.push({
                id: `notif_bk_conf_${b.id}`,
                type: 'offer_accepted',
                recipientUserId: currentUserId,
                title: `🎉 Offer Accepted! Deal Confirmed: ${b.service_title}`,
                titleHi: `🎉 ऑफर स्वीकार हुआ! सौदा पक्का: ${b.service_title}`,
                message: `${b.owner_name || 'The owner'} accepted your booking offer of ₹${Number(b.total_estimated_amount || 0).toLocaleString('en-IN')} for ${b.quantity_requested} ${b.unit} of "${b.service_title}". Deal confirmed!`,
                messageHi: `${b.owner_name || 'मालिक'} ने आपके "${b.service_title}" के लिए ₹${Number(b.total_estimated_amount || 0).toLocaleString('en-IN')} (${b.quantity_requested} ${b.unit}) का ऑफर स्वीकार कर लिया है। सौदा पक्का!`,
                commodity: b.service_title,
                price: Number(b.total_estimated_amount || 0),
                quantity: Number(b.quantity_requested || 1),
                unit: b.unit || 'units',
                counterPartyName: b.owner_name || 'Facility Owner',
                offerId: b.id,
                listingId: b.service_id,
                timestamp: 'Just now',
                createdAt: b.updated_at || b.created_at || new Date().toISOString(),
                isRead: false,
                linkTab: 'services'
              });
            } else if (b.status === 'pending' && isOwner) {
              combinedNotifs.push({
                id: `notif_bk_recv_${b.id}`,
                type: 'offer_received',
                recipientUserId: currentUserId,
                title: `📦 New Service Offer: ${b.service_title}`,
                titleHi: `📦 नया स्पेस/मशीन ऑफर प्राप्त हुआ: ${b.service_title}`,
                message: `${b.renter_name || 'A farmer'} submitted a booking offer of ₹${Number(b.total_estimated_amount || 0).toLocaleString('en-IN')} for ${b.quantity_requested} ${b.unit} of "${b.service_title}". Review and accept.`,
                messageHi: `${b.renter_name || 'किसान'} ने आपके "${b.service_title}" के लिए ₹${Number(b.total_estimated_amount || 0).toLocaleString('en-IN')} (${b.quantity_requested} ${b.unit}) का ऑफर भेजा है।`,
                commodity: b.service_title,
                price: Number(b.total_estimated_amount || 0),
                quantity: Number(b.quantity_requested || 1),
                unit: b.unit || 'units',
                counterPartyName: b.renter_name || 'Farmer Client',
                offerId: b.id,
                listingId: b.service_id,
                timestamp: 'Just now',
                createdAt: b.created_at || new Date().toISOString(),
                isRead: false,
                linkTab: 'services'
              });
            }
          });
        }

        // B. Offer Negotiations (Marketplace Produce)
        const { data: offersDb } = await supabase
          .from('offer_negotiations')
          .select('*')
          .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`);

        if (offersDb && Array.isArray(offersDb)) {
          offersDb.forEach((o: any) => {
            const isBuyer = o.buyer_id === currentUserId;
            const isSeller = o.seller_id === currentUserId;

            if (o.status === 'accepted' && isBuyer) {
              combinedNotifs.push({
                id: `notif_ofr_acc_${o.id}`,
                type: 'offer_accepted',
                recipientUserId: currentUserId,
                title: `🎉 Produce Offer Accepted: ${o.commodity}`,
                titleHi: `🎉 उपज ऑफर स्वीकार हुआ: ${o.commodity}`,
                message: `${o.seller_name || 'Seller'} accepted your offer of ₹${Number(o.offered_price || 0).toLocaleString('en-IN')}/${o.unit || 'qtl'} for ${o.quantity} ${o.unit || 'Quintals'} of ${o.commodity}.`,
                messageHi: `${o.seller_name || 'विक्रेता'} ने आपके ${o.quantity} ${o.unit || 'क्विंटल'} ${o.commodity} का ₹${Number(o.offered_price || 0).toLocaleString('en-IN')} पर ऑफर स्वीकार कर लिया।`,
                commodity: o.commodity,
                price: Number(o.offered_price || 0),
                quantity: Number(o.quantity || 1),
                unit: o.unit || 'Quintal',
                counterPartyName: o.seller_name || 'Seller',
                offerId: o.id,
                listingId: o.listing_id,
                timestamp: 'Just now',
                createdAt: o.updated_at || o.created_at || new Date().toISOString(),
                isRead: false,
                linkTab: 'marketplace'
              });
            } else if (o.status === 'pending' && isSeller) {
              combinedNotifs.push({
                id: `notif_ofr_recv_${o.id}`,
                type: 'offer_received',
                recipientUserId: currentUserId,
                title: `🌾 New Produce Offer: ${o.commodity}`,
                titleHi: `🌾 नया खरीद ऑफर: ${o.commodity}`,
                message: `${o.buyer_name || 'Buyer'} offered ₹${Number(o.offered_price || 0).toLocaleString('en-IN')}/${o.unit || 'qtl'} for ${o.quantity} ${o.unit || 'Quintals'} of ${o.commodity}.`,
                messageHi: `${o.buyer_name || 'खरीदार'} ने ${o.quantity} ${o.unit || 'क्विंटल'} ${o.commodity} के लिए ₹${Number(o.offered_price || 0).toLocaleString('en-IN')} का ऑफर दिया है।`,
                commodity: o.commodity,
                price: Number(o.offered_price || 0),
                quantity: Number(o.quantity || 1),
                unit: o.unit || 'Quintal',
                counterPartyName: o.buyer_name || 'Buyer',
                offerId: o.id,
                listingId: o.listing_id,
                timestamp: 'Just now',
                createdAt: o.created_at || new Date().toISOString(),
                isRead: false,
                linkTab: 'marketplace'
              });
            }
          });
        }
      } catch (sbErr) {
        console.warn('Notice: Supabase notifications fetch notice:', sbErr);
      }
    }

    if (combinedNotifs.length > 0) {
      setNotifications(prev => {
        const readMap = new Map(prev.map(p => [p.id, p.isRead]));
        // Deduplicate by ID
        const seen = new Set<string>();
        const merged: AppNotification[] = [];

        combinedNotifs.forEach(n => {
          if (!seen.has(n.id)) {
            seen.add(n.id);
            merged.push({
              ...n,
              isRead: readMap.has(n.id) ? (readMap.get(n.id) ?? n.isRead) : n.isRead
            });
          }
        });

        // Add seed notifications if not already seen
        SEED_NOTIFICATIONS.forEach(s => {
          if (!seen.has(s.id)) {
            seen.add(s.id);
            merged.push({
              ...s,
              isRead: readMap.has(s.id) ? (readMap.get(s.id) ?? s.isRead) : s.isRead
            });
          }
        });

        return merged;
      });
    }
  }, [currentUserId]);

  // Initial fetch, regular polling (2.5s) and Supabase Realtime channel subscription
  useEffect(() => {
    fetchServerNotifications();

    const interval = setInterval(() => {
      fetchServerNotifications();
    }, 2500);

    let rtChannel: any = null;
    if (isSupabaseConfigured) {
      try {
        rtChannel = supabase
          .channel('kheti_notifications_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, () => {
            fetchServerNotifications();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'offer_negotiations' }, () => {
            fetchServerNotifications();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'service_messages' }, () => {
            fetchServerNotifications();
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime notifications channel notice:', e);
      }
    }

    return () => {
      clearInterval(interval);
      if (rtChannel) {
        try { supabase.removeChannel(rtChannel); } catch (_) {}
      }
    };
  }, [fetchServerNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
    } catch {}
  }, [currentUserId]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      await fetch(`/api/notifications?userId=${encodeURIComponent(currentUserId)}`, { method: 'DELETE' });
    } catch {}
  }, [currentUserId]);

  const addNotification = useCallback(async (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newEntry: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      timestamp: notif.timestamp || 'Just now',
      isRead: false,
    };
    setNotifications(prev => [newEntry, ...prev]);

    // Push to server so other tabs/devices receive it
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
    } catch {}
  }, []);

  const simulateOfferNotification = useCallback((type: 'offer_received' | 'offer_accepted') => {
    const randomFPO = ['Kisan Vikas FPO', 'Haryana Agro Traders', 'Ambala Grain Corporation', 'Golden Harvest FPC'][Math.floor(Math.random() * 4)];
    const randomCrop = ['Basmati Rice (1121)', 'Wheat (गेहूं Sharbati)', 'Mustard (सरसों)', 'Soybean (सोयाबीन)'][Math.floor(Math.random() * 4)];
    const randomQty = Math.floor(Math.random() * 80) + 20;
    const randomRate = Math.floor(Math.random() * 1200) + 2400;

    if (type === 'offer_received') {
      addNotification({
        type: 'offer_received',
        recipientUserId: currentUserId,
        title: `New Buy Offer from ${randomFPO}`,
        titleHi: `${randomFPO} से नया खरीद प्रस्ताव प्राप्त हुआ`,
        message: `${randomFPO} submitted an offer of ₹${randomRate.toLocaleString('en-IN')}/qtl for ${randomQty} Quintals of ${randomCrop}. Total: ₹${(randomRate * randomQty).toLocaleString('en-IN')}.`,
        messageHi: `${randomFPO} ने ${randomQty} क्विंटल ${randomCrop} के लिए ₹${randomRate.toLocaleString('en-IN')}/क्विंटल का नया ऑफर प्रस्तुत किया। कुल राशि: ₹${(randomRate * randomQty).toLocaleString('en-IN')}।`,
        commodity: randomCrop,
        price: randomRate,
        quantity: randomQty,
        unit: 'Quintal',
        counterPartyName: randomFPO,
        timestamp: 'Just now',
        linkTab: 'marketplace',
      });
    } else {
      addNotification({
        type: 'offer_accepted',
        recipientUserId: currentUserId,
        title: `Deal Confirmed with ${randomFPO}!`,
        titleHi: `${randomFPO} के साथ सौदा पक्का!`,
        message: `Your trade negotiation for ${randomQty} Quintals of ${randomCrop} at ₹${randomRate.toLocaleString('en-IN')}/qtl has been accepted. Escrow locked!`,
        messageHi: `${randomCrop} के ${randomQty} क्विंटल के लिए ₹${randomRate.toLocaleString('en-IN')}/क्विंटल पर आपका सौदा स्वीकार कर लिया गया। एस्क्रो भुगतान लॉक!`,
        commodity: randomCrop,
        price: randomRate,
        quantity: randomQty,
        unit: 'Quintal',
        counterPartyName: randomFPO,
        timestamp: 'Just now',
        linkTab: 'marketplace',
      });
    }
  }, [addNotification, currentUserId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isNotificationOpen,
        setIsNotificationOpen,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        simulateOfferNotification,
        refreshNotifications: fetchServerNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
