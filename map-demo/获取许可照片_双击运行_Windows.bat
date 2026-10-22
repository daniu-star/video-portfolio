@echo off
chcp 65001 >nul
cd /d "%~dp0"
python "tools\获取许可照片.py"
pause
