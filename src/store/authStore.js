import { create } from "zustand";
import { loginUser, getUserInfo } from "../api/api";

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  loading: false,
  error: null,

  // Updated setUser function to handle fallback data
  setUser: (userData) =>
    set({
      token: userData.token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        isFallback: userData.isFallback || false,
      },
    }),

  // Updated login function to work with new API structure
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // loginUser now returns { token, userData } instead of just token
      const loginResult = await loginUser(email, password);
      const token = loginResult.token;

      let userInfo;

      // Check if user data is already in login response
      if (
        loginResult.userData &&
        (loginResult.userData.id || loginResult.userData.email)
      ) {
        console.log("✅ Using user data from login response");
        userInfo = loginResult.userData;
      } else {
        // getUserInfo now returns fallback data instead of throwing errors
        userInfo = await getUserInfo(token, email);
      }

      // Set user with proper fallback handling
      set({
        token,
        user: {
          id: userInfo.id || `user-${Date.now()}`,
          name: userInfo.name || userInfo.username || email.split("@")[0],
          email: userInfo.email || email,
          isFallback: userInfo.isFallback || false,
        },
        loading: false,
      });

      // Store tokens
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    set({ token: null, user: null });
  },

  checkAuth: () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      set({ token });
      // Note: We don't fetch user info here to avoid 403 errors on page load
      // User info will be fetched when needed in specific components
    }
  },

  // Optional: Function to manually refresh user info
  refreshUserInfo: async (email = "") => {
    const { token } = get();
    if (!token) return;

    try {
      const userInfo = await getUserInfo(token, email);
      set({
        user: {
          id: userInfo.id || get().user?.id,
          name: userInfo.name || get().user?.name,
          email: userInfo.email || get().user?.email,
          isFallback: userInfo.isFallback || false,
        },
      });
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      // Don't set error state here to avoid breaking the UI
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
}));
