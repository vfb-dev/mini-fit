"use client";

import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({
  collapsed = false,
  className = "",
}: BrandLogoProps) {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div
      className={`group flex items-center transition-all duration-500 ${
        collapsed ? "justify-center" : "gap-3"
      } ${className}`}
    >
      {/* Logo */}
      <div
        className={`
          flex h-12 w-12 shrink-0 items-center justify-center
          rounded-2xl
          bg-linear-to-br from-black to-zinc-700
          text-lg font-black text-white
          shadow-lg
          transition-all duration-500
          animate-[pulseLogo_3s_ease-in-out_infinite]
          group-hover:scale-105
          group-hover:shadow-2xl
        `}
      >
        MF
      </div>

      {/* Text */}
      <div
        className={`
          overflow-hidden transition-all duration-500
          ${collapsed ? "max-w-0 opacity-0" : "max-w-35 opacity-100"}
        `}
      >
        <h1
          className={`
            whitespace-nowrap text-lg font-bold tracking-tight
            transition-all duration-500
            ${collapsed ? "-translate-x-4" : "translate-x-0"}
          `}
        >
          MiniFit
        </h1>

        <p
          className={`
            whitespace-nowrap text-xs text-zinc-500
            transition-all duration-500
            ${collapsed ? "-translate-x-4" : "translate-x-0"}
          `}
        >
          {t.brand.tagline}
        </p>
      </div>
    </div>
  );
}
