import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { Campaign, CreateCampaignData, CampaignStatus, EditCampaignData } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  fetchCampaignById: (id: string) => Promise<void>;
  addCampaign: (newCampaign: CreateCampaignData) => Promise<Campaign | undefined>;
  deleteCampaign: (id: string) => Promise<void>;
  updateCampaignStatus: (id: string, status: CampaignStatus) => Promise<void>;
  updateCampaign: (id: string, data: EditCampaignData) => Promise<void>;
}
export const useCampaignStore = create<CampaignState>()(
  immer((set) => ({
    campaigns: [],
    selectedCampaign: null,
    loading: false,
    error: null,
    fetchCampaigns: async () => {
      set((state) => {
        if (state.campaigns.length === 0) {
          state.loading = true;
        }
        state.error = null;
      });
      try {
        const campaigns = await api<Campaign[]>('/api/campaigns');
        set({ campaigns, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch campaigns';
        set({ loading: false, error: errorMessage });
      }
    },
    fetchCampaignById: async (id: string) => {
      set({ loading: true, error: null, selectedCampaign: null });
      try {
        const campaign = await api<Campaign>(`/api/campaigns/${id}`);
        set({ selectedCampaign: campaign, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch campaign';
        set({ loading: false, error: errorMessage });
      }
    },
    addCampaign: async (newCampaign) => {
      try {
        const createdCampaign = await api<Campaign>('/api/campaigns', {
          method: 'POST',
          body: JSON.stringify(newCampaign),
        });
        set((state) => {
          state.campaigns.push(createdCampaign);
        });
        toast.success(tr.toasts.campaignCreated);
        return createdCampaign;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.createCampaign;
        toast.error(errorMessage);
        console.error("Failed to add campaign:", error);
      }
    },
    deleteCampaign: async (id: string) => {
      try {
        await api(`/api/campaigns/${id}`, { method: 'DELETE' });
        set((state) => {
          state.campaigns = state.campaigns.filter((c) => c.id !== id);
        });
        toast.success(tr.toasts.campaignDeleted);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.deleteCampaign;
        toast.error(errorMessage);
        console.error("Failed to delete campaign:", error);
      }
    },
    updateCampaignStatus: async (id: string, status: CampaignStatus) => {
      try {
        const updatedCampaign = await api<Campaign>(`/api/campaigns/${id}/status`, {
          method: 'POST',
          body: JSON.stringify({ status }),
        });
        set((state) => {
          const index = state.campaigns.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.campaigns[index] = updatedCampaign;
          }
          if (state.selectedCampaign?.id === id) {
            state.selectedCampaign = updatedCampaign;
          }
        });
        toast.success(tr.toasts.campaignStatusUpdated(status));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.updateCampaignStatus;
        toast.error(errorMessage);
        console.error("Failed to update campaign status:", error);
      }
    },
    updateCampaign: async (id: string, data: EditCampaignData) => {
        try {
            const updatedCampaign = await api<Campaign>(`/api/campaigns/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            set((state) => {
                const index = state.campaigns.findIndex((c) => c.id === id);
                if (index !== -1) {
                    state.campaigns[index] = updatedCampaign;
                }
            });
            toast.success(tr.toasts.campaignUpdated);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : tr.toasts.error.updateCampaign;
            toast.error(errorMessage);
            console.error("Failed to update campaign:", error);
        }
    }
  }))
);