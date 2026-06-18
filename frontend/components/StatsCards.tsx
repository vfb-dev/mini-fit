"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame, Heart, Zap, Star } from "lucide-react";

import { getStatsCardsData } from "@/services/stats";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";

type StatsCardsData = {
  streak: number;
  recovery: number;
  frequency: number;
  score: number;
};

export function StatsCards() {
  const { language } = useLanguageStore();
  const t = translations[language].dashboard.stats;

  const { data: statsCardsData } = useQuery<StatsCardsData>({
    queryKey: ["stats_cards"],
    queryFn: () => getStatsCardsData(),
  });

  const cards = [
    {
      title: t.streak,
      value: statsCardsData?.streak ?? 0,
      icon: Flame,
    },
    {
      title: t.recovery,
      value: `${statsCardsData?.recovery ?? 0}%`,
      icon: Heart,
    },
    {
      title: t.frequency,
      value: `${statsCardsData?.frequency ?? 0}`,
      icon: Zap,
    },
    {
      title: t.score,
      value: `${statsCardsData?.score ?? 0}`,
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="rounded-xl border bg-white p-3 shadow-sm md:rounded-2xl md:p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 md:text-sm">{card.title}</p>

                <h3 className="mt-2 text-2xl font-bold md:text-3xl">
                  {card.value}
                </h3>
              </div>

              <div className="shrink-0 rounded-lg bg-zinc-100 p-2 md:rounded-xl">
                <Icon className="size-4 text-zinc-700 md:size-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
