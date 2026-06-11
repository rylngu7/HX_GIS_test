# 上传文件流程重构实施计划

## 1. 当前问题分析

### 1.1 现有代码结构分析

**上传弹窗 (UploadFileModal.tsx)**
- 仅收集文件、数据类型、数据名称等信息
- 无前端格式校验逻辑（文件类型、大小未验证）
- `onUploadFile` 回调仅传递单个 `File` 对象
- 不区分数据类型的格式要求

**任务管理 (Home.tsx)**
- `handleUploadFile` 仅接收 `File` 对象
- 简单调用 `addTask` 添加任务，`simulateUploadProgress` 模拟单阶段进度
- 没有体现"后端校验 → 数据解析 → 入库"的完整流程

**任务数据模型 (TaskList.tsx)**
- `Task` 接口仅含：`id, name, progress, status, createdAt, error, fileSize`
- 无阶段（stage）信息字段
- `updateTaskProgress` 仅更新进度百分比

**任务展示 (TaskManagementCenter.tsx)**
- 仅显示处理中/已完成状态
- 无子阶段（上传中、校验中、解析中、入库中）展示

### 1.2 核心问题总结

1. **前端缺失格式校验**：用户选择任意文件都能上传，未按数据类型检查格式和大小
2. **后端校验无体现**：当前流程是"上传→完成"，跳过了"格式校验、时空属性检查、数据规范验证"等关键步骤
3. **数据解析与入库无区分**：无法体现"解析文件内容 → 写入数据目录"的两阶段过程
4. **任务状态信息不足**：任务列表仅显示总体进度百分比，无法告知用户当前具体阶段

---

## 2. 正确的上传流程定义

```
用户选择数据类型 → 选择文件 → [前端格式校验] → 确认上传
         ↓
    创建任务 → 阶段1：文件上传中 (0-25%)
         ↓
    阶段2：后端格式与质量校验 (25-60%)
         ├── 检查文件完整性
         ├── 验证时空属性（坐标系、时间范围等）
         └── 验证数据规范（如原始影像的卫星类型）
         ↓
    阶段3：数据解析 (60-85%)
         └── 解析文件内容、提取元数据
         ↓
    阶段4：写入数据目录/入库 (85-100%)
         ↓
    任务完成 → 显示结果信息
```

**各阶段可能失败的情况**：
- 阶段1（上传）：网络中断、文件过大
- 阶段2（校验）：缺少时空属性、数据格式不符合规范、原始影像卫星类型不支持
- 阶段3（解析）：文件损坏、格式与声明不匹配
- 阶段4（入库）：写入权限、磁盘空间不足

---

## 3. 代码改动总览

### 3.1 需要修改的文件

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `src/components/TaskList.tsx` | 扩展接口 + 修改 Hooks | Task接口新增stage/stageText/dataType/dataName字段，updateTaskProgress支持阶段信息更新 |
| `src/components/UploadFileModal.tsx` | 新增前端校验 + 修改回调签名 | 按数据类型做格式/大小校验，onUploadFile传递完整payload |
| `src/pages/Home.tsx` | 重写上传任务状态机 | 实现四阶段任务进度模拟，各阶段可能失败 |
| `src/components/TaskManagementCenter.tsx` | 扩展任务项UI | 显示当前阶段文字（如"后端格式与质量校验"） |

### 3.2 不改动的范围

- 工具箱功能点的任务流程（useTaskSimulation 保持不变）
- 导出弹窗逻辑
- 地图组件和侧边栏
- 任务管理中心的弹窗位置、样式框架

---

## 4. 详细修改步骤

### 步骤 1：扩展 Task 数据模型 (TaskList.tsx)

**改动点**：

```typescript
// Task 接口扩展
export interface Task {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  error?: string;
  fileSize?: string;
  dataType?: 'vector' | 'raster' | 'original-image' | '3d';  // 新增
  dataName?: string;                                            // 新增
  stage?: 'uploading' | 'validating' | 'parsing' | 'storing';   // 新增
  stageText?: string;                                           // 新增
}
```

**addTask 扩展**：

```typescript
// 当前签名：addTask(taskName: string, fileSize?: string): string
// 修改后：  addTask(taskName: string, fileSize?: string, dataType?: string, dataName?: string): string
// 创建时默认 stage: 'uploading', stageText: '正在上传文件'
```

**updateTaskProgress 扩展**：

```typescript
// 当前签名：updateTaskProgress(taskId: string, progress: number): void
// 修改后：  updateTaskProgress(taskId: string, progress: number, patch?: Partial<Task>): void
// patch 可包含 { stage, stageText, error 等 }
// 当 progress >= 100 且无 error 时标记为 completed
```

### 步骤 2：前端格式校验 (UploadFileModal.tsx)

**新增校验函数**：

```typescript
const validateFileByType = (file: File, dataType: string): string | null => {
  const MAX_SIZE = 20 * 1024 * 1024 * 1024; // 20GB
  
  // 1. 大小检查（所有类型）
  if (file.size > MAX_SIZE) return '文件大小超过 20GB 限制';
  
  // 2. 按数据类型检查格式
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
```

**handleConfirm 流程修改**：

```
点击"确定"时：
1. 调用 validateFileByType(selectedFile, selectedDataType)
2. 若校验失败，alert 错误信息，不关闭弹窗
3. 若校验通过，调用 onUploadFile({ file, dataType, dataName, description, checkProjection })
4. 关闭弹窗
```

**回调签名修改**：

```typescript
// 当前：onUploadFile?: (file: File) => void
// 修改后：
onUploadFile?: (payload: {
  file: File;
  dataType: string;
  dataName: string;
  description: string;
  checkProjection: boolean;
}) => void;
```

### 步骤 3：重写上传任务状态机 (Home.tsx)

**handleUploadFile 新实现**：

```typescript
const handleUploadFile = (payload: { file: File; dataType: string; dataName: string; description: string; checkProjection: boolean }) => {
  const fileSize = formatFileSize(payload.file.size);
  const taskId = addTask(`上传: ${payload.dataName}`, fileSize, payload.dataType, payload.dataName);
  setTaskCenterOpen(true);
  
  // 定义四阶段配置
  const stages = [
    { target: 25,  stage: 'uploading' as const,  text: '正在上传文件',           failRate: 0    },
    { target: 60,  stage: 'validating' as const, text: '后端格式与质量校验',     failRate: 0.15 },
    { target: 85,  stage: 'parsing' as const,    text: '正在解析数据',           failRate: 0.05 },
    { target: 100, stage: 'storing' as const,    text: '写入数据目录',           failRate: 0.03 },
  ];
  
  let currentStageIdx = 0;
  let progress = 0;
  
  // 初始化阶段信息
  updateTaskProgress(taskId, 0, { stage: 'uploading', stageText: stages[0].text });
  
  const tick = setInterval(() => {
    const stage = stages[currentStageIdx];
    progress += Math.random() * 5 + 2;
    
    if (progress >= stage.target) {
      progress = stage.target;
      updateTaskProgress(taskId, progress, { stage: stage.stage, stageText: stage.text });
      
      // 模拟阶段失败（按 failRate 概率）
      if (Math.random() < stage.failRate) {
        clearInterval(tick);
        const errorMsg = {
          uploading:  '上传失败：网络中断，请重试',
          validating: '校验失败：文件缺少时空属性或不符合数据规范',
          parsing:    '解析失败：文件内容损坏或格式不匹配',
          storing:    '入库失败：写入数据目录时发生错误',
        }[stage.stage];
        updateTaskStatus(taskId, 'failed', errorMsg);
        return;
      }
      
      // 进入下一阶段
      currentStageIdx++;
      if (currentStageIdx >= stages.length) {
        clearInterval(tick);
        updateTaskStatus(taskId, 'completed');
        return;
      }
      
      const next = stages[currentStageIdx];
      updateTaskProgress(taskId, progress, { stage: next.stage, stageText: next.text });
    } else {
      updateTaskProgress(taskId, progress);
    }
  }, 250);
};
```

### 步骤 4：任务项展示阶段信息 (TaskManagementCenter.tsx)

**在 TaskItemInCenter 中新增阶段文字展示**：

```typescript
// 在显示"提交时间、文件大小"的行下方，添加阶段信息
// 当 task.status === 'processing' 且存在 stageText 时：
<div className="text-xs text-gray-500 flex items-center gap-4 mt-1">
  <span>提交时间: {new Date(task.createdAt).toLocaleString()}</span>
  {task.fileSize && <span>文件大小: {task.fileSize}</span>}
  {task.stageText && task.status === 'processing' && (
    <span className="text-blue-600 font-medium">阶段: {task.stageText}</span>
  )}
</div>
```

---

## 5. 依赖与风险

### 5.1 依赖确认

- `addTask` 需向后兼容：工具箱功能点调用 `addTask(taskName)` 不带新增参数，需设为可选
- `updateTaskProgress` 的第二个参数需兼容：现有调用只传 `progress`，新增 `patch` 为可选
- `useTaskSimulation` 不受影响：仅工具箱模拟任务使用

### 5.2 风险点与应对

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| Task 接口改动影响现有类型检查 | 编译错误 | 所有新增字段设为可选（`?`），不影响旧代码 |
| updateTaskProgress 签名变更 | 已有调用可能报错 | 新增参数设为可选 `patch?: Partial<Task>`，默认 `{}` |
| 上传任务的完成态按钮显示 | 上传任务不应显示"导出到图层"等按钮 | 通过 `task.name.startsWith('上传:')` 判断隐藏按钮（已有此逻辑，保持即可） |
| 失败任务展示 | 失败时应显示具体阶段的错误信息 | 调用 `updateTaskStatus(taskId, 'failed', errorMsg)`，error 字段已支持 |

---

## 6. 验证清单（验收标准）

### 6.1 前端校验验证

- [ ] 选择矢量数据 + 非 .zip 文件 → 弹窗提示"矢量数据仅支持 .zip 压缩包"
- [ ] 选择栅格数据 + 非 .tif/.tiff 文件 → 弹窗提示格式错误
- [ ] 选择原始影像 + 非 .zip/.tar.gz 文件 → 弹窗提示格式错误
- [ ] 选择三维数据 + 非 .zip 文件 → 弹窗提示格式错误
- [ ] 校验失败后弹窗不关闭，可重新选择文件

### 6.2 四阶段任务流程验证

- [ ] 上传任务创建后，任务管理中心显示"阶段：正在上传文件"
- [ ] 进度到达 25% 后，切换为"阶段：后端格式与质量校验"
- [ ] 进度到达 60% 后，切换为"阶段：正在解析数据"
- [ ] 进度到达 85% 后，切换为"阶段：写入数据目录"
- [ ] 到达 100% 后标记为"已完成"

### 6.3 失败场景验证

- [ ] 模拟阶段2失败时，任务在任务管理中心显示为"处理失败"
- [ ] 失败任务显示具体错误信息（如"校验失败：文件缺少时空属性..."）
- [ ] 失败任务在"失败"分类标签中可找到

### 6.4 回归验证

- [ ] 工具箱功能点（正射校正、影像融合等）执行后任务流程正常
- [ ] 任务管理中心的分类统计（全部/进行中/已完成/失败）正确
- [ ] 上传完成的任务不显示"导出到图层/下载/另存到目录"按钮（已存在逻辑保持）

---

## 7. 实施顺序建议

1. 先改 `TaskList.tsx`：扩展 Task 接口和 Hooks 签名 → 基础数据模型就绪
2. 再改 `UploadFileModal.tsx`：添加前端校验 + 新回调签名 → 用户交互层就绪
3. 再改 `Home.tsx`：实现四阶段状态机 → 核心业务逻辑
4. 最后改 `TaskManagementCenter.tsx`：显示阶段文字 → 最终呈现层
5. 按【验证清单】逐项测试 → 确认无误
