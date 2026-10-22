@echo off
chcp 65001 >nul
cd /d "%~dp0"
python tools\导入自有现场照片.py
if errorlevel 1 goto failed
python 生成离线照片版压缩包.py
if errorlevel 1 goto failed
echo.
echo 已完成。新的 ZIP 位于工程文件夹的上一级。
pause
exit /b 0
:failed
echo 发生错误，请确认已安装 Python 与 Pillow：pip install Pillow
pause
exit /b 1
