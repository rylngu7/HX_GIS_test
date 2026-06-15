import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  Image as ImageIcon,
  ChevronLeft,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  X,
  Folder,
  Tag,
  Inbox,
  Download,
  Pipette,
} from 'lucide-react';
import {
  SampleCategory,
  SampleItem,
  AnnotationTask,
  COLOR_PALETTE,
  annotationTaskStore,
  sampleCategoryStore,
  genId,
  nowStr,
  useStore,
} from './modelComputeData';
import ColorPickerModal from './ColorPickerModal';

// ==============================================================
// 样本管理
// 1. 样本类别列表（默认）：带多选，支持编辑/删除/导出
// 2. 类别详情页：展示已关联的样本切片
// 3. 新增/编辑弹窗：带自动纳入同名标签、手动新增路径(数据集-图层-标签)
// 4. 导出功能：导出为 JSON + 模拟图层原图下载
// ==============================================================

const SampleManagement: React.FC = () => {
  const categories = useStore(sampleCategoryStore);
  const tasks = useStore(annotationTaskStore);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [categoryModal, setCategoryModal] = useState<
    | { mode: 'create'; initial?: SampleCategory }
    | { mode: 'edit'; initial: SampleCategory }
    | null
  >(null);

  // 多选状态
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );

  // 导出反馈（避免使用 alert 导致 React 18 StrictMode 渲染报错）
  const [exportMsg, setExportMsg] = useState<string>('');

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [categories, searchQuery],
  );

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || null;

  // 切换多选
  const toggleSelect = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCategoryIds.size === filteredCategories.length) {
      setSelectedCategoryIds(new Set());
    } else {
      setSelectedCategoryIds(new Set(filteredCategories.map((c) => c.id)));
    }
  };

  // ============ 安全导出（避免 alert/setTimeout 导致 React 18 StrictMode 报错） ============
  const safeExport = (
    categoriesToExport: SampleCategory[],
  ) => {
    if (categoriesToExport.length === 0) {
      setExportMsg('请至少选择一个样本类别');
      return;
    }

    const rows: { 原始图: string; 切片名称: string; '标注信息（json格式）': string }[] = [];
    for (const c of categoriesToExport) {
      for (const s of c.samples) {
        const annotationJson = JSON.stringify({
          category: c.name,
          categoryColor: c.color,
          sampleName: s.name,
          task: s.fromTask,
          dataset: s.fromTask,
          layer: s.fromLayer,
          label: s.fromLabel,
          extractedAt: s.extractedAt,
          annotations: [
            {
              type: 'bbox',
              label: s.fromLabel,
              color: c.color,
            },
          ],
        });
        rows.push({
          原始图: `${s.fromTask}/${s.fromLayer}`,
          切片名称: s.name || s.fromLabel,
          '标注信息（json格式）': annotationJson,
        });
      }
    }

    if (rows.length === 0) {
      setExportMsg('所选类别中没有样本切片，无法导出');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 40 }, { wch: 16 }, { wch: 80 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '样本导出');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      XLSX.writeFile(wb, `样本导出_${categoriesToExport.length}个类别_${ts}.xlsx`);
      setExportMsg(`✓ 导出成功：共 ${rows.length} 个样本切片`);
      // 清除选中
      setSelectedCategoryIds(new Set());
    } catch (e) {
      setExportMsg('导出失败，请重试');
    }
  };

  // 5秒后自动清除提示
  React.useEffect(() => {
    if (!exportMsg) return;
    const t = window.setTimeout(() => setExportMsg(''), 5000);
    return () => window.clearTimeout(t);
  }, [exportMsg]);

  // 详情视图
  if (activeCategory) {
    return (
      <CategoryDetailView
        category={activeCategory}
        onBack={() => setActiveCategoryId(null)}
        tasks={tasks}
      />
    );
  }

  return (
    <div className="h-full bg-gray-50 p-4 flex flex-col relative">
      {/* 导出反馈 toast */}
      {exportMsg && (
        <div className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white text-sm rounded shadow-lg shadow-blue-200/50">
          {exportMsg}
        </div>
      )}
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="输入样本类别名称搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {selectedCategoryIds.size > 0 && (
            <span className="text-xs text-gray-500">
              已选 {selectedCategoryIds.size} 个
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedCategoryIds.size > 0 && (
            <button
              onClick={() =>
                safeExport(
                  categories.filter((c) =>
                    selectedCategoryIds.has(c.id),
                  ),
                )
              }
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            >
              <Download size={14} />
              导出所选
            </button>
          )}
          <button
            onClick={() =>
              setCategoryModal({ mode: 'create' })
            }
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
          >
            <Plus size={16} />
            <span>新增样本类别</span>
          </button>
        </div>
      </div>

      {/* 主体：表格 */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left w-10">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-gray-700"
                >
                  {selectedCategoryIds.size ===
                    filteredCategories.length &&
                  filteredCategories.length > 0 ? (
                    <CheckSquare size={16} className="text-purple-600" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">
                样本类别
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-24">
                样本数
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-44">
                最后更新时间
                </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-72">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-gray-400"
                >
                  <Inbox size={40} className="mx-auto mb-3 text-gray-300" />
                  <div className="text-sm">
                    暂无样本类别，点击右上角「新增样本类别」创建
                  </div>
                </td>
              </tr>
            )}
            {filteredCategories.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleSelect(c.id)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    {selectedCategoryIds.has(c.id) ? (
                      <CheckSquare
                        size={16}
                        className="text-purple-600"
                      />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => setActiveCategoryId(c.id)}
                    className="text-purple-600 hover:underline font-medium flex items-center gap-2"
                  >
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </button>
                  {c.description && (
                    <div className="text-xs text-gray-400 mt-1 ml-5">
                      {c.description}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  {c.samples.length}
                </td>
                <td className="py-3 px-4 text-center text-gray-600 text-xs">
                  {c.updatedAt}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <button
                      onClick={() =>
                        setCategoryModal({ mode: 'edit', initial: c })
                      }
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Edit2 size={12} /> 编辑
                    </button>
                    <button
                      onClick={() =>
                        safeExport([c])
                      }
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Download size={12} /> 导出
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定删除类别「${c.name}」？`)) {
                          sampleCategoryStore.set((prev) =>
                            prev.filter((x) => x.id !== c.id),
                          );
                          setSelectedCategoryIds((prev) => {
                            const next = new Set(prev);
                            next.delete(c.id);
                            return next;
                          });
                        }
                      }}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> 删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑弹窗 */}
      {categoryModal && (
        <CategoryFormModal
          mode={categoryModal.mode}
          initial={categoryModal.initial}
          tasks={tasks}
          onClose={() => setCategoryModal(null)}
          onSubmit={(data) => {
            if (categoryModal.mode === 'create') {
              const newCategory: SampleCategory = {
                id: genId(),
                name: data.name,
                color: data.color,
                description: data.description || undefined,
                updatedAt: nowStr(),
                samples: data.samples || [],
              };
              sampleCategoryStore.set((prev) => [newCategory, ...prev]);
            } else {
              sampleCategoryStore.set((prev) =>
                prev.map((x) =>
                  x.id === categoryModal.initial.id
                    ? {
                        ...x,
                        name: data.name,
                        color: data.color,
                        description: data.description || undefined,
                        samples: data.samples || x.samples,
                        updatedAt: nowStr(),
                      }
                    : x,
                ),
              );
            }
            setCategoryModal(null);
          }}
        />
      )}
    </div>
  );
};

export default SampleManagement;

// ==============================================================
// 类别详情视图
// ==============================================================

interface CategoryDetailViewProps {
  category: SampleCategory;
  onBack: () => void;
  tasks: AnnotationTask[];
}

const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  onBack,
  tasks,
}) => {
  const liveCategory = useStore(sampleCategoryStore).find(
    (c) => c.id === category.id,
  );
  const display = liveCategory || category;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* 顶部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
        >
          <ChevronLeft size={18} />
          <span>返回列表</span>
        </button>
        <span className="text-gray-300">|</span>
        <span
          className="inline-block w-4 h-4 rounded"
          style={{ backgroundColor: display.color }}
        />
        <span className="text-sm font-semibold text-gray-800">
          {display.name}
        </span>
        <span className="text-xs text-gray-500">
          · 共 {display.samples.length} 个样本切片
        </span>
        <div className="flex-1" />
        <button
          onClick={() => {
            // 自动纳入：扫描所有标注任务，查找同名标签
            // 匹配规则：label.name === category.name（不区分大小写）
            // 每个符合条件的标注框都作为一个独立的样本切片
            const targetName = display.name.toLowerCase();
            const existingKeys = new Set(
              display.samples.map(
                (s) => `${s.fromTask}|${s.fromLayer}|${s.fromLabel}|${s.name}`,
              ),
            );
            const newItems: SampleItem[] = [];
            for (const task of tasks) {
              for (const label of task.labels) {
                if (label.name.toLowerCase() === targetName) {
                  for (const layer of task.layers) {
                    const anns = layer.annotations || [];
                    if (anns.length === 0) continue;
                    for (const a of anns) {
                      if (a.labelId !== label.id) continue;
                      const key = `${task.name}|${layer.name}|${label.name}|${a.displayName}`;
                      if (!existingKeys.has(key)) {
                        existingKeys.add(key);
                        newItems.push({
                          id: genId(),
                          name: a.displayName,
                          fromTask: task.name,
                          fromLayer: layer.name,
                          fromLabel: label.name,
                          extractedAt: nowStr(),
                        });
                      }
                    }
                  }
                }
              }
            }
            if (newItems.length === 0) {
              alert('未发现已完成框选的同名标签（请先在「样本解译」中完成标注并保存当前图层）');
              return;
            }
            if (
              !confirm(
                `发现 ${newItems.length} 个匹配的标注框，确认全部纳入到「${display.name}」类别？`,
              )
            ) {
              return;
            }
            sampleCategoryStore.set((prev) =>
              prev.map((c) =>
                c.id === display.id
                  ? {
                      ...c,
                      samples: [...newItems, ...c.samples],
                      updatedAt: nowStr(),
                    }
                  : c,
              ),
            );
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
        >
          <Plus size={12} />
          自动纳入同名标签
        </button>
        <button
          onClick={() => {
            // 触发提示：可通过"编辑"弹窗手动添加
            alert('请点击下方样本卡片区域右上角的「手动添加」，或通过「编辑」弹窗来手动按数据集-图层-标签路径新增。');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
        >
          <Plus size={12} />
          从标注任务导入
        </button>
      </div>

      {/* 样本切片网格 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {display.samples.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <ImageIcon size={60} className="mb-3 text-gray-300" />
            <div className="text-sm mb-1">该类别下暂无样本切片</div>
            <div className="text-xs">
              可通过「自动纳入同名标签」或「从标注任务导入」来添加
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {display.samples.map((s) => (
              <div
                key={s.id}
                className="relative bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <ImageIcon size={40} className="text-gray-400" />
                  <span
                    className="absolute top-2 left-2 text-[10px] text-white px-2 py-0.5 rounded"
                    style={{ backgroundColor: display.color }}
                  >
                    {s.fromLabel}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('确定删除该样本切片？')) {
                        sampleCategoryStore.set((prev) =>
                          prev.map((c) =>
                            c.id === display.id
                              ? {
                                  ...c,
                                  samples: c.samples.filter(
                                    (x) => x.id !== s.id,
                                  ),
                                  updatedAt: nowStr(),
                                }
                              : c,
                          ),
                        );
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded shadow-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="p-2.5 text-xs text-gray-700">
                  {/* 切片名称（区分同数据集同图层同标签的不同标注框） */}
                  <div className="font-medium text-gray-800 text-sm truncate mb-1" title={s.name || `${s.fromLabel}切片`}>
                    {s.name || `${s.fromLabel}切片`}
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Folder size={11} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate" title={s.fromTask}>
                      {s.fromTask}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-gray-500 truncate">
                    <span className="flex-shrink-0">图层:</span>
                    <span className="truncate" title={s.fromLayer}>
                      {s.fromLayer}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-400 text-[11px]">
                    {s.extractedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================================================
// 新增/编辑样本类别弹窗
// 编辑模式下：
// - 展示已关联样本列表（可单个删除）
// - 提供"自动纳入同名标签"按钮
// - 提供"手动新增"按数据集→图层→标签路径添加
// ==============================================================

interface CategoryFormModalProps {
  mode: 'create' | 'edit';
  initial?: SampleCategory;
  tasks: AnnotationTask[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    color: string;
    description: string;
    samples?: SampleItem[];
  }) => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  mode,
  initial,
  tasks,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.color || COLOR_PALETTE[0]);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [description, setDescription] = useState(initial?.description || '');
  // 可编辑的样本列表（只在编辑模式用到）
  const [samplesDraft, setSamplesDraft] = useState<SampleItem[]>(
    initial?.samples || [],
  );

  // 手动新增弹窗的三级选择状态
  const [manualDialog, setManualDialog] = useState(false);
  const [selTaskId, setSelTaskId] = useState<string>(tasks[0]?.id || '');
  const [selLayer, setSelLayer] = useState<string>('');
  const [selLabelId, setSelLabelId] = useState<string>('');

  const currentTask = tasks.find((t) => t.id === selTaskId) || null;

  // 当切换任务时重置图层/标签选择
  React.useEffect(() => {
    if (currentTask && currentTask.layers.length > 0) {
      setSelLayer(currentTask.layers[0].id);
    } else {
      setSelLayer('');
    }
    if (currentTask && currentTask.labels.length > 0) {
      setSelLabelId(currentTask.labels[0].id);
    } else {
      setSelLabelId('');
    }
  }, [selTaskId]);

  const confirm = () => {
    if (!name.trim()) {
      alert('请输入样本类别名称');
      return;
    }
    onSubmit({
      name: name.trim(),
      color,
      description: description.trim(),
      samples: samplesDraft,
    });
  };

  // 自动纳入同名标签（仅编辑模式）
  // 每个符合条件的标注框都作为一个独立的样本切片
  const autoIncludeSameName = () => {
    const targetName = name.trim().toLowerCase();
    if (!targetName) {
      alert('请先输入类别名称');
      return;
    }
    const existingKeys = new Set(
      samplesDraft.map(
        (s) => `${s.fromTask}|${s.fromLayer}|${s.fromLabel}|${s.name}`,
      ),
    );
    const newItems: SampleItem[] = [];
    for (const task of tasks) {
      for (const label of task.labels) {
        if (label.name.toLowerCase() === targetName) {
          for (const layer of task.layers) {
            const anns = layer.annotations || [];
            for (const a of anns) {
              if (a.labelId !== label.id) continue;
              const key = `${task.name}|${layer.name}|${label.name}|${a.displayName}`;
              if (!existingKeys.has(key)) {
                existingKeys.add(key);
                newItems.push({
                  id: genId(),
                  name: a.displayName,
                  fromTask: task.name,
                  fromLayer: layer.name,
                  fromLabel: label.name,
                  extractedAt: nowStr(),
                });
              }
            }
          }
        }
      }
    }
    if (newItems.length === 0) {
      alert('未发现已框选的同名标签。请先在"样本解译"中完成标注并点击"保存当前图层"。');
      return;
    }
    setSamplesDraft([...newItems, ...samplesDraft]);
    alert(`已新增 ${newItems.length} 个样本切片`);
  };

  // 手动添加：数据集→图层→标签
  const addManual = () => {
    if (!currentTask || !selLayer || !selLabelId) {
      alert('请先选择数据集和标签');
      return;
    }
    const layer = currentTask.layers.find((l) => l.id === selLayer);
    const label = currentTask.labels.find((l) => l.id === selLabelId);
    if (!layer || !label) return;
    const key = `${currentTask.name}|${layer.name}|${label.name}|手动添加`;
    if (samplesDraft.some((s) => `${s.fromTask}|${s.fromLayer}|${s.fromLabel}|${s.name || '手动添加'}` === key)) {
      alert('该样本已存在');
      return;
    }
    setSamplesDraft([
      {
        id: genId(),
        name: `${label.name}切片`,
        fromTask: currentTask.name,
        fromLayer: layer.name,
        fromLabel: label.name,
        extractedAt: nowStr(),
      },
      ...samplesDraft,
    ]);
    setManualDialog(false);
  };

  const removeSample = (id: string) =>
    setSamplesDraft((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[620px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-800">
            {mode === 'edit' ? '编辑样本类别' : '新增样本类别'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* 基本信息 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              类别名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：建筑物 / 汽车 / 码头"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              标识颜色
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <button
                onClick={() => setColorPickerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
              >
                <Pipette size={12} />
                打开上色工具
              </button>
              <span className="text-xs text-gray-400 font-mono">{color}</span>
            </div>
            {/* 精简的一行预览色 */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">快速选择：</span>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    color === c ? 'border-gray-800 scale-110' : 'border-white ring-1 ring-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="简短描述该样本类别"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* 编辑模式：样本管理 */}
          {mode === 'edit' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-medium text-gray-700">
                    已关联样本切片（{samplesDraft.length}）
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    自动匹配规则：标注任务中的标签名 = 本类别名
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={autoIncludeSameName}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Plus size={12} />
                    自动纳入同名标签
                  </button>
                  <button
                    onClick={() => setManualDialog(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    <Plus size={12} />
                    手动按路径新增
                  </button>
                </div>
              </div>

              {samplesDraft.length === 0 ? (
                <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded py-6 text-center">
                  暂无关联样本。可通过上面两个按钮来添加。
                </div>
              ) : (
                <div className="border border-gray-200 rounded max-h-52 overflow-y-auto divide-y divide-gray-100">
                  {samplesDraft.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-gray-50"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-700 flex items-center gap-2">
                          <Tag size={11} className="text-gray-400" />
                          <span className="font-medium">{s.name || s.fromLabel}</span>
                          <span className="text-gray-400 mx-1">·</span>
                          <Folder size={11} className="text-gray-400" />
                          <span className="truncate text-gray-500">{s.fromTask}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="truncate text-gray-500">
                            {s.fromLayer}
                          </span>
                        </div>
                        <div className="text-gray-400 mt-0.5 text-[11px]">
                          {s.extractedAt}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSample(s.id)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirm}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {mode === 'edit' ? '保存' : '创建'}
          </button>
        </div>
      </div>

      {/* 手动新增样本 - 三级选择子弹窗 */}
      {manualDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-[460px]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-800">
                按数据集-图层-标签路径新增
              </h3>
              <button
                onClick={() => setManualDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  标注任务
                </label>
                {tasks.length === 0 ? (
                  <div className="text-xs text-gray-400 border border-gray-200 rounded px-3 py-2">
                    暂无标注任务，请先到「样本解译」创建
                  </div>
                ) : (
                  <select
                    value={selTaskId}
                    onChange={(e) => setSelTaskId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}（{t.layers.length} 图层 / {t.labels.length} 标签）
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  选择图层
                </label>
                {currentTask && currentTask.layers.length > 0 ? (
                  <select
                    value={selLayer}
                    onChange={(e) => setSelLayer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {currentTask.layers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-gray-400 border border-gray-200 rounded px-3 py-2">
                    该任务下暂无图层
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  选择标签
                </label>
                {currentTask && currentTask.labels.length > 0 ? (
                  <select
                    value={selLabelId}
                    onChange={(e) => setSelLabelId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {currentTask.labels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-gray-400 border border-gray-200 rounded px-3 py-2">
                    该任务下暂无标签，请先到标注工作台创建标签
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
              <button
                onClick={() => setManualDialog(false)}
                className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={addManual}
                className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
      <ColorPickerModal
        isOpen={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onSelect={(c) => setColor(c)}
        initialColor={color}
      />
    </div>
  );
};
