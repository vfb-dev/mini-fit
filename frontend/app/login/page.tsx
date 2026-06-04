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

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

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
      setError("Invalid email or password.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-10">
      {/* Card */}
      <div className="w-full md:w-md bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
        {/* Header */}
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-900">
          <LogIn className="size-6" />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>

          <p className="text-sm text-zinc-500 mt-1">
            Login to continue your journey
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col" onSubmit={handleLogin}>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />

              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                className="pl-10 h-11 rounded-xl"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />

              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="pl-10 pr-10 h-11 rounded-xl"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
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
            className="mt-1 mb-6 text-sm text-right text-zinc-500 hover:text-black transition"
          >
            Forgot password?
          </Link>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          {/* Button */}
          <Button
            type="submit"
            className="h-11 mt-2 rounded-xl cursor-pointer text-base font-medium"
          >
            Login
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-zinc-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-black hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
