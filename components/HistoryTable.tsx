"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { CreateExerciseModal } from "@/components/CreateExerciseModal";
import { EditExerciseModal } from "@/components/EditExerciseModal";

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

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";

import { useModalStore } from "@/store/modalStore";
//import { useExerciseStore } from "@/store/exerciseStore";

import { getExercises, deleteExercise } from "@/api/exercises";

type PaginationInfo = {
  count: number;
  next: string | null;
  previous: string | null;
};

type Exercise = {
  id: number;
  date: string;
  name: string;
  reps: number;
  weight: number;
};

const PAGE_SIZE = 5;

export function HistoryTable() {
  const { handleCreateModal, handleEditModal } = useModalStore();

  //const { exercises, setExercises, setSelectedExercise } = useExerciseStore();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
  });

  const totalPages = Math.ceil(paginationInfo.count / PAGE_SIZE);

  async function loadExercises(page: number) {
    const { count, next, previous, results } = await getExercises(page);

    setPaginationInfo({ count, next, previous });
    setExercises(results);
  }

  async function handleDelete(id: number) {
    await deleteExercise(id);

    // if deleting the last item of the page
    // go back one page automatically
    const isLastItemOnPage = exercises.length === 1;

    const newPage =
      isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;

    setCurrentPage(newPage);

    await loadExercises(newPage);
  }

  useEffect(() => {
    async function loadExercises() {
      const { count, next, previous, results } =
        await getExercises(currentPage);

      setPaginationInfo({
        count,
        next,
        previous,
      });

      setExercises(results);
    }

    loadExercises();
  }, [currentPage, setExercises]);

  return (
    <>
      <CreateExerciseModal
        currentPage={currentPage}
        loadExercises={loadExercises}
      />
      <EditExerciseModal
        selectedExercise={selectedExercise}
        currentPage={currentPage}
        loadExercises={loadExercises}
      />

      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">History</h3>

        <Button
          className="cursor-pointer"
          onClick={() => handleCreateModal(true)}
        >
          Add Exercise
        </Button>
      </div>

      <Table className="mb-4">
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Date</TableHead>

            <TableHead className="font-bold">Exercise</TableHead>

            <TableHead className="font-bold">Reps</TableHead>

            <TableHead className="font-bold">Weight</TableHead>

            <TableHead className="font-bold text-right">Actions</TableHead>
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

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer"
                    >
                      <MoreHorizontal />
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
                      onClick={() => handleDelete(exercise.id)}
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

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={
                !paginationInfo.previous
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              onClick={() => setCurrentPage((prev) => prev - 1)}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            // beginning pages
            if (currentPage <= 4) {
              if (page <= 4 || page === totalPages) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              if (page === 5) {
                return (
                  <PaginationItem key="ellipsis">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return null;
            }

            // ending pages
            if (currentPage > totalPages - 4) {
              if (page === 1 || page >= totalPages - 3) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              if (page === 2) {
                return (
                  <PaginationItem key="ellipsis">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return null;
            }

            return null;
          })}

          <PaginationItem>
            <PaginationNext
              className={
                !paginationInfo.next
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              onClick={() => setCurrentPage((prev) => prev + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
