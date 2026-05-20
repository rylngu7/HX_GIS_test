
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import Toolbox from '../components/Toolbox';
import TaskProgressModal from '../components/TaskProgressModal';
import ExportModal from '../components/ExportModal';

export default function Home() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [currentTaskName, setCurrentTaskName] = useState('');
  const [selectedLayerName, setSelectedLayerName] = useState('基准图.tif');
  const [exportDataType, setExportDataType] = useState<'vector' | 'image' | '3d'>('vector');

  const handleExecute = (toolName: string) => {
    setCurrentTaskName(toolName);
    setTaskModalOpen(true);
  };

  const handleExportClick = (dataType: 'vector' | 'image' | '3d') => {
    setExportDataType(dataType);
    setExportModalOpen(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          onExportClick={handleExportClick}
          onLayerSelect={setSelectedLayerName}
        />
        <div className="flex-1 relative">
          <MapView selectedLayerName={selectedLayerName} />
          <Toolbox onExecute={handleExecute} />
        </div>
      </div>
      
      {/* 任务进度弹窗 */}
      <TaskProgressModal 
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskName={currentTaskName}
      />
      
      {/* 导出弹窗 */}
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        dataType={exportDataType}
      />
    </div>
  );
}
