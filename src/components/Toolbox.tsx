
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Box, Layers, Map as MapIcon } from 'lucide-react';

const Toolbox: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['空间分析']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const spatialAnalysisTools = [
    '叠置分析',
    '高级叠置分析',
    '缓冲区分析',
    '多重缓冲区分析',
    '非对称缓冲区分析',
    '字段缓冲区分析',
    '空间关系分析',
    '数据检查',
  ];

  return (
    <div className="absolute right-4 top-20 z-10">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="font-medium">工具箱</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {isExpanded && (
        <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg w-64 max-h-96 overflow-y-auto">
          <div className="border-b border-gray-100">
            <div 
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('空间分析')}
            >
              <div className="flex items-center gap-2">
                <Box size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">空间分析</span>
              </div>
              {expandedSections.includes('空间分析') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            
            {expandedSections.includes('空间分析') && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                {spatialAnalysisTools.map((tool, idx) => (
                  <button 
                    key={idx} 
                    className="text-left text-xs px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      {idx === 0 || idx === 1 ? (
                        <rect x="5" y="5" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
                      ) : idx === 2 || idx === 3 ? (
                        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                      ) : idx === 4 || idx === 5 ? (
                        <ellipse cx="12" cy="12" rx="7" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      ) : (
                        <path d="M8 8 L16 16 M8 16 L16 8" stroke="currentColor" strokeWidth="2"/>
                      )}
                    </svg>
                    {tool}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-b border-gray-100">
            <div 
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('几何分析')}
            >
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">几何分析</span>
              </div>
              {expandedSections.includes('几何分析') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>

          <div>
            <div 
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('地图输出')}
            >
              <div className="flex items-center gap-2">
                <MapIcon size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">地图输出</span>
              </div>
              {expandedSections.includes('地图输出') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbox;
