import { apiFetch } from "./wrapper";

import { apiUrl } from "@/lib/api";

export async function get_unique_exercises() {
  const response = await apiFetch(apiUrl("/api/v1/exercises/unique_exercises"));

  if (!response.ok) {
    throw new Error("Failed to Fetch Unique Exercises");
  }

  return response.json();
}

export async function get_chart_data(params: {
  exercise: string;
  metric: string;
  period: string;
}) {
  const searchParams = new URLSearchParams({
    exercise: params.exercise,
    metric: params.metric,
    period: params.period,
  });

  const response = await apiFetch(
    apiUrl(`/api/v1/exercises/chart/?${searchParams}`),
  );

  return response.json();
}
