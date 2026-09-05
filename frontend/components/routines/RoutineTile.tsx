import { ClipboardList, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";
import type { WorkoutRoutine } from "@/services/routines";

type RoutinePageTranslation =
  (typeof translations)[keyof typeof translations]["routinePage"];

type RoutineTileProps = {
  deletePending: boolean;
  routine: WorkoutRoutine;
  onDelete: (id: number) => void;
  onEdit: (routine: WorkoutRoutine) => void;
};

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function formatTarget(
  targetSets: number,
  targetReps: number | null,
  t: RoutinePageTranslation,
) {
  const setsLabel = targetSets === 1 ? t.setSingular : t.setPlural;

  if (!targetReps) {
    return `${targetSets} ${setsLabel}`;
  }

  const repsLabel = targetReps === 1 ? t.repSingular : t.repPlural;

  return `${targetSets} ${setsLabel} x ${targetReps} ${repsLabel}`;
}

export function RoutineTile({
  deletePending,
  routine,
  onDelete,
  onEdit,
}: RoutineTileProps) {
  const { language } = useLanguageStore();
  const t = translations[language].routinePage;
  const routineItems = routine.items ?? [];

  return (
    <article className="rounded-xl border border-zinc-200 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-100 sm:size-10 sm:rounded-xl">
              <ClipboardList className="size-4 text-zinc-700 sm:size-5" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-zinc-950 sm:text-base">
                {toTitleCase(routine.name)}
              </h3>
              <p className="text-xs text-zinc-500 sm:text-sm">
                {routine.exercise_count ?? routineItems.length}{" "}
                {t.exercisesPlanned}
              </p>
            </div>
          </div>

          {routine.description && (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-zinc-500 sm:text-sm">
              {routine.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {routineItems.slice(0, 3).map((item) => (
              <span
                key={item.id}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 sm:px-3 sm:py-1 sm:text-xs"
              >
                {toTitleCase(item.exercise_name)}
              </span>
            ))}

            {routineItems.length > 3 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100 sm:px-3 sm:py-1 sm:text-xs">
                +{routineItems.length - 3}
              </span>
            )}
          </div>

          {routineItems[0] && (
            <p className="mt-3 hidden text-xs text-zinc-400 sm:block">
              {t.startsWith} {toTitleCase(routineItems[0].exercise_name)} -{" "}
              {formatTarget(
                routineItems[0].target_sets,
                routineItems[0].target_reps,
                t,
              )}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 cursor-pointer sm:size-8"
            aria-label={t.edit}
            onClick={() => onEdit(routine)}
          >
            <Pencil className="size-3.5 sm:size-4" />
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="size-7 cursor-pointer sm:size-8"
            aria-label={t.delete}
            disabled={deletePending}
            onClick={() => onDelete(routine.id)}
          >
            <Trash2 className="size-3.5 sm:size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
