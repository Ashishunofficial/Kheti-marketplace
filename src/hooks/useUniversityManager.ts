import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { 
  UniversityMasterclass, 
  FarmInternship, 
  InternshipApplication, 
  FieldConsultation 
} from '../types';

const INITIAL_MASTERCLASSES: UniversityMasterclass[] = [
  {
    id: 'mc_01',
    instructorId: 'prof_virender',
    instructorName: 'Dr. Virender Kumar',
    instructorTitle: 'Principal Agronomist & Head of Research',
    university: 'Punjab Agricultural University (PAU), Ludhiana',
    topic: 'Stubble Residue Soil Biology & Direct-Seeded Rice (DSR) Optimization',
    description: 'Masterclass on managing heavy in-situ paddy straw without burning, maintaining microbial activity, and overcoming iron deficiency in dry direct seeded rice.',
    scheduledDate: '28 Oct 2026, 11:00 AM IST',
    durationHours: 2.5,
    fee: 0,
    enrolledCount: 42,
    maxSeats: 100,
    mode: 'online_interactive',
    status: 'upcoming',
    enrolledUserIds: []
  },
  {
    id: 'mc_02',
    instructorId: 'prof_sunita',
    instructorName: 'Dr. Sunita Deshmukh',
    instructorTitle: 'Professor of Soil Science & Irrigation Engineering',
    university: 'CCS Haryana Agricultural University (HAU), Hisar',
    topic: 'Low-Pressure Micro-Drip Fertigation & Gypsum Reclamation for Alkaline Soils',
    description: 'Step-by-step engineering tutorial on mitigating salinity hazards, venturi injector optimization, and tailored solubility math for water-soluble NPKs.',
    scheduledDate: '02 Nov 2026, 03:00 PM IST',
    durationHours: 3.0,
    fee: 199,
    enrolledCount: 28,
    maxSeats: 50,
    mode: 'online_interactive',
    status: 'upcoming',
    enrolledUserIds: []
  },
  {
    id: 'mc_03',
    instructorId: 'prof_arvind',
    instructorName: 'Dr. Arvind Patil',
    instructorTitle: 'Senior Plant Pathologist & Fungicide Specialist',
    university: 'MPKV Rahuri & IARI Collaborative Wing',
    topic: 'Diagnostic Differential: Yellow Rust vs Foliar Blight & Targeted Organic Formulations',
    description: 'Microscopic identification methods for airborne fungal spores, optimal weather window spray timing, and scientific assay of buttermilk-copper leaf coatings.',
    scheduledDate: '08 Nov 2026, 10:30 AM IST',
    durationHours: 2.0,
    fee: 0,
    enrolledCount: 65,
    maxSeats: 120,
    mode: 'on_farm_demonstration',
    status: 'upcoming',
    enrolledUserIds: []
  }
];

const INITIAL_FARM_INTERNSHIPS: FarmInternship[] = [
  {
    id: 'intern_01',
    farmerId: 'usr_rameshwar_99',
    farmerName: 'Rameshwar Singh (Master Farmer)',
    farmName: 'Amrit Maati Natural Agriculture Estate (25 Acres)',
    village: 'Nilokheri',
    district: 'Karnal',
    state: 'Haryana',
    cropFocus: ['Basmati 1121', 'Wheat PBW-550', 'Dhaincha Green Manuring'],
    durationWeeks: 4,
    stipendMonthly: 6000,
    accommodationProvided: true,
    learningOutcomes: [
      'Hands-on formulation of fermented cow dung bio-inputs (Jeevamrit, Beejamrit)',
      'Zero-tillage Happy Seeder calibration on damp standing stubble',
      'Direct farm-gate quality moisture testing and APMC-free export trading'
    ],
    availableSlots: 4,
    appliedCount: 3,
    status: 'open',
    createdAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'intern_02',
    farmerId: 'usr_balwinder_88',
    farmerName: 'Balwinder Singh Dhillon',
    farmName: 'Dhillon Agro Machinery & Seed Farm (40 Acres)',
    village: 'Samana',
    district: 'Patiala',
    state: 'Punjab',
    cropFocus: ['Certified Wheat Breeder Seed', 'Potato Kufri Pukhraj', 'Silage Corn'],
    durationWeeks: 6,
    stipendMonthly: 8000,
    accommodationProvided: true,
    learningOutcomes: [
      'Precision tractor telemetry, PTO torque calculation and laser leveling',
      'Cold-storage bulk stack humidity and ethylene concentration management',
      'Contract farming compliance and institutional seed certification process'
    ],
    availableSlots: 2,
    appliedCount: 1,
    status: 'open',
    createdAt: '2026-10-21T14:30:00Z'
  },
  {
    id: 'intern_03',
    farmerId: 'usr_suresh_77',
    farmerName: 'Suresh Kumar Sharma',
    farmName: 'Aravali Organic Bio-Pesticide Research Farm',
    village: 'Behror',
    district: 'Alwar',
    state: 'Rajasthan',
    cropFocus: ['Mustard Giriraj', 'Gram (Chana)', 'Organic Pearl Millet'],
    durationWeeks: 3,
    stipendMonthly: 5000,
    accommodationProvided: false,
    learningOutcomes: [
      'Indigenous botanic spray formulation against aphid & pod borer',
      'Arid sandy loam soil moisture retention with farmyard mulching',
      'Local FPO organic aggregation and FSSAI packaging norms'
    ],
    availableSlots: 3,
    appliedCount: 2,
    status: 'open',
    createdAt: '2026-10-22T09:15:00Z'
  }
];

const INITIAL_APPLICATIONS: InternshipApplication[] = [
  {
    id: 'app_01',
    internshipId: 'intern_01',
    farmName: 'Amrit Maati Natural Agriculture Estate (25 Acres)',
    farmerId: 'usr_rameshwar_99',
    applicantId: 'std_aditya_21',
    applicantName: 'Aditya Vardhan',
    applicantCollege: 'Punjab Agricultural University (PAU), College of Agriculture',
    degree: 'B.Sc. (Hons) Agriculture',
    yearOfStudy: '4th Year (RAWE Semester)',
    phone: '+91 98123 45678',
    statement: 'Interested in learning non-chemical stem borer controls directly on the fields to validate my final year RAWE thesis.',
    status: 'pending',
    appliedAt: '2026-10-23T11:20:00Z'
  },
  {
    id: 'app_02',
    internshipId: 'intern_01',
    farmName: 'Amrit Maati Natural Agriculture Estate (25 Acres)',
    farmerId: 'usr_rameshwar_99',
    applicantId: 'std_priya_44',
    applicantName: 'Priya Sharma',
    applicantCollege: 'CCS Haryana Agricultural University, Hisar',
    degree: 'M.Sc. Soil Science & Agricultural Chemistry',
    yearOfStudy: '2nd Year',
    phone: '+91 98765 43210',
    statement: 'Looking to conduct soil microbial respiration assays on long-term organic plots compared to adjoining synthetic fertilizer plots.',
    status: 'accepted',
    appliedAt: '2026-10-22T16:40:00Z'
  }
];

const INITIAL_CONSULTATIONS: FieldConsultation[] = [
  {
    id: 'cons_01',
    farmerId: 'usr_rameshwar_99',
    farmerName: 'Rameshwar Singh',
    farmerVillage: 'Nilokheri',
    farmerDistrict: 'Karnal',
    expertId: 'prof_arvind',
    expertName: 'Dr. Arvind Patil',
    expertUniversity: 'MPKV Rahuri / IARI',
    crop: 'Wheat (PBW-550)',
    issueType: 'fungal_disease',
    symptoms: 'Small yellow-orange pustules arranged in linear stripes on upper leaves following 3 days of dense morning fog and cool humid weather.',
    urgency: 'critical',
    status: 'diagnosed',
    diagnosis: 'Early Stripe Rust (Puccinia striiformis f. sp. tritici). Weather conditions (10-15°C with dew) are highly favorable for rapid spore multiplication.',
    prescription: 'Spray Propiconazole 25% EC @ 1ml/L of water OR Tebuconazole 25.9% EC @ 1.25ml/L using 200L water per acre. For organic plots, apply sour fermented cow milk whey (10%) with 0.1% copper sulphate decoction immediately.',
    createdAt: '2026-10-23T08:30:00Z',
    repliedAt: '2026-10-23T12:15:00Z'
  },
  {
    id: 'cons_02',
    farmerId: 'usr_suresh_77',
    farmerName: 'Suresh Kumar Sharma',
    farmerVillage: 'Behror',
    farmerDistrict: 'Alwar',
    expertId: 'prof_virender',
    expertName: 'Dr. Virender Kumar',
    expertUniversity: 'PAU Ludhiana',
    crop: 'Mustard (Giriraj)',
    issueType: 'insect_pest',
    symptoms: 'Greenish-black wingless aphids clustered on flowering twigs and tender pods causing curling and sooty honeydew excretion.',
    urgency: 'medium',
    status: 'diagnosed',
    diagnosis: 'Mustard Aphid (Lipaphis erysimi) reaching initial economic threshold level (ETL > 25 aphids per 10cm central shoot).',
    prescription: 'Conserve natural coccinellid ladybird predators. If infestation covers >20% twigs, spray Neem seed kernel extract (NSKE 5%) or Dimethoate 30% EC @ 1.5ml/L in evening hours.',
    createdAt: '2026-10-22T14:00:00Z',
    repliedAt: '2026-10-22T18:45:00Z'
  }
];

const STORAGE_KEYS = {
  MASTERCLASSES: 'kheti_academic_masterclasses_v1',
  INTERNSHIPS: 'kheti_farm_internships_v1',
  APPLICATIONS: 'kheti_internship_apps_v1',
  CONSULTATIONS: 'kheti_field_consultations_v1'
};

const MOCK_MC_IDS = new Set(['mc_01', 'mc_02', 'mc_03']);
const MOCK_INTERN_IDS = new Set(['intern_01', 'intern_02']);
const MOCK_APP_IDS = new Set(['app_01', 'app_02']);
const MOCK_CONS_IDS = new Set(['cons_01', 'cons_02']);
const MOCK_INSTRUCTOR_IDS = new Set(['prof_virender', 'prof_sunita', 'prof_arvind', 'usr_rameshwar_99', 'usr_balwinder_88']);

export function useUniversityManager() {
  const { user, profile, isAuthenticated, isDemo } = useAuth();
  const currentUserId = user?.id || profile?.id || (isDemo ? 'usr_rameshwar_99' : '');

  const [masterclasses, setMasterclasses] = useState<UniversityMasterclass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTERCLASSES);
      return saved ? JSON.parse(saved) : INITIAL_MASTERCLASSES;
    } catch {
      return INITIAL_MASTERCLASSES;
    }
  });

  const [internships, setInternships] = useState<FarmInternship[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INTERNSHIPS);
      return saved ? JSON.parse(saved) : INITIAL_FARM_INTERNSHIPS;
    } catch {
      return INITIAL_FARM_INTERNSHIPS;
    }
  });

  const [applications, setApplications] = useState<InternshipApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [consultations, setConsultations] = useState<FieldConsultation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS);
      return saved ? JSON.parse(saved) : INITIAL_CONSULTATIONS;
    } catch {
      return INITIAL_CONSULTATIONS;
    }
  });

  const [partnerUniversitiesCount, setPartnerUniversitiesCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kheti_partner_universities_count');
      if (saved) return Number(saved);
    } catch {
      // fallback
    }
    return 42;
  });

  const updatePartnerUniversitiesCount = (count: number) => {
    setPartnerUniversitiesCount(count);
    try {
      localStorage.setItem('kheti_partner_universities_count', String(count));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  };

  const [loading, setLoading] = useState(false);

  // Derived user-isolated sets
  // 1. Public listings (In live mode: only show opportunities from other institutions/farmers, exclude own)
  const publicMasterclasses = masterclasses.filter(mc => {
    if (isDemo) return true;
    const isMock = MOCK_MC_IDS.has(mc.id) || (mc.instructorId ? MOCK_INSTRUCTOR_IDS.has(mc.instructorId) : false) || mc.id.startsWith('mc_0');
    const isMine = mc.instructorId === currentUserId;
    return !isMock && !isMine;
  });

  const publicInternships = internships.filter(i => {
    if (isDemo) return true;
    const isMock = MOCK_INTERN_IDS.has(i.id) || (i.farmerId ? MOCK_INSTRUCTOR_IDS.has(i.farmerId) : false) || i.id.startsWith('intern_0') || i.farmerId === 'usr_rameshwar_99' || i.farmerId === 'usr_balwinder_88';
    const isMine = i.farmerId === currentUserId;
    return !isMock && !isMine;
  });

  // 2. Personal Listings & Activity
  const myMasterclasses = masterclasses.filter(mc => {
    if (isDemo) {
      return mc.instructorId === 'prof_virender' || mc.instructorId === currentUserId;
    }
    const isMock = MOCK_MC_IDS.has(mc.id) || (mc.instructorId ? MOCK_INSTRUCTOR_IDS.has(mc.instructorId) : false);
    return !isMock && mc.instructorId === currentUserId;
  });

  const myInternships = internships.filter(i => {
    if (isDemo) {
      return i.farmerId === 'usr_rameshwar_99' || i.farmerId === currentUserId;
    }
    const isMock = MOCK_INTERN_IDS.has(i.id) || (i.farmerId ? MOCK_INSTRUCTOR_IDS.has(i.farmerId) : false);
    return !isMock && i.farmerId === currentUserId;
  });

  const myApplications = applications.filter(a => {
    if (isDemo) return true;
    const isMock = MOCK_APP_IDS.has(a.id) || a.farmerId === 'usr_rameshwar_99';
    return !isMock && (a.farmerId === currentUserId || a.applicantId === currentUserId);
  });

  const myConsultations = consultations.filter(c => {
    if (isDemo) return true;
    const isMock = MOCK_CONS_IDS.has(c.id) || c.farmerId === 'usr_rameshwar_99';
    return !isMock && (c.farmerId === currentUserId || c.expertId === currentUserId);
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MASTERCLASSES, JSON.stringify(masterclasses));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [masterclasses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(internships));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [internships]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [consultations]);

  // Try hydrating from Supabase if table exists, without throwing
  const hydrateFromSupabase = useCallback(async () => {
    try {
      const { data: mcData, error: mcErr } = await supabase.from('university_masterclasses').select('*');
      if (!mcErr && mcData && mcData.length > 0) {
        setMasterclasses(mcData.map((d: any) => ({
          id: d.id,
          instructorId: d.instructor_id,
          instructorName: d.instructor_name,
          instructorTitle: d.instructor_title,
          university: d.university,
          topic: d.topic,
          description: d.description,
          scheduledDate: d.scheduled_date,
          durationHours: d.duration_hours,
          fee: d.fee,
          enrolledCount: d.enrolled_count,
          maxSeats: d.max_seats,
          mode: d.mode,
          status: d.status
        })));
      }

      const { data: intData, error: intErr } = await supabase.from('farm_internships').select('*');
      if (!intErr && intData && intData.length > 0) {
        setInternships(intData.map((d: any) => ({
          id: d.id,
          farmerId: d.farmer_id,
          farmerName: d.farmer_name,
          farmName: d.farm_name,
          village: d.village,
          district: d.district,
          state: d.state,
          cropFocus: d.crop_focus || [],
          durationWeeks: d.duration_weeks,
          stipendMonthly: d.stipend_monthly,
          accommodationProvided: d.accommodation_provided,
          learningOutcomes: d.learning_outcomes || [],
          availableSlots: d.available_slots,
          appliedCount: d.applied_count,
          status: d.status,
          createdAt: d.created_at
        })));
      }
    } catch {
      // Fallback cleanly to local storage
    }
  }, []);

  useEffect(() => {
    hydrateFromSupabase();
  }, [hydrateFromSupabase]);

  // 1. Create a Masterclass
  const createMasterclass = async (data: Omit<UniversityMasterclass, 'id' | 'enrolledCount' | 'status'>) => {
    setLoading(true);
    const newMc: UniversityMasterclass = {
      ...data,
      id: `mc_${Date.now()}`,
      enrolledCount: 0,
      status: 'upcoming',
      enrolledUserIds: []
    };

    setMasterclasses(prev => [newMc, ...prev]);

    try {
      await supabase.from('university_masterclasses').insert({
        id: newMc.id,
        instructor_id: newMc.instructorId,
        instructor_name: newMc.instructorName,
        instructor_title: newMc.instructorTitle,
        university: newMc.university,
        topic: newMc.topic,
        description: newMc.description,
        scheduled_date: newMc.scheduledDate,
        duration_hours: newMc.durationHours,
        fee: newMc.fee,
        enrolled_count: 0,
        max_seats: newMc.maxSeats,
        mode: newMc.mode,
        status: 'upcoming'
      });
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
    return newMc;
  };

  // 2. Enroll in Masterclass
  const enrollInMasterclass = async (masterclassId: string, userId: string) => {
    setMasterclasses(prev => prev.map(mc => {
      if (mc.id === masterclassId) {
        const enrolled = mc.enrolledUserIds || [];
        if (enrolled.includes(userId)) return mc;
        return {
          ...mc,
          enrolledCount: mc.enrolledCount + 1,
          enrolledUserIds: [...enrolled, userId]
        };
      }
      return mc;
    }));
  };

  // 3. Create Farm Internship Listing
  const createFarmInternship = async (data: Omit<FarmInternship, 'id' | 'appliedCount' | 'status' | 'createdAt'>) => {
    setLoading(true);
    const newIntern: FarmInternship = {
      ...data,
      id: `intern_${Date.now()}`,
      appliedCount: 0,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    setInternships(prev => [newIntern, ...prev]);

    try {
      await supabase.from('farm_internships').insert({
        id: newIntern.id,
        farmer_id: newIntern.farmerId,
        farmer_name: newIntern.farmerName,
        farm_name: newIntern.farmName,
        village: newIntern.village,
        district: newIntern.district,
        state: newIntern.state,
        crop_focus: newIntern.cropFocus,
        duration_weeks: newIntern.durationWeeks,
        stipend_monthly: newIntern.stipendMonthly,
        accommodation_provided: newIntern.accommodationProvided,
        learning_outcomes: newIntern.learningOutcomes,
        available_slots: newIntern.availableSlots,
        applied_count: 0,
        status: 'open'
      });
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
    return newIntern;
  };

  // 4. Apply for Farm Internship
  const applyForInternship = async (data: Omit<InternshipApplication, 'id' | 'status' | 'appliedAt'>) => {
    setLoading(true);
    const newApp: InternshipApplication = {
      ...data,
      id: `app_${Date.now()}`,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    setApplications(prev => [newApp, ...prev]);
    // increment internship applied count
    setInternships(prev => prev.map(int => int.id === data.internshipId ? { ...int, appliedCount: int.appliedCount + 1 } : int));

    try {
      await supabase.from('internship_applications').insert({
        id: newApp.id,
        internship_id: newApp.internshipId,
        farm_name: newApp.farmName,
        farmer_id: newApp.farmerId,
        applicant_id: newApp.applicantId,
        applicant_name: newApp.applicantName,
        applicant_college: newApp.applicantCollege,
        degree: newApp.degree,
        year_of_study: newApp.yearOfStudy,
        phone: newApp.phone,
        statement: newApp.statement,
        status: 'pending'
      });
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
    return newApp;
  };

  // 5. Update Application Status (Farmer accepts/rejects student)
  const updateApplicationStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    try {
      await supabase.from('internship_applications').update({ status }).eq('id', appId);
    } catch {
      // safe fallback
    }
  };

  // 6. Submit Field Consultation query to Scientist
  const submitConsultation = async (data: Omit<FieldConsultation, 'id' | 'status' | 'createdAt'>) => {
    setLoading(true);
    const newCons: FieldConsultation = {
      ...data,
      id: `cons_${Date.now()}`,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };

    setConsultations(prev => [newCons, ...prev]);

    try {
      await supabase.from('field_consultations').insert({
        id: newCons.id,
        farmer_id: newCons.farmerId,
        farmer_name: newCons.farmerName,
        farmer_village: newCons.farmerVillage,
        farmer_district: newCons.farmerDistrict,
        expert_id: newCons.expertId,
        expert_name: newCons.expertName,
        expert_university: newCons.expertUniversity,
        crop: newCons.crop,
        issue_type: newCons.issueType,
        symptoms: newCons.symptoms,
        urgency: newCons.urgency,
        status: 'pending_review'
      });
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
    return newCons;
  };

  // 7. Prescribe diagnosis/solution (Scientist or Expert reply)
  const prescribeConsultation = async (consultationId: string, diagnosis: string, prescription: string) => {
    setConsultations(prev => prev.map(c => c.id === consultationId ? {
      ...c,
      status: 'diagnosed',
      diagnosis,
      prescription,
      repliedAt: new Date().toISOString()
    } : c));

    try {
      await supabase.from('field_consultations').update({
        status: 'diagnosed',
        diagnosis,
        prescription,
        replied_at: new Date().toISOString()
      }).eq('id', consultationId);
    } catch {
      // safe fallback
    }
  };

  return {
    masterclasses: publicMasterclasses,
    internships: publicInternships,
    allMasterclasses: masterclasses,
    allInternships: internships,
    myMasterclasses,
    myInternships,
    applications: myApplications,
    consultations: myConsultations,
    isDemo,
    currentUserId,
    partnerUniversitiesCount,
    updatePartnerUniversitiesCount,
    loading,
    createMasterclass,
    enrollInMasterclass,
    createFarmInternship,
    applyForInternship,
    updateApplicationStatus,
    submitConsultation,
    prescribeConsultation
  };
}
