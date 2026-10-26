import {
  MandiPriceRecord,
  MarketplaceListing,
  GovernmentScheme,
  WeatherCondition,
  WarehouseFacility,
  EquipmentRental,
  UserProfile,
  OfferNegotiation,
  OrderRecord,
  UniversityExpert,
  FieldConsultation,
  UniversityFieldTrial,
  ServiceBooking,
  ServiceMessage
} from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_rameshwar_99',
  name: 'Rameshwar Singh',
  phone: '+91 98124 55432',
  roles: ['farmer', 'business', 'scientist'],
  activeRole: 'farmer',
  isKycVerified: true,
  state: 'Haryana',
  district: 'Karnal',
  village: 'Nilokheri',
  farmSizeAcres: 14.5,
  primaryCrops: ['Wheat (गेहूं)', 'Basmati Paddy (धान)', 'Mustard (सरसों)'],
  businessType: 'mill_owner',
  businessName: 'Kisan Jyoti Agro Processing & Storage',
  gstNumber: '06AAECK2948P1Z5',
  apmcLicense: 'HR-KRN-APMC-8821',
  universityName: 'CCS Haryana Agricultural University (HAU) Extension',
  academicTitle: 'Adjunct Field Research Fellow',
  researchDepartment: 'Agronomy & Soil Extension'
};

export const MOCK_MANDI_PRICES: MandiPriceRecord[] = [
  {
    id: 'mnd_krn_wheat_1',
    mandiName: 'Karnal Grain Mandi',
    district: 'Karnal',
    state: 'Haryana',
    commodity: 'Wheat (गेहूं)',
    variety: 'HD-2967 / Sharbati',
    grade: 'Grade A',
    minPrice: 2420,
    maxPrice: 2580,
    modalPrice: 2510,
    mspPrice: 2275,
    change: 35,
    arrivalsQuintal: 4200,
    reportedDate: '2026-10-17 06:30 AM',
    freshnessStatus: 'Live (Updated 1h ago)',
    historicalTrend: [
      { day: 'Mon', price: 2450 },
      { day: 'Tue', price: 2465 },
      { day: 'Wed', price: 2470 },
      { day: 'Thu', price: 2490 },
      { day: 'Fri', price: 2475 },
      { day: 'Sat', price: 2510 },
      { day: 'Today', price: 2510 }
    ]
  },
  {
    id: 'mnd_khn_paddy_2',
    mandiName: 'Khanna Mandi (Asia Largest)',
    district: 'Ludhiana',
    state: 'Punjab',
    commodity: 'Basmati Paddy (धान)',
    variety: 'Pusa 1121 (Golden Sella)',
    grade: 'Super',
    minPrice: 3850,
    maxPrice: 4280,
    modalPrice: 4120,
    mspPrice: 2203,
    change: 60,
    arrivalsQuintal: 8900,
    reportedDate: '2026-10-17 07:00 AM',
    freshnessStatus: 'Live (Updated 1h ago)',
    historicalTrend: [
      { day: 'Mon', price: 3950 },
      { day: 'Tue', price: 4010 },
      { day: 'Wed', price: 4050 },
      { day: 'Thu', price: 4080 },
      { day: 'Fri', price: 4060 },
      { day: 'Sat', price: 4120 },
      { day: 'Today', price: 4120 }
    ]
  },
  {
    id: 'mnd_nmc_mustard_3',
    mandiName: 'Neemuch Krishi Upaj Mandi',
    district: 'Neemuch',
    state: 'Madhya Pradesh',
    commodity: 'Mustard (सरसों)',
    variety: 'Black Mustard (42% Oil)',
    grade: 'FAQ (Fair Average Quality)',
    minPrice: 5350,
    maxPrice: 5780,
    modalPrice: 5620,
    mspPrice: 5650,
    change: -20,
    arrivalsQuintal: 3100,
    reportedDate: '2026-10-17 06:15 AM',
    freshnessStatus: 'Today (Synced Agmarknet)',
    historicalTrend: [
      { day: 'Mon', price: 5700 },
      { day: 'Tue', price: 5680 },
      { day: 'Wed', price: 5660 },
      { day: 'Thu', price: 5650 },
      { day: 'Fri', price: 5640 },
      { day: 'Sat', price: 5620 },
      { day: 'Today', price: 5620 }
    ]
  },
  {
    id: 'mnd_ind_soybean_4',
    mandiName: 'Indore APMC Mandi',
    district: 'Indore',
    state: 'Madhya Pradesh',
    commodity: 'Soybean (सोयाबीन)',
    variety: 'Yellow JS-9560',
    grade: 'Grade A',
    minPrice: 4600,
    maxPrice: 4920,
    modalPrice: 4790,
    mspPrice: 4892,
    change: 45,
    arrivalsQuintal: 6400,
    reportedDate: '2026-10-17 05:45 AM',
    freshnessStatus: 'Today (Synced Agmarknet)',
    historicalTrend: [
      { day: 'Mon', price: 4700 },
      { day: 'Tue', price: 4720 },
      { day: 'Wed', price: 4750 },
      { day: 'Thu', price: 4760 },
      { day: 'Fri', price: 4745 },
      { day: 'Sat', price: 4790 },
      { day: 'Today', price: 4790 }
    ]
  },
  {
    id: 'mnd_azd_potato_5',
    mandiName: 'Azadpur Wholesale Mandi',
    district: 'North Delhi',
    state: 'Delhi NCR',
    commodity: 'Potato (आलू)',
    variety: 'Chipsona / Kufri Jyoti',
    grade: 'Grade A',
    minPrice: 1550,
    maxPrice: 1950,
    modalPrice: 1820,
    mspPrice: 0,
    change: -30,
    arrivalsQuintal: 14200,
    reportedDate: '2026-10-17 06:50 AM',
    freshnessStatus: 'Live (Updated 1h ago)',
    historicalTrend: [
      { day: 'Mon', price: 1900 },
      { day: 'Tue', price: 1880 },
      { day: 'Wed', price: 1870 },
      { day: 'Thu', price: 1850 },
      { day: 'Fri', price: 1850 },
      { day: 'Sat', price: 1820 },
      { day: 'Today', price: 1820 }
    ]
  },
  {
    id: 'mnd_nsk_onion_6',
    mandiName: 'Lasalgaon APMC (Asia Onion Hub)',
    district: 'Nashik',
    state: 'Maharashtra',
    commodity: 'Onion (प्याज)',
    variety: 'Garva / Red Onion',
    grade: 'FAQ (Fair Average Quality)',
    minPrice: 2200,
    maxPrice: 2850,
    modalPrice: 2650,
    mspPrice: 0,
    change: 80,
    arrivalsQuintal: 18500,
    reportedDate: '2026-10-17 07:10 AM',
    freshnessStatus: 'Live (Updated 1h ago)',
    historicalTrend: [
      { day: 'Mon', price: 2450 },
      { day: 'Tue', price: 2500 },
      { day: 'Wed', price: 2530 },
      { day: 'Thu', price: 2570 },
      { day: 'Fri', price: 2570 },
      { day: 'Sat', price: 2650 },
      { day: 'Today', price: 2650 }
    ]
  },
  {
    id: 'mnd_gnr_cotton_7',
    mandiName: 'Guntur Cotton Market',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    commodity: 'Cotton (कपास)',
    variety: 'Medium Long Staple (Bt-Cotton)',
    grade: 'Super',
    minPrice: 7100,
    maxPrice: 7650,
    modalPrice: 7420,
    mspPrice: 7122,
    change: 110,
    arrivalsQuintal: 2800,
    reportedDate: '2026-10-17 06:20 AM',
    freshnessStatus: 'Today (Synced Agmarknet)',
    historicalTrend: [
      { day: 'Mon', price: 7200 },
      { day: 'Tue', price: 7250 },
      { day: 'Wed', price: 7300 },
      { day: 'Thu', price: 7350 },
      { day: 'Fri', price: 7310 },
      { day: 'Sat', price: 7420 },
      { day: 'Today', price: 7420 }
    ]
  }
];

export const MOCK_WEATHER: WeatherCondition = {
  currentTemp: 27,
  condition: 'Partly Sunny · Mild Breeze',
  conditionHindi: 'हल्की धूप · मंद हवा',
  humidityPercent: 58,
  rainfallProbabilityPercent: 15,
  windSpeedKmh: 9,
  windDirection: 'North-East (NE)',
  forecastDate: 'Saturday, 17 Oct 2026',
  location: 'Karnal, Haryana (Lat: 29.68° N, Long: 76.99° E)',
  sprayAdvisory: {
    isSafe: true,
    reason: 'Wind speed is low (<12 km/h) and no heavy rain forecast for the next 36 hours. Ideal for foliar spray.',
    bestWindow: 'Early Morning (06:30 AM – 10:30 AM)'
  },
  irrigationAdvisory: {
    recommendation: 'irrigate_now',
    reason: 'Upper root-zone moisture below 40%. Light irrigation recommended for standing wheat / rabi nursery.'
  },
  alerts: [
    'Dew factor high during night: inspect wheat crop borders for early signs of yellow rust or aphid build-up.',
    'Diurnal temperature variation > 14°C: good for grain filling in standing crops.'
  ],
  sevenDayForecast: [
    { day: 'Today', date: '17 Oct', tempMax: 31, tempMin: 18, condition: 'Clear Sky', rainProb: 10 },
    { day: 'Sun', date: '18 Oct', tempMax: 30, tempMin: 17, condition: 'Partly Sunny', rainProb: 15 },
    { day: 'Mon', date: '19 Oct', tempMax: 29, tempMin: 17, condition: 'Clear Sky', rainProb: 10 },
    { day: 'Tue', date: '20 Oct', tempMax: 28, tempMin: 16, condition: 'Mild Clouds', rainProb: 25 },
    { day: 'Wed', date: '21 Oct', tempMax: 28, tempMin: 16, condition: 'Scattered Showers', rainProb: 45 },
    { day: 'Thu', date: '22 Oct', tempMax: 29, tempMin: 15, condition: 'Clear Sky', rainProb: 10 },
    { day: 'Fri', date: '23 Oct', tempMax: 30, tempMin: 15, condition: 'Sunny', rainProb: 5 }
  ]
};

export const MOCK_LISTINGS: MarketplaceListing[] = [
  {
    id: 'lst_101',
    sellerId: 'usr_rameshwar_99',
    sellerName: 'Rameshwar Singh (Kisan)',
    sellerType: 'farmer',
    isVerified: true,
    listingType: 'sell',
    commodity: 'Wheat (गेहूं)',
    variety: 'PBW-550 / Sharbati',
    grade: 'Grade A',
    quantity: 120,
    unit: 'Quintal',
    askingPrice: 2540,
    minOrderQuantity: 20,
    location: {
      village: 'Nilokheri',
      district: 'Karnal',
      state: 'Haryana',
      distanceKm: 4
    },
    pickupAvailable: true,
    deliveryAvailable: true,
    postedDate: '16 Oct 2026',
    expiryDate: '26 Oct 2026',
    moistureContentPercent: 11.2,
    notes: 'Sun-dried, machine cleaned, 0.4% foreign matter, ready for immediate dispatch from farm godown.',
    status: 'active'
  },
  {
    id: 'lst_102',
    sellerId: 'usr_gurpreet_04',
    sellerName: 'Gurpreet Agro Farms',
    sellerType: 'farmer',
    isVerified: true,
    listingType: 'sell',
    commodity: 'Basmati Paddy (धान)',
    variety: '1121 Pusa Raw Basmati',
    grade: 'Super',
    quantity: 350,
    unit: 'Quintal',
    askingPrice: 4180,
    minOrderQuantity: 50,
    location: {
      village: 'Samana',
      district: 'Patiala',
      state: 'Punjab',
      distanceKm: 42
    },
    pickupAvailable: true,
    deliveryAvailable: false,
    postedDate: '15 Oct 2026',
    expiryDate: '25 Oct 2026',
    moistureContentPercent: 12.0,
    notes: 'Premium grain length 8.35mm, certified organic field parcel.',
    status: 'active'
  },
  {
    id: 'lst_103',
    sellerId: 'usr_mahavir_dal_mill',
    sellerName: 'Mahavir Roller Flour Mills',
    sellerType: 'business',
    isVerified: true,
    listingType: 'buy',
    commodity: 'Wheat (गेहूं)',
    variety: 'HD-2967 or Sharbati FAQ',
    grade: 'Grade A',
    quantity: 1000,
    unit: 'Quintal',
    askingPrice: 2500,
    minOrderQuantity: 100,
    location: {
      district: 'Panipat',
      state: 'Haryana',
      distanceKm: 35
    },
    pickupAvailable: false,
    deliveryAvailable: true,
    postedDate: '16 Oct 2026',
    expiryDate: '30 Oct 2026',
    notes: 'Direct mill procurement. Payment cleared within 24 hours of weighbridge receipt. Bags provided.',
    status: 'active'
  },
  {
    id: 'lst_104',
    sellerId: 'usr_patel_traders',
    sellerName: 'Narmada Bio Oils Ltd',
    sellerType: 'business',
    isVerified: true,
    listingType: 'buy',
    commodity: 'Mustard (सरसों)',
    variety: 'High Oil Content (42%+)',
    grade: 'FAQ (Fair Average Quality)',
    quantity: 500,
    unit: 'Quintal',
    askingPrice: 5680,
    minOrderQuantity: 50,
    location: {
      district: 'Alwar',
      state: 'Rajasthan',
      distanceKm: 160
    },
    pickupAvailable: true,
    deliveryAvailable: true,
    postedDate: '14 Oct 2026',
    expiryDate: '28 Oct 2026',
    notes: 'Immediate payment via e-NAM RTGS. Bonus ₹40/quintal for oil content testing above 42.5%.',
    status: 'active'
  },
  {
    id: 'lst_105',
    sellerId: 'usr_sukhminder_fpo',
    sellerName: 'Malwa FPO Producer Co.',
    sellerType: 'farmer',
    isVerified: true,
    listingType: 'sell',
    commodity: 'Potato (आलू)',
    variety: 'Kufri Pukhraj / Table Grade',
    grade: 'Grade A',
    quantity: 800,
    unit: 'Quintal',
    askingPrice: 1780,
    minOrderQuantity: 100,
    location: {
      district: 'Jalandhar',
      state: 'Punjab',
      distanceKm: 95
    },
    pickupAvailable: true,
    deliveryAvailable: true,
    postedDate: '16 Oct 2026',
    expiryDate: '24 Oct 2026',
    notes: 'Graded 50mm+ tuber size, zero greening, stored in temperature-controlled godown.',
    status: 'active'
  }
];

export const MOCK_OFFERS: OfferNegotiation[] = [
  {
    id: 'ofr_801',
    listingId: 'lst_101',
    commodity: 'Wheat (गेहूं)',
    buyerId: 'usr_mahavir_dal_mill',
    buyerName: 'Mahavir Roller Flour Mills',
    sellerId: 'usr_rameshwar_99',
    sellerName: 'Rameshwar Singh',
    originalPrice: 2540,
    offeredPrice: 2490,
    quantity: 80,
    unit: 'Quintal',
    status: 'pending',
    history: [
      {
        senderId: 'usr_mahavir_dal_mill',
        senderName: 'Mahavir Roller Flour Mills',
        price: 2490,
        quantity: 80,
        timestamp: '16 Oct 2026, 04:30 PM',
        message: 'Can pick up tomorrow in our own truck. Immediate RTGS payment upon loading.'
      }
    ],
    createdAt: '16 Oct 2026, 04:30 PM',
    updatedAt: '16 Oct 2026, 04:30 PM'
  },
  {
    id: 'ofr_802',
    listingId: 'lst_102',
    commodity: 'Basmati Paddy (धान)',
    buyerId: 'usr_rameshwar_99',
    buyerName: 'Rameshwar Singh (Kisan Jyoti)',
    sellerId: 'usr_gurpreet_04',
    sellerName: 'Gurpreet Agro Farms',
    originalPrice: 4180,
    offeredPrice: 4120,
    quantity: 150,
    unit: 'Quintal',
    status: 'countered',
    history: [
      {
        senderId: 'usr_rameshwar_99',
        senderName: 'Rameshwar Singh',
        price: 4080,
        quantity: 150,
        timestamp: '15 Oct 2026, 02:00 PM',
        message: 'Looking for 150 quintals for our processing unit.'
      },
      {
        senderId: 'usr_gurpreet_04',
        senderName: 'Gurpreet Agro Farms',
        price: 4120,
        quantity: 150,
        timestamp: '15 Oct 2026, 06:15 PM',
        message: 'Final counter offer: ₹4,120/quintal. Paddy is 100% genuine Pusa 1121.'
      }
    ],
    createdAt: '15 Oct 2026, 02:00 PM',
    updatedAt: '15 Oct 2026, 06:15 PM'
  }
];

export const MOCK_ORDERS: OrderRecord[] = [
  {
    id: 'ord_kht_9021',
    listingId: 'lst_99',
    offerId: 'ofr_772',
    buyerName: 'Karnal Agro Seed Processing Corp',
    sellerName: 'Rameshwar Singh',
    commodity: 'Mustard (सरसों)',
    quantity: 40,
    unit: 'Quintal',
    agreedPrice: 5640,
    totalAmount: 225600,
    deliveryType: 'buyer_pickup',
    pickupLocation: 'Nilokheri, Karnal (Godown #2)',
    status: 'weighment_verified',
    paymentStatus: 'partially_released',
    createdAt: '12 Oct 2026'
  }
];

export const MOCK_GOVT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'scm_pm_kisan',
    nameEn: 'PM-KISAN Samman Nidhi Yojana',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    benefitSummary: 'Direct income support of ₹6,000 per year transferred into Aadhaar-seeded bank accounts in 3 equal 4-monthly installments of ₹2,000.',
    financialAssistance: '₹6,000 / Year (100% Central Funding)',
    targetBeneficiaries: 'All landholding farmer families across all States and UTs.',
    eligibilityCriteria: [
      'Farmer family owning cultivable land registered in State land records.',
      'Active bank account linked with Aadhaar and e-KYC completed on PM-KISAN portal.',
      'Excludes institutional landholders, constitutional post holders, and serving/retired govt employees paying income tax.'
    ],
    requiredDocuments: ['Aadhaar Card', 'Land Ownership Record (Khatauni / Khasra)', 'Aadhaar-seeded Bank Passbook', 'Active Mobile Number'],
    officialPortalUrl: 'https://pmkisan.gov.in',
    verifiedDate: '10 Oct 2026 (Updated 18th Installment Schedule)',
    category: 'direct_benefit'
  },
  {
    id: 'scm_pmfby',
    nameEn: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefitSummary: 'Comprehensive crop insurance against non-preventable natural risks (drought, flood, unseasonal rain, pests & diseases) from pre-sowing to post-harvest.',
    financialAssistance: 'Farmer pays only 1.5% for Rabi, 2% for Kharif, 5% for Commercial/Horticultural crops. Balance premium paid 50:50 by Central and State Govts.',
    targetBeneficiaries: 'All farmers (loanee and non-loanee) growing notified crops in notified areas.',
    eligibilityCriteria: [
      'Notified crop sown in the notified district / block for the season.',
      'Claim for localized calamity or post-harvest loss reported within 72 hours via Crop Insurance App.'
    ],
    requiredDocuments: ['Land Possession Certificate / Sowing Certificate', 'Aadhaar Card', 'Bank Passbook copy', 'Crop Sowing Declaration'],
    officialPortalUrl: 'https://pmfby.gov.in',
    verifiedDate: '12 Oct 2026 (Rabi 2026 Enrolment Open)',
    category: 'insurance'
  },
  {
    id: 'scm_kcc',
    nameEn: 'Kisan Credit Card (KCC) Scheme',
    nameHi: 'किसान क्रेडिट कार्ड योजना',
    ministry: 'Ministry of Finance & Dept of Agriculture',
    benefitSummary: 'Short-term credit for crop cultivation, post-harvest expenses, produce marketing, consumption requirements, and farm asset maintenance at subsidized interest.',
    financialAssistance: 'Up to ₹3.00 Lakh at effective 4% per annum (with 3% prompt repayment incentive). Up to ₹1.60 Lakh without collateral.',
    targetBeneficiaries: 'Individual farmers, joint borrowers, tenant farmers, oral lessees, and SHGs/JLGs.',
    eligibilityCriteria: [
      'Age between 18 to 75 years.',
      'Owner cultivator or documented tenant farmer.',
      'No wilful default history in scheduled commercial banks or RRBs.'
    ],
    requiredDocuments: ['Application Form', 'Identity & Address Proof (Aadhaar / Voter ID)', 'Land title records verified by Revenue Patwari'],
    officialPortalUrl: 'https://agricoop.nic.in/en/kcc',
    verifiedDate: '08 Oct 2026',
    category: 'credit_subsidy'
  },
  {
    id: 'scm_smam',
    nameEn: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    nameHi: 'कृषि यंत्रीकरण उप-अभियान',
    ministry: 'Department of Agriculture and Farmers Welfare',
    benefitSummary: '40% to 50% capital subsidy on procurement of modern agricultural machinery (Tractors, Combine Harvesters, Rotavators, Drone Sprayers, Laser Levelers) and Custom Hiring Centers (CHC).',
    financialAssistance: 'Up to 50% subsidy for individual farmers; up to ₹10 Lakh for Custom Hiring Center setup by FPOs/Youth.',
    targetBeneficiaries: 'Small & marginal farmers, women farmers, SC/ST farmers, and Registered FPOs.',
    eligibilityCriteria: [
      'Applicant must not have availed subsidy for the same machine in the last 5 years.',
      'Valid DBT Agriculture portal registration.'
    ],
    requiredDocuments: ['DBT Registration ID', 'Land Records', 'Aadhaar Card', 'Caste Certificate (if applicable)', 'Bank Cancelled Cheque'],
    officialPortalUrl: 'https://agrimachinery.nic.in',
    verifiedDate: '01 Oct 2026',
    category: 'machinery'
  },
  {
    id: 'scm_aif',
    nameEn: 'Agriculture Infrastructure Fund (AIF)',
    nameHi: 'कृषि अवसंरचना कोष',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefitSummary: 'Medium-long term debt financing for post-harvest management infrastructure (Cold stores, dry warehouses, sorting/grading units, silos) and community farming assets.',
    financialAssistance: '3% per annum interest subvention on loans up to ₹2.00 Crore for a maximum tenure of 7 years, with CGTMSE credit guarantee coverage.',
    targetBeneficiaries: 'Farmers, Agri-entrepreneurs, Start-ups, FPOs, PACS, and Millers.',
    eligibilityCriteria: [
      'Viable project DPR for post-harvest agricultural asset creation.',
      'Commercial viability appraised by participating scheduled bank.'
    ],
    requiredDocuments: ['Detailed Project Report (DPR)', 'Land lease/ownership papers', 'PAN & Aadhaar of promoters', 'Bank in-principle sanction letter'],
    officialPortalUrl: 'https://agriinfra.dac.gov.in',
    verifiedDate: '14 Oct 2026',
    category: 'infrastructure'
  }
];

export const MOCK_WAREHOUSES: WarehouseFacility[] = [
  {
    id: 'wh_krn_silo_01',
    ownerId: 'usr_shriram_agro',
    name: 'Shriram WDRA Certified Grain Silo & Godown',
    ownerName: 'Shriram Agro Logistics',
    type: 'Dry Godown',
    district: 'Karnal',
    state: 'Haryana',
    totalCapacityMT: 12000,
    availableCapacityMT: 3800,
    ratePerBagPerMonth: 7.5,
    isWdrcRegistered: true,
    contactPhone: '+91 98960 55441',
    address: 'GT Road, Karnal Grain Terminal, Haryana',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'wh_ind_cold_02',
    ownerId: 'usr_narmada_hub',
    name: 'Narmada Agri Logistics & Cold Storage Facility',
    ownerName: 'Narmada Agro Hub',
    type: 'Cold Storage',
    district: 'Indore',
    state: 'Madhya Pradesh',
    totalCapacityMT: 6000,
    availableCapacityMT: 2400,
    ratePerBagPerMonth: 24.0,
    isWdrcRegistered: true,
    contactPhone: '+91 94250 88990',
    address: 'AB Road Industrial Logistic Zone, Indore, MP',
    imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'wh_my_01',
    ownerId: 'usr_rameshwar_99',
    name: 'Kheti AI Test Listing 1',
    ownerName: 'WROBR 36',
    type: 'Dry Godown',
    district: 'Karnal',
    state: 'Haryana',
    totalCapacityMT: 3000,
    availableCapacityMT: 1000,
    ratePerBagPerMonth: 20.0,
    isWdrcRegistered: true,
    contactPhone: '+91 98124 55432',
    address: 'Karnal, Haryana',
    imageUrl: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'wh_ldh_03',
    ownerId: 'usr_pungrain',
    name: 'Punjab Agri Logistics Park',
    ownerName: 'Pungrain State Warehouse',
    type: 'Dry Godown',
    district: 'Ludhiana',
    state: 'Punjab',
    totalCapacityMT: 35000,
    availableCapacityMT: 9500,
    ratePerBagPerMonth: 7.0,
    isWdrcRegistered: true,
    contactPhone: '+91 161 245 9912',
    address: 'Grand Trunk Road, Khanna Mandi Zone, Ludhiana',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
  }
];

export const MOCK_EQUIPMENTS: EquipmentRental[] = [
  {
    id: 'eq_my_01',
    ownerId: 'usr_rameshwar_99',
    title: 'Mahindra 575 DI (45 HP) with Super Seeder',
    category: 'Tractor',
    ownerName: 'Rameshwar Singh (You)',
    district: 'Karnal',
    state: 'Haryana',
    ratePerHour: 550,
    ratePerAcre: 750,
    operatorIncluded: true,
    isAvailableNow: true,
    contactPhone: '+91 98124 55432',
    imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_501',
    ownerId: 'usr_kuldeep_singh',
    title: 'John Deere 5310 4WD (55 HP) with Rotavator',
    category: 'Tractor',
    ownerName: 'Kuldeep Singh',
    district: 'Karnal',
    state: 'Haryana',
    ratePerHour: 650,
    ratePerAcre: 850,
    operatorIncluded: true,
    isAvailableNow: true,
    contactPhone: '+91 98120 44321',
    imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_502',
    ownerId: 'usr_jatinder_agro',
    title: 'Preet 987 Multicrop Combine Harvester with Straw Reaper',
    category: 'Combine Harvester',
    ownerName: 'Jatinder Agro Custom Services',
    district: 'Kurukshetra',
    state: 'Haryana',
    ratePerAcre: 1800,
    operatorIncluded: true,
    isAvailableNow: true,
    contactPhone: '+91 94160 22110',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_503',
    ownerId: 'usr_kisan_drone',
    title: 'Precision AgriDrone 16L Autonomous Foliar Sprayer',
    category: 'Drone Sprayer',
    ownerName: 'Kisan Drone Sewa Kendra',
    district: 'Karnal',
    state: 'Haryana',
    ratePerAcre: 350,
    operatorIncluded: true,
    isAvailableNow: true,
    contactPhone: '+91 98129 11009',
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_504',
    ownerId: 'usr_surjit_ram',
    title: 'Automatic Laser Land Leveler with Dual Slope Sensor',
    category: 'Laser Leveler',
    ownerName: 'Surjit Ram Custom Hire',
    district: 'Panipat',
    state: 'Haryana',
    ratePerHour: 900,
    ratePerAcre: 1200,
    operatorIncluded: true,
    isAvailableNow: false,
    contactPhone: '+91 98130 55431',
    imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80'
  }
];

export const MOCK_SERVICE_BOOKINGS: ServiceBooking[] = [
  {
    id: 'bk_wh_101',
    serviceId: 'wh_my_01',
    serviceType: 'warehouse',
    serviceTitle: 'Nilokheri Kisan Grain Storage & Godown',
    ownerId: 'usr_rameshwar_99',
    ownerName: 'Rameshwar Singh (You)',
    ownerPhone: '+91 98124 55432',
    renterId: 'usr_harpreet_singh',
    renterName: 'Harpreet Singh Dhillon',
    renterPhone: '+91 98765 43210',
    startDate: '2026-11-01',
    endDate: '2027-01-31',
    quantityRequested: 350,
    unit: 'bags (50kg)',
    totalEstimatedAmount: 8400,
    notes: 'Basmati 1121 paddy harvested crop. Require dry ventilated bay with rodent protection.',
    status: 'confirmed',
    createdAt: '2026-10-22T10:30:00.000Z'
  },
  {
    id: 'bk_wh_102',
    serviceId: 'wh_my_01',
    serviceType: 'warehouse',
    serviceTitle: 'Nilokheri Kisan Grain Storage & Godown',
    ownerId: 'usr_rameshwar_99',
    ownerName: 'Rameshwar Singh (You)',
    ownerPhone: '+91 98124 55432',
    renterId: 'usr_daljit_kisan',
    renterName: 'Daljit Singh Kamboj',
    renterPhone: '+91 97290 88123',
    startDate: '2026-11-05',
    endDate: '2026-12-05',
    quantityRequested: 180,
    unit: 'bags (50kg)',
    totalEstimatedAmount: 1440,
    notes: 'Paddy storage before mandi transport. Please verify unloading ramp availability.',
    status: 'pending',
    createdAt: '2026-10-24T06:15:00.000Z'
  },
  {
    id: 'bk_eq_201',
    serviceId: 'eq_my_01',
    serviceType: 'equipment',
    serviceTitle: 'Mahindra 575 DI (45 HP) with Super Seeder',
    ownerId: 'usr_rameshwar_99',
    ownerName: 'Rameshwar Singh (You)',
    ownerPhone: '+91 98124 55432',
    renterId: 'usr_surender_malik',
    renterName: 'Surender Malik',
    renterPhone: '+91 98121 99042',
    startDate: '2026-11-02',
    endDate: '2026-11-03',
    quantityRequested: 8,
    unit: 'acres',
    totalEstimatedAmount: 6000,
    notes: 'Wheat sowing directly into paddy stubble. Driver required.',
    status: 'pending',
    createdAt: '2026-10-24T07:45:00.000Z'
  }
];

export const MOCK_SERVICE_MESSAGES: ServiceMessage[] = [
  {
    id: 'msg_01',
    bookingId: 'bk_wh_102',
    serviceId: 'wh_my_01',
    serviceTitle: 'Nilokheri Kisan Grain Storage & Godown',
    senderId: 'usr_daljit_kisan',
    senderName: 'Daljit Singh Kamboj',
    recipientId: 'usr_rameshwar_99',
    recipientName: 'Rameshwar Singh',
    text: 'राम-राम जी! मैंने 180 बैग धान भंडारण हेतु बुकिंग भेजी है। क्या 5 नवंबर को अनलोडिंग रैंप और लेबर उपलब्ध होगी?',
    timestamp: '2026-10-24T06:16:00.000Z',
    isRead: false
  },
  {
    id: 'msg_02',
    bookingId: 'bk_wh_101',
    serviceId: 'wh_my_01',
    serviceTitle: 'Nilokheri Kisan Grain Storage & Godown',
    senderId: 'usr_harpreet_singh',
    senderName: 'Harpreet Singh Dhillon',
    recipientId: 'usr_rameshwar_99',
    recipientName: 'Rameshwar Singh',
    text: 'Sir, 350 bags delivery truck will arrive Tuesday at 11 AM. Gate pass ready?',
    timestamp: '2026-10-23T14:20:00.000Z',
    isRead: true
  },
  {
    id: 'msg_03',
    bookingId: 'bk_wh_101',
    serviceId: 'wh_my_01',
    serviceTitle: 'Nilokheri Kisan Grain Storage & Godown',
    senderId: 'usr_rameshwar_99',
    senderName: 'Rameshwar Singh',
    recipientId: 'usr_harpreet_singh',
    recipientName: 'Harpreet Singh Dhillon',
    text: 'Yes Harpreet ji, bay #3 is sanitized and reserved for you. Supervisor Ramphal will receive it.',
    timestamp: '2026-10-23T14:35:00.000Z',
    isRead: true
  }
];

export const MOCK_UNIVERSITY_EXPERTS: UniversityExpert[] = [
  {
    id: 'exp_pau_01',
    name: 'Dr. Virender Kumar',
    title: 'Professor & Senior Plant Pathologist',
    university: 'Punjab Agricultural University (PAU), Ludhiana',
    department: 'Department of Plant Pathology',
    specialization: 'Wheat Rusts (Yellow/Brown), Karnal Bunt & Cereal Diseases',
    state: 'Punjab',
    languages: ['Hindi', 'Punjabi', 'English'],
    experienceYears: 24,
    isVerifiedScientist: true,
    isAvailableForCall: true,
    activeConsultationsCount: 18,
    rating: 4.9,
    publishedBulletinsCount: 42,
    contactEmail: 'vkumar.pathology@pau.edu'
  },
  {
    id: 'exp_hau_02',
    name: 'Dr. Sunita Deshmukh',
    title: 'Principal Agronomist & Soil Specialist',
    university: 'CCS Haryana Agricultural University (HAU), Hisar',
    department: 'Agronomy & Water Management',
    specialization: 'Precision Drip Fertigation, Soil Salinity & Rabi Nutrient Balancing',
    state: 'Haryana',
    languages: ['Hindi', 'Haryanvi', 'English'],
    experienceYears: 19,
    isVerifiedScientist: true,
    isAvailableForCall: true,
    activeConsultationsCount: 14,
    rating: 4.8,
    publishedBulletinsCount: 31,
    contactEmail: 'sdeshmukh.agronomy@hau.ac.in'
  },
  {
    id: 'exp_iari_03',
    name: 'Dr. Rajeshwar Sharma',
    title: 'Principal Scientist & Breeder',
    university: 'ICAR - Indian Agricultural Research Institute (IARI / Pusa), New Delhi',
    department: 'Division of Genetics & Seed Technology',
    specialization: 'Basmati Rice Breeding (Pusa 1121/1847) & Mustard Bio-fortification',
    state: 'Delhi NCR',
    languages: ['Hindi', 'English'],
    experienceYears: 22,
    isVerifiedScientist: true,
    isAvailableForCall: false,
    activeConsultationsCount: 26,
    rating: 4.9,
    publishedBulletinsCount: 56,
    contactEmail: 'rsharma.pusa@icar.gov.in'
  },
  {
    id: 'exp_mpkv_04',
    name: 'Dr. Arvind R. Patil',
    title: 'Senior Agricultural Entomologist',
    university: 'Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri',
    department: 'Department of Agricultural Entomology',
    specialization: 'Integrated Pest Management (IPM), Cotton Pink Bollworm & Fall Armyworm',
    state: 'Maharashtra',
    languages: ['Marathi', 'Hindi', 'English'],
    experienceYears: 16,
    isVerifiedScientist: true,
    isAvailableForCall: true,
    activeConsultationsCount: 11,
    rating: 4.7,
    publishedBulletinsCount: 22,
    contactEmail: 'arvind.patil@mpkv.org'
  }
];

export const MOCK_FIELD_TRIALS: UniversityFieldTrial[] = [
  {
    id: 'trl_hau_902',
    title: 'Farmer Field Evaluation of Drought-Tolerant Mustard Strain (Bio-902)',
    university: 'CCS Haryana Agricultural University, Hisar',
    leadScientist: 'Dr. Sunita Deshmukh',
    crop: 'Mustard (सरसों)',
    requiredSoilType: 'Loam to Sandy Loam with medium drainage',
    minimumPlotAcres: 1.5,
    compensationAndFreeInputs: 'Free certified seed kit (5 kg) + ₹4,500/acre input honorarium on yield harvest data submission',
    objective: 'Assessing pod formation count, oil percentage and drought resilience under farmer field management conditions.',
    openSlots: 20,
    enrolledFarmersCount: 14,
    deadlineDate: '25 Oct 2026',
    status: 'recruiting_farmers'
  },
  {
    id: 'trl_pau_dsr',
    title: 'Direct Seeded Rice (DSR) Water Conservation Trial with Tar-Vattar Technique',
    university: 'Punjab Agricultural University, Ludhiana',
    leadScientist: 'Dr. Virender Kumar',
    crop: 'Basmati Paddy (धान)',
    requiredSoilType: 'Medium to Heavy Clay Loam',
    minimumPlotAcres: 2.0,
    compensationAndFreeInputs: 'Free weedicide starter kit + Soil moisture sensor installed + Free combine harvest assistance',
    objective: 'Validating 25% ground water savings and eliminating stubble puddling requirement in live fields.',
    openSlots: 15,
    enrolledFarmersCount: 11,
    deadlineDate: '30 Oct 2026',
    status: 'recruiting_farmers'
  },
  {
    id: 'trl_iari_bio',
    title: 'Biological Control of Pod Borer in Chickpea / Chana using Trichogramma Cards',
    university: 'ICAR - IARI Pusa, New Delhi',
    leadScientist: 'Dr. Rajeshwar Sharma',
    crop: 'Chana (चना)',
    requiredSoilType: 'All arable soils in North-West plains',
    minimumPlotAcres: 1.0,
    compensationAndFreeInputs: 'Free biocontrol egg cards + ₹3,000 honorarium on trial completion',
    objective: 'Replacing chemical chlorantraniliprole sprays with natural parasitoid biocontrol in standing gram crops.',
    openSlots: 25,
    enrolledFarmersCount: 18,
    deadlineDate: '10 Nov 2026',
    status: 'recruiting_farmers'
  }
];

export const MOCK_CONSULTATIONS: FieldConsultation[] = [
  {
    id: 'cns_801',
    farmerId: 'usr_rameshwar_99',
    farmerName: 'Rameshwar Singh',
    farmerDistrict: 'Karnal, Haryana',
    crop: 'Wheat (PBW-550)',
    plotSizeAcres: 6.5,
    symptomsOrQuery: 'Noticeable yellow longitudinal stripes appearing on flag leaves after morning dew. Want confirmation whether this is Stripe Rust (Puccinia striiformis) or Zinc deficiency.',
    urgency: 'urgent_pest_outbreak',
    status: 'answered',
    createdAt: '16 Oct 2026, 09:15 AM',
    expertAssigned: 'Dr. Virender Kumar',
    expertUniversity: 'PAU Ludhiana',
    expertRecommendation: {
      diagnosis: 'Confirmed early-stage Yellow Rust (Stripe Rust) infection triggered by recent night temperatures of 14°C and dew accumulation.',
      scientificRemedy: 'Foliar spray of Propiconazole 25% EC (Tilt) @ 200 ml in 200 litres of water per acre. Spray using hollow cone nozzle during morning hours.',
      organicAlternative: 'For organic parcel boundary: spray 5% Neem Seed Kernel Extract (NSKE) + Trichoderma viride @ 5g/litre.',
      repliedAt: '16 Oct 2026, 11:30 AM (Response time: 2h 15m)'
    }
  },
  {
    id: 'cns_802',
    farmerId: 'usr_gurpreet_04',
    farmerName: 'Gurpreet Agro Farms',
    farmerDistrict: 'Patiala, Punjab',
    crop: 'Basmati Paddy (Pusa 1121)',
    plotSizeAcres: 5.0,
    symptomsOrQuery: 'Requesting advice on optimal moisture percentage before machine harvesting to prevent kernel breakage during dehusking.',
    urgency: 'routine',
    status: 'field_visit_scheduled',
    createdAt: '15 Oct 2026, 04:00 PM',
    expertAssigned: 'Dr. Rajeshwar Sharma',
    expertUniversity: 'IARI Pusa',
    expertRecommendation: {
      diagnosis: 'Pre-harvest moisture optimization advisory.',
      scientificRemedy: 'Harvest when grain moisture drops to 20-22%. Dry slowly in shade to 12% moisture before godown storage.',
      organicAlternative: 'Avoid harsh midday direct sun drying on concrete floors to prevent micro-cracks in 8.3mm kernels.',
      repliedAt: '15 Oct 2026, 06:10 PM'
    }
  }
];

