import { HistoryTable } from "@/components/HistoryTable";
import { ProgressChart } from "@/components/ProgressChart";
import { StatsCards } from "@/components/StatsCards";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

          {/* Table */}
          <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm">
            <HistoryTable />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
