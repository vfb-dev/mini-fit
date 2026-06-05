import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "Your profile, security, and account settings",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
