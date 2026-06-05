import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, MoreVertical, Trash2, Save, X, ChevronLeft } from 'lucide-react';

interface Sample {
  id: string;
  name: string;
  date: string;
}

const SampleAnnotation: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const samples: Sample[] = [
    { id: '1', name: 'test789', date: '2026-05-26 16:49:54' },
    { id: '2', name: 'test456', date: '2026-05-26 16:17:44' },
    { id: '3', name: 'test123', date: '2026-05-26 14:51:05' },
    { id: '4', name: 'ikik', date: '2025-12-25 10:57:38' },
    { id: '5', name: 'uu', date: '2025-11-04 17:17:46' }
  ];

  const filteredSamples = samples.filter(sample => 
    sample.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCancel = () => {
    setSelectedSample(null);
  };

  if (selectedSample) {
    return (
      <div className="flex h-full bg-gray-50">
        {/* 左侧：选中的样本卡片 */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col p-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">样本列表</span>
          </button>
          
          {/* 选中的样本卡片 */}
          <div className="bg-white border-2 border-blue-500 rounded-lg p-3">
            <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-2 flex items-center justify-center">
              <ImageIcon size={48} className="text-blue-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">{selectedSample.name}</span>
              <MoreVertical size={16} className="text-gray-400" />
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>📅</span>
              <span>{selectedSample.date}</span>
            </div>
          </div>
        </div>

        {/* 中央：标注区域 */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
            <div className="w-full h-full bg-white border border-gray-200 rounded-lg flex items-center justify-center">
              <ImageIcon size={160} className="text-gray-300" />
            </div>
          </div>
        </div>

        {/* 右侧：标注操作栏 */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3">样本标注 - {selectedSample.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择图层数据</label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-500">
                  冰雪.tif
                </div>
                <button className="px-3 py-2 border border-purple-600 text-purple-600 rounded text-sm hover:bg-purple-50">
                  重新选择
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">制作样本标签</label>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                  <Trash2 size={16} />
                  <span>清除</span>
                </button>
                <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm flex items-center justify-center gap-2 hover:bg-purple-700">
                  <Plus size={16} />
                  <span>标签</span>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">标签栏</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                  <div className="w-6 h-6 bg-blue-500 rounded" />
                  <input
                    type="text"
                    placeholder="?"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-purple-600 border border-purple-600 rounded text-sm hover:bg-purple-50"
            >
              取消
            </button>
            <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
        {/* 搜索框 */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="输入样本标注名称搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
            <Plus size={16} />
            <span>新增</span>
          </button>
        </div>

        {/* 样本列表 - 2列展示 */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                onClick={() => setSelectedSample(sample)}
                className="bg-white border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-blue-500"
              >
                <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-2 flex items-center justify-center">
                  <ImageIcon size={48} className="text-blue-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{sample.name}</span>
                  <MoreVertical size={16} className="text-gray-400" />
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span>📅</span>
                  <span>{sample.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleAnnotation;
