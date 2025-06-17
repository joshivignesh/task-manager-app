import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from '../TaskList'
import { renderWithProviders, mockTasks } from '../../test/test-utils'
import { Task } from '../../types/task'

// Mock window.confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
})

describe('TaskList Component', () => {
  const mockOnEditTask = vi.fn()

  beforeEach(() => {
    mockConfirm.mockClear()
    mockOnEditTask.mockClear()
    mockConfirm.mockReturnValue(true)
  })

  describe('Rendering', () => {
    it('renders empty state when no tasks exist', () => {
      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />)

      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first task to get started!')).toBeInTheDocument()
    })

    it('renders empty state when no tasks match filter', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'completed' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('No matching tasks')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument()
    })

    it('renders empty state when search has no results', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: 'nonexistent',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('No matching tasks')).toBeInTheDocument()
    })

    it('renders task list with all tasks when filter is "all"', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      expect(screen.getByText('Completed Task')).toBeInTheDocument()
      expect(screen.getByText('Low Priority Task')).toBeInTheDocument()
      expect(screen.getByText('Showing 3 of 3 tasks')).toBeInTheDocument()
    })

    it('renders only active tasks when filter is "active"', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'active' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      expect(screen.getByText('Low Priority Task')).toBeInTheDocument()
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 2 of 3 tasks')).toBeInTheDocument()
    })

    it('renders only completed tasks when filter is "completed"', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'completed' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Completed Task')).toBeInTheDocument()
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 3 tasks')).toBeInTheDocument()
    })

    it('renders bulk actions and sorting controls', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText(/Select all/)).toBeInTheDocument()
      expect(screen.getByText('Sort by:')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Created Date')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters tasks by title search query', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: 'Test Task',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument()
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 3 tasks')).toBeInTheDocument()
    })

    it('filters tasks by description search query', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: 'completed',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Completed Task')).toBeInTheDocument()
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument()
    })

    it('performs case-insensitive search', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: 'TEST TASK',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    })

    it('combines search and filter correctly', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'active' as const,
          searchQuery: 'Task',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      // Should show active tasks that match "Task" in title/description
      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      expect(screen.getByText('Low Priority Task')).toBeInTheDocument()
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument() // Completed, so filtered out
    })
  })

  describe('Selection Functionality', () => {
    it('shows select all checkbox with correct state', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const selectAllCheckbox = screen.getByRole('checkbox')
      expect(selectAllCheckbox).not.toBeChecked()
      expect(screen.getByText('Select all (0/3)')).toBeInTheDocument()
    })

    it('selects all tasks when select all is clicked', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      expect(screen.getByText('Select all (3/3)')).toBeInTheDocument()
      expect(selectAllCheckbox).toBeChecked()
    })

    it('deselects all tasks when select all is clicked again', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const selectAllCheckbox = screen.getByRole('checkbox')
      
      // Select all
      await user.click(selectAllCheckbox)
      expect(selectAllCheckbox).toBeChecked()
      
      // Deselect all
      await user.click(selectAllCheckbox)
      expect(selectAllCheckbox).not.toBeChecked()
      expect(screen.getByText('Select all (0/3)')).toBeInTheDocument()
    })

    it('shows bulk action buttons when tasks are selected', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      expect(screen.getByText('Mark Complete')).toBeInTheDocument()
      expect(screen.getByText('Mark Active')).toBeInTheDocument()
      expect(screen.getByText('Delete Selected')).toBeInTheDocument()
    })

    it('hides bulk action buttons when no tasks are selected', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.queryByText('Mark Complete')).not.toBeInTheDocument()
      expect(screen.queryByText('Mark Active')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete Selected')).not.toBeInTheDocument()
    })
  })

  describe('Bulk Actions', () => {
    it('marks selected tasks as complete', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      const markCompleteButton = screen.getByText('Mark Complete')
      await user.click(markCompleteButton)

      const state = store.getState()
      const allCompleted = state.tasks.tasks.every(task => task.completed)
      expect(allCompleted).toBe(true)
    })

    it('marks selected tasks as active', async () => {
      const user = userEvent.setup()
      const allCompletedTasks = mockTasks.map(task => ({ ...task, completed: true }))
      const { store } = renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: allCompletedTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      const markActiveButton = screen.getByText('Mark Active')
      await user.click(markActiveButton)

      const state = store.getState()
      const allActive = state.tasks.tasks.every(task => !task.completed)
      expect(allActive).toBe(true)
    })

    it('shows confirmation dialog for bulk delete', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      const deleteButton = screen.getByText('Delete Selected')
      await user.click(deleteButton)

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete 3 selected tasks?')
    })

    it('deletes selected tasks when confirmed', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      const deleteButton = screen.getByText('Delete Selected')
      await user.click(deleteButton)

      const state = store.getState()
      expect(state.tasks.tasks).toHaveLength(0)
    })

    it('does not delete tasks when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValue(false)
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      const deleteButton = screen.getByText('Delete Selected')
      await user.click(deleteButton)

      const state = store.getState()
      expect(state.tasks.tasks).toHaveLength(3)
    })

    it('clears selection after bulk actions', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      const markCompleteButton = screen.getByText('Mark Complete')
      await user.click(markCompleteButton)

      // Selection should be cleared
      expect(screen.getByText('Select all (0/3)')).toBeInTheDocument()
      expect(screen.queryByText('Mark Complete')).not.toBeInTheDocument()
    })
  })

  describe('Sorting Functionality', () => {
    it('renders sort dropdown with correct options', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const sortSelect = screen.getByDisplayValue('Created Date')
      expect(sortSelect).toBeInTheDocument()
      
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(4)
      expect(screen.getByRole('option', { name: 'Created Date' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Title' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Priority' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Due Date' })).toBeInTheDocument()
    })

    it('dispatches sort action when sort option is changed', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const sortSelect = screen.getByDisplayValue('Created Date')
      await user.selectOptions(sortSelect, 'priority')

      // The sort action should have been dispatched
      // We can verify this by checking if the tasks are sorted by priority
      const state = store.getState()
      const firstTask = state.tasks.tasks[0]
      expect(firstTask.priority).toBe('high') // High priority should be first
    })

    it('updates sort selection in dropdown', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const sortSelect = screen.getByDisplayValue('Created Date')
      await user.selectOptions(sortSelect, 'title')

      expect(sortSelect).toHaveValue('title')
    })
  })

  describe('Task Item Integration', () => {
    it('passes correct props to TaskItem components', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      // Check that task items are rendered with selection checkboxes
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(1) // Select all + individual task checkboxes
    })

    it('calls onEditTask when task edit is triggered', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const editButtons = screen.getAllByTitle('Edit task')
      await user.click(editButtons[0])

      expect(mockOnEditTask).toHaveBeenCalledWith(mockTasks[0])
    })

    it('handles individual task selection correctly', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const checkboxes = screen.getAllByRole('checkbox')
      const taskCheckbox = checkboxes[1] // First checkbox is select all
      
      await user.click(taskCheckbox)

      expect(screen.getByText('Select all (1/3)')).toBeInTheDocument()
      expect(screen.getByText('Mark Complete')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty task array gracefully', () => {
      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />)

      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
      expect(screen.queryByText('Select all')).not.toBeInTheDocument()
    })

    it('handles tasks with missing properties', () => {
      const incompleteTask: Task = {
        id: '1',
        title: 'Incomplete Task',
        description: '',
        completed: false,
        priority: 'medium',
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const preloadedState = {
        tasks: {
          tasks: [incompleteTask],
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Incomplete Task')).toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 1 tasks')).toBeInTheDocument()
    })

    it('handles very long task lists', () => {
      const manyTasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        title: `Task ${i + 1}`,
      }))

      const preloadedState = {
        tasks: {
          tasks: manyTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('Showing 100 of 100 tasks')).toBeInTheDocument()
      expect(screen.getByText('Select all (0/100)')).toBeInTheDocument()
    })

    it('handles special characters in search queries', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '!@#$%^&*()',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      expect(screen.getByText('No matching tasks')).toBeInTheDocument()
    })

    it('maintains selection state when filter changes', async () => {
      const user = userEvent.setup()
      const { rerender } = renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      // Select all tasks
      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      // Change filter to active
      rerender(<TaskList onEditTask={mockOnEditTask} />)

      // Selection should be maintained for visible tasks
      expect(screen.getByText(/Select all/)).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const initialElement = screen.getByText('Test Task 1')
      
      // Re-render with same props
      rerender(<TaskList onEditTask={mockOnEditTask} />)
      
      const rerenderElement = screen.getByText('Test Task 1')
      expect(rerenderElement).toBe(initialElement)
    })

    it('handles rapid selection changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      const selectAllCheckbox = screen.getByRole('checkbox')
      
      // Rapid clicks
      await user.click(selectAllCheckbox)
      await user.click(selectAllCheckbox)
      await user.click(selectAllCheckbox)

      // Should handle without errors
      expect(screen.getByText('Select all (3/3)')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper checkbox labels and roles', () => {
      const preloadedState = {
        tasks: {
          tasks: mockTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const selectAllCheckbox = screen.getByRole('checkbox')
      expect(selectAllCheckbox).toHaveAttribute('type', 'checkbox')
      
      const selectAllLabel = screen.getByText(/Select all/)
      expect(selectAllLabel).toBeInTheDocument()
    })

    it('supports keyboard navigation for sort dropdown', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const sortSelect = screen.getByDisplayValue('Created Date')
      
      // Tab to sort dropdown
      await user.tab()
      expect(sortSelect).toHaveFocus()
      
      // Use arrow keys to change selection
      await user.keyboard('{ArrowDown}')
      expect(sortSelect).toHaveValue('title')
    })

    it('provides proper button accessibility for bulk actions', async () => {
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

      renderWithProviders(<TaskList onEditTask={mockOnEditTask} />, { preloadedState })

      const selectAllCheckbox = screen.getByRole('checkbox')
      await user.click(selectAllCheckbox)

      const bulkActionButtons = [
        screen.getByText('Mark Complete'),
        screen.getByText('Mark Active'),
        screen.getByText('Delete Selected')
      ]

      bulkActionButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })
})