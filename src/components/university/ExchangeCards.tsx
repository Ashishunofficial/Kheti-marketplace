/**
 * ExchangeCards — Bilateral Knowledge Exchange Listing Cards
 * Extracted from UniversityConnectView.tsx
 */
import React from 'react';
import {
  ArrowRight, Clock, ShieldCheck, MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import type { BilateralExchange } from './UniversityConnectView';

interface ExchangeCardsProps {
  exchanges: BilateralExchange[];
  onCoordinate: (exc: BilateralExchange) => void;
}

export const ExchangeCards: React.FC<ExchangeCardsProps> = ({ exchanges, onCoordinate }) => {
  if (exchanges.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-stone-500 text-sm">
        <div className="text-3xl mb-3">🔍</div>
        <p className="font-semibold text-stone-700">No exchanges match your filters.</p>
        <p className="text-xs mt-1">Try changing the subject or type filter above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {exchanges.map((exc, i) => {
        const isUniSeeking = exc.type === 'uni_needs_farmer';
        const isFarmerOffering = exc.type === 'farmer_needs_uni';
        const isLabAssay = exc.type === 'lab_innovation';
        const isConfirmed = exc.status === 'confirmed';

        return (
          <motion.div
            key={exc.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-colors"
          >
            <div>
              {/* Badge & Type */}
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isConfirmed
                      ? 'bg-purple-100 text-purple-900'
                      : isUniSeeking
                      ? 'bg-amber-100 text-amber-900'
                      : isFarmerOffering
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-sky-100 text-sky-900'
                  }`}
                >
                  {isConfirmed
                    ? '🤝 Bilateral Session Confirmed'
                    : isUniSeeking
                    ? '🎓 University Seeking Farmer'
                    : isFarmerOffering
                    ? '🌱 Farmer Offering Masterclass'
                    : '🧪 Desi Innovation in Lab'}
                </span>
                <span className="text-xs text-stone-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" /> {exc.postedDate}
                </span>
              </div>

              {/* Proposer & Institution */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-700">{exc.proposerName}</span>
                  {exc.isVerified && (
                    <span title="Verified Academic / Field Identity">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-500 font-medium">{exc.proposerInstitutionOrVillage}</div>
                <h3 className="text-base font-bold text-stone-900 mt-1 leading-snug">{exc.title}</h3>
                <div className="text-xs text-stone-600 mt-0.5 font-medium">{exc.category}</div>
              </div>

              {/* Summary */}
              <p className="mt-3 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {exc.summary}
              </p>

              {/* Specs Grid */}
              <div className="mt-3.5 p-3 bg-stone-50 border border-stone-150 rounded-lg grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-600 block text-[10px] uppercase font-semibold">{exc.statA.label}</span>
                  <span className="font-bold text-stone-900 text-xs">{exc.statA.value}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-600 block text-[10px] uppercase font-semibold">{exc.statB.label}</span>
                  <span className="font-bold text-stone-900 text-xs">{exc.statB.value}</span>
                </div>
                <div className="pt-1.5 border-t border-stone-200">
                  <span className="text-stone-600 block text-[10px] uppercase font-semibold">{exc.statC.label}</span>
                  <span className="font-medium text-stone-900 text-xs">{exc.statC.value}</span>
                </div>
                <div className="pt-1.5 border-t border-stone-200 text-right">
                  <span className="text-stone-600 block text-[10px] uppercase font-semibold">Compensation</span>
                  <span className="font-bold font-mono text-emerald-800 text-xs">{exc.honorariumOrStipend}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-3 space-y-1 text-[11px] text-stone-700 bg-stone-50/70 p-2.5 rounded border border-stone-150">
                <span className="font-bold text-stone-900 block text-[10px] uppercase tracking-wider">
                  {isUniSeeking ? 'Key Learning Objectives:' : 'Field Topics Covered:'}
                </span>
                <ul className="list-disc list-inside space-y-0.5">
                  {exc.practicalTopics.slice(0, 2).map((tp, i) => (
                    <li key={i} className="truncate">{tp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onCoordinate(exc)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                  isConfirmed
                    ? 'bg-purple-800 hover:bg-purple-900 text-white'
                    : isUniSeeking
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : isFarmerOffering
                    ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                    : 'bg-sky-800 hover:bg-sky-900 text-white'
                }`}
              >
                <span>{exc.actionPrimaryText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onCoordinate(exc)}
                className="p-2 border border-stone-200 hover:bg-stone-50 rounded-lg text-stone-700 transition-colors"
                title="Direct Coordination Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
