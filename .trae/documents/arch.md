
## 1. Architecture Design
```mermaid
graph TB
    subgraph "前端层"
        A[React 18]
        B[Tailwind CSS 3]
        C[Vite 构建工具]
    end
    subgraph "组件层"
        D[顶部导航栏]
        E[侧边数据目录]
        F[地图视图]
        G[工具箱]
    end
    A --&gt; D
    A --&gt; E
    A --&gt; F
    A --&gt; G
```

## 2. Technology Description
- 前端: React@18 + TypeScript + tailwindcss@3 + vite
- 初始化工具: vite-init
- 后端: 无（纯前端展示）
- 数据库: 无
- 图标库: lucide-react

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | 数据管理主页 |

## 4. Data Model (不适用，纯前端展示)

## 5. File Structure
```
/workspace
├── src/
│   ├── components/
│   │   ├── Header.tsx          # 顶部导航栏
│   │   ├── Sidebar.tsx         # 侧边数据目录
│   │   ├── MapView.tsx         # 地图视图
│   │   └── Toolbox.tsx         # 工具箱
│   ├── pages/
│   │   └── DataManagement.tsx  # 数据管理主页
│   ├── App.tsx                 # 根组件
│   └── main.tsx                # 入口文件
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

