"use client";

import { useState } from "react";

import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { BrandLogo } from "./BrandLogo";

import {
  Menu,
  X,
  ChartColumn,
  User,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";
import { logout } from "@/services/auth";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

export function MobileMenu() {
  const router = useRouter();
  const { user, setUser, loading } = useAuthStore();
  const { language, toggleLanguage } = useLanguageStore();
  const t = translations[language];

  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();

      setUser(null);
      setOpen(false);

      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Topbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 pt-4 md:hidden">
        <BrandLogo className="scale-75 origin-left" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((prev) => !prev)}
          className="cursor-pointer"
        >
          {open ? (
            <X className="size-6 cursor-pointer" />
          ) : (
            <Menu className="size-6" />
          )}
        </Button>
      </header>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-all duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-48 flex-col border-r bg-white px-4 transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top */}
        <div className="relative flex items-center justify-center">
          <BrandLogo className="my-10" />
        </div>

        <Separator />

        {/* Language Toggle */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={toggleLanguage}
            className="w-full cursor-pointer rounded-xl transition-all duration-300"
          >
            {t.nav.flag} {t.nav.country}
          </Button>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex flex-col gap-2">
          {/* Workouts */}
          <Link
            href="/"
            onClick={closeMenu}
            className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
          >
            <ChartColumn className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

            <span>{t.nav.workouts}</span>
          </Link>

          {loading ? null : user ? (
            <>
              {/* Account */}
              <Link
                href="/account"
                onClick={closeMenu}
                className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
              >
                <User className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

                <span>{t.nav.account}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="group flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
              >
                <LogOut className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

                <span>{t.nav.logout}</span>
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                href="/login"
                onClick={closeMenu}
                className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
              >
                <LogIn className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

                <span>{t.nav.login}</span>
              </Link>

              {/* Register */}
              <Link
                href="/register"
                onClick={closeMenu}
                className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
              >
                <UserPlus className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

                <span>{t.nav.register}</span>
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

