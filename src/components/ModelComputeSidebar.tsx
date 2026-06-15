import React, { useState } from 'react';
import { Database, Brain, ChevronDown, ChevronRight } from 'lucide-react';

interface ModelComputeSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ModelComputeSidebar: React.FC<ModelComputeSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  // 一级：模型计算；二级：样本标注（默认展开）；三级：样本解译 / 样本管理
  const [sampleAnnotationOpen, setSampleAnnotationOpen] = useState(true);

  const subTabs = [
    { id: '样本解译', icon: <Database size={15} /> },
    { id: '样本管理', icon: <Brain size={15} /> },
  ];

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* 一级：模型计算 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="text-blue-600 font-semibold text-sm">模型计算</span>
      </div>

      <div className="flex-1 py-2 overflow-y-auto">
        {/* 二级：样本标注（可折叠） */}
        <div>
          <div
            className="flex items-center justify-between gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50"
            onClick={() => setSampleAnnotationOpen(!sampleAnnotationOpen)}
          >
            <div className="flex items-center gap-2">
              {sampleAnnotationOpen ? (
                <ChevronDown size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-800">样本标注</span>
            </div>
          </div>

          {sampleAnnotationOpen && (
            <div className="pl-4">
              {subTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {React.cloneElement(tab.icon, {
                      className: isActive ? 'text-blue-700' : 'text-gray-500',
                    })}
                    <span
                      className={`text-sm ${
                        isActive
                          ? 'text-blue-800 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {tab.id}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelComputeSidebar;
