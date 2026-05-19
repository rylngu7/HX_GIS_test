
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
  FileText, 
  Plus, 
  MoreVertical,
  Layers,
  FileOutput,
  Database as DatabaseIcon
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('原始库');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['水文气象']);
  const [metadataExpanded, setMetadataExpanded] = useState(true);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName) 
        : [...prev, folderName]
    );
  };

  const dataFolders = [
    {
      name: '水文气象',
      children: [
        { name: '地图遥感_ai-flow-dataconv_1.0.0_nj_scene-1510447891826447361_20250720114003', type: '影像', tag: 'image' },
        { name: '地图遥感_ai-flow-dataconv_1.0.0_nj_scene-1510447891826447361_20250720114004', type: '影像', tag: 'image', active: true },
        { name: '地图遥感_ai-flow-dataconv_1.0.0_nj_scene-1510447891826447361_20250720114005', type: '三维', tag: '3d' },
        { name: '地图遥感_ai-flow-dataconv_1.0.0_nj_scene-1510447891826447361_20250720114006', type: '影像', tag: 'image' },
        { name: '地图遥感_ai-flow-dataconv_1.0.0_nj_scene-1510447891826447361_20250720114007', type: '矢量', tag: 'vector' },
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
    <div className="w-72 bg-white border-r border-gray-200 h-full flex flex-col overflow-hidden">
      {/* 元数据管理 */}
      <div className="border-b border-gray-200">
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer bg-blue-50"
          onClick={() => setMetadataExpanded(!metadataExpanded)}
        >
          <div className="flex items-center gap-2">
            <DatabaseIcon size={18} className="text-blue-600" />
            <span className="font-medium text-blue-700">元数据管理</span>
          </div>
          {metadataExpanded ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-blue-600" />}
        </div>
        
        {metadataExpanded && (
          <div className="px-2 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 border-l-4 border-blue-600 rounded-r cursor-pointer">
              <FileText size={16} className="text-blue-700" />
              <span className="text-sm font-medium text-blue-800">数据目录</span>
            </div>
          </div>
        )}
      </div>

      {/* 数据目录内容 */}
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

        <div className="flex gap-2 mb-3">
          {['原始库', '标准库', '融合库'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm rounded ${
                activeTab === tab 
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="搜索资源名称..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

      <div className="flex-1 overflow-y-auto p-2">
        {dataFolders.map(folder => (
          <div key={folder.name} className="mb-1">
            <div
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm"
              onClick={() => toggleFolder(folder.name)}
            >
              {expandedFolders.includes(folder.name) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} className="text-yellow-500" />
              <span>{folder.name}</span>
            </div>

            {expandedFolders.includes(folder.name) && folder.children.length > 0 && (
              <div className="ml-4">
                {folder.children.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
                      item.active ? 'bg-blue-50' : 'hover:bg-gray-100'
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

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Layers size={18} />
            <span>图层管理</span>
          </div>
          <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">
            <FileOutput size={14} />
            <span>导出</span>
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-gray-700 flex items-center gap-2">
          <FileImage size={16} className="text-blue-600" />
          <span className="truncate">B61236_coordinate_3857</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
