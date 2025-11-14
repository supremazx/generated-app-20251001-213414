import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { ResellerClient, CreateResellerClientData } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface ResellerClientsState {
  clients: ResellerClient[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  addClient: (newClient: CreateResellerClientData) => Promise<ResellerClient | undefined>;
  deleteClient: (id: string) => Promise<void>;
}
export const useResellerClientsStore = create<ResellerClientsState>()(
  immer((set) => ({
    clients: [],
    loading: false,
    error: null,
    fetchClients: async () => {
      set({ loading: true, error: null });
      try {
        const clients = await api<ResellerClient[]>('/api/reseller/clients');
        set({ clients, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
        set({ loading: false, error: errorMessage });
      }
    },
    addClient: async (newClient) => {
      try {
        const createdClient = await api<ResellerClient>('/api/reseller/clients', {
          method: 'POST',
          body: JSON.stringify(newClient),
        });
        set((state) => {
          state.clients.push(createdClient);
        });
        toast.success(tr.toasts.resellerClientCreated);
        return createdClient;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.createResellerClient;
        toast.error(errorMessage);
        console.error("Failed to add client:", error);
        return undefined;
      }
    },
    deleteClient: async (id: string) => {
      try {
        await api(`/api/reseller/clients/${id}`, { method: 'DELETE' });
        set((state) => {
          state.clients = state.clients.filter((c) => c.id !== id);
        });
        toast.success(tr.toasts.resellerClientDeleted);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.deleteResellerClient;
        toast.error(errorMessage);
        console.error("Failed to delete client:", error);
      }
    },
  }))
);