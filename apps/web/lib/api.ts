const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || `API error: ${res.status}`);
  }

  return data;
}

export async function fetchGPUs(filters?: {
  brand?: string;
  minVram?: number;
  maxPrice?: number;
  location?: string;
  availability?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.brand) params.set("brand", filters.brand);
  if (filters?.minVram) params.set("minVram", String(filters.minVram));
  if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters?.location) params.set("location", filters.location);
  if (filters?.availability) params.set("status", filters.availability);

  const query = params.toString();
  const data = await apiRequest<{ nodes: any[] }>(`/api/gpus${query ? `?${query}` : ""}`);
  return data.nodes || [];
}

export async function fetchGpuById(id: string): Promise<any> {
  const data = await apiRequest<{ node: any }>(`/api/gpus/${id}`);
  return data.node;
}

export async function fetchUserRentals(token: string): Promise<any[]> {
  const data = await apiRequest<{ rentals: any[] }>("/api/rentals", { token });
  return data.rentals || [];
}

export async function signIn(email: string, password: string) {
  const data = await apiRequest<{ user: any; token: string; refreshToken: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
  return data;
}

export async function signUp(name: string, email: string, password: string) {
  const data = await apiRequest<{ user: any; token: string; refreshToken: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }
  );
  return data;
}

export async function fetchMe(token: string) {
  const data = await apiRequest<{ user: any }>("/api/auth/me", { token });
  return data.user;
}

export async function startRental(nodeId: string, token: string, durationHours?: number) {
  const data = await apiRequest<{ rental: any }>("/api/rentals", {
    method: "POST",
    token,
    body: JSON.stringify({ gpuNodeId: nodeId, durationHours }),
  });
  return data.rental;
}

export async function stopRental(rentalId: string, token: string) {
  const data = await apiRequest<{ rental: any }>(`/api/rentals/${rentalId}/stop`, {
    method: "POST",
    token,
  });
  return data.rental;
}

export async function fetchProviderDashboard(token: string) {
  const data = await apiRequest<any>("/api/provider/dashboard", { token });
  return data;
}

export async function fetchProviderNodes(token: string) {
  const data = await apiRequest<{ nodes: any[] }>("/api/provider/nodes", { token });
  return data.nodes || [];
}

export async function fetchPlatformStats() {
  try {
    const data = await apiRequest<any>("/api/gpus/stats");
    return data;
  } catch {
    return { totalGpus: 0, totalProviders: 0, uptime: 99.9, totalRentals: 0 };
  }
}
