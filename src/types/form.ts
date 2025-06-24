/**
 * Enhanced type definitions for form handling with strict validation
 */

import { Task, TaskPriority } from './task';

// Form field names as a union type for type safety
export type TaskFormField = 'title' | 'description' | 'priority' | 'dueDate';

// Form data interface with strict typing
export interface TaskFormData {
  readonly title: string;
  readonly description: string;
  readonly priority: TaskPriority;
  readonly dueDate: string;
}

// Validation error types
export interface ValidationError {
  readonly field: TaskFormField;
  readonly message: string;
  readonly code: ValidationErrorCode;
}

export type ValidationErrorCode = 
  | 'REQUIRED'
  | 'MIN_LENGTH'
  | 'MAX_LENGTH'
  | 'INVALID_DATE'
  | 'PAST_DATE'
  | 'INVALID_FORMAT';

// Validation result type
export type ValidationResult<T = TaskFormData> = {
  readonly isValid: true;
  readonly data: T;
  readonly errors: readonly [];
} | {
  readonly isValid: false;
  readonly data: Partial<T>;
  readonly errors: readonly ValidationError[];
};

// Form state interface
export interface TaskFormState {
  readonly formData: TaskFormData;
  readonly validationErrors: Readonly<Record<TaskFormField, string | undefined>>;
  readonly isDirty: boolean;
  readonly isSubmitting: boolean;
}

// Form actions with discriminated unions for type safety
export type TaskFormAction = 
  | { readonly type: 'UPDATE_FIELD'; readonly field: TaskFormField; readonly value: string }
  | { readonly type: 'SET_VALIDATION_ERROR'; readonly field: TaskFormField; readonly error: string }
  | { readonly type: 'CLEAR_VALIDATION_ERROR'; readonly field: TaskFormField }
  | { readonly type: 'CLEAR_ALL_ERRORS' }
  | { readonly type: 'SET_FORM_DATA'; readonly data: TaskFormData }
  | { readonly type: 'RESET_FORM' }
  | { readonly type: 'SET_SUBMITTING'; readonly isSubmitting: boolean };

// Validation rules interface
export interface ValidationRule<T = string> {
  readonly validate: (value: T, formData: TaskFormData) => ValidationError | null;
  readonly message: string;
}

// Form configuration
export interface TaskFormConfig {
  readonly validation: {
    readonly [K in TaskFormField]: readonly ValidationRule[];
  };
  readonly initialData: TaskFormData;
}

// Props interfaces with strict typing
export interface TaskFormProps {
  readonly editingTask?: Task | null;
  readonly onCancel: () => void;
  readonly onSubmit?: (data: TaskFormData) => void | Promise<void>;
  readonly isLoading?: boolean;
  readonly className?: string;
}

// Form field props for reusable components
export interface FormFieldProps<T = string> {
  readonly id: string;
  readonly label: string;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly error?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

// Specific field prop types
export interface TextFieldProps extends FormFieldProps<string> {
  readonly type?: 'text' | 'email' | 'password';
  readonly maxLength?: number;
  readonly minLength?: number;
}

export interface TextAreaFieldProps extends FormFieldProps<string> {
  readonly rows?: number;
  readonly maxLength?: number;
  readonly showCharacterCount?: boolean;
}

export interface SelectFieldProps<T extends string> extends FormFieldProps<T> {
  readonly options: readonly { readonly value: T; readonly label: string }[];
}

export interface DateFieldProps extends FormFieldProps<string> {
  readonly min?: string;
  readonly max?: string;
}

// Type guards for runtime type checking
export const isValidTaskFormData = (data: unknown): data is TaskFormData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).title === 'string' &&
    typeof (data as any).description === 'string' &&
    ['low', 'medium', 'high'].includes((data as any).priority) &&
    typeof (data as any).dueDate === 'string'
  );
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as any).field === 'string' &&
    typeof (error as any).message === 'string' &&
    typeof (error as any).code === 'string'
  );
};

// Utility types for form handling
export type FormFieldValue<T extends TaskFormField> = 
  T extends 'title' | 'description' | 'dueDate' ? string :
  T extends 'priority' ? TaskPriority :
  never;

export type PartialTaskFormData = {
  readonly [K in TaskFormField]?: FormFieldValue<K>;
};

// Event handler types
export type FormFieldChangeHandler<T extends TaskFormField> = (
  field: T,
  value: FormFieldValue<T>
) => void;

export type FormSubmitHandler = (data: TaskFormData) => void | Promise<void>;
export type FormResetHandler = () => void;
export type FormValidationHandler = (data: TaskFormData) => ValidationResult;