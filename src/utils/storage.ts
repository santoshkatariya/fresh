import { ProduceBatch, BuyerMatch, Order, UserProfile, ImpactStats, Vehicle, DecisionOption, StandingOrder, DemandBreakdown, CropType, BuyerTier } from '../types';
import { DEMO_VEHICLES } from './transport';
import { api } from './api';

const STORAGE_KEYS = {
  BATCHES: 'freshroute_batches_v1',
  ORDERS: 'freshroute_orders_v1',
  BUYERS: 'freshroute_buyers_v1',
  USER: 'freshroute_current_user_v1',
  LANGUAGE: 'freshroute_language_pref_v1',
  IMPACT: 'freshroute_impact_stats_v1',
  SELECTED_BATCH_ID: 'freshroute_active_batch_id_v1',
  STANDING_ORDERS: 'freshroute_standing_orders_v1',
  HOUSEHOLD_SKIP_RATE: 'freshroute_household_skip_rate_v1'
};

export const INITIAL_BATCHES: ProduceBatch[] = [
  {
    id: 'batch-tomato-01',
    farmerId: 'farmer-ramesh-01',
    farmerName: 'Ramesh Patil',
    farmLocation: 'Niphad, Nashik, Maharashtra',
    crop: 'Tomatoes',
    variety: 'Abhinav Hybrid (Table Grade)',
    quantityKg: 800,
    harvestDate: '2026-08-23',
    harvestTime: '06:30 AM',
    basePricePerKg: 21,
    currentQualityScore: 82,
    freshnessPercent: 88,
    ripenessPercent: 80,
    damagePercent: 12,
    estimatedShelfLifeHours: 31,
    spoilageRiskPercent: 18,
    detectedIssues: ['Minor surface skin bruising on ~8%', 'Optimal table ripeness (turning red)', 'Firmness index 7.8/10'],
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    status: 'available',
    storageType: 'ambient',
    createdAt: new Date().toISOString()
  },
  {
    id: 'batch-onion-02',
    farmerId: 'farmer-ramesh-01',
    farmerName: 'Ramesh Patil',
    farmLocation: 'Lasalgaon, Nashik, Maharashtra',
    crop: 'Onions',
    variety: 'Garwa Dark Red',
    quantityKg: 1500,
    harvestDate: '2026-08-21',
    harvestTime: '08:00 AM',
    basePricePerKg: 18,
    currentQualityScore: 92,
    freshnessPercent: 95,
    ripenessPercent: 90,
    damagePercent: 4,
    estimatedShelfLifeHours: 360,
    spoilageRiskPercent: 6,
    detectedIssues: ['Well cured outer skin layers', 'Low moisture neck tight', 'Zero sprouting detected'],
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    status: 'available',
    storageType: 'ventilated',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'batch-grape-03',
    farmerId: 'farmer-ramesh-01',
    farmerName: 'Ramesh Patil',
    farmLocation: 'Dindori Valley, Nashik',
    crop: 'Grapes',
    variety: 'Thompson Seedless',
    quantityKg: 600,
    harvestDate: '2026-08-23',
    harvestTime: '05:45 AM',
    basePricePerKg: 65,
    currentQualityScore: 86,
    freshnessPercent: 90,
    ripenessPercent: 88,
    damagePercent: 7,
    estimatedShelfLifeHours: 48,
    spoilageRiskPercent: 14,
    detectedIssues: ['Brix sugar content 18.2%', 'Firm berry attachment', 'Minor sunburn on 5% of clusters'],
    imageUrl: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80',
    status: 'available',
    storageType: 'ambient',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'batch-capsicum-04',
    farmerId: 'farmer-ramesh-01',
    farmerName: 'Ramesh Patil',
    farmLocation: 'Khed Shivapur, Pune',
    crop: 'Capsicum',
    variety: 'Indra Green Bell',
    quantityKg: 450,
    harvestDate: '2026-08-22',
    harvestTime: '07:15 AM',
    basePricePerKg: 38,
    currentQualityScore: 78,
    freshnessPercent: 82,
    ripenessPercent: 85,
    damagePercent: 15,
    estimatedShelfLifeHours: 36,
    spoilageRiskPercent: 22,
    detectedIssues: ['Deep green luster', 'Slight calyx wilting observed', 'Mild surface scarring from handling'],
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
    status: 'available',
    storageType: 'ambient',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

export const INITIAL_BUYERS: BuyerMatch[] = [
  {
    id: 'buyer-freshmart-01',
    name: 'Anil Sharma (Procurement Head)',
    companyName: 'FreshMart Quick Commerce',
    businessType: 'Quick-Commerce Dark Store',
    location: 'Bhandup Central DC, Mumbai',
    distanceKm: 34,
    demandedCrops: ['Tomatoes', 'Capsicum', 'Green Chillies', 'Onions'],
    offeredPricePerKg: 21.5,
    minQualityScore: 75,
    paymentTerms: 'Instant T+0 Bank Transfer upon weighbridge receipt',
    reliabilityRating: 4.9,
    aiMatchScore: 96,
    verifiedBadge: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'buyer-bigbasket-02',
    name: 'Pooja Deshmukh',
    companyName: 'BigBasket Regional Hub',
    businessType: 'Retail Chain',
    location: 'Kalyan Logistics Park, Thane',
    distanceKm: 48,
    demandedCrops: ['Tomatoes', 'Grapes', 'Pomegranates', 'Onions', 'Potatoes'],
    offeredPricePerKg: 20.8,
    minQualityScore: 80,
    paymentTerms: 'Weekly Net 7 via Direct Deposit',
    reliabilityRating: 4.8,
    aiMatchScore: 91,
    verifiedBadge: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'buyer-kisanagro-03',
    name: 'Vikram Joshi',
    companyName: 'Kisan Agro Puree & Pulping Ltd',
    businessType: 'Food Processor',
    location: 'Sinnar MIDC Agro Food Park',
    distanceKm: 22,
    demandedCrops: ['Tomatoes', 'Mangoes'],
    offeredPricePerKg: 17.5,
    minQualityScore: 60,
    paymentTerms: 'Immediate spot cash on gate unloading',
    reliabilityRating: 4.7,
    aiMatchScore: 88,
    verifiedBadge: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'buyer-safal-04',
    name: 'Sanjay Nair',
    companyName: 'Safal Fresh Mandi Network',
    businessType: 'Retail Chain',
    location: 'Thane Majiwada Hub',
    distanceKm: 58,
    demandedCrops: ['Tomatoes', 'Onions', 'Grapes', 'Capsicum'],
    offeredPricePerKg: 22.0,
    minQualityScore: 85,
    paymentTerms: 'Escrow release within 24 hours',
    reliabilityRating: 4.9,
    aiMatchScore: 85,
    verifiedBadge: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'buyer-akshayapatra-05',
    name: 'Sister Meenakshi',
    companyName: 'Annapurna Community Kitchen Hub',
    businessType: 'Mandir/Catering Wholesale',
    location: 'Nashik Shirdi Road',
    distanceKm: 12,
    demandedCrops: ['Tomatoes', 'Potatoes', 'Onions'],
    offeredPricePerKg: 14.0,
    minQualityScore: 50,
    paymentTerms: 'State Welfare Direct Credit + Tax Certificate',
    reliabilityRating: 5.0,
    aiMatchScore: 80,
    verifiedBadge: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-8821',
    batchId: 'batch-tomato-01',
    crop: 'Tomatoes',
    quantityKg: 800,
    qualityScore: 82,
    farmerId: 'farmer-ramesh-01',
    farmerName: 'Ramesh Patil',
    farmLocation: 'Niphad, Nashik',
    buyerId: 'buyer-freshmart-01',
    buyerName: 'FreshMart Quick Commerce',
    buyerLocation: 'Bhandup Central DC, Mumbai',
    distanceKm: 34,
    pricePerKg: 21.5,
    totalValue: 17200,
    transportCost: 476,
    netFarmerEarnings: 16724,
    selectedVehicle: 'Mini Pickup (Tata Ace)',
    status: 'In Transit',
    estimatedTransitTime: '1h 15m',
    temperatureReadingC: 22.4,
    humidityPercent: 78,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    pickupTime: '08:15 AM',
    timeline: [
      { status: 'Requested', timestamp: '07:30 AM', description: 'Procurement order requested via FreshRoute AI', completed: true },
      { status: 'Accepted', timestamp: '07:45 AM', description: 'Farmer accepted AI pricing and route recommendation', completed: true },
      { status: 'Pickup Scheduled', timestamp: '08:00 AM', description: 'Mini Pickup arrived at farm crate dock', completed: true },
      { status: 'In Transit', timestamp: '08:30 AM', description: 'En route to Mumbai Bhandup DC (34 km, ETA 45 mins)', completed: true },
      { status: 'Delivered', timestamp: 'Pending', description: 'Quality re-check and digital receipt generation', completed: false },
      { status: 'Completed', timestamp: 'Pending', description: 'Instant UPI / NEFT payout release', completed: false }
    ]
  },
  {
    id: 'ORD-2026-8794',
    batchId: 'batch-grape-prev',
    crop: 'Grapes',
    quantityKg: 1200,
    qualityScore: 90,
    farmerId: 'farmer-ramesh-01',
    farmerName: 'Ramesh Patil',
    farmLocation: 'Dindori Valley, Nashik',
    buyerId: 'buyer-safal-04',
    buyerName: 'Safal Fresh Mandi Network',
    buyerLocation: 'Thane Majiwada Hub',
    distanceKm: 65,
    pricePerKg: 68.0,
    totalValue: 81600,
    transportCost: 1820,
    netFarmerEarnings: 79780,
    selectedVehicle: 'Medium Reefer (Eicher 6-Wheeler)',
    status: 'Delivered',
    estimatedTransitTime: 'Completed',
    temperatureReadingC: 12.0,
    humidityPercent: 88,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    pickupTime: '06:00 AM',
    deliveryTime: '08:45 AM',
    timeline: [
      { status: 'Requested', timestamp: 'Aug 21, 05:00 AM', description: 'Direct contract order issued', completed: true },
      { status: 'Accepted', timestamp: 'Aug 21, 05:15 AM', description: 'Farmer accepted premium grade quote', completed: true },
      { status: 'Pickup Scheduled', timestamp: 'Aug 21, 05:45 AM', description: 'Cold chain vehicle docked', completed: true },
      { status: 'In Transit', timestamp: 'Aug 21, 06:15 AM', description: 'Chilled transit maintained at 12°C', completed: true },
      { status: 'Delivered', timestamp: 'Aug 21, 08:45 AM', description: 'Weighbridge checked: 1,192 kg accepted (0.6% spoilage)', completed: true },
      { status: 'Completed', timestamp: 'Aug 21, 09:10 AM', description: '₹79,780 credited to bank account', completed: true }
    ]
  }
];

export const INITIAL_IMPACT: ImpactStats = {
  valueRecoveredINR: 284350,
  foodWastePreventedTons: 4.2,
  decisionAccuracyPercent: 91,
  transportCostSavingsPercent: 18,
  co2EmissionsSavedKg: 890,
  farmersEmpowered: 142
};

export const DEFAULT_FARMER_USER: UserProfile = {
  id: 'farmer-ramesh-01',
  role: 'farmer',
  name: 'Ramesh Patil',
  email: 'ramesh.patil@kisanmail.in',
  phone: '+91 98220 44192',
  location: 'Niphad, Nashik, Maharashtra',
  farmOrBusinessName: 'Patil Organic Agri Farms & FPO',
  primaryCropOrDemand: 'Tomatoes & Grapes',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  verified: true
};

export const DEFAULT_BUYER_USER: UserProfile = {
  id: 'buyer-freshmart-01',
  role: 'buyer',
  name: 'Anil Sharma',
  email: 'anil.sharma@freshmart.co.in',
  phone: '+91 98110 33411',
  location: 'Bhandup Central DC, Mumbai',
  farmOrBusinessName: 'Hotel Grand Residency & Banquets',
  primaryCropOrDemand: 'Tomatoes, Vegetables, Fruits',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  verified: true,
  buyerTier: 'bulk_business',
  businessCategory: 'Hotel & Banquets (4-Star)'
};

export const INITIAL_STANDING_ORDERS: StandingOrder[] = [
  {
    id: 'SO-HTL-101',
    buyerId: 'buyer-hotel-grand',
    buyerName: 'Hotel Grand Residency & Banquets',
    buyerTier: 'bulk_business',
    businessCategory: 'Hotel & Banquets (4-Star)',
    crop: 'Tomatoes',
    variety: 'Abhinav Hybrid (Table Grade)',
    quantityKg: 80,
    frequency: 'weekly',
    cycleDay: 'Every Monday 07:00 AM',
    unitPricePerKg: 24.5,
    estimatedCycleTotalINR: 1960,
    nextFulfillmentDate: '2026-09-15',
    cutoffDate: '2026-09-10',
    daysUntilCutoff: 3,
    status: 'active',
    autoConfirmNotification: {
      sent: true,
      noticeHeadline: 'Recurring Standing Order Cycle Ready',
      notificationMessage: 'Your weekly standing order of 80 kg Tomatoes will confirm in 3 days. No action needed unless you want to change it.',
      daysNoticeRemaining: 3,
      hoursRemainingToCutoff: 72
    },
    cancellationPolicy: {
      tier: 'bulk_business',
      cutoffDaysBeforeFulfillment: 5,
      penaltyPercentAfterCutoff: 25,
      penaltyProtectionINR: 490,
      farmerCompensationGuaranteed: true,
      policyLabel: 'Bulk Buyer 5-Day Protection Cutoff',
      description: 'Changes/skips require 5+ days notice before harvest. Cancellations after cutoff incur a 25% charge (₹490) paid directly to compensate the farmer for dedicated harvest allocation.'
    },
    assignedFarmerId: 'farmer-ramesh-01',
    assignedFarmerName: 'Ramesh Patil',
    farmLocation: 'Niphad, Nashik, Maharashtra',
    createdAt: '2026-08-10'
  },
  {
    id: 'SO-RES-202',
    buyerId: 'buyer-spice-route',
    buyerName: 'Spice Route Bistro & Bar',
    buyerTier: 'bulk_business',
    businessCategory: 'Fine-Dine Restaurant',
    crop: 'Onions',
    variety: 'Garwa Dark Red',
    quantityKg: 50,
    frequency: 'weekly',
    cycleDay: 'Every Wednesday 08:00 AM',
    unitPricePerKg: 20.0,
    estimatedCycleTotalINR: 1000,
    nextFulfillmentDate: '2026-09-17',
    cutoffDate: '2026-09-12',
    daysUntilCutoff: 4,
    status: 'active',
    autoConfirmNotification: {
      sent: true,
      noticeHeadline: 'Unchanging Menu Standing Order Active',
      notificationMessage: 'Your weekly standing order of 50 kg Garwa Onions will confirm in 4 days. Auto-locks into harvest schedule.',
      daysNoticeRemaining: 4,
      hoursRemainingToCutoff: 96
    },
    cancellationPolicy: {
      tier: 'bulk_business',
      cutoffDaysBeforeFulfillment: 5,
      penaltyPercentAfterCutoff: 25,
      penaltyProtectionINR: 250,
      farmerCompensationGuaranteed: true,
      policyLabel: 'Bulk Buyer 5-Day Protection Cutoff',
      description: 'Changes/skips require 5+ days notice before harvest. Cancellations after cutoff incur a 25% charge (₹250) paid to farmer.'
    },
    assignedFarmerId: 'farmer-ramesh-01',
    assignedFarmerName: 'Ramesh Patil',
    farmLocation: 'Lasalgaon, Nashik, Maharashtra',
    createdAt: '2026-08-12'
  },
  {
    id: 'SO-CKT-303',
    buyerId: 'buyer-royal-orchid',
    buyerName: 'Royal Orchid Central Kitchen',
    buyerTier: 'bulk_business',
    businessCategory: 'Cloud Kitchen Network',
    crop: 'Capsicum',
    variety: 'Indra Green Bell',
    quantityKg: 120,
    frequency: 'bi-weekly',
    cycleDay: 'Bi-Weekly on Thursdays',
    unitPricePerKg: 38.0,
    estimatedCycleTotalINR: 4560,
    nextFulfillmentDate: '2026-09-12',
    cutoffDate: '2026-09-07',
    daysUntilCutoff: 0,
    status: 'active',
    autoConfirmNotification: {
      sent: true,
      noticeHeadline: 'Harvest Locked • In Field Staging',
      notificationMessage: 'Cutoff passed. 120 kg Capsicum is locked into farmer harvest schedule. Cancellation compensation active.',
      daysNoticeRemaining: 0,
      hoursRemainingToCutoff: 0
    },
    cancellationPolicy: {
      tier: 'bulk_business',
      cutoffDaysBeforeFulfillment: 5,
      penaltyPercentAfterCutoff: 25,
      penaltyProtectionINR: 1140,
      farmerCompensationGuaranteed: true,
      policyLabel: 'Bulk Buyer 5-Day Protection Cutoff',
      description: 'Cutoff has passed! Any cancellation now will release 25% compensation (₹1,140) to farmer Ramesh Patil.'
    },
    assignedFarmerId: 'farmer-ramesh-01',
    assignedFarmerName: 'Ramesh Patil',
    farmLocation: 'Khed Shivapur, Pune',
    createdAt: '2026-08-01'
  },
  {
    id: 'SO-HSD-404',
    buyerId: 'buyer-society-cluster-01',
    buyerName: 'Pune West Apartment Collective',
    buyerTier: 'household',
    businessCategory: 'Residential Society (35 Households)',
    crop: 'Tomatoes',
    variety: 'Abhinav Hybrid (Table Grade)',
    quantityKg: 140,
    frequency: 'weekly',
    cycleDay: 'Every Saturday 09:00 AM',
    unitPricePerKg: 26.0,
    estimatedCycleTotalINR: 3640,
    nextFulfillmentDate: '2026-09-13',
    cutoffDate: '2026-09-12',
    daysUntilCutoff: 2,
    status: 'active',
    autoConfirmNotification: {
      sent: true,
      noticeHeadline: 'Household Basket Auto-Fulfill',
      notificationMessage: 'Your weekly 140 kg collective order is scheduled. Flexible edit/skip window open until 24h before delivery.',
      daysNoticeRemaining: 2,
      hoursRemainingToCutoff: 48
    },
    cancellationPolicy: {
      tier: 'household',
      cutoffDaysBeforeFulfillment: 1,
      penaltyPercentAfterCutoff: 0,
      penaltyProtectionINR: 0,
      farmerCompensationGuaranteed: false,
      policyLabel: 'Household Flexible Window (24–48 hrs)',
      description: 'Zero cancellation fee up to 24 hours prior. Volume pooled across household members.'
    },
    assignedFarmerId: 'farmer-ramesh-01',
    assignedFarmerName: 'Ramesh Patil',
    farmLocation: 'Niphad, Nashik, Maharashtra',
    createdAt: '2026-08-15'
  },
  {
    id: 'SO-HSD-505',
    buyerId: 'buyer-household-sub-02',
    buyerName: 'Kothrud Farm-to-Fork Consumer Club',
    buyerTier: 'household',
    businessCategory: 'Consumer Food Collective (20 Households)',
    crop: 'Onions',
    variety: 'Garwa Dark Red',
    quantityKg: 60,
    frequency: 'weekly',
    cycleDay: 'Every Sunday 10:00 AM',
    unitPricePerKg: 22.0,
    estimatedCycleTotalINR: 1320,
    nextFulfillmentDate: '2026-09-14',
    cutoffDate: '2026-09-13',
    daysUntilCutoff: 3,
    status: 'active',
    autoConfirmNotification: {
      sent: true,
      noticeHeadline: 'Weekly Fresh Basket Pre-Order',
      notificationMessage: 'Your weekly 60 kg Onions will confirm shortly. Free skip/edit open anytime up to 24h before fulfillment.',
      daysNoticeRemaining: 3,
      hoursRemainingToCutoff: 72
    },
    cancellationPolicy: {
      tier: 'household',
      cutoffDaysBeforeFulfillment: 1,
      penaltyPercentAfterCutoff: 0,
      penaltyProtectionINR: 0,
      farmerCompensationGuaranteed: false,
      policyLabel: 'Household Flexible Window (24–48 hrs)',
      description: 'Zero cancellation fee up to 24 hours prior to dispatch.'
    },
    assignedFarmerId: 'farmer-ramesh-01',
    assignedFarmerName: 'Ramesh Patil',
    farmLocation: 'Lasalgaon, Nashik, Maharashtra',
    createdAt: '2026-08-18'
  }
];

// Storage helper methods
export const getStoredBatches = (): ProduceBatch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
      return INITIAL_BATCHES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BATCHES;
  }
};

export const saveBatches = (batches: ProduceBatch[]): void => {
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  // Background push latest batch to backend
  if (batches.length > 0) {
    const topBatch = batches[0];
    api.batches.create(topBatch).catch(err => {
      console.debug('Background batch sync to backend:', err.message);
    });
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getStoredBuyers = (): BuyerMatch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUYERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(INITIAL_BUYERS));
      return INITIAL_BUYERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BUYERS;
  }
};

export const getStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_FARMER_USER));
      return DEFAULT_FARMER_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FARMER_USER;
  }
};

export const saveStoredUser = (user: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getStoredImpact = (): ImpactStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMPACT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify(INITIAL_IMPACT));
      return INITIAL_IMPACT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_IMPACT;
  }
};

export const getStoredVehicles = (): Vehicle[] => {
  return DEMO_VEHICLES;
};

export const createOrderFromBatch = (
  batch: ProduceBatch,
  decision: DecisionOption,
  buyerName: string = 'FreshMart Quick Commerce',
  vehicleName: string = 'Mini Pickup (Tata Ace)'
): Order => {
  const newOrder: Order = {
    id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    batchId: batch.id,
    crop: batch.crop,
    quantityKg: batch.quantityKg,
    qualityScore: batch.currentQualityScore,
    farmerId: batch.farmerId || 'farmer-ramesh-01',
    farmerName: batch.farmerName || 'Ramesh Patil',
    farmLocation: batch.farmLocation || 'Niphad, Nashik',
    buyerId: 'buyer-freshmart-01',
    buyerName: buyerName,
    buyerLocation: 'Bhandup Central DC, Mumbai',
    distanceKm: 34,
    pricePerKg: batch.basePricePerKg,
    totalValue: decision.expectedGrossRevenue,
    transportCost: decision.totalCosts,
    netFarmerEarnings: decision.expectedNetProfit,
    selectedVehicle: vehicleName,
    status: 'In Transit',
    estimatedTransitTime: '1h 15m',
    temperatureReadingC: 22.4,
    humidityPercent: 78,
    createdAt: new Date().toISOString(),
    pickupTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    timeline: [
      { status: 'Requested', timestamp: 'Just now', description: 'Order created via FreshRoute AI', completed: true },
      { status: 'Accepted', timestamp: 'Just now', description: 'Farmer accepted optimal decision', completed: true },
      { status: 'Pickup Scheduled', timestamp: 'Just now', description: `${vehicleName} assigned`, completed: true },
      { status: 'In Transit', timestamp: 'In progress', description: `En route to ${buyerName}`, completed: true },
      { status: 'Delivered', timestamp: 'Pending', description: 'Receiving dock inspection', completed: false },
      { status: 'Completed', timestamp: 'Pending', description: 'Smart escrow payout', completed: false }
    ]
  };

  const existingOrders = getStoredOrders();
  saveOrders([newOrder, ...existingOrders]);

  // Sync to Express backend API
  api.orders.create(newOrder).catch(err => {
    console.debug('Background order sync notice:', err.message);
  });

  return newOrder;
};

/**
 * Actively synchronizes batches, orders, buyers, and impact stats with the backend Express server
 */
export const syncWithBackend = async (): Promise<boolean> => {
  try {
    const [batchesRes, ordersRes, buyersRes, impactRes] = await Promise.allSettled([
      api.batches.getAll(),
      api.orders.getAll(),
      api.buyers.getAll(),
      api.analytics.getImpact(),
    ]);

    if (batchesRes.status === 'fulfilled' && batchesRes.value.batches?.length) {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batchesRes.value.batches));
    }
    if (ordersRes.status === 'fulfilled' && ordersRes.value.orders?.length) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersRes.value.orders));
    }
    if (buyersRes.status === 'fulfilled' && buyersRes.value.buyers?.length) {
      localStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(buyersRes.value.buyers));
    }
    if (impactRes.status === 'fulfilled' && impactRes.value.impact) {
      localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify(impactRes.value.impact));
    }

    return true;
  } catch (err) {
    console.debug('Background backend sync attempted:', err);
    return false;
  }
};

// Auto-trigger sync on browser load
if (typeof window !== 'undefined') {
  syncWithBackend().catch(() => {});
}

export const getStoredLanguage = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  } catch {
    return 'en';
  }
};

export const saveStoredLanguage = (lang: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch {
    // ignore
  }
};

// ==========================================
// Standing Orders & Tiered Cancellation Storage
// ==========================================

export const getStoredStandingOrders = (): StandingOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STANDING_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STANDING_ORDERS, JSON.stringify(INITIAL_STANDING_ORDERS));
      return INITIAL_STANDING_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STANDING_ORDERS;
  }
};

export const saveStoredStandingOrders = (orders: StandingOrder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STANDING_ORDERS, JSON.stringify(orders));
  } catch {
    // ignore
  }
};

export const getStoredHouseholdSkipRate = (): number => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD_SKIP_RATE);
    if (!raw) return 0.10; // Default historical skip rate: 10%
    return parseFloat(raw) || 0.10;
  } catch {
    return 0.10;
  }
};

export const saveStoredHouseholdSkipRate = (rate: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLD_SKIP_RATE, rate.toString());
  } catch {
    // ignore
  }
};

export const createStandingOrder = (data: {
  buyerId: string;
  buyerName: string;
  buyerTier: BuyerTier;
  businessCategory: string;
  crop: CropType;
  variety: string;
  quantityKg: number;
  frequency: 'weekly' | 'bi-weekly' | 'daily';
  cycleDay: string;
  unitPricePerKg: number;
  assignedFarmerId?: string;
  assignedFarmerName?: string;
  farmLocation?: string;
}): StandingOrder => {
  const isBulk = data.buyerTier === 'bulk_business';
  const cutoffDays = isBulk ? 5 : 1;
  const penaltyPercent = isBulk ? 25 : 0;
  const cycleTotal = Math.round(data.quantityKg * data.unitPricePerKg);
  const penaltyAmount = Math.round((cycleTotal * penaltyPercent) / 100);

  const newOrder: StandingOrder = {
    id: `SO-${isBulk ? 'BLK' : 'HSD'}-${Date.now().toString().slice(-4)}`,
    buyerId: data.buyerId,
    buyerName: data.buyerName,
    buyerTier: data.buyerTier,
    businessCategory: data.businessCategory,
    crop: data.crop,
    variety: data.variety,
    quantityKg: data.quantityKg,
    frequency: data.frequency,
    cycleDay: data.cycleDay,
    unitPricePerKg: data.unitPricePerKg,
    estimatedCycleTotalINR: cycleTotal,
    nextFulfillmentDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    cutoffDate: new Date(Date.now() + 86400000 * (7 - cutoffDays)).toISOString().split('T')[0],
    daysUntilCutoff: 7 - cutoffDays,
    status: 'active',
    autoConfirmNotification: {
      sent: true,
      noticeHeadline: isBulk ? 'Unchanging Menu Standing Order Created' : 'Household Weekly Basket Pre-Order Active',
      notificationMessage: `Your ${data.frequency} order of ${data.quantityKg} kg ${data.crop} will auto-confirm before each cycle cutoff. No action needed unless you want to modify it.`,
      daysNoticeRemaining: 7 - cutoffDays,
      hoursRemainingToCutoff: (7 - cutoffDays) * 24
    },
    cancellationPolicy: {
      tier: data.buyerTier,
      cutoffDaysBeforeFulfillment: cutoffDays,
      penaltyPercentAfterCutoff: penaltyPercent,
      penaltyProtectionINR: penaltyAmount,
      farmerCompensationGuaranteed: isBulk,
      policyLabel: isBulk ? 'Bulk Buyer 5-Day Protection Cutoff' : 'Household Flexible Window (24–48 hrs)',
      description: isBulk
        ? `Modifications required 5+ days before harvest. Cancellations within cutoff incur a 25% charge (₹${penaltyAmount}) to protect farmer harvest planning.`
        : 'Flexible edit/skip allowed up to 24–48 hours prior with zero penalty fees.'
    },
    assignedFarmerId: data.assignedFarmerId || 'farmer-ramesh-01',
    assignedFarmerName: data.assignedFarmerName || 'Ramesh Patil',
    farmLocation: data.farmLocation || 'Niphad, Nashik, Maharashtra',
    createdAt: new Date().toISOString().split('T')[0]
  };

  const existing = getStoredStandingOrders();
  const updated = [newOrder, ...existing];
  saveStoredStandingOrders(updated);
  return newOrder;
};

export const pauseStandingOrder = (id: string, reason: string): StandingOrder | null => {
  const existing = getStoredStandingOrders();
  const index = existing.findIndex(o => o.id === id);
  if (index === -1) return null;

  const target = { ...existing[index] };
  target.status = 'paused';
  target.pauseDetails = {
    isPaused: true,
    pausedUntilDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    reason
  };

  existing[index] = target;
  saveStoredStandingOrders(existing);
  return target;
};

export const resumeStandingOrder = (id: string): StandingOrder | null => {
  const existing = getStoredStandingOrders();
  const index = existing.findIndex(o => o.id === id);
  if (index === -1) return null;

  const target = { ...existing[index] };
  target.status = 'active';
  if (target.pauseDetails) {
    target.pauseDetails.isPaused = false;
  }

  existing[index] = target;
  saveStoredStandingOrders(existing);
  return target;
};

export const adjustStandingOrder = (id: string, newQtyKg: number, reason: string): StandingOrder | null => {
  const existing = getStoredStandingOrders();
  const index = existing.findIndex(o => o.id === id);
  if (index === -1) return null;

  const target = { ...existing[index] };
  const origQty = target.quantityKg;
  target.quantityKg = newQtyKg;
  target.status = 'adjusted';
  target.estimatedCycleTotalINR = Math.round(newQtyKg * target.unitPricePerKg);
  target.cancellationPolicy.penaltyProtectionINR = Math.round((target.estimatedCycleTotalINR * target.cancellationPolicy.penaltyPercentAfterCutoff) / 100);
  target.adjustmentDetails = {
    isAdjusted: true,
    originalQuantityKg: origQty,
    adjustedQuantityKg: newQtyKg,
    reason
  };

  existing[index] = target;
  saveStoredStandingOrders(existing);
  return target;
};

export const cancelStandingOrder = (id: string): { order: StandingOrder; penaltyApplied: boolean; penaltyAmount: number; message: string } | null => {
  const existing = getStoredStandingOrders();
  const index = existing.findIndex(o => o.id === id);
  if (index === -1) return null;

  const target = { ...existing[index] };
  target.status = 'cancelled';

  // Check if past cutoff
  const isPastCutoff = target.daysUntilCutoff <= 0;
  const isBulk = target.buyerTier === 'bulk_business';
  const penaltyApplied = isBulk && isPastCutoff;
  const penaltyAmount = penaltyApplied ? target.cancellationPolicy.penaltyProtectionINR : 0;

  let message = '';
  if (penaltyApplied) {
    message = `Order cancelled within the 5-day lock window. A 25% cancellation charge (₹${penaltyAmount}) has been debited to compensate farmer ${target.assignedFarmerName} for harvest allocation loss.`;
  } else if (isBulk) {
    message = `Order cancelled before the 5-day cutoff. No penalty fee applied. Farmer harvest allocation released.`;
  } else {
    message = `Household standing order cancelled within flexible policy. Zero penalty fee charged.`;
  }

  existing[index] = target;
  saveStoredStandingOrders(existing);
  return { order: target, penaltyApplied, penaltyAmount, message };
};

export const getDemandBreakdownForCrop = (
  crop: CropType | string,
  totalPlannedKg: number = 800,
  customSkipRate?: number
): DemandBreakdown => {
  const allOrders = getStoredStandingOrders().filter(o => o.crop === crop && o.status !== 'cancelled');
  const skipRate = customSkipRate !== undefined ? customSkipRate : getStoredHouseholdSkipRate();

  const bulkOrders = allOrders.filter(o => o.buyerTier === 'bulk_business' && o.status !== 'paused');
  const householdOrders = allOrders.filter(o => o.buyerTier === 'household' && o.status !== 'paused');

  const bulkKg = bulkOrders.reduce((sum, o) => sum + o.quantityKg, 0);
  const householdKg = householdOrders.reduce((sum, o) => sum + o.quantityKg, 0);

  const bulkLockedRevenue = bulkOrders.reduce((sum, o) => sum + o.estimatedCycleTotalINR, 0);
  const householdProjectedRevenue = householdOrders.reduce((sum, o) => sum + o.estimatedCycleTotalINR, 0);

  const totalDemandKg = bulkKg + householdKg;
  const bulkPercent = totalDemandKg > 0 ? Math.round((bulkKg / totalDemandKg) * 100) : 65;
  const householdPercent = totalDemandKg > 0 ? 100 - bulkPercent : 35;

  // Expected household cancellations based on historical skip rate
  const expectedHouseholdSkipsKg = Math.round(householdKg * skipRate);
  const safetyRiskBufferKg = expectedHouseholdSkipsKg; // reserved buffer to protect farmer

  // Safe pre-order listing quantity:
  // Farmer lists 100% of bulk standing orders (since they are locked with penalty backing)
  // PLUS household demand discounted by the historical skip rate
  const expectedHouseholdRealizedKg = Math.max(0, householdKg - expectedHouseholdSkipsKg);
  const recommendedSafePreOrderListingKg = bulkKg + expectedHouseholdRealizedKg;

  const unhedgedSpotReserveKg = Math.max(0, totalPlannedKg - recommendedSafePreOrderListingKg);

  const avgPrice = householdOrders.length > 0
    ? householdOrders.reduce((sum, o) => sum + o.unitPricePerKg, 0) / householdOrders.length
    : 24;

  const guaranteedRevenueFloorINR = bulkLockedRevenue + Math.round(expectedHouseholdRealizedKg * avgPrice);

  // Reliability Score: Weighted higher if bulk standing orders make up more of the volume
  const reliabilityScorePercent = Math.min(99, Math.round(bulkPercent * 0.98 + (100 - skipRate * 100) * 0.35));

  return {
    crop: crop as CropType,
    totalPlannedKg,
    bulkStandingOrdersKg: bulkKg,
    bulkStandingOrdersPercent: bulkPercent,
    bulkOrderCount: bulkOrders.length,
    bulkLockedRevenueINR: bulkLockedRevenue,
    householdOrdersKg: householdKg,
    householdOrdersPercent: householdPercent,
    householdOrderCount: householdOrders.length,
    householdProjectedRevenueINR: householdProjectedRevenue,
    historicalHouseholdSkipRate: skipRate,
    expectedHouseholdSkipsKg,
    safetyRiskBufferKg,
    recommendedSafePreOrderListingKg,
    unhedgedSpotReserveKg,
    guaranteedRevenueFloorINR,
    reliabilityScorePercent
  };
};


