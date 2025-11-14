import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { ResellerSettings } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface ResellerSettingsState {
  settings: ResellerSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: ResellerSettings) => Promise<void>;
}
export const useResellerSettingsStore = create<ResellerSettingsState>()(
  immer((set) => ({
    settings: null,
    loading: false,
    error: null,
    fetchSettings: async () => {
      set({ loading: true, error: null });
      try {
        const settings = await api<ResellerSettings>('/api/reseller/settings');
        set({ settings, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reseller settings';
        set({ loading: false, error: errorMessage });
      }
    },
    updateSettings: async (newSettings: ResellerSettings) => {
      try {
        const updatedSettings = await api<ResellerSettings>('/api/reseller/settings', {
          method: 'POST',
          body: JSON.stringify(newSettings),
        });
        set({ settings: updatedSettings });
        toast.success(tr.toasts.settingsSaved);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
        toast.error(errorMessage);
        console.error("Failed to update reseller settings:", error);
      }
    },
  }))
);