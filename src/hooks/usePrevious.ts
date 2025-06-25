/**
 * Custom hook for tracking previous values
 */

import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Hook for comparing current and previous values
 */
export function useValueComparison<T>(
  value: T,
  compareFn?: (prev: T | undefined, current: T) => boolean
) {
  const previous = usePrevious(value);
  
  const hasChanged = compareFn 
    ? compareFn(previous, value)
    : previous !== value;
  
  return {
    current: value,
    previous,
    hasChanged,
  };
}

/**
 * Hook for tracking changes in object properties
 */
export function useObjectChanges<T extends Record<string, any>>(obj: T) {
  const previous = usePrevious(obj);
  
  const changedKeys = Object.keys(obj).filter(key => 
    previous && previous[key] !== obj[key]
  );
  
  return {
    current: obj,
    previous,
    changedKeys,
    hasChanges: changedKeys.length > 0,
  };
}