import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleTask, deleteTask, updateTaskPriority, duplicateTask } from '../store/taskSlice';
import { Task, TaskPriority } from '../types/task';
import { useClickOutside, useToggle } from '../hooks';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onEdit, 
  isSelected = false, 
  onSelect 
}) => {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use custom hooks for priority menu management
  const {
    value: showPriorityMenu,
    setTrue: openPriorityMenu,
    setFalse: closePriorityMenu,
  } = useToggle(false);

  // Click outside to close priority menu
  const priorityMenuRef = useClickOutside<HTMLDivElement>(closePriorityMenu, showPriorityMenu);

  const handleToggle = () => {
    dispatch(toggleTask(task.id));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      // Add a small delay for better UX
      setTimeout(() => {
        dispatch(deleteTask(task.id));
      }, 300);
    }
  };

  const handleDuplicate = () => {
    dispatch(duplicateTask(task.id));
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    dispatch(updateTaskPriority({ id: task.id, priority: newPriority }));
    closePriorityMenu();
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(task.id, e.target.checked);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-error-500 bg-error-50';
      case 'medium': return 'border-l-warning-500 bg-warning-50';
      case 'low': return 'border-l-success-500 bg-success-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error-100 text-error-800 border-error-200';
      case 'medium': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'low': return 'bg-success-100 text-success-800 border-success-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(task.priority)} p-4 mb-3 hover:shadow-md transition-all duration-200 animate-fade-in ${
      task.completed ? 'opacity-75' : ''
    } ${isDeleting ? 'animate-pulse opacity-50' : ''} ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex items-start space-x-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
        )}

        <button
          onClick={handleToggle}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-success-500 border-success-500 text-white scale-110'
              : 'border-gray-300 hover:border-success-400 hover:bg-success-50'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-lg font-medium transition-all duration-200 ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="relative" ref={priorityMenuRef}>
                <button
                  onClick={openPriorityMenu}
                  className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${getPriorityBadge(task.priority)}`}
                >
                  {task.priority}
                </button>
                
                {showPriorityMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-600 mb-2">Change Priority:</p>
                      {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(priority)}
                          className={`block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                            task.priority === priority ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {task.description && (
            <p className={`text-sm mb-2 transition-all duration-200 ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {task.dueDate && (
                <span className={`flex items-center space-x-1 ${
                  isOverdue ? 'text-error-600 font-medium' :
                  isDueToday ? 'text-warning-600 font-medium' : ''
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {isOverdue ? 'Overdue' : isDueToday ? 'Due today' : `Due ${new Date(task.dueDate).toLocaleDateString()}`}
                  </span>
                </span>
              )}
              <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              {task.updatedAt !== task.createdAt && (
                <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleDuplicate}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                title="Duplicate task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                title="Edit task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 text-gray-400 hover:text-error-600 transition-colors disabled:opacity-50"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};