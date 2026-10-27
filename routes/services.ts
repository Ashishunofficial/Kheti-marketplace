import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { addServerNotification } from './notifications';

// ─── File-Based Shared Persistence for Storage & Machinery ─────────────────
const DATA_DIR = path.resolve(process.cwd(), 'data');
const SERVICES_FILE = path.join(DATA_DIR, 'services_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

// Initial Real Community Storage & Machinery created by registered real users (populated dynamically from Supabase / live posts)
const INITIAL_REAL_WAREHOUSES: any[] = [];
const INITIAL_REAL_EQUIPMENTS: any[] = [];


interface ServicesStoreData {
  warehouses: any[];
  equipment: any[];
  bookings: any[];
  messages: any[];
  deletedServiceIds?: string[];
}

function loadServicesStore(): ServicesStoreData {
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const raw = fs.readFileSync(SERVICES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.warehouses) && Array.isArray(parsed.equipment)) {
        if (!Array.isArray(parsed.deletedServiceIds)) {
          parsed.deletedServiceIds = [];
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading services store file:', err);
  }

  // Initialize with real data
  const initialData: ServicesStoreData = {
    warehouses: INITIAL_REAL_WAREHOUSES,
    equipment: INITIAL_REAL_EQUIPMENTS,
    bookings: [],
    messages: [],
    deletedServiceIds: []
  };
  saveServicesStore(initialData);
  return initialData;
}

function saveServicesStore(data: ServicesStoreData) {
  try {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving services store file:', err);
  }
}

export function createServicesRouter() {
  const router = express.Router();

  // ─── Warehouses ─────────────────────────────────────────────────────────────
  router.get('/warehouses', (_req: Request, res: Response) => {
    const store = loadServicesStore();
    const deletedSet = new Set((store.deletedServiceIds || []).map(id => String(id).toLowerCase()));
    const activeWarehouses = store.warehouses.filter(w => !deletedSet.has(String(w.id).toLowerCase()));
    res.json({
      success: true,
      count: activeWarehouses.length,
      warehouses: activeWarehouses,
      deletedServiceIds: store.deletedServiceIds || []
    });
  });

  router.post('/warehouses', (req: Request, res: Response) => {
    const item = req.body;
    if (!item.name || !item.district) {
      return res.status(400).json({ error: 'Warehouse name and district are required' });
    }

    const store = loadServicesStore();
    const newWarehouse = {
      ...item,
      id: item.id || `wh_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ownerId: item.ownerId || 'usr_anonymous',
      ownerName: item.ownerName || 'Verified Facility Provider',
      type: item.type || 'Dry Godown',
      district: item.district,
      state: item.state || 'India',
      totalCapacityMT: Number(item.totalCapacityMT || 1000),
      availableCapacityMT: Number(item.availableCapacityMT || 500),
      ratePerBagPerMonth: Number(item.ratePerBagPerMonth || 10),
      isWdrcRegistered: item.isWdrcRegistered ?? true,
      contactPhone: item.contactPhone || '',
      address: item.address || '',
      isReal: true,
      createdAt: new Date().toISOString()
    };

    store.warehouses = [newWarehouse, ...store.warehouses];
    saveServicesStore(store);

    console.log(`[Services API] ✅ New warehouse listed by ${newWarehouse.ownerName}: ${newWarehouse.name}`);
    res.status(201).json({ success: true, warehouse: newWarehouse });
  });

  router.put('/warehouses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const store = loadServicesStore();
    const idx = store.warehouses.findIndex(w => w.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    store.warehouses[idx] = { ...store.warehouses[idx], ...updates, updatedAt: new Date().toISOString() };
    saveServicesStore(store);
    res.json({ success: true, warehouse: store.warehouses[idx] });
  });

  router.delete('/warehouses/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = loadServicesStore();
    if (!store.deletedServiceIds) store.deletedServiceIds = [];
    const cleanId = String(id).trim();
    const lowerId = cleanId.toLowerCase();
    if (!store.deletedServiceIds.includes(cleanId)) {
      store.deletedServiceIds.push(cleanId);
    }
    if (!store.deletedServiceIds.includes(lowerId)) {
      store.deletedServiceIds.push(lowerId);
    }

    store.warehouses = store.warehouses.filter(w => {
      const wid = String(w.id || '').toLowerCase();
      return wid !== lowerId && w.id !== cleanId;
    });

    saveServicesStore(store);

    // Sync deletion & soft-delete with Supabase from server
    try {
      const sbUrl = process.env.VITE_SUPABASE_URL || 'https://nsbmlujnxwfnuhnidmap.supabase.co';
      const sbKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYm1sdWpueHdmbnVobmlkbWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTE3NDQsImV4cCI6MjEwNzgyNzc0NH0.Q3ae0ec_UkxiOLJq8GTCRVDsqElwkKIek7zD3vhugqI';
      const sb = createClient(sbUrl, sbKey);
      await sb.from('storage_facilities').update({ is_real: false }).eq('id', cleanId);
      await sb.from('warehouse_facilities').update({ is_real: false }).eq('id', cleanId);
      await sb.from('storage_facilities').delete().eq('id', cleanId);
      await sb.from('warehouse_facilities').delete().eq('id', cleanId);
    } catch (e) {
      console.warn('[Warehouse Backend Delete Notice]:', e);
    }

    res.json({ success: true, message: 'Warehouse deleted successfully', deletedId: cleanId });
  });

  // ─── Equipment ──────────────────────────────────────────────────────────────
  router.get('/equipment', (_req: Request, res: Response) => {
    const store = loadServicesStore();
    const deletedSet = new Set((store.deletedServiceIds || []).map(id => String(id).toLowerCase()));
    const activeEquipment = store.equipment.filter(e => !deletedSet.has(String(e.id).toLowerCase()));
    res.json({
      success: true,
      count: activeEquipment.length,
      equipment: activeEquipment,
      deletedServiceIds: store.deletedServiceIds || []
    });
  });

  router.post('/equipment', (req: Request, res: Response) => {
    const item = req.body;
    if (!item.title || !item.district) {
      return res.status(400).json({ error: 'Equipment title and district are required' });
    }

    const store = loadServicesStore();
    const newEquipment = {
      ...item,
      id: item.id || `eq_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ownerId: item.ownerId || 'usr_anonymous',
      ownerName: item.ownerName || 'Verified Equipment Owner',
      title: item.title,
      category: item.category || 'Tractor',
      district: item.district,
      state: item.state || 'India',
      ratePerHour: item.ratePerHour ? Number(item.ratePerHour) : undefined,
      ratePerAcre: item.ratePerAcre ? Number(item.ratePerAcre) : undefined,
      operatorIncluded: item.operatorIncluded ?? true,
      isAvailableNow: item.isAvailableNow ?? true,
      contactPhone: item.contactPhone || '',
      modelYear: item.modelYear || String(new Date().getFullYear()),
      isReal: true,
      createdAt: new Date().toISOString()
    };

    store.equipment = [newEquipment, ...store.equipment];
    saveServicesStore(store);

    console.log(`[Services API] ✅ New equipment listed by ${newEquipment.ownerName}: ${newEquipment.title}`);
    res.status(201).json({ success: true, equipment: newEquipment });
  });

  router.put('/equipment/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const store = loadServicesStore();
    const idx = store.equipment.findIndex(e => e.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    store.equipment[idx] = { ...store.equipment[idx], ...updates, updatedAt: new Date().toISOString() };
    saveServicesStore(store);
    res.json({ success: true, equipment: store.equipment[idx] });
  });

  router.delete('/equipment/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = loadServicesStore();
    if (!store.deletedServiceIds) store.deletedServiceIds = [];
    const cleanId = String(id).trim();
    const lowerId = cleanId.toLowerCase();
    if (!store.deletedServiceIds.includes(cleanId)) {
      store.deletedServiceIds.push(cleanId);
    }
    if (!store.deletedServiceIds.includes(lowerId)) {
      store.deletedServiceIds.push(lowerId);
    }

    store.equipment = store.equipment.filter(e => {
      const eid = String(e.id || '').toLowerCase();
      return eid !== lowerId && e.id !== cleanId;
    });

    saveServicesStore(store);

    // Sync deletion & soft-delete with Supabase from server
    try {
      const sbUrl = process.env.VITE_SUPABASE_URL || 'https://nsbmlujnxwfnuhnidmap.supabase.co';
      const sbKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYm1sdWpueHdmbnVobmlkbWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTE3NDQsImV4cCI6MjEwNzgyNzc0NH0.Q3ae0ec_UkxiOLJq8GTCRVDsqElwkKIek7zD3vhugqI';
      const sb = createClient(sbUrl, sbKey);
      await sb.from('machinery_equipment').update({ is_real: false }).eq('id', cleanId);
      await sb.from('equipment_rentals').update({ is_real: false }).eq('id', cleanId);
      await sb.from('machinery_equipment').delete().eq('id', cleanId);
      await sb.from('equipment_rentals').delete().eq('id', cleanId);
    } catch (e) {
      console.warn('[Equipment Backend Delete Notice]:', e);
    }

    res.json({ success: true, message: 'Equipment deleted successfully', deletedId: cleanId });
  });

  // ─── Bookings ───────────────────────────────────────────────────────────────
  router.get('/bookings', (_req: Request, res: Response) => {
    const store = loadServicesStore();
    res.json({ success: true, bookings: store.bookings });
  });

  router.post('/bookings', (req: Request, res: Response) => {
    const booking = req.body;
    const store = loadServicesStore();
    const newBooking = {
      ...booking,
      id: booking.id || `bk_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: booking.status || 'pending',
      createdAt: booking.createdAt || new Date().toISOString()
    };
    store.bookings = [newBooking, ...store.bookings];
    saveServicesStore(store);

    // 1. Dispatch notification to Owner of the facility/machinery
    if (newBooking.ownerId) {
      addServerNotification({
        recipientUserId: newBooking.ownerId,
        senderUserId: newBooking.renterId,
        type: 'offer_received',
        title: `📦 New Service Offer: ${newBooking.serviceTitle}`,
        titleHi: `📦 नया स्पेस/मशीन ऑफर प्राप्त हुआ: ${newBooking.serviceTitle}`,
        message: `${newBooking.renterName || 'A farmer'} submitted a booking offer of ₹${Number(newBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} for ${newBooking.quantityRequested} ${newBooking.unit} of "${newBooking.serviceTitle}". Review and accept.`,
        messageHi: `${newBooking.renterName || 'किसान'} ने आपके "${newBooking.serviceTitle}" के लिए ₹${Number(newBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} (${newBooking.quantityRequested} ${newBooking.unit}) का ऑफर भेजा है। समीक्षा करें व स्वीकारें।`,
        commodity: newBooking.serviceTitle,
        price: Number(newBooking.totalEstimatedAmount || 0),
        quantity: Number(newBooking.quantityRequested || 1),
        unit: newBooking.unit || 'units',
        counterPartyName: newBooking.renterName || 'Farmer Client',
        offerId: newBooking.id,
        listingId: newBooking.serviceId,
        timestamp: 'Just now',
        linkTab: 'services'
      });
    }

    // 2. Dispatch submission confirmation to Renter
    if (newBooking.renterId) {
      addServerNotification({
        recipientUserId: newBooking.renterId,
        senderUserId: newBooking.ownerId,
        type: 'offer_received',
        title: `📤 Booking Request Sent: ${newBooking.serviceTitle}`,
        titleHi: `📤 बुकिंग अनुरोध भेजा गया: ${newBooking.serviceTitle}`,
        message: `Your booking request of ₹${Number(newBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} for ${newBooking.quantityRequested} ${newBooking.unit} was sent to ${newBooking.ownerName}.`,
        messageHi: `आपका ₹${Number(newBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} का बुकिंग अनुरोध (${newBooking.quantityRequested} ${newBooking.unit}) ${newBooking.ownerName} को भेज दिया गया है।`,
        commodity: newBooking.serviceTitle,
        price: Number(newBooking.totalEstimatedAmount || 0),
        quantity: Number(newBooking.quantityRequested || 1),
        unit: newBooking.unit || 'units',
        counterPartyName: newBooking.ownerName || 'Space Owner',
        offerId: newBooking.id,
        listingId: newBooking.serviceId,
        timestamp: 'Just now',
        linkTab: 'services'
      });
    }

    res.status(201).json({ success: true, booking: newBooking });
  });

  router.put('/bookings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const store = loadServicesStore();
    let idx = store.bookings.findIndex(b => b.id === id);

    // If booking not found in file store (e.g. came directly from Supabase), insert it from updates
    if (idx === -1) {
      if (updates.bookingData || updates.serviceTitle) {
        const fallbackBooking = {
          ...(updates.bookingData || updates),
          id,
          status: updates.status || 'confirmed',
          updatedAt: new Date().toISOString()
        };
        store.bookings.unshift(fallbackBooking);
        idx = 0;
      } else {
        // Create an entry with updates
        const fallbackBooking = {
          ...updates,
          id,
          status: updates.status || 'confirmed',
          updatedAt: new Date().toISOString()
        };
        store.bookings.unshift(fallbackBooking);
        idx = 0;
      }
    }

    const previousStatus = store.bookings[idx].status;
    const updatedBooking = { ...store.bookings[idx], ...updates, updatedAt: new Date().toISOString() };
    delete (updatedBooking as any).bookingData;
    store.bookings[idx] = updatedBooking;
    saveServicesStore(store);

    // When an offer is ACCEPTED / CONFIRMED:
    if (updatedBooking.status === 'confirmed' && previousStatus !== 'confirmed') {
      console.log(`[Services API] 🤝 Booking offer confirmed: ${id} by owner ${updatedBooking.ownerName}`);

      // 1. Notify Renter (The user who made the offer)
      if (updatedBooking.renterId) {
        addServerNotification({
          recipientUserId: updatedBooking.renterId,
          senderUserId: updatedBooking.ownerId,
          type: 'offer_accepted',
          title: `🎉 Offer Accepted! Deal Confirmed: ${updatedBooking.serviceTitle}`,
          titleHi: `🎉 ऑफर स्वीकार हुआ! सौदा पक्का: ${updatedBooking.serviceTitle}`,
          message: `${updatedBooking.ownerName || 'The owner'} accepted your booking offer of ₹${Number(updatedBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} for ${updatedBooking.quantityRequested} ${updatedBooking.unit} of "${updatedBooking.serviceTitle}". Deal confirmed!`,
          messageHi: `${updatedBooking.ownerName || 'मालिक'} ने आपके "${updatedBooking.serviceTitle}" के लिए ₹${Number(updatedBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} (${updatedBooking.quantityRequested} ${updatedBooking.unit}) का ऑफर स्वीकार कर लिया है। सौदा पक्का!`,
          commodity: updatedBooking.serviceTitle,
          price: Number(updatedBooking.totalEstimatedAmount || 0),
          quantity: Number(updatedBooking.quantityRequested || 1),
          unit: updatedBooking.unit || 'units',
          counterPartyName: updatedBooking.ownerName || 'Owner',
          offerId: updatedBooking.id,
          listingId: updatedBooking.serviceId,
          timestamp: 'Just now',
          linkTab: 'services'
        });
      }

      // 2. Notify Owner (Confirmation record)
      if (updatedBooking.ownerId) {
        addServerNotification({
          recipientUserId: updatedBooking.ownerId,
          senderUserId: updatedBooking.renterId,
          type: 'offer_accepted',
          title: `✅ You Accepted Offer: ${updatedBooking.serviceTitle}`,
          titleHi: `✅ आपने ऑफर स्वीकार किया: ${updatedBooking.serviceTitle}`,
          message: `You confirmed the booking of ${updatedBooking.quantityRequested} ${updatedBooking.unit} with ${updatedBooking.renterName} for ₹${Number(updatedBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')}.`,
          messageHi: `आपने ${updatedBooking.renterName} के साथ ₹${Number(updatedBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} पर ${updatedBooking.quantityRequested} ${updatedBooking.unit} का सौदा पक्का किया।`,
          commodity: updatedBooking.serviceTitle,
          price: Number(updatedBooking.totalEstimatedAmount || 0),
          quantity: Number(updatedBooking.quantityRequested || 1),
          unit: updatedBooking.unit || 'units',
          counterPartyName: updatedBooking.renterName || 'Farmer Client',
          offerId: updatedBooking.id,
          listingId: updatedBooking.serviceId,
          timestamp: 'Just now',
          linkTab: 'services'
        });
      }

      // 3. Automatically append a confirmed notification message into store.messages
      const confirmMsg = {
        id: `msg_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        bookingId: id,
        serviceId: updatedBooking.serviceId,
        serviceTitle: updatedBooking.serviceTitle,
        senderId: updatedBooking.ownerId,
        senderName: updatedBooking.ownerName,
        recipientId: updatedBooking.renterId,
        recipientName: updatedBooking.renterName,
        text: `✅ [BOOKING_ACCEPTED] Offer of ₹${Number(updatedBooking.totalEstimatedAmount || 0).toLocaleString('en-IN')} for ${updatedBooking.quantityRequested} ${updatedBooking.unit} has been accepted and confirmed by ${updatedBooking.ownerName}. Deal locked!`,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      store.messages = [confirmMsg, ...store.messages];
      saveServicesStore(store);
    }

    res.json({ success: true, booking: store.bookings[idx] });
  });

  // ─── Messages ───────────────────────────────────────────────────────────────
  router.get('/messages', (_req: Request, res: Response) => {
    const store = loadServicesStore();
    res.json({ success: true, messages: store.messages });
  });

  router.post('/messages', (req: Request, res: Response) => {
    const message = req.body;
    const store = loadServicesStore();
    const newMsg = {
      ...message,
      id: message.id || `msg_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: message.timestamp || new Date().toISOString(),
      isRead: false
    };
    store.messages = [newMsg, ...store.messages];
    saveServicesStore(store);
    res.status(201).json({ success: true, message: newMsg });
  });

  return router;
}
