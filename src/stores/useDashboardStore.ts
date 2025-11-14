import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { DialerStats } from '@shared/types';
interface DashboardState {
  stats: DialerStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}
export const useDashboardStore = create<DashboardState>()(
  immer((set) => ({
    stats: null,
    loading: false,
    error: null,
    fetchStats: async () => {
       set((state) => {
        // Only set loading true on initial fetch
        if (!state.stats) {
          state.loading = true;
        }
        state.error = null;
      });
      try {
        const stats = await api<DialerStats>('/api/dashboard/stats');
        set({ stats, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
        set({ loading: false, error: errorMessage });
      }
    },
  }))
);