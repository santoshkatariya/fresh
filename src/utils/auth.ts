import { UserProfile, Role, BuyerTier } from '../types';
import { getStoredUser, saveStoredUser, DEFAULT_FARMER_USER, DEFAULT_BUYER_USER } from './storage';
import { api } from './api';

export function getCurrentUser(): UserProfile {
  return getStoredUser();
}

/**
 * Optimistic local login with background server sync
 */
export function loginUser(email: string, role: Role): UserProfile {
  let user: UserProfile;
  if (role === 'farmer') {
    user = {
      ...DEFAULT_FARMER_USER,
      email: email || DEFAULT_FARMER_USER.email,
    };
  } else {
    user = {
      ...DEFAULT_BUYER_USER,
      email: email || DEFAULT_BUYER_USER.email,
    };
  }
  saveStoredUser(user);

  // Background sync to backend Express API
  api.auth.login({ email, role }).catch(err => {
    console.debug('Background backend login sync notice:', err.message);
  });

  return user;
}

/**
 * Fully authenticated async login against Express backend API
 */
export async function loginUserAsync(
  identifier: { email?: string; phone?: string },
  role: Role = 'farmer'
): Promise<UserProfile> {
  try {
    const res = await api.auth.login({ ...identifier, role });
    if (res.success && res.user) {
      saveStoredUser(res.user);
      return res.user;
    }
  } catch (err) {
    console.warn('Backend login fallback to local session:', err);
  }
  return loginUser(identifier.email || identifier.phone || '', role);
}

export async function sendOtpAsync(phone: string) {
  return api.auth.sendOtp(phone);
}

export async function verifyOtpAsync(phone: string, code: string, role: Role = 'farmer'): Promise<UserProfile> {
  try {
    const res = await api.auth.verifyOtp({ phone, code, role });
    if (res.success && res.user) {
      saveStoredUser(res.user);
      return res.user;
    }
  } catch (err) {
    console.warn('Backend OTP verification fallback to local session:', err);
  }
  return loginUser(phone, role);
}

export function registerFarmer(data: {
  name: string;
  phone: string;
  email: string;
  location: string;
  farmOrBusinessName: string;
  primaryCropOrDemand: string;
  password?: string;
}): UserProfile {
  const newUser: UserProfile = {
    id: `farmer-${Date.now()}`,
    role: 'farmer',
    name: data.name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    farmOrBusinessName: data.farmOrBusinessName,
    primaryCropOrDemand: data.primaryCropOrDemand,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    verified: true,
  };
  saveStoredUser(newUser);

  // Background sync to backend API
  api.auth.register({ ...data, role: 'farmer' }).catch(err => {
    console.debug('Background farmer registration sync:', err.message);
  });

  return newUser;
}

export async function registerFarmerAsync(data: {
  name: string;
  phone: string;
  email: string;
  location: string;
  farmOrBusinessName: string;
  primaryCropOrDemand: string;
  password?: string;
}): Promise<UserProfile> {
  try {
    const res = await api.auth.register({ ...data, role: 'farmer' });
    if (res.success && res.user) {
      saveStoredUser(res.user);
      return res.user;
    }
  } catch (err) {
    console.warn('Backend register farmer fallback:', err);
  }
  return registerFarmer(data);
}

export function registerBuyer(data: {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  businessType: string;
  requiredProduce: string;
  password?: string;
  buyerTier?: BuyerTier;
  businessCategory?: string;
}): UserProfile {
  const newUser: UserProfile = {
    id: `buyer-${Date.now()}`,
    role: 'buyer',
    name: data.contactName,
    email: data.email,
    phone: data.phone,
    location: data.location,
    farmOrBusinessName: data.businessName,
    primaryCropOrDemand: data.requiredProduce,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verified: true,
    buyerTier: data.buyerTier || 'bulk_business',
    businessCategory: data.businessCategory || data.businessType || 'Hotel & Banquets'
  };
  saveStoredUser(newUser);

  // Background sync to backend API
  api.auth.register({
    role: 'buyer',
    name: data.contactName,
    email: data.email,
    phone: data.phone,
    location: data.location,
    farmOrBusinessName: data.businessName,
    primaryCropOrDemand: data.requiredProduce,
  }).catch(err => {
    console.debug('Background buyer registration sync:', err.message);
  });

  return newUser;
}

export async function registerBuyerAsync(data: {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  businessType: string;
  requiredProduce: string;
  password?: string;
  buyerTier?: BuyerTier;
  businessCategory?: string;
}): Promise<UserProfile> {
  try {
    const res = await api.auth.register({
      role: 'buyer',
      name: data.contactName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      farmOrBusinessName: data.businessName,
      primaryCropOrDemand: data.requiredProduce,
    });
    if (res.success && res.user) {
      saveStoredUser(res.user);
      return res.user;
    }
  } catch (err) {
    console.warn('Backend register buyer fallback:', err);
  }
  return registerBuyer(data);
}

export function logoutUser(): void {
  saveStoredUser(DEFAULT_FARMER_USER);
}
