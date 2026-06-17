# 样本集产品逻辑重构（正负样本定义修正）计划

## 1. 当前状态分析（代码结构探索结果）

### 1.1 核心数据模型

文件 [modelComputeData.ts](file:///workspace/src/components/modelComputeData.ts#L73-L91)：

```
AnnotationTask          // 标注项目
 └─ layers[]            //   图层
     └─ annotations[]   //     标注框（labelName / xPercent / yPercent / wPercent / hPercent）

SampleCategory          // 样本集
 └─ samples[]           //   样本切片（SampleItem）
       fromTask         //     来源项目名
       fromLayer        //     来源图层名
       fromLabel        //     来源标签名（如"建筑物/写字楼"）
```

- `SampleItem` = "一个标注框加入样本集"（手工从 `数据集 → 图层 → 标签` 路径选入，见 [SampleManagement.tsx#L1297-L1316](file:///workspace/src/components/SampleManagement.tsx#L1297-L1316)）
- 它并不是一张真正的 256×256 图像切片

### 1.2 正负样本判定（`countPositiveNegative`）

文件 [SampleManagement.tsx#L34-L38](file:///workspace/src/components/SampleManagement.tsx#L34-L38)：

```
positive = samples.filter(s => !s.fromLabel.startsWith('背景/')).length
negative = samples.length - positive
```

- 正/负样本完全由"标签名是否以 `背景/` 开头"决定
- 与用户提出的定义（"切片内是否含标注框"）**完全不一致**

### 1.3 图层统计表（`buildLayerStats`）

文件 [SampleManagement.tsx#L55-L79](file:///workspace/src/components/SampleManagement.tsx#L55-L79)：

```
layerMap(s.fromLayer) = { slices, annotated, taskName }
  slices    = 该图层有多少条 SampleItem（= 有多少个标注框被加入样本集）
  annotated = 原图层中所有标注框数量（从 tasks.layers.annotations 读）
```

- 图层出现在二级页面的**门槛极低**：只要有 1 条 SampleItem 引用了该图层，该图层就占一行
- 所以你举的"图层A只标注1个框，加入样本集A后二级页面就出现它"的问题，完全符合当前实现逻辑

### 1.4 切片（`handleSlice`）

文件 [SampleManagement.tsx#L345-L358](file:///workspace/src/components/SampleManagement.tsx#L345-L358)：

```
sampleCategoryStore.set(…, c.id === category.id
  ? { ...c, isSliced: true, updatedAt: nowStr() }
  : c)
```

- "切片"只是**把 isSliced 置为 true**
- 既没有真正生成 256×256 瓦片，也没有按子图计算"是否含标注框"
- 所以在当前代码中，"切片后才有正负样本"的语义不成立

### 1.5 问题本质（4 层错配）

| 层级 | 当前定义 | 应该是 |
|---|---|---|
| `SampleItem` 粒度 | 一个标注框 | 一张 256×256 切片小图 |
| 正/负样本判定 | `fromLabel` 前缀是 `背景/` 吗 | 该切片内是否有标注框 |
| 二级页面统计 | 图层"有多少标注框被纳入" | 图层"切出多少张子图 / 其中正样本几张 / 负样本几张" |
| "切片"动作 | 仅把 `isSliced` 置为 true | 真正生成切片并给每张切片打正/负标签 |

这不是"小修小补"能解决的，需要**把样本集的粒度从「标注框」重构为「256×256 切片」**。

---

## 2. 重构方案（目标态）

### 2.1 数据模型变更

**`SampleItem` 改为"切片小图"**，新增以下字段：

```typescript
// 定义：一张 256×256 切片小图
export interface SampleItem {
  id: string;
  name: string;            // 切片名，如 "中心商务区_003_012"（行/列号编码）
  fromTask: string;        // 来源项目
  fromLayer: string;       // 来源图层
  // 新增 ↓
  row: number;             // 在大图中的行号（用于定位）
  col: number;             // 在大图中的列号
  hasAnnotation: boolean;  // 【核心】这张切片是否含标注框 = 正样本 true / 负样本 false
  // 新增 ↓ 可选：切片内包含的标注框数量（统计用，便于看正样本质量）
  annotCount: number;
  // 保留原 fromLabel 仅作为"最主标签"快速展示（可留空）
  fromLabel?: string;
  extractedAt: string;
}

// SampleCategory 保持结构，但语义变化：
//   samples.length         = 真正的"切片数"
//   isSliced               = 是否已执行过切片（作为"切片已完成"标志）
//   samples[i].hasAnnot    = 决定它是正样本还是负样本
```

### 2.2 "切片"的真正实现

在 SampleManagement 中，把原来的 `handleSlice`（只改 isSliced=true）替换成：

1. 用户在"新建样本集"时选择**整个图层**（**不再选单个标注框**，见第 2.3 节）
2. 点击"执行切片" → 按以下算法生成 `SampleItem[]`：

```
function sliceLayerToSamples(layer: LayerInTask, sliceSize=256): SampleItem[] {
  // 步骤A：虚拟网格切分
  //   - 我们没有真实像素坐标系，但有 0..1 的标注框坐标（xPercent / yPercent / wPercent / hPercent）
  //   - 约定图层 = 1 个单位正方形，切成 gridRows × gridCols 的 256×256 瓦片
  //   - 用"切分数量"由用户配置（例如 10×10 = 100 张子图）
  //   - 每个切片的坐标区间是 [col/gridCols, (col+1)/gridCols] × [row/gridRows, (row+1)/gridRows]
  // 步骤B：判定正/负样本
  //   - 遍历每个标注框 a：
  //        a 的 bbox = [xPercent, yPercent, xPercent+wPercent, yPercent+hPercent]
  //        若与切片 (row,col) 的区域有交集 → hasAnnotation=true
  //   - hasAnnotation 为 true 的切片 = 正样本
  //     其余 = 负样本
  // 步骤C：纯色子图跳过（你之前问研发的第3题）
  //   - 标记 needSkip=true 的切片不写入 samples
  //   - 但在样本集概览单独展示一个"已跳过N张纯色子图"角标（可在 isSliced=true 时写回 skipCount 字段）
  // 步骤D：写入 SampleItem[]
}
```

> 注：由于本项目是前端 Demo（无真实图像像素数据），第 2.3.3 节的"纯色跳过"用模拟数据实现——若一张切片中心坐标附近恰好没有任何标注框的 bbox 投影，可简单按"空切片区"跳过。接入真实遥感影像时再替换成基于像素的判定。

**`SampleCategory` 加 2 个字段**（方便 UI 展示）：

```typescript
export interface SampleCategory {
  // 新增切片配置
  gridSize: number;          // 切几分格，如 10 → 10×10 = 100 张切片；用户可配置
  skipSolid: boolean;        // 是否跳过纯色/无内容子图（默认 true）
  skipCount: number;         // 本样本集已跳过的纯色子图数量（用于角标提示）
  // 原有字段不变
}
```

### 2.3 新建样本集的交互流程改造（核心）

原弹窗让用户"数据集 → 图层 → 标签（一个标注框）→ 手动一条一条加"。改为：

**阶段1：选择哪些图层加入样本集**（多图层复选）
- 展示所有项目（task）下的图层列表
- 用户勾选若干图层 → 每个勾选的图层都成为"源图层"

**阶段2：配置切片规则**（一次配置，对所有选入的图层生效）
- 网格大小 `gridSize`：默认 10（可下拉选 8 / 10 / 16 / 20，对应 64 / 100 / 256 / 400 张切片）
- 是否跳过纯色子图 `skipSolid`：默认 ✅ 开启，角标展示跳过数量
- 正/负样本比例上限：默认"负样本不超过正样本的 3 倍"（防止全背景图层刷出大量负样本）

**阶段3：点击"创建并执行切片"**
- 对每个选入的图层执行 §2.2 算法 → 生成 SampleItem[]
- `isSliced` 置为 true

这样用户"新建一个样本集" = 直接拿到"按图层切分好的切片集合"，不再有"先选标注框再切片"的中间态。

### 2.4 二级页面（样本集详情）重写

原来的 6 个统计 + 图层表，全部**按新语义重算**：

**样本集概览（6 字段）**

| 字段 | 计算方式 | 说明 |
|---|---|---|
| 切片数 | `samples.length` | 实际保留的子图数（不含被 skip 的） |
| 正样本数 | `samples.filter(s => s.hasAnnotation).length` | |
| 负样本数 | `samples.filter(s => !s.hasAnnotation).length` | |
| 正样本比例 | `positive / total * 100` | |
| 标注数 | `tasks.layers.annotations.length` for all layers covered | 参考现有 `countAnnotationsForCategory`，但只统计**本样本集已纳入的那些图层** |
| 创建日期 / 更新日期 | 不变 | |
| （角标）跳过的纯色子图数 | `skipCount` | 单独小字展示 |

**图层表格（二级页面区域2）**

行是本样本集内涉及的每个图层，统计都是"该图层的切片在本样本集内的情况"：

| 列 | 内容 |
|---|---|
| 图层名称 | `fromLayer` |
| 所属标注项目 | `fromTask` |
| 切片数量 | 本样本集里该图层共生成几张 SampleItem（= 正 + 负） |
| 正/负样本 | `正样本数 / 负样本数`（两列，或一列展示为 "P/N"） |
| 切片状态 | 固定"已切片"（因为样本集创建时就切片了） |
| 操作 | 「删除」—— 从样本集中移除该图层的所有切片 |

### 2.5 三级页面（图层详情）

原来三级页面表格是"标注框列表"（因为 SampleItem 就是标注框），**现在改为"切片小图列表"**：

| 列 | 内容 |
|---|---|
| 缩略图 | 显示切片在大图中的位置 + 内部是否有标注框 |
| 切片名 | `图层名_r{row}_c{col}` |
| 正/负样本类型 | `hasAnnot ? '正样本' : '负样本'`（绿色/灰色 badge） |
| 切片内标注数 | `annotCount` |
| 操作 | 「从样本集移除」单张 → 点击后移除该 SampleItem |

### 2.6 正负样本判定逻辑（`countPositiveNegative` 重写）

改为：

```typescript
const countPositiveNegative = (samples: SampleItem[]) => {
  const positive = samples.filter((s) => s.hasAnnotation).length;
  const negative = samples.length - positive;
  return { positive, negative, total: samples.length };
};
```

参数 `_categoryName` 可直接废弃删除。

---

## 3. 具体改动文件与改动点

### 3.1 `src/components/modelComputeData.ts`（类型 + 演示数据）

| 区域 | 改动 |
|---|---|
| `SampleItem` 接口 | 新增 `row` / `col` / `hasAnnotation` / `annotCount`；`fromLabel` 改成可选 |
| `SampleCategory` 接口 | 新增 `gridSize` / `skipSolid` / `skipCount` |
| `buildBuildingSamples()` 演示数据 | 重写为"10×10 网格切片"风格的数据，包含正/负样本混合 |
| `initialCategories` | 同上面 Demo 数据一起更新为新结构 |

### 3.2 `src/components/SampleManagement.tsx`（UI + 业务逻辑）

| 组件/函数 | 改动 |
|---|---|
| `CategoryFormModal`（新建样本集弹窗） | 删掉"数据集→图层→标签→逐条新增"的老路；改为"多图层复选 + 切片配置 gridSize/skipSolid + 一键创建" |
| `handleSlice` | 从"置 isSliced=true"改为"按 gridSize 网格切分 + hasAnnotation 打标"的真正切片逻辑（见 §2.2 算法）。**注意**：因为本计划把"新建样本集"改成了"创建即切片"，`handleSlice` 实际上可能变成一个"重新切片"按钮（用户变更 gridSize 时触发），保留它也有意义 |
| `countPositiveNegative` | 从 `!fromLabel.startsWith('背景/')` 改为 `s.hasAnnotation`（见 §2.6） |
| `buildLayerStats` | 改为按 `fromLayer` 聚合 `hasAnnot=true / false` 的切片数，并返回 `{ slices, positive, negative, annotCount }` 用于二级页面表格 |
| `countAnnotationsForCategory` | 限制只统计本样本集覆盖到的图层（避免"整个项目都统计进来"导致数字失实） |
| 一级页面列（`切片数` / `正负样本数` / `标注数`） | 改读 samples.length / countPositiveNegative / countAnnotationsForCategory |
| 二级页面"样本集概览" | 6 字段按 §2.4 新语义展示，新增"已跳过纯色子图 N 张"小字 |
| 二级页面"图层切片情况"表格 | 改为 §2.4 右表展示 |
| 三级页面 `LayerDetailView` | 从"标注框列表"改为"切片列表"，展示 §2.5 新列 |
| 导出 GeoJSON（`handleExport`） | 导出时每行为一张切片，字段改为 `fromTask/fromLayer/row/col/hasAnnotation/annotCount`；原 `label/切片名称` 字段删除或降级为可选 |

### 3.3 依赖是否有新增

- 无任何 npm 依赖新增
- 仅用现有 React + Zustand store 即可完成

## 4. 验证清单（交付前自查）

1. ✅ 新建样本集弹窗：勾选图层 + 选 gridSize=10 → 点创建，样本集里出现 `10×10 - skipNum` 条 SampleItem
2. ✅ 正样本数 = samples 中 hasAnnotation=true 数量；负样本 = 其余
3. ✅ 二级页面"样本集概览"数字与 samples.length 一致，正/负比例合理
4. ✅ 二级页面"图层切片情况"表：每行显示该图层的切片总量 / 正 / 负 / 切片状态 / 删除按钮
5. ✅ 三级页面显示该图层的切片缩略图列表，可点"从样本集移除"单张
6. ✅ 删除图层操作（二级页面的"删除"按钮）= 删除该图层的所有 SampleItem，样本集概览数字同步更新
7. ✅ 重建切片（改 gridSize 后点击重新切片）= 用新配置重新生成该样本集的 samples[]
8. ✅ `npm run build` 通过（无 TS 报错）

## 5. 边界 / 风险与处理

| 场景 | 处理 |
|---|---|
| 用户勾选的某图层没有任何标注框 | 该图层所有切片均为负样本；若"负样本上限"被触发，自动截断到 N × positiveCount（N 默认为 3，可配）并给用户小字提示"该图层负样本已按上限截断" |
| 某图层切出的切片数过多（gridSize 选太大 = 400 张） | 在弹窗中显示"预计切片数：XX 张"并在 > 300 时用黄色提示，允许用户改小 gridSize |
| `skipSolid` 开启但无法真正判定纯色（前端 Demo 无像素数据） | 用"该切片周边一定半径内无任何标注框 bbox 投影"作为"空切片区"启发式判定，给用户注明"本版本使用启发式跳过，接入真实像素后替换为像素级判定" |
| 旧 SampleItem（仅含 fromLabel，不含 hasAnnot）的兼容 | 迁移策略：在 store 初始 load 时，对缺失 `hasAnnotation` 的 SampleItem 做兜底——若 `fromLabel` 以 `背景/` 开头则 false，否则 true（保证旧 demo 数据仍可展示） |

## 6. 不做（出界）

- 不引入真实瓦片图片的生成（需后端/真实遥感影像接入），前端仅用坐标框模拟切分并渲染缩略图位置
- 不改动样本解译工作台的"标注框数据结构"（标注框仍是 `AnnotationItem[]`），仅样本管理侧重解释
- 不改标签管理页（无关）
