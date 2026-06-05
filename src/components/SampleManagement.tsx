import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, ChevronLeft, Trash2, Edit, CheckSquare, Square } from 'lucide-react';

const SampleManagement: React.FC = () => {
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sampleSets = [
    { id: '1', name: 'test11', sampleCount: 1, date: '2026-06-04 14:46:49' },
    { id: '2', name: '1', sampleCount: 0, date: '2026-06-01 16:03:35' },
    { id: '3', name: 'bailian', sampleCount: 0, date: '2025-12-24 14:25:16' }
  ];

  const filteredSets = sampleSets.filter(set => 
    set.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const samples = [
    { id: '1', name: 'sample1.jpg', selected: true }
  ];

  if (selectedSet) {
    return (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedSet(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={20} />
            <span className="text-lg font-semibold">{selectedSet}</span>
          </button>
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">样本数据</span>
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
              <Plus size={16} />
              <span>新增样本</span>
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {samples.map((sample) => (
              <div key={sample.id} className="relative">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center relative">
                    <ImageIcon size={40} className="text-gray-400" />
                    <div className="absolute top-2 left-2">
                      {sample.selected ? (
                        <CheckSquare size={20} className="text-purple-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-1 bg-white rounded shadow-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-4">
          <span className="text-sm text-gray-600">共1条</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm">1</button>
            <span className="text-gray-400 text-sm">
              <ChevronLeft size={16} className="rotate-180" />
            </span>
          </div>
          <select className="px-3 py-1 border border-gray-300 rounded text-sm">
            <option>10 条/页</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="输入样本名称搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
            <Plus size={16} />
            <span>新增</span>
          </button>
        </div>

        <div className="flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 text-sm font-medium text-gray-700">样本名称</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">样本数</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">最后更新时间</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">编辑</th>
              </tr>
            </thead>
            <tbody>
              {filteredSets.map((set) => (
                <tr key={set.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="text-center py-3 text-sm text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedSet(set.name)}>
                    {set.name}
                  </td>
                  <td className="text-center py-3 text-sm text-gray-700">
                    {set.sampleCount > 0 ? set.sampleCount : '暂无'}
                  </td>
                  <td className="text-center py-3 text-sm text-gray-700">{set.date}</td>
                  <td className="text-center py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">重命名</button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">编辑</button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SampleManagement;
