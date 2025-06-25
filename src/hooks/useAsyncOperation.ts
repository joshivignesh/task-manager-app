/**
 * Custom hook for managing async operations with loading states
 */

import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncOperation<T = any, P extends any[] = any[]>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    asyncFunction: (...args: P) => Promise<T>,
    ...args: P
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Record<string, AsyncState<any>>>({});

  const execute = useCallback(async <T>(
    key: string,
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    setOperations(prev => ({
      ...prev,
      [key]: { data: null, loading: true, error: null }
    }));

    try {
      const result = await asyncFunction();
      setOperations(prev => ({
        ...prev,
        [key]: { data: result, loading: false, error: null }
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setOperations(prev => ({
        ...prev,
        [key]: { data: null, loading: false, error: errorMessage }
      }));
      return null;
    }
  }, []);

  const getOperation = useCallback((key: string): AsyncState<any> => {
    return operations[key] || { data: null, loading: false, error: null };
  }, [operations]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setOperations(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setOperations({});
    }
  }, []);

  return {
    operations,
    execute,
    getOperation,
    reset,
  };
}