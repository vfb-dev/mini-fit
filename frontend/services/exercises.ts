import { apiFetch } from "./wrapper";

import { apiUrl } from "@/lib/api";

export async function getExercises(page = 1) {
  const response = await apiFetch(apiUrl(`/api/v1/exercises/?page=${page}`));

  if (!response.ok) {
    throw new Error("Failed to Fetch Exercises");
  }

  return response.json();
}

type HistoryParams = { page?: number; search?: string };
export async function getExercisesHistory({
  page = 1,
  search,
}: HistoryParams = {}) {
  const params = new URLSearchParams({ page: String(page) });

  if (search) {
    params.set("search", search);
  }

  const response = await apiFetch(
    apiUrl(`/api/v1/exercises/history/?${params}`),
  );

  if (!response.ok) {
    throw new Error("Failed to Fetch Exercises History");
  }

  return response.json();
}

export async function createExercise(exerciseData: {
  date: string;
  name: string;
  reps: number;
  weight: number;
}) {
  const response = await apiFetch(apiUrl("/api/v1/exercises/"), {
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
  const response = await apiFetch(apiUrl(`/api/v1/exercises/${id}/`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exerciseData),
  });

  return response.json();
}

export async function deleteExercise(id: number) {
  const response = await apiFetch(apiUrl(`/api/v1/exercises/${id}/`), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete");
  }
}
