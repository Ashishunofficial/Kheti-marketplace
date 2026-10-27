import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Building2, 
  Tractor, 
  User, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Search,
  Sparkles,
  Inbox
} from 'lucide-react';
import { ServiceMessage, ServiceBooking } from '../../types';

function parseTimestamp(ts?: string | number): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.getTime();
  return 0;
}

function formatMessageTime(ts?: string | number): string {
  if (!ts) return 'Just now';
  if (typeof ts === 'string') {
    const trimmed = ts.trim();
    if (/^\d{1,2}:\d{2}(\s*(AM|PM|am|pm))?$/i.test(trimmed)) {
      return trimmed;
    }
  }
  const d = new Date(ts);
  if (isNaN(d.getTime())) {
    if (typeof ts === 'string' && (ts.includes(':') || ts.includes('ago') || ts.includes('Just'))) {
      return ts;
    }
    return 'Just now';
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface ServiceMessagePortalProps {
  currentUserId: string;
  currentUserName: string;
  messages: ServiceMessage[];
  bookings: ServiceBooking[];
  onSendMessage: (
    recipientId: string,
    recipientName: string,
    serviceId: string,
    serviceTitle: string,
    text: string,
    bookingId?: string
  ) => void;
  onUpdateBookingStatus: (bookingId: string, status: ServiceBooking['status']) => void;
  onMarkAsRead: (otherUserId: string, serviceId?: string) => void;
  initialSelectedUserId?: string;
  initialSelectedServiceId?: string;
}

export const ServiceMessagePortal: React.FC<ServiceMessagePortalProps> = ({
  currentUserId,
  currentUserName,
  messages,
  bookings,
  onSendMessage,
  onUpdateBookingStatus,
  onMarkAsRead,
  initialSelectedUserId,
  initialSelectedServiceId
}) => {
  const [inputText, setInputText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'owner' | 'renter'>('all');
  const [acceptedBookingIds, setAcceptedBookingIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages into distinct conversations (by otherUserId + serviceId)
  interface ConversationSummary {
    key: string;
    otherUserId: string;
    otherUserName: string;
    serviceId: string;
    serviceTitle: string;
    lastMessage: ServiceMessage;
    unreadCount: number;
    associatedBooking?: ServiceBooking;
    isAsOwner: boolean; // Am I the owner of this service?
  }

  const conversationMap = new Map<string, ConversationSummary>();

  // Process all messages in order to find newest per thread
  [...messages].sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp)).forEach(m => {
    const isSender = m.senderId === currentUserId;
    const otherUserId = isSender ? m.recipientId : m.senderId;
    const otherUserName = isSender ? m.recipientName : m.senderName;
    const key = `${otherUserId}_${m.serviceId}`;

    const associatedBooking = bookings.find(b => 
      b.serviceId === m.serviceId && 
      (b.renterId === otherUserId || b.ownerId === otherUserId)
    );

    const isAsOwner = associatedBooking ? associatedBooking.ownerId === currentUserId : false;

    const existing = conversationMap.get(key);
    const unreadInc = (!isSender && !m.isRead) ? 1 : 0;

    if (!existing) {
      conversationMap.set(key, {
        key,
        otherUserId,
        otherUserName,
        serviceId: m.serviceId,
        serviceTitle: m.serviceTitle,
        lastMessage: m,
        unreadCount: unreadInc,
        associatedBooking,
        isAsOwner
      });
    } else {
      existing.lastMessage = m;
      existing.unreadCount += unreadInc;
    }
  });

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => parseTimestamp(b.lastMessage.timestamp) - parseTimestamp(a.lastMessage.timestamp)
  );

  // Active Selected Conversation
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (initialSelectedUserId && initialSelectedServiceId) {
      const match = `${initialSelectedUserId}_${initialSelectedServiceId}`;
      if (conversationMap.has(match)) return match;
    }
    return conversations[0]?.key || '';
  });

  // Keep selected valid if conversations update
  useEffect(() => {
    if (initialSelectedUserId && initialSelectedServiceId) {
      const target = `${initialSelectedUserId}_${initialSelectedServiceId}`;
      if (conversationMap.has(target)) {
        setSelectedKey(target);
        return;
      }
    }
    if (!selectedKey && conversations.length > 0) {
      setSelectedKey(conversations[0].key);
    }
  }, [conversations.length, initialSelectedUserId, initialSelectedServiceId]);

  const activeConversation = conversations.find(c => c.key === selectedKey) || conversations[0];

  // Mark conversation as read when selected
  useEffect(() => {
    if (activeConversation) {
      onMarkAsRead(activeConversation.otherUserId, activeConversation.serviceId);
    }
  }, [selectedKey, onMarkAsRead]);

  // Messages in active conversation
  const activeMessages = activeConversation
    ? messages
        .filter(m => 
          m.serviceId === activeConversation.serviceId &&
          ((m.senderId === currentUserId && m.recipientId === activeConversation.otherUserId) ||
           (m.senderId === activeConversation.otherUserId && m.recipientId === currentUserId))
        )
        .sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp))
    : [];

  // Check if this thread has an accepted offer
  const isThreadConfirmed = 
    activeConversation?.associatedBooking?.status === 'confirmed' ||
    (activeConversation?.associatedBooking?.id ? acceptedBookingIds.has(activeConversation.associatedBooking.id) : false) ||
    (activeConversation?.serviceId ? acceptedBookingIds.has(activeConversation.serviceId) : false) ||
    activeMessages.some(m => m.text.includes('[BOOKING_ACCEPTED]') || m.text.includes('[OFFER_ACCEPTED]'));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    onSendMessage(
      activeConversation.otherUserId,
      activeConversation.otherUserName,
      activeConversation.serviceId,
      activeConversation.serviceTitle,
      inputText.trim(),
      activeConversation.associatedBooking?.id
    );

    setInputText('');
  };

  const quickReplies = [
    'हाँ, स्पेस उपलब्ध है (Yes, space is vacant and sanitized).',
    'अनलोडिंग और लेबर सुबह 9:00 बजे से तैयार रहेगी।',
    'कृषि वाहन / मशीन पूरी तरह से चालू स्थिति में है।',
    'कृपया फसल का प्रकार और अनुमानित ट्रक आगमन समय बताएं।'
  ];

  const filteredConversations = conversations.filter(c => {
    if (filterMode === 'owner') return c.isAsOwner;
    if (filterMode === 'renter') return !c.isAsOwner;
    return true;
  });

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Kheti AI Service Message Portal</span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-0.5">
            Space & Machinery Inquiries & Negotiation Chat
          </h2>
          <p className="text-xs text-stone-500">
            Real-time bilateral messaging between space owners, vehicle operators, and farmers.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Threads ({conversations.length})
          </button>
          <button
            onClick={() => setFilterMode('owner')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              filterMode === 'owner' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Received as Owner
          </button>
          <button
            onClick={() => setFilterMode('renter')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              filterMode === 'renter' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sent as Renter
          </button>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <Inbox className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">No active messages yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When a farmer reserves your godown or machinery, or when you book a service, 
            the conversation and booking status will appear right here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px] lg:h-[calc(100vh-230px)] max-h-[850px]">
          {/* Left Column: Conversations List */}
          <div className="md:col-span-4 border-r border-stone-200 overflow-y-auto divide-y divide-stone-100 bg-stone-50/50">
            {filteredConversations.map(conv => {
              const isSelected = conv.key === activeConversation?.key;
              const booking = conv.associatedBooking;
              const hasConfirmedMsg = messages.some(
                m => m.serviceId === conv.serviceId && (m.senderId === conv.otherUserId || m.recipientId === conv.otherUserId) &&
                (m.text.includes('[BOOKING_ACCEPTED]') || m.text.includes('[OFFER_ACCEPTED]'))
              );
              const isConfirmed = booking?.status === 'confirmed' || hasConfirmedMsg;

              return (
                <button
                  key={conv.key}
                  onClick={() => setSelectedKey(conv.key)}
                  className={`w-full text-left p-4 transition-colors relative flex flex-col gap-1.5 cursor-pointer ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-800' : 'hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                      <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="truncate max-w-[160px]">{conv.otherUserName}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {formatMessageTime(conv.lastMessage.timestamp)}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-800 truncate">
                    {conv.serviceTitle}
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-1">
                    {conv.lastMessage.text.replace(/\[BOOKING_ACCEPTED\]|\[OFFER_ACCEPTED\]/g, '')}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      conv.isAsOwner ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {conv.isAsOwner ? 'Role: You are Owner' : 'Role: You are Renter'}
                    </span>

                    {(booking || isConfirmed) && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isConfirmed ? 'confirmed' : 'pending'}
                      </span>
                    )}

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Conversation Stream */}
          <div className="md:col-span-8 flex flex-col bg-white h-full overflow-hidden">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{activeConversation.otherUserName}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        activeConversation.isAsOwner ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {activeConversation.isAsOwner ? 'Client / Farmer' : 'Space / Machine Owner'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 mt-0.5">
                      Regarding: <strong className="text-stone-800">{activeConversation.serviceTitle}</strong>
                    </div>
                  </div>

                  {/* Booking Status / Action */}
                  {activeConversation.associatedBooking && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="text-[11px] leading-tight text-right">
                        <div className="text-stone-500">
                          {activeConversation.associatedBooking.quantityRequested} {activeConversation.associatedBooking.unit}
                        </div>
                        <div className="font-bold text-emerald-800 font-mono">
                          ₹{activeConversation.associatedBooking.totalEstimatedAmount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {activeConversation.isAsOwner && !isThreadConfirmed && (
                        <button
                          onClick={() => {
                            const bId = activeConversation.associatedBooking?.id || activeConversation.serviceId;
                            setAcceptedBookingIds(prev => new Set([...prev, bId, activeConversation.serviceId]));
                            onUpdateBookingStatus(bId, 'confirmed');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                      )}

                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                        isThreadConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isThreadConfirmed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>CONFIRMED</span>
                          </>
                        ) : (
                          'PENDING'
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message Bubbles Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/20">
                  {activeMessages.map(m => {
                    const isMe = m.senderId === currentUserId;
                    const isConfirmedAnnouncement = m.text.includes('[BOOKING_ACCEPTED]') || m.text.includes('[OFFER_ACCEPTED]');

                    if (isConfirmedAnnouncement) {
                      return (
                        <div key={m.id} className="w-full my-2 flex justify-center">
                          <div className="max-w-md w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-3.5 shadow-xs text-center space-y-1">
                            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wider bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>ऑफर स्वीकार - सौदा पक्का (Deal Confirmed)</span>
                            </div>
                            <p className="text-xs font-medium text-emerald-950 leading-relaxed">
                              {m.text.replace(/\[BOOKING_ACCEPTED\]|\[OFFER_ACCEPTED\]/g, '').trim()}
                            </p>
                            <div className="text-[10px] text-emerald-700/80 font-mono">
                              {formatMessageTime(m.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-stone-400 mb-0.5 px-1 font-medium">
                          {isMe ? 'You' : m.senderName}
                        </div>
                        <div
                          className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-800 text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          {m.text}
                        </div>
                        <div className="text-[9px] text-stone-400 mt-1 font-mono px-1">
                          {formatMessageTime(m.timestamp)}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Chips */}
                <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
                  <span className="text-stone-400 flex items-center gap-1 shrink-0 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Quick:</span>
                  </span>
                  {quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(qr)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 rounded-full shrink-0 transition-colors cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))}
                </div>

                {/* Message Input Bar */}
                <form onSubmit={handleSend} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="संदेश लिखें (Type direct message to farmer/owner)..."
                    className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="p-10 text-center text-stone-400 text-xs my-auto">
                Select a conversation on the left to begin messaging.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
