import React, { useState, useCallback } from 'react';
import ModelComputeSidebar from './ModelComputeSidebar';
import SampleAnnotation from './SampleAnnotation';
import SampleManagement from './SampleManagement';
import LabelManagement from './LabelManagement';

const ModelCompute: React.FC = () => {
  const [activeTab, setActiveTab] = useState('样本解译');
  // 跨子页面导航：进入"样本解译"工作台时预选中的任务/图层
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);
  const [targetLayerIdx, setTargetLayerIdx] = useState<number | null>(null);

  // 跳转到样本解译的具体任务+图层
  const jumpToAnnotation = useCallback((taskId: string, layerIdx: number) => {
    setTargetTaskId(taskId);
    setTargetLayerIdx(layerIdx);
    setActiveTab('样本解译');
  }, []);

  // 切到"样本解译"Tab 时清除目标（手动点击 Tab 时）
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab !== '样本解译') {
      setTargetTaskId(null);
      setTargetLayerIdx(null);
    }
  }, []);

  return (
    <div className="flex flex-1 h-full bg-gray-50">
      <ModelComputeSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 overflow-hidden">
        {activeTab === '样本解译' && (
          <SampleAnnotation
            targetTaskId={targetTaskId}
            targetLayerIdx={targetLayerIdx}
            onConsumedTarget={() => {
              setTargetTaskId(null);
              setTargetLayerIdx(null);
            }}
          />
        )}
        {activeTab === '样本管理' && (
          <SampleManagement onJumpToAnnotation={jumpToAnnotation} />
        )}
        {activeTab === '标签管理' && <LabelManagement />}
      </div>
    </div>
  );
};

export default ModelCompute;
