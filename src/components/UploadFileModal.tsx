import React, { useState, useCallback } from 'react';
import { X, Upload, Map, Box, Image, FileText } from 'lucide-react';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile?: (payload: {
    file: File;
    dataType: string;
    dataName: string;
    description: string;
    checkProjection: boolean;
  }) => void;
}

const validateFileByType = (file: File, dataType: string): string | null => {
  const MAX_SIZE = 20 * 1024 * 1024 * 1024;
  if (file.size > MAX_SIZE) return '文件大小超过 20GB 限制';

  const name = file.name.toLowerCase();
  switch (dataType) {
    case 'vector':
      if (!name.endsWith('.zip')) return '矢量数据仅支持 .zip 压缩包（内含 .shp）';
      return null;
    case 'raster':
      if (!name.endsWith('.tif') && !name.endsWith('.tiff'))
        return '栅格数据仅支持 .tif / .tiff 格式';
      return null;
    case 'original-image':
      if (!name.endsWith('.zip') && !name.endsWith('.tar.gz'))
        return '原始影像仅支持 .zip / .tar.gz 格式';
      return null;
    case '3d':
      if (!name.endsWith('.zip')) return '三维数据仅支持 .zip 压缩包（内含 .osgb）';
      return null;
    default:
      return '未知数据类型';
  }
};

export default function UploadFileModal({ isOpen, onClose, onUploadFile }: UploadFileModalProps) {
  const [dataName, setDataName] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('vector');
  const [description, setDescription] = useState('');
  const [checkProjection, setCheckProjection] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const getFormatsForType = (type) => {
    switch (type) {
      case 'vector':
        return '.zip (内含 .shp)';
      case 'raster':
        return '.tif, .tiff';
      case 'original-image':
        return '.zip, .tar.gz';
      case '3d':
        return '.zip (内含 .osgb)';
      default:
        return '.zip';
    }
  };

  const getSizeLimit = (type) => '20GB';

  const dataTypes = [
    {
      id: 'vector',
      label: '矢量数据',
      icon: Map,
      formats: '.zip (内含 .shp)',
      size: '20GB',
      detail: 'ZIP 压缩包的 shp 格式矢量数据'
    },
    {
      id: 'raster',
      label: '栅格数据',
      icon: Image,
      formats: '.tif, .tiff',
      size: '20GB',
      detail: 'TIF / TIFF 格式栅格影像数据'
    },
    {
      id: 'original-image',
      label: '原始影像数据',
      icon: FileText,
      formats: '.zip, .tar.gz',
      size: '20GB',
      detail: '支持：高分1A / 高分1B / Landsat 8 / 资源三号02 / 高分2'
    },
    {
      id: '3d',
      label: '三维数据',
      icon: Box,
      formats: '.zip (内含 .osgb)',
      size: '20GB',
      detail: 'ZIP 压缩包的 osgb 格式三维模型数据'
    }
  ];

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    const err = validateFileByType(selectedFile, selectedDataType);
    if (err) {
      alert(err);
      return;
    }
    onUploadFile?.({
      file: selectedFile,
      dataType: selectedDataType,
      dataName,
      description,
      checkProjection,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-end z-[200]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[480px] h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">上传文件</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数据资源名称 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={dataName}
                onChange={(e) => setDataName(e.target.value)}
                placeholder="请输入数据名称"
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {dataName.length}/100
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              数据类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {dataTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedDataType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedDataType(type.id)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      size={24}
                      className={isSelected ? 'text-blue-600' : 'text-gray-500'}
                    />
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : selectedFile ? 'bg-green-50 border-green-300' : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <Upload
                size={40}
                className={`mx-auto mb-3 ${
                  isDragging ? 'text-blue-500' : selectedFile ? 'text-green-500' : 'text-gray-400'
                }`}
              />
              {selectedFile ? (
                <div>
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    移除文件
                  </button>
                </div>
              ) : (
                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <span className="inline-block px-6 py-2 border border-gray-300 rounded text-sm text-gray-600 bg-white hover:bg-gray-100 mb-2">
                      选择文件
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">
                    请点击上传或拖拽文件到此处，文件大小不能超过 20GB，支持格式：
                    <span className="text-gray-700 font-medium">{dataTypes.find(t => t.id === selectedDataType)?.formats}</span>
                  </p>
                  {selectedDataType === 'original-image' && (
                    <p className="text-xs text-gray-400 mt-1">
                      {dataTypes.find(t => t.id === selectedDataType)?.detail}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入描述"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              投影缺失检查
            </label>
            <button
              onClick={() => setCheckProjection(!checkProjection)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                checkProjection ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  checkProjection ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数据目录选择 <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="text-center text-gray-400">
                暂无数据
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!dataName || !selectedFile}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
