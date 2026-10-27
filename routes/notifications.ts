import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

export interface StoredNotification {
  id: string;
  recipientUserId?: string; // Target user UUID or ID
  recipientName?: string;   // Target user name or role
  senderUserId?: string;
  senderName?: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_countered' | 'service_booking' | 'system_alert';
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  commodity?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  counterPartyName?: string;
  offerId?: string;
  listingId?: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
  linkTab?: string;
}

const SEED_SERVER_NOTIFICATIONS: StoredNotification[] = [
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

export function loadNotifications(): StoredNotification[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading notifications file:', err);
  }

  saveNotifications(SEED_SERVER_NOTIFICATIONS);
  return SEED_SERVER_NOTIFICATIONS;
}

export function saveNotifications(notifications: StoredNotification[]) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving notifications file:', err);
  }
}

export function addServerNotification(notif: Omit<StoredNotification, 'id' | 'createdAt' | 'isRead'> & { isRead?: boolean }): StoredNotification {
  const current = loadNotifications();
  const newNotif: StoredNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    timestamp: notif.timestamp || 'Just now',
    isRead: notif.isRead ?? false,
  };
  const updated = [newNotif, ...current];
  saveNotifications(updated);
  return newNotif;
}

export function createNotificationsRouter() {
  const router = express.Router();

  // GET /api/notifications?userId=...&userName=...
  router.get('/', (req: Request, res: Response) => {
    const userId = req.query.userId ? String(req.query.userId).trim() : undefined;
    const userName = req.query.userName ? String(req.query.userName).trim().toLowerCase() : undefined;
    const all = loadNotifications();

    if (!userId && !userName) {
      return res.json({ success: true, count: all.length, notifications: all });
    }

    // Filter notifications for this specific user, user name, or global broadcasts
    const userNotifs = all.filter(n => {
      // Global broadcast (no recipient)
      if (!n.recipientUserId && !n.recipientName) return true;
      // Targeted to this user ID
      if (userId && n.recipientUserId && n.recipientUserId.toLowerCase() === userId.toLowerCase()) return true;
      // Targeted by user Name / fragment
      if (userName && n.recipientName && (
        n.recipientName.toLowerCase().includes(userName) || userName.includes(n.recipientName.toLowerCase())
      )) return true;
      // If notification has counterPartyName or recipientName matching user
      if (userName && n.recipientUserId && userId && n.recipientUserId === userId) return true;
      return false;
    });

    res.json({
      success: true,
      count: userNotifs.length,
      notifications: userNotifs
    });
  });

  // POST /api/notifications
  router.post('/', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.title || !data.message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const created = addServerNotification(data);
    res.status(201).json({ success: true, notification: created });
  });

  // PUT /api/notifications/:id/read
  router.put('/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const all = loadNotifications();
    const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotifications(updated);
    res.json({ success: true, message: 'Notification marked as read' });
  });

  // PUT /api/notifications/mark-all-read
  router.put('/mark-all-read', (req: Request, res: Response) => {
    const { userId } = req.body;
    const all = loadNotifications();
    const updated = all.map(n => {
      if (!userId || n.recipientUserId === userId || !n.recipientUserId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    saveNotifications(updated);
    res.json({ success: true, message: 'All notifications marked as read' });
  });

  // DELETE /api/notifications
  router.delete('/', (req: Request, res: Response) => {
    const userId = req.query.userId as string | undefined;
    if (!userId) {
      saveNotifications([]);
      return res.json({ success: true, message: 'All notifications cleared' });
    }
    const all = loadNotifications();
    const remaining = all.filter(n => n.recipientUserId !== userId);
    saveNotifications(remaining);
    res.json({ success: true, message: 'Notifications cleared for user' });
  });

  return router;
}
