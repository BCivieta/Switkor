// src/store/auth-store.ts
import { create } from "zustand";

interface AuthState {
  token: string | null;
  email: string | null;
  id: number | null;
  name: string | null;
  setAuth: (payload: {
    token: string;
    email: string;
    id: number;
    name: string;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:
    typeof window !== "undefined"
      ? sessionStorage.getItem("token") || localStorage.getItem("token")
      : null,
  email: null,
  id: null,
  name: null,

  setAuth: ({ token, email, id, name }) => {
    set({ token, email, id, name });
  },

  logout: () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    set({ token: null, email: null, id: null, name: null });
  },
}));
