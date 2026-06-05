import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  X,
  Play,
  Pause,
  Clock,
  Briefcase
} from 'lucide-react';

interface MapViewProps {
  selectedLayerName?: string;
  videoFusionActive?: boolean;
  videoParams?: any;
  onClearVideo?: () => void;
  onToggleTaskCenter?: () => void;
  onToggleToolbox?: () => void;
  hasTasks?: boolean;
  toolboxOpen?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  selectedLayerName, 
  videoFusionActive, 
  videoParams, 
  onClearVideo,
  onToggleTaskCenter,
  onToggleToolbox,
  hasTasks,
  toolboxOpen
}) => {
  const [zoomToLayer, setZoomToLayer] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoParams && videoFusionActive) {
      setShowVideoControls(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked
          setVideoPlaying(false);
        });
      }
    } else {
      setShowVideoControls(false);
      setVideoPlaying(false);
    }
  }, [videoParams, videoFusionActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  // Calculate video position based on params
  const getVideoStyle = () => {
    if (!videoParams) return {};
    
    // Convert lat/long to screen position (simplified)
    const x = ((videoParams.longitude + 180) / 360) * 100;
    const y = ((90 - videoParams.latitude) / 180) * 100;
    
    // Scale based on height
    const scale = Math.max(0.1, Math.min(3, 20837 / (videoParams.height || 20837)));
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${videoParams.roll || 0}deg)`,
      opacity: videoParams.opacity || 1
    };
  };

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: '#0a1929' }}>
      {/* 地图容器 */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
        <div className="relative w-full h-full">
          {/* SVG 地图背景 */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* 经纬网格线 */}
            {Array.from({ length: 19 }).map((_, i) => (
              <line 
                key={`h-${i}`}
                x1="0" 
                y1={i * 60} 
                x2="1920" 
                y2={i * 60}
                stroke="#1e3a5f"
                strokeWidth="1"
                opacity="0.6"
              />
            ))}
            
            {Array.from({ length: 33 }).map((_, i) => (
              <line 
                key={`v-${i}`}
                x1={i * 60} 
                y1="0" 
                x2={i * 60} 
                y2="1080"
                stroke="#1e3a5f"
                strokeWidth="1"
                opacity="0.6"
              />
            ))}
            
            {/* 简化的世界大陆轮廓 */}
            <path 
              d="M200,150 L350,120 L420,180 L480,160 L520,220 L450,280 L380,260 L320,300 L250,270 L180,220 Z
                 M600,200 L750,180 L820,240 L900,220 L950,280 L880,340 L780,320 L700,360 L620,330 L580,260 Z
                 M1000,180 L1150,160 L1220,220 L1300,200 L1350,260 L1280,320 L1180,300 L1100,340 L1020,310 L980,240 Z
                 M300,450 L450,420 L520,480 L600,460 L650,520 L580,580 L480,560 L400,600 L320,570 L280,500 Z
                 M700,500 L850,480 L920,540 L1000,520 L1050,580 L980,640 L880,620 L800,660 L720,630 L680,560 Z
                 M1100,480 L1250,460 L1320,520 L1400,500 L1450,560 L1380,620 L1280,600 L1200,640 L1120,610 L1080,540 Z
                 M1500,350 L1650,330 L1720,390 L1780,370 L1820,430 L1750,490 L1650,470 L1570,510 L1500,480 L1460,410 Z
                 M400,750 L550,720 L620,780 L700,760 L750,820 L680,880 L580,860 L500,900 L420,870 L380,800 Z
                 M800,800 L950,780 L1020,840 L1100,820 L1150,880 L1080,940 L980,920 L900,960 L820,930 L780,860 Z"
              fill="#ffffff"
              opacity="0.15"
            />
          </svg>

          {/* 视频融合显示区域 */}
          {showVideoControls && videoParams && (
            <div 
              className="absolute z-10"
              style={getVideoStyle()}
            >
              <div className="relative">
                <video
                  ref={videoRef}
                  className="max-w-md rounded shadow-2xl"
                  loop
                  muted
                  playsInline
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23333' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%23666' font-size='20'%3EVideo Preview%3C/text%3E%3C/svg%3E"
                >
                  <source src={videoParams.videoPath} type="video/mp4" />
                  您的浏览器不支持视频播放。
                </video>
                
                {/* 视频控制遮罩 */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    {videoPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                  </button>
                </div>

                {/* 视频线框（如果启用） */}
                {videoParams.showFrame && (
                  <div className="absolute inset-0 border-2 border-yellow-400 border-dashed rounded pointer-events-none" />
                )}
              </div>
            </div>
          )}

          {/* 顶部控制栏 - 任务管理中心和工具箱按钮 */}
          <div className="absolute top-4 right-64 flex gap-2 z-[100]">
            {/* 任务管理中心按钮 */}
            <button
              onClick={onToggleTaskCenter}
              className={`relative w-12 h-12 bg-white border-2 border-gray-300 rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-blue-500 transition-all ${
                hasTasks ? 'border-blue-500 ring-2 ring-blue-200' : ''
              }`}
              title="任务管理中心"
            >
              <Clock size={22} className="text-blue-600" />
              {hasTasks && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>
            
            {/* 工具箱按钮 */}
            <button
              onClick={onToggleToolbox}
              className={`w-12 h-12 bg-white border-2 border-gray-300 rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-blue-500 transition-all ${
                toolboxOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''
              }`}
              title="工具箱"
            >
              <Briefcase size={22} className="text-blue-600" />
            </button>
          </div>
          
          {/* 原有控制栏 */}
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

          {/* 视频融合控制栏 */}
          {showVideoControls && (
            <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
              <span className="text-sm text-gray-700">视频融合中</span>
              <button
                onClick={onClearVideo}
                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* 右侧工具按钮 */}
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
              <span>X: {videoParams?.longitude?.toFixed(6) || '135.110499'}</span>
              <span>Y: {videoParams?.latitude?.toFixed(6) || '36.294287'}</span>
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
