/**
 * PathologyDesk — University Scientists & Pathologist Consultation Panel
 * Extracted from UniversityConnectView.tsx
 */
import React from 'react';
import { FlaskConical, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_UNIVERSITY_EXPERTS } from '../../data/mockData';
import type { LanguageCode } from '../layout/Navbar';

interface PathologyDeskProps {
  lang: LanguageCode;
  onAskAI?: (prompt: string) => void;
}

export const PathologyDesk: React.FC<PathologyDeskProps> = ({ lang, onAskAI }) => (
  <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
          <FlaskConical className="w-4 h-4 text-emerald-700" />
          <span>Direct Laboratory Scientist Desk · रोग निदान व पैथोलॉजी</span>
        </div>
        <h3 className="text-base font-bold text-stone-900 mt-0.5">
          {lang === 'hi' ? 'सत्यापित कृषि वैज्ञानिक परामर्श एवं रोग निदान' : 'University Scientists & Pathologist Network'}
        </h3>
        <p className="text-xs text-stone-600 mt-0.5">
          Direct access to senior scientists at PAU, HAU, and IARI for complex fungal infections, soil salinity, and breeding queries.
        </p>
      </div>
      <button
        onClick={() => onAskAI?.('Connect me to university agricultural scientist for leaf pathology')}
        className="px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1.5 shrink-0"
      >
        <Sparkles className="w-4 h-4 text-emerald-700" />
        <span>{lang === 'hi' ? 'वैज्ञानिक से सीधा सवाल पूछें' : 'Ask Pathologist'}</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {MOCK_UNIVERSITY_EXPERTS.map((expert, i) => (
        <motion.div
          key={expert.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07, duration: 0.22 }}
          className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-2.5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                {expert.state}
              </span>
              <span className="text-stone-500 font-mono text-[11px]">⭐ {expert.rating}</span>
            </div>
            <h4 className="font-bold text-stone-900 text-sm mt-1">{expert.name}</h4>
            <div className="text-[11px] text-stone-600 font-medium">{expert.title}</div>
            <div className="text-[11px] text-stone-500">{expert.university}</div>
            <div className="mt-2 text-stone-700 text-[11px] bg-white p-2 rounded border border-stone-200 line-clamp-2">
              {expert.specialization}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <span className="text-[11px] text-stone-600">{expert.experienceYears} Yrs Exp</span>
            <button
              onClick={() => onAskAI?.(`Consult ${expert.name} from ${expert.university} on ${expert.specialization}`)}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] transition-colors"
            >
              Consult
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
