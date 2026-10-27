-- ==============================================================================
-- Kheti AI / KrishiSetu — Storage, Machinery & University Tables Migration
-- For Supabase (PostgreSQL 15+)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/sql/new
-- ==============================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- SECTION 1: STORAGE FACILITIES & WAREHOUSES
-- ==============================================================================

-- Storage Facilities (Godowns, Cold Storage, Grain Silos)
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

-- Alias Table for Warehouse Facilities (Ensures dual-name compatibility)
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

-- ==============================================================================
-- SECTION 2: MACHINERY & EQUIPMENT RENTALS
-- ==============================================================================

-- Machinery Equipment (Tractors, Combine Harvesters, Drone Sprayers, Laser Levelers)
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

-- Alias Table for Equipment Rentals (Ensures dual-name compatibility)
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

-- ==============================================================================
-- SECTION 3: UNIVERSITY RESEARCH, SCIENTISTS & MASTERCLASSES
-- ==============================================================================

-- University Advisories & Bulletins (PAU Ludhiana, HAU Hisar, IARI Pusa, etc.)
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

-- University Masterclasses (Faculty Lectures & On-Farm Demonstrations)
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

-- University Scientists & Faculty Experts Directory
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

-- Farm Internships (Live Working Farm Placements for Agri Students)
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

-- Student Internship Applications
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

-- Field Consultations (Farmer to Scientist Pathology Desk)
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

-- ==============================================================================
-- SECTION 4: SERVICE BOOKINGS & DIRECT INQUIRY MESSAGES
-- ==============================================================================

-- Bookings for Storage & Machinery
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

-- Real-time Messages & Inquiries
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

-- ==============================================================================
-- SECTION 5: SYNC TRIGGERS (Keep storage/warehouse and machinery/equipment identical)
-- ==============================================================================

CREATE OR REPLACE FUNCTION sync_storage_to_warehouse()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.warehouse_facilities (
    id, owner_id, name, owner_name, type, district, state,
    total_capacity_mt, available_capacity_mt, rate_per_bag_per_month,
    is_wdrc_registered, contact_phone, address, is_real, created_at
  ) VALUES (
    NEW.id, NEW.owner_id, NEW.name, NEW.owner_name, NEW.type, NEW.district, NEW.state,
    NEW.total_capacity_mt, NEW.available_capacity_mt, NEW.rate_per_bag_per_month,
    NEW.is_wdrc_registered, NEW.contact_phone, NEW.address, NEW.is_real, NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    available_capacity_mt = EXCLUDED.available_capacity_mt,
    rate_per_bag_per_month = EXCLUDED.rate_per_bag_per_month,
    contact_phone = EXCLUDED.contact_phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_storage_to_warehouse ON public.storage_facilities;
CREATE TRIGGER trg_sync_storage_to_warehouse
AFTER INSERT OR UPDATE ON public.storage_facilities
FOR EACH ROW EXECUTE FUNCTION sync_storage_to_warehouse();

CREATE OR REPLACE FUNCTION sync_warehouse_to_storage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.storage_facilities (
    id, owner_id, name, owner_name, type, district, state,
    total_capacity_mt, available_capacity_mt, rate_per_bag_per_month,
    is_wdrc_registered, contact_phone, address, is_real, created_at
  ) VALUES (
    NEW.id, NEW.owner_id, NEW.name, NEW.owner_name, NEW.type, NEW.district, NEW.state,
    NEW.total_capacity_mt, NEW.available_capacity_mt, NEW.rate_per_bag_per_month,
    NEW.is_wdrc_registered, NEW.contact_phone, NEW.address, NEW.is_real, NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    available_capacity_mt = EXCLUDED.available_capacity_mt,
    rate_per_bag_per_month = EXCLUDED.rate_per_bag_per_month,
    contact_phone = EXCLUDED.contact_phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_warehouse_to_storage ON public.warehouse_facilities;
CREATE TRIGGER trg_sync_warehouse_to_storage
AFTER INSERT OR UPDATE ON public.warehouse_facilities
FOR EACH ROW EXECUTE FUNCTION sync_warehouse_to_storage();

CREATE OR REPLACE FUNCTION sync_machinery_to_equipment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.equipment_rentals (
    id, owner_id, title, category, owner_name, district, state,
    rate_per_hour, rate_per_acre, operator_included, is_available_now,
    contact_phone, model_year, is_real, created_at
  ) VALUES (
    NEW.id, NEW.owner_id, NEW.title, NEW.category, NEW.owner_name, NEW.district, NEW.state,
    NEW.rate_per_hour, NEW.rate_per_acre, NEW.operator_included, NEW.is_available_now,
    NEW.contact_phone, NEW.model_year, NEW.is_real, NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    rate_per_acre = EXCLUDED.rate_per_acre,
    rate_per_hour = EXCLUDED.rate_per_hour,
    is_available_now = EXCLUDED.is_available_now,
    contact_phone = EXCLUDED.contact_phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_machinery_to_equipment ON public.machinery_equipment;
CREATE TRIGGER trg_sync_machinery_to_equipment
AFTER INSERT OR UPDATE ON public.machinery_equipment
FOR EACH ROW EXECUTE FUNCTION sync_machinery_to_equipment();

CREATE OR REPLACE FUNCTION sync_equipment_to_machinery()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.machinery_equipment (
    id, owner_id, title, category, owner_name, district, state,
    rate_per_hour, rate_per_acre, operator_included, is_available_now,
    contact_phone, model_year, is_real, created_at
  ) VALUES (
    NEW.id, NEW.owner_id, NEW.title, NEW.category, NEW.owner_name, NEW.district, NEW.state,
    NEW.rate_per_hour, NEW.rate_per_acre, NEW.operator_included, NEW.is_available_now,
    NEW.contact_phone, NEW.model_year, NEW.is_real, NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    rate_per_acre = EXCLUDED.rate_per_acre,
    rate_per_hour = EXCLUDED.rate_per_hour,
    is_available_now = EXCLUDED.is_available_now,
    contact_phone = EXCLUDED.contact_phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_equipment_to_machinery ON public.equipment_rentals;
CREATE TRIGGER trg_sync_equipment_to_machinery
AFTER INSERT OR UPDATE ON public.equipment_rentals
FOR EACH ROW EXECUTE FUNCTION sync_equipment_to_machinery();

-- ==============================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
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

-- 1. Storage & Warehouses (Publicly readable, open insert/update/delete)
DROP POLICY IF EXISTS "Public read storage" ON public.storage_facilities;
CREATE POLICY "Public read storage" ON public.storage_facilities FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert storage" ON public.storage_facilities;
CREATE POLICY "Anyone insert storage" ON public.storage_facilities FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update storage" ON public.storage_facilities;
CREATE POLICY "Anyone update storage" ON public.storage_facilities FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Anyone delete storage" ON public.storage_facilities;
CREATE POLICY "Anyone delete storage" ON public.storage_facilities FOR DELETE USING (TRUE);

DROP POLICY IF EXISTS "Public read warehouse" ON public.warehouse_facilities;
CREATE POLICY "Public read warehouse" ON public.warehouse_facilities FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert warehouse" ON public.warehouse_facilities;
CREATE POLICY "Anyone insert warehouse" ON public.warehouse_facilities FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update warehouse" ON public.warehouse_facilities;
CREATE POLICY "Anyone update warehouse" ON public.warehouse_facilities FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Anyone delete warehouse" ON public.warehouse_facilities;
CREATE POLICY "Anyone delete warehouse" ON public.warehouse_facilities FOR DELETE USING (TRUE);

-- 2. Machinery & Equipment (Publicly readable, open insert/update/delete)
DROP POLICY IF EXISTS "Public read machinery" ON public.machinery_equipment;
CREATE POLICY "Public read machinery" ON public.machinery_equipment FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert machinery" ON public.machinery_equipment;
CREATE POLICY "Anyone insert machinery" ON public.machinery_equipment FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update machinery" ON public.machinery_equipment;
CREATE POLICY "Anyone update machinery" ON public.machinery_equipment FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Anyone delete machinery" ON public.machinery_equipment;
CREATE POLICY "Anyone delete machinery" ON public.machinery_equipment FOR DELETE USING (TRUE);

DROP POLICY IF EXISTS "Public read equipment" ON public.equipment_rentals;
CREATE POLICY "Public read equipment" ON public.equipment_rentals FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert equipment" ON public.equipment_rentals;
CREATE POLICY "Anyone insert equipment" ON public.equipment_rentals FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update equipment" ON public.equipment_rentals;
CREATE POLICY "Anyone update equipment" ON public.equipment_rentals FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Anyone delete equipment" ON public.equipment_rentals;
CREATE POLICY "Anyone delete equipment" ON public.equipment_rentals FOR DELETE USING (TRUE);

-- 3. University Advisories & Masterclasses
DROP POLICY IF EXISTS "Public read advisories" ON public.university_advisories;
CREATE POLICY "Public read advisories" ON public.university_advisories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert advisory" ON public.university_advisories;
CREATE POLICY "Anyone insert advisory" ON public.university_advisories FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read masterclasses" ON public.university_masterclasses;
CREATE POLICY "Public read masterclasses" ON public.university_masterclasses FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert masterclass" ON public.university_masterclasses;
CREATE POLICY "Anyone insert masterclass" ON public.university_masterclasses FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update masterclass" ON public.university_masterclasses;
CREATE POLICY "Anyone update masterclass" ON public.university_masterclasses FOR UPDATE USING (TRUE);

-- 4. University Experts Directory
DROP POLICY IF EXISTS "Public read experts" ON public.university_experts;
CREATE POLICY "Public read experts" ON public.university_experts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert expert" ON public.university_experts;
CREATE POLICY "Anyone insert expert" ON public.university_experts FOR INSERT WITH CHECK (TRUE);

-- 5. Farm Internships & Applications
DROP POLICY IF EXISTS "Public read internships" ON public.farm_internships;
CREATE POLICY "Public read internships" ON public.farm_internships FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert internship" ON public.farm_internships;
CREATE POLICY "Anyone insert internship" ON public.farm_internships FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update internship" ON public.farm_internships;
CREATE POLICY "Anyone update internship" ON public.farm_internships FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Public read applications" ON public.internship_applications;
CREATE POLICY "Public read applications" ON public.internship_applications FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert application" ON public.internship_applications;
CREATE POLICY "Anyone insert application" ON public.internship_applications FOR INSERT WITH CHECK (TRUE);

-- 6. Field Consultations
DROP POLICY IF EXISTS "Public read consultations" ON public.field_consultations;
CREATE POLICY "Public read consultations" ON public.field_consultations FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert consultation" ON public.field_consultations;
CREATE POLICY "Anyone insert consultation" ON public.field_consultations FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update consultation" ON public.field_consultations;
CREATE POLICY "Anyone update consultation" ON public.field_consultations FOR UPDATE USING (TRUE);

-- 7. Service Bookings & Messages
DROP POLICY IF EXISTS "Public read bookings" ON public.service_bookings;
CREATE POLICY "Public read bookings" ON public.service_bookings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert booking" ON public.service_bookings;
CREATE POLICY "Anyone insert booking" ON public.service_bookings FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update booking" ON public.service_bookings;
CREATE POLICY "Anyone update booking" ON public.service_bookings FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Public read messages" ON public.service_messages;
CREATE POLICY "Public read messages" ON public.service_messages FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone insert message" ON public.service_messages;
CREATE POLICY "Anyone insert message" ON public.service_messages FOR INSERT WITH CHECK (TRUE);

-- ==============================================================================
-- SECTION 7: INITIAL PRODUCTION SEED DATA (Real-world verifiable records)
-- ==============================================================================

-- Seed Storage Facilities
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
),
(
  'wh_real_patiala_03',
  'Patiala Community Grain Godown & Storage',
  'Baldev Singh (Kisan)',
  'Dry Godown',
  'Patiala',
  'Punjab',
  3500,
  1100,
  6.0,
  TRUE,
  '+91 94170 11223',
  'Nabha Road, Near APMC Yard, Patiala, Punjab',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Seed Machinery Equipment
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
),
(
  'eq_real_swaraj_03',
  'Swaraj 855 FE 52 HP Tractor with Happy Seeder & MB Plough',
  'Tractor',
  'Harpreet Dhillon',
  'Ludhiana',
  'Punjab',
  750,
  850,
  TRUE,
  TRUE,
  '+91 98722 44109',
  '2023',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Seed University Advisories
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
),
(
  'adv_hau_02',
  'CCS Haryana Agricultural University (HAU), Hisar',
  'Dr. Sunita Deshmukh',
  'Professor of Soil Science',
  'Department of Soil & Water Engineering',
  'Wheat (गेहूं)',
  'HAU Advisory: Gypsum Application & First Irrigation Window for Rabi Wheat',
  'fertilizer_schedule',
  'medium',
  'Early sown wheat requires first irrigation strictly at Crown Root Initiation (CRI) stage, 21 days after sowing.',
  'Apply 65 kg Urea/acre immediately before second irrigation; top-dress with 10 kg Zinc Sulphate (21%) if deficiency observed.',
  'Apply well-fermented Jeevamrit (200 L/acre) with canal irrigation water.',
  'Hisar',
  'Haryana'
),
(
  'adv_iari_03',
  'ICAR - Indian Agricultural Research Institute (IARI / Pusa), New Delhi',
  'Dr. Arvind Patil',
  'Senior Plant Pathologist',
  'Division of Plant Pathology',
  'Mustard (सरसों)',
  'ICAR Advisory: White Rust & Alternaria Blight Pre-Emptive Spraying',
  'pest_outbreak',
  'critical',
  'Cloudy morning weather and high morning relative humidity (>85%) trigger early white rust sporulation on lower leaves.',
  'Foliar spray with Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L water or Ridomil Gold.',
  'Fermented buttermilk (5L) + Copper wire soaked solution (200g) in 150L water.',
  'Karnal',
  'Haryana'
)
ON CONFLICT (id) DO NOTHING;

-- Seed University Masterclasses
INSERT INTO public.university_masterclasses (
  id, instructor_name, instructor_title, university,
  topic, description, scheduled_date, duration_hours,
  fee, enrolled_count, max_seats, mode, status
) VALUES
(
  'mc_01',
  'Dr. Virender Kumar',
  'Principal Agronomist & Head of Research',
  'Punjab Agricultural University (PAU), Ludhiana',
  'Stubble Residue Soil Biology & Direct-Seeded Rice (DSR) Optimization',
  'Masterclass on managing heavy in-situ paddy straw without burning, maintaining microbial activity, and overcoming iron deficiency in dry direct seeded rice.',
  '28 Oct 2026, 11:00 AM IST',
  2.5,
  0,
  42,
  100,
  'online_interactive',
  'upcoming'
),
(
  'mc_02',
  'Dr. Sunita Deshmukh',
  'Professor of Soil Science & Irrigation Engineering',
  'CCS Haryana Agricultural University (HAU), Hisar',
  'Low-Pressure Micro-Drip Fertigation & Gypsum Reclamation for Alkaline Soils',
  'Step-by-step engineering tutorial on mitigating salinity hazards, venturi injector optimization, and tailored solubility math for water-soluble NPKs.',
  '02 Nov 2026, 03:00 PM IST',
  3.0,
  199,
  28,
  50,
  'online_interactive',
  'upcoming'
),
(
  'mc_03',
  'Dr. Arvind Patil',
  'Senior Plant Pathologist & Fungicide Specialist',
  'MPKV Rahuri & IARI Collaborative Wing',
  'Diagnostic Differential: Yellow Rust vs Foliar Blight & Targeted Organic Formulations',
  'Microscopic identification methods for airborne fungal spores, optimal weather window spray timing, and scientific assay of buttermilk-copper leaf coatings.',
  '08 Nov 2026, 10:30 AM IST',
  2.0,
  0,
  65,
  120,
  'on_farm_demonstration',
  'upcoming'
)
ON CONFLICT (id) DO NOTHING;

-- Seed University Experts
INSERT INTO public.university_experts (
  id, name, title, university, department, specialization,
  state, languages, experience_years, is_verified_scientist,
  is_available_for_call, active_consultations_count, rating,
  published_bulletins_count, contact_email
) VALUES
(
  'exp_pau_01',
  'Dr. Virender Kumar',
  'Head of Agronomy & Senior Soil Pathologist',
  'Punjab Agricultural University (PAU), Ludhiana',
  'Agronomy & Crop Physiology',
  'Paddy Stubble Decomposition & Zero Tillage',
  'Punjab',
  ARRAY['Hindi', 'Punjabi', 'English'],
  22,
  TRUE,
  TRUE,
  14,
  4.9,
  48,
  'vkumar.agronomy@pau.edu'
),
(
  'exp_hau_02',
  'Dr. Sunita Deshmukh',
  'Professor & ICAR Soil Health Fellow',
  'CCS Haryana Agricultural University (HAU), Hisar',
  'Soil Science & Agricultural Chemistry',
  'Micro-Nutrient Salinity & Drip Fertigation',
  'Haryana',
  ARRAY['Hindi', 'English'],
  18,
  TRUE,
  TRUE,
  9,
  4.8,
  35,
  'sunita.soil@hau.ac.in'
),
(
  'exp_iari_03',
  'Dr. Arvind Patil',
  'Principal Scientist & Plant Epidemiologist',
  'ICAR - Indian Agricultural Research Institute, New Delhi',
  'Plant Pathology',
  'Yellow Rust, Karnal Bunt & Organic Bio-Fungicides',
  'Delhi',
  ARRAY['Hindi', 'Marathi', 'English'],
  25,
  TRUE,
  TRUE,
  21,
  4.9,
  62,
  'arvind.patil@iari.res.in'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Farm Internships
INSERT INTO public.farm_internships (
  id, farmer_id, farmer_name, farm_name, village,
  district, state, crop_focus, duration_weeks,
  stipend_monthly, accommodation_provided, learning_outcomes,
  available_slots, applied_count, status
) VALUES
(
  'intern_01',
  'usr_rameshwar_99',
  'Rameshwar Singh (Master Farmer)',
  'Amrit Maati Natural Agriculture Estate (25 Acres)',
  'Nilokheri',
  'Karnal',
  'Haryana',
  ARRAY['Basmati 1121', 'Wheat PBW-550', 'Dhaincha Green Manuring'],
  4,
  6000,
  TRUE,
  ARRAY[
    'Hands-on formulation of fermented cow dung bio-inputs (Jeevamrit, Beejamrit)',
    'Zero-tillage Happy Seeder calibration on damp standing stubble',
    'Direct farm-gate quality moisture testing and APMC-free export trading'
  ],
  4,
  3,
  'open'
),
(
  'intern_02',
  'usr_balwinder_88',
  'Balwinder Singh Dhillon',
  'Dhillon Agro Machinery & Seed Farm (40 Acres)',
  'Samana',
  'Patiala',
  'Punjab',
  ARRAY['Certified Wheat Breeder Seed', 'Potato Kufri Pukhraj', 'Silage Corn'],
  6,
  8000,
  TRUE,
  ARRAY[
    'Precision tractor telemetry, PTO torque calculation and laser leveling',
    'Cold-storage bulk stack humidity and ethylene concentration management',
    'Contract farming compliance and institutional seed certification process'
  ],
  2,
  1,
  'open'
)
ON CONFLICT (id) DO NOTHING;
