#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
python3 -m pip install Pillow
python3 tools/导入自有现场照片.py
printf '\n请核对摄影者、地理归属与传播授权后再发布。\n'
