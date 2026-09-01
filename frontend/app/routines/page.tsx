"use client";

import Link from "next/link";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useMemo,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ClipboardList,
  Dumbbell,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { useLanguageStore, type Language } from "@/store/languageStore";
import { getExerciseOptions, type Exercise } from "@/services/exercises";
import {
  createRoutine,
  deleteRoutine,
  getRoutines,
  updateRoutine,
  type RoutineItemPayload,
  type RoutinePayload,
  type RoutinesResponse,
  type WorkoutRoutine,
} from "@/services/routines";

const PAGE_SIZE = 9;
const EMPTY_FORM: RoutinePayload = {
  name: "",
  description: "",
  items: [],
};

type RoutinePageTranslation =
  (typeof translations)[keyof typeof translations]["routinePage"];
type PaginationItemValue = number | "start-ellipsis" | "end-ellipsis";

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItemValue[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    start = 2;
    end = 4;
  }

  if (currentPage >= totalPages - 2) {
    start = totalPages - 3;
    end = totalPages - 1;
  }

  const pages: PaginationItemValue[] = [1];

  if (start > 2) {
    pages.push("start-ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("end-ellipsis");
  }

  pages.push(totalPages);

  return pages;
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

export default function RoutinesPage() {
  const queryClient = useQueryClient();
  const { language } = useLanguageStore();
  const t = translations[language].routinePage;

  const [currentPage, setCurrentPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(
    null,
  );
  const [form, setForm] = useState<RoutinePayload>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const search = userSearch.trim();

  const { data, isLoading } = useQuery<RoutinesResponse>({
    queryKey: ["routines", currentPage, search],
    queryFn: () =>
      getRoutines({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search,
      }),
    placeholderData: (previousData) => previousData,
  });

  const { data: exerciseOptions = [], isLoading: exerciseOptionsLoading } =
    useQuery<Exercise[]>({
      queryKey: ["exercise_options"],
      queryFn: getExerciseOptions,
    });

  const routines = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const hasSearch = search.length > 0;
  const firstResult = totalCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(currentPage * PAGE_SIZE, totalCount);

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

  const createMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: async () => {
      await invalidateRoutineQueries(queryClient);
      resetForm();
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : t.saveError);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      routineData,
    }: {
      id: number;
      routineData: RoutinePayload;
    }) => updateRoutine(id, routineData),
    onSuccess: async () => {
      await invalidateRoutineQueries(queryClient);
      resetForm();
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : t.saveError);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: async () => {
      setFormError("");

      const isLastItemOnPage = routines.length === 1;

      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      await invalidateRoutineQueries(queryClient);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : t.deleteError);
    },
  });

  const savePending = createMutation.isPending || updateMutation.isPending;

  async function invalidateRoutineQueries(client: typeof queryClient) {
    await client.invalidateQueries({ queryKey: ["routines"] });
  }

  function resetForm() {
    setEditingRoutine(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setRoutineModalOpen(false);
  }

  function handleCreateClick() {
    setEditingRoutine(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setRoutineModalOpen(true);
  }

  function handleEdit(routine: WorkoutRoutine) {
    setEditingRoutine(routine);
    setForm({
      name: routine.name,
      description: routine.description ?? "",
      items: routine.items.map((item, index) => ({
        exercise: item.exercise,
        target_sets: item.target_sets,
        target_reps: item.target_reps,
        order: index,
      })),
    });
    setFormError("");
    setRoutineModalOpen(true);
  }

  function handleSearchChange(value: string) {
    setUserSearch(value);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

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
    setFormError("");

    const name = form.name.trim();

    if (!name) {
      setFormError(t.nameRequired);
      return;
    }

    if (!form.items.length) {
      setFormError(t.itemsRequired);
      return;
    }

    const invalidTargetSets = form.items.some((item) => item.target_sets < 1);
    const invalidTargetReps = form.items.some(
      (item) => item.target_reps !== null && item.target_reps < 1,
    );

    if (invalidTargetSets) {
      setFormError(t.targetSetsRequired);
      return;
    }

    if (invalidTargetReps) {
      setFormError(t.targetRepsRequired);
      return;
    }

    const routineData = {
      name,
      description: form.description.trim(),
      items: form.items.map((item, order) => ({
        exercise: item.exercise,
        target_sets: item.target_sets,
        target_reps: item.target_reps,
        order,
      })),
    };

    if (editingRoutine) {
      updateMutation.mutate({
        id: editingRoutine.id,
        routineData,
      });
      return;
    }

    createMutation.mutate(routineData);
  }

  return (
    <ProtectedRoute>
      <div className="w-full max-w-7xl px-6 py-8 md:py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Button asChild variant="ghost" className="mb-3 -ml-2 gap-2">
              <Link href="/">
                <ArrowLeft className="size-4" />
                {t.backToDashboard}
              </Link>
            </Button>

            <h1 className="text-2xl font-bold tracking-normal text-zinc-950 md:text-3xl">
              {t.title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {t.description}
            </p>
          </div>

          <Button
            type="button"
            className="hidden h-10 w-full cursor-pointer rounded-xl bg-zinc-950 px-4 font-semibold text-white hover:bg-zinc-800 md:flex md:w-auto"
            onClick={handleCreateClick}
          >
            <ClipboardList className="size-4" />
            {t.createTitle}
          </Button>

          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl md:hidden"
            onClick={handleCreateClick}
          >
            <ClipboardList className="size-6" />
          </Button>
        </div>

        <RoutineFormModal
          availableExercises={availableExercises}
          editingRoutine={editingRoutine}
          exerciseById={exerciseById}
          exerciseOptionsLoading={exerciseOptionsLoading}
          form={form}
          formError={formError}
          language={language}
          open={routineModalOpen}
          savePending={savePending}
          setForm={setForm}
          t={t}
          onAddExercise={handleAddExercise}
          onClose={resetForm}
          onItemChange={handleItemChange}
          onMoveItem={handleMoveItem}
          onRemoveItem={handleRemoveItem}
          onSubmit={handleSubmit}
        />

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                {t.libraryTitle}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {t.libraryDescription}
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="routine-library-search"
                type="text"
                value={userSearch}
                placeholder={t.searchPlaceholder}
                className="h-10 rounded-xl bg-white pl-10 pr-10"
                onChange={(event) => handleSearchChange(event.target.value)}
              />
              {userSearch && (
                <button
                  type="button"
                  aria-label={t.clearSearch}
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                  onClick={() => handleSearchChange("")}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {formError && !routineModalOpen && (
            <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}

          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <RoutineSkeleton />
              <RoutineSkeleton />
              <RoutineSkeleton />
              <RoutineSkeleton />
              <RoutineSkeleton />
              <RoutineSkeleton />
            </div>
          ) : routines.length ? (
            <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
              {routines.map((routine) => (
                <article
                  key={routine.id}
                  className="rounded-xl border border-zinc-200 p-3 sm:p-4"
                >
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
                            {routine.exercise_count ?? routine.items.length}{" "}
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
                        {routine.items.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 sm:px-3 sm:py-1 sm:text-xs"
                          >
                            {toTitleCase(item.exercise_name)}
                          </span>
                        ))}

                        {routine.items.length > 3 && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100 sm:px-3 sm:py-1 sm:text-xs">
                            +{routine.items.length - 3}
                          </span>
                        )}
                      </div>

                      {routine.items[0] && (
                        <p className="mt-3 hidden text-xs text-zinc-400 sm:block">
                          {t.startsWith}{" "}
                          {toTitleCase(routine.items[0].exercise_name)} -{" "}
                          {formatTarget(
                            routine.items[0].target_sets,
                            routine.items[0].target_reps,
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
                        onClick={() => handleEdit(routine)}
                      >
                        <Pencil className="size-3.5 sm:size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="size-7 cursor-pointer sm:size-8"
                        aria-label={t.delete}
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(routine.id)}
                      >
                        <Trash2 className="size-3.5 sm:size-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
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
          )}

          {totalCount > 0 && (
            <div className="mt-5 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="w-full text-sm text-zinc-500">
                {t.showing} {firstResult}-{lastResult} {t.of} {totalCount}
              </p>

              <Pagination className="mx-0 justify-end overflow-x-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text={t.previous}
                      aria-disabled={!data?.previous}
                      className={
                        !data?.previous
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                    />
                  </PaginationItem>

                  {paginationItems.map((item) => {
                    if (typeof item !== "number") {
                      return (
                        <PaginationItem key={item}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          className="cursor-pointer"
                          isActive={currentPage === item}
                          onClick={(event) => {
                            event.preventDefault();
                            handlePageChange(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text={t.next}
                      aria-disabled={!data?.next}
                      className={
                        !data?.next
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}

type RoutineFormModalProps = {
  availableExercises: Exercise[];
  editingRoutine: WorkoutRoutine | null;
  exerciseById: Map<number, Exercise>;
  exerciseOptionsLoading: boolean;
  form: RoutinePayload;
  formError: string;
  language: Language;
  open: boolean;
  savePending: boolean;
  setForm: Dispatch<SetStateAction<RoutinePayload>>;
  t: RoutinePageTranslation;
  onAddExercise: (value: string) => void;
  onClose: () => void;
  onItemChange: (index: number, updates: Partial<RoutineItemPayload>) => void;
  onMoveItem: (index: number, direction: -1 | 1) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function RoutineFormModal({
  availableExercises,
  editingRoutine,
  exerciseById,
  exerciseOptionsLoading,
  form,
  formError,
  language,
  open,
  savePending,
  setForm,
  t,
  onAddExercise,
  onClose,
  onItemChange,
  onMoveItem,
  onRemoveItem,
  onSubmit,
}: RoutineFormModalProps) {
  if (!open) return null;

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
          <form onSubmit={onSubmit} className="space-y-5">
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
                    onValueChange={onAddExercise}
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
                              onClick={() => onMoveItem(index, -1)}
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
                              onClick={() => onMoveItem(index, 1)}
                            >
                              <ArrowDown className="size-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={t.removeExercise}
                              onClick={() => onRemoveItem(index)}
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
                                onItemChange(index, {
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
                                onItemChange(index, {
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

            {formError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {formError}
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

function RoutineSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="size-8 rounded-lg bg-zinc-200 sm:size-10 sm:rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 rounded bg-zinc-200" />
          <div className="h-3 w-24 rounded bg-zinc-200" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-zinc-200" />
        <div className="h-3 w-2/3 rounded bg-zinc-200" />
      </div>
      <div className="mt-3 flex gap-1.5 sm:gap-2">
        <div className="h-5 w-20 rounded-full bg-zinc-200 sm:h-6 sm:w-24" />
        <div className="h-5 w-16 rounded-full bg-zinc-200 sm:h-6 sm:w-20" />
      </div>
    </div>
  );
}
