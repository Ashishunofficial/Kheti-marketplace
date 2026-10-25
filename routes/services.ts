import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

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
}

function loadServicesStore(): ServicesStoreData {
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const raw = fs.readFileSync(SERVICES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.warehouses) && Array.isArray(parsed.equipment)) {
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
    messages: []
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
    res.json({
      success: true,
      count: store.warehouses.length,
      warehouses: store.warehouses
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

  router.delete('/warehouses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const store = loadServicesStore();
    const prevCount = store.warehouses.length;
    store.warehouses = store.warehouses.filter(w => w.id !== id);

    if (store.warehouses.length === prevCount) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    saveServicesStore(store);
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  });

  // ─── Equipment ──────────────────────────────────────────────────────────────
  router.get('/equipment', (_req: Request, res: Response) => {
    const store = loadServicesStore();
    res.json({
      success: true,
      count: store.equipment.length,
      equipment: store.equipment
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

  router.delete('/equipment/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const store = loadServicesStore();
    const prevCount = store.equipment.length;
    store.equipment = store.equipment.filter(e => e.id !== id);

    if (store.equipment.length === prevCount) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    saveServicesStore(store);
    res.json({ success: true, message: 'Equipment deleted successfully' });
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
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    store.bookings = [newBooking, ...store.bookings];
    saveServicesStore(store);
    res.status(201).json({ success: true, booking: newBooking });
  });

  router.put('/bookings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const store = loadServicesStore();
    const idx = store.bookings.findIndex(b => b.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    store.bookings[idx] = { ...store.bookings[idx], ...updates, updatedAt: new Date().toISOString() };
    saveServicesStore(store);
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
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    store.messages = [newMsg, ...store.messages];
    saveServicesStore(store);
    res.status(201).json({ success: true, message: newMsg });
  });

  return router;
}
