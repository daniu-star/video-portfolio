@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (set "PY=py -3") else (set "PY=python")
%PY% -m pip install --disable-pip-version-check requests pillow
if errorlevel 1 (
 echo Python 依赖安装失败。请先安装 Python 3，确保已联网后重试。
 pause
 exit /b 1
)
%PY% "tools\下载并构建真实地形.py" --zoom 12
if errorlevel 1 (
 echo 公开高程下载未完成，地图将继续标记为模拟地形。
 pause
 exit /b 1
)
echo 公开高程文件已生成。刷新或重新打开 index.html 即可使用。
pause
