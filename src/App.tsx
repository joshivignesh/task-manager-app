import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskFilters } from './components/TaskFilters';
import { TaskStats } from './components/TaskStats';
import { Task } from './types/task';

function AppContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Manager</h1>
          <p className="text-gray-600">Organize your tasks efficiently and boost productivity</p>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleAddTask}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center space-x-2 animate-bounce-subtle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Task</span>
          </button>
        </div>

        {/* Task Stats */}
        <TaskStats />

        {/* Task Filters */}
        <TaskFilters />

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TaskList onEditTask={handleEditTask} />
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            editingTask={editingTask}
            onCancel={handleCloseForm}
          />
        )}
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