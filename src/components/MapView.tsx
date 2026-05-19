
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
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black w-[700px] h-[500px] relative">
          <div className="absolute inset-0 overflow-hidden">
            <svg viewBox="0 0 700 500" className="w-full h-full">
              <defs>
                <pattern id="noise" width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill="#e8e4dc"/>
                  <rect x="0" y="0" width="2" height="2" fill="#d8d4cc" opacity="0.5"/>
                  <rect x="5" y="3" width="3" height="2" fill="#c8c4bc" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="700" height="500" fill="url(#noise)"/>
              
              <path d="M50,250 Q200,230 350,250 T650,250" stroke="#e5e0d5" strokeWidth="4" fill="none"/>
              <path d="M350,50 Q360,150 350,250 T350,450" stroke="#e5e0d5" strokeWidth="4" fill="none"/>
              
              <rect x="250" y="150" width="120" height="100" fill="#d0cbc3" opacity="0.7"/>
              <rect x="260" y="160" width="30" height="25" fill="#c5c0b8"/>
              <rect x="310" y="170" width="25" height="20" fill="#c5c0b8"/>
              <rect x="280" y="200" width="40" height="30" fill="#c5c0b8"/>
              
              <rect x="480" y="300" width="80" height="60" fill="#d0cbc3" opacity="0.6"/>
              <rect x="490" y="310" width="20" height="15" fill="#c5c0b8"/>
              
              <ellipse cx="150" cy="320" rx="40" ry="25" fill="#8b9aa3" opacity="0.6"/>
              <ellipse cx="145" cy="315" rx="25" ry="15" fill="#7a8992" opacity="0.5"/>
              
              <path d="M400,100 Q500,80 600,120 Q550,180 500,150 Q450,130 400,100" fill="#d8d3cb" opacity="0.6"/>
              <path d="M100,400 Q200,380 280,420 Q230,470 180,450 Q130,430 100,400" fill="#d8d3cb" opacity="0.5"/>
              
              <rect x="20" y="20" width="660" height="460" fill="none" stroke="#666" strokeWidth="1" strokeDasharray="4,4" transform="rotate(2, 350, 250)"/>
            </svg>
          </div>
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
