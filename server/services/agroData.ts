export interface MandiRecord {
  id: string;
  name: string;
  state: string;
  district: string;
  modalPrice: number;
  arrivalQuintals: number;
  dailyChange: number;
}

export interface CityBenchmark {
  city: string;
  state: string;
  distanceKm: number;
  retailMultiplier: number;
  quickCommerceMultiplier: number;
  supermarketMultiplier: number;
  dcIntakeMultiplier: number;
  freightPerKg: number;
  topBuyerCluster: string;
}

export interface CommodityRecord {
  crop: string;
  variety: string;
  baseMandiRate: number;
  freshRouteRate: number;
  cityRetailBase: number;
  mandis: MandiRecord[];
  cityBenchmarks: CityBenchmark[];
}

export const COMMODITY_REGISTRY: CommodityRecord[] = [
  {
    crop: 'Tomatoes',
    variety: 'Abhinav Hybrid (Table Grade)',
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
    variety: 'Nashik Garwa Red',
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
    variety: 'Thompson Seedless',
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
    crop: 'Potatoes',
    variety: 'Kufri Jyoti / Chipsona',
    baseMandiRate: 15.0,
    freshRouteRate: 22.0,
    cityRetailBase: 36.0,
    mandis: [
      { id: 'mandi-vashi-potato', name: 'Vashi APMC, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 16.0, arrivalQuintals: 11000, dailyChange: 1.0 },
      { id: 'mandi-agra-potato', name: 'Agra Potato Mandi, UP', state: 'Uttar Pradesh', district: 'Agra', modalPrice: 13.5, arrivalQuintals: 28000, dailyChange: -0.5 },
      { id: 'mandi-yeshwanthpur-pot', name: 'Yeshwanthpur Potato Yard, Bengaluru', state: 'Karnataka', district: 'Bengaluru', modalPrice: 17.5, arrivalQuintals: 7200, dailyChange: 0.8 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.05, supermarketMultiplier: 1.10, dcIntakeMultiplier: 0.62, freightPerKg: 1.5, topBuyerCluster: 'Processing & Institutional Procurement' },
    ],
  },
  {
    crop: 'Capsicum',
    variety: 'Indra Green Bell',
    baseMandiRate: 32.0,
    freshRouteRate: 46.0,
    cityRetailBase: 75.0,
    mandis: [
      { id: 'mandi-pune-capsicum', name: 'Gultekdi Yard, Pune', state: 'Maharashtra', district: 'Pune', modalPrice: 34.0, arrivalQuintals: 1400, dailyChange: 2.2 },
      { id: 'mandi-kolar-capsicum', name: 'Kolar Capsicum Yard, Karnataka', state: 'Karnataka', district: 'Kolar', modalPrice: 33.0, arrivalQuintals: 2100, dailyChange: 1.5 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.10, supermarketMultiplier: 1.20, dcIntakeMultiplier: 0.65, freightPerKg: 2.8, topBuyerCluster: 'HORECA & Supermarkets' },
    ],
  },
  {
    crop: 'Bananas',
    variety: 'Grand Naine (G9)',
    baseMandiRate: 14.0,
    freshRouteRate: 24.0,
    cityRetailBase: 48.0,
    mandis: [
      { id: 'mandi-jalgaon-banana', name: 'Jalgaon Banana Mandi', state: 'Maharashtra', district: 'Jalgaon', modalPrice: 14.5, arrivalQuintals: 18000, dailyChange: 1.2 },
      { id: 'mandi-vashi-banana', name: 'Vashi Banana Dock, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 17.0, arrivalQuintals: 9500, dailyChange: 0.5 },
    ],
    cityBenchmarks: [
      { city: 'Mumbai', state: 'Maharashtra', distanceKm: 340, retailMultiplier: 1.0, quickCommerceMultiplier: 1.08, supermarketMultiplier: 1.15, dcIntakeMultiplier: 0.60, freightPerKg: 2.2, topBuyerCluster: 'Ripening Chambers & Modern Trade' },
    ],
  },
];

export function getCommodityMarketData(cropName: string): CommodityRecord {
  const safe = (cropName || '').toLowerCase().trim();
  if (!safe) return COMMODITY_REGISTRY[0];

  const match = COMMODITY_REGISTRY.find(
    (c) => c.crop.toLowerCase() === safe || safe.includes(c.crop.toLowerCase()) || c.crop.toLowerCase().includes(safe)
  );
  return match || COMMODITY_REGISTRY[0];
}
