"use client";

import { SlidersHorizontal } from "lucide-react";

import { ResponsiveBar } from "@nivo/bar";

import { useState } from "react";

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
import { get_unique_exercises, get_chart_data } from "@/api/chart";

const dummyData = [
  { month: "January", value: 12500 },
  { month: "February", value: 14500 },
  { month: "March", value: 11800 },
  { month: "April", value: 9800 },
  { month: "May", value: 14200 },
  { month: "June", value: 23500 },
  { month: "July", value: 19800 },
];

const colors = [
  "#9bdfe7",
  "#89d5e8",
  "#7dccea",
  "#6ec1ea",
  "#61b5e7",
  "#55a8e2",
  "#4d97d7",
];

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function ProgressChart() {
  const [exercise, setExercise] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [metric, setMetric] = useState<string>("");

  const { data: uniqueExercises = [] } = useQuery<string[]>({
    queryKey: ["unique_exercises"],
    queryFn: () => get_unique_exercises(),
  });

  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ["chart", exercise, metric, period],

    queryFn: () =>
      get_chart_data({
        exercise,
        metric,
        period,
      }),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Progress</h3>

        <div className="flex gap-4">
          <ToggleGroup
            type="single"
            defaultValue="30D"
            onValueChange={(value) => setPeriod(value)}
          >
            <ToggleGroupItem
              className="cursor-pointer"
              value="7D"
              aria-label="Toggle 7D"
            >
              7D
            </ToggleGroupItem>
            <ToggleGroupItem
              className="cursor-pointer"
              value="30D"
              aria-label="Toggle 30D"
            >
              30D
            </ToggleGroupItem>
            <ToggleGroupItem
              className="cursor-pointer"
              value="90D"
              aria-label="Toggle 90D"
            >
              90D
            </ToggleGroupItem>
            <ToggleGroupItem
              className="cursor-pointer"
              value="1Y"
              aria-label="Toggle 90D"
            >
              1Y
            </ToggleGroupItem>
            <ToggleGroupItem
              className="cursor-pointer"
              value="max"
              aria-label="Toggle max"
            >
              Max
            </ToggleGroupItem>
          </ToggleGroup>

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
                    defaultValue={uniqueExercises[0] ?? ""}
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
                    defaultValue="volume"
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

      <div className="h-90 w-full">
        <ResponsiveBar
          data={chartData}
          keys={["value"]}
          indexBy="label"
          margin={{ top: 20, right: 20, bottom: 45, left: 60 }}
          padding={0.28}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          borderRadius={4}
          enableLabel={false}
          colors={({ index }) => colors[index % colors.length]}
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
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickValues: 5,
          }}
          enableGridY
          gridYValues={5}
          tooltip={({ value, indexValue }) => (
            <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
              <p className="text-xs text-zinc-400">{indexValue}</p>

              <p className="text-sm font-medium text-zinc-900">
                {value.toLocaleString()}
              </p>
            </div>
          )}
        />
      </div>
    </>
  );
}
