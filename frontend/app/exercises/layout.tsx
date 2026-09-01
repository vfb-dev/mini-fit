import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exercises",
  description: "Manage exercises and body-part metadata",
};

export default function ExercisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
