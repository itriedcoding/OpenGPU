class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = 'https://api.opengpu.io';
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: any): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: any): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  async login(email: string, password: string) {
    const result = await this.post<{ token: string; user: any }>('/api/auth/login', { email, password });
    this.token = result.token;
    return result;
  }

  async register(data: { email: string; password: string; name: string }) {
    const result = await this.post<{ token: string; user: any }>('/api/auth/register', data);
    this.token = result.token;
    return result;
  }

  async getProfile() {
    return this.get<{ user: any }>('/api/auth/me');
  }

  async getGpus(params?: { search?: string; minMemory?: number; maxPrice?: number; gpuModel?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.minMemory) query.set('minMemory', String(params.minMemory));
    if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params?.gpuModel) query.set('gpuModel', params.gpuModel);
    const qs = query.toString();
    return this.get<{ gpus: any[] }>(`/api/gpus${qs ? `?${qs}` : ''}`);
  }

  async getGpuById(id: string) {
    return this.get<{ gpu: any }>(`/api/gpus/${id}`);
  }

  async createRental(gpuId: string, duration: number) {
    return this.post<{ rental: any }>('/api/rentals', { gpuId, duration });
  }

  async getMyRentals() {
    return this.get<{ rentals: any[] }>('/api/rentals/my');
  }

  async stopRental(rentalId: string) {
    return this.post<{ rental: any }>(`/api/rentals/${rentalId}/stop`);
  }

  async extendRental(rentalId: string, additionalHours: number) {
    return this.post<{ rental: any }>(`/api/rentals/${rentalId}/extend`, { additionalHours });
  }

  async getMyGpus() {
    return this.get<{ gpus: any[] }>('/api/providers/gpus');
  }

  async registerGpu(data: any) {
    return this.post<{ gpu: any }>('/api/providers/gpus', data);
  }

  async updateGpu(id: string, data: any) {
    return this.put<{ gpu: any }>(`/api/providers/gpus/${id}`, data);
  }

  async removeGpu(id: string) {
    return this.delete<{ success: boolean }>(`/api/providers/gpus/${id}`);
  }

  async getEarnings() {
    return this.get<{ earnings: any }>('/api/providers/earnings');
  }

  async getDashboardStats() {
    return this.get<{ stats: any }>('/api/dashboard/stats');
  }

  async getActivity(limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return this.get<{ activity: any[] }>(`/api/activity${qs}`);
  }

  async updateSettings(settings: any) {
    return this.put<{ settings: any }>('/api/settings', settings);
  }

  async getSettings() {
    return this.get<{ settings: any }>('/api/settings');
  }

  async createApiKey(name: string) {
    return this.post<{ apiKey: any }>('/api/api-keys', { name });
  }

  async getApiKeys() {
    return this.get<{ apiKeys: any[] }>('/api/api-keys');
  }

  async deleteApiKey(id: string) {
    return this.delete<{ success: boolean }>(`/api/api-keys/${id}`);
  }
}

export const api = new ApiClient();
export default api;
