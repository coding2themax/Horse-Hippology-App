import { useEffect, useState } from 'react';

// Like useState, but the value is saved to localStorage under `key`.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be full or blocked; keep working in memory.
    }
  }, [key, value]);

  return [value, setValue];
}
