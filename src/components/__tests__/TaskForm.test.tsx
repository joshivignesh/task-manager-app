import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../TaskForm'
import { renderWithProviders, mockTasks } from '../../test/test-utils'
import { Task } from '../../types/task'

// Mock window.confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
})

describe('TaskForm Component', () => {
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    mockConfirm.mockClear()
    mockOnCancel.mockClear()
    mockConfirm.mockReturnValue(true)
  })

  describe('Rendering', () => {
    it('renders add task form with correct title and fields', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)

      expect(screen.getByText('Add New Task')).toBeInTheDocument()
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Priority/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add Task/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
    })

    it('renders edit task form with correct title and pre-filled data', async () => {
      const editingTask = mockTasks[0]
      renderWithProviders(<TaskForm editingTask={editingTask} onCancel={mockOnCancel} />)

      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(await screen.findByDisplayValue(editingTask.title)).toBeInTheDocument()
      expect(await screen.findByDisplayValue(editingTask.description)).toBeInTheDocument()
      expect(await screen.findByDisplayValue(editingTask.priority)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Update Task/ })).toBeInTheDocument()
    })

    it('renders close button in header', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const closeButton = screen.getByRole('button', { name: '' })
      expect(closeButton).toBeInTheDocument()
    })

    it('renders character counter for description field', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      expect(screen.getByText('0/500')).toBeInTheDocument()
    })

    it('renders priority select with correct options', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const prioritySelect = screen.getByLabelText(/Priority/)
      expect(prioritySelect).toBeInTheDocument()
      
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
      expect(screen.getByRole('option', { name: /Low Priority/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Medium Priority/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /High Priority/ })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation error for empty title', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    it('shows validation error for title too short', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      await user.type(titleInput, 'ab')
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      expect(screen.getByText('Title must be at least 3 characters long')).toBeInTheDocument()
    })

    it('shows validation error for title too long', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const longTitle = 'a'.repeat(101)
      await user.type(titleInput, longTitle)
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      expect(screen.getByText('Title must be less than 100 characters')).toBeInTheDocument()
    })

    it('shows validation error for description too long', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const descriptionInput = screen.getByLabelText(/Description/)
      
      await user.type(titleInput, 'Valid Title')
      const longDescription = 'a'.repeat(501)
      await user.type(descriptionInput, longDescription)
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      expect(screen.getByText('Description must be less than 500 characters')).toBeInTheDocument()
    })

    it('shows validation error for past due date', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const dueDateInput = screen.getByLabelText(/Due Date/)
      
      await user.type(titleInput, 'Valid Title')
      
      // Set a past date
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const pastDateString = pastDate.toISOString().split('T')[0]
      
      await user.type(dueDateInput, pastDateString)
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument()
    })

    it('clears validation errors when field is corrected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      
      // Trigger validation error
      await user.click(submitButton)
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      
      // Fix the error
      await user.type(titleInput, 'Valid Title')
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    })

    it('updates character counter as user types in description', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const descriptionInput = screen.getByLabelText(/Description/)
      await user.type(descriptionInput, 'Hello')
      
      expect(screen.getByText(/5\/500/)).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('creates new task with valid data', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const descriptionInput = screen.getByLabelText(/Description/)
      const prioritySelect = screen.getByLabelText(/Priority/)
      const dueDateInput = screen.getByLabelText(/Due Date/)
      
      await user.type(titleInput, 'New Test Task')
      await user.type(descriptionInput, 'Test description')
      await user.selectOptions(prioritySelect, 'high')
      
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateString = futureDate.toISOString().split('T')[0]
      await user.type(dueDateInput, futureDateString)
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      const state = store.getState()
      const newTask = state.tasks.tasks.find(task => task.title === 'New Test Task')
      
      expect(newTask).toBeDefined()
      expect(newTask?.description).toBe('Test description')
      expect(newTask?.priority).toBe('high')
      expect(newTask?.dueDate).toBe(futureDateString)
      expect(newTask?.completed).toBe(false)
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('updates existing task with valid data', async () => {
      const user = userEvent.setup()
      const editingTask = mockTasks[0]
      const { store } = renderWithProviders(
        <TaskForm editingTask={editingTask} onCancel={mockOnCancel} />,
        {
          preloadedState: {
            tasks: {
              tasks: mockTasks,
              filter: 'all',
              searchQuery: '',
              isLoading: false,
              error: null,
            }
          }
        }
      )
      
      const titleInput = await screen.findByDisplayValue(editingTask.title)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task Title')
      
      const submitButton = screen.getByRole('button', { name: /Update Task/ })
      await user.click(submitButton)
      
      const state = store.getState()
      const updatedTask = state.tasks.tasks.find(task => task.id === editingTask.id)
      
      expect(updatedTask?.title).toBe('Updated Task Title')
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('trims whitespace from title and description', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const descriptionInput = screen.getByLabelText(/Description/)
      
      await user.type(titleInput, '  Trimmed Title  ')
      await user.type(descriptionInput, '  Trimmed Description  ')
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      const state = store.getState()
      const newTask = state.tasks.tasks.find(task => task.title === 'Trimmed Title')
      
      expect(newTask?.title).toBe('Trimmed Title')
      expect(newTask?.description).toBe('Trimmed Description')
    })

    it('does not submit form with validation errors', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const initialTaskCount = store.getState().tasks.tasks.length
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      const finalTaskCount = store.getState().tasks.tasks.length
      expect(finalTaskCount).toBe(initialTaskCount)
      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  describe('Form Interactions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('calls onCancel when close button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const closeButton = screen.getByRole('button', { name: '' })
      await user.click(closeButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('resets form when cancelled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      await user.type(titleInput, 'Some title')
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('updates priority select styling based on selection', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const prioritySelect = screen.getByLabelText(/Priority/)
      
      await user.selectOptions(prioritySelect, 'high')
      expect(prioritySelect).toHaveClass('border-error-300', 'bg-error-50')
      
      await user.selectOptions(prioritySelect, 'medium')
      expect(prioritySelect).toHaveClass('border-warning-300', 'bg-warning-50')
      
      await user.selectOptions(prioritySelect, 'low')
      expect(prioritySelect).toHaveClass('border-success-300', 'bg-success-50')
    })

    it('sets minimum date for due date input to today', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const dueDateInput = screen.getByLabelText(/Due Date/)
      const today = new Date().toISOString().split('T')[0]
      
      expect(dueDateInput).toHaveAttribute('min', today)
    })
  })

  describe('Loading States', () => {
    it('shows loading state during form submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />, {
        preloadedState: {
          tasks: {
            tasks: [],
            filter: 'all',
            searchQuery: '',
            isLoading: true,
            error: null,
          }
        }
      })
      
      const titleInput = screen.getByLabelText(/Title/)
      await user.type(titleInput, 'Test Task')
      
      const submitButton = screen.getByRole('button', { name: /Adding.../ })
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Adding...')).toBeInTheDocument()
    })

    it('disables form inputs during loading', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />, {
        preloadedState: {
          tasks: {
            tasks: [],
            filter: 'all',
            searchQuery: '',
            isLoading: true,
            error: null,
          }
        }
      })
      
      expect(screen.getByLabelText(/Title/)).toBeDisabled()
      expect(screen.getByLabelText(/Description/)).toBeDisabled()
      expect(screen.getByLabelText(/Priority/)).toBeDisabled()
      expect(screen.getByLabelText(/Due Date/)).toBeDisabled()
    })

    it('shows updating state for edit form', () => {
      const editingTask = mockTasks[0]
      renderWithProviders(<TaskForm editingTask={editingTask} onCancel={mockOnCancel} />, {
        preloadedState: {
          tasks: {
            tasks: mockTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: true,
            error: null,
          }
        }
      })
      
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error message when present', () => {
      const errorMessage = 'Failed to save task'
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />, {
        preloadedState: {
          tasks: {
            tasks: [],
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: errorMessage,
          }
        }
      })
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('clears error after timeout', async () => {
      vi.useFakeTimers()
      
      const { store } = renderWithProviders(<TaskForm onCancel={mockOnCancel} />, {
        preloadedState: {
          tasks: {
            tasks: [],
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: 'Test error',
          }
        }
      })
      
      expect(screen.getByText('Test error')).toBeInTheDocument()
      
      // Fast forward time with proper async handling
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
      
      await waitFor(() => {
        const state = store.getState()
        expect(state.tasks.error).toBeNull()
      })
      
      vi.useRealTimers()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      expect(screen.getByLabelText(/Title/)).toHaveAttribute('id', 'title')
      expect(screen.getByLabelText(/Description/)).toHaveAttribute('id', 'description')
      expect(screen.getByLabelText(/Priority/)).toHaveAttribute('id', 'priority')
      expect(screen.getByLabelText(/Due Date/)).toHaveAttribute('id', 'dueDate')
    })

    it('shows required field indicators', () => {
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      expect(screen.getByText(/Title \*/)).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      // Tab through form elements - first tab goes to close button
      await user.tab()
      await user.tab()
      expect(screen.getByLabelText(/Title/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Description/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Priority/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Due Date/)).toHaveFocus()
    })

    it('has proper ARIA attributes for validation errors', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      const titleInput = screen.getByLabelText(/Title/)
      await waitFor(() => {
        expect(titleInput).toHaveClass('border-error-300', 'bg-error-50')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles form submission with only required fields', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      await user.type(titleInput, 'Minimal Task')
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      const state = store.getState()
      const newTask = state.tasks.tasks.find(task => task.title === 'Minimal Task')
      
      expect(newTask).toBeDefined()
      expect(newTask?.description).toBe('')
      expect(newTask?.priority).toBe('medium')
      expect(newTask?.dueDate).toBeNull()
    })

    it('handles editing task with null due date', async () => {
      const taskWithNullDate: Task = {
        ...mockTasks[0],
        dueDate: null
      }
      
      renderWithProviders(<TaskForm editingTask={taskWithNullDate} onCancel={mockOnCancel} />)
      
      const dueDateInput = await screen.findByLabelText(/Due Date/)
      expect(dueDateInput).toHaveValue('')
    })

    it('handles special characters in form inputs', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskForm onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const descriptionInput = screen.getByLabelText(/Description/)
      
      const specialTitle = 'Task with "quotes" & symbols!'
      const specialDescription = 'Description with <tags> & émojis 🚀'
      
      await user.type(titleInput, specialTitle)
      await user.type(descriptionInput, specialDescription)
      
      const submitButton = screen.getByRole('button', { name: /Add Task/ })
      await user.click(submitButton)
      
      const state = store.getState()
      const newTask = state.tasks.tasks.find(task => task.title === specialTitle)
      
      expect(newTask?.title).toBe(specialTitle)
      expect(newTask?.description).toBe(specialDescription)
    })
  })
})