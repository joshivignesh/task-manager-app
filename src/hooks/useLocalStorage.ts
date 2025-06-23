/**
 * Custom hook for localStorage operations with React state synchronization
 */

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: any) => value is T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedValue = JSON.parse(item);
        if (validator ? validator(parsedValue) : true) {
          setStoredValue(parsedValue);
        } else {
          console.warn(`Invalid data in localStorage for key "${key}". Using initial value.`);
          window.localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      window.localStorage.removeItem(key);
    } finally {
      setIsLoading(false);
    }
  }, [key, validator]);

  // Save to localStorage whenever value changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading];
}