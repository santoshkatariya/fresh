// FreshRoute.2 Client-Side API Library
// Communicates with backend Express REST API at /api/*

import { ProduceBatch, BuyerMatch, Order, UserProfile, ImpactStats } from '../types';

export interface HealthResponse {
  status: string;
  service: string;
  port: number;
  hasGeminiApiKey: boolean;
  database: {
    type: string;
    path: string;
    counts: {
      batches: number;
      orders: number;
      users: number;
      buyers: number;
    };
  };
  timestamp: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  token?: string;
  error?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[FreshRoute API] Request failed for ${url}:`, err.message || err);
    throw err;
  }
}

export const api = {
  // System Health
  async getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/api/health');
  },

  // Authentication
  auth: {
    async login(params: { email?: string; phone?: string; role?: 'farmer' | 'buyer' }): Promise<AuthResponse> {
      return request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    async sendOtp(phone: string): Promise<{ success: boolean; message: string; demoCode?: string }> {
      return request<{ success: boolean; message: string; demoCode?: string }>('/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },

    async verifyOtp(params: { phone: string; code: string; role?: 'farmer' | 'buyer' }): Promise<AuthResponse> {
      return request<AuthResponse>('/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    async register(data: {
      role: 'farmer' | 'buyer';
      name: string;
      email: string;
      phone: string;
      password?: string;
      location?: string;
      farmOrBusinessName?: string;
      primaryCropOrDemand?: string;
    }): Promise<AuthResponse> {
      return request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async me(): Promise<{ success: boolean; user: UserProfile }> {
      return request<{ success: boolean; user: UserProfile }>('/api/auth/me');
    },
  },

  // Produce Batches
  batches: {
    async getAll(filters?: { crop?: string; status?: string; farmerId?: string }): Promise<{ success: boolean; batches: ProduceBatch[] }> {
      const query = new URLSearchParams();
      if (filters?.crop) query.set('crop', filters.crop);
      if (filters?.status) query.set('status', filters.status);
      if (filters?.farmerId) query.set('farmerId', filters.farmerId);
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; batches: ProduceBatch[] }>(`/api/batches${qStr}`);
    },

    async getById(id: string): Promise<{ success: boolean; batch: ProduceBatch }> {
      return request<{ success: boolean; batch: ProduceBatch }>(`/api/batches/${encodeURIComponent(id)}`);
    },

    async create(batchData: Partial<ProduceBatch>): Promise<{ success: boolean; batch: ProduceBatch }> {
      return request<{ success: boolean; batch: ProduceBatch }>('/api/batches', {
        method: 'POST',
        body: JSON.stringify(batchData),
      });
    },

    async update(id: string, updates: Partial<ProduceBatch>): Promise<{ success: boolean; batch: ProduceBatch }> {
      return request<{ success: boolean; batch: ProduceBatch }>(`/api/batches/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>(`/api/batches/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  },

  // Buyers & Marketplace Matches
  buyers: {
    async getAll(): Promise<{ success: boolean; buyers: BuyerMatch[] }> {
      return request<{ success: boolean; buyers: BuyerMatch[] }>('/api/buyers');
    },

    async getMatches(crop: string, qualityScore: number): Promise<{ success: boolean; matches: BuyerMatch[] }> {
      return request<{ success: boolean; matches: BuyerMatch[] }>(
        `/api/buyers/matches?crop=${encodeURIComponent(crop)}&qualityScore=${qualityScore}`
      );
    },
  },

  // Demands (Buyer Portal RFQs)
  demands: {
    async getAll(): Promise<{ success: boolean; demands: any[] }> {
      return request<{ success: boolean; demands: any[] }>('/api/demands');
    },

    async create(demandData: any): Promise<{ success: boolean; demand: any }> {
      return request<{ success: boolean; demand: any }>('/api/demands', {
        method: 'POST',
        body: JSON.stringify(demandData),
      });
    },
  },

  // Orders & Smart Escrow
  orders: {
    async getAll(filters?: { farmerId?: string; buyerId?: string; status?: string }): Promise<{ success: boolean; orders: Order[] }> {
      const query = new URLSearchParams();
      if (filters?.farmerId) query.set('farmerId', filters.farmerId);
      if (filters?.buyerId) query.set('buyerId', filters.buyerId);
      if (filters?.status) query.set('status', filters.status);
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; orders: Order[] }>(`/api/orders${qStr}`);
    },

    async getById(id: string): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/api/orders/${encodeURIComponent(id)}`);
    },

    async create(orderData: Partial<Order>): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    async updateStatus(id: string, status: Order['status'], note?: string): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/api/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
    },

    async sendTelemetry(id: string, temperature: number, humidity: number): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/api/orders/${encodeURIComponent(id)}/telemetry`, {
        method: 'POST',
        body: JSON.stringify({ temperature, humidity }),
      });
    },
  },

  // Multilingual AI Kisan Voice Assistant
  voice: {
    async ask(params: {
      query: string;
      language?: string;
      crop?: string;
      batchContext?: any;
    }): Promise<{ success: boolean; answer: string; actionTab?: string; source: string }> {
      return request<{ success: boolean; answer: string; actionTab?: string; source: string }>('/api/voice/assistant', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  },

  // Platform Analytics & ESG Impact
  analytics: {
    async getImpact(): Promise<{ success: boolean; impact: ImpactStats }> {
      return request<{ success: boolean; impact: ImpactStats }>('/api/analytics/impact');
    },
  },
};
