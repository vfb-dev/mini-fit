"use client";

import { useState } from "react";

import { Yuji_Boku } from "next/font/google";

import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

import { Menu, X, ChartColumn, User, LogIn, UserPlus } from "lucide-react";

const yujiBoku = Yuji_Boku({
  weight: "400",
  subsets: ["latin"],
});

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "pt">("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "pt" : "en"));
  };

  return (
    <>
      {/* Topbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 pt-4 md:hidden">
        <h1 className={`${yujiBoku.className} text-4xl`}>道</h1>

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
          <h1 className={`${yujiBoku.className} my-10 text-5xl`}>道</h1>

          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer absolute right-0 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-zinc-500 shadow-sm transition-all duration-300 hover:scale-110 hover:bg-zinc-100 hover:text-black"
          >
            <X className="size-5 " />
          </button>
        </div>

        <Separator />

        {/* Language Toggle */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={toggleLanguage}
            className="w-full cursor-pointer rounded-xl transition-all duration-300"
          >
            {language === "en" ? "🇺🇸 USA" : "🇧🇷 Brasil"}
          </Button>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex flex-col gap-2">
          {/* Workouts */}
          <a
            href=""
            className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
          >
            <ChartColumn className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

            <span>{language === "en" ? "Workouts" : "Treinos"}</span>
          </a>

          {/* Account */}
          <a
            href=""
            className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
          >
            <User className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

            <span>{language === "en" ? "Account" : "Conta"}</span>
          </a>

          {/* Login */}
          <a
            href=""
            className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
          >
            <LogIn className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

            <span>{language === "en" ? "Login" : "Entrar"}</span>
          </a>

          {/* Register */}
          <a
            href=""
            className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-black"
          >
            <UserPlus className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

            <span>{language === "en" ? "Register" : "Registrar"}</span>
          </a>
        </nav>
      </aside>
    </>
  );
}
