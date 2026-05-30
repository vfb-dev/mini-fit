const BASE_URL = "http://localhost:8000";

export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/token/`, {
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
  const response = await fetch(`${BASE_URL}/me/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to Fetch User");
  }

  return response.json();
}
