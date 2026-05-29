"use client";

import { create } from "zustand";

interface User {
  id: number;
  email: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));
