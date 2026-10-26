import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';

const STORAGE_KEY = 'kheti_notifications_v2';

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newEntry: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newEntry, ...prev]);
  }, []);

  const simulateOfferNotification = useCallback((type: 'offer_received' | 'offer_accepted') => {
    const randomFPO = ['Kisan Vikas FPO', 'Haryana Agro Traders', 'Ambala Grain Corporation', 'Golden Harvest FPC'][Math.floor(Math.random() * 4)];
    const randomCrop = ['Basmati Rice (1121)', 'Wheat (गेहूं Sharbati)', 'Mustard (सरसों)', 'Soybean (सोयाबीन)'][Math.floor(Math.random() * 4)];
    const randomQty = Math.floor(Math.random() * 80) + 20;
    const randomRate = Math.floor(Math.random() * 1200) + 2400;

    if (type === 'offer_received') {
      addNotification({
        type: 'offer_received',
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
  }, [addNotification]);

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
