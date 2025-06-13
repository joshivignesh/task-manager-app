import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { deleteMultipleTasks, toggleMultipleTasks, sortTasks } from '../store/taskSlice';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const dispatch = useDispatch();
  const { tasks, filter, searchQuery } = useSelector((state: RootState) => state.tasks);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt' | 'title'>('createdAt');

  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed);

    return matchesSearch && matchesFilter;
  });

  const handleSelectTask = (taskId: string, selected: boolean) => {
    const newSelectedTasks = new Set(selectedTasks);
    if (selected) {
      newSelectedTasks.add(taskId);
    } else {
      newSelectedTasks.delete(taskId);
    }
    setSelectedTasks(newSelectedTasks);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTasks.size > 0 && window.confirm(`Are you sure you want to delete ${selectedTasks.size} selected tasks?`)) {
      dispatch(deleteMultipleTasks(Array.from(selectedTasks)));
      setSelectedTasks(new Set());
    }
  };

  const handleBulkToggle = (completed: boolean) => {
    if (selectedTasks.size > 0) {
      dispatch(toggleMultipleTasks({ ids: Array.from(selectedTasks), completed }));
      setSelectedTasks(new Set());
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    dispatch(sortTasks(newSortBy));
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          {searchQuery || filter !== 'all' ? 'No matching tasks' : 'No tasks yet'}
        </h3>
        <p className="text-gray-500">
          {searchQuery || filter !== 'all' 
            ? 'Try adjusting your search or filter criteria'
            : 'Create your first task to get started!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">
              Select all ({selectedTasks.size}/{filteredTasks.length})
            </span>
          </label>

          {selectedTasks.size > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkToggle(true)}
                className="px-3 py-1 text-sm bg-success-100 text-success-700 rounded-md hover:bg-success-200 transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleBulkToggle(false)}
                className="px-3 py-1 text-sm bg-warning-100 text-warning-700 rounded-md hover:bg-warning-200 transition-colors"
              >
                Mark Active
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-error-100 text-error-700 rounded-md hover:bg-error-200 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-0">
        {filteredTasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onEdit={onEditTask}
            isSelected={selectedTasks.has(task.id)}
            onSelect={handleSelectTask}
          />
        ))}
      </div>

      {/* Task Count */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>
    </div>
  );
};