import React, { useState } from 'react';
import { X, Video, FolderOpen, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface VideoFusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute?: (params: any) => void;
}

const VideoFusionModal: React.FC<VideoFusionModalProps> = ({ isOpen, onClose, onExecute }) => {
  const [videoPath, setVideoPath] = useState('');
  const [isFused, setIsFused] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  
  const [params, setParams] = useState({
    viewAngle: 40,
    distance: 50,
    longitude: 116.397428,
    latitude: 39.90923,
    height: 20837,
    heading: 360,
    pitch: -90,
    roll: 0,
    opacity: 1.0,
    feather: 0.5
  });
  
  const [showFrame, setShowFrame] = useState(false);

  if (!isOpen) return null;

  const handleFusion = () => {
    if (videoPath) {
      setIsFused(true);
    }
  };

  const handleFlyIn = () => {
    onExecute?.({
      videoPath,
      ...params,
      showFrame
    });
    onClose();
  };

  const updateParam = (key: string, value: number) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderSlider = (label: string, key: string, min: number, max: number, step: number = 1) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-gray-700">{label}</label>
        <input
          type="number"
          value={params[key as keyof typeof params]}
          onChange={(e) => updateParam(key, parseFloat(e.target.value))}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
          min={min}
          max={max}
          step={step}
        />
      </div>
      <input
        type="range"
        value={params[key as keyof typeof params]}
        onChange={(e) => updateParam(key, parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );

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
          <div className="flex items-center gap-2">
            <Video size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-800">视频融合</span>
          </div>
          <div className="w-8" />
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* 视频路径选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">视频路径</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={videoPath}
                onChange={(e) => setVideoPath(e.target.value)}
                placeholder="在线或本地文件"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                onClick={() => {
                  setVideoPath('/sample-data/video/demo.mp4');
                }}
              >
                <FolderOpen size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">提示：先调整场景到想要融合的视角位置，然后点击融合</p>
          </div>

          {/* 设置区域 */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer mb-3 px-2 py-2 bg-gray-100 rounded"
              onClick={() => setSettingsExpanded(!settingsExpanded)}
            >
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">设置</span>
              </div>
              {settingsExpanded ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
            </div>

            {settingsExpanded && (
              <div className="space-y-1">
                {!isFused ? (
                  <>
                    {renderSlider('视场角度(°)', 'viewAngle', 1, 120)}
                    {renderSlider('远裁距离(m)', 'distance', 1, 1000)}
                    {renderSlider('透明度', 'opacity', 0, 1, 0.01)}
                    {renderSlider('羽化度', 'feather', 0, 1, 0.01)}
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="showFrame"
                        checked={showFrame}
                        onChange={(e) => setShowFrame(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="showFrame" className="text-sm text-gray-700">显隐线框</label>
                    </div>
                  </>
                ) : (
                  <>
                    {renderSlider('经度(°)', 'longitude', -180, 180, 0.000001)}
                    {renderSlider('纬度(°)', 'latitude', -90, 90, 0.000001)}
                    {renderSlider('高度(m)', 'height', 0, 100000)}
                    {renderSlider('视场角度(°)', 'viewAngle', 1, 120)}
                    {renderSlider('远裁距离(m)', 'distance', 1, 1000)}
                    {renderSlider('朝向角(°)', 'heading', 0, 360)}
                    {renderSlider('俯仰角(°)', 'pitch', -180, 180)}
                    {renderSlider('翻转角(°)', 'roll', -180, 180)}
                    {renderSlider('透明度', 'opacity', 0, 1, 0.01)}
                    {renderSlider('羽化度', 'feather', 0, 1, 0.01)}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showFrame"
                        checked={showFrame}
                        onChange={(e) => setShowFrame(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="showFrame" className="text-sm text-gray-700">显隐线框</label>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
          {isFused && (
            <button
              onClick={() => setIsFused(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
            >
              清除
            </button>
          )}
          {!isFused ? (
            <button
              onClick={handleFusion}
              disabled={!videoPath}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              融合
            </button>
          ) : (
            <button
              onClick={handleFlyIn}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              飞入
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFusionModal;
