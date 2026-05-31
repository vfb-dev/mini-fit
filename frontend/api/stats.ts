import { apiFetch } from "./wrapper";

const API_URL = "http://localhost:8000/api/v1/exercises";

export async function getStatsCardsData() {
  const response = await apiFetch(`${API_URL}/stats_cards`);

  if (!response.ok) {
    throw new Error("Failed to Fetch Stats Cards");
  }

  return response.json();
}
