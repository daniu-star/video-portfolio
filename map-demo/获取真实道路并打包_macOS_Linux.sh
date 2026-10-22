#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
python3 "tools/导入贵州开放路网.py" --overpass
printf '已更新 assets/data/offline_roads.js，请刷新网页。\n'
