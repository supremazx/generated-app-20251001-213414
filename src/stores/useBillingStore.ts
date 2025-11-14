import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { BillingInfo } from '@shared/types';
interface BillingState {
  billingInfo: BillingInfo | null;
  loading: boolean;
  error: string | null;
  fetchBillingInfo: () => Promise<void>;
}
export const useBillingStore = create<BillingState>()(
  immer((set) => ({
    billingInfo: null,
    loading: false,
    error: null,
    fetchBillingInfo: async () => {
      set({ loading: true, error: null });
      try {
        const info = await api<BillingInfo>('/api/billing');
        set({ billingInfo: info, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch billing information';
        set({ loading: false, error: errorMessage });
      }
    },
  }))
);