import { useState, useEffect } from "react";

interface TimerData {
  elapsedSeconds: number;
  formattedTime: string;
  currentAmount: number;
}

export function useTimer(
  startedAt: string | null | undefined, 
  hourlyRate: number
): TimerData {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsedSeconds(0);
      return;
    }

    // Function to calculate diff
    const calculateElapsed = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const diffInSeconds = Math.floor((now - start) / 1000);
      setElapsedSeconds(diffInSeconds > 0 ? diffInSeconds : 0);
    };

    // Initial calculation
    calculateElapsed();

    // Update every second
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  // Format seconds to HH:MM:SS
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  // Calculate amount (integer arithmetic to avoid float issues)
  // Formula: (hourlyRate * elapsedSeconds) / 3600
  const currentAmount = Math.floor((hourlyRate * elapsedSeconds) / 3600);

  return {
    elapsedSeconds,
    formattedTime,
    currentAmount,
  };
}
