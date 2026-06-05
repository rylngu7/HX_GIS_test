import React, { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle, Layers, Download, FolderOpen } from 'lucide-react';
import { Task } from './TaskList';

interface TaskManagementCenterProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onCloseTask: (taskId: string) => void;
  onClearCompleted: () => void;
}

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

  const libraryData = {
    standard: { name: '标准库', folders: ['标准数据1', '标准数据2'] },
    fusion: { name: '融合库', folders: ['融合结果', '临时数据'] },
  };

  const toggleFolder = (folder: string) => {
    setSelectedFolder(prev => prev === folder ? null : folder);
  };

  const handleConfirm = () => {
    console.log('保存到数据目录:', { taskId: task.id, dataName, targetLibrary, selectedFolder });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-96">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-800">保存到数据目录</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">选择目录</span>
            </div>
            <div className="border border-gray-300 rounded p-3 min-h-[120px] max-h-[160px] overflow-y-auto">
              {libraryData[targetLibrary].folders.map((folder, idx) => (
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
                    {selectedFolder === folder && <CheckCircle size={10} className="text-white" />}
                  </div>
                  <span>{folder}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
          >
            取消
          </button>
          <button 
            onClick={handleConfirm}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskItemInCenter: React.FC<{ 
  task: Task; 
  onClose: () => void;
}> = ({ task, onClose }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const progressPercentage = Math.min(task.progress, 100);

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
        return <CheckCircle size={20} className="text-green-500" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'processing':
      case 'pending':
      default:
        return <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />;
    }
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
            已完成
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
            处理失败
          </span>
        );
      case 'processing':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            处理中
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            等待中
          </span>
        );
    }
  };

  return (
    <>
      <div className={`p-3 rounded-lg border ${
        task.status === 'failed' ? 'border-red-200 bg-red-50' : 
        task.status === 'completed' ? 'border-green-200 bg-green-50' : 
        'border-gray-200 bg-white'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <h4 className="font-medium text-gray-800 truncate text-sm">{task.name}</h4>
              {getStatusBadge()}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-4 mt-1">
              <span>提交时间: {new Date(task.createdAt).toLocaleTimeString()}</span>
            </div>
            {task.status === 'processing' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{Math.round(progressPercentage)}%</div>
              </div>
            )}
            {task.error && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded">
                {task.error}
              </div>
            )}
            {task.status === 'completed' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExportToLayer}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs transition-colors"
                >
                  <Layers size={14} />
                  导出到图层
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs transition-colors"
                >
                  <Download size={14} />
                  下载
                </button>
                <button
                  onClick={handleSaveToDirectory}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded text-xs transition-colors"
                >
                  <FolderOpen size={14} />
                  另存到目录
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 flex-shrink-0"
          >
            <X size={14} />
          </button>
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

const TaskManagementCenter: React.FC<TaskManagementCenterProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  onCloseTask, 
  onClearCompleted 
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'completed' | 'failed'>('all');

  const safeTasks = tasks || [];
  const filteredTasks = safeTasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing') return task.status === 'processing' || task.status === 'pending';
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'failed') return task.status === 'failed';
    return true;
  });

  const counts = {
    all: safeTasks.length,
    processing: safeTasks.filter(t => t.status === 'processing' || t.status === 'pending').length,
    completed: safeTasks.filter(t => t.status === 'completed').length,
    failed: safeTasks.filter(t => t.status === 'failed').length,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-[150px] z-[150]">
      <div className="bg-white rounded-lg shadow-2xl w-[480px] max-h-[70vh] overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-600" />
            <span className="text-base font-medium text-gray-800">任务管理中心</span>
          </div>
          <div className="flex items-center gap-2">
            {(counts.completed > 0 || counts.failed > 0) && (
              <button
                onClick={onClearCompleted}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded"
              >
                清除已完成
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-200 rounded">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 bg-white">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'all'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            全部 ({counts.all})
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'processing'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('processing')}
          >
            进行中 ({counts.processing})
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'completed'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            已完成 ({counts.completed})
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'failed'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('failed')}
          >
            失败 ({counts.failed})
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-3 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              暂无任务
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItemInCenter
                key={task.id}
                task={task}
                onClose={() => onCloseTask(task.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagementCenter;
