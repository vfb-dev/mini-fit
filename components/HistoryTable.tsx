"use client";

import { useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { useModalStore } from "@/store/modalStore";
import { useExerciseStore } from "@/store/exerciseStore";

import { getExercises, deleteExercise } from "@/api/exercises";

export function HistoryTable() {
  const { handleCreateModal, handleEditModal } = useModalStore();
  const { exercises, setExercises, setSelectedExercise } = useExerciseStore();

  useEffect(() => {
    async function loadExercises(): Promise<void> {
      const data = await getExercises();
      setExercises(data);
    }

    loadExercises();
  }, [setExercises]);

  return (
    <>
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-semibold">History</h3>
        <Button
          className="cursor-pointer"
          onClick={() => handleCreateModal(true)}
        >
          Add Exercise
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Exercise</TableHead>
            <TableHead className="font-bold">Reps</TableHead>
            <TableHead className="font-bold">Weigth</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((exercise) => (
            <TableRow key={exercise.id}>
              <TableCell>
                {new Date(exercise.date).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>{exercise.name}</TableCell>
              <TableCell>{exercise.reps}</TableCell>
              <TableCell>{exercise.weight}</TableCell>
              <TableCell className="text-right ">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer"
                    >
                      <MoreHorizontal />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedExercise(exercise);
                        handleEditModal(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      variant="destructive"
                      onClick={async () => {
                        await deleteExercise(exercise.id);

                        const data = await getExercises();
                        setExercises(data);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
