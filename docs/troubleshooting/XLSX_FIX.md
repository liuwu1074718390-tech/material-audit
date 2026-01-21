# xlsx 模块错误修复说明

## 问题描述

部署到 Vercel 后出现错误：
```
500 - Cannot find module '/vercel/path0/node_modules/xlsx/dist/cpexcel.js'
```

## 问题原因

`xlsx` 是一个客户端专用的库（用于在浏览器中解析和生成 Excel 文件），但在 Nuxt 3 的 SSR 环境中，服务器端也会尝试打包这个库。`xlsx` 包含很多子模块（如 `cpexcel.js`），在 Vercel 的服务器函数环境中无法正确加载。

## 修复方案

### 1. 使用动态导入

将 `xlsx` 的导入改为动态导入，确保只在客户端加载：

**修改前**：
```typescript
import * as XLSX from 'xlsx'
```

**修改后**：
```typescript
let XLSX: any = null
const getXLSX = async () => {
  if (!XLSX && process.client) {
    XLSX = await import('xlsx')
  }
  return XLSX
}
```

### 2. 更新使用方式

在使用 `xlsx` 的函数中，先动态加载库：

```typescript
const parseExcelFile = (file: File): Promise<ExcelRowData[]> => {
  return new Promise(async (resolve, reject) => {
    if (!process.client) {
      reject(new Error('Excel parsing is only available on client side'))
      return
    }
    
    const xlsxLib = await getXLSX()
    if (!xlsxLib) {
      reject(new Error('Failed to load xlsx library'))
      return
    }
    
    // 使用 xlsxLib 替代 XLSX
    const workbook = xlsxLib.read(data, { type: 'binary' })
    // ...
  })
}
```

### 3. 配置文件更新

在 `nuxt.config.ts` 中配置 Vite：

```typescript
vite: {
  ssr: {
    // 确保 xlsx 在服务器端也被正确处理
    noExternal: ['xlsx']
  }
}
```

## 修改的文件

1. ✅ `components/UploadDialog.vue` - Excel 文件解析
2. ✅ `components/AuditResultTable.vue` - Excel 文件导出
3. ✅ `nuxt.config.ts` - Vite SSR 配置

## 部署信息

**最新部署地址**: https://material-price-audit-5q3mevvwn-liuwu1074718390-2892s-projects.vercel.app

## 验证

请访问应用并测试：
1. ✅ 上传 Excel 文件
2. ✅ 导出审计结果为 Excel

如果仍有问题，请检查浏览器控制台的错误信息。

## 备用方案

如果动态导入仍然有问题，可以考虑：

1. **完全禁用这些组件的 SSR**：
   ```vue
   <template>
     <ClientOnly>
       <UploadDialog />
     </ClientOnly>
   </template>
   ```

2. **使用服务器端 API 处理 Excel**：
   - 将 Excel 解析移到服务器端 API 路由
   - 客户端只负责上传文件和显示结果

