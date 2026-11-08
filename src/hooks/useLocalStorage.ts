import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

// Like useState, but the value is saved to localStorage under `key`.
export default function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
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
