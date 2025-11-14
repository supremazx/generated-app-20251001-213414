import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { Agent } from '@shared/types';
interface AgentState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
}
export const useAgentStore = create<AgentState>()(
  immer((set) => ({
    agents: [],
    loading: false,
    error: null,
    fetchAgents: async () => {
      set((state) => {
        // Only set loading true on initial fetch
        if (state.agents.length === 0) {
          state.loading = true;
        }
        state.error = null;
      });
      try {
        const agents = await api<Agent[]>('/api/agents');
        set({ agents, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch agents';
        set({ loading: false, error: errorMessage });
      }
    },
  }))
);