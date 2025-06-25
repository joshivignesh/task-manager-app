import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setFilter, setSearchQuery, clearCompleted, clearAllTasks } from '../store/taskSlice';
import { TaskFilter } from '../types/task';
import { useDebounce, useKeyboardShortcuts } from '../hooks';

export const TaskFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { filter, searchQuery, tasks } = useSelector((state: RootState) => state.tasks);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const activeTasksCount = tasks.filter(task => !task.completed).length;
  const totalTasksCount = tasks.length;

  // Keyboard shortcuts for search focus
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => searchInputRef.current?.focus(),
      description: 'Focus search input',
    },
    {
      key: 'k',
      metaKey: true,
      callback: () => searchInputRef.current?.focus(),
      description: 'Focus search input (Mac)',
    },
  ]);

  // Update search query with debounced value
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchQuery));
    }
  }, [debouncedSearchQuery, searchQuery, dispatch]);

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

  const handleClearAll = () => {
    if (totalTasksCount > 0 && window.confirm(`Are you sure you want to delete all ${totalTasksCount} tasks? This action cannot be undone.`)) {
      dispatch(clearAllTasks());
    }
  };

  const getFilterCount = (filterType: TaskFilter) => {
    switch (filterType) {
      case 'all': return totalTasksCount;
      case 'active': return activeTasksCount;
      case 'completed': return completedTasksCount;
      default: return 0;
    }
  };

  // Calculate filtered results for search
  const filteredResults = searchQuery ? tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).length : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 w-full lg:max-w-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks... (Ctrl+K)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['all', 'active', 'completed'] as TaskFilter[]).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => handleFilterChange(filterOption)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  filter === filterOption
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <span>{filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === filterOption
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {getFilterCount(filterOption)}
                </span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {completedTasksCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="px-3 py-1 text-sm font-medium text-error-600 hover:text-error-800 hover:bg-error-50 rounded-md transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear completed ({completedTasksCount})</span>
              </button>
            )}

            {totalTasksCount > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-error-600 hover:bg-error-50 rounded-md transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredResults} results found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};