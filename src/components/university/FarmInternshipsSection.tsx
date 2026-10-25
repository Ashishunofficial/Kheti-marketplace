import React from 'react';
import { Sprout, MapPin, Calendar, DollarSign, Award, Users, CheckCircle, ArrowRight, Home } from 'lucide-react';
import { FarmInternship } from '../../types';

interface FarmInternshipsSectionProps {
  internships: FarmInternship[];
  onOpenApply: (internship: FarmInternship) => void;
  onOpenListFarm: () => void;
}

export const FarmInternshipsSection: React.FC<FarmInternshipsSectionProps> = ({
  internships,
  onOpenApply,
  onOpenListFarm
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Rural Agricultural Work Experience (RAWE) & Field Practicums
          </span>
          <h2 className="text-xl font-extrabold mt-1">
            Working Farm Internships with Veteran Farmers
          </h2>
          <p className="text-xs text-emerald-150 mt-1 max-w-2xl leading-relaxed">
            University students and agri-entrepreneurs can live, learn, and research on operational farms. Gain practical ground truth on stubble management, bio-inputs, and farm gate trading directly from practicing master farmers.
          </p>
        </div>

        <button
          onClick={onOpenListFarm}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
        >
          <Sprout className="w-4 h-4" />
          <span>List Your Farm for Interns</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {internships.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🌱
            </div>
            <h3 className="text-base font-bold text-stone-900">
              अन्य किसानों के खेतों पर कोई इंटर्नशिप अभी उपलब्ध नहीं है (No other farm internships active)
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              लाइव नेटवर्क मोड में अन्य किसानों द्वारा पोस्ट की गई इंटर्नशिप्स यहां दिखाई देती हैं। आपके द्वारा होस्ट की जा रही इंटर्नशिप "Academic Console (मेरा डैशबोर्ड)" में हैं।
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenListFarm}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
              >
                + अपना खेत इंटर्नशिप हेतु सूचीबद्ध करें (+ List Farm)
              </button>
            </div>
          </div>
        ) : (
          internships.map((intern) => (
          <div
            key={intern.id}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {intern.status === 'open' ? 'Active Enrollment' : 'Completed'}
                </span>
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" /> {intern.durationWeeks} Weeks
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-stone-900">{intern.farmName}</h3>
                <div className="text-xs text-stone-600 font-medium mt-0.5">
                  Mentor: <strong>{intern.farmerName}</strong>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{intern.village}, {intern.district}, {intern.state}</span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="mt-3.5 p-3 bg-stone-50 border border-stone-150 rounded-xl grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500 text-[11px] block">Monthly Stipend</span>
                  <span className="font-bold font-mono text-emerald-800 text-sm">
                    {intern.stipendMonthly === 0 ? 'Honorary' : `₹${intern.stipendMonthly.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">Available Slots</span>
                  <span className="font-bold font-mono text-stone-900 text-sm">
                    {intern.availableSlots - intern.appliedCount > 0 ? `${intern.availableSlots - intern.appliedCount} Open` : 'Full'}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-stone-200/60 flex items-center gap-1.5 text-stone-700 text-[11px]">
                  <Home className="w-3.5 h-3.5 text-stone-400" />
                  <span>{intern.accommodationProvided ? 'Accommodation & Meals provided on farm' : 'Independent stay'}</span>
                </div>
              </div>

              {/* Crop focus */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-stone-600 mb-1">Crops & Systems:</div>
                <div className="flex flex-wrap gap-1">
                  {intern.cropFocus.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="mt-3 text-xs text-stone-700 space-y-1">
                <div className="text-[11px] font-semibold text-stone-600">Core Practicum Skills:</div>
                <ul className="text-[11px] text-stone-600 list-disc list-inside space-y-0.5">
                  {intern.learningOutcomes.slice(0, 2).map((outcome, i) => (
                    <li key={i} className="line-clamp-1">{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-stone-150 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">
                {intern.appliedCount} applied
              </span>

              <button
                onClick={() => onOpenApply(intern)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Apply for Internship</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
    </div>
  );
};
