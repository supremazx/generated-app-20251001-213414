import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { UserDashboardInfo, ChangePasswordData } from '@shared/types';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
interface UserDashboardState {
  userInfo: UserDashboardInfo | null;
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
}
export const useUserDashboardStore = create<UserDashboardState>()(
  immer((set) => ({
    userInfo: null,
    loading: false,
    error: null,
    fetchUserInfo: async () => {
      set({ loading: true, error: null });
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
  }))
);