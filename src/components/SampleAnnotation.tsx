import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Image as ImageIcon,
  ChevronLeft,
  Check,
  Square,
  Pentagon,
  CircleDot,
  Trash2,
  Save,
  X,
  Folder,
  CornerUpLeft,
  CornerUpRight,
  MoreVertical,
  Pencil,
} from 'lucide-react';
import {
  AnnotationTask,
  AnnotationItem,
  Label,
  LayerInTask,
  DATA_DIRECTORY,
  DATASET_NAMES,
  COLOR_PALETTE,
  STANDARD_LIBRARY,
  annotationTaskStore,
  labelGroupStore,
  genId,
  nowStr,
  useStore,
} from './modelComputeData';

// ==============================================================
// 样本解译 - 三视图
// 1. 标注项目列表（默认）
// 2. 新建标注项目弹窗
// 3. 标注工作台（点击任务卡片进入）
// ==============================================================

const SampleAnnotation: React.FC = () => {
  const tasks = useStore(annotationTaskStore);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [completePromptOpen, setCompletePromptOpen] = useState(false);
  // 卡片三点菜单
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // 编辑任务弹窗
  const [editTask, setEditTask] = useState<AnnotationTask | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭三点菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [tasks, searchQuery],
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // ---------- 任务列表视图 ----------
  if (activeTask) {
    return (
      <AnnotationWorkbench
        task={activeTask}
        onBack={() => setActiveTaskId(null)}
        onRequestComplete={() => setCompletePromptOpen(true)}
      />
    );
  }

  return (
    <div className="h-full bg-gray-50 p-4 flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="输入标注项目名称搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          <Plus size={16} />
          <span>新建标注项目</span>
        </button>
      </div>

      {/* 任务卡片网格 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredTasks.map((task) => {
            const annotatedCount = task.layers.filter((l) => l.annotated)
              .length;
            const total = task.layers.length;
            const percent =
              total === 0 ? 0 : Math.round((annotatedCount / total) * 100);
            return (
              <div
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className="bg-white border border-gray-200 rounded-md p-2.5 cursor-pointer transition-all hover:shadow-md hover:border-blue-500 relative"
              >
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-2 flex items-center justify-center">
                  <ImageIcon size={40} className="text-blue-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-800 truncate pr-6">
                    {task.name}
                  </span>
                  {/* 三点菜单按钮 - 阻止冒泡 */}
                  <div
                    className="relative"
                    ref={openMenuId === task.id ? menuRef : undefined}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === task.id ? null : task.id)
                      }
                      className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                      title="更多操作"
                    >
                      <MoreVertical size={14} />
                    </button>
                    {openMenuId === task.id && (
                      <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 w-24">
                        <button
                          onClick={() => {
                            setEditTask(task);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil size={12} /> 编辑
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确定删除任务「${task.name}」？`)) {
                              annotationTaskStore.set((prev) =>
                                prev.filter((t) => t.id !== task.id),
                              );
                            }
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={12} /> 删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded ${
                      task.status === '已完成'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                  <Folder size={10} />
                  <span className="truncate">{task.datasetName}</span>
                  <span className="mx-1">·</span>
                  <span className="flex-shrink-0">
                    {annotatedCount}/{total}
                  </span>
                </div>
                <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 mt-1.5">
                  {task.createdAt}
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="col-span-full bg-white border border-dashed border-gray-300 rounded-lg py-16 flex flex-col items-center text-gray-400 text-sm">
              <ImageIcon size={40} className="mb-3" />
              暂无标注项目，点击右上角新建
            </div>
          )}
        </div>
      </div>

      {/* 新建任务弹窗 */}
      {createOpen && (
        <TaskFormModal
          onClose={() => setCreateOpen(false)}
          onSubmit={(task) => {
            annotationTaskStore.set((prev) => [task, ...prev]);
            setCreateOpen(false);
          }}
        />
      )}

      {/* 编辑任务弹窗 */}
      {editTask && (
        <TaskFormModal
          mode="edit"
          initial={editTask}
          onClose={() => setEditTask(null)}
          onSubmit={(task) => {
            annotationTaskStore.set((prev) =>
              prev.map((t) =>
                t.id === editTask.id ? { ...task, id: t.id, layers: t.layers, labels: t.labels, createdAt: t.createdAt, status: t.status } : t,
              ),
            );
            setEditTask(null);
          }}
        />
      )}

      {/* 完成任务确认弹窗 */}
      {completePromptOpen && (
        <CompleteTaskModal
          task={tasks.find((t) => t.id === activeTaskId)!}
          onClose={() => setCompletePromptOpen(false)}
          onConfirm={() => {
            annotationTaskStore.set((prev) =>
              prev.map((t) =>
                t.id === activeTaskId
                  ? {
                      ...t,
                      status: '已完成',
                      layers: t.layers.map((l) => ({ ...l, annotated: true })),
                    }
                  : t,
              ),
            );
            setCompletePromptOpen(false);
            setActiveTaskId(null);
          }}
        />
      )}
    </div>
  );
};

export default SampleAnnotation;

// ==============================================================
// 标注项目表单弹窗（支持新建 / 编辑两种模式）
// ==============================================================

interface TaskFormModalProps {
  mode?: 'create' | 'edit';
  initial?: AnnotationTask;
  onClose: () => void;
  onSubmit: (task: AnnotationTask) => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  mode = 'create',
  initial,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initial?.name || '');
  // 多级选择：选中的标准库文件夹路径（用 DataCatalogEntry.id 表示）
  const [folderId, setFolderId] = useState<string>(() => {
    if (!initial) return STANDARD_LIBRARY[0].id;
    const found = findEntryByName(STANDARD_LIBRARY, initial.datasetName);
    return found ? found.id : STANDARD_LIBRARY[0].id;
  });
  const [description, setDescription] = useState(initial?.description || '');

  // 推导当前选中的文件夹与它的所有文件
  const currentFolder =
    findEntryById(STANDARD_LIBRARY, folderId) || {
      ...STANDARD_LIBRARY[0],
      fullPath: STANDARD_LIBRARY[0].name,
    };
  const currentFolderFiles = flattenFiles(currentFolder);
  const datasetName = currentFolder.name;

  const handleConfirm = () => {
    if (!name.trim()) {
      alert('请输入标注项目名称');
      return;
    }
    // 编辑模式下，如果数据集有变化，则同步更新图层列表
    const layers: LayerInTask[] =
      mode === 'edit' && initial && datasetName === initial.datasetName
        ? initial.layers
        : currentFolderFiles.map((f) => ({
            id: genId(),
            name: f.name,
            annotated: false,
            annotations: [],
          }));
    const task: AnnotationTask = {
      id: initial?.id || genId(),
      name: name.trim(),
      datasetName,
      description: description.trim() || undefined,
      createdAt: initial?.createdAt || nowStr(),
      status: initial?.status || '进行中',
      layers,
      labels: initial?.labels || [],
    };
    onSubmit(task);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[640px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-800">
            {mode === 'edit' ? '编辑标注项目' : '新建标注项目'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：城区建筑物轮廓标注"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              数据集 <span className="text-red-500">*</span>
            </label>
            {/* 多级文件夹选择器：左树 + 右数据集预览 */}
            <div className="border border-gray-200 rounded overflow-hidden flex h-56">
              {/* 左：多级文件夹树 */}
              <div className="w-1/2 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                <div className="px-2 py-1.5 text-[11px] text-gray-500 border-b border-gray-200 bg-white">
                  数据管理 / 数据目录 / 标准库
                </div>
                <FolderTree
                  entries={STANDARD_LIBRARY}
                  selectedId={folderId}
                  onSelect={setFolderId}
                />
              </div>
              {/* 右：当前选中文件夹的文件列表 */}
              <div className="w-1/2 bg-white overflow-y-auto">
                <div className="px-2 py-1.5 text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50">
                  当前数据集：{currentFolder.fullPath}
                </div>
                <div className="p-2 space-y-1">
                  {currentFolder.files.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-6">
                      该文件夹下暂无文件
                    </div>
                  ) : (
                    currentFolder.files.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-50 text-xs text-gray-700"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="truncate" title={f}>
                          {f}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="mt-1.5 text-xs text-gray-400">
              数据来源：<span className="text-blue-600">数据管理 / 数据目录 / 标准库 / {currentFolder.fullPath}</span> · 共 {currentFolderFiles.length} 个图层
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="描述该标注项目的目标和注意事项"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {mode === 'edit' ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 多级文件夹树形组件 ====================
interface FolderTreeProps {
  entries: import('./modelComputeData').DataCatalogEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
  level?: number;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  entries,
  selectedId,
  onSelect,
  level = 0,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // 默认展开第一个分支，方便查看多级
    const init: Record<string, boolean> = {};
    if (entries.length > 0) {
      // 一级全部展开
      entries.forEach((e) => {
        init[e.id] = true;
      });
    }
    return init;
  });

  return (
    <div>
      {entries.map((e) => {
        const isOpen = expanded[e.id] ?? true;
        const isSelected = e.id === selectedId;
        const hasChildren = e.children.length > 0;
        return (
          <div key={e.id}>
            <div
              onClick={() => onSelect(e.id)}
              className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-xs hover:bg-white ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700'
              }`}
              style={{ paddingLeft: 6 + level * 14 }}
            >
              {hasChildren ? (
                <span
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setExpanded((prev) => ({
                      ...prev,
                      [e.id]: !(prev[e.id] ?? true),
                    }));
                  }}
                  className="text-gray-400 hover:text-gray-700 w-3 flex-shrink-0"
                >
                  {isOpen ? '▾' : '▸'}
                </span>
              ) : (
                <span className="w-3 flex-shrink-0" />
              )}
              <span className="flex-shrink-0 text-[11px]">📁</span>
              <span className="truncate">{e.name}</span>
              {e.files.length > 0 && (
                <span className="text-[10px] text-gray-400 ml-auto">
                  {e.files.length}
                </span>
              )}
            </div>
            {hasChildren && isOpen && (
              <FolderTree
                entries={e.children}
                selectedId={selectedId}
                onSelect={onSelect}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ==================== 辅助：按 id 找目录项并附 fullPath ====================
type FolderEntryWithPath = import('./modelComputeData').DataCatalogEntry & {
  fullPath: string;
};

const findEntryById = (
  entries: import('./modelComputeData').DataCatalogEntry[],
  id: string,
  parentPath = '',
): FolderEntryWithPath | null => {
  for (const e of entries) {
    const here = parentPath ? `${parentPath}/${e.name}` : e.name;
    if (e.id === id) return { ...e, fullPath: here };
    const found = findEntryById(e.children, id, here);
    if (found) return found;
  }
  return null;
};

const findEntryByName = (
  entries: import('./modelComputeData').DataCatalogEntry[],
  name: string,
): import('./modelComputeData').DataCatalogEntry | null => {
  for (const e of entries) {
    if (e.name === name) return e;
    const found = findEntryByName(e.children, name);
    if (found) return found;
  }
  return null;
};

const flattenFiles = (
  entry: import('./modelComputeData').DataCatalogEntry,
): import('./modelComputeData').DataFileNode[] => {
  const acc: import('./modelComputeData').DataFileNode[] = [];
  const walk = (e: import('./modelComputeData').DataCatalogEntry, p: string) => {
    const here = p ? `${p}/${e.name}` : e.name;
    for (const f of e.files) acc.push({ path: `${here}/${f}`, name: f });
    for (const c of e.children) walk(c, here);
  };
  walk(entry, '');
  return acc;
};

// ==============================================================
// 完成任务确认弹窗
// ==============================================================

interface CompleteTaskModalProps {
  task: AnnotationTask;
  onClose: () => void;
  onConfirm: () => void;
}

const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  task,
  onClose,
  onConfirm,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-[400px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-800">完成当前项目</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <div className="px-5 py-4 text-sm text-gray-700">
        确认将项目「<span className="text-blue-600 font-medium">{task.name}</span>
        」标记为已完成？标记后仍可随时进入继续编辑。
      </div>
      <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          确认完成
        </button>
      </div>
    </div>
  </div>
);

// ==============================================================
// 标注工作台 - 三视图之三（核心）
// 交互流程：选择工具 → 选择标签 → 在画布上点击/拖拽创建标注
// 标注框保存在 task.layers[].annotations（通过 annotationTaskStore 持久化）
// ==============================================================

interface AnnotationWorkbenchProps {
  task: AnnotationTask;
  onBack: () => void;
  onRequestComplete: () => void;
}

const AnnotationWorkbench: React.FC<AnnotationWorkbenchProps> = ({
  task,
  onBack,
  onRequestComplete,
}) => {
  const labelGroups = useStore(labelGroupStore);
  // 展平为「子标签」列表，数据来源于标签管理页面的全局分组
  const availableLabels: Label[] = React.useMemo(
    () =>
      labelGroups.flatMap((g) =>
        g.children.map((c) => ({
          id: c.id,
          name: `${g.name}/${c.name}`,
          color: c.color,
        })),
      ),
    [labelGroups],
  );

  const [currentLayerIdx, setCurrentLayerIdx] = useState(0);
  const [activeTool, setActiveTool] = useState<'box' | 'polygon' | null>(
    null,
  );
  const [savedTip, setSavedTip] = useState(false);

  // ---- 标注流程状态 ----
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(
    availableLabels[0]?.id || null,
  );
  // 本地工作副本（从 task.layers[].annotations 读取已有标注）
  const [annotationsByLayer, setAnnotationsByLayer] = useState<
    Record<string, AnnotationItem[]>
  >(() => {
    const init: Record<string, AnnotationItem[]> = {};
    task.layers.forEach((l) => {
      init[l.id] = l.annotations ? [...l.annotations] : [];
    });
    return init;
  });
  // 每个标签的计数：从已有标注中推算（保证"建筑物1"这种序号不重复）
  const [labelCounter, setLabelCounter] = useState<Record<string, number>>(
    () => {
      const c: Record<string, number> = {};
      availableLabels.forEach((l) => {
        c[l.id] = 0;
      });
      // 从已有标注的 displayName 后缀提取最大序号
      task.layers.forEach((layer) => {
        (layer.annotations || []).forEach((a) => {
          const match = a.displayName.match(/(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            c[a.labelId] = Math.max(c[a.labelId] || 0, num);
          }
        });
      });
      return c;
    },
  );
  // 框选模式中：起点（起点按下的百分比位置）
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // 框选过程中当前位置（用于预览框）
  const [dragCurrent, setDragCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const layers = task.layers;
  const currentLayer = layers[currentLayerIdx];
  const currentAnnotations =
    annotationsByLayer[currentLayer?.id || '__none__'] || [];
  const annotatedCount = layers.filter(
    (l) => (annotationsByLayer[l.id] || []).length > 0,
  ).length;
  const total = layers.length;
  const allAnnotated = annotatedCount === total && total > 0;

  const gotoLayer = (idx: number) => {
    if (idx < 0 || idx >= layers.length) return;
    // 切到下一张/上一张前，先保存当前图层的标注内容（保证显示对勾）
    const layerId = layers[currentLayerIdx]?.id;
    if (layerId) {
      const anns = annotationsByLayer[layerId] || [];
      annotationTaskStore.set((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                layers: t.layers.map((l) =>
                  l.id === layerId
                    ? { ...l, annotated: anns.length > 0, annotations: anns }
                    : l,
                ),
              }
            : t,
        ),
      );
    }
    setCurrentLayerIdx(idx);
  };

  // 保存当前图层的标注框到 Store（供样本管理页面使用）
  const handleSave = () => {
    const layerId = currentLayer?.id;
    if (!layerId) return;
    const anns = annotationsByLayer[layerId] || [];
    annotationTaskStore.set((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              layers: t.layers.map((l) =>
                l.id === layerId
                  ? { ...l, annotated: anns.length > 0, annotations: anns }
                  : l,
              ),
            }
          : t,
      ),
    );
    setSavedTip(true);
    setTimeout(() => setSavedTip(false), 1200);
  };

  // ---- 标注流程工具函数 ----
  const handleToolSelect = (tool: 'box' | 'polygon') => {
    setActiveTool(activeTool === tool ? null : tool);
  };

  // 把鼠标事件转成百分比坐标
  const toPercent = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || !selectedLabelId) return;
    const pos = toPercent(e);
    setDragStart(pos);
    setDragCurrent(pos);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setDragCurrent(toPercent(e));
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart || !activeTool || !selectedLabelId) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    const endPos = toPercent(e);
    const x = Math.min(dragStart.x, endPos.x);
    const y = Math.min(dragStart.y, endPos.y);
    const w = Math.abs(endPos.x - dragStart.x);
    const h = Math.abs(endPos.y - dragStart.y);

    // 太小的拖拽视为无效（防止误触）
    if (w < 2 || h < 2) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const label = availableLabels.find((l) => l.id === selectedLabelId);
    if (!label) return;

    // 生成序号
    const nextNum = (labelCounter[selectedLabelId] || 0) + 1;
    const newItem: AnnotationItem = {
      id: genId(),
      labelId: selectedLabelId,
      labelName: label.name,
      color: label.color,
      displayName: `${label.name}${nextNum}`,
      xPercent: x,
      yPercent: y,
      wPercent: w,
      hPercent: h,
    };

    const layerId = currentLayer?.id || '';
    setAnnotationsByLayer((prev) => ({
      ...prev,
      [layerId]: [...(prev[layerId] || []), newItem],
    }));
    setLabelCounter((prev) => ({
      ...prev,
      [selectedLabelId]: nextNum,
    }));

    setDragStart(null);
    setDragCurrent(null);
  };

  // 删除单个标注
  const deleteAnnotation = (annotationId: string) => {
    const layerId = currentLayer?.id || '';
    setAnnotationsByLayer((prev) => ({
      ...prev,
      [layerId]: (prev[layerId] || []).filter((a) => a.id !== annotationId),
    }));
  };

  // 清除当前图层所有标注
  const clearAnnotations = () => {
    const layerId = currentLayer?.id || '';
    setAnnotationsByLayer((prev) => ({ ...prev, [layerId]: [] }));
  };

  // 鼠标光标状态：有工具+标签时变为十字
  const isDrawing = activeTool && selectedLabelId;
  const cursorClass = isDrawing
    ? dragStart
      ? 'cursor-crosshair'
      : 'cursor-crosshair'
    : 'cursor-default';

  // 工具按钮状态指示文案
  const hintText = !activeTool
    ? '请先在右上方选择标注工具'
    : !selectedLabelId
      ? '请选择一个标签'
      : dragStart
        ? `松开鼠标完成「${availableLabels.find((l) => l.id === selectedLabelId)?.name}」标注`
        : `工具：${activeTool === 'box' ? '框选' : '多边形'} · 在画布上按下鼠标并拖拽绘制`;

  // 计算正在拖拽的预览框位置
  const previewBox =
    dragStart && dragCurrent
      ? {
          x: Math.min(dragStart.x, dragCurrent.x),
          y: Math.min(dragStart.y, dragCurrent.y),
          w: Math.abs(dragCurrent.x - dragStart.x),
          h: Math.abs(dragCurrent.y - dragStart.y),
        }
      : null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部信息栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
          >
            <ChevronLeft size={18} />
            <span>返回任务列表</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-800">{task.name}</span>
          <span className="text-xs text-gray-500">（{task.datasetName}）</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            进度：
            <span className="font-medium text-gray-800">
              {annotatedCount}/{total}
            </span>
            （第 {currentLayerIdx + 1} 张）
          </div>
          {savedTip && (
            <span className="text-xs text-green-600">已保存 ✓</span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onRequestComplete}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              完成当前项目
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              <Save size={14} />
              <span>保存当前图层</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主体 3 栏布局 */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* 左侧图层列表 - 紧凑 */}
        <div className="w-40 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-2.5 border-b border-gray-200 text-sm font-medium text-gray-800 flex items-center justify-between">
            <span>图层列表</span>
            <span className="text-xs text-gray-500">{total} 张</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {layers.map((layer, idx) => {
              const isCurrent = idx === currentLayerIdx;
              const count = (annotationsByLayer[layer.id] || []).length;
              return (
                <button
                  key={layer.id}
                  onClick={() => gotoLayer(idx)}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between border-b border-gray-100 transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50 text-gray-700 border-l-4 border-l-transparent'
                  }`}
                >
                  <span className="truncate pr-2">
                    <span className="text-gray-400 mr-1.5">#{idx + 1}</span>
                    {layer.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {count > 0 && (
                      <span className="text-[10px] text-gray-500">
                        {count}个
                      </span>
                    )}
                    {(layer.annotated || count > 0) && (
                      <Check size={12} className="text-green-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 中央画布区 - 大幅放大 */}
        <div className="flex-1 flex items-stretch p-6 min-w-0">
          <div
            className={`w-full h-full bg-white border border-gray-200 rounded-lg relative overflow-hidden shadow-sm select-none ${cursorClass}`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={() => {
              if (dragStart) {
                setDragStart(null);
                setDragCurrent(null);
              }
            }}
          >
            {/* 网格背景 */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #e5e7eb, #e5e7eb 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #e5e7eb, #e5e7eb 1px, transparent 1px, transparent 60px)',
              }}
            />

            {/* 图层名称 */}
            <div className="absolute top-3 left-4 z-20 bg-white bg-opacity-90 px-2.5 py-1 rounded border border-gray-200 text-xs text-gray-600">
              {currentLayer?.name}
            </div>

            {/* 已完成标记 */}
            {currentAnnotations.length > 0 && (
              <div className="absolute top-3 right-4 z-20 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded">
                已标注 {currentAnnotations.length} 个 ✓
              </div>
            )}

            {/* 已有的标注框 */}
            {currentAnnotations.map((a) => (
              <div
                key={a.id}
                className="absolute rounded border-2 z-10 group"
                style={{
                  left: `${a.xPercent}%`,
                  top: `${a.yPercent}%`,
                  width: `${a.wPercent}%`,
                  height: `${a.hPercent}%`,
                  borderColor: a.color,
                  backgroundColor: `${a.color}22`,
                }}
              >
                <div
                  className="absolute -top-5 left-0 text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: a.color }}
                >
                  {a.displayName}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAnnotation(a.id);
                  }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border border-gray-300 rounded-full text-[10px] text-gray-500 hover:text-red-500 hover:border-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  ×
                </button>
              </div>
            ))}

            {/* 正在拖拽中的预览框 */}
            {previewBox && selectedLabelId && (
              <div
                className="absolute border-2 border-dashed z-20 pointer-events-none"
                style={{
                  left: `${previewBox.x}%`,
                  top: `${previewBox.y}%`,
                  width: `${previewBox.w}%`,
                  height: `${previewBox.h}%`,
                  borderColor:
                    availableLabels.find((l) => l.id === selectedLabelId)
                      ?.color || '#3B82F6',
                  backgroundColor: `${
                    availableLabels.find((l) => l.id === selectedLabelId)
                      ?.color || '#3B82F6'
                  }22`,
                }}
              />
            )}

            {/* 中心提示（只有在图层无标注且未拖拽时显示） */}
            {currentAnnotations.length === 0 && !dragStart && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <ImageIcon size={140} className="text-gray-300" />
                <div className="mt-6 text-base text-gray-600 font-medium">
                  当前图层：
                  <span className="text-gray-800">{currentLayer?.name}</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">{hintText}</div>
                {isDrawing && (
                  <div className="mt-4 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded border border-purple-200 font-medium">
                    就绪：按下鼠标并拖拽绘制
                  </div>
                )}
              </div>
            )}

            {/* 状态提示条（底部） */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white bg-opacity-95 px-3 py-1.5 rounded border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              {isDrawing ? (
                <>
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{
                      backgroundColor:
                        availableLabels.find((l) => l.id === selectedLabelId)
                          ?.color || '#ccc',
                    }}
                  />
                  <span className="text-gray-700">
                    {availableLabels.find((l) => l.id === selectedLabelId)?.name}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span>{activeTool === 'box' ? '框选工具' : '多边形工具'}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">拖拽鼠标绘制标注区域</span>
                </>
              ) : (
                <span className="text-gray-400">
                  提示：先选工具，再选标签，最后在画布中框选
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧操作栏 - 紧凑 */}
        <div className="w-48 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* 段 1：标注工具 - 更方正的按钮 */}
          <div className="border-b border-gray-200">
            <div className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-50">
              标注工具
            </div>
            <div className="px-3 py-3 grid grid-cols-3 gap-2">
              <ToolButton
                active={activeTool === 'box'}
                onClick={() => handleToolSelect('box')}
                icon={<Square size={16} />}
                label="矩形"
              />
              <ToolButton
                active={activeTool === 'polygon'}
                onClick={() => handleToolSelect('polygon')}
                icon={<Pentagon size={16} />}
                label="多边形"
              />
              <ToolButton
                active={false}
                onClick={clearAnnotations}
                icon={<Trash2 size={16} />}
                label="清除"
                danger
              />
            </div>
          </div>

          {/* 段 2：标签选择 - 只读自标签管理页面 */}
          <div className="border-b border-gray-200 flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-50 flex items-center justify-between">
              <span>标签选择</span>
              <span className="text-gray-500">{availableLabels.length} 个</span>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              {availableLabels.length === 0 && (
                <div className="text-xs text-gray-400 py-2 text-center">
                  暂无标签，请到「标签管理」页面配置
                </div>
              )}
              {availableLabels.map((lb) => {
                const isSelected = selectedLabelId === lb.id;
                const count = labelCounter[lb.id] || 0;
                return (
                  <div
                    key={lb.id}
                    onClick={() => setSelectedLabelId(lb.id)}
                    className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-purple-400 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: lb.color }}
                    />
                    <span className="text-xs text-gray-700 flex-1 truncate">
                      {lb.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {count > 0 ? `${count}个` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 段 3：图层切换 */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => gotoLayer(currentLayerIdx - 1)}
                disabled={currentLayerIdx === 0}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border border-gray-300 text-xs text-gray-700 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CornerUpLeft size={12} /> 上一张
              </button>
              <button
                onClick={() => gotoLayer(currentLayerIdx + 1)}
                disabled={currentLayerIdx >= layers.length - 1}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                下一张 <CornerUpRight size={12} />
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              第 {currentLayerIdx + 1} / {layers.length} 张
            </div>
            {currentLayerIdx === layers.length - 1 && allAnnotated && (
              <button
                onClick={onRequestComplete}
                className="w-full mt-2 px-2 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                完成当前项目
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================
// 工具按钮 - 小组件
// ==============================================================

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  danger,
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 px-1.5 py-2 border rounded-md text-xs transition-all min-h-[56px] ${
      active
        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
        : danger
          ? 'bg-white text-red-500 border-gray-300 hover:border-red-300 hover:shadow-sm'
          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-sm'
    }`}
  >
    {icon}
    <span className="text-[11px] leading-none">{label}</span>
  </button>
);


