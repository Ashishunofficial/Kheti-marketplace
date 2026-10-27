import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  ArrowRight, 
  MessageSquare, 
  Boxes,
  MapPin,
  Sparkles,
  Trash2,
  Edit3
} from 'lucide-react';
import { MarketplaceListing, OfferNegotiation, UserProfile } from '../../types';

interface MarketplaceDashboardProps {
  currentUser: UserProfile;
  currentUserId?: string;
  isDemoMode?: boolean;
  listings: MarketplaceListing[];
  offers: OfferNegotiation[];
  onOpenNewListingModal: () => void;
  onAcceptOffer: (offerId: string, offer?: OfferNegotiation) => void;
  onCounterOffer: (offer: OfferNegotiation) => void;
  onRejectOffer?: (offerId: string) => void;
  onDeleteListing?: (id: string) => void;
  onUpdateListing?: (id: string, data: Partial<MarketplaceListing>) => void;
}

export const MarketplaceDashboard: React.FC<MarketplaceDashboardProps> = ({
  currentUser,
  currentUserId,
  isDemoMode = false,
  listings,
  offers,
  onOpenNewListingModal,
  onAcceptOffer,
  onCounterOffer,
  onRejectOffer,
  onDeleteListing,
  onUpdateListing
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'accepted'>('all');
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  const activeUserId = currentUserId || currentUser.id;
  const activeUserName = currentUser.name || '';
  const cleanActiveName = activeUserName.toLowerCase().replace(/\(.*?\)/g, '').trim();

  const MOCK_LISTING_IDS = new Set(['lst_101', 'lst_102', 'lst_103', 'lst_104', 'lst_105']);
  const MOCK_OFFER_IDS = new Set(['ofr_801', 'ofr_802']);

  // Filter listings owned strictly by this user (by ID or clean Name)
  const myListings = listings.filter(l => {
    if (isDemoMode) {
      return (
        l.sellerId === activeUserId ||
        l.sellerId === 'usr_rameshwar_99' ||
        l.sellerName.toLowerCase().includes('rameshwar')
      );
    }
    const isMock = MOCK_LISTING_IDS.has(l.id) || l.id.startsWith('demo_') || l.sellerId === 'usr_rameshwar_99';
    if (isMock) return false;

    const matchesId = Boolean(activeUserId && l.sellerId && (l.sellerId === activeUserId || l.sellerId.includes(activeUserId) || activeUserId.includes(l.sellerId)));
    const cleanSeller = (l.sellerName || '').toLowerCase().replace(/\(.*?\)/g, '').trim();
    const firstWordActive = cleanActiveName.split(' ')[0];
    const matchesName = Boolean(cleanActiveName && cleanSeller && (
      cleanSeller.includes(cleanActiveName) ||
      cleanActiveName.includes(cleanSeller) ||
      (firstWordActive.length > 2 && cleanSeller.includes(firstWordActive))
    ));

    return matchesId || matchesName;
  });

  // Set of all listing IDs owned by the user
  const myListingIds = new Set(myListings.map(l => l.id));

  // Filter offers received on this user's listings or where user is seller/buyer
  const receivedOffers = offers.filter(o => {
    if (isDemoMode) {
      return (
        myListingIds.has(o.listingId) ||
        o.sellerId === activeUserId ||
        o.sellerId === 'usr_rameshwar_99' ||
        o.sellerName.toLowerCase().includes('rameshwar')
      );
    }
    const isMock = MOCK_OFFER_IDS.has(o.id) || o.id.startsWith('ofr_8');
    if (isMock) return false;

    const isListingOwner = myListingIds.has(o.listingId);
    const matchesSellerId = Boolean(activeUserId && o.sellerId && (o.sellerId === activeUserId || o.sellerId.includes(activeUserId) || activeUserId.includes(o.sellerId)));
    
    const cleanSeller = (o.sellerName || '').toLowerCase().replace(/\(.*?\)/g, '').trim();
    const firstWordActive = cleanActiveName.split(' ')[0];
    const matchesSellerName = Boolean(cleanActiveName && cleanSeller && (
      cleanSeller.includes(cleanActiveName) ||
      cleanActiveName.includes(cleanSeller) ||
      (firstWordActive.length > 2 && cleanSeller.includes(firstWordActive))
    ));

    // Also check if the parent listing in total listings list belongs to the current user
    const parentListing = listings.find(l => l.id === o.listingId);
    const matchesParentListing = parentListing && (
      (activeUserId && parentListing.sellerId === activeUserId) ||
      (cleanActiveName && parentListing.sellerName.toLowerCase().includes(cleanActiveName))
    );

    return isListingOwner || matchesSellerId || matchesSellerName || matchesParentListing;
  });

  // Filter offers submitted by this user (where user is buyer)
  const submittedOffers = offers.filter(o => {
    if (isDemoMode) return false;
    const isMock = MOCK_OFFER_IDS.has(o.id) || o.id.startsWith('ofr_8');
    if (isMock) return false;

    const isBuyerId = Boolean(activeUserId && o.buyerId && (o.buyerId === activeUserId || o.buyerId.includes(activeUserId) || activeUserId.includes(o.buyerId)));
    const cleanBuyer = (o.buyerName || '').toLowerCase().replace(/\(.*?\)/g, '').trim();
    const firstWordActive = cleanActiveName.split(' ')[0];
    const isBuyerName = Boolean(cleanActiveName && cleanBuyer && (
      cleanBuyer.includes(cleanActiveName) ||
      cleanActiveName.includes(cleanBuyer) ||
      (firstWordActive.length > 2 && cleanBuyer.includes(firstWordActive))
    ));

    return isBuyerId || isBuyerName;
  });

  const [offerViewMode, setOfferViewMode] = useState<'received' | 'submitted'>('received');

  const pendingOffers = receivedOffers.filter(o => o.status === 'pending');
  const acceptedOffers = receivedOffers.filter(o => o.status === 'accepted');

  // Compute total volume & occupancy
  const totalListedQuantity = myListings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const totalOccupiedQuantity = myListings.reduce((sum, l) => sum + (Number(l.occupiedQuantity) || 0), 0);
  const totalVolumeSold = acceptedOffers.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
  const totalSalesValue = acceptedOffers.reduce((sum, o) => sum + (Number(o.offeredPrice || o.originalPrice) * Number(o.quantity || 0)), 0);

  const activeOfferList = offerViewMode === 'received' ? receivedOffers : submittedOffers;

  const filteredOffers = activeOfferList.filter(o => {
    if (selectedStatus === 'all') return true;
    return o.status === selectedStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
            <ShoppingBag className="w-4 h-4" />
            <span>Kisan & Trader Produce Management Console</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
            {currentUser.name}'s Produce Trade Dashboard
          </h2>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Track your published harvest batches, monitor how much lot volume has been booked/occupied, 
            and negotiate directly with verified millers and traders.
          </p>
        </div>

        <button
          onClick={onOpenNewListingModal}
          className="px-4 py-2.5 text-xs font-bold bg-white text-amber-900 hover:bg-amber-50 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-800" />
          <span>+ Publish New Produce Offer</span>
        </button>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>My Active Listings</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{myListings.length}</span>
            <span className="text-[11px] text-stone-500">Harvest lots live</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Buyer Requests Received</span>
            <Users className="w-4 h-4 text-sky-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{receivedOffers.length}</span>
            <span className="text-[11px] text-amber-700 font-semibold">{pendingOffers.length} pending review</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Volume Occupied / Contracted</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-800">
              {totalVolumeSold > 0 ? totalVolumeSold : totalOccupiedQuantity}
            </span>
            <span className="text-[11px] text-stone-500">/ {totalListedQuantity} Quintals</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Total Agreed Trade Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-800">
              ₹{totalSalesValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: My Published Listings with Lot Occupancy Tracker */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900">My Published Produce Lots</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Live status, occupied vs remaining capacity, and incoming buyer offers per listing.
            </p>
          </div>
          <button
            onClick={onOpenNewListingModal}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Batch</span>
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 space-y-3">
            <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-stone-800">No active produce listings published yet</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                List your wheat, basmati paddy, mustard, or cotton harvest to receive direct purchase offers from verified millers.
              </p>
            </div>
            <button
              onClick={onOpenNewListingModal}
              className="px-4 py-2 bg-amber-800 text-white font-semibold text-xs rounded-lg shadow-xs hover:bg-amber-900 transition-colors"
            >
              + Publish My First Harvest Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.map(listing => {
              const listingOffers = receivedOffers.filter(o => o.listingId === listing.id);
              const occupied = Number(listing.occupiedQuantity || 0);
              const total = Number(listing.quantity || 1);
              const pctOccupied = Math.min(100, Math.round((occupied / total) * 100));

              return (
                <div key={listing.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {listing.commodity}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        pctOccupied >= 100 
                          ? 'bg-stone-200 text-stone-700' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {pctOccupied >= 100 ? 'Sold Out' : 'Active for Sale'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 mt-2">
                      {listing.variety || listing.commodity} ({listing.grade})
                    </h4>
                    
                    <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{listing.location.village ? `${listing.location.village}, ` : ''}{listing.location.district}, {listing.location.state}</span>
                    </div>

                    {/* Lot Occupancy Bar */}
                    <div className="mt-3 p-3 bg-white border border-stone-200 rounded-lg text-xs space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500">Asking Price:</span>
                        <strong className="font-mono text-emerald-800 font-bold text-sm">
                          ₹{listing.askingPrice.toLocaleString('en-IN')}/{listing.unit}
                        </strong>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-stone-600">Lot Space Occupied / Sold:</span>
                          <span className="font-mono font-bold text-stone-900">{occupied} / {total} {listing.unit} ({pctOccupied}%)</span>
                        </div>
                        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-700 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${pctOccupied}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-stone-100 text-[11px]">
                        <span className="text-stone-500">Incoming Buyer Offers:</span>
                        <strong className="text-amber-800 font-bold">{listingOffers.length} requests</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-stone-400">Listed: {listing.postedDate}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingListing(listing);
                          setEditPrice(listing.askingPrice);
                          setEditQuantity(listing.quantity);
                          setEditNotes(listing.notes || '');
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded flex items-center gap-1"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-3 h-3 text-stone-600" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete listing for ${listing.commodity}?`)) {
                            onDeleteListing?.(listing.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded flex items-center gap-1"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Bilateral Offers & Negotiation Management */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Top View Selector: Received Offers vs My Submitted Offers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOfferViewMode('received')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                offerViewMode === 'received'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>📥 Offers Received ({receivedOffers.length})</span>
            </button>
            <button
              onClick={() => setOfferViewMode('submitted')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                offerViewMode === 'submitted'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>📤 Offers Made by Me ({submittedOffers.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                selectedStatus === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({activeOfferList.length})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                selectedStatus === 'pending' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pending ({activeOfferList.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatus('accepted')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                selectedStatus === 'accepted' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Accepted ({activeOfferList.filter(o => o.status === 'accepted').length})
            </button>
          </div>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            {offerViewMode === 'received' 
              ? 'No incoming purchase offers received on your listings yet.'
              : 'You have not submitted any purchase offers on other sellers\' listings yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-4 bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-xl transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 uppercase">
                      {offerViewMode === 'received' ? 'Buyer:' : 'Seller:'}
                    </span>
                    <span className="text-sm font-bold text-stone-900">
                      {offerViewMode === 'received' ? offer.buyerName : offer.sellerName}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        offer.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : offer.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : offer.status === 'countered'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {offer.status === 'pending' ? '⏳ Pending Review' :
                       offer.status === 'accepted' ? '✅ Deal Confirmed' :
                       offer.status === 'countered' ? '🔄 Counter Proposed' :
                       '✕ Declined'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-700">
                    Commodity: <strong className="text-stone-900">{offer.commodity}</strong> · Quantity: <strong className="font-mono text-stone-900">{offer.quantity} {offer.unit}</strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span>
                      Original Asking: <strong className="font-mono text-stone-500 line-through">₹{offer.originalPrice}/{offer.unit}</strong>
                    </span>
                    <span>
                      Offered Rate: <strong className="font-mono text-emerald-800 text-sm font-bold">₹{offer.offeredPrice}/{offer.unit}</strong>
                    </span>
                    <span>
                      Total Trade Value: <strong className="font-mono text-stone-900">₹{(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')}</strong>
                    </span>
                  </div>

                  {offer.history && offer.history.length > 0 && (
                    <div className="text-xs text-stone-500 bg-white p-2 rounded border border-stone-200 max-w-xl">
                      Latest Note: "{offer.history[offer.history.length - 1].message || 'Price negotiation proposal.'}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200">
                  {offerViewMode === 'received' && offer.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onAcceptOffer(offer.id, offer)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept Offer</span>
                      </button>
                      <button
                        onClick={() => onCounterOffer(offer)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                      >
                        Counter Rate
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Decline offer from ${offer.buyerName} for ${offer.commodity}?`)) {
                            onRejectOffer?.(offer.id);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {offerViewMode === 'submitted' && offer.status === 'pending' && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Sent to Seller · Awaiting Response</span>
                    </span>
                  )}

                  {offer.status === 'accepted' && (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Order Created · Escrow Locked</span>
                    </span>
                  )}

                  {offer.status === 'rejected' && (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Offer Declined</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Edit Harvest Listing</h3>
              <button onClick={() => setEditingListing(null)} className="text-stone-400 hover:text-stone-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Asking Price (₹ / {editingListing.unit})</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Total Quantity ({editingListing.unit})</label>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notes / Quality Info</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-150">
              <button
                onClick={() => setEditingListing(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateListing?.(editingListing.id, {
                    askingPrice: editPrice,
                    quantity: editQuantity,
                    notes: editNotes,
                  });
                  setEditingListing(null);
                }}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold text-xs shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
