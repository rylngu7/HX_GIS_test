import React, { useState } from 'react';
import { X, Folder, ChevronRight, ChevronDown, Plus, Check, Map, Image, Box, Edit, Square, CheckSquare, Trash2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportMode = 'local' | 'dataDirectory';
type ExportType = 'condition' | 'full';
type TargetLibrary = 'original' | 'standard' | 'fusion';
type DataType = 'vector' | 'image' | '3d';
type OutputArea = 'draw' | 'full';
type OutputType = 'original' | 'thumbnail';

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [exportMode, setExportMode] = useState<ExportMode>('local');
  const [exportType, setExportType] = useState<ExportType>('condition');
  const [targetLibrary, setTargetLibrary] = useState<TargetLibrary>('original');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [dataName, setDataName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dataType, setDataType] = useState<DataType>('vector');
  const [outputArea, setOutputArea] = useState<OutputArea>('draw');
  const [outputType, setOutputType] = useState<OutputType>('original');
  const [outputFormat, setOutputFormat] = useState('tif');
  const [asyncExecute, setAsyncExecute] = useState(false);

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

  // 矢量数据查询条件
  const renderVectorQueryConditions = () => (
    <div className="space-y-4">
      <div className="bg-gray-100 px-4 py-2 rounded-t flex items-center justify-between">
        <span className="font-medium text-gray-700">查询条件</span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            图层 <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">请选择图层</option>
          </select>
        </div>

        <div className="flex border-b border-gray-200">
          <button className="px-4 py-2 text-sm text-blue-600 border-b-2 border-blue-600 font-medium">
            属性条件
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            空间条件
          </button>
        </div>

        <div className="space-y-2 pt-2">
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-y min-h-[100px]" />
          
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 矢量数据全量导出
  const renderVectorFullExport = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          数据选择 <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-300 rounded p-3 min-h-[160px]">
          <div>
            <div 
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm"
            >
              <ChevronDown size={14} />
              <Folder size={16} className="text-yellow-500" />
              <span>全部</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 影像数据条件导出
  const renderImageQueryConditions = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          图层
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">b61234_3857</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          输出区域
        </label>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 border border-gray-300 rounded p-1">
            <button className="p-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-50">
              <Edit size={18} />
            </button>
            <button className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
              <Square size={18} />
            </button>
          </div>
          <div className="flex gap-1 border border-gray-300 rounded p-1">
            <button className="p-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-50">
              <CheckSquare size={18} />
            </button>
            <button className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
              <Edit size={18} />
            </button>
          </div>
          <button className="p-2 rounded border border-red-200 text-red-500 hover:bg-red-50">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <div 
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer"
              style={{ borderColor: outputArea === 'draw' ? '#2563eb' : '#d1d5db', backgroundColor: outputArea === 'draw' ? '#2563eb' : 'transparent' }}
              onClick={() => setOutputArea('draw')}
            >
              {outputArea === 'draw' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            绘制范围
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <div 
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer"
              style={{ borderColor: outputArea === 'full' ? '#2563eb' : '#d1d5db', backgroundColor: outputArea === 'full' ? '#2563eb' : 'transparent' }}
              onClick={() => setOutputArea('full')}
            >
              {outputArea === 'full' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            地图全图
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          输出类型
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <div 
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer"
              style={{ borderColor: outputType === 'original' ? '#2563eb' : '#d1d5db', backgroundColor: outputType === 'original' ? '#2563eb' : 'transparent' }}
              onClick={() => setOutputType('original')}
            >
              {outputType === 'original' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            原始影像
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <div 
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer"
              style={{ borderColor: outputType === 'thumbnail' ? '#2563eb' : '#d1d5db', backgroundColor: outputType === 'thumbnail' ? '#2563eb' : 'transparent' }}
              onClick={() => setOutputType('thumbnail')}
            >
              {outputType === 'thumbnail' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            缩略图
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          输出格式
        </label>
        <select 
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="tif">tif</option>
          <option value="png">png</option>
          <option value="jpg">jpg</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">异步执行</label>
        <button 
          className={`w-12 h-6 rounded-full transition-colors ${asyncExecute ? 'bg-blue-600' : 'bg-gray-300'}`}
          onClick={() => setAsyncExecute(!asyncExecute)}
        >
          <div 
            className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${asyncExecute ? 'translate-x-6' : 'translate-x-0.5'}`}
            style={{ marginTop: '2px' }}
          />
        </button>
        <span className="text-sm text-gray-500">如异步执行请到任务结果中查看</span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          下载
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          重置
        </button>
      </div>
    </div>
  );

  // 影像数据全量导出（简化版，保持类似矢量全量导出）
  const renderImageFullExport = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          数据选择 <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-300 rounded p-3 min-h-[160px]">
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Box size={48} className="mx-auto mb-2 opacity-50" />
              <span className="text-sm">暂无数据</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          数据名称 <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          placeholder="请输入数据名称"
          value={dataName}
          onChange={(e) => setDataName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          目标库 <span className="text-red-500">*</span>
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">请选择目标库</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          保存路径选择 <span className="text-red-500">*</span>
        </label>
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

  // 渲染矢量数据导出界面
  const renderVectorExport = () => {
    if (exportMode === 'local') {
      return (
        <div className="space-y-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setExportType('condition')}
              className={`flex-1 py-3 text-sm font-medium ${
                exportType === 'condition' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              条件导出
            </button>
            <button
              onClick={() => setExportType('full')}
              className={`flex-1 py-3 text-sm font-medium ${
                exportType === 'full' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              全量导出
            </button>
          </div>

          <div className="space-y-4">
            {exportType === 'condition' ? renderVectorQueryConditions() : renderVectorFullExport()}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文件名称 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="请输入文件名称"
                value={dataName}
                onChange={(e) => setDataName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setExportType('condition')}
            className={`flex-1 py-3 text-sm font-medium ${
              exportType === 'condition' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            条件导出
          </button>
          <button
            onClick={() => setExportType('full')}
            className={`flex-1 py-3 text-sm font-medium ${
              exportType === 'full' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            全量导出
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标库 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(Object.entries(libraryData) as [TargetLibrary, typeof libraryData.original][]).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setTargetLibrary(key)}
                  className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                    targetLibrary === key 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {exportType === 'condition' ? renderVectorQueryConditions() : renderVectorFullExport()}
          
          {renderDirectoryTree()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              数据名称 <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="请输入数据名称"
              value={dataName}
              onChange={(e) => setDataName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  // 渲染影像数据导出界面
  const renderImageExport = () => {
    if (exportMode === 'local') {
      return (
        <div className="space-y-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setExportType('condition')}
              className={`flex-1 py-3 text-sm font-medium ${
                exportType === 'condition' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              条件导出
            </button>
            <button
              onClick={() => setExportType('full')}
              className={`flex-1 py-3 text-sm font-medium ${
                exportType === 'full' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              全量导出
            </button>
          </div>

          <div className="space-y-4">
            {exportType === 'condition' ? renderImageQueryConditions() : renderVectorFullExport()}
            
            {exportType === 'full' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文件名称 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="请输入文件名称"
                  value={dataName}
                  onChange={(e) => setDataName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setExportType('condition')}
            className={`flex-1 py-3 text-sm font-medium ${
              exportType === 'condition' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            条件导出
          </button>
          <button
            onClick={() => setExportType('full')}
            className={`flex-1 py-3 text-sm font-medium ${
              exportType === 'full' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            全量导出
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标库 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(Object.entries(libraryData) as [TargetLibrary, typeof libraryData.original][]).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setTargetLibrary(key)}
                  className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                    targetLibrary === key 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {exportType === 'condition' ? renderImageQueryConditions() : renderImageFullExport()}
          
          {exportType === 'condition' && renderDirectoryTree()}

          {exportType === 'full' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数据名称 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="请输入数据名称"
                value={dataName}
                onChange={(e) => setDataName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染三维数据导出界面（占位符）
  const render3dExport = () => (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setExportType('condition')}
          className={`flex-1 py-3 text-sm font-medium ${
            exportType === 'condition' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          条件导出
        </button>
        <button
          onClick={() => setExportType('full')}
          className={`flex-1 py-3 text-sm font-medium ${
            exportType === 'full' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          全量导出
        </button>
      </div>
      <div className="text-center py-8 text-gray-400">
        三维数据导出功能开发中...
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="w-[460px] h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">导出</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* 数据类型选择 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setDataType('vector')}
            className={`flex-1 py-3 text-sm font-medium ${
              dataType === 'vector' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Map size={16} />
              矢量数据
            </div>
          </button>
          <button
            onClick={() => setDataType('image')}
            className={`flex-1 py-3 text-sm font-medium ${
              dataType === 'image' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Image size={16} />
              影像数据
            </div>
          </button>
          <button
            onClick={() => setDataType('3d')}
            className={`flex-1 py-3 text-sm font-medium ${
              dataType === '3d' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Box size={16} />
              三维数据
            </div>
          </button>
        </div>

        {/* 导出方式选择 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setExportMode('local')}
            className={`flex-1 py-3 text-sm font-medium ${
              exportMode === 'local' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            导出到本地
          </button>
          <button
            onClick={() => setExportMode('dataDirectory')}
            className={`flex-1 py-3 text-sm font-medium ${
              exportMode === 'dataDirectory' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            导出到数据目录
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {dataType === 'vector' && renderVectorExport()}
          {dataType === 'image' && renderImageExport()}
          {dataType === '3d' && render3dExport()}
        </div>

        {/* 底部按钮 - 影像数据条件导出时不显示（已有按钮） */}
        {!(dataType === 'image' && exportType === 'condition') && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              取消
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              确认
            </button>
          </div>
        )}
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
