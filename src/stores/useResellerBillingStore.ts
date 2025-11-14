import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { ResellerBillingInfo } from '@shared/types';
interface ResellerBillingState {
  billingInfo: ResellerBillingInfo | null;
  loading: boolean;
  error: string | null;
  fetchBillingInfo: () => Promise<void>;
}
export const useResellerBillingStore = create<ResellerBillingState>()(
  immer((set) => ({
    billingInfo: null,
    loading: false,
    error: null,
    fetchBillingInfo: async () => {
      set({ loading: true, error: null });
      try {
        const info = await api<ResellerBillingInfo>('/api/reseller/billing');
        set({ billingInfo: info, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reseller billing info';
        set({ loading: false, error: errorMessage });
      }
    },
  }))
);