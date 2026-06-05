# 导航栏和侧边栏优化实现计划

## 1. 仓库研究结论

当前项目结构：
- 使用 React + TypeScript + Vite 技术栈
- 主要组件在 `/workspace/src/components/` 目录
- 页面在 `/workspace/src/pages/` 目录
- 已有 Header、Sidebar、Home 等核心组件
- 使用 Tailwind CSS 进行样式设计
- 项目已有完整的基础架构

## 2. 文件和模块修改

### 2.1 需修改的现有文件

| 文件路径 | 修改内容 |
|---------|---------|
| [Header.tsx](file:///workspace/src/components/Header.tsx) | 更新顶部导航栏，添加完整的12个菜单项 |
| [Home.tsx](file:///workspace/src/pages/Home.tsx) | 添加导航切换功能、新建组件引入和状态管理 |
| [TaskManagementCenter.tsx](file:///workspace/src/components/TaskManagementCenter.tsx) | 调整弹窗位置，使其更靠近图标但不重叠 |
| [Toolbox.tsx](file:///workspace/src/components/Toolbox.tsx) | 调整弹窗位置，使其更靠近图标但不重叠 |

### 2.2 需新建的文件

| 文件路径 | 功能描述 |
|---------|---------|
| [ModelCompute.tsx](file:///workspace/src/components/ModelCompute.tsx) | 模型计算主页面组件 |
| [SampleAnnotation.tsx](file:///workspace/src/components/SampleAnnotation.tsx) | 样本解译（样本标注）页面 |
| [SampleManagement.tsx](file:///workspace/src/components/SampleManagement.tsx) | 样本管理（样本集管理）页面 |
| [ModelComputeSidebar.tsx](file:///workspace/src/components/ModelComputeSidebar.tsx) | 模型计算侧边栏 |

## 3. 实现步骤

### 步骤1：优化弹窗位置（任务管理中心和工具箱）

1. 分析当前弹窗位置与图标的间距
2. 调整 [TaskManagementCenter.tsx](file:///workspace/src/components/TaskManagementCenter.tsx) 中的位置样式
3. 调整 [Toolbox.tsx](file:///workspace/src/components/Toolbox.tsx) 中的位置样式
4. 确保弹窗与图标靠近但不重叠

### 步骤2：更新顶部导航栏

1. 在 [Header.tsx](file:///workspace/src/components/Header.tsx) 中添加完整的12个菜单项：
   - 数据概览
   - 数据汇聚
   - 数据管理
   - 数据建模
   - 数据治理
   - 数据计算
   - 知识图谱
   - 资产目录
   - 模型计算（新增）
   - 数据质量
   - 数据安全
   - 系统管理

2. 添加导航项点击状态管理
3. 保持现有UI风格一致

### 步骤3：创建模型计算模块

#### 3.1 创建 ModelCompute 主组件
- 包含左侧导航和主内容区布局
- 支持切换样本解译和样本管理

#### 3.2 创建 ModelComputeSidebar 组件
- 左侧导航栏
- 样本解译、样本管理两个菜单项
- 样式与现有 Sidebar 保持一致

#### 3.3 创建 SampleAnnotation（样本解译）组件
- 样本列表展示
- 样本标注功能界面
- 与现有UI风格一致

#### 3.4 创建 SampleManagement（样本管理）组件
- 样本集列表展示
- 样本集管理功能界面
- 与现有UI风格一致

### 步骤4：集成到 Home 页面

1. 在 [Home.tsx](file:///workspace/src/pages/Home.tsx) 中添加导航状态管理
2. 条件渲染不同模块（数据管理/模型计算）
3. 保持现有功能完整性

## 4. 潜在依赖和考虑事项

1. **UI一致性**：确保所有新增组件与现有系统风格保持一致
2. **图标选择**：使用 Lucide React 图标库保持一致性
3. **状态管理**：使用 React useState 进行组件间状态传递
4. **组件复用**：尽可能复用现有组件和样式
5. **参考图片**：虽然有参考图，但主要根据现有代码风格实现

## 5. 风险处理

| 风险 | 预防措施 |
|-----|---------|
| 导航切换可能导致现有功能问题 | 先备份现有代码，逐步修改并测试 |
| 弹窗位置调整不当 | 仔细计算间距，确保视觉效果良好 |
| 新增组件样式不统一 | 严格遵循现有 Tailwind 类名规范 |
