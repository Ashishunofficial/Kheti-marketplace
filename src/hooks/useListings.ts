/**
 * useListings — Live marketplace listings, offers, and orders from Kheti AI API
 * with Supabase backup, persistent storage, and strict Demo vs Live data separation.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { MarketplaceListing, OfferNegotiation, OrderRecord } from '../types';
import { MOCK_LISTINGS, MOCK_OFFERS, MOCK_ORDERS } from '../data/mockData';

const LOCAL_STORAGE_KEYS = {
  LISTINGS: 'kheti_local_marketplace_listings_v3',
  OFFERS: 'kheti_local_offers_v3',
  ORDERS: 'kheti_local_orders_v3',
};

const MOCK_LISTING_IDS = new Set(['lst_101', 'lst_102', 'lst_103', 'lst_104', 'lst_105']);
const MOCK_OFFER_IDS = new Set(['ofr_801', 'ofr_802']);
const MOCK_ORDER_IDS = new Set(['ord_kht_9021']);

// Map PostgreSQL snake_case row -> TypeScript MarketplaceListing
function mapDbToListing(row: any): MarketplaceListing {
  return {
    id: String(row.id),
    sellerId: row.seller_id ?? row.sellerId ?? '',
    sellerName: row.seller_name ?? row.sellerName ?? 'Farmer',
    sellerType: row.seller_type ?? row.sellerType ?? 'farmer',
    isVerified: Boolean(row.is_verified ?? row.isVerified ?? false),
    listingType: row.listing_type ?? row.listingType ?? 'sell',
    commodity: row.commodity,
    variety: row.variety ?? '',
    grade: row.grade ?? 'FAQ',
    quantity: Number(row.quantity ?? 0),
    unit: row.unit ?? 'Quintal',
    askingPrice: Number(row.asking_price ?? row.askingPrice ?? 0),
    minOrderQuantity: Number(row.min_order_quantity ?? row.minOrderQuantity ?? 10),
    location: {
      village: row.location_village ?? row.location?.village ?? '',
      district: row.location_district ?? row.location?.district ?? '',
      state: row.location_state ?? row.location?.state ?? '',
      distanceKm: row.distance_km ?? row.location?.distanceKm ?? 0,
    },
    pickupAvailable: Boolean(row.pickup_available ?? row.pickupAvailable ?? true),
    deliveryAvailable: Boolean(row.delivery_available ?? row.deliveryAvailable ?? false),
    postedDate: row.posted_date ? new Date(row.posted_date).toLocaleDateString('en-IN') : (row.postedDate ?? new Date().toLocaleDateString('en-IN')),
    expiryDate: row.expiry_date ? new Date(row.expiry_date).toLocaleDateString('en-IN') : (row.expiryDate ?? ''),
    moistureContentPercent: row.moisture_content_percent ? Number(row.moisture_content_percent) : row.moistureContentPercent,
    notes: row.notes,
    status: row.status ?? 'active',
  };
}

interface UseListingsReturn {
  listings: MarketplaceListing[];
  offers: OfferNegotiation[];
  orders: OrderRecord[];
  loading: boolean;
  error: string | null;
  createListing: (listing: Omit<MarketplaceListing, 'id'>) => Promise<void>;
  updateListing: (id: string, data: Partial<MarketplaceListing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  makeOffer: (offer: Omit<OfferNegotiation, 'id'>) => Promise<void>;
  acceptOffer: (offerId: string) => Promise<void>;
  counterOffer: (offerId: string, price: number, message: string, senderName: string, senderId: string) => Promise<void>;
  refresh: () => void;
}

export function useListings(): UseListingsReturn {
  const { isAuthenticated, isDemo } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [offers, setOffers] = useState<OfferNegotiation[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Helper to read local cache
  const getLocalListings = (): MarketplaceListing[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LISTINGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      let serverListings: MarketplaceListing[] = [];
      let serverOffers: OfferNegotiation[] = [];
      let serverOrders: OrderRecord[] = [];

      // 1. Fetch from Express persistent shared server API
      try {
        const [lRes, oRes, ordRes] = await Promise.all([
          fetch('/api/marketplace/listings'),
          fetch('/api/marketplace/offers'),
          fetch('/api/marketplace/orders')
        ]);

        if (lRes.ok) {
          const lData = await lRes.json();
          if (lData.listings && Array.isArray(lData.listings)) {
            serverListings = lData.listings;
          }
        }
        if (oRes.ok) {
          const oData = await oRes.json();
          if (oData.offers && Array.isArray(oData.offers)) {
            serverOffers = oData.offers;
          }
        }
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (ordData.orders && Array.isArray(ordData.orders)) {
            serverOrders = ordData.orders;
          }
        }
      } catch (e) {
        console.warn('Notice: Server API fetch error, falling back to local store:', e);
      }

      // 2. Fetch from Supabase as secondary sync if configured
      if (isSupabaseConfigured) {
        try {
          const { data: dbRows } = await supabase
            .from('marketplace_listings')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          if (dbRows && Array.isArray(dbRows)) {
            const mappedDb = dbRows.map(mapDbToListing);
            mappedDb.forEach(ml => {
              if (!serverListings.some(sl => sl.id === ml.id)) {
                serverListings.push(ml);
              }
            });
          }
        } catch (e) {
          // Supabase sync silent catch
        }
      }

      // Merge local listings created in this browser
      const localListings = getLocalListings();
      localListings.forEach(ll => {
        if (!serverListings.some(sl => sl.id === ll.id)) {
          serverListings.unshift(ll);
        }
      });

      if (isCancelled) return;

      // 3. PRE-LOGIN vs POST-LOGIN FILTERING
      if (isDemo || !isAuthenticated) {
        // Pre-login: Show mock demo listings to showcase features to guests
        const combined = [...serverListings];
        MOCK_LISTINGS.forEach(mockItem => {
          if (!combined.some(c => c.id === mockItem.id)) {
            combined.push(mockItem);
          }
        });
        setListings(combined);
        setOffers(serverOffers.length > 0 ? serverOffers : MOCK_OFFERS);
        setOrders(serverOrders.length > 0 ? serverOrders : MOCK_ORDERS);
      } else {
        // Post-login: STRICTLY NO DEMO DATA. Return only real community listings!
        const realOnlyListings = serverListings.filter(l => {
          return !MOCK_LISTING_IDS.has(l.id) && 
                 l.sellerId !== 'usr_rameshwar_99' &&
                 !l.id.startsWith('lst_10');
        });

        const realOnlyOffers = serverOffers.filter(o => {
          return !MOCK_OFFER_IDS.has(o.id) && !o.id.startsWith('ofr_8');
        });

        const realOnlyOrders = serverOrders.filter(ord => {
          return !MOCK_ORDER_IDS.has(ord.id) && !ord.id.startsWith('ord_kht_');
        });

        setListings(realOnlyListings);
        setOffers(realOnlyOffers);
        setOrders(realOnlyOrders);
      }

      setLoading(false);
    }

    fetchAll();

    // Poll periodically to get new listings made by any other user
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 15000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [tick, isAuthenticated, isDemo]);

  // Create Listing with server persistence so it is immediately visible to everyone
  const createListing = useCallback(async (listing: Omit<MarketplaceListing, 'id'>) => {
    const listingId = `lst_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullListing: MarketplaceListing = {
      ...listing,
      id: listingId,
      status: 'active',
      postedDate: new Date().toLocaleDateString('en-IN'),
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
    };

    // 1. Immediately update UI state
    setListings(prev => [fullListing, ...prev]);

    // 2. Cache in localStorage
    try {
      const existingLocal = getLocalListings();
      localStorage.setItem(LOCAL_STORAGE_KEYS.LISTINGS, JSON.stringify([fullListing, ...existingLocal]));
    } catch (e) {
      console.warn('Error caching listing in localStorage:', e);
    }

    // 3. Post to Express Server API so it's globally shared across all users and browsers
    try {
      await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullListing)
      });
    } catch (e) {
      console.warn('Server API listing sync notice:', e);
    }

    // 4. Secondary push to Supabase if available
    if (isSupabaseConfigured) {
      try {
        const dbRow: Record<string, any> = {
          id: listingId,
          seller_name: listing.sellerName,
          seller_type: listing.sellerType,
          is_verified: listing.isVerified ?? true,
          listing_type: listing.listingType,
          commodity: listing.commodity,
          variety: listing.variety ?? '',
          grade: listing.grade ?? 'Grade A',
          quantity: Number(listing.quantity),
          unit: listing.unit ?? 'Quintal',
          asking_price: Number(listing.askingPrice),
          min_order_quantity: Number(listing.minOrderQuantity || 10),
          moisture_content_percent: listing.moistureContentPercent ? Number(listing.moistureContentPercent) : null,
          location_village: listing.location?.village || '',
          location_district: listing.location?.district || '',
          location_state: listing.location?.state || '',
          pickup_available: listing.pickupAvailable ?? true,
          delivery_available: listing.deliveryAvailable ?? false,
          notes: listing.notes || '',
          status: 'active',
          posted_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        };
        await supabase.from('marketplace_listings').insert([dbRow]);
      } catch (err: any) {
        // Silent catch for external DB
      }
    }
  }, []);

  const makeOffer = useCallback(async (offer: Omit<OfferNegotiation, 'id'>) => {
    const offerId = `ofr_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullOffer: OfferNegotiation = { ...offer, id: offerId, status: 'pending' };

    setOffers(prev => [fullOffer, ...prev]);

    try {
      await fetch('/api/marketplace/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOffer)
      });
    } catch {}
  }, []);

  const acceptOffer = useCallback(async (offerId: string) => {
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o));

    try {
      await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
      });
    } catch {}
  }, []);

  const counterOffer = useCallback(async (offerId: string, price: number, message: string, senderName: string, senderId: string) => {
    setOffers(prev => prev.map(o => {
      if (o.id !== offerId) return o;
      const newEntry = { senderId, senderName, price, quantity: o.quantity, timestamp: new Date().toLocaleString('en-IN'), message };
      return { ...o, offeredPrice: price, status: 'countered' as const, history: [...(o.history ?? []), newEntry] };
    }));

    try {
      await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offered_price: price,
          status: 'countered'
        })
      });
    } catch {}
  }, []);

  const deleteListing = useCallback(async (listingId: string) => {
    setListings(prev => prev.filter(l => l.id !== listingId));
    try {
      const existingLocal = getLocalListings();
      const updatedLocal = existingLocal.filter(l => l.id !== listingId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.LISTINGS, JSON.stringify(updatedLocal));
    } catch (e) {}

    try {
      await fetch(`/api/marketplace/listings/${listingId}`, { method: 'DELETE' });
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('marketplace_listings').delete().eq('id', listingId);
      } catch {}
    }
  }, []);

  const updateListing = useCallback(async (listingId: string, updatedData: Partial<MarketplaceListing>) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, ...updatedData } : l));
    try {
      const existingLocal = getLocalListings();
      const updatedLocal = existingLocal.map(l => l.id === listingId ? { ...l, ...updatedData } : l);
      localStorage.setItem(LOCAL_STORAGE_KEYS.LISTINGS, JSON.stringify(updatedLocal));
    } catch (e) {}

    try {
      await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch {}
  }, []);

  return {
    listings,
    offers,
    orders,
    loading,
    error,
    createListing,
    updateListing,
    deleteListing,
    makeOffer,
    acceptOffer,
    counterOffer,
    refresh: () => setTick(t => t + 1),
  };
}
