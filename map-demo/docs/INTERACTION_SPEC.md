# Interaction Spec V6

## 1. Camera
- Drag: orbit
- Wheel: zoom
- Double click: reset to current region recommended shot
- Site switch: cinematic camera fly

## 2. Spatial node click
`3D node hit -> highlight -> camera focus -> Node Dossier -> Inspector`

每个 Node Dossier 显示：建设时间、开放时间、最新公开流量口径、统计期、数据状态、来源。

## 3. Temporal Scene Engine
时间轴在所有主题下持续生效，不要求用户进入 timeline 模式。

拖动会同时改变：
- FAST dish / Huajiang bridge completion
- visible 3D buildings and growth height
- 3D road completeness and road width maturity
- vehicle / tourist particle density
- scene atmosphere and timeline color energy

底部同步显示 `设施 / 道路 / 建筑 / 流动` 四个动态进度。

## 4. FAST
- 大窝凼三维地形
- 500m dish
- 5 / 10 / 30 km quiet zone radiation
- 天文小镇 building massing
- 天幕商业街 canopy
- 99.999m time tower
- tourist/transit relations

## 5. Huajiang
- canyon + river
- suspension bridge structure growth
- 625m / 1420m engineering HUD
- extruded S57 / Yundu / village roads
- Yundu 3D building cluster
- Kelizhai village + service cluster
- Xiao-Huajiang settlement
- vehicle / shuttle / visitor flows

## 6. Overview
Single 3D world displaying regional highway relationships and both super-infrastructure anchors. It is not two independent maps.


## 7. V6 Node State
所有节点交互必须走 `App.selectNode(id)`。Canvas、节点列表、Story 不得各自直接渲染 Legend。`selected` 状态变化会自动刷新 Dossier、Inspector 与相机。

## 8. V6 Temporal Shock
每次 slider input 除修改 world state 外，还触发屏幕空间冲击环、道路光谱轨迹与环境色脉冲，保证任何拖动都有即时地图反馈。
