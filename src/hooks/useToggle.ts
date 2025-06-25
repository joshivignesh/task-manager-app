/**
 * Custom hook for toggle functionality
 */

import { useState, useCallback } from 'react';

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    reset,
    setValue,
  };
}

/**
 * Hook for managing multiple toggles
 */
export function useMultipleToggles(keys: string[], initialValues?: Record<string, boolean>) {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    keys.forEach(key => {
      initial[key] = initialValues?.[key] ?? false;
    });
    return initial;
  });

  const toggle = useCallback((key: string) => {
    setToggles(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const set = useCallback((key: string, value: boolean) => {
    setToggles(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setMultiple = useCallback((updates: Record<string, boolean>) => {
    setToggles(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const reset = useCallback(() => {
    const resetValues: Record<string, boolean> = {};
    keys.forEach(key => {
      resetValues[key] = initialValues?.[key] ?? false;
    });
    setToggles(resetValues);
  }, [keys, initialValues]);

  return {
    toggles,
    toggle,
    set,
    setMultiple,
    reset,
    get: (key: string) => toggles[key] ?? false,
  };
}