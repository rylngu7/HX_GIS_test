import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  ChevronUp,
  Folder, 
  FolderOpen,
  Plus, 
  MoreVertical,
  Layers,
  FileOutput,
  FileText,
  Map,
  Image,
  Box,
  MoveRight,
  Trash2,
  Info,
  Grid3X3
} from 'lucide-react';
import { DataFolder, DataFile, isFolder, DataCatalogStore } from './DataCatalogStore';

interface SidebarProps {
  store: DataCatalogStore;
  onExportClick?: (dataType: string) => void;
  onLayerSelect?: (layerName: string) => void;
  onUploadClick?: () => void;
  onFileDetail?: (file: DataFile) => void;
  onFileMove?: (fileId: string, targetFolderId: string) => void;
  onFileDelete?: (fileId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  store,
  onExportClick,
  onLayerSelect,
  onUploadClick,
  onFileDetail,
  onFileMove,
  onFileDelete,
}) => {
  const [activeTab, setActiveTab] = useState('原始库');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['f-hxha', 'f-rsjccl']);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState('基准图.tif');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [showMovePicker, setShowMovePicker] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuFileId(null);
        setShowMovePicker(null);
      }
    };
    if (activeMenuFileId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuFileId]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleLayerClick = (layerName: string) => {
    setSelectedLayer(layerName);
    if (onLayerSelect) {
      onLayerSelect(layerName);
    }
  };

  const handleMoreClick = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    setActiveMenuFileId(prev => prev === fileId ? null : fileId);
    setShowMovePicker(null);
  };

  const handleDetail = (file: DataFile) => {
    setActiveMenuFileId(null);
    if (onFileDetail) {
      onFileDetail(file);
    }
  };

  const handleDelete = (fileId: string) => {
    setActiveMenuFileId(null);
    if (onFileDelete) {
      onFileDelete(fileId);
    }
  };

  const handleMoveToClick = (fileId: string) => {
    setShowMovePicker(prev => prev === fileId ? null : fileId);
  };

  const handleMoveConfirm = (fileId: string, folderId: string) => {
    setShowMovePicker(null);
    setActiveMenuFileId(null);
    if (onFileMove) {
      onFileMove(fileId, folderId);
    }
  };

  const handleDragStart = (e: React.DragEvent, file: DataFile) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'file',
      id: file.id,
      parentPath: file.parentPath
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    if (dragOverFolderId === folderId) {
      setDragOverFolderId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'file' && data.id && onFileMove) {
        const targetFolder = store.findFolderById(folderId);
        if (!targetFolder) return;
        const filePath = store.findFilePath(data.id);
        const targetPath = `${targetFolder.parentPath}/${targetFolder.name}`.replace(/^\/\//, '/');
        if (filePath.startsWith(targetPath + '/')) return;
        onFileMove(data.id, folderId);
      }
    } catch (err) {
      // ignore
    }
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-700';
      case 'vector': return 'bg-blue-100 text-blue-700';
      case '3d': return 'bg-orange-100 text-orange-700';
      case 'raw': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const layerList = [
    'nanjing3857.tif',
    'GF1_PMS2_E116.1_N38.8_202406...',
    'GF1_PMS2_E116.1_N38.8_2024060...',
  ];

  const allFolders = store.getAllFolders();

  const renderTreeNode = (items: (DataFolder | DataFile)[], level: number = 0): React.ReactNode => {
    return items.map(item => {
      if (isFolder(item)) {
        const isExpanded = expandedFolders.includes(item.id);
        const isDragOver = dragOverFolderId === item.id;
        return (
          <div key={item.id}>
            <div
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                isDragOver ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
              }`}
              style={{ paddingLeft: `${level * 14 + 8}px` }}
              onClick={() => toggleFolder(item.id)}
              onDragOver={e => handleDragOver(e, item.id)}
              onDragLeave={e => handleDragLeave(e, item.id)}
              onDrop={e => handleDrop(e, item.id)}
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen size={15} className="text-yellow-500 flex-shrink-0" />
              ) : (
                <Folder size={15} className="text-yellow-500 flex-shrink-0" />
              )}
              <span className="flex-1 truncate text-gray-700">{item.name}</span>
            </div>
            {isExpanded && (
              <div className="ml-0">
                {renderTreeNode(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const isMenuOpen = activeMenuFileId === item.id;
        const isMovePickerOpen = showMovePicker === item.id;
        return (
          <div
            key={item.id}
            className="relative"
            draggable
            onDragStart={e => handleDragStart(e, item)}
          >
            <div
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors hover:bg-gray-100 ${
                item.id === 'd-bdhc1' ? 'bg-blue-100 border-l-4 border-blue-600 ml-[-2px] pl-[6px]' : ''
              }`}
              style={{ paddingLeft: `${level * 14 + 8}px` }}
              onClick={() => {
                setActiveMenuFileId(null);
                setShowMovePicker(null);
              }}
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${getTagColor(item.type)}`}>
                {item.typeLabel}
              </span>
              <span className="flex-1 truncate text-gray-700">{item.name}</span>
              <button
                className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded flex-shrink-0"
                onClick={e => { e.stopPropagation(); }}
                title="添加到图层"
              >
                <Plus size={14} />
              </button>
              <button
                className={`p-0.5 rounded flex-shrink-0 transition-colors ${
                  isMenuOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={e => handleMoreClick(e, item.id)}
                title="更多操作"
              >
                <MoreVertical size={14} />
              </button>
            </div>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-1 top-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[200] min-w-[120px]"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => handleDetail(item)}
                >
                  <Info size={14} />
                  <span>详情</span>
                </button>
                <div className="relative">
                  <button
                    className="flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleMoveToClick(item.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MoveRight size={14} />
                      <span>移动到</span>
                    </div>
                    <ChevronRight size={12} className="text-gray-400" />
                  </button>
                  {isMovePickerOpen && (
                    <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] max-h-60 overflow-y-auto">
                      {allFolders.map(folder => (
                        <div
                          key={folder.id}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                          style={{ paddingLeft: `${folder.level * 12 + 12}px` }}
                          onClick={() => handleMoveConfirm(item.id, folder.id)}
                        >
                          <Folder size={13} className="text-yellow-500 flex-shrink-0" />
                          <span className="truncate">{folder.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={14} />
                  <span>删除</span>
                </button>
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex h-full">
      <div className="w-44 bg-white border-r border-gray-200 flex flex-col">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setMetadataExpanded(!metadataExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium text-sm">元数据管理</span>
          </div>
          {metadataExpanded ? (
            <ChevronUp size={14} className="text-gray-500" />
          ) : (
            <ChevronDown size={14} className="text-gray-500" />
          )}
        </div>

        {metadataExpanded && (
          <div className="flex-1 py-1">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-l-4 border-blue-600 cursor-pointer">
              <FileText size={14} className="text-blue-700" />
              <span className="text-sm font-medium text-blue-800">数据目录</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-600">
              <FileText size={14} />
              <span className="text-sm">元数据采集</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-600">
              <FileText size={14} />
              <span className="text-sm">数据标签管理</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-600">
              <FileText size={14} />
              <span className="text-sm">数据检索</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        <div className="px-3 pt-3 pb-2 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800">
              <Database size={16} />
              <span className="text-sm">数据目录</span>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1"
              onClick={onUploadClick}
            >
              <Upload size={13} />
              <span>上传文件</span>
            </button>
          </div>

          <div className="flex gap-2 mb-2">
            {['原始库', '标准库', '融合库'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 text-xs rounded ${
                  activeTab === tab
                    ? 'text-blue-700 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="搜索资源名称..."
              className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs">
              <span>高级搜索</span>
              <Search size={12} />
            </button>
            <button className="flex items-center justify-center w-7 h-7 border border-gray-300 rounded hover:bg-gray-50">
              <Grid3X3 size={14} />
            </button>
            <button className="flex items-center justify-center w-7 h-7 border border-gray-300 rounded hover:bg-gray-50">
              <Filter size={14} />
            </button>
            <button className="flex items-center justify-center w-7 h-7 border border-gray-300 rounded hover:bg-gray-50">
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5">
          {renderTreeNode(store.folders)}
        </div>

        <div className="border-t border-gray-200 px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800">
              <Layers size={16} />
              <span className="text-sm">图层管理</span>
            </div>
            <div className="relative">
              <button
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              >
                <FileOutput size={13} />
                <span>导出</span>
                <ChevronDown size={11} />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      if (onExportClick) {
                        onExportClick('vector');
                      }
                      setShowExportDropdown(false);
                    }}
                  >
                    <Map size={14} />
                    <span>矢量数据</span>
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      if (onExportClick) {
                        onExportClick('image');
                      }
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

          <div className="space-y-0.5">
            {layerList.map((layer) => (
              <div
                key={layer}
                onClick={() => handleLayerClick(layer)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                  selectedLayer === layer
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`w-3 h-3 border ${selectedLayer === layer ? 'border-blue-500 bg-blue-500' : 'border-gray-400'} rounded-sm`} />
                <Layers size={14} className={selectedLayer === layer ? 'text-blue-700' : 'text-gray-500'} />
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
