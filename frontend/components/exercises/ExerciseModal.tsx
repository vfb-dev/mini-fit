"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, X } from "lucide-react";

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
import { BODY_PART_OPTIONS } from "@/lib/bodyParts";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";
import type { Exercise, ExercisePayload } from "@/services/exercises";

const EMPTY_FORM: ExercisePayload = {
  name: "",
  primary_body_part: "",
  secondary_body_parts: [],
};

type ExerciseModalProps = {
  editingExercise: Exercise | null;
  formError: string;
  savePending: boolean;
  onClose: () => void;
  onSubmit: (exerciseData: ExercisePayload) => void;
};

function getInitialForm(editingExercise: Exercise | null): ExercisePayload {
  if (!editingExercise) return EMPTY_FORM;

  return {
    name: editingExercise.name,
    primary_body_part: editingExercise.primary_body_part ?? "",
    secondary_body_parts: editingExercise.secondary_body_parts ?? [],
  };
}

export function ExerciseModal({
  editingExercise,
  formError,
  savePending,
  onClose,
  onSubmit,
}: ExerciseModalProps) {
  const { language } = useLanguageStore();
  const t = translations[language].exercisePage;

  const [form, setForm] = useState<ExercisePayload>(() =>
    getInitialForm(editingExercise),
  );
  const [localError, setLocalError] = useState("");

  const selectedSecondaryBodyParts = useMemo(
    () =>
      form.secondary_body_parts.filter(
        (bodyPart) => bodyPart !== form.primary_body_part,
      ),
    [form.primary_body_part, form.secondary_body_parts],
  );

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    const name = form.name.trim();

    if (!name) {
      setLocalError(t.nameRequired);
      return;
    }

    onSubmit({
      name,
      primary_body_part: form.primary_body_part,
      secondary_body_parts: selectedSecondaryBodyParts,
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
                onValueChange={handlePrimaryBodyPartChange}
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
                          handleSecondaryBodyPartToggle(bodyPart.value)
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
