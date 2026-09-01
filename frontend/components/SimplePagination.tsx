"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SimplePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
};

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: SimplePaginationProps) {
  const pageCount = Math.max(totalPages, 1);
  const page = Math.min(Math.max(currentPage, 1), pageCount);

  const canGoPrevious = page > 1;
  const canGoNext = page < pageCount;

  function goToPage(nextPage: number) {
    onPageChange(Math.min(Math.max(nextPage, 1), pageCount));
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex w-full items-center justify-center gap-2", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer"
        disabled={!canGoPrevious}
        onClick={() => goToPage(page - 1)}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">{previousLabel}</span>
      </Button>

      <span
        className="min-w-16 text-center text-sm font-medium text-zinc-600"
        aria-live="polite"
      >
        {page} / {pageCount}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer"
        disabled={!canGoNext}
        onClick={() => goToPage(page + 1)}
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
