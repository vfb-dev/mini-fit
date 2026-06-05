import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your account and start tracking your fitness journey",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
