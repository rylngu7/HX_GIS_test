import React, { useState } from 'react';
import { Database, FolderTree, Brain, ChevronUp, ChevronDown } from 'lucide-react';

interface ModelComputeSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ModelComputeSidebar: React.FC<ModelComputeSidebarProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const [expanded, setExpanded] = useState(true);

  const subTabs = [
    { id: '样本解译', icon: <Database size={14} /> },
    { id: '标签管理', icon: <FolderTree size={14} /> },
    { id: '样本管理', icon: <Brain size={14} /> },
  ];

  return (
    <div className="w-44 bg-white border-r border-gray-200 flex flex-col">
      {/* 样本标注作为导航栏标题（可折叠） */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-medium text-sm">样本标注</span>
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-gray-500" />
        ) : (
          <ChevronDown size={14} className="text-gray-500" />
        )}
      </div>

      {/* 子项列表 */}
      {expanded && (
        <div className="flex-1 py-1">
          {subTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pl-6 pr-4 py-2 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              {React.cloneElement(tab.icon, {
                className: activeTab === tab.id ? 'text-blue-700' : 'text-gray-500'
              })}
              <span className={`text-sm ${
                activeTab === tab.id ? 'text-blue-800 font-medium' : 'text-gray-700'
              }`}>
                {tab.id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelComputeSidebar;
