import { vi } from 'vitest';

// This is a simplified mock. We can extend it for specific tests.
export const supabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: [{}], error: null }),
    update: vi.fn().mockResolvedValue({ data: [{}], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [{}], error: null }),
  })),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
};
