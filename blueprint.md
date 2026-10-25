# Kheti AI — Master Architecture & Complete UI/UX Blueprint

> **File Location:** `/blueprint.md`  
> **Platform Name:** Kheti AI — National Agriculture Intelligence & Farmers Platform (राष्ट्रीय कृषि आसूचना एवं किसान मंच)  
> **Repository Root:** `/`  
> **Last Updated:** October 2026  
> **Target Audience:** Developers, Agronomists, Institutional Partners, UX Architects  

---

## 1. Executive Summary & Vision

**Kheti AI** is a unified, independent agricultural intelligence and rural commerce platform tailored for Indian agriculture. It removes critical information asymmetries across farming communities, APMC wholesale mandis, agro-processing enterprises, and agricultural state universities.

### Core Strategic Pillars
1. **Public Agri-Data Intelligence**: Real-time integration of wholesale mandi modal prices (Agmarknet), hyperlocal agricultural weather (IMD), spraying feasibility radar, and government welfare schemes.
2. **Disintermediated Commerce**: Direct peer-to-peer marketplace connecting KYC-verified farmers directly with millers, food processors, exporters, and godown operators with built-in offer negotiation and escrow transaction states.
3. **50-50 Bilateral University-Farmer Knowledge Bridge**: An equal knowledge exchange where agricultural professors and undergraduate students (RAWE) learn practical ground truths, heavy-stubble machinery calibration, and soil wisdom directly on working farms, while farmers access university pathology laboratories, biochemical assays, and certified breeder trials.
4. **Multimodal AI Agronomist**: Voice-enabled (Hindi, English, Hinglish) and visual crop disease diagnosis powered by Gemini 1.5 Flash and domain-specific tool execution registries.
5. **Cross-Device UI Ergonomics**: Dual-mode UI architecture:
   - **Desktop/Tablet View**: Classic institutional government portal layout with saffron ribbon, 2-column sidebar, and high-density tabular records.
   - **Mobile View**: Ultra-clean, premium fintech-grade layout (Groww/Kite inspired) with sticky top app bar, horizontal scrollable category pills, 3-column quick action grid, horizontal Quick Access card carousel, clean list rows, and fixed bottom navigation bar.

---

## 2. Technical Stack & Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                       KHETI AI STACK                        │
├──────────────────────┬──────────────────────────────────────┤
│ Frontend Framework   │ React 19.0.1 + Vite 8.3.0            │
│ Language             │ TypeScript 7.0.2 (Strict, Bundler)   │
│ Styling Engine       │ Tailwind CSS v4.3.3 (@tailwindcss)   │
│ Iconography          │ Lucide React v0.546.0                │
│ Animation & Motion   │ Motion v12.23.24                     │
│ Typography           │ Plus Jakarta Sans & JetBrains Mono   │
│ Backend / Full-Stack │ Node.js Express 4.21.2 + tsx 4.21.0  │
│ AI & GenAI SDK       │ @google/genai v2.4.0 (Gemini 1.5 Flash)│
│ Speech / Audio       │ Web Speech Recognition & SpeechSynth │
│ Package Management   │ Bun / NPM                            │
└──────────────────────┴──────────────────────────────────────┘
```

---

## 3. Directory Structure & File Hierarchy

```
/
├── .env.example                       # Environment variables template (GEMINI_API_KEY, APP_URL)
├── .gitignore                         # Standard git ignore definitions
├── blueprint.md                       # Comprehensive master architecture blueprint (This File)
├── index.html                         # Institutional HTML entry point (SEO, fonts, meta tags)
├── metadata.json                      # AI Studio applet configuration and capabilities
├── package.json                       # Dependency tree and full-stack execution scripts
├── server.ts                          # Express server entry point (Gemini API proxy + Vite)
├── tsconfig.json                      # TypeScript bundler compiler configuration
├── vite.config.ts                     # Vite build configuration with Tailwind v4 plugin
└── src/
    ├── App.tsx                        # Main application container & view router
    ├── index.css                      # Global Tailwind CSS imports & typography layers
    ├── main.tsx                       # React DOM entry point
    │
    ├── components/
    │   ├── admin/
    │   │   └── AdminPortalView.tsx    # KYC review, dispute arbitration & AI logs
    │   ├── ai/
    │   │   ├── AIAdvisor.tsx          # Central voice/chat workspace & leaf scanner
    │   │   ├── LiveVoiceAgentHUD.tsx  # Zero-latency voice HUD (listening, processing, replying)
    │   │   └── ServiceCards.tsx       # Dynamic visual action cards rendered by AI tools
    │   ├── business/
    │   │   └── BusinessPortalView.tsx # Silo tracking, procurement tenders & bulk trading
    │   ├── farmer/
    │   │   └── FarmManagerView.tsx    # Farm parcels, soil health metrics & ledger
    │   ├── home/
    │   │   ├── GovPortalHome.tsx      # Dual-column homepage & Groww-style mobile dashboard
    │   │   ├── HeroCarousel.tsx       # Hero visual banner carousel
    │   │   ├── QuickLinksGrid.tsx     # 3-column mobile action grid
    │   │   └── RightSidebar.tsx       # Institutional links & market notices
    │   ├── layout/
    │   │   ├── MobileFrame.tsx        # Simulated Android preview wrapper
    │   │   └── Navbar.tsx             # Sticky top header, category pills bar & bottom nav bar
    │   ├── mandi/
    │   │   └── MandiTrackerView.tsx   # Live Agmarknet rates, MSP comparisons & list view
    │   ├── marketplace/
    │   │   ├── MarketplaceView.tsx    # Direct buy/sell listings, negotiation & orders
    │   │   └── ServicesView.tsx       # WDRA warehouses, cold storage & machine rental
    │   ├── maps/
    │   │   └── ServicesMap.tsx        # Leaflet storage map (isolated z-10)
    │   ├── schemes/
    │   │   └── SchemesView.tsx        # Government schemes directory & eligibility quiz
    │   └── university/
    │       └── UniversityConnectView.tsx # 50-50 Bilateral University ⇄ Farmer Bridge
    │
    ├── data/
    │   └── mockData.ts                # Realistic Indian agricultural domain dataset
    ├── hooks/
    │   ├── useAuth.ts                 # Auth state, user governance & admin privileges
    │   ├── useListings.ts             # Marketplace listings & negotiation state
    │   ├── useServicesManager.ts      # Warehouses, equipment rentals & bookings
    │   └── useUniversityManager.ts    # Bilateral exchanges & 42 integrated university count
    ├── services/
    │   ├── aiAdvisorService.ts        # Gemini API client, speech synthesis & dispatcher
    │   ├── mandiService.ts            # Agmarknet live price fetcher
    │   ├── weatherService.ts          # IMD & GPS weather service
    │   └── toolRegistry.ts            # Agricultural tool execution engine
    └── types/
        └── index.ts                   # Strict TypeScript domain interfaces
```

---

## 4. Complete UI/UX Blueprint by Page (Mobile & Desktop Specifications)

### Page 1: Homepage (`GovPortalHome.tsx`)
- **Desktop UI**:
  - Header with institutional logo, saffron ribbon, language selector, role switcher.
  - Left Column (70%): Hero Carousel, Tabbed About/Features/ICAR Box, 4-column Quick Links.
  - Right Column (30%): Important Links box, Live Market Notices ticker box.
- **Mobile UI (Fintech/Groww Style)**:
  - **Top App Bar**: Sticky bar (`bg-emerald-900`) with logo, greeting, language pill (`HI`/`EN`), and hamburger menu toggle button.
  - **Horizontal Category Pills Bar**: Scrollable capsule list (`Explore`, `Mandi Bhav`, `AI Voice`, `Weather`, `Marketplace`, `Godown`, `Scientists`, `Yojana`, `My Farm`). Active pill styled in solid saffron (`bg-amber-500 text-stone-950 font-extrabold`).
  - **3-Column Feature Icon Grid**: 6 quick action shortcuts (`Mandi Rates`, `AI Voice`, `Weather Radar`, `Buy & Sell`, `Storage Rent`, `Kisan Yojana`) with 48px rounded-2xl icon containers and 1-line subtext.
  - **Quick Access Horizontal Carousel**: Smooth horizontal scroller with compact cards (`Leaf Disease Scanner`, `Godown & Cold Storage`, `Scientist Desk`, `PM-Kisan Subsidy`).
  - **All Mandi Rates Today List**: Groww-style fund rows (crop avatar on left, commodity + APMC location in middle, rate + change percentage badge on right).
  - **Fixed Bottom Nav Bar**: 5 core tabs (`Explore` 🏠, `Mandi` 📊, **`AI Voice` 🤖**, `Market` 🛒, `My Farm` 🌾).

### Page 2: Dainik Mandi Bhav (`MandiTrackerView.tsx`)
- **Desktop UI**:
  - High-density data table with 6 columns: Mandi & Location, Commodity/Variety, Modal Rate, Min/Max Range, Daily Change, MSP Benchmark.
- **Mobile UI**:
  - Search & filter pill bar on top (`State` dropdown, `Crop` dropdown, text search).
  - Clean Groww list items (`p-3 border-b hover:bg-stone-50`):
    - Left: Crop avatar (`🌾`, `🌱`, `🌻`, `☁️`, `🥔`).
    - Middle: Commodity Name + Variety in bold, Mandi Yard + District below.
    - Right: Modal Rate (`₹2,425 / qtl`) + color-coded change percentage badge (`+2.1%` green / `-0.5%` red).

### Page 3: Central AI Advisor (`AIAdvisor.tsx` & `LiveVoiceAgentHUD.tsx`)
- **Desktop & Mobile UI**:
  - Container height: `h-[calc(100vh-8.5rem)]` on mobile, `h-[calc(100vh-5.5rem)]` on desktop.
  - Live Voice HUD with 4 explicit states (`listening`, `processing`, `replying`, `idle`).
  - Chat bubbles with Indian female voice listen button (`🔊 भारतीय महिला आवाज़ में सुनें`).
  - Camera/Leaf Scanner button for instant disease diagnosis.
  - Suggested prompts strip above sticky bottom composer.

### Page 4: Weather & Spray Advisory (`WeatherAdvisoryView.tsx`)
- **Desktop & Mobile UI**:
  - Location header with GPS detect button and district selector.
  - Current conditions hero card: temperature (`28°C`), condition in Hindi/English, weather icon.
  - Stacked quick metrics cards: Relative Humidity (`75%`), Wind Velocity (`8 km/h`), Diurnal Variation (`12°C`).
  - Foliar Spray Safety Advisory card (`Optimal & Safe` or `Hold Off`).

### Page 5: Upaj Kharidi Bikri Marketplace (`MarketplaceView.tsx`)
- **Desktop & Mobile UI**:
  - Horizontal filter tabs (`All Listings`, `Farmers Selling`, `Millers Looking`, `My Dashboard`).
  - Produce listing cards (`rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs`):
    - Seller name + verified KYC shield icon.
    - Commodity name, variety, grade.
    - Borderless inner specs container: `Available Quantity` & `Asking Rate` in bold `font-mono`.
    - Pickup/delivery logistical terms.
    - `Make Offer` CTA button + `Fair Price?` AI query trigger.

### Page 6: Storage & Machinery Directory (`ServicesView.tsx`)
- **Desktop & Mobile UI**:
  - Category filter pills (`Storage & Godowns`, `Farm Machinery`, `My Space Dashboard`, `Message Portal`, `My Bookings`).
  - Leaflet `ServicesMap` isolated with `z-10` and `isolation: 'isolate'` so map overlays never bleed over headers or mobile navigation.
  - Warehouse cards: Capacity MT, storage tariff per bag, WDRA certification badge, `Reserve Space` CTA button.
  - Machinery cards: Hourly/per-acre rental rate, operator status, `Book Machinery` CTA button.

### Page 7: 50-50 University-Farmer Knowledge Bridge (`UniversityConnectView.tsx`)
- **Desktop & Mobile UI**:
  - Top stats strip displaying `42 Integrated Agricultural Universities` (managed dynamically by Admin Panel).
  - Bilateral exchange cards (`Universities Seeking Farmers` vs `Farmers Teaching Universities`).
  - Masterclasses section & Farm Internships section.

### Page 8: Government Schemes & Subsidies (`SchemesView.tsx`)
- **Desktop & Mobile UI**:
  - Yojana directory (PM-KISAN, PMFBY, KCC, SMAM, AIF).
  - Interactive subsidy eligibility quiz with instant grant calculations.

### Page 9: Farm Manager & Ledger (`FarmManagerView.tsx`)
- **Desktop & Mobile UI**:
  - Cultivated landholding stats, crop parcel health tracker, input expense ledger, and realized net profit editor.

### Page 10: Enterprise Business Portal (`BusinessPortalView.tsx`)
- **Desktop & Mobile UI**:
  - Grain miller & warehouse operator console tracking grain silos, processing yields, and procurement tenders.

### Page 11: Platform Governance & Admin Portal (`AdminPortalView.tsx`)
- **Desktop & Mobile UI**:
  - Restricted access for `niteshunofficial1234@gmail.com`.
  - User governance panel (grant/revoke admin, ban/unban user).
  - Academic governance panel (edit count of integrated universities, approve/reject internships).
  - KYC verification queue & dispute arbitration panel.

---

## 5. Architectural Data Flow

```
                      ┌────────────────────────────┐
                      │         index.html         │
                      └─────────────┬──────────────┘
                                    │ mounts root
                      ┌─────────────▼──────────────┐
                      │        src/main.tsx        │
                      └─────────────┬──────────────┘
                                    │ renders
                      ┌─────────────▼──────────────┐
                      │        src/App.tsx         │
                      └──────┬──────────────┬──────┘
                             │              │
               ┌─────────────▼──────┐ ┌─────▼──────────────────┐
               │    src/Navbar.tsx  │ │ src/MobileFrame.tsx    │
               │ (Header/Pills/Nav) │ │ (Simulated Android OS) │
               └────────────────────┘ └────────────────────────┘
                                    │
               ┌────────────────────┴──────────────────────────┐
               │                ACTIVE VIEW ROUTER             │
               ├───────────────────────────────────────────────┤
               │ 1. GovPortalHome.tsx        (Tab: 'home')     │
               │ 2. AIAdvisor.tsx            (Tab: 'ai')       │
               │ 3. MandiTrackerView.tsx     (Tab: 'mandi')    │
               │ 4. WeatherAdvisoryView.tsx  (Tab: 'weather')  │
               │ 5. MarketplaceView.tsx      (Tab: 'market')   │
               │ 6. ServicesView.tsx         (Tab: 'services') │
               │ 7. UniversityConnectView.tsx(Tab: 'uni')      │
               │ 8. SchemesView.tsx          (Tab: 'schemes')  │
               │ 9. FarmManagerView.tsx      (Tab: 'farm')     │
               │ 10. BusinessPortalView.tsx  (Tab: 'business') │
               │ 11. AdminPortalView.tsx     (Tab: 'admin')    │
               └────────────────────┬──────────────────────────┘
                                    │
               ┌────────────────────┴──────────────────────────┐
               │               DOMAIN DATA & SERVICES          │
               ├───────────────────────────────────────────────┤
               │ • src/data/mockData.ts (State Source)         │
               │ • src/types/index.ts (Type Contracts)         │
               │ • src/services/toolRegistry.ts (Tool Engine)  │
               │ • src/services/aiAdvisorService.ts (Gemini)   │
               └────────────────────┬──────────────────────────┘
                                    │
               ┌────────────────────▼──────────────────────────┐
               │         server.ts (Express Backend)           │
               │  - /api/gemini/chat                           │
               │  - /api/tools/execute                         │
               │  - Vite middlewares in development            │
               └───────────────────────────────────────────────┘
```

---

## 6. UI/UX Design System & Compliance Rules

- **Color Palette**:
  - Primary Saffron / Amber: `#d97706`, `amber-600`, `orange-600`.
  - Secondary Emerald Green: `#065f46`, `emerald-800` (Verified status, growth, trust).
  - Surface Backgrounds: `#fbfbf9`, `stone-100` (Warm neutral feel, zero harsh glare).
  - Borders & Dividers: `border-stone-200/80`, `border-amber-300`.
- **Typography**:
  - Body & UI Headings: `Plus Jakarta Sans`, sans-serif.
  - Numbers, Currency & Mandi Rates: `JetBrains Mono`, monospace with tabular figures (`tabular-nums`).
- **Accessibility**:
  - Live font scaler: `A-` (0.9x), `A` (1.0x), `A+` (1.15x).
  - Instant translation between हिन्दी (Hindi), English, and Hinglish.
