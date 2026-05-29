"use client";

import { Mail, Lock } from "lucide-react";

import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        router.refresh();
        router.push("/");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-10">
      {/* Card */}
      <div className="w-full md:w-90 bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
        {/* Header */}
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
                type="password"
                placeholder="********"
                className="pl-10 h-11 rounded-xl"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Forgot Password */}
          <Link
            href=""
            className="mt-1 text-sm text-right text-zinc-500 hover:text-black transition"
          >
            Forgot password?
          </Link>

          {/* Button */}
          <Button
            type="submit"
            className="h-11 mt-8 rounded-xl cursor-pointer text-base font-medium"
          >
            Login
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-zinc-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="" className="font-medium text-black hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
