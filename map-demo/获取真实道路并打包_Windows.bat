@echo off
chcp 65001 >nul
cd /d "%~dp0"
python "tools\导入贵州开放路网.py" --overpass
if errorlevel 1 (
  echo 道路数据下载失败，原始文件未被替换。也可以从Geofabrik下载贵州GeoPackage后使用 --input 导入。
) else (
  echo 道路已保存到 assets\data\offline_roads.js ，再次启动网页即可读取。
)
pause
