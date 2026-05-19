
import React from 'react';
import { 
  Box, 
  Layers as LayersIcon, 
  Info, 
  Maximize, 
  Plus, 
  Minus, 
  Ruler 
} from 'lucide-react';

const MapView: React.FC = () => {
  return (
    <div className="flex-1 bg-gray-100 relative overflow-hidden">
      {/* 地图背景 */}
      <div className="absolute inset-0 bg-[#f5f0e6]">
        {/* 模拟地图底图 */}
        <svg className="w-full h-full" viewBox="0 0 1000 800">
          <defs>
            <pattern id="mapNoise" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#f0ebe1"/>
              <rect x="0" y="0" width="5" height="5" fill="#e6e0d5" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="1000" height="800" fill="url(#mapNoise)"/>
          
          {/* 模拟道路 */}
          <path d="M0,400 Q250,380 500,400 T1000,400" stroke="#e8dcc8" strokeWidth="6" fill="none"/>
          <path d="M500,0 Q520,200 500,400 T500,800" stroke="#e8dcc8" strokeWidth="6" fill="none"/>
          <path d="M0,200 Q200,190 400,200 T800,200" stroke="#e0d4be" strokeWidth="3" fill="none"/>
          <path d="M200,0 Q210,100 200,200 T200,500" stroke="#e0d4be" strokeWidth="3" fill="none"/>
          <path d="M700,200 Q750,300 800,500" stroke="#e0d4be" strokeWidth="3" fill="none"/>
          
          {/* 地形特征 */}
          <path d="M100,600 Q150,580 200,620 Q180,680 150,660 Q120,640 100,600" fill="#e2d9c6" opacity="0.5"/>
          <path d="M700,100 Q780,80 850,130 Q820,200 770,180 Q720,160 700,100" fill="#e2d9c6" opacity="0.5"/>
        </svg>
      </div>

      {/* 遥感影像 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80" 
            alt="遥感影像" 
            className="w-[700px] h-[500px] object-cover transform"
            style={{ transform: 'rotate(-2deg)' }}
          />
          {/* 虚线边框 */}
          <div className="absolute inset-0 border-2 border-dashed border-gray-500 rounded-sm" style={{ transform: 'rotate(-2deg)' }}></div>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
          <Box size={18} className="text-gray-700" />
          <span className="absolute top-full text-xs text-gray-700">3D</span>
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

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded text-sm flex items-center gap-4">
        <span>X: 1020281.454</span>
        <span>Y: 3788524.870</span>
        <span>级别: 9</span>
        <div className="border-l border-white/30 pl-4 flex items-center gap-2">
          <div className="w-12 h-2 bg-white/80"></div>
          <span>20 km</span>
        </div>
      </div>

      <div className="absolute top-4 right-20 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex">
          <button className="p-3 border-r border-gray-200 hover:bg-gray-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <ellipse cx="12" cy="14" rx="8" ry="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 14 V8 Q12 4 20 8 V14" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>
          <button className="p-3 hover:bg-gray-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <rect x="4" y="6" width="16" height="12" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 10 L16 14" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
