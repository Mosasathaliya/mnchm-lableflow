/**
 * API Service for MNChem Label Studio
 * Interacts with server API endpoints with session Bearer token authorization
 */

import { ProductTemplate, OrderLabel, AppSettings } from '../types/index.ts';

const TOKEN_KEY = 'mnchem_session_token';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Restore session token from sessionStorage if present (preserves session across page refreshes)
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem(TOKEN_KEY);
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Invalidate expired session
      this.setToken(null);
      throw new Error('Unauthorized or session expired. Please enter access code.');
    }

    if (!response.ok) {
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) errorMsg = errorJson.error;
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // --- Auth ---
  public async login(accessCode: string): Promise<{ token: string; expiresAt: number }> {
    const data = await this.request<{ token: string; expiresAt: number }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ accessCode }),
    });
    this.setToken(data.token);
    return data;
  }

  public async verifySession(): Promise<boolean> {
    if (!this.token) return false;
    try {
      const data = await this.request<{ authenticated: boolean }>('/api/auth/verify');
      if (!data.authenticated) {
        this.setToken(null);
        return false;
      }
      return true;
    } catch {
      this.setToken(null);
      return false;
    }
  }

  public async logout(): Promise<void> {
    if (this.token) {
      try {
        await this.request('/api/auth/logout', { method: 'POST' });
      } catch {
        // ignore errors on logout
      }
    }
    this.setToken(null);
  }

  // --- Dashboard ---
  public async getDashboardStats(): Promise<{
    activeTemplates: number;
    totalTemplates: number;
    totalOrders: number;
    finalizedOrders: number;
    recentOrders: OrderLabel[];
  }> {
    return this.request('/api/dashboard/stats');
  }

  // --- Templates ---
  public async getTemplates(status?: string, search?: string): Promise<ProductTemplate[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{ templates: ProductTemplate[] }>(`/api/templates${query}`);
    return res.templates;
  }

  public async getTemplate(id: string): Promise<ProductTemplate> {
    const res = await this.request<{ template: ProductTemplate }>(`/api/templates/${id}`);
    return res.template;
  }

  public async createTemplate(template: Partial<ProductTemplate>): Promise<ProductTemplate> {
    const res = await this.request<{ template: ProductTemplate }>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
    return res.template;
  }

  public async updateTemplate(id: string, template: Partial<ProductTemplate>): Promise<ProductTemplate> {
    const res = await this.request<{ template: ProductTemplate }>(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
    return res.template;
  }

  public async duplicateTemplate(id: string): Promise<ProductTemplate> {
    const res = await this.request<{ template: ProductTemplate }>(`/api/templates/${id}/duplicate`, {
      method: 'POST',
    });
    return res.template;
  }

  public async archiveTemplate(id: string): Promise<ProductTemplate> {
    const res = await this.request<{ template: ProductTemplate }>(`/api/templates/${id}/archive`, {
      method: 'PATCH',
    });
    return res.template;
  }

  // --- Orders ---
  public async getOrders(
    search?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: OrderLabel[]; total: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return this.request<{ orders: OrderLabel[]; total: number; totalPages: number }>(`/api/orders?${params.toString()}`);
  }

  public async getOrder(id: string): Promise<OrderLabel> {
    const res = await this.request<{ order: OrderLabel }>(`/api/orders/${id}`);
    return res.order;
  }

  public async createOrder(orderData: {
    templateId: string;
    customerPoNumber: string;
    expiryDate: string;
    batchNumber: string;
    manufacturingDate?: string;
    status?: 'Finalized' | 'Draft';
    pdfBase64?: string;
    notes?: string;
  }): Promise<OrderLabel> {
    const res = await this.request<{ order: OrderLabel }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return res.order;
  }

  // --- Files ---
  public async uploadFile(
    fileName: string,
    fileBase64: string,
    contentType?: string
  ): Promise<{ fileId: string; url: string; size: number }> {
    return this.request('/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileBase64, contentType }),
    });
  }

  // --- Settings ---
  public async getSettings(): Promise<AppSettings> {
    const res = await this.request<{ settings: AppSettings }>('/api/settings');
    return res.settings;
  }

  public async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await this.request<{ settings: AppSettings }>('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    return res.settings;
  }
}

export const api = new ApiService();
