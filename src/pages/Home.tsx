import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import Toolbox from '../components/Toolbox';
import TaskManagementCenter from '../components/TaskManagementCenter';
import { useTaskManager, useTaskSimulation } from '../components/TaskList';
import ExportModal from '../components/ExportModal';
import UploadFileModal from '../components/UploadFileModal';

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

  const handleExecute = (toolName, params) => {
    if (toolName === '视频融合' && params) {
      setVideoParams(params);
      setVideoFusionActive(true);
      startTask(toolName);
    } else if (toolName !== '视频融合') {
      startTask(toolName);
    }
    // 打开任务管理中心
    setTaskCenterOpen(true);
  };

  const handleExportClick = (dataType) => {
    setExportDataType(dataType);
    setExportModalOpen(true);
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleSetVideoParams = (params: any) => {
    setVideoParams(params);
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
      <Header 
        onToggleTaskCenter={handleToggleTaskCenter} 
        onToggleToolbox={handleToggleToolbox}
        hasTasks={tasks.length > 0} 
        toolboxOpen={toolboxOpen}
      />
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
            onToggleTaskCenter={handleToggleTaskCenter}
            onToggleToolbox={handleToggleToolbox}
            hasTasks={tasks.length > 0}
            toolboxOpen={toolboxOpen}
          />
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
