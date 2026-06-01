"use client";

import { SlidersHorizontal, Dumbbell, Calendar } from "lucide-react";

import { ResponsiveBar } from "@nivo/bar";

import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

import { useQuery } from "@tanstack/react-query";
import { get_unique_exercises, get_chart_data } from "@/services/chart";

type ChartData = {
  label: string;
  tooltip_label: string;
  value: number;
};

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function ProgressChart() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [exercise, setExercise] = useState<string>("");
  const [period, setPeriod] = useState<string>("30D");
  const [metric, setMetric] = useState<string>("volume");

  const { data: uniqueExercises = [] } = useQuery<string[]>({
    queryKey: ["unique_exercises"],
    queryFn: () => get_unique_exercises(),
  });

  const selectedExercise = exercise || uniqueExercises[0] || "";

  const { data: chartData = [] } = useQuery<ChartData[]>({
    queryKey: ["chart", selectedExercise, metric, period],

    queryFn: () =>
      get_chart_data({
        exercise: selectedExercise,
        metric,
        period,
      }),

    placeholderData: (previousData) => previousData,
  });

  const maxChartValue = Math.max(...chartData.map((item) => item.value), 0);
  const chartMax = maxChartValue * (chartData.length <= 3 ? 1.25 : 1.15);
  const getBarPadding = (count: number) => {
    if (count <= 1) return 0.9;
    if (count <= 4) return 0.8;
    return 0.6;
  };
  const visibleTicks = chartData
    .filter((_, index) => {
      if (chartData.length <= 7) return true;
      if (chartData.length <= 14) return index % 2 === 0;

      return index % 3 === 0;
    })
    .map((item) => item.label);

  if (!chartData.length) {
    return (
      <div className="flex h-90 w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-zinc-50/50 text-center">
        <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
          <Dumbbell className="size-6 text-zinc-400" />
        </div>

        <h3 className="text-sm font-semibold text-zinc-900">
          No progress data yet
        </h3>

        <p className="mt-1 max-w-xs text-sm text-zinc-500">
          Start logging workouts to visualize your training progress.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Progress</h3>
        {/* Date Menu */}
        <div className="flex gap-2 md:gap-4">
          {isMobile ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className="justify-between cursor-pointer"
                >
                  <Calendar className="size-4 text-zinc-500" />
                  {period}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-40 p-2" align="end">
                <div className="flex flex-col gap-1">
                  {["7D", "30D", "90D", "1Y", "Max"].map((value) => (
                    <Button
                      key={value}
                      variant={period === value ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setPeriod(value)}
                    >
                      {value === "max" ? "Max" : value}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <ToggleGroup
              value={period}
              type="single"
              onValueChange={(value) => value && setPeriod(value)}
            >
              <ToggleGroupItem
                className="cursor-pointer w-12"
                value="7D"
                aria-label="Toggle 7D"
              >
                7D
              </ToggleGroupItem>
              <ToggleGroupItem
                className="cursor-pointer w-12"
                value="30D"
                aria-label="Toggle 30D"
              >
                30D
              </ToggleGroupItem>
              <ToggleGroupItem
                className="cursor-pointer w-12"
                value="90D"
                aria-label="Toggle 90D"
              >
                90D
              </ToggleGroupItem>
              <ToggleGroupItem
                className="cursor-pointer w-12"
                value="1Y"
                aria-label="Toggle 90D"
              >
                1Y
              </ToggleGroupItem>
              <ToggleGroupItem
                className="cursor-pointer w-12"
                value="max"
                aria-label="Toggle max"
              >
                Max
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          {/* Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button className="cursor-pointer" variant="secondary">
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <PopoverHeader className="mb-4">
                <PopoverTitle>Filters</PopoverTitle>
                <PopoverDescription>Customize your chart.</PopoverDescription>
              </PopoverHeader>

              <FieldGroup className="gap-4">
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="exercise" className="w-1/2">
                    Exercise
                  </FieldLabel>
                  <Select
                    value={selectedExercise}
                    onValueChange={(value) => setExercise(value)}
                  >
                    <SelectTrigger className="w-full max-w-40 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {uniqueExercises.map((exercise) => (
                          <SelectItem key={exercise} value={exercise}>
                            {toTitleCase(exercise)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="metric" className="w-1/2">
                    Metric
                  </FieldLabel>

                  <Select
                    value={metric}
                    onValueChange={(value) => setMetric(value)}
                  >
                    <SelectTrigger className="w-full max-w-40 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                        <SelectItem value="reps">Reps</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Chart */}
      <div className="h-90 w-full">
        <ResponsiveBar
          data={chartData}
          keys={["value"]}
          indexBy="label"
          margin={{
            top: 20,
            right: isMobile ? 8 : 20,
            bottom: 45,
            left: isMobile ? 30 : 60,
          }}
          padding={getBarPadding(chartData.length)}
          valueScale={{
            type: "linear",
            max: chartMax,
          }}
          indexScale={{ type: "band", round: true }}
          borderRadius={4}
          enableLabel={false}
          colors={({ index }) => {
            const start = [155, 223, 231]; // #9bdfe7
            const end = [77, 151, 215]; // #4d97d7

            const factor =
              chartData.length <= 1 ? 1 : index / (chartData.length - 1);

            const r = Math.round(start[0] + (end[0] - start[0]) * factor);
            const g = Math.round(start[1] + (end[1] - start[1]) * factor);
            const b = Math.round(start[2] + (end[2] - start[2]) * factor);

            return `rgb(${r}, ${g}, ${b})`;
          }}
          animate
          motionConfig="gentle"
          theme={{
            background: "transparent",

            text: {
              fill: "#9ca3af",
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
            },

            axis: {
              domain: {
                line: {
                  stroke: "transparent",
                },
              },

              ticks: {
                line: {
                  stroke: "transparent",
                },

                text: {
                  fill: "#9ca3af",
                  fontSize: 11,
                },
              },
            },

            grid: {
              line: {
                stroke: "#eceff1",
                strokeWidth: 1,
              },
            },

            tooltip: {
              container: {
                background: "white",
                color: "#111827",
                fontSize: 12,
                borderRadius: "10px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                padding: "8px 10px",
              },
            },
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 12,
            tickRotation: isMobile ? -45 : chartData.length > 7 ? -25 : 0,
            tickValues: visibleTicks,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickValues: 5,
          }}
          enableGridY
          gridYValues={5}
          tooltip={({ value, color, data }) => (
            <div className="min-w-32 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-xl">
              {/* date */}
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                {data.tooltip_label}
              </p>

              {/* main value */}
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color }}
                />

                <span className="text-xl font-bold text-zinc-900">
                  {Number(value).toLocaleString()}
                </span>
              </div>

              {/* metric */}
              <p className="mt-1 text-xs text-zinc-500">
                {metric === "volume" && "Training Volume"}
                {metric === "weight" && "Max Weight"}
                {metric === "reps" && "Total Reps"}
              </p>

              {/* exercise */}
              <div className="mt-3 border-t border-zinc-100 pt-2">
                <p className="text-xs font-medium text-zinc-700">
                  {toTitleCase(selectedExercise)}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </>
  );
}
