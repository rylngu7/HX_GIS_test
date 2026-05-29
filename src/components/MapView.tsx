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
  ZoomIn,
  Scan,
  Search,
  Layers
} from 'lucide-react';

interface MapViewProps {
  selectedLayerName?: string;
}

const MapView: React.FC<MapViewProps> = ({ selectedLayerName }) => {
  const [zoomToLayer, setZoomToLayer] = useState(false);

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: '#f0f0f0' }}>
      {/* 底图 - 模拟中国地图样式 */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
        <div
          className="relative w-full h-full"
          style={{
            background: `
              linear-gradient(to bottom, #e8f4f8 0%, #d4e8f0 50%, #c8e0ed 100%)
            `,
          }}
        >
          {/* 模拟地图内容 */}
          <div className="absolute inset-0 opacity-30">
            {/* 这里可以添加更详细的地图元素 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />

            {/* 简化的中国轮廓 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
              {/* 简化的中国边界 */}
              <path
                d="M200,100 Q250,80 300,90 L350,100 Q400,95 450,110 L500,120 Q550,140 560,180 L550,230 Q540,280 520,320 L480,350 Q450,380 420,400 L380,420 Q340,440 300,450 L250,460 Q200,470 160,460 L130,440 Q100,410 90,370 L80,320 Q75,270 85,220 L100,170 Q120,130 160,110 Z"
                fill="#f5f5f0"
                stroke="#d0d0cc"
                strokeWidth="2"
              />

              {/* 主要省份边界线 */}
              <path
                d="M200,150 Q250,140 300,150 L350,160 Q400,155 450,170"
                fill="none"
                stroke="#d0d0cc"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <path
                d="M250,200 Q300,190 350,200 L400,210"
                fill="none"
                stroke="#d0d0cc"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <path
                d="M180,250 Q230,240 280,250 L330,260"
                fill="none"
                stroke="#d0d0cc"
                strokeWidth="1"
                strokeDasharray="4 2"
              />

              {/* 省会城市点 */}
              {[
                [350, 150],
                [420, 170],
                [300, 180],
                [250, 200],
                [380, 220],
                [450, 240],
                [280, 280],
                [350, 300],
                [400, 320],
                [480, 350],
                [180, 300],
                [220, 350]
              ].map(([x, y], idx) => (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#888"
                />
              ))}
            </svg>
          </div>

          {/* 右上角 - 控制面板 */}
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-r border-gray-200">
                <Scan size={18} />
                <span className="text-sm">飞行</span>
              </button>
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-r border-gray-200">
                <Search size={18} />
                <span className="text-sm">查询</span>
              </button>
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Layers size={18} />
                <span className="text-sm">对比</span>
              </button>
            </div>
          </div>

          {/* 右侧 - 工具按钮 */}
          <div className="absolute right-4 top-24 flex flex-col gap-1 z-50">
            <button className="w-10 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
              <Box size={18} className="text-gray-700" />
            </button>
            <button className="w-10 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
              <LayersIcon size={18} className="text-gray-700" />
            </button>
            <button className="w-10 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
              <Info size={18} className="text-gray-700" />
            </button>
            <div className="w-6 h-px bg-gray-300 mx-auto my-1" />
            <button className="w-10 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
              <Ruler size={18} className="text-gray-700" />
            </button>
            <div className="w-6 h-px bg-gray-300 mx-auto my-1" />
            <button className="w-10 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
              <Plus size={18} className="text-gray-700" />
            </button>
            <button className="w-10 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
              <Minus size={18} className="text-gray-700" />
            </button>
            <div className="w-6 h-px bg-gray-300 mx-auto my-1" />
            <button className="w-10 h-10 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center hover:bg-gray-50">
              <Maximize size={18} className="text-gray-700" />
            </button>
          </div>

          {/* 底部状态栏 */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-4 pb-2 z-50">
            <div className="bg-white/95 backdrop-blur px-4 py-2 rounded shadow text-sm text-gray-700 font-mono flex items-center gap-2">
              <span>X: 13511049.854</span>
              <span>Y: 3629434.863</span>
              <span>级别: 6</span>
              <div className="w-24 h-3 border-l border-r border-b border-gray-600 relative">
                <div className="absolute left-0 bottom-0 border-l-2 border-t-2 border-gray-600 w-1 h-1" />
                <div className="absolute right-0 bottom-0 border-r-2 border-t-2 border-gray-600 w-1 h-1" />
              </div>
              <span>200 km</span>
              <span>行政区划</span>
              <div className="flex items-center gap-1 ml-4">
                <div className="w-16 h-12 border border-gray-400 bg-gradient-to-br from-green-200 to-blue-200" />
                <span className="text-xs">矢量</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
