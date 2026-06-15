import React, { useState } from 'react';
import ModelComputeSidebar from './ModelComputeSidebar';
import SampleAnnotation from './SampleAnnotation';
import SampleManagement from './SampleManagement';
import LabelManagement from './LabelManagement';

const ModelCompute: React.FC = () => {
  const [activeTab, setActiveTab] = useState('样本解译');

  return (
    <div className="flex flex-1 h-full bg-gray-50">
      <ModelComputeSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {activeTab === '样本解译' && <SampleAnnotation />}
        {activeTab === '样本管理' && <SampleManagement />}
        {activeTab === '标签管理' && <LabelManagement />}
      </div>
    </div>
  );
};

export default ModelCompute;
