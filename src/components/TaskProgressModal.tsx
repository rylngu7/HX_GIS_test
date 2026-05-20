import React, { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface TaskProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
}

const TaskProgressModal: React.FC<TaskProgressModalProps> = ({ isOpen, onClose, taskName }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setIsComplete(false);
      
      // 模拟进度条动画
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsComplete(true);
            // 完成后延迟关闭
            setTimeout(() => {
              onClose();
            }, 1500);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-80 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-gray-800 font-medium">{taskName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            {isComplete ? (
              <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
            ) : (
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            )}
            <p className="text-gray-700">
              {isComplete ? '任务完成' : '正在执行...'}
            </p>
          </div>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {Math.round(Math.min(progress, 100))}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressModal;
