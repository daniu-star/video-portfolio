@echo off
chcp 65001 >nul
echo ============================================
echo   Claude Code 修复工具 - 强制 API Key 模式
echo ============================================
echo.

echo [1/4] 检查 Claude Code 安装...
where claude >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 claude 命令，请先确保 PATH 配置正确
    pause
    exit /b 1
)
echo ✅ Claude Code 已安装

echo.
echo [2/4] 清理 OAuth 缓存（解决 Marketplace 错误）...
if exist "%USERPROFILE%\.claude\oauth_cache" (
    rmdir /s /q "%USERPROFILE%\.claude\oauth_cache" 2>nul
    echo ✅ 已清理 OAuth 缓存
) else (
    ℹ️  无需清理 OAuth 缓存
)

if exist "%USERPROFILE%\.claude\auth.json" (
    del /q "%USERPROFILE%\.claude\auth.json" 2>nul
    echo ✅ 已清理 auth.json
)

echo.
echo [3/4] 设置环境变量（强制使用 DeepSeek API）...
set ANTHROPIC_AUTH_TOKEN=sk-a6f692b99ffe4120bc4cf6e49ebf5134
set ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
set ANTHROPIC_MODEL=deepseek-v4-pro
set SKIP_ANTHROPIC_MARKETPLACE=true
echo ✅ 环境变量已设置

echo.
echo [4/4] 启动 Claude Code（API Key 模式）...
echo ============================================
echo ⚠️  重要提示：
echo    - 如果出现选项界面，请选择【选项 2: API Key】
echo    - 不要选择选项 1（OAuth），否则会再次失败！
echo ============================================
echo.

claude %*

echo.
echo ============================================
echo   Claude Code 已退出
echo ============================================
pause
