import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setFilter, setSearchQuery, clearCompleted } from '../store/taskSlice';
import { TaskFilter } from '../types/task';

export const TaskFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { filter, searchQuery, tasks } = useSelector((state: RootState) => state.tasks);

  const completedTasksCount = tasks.filter(task => task.completed).length;

  const handleFilterChange = (newFilter: TaskFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleClearCompleted = () => {
    if (completedTasksCount > 0 && window.confirm(`Are you sure you want to delete all ${completedTasksCount} completed tasks?`)) {
      dispatch(clearCompleted());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['all', 'active', 'completed'] as TaskFilter[]).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => handleFilterChange(filterOption)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          {completedTasksCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="px-3 py-1 text-sm font-medium text-error-600 hover:text-error-800 hover:bg-error-50 rounded-md transition-colors"
            >
              Clear completed ({completedTasksCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};