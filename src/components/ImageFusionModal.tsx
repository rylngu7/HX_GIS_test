import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

interface ImageFusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute?: (params: any) => void;
}

const generateRandomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const ImageFusionModal: React.FC<ImageFusionModalProps> = ({ isOpen, onClose, onExecute }) => {
  const [resultName, setResultName] = useState(`影像融合-${generateRandomId()}`);
  const [panLayer, setPanLayer] = useState<string>('');
  const [msLayer, setMsLayer] = useState<string>('');
  const [fusionAlgorithm, setFusionAlgorithm] = useState('Brovey');
  const [isPanDropdownOpen, setIsPanDropdownOpen] = useState(false);
  const [isMsDropdownOpen, setIsMsDropdownOpen] = useState(false);
  
  const availablePanLayers = ['PAN_影像1.tif', 'PAN_影像2.tif', 'PAN_影像3.tif'];
  const availableMsLayers = ['MS_影像1.tif', 'MS_影像2.tif', 'MS_影像3.tif'];

  if (!isOpen) return null;

  const handleExecute = () => {
    // 检查两个图层是否属于同一区域（这里简化模拟：假设数字相同就是同一区域）
    const panNumber = panLayer.match(/\d+/)?.[0] || '';
    const msNumber = msLayer.match(/\d+/)?.[0] || '';
    const sameRegion = panNumber === msNumber;

    if (!sameRegion) {
      alert('执行失败：全色影像和多光谱影像区域不一致！');
      return;
    }

    onExecute?.({
      resultName,
      panLayer,
      msLayer,
      fusionAlgorithm
    });
    onClose();
  };

  return (
    <div className="w-80">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="bg-white px-4 py-3 rounded-t-lg flex items-center justify-between border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors"
          >
            <ChevronDown size={16} />
          </button>
          <h3 className="text-gray-800 font-medium">
            影像融合
          </h3>
          <div className="w-8"></div>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> 全色影像 (PAN)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPanDropdownOpen(!isPanDropdownOpen)}
                className="w-full px-3 py-2 border border-blue-500 rounded bg-white text-left flex items-center justify-between"
              >
                <span>{panLayer || ''}</span>
                <ChevronDown size={16} />
              </button>
              
              {isPanDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                  {availablePanLayers.map(layer => (
                    <div 
                      key={layer}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${panLayer === layer ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setPanLayer(layer);
                        setIsPanDropdownOpen(false);
                      }}
                    >
                      <span className="text-sm">{layer}</span>
                      {panLayer === layer && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> 多光谱影像 (MS)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMsDropdownOpen(!isMsDropdownOpen)}
                className="w-full px-3 py-2 border border-blue-500 rounded bg-white text-left flex items-center justify-between"
              >
                <span>{msLayer || ''}</span>
                <ChevronDown size={16} />
              </button>
              
              {isMsDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                  {availableMsLayers.map(layer => (
                    <div 
                      key={layer}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${msLayer === layer ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setMsLayer(layer);
                        setIsMsDropdownOpen(false);
                      }}
                    >
                      <span className="text-sm">{layer}</span>
                      {msLayer === layer && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> 融合算法
            </label>
            <select
              value={fusionAlgorithm}
              onChange={(e) => setFusionAlgorithm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Brovey">Brovey</option>
              <option value="PCA">PCA</option>
              <option value="SFIM">SFIM</option>
              <option value="HSV">HSV</option>
            </select>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded flex items-start gap-2">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>影像融合功能能够将不同时间、不同角度或不同波段的影像数据融合，提高影像的分辨率和信息量。请选择同一区域的全色和多光谱影像。</span>
          </div>
        </div>

        <div className="px-4 py-3 bg-blue-600 rounded-b-lg flex justify-center">
          <button
            onClick={handleExecute}
            disabled={!panLayer || !msLayer}
            className="px-8 py-2 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始执行
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageFusionModal;
