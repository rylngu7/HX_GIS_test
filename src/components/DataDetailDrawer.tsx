import React, { useState, useEffect } from 'react';
import { X, Folder, Tag, Edit3, ChevronRight, Check } from 'lucide-react';
import { DataFile, DataFolder, isFolder, formatSize, DataCatalogStore } from './DataCatalogStore';

interface DataDetailDrawerProps {
  isOpen: boolean;
  file: DataFile | null;
  store: DataCatalogStore;
  onClose: () => void;
  onRename?: (fileId: string, newName: string) => void;
  onMove?: (fileId: string, targetFolderId: string) => void;
}

const DataDetailDrawer: React.FC<DataDetailDrawerProps> = ({
  isOpen,
  file,
  store,
  onClose,
  onRename,
  onMove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (file) {
      setEditName(file.name);
      setIsEditing(false);
      setShowFolderPicker(false);
      setSelectedFolderId('');
    }
  }, [file?.id]);

  if (!isOpen || !file) return null;

  const allFolders = store.getAllFolders();

  const handleSave = () => {
    if (onRename && editName.trim()) {
      onRename(file.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(file.name);
    setIsEditing(false);
    setShowFolderPicker(false);
    setSelectedFolderId('');
  };

  const handleMove = (folderId: string) => {
    if (onMove) {
      onMove(file.id, folderId);
    }
    setShowFolderPicker(false);
    setSelectedFolderId('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[250]" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-[260] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">详情</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <div className="text-sm font-medium text-gray-700 mb-3">基本信息</div>

            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2.5 text-gray-500 w-[120px] align-top">数据名称</td>
                  <td className="px-3 py-2.5 text-gray-800" colSpan={3}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      file.name
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-gray-500 align-top">数据类型</td>
                  <td className="px-3 py-2.5 text-gray-800">{file.dataType}</td>
                  <td className="px-3 py-2.5 text-gray-500 align-top">文件类型</td>
                  <td className="px-3 py-2.5 text-gray-800">{file.fileType}</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2.5 text-gray-500 align-top">上传时间</td>
                  <td className="px-3 py-2.5 text-gray-800 text-xs">{file.createdAt}</td>
                  <td className="px-3 py-2.5 text-gray-500 align-top">更新时间</td>
                  <td className="px-3 py-2.5 text-gray-800 text-xs">{file.updatedAt}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-gray-500 align-top">数据分类</td>
                  <td className="px-3 py-2.5 text-gray-800">-</td>
                  <td className="px-3 py-2.5 text-gray-500 align-top">上传人</td>
                  <td className="px-3 py-2.5 text-gray-800">{file.uploader}</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2.5 text-gray-500 align-top">数据分级</td>
                  <td className="px-3 py-2.5 text-gray-800">-</td>
                  <td className="px-3 py-2.5 text-gray-500 align-top">占用空间</td>
                  <td className="px-3 py-2.5 text-gray-800">{formatSize(file.size)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">标签信息</div>
              {isEditing && (
                <button
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  onClick={() => {}}
                >
                  <Tag size={12} />
                  点击添加新标签
                </button>
              )}
            </div>
            {file.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {file.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                {isEditing ? '点击添加新标签' : '暂无标签'}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">所属目录</div>
              {isEditing && (
                <button
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  onClick={() => setShowFolderPicker(!showFolderPicker)}
                >
                  点击修改目录
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">
              <Folder size={14} className="text-yellow-500 flex-shrink-0" />
              <span>全部{file.parentPath}</span>
            </div>

            {isEditing && showFolderPicker && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-52 overflow-y-auto bg-white">
                {allFolders.map(folder => (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${
                      selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    style={{ paddingLeft: `${folder.level * 16 + 12}px` }}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    {selectedFolderId === folder.id && (
                      <Check size={14} className="text-blue-600 flex-shrink-0" />
                    )}
                    <Folder size={14} className="text-yellow-500 flex-shrink-0" />
                    <span>{folder.name}</span>
                  </div>
                ))}
                {selectedFolderId && (
                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <button
                      className="w-full py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      onClick={() => handleMove(selectedFolderId)}
                    >
                      确认移动
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                onClick={handleCancelEdit}
              >
                取消操作
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                onClick={handleSave}
              >
                保存修改
              </button>
            </>
          ) : (
            <button
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={14} />
              编辑
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default DataDetailDrawer;
