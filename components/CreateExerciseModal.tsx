"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useModalStore } from "@/store/modalStore";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { createExercise } from "@/api/exercises";

const schema = z.object({
  name: z.string().min(1, "Required"),
  reps: z.number().min(1, "Minimum 1 rep"),
  weight: z.number().min(0, "Must be positive"),
});

type FormData = z.infer<typeof schema>;

type CreateModalProps = {
  currentPage: number;
  loadExercises: (page: number) => void;
};

export function CreateExerciseModal({
  currentPage,
  loadExercises,
}: CreateModalProps) {
  const { createModal, handleCreateModal } = useModalStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(formData: FormData) {
    await createExercise(formData);

    loadExercises(currentPage);

    reset();
    handleCreateModal(false);
  }

  if (!createModal) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => handleCreateModal(false)}
      ></div>

      {/* Card */}
      <div className="w-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-100 p-4 md:p-0">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="mb-2">Register your workout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
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
                Add Exercise
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
