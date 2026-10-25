import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  CheckCircle, 
  X, 
  Clock, 
  Truck, 
  Store, 
  MessageSquare,
  Sparkles,
  FileText,
  Loader2,
  Boxes
} from 'lucide-react';
import { MarketplaceListing, OfferNegotiation, CommodityType, UserProfile } from '../../types';
import { useListings } from '../../hooks/useListings';
import { useAuth } from '../../hooks/useAuth';
import { CURRENT_USER } from '../../data/mockData';
import { MarketplaceDashboard } from './MarketplaceDashboard';

const MOCK_LISTING_IDS = new Set(['lst_101', 'lst_102', 'lst_103', 'lst_104', 'lst_105']);
const MOCK_SELLER_IDS = new Set([
  'usr_rameshwar_99',
  'usr_gurpreet_04',
  'usr_mahavir_dal_mill',
  'usr_patel_traders',
  'usr_sukhminder_fpo',
  'usr_gurpreet_88',
  'usr_mahavir_77'
]);

interface MarketplaceViewProps {
  onOpenAIQuery?: (text: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onOpenAIQuery }) => {
  const { listings, offers, orders, loading, createListing, makeOffer, counterOffer, acceptOffer } = useListings();
  const { profile, user, isAuthenticated, isDemo } = useAuth();

  const currentUserId = user?.id || profile?.id || (isDemo ? 'usr_rameshwar_99' : '');
  const currentUserName = profile?.name || user?.user_metadata?.full_name || (isDemo ? 'Rameshwar Singh' : 'Kisan User');

  const currentUser: UserProfile = profile || {
    id: currentUserId || 'usr_demo',
    name: currentUserName,
    phone: '',
    roles: ['farmer'],
    activeRole: 'farmer',
    isKycVerified: Boolean(user),
    state: 'Punjab / Haryana',
    district: '',
    village: '',
    farmSizeAcres: 0,
    primaryCrops: []
  };

  const [activeTab, setActiveTab] = useState<'all' | 'sell' | 'buy' | 'dashboard'>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  
  // Negotiation Modal
  const [selectedListingForOffer, setSelectedListingForOffer] = useState<MarketplaceListing | null>(null);
  const [offerPriceInput, setOfferPriceInput] = useState<number>(0);
  const [offerQuantityInput, setOfferQuantityInput] = useState<number>(0);
  const [offerMessageInput, setOfferMessageInput] = useState<string>('');
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);

  // New Listing Modal
  const [showNewListingModal, setShowNewListingModal] = useState(false);
  const [newCommodity, setNewCommodity] = useState<CommodityType>('Wheat (गेहूं)');
  const [newVariety, setNewVariety] = useState('PBW-550');
  const [newGrade, setNewGrade] = useState('Grade A');
  const [newQuantity, setNewQuantity] = useState<number>(60);
  const [newAskingPrice, setNewAskingPrice] = useState<number>(2550);
  const [newListingType, setNewListingType] = useState<'sell' | 'buy'>('sell');
  const [newNotes, setNewNotes] = useState('');

  // Success notifications
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Public listings: In live mode, exclude demo items and exclude user's own listing so they don't buy from themselves
  const filteredListings = listings.filter((l) => {
    if (!isDemo) {
      const isMock = MOCK_LISTING_IDS.has(l.id) || MOCK_SELLER_IDS.has(l.sellerId) || l.id.startsWith('demo_');
      const isMine = l.sellerId === currentUserId || (currentUserId && l.sellerId.includes(currentUserId));
      if (isMock || isMine) return false;
    }
    const matchesTab = activeTab === 'all' || l.listingType === activeTab;
    const matchesCommodity = selectedCommodity === 'All' || l.commodity.includes(selectedCommodity);
    return matchesTab && matchesCommodity;
  });

  const MOCK_OFFER_IDS = new Set(['ofr_801', 'ofr_802']);
  const MOCK_ORDER_IDS = new Set(['ord_kht_9021']);

  const displayOffers = offers.filter(o => {
    if (isDemo) return true;
    const isMock = MOCK_OFFER_IDS.has(o.id) || o.id.startsWith('ofr_8') || o.buyerId === 'usr_rameshwar_99' || o.sellerId === 'usr_rameshwar_99';
    const isInvolved = o.buyerId === currentUserId || o.sellerId === currentUserId;
    return !isMock && isInvolved;
  });

  const displayOrders = orders.filter(ord => {
    if (isDemo) return true;
    const isMock = MOCK_ORDER_IDS.has(ord.id) || ord.id.startsWith('ord_kht_') || ord.sellerName.includes('Rameshwar');
    const isInvolved = (ord.buyerName && currentUserName && ord.buyerName.toLowerCase().includes(currentUserName.toLowerCase())) ||
                       (ord.sellerName && currentUserName && ord.sellerName.toLowerCase().includes(currentUserName.toLowerCase()));
    return !isMock && isInvolved;
  });

  const showNegotiationSection = isDemo || displayOffers.length > 0 || displayOrders.length > 0;

  const handleOpenOfferModal = (listing: MarketplaceListing) => {
    setSelectedListingForOffer(listing);
    setOfferPriceInput(listing.askingPrice);
    setOfferQuantityInput(listing.minOrderQuantity || 20);
    setOfferMessageInput('');
    setShowNegotiationModal(true);
  };

  const handleSendOffer = async () => {
    if (!selectedListingForOffer) return;
    const newOffer: Omit<OfferNegotiation, 'id'> = {
      listingId: selectedListingForOffer.id,
      commodity: selectedListingForOffer.commodity,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: selectedListingForOffer.sellerId,
      sellerName: selectedListingForOffer.sellerName,
      originalPrice: selectedListingForOffer.askingPrice,
      offeredPrice: offerPriceInput,
      quantity: offerQuantityInput,
      unit: selectedListingForOffer.unit,
      status: 'pending',
      history: [{
        senderId: currentUser.id,
        senderName: currentUser.name,
        price: offerPriceInput,
        quantity: offerQuantityInput,
        timestamp: new Date().toLocaleString('en-IN'),
        message: offerMessageInput || 'Submitted negotiation offer.'
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await makeOffer(newOffer);
      setShowNegotiationModal(false);
      showNotification(`Offer of ₹${offerPriceInput}/${selectedListingForOffer.unit} submitted to ${selectedListingForOffer.sellerName}!`);
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  const handleAcceptOffer = async (offer: OfferNegotiation) => {
    try {
      await acceptOffer(offer.id);
      showNotification(`Deal agreed! Order confirmed for ₹${(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')}. Escrow locked.`);
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: Omit<MarketplaceListing, 'id'> = {
      sellerId: currentUser.id,
      sellerName: `${currentUser.name} (${currentUser.activeRole === 'farmer' ? 'Kisan' : 'Enterprise'})`,
      sellerType: currentUser.activeRole === 'farmer' ? 'farmer' : 'business',
      isVerified: currentUser.isKycVerified,
      listingType: newListingType,
      commodity: newCommodity,
      variety: newVariety,
      grade: newGrade,
      quantity: Number(newQuantity),
      unit: 'Quintal',
      askingPrice: Number(newAskingPrice),
      minOrderQuantity: 10,
      location: {
        village: currentUser.village,
        district: currentUser.district,
        state: currentUser.state,
        distanceKm: 0
      },
      pickupAvailable: true,
      deliveryAvailable: true,
      postedDate: new Date().toLocaleDateString('en-IN'),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      notes: newNotes || 'Verified farm produce ready for inspection and prompt weighbridge checkout.',
      status: 'active'
    };
    try {
      await createListing(newListing);
      setShowNewListingModal(false);
      showNotification(`Your ${newListingType === 'sell' ? 'Produce Sell Offer' : 'Buying Request'} has been published!`);
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode Banner */}
      {isDemo ? (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-950">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>🎭 Prototype Pitch Demo Active:</strong> You are viewing sample marketplace trades for demonstration. Sign in or switch to Live Account to manage your private lots.
            </span>
          </div>
          {!isAuthenticated && (
            <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] self-start sm:self-auto">
              Guest Visitor Mode
            </span>
          )}
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span>
              <strong>🟢 Live Isolated User Network:</strong> Showing active listings from other farmers and buyers. Your own harvest lots are separated into <strong>"My Listing Dashboard"</strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-[11px] font-bold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-100 px-2.5 py-1 rounded-md shrink-0 transition-colors"
          >
            Open My Dashboard →
          </button>
        </div>
      )}

      {/* Header and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span>Direct Agricultural Commerce & APMC Disintermediation</span>
            <span aria-hidden="true">·</span>
            <span>Zero Middleman Commission</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">Agricultural Buy & Sell Marketplace</h1>
          <p className="text-sm text-stone-700 mt-0.5">
            Transparent trade between verified farmers, mill owners, FPOs, and bulk agricultural buyers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewListingModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Listing</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Commodity Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-stone-200 rounded-2xl shadow-2xs">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-xl overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            सभी लिस्टिंग ({filteredListings.length})
          </button>

          <button
            onClick={() => setActiveTab('sell')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'sell'
                ? 'bg-emerald-800 text-white shadow-2xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            किसान बिक्री (Sell)
          </button>

          <button
            onClick={() => setActiveTab('buy')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'buy'
                ? 'bg-sky-800 text-white shadow-2xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            व्यापारी मांग (Buy)
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 relative ${
              activeTab === 'dashboard'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-amber-100/80 text-amber-950 hover:bg-amber-200/80'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span>मेरा डैशबोर्ड</span>
            {offers.filter(o => o.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            )}
          </button>
        </div>

        {/* Commodity Filter */}
        <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-stone-150">
          <span className="text-xs font-extrabold text-stone-700 whitespace-nowrap">फसल फ़िल्टर:</span>
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="py-1.5 px-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-700 text-stone-900 font-bold shrink-0 shadow-2xs"
          >
            <option value="All">सभी फसलें (All Commodities)</option>
            <option value="Wheat">गेहूं (Wheat)</option>
            <option value="Basmati">बासमती धान (Paddy)</option>
            <option value="Mustard">सरसों (Mustard)</option>
            <option value="Potato">आलू (Potato)</option>
          </select>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <MarketplaceDashboard
          currentUser={currentUser}
          currentUserId={currentUserId}
          isDemoMode={isDemo}
          listings={listings}
          offers={offers}
          onOpenNewListingModal={() => setShowNewListingModal(true)}
          onAcceptOffer={(offerId) => {
            const off = offers.find(o => o.id === offerId);
            if (off) handleAcceptOffer(off);
          }}
          onCounterOffer={(off) => {
            handleOpenOfferModal(listings.find(l => l.id === off.listingId) || listings[0]);
          }}
        />
      ) : (
        <>
          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🌾
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {isDemo
                    ? 'No sample listings match this commodity filter.'
                    : 'अन्य किसानों/व्यापारियों की कोई सक्रिय लिस्टिंग नहीं है (No other user listings yet)'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {isDemo
                    ? 'Change your filter selection to view available demo produce offers.'
                    : 'लाइव मोड में केवल अन्य उपयोगकर्ताओं द्वारा प्रकाशित लिस्टिंग्स यहां दिखाई देती हैं। आपके द्वारा बनाई गई लिस्टिंग्स आपके "My Listing Dashboard (मेरा डैशबोर्ड)" में सुरक्षित हैं।'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shadow-xs"
                  >
                    मेरा डैशबोर्ड देखें (My Dashboard)
                  </button>
                  <button
                    onClick={() => setShowNewListingModal(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                  >
                    + नई लिस्टिंग प्रकाशित करें (+ Publish Listing)
                  </button>
                </div>
              </div>
            ) : (
              filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs flex flex-col justify-between hover:border-emerald-500 transition-colors"
              >
                <div>
                  {/* Badge & Type */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        listing.listingType === 'sell'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : 'bg-sky-50 text-sky-800 border border-sky-200/60'
                      }`}
                    >
                      {listing.listingType === 'sell' ? 'For Sale by Farmer' : 'Buying Requirement'}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" /> {listing.postedDate}
                    </span>
                  </div>

                  {/* Title & Seller */}
                  <div className="mt-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-700">{listing.sellerName}</span>
                      {listing.isVerified && (
                        <span title="Kheti Verified KYC">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5">{listing.commodity}</h3>
                    <div className="text-[11px] text-stone-500 font-medium">
                      <span>{listing.variety}</span>
                      <span className="mx-1.5">·</span>
                      <span>{listing.grade}</span>
                    </div>
                  </div>

                  {/* Specs Grid (Borderless Subtle Background) */}
                  <div className="mt-3 p-2.5 bg-stone-50/80 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-500 text-[10px] font-medium block">Available Quantity</span>
                      <span className="font-bold font-mono text-stone-900 text-xs sm:text-sm">
                        {listing.quantity} {listing.unit}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-500 text-[10px] font-medium block">Asking Rate</span>
                      <span className="font-extrabold font-mono text-emerald-800 text-xs sm:text-sm">
                        ₹{listing.askingPrice.toLocaleString('en-IN')}/{listing.unit.slice(0, 3)}
                      </span>
                    </div>
                    {listing.moistureContentPercent && (
                      <div className="col-span-2 pt-1 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-stone-600">Moisture Content:</span>
                        <span className="font-mono font-bold text-stone-900">{listing.moistureContentPercent}%</span>
                      </div>
                    )}
                  </div>

                  {/* Location & Logistical terms */}
                  <div className="mt-3 text-xs text-stone-700 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>
                        {listing.location.village ? `${listing.location.village}, ` : ''}
                        {listing.location.district}, {listing.location.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>
                        {listing.pickupAvailable && listing.deliveryAvailable
                          ? 'Pickup at farm or delivery available'
                          : listing.pickupAvailable
                          ? 'Buyer pickup from farm godown'
                          : 'Delivery to mill gate'}
                      </span>
                    </div>
                    {listing.notes && (
                      <p className="text-[11px] text-stone-700 italic mt-1 line-clamp-2">"{listing.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-4 pt-3 border-t border-stone-150 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (onOpenAIQuery) {
                        onOpenAIQuery(`What is a fair negotiation price for ${listing.commodity} listed at ₹${listing.askingPrice}?`);
                      }
                    }}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
                    title="AI Price Analysis"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Fair Price?
                  </button>

                  <button
                    onClick={() => handleOpenOfferModal(listing)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Make Offer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

          {/* Active Negotiations & Agreed Orders Section */}
          {showNegotiationSection && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
              {/* Negotiation History */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-150">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Negotiation Workflow</span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">Active Offers & Counteroffers</h3>
                  </div>
                  <span className="text-xs text-stone-700">{displayOffers.length} Conversations</span>
                </div>

                <div className="mt-4 space-y-3">
                  {displayOffers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-lg">
                      No active offers or counteroffers.
                    </div>
                  ) : (
                    displayOffers.map((offer) => (
                      <div key={offer.id} className="p-3.5 bg-stone-50 border border-stone-150 rounded-lg text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{offer.commodity}</span>
                          <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                            offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-900' :
                            offer.status === 'countered' ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-800'
                          }`}>
                            Status: {offer.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-stone-700">
                          <span>Buyer: <strong>{offer.buyerName}</strong></span>
                          <span>Seller: <strong>{offer.sellerName}</strong></span>
                        </div>

                        <div className="p-2 bg-white rounded border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-stone-700">Quantity:</span> <strong>{offer.quantity} {offer.unit}</strong>
                          </div>
                          <div>
                            <span className="text-stone-700">Listed:</span> <span className="line-through">₹{offer.originalPrice}</span>
                          </div>
                          <div>
                            <span className="text-stone-700">Offered:</span> <strong className="text-emerald-800 text-sm">₹{offer.offeredPrice}</strong>
                          </div>
                        </div>

                        {offer.history[0]?.message && (
                          <div className="text-[11px] text-stone-700 italic">
                            "{offer.history[0].message}" · <span className="text-stone-700">{offer.history[0].timestamp}</span>
                          </div>
                        )}

                        {offer.status !== 'accepted' && (
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleAcceptOffer(offer)}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs transition-colors"
                            >
                              Accept Deal & Create Order
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Agreed Orders & Escrow Tracking */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-150">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Commercial Transactions</span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">Agreed Orders & Deliveries</h3>
                  </div>
                  <span className="text-xs text-stone-700">{displayOrders.length} Completed / In-progress</span>
                </div>

                <div className="mt-4 space-y-3">
                  {displayOrders.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-lg">
                      No agreed orders or active deliveries yet.
                    </div>
                  ) : (
                    displayOrders.map((ord) => (
                      <div key={ord.id} className="p-3.5 bg-stone-50 border border-stone-150 rounded-lg text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span className="font-bold text-stone-900 font-mono">{ord.id}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Payment: Escrow Locked
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-stone-700">
                          <div>Commodity: <strong className="text-stone-900">{ord.commodity}</strong></div>
                          <div>Volume: <strong className="font-mono text-stone-900">{ord.quantity} {ord.unit}</strong></div>
                          <div>Agreed Price: <strong className="font-mono text-stone-900">₹{ord.agreedPrice}/qtl</strong></div>
                          <div>Total Value: <strong className="font-mono text-emerald-800 text-sm">₹{ord.totalAmount.toLocaleString('en-IN')}</strong></div>
                        </div>

                        <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-700">
                          <span>Location: {ord.pickupLocation}</span>
                          <span className="font-medium text-emerald-800">Weighment Verified ✓</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Negotiation Modal */}
      {showNegotiationModal && selectedListingForOffer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Direct Negotiation</span>
                <h3 className="text-base font-bold text-stone-900">Make an Offer to {selectedListingForOffer.sellerName}</h3>
              </div>
              <button onClick={() => setShowNegotiationModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1">
              <div>Produce: <strong>{selectedListingForOffer.commodity} ({selectedListingForOffer.variety})</strong></div>
              <div>Seller Asking Rate: <strong className="text-stone-900">₹{selectedListingForOffer.askingPrice}/{selectedListingForOffer.unit}</strong></div>
              <div>Location: <strong>{selectedListingForOffer.location.district}, {selectedListingForOffer.location.state}</strong></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Your Offered Price (₹ per {selectedListingForOffer.unit})</label>
                <input
                  type="number"
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(Number(e.target.value))}
                  className="w-full py-2 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Required Quantity ({selectedListingForOffer.unit})</label>
                <input
                  type="number"
                  value={offerQuantityInput}
                  onChange={(e) => setOfferQuantityInput(Number(e.target.value))}
                  className="w-full py-2 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Message or Pickup Preference (Optional)</label>
                <textarea
                  value={offerMessageInput}
                  onChange={(e) => setOfferMessageInput(e.target.value)}
                  placeholder="e.g. Can pick up in our own vehicle tomorrow morning. RTGS payment upon moisture test."
                  rows={2}
                  className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-950 flex items-center justify-between">
              <span>Total Estimated Value:</span>
              <span className="font-bold font-mono text-sm">₹{(offerPriceInput * offerQuantityInput).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowNegotiationModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOffer}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Listing Modal */}
      {showNewListingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Publish to Marketplace</span>
                <h3 className="text-base font-bold text-stone-900">Create Agricultural Listing</h3>
              </div>
              <button onClick={() => setShowNewListingModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">Listing Type</label>
                  <select
                    value={newListingType}
                    onChange={(e: any) => setNewListingType(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  >
                    <option value="sell">I want to Sell Produce (Farmer)</option>
                    <option value="buy">I want to Buy / Procure (Buyer)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">Commodity</label>
                  <select
                    value={newCommodity}
                    onChange={(e: any) => setNewCommodity(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  >
                    <option value="Wheat (गेहूं)">Wheat (गेहूं)</option>
                    <option value="Basmati Paddy (धान)">Basmati Paddy (धान)</option>
                    <option value="Mustard (सरसों)">Mustard (सरसों)</option>
                    <option value="Potato (आलू)">Potato (आलू)</option>
                    <option value="Onion (प्याज)">Onion (प्याज)</option>
                    <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">Variety Name</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    placeholder="e.g. Sharbati / PBW-550"
                    required
                    className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="FAQ (Fair Average Quality)">FAQ (Fair Average Quality)</option>
                    <option value="Super">Super Export Grade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">Total Quantity (Quintals)</label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">Asking Price (₹ / Quintal)</label>
                  <input
                    type="number"
                    value={newAskingPrice}
                    onChange={(e) => setNewAskingPrice(Number(e.target.value))}
                    min={100}
                    required
                    className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Quality & Pickup Details</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Machine cleaned, sun dried, stored in safe warehouse in Karnal. Available for sample inspection."
                  rows={2}
                  className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-700 flex items-center justify-between">
                <span>Estimated Gross Order:</span>
                <span className="font-bold font-mono text-stone-900 text-sm">
                  ₹{(newQuantity * newAskingPrice).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setShowNewListingModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
