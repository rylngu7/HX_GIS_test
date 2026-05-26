# 避免版本回退问题的 Git 工作流 Skill

## 问题背景

在项目开发过程中，曾多次遇到代码修改后未及时提交到 Git 仓库，导致项目环境重置时版本回退到旧版本的问题。本 Skill 旨在建立规范的 Git 工作流，避免此类问题再次发生。

## 核心原则

**每次完成功能修改后立即提交，定期推送到远程仓库**

## Git 工作流规范

### 1. 开发分支管理

- 使用专用功能分支进行开发，如 `feature/xxx` 或 `trae/solo-agent-xxx`
- 主分支（main/master）保持稳定可部署状态

### 2. 及时提交代码

每次完成一个功能点或修复一个 bug 后，立即执行：

```bash
# 查看变更
git status

# 添加修改的文件
git add <文件名>
# 或添加所有变更
git add .

# 提交（使用清晰的提交信息
git commit -m "描述性提交信息"
```

### 3. 功能完成后合并到 main 并推送

```bash
# 切换到 main 分支
git checkout main

# 合并功能分支
git merge <功能分支名>

# 推送到远程仓库
git push origin main
```

### 4. 定期推送远程

每次本地提交后，及时推送到远程仓库，确保代码安全备份。

## 提交信息规范

使用明确的提交信息格式：

- `feat: 新增功能描述`
- `fix: 修复问题描述`
- `refactor: 重构描述`
- `docs: 文档更新`
- `style: 样式调整`

## 完整工作流示例

```bash
# 1. 创建新功能开发
git checkout -b feature/new-feature

# 2. 开发过程中，每次完成一点就提交
git add .
git commit -m "feat: 实现任务列表功能"

# 3. 功能完成后合并到 main
git checkout main
git merge feature/new-feature
git push origin main
```

## 检查清单

- [ ] 每次功能修改后立即执行 `git add` 和 `git commit`
- [ ] 定期执行 `git push` 到远程仓库
- [ ] 提交信息清晰描述变更内容
- [ ] 功能完成后及时合并到 main 分支

