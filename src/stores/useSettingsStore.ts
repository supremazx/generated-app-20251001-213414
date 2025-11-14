import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { Settings } from '@shared/types';
interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Settings) => Promise<void>;
}
export const useSettingsStore = create<SettingsState>()(
  immer((set) => ({
    settings: null,
    loading: false,
    error: null,
    fetchSettings: async () => {
      set({ loading: true, error: null });
      try {
        const settings = await api<Settings>('/api/settings');
        set({ settings, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
        set({ loading: false, error: errorMessage });
      }
    },
    updateSettings: async (newSettings: Settings) => {
      try {
        const updatedSettings = await api<Settings>('/api/settings', {
          method: 'POST',
          body: JSON.stringify(newSettings),
        });
        set({ settings: updatedSettings });
      } catch (error) {
        console.error("Failed to update settings:", error);
        // Optionally set an error state
      }
    },
  }))
);