import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { KnowledgeBase } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface KnowledgeBaseState {
  knowledgeBases: KnowledgeBase[];
  loading: boolean;
  error: string | null;
  fetchKnowledgeBases: () => Promise<void>;
  addKnowledgeBase: (formData: FormData) => Promise<KnowledgeBase | undefined>;
  deleteKnowledgeBase: (id: string) => Promise<void>;
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
export const useKnowledgeBaseStore = create<KnowledgeBaseState>()(
  immer((set) => ({
    knowledgeBases: [],
    loading: false,
    error: null,
    fetchKnowledgeBases: async () => {
      set({ loading: true, error: null });
      try {
        const knowledgeBases = await api<KnowledgeBase[]>('/api/knowledge-bases');
        set({ knowledgeBases, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch knowledge bases';
        set({ loading: false, error: errorMessage });
      }
    },
    addKnowledgeBase: async (formData) => {
      try {
        const created = await apiFormData<KnowledgeBase>('/api/knowledge-bases', formData);
        set((state) => {
          state.knowledgeBases.push(created);
        });
        toast.success(tr.toasts.knowledgeBaseUploaded);
        return created;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.uploadKnowledgeBase;
        toast.error(errorMessage);
        console.error("Failed to add knowledge base:", error);
        return undefined;
      }
    },
    deleteKnowledgeBase: async (id: string) => {
      try {
        await api(`/api/knowledge-bases/${id}`, { method: 'DELETE' });
        set((state) => {
          state.knowledgeBases = state.knowledgeBases.filter((kb) => kb.id !== id);
        });
        toast.success(tr.toasts.knowledgeBaseDeleted);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.deleteKnowledgeBase;
        toast.error(errorMessage);
        console.error("Failed to delete knowledge base:", error);
      }
    },
  }))
);