import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// ─── File-Based Shared Persistence ──────────────────────────────────────────
const DATA_DIR = path.resolve(process.cwd(), 'data');
const MARKETPLACE_FILE = path.join(DATA_DIR, 'marketplace_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

// Initial Real Community Listings created by registered real users (populated dynamically from Supabase / live posts)
const INITIAL_REAL_LISTINGS: any[] = [];


interface MarketplaceStoreData {
  listings: any[];
  offers: any[];
  orders: any[];
}

function loadMarketplaceStore(): MarketplaceStoreData {
  try {
    if (fs.existsSync(MARKETPLACE_FILE)) {
      const raw = fs.readFileSync(MARKETPLACE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.listings)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading marketplace store file:', err);
  }

  // Initialize with real listings
  const initialData: MarketplaceStoreData = {
    listings: INITIAL_REAL_LISTINGS,
    offers: [],
    orders: []
  };
  saveMarketplaceStore(initialData);
  return initialData;
}

function saveMarketplaceStore(data: MarketplaceStoreData) {
  try {
    fs.writeFileSync(MARKETPLACE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving marketplace store file:', err);
  }
}

export function createMarketplaceRouter() {
  const router = express.Router();

  // GET /api/marketplace/listings
  router.get('/listings', (_req: Request, res: Response) => {
    const store = loadMarketplaceStore();
    // Return all real active listings
    const activeListings = store.listings.filter(l => l.status === 'active' || !l.status);
    res.json({
      success: true,
      count: activeListings.length,
      listings: activeListings
    });
  });

  // POST /api/marketplace/listings — Create a new listing from any user
  router.post('/listings', (req: Request, res: Response) => {
    const item = req.body;
    if (!item.commodity || !item.askingPrice) {
      return res.status(400).json({ error: 'Commodity and asking price are required' });
    }

    const store = loadMarketplaceStore();
    const newListing = {
      ...item,
      id: item.id || `lst_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sellerId: item.sellerId || 'usr_anonymous',
      sellerName: item.sellerName || 'Verified Kisan',
      sellerType: item.sellerType || 'farmer',
      isVerified: item.isVerified ?? true,
      listingType: item.listingType || 'sell',
      commodity: item.commodity,
      variety: item.variety || '',
      grade: item.grade || 'Grade A',
      quantity: Number(item.quantity || 10),
      unit: item.unit || 'Quintal',
      askingPrice: Number(item.askingPrice),
      minOrderQuantity: Number(item.minOrderQuantity || 10),
      location: item.location || { district: 'Local APMC', state: 'India' },
      pickupAvailable: item.pickupAvailable ?? true,
      deliveryAvailable: item.deliveryAvailable ?? false,
      postedDate: item.postedDate || new Date().toLocaleDateString('en-IN'),
      expiryDate: item.expiryDate || new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      moistureContentPercent: item.moistureContentPercent ? Number(item.moistureContentPercent) : undefined,
      notes: item.notes || '',
      status: 'active',
      isReal: true,
      createdAt: new Date().toISOString()
    };

    // Add to top of listings
    store.listings = [newListing, ...store.listings];
    saveMarketplaceStore(store);

    console.log(`[Marketplace API] ✅ New listing created by ${newListing.sellerName} (${newListing.sellerId}): ${newListing.commodity}`);
    res.status(201).json({ success: true, listing: newListing });
  });

  // PUT /api/marketplace/listings/:id
  router.put('/listings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const store = loadMarketplaceStore();
    const idx = store.listings.findIndex(l => l.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    store.listings[idx] = { ...store.listings[idx], ...updates, updatedAt: new Date().toISOString() };
    saveMarketplaceStore(store);
    res.json({ success: true, listing: store.listings[idx] });
  });

  // DELETE /api/marketplace/listings/:id
  router.delete('/listings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const store = loadMarketplaceStore();
    const prevCount = store.listings.length;
    store.listings = store.listings.filter(l => l.id !== id);

    if (store.listings.length === prevCount) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    saveMarketplaceStore(store);
    res.json({ success: true, message: 'Listing deleted successfully' });
  });

  // GET /api/marketplace/offers
  router.get('/offers', (_req: Request, res: Response) => {
    const store = loadMarketplaceStore();
    res.json({ success: true, offers: store.offers });
  });

  // POST /api/marketplace/offers
  router.post('/offers', (req: Request, res: Response) => {
    const offer = req.body;
    const store = loadMarketplaceStore();
    const newOffer = {
      ...offer,
      id: offer.id || `ofr_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.offers = [newOffer, ...store.offers];
    saveMarketplaceStore(store);
    res.status(201).json({ success: true, offer: newOffer });
  });

  // PUT /api/marketplace/offers/:id
  router.put('/offers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const store = loadMarketplaceStore();
    const idx = store.offers.findIndex(o => o.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    store.offers[idx] = { ...store.offers[idx], ...updates, updatedAt: new Date().toISOString() };
    saveMarketplaceStore(store);
    res.json({ success: true, offer: store.offers[idx] });
  });

  // GET /api/marketplace/orders
  router.get('/orders', (_req: Request, res: Response) => {
    const store = loadMarketplaceStore();
    res.json({ success: true, orders: store.orders });
  });

  // POST /api/marketplace/orders
  router.post('/orders', (req: Request, res: Response) => {
    const order = req.body;
    const store = loadMarketplaceStore();
    const newOrder = {
      ...order,
      id: order.id || `ord_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    store.orders = [newOrder, ...store.orders];
    saveMarketplaceStore(store);
    res.status(201).json({ success: true, order: newOrder });
  });

  return router;
}
