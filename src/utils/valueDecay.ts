import { ProduceBatch, ValueTimePoint } from '../types';
import { calculateQualityScoreAtHours, calculateRemainingShelfLifeHours, calculateSpoilageRate, calculateRecoverableQuantity } from './spoilage';

export function calculateValueAtTime(
  batch: ProduceBatch,
  hoursElapsed: number,
  distanceKm: number = 34,
  transportCostRate: number = 14
): ValueTimePoint {
  const quality = calculateQualityScoreAtHours(batch.currentQualityScore, hoursElapsed, batch.crop);
  const remainingShelf = Math.max(2, calculateRemainingShelfLifeHours(quality, batch.crop));
  const spoilageRate = calculateSpoilageRate(hoursElapsed, batch.currentQualityScore, batch.crop, batch.storageType);
  const recoverableKg = calculateRecoverableQuantity(batch.quantityKg, spoilageRate);

  // Price markdown based on quality degradation
  // If quality drops from 82 to 65, price drops proportionally
  const qualityMultiplier = Math.max(0.4, quality / 100);
  const pricePerKg = Number((batch.basePricePerKg * qualityMultiplier).toFixed(2));
  
  const expectedRevenue = Math.round(recoverableKg * pricePerKg);
  const transportCost = Math.round(distanceKm * transportCostRate);
  const netProfit = Math.max(0, expectedRevenue - transportCost);

  // Status risk categorization
  let statusRisk: ValueTimePoint['statusRisk'] = 'Prime';
  if (spoilageRate > 25 || quality < 55) {
    statusRisk = 'Critical';
  } else if (spoilageRate > 12 || quality < 70) {
    statusRisk = 'Moderate';
  } else if (spoilageRate > 5 || quality < 80) {
    statusRisk = 'Good';
  }

  return {
    hoursElapsed,
    label: hoursElapsed === 0 ? 'NOW' : `${hoursElapsed}H`,
    qualityScore: quality,
    shelfLifeHoursRemaining: remainingShelf,
    spoilageRatePercent: spoilageRate,
    recoverableKg,
    marketPricePerKg: pricePerKg,
    expectedRevenue,
    transportCost,
    netProfit,
    valueLostVsNow: 0, // Calculated in generate timeline
    statusRisk
  };
}

export function generateValueTimeline(
  batch: ProduceBatch,
  maxHours: number = 36,
  distanceKm: number = 34,
  transportCostRate: number = 14
): ValueTimePoint[] {
  const intervals = [0, 6, 12, 18, 24, 30, 36];
  const filteredIntervals = intervals.filter(h => h <= maxHours);

  const initialPoint = calculateValueAtTime(batch, 0, distanceKm, transportCostRate);
  const initialNet = initialPoint.netProfit;

  return filteredIntervals.map(h => {
    const point = calculateValueAtTime(batch, h, distanceKm, transportCostRate);
    point.valueLostVsNow = Math.max(0, initialNet - point.netProfit);
    return point;
  });
}
