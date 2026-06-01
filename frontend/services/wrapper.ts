import { useAuthStore } from "@/store/authStore";
import { refreshToken } from "@/services/auth";

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  let response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (response.status === 401) {
    try {
      await refreshToken();

      response = await fetch(input, {
        ...init,
        credentials: "include",
      });
    } catch {
      useAuthStore.getState().setUser(null);
      throw new Error("Session expired");
    }
  }

  return response;
}
