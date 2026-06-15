"use client";

import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

import { login, getUser } from "@/services/auth";

import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { language } = useLanguageStore();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    try {
      await login(email, password);

      const user = await getUser();
      setUser(user);

      router.push("/");
    } catch (error) {
      setError(t.loginPage.invalidCredentials);
      console.error(error);
    }
  };

  return (
    <PublicOnlyRoute>
      <div className="flex items-center justify-center px-4 py-6 md:py-10">
        <div className="w-full md:w-md bg-white rounded-2xl md:rounded-3xl shadow-xl border border-zinc-200 p-5 sm:p-6 md:p-8">
          {/* Header Icon */}
          <div className="mx-auto mb-3 md:mb-4 flex size-10 md:size-12 items-center justify-center rounded-xl md:rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-900">
            <LogIn className="size-5 md:size-6" />
          </div>

          {/* Header */}
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900">
              {t.loginPage.title}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">{t.loginPage.subtitle}</p>
          </div>

          {/* Form */}
          <form className="flex flex-col" onSubmit={handleLogin}>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t.common.email}</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  className="h-10 md:h-11 rounded-xl pl-10"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="password">{t.common.password}</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="h-10 md:h-11 rounded-xl pl-10 pr-10"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-5 cursor-pointer" />
                  ) : (
                    <Eye className="size-5 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <Link
              href="/forgot-password"
              className="mt-2 mb-5 text-right text-sm text-zinc-500 transition hover:text-black"
            >
              {t.loginPage.forgotPassword}
            </Link>

            {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <Button
              type="submit"
              className="mt-2 h-10 md:h-11 rounded-xl text-sm md:text-base font-medium cursor-pointer"
            >
              {t.common.login}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-sm text-zinc-500">
            {t.loginPage.noAccount}{" "}
            <Link
              href="/register"
              className="font-medium text-black hover:underline"
            >
              {t.loginPage.signUp}
            </Link>
          </p>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
