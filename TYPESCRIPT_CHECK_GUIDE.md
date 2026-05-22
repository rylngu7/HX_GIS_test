# TypeScript 检查工作流程

## 自动检查机制

本项目已配置 **Git 预提交钩子**，每次执行 `git commit` 时会自动运行 TypeScript 类型检查。

### 检查流程

```
git commit → TypeScript 检查 → 通过 → 提交成功
                    ↓
                 失败 → 阻止提交，提示修复
```

## 可用命令

```bash
# 单独运行 TypeScript 类型检查
npm run check

# 运行完整构建（包含类型检查）
npm run build

# 运行 ESLint 检查
npm run lint
```

## 推送前检查清单

在执行 `git push` 前，请确保：

1. ✅ 本地运行 `npm run check` 无错误
2. ✅ 本地运行 `npm run build` 成功
3. ✅ 使用 `git commit` 时自动检查通过

## Git Hook 说明

### pre-commit 钩子
- 位置：`.git/hooks/pre-commit`
- 功能：每次提交前自动运行 TypeScript 检查
- 可选项：可取消注释以启用 ESLint 检查

### 临时跳过检查（慎用）
```bash
git commit --no-verify -m "你的提交信息"
```

## Vercel 部署提示

如果本地检查通过但 Vercel 部署仍失败：
1. 检查是否有未提交的类型定义文件
2. 确认本地和远程使用相同的 TypeScript 版本
3. 清除 Vercel 构建缓存后重新部署

## 常见 TypeScript 错误修复

### 类型推断问题
```typescript
// 错误写法
const [data, setData] = useState('');

// 正确写法 - 显式声明类型
const [data, setData] = useState<'type1' | 'type2'>('type1');
```

### Props 类型问题
```typescript
// 确保组件 props 有正确的类型定义
interface ComponentProps {
  dataType: 'vector' | 'image' | '3d';
}
```
