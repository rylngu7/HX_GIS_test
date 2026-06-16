import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  AnnotationItem,
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
// 标准化分页组件（可复用）
// - 每页数量可选 10 / 20 / 50 / 100
// - 首页 / 上一页 / 下一页 / 末页
// - 显示"共 X 条 / 共 Y 页"
// - 页码变化、每页数量变化均通过回调抛出
// ==============================================================

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  title?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  title,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageSizeOptions = [10, 20, 50, 100];

  // 起始序号 / 结束序号
  const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(safePage * pageSize, total);

  const borderClass = title ? 'border-b' : 'border-t';

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${borderClass} border-gray-200 bg-gray-50 text-xs text-gray-600`}>
      <div className="flex items-center gap-3">
        {title && (
          <div className="text-sm font-medium text-gray-700">{title}</div>
        )}
        <div>
          共 <span className="font-semibold text-gray-800">{total}</span> 条
        </div>
        <div className="flex items-center gap-2">
          <span>每页</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value, 10);
              onPageSizeChange?.(newSize);
            }}
            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>条</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-gray-500 mr-2">
          第 {startIdx}-{endIdx} 条 / 共 {totalPages} 页
        </span>
        <button
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="首页"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="上一页"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="px-2 py-1 bg-white border border-gray-300 rounded min-w-[60px] text-center">
          <span className="font-semibold text-gray-800">{safePage}</span>
          <span className="text-gray-400"> / {totalPages}</span>
        </div>
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="下一页"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safePage >= totalPages}
          className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="末页"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};

// ==============================================================
// 样本管理主入口
// ==============================================================

const SampleManagement: React.FC<{
  onJumpToAnnotation?: (taskId: string, layerIdx: number) => void;
}> = ({ onJumpToAnnotation }) => {
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

  // 一级页面分页状态
  const [page1, setPage1] = useState(1);
  const [pageSize1, setPageSize1] = useState(20);

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

  // 搜索/过滤变化时，重置页码到 1
  React.useEffect(() => {
    setPage1(1);
  }, [searchQuery, categories.length]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [categories, searchQuery],
  );

  // 分页数据
  const pagedCategories = useMemo(
    () => filteredCategories.slice((page1 - 1) * pageSize1, page1 * pageSize1),
    [filteredCategories, page1, pageSize1],
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
        onJumpToAnnotation={onJumpToAnnotation}
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
            {pagedCategories.map((c) => {
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
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <button
                        onClick={() =>
                          setCategoryModal({ mode: 'edit', initial: c })
                        }
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Edit2 size={12} /> 编辑
                      </button>
                      <button
                        onClick={() => handleSlice(c)}
                        className="text-amber-600 hover:text-amber-800 flex items-center gap-1 whitespace-nowrap"
                        title="执行切片"
                      >
                        <Scissors size={12} /> 执行切片
                      </button>
                      <button
                        onClick={() => safeExport([c])}
                        disabled={!c.isSliced}
                        className={`flex items-center gap-1 whitespace-nowrap ${
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
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 whitespace-nowrap"
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
        <Pagination
          total={filteredCategories.length}
          page={page1}
          pageSize={pageSize1}
          onPageChange={setPage1}
          onPageSizeChange={(s) => {
            setPageSize1(s);
            setPage1(1);
          }}
        />
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

  // 样本集概览统计（全局）
  const totalSamples = display.samples.length;
  const { positive: posAll, negative: negAll } = countPositiveNegative(display.samples, display.name);
  const posRatioAll =
    totalSamples > 0 ? ((posAll / totalSamples) * 100).toFixed(2) : '0.00';
  const annotCountAll = countAnnotationsForCategory(display, tasks);

  const layerStats = useMemo(
    () => buildLayerStats(display, tasks),
    [display, tasks],
  );

  // 二级页面分页
  const [page2, setPage2] = useState(1);
  const [pageSize2, setPageSize2] = useState(20);
  React.useEffect(() => {
    setPage2(1);
  }, [display.id, tasks.length]);
  const pagedLayerStats = useMemo(
    () => layerStats.slice((page2 - 1) * pageSize2, page2 * pageSize2),
    [layerStats, page2, pageSize2],
  );

  // 删除该图层下所有样本切片（将它们从样本集中移除）
  const handleDeleteLayer = (layerName: string) => {
    if (!confirm(`确定从「${display.name}」中移除图层「${layerName}」下的所有标注信息？`)) return;
    sampleCategoryStore.set((prev) =>
      prev.map((c) => {
        if (c.id !== display.id) return c;
        return {
          ...c,
          samples: c.samples.filter((s) => s.fromLayer !== layerName),
          updatedAt: nowStr(),
        };
      }),
    );
  };

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

      {/* 区域1：样本集概览（更紧凑 6 字段，放在图层表格上方） */}
      <div className="p-4 pb-2">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">样本集概览</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="bg-blue-50 border border-blue-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">切片数</div>
              <div className="text-lg font-semibold text-blue-700">
                {totalSamples}
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">正负样本数</div>
              <div className="text-base font-semibold text-green-700">
                <span>{posAll}</span>
                <span className="text-gray-400 text-sm mx-0.5">/</span>
                <span className="text-red-500 text-sm">{negAll}</span>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">正样本比例</div>
              <div className="text-lg font-semibold text-purple-700">
                {posRatioAll}%
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded p-2.5 text-center">
              <div className="text-[11px] text-gray-500 mb-1">标注数</div>
              <div className="text-lg font-semibold text-amber-700">{annotCountAll}</div>
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

      {/* 区域2：图层统计表（可点击进入三级页） */}
      <div className="px-4 pb-4 pt-2">
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
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs w-24">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedLayerStats.map((ls, idx) => {
                  const isSliced = ls.slices > 0;
                  return (
                    <tr
                      key={ls.name}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2.5 px-4 text-gray-400 text-xs">
                        {(page2 - 1) * pageSize2 + idx + 1}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700 text-xs whitespace-nowrap">
                        <button
                          onClick={() => onLayerClick(ls.name)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          <Folder size={12} className="flex-shrink-0 text-gray-400" />
                          <span className="truncate">{ls.name}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 text-xs whitespace-nowrap">
                        {ls.taskName}
                      </td>
                      <td className="py-2.5 px-4 text-center text-gray-700 text-xs whitespace-nowrap">
                        {ls.annotated}
                      </td>
                      <td className="py-2.5 px-4 text-center text-gray-700 text-xs font-medium whitespace-nowrap">
                        {ls.slices}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
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
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteLayer(ls.name)}
                          className="text-red-500 hover:text-red-700 flex items-center justify-center gap-1 text-xs whitespace-nowrap mx-auto"
                          title="将该图层下所有标注信息从样本集中移除"
                        >
                          <Trash2 size={12} /> 删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {layerStats.length > 0 && (
            <Pagination
              total={layerStats.length}
              page={page2}
              pageSize={pageSize2}
              onPageChange={setPage2}
              onPageSizeChange={(s) => {
                setPageSize2(s);
                setPage2(1);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ==============================================================
// 三级页面：图层详情（直接展示该图层下的所有标注信息）
// ==============================================================

interface LayerDetailViewProps {
  category: SampleCategory;
  layerName: string;
  onBackToCategory: () => void;
  tasks: AnnotationTask[];
  onJumpToAnnotation?: (taskId: string, layerIdx: number) => void;
}

const LayerDetailView: React.FC<LayerDetailViewProps> = ({
  category,
  layerName,
  onBackToCategory,
  tasks,
  onJumpToAnnotation,
}) => {
  const liveCategory = useStore(sampleCategoryStore).find(
    (c) => c.id === category.id,
  );
  const display = liveCategory || category;
  // 放大查看的标注
  const [previewing, setPreviewing] = useState<AnnotationItem | null>(null);

  // 从关联任务中找出该图层下的所有标注
  const { annotations, taskId, taskName } = useMemo(() => {
    // 先通过样本切片关联的任务名找到任务
    const layerSamples = display.samples.filter(
      (s) => s.fromLayer === layerName,
    );
    const candidateTaskName =
      layerSamples.length > 0 ? layerSamples[0].fromTask : '';
    let targetTask: AnnotationTask | undefined = tasks.find(
      (t) => t.name === candidateTaskName,
    );
    // 如果按样本切片找不着，则遍历所有任务找到同名图层
    if (!targetTask) {
      targetTask = tasks.find((t) =>
        t.layers.some((l) => l.name === layerName),
      );
    }
    if (!targetTask) {
      return { annotations: [], taskId: '', taskName: '' };
    }
    const targetLayer = targetTask.layers.find(
      (l) => l.name === layerName,
    );
    return {
      annotations: (targetLayer?.annotations || []).slice(),
      taskId: targetTask.id,
      taskName: targetTask.name,
    };
  }, [tasks, display.samples, layerName]);

  // 三级页面分页
  const [page3, setPage3] = useState(1);
  const [pageSize3, setPageSize3] = useState(10);
  React.useEffect(() => {
    setPage3(1);
  }, [display.id, layerName, annotations.length]);
  const pagedAnnotations = useMemo(
    () => annotations.slice((page3 - 1) * pageSize3, page3 * pageSize3),
    [annotations, page3, pageSize3],
  );

  // 删除单个标注
  const handleDelete = (annotationId: string) => {
    if (!taskId) return;
    if (!confirm('确定删除该标注？此操作不可撤销。')) return;
    annotationTaskStore.set((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              layers: t.layers.map((l) =>
                l.name === layerName
                  ? {
                      ...l,
                      annotated: (l.annotations || []).filter(
                        (a) => a.id !== annotationId,
                      ).length > 0,
                      annotations: (l.annotations || []).filter(
                        (a) => a.id !== annotationId,
                      ),
                    }
                  : l,
              ),
            }
          : t,
      ),
    );
  };

  // 跳转到样本解译工作台并定位到该图层
  const handleEdit = (annotation: AnnotationItem) => {
    if (!taskId) {
      alert('未找到对应的标注项目，无法跳转');
      return;
    }
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;
    const layerIdx = targetTask.layers.findIndex((l) => l.name === layerName);
    if (layerIdx < 0) {
      alert('未找到对应图层，无法跳转');
      return;
    }
    onJumpToAnnotation?.(taskId, layerIdx);
  };

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

      {/* 该图层下的标注信息列表 */}
      <div className="p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700">
              该图层下的标注信息
            </div>
          </div>
          {annotations.length === 0 ? (
            <div className="text-xs text-gray-400 py-12 text-center">
              该图层下暂无标注信息
            </div>
          ) : (
            <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2.5 px-4 text-left font-medium text-gray-600 text-xs w-12 whitespace-nowrap">
                    #
                  </th>
                  <th className="py-2.5 px-4 text-left font-medium text-gray-600 text-xs w-20 whitespace-nowrap">
                    缩略图
                  </th>
                  <th className="py-2.5 px-4 text-left font-medium text-gray-600 text-xs whitespace-nowrap">
                    标注名称
                  </th>
                  <th className="py-2.5 px-4 text-left font-medium text-gray-600 text-xs whitespace-nowrap">
                    标签
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs whitespace-nowrap">
                    X 位置
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs whitespace-nowrap">
                    Y 位置
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs whitespace-nowrap">
                    宽度
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs whitespace-nowrap">
                    高度
                  </th>
                  <th className="py-2.5 px-4 text-center font-medium text-gray-600 text-xs whitespace-nowrap w-32">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedAnnotations.map((a, idx) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2.5 px-4 text-gray-400 text-xs whitespace-nowrap">
                      {(page3 - 1) * pageSize3 + idx + 1}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewing(a)}
                        title="点击放大查看"
                        className="w-12 h-9 rounded border border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: `${a.color}22` }}
                      >
                        <div
                          className="absolute border"
                          style={{
                            left: `${a.xPercent}%`,
                            top: `${a.yPercent}%`,
                            width: `${a.wPercent}%`,
                            height: `${a.hPercent}%`,
                            borderColor: a.color,
                            backgroundColor: `${a.color}55`,
                          }}
                        />
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs whitespace-nowrap font-medium">
                      {a.displayName}
                    </td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: a.color }}
                        />
                        <span>{a.labelName}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-gray-700 text-xs whitespace-nowrap">
                      {a.xPercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-center text-gray-700 text-xs whitespace-nowrap">
                      {a.yPercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-center text-gray-700 text-xs whitespace-nowrap">
                      {a.wPercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-center text-gray-700 text-xs whitespace-nowrap">
                      {a.hPercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <button
                          onClick={() => handleEdit(a)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 whitespace-nowrap"
                          title="跳转到样本解译工作台该图层"
                        >
                          <Edit2 size={12} /> 编辑
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1 whitespace-nowrap"
                          title="删除该标注"
                        >
                          <Trash2 size={12} /> 删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              total={annotations.length}
              page={page3}
              pageSize={pageSize3}
              onPageChange={setPage3}
              onPageSizeChange={(s) => {
                setPageSize3(s);
                setPage3(1);
              }}
            />
            </>
          )}
        </div>
      </div>

      {/* 缩略图放大查看弹窗 */}
      {previewing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
          onClick={() => setPreviewing(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[720px] max-w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: previewing.color }}
                />
                <span>{previewing.displayName}</span>
                <span className="text-gray-400 text-xs">· {previewing.labelName}</span>
              </div>
              <button
                onClick={() => setPreviewing(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-5 bg-gray-50">
              <div
                className="w-full relative bg-white border border-gray-200 rounded overflow-hidden"
                style={{ aspectRatio: '16 / 9' }}
              >
                {/* 模拟图层背景网格 */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, #e5e7eb, #e5e7eb 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #e5e7eb, #e5e7eb 1px, transparent 1px, transparent 40px)',
                  }}
                />
                {/* 标注框 */}
                <div
                  className="absolute border-2"
                  style={{
                    left: `${previewing.xPercent}%`,
                    top: `${previewing.yPercent}%`,
                    width: `${previewing.wPercent}%`,
                    height: `${previewing.hPercent}%`,
                    borderColor: previewing.color,
                    backgroundColor: `${previewing.color}22`,
                  }}
                >
                  <div
                    className="absolute -top-6 left-0 text-xs font-medium whitespace-nowrap px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: previewing.color }}
                  >
                    {previewing.displayName}
                  </div>
                </div>
                {/* 图层名 */}
                <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded border border-gray-200 text-xs text-gray-600">
                  {layerName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
