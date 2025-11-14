import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { AudioFile } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface AudioFileState {
  audioFiles: AudioFile[];
  loading: boolean;
  error: string | null;
  fetchAudioFiles: (userId?: string) => Promise<void>;
  addAudioFile: (formData: FormData) => Promise<AudioFile | undefined>;
  deleteAudioFile: (id: string) => Promise<void>;
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
export const useAudioFileStore = create<AudioFileState>()(
  immer((set) => ({
    audioFiles: [],
    loading: false,
    error: null,
    fetchAudioFiles: async (userId?: string) => {
      set({ loading: true, error: null });
      try {
        const url = userId ? `/api/audio-files?userId=${userId}` : '/api/audio-files';
        const audioFiles = await api<AudioFile[]>(url);
        set({ audioFiles, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audio files';
        set({ loading: false, error: errorMessage });
      }
    },
    addAudioFile: async (formData) => {
      try {
        const created = await apiFormData<AudioFile>('/api/audio-files', formData);
        set((state) => {
          state.audioFiles.push(created);
        });
        toast.success(tr.toasts.audioFileUploaded);
        return created;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.uploadAudioFile;
        toast.error(errorMessage);
        console.error("Failed to add audio file:", error);
        return undefined;
      }
    },
    deleteAudioFile: async (id: string) => {
      try {
        await api(`/api/audio-files/${id}`, { method: 'DELETE' });
        set((state) => {
          state.audioFiles = state.audioFiles.filter((af) => af.id !== id);
        });
        toast.success(tr.toasts.audioFileDeleted);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.deleteAudioFile;
        toast.error(errorMessage);
        console.error("Failed to delete audio file:", error);
      }
    },
  }))
);