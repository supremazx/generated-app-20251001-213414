import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
type User = {
  id: string;
  email: string;
  role: 'admin' | 'user';
};
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}
export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    checkAuth: () => {
      try {
        const userJson = localStorage.getItem('edgedialer_user');
        if (userJson) {
          const user = JSON.parse(userJson);
          set({ isAuthenticated: true, user, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        set({ isLoading: false });
      }
    },
    login: async (email, password) => {
      set({ isLoading: true });
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (password === 'password') {
        let user: User | null = null;
        if (email === 'admin@example.com') {
          user = { id: 'admin-001', email, role: 'admin' };
        } else if (email === 'user@example.com') {
          user = { id: 'user-123', email, role: 'user' };
        }
        if (user) {
          localStorage.setItem('edgedialer_user', JSON.stringify(user));
          set({ isAuthenticated: true, user, isLoading: false });
          toast.success('Giriş başarılı!');
          return true;
        }
      }
      set({ isLoading: false });
      toast.error('Geçersiz e-posta veya şifre.');
      return false;
    },
    logout: () => {
      localStorage.removeItem('edgedialer_user');
      set({ isAuthenticated: false, user: null });
      toast.info('Başarıyla çıkış yapıldı.');
    },
  }))
);
// Initialize auth state on app load
useAuthStore.getState().checkAuth();