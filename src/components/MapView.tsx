import React, { useState } from 'react';
import { 
  Box, 
  Layers as LayersIcon, 
  Info, 
  Maximize, 
  Plus, 
  Minus, 
  Ruler,
  Download,
  Maximize2,
  ZoomIn
} from 'lucide-react';

interface MapViewProps {
  selectedLayerName?: string;
}

const MapView: React.FC<MapViewProps> = ({ selectedLayerName }) => {
  const [zoomToLayer, setZoomToLayer] = useState(false);

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: '#f5f0e6' }}>
      {/* 底图 */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
        <div 
          className="relative"
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(./basemap.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 模拟影像数据显示 */}
          <div 
            className="absolute"
            style={{
              left: '35%',
              top: '25%',
              width: '40%',
              height: '50%',
              backgroundColor: '#000',
              transform: 'rotate(5deg)'
            }}
          >
            <div 
              className="absolute inset-2"
              style={{
                background: 'linear-gradient(135deg, #a8a08a 0%, #c9c2b0 50%, #8b8677 100%)',
                clipPath: 'polygon(5% 0%, 95% 2%, 100% 98%, 0% 100%)'
              }}
            />
          </div>
        </div>
      </div>

      {/* 左上角 - 图层缩放按钮组 */}
      {selectedLayerName && (
        <div className="absolute left-4 top-4 flex gap-1 bg-white rounded-lg shadow-lg p-1" style={{ zIndex: 50 }}>
          <span className="px-3 py-2 text-sm text-gray-700 flex items-center">
            {selectedLayerName}
          </span>
          <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
            <Download size={18} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
            <Info size={18} />
          </button>
          <button 
            className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setZoomToLayer(!zoomToLayer)}
            title="缩放到图层"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      )}

      {/* 右侧工具栏 */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-1" style={{ zIndex: 45 }}>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50 relative">
          <Box size={18} className="text-gray-700" />
          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 shadow whitespace-nowrap">3D</span>
        </button>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <LayersIcon size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Info size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <LayersIcon size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Ruler size={18} className="text-gray-700" />
        </button>
        <div className="w-px h-px bg-gray-300 mx-auto my-1" />
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Plus size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Minus size={18} className="text-gray-700" />
        </button>
        <div className="w-px h-px bg-gray-300 mx-auto my-1" />
        <button className="w-9 h-9 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Maximize size={18} className="text-gray-700" />
        </button>
      </div>

      {/* 右上角控件 */}
      <div className="absolute top-4 right-4 flex gap-2" style={{ zIndex: 45 }}>
        <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 hover:bg-gray-50">
          工具
        </button>
        <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 hover:bg-gray-50">
          图层
        </button>
        <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 hover:bg-gray-50">
          分析
        </button>
      </div>

      {/* 底部状态栏 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-4 pb-2" style={{ zIndex: 45 }}>
        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded shadow text-sm text-gray-700 font-mono">
          X: 8945358.677 &nbsp;&nbsp; Y: 4589023.544
        </div>
        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded shadow text-sm text-gray-700 font-mono">
          级别: 9
        </div>
        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded shadow text-sm text-gray-700 font-mono">
          EPSG:3857
        </div>
        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded shadow text-sm text-gray-700 flex items-center gap-2">
          <div className="w-16 h-3 border-l border-r border-b border-gray-600 relative">
            <div className="absolute left-0 bottom-0 border-l-2 border-t-2 border-gray-600 w-1 h-1" />
            <div className="absolute right-0 bottom-0 border-r-2 border-t-2 border-gray-600 w-1 h-1" />
          </div>
          20 km
        </div>
      </div>
    </div>
  );
};

export default MapView;