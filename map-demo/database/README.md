# Spatial Demo Database V6

`spatial_demo.db` 是项目规范数据源。浏览器不直接查询 SQLite，而通过 `export_frontend_bundle.py` 导出为 `assets/data/database.bundle.js`，因此 `index.html` 可以离线运行。

主要表：`sources`、`sites`、`nodes`、`node_legends`、`districts`、`building_instances`、`roads`、`road_points`、`transport_assets`、`terrain_samples`、`structures`、`relations`、`metrics`、`story_chapters`、`timeline_states`、`themes`。

V6 推荐重建顺序：

```bash
python database/generate_v6_seed.py
python database/build_database.py
python database/export_frontend_bundle.py
python qa/validate_project.py
```

`VERIFIED` 仅表示事实或参数可以追溯公开来源；局部落位、footprint、道路细部、地形细部等仍可能为 `SIMULATED`。不要把 SIMULATED 几何声明为测绘数据。


### V7 P1
在 V6 表基础上新增 `spatial_features`、`media_assets`、`media_bindings`。执行 `build_database.py` 时重建稳定对象 ID 并从 `media_manifest.json` 导入已审核的公开图片。详见 `../docs/V7_P1_IMPLEMENTATION.md`。
