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
  const [controlPoints, setControlPoints] = useState<Array<{id: number, baseLng: number, baseLat: number, correctionLng: number, correctionLat: number}>>([
    { id: 1, baseLng: 113.321546, baseLat: 23.135245, correctionLng: 113.322012, correctionLat: 23.134876 },
    { id: 2, baseLng: 113.325123, baseLat: 23.140876, correctionLng: 113.325768, correctionLat: 23.140456 },
    { id: 3, baseLng: 113.318765, baseLat: 23.128543, correctionLng: 113.319234, correctionLat: 23.128112 },
  ]);
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
  const [mosaicBandsByLayer, setMosaicBandsByLayer] = useState<{ [key: string]: string[] }>({});
  const [mosaicExpandedLayers, setMosaicExpandedLayers] = useState<string[]>([]);
  const [isMosaicDropdownOpen, setIsMosaicDropdownOpen] = useState(false);
  const availableMosaicLayers = ['基准图.tif', '矫正图.tif', '预处理流程-TT8Y9713428358001'];
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
  
  // 影像融合专用状态
  const [panLayer, setPanLayer] = useState('');
  const [msLayer, setMsLayer] = useState('');
  const [isPanDropdownOpen, setIsPanDropdownOpen] = useState(false);
  const [isMsDropdownOpen, setIsMsDropdownOpen] = useState(false);
  const availablePanLayers = ['PAN_影像1.tif', 'PAN_影像2.tif', 'PAN_影像3.tif'];
  const availableMsLayers = ['MS_影像1.tif', 'MS_影像2.tif', 'MS_影像3.tif'];

  useMemo(() => {
    setResultName(`${toolName}-${generateRandomId()}`);
    // 重置影像融合状态
    if (toolName === '影像融合') {
      setPanLayer('');
      setMsLayer('');
    }
  }, [toolName]);

  if (!isOpen) return null;

  const handleExecute = () => {
    // 如果是影像融合，需要特殊处理
    if (toolName === '影像融合') {
      // 检查两个图层是否属于同一区域（这里简化模拟：假设数字相同就是同一区域）
      const panNumber = panLayer.match(/\d+/)?.[0] || '';
      const msNumber = msLayer.match(/\d+/)?.[0] || '';
      const sameRegion = panNumber === msNumber;

      if (!sameRegion) {
        alert('执行失败：全色影像和多光谱影像区域不一致！');
        return;
      }
    }
    
    if (onExecute) {
      onExecute(toolName);
    }
    console.log('执行:', { toolName, resultName, selectedLayer });
    onClose();
  };

  const toggleMosaicLayer = (layer: string) => {
    setMosaicLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const toggleMosaicLayerExpand = (layer: string) => {
    setMosaicExpandedLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  };

  const toggleMosaicBand = (layer: string, band: string) => {
    setMosaicBandsByLayer(prev => {
      const currentBands = prev[layer] || [];
      const newBands = currentBands.includes(band) 
        ? currentBands.filter(b => b !== band) 
        : [...currentBands, band];
      return { ...prev, [layer]: newBands };
    });
  };

  const removeMosaicLayer = (layer: string) => {
    setMosaicLayers(prev => prev.filter(l => l !== layer));
    setMosaicBandsByLayer(prev => {
      const newObj = { ...prev };
      delete newObj[layer];
      return newObj;
    });
  };

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

  const renderFusionInterface = () => {

    return (
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
    );
  };

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
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setControlPoints([...controlPoints, {id: Date.now(), baseLng: 0, baseLat: 0, correctionLng: 0, correctionLat: 0}])}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex-1"
          >
            <Plus size={14} />
            新增控制点
          </button>
          <button
            onClick={() => setControlPoints(controlPoints.slice(0, -1))}
            disabled={controlPoints.length === 0}
            className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* 控制点经纬度显示区域 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700">
            <div className="px-3 py-2 text-center border-r border-gray-200">
              基准影像控制点
            </div>
            <div className="px-3 py-2 text-center">
              校准影像控制点
            </div>
          </div>

          {/* 表头 */}
          <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div className="grid grid-cols-2 border-r border-gray-200">
              <div className="px-2 py-1.5 text-center">经度</div>
              <div className="px-2 py-1.5 text-center border-l border-gray-200">纬度</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="px-2 py-1.5 text-center">经度</div>
              <div className="px-2 py-1.5 text-center border-l border-gray-200">纬度</div>
            </div>
          </div>

          {/* 控制点列表 */}
          <div className="max-h-[180px] overflow-y-auto">
            {controlPoints.length === 0 ? (
              <div className="px-3 py-6 text-center text-gray-400 text-xs">
                暂未添加控制点
              </div>
            ) : (
              controlPoints.map((point, index) => (
                <div
                  key={point.id}
                  className={`grid grid-cols-2 text-xs ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${index !== controlPoints.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="grid grid-cols-2 border-r border-gray-200">
                    <div className="px-2 py-1.5 text-center text-gray-700 font-mono">
                      {point.baseLng.toFixed(3)}
                    </div>
                    <div className="px-2 py-1.5 text-center text-gray-700 font-mono border-l border-gray-200">
                      {point.baseLat.toFixed(3)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="px-2 py-1.5 text-center text-gray-700 font-mono">
                      {point.correctionLng.toFixed(3)}
                    </div>
                    <div className="px-2 py-1.5 text-center text-gray-700 font-mono border-l border-gray-200">
                      {point.correctionLat.toFixed(3)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 统计信息 */}
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span>已选择 {controlPoints.length} 对控制点</span>
            {controlPoints.length >= 3 && (
              <span className="text-green-600">✓ 满足最小配准要求</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderColorCorrectionInterface = () => {
    const bands = ['B1', 'B2', 'B3', 'B4'];
    
    return (
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
            <option value="single">单波段</option>
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
            <option value="基准图.tif">基准图.tif</option>
          </select>
        </div>

        {colorSpace === 'RGB' ? (
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
                {bands.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
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
                {bands.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
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
                {bands.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> 波段
            </label>
            <select
              value={baseR}
              onChange={(e) => setBaseR(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              {bands.map(band => (
                <option key={band} value={band}>{band}</option>
              ))}
            </select>
          </div>
        )}

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
            <option value="矫正图.tif">矫正图.tif</option>
          </select>
        </div>

        {colorSpace === 'RGB' ? (
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
                {bands.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
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
                {bands.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
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
                {bands.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> 波段
            </label>
            <select
              value={colorR}
              onChange={(e) => setColorR(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              {bands.map(band => (
                <option key={band} value={band}>{band}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

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
            <ChevronDown size={16} />
          </button>

          {isMosaicDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {availableMosaicLayers.map(layer => (
                <div key={layer}>
                  <div
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${mosaicLayers.includes(layer) ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      toggleMosaicLayer(layer);
                      if (!mosaicExpandedLayers.includes(layer)) {
                        toggleMosaicLayerExpand(layer);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={mosaicLayers.includes(layer)}
                      className="w-4 h-4"
                      readOnly
                    />
                    <span className="text-sm flex-1">{layer}</span>
                    {(layerBands[layer]?.length || 0) > 0 && (
                      <ChevronDown
                        size={14}
                        className={`text-gray-500 transition-transform ${mosaicExpandedLayers.includes(layer) ? 'rotate-180' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMosaicLayerExpand(layer);
                        }}
                      />
                    )}
                  </div>
                  {(layerBands[layer]?.length || 0) > 0 && mosaicExpandedLayers.includes(layer) && (
                    <div className="pl-10 pr-3 pb-2 space-y-1">
                      {layerBands[layer].map(band => (
                        <div
                          key={band}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMosaicBand(layer, band);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(mosaicBandsByLayer[layer] || []).includes(band)}
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
        {mosaicLayers.length > 0 && (
          <div className="mt-2 space-y-1">
            {mosaicLayers.map(layer => (
              <div key={layer} className="space-y-1">
                <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-sm">{layer}</span>
                  <button
                    type="button"
                    onClick={() => removeMosaicLayer(layer)}
                    className="text-blue-500 hover:text-blue-700 ml-2"
                  >
                    ✕
                  </button>
                </div>
                {(mosaicBandsByLayer[layer] || []).length > 0 && (
                  <div className="pl-4 space-y-0.5">
                    {(mosaicBandsByLayer[layer] || []).map(band => (
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
      case '辐射定标':
        return renderStandardProcessingInterface('消除或改正因辐射误差而引起影像畸变，系统根据数据类型自动处理。');
      case '几何校正':
        return renderStandardProcessingInterface('消除或改正遥感影像几何误差，系统根据数据类型自动处理。');
      case '大气校正':
        return renderAtmosphereCorrectionInterface();
      case '正射校正':
        return renderOrthoCorrectionInterface();
      case '影像匀色':
        return renderColorCorrectionInterface();
      case '影像镶嵌':
        return renderMosaicInterface();
      case '影像融合':
        return renderFusionInterface();
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
            disabled={toolName === '影像融合' && (!panLayer || !msLayer)}
            className="px-8 py-2 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始执行
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoteSensingModal;