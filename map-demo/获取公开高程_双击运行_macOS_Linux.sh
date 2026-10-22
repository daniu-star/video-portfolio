#!/bin/sh
cd "$(dirname "$0")" || exit 1
python3 -m pip install --user requests pillow || exit 2
python3 tools/下载并构建真实地形.py --zoom 12
