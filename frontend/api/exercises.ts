import { apiFetch } from "./wrapper";

const API_URL = "http://localhost:8000/api/v1/exercises/";

export async function getExercises(page = 1) {
  const response = await apiFetch(`${API_URL}?page=${page}`);

  if (!response.ok) {
    throw new Error("Failed to Fetch Exercises");
  }

  return response.json();
}

export async function createExercise(exerciseData: {
  date: string;
  name: string;
  reps: number;
  weight: number;
}) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exerciseData),
  });

  if (!response.ok) {
    throw new Error("Failed to create");
  }

  return response.json();
}

export async function updateExercise(
  id: number,
  exerciseData: {
    date: string;
    name: string;
    reps: number;
    weight: number;
  },
) {
  const response = await apiFetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exerciseData),
  });

  return response.json();
}

export async function deleteExercise(id: number) {
  const response = await apiFetch(`${API_URL}${id}/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete");
  }
}
