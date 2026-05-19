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
            backgroundImage: 'url(/basemap.jpg)',
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

      {/* 右上角控制按钮 */}
      <div className="absolute top-4 right-24 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{ zIndex: 10 }}>
        <div className="flex">
          <button className="p-3 border-r border-gray-200 hover:bg-gray-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <ellipse cx="12" cy="14" rx="8" ry="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 14 V8 Q12 4 20 8 V14" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <button className="p-3 hover:bg-gray-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <rect x="4" y="6" width="16" height="12" stroke="currentColor" strokeWidth="2" />
              <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
              <path d="M12 10 L16 14" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded text-sm flex items-center gap-4" style={{ zIndex: 10 }}>
        <span>X: 875051.100</span>
        <span>Y: 3528333.226</span>
        <span className="font-medium">级别: 9</span>
        <div className="border-l border-white/30 pl-4 flex items-center gap-2">
          <div className="w-16 h-2 bg-white/80 border border-white/30 flex">
            <div className="w-1/2 h-full bg-transparent" />
            <div className="w-1/2 h-full bg-white/60" />
          </div>
          <span>20 km</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
