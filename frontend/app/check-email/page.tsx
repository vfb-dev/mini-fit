"use client";

import { Suspense } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { language } = useLanguageStore();
  const t = translations[language].checkEmailPage;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Mail className="size-8" />
        </div>

        <h1 className="text-2xl font-bold text-zinc-900">{t.title}</h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {t.sentLink}
          {email ? ` ${t.to}` : ""}
          {email && (
            <span className="block font-medium text-zinc-900">{email}</span>
          )}
          {t.activateAccount}
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />

            <div>
              <p className="text-sm font-medium text-zinc-900">
                {t.emailSent}
              </p>

              <p className="mt-1 text-sm leading-5 text-zinc-500">
                {t.spamHint}
              </p>
            </div>
          </div>
        </div>

        <Button
          asChild
          className="mt-6 h-11 w-full rounded-xl text-base font-medium"
        >
          <Link href="/login">{t.goToLogin}</Link>
        </Button>

        <p className="mt-4 text-sm text-zinc-500">
          {t.wrongEmail}{" "}
          <Link
            href="/register"
            className="font-medium text-black hover:underline"
          >
            {t.createNewAccount}
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}