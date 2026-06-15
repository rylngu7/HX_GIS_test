// ============================================================
// 模型计算页共享数据层
// - 类型定义
// - 数据目录（数据管理-数据目录-标准库的文件夹）
// - 标注任务列表
// - 样本类别列表
// ============================================================

import React from 'react';

// -------------------- 类型定义 --------------------

export interface Label {
  id: string;
  name: string;
  color: string;
}

// 单个标注框（用户在画布上拖拽绘制）
export interface AnnotationItem {
  id: string;
  labelId: string;
  labelName: string;
  color: string;
  displayName: string; // 自动编号，如"建筑物1"
  xPercent: number;
  yPercent: number;
  wPercent: number;
  hPercent: number;
}

export interface LayerInTask {
  id: string;
  name: string;
  annotated: boolean;
  annotations: AnnotationItem[]; // 该图层上的标注框
}

export interface AnnotationTask {
  id: string;
  name: string;
  datasetName: string;
  folderName: string; // 数据管理-数据目录-标准库-文件夹名
  description?: string;
  createdAt: string;
  status: '进行中' | '已完成';
  layers: LayerInTask[];
  labels: Label[];
}

export interface SampleItem {
  id: string;
  name: string; // 继承自标注框的 displayName
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
  updatedAt: string;
  samples: SampleItem[];
}

// -------------------- 数据目录：标准库文件夹 --------------------
// 数据来源：数据管理 → 数据目录 → 标准库
// 每个文件夹 = 一个数据集
export interface DatasetFolder {
  name: string; // 标准库/城区影像集、港口航拍、...
  files: string[]; // 文件夹内的影像文件
}

export const STANDARD_LIBRARY: DatasetFolder[] = [
  {
    name: '城区影像集',
    files: ['影像_001.tiff', '影像_002.tiff', '影像_003.tiff', '影像_004.tiff'],
  },
  {
    name: '港口航拍',
    files: ['码头_东侧.tif', '码头_西侧.tif', '集装箱区.tif', '航道.tif'],
  },
  {
    name: '道路巡检',
    files: ['路段A_2024.tif', '路段B_2024.tif', '路段C_2024.tif'],
  },
];

// 兼容旧引用
export const DATA_DIRECTORY: Record<string, string[]> =
  STANDARD_LIBRARY.reduce((acc, f) => {
    acc[f.name] = f.files;
    return acc;
  }, {} as Record<string, string[]>);

export const DATASET_NAMES = STANDARD_LIBRARY.map((f) => f.name);

// -------------------- 颜色面板 --------------------
export const COLOR_PALETTE: string[] = [
  '#3B82F6', // 蓝
  '#10B981', // 绿
  '#F59E0B', // 黄
  '#EF4444', // 红
  '#8B5CF6', // 紫
  '#EC4899', // 粉
  '#14B8A6', // 青
  '#F97316', // 橙
];

// -------------------- 工具函数 --------------------

export const genId = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const nowStr = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

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

// -------------------- React Hook --------------------

export const useStore = <T,>(store: Store<T>): T => {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const unsub = store.subscribe(force);
    return () => {
      unsub();
    };
  }, [store]);
  return store.get();
};

// -------------------- 初始数据 --------------------

const initialTasks: AnnotationTask[] = [
  {
    id: genId(),
    name: '城区建筑物标注',
    datasetName: '城区影像集',
    folderName: '城区影像集',
    description: '针对城区影像集中的建筑物做逐图层轮廓标注',
    createdAt: nowStr(),
    status: '进行中',
    layers: STANDARD_LIBRARY[0].files.map((name, i) => ({
      id: genId(),
      name,
      annotated: i < 2,
      annotations: [],
    })),
    labels: [
      { id: genId(), name: '建筑物', color: '#3B82F6' },
      { id: genId(), name: '道路', color: '#F59E0B' },
    ],
  },
  {
    id: genId(),
    name: '港口码头标注',
    datasetName: '港口航拍',
    folderName: '港口航拍',
    description: '标注码头结构、集装箱、船只',
    createdAt: nowStr(),
    status: '已完成',
    layers: STANDARD_LIBRARY[1].files.map((name) => ({
      id: genId(),
      name,
      annotated: true,
      annotations: [],
    })),
    labels: [
      { id: genId(), name: '码头', color: '#10B981' },
      { id: genId(), name: '集装箱', color: '#8B5CF6' },
    ],
  },
];

const initialCategories: SampleCategory[] = [
  {
    id: genId(),
    name: '建筑物',
    color: '#3B82F6',
    description: '各类建筑物轮廓样本',
    updatedAt: nowStr(),
    samples: [],
  },
  {
    id: genId(),
    name: '码头',
    color: '#10B981',
    description: '港口码头结构样本',
    updatedAt: nowStr(),
    samples: [],
  },
  {
    id: genId(),
    name: '汽车',
    color: '#EF4444',
    description: '道路、停车场中的车辆样本',
    updatedAt: nowStr(),
    samples: [],
  },
];

// -------------------- 全局 Store --------------------

export const annotationTaskStore = new Store<AnnotationTask[]>(initialTasks);
export const sampleCategoryStore = new Store<SampleCategory[]>(initialCategories);
