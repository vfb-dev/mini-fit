import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import type { Language } from "@/store/languageStore";

type FlagIconProps = ComponentPropsWithoutRef<"svg"> & {
  language: Language;
};

export function FlagIcon({ language, className, ...props }: FlagIconProps) {
  if (language === "pt") {
    return (
      <svg
        viewBox="0 0 32 24"
        aria-hidden="true"
        className={cn("h-4 w-6 shrink-0 rounded-sm shadow-sm ring-1 ring-black/10", className)}
        {...props}
      >
        <rect width="32" height="24" fill="#009b3a" />
        <path d="M16 3 30 12 16 21 2 12z" fill="#ffdf00" />
        <circle cx="16" cy="12" r="5.2" fill="#002776" />
        <path
          d="M10.9 10.8c3.9-.7 7.4-.1 10.3 1.9"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 24"
      aria-hidden="true"
      className={cn("h-4 w-6 shrink-0 rounded-sm shadow-sm ring-1 ring-black/10", className)}
      {...props}
    >
      <rect width="32" height="24" fill="#fff" />
      {Array.from({ length: 7 }).map((_, index) => (
        <rect key={index} y={index * 3.69} width="32" height="1.85" fill="#b22234" />
      ))}
      <rect width="13.8" height="12.9" fill="#3c3b6e" />
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={1.4 + col * 2.2}
            cy={1.4 + row * 2.2}
            r="0.35"
            fill="#fff"
          />
        )),
      )}
    </svg>
  );
}
