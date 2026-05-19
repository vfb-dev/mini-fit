"use client";

import { ResponsiveBar } from "@nivo/bar";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data = [
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

export function ProgressChart() {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Progress</h3>

        <div className="flex justify-end gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-full max-w-40 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="max">Max</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="volume">
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

          <Select defaultValue="pull up">
            <SelectTrigger className="w-full max-w-40 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="pull up">Pull Up</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-90 w-full">
        <ResponsiveBar
          data={data}
          keys={["value"]}
          indexBy="month"
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
