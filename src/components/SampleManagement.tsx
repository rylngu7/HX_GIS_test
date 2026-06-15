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
  Check,
  Folder,
  Tag,
  Download,
  Scissors,
} from 'lucide-react';
import {
  SampleCategory,
  SampleItem,
  AnnotationTask,
  annotationTaskStore,
  sampleCategoryStore,
  genId,
  nowStr,
  useStore,
} from './modelComputeData';

// ---------- 工具函数：计算正负样本 ----------
const countPositiveNegative = (samples: SampleItem[], _categoryName: string) => {
  const positive = samples.filter((s) => !s.fromLabel.startsWith('背景/')).length;
  const negative = samples.length - positive;
  return { positive, negative, total: samples.length };
};

// ---------- 工具函数：计算关联任务的标注总数 ----------
const countAnnotationsForCategory = (category: SampleCategory, tasks: AnnotationTask[]) => {
  const taskNames = new Set(category.samples.map((s) => s.fromTask));
  let total = 0;
  for (const task of tasks) {
    if (taskNames.has(task.name)) {
      for (const layer of task.layers) {
        total += (layer.annotations || []).length;
      }
    }
  }
  return total;
};

// ---------- 工具函数：按图层统计样本 ----------
const buildLayerStats = (category: SampleCategory, tasks: AnnotationTask[]) => {
  const layerMap = new Map<
    string,
    { slices: number; annotated: number; taskName: string }
  >();
  for (const s of category.samples) {
    const existing = layerMap.get(s.fromLayer) || {
      slices: 0,
      annotated: 0,
      taskName: s.fromTask,
    };
    existing.slices += 1;
    layerMap.set(s.fromLayer, existing);
  }
  for (const task of tasks) {
    for (const layer of task.layers) {
      const key = layer.name;
      const existing = layerMap.get(key);
      if (existing) {
        existing.annotated = (layer.annotations || []).length;
      }
    }
  }
  return [...layerMap.entries()].map(([name, info]) => ({ name, ...info }));
};

// ==============================================================
// 样本管理主入口
// ==============================================================

const SampleManagement: React.FC = () => {
  const categories = useStore(sampleCategoryStore);
  const tasks = useStore(annotationTaskStore);

  const [searchQuery, setSearchQuery] = useState('');
  // 导航状态：null = 一级列表；string = 二级类别详情；{ categoryId, layerName } = 三级图层详情
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);
  const [categoryModal, setCategoryModal] = useState<
    | { mode: 'create'; initial?: SampleCategory }
    | { mode: 'edit'; initial: SampleCategory }
    | null
  >(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );

  const [exportMsg, setExportMsg] = useState<string>('');
  const exportMsgTimerRef = React.useRef<number | null>(null);

  const showExportMsg = React.useCallback((msg: string, ms = 5000) => {
    if (exportMsgTimerRef.current) {
      window.clearTimeout(exportMsgTimerRef.current);
      exportMsgTimerRef.current = null;
    }
    setExportMsg(msg);
    exportMsgTimerRef.current = window.setTimeout(() => {
      setExportMsg('');
      exportMsgTimerRef.current = null;
    }, ms);
  }, []);

  React.useEffect(() => {
    return () => {
      if (exportMsgTimerRef.current) {
        window.clearTimeout(exportMsgTimerRef.current);
        exportMsgTimerRef.current = null;
      }
    };
  }, []);

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [categories, searchQuery],
  );

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || null;

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

  // 导出
  const safeExport = (categoriesToExport: SampleCategory[]) => {
    if (categoriesToExport.length === 0) {
      showExportMsg('请至少选择一个样本集');
      return;
    }
    const notReady = categoriesToExport.filter((c) => c.samples.length === 0);
    if (notReady.length > 0) {
      showExportMsg('存在暂无样本切片的样本集，无法导出');
      return;
    }
    // 切片前导出按钮置灰：只有 isSliced 为 true 的样本集才可导出
    const notSliced = categoriesToExport.filter((c) => !c.isSliced);
    if (notSliced.length > 0) {
      showExportMsg('请先执行切片后再导出');
      return;
    }
    const rows: {
      原始图: string;
      切片名称: string;
      '标注信息（GeoJSON格式）': string;
    }[] = [];
    for (const c of categoriesToExport) {
      for (const s of c.samples) {
        const geoJson = JSON.stringify({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                sampleSet: c.name,
                sampleName: s.name,
                task: s.fromTask,
                dataset: s.fromTask,
                layer: s.fromLayer,
                label: s.fromLabel,
                extractedAt: s.extractedAt,
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
              },
            },
          ],
        });
        rows.push({
          原始图: `${s.fromTask}/${s.fromLayer}`,
          切片名称: s.name || s.fromLabel,
          '标注信息（GeoJSON格式）': geoJson,
        });
      }
    }
    if (rows.length === 0) {
      showExportMsg('所选样本集中没有样本切片，无法导出');
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 40 }, { wch: 16 }, { wch: 100 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '样本导出');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      XLSX.writeFile(wb, `样本导出_${categoriesToExport.length}个样本集_${ts}.xlsx`);
      showExportMsg(`✓ 导出成功：共 ${rows.length} 个样本切片（GeoJSON格式）`);
      setSelectedCategoryIds(new Set());
    } catch {
      showExportMsg('导出失败，请重试');
    }
  };

  // ---------- 执行切片 ----------
  const handleSlice = (category: SampleCategory) => {
    if (category.samples.length === 0) {
      showExportMsg('该样本集下暂无样本切片，无法执行切片', 2500);
      return;
    }
    sampleCategoryStore.set((prev) =>
      prev.map((c) =>
        c.id === category.id
          ? { ...c, isSliced: true, updatedAt: nowStr() }
          : c,
      ),
    );
    showExportMsg(`✓ 已对「${category.name}」中 ${category.samples.length} 个样本切片执行切片`, 2500);
  };

  // ---------- 路由渲染 ----------
  // 三级页面：图层详情
  if (activeCategory && activeLayerName) {
    return (
      <LayerDetailView
        category={activeCategory}
        layerName={activeLayerName}
        onBackToCategory={() => setActiveLayerName(null)}
        tasks={tasks}
      />
    );
  }

  // 二级页面：类别详情
  if (activeCategory) {
    return (
      <CategoryDetailView
        category={activeCategory}
        onBack={() => setActiveCategoryId(null)}
        onLayerClick={(layerName) => setActiveLayerName(layerName)}
        tasks={tasks}
      />
    );
  }

  // 一级页面：样本集列表
  return (
    <div className="h-full bg-gray-50 p-4 flex flex-col relative">
      {exportMsg && (
        <div className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white text-sm rounded shadow-lg shadow-blue-200/50">
          {exportMsg}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="输入样本集名称搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedCategoryIds.size > 0 && (
            <button
              onClick={() =>
                safeExport(
                  categories.filter((c) => selectedCategoryIds.has(c.id)),
                )
              }
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            >
              <Download size={14} />
              导出所选
            </button>
          )}
          <button
            onClick={() => setCategoryModal({ mode: 'create' })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            <Plus size={16} />
            <span>新建样本集</span>
          </button>
        </div>
      </div>

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
                    <CheckSquare size={16} className="text-blue-600" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">
                样本集
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-20">
                切片数
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-24">
                正负样本数
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-20">
                标注数
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-44">
                最后更新时间
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700 w-60">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  <ImageIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <div className="text-sm">暂无样本集，点击右上角「新建样本集」创建</div>
                </td>
              </tr>
            )}
            {filteredCategories.map((c) => {
              const { positive, negative } = countPositiveNegative(c.samples, c.name);
              const annotCount = countAnnotationsForCategory(c, tasks);
              return (
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
                        <CheckSquare size={16} className="text-blue-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setActiveCategoryId(c.id)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {c.name}
                    </button>
                    {c.description && (
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {c.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {c.samples.length}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700 text-xs">
                    <span className="text-green-600 font-medium">{positive}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-500">{negative}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700 text-xs">
                    {annotCount}
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
                        onClick={() => handleSlice(c)}
                        className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                        title="执行切片"
                      >
                        <Scissors size={12} /> 执行切片
                      </button>
                      <button
                        onClick={() => safeExport([c])}
                        disabled={!c.isSliced}
                        className={`flex items-center gap-1 ${
                          c.isSliced
                            ? 'text-green-600 hover:text-green-800'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={c.isSliced ? '导出 GeoJSON 格式' : '请先执行切片'}
                      >
                        <Download size={12} /> 导出
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`确定删除样本集「${c.name}」？`)) {
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
              );
            })}
          </tbody>
        </table>
      </div>

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
                createdAt: nowStr(),
                updatedAt: nowStr(),
                isSliced: false,
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
// 二级页面：样本集详情（不含概览，图层点击可进入三级页）
// ==============================================================

interface CategoryDetailViewProps {
  category: SampleCategory;
  onBack: () => void;
  onLayerClick: (layerName: string) => void;
  tasks: AnnotationTask[];
}

const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  onBack,
  onLayerClick,
  tasks,
}) => {
  const liveCategory = useStore(sampleCategoryStore).find(
    (c) => c.id === category.id,
  );
  const display = liveCategory || category;
  const totalSamples = display.samples.length;

  const layerStats = useMemo(
    () => buildLayerStats(display, tasks),
    [display, tasks],
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
        >
          <ChevronLeft size={18} />
          <span>返回列表</span>
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-semibold text-gray-800">{display.name}</span>
        {display.description && (
          <span className="text-xs text-gray-500 truncate max-w-md">
            · {display.description}
          </span>
        )}
      </div>

      {/* 图层统计表（可点击进入三级页） */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-700">
            图层切片情况
          </div>
          {layerStats.length === 0 ? (
            <div className="text-xs text-gray-400 py-8 text-center">
              该样本集下暂无样本切片
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2.5 px-4 text-left font-medium text-gray-600 text-xs w-12">
                    #
                  </th>
                  <th className="py-2.5 px-4 text-left font-medium text-gray-600 text-xs">
                    图层名称
                  </th>
                  <th className="py-2.5 px-4 text-left font-medium text-gray-600 text-xs">
                    所属标注项目
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs w-24">
                    标注数量
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs w-24">
                    切片数量
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs w-24">
                    切片状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {layerStats.map((ls, idx) => {
                  const isSliced = ls.slices > 0;
                  return (
                    <tr
                      key={ls.name}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-2.5 px-4 text-gray-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700 text-xs">
                        <button
                          onClick={() => onLayerClick(ls.name)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          <Folder size={12} className="flex-shrink-0 text-gray-400" />
                          <span className="truncate">{ls.name}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 text-xs">
                        {ls.taskName}
                      </td>
                      <td className="py-2.5 px-4 text-center text-gray-700 text-xs">
                        {ls.annotated}
                      </td>
                      <td className="py-2.5 px-4 text-center text-gray-700 text-xs font-medium">
                        {ls.slices}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {isSliced ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            <Check size={11} /> 已切片
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            未切片
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 样本切片卡片 */}
      <div className="p-4 pt-2">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            样本切片列表
            <span className="text-xs text-gray-400 ml-2 font-normal">
              共 {totalSamples} 个样本
            </span>
          </div>
          {display.samples.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <ImageIcon size={40} className="mb-3 text-gray-300" />
              <div className="text-sm">该样本集下暂无样本切片</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {display.samples.map((s) => {
                const isPositive = !s.fromLabel.startsWith('背景/');
                return (
                  <div
                    key={s.id}
                    className="relative bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      <ImageIcon size={32} className="text-gray-400" />
                      <span
                        className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded text-white ${
                          isPositive ? 'bg-green-500' : 'bg-red-400'
                        }`}
                      >
                        {isPositive ? '正样本' : '负样本'}
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
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="p-2 text-xs">
                      <div className="font-medium text-gray-800 truncate mb-1" title={s.name}>
                        {s.name}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 truncate">
                        <Tag size={10} className="flex-shrink-0" />
                        <span className="truncate">{s.fromLabel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] mt-1 truncate">
                        <Folder size={10} className="flex-shrink-0" />
                        <span className="truncate">{s.fromLayer}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==============================================================
// 三级页面：图层详情（样本集概览 + 该图层下的样本切片）
// ==============================================================

interface LayerDetailViewProps {
  category: SampleCategory;
  layerName: string;
  onBackToCategory: () => void;
  tasks: AnnotationTask[];
}

const LayerDetailView: React.FC<LayerDetailViewProps> = ({
  category,
  layerName,
  onBackToCategory,
  tasks,
}) => {
  const liveCategory = useStore(sampleCategoryStore).find(
    (c) => c.id === category.id,
  );
  const display = liveCategory || category;

  // 过滤出属于该图层的样本
  const layerSamples = display.samples.filter((s) => s.fromLayer === layerName);
  const { positive, negative } = countPositiveNegative(layerSamples, display.name);
  const positiveRatio =
    layerSamples.length > 0
      ? ((positive / layerSamples.length) * 100).toFixed(2)
      : '0.00';

  // 计算该图层的标注数
  const annotCount = useMemo(() => {
    const taskName = layerSamples.length > 0 ? layerSamples[0].fromTask : '';
    const task = tasks.find((t) => t.name === taskName);
    if (!task) return 0;
    const layer = task.layers.find((l) => l.name === layerName);
    return (layer?.annotations || []).length;
  }, [tasks, layerName, layerSamples]);

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBackToCategory}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
        >
          <ChevronLeft size={18} />
          <span>返回样本集详情</span>
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-semibold text-gray-800">
          {display.name} / {layerName}
        </span>
      </div>

      {/* 区域1：样本集概览（更紧凑 6 字段） */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">样本集概览</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="bg-blue-50 border border-blue-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">切片数</div>
              <div className="text-lg font-semibold text-blue-700">
                {layerSamples.length}
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">正负样本数</div>
              <div className="text-base font-semibold text-green-700">
                <span>{positive}</span>
                <span className="text-gray-400 text-sm mx-0.5">/</span>
                <span className="text-red-500 text-sm">{negative}</span>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">正样本比例</div>
              <div className="text-lg font-semibold text-purple-700">
                {positiveRatio}%
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">标注数</div>
              <div className="text-lg font-semibold text-amber-700">{annotCount}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">创建日期</div>
              <div className="text-xs font-medium text-gray-700 pt-1.5">
                {display.createdAt}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">更新日期</div>
              <div className="text-xs font-medium text-gray-700 pt-1.5">
                {display.updatedAt}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 区域2：该图层下的样本切片 */}
      <div className="px-4 pb-4 pt-2">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            该图层下的样本切片
            <span className="text-xs text-gray-400 ml-2 font-normal">
              共 {layerSamples.length} 个样本
            </span>
          </div>
          {layerSamples.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <ImageIcon size={40} className="mb-3 text-gray-300" />
              <div className="text-sm">该图层下暂无样本切片</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {layerSamples.map((s) => {
                const isPositive = !s.fromLabel.startsWith('背景/');
                return (
                  <div
                    key={s.id}
                    className="relative bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      <ImageIcon size={32} className="text-gray-400" />
                      <span
                        className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded text-white ${
                          isPositive ? 'bg-green-500' : 'bg-red-400'
                        }`}
                      >
                        {isPositive ? '正样本' : '负样本'}
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
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="p-2 text-xs">
                      <div className="font-medium text-gray-800 truncate mb-1" title={s.name}>
                        {s.name}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 truncate">
                        <Tag size={10} className="flex-shrink-0" />
                        <span className="truncate">{s.fromLabel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] mt-1 truncate">
                        <Folder size={10} className="flex-shrink-0" />
                        <span className="truncate">{s.fromTask}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==============================================================
// 新增/编辑样本类别弹窗
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
  const [color, setColor] = useState(initial?.color || '#3B82F6');
  const [description, setDescription] = useState(initial?.description || '');
  const [samplesDraft, setSamplesDraft] = useState<SampleItem[]>(
    initial?.samples || [],
  );

  const [manualDialog, setManualDialog] = useState(false);
  const [selTaskId, setSelTaskId] = useState<string>(tasks[0]?.id || '');
  const [selLayer, setSelLayer] = useState<string>('');
  const [selLabelId, setSelLabelId] = useState<string>('');

  const currentTask = tasks.find((t) => t.id === selTaskId) || null;

  const taskLabels = React.useMemo(() => {
    if (!currentTask) return [];
    const collected = new Map<
      string,
      { id: string; name: string; color: string }
    >();
    for (const layer of currentTask.layers) {
      const anns = layer.annotations || [];
      for (const a of anns) {
        if (!collected.has(a.labelId)) {
          collected.set(a.labelId, {
            id: a.labelId,
            name: a.labelName,
            color: a.color,
          });
        }
      }
    }
    return Array.from(collected.values());
  }, [currentTask]);

  React.useEffect(() => {
    if (currentTask && currentTask.layers.length > 0) {
      setSelLayer(currentTask.layers[0].id);
    } else {
      setSelLayer('');
    }
    if (taskLabels.length > 0) {
      setSelLabelId(taskLabels[0].id);
    } else {
      setSelLabelId('');
    }
  }, [selTaskId, taskLabels]);

  const confirm = () => {
    if (!name.trim()) {
      alert('请输入样本集名称');
      return;
    }
    onSubmit({
      name: name.trim(),
      color,
      description: description.trim(),
      samples: samplesDraft,
    });
  };

  const addManual = () => {
    if (!currentTask || !selLayer || !selLabelId) {
      alert('请先选择数据集和标签');
      return;
    }
    const layer = currentTask.layers.find((l) => l.id === selLayer);
    const label = taskLabels.find((l) => l.id === selLabelId);
    if (!layer || !label) return;
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
            {mode === 'edit' ? '编辑样本集' : '新建样本集'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-lg">✕</span>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              样本集名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：城区建筑物样本集"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="简短描述该样本集"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {mode === 'edit' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-gray-700">
                  已关联样本切片（{samplesDraft.length}）
                </div>
                <button
                  onClick={() => setManualDialog(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Plus size={12} /> 手动新增
                </button>
              </div>

              {samplesDraft.length === 0 ? (
                <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded py-6 text-center">
                  暂无关联样本
                </div>
              ) : (
                <div className="border border-gray-200 rounded max-h-52 overflow-y-auto divide-y divide-gray-100">
                  {samplesDraft.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-700 flex items-center gap-2">
                          <Tag size={11} className="text-gray-400" />
                          <span className="font-medium">{s.name || s.fromLabel}</span>
                          <span className="text-gray-400 mx-1">·</span>
                          <Folder size={11} className="text-gray-400" />
                          <span className="truncate text-gray-500">{s.fromTask}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="truncate text-gray-500">{s.fromLayer}</span>
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
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {mode === 'edit' ? '保存' : '创建'}
          </button>
        </div>
      </div>

      {manualDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-[460px]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-800">
                按数据集-图层-标签路径新增
              </h3>
              <button onClick={() => setManualDialog(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-sm">✕</span>
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  标注项目
                </label>
                {tasks.length === 0 ? (
                  <div className="text-xs text-gray-400 border border-gray-200 rounded px-3 py-2">
                    暂无标注项目，请先到「样本解译」创建
                  </div>
                ) : (
                  <select
                    value={selTaskId}
                    onChange={(e) => setSelTaskId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currentTask.layers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}（{l.annotations?.length || 0} 个标注）
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-gray-400 border border-gray-200 rounded px-3 py-2">
                    该项目暂无图层
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  标签
                </label>
                {taskLabels.length > 0 ? (
                  <select
                    value={selLabelId}
                    onChange={(e) => setSelLabelId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {taskLabels.map((lb) => (
                      <option key={lb.id} value={lb.id}>
                        {lb.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-gray-400 border border-gray-200 rounded px-3 py-2">
                    该项目暂无标注框
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
              <button
                onClick={() => setManualDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={addManual}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
