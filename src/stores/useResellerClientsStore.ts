import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { ResellerClient, CreateResellerClientData, EditResellerClientData } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface ResellerClientsState {
  clients: ResellerClient[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  addClient: (newClient: CreateResellerClientData) => Promise<ResellerClient | undefined>;
  updateClient: (id: string, data: EditResellerClientData) => Promise<void>;
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
        const clients = await api<ResellerClient[]>('/api/clients');
        set({ clients, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
        set({ loading: false, error: errorMessage });
      }
    },
    addClient: async (newClient) => {
      try {
        const createdClient = await api<ResellerClient>('/api/clients', {
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
    updateClient: async (id: string, data: EditResellerClientData) => {
        try {
            const updatedClient = await api<ResellerClient>(`/api/clients/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            set((state) => {
                const index = state.clients.findIndex((c) => c.id === id);
                if (index !== -1) {
                    state.clients[index] = updatedClient;
                }
            });
            toast.success(tr.toasts.resellerClientUpdated);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : tr.toasts.error.updateResellerClient;
            toast.error(errorMessage);
            console.error("Failed to update client:", error);
        }
    },
    deleteClient: async (id: string) => {
      try {
        await api(`/api/clients/${id}`, { method: 'DELETE' });
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