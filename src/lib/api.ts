import {
  Alert,
  Crop,
  Listing,
  Market,
  MarketComparison,
  MarketInsight,
  PriceRecord,
  PriceStats,
  ProfitCalculationRequest,
  ProfitCalculationResult,
  TodayPriceRow,
  User,
} from '../../shared/types.ts';
import {
  getCachedCrops,
  getCachedPrices,
  getStoredUserId,
  setCachedCrops,
  setCachedPrices,
} from './storage.ts';

class ApiClient {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const userId = getStoredUserId();
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = {
          error: {
            code: 'server_error',
            message_en: res.statusText || 'Request failed',
            message_ur: 'درخواست ناکام ہو گئی۔',
          },
        };
      }
      throw errorData;
    }

    if (res.status === 204) {
      return {} as T;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw {
        error: {
          code: 'invalid_response',
          message_en: `Expected JSON but received ${contentType || 'HTML'}.`,
          message_ur: 'سرور کا جواب درست نہیں ہے۔',
        },
      };
    }

    return res.json();
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; counts: Record<string, number> }>('/api/health');
  }

  // Users
  async createUser(data: { name: string; phone: string; district: string; role: string }): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/api/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Catalog
  async getCrops(): Promise<{ data: Crop[]; isOffline: boolean }> {
    try {
      const crops = await this.request<Crop[]>('/api/crops');
      setCachedCrops(crops);
      return { data: crops, isOffline: false };
    } catch (err) {
      const cached = getCachedCrops();
      if (cached && cached.length > 0) {
        return { data: cached, isOffline: true };
      }
      throw err;
    }
  }

  async getMarkets(): Promise<Market[]> {
    return this.request<Market[]>('/api/markets');
  }

  // Prices
  async getPricesToday(
    marketId: string = 'm1',
    category?: string
  ): Promise<{ data: TodayPriceRow[]; isOffline: boolean }> {
    const query = new URLSearchParams({ marketId });
    if (category && category !== 'All') {
      query.set('category', category);
    }
    try {
      const rows = await this.request<TodayPriceRow[]>(`/api/prices/today?${query.toString()}`);
      if (rows && rows.length > 0 && (!category || category === 'All')) {
        setCachedPrices(rows);
      }
      return { data: rows, isOffline: false };
    } catch (err) {
      const cached = getCachedPrices();
      if (cached && cached.length > 0) {
        let filtered = cached;
        if (category && category !== 'All') {
          filtered = cached.filter((r) => r.category === category);
        }
        return { data: filtered, isOffline: true };
      }
      throw err;
    }
  }

  async getPriceHistory(cropId: string, marketId: string = 'm1', days: number = 14): Promise<PriceRecord[]> {
    return this.request<PriceRecord[]>(`/api/prices?cropId=${cropId}&marketId=${marketId}&days=${days}`);
  }

  async getPriceStats(cropId: string, marketId: string = 'm1', days: number = 14): Promise<PriceStats> {
    return this.request<PriceStats>(`/api/prices/stats?cropId=${cropId}&marketId=${marketId}&days=${days}`);
  }

  async getPriceComparison(cropId: string): Promise<MarketComparison[]> {
    return this.request<MarketComparison[]>(`/api/prices/compare?cropId=${cropId}`);
  }

  async getPriceInsight(marketId: string = 'm1'): Promise<MarketInsight> {
    return this.request<MarketInsight>(`/api/prices/insight?marketId=${marketId}`);
  }

  // Listings
  async getListings(params: {
    cropId?: string;
    district?: string;
    grade?: string;
    sort?: 'newest' | 'price_asc';
    status?: 'active' | 'sold' | 'all';
    userId?: string;
  } = {}): Promise<Listing[]> {
    const query = new URLSearchParams();
    if (params.cropId) query.set('cropId', params.cropId);
    if (params.district) query.set('district', params.district);
    if (params.grade) query.set('grade', params.grade);
    if (params.sort) query.set('sort', params.sort);
    if (params.status) query.set('status', params.status);
    if (params.userId) query.set('userId', params.userId);

    return this.request<Listing[]>(`/api/listings?${query.toString()}`);
  }

  async getListing(id: string): Promise<Listing> {
    return this.request<Listing>(`/api/listings/${id}`);
  }

  async createListing(data: any): Promise<Listing> {
    return this.request<Listing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateListing(id: string, data: any): Promise<Listing> {
    return this.request<Listing>(`/api/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteListing(id: string): Promise<void> {
    return this.request<void>(`/api/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>('/api/alerts');
  }

  async getTriggeredAlerts(): Promise<{ count: number; items: Alert[] }> {
    return this.request<{ count: number; items: Alert[] }>('/api/alerts/triggered');
  }

  async createAlert(data: {
    crop_id: string;
    market_id: string;
    condition: 'Above' | 'Below';
    target_price: number;
    active_status?: boolean;
  }): Promise<Alert> {
    return this.request<Alert>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    return this.request<Alert>(`/api/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(id: string): Promise<void> {
    return this.request<void>(`/api/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  // Profit
  async calculateProfit(data: ProfitCalculationRequest): Promise<ProfitCalculationResult> {
    return this.request<ProfitCalculationResult>('/api/profit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
