import { ProgressChart } from "@/components/ProgressChart";
import { StatsCards } from "@/components/StatsCards";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Metadata } from "next";
import { ExercisesPanel } from "@/components/ExercisesPanel";

export const metadata: Metadata = {
  title: "Workouts",
  description: "Track your fitness progress",
};

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="w-full max-w-7xl p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Stats Cards */}
          <div className="col-span-12">
            <StatsCards />
          </div>

          {/* Chart Area */}
          <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm">
            <ProgressChart />
          </div>

          {/* Exercise Panel */}
          <div className="col-span-12 md:rounded-2xl md:bg-white md:p-6 md:shadow-sm">
            <ExercisesPanel />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
