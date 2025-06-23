import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilter } from '../types/task';
import { loadTasks, saveTasks } from '../utils/storage';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastSaved: string | null;
  autoSave: boolean;
}

// Load initial tasks from localStorage
const loadInitialTasks = (): Task[] => {
  try {
    const savedTasks = loadTasks();
    if (savedTasks.length > 0) {
      console.log(`Loaded ${savedTasks.length} tasks from localStorage`);
      return savedTasks;
    }
  } catch (error) {
    console.error('Failed to load initial tasks:', error);
  }

  // Return default tasks if no saved tasks or error occurred
  return [
    {
      id: '1',
      title: 'Complete Redux setup',
      description: 'Set up Redux store and task slice for state management',
      completed: true,
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Design task interface',
      description: 'Create a beautiful and intuitive task management interface',
      completed: false,
      priority: 'medium',
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Add CRUD operations',
      description: 'Implement create, read, update, and delete functionality',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const initialState: TaskState = {
  tasks: loadInitialTasks(),
  filter: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,
  lastSaved: null,
  autoSave: true,
};

// Helper function to save tasks to localStorage
const _saveTasksToStorageInternal = (tasks: Task[], state: TaskState) => {
  if (state.autoSave) {
    try {
      const success = saveTasks(tasks);
      if (success) {
        state.lastSaved = new Date().toISOString();
      } else {
        state.error = 'Failed to save tasks to localStorage';
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
      state.error = 'Failed to save tasks to localStorage';
    }
  }
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // CREATE operations
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      state.tasks.unshift(newTask);
      _saveTasksToStorageInternal(state.tasks, state);
    },

    addMultipleTasks: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]>) => {
      const newTasks = action.payload.map(taskData => ({
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      state.tasks.unshift(...newTasks);
      _saveTasksToStorageInternal(state.tasks, state);
    },

    // READ operations (filtering and searching)
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    sortTasks: (state, action: PayloadAction<'priority' | 'dueDate' | 'createdAt' | 'title'>) => {
      const sortBy = action.payload;
      state.tasks.sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'dueDate':
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
      _saveTasksToStorageInternal(state.tasks, state);
    },

    // UPDATE operations
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === id);
      
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        _saveTasksToStorageInternal(state.tasks, state);
      } else {
        state.error = 'Task not found';
      }
    },

    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        _saveTasksToStorageInternal(state.tasks, state);
      } else {
        state.error = 'Task not found';
      }
    },

    toggleMultipleTasks: (state, action: PayloadAction<{ ids: string[]; completed: boolean }>) => {
      const { ids, completed } = action.payload;
      ids.forEach(id => {
        const task = state.tasks.find(task => task.id === id);
        if (task) {
          task.completed = completed;
          task.updatedAt = new Date().toISOString();
        }
      });
      _saveTasksToStorageInternal(state.tasks, state);
    },

    updateTaskPriority: (state, action: PayloadAction<{ id: string; priority: 'low' | 'medium' | 'high' }>) => {
      const { id, priority } = action.payload;
      const task = state.tasks.find(task => task.id === id);
      if (task) {
        task.priority = priority;
        task.updatedAt = new Date().toISOString();
        _saveTasksToStorageInternal(state.tasks, state);
      } else {
        state.error = 'Task not found';
      }
    },

    // DELETE operations
    deleteTask: (state, action: PayloadAction<string>) => {
      const initialLength = state.tasks.length;
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      
      if (state.tasks.length === initialLength) {
        state.error = 'Task not found';
      } else {
        _saveTasksToStorageInternal(state.tasks, state);
      }
    },

    deleteMultipleTasks: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = action.payload;
      state.tasks = state.tasks.filter(task => !idsToDelete.includes(task.id));
      _saveTasksToStorageInternal(state.tasks, state);
    },

    clearCompleted: (state) => {
      state.tasks = state.tasks.filter(task => !task.completed);
      _saveTasksToStorageInternal(state.tasks, state);
    },

    clearAllTasks: (state) => {
      state.tasks = [];
      _saveTasksToStorageInternal(state.tasks, state);
    },

    // Utility operations
    duplicateTask: (state, action: PayloadAction<string>) => {
      const taskToDuplicate = state.tasks.find(task => task.id === action.payload);
      if (taskToDuplicate) {
        const duplicatedTask: Task = {
          ...taskToDuplicate,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: `${taskToDuplicate.title} (Copy)`,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.tasks.unshift(duplicatedTask);
        _saveTasksToStorageInternal(state.tasks, state);
      } else {
        state.error = 'Task not found';
      }
    },

    // Storage operations
    loadTasksFromStorage: (state) => {
      try {
        const savedTasks = loadTasks();
        state.tasks = savedTasks;
        state.lastSaved = new Date().toISOString();
        state.error = null;
      } catch (error) {
        state.error = 'Failed to load tasks from storage';
        console.error('Error loading tasks:', error);
      }
    },

    saveTasksToStorage: (state) => {
      try {
        const success = saveTasks(state.tasks);
        if (success) {
          state.lastSaved = new Date().toISOString();
          state.error = null;
        } else {
          state.error = 'Failed to save tasks to storage';
        }
      } catch (error) {
        state.error = 'Failed to save tasks to storage';
        console.error('Error saving tasks:', error);
      }
    },

    importTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      _saveTasksToStorageInternal(state.tasks, state);
    },

    toggleAutoSave: (state) => {
      state.autoSave = !state.autoSave;
      if (state.autoSave) {
        _saveTasksToStorageInternal(state.tasks, state);
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  addTask,
  addMultipleTasks,
  updateTask,
  deleteTask,
  deleteMultipleTasks,
  toggleTask,
  toggleMultipleTasks,
  updateTaskPriority,
  setFilter,
  setSearchQuery,
  sortTasks,
  clearCompleted,
  clearAllTasks,
  duplicateTask,
  loadTasksFromStorage,
  saveTasksToStorage,
  importTasks,
  toggleAutoSave,
  clearError,
  setLoading,
} = taskSlice.actions;

export default taskSlice.reducer;