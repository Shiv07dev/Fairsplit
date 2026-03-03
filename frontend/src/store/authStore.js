import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      darkMode: false,

      setAuth: (user, token) => {
        localStorage.setItem('fairsplit_token', token);
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },

      logout: () => {
        localStorage.removeItem('fairsplit_token');
        localStorage.removeItem('fairsplit_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      toggleDarkMode: () => {
        set((state) => {
          const newMode = !state.darkMode;
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newMode };
        });
      },

      initDarkMode: () => {
        const { darkMode } = get();
        if (darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
    }),
    {
      name: 'fairsplit-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        darkMode: state.darkMode
      })
    }
  )
);

export default useAuthStore;
