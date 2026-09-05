import { Dumbbell } from "lucide-react";
import { ExerciseTile } from "@/components/exercises/ExerciseTile";
import { ExerciseSkeleton } from "@/components/exercises/ExerciseSkeleton";

import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";
import type { Exercise } from "@/services/exercises";

type ExerciseGridProps = {
  isLoading: boolean;
  hasSearch: boolean;
  exercises: Exercise[];
  deletePending: boolean;
  onDelete: (id: number) => void;
  onEdit: (exercise: Exercise) => void;
};

export function ExerciseGrid({
  exercises,
  isLoading,
  hasSearch,
  deletePending,
  onDelete,
  onEdit,
}: ExerciseGridProps) {
  const { language } = useLanguageStore();
  const t = translations[language].exercisePage;

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <ExerciseSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-zinc-50 p-8 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-white shadow-sm">
          <Dumbbell className="size-5 text-zinc-500" />
        </div>

        <h3 className="font-semibold text-zinc-950">
          {hasSearch ? t.noSearchResults : t.emptyTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          {hasSearch ? t.noSearchResultsDescription : t.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseTile
          key={exercise.id}
          deletePending={deletePending}
          exercise={exercise}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
