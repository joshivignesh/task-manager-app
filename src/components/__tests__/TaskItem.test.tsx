import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from '../TaskItem'
import { renderWithProviders, mockTasks } from '../../test/test-utils'
import { Task } from '../../types/task'

// Mock window.confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
})

describe('TaskItem Component', () => {
  const mockOnEdit = vi.fn()
  const mockOnSelect = vi.fn()
  const defaultTask = mockTasks[0] // High priority, not completed task

  beforeEach(() => {
    mockConfirm.mockClear()
    mockOnEdit.mockClear()
    mockOnSelect.mockClear()
    mockConfirm.mockReturnValue(true)
  })

  describe('Rendering', () => {
    it('renders task with all basic information', () => {
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      expect(screen.getByText(defaultTask.title)).toBeInTheDocument()
      expect(screen.getByText(defaultTask.description)).toBeInTheDocument()
      expect(screen.getByText(defaultTask.priority)).toBeInTheDocument()
      expect(screen.getByText(/Created/)).toBeInTheDocument()
    })

    it('renders task without description when description is empty', () => {
      const taskWithoutDescription = { ...defaultTask, description: '' }
      renderWithProviders(<TaskItem task={taskWithoutDescription} onEdit={mockOnEdit} />)

      expect(screen.getByText(defaultTask.title)).toBeInTheDocument()
      expect(screen.queryByText(defaultTask.description)).not.toBeInTheDocument()
    })

    it('renders completed task with proper styling', () => {
      const completedTask = { ...defaultTask, completed: true }
      renderWithProviders(<TaskItem task={completedTask} onEdit={mockOnEdit} />)

      const titleElement = screen.getByText(defaultTask.title)
      expect(titleElement).toHaveClass('line-through', 'text-gray-500')
      
      const descriptionElement = screen.getByText(defaultTask.description)
      expect(descriptionElement).toHaveClass('line-through', 'text-gray-400')
    })

    it('renders task with due date information', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const taskWithDueDate = { 
        ...defaultTask, 
        dueDate: futureDate.toISOString().split('T')[0] 
      }
      
      renderWithProviders(<TaskItem task={taskWithDueDate} onEdit={mockOnEdit} />)

      expect(screen.getByText(/Due/)).toBeInTheDocument()
    })

    it('renders overdue task with warning styling', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const overdueTask = { 
        ...defaultTask, 
        dueDate: pastDate.toISOString().split('T')[0],
        completed: false
      }
      
      renderWithProviders(<TaskItem task={overdueTask} onEdit={mockOnEdit} />)

      const overdueElement = screen.getByText('Overdue')
      expect(overdueElement).toHaveClass('text-error-600', 'font-medium')
    })

    it('renders task due today with warning styling', () => {
      const today = new Date().toISOString().split('T')[0]
      const taskDueToday = { 
        ...defaultTask, 
        dueDate: today,
        completed: false
      }
      
      renderWithProviders(<TaskItem task={taskDueToday} onEdit={mockOnEdit} />)

      const dueTodayElement = screen.getByText('Due today')
      expect(dueTodayElement).toHaveClass('text-warning-600', 'font-medium')
    })

    it('renders updated date when task was modified', () => {
      const updatedTask = { 
        ...defaultTask, 
        updatedAt: new Date(Date.now() + 86400000).toISOString() // 1 day later
      }
      
      renderWithProviders(<TaskItem task={updatedTask} onEdit={mockOnEdit} />)

      expect(screen.getByText(/Updated/)).toBeInTheDocument()
    })

    it('does not render updated date when task was not modified', () => {
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
    })

    it('renders selection checkbox when onSelect is provided', () => {
      renderWithProviders(
        <TaskItem task={defaultTask} onEdit={mockOnEdit} onSelect={mockOnSelect} />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('does not render selection checkbox when onSelect is not provided', () => {
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('renders selected state correctly', () => {
      renderWithProviders(
        <TaskItem 
          task={defaultTask} 
          onEdit={mockOnEdit} 
          onSelect={mockOnSelect}
          isSelected={true}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
      
      const taskContainer = checkbox.closest('.ring-2')
      expect(taskContainer).toHaveClass('ring-primary-500')
    })
  })

  describe('Priority Styling', () => {
    it('applies correct styling for high priority task', () => {
      const highPriorityTask = { ...defaultTask, priority: 'high' as const }
      renderWithProviders(<TaskItem task={highPriorityTask} onEdit={mockOnEdit} />)

      const taskContainer = screen.getByText(defaultTask.title).closest('.border-l-4')
      expect(taskContainer).toHaveClass('border-l-error-500', 'bg-error-50')
      
      const priorityBadge = screen.getByText('high')
      expect(priorityBadge).toHaveClass('bg-error-100', 'text-error-800', 'border-error-200')
    })

    it('applies correct styling for medium priority task', () => {
      const mediumPriorityTask = { ...defaultTask, priority: 'medium' as const }
      renderWithProviders(<TaskItem task={mediumPriorityTask} onEdit={mockOnEdit} />)

      const taskContainer = screen.getByText(defaultTask.title).closest('.border-l-4')
      expect(taskContainer).toHaveClass('border-l-warning-500', 'bg-warning-50')
      
      const priorityBadge = screen.getByText('medium')
      expect(priorityBadge).toHaveClass('bg-warning-100', 'text-warning-800', 'border-warning-200')
    })

    it('applies correct styling for low priority task', () => {
      const lowPriorityTask = { ...defaultTask, priority: 'low' as const }
      renderWithProviders(<TaskItem task={lowPriorityTask} onEdit={mockOnEdit} />)

      const taskContainer = screen.getByText(defaultTask.title).closest('.border-l-4')
      expect(taskContainer).toHaveClass('border-l-success-500', 'bg-success-50')
      
      const priorityBadge = screen.getByText('low')
      expect(priorityBadge).toHaveClass('bg-success-100', 'text-success-800', 'border-success-200')
    })
  })

  describe('Task Toggle Functionality', () => {
    it('toggles task completion when toggle button is clicked', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const toggleButton = screen.getByRole('button', { name: '' })
      await user.click(toggleButton)

      const state = store.getState()
      const updatedTask = state.tasks.tasks.find(task => task.id === defaultTask.id)
      expect(updatedTask?.completed).toBe(true)
    })

    it('shows checkmark icon when task is completed', () => {
      const completedTask = { ...defaultTask, completed: true }
      renderWithProviders(<TaskItem task={completedTask} onEdit={mockOnEdit} />)

      const checkmarkIcon = screen.getByRole('button', { name: '' }).querySelector('svg')
      expect(checkmarkIcon).toBeInTheDocument()
    })

    it('applies completed styling to toggle button', () => {
      const completedTask = { ...defaultTask, completed: true }
      renderWithProviders(<TaskItem task={completedTask} onEdit={mockOnEdit} />)

      const toggleButton = screen.getByRole('button', { name: '' })
      expect(toggleButton).toHaveClass('bg-success-500', 'border-success-500', 'text-white', 'scale-110')
    })
  })

  describe('Priority Change Functionality', () => {
    it('shows priority menu when priority badge is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const priorityBadge = screen.getByText(defaultTask.priority)
      await user.click(priorityBadge)

      expect(screen.getByText('Change Priority:')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('changes task priority when priority option is selected', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const priorityBadge = screen.getByText(defaultTask.priority)
      await user.click(priorityBadge)

      const lowPriorityOption = screen.getByText('Low')
      await user.click(lowPriorityOption)

      const state = store.getState()
      const updatedTask = state.tasks.tasks.find(task => task.id === defaultTask.id)
      expect(updatedTask?.priority).toBe('low')
    })

    it('closes priority menu after selection', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const priorityBadge = screen.getByText(defaultTask.priority)
      await user.click(priorityBadge)

      const lowPriorityOption = screen.getByText('Low')
      await user.click(lowPriorityOption)

      await waitFor(() => {
        expect(screen.queryByText('Change Priority:')).not.toBeInTheDocument()
      })
    })

    it('highlights current priority in menu', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const priorityBadge = screen.getByText(defaultTask.priority)
      await user.click(priorityBadge)

      const currentPriorityOption = screen.getByText('High') // defaultTask has high priority
      expect(currentPriorityOption).toHaveClass('bg-gray-100', 'font-medium')
    })
  })

  describe('Task Actions', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const editButton = screen.getByTitle('Edit task')
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith(defaultTask)
    })

    it('shows confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const deleteButton = screen.getByTitle('Delete task')
      await user.click(deleteButton)

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')
    })

    it('deletes task when deletion is confirmed', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const deleteButton = screen.getByTitle('Delete task')
      await user.click(deleteButton)

      // Wait for the deletion animation delay
      await waitFor(() => {
        const state = store.getState()
        const deletedTask = state.tasks.tasks.find(task => task.id === defaultTask.id)
        expect(deletedTask).toBeUndefined()
      }, { timeout: 1000 })
    })

    it('does not delete task when deletion is cancelled', async () => {
      mockConfirm.mockReturnValue(false)
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const deleteButton = screen.getByTitle('Delete task')
      await user.click(deleteButton)

      const state = store.getState()
      const task = state.tasks.tasks.find(task => task.id === defaultTask.id)
      expect(task).toBeDefined()
    })

    it('duplicates task when duplicate button is clicked', async () => {
      const user = userEvent.setup()
      const { store } = renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const duplicateButton = screen.getByTitle('Duplicate task')
      await user.click(duplicateButton)

      const state = store.getState()
      const duplicatedTask = state.tasks.tasks.find(task => 
        task.title === `${defaultTask.title} (Copy)` && task.id !== defaultTask.id
      )
      expect(duplicatedTask).toBeDefined()
      expect(duplicatedTask?.completed).toBe(false)
    })

    it('shows deleting state during deletion', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const deleteButton = screen.getByTitle('Delete task')
      await user.click(deleteButton)

      const taskContainer = screen.getByText(defaultTask.title).closest('.animate-pulse')
      expect(taskContainer).toHaveClass('opacity-50')
    })

    it('disables delete button during deletion', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const deleteButton = screen.getByTitle('Delete task')
      await user.click(deleteButton)

      expect(deleteButton).toBeDisabled()
    })
  })

  describe('Selection Functionality', () => {
    it('calls onSelect when selection checkbox is changed', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <TaskItem task={defaultTask} onEdit={mockOnEdit} onSelect={mockOnSelect} />
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnSelect).toHaveBeenCalledWith(defaultTask.id, true)
    })

    it('calls onSelect with false when unchecking', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <TaskItem 
          task={defaultTask} 
          onEdit={mockOnEdit} 
          onSelect={mockOnSelect}
          isSelected={true}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnSelect).toHaveBeenCalledWith(defaultTask.id, false)
    })
  })

  describe('Menu Interactions', () => {
    it('closes priority menu when clicking outside', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const priorityBadge = screen.getByText(defaultTask.priority)
      await user.click(priorityBadge)

      expect(screen.getByText('Change Priority:')).toBeInTheDocument()

      // Click outside the menu
      const outsideElement = screen.getByText(defaultTask.title)
      await user.click(outsideElement)

      await waitFor(() => {
        expect(screen.queryByText('Change Priority:')).not.toBeInTheDocument()
      })
    })

    it('only shows one priority menu at a time', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const priorityBadge = screen.getByText(defaultTask.priority)
      
      // Open menu
      await user.click(priorityBadge)
      expect(screen.getByText('Change Priority:')).toBeInTheDocument()

      // Click again to close
      await user.click(priorityBadge)
      await waitFor(() => {
        expect(screen.queryByText('Change Priority:')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper button roles and titles', () => {
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      expect(screen.getByTitle('Edit task')).toBeInTheDocument()
      expect(screen.getByTitle('Delete task')).toBeInTheDocument()
      expect(screen.getByTitle('Duplicate task')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      // Tab to toggle button
      await user.tab()
      expect(screen.getByRole('button', { name: '' })).toHaveFocus()

      // Tab to priority badge
      await user.tab()
      expect(screen.getByText(defaultTask.priority)).toHaveFocus()

      // Tab to duplicate button
      await user.tab()
      expect(screen.getByTitle('Duplicate task')).toHaveFocus()

      // Tab to edit button
      await user.tab()
      expect(screen.getByTitle('Edit task')).toHaveFocus()

      // Tab to delete button
      await user.tab()
      expect(screen.getByTitle('Delete task')).toHaveFocus()
    })

    it('has proper checkbox accessibility when selection is enabled', () => {
      renderWithProviders(
        <TaskItem task={defaultTask} onEdit={mockOnEdit} onSelect={mockOnSelect} />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })
  })

  describe('Edge Cases', () => {
    it('handles task with null due date', () => {
      const taskWithNullDate = { ...defaultTask, dueDate: null }
      renderWithProviders(<TaskItem task={taskWithNullDate} onEdit={mockOnEdit} />)

      expect(screen.queryByText(/Due/)).not.toBeInTheDocument()
    })

    it('handles task with empty title gracefully', () => {
      const taskWithEmptyTitle = { ...defaultTask, title: '' }
      renderWithProviders(<TaskItem task={taskWithEmptyTitle} onEdit={mockOnEdit} />)

      // Should still render the component without crashing
      expect(screen.getByText(defaultTask.description)).toBeInTheDocument()
    })

    it('handles task with special characters in title and description', () => {
      const taskWithSpecialChars = {
        ...defaultTask,
        title: 'Task with "quotes" & symbols!',
        description: 'Description with <tags> & émojis 🚀'
      }
      renderWithProviders(<TaskItem task={taskWithSpecialChars} onEdit={mockOnEdit} />)

      expect(screen.getByText(taskWithSpecialChars.title)).toBeInTheDocument()
      expect(screen.getByText(taskWithSpecialChars.description)).toBeInTheDocument()
    })

    it('handles very long task titles and descriptions', () => {
      const taskWithLongContent = {
        ...defaultTask,
        title: 'A'.repeat(200),
        description: 'B'.repeat(1000)
      }
      renderWithProviders(<TaskItem task={taskWithLongContent} onEdit={mockOnEdit} />)

      expect(screen.getByText(taskWithLongContent.title)).toBeInTheDocument()
      expect(screen.getByText(taskWithLongContent.description)).toBeInTheDocument()
    })

    it('handles invalid priority gracefully', () => {
      const taskWithInvalidPriority = { 
        ...defaultTask, 
        priority: 'invalid' as any 
      }
      renderWithProviders(<TaskItem task={taskWithInvalidPriority} onEdit={mockOnEdit} />)

      // Should still render without crashing
      expect(screen.getByText('invalid')).toBeInTheDocument()
    })

    it('handles invalid date formats gracefully', () => {
      const taskWithInvalidDate = { 
        ...defaultTask, 
        dueDate: 'invalid-date',
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date'
      }
      
      // Should not crash when rendering
      expect(() => {
        renderWithProviders(<TaskItem task={taskWithInvalidDate} onEdit={mockOnEdit} />)
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily when props do not change', () => {
      const { rerender } = renderWithProviders(
        <TaskItem task={defaultTask} onEdit={mockOnEdit} />
      )

      const initialTitle = screen.getByText(defaultTask.title)
      
      // Re-render with same props
      rerender(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)
      
      const rerenderTitle = screen.getByText(defaultTask.title)
      expect(rerenderTitle).toBe(initialTitle)
    })

    it('handles rapid clicks on action buttons gracefully', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const duplicateButton = screen.getByTitle('Duplicate task')
      
      // Rapid clicks
      await user.click(duplicateButton)
      await user.click(duplicateButton)
      await user.click(duplicateButton)

      // Should handle multiple clicks without errors
      expect(mockOnEdit).not.toHaveBeenCalled()
    })
  })

  describe('Visual States', () => {
    it('applies hover effects correctly', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const taskContainer = screen.getByText(defaultTask.title).closest('.hover\\:shadow-md')
      expect(taskContainer).toHaveClass('hover:shadow-md')
    })

    it('shows loading state during deletion', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TaskItem task={defaultTask} onEdit={mockOnEdit} />)

      const deleteButton = screen.getByTitle('Delete task')
      await user.click(deleteButton)

      const taskContainer = screen.getByText(defaultTask.title).closest('.animate-pulse')
      expect(taskContainer).toHaveClass('animate-pulse', 'opacity-50')
    })

    it('applies correct opacity for completed tasks', () => {
      const completedTask = { ...defaultTask, completed: true }
      renderWithProviders(<TaskItem task={completedTask} onEdit={mockOnEdit} />)

      const taskContainer = screen.getByText(defaultTask.title).closest('.opacity-75')
      expect(taskContainer).toHaveClass('opacity-75')
    })
  })
})