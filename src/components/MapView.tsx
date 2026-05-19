
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
    <div className="flex-1 bg-[#f5f0e6] relative overflow-hidden">
      {/* 地图背景 - 模拟地图底图 */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="#f5f0e6" />
              <path d="M0 0 L50 0 M0 25 L50 25 M0 50 L50 50" stroke="#ebe6dd" strokeWidth="0.5" />
              <path d="M0 0 L0 50 M25 0 L25 50 M50 0 L50 50" stroke="#ebe6dd" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1000" height="800" fill="url(#mapGrid)" />
          
          {/* 模拟道路 */}
          <path d="M0 400 Q250 380 500 400 T1000 400" stroke="#e8dcc8" strokeWidth="6" fill="none" />
          <path d="M500 0 Q520 200 500 400 T500 800" stroke="#e8dcc8" strokeWidth="6" fill="none" />
          <path d="M0 200 Q200 190 400 200 T800 200" stroke="#e0d4be" strokeWidth="3" fill="none" />
          <path d="M200 0 Q210 100 200 200 T200 500" stroke="#e0d4be" strokeWidth="3" fill="none" />
          <path d="M700 200 Q750 300 800 500" stroke="#e0d4be" strokeWidth="3" fill="none" />
          <path d="M100 600 Q150 580 200 620 Q180 680 150 660 Q120 640 100 600" fill="#e2d9c6" opacity="0.5" />
          <path d="M700 100 Q780 80 850 130 Q820 200 770 180 Q720 160 700 100" fill="#e2d9c6" opacity="0.5" />
          
          {/* 地名标签 */}
          <text x="180" y="180" fontSize="12" fill="#666" opacity="0.7">恩古萨</text>
          <text x="480" y="380" fontSize="12" fill="#666" opacity="0.7">瓦尔林加</text>
        </svg>
      </div>

      {/* 遥感影像层 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ transform: 'rotate(-2deg)' }}>
          {/* 使用用户提供的截图作为底图 */}
          <div className="bg-black relative" style={{ width: '700px', height: '500px' }}>
            {/* 模拟遥感影像 - 使用灰色纹理 */}
            <div className="absolute inset-0 overflow-hidden">
              <svg viewBox="0 0 700 500" className="w-full h-full">
                <defs>
                  <linearGradient id="satGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d8d4cc" />
                    <stop offset="50%" stopColor="#c8c4bc" />
                    <stop offset="100%" stopColor="#d0cbc3" />
                  </linearGradient>
                  <pattern id="satNoise" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="url(#satGradient)" />
                    <circle cx="5" cy="5" r="1" fill="#b8b4ac" opacity="0.3" />
                    <circle cx="15" cy="10" r="1.5" fill="#b0aca4" opacity="0.4" />
                    <circle cx="8" cy="15" r="0.8" fill="#c0bcb4" opacity="0.2" />
                  </pattern>
                </defs>
                <rect width="700" height="500" fill="url(#satNoise)" />
                
                {/* 模拟地物特征 */}
                <path d="M350 50 Q360 150 350 250 Q340 350 350 450" stroke="#a8a49c" strokeWidth="15" fill="none" opacity="0.6" />
                <ellipse cx="200" cy="350" rx="40" ry="30" fill="#6b7b83" opacity="0.5" />
                <ellipse cx="550" cy="300" rx="50" ry="35" fill="#788890" opacity="0.4" />
                <ellipse cx="300" cy="150" rx="60" ry="40" fill="#b0aca4" opacity="0.5" />
                <ellipse cx="450" cy="400" rx="70" ry="45" fill="#a8a49c" opacity="0.6" />
                
                {/* 城市区域 */}
                <rect x="280" y="180" width="100" height="80" fill="#b8b4ac" opacity="0.7" />
                <rect x="520" y="280" width="80" height="60" fill="#c0bcb4" opacity="0.6" />
              </svg>
            </div>
            
            {/* 虚线边框 */}
            <div className="absolute inset-0 border-2 border-dashed border-gray-500 rounded-sm" />
          </div>
        </div>
      </div>

      {/* 右侧工具栏 */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
        <button className="w-9 h-9 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
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
      <div className="absolute top-4 right-24 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded text-sm flex items-center gap-4 z-10">
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
