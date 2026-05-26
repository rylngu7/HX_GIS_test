import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export interface Task {
  id: string;
  name: string;
  progress: number;
  isComplete: boolean;
  createdAt: number;
}

interface TaskListProps {
  tasks: Task[];
  onCloseTask: (taskId: string) => void;
  onClearCompleted: () => void;
}

const TaskItem: React.FC<{ task: Task; onClose: () => void }> = ({ task, onClose }) => {
  const progressPercentage = Math.min(task.progress, 100);

  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex-shrink-0">
        {task.isComplete ? (
          <CheckCircle size={24} className="text-green-500" />
        ) : (
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        )}
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
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                task.isComplete ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {task.isComplete ? '已完成' : `${Math.round(progressPercentage)}%`}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(task.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onCloseTask, onClearCompleted }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const completedTasks = tasks.filter(t => t.isComplete);
  const activeTasks = tasks.filter(t => !t.isComplete);

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
              任务 ({activeTasks.length}/{tasks.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {completedTasks.length > 0 && (
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
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-2 space-y-2 max-h-80 overflow-y-auto border-t border-gray-100">
            {activeTasks.length > 0 && (
              <div className="space-y-2">
                {activeTasks.map(task => (
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
                {activeTasks.length > 0 && (
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

  const addTask = useCallback((taskName: string): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newTask: Task = {
      id,
      name: taskName,
      progress: 0,
      isComplete: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
    return id;
  }, []);

  const updateTaskProgress = useCallback((taskId: string, progress: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, progress, isComplete: progress >= 100 }
          : task
      )
    );
  }, []);

  const closeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(task => !task.isComplete));
  }, []);

  return {
    tasks,
    addTask,
    updateTaskProgress,
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
