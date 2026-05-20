import React, { useState, useMemo } from 'react';
import { X, Info, Plus, Trash2, ChevronDown } from 'lucide-react';

interface RemoteSensingModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  onExecute?: (toolName: string) => void;
}

const generateRandomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const RemoteSensingModal: React.FC<RemoteSensingModalProps> = ({
  isOpen,
  onClose,
  toolName,
  onExecute
}) => {
  const [resultName, setResultName] = useState(() => `${toolName}-${generateRandomId()}`);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(toolName);
  const [autoCorrect, setAutoCorrect] = useState(false);
  const [correctionValue, setCorrectionValue] = useState('0.15');
  const [fusionAlgorithm, setFusionAlgorithm] = useState('Brovey');
  const [baseImage, setBaseImage] = useState('');
  const [correctionImage, setCorrectionImage] = useState('');
  const [controlPoints, setControlPoints] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [colorSpace, setColorSpace] = useState('RGB');
  const [baseData, setBaseData] = useState('');
  const [baseR, setBaseR] = useState('');
  const [baseG, setBaseG] = useState('');
  const [baseB, setBaseB] = useState('');
  const [colorData, setColorData] = useState('');
  const [colorR, setColorR] = useState('');
  const [colorG, setColorG] = useState('');
  const [colorB, setColorB] = useState('');
  const [resolution, setResolution] = useState('2');
  const [overlapMethod, setOverlapMethod] = useState('第一个值');
  const [resampleMethod, setResampleMethod] = useState('nearest');
  const [preprocessAutoCorrect, setPreprocessAutoCorrect] = useState(false);
  const [preprocessCorrectionValue, setPreprocessCorrectionValue] = useState('0.15');
  const [mosaicLayers, setMosaicLayers] = useState<string[]>([]);
  const [isMosaicDropdownOpen, setIsMosaicDropdownOpen] = useState(false);
  const availableMosaicLayers = ['影像1.tif', '影像2.tif', '影像3.tif'];
  const [isBandCompositeDropdownOpen, setIsBandCompositeDropdownOpen] = useState(false);
  const [selectedCompositeLayers, setSelectedCompositeLayers] = useState<string[]>([]);
  const [selectedBandsByLayer, setSelectedBandsByLayer] = useState<{ [key: string]: string[] }>({});
  const [expandedLayers, setExpandedLayers] = useState<string[]>([]);
  const availableLayers = ['波段合成', '基准图.tif', '矫正图.tif', '预处理流程-TT8Y9713428358001'];
  const layerBands: { [key: string]: string[] } = {
    '波段合成': ['B1 [uint16]', 'B2 [uint16]', 'B3 [uint16]', 'B4 [uint16]'],
    '基准图.tif': ['B1 [uint16]', 'B2 [uint16]', 'B3 [uint16]', 'B4 [uint16]'],
    '矫正图.tif': ['B1 [uint16]', 'B2 [uint16]', 'B3 [uint16]'],
    '预处理流程-TT8Y9713428358001': ['B1 [uint16]', 'B2 [uint16]', 'B3 [uint16]', 'B4 [uint16]']
  };

  useMemo(() => {
    setResultName(`${toolName}-${generateRandomId()}`);
  }, [toolName]);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (onExecute) {
      onExecute(toolName);
    }
    onClose();
  };

  const toggleMosaicLayer = (layer: string) => {
    setMosaicLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const renderRecognitionInterface = () => (
    <div className="p-4 space-y-4">
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
    </div>
  );

  const renderMultiTargetRecognitionInterface = () => (
    <div className="p-4 space-y-4">
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
          <option value="车辆目标识别">车辆目标识别</option>
          <option value="路口目标识别">路口目标识别</option>
          <option value="桥梁目标识别">桥梁目标识别</option>
          <option value="机场目标识别">机场目标识别</option>
          <option value="飞机目标识别">飞机目标识别</option>
          <option value="油罐目标识别">油罐目标识别</option>
          <option value="舰船目标识别">舰船目标识别</option>
          <option value="建筑物提取">建筑物提取</option>
          <option value="部落房屋提取">部落房屋提取</option>
          <option value="道路提取">道路提取</option>
        </select>
      </div>
    </div>
  );

  const toggleLayerExpand = (layer: string) => {
    setExpandedLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const toggleCompositeLayer = (layer: string) => {
    setSelectedCompositeLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const toggleBand = (layer: string, band: string) => {
    setSelectedBandsByLayer(prev => {
      const currentBands = prev[layer] || [];
      const newBands = currentBands.includes(band) 
        ? currentBands.filter(b => b !== band) 
        : [...currentBands, band];
      return { ...prev, [layer]: newBands };
    });
  };

  const removeLayer = (layer: string) => {
    setSelectedCompositeLayers(prev => prev.filter(l => l !== layer));
    setSelectedBandsByLayer(prev => {
      const newObj = { ...prev };
      delete newObj[layer];
      return newObj;
    });
  };

  const renderBandCompositeInterface = () => (
    <div className="p-4 space-y-4">
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
            onClick={() => setIsBandCompositeDropdownOpen(!isBandCompositeDropdownOpen)}
            className="w-full px-3 py-2 border border-blue-500 rounded bg-white text-left flex items-center justify-between"
          >
            <span>{selectedCompositeLayers.length > 0 ? `已选择 ${selectedCompositeLayers.length} 项` : ''}</span>
            <ChevronDown size={16} />
          </button>
          
          {isBandCompositeDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={false}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">全部</span>
                <ChevronDown size={14} className="ml-auto text-gray-500" />
              </div>
              {availableLayers.map(layer => (
                <div key={layer}>
                  <div 
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${selectedCompositeLayers.includes(layer) ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      toggleCompositeLayer(layer);
                      if (!expandedLayers.includes(layer)) {
                        toggleLayerExpand(layer);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompositeLayers.includes(layer)}
                      className="w-4 h-4"
                      readOnly
                    />
                    <span className="text-sm flex-1">{layer}</span>
                    {(layerBands[layer]?.length || 0) > 0 && (
                      <ChevronDown
                        size={14}
                        className={`text-gray-500 transition-transform ${expandedLayers.includes(layer) ? 'rotate-180' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerExpand(layer);
                        }}
                      />
                    )}
                  </div>
                  {(layerBands[layer]?.length || 0) > 0 && expandedLayers.includes(layer) && (
                    <div className="pl-10 pr-3 pb-2 space-y-1">
                      {layerBands[layer].map(band => (
                        <div 
                          key={band}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBand(layer, band);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(selectedBandsByLayer[layer] || []).includes(band)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{band}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 显示选中的图层和波段 */}
        {selectedCompositeLayers.length > 0 && (
          <div className="mt-2 space-y-1">
            {selectedCompositeLayers.map(layer => (
              <div key={layer} className="space-y-1">
                <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-sm">{layer}</span>
                  <button
                    type="button"
                    onClick={() => removeLayer(layer)}
                    className="text-blue-500 hover:text-blue-700 ml-2"
                  >
                    ✕
                  </button>
                </div>
                {(selectedBandsByLayer[layer] || []).length > 0 && (
                  <div className="pl-4 space-y-0.5">
                    {(selectedBandsByLayer[layer] || []).map(band => (
                      <div key={band} className="text-xs text-gray-600 px-2 py-0.5 bg-gray-100 rounded">
                        {band}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <span className="text-red-500">*</span> 重采样方法
        </label>
        <select
          value={resampleMethod}
          onChange={(e) => setResampleMethod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="nearest">nearest</option>
          <option value="bilinear">bilinear</option>
          <option value="cubic">cubic</option>
          <option value="mode">mode</option>
        </select>
      </div>
    </div>
  );

  const renderPreprocessInterface = () => (
    <div className="p-4 space-y-4">
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
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="影像1.tif">影像1.tif</option>
          <option value="影像2.tif">影像2.tif</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <div className="text-sm font-medium text-gray-700 mb-3">数据处理流程</div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">✓</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800">辐射校正</div>
              <div className="text-xs text-gray-500 mt-1 break-words">消除或改正因辐射误差而引起影像畸变，系统根据数据类型自动处理。</div>
              <div className="mt-3 flex items-center gap-3 w-full">
                <input
                  type="checkbox"
                  checked={preprocessAutoCorrect}
                  onChange={(e) => setPreprocessAutoCorrect(e.target.checked)}
                  className="w-4 h-4 text-blue-600 flex-shrink-0"
                />
                <label className="text-sm text-gray-700 whitespace-nowrap flex-shrink-0">大气校正</label>
                <input
                  type="text"
                  value={preprocessCorrectionValue}
                  onChange={(e) => setPreprocessCorrectionValue(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">✓</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">几何校正</div>
              <div className="text-xs text-gray-500 mt-1">消除或改正遥感影像几何误差，系统根据数据类型自动处理。</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800 mb-2">影像融合</div>
              <div className="text-xs text-gray-500 mb-2">影像融合功能能够将不同时间、不同角度或不同波段的影像数据融合，提高影像的分辨率和信息量。</div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700">算法</label>
                <select
                  value={fusionAlgorithm}
                  onChange={(e) => setFusionAlgorithm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Brovey">Brovey</option>
                  <option value="PCA">PCA</option>
                  <option value="SFIM">SFIM</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStandardProcessingInterface = (description: string) => (
    <div className="p-4 space-y-4">
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
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="影像1.tif">影像1.tif</option>
          <option value="影像2.tif">影像2.tif</option>
        </select>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        {description}
      </div>
    </div>
  );

  const renderAtmosphereCorrectionInterface = () => (
    <div className="p-4 space-y-4">
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
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="影像1.tif">影像1.tif</option>
          <option value="影像2.tif">影像2.tif</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={autoCorrect}
          onChange={(e) => setAutoCorrect(e.target.checked)}
          className="w-4 h-4 text-blue-600"
        />
        <label className="text-sm text-gray-700">系统根据数据类型自动处理</label>
      </div>

      {!autoCorrect && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            校正值
          </label>
          <input
            type="text"
            value={correctionValue}
            onChange={(e) => setCorrectionValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );

  const renderFusionInterface = () => (
    <div className="p-4 space-y-4">
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
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="影像1.tif">影像1.tif</option>
          <option value="影像2.tif">影像2.tif</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 算法
        </label>
        <select
          value={fusionAlgorithm}
          onChange={(e) => setFusionAlgorithm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Brovey">Brovey</option>
          <option value="PCA">PCA</option>
          <option value="SFIM">SFIM</option>
        </select>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        影像融合功能能够将不同时间、不同角度或不同波段的影像数据融合，提高影像的分辨率和信息量。
      </div>
    </div>
  );

  const renderOrthoCorrectionInterface = () => (
    <div className="p-4 space-y-4">
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
          <span className="text-red-500">*</span> 基准影像
        </label>
        <select
          value={baseImage}
          onChange={(e) => setBaseImage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="基准1.tif">基准1.tif</option>
          <option value="基准2.tif">基准2.tif</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 校正影像
        </label>
        <select
          value={correctionImage}
          onChange={(e) => setCorrectionImage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="待校正1.tif">待校正1.tif</option>
          <option value="待校正2.tif">待校正2.tif</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            <span className="text-red-500">*</span> 控制点
          </label>
          <button className="text-blue-600 text-sm underline">自动配准</button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setControlPoints([...controlPoints, {id: Date.now(), x: 0, y: 0}])}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex-1"
          >
            <Plus size={14} />
            新增控制点
          </button>
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderColorCorrectionInterface = () => (
    <div className="p-4 space-y-4">
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
          <span className="text-red-500">*</span> 颜色空间类型
        </label>
        <select
          value={colorSpace}
          onChange={(e) => setColorSpace(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="RGB">RGB</option>
          <option value="HSV">HSV</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 基准数据
        </label>
        <select
          value={baseData}
          onChange={(e) => setBaseData(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="基准1.tif">基准1.tif</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> R
          </label>
          <select
            value={baseR}
            onChange={(e) => setBaseR(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> G
          </label>
          <select
            value={baseG}
            onChange={(e) => setBaseG(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> B
          </label>
          <select
            value={baseB}
            onChange={(e) => setBaseB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 匀色数据
        </label>
        <select
          value={colorData}
          onChange={(e) => setColorData(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="待匀色1.tif">待匀色1.tif</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> R
          </label>
          <select
            value={colorR}
            onChange={(e) => setColorR(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> G
          </label>
          <select
            value={colorG}
            onChange={(e) => setColorG(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> B
          </label>
          <select
            value={colorB}
            onChange={(e) => setColorB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMosaicInterface = () => (
    <div className="p-4 space-y-4">
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
            onClick={() => setIsMosaicDropdownOpen(!isMosaicDropdownOpen)}
            className="w-full px-3 py-2 border border-blue-500 rounded bg-white text-left flex items-center justify-between"
          >
            <span>{mosaicLayers.length > 0 ? `已选择 ${mosaicLayers.length} 项` : ''}</span>
            <ChevronDown 
              size={16} 
            />
          </button>
          
          {isMosaicDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
              {availableMosaicLayers.map(layer => (
                <div 
                  key={layer}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${mosaicLayers.includes(layer) ? 'bg-blue-50' : ''}`}
                  onClick={() => toggleMosaicLayer(layer)}
                >
                  <span>{layer}</span>
                  {mosaicLayers.includes(layer) && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {mosaicLayers.length > 0 && (
          <div className="mt-2 space-y-1">
            {mosaicLayers.map(layer => (
              <div 
                key={layer}
                className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded"
              >
                <span className="text-sm">{layer}</span>
                <button
                  type="button"
                  onClick={() => toggleMosaicLayer(layer)}
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
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <span className="text-red-500">*</span> 分辨率
          <Info size={14} className="text-gray-400" />
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">m</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 重叠区域镶嵌方法
        </label>
        <select
          value={overlapMethod}
          onChange={(e) => setOverlapMethod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="第一个值">第一个值</option>
          <option value="最后一个值">最后一个值</option>
          <option value="最小值">最小值</option>
          <option value="最大值">最大值</option>
          <option value="平均值">平均值</option>
          <option value="中位值">中位值</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 重采样方法
        </label>
        <select
          value={resampleMethod}
          onChange={(e) => setResampleMethod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="nearest">nearest</option>
          <option value="bilinear">bilinear</option>
          <option value="cubic">cubic</option>
          <option value="mode">mode</option>
        </select>
      </div>
    </div>
  );

  const renderSimpleInterface = () => (
    <div className="p-4 space-y-4">
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
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="影像1.tif">影像1.tif</option>
        </select>
      </div>
    </div>
  );

  const renderContent = () => {
    const recognitionTools = [
      '车辆目标识别', '路口目标识别', '桥梁目标识别', '机场目标识别',
      '飞机目标识别', '油罐目标识别', '舰船目标识别',
      '建筑物提取', '部落房屋提取', '道路提取'
    ];

    if (toolName === '多目标识别') {
      return renderMultiTargetRecognitionInterface();
    }

    if (recognitionTools.includes(toolName)) {
      return renderRecognitionInterface();
    }

    switch (toolName) {
      case '预处理流程':
        return renderPreprocessInterface();
      case '大气校正':
        return renderAtmosphereCorrectionInterface();
      case '正射校正':
        return renderOrthoCorrectionInterface();
      case '影像匀色':
        return renderColorCorrectionInterface();
      case '影像镶嵌':
        return renderMosaicInterface();
      case '波段合成':
        return renderBandCompositeInterface();
      case '投影系统转换':
      case '截图':
        return renderSimpleInterface();
      default:
        return renderSimpleInterface();
    }
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
            {toolName}
          </h3>
          <div className="w-8"></div>
        </div>

        {renderContent()}

        <div className="px-4 py-3 bg-blue-600 rounded-b-lg flex justify-center">
          <button
            onClick={handleExecute}
            className="px-8 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            开始执行
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoteSensingModal;
