
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RemoteSensingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const RemoteSensingModal: React.FC<RemoteSensingModalProps> = ({ 
  isOpen, 
  onClose, 
  title 
}) => {
  const [resultName, setResultName] = useState(title);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const layerOptions = ['波段合成', '基准图.tif', '矫正图.tif', '预处理流程-TT8Y9713428358001'];
  const modelOptions = [title];

  const handleExecute = () => {
    console.log('开始执行:', { resultName, selectedLayer, selectedModel });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 主弹窗容器 */}
      <div className="flex flex-col h-full w-[440px] bg-white shadow-xl ml-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <div className="w-6"></div>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 结果名称 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> 结果名称
            </label>
            <div className="relative">
              <input
                type="text"
                value={resultName}
                onChange={(e) => setResultName(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                {resultName.length}/20
              </span>
            </div>
          </div>

          {/* 图层数据 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> 图层数据
              <span className="ml-1 cursor-help">
                <svg className="w-4 h-4 inline text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsLayerDropdownOpen(!isLayerDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <span className={selectedLayer ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedLayer || '请选择'}
                </span>
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* 下拉选项 */}
              {isLayerDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {/* 全选选项 */}
                  <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">全部</span>
                    <svg className="w-4 h-4 text-gray-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </label>
                  {/* 选项列表 */}
                  {layerOptions.map((option) => (
                    <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded" 
                        checked={selectedLayer === option}
                        onChange={() => setSelectedLayer(option)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 目标算法模型 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> 目标算法模型
            </label>
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <span className={selectedModel ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedModel || '请选择'}
                </span>
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* 下拉选项 */}
              {isModelDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer bg-gray-100"
                    onClick={() => {
                      setSelectedModel(title);
                      setIsModelDropdownOpen(false);
                    }}
                  >
                    <span className="text-sm text-gray-700">{title}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-5 border-t border-gray-200">
          <button
            onClick={handleExecute}
            disabled={!resultName || !selectedLayer || !selectedModel}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors"
          >
            开始执行
          </button>
        </div>
      </div>

      {/* 背景遮罩 */}
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
};

export default RemoteSensingModal;
