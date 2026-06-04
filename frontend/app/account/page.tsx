"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  KeyRound,
  Mail,
  Shield,
  User,
} from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { useAuthStore } from "@/store/authStore";

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(username?: string, email?: string) {
  const source = username || email || "MF";

  const parts = source.split(/[\s@._-]+/).filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "MF"
  );
}

export default function AccountPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        {/* Hero */}
        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="h-16 bg-linear-to-r from-sky-100 via-sky-200 to-blue-300" />

          <div className="px-6 pb-6">
            <div className="-mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-20 items-center justify-center rounded-3xl border-4 border-white bg-zinc-950 text-2xl font-bold text-white shadow-lg">
                  {getInitials(user?.username, user?.email)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-zinc-950">
                      {user?.username}
                    </h1>

                    {user?.is_verified && (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    )}
                  </div>

                  <p className="mt-2 text-zinc-500">Welcome back to MiniFit</p>

                  <p className="mt-1 text-sm text-zinc-400">
                    Member since {formatDate(user?.date_joined)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Overview */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<User className="size-4" />}
            title="Username"
            value={user?.username || "Not available"}
          />

          <InfoCard
            icon={<Mail className="size-4" />}
            title="Email"
            value={user?.email || "Not available"}
          />

          <InfoCard
            icon={<CalendarDays className="size-4" />}
            title="Joined"
            value={formatDate(user?.date_joined)}
          />
        </div>

        {/* Security */}
        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Shield className="size-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-zinc-50 p-4">
              <p className="mb-1 text-sm text-zinc-500">Email Verification</p>

              {user?.is_verified ? (
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  Verified
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                  Pending Verification
                </span>
              )}
            </div>

            <div className="rounded-2xl border bg-zinc-50 p-4">
              <p className="mb-1 text-sm text-zinc-500">Password</p>

              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                Protected
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-950">
            Account Actions
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <ActionCard
              href="/forgot-password"
              icon={<KeyRound className="size-5" />}
              title="Reset Password"
              description="Update your account password."
            />

            <ActionCard
              href="/"
              icon={<ArrowUpRight className="size-5" />}
              title="Workout Dashboard"
              description="Return to your workout overview."
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>

      <p className="truncate text-base font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-zinc-100">
        {icon}
      </div>

      <h3 className="font-semibold text-zinc-950">{title}</h3>

      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </Link>
  );
}
