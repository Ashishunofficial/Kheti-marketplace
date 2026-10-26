export type UserRole = 'farmer' | 'business' | 'scientist' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  roles: UserRole[];
  activeRole: UserRole;
  isKycVerified: boolean;
  state: string;
  district: string;
  village?: string;
  farmSizeAcres?: number;
  primaryCrops?: string[];
  businessType?: 'trader' | 'mill_owner' | 'warehouse_operator' | 'equipment_provider' | 'fpo';
  businessName?: string;
  gstNumber?: string;
  apmcLicense?: string;
  universityName?: string;
  academicTitle?: string;
  researchDepartment?: string;
}

export interface UniversityExpert {
  id: string;
  name: string;
  title: string;
  university: string;
  department: string;
  specialization: string;
  state: string;
  languages: string[];
  experienceYears: number;
  isVerifiedScientist: boolean;
  isAvailableForCall: boolean;
  activeConsultationsCount: number;
  rating: number; // out of 5
  publishedBulletinsCount: number;
  contactEmail: string;
}

export interface FieldConsultation {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerDistrict: string;
  farmerVillage?: string;
  crop: string;
  plotSizeAcres?: number;
  symptomsOrQuery?: string;
  symptoms?: string;
  issueType?: 'fungal_disease' | 'insect_pest' | 'soil_nutrient' | 'salinity_water' | 'seed_germination' | 'other' | string;
  urgency: 'routine' | 'urgent_pest_outbreak' | 'pre_sowing_seed_selection' | 'critical' | 'low' | 'medium';
  status: 'open' | 'answered' | 'field_visit_scheduled' | 'diagnosed' | 'pending_review' | 'closed';
  createdAt: string;
  expertAssigned?: string;
  expertId?: string;
  expertName?: string;
  expertUniversity?: string;
  diagnosis?: string;
  prescription?: string;
  repliedAt?: string;
  expertRecommendation?: {
    diagnosis: string;
    scientificRemedy: string;
    organicAlternative: string;
    repliedAt: string;
  };
}

export interface UniversityFieldTrial {
  id: string;
  title: string;
  university: string;
  leadScientist: string;
  crop: string;
  requiredSoilType: string;
  minimumPlotAcres: number;
  compensationAndFreeInputs: string;
  objective: string;
  openSlots: number;
  enrolledFarmersCount: number;
  deadlineDate: string;
  status: 'recruiting_farmers' | 'trial_in_progress' | 'results_published';
}

export type CommodityType = 
  | 'Wheat (गेहूं)'
  | 'Basmati Paddy (धान)'
  | 'Mustard (सरसों)'
  | 'Cotton (कपास)'
  | 'Soybean (सोयाबीन)'
  | 'Potato (आलू)'
  | 'Onion (प्याज)'
  | 'Tomato (टमाटर)'
  | 'Chana (चना)'
  | 'Maize (मक्का)'
  | 'Tur/Arhar (तूर/अरहर)'
  | 'Groundnut (मूंगफली)'
  | 'Garlic (लहसुन)'
  | 'Moong (मूंग)'
  | 'Sugarcane (गन्ना)'
  | 'Bajra (बाजरा)';

export interface MandiPriceRecord {
  id: string;
  mandiName: string;
  district: string;
  state: string;
  commodity: CommodityType;
  variety: string;
  grade: string;
  minPrice: number; // ₹/quintal
  maxPrice: number; // ₹/quintal
  modalPrice: number; // ₹/quintal
  mspPrice: number; // ₹/quintal
  change: number; // ₹/quintal relative to yesterday
  arrivalsQuintal: number;
  reportedDate: string;
  freshnessStatus: 'Live (Updated 1h ago)' | 'Today (Synced Agmarknet)' | 'Yesterday';
  historicalTrend: { day: string; price: number }[];
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: 'farmer' | 'business';
  isVerified: boolean;
  listingType: 'sell' | 'buy';
  commodity: CommodityType;
  variety: string;
  grade: string;
  quantity: number; // in quintals or metric tonnes
  unit: 'Quintal' | 'Metric Tonne';
  askingPrice: number; // ₹/unit
  minOrderQuantity: number;
  location: {
    village?: string;
    district: string;
    state: string;
    distanceKm?: number;
  };
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  postedDate: string;
  expiryDate: string;
  moistureContentPercent?: number;
  notes?: string;
  status: 'active' | 'in_negotiation' | 'sold' | 'expired';
  occupiedQuantity?: number; // quantity sold or reserved
}

export interface UniversityMasterclass {
  id: string;
  instructorId?: string;
  instructorName: string;
  instructorTitle: string;
  university: string;
  topic: string;
  description: string;
  scheduledDate: string;
  durationHours: number;
  fee: number; // ₹ (0 = Free)
  enrolledCount: number;
  maxSeats: number;
  mode: 'online_interactive' | 'on_farm_demonstration';
  status: 'upcoming' | 'ongoing' | 'completed';
  enrolledUserIds?: string[];
}

export interface FarmInternship {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  village: string;
  district: string;
  state: string;
  cropFocus: string[];
  durationWeeks: number;
  stipendMonthly: number;
  accommodationProvided: boolean;
  learningOutcomes: string[];
  availableSlots: number;
  appliedCount: number;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface InternshipApplication {
  id: string;
  internshipId: string;
  farmName: string;
  farmerId: string;
  applicantId: string;
  applicantName: string;
  applicantCollege: string;
  degree: string;
  yearOfStudy: string;
  phone: string;
  statement: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface OfferNegotiation {
  id: string;
  listingId: string;
  commodity: CommodityType;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  originalPrice: number;
  offeredPrice: number;
  quantity: number;
  unit: string;
  status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'order_created';
  history: {
    senderId: string;
    senderName: string;
    price: number;
    quantity: number;
    timestamp: string;
    message?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  id: string;
  listingId: string;
  offerId: string;
  buyerName: string;
  sellerName: string;
  commodity: CommodityType;
  quantity: number;
  unit: string;
  agreedPrice: number;
  totalAmount: number;
  deliveryType: 'seller_delivery' | 'buyer_pickup';
  pickupLocation: string;
  status: 'confirmed' | 'dispatched' | 'weighment_verified' | 'delivered' | 'completed' | 'disputed';
  paymentStatus: 'escrow_locked' | 'partially_released' | 'settled';
  createdAt: string;
}

export interface WeatherCondition {
  currentTemp: number; // °C
  condition: string;
  conditionHindi: string;
  humidityPercent: number;
  rainfallProbabilityPercent: number;
  windSpeedKmh: number;
  windDirection: string;
  forecastDate: string;
  location: string;
  sprayAdvisory: {
    isSafe: boolean;
    reason: string;
    bestWindow: string;
  };
  irrigationAdvisory: {
    recommendation: 'irrigate_now' | 'skip_irrigation' | 'monitor_soil' | 'optimal_moisture' | 'skip_rain_expected';
    reason: string;
  };
  alerts: string[];
  sevenDayForecast: {
    day: string;
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainProb: number;
  }[];
}

export interface GovernmentScheme {
  id: string;
  nameEn: string;
  nameHi: string;
  ministry: string;
  benefitSummary: string;
  financialAssistance: string;
  targetBeneficiaries: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  officialPortalUrl: string;
  verifiedDate: string;
  category: 'direct_benefit' | 'insurance' | 'credit_subsidy' | 'machinery' | 'infrastructure';
}

export interface CropDiagnosticResult {
  cropIdentified: string;
  diseaseOrPest: string;
  diseaseHindi: string;
  confidencePercent: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  symptoms: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  preventativeMeasures: string[];
  estimatedYieldImpactPercent: number;
}

export interface WarehouseFacility {
  id: string;
  ownerId?: string;
  name: string;
  ownerName: string;
  type: 'Dry Godown' | 'Cold Storage' | 'Silo';
  district: string;
  state: string;
  totalCapacityMT: number;
  availableCapacityMT: number;
  ratePerBagPerMonth: number; // in ₹
  isWdrcRegistered: boolean;
  contactPhone: string;
  address?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface EquipmentRental {
  id: string;
  ownerId?: string;
  title: string;
  category: 'Tractor' | 'Combine Harvester' | 'Laser Leveler' | 'Rotavator' | 'Drone Sprayer' | 'Vehicle / Transport';
  ownerName: string;
  district: string;
  state: string;
  ratePerHour?: number;
  ratePerAcre?: number;
  operatorIncluded: boolean;
  isAvailableNow: boolean;
  contactPhone?: string;
  modelYear?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceType: 'warehouse' | 'equipment' | 'logistics';
  serviceTitle: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  renterId: string;
  renterName: string;
  renterPhone: string;
  startDate: string;
  endDate?: string;
  quantityRequested: number;
  unit: string;
  totalEstimatedAmount: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceMessage {
  id: string;
  bookingId?: string;
  serviceId: string;
  serviceTitle: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  audioBase64?: string;
  actionCard?: {
    type: 'mandi_comparison' | 'weather_alert' | 'crop_diagnosis' | 'offer_action' | 'scheme_details';
    data: any;
  };
  toolCallsExecuted?: string[];
}
