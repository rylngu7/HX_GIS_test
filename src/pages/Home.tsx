import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import Toolbox from '../components/Toolbox';
import TaskManagementCenter from '../components/TaskManagementCenter';
import ModelCompute from '../components/ModelCompute';
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
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('数据管理');

  const { tasks, addTask, updateTaskProgress, updateTaskStatus, closeTask, clearCompleted } = useTaskManager();
  const { startTask } = useTaskSimulation(addTask, updateTaskProgress);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const handleUploadFile = (payload: { file: File; dataType: string; dataName: string; description: string; checkProjection: boolean }) => {
    const fileSize = formatFileSize(payload.file.size);
    const taskId = addTask(`上传: ${payload.dataName}`, fileSize, payload.dataType, payload.dataName);
    setTaskCenterOpen(true);

    const stages: Array<{ target: number; stage: 'uploading' | 'validating' | 'parsing' | 'storing'; text: string; failRate: number }> = [
      { target: 25,  stage: 'uploading',  text: '正在上传文件',           failRate: 0 },
      { target: 60,  stage: 'validating', text: '后端格式与质量校验',     failRate: 0.15 },
      { target: 85,  stage: 'parsing',    text: '正在解析数据',           failRate: 0.05 },
      { target: 100, stage: 'storing',    text: '写入数据目录',           failRate: 0.03 },
    ];

    let currentStageIdx = 0;
    let progress = 0;

    updateTaskProgress(taskId, 0, { stage: 'uploading', stageText: stages[0].text });

    const tick = setInterval(() => {
      const stage = stages[currentStageIdx];
      progress += Math.random() * 5 + 2;
      if (progress >= stage.target) {
        progress = stage.target;
        updateTaskProgress(taskId, progress, { stage: stage.stage, stageText: stage.text });

        if (Math.random() < stage.failRate) {
          clearInterval(tick);
          const errorMsg = {
            uploading:  '上传失败：网络中断，请重试',
            validating: '校验失败：文件缺少时空属性或不符合数据规范',
            parsing:    '解析失败：文件内容损坏或格式不匹配',
            storing:    '入库失败：写入数据目录时发生错误',
          }[stage.stage];
          updateTaskStatus(taskId, 'failed', errorMsg);
          return;
        }

        currentStageIdx++;
        if (currentStageIdx >= stages.length) {
          clearInterval(tick);
          updateTaskStatus(taskId, 'completed');
          return;
        }
        const next = stages[currentStageIdx];
        updateTaskProgress(taskId, progress, { stage: next.stage, stageText: next.text });
      } else {
        updateTaskProgress(taskId, progress);
      }
    }, 250);
  };

  const handleExecute = (toolName: string, params?: any) => {
    if (toolName === '视频融合' && params) {
      setVideoParams(params);
      setVideoFusionActive(true);
    }
    if (params?.success === false) {
      // 处理失败任务
      const taskId = addTask(toolName);
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
      <Header activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="flex-1 flex overflow-hidden">
        {renderContent()}
      </div>

      {/* 任务管理中心 */}
      {taskCenterOpen && activeNav === '数据管理' && (
        <TaskManagementCenter
          isOpen={taskCenterOpen}
          onClose={() => setTaskCenterOpen(false)}
          tasks={tasks}
          onCloseTask={closeTask}
          onClearCompleted={clearCompleted}
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

      {/* 上传文件弹窗 */}
      {activeNav === '数据管理' && (
        <UploadFileModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploadFile={handleUploadFile}
        />
      )}
    </div>
  );
}