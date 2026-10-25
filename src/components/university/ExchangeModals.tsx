/**
 * ExchangeModals — Coordinate & New Proposal Modals
 * Extracted from UniversityConnectView.tsx
 */
import React from 'react';
import {
  X, GraduationCap, Sprout, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { BilateralExchange, ExchangeType } from './UniversityConnectView';

// ─── Coordinate Modal ──────────────────────────────────────────────────────────
interface CoordinateModalProps {
  isOpen: boolean;
  exchange: BilateralExchange | null;
  coordDates: string;
  coordHeadcount: string;
  coordMessage: string;
  onChangeDates: (v: string) => void;
  onChangeHeadcount: (v: string) => void;
  onChangeMessage: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const CoordinateModal: React.FC<CoordinateModalProps> = ({
  isOpen, exchange,
  coordDates, coordHeadcount, coordMessage,
  onChangeDates, onChangeHeadcount, onChangeMessage,
  onClose, onConfirm
}) => (
  <AnimatePresence>
    {isOpen && exchange && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                🤝
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Bilateral Coordination Proposal</h3>
                <div className="text-xs text-stone-600">With {exchange.proposerName}</div>
              </div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Exchange Overview */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1.5">
            <span className="font-bold text-stone-900 block">{exchange.title}</span>
            <div className="text-stone-600">{exchange.proposerInstitutionOrVillage}</div>
            <div className="flex items-center justify-between pt-1 border-t border-stone-200 font-mono">
              <span className="text-stone-500">Honorarium / Stipend:</span>
              <span className="font-bold text-emerald-800">{exchange.honorariumOrStipend}</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Proposed Dates / Schedule:</label>
              <input
                type="text"
                value={coordDates}
                onChange={e => onChangeDates(e.target.value)}
                placeholder="e.g., 12–14 Nov 2026"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Expected Attendees / Batch Size:</label>
              <input
                type="text"
                value={coordHeadcount}
                onChange={e => onChangeHeadcount(e.target.value)}
                placeholder="e.g., 20 Students or 1 Visiting Farmer"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Coordination Note & Specific Field Topics:</label>
              <textarea
                rows={3}
                value={coordMessage}
                onChange={e => onChangeMessage(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              Confirm & Send Proposal
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── New Exchange Proposal Modal ───────────────────────────────────────────────
interface NewExchangeModalProps {
  isOpen: boolean;
  exchangeType: ExchangeType;
  title: string;
  category: string;
  summary: string;
  highlights: string;
  statA: string;
  statB: string;
  honorarium: string;
  onChangeType: (t: ExchangeType) => void;
  onChangeTitle: (v: string) => void;
  onChangeCategory: (v: string) => void;
  onChangeSummary: (v: string) => void;
  onChangeHighlights: (v: string) => void;
  onChangeStatA: (v: string) => void;
  onChangeStatB: (v: string) => void;
  onChangeHonorarium: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const NewExchangeModal: React.FC<NewExchangeModalProps> = ({
  isOpen, exchangeType,
  title, category, summary, highlights, statA, statB, honorarium,
  onChangeType, onChangeTitle, onChangeCategory, onChangeSummary,
  onChangeHighlights, onChangeStatA, onChangeStatB, onChangeHonorarium,
  onClose, onSubmit
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold text-stone-900">Publish New Knowledge Exchange Proposal</h3>
              <div className="text-xs text-stone-600">Connect real farm experience with agricultural university faculties</div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            {/* Type Switcher */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1.5">Proposal Type:</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { val: 'farmer_needs_uni' as ExchangeType, icon: <Sprout className="w-4 h-4 mx-auto mb-1 text-emerald-700" />, label: 'Farmer Masterclass', active: 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold' },
                  { val: 'uni_needs_farmer' as ExchangeType, icon: <GraduationCap className="w-4 h-4 mx-auto mb-1 text-amber-700" />, label: 'Student Farm Visit', active: 'bg-amber-50 border-amber-600 text-amber-900 font-bold' },
                  { val: 'lab_innovation' as ExchangeType, icon: <FlaskConical className="w-4 h-4 mx-auto mb-1 text-sky-700" />, label: 'Desi Innovation Lab', active: 'bg-sky-50 border-sky-600 text-sky-900 font-bold' },
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => onChangeType(opt.val)}
                    className={`p-2.5 rounded-lg border text-center transition-all ${exchangeType === opt.val ? opt.active : 'border-stone-200 text-stone-700 hover:bg-stone-50'}`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Title of Masterclass / Practicum / Innovation:</label>
              <input
                type="text" required value={title} onChange={e => onChangeTitle(e.target.value)}
                placeholder={exchangeType === 'uni_needs_farmer' ? 'e.g., Practical In-Situ Paddy Straw Sowing for 20 B.Sc Students' : 'e.g., 20 Years of Native Bee Pollination & Mustard Yield Booster'}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Subject Domain:</label>
                <select value={category} onChange={e => onChangeCategory(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium bg-white focus:outline-none focus:border-amber-600">
                  <option value="Stubble & Happy Seeder">Stubble & Zero-Tillage</option>
                  <option value="Soil Organic Carbon">Soil Organic Carbon & Khad</option>
                  <option value="Micro-Drip & Canal Irrigation">Micro-Drip & Water</option>
                  <option value="Zero-Cost Pest Concoctions">Zero-Cost Organic Spray</option>
                  <option value="Farm Machinery Modification">Farm Machinery Jugad</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Honorarium / Stipend:</label>
                <input type="text" value={honorarium} onChange={e => onChangeHonorarium(e.target.value)} placeholder="e.g., ₹15,000 Host Honorarium" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-amber-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">{exchangeType === 'uni_needs_farmer' ? 'Batch Count:' : 'Practical Experience:'}</label>
                <input type="text" value={statA} onChange={e => onChangeStatA(e.target.value)} placeholder={exchangeType === 'uni_needs_farmer' ? '25 B.Sc Students' : '18 Years'} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-amber-600" />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">{exchangeType === 'uni_needs_farmer' ? 'Duration on Field:' : 'Preferred Format:'}</label>
                <input type="text" value={statB} onChange={e => onChangeStatB(e.target.value)} placeholder={exchangeType === 'uni_needs_farmer' ? '3 Days Practicum' : 'On-Farm Classroom'} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-amber-600" />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Description & Context:</label>
              <textarea rows={2} required value={summary} onChange={e => onChangeSummary(e.target.value)} placeholder="Describe the practical challenge, ground reality, or syllabus requirement..." className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 text-xs focus:outline-none focus:border-amber-600" />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Key Practical Takeaways (one per line):</label>
              <textarea rows={2} value={highlights} onChange={e => onChangeHighlights(e.target.value)} placeholder={"Line 1: Direct machine calibration\nLine 2: Traditional soil moisture feel"} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 text-xs focus:outline-none focus:border-amber-600" />
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors">Publish Proposal</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
