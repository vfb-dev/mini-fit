"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type VerifyStatus = "loading" | "success" | "error";

const API_URL = "http://localhost:8000";

export default function VerifyEmailPage() {
  const params = useParams<{ uid: string; token: string }>();

  const uid = params.uid;
  const token = params.token;
  const hasInvalidLink = !uid || !token;

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (hasInvalidLink) return;

    let isMounted = true;

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${API_URL}/verify-email/${uid}/${token}/`,
          {
            method: "GET",
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.detail ?? "Could not verify your email.");
        }

        if (!isMounted) return;

        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
      } catch (error) {
        if (!isMounted) return;

        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying your email.",
        );
      }
    }

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [hasInvalidLink, uid, token]);

  const viewStatus: VerifyStatus = hasInvalidLink ? "error" : status;
  const viewMessage = hasInvalidLink
    ? "This verification link is invalid."
    : message;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-zinc-900">
          {viewStatus === "loading" && "Verifying email"}
          {viewStatus === "success" && "Email verified"}
          {viewStatus === "error" && "Verification failed"}
        </h1>

        <p className="mt-3 text-sm text-zinc-500">{viewMessage}</p>

        {viewStatus !== "loading" && (
          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Go to login
          </Link>
        )}
      </section>
    </main>
  );
}
