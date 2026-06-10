"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/services/auth";

import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

type RegisterValidationTranslations =
  (typeof translations)[keyof typeof translations]["registerPage"]["validation"];

function createRegisterSchema(t: RegisterValidationTranslations) {
  return z
    .object({
      username: z.string().min(2, t.usernameMin),
      email: z.email(t.validEmail),
      password: z.string().min(8, t.passwordMin),
      confirmPassword: z.string().min(1, t.confirmPassword),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.passwordsMatch,
      path: ["confirmPassword"],
    });
}

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];
  const registerSchema = useMemo(
    () => createRegisterSchema(t.registerPage.validation),
    [t.registerPage.validation],
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError("");

    try {
      await registerUser(values.username, values.email, values.password);

      router.push(`/check-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t.registerPage.createAccountError,
      );
      console.error(error);
    }
  };

  return (
    <PublicOnlyRoute>
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full md:w-md bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-900">
              <UserPlus className="size-6" />
            </div>

            <h1 className="text-2xl font-bold text-zinc-900">
              {t.registerPage.title}
            </h1>

            <p className="text-sm text-zinc-500 mt-1">
              {t.registerPage.subtitle}
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="username">{t.common.username}</Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />

                <Input
                  id="username"
                  type="text"
                  placeholder="arnold"
                  className="pl-10 h-11 rounded-xl"
                  {...register("username")}
                />
              </div>

              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="email">{t.common.email}</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />

                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  className="pl-10 h-11 rounded-xl"
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="password">{t.common.password}</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="pl-10 pr-10 h-11 rounded-xl"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={
                    showPassword ? t.common.hidePassword : t.common.showPassword
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-5 cursor-pointer" />
                  ) : (
                    <Eye className="size-5 cursor-pointer" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="confirmPassword">
                {t.common.confirmPassword}
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />

                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  className="pl-10 pr-10 h-11 rounded-xl"
                  {...register("confirmPassword")}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={
                    showConfirmPassword
                      ? t.common.hidePassword
                      : t.common.showPassword
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5 cursor-pointer" />
                  ) : (
                    <Eye className="size-5 cursor-pointer" />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {submitError && (
              <p className="mt-4 text-sm text-red-500">{submitError}</p>
            )}

            <Button
              type="submit"
              className="h-11 mt-6 rounded-xl cursor-pointer text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t.registerPage.creatingAccount
                : t.registerPage.createAccount}
            </Button>
          </form>

          <p className="text-sm text-center text-zinc-500 mt-4">
            {t.registerPage.alreadyHaveAccount}{" "}
            <Link
              href="/login"
              className="font-medium text-black hover:underline"
            >
              {t.common.login}
            </Link>
          </p>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
