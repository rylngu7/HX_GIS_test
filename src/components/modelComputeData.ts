// ============================================================
// 模型计算页共享数据层
// - 类型定义
// - 数据目录（标准库 / 融合库）
// - 标注任务列表
// - 样本类别列表
// ============================================================

import React from 'react';

// -------------------- 类型定义 --------------------

// -------------------- 数据类型定义 --------------------

export interface Label {
  id: string;
  name: string;
  color: string;
}

// -------------------- 标签分组（支持颜色统一管理 + 分级分类） --------------------
// 一个标签分组 = 一个"大类"（例如：建筑物）
// 分组下可以有多个子标签（例如：居民楼、写字楼、商场）
// 子标签可以：(a) 继承/使用分组推荐的颜色系，或者 (b) 手动自定义颜色

export interface SubLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface LabelGroup {
  id: string;
  name: string;              // 分组名，例如 "建筑物"
  themeColor: string;        // 分组主题色（用于推荐的颜色系/一键统一配置）
  description?: string;
  updatedAt: string;
  children: SubLabel[];      // 子标签列表
}

// 单个标注框（由用户在画布上拖拽绘制）
export interface AnnotationItem {
  id: string;
  labelId: string;
  labelName: string;
  color: string;
  displayName: string;  // 展示用名称，如"建筑物1"
  xPercent: number;
  yPercent: number;
  wPercent: number;
  hPercent: number;
  // 切片归属（执行切片时计算）
  sliceId?: string;     // 所属切片 id，如 "r0_c0"
  sliceRow?: number;   // 切片行号（从 0 开始）
  sliceCol?: number;   // 切片列号（从 0 开始）
}

// 单个切片（一块 256×256 子图）
export interface SliceItem {
  id: string;          // 切片 id，如 "r0_c0"
  name: string;        // 切片名，如 "r0_c0"
  row: number;         // 行号
  col: number;         // 列号
  annotationIds: string[]; // 该切片内含的标注框 id 列表
  blank?: boolean;     // 是否为纯色（无可用内容）的切片
}

export interface LayerInTask {
  id: string;
  name: string;
  annotated: boolean;
  annotations: AnnotationItem[];  // 该图层上的标注框
  slices?: SliceItem[];           // 该图层执行切片后产生的切片列表
  sliceSize?: number;             // 切片边长（默认 256）
  sliceRows?: number;             // 网格行数
  sliceCols?: number;             // 网格列数
}

export interface AnnotationTask {
  id: string;
  name: string;
  datasetName: string;
  description?: string;
  createdAt: string;
  status: '进行中' | '已完成';
  layers: LayerInTask[];
  labels: Label[];
}

export interface SampleItem {
  id: string;
  name: string;         // 切片名称，如"建筑物1"
  fromTask: string;
  fromLayer: string;
  fromLabel: string;
  extractedAt: string;
}

export interface SampleCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isSliced: boolean; // 是否已执行切片
  samples: SampleItem[];
}

// -------------------- 数据目录项（支持多级文件夹） --------------------

export interface DataCatalogEntry {
  id: string;
  name: string;
  // 叶子文件（图层名）
  files: string[];
  // 多级子文件夹（递归）
  children: DataCatalogEntry[];
}

// -------------------- 工具函数 --------------------

export const genId = (): string =>
  Date.now().toString() + Math.random().toString(36).slice(2, 8);

export const nowStr = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds())
  );
};

// -------------------- 数据目录（标准库 + 融合库 - 支持多级文件夹） --------------------

export const STANDARD_LIBRARY: DataCatalogEntry[] = [
  {
    id: 'std-1',
    name: '城区影像集',
    files: [],
    children: [
      {
        id: 'std-1-1',
        name: '中心城区',
        files: ['中心商务区.tif', '老城区.tif', '火车站周边.tif'],
        children: [],
      },
      {
        id: 'std-1-2',
        name: '科技园区',
        files: ['科技园.tif', '孵化园.tif'],
        children: [],
      },
      {
        id: 'std-1-3',
        name: '居民小区',
        files: ['居民小区.tif', '生活配套.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-2',
    name: '港口航拍',
    files: [],
    children: [
      {
        id: 'std-2-1',
        name: '码头区',
        files: ['码头A区.tif', '码头B区.tif'],
        children: [],
      },
      {
        id: 'std-2-2',
        name: '集装箱堆场',
        files: ['集装箱堆场.tif'],
        children: [],
      },
      {
        id: 'std-2-3',
        name: '航道水域',
        files: ['航道水域.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-3',
    name: '郊区遥感图',
    files: [],
    children: [
      {
        id: 'std-3-1',
        name: '农田',
        files: ['农田西区.tif', '农田东区.tif'],
        children: [],
      },
      {
        id: 'std-3-2',
        name: '居民点',
        files: ['居民点.tif'],
        children: [],
      },
      {
        id: 'std-3-3',
        name: '工业区',
        files: ['工业区.tif'],
        children: [],
      },
      {
        id: 'std-3-4',
        name: '湖泊周边',
        files: ['湖泊周边.tif'],
        children: [],
      },
      {
        id: 'std-3-5',
        name: '国道沿线',
        files: ['国道沿线.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-4',
    name: '山区地形影像',
    files: [],
    children: [
      {
        id: 'std-4-1',
        name: '北坡林区',
        files: ['北坡林区.tif', '针叶林.tif', '混交林.tif'],
        children: [],
      },
      {
        id: 'std-4-2',
        name: '南坡耕地区',
        files: ['南坡耕地区.tif', '梯田.tif'],
        children: [],
      },
      {
        id: 'std-4-3',
        name: '山脊线',
        files: ['山脊线.tif'],
        children: [],
      },
      {
        id: 'std-4-4',
        name: '河谷地带',
        files: ['河谷地带.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-5',
    name: '水域监测数据',
    files: [],
    children: [
      {
        id: 'std-5-1',
        name: '水库',
        files: ['水库全景.tif'],
        children: [],
      },
      {
        id: 'std-5-2',
        name: '河流',
        files: ['河流上游.tif', '河流下游.tif'],
        children: [],
      },
      {
        id: 'std-5-3',
        name: '湿地',
        files: ['湿地保护区.tif'],
        children: [],
      },
      {
        id: 'std-5-4',
        name: '入海口',
        files: ['入海口.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-6',
    name: '城市热力图',
    files: [],
    children: [
      {
        id: 'std-6-1',
        name: '商业区',
        files: ['商业中心.tif'],
        children: [],
      },
      {
        id: 'std-6-2',
        name: '工业园',
        files: ['工业园区.tif'],
        children: [],
      },
      {
        id: 'std-6-3',
        name: '住宅区',
        files: ['住宅区.tif'],
        children: [],
      },
      {
        id: 'std-6-4',
        name: '绿地',
        files: ['绿地公园.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-7',
    name: '夜间灯光数据',
    files: [],
    children: [
      {
        id: 'std-7-1',
        name: '主城区',
        files: ['主城区.tif'],
        children: [],
      },
      {
        id: 'std-7-2',
        name: '郊区',
        files: ['郊区.tif'],
        children: [],
      },
      {
        id: 'std-7-3',
        name: '交通干线',
        files: ['交通干线.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-8',
    name: '多光谱遥感',
    files: [],
    children: [
      {
        id: 'std-8-1',
        name: '可见光',
        files: ['可见光波段.tif'],
        children: [],
      },
      {
        id: 'std-8-2',
        name: '红外',
        files: ['近红外波段.tif', '热红外波段.tif'],
        children: [],
      },
      {
        id: 'std-8-3',
        name: '全色',
        files: ['全色波段.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-9',
    name: '雷达影像集',
    files: [],
    children: [
      {
        id: 'std-9-1',
        name: 'C波段',
        files: ['C波段.tif'],
        children: [],
      },
      {
        id: 'std-9-2',
        name: 'L波段',
        files: ['L波段.tif'],
        children: [],
      },
      {
        id: 'std-9-3',
        name: '干涉',
        files: ['干涉数据.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'std-10',
    name: '农田调查数据',
    files: [],
    children: [
      {
        id: 'std-10-1',
        name: '水稻',
        files: ['水稻种植区.tif'],
        children: [],
      },
      {
        id: 'std-10-2',
        name: '小麦',
        files: ['小麦种植区.tif'],
        children: [],
      },
      {
        id: 'std-10-3',
        name: '玉米',
        files: ['玉米种植区.tif'],
        children: [],
      },
      {
        id: 'std-10-4',
        name: '蔬菜大棚',
        files: ['大棚蔬菜区.tif'],
        children: [],
      },
    ],
  },
];

export const FUSION_LIBRARY: DataCatalogEntry[] = [
  {
    id: 'fus-1',
    name: '城区+港口融合',
    files: [],
    children: [
      {
        id: 'fus-1-1',
        name: '融合影像',
        files: ['融合影像_A.tif', '融合影像_B.tif'],
        children: [],
      },
      {
        id: 'fus-1-2',
        name: '变化检测',
        files: ['变化检测图.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'fus-2',
    name: '多波段融合',
    files: [],
    children: [
      {
        id: 'fus-2-1',
        name: '彩色合成',
        files: ['真彩色合成.tif', '假彩色合成.tif'],
        children: [],
      },
      {
        id: 'fus-2-2',
        name: '植被指数',
        files: ['植被指数图.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'fus-3',
    name: '时序分析',
    files: [],
    children: [
      {
        id: 'fus-3-1',
        name: '2024年度',
        files: ['2024Q1.tif', '2024Q2.tif', '2024Q3.tif', '2024Q4.tif'],
        children: [],
      },
      {
        id: 'fus-3-2',
        name: '2025年度',
        files: ['2025Q1.tif'],
        children: [],
      },
    ],
  },
  {
    id: 'fus-4',
    name: '地形+光谱融合',
    files: [],
    children: [
      {
        id: 'fus-4-1',
        name: '坡度分析',
        files: ['坡度分析.tif'],
        children: [],
      },
      {
        id: 'fus-4-2',
        name: '坡向分析',
        files: ['坡向分析.tif'],
        children: [],
      },
      {
        id: 'fus-4-3',
        name: '综合分类',
        files: ['综合分类.tif'],
        children: [],
      },
    ],
  },
];

// 供标注任务下拉选择（仅标准库的文件夹：使用顶级名）
export const DATASET_NAMES: string[] = STANDARD_LIBRARY.map((e) => e.name);

// 递归收集某节点下所有图层（深度优先），返回带完整路径的列表
export interface DataFileNode {
  path: string;     // 完整路径，如"城区影像集/中心城区/中心商务区.tif"
  name: string;     // 文件名
}

const collectFiles = (
  entry: DataCatalogEntry,
  parentPath: string,
  acc: DataFileNode[],
) => {
  const here = parentPath ? `${parentPath}/${entry.name}` : entry.name;
  for (const f of entry.files) {
    acc.push({ path: `${here}/${f}`, name: f });
  }
  for (const c of entry.children) {
    collectFiles(c, here, acc);
  }
};

// 供标注任务创建时按路径获取图层列表
export const DATA_DIRECTORY: Record<string, DataFileNode[]> = {};
for (const entry of [...STANDARD_LIBRARY, ...FUSION_LIBRARY]) {
  const list: DataFileNode[] = [];
  collectFiles(entry, '', list);
  DATA_DIRECTORY[entry.name] = list;
}

// 多级文件夹的扁平化（用于标注任务下拉框显示）
export interface DatasetFolderNode {
  name: string;
  fullPath: string;
  children: DatasetFolderNode[];
  files: DataFileNode[];
}

export const buildFolderTree = (
  entries: DataCatalogEntry[],
  parentPath = '',
): DatasetFolderNode[] =>
  entries.map((e) => {
    const here = parentPath ? `${parentPath}/${e.name}` : e.name;
    return {
      name: e.name,
      fullPath: here,
      children: buildFolderTree(e.children, here),
      files: e.files.map((f) => ({ path: `${here}/${f}`, name: f })),
    };
  });


// -------------------- 标准化色盘（8色，一行展示） --------------------

export const COLOR_PALETTE: string[] = [
  '#3B82F6', // 蓝
  '#EF4444', // 红
  '#10B981', // 绿
  '#F59E0B', // 橙
  '#8B5CF6', // 紫
  '#EC4899', // 粉
  '#06B6D4', // 青
  '#64748B', // 灰
];

export const COLOR_NAMES: Record<string, string> = {
  '#3B82F6': '蓝',
  '#EF4444': '红',
  '#10B981': '绿',
  '#F59E0B': '橙',
  '#8B5CF6': '紫',
  '#EC4899': '粉',
  '#06B6D4': '青',
  '#64748B': '灰',
};

// -------------------- 初始标注任务 --------------------

// 默认切片网格（4x4 = 16 个 256x256 子图）
const DEFAULT_SLICE_GRID = { rows: 4, cols: 4, size: 256 } as const;

// 为图层执行切片（生成 SliceItem + 反向索引到 annotation.sliceId）
const sliceLayer = (layer: LayerInTask, grid = DEFAULT_SLICE_GRID) => {
  const cellW = 100 / grid.cols;
  const cellH = 100 / grid.rows;
  const slices: SliceItem[] = [];
  const indexMap = new Map<string, string[]>();
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      slices.push({
        id: `r${r}_c${c}`,
        name: `r${r}_c${c}`,
        row: r,
        col: c,
        annotationIds: [],
        blank: false,
      });
    }
  }
  for (const a of layer.annotations) {
    // 用标注框中心点落入的格子作为归属切片
    const cx = a.xPercent + a.wPercent / 2;
    const cy = a.yPercent + a.hPercent / 2;
    const c = Math.min(grid.cols - 1, Math.max(0, Math.floor(cx / cellW)));
    const r = Math.min(grid.rows - 1, Math.max(0, Math.floor(cy / cellH)));
    const sid = `r${r}_c${c}`;
    a.sliceRow = r;
    a.sliceCol = c;
    a.sliceId = sid;
    const arr = indexMap.get(sid) || [];
    arr.push(a.id);
    indexMap.set(sid, arr);
  }
  for (const s of slices) {
    const ids = indexMap.get(s.id) || [];
    s.annotationIds = ids;
    s.blank = ids.length === 0;
  }
  layer.slices = slices;
  layer.sliceSize = grid.size;
  layer.sliceRows = grid.rows;
  layer.sliceCols = grid.cols;
};

const buildLayerFromFiles = (fileNames: string[], annotatedFlags: boolean[]) =>
  fileNames.map((name, i) => ({
    id: genId(),
    name,
    annotated: i < annotatedFlags.filter(Boolean).length,
    annotations: [],
    slices: [],
  }));

// ---------- 演示数据生成：为"城区建筑物标注"预设标注框 ----------
const buildDemoBuildingAnnotations = (
  labelId: string,
  labelName: string,
  color: string,
  count: number,
  startIdx = 1,
): AnnotationItem[] => {
  const items: AnnotationItem[] = [];
  // 在画布上生成不重叠的框（百分比坐标）
  // 使用固定的网格布局以保证演示一致性
  const gridPositions = [
    [8, 6, 14, 12], [26, 8, 16, 14], [46, 5, 12, 10], [62, 7, 18, 12],
    [84, 10, 10, 8], [10, 24, 12, 14], [28, 26, 14, 12], [48, 28, 10, 10],
    [64, 24, 16, 14], [82, 28, 12, 12], [12, 44, 14, 12], [30, 46, 10, 10],
    [44, 44, 14, 14], [62, 46, 12, 10], [78, 48, 14, 12], [10, 62, 10, 14],
    [24, 64, 14, 10], [42, 62, 12, 14], [58, 66, 10, 10], [72, 64, 12, 12],
    [14, 80, 12, 10], [28, 82, 10, 8], [44, 82, 14, 10], [60, 80, 12, 12],
  ];
  for (let i = 0; i < Math.min(count, gridPositions.length); i++) {
    const [x, y, w, h] = gridPositions[(i + startIdx - 1) % gridPositions.length];
    items.push({
      id: genId(),
      labelId,
      labelName,
      color,
      displayName: `${labelName}${startIdx + i}`,
      xPercent: x,
      yPercent: y,
      wPercent: w,
      hPercent: h,
    });
  }
  return items;
};

// -------------------- 初始标签分组 --------------------
const initialLabelGroups: LabelGroup[] = [
  {
    id: genId(),
    name: '建筑物',
    themeColor: '#3B82F6',
    description: '建筑物相关子标签',
    updatedAt: nowStr(),
    children: [
      { id: genId(), name: '居民楼', color: '#3B82F6' },
      { id: genId(), name: '写字楼', color: '#2563EB' },
      { id: genId(), name: '商场', color: '#1D4ED8' },
    ],
  },
  {
    id: genId(),
    name: '码头设施',
    themeColor: '#10B981',
    description: '港口、码头相关设施',
    updatedAt: nowStr(),
    children: [
      { id: genId(), name: '集装箱', color: '#10B981' },
      { id: genId(), name: '起重机', color: '#059669' },
      { id: genId(), name: '泊位', color: '#047857' },
    ],
  },
  {
    id: genId(),
    name: '交通车辆',
    themeColor: '#EF4444',
    description: '各类车辆',
    updatedAt: nowStr(),
    children: [
      { id: genId(), name: '小型车', color: '#EF4444' },
      { id: genId(), name: '货车', color: '#DC2626' },
      { id: genId(), name: '巴士', color: '#B91C1C' },
    ],
  },
];

const initialTasks: AnnotationTask[] = [
  {
    id: 'task-demo-building',
    name: '城区建筑物标注',
    datasetName: '城区影像集',
    description: '针对城区影像集中的建筑物做逐图层轮廓标注',
    createdAt: '2024-11-15 09:23:18',
    status: '进行中',
    // 从多级标准库中提取所有文件
    layers: (() => {
      // 为每个图层预设一定数量的标注框（演示数据）
      const buildingLabel = initialLabelGroups[0].children[0]; // 居民楼
      const officeLabel = initialLabelGroups[0].children[1]; // 写字楼
      const mallLabel = initialLabelGroups[0].children[2]; // 商场
      const files = [
        '中心城区/中心商务区.tif',
        '中心城区/老城区.tif',
        '科技园区/科技园.tif',
        '居民小区/居民小区.tif',
      ];
      // 每个图层的标注数量（演示数据）
      const annCounts = [
        { building: 0, office: 8, mall: 4 }, // 中心商务区：写字楼+商场多
        { building: 12, office: 2, mall: 1 }, // 老城区：居民楼多
        { building: 2, office: 10, mall: 3 }, // 科技园：写字楼多
        { building: 14, office: 1, mall: 0 }, // 居民小区：居民楼为主
      ];
      return files.map((name, i) => ({
        id: genId(),
        name,
        annotated: true,
        annotations: [
          ...buildDemoBuildingAnnotations(
            buildingLabel.id,
            `建筑物/${buildingLabel.name}`,
            buildingLabel.color,
            annCounts[i].building,
            1,
          ),
          ...buildDemoBuildingAnnotations(
            officeLabel.id,
            `建筑物/${officeLabel.name}`,
            officeLabel.color,
            annCounts[i].office,
            annCounts[i].building + 1,
          ),
          ...buildDemoBuildingAnnotations(
            mallLabel.id,
            `建筑物/${mallLabel.name}`,
            mallLabel.color,
            annCounts[i].mall,
            annCounts[i].building + annCounts[i].office + 1,
          ),
        ],
        slices: [],
      }));
    })(),
    labels: [],
  },
  {
    id: 'task-demo-port',
    name: '港口码头标注',
    datasetName: '港口航拍',
    description: '标注码头结构、集装箱、船只',
    createdAt: '2024-11-12 14:05:32',
    status: '已完成',
    layers: (() => {
      const files = [
        '码头区/码头A区.tif',
        '码头区/码头B区.tif',
        '集装箱堆场/集装箱堆场.tif',
        '航道水域/航道水域.tif',
      ];
      return files.map((name, i) => ({
        id: genId(),
        name,
        annotated: true,
        annotations: [],
        slices: [],
      }));
    })(),
    labels: [],
  },
];

// 对所有任务的图层执行 256x256 切片
initialTasks.forEach((t) => {
  t.layers.forEach((l) => {
    if ((l.annotations || []).length > 0) {
      sliceLayer(l);
    }
  });
});

// -------------------- 初始样本集（命名与标签不同：面向"用途/项目"） --------------------

// ---------- 演示数据：为"城区建筑样本集"生成样本切片 ----------
const buildBuildingSamples = (): SampleItem[] => {
  // 从"城区建筑物标注"任务的图层中选取一些标注框作为样本
  const taskName = '城区建筑物标注';
  // 正样本：建筑物相关
  const layersData = [
    { layer: '中心城区/中心商务区.tif', label: '建筑物/写字楼', count: 6 },
    { layer: '中心城区/中心商务区.tif', label: '建筑物/商场', count: 3 },
    { layer: '中心城区/老城区.tif', label: '建筑物/居民楼', count: 10 },
    { layer: '中心城区/老城区.tif', label: '建筑物/写字楼', count: 1 },
    { layer: '科技园区/科技园.tif', label: '建筑物/写字楼', count: 8 },
    { layer: '居民小区/居民小区.tif', label: '建筑物/居民楼', count: 12 },
  ];
  // 负样本：非建筑物目标（误识别样本，用于模型区分背景）
  const negativeData = [
    { layer: '中心城区/中心商务区.tif', label: '背景/道路', count: 2 },
    { layer: '中心城区/老城区.tif', label: '背景/绿化', count: 3 },
    { layer: '居民小区/居民小区.tif', label: '背景/空地', count: 2 },
  ];
  const samples: SampleItem[] = [];
  layersData.forEach(({ layer, label, count }) => {
    for (let i = 1; i <= count; i++) {
      samples.push({
        id: genId(),
        name: `${label}${i}`,
        fromTask: taskName,
        fromLayer: layer,
        fromLabel: label,
        extractedAt: '2024-11-18 11:30:25',
      });
    }
  });
  negativeData.forEach(({ layer, label, count }) => {
    for (let i = 1; i <= count; i++) {
      samples.push({
        id: genId(),
        name: `${label}${i}`,
        fromTask: taskName,
        fromLayer: layer,
        fromLabel: label,
        extractedAt: '2024-11-19 09:12:35',
      });
    }
  });
  return samples;
};

const initialCategories: SampleCategory[] = [
  {
    id: genId(),
    name: '城区建筑样本集',
    color: '#3B82F6',
    description: '面向城区建筑物轮廓检测的训练样本',
    createdAt: '2024-11-18 10:15:42',
    updatedAt: '2024-11-21 17:30:08',
    isSliced: true,
    samples: buildBuildingSamples(),
  },
  {
    id: genId(),
    name: '港口设施样本集',
    color: '#10B981',
    description: '面向港口码头、集装箱识别的训练样本',
    createdAt: '2024-11-10 09:12:05',
    updatedAt: '2024-11-19 14:22:17',
    isSliced: false,
    samples: [],
  },
  {
    id: genId(),
    name: '车辆检测样本集',
    color: '#EF4444',
    description: '道路、停车场中的车辆样本',
    createdAt: '2024-11-08 16:45:12',
    updatedAt: '2024-11-20 10:08:55',
    isSliced: false,
    samples: [],
  },
];

// -------------------- 简易单例状态 --------------------

type Listener = () => void;

class Store<T> {
  private listeners: Set<Listener> = new Set();
  constructor(private data: T) {}
  get = (): T => this.data;
  set = (updater: (prev: T) => T): void => {
    this.data = updater(this.data);
    this.listeners.forEach((l) => l());
  };
  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
}

export const annotationTaskStore = new Store<AnnotationTask[]>(initialTasks);
export const sampleCategoryStore = new Store<SampleCategory[]>(initialCategories);

export const labelGroupStore = new Store<LabelGroup[]>(initialLabelGroups);

// 数据目录 store（标准库 & 融合库可动态增删）
export const standardLibraryStore = new Store<DataCatalogEntry[]>(STANDARD_LIBRARY);
export const fusionLibraryStore = new Store<DataCatalogEntry[]>(FUSION_LIBRARY);

export function useStore<T>(store: Store<T>): T {
  return React.useSyncExternalStore(
    store.subscribe,
    store.get,
    store.get,
  );
}