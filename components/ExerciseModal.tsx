"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useModalStore } from "@/store/modalStore";

export function ExerciseModal() {
  const { isOpen, handleModal } = useModalStore();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => handleModal(false)}
      ></div>

      {/* Card */}
      <div className="w-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-100 p-4 md:p-0">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="mb-2">Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-4">
                {/* Date */}
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required />
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
                    required
                  />
                </div>

                {/* Sets */}
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="sets">Sets</Label>
                  </div>
                  <Input id="sets" type="number" placeholder="4" required />
                </div>

                {/* Sets */}
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="weigth">Weigth</Label>
                  </div>
                  <Input id="weigth" type="number" placeholder="20" required />
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
