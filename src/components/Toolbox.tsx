
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Box, Layers, Map as MapIcon } from 'lucide-react';

const Toolbox: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['空间分析', '几何分析', '地图输出']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const spatialAnalysisTools = [
    { name: '叠置分析', icon: 'overlay', disabled: true },
    { name: '高级叠置分析', icon: 'advancedOverlay', disabled: true },
    { name: '缓冲区分析', icon: 'buffer', disabled: true },
    { name: '多重缓冲区分析', icon: 'multiBuffer', disabled: true },
    { name: '非对称缓冲区分析', icon: 'asymmetricBuffer', disabled: true },
    { name: '字段缓冲区分析', icon: 'fieldBuffer', disabled: true },
    { name: '空间关系分析', icon: 'spatialRelation', disabled: true },
    { name: '数据检查', icon: 'dataCheck', disabled: true },
  ];

  const geometryAnalysisTools = [
    { name: '投影系统转换', icon: 'projection', disabled: false },
  ];

  const mapOutputTools = [
    { name: '截图', icon: 'screenshot', disabled: false },
  ];

  const renderIcon = (iconType: string, disabled: boolean) => {
    const opacityClass = disabled ? 'opacity-40' : '';
    switch (iconType) {
      case 'overlay':
      case 'advancedOverlay':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="4" y="6" width="8" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8" y="10" width="8" height="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'buffer':
      case 'multiBuffer':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        );
      case 'asymmetricBuffer':
      case 'fieldBuffer':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <ellipse cx="12" cy="12" rx="6" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'spatialRelation':
      case 'dataCheck':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 18 L18 6" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'projection':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="4" y="6" width="16" height="12" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 6 L8 4 L16 4 L20 6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4 L8 6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 4 L16 6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'screenshot':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="9" r="1.5" fill="currentColor" />
            <rect x="14" y="13" width="5" height="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute right-4 top-20 z-10">
      {/* 展开/收起按钮 */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="font-medium">工具箱</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {isExpanded && (
        <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg w-72 max-h-[500px] overflow-y-auto">
          {/* 空间分析 */}
          <div className="border-b border-gray-200">
            <div 
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('空间分析')}
            >
              <div className="flex items-center gap-2">
                <Box size={16} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-800">空间分析</span>
              </div>
              {expandedSections.includes('空间分析') ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
            </div>
            
            {expandedSections.includes('空间分析') && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-1 bg-gray-50">
                {spatialAnalysisTools.map((tool, idx) => (
                  <button 
                    key={idx} 
                    className={`text-left text-xs px-2 py-2 rounded flex items-center gap-2 transition-colors ${
                      tool.disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    disabled={tool.disabled}
                  >
                    {renderIcon(tool.icon, tool.disabled)}
                    <span className="whitespace-nowrap truncate">{tool.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 几何分析 */}
          <div className="border-b border-gray-200">
            <div 
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('几何分析')}
            >
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-800">几何分析</span>
              </div>
              {expandedSections.includes('几何分析') ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
            </div>

            {expandedSections.includes('几何分析') && (
              <div className="px-3 pb-3">
                {geometryAnalysisTools.map((tool, idx) => (
                  <button 
                    key={idx} 
                    className={`text-left text-xs px-2 py-2 rounded flex items-center gap-2 transition-colors w-full ${
                      tool.disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    disabled={tool.disabled}
                  >
                    {renderIcon(tool.icon, tool.disabled)}
                    <span className="whitespace-nowrap">{tool.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 地图输出 */}
          <div>
            <div 
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('地图输出')}
            >
              <div className="flex items-center gap-2">
                <MapIcon size={16} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-800">地图输出</span>
              </div>
              {expandedSections.includes('地图输出') ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
            </div>

            {expandedSections.includes('地图输出') && (
              <div className="px-3 pb-3">
                {mapOutputTools.map((tool, idx) => (
                  <button 
                    key={idx} 
                    className={`text-left text-xs px-2 py-2 rounded flex items-center gap-2 transition-colors w-full ${
                      tool.disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    disabled={tool.disabled}
                  >
                    {renderIcon(tool.icon, tool.disabled)}
                    <span className="whitespace-nowrap">{tool.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbox;
