# Tasks

## 任务一：统一 CSS 设计系统（重构 style.css）
- [x] Task 1: 重构 `style.css` 为唯一样式源
  - [x] 确保 `:root` 变量完整覆盖所有页面所需
  - [x] 将 navbar 通用样式统一到 `style.css`
  - [x] 将 footer 通用样式统一到 `style.css`
  - [x] 将 `.animate-on-scroll` 统一到 `style.css`
  - [x] 将 `.container` 统一到 `style.css`
  - [x] 将 h1-h6 基础样式统一到 `style.css`

## 任务二：清理 index.html 内联样式
- [x] Task 2: 重构 `index.html` 内联 `<style>` 块
  - [x] 删除与 `style.css` 重复的 `:root` 变量定义
  - [x] 删除与 `style.css` 重复的 navbar/footer/基础组件/h1-h6 样式
  - [x] 仅保留 index.html 独有的页面样式
  - [x] 移除 Google Fonts 预连接标签

## 任务三：清理 video-collection.html 内联样式
- [x] Task 3: 重构 `video-collection.html` 内联 `<style>` 块
  - [x] 确保 `<link rel="stylesheet" href="style.css">` 已正确引用
  - [x] 删除所有重复的通用组件样式
  - [x] 仅保留页面独有样式（orb-canvas、floating shapes、timeline-dot 等）

## 任务四：清理 contact.html 内联样式
- [x] Task 4: 重构 `contact.html` 内联 `<style>` 块
  - [x] 确保 `<link rel="stylesheet" href="style.css">` 已正确引用
  - [x] 删除所有重复的通用组件样式
  - [x] 仅保留页面独有样式（表单、模态框等）

## 任务五：统一字体系统
- [x] Task 5: 统一所有页面的字体
  - [x] 移除未加载的 ZCOOL 字体引用
  - [x] 标题字体统一为 `var(--font-title)`（楷体）
  - [x] 正文字体统一为 `var(--font-body)`（系统字体栈）
  - [x] 移除 Google Fonts 外部依赖

## 任务六：修复视频加载
- [x] Task 6: 实现视频懒加载队列
  - [x] 在 `script.js` 中添加视频加载队列管理器
  - [x] 最多同时加载 2 个视频
  - [x] 使用 IntersectionObserver 逐个入队
  - [x] video-collection.html 移除重复的视频脚本

## 任务七：降低设计"AI味"
- [x] Task 7: 精简过度装饰
  - [x] 移除 `body::before` 点阵和 `body::after` 噪声纹理
  - [x] 减少卡片 glow 阴影强度
  - [x] 统一 hover transform 偏移 ≤ -3px
  - [x] 移除技能标签 hover scale 动效
  - [x] 简化 marquee-tag hover 效果

## 任务八：修复功能缺陷
- [x] Task 8: 修复联系表单
  - [x] 提供 mailto 降级方案
  - [x] 表单提交失败时给予用户清晰的替代方案

- [x] Task 9: 统一交互行为
  - [x] 统一 navbar 滚动行为（使用 `.scrolled` 类）
  - [x] 简化 magnetic 按钮效果
  - [x] 移除重复的 video error 事件处理

## 任务九：性能优化
- [x] Task 10: 性能微调
  - [x] 移除 Google Fonts 外部请求
  - [x] 保留 bilibili player 资源预连接
  - [x] `script.js` 使用 `defer` 加载

# Task Dependencies
- [Task 2]、[Task 3]、[Task 4] 依赖 [Task 1] - ✅
- [Task 5] 依赖 [Task 1] - ✅
- [Task 6] 可与 Task 1-5 并行执行 - ✅
- [Task 7] 依赖 [Task 1] - ✅
- [Task 8] 可独立执行 - ✅
- [Task 9] 依赖 [Task 1] - ✅
- [Task 10] 可独立执行 - ✅
