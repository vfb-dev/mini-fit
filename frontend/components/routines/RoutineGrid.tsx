import { ClipboardList } from "lucide-react";

import { RoutineSkeleton } from "@/components/routines/RoutineSkeleton";
import { RoutineTile } from "@/components/routines/RoutineTile";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";
import type { WorkoutRoutine } from "@/services/routines";

type RoutineGridProps = {
  deletePending: boolean;
  hasSearch: boolean;
  isLoading: boolean;
  routines: WorkoutRoutine[];
  onDelete: (id: number) => void;
  onEdit: (routine: WorkoutRoutine) => void;
};

export function RoutineGrid({
  deletePending,
  hasSearch,
  isLoading,
  routines,
  onDelete,
  onEdit,
}: RoutineGridProps) {
  const { language } = useLanguageStore();
  const t = translations[language].routinePage;

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <RoutineSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!routines.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-zinc-50 p-8 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-white shadow-sm">
          <ClipboardList className="size-5 text-zinc-500" />
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
      {routines.map((routine) => (
        <RoutineTile
          key={routine.id}
          deletePending={deletePending}
          routine={routine}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
