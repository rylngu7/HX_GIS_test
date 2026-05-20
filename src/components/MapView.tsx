import React from 'react';
import { Box, Layers as LayersIcon, Info, Maximize, Plus, Minus, Ruler } from 'lucide-react';

const MapView: React.FC = () => {
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
        />
      </div>

      {/* 右侧工具栏 */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2" style={{ zIndex: 10 }}>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50 relative">
          <Box size={18} className="text-gray-700" />
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 bg-white px-1 rounded whitespace-nowrap">3D</span>
        </button>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <LayersIcon size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Info size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <LayersIcon size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Ruler size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Plus size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Minus size={18} className="text-gray-700" />
        </button>
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Maximize size={18} className="text-gray-700" />
        </button>
      </div>

      {/* 右上角控件 */}
      <div className="absolute top-4 right-4 flex gap-2" style={{ zIndex: 10 }}>
        <button className="px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm text-gray-700 hover:bg-gray-50">
          工具
        </button>
        <button className="px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm text-gray-700 hover:bg-gray-50">
          图层
        </button>
        <button className="px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm text-gray-700 hover:bg-gray-50">
          分析
        </button>
      </div>

      {/* 底部状态栏 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center" style={{ zIndex: 10 }}>
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded shadow-sm text-sm text-gray-700">
          经度: 116.4074 | 纬度: 39.9042 | 比例尺: 1:10000
        </div>
      </div>
    </div>
  );
};

export default MapView;