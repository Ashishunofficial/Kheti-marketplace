/**
 * useListings — Live marketplace listings, offers, and orders from Supabase
 * with resilient schema mapping, UUID validation, and local persistence fallback.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MarketplaceListing, OfferNegotiation, OrderRecord } from '../types';
import { MOCK_LISTINGS, MOCK_OFFERS, MOCK_ORDERS } from '../data/mockData';

const LOCAL_STORAGE_KEYS = {
  LISTINGS: 'kheti_local_marketplace_listings_v2',
  OFFERS: 'kheti_local_offers_v2',
  ORDERS: 'kheti_local_orders_v2',
};

// UUID validation helper
function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

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

// Map PostgreSQL snake_case row -> TypeScript OfferNegotiation
function mapDbToOffer(row: any): OfferNegotiation {
  return {
    id: String(row.id),
    listingId: row.listing_id ?? row.listingId ?? '',
    commodity: row.commodity,
    buyerId: row.buyer_id ?? row.buyerId ?? '',
    buyerName: row.buyer_name ?? row.buyerName ?? '',
    sellerId: row.seller_id ?? row.sellerId ?? '',
    sellerName: row.seller_name ?? row.sellerName ?? '',
    originalPrice: Number(row.original_price ?? row.originalPrice ?? 0),
    offeredPrice: Number(row.offered_price ?? row.offeredPrice ?? 0),
    quantity: Number(row.quantity ?? 0),
    unit: row.unit ?? 'Quintal',
    status: row.status ?? 'pending',
    history: Array.isArray(row.history) ? row.history : (row.negotiation_history ?? []),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
  };
}

// Map PostgreSQL snake_case row -> TypeScript OrderRecord
function mapDbToOrder(row: any): OrderRecord {
  return {
    id: String(row.id),
    listingId: row.listing_id ?? row.listingId ?? '',
    offerId: row.offer_id ?? row.offerId ?? '',
    buyerName: row.buyer_name ?? row.buyerName ?? '',
    sellerName: row.seller_name ?? row.sellerName ?? '',
    commodity: row.commodity,
    quantity: Number(row.quantity ?? 0),
    unit: row.unit ?? 'Quintal',
    agreedPrice: Number(row.agreed_price ?? row.agreedPrice ?? 0),
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    deliveryType: row.delivery_type ?? row.deliveryType ?? 'buyer_pickup',
    pickupLocation: row.pickup_location ?? row.pickupLocation ?? '',
    status: row.status ?? 'confirmed',
    paymentStatus: row.payment_status ?? row.paymentStatus ?? 'escrow_locked',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

interface UseListingsReturn {
  listings: MarketplaceListing[];
  offers: OfferNegotiation[];
  orders: OrderRecord[];
  loading: boolean;
  error: string | null;
  createListing: (listing: Omit<MarketplaceListing, 'id'>) => Promise<void>;
  makeOffer: (offer: Omit<OfferNegotiation, 'id'>) => Promise<void>;
  acceptOffer: (offerId: string) => Promise<void>;
  counterOffer: (offerId: string, price: number, message: string, senderName: string, senderId: string) => Promise<void>;
  refresh: () => void;
}

export function useListings(): UseListingsReturn {
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
    const localListings = getLocalListings();

    if (!isSupabaseConfigured) {
      setListings([...localListings, ...MOCK_LISTINGS]);
      setOffers(MOCK_OFFERS);
      setOrders(MOCK_ORDERS);
      setLoading(false);
      return;
    }

    async function fetchAll() {
      setLoading(true);
      try {
        const [{ data: listData, error: lErr }, { data: offerData, error: oErr }, { data: orderData, error: ordErr }] =
          await Promise.all([
            supabase.from('marketplace_listings').select('*').eq('status', 'active').order('created_at', { ascending: false }),
            supabase.from('offer_negotiations').select('*').order('updated_at', { ascending: false }),
            supabase.from('order_records').select('*').order('created_at', { ascending: false }),
          ]);

        if (lErr) throw lErr;
        if (oErr) throw oErr;
        if (ordErr) throw ordErr;

        const mappedListings = ((listData as any[]) ?? []).map(mapDbToListing);
        const mappedOffers = ((offerData as any[]) ?? []).map(mapDbToOffer);
        const mappedOrders = ((orderData as any[]) ?? []).map(mapDbToOrder);

        // Merge remote listings with local listings (prevent duplicates)
        const combinedListings = [...localListings];
        mappedListings.forEach(ml => {
          if (!combinedListings.some(item => item.id === ml.id)) {
            combinedListings.push(ml);
          }
        });

        // If no listings in DB or cache, show realistic mock data
        setListings(combinedListings.length > 0 ? combinedListings : MOCK_LISTINGS);
        setOffers(mappedOffers.length > 0 ? mappedOffers : MOCK_OFFERS);
        setOrders(mappedOrders.length > 0 ? mappedOrders : MOCK_ORDERS);
      } catch (err: any) {
        console.warn('Supabase fetch failed or not configured, using cached & mock data:', err.message);
        setListings([...localListings, ...MOCK_LISTINGS]);
        setOffers(MOCK_OFFERS);
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();

    // Realtime subscription for updates
    const channel = supabase
      .channel('marketplace_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_listings' }, () => setTick(t => t + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offer_negotiations' }, () => setTick(t => t + 1))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tick]);

  // Create Listing with snake_case column mapping and graceful fallback
  const createListing = useCallback(async (listing: Omit<MarketplaceListing, 'id'>) => {
    const listingId = `lst_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullListing: MarketplaceListing = {
      ...listing,
      id: listingId,
      status: 'active',
      postedDate: new Date().toLocaleDateString('en-IN'),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
    };

    // 1. Immediately store in local state & localStorage so the UI updates with zero delay
    setListings(prev => [fullListing, ...prev]);
    try {
      const existingLocal = getLocalListings();
      localStorage.setItem(LOCAL_STORAGE_KEYS.LISTINGS, JSON.stringify([fullListing, ...existingLocal]));
    } catch (e) {
      console.error('Error caching listing in localStorage', e);
    }

    // 2. If Supabase is configured, push the snake_case row to the database
    if (isSupabaseConfigured) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const activeUserId = sessionData?.session?.user?.id;
        const validSellerUuid = activeUserId || (isValidUuid(listing.sellerId) ? listing.sellerId : null);

        // Convert TypeScript camelCase -> PostgreSQL snake_case
        const dbRow: Record<string, any> = {
          id: listingId,
          seller_name: listing.sellerName,
          seller_type: listing.sellerType,
          is_verified: listing.isVerified ?? false,
          listing_type: listing.listingType,
          commodity: listing.commodity,
          variety: listing.variety ?? '',
          grade: listing.grade ?? 'FAQ',
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
          expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        };

        if (validSellerUuid) {
          dbRow.seller_id = validSellerUuid;
        }

        const { error: insertErr } = await supabase.from('marketplace_listings').insert([dbRow]);
        if (insertErr) {
          console.warn('Notice: Remote database insert warning (stored locally):', insertErr.message);
        }
      } catch (err: any) {
        console.warn('Remote database sync skipped (listing safely active in local session):', err.message);
      }
    }
  }, []);

  const makeOffer = useCallback(async (offer: Omit<OfferNegotiation, 'id'>) => {
    const offerId = `ofr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullOffer: OfferNegotiation = { ...offer, id: offerId, status: 'pending' };

    setOffers(prev => [fullOffer, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const activeUserId = sessionData?.session?.user?.id;
        const buyerUuid = activeUserId || (isValidUuid(offer.buyerId) ? offer.buyerId : null);
        const sellerUuid = isValidUuid(offer.sellerId) ? offer.sellerId : null;

        const dbRow: Record<string, any> = {
          id: offerId,
          listing_id: offer.listingId,
          commodity: offer.commodity,
          buyer_name: offer.buyerName,
          seller_name: offer.sellerName,
          original_price: Number(offer.originalPrice),
          offered_price: Number(offer.offeredPrice),
          quantity: Number(offer.quantity),
          unit: offer.unit,
          history: offer.history ?? [],
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (buyerUuid) dbRow.buyer_id = buyerUuid;
        if (sellerUuid) dbRow.seller_id = sellerUuid;

        const { error } = await supabase.from('offer_negotiations').insert([dbRow]);
        if (error) console.warn('Offer remote insert warning:', error.message);
      } catch (err: any) {
        console.warn('Offer sync skipped:', err.message);
      }
    }
  }, []);

  const acceptOffer = useCallback(async (offerId: string) => {
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('offer_negotiations').update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        }).eq('id', offerId);
      } catch (err: any) {
        console.warn('Accept offer sync skipped:', err.message);
      }
    }
  }, []);

  const counterOffer = useCallback(async (offerId: string, price: number, message: string, senderName: string, senderId: string) => {
    setOffers(prev => prev.map(o => {
      if (o.id !== offerId) return o;
      const newEntry = { senderId, senderName, price, quantity: o.quantity, timestamp: new Date().toLocaleString('en-IN'), message };
      return { ...o, offeredPrice: price, status: 'countered' as const, history: [...(o.history ?? []), newEntry] };
    }));

    if (isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase.from('offer_negotiations').select('history,quantity').eq('id', offerId).single();
        const history = existing?.history ?? [];
        const newEntry = { senderId, senderName, price, quantity: existing?.quantity, timestamp: new Date().toISOString(), message };
        await supabase.from('offer_negotiations').update({
          offered_price: price,
          status: 'countered',
          history: [...history, newEntry],
          updated_at: new Date().toISOString(),
        }).eq('id', offerId);
      } catch (err: any) {
        console.warn('Counter offer sync skipped:', err.message);
      }
    }
  }, []);

  return {
    listings,
    offers,
    orders,
    loading,
    error,
    createListing,
    makeOffer,
    acceptOffer,
    counterOffer,
    refresh: () => setTick(t => t + 1),
  };
}
