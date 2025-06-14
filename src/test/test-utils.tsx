import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import taskReducer from '../store/taskSlice'
import { Task } from '../types/task'

// Create a custom render function that includes Redux Provider
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: {
    tasks: {
      tasks: Task[]
      filter: 'all' | 'active' | 'completed'
      searchQuery: string
      isLoading: boolean
      error: string | null
    }
  }
  store?: ReturnType<typeof configureStore>
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {
      tasks: {
        tasks: [],
        filter: 'all',
        searchQuery: '',
        isLoading: false,
        error: null,
      }
    },
    store = configureStore({
      reducer: {
        tasks: taskReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Mock tasks for testing
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'This is a test task',
    completed: false,
    priority: 'high',
    dueDate: '2024-12-31',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Completed Task',
    description: 'This task is completed',
    completed: true,
    priority: 'medium',
    dueDate: null,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Low Priority Task',
    description: 'This is a low priority task',
    completed: false,
    priority: 'low',
    dueDate: '2024-06-15',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
]

export * from '@testing-library/react'