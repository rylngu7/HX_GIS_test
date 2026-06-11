import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Upload, Map, Box, Image, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

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

const UPLOAD_STAGES = [
  { key: 'uploading',  label: '正在上传文件到服务器',      progressRange: [0, 25] },
  { key: 'validating', label: '后端格式与质量校验中',     progressRange: [25, 60], failRate: 0.15 },
  { key: 'parsing',    label: '正在解析数据内容',         progressRange: [60, 85], failRate: 0.05 },
  { key: 'storing',    label: '写入数据目录',              progressRange: [85, 100], failRate: 0.03 },
];

export default function UploadFileModal({ isOpen, onClose, onUploadFile }: UploadFileModalProps) {
  const [dataName, setDataName] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('vector');
  const [description, setDescription] = useState('');
  const [checkProjection, setCheckProjection] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formatError, setFormatError] = useState('');
  const [userTouchedName, setUserTouchedName] = useState(false);

  // Processing states
  const [processing, setProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadFailed, setUploadFailed] = useState('');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);
  const onUploadFileRef = useRef(onUploadFile);
  const selectedDataTypeRef = useRef(selectedDataType);
  const dataTypesRef = useRef<Array<{id: string; label: string}>>([]);

  // Keep latest callbacks/refs in sync
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onUploadFileRef.current = onUploadFile; }, [onUploadFile]);
  useEffect(() => { selectedDataTypeRef.current = selectedDataType; }, [selectedDataType]);

  const dataTypes = [
    { id: 'vector', label: '矢量数据', icon: Map, formats: '.zip (内含 .shp)', size: '20GB', detail: 'ZIP 压缩包的 shp 格式矢量数据' },
    { id: 'raster', label: '栅格数据', icon: Image, formats: '.tif, .tiff', size: '20GB', detail: 'TIF / TIFF 格式栅格影像数据' },
    { id: 'original-image', label: '原始影像数据', icon: FileText, formats: '.zip, .tar.gz', size: '20GB', detail: '支持：高分1A / 高分1B / Landsat 8 / 资源三号02 / 高分2' },
    { id: '3d', label: '三维数据', icon: Box, formats: '.zip (内含 .osgb)', size: '20GB', detail: 'ZIP 压缩包的 osgb 格式三维模型数据' },
  ];

  useEffect(() => { dataTypesRef.current = dataTypes; }, [dataTypes]);

  // Reset all states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setProcessing(false);
      setCurrentStageIdx(0);
      setUploadProgress(0);
      setUploadDone(false);
      setUploadFailed('');
      setFormatError('');
    } else {
      // Clear file when modal closes
      setSelectedFile(null);
      setDataName('');
      setDescription('');
      setFormatError('');
      setUserTouchedName(false);
    }
  }, [isOpen]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      applySelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      applySelectedFile(files[0]);
    }
    // Reset input value so selecting the same file again re-triggers onChange
    e.target.value = '';
  };

  const applySelectedFile = (file: File) => {
    setSelectedFile(file);
    // Frontend format validation on selection
    const err = validateFileByType(file, selectedDataTypeRef.current);
    setFormatError(err || '');
    // Auto-fill data name with file name (without extension) unless user already typed
    if (!userTouchedName) {
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
      setDataName(nameWithoutExt);
    }
  };

  const startUploadSimulation = () => {
    setProcessing(true);
    setCurrentStageIdx(0);
    setUploadProgress(0);
    setUploadDone(false);
    setUploadFailed('');

    let stageIdx = 0;
    let progress = 0;
    const dataTypeLabel = dataTypesRef.current.find(t => t.id === selectedDataTypeRef.current)?.label || '';

    const tick = setInterval(() => {
      const stage = UPLOAD_STAGES[stageIdx];
      progress += Math.random() * 4 + 2;

      if (progress >= stage.progressRange[1]) {
        progress = stage.progressRange[1];
        setUploadProgress(progress);

        // Check for simulated failure at stage boundary
        if (stage.failRate && Math.random() < stage.failRate) {
          clearInterval(tick);
          tickRef.current = null;
          const errorMsg = `校验失败：文件缺少时空属性或不符合${dataTypeLabel}数据规范`;
          setUploadFailed(errorMsg);
          return;
        }

        stageIdx++;
        setCurrentStageIdx(stageIdx);

        if (stageIdx >= UPLOAD_STAGES.length) {
          clearInterval(tick);
          tickRef.current = null;
          setUploadProgress(100);
          setUploadDone(true);
          // Auto close after showing success - use ref to avoid stale closure (React #185)
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            onCloseRef.current();
          }, 1800);
          return;
        }
      } else {
        setUploadProgress(Math.round(progress));
      }
    }, 200);

    tickRef.current = tick;
  };

  const handleConfirm = () => {
    if (!selectedFile) return;

    // Frontend format validation
    const err = validateFileByType(selectedFile, selectedDataType);
    if (err) {
      setFormatError(err);
      return;
    }

    // Call parent to create task, then start simulation
    onUploadFileRef.current?.({
      file: selectedFile,
      dataType: selectedDataType,
      dataName: dataName.trim() || selectedFile.name.replace(/\.[^.]+$/, ''),
      description,
      checkProjection,
    });

    startUploadSimulation();
  };

  const handleCancelUpload = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    onCloseRef.current();
  };

  // Switch data type -> clear file (and any related state) for proper isolation
  const handleDataTypeChange = (newType: string) => {
    if (newType === selectedDataType) return;
    setSelectedDataType(newType);
    setSelectedFile(null);
    setFormatError('');
    // Re-validate the current data name against new type if there's a file
  };

  if (!isOpen) return null;

  // ========== PROCESSING VIEW ==========
  if (processing) {
    const stageIcons = UPLOAD_STAGES.map((stage, idx) => {
      if (idx < currentStageIdx) return 'done';
      if (idx === currentStageIdx && !uploadDone && !uploadFailed) return 'active';
      if (idx === currentStageIdx && uploadFailed) return 'failed';
      return 'pending';
    });

    return (
      <div className="fixed inset-0 flex justify-end z-[200]">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative w-[480px] h-full bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {uploadFailed ? '上传失败' : uploadDone ? '上传完成' : '正在上传'}
            </h2>
            <button
              onClick={handleCancelUpload}
              className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* File info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                    {' · '}
                    {dataTypes.find(t => t.id === selectedDataType)?.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {uploadFailed ? '处理中断' : uploadDone ? '全部完成' : '处理中...'}
                </span>
                <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    uploadFailed ? 'bg-red-500' : uploadDone ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            {/* Stage list */}
            <div className="space-y-3">
              {UPLOAD_STAGES.map((stage, idx) => {
                const icon = stageIcons[idx];
                return (
                  <div
                    key={stage.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      icon === 'active'
                        ? 'border-blue-300 bg-blue-50'
                        : icon === 'done'
                        ? 'border-green-200 bg-green-50/50'
                        : icon === 'failed'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {icon === 'done' && <CheckCircle size={20} className="text-green-500" />}
                      {icon === 'active' && <Loader2 size={20} className="text-blue-600 animate-spin" />}
                      {icon === 'failed' && <AlertCircle size={20} className="text-red-500" />}
                      {icon === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          icon === 'active' ? 'text-blue-700' : icon === 'done' ? 'text-green-700' : icon === 'failed' ? 'text-red-700' : 'text-gray-500'
                        }`}
                      >
                        {stage.label}
                      </p>
                      {idx < UPLOAD_STAGES.length - 1 && icon === 'active' && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          预计还需 {Math.ceil((stage.progressRange[1] - uploadProgress) / 6)} 秒
                        </p>
                      )}
                    </div>
                    {icon === 'done' && (
                      <span className="text-xs text-green-600 font-medium">完成</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error message */}
            {uploadFailed && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{uploadFailed}</p>
              </div>
            )}

            {/* Success message */}
            {uploadDone && (
              <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-center">
                <CheckCircle size={24} className="text-green-500 mx-auto mb-1" />
                <p className="text-sm text-green-700 font-medium">文件上传并校验完成</p>
                <p className="text-xs text-green-600 mt-1">即将自动关闭...</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={handleCancelUpload}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              {uploadDone || uploadFailed ? '关闭' : '取消上传'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== FORM VIEW ==========
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
                onChange={(e) => { setDataName(e.target.value); setUserTouchedName(true); }}
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
                    onClick={() => handleDataTypeChange(type.id)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={24} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
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
                  : formatError
                    ? 'bg-red-50 border-red-300'
                    : selectedFile ? 'bg-green-50 border-green-300' : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <Upload
                size={40}
                className={`mx-auto mb-3 ${
                  isDragging ? 'text-blue-500' : formatError ? 'text-red-500' : selectedFile ? 'text-green-500' : 'text-gray-400'
                }`}
              />
              {selectedFile ? (
                <div>
                  <p className="text-sm text-gray-700 font-medium mb-1">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFormatError(''); }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    移除文件
                  </button>
                </div>
              ) : (
                <div>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={handleFileSelect} />
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
            {formatError && (
              <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{formatError}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入描述"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">投影缺失检查</label>
            <button
              onClick={() => setCheckProjection(!checkProjection)}
              className={`w-12 h-6 rounded-full transition-colors relative ${checkProjection ? 'bg-blue-600' : 'bg-gray-300'}`}
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
              <div className="text-center text-gray-400">暂无数据</div>
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
            disabled={!dataName || !selectedFile || !!formatError}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}