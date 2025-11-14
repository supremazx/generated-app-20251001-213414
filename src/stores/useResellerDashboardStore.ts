import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { ResellerDashboardStats } from '@shared/types';
interface ResellerDashboardState {
  stats: ResellerDashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}
export const useResellerDashboardStore = create<ResellerDashboardState>()(
  immer((set) => ({
    stats: null,
    loading: false,
    error: null,
    fetchStats: async () => {
      set((state) => {
        if (!state.stats) {
          state.loading = true;
        }
        state.error = null;
      });
      try {
        const stats = await api<ResellerDashboardStats>('/api/reseller/dashboard');
        set({ stats, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reseller dashboard stats';
        set({ loading: false, error: errorMessage });
      }
    },
  }))
);