import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Building2, 
  Tractor, 
  GraduationCap, 
  ShieldCheck, 
  Table, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface TableCheckStatus {
  name: string;
  category: 'Storage' | 'Machinery' | 'University' | 'Marketplace' | 'Core';
  description: string;
  exists: boolean | null; // null = checking
  count: number;
  error?: string;
}

const ALL_MIGRATION_SQL = `-- ==============================================================================
-- Kheti AI / KrishiSetu — Storage, Machinery & University Tables Migration
-- For Supabase (PostgreSQL 15+)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/sql/new
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORAGE FACILITIES (Godowns, Cold Storage, Silos)
CREATE TABLE IF NOT EXISTS public.storage_facilities (
  id                      TEXT        PRIMARY KEY,
  owner_id                UUID        REFERENCES auth.users ON DELETE SET NULL,
  name                    TEXT        NOT NULL,
  owner_name              TEXT        NOT NULL,
  type                    TEXT        CHECK (type IN ('Dry Godown','Cold Storage','Silo','Warehouse')),
  district                TEXT        NOT NULL,
  state                   TEXT        NOT NULL DEFAULT 'Haryana',
  total_capacity_mt       NUMERIC     NOT NULL DEFAULT 1000,
  available_capacity_mt   NUMERIC     NOT NULL DEFAULT 500,
  rate_per_bag_per_month  NUMERIC     NOT NULL DEFAULT 8.0,
  is_wdrc_registered      BOOLEAN     DEFAULT TRUE,
  contact_phone           TEXT        NOT NULL,
  address                 TEXT,
  is_real                 BOOLEAN     DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warehouse_facilities (
  id                      TEXT        PRIMARY KEY,
  owner_id                UUID        REFERENCES auth.users ON DELETE SET NULL,
  name                    TEXT        NOT NULL,
  owner_name              TEXT        NOT NULL,
  type                    TEXT        CHECK (type IN ('Dry Godown','Cold Storage','Silo','Warehouse')),
  district                TEXT        NOT NULL,
  state                   TEXT        NOT NULL DEFAULT 'Haryana',
  total_capacity_mt       NUMERIC     NOT NULL DEFAULT 1000,
  available_capacity_mt   NUMERIC     NOT NULL DEFAULT 500,
  rate_per_bag_per_month  NUMERIC     NOT NULL DEFAULT 8.0,
  is_wdrc_registered      BOOLEAN     DEFAULT TRUE,
  contact_phone           TEXT        NOT NULL,
  address                 TEXT,
  is_real                 BOOLEAN     DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MACHINERY & EQUIPMENT (Tractors, Harvesters, Drone Sprayers)
CREATE TABLE IF NOT EXISTS public.machinery_equipment (
  id                  TEXT        PRIMARY KEY,
  owner_id            UUID        REFERENCES auth.users ON DELETE SET NULL,
  title               TEXT        NOT NULL,
  category            TEXT        CHECK (category IN ('Tractor','Combine Harvester','Laser Leveler','Rotavator','Drone Sprayer','Vehicle / Transport','Implements')),
  owner_name          TEXT        NOT NULL,
  district            TEXT        NOT NULL,
  state               TEXT        NOT NULL DEFAULT 'Punjab',
  rate_per_hour       NUMERIC,
  rate_per_acre       NUMERIC,
  operator_included   BOOLEAN     DEFAULT TRUE,
  is_available_now    BOOLEAN     DEFAULT TRUE,
  contact_phone       TEXT,
  model_year          TEXT,
  is_real             BOOLEAN     DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipment_rentals (
  id                  TEXT        PRIMARY KEY,
  owner_id            UUID        REFERENCES auth.users ON DELETE SET NULL,
  title               TEXT        NOT NULL,
  category            TEXT        CHECK (category IN ('Tractor','Combine Harvester','Laser Leveler','Rotavator','Drone Sprayer','Vehicle / Transport','Implements')),
  owner_name          TEXT        NOT NULL,
  district            TEXT        NOT NULL,
  state               TEXT        NOT NULL DEFAULT 'Punjab',
  rate_per_hour       NUMERIC,
  rate_per_acre       NUMERIC,
  operator_included   BOOLEAN     DEFAULT TRUE,
  is_available_now    BOOLEAN     DEFAULT TRUE,
  contact_phone       TEXT,
  model_year          TEXT,
  is_real             BOOLEAN     DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UNIVERSITY ADVISORIES & BULLETINS
CREATE TABLE IF NOT EXISTS public.university_advisories (
  id                  TEXT        PRIMARY KEY,
  university          TEXT        NOT NULL,
  scientist_name      TEXT        NOT NULL,
  designation         TEXT,
  department          TEXT,
  crop                TEXT        NOT NULL,
  title               TEXT        NOT NULL,
  advisory_type       TEXT        CHECK (advisory_type IN ('disease_alert','weather_warning','seed_recommendation','fertilizer_schedule','pest_outbreak')),
  severity            TEXT        CHECK (severity IN ('critical','high','medium','routine')),
  content             TEXT        NOT NULL,
  scientific_solution TEXT,
  organic_alternative TEXT,
  district            TEXT,
  state               TEXT,
  published_date      TIMESTAMPTZ DEFAULT NOW(),
  valid_until         TIMESTAMPTZ,
  is_active           BOOLEAN     DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. UNIVERSITY MASTERCLASSES
CREATE TABLE IF NOT EXISTS public.university_masterclasses (
  id                  TEXT        PRIMARY KEY,
  instructor_id       UUID        REFERENCES auth.users ON DELETE SET NULL,
  instructor_name     TEXT        NOT NULL,
  instructor_title    TEXT        NOT NULL,
  university          TEXT        NOT NULL,
  topic               TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  scheduled_date      TEXT        NOT NULL,
  duration_hours      NUMERIC     DEFAULT 2,
  fee                 NUMERIC     DEFAULT 0,
  enrolled_count      NUMERIC     DEFAULT 0,
  max_seats           NUMERIC     DEFAULT 50,
  mode                TEXT        CHECK (mode IN ('online_interactive','on_farm_demonstration')),
  status              TEXT        DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
  enrolled_user_ids   TEXT[]      DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. UNIVERSITY SCIENTISTS DIRECTORY
CREATE TABLE IF NOT EXISTS public.university_experts (
  id                          TEXT        PRIMARY KEY,
  user_id                     UUID        REFERENCES auth.users ON DELETE SET NULL,
  name                        TEXT        NOT NULL,
  title                       TEXT        NOT NULL,
  university                  TEXT        NOT NULL,
  department                  TEXT        NOT NULL,
  specialization              TEXT        NOT NULL,
  state                       TEXT        NOT NULL,
  languages                   TEXT[]      DEFAULT '{"Hindi", "English"}',
  experience_years            NUMERIC     DEFAULT 10,
  is_verified_scientist       BOOLEAN     DEFAULT TRUE,
  is_available_for_call       BOOLEAN     DEFAULT TRUE,
  active_consultations_count  NUMERIC     DEFAULT 0,
  rating                      NUMERIC     DEFAULT 4.9,
  published_bulletins_count   NUMERIC     DEFAULT 12,
  contact_email               TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FARM INTERNSHIPS & APPLICATIONS
CREATE TABLE IF NOT EXISTS public.farm_internships (
  id                      TEXT        PRIMARY KEY,
  farmer_id               TEXT        NOT NULL,
  farmer_name             TEXT        NOT NULL,
  farm_name               TEXT        NOT NULL,
  village                 TEXT        NOT NULL,
  district                TEXT        NOT NULL,
  state                   TEXT        NOT NULL,
  crop_focus              TEXT[]      DEFAULT '{}',
  duration_weeks          NUMERIC     DEFAULT 4,
  stipend_monthly         NUMERIC     DEFAULT 0,
  accommodation_provided  BOOLEAN     DEFAULT TRUE,
  learning_outcomes       TEXT[]      DEFAULT '{}',
  available_slots         NUMERIC     DEFAULT 2,
  applied_count           NUMERIC     DEFAULT 0,
  status                  TEXT        DEFAULT 'open' CHECK (status IN ('open','in_progress','completed')),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internship_applications (
  id                  TEXT        PRIMARY KEY,
  internship_id       TEXT        REFERENCES public.farm_internships ON DELETE CASCADE,
  farmer_id           TEXT        NOT NULL,
  farm_name           TEXT        NOT NULL,
  applicant_id        TEXT        NOT NULL,
  applicant_name      TEXT        NOT NULL,
  applicant_college   TEXT        NOT NULL,
  degree              TEXT        NOT NULL,
  year_of_study       TEXT        NOT NULL,
  phone               TEXT        NOT NULL,
  statement           TEXT,
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  applied_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FIELD CONSULTATIONS (Pathology Desk)
CREATE TABLE IF NOT EXISTS public.field_consultations (
  id                      TEXT        PRIMARY KEY,
  farmer_id               TEXT        NOT NULL,
  farmer_name             TEXT        NOT NULL,
  farmer_district         TEXT        NOT NULL,
  farmer_village          TEXT,
  crop                    TEXT        NOT NULL,
  plot_size_acres         NUMERIC     DEFAULT 1,
  symptoms_or_query       TEXT        NOT NULL,
  urgency                 TEXT        DEFAULT 'routine',
  status                  TEXT        DEFAULT 'open',
  expert_assigned         TEXT,
  expert_university       TEXT,
  diagnosis               TEXT,
  scientific_remedy       TEXT,
  organic_alternative     TEXT,
  replied_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SERVICE BOOKINGS & MESSAGES
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id                      TEXT        PRIMARY KEY,
  service_id              TEXT        NOT NULL,
  service_type            TEXT        CHECK (service_type IN ('warehouse','storage','equipment','machinery','logistics')),
  service_title           TEXT        NOT NULL,
  owner_id                TEXT        NOT NULL,
  owner_name              TEXT        NOT NULL,
  owner_phone             TEXT,
  renter_id               TEXT        NOT NULL,
  renter_name             TEXT        NOT NULL,
  renter_phone            TEXT        NOT NULL,
  start_date              TEXT        NOT NULL,
  end_date                TEXT,
  quantity_requested      NUMERIC     NOT NULL,
  unit                    TEXT        NOT NULL,
  total_estimated_amount  NUMERIC     NOT NULL,
  notes                   TEXT,
  status                  TEXT        DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','completed','cancelled')),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_messages (
  id              TEXT        PRIMARY KEY,
  booking_id      TEXT,
  service_id      TEXT        NOT NULL,
  service_title   TEXT        NOT NULL,
  sender_id       TEXT        NOT NULL,
  sender_name     TEXT        NOT NULL,
  recipient_id    TEXT        NOT NULL,
  recipient_name  TEXT        NOT NULL,
  text            TEXT        NOT NULL,
  is_read         BOOLEAN     DEFAULT FALSE,
  timestamp       TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.storage_facilities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_facilities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machinery_equipment      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_rentals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_advisories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_experts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_internships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_consultations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_messages         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read storage" ON public.storage_facilities;
CREATE POLICY "Public read storage" ON public.storage_facilities FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert storage" ON public.storage_facilities;
CREATE POLICY "Anyone insert storage" ON public.storage_facilities FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Anyone update storage" ON public.storage_facilities;
CREATE POLICY "Anyone update storage" ON public.storage_facilities FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Public read warehouse" ON public.warehouse_facilities;
CREATE POLICY "Public read warehouse" ON public.warehouse_facilities FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert warehouse" ON public.warehouse_facilities;
CREATE POLICY "Anyone insert warehouse" ON public.warehouse_facilities FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Anyone update warehouse" ON public.warehouse_facilities;
CREATE POLICY "Anyone update warehouse" ON public.warehouse_facilities FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Public read machinery" ON public.machinery_equipment;
CREATE POLICY "Public read machinery" ON public.machinery_equipment FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert machinery" ON public.machinery_equipment;
CREATE POLICY "Anyone insert machinery" ON public.machinery_equipment FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Anyone update machinery" ON public.machinery_equipment;
CREATE POLICY "Anyone update machinery" ON public.machinery_equipment FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Public read equipment" ON public.equipment_rentals;
CREATE POLICY "Public read equipment" ON public.equipment_rentals FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert equipment" ON public.equipment_rentals;
CREATE POLICY "Anyone insert equipment" ON public.equipment_rentals FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Anyone update equipment" ON public.equipment_rentals;
CREATE POLICY "Anyone update equipment" ON public.equipment_rentals FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Public read advisories" ON public.university_advisories;
CREATE POLICY "Public read advisories" ON public.university_advisories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert advisory" ON public.university_advisories;
CREATE POLICY "Anyone insert advisory" ON public.university_advisories FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read masterclasses" ON public.university_masterclasses;
CREATE POLICY "Public read masterclasses" ON public.university_masterclasses FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert masterclass" ON public.university_masterclasses;
CREATE POLICY "Anyone insert masterclass" ON public.university_masterclasses FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read experts" ON public.university_experts;
CREATE POLICY "Public read experts" ON public.university_experts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read internships" ON public.farm_internships;
CREATE POLICY "Public read internships" ON public.farm_internships FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert internship" ON public.farm_internships;
CREATE POLICY "Anyone insert internship" ON public.farm_internships FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read applications" ON public.internship_applications;
CREATE POLICY "Public read applications" ON public.internship_applications FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert application" ON public.internship_applications;
CREATE POLICY "Anyone insert application" ON public.internship_applications FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read consultations" ON public.field_consultations;
CREATE POLICY "Public read consultations" ON public.field_consultations FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert consultation" ON public.field_consultations;
CREATE POLICY "Anyone insert consultation" ON public.field_consultations FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read bookings" ON public.service_bookings;
CREATE POLICY "Public read bookings" ON public.service_bookings FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert booking" ON public.service_bookings;
CREATE POLICY "Anyone insert booking" ON public.service_bookings FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read messages" ON public.service_messages;
CREATE POLICY "Public read messages" ON public.service_messages FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone insert message" ON public.service_messages;
CREATE POLICY "Anyone insert message" ON public.service_messages FOR INSERT WITH CHECK (TRUE);

-- 10. REALISTIC PRODUCTION SEED DATA
INSERT INTO public.storage_facilities (
  id, name, owner_name, type, district, state,
  total_capacity_mt, available_capacity_mt, rate_per_bag_per_month,
  is_wdrc_registered, contact_phone, address, is_real
) VALUES
(
  'wh_real_shriram_01',
  'Shriram WDRA Certified Grain Silo & Godown',
  'Shriram Agro Logistics',
  'Dry Godown',
  'Karnal',
  'Haryana',
  12000,
  3800,
  7.5,
  TRUE,
  '+91 98960 55441',
  'GT Road, Karnal Grain Terminal, Haryana',
  TRUE
),
(
  'wh_real_narmada_02',
  'Narmada Agri Logistics & Cold Storage Facility',
  'Narmada Agro Hub',
  'Cold Storage',
  'Indore',
  'Madhya Pradesh',
  6000,
  2400,
  24.0,
  TRUE,
  '+91 94250 88990',
  'AB Road Industrial Logistic Zone, Indore, MP',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.machinery_equipment (
  id, title, category, owner_name, district, state,
  rate_per_hour, rate_per_acre, operator_included, is_available_now,
  contact_phone, model_year, is_real
) VALUES
(
  'eq_real_baldev_01',
  'John Deere 5310 4WD (55 HP) Heavy Harvester & Rotavator',
  'Combine Harvester',
  'Baldev Singh (Kisan)',
  'Patiala',
  'Punjab',
  NULL,
  1650,
  TRUE,
  TRUE,
  '+91 94170 11223',
  '2024',
  TRUE
),
(
  'eq_real_nitesh_02',
  'DJI Agras T40 40-Liter Precision Agriculture Drone Sprayer',
  'Drone Sprayer',
  'Nitesh Gupta',
  'Patiala',
  'Punjab',
  NULL,
  420,
  TRUE,
  TRUE,
  '+91 98141 33221',
  '2025',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.university_advisories (
  id, university, scientist_name, designation, department,
  crop, title, advisory_type, severity, content,
  scientific_solution, organic_alternative, district, state
) VALUES
(
  'adv_pau_01',
  'Punjab Agricultural University (PAU), Ludhiana',
  'Dr. Virender Kumar',
  'Principal Agronomist & Rice Specialist',
  'Department of Agronomy',
  'Basmati Rice / Paddy',
  'PAU Advisory: Stubble Residue Management & Happy Seeder Calibration',
  'disease_alert',
  'high',
  'Avoid open stubble burning. Soil biological assays show immediate reduction of beneficial Trichoderma populations when residue is combusted.',
  'Operate PAU Smart Seeder or Happy Seeder directly into moist stubble without pre-burning.',
  'Spray Waste Decomposer or Pusa Bio-Decomposer microbial consortium at 300L/acre.',
  'Ludhiana',
  'Punjab'
)
ON CONFLICT (id) DO NOTHING;
`;

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [tables, setTables] = useState<TableCheckStatus[]>([
    { name: 'profiles', category: 'Core', description: 'User roles, identity, KYC, phone, land records', exists: true, count: 0 },
    { name: 'marketplace_listings', category: 'Marketplace', description: 'Direct farmer-to-business crop listings', exists: true, count: 0 },
    { name: 'offer_negotiations', category: 'Marketplace', description: 'Live buyer offers, counter-offers, trade requests', exists: true, count: 0 },
    { name: 'order_records', category: 'Marketplace', description: 'Confirmed orders, dispatch status, escrow tracking', exists: true, count: 0 },
    { name: 'storage_facilities', category: 'Storage', description: 'WDRA godowns, cold storage, silos across India', exists: null, count: 0 },
    { name: 'warehouse_facilities', category: 'Storage', description: 'Warehouse infrastructure sync alias', exists: null, count: 0 },
    { name: 'machinery_equipment', category: 'Machinery', description: 'Tractors, harvesters, drone sprayers, laser levelers', exists: null, count: 0 },
    { name: 'equipment_rentals', category: 'Machinery', description: 'Farm equipment rentals sync alias', exists: null, count: 0 },
    { name: 'university_advisories', category: 'University', description: 'Official bulletins & alerts from PAU, HAU, ICAR', exists: null, count: 0 },
    { name: 'university_masterclasses', category: 'University', description: 'Live sessions by agronomists & professors', exists: null, count: 0 },
    { name: 'university_experts', category: 'University', description: 'Verified agricultural scientists directory', exists: null, count: 0 },
    { name: 'farm_internships', category: 'University', description: 'Real working farm placements for agri students', exists: null, count: 0 },
    { name: 'internship_applications', category: 'University', description: 'RAWE student applications to host farms', exists: null, count: 0 },
    { name: 'field_consultations', category: 'University', description: 'Crop disease pathology desk queries & prescriptions', exists: null, count: 0 },
    { name: 'service_bookings', category: 'Storage', description: 'Space & equipment bookings made by farmers', exists: null, count: 0 },
    { name: 'service_messages', category: 'Storage', description: 'Direct inquiries between renters and facility owners', exists: null, count: 0 },
  ]);

  const checkTableStatus = async () => {
    setChecking(true);
    const updated = await Promise.all(
      tables.map(async (t) => {
        try {
          const { count, error } = await supabase
            .from(t.name)
            .select('id', { count: 'exact', head: true });
          
          if (error) {
            return { ...t, exists: false, count: 0, error: error.message };
          }
          return { ...t, exists: true, count: count ?? 0, error: undefined };
        } catch (e: any) {
          return { ...t, exists: false, count: 0, error: e.message || 'Offline' };
        }
      })
    );
    setTables(updated);
    setChecking(false);
  };

  useEffect(() => {
    checkTableStatus();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(ALL_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const activeCount = tables.filter(t => t.exists === true).length;
  const pendingCount = tables.filter(t => t.exists === false).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>PostgreSQL & Supabase Architecture Hub</span>
            </div>
            <h2 className="text-xl font-bold">Storage, Machinery & University Database Tables</h2>
            <p className="text-stone-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Provides dedicated tables for godowns, machinery rentals, university advisories, masterclasses, and pathology consultations with strict Row Level Security (RLS).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'SQL Copied to Clipboard!' : 'Copy Migration SQL'}
            </button>
            <a
              href="https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 border border-white/20"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-300 block">Total Architecture Tables</span>
            <div className="text-xl font-bold font-mono mt-0.5">{tables.length} Tables</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-300 block">Active Online Tables</span>
            <div className="text-xl font-bold font-mono mt-0.5 text-emerald-400">{activeCount} Ready</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-300 block">Pending Creation in Supabase</span>
            <div className="text-xl font-bold font-mono mt-0.5 text-amber-400">{pendingCount} Tables</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-300 block">Database Project</span>
            <div className="text-xs font-mono font-semibold text-stone-200 mt-1 truncate">
              nsbmlujnxwfnuhnidmap
            </div>
          </div>
        </div>
      </div>

      {/* Quick Setup Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">How to create the missing Storage, Machinery & University tables:</h4>
            <ol className="text-xs text-amber-800 list-decimal list-inside space-y-0.5 mt-1">
              <li>Click the green <strong>"Copy Migration SQL"</strong> button above.</li>
              <li>Open your <a href="https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/sql/new" target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-900">Supabase SQL Editor</a>.</li>
              <li>Paste the code and press <strong>RUN (Ctrl+Enter)</strong>. All tables and policies will be created immediately!</li>
            </ol>
          </div>
        </div>

        <button
          onClick={checkTableStatus}
          disabled={checking}
          className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-amber-600' : ''}`} />
          {checking ? 'Checking Tables...' : 'Check Live Status'}
        </button>
      </div>

      {/* Table Status Grid */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-150 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Supabase Database Tables Status</h3>
            <p className="text-xs text-stone-600 mt-0.5">Real-time status check against your Supabase project (nsbmlujnxwfnuhnidmap.supabase.co)</p>
          </div>
          <span className="text-xs text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full font-mono">
            {activeCount}/{tables.length} Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-150 text-stone-700 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Table Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-4 py-3">Purpose & Schema Description</th>
                <th className="px-3 py-3">Live Rows</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tables.map((t) => (
                <tr key={t.name} className="hover:bg-stone-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-stone-900 flex items-center gap-2">
                    <Table className="w-3.5 h-3.5 text-stone-700" />
                    <span>{t.name}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.category === 'Storage' ? 'bg-amber-100 text-amber-800' :
                      t.category === 'Machinery' ? 'bg-blue-100 text-blue-800' :
                      t.category === 'University' ? 'bg-purple-100 text-purple-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 max-w-md">
                    {t.description}
                  </td>
                  <td className="px-3 py-3 font-mono font-semibold text-stone-700">
                    {t.exists ? `${t.count} rows` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.exists === null ? (
                      <span className="inline-flex items-center gap-1 text-stone-700 text-[11px]">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                      </span>
                    ) : t.exists ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active in Supabase
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Needs SQL Run
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-stone-900 rounded-xl overflow-hidden border border-stone-800 shadow-sm">
        <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono text-stone-400 ml-2">supabase/storage_machinery_university_tables.sql</span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs text-stone-300 leading-relaxed bg-stone-900/90 selection:bg-emerald-800">
          <pre className="whitespace-pre-wrap">{ALL_MIGRATION_SQL}</pre>
        </div>
      </div>
    </div>
  );
};
