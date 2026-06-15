import React from 'react';
import { Brain, Database, FolderTree } from 'lucide-react';

interface ModelComputeSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ModelComputeSidebar: React.FC<ModelComputeSidebarProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: '样本解译', icon: <Database size={16} /> },
    { id: '样本管理', icon: <Brain size={16} /> },
  ];

  return (
    <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-blue-600 font-medium text-sm">样本标注</span>
      </div>
      
      <div className="flex-1 py-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 border-l-4 border-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            {React.cloneElement(tab.icon, {
              className: activeTab === tab.id ? 'text-blue-700' : 'text-gray-500'
            })}
            <span className={`text-sm font-medium ${
              activeTab === tab.id ? 'text-blue-800' : 'text-gray-700'
            }`}>
              {tab.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelComputeSidebar;
