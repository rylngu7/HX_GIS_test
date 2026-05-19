
import React, { useState } from 'react';
import Modal from './Modal';
import { Info } from 'lucide-react';

interface RemoteSensingModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  algorithmOptions?: string[];
}

const RemoteSensingModal: React.FC<RemoteSensingModalProps> = ({
  isOpen,
  onClose,
  toolName,
  algorithmOptions = []
}) => {
  const [resultName, setResultName] = useState(toolName);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  // 默认算法选项
  const defaultAlgorithms = {
    '车辆目标识别': ['YOLOv8', 'Faster R-CNN', 'SSD'],
    '路口目标识别': ['目标检测模型', '语义分割模型'],
    '桥梁目标识别': ['目标检测模型', '实例分割模型'],
    '机场目标识别': ['YOLOv8', 'Faster R-CNN'],
    '飞机目标识别': ['YOLOv8', 'SSD'],
    '油罐目标识别': ['目标检测模型'],
    '舰船目标识别': ['YOLOv8', 'Faster R-CNN'],
    '建筑物提取': ['建筑提取', '语义分割'],
    '部落房屋提取': ['建筑提取', '实例分割'],
    '道路提取': ['道路提取', '语义分割', '实例分割'],
    '辐射定标': ['大气校正算法'],
    '几何校正': ['几何校正算法'],
    '大气校正': ['6S模型', 'FLAASH'],
    '正射校正': ['正射校正算法'],
    '影像融合': ['PCA融合', '小波融合'],
    '影像匀色': ['匀色算法'],
    '影像镶嵌': ['镶嵌算法']
  };

  const algorithms = algorithmOptions.length > 0 
    ? algorithmOptions 
    : (defaultAlgorithms as any)[toolName] || ['默认算法'];

  const handleExecute = () => {
    console.log('执行:', { toolName, resultName, selectedLayer, selectedAlgorithm });
    onClose();
  };

  const handleReset = () => {
    setResultName(toolName);
    setSelectedLayer('');
    setSelectedAlgorithm('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={toolName}
      footer={
        <div className="flex justify-end gap-3">
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
      }
    >
      <div className="space-y-4">
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
            <option value="">请选择</option>
            {algorithms.map((algo, index) => (
              <option key={index} value={algo}>{algo}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default RemoteSensingModal;
