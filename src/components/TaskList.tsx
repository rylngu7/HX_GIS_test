import React, { useState, useCallback } from 'react';
import { X, CheckCircle, Clock, ChevronDown, ChevronUp, Trash2, Layers, Download, FolderOpen, Box, Folder, Plus, Check, AlertCircle } from 'lucide-react';

export interface Task {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  error?: string;
  fileSize?: string;
}

interface TaskListProps {
  tasks: Task[];
  onCloseTask: (taskId: string) => void;
  onClearCompleted: () => void;
}

// 保存到数据目录弹窗组件
const SaveToDirectoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}> = ({ isOpen, onClose, task }) => {
  const [dataName, setDataName] = useState(`导出-${task.name}`);
  const [targetLibrary, setTargetLibrary] = useState<'standard' | 'fusion'>('standard');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showNewDirectoryModal, setShowNewDirectoryModal] = useState(false);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [newDirectoryParent, setNewDirectoryParent] = useState('');
  const [newDirectoryDescription, setNewDirectoryDescription] = useState('');

  const libraryData = {
    standard: { name: '标准库', folders: ['标准数据1', '标准数据2'] },
    fusion: { name: '融合库', folders: ['融合结果', '临时数据'] },
  };

  const toggleFolder = (folder: string) => {
    setSelectedFolder(prev => prev === folder ? null : folder);
  };

  const handleNewDirectory = () => {
    if (newDirectoryName.trim()) {
      setNewDirectoryName('');
      setNewDirectoryParent('');
      setNewDirectoryDescription('');
      setShowNewDirectoryModal(false);
    }
  };

  const handleConfirm = () => {
    console.log('保存到数据目录:', { taskId: task.id, dataName, targetLibrary, selectedFolder });
    onClose();
  };

  if (!isOpen) return null;

  const renderDirectoryTree = () => {
    const lib = libraryData[targetLibrary];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">选择目录</span>
          <button 
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            onClick={() => setShowNewDirectoryModal(true)}
          >
            <Plus size={14} />
            新建目录
          </button>
        </div>
        <div className="border border-gray-300 rounded p-3 min-h-[120px] max-h-[160px] overflow-y-auto">
          {lib.folders.map((folder, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                selectedFolder === folder 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFolder(folder)}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                selectedFolder === folder 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-400'
              }`}>
                {selectedFolder === folder && <Check size={10} className="text-white" />}
              </div>
              <Folder size={16} className={selectedFolder === folder ? 'text-blue-700' : 'text-yellow-500'} />
              <span>{folder}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-96">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">保存到数据目录</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数据名称 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="请输入数据名称"
              value={dataName}
              onChange={(e) => setDataName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目标库 <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <button
                onClick={() => setTargetLibrary('standard')}
                className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                  targetLibrary === 'standard' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                标准库
              </button>
              <button
                onClick={() => setTargetLibrary('fusion')}
                className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                  targetLibrary === 'fusion' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                融合库
              </button>
            </div>
          </div>

          {renderDirectoryTree()}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            确认
          </button>
        </div>

        {showNewDirectoryModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-80 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">新增目录</h3>
                <button onClick={() => setShowNewDirectoryModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目录名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="请输入目录名称"
                    value={newDirectoryName}
                    onChange={(e) => setNewDirectoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所属目录 <span className="text-red-500">*</span></label>
                  <select
                    value={newDirectoryParent}
                    onChange={(e) => setNewDirectoryParent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择</option>
                    {libraryData[targetLibrary].folders.map((folder, idx) => (
                      <option key={idx} value={folder}>{folder}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    placeholder="请输入描述"
                    value={newDirectoryDescription}
                    onChange={(e) => setNewDirectoryDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowNewDirectoryModal(false)}
                  className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button 
                  onClick={handleNewDirectory}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task; onClose: () => void }> = ({ task, onClose }) => {
  const progressPercentage = Math.min(task.progress, 100);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleExportToLayer = (e) => {
    e.stopPropagation();
    console.log('导出到图层管理:', task.id);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    console.log('下载到本地:', task.id);
  };

  const handleSaveToDirectory = (e) => {
    e.stopPropagation();
    setShowSaveModal(true);
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle size={24} className="text-green-500" />;
      case 'failed':
        return <AlertCircle size={24} className="text-red-500" />;
      case 'processing':
      case 'pending':
      default:
        return <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '执行失败';
      case 'processing':
        return `${Math.round(progressPercentage)}%`;
      case 'pending':
        return '等待中';
      default:
        return '';
    }
  };

  return (
    <>
      <div className={`flex items-start gap-3 p-3 rounded-lg shadow-sm border ${
        task.status === 'failed' ? 'bg-red-50 border-red-200' : 
        task.status === 'completed' ? 'bg-green-50 border-green-200' : 
        'bg-white border-gray-200'
      }`}>
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-800 truncate">{task.name}</h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-2">
            {task.status === 'processing' && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${
                task.status === 'failed' ? 'text-red-500' : 
                task.status === 'completed' ? 'text-green-500' : 
                'text-gray-500'
              }`}>
                {getStatusText()}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {new Date(task.createdAt).toLocaleTimeString()}
                </span>
                {task.fileSize && (
                  <span className="text-xs text-gray-400">
                    {task.fileSize}
                  </span>
                )}
              </div>
            </div>
            {task.error && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded">
                {task.error}
              </div>
            )}
            {task.status === 'completed' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExportToLayer}
                  className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="导出到图层管理"
                >
                  <Layers size={16} />
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
                  title="下载到本地"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={handleSaveToDirectory}
                  className="flex items-center justify-center p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                  title="另存到数据目录"
                >
                  <FolderOpen size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <SaveToDirectoryModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        task={task}
      />
    </>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onCloseTask, onClearCompleted }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');
  const processingTasks = tasks.filter(t => t.status === 'processing' || t.status === 'pending');
  const activeTasks = [...processingTasks, ...failedTasks];

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 rounded-t-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-800">
              任务 ({processingTasks.length}/{tasks.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(completedTasks.length > 0 || failedTasks.length > 0) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearCompleted();
                }}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded"
              >
                <Trash2 size={12} />
                清除
              </button>
            )}
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-600" />
            ) : (
              <ChevronDown size={16} className="text-gray-600" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-2 space-y-2 max-h-80 overflow-y-auto border-t border-gray-100">
            {processingTasks.length > 0 && (
              <div className="space-y-2">
                {processingTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClose={() => onCloseTask(task.id)}
                  />
                ))}
              </div>
            )}

            {failedTasks.length > 0 && (
              <div className="space-y-2">
                {(processingTasks.length > 0) && (
                  <div className="text-xs text-gray-400 px-1 pt-1">
                    失败
                  </div>
                )}
                {failedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClose={() => onCloseTask(task.id)}
                  />
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-2">
                {(processingTasks.length > 0 || failedTasks.length > 0) && (
                  <div className="text-xs text-gray-400 px-1 pt-1">
                    已完成
                  </div>
                )}
                {completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClose={() => onCloseTask(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((taskName: string, fileSize?: string): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newTask: Task = {
      id,
      name: taskName,
      progress: 0,
      status: 'processing',
      createdAt: Date.now(),
      fileSize,
    };
    setTasks(prev => [...prev, newTask]);
    return id;
  }, []);

  const updateTaskProgress = useCallback((taskId: string, progress: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              progress, 
              status: progress >= 100 ? 'completed' : 'processing' 
            }
          : task
      )
    );
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status'], error?: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status, error }
          : task
      )
    );
  }, []);

  const closeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(task => task.status !== 'completed' && task.status !== 'failed'));
  }, []);

  return {
    tasks,
    addTask,
    updateTaskProgress,
    updateTaskStatus,
    closeTask,
    clearCompleted,
  };
};

export const useTaskSimulation = (
  addTask: (name: string) => string,
  updateTaskProgress: (id: string, progress: number) => void
) => {
  const startTask = useCallback((taskName: string) => {
    const taskId = addTask(taskName);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        updateTaskProgress(taskId, 100);
        clearInterval(interval);
      } else {
        updateTaskProgress(taskId, progress);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [addTask, updateTaskProgress]);

  return { startTask };
};

export default TaskList;
