# Source Update Notes

这不是实时数据库。项目以 2026-08-22 前可公开核验的数据为事实层，MVP 几何层专门用于 3D 表达。

如果未来更新事实数据：
1. 修改 `seed_data.json` 的 VERIFIED 记录；
2. 运行 `python database/build_database.py`；
3. 运行 `python database/export_frontend_bundle.py`；
4. 运行 `python qa/validate_project.py`。

SIMULATED 的道路折线、地形采样和节点场景坐标可单独优化，不应改写为“官方坐标”。
