import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
    token: null,
    user: null,
    loading: false,
    error: null,

    // Add setUser function that's missing
    setUser: (userData) => set({ 
        token: userData.token, 
        user: { id: userData.id, name: userData.name } 
    }),

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
        const token = await loginUser(email, password);
        const userInfo = await getUserInfo(token);

        set({ token, user: userInfo, loading: false });
        localStorage.setItem("token", token);
        } catch (err) {
        set({ error: err.message, loading: false });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken"); // Clear both
        set({ token: null, user: null });
    },

    checkAuth: () => {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
        set({ token });
        }
    },
}));