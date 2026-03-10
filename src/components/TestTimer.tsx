import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TestTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export default function TestTimer({ durationMinutes, onTimeUp, isPaused = false }: TestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isWarning = timeRemaining <= 300;
  const isCritical = timeRemaining <= 60;

  return (
    <div
      className={`fixed top-20 right-4 z-40 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
        isCritical
          ? 'bg-red-600 text-white animate-pulse'
          : isWarning
          ? 'bg-orange-500 text-white'
          : 'bg-blue-600 text-white'
      }`}
    >
      <Clock size={20} />
      <div className="font-mono text-lg font-semibold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}
