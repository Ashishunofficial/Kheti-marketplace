import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Tractor, 
  X, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  CheckCircle2,
  Camera,
  Loader2,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { WarehouseFacility, EquipmentRental } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface AddServiceModalProps {
  onClose: () => void;
  onAddWarehouse: (data: Omit<WarehouseFacility, 'id' | 'ownerId' | 'ownerName'>) => void;
  onAddEquipment: (data: Omit<EquipmentRental, 'id' | 'ownerId' | 'ownerName'>) => void;
  currentUserName: string;
  currentUserPhone: string;
  defaultDistrict?: string;
  defaultState?: string;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  onClose,
  onAddWarehouse,
  onAddEquipment,
  currentUserName,
  currentUserPhone,
  defaultDistrict = 'Karnal',
  defaultState = 'Haryana'
}) => {
  const [listingCategory, setListingCategory] = useState<'warehouse' | 'machinery'>('warehouse');
  const [success, setSuccess] = useState<boolean>(false);

  // Warehouse Form State
  const [whName, setWhName] = useState('');
  const [whType, setWhType] = useState<WarehouseFacility['type']>('Dry Godown');
  const [whDistrict, setWhDistrict] = useState(defaultDistrict);
  const [whState, setWhState] = useState(defaultState);
  const [whTotalCapacityMT, setWhTotalCapacityMT] = useState<number>(3000);
  const [whAvailableCapacityMT, setWhAvailableCapacityMT] = useState<number>(1000);
  const [whRatePerBag, setWhRatePerBag] = useState<number>(8.0);
  const [whIsWdrc, setWhIsWdrc] = useState<boolean>(true);
  const [whPhone, setWhPhone] = useState(currentUserPhone);
  const [whAddress, setWhAddress] = useState('');

  // Equipment Form State
  const [eqTitle, setEqTitle] = useState('');
  const [eqCategory, setEqCategory] = useState<EquipmentRental['category']>('Tractor');
  const [eqDistrict, setEqDistrict] = useState(defaultDistrict);
  const [eqState, setEqState] = useState(defaultState);
  const [eqRatePerAcre, setEqRatePerAcre] = useState<string>('800');
  const [eqRatePerHour, setEqRatePerHour] = useState<string>('600');
  const [eqOperatorIncluded, setEqOperatorIncluded] = useState<boolean>(true);
  const [eqIsAvailableNow, setEqIsAvailableNow] = useState<boolean>(true);
  const [eqPhone, setEqPhone] = useState(currentUserPhone);
  const [eqModelYear, setEqModelYear] = useState('2024');

  // Image Upload & Auto-compression State
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionStats, setCompressionStats] = useState<{ originalKb: number; compressedKb: number } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // Automatically compress client-side without bothering the user
      const result = await compressImageFile(file, 900, 0.75);
      setImagePreviewUrl(result.dataUrl);
      setCompressionStats({
        originalKb: result.originalSizeKb,
        compressedKb: result.compressedSizeKb
      });
    } catch (err) {
      console.error('Auto image compression error:', err);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImagePreviewUrl(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim()) return;

    onAddWarehouse({
      name: whName.trim(),
      type: whType,
      district: whDistrict.trim(),
      state: whState.trim(),
      totalCapacityMT: Number(whTotalCapacityMT) || 1000,
      availableCapacityMT: Number(whAvailableCapacityMT) || 500,
      ratePerBagPerMonth: Number(whRatePerBag) || 8,
      isWdrcRegistered: whIsWdrc,
      contactPhone: whPhone.trim() || currentUserPhone,
      address: whAddress.trim() || undefined,
      imageUrl: imagePreviewUrl || undefined
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqTitle.trim()) return;

    onAddEquipment({
      title: eqTitle.trim(),
      category: eqCategory,
      district: eqDistrict.trim(),
      state: eqState.trim(),
      ratePerAcre: eqRatePerAcre ? Number(eqRatePerAcre) : undefined,
      ratePerHour: eqRatePerHour ? Number(eqRatePerHour) : undefined,
      operatorIncluded: eqOperatorIncluded,
      isAvailableNow: eqIsAvailableNow,
      contactPhone: eqPhone.trim() || currentUserPhone,
      modelYear: eqModelYear.trim() || undefined,
      imageUrl: imagePreviewUrl || undefined
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold leading-tight">
              List on Kheti AI's Marketplace (Storage & Machinery)
            </h3>
            <p className="text-xs text-emerald-100">
              Own a godown, cold store, tractor or vehicle? List on Kheti AI's marketplace to receive direct bookings from verified farmers & millers.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setListingCategory('warehouse')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              listingCategory === 'warehouse'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>List Godown / Storage Space (गोदाम / कोल्ड स्टोर)</span>
          </button>
          <button
            type="button"
            onClick={() => setListingCategory('machinery')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              listingCategory === 'machinery'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>List Farm Machinery / Vehicle (ट्रैक्टर / वाहन / मशीन)</span>
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">Listing Published Successfully!</h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Your service is now live in the directory and linked to your account. 
              You can track all incoming farmer bookings in your <strong>Provider Dashboard</strong>.
            </p>
          </div>
        ) : listingCategory === 'warehouse' ? (
          /* WAREHOUSE FORM */
          <form onSubmit={handleWarehouseSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Godown / Facility Name (गोदाम / स्टोरेज का नाम) *
              </label>
              <input
                type="text"
                required
                value={whName}
                onChange={(e) => setWhName(e.target.value)}
                placeholder="e.g. Kisan Sahakari Cold Storage & Dry Silos"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Storage Type (प्रकार)
                </label>
                <select
                  value={whType}
                  onChange={(e) => setWhType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="Dry Godown">Dry Godown (सूखा अनाज गोदाम)</option>
                  <option value="Cold Storage">Cold Storage (कोल्ड स्टोरेज - आलू/सब्जी)</option>
                  <option value="Silo">Steel Silo (वैज्ञानिक साइलो)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Monthly Rate per 50kg Bag (₹/बैग/माह) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={whRatePerBag}
                  onChange={(e) => setWhRatePerBag(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 7.5"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono font-semibold focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Total Capacity (MT)
                </label>
                <input
                  type="number"
                  required
                  value={whTotalCapacityMT}
                  onChange={(e) => setWhTotalCapacityMT(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Available Vacant Space (MT) *
                </label>
                <input
                  type="number"
                  required
                  value={whAvailableCapacityMT}
                  onChange={(e) => setWhAvailableCapacityMT(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono font-semibold text-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">District (जिला)</label>
                <input
                  type="text"
                  required
                  value={whDistrict}
                  onChange={(e) => setWhDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">State (राज्य)</label>
                <input
                  type="text"
                  required
                  value={whState}
                  onChange={(e) => setWhState(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Full Address / Landmark (स्थान का पूरा पता)
              </label>
              <input
                type="text"
                value={whAddress}
                onChange={(e) => setWhAddress(e.target.value)}
                placeholder="e.g. Near New Anaj Mandi Gate #2, Nilokheri"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={whPhone}
                  onChange={(e) => setWhPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whIsWdrc}
                    onChange={(e) => setWhIsWdrc(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                  />
                  <span className="font-semibold text-stone-800">WDRA Accredited (e-NWR)</span>
                </label>
              </div>
            </div>

            {/* Image Upload Field */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Facility / Godown Photo (फोटो अपलोड - ऑटो कम्प्रेस)
              </label>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageFileSelect}
                accept="image/*"
                className="hidden"
              />

              {imagePreviewUrl ? (
                <div className="relative p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={imagePreviewUrl} alt="Compressed preview" className="w-14 h-14 object-cover rounded-lg border border-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Photo Attached (कम्प्रेस फोटो तैयार)</span>
                      </div>
                      {compressionStats && (
                        <div className="text-[10px] text-emerald-800 font-mono font-medium mt-0.5">
                          Original: {compressionStats.originalKb} KB → <strong className="text-emerald-950 font-bold">{compressionStats.compressedKb} KB</strong> (Saved {Math.max(0, Math.round((1 - compressionStats.compressedKb / compressionStats.originalKb) * 100))}%)
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreviewUrl(null);
                      setCompressionStats(null);
                      if (imageInputRef.current) imageInputRef.current.value = '';
                    }}
                    className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors shrink-0"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-full py-3 px-4 border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/50 rounded-xl text-stone-600 hover:text-emerald-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-800">Auto-compressing photo...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold">+ Attach Godown Photo (Auto-Compressed)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-[11px] flex items-center justify-between">
              <span>Listing Owner: <strong>{currentUserName}</strong></span>
              <span className="text-emerald-800 font-semibold">100% User-Isolated Data</span>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Godown Listing</span>
              </button>
            </div>
          </form>
        ) : (
          /* MACHINERY / VEHICLE FORM */
          <form onSubmit={handleEquipmentSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Equipment / Vehicle Title (मशीन / वाहन का नाम) *
              </label>
              <input
                type="text"
                required
                value={eqTitle}
                onChange={(e) => setEqTitle(e.target.value)}
                placeholder="e.g. Mahindra 575 DI (45 HP) with Super Seeder"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category (श्रेणी)</label>
                <select
                  value={eqCategory}
                  onChange={(e) => setEqCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="Tractor">Tractor (ट्रैक्टर)</option>
                  <option value="Combine Harvester">Combine Harvester (कंबाइन हार्वेस्टर)</option>
                  <option value="Laser Leveler">Laser Land Leveler (लेजर लेवलर)</option>
                  <option value="Rotavator">Rotavator / Happy Seeder (सीडर/रोटावेटर)</option>
                  <option value="Drone Sprayer">Agricultural Drone Sprayer (कृषि ड्रोन)</option>
                  <option value="Vehicle / Transport">Vehicle / Mini-Truck (कृषि परिवहन वाहन)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Model Year (मॉडल वर्ष)</label>
                <input
                  type="text"
                  value={eqModelYear}
                  onChange={(e) => setEqModelYear(e.target.value)}
                  placeholder="2024"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Rate Per Acre (₹/एकड़)
                </label>
                <input
                  type="number"
                  value={eqRatePerAcre}
                  onChange={(e) => setEqRatePerAcre(e.target.value)}
                  placeholder="e.g. 850"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Rate Per Hour (₹/घंटा)
                </label>
                <input
                  type="number"
                  value={eqRatePerHour}
                  onChange={(e) => setEqRatePerHour(e.target.value)}
                  placeholder="e.g. 600"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">District (जिला)</label>
                <input
                  type="text"
                  required
                  value={eqDistrict}
                  onChange={(e) => setEqDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={eqPhone}
                  onChange={(e) => setEqPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eqOperatorIncluded}
                  onChange={(e) => setEqOperatorIncluded(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-semibold text-stone-800">Driver & Fuel Included</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eqIsAvailableNow}
                  onChange={(e) => setEqIsAvailableNow(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-semibold text-stone-800">Available Immediately</span>
              </label>
            </div>

            {/* Image Upload Field */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Equipment / Vehicle Photo (फोटो अपलोड - ऑटो कम्प्रेस)
              </label>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageFileSelect}
                accept="image/*"
                className="hidden"
              />

              {imagePreviewUrl ? (
                <div className="relative p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={imagePreviewUrl} alt="Compressed preview" className="w-14 h-14 object-cover rounded-lg border border-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Photo Attached (कम्प्रेस फोटो तैयार)</span>
                      </div>
                      {compressionStats && (
                        <div className="text-[10px] text-emerald-800 font-mono font-medium mt-0.5">
                          Original: {compressionStats.originalKb} KB → <strong className="text-emerald-950 font-bold">{compressionStats.compressedKb} KB</strong> (Saved {Math.max(0, Math.round((1 - compressionStats.compressedKb / compressionStats.originalKb) * 100))}%)
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreviewUrl(null);
                      setCompressionStats(null);
                      if (imageInputRef.current) imageInputRef.current.value = '';
                    }}
                    className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors shrink-0"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-full py-3 px-4 border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/50 rounded-xl text-stone-600 hover:text-emerald-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-800">Auto-compressing photo...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold">+ Attach Machinery Photo (Auto-Compressed)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-[11px] flex items-center justify-between">
              <span>Listing Owner: <strong>{currentUserName}</strong></span>
              <span className="text-emerald-800 font-semibold">Track bookings in your Dashboard</span>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Machinery Listing</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
