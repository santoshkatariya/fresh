export type Role = 'farmer' | 'buyer';

export type CropType = 
  | 'Tomatoes' 
  | 'Onions' 
  | 'Potatoes' 
  | 'Grapes' 
  | 'Mangoes' 
  | 'Pomegranates' 
  | 'Green Chillies' 
  | 'Capsicum'
  | 'Bananas';

export type QualityGrade = 'A' | 'B' | 'C' | 'D';

export type DefectType = 
  | 'pest' 
  | 'spoilage_rot' 
  | 'bruise_mechanical' 
  | 'physiological' 
  | 'fungal_blight'
  | 'fresh_intact';

export interface BoundingBox {
  top: number; // percentage 0 - 100
  left: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

export interface DetectedDefect {
  id: string;
  type: DefectType;
  name: string;
  scientificOrCommonName?: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  confidencePercent: number; // 0 - 100
  description: string;
  affectedAreaPercent: number; // percentage of surface affected
  boxCoordinates?: BoundingBox;
  recommendedAction: string;
}

export interface ProduceBiometrics {
  crop: CropType | string;
  variety: string;
  qualityScore: number; // 0 - 100
  qualityGrade: QualityGrade;
  freshnessPercent: number; // 0 - 100
  ripenessPercent: number; // 0 - 100
  damagePercent: number; // 0 - 100
  pestInfestationRisk: 'clean' | 'low' | 'moderate' | 'severe';
  spoilageRiskPercent: number; // 0 - 100
  firmnessRating: number; // 0 - 10 (e.g. 7.8)
  estimatedShelfLifeHours: number;
  defects: DetectedDefect[];
  segregationRecommended: boolean;
  recommendedMarketAction: string;
  pestSummary: string;
  diseaseSummary: string;
  storageTemperatureAdvice: string;
  voiceSummary?: string;
}

export interface ProduceBatch {
  id: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  crop: CropType;
  variety: string;
  quantityKg: number;
  weightKg?: number;
  harvestDate: string;
  harvestTime: string;
  basePricePerKg: number;
  currentQualityScore: number; // 0 - 100
  qualityScore?: number;
  freshnessPercent: number; // 0 - 100
  ripenessPercent: number; // 0 - 100
  damagePercent: number; // 0 - 100
  estimatedShelfLifeHours: number;
  spoilageRiskPercent: number;
  detectedIssues: string[];
  imageUrl: string;
  biometrics?: ProduceBiometrics;
  status: 'available' | 'reserved' | 'in_transit' | 'sold' | 'processed' | 'stored';
  storageType: 'ambient' | 'ventilated' | 'cold_storage';
  createdAt: string;
  category?: 'vegetable' | 'fruit' | 'grain' | 'spice';
  targetPricePerKg?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'mini_pickup' | 'small_truck' | 'medium_truck' | 'large_truck';
  capacityKg: number;
  costPerKm: number;
  coolingAvailable: boolean;
  transitSpeedKmh: number;
  emissionsFactorGPerKm: number;
  description: string;
  image: string;
}

export interface VehicleOption {
  vehicle: Vehicle;
  tripsNeeded: number;
  totalDistanceKm: number;
  transportCost: number;
  transitHours: number;
  spoilagePercentDuringTransit: number;
  recoverableQuantityKg: number;
  expectedRevenue: number;
  netProfit: number;
  co2Kg: number;
  isBestProfit: boolean;
  isRecommended?: boolean;
  whyRecommended?: string;
}

export interface BuyerMatch {
  id: string;
  name: string;
  companyName: string;
  businessType: 'Retail Chain' | 'Food Processor' | 'Mandir/Catering Wholesale' | 'Quick-Commerce Dark Store' | 'Export House';
  buyerType?: string;
  location: string;
  distanceKm: number;
  demandedCrops: CropType[];
  offeredPricePerKg: number;
  minQualityScore: number;
  requiredQualityScore?: number;
  demandQuantityKg?: number;
  paymentTerms: string;
  reliabilityRating: number; // e.g. 4.9
  aiMatchScore: number; // percentage e.g. 96
  verifiedBadge: boolean;
  avatarUrl: string;
}

export type DecisionActionType = 
  | 'SELL_NOW' 
  | 'WAIT_12H' 
  | 'WAIT_24H'
  | 'REROUTE_WHOLESALE' 
  | 'FOOD_PROCESSING' 
  | 'COLD_STORAGE' 
  | 'DONATE_CHARITY';

export interface DecisionOption {
  action: DecisionActionType;
  title: string;
  subtitle: string;
  expectedGrossRevenue: number;
  totalCosts: number;
  expectedNetProfit: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  shelfLifeRemainingHours: number;
  qualityAtDestination: number;
  keyAdvantage: string;
  explanation: string;
  isBest: boolean;
  recommendedVehicle?: string;
  recommendedBuyer?: string;
}

export type OrderStatus = 
  | 'Requested' 
  | 'Accepted' 
  | 'Pickup Scheduled' 
  | 'In Transit' 
  | 'Delivered' 
  | 'Completed' 
  | 'Cancelled';

export interface Order {
  id: string;
  batchId: string;
  crop: CropType;
  quantityKg: number;
  qualityScore: number;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  distanceKm: number;
  pricePerKg: number;
  totalValue: number;
  transportCost: number;
  netFarmerEarnings: number;
  selectedVehicle: string;
  status: OrderStatus;
  estimatedTransitTime: string;
  temperatureReadingC?: number;
  humidityPercent?: number;
  createdAt: string;
  pickupTime?: string;
  deliveryTime?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    description: string;
    completed: boolean;
  }[];
}

export type BuyerTier = 'household' | 'bulk_business';

export interface UserProfile {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  location: string;
  farmOrBusinessName: string;
  primaryCropOrDemand: string;
  avatarUrl: string;
  verified: boolean;
  buyerTier?: BuyerTier;
  businessCategory?: string;
}

export interface StandingOrderCancellationPolicy {
  tier: BuyerTier;
  cutoffDaysBeforeFulfillment: number; // 1-2 days (24-48h) for household, 5-7 days for bulk
  penaltyPercentAfterCutoff: number; // 0% for household, 25% for bulk
  penaltyProtectionINR: number;
  farmerCompensationGuaranteed: boolean;
  policyLabel: string;
  description: string;
}

export interface StandingOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerTier: BuyerTier;
  businessCategory: string; // e.g. "Hotel & Banquets (4-Star)", "Fine-Dine Restaurant", "Residential Co-op"
  crop: CropType;
  variety: string;
  quantityKg: number;
  frequency: 'weekly' | 'bi-weekly' | 'daily';
  cycleDay: string; // e.g. "Every Monday 07:00 AM", "Every Wednesday"
  unitPricePerKg: number;
  estimatedCycleTotalINR: number;
  nextFulfillmentDate: string;
  cutoffDate: string;
  daysUntilCutoff: number;
  status: 'active' | 'paused' | 'adjusted' | 'cancelled';
  autoConfirmNotification: {
    sent: boolean;
    noticeHeadline: string;
    notificationMessage: string;
    daysNoticeRemaining: number;
    hoursRemainingToCutoff: number;
  };
  cancellationPolicy: StandingOrderCancellationPolicy;
  pauseDetails?: {
    isPaused: boolean;
    pausedUntilDate?: string;
    reason?: string;
  };
  adjustmentDetails?: {
    isAdjusted: boolean;
    originalQuantityKg: number;
    adjustedQuantityKg: number;
    reason?: string;
  };
  assignedFarmerId: string;
  assignedFarmerName: string;
  farmLocation: string;
  createdAt: string;
}

export interface DemandBreakdown {
  crop: CropType;
  totalPlannedKg: number;
  bulkStandingOrdersKg: number;
  bulkStandingOrdersPercent: number;
  bulkOrderCount: number;
  bulkLockedRevenueINR: number;
  householdOrdersKg: number;
  householdOrdersPercent: number;
  householdOrderCount: number;
  householdProjectedRevenueINR: number;
  historicalHouseholdSkipRate: number; // e.g. 0.10 for 10%
  expectedHouseholdSkipsKg: number; // householdOrdersKg * skipRate
  safetyRiskBufferKg: number; // buffer reserved to protect farmer from skips
  recommendedSafePreOrderListingKg: number; // bulkStandingOrdersKg + (householdOrdersKg - expectedHouseholdSkipsKg)
  unhedgedSpotReserveKg: number; // totalPlannedKg - recommendedSafePreOrderListingKg
  guaranteedRevenueFloorINR: number;
  reliabilityScorePercent: number;
}

export interface ValueTimePoint {
  hoursElapsed: number;
  label: string;
  qualityScore: number;
  shelfLifeHoursRemaining: number;
  spoilageRatePercent: number;
  recoverableKg: number;
  marketPricePerKg: number;
  expectedRevenue: number;
  transportCost: number;
  netProfit: number;
  valueLostVsNow: number;
  statusRisk: 'Prime' | 'Good' | 'Moderate' | 'Critical';
}

export interface ImpactStats {
  valueRecoveredINR: number;
  foodWastePreventedTons: number;
  decisionAccuracyPercent: number;
  transportCostSavingsPercent: number;
  co2EmissionsSavedKg: number;
  farmersEmpowered: number;
}

export interface MandiMarketQuote {
  id: string;
  mandiName: string;
  state: string;
  district: string;
  crop: string;
  variety: string;
  modalPricePerKg: number;
  minPricePerKg: number;
  maxPricePerKg: number;
  arrivalVolumeQuintals: number;
  dailyChangePercent: number;
  trendDirection: 'up' | 'down' | 'stable';
  traderCommissionPercent: number; // e.g. 6.5%
  weighmentFeePerKg: number; // e.g. 1.80
  loadingFeePerKg: number; // e.g. 0.75
  transportBruisingLossPercent: number; // e.g. 7.5%
  netRealizedFarmerRate: number; // net take-home after deductions
  lastUpdated: string;
  isAPMCVerified: boolean;
}

export interface FreshRoutePriceQuote {
  crop: string;
  variety: string;
  baseFarmGatePricePerKg: number;
  gradeBonusPerKg: number;
  preCoolingIncentivePerKg: number;
  middlemanCommissionPercent: number; // 0%
  handlingChargesPerKg: number; // 0
  netRealizedFarmerRate: number;
  escrowSettlementHours: number;
  activeBuyerDemandCount: number;
  topBuyerName: string;
  priceAdvantageVsMandi: number; // in INR
  percentageAdvantageVsMandi: number; // in %
  lastUpdated: string;
}

export interface CityRetailRateQuote {
  city: string;
  state: string;
  distanceFromFarmKm: number;
  averageRetailRatePerKg: number;
  quickCommerceRatePerKg: number; // Blinkit / Zepto
  supermarketRatePerKg: number; // Reliance / Nature's Basket
  cityDcIntakeRatePerKg: number;
  estimatedFreightPerKg: number;
  netDeliveredRatePerKg: number;
  consumerPriceSpread: number; // Retail price minus Farmer Mandi net rate
  topBuyerCluster: string;
}

export interface RealTimePriceComparison {
  crop: string;
  variety: string;
  harvestLotWeightKg: number;
  qualityScore: number;
  qualityGrade: QualityGrade;
  selectedMandi: MandiMarketQuote;
  freshRoutePrice: FreshRoutePriceQuote;
  cityRates: CityRetailRateQuote[];
  mandiEarningsForLot: number;
  freshRouteEarningsForLot: number;
  netExtraTakeHomeForLot: number;
  middlemanCutExtractedForLot: number;
  farmerShareOfConsumerRupeeAtMandi: number; // e.g. 29%
  farmerShareOfConsumerRupeeAtFreshRoute: number; // e.g. 64%
  aiPriceArbitrageInsight: string;
  timestamp: string;
}

