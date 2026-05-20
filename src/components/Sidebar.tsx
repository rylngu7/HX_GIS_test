
import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp,
  Folder, 
  FileImage, 
  Plus, 
  MoreVertical,
  Layers,
  FileOutput,
  FileText,
  Map,
  Image,
  Box
} from 'lucide-react';

interface SidebarProps {
  onExportClick: (dataType: 'vector' | 'image' | '3d') => void;
  onLayerSelect?: (layerName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onExportClick, onLayerSelect }) => {
  const [activeTab, setActiveTab] = useState('原始库');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['水文气象']);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState('基准图.tif');
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName) 
        : [...prev, folderName]
    );
  };

  const handleLayerClick = (layerName: string) => {
    setSelectedLayer(layerName);
    if (onLayerSelect) {
      onLayerSelect(layerName);
    }
  };

  const dataFolders = [
    {
      name: '水文气象',
      children: [
        { name: '地图遥感_ai-flow-datac...', type: '影像', tag: 'image' },
        { name: '地图遥感_ai-flow-datac...', type: '影像', tag: 'image', active: true },
        { name: '地图遥感_ai-flow-datacon...', type: '三维', tag: '3d' },
        { name: '地图遥感_ai-flow-datac...', type: '影像', tag: 'image' },
        { name: '地图遥感_ai-flow-datac...', type: '矢量', tag: 'vector' },
      ]
    },
    {
      name: '网络在线数据',
      children: []
    },
    {
      name: '测试',
      children: []
    },
    {
      name: '测试1111',
      children: []
    },
    {
      name: '测试123',
      children: []
    },
    {
      name: 'test_hx',
      children: []
    },
    {
      name: '测试香烟1',
      children: []
    },
  ];

  const layerList = [
    '波段合成',
    '基准图.tif',
    '矫正图.tif',
    '预处理流程-TT8Y9713428358001',
    '13428358001'
  ];

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'image': return 'bg-green-100 text-green-700';
      case '3d': return 'bg-orange-100 text-orange-700';
      case 'vector': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-full">
      {/* 第一部分：元数据管理 */}
      <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setMetadataExpanded(!metadataExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium text-sm">元数据管理</span>
          </div>
          {metadataExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </div>
        
        {metadataExpanded && (
          <div className="flex-1 py-1">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-l-4 border-blue-600 cursor-pointer">
              <FileText size={14} className="text-blue-700" />
              <span className="text-sm font-medium text-blue-800">数据目录</span>
            </div>
          </div>
        )}
      </div>

      {/* 第二部分：数据目录内容 */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {/* 数据目录头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <Database size={18} />
              <span>数据目录</span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1">
              <Upload size={14} />
              <span>上传文件</span>
            </button>
          </div>

          {/* 标签页 */}
          <div className="flex gap-2 mb-3">
            {['原始库', '标准库', '融合库'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm rounded ${
                  activeTab === tab 
                    ? 'text-blue-700 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 搜索框 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="搜索资源名称..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 高级搜索按钮 */}
          <div className="flex gap-2">
            <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">
              <span>高级搜索</span>
              <Search size={14} />
            </button>
            <button className="flex items-center justify-center w-9 h-9 border border-gray-300 rounded hover:bg-gray-50">
              <Filter size={16} />
            </button>
            <button className="flex items-center justify-center w-9 h-9 border border-gray-300 rounded hover:bg-gray-50">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* 数据目录内容 */}
        <div className="flex-1 overflow-y-auto p-2">
          {dataFolders.map(folder => (
            <div key={folder.name} className="mb-1">
              <div
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm"
                onClick={() => toggleFolder(folder.name)}
              >
                <ChevronDown size={14} />
                <Folder size={16} className="text-yellow-500" />
                <span>{folder.name}</span>
              </div>

              {expandedFolders.includes(folder.name) && folder.children.length > 0 && (
                <div className="ml-4">
                  {folder.children.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
                        item.active ? 'bg-blue-100 border-l-4 border-blue-600 ml-[-2px] pl-[6px]' : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTagColor(item.tag)}`}>
                        {item.type}
                      </span>
                      <span className="flex-1 truncate text-gray-700">{item.name}</span>
                      <Plus size={14} className="text-gray-400 hover:text-gray-600" />
                      <MoreVertical size={14} className="text-gray-400 hover:text-gray-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 图层管理 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <Layers size={18} />
              <span>图层管理</span>
            </div>
            <div className="relative">
              <button 
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              >
                <FileOutput size={14} />
                <span>导出</span>
                <ChevronDown size={12} />
              </button>
              
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  <button 
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onExportClick('vector');
                      setShowExportDropdown(false);
                    }}
                  >
                    <Map size={14} />
                    <span>矢量数据</span>
                  </button>
                  <button 
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onExportClick('image');
                      setShowExportDropdown(false);
                    }}
                  >
                    <Image size={14} />
                    <span>影像数据</span>
                  </button>
                  <button 
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <Box size={14} />
                    <span>三维数据</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 图层列表 */}
          <div className="space-y-1">
            {layerList.map((layer) => (
              <div
                key={layer}
                onClick={() => handleLayerClick(layer)}
                className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm transition-colors ${
                  selectedLayer === layer 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`w-3.5 h-3.5 border ${selectedLayer === layer ? 'border-blue-500 bg-blue-500' : 'border-gray-400'} rounded`} />
                <Layers size={16} className={selectedLayer === layer ? 'text-blue-700' : 'text-gray-500'} />
                <span className="flex-1 truncate">{layer}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
