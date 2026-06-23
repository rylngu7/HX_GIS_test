import React, { useState, useRef, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import Toolbox from '../components/Toolbox';
import TaskManagementCenter from '../components/TaskManagementCenter';
import ModelCompute from '../components/ModelCompute';
import { useTaskManager, useTaskSimulation } from '../components/TaskList';
import ExportModal from '../components/ExportModal';
import UploadFileModal from '../components/UploadFileModal';
import { Clock, Briefcase, AlertCircle, X } from 'lucide-react';

export default function Home() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedLayerName, setSelectedLayerName] = useState('基准图.tif');
  const [exportDataType, setExportDataType] = useState<"vector" | "image" | "3d">('vector');
  const [videoFusionActive, setVideoFusionActive] = useState(false);
  const [videoParams, setVideoParams] = useState<any>(null);
  const [taskCenterOpen, setTaskCenterOpen] = useState(false);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('数据管理');

  // 上传进行中状态
  const [isUploading, setIsUploading] = useState(false);
  // 离开数据目录页面确认弹窗
  const [showNavLeaveConfirm, setShowNavLeaveConfirm] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  // 删除任务确认弹窗
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);

  const { tasks, addTask, updateTaskProgress, updateTaskStatus, closeTask, clearCompleted, markSavedToDirectory } = useTaskManager();
  const { startTask } = useTaskSimulation(addTask, updateTaskProgress);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  // Track the latest upload task id so simulation updates can target the same task
  const latestUploadTaskIdRef = useRef<string | null>(null);
  // Ref to trigger upload cancellation from the modal (used when leaving the page)
  const cancelUploadRef = useRef<(() => void) | null>(null);

  const setUploadCancelRef = useCallback((ref: { cancel: () => void } | null) => {
    cancelUploadRef.current = ref ? ref.cancel : null;
  }, []);

  const handleUploadFile = (payload: { file: File; dataType: string; dataName: string; description: string; checkProjection: boolean; targetDirectory?: string; _stageSuccess?: boolean; _stageFailure?: string; _stageKey?: string }) => {
    // Case 1: stage failure callback from UploadFileModal -> mark the task as failed
    if (payload._stageFailure && latestUploadTaskIdRef.current) {
      updateTaskStatus(latestUploadTaskIdRef.current, 'failed', payload._stageFailure);
      latestUploadTaskIdRef.current = null;
      return;
    }
    // Case 2: stage success callback -> mark the task as completed
    if (payload._stageSuccess && latestUploadTaskIdRef.current) {
      updateTaskStatus(latestUploadTaskIdRef.current, 'completed');
      latestUploadTaskIdRef.current = null;
      return;
    }
    // Case 3: initial create-task call
    const fileSize = formatFileSize(payload.file.size);
    const taskId = addTask(`上传: ${payload.dataName}`, fileSize, payload.dataType, payload.dataName, 'upload');
    latestUploadTaskIdRef.current = taskId;
    setTaskCenterOpen(true);
  };

  // 上传进度回调
  const handleUploadProgress = (progress: number, stageText?: string) => {
    if (latestUploadTaskIdRef.current) {
      updateTaskProgress(latestUploadTaskIdRef.current, progress, { stageText });
    }
  };

  // 上传状态变化回调
  const handleUploadingChange = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
  }, []);

  // 父组件提供的中断上传方法（供模态框内部使用，触发人为中断失败）
  const handleCancelUpload = useCallback(() => {
    if (latestUploadTaskIdRef.current) {
      updateTaskStatus(
        latestUploadTaskIdRef.current,
        'failed',
        '人为中断：用户在中途选择离开'
      );
      latestUploadTaskIdRef.current = null;
    }
  }, [updateTaskStatus]);

  const handleExecute = (toolName: string, params?: any) => {
    if (toolName === '视频融合' && params) {
      setVideoParams(params);
      setVideoFusionActive(true);
    }
    if (params?.success === false) {
      // 处理失败任务
      const taskId = addTask(toolName, undefined, undefined, undefined, 'toolbox');
      updateTaskStatus(taskId, 'failed', params.error);
      setTaskCenterOpen(true);
    } else {
      startTask(toolName);
      setTaskCenterOpen(true);
    }
  };

  const handleExportClick = (dataType: "vector" | "image" | "3d") => {
    setExportDataType(dataType);
    setExportModalOpen(true);
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleClearVideo = () => {
    setVideoFusionActive(false);
    setVideoParams(null);
  };

  const handleToggleTaskCenter = () => {
    setTaskCenterOpen(!taskCenterOpen);
  };

  const handleToggleToolbox = () => {
    setToolboxOpen(!toolboxOpen);
  };

  // 导航切换处理：若正在上传则先弹出确认
  const handleNavChange = (nav: string) => {
    if (activeNav === '数据管理' && nav !== '数据管理' && isUploading) {
      setPendingNav(nav);
      setShowNavLeaveConfirm(true);
      return;
    }
    setActiveNav(nav);
  };

  // 确认离开数据目录：中断上传并切换导航
  const confirmNavLeave = () => {
    // 1) 标记任务为失败
    if (latestUploadTaskIdRef.current) {
      updateTaskStatus(
        latestUploadTaskIdRef.current,
        'failed',
        '人为中断：用户在中途选择离开'
      );
      latestUploadTaskIdRef.current = null;
    }
    // 2) 主动停止上传模拟（清理 tickRef 并关闭弹窗）
    if (cancelUploadRef.current) {
      cancelUploadRef.current();
    } else {
      setUploadModalOpen(false);
    }
    setShowNavLeaveConfirm(false);
    const nextNav = pendingNav;
    setPendingNav(null);
    if (nextNav) setActiveNav(nextNav);
  };
  const cancelNavLeave = () => {
    setShowNavLeaveConfirm(false);
    setPendingNav(null);
  };

  // 任务删除处理：工具箱未另存的任务需要二次确认
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    // 上传文件的任务：自动存储到数据目录，删除不加提示
    if (task.source === 'upload') {
      closeTask(taskId);
      return;
    }
    // 工具箱任务：未另存到目录的删除需确认
    if (task.source === 'toolbox') {
      if (task.savedToDirectory) {
        closeTask(taskId);
      } else {
        setPendingDeleteTaskId(taskId);
        setShowDeleteConfirm(true);
      }
      return;
    }
    // 兜底：直接删除
    closeTask(taskId);
  };

  const confirmDeleteTask = () => {
    if (pendingDeleteTaskId) {
      closeTask(pendingDeleteTaskId);
    }
    setShowDeleteConfirm(false);
    setPendingDeleteTaskId(null);
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteTaskId(null);
  };

  const renderContent = () => {
    if (activeNav === '模型计算') {
      return <ModelCompute />;
    }

    return (
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onExportClick={handleExportClick}
          onLayerSelect={setSelectedLayerName}
          onUploadClick={handleUploadClick}
        />
        <div className="flex-1 relative">
          <MapView
            selectedLayerName={selectedLayerName}
            videoFusionActive={videoFusionActive}
            videoParams={videoParams}
            onClearVideo={handleClearVideo}
          />

          {/* 地图右上角图标按钮 */}
          <div className="absolute top-4 right-4 flex gap-2 z-[200]">
            <button
              onClick={handleToggleTaskCenter}
              className={`relative w-10 h-10 bg-white border-2 border-gray-300 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-blue-500 transition-all cursor-pointer ${
                tasks.length > 0 ? 'border-blue-500 ring-2 ring-blue-200' : ''
              }`}
              title="任务管理中心"
            >
              <Clock size={20} className="text-blue-600" />
              {tasks.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>
            <button
              onClick={handleToggleToolbox}
              className={`w-10 h-10 bg-white border-2 border-gray-300 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-blue-500 transition-all cursor-pointer ${
                toolboxOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''
              }`}
              title="工具箱"
            >
              <Briefcase size={20} className="text-blue-600" />
            </button>
          </div>

          {toolboxOpen && <Toolbox onExecute={handleExecute} />}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <Header activeNav={activeNav} onNavChange={handleNavChange} />
      <div className="flex-1 flex overflow-hidden">
        {renderContent()}
      </div>

      {/* 任务管理中心 */}
      {taskCenterOpen && (
        <TaskManagementCenter
          isOpen={taskCenterOpen}
          onClose={() => setTaskCenterOpen(false)}
          tasks={tasks}
          onCloseTask={handleDeleteTask}
          onClearCompleted={clearCompleted}
          onMarkSaved={markSavedToDirectory}
        />
      )}

      {/* 导出弹窗 */}
      {activeNav === '数据管理' && (
        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          dataType={exportDataType}
        />
      )}

      {/* 上传文件弹窗 - 仅在数据管理页面渲染 */}
      {activeNav === '数据管理' && (
        <UploadFileModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploadFile={handleUploadFile}
          onProgress={handleUploadProgress}
          onUploadingChange={handleUploadingChange}
          onCancelUploadRef={setUploadCancelRef}
        />
      )}

      {/* 离开数据目录确认弹窗 */}
      {showNavLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300]">
          <div className="bg-white rounded-lg p-6 w-[360px] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-orange-500 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-800">确认离开数据目录？</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              当前文件正在上传中，离开将中断上传流程，确定要离开吗？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelNavLeave}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                继续上传
              </button>
              <button
                onClick={confirmNavLeave}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                确认离开
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除任务确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300]">
          <div className="bg-white rounded-lg p-6 w-[360px] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-orange-500 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-800">确认删除任务？</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              该任务的结果尚未另存到数据目录，删除后将无法恢复，确定要删除吗？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteTask}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}