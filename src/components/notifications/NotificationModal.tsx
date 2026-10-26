import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag,
  ExternalLink,
  PlusCircle,
  Building2
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { AppNotification } from '../../types';

interface NotificationModalProps {
  onNavigateTab: (tab: string) => void;
  lang?: 'hi' | 'en' | 'hinglish';
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onNavigateTab, lang = 'hi' }) => {
  const { 
    notifications, 
    unreadCount, 
    isNotificationOpen, 
    setIsNotificationOpen, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    simulateOfferNotification 
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'offers' | 'alerts'>('all');

  if (!isNotificationOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'offers') {
      return n.type === 'offer_received' || n.type === 'offer_accepted' || n.type === 'offer_countered';
    }
    if (activeFilter === 'alerts') {
      return n.type === 'system_alert' || n.type === 'service_booking';
    }
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.linkTab) {
      onNavigateTab(notif.linkTab);
      setIsNotificationOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={() => setIsNotificationOpen(false)} 
      />

      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 relative shadow-inner">
              <Bell className="w-5 h-5 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-black flex items-center justify-center text-white border-2 border-emerald-950">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-2">
                <span>{lang === 'hi' ? 'सूचनाएं एवं व्यापार अलर्ट' : 'Notifications & Trade Alerts'}</span>
              </h2>
              <p className="text-[11px] text-emerald-200 font-medium">
                {unreadCount > 0 
                  ? `${unreadCount} ${lang === 'hi' ? 'नए अनपढ़े अलर्ट' : 'new unread notifications'}` 
                  : (lang === 'hi' ? 'सभी सूचनाएं अद्यतित हैं' : 'All caught up')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'सभी पढ़ा हुआ' : 'Mark all read'}</span>
              </button>
            )}

            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-emerald-900 text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              {lang === 'hi' ? 'सभी सूचनाएं' : 'All'} ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('offers')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'offers'
                  ? 'bg-emerald-900 text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              <span>🌾</span>
              <span>{lang === 'hi' ? 'ऑफर व सौदे' : 'Offers & Deals'}</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md font-mono">
                {notifications.filter(n => n.type === 'offer_received' || n.type === 'offer_accepted' || n.type === 'offer_countered').length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('alerts')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'alerts'
                  ? 'bg-emerald-900 text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              {lang === 'hi' ? 'योजना व अलर्ट' : 'Alerts & Schemes'}
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto text-2xl border border-emerald-100">
                🔔
              </div>
              <h3 className="text-sm font-bold text-stone-900">
                {lang === 'hi' ? 'कोई नई सूचना नहीं है' : 'No notifications found'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {lang === 'hi' 
                  ? 'जब भी कोई खरीदार आपको नया ऑफर देगा या आपका ऑफर स्वीकार होगा, सूचना यहाँ दिखाई देगी।' 
                  : 'You will receive updates here whenever a trade offer is submitted or accepted.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isOfferReceived = notif.type === 'offer_received';
              const isOfferAccepted = notif.type === 'offer_accepted';
              const isOfferCountered = notif.type === 'offer_countered';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all relative ${
                    !notif.isRead 
                      ? 'bg-emerald-50/40 border-emerald-300/80 shadow-2xs' 
                      : 'bg-white border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon Box */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs ${
                      isOfferAccepted 
                        ? 'bg-emerald-600 text-white' 
                        : isOfferReceived 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : isOfferCountered
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-stone-100 text-stone-700'
                    }`}>
                      {isOfferAccepted ? '✓' : isOfferReceived ? '🌾' : isOfferCountered ? '🔄' : '📢'}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 pr-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isOfferAccepted 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                            : isOfferReceived 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-stone-100 text-stone-800'
                        }`}>
                          {isOfferAccepted 
                            ? (lang === 'hi' ? 'सौदा स्वीकार हुआ' : 'DEAL ACCEPTED') 
                            : isOfferReceived 
                              ? (lang === 'hi' ? 'नया ऑफर प्राप्त' : 'NEW OFFER') 
                              : (lang === 'hi' ? 'काउंटर ऑफर' : 'COUNTER OFFER')}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">·</span>
                        <span className="text-[11px] text-stone-500 font-medium">{notif.timestamp}</span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                        {lang === 'hi' ? notif.titleHi || notif.title : notif.title}
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {lang === 'hi' ? notif.messageHi || notif.message : notif.message}
                      </p>

                      {/* Trade Offer Highlights Strip */}
                      {(notif.price || notif.quantity || notif.commodity) && (
                        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {notif.commodity && (
                            <div>
                              <span className="text-[10px] text-stone-500 block">{lang === 'hi' ? 'फसल' : 'Commodity'}</span>
                              <span className="font-extrabold text-stone-900 truncate block">{notif.commodity}</span>
                            </div>
                          )}

                          {notif.price && (
                            <div>
                              <span className="text-[10px] text-stone-500 block">{lang === 'hi' ? 'दर (Rate)' : 'Offered Rate'}</span>
                              <span className="font-black text-emerald-900 font-mono">
                                ₹{notif.price.toLocaleString('en-IN')}/{notif.unit ? notif.unit.substring(0, 3) : 'qtl'}
                              </span>
                            </div>
                          )}

                          {notif.quantity && (
                            <div>
                              <span className="text-[10px] text-stone-500 block">{lang === 'hi' ? 'मात्रा' : 'Quantity'}</span>
                              <span className="font-extrabold text-stone-900 font-mono">
                                {notif.quantity} {notif.unit || 'Qtl'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => handleNotificationClick(notif)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950 underline hover:no-underline cursor-pointer transition-colors"
                        >
                          <span>{isOfferAccepted ? (lang === 'hi' ? 'ऑर्डर व एस्क्रो स्थिति देखें' : 'View Order & Escrow') : (lang === 'hi' ? 'मार्केटप्लेस में ऑफर देखें' : 'Review in Marketplace')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 px-2 py-0.5 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            {lang === 'hi' ? 'पढ़ा हुआ चिन्हित करें' : 'Mark as read'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Simulation Tools for Testing */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-600 hidden sm:inline">
              {lang === 'hi' ? 'परीक्षण:' : 'Test Live Offers:'}
            </span>
            <button
              onClick={() => simulateOfferNotification('offer_received')}
              className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>+</span>
              <span>{lang === 'hi' ? 'नया ऑफर सिम्युलेट करें' : 'Simulate New Offer'}</span>
            </button>
            <button
              onClick={() => simulateOfferNotification('offer_accepted')}
              className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>✓</span>
              <span>{lang === 'hi' ? 'सौदा स्वीकार सिम्युलेट करें' : 'Simulate Accepted Offer'}</span>
            </button>
          </div>

          <button
            onClick={() => setIsNotificationOpen(false)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 rounded-xl transition-colors shadow-2xs cursor-pointer ml-auto"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
