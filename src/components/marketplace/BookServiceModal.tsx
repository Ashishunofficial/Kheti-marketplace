import React, { useState } from 'react';
import { 
  Building2, 
  Tractor, 
  Calendar, 
  X, 
  CheckCircle2, 
  Send, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { WarehouseFacility, EquipmentRental } from '../../types';

interface BookServiceModalProps {
  service: WarehouseFacility | EquipmentRental | null;
  serviceType: 'warehouse' | 'equipment';
  onClose: () => void;
  onSubmitBooking: (
    bookingData: {
      serviceId: string;
      serviceType: 'warehouse' | 'equipment' | 'logistics';
      serviceTitle: string;
      ownerId: string;
      ownerName: string;
      ownerPhone?: string;
      startDate: string;
      endDate?: string;
      quantityRequested: number;
      unit: string;
      totalEstimatedAmount: number;
      notes?: string;
    },
    initialMessageText?: string
  ) => void;
  currentUserName: string;
  currentUserPhone: string;
}

export const BookServiceModal: React.FC<BookServiceModalProps> = ({
  service,
  serviceType,
  onClose,
  onSubmitBooking,
  currentUserName,
  currentUserPhone
}) => {
  if (!service) return null;

  const isWarehouse = serviceType === 'warehouse';
  const wh = isWarehouse ? (service as WarehouseFacility) : null;
  const eq = !isWarehouse ? (service as EquipmentRental) : null;

  const title = wh ? wh.name : eq?.title || 'Service';
  const ownerName = wh ? wh.ownerName : eq?.ownerName || 'Owner';
  const ownerId = service.ownerId || 'usr_provider_default';
  const contactPhone = wh?.contactPhone || eq?.contactPhone || '+91 98124 55432';

  // Form State
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [durationMonths, setDurationMonths] = useState<number>(2); // for warehouse
  const [durationDaysOrHours, setDurationDaysOrHours] = useState<number>(1); // for equipment
  const [quantity, setQuantity] = useState<number>(isWarehouse ? 200 : 5);
  const [rateMode, setRateMode] = useState<'acre' | 'hour'>(eq?.ratePerAcre ? 'acre' : 'hour');
  const [notes, setNotes] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingDone, setBookingDone] = useState<boolean>(false);

  // Compute Total Estimated Amount
  let estimatedTotal = 0;
  let unitLabel = '';

  if (isWarehouse && wh) {
    unitLabel = 'bags (50kg)';
    // Bags * rate/bag/month * months
    estimatedTotal = Math.round(quantity * (wh.ratePerBagPerMonth || 8) * durationMonths);
  } else if (eq) {
    if (rateMode === 'acre' && eq.ratePerAcre) {
      unitLabel = 'acres';
      estimatedTotal = Math.round(quantity * eq.ratePerAcre);
    } else if (eq.ratePerHour) {
      unitLabel = 'hours';
      estimatedTotal = Math.round(quantity * eq.ratePerHour);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const endDate = new Date(startDate);
    if (isWarehouse) {
      endDate.setMonth(endDate.getMonth() + durationMonths);
    } else {
      endDate.setDate(endDate.getDate() + durationDaysOrHours);
    }

    const defaultMsg = isWarehouse
      ? `नमस्ते! मुझे आपके गोदाम "${title}" में ${quantity} बैग सुरक्षित भंडारण हेतु ${startDate} से ${durationMonths} माह के लिए स्पेस चाहिए। कृपया पुष्टि करें।`
      : `नमस्ते! मुझे आपके "${title}" की ${quantity} ${unitLabel} के लिए ${startDate} को आवश्यकता है। कृपया उपलब्धता व समय बताएं।`;

    onSubmitBooking(
      {
        serviceId: service.id,
        serviceType,
        serviceTitle: title,
        ownerId,
        ownerName,
        ownerPhone: contactPhone,
        startDate,
        endDate: endDate.toISOString().split('T')[0],
        quantityRequested: quantity,
        unit: unitLabel,
        totalEstimatedAmount: estimatedTotal,
        notes: notes.trim() || undefined
      },
      messageText.trim() || defaultMsg
    );

    setIsSubmitting(false);
    setBookingDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/60 rounded-lg">
              {isWarehouse ? <Building2 className="w-5 h-5 text-emerald-200" /> : <Tractor className="w-5 h-5 text-emerald-200" />}
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {isWarehouse ? 'Reserve Godown Storage Space' : 'Book Farm Machinery / Equipment'}
              </h3>
              <p className="text-xs text-emerald-100">
                Direct booking with space owner · Zero broker commission
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingDone ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-stone-900">Booking Request Sent Successfully!</h4>
              <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                Your request and direct message have been forwarded to <strong>{ownerName}</strong>. 
                They can now view your booking in their Provider Dashboard and reply via the Message Portal.
              </p>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1 font-mono text-left max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-500">Service:</span>
                <span className="font-semibold text-stone-800">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Reserved For:</span>
                <span className="font-semibold text-stone-800">{quantity} {unitLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Est. Total Amount:</span>
                <span className="font-bold text-emerald-800">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
              >
                Close & View in Messages
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Service Summary Card */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{title}</h4>
                  <div className="text-stone-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{service.district}, {service.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-800 block">
                    {isWarehouse && wh ? `₹${wh.ratePerBagPerMonth}/bag/mo` : ''}
                    {!isWarehouse && eq ? (eq.ratePerAcre ? `₹${eq.ratePerAcre}/acre` : `₹${eq.ratePerHour}/hr`) : ''}
                  </span>
                  <span className="text-[10px] text-stone-500">Direct tariff</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-stone-600">
                <span>Owner: <strong>{ownerName}</strong></span>
                <span className="font-mono">{contactPhone}</span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Start Date (आरंभ तिथि)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                  />
                </div>
              </div>

              {isWarehouse ? (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Duration (भंडारण अवधि)
                  </label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value={1}>1 Month (1 माह)</option>
                    <option value={2}>2 Months (2 माह)</option>
                    <option value={3}>3 Months (3 माह)</option>
                    <option value={6}>6 Months (6 माह - Half-Year)</option>
                    <option value={12}>12 Months (1 वर्ष - Annual)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Booking Basis
                  </label>
                  {eq?.ratePerAcre && eq?.ratePerHour ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRateMode('acre')}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                          rateMode === 'acre' ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        Per Acre (₹{eq.ratePerAcre})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRateMode('hour')}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                          rateMode === 'hour' ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        Per Hour (₹{eq.ratePerHour})
                      </button>
                    </div>
                  ) : (
                    <div className="py-2 text-stone-700 font-medium">
                      {rateMode === 'acre' ? `Per Acre (₹${eq?.ratePerAcre}/acre)` : `Per Hour (₹${eq?.ratePerHour}/hr)`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-stone-700">
                  {isWarehouse ? 'Storage Quantity (बैग संख्या - 50 kg)' : (rateMode === 'acre' ? 'Field Area (एकड़ संख्या)' : 'Estimated Duration (घंटे)')}
                </label>
                {isWarehouse && wh && (
                  <span className="text-[11px] text-stone-500">
                    Max Available: <strong>{wh.availableCapacityMT.toLocaleString('en-IN')} MT</strong> (~{(wh.availableCapacityMT * 20).toLocaleString('en-IN')} bags)
                  </span>
                )}
              </div>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono font-semibold focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Renter Contact Info */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-500 block">Your Name:</span>
                <strong className="text-stone-900">{currentUserName}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Your Phone:</span>
                <strong className="text-stone-900 font-mono">{currentUserPhone}</strong>
              </div>
            </div>

            {/* Direct Message to Owner */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Direct Message to Space/Equipment Owner (मालिक को संदेश / प्रश्न)
              </label>
              <textarea
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={isWarehouse ? "e.g. 200 बैग बासमती धान के लिए स्पेस चाहिए, क्या अनलोडिंग लेबर मिलेगी?" : "e.g. 5 एकड़ खेत में पराली जुताई करनी है, क्या शुक्रवार सुबह उपलब्ध होगा?"}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Realtime Estimate Callout */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-900 font-medium">Estimated Booking Tariff (अनुमानित किराया)</div>
                <div className="text-lg font-bold font-mono text-emerald-900">
                  ₹{estimatedTotal.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-[10px] text-emerald-700 text-right">
                <div>Escrow Protected</div>
                <div>Pay after owner acceptance</div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send Booking Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
