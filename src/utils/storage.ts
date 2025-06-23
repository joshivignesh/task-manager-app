/**
 * Storage utility functions for task persistence
 * Handles localStorage operations with error handling and data validation
 */

import { Task } from '../types/task';

const STORAGE_KEY = 'taskManagerPro_tasks';
const STORAGE_VERSION = '1.0';
const VERSION_KEY = 'taskManagerPro_version';

export interface StorageData {
  tasks: Task[];
  version: string;
  lastUpdated: string;
}

/**
 * Validates if a task object has all required properties
 */
const isValidTask = (task: any): task is Task => {
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.completed === 'boolean' &&
    ['low', 'medium', 'high'].includes(task.priority) &&
    (task.dueDate === null || typeof task.dueDate === 'string') &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
};

/**
 * Validates the storage data structure
 */
const isValidStorageData = (data: any): data is StorageData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.tasks) &&
    typeof data.version === 'string' &&
    typeof data.lastUpdated === 'string' &&
    data.tasks.every(isValidTask)
  );
};

/**
 * Saves tasks to localStorage with error handling
 */
export const saveTasks = (tasks: Task[]): boolean => {
  try {
    const storageData: StorageData = {
      tasks,
      version: STORAGE_VERSION,
      lastUpdated: new Date().toISOString(),
    };

    const serializedData = JSON.stringify(storageData);
    localStorage.setItem(STORAGE_KEY, serializedData);
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    
    return true;
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
    return false;
  }
};

/**
 * Loads tasks from localStorage with validation and error handling
 */
export const loadTasks = (): Task[] => {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (!serializedData) {
      return [];
    }

    // Check version compatibility
    if (storedVersion !== STORAGE_VERSION) {
      console.warn('Storage version mismatch. Clearing old data.');
      clearTasks();
      return [];
    }

    const parsedData = JSON.parse(serializedData);

    if (!isValidStorageData(parsedData)) {
      console.warn('Invalid storage data format. Clearing corrupted data.');
      clearTasks();
      return [];
    }

    // Validate each task and filter out invalid ones
    const validTasks = parsedData.tasks.filter((task, index) => {
      if (!isValidTask(task)) {
        console.warn(`Invalid task at index ${index}:`, task);
        return false;
      }
      return true;
    });

    return validTasks;
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    clearTasks(); // Clear corrupted data
    return [];
  }
};

/**
 * Clears all task data from localStorage
 */
export const clearTasks = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear tasks from localStorage:', error);
    return false;
  }
};

/**
 * Gets storage usage information
 */
export const getStorageInfo = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const sizeInBytes = data ? new Blob([data]).size : 0;
    const sizeInKB = Math.round(sizeInBytes / 1024 * 100) / 100;
    
    return {
      sizeInBytes,
      sizeInKB,
      itemCount: data ? JSON.parse(data).tasks?.length || 0 : 0,
      lastUpdated: localStorage.getItem(STORAGE_KEY) ? 
        JSON.parse(localStorage.getItem(STORAGE_KEY)!).lastUpdated : null,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      sizeInBytes: 0,
      sizeInKB: 0,
      itemCount: 0,
      lastUpdated: null,
    };
  }
};

/**
 * Exports tasks data for backup
 */
export const exportTasks = (tasks: Task[]): string => {
  const exportData = {
    tasks,
    exportedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
    appName: 'Task Manager Pro',
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Imports tasks data from backup
 */
export const importTasks = (jsonString: string): Task[] => {
  try {
    const importData = JSON.parse(jsonString);
    
    if (!Array.isArray(importData.tasks)) {
      throw new Error('Invalid import format: tasks must be an array');
    }
    
    const validTasks = importData.tasks.filter(isValidTask);
    
    if (validTasks.length !== importData.tasks.length) {
      console.warn(`Filtered out ${importData.tasks.length - validTasks.length} invalid tasks during import`);
    }
    
    return validTasks;
  } catch (error) {
    console.error('Failed to import tasks:', error);
    throw new Error('Invalid import file format');
  }
};