"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { translations } from "@/lib/translations";
import { confirmPasswordReset } from "@/services/auth";
import { useLanguageStore } from "@/store/languageStore";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ uid: string; token: string }>();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await confirmPasswordReset(
        params.uid,
        params.token,
        password,
        confirmPassword,
      );

      router.push("/login");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t.resetPasswordPage.resetError,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center p-4">
      <section className="w-full md:w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-zinc-900">
          {t.resetPasswordPage.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {t.resetPasswordPage.subtitle}
        </p>

        <form className="mt-8 flex flex-col" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">{t.common.password}</Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="h-11 rounded-xl pl-10 pr-10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="confirmPassword">{t.common.confirmPassword}</Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                className="h-11 rounded-xl pl-10 pr-10"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer mt-6 h-11 rounded-xl text-base font-medium"
          >
            {isSubmitting
              ? t.resetPasswordPage.resetting
              : t.resetPasswordPage.resetPassword}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          {t.resetPasswordPage.backTo}{" "}
          <Link
            href="/login"
            className="font-medium text-black hover:underline"
          >
            {t.resetPasswordPage.loginLower}
          </Link>
        </p>
      </section>
    </main>
  );
}
