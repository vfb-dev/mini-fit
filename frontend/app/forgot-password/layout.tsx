import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Enter your email address to receive a password reset link",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
