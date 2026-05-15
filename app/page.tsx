import { HistoryTable } from "@/components/HistoryTable";

export default function Home() {
  return (
    <div className="w-full max-w-7xl p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Stats Cards */}
        <div className="col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="p-4 shadow-sm rounded-2xl bg-white">
              <p className="text-sm text-zinc-500">Stats Card 1</p>
              <h3 className="mt-2 text-3xl font-bold">$12,430</h3>
            </div>
            <div className="p-4 shadow-sm rounded-2xl bg-white">
              <p className="text-sm text-zinc-500">Stats Card 2</p>
              <h3 className="mt-2 text-3xl font-bold">$12,430</h3>
            </div>
            <div className="p-4 shadow-sm rounded-2xl bg-white">
              <p className="text-sm text-zinc-500">Stats Card 3</p>
              <h3 className="mt-2 text-3xl font-bold">$12,430</h3>
            </div>
            <div className="p-4 shadow-sm rounded-2xl bg-white">
              <p className="text-sm text-zinc-500">Stats Card 4</p>
              <h3 className="mt-2 text-3xl font-bold">$12,430</h3>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Progress</h3>
            <span className="text-sm text-zinc-500">Last 30 days</span>
          </div>

          <div className="flex h-60 items-end gap-4 rounded-xl bg-zinc-100 p-6">
            <div className="h-24 w-full rounded-md bg-zinc-300"></div>
            <div className="h-40 w-full rounded-md bg-zinc-300"></div>
            <div className="h-46 w-full rounded-md bg-zinc-300"></div>
            <div className="h-36 w-full rounded-md bg-zinc-300"></div>
            <div className="h-46 w-full rounded-md bg-zinc-300"></div>
            <div className="h-44 w-full rounded-md bg-zinc-300"></div>
            <div className="h-50 w-full rounded-md bg-zinc-300"></div>
          </div>
        </div>

        {/* Table */}
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm">
          <HistoryTable />
        </div>
      </div>
    </div>
  );
}
