import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Box, Layers, Map as MapIcon, Satellite, ListTodo } from 'lucide-react';
import RemoteSensingModal from './RemoteSensingModal';
import VideoFusionModal from './VideoFusionModal';
import TaskManagementCenter from './TaskManagementCenter';

interface ToolboxProps {
  onExecute?: (toolName: string, params?: any) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ onExecute }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['空间分析', '几何分析', '遥感算法', '地图输出']);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [videoFusionOpen, setVideoFusionOpen] = useState(false);
  const [taskManagementOpen, setTaskManagementOpen] = useState(false);

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
    { name: '投影系统转换', icon: 'projection', disabled: false, noModal: true },
  ];

  const remoteSensingRecognitionTools = [
    { name: '多目标识别', icon: 'multiTarget', disabled: false },
    { name: '车辆目标识别', icon: 'car', disabled: false },
    { name: '路口目标识别', icon: 'intersection', disabled: false },
    { name: '桥梁目标识别', icon: 'bridge', disabled: false },
    { name: '机场目标识别', icon: 'airport', disabled: false },
    { name: '飞机目标识别', icon: 'plane', disabled: false },
    { name: '油罐目标识别', icon: 'tank', disabled: false },
    { name: '舰船目标识别', icon: 'ship', disabled: false },
    { name: '建筑物提取', icon: 'building', disabled: false },
    { name: '部落房屋提取', icon: 'house', disabled: false },
    { name: '道路提取', icon: 'road', disabled: false },
  ];

  const remoteSensingProcessingTools = [
    { name: '预处理流程', icon: 'process', disabled: false },
    { name: '几何校正', icon: 'geometry', disabled: false },
    { name: '正射校正', icon: 'ortho', disabled: false },
    { name: '影像匀色', icon: 'color', disabled: false },
    { name: '影像镶嵌', icon: 'mosaic', disabled: false },
    { name: '波段合成', icon: 'bandComposite', disabled: false },
  ];

  const mapOutputTools = [
    { name: '截图', icon: 'screenshot', disabled: false, noModal: true },
    { name: '视频融合', icon: 'videoFusion', disabled: false },
  ];

  const handleToolClick = (toolName: string, disabled: boolean, noModal?: boolean) => {
    if (!disabled && !noModal) {
      if (toolName === '视频融合') {
        setVideoFusionOpen(true);
      } else {
        setActiveModal(toolName);
      }
    }
  };

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
            <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="1" />
            <path d="M12 6 L12 18" stroke="currentColor" strokeWidth="1" />
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
      case 'car':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="6" y="10" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'intersection':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="2" />
            <path d="M12 4 L12 20" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'bridge':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="4" y="8" width="16" height="8" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="10" width="12" height="4" fill="currentColor" opacity="0.3" />
            <rect x="4" y="10" width="2" height="4" fill="currentColor" />
            <rect x="18" y="10" width="2" height="4" fill="currentColor" />
          </svg>
        );
      case 'airport':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="2" />
            <path d="M16 8 L20 12 L16 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'plane':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6 L12 18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 10 L12 6 L16 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'tank':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="6" y="10" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <line x1="15" y1="8" x2="18" y2="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'ship':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <path d="M6 12 L20 12 L18 18 L8 18 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="12" y="8" width="2" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="6" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'building':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="6" y="8" width="12" height="12" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8" y="12" width="4" height="4" stroke="currentColor" strokeWidth="1" />
            <rect x="14" y="12" width="4" height="4" stroke="currentColor" strokeWidth="1" />
            <rect x="8" y="18" width="4" height="2" stroke="currentColor" strokeWidth="1" />
          </svg>
        );
      case 'house':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="6" y="12" width="12" height="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 12 L12 6 L20 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="10" y="16" width="4" height="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'road':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="3" />
            <path d="M8 10 L8 14" stroke="currentColor" strokeWidth="1" />
            <path d="M12 10 L12 14" stroke="currentColor" strokeWidth="1" />
            <path d="M16 10 L16 14" stroke="currentColor" strokeWidth="1" />
          </svg>
        );
      case 'geometry':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M18 6 L6 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        );
      case 'ortho':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="4" y="6" width="16" height="12" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="1" />
            <path d="M12 6 L12 18" stroke="currentColor" strokeWidth="1" />
          </svg>
        );
      case 'fusion':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="4" y="6" width="8" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="12" y="12" width="8" height="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 9 L12 12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'color':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <circle cx="8" cy="10" r="3" fill="currentColor" opacity="0.5" />
            <circle cx="16" cy="10" r="3" fill="currentColor" opacity="0.7" />
            <circle cx="12" cy="16" r="3" fill="currentColor" opacity="0.9" />
          </svg>
        );
      case 'mosaic':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <rect x="6" y="6" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="12" y="6" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="12" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'process':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <path d="M12 2L20 6L20 10L12 14L4 10L4 6L12 2Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 14L12 18" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="20" r="2" fill="currentColor" />
          </svg>
        );
      case 'multiTarget':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 ${opacityClass}`}>
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'bandComposite':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-600 ${opacityClass}`}>
            <rect x="4" y="4" width="6" height="6" fill="currentColor" opacity="0.3" />
            <rect x="7" y="7" width="6" height="6" fill="currentColor" opacity="0.5" />
            <rect x="10" y="10" width="6" height="6" fill="currentColor" opacity="0.7" />
            <rect x="4" y="4" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7" y="7" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10" y="10" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'videoFusion':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-600 ${opacityClass}`}>
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 9L16 12L10 15V9Z" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 任务管理中心弹窗 */}
      <TaskManagementCenter
        isOpen={taskManagementOpen}
        onClose={() => setTaskManagementOpen(false)}
      />

      <div className="absolute right-4 top-20 z-[60]">
        {/* 弹窗放在工具箱左侧 */}
        {activeModal && (
          <div className="absolute right-96 top-0">
            <RemoteSensingModal
              isOpen={!!activeModal}
              onClose={() => setActiveModal(null)}
              toolName={activeModal}
              onExecute={onExecute}
            />
          </div>
        )}
        {/* 视频融合弹窗放在工具箱左侧 */}
        {videoFusionOpen && (
          <div className="absolute right-96 top-0">
            <VideoFusionModal
              isOpen={videoFusionOpen}
              onClose={() => setVideoFusionOpen(false)}
              onExecute={(params) => onExecute?.('视频融合', params)}
            />
          </div>
        )}

        {/* 任务管理中心按钮 */}
        <button
          onClick={() => setTaskManagementOpen(true)}
          className="absolute -left-12 top-0 w-10 h-10 bg-blue-600 text-white rounded-l-lg flex items-center justify-center hover:bg-blue-700 shadow-lg"
        >
          <ListTodo size={18} />
        </button>
        
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="font-medium">工具箱</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isExpanded && (
          <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg w-80 max-h-[550px] overflow-y-auto">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => toggleSection('空间分析')}>
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
                        tool.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      disabled={tool.disabled}
                      onClick={() => handleToolClick(tool.name, tool.disabled)}
                    >
                      {renderIcon(tool.icon, tool.disabled)}
                      <span className="whitespace-nowrap truncate">{tool.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => toggleSection('几何分析')}>
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
                        tool.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      disabled={tool.disabled}
                      onClick={() => handleToolClick(tool.name, tool.disabled, tool.noModal)}
                    >
                      {renderIcon(tool.icon, tool.disabled)}
                      <span className="whitespace-nowrap">{tool.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => toggleSection('遥感算法')}>
                <div className="flex items-center gap-2">
                  <Satellite size={16} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-800">遥感算法</span>
                </div>
                {expandedSections.includes('遥感算法') ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
              </div>

              {expandedSections.includes('遥感算法') && (
                <div className="px-3 pb-3">
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1">遥感识别</div>
                    <div className="grid grid-cols-2 gap-1">
                      {remoteSensingRecognitionTools.map((tool, idx) => (
                        <button 
                          key={idx} 
                          className={`text-left text-xs px-2 py-2 rounded flex items-center gap-2 transition-colors ${
                            tool.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          disabled={tool.disabled}
                          onClick={() => handleToolClick(tool.name, tool.disabled)}
                        >
                          {renderIcon(tool.icon, tool.disabled)}
                          <span className="whitespace-nowrap truncate">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 px-2 py-1">遥感处理</div>
                    <div className="grid grid-cols-2 gap-1">
                      {remoteSensingProcessingTools.map((tool, idx) => (
                        <button 
                          key={idx} 
                          className={`text-left text-xs px-2 py-2 rounded flex items-center gap-2 transition-colors ${
                            tool.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          disabled={tool.disabled}
                          onClick={() => handleToolClick(tool.name, tool.disabled)}
                        >
                          {renderIcon(tool.icon, tool.disabled)}
                          <span className="whitespace-nowrap truncate">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => toggleSection('地图输出')}>
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
                        tool.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      disabled={tool.disabled}
                      onClick={() => handleToolClick(tool.name, tool.disabled, tool.noModal)}
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
    </>
  );
};

export default Toolbox;