import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Email",
  description: "Verify your email address to activate your account",
};

export default function CheckEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
