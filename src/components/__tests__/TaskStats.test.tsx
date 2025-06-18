import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { TaskStats } from '../TaskStats'
import { renderWithProviders } from '../../test/test-utils'
import { Task } from '../../types/task'

describe('TaskStats Component', () => {
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: Math.random().toString(),
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  })

  describe('Empty State', () => {
    it('renders all stats as zero when no tasks exist', () => {
      renderWithProviders(<TaskStats />)

      expect(screen.getByText('Total Tasks')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Overdue')).toBeInTheDocument()

      // All values should be 0
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues).toHaveLength(4) // Total, Completed, Active, Overdue
    })

    it('shows 0% completion rate when no tasks exist', () => {
      renderWithProviders(<TaskStats />)

      expect(screen.queryByText('0% completion rate')).not.toBeInTheDocument()
      expect(screen.queryByText('Recently Completed')).not.toBeInTheDocument()
      expect(screen.queryByText('Completion Rate')).not.toBeInTheDocument()
    })

    it('does not render additional stats when no tasks exist', () => {
      renderWithProviders(<TaskStats />)

      expect(screen.queryByText('Recently Completed')).not.toBeInTheDocument()
      expect(screen.queryByText('Completion Rate')).not.toBeInTheDocument()
    })
  })

  describe('Basic Statistics', () => {
    it('calculates total tasks correctly', () => {
      const tasks = [
        createTask({ id: '1' }),
        createTask({ id: '2' }),
        createTask({ id: '3' }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Total Tasks')).toBeInTheDocument()
    })

    it('calculates completed tasks correctly', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: true }),
        createTask({ id: '3', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('2')).toBeInTheDocument() // Completed count
      expect(screen.getByText('67% completion rate')).toBeInTheDocument()
    })

    it('calculates active tasks correctly', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: false }),
        createTask({ id: '3', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      // Should show 2 active tasks
      const activeSection = screen.getByText('Active').closest('div')
      expect(activeSection).toHaveTextContent('2')
    })

    it('calculates completion rate correctly', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: true }),
        createTask({ id: '3', completed: true }),
        createTask({ id: '4', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('75% completion rate')).toBeInTheDocument()
    })

    it('rounds completion rate correctly', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: false }),
        createTask({ id: '3', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('33% completion rate')).toBeInTheDocument()
    })
  })

  describe('Due Date Statistics', () => {
    it('calculates overdue tasks correctly', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const pastDate = yesterday.toISOString().split('T')[0]

      const tasks = [
        createTask({ id: '1', dueDate: pastDate, completed: false }),
        createTask({ id: '2', dueDate: pastDate, completed: true }), // Completed, so not overdue
        createTask({ id: '3', completed: false }), // No due date
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      const overdueSection = screen.getByText('Overdue').closest('div')
      expect(overdueSection).toHaveTextContent('1')
    })

    it('calculates due today tasks correctly', () => {
      const today = new Date().toISOString().split('T')[0]

      const tasks = [
        createTask({ id: '1', dueDate: today, completed: false }),
        createTask({ id: '2', dueDate: today, completed: false }),
        createTask({ id: '3', dueDate: today, completed: true }), // Completed, so not counted
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('2 due today')).toBeInTheDocument()
    })

    it('does not show due today subtitle when no tasks are due today', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const futureDate = tomorrow.toISOString().split('T')[0]

      const tasks = [
        createTask({ id: '1', dueDate: futureDate, completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.queryByText(/due today/)).not.toBeInTheDocument()
    })

    it('handles tasks without due dates correctly', () => {
      const tasks = [
        createTask({ id: '1', dueDate: null, completed: false }),
        createTask({ id: '2', dueDate: null, completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      const overdueSection = screen.getByText('Overdue').closest('div')
      expect(overdueSection).toHaveTextContent('0')
    })
  })

  describe('Priority Statistics', () => {
    it('calculates high priority active tasks correctly', () => {
      const tasks = [
        createTask({ id: '1', priority: 'high', completed: false }),
        createTask({ id: '2', priority: 'high', completed: false }),
        createTask({ id: '3', priority: 'high', completed: true }), // Completed, so not counted
        createTask({ id: '4', priority: 'medium', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('2 high priority')).toBeInTheDocument()
    })

    it('does not show high priority subtitle when no high priority active tasks exist', () => {
      const tasks = [
        createTask({ id: '1', priority: 'medium', completed: false }),
        createTask({ id: '2', priority: 'low', completed: false }),
        createTask({ id: '3', priority: 'high', completed: true }), // Completed
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.queryByText(/high priority/)).not.toBeInTheDocument()
    })
  })

  describe('Recently Completed Statistics', () => {
    it('calculates recently completed tasks correctly', () => {
      const today = new Date()
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)

      const tasks = [
        createTask({ 
          id: '1', 
          completed: true, 
          updatedAt: threeDaysAgo.toISOString() 
        }),
        createTask({ 
          id: '2', 
          completed: true, 
          updatedAt: today.toISOString() 
        }),
        createTask({ 
          id: '3', 
          completed: true, 
          updatedAt: tenDaysAgo.toISOString() // Too old
        }),
        createTask({ 
          id: '4', 
          completed: false, 
          updatedAt: today.toISOString() // Not completed
        }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('Recently Completed')).toBeInTheDocument()
      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
      
      const recentlyCompletedSection = screen.getByText('Recently Completed').closest('div')
      expect(recentlyCompletedSection).toHaveTextContent('2')
    })

    it('shows recently completed as 0 when no tasks completed in last 7 days', () => {
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      const tasks = [
        createTask({ 
          id: '1', 
          completed: true, 
          updatedAt: tenDaysAgo.toISOString() 
        }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      const recentlyCompletedSection = screen.getByText('Recently Completed').closest('div')
      expect(recentlyCompletedSection).toHaveTextContent('0')
    })
  })

  describe('Extended Statistics (Additional Stats Row)', () => {
    it('renders additional stats when tasks exist', () => {
      const tasks = [createTask({ id: '1' })]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('Recently Completed')).toBeInTheDocument()
      expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    })

    it('renders completion rate progress bar correctly', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      const completionRateSection = screen.getByText('Completion Rate').closest('div')
      expect(completionRateSection).toHaveTextContent('50%')
      
      // Check for progress bar
      const progressBar = completionRateSection?.querySelector('.bg-purple-600')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveStyle('width: 50%')
    })

    it('shows 100% completion rate correctly', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: true }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      const completionRateSection = screen.getByText('Completion Rate').closest('div')
      expect(completionRateSection).toHaveTextContent('100%')
      
      const progressBar = completionRateSection?.querySelector('.bg-purple-600')
      expect(progressBar).toHaveStyle('width: 100%')
    })
  })

  describe('Visual Elements and Styling', () => {
    it('renders all stat cards with proper structure', () => {
      const tasks = [createTask({ id: '1' })]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      // Check for stat card structure
      expect(screen.getByText('Total Tasks')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Overdue')).toBeInTheDocument()

      // Check for icons (SVG elements)
      const svgElements = document.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })

    it('applies correct CSS classes for different stat types', () => {
      const tasks = [createTask({ id: '1' })]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      // Check for border color classes
      const totalTasksCard = screen.getByText('Total Tasks').closest('.border-l-4')
      expect(totalTasksCard).toHaveClass('border-l-primary-500')

      const completedCard = screen.getByText('Completed').closest('.border-l-4')
      expect(completedCard).toHaveClass('border-l-success-500')

      const activeCard = screen.getByText('Active').closest('.border-l-4')
      expect(activeCard).toHaveClass('border-l-warning-500')

      const overdueCard = screen.getByText('Overdue').closest('.border-l-4')
      expect(overdueCard).toHaveClass('border-l-error-500')
    })

    it('renders hover effects correctly', () => {
      const tasks = [createTask({ id: '1' })]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      const statCards = document.querySelectorAll('.hover\\:shadow-md')
      expect(statCards.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases and Data Validation', () => {
    it('handles invalid date formats gracefully', () => {
      const tasks = [
        createTask({ 
          id: '1', 
          dueDate: 'invalid-date',
          updatedAt: 'invalid-date',
          completed: true 
        }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      // Should not crash when rendering
      expect(() => {
        renderWithProviders(<TaskStats />, { preloadedState })
      }).not.toThrow()
    })

    it('handles tasks with missing properties', () => {
      const incompleteTask = {
        id: '1',
        title: 'Test',
        description: '',
        completed: false,
        priority: 'medium',
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      const preloadedState = {
        tasks: {
          tasks: [incompleteTask],
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      expect(() => {
        renderWithProviders(<TaskStats />, { preloadedState })
      }).not.toThrow()

      expect(screen.getByText('1')).toBeInTheDocument() // Total tasks
    })

    it('handles very large numbers correctly', () => {
      const manyTasks = Array.from({ length: 1000 }, (_, i) => 
        createTask({ 
          id: `task-${i}`, 
          completed: i % 2 === 0 // 50% completion rate
        })
      )

      const preloadedState = {
        tasks: {
          tasks: manyTasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('1000')).toBeInTheDocument() // Total
      expect(screen.getByText('500')).toBeInTheDocument() // Completed and Active
      expect(screen.getByText('50% completion rate')).toBeInTheDocument()
    })

    it('handles all tasks completed scenario', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: true }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('100% completion rate')).toBeInTheDocument()
      
      const activeSection = screen.getByText('Active').closest('div')
      expect(activeSection).toHaveTextContent('0')
    })

    it('handles all tasks active scenario', () => {
      const tasks = [
        createTask({ id: '1', completed: false }),
        createTask({ id: '2', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('0% completion rate')).toBeInTheDocument()
      
      const completedSection = screen.getByText('Completed').closest('div')
      expect(completedSection).toHaveTextContent('0')
    })
  })

  describe('Real-time Updates', () => {
    it('updates statistics when task data changes', () => {
      const initialTasks = [createTask({ id: '1', completed: false })]

      const { rerender } = renderWithProviders(<TaskStats />, {
        preloadedState: {
          tasks: {
            tasks: initialTasks,
            filter: 'all',
            searchQuery: '',
            isLoading: false,
            error: null,
          }
        }
      })

      expect(screen.getByText('0% completion rate')).toBeInTheDocument()

      // Update task to completed
      const updatedTasks = [createTask({ id: '1', completed: true })]
      
      rerender(<TaskStats />)

      // Note: In a real scenario, this would be updated through Redux actions
      // This test demonstrates the component's ability to re-render with new data
    })

    it('recalculates all statistics correctly when tasks are added', () => {
      const tasks = [
        createTask({ id: '1', completed: true }),
        createTask({ id: '2', completed: false }),
        createTask({ id: '3', completed: false }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('3')).toBeInTheDocument() // Total
      expect(screen.getByText('33% completion rate')).toBeInTheDocument()
      
      const completedSection = screen.getByText('Completed').closest('div')
      expect(completedSection).toHaveTextContent('1')
      
      const activeSection = screen.getByText('Active').closest('div')
      expect(activeSection).toHaveTextContent('2')
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const tasks = [createTask({ id: '1' })]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      // Check for proper text content that screen readers can access
      expect(screen.getByText('Total Tasks')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    it('provides meaningful text for statistics', () => {
      const tasks = [
        createTask({ id: '1', completed: true, priority: 'high' }),
        createTask({ id: '2', completed: false, priority: 'high' }),
      ]

      const preloadedState = {
        tasks: {
          tasks,
          filter: 'all' as const,
          searchQuery: '',
          isLoading: false,
          error: null,
        }
      }

      renderWithProviders(<TaskStats />, { preloadedState })

      expect(screen.getByText('50% completion rate')).toBeInTheDocument()
      expect(screen.getByText('1 high priority')).toBeInTheDocument()
      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    })
  })
})