import type { Language } from "@/store/languageStore";

export const BODY_PART_OPTIONS = [
  { value: "chest", label: { en: "Chest", pt: "Peito" } },
  { value: "back", label: { en: "Back", pt: "Costas" } },
  { value: "shoulders", label: { en: "Shoulders", pt: "Ombros" } },
  { value: "biceps", label: { en: "Biceps", pt: "Biceps" } },
  { value: "triceps", label: { en: "Triceps", pt: "Triceps" } },
  { value: "legs", label: { en: "Legs", pt: "Pernas" } },
  { value: "glutes", label: { en: "Glutes", pt: "Gluteos" } },
  { value: "core", label: { en: "Core", pt: "Core" } },
  { value: "cardio", label: { en: "Cardio", pt: "Cardio" } },
  { value: "full_body", label: { en: "Full body", pt: "Corpo todo" } },
  { value: "other", label: { en: "Other", pt: "Outro" } },
] as const;

export type BodyPartValue = (typeof BODY_PART_OPTIONS)[number]["value"];

export function getBodyPartLabel(value: string, language: Language) {
  const option = BODY_PART_OPTIONS.find((bodyPart) => bodyPart.value === value);

  return option?.label[language] ?? value;
}
