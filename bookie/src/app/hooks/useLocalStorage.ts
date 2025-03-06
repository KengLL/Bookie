import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [isMounted, setIsMounted] = useState(false);
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    setIsMounted(true);
    const saved = window.localStorage.getItem(key);
    if (saved) {
      try {
        setValue(JSON.parse(saved));
      } catch {
        setValue(saved as T);
      }
    }
  }, [key]);

  useEffect(() => {
    if (isMounted) {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, valueToStore);
    }
  }, [key, value, isMounted]);

  return [value, setValue] as const;
}