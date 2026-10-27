import React, { useState } from 'react';
import { 
  RefreshCw,
  Database,
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
  Boxes,
  ChevronDown,
  MoreVertical,
  Scale,
  LayoutGrid,
  List
} from 'lucide-react';
import { MarketplaceListing, OfferNegotiation, CommodityType, UserProfile } from '../../types';
import { useListings } from '../../hooks/useListings';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { MarketplaceDashboard } from './MarketplaceDashboard';

const MOCK_LISTING_IDS = new Set(['lst_101', 'lst_102', 'lst_103', 'lst_104', 'lst_105']);
const MOCK_OFFER_IDS = new Set(['ofr_801', 'ofr_802']);
const MOCK_ORDER_IDS = new Set(['ord_kht_9021']);

interface MarketplaceViewProps {
  onOpenAIQuery?: (text: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onOpenAIQuery }) => {
  const { listings, offers, orders, loading, isSyncing, refresh, createListing, updateListing, deleteListing, makeOffer, counterOffer, acceptOffer } = useListings();
  const { addNotification } = useNotifications();
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
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
    state: 'Haryana',
    district: 'Karnal',
    village: 'Nilokheri',
    farmSizeAcres: 0,
    primaryCrops: []
  };

  const [activeTab, setActiveTab] = useState<'all' | 'sell' | 'buy' | 'dashboard'>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Public listings: All active listings matching selected filters
  const filteredListings = listings.filter((l) => {
    const matchesTab = activeTab === 'all' || l.listingType === activeTab;
    const matchesCommodity = selectedCommodity === 'All' || l.commodity.toLowerCase().includes(selectedCommodity.toLowerCase());
    const matchesState = selectedState === 'All' || (l.location && l.location.state && l.location.state.toLowerCase().includes(selectedState.toLowerCase()));
    return matchesTab && matchesCommodity && matchesState;
  });

  // Set of listing IDs owned/created by the current user
  const userListingIds = new Set(
    listings
      .filter(l => (currentUserId && l.sellerId === currentUserId) ||
                   (currentUserName && l.sellerName?.toLowerCase().includes(currentUserName.toLowerCase())))
      .map(l => l.id)
  );

  const displayOffers = offers.filter(o => {
    if (isDemo) return true;
    const isMock = MOCK_OFFER_IDS.has(o.id) || MOCK_LISTING_IDS.has(o.listingId);
    if (isMock) return false;

    const matchesId = (o.buyerId && currentUserId && o.buyerId === currentUserId) ||
                      (o.sellerId && currentUserId && o.sellerId === currentUserId);
    const matchesName = (o.buyerName && currentUserName && o.buyerName.toLowerCase().includes(currentUserName.toLowerCase())) ||
                        (o.sellerName && currentUserName && o.sellerName.toLowerCase().includes(currentUserName.toLowerCase()));
    const isOwnerOfListing = userListingIds.has(o.listingId);

    return matchesId || matchesName || isOwnerOfListing;
  });

  const displayOrders = orders.filter(ord => {
    if (isDemo) return true;
    const isMock = MOCK_ORDER_IDS.has(ord.id);
    if (isMock) return false;

    const matchesId = (ord.buyerId && currentUserId && ord.buyerId === currentUserId) ||
                      (ord.sellerId && currentUserId && ord.sellerId === currentUserId);
    const matchesName = (ord.buyerName && currentUserName && ord.buyerName.toLowerCase().includes(currentUserName.toLowerCase())) ||
                        (ord.sellerName && currentUserName && ord.sellerName.toLowerCase().includes(currentUserName.toLowerCase()));
    const isOwnerOfListing = userListingIds.has(ord.listingId);

    return matchesId || matchesName || isOwnerOfListing;
  });

  const showNegotiationSection = isDemo || displayOffers.length > 0 || displayOrders.length > 0;

  const handleOpenOfferModal = (listing: MarketplaceListing) => {
    const isOwner = (currentUserId && listing.sellerId === currentUserId) ||
                    (currentUserName && listing.sellerName?.toLowerCase().includes(currentUserName.toLowerCase())) ||
                    userListingIds.has(listing.id);
    if (isOwner) {
      showNotification('This is your own listing. You cannot make an offer on your own post!');
      return;
    }
    setSelectedListingForOffer(listing);
    setOfferPriceInput(listing.askingPrice);
    setOfferQuantityInput(listing.minOrderQuantity || 20);
    setOfferMessageInput('');
    setShowNegotiationModal(true);
  };

  const handleSendOffer = async () => {
    if (!selectedListingForOffer) return;
    const sellerId = selectedListingForOffer.sellerId || 'usr_seller_lister';
    const sellerName = selectedListingForOffer.sellerName || 'Verified Lister';
    const buyerId = currentUser.id || currentUserId || 'usr_buyer';
    const buyerName = currentUser.name || currentUserName || 'Buyer';

    const newOffer: Omit<OfferNegotiation, 'id'> = {
      listingId: selectedListingForOffer.id,
      commodity: selectedListingForOffer.commodity,
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      originalPrice: selectedListingForOffer.askingPrice,
      offeredPrice: offerPriceInput,
      quantity: offerQuantityInput,
      unit: selectedListingForOffer.unit,
      status: 'pending',
      history: [{
        senderId: buyerId,
        senderName: buyerName,
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
      showNotification(`Offer of ₹${offerPriceInput}/${selectedListingForOffer.unit} submitted to ${sellerName}!`);

      // 1. Add notification for Buyer
      addNotification({
        recipientUserId: buyerId,
        type: 'offer_received',
        title: `Offer Sent: ${selectedListingForOffer.commodity}`,
        titleHi: `ऑफर भेजा गया: ${selectedListingForOffer.commodity}`,
        message: `Your negotiation offer of ₹${offerPriceInput}/${selectedListingForOffer.unit} for ${offerQuantityInput} ${selectedListingForOffer.unit} was submitted to ${sellerName}. Total deal: ₹${(offerPriceInput * offerQuantityInput).toLocaleString('en-IN')}.`,
        messageHi: `आपका ₹${offerPriceInput}/${selectedListingForOffer.unit} का ऑफर (${offerQuantityInput} ${selectedListingForOffer.unit}) ${sellerName} को भेज दिया गया है। कुल मूल्य: ₹${(offerPriceInput * offerQuantityInput).toLocaleString('en-IN')}।`,
        commodity: selectedListingForOffer.commodity,
        price: offerPriceInput,
        quantity: offerQuantityInput,
        unit: selectedListingForOffer.unit,
        counterPartyName: sellerName,
        listingId: selectedListingForOffer.id,
        timestamp: 'Just now',
        linkTab: 'marketplace',
      });

      // 2. Add notification for Seller / Lister so they immediately see the alert in their bell
      addNotification({
        recipientUserId: sellerId,
        type: 'offer_received',
        title: `New Offer on Listing: ${selectedListingForOffer.commodity}`,
        titleHi: `आपकी फसल पर नया खरीद ऑफर: ${selectedListingForOffer.commodity}`,
        message: `${buyerName} submitted an offer of ₹${offerPriceInput}/${selectedListingForOffer.unit} for ${offerQuantityInput} ${selectedListingForOffer.unit} of ${selectedListingForOffer.commodity}. Total: ₹${(offerPriceInput * offerQuantityInput).toLocaleString('en-IN')}. Review and accept.`,
        messageHi: `${buyerName} ने आपके ${selectedListingForOffer.commodity} के लिए ₹${offerPriceInput}/${selectedListingForOffer.unit} (${offerQuantityInput} ${selectedListingForOffer.unit}) का ऑफर भेजा है। कुल सौदा: ₹${(offerPriceInput * offerQuantityInput).toLocaleString('en-IN')}।`,
        commodity: selectedListingForOffer.commodity,
        price: offerPriceInput,
        quantity: offerQuantityInput,
        unit: selectedListingForOffer.unit,
        counterPartyName: buyerName,
        listingId: selectedListingForOffer.id,
        timestamp: 'Just now',
        linkTab: 'marketplace',
      });
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  const handleAcceptOffer = async (offer: OfferNegotiation) => {
    try {
      await acceptOffer(offer.id, offer);
      showNotification(`Deal agreed! Order confirmed for ₹${(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')}. Escrow locked.`);

      // 1. Add notification for Seller
      addNotification({
        recipientUserId: offer.sellerId || currentUserId,
        type: 'offer_accepted',
        title: `🤝 Deal Confirmed: ${offer.commodity}`,
        titleHi: `🤝 ऑफर स्वीकार हुआ! सौदा पक्का: ${offer.commodity}`,
        message: `Deal agreed with ${offer.buyerName} for ${offer.quantity} ${offer.unit} of ${offer.commodity} at ₹${offer.offeredPrice}/${offer.unit}. Total value ₹${(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')} locked in escrow.`,
        messageHi: `${offer.buyerName} के साथ ${offer.quantity} ${offer.unit} ${offer.commodity} का सौदा ₹${offer.offeredPrice}/${offer.unit} पर पक्का हुआ। कुल मूल्य ₹${(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')} एस्क्रो में सुरक्षित।`,
        commodity: offer.commodity,
        price: offer.offeredPrice,
        quantity: offer.quantity,
        unit: offer.unit,
        counterPartyName: offer.buyerName,
        offerId: offer.id,
        listingId: offer.listingId,
        timestamp: 'Just now',
        linkTab: 'marketplace',
      });

      // 2. Add notification for Buyer
      addNotification({
        recipientUserId: offer.buyerId,
        type: 'offer_accepted',
        title: `🎉 Offer Accepted! Deal Confirmed: ${offer.commodity}`,
        titleHi: `🎉 आपका ऑफर स्वीकार कर लिया गया! सौदा पक्का: ${offer.commodity}`,
        message: `${offer.sellerName} accepted your offer for ${offer.quantity} ${offer.unit} of ${offer.commodity} at ₹${offer.offeredPrice}/${offer.unit}. Total ₹${(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')}. Escrow locked!`,
        messageHi: `${offer.sellerName} ने आपके ${offer.quantity} ${offer.unit} ${offer.commodity} का ₹${offer.offeredPrice}/${offer.unit} पर ऑफर स्वीकार कर लिया। कुल ₹${(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')}। एस्क्रो भुगतान सुरक्षित है!`,
        commodity: offer.commodity,
        price: offer.offeredPrice,
        quantity: offer.quantity,
        unit: offer.unit,
        counterPartyName: offer.sellerName,
        offerId: offer.id,
        listingId: offer.listingId,
        timestamp: 'Just now',
        linkTab: 'marketplace',
      });
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingListing) return;
    setIsSubmittingListing(true);

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
        state: currentUser.state || 'Haryana',
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
      showNotification(`Your ${newListingType === 'sell' ? 'Produce Sell Offer' : 'Buying Request'} has been published successfully!`);
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    } finally {
      setIsSubmittingListing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-900 text-white text-xs font-semibold rounded-2xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── 1. HERO HEADER BANNER (EXACTLY MATCHING SCREENSHOT) ─── */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-stone-50 to-amber-50/50 border border-stone-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-2xl">
          {/* Header Badges Row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <span>DIRECT AGRICULTURAL COMMERCE &amp; APMC DISINTERMEDIATION</span>
            <span className="text-stone-300 font-normal">|</span>
            <span>ZERO MIDDLEMAN COMMISSION ON KHETI AI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
            Kheti AI Buy &amp; Sell Marketplace
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            Transparent trade between verified farmers, mill owners, FPOs, and bulk buyers across India. Fresh produce • Fair price • Direct connect.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => {
                refresh();
                showNotification('Syncing active market listings...');
              }}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-800 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Refreshing...' : 'Refresh Listings'}</span>
            </button>

            <button
              onClick={() => setShowNewListingModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-900 hover:bg-emerald-950 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ List on Kheti AI Marketplace</span>
            </button>
          </div>
        </div>

        {/* Hero Illustration Graphic (Right side matching screenshot) */}
        <div className="relative shrink-0 w-44 h-44 sm:w-52 sm:h-52 hidden md:flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-200/50 rounded-full blur-2xl transform scale-90" />
          <div className="relative w-full h-full rounded-full border-4 border-white shadow-md bg-gradient-to-tr from-amber-100 via-emerald-50 to-amber-200 flex items-center justify-center p-3 text-center overflow-hidden">
            <img
              src="/assets/aistudio/image_ed46a4f3.png"
              alt="Golden Wheat Harvest"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute bottom-2 bg-emerald-900/90 text-white font-mono font-bold text-[10px] px-3 py-1 rounded-full backdrop-blur-xs shadow-xs">
              🌾 Verified Produce
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. FILTER TOOLBAR (MATCHING SCREENSHOT) ─── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        {/* Row 1: Segmented Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-emerald-900 text-white shadow-2xs font-extrabold'
                : 'bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-800'
            }`}
          >
            <span>≡</span>
            <span>सभी Kheti AI लिस्टिंग ({filteredListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sell')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'sell'
                ? 'bg-emerald-900 text-white shadow-2xs font-extrabold'
                : 'bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-800'
            }`}
          >
            <span>🌾</span>
            <span>किसान बिक्री (Sell)</span>
          </button>

          <button
            onClick={() => setActiveTab('buy')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'buy'
                ? 'bg-emerald-900 text-white shadow-2xs font-extrabold'
                : 'bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-800'
            }`}
          >
            <span>🛒</span>
            <span>खरीदें (Buy)</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className="px-4 py-2 text-xs font-bold rounded-2xl bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-800 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>🏢</span>
            <span>व्यापार प्रकार</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950'
            }`}
          >
            <span>⚙</span>
            <span>मेरा डैशबोर्ड</span>
          </button>
        </div>

        {/* Row 2: Commodity & State Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-150">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700 whitespace-nowrap">फसल फ़िल्टर:</span>
            <div className="relative">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="py-2 px-3 pr-8 text-xs bg-white border border-stone-250 rounded-2xl focus:outline-none focus:border-emerald-700 text-stone-900 font-bold shadow-2xs appearance-none cursor-pointer"
              >
                <option value="All">🌱 सभी फसलें (All Commodities)</option>
                <option value="Wheat">🌾 गेहूं (Wheat)</option>
                <option value="Basmati">🌾 बासमती धान (Paddy)</option>
                <option value="Mustard">🌼 सरसों (Mustard)</option>
                <option value="Potato">🥔 आलू (Potato)</option>
                <option value="Soybean">🫘 सोयाबीन (Soybean)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="py-2 px-3 pr-8 text-xs bg-white border border-stone-250 rounded-2xl focus:outline-none focus:border-emerald-700 text-stone-900 font-bold shadow-2xs appearance-none cursor-pointer"
              >
                <option value="All">📍 सभी राज्य</option>
                <option value="Haryana">Haryana</option>
                <option value="Punjab">Punjab</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center gap-1 border border-stone-200 rounded-2xl p-1 bg-stone-50 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-emerald-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Grid View (2 columns)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-emerald-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="List View (1 column)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
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
          onAcceptOffer={(offerId, passedOffer) => {
            const off = passedOffer || offers.find(o => o.id === offerId);
            if (off) handleAcceptOffer(off);
          }}
          onCounterOffer={(off) => {
            handleOpenOfferModal(listings.find(l => l.id === off.listingId) || listings[0]);
          }}
          onDeleteListing={deleteListing}
          onUpdateListing={updateListing}
        />
      ) : (
        <>
          {/* ─── 3. LISTINGS FEED (GRID / LIST VIEW) ─── */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-5" : "grid grid-cols-1 gap-5"}>
            {filteredListings.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-3xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🌾
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  No active marketplace listings match this filter
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Select "सभी फसलें (All Commodities)" or publish a new produce lot.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowNewListingModal(true)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 rounded-2xl transition-colors shadow-xs"
                  >
                    + List on Kheti AI Marketplace
                  </button>
                </div>
              </div>
            ) : (
              filteredListings.map((listing, idx) => {
                const cropPhoto = listing.commodity.includes('Wheat') || listing.commodity.includes('गेहूं')
                  ? (idx % 2 === 0 ? '/assets/aistudio/image_ed46a4f3.png' : '/assets/aistudio/image_481883ee.png')
                  : '/assets/aistudio/Kheti_AI_Marketplace_Dashboard_682d8c37.png';

                const isOwner = (currentUserId && listing.sellerId === currentUserId) ||
                  (currentUserName && listing.sellerName?.toLowerCase().includes(currentUserName.toLowerCase())) ||
                  userListingIds.has(listing.id);

                return (
                  <div
                    key={listing.id}
                    className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3 hover:border-emerald-400 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider truncate shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                          <span>{listing.listingType === 'sell' ? 'FOR SALE BY FARMER' : 'BUYING REQUIREMENT'}</span>
                        </span>

                        <div className="flex items-center gap-2 text-stone-500 text-xs font-medium shrink-0">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>{listing.postedDate || '25/10/2026'}</span>
                          </span>
                          <button className="text-stone-400 hover:text-stone-700 p-1">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Main Content Flex Row */}
                      <div className="flex flex-row items-start gap-3 sm:gap-4">
                        {/* Crop Photo Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-100 relative">
                          <img
                            src={cropPhoto}
                            alt={listing.commodity}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80';
                            }}
                          />
                        </div>

                        {/* Details Area */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Seller Name & Title */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">{listing.sellerName}</span>
                            {listing.isVerified && (
                              <span className="w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" title="Kheti AI Verified">
                                ✓
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug truncate">
                            {listing.commodity}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">
                            {listing.variety || 'PBW-550'} • {listing.grade || 'Grade A'}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium truncate pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">
                              {listing.location.village ? `${listing.location.village}, ` : ''}
                              {listing.location.district ? `${listing.location.district}, ` : ''}
                              {listing.location.state || 'Haryana'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Full-width Metric Boxes Row - Clean vertical stack, zero overflow */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase tracking-wider truncate">
                            <span>📦</span>
                            <span className="truncate">Quantity</span>
                          </div>
                          <div className="mt-0.5 font-black text-stone-900 text-sm sm:text-base font-mono truncate">
                            {listing.quantity} <span className="text-xs font-semibold text-stone-600 font-sans">{listing.unit}</span>
                          </div>
                        </div>

                        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[10px] uppercase tracking-wider truncate">
                            <span>💰</span>
                            <span className="truncate">Asking Rate</span>
                          </div>
                          <div className="mt-0.5 font-black text-emerald-950 text-sm sm:text-base font-mono truncate">
                            ₹{listing.askingPrice.toLocaleString('en-IN')} <span className="text-xs font-medium text-emerald-800 font-sans">/ {listing.unit === 'Quintal' ? 'qtl' : listing.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Verified Quote Callout */}
                      <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl p-2 px-2.5 flex items-center gap-2 text-[11px] text-emerald-950 italic font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="line-clamp-1">"{listing.notes || 'Verified farm produce ready for inspection and prompt weighbridge checkout.'}"</span>
                      </div>
                    </div>

                    {/* Card Action Buttons Row */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-150">
                      <button
                        onClick={() => {
                          if (onOpenAIQuery) {
                            onOpenAIQuery(`What is a fair negotiation price for ${listing.commodity} listed at ₹${listing.askingPrice}?`);
                          }
                        }}
                        className="border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                      >
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Fair Price?</span>
                      </button>

                      {isOwner ? (
                        <button
                          onClick={() => setActiveTab('dashboard')}
                          className="bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                        >
                          <Tag className="w-4 h-4 text-amber-800" />
                          <span>Your Listing (Dashboard)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenOfferModal(listing)}
                          className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                        >
                          <span>Make Offer</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Negotiations & Agreed Orders Section */}
          {showNegotiationSection && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
              {/* Negotiation History */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-150">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Negotiation Workflow</span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">Active Offers &amp; Counteroffers</h3>
                  </div>
                  <span className="text-xs text-stone-700">{displayOffers.length} Conversations</span>
                </div>

                <div className="mt-4 space-y-3">
                  {displayOffers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
                      No active offers or counteroffers.
                    </div>
                  ) : (
                    displayOffers.map((offer) => (
                      <div key={offer.id} className="p-3.5 bg-stone-50 border border-stone-150 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{offer.commodity}</span>
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
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

                        <div className="p-2 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
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
                              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-xs transition-colors"
                            >
                              Accept Deal &amp; Create Order
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Agreed Orders & Escrow Tracking */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-150">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Commercial Transactions</span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">Agreed Orders &amp; Deliveries</h3>
                  </div>
                  <span className="text-xs text-stone-700">{displayOrders.length} Completed / In-progress</span>
                </div>

                <div className="mt-4 space-y-3">
                  {displayOrders.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
                      No agreed orders or active deliveries yet.
                    </div>
                  ) : (
                    displayOrders.map((ord) => (
                      <div key={ord.id} className="p-3.5 bg-stone-50 border border-stone-150 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span className="font-bold text-stone-900 font-mono">{ord.id}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Direct Negotiation</span>
                <h3 className="text-base font-bold text-stone-900">Make an Offer to {selectedListingForOffer.sellerName}</h3>
              </div>
              <button onClick={() => setShowNegotiationModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1">
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
                  className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Required Quantity ({selectedListingForOffer.unit})</label>
                <input
                  type="number"
                  value={offerQuantityInput}
                  onChange={(e) => setOfferQuantityInput(Number(e.target.value))}
                  className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Message or Pickup Preference (Optional)</label>
                <textarea
                  value={offerMessageInput}
                  onChange={(e) => setOfferMessageInput(e.target.value)}
                  placeholder="e.g. Can pick up in our own vehicle tomorrow morning. RTGS payment upon moisture test."
                  rows={2}
                  className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-950 flex items-center justify-between border border-emerald-200">
              <span>Total Estimated Value:</span>
              <span className="font-bold font-mono text-sm">₹{(offerPriceInput * offerQuantityInput).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowNegotiationModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOffer}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 rounded-2xl transition-colors shadow-xs"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Publish to Kheti AI's Marketplace</span>
                <h3 className="text-base font-bold text-stone-900">List Agricultural Produce on Kheti AI</h3>
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
                    className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700"
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
                    className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700"
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
                    className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700"
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
                    className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700 font-mono"
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
                    className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Quality &amp; Pickup Details</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Machine cleaned, sun dried, stored in safe warehouse in Karnal. Available for sample inspection."
                  rows={2}
                  className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl text-xs text-stone-700 flex items-center justify-between border border-stone-200">
                <span>Estimated Gross Order:</span>
                <span className="font-bold font-mono text-stone-900 text-sm">
                  ₹{(newQuantity * newAskingPrice).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setShowNewListingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingListing}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 rounded-2xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingListing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing on Kheti AI...</span>
                    </>
                  ) : (
                    <span>Publish on Kheti AI Marketplace</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
