import React, { useState } from 'react';
import { X, FlaskConical, AlertTriangle, Send } from 'lucide-react';
import { FieldConsultation, UserProfile } from '../../types';
import { MOCK_UNIVERSITY_EXPERTS } from '../../data/mockData';

interface ConsultScientistModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  preselectedExpert?: any;
  onClose: () => void;
  onSubmit: (data: Omit<FieldConsultation, 'id' | 'status' | 'createdAt'>) => Promise<any>;
}

export const ConsultScientistModal: React.FC<ConsultScientistModalProps> = ({
  isOpen,
  currentUser,
  preselectedExpert,
  onClose,
  onSubmit
}) => {
  const [selectedExpertId, setSelectedExpertId] = useState<string>(preselectedExpert?.id || 'prof_arvind');
  const [crop, setCrop] = useState('Wheat (गेहूं)');
  const [issueType, setIssueType] = useState<FieldConsultation['issueType']>('fungal_disease');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'critical'>('critical');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setSubmitting(true);
    const exp = MOCK_UNIVERSITY_EXPERTS.find(x => x.id === selectedExpertId) || MOCK_UNIVERSITY_EXPERTS[0];

    try {
      await onSubmit({
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        farmerVillage: currentUser.village || 'Nilokheri',
        farmerDistrict: currentUser.district || 'Karnal',
        expertId: exp.id,
        expertName: exp.name,
        expertUniversity: exp.university,
        crop,
        issueType,
        urgency,
        symptoms
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
              <FlaskConical className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Laboratory Consultation</span>
              <h3 className="text-base font-bold text-stone-900">Direct Query to University Scientist</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Select University Scientist / Pathologist</label>
            <select
              value={selectedExpertId}
              onChange={(e) => setSelectedExpertId(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-semibold"
            >
              {MOCK_UNIVERSITY_EXPERTS.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} — {exp.title} ({exp.university})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Affected Crop</label>
              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Wheat PBW-550, Mustard Giriraj"
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Category of Issue</label>
              <select
                value={issueType}
                onChange={(e: any) => setIssueType(e.target.value)}
                className="w-full py-2 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              >
                <option value="fungal_disease">Fungal Infection / Rust / Blight</option>
                <option value="insect_pest">Insect Pest / Borer / Aphid</option>
                <option value="soil_nutrient">Soil Nutrient Deficiency</option>
                <option value="salinity_water">Salinity / Brackish Water Damage</option>
                <option value="seed_germination">Seed Germination Failure</option>
                <option value="other">Other Pathology Query</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Urgency Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'critical'] as const).map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgency(lvl)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    urgency === lvl
                      ? lvl === 'critical'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  {lvl === 'critical' ? '🔴 Rapid Escalation' : lvl === 'medium' ? '🟡 Standard (24h)' : '🟢 Advisory'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Field Symptoms & Observations</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              placeholder="Describe color changes, leaf underside patterns, wilting onset, recent fertilizer/irrigation applied, and weather conditions (dew, overcast, heat)..."
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Your query will be routed directly to the faculty desk. Responses include recommended active chemical dosages, bio-organic options, and safety wait-times before harvest.
            </span>
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
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Sending Query...' : 'Submit to Scientist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
