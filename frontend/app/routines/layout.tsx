import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Routines",
  description: "Manage workout routine templates",
};

export default function RoutinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
