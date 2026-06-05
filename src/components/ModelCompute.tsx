import React, { useState } from 'react';
import ModelComputeSidebar from './ModelComputeSidebar';
import SampleAnnotation from './SampleAnnotation';
import SampleManagement from './SampleManagement';

const ModelCompute: React.FC = () => {
  const [activeTab, setActiveTab] = useState('样本解译');

  return (
    <div className="flex h-full">
      <ModelComputeSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {activeTab === '样本解译' && <SampleAnnotation />}
        {activeTab === '样本管理' && <SampleManagement />}
      </div>
    </div>
  );
};

export default ModelCompute;
