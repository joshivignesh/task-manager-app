/**
 * Custom hook for detecting clicks outside an element
 */

import { useEffect, useRef, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}

/**
 * Hook for managing dropdown/modal visibility with click outside
 */
export function useToggleWithClickOutside(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ref = useClickOutside<HTMLDivElement>(close, isOpen);

  return {
    isOpen,
    toggle,
    open,
    close,
    ref,
  };
}