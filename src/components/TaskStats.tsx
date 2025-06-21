import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Task } from '../types/task';

// Memoized selector to prevent unnecessary recalculations
const selectTasks = (state: RootState) => state.tasks.tasks;

// Helper function to calculate stats - moved outside component to prevent recreation
const calculateTaskStats = (tasks: Task[]) => {
  const now = new Date();
  const today = now.toDateString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Use reduce for better performance than multiple filter operations
  const stats = tasks.reduce(
    (acc, task) => {
      // Basic counts
      acc.total++;
      if (task.completed) {
        acc.completed++;
      } else {
        acc.active++;
      }

      // Priority counts (only for active tasks)
      if (!task.completed && task.priority === 'high') {
        acc.highPriorityActive++;
      }

      // Due date calculations (only for active tasks)
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < now) {
          acc.overdue++;
        } else if (dueDate.toDateString() === today) {
          acc.dueToday++;
        }
      }

      // Recently completed (last 7 days)
      if (task.completed) {
        const updatedDate = new Date(task.updatedAt);
        if (updatedDate >= sevenDaysAgo) {
          acc.recentlyCompleted++;
        }
      }

      return acc;
    },
    {
      total: 0,
      completed: 0,
      active: 0,
      overdue: 0,
      dueToday: 0,
      highPriorityActive: 0,
      recentlyCompleted: 0,
    }
  );

  // Calculate completion rate
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return { ...stats, completionRate };
};

// Memoized stat card component to prevent unnecessary re-renders
const StatCard = React.memo<{
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  textColor: string;
}>(({ title, value, subtitle, icon, borderColor, bgColor, textColor }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${borderColor} hover:shadow-md transition-shadow duration-200`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center ${textColor}`}>
        {icon}
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized progress bar component
const ProgressBar = React.memo<{ percentage: number }>(({ percentage }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
    <div 
      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${percentage}%` }}
    />
  </div>
));

ProgressBar.displayName = 'ProgressBar';

// Memoized icons to prevent recreation
const icons = {
  total: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  completed: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  active: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  overdue: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  chart: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
};

export const TaskStats: React.FC = React.memo(() => {
  const tasks = useSelector(selectTasks);

  // Memoize expensive calculations - only recalculate when tasks change
  const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);

  // Memoize stat configurations to prevent recreation on every render
  const statConfigs = useMemo(() => [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: icons.total,
      borderColor: 'border-l-primary-500',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600',
    },
    {
      title: 'Completed',
      value: stats.completed,
      subtitle: `${stats.completionRate}% completion rate`,
      icon: icons.completed,
      borderColor: 'border-l-success-500',
      bgColor: 'bg-success-100',
      textColor: 'text-success-600',
    },
    {
      title: 'Active',
      value: stats.active,
      subtitle: stats.highPriorityActive > 0 ? `${stats.highPriorityActive} high priority` : undefined,
      icon: icons.active,
      borderColor: 'border-l-warning-500',
      bgColor: 'bg-warning-100',
      textColor: 'text-warning-600',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      subtitle: stats.dueToday > 0 ? `${stats.dueToday} due today` : undefined,
      icon: icons.overdue,
      borderColor: 'border-l-error-500',
      bgColor: 'bg-error-100',
      textColor: 'text-error-600',
    },
  ], [stats]);

  // Early return for empty state - no need to render additional stats
  if (stats.total === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statConfigs.map((config, index) => (
          <StatCard key={index} {...config} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Main stats */}
      {statConfigs.map((config, index) => (
        <StatCard key={index} {...config} />
      ))}

      {/* Additional stats - only render when there are tasks */}
      <StatCard
        title="Recently Completed"
        value={stats.recentlyCompleted}
        subtitle="Last 7 days"
        icon={icons.calendar}
        borderColor="border-l-indigo-500"
        bgColor="bg-indigo-100"
        textColor="text-indigo-600"
      />

      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completionRate}%</p>
            <ProgressBar percentage={stats.completionRate} />
          </div>
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            {icons.chart}
          </div>
        </div>
      </div>
    </div>
  );
});

TaskStats.displayName = 'TaskStats';