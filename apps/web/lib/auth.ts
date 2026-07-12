// Auth helpers for Next.js - mock implementations for development

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  expires: string;
}

export async function getSession(): Promise<Session | null> {
  // Mock session - in production, use next-auth's getServerSession
  return null;
}

export async function useSession() {
  // Mock client-side session hook
  return { data: null, status: "unauthenticated" as const };
}
