import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  saveTasksToStorage, 
  loadTasksFromStorage, 
  importTasks, 
  toggleAutoSave, 
  clearAllTasks 
} from '../store/taskSlice';
import { exportTasks, importTasks as importTasksFromFile, getStorageInfo, clearTasks } from '../utils/storage';

export const DataManager: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, lastSaved, autoSave } = useSelector((state: RootState) => state.tasks);
  const [showManager, setShowManager] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const storageInfo = getStorageInfo();

  const handleExport = () => {
    try {
      const exportData = exportTasks(tasks);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTasks = importTasksFromFile(content);
        
        if (importedTasks.length === 0) {
          setImportError('No valid tasks found in the import file');
          return;
        }

        if (window.confirm(`Import ${importedTasks.length} tasks? This will replace all current tasks.`)) {
          dispatch(importTasks(importedTasks));
          setImportSuccess(`Successfully imported ${importedTasks.length} tasks`);
          setImportError(null);
          setTimeout(() => setImportSuccess(null), 3000);
        }
      } catch (error) {
        setImportError('Failed to import tasks. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const handleManualSave = () => {
    dispatch(saveTasksToStorage());
  };

  const handleReload = () => {
    if (window.confirm('Reload tasks from storage? Any unsaved changes will be lost.')) {
      dispatch(loadTasksFromStorage());
    }
  };

  const handleClearStorage = () => {
    if (window.confirm('Clear all data from storage? This action cannot be undone.')) {
      clearTasks();
      dispatch(clearAllTasks());
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!showManager) {
    return (
      <button
        onClick={() => setShowManager(true)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40"
        title="Data Management"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4H8c-2.21 0-4-1.79-4-4zm0 0V4c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v3M4 7h16" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
            <button
              onClick={() => setShowManager(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Storage Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Storage Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tasks stored:</span>
                <span className="font-medium">{storageInfo.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Storage size:</span>
                <span className="font-medium">{storageInfo.sizeInKB} KB</span>
              </div>
              <div className="flex justify-between">
                <span>Last saved:</span>
                <span className="font-medium">{formatDate(lastSaved)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Auto-save:</span>
                <button
                  onClick={() => dispatch(toggleAutoSave())}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    autoSave 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {autoSave ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Manual Save/Load */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleManualSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Save Now
              </button>
              <button
                onClick={handleReload}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Reload
              </button>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Tasks</span>
            </button>

            {/* Import */}
            <div>
              <label className="w-full px-4 py-2 bg-warning-600 text-white rounded-md hover:bg-warning-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import Tasks</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            {/* Clear Storage */}
            <button
              onClick={handleClearStorage}
              className="w-full px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All Data</span>
            </button>
          </div>

          {/* Status Messages */}
          {importError && (
            <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-md">
              <p className="text-sm text-error-600">{importError}</p>
            </div>
          )}

          {importSuccess && (
            <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-md">
              <p className="text-sm text-success-600">{importSuccess}</p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-600">
              <strong>Tip:</strong> Your tasks are automatically saved to your browser's local storage. 
              Use export/import to backup or transfer your data between devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};