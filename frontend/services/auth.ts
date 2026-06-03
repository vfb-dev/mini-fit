import { apiFetch } from "./wrapper";

const BASE_URL = "http://localhost:8000";

export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to Login");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(`${BASE_URL}/logout/`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to Logout");
  }

  return response.json();
}

export async function getUser() {
  const response = await apiFetch(`${BASE_URL}/me/`);

  if (!response.ok) {
    throw new Error("Failed to Fetch User");
  }

  return response.json();
}

export const refreshToken = async () => {
  const response = await fetch(`${BASE_URL}/refresh/`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to Refresh Token");
  }

  return response.json();
};

export async function registerUser(
  username: string,
  email: string,
  password: string,
) {
  const response = await fetch(`${BASE_URL}/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.email?.[0] ??
      data?.username?.[0] ??
      data?.password?.[0] ??
      data?.detail ??
      "Failed to create account";

    throw new Error(message);
  }

  return data;
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${BASE_URL}/password-reset/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail ?? "Could not send password reset email.");
  }

  return data;
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  password: string,
  confirmPassword: string,
) {
  const response = await fetch(`${BASE_URL}/password-reset-confirm/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid,
      token,
      password,
      confirm_password: confirmPassword,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.password?.[0] ??
      data?.confirm_password?.[0] ??
      data?.detail ??
      "Could not reset password.";

    throw new Error(message);
  }

  return data;
}
