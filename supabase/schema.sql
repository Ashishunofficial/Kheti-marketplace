-- ============================================================
--  Kheti AI — Production PostgreSQL Database Schema (Supabase)
--  Multi-User Isolation, Strict RLS & Data Protection
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
--  1. USER PROFILES (1-to-1 with auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name                TEXT        NOT NULL,
  phone               TEXT,
  village             TEXT        DEFAULT '',
  district            TEXT        DEFAULT '',
  state               TEXT        DEFAULT 'Haryana',
  roles               TEXT[]      DEFAULT ARRAY['farmer'],
  active_role         TEXT        DEFAULT 'farmer'
                      CHECK (active_role IN ('farmer','business','scientist','admin')),
  kyc_status          TEXT        DEFAULT 'verified'
                      CHECK (kyc_status IN ('pending','verified','rejected')),
  land_acres          NUMERIC     DEFAULT 0,
  primary_crops       TEXT[]      DEFAULT '{}',
  business_type       TEXT        CHECK (business_type IN ('trader','mill_owner','warehouse_operator','equipment_provider','fpo')),
  business_name       TEXT,
  gst_number          TEXT,
  apmc_license        TEXT,
  university_name     TEXT,
  academic_title      TEXT,
  research_department TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  2. MARKETPLACE PRODUCE LISTINGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id                    TEXT        PRIMARY KEY,
  seller_id             UUID        REFERENCES auth.users ON DELETE CASCADE,
  seller_name           TEXT        NOT NULL,
  seller_type           TEXT        CHECK (seller_type IN ('farmer','business','fpo')),
  is_verified           BOOLEAN     DEFAULT FALSE,
  listing_type          TEXT        NOT NULL CHECK (listing_type IN ('sell','buy')),
  commodity             TEXT        NOT NULL,
  variety               TEXT        DEFAULT '',
  grade                 TEXT        DEFAULT 'FAQ',
  quantity              NUMERIC     NOT NULL,
  occupied_quantity     NUMERIC     DEFAULT 0,
  unit                  TEXT        DEFAULT 'Quintal',
  asking_price          NUMERIC     NOT NULL,
  min_order_quantity    NUMERIC     DEFAULT 10,
  moisture_content_percent NUMERIC,
  location_village      TEXT,
  location_district     TEXT        NOT NULL,
  location_state        TEXT        NOT NULL,
  pickup_available      BOOLEAN     DEFAULT TRUE,
  delivery_available    BOOLEAN     DEFAULT FALSE,
  notes                 TEXT,
  status                TEXT        DEFAULT 'active'
                        CHECK (status IN ('active','in_negotiation','sold','expired','cancelled')),
  posted_date           TIMESTAMPTZ DEFAULT NOW(),
  expiry_date           TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days'),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  3. OFFER NEGOTIATIONS (Marketplace Requests)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offer_negotiations (
  id              TEXT        PRIMARY KEY,
  listing_id      TEXT        REFERENCES public.marketplace_listings ON DELETE CASCADE,
  commodity       TEXT        NOT NULL,
  buyer_id        UUID        REFERENCES auth.users ON DELETE CASCADE,
  buyer_name      TEXT        NOT NULL,
  seller_id       UUID        REFERENCES auth.users ON DELETE CASCADE,
  seller_name     TEXT        NOT NULL,
  original_price  NUMERIC     NOT NULL,
  offered_price   NUMERIC     NOT NULL,
  quantity        NUMERIC     NOT NULL,
  unit            TEXT        DEFAULT 'Quintal',
  history         JSONB       DEFAULT '[]'::jsonb,
  status          TEXT        DEFAULT 'pending'
                  CHECK (status IN ('pending','countered','accepted','rejected','order_created')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  4. ORDER RECORDS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_records (
  id              TEXT        PRIMARY KEY,
  listing_id      TEXT        REFERENCES public.marketplace_listings ON DELETE SET NULL,
  offer_id        TEXT        REFERENCES public.offer_negotiations ON DELETE SET NULL,
  buyer_id        UUID        REFERENCES auth.users ON DELETE SET NULL,
  buyer_name      TEXT        NOT NULL,
  seller_id       UUID        REFERENCES auth.users ON DELETE SET NULL,
  seller_name     TEXT        NOT NULL,
  commodity       TEXT        NOT NULL,
  quantity        NUMERIC     NOT NULL,
  unit            TEXT        DEFAULT 'Quintal',
  agreed_price    NUMERIC     NOT NULL,
  total_amount    NUMERIC     NOT NULL,
  delivery_type   TEXT        DEFAULT 'buyer_pickup'
                  CHECK (delivery_type IN ('seller_delivery','buyer_pickup')),
  pickup_location TEXT,
  status          TEXT        DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','dispatched','weighment_verified','delivered','completed','disputed','cancelled')),
  payment_status  TEXT        DEFAULT 'escrow_locked'
                  CHECK (payment_status IN ('pending','escrow_locked','partially_released','settled','refunded')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  5. WAREHOUSE FACILITIES (Godowns, Cold Storage, Silos)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.warehouse_facilities (
  id                      TEXT        PRIMARY KEY,
  owner_id                UUID        REFERENCES auth.users ON DELETE CASCADE,
  name                    TEXT        NOT NULL,
  owner_name              TEXT        NOT NULL,
  type                    TEXT        CHECK (type IN ('Dry Godown','Cold Storage','Silo')),
  district                TEXT        NOT NULL,
  state                   TEXT        NOT NULL,
  total_capacity_mt       NUMERIC     NOT NULL,
  available_capacity_mt   NUMERIC     NOT NULL,
  rate_per_bag_per_month  NUMERIC     NOT NULL,
  is_wdrc_registered      BOOLEAN     DEFAULT FALSE,
  contact_phone           TEXT        NOT NULL,
  address                 TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  6. EQUIPMENT RENTALS (Tractors, Harvesters, Drone Sprayers)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipment_rentals (
  id                  TEXT        PRIMARY KEY,
  owner_id            UUID        REFERENCES auth.users ON DELETE CASCADE,
  title               TEXT        NOT NULL,
  category            TEXT        CHECK (category IN ('Tractor','Combine Harvester','Laser Leveler','Rotavator','Drone Sprayer','Vehicle / Transport')),
  owner_name          TEXT        NOT NULL,
  district            TEXT        NOT NULL,
  state               TEXT        NOT NULL,
  rate_per_hour       NUMERIC,
  rate_per_acre       NUMERIC,
  operator_included   BOOLEAN     DEFAULT TRUE,
  is_available_now    BOOLEAN     DEFAULT TRUE,
  contact_phone       TEXT,
  model_year          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  7. SERVICE BOOKINGS (Reservations for Space / Machinery)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id                      TEXT        PRIMARY KEY,
  service_id              TEXT        NOT NULL,
  service_type            TEXT        CHECK (service_type IN ('warehouse','equipment','logistics')),
  service_title           TEXT        NOT NULL,
  owner_id                UUID        REFERENCES auth.users ON DELETE CASCADE,
  owner_name              TEXT        NOT NULL,
  owner_phone             TEXT,
  renter_id               UUID        REFERENCES auth.users ON DELETE CASCADE,
  renter_name             TEXT        NOT NULL,
  renter_phone            TEXT        NOT NULL,
  start_date              DATE        NOT NULL,
  end_date                DATE,
  quantity_requested      NUMERIC     NOT NULL,
  unit                    TEXT        NOT NULL,
  total_estimated_amount  NUMERIC     NOT NULL,
  notes                   TEXT,
  status                  TEXT        DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','rejected','completed','cancelled')),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  8. SERVICE MESSAGES & INQUIRY CHAT
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_messages (
  id              TEXT        PRIMARY KEY,
  booking_id      TEXT        REFERENCES public.service_bookings ON DELETE SET NULL,
  service_id      TEXT        NOT NULL,
  service_title   TEXT        NOT NULL,
  sender_id       UUID        REFERENCES auth.users ON DELETE CASCADE,
  sender_name     TEXT        NOT NULL,
  recipient_id    UUID        REFERENCES auth.users ON DELETE CASCADE,
  recipient_name  TEXT        NOT NULL,
  text            TEXT        NOT NULL,
  is_read         BOOLEAN     DEFAULT FALSE,
  timestamp       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  9. UNIVERSITY MASTERCLASSES (Offered by Professors & Experts)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.university_masterclasses (
  id                  TEXT        PRIMARY KEY,
  instructor_id       UUID        REFERENCES auth.users ON DELETE CASCADE,
  instructor_name     TEXT        NOT NULL,
  instructor_title    TEXT        NOT NULL,
  university          TEXT        NOT NULL,
  topic               TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  scheduled_date      TIMESTAMPTZ NOT NULL,
  duration_hours      NUMERIC     DEFAULT 2,
  fee                 NUMERIC     DEFAULT 0,
  enrolled_count      NUMERIC     DEFAULT 0,
  max_seats           NUMERIC     DEFAULT 50,
  mode                TEXT        CHECK (mode IN ('online_interactive','on_farm_demonstration')),
  status              TEXT        DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  10. FARM INTERNSHIPS (Listed by Working Farmers for Students)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.farm_internships (
  id                      TEXT        PRIMARY KEY,
  farmer_id               UUID        REFERENCES auth.users ON DELETE CASCADE,
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

-- ─────────────────────────────────────────────────────────────
--  11. INTERNSHIP APPLICATIONS (Students applying to Farms)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internship_applications (
  id                  TEXT        PRIMARY KEY,
  internship_id       TEXT        REFERENCES public.farm_internships ON DELETE CASCADE,
  farmer_id           UUID        REFERENCES auth.users ON DELETE CASCADE,
  farm_name           TEXT        NOT NULL,
  applicant_id        UUID        REFERENCES auth.users ON DELETE CASCADE,
  applicant_name      TEXT        NOT NULL,
  applicant_college   TEXT        NOT NULL,
  degree              TEXT        NOT NULL,
  year_of_study       TEXT        NOT NULL,
  phone               TEXT        NOT NULL,
  statement           TEXT,
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  applied_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  12. SCIENTIST CONSULTATIONS (Farmers Asking University Experts)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.field_consultations (
  id                      TEXT        PRIMARY KEY,
  farmer_id               UUID        REFERENCES auth.users ON DELETE CASCADE,
  farmer_name             TEXT        NOT NULL,
  farmer_district         TEXT        NOT NULL,
  crop                    TEXT        NOT NULL,
  plot_size_acres         NUMERIC     DEFAULT 1,
  symptoms_or_query       TEXT        NOT NULL,
  urgency                 TEXT        DEFAULT 'routine' CHECK (urgency IN ('routine','urgent_pest_outbreak','pre_sowing_seed_selection')),
  status                  TEXT        DEFAULT 'open' CHECK (status IN ('open','answered','field_visit_scheduled')),
  expert_assigned         TEXT,
  expert_university       TEXT,
  diagnosis               TEXT,
  scientific_remedy       TEXT,
  organic_alternative     TEXT,
  replied_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS) POLICIES — 100% USER ISOLATION
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_negotiations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_records              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_facilities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_rentals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_masterclasses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_internships           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_consultations        ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Public read, User only edits own
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Marketplace: Public read active, Seller manages own
CREATE POLICY "Public read active listings" ON public.marketplace_listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "Users insert own listing" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users update own listing" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users delete own listing" ON public.marketplace_listings FOR DELETE USING (auth.uid() = seller_id);

-- 3. Offer Negotiations: Only buyer and seller can see or update
CREATE POLICY "Parties view offers" ON public.offer_negotiations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyer create offer" ON public.offer_negotiations FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Parties update offer" ON public.offer_negotiations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 4. Warehouses & Equipment: Public read, Owner manages own
CREATE POLICY "Public read warehouses" ON public.warehouse_facilities FOR SELECT USING (TRUE);
CREATE POLICY "Owner insert warehouse" ON public.warehouse_facilities FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner update warehouse" ON public.warehouse_facilities FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner delete warehouse" ON public.warehouse_facilities FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Public read equipment" ON public.equipment_rentals FOR SELECT USING (TRUE);
CREATE POLICY "Owner insert equipment" ON public.equipment_rentals FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner update equipment" ON public.equipment_rentals FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner delete equipment" ON public.equipment_rentals FOR DELETE USING (auth.uid() = owner_id);

-- 5. Service Bookings: Only owner and renter can see/update
CREATE POLICY "Parties view bookings" ON public.service_bookings FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = renter_id);
CREATE POLICY "Renter create booking" ON public.service_bookings FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Parties update booking" ON public.service_bookings FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = renter_id);

-- 6. Messages: Only sender and recipient can see
CREATE POLICY "Parties view messages" ON public.service_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Sender insert message" ON public.service_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 7. Masterclasses: Public read, Instructor manages
CREATE POLICY "Public read masterclasses" ON public.university_masterclasses FOR SELECT USING (TRUE);
CREATE POLICY "Instructor insert masterclass" ON public.university_masterclasses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructor update masterclass" ON public.university_masterclasses FOR UPDATE USING (auth.uid() = instructor_id);

-- 8. Farm Internships: Public read, Farmer manages
CREATE POLICY "Public read internships" ON public.farm_internships FOR SELECT USING (TRUE);
CREATE POLICY "Farmer insert internship" ON public.farm_internships FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmer update internship" ON public.farm_internships FOR UPDATE USING (auth.uid() = farmer_id);

-- 9. Internship Applications: Only farmer and applicant can see
CREATE POLICY "Parties view applications" ON public.internship_applications FOR SELECT USING (auth.uid() = farmer_id OR auth.uid() = applicant_id);
CREATE POLICY "Student apply internship" ON public.internship_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Parties update application" ON public.internship_applications FOR UPDATE USING (auth.uid() = farmer_id OR auth.uid() = applicant_id);

-- 10. Consultations: Farmer and assigned expert can see
CREATE POLICY "Farmer view consultations" ON public.field_consultations FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmer insert consultation" ON public.field_consultations FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- ─────────────────────────────────────────────────────────────
--  PERFORMANCE INDEXES (Prevent Full-Table Scans)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_seller_id     ON public.marketplace_listings (seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_parties          ON public.offer_negotiations (buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parties        ON public.service_bookings (owner_id, renter_id);
CREATE INDEX IF NOT EXISTS idx_messages_parties        ON public.service_messages (sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_internships_farmer      ON public.farm_internships (farmer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_farmer    ON public.field_consultations (farmer_id);
