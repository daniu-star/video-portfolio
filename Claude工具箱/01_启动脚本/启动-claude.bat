@echo off
echo ============================================
echo   Claude Code 快捷启动器 v2.1.145
echo ============================================
echo.
echo 正在启动 Claude Code...
echo.

REM 刷新环境变量（确保 PATH 生效）
set PATH=%PATH%;D:\trae\node_global

REM 启动 claude
claude %*

pause
