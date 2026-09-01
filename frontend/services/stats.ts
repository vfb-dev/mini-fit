import { apiFetch } from "./wrapper";

import { apiUrl } from "@/lib/api";

export async function getStatsCardsData() {
  const response = await apiFetch(apiUrl("/api/v1/exercise-sets/stats_cards"));

  if (!response.ok) {
    throw new Error("Failed to Fetch Stats Cards");
  }

  return response.json();
}
