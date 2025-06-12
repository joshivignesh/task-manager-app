export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';