import React, { useState } from 'react';
import { X, Sprout, Building, Phone, BookOpen, GraduationCap } from 'lucide-react';
import { FarmInternship, InternshipApplication } from '../../types';

interface ApplyInternshipModalProps {
  isOpen: boolean;
  internship: FarmInternship | null;
  onClose: () => void;
  onSubmit: (data: Omit<InternshipApplication, 'id' | 'status' | 'appliedAt'>) => Promise<any>;
}

export const ApplyInternshipModal: React.FC<ApplyInternshipModalProps> = ({
  isOpen,
  internship,
  onClose,
  onSubmit
}) => {
  const [applicantName, setApplicantName] = useState('Aditya Vardhan');
  const [applicantCollege, setApplicantCollege] = useState('Punjab Agricultural University (PAU), Ludhiana');
  const [degree, setDegree] = useState('B.Sc. (Hons) Agriculture');
  const [yearOfStudy, setYearOfStudy] = useState('Final Year (8th Sem / RAWE)');
  const [phone, setPhone] = useState('+91 98123 45678');
  const [statement, setStatement] = useState(
    'I am seeking practical ground-truth training on this farm to understand stubble management, bio-inputs, and farm economics for my degree practicum.'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !internship) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantCollege.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        internshipId: internship.id,
        farmName: internship.farmName,
        farmerId: internship.farmerId,
        applicantId: `std_${Date.now()}`,
        applicantName,
        applicantCollege,
        degree,
        yearOfStudy,
        phone,
        statement
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Student Placement</span>
              <h3 className="text-base font-bold text-stone-900">Apply for Farm Internship</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Farm Summary */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
          <div className="font-bold text-stone-900 text-sm">{internship.farmName}</div>
          <div className="text-stone-600">Farmer Mentor: <strong className="text-stone-800">{internship.farmerName}</strong> ({internship.village}, {internship.district})</div>
          <div className="text-stone-600">Duration: <strong>{internship.durationWeeks} Weeks</strong> · Monthly Stipend: <strong className="text-emerald-800 font-mono">₹{internship.stipendMonthly.toLocaleString('en-IN')}</strong></div>
          <div className="text-emerald-800 font-medium">Lodging & Meals: {internship.accommodationProvided ? '✓ Provided on Farm' : 'Self-arranged'}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Your Full Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Contact Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">University / College Name</label>
            <input
              type="text"
              value={applicantCollege}
              onChange={(e) => setApplicantCollege(e.target.value)}
              placeholder="e.g. CCS Haryana Agricultural University, Hisar"
              required
              className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Degree Program</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Sc. (Hons) Ag / B.Tech Agri Engg"
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">Year / Semester</label>
              <input
                type="text"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                placeholder="e.g. 4th Year / RAWE Semester"
                required
                className="w-full py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1">Statement of Purpose / Field Interest</label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={3}
              placeholder="Why do you want to intern at this farm? Mention topics you want to research or learn."
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
              {submitting ? 'Submitting Application...' : 'Submit Application to Farmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
