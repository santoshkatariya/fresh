// Real-Time Mandi (APMC) vs FreshRoute Farm Gate vs City Retail Rates Engine
import { MandiMarketQuote, FreshRoutePriceQuote, CityRetailRateQuote, RealTimePriceComparison, QualityGrade } from '../types';

export interface CommodityMarketData {
  crop: string;
  variety: string;
  category: 'Vegetable' | 'Fruit' | 'Perishable' | 'Cash Crop';
  baseMandiRate: number;
  freshRouteRate: number;
  cityRetailBase: number;
  mandis: {
    id: string;
    name: string;
    state: string;
    district: string;
    modalPrice: number;
    arrivalQuintals: number;
    dailyChange: number;
  }[];
  cityBenchmarks: {
    city: string;
    state: string;
    distanceKm: number;
    retailMultiplier: number;
    quickCommerceMultiplier: number;
    supermarketMultiplier: number;
    dcIntakeMultiplier: number;
    freightPerKg: number;
    topBuyerCluster: string;
  }[];
}

export const COMMODITY_MARKET_REGISTRY: CommodityMarketData[] = [
  {
    crop: 'Tomatoes',
    variety: 'Abhinav Hybrid (Table Grade)',
    category: 'Vegetable',
    baseMandiRate: 22.5,
    freshRouteRate: 34.0,
    cityRetailBase: 58.0,
    mandis: [
      { id: 'mandi-pimpalgaon', name: 'Pimpalgaon APMC Mandi, Nashik', state: 'Maharashtra', district: 'Nashik', modalPrice: 22.0, arrivalQuintals: 3850, dailyChange: 2.8 },
      { id: 'mandi-kolar', name: 'Kolar Agro Mandi (Asia Tomato Hub)', state: 'Karnataka', district: 'Kolar', modalPrice: 24.5, arrivalQuintals: 6200, dailyChange: -1.2 },
      { id: 'mandi-vashi', name: 'Vashi Wholesale APMC, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 26.0, arrivalQuintals: 4100, dailyChange: 3.5 },
      { id: 'mandi-gultekdi', name: 'Gultekdi Market Yard, Pune', state: 'Maharashtra', district: 'Pune', modalPrice: 23.5, arrivalQuintals: 2900, dailyChange: 1.1 },
      { id: 'mandi-azadpur', name: 'Azadpur National Mandi, Delhi', state: 'Delhi', district: 'North Delhi', modalPrice: 28.0, arrivalQuintals: 8500, dailyChange: 4.2 },
      { id: 'mandi-yeshwanthpur', name: 'Yeshwanthpur APMC, Bengaluru', state: 'Karnataka', district: 'Bengaluru', modalPrice: 25.0, arrivalQuintals: 3400, dailyChange: -0.8 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.05, supermarketMultiplier: 1.12, dcIntakeMultiplier: 0.64, freightPerKg: 2.4, topBuyerCluster: 'Bhandup / Vashi DC & Quick-Commerce Hubs' },
      { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.88, quickCommerceMultiplier: 0.92, supermarketMultiplier: 0.98, dcIntakeMultiplier: 0.58, freightPerKg: 2.6, topBuyerCluster: 'Hinjawadi IT Belt & Gultekdi Wholesale Hub' },
      { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.15, quickCommerceMultiplier: 1.22, supermarketMultiplier: 1.28, dcIntakeMultiplier: 0.72, freightPerKg: 6.8, topBuyerCluster: 'Electronic City DC & Whitefield Supermarkets' },
      { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.08, quickCommerceMultiplier: 1.14, supermarketMultiplier: 1.20, dcIntakeMultiplier: 0.68, freightPerKg: 8.5, topBuyerCluster: 'Azadpur Wholesale Link & Gurgaon Dark Stores' },
      { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 0.96, quickCommerceMultiplier: 1.02, supermarketMultiplier: 1.08, dcIntakeMultiplier: 0.62, freightPerKg: 5.2, topBuyerCluster: 'Bowenpally DC & HITEC City Gourmet Hubs' },
    ],
  },
  {
    crop: 'Onions',
    variety: 'Nashik Garwa Red (Export Grade)',
    category: 'Vegetable',
    baseMandiRate: 18.0,
    freshRouteRate: 26.5,
    cityRetailBase: 42.0,
    mandis: [
      { id: 'mandi-lasalgaon', name: 'Lasalgaon APMC (Asia Onion Capital)', state: 'Maharashtra', district: 'Nashik', modalPrice: 18.5, arrivalQuintals: 14200, dailyChange: -3.2 },
      { id: 'mandi-pimpalgaon-onion', name: 'Pimpalgaon Baswant APMC', state: 'Maharashtra', district: 'Nashik', modalPrice: 17.8, arrivalQuintals: 9800, dailyChange: -2.5 },
      { id: 'mandi-solapur', name: 'Solapur APMC Market', state: 'Maharashtra', district: 'Solapur', modalPrice: 16.5, arrivalQuintals: 5400, dailyChange: 0.5 },
      { id: 'mandi-vashi-onion', name: 'Vashi Onion-Potato Yard, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 21.0, arrivalQuintals: 7600, dailyChange: 1.8 },
      { id: 'mandi-azadpur-onion', name: 'Azadpur Mandi, Delhi NCR', state: 'Delhi', district: 'North Delhi', modalPrice: 23.5, arrivalQuintals: 12000, dailyChange: 2.1 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.08, supermarketMultiplier: 1.15, dcIntakeMultiplier: 0.65, freightPerKg: 1.8, topBuyerCluster: 'Bhiwandi Central Storage & Vashi APMC' },
      { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.92, quickCommerceMultiplier: 0.98, supermarketMultiplier: 1.05, dcIntakeMultiplier: 0.60, freightPerKg: 2.0, topBuyerCluster: 'Chakan Processing & City Wholesale' },
      { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.18, quickCommerceMultiplier: 1.25, supermarketMultiplier: 1.30, dcIntakeMultiplier: 0.74, freightPerKg: 5.5, topBuyerCluster: 'Yeshwanthpur Wholesale & Retail Chains' },
      { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.12, quickCommerceMultiplier: 1.20, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.70, freightPerKg: 6.8, topBuyerCluster: 'Azadpur North India Distribution' },
      { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 1.05, quickCommerceMultiplier: 1.10, supermarketMultiplier: 1.16, dcIntakeMultiplier: 0.66, freightPerKg: 4.2, topBuyerCluster: 'Begum Bazaar & Quick-Commerce Hubs' },
    ],
  },
  {
    crop: 'Grapes',
    variety: 'Thompson Seedless / Sonaka (Export Spec)',
    category: 'Fruit',
    baseMandiRate: 45.0,
    freshRouteRate: 72.0,
    cityRetailBase: 135.0,
    mandis: [
      { id: 'mandi-nashik-grapes', name: 'Nashik Grape Agro Mandi', state: 'Maharashtra', district: 'Nashik', modalPrice: 46.0, arrivalQuintals: 4200, dailyChange: 4.8 },
      { id: 'mandi-sangli-grapes', name: 'Sangli Tasgaon Grape Mandi', state: 'Maharashtra', district: 'Sangli', modalPrice: 48.0, arrivalQuintals: 3600, dailyChange: 3.2 },
      { id: 'mandi-vashi-grapes', name: 'Vashi Fruit Market, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 58.0, arrivalQuintals: 2100, dailyChange: 5.1 },
      { id: 'mandi-azadpur-grapes', name: 'Azadpur Fruit Yard, Delhi', state: 'Delhi', district: 'North Delhi', modalPrice: 65.0, arrivalQuintals: 4800, dailyChange: 6.0 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.12, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.62, freightPerKg: 3.2, topBuyerCluster: 'Export Cold Terminals & Gourmet Grocers' },
      { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.90, quickCommerceMultiplier: 0.98, supermarketMultiplier: 1.10, dcIntakeMultiplier: 0.56, freightPerKg: 3.4, topBuyerCluster: 'Koregaon Park & Aundh Premium Retail' },
      { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.22, quickCommerceMultiplier: 1.30, supermarketMultiplier: 1.40, dcIntakeMultiplier: 0.70, freightPerKg: 7.5, topBuyerCluster: 'Nature Basket & Modern Trade Chains' },
      { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.28, quickCommerceMultiplier: 1.35, supermarketMultiplier: 1.45, dcIntakeMultiplier: 0.75, freightPerKg: 9.8, topBuyerCluster: 'Khan Market & South Delhi Supermarkets' },
      { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 1.10, quickCommerceMultiplier: 1.18, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.65, freightPerKg: 6.2, topBuyerCluster: 'Jubilee Hills Premium Outlets' },
    ],
  },
  {
    crop: 'Pomegranates',
    variety: 'Bhagwa Super Red (A-Grade)',
    category: 'Fruit',
    baseMandiRate: 85.0,
    freshRouteRate: 135.0,
    cityRetailBase: 220.0,
    mandis: [
      { id: 'mandi-solapur-pom', name: 'Solapur Bhagwa Agro Mandi', state: 'Maharashtra', district: 'Solapur', modalPrice: 88.0, arrivalQuintals: 2100, dailyChange: 2.4 },
      { id: 'mandi-rahata-pom', name: 'Rahata APMC, Ahmednagar', state: 'Maharashtra', district: 'Ahmednagar', modalPrice: 84.0, arrivalQuintals: 1800, dailyChange: 1.5 },
      { id: 'mandi-vashi-pom', name: 'Vashi Wholesale Fruit Market', state: 'Maharashtra', district: 'Thane', modalPrice: 105.0, arrivalQuintals: 1200, dailyChange: 3.8 },
      { id: 'mandi-azadpur-pom', name: 'Azadpur Premium Fruit Gate, Delhi', state: 'Delhi', district: 'North Delhi', modalPrice: 118.0, arrivalQuintals: 2400, dailyChange: 4.5 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.10, supermarketMultiplier: 1.20, dcIntakeMultiplier: 0.65, freightPerKg: 3.5, topBuyerCluster: 'Juice Extraction & Quick-Commerce Hubs' },
      { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.92, quickCommerceMultiplier: 0.98, supermarketMultiplier: 1.12, dcIntakeMultiplier: 0.60, freightPerKg: 3.8, topBuyerCluster: 'Wholesale Processors & Retail Chains' },
      { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.18, quickCommerceMultiplier: 1.25, supermarketMultiplier: 1.35, dcIntakeMultiplier: 0.72, freightPerKg: 8.0, topBuyerCluster: 'Fresh Juice Chains & E-Commerce DC' },
      { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.25, quickCommerceMultiplier: 1.32, supermarketMultiplier: 1.40, dcIntakeMultiplier: 0.78, freightPerKg: 10.5, topBuyerCluster: 'Export Houses & Premium Supermarkets' },
      { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 1.08, quickCommerceMultiplier: 1.15, supermarketMultiplier: 1.22, dcIntakeMultiplier: 0.68, freightPerKg: 6.8, topBuyerCluster: 'Banjara Hills Gourmet Retail' },
    ],
  },
  {
    crop: 'Capsicum',
    variety: 'Indra Green / Colored Bell Pepper',
    category: 'Vegetable',
    baseMandiRate: 32.0,
    freshRouteRate: 48.0,
    cityRetailBase: 95.0,
    mandis: [
      { id: 'mandi-narayangaon-capsicum', name: 'Narayangaon Vegetable Belt Mandi', state: 'Maharashtra', district: 'Pune', modalPrice: 32.5, arrivalQuintals: 1600, dailyChange: 5.2 },
      { id: 'mandi-belgaum-capsicum', name: 'Belagavi Agro APMC, Karnataka', state: 'Karnataka', district: 'Belagavi', modalPrice: 34.0, arrivalQuintals: 2100, dailyChange: 3.1 },
      { id: 'mandi-vashi-capsicum', name: 'Vashi Exotic Vegetable Yard', state: 'Maharashtra', district: 'Thane', modalPrice: 42.0, arrivalQuintals: 950, dailyChange: 6.0 },
      { id: 'mandi-azadpur-capsicum', name: 'Azadpur Polyhouse Section, Delhi', state: 'Delhi', district: 'North Delhi', modalPrice: 46.0, arrivalQuintals: 1800, dailyChange: 4.8 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.14, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.62, freightPerKg: 2.8, topBuyerCluster: 'HORECA Hotels & Zepto/Blinkit Dark Stores' },
      { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.88, quickCommerceMultiplier: 0.95, supermarketMultiplier: 1.08, dcIntakeMultiplier: 0.55, freightPerKg: 3.0, topBuyerCluster: 'Catering Hubs & IT Park Kitchens' },
      { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.20, quickCommerceMultiplier: 1.28, supermarketMultiplier: 1.35, dcIntakeMultiplier: 0.70, freightPerKg: 7.2, topBuyerCluster: 'QSR Restaurant Chains & Cloud Kitchens' },
      { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.22, quickCommerceMultiplier: 1.30, supermarketMultiplier: 1.38, dcIntakeMultiplier: 0.74, freightPerKg: 9.2, topBuyerCluster: '5-Star Hospitality Chains' },
      { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 1.05, quickCommerceMultiplier: 1.12, supermarketMultiplier: 1.20, dcIntakeMultiplier: 0.65, freightPerKg: 5.8, topBuyerCluster: 'Gachibowli Restaurant Clusters' },
    ],
  },
  {
    crop: 'Potatoes',
    variety: 'Kufri Jyoti / Pukhraj (Processing Grade)',
    category: 'Vegetable',
    baseMandiRate: 15.0,
    freshRouteRate: 22.0,
    cityRetailBase: 36.0,
    mandis: [
      { id: 'mandi-manchar-potato', name: 'Manchar Agro Yard, Pune', state: 'Maharashtra', district: 'Pune', modalPrice: 15.2, arrivalQuintals: 8400, dailyChange: 0.8 },
      { id: 'mandi-hassan-potato', name: 'Hassan APMC, Karnataka', state: 'Karnataka', district: 'Hassan', modalPrice: 14.8, arrivalQuintals: 7200, dailyChange: -1.0 },
      { id: 'mandi-vashi-potato', name: 'Vashi APMC Potato Yard', state: 'Maharashtra', district: 'Thane', modalPrice: 18.0, arrivalQuintals: 9500, dailyChange: 1.5 },
      { id: 'mandi-agra-potato', name: 'Agra Mandi, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Agra', modalPrice: 13.5, arrivalQuintals: 22000, dailyChange: -2.0 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.05, supermarketMultiplier: 1.10, dcIntakeMultiplier: 0.65, freightPerKg: 1.6, topBuyerCluster: 'Chip Processors & Central Kitchens' },
      { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.90, quickCommerceMultiplier: 0.95, supermarketMultiplier: 1.02, dcIntakeMultiplier: 0.60, freightPerKg: 1.8, topBuyerCluster: 'Wholesale Mandi & Institutional Catering' },
      { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.15, quickCommerceMultiplier: 1.20, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.72, freightPerKg: 5.0, topBuyerCluster: 'French Fry Freezing Units & Supermarkets' },
      { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.08, quickCommerceMultiplier: 1.14, supermarketMultiplier: 1.18, dcIntakeMultiplier: 0.68, freightPerKg: 6.2, topBuyerCluster: 'Snack Food Processing Plants' },
      { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 1.02, quickCommerceMultiplier: 1.08, supermarketMultiplier: 1.12, dcIntakeMultiplier: 0.64, freightPerKg: 4.0, topBuyerCluster: 'Bulk Food Distributors' },
    ],
  },
];

/**
 * Calculates a complete real-time comparison for any crop, quantity, and grade
 */
export function calculateRealTimePriceComparison(params: {
  crop: string;
  variety?: string;
  weightKg?: number;
  qualityScore?: number;
  qualityGrade?: QualityGrade;
  selectedMandiId?: string;
  targetCity?: string;
}): RealTimePriceComparison {
  const {
    crop = 'Tomatoes',
    weightKg = 850,
    qualityScore = 82,
    qualityGrade = 'A',
    selectedMandiId,
    targetCity = 'Mumbai',
  } = params;

  // Find matching commodity
  const comm =
    COMMODITY_MARKET_REGISTRY.find(
      (c) => c.crop.toLowerCase() === crop.toLowerCase() || crop.toLowerCase().includes(c.crop.toLowerCase())
    ) || COMMODITY_MARKET_REGISTRY[0];

  // Pick selected mandi or default first
  const mandiItem = selectedMandiId
    ? comm.mandis.find((m) => m.id === selectedMandiId) || comm.mandis[0]
    : comm.mandis[0];

  // Traditional Mandi Hidden Deductions:
  // 1. Trader Commission: 6.5%
  // 2. Weighment (Katla/Kanta): ₹1.80/kg
  // 3. Coolie & Handling: ₹0.75/kg
  // 4. In-transit rough tractor damage: 7.5%
  const grossMandiPrice = mandiItem.modalPrice;
  const traderCommissionAmt = grossMandiPrice * 0.065;
  const weighmentFee = 1.8;
  const handlingFee = 0.75;
  const transitLossValue = grossMandiPrice * 0.075;
  const netMandiFarmerRate = Number(
    Math.max(1, grossMandiPrice - traderCommissionAmt - weighmentFee - handlingFee - transitLossValue).toFixed(2)
  );

  const selectedMandiQuote: MandiMarketQuote = {
    id: mandiItem.id,
    mandiName: mandiItem.name,
    state: mandiItem.state,
    district: mandiItem.district,
    crop: comm.crop,
    variety: comm.variety,
    modalPricePerKg: grossMandiPrice,
    minPricePerKg: Number((grossMandiPrice * 0.88).toFixed(1)),
    maxPricePerKg: Number((grossMandiPrice * 1.14).toFixed(1)),
    arrivalVolumeQuintals: mandiItem.arrivalQuintals,
    dailyChangePercent: mandiItem.dailyChange,
    trendDirection: mandiItem.dailyChange > 0 ? 'up' : mandiItem.dailyChange < 0 ? 'down' : 'stable',
    traderCommissionPercent: 6.5,
    weighmentFeePerKg: weighmentFee,
    loadingFeePerKg: handlingFee,
    transportBruisingLossPercent: 7.5,
    netRealizedFarmerRate: netMandiFarmerRate,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isAPMCVerified: true,
  };

  // FreshRoute Farm Gate Contract Price:
  // Base rate + Grade-A Quality Bonus (+₹2.50) + Pre-Cooling (+₹1.00) with ZERO Middleman Cut
  const qualityBonus = qualityGrade === 'A' || qualityScore >= 80 ? 2.5 : qualityScore >= 65 ? 1.0 : 0;
  const preCoolingBonus = 1.0;
  const baseFreshRoute = comm.freshRouteRate;
  const netFreshRouteRate = Number((baseFreshRoute + qualityBonus + preCoolingBonus).toFixed(2));
  const priceAdvantage = Number((netFreshRouteRate - netMandiFarmerRate).toFixed(2));
  const percentageAdvantage = Number(((priceAdvantage / netMandiFarmerRate) * 100).toFixed(1));

  const freshRouteQuote: FreshRoutePriceQuote = {
    crop: comm.crop,
    variety: comm.variety,
    baseFarmGatePricePerKg: baseFreshRoute,
    gradeBonusPerKg: qualityBonus,
    preCoolingIncentivePerKg: preCoolingBonus,
    middlemanCommissionPercent: 0,
    handlingChargesPerKg: 0,
    netRealizedFarmerRate: netFreshRouteRate,
    escrowSettlementHours: 2,
    activeBuyerDemandCount: 4,
    topBuyerName: 'FreshMart Central DC & Quick-Commerce Hub',
    priceAdvantageVsMandi: priceAdvantage,
    percentageAdvantageVsMandi: percentageAdvantage,
    lastUpdated: 'Live Active Bidding',
  };

  // City Retail Benchmarks
  const cityRates: CityRetailRateQuote[] = comm.cityBenchmarks.map((cb) => {
    const retail = Number((comm.cityRetailBase * cb.retailMultiplier).toFixed(1));
    const quickCommerce = Number((comm.cityRetailBase * cb.quickCommerceMultiplier).toFixed(1));
    const supermarket = Number((comm.cityRetailBase * cb.supermarketMultiplier).toFixed(1));
    const dcIntake = Number((comm.cityRetailBase * cb.dcIntakeMultiplier).toFixed(1));
    const netDelivered = Number((dcIntake - cb.freightPerKg).toFixed(1));

    return {
      city: cb.city,
      state: cb.state,
      distanceFromFarmKm: cb.distanceKm,
      averageRetailRatePerKg: retail,
      quickCommerceRatePerKg: quickCommerce,
      supermarketRatePerKg: supermarket,
      cityDcIntakeRatePerKg: dcIntake,
      estimatedFreightPerKg: cb.freightPerKg,
      netDeliveredRatePerKg: netDelivered,
      consumerPriceSpread: Number((retail - netMandiFarmerRate).toFixed(1)),
      topBuyerCluster: cb.topBuyerCluster,
    };
  });

  // Lot calculations
  const mandiEarnings = Math.round(weightKg * netMandiFarmerRate);
  const freshRouteEarnings = Math.round(weightKg * netFreshRouteRate);
  const netExtraTakeHome = freshRouteEarnings - mandiEarnings;
  const middlemanCut = Math.round(weightKg * (grossMandiPrice * 0.065 + weighmentFee + handlingFee + transitLossValue));

  const avgCityRetail = cityRates.find((c) => c.city === targetCity)?.averageRetailRatePerKg || cityRates[0].averageRetailRatePerKg;
  const farmerShareAtMandi = Math.round((netMandiFarmerRate / avgCityRetail) * 100);
  const farmerShareAtFreshRoute = Math.round((netFreshRouteRate / avgCityRetail) * 100);

  const aiPriceArbitrageInsight = `💡 Market Intelligence: In ${selectedMandiQuote.mandiName}, local buyers are quoting ₹${grossMandiPrice}/kg, but after 6.5% trader commission, weighment cut (₹1.80), and transit bruising, your net take-home is only ₹${netMandiFarmerRate}/kg. Meanwhile, in Mumbai/Bengaluru retail consumers pay ₹${avgCityRetail}/kg. FreshRoute bypasses 3 layers of middlemen, putting ₹${netFreshRouteRate}/kg directly in your UPI escrow — earning you ₹${netExtraTakeHome.toLocaleString('en-IN')} extra on this ${weightKg}kg harvest (+${percentageAdvantage}% boost).`;

  return {
    crop: comm.crop,
    variety: comm.variety,
    harvestLotWeightKg: weightKg,
    qualityScore,
    qualityGrade,
    selectedMandi: selectedMandiQuote,
    freshRoutePrice: freshRouteQuote,
    cityRates,
    mandiEarningsForLot: mandiEarnings,
    freshRouteEarningsForLot: freshRouteEarnings,
    netExtraTakeHomeForLot: netExtraTakeHome,
    middlemanCutExtractedForLot: middlemanCut,
    farmerShareOfConsumerRupeeAtMandi: farmerShareAtMandi,
    farmerShareOfConsumerRupeeAtFreshRoute: farmerShareAtFreshRoute,
    aiPriceArbitrageInsight,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Audio text generation in Kannada, Hindi, English
 */
export function getMandiVoiceReport(comparison: RealTimePriceComparison, lang: string = 'en'): string {
  const { crop, harvestLotWeightKg, selectedMandi, freshRoutePrice, netExtraTakeHomeForLot, freshRouteEarningsForLot, mandiEarningsForLot } = comparison;

  if (lang === 'kn') {
    return `ಲೈವ್ ಮಾರುಕಟ್ಟೆ ದರ ವಿಶ್ಲೇಷಣೆ: ${selectedMandi.mandiName} ಮಂಡಿಯಲ್ಲಿ ${crop} ದರ ₹${selectedMandi.modalPricePerKg} ಇದೆ, ಆದರೆ ದಲ್ಲಾಳಿ ಕಮಿಷನ್ ಮತ್ತು ತೂಕದ ಕಡಿತದ ನಂತರ ನಿಮಗೆ ಕೇವಲ ₹${selectedMandi.netRealizedFarmerRate}/ಕೆಜಿ ಸಿಗುತ್ತದೆ (ಒಟ್ಟು ₹${mandiEarningsForLot.toLocaleString('en-IN')}). ಫ್ರೆಶ್‌ರೂಟ್‌ನಲ್ಲಿ ನೇರ ಬೆಲೆ ₹${freshRoutePrice.netRealizedFarmerRate}/ಕೆಜಿ (ಒಟ್ಟು ₹${freshRouteEarningsForLot.toLocaleString('en-IN')}). ನಿಮಗೆ ₹${netExtraTakeHomeForLot.toLocaleString('en-IN')} ಹೆಚ್ಚಿನ ಲಾಭ ಸಿಗಲಿದೆ.`;
  } else if (lang === 'hi') {
    return `लाइव मंडी भाव विश्लेषण: ${selectedMandi.mandiName} में ${crop} का भाव ₹${selectedMandi.modalPricePerKg} है, लेकिन आढ़त और कटाई के बाद किसान को मात्र ₹${selectedMandi.netRealizedFarmerRate}/किलो मिलता है। FreshRoute पर सीधा भाव ₹${freshRoutePrice.netRealizedFarmerRate}/किलो है। इस ${harvestLotWeightKg} किलो लॉट पर आपको ₹${netExtraTakeHomeForLot.toLocaleString('en-IN')} का अतिरिक्त शुद्ध मुनाफा होगा।`;
  }

  return `Real-time Market Report: At ${selectedMandi.mandiName}, the modal rate for ${crop} is ₹${selectedMandi.modalPricePerKg}/kg, but net realization after middleman cuts is only ₹${selectedMandi.netRealizedFarmerRate}/kg. FreshRoute direct farm gate price is ₹${freshRoutePrice.netRealizedFarmerRate}/kg. On your ${harvestLotWeightKg}kg harvest, you take home ₹${netExtraTakeHomeForLot.toLocaleString('en-IN')} extra cash.`;
}
