/**
 * Centralized export for all custom hooks
 */

// Form and validation hooks
export { useTaskForm } from './useTaskForm';
export type { UseTaskFormReturn } from './useTaskForm';

// Storage hooks
export { useLocalStorage } from './useLocalStorage';

// Performance hooks
export { useDebounce, useDebouncedCallback } from './useDebounce';

// Interaction hooks
export { useKeyboardShortcuts, useAppShortcuts } from './useKeyboardShortcuts';
export type { KeyboardShortcut } from './useKeyboardShortcuts';

export { useClickOutside, useToggleWithClickOutside } from './useClickOutside';

// State management hooks
export { useToggle, useMultipleToggles } from './useToggle';
export { usePrevious, useValueComparison, useObjectChanges } from './usePrevious';

// Async operation hooks
export { useAsyncOperation, useAsyncOperations } from './useAsyncOperation';
export type { AsyncState } from './useAsyncOperation';

// Responsive design hooks
export { useMediaQuery, useBreakpoints, useDarkMode } from './useMediaQuery';