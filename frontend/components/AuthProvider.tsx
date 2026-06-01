"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";
import { getUser, refreshToken } from "@/services/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshToken();

        const user = await getUser();

        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
