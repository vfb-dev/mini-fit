// store/languageStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "pt";

interface LanguageStore {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en",
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === "en" ? "pt" : "en",
        })),
      setLanguage: (language) => set({ language }),
    }),
    { name: "minifit-language" },
  ),
);
