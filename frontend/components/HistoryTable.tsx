"use client";

import { useState } from "react";
import { MoreHorizontal, NotebookPen } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { getExercises, deleteExercise } from "@/services/exercises";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

type Exercise = {
  id: number;
  date: string;
  formatted_date: string;
  name: string;
  reps: number;
  weight: number;
};

type ExercisesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Exercise[];
};

const PAGE_SIZE = 10;

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function HistoryTable() {
  const queryClient = useQueryClient();
  const { handleCreateModal, handleEditModal } = useModalStore();
  const { language } = useLanguageStore();
  const t = translations[language].dashboard.history;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const { data, isLoading } = useQuery<ExercisesResponse>({
    queryKey: ["exercises", currentPage],
    queryFn: () => getExercises(currentPage),
    placeholderData: (previousData) => previousData,
  });

  const exercises = data?.results ?? [];

  const paginationInfo = {
    count: data?.count ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };

  const totalPages = Math.ceil(paginationInfo.count / PAGE_SIZE);

  const deleteMutation = useMutation({
    mutationFn: deleteExercise,

    onSuccess: async () => {
      const isLastItemOnPage = exercises.length === 1;

      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

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
    },
  });

  if (isLoading) {
    return <div>{t.loading}</div>;
  }

  return (
    <>
      <CreateExerciseModal />
      <EditExerciseModal selectedExercise={selectedExercise} />

      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">{t.title}</h3>

        <Button
          className="cursor-pointer gap-2"
          onClick={() => handleCreateModal(true)}
        >
          <NotebookPen className="size-4" />
          {t.newEntry}
        </Button>
      </div>

      <Table className="mb-4">
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">{t.date}</TableHead>

            <TableHead className="font-bold">{t.exercise}</TableHead>

            <TableHead className="font-bold">{t.reps}</TableHead>

            <TableHead className="font-bold">{t.weight}</TableHead>

            <TableHead className="font-bold text-right">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {exercises.length ? (
            exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell>{exercise.formatted_date}</TableCell>

                <TableCell>{toTitleCase(exercise.name)}</TableCell>

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
                        {t.edit}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="cursor-pointer"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(exercise.id)}
                      >
                        {t.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                {t.empty}
              </TableCell>
            </TableRow>
          )}
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
