import { useState, useEffect, useRef } from 'react';

const CLOUD_STORAGE_AVAILABLE = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.CloudStorage;

export function useCloudStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 1. Initialize from localStorage immediately (Synchronous)
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const isMounted = useRef(false);

  // 2. Sync with CloudStorage on mount (Asynchronous)
  useEffect(() => {
    if (!CLOUD_STORAGE_AVAILABLE) return;
    isMounted.current = true;

    window.Telegram!.WebApp!.CloudStorage.getItem(key, (error, value) => {
      if (!isMounted.current) return;
      
      if (error) {
        console.error(`Error reading CloudStorage key "${key}":`, error);
        return;
      }

      if (value) {
        try {
          const parsed = JSON.parse(value);
          // Strategy: If localStorage was empty/default, take Cloud.
          // If localStorage has data, we prioritize it (assuming user worked offline).
          // Ideally, we'd compare timestamps.
          setStoredValue((prev) => {
            const isDefault = JSON.stringify(prev) === JSON.stringify(initialValue);
            if (isDefault) {
              // Also update localStorage to keep them in sync
              window.localStorage.setItem(key, value);
              return parsed;
            }
            return prev;
          });
        } catch (e) {
          console.error(`Error parsing CloudStorage value for key "${key}":`, e);
        }
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, [key, initialValue]);

  // 3. Save to both on change
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      const stringified = JSON.stringify(valueToStore);

      // Save to local
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, stringified);
      }

      // Save to cloud
      if (CLOUD_STORAGE_AVAILABLE) {
        window.Telegram!.WebApp!.CloudStorage.setItem(key, stringified, (err, _stored) => {
            if (err) console.error('Cloud save error:', err);
        });
      }
    } catch (error) {
      console.error(`Error saving key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
