import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

interface RemoteSensingModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
}

const RemoteSensingModal: React.FC<RemoteSensingModalProps> = ({
  isOpen,
  onClose,
  toolName
}) => {
  const [resultName, setResultName] = useState(toolName);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(toolName);

  if (!isOpen) return null;

  const handleExecute = () => {
    console.log('执行:', { toolName, resultName, selectedLayer, selectedAlgorithm });
    onClose();
  };

  const handleReset = () => {
    setResultName(toolName);
    setSelectedLayer('');
    setSelectedAlgorithm(toolName);
  };

  return (
    <div className="w-80">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200">
        {/* 头部 */}
        <div className="bg-blue-600 px-4 py-2 rounded-t-lg flex items-center justify-between">
          <h3 className="text-white font-medium flex items-center gap-2">
            {toolName}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded p-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4 space-y-4">
          {/* 结果名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> 结果名称
            </label>
            <div className="relative">
              <input
                type="text"
                value={resultName}
                onChange={(e) => setResultName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
              />
              <span className="absolute right-3 top-2 text-xs text-gray-400">
                {resultName.length}/20
              </span>
            </div>
          </div>

          {/* 图层数据 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <span className="text-red-500">*</span> 图层数据
              <Info size={14} className="text-gray-400" />
            </label>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              <option value="影像1.tif">影像1.tif</option>
              <option value="影像2.tif">影像2.tif</option>
              <option value="影像3.tif">影像3.tif</option>
            </select>
          </div>

          {/* 目标算法模型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> 目标算法模型
            </label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={toolName}>{toolName}</option>
            </select>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            重置
          </button>
          <button
            onClick={handleExecute}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            开始执行
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoteSensingModal;
