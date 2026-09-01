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
  ArrowLeft,
  Dumbbell,
  Loader2,
  Pencil,
  NotebookPen,
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
import {
  createExercise,
  deleteExercise,
  getExercises,
  updateExercise,
  type Exercise,
  type ExercisePayload,
  type ExercisesResponse,
} from "@/services/exercises";
import { BODY_PART_OPTIONS, getBodyPartLabel } from "@/lib/bodyParts";
import { translations } from "@/lib/translations";
import { useLanguageStore, type Language } from "@/store/languageStore";

const PAGE_SIZE = 9;
const EMPTY_FORM: ExercisePayload = {
  name: "",
  primary_body_part: "",
  secondary_body_parts: [],
};

type ExercisePageTranslation =
  (typeof translations)[keyof typeof translations]["exercisePage"];
type PaginationItemValue = number | "start-ellipsis" | "end-ellipsis";

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function formatLastLogged(
  value: string | null | undefined,
  language: Language,
  fallback: string,
) {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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

export default function ExercisesPage() {
  const queryClient = useQueryClient();
  const { language } = useLanguageStore();
  const t = translations[language].exercisePage;

  const [currentPage, setCurrentPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [form, setForm] = useState<ExercisePayload>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const search = userSearch.trim();

  const { data, isLoading } = useQuery<ExercisesResponse>({
    queryKey: ["exercises", currentPage, search],
    queryFn: () =>
      getExercises({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search,
      }),
    placeholderData: (previousData) => previousData,
  });

  const exercises = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const hasSearch = search.length > 0;
  const firstResult = totalCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(currentPage * PAGE_SIZE, totalCount);

  const createMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: async () => {
      await invalidateExerciseQueries(queryClient);
      resetForm();
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : t.saveError);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      exerciseData,
    }: {
      id: number;
      exerciseData: ExercisePayload;
    }) => updateExercise(id, exerciseData),
    onSuccess: async () => {
      await invalidateExerciseQueries(queryClient);
      resetForm();
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : t.saveError);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExercise,
    onSuccess: async () => {
      setFormError("");

      const isLastItemOnPage = exercises.length === 1;

      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      await invalidateExerciseQueries(queryClient);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : t.deleteError);
    },
  });

  const savePending = createMutation.isPending || updateMutation.isPending;

  const selectedSecondaryBodyParts = useMemo(
    () =>
      form.secondary_body_parts.filter(
        (bodyPart) => bodyPart !== form.primary_body_part,
      ),
    [form.primary_body_part, form.secondary_body_parts],
  );

  async function invalidateExerciseQueries(client: typeof queryClient) {
    await client.invalidateQueries({ queryKey: ["exercises"] });
    await client.invalidateQueries({ queryKey: ["exercise_options"] });
    await client.invalidateQueries({ queryKey: ["exercise_sets"] });
    await client.invalidateQueries({ queryKey: ["history"] });
    await client.invalidateQueries({ queryKey: ["chart"] });
  }

  function resetForm() {
    setEditingExercise(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setExerciseModalOpen(false);
  }

  function handlePrimaryBodyPartChange(value: string) {
    const bodyPart = value === "none" ? "" : value;

    setForm((previous) => ({
      ...previous,
      primary_body_part: bodyPart,
      secondary_body_parts: previous.secondary_body_parts.filter(
        (item) => item !== bodyPart,
      ),
    }));
  }

  function handleSecondaryBodyPartToggle(bodyPart: string) {
    if (bodyPart === form.primary_body_part) return;

    setForm((previous) => {
      const selected = previous.secondary_body_parts.includes(bodyPart);

      return {
        ...previous,
        secondary_body_parts: selected
          ? previous.secondary_body_parts.filter((item) => item !== bodyPart)
          : [...previous.secondary_body_parts, bodyPart],
      };
    });
  }

  function handleEdit(exercise: Exercise) {
    setEditingExercise(exercise);
    setForm({
      name: exercise.name,
      primary_body_part: exercise.primary_body_part ?? "",
      secondary_body_parts: exercise.secondary_body_parts ?? [],
    });
    setFormError("");
    setExerciseModalOpen(true);
  }

  function handleCreateClick() {
    setEditingExercise(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setExerciseModalOpen(true);
  }

  function handleSearchChange(value: string) {
    setUserSearch(value);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();

    if (!name) {
      setFormError(t.nameRequired);
      return;
    }

    const exerciseData = {
      name,
      primary_body_part: form.primary_body_part,
      secondary_body_parts: selectedSecondaryBodyParts,
    };

    if (editingExercise) {
      updateMutation.mutate({
        id: editingExercise.id,
        exerciseData,
      });
      return;
    }

    createMutation.mutate(exerciseData);
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
            className="hidden md:flex h-10 w-full cursor-pointer rounded-xl bg-zinc-950 px-4 font-semibold text-white hover:bg-zinc-800 md:w-auto"
            onClick={handleCreateClick}
          >
            <NotebookPen className="size-4" />
            {t.createTitle}
          </Button>

          <Button
            size="icon"
            className="md:hidden fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl"
            onClick={handleCreateClick}
          >
            <NotebookPen className="size-6" />
          </Button>
        </div>

        <ExerciseFormModal
          editingExercise={editingExercise}
          form={form}
          formError={formError}
          language={language}
          open={exerciseModalOpen}
          savePending={savePending}
          selectedSecondaryBodyParts={selectedSecondaryBodyParts}
          setForm={setForm}
          t={t}
          onClose={resetForm}
          onPrimaryBodyPartChange={handlePrimaryBodyPartChange}
          onSecondaryBodyPartToggle={handleSecondaryBodyPartToggle}
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
                id="exercise-library-search"
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

          {formError && !exerciseModalOpen && (
            <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}

          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ExerciseSkeleton />
              <ExerciseSkeleton />
              <ExerciseSkeleton />
              <ExerciseSkeleton />
              <ExerciseSkeleton />
              <ExerciseSkeleton />
              <ExerciseSkeleton />
              <ExerciseSkeleton />
              <ExerciseSkeleton />
            </div>
          ) : exercises.length ? (
            <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
              {exercises.map((exercise) => {
                const secondaryBodyParts = exercise.secondary_body_parts ?? [];

                return (
                  <article
                    key={exercise.id}
                    className="rounded-xl border border-zinc-200 p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-100 sm:size-10 sm:rounded-xl">
                            <Dumbbell className="size-4 text-zinc-700 sm:size-5" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-zinc-950 sm:text-base">
                              {toTitleCase(exercise.name)}
                            </h3>
                            <p className="text-xs text-zinc-500 sm:text-sm">
                              {exercise.set_count ?? 0} {t.setsLogged}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                          {exercise.primary_body_part ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 sm:px-3 sm:py-1 sm:text-xs">
                              {getBodyPartLabel(
                                exercise.primary_body_part,
                                language,
                              )}
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 sm:px-3 sm:py-1 sm:text-xs">
                              {t.noPrimary}
                            </span>
                          )}

                          {secondaryBodyParts.length > 0 && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100 sm:hidden">
                              +{secondaryBodyParts.length}
                            </span>
                          )}

                          {secondaryBodyParts.map((bodyPart) => (
                            <span
                              key={bodyPart}
                              className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100 sm:inline-flex"
                            >
                              {getBodyPartLabel(bodyPart, language)}
                            </span>
                          ))}
                        </div>

                        <p className="mt-3 hidden text-xs text-zinc-400 sm:block">
                          {t.lastLogged}{" "}
                          {formatLastLogged(
                            exercise.last_logged_at,
                            language,
                            t.neverLogged,
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1.5 sm:gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-7 cursor-pointer sm:size-8"
                          aria-label={t.edit}
                          onClick={() => handleEdit(exercise)}
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
                          onClick={() => deleteMutation.mutate(exercise.id)}
                        >
                          <Trash2 className="size-3.5 sm:size-4" />
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
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

type ExerciseFormModalProps = {
  editingExercise: Exercise | null;
  form: ExercisePayload;
  formError: string;
  language: Language;
  open: boolean;
  savePending: boolean;
  selectedSecondaryBodyParts: string[];
  setForm: Dispatch<SetStateAction<ExercisePayload>>;
  t: ExercisePageTranslation;
  onClose: () => void;
  onPrimaryBodyPartChange: (value: string) => void;
  onSecondaryBodyPartToggle: (bodyPart: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function ExerciseFormModal({
  editingExercise,
  form,
  formError,
  language,
  open,
  savePending,
  selectedSecondaryBodyParts,
  setForm,
  t,
  onClose,
  onPrimaryBodyPartChange,
  onSecondaryBodyPartToggle,
  onSubmit,
}: ExerciseFormModalProps) {
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
        aria-labelledby="exercise-form-title"
        className="w-full max-w-lg overflow-hidden rounded-t-3xl rounded-b-none border border-zinc-200 bg-white shadow-2xl ring-1 ring-black/5 sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="exercise-form-title"
                className="text-xl font-semibold tracking-normal text-zinc-950"
              >
                {editingExercise ? t.editTitle : t.createTitle}
              </h2>
              <p className="mt-1 text-sm leading-5 text-zinc-500">
                {editingExercise ? t.editDescription : t.createDescription}
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

        <div className="px-6 py-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="exercise-name">{t.name}</Label>
              <Input
                id="exercise-name"
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
              <Label htmlFor="primary-body-part">{t.primaryBodyPart}</Label>
              <Select
                value={form.primary_body_part || "none"}
                onValueChange={onPrimaryBodyPartChange}
              >
                <SelectTrigger
                  id="primary-body-part"
                  className="h-11 w-full cursor-pointer rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">{t.noPrimary}</SelectItem>
                    {BODY_PART_OPTIONS.map((bodyPart) => (
                      <SelectItem key={bodyPart.value} value={bodyPart.value}>
                        {bodyPart.label[language]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label>{t.secondaryBodyParts}</Label>
              <div className="grid grid-cols-2 gap-2">
                {BODY_PART_OPTIONS.map((bodyPart) => {
                  const disabled = bodyPart.value === form.primary_body_part;
                  const checked = selectedSecondaryBodyParts.includes(
                    bodyPart.value,
                  );

                  return (
                    <label
                      key={bodyPart.value}
                      className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                        checked
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={checked}
                        disabled={disabled}
                        onChange={() =>
                          onSecondaryBodyPartToggle(bodyPart.value)
                        }
                      />
                      <span className="min-w-0 truncate">
                        {bodyPart.label[language]}
                      </span>
                    </label>
                  );
                })}
              </div>
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
                {editingExercise ? t.cancelEdit : t.cancel}
              </Button>

              <Button
                type="submit"
                disabled={savePending}
                className="h-10 cursor-pointer rounded-xl bg-zinc-950 px-4 font-semibold text-white hover:bg-zinc-800"
              >
                {savePending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editingExercise ? (
                  <Pencil className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {editingExercise ? t.saveChanges : t.createExercise}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function ExerciseSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="size-8 rounded-lg bg-zinc-200 sm:size-10 sm:rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 rounded bg-zinc-200" />
          <div className="h-3 w-20 rounded bg-zinc-200" />
        </div>
      </div>
      <div className="mt-2 flex gap-1.5 sm:mt-4 sm:gap-2">
        <div className="h-5 w-16 rounded-full bg-zinc-200 sm:h-6 sm:w-20" />
        <div className="h-5 w-8 rounded-full bg-zinc-200 sm:h-6 sm:w-24" />
      </div>
    </div>
  );
}
