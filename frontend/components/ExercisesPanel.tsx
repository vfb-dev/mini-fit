"use client";

import { HistoryTable } from "./HistoryTable";
import { Tiles } from "./Tiles";
import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isMobile;
}

export function ExercisesPanel() {
  const isMobile = useIsMobile();

  return isMobile ? <Tiles /> : <HistoryTable />;
}
