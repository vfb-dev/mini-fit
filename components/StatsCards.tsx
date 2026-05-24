"use client";

import { useMediaQuery } from "usehooks-ts";
import { useQuery } from "@tanstack/react-query";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { Flame, TrendingUp, Repeat, Dumbbell } from "lucide-react";

import { getStatsCardsData } from "@/api/stats";

type StatsCardsData = {
  streak: number;
  avg_weekly_volume_progress: number;
  avg_weekly_reps_progress: number;
  avg_weekly_weight_progress: number;
};

export function StatsCards() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: statsCardsData } = useQuery<StatsCardsData>({
    queryKey: ["stats_cards"],
    queryFn: () => getStatsCardsData(),
  });

  const cards = [
    {
      title: "Streak",
      value: statsCardsData?.streak ?? 0,
      icon: Flame,
    },
    {
      title: "Volume Progress",
      value: `${statsCardsData?.avg_weekly_volume_progress ?? 0}%`,
      icon: TrendingUp,
    },
    {
      title: "Reps Progress",
      value: `${statsCardsData?.avg_weekly_reps_progress ?? 0}%`,
      icon: Repeat,
    },
    {
      title: "Weight Progress",
      value: `${statsCardsData?.avg_weekly_weight_progress ?? 0}%`,
      icon: Dumbbell,
    },
  ];

  return (
    <>
      {isMobile ? (
        <Carousel>
          <CarouselContent className="-ml-2 mr-1">
            {cards.map((card, index) => {
              const Icon = card.icon;

              return (
                <CarouselItem key={index} className="pl-2 basis-[85%]">
                  <div className="p-4 shadow-sm rounded-2xl bg-white border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-zinc-500">{card.title}</p>

                        <h3 className="mt-2 text-3xl font-bold">
                          {card.value}
                        </h3>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-100">
                        <Icon className="size-5 text-zinc-700" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={index}
                className="p-4 shadow-sm rounded-2xl bg-white border"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">{card.title}</p>

                    <h3 className="mt-2 text-3xl font-bold">{card.value}</h3>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-100">
                    <Icon className="size-5 text-zinc-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
