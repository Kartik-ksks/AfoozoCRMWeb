import { useEffect, useRef } from 'react';

export default function useMonitor(client, paths, callback, deps = [], options = {}) {
  const { interval = 0 } = options;
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          paths.map(path => client.get(path))
        );

        const data = Object.fromEntries(
          paths.map((path, index) => [path, responses[index]])
        );

        callback(data);
      } catch (error) {
        console.error('Error in useMonitor:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval if specified
    if (interval > 0) {
      timerRef.current = setInterval(fetchData, interval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [...paths, ...deps, interval]); // Include paths and interval in dependencies
};