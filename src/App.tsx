import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskFilters } from './components/TaskFilters';
import { TaskStats } from './components/TaskStats';
import { DataManager } from './components/DataManager';
import { Task } from './types/task';

function AppContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleAddTask = () => {
    setShowForm(true);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setShowForm(true);
    setEditingTask(task);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const showSuccessNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to add new task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleAddTask();
      }
      
      // Escape to close form
      if (e.key === 'Escape' && showForm) {
        handleCloseForm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  // Show storage notification on first load
  useEffect(() => {
    const hasShownStorageInfo = localStorage.getItem('taskManagerPro_hasShownStorageInfo');
    if (!hasShownStorageInfo) {
      setTimeout(() => {
        showSuccessNotification('Your tasks are automatically saved to your browser!');
        localStorage.setItem('taskManagerPro_hasShownStorageInfo', 'true');
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Manager Pro</h1>
          <p className="text-gray-600">Organize your tasks efficiently and boost productivity</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-2">
            <p className="text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+N</kbd> to add a new task
            </p>
            <span className="hidden sm:inline text-gray-300">•</span>
            <p className="text-sm text-gray-500">
              Data automatically saved locally
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <button
            onClick={handleAddTask}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center space-x-2 animate-bounce-subtle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Task</span>
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Full CRUD operations with data persistence</span>
          </div>
        </div>

        {/* Task Stats */}
        <TaskStats />

        {/* Task Filters */}
        <TaskFilters />

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Tasks</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Auto-saved to browser storage</span>
            </div>
          </div>
          <TaskList onEditTask={handleEditTask} />
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            editingTask={editingTask}
            onCancel={handleCloseForm}
          />
        )}

        {/* Data Manager */}
        <DataManager />

        {/* Success Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-success-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{notificationMessage}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Task Manager Pro - Built with React, Redux, and TypeScript</p>
          <p className="mt-1">Features: Create, Read, Update, Delete, Search, Filter, Sort, Bulk Actions, Data Persistence</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;