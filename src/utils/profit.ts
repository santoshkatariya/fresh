import { ProduceBatch, Vehicle, VehicleOption, DecisionOption, BuyerMatch } from '../types';
import { DEMO_VEHICLES, calculateTrips, calculateTransportCost, calculateTransitHours } from './transport';
import { calculateSpoilageRate, calculateRecoverableQuantity } from './spoilage';

export function calculateExpectedNetProfit(
  revenue: number,
  transportCost: number,
  otherCosts: number = 0
): number {
  return Math.round(revenue - transportCost - otherCosts);
}

export function calculateVehicleComparison(
  quantityKg: number,
  distanceKm: number,
  pricePerKg: number,
  initialQuality: number = 82,
  vehicles: Vehicle[] = DEMO_VEHICLES
): VehicleOption[] {
  const options: VehicleOption[] = vehicles.map(vehicle => {
    const tripsNeeded = calculateTrips(quantityKg, vehicle.capacityKg);
    const transportCost = calculateTransportCost(distanceKm, vehicle.costPerKm, tripsNeeded);
    const transitHours = calculateTransitHours(distanceKm, vehicle.transitSpeedKmh);

    // Transit spoilage calculation
    // Cooling reduces transit spoilage by 70%
    const baseTransitSpoilage = calculateSpoilageRate(transitHours, initialQuality, 'Tomatoes', vehicle.coolingAvailable ? 'cold_storage' : 'ambient');
    const transitSpoilagePercent = vehicle.coolingAvailable 
      ? Number((baseTransitSpoilage * 0.4).toFixed(1))
      : baseTransitSpoilage;

    const recoverableKg = calculateRecoverableQuantity(quantityKg, transitSpoilagePercent);
    const expectedRevenue = Math.round(recoverableKg * pricePerKg);
    const netProfit = calculateExpectedNetProfit(expectedRevenue, transportCost);
    const co2Kg = Number(((distanceKm * tripsNeeded * vehicle.emissionsFactorGPerKm) / 1000).toFixed(1));

    return {
      vehicle,
      tripsNeeded,
      totalDistanceKm: distanceKm * tripsNeeded,
      transportCost,
      transitHours,
      spoilagePercentDuringTransit: transitSpoilagePercent,
      recoverableQuantityKg: recoverableKg,
      expectedRevenue,
      netProfit,
      co2Kg,
      isBestProfit: false // will assign next
    };
  });

  // Find the highest net profit option
  let maxProfit = -Infinity;
  let bestIdx = 0;
  options.forEach((opt, idx) => {
    if (opt.netProfit > maxProfit) {
      maxProfit = opt.netProfit;
      bestIdx = idx;
    }
  });

  if (options[bestIdx]) {
    options[bestIdx].isBestProfit = true;
    options[bestIdx].whyRecommended = `Maximizes farmer net take-home by balancing low trip cost with high capacity utilization (₹${options[bestIdx].netProfit.toLocaleString('en-IN')}).`;
  }

  return options;
}

export function generateDecisionComparison(
  batch: ProduceBatch,
  buyers: BuyerMatch[] = [],
  defaultDistanceKm: number = 34
): DecisionOption[] {
  const baseQty = batch.quantityKg;
  const basePrice = batch.basePricePerKg;
  const bestBuyer = buyers[0];
  const buyerPrice = bestBuyer ? bestBuyer.offeredPricePerKg : basePrice;

  // 1. SELL NOW (Local / Best Buyer)
  const sellNowTransport = Math.round(defaultDistanceKm * 14); // Mini pickup
  const sellNowSpoilage = calculateSpoilageRate(1.5, batch.currentQualityScore, batch.crop);
  const sellNowRecoverable = calculateRecoverableQuantity(baseQty, sellNowSpoilage);
  const sellNowRevenue = Math.round(sellNowRecoverable * buyerPrice);
  const sellNowNetProfit = sellNowRevenue - sellNowTransport;

  // 2. WAIT 12 HOURS (Hoping for better mandi prices)
  const wait12Transport = sellNowTransport;
  const wait12Spoilage = calculateSpoilageRate(13.5, batch.currentQualityScore, batch.crop);
  const wait12Recoverable = calculateRecoverableQuantity(baseQty, wait12Spoilage);
  const wait12Price = Math.round(buyerPrice * 0.94); // Degradation penalty
  const wait12Revenue = Math.round(wait12Recoverable * wait12Price);
  const wait12NetProfit = wait12Revenue - wait12Transport;

  // 3. REROUTE TO WHOLESALE CITY MANDI (Further distance e.g. 95km, but slightly higher volume price)
  const rerouteDistance = 95;
  const rerouteTransport = Math.round(rerouteDistance * 20); // Small truck
  const rerouteSpoilage = calculateSpoilageRate(4, batch.currentQualityScore, batch.crop);
  const rerouteRecoverable = calculateRecoverableQuantity(baseQty, rerouteSpoilage);
  const reroutePrice = Math.round(buyerPrice * 1.12); // Higher price in metro
  const rerouteRevenue = Math.round(rerouteRecoverable * reroutePrice);
  const rerouteNetProfit = rerouteRevenue - rerouteTransport;

  // 4. FOOD PROCESSING / PULPING UNIT (Accepts lower cosmetic grade e.g. ketchup / puree)
  const processDistance = 22;
  const processTransport = Math.round(processDistance * 14);
  const processPrice = Math.round(buyerPrice * 0.80);
  const processRecoverable = baseQty * 0.96; // Less loss because aesthetic damage accepted
  const processRevenue = Math.round(processRecoverable * processPrice);
  const processNetProfit = processRevenue - processTransport;

  // 5. COLD STORAGE HOLDING (Pay ₹1.8/kg for 14 days holding)
  const coldStorageCost = Math.round(baseQty * 1.8) + 450;
  const coldStorageFuturePrice = Math.round(buyerPrice * 1.05);
  const coldStorageRecoverable = baseQty * 0.94;
  const coldStorageRevenue = Math.round(coldStorageRecoverable * coldStorageFuturePrice);
  const coldStorageNetProfit = coldStorageRevenue - coldStorageCost;

  // 6. DONATE TO CHARITY / FOOD BANK (Tax rebate / CSR credit ₹4/kg)
  const donateTransport = 350;
  const donateRevenue = Math.round(baseQty * 4.5);
  const donateNetProfit = donateRevenue - donateTransport;

  const decisions: DecisionOption[] = [
    {
      action: 'SELL_NOW',
      title: 'Sell Immediately to Direct Buyer',
      subtitle: `Target: ${bestBuyer ? bestBuyer.companyName : 'FreshMart Quick Commerce'} (${defaultDistanceKm} km)`,
      expectedGrossRevenue: sellNowRevenue,
      totalCosts: sellNowTransport,
      expectedNetProfit: sellNowNetProfit,
      riskLevel: 'Low',
      shelfLifeRemainingHours: batch.estimatedShelfLifeHours,
      qualityAtDestination: Math.round(batch.currentQualityScore - 2),
      keyAdvantage: 'Zero holding risk, fastest cash realization (T+0 payment)',
      explanation: `Produce is currently at peak freshness (${batch.freshnessPercent}%). Immediate dispatch locks in ₹${buyerPrice}/kg before decay sets in.`,
      isBest: false,
      recommendedVehicle: 'Mini Pickup (Tata Ace)',
      recommendedBuyer: bestBuyer ? bestBuyer.companyName : 'FreshMart'
    },
    {
      action: 'REROUTE_WHOLESALE',
      title: 'Reroute to Metro Wholesale Hub',
      subtitle: 'Target: Vashi APMC Terminal (95 km haul)',
      expectedGrossRevenue: rerouteRevenue,
      totalCosts: rerouteTransport,
      expectedNetProfit: rerouteNetProfit,
      riskLevel: 'Medium',
      shelfLifeRemainingHours: batch.estimatedShelfLifeHours - 6,
      qualityAtDestination: Math.round(batch.currentQualityScore - 6),
      keyAdvantage: '12% premium per kg in urban consumption center',
      explanation: `Metropolitan demand offers higher realized unit pricing, though longer transit distance increases fuel cost by ₹${rerouteTransport - sellNowTransport}.`,
      isBest: false
    },
    {
      action: 'WAIT_12H',
      title: 'Hold for Tomorrow Morning Mandi',
      subtitle: 'Wait 12 Hours on farm',
      expectedGrossRevenue: wait12Revenue,
      totalCosts: wait12Transport,
      expectedNetProfit: wait12NetProfit,
      riskLevel: 'High',
      shelfLifeRemainingHours: Math.max(4, batch.estimatedShelfLifeHours - 12),
      qualityAtDestination: Math.round(batch.currentQualityScore - 14),
      keyAdvantage: 'May catch early-morning trading volatility',
      explanation: `Warning: Waiting 12 hours causes produce softening, resulting in a loss of ~₹${(sellNowNetProfit - wait12NetProfit).toLocaleString('en-IN')} in net value.`,
      isBest: false
    },
    {
      action: 'FOOD_PROCESSING',
      title: 'Supply to Food Pulping / Puree Plant',
      subtitle: 'Target: Kisan Agro Processing Cluster (22 km)',
      expectedGrossRevenue: processRevenue,
      totalCosts: processTransport,
      expectedNetProfit: processNetProfit,
      riskLevel: 'Low',
      shelfLifeRemainingHours: 48,
      qualityAtDestination: Math.round(batch.currentQualityScore - 1),
      keyAdvantage: 'Accepts cosmetic skin blemishes without heavy penalty',
      explanation: 'Bulk off-take with guaranteed factory gate reception; avoids retail sorting rejections.',
      isBest: false
    },
    {
      action: 'COLD_STORAGE',
      title: 'Store in Solar Cold Chamber',
      subtitle: 'Hold for 7–14 days till market supply dips',
      expectedGrossRevenue: coldStorageRevenue,
      totalCosts: coldStorageCost,
      expectedNetProfit: coldStorageNetProfit,
      riskLevel: 'Medium',
      shelfLifeRemainingHours: 240,
      qualityAtDestination: Math.round(batch.currentQualityScore - 5),
      keyAdvantage: 'Arbitrage seasonal market price spikes',
      explanation: 'Requires upfront rental deposit and daily monitoring; best suited if local market is currently flooded.',
      isBest: false
    },
    {
      action: 'DONATE_CHARITY',
      title: 'Institutional Relief / Midday Meals',
      subtitle: 'Local Akshaya Patra / Community Kitchen (8 km)',
      expectedGrossRevenue: donateRevenue,
      totalCosts: donateTransport,
      expectedNetProfit: donateNetProfit,
      riskLevel: 'Low',
      shelfLifeRemainingHours: batch.estimatedShelfLifeHours,
      qualityAtDestination: batch.currentQualityScore,
      keyAdvantage: '100% waste diversion with social impact & state subsidy',
      explanation: 'Prevents environmental rotting while qualifying for local agricultural CSR incentive credits.',
      isBest: false
    }
  ];

  // Identify best option
  let highest = -Infinity;
  let bestOptIndex = 0;
  decisions.forEach((dec, idx) => {
    if (dec.expectedNetProfit > highest) {
      highest = dec.expectedNetProfit;
      bestOptIndex = idx;
    }
  });

  decisions[bestOptIndex].isBest = true;
  return decisions;
}

export const evaluateAllDecisions = (
  batch: ProduceBatch,
  distanceKm: number = 34,
  buyers: BuyerMatch[] = []
): DecisionOption[] => {
  return generateDecisionComparison(batch, buyers, distanceKm);
};

