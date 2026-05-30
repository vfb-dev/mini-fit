const API_URL = "http://127.0.0.1:8000/api/v1/exercises";

export async function getStatsCardsData() {
  const response = await fetch(`${API_URL}/stats_cards`);

  if (!response.ok) {
    throw new Error("Failed to fetch stats cards");
  }

  return response.json();
}
