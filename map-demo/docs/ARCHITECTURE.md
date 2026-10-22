# 架构

`index.html → CSS Design System → database.bundle.js → DB Adapter → State → Canvas 3D Engine → UI Controller → Story Director`

产品不依赖外部 API。SQLite 用于数据治理，浏览器读取其静态导出镜像。场景的详细几何在 MVP 阶段采用参数化/仿真坐标，以确保始终有可见、可交互的三维内容。
