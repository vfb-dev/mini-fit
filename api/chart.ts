const API_URL = "http://127.0.0.1:8000/api/v1/exercises";

export async function get_unique_exercises() {
  const response = await fetch(`${API_URL}/unique_exercises`);

  if (!response.ok) {
    throw new Error("Failed to Fetch");
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

  const response = await fetch(`${API_URL}/chart/?${searchParams}`);

  return response.json();
}
