
# 上传文件任务进度展示实施计划

## 1. 需求分析
- 将上传文件操作集成到任务管理中心
- 在任务管理中心展示上传进度
- 显示上传文件的信息：提交时间、文件大小
- 模拟完整的上传流程

## 2. 现有代码分析
- `TaskList.tsx`：定义了任务接口和任务管理 hooks，但缺少 fileSize 字段
- `Home.tsx`：主页面组件，需要添加上传文件的处理逻辑
- `UploadFileModal.tsx`：上传文件弹窗，需要回调通知上传事件
- `TaskManagementCenter.tsx`：任务管理中心，需要显示文件大小信息

## 3. 具体修改步骤

### 3.1 修改 TaskList.tsx
- 在 `Task` 接口中添加 `fileSize?: string` 字段
- 修改 `addTask` 函数，使其可以接收并存储文件大小参数
- 更新 `TaskItem` 组件，在显示时间的同时显示文件大小

### 3.2 修改 Home.tsx
- 添加 `handleUploadFile` 函数，用于处理上传文件任务
- 添加 `simulateUploadProgress` 函数，模拟上传进度
- 添加 `formatFileSize` 函数，格式化文件大小显示
- 修改 `UploadFileModal` 组件的调用，传入上传回调函数

### 3.3 修改 UploadFileModal.tsx
- 修改组件 props 接口，添加 `onUploadFile` 回调
- 修改 `handleConfirm` 函数，调用上传回调并传入选择的文件

### 3.4 修改 TaskManagementCenter.tsx
- 修改 `TaskItemInCenter` 组件，添加文件大小显示
- 调整任务管理中心位置，使其靠近图标按钮

## 4. 关键实现细节
- 保持与现有任务管理系统的一致性
- 确保文件大小格式友好显示（B、KB、MB）
- 模拟真实的上传进度，避免瞬间完成
- 上传开始时自动打开任务管理中心

## 5. 文件清单
- `/workspace/src/components/TaskList.tsx`
- `/workspace/src/pages/Home.tsx`
- `/workspace/src/components/UploadFileModal.tsx`
- `/workspace/src/components/TaskManagementCenter.tsx`
