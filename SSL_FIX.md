# 🔧 SSL 连接问题修复

## 问题诊断

错误信息：
```json
{
  "status": "error",
  "message": "Server does not support secure connection",
  "error": {
    "code": "HANDSHAKE_NO_SSL_SUPPORT"
  }
}
```

## 问题原因

代码中自动为腾讯云 CDB 数据库启用了 SSL 连接，但你的数据库实例可能不支持 SSL，导致连接失败。

## ✅ 已修复

我已经修改了代码，现在：
- **默认不使用 SSL**（`ssl: undefined`）
- 只有当环境变量 `DB_SSL=true` 时才启用 SSL
- 这样可以兼容不支持 SSL 的数据库实例

## 🚀 部署状态

修复后的代码已重新部署，现在应该可以正常连接数据库了。

## 🔍 验证

部署完成后，访问诊断接口验证：

```
https://你的vercel地址.vercel.app/api/health/db-check
```

应该看到：
- `status: 'ok'`（如果数据库表存在）
- 或 `status: 'error'` 但错误不再是 `HANDSHAKE_NO_SSL_SUPPORT`

## 📝 如果需要启用 SSL

如果你的数据库支持 SSL 并希望使用 SSL 连接，可以在 Vercel 环境变量中添加：

```
DB_SSL=true
```

但根据当前错误，你的数据库不支持 SSL，所以**不需要**添加这个变量。

## ✅ 下一步

1. 等待部署完成
2. 访问诊断接口验证连接
3. 如果连接成功但表不存在，请执行 `database/schema.sql` 初始化数据库
4. 访问应用主页，验证任务列表功能




