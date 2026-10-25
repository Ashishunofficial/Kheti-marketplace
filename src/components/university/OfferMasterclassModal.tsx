import React, { useState } from 'react';
import { X, GraduationCap, Calendar, Clock, DollarSign, Users, Award } from 'lucide-react';
import { UniversityMasterclass } from '../../types';

interface OfferMasterclassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<UniversityMasterclass, 'id' | 'enrolledCount' | 'status'>) => Promise<any>;
}

export const OfferMasterclassModal: React.FC<OfferMasterclassModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [instructorName, setInstructorName] = useState('Dr. Virender Kumar');
  const [instructorTitle, setInstructorTitle] = useState('Principal Agronomist & Extension Lead');
  const [university, setUniversity] = useState('Punjab Agricultural University (PAU), Ludhiana');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('30 Oct 2026, 02:00 PM IST');
  const [durationHours, setDurationHours] = useState(2.5);
  const [fee, setFee] = useState(0);
  const [maxSeats, setMaxSeats] = useState(60);
  const [mode, setMode] = useState<'online_interactive' | 'on_farm_demonstration'>('online_interactive');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        instructorName,
        instructorTitle,
        university,
        topic,
        description,
        scheduledDate,
        durationHours: Number(durationHours),
        fee: Number(fee),
        maxSeats: Number(maxSeats),
        mode
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
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Academic Portal</span>
              <h3 className="text-base font-bold text-stone-900">Offer University Masterclass</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Professor / Scientist Name</label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Designation & Department</label>
              <input
                type="text"
                value={instructorTitle}
                onChange={(e) => setInstructorTitle(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">University / Research Institution</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="e.g. Punjab Agricultural University (PAU), Ludhiana"
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Masterclass Topic / Title</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Sub-surface Salinity Reclamation & Precision Micro-Drip Scheduling"
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Course Curriculum & Learning Outcomes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation of what farmers and agriculture students will learn from this session..."
              rows={3}
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Scheduled Date & Time</label>
              <input
                type="text"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                placeholder="e.g. 30 Oct 2026, 02:00 PM IST"
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Duration (Hours)</label>
              <input
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                min={0.5}
                step={0.5}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Fee (₹, 0 = Free)</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                min={0}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Max Student Seats</label>
              <input
                type="number"
                value={maxSeats}
                onChange={(e) => setMaxSeats(Number(e.target.value))}
                min={5}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Delivery Format</label>
              <select
                value={mode}
                onChange={(e: any) => setMode(e.target.value)}
                className="w-full py-2 px-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              >
                <option value="online_interactive">Online Live (Web)</option>
                <option value="on_farm_demonstration">On-Farm Demonstration</option>
              </select>
            </div>
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
              className="px-4 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-xs"
            >
              {submitting ? 'Publishing...' : 'Publish Masterclass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
