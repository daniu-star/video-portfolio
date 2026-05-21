# 🤖 Claude 工具箱 使用说明

## 📁 文件夹结构

```
D:\作品集\Claude工具箱\
├── 🎯 Claude工具箱.bat          ← 主程序（双击这个！）
├── 📂 01_启动脚本/
│   ├── 启动-claude.bat         ← 正常启动 Claude Code
│   └── claude-fix.bat          ← 修复模式启动（解决 OAuth 问题）
├── 📂 02_配置备份/
│   ├── claude-settings.json    ← Claude 配置文件
│   └── claude-state.json       ← Claude 状态文件
├── 📂 03_工具脚本/
│   └── update-api-key.bat      ← API Key 更新工具
├── 📂 04_安装包/
│   └── CC-Switch-v3.15.0-Windows.msi  ← CC-Switch 安装包
└── 📂 05_使用说明/
    └── README.md               ← 本文件
```

---

## 🚀 快速开始

### **方法 1：使用主程序（推荐）**

1. 双击 `Claude工具箱.bat`
2. 输入对应数字选择功能：
   - `1` → 启动 Claude Code
   - `2` → 修复模式启动
   - `3` → 更换 API Key
   - `4` → 启动 CC-Switch
   - `5` → 查看配置
   - `6` → 打开文件夹

### **方法 2：直接运行脚本**

- **正常启动**: 双击 `01_启动脚本\启动-claude.bat`
- **修复模式**: 双击 `01_启动脚本\claude-fix.bat`

---

## ⚙️ 配置详情

### **Claude Code 配置**

| 项目 | 值 | 说明 |
|------|-----|------|
| **版本** | v2.1.145 | 已安装 ✅ |
| **API 提供商** | DeepSeek | 第三方兼容服务 |
| **Base URL** | `https://api.deepseek.com/anthropic` | DeepSeek 兼容端点 |
| **默认模型** | `deepseek-v4-pro` | 高性能模型 |
| **快速模型** | `deepseek-v4-flash` | 便宜快速 |
| **认证方式** | API Key | 跳过 OAuth |

### **CC-Switch 配置**

| 项目 | 值 | 说明 |
|------|-----|------|
| **版本** | v3.15.0 | 已安装 ✅ |
| **安装路径** | `C:\Users\13067\AppData\Local\Programs\CC Switch\` | |
| **功能** | 管理 Claude/Codex/Gemini CLI | 多供应商切换 |

---

## 🛠️ 常见问题解决

### **Q1: 启动时显示 "API Error: 402 Insufficient Balance"**

**原因**: DeepSeek API 余额不足

**解决方案**:
1. 充值 DeepSeek 账户：https://platform.deepseek.com
2. 或更换其他 API Key（运行 `update-api-key.bat`）

---

### **Q2: 显示选项 1/2 认证选择界面**

**原因**: 首次启动或配置重置

**解决方案**:
- **务必选择 `2` (API Key)**，不要选 `1` (OAuth)
- 或使用 `claude-fix.bat` 自动跳过

---

### **Q3: "Failed to install Anthropic marketplace"**

**原因**: 第三方 API 不支持官方 Marketplace

**解决方案**:
- 已自动禁用（配置中设置了 `skipAnthropicMarketplace: true`）
- 忽略此错误即可，不影响使用

---

### **Q4: 无法访问 `/plugins discover`**

**原因**: 第三方 API 权限限制

**解决方案**:
- 这是正常现象，第三方 API 不支持此功能
- 使用 CC-Switch 管理插件和供应商

---

### **Q5: Claude 命令无法识别**

**原因**: PATH 环境变量未更新

**解决方案**:
1. 关闭所有命令提示符窗口
2. 重新打开新的命令提示符
3. 或直接使用本工具箱的启动脚本

---

## 📝 命令参考

### **Claude Code 常用命令**

```bash
# 交互模式
claude

# 非交互模式
claude -p "你的问题"

# 指定模型
claude --model deepseek-v4-flash

# 查看帮助
claude --help

# 查看版本
claude --version
```

### **CC-Switch 功能**

- 🔄 一键切换 API 供应商
- 🌐 支持 50+ 预设供应商
- 📊 用量统计和成本追踪
- 🔧 MCP/Skills 统一管理

---

## 🔗 有用链接

| 资源 | 链接 |
|------|------|
| **DeepSeek 平台** | https://platform.deepseek.com |
| **Claude Code 官方** | https://docs.anthropic.com/en/docs/claude-code |
| **CC-Switch GitHub** | https://github.com/farion1231/cc-switch |
| **CC-Switch 官网** | https://ccswitch.io |

---

## 📌 注意事项

1. **API Key 安全**
   - 不要将 API Key 分享给他人
   - 定期检查账户余额
   - 如泄露立即更换

2. **配置备份**
   - 本工具箱包含配置文件备份
   - 如遇问题可从 `02_配置备份` 恢复

3. **更新维护**
   - Claude Code: `npm update -g @anthropic-ai/claude-code`
   - CC-Switch: 从 GitHub Releases 下载新版本

---

## 📅 更新日志

### **v1.0 (2026-05-20)**
- ✅ 初始版本发布
- ✅ 整合 Claude Code 和 CC-Switch
- ✅ 创建统一管理界面
- ✅ 添加常用工具脚本
- ✅ 编写完整使用说明

---

## 📞 技术支持

如遇到问题：

1. 查看 `05_使用说明\README.md`
2. 运行 `Claude工具箱.bat` → 选择 `5` 查看配置
3. 尝试 `claude-fix.bat` 修复模式启动
4. 检查网络连接和 API 余额

---

**🎉 祝你使用愉快！如有问题随时查看本文档。**
