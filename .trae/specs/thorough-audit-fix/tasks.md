# Tasks

## 任务一：统一CSS到 style.css（手术级重构）🔴
- [ ] Task 1: 重构 `style.css` 为唯一设计系统源
  - [ ] 合并所有页面共用的 CSS 变量（消除4套 `:root` 冲突）
  - [ ] 统一 navbar 样式（当前存在3种实现：72px gradient-border / padding glass-border / padding-base）
  - [ ] 统一 footer 样式
  - [ ] 统一 `.animate-on-scroll` / `.container` / `.section-title` 基础组件
  - [ ] 统一 h1-h6 基础字体规则
  - [ ] 统一 `.video-card` / `.video-wrapper` / `.play-btn` / `.video-info` / `.video-description`
  - [ ] 统一 media queries

## 任务二：清理 index.html 内联样式 🔴
- [ ] Task 2: 手术式删减 `index.html` 内联 `<style>` 块
  - [ ] 删除 `:root` 变量定义（第19-47行）
  - [ ] 删除 navbar 完整样式（第147-260行）
  - [ ] 删除 footer 完整样式
  - [ ] 删除 `.container` / `.animate-on-scroll` / `::-webkit-scrollbar`
  - [ ] 删除 `.hero` / `.hero-badge` / `.hero-content` / `.scroll-indicator`（已由 style.css 覆盖）
  - [ ] 删除 `.bento-card` / `.bento-grid` / `.video-card` 等通用组件
  - [ ] 删除重复的 `@media (prefers-color-scheme: dark)` 块
  - [ ] **仅保留**：页面独有样式（`.hero-title .cursor`、`#orb-canvas`、`floating-shapes`、`timeline-dot`、`iframe-placeholder` 等）
  - [ ] 保留 `@media (max-width: 768px)` 中 `index.html` 独有的 bento-resume-grid 响应式

## 任务三：清理 video-collection.html 内联样式 🔴
- [ ] Task 3: 手术式删减 `video-collection.html` 内联 `<style>` 块
  - [ ] 确保 `<link rel="stylesheet" href="style.css">` 在第7行
  - [ ] 删除 `:root` 变量定义
  - [ ] 删除 navbar / footer / 基础组件样式
  - [ ] 删除重复的 video-card / video-wrapper / video-info 样式
  - [ ] 删除 `body::before` 等装饰
  - [ ] **仅保留**：页面独有（`#orb-canvas`、`floating-shapes`、`timeline-dot`、`loadingShimmer`、`video-card::after` hover径向辉光）

## 任务四：清理 contact.html 内联样式 🔴
- [ ] Task 4: 手术式删减 `contact.html` 内联 `<style>` 块
  - [ ] 确保 `<link rel="stylesheet" href="style.css">` 在第7行
  - [ ] 删除 `:root` 变量定义
  - [ ] 删除 navbar / mobile-menu / footer / 基础组件样式
  - [ ] **仅保留**：页面独有（contact-page-hero/contact-page-grid/contact-info-panel/contact-form/form-group/submit-btn/direct-contact/modal）

## 任务五：统一字体系统 🔴
- [ ] Task 5: 统一所有页面字体
  - [ ] 在 `style.css` 中定义：`--font-title: 'KaiTi', 'STKaiti', '楷体', 'PingFang SC', 'Microsoft YaHei', serif`
  - [ ] 在 `style.css` 中定义：`--font-body: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans SC', sans-serif`
  - [ ] 移除所有 Google Fonts `<link>` 标签（3个HTML文件）
  - [ ] 移除 `ZCOOL QingKe HuangYou` / `ZCOOL KuaiLe` 所有引用
  - [ ] 所有页面 body 使用 `var(--font-body)`
  - [ ] 所有页面标题使用 `var(--font-title)`

## 任务六：实现视频加载队列 🔴
- [ ] Task 6: 在 `script.js` 中实现完整的视频加载队列
  - [ ] 创建 `VideoLoadQueue` 对象（maxConcurrent: 2）
  - [ ] 使用 IntersectionObserver 触发入队（rootMargin: 200px）
  - [ ] 视频进入视口 → 绑定事件 → 入队加载
  - [ ] 加载完成后标记 `data-loaded="true"`
  - [ ] 添加视频加载进度指示
  - [ ] 删除 video-collection.html 中重复的视频hover/play脚本（~140行），复用 script.js

## 任务七：视频优化 🔴
- [ ] Task 7: 处理大文件视频
  - [ ] 标记需压缩的视频清单（>25MB的11个文件）
  - [ ] 为核心展示视频添加 poster 缩略图属性

## 任务八：降低设计AI味 🟡
- [ ] Task 8: 手术式精简过度装饰
  - [ ] 移除 `body::after` SVG噪声纹理
  - [ ] 精简 `body::before` 点阵：从15个→3个
  - [ ] 缩减 cta-primary 阴影强度（常态 0.35→0.2，hover 0.45→0.3）
  - [ ] 简化 marquee-tag hover 效果
  - [ ] 技能标签 hover 移除 scale 动效
  - [ ] 统一 hover transform 偏移 ≤ -3px

## 任务九：修复功能缺陷 🟡
- [ ] Task 9.1: 修复联系表单
  - [ ] 提供 mailto 降级方案
  - [ ] 表单提交失败时引导至邮件客户端

- [ ] Task 9.2: 统一交互
  - [ ] video-collection.html 复用 script.js 视频交互逻辑
  - [ ] contact.html 复用 script.js 滚动动画逻辑

## 任务十：性能清理 🟡
- [ ] Task 10: 消除性能浪费
  - [ ] 移除3个HTML中的 Google Fonts 外部请求
  - [ ] 移除 `will-change` 滥用（保留canvas相关）
  - [ ] 精简各HTML内联CSS到最小化

# Task Dependencies
- [Task 2]、[Task 3]、[Task 4] 依赖 [Task 1]（先重构style.css）
- [Task 5] 可并行于 Task 1
- [Task 6] 依赖 [Task 1]（统一video-card样式后实施队列）
- [Task 7] 可独立执行
- [Task 8] 依赖 [Task 1]
- [Task 9] 可独立执行
- [Task 10] 可独立执行
