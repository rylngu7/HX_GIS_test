import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'failed';
  size: string;
  submitTime: string;
  error?: string;
}

interface TaskManagementCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskManagementCenter: React.FC<TaskManagementCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'completed'>('all');

  const tasks: Task[] = [
    {
      id: '1',
      name: '12雄安点151651.geojson',
      status: 'failed',
      size: '19.3 KB',
      submitTime: '14:34',
      error: '错误:任务执行失败，请联系管理员处理。'
    },
    {
      id: '2',
      name: '4雄安面.geojson',
      status: 'completed',
      size: '1.2 KB',
      submitTime: '16:19'
    },
    {
      id: '3',
      name: '4雄安面.zip',
      status: 'failed',
      size: '519 B',
      submitTime: '15:49',
      error: '错误:任务执行失败，请联系管理员处理。'
    },
    {
      id: '4',
      name: '4雄安面.zip',
      status: 'failed',
      size: '519 B',
      submitTime: '15:50',
      error: '错误:任务执行失败，请联系管理员处理。'
    }
  ];

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing') return task.status === 'processing';
    if (activeTab === 'completed') return task.status === 'completed' || task.status === 'failed';
    return true;
  });

  if (!isOpen) return null;

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'processing':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            处理中
          </span>
        );
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
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-lg font-medium text-gray-800">任务管理中心</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'all'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            全部 ({tasks.length})
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'processing'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('processing')}
          >
            进行中 ({tasks.filter(t => t.status === 'processing').length})
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'completed'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            已完成 ({tasks.filter(t => t.status === 'completed' || t.status === 'failed').length})
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border ${
                task.status === 'failed' ? 'border-red-200 bg-red-50' : 
                task.status === 'completed' ? 'border-green-200 bg-green-50' : 
                'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800 truncate">{task.name}</h4>
                    {getStatusBadge(task.status)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-4">
                    <span>大小: {task.size}</span>
                    <span>提交时间: {task.submitTime}</span>
                  </div>
                  {task.error && (
                    <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded">
                      {task.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskManagementCenter;
