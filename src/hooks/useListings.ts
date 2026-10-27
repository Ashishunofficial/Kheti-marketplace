/**
 * useListings — Live marketplace listings, offers, and orders from Kheti AI API
 * with Supabase backup, persistent storage, and strict Demo vs Live data separation.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, supabasePublic, isSupabaseConfigured } from '../lib/supabase';
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
  isSyncing: boolean;
  error: string | null;
  createListing: (listing: Omit<MarketplaceListing, 'id'>) => Promise<void>;
  updateListing: (id: string, data: Partial<MarketplaceListing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  makeOffer: (offer: Omit<OfferNegotiation, 'id'>) => Promise<void>;
  acceptOffer: (offerId: string, offerData?: OfferNegotiation) => Promise<void>;
  counterOffer: (offerId: string, price: number, message: string, senderName: string, senderId: string) => Promise<void>;
  refresh: () => void;
}

export function useListings(): UseListingsReturn {
  const { isAuthenticated, isDemo } = useAuth();
  const getInitialListings = (): MarketplaceListing[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LISTINGS);
      const local = saved ? JSON.parse(saved) : [];
      const combined = [...local];
      MOCK_LISTINGS.forEach(mockItem => {
        if (!combined.some(c => c.id === mockItem.id)) {
          combined.push(mockItem);
        }
      });
      return combined;
    } catch {
      return MOCK_LISTINGS;
    }
  };

  const getInitialOffers = (): OfferNegotiation[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFERS);
      const local = saved ? JSON.parse(saved) : [];
      if (Array.isArray(local) && local.length > 0) return local;
    } catch {}
    return MOCK_OFFERS;
  };

  const getInitialOrders = (): OrderRecord[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      const local = saved ? JSON.parse(saved) : [];
      if (Array.isArray(local) && local.length > 0) return local;
    } catch {}
    return MOCK_ORDERS;
  };

  const [listings, setListings] = useState<MarketplaceListing[]>(getInitialListings);
  const [offers, setOffers] = useState<OfferNegotiation[]>(getInitialOffers);
  const [orders, setOrders] = useState<OrderRecord[]>(getInitialOrders);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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

  const getLocalOffers = (): OfferNegotiation[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const getLocalOrders = (): OrderRecord[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function fetchAll() {
      setIsSyncing(true);
      setError(null);

      let serverListings: MarketplaceListing[] = [];
      let serverOffers: OfferNegotiation[] = [];
      let serverOrders: OrderRecord[] = [];

      // 1. Fetch directly from Supabase in parallel with Express server API using unauthenticated public client
      const supabasePromise = (async () => {
        if (!isSupabaseConfigured) return [];
        let rows: any[] = [];
        try {
          const { data: dbRows, error: err1 } = await supabasePublic
            .from('marketplace_listings')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          if (!err1 && dbRows && Array.isArray(dbRows)) {
            rows.push(...dbRows);
          }
        } catch (e) {
          console.warn('[Supabase marketplace_listings notice]:', e);
        }

        try {
          const { data: prodRows, error: err2 } = await supabasePublic
            .from('produce_listings')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          if (!err2 && prodRows && Array.isArray(prodRows)) {
            prodRows.forEach(r => {
              if (!rows.some(x => String(x.id) === String(r.id))) {
                rows.push(r);
              }
            });
          }
        } catch (e) {
          console.warn('[Supabase produce_listings notice]:', e);
        }

        return rows.map(mapDbToListing);
      })();

      const apiPromise = Promise.all([
        fetch('/api/marketplace/listings').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/marketplace/offers').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/marketplace/orders').then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      try {
        const [sbMapped, [lData, oData, ordData]] = await Promise.all([
          supabasePromise,
          apiPromise
        ]);

        if (Array.isArray(sbMapped)) {
          sbMapped.forEach(ml => {
            if (!serverListings.some(sl => sl.id === ml.id)) {
              serverListings.push(ml);
            }
          });
        }

        if (lData?.deletedListingIds && Array.isArray(lData.deletedListingIds)) {
          try {
            const current = JSON.parse(localStorage.getItem('kheti_deleted_listing_ids') || '[]');
            const merged = Array.from(new Set([...current, ...lData.deletedListingIds]));
            localStorage.setItem('kheti_deleted_listing_ids', JSON.stringify(merged));
          } catch {}
        }

        if (lData?.listings && Array.isArray(lData.listings)) {
          lData.listings.forEach((sl: MarketplaceListing) => {
            if (!serverListings.some(x => x.id === sl.id)) {
              serverListings.push(sl);
            }
          });
        }
        if (oData?.offers && Array.isArray(oData.offers)) {
          serverOffers = oData.offers;
        }
        if (ordData?.orders && Array.isArray(ordData.orders)) {
          serverOrders = ordData.orders;
        }
      } catch (e) {
        console.warn('Notice: Server API or Supabase fetch notice:', e);
      }

      // Filter out permanently deleted listing IDs so they never resurrect from Supabase or server cache
      let deletedListingIds = new Set<string>();
      try {
        const delArr = JSON.parse(localStorage.getItem('kheti_deleted_listing_ids') || '[]');
        if (Array.isArray(delArr)) {
          delArr.forEach((id: string) => {
            deletedListingIds.add(String(id).trim());
            deletedListingIds.add(String(id).trim().toLowerCase());
          });
        }
      } catch {}

      serverListings = serverListings.filter(sl => !deletedListingIds.has(sl.id) && !deletedListingIds.has(String(sl.id).toLowerCase()));

      // Merge local listings created in this browser
      const localListings = getLocalListings();
      localListings.forEach(ll => {
        if (!deletedListingIds.has(ll.id) && !deletedListingIds.has(String(ll.id).toLowerCase()) && !serverListings.some(sl => sl.id === ll.id)) {
          serverListings.unshift(ll);
        }
      });

      // Merge local offers created or updated in this browser
      const localOffers = getLocalOffers();
      localOffers.forEach(lo => {
        const existingIdx = serverOffers.findIndex(so => so.id === lo.id);
        if (existingIdx === -1) {
          serverOffers.unshift(lo);
        } else if (lo.status === 'accepted' && serverOffers[existingIdx].status !== 'accepted') {
          serverOffers[existingIdx] = lo;
        }
      });

      // Merge local orders created in this browser
      const localOrders = getLocalOrders();
      localOrders.forEach(lord => {
        if (!serverOrders.some(so => so.id === lord.id)) {
          serverOrders.unshift(lord);
        }
      });

      if (isCancelled) return;

      // PRE-LOGIN vs POST-LOGIN FILTERING
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
      setIsSyncing(false);
    }

    fetchAll();

    // Fast multi-device polling interval (2.0s) for instant cross-device updates
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 2000);

    // Supabase Realtime channel subscription for instant marketplace listings & offer sync
    let rtChannel: any = null;
    if (isSupabaseConfigured) {
      try {
        rtChannel = supabase
          .channel('kheti_marketplace_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_listings' }, () => {
            setTick(t => t + 1);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'produce_listings' }, () => {
            setTick(t => t + 1);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_offers' }, () => {
            setTick(t => t + 1);
          })
          .subscribe();
      } catch (err) {
        console.warn('Marketplace realtime channel error:', err);
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

    // 4. Multi-level resilient push to Supabase
    if (isSupabaseConfigured) {
      const dbRowFull: Record<string, any> = {
        id: listingId,
        seller_id: listing.sellerId || 'usr_anonymous',
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

      const dbRowCore: Record<string, any> = {
        id: listingId,
        seller_id: listing.sellerId || 'usr_anonymous',
        seller_name: listing.sellerName,
        seller_type: listing.sellerType,
        listing_type: listing.listingType,
        commodity: listing.commodity,
        variety: listing.variety ?? '',
        grade: listing.grade ?? 'Grade A',
        quantity: Number(listing.quantity),
        unit: listing.unit ?? 'Quintal',
        asking_price: Number(listing.askingPrice),
        min_order_quantity: Number(listing.minOrderQuantity || 10),
        status: 'active',
        posted_date: new Date().toISOString()
      };

      // Try full schema insert on marketplace_listings
      try {
        const { error: fullErr } = await supabase.from('marketplace_listings').insert([dbRowFull]);
        if (fullErr) {
          console.warn('[Supabase marketplace_listings full insert notice]:', fullErr.message);
          // Fallback to core fields
          const { error: coreErr } = await supabase.from('marketplace_listings').insert([dbRowCore]);
          if (coreErr) {
            console.warn('[Supabase marketplace_listings core insert notice]:', coreErr.message);
          }
        }
      } catch (e) {
        console.warn('marketplace_listings insert exception:', e);
      }

      // Try insert on produce_listings fallback table
      try {
        await supabase.from('produce_listings').insert([dbRowCore]);
      } catch (_) {}
    }
  }, []);

  const makeOffer = useCallback(async (offer: Omit<OfferNegotiation, 'id'>) => {
    const offerId = `ofr_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullOffer: OfferNegotiation = { ...offer, id: offerId, status: 'pending' };

    // 1. Immediately update local state
    setOffers(prev => [fullOffer, ...prev]);

    // 2. Cache in localStorage immediately so it survives reloads & polling
    try {
      const existing = getLocalOffers();
      localStorage.setItem(LOCAL_STORAGE_KEYS.OFFERS, JSON.stringify([fullOffer, ...existing.filter(o => o.id !== fullOffer.id)]));
    } catch {}

    // 3. Post to Express Server API
    try {
      await fetch('/api/marketplace/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOffer)
      });
    } catch {}
  }, []);

  const acceptOffer = useCallback(async (offerId: string, offerData?: OfferNegotiation) => {
    const targetOffer = offerData || offers.find(o => o.id === offerId);

    // 1. Immediately update local offer state to accepted
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o));

    // 2. Update localStorage offers
    try {
      const existing = getLocalOffers();
      const updated = existing.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o);
      if (!updated.some(o => o.id === offerId) && targetOffer) {
        updated.unshift({ ...targetOffer, status: 'accepted' });
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.OFFERS, JSON.stringify(updated));
    } catch {}

    // 3. Optimistic Order Creation so user sees confirmed order right away
    if (targetOffer) {
      const optimisticOrder: OrderRecord = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        listingId: targetOffer.listingId,
        offerId: targetOffer.id,
        buyerId: targetOffer.buyerId,
        buyerName: targetOffer.buyerName,
        sellerId: targetOffer.sellerId,
        sellerName: targetOffer.sellerName,
        commodity: targetOffer.commodity as any,
        quantity: targetOffer.quantity,
        unit: targetOffer.unit,
        agreedPrice: targetOffer.offeredPrice,
        totalAmount: targetOffer.offeredPrice * targetOffer.quantity,
        deliveryType: 'buyer_pickup',
        status: 'confirmed',
        paymentStatus: 'escrow_locked',
        pickupLocation: `${targetOffer.commodity} Depot / Farm Gateway`,
        createdAt: new Date().toISOString()
      };
      setOrders(prev => [optimisticOrder, ...prev.filter(x => x.id !== optimisticOrder.id)]);
      try {
        const existingOrders = getLocalOrders();
        localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify([optimisticOrder, ...existingOrders.filter(x => x.id !== optimisticOrder.id)]));
      } catch {}
    }

    // 4. Server API call
    try {
      const res = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          offerData: targetOffer
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders(prev => [data.order, ...prev.filter(ord => ord.id !== data.order.id)]);
          try {
            const existingOrders = getLocalOrders();
            localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify([data.order, ...existingOrders.filter(x => x.id !== data.order.id)]));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Error syncing accepted offer:', err);
    }
  }, [offers]);

  const counterOffer = useCallback(async (offerId: string, price: number, message: string, senderName: string, senderId: string) => {
    setOffers(prev => prev.map(o => {
      if (o.id !== offerId) return o;
      const newEntry = { senderId, senderName, price, quantity: o.quantity, timestamp: new Date().toLocaleString('en-IN'), message };
      return { ...o, offeredPrice: price, status: 'countered' as const, history: [...(o.history ?? []), newEntry] };
    }));

    try {
      const existing = getLocalOffers();
      const updated = existing.map(o => {
        if (o.id !== offerId) return o;
        const newEntry = { senderId, senderName, price, quantity: o.quantity, timestamp: new Date().toLocaleString('en-IN'), message };
        return { ...o, offeredPrice: price, status: 'countered' as const, history: [...(o.history ?? []), newEntry] };
      });
      localStorage.setItem(LOCAL_STORAGE_KEYS.OFFERS, JSON.stringify(updated));
    } catch {}

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
    const cleanId = String(listingId).trim();
    const lowerId = cleanId.toLowerCase();

    // 1. Immediately remove from React state
    setListings(prev => prev.filter(l => l.id !== cleanId && String(l.id).toLowerCase() !== lowerId));

    // 2. Add to deleted blacklist in localStorage so polling never resurrects it
    try {
      const delArr: string[] = JSON.parse(localStorage.getItem('kheti_deleted_listing_ids') || '[]');
      let updated = false;
      if (!delArr.includes(cleanId)) {
        delArr.push(cleanId);
        updated = true;
      }
      if (!delArr.includes(lowerId)) {
        delArr.push(lowerId);
        updated = true;
      }
      if (updated) {
        localStorage.setItem('kheti_deleted_listing_ids', JSON.stringify(delArr));
      }
    } catch {}

    // 3. Update local listings storage
    try {
      const existingLocal = getLocalListings();
      const updatedLocal = existingLocal.filter(l => l.id !== cleanId && String(l.id).toLowerCase() !== lowerId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.LISTINGS, JSON.stringify(updatedLocal));
    } catch (e) {}

    // 4. Server API deletion
    try {
      await fetch(`/api/marketplace/listings/${cleanId}`, { method: 'DELETE' });
    } catch {}

    // 5. Supabase delete & update status to cancelled
    if (isSupabaseConfigured) {
      try {
        await supabase.from('marketplace_listings').update({ status: 'cancelled' }).eq('id', cleanId);
        await supabase.from('marketplace_listings').delete().eq('id', cleanId);
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
    isSyncing,
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
