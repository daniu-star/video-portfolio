@echo off
chcp 65001 >nul
title  🤖  Claude 工具箱 - 统一管理器
color 0A
echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║        🤖  Claude 工具箱 v1.0                  ║
echo  ║        统一管理 Claude Code & CC-Switch       ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  [📦 可用工具]
echo.
echo    1️⃣  启动 Claude Code (推荐)
echo    2️⃣  启动 Claude Code (修复模式)
echo    3️⃣  更换 API Key
echo    4️⃣  启动 CC-Switch
echo    5️⃣  查看配置信息
echo    6️⃣  打开工具箱文件夹
echo.
echo    0️⃣  退出
echo.
set /p choice="请输入选项编号 (0-6): "

if "%choice%"=="1" goto :start_claude
if "%choice%"=="2" goto :fix_claude
if "%choice%"=="3" goto :update_key
if "%choice%"=="4" goto :cc_switch
if "%choice%"=="5" goto :show_config
if "%choice%"=="6" goto :open_folder
if "%choice%"=="0" goto :exit_program

echo ❌ 无效选项，请重新运行
pause
goto :eof

:start_claude
echo.
echo 🚀 正在启动 Claude Code...
call "%~dp01_启动脚本\启动-claude.bat"
goto :eof

:fix_claude
echo.
echo 🔧 正在以修复模式启动 Claude Code...
call "%~dp01_启动脚本\claude-fix.bat"
goto :eof

:update_key
echo.
echo 🔑 正在打开 API Key 更新工具...
call "%~dp03_工具脚本\update-api-key.bat"
goto :eof

:cc_switch
echo.
echo 🎛️ 正在启动 CC-Switch...
start "" "C:\Users\13067\AppData\Local\Programs\CC Switch\cc-switch.exe"
if %errorlevel% neq 0 (
    echo ⚠️  CC-Switch 未找到，请检查是否已安装
    echo 💡 安装包位置: %~dp04_安装包\CC-Switch-v3.15.0-Windows.msi
    pause
)
goto :eof

:show_config
echo.
echo 📋 当前配置信息:
echo ──────────────────────────────────────
echo   API 提供商: DeepSeek (第三方)
echo   Base URL: https://api.deepseek.com/anthropic
echo   默认模型: deepseek-v4-pro
echo   快速模型: deepseek-v4-flash
echo   版本: Claude Code v2.1.145
echo   CC-Switch: v3.15.0
echo ──────────────────────────────────────
echo.
echo 📁 配置文件备份位置:
echo   %~dp02_配置备份\
echo.
pause
goto :eof

:open_folder
echo.
echo 📂 正在打开工具箱文件夹...
explorer "%~dp0"
goto :eof

:exit_program
echo.
echo 👋 感谢使用 Claude 工具箱！
timeout /t 2 >nul
exit /b 0
