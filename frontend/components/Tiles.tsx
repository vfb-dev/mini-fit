import { getExercisesHistory } from "@/services/exercises";
import { ExerciseTile } from "./ExerciseTile";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { CreateExerciseModal } from "@/components/CreateExerciseModal";
import { EditExerciseModal } from "@/components/EditExerciseModal";

type Exercise = {
  id: number;
  name: string;
  date: string;
  reps: number;
  weight: number;
};

type ExerciseGroup = {
  group_id: string;
  name: string;
  date: string;
  sets: number;
  exercises: Exercise[];
};

type ExercisesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExerciseGroup[];
};

export function Tiles() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const { data, isLoading } = useQuery<ExercisesResponse>({
    queryKey: ["history"],
    queryFn: () => getExercisesHistory(),
    placeholderData: (previousData) => previousData,
  });

  const paginationInfo = {
    count: data?.count ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };

  const exercises = data?.results ?? [];

  return (
    <>
      <CreateExerciseModal />
      <EditExerciseModal selectedExercise={selectedExercise} />

      <div className="flex flex-col gap-2">
        <div className="flex">
          <h3 className="text-lg font-semibold">History</h3>
        </div>
        {exercises.map((exercise) => (
          <ExerciseTile
            key={exercise.group_id}
            exercise={exercise}
            handleSelectedExercise={setSelectedExercise}
          />
        ))}
      </div>
    </>
  );
}
