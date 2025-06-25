/**
 * Custom hook for managing keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const {
        key,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false,
        altKey = false,
        callback,
        preventDefault = true,
      } = shortcut;

      const isMatch = 
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.metaKey === metaKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey;

      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return shortcuts;
}

/**
 * Hook for common application shortcuts
 */
export function useAppShortcuts(handlers: {
  onNewTask?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
  onSave?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      callback: () => handlers.onNewTask?.(),
      description: 'Create new task',
    },
    {
      key: 'n',
      metaKey: true,
      callback: () => handlers.onNewTask?.(),
      description: 'Create new task (Mac)',
    },
    {
      key: 'k',
      ctrlKey: true,
      callback: () => handlers.onSearch?.(),
      description: 'Focus search',
    },
    {
      key: 'k',
      metaKey: true,
      callback: () => handlers.onSearch?.(),
      description: 'Focus search (Mac)',
    },
    {
      key: 'Escape',
      callback: () => handlers.onEscape?.(),
      description: 'Close modal/cancel',
    },
    {
      key: 's',
      ctrlKey: true,
      callback: () => handlers.onSave?.(),
      description: 'Save',
    },
    {
      key: 's',
      metaKey: true,
      callback: () => handlers.onSave?.(),
      description: 'Save (Mac)',
    },
  ];

  return useKeyboardShortcuts(shortcuts);
}