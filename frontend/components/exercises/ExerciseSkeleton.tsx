export function ExerciseSkeleton() {
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
