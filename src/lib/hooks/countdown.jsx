import { useEffect, useState } from 'react';

export const useCountdown = (initialMs) => {
  const [timeLeft, setTimeLeft] = useState(initialMs);

  useEffect(() => {
    if (!initialMs) return;

    setTimeLeft(initialMs);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialMs]);

  return timeLeft;
};
