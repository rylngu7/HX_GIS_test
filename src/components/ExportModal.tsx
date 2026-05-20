
import React, { useState } from 'react';
import { 
  X, 
  Folder, 
  ChevronDown, 
  ChevronRight,
  Plus, 
  Check, 
  Map, 
  Image, 
  Box, 
  Edit, 
  Square, 
  CheckSquare, 
  Trash2,
  MapPin,
  PenTool,
  Layers,
  RectangleVertical,
  Circle,
  Edit2,
  MousePointerClick,
  Settings2,
  Search,
  Download,
  Maximize2
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: 'vector' | 'image' | '3d';
}

type ExportType = 'condition' | 'full';
type ConditionTab = 'attribute' | 'spatial';
type TargetLibrary = 'original' | 'standard' | 'fusion';

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, dataType }) => {
  const [exportType, setExportType] = useState<ExportType>('condition');
  const [conditionTab, setConditionTab] = useState<ConditionTab>('attribute');
  const [targetLibrary, setTargetLibrary] = useState<TargetLibrary>('original');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [dataName, setDataName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // 绘图设置状态
  const [lineType, setLineType] = useState('实线');
  const [lineWidth, setLineWidth] = useState(2);
  const [lineColor, setLineColor] = useState('#2563eb');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [bufferType, setBufferType] = useState('左侧');
  const [bufferRadius, setBufferRadius] = useState(0);
  const [spatialRelation, setSpatialRelation] = useState('相交');

  const libraryData = {
    original: { name: '原始库', folders: ['水文气象', '网络在线数据', '测试'] },
    standard: { name: '标准库', folders: ['标准数据1', '标准数据2'] },
    fusion: { name: '融合库', folders: ['融合结果', '临时数据'] },
  };

  const toggleFolder = (folder: string) => {
    setSelectedFolder(prev => prev === folder ? null : folder);
  };

  const handleNewFolder = () => {
    if (newFolderName.trim()) {
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const getDataTypeName = () => {
    switch (dataType) {
      case 'vector': return '矢量数据';
      case 'image': return '影像数据';
      case '3d': return '三维数据';
      default: return '数据';
    }
  };

  const getDataTypeIcon = () => {
    switch (dataType) {
      case 'vector': return <Map size={16} />;
      case 'image': return <Image size={16} />;
      case '3d': return <Box size={16} />;
      default: return <Map size={16} />;
    }
  };

  // 属性条件渲染
  const renderAttributeCondition = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">图层</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">t_1778549246055</option>
        </select>
      </div>

      {/* 字段列表 */}
      <div className="border border-gray-300 rounded p-2 max-h-[120px] overflow-y-auto">
        <div className="text-sm text-gray-700 py-1 px-2 hover:bg-blue-50 cursor-pointer">fid</div>
        <div className="text-sm text-gray-700 py-1 px-2 hover:bg-blue-50 cursor-pointer">gm_lid</div>
        <div className="text-sm text-gray-700 py-1 px-2 hover:bg-blue-50 cursor-pointer">name</div>
        <div className="text-sm text-gray-700 py-1 px-2 hover:bg-blue-50 cursor-pointer">pyname</div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-1">
        {['=', '&lt;&gt;', '&gt;', 'Like', 'Is', '&gt;=', '&lt;', '&lt;=', 'And', 'Not', '-', '%', '()', 'Or'].map((op, idx) => (
          <button key={idx} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-100">
            {op}
          </button>
        ))}
        <div className="flex-1" />
        <button className="flex-1 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          获取唯一值(V)
        </button>
      </div>

      {/* SQL编辑区 */}
      <div className="space-y-1">
        <div className="text-sm text-gray-700">SELECT "FROM" t_1778549246055</div>
        <div className="text-sm text-gray-700">WHERE</div>
        <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-y min-h-[60px]" />
      </div>

      <div className="flex justify-end gap-2">
        <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          查询
        </button>
        <button className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
          重置
        </button>
      </div>
    </div>
  );

  // 空间条件渲染
  const renderSpatialCondition = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">图层</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">t_1778549246055</option>
        </select>
      </div>

      {/* 绘图工具 */}
      <div className="flex gap-2 items-center">
        <div className="flex gap-1 border border-gray-300 rounded p-1">
          <button className="p-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-50">
            <MapPin size={18} />
          </button>
          <button className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
            <PenTool size={18} />
          </button>
          <button className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
            <Edit2 size={18} />
          </button>
          <button className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
            <Square size={18} />
          </button>
          <button className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
            <Circle size={18} />
          </button>
        </div>
        <div className="flex gap-1 border border-gray-300 rounded p-1">
          <button className="p-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-50">
            <CheckSquare size={18} />
          </button>
          <button className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
            <MousePointerClick size={18} />
          </button>
        </div>
        <button className="p-2 rounded border border-red-200 text-red-500 hover:bg-red-50">
          <Trash2 size={18} />
        </button>
      </div>

      {/* 绘图设置 */}
      <div className="space-y-3">
        <div className="bg-gray-100 px-3 py-2 rounded-t flex items-center justify-between">
          <span className="font-medium text-gray-700 text-sm">绘图设置</span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm text-gray-700">线型</label>
            <select value={lineType} onChange={(e) => setLineType(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
              <option>实线</option>
              <option>虚线</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700">线宽</label>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-gray-300 rounded text-sm">-</button>
              <input type="number" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center" />
              <button className="px-2 py-1 border border-gray-300 rounded text-sm">+</button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">线颜色</label>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-8 rounded border border-gray-300" style={{ backgroundColor: lineColor }} />
              <select value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                <option value="#2563eb">蓝色</option>
                <option value="#ef4444">红色</option>
                <option value="#10b981">绿色</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">填充色</label>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-8 rounded border border-gray-300" style={{ backgroundColor: fillColor }} />
              <select value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                <option value="#3b82f6">蓝色</option>
                <option value="#fca5a5">红色</option>
                <option value="#6ee7b7">绿色</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">缓冲类型</label>
            <select value={bufferType} onChange={(e) => setBufferType(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
              <option>左侧</option>
              <option>右侧</option>
              <option>两侧</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700">缓冲半径</label>
            <div className="flex items-center gap-1">
              <input type="number" value={bufferRadius} onChange={(e) => setBufferRadius(Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
              <span className="text-sm text-gray-500">米</span>
              <Settings2 size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700">空间关系类型</label>
          <select value={spatialRelation} onChange={(e) => setSpatialRelation(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
            <option>相交</option>
            <option>包含</option>
            <option>被包含</option>
            <option>相等</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          查询
        </button>
        <button className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
          重置
        </button>
      </div>
    </div>
  );

  // 查询结果渲染
  const renderQueryResults = () => (
    <div className="space-y-3">
      <div className="bg-gray-100 px-3 py-2 rounded-t flex items-center justify-between">
        <span className="font-medium text-gray-700 text-sm">查询结果</span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>

      <div className="flex gap-2 items-center">
        <select className="px-3 py-1.5 border border-gray-300 rounded text-sm flex-1">
          <option>未选择</option>
        </select>
        <input type="text" placeholder="请输入关键词" className="px-3 py-1.5 border border-gray-300 rounded text-sm flex-1" />
      </div>

      <div className="flex border-b border-gray-200">
        <button className="px-4 py-2 text-sm text-blue-600 border-b-2 border-blue-600 font-medium">
          详情
        </button>
        <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
          自定义统计
        </button>
        <div className="flex-1" />
        <div className="flex gap-1">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">
            <Download size={14} />
            导出
            <ChevronDown size={12} />
          </button>
          <button className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">
            投影转换
          </button>
        </div>
      </div>

      <div className="border border-gray-300 rounded p-2 min-h-[200px] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-sm">暂无数据</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">&lt;</button>
          <span className="text-blue-600 font-medium">1</span>
          <button className="p-1 hover:bg-gray-100 rounded">&gt;</button>
        </div>
        <div className="flex items-center gap-2">
          <span>前往</span>
          <input type="number" defaultValue={1} className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center" />
          <span>页</span>
          <span>共 0 条</span>
        </div>
      </div>
    </div>
  );

  // 全量导出渲染
  const renderFullExport = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">数据选择 <span className="text-red-500">*</span></label>
        <div className="border border-gray-300 rounded p-2 min-h-[160px]">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 rounded">
            <ChevronRight size={14} />
            <Folder size={16} className="text-yellow-500" />
            <span className="text-sm font-medium">全部</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">数据名称 <span className="text-red-500">*</span></label>
        <input 
          type="text" 
          placeholder="请输入数据名称"
          value={dataName}
          onChange={(e) => setDataName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">目标库 <span className="text-red-500">*</span></label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">请选择目标库</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">保存路径选择 <span className="text-red-500">*</span></label>
        <div className="border border-gray-300 rounded p-8 flex flex-col items-center justify-center min-h-[160px]">
          <Box size={64} className="text-gray-300 mb-3" />
          <span className="text-sm text-gray-500">暂无数据</span>
        </div>
      </div>
    </div>
  );

  const renderDirectoryTree = () => {
    const lib = libraryData[targetLibrary];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">选择文件夹</span>
          <button 
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            onClick={() => setShowNewFolderModal(true)}
          >
            <Plus size={14} />
            新建文件夹
          </button>
        </div>
        <div className="border border-gray-300 rounded p-3 min-h-[160px] max-h-[200px] overflow-y-auto">
          {lib.folders.map((folder, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                selectedFolder === folder 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFolder(folder)}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                selectedFolder === folder 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-400'
              }`}>
                {selectedFolder === folder && <Check size={10} className="text-white" />}
              </div>
              <Folder size={16} className={selectedFolder === folder ? 'text-blue-700' : 'text-yellow-500'} />
              <span>{folder}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="w-[460px] h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {getDataTypeIcon()}
            <h2 className="text-lg font-semibold text-gray-800">导出</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* 导出类型选择 */}
        <div className="flex border-b border-gray-200 px-4 pt-2">
          <button
            onClick={() => setExportType('condition')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-t ${
              exportType === 'condition' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            条件导出
          </button>
          <button
            onClick={() => setExportType('full')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-t ${
              exportType === 'full' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            全量导出
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {exportType === 'condition' ? (
            <div className="space-y-4">
              {/* 查询条件 */}
              <div className="bg-gray-100 px-4 py-2 rounded-t flex items-center justify-between">
                <span className="font-medium text-gray-700">查询条件</span>
                <ChevronDown size={16} className="text-gray-500" />
              </div>

              {/* 属性/空间标签页 */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setConditionTab('attribute')}
                  className={`px-4 py-2 text-sm font-medium ${
                    conditionTab === 'attribute' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  属性条件
                </button>
                <button
                  onClick={() => setConditionTab('spatial')}
                  className={`px-4 py-2 text-sm font-medium ${
                    conditionTab === 'spatial' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  空间条件
                </button>
              </div>

              {conditionTab === 'attribute' ? renderAttributeCondition() : renderSpatialCondition()}

              {/* 查询结果 */}
              <div className="mt-4">{renderQueryResults()}</div>
            </div>
          ) : (
            renderFullExport()
          )}
        </div>

        {/* 底部按钮区 */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          
          {/* 导出按钮带下拉菜单 */}
          <div className="relative">
            <div className="flex">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-l hover:bg-blue-700">
                导出到本地
              </button>
              <button 
                className="px-2 py-2 bg-blue-600 text-white border-l border-blue-500 rounded-r hover:bg-blue-700 flex items-center"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              >
                <ChevronDown size={16} />
              </button>
            </div>
            
            {showExportDropdown && (
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <span>导出到本地</span>
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <span>导出到数据目录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewFolderModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-80 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">新建文件夹</h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <input 
              type="text" 
              placeholder="请输入文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={handleNewFolder}
                className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportModal;
