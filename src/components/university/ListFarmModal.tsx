import React, { useState } from 'react';
import { X, Sprout, MapPin, Calendar, Award, CheckCircle } from 'lucide-react';
import { FarmInternship, UserProfile } from '../../types';

interface ListFarmModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (data: Omit<FarmInternship, 'id' | 'appliedCount' | 'status' | 'createdAt'>) => Promise<any>;
}

export const ListFarmModal: React.FC<ListFarmModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [farmName, setFarmName] = useState(`${currentUser.name}'s Practical Agro Estate`);
  const [village, setVillage] = useState(currentUser.village || 'Nilokheri');
  const [district, setDistrict] = useState(currentUser.district || 'Karnal');
  const [state, setState] = useState(currentUser.state || 'Haryana');
  const [cropFocus, setCropFocus] = useState('Basmati Paddy, Sharbati Wheat, Mustard');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [stipendMonthly, setStipendMonthly] = useState(6000);
  const [accommodationProvided, setAccommodationProvided] = useState(true);
  const [learningOutcomes, setLearningOutcomes] = useState(
    'Direct soil moisture measurement, Happy Seeder calibration in standing residue, cow dung bio-fermentation formulations'
  );
  const [availableSlots, setAvailableSlots] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        farmName,
        village,
        district,
        state,
        cropFocus: cropFocus.split(',').map(s => s.trim()).filter(Boolean),
        durationWeeks: Number(durationWeeks),
        stipendMonthly: Number(stipendMonthly),
        accommodationProvided,
        learningOutcomes: learningOutcomes.split(',').map(s => s.trim()).filter(Boolean),
        availableSlots: Number(availableSlots)
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Farmer Mentorship</span>
              <h3 className="text-base font-bold text-stone-900">List Your Farm for Student Internships</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Farm / Estate Name</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Kisan Seva Natural Farm (20 Acres)"
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Village</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Crops Cultivated (Comma separated)</label>
            <input
              type="text"
              value={cropFocus}
              onChange={(e) => setCropFocus(e.target.value)}
              placeholder="e.g. Basmati Paddy, Sharbati Wheat, Mustard"
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Duration (Weeks)</label>
              <input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                min={1}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Monthly Stipend (₹)</label>
              <input
                type="number"
                value={stipendMonthly}
                onChange={(e) => setStipendMonthly(Number(e.target.value))}
                min={0}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Available Slots</label>
              <input
                type="number"
                value={availableSlots}
                onChange={(e) => setAvailableSlots(Number(e.target.value))}
                min={1}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="accCheck"
              checked={accommodationProvided}
              onChange={(e) => setAccommodationProvided(e.target.checked)}
              className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
            />
            <label htmlFor="accCheck" className="text-xs text-stone-800 font-medium">
              Lodging and meal facilities provided on the farm for students
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Learning Outcomes for Students (Comma separated)</label>
            <textarea
              value={learningOutcomes}
              onChange={(e) => setLearningOutcomes(e.target.value)}
              rows={3}
              placeholder="e.g. Direct farm machine operation, drip flushing, soil testing, market negotiation"
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-150">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
            >
              {submitting ? 'Listing Farm...' : 'Publish Farm for Internships'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
