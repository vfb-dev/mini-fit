"use client";

import { useState } from "react";

import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

import {
  ChartColumn,
  User,
  LogIn,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

import { logout } from "@/services/auth";

import { BrandLogo } from "./BrandLogo";

export function Sidebar() {
  const router = useRouter();
  const { user, setUser, loading } = useAuthStore();

  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [collapsed, setCollapsed] = useState(false);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "pt" : "en"));
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();

      setUser(null);

      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col overflow-visible border-r bg-white px-4 transition-all duration-500 ease-in-out ${
        collapsed ? "w-24" : "w-48"
      }`}
    >
      {/* Top */}
      <div className="relative flex items-center justify-center">
        <BrandLogo collapsed={collapsed} className="my-10" />

        {/* Expand / Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="absolute cursor-pointer -right-8 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-zinc-500 shadow-sm transition-all duration-300 hover:scale-110 hover:bg-zinc-100 hover:text-black"
        >
          <div
            className={`transition-transform duration-500 ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </div>
        </button>
      </div>

      <Separator />

      {/* Language Toggle */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          onClick={toggleLanguage}
          className={`cursor-pointer rounded-xl transition-all duration-300 ${
            collapsed ? "flex w-12 justify-center px-0" : "w-full"
          }`}
        >
          {language === "en" ? "🇺🇸" : "🇧🇷"}

          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? "ml-0 max-w-0 opacity-0" : "ml-2 max-w-20 opacity-100"
            }`}
          >
            {language === "en" ? "USA" : "Brasil"}
          </span>
        </Button>
      </div>

      {/* Nav */}
      <nav className="mt-6 flex flex-col gap-2">
        {/* Workouts */}
        <Link
          href="/"
          className={`group relative flex items-center rounded-xl py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black ${
            collapsed ? "justify-center px-0" : "gap-4 px-4"
          }`}
        >
          <ChartColumn className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? "max-w-0 opacity-0" : "max-w-20 opacity-100"
            }`}
          >
            {language === "en" ? "Workouts" : "Treinos"}
          </span>

          {collapsed && (
            <div className="pointer-events-none absolute left-18 rounded-md bg-white px-4 py-2 text-sm opacity-0 shadow-md transition-all duration-200 group-hover:left-20 group-hover:opacity-100">
              {language === "en" ? "Workouts" : "Treinos"}
            </div>
          )}
        </Link>

        {loading ? null : user ? (
          <>
            {/* Account */}
            <Link
              href="/account"
              className={`group relative flex items-center rounded-xl py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <User className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed ? "max-w-0 opacity-0" : "max-w-20 opacity-100"
                }`}
              >
                {language === "en" ? "Account" : "Conta"}
              </span>

              {collapsed && (
                <div className="pointer-events-none absolute left-18 rounded-md bg-white px-4 py-2 text-sm opacity-0 shadow-md transition-all duration-200 group-hover:left-20 group-hover:opacity-100">
                  {language === "en" ? "Account" : "Conta"}
                </div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className={`group relative cursor-pointer flex items-center rounded-xl py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <LogOut className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed ? "max-w-0 opacity-0" : "max-w-20 opacity-100"
                }`}
              >
                {language === "en" ? "Logout" : "Sair"}
              </span>

              {collapsed && (
                <div className="pointer-events-none absolute left-18 rounded-md bg-white px-4 py-2 text-sm opacity-0 shadow-md transition-all duration-200 group-hover:left-20 group-hover:opacity-100">
                  {language === "en" ? "Logout" : "Sair"}
                </div>
              )}
            </button>
          </>
        ) : (
          <>
            {/* Login */}
            <Link
              href="/login"
              className={`group relative flex items-center rounded-xl py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <LogIn className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed ? "max-w-0 opacity-0" : "max-w-20 opacity-100"
                }`}
              >
                {language === "en" ? "Login" : "Entrar"}
              </span>

              {collapsed && (
                <div className="pointer-events-none absolute left-18 rounded-md bg-white px-4 py-2 text-sm opacity-0 shadow-md transition-all duration-200 group-hover:left-20 group-hover:opacity-100">
                  {language === "en" ? "Login" : "Entrar"}
                </div>
              )}
            </Link>

            {/* Register */}
            <Link
              href="/register"
              className={`group relative flex items-center rounded-xl py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <UserPlus className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed ? "max-w-0 opacity-0" : "max-w-20 opacity-100"
                }`}
              >
                {language === "en" ? "Register" : "Registrar"}
              </span>

              {collapsed && (
                <div className="pointer-events-none absolute left-18 rounded-md bg-white px-4 py-2 text-sm opacity-0 shadow-md transition-all duration-200 group-hover:left-20 group-hover:opacity-100">
                  {language === "en" ? "Register" : "Registrar"}
                </div>
              )}
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
