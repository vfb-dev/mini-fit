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
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-zinc-900">
          {t.forgotPasswordPage.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {t.forgotPasswordPage.subtitle}
        </p>

        <form className="mt-8 flex flex-col" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">{t.common.email}</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="email"
                type="email"
                required
                placeholder="example@gmail.com"
                className="h-11 rounded-xl pl-10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          {message && (
            <p className="mt-4 text-sm text-emerald-600">{message}</p>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer mt-6 h-11 rounded-xl text-base font-medium"
          >
            {isSubmitting
              ? t.forgotPasswordPage.sending
              : t.forgotPasswordPage.sendResetLink}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
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
