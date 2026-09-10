import { Vehicle, VehicleOption } from '../types';

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'mini-pickup-01',
    name: 'Mini Pickup (e.g. Tata Ace)',
    type: 'mini_pickup',
    capacityKg: 1000,
    costPerKm: 14,
    coolingAvailable: false,
    transitSpeedKmh: 42,
    emissionsFactorGPerKm: 145,
    description: 'Best for local rural trips up to 50 km and batches under 1,000 kg. Quick loading and high agility.',
    image: 'https://images.unsplash.com/photo-1586191582056-a609d57a2750?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'small-truck-02',
    name: 'Small Truck (e.g. Ashok Leyland Dost)',
    type: 'small_truck',
    capacityKg: 2500,
    costPerKm: 20,
    coolingAvailable: false,
    transitSpeedKmh: 45,
    emissionsFactorGPerKm: 210,
    description: 'Optimal balance of payload and cost for 1,000–2,500 kg loads to regional wholesale mandis.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'medium-truck-03',
    name: 'Medium Reefer (e.g. Eicher 6-Wheeler)',
    type: 'medium_truck',
    capacityKg: 5000,
    costPerKm: 28,
    coolingAvailable: true,
    transitSpeedKmh: 48,
    emissionsFactorGPerKm: 280,
    description: 'Equipped with active chill ventilation; preserves quality on 50–200 km inter-district hauls.',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'large-truck-04',
    name: 'Heavy Truck (e.g. Tata 1616)',
    type: 'large_truck',
    capacityKg: 10000,
    costPerKm: 40,
    coolingAvailable: true,
    transitSpeedKmh: 50,
    emissionsFactorGPerKm: 420,
    description: 'High capacity bulk carrier. Heavy cost per km makes it uneconomical for small individual batches.',
    image: 'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=600&q=80'
  }
];

export function calculateTrips(quantityKg: number, capacityKg: number): number {
  if (quantityKg <= 0 || capacityKg <= 0) return 1;
  return Math.ceil(quantityKg / capacityKg);
}

export function calculateTransportCost(
  distanceKm: number,
  costPerKm: number,
  trips: number = 1
): number {
  // Round trip / haul logic: cost = distance * costPerKm * trips
  return Math.round(distanceKm * costPerKm * trips);
}

export function calculateTransitHours(distanceKm: number, speedKmh: number = 45): number {
  return Number((distanceKm / Math.max(speedKmh, 20)).toFixed(1));
}

export function evaluateVehicleOptions(
  quantityKg: number,
  distanceKm: number,
  vehicles: Vehicle[] = DEMO_VEHICLES,
  pricePerKg: number = 21,
  initialQuality: number = 82
): VehicleOption[] {
  const options: VehicleOption[] = vehicles.map(vehicle => {
    const tripsNeeded = calculateTrips(quantityKg, vehicle.capacityKg);
    const transportCost = calculateTransportCost(distanceKm, vehicle.costPerKm, tripsNeeded);
    const transitHours = calculateTransitHours(distanceKm, vehicle.transitSpeedKmh);

    const transitSpoilagePercent = vehicle.coolingAvailable ? 1.2 : 4.5;
    const recoverableKg = Math.round(quantityKg * (1 - transitSpoilagePercent / 100));
    const expectedRevenue = Math.round(recoverableKg * pricePerKg);
    const netProfit = expectedRevenue - transportCost;
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
      isBestProfit: false
    };
  });

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
    options[bestIdx].whyRecommended = `Optimal balance of capacity and transport cost (₹${options[bestIdx].netProfit.toLocaleString('en-IN')}).`;
  }

  return options;
}

