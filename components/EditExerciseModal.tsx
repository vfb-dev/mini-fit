"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useModalStore } from "@/store/modalStore";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateExercise } from "@/api/exercises";

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
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => handleEditModal(false)}
      ></div>

      {/* Card */}
      <div className="w-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-100 p-4 md:p-0">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="mb-2">Edit Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                {/* Date */}
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>

                  <Input
                    id="date"
                    type="datetime-local"
                    {...register("date")}
                  />

                  {errors.date && (
                    <p className="text-sm text-red-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                {/* Exercise */}
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="exercise">Exercise</Label>
                  </div>

                  <Input
                    id="exercise"
                    type="text"
                    placeholder="Push Ups"
                    {...register("name")}
                  />

                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Sets */}
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="reps">Reps</Label>
                  </div>

                  <Input
                    id="reps"
                    type="number"
                    placeholder="12"
                    {...register("reps", {
                      valueAsNumber: true,
                    })}
                  />

                  {errors.reps && (
                    <p className="text-sm text-red-500">
                      {errors.reps.message}
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight</Label>

                  <Input
                    id="weight"
                    type="number"
                    placeholder="20"
                    step="0.01"
                    max={9999}
                    {...register("weight", {
                      valueAsNumber: true,
                    })}
                  />

                  {errors.weight && (
                    <p className="text-sm text-red-500">
                      {errors.weight.message}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full cursor-pointer mt-8 mb-4">
                Edit Exercise
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
