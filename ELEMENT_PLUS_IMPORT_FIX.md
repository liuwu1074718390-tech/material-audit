# Element Plus 按需导入完成

## ✅ 已完成的修改

### 1. 修改 `plugins/element-plus.ts`

从全量导入改为按需导入，只导入实际使用的组件：

```typescript
// 按需导入 Element Plus 组件，减少构建负担
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElUpload,
  ElCascader,
  ElDatePicker,
  ElTag,
  ElIcon,
  ElPagination,
  ElText,
  ElAlert,
  ElConfigProvider,
  ElMessage,
  ElMessageBox
} from 'element-plus'
```

### 2. 修改 `nuxt.config.ts`

在 `vite.optimizeDeps` 中排除 element-plus：

```typescript
optimizeDeps: {
  include: ['dayjs/esm'],
  exclude: ['element-plus']  // 使用按需导入
}
```

## 📋 使用的组件列表

根据代码分析，实际使用的组件有：

- **基础组件**: Button, Table, TableColumn, Dialog, Form, FormItem
- **输入组件**: Input, Select, Option, Upload, Cascader, DatePicker
- **展示组件**: Tag, Icon, Pagination, Text, Alert
- **布局组件**: ConfigProvider
- **方法**: Message, MessageBox

## 🚀 下一步

1. **拉取最新代码**：
   ```bash
   git pull origin main
   ```

2. **清理缓存**：
   ```bash
   rm -rf .nuxt .output node_modules/.vite
   ```

3. **重新构建**：
   ```bash
   NODE_OPTIONS="--max-old-space-size=8192" npm run build
   ```

## 💡 预期效果

- ✅ 构建时处理的文件数量大幅减少
- ✅ 内存使用降低
- ✅ 构建速度加快
- ✅ 构建卡死问题应该得到解决

## ⚠️ 注意事项

如果构建时出现组件未找到的错误，可能需要：

1. 检查是否所有使用的组件都已导入
2. 确保 ElMessage 和 ElMessageBox 在组件中正确导入

---

**最后更新**: 2025-12-11

