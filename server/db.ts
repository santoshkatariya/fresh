import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  role: 'farmer' | 'buyer';
  name: string;
  email: string;
  phone: string;
  password?: string;
  location: string;
  farmOrBusinessName: string;
  primaryCropOrDemand: string;
  avatarUrl: string;
  verified: boolean;
  createdAt: string;
}

export interface Batch {
  id: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  crop: string;
  variety: string;
  quantityKg: number;
  harvestDate: string;
  harvestTime: string;
  basePricePerKg: number;
  currentQualityScore: number;
  freshnessPercent: number;
  ripenessPercent: number;
  damagePercent: number;
  estimatedShelfLifeHours: number;
  spoilageRiskPercent: number;
  detectedIssues: string[];
  imageUrl: string;
  status: 'available' | 'reserved' | 'in_transit' | 'sold';
  storageType: 'ambient' | 'ventilated' | 'cold_storage';
  createdAt: string;
}

export interface Buyer {
  id: string;
  name: string;
  companyName: string;
  businessType: string;
  location: string;
  distanceKm: number;
  demandedCrops: string[];
  offeredPricePerKg: number;
  minQualityScore: number;
  paymentTerms: string;
  reliabilityRating: number;
  aiMatchScore: number;
  verifiedBadge: boolean;
  avatarUrl: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface Order {
  id: string;
  batchId: string;
  crop: string;
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
  status: 'Requested' | 'Accepted' | 'Pickup Scheduled' | 'In Transit' | 'Delivered' | 'Completed';
  estimatedTransitTime: string;
  temperatureReadingC: number;
  humidityPercent: number;
  createdAt: string;
  pickupTime?: string;
  deliveryTime?: string;
  timeline: OrderTimeline[];
}

export interface Demand {
  id: string;
  buyerId: string;
  buyerName: string;
  companyName: string;
  crop: string;
  requiredQuantityKg: number;
  offeredPricePerKg: number;
  minQualityScore: number;
  deliveryLocation: string;
  neededByDate: string;
  status: 'open' | 'fulfilled';
  createdAt: string;
}

export interface ImpactStats {
  valueRecoveredINR: number;
  foodWastePreventedTons: number;
  decisionAccuracyPercent: number;
  transportCostSavingsPercent: number;
  co2EmissionsSavedKg: number;
  farmersEmpowered: number;
}

export interface DatabaseSchema {
  users: User[];
  batches: Batch[];
  buyers: Buyer[];
  orders: Order[];
  demands: Demand[];
  impact: ImpactStats;
  otps: Record<string, { code: string; expiresAt: number }>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'farmer-ramesh-01',
      role: 'farmer',
      name: 'Ramesh Patil',
      email: 'ramesh.patil@kisanmail.in',
      phone: '+91 98220 12345',
      password: 'password123',
      location: 'Niphad, Nashik, Maharashtra',
      farmOrBusinessName: 'Patil Organic Agri Farms & FPO',
      primaryCropOrDemand: 'Tomatoes & Grapes',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      verified: true,
      createdAt: '2026-01-15T08:00:00.000Z',
    },
    {
      id: 'buyer-freshmart-01',
      role: 'buyer',
      name: 'Anil Sharma',
      email: 'anil.sharma@freshmart.co.in',
      phone: '+91 98110 33411',
      password: 'password123',
      location: 'Bhandup Central DC, Mumbai',
      farmOrBusinessName: 'FreshMart Quick Commerce Pvt Ltd',
      primaryCropOrDemand: 'Tomatoes, Vegetables, Fruits',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      verified: true,
      createdAt: '2026-01-10T10:00:00.000Z',
    },
  ],
  batches: [
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date(Date.now() - 86400000).toISOString(),
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
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
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
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ],
  buyers: [
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
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
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
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
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
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  ],
  orders: [
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
        { status: 'Completed', timestamp: 'Pending', description: 'Instant UPI / NEFT payout release', completed: false },
      ],
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
        { status: 'Completed', timestamp: 'Aug 21, 09:10 AM', description: '₹79,780 credited to bank account', completed: true },
      ],
    },
  ],
  demands: [
    {
      id: 'DEMAND-101',
      buyerId: 'buyer-freshmart-01',
      buyerName: 'Anil Sharma',
      companyName: 'FreshMart Quick Commerce',
      crop: 'Tomatoes',
      requiredQuantityKg: 2500,
      offeredPricePerKg: 22.0,
      minQualityScore: 78,
      deliveryLocation: 'Bhandup DC, Mumbai',
      neededByDate: '2026-08-25',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DEMAND-102',
      buyerId: 'buyer-bigbasket-02',
      buyerName: 'Pooja Deshmukh',
      companyName: 'BigBasket Regional Hub',
      crop: 'Onions',
      requiredQuantityKg: 5000,
      offeredPricePerKg: 19.5,
      minQualityScore: 80,
      deliveryLocation: 'Kalyan Logistics Park, Thane',
      neededByDate: '2026-08-26',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
  ],
  impact: {
    valueRecoveredINR: 284350,
    foodWastePreventedTons: 4.2,
    decisionAccuracyPercent: 91,
    transportCostSavingsPercent: 18,
    co2EmissionsSavedKg: 890,
    farmersEmpowered: 142,
  },
  otps: {},
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
      // Write initial seed data
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
      return INITIAL_DATA;
    } catch (err) {
      console.error('Error loading JSON database:', err);
      return INITIAL_DATA;
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // Users
  getUsers() {
    return this.data.users;
  }

  findUser(predicate: (u: User) => boolean) {
    return this.data.users.find(predicate);
  }

  createUser(user: User) {
    const existingIndex = this.data.users.findIndex(u => u.id === user.id || u.email === user.email);
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = { ...this.data.users[existingIndex], ...user };
    } else {
      this.data.users.push(user);
    }
    this.persist();
    return user;
  }

  // OTPs
  saveOtp(phone: string, code: string, durationSeconds: number = 300) {
    this.data.otps[phone] = {
      code,
      expiresAt: Date.now() + durationSeconds * 1000,
    };
    this.persist();
  }

  verifyOtp(phone: string, code: string): boolean {
    const record = this.data.otps[phone];
    if (!record) return code === '123456'; // Default demo OTP acceptance
    if (Date.now() > record.expiresAt) return false;
    return record.code === code || code === '123456';
  }

  // Batches
  getBatches() {
    return this.data.batches;
  }

  getBatchById(id: string) {
    return this.data.batches.find(b => b.id === id);
  }

  createBatch(batch: Batch) {
    this.data.batches.unshift(batch);
    this.persist();
    return batch;
  }

  updateBatch(id: string, updates: Partial<Batch>) {
    const idx = this.data.batches.findIndex(b => b.id === id);
    if (idx >= 0) {
      this.data.batches[idx] = { ...this.data.batches[idx], ...updates };
      this.persist();
      return this.data.batches[idx];
    }
    return null;
  }

  deleteBatch(id: string) {
    const idx = this.data.batches.findIndex(b => b.id === id);
    if (idx >= 0) {
      const removed = this.data.batches.splice(idx, 1)[0];
      this.persist();
      return removed;
    }
    return null;
  }

  // Buyers
  getBuyers() {
    return this.data.buyers;
  }

  // Orders
  getOrders() {
    return this.data.orders;
  }

  getOrderById(id: string) {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(order: Order) {
    this.data.orders.unshift(order);
    // Mark batch as in_transit or reserved if applicable
    const batch = this.getBatchById(order.batchId);
    if (batch) {
      batch.status = 'in_transit';
    }
    // Increment impact metrics
    this.data.impact.valueRecoveredINR += Math.round(order.netFarmerEarnings);
    this.data.impact.foodWastePreventedTons = Number(
      (this.data.impact.foodWastePreventedTons + (order.quantityKg / 1000) * 0.9).toFixed(1)
    );
    this.persist();
    return order;
  }

  updateOrderStatus(id: string, status: Order['status'], note?: string) {
    const order = this.getOrderById(id);
    if (!order) return null;

    order.status = status;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Update timeline
    const existingStep = order.timeline.find(t => t.status === status);
    if (existingStep) {
      existingStep.completed = true;
      existingStep.timestamp = timeStr;
      if (note) existingStep.description = note;
    } else {
      order.timeline.push({
        status,
        timestamp: timeStr,
        description: note || `Order transitioned to ${status}`,
        completed: true,
      });
    }

    if (status === 'Delivered') {
      order.deliveryTime = timeStr;
    }

    this.persist();
    return order;
  }

  updateOrderTelemetry(id: string, temp: number, humidity: number) {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.temperatureReadingC = temp;
    order.humidityPercent = humidity;
    this.persist();
    return order;
  }

  // Demands
  getDemands() {
    return this.data.demands;
  }

  createDemand(demand: Demand) {
    this.data.demands.unshift(demand);
    this.persist();
    return demand;
  }

  // Impact
  getImpact() {
    return this.data.impact;
  }
}

export const db = new Database();
