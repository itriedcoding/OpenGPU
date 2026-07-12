import { Gpu, mockGpus, Rental, mockRentals } from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchGPUs(filters?: {
  brand?: string;
  minVram?: number;
  maxPrice?: number;
  location?: string;
  availability?: string;
}): Promise<Gpu[]> {
  // Use mock data for development
  let gpus = [...mockGpus];

  if (filters) {
    if (filters.brand) gpus = gpus.filter((g) => g.brand === filters.brand);
    if (filters.minVram) gpus = gpus.filter((g) => g.vram >= filters.minVram!);
    if (filters.maxPrice) gpus = gpus.filter((g) => g.pricePerHour <= filters.maxPrice!);
    if (filters.availability) gpus = gpus.filter((g) => g.availability === filters.availability);
  }

  return gpus;
}

export async function fetchGpuById(id: string): Promise<Gpu | undefined> {
  return mockGpus.find((g) => g.id === id);
}

export async function fetchUserRentals(): Promise<Rental[]> {
  return mockRentals;
}

export async function signIn(email: string, password: string) {
  // Mock sign in
  return { user: { id: "1", name: "Test User", email }, token: "mock-jwt-token" };
}

export async function signUp(name: string, email: string, password: string) {
  // Mock sign up
  return { user: { id: "1", name, email }, token: "mock-jwt-token" };
}
