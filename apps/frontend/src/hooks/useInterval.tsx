import { useEffect, useRef } from 'react';

export function useInterval(
  callback: () => Promise<void> | void,
  delay: number | null
): void {
  const savedCallback = useRef<() => Promise<void> | void>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
