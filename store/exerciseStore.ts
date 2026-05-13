import { create } from "zustand";

type Exercise = {
  id: number;
  date: string;
  name: string;
  reps: number;
  weight: number;
};

type ExerciseStore = {
  exercises: Exercise[];
  selectedExercise: Exercise | null;

  setExercises: (exercises: Exercise[]) => void;
  setSelectedExercise: (exercise: Exercise) => void;
};

export const useExerciseStore = create<ExerciseStore>((set) => ({
  exercises: [],
  selectedExercise: null,

  setExercises: (exercises) => set({ exercises: exercises }),
  setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),
}));
