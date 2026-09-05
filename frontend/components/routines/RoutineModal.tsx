"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Dumbbell,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBodyPartLabel } from "@/lib/bodyParts";
import { translations } from "@/lib/translations";
import { getExerciseOptions, type Exercise } from "@/services/exercises";
import {
  type RoutineItemPayload,
  type RoutinePayload,
  type WorkoutRoutine,
} from "@/services/routines";
import { useLanguageStore } from "@/store/languageStore";

const EMPTY_FORM: RoutinePayload = {
  name: "",
  description: "",
  items: [],
};

type RoutineModalProps = {
  editingRoutine: WorkoutRoutine | null;
  formError: string;
  savePending: boolean;
  onClose: () => void;
  onSubmit: (routineData: RoutinePayload) => void;
};

function getInitialForm(editingRoutine: WorkoutRoutine | null): RoutinePayload {
  if (!editingRoutine) return EMPTY_FORM;

  return {
    name: editingRoutine.name,
    description: editingRoutine.description ?? "",
    items: editingRoutine.items.map((item, index) => ({
      exercise: item.exercise,
      target_sets: item.target_sets,
      target_reps: item.target_reps,
      order: index,
    })),
  };
}

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function RoutineModal({
  editingRoutine,
  formError,
  savePending,
  onClose,
  onSubmit,
}: RoutineModalProps) {
  const { language } = useLanguageStore();
  const t = translations[language].routinePage;

  const [form, setForm] = useState<RoutinePayload>(() =>
    getInitialForm(editingRoutine),
  );
  const [localError, setLocalError] = useState("");

  const { data: exerciseOptions = [], isLoading: exerciseOptionsLoading } =
    useQuery<Exercise[]>({
      queryKey: ["exercise_options"],
      queryFn: getExerciseOptions,
    });

  const exerciseById = useMemo(
    () =>
      new Map(
        exerciseOptions.map((exercise) => {
          return [exercise.id, exercise];
        }),
      ),
    [exerciseOptions],
  );

  const availableExercises = useMemo(
    () =>
      exerciseOptions.filter((exercise) => {
        return !form.items.some((item) => item.exercise === exercise.id);
      }),
    [exerciseOptions, form.items],
  );

  function handleAddExercise(value: string) {
    const exerciseId = Number(value);

    if (!exerciseId || form.items.some((item) => item.exercise === exerciseId)) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          exercise: exerciseId,
          order: previous.items.length,
          target_sets: 3,
          target_reps: null,
        },
      ],
    }));
  }

  function handleItemChange(
    index: number,
    updates: Partial<RoutineItemPayload>,
  ) {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    }));
  }

  function handleRemoveItem(index: number) {
    setForm((previous) => ({
      ...previous,
      items: previous.items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, order) => ({ ...item, order })),
    }));
  }

  function handleMoveItem(index: number, direction: -1 | 1) {
    setForm((previous) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= previous.items.length) {
        return previous;
      }

      const items = [...previous.items];
      const item = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = item;

      return {
        ...previous,
        items: items.map((routineItem, order) => ({ ...routineItem, order })),
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    const name = form.name.trim();

    if (!name) {
      setLocalError(t.nameRequired);
      return;
    }

    if (!form.items.length) {
      setLocalError(t.itemsRequired);
      return;
    }

    const invalidTargetSets = form.items.some((item) => item.target_sets < 1);
    const invalidTargetReps = form.items.some(
      (item) => item.target_reps !== null && item.target_reps < 1,
    );

    if (invalidTargetSets) {
      setLocalError(t.targetSetsRequired);
      return;
    }

    if (invalidTargetReps) {
      setLocalError(t.targetRepsRequired);
      return;
    }

    onSubmit({
      name,
      description: form.description.trim(),
      items: form.items.map((item, order) => ({
        exercise: item.exercise,
        target_sets: item.target_sets,
        target_reps: item.target_reps,
        order,
      })),
    });
  }

  const visibleError = localError || formError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-form-title"
        className="flex max-h-screen w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl rounded-b-none border border-zinc-200 bg-white shadow-2xl ring-1 ring-black/5 sm:max-h-[calc(100vh-4rem)] sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="routine-form-title"
                className="text-xl font-semibold tracking-normal text-zinc-950"
              >
                {editingRoutine ? t.editTitle : t.createTitle}
              </h2>
              <p className="mt-1 text-sm leading-5 text-zinc-500">
                {editingRoutine ? t.editDescription : t.createDescription}
              </p>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="cursor-pointer rounded-full"
              aria-label={t.closeModal}
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="routine-name">{t.name}</Label>
              <Input
                id="routine-name"
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder={t.namePlaceholder}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="routine-description">{t.notes}</Label>
              <textarea
                id="routine-description"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder={t.notesPlaceholder}
                className="min-h-24 w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Label htmlFor="routine-exercise">{t.exercises}</Label>
                  <p className="mt-1 text-xs text-zinc-500">
                    {t.exercisesDescription}
                  </p>
                </div>

                <div className="w-full sm:max-w-xs">
                  <Select
                    value="none"
                    disabled={
                      exerciseOptionsLoading || availableExercises.length === 0
                    }
                    onValueChange={handleAddExercise}
                  >
                    <SelectTrigger
                      id="routine-exercise"
                      className="h-11 w-full cursor-pointer rounded-xl"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none" disabled>
                          {exerciseOptionsLoading
                            ? t.loadingExercises
                            : t.addExercisePlaceholder}
                        </SelectItem>
                        {availableExercises.map((exercise) => (
                          <SelectItem
                            key={exercise.id}
                            value={String(exercise.id)}
                          >
                            {toTitleCase(exercise.name)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.items.length ? (
                <div className="space-y-3">
                  {form.items.map((item, index) => {
                    const exercise = exerciseById.get(item.exercise);

                    return (
                      <div
                        key={item.exercise}
                        className="rounded-xl border border-zinc-200 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-100">
                            <Dumbbell className="size-4 text-zinc-700" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-zinc-950">
                              {toTitleCase(exercise?.name ?? t.unknownExercise)}
                            </h3>
                            <p className="text-xs text-zinc-500">
                              {exercise?.primary_body_part
                                ? getBodyPartLabel(
                                    exercise.primary_body_part,
                                    language,
                                  )
                                : t.noPrimary}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer"
                              aria-label={t.moveUp}
                              disabled={index === 0}
                              onClick={() => handleMoveItem(index, -1)}
                            >
                              <ArrowUp className="size-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer"
                              aria-label={t.moveDown}
                              disabled={index === form.items.length - 1}
                              onClick={() => handleMoveItem(index, 1)}
                            >
                              <ArrowDown className="size-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={t.removeExercise}
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor={`routine-target-sets-${item.exercise}`}
                              className="text-xs"
                            >
                              {t.targetSets}
                            </Label>
                            <Input
                              id={`routine-target-sets-${item.exercise}`}
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={item.target_sets}
                              className="h-10 rounded-xl"
                              onChange={(event) =>
                                handleItemChange(index, {
                                  target_sets: parsePositiveInteger(
                                    event.target.value,
                                  ),
                                })
                              }
                            />
                          </div>

                          <div className="grid gap-1.5">
                            <Label
                              htmlFor={`routine-target-reps-${item.exercise}`}
                              className="text-xs"
                            >
                              {t.targetReps}
                            </Label>
                            <Input
                              id={`routine-target-reps-${item.exercise}`}
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={item.target_reps ?? ""}
                              placeholder={t.optionalRepsPlaceholder}
                              className="h-10 rounded-xl"
                              onChange={(event) =>
                                handleItemChange(index, {
                                  target_reps: event.target.value
                                    ? parsePositiveInteger(event.target.value)
                                    : null,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-zinc-50 p-6 text-center">
                  <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-white shadow-sm">
                    <Dumbbell className="size-4 text-zinc-500" />
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-950">
                    {t.noRoutineExercisesTitle}
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-500">
                    {t.noRoutineExercisesDescription}
                  </p>

                  {!exerciseOptionsLoading && availableExercises.length === 0 && (
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      className="mt-4 h-9 cursor-pointer rounded-xl px-3"
                    >
                      <Link href="/exercises">{t.manageExercises}</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {visibleError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {visibleError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-10 cursor-pointer rounded-xl px-4"
                onClick={onClose}
              >
                {editingRoutine ? t.cancelEdit : t.cancel}
              </Button>

              <Button
                type="submit"
                disabled={savePending}
                className="h-10 cursor-pointer rounded-xl bg-zinc-950 px-4 font-semibold text-white hover:bg-zinc-800"
              >
                {savePending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editingRoutine ? (
                  <Pencil className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {editingRoutine ? t.saveChanges : t.createRoutine}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
