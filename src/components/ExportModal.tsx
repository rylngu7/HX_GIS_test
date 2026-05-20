import React, { useState } from 'react';
import { X, Folder, FileText, ChevronRight, ChevronDown, Database } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'条件导出' | '全量导出'>('条件导出');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['全部']);

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => 
      prev.includes(name) 
        ? prev.filter(f => f !== name) 
        : [...prev, name]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="w-[420px] h-full bg-white shadow-xl flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">导出</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('条件导出')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === '条件导出' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            条件导出
          </button>
          <button
            onClick={() => setActiveTab('全量导出')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === '全量导出' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            全量导出
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === '条件导出' ? (
            /* 条件导出界面 */
            <div className="space-y-4">
              {/* 查询条件 */}
              <div className="bg-gray-100 px-4 py-2 rounded-t flex items-center justify-between">
                <span className="font-medium text-gray-700">查询条件</span>
                <ChevronDown size={16} className="text-gray-500" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    图层 <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">请选择图层</option>
                  </select>
                </div>

                {/* 属性条件/空间条件标签 */}
                <div className="flex border-b border-gray-200">
                  <button className="px-4 py-2 text-sm text-blue-600 border-b-2 border-blue-600 font-medium">
                    属性条件
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                    空间条件
                  </button>
                </div>

                {/* 属性条件内容 */}
                <div className="space-y-2 pt-2">
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-y min-h-[100px]" />
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <div className="grid grid-cols-5 gap-1 flex-1">
                      {['=', '<>', '>', 'Like', 'Is', '>=', '<', '<=', 'And', 'Not', '-', '%', '()', 'Or'].map((op, i) => (
                        <button 
                          key={i} 
                          className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1">
                      <input type="text" className="px-2 py-1 border border-gray-300 rounded text-xs" />
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        获取唯一值(V)
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">SELECT "FROM" WHERE</div>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-y min-h-[60px]" />
                  
                  <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      查询
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                      重置
                    </button>
                  </div>
                </div>
              </div>

              {/* 查询结果 */}
              <div className="mt-4">
                <div className="bg-gray-100 px-4 py-2 rounded-t flex items-center justify-between">
                  <span className="font-medium text-gray-700">查询结果</span>
                  <ChevronRight size={16} className="text-gray-500" />
                </div>
              </div>
            </div>
          ) : (
            /* 全量导出界面 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  数据选择 <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded p-3 min-h-[160px]">
                  <div>
                    <div 
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm"
                      onClick={() => toggleFolder('全部')}
                    >
                      <ChevronDown size={14} />
                      <Folder size={16} className="text-yellow-500" />
                      <span>全部</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  数据名称 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="请输入数据名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标库 <span className="text-red-500">*</span>
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择目标库</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  保存路径选择 <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded p-8 flex flex-col items-center justify-center min-h-[160px]">
                  <Database size={64} className="text-gray-300 mb-3" />
                  <span className="text-sm text-gray-500">暂无数据</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        {activeTab === '全量导出' && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              取消
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              确认
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;
