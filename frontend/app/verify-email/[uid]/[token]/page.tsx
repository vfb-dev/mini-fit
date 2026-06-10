"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

import { apiUrl } from "@/lib/api";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const params = useParams<{ uid: string; token: string }>();
  const { language } = useLanguageStore();
  const t = translations[language].verifyEmailPage;

  const uid = params.uid;
  const token = params.token;
  const hasInvalidLink = !uid || !token;

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState<string>(t.initialMessage);

  useEffect(() => {
    if (status === "loading") {
      setMessage(t.initialMessage);
    }
  }, [status, t.initialMessage]);

  useEffect(() => {
    if (hasInvalidLink) return;

    let isMounted = true;

    async function verifyEmail() {
      try {
        const response = await fetch(
          apiUrl(`/verify-email/${uid}/${token}/`),
          {
            method: "GET",
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.detail ?? t.verifyError);
        }

        if (!isMounted) return;

        setStatus("success");
        setMessage(t.successMessage);
      } catch (error) {
        if (!isMounted) return;

        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : t.unknownError,
        );
      }
    }

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [hasInvalidLink, t.successMessage, t.unknownError, t.verifyError, uid, token]);

  const viewStatus: VerifyStatus = hasInvalidLink ? "error" : status;
  const viewMessage = hasInvalidLink
    ? t.invalidLink
    : message;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-zinc-900">
          {viewStatus === "loading" && t.verifyingTitle}
          {viewStatus === "success" && t.successTitle}
          {viewStatus === "error" && t.errorTitle}
        </h1>

        <p className="mt-3 text-sm text-zinc-500">{viewMessage}</p>

        {viewStatus !== "loading" && (
          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            {t.goToLogin}
          </Link>
        )}
      </section>
    </main>
  );
}
