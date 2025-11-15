import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { UserDashboardInfo, ChangePasswordData, ChangeEmailData } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface UserDashboardState {
  userInfo: UserDashboardInfo | null;
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
  changeEmail: (data: ChangeEmailData) => Promise<boolean>;
}
export const useUserDashboardStore = create<UserDashboardState>()(
  immer((set) => ({
    userInfo: null,
    loading: false,
    error: null,
    fetchUserInfo: async () => {
      set((state) => {
        if (!state.userInfo) {
          state.loading = true;
        }
        state.error = null;
      });
      try {
        const info = await api<UserDashboardInfo>('/api/user-dashboard');
        set({ userInfo: info, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user information';
        set({ loading: false, error: errorMessage });
      }
    },
    changePassword: async (data: ChangePasswordData) => {
      try {
        await api('/api/user/change-password', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success(tr.toasts.passwordChanged);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.changePassword;
        toast.error(errorMessage);
        console.error("Failed to change password:", error);
        return false;
      }
    },
    changeEmail: async (data: ChangeEmailData) => {
      try {
        await api('/api/user/change-email', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success(tr.toasts.emailChanged);
        // Optionally refetch user info to update the UI
        useUserDashboardStore.getState().fetchUserInfo();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tr.toasts.error.changeEmail;
        toast.error(errorMessage);
        console.error("Failed to change email:", error);
        return false;
      }
    },
  }))
);