import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const { tasks, filter, searchQuery } = useSelector((state: RootState) => state.tasks);

  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed);

    return matchesSearch && matchesFilter;
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          {searchQuery || filter !== 'all' ? 'No matching tasks' : 'No tasks yet'}
        </h3>
        <p className="text-gray-500">
          {searchQuery || filter !== 'all' 
            ? 'Try adjusting your search or filter criteria'
            : 'Create your first task to get started!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEditTask} />
      ))}
    </div>
  );
};