import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getExercisesHistory } from "@/services/exercises";
import { ExerciseTile } from "./ExerciseTile";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { CreateExerciseModal } from "@/components/CreateExerciseModal";
import { EditExerciseModal } from "@/components/EditExerciseModal";
import { useModalStore } from "@/store/modalStore";

type Exercise = {
  id: number;
  name: string;
  date: string;
  reps: number;
  weight: number;
};

type ExerciseGroup = {
  group_id: string;
  name: string;
  date: string;
  sets: number;
  exercises: Exercise[];
};

type ExercisesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExerciseGroup[];
};

function getNextHistoryPage(lastPage: ExercisesResponse) {
  if (!lastPage.next) return undefined;

  const nextUrl = new URL(lastPage.next, window.location.origin);
  const nextPage = Number(nextUrl.searchParams.get("page"));

  return Number.isNaN(nextPage) ? undefined : nextPage;
}

export function Tiles() {
  const { handleCreateModal } = useModalStore();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ExercisesResponse>({
      queryKey: ["history"],
      queryFn: ({ pageParam }) => getExercisesHistory(Number(pageParam)),
      initialPageParam: 1,
      getNextPageParam: getNextHistoryPage,
    });

  const exercises = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <CreateExerciseModal />
      <EditExerciseModal selectedExercise={selectedExercise} />

      <div className="flex flex-col gap-2">
        <div className="flex">
          <h3 className="text-lg font-semibold">History</h3>
        </div>
        {isLoading ? (
          <>
            <TileSkeleton />
            <TileSkeleton />
            <TileSkeleton />
          </>
        ) : (
          exercises.map((exercise) => (
            <ExerciseTile
              key={exercise.group_id}
              exercise={exercise}
              handleSelectedExercise={setSelectedExercise}
            />
          ))
        )}

        <div ref={loadMoreRef} className="space-y-2 py-2">
          {isFetchingNextPage ? (
            <>
              <TileSkeleton />
              <TileSkeleton />
            </>
          ) : null}
        </div>
      </div>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl"
        onClick={() => handleCreateModal(true)}
      >
        <NotebookPen className="size-6" />
      </Button>
    </>
  );
}

function TileSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-lg bg-white p-2 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-zinc-200" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-zinc-200" />
          <div className="h-3 w-20 rounded bg-zinc-200" />
        </div>

        <div className="h-7 w-7 rounded bg-zinc-200" />
        <div className="h-7 w-7 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}
