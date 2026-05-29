import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import Toolbox from '../components/Toolbox';
import TaskList, { useTaskManager, useTaskSimulation } from '../components/TaskList';
import ExportModal from '../components/ExportModal';
import UploadFileModal from '../components/UploadFileModal';

export default function Home() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedLayerName, setSelectedLayerName] = useState('基准图.tif');
  const [exportDataType, setExportDataType] = useState<"vector" | "image" | "3d">('vector');
  const [videoFusionActive, setVideoFusionActive] = useState(false);
  const [videoParams, setVideoParams] = useState<any>(null);

  const { tasks, addTask, updateTaskProgress, closeTask, clearCompleted } = useTaskManager();
  const { startTask } = useTaskSimulation(addTask, updateTaskProgress);

  const handleExecute = (toolName, params) => {
    if (toolName === '视频融合' && params) {
      setVideoParams(params);
    } else if (toolName !== '视频融合') {
      startTask(toolName);
    }
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
          <Toolbox onExecute={handleExecute} />
        </div>
      </div>

      {/* 任务列表 */}
      <TaskList
        tasks={tasks}
        onCloseTask={closeTask}
        onClearCompleted={clearCompleted}
      />

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
