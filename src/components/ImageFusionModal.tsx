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
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [fusionAlgorithm, setFusionAlgorithm] = useState('Brovey');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const availableLayers = ['影像1.tif', '影像2.tif', '影像3.tif', '影像4.tif'];

  if (!isOpen) return null;

  const toggleLayer = (layer: string) => {
    setSelectedLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const handleExecute = () => {
    onExecute?.({
      resultName,
      selectedLayers,
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
              <span className="text-red-500">*</span> 图层数据
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 border border-blue-500 rounded bg-white text-left flex items-center justify-between"
              >
                <span>{selectedLayers.length > 0 ? `已选择 ${selectedLayers.length} 项` : ''}</span>
                <ChevronDown size={16} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                  {availableLayers.map(layer => (
                    <div 
                      key={layer}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${selectedLayers.includes(layer) ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleLayer(layer)}
                    >
                      <span className="text-sm">{layer}</span>
                      {selectedLayers.includes(layer) && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedLayers.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedLayers.map(layer => (
                  <div 
                    key={layer}
                    className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded"
                  >
                    <span className="text-sm">{layer}</span>
                    <button
                      type="button"
                      onClick={() => toggleLayer(layer)}
                      className="text-blue-500 hover:text-blue-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            <span>影像融合功能能够将不同时间、不同角度或不同波段的影像数据融合，提高影像的分辨率和信息量。</span>
          </div>
        </div>

        <div className="px-4 py-3 bg-blue-600 rounded-b-lg flex justify-center">
          <button
            onClick={handleExecute}
            disabled={selectedLayers.length < 2}
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
