import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, updateTask, clearError } from '../store/taskSlice';
import { Task, TaskPriority } from '../types/task';
import { TaskFormProps } from '../types/form';
import { RootState } from '../store';
import { useTaskForm } from '../hooks/useTaskForm';

export const TaskForm: React.FC<TaskFormProps> = ({ 
  editingTask, 
  onCancel, 
  onSubmit,
  isLoading: externalLoading,
  className = ''
}) => {
  const dispatch = useDispatch();
  const { isLoading: reduxLoading, error } = useSelector((state: RootState) => state.tasks);
  
  // Use our type-safe form hook
  const {
    formData,
    validationErrors,
    isDirty,
    isSubmitting,
    isValid,
    hasErrors,
    updateField,
    handleSubmit,
    resetForm,
    getFieldErrorMessage,
  } = useTaskForm(editingTask);

  // Determine loading state with type safety
  const isLoading: boolean = externalLoading ?? reduxLoading ?? isSubmitting;

  // Clear errors on mount and unmount
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Type-safe form submission handler
  const onFormSubmit = handleSubmit(async (taskData) => {
    try {
      if (onSubmit) {
        await onSubmit(taskData);
      } else {
        // Default Redux submission
        if (editingTask) {
          dispatch(updateTask({
            id: editingTask.id,
            updates: taskData,
          }));
        } else {
          dispatch(addTask({
            ...taskData,
            completed: false,
          }));
        }
      }
      onCancel();
    } catch (error) {
      console.error('Task submission failed:', error);
    }
  });

  // Type-safe cancel handler
  const handleCancel = (): void => {
    resetForm();
    dispatch(clearError());
    onCancel();
  };

  // Type-safe priority color helper
  const getPriorityColor = (priority: TaskPriority): string => {
    const colorMap: Record<TaskPriority, string> = {
      high: 'border-error-300 bg-error-50',
      medium: 'border-warning-300 bg-warning-50',
      low: 'border-success-300 bg-success-50',
    } as const;
    
    return colorMap[priority] ?? 'border-gray-300 bg-gray-50';
  };

  // Type-safe priority options
  const priorityOptions: readonly { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ] as const;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in ${className}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-slide-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
              aria-label="Close form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md" role="alert">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={onFormSubmit} className="space-y-4" noValidate>
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  getFieldErrorMessage('title') ? 'border-error-300 bg-error-50' : 'border-gray-300'
                }`}
                placeholder="Enter task title"
                disabled={isLoading}
                aria-invalid={!!getFieldErrorMessage('title')}
                aria-describedby={getFieldErrorMessage('title') ? 'title-error' : undefined}
                required
              />
              {getFieldErrorMessage('title') && (
                <p id="title-error" className="mt-1 text-sm text-error-600" role="alert">
                  {getFieldErrorMessage('title')}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none ${
                  getFieldErrorMessage('description') ? 'border-error-300 bg-error-50' : 'border-gray-300'
                }`}
                placeholder="Enter task description"
                disabled={isLoading}
                aria-invalid={!!getFieldErrorMessage('description')}
                aria-describedby={getFieldErrorMessage('description') ? 'description-error' : 'description-count'}
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                {getFieldErrorMessage('description') && (
                  <p id="description-error" className="text-sm text-error-600" role="alert">
                    {getFieldErrorMessage('description')}
                  </p>
                )}
                <p id="description-count" className="text-xs text-gray-500 ml-auto">
                  {formData.description.length}/500
                </p>
              </div>
            </div>

            {/* Priority Field */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${getPriorityColor(formData.priority)}`}
                disabled={isLoading}
                aria-invalid={!!getFieldErrorMessage('priority')}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {getFieldErrorMessage('priority') && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {getFieldErrorMessage('priority')}
                </p>
              )}
            </div>

            {/* Due Date Field */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  getFieldErrorMessage('dueDate') ? 'border-error-300 bg-error-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
                aria-invalid={!!getFieldErrorMessage('dueDate')}
                aria-describedby={getFieldErrorMessage('dueDate') ? 'dueDate-error' : undefined}
              />
              {getFieldErrorMessage('dueDate') && (
                <p id="dueDate-error" className="mt-1 text-sm text-error-600" role="alert">
                  {getFieldErrorMessage('dueDate')}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby={hasErrors ? 'form-errors' : undefined}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editingTask ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  editingTask ? 'Update Task' : 'Add Task'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};