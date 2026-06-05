import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import Toolbox from '../components/Toolbox';
import TaskManagementCenter from '../components/TaskManagementCenter';
import { useTaskManager, useTaskSimulation } from '../components/TaskList';
import ExportModal from '../components/ExportModal';
import UploadFileModal from '../components/UploadFileModal';
import { Clock, Briefcase } from 'lucide-react';

export default function Home() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedLayerName, setSelectedLayerName] = useState('基准图.tif');
  const [exportDataType, setExportDataType] = useState<"vector" | "image" | "3d">('vector');
  const [videoFusionActive, setVideoFusionActive] = useState(false);
  const [videoParams, setVideoParams] = useState<any>(null);
  const [taskCenterOpen, setTaskCenterOpen] = useState(false);
  const [toolboxOpen, setToolboxOpen] = useState(true);

  const { tasks, addTask, updateTaskProgress, closeTask, clearCompleted } = useTaskManager();
  const { startTask } = useTaskSimulation(addTask, updateTaskProgress);

  const handleExecute = (toolName: string, params?: any) => {
    if (toolName === '视频融合' && params) {
      setVideoParams(params);
      setVideoFusionActive(true);
    }
    startTask(toolName);
    setTaskCenterOpen(true);
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

  return (
    <div className="h-screen flex flex-col">
      <Header />
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

      {/* 任务管理中心 */}
      {taskCenterOpen && (
        <TaskManagementCenter
          isOpen={taskCenterOpen}
          onClose={() => setTaskCenterOpen(false)}
          tasks={tasks}
          onCloseTask={closeTask}
          onClearCompleted={clearCompleted}
        />
      )}

      {/* 导出弹窗 */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        dataType={exportDataType}
      />

      {/* 上传文件弹窗 */}
      <UploadFileModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}