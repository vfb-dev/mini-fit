"use client";

import { CalendarClock, Dumbbell, Hash, Loader2, Scale, X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useModalStore } from "@/store/modalStore";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateExercise } from "@/services/exercises";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  date: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  reps: z.number().min(1, "Minimum 1 rep"),
  weight: z
    .number()
    .min(0, "Must be positive")
    .max(9999, "Maximum weight is 9999"),
});

type FormData = z.infer<typeof schema>;

type Exercise = {
  id: number;
  date: string;
  name: string;
  reps: number;
  weight: number;
};

type EditModalProps = {
  selectedExercise: Exercise | null;
};

type UpdateExerciseData = {
  id: number;
  exerciseData: FormData;
};

export function EditExerciseModal({ selectedExercise }: EditModalProps) {
  const { editModal, handleEditModal } = useModalStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: "",
      name: "",
      reps: 0,
      weight: 0,
    },
  });

  useEffect(() => {
    if (selectedExercise) {
      reset({
        name: selectedExercise.name,
        reps: selectedExercise.reps,
        weight: Number(selectedExercise.weight),

        // format for datetime-local input
        date: selectedExercise.date.slice(0, 16),
      });
    }
  }, [selectedExercise, reset]);

  const updateMutation = useMutation({
    mutationFn: ({ id, exerciseData }: UpdateExerciseData) =>
      updateExercise(id, exerciseData),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["exercises"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["unique_exercises"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["chart"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["stats_cards"],
      });

      reset();
      handleEditModal(false);
    },
  });

  async function onSubmit(formData: FormData) {
    if (!selectedExercise) return;

    updateMutation.mutate({
      id: selectedExercise.id,
      exerciseData: formData,
    });
  }

  if (!editModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={() => handleEditModal(false)}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-exercise-title"
        className="w-full max-w-md overflow-hidden rounded-t-3xl rounded-b-none border-zinc-200 bg-white shadow-2xl ring-1 ring-black/5 sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <CardHeader className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle
                id="edit-exercise-title"
                className="text-xl font-semibold tracking-normal text-zinc-950"
              >
                Edit workout
              </CardTitle>
              <p className="mt-1 text-sm leading-5 text-zinc-500">
                Update exercise details to keep your progress accurate.
              </p>
            </div>

            <button
              type="button"
              aria-label="Close modal"
              onClick={() => handleEditModal(false)}
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-white/80 text-zinc-500 shadow-sm ring-1 ring-zinc-200 transition hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <X className="size-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="date"
                  className="text-sm font-semibold text-zinc-800"
                >
                  Date
                </Label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="date"
                    type="datetime-local"
                    className="h-11 rounded-xl pl-10"
                    {...register("date")}
                  />
                </div>
                {errors.date && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="exercise"
                  className="text-sm font-semibold text-zinc-800"
                >
                  Exercise
                </Label>
                <div className="relative">
                  <Dumbbell className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="exercise"
                    type="text"
                    placeholder="Push Ups"
                    className="h-11 rounded-xl pl-10"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label
                    htmlFor="reps"
                    className="text-sm font-semibold text-zinc-800"
                  >
                    Reps
                  </Label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="reps"
                      type="number"
                      placeholder="12"
                      className="h-11 rounded-xl pl-10"
                      {...register("reps", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.reps && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.reps.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="weight"
                    className="text-sm font-semibold text-zinc-800"
                  >
                    Weight
                  </Label>
                  <div className="relative">
                    <Scale className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="weight"
                      type="number"
                      placeholder="20"
                      step="0.01"
                      max={9999}
                      className="h-11 rounded-xl pl-10"
                      {...register("weight", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.weight && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.weight.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 cursor-pointer rounded-xl px-5"
                onClick={() => handleEditModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-11 cursor-pointer rounded-xl bg-zinc-950 px-6 font-semibold text-white shadow-lg shadow-zinc-950/15 hover:bg-zinc-800"
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
