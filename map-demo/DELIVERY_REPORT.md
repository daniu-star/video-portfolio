# V7 Stage 2 delivery update

- Added: `docs/V7_P2_DRIVING_IMPLEMENTATION.md`.
- Drive demo: Huajiang only, route-locked, conceptual; 4 camera modes, 7 chapters, snapshot restore.
- QA: 36/36 V7-P2 tests; 17/17 P1 browser tests; SQLite validation passed.
- Known limitations: Canvas 2D projection and simulated road + terrain; no real routing, lane/legal geometry, live traffic or publicly cleared building photos.

---

# Spatial Cinema MVP V6.0 — Delivery Report

## 本轮核心修复

V6 针对 V5 的四项真实体验缺陷进行系统重构：房屋空间关系不真实、建筑形态同质化、节点 Dossier 切换反馈失效、时间轴变化感不足；并新增 AAA 东方史诗式产品序章。

## 空间建模

### FAST / 平塘天文小镇

- 将 FAST 核心与天文小镇拆成两个真实逻辑不同的空间单元；
- 天文小镇相对 FAST 保持约 6km 关系；
- 小镇按照官方航拍可辨认的公共建筑核心、中轴商业街、红顶居住组团关系重新生成；
- 居住建筑沿三条弧形街道与环路吸附，不再规则方阵；
- Scene Engine 支持弧形展馆、翼状游客中心、穹顶、塔、天幕街、酒店、住宅复合院等差异形态。

### 花江 / 云渡 / 科力寨 / 小花江

- 科力寨按坡地道路的三条分叉组织 25 户核心住宅及旅游服务设施；
- 小花江按 102 户村落规模生成路网吸附式坡地聚落，并区分已营业民宿、在建民宿、餐饮和普通住宅；
- 云渡服务区建筑沿服务区环路组织；
- 峡谷、河流、桥体与聚落标高共同参与场景表达。

## 节点交互

`selected node` 已成为唯一状态源。Canvas 点选、列表点选和 Story 选择不再各自维护图例逻辑。58 节点全部 1:1 绑定图例，数据库中大部分 Dossier 内容具有独立的 identity/scale/context/relation 信息，因此节点变化会带来可感知的内容变化。

## 动态系统

新增 Temporal Shock：拖动时间轴时产生环境闪变、空间冲击环、道路光谱轨迹，并同步改变建筑、道路、桥梁、流量与氛围。滚动时间轴不再只是 UI 数字变化。

## AAA 首页

新增 `prologue.css` 和独立序章 DOM：墨色山体、雾层、金石质感、篆印、胶片层与单一主入口。视觉方向参考东方神话 AAA 游戏的“沉静、史诗、金石、山雾”语言，不复制任何商业游戏的 UI、字体、图像或资产。

首页唯一交互按钮：**进入3D地图**。

署名：陈俊良。

数据提供：中央民族大学新闻与传播学院赴贵州省“大国工程”调研团联合贵州民族大学“聚力黔山 共结籽情”实践团。

## QA

- SQLite `PRAGMA integrity_check = ok`
- 496 building instances
- 10090 terrain samples
- 58 nodes / 58 legends
- 23 roads / 154 road points
- 304 transport assets
- 13 timeline states
- 本地 JS 全部 `node --check` 通过
- `qa/validate_project.py`：`PROJECT VALID V6`
- Chromium 在当前执行环境对 `127.0.0.1` 导航仍被管理员策略阻断，因此没有虚报浏览器视觉回归通过；代码、数据库、依赖引用与脚本级 QA 已真实执行。
