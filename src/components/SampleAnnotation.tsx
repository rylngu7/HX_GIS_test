import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, MoreVertical, Layers, Trash2, Save, X } from 'lucide-react';

const SampleAnnotation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('公共数据');
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [showAnnotation, setShowAnnotation] = useState(false);

  const samples = [
    { id: '1', name: 'test789', date: '2026-05-26 16:49:54' },
    { id: '2', name: 'test456', date: '2026-05-26 16:17:44' },
    { id: '3', name: 'test123', date: '2026-05-26 14:51:05' },
    { id: '4', name: 'ikik', date: '2025-12-25 10:57:38' },
    { id: '5', name: 'uu', date: '2025-11-04 17:17:46' }
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSamples = samples.filter(sample => 
    sample.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧样本列表 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* 标签页 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('公共数据')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === '公共数据'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            公共数据
          </button>
          <button
            onClick={() => setActiveTab('我的数据')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === '我的数据'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            我的数据
          </button>
        </div>

        {/* 样本数据列表 */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-medium text-purple-600 mb-2 px-2">样本数据</div>
          
          {/* 搜索框 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="输入样本标注名称搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 样本列表 */}
          <div className="space-y-3">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                onClick={() => {
                  setSelectedSample(sample.id);
                  setShowAnnotation(true);
                }}
                className={`bg-white border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedSample === sample.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-2 flex items-center justify-center">
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

        {/* 新增按钮 */}
        <div className="p-3 border-t border-gray-200">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
            <Plus size={16} />
            <span>新增</span>
          </button>
        </div>
      </div>

      {/* 右侧标注区域 */}
      <div className="flex-1 flex flex-col">
        {showAnnotation ? (
          <>
            {/* 标题栏 */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-800">样本标注</h2>
            </div>

            <div className="flex-1 flex">
              {/* 图像显示区域 */}
              <div className="flex-1 bg-gray-200 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <ImageIcon size={120} className="text-gray-500" />
                </div>
              </div>

              {/* 标注工具栏 */}
              <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">样本标注</h3>
                  
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
                  <button className="flex-1 px-4 py-2 text-purple-600 border border-purple-600 rounded text-sm hover:bg-purple-50">
                    取消
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                    保存
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
              <p>请选择一个样本进行标注</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleAnnotation;
