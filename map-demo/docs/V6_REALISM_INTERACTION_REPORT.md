# V6 真实空间约束、节点交互与电影动态重构

## 建筑真实性原则

V6 不再将“建筑数量”视为质量本身。建筑落位需要同时满足：道路邻近、朝向随道路、标高随地形、聚落边界、功能分区与公开航拍空间关系。无法获得真实 footprint 的建筑明确使用 `SIMULATED`，并在数据库记录 `placement_basis` 与 `realism_grade`。

## 三种空间生成方法

1. `aerial_reference_constrained`：依据公开航拍识别大型建筑、广场、居住组团的相对关系。
2. `road_aligned_aerial_constrained`：住宅/商铺沿道路切线布置，并叠加坡地高度。
3. `road_aligned_reference_constrained`：村寨与旅游建筑依据公开户数、业态、道路/坡地关系生成。

## 节点 Dossier 状态机

```text
Canvas / Node List / Story
           ↓
       selectNode(id)
           ↓
      selected state
       ↙    ↓    ↘
   Legend Inspector Camera
```

禁止子模块绕开 `selectNode()` 各自更新图例。

## 时间轴动态

```text
slider input
   ↓
Temporal Scene State
   ├─ infrastructure
   ├─ roads
   ├─ buildings
   ├─ flow
   └─ atmosphere
   ↓
Temporal Shock
   ├─ screen wave
   ├─ road spectral trail
   ├─ map light pulse
   └─ HUD progress
```

因此任何一次拖动都必须产生地图级视觉反馈。
