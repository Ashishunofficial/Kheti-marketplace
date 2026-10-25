import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sprout, 
  FlaskConical, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Calendar, 
  FileText, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  UniversityMasterclass, 
  FarmInternship, 
  InternshipApplication, 
  FieldConsultation, 
  UserProfile 
} from '../../types';

interface UniversityConsoleProps {
  currentUser: UserProfile;
  currentUserId?: string;
  isDemoMode?: boolean;
  masterclasses: UniversityMasterclass[];
  internships: FarmInternship[];
  applications: InternshipApplication[];
  consultations: FieldConsultation[];
  onAcceptApplication: (appId: string) => void;
  onRejectApplication: (appId: string) => void;
  onOpenOfferMasterclass: () => void;
  onOpenListFarm: () => void;
  onOpenConsultation: () => void;
}

export const UniversityConsole: React.FC<UniversityConsoleProps> = ({
  currentUser,
  currentUserId,
  isDemoMode = false,
  masterclasses,
  internships,
  applications,
  consultations,
  onAcceptApplication,
  onRejectApplication,
  onOpenOfferMasterclass,
  onOpenListFarm,
  onOpenConsultation
}) => {
  const [consoleTab, setConsoleTab] = useState<'internships' | 'masterclasses' | 'consultations'>('internships');

  const activeUserId = currentUserId || currentUser.id;

const MOCK_INTERN_IDS = new Set(['intern_01', 'intern_02']);
const MOCK_MC_IDS = new Set(['mc_01', 'mc_02', 'mc_03']);
const MOCK_APP_IDS = new Set(['app_01', 'app_02']);
const MOCK_CONS_IDS = new Set(['cons_01', 'cons_02']);

  // Filter items owned by or involving current user strictly in live mode
  const myFarms = internships.filter(i => {
    if (isDemoMode) {
      return i.farmerId === activeUserId || i.farmerId === 'usr_rameshwar_99' || i.farmerName.toLowerCase().includes('rameshwar');
    }
    const isMock = MOCK_INTERN_IDS.has(i.id) || i.farmerId === 'usr_rameshwar_99' || i.farmerId === 'usr_balwinder_88';
    return !isMock && (i.farmerId === activeUserId || (activeUserId && i.farmerId.includes(activeUserId)));
  });
  const myFarmIds = new Set(myFarms.map(f => f.id));

  const receivedApplications = applications.filter(a => {
    if (isDemoMode) {
      return myFarmIds.has(a.internshipId) || a.farmerId === 'usr_rameshwar_99';
    }
    const isMock = MOCK_APP_IDS.has(a.id) || a.farmerId === 'usr_rameshwar_99';
    return !isMock && (myFarmIds.has(a.internshipId) || a.farmerId === activeUserId);
  });

  const myApplicationsSent = applications.filter(a => {
    if (isDemoMode) return a.applicantId === 'std_aditya_21' || a.applicantId === activeUserId;
    const isMock = MOCK_APP_IDS.has(a.id) || a.applicantId === 'std_aditya_21';
    return !isMock && a.applicantId === activeUserId;
  });

  const myEnrolledMasterclasses = masterclasses.filter(mc => 
    mc.enrolledUserIds?.includes(activeUserId)
  );

  const myTaughtMasterclasses = masterclasses.filter(mc => {
    if (isDemoMode) {
      return mc.instructorId === activeUserId || mc.instructorId === 'prof_virender' || mc.instructorName.toLowerCase().includes('virender');
    }
    const isMock = MOCK_MC_IDS.has(mc.id) || mc.instructorId === 'prof_virender' || mc.instructorId === 'prof_sunita' || mc.instructorId === 'prof_arvind';
    return !isMock && mc.instructorId === activeUserId;
  });

  const myConsultations = consultations.filter(c => {
    if (isDemoMode) {
      return c.farmerId === activeUserId || c.farmerId === 'usr_rameshwar_99';
    }
    const isMock = MOCK_CONS_IDS.has(c.id) || c.farmerId === 'usr_rameshwar_99';
    return !isMock && c.farmerId === activeUserId;
  });

  return (
    <div className="space-y-6">
      {/* Console Tab Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-150">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <GraduationCap className="w-4 h-4 text-amber-700" />
              <span>Academic & Mentorship Control Panel · मेरा अकादमिक डैशबोर्ड</span>
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mt-0.5">
              Welcome, {currentUser.name}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Manage your hosted farm internships, student applicant approvals, enrolled masterclasses, and scientist pathology diagnoses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenListFarm}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>List Farm for Interns</span>
            </button>
            <button
              onClick={onOpenOfferMasterclass}
              className="px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Offer Masterclass</span>
            </button>
            <button
              onClick={onOpenConsultation}
              className="px-3 py-1.5 text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FlaskConical className="w-3.5 h-3.5 text-sky-800" />
              <span>Ask Scientist</span>
            </button>
          </div>
        </div>

        {/* Console Sub Tabs */}
        <div className="flex items-center gap-2 pt-3">
          <button
            onClick={() => setConsoleTab('internships')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              consoleTab === 'internships'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Farm Internships & Applicants ({receivedApplications.length})</span>
            {receivedApplications.filter(a => a.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setConsoleTab('masterclasses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              consoleTab === 'masterclasses'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Masterclasses ({myEnrolledMasterclasses.length + myTaughtMasterclasses.length})</span>
          </button>

          <button
            onClick={() => setConsoleTab('consultations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              consoleTab === 'consultations'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Scientist Diagnoses ({myConsultations.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Internships & Applications */}
      {consoleTab === 'internships' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Received for My Farm */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Review Inquiries</span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">Student Applications for Your Farm</h3>
              </div>
              <span className="text-xs text-stone-600 font-medium">
                {receivedApplications.length} Candidates
              </span>
            </div>

            {receivedApplications.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">
                No student applications received yet. Your listed fields appear to agriculture university students during their RAWE semester.
              </div>
            ) : (
              <div className="space-y-3">
                {receivedApplications.map((app) => (
                  <div key={app.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-stone-900 text-sm">{app.applicantName}</div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        app.status === 'accepted' ? 'bg-emerald-100 text-emerald-900' :
                        app.status === 'rejected' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-stone-600">
                      <div>College: <strong>{app.applicantCollege}</strong></div>
                      <div>Degree: {app.degree} ({app.yearOfStudy})</div>
                      <div>Phone: <strong className="font-mono text-stone-900">{app.phone}</strong></div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-stone-200 text-stone-700 italic">
                      "{app.statement}"
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                        <button
                          onClick={() => onRejectApplication(app.id)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded text-xs transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => onAcceptApplication(app.id)}
                          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded text-xs transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept & Confirm Placement</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Active Farm Listings */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Field Mentorship</span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">Your Active Farm Internship Listings</h3>
              </div>
              <button
                onClick={onOpenListFarm}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Listing
              </button>
            </div>

            {myFarms.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">
                You haven't listed your farm yet. List your farm to host students and earn institutional mentorship honorariums.
              </div>
            ) : (
              <div className="space-y-3">
                {myFarms.map((farm) => (
                  <div key={farm.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{farm.farmName}</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-900">
                        {farm.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-stone-600">
                      <div>Location: <strong>{farm.village}, {farm.district}</strong></div>
                      <div>Duration: <strong>{farm.durationWeeks} Weeks</strong></div>
                      <div>Monthly Stipend: <strong className="text-emerald-800 font-mono">₹{farm.stipendMonthly}</strong></div>
                      <div>Slots: <strong className="text-stone-900">{farm.appliedCount} / {farm.availableSlots} occupied</strong></div>
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-1">
                      {farm.cropFocus.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-stone-200 text-stone-700 rounded text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Masterclasses */}
      {consoleTab === 'masterclasses' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-150">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Academic Sessions</span>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">Enrolled & Scheduled Masterclasses</h3>
            </div>
            <button
              onClick={onOpenOfferMasterclass}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule New Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masterclasses.map((mc) => {
              const isEnrolled = mc.enrolledUserIds?.includes(currentUser.id);
              return (
                <div key={mc.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {mc.mode === 'online_interactive' ? 'Live Interactive' : 'On-Farm Demo'}
                      </span>
                      <span className="font-mono text-emerald-800 font-bold">
                        {mc.fee === 0 ? 'FREE' : `₹${mc.fee}`}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm mt-2">{mc.topic}</h4>
                    <div className="text-stone-600 text-[11px] font-medium mt-0.5">
                      {mc.instructorName} · {mc.university}
                    </div>

                    <p className="text-stone-700 text-xs mt-2 line-clamp-2">
                      {mc.description}
                    </p>

                    <div className="mt-3 p-2 bg-white rounded border border-stone-200 text-stone-600 text-[11px] space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>{mc.scheduledDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>{mc.enrolledCount} / {mc.maxSeats} enrolled</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">{mc.durationHours} hrs duration</span>
                    {isEnrolled ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded text-xs">
                        Enrolled ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => {}}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded text-xs transition-colors"
                      >
                        Join Session
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Consultations & Diagnoses */}
      {consoleTab === 'consultations' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-150">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Laboratory Pathology</span>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">Scientist Consultations & Prescriptions</h3>
            </div>
            <button
              onClick={onOpenConsultation}
              className="text-xs font-bold text-sky-800 hover:text-sky-950 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Submit New Query
            </button>
          </div>

          <div className="space-y-4">
            {consultations.map((cons) => (
              <div key={cons.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{cons.crop}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      cons.urgency === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {cons.urgency.toUpperCase()}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    cons.status === 'diagnosed' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {cons.status === 'diagnosed' ? 'DIAGNOSED ✓' : 'UNDER REVIEW'}
                  </span>
                </div>

                <div className="text-stone-700">
                  <strong className="text-stone-900">Farmer Symptoms:</strong> {cons.symptoms}
                </div>

                {cons.diagnosis && (
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span>Scientific Diagnosis by {cons.expertName} ({cons.expertUniversity})</span>
                      <span className="text-[10px] font-normal text-stone-500 font-mono">
                        {cons.repliedAt ? new Date(cons.repliedAt).toLocaleDateString('en-IN') : 'Verified'}
                      </span>
                    </div>
                    <p className="text-stone-800">{cons.diagnosis}</p>
                    {cons.prescription && (
                      <div className="pt-2 border-t border-emerald-100 text-emerald-950 font-medium">
                        <strong>Dosage & Prescription:</strong> {cons.prescription}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
