@echo off
chcp 65001 >nul
cd /d "%~dp0"
python -m pip install Pillow
python "tools\导入自有现场照片.py"
echo.
echo 请核对摄影者、地理归属与传播授权后再发布。
pause
