"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/modalStore";

type dummyData = {
  date: string;
  exercise: string;
  reps: number;
  Weigth: number;
};

const dummyDataList: dummyData[] = [
  { date: "07/05/2026", exercise: "Dips", reps: 3, Weigth: 80 },
  { date: "07/05/2026", exercise: "Pull up", reps: 3, Weigth: 80 },
  { date: "07/05/2026", exercise: "Squats", reps: 3, Weigth: 80 },
  { date: "07/05/2026", exercise: "Push ups", reps: 3, Weigth: 80 },
  { date: "07/05/2026", exercise: "Dips2", reps: 3, Weigth: 80 },
  { date: "07/05/2026", exercise: "Pull up2", reps: 3, Weigth: 80 },
  { date: "07/05/2026", exercise: "Squats2", reps: 3, Weigth: 80 },
];

export function HistoryTable() {
  const { handleModal } = useModalStore();

  return (
    <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-semibold">History</h3>
        <Button className="cursor-pointer" onClick={() => handleModal(true)}>
          Add Exercise
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Exercise</TableHead>
            <TableHead className="font-bold">reps</TableHead>
            <TableHead className="font-bold text-right">Weigth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dummyDataList.map((d) => (
            <TableRow key={d.exercise}>
              <TableCell>{d.date}</TableCell>
              <TableCell>{d.exercise}</TableCell>
              <TableCell>{d.reps}</TableCell>
              <TableCell className="text-right">{d.Weigth}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
