import React from 'react';
import { GraduationCap, Calendar, Clock, DollarSign, Users, CheckCircle, Plus, BookOpen } from 'lucide-react';
import { UniversityMasterclass } from '../../types';

interface MasterclassesSectionProps {
  masterclasses: UniversityMasterclass[];
  currentUserId?: string;
  onEnroll: (masterclassId: string) => void;
  onOpenOffer: () => void;
}

export const MasterclassesSection: React.FC<MasterclassesSectionProps> = ({
  masterclasses,
  currentUserId,
  onEnroll,
  onOpenOffer
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-amber-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Certified Scientific Extension & Field Agronomy
          </span>
          <h2 className="text-xl font-extrabold mt-1">
            University Scientist & Professor Masterclasses
          </h2>
          <p className="text-xs text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
            Direct access to leading faculty from PAU, CCS HAU, and IARI. Interactive sessions bridging theoretical laboratory research with pragmatic farm economics, micro-drip fertigation, and resistance-free pest management.
          </p>
        </div>

        <button
          onClick={onOpenOffer}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Offer a Masterclass (Faculty)</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {masterclasses.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🎓
            </div>
            <h3 className="text-base font-bold text-stone-900">
              अन्य वैज्ञानिकों की कोई मास्टरक्लास अभी उपलब्ध नहीं है (No other active masterclasses)
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              लाइव नेटवर्क मोड में अन्य विश्वविद्यालयों व वैज्ञानिकों द्वारा संचालित मास्टरक्लास यहां सूचीबद्ध होती हैं। आपके द्वारा पेश की गई कक्षाएं "Academic Console (मेरा डैशबोर्ड)" में हैं।
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenOffer}
                className="px-4 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-xs"
              >
                + नई मास्टरक्लास प्रस्तावित करें (+ Offer Masterclass)
              </button>
            </div>
          </div>
        ) : (
          masterclasses.map((mc) => {
            const isEnrolled = currentUserId ? mc.enrolledUserIds?.includes(currentUserId) : false;
            const isFull = mc.enrolledCount >= mc.maxSeats;

            return (
            <div
              key={mc.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-150">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {mc.mode === 'online_interactive' ? 'Live Online Interactive' : 'On-Farm Demonstration'}
                  </span>
                  <span className="font-mono text-emerald-800 font-bold text-xs">
                    {mc.fee === 0 ? 'FREE' : `₹${mc.fee}`}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-stone-900 leading-snug">{mc.topic}</h3>
                  <div className="text-xs text-stone-800 font-bold mt-1">
                    {mc.instructorName}
                  </div>
                  <div className="text-[11px] text-stone-600">
                    {mc.instructorTitle}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    {mc.university}
                  </div>
                </div>

                <p className="mt-3 text-xs text-stone-700 leading-relaxed line-clamp-3">
                  {mc.description}
                </p>

                {/* Logistics */}
                <div className="mt-3.5 p-3 bg-stone-50 border border-stone-150 rounded-xl space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="font-medium">{mc.scheduledDate}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px]">
                    <span className="flex items-center gap-1 text-stone-600">
                      <Clock className="w-3 h-3 text-stone-400" /> {mc.durationHours} Hours Session
                    </span>
                    <span className="flex items-center gap-1 font-mono text-stone-700 font-medium">
                      <Users className="w-3 h-3 text-stone-400" /> {mc.enrolledCount}/{mc.maxSeats} Seats
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-stone-150 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  Certificate Provided ✓
                </span>

                {isEnrolled ? (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Enrolled</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onEnroll(mc.id)}
                    disabled={isFull}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-xs ${
                      isFull
                        ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    }`}
                  >
                    {isFull ? 'Batch Full' : 'Enroll in Masterclass'}
                  </button>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};
