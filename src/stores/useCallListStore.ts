import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { CallList } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface CallListState {
  callLists: CallList[];
  selectedCallList: CallList | null;
  loading: boolean;
  error: string | null;
  fetchCallLists: () => Promise<void>;
  fetchCallListById: (id: string) => Promise<void>;
  addCallList: (formData: FormData) => Promise<CallList | undefined>;
  deleteCallList: (id: string) => Promise<void>;
}
async function apiFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}
export const useCallListStore = create<CallListState>()(
  immer((set) => ({
    callLists: [],
    selectedCallList: null,
    loading: false,
    error: null,
    fetchCallLists: async () => {
      set({ loading: true, error: null });
      try {
        const callLists = await api<CallList[]>('/api/call-lists');
        set({ callLists, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch call lists';
        set({ loading: false, error: errorMessage });
      }
    },
    fetchCallListById: async (id: string) => {
      set({ loading: true, error: null, selectedCallList: null });
      try {
        const callList = await api<CallList>(`/api/call-lists/${id}`);
        set({ selectedCallList: callList, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch call list';
        set({ loading: false, error: errorMessage });
      }
    },
    addCallList: async (formData) => {
      try {
        const createdCallList = await apiFormData<CallList>('/api/call-lists', formData);
        set((state) => {
          state.callLists.push(createdCallList);
        });
        toast.success(tr.toasts.callListUploaded);
        return createdCallList;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.uploadCallList;
        toast.error(errorMessage);
        console.error("Failed to add call list:", error);
      }
    },
    deleteCallList: async (id: string) => {
      try {
        await api(`/api/call-lists/${id}`, { method: 'DELETE' });
        set((state) => {
          state.callLists = state.callLists.filter((cl) => cl.id !== id);
        });
        toast.success(tr.toasts.callListDeleted);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.deleteCallList;
        toast.error(errorMessage);
        console.error("Failed to delete call list:", error);
      }
    },
  }))
);