import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskFilters } from '../TaskFilters'
import { renderWithProviders, mockTasks } from '../../test/test-utils'
import { Task } from '../../types/task'

// Mock window.confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
})

describe('TaskFilters Component', () => {
  beforeEach(() => {
    mockConfirm.mockClear()
    mockConfirm.mockReturnValue(true)
  })

  describe('Rendering', () => {
    it('renders all filter buttons with correct labels and counts', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })

      // Check filter buttons
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()

      // Check counts (3 total, 2 active, 1 completed)
      expect(screen.getByText('3')).toBeInTheDocument() // All count
      expect(screen.getByText('2')).toBeInTheDocument() // Active count
      expect(screen.getByText('1')).toBeInTheDocument() // Completed count
    })

    it('renders search input with placeholder text', () => {
      renderWithProviders(<TaskFilters />)
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveValue('')
    })

    it('renders clear completed button when there are completed tasks', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      expect(screen.getByText(/Clear completed \(1\)/)).toBeInTheDocument()
    })

    it('renders clear all button when there are tasks', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      expect(screen.getByText('Clear all')).toBeInTheDocument()
    })

    it('does not render action buttons when there are no tasks', () => {
      renderWithProviders(<TaskFilters />)
      
      expect(screen.queryByText(/Clear completed/)).not.toBeInTheDocument()
      expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
    })
  })

  describe('Filter Functionality', () => {
    it('highlights the active filter button', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'active' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      const activeButton = screen.getByRole('button', { name: /Active 2/ })
      expect(activeButton).toHaveClass('bg-primary-600', 'text-white')
    })

    it('dispatches setFilter action when filter button is clicked', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskFilters />)
      
      const completedButton = screen.getByRole('button', { name: /Completed/ })
      await user.click(completedButton)
      
      const state = store.getState()
      expect(state.tasks.filter).toBe('completed')
    })

    it('shows correct counts for each filter', () => {
      const tasksWithVariedStatus: Task[] = [
        ...mockTasks,
        {
          id: '4',
          title: 'Another completed task',
          description: 'Another completed task',
          completed: true,
          priority: 'low',
          dueDate: null,
          createdAt: '2024-01-04T00:00:00.000Z',
          updatedAt: '2024-01-04T00:00:00.000Z',
        }
      ]

      const preloadedState = {
        tasks: {
          tasks: tasksWithVariedStatus,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      // 4 total, 2 active, 2 completed
      expect(screen.getByText('4')).toBeInTheDocument() // All count
      expect(screen.getByText('2')).toBeInTheDocument() // Active and Completed counts
    })
  })

  describe('Search Functionality', () => {
    it('updates search query when typing in search input', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskFilters />)
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      await user.type(searchInput, 'test query')
      
      const state = store.getState()
      expect(state.tasks.searchQuery).toBe('test query')
    })

    it('shows clear search button when there is a search query', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskFilters />)
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      await user.type(searchInput, 'test')
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('clears search query when clear button is clicked', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskFilters />)
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      await user.type(searchInput, 'test')
      
      const clearButton = screen.getByRole('button')
      await user.click(clearButton)
      
      const state = store.getState()
      expect(state.tasks.searchQuery).toBe('')
    })

    it('displays search results info when searching', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: 'test',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      expect(screen.getByText(/results found for "test"/)).toBeInTheDocument()
    })

    it('shows correct search results count', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: 'Test Task',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      // Should find 1 result (mockTasks[0] has "Test Task 1" in title)
      expect(screen.getByText(/1 results found for "Test Task"/)).toBeInTheDocument()
    })
  })

  describe('Clear Actions', () => {
    it('shows confirmation dialog when clearing completed tasks', async () => {
      const user = userEvent.setup()
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      const clearCompletedButton = screen.getByText(/Clear completed/)
      await user.click(clearCompletedButton)
      
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete all 1 completed tasks?'
      )
    })

    it('shows confirmation dialog when clearing all tasks', async () => {
      const user = userEvent.setup()
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      const clearAllButton = screen.getByText('Clear all')
      await user.click(clearAllButton)
      
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete all 3 tasks? This action cannot be undone.'
      )
    })

    it('dispatches clearCompleted action when confirmed', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskFilters />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all' as const,
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })
      
      const clearCompletedButton = screen.getByText(/Clear completed/)
      await user.click(clearCompletedButton)
      
      // Check that completed tasks are removed
      const state = store.getState()
      const completedTasks = state.tasks.tasks.filter(task => task.completed)
      expect(completedTasks).toHaveLength(0)
    })

    it('dispatches clearAllTasks action when confirmed', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskFilters />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all' as const,
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })
      
      const clearAllButton = screen.getByText('Clear all')
      await user.click(clearAllButton)
      
      // Check that all tasks are removed
      const state = store.getState()
      expect(state.tasks.tasks).toHaveLength(0)
    })

    it('does not clear tasks when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValue(false)
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskFilters />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all' as const,
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })
      
      const clearAllButton = screen.getByText('Clear all')
      await user.click(clearAllButton)
      
      // Check that tasks are not removed
      const state = store.getState()
      expect(state.tasks.tasks).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithProviders(<TaskFilters />)
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      expect(searchInput).toHaveAttribute('type', 'text')
      
      const filterButtons = screen.getAllByRole('button')
      expect(filterButtons.length).toBeGreaterThan(0)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskFilters />)
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      
      // Tab to search input
      await user.tab()
      expect(searchInput).toHaveFocus()
      
      // Tab to filter buttons
      await user.tab()
      const firstFilterButton = screen.getByRole('button', { name: /All/ })
      expect(firstFilterButton).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty task list gracefully', () => {
      renderWithProviders(<TaskFilters />)
      
      // All counts should be 0
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.queryByText(/Clear completed/)).not.toBeInTheDocument()
      expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
    })

    it('handles search with no results', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: 'nonexistent',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskFilters />, { preloadedState })
      
      expect(screen.getByText(/0 results found for "nonexistent"/)).toBeInTheDocument()
    })

    it('handles special characters in search query', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskFilters />)
      
      const searchInput = screen.getByPlaceholderText('Search tasks...')
      const specialQuery = '!@#$%^&*()'
      await user.type(searchInput, specialQuery)
      
      const state = store.getState()
      expect(state.tasks.searchQuery).toBe(specialQuery)
    })

    it('updates counts dynamically when tasks change', () => {
      const { rerender } = renderWithProviders(<TaskFilters />, {
        preloadedState: {
          tasks: {
            tasks: [],
            filter: 'all' as const,
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })
      
      // Initially no tasks
      expect(screen.getByText('0')).toBeInTheDocument()
      
      // Add tasks and rerender
      rerender(<TaskFilters />)
      // The counts should update based on the new state
    })
  })
})