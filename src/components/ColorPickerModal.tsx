import React, { useState } from 'react';
import { X, Pipette } from 'lucide-react';
import { COLOR_PALETTE, COLOR_NAMES } from './modelComputeData';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (color: string) => void;
  title?: string;
  initialColor?: string;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = '选择颜色',
  initialColor,
}) => {
  const [customColor, setCustomColor] = useState(initialColor || COLOR_PALETTE[0]);

  if (!isOpen) return null;

  const handleSelect = (c: string) => {
    onSelect(c);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-[380px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
            <Pipette size={16} className="text-blue-600" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 标准色盘 */}
          <div>
            <div className="text-xs text-gray-500 mb-2">标准色盘</div>
            <div className="flex items-center gap-3">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelect(c)}
                  title={COLOR_NAMES[c] || c}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    initialColor === c ? 'border-gray-800 ring-2 ring-blue-300' : 'border-white ring-1 ring-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* 自定义颜色 */}
          <div>
            <div className="text-xs text-gray-500 mb-2">自定义颜色</div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={customColor.toUpperCase()}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#FFFFFF"
              />
              <button
                onClick={() => handleSelect(customColor)}
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                应用
              </button>
            </div>
          </div>

          {/* 颜色预览 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
            <span className="text-xs text-gray-500">当前预览</span>
            <div
              className="w-20 h-8 rounded border border-gray-300"
              style={{ backgroundColor: customColor }}
            />
            <span className="text-xs font-mono text-gray-700">{customColor.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
