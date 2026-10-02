import { useEffect, useState } from "react";

/** The current time, refreshed every `intervalMs`. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Time left until the next local midnight, as "HH : MM : SS". */
export function useCountdownToMidnight() {
  const now = useNow(1000);
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const total = Math.max(0, Math.floor((midnight.getTime() - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))} : ${pad(Math.floor((total % 3600) / 60))} : ${pad(total % 60)}`;
}
