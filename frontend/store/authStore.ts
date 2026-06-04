"use client";

import { create } from "zustand";

interface User {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  date_joined: string;
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
