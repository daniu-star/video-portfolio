# Tasks

- [x] Task 1: 移除 HTML 中的 .grid-featured 精选区域
  - [x] 从 index.html 中删除 #grid-featured 整个 div 及其子元素
  - [x] 保留 #grid-header 和 #grid-cards

- [x] Task 2: 重写 CSS 视频卡片样式为四层叠加结构
  - [x] 修改 .grid-cards 为2列布局（grid-template-columns: repeat(2, 1fr)）
  - [x] 重写 .grid-video-card 为四层叠加结构（poster → video → gradient → info）
  - [x] .grid-card-thumb 内添加 video 元素样式（默认 opacity:0，hover 时 opacity:0.6）
  - [x] 信息层（标题、标签、播放按钮）叠加在缩略图上方
  - [x] 移除 .grid-card-info 底部独立区域样式，改为绝对定位叠加
  - [x] 添加 .grid-card-featured-badge 精选徽章样式
  - [x] 添加 hover 时 video 淡入动画（transition: opacity 0.4s ease）
  - [x] 移动端响应式：1列布局

- [x] Task 3: 重写 JS populateGrid 函数
  - [x] 移除精选区域相关代码（featuredBg、featuredVideoEl、previewVideo 等）
  - [x] 每张卡片生成四层结构：poster img + video 元素 + 渐变遮罩 + 信息叠加层
  - [x] video 元素设置 preload="none"、muted、loop、playsInline
  - [x] 添加 mouseenter 事件：video 淡入并播放
  - [x] 添加 mouseleave 事件：video 暂停并淡出
  - [x] 第一个视频卡片添加"精选"徽章
  - [x] 移动端检测：touch设备不绑定hover播放逻辑

- [x] Task 4: 清理旧代码
  - [x] 移除 CSS 中 .grid-featured 相关样式
  - [x] 移除 JS 中 featuredVideoEl 变量和相关清理逻辑
  - [x] 移除 #grid-featured-play 和 #grid-featured 的 click 事件绑定

- [x] Task 5: 验证与部署
  - [x] 本地启动服务器验证页面效果
  - [x] 验证 Hub→Grid→Player 导航流程正常
  - [x] 验证 hover 视频预览播放/暂停正常
  - [x] 部署到 GitHub

# Task Dependencies
- Task 2 依赖 Task 1（HTML结构先改）
- Task 3 依赖 Task 1 和 Task 2（JS需要新的HTML结构和CSS类名）
- Task 4 依赖 Task 3（清理旧代码在新代码完成后）
- Task 5 依赖所有前置任务
