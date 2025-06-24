/**
 * Type-safe custom hook for task form management
 */

import { useReducer, useCallback, useMemo } from 'react';
import { 
  TaskFormData, 
  TaskFormState, 
  TaskFormAction, 
  TaskFormField,
  ValidationResult 
} from '../types/form';
import { Task, TaskPriority } from '../types/task';
import { validateTaskForm, getFieldError, sanitizeFormData, transformToTaskData } from '../utils/validation';

// Initial form data with type safety
const createInitialFormData = (editingTask?: Task | null): TaskFormData => {
  if (editingTask) {
    return {
      title: editingTask.title,
      description: editingTask.description,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate || '',
    } as const;
  }
  
  return {
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
  } as const;
};

// Type-safe form reducer
const formReducer = (state: TaskFormState, action: TaskFormAction): TaskFormState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
        isDirty: true,
        // Clear validation error for this field when user starts typing
        validationErrors: {
          ...state.validationErrors,
          [action.field]: undefined,
        },
      };
      
    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.field]: action.error,
        },
      };
      
    case 'CLEAR_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.field]: undefined,
        },
      };
      
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        validationErrors: {
          title: undefined,
          description: undefined,
          priority: undefined,
          dueDate: undefined,
        },
      };
      
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: action.data,
        isDirty: false,
      };
      
    case 'RESET_FORM':
      return {
        formData: createInitialFormData(),
        validationErrors: {
          title: undefined,
          description: undefined,
          priority: undefined,
          dueDate: undefined,
        },
        isDirty: false,
        isSubmitting: false,
      };
      
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
      
    default:
      return state;
  }
};

// Custom hook with comprehensive type safety
export const useTaskForm = (editingTask?: Task | null) => {
  const initialState: TaskFormState = useMemo(() => ({
    formData: createInitialFormData(editingTask),
    validationErrors: {
      title: undefined,
      description: undefined,
      priority: undefined,
      dueDate: undefined,
    },
    isDirty: false,
    isSubmitting: false,
  }), [editingTask]);

  const [state, dispatch] = useReducer(formReducer, initialState);

  // Type-safe field update handler
  const updateField = useCallback(<T extends TaskFormField>(
    field: T,
    value: string
  ) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  // Type-safe validation with error handling
  const validateForm = useCallback((): ValidationResult => {
    const sanitizedData = sanitizeFormData(state.formData);
    const result = validateTaskForm(sanitizedData);
    
    if (!result.isValid) {
      // Set validation errors in state
      result.errors.forEach(error => {
        dispatch({
          type: 'SET_VALIDATION_ERROR',
          field: error.field,
          error: error.message,
        });
      });
    } else {
      dispatch({ type: 'CLEAR_ALL_ERRORS' });
    }
    
    return result;
  }, [state.formData]);

  // Type-safe form submission
  const handleSubmit = useCallback((
    onSubmit: (data: ReturnType<typeof transformToTaskData>) => void | Promise<void>
  ) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
      
      try {
        const validationResult = validateForm();
        
        if (validationResult.isValid) {
          const taskData = transformToTaskData(validationResult.data);
          await onSubmit(taskData);
          dispatch({ type: 'RESET_FORM' });
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
      }
    };
  }, [validateForm]);

  // Type-safe form reset
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  // Type-safe field error getter
  const getFieldErrorMessage = useCallback((field: TaskFormField): string | undefined => {
    return state.validationErrors[field];
  }, [state.validationErrors]);

  // Computed properties with type safety
  const isValid = useMemo(() => {
    const result = validateTaskForm(state.formData);
    return result.isValid;
  }, [state.formData]);

  const hasErrors = useMemo(() => {
    return Object.values(state.validationErrors).some(error => error !== undefined);
  }, [state.validationErrors]);

  return {
    // State
    formData: state.formData,
    validationErrors: state.validationErrors,
    isDirty: state.isDirty,
    isSubmitting: state.isSubmitting,
    isValid,
    hasErrors,
    
    // Actions
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
    getFieldErrorMessage,
    
    // Utilities
    sanitizedData: useMemo(() => sanitizeFormData(state.formData), [state.formData]),
  } as const;
};

// Type-safe hook return type
export type UseTaskFormReturn = ReturnType<typeof useTaskForm>;