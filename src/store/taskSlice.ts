import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilter } from '../types/task';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  searchQuery: string;
}

const initialState: TaskState = {
  tasks: [
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
  ],
  filter: 'all',
  searchQuery: '',
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.tasks.unshift(newTask);
    },
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
      }
    },
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearCompleted: (state) => {
      state.tasks = state.tasks.filter(task => !task.completed);
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  setFilter,
  setSearchQuery,
  clearCompleted,
} = taskSlice.actions;

export default taskSlice.reducer;