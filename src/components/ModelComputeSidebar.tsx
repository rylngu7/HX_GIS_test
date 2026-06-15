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
    { id: '标签管理', icon: <FolderTree size={16} /> },
    { id: '样本管理', icon: <Brain size={16} /> },
  ];

  return (
    <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-1.5">工作区</div>
        <div className="relative">
          <select
            value="样本标注"
            onChange={(e) => onTabChange(e.target.value === '样本标注' ? '样本解译' : e.target.value)}
            className="w-full text-sm font-medium text-blue-700 bg-white border border-gray-200 rounded px-2 py-1.5 appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="样本标注">样本标注</option>
            <option value="标签管理">标签管理</option>
            <option value="样本管理">样本管理</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 border-l-4 border-blue-600'
                : 'hover:bg-gray-50 border-l-4 border-transparent'
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
