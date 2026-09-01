import { apiFetch } from "./wrapper";

import { apiUrl } from "@/lib/api";

export type RoutineItem = {
  id: number;
  exercise: number;
  exercise_name: string;
  primary_body_part: string;
  secondary_body_parts: string[];
  order: number;
  target_sets: number;
  target_reps: number | null;
};

export type WorkoutRoutine = {
  id: number;
  name: string;
  description: string;
  items: RoutineItem[];
  exercise_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type RoutinesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorkoutRoutine[];
};

export type RoutineItemPayload = {
  exercise: number;
  order: number;
  target_sets: number;
  target_reps: number | null;
};

export type RoutinePayload = {
  name: string;
  description: string;
  items: RoutineItemPayload[];
};

type GetRoutinesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function getRoutines({
  page = 1,
  pageSize,
  search,
}: GetRoutinesParams = {}) {
  const params = new URLSearchParams({ page: String(page) });

  if (pageSize) {
    params.set("page_size", String(pageSize));
  }

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const response = await apiFetch(apiUrl(`/api/v1/routines/?${params}`));

  if (!response.ok) {
    throw new Error("Failed to fetch routines");
  }

  return response.json();
}

export async function createRoutine(routineData: RoutinePayload) {
  const response = await apiFetch(apiUrl("/api/v1/routines/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(routineData),
  });

  if (!response.ok) {
    throw new Error("Failed to create routine");
  }

  return response.json();
}

export async function updateRoutine(id: number, routineData: RoutinePayload) {
  const response = await apiFetch(apiUrl(`/api/v1/routines/${id}/`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(routineData),
  });

  if (!response.ok) {
    throw new Error("Failed to update routine");
  }

  return response.json();
}

export async function deleteRoutine(id: number) {
  const response = await apiFetch(apiUrl(`/api/v1/routines/${id}/`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Failed to delete routine");
  }
}
