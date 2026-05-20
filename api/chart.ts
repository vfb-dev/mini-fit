const API_URL = "http://127.0.0.1:8000/api/v1/exercises";

export async function get_unique_exercises() {
  const response = await fetch(`${API_URL}/unique_exercises`);

  if (!response.ok) {
    throw new Error("Failed to Fetch");
  }

  return response.json();
}
