import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { addServerNotification } from './notifications';

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

  // POST /api/marketplace/offers — Submit an offer from a buyer
  router.post('/offers', (req: Request, res: Response) => {
    const offer = req.body;
    const store = loadMarketplaceStore();
    const newOffer = {
      ...offer,
      id: offer.id || `ofr_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: offer.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.offers = [newOffer, ...store.offers];
    saveMarketplaceStore(store);

    // 1. Dispatch Notification to SELLER (so seller gets real-time bell update)
    if (newOffer.sellerId) {
      addServerNotification({
        recipientUserId: newOffer.sellerId,
        senderUserId: newOffer.buyerId,
        type: 'offer_received',
        title: `🌾 New Produce Offer: ${newOffer.commodity}`,
        titleHi: `🌾 नया खरीद ऑफर प्राप्त हुआ: ${newOffer.commodity}`,
        message: `${newOffer.buyerName || 'Buyer'} offered ₹${newOffer.offeredPrice}/${newOffer.unit} for ${newOffer.quantity} ${newOffer.unit} of ${newOffer.commodity}. Total value: ₹${(newOffer.offeredPrice * newOffer.quantity).toLocaleString('en-IN')}.`,
        messageHi: `${newOffer.buyerName || 'खरीदार'} ने आपके ${newOffer.commodity} के लिए ₹${newOffer.offeredPrice}/${newOffer.unit} पर ${newOffer.quantity} ${newOffer.unit} का ऑफर दिया है। कुल सौदा: ₹${(newOffer.offeredPrice * newOffer.quantity).toLocaleString('en-IN')}।`,
        commodity: newOffer.commodity,
        price: newOffer.offeredPrice,
        quantity: newOffer.quantity,
        unit: newOffer.unit,
        counterPartyName: newOffer.buyerName,
        offerId: newOffer.id,
        listingId: newOffer.listingId,
        timestamp: 'Just now',
        linkTab: 'marketplace'
      });
    }

    // 2. Dispatch Confirmation Notification to BUYER
    if (newOffer.buyerId) {
      addServerNotification({
        recipientUserId: newOffer.buyerId,
        senderUserId: newOffer.sellerId,
        type: 'offer_received',
        title: `📤 Offer Submitted: ${newOffer.commodity}`,
        titleHi: `📤 ऑफर भेजा गया: ${newOffer.commodity}`,
        message: `Your offer of ₹${newOffer.offeredPrice}/${newOffer.unit} (${newOffer.quantity} ${newOffer.unit}) was sent to ${newOffer.sellerName}. Total: ₹${(newOffer.offeredPrice * newOffer.quantity).toLocaleString('en-IN')}.`,
        messageHi: `आपका ₹${newOffer.offeredPrice}/${newOffer.unit} का ऑफर (${newOffer.quantity} ${newOffer.unit}) ${newOffer.sellerName} को भेज दिया गया है। कुल मूल्य: ₹${(newOffer.offeredPrice * newOffer.quantity).toLocaleString('en-IN')}।`,
        commodity: newOffer.commodity,
        price: newOffer.offeredPrice,
        quantity: newOffer.quantity,
        unit: newOffer.unit,
        counterPartyName: newOffer.sellerName,
        offerId: newOffer.id,
        listingId: newOffer.listingId,
        timestamp: 'Just now',
        linkTab: 'marketplace'
      });
    }

    console.log(`[Marketplace API] 📨 Offer created: ${newOffer.id} on listing ${newOffer.listingId} by ${newOffer.buyerName}`);
    res.status(201).json({ success: true, offer: newOffer });
  });

  // PUT /api/marketplace/offers/:id — Accept, counter, or update an offer
  router.put('/offers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const store = loadMarketplaceStore();
    let idx = store.offers.findIndex(o => o.id === id);

    // If offer not in file store (e.g. created earlier or client-persisted), upsert from client body
    if (idx === -1) {
      if (updates.offerData) {
        const fallbackOffer = {
          ...updates.offerData,
          id,
          status: updates.status || 'accepted',
          updatedAt: new Date().toISOString()
        };
        store.offers.unshift(fallbackOffer);
        idx = 0;
      } else {
        return res.status(404).json({ error: 'Offer not found' });
      }
    }

    const previousStatus = store.offers[idx].status;
    const updatedOffer = { ...store.offers[idx], ...updates, updatedAt: new Date().toISOString() };
    delete updatedOffer.offerData; // clean up payload helper
    store.offers[idx] = updatedOffer;

    let createdOrder = null;

    // IF OFFER IS BEING ACCEPTED:
    if (updatedOffer.status === 'accepted' && previousStatus !== 'accepted') {
      // 1. Create Confirmed Order in store.orders
      const existingOrder = store.orders.find(ord => ord.offerId === updatedOffer.id);
      if (!existingOrder) {
        createdOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          listingId: updatedOffer.listingId,
          offerId: updatedOffer.id,
          buyerId: updatedOffer.buyerId,
          buyerName: updatedOffer.buyerName || 'Buyer',
          sellerId: updatedOffer.sellerId,
          sellerName: updatedOffer.sellerName || 'Seller',
          commodity: updatedOffer.commodity,
          quantity: updatedOffer.quantity,
          unit: updatedOffer.unit,
          agreedPrice: updatedOffer.offeredPrice,
          totalAmount: updatedOffer.offeredPrice * updatedOffer.quantity,
          escrowStatus: 'locked',
          deliveryStatus: 'in_progress',
          paymentStatus: 'escrow_funded',
          pickupLocation: `${updatedOffer.commodity} Depot / Farm Gateway`,
          createdAt: new Date().toISOString()
        };
        store.orders = [createdOrder, ...store.orders];
      }

      // 2. Update Listing occupied quantity
      const listingIdx = store.listings.findIndex(l => l.id === updatedOffer.listingId);
      if (listingIdx !== -1) {
        const curOcc = Number(store.listings[listingIdx].occupiedQuantity || 0);
        store.listings[listingIdx].occupiedQuantity = curOcc + Number(updatedOffer.quantity);
      }

      // 3. Dispatch Notification to BUYER (so Buyer's ID gets the acceptance notification!)
      if (updatedOffer.buyerId) {
        addServerNotification({
          recipientUserId: updatedOffer.buyerId,
          senderUserId: updatedOffer.sellerId,
          type: 'offer_accepted',
          title: `🎉 Offer Accepted! Deal Confirmed: ${updatedOffer.commodity}`,
          titleHi: `🎉 आपका ऑफर स्वीकार कर लिया गया! सौदा पक्का: ${updatedOffer.commodity}`,
          message: `${updatedOffer.sellerName || 'Seller'} accepted your offer for ${updatedOffer.quantity} ${updatedOffer.unit} of ${updatedOffer.commodity} at ₹${updatedOffer.offeredPrice}/${updatedOffer.unit}. Total ₹${(updatedOffer.offeredPrice * updatedOffer.quantity).toLocaleString('en-IN')}. Escrow is locked!`,
          messageHi: `${updatedOffer.sellerName || 'विक्रेता'} ने आपके ${updatedOffer.quantity} ${updatedOffer.unit} ${updatedOffer.commodity} का ₹${updatedOffer.offeredPrice}/${updatedOffer.unit} पर ऑफर स्वीकार कर लिया। कुल ₹${(updatedOffer.offeredPrice * updatedOffer.quantity).toLocaleString('en-IN')}। एस्क्रो भुगतान सुरक्षित है!`,
          commodity: updatedOffer.commodity,
          price: updatedOffer.offeredPrice,
          quantity: updatedOffer.quantity,
          unit: updatedOffer.unit,
          counterPartyName: updatedOffer.sellerName,
          offerId: updatedOffer.id,
          listingId: updatedOffer.listingId,
          timestamp: 'Just now',
          linkTab: 'marketplace'
        });
      }

      // 4. Dispatch Notification to SELLER as well
      if (updatedOffer.sellerId) {
        addServerNotification({
          recipientUserId: updatedOffer.sellerId,
          senderUserId: updatedOffer.buyerId,
          type: 'offer_accepted',
          title: `🤝 Deal Confirmed & Escrow Locked: ${updatedOffer.commodity}`,
          titleHi: `🤝 ऑफर स्वीकार हुआ! सौदा पक्का: ${updatedOffer.commodity}`,
          message: `Deal agreed with ${updatedOffer.buyerName} for ${updatedOffer.quantity} ${updatedOffer.unit} of ${updatedOffer.commodity} at ₹${updatedOffer.offeredPrice}/${updatedOffer.unit}. Total value ₹${(updatedOffer.offeredPrice * updatedOffer.quantity).toLocaleString('en-IN')}. Order generated.`,
          messageHi: `${updatedOffer.buyerName} के साथ ${updatedOffer.quantity} ${updatedOffer.unit} ${updatedOffer.commodity} का सौदा ₹${updatedOffer.offeredPrice}/${updatedOffer.unit} पर पक्का हुआ। कुल मूल्य ₹${(updatedOffer.offeredPrice * updatedOffer.quantity).toLocaleString('en-IN')}। एस्क्रो सुरक्षित।`,
          commodity: updatedOffer.commodity,
          price: updatedOffer.offeredPrice,
          quantity: updatedOffer.quantity,
          unit: updatedOffer.unit,
          counterPartyName: updatedOffer.buyerName,
          offerId: updatedOffer.id,
          listingId: updatedOffer.listingId,
          timestamp: 'Just now',
          linkTab: 'marketplace'
        });
      }

      console.log(`[Marketplace API] 🤝 Offer accepted: ${updatedOffer.id}. Bilateral notifications dispatched to Buyer ${updatedOffer.buyerId} and Seller ${updatedOffer.sellerId}`);
    }

    saveMarketplaceStore(store);
    res.json({ success: true, offer: updatedOffer, order: createdOrder });
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
