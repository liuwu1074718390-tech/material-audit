# SSH 连接问题排查 - 规则已存在但无法连接

## 情况说明
安全组规则已存在，但 SSH 连接仍然被拒绝。

## 排查步骤

### 1. 检查现有规则配置

在腾讯云控制台：

1. **查看规则详情**
   - 进入安全组规则页面
   - 找到 22 端口的规则
   - **检查以下几点**：

   ✅ **策略必须是"允许"**（不是"拒绝"）
   ✅ **协议端口必须是 TCP:22**
   ✅ **来源范围**：
      - 如果是 `0.0.0.0/0` = 允许所有IP（安全但可用）
      - 如果是特定IP = 确认是你的公网IP
      - 如果是 `127.0.0.1` = 只允许本地，需要修改

2. **如果规则策略是"拒绝"**
   - 删除该规则
   - 重新添加"允许"规则

3. **如果来源范围不对**
   - 编辑规则，修改来源为 `0.0.0.0/0`（临时测试）
   - 或添加你的公网IP

### 2. 检查是否有拒绝规则优先级更高

安全组规则按顺序执行，如果有拒绝规则在前面，会优先执行。

**解决方法**：
- 调整规则优先级，确保"允许"规则在"拒绝"规则之前
- 或删除冲突的拒绝规则

### 3. 使用腾讯云控制台登录检查服务器

如果安全组配置正确但仍无法连接，可能是服务器端问题：

1. **通过控制台登录服务器**
   - 服务器详情页 > 点击"登录"
   - 使用"标准登录方式"

2. **登录后检查 SSH 服务**

```bash
# 检查 SSH 服务状态
systemctl status sshd
# 或
systemctl status ssh

# 如果服务未运行，启动它
sudo systemctl start sshd
sudo systemctl enable sshd

# 检查 SSH 是否监听 22 端口
sudo netstat -tlnp | grep 22
# 或
sudo ss -tlnp | grep 22
```

3. **检查防火墙**

**Ubuntu/Debian:**
```bash
# 查看防火墙状态
sudo ufw status

# 如果防火墙开启，开放 22 端口
sudo ufw allow 22/tcp
sudo ufw reload
```

**CentOS:**
```bash
# 查看防火墙状态
sudo firewall-cmd --state

# 如果防火墙开启，开放 22 端口
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

4. **检查 SSH 配置文件**

```bash
# 检查 SSH 是否允许 root 登录
sudo grep "PermitRootLogin" /etc/ssh/sshd_config

# 如果显示 PermitRootLogin no，需要修改
sudo nano /etc/ssh/sshd_config
# 找到 PermitRootLogin，改为 yes
# 保存后重启 SSH 服务
sudo systemctl restart sshd
```

### 4. 检查服务器是否使用了非标准端口

有些服务器可能配置了非 22 端口的 SSH：

```bash
# 在服务器上检查 SSH 端口
sudo grep "Port" /etc/ssh/sshd_config
```

如果端口不是 22，连接时需要指定端口：
```bash
ssh -p 端口号 root@114.132.45.252
```

### 5. 测试端口连通性

在本地电脑测试端口是否开放：

```bash
# Mac/Linux
nc -zv 114.132.45.252 22

# 或使用 telnet
telnet 114.132.45.252 22

# 或使用 curl
curl -v telnet://114.132.45.252:22
```

如果显示 "Connection refused" = 端口未开放或服务未启动
如果显示 "Connection timed out" = 防火墙阻止或安全组未配置

---

## 快速修复方案

### 方案 A: 重新配置安全组规则

1. **删除现有 22 端口规则**（如果有问题）
2. **重新添加规则**：
   ```
   类型: 自定义
   来源: 0.0.0.0/0
   协议端口: TCP:22
   策略: 允许
   ```
3. **保存并等待 1-2 分钟**

### 方案 B: 使用控制台登录后修复

1. 通过控制台登录服务器
2. 执行以下命令：

```bash
# 启动 SSH 服务
sudo systemctl start sshd
sudo systemctl enable sshd

# 开放防火墙（Ubuntu/Debian）
sudo ufw allow 22/tcp
sudo ufw reload

# 或（CentOS）
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload

# 检查 SSH 配置
sudo grep "PermitRootLogin" /etc/ssh/sshd_config
# 如果是 no，修改为 yes
sudo sed -i 's/PermitRootLogin no/PermitRootLogin yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

---

## 验证步骤

1. **等待 2-3 分钟**（让所有配置生效）
2. **重试 SSH 连接**：
   ```bash
   ssh root@114.132.45.252
   ```
3. **如果还是不行，检查**：
   - 安全组规则策略是否为"允许"
   - 服务器 SSH 服务是否运行
   - 防火墙是否开放 22 端口

---

## 如果仍然无法连接

请提供以下信息：
1. 安全组规则的详细配置（策略、来源、端口）
2. 通过控制台登录后，执行 `systemctl status sshd` 的输出
3. 执行 `netstat -tlnp | grep 22` 的输出

