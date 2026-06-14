"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { translations } from "@/lib/translations";
import { requestPasswordReset } from "@/services/auth";
import { useLanguageStore } from "@/store/languageStore";

export default function ForgotPasswordPage() {
  const { language } = useLanguageStore();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setMessage(t.forgotPasswordPage.success);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t.common.somethingWentWrong,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center px-4 py-6 md:py-10">
      <section className="w-full max-w-sm md:max-w-md rounded-2xl md:rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 md:p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <div className="mx-auto mb-3 md:mb-4 flex size-10 md:size-12 items-center justify-center rounded-xl md:rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-900">
            <Mail className="size-5 md:size-6" />
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-zinc-900">
            {t.forgotPasswordPage.title}
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            {t.forgotPasswordPage.subtitle}
          </p>
        </div>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">{t.common.email}</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <Input
                id="email"
                type="email"
                required
                placeholder="example@gmail.com"
                className="h-10 md:h-11 rounded-xl pl-10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          {message && (
            <p className="mt-4 text-sm text-emerald-600">{message}</p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 h-10 md:h-11 rounded-xl text-sm md:text-base font-medium cursor-pointer"
          >
            {isSubmitting
              ? t.forgotPasswordPage.sending
              : t.forgotPasswordPage.sendResetLink}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500">
          {t.forgotPasswordPage.rememberedIt}{" "}
          <Link
            href="/login"
            className="font-medium text-black hover:underline"
          >
            {t.common.login}
          </Link>
        </p>
      </section>
    </main>
  );
}