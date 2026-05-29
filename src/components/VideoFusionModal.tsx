import React, { useState } from 'react';
import { X, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface VideoFusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute?: () => void;
}

const VideoFusionModal: React.FC<VideoFusionModalProps> = ({ isOpen, onClose, onExecute }) => {
  const [videoPath, setVideoPath] = useState('');
  const [isFused, setIsFused] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  const [viewAngle, setViewAngle] = useState(40);
  const [distance, setDistance] = useState(50);
  const [opacity, setOpacity] = useState(1);
  const [feather, setFeather] = useState(0.5);
  const [showWireframe, setShowWireframe] = useState(false);

  const [longitude, setLongitude] = useState(136.696);
  const [latitude, setLatitude] = useState(49.196);
  const [height, setHeight] = useState(1178175);
  const [heading, setHeading] = useState(360);
  const [pitch, setPitch] = useState(-90);
  const [roll, setRoll] = useState(0);

  if (!isOpen) return null;

  const handleFusion = () => {
    setIsFused(true);
  };

  const handleFlyIn = () => {
    onExecute?.();
    onClose();
  };

  const handleClear = () => {
    setVideoPath('');
    setIsFused(false);
    setViewAngle(40);
    setDistance(50);
    setOpacity(1);
    setFeather(0.5);
    setShowWireframe(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-blue-500 rounded-t-lg">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 9L16 12L10 15V9Z" fill="currentColor" />
            </svg>
            <span className="text-white font-medium">视频融合</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              视频路径
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={videoPath}
                onChange={(e) => setVideoPath(e.target.value)}
                placeholder="在线或本地文件"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                <FolderOpen size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            提示：先调整场景到想要融合的视角位置，然后点击融合
          </div>

          <div>
            <div
              className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded cursor-pointer"
              onClick={() => setSettingsExpanded(!settingsExpanded)}
            >
              <span className="font-medium text-gray-700">设置</span>
              {settingsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {settingsExpanded && (
              <div className="mt-3 space-y-3">
                {isFused && (
                  <>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-20">经度(°)</label>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        step="0.001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-20">纬度(°)</label>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="0.001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-20">高度(m)</label>
                      <input
                        type="range"
                        min="0"
                        max="2000000"
                        step="1"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-20">朝向角(°)</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={heading}
                        onChange={(e) => setHeading(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={heading}
                        onChange={(e) => setHeading(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-20">俯仰角(°)</label>
                      <input
                        type="range"
                        min="-180"
                        max="0"
                        step="1"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-20">翻转角(°)</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={roll}
                        onChange={(e) => setRoll(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={roll}
                        onChange={(e) => setRoll(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 w-20">视场角度(°)</label>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="1"
                    value={viewAngle}
                    onChange={(e) => setViewAngle(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={viewAngle}
                    onChange={(e) => setViewAngle(parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 w-20">远裁距离(m)</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 w-20">透明度</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 w-20">羽化度</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={feather}
                    onChange={(e) => setFeather(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={feather}
                    onChange={(e) => setFeather(parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 w-20">显隐线框</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWireframe}
                      onChange={(e) => setShowWireframe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              清除
            </button>
            <button
              onClick={handleFusion}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              融合
            </button>
            {isFused && (
              <button
                onClick={handleFlyIn}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                飞入
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFusionModal;
