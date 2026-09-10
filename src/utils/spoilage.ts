import { CropType } from '../types';

interface CropPerishability {
  baseHourlyDecay: number; // percent per hour at 28-32C ambient
  tempSensitivityFactor: number;
  qualityFloor: number;
}

const CROP_PERISHABILITY: Record<CropType, CropPerishability> = {
  'Tomatoes': { baseHourlyDecay: 1.15, tempSensitivityFactor: 1.4, qualityFloor: 30 },
  'Grapes': { baseHourlyDecay: 1.35, tempSensitivityFactor: 1.6, qualityFloor: 25 },
  'Capsicum': { baseHourlyDecay: 0.95, tempSensitivityFactor: 1.3, qualityFloor: 35 },
  'Mangoes': { baseHourlyDecay: 0.85, tempSensitivityFactor: 1.2, qualityFloor: 40 },
  'Green Chillies': { baseHourlyDecay: 0.75, tempSensitivityFactor: 1.1, qualityFloor: 45 },
  'Pomegranates': { baseHourlyDecay: 0.45, tempSensitivityFactor: 0.8, qualityFloor: 50 },
  'Onions': { baseHourlyDecay: 0.20, tempSensitivityFactor: 0.5, qualityFloor: 60 },
  'Potatoes': { baseHourlyDecay: 0.15, tempSensitivityFactor: 0.4, qualityFloor: 65 }
};

export function calculateSpoilageRate(
  hoursElapsed: number,
  baseQualityScore: number = 85,
  crop: CropType = 'Tomatoes',
  storageType: 'ambient' | 'ventilated' | 'cold_storage' = 'ambient'
): number {
  const config = CROP_PERISHABILITY[crop] || CROP_PERISHABILITY['Tomatoes'];
  
  let storageMultiplier = 1.0;
  if (storageType === 'ventilated') storageMultiplier = 0.7;
  if (storageType === 'cold_storage') storageMultiplier = 0.25;

  // Non-linear decay: decay accelerates as time passes and produce softens
  const timeFactor = Math.pow(hoursElapsed / 10, 1.35);
  const qualityDegradation = config.baseHourlyDecay * timeFactor * storageMultiplier;
  
  // Base initial defects (100 - baseQuality) contribute to initial spoilage
  const initialDefect = Math.max(0, (100 - baseQualityScore) * 0.15);
  const totalSpoilage = initialDefect + qualityDegradation;

  return Math.min(85, Math.max(1, Number(totalSpoilage.toFixed(1))));
}

export function calculateRecoverableQuantity(quantityKg: number, spoilageRatePercent: number): number {
  const goodRatio = Math.max(0, (100 - spoilageRatePercent) / 100);
  return Math.round(quantityKg * goodRatio);
}

export function calculateQualityScoreAtHours(
  initialQuality: number,
  hoursElapsed: number,
  crop: CropType = 'Tomatoes'
): number {
  const config = CROP_PERISHABILITY[crop] || CROP_PERISHABILITY['Tomatoes'];
  const drop = hoursElapsed * (config.baseHourlyDecay * 0.9);
  return Math.max(config.qualityFloor, Math.round(initialQuality - drop));
}

export function calculateRemainingShelfLifeHours(
  currentQuality: number,
  crop: CropType = 'Tomatoes'
): number {
  const config = CROP_PERISHABILITY[crop] || CROP_PERISHABILITY['Tomatoes'];
  const qualityDiff = Math.max(0, currentQuality - config.qualityFloor);
  return Math.round(qualityDiff / (config.baseHourlyDecay * 0.85));
}
