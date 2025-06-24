/**
 * Type-safe validation utilities for form handling
 */

import { 
  TaskFormData, 
  TaskFormField, 
  ValidationError, 
  ValidationResult, 
  ValidationRule,
  ValidationErrorCode 
} from '../types/form';

// Validation error factory with type safety
const createValidationError = (
  field: TaskFormField,
  code: ValidationErrorCode,
  message: string
): ValidationError => ({
  field,
  code,
  message,
} as const);

// Individual validation functions with strict typing
export const validateTitle = (title: string): ValidationError | null => {
  const trimmedTitle = title.trim();
  
  if (!trimmedTitle) {
    return createValidationError('title', 'REQUIRED', 'Title is required');
  }
  
  if (trimmedTitle.length < 3) {
    return createValidationError('title', 'MIN_LENGTH', 'Title must be at least 3 characters long');
  }
  
  if (trimmedTitle.length > 100) {
    return createValidationError('title', 'MAX_LENGTH', 'Title must be less than 100 characters');
  }
  
  return null;
};

export const validateDescription = (description: string): ValidationError | null => {
  if (description.length > 500) {
    return createValidationError('description', 'MAX_LENGTH', 'Description must be less than 500 characters');
  }
  
  return null;
};

export const validateDueDate = (dueDate: string): ValidationError | null => {
  if (!dueDate) {
    return null; // Due date is optional
  }
  
  const selectedDate = new Date(dueDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(selectedDate.getTime())) {
    return createValidationError('dueDate', 'INVALID_FORMAT', 'Invalid date format');
  }
  
  if (selectedDate < today) {
    return createValidationError('dueDate', 'PAST_DATE', 'Due date cannot be in the past');
  }
  
  return null;
};

// Validation rules configuration with type safety
export const validationRules: Record<TaskFormField, readonly ValidationRule[]> = {
  title: [
    {
      validate: (value: string) => validateTitle(value),
      message: 'Title validation failed',
    },
  ] as const,
  description: [
    {
      validate: (value: string) => validateDescription(value),
      message: 'Description validation failed',
    },
  ] as const,
  priority: [] as const, // Priority is always valid as it's a select
  dueDate: [
    {
      validate: (value: string) => validateDueDate(value),
      message: 'Due date validation failed',
    },
  ] as const,
} as const;

// Main validation function with comprehensive type safety
export const validateTaskForm = (formData: TaskFormData): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validate each field using type-safe approach
  (Object.keys(validationRules) as TaskFormField[]).forEach((field) => {
    const fieldRules = validationRules[field];
    const fieldValue = formData[field];
    
    fieldRules.forEach((rule) => {
      const error = rule.validate(fieldValue, formData);
      if (error) {
        errors.push(error);
      }
    });
  });
  
  if (errors.length === 0) {
    return {
      isValid: true,
      data: formData,
      errors: [],
    } as const;
  }
  
  return {
    isValid: false,
    data: formData,
    errors: errors as readonly ValidationError[],
  } as const;
};

// Type-safe error message extraction
export const getFieldError = (
  errors: readonly ValidationError[],
  field: TaskFormField
): string | undefined => {
  const fieldError = errors.find(error => error.field === field);
  return fieldError?.message;
};

// Type-safe form data sanitization
export const sanitizeFormData = (rawData: Partial<TaskFormData>): TaskFormData => {
  return {
    title: (rawData.title ?? '').trim(),
    description: (rawData.description ?? '').trim(),
    priority: rawData.priority ?? 'medium',
    dueDate: rawData.dueDate ?? '',
  } as const;
};

// Type-safe form data comparison
export const isFormDataEqual = (a: TaskFormData, b: TaskFormData): boolean => {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.priority === b.priority &&
    a.dueDate === b.dueDate
  );
};

// Type-safe form data transformation
export const transformToTaskData = (formData: TaskFormData) => {
  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    priority: formData.priority,
    dueDate: formData.dueDate || null,
  } as const;
};