import { apiFetch } from "./wrapper";

import { apiUrl } from "@/lib/api";

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
    apiUrl(`/api/v1/exercise-sets/chart/?${searchParams}`),
  );

  return response.json();
}
