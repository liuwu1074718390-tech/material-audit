# CloudStudio 快速修复指南

## 🔴 当前问题

1. **缺少 vite 包**：`Cannot find package 'vite'`
2. **Banner 错误**：`Cannot read properties of null (reading 'name')`

## ✅ 快速修复步骤

### 方法 1: 使用修复脚本（推荐）

在 CloudStudio 终端执行：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 运行依赖修复脚本
bash scripts/fix-deps.sh

# 3. 尝试构建
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 方法 2: 手动修复

```bash
# 1. 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 2. 如果 vite 仍然缺失，手动安装
npm install --legacy-peer-deps vite@latest @vitejs/plugin-vue@latest

# 3. 验证依赖
node scripts/check-deps.js

# 4. 尝试构建
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 方法 3: 如果 Banner 错误仍然存在

Banner 错误是 Nuxt CLI 的已知 bug。可以尝试：

```bash
# 1. 清理所有缓存
rm -rf node_modules .nuxt .output package-lock.json

# 2. 重新安装
npm install --legacy-peer-deps

# 3. 运行 nuxt prepare
npx nuxt prepare

# 4. 尝试构建（即使 banner 报错，构建可能仍然成功）
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 5. 检查构建输出
ls -la .output/
```

## 🔍 诊断步骤

如果构建仍然失败：

1. **检查依赖完整性**：
   ```bash
   node scripts/check-deps.js
   ```

2. **检查 vite 是否安装**：
   ```bash
   ls -la node_modules/vite
   ```

3. **检查 node_modules 大小**：
   ```bash
   du -sh node_modules
   ```
   如果太小（< 100MB），说明依赖安装不完整

4. **查看详细错误**：
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build 2>&1 | tee build.log
   ```

## 💡 常见问题

### Q: 为什么 vite 会缺失？

A: 可能的原因：
- 使用 `--legacy-peer-deps` 时某些依赖没有正确安装
- npm 缓存问题
- CloudStudio 环境限制

### Q: Banner 错误可以忽略吗？

A: 理论上可以，如果构建输出生成了。但实际上 banner 错误会导致构建进程立即退出，所以无法忽略。

### Q: 有没有其他解决方案？

A: 可以尝试：
1. 降级 Nuxt 版本（不推荐）
2. 使用不同的 Node.js 版本
3. 联系 CloudStudio 支持

## 📞 获取帮助

如果所有方法都失败：
1. 查看构建日志中的详细错误
2. 检查 CloudStudio 的环境限制
3. 考虑使用其他部署平台（如 Vercel、Netlify）

---

**最后更新**: 2025-12-11

