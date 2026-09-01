import { apiFetch } from "./wrapper";

import { apiUrl } from "@/lib/api";

export type ExerciseSet = {
  id: number;
  exercise: number;
  name: string;
  date: string;
  formatted_date: string;
  reps: number;
  weight: number;
};

export type ExerciseSetGroup = {
  group_id: string;
  exercise: number;
  name: string;
  date: string;
  sets: number;
  exercises: ExerciseSet[];
};

export type ExerciseSetsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExerciseSet[];
};

export type ExerciseSetHistoryResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExerciseSetGroup[];
};

export type ExerciseSetPayload = {
  exercise: number;
  date: string;
  reps: number;
  weight: number;
};

export async function getExerciseSets(page = 1) {
  const response = await apiFetch(apiUrl(`/api/v1/exercise-sets/?page=${page}`));

  if (!response.ok) {
    throw new Error("Failed to fetch exercise sets");
  }

  return response.json();
}

type HistoryParams = { page?: number; search?: string };
export async function getExerciseSetHistory({
  page = 1,
  search,
}: HistoryParams = {}) {
  const params = new URLSearchParams({ page: String(page) });

  if (search) {
    params.set("search", search);
  }

  const response = await apiFetch(
    apiUrl(`/api/v1/exercise-sets/history/?${params}`),
  );

  if (!response.ok) {
    throw new Error("Failed to fetch exercise set history");
  }

  return response.json();
}

export async function createExerciseSet(exerciseData: ExerciseSetPayload) {
  const response = await apiFetch(apiUrl("/api/v1/exercise-sets/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exerciseData),
  });

  if (!response.ok) {
    throw new Error("Failed to create exercise set");
  }

  return response.json();
}

export async function updateExerciseSet(
  id: number,
  exerciseData: ExerciseSetPayload,
) {
  const response = await apiFetch(apiUrl(`/api/v1/exercise-sets/${id}/`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exerciseData),
  });

  if (!response.ok) {
    throw new Error("Failed to update exercise set");
  }

  return response.json();
}

export async function deleteExerciseSet(id: number) {
  const response = await apiFetch(apiUrl(`/api/v1/exercise-sets/${id}/`), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete exercise set");
  }
}
